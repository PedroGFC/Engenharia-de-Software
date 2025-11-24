package com.mackenzie.eleicao;

/**
 * Regra de negócio simples para aprovação de candidaturas: testelll
 * - Deve gostar de animais (gostaAnimais == true)
 * - Deve ter idade estritamente maior que 18 anos (idade > 18)
 *
 * Classe projetada para ser estável e testável, evitando duplicação (DRY).
 */
public final class Candidatura {

    private Candidatura() {
        // Construtor privado para impedir instanciação acidental; classe utilitária.
    }

    /**
     * Decide se a candidatura é aprovada com base nas regras.
     *
     * @param gostaAnimais indica se a pessoa gosta de animais
     * @param idade idade da pessoa em anos completos
     * @return true se aprovada; false caso contrário
     */
    public static boolean aprovada(final boolean gostaAnimais, final int idade) {
        return gostaAnimais && idade > 18;
    }
}
