package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@Entity
@Table(name = "constatation")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Constatation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "controle_id", nullable = false)
    // Empêche Jackson de planter avec le proxy Hibernate lors de la sérialisation JSON
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Controle controle;

    private String descriptionConstat;
    private LocalDate dateConstat;
    private LocalDate dateDepart;
    private LocalDate dateArrivee;
    private String degat;
    private String raisonDeplacement;
}
