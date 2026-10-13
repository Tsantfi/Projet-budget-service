package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SortieUpdateRequest {
    private String reference;
    private LocalDate dateSortie;
    private String type;
    private String lieu;
    private String description;
    private String pieceJustificativeUrl;
}
