package mg.drbf.haigana.config;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.*;
import mg.drbf.haigana.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Cree les 3 comptes reglementaires (administrateur, modificateur, consultant)
 * ainsi que quelques listes de reference au premier demarrage.
 * IMPORTANT : changez ces mots de passe des la mise en production.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CompteRepository compteRepository;
    private final PasswordEncoder passwordEncoder;
    private final EtatRepository etatRepository;
    private final GenreRepository genreRepository;
    private final MarqueRepository marqueRepository;
    private final TypeVehiculeRepository typeVehiculeRepository;
    private final CarburantRepository carburantRepository;
    private final RegionRepository regionRepository;

    @Override
    public void run(String... args) {
        seedComptes();
        seedReferences();
    }

    private void seedComptes() {
        if (compteRepository.count() > 0) return;

        compteRepository.save(Compte.builder()
                .immatricule("ADM-001")
                .motPasse(passwordEncoder.encode("Haigana@Admin2026"))
                .nom("Administrateur")
                .prenom("Systeme")
                .role(Role.ADMINISTRATEUR)
                .actif(true)
                .build());

        compteRepository.save(Compte.builder()
                .immatricule("MOD-001")
                .motPasse(passwordEncoder.encode("Haigana@Mod2026"))
                .nom("Gestionnaire")
                .prenom("Boeny")
                .role(Role.MODIFICATEUR)
                .actif(true)
                .build());

        compteRepository.save(Compte.builder()
                .immatricule("CON-001")
                .motPasse(passwordEncoder.encode("Haigana@Con2026"))
                .nom("Consultant")
                .prenom("DRBF")
                .role(Role.CONSULTANT)
                .actif(true)
                .build());
    }

    private void seedReferences() {
        if (etatRepository.count() == 0) {
            etatRepository.save(Etat.builder().etatVehicule("Bon etat").build());
            etatRepository.save(Etat.builder().etatVehicule("Etat moyen").build());
            etatRepository.save(Etat.builder().etatVehicule("Hors service").build());
            etatRepository.save(Etat.builder().etatVehicule("En reparation").build());
        }

        if (genreRepository.count() == 0) {
            genreRepository.save(Genre.builder().genreVehicule("Berline").build());
            genreRepository.save(Genre.builder().genreVehicule("4x4").build());
            genreRepository.save(Genre.builder().genreVehicule("Camion").build());
            genreRepository.save(Genre.builder().genreVehicule("Moto").build());
        }

        if (marqueRepository.count() == 0) {
            marqueRepository.save(Marque.builder().marqueVehicule("Toyota").build());
            marqueRepository.save(Marque.builder().marqueVehicule("Nissan").build());
            marqueRepository.save(Marque.builder().marqueVehicule("Mitsubishi").build());
            marqueRepository.save(Marque.builder().marqueVehicule("Hyundai").build());
        }

        if (typeVehiculeRepository.count() == 0) {
            typeVehiculeRepository.save(TypeVehicule.builder().typeDuVehicule("Vehicule de service").build());
            typeVehiculeRepository.save(TypeVehicule.builder().typeDuVehicule("Vehicule de fonction").build());
        }

        if (carburantRepository.count() == 0) {
            carburantRepository.save(Carburant.builder().libelle("Essence").build());
            carburantRepository.save(Carburant.builder().libelle("Gasoil").build());
        }

        if (regionRepository.count() == 0) {
            regionRepository.save(Region.builder().nomRegion("Boeny").build());
        }
    }
}
