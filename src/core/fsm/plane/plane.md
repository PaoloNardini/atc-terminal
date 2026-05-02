The XSTATE machine must simulate an airplane.

The airplane context contains the following attributes:

- FL: the current flight level (altitude in thousands feet) (0...420).
- HDG: the current heading (0...359).
- ROC: The current Rate of Climb (+- 0...9999) feet/minute.
- ROT: The rate of turn (+- 0...400) degrees/minute.
- KTS: The current speed in Knots (0...999).
- GROUND: True if the airplane is on the ground, False if airplane is flying.
- PHASE: one of "Rest", "Taxi", "Hold", "Take-Off-Run", "Take-Off", "SID", "Cruise", "STAR", "App", "Final", "Landing", "Landed".
- V2: The take-off speed in Knots, a constant value initialized when the airplane is created.
- MAS: The minimum approach speed in Knots, a constant value initialized when the airplane is created.

## There are 4 parallel flows:

- Vertical: controlling the vertical axis
- Horizontal: controlling the horizontal axis
- Speed: controlling the speed
- Flight Phase: controlling the flight phase

The initial state of Airplane is "Rest" meaning ROC = 0, ROT = 0, KTS = 0

## The allowed Transitions are

### Vertical Flow:

- "Climb": "Rest" -> "Climbing" - requested parameters are ROC and TARGET_FL. ROC must be positive and TARGET_FL must be higher than current FL.
- "Descent": "Rest" -> "Descending" - requested parameters are ROC and TARGET_FL. ROC must be negative and TARGET_FL must be lower than current FL.
- "Level": "Climbing" -> "Rest" - set ROT = 0
- "Level": "Descending" -> "Rest" - set ROT = 0

### Horizontal Flow:

- "Turn Right": "Rest" -> "Turning Right" - requested parameters are ROT and TARGET_HDG. ROT must be positive, TARGET_HDG must be any HDG.
- "Turn Left": "Rest" -> "Turning Left" - requested parameters are ROT and TARGET_HDG. ROT must be negative, TARGET_HDG must be any HDG.
- "Stop Turn": "Turning Right" -> "Rest" - set ROT = 0
- "Stop Turn": "Turning Left" -> "Rest" - set ROT = 0

### Speed Flow:

- "Increase Speed": "Rest" -> "Accelerating" - requested parameter is TARGET_KTS (must be higher than current KTS).
- "Decrease Speed": "Rest" -> "Decelerating" - requested parameter is TARGET_KTS (must be lower than current KTS).

### Flight Phase Flow:

- "Clear to Taxi": "Rest" -> "Taxi" - GROUND must be True, FL must be = 0, ROC = 0,KTS must be < 20.
- "Hold position": "Taxi" -> "Hold" - GROUND must be True, FL must be = 0, ROC = 0, KTS must be = 0.
- "Clear to Take-Off": "Hold" -> "Take-Off-Run" - GROUND must be True, FL must be = 0, TARGET_KTS must be = V2.
- "Taking-Off": "Take-Off-Run" -> "Take-Off" - GROUND must be False, ROC > 0, KTS = V2, TARGET_FL must be > 10.
- "Follow SID": "Take-Off" -> "SID" - GROUND must be False, FL must be > 0, KTS must be > V2.
- "Enroute": "SID" -> "Cruise" - GROUND must be False, FL must be > 0, KTS must be > V2.
- "Start descent": "Cruise" -> "STAR" - GROUND must be False, FL must be > 0, KTS must be > 0 and > MAS.
- "Start approach": "STAR" -> "App" - GROUND must be False, FL must be > 0, KTS must be > MAS.
- "Estabilish on Final": "App" -> "Final" - GROUND must be False, FL must be > 0, KTS must be > MAS.
- "Landing": "Final" -> "Landing" - GROUND must be False, FL must be > 0, KTS must be > MAS.
- "Landed": "Landing" -> "Landed" - GROUND must be True, FL must be = 0, KTS must be < 20.
- "Taxi to Park": "Landed" -> "Taxi" - GROUND must be True, FL must be = 0, KTS must be < 20.
- "Park": "Taxi" -> "Rest" - GROUND must be True, FL must be = 0, KTS must be 0

### The emitted event should be:

- "Reached target FL": FL = TARGET_FL
- "Reached target HDG": HDG = TARGET_HDG
- "Reached target KTS": KTS = TARGET_KTS

### Some Transition must be timer controlled:

- "Taxi" -> "Hold": after 3 minutes.
- "Hold" -> "Take-Off-Run": after 1 minute.
- "Take-Off-Run" -> "Take-Off": after 30 seconds.
- "Landed" -> "Taxi": after 1 minutes.
- "Taxi" -> "Rest": after 3 minutes.
