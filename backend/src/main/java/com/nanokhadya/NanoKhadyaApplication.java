package com.nanokhadya;

import com.nanokhadya.model.*;
import com.nanokhadya.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class NanoKhadyaApplication {

    public static void main(String[] args) {
        SpringApplication.run(NanoKhadyaApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            AnalyteRepository analyteRepository,
            UserRepository userRepository,
            DeviceRepository deviceRepository,
            CartridgeRepository cartridgeRepository,
            FoodSampleRepository foodSampleRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Seed Analytes if empty
            if (analyteRepository.count() == 0) {
                // DAIRY (Milk, Paneer, Dahi)
                analyteRepository.save(new Analyte(
                        "Melamine", "MELAMINE", 1, 2.5, "ppm", false,
                        "Citrate-stabilized Gold Nanoparticles (13nm AuNPs)",
                        "LSPR plasmonic aggregation shifting wine-red (520nm) to purple/blue (650nm)",
                        "DAIRY"
                ));
                analyteRepository.save(new Analyte(
                        "Hydrogen Peroxide", "H2O2", 2, 0.0, "ppm", true,
                        "Fe3O4 / Prussian Blue Peroxidase Nanozyme + TMB",
                        "Catalytic oxidation of colorless TMB to sky-blue oxTMB (652nm)",
                        "DAIRY"
                ));
                analyteRepository.save(new Analyte(
                        "Synthetic Urea", "UREA", 3, 700.0, "mg/L", false,
                        "Urease + Phenol Red / BTB Chromogenic Matrix",
                        "Enzymatic hydrolysis generates ammonium ions, shifting pH from 6.4 to >8.0 (yellow to magenta)",
                        "DAIRY"
                ));
                analyteRepository.save(new Analyte(
                        "Starch & Dextrin", "STARCH", 4, 0.0, "% w/v", true,
                        "Lugol Polyiodide-PVP Nanocomposite",
                        "Intercalation of triiodide into amylose helical coils creating deep blue-black inclusion complex",
                        "DAIRY"
                ));
                analyteRepository.save(new Analyte(
                        "Neutralizer & Detergent", "NEUTRALIZER", 5, 0.0, "pH / %", true,
                        "Bromocresol Purple & Surfactant Indicator",
                        "Alkaline neutralization shifts pH > 6.8 (yellow-green to violet-purple); detergent induces dye migration",
                        "DAIRY"
                ));

                // SPICES (Turmeric Powder, Red Chilli Powder)
                analyteRepository.save(new Analyte(
                        "Metanil Yellow Dye", "METANIL_YELLOW", 1, 0.0, "% w/w", true,
                        "Acidified Curcuminoid Partition Strips",
                        "Protonation of azo dye turns distinct violet/magenta under concentrated acid while natural curcumin remains unchanged",
                        "SPICES"
                ));
                analyteRepository.save(new Analyte(
                        "Sudan Dyes I-IV", "SUDAN_DYE", 2, 0.0, "ppm", true,
                        "Lipophilic AuNP Partition Sensor",
                        "Industrial carcinogenic Sudan dyes trigger hydrophobic AuNP plasmonic aggregation shift",
                        "SPICES"
                ));

                // EDIBLE OILS & GHEE (Mustard Oil, Sunflower Oil, Desi Ghee)
                analyteRepository.save(new Analyte(
                        "Toxic Argemone Oil", "ARGEMONE_OIL", 1, 0.0, "%", true,
                        "Sanguinarine Ferric Charge-Transfer Matrix",
                        "Nitric acid and ferric reagent reacts with sanguinarine alkaloid yielding orange-red precipitate",
                        "EDIBLE_OILS"
                ));
                analyteRepository.save(new Analyte(
                        "Vanaspati in Desi Ghee", "VANASPATI_GHEE", 2, 0.0, "%", true,
                        "Baudouin Chromogenic Reagent (Furfural-HCl)",
                        "Reaction with sesamolin in hydrogenated vegetable oil produces characteristic rose-crimson chromogen",
                        "EDIBLE_OILS"
                ));

                // HONEY
                analyteRepository.save(new Analyte(
                        "Invert Sugar & HFCS", "INVERT_SUGAR", 1, 5.0, "%", true,
                        "Fiehe Resorcinol-HCl Chromogenic Complex",
                        "Acid hydrolysis of elevated hydroxymethylfurfural (HMF) in artificial sugar syrups forms cherry-red complex",
                        "HONEY"
                ));

                // VEGETABLES & FRESH PRODUCE
                analyteRepository.save(new Analyte(
                        "Malachite Green Dye", "MALACHITE_GREEN", 1, 0.0, "ppm", true,
                        "Triphenylmethane Optical Nanoprobe",
                        "Rapid extraction strip reacts with non-permitted Malachite Green dye on green peas, bitter gourd and chillies",
                        "VEGETABLES"
                ));
            }

            // 2. Seed Default Users if empty
            if (userRepository.count() == 0) {
                userRepository.save(new User(
                        "admin",
                        "admin@nanokhadya.gov.in",
                        passwordEncoder.encode("admin123"),
                        "Chief Food Safety Officer",
                        Role.ROLE_ADMIN
                ));
                userRepository.save(new User(
                        "inspector",
                        "inspector@nanokhadya.gov.in",
                        passwordEncoder.encode("inspector123"),
                        "Field Quality Inspector",
                        Role.ROLE_INSPECTOR
                ));
            }

            // 3. Seed Default Demonstration Device if empty
            if (deviceRepository.count() == 0) {
                deviceRepository.save(new Device(
                        "READER-ESP32S3-001",
                        "v1.0-ESP32S3-OptoChamber",
                        "1.0.0",
                        "Anand Milk Union MCC-04, Gujarat"
                ));
            }

            // 4. Seed Demonstration Cartridges if empty
            if (cartridgeRepository.count() == 0) {
                cartridgeRepository.save(new Cartridge(
                        "MC-9021",
                        "2026-B1",
                        LocalDate.now().minusDays(3),
                        LocalDate.now().plusMonths(6)
                ));
                cartridgeRepository.save(new Cartridge(
                        "MC-9022",
                        "2026-B1",
                        LocalDate.now().minusDays(3),
                        LocalDate.now().plusMonths(6)
                ));
            }

            // 5. Seed Demonstration Food Samples if empty
            if (foodSampleRepository.count() == 0) {
                // Dairy: Cow Milk
                FoodSample s1 = new FoodSample(
                        "MILK-ANAND-01",
                        FoodSample.FoodCategory.DAIRY,
                        "Milk (Cow Fresh)",
                        FoodSample.MilkType.COW,
                        "Village Chikhodra Collection Centre, Anand",
                        "LOT-882",
                        "Field Quality Inspector"
                );
                s1.setGpsLatitude(22.5645);
                s1.setGpsLongitude(72.9289);
                foodSampleRepository.save(s1);

                // Dairy: Paneer
                FoodSample s2 = new FoodSample(
                        "PANEER-MUMBAI-04",
                        FoodSample.FoodCategory.DAIRY,
                        "Paneer (Fresh Cottage Cheese)",
                        FoodSample.MilkType.BUFFALO,
                        "Dadar Wholesale Mandi, Mumbai",
                        "LOT-PN-104",
                        "Suraksha Inspector"
                );
                s2.setGpsLatitude(19.0178);
                s2.setGpsLongitude(72.8478);
                foodSampleRepository.save(s2);

                // Dairy: Yoghurt / Dahi
                FoodSample s3 = new FoodSample(
                        "DAHI-PUNE-09",
                        FoodSample.FoodCategory.DAIRY,
                        "Dahi / Yoghurt (Set Curd)",
                        FoodSample.MilkType.MIXED,
                        "Shivaji Nagar Dairy Depot, Pune",
                        "LOT-DH-09",
                        "Field Quality Inspector"
                );
                s3.setGpsLatitude(18.5308);
                s3.setGpsLongitude(73.8475);
                foodSampleRepository.save(s3);

                // Honey
                FoodSample s4 = new FoodSample(
                        "HONEY-HIM-02",
                        FoodSample.FoodCategory.HONEY,
                        "Raw Wild Forest Honey",
                        FoodSample.MilkType.NOT_APPLICABLE,
                        "Kangra Valley Beekeeping Cooperative",
                        "LOT-HN-441",
                        "FSSAI Flying Squad"
                );
                s4.setGpsLatitude(32.0998);
                s4.setGpsLongitude(76.2691);
                foodSampleRepository.save(s4);

                // Spices: Turmeric Powder
                FoodSample s5 = new FoodSample(
                        "SPICE-TURM-77",
                        FoodSample.FoodCategory.SPICES,
                        "Turmeric Powder (Haldi)",
                        FoodSample.MilkType.NOT_APPLICABLE,
                        "APMC Spice Market, Nizamabad",
                        "LOT-TM-772",
                        "Quality Enforcement Wing"
                );
                s5.setGpsLatitude(18.6725);
                s5.setGpsLongitude(78.0941);
                foodSampleRepository.save(s5);

                // Spices: Red Chilli Powder
                FoodSample s6 = new FoodSample(
                        "SPICE-CHIL-18",
                        FoodSample.FoodCategory.SPICES,
                        "Red Chilli Powder (Mirchi)",
                        FoodSample.MilkType.NOT_APPLICABLE,
                        "Guntur Mirchi Yard, Andhra Pradesh",
                        "LOT-CH-189",
                        "FSSAI Regional Officer"
                );
                s6.setGpsLatitude(16.3067);
                s6.setGpsLongitude(80.4365);
                foodSampleRepository.save(s6);

                // Edible Oils: Mustard Oil
                FoodSample s7 = new FoodSample(
                        "OIL-MUST-31",
                        FoodSample.FoodCategory.EDIBLE_OILS,
                        "Kachi Ghani Mustard Oil",
                        FoodSample.MilkType.NOT_APPLICABLE,
                        "Alwar Oil Extraction Mill, Rajasthan",
                        "LOT-MO-312",
                        "State Food Safety Officer"
                );
                s7.setGpsLatitude(27.5530);
                s7.setGpsLongitude(76.6346);
                foodSampleRepository.save(s7);

                // Vegetables: Green Peas
                FoodSample s8 = new FoodSample(
                        "VEG-PEAS-65",
                        FoodSample.FoodCategory.VEGETABLES,
                        "Fresh Green Peas (Matar)",
                        FoodSample.MilkType.NOT_APPLICABLE,
                        "Vashi APMC Sabzi Mandi, Navi Mumbai",
                        "LOT-GP-650",
                        "Municipal Health Inspector"
                );
                s8.setGpsLatitude(19.0770);
                s8.setGpsLongitude(72.9986);
                foodSampleRepository.save(s8);
            }
        };
    }
}
