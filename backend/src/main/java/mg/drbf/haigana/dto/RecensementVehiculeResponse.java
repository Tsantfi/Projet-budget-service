package mg.drbf.haigana.dto;

import lombok.*;
import java.util.List;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecensementVehiculeResponse {

    private Long id;

    private Long vehiculeId;

    private String codeSoa;

    private String immatriculation;

    private String marque;

    private String type;

    private String genre;

    private String sourceEnergie;

    private String categorie;

    private Integer anneeMiseCirculation;

    private String etatGeneral;

    private Boolean carteGriseDisponible;

    private String detenteurEffectif;

    private Boolean actif;

    private String statut;
    
    private List<String> champsModifies;
}
