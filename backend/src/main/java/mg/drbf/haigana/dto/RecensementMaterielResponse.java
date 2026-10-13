package mg.drbf.haigana.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecensementMaterielResponse {

    private Long id;

    private Long soaId;

    private String codeSoa;

    private Integer annee;

    private String fonctionnaireRecenseurNom;

    private String fonctionnaireRecenseurQualite;

    private String comptableNom;

    private String comptableQualite;

    private LocalDate dateRecensement;

    private List<Ligne> lignes;

    /*
     * Totaux généraux du procès-verbal
     */
    private Integer nombreArticles;

    private Integer nombreArticlesExcedent;

    private Integer nombreArticlesDeficit;

    private BigDecimal totalValeurExistante;

    private BigDecimal totalValeurExcedent;

    private BigDecimal totalValeurDeficit;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Ligne {

        private Long id;

        private Long materielId;

        private Integer nomenclatureNumero;

        private String nomenclatureDesignation;

        private String especeUnite;

        private BigDecimal prixUnitaire;

        private Integer existantEcriture;

        private Integer constateRecensement;

        private Integer excedent;

        private Integer deficit;

        private BigDecimal valeurExcedentArticle;

        private BigDecimal valeurDeficitArticle;

        private BigDecimal valeurArticle;

        private String observation;
    }
}
