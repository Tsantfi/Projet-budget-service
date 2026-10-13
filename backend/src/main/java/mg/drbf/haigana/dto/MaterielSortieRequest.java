package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MaterielSortieRequest {

    private Long materielId;

    private Integer quantite;

    private LocalDate dateSortie;

    private Integer annee;

    private String observation;
}
