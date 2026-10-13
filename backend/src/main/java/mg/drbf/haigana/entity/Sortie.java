package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "sortie")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sortie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // INFORMATIONS DE LA SORTIE


    private String reference;

    private LocalDate dateSortie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeSortie type;


    // PERSONNE QUI FAIT L'ORDRE DE SORTIE
    // = PERSONNE / SERVICE QUI REÇOIT LE VEHICULE


    private String nomPersonneSortie;

    private String cinPersonneSortie;

    private String serviceSortie;


    // PERSONNE QUI FAIT L'ORDRE D'ENTREE
    // = PERSONNE / SERVICE QUI REMET LE VEHICULE


    private String nomPersonneEntree;

    private String cinPersonneEntree;

    private String serviceEntree;


    // INFORMATIONS COMPLEMENTAIRES


    private String description;

    private String lieu;

    // PIECE JUSTIFICATIVE

    @Column(name = "piece_justificative_url")
    private String pieceJustificativeUrl;

    // VEHICULE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "vehicule_id",
            nullable = true
    )
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    private Vehicule vehicule;
}