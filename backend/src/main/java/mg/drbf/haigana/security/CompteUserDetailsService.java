package mg.drbf.haigana.security;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.repository.CompteRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompteUserDetailsService implements UserDetailsService {

    private final CompteRepository compteRepository;

    @Override
    public UserDetails loadUserByUsername(String immatricule) throws UsernameNotFoundException {
        return compteRepository.findByImmatricule(immatricule)
                .map(CompteUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("Compte introuvable pour l'immatricule : " + immatricule));
    }
}
