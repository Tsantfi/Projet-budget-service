package mg.drbf.haigana.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "detenteur")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Detenteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomDetenteur;

    private String prenomDetenteur;

    @Column(unique = true)
    private String immatriculeDetenteur;

    private String cinDetenteur;

    private String districtDetenteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private SoaCode service;
    
    @OneToMany(mappedBy = "detenteur", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler",
            "detenteur"
    })
    private List<Vehicule> vehicules;
}
