export const AUDIO = 0;
export const TEST_MODE = 0;

export const MAXPLANES = 2;
export const MAX_STRIPS = 15;
export const STRIP_ARRIVALS = 'ARRIVALS';
export const STRIP_DEPARTURES = 'DEPARTURES';

export const PLANE_BODY_COLOR = 'rgba(0,255,0,1)';
export const PLANE_TAIL_COLOR = 'rgba(0,255,0,0.7)';
export const PLANE_TEXT_COLOR = 'rgba(255,255,255,1)';
export const PLANE_CONNECTOR_COLOR = 'rgba(170,170,255,0.6)';

export const PLANE_TURN_RATIO = 3;
export const PLANE_CLIMB_RATIO = 2000;
export const PLANE_DESCENT_RATIO = -2000;
export const PLANE_APPROACH_RATIO = -4000;
export const PLANE_FINAL_RATIO = -300;

// Autopilot status (Multiple status)
export const STATUS_GROUND = 'GND-';
export const STATUS_WAIT_TAKEOFF = 'WAIT-';
export const STATUS_WAIT_CLEARENCE = 'WC-';
export const STATUS_CLEARENCE_REQUESTED = 'RQ-';
export const STATUS_TAXI = 'TAXI-';
export const STATUS_HOLDING_POINT = 'HOLD-';
export const STATUS_CLEARED_TAKEOFF = 'CT-';
export const STATUS_TAKEOFF = 'TO-';
export const STATUS_CLIMB_INITIAL = 'CLI-';
export const STATUS_CLIMBING = 'CLM-';
export const STATUS_DESCENDING = 'DES-';
export const STATUS_ARRIVAL = 'ARR-';
export const STATUS_DEPARTURE = 'DEP-';
export const STATUS_TRANSIT = 'TRA-';
export const STATUS_CRUISE = 'CRU-';
export const STATUS_RELEASE_WARNING = 'RWG-';
export const STATUS_APPROACH = 'APP-';
export const STATUS_FINAL_APPROACH = 'FAP-';
export const STATUS_FINAL = 'FIN-';
export const STATUS_LANDING = 'LDG-';
export const STATUS_LANDED = 'LND-';
export const STATUS_MISSED_APPROACH = 'MA-';
export const STATUS_HOLDING = 'HP-';
export const STATUS_HOLDING_OUTBOUND_LEG = 'HO-';
export const STATUS_HOLDING_INBOUND_LEG = 'HI-';
export const STATUS_INTERCEPTING = 'IN-';
export const STATUS_INTERCEPT_STRAIGHT = 'IS-';
export const STATUS_INTERCEPT_PROCEDURE = 'IP-';
export const STATUS_INTERCEPT_OUTBOUND_LEG = 'IO-';
export const STATUS_INTERCEPT_PROCEDURE_TURN = 'IT-';
export const STATUS_INTERCEPT_INBOUND_LEG = 'II-';
export const STATUS_RADIO_CONTACT_TWR = 'TWR-';
export const STATUS_RADIO_CONTACT_ATC = 'ATC-';
export const STATUS_RADIO_CONTACT_YOU = 'YOU-';
export const STATUS_IDENT = 'ID-';

export const STRIP_WIDTH = 410;
export const STRIP_HEIGHT = 50;
export const STRIP_COLOR = 'rgba(255,255,255,0.8)';
export const STRIP_TEXT_COLOR = 'rgba(0,0,0,1)';
export const STRIP_HEADER_HEIGHT = 30;

export const STRIP_OUT = 1;
export const STRIP_WARNING = 2;
export const STRIP_RELEASE = 3;
export const STRIP_ACTIVE = 4;
export const STRIP_SELECTED = 5;

export const STRIP_COLOR_OUT = 'rgba(255,255,255,0.8)';
export const STRIP_COLOR_WARNING = 'rgba(255,128,128,0.8)';
export const STRIP_COLOR_RELEASE = 'rgba(255,180,0,0.8)';
export const STRIP_COLOR_ACTIVE = 'rgba(128,255,128,0.8)';
export const STRIP_COLOR_SELECTED = 'rgba(255,255,0,0.8)';

export const PLANE_ATC_ACTIVE = 1;
export const PLANE_ATC_ARRIVAL_WARNING = 2;
export const PLANE_ATC_ARRIVAL_RELEASE = 3;
export const PLANE_ATC_DEPARTURE_WARNING = 4;
export const PLANE_ATC_DEPARTURE_RELEASE = 5;
export const PLANE_ATC_OUT = 6;

