package com.mackenzie.eleicao;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Testes simples com assertEquals, cobrindo cenários básicos e de fronteira.
 */
class CandidaturaTest {

    @Test
    void deveAprovar_quandoGostaDeAnimais_eMaiorQue18() {
        boolean resultado = Candidatura.aprovada(true, 19);
        assertEquals(true, resultado, "Esperava aprovação para idade > 18 e gosta de animais.");
    }

    @Test
    void naoDeveAprovar_quandoNaoGostaDeAnimais_mesmoSendoMaiorQue18() {
        boolean resultado = Candidatura.aprovada(false, 25);
        assertEquals(false, resultado, "Não deve aprovar se não gosta de animais.");
    }

    @Test
    void naoDeveAprovar_quandoGostaDeAnimais_masTem18() {
        boolean resultado = Candidatura.aprovada(true, 18);
        assertEquals(false, resultado, "Idade precisa ser estritamente maior que 18.");
    }

    @Test
    void naoDeveAprovar_quandoGostaDeAnimais_masMenorDeIdade() {
        boolean resultado = Candidatura.aprovada(true, 17);
        assertEquals(false, resultado, "Menor de idade não deve ser aprovado.");
    }
}
