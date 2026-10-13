package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ministere")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ministere {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomMinistere;

    private String districtMinistere;
}
