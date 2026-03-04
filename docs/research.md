TEUI Framework Evolution
The TEUI methodology has evolved through four versions, each progressively more comprehensive. TEUI1 (v1.0) was a very simple post-occupancy benchmarking tool: it only required a building’s annual energy use (electricity, gas, etc.) and its floor area to compute TEUI = Energy/Area[1][2]. It was intended for existing buildings (especially Part 9 projects) where no energy model was done, giving an objective energy-and-carbon intensity metric (TEUI and operational GHGI) from utility bills[1][2]. Typical users were architects and homeowners seeking a quick audit after occupancy.
By contrast, TEUI2 (v2.0) (launched 2023) expanded the scope. It targets larger, Part 3 buildings and early-stage design analysis[3][4]. In addition to total energy and TEUI, TEUI2 added inputs for building statistics (occupancy, system efficiency, indoor air quality) and even embodied carbon, enabling design-oriented performance evaluation and code-compliance comparison[3]. The UI is more complex and aimed at architects/engineers with some technical knowledge. TEUI2 still gives TEUI and GHGI, but lets users “change data to see how the information changes” – e.g. isolate the TEDI component or adjust insulation to meet targets[5][4]. It remains a static calculator (spreadsheet/web form) used during concept and detailed design to set targets or compare against code benchmarks.
The planned TEUI3 (v3.0) represents a further shift toward integrated design‑to‑performance modeling. According to the OAA, TEUI3 is envisioned as a code compliance tool comparing proposed design against new energy codes (NECB/NBC)[6]. In practice, the OpenBuilding “OBJECTIVE v3” platform (also called TEUIv3) delivers a static energy model that combines a Reference Model (code minimum), a Design/Target Model, and – uniquely – an Actual Model based on utility data[7][8]. TEUIv3 (launched late 2024) lets architects iteratively define envelope, loads, ventilation, etc., and immediately see predicted TEUI, TEDI and GHGI for each case, with built-in calibration to actual performance[7][8]. Its primary use case is post-occupancy review and performance gap analysis, as well as more accurate early-stage estimation. Typical users include architects and building officials who want to close the gap between modeled and actual energy use[9][7].
TEUI4 (v4.0) is the new full-stack web application (branded OBJECTIVE). It builds on v3’s static model but adds real-time dual‐model comparisons, interactive Sankey and energy-balance visualizations, and optimization tools. TEUI4 is explicitly for architects at the earliest design stages: it lets them sketch simple building geometry and rapidly test options (insulation, glazing, orientation, renewables) with instant feedback[10][11]. Under the hood, TEUI4 maintains Reference, Target, and Actual energy models in parallel, calibrated to real utility data[11][10]. It also integrates full carbon accounting (Scope 1/2/3) via Sankey diagrams[12][10]. Typical users are designers seeking early decision support – for example, to compare cost/benefit of insulation vs heat pump efficiency – long before detailed energy models or building permits. TEUI4 is effectively an advanced energy balance toolkit that can handle code compliance scenarios, early design iterations, and even tracking performance after occupancy[11][10].
These versions reflect the OAA/OpenBuilding ecosystem’s evolution: from simple benchmarking (TEUI1) through added features (TEUI2), to sophisticated modeling (TEUI3) and finally a unified BEM platform (TEUI4) that ties together design targets and actual performance.
TEUI Version Purpose Use Case Users Building Stage
TEUI1 (v1.0) Simple energy intensity benchmarking Existing buildings; quick post-occupancy audit[1][2]
Architects, homeowners Built/commissioned (utility bills available)
TEUI2 (v2.0) Expanded performance calculator (TEUI, TEDI, GHGI, embodied C)[3]
Early design or compliance analysis (especially larger buildings)[3]
Architects, engineers (informed users) Concept/detailed design
TEUI3 (v3.0) Integrated design vs actual modeling (energy balance + carbon)[7][8]
Mid-design review and post-occupancy validation (closing gap) Architects, engineers, building officials Late design & post-occupancy
TEUI4 (v4.0) Advanced web-based BEM platform (real-time Ref/Target/Actual models)[10][11]
Early-stage design optimization; code compliance; whole-life analysis Architects, energy analysts Conceptual design & code submission
Calculation Models
Each TEUI version computes total energy intensity (and related metrics) but with increasing complexity:
Basic TEUI formula (all versions):
TEUI="Annual building energy use (all sources)" /"Building floor area"  (〖kWh/m〗^2 "/yr" ).
In practice, all energy sources (grid electricity, gas, oil, wood, etc.) are converted to equivalent kWh (kWhₑ) before summing[13]. For example, natural gas in m³ is converted using 0.0373 GJ/m³ and then 277 kWh/GJ[13]. Wood or other fuels use their own kWh/m³. Onsite renewable generation (PV, wind, solar heat, “green” gas offsets, etc.) are subtracted from the total (net TEUI) as per the standard[14]. The model also typically subtracts any Green Energy Certificates or carbon offsets as carbon-removing factors.
Energy inputs:
Deterministic inputs: annual electricity (kWh), gas (m³), oil (L) consumptions; building area (m²)[13][14].
Assumption-driven inputs: system COPs/efficiencies, ventilation rates, internal heat gains, etc., which may be set to defaults or user-specified (in TEUI2+).
Unit conversions/assumptions:
Gas: 1 m³ = 0.0373 GJ[13], 1 GJ = 277 kWh[13].
CO₂ factors: 1 m³ gas ⇒ 2.63 kgCO₂[15]; 1 kWh (Ontario grid) ⇒ 0.00004 MTCO₂[15]. (These are built-in assumptions.)
Others: heating degree days (HDD) and cooling degree days (CDD) from weather data are often used to estimate heating/cooling loads in TEUI3/4.
Derived metrics:
GHGI (GHG Intensity): Sum of all energy‐related GHG (Scope 1+2) per area (kgCO₂e/m²). Calculated by multiplying each energy source by its emission factor and dividing by area[15].
TEDI: Thermal Energy Demand Intensity (annual heating + DHW energy needed per m²) is isolated from total losses via energy balance (see Dependencies below).
Other outputs: TEUI tools often also compute site EUI vs. benchmark (% of code or national average), carbon per occupant, water-energy metrics, etc., using fixed constants or reference data. TEUI2’s web tool, for example, shows “% of national average” for TEUI and GHGI based on static benchmarks.
Energy-balance calculations (TEUI3/4): In the more advanced models, the building’s energy balance is explicitly computed. For example:
Envelope Heat Loss = ∑(U_i·A_i)·ΔT + Ventilation Losses + Infiltration Losses
Internal Gains = Occupants + Lighting + Equipment + Solar Gains
Net Heating Demand = Envelope Loss + Ventilation Loss – (Internal Gains + Solar Gains)
Heating Energy = Net Heating Demand / Heating System COP
Cooling Demand = [Envelope Cooling Load + Internal Gains + Solar Gains – any free cooling]
Cooling Energy = Cooling Demand / Cooling System COP
Electricity Loads = Lighting energy + Equipment energy + Circulation fans, etc.
Total Energy Use = Heating Energy + Cooling Energy + Electricity Loads
TEUI = Total Energy Use / Area.
Some parts are deterministic (U·A ΔT losses), while others are assumptive (how useful solar gains are, ventilation effectiveness, occupant schedules). TEUI tools then apply typical climate data (HDD/CDD) to scale heating/cooling.
Example calculation (TEUI1): If a building uses 20,000 kWh electricity and 10,000 m³ gas (≈10,000×277=2.77×10^6 kWh) in a 1,000 m² building, TEUI = (20,000 + 2,770,000) / 1,000 = 2,790 kWh/m²/yr. Converting to TEUI as “energy equivalent” (including all sources) and dividing by area[1][13].
Deterministic vs. assumption-driven parts: Summing known energy uses and area is deterministic. Converting units uses fixed factors[13]. In the more detailed tools, the split between heating and cooling loads or assigning energy to envelope vs HVAC is based on assumptions and simplified (e.g. linear HDD correlation【75†】). The TEUI and GHGI formulas themselves are algebraic, but many intermediate factors (internal gains effectiveness, ventilation rates, schedule assumptions) are by necessity approximate.
Input Schema for Each Calculator
Below is a structured list of the key inputs for each TEUI calculator version. Fields marked required must be provided; others have defaults or can be zero.
TEUI1 (v1.0):
building_area (number, m², required) – conditioned floor area.
electricity_use (number, kWh/year, required) – annual grid electricity consumed.
natural_gas_use (number, m³/year, default 0) – annual natural gas volume.
fuel_oil_use (number, litres/year, default 0) – annual heating oil.
wood_use (number, m³/year, default 0) – annual cordwood (if any, converted at ~1000 kWh/m³).
[Optional] other_fuel_use – other fuels (e.g. propane) can be included by conversion.
All inputs convert to kWh-equivalents internally.
TEUI2 (v2.0): (Inputs as seen on the OAA web form)
major_occupancy (enum, e.g. Assembly, Institutional, Residential, etc., required).
climate_location (enum, Ontario city/zone, required) – used for benchmarking and TEDI rules.
compliance_standard (enum, e.g. OBC/SB12 Tier, NBC Tier, SB-10, “Self-Reported”) – affects reference comparisons.
occupant_count (integer, people, default 0) – building population.
building_area (number, m², required) – gross floor area.
project_reference (string, optional) – project name or ID.
operational_emissions (number, MTCO₂e/yr, default 0) – if known from other analysis (the tool also computes its own).
electricity_use (number, kWh/yr, default 0).
natural_gas_use (number, m³/yr, default 0).
fuel_oil_use (number, litres/yr, default 0).
Renewable offsets:
pv_generation (number, kWh/yr, default 0) – onsite solar.
wind_generation (number, kWh/yr, default 0).
geothermal_output (number, kWh/yr, default 0) – ground-source heat.
offsite_RECs (number, kWh/yr, default 0) – green electricity certificates purchased.
wind_solar_offset (number, kWh/yr, default 0) – e.g. WWS grid intensity offset.
green_gas (number, m³/yr, default 0) – renewable natural gas volume.
Water use & IAQ: (ancillary inputs)
water_use (number, litres/yr, default 0).
indoor_air_quality (enum: Good/Fair/Poor).
radon_level (number, Bq/m³, default typical).
co2_ppm (number, ppm, default typical).
tvoc_ppm (number, ppm).
relative_humidity (%).
Code parameters: (optional) Building average U-value, HDD/CDD (fetched from climate location), etc.
(All numeric fields typically default to 0 or a “national average” if not specified.)
TEUI3 (v3.0, OBJECTIVE v3) – Static Model:
The OBJECTIVE/TEUI3 tool uses dozens of inputs. Key categories include:
Building info: conditioned_floor_area (m²), volume (m³), num_floors, orientation, etc.
Climate: heating_degree_days, cooling_degree_days (annual HDD/CDD based on location), plus design temperatures.
Occupancy: occupancy_type (Residential, Office, etc.), occupancy_count (people), occupancy_schedule (hours or fraction).
Internal loads: lighting_power_density (W/m²), plug_load_density (W/m²), and schedules (hours/day, utilization factor).
Envelope: U-values or R-values for walls, roof, windows, doors, area of each component, window-to-wall ratio. Thermal mass/capacitance factors.
Ventilation/Infiltration: ventilation_rate (L/s·pp or ACH), with or without heat recovery (ER/HX efficiency). infiltration_rate (ACH).
HVAC Systems: space_heating_COP (or efficiency), cooling_COP (EER/SEER), DHW_efficiency, HVAC_efficiency (distribution losses).
Thermostats: heating_setpoint (°C), cooling_setpoint (°C), setback schedules.
Domestic hot water loads: dhw_load_per_capita (L/day/person or kWh/m²).
Renewables: PV size or annual PV output, any other generation (kW or kWh per year).
Embodied carbon: (optional) per area or material inputs for whole-life GWP.
Each input has units (e.g. W/m², ACH, °C, etc.) and default values drawn from standards (e.g. default ventilation 1 ACH, default COP=1 for baseline). All fields are required in the spreadsheet but many can use typical values; some (like geometry) may be auto-importable from BIM.
TEUI4 (v4.0, OBJECTIVE web app):
TEUI4 reuses essentially the same input schema as TEUI3, with some UI enhancements. In the web app, inputs are grouped into steps (Project Info, Envelope, Loads, Systems, Renewables). Key fields include those listed above, plus:
Detailed geometry (wall/roof/window areas and orientations) or approximate zone shapes.
Breakdowns by story or zone (if desired).
Advanced systems (e.g. multi-speed fans, economizers, decoupled ventilation).
Real-time utility data import (for the “Actual” model) – user can upload past year of meter readings to calibrate.
All inputs are numerical or categorical, with clear units displayed. Fields that can be derived from others (e.g. CDD/HDD from location) are often auto-populated. By design, most inputs have default or reference values so that a complete input is achievable without exhaustive data, but user can override any assumption.
Data Flow and Dependencies
The TEUI calculation follows a simplified energy balance: all energy inputs (heating, cooling, plug loads, etc.) must be supplied by the sources, offset by any gains. Key dependencies are:
Envelope & Climate → Thermal Losses: Envelope U-values (walls, roof, floor, windows) and areas, plus temperature difference (from HDD), determine the transmission losses. In colder climates (high HDD), heat loss scales roughly as U·A·HDD. Likewise, hot climates (CDD) drive cooling losses.
Ventilation/Infiltration → Losses: Ventilation rate (L/s·pp or ACH) and air-leakage rate cause additional heating demand: lost heat must be resupplied. These losses depend on ΔT and flow rate (q·Cp·ΔT), so they scale with climate too. (In TEUIv3/4 the tool often separates ventilation losses out of TEDI to analyze influence.)
Occupants & Equipment → Internal Gains: People, lighting, and plug appliances emit heat. Occupant and equipment gains reduce heating demand but increase cooling demand. The useful fraction of these gains (and their schedules) is partly an assumption.
Solar Gains → Gains/Losses: Sunlight through windows provides solar heat gain. In winter this offsets heating; in summer it adds to cooling load. The calculation uses solar irradiance (by month) × glazed area × SHGC.
Energy Balance:
"Net Heating Demand"="Envelope Losses"+"Ventilation Losses"-("Internal Gains" +"Solar Gains" ).
"Net Cooling Demand"=("Envelope Cooling Gain" +"Ventilation Gain" +"Solar Gains" +"Internal Gains" )-"any Passive Cooling Gains".
(In practice TEUI tools approximate this algebraically rather than hour-by-hour.)
System Efficiencies → Energy Use: The net heating demand divided by heating system COP (or efficiency) gives the fuel (or electric) energy needed. Similarly, cooling demand/COP gives cooling electricity. Any fan energy (for ventilation) and pump energy may also be added.
Electrical Loads: Total electrical energy = lighting + equipment + plug + HVAC fan/coils + cooling. Total non-electric energy = gas/oil for heating and DHW (if gas boiler/DHW used).
Summation → TEUI: Finally, sum all energy carriers (converted to kWhₑ) and divide by area. That yields TEUI. (GHGI is then computed by applying emission factors to each carrier and dividing by area.)
Primary drivers: Climate severity (HDD/CDD) is the single biggest driver of TEUI, as it sets thermal losses【75†】. Envelope insulation (U-values) and infiltration rates determine how climate translates to energy demand. Occupant density and equipment loads have second-order effect (since they mostly shift demand between heat and cool). HVAC efficiency scales the net demands to required energy. In a dependency graph:
Climate (HDD/CDD)
↓
Envelope U-values & Area → Transmission Losses
Ventilation/Infiltration rates → Ventilation Losses
Occupant/Schedule & Equipment loads → Internal Gains
Window area & SHGC & climate → Solar Gains
↓ (combine above)
Net Thermal Demand (heating/cooling)
↓ apply system efficiency
Heating/Cooling Energy
↘
Electric base loads
↓
Total Energy Use → TEUI
The largest impacts come from reducing envelope losses (insulation, air sealing) and improving HVAC efficiency, but also from controlling internal gains in summer (shading, efficient lighting). The interplay is often visualized in an energy balance diagram or Sankey chart, which shows how much of the input energy goes to losses vs. useful loads. For example, Figure:

