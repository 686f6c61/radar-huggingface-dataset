# zengyh29/g1-thermal-safety-filters

## Resumen

G1 thermal safety filters es un conjunto de tres filtros de seguridad basados en modelos del mundo (world models) para el robot humanoide Unitree G1, desarrollado por el usuario zengyh29 y publicado bajo el ecosistema mjlab. El problema que aborda es la seguridad térmica y la estabilidad en control robótico: en cada paso de control a 50 Hz, un filtro decide si mantiene la acción propuesta por la política de tarea o si cede el control a una política de respaldo (fallback) entrenada con SHAC. La decisión se toma imaginando en un modelo del mundo aprendido la secuencia "propuesta durante un paso, luego fallback" durante un horizonte H y activando el filtro cuando el peor margen de seguridad predicho se acerca al umbral calibrado épsilon.

El paquete incluye tres variantes (`joint`, `fall_only_cbf` y `separate`) que difieren en cómo se predice el margen de seguridad: una red conjunta que predice movimiento y temperaturas, una red que solo aprende el margen de caída con un CBF térmico que recorta el par, o una red de movimiento combinada con un modelo térmico de identificación de sistema (sysID) que calcula el margen exacto. La seguridad se define como ausencia de caída y ausencia de sobrecalentamiento de los devanados del motor por encima de 70 °C.

