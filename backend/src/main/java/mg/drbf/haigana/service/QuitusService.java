package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.QuitusRequest;
import mg.drbf.haigana.dto.QuitusResponse;
import mg.drbf.haigana.entity.Quitus;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.repository.QuitusRepository;
import mg.drbf.haigana.repository.VehiculeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuitusService {

    private final VehiculeRepository vehiculeRepository;

    private final QuitusRepository quitusRepository;

    // GÉNÉRER LE QUITUS

    @Transactional
    public QuitusResponse generer(QuitusRequest request) {

        // VALIDATION

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données du quitus sont obligatoires."
            );
        }

        if (request.getAnnee() == null) {
            throw new IllegalArgumentException(
                    "L'année est obligatoire."
            );
        }

        if (request.getMinistere() == null ||
                request.getMinistere().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Le ministère est obligatoire."
            );
        }

        if (request.getDirectionService() == null ||
                request.getDirectionService().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "La direction ou le service est obligatoire."
            );
        }

        if (request.getSoaId() == null) {
            throw new IllegalArgumentException(
                    "Le Code SOA est obligatoire."
            );
        }

        // NETTOYAGE DES DONNÉES

        String ministere =
                request.getMinistere().trim();

        String directionService =
                request.getDirectionService().trim();

        // RECHERCHE DES VÉHICULES DU SOA

        List<Vehicule> vehicules =
                vehiculeRepository.findByCodeSoa_Id(
                        request.getSoaId()
                );

        int nombreVehicules =
                vehicules.size();

        String nombreVehiculesTexte =
                convertirNombreVehicules(
                        nombreVehicules
                );

        LocalDate dateCreation =
                LocalDate.now();

        // DIRECTION RÉGIONALE

        String directionRegionale =
                "Direction Régionale de l'Énergie et des Hydrocarbures de Mahajanga";

        // CRÉATION DU QUITUS

        Quitus quitus =
                Quitus.builder()

                        .anneeRecensement(
                                request.getAnnee()
                        )

                        .ministere(
                                ministere
                        )

                        .directionService(
                                directionService
                        )

                        .nombreVehicules(
                                nombreVehicules
                        )

                        .dateCreation(
                                dateCreation
                        )

                        .directionRegionale(
                                directionRegionale
                        )

                        .build();

        // SAUVEGARDE

        quitusRepository.save(quitus);

        // RÉPONSE AU FRONTEND

        return QuitusResponse.builder()

                .anneeRecensement(
                        String.valueOf(
                                request.getAnnee()
                        )
                )

                .ministere(
                        ministere
                )

                .directionService(
                        directionService
                )

                .nombreVehicules(
                    nombreVehicules
                )

                .nombreVehiculesTexte(
                        nombreVehiculesTexte
                )

                .build();
    }

    // CONVERSION DU NOMBRE DE VÉHICULES

    private String convertirNombreVehicules(
            int nombre
    ) {

        switch (nombre) {

            case 0:
                return "zéro (00)";

            case 1:
                return "un (01)";

            case 2:
                return "deux (02)";

            case 3:
                return "trois (03)";

            case 4:
                return "quatre (04)";

            case 5:
                return "cinq (05)";

            case 6:
                return "six (06)";

            case 7:
                return "sept (07)";

            case 8:
                return "huit (08)";

            case 9:
                return "neuf (09)";

            case 10:
                return "dix (10)";

            case 11:
                return "onze (11)";

            case 12:
                return "douze (12)";

            case 13:
                return "treize (13)";

            case 14:
                return "quatorze (14)";

            case 15:
                return "quinze (15)";

            case 16:
                return "seize (16)";

            case 17:
                return "dix-sept (17)";

            case 18:
                return "dix-huit (18)";

            case 19:
                return "dix-neuf (19)";

            case 20:
                return "vingt (20)";

            default:
                return nombre
                        + " ("
                        + String.format(
                                "%02d",
                                nombre
                        )
                        + ")";
        }
    }
}