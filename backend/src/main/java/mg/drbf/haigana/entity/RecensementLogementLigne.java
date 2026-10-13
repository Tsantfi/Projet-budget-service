package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "recensement_logement_ligne")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecensementLogementLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recensement_id", nullable = false)
    private RecensementLogement recensement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logement_id")
    private Logement logement;

    // SNAPSHOT BATIMENT

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
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatusRecensementLogement statut;

    @Builder.Default
    @ElementCollection
    @CollectionTable(
            name = "recensement_logement_champs_modifies",
            joinColumns = @JoinColumn(name = "ligne_id")
    )
    @Column(name = "champ")
    private List<String> champsModifies = new ArrayList<>();
    
    @Column(name = "logement_id_origine")
    private Long logementIdOrigine;
}