El repositorio tiene un tamaño de 0,2 GB, no registra descargas ni likes, y está orientado a investigación en robótica con MuJoCo Warp y mjlab, no a inferencia de lenguaje. No es un modelo de lenguaje: es un artefacto de control robótico compuesto por checkpoints de política, modelos del mundo, normalizadores y ficheros de calibración conformal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política SHAC (actor-crítico) con modelo del mundo aprendido y filtro de seguridad conformal; mundo simulado en MuJoCo Warp / mjlab |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 3 s (no liberado) y pasos de control a 50 Hz |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.zip` y `.pt`, no cuantizados) |
| Idiomas soportados | no aplica (control robótico, sin capacidades de lenguaje) |
| Licencia | other |
| Formato de pesos | `final_model.zip` (SHAC run), `tensornormalize.pt`, `config.yaml`, `g1_sysid.json`, `manifest.json`, `tubes/*.json`, `layouts/*.json` |

## Arquitectura y entrenamiento

El sistema se compone de una política de respaldo entrenada con SHAC (un algoritmo de actor-crítico para control seguro) que incluye su propio modelo del mundo y crítico, junto con un filtro de seguridad que en cada paso de 50 Hz evalúa la propuesta de la política de tarea. El filtro imagina en el modelo del mundo aprendido la secuencia "propuesta un paso, luego fallback" durante H segundos y activa el fallback cuando el peor margen de seguridad predicho cae dentro del umbral calibrado épsilon respecto a cero. La calibración del umbral se realiza mediante cotas conformales, almacenadas en los ficheros `tubes/*.json` junto con el registro de calibración.

Las tres variantes difieren en la predicción del margen: `joint` usa una red que predice movimiento y temperaturas, con una cabeza que aprende min(caída, (70 − devanado más caliente)/10); `fall_only_cbf` usa un mundo de barrera donde un CBF de temperatura por motor recorta el par bajo cualquier controlador, y la cabeza solo aprende el margen de caída; `separate` usa una red que predice movimiento y un modelo térmico sysID que calcula las temperaturas y el margen térmico de forma exacta. `joint` y `separate` comparten los checkpoints `thermal70` (sin reentrenamiento), mientras que `fall_only_cbf` usa los checkpoints `thermal_cbf`. El entorno requiere el robot sysID con `MotorThermal` (devanado, carcasa, estructura), grupos de observación del actor (127-D) y crítico (171-D), contexto de simulación de 33-D, y el término de acción `joint_pos` de 29 articulaciones a 50 Hz sobre 4 pasos de física de 5 ms.

## Capacidades

- Control robótico seguro del Unitree G1 con filtrado en tiempo real a 50 Hz.
- Predicción de márgenes de seguridad (caída y sobrecalentamiento de devanados) mediante modelos del mundo aprendidos.
- Conmutación automática entre política de tarea y política de respaldo (fallback) basada en cotas conformales calibradas.
- Tres modos de predicción de margen: conjunto (movimiento y temperatura), solo caída con CBF térmico, y separado con modelo térmico exacto.
- Verificación de integridad del entorno y de los ficheros contra `manifest.json` y `layouts/`, con parada ante discrepancias.
- Soporte de opciones de filtro configurables por CLI de entrenamiento (semilla, dwell, latch).
- No dispone de capacidades de generación de texto, código, visión, tool calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Investigación en control seguro de humanoides: el filtro permite entrenar y evaluar políticas de seguimiento de trayectorias (walk-tracking) con garantías de no caída y no sobrecalentamiento, usando las cuatro variantes del entrenamiento walk4 en `g1_safety_porl`.
- Despliegue de políticas de tarea con respaldo ante perturbaciones: ante patadas o empujes (kicks), el filtro cede el control al fallback cuando el margen predicho se acerca a cero, mejorando la supervivencia del 47,6 % al 88,5 % en la variante `separate` con latch.
- Monitorización térmica de motores en simulación: la variante `separate` calcula temperaturas exactas con el modelo sysID, útil para validar límites de 70 °C antes de transferir a hardware.
- Evaluación comparativa de estrategias de seguridad: los tres filtros y sus configuraciones (wmmin, dwell, latch) permiten estudiar el compromiso entre supervivencia y sobrecalentamiento en un mismo conjunto de perturbaciones.
- Integración en pipelines de entrenamiento con mjlab: los scripts `train_wm.py` y `wm_train.sbatch` permiten lanzar barridos de semillas y variantes con verificación automática de bindings.
- Validación de identificación de sistema (sysID): el fichero `g1_sysid.json` y la comprobación de hashes permiten asegurar que el filtro se ejecuta sobre el mundo térmico para el que fue entrenado.

## Benchmarks y rendimiento

Resultados publicados en la model card para seguimiento SONIC con patadas (3 semillas × 1.024 patadas, mismas patadas por columna). Supervivencia en %, con el % de episodios sobrecalentados entre paréntesis.

| Filtro | joint | fall_only_cbf | separate |
|---|---|---|---|
| SONIC solo (sin filtro) | 47,6 (19,3) | 57,0 (0) | 47,6 (19,3) |
| `wmmin:0.4:0.95` | 60,2 (7,9) | 57,9 (0) | 64,1 (3,2) |
| `wmmin:1:0.95` | 63,0 (6,0) | 60,4 (0) | 65,5 (2,2) |
| `wmmin:1:0.95+dwell1` | 81,5 (4,1) | 82,6 (0) | 84,0 (1,2) |
| `wmmin:1:0.95+dwell2` | 84,2 (3,2) | 85,5 (0) | 86,2 (1,1) |
| `wmmin:1:0.95+latch` | 86,5 (2,7) | 88,2 (0) | 88,5 (0,9) |

El fallback solo alcanza 97,6 % de supervivencia (mundo thermal70, 0,4 % de sobrecalentamiento) y 96,4 % (mundo de barrera). El clip del mundo de barrera también actúa bajo SONIC, por lo que su columna corresponde a un entorno distinto. El horizonte de 3 s no se ha liberado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB y los checkpoints son políticas pequeñas, pero no se publican requisitos de memoria.
- GPU recomendadas: no disponible de forma explícita; se requiere torch con CUDA y MuJoCo Warp 3.16.0.
- Compatibilidad con GPU de consumo: no confirmada; al tratarse de políticas de control de tamaño reducido es plausible que quepan en GPU de consumo, pero no hay dato publicado.
- Opciones de despliegue: mjlab en el commit `dcdf6ce5`, MuJoCo / MuJoCo Warp 3.16.0, `robot-safety-sandbox` (rama `feat/shac-thermal-mjc316-wm-filters`, commit `83abdc0d08`), `safety-stable-baselines` (rama `feat/supermimic`) y `G1-robot-model-with-SysID` 0.4.0 (commit `69f2fc6`).
- Latencia y throughput: control a 50 Hz con 4 pasos de física de 5 ms por paso de control; no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de filtros de seguridad térmica para el Unitree G1 en la información proporcionada. La model card solo compara internamente las tres variantes (`joint`, `fall_only_cbf`, `separate`) y el comportamiento sin filtro (SONIC solo) y con fallback solo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G1 thermal safety filters | no disponible | no aplica | 88,5 % supervivencia (separate, latch) | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código, visión ni soporta tool calling; su ámbito es exclusivamente el control robótico del Unitree G1.
- El filtro solo es válido para el entorno exacto con el que fue entrenado y calibrado; el loader rechaza ficheros o entornos que no coincidan con `manifest.json`, `layouts/` y `g1_sysid.json`.
- Requiere versiones y commits muy específicos de mjlab, MuJoCo Warp, `robot-safety-sandbox`, `safety-stable-baselines` y `G1-robot-model-with-SysID`; cualquier desviación puede impedir la ejecución.
- El horizonte de predicción de 3 s no se ha liberado, lo que limita la reproducibilidad completa de los resultados.
- La licencia es "other": no se especifican términos de uso comercial, por lo que se debe consultar al autor antes de cualquier despliegue productivo.
- Los resultados de supervivencia son en simulación con patadas (kicks) y tres semillas; no hay evidencia publicada de transferencia a hardware real.
- Riesgo de alucinación y sesgos lingüísticos: no aplica en el sentido habitual, pero el modelo del mundo puede predecir márgenes inexactos fuera de la distribución de entrenamiento.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día (2026-11-14), lo que indica ausencia de validación comunitaria externa.

## Enlaces

- Hugging Face: https://huggingface.co/zengyh29/g1-thermal-safety-filters
- Repositorio de entrenamiento: `JHU-AllianceLab/g1_safety_porl`, rama `wm-filter-walk4` (documentación en `docs/wm_filter_walk4.md`)
- Dependencia `robot-safety-sandbox`, rama `feat/shac-thermal-mjc316-wm-filters` (commit `83abdc0d08`)
- Dependencia `safety-stable-baselines` (`safety_sb3`), rama `feat/supermimic`
- Dependencia `G1-robot-model-with-SysID` 0.4.0 (commit `69f2fc6`)
- mjlab en el commit `dcdf6ce5`
- MuJoCo / MuJoCo Warp 3.16.0
