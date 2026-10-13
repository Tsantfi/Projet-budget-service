package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import mg.drbf.haigana.entity.StatusRecensementLogement;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecensementLogementResponse {

    private Long id;

    private Long soaId;

    private String codeSoa;

    private Integer annee;

    private String ministere;
    private String niveau;
    private String directionService;
    private String objet;

    private String nom;
    private String prenom;
    private String fonction;

    private String telephone;
    private String email;

    private LocalDate dateRecensement;

    private Boolean valide;
    private List<Ligne> logements;
    private String objetTitreFoncier;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Ligne {

        private Long id;
        private Long logementId;

        private Integer numero;
        private String nomBatiment;
        private String nature;
        private String entiteUtilisatrice;
        private String occupant;
        private String etatBatisse;
        private String localite;
        private String adressePointRepere;
        private String etatGeneral;
        
        private StatusRecensementLogement statut;
        private List<String> champsModifies;
    }
}
