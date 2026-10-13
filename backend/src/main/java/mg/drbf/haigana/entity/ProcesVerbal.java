package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@Entity
@Table(name = "proces_verbal")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class ProcesVerbal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "constatation_id", nullable = false)
    // Empêche le plantage du convertisseur JSON (Jackson) avec le proxy Hibernate
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Constatation constatation;

    private String descriptionDegat;
    
    private LocalDate datePv;

    @Column(name = "piece_justificative_url")
    private String pieceJustificativeUrl;
}
