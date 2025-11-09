import os
from fastapi import FastAPI, HTTPException, Depends  # <-- Added Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.hash import pbkdf2_sha256
from datetime import datetime, timedelta
from typing import Optional

# =========================================================
# Configuração inicial
# =========================================================

load_dotenv()  # Carrega variáveis do arquivo .env (se existir)

api = FastAPI()

# ======= CONFIG JWT =======
JWT_SECRET = os.getenv("JWT_SECRET", "troque_este_segredo_em_producao")
JWT_ALG = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 6

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ======= CORS =======
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Funções auxiliares
# =========================================================

def validar_variaveis_ambiente():
    required_vars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"]
    for var in required_vars:
        if not os.getenv(var):
            raise Exception(f"Variável de ambiente {var} não definida")


def get_connection():
    """Retorna uma conexão pymysql usando DictCursor."""
    validar_variaveis_ambiente()
    conn = pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor
    )
    return conn


# ======= AUTH – utils =======
def criar_token(sub_id: int, role: str):
    payload = {
        "sub": str(sub_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        data = decode_token(token)
        user_id = int(data.get("sub"))
        role = data.get("role")
        conn = get_connection()
        with conn.cursor() as c:
            c.execute("SELECT id, nome, email, role FROM usuarios WHERE id=%s", (user_id,))
            u = c.fetchone()
        conn.close()
        if not u:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        u["role"] = role  # do token
        return u
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido/expirado")

def require_role(required: str):
    def dep(u = Depends(get_current_user)):
        if u["role"] != required:
            raise HTTPException(status_code=403, detail="Permissão negada")
        return u
    return dep


# =========================================================
# Models Pydantic
# =========================================================

class DadosInscricao(BaseModel):
    nome: str
    nascimento: str
    cpf: str
    mensagem: str
    oportunidade_id: int


class OportunidadeONG(BaseModel):
    titulo: str
    descricao: str
    ong_nome: str
    endereco: str


class SignupBody(BaseModel):
    nome: str
    email: str
    senha: str
    role: str
    cnpj: Optional[str] = None


class LoginBody(BaseModel):
    email: str
    senha: str


# =========================================================
# Endpoints do FastAPI (Backend)
# =========================================================

@api.post("/auth/signup")
async def signup(dados: SignupBody):
    if dados.role not in ("volunteer", "ngo"):
        raise HTTPException(status_code=400, detail="role inválida")
    try:
        conn = get_connection()
        with conn.cursor() as c:
            senha_hash = pbkdf2_sha256.hash(dados.senha)
            c.execute(
                "INSERT INTO usuarios (nome, email, senha_hash, role, cnpj) VALUES (%s, %s, %s, %s, %s)",
                (dados.nome, dados.email, senha_hash, dados.role, dados.cnpj)
            )
            conn.commit()
            user_id = c.lastrowid
        conn.close()
        token = criar_token(user_id, dados.role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user_id, "nome": dados.nome, "email": dados.email, "role": dados.role}
        }
    except Exception as e:
        if "Duplicate entry" in str(e) and "email" in str(e):
            raise HTTPException(status_code=409, detail="Email já cadastrado")
        raise HTTPException(status_code=500, detail=str(e))


@api.post("/auth/login")
async def login(dados: LoginBody):
    try:
        conn = get_connection()
        with conn.cursor() as c:
            c.execute("SELECT id, nome, email, senha_hash, role FROM usuarios WHERE email=%s", (dados.email,))
            u = c.fetchone()
        conn.close()

        if not u or not pbkdf2_sha256.verify(dados.senha, u["senha_hash"]):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

        token = criar_token(u["id"], u["role"])

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": u["id"],
                "nome": u["nome"],
                "email": u["email"],
                "role": u["role"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# Oportunidades
# =========================================================

@api.get("/oportunidades")
async def consultar_oportunidades():
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM oportunidades")
            return cursor.fetchall()
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


@api.get("/oportunidades/{oportunidade_id}")
async def consultar_oportunidade(oportunidade_id: int):
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM oportunidades WHERE id = %s", (oportunidade_id,))
            resultado = cursor.fetchone()
            if not resultado:
                raise HTTPException(status_code=404, detail="Oportunidade não encontrada")
            return resultado
    except HTTPException as he:
        raise he
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


@api.post("/ongs/oportunidades")
async def criar_oportunidade(dados: OportunidadeONG, user=Depends(require_role("ngo"))):
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ongs (nome, endereco)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
                """,
                (dados.ong_nome, dados.endereco)
            )
            cursor.execute(
                """
                INSERT INTO oportunidades (titulo, descricao, ong_id, ong_nome)
                VALUES (%s, %s, LAST_INSERT_ID(), %s)
                """,
                (dados.titulo, dados.descricao, dados.ong_nome)
            )
            conn.commit()
        return {"success": True}
    except Exception as e:
        if conn:
            conn.rollback()
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()

# =========================================================
# Inscrições
# =========================================================

@api.get("/inscricoes")
async def consultar_inscricoes():
    """Lista todas as inscrições de todos os voluntários em todas as oportunidades."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    i.id AS inscricao_id,
                    i.voluntario_id,
                    v.nome AS voluntario_nome,
                    i.oportunidade_id,
                    i.data_inscricao,
                    i.status
                FROM inscricoes i
                JOIN voluntarios v ON i.voluntario_id = v.id
                ORDER BY i.data_inscricao DESC
            """)
            return cursor.fetchall()
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


@api.get("/ongs/{ong_id}/inscricoes")
async def consultar_inscricoes_por_ong(ong_id: int):
    """
    Retorna todas as inscrições (candidatos) para as oportunidades dessa ONG.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    i.id AS inscricao_id,
                    i.voluntario_id,
                    v.nome AS voluntario_nome,
                    i.oportunidade_id,
                    o.titulo AS oportunidade_titulo,
                    i.data_inscricao,
                    i.status
                FROM inscricoes i
                JOIN oportunidades o ON i.oportunidade_id = o.id
                JOIN voluntarios v ON i.voluntario_id = v.id
                WHERE o.ong_id = %s
                ORDER BY i.data_inscricao DESC
            """, (ong_id,))
            return cursor.fetchall()
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


@api.post("/inscricoes")
async def salvar_inscricao(dados: DadosInscricao):
    """Cria uma inscrição de um voluntário em uma oportunidade."""
    conn = None
    try:
        cpf = dados.cpf.strip().replace(".", "").replace("-", "")
        if len(cpf) > 11:
            cpf = "00000000000"

        conn = get_connection()
        with conn.cursor() as cursor:
            # Verifica se voluntário já existe
            cursor.execute("SELECT id FROM voluntarios WHERE cpf = %s", (cpf,))
            result = cursor.fetchone()

            if result:
                voluntario_id = result["id"]
            else:
                cursor.execute("""
                    INSERT INTO voluntarios (nome, nascimento, cpf, mensagem)
                    VALUES (%s, %s, %s, %s)
                """, (dados.nome, dados.nascimento, cpf, dados.mensagem))
                voluntario_id = cursor.lastrowid

            # Cria a inscrição
            cursor.execute("""
                INSERT INTO inscricoes (voluntario_id, oportunidade_id, status)
                VALUES (%s, %s, %s)
            """, (voluntario_id, dados.oportunidade_id, "pendente"))

            conn.commit()
        return {"success": True}

    except Exception as e:
        if conn:
            conn.rollback()
        # Caso CPF duplicado
        if "Duplicate entry" in str(e) and "for key 'cpf'" in str(e):
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM voluntarios WHERE cpf = %s", (cpf,))
                result = cursor.fetchone()
                if result:
                    voluntario_id = result["id"]
                    cursor.execute("""
                        INSERT INTO inscricoes (voluntario_id, oportunidade_id, status)
                        VALUES (%s, %s, %s)
                    """, (voluntario_id, dados.oportunidade_id, "pendente"))
                    conn.commit()
                    return {"success": True}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()


@api.patch("/inscricoes/{inscricao_id}")
async def atualizar_status(inscricao_id: int, status: str):
    """
    Atualiza o campo 'status' de uma inscrição específica.
    Espera ?status=pendente|aprovado|rejeitado na query string.
    """
    if status not in ("pendente", "aprovado", "rejeitado"):
        raise HTTPException(status_code=400, detail="Status inválido")

    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE inscricoes SET status = %s WHERE id = %s",
                (status, inscricao_id)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Inscrição não encontrada")

            conn.commit()
        return {"success": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        if conn:
            conn.rollback()
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


@api.get("/voluntarios/{voluntario_id}/inscricoes")
async def consultar_inscricoes_por_voluntario(voluntario_id: int):
    """
    Retorna todas as inscrições de um voluntário específico.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    i.id AS inscricao_id,
                    i.oportunidade_id,
                    o.titulo AS oportunidade_titulo,
                    i.data_inscricao,
                    i.status
                FROM inscricoes i
                JOIN oportunidades o ON i.oportunidade_id = o.id
                WHERE i.voluntario_id = %s
                ORDER BY i.data_inscricao DESC
            """, (voluntario_id,))
            return cursor.fetchall()
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


# =========================================================
# Voluntários
# =========================================================

@api.get("/voluntarios")
async def consultar_voluntarios():
    """Lista todos os voluntários cadastrados."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM voluntarios")
            return cursor.fetchall()
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


@api.get("/voluntarios/{voluntario_id}")
async def consultar_voluntario(voluntario_id: int):
    """Retorna um único voluntário pelo ID."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM voluntarios WHERE id = %s", (voluntario_id,))
            resultado = cursor.fetchone()
            if not resultado:
                raise HTTPException(status_code=404, detail="Voluntário não encontrado")
            return resultado
    except HTTPException as he:
        raise he
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        if conn:
            conn.close()


@api.get("/_debug/db")
def debug_db():
    try:
        conn = get_connection()
        with conn.cursor() as c:
            c.execute("SELECT @@hostname AS host, @@port AS port, DATABASE() AS db, USER() AS user")
            info = c.fetchone()
            c.execute("SHOW DATABASES LIKE %s", (os.getenv("DB_NAME"),))
            has_db = c.fetchone()
            c.execute(f"SHOW FULL TABLES FROM `{os.getenv('DB_NAME')}` LIKE 'usuarios'")
            has_tbl = c.fetchone()
        conn.close()
        return {
            "env": {
                "DB_HOST": os.getenv("DB_HOST"),
                "DB_PORT": os.getenv("DB_PORT"),
                "DB_USER": os.getenv("DB_USER"),
                "DB_NAME": os.getenv("DB_NAME"),
            },
            "server_info": info,        # onde realmente conectou
            "db_exists": bool(has_db),  # se o schema existe nessa instância
            "usuarios_exists": bool(has_tbl),  # se a tabela existe nesse schema
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

