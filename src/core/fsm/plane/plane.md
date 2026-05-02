The XSTATE machine must simulate an airplane.

The airplane context contains the following attributes:

- FL: the current flight level (altitude in thousands feet) (0...420)
- HDG: the current heading (0...359)
- ROC: The current Rate of Climb (+- 0...9999) feet/minute
- ROT. The rate of turn (+- 0...400) degrees/minute

There are two parallel flows:

- Vertical: controlling the vertical axis
- Horizontal: controlling the horizontal axis

The initial state of Airplane in both flows is "Rest" meaning ROC = 0 and ROT = 0

The allowed Transitions are

- "Climb": "Rest" -> "Climbing" - requested parameters are ROC and TARGET_FL. ROC must be positive and TARGET_FL must be higher than current FL.
- "Descent": "Rest" -> "Descending" - requested parameters are ROC and TARGET_FL. ROC must be negative and TARGET_FL must be lower than current FL.
- "Turn Right": "Rest" -> "Turning Right" - requested parameters are ROT and TARGET_HDG. ROT must be positive, TARGET_HDG must be any HDG.
- "Turn Left": "Rest" -> "Turning Left" - requested parameters are ROT and TARGET_HDG. ROT must be negative, TARGET_HDG must be any HDG.
- "Level": "Climbing" -> "Rest" - set ROT = 0
- "Level": "Descending" -> "Rest" - set ROT = 0
- "Stop Turn": "Turning Right" -> "Rest" - set ROT = 0
- "Stop Turn": "Turning Left" -> "Rest" - set ROT = 0

