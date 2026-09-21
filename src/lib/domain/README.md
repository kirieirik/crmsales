# Domain

Business calculations and state-transition rules belong here. UI components should call domain functions rather than reimplementing pipeline, activity, or reporting formulas.

Planned first functions:

- weighted pipeline value (`value * probability / 100`)
- overdue activity detection
- win rate
- inactive customer detection
