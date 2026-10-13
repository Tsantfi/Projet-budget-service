package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mecanicien")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mecanicien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomMecanicien;
    private String districtMecanicien;
}
