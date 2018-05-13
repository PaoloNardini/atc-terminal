// const PI = 3.1415926535;

const AUDIO = 1;
const TEST_MODE = 0;
var DEPARTURES_ENABLED = 1;
var ARRIVALS_ENABLED = 1;
var AUTO_SQUACK = 1;
var AUTO_IDENT = 1;
var MAX_ARRIVALS = 7;
var MAX_DEPARTURES = 7;
var TAKEOFF_INTERVAL = 120;      // Min Interval in seconds between two take-offs from the same runway
var ARRIVAL_INTERVAL = 180;      // Min Interval in secondsa between two arrivals
var DIRECTOR_INTERVAL = 10;      // Min interval in secs between director actions

const MAXPLANES = 2;
const MAX_STRIPS = 15;
const STRIP_ARRIVALS = 'ARRIVALS';
const STRIP_DEPARTURES = 'DEPARTURES';

const PLANE_BODY_COLOR = 'rgba(0,255,0,1)';
const PLANE_TAIL_COLOR = 'rgba(0,255,0,0.7)';
const PLANE_TEXT_COLOR = 'rgba(255,255,255,1)';
const PLANE_CONNECTOR_COLOR = 'rgba(170,170,255,0.6)';

const PLANE_TURN_RATIO = 3;
const PLANE_CLIMB_RATIO = 2000;
const PLANE_DESCENT_RATIO = -2000;
const PLANE_APPROACH_RATIO = -4000;
const PLANE_FINAL_RATIO = -300;

// Autopilot status (Multiple status)
const STATUS_GROUND = 'GND-';
const STATUS_WAIT_TAKEOFF = 'WAIT-';
const STATUS_WAIT_CLEARENCE = 'WC-';
const STATUS_CLEARENCE_REQUESTED = 'RQ-';
const STATUS_TAXI = 'TAXI-';
const STATUS_HOLDING_POINT = 'HOLD-';
const STATUS_CLEARED_TAKEOFF = 'CT-';
const STATUS_TAKEOFF = 'TO-';
const STATUS_CLIMB_INITIAL = 'CLI-';
const STATUS_CLIMBING = 'CLM-';
const STATUS_DESCENDING = 'DES-';
const STATUS_ARRIVAL = 'ARR-';
const STATUS_DEPARTURE = 'DEP-';
const STATUS_TRANSIT = 'TRA-';
const STATUS_CRUISE = 'CRU-';
const STATUS_RELEASE_WARNING = 'RWG-';
const STATUS_APPROACH = 'APP-';
const STATUS_FINAL_APPROACH = 'FAP-';
const STATUS_FINAL = 'FIN-';
const STATUS_LANDING = 'LDG-';
const STATUS_LANDED = 'LND-';
const STATUS_MISSED_APPROACH = 'MA-';
const STATUS_HOLDING = 'HP-';
const STATUS_HOLDING_OUTBOUND_LEG = 'HO-';
const STATUS_HOLDING_INBOUND_LEG = 'HI-';
const STATUS_INTERCEPTING = 'IN-';
const STATUS_INTERCEPT_STRAIGHT = 'IS-';
const STATUS_INTERCEPT_PROCEDURE = 'IP-';
const STATUS_INTERCEPT_OUTBOUND_LEG = 'IO-';
const STATUS_INTERCEPT_PROCEDURE_TURN = 'IT-';
const STATUS_INTERCEPT_INBOUND_LEG = 'II-';
const STATUS_RADIO_CONTACT_TWR = 'TWR-';
const STATUS_RADIO_CONTACT_ATC = 'ATC-';
const STATUS_RADIO_CONTACT_YOU = 'YOU-';
const STATUS_IDENT = 'ID-';

const STRIP_WIDTH = 410;
const STRIP_HEIGHT = 50;
const STRIP_COLOR = 'rgba(255,255,255,0.8)';
const STRIP_TEXT_COLOR = 'rgba(0,0,0,1)';
const STRIP_HEADER_HEIGHT = 30;

const STRIP_OUT = 1;
const STRIP_WARNING = 2;
const STRIP_RELEASE = 3;
const STRIP_ACTIVE = 4;
const STRIP_SELECTED = 5;

const STRIP_COLOR_OUT = 'rgba(255,255,255,0.8)';
const STRIP_COLOR_WARNING = 'rgba(255,128,128,0.8)';
const STRIP_COLOR_RELEASE = 'rgba(255,180,0,0.8)';
const STRIP_COLOR_ACTIVE = 'rgba(128,255,128,0.8)';
const STRIP_COLOR_SELECTED = 'rgba(255,255,0,0.8)';

