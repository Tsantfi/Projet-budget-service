package mg.drbf.haigana.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecensementMaterielComparaisonResponse {

    private Long recensementId;
    private Integer annee;

    private List<NouveauMateriel> nouveaux;
    private List<ModificationMateriel> modifies;
    private List<AbsentMateriel> absents;

    // NOUVEAU MATERIEL

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NouveauMateriel {

        private Long materielId;

        private Integer nomenclatureNumero;
        private String nomenclatureDesignation;

        private String designation;
        private String especeUnite;

        private BigDecimal prixUnitaire;

        private Integer existantEcriture;
        private String observation;
    }

    // MODIFICATION

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModificationMateriel {

        private Long ligneId;
        private Long materielId;

        private AncienValeur ancien;
        private NouveauValeur nouveau;
    }

    // ANCIEN

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AncienValeur {

        private Integer nomenclatureNumero;
        private String nomenclatureDesignation;

        private String especeUnite;

        private BigDecimal prixUnitaire;

        private Integer existantEcriture;
    }

    // NOUVEAU

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NouveauValeur {

        private Integer nomenclatureNumero;
        private String nomenclatureDesignation;

        private String designation;
        private String especeUnite;

        private BigDecimal prixUnitaire;

        private Integer existantEcriture;
    }

    // ABSENT

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AbsentMateriel {

        private Long ligneId;
        private Long materielId;

        private Integer nomenclatureNumero;
        private String nomenclatureDesignation;

        private String especeUnite;

        private BigDecimal prixUnitaire;

        private Integer existantEcriture;
    }
}