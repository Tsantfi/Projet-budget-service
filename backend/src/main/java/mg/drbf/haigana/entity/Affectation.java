package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

// Affectation en tant que SORTIE du vehicule (a distinguer de AffectationEntree)
@Entity
@Table(name = "affectation")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Affectation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private LocalDate dateAffectation;
    private String lieuAffectation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sortie_id", nullable = false, unique = true)
    // Empêche le plantage de Jackson lors de la sérialisation de la relation
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Sortie sortie;
}
