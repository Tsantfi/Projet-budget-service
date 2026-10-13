package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.QuitusRequest;
import mg.drbf.haigana.dto.QuitusResponse;
import mg.drbf.haigana.service.QuitusService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quitus")
@RequiredArgsConstructor
public class QuitusController {

    private final QuitusService quitusService;

    @PostMapping("/generer")
    public QuitusResponse generer(
            @RequestBody QuitusRequest request
    ) {
        return quitusService.generer(request);
    }
}