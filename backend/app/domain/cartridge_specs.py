"""
Universal Food Adulteration Detection Cartridge Specification.
Three food categories: Milk, Honey, Paneer.
Each category features 16 chemically functionalized sensing zones with nanozymes and chromogenic reagents.
Zone 16 is always the Control validation zone.
"""
from dataclasses import dataclass
from typing import Literal

ZoneStatus = Literal["NORMAL", "ADULTERANT_DETECTED", "SUSPECTED", "CONTROL_OK", "CONTROL_FAILED"]


@dataclass
class CartridgeZoneSpec:
    zone_index: int       # 1 to 16
    target_name: str      # e.g. "Starch", "Urea", "Melamine"
    category: str         # "Adulterant", "Preservative", "Contaminant", "Quality", "Validation"
    wavelength_nm: int    # Peak absorbance wavelength
    description: str


CARTRIDGE_ZONES: dict[str, list[CartridgeZoneSpec]] = {
    "Milk": [
        CartridgeZoneSpec(1, "Starch", "Adulterant", 585, "Iodine-starch complex detection"),
        CartridgeZoneSpec(2, "Urea", "Adulterant", 460, "Urease / DMAB chromogenic reaction"),
        CartridgeZoneSpec(3, "Detergent/Surfactant", "Adulterant", 610, "Methylene blue dye extraction"),
        CartridgeZoneSpec(4, "Peroxide", "Chemical", 510, "Peroxidase / TMB chromogen"),
        CartridgeZoneSpec(5, "Neutralizer (Alkaline)", "Neutralizer", 560, "Rosinic acid / indicator shift"),
        CartridgeZoneSpec(6, "Antibiotic (selected)", "Contaminant", 435, "Receptor-ligand competitive assay"),
        CartridgeZoneSpec(7, "Formalin", "Preservative", 535, "Chromotropic acid reaction"),
        CartridgeZoneSpec(8, "Melamine", "Adulterant", 410, "Gold nanoparticle aggregation assay"),
        CartridgeZoneSpec(9, "Protein (non-dairy)", "Adulterant", 680, "Biuret / Coomassie blue shift"),
        CartridgeZoneSpec(10, "Added water", "Dilution", 940, "NIR water absorption delta (OH-stretch)"),
        CartridgeZoneSpec(11, "Salt / Mineral balance", "Electrolyte", 705, "Conductivity & silver chromate"),
        CartridgeZoneSpec(12, "Preservatives", "Preservative", 645, "Boric / salicylic acid detection"),
        CartridgeZoneSpec(13, "pH indicator", "Physical", 560, "Bromothymol blue pH transition"),
        CartridgeZoneSpec(14, "Viscosity modifier", "Physical", 730, "Optical flow resistance & scatter"),
        CartridgeZoneSpec(15, "Color/clarity marker", "Optical", 485, "Turbidity and reflectance profile"),
        CartridgeZoneSpec(16, "Control", "Validation", 680, "Internal reaction validity standard"),
    ],
    "Honey": [
        CartridgeZoneSpec(1, "Added sugar (syrup)", "Adulterant", 585, "Furfural / resorcinol chromogen"),
        CartridgeZoneSpec(2, "Fructose/Glucose ratio", "Purity", 510, "Glucose oxidase-coupled nanozyme"),
        CartridgeZoneSpec(3, "HMF (overheating)", "Degradation", 460, "Hydroxymethylfurfural absorption"),
        CartridgeZoneSpec(4, "Rice syrup marker", "Adulterant", 535, "Specific beta-amylase / dye shift"),
        CartridgeZoneSpec(5, "Invert sugar", "Adulterant", 610, "Fiehe's resorcinol test"),
        CartridgeZoneSpec(6, "C4 sugar (adulterant)", "Adulterant", 645, "Corn/cane syrup molecular beacon"),
        CartridgeZoneSpec(7, "Sulfite", "Preservative", 435, "Malachite green bleach reaction"),
        CartridgeZoneSpec(8, "Antibiotic (selected)", "Contaminant", 410, "Tetracycline/streptomycin probe"),
        CartridgeZoneSpec(9, "Pesticide residue", "Contaminant", 705, "Organophosphate esterase inhibition"),
        CartridgeZoneSpec(10, "Heavy metals (basic)", "Toxin", 560, "Lead/cadmium dithizone chelation"),
        CartridgeZoneSpec(11, "Colorant (artificial)", "Adulterant", 485, "Synthetic caramel / coal tar dye"),
        CartridgeZoneSpec(12, "Moisture level", "Quality", 940, "Refractometric NIR water band"),
        CartridgeZoneSpec(13, "pH indicator", "Physical", 560, "Natural honey acidity range"),
        CartridgeZoneSpec(14, "Viscosity marker", "Physical", 760, "Capillary wicking rate indicator"),
        CartridgeZoneSpec(15, "Floral origin marker", "Origin", 680, "Flavonoid / pollen polyphenol"),
        CartridgeZoneSpec(16, "Control", "Validation", 680, "Internal reaction validity standard"),
    ],
    "Paneer": [
        CartridgeZoneSpec(1, "Starch", "Adulterant", 585, "Iodine triiodide inclusion complex"),
        CartridgeZoneSpec(2, "Non-dairy protein", "Adulterant", 680, "Soy/pea protein specific antibody"),
        CartridgeZoneSpec(3, "Vegetable fat/oil", "Adulterant", 730, "Baudouin / sesame oil vanillin"),
        CartridgeZoneSpec(4, "Detergent", "Chemical", 610, "Anionic surfactant indicator"),
        CartridgeZoneSpec(5, "Preservatives", "Preservative", 645, "Sorbic / benzoic acid oxidation"),
        CartridgeZoneSpec(6, "Urea", "Adulterant", 460, "Urease-catalyzed ammonium detection"),
        CartridgeZoneSpec(7, "Formalin", "Preservative", 535, "Ferric chloride chromophore"),
        CartridgeZoneSpec(8, "Salt excess", "Electrolyte", 705, "Silver nitrate precipitation assay"),
        CartridgeZoneSpec(9, "Milk adulterant marker", "Marker", 510, "Synthetic milk base indicator"),
        CartridgeZoneSpec(10, "Acid neutralizer", "Chemical", 560, "Carbonate/bicarbonate effervescence"),
        CartridgeZoneSpec(11, "Colorant", "Adulterant", 485, "Metanil yellow / tartrazine probe"),
        CartridgeZoneSpec(12, "Texture modifier", "Physical", 760, "Alginate/carrageenan binding dye"),
        CartridgeZoneSpec(13, "pH indicator", "Physical", 560, "Whey coagulation acidity check"),
        CartridgeZoneSpec(14, "Calcium level", "Mineral", 435, "Arsenazo III chelation complex"),
        CartridgeZoneSpec(15, "Moisture content", "Quality", 940, "Free water NIR vibration harmonic"),
        CartridgeZoneSpec(16, "Control", "Validation", 680, "Internal reaction validity standard"),
    ],
}
