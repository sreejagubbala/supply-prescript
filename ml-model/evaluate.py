import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

from config import MODEL_PATH, PROCESSED_DATA_PATH, TARGET_COLUMN
from feature_engineering import create_features


def evaluate_model():
    data = pd.read_csv(PROCESSED_DATA_PATH, encoding="latin1")
    data = create_features(data)

    X = data.drop(columns=[TARGET_COLUMN])
    y = data[TARGET_COLUMN]

    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = joblib.load(MODEL_PATH)

    probabilities = pipeline.predict_proba(X_test)[:, 1]

    thresholds = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55]

    print("\n" + "=" * 70)
    print("THRESHOLD COMPARISON")
    print("=" * 70)

    threshold_results = []

    for threshold in thresholds:
        predictions = (probabilities >= threshold).astype(int)

        precision = precision_score(y_test, predictions)
        recall = recall_score(y_test, predictions)
        f1 = f1_score(y_test, predictions)
        accuracy = accuracy_score(y_test, predictions)

        tn, fp, fn, tp = confusion_matrix(
            y_test, predictions
        ).ravel()

        threshold_results.append(
            {
                "threshold": threshold,
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "false_positives": fp,
                "false_negatives": fn,
                "true_positives": tp,
                "true_negatives": tn,
            }
        )

        print(
            f"\nThreshold: {threshold:.2f}"
            f"\n  Accuracy : {accuracy:.4f}"
            f"\n  Precision: {precision:.4f}"
            f"\n  Recall   : {recall:.4f}"
            f"\n  F1 Score : {f1:.4f}"
            f"\n  FP       : {fp}"
            f"\n  FN       : {fn}"
            f"\n  TP       : {tp}"
            f"\n  TN       : {tn}"
        )

    threshold_df = pd.DataFrame(threshold_results)

    best_f1 = threshold_df.loc[
        threshold_df["f1"].idxmax()
    ]

    print("\n" + "=" * 70)
    print("BEST THRESHOLD BY F1 SCORE")
    print("=" * 70)

    print(
        f"Threshold: {best_f1['threshold']:.2f}\n"
        f"F1 Score : {best_f1['f1']:.4f}\n"
        f"Precision: {best_f1['precision']:.4f}\n"
        f"Recall   : {best_f1['recall']:.4f}\n"
    )

    print("=" * 70)
    print("ROC-AUC")
    print("=" * 70)

    print(f"ROC-AUC: {roc_auc_score(y_test, probabilities):.4f}")

    # Detailed analysis using 0.40 threshold
    selected_threshold = 0.40
    predictions = (probabilities >= selected_threshold).astype(int)

    print("\n" + "=" * 70)
    print(f"DETAILED ANALYSIS — THRESHOLD {selected_threshold:.2f}")
    print("=" * 70)

    print("\nConfusion matrix:")
    print(confusion_matrix(y_test, predictions))

    results = X_test.copy()
    results["actual_delay"] = y_test.values
    results["predicted_delay"] = predictions
    results["prediction_probability"] = probabilities

    results["correct_prediction"] = (
        results["actual_delay"] == results["predicted_delay"]
    )

    shipping_mode_summary = results.groupby("Shipping Mode").agg(
        shipments=("actual_delay", "size"),
        actual_delay_rate=("actual_delay", "mean"),
        predicted_delay_rate=("predicted_delay", "mean"),
        accuracy=("correct_prediction", "mean"),
    ).sort_values("accuracy")

    print("\nPerformance by shipping mode:")
    print(shipping_mode_summary.round(3))

    missed_delays = results[
        (results["actual_delay"] == 1)
        & (results["predicted_delay"] == 0)
    ]

    print("\nMissed late deliveries by shipping mode:")
    print(missed_delays["Shipping Mode"].value_counts())

    print("\nTotal missed late deliveries:", len(missed_delays))


if __name__ == "__main__":
    evaluate_model()