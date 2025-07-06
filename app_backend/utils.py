def levenshtein(s: str, t: str) -> int:
    """Compute the Levenshtein distance between two strings."""
    if s == t:
        return 0
    if len(s) < len(t):
        s, t = t, s
    previous_row = list(range(len(t) + 1))
    for i, c1 in enumerate(s, start=1):
        current_row = [i]
        for j, c2 in enumerate(t, start=1):
            insertions = previous_row[j] + 1
            deletions = current_row[j - 1] + 1
            substitutions = previous_row[j - 1] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]