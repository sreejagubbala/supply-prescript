from optimization.objective import (
    calculate_objective,
)

from optimization.constraints import (
    check_budget_constraint,
    check_service_constraint,
)

from optimization.solver import (
    solve_optimization,
)


def test_objective_calculation():

    result = calculate_objective(
        cost=20,
        predicted_delay=4,
        delay_probability=0.5,
    )

    assert result == 70.0


def test_budget_constraint():

    assert check_budget_constraint(
        50,
        60,
    )

    assert not check_budget_constraint(
        70,
        60,
    )


def test_service_constraint():

    assert check_service_constraint(
        3,
        5,
    )

    assert not check_service_constraint(
        6,
        5,
    )


def test_optimization():

    result = solve_optimization(
        delay_probability=0.8,
        predicted_shipping_days=6,
        budget=60,
        maximum_days=7,
    )

    assert result["status"] == "Optimal"

    assert result[
        "recommended_mode"
    ] is not None


def test_invalid_probability():

    try:

        solve_optimization(
            delay_probability=1.5,
            predicted_shipping_days=4,
        )

        assert False

    except ValueError:

        assert True