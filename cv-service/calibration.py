import numpy as np
from typing import Tuple, Dict, Any, Optional

def rgb_to_cielab(r: float, g: float, b: float) -> Tuple[float, float, float]:
    """
    Converts standard sRGB values [0, 255] to CIE 1976 L*a*b* under standard D65 illuminant.
    """
    # 1. Normalize to [0, 1]
    r_norm = r / 255.0
    g_norm = g / 255.0
    b_norm = b / 255.0

    # 2. Inverse gamma sRGB correction
    def pivot_rgb(n: float) -> float:
        return (n / 12.92) if n <= 0.04045 else (((n + 0.055) / 1.055) ** 2.4)

    r_lin = pivot_rgb(r_norm)
    g_lin = pivot_rgb(g_norm)
    b_lin = pivot_rgb(b_norm)

    # 3. Linear sRGB to CIE 1931 XYZ (D65)
    x = r_lin * 0.4124564 + g_lin * 0.3575761 + b_lin * 0.1804375
    y = r_lin * 0.2126729 + g_lin * 0.7151522 + b_lin * 0.0721750
    z = r_lin * 0.0193339 + g_lin * 0.1191920 + b_lin * 0.9503041

    # D65 Reference White
    xn = 0.95047
    yn = 1.00000
    zn = 1.08883

    # 4. XYZ to CIELAB non-linear transformation
    def pivot_xyz(n: float) -> float:
        return (n ** (1.0 / 3.0)) if n > 0.008856 else ((7.787 * n) + (16.0 / 116.0))

    fx = pivot_xyz(x / xn)
    fy = pivot_xyz(y / yn)
    fz = pivot_xyz(z / zn)

    l_star = (116.0 * fy) - 16.0
    a_star = 500.0 * (fx - fy)
    b_star = 200.0 * (fy - fz)

    return round(float(l_star), 2), round(float(a_star), 2), round(float(b_star), 2)


def calculate_delta_e(lab1: Tuple[float, float, float], lab2: Tuple[float, float, float]) -> float:
    """
    Computes Euclidean CIE 1976 Delta E total color difference.
    Delta E = sqrt((L1 - L2)^2 + (a1 - a2)^2 + (b1 - b2)^2)
    """
    dl = lab1[0] - lab2[0]
    da = lab1[1] - lab2[1]
    db = lab1[2] - lab2[2]
    return round(float(np.sqrt(dl**2 + da**2 + db**2)), 2)


def apply_white_balance(rgb: np.ndarray, measured_white_rgb: np.ndarray, target_white: float = 245.0) -> np.ndarray:
    """
    Applies von Kries diagonal white balance transformation relative to cartridge Zone 6 white reference.
    """
    measured_white_rgb = np.maximum(measured_white_rgb, 1.0)
    scaling_factors = target_white / measured_white_rgb
    corrected_rgb = np.clip(rgb * scaling_factors, 0.0, 255.0)
    return corrected_rgb


def solve_4pl_concentration(delta_e: float, params: Dict[str, float]) -> Optional[float]:
    """
    Solves concentration x using 4-Parameter Logistic equation:
    y = D + (A - D) / [1 + (x / C)^B]
    x = C * ((A - y) / (y - D))^(1 / B)
    """
    a = params.get("A", 1.0)    # Baseline at 0 concentration
    b = params.get("B", 1.5)    # Hill slope
    c = params.get("C", 5.0)    # EC50 inflection point
    d = params.get("D", 28.0)   # Max saturation

    if delta_e <= a:
        return 0.0
    if delta_e >= d:
        return float(c * 10.0) # Saturation limit

    ratio = (a - delta_e) / (delta_e - d)
    if ratio <= 0:
        return 0.0

    try:
        conc = c * (ratio ** (1.0 / b))
        return round(float(conc), 2)
    except Exception:
        return None
