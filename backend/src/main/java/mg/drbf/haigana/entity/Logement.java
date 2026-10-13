package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "logement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Logement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CODE SOA

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "code_soa_id", nullable = false)
    private SoaCode codeSoa;

    // DONNEES BATIMENT

    @Column(name = "numero")
    private Integer numero;

    @Column(name = "nom_batiment", length = 255)
    private String nomBatiment;

    @Column(name = "nature", length = 100)
    private String nature;

    @Column(name = "entite_utilisatrice", length = 255)
    private String entiteUtilisatrice;

    @Column(name = "occupant", length = 255)
    private String occupant;

    @Column(name = "etat_batisse", length = 100)
    private String etatBatisse;

    @Column(name = "localite", length = 255)
    private String localite;

    @Column(name = "adresse_point_repere", length = 500)
    private String adressePointRepere;

    @Column(name = "etat_general", length = 255)
    private String etatGeneral;

    // HISTORIQUE

    @Column(name = "annee_initiale")
    private Integer anneeInitiale;

    @Column(name = "date_avant_condamnation")
    private LocalDate dateAvantCondamnation;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = true;
}