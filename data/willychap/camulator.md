# willychap/camulator

## Resumen

CAMulator es un emulador atmosférico auto-regresivo entrenado con aprendizaje automático que reproduce el comportamiento del modelo de circulación general CAM6 del NSF NCAR (Community Atmosphere Model, versión 6). Lo desarrolla Willy Chapman dentro del framework CREDIT (miles-credit), y se distribuye bajo licencia Apache 2.0. El modelo resuelve un problema clásico de la modelización climática: la enorme carga computacional de los GCM (modelos de circulación general), que limita la generación de grandes ensembles y simulaciones de décadas.

Dado un forzamiento prescrito de temperatura superficial del mar, hielo marino, radiación solar entrante y CO2, CAMulator avanza un estado atmosférico de 1 grado de resolución (rejilla 192x288) y 32 niveles verticales en pasos de 6 horas, durante simulaciones de escala climática (años a décadas). Conserva masa de aire seco global, humedad y energía atmosférica total, se mantiene numéricamente estable en rollouts decenales y reproduce la climatología anual junto con modos principales de variabilidad como ENSO y NAO, con una aceleración aproximada de 350x frente a CAM6.

El modelo se describe en Chapman et al. (2025), *CAMulator: Fast Emulation of the Community Atmosphere Model* (arXiv:2504.06007). Es una herramienta de investigación: emula una configuración específica de CAM6 y no sustituye un pronóstico operativo ni un modelo completo del sistema Tierra. El repositorio de Hugging Face ocupa 95,1 GB e incluye el checkpoint por defecto (época 69) junto con otros checkpoints de la selección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Emulador auto-regresivo de aprendizaje automático (red neuronal profunda sobre rejilla; framework CREDIT/miles-credit) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable en el sentido de LLM; estado atmosférico de 192x288 puntos horizontales y 32 niveles verticales, paso temporal de 6 horas, rollouts de hasta decadas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch (`checkpoint.pt000NN.pt`), descargados via `download_assets.py`; datos auxiliares en NetCDF |

## Arquitectura y entrenamiento

CAMulator es un emulador neuronal auto-regresivo que aprende la transición del estado atmosférico de CAM6 en pasos de 6 horas sobre una rejilla de 1 grado (192x288) con 32 niveles verticales. Se entrena y ejecuta dentro del framework CREDIT (miles-credit), desarrollado en NCAR, y toma como entradas prescritas la temperatura superficial del mar, el hielo marino, la radiación solar entrante y el CO2. El entrenamiento se realiza contra un objetivo de entrenamiento escalado a ERA5 sobre la misma rejilla de 1 grado, con medias espaciales ponderadas por cos(latitud).

La innovación central es la estabilidad a largo plazo: el modelo conserva masa de aire seco global, humedad y energía atmosférica total, e incorpora un "energy fixer" global activo en inferencia que mantiene la restricción bajo la que fue entrenado. La selección de checkpoints no se basa en la pérdida de validación, sino en el comportamiento del emulador: cada candidato se ejecuta en un rollout auto-regresivo libre de 35 años (1980-2014, 6 horas, sin años bisiestos) desde una única condición inicial del 1 de enero de 1980, con forzamiento prescrito y el energy fixer activo, acumulando errores durante 51.100 pasos. Se puntúa la climatología de medias mensuales (RMSE espacio-temporal, RMSE climatológico, sesgo de media global, RMSE mensual de media global, error de tendencia decadal y correlación anual) y se combinan las métricas mediante z-score entre checkpoints, con un ranking por rango medio como verificación cruzada independiente. Los empates se rompen evaluando las colas de la distribución a 6 horas de PRECT y TREFHT, con una mezcla final 50/50 entre puntuación mensual y de colas.

## Capacidades

- Emulación auto-regresiva del estado atmosráfico completo de CAM6 a 1 grado y 32 niveles, con paso temporal de 6 horas.
- Rollouts de escala climática (años a décadas) estables numéricamente, con conservación de masa de aire seco, humedad y energía atmosférica total.
- Reproducción de la climatología anual y de modos principales de variabilidad (ENSO, NAO).
- Generación de grandes ensembles climáticos a bajo coste computacional (aceleración de ~350x frente a CAM6).
- Forzamiento prescrito configurable: SST, hielo marino, radiación solar entrante y CO2.
- Salida en NetCDF de medias mensuales por defecto.
- Evaluación multi-checkpoint: el repositorio incluye los diez mejores checkpoints por puntuación combinada (épocas 36, 70, 66, 51, 47, 75, 52, 64, 65) además del 69, y checkpoints de selecciones anteriores (33, 43, 46, 48, 63, 68, 76), lo que permite ensembles baratos y estudios de sensibilidad a la etapa de entrenamiento.
- No dispone de tool calling, capacidades de agente, visión, audio ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- Generación de grandes ensembles climáticos: el modelo permite ejecutar decenas o cientos de miembros a una fracción del coste de CAM6 gracias a la aceleración de ~350x, lo que resulta adecuado para caracterizar incertidumbre en proyecciones decadales.
- Estudios de variabilidad interna: al reproducir ENSO y NAO en rollouts de 35 años sin nudging, sirve para analizar la estructura y teleconexiones de estos modos en un emulador rápido.
- Experimentos de sensibilidad al forzamiento: la entrada prescrita de SST, hielo marino, radiación solar y CO2 permite ejecutar barridos de parámetros de forzamiento y comparar respuestas climáticas con rapidez.
- Análisis de tendencias decadales: la métrica de error de tendencia decadal (+0.013 K/década para TREFHT en el checkpoint 69) indica que el modelo es utilizable para estudiar tendencias de temperatura superficial a escala de décadas.
- Evaluación y desarrollo de metodologías de emulación: el repositorio incluye diez checkpoints puntuados con un protocolo reproducible (rollouts de 51.100 pasos, métricas z-score), lo que lo convierte en un banco de pruebas para estudiar sensibilidad a la etapa de entrenamiento y construir ensembles de checkpoints.
- Docencia e investigación en ciencias del clima: el pipeline completo (descarga de assets, `check_setup.py`, `RunQuickClimate.sh`) permite a grupos sin acceso a grandes clústeres ejecutar simulaciones atmosféricas de escala climática.
- Prototipado de downscaling y análisis estadístico: la salida en NetCDF de medias mensuales sobre rejilla regular de 1 grado facilita su integración en cadenas de análisis posteriores y comparaciones con reanálisis ERA5.

## Benchmarks y rendimiento

Climatología del checkpoint 69 (ponderada por latitud, registro completo de 35 años):

| Campo | RMSE espacio-temporal | Sesgo de media global | Error de tendencia decadal | RMSE mensual de media global | Correlación anual |
|---|---|---|---|---|---|
| TREFHT | 1.602 K | -0.078 K | +0.013 K/década | 0.160 K | 0.989 |
| PRECT | 6.12e-4 (2.4 mm/día) | +3.2e-6 (+0.01 mm/día) | no disponible | RMSE climatológico 7.78e-5 | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar de aprendizaje automático (MMLU, HumanEval, GSM8K); no aplican a este tipo de modelo. La comparación de rendimiento relevante es la aceleración de ~350x frente a CAM6.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio de pesos ocupa 95,1 GB, lo que incluye múltiples checkpoints y datos auxiliares.
- GPU recomendadas: no disponible. El entorno fija PyTorch 2.4.1 + CUDA 12.1, por lo que se requiere una GPU NVIDIA compatible con CUDA 12.1.
- Viabilidad en GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: el pipeline oficial es el toolbox de inferencia del repositorio `WillyChap/miles-credit` (rama `camulator_huggingface`, directorio `climate/`), con entorno conda (`environment.yml`), descarga de assets (`download_assets.py`) y scripts `check_setup.py` y `RunQuickClimate.sh`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este modelo.
- Latencia y throughput: no disponible; solo se indica una aceleración de ~350x frente a CAM6.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Paso temporal | Licencia | Aceleración vs GCM | Disponibilidad |
|---|---|---|---|---|---|---|
| CAMulator | Emulador de CAM6 (CREDIT) | 1 grado, 192x288, 32 niveles | 6 horas | Apache 2.0 | ~350x frente a CAM6 | Hugging Face + GitHub |
| CAM6 (NSF NCAR) | GCM físico | Configuración objetivo del emulador | no disponible | no disponible | referencia (1x) | Modelo comunitario de NCAR |
| Otros emuladores CREDIT | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para comparar con otros emuladores atmosféricos concretos (parámetros, contexto, rendimiento o licencia); la comparación principal es con el GCM físico emulado, CAM6.

## Limitaciones y advertencias

- Es una herramienta de investigación: emula una configuración específica de CAM6 y no sustituye un pronóstico operativo ni un modelo completo del sistema Tierra.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, matemáticas, visión, audio, tool calling ni agentes.
- Los errores se acumulan en rollouts auto-regresivos libres (51.100 pasos en 35 años); la estabilidad decenal depende de mantener el energy fixer global activo, tal como se entrenó.
- La selección de checkpoints implica una ponderación explícita: no hay un checkpoint que gane en todas las métricas; el 69 es primero en precipitación y en la puntuación combinada mensual + 6 horas, pero en climatología mensual está prácticamente empatado con el 36 (1% de diferencia en puntuación compuesta, y el rango medio independiente favorece ligeramente al 36); las colas a 6 horas deciden el desempate.
- Sesgos conocidos: sesgo de media global de -0.078 K en TREFHT y +0.01 mm/día en PRECT para el checkpoint 69; no se documentan otros sesgos.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero el emulador puede generar estados atmosféricos plausibles no fieles al GCM en regímenes fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica multilingüismo; la validez está acotada a la rejilla de 1 grado, 32 niveles y paso de 6 horas de la configuración emulada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara explícitamente que el modelo es una herramienta de investigación y no un sustituto de pronóstico operativo.
- Caveat para producción: el repositorio ocupa 95,1 GB e incluye múltiples checkpoints; el checkpoint por defecto es la época 69 y los assets deben descargarse con `download_assets.py`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/willychap/camulator
- Toolbox de inferencia (rama `camulator_huggingface`, directorio `climate/`): https://github.com/WillyChap/miles-credit
- Framework CREDIT de NCAR: https://github.com/NCAR/miles-credit
- Paper: Chapman et al. (2025), *CAMulator: Fast Emulation of the Community Atmosphere Model*: https://arxiv.org/abs/2504.06007
- Instrucciones completas de inferencia (`climate/README.md`): https://github.com/WillyChap/miles-credit/blob/camulator_huggingface/climate/README.md
