package mg.drbf.haigana.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterielResponse {

    private Long id;

    private CodeSoaResponse codeSoa;

    private NomenclatureResponse nomenclature;

    private String designation;

    private String especeUnite;

    private BigDecimal prixUnitaire;

    private Integer quantiteInitiale;

    private Integer anneeInitiale;

    private Boolean actif;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CodeSoaResponse {

        private Long id;

        private String codeSoa;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NomenclatureResponse {

        private Long id;

        private Integer numero;

        private String designation;

        private Boolean actif;
    }
}