export const CONSOLE_HEIGHT = 200;

export const HEADER_COLOR = 'rgba(255,255,0,0.8)';

export const MILESFACT = 1500;
export const MAX_LATLONG_RND = 0.5;

export const NAVAID_TYPE_VORDME = 1;
export const NAVAID_TYPE_VOR = 2;
export const NAVAID_TYPE_NDB = 3;
export const NAVAID_TYPE_VORDMENDB = 4;
export const NAVAID_TYPE_TACAN = 5;
export const NAVAID_TYPE_ILS_CAT_1 = 6;
export const NAVAID_TYPE_ILS_CAT_2 = 7;
export const NAVAID_TYPE_ILS_CAT_3 = 8;
export const NAVAID_TYPE_ILS_OM = 9;
export const NAVAID_TYPE_ILS_MM = 10;
export const NAVAID_TYPE_ILS_IM = 11;
export const NAVAID_TYPE_RWY = 12;
export const NAVAID_TYPE_ROUTE_FIX = 13;

export const FIX_BODY_COLOR = 'rgba(0,255,0,0.4)';
export const FIX_TEXT_COLOR = 'rgba(170,170,255,0.8)';
export const CONSOLE_COLOR = 'rgba(0,0,0,1)';
export const CONSOLE_SWITCH_WIDTH = 20;
export const CONSOLE_SWITCH_HEIGHT = 10;
export const CONSOLE_SWITCH_ON_COLOR = 'rgba(50,255,50,1)';
export const CONSOLE_SWITCH_OFF_COLOR = 'rgba(255,255,255,1)';
export const CONSOLE_WHITE = 'rgba(255,255,255,1)';

export const RWY_BODY_COLOR = 'rgba(80,255,80,0.5)';
export const RWY_INACTIVE_BODY_COLOR = 'rgba(255,80,80,1)';
export const RWY_LANDING_BODY_COLOR = 'rgba(80,80,255,0.5)';
export const RWY_TAKEOFF_BODY_COLOR = 'rgba(255,255,80,1)';

export const RWY_TEXT_COLOR = 'rgba(170,170,255,0.8)';
export const RWY_CENTERLINE_COLOR = 'rgba(80,80,255,0.5)';
export const RWY_CENTERLINE_LENGTH = 10; // Nautical miles

export const INTERCEPT_MODE_STRAIGHT = 'STRAIGHT';
export const INTERCEPT_MODE_PROCEDURE = 'PROCDEURE';
export const INTERCEPT_MODE_OUTBOUND_LEG = 'OUTBOUND_LEG';

export const GRID_COLOR = 'rgba(80,80,255,0.2)';
export const HOLDING_COLOR = 'rgba(80,80,255,0.2)';
export const ATS_COLOR = 'rgba(80,80,255,0.4)';

export const ROUTE_TEXT_COLOR = 'rgba(255,255,0,0.8)';
export const ROUTE_BOX_COLOR = 'rgba(0,0,0,0.7)';

export const MSG_FROM_PLANE = 'FROM_PLANE';
export const MSG_TO_PLANE = 'TO_PLANE';
export const MSG_FROM_TWR = 'FROM_TOWER';
export const MSG_FROM_ATC = 'FROM_ATC';
export const MSG_ERROR = 'ERROR';
export const MSG_TO_TWR = 'TO_TOWER';
export const MSG_TO_ATC = 'TO_ATC';

export const MSG_COLOR = 'rgba(255,255,255,1)';
export const MSG_BAR_COLOR = 'rgba(128,128,128,0.5)';
export const MSG_BAR_COLOR_ERR = 'rgba(255,80,80,0.5)';
export const MSG_BAR_COLOR_1 = 'rgba(255,255,128,0.5)';
export const MSG_BAR_COLOR_2 = 'rgba(128,255,128,0.5)';
export const MSG_BAR_COLOR_3 = 'rgba(128,128,255,0.5)';
export const MSG_BAR_COLOR_4 = 'rgba(80,255,255,0.5)';

export const MSG_BAR_DELAY = 15;       // Auto hide of message after xx seconds

export const CLOCK_BAR_COLOR = 'rgba(255,255,255,0.8)';
export const CLOCK_COLOR = 'rgba(50,50,50,1)';
