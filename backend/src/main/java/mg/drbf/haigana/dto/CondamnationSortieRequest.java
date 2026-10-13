package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CondamnationSortieRequest {

    private String motif;

    private String piece;

    private LocalDate date;
    
    private String lieuCondamnation;
}
