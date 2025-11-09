# ───────────────────────────────────────────────────────────────────────────────
#  Etapa 1: Base Python e instalação de dependências
# ───────────────────────────────────────────────────────────────────────────────
FROM python:3.10-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia somente o requirements.txt e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ───────────────────────────────────────────────────────────────────────────────
#  Etapa 2: Copia o código-fonte do backend
# ───────────────────────────────────────────────────────────────────────────────
# Copia tudo da pasta backend/ (exceto o que estiver em .dockerignore)
COPY . .

# Expõe a porta que o Uvicorn usará para atender as requisições
EXPOSE 8000

# Comando padrão para iniciar o FastAPI no container
CMD ["uvicorn", "main:api", "--host", "0.0.0.0", "--port", "8000"]
