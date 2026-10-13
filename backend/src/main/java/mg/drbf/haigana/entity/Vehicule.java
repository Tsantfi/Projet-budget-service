package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "vehicule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String immatricule;

    private Double prixVehicule;
    private LocalDate dateCirculation;

    // LOCALITÉ
   

    private String localiteTexte;
    private Double localiteLatitude;
    private Double localiteLongitude;

    // TRAJET HABITUEL

    private String lieuParcoursDepart;
    private String lieuParcoursArrivee;

    // AFFECTATION ACTUELLE

    @Column(name = "lieu_affectation_actuel")
    private String lieuAffectationActuel;

    // RELATIONS

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etat_id")
    private Etat etat;

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id")
    private Genre genre;

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marque_id")
    private Marque marque;

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    private TypeVehicule type;

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carburant_id")
    private Carburant carburant;

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler",
            "vehicules"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detenteur_id")
    private Detenteur detenteur;

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chauffeur_id")
    private Chauffeur chauffeur;

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soa_id", nullable = false)
    private SoaCode codeSoa;

    // VALIDATION

    @Builder.Default
    private boolean valide = false;

    @Column(name = "piece_justificative_url")
    private String pieceJustificativeUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ministere_id")
    private Ministere ministere;

    // CATÉGORIE
    @Column(name = "categorie")
    private String categorie;

    // CARTE GRISE
    @Column(name = "carte_grise_disponible")
    private Boolean carteGriseDisponible;

    // NORMALISATION IMMATRICULATION

    @PrePersist
    @PreUpdate
    private void normaliserImmatriculation() {

        if (immatricule != null) {

            immatricule = immatricule
                    .trim()
                    .replaceAll("\\s+", "")
                    .toUpperCase();
        }
    }
}

