package mg.drbf.haigana.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtatAppreciatifMaterielResponse {

    private Long soaId;
    private String codeSoa;
    private Integer annee;

    private List<Integer> nomenclatures;

    private List<Operation> operations;

    private List<Recapitulation> recapitulatif;

    private BigDecimal sommeEntrees;
    private BigDecimal sommeSorties;
    private BigDecimal sommeResteGenerale;

    // OPERATION

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Operation {

        private LocalDate date;

        private String designationOperation;

        /*
         * Exemple :
         *
         * 3 -> charge 500000 / decharge 0
         * 5 -> charge 0 / decharge 250000
         */
        private List<MouvementNomenclature> mouvements;
    }

    // MOUVEMENT PAR NOMENCLATURE

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MouvementNomenclature {

        private Integer numeroNomenclature;

        private BigDecimal charge;

        private BigDecimal decharge;
    }

    // RECAPITULATION

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recapitulation {

        private Integer numeroNomenclature;

        private BigDecimal existantDebutAnnee;

        private BigDecimal entreesAnnee;

        private BigDecimal totalExistantEntrees;

        private BigDecimal sortiesAnnee;

        private BigDecimal resteFinAnnee;
    }
}