package com.example.blouse.config;

import com.example.blouse.entity.Category;
import com.example.blouse.entity.Design;
import com.example.blouse.entity.Role;
import com.example.blouse.entity.User;
import com.example.blouse.repository.CategoryRepository;
import com.example.blouse.repository.DesignRepository;
import com.example.blouse.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final DesignRepository designRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(CategoryRepository categoryRepository, DesignRepository designRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.designRepository = designRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure Admin exists on startup
        if (!userRepository.existsByEmail("admin@blouse.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@blouse.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Default Admin account seeded: admin@blouse.com / admin123");
        }

        if (categoryRepository.count() == 0) {
            Category bridal = new Category();
            bridal.setName("Bridal");
            bridal = categoryRepository.save(bridal);

            Category traditional = new Category();
            traditional.setName("Traditional");
            traditional = categoryRepository.save(traditional);

            Category designer = new Category();
            designer.setName("Designer");
            designer = categoryRepository.save(designer);

            Design d1 = new Design();
            d1.setName("Bridal Heavy Maggam Work");
            d1.setPrice(new BigDecimal("3500"));
            d1.setCategory(bridal);
            d1.setImageUrl("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800");
            d1.setDescription("Exquisite heavy maggam work blouse with intricate gold zardosi embroidery and bridal stone detailing.");
            designRepository.save(d1);

            Design d2 = new Design();
            d2.setName("Temple Silk Embroidery");
            d2.setPrice(new BigDecimal("1800"));
            d2.setCategory(traditional);
            d2.setImageUrl("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800");
            d2.setDescription("Classic temple jewelry inspired silk blouse with pure gold zari piping and elbow sleeves.");
            designRepository.save(d2);

            Design d3 = new Design();
            d3.setName("Contemporary Minimalist");
            d3.setPrice(new BigDecimal("1200"));
            d3.setCategory(designer);
            d3.setImageUrl("https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800");
            d3.setDescription("Modern sweetheart backless blouse with contrast handcrafted latkans and lightweight silk lining.");
            designRepository.save(d3);
            
            System.out.println("Default designs seeded successfully!");
        } else {
            // Update any existing picsum urls to authentic blouse images
            List<Design> allDesigns = designRepository.findAll();
            for (Design d : allDesigns) {
                if (d.getImageUrl() != null && d.getImageUrl().contains("picsum.photos")) {
                    if (d.getName() != null && d.getName().toLowerCase().contains("bridal")) {
                        d.setImageUrl("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800");
                    } else if (d.getName() != null && d.getName().toLowerCase().contains("temple")) {
                        d.setImageUrl("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800");
                    } else {
                        d.setImageUrl("https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800");
                    }
                    designRepository.save(d);
                }
            }
        }
    }
}