Figure: Monthly building electricity use vs. heating-degree-days (HDD) from an OBJECTIVE TEUIv3 case study. The nearly linear correlation illustrates that in this case the heating load scales directly with HDD and building envelope heat-loss parameters (regression R²≈1). This underpins the TEUI energy balance: in colder climates the building requires roughly proportional heating energy, while internal/solar gains have lesser seasonal variation【75†】.
Existing Tools Analysis
We examined the current TEUI implementations:
OAA TEUI1 (teui1.ca): A web app/spreadsheet that simply asks for energy use and area. The UX is minimal but extremely limited: only a few inputs (bills and area) with no guidance or saving. There is no project management, no “Undo,” and no transparency of how assumptions (e.g. unit conversions or emission factors) are applied. Users must manually enter numbers, with no integration of location or building data. Its outputs (TEUI and GHGI) are clear but it offers little context. In short, very low friction (few inputs) but low capability. It also lacks any data retention or history (each session is one-off).
OAA TEUI2 (teui2.ca): A richer web form that includes dozens of fields (occupancy, building size, renewables, IAQ, etc.) as shown above. UX & workflow: The interface is busy and data-heavy. Users must tab through many inputs; only some fields are pre-filled or default (e.g. some outputs show “20%” of average). There is no way to save a project other than downloading the PDF/XLS factsheet, so all data entry is repeated each time. The form logic is opaque – for example, the meaning of “Project Reference” or how the “Compliance Standard” dropdown affects outputs is not explained on screen. Calculation transparency is low: behind the scenes it must sum and convert the inputs, but these formulas aren’t shown to the user (and some entries like “WWS Electricity” or “Embedded Carbon” are confusing without documentation). The limitations include risk of input error (no validation), and the tool is only available online (no offline mode).
TEDI Portion (teui2.ca): The TEDI (heating demand) section of TEUI2 is marked “experimental” on the site[16]. It computes a simplified TEDI and peak heat loads from the same inputs, but warns it is not a substitute for a true HVAC analysis. In practice, users noted that isolating TEDI from partial data is extremely error-prone.
OpenBuilding OBJECTIVE TEUI3 (web/spreadsheet): The spreadsheet (TEUIv3) and its upcoming web interface provide much more sophisticated modeling. UX: The Excel version is organized in worksheets; setting it up requires some BIM data import or careful entry of envelope and loads. The web app (OBJECTIVE) is more user-friendly, with clearly grouped steps and interactive sliders. It does allow saving/loading projects and visualizes results (Sankey, charts, tables). Workflow: Users still must enter many parameters (though defaults and presets speed this). The calculation transparency is better documented (the spreadsheet links to an “Info” sidebar). However, it is fundamentally a static annual model (no hourly simulation), so its accuracy depends on calibration. The open model has been peer-reviewed, but requires user understanding of building science.
Current issues: All existing tools share some drawbacks: they require manual data entry (no GIS or BIM linkage), they don’t auto-populate even basic inputs (e.g. climate zone from address), and they offer no iterative design assistance. None have robust project management (database of buildings) or collaboration features. The OAA tools also do not reveal underlying code or allow direct inspection of formulas. In short, they provide outputs but not an explanatory workflow.
Software Architecture Abstraction
A modern TEUI platform should be modular. We envision a core calculation engine with pluggable TEUI version modules, supported by shared data services and a flexible data model. For example:
Data Model (“Building”): Define a canonical schema for a building/project, covering:
Geometry/Area (floor areas, volumes)
Location (city, lat/lon, climate zone)
Occupancy profile (type, people count, schedules)
Envelope (areas, U-values/R-values for walls, roofs, windows; air tightness)
Internal Loads (lighting power density, equipment density, occupancy gains)
Mechanical Systems (heating type/COP, cooling COP, ventilation type & rate, heat recovery)
Energy Sources & Generation (fuel mix, onsite renewables, grid emissions factor)
Construction & Embodied (floor area, material database for embodied carbon/GWP)
Utility Data (optional actual consumption for validation).
This unified schema would be the single source of truth for all TEUI modules.
TEUI Calculation Engines: Implement separate modules for each version’s logic, all reading from the same data model:
TEUI1 Module: Very simple, just sum up consumption fields from the data model and divide by area, applying unit conversions[13][14].
TEUI2 Module: Reads relevant fields (including occupancy, building standards, renewables, etc.) and executes the extended formulas (including carbon, embodied C) coded in the TEUI2 spec.
TEUI3 Module: Performs the static energy balance calculation: computing heat losses from envelope+ventilation minus gains, splitting heating/cooling loads, applying COPs, etc. (It would use climate data from the Location fields to get HDD/CDD).
TEUI4 Module (OBJECTIVE): A real-time engine that simultaneously runs a Reference model (code-minimum assumptions) and a Target/Design model with user’s inputs. It also supports an Actual mode (taking utility bills from the data model as “source of truth”). TEUI4 would implement dynamic recalculation on input change, and generate Sankey/graphs.
Each engine would output metrics (TEUI, TEDI, GHGI, etc.) in a common format.
Shared Services:
Unit Conversion Service: Convert units (e.g. m³→kWh, etc.) using updatable factors[13].
Climate Data Service: Provide HDD, CDD and other location-based data (e.g. typical meteorology) via API or database.
Benchmark Database: National/provincial benchmark values for TEUI, GHGI, energy codes (SB-10, SB-12, NECB/NBC tiers) for comparison.
Energy Balance Helpers: Algorithms for degree-day modeling, solar gain coefficients, default schedules.
Carbon Factors: A library of emission factors (electric grid by province and year, fuel factors) and embodied carbon coefficients per material.
Future metrics support: The same architecture can incorporate other metrics:
TEDI Engine: Could compute the thermal demand intensity (kWh/m² heating only) by summing just the heating portion of the energy balance.
GHGI Engine: Already integrated but could be extended for Scope 3 whole-life carbon (building materials).
Additional metrics like net-zero renewable fraction could be added as additional output “dashboards”.
Because all calculators map to the same building schema, the UI only needs to collect each input once. The TEUI modules then compute the various metrics from that unified data. This avoids duplication: e.g. the area or occupants field is defined one time, but all engines (v1-v4) can use it.
Ideal User Journey
An architect using the new TEUI platform might follow this streamlined workflow:
Project Setup: Enter project name and address (or click on map). The system auto-derives location, climate zone, and timezone[10]. It may auto-fill building footprint or area by connecting to GIS/cad (where available). It can suggest building type (occupancy) from municipal records or user selection.
Building Metadata: Confirm or enter building characteristics: occupancy type (e.g. “Office”), number of stories, total conditioned area, occupancy count. These are largely auto-saved for the project. The user can also set project goals (target TEUI or code tier).
Energy Inputs (Actuals): Optionally, upload past 12 months of utility bills (electricity, gas, oil). The platform reads meter values to pre-fill the “Actual model” fields. If actual data isn’t available (design case), skip or use estimate from code-min baselines.
Design Parameters: Walk through panels for Envelope, Loads, Systems, Renewables:
Envelope: Input or import wall/roof/window areas and U-values, glazing %, air tightness. Sliders or presets can set typical values for “Code-min”, “current design”, or “target design”.
Internal Loads: Choose or override default lighting watts/m², equipment loads, plug loads, and schedules.
Ventilation/Air: Set ventilation standard (L/s·pp or ACH) and heat-recovery efficiency. The UI can explain trade-offs (e.g. better HRV cuts heating load).
Systems: Select heating/cooling/DHW systems and their efficiencies (COP, HSPF, AFUE). Defaults can come from code or equipment database.
Renewables: Specify PV panel capacity or expected kWh, plus any other on-site generation or green power purchase.
As each section is completed, the app can show a mini-summary (e.g. “Envelope loss ↓ 20% TEUI”). Users are guided with contextual help (e.g. what is an R-value).
Results & Benchmarks: The app immediately calculates Reference, Design, and (if data exists) Actual TEUI, TEDI, GHGI. Results appear in dashboards:
Energy Flows: Sankey or bar charts showing how energy is supplied (electricity vs fuel, renewables offset) and lost (transmission, ventilation, internal gains).
Key Metrics: TEUI, TEDI, GHGI with comparisons (e.g. “Design TEUI = 50 kWh/m² (40% below national average)” or vs. code limits).
Scenario Tuning: Sliders allow real-time tweaking (e.g. bump R-wall from R-20 to R-30) and see TEUI change.
Throughout this journey, redundant entry is minimized. For example, entering the address auto-fills climate HDD/CDD and is used in all later calculations. Any data that can be pulled (building type from tax rolls, floor area from permit drawings, average weather) is auto-filled to save effort. The architect sees results at each step, keeping motivation high.
UI Design Principles
To handle complex energy modeling intuitively, the UI should follow these principles:
Progressive Disclosure: Show only essential inputs first; hide advanced options behind “Advanced” toggles or subsequent screens. For example, step 1 may ask only for occupancy and area; step 2 adds envelope detail; step 3 shows mechanical options. This avoids overwhelming users initially.
Contextual Help & Defaults: Each input has a brief description or tooltip. Default values are pre-filled from climate or code. For example, when choosing “Office” occupancy, default plug/load densities appear but can be adjusted. Explanations (e.g. “U-value in W/m²·K”) help beginners.
Visual Energy Flows: Use Sankey diagrams to illustrate how total energy splits into uses and losses. For example, a Sankey showing electrical vs fuel input, then how much goes to heating, cooling, losses, renewables. Such graphics make the abstract TEUI number concrete[17]. Interactive charts (e.g. bar graphs or donut charts) can compare the project’s TEUI to benchmarks (like national average, Passive House target, etc.).
Benchmark Comparisons: Graphs or gauges should show how the building stacks up: e.g. a bar chart of TEUI vs. code maximum and vs. top-performing peers. Color coding (green/yellow/red) highlights problem areas.
Immediate Feedback: Changes to inputs instantly update results on-screen. Sliders for key parameters (wall R-value, window area fraction, heat pump COP) can allow “what-if” exploration. For example, dragging an R-value slider could immediately show TEUI dropping, reinforcing the effect.
Workflow Visual Cue: Show user progress steps or tabs (e.g. “1. Project Info → 2. Envelope → 3. Loads → 4. Systems → 5. Results”) so users know where they are. Disable “Next” until mandatory fields are entered.
Energy Balances & Tradeoffs: For architects to grasp tradeoffs, visualizing losses vs gains is critical. The platform can, for example, overlay graphs of heating vs cooling demand or show a “balloon diagram” of how internal and solar gains offset losses. Sankey diagrams highlight how much energy a given intervention saves.
Accessibility & Clean Layout: Use clear labels (e.g. “Wall insulation (R-value)”), avoid jargon, and provide unit selectors. The UI should be responsive and mobile-friendly where possible.
By combining a step-by-step flow with rich visualizations (Sankeys, bar/gauge charts, benchmarks), the interface guides the user through complex inputs without getting lost. Explanations (e.g. “reducing air leaks here cuts heating load”) and live charts make the physics transparent. As one OpenBuilding article notes, presenting energy flows “as a picture” dramatically aids understanding[18][10].
Sources
The above analysis is based on published OAA/OpenBuilding documentation and tools. Key references include the OAA’s TEUI calculator descriptions[3][2], the OpenBuilding OBJECTIVE tool documentation[1][7][10], and the OpenBuilding Simple TEUI page and conversion factors[19][14]. The energy balance and UI recommendations draw on the stated design of these tools[8]【75†】. These sources fully informed the calculation formulas, input lists, and UX workflow described above.

---

[1] [4] [7] OBJECTIVE v4 – openbuilding
https://openbuilding.ca/objective/
[2] [3] [5] [6] OAA introduces new climate-action weapon, the TEUI 2.0 calculator
https://canada.constructconnect.com/dcn/news/infrastructure/2023/08/oaa-introduces-new-climate-action-weapon-the-teui-2-0-calculator
[8] [18] OBJECTIVE TEUI3 and Occam’s Razor – openbuilding
https://openbuilding.ca/2024/07/24/teui3-and-occams-razor/
[9] (PDF) Curriculum Vitae
https://www.researchgate.net/publication/400485968_Curriculum_Vitae
[10] [11] [12] [17] Revolutionize Building Design with OpenBuilding OBJECTIVE Tool
https://openbuilding.ca/2025/11/29/objective-4-012-now-available-in-beta/
[13] [15] [19] Simple TEUI Calculator – openbuilding
https://openbuilding.ca/tools/teui-calculator/
[14] OAA TEUI Calculator | cove.tool Help Center
https://help.covetool.com/en/articles/5214445-oaa-teui-calculator
[16] TEUI & TEDI Calculator for Buildings or Homes | OAA
https://www.teui2.ca/
