from calibration import rgb_to_cielab, calculate_delta_e, apply_white_balance, solve_4pl_concentration
import numpy as np

def test_cielab_conversion():
    # Test pure white sRGB
    l, a, b = rgb_to_cielab(255, 255, 255)
    assert 99.0 <= l <= 100.0
    assert abs(a) <= 1.0
    assert abs(b) <= 1.0

    # Test pure red sRGB
    l_red, a_red, b_red = rgb_to_cielab(255, 0, 0)
    assert a_red > 50.0 # High positive a* indicates red

def test_delta_e_distance():
    lab1 = (50.0, 20.0, 10.0)
    lab2 = (50.0, 20.0, 10.0)
    assert calculate_delta_e(lab1, lab2) == 0.0

    lab3 = (53.0, 24.0, 10.0)
    # dl=3, da=4, db=0 -> sqrt(9+16) = 5.0
    assert calculate_delta_e(lab1, lab3) == 5.0

def test_4pl_solver():
    params = {"A": 1.0, "B": 1.5, "C": 5.0, "D": 30.0}
    # Baseline deltaE <= A should yield 0.0
    assert solve_4pl_concentration(0.8, params) == 0.0

    # A typical response should solve to positive concentration
    conc = solve_4pl_concentration(10.0, params)
    assert conc is not None and conc > 0.0

if __name__ == "__main__":
    test_cielab_conversion()
    test_delta_e_distance()
    test_4pl_solver()
    print("All Python calibration mathematics tests passed successfully!")