const PLANE_ATC_ACTIVE = 1;
const PLANE_ATC_ARRIVAL_WARNING = 2;
const PLANE_ATC_ARRIVAL_RELEASE = 3;
const PLANE_ATC_DEPARTURE_WARNING = 4;
const PLANE_ATC_DEPARTURE_RELEASE = 5;
const PLANE_ATC_OUT = 6;

const CONSOLE_HEIGHT = 200;

const HEADER_COLOR = 'rgba(255,255,0,0.8)';

const MILESFACT = 1500;
const MAX_LATLONG_RND = 0.5;

const NAVAID_TYPE_VORDME = 1;
const NAVAID_TYPE_VOR = 2;
const NAVAID_TYPE_NDB = 3;
const NAVAID_TYPE_VORDMENDB = 4;
const NAVAID_TYPE_TACAN = 5;
const NAVAID_TYPE_ILS_CAT_1 = 6;
const NAVAID_TYPE_ILS_CAT_2 = 7;
const NAVAID_TYPE_ILS_CAT_3 = 8;
const NAVAID_TYPE_ILS_OM = 9;
const NAVAID_TYPE_ILS_MM = 10;
const NAVAID_TYPE_ILS_IM = 11;
const NAVAID_TYPE_RWY = 12;
const NAVAID_TYPE_ROUTE_FIX = 13;

const FIX_BODY_COLOR = 'rgba(0,255,0,0.4)';
const FIX_TEXT_COLOR = 'rgba(170,170,255,0.8)';
const CONSOLE_COLOR = 'rgba(0,0,0,1)';
const CONSOLE_SWITCH_WIDTH = 20;
const CONSOLE_SWITCH_HEIGHT = 10;
const CONSOLE_SWITCH_ON_COLOR = 'rgba(50,255,50,1)';
const CONSOLE_SWITCH_OFF_COLOR = 'rgba(255,255,255,1)';
const CONSOLE_WHITE = 'rgba(255,255,255,1)';

const RWY_BODY_COLOR = 'rgba(80,255,80,0.5)';
const RWY_INACTIVE_BODY_COLOR = 'rgba(255,80,80,1)';
const RWY_LANDING_BODY_COLOR = 'rgba(80,80,255,0.5)';
const RWY_TAKEOFF_BODY_COLOR = 'rgba(255,255,80,1)';

const RWY_TEXT_COLOR = 'rgba(170,170,255,0.8)';
const RWY_CENTERLINE_COLOR = 'rgba(80,80,255,0.5)';
const RWY_CENTERLINE_LENGTH = 10; // Nautical miles

const INTERCEPT_MODE_STRAIGHT = 'STRAIGHT';
const INTERCEPT_MODE_PROCEDURE = 'PROCDEURE';
const INTERCEPT_MODE_OUTBOUND_LEG = 'OUTBOUND_LEG';

const GRID_COLOR = 'rgba(80,80,255,0.2)';
const HOLDING_COLOR = 'rgba(80,80,255,0.2)';
const ATS_COLOR = 'rgba(80,80,255,0.4)';

const ROUTE_TEXT_COLOR = 'rgba(255,255,0,0.8)';
const ROUTE_BOX_COLOR = 'rgba(0,0,0,0.7)';

const MSG_FROM_PLANE = 'FROM_PLANE';
const MSG_TO_PLANE = 'TO_PLANE';
const MSG_FROM_TWR = 'FROM_TOWER';
const MSG_FROM_ATC = 'FROM_ATC';
const MSG_ERROR = 'ERROR';
const MSG_TO_TWR = 'TO_TOWER';
const MSG_TO_ATC = 'TO_ATC';

const MSG_COLOR = 'rgba(255,255,255,1)';
const MSG_BAR_COLOR = 'rgba(128,128,128,0.5)';
const MSG_BAR_COLOR_ERR = 'rgba(255,80,80,0.5)';
const MSG_BAR_COLOR_1 = 'rgba(255,255,128,0.5)';
const MSG_BAR_COLOR_2 = 'rgba(128,255,128,0.5)';
const MSG_BAR_COLOR_3 = 'rgba(128,128,255,0.5)';
const MSG_BAR_COLOR_4 = 'rgba(80,255,255,0.5)';

const MSG_BAR_DELAY = 15;       // Auto hide of message after xx seconds

const CLOCK_BAR_COLOR = 'rgba(255,255,255,0.8)';
const CLOCK_COLOR = 'rgba(50,50,50,1)';

var LATITUDE_CENTER = 0;
var LONGITUDE_CENTER = 0;

var SCREEN_CENTER_X = 512;
var SCREEN_CENTER_Y = 384;

var MIN_LATITUDE = 0;
var MAX_LATITUDE = 0;
var MIN_LONGITUDE = 0;
var MAX_LONGITUDE = 0;

var PLANE_REFRESH_SECONDS = 0.8;