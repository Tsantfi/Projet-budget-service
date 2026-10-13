package mg.drbf.haigana.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterielInventaireResponse {

    private Long id;

    private Long materielId;

    private Long soaId;

    private String codeSoa;

    private Long nomenclatureId;

    private Integer nomenclatureNumero;

    private String nomenclatureDesignation;

    private String designation;

    private String especeUnite;

    private BigDecimal prixUnitaire;

    private Integer annee;

    private Integer existantDebutAnnee;

    private Integer entreesAnnee;

    private Integer sortiesAnnee;

    private Integer resteFinAnnee;

    private BigDecimal decompte;

    private String observation;
}
