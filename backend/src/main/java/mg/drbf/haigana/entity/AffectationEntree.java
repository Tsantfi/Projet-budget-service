package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "affectation_entree")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffectationEntree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private String lieuAffectation;

    private LocalDate dateDepart;

    private LocalDate dateFin;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "entree_id",
        nullable = false,
        unique = true
    )
    @JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
    })
    private Entree entree;
}
