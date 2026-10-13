package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;

@Entity
@Table(name = "deplacement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deplacement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // VEHICULE

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "vehicule_id",
        nullable = false
    )
    @JsonIgnore
    private Vehicule vehicule;

    // DATE

    private LocalDate dateDeplacement;

    // PARCOURS

    private String lieuDepart;
    private String lieuArrivee;
    private LocalDate dateFinParcours;

    // KILOMETRAGE

    private Double tableKilometrique;

    // ORDRE DE SORTIE

    @Enumerated(EnumType.STRING)
    private TypeSortie ordreSortie;
}