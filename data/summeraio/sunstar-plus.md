# summerAIO/sunstar-plus

## Resumen

Sun*+ (sunstar-plus) es un modelo de downscaling y predicción meteorológica a corto plazo desarrollado por summerAIO, publicado en Hugging Face bajo la librería LightGBM. No es un modelo de lenguaje: es un conjunto de modelos de gradient boosting entrenados para corregir la salida de reanálisis ERA5 (0,25°) hacia observaciones puntuales de la red AMeDAS japonesa, cubriendo 1.285 estaciones en todo Japón. El modelo predice temperatura, viento (componentes u/v y velocidad), humedad relativa y precipitación en horizontes de 1, 3, 6, 12 y 24 horas, y puede emitir además la desviación típica (σ) de la predicción para temperatura, viento u, viento v y humedad.

La relevancia del modelo radica en su cobertura nacional: sustituye a Sun* V2, que solo cubría 22 estaciones de la prefectura de Okayama, y extiende el entrenamiento a 1.285 puntos AMeDAS con 2.233.500 filas de datos (2023-01 a 2025-12). La evaluación se ha realizado sobre un periodo de test independiente (2026-01-01 a 2026-10-31 UTC) con 113 estaciones held-out que no participaron en entrenamiento ni ajuste, lo que permite medir la capacidad de generalización espacial del modelo.

El repositorio tiene un tamaño de 0,3 GB, está etiquetado con idioma japonés y región US, y en el momento de redactar esta ficha no declara licencia ni pipeline. El autor indica que el repositorio es privado y que la licencia se decidirá antes de la publicación. La información disponible es exclusivamente la model card; no hay papers, demos ni repositorios de código asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM); regresión multiobjetivo por variable y horizonte |
| Parametros totales | no disponible (no aplicable: modelo de árboles, no red neuronal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo tabular; ventana temporal definida por features de observación y ERA5) |
| Tipos de cuantizacion | no disponible (no aplicable a LightGBM; el artefacto es un modelo de árboles serializado) |
| Idiomas soportados | ja (japonés; etiqueta de idioma del repo) |
| Licencia | no disponible (el autor indica que se decidirá antes de la publicación) |
| Formato de pesos | no disponible (librería LightGBM; presumiblemente modelo serializado nativo de LightGBM, no confirmado) |

## Arquitectura y entrenamiento

Sun*+ es un conjunto de modelos LightGBM (gradient boosting sobre árboles de decisión) que operan sobre un vector de 138 features (123 heredadas de Sun* V2 más 15 nuevas). Las features nuevas incluyen latitud y longitud, región administrativa, proporción de mar/tierra en radios de 20, 50 y 150 km, diferencia entre elevación DEM y altitud de la estación, interacciones costa×radiación solar y costa×viento, e indicadores de valle y de acumulación de aire frío. La asimilación de observaciones incorpora features de residuales de estaciones vecinas, con un 25% de dropout durante el entrenamiento como regularización.

El entrenamiento usa 2.233.500 filas muestreadas de 2023-01 a 2025-12, con validación en 2025-07 a 2025-12. La precipitación se modela con una distribución Tweedie (p=1,3) para regresar directamente mm/h, lo que es adecuado para una variable con exceso de ceros y cola larga. La evaluación se realizó sobre 2026-01-01 a 2026-10-31 UTC, con datos horarios AMeDAS, y el conjunto de test incluye 160 estaciones muestreadas de las de entrenamiento más 113 estaciones held-out estratificadas por región (excluyendo Okayama). Sun* V2 se re-evaluó con la misma matriz de features y el mismo pipeline nacional para una comparación justa. Un caveat metodológico importante: la guía de entrada es ERA5 de reanálisis (predicción perfecta), por lo que la precisión absoluta reportada es optimista respecto a un despliegue con pronóstico NWP operativo.

## Capacidades

- Downscaling espacial de ERA5 a estaciones puntuales AMeDAS en todo Japón (1.285 estaciones).
- Nowcasting y predicción a corto plazo con horizontes de 1, 3, 6, 12 y 24 horas.
- Predicción de temperatura (°C), velocidad del viento (m/s), componentes u y v del viento (m/s), humedad relativa (%) y precipitación (mm/h).
- Estimación de incertidumbre: salida de σ (desviación típica) para temperatura, viento u, viento v y humedad.
- Asimilación de observaciones en el instante inicial y de residuales de estaciones vecinas.
- Generalización espacial a estaciones no vistas en entrenamiento (evaluada con 113 estaciones held-out).
- Modelado de precipitación con distribución Tweedie para manejar la naturaleza cero-inflada de la variable.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; no es un modelo de lenguaje.

## Casos de uso

- Predicción meteorológica operativa local en Japón: el modelo corrige la salida de ERA5 hacia observaciones puntuales en 1.285 estaciones, lo que permite emitir pronósticos horarios a 1-24 h con RMSE de temperatura de 0,70-1,11 °C según horizonte en estaciones held-out.
- Relleno de series temporales y control de calidad de datos AMeDAS: el downscaling a estación permite estimar valores plausibles en puntos con datos faltantes o sospechosos, usando la coherencia espacial con estaciones vecinas.
- Agricultura de precisión: predicción de temperatura y humedad a 6-24 h en estaciones rurales para planificar riego, protección contra heladas y ventanas de aplicación de tratamientos, con σ como medida de riesgo.
- Gestión de energía renovable: predicción de velocidad y componentes del viento a 1-24 h en ubicaciones con estación AMeDAS próxima, útil para estimación de generación eólica a corto plazo.
- Aviación y logística: pronóstico de viento y precipitación en aeródromos y rutas con estación AMeDAS cercana, con horizontes de 1-6 h donde el modelo muestra las mayores mejoras relativas frente a ERA5.
- Investigación climática regional: generación de datasets downscaled consistentes para estudios de variabilidad local, con la ventaja de que el modelo está entrenado sobre datos japoneses y valida explícitamente la generalización espacial.
- Evaluación comparativa de metodologías de downscaling: el modelo sirve como baseline fuerte de gradient boosting frente a alternativas de deep learning o interpolación estadística, con protocolo de evaluación reproducible documentado en `COMPARISON.md`.

## Benchmarks y rendimiento

Los datos disponibles son RMSE sobre el periodo de test 2026-01-01 a 2026-10-31 UTC. Se presentan los resultados en estaciones held-out (113 estaciones, generalización espacial) y en el conjunto completo de evaluación (273 estaciones). Comparación con ERA5 interpolado y con Sun* V2.

Estaciones held-out (113), RMSE:

| Variable | Lead 0 h | Lead 1 h | Lead 6 h | Lead 24 h |
|---|---|---|---|---|
| Temperatura (°C) — ERA5 | 1,816 | 1,816 | 1,816 | 1,815 |
| Temperatura (°C) — V2 | 1,708 | 0,953 | 1,352 | 1,411 |
| Temperatura (°C) — Sun*+ | **1,252** | **0,720** | **1,086** | **1,145** |
| Velocidad viento (m/s) — ERA5 | 1,926 | 1,931 | 1,931 | 1,929 |
| Velocidad viento (m/s) — V2 | 1,551 | 1,178 | 1,381 | 1,415 |
| Velocidad viento (m/s) — Sun*+ | **1,382** | **0,902** | **1,157** | **1,218** |
| Humedad relativa (%) — ERA5 | 10,427 | 10,427 | 10,426 | 10,427 |
| Humedad relativa (%) — V2 | 10,284 | 5,914 | 8,477 | 8,876 |
| Humedad relativa (%) — Sun*+ | **8,546** | **4,660** | **7,154** | **7,636** |
| Precipitación (mm/h) — ERA5 | 1,067 | 1,067 | 1,067 | 1,067 |
| Precipitación (mm/h) — V2 | 1,035 | 0,993 | 1,031 | 1,035 |
| Precipitación (mm/h) — Sun*+ | **0,994** | **0,907** | **0,995** | **0,997** |

Conjunto completo de evaluación (273 estaciones), RMSE:

| Variable | Lead 0 h | Lead 1 h | Lead 6 h | Lead 24 h |
|---|---|---|---|---|
| Temperatura (°C) — Sun*+ | 1,139 | 0,696 | 1,047 | 1,106 |
| Velocidad viento (m/s) — Sun*+ | 1,180 | 0,865 | 1,083 | 1,134 |
| Humedad relativa (%) — Sun*+ | 8,085 | 4,715 | 7,120 | 7,601 |
| Precipitación (mm/h) — Sun*+ | 0,972 | 0,884 | 0,972 | 0,975 |

Recuento de victorias por RMSE (variable × horizonte, 36 combinaciones):

| Grupo de estaciones | Sun*+ mejor / total |
|---|---|
| Nacional, todas las estaciones de evaluación | 36 / 36 |
| Nacional, held-out | 36 / 36 |
| Nacional, muestra de estaciones de entrenamiento | 36 / 36 |
| Okayama, 22 estaciones de entrenamiento (vs V2 oficial) | 18 / 36 |
| Okayama, 3 estaciones no vistas (vs V2 oficial) | 34 / 36 |

En Okayama con estaciones de entrenamiento, Sun*+ no mejora a V2 en varios indicadores (diferencias de -0,4% a -1,5% en viento y temperatura a 0-6 h), lo que el autor atribuye a que V2 está especializado en esa región. En el resto de escenarios nacionales, Sun*+ gana en las 36 combinaciones.

## Requisitos de hardware

- Al ser un modelo LightGBM, la inferencia es intensiva en CPU, no en GPU; no requiere VRAM.
- El repositorio ocupa 0,3 GB, lo que sugiere un conjunto de modelos de árboles de tamaño moderado; la RAM necesaria para cargarlos es del orden de pocos GB, aunque no se especifica en la información disponible.
- No se requieren GPU A100, H100 ni RTX 4090; la inferencia puede ejecutarse en CPU convencional.
- Despliegue mediante la librería LightGBM (Python, C API, CLI) o exportación a otros runtimes compatibles; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI porque no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Al tratarse de gradient boosting sobre features tabulares, la latencia por predicción es típicamente de milisegundos en CPU, pero no hay cifras publicadas.
- Para uso operativo se necesita un pipeline previo que obtenga ERA5 (o NWP) y observaciones AMeDAS y construya las 138 features; ese pipeline no está incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Variables | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sun*+ | LightGBM, downscaling | 1.285 estaciones AMeDAS (Japón) | Temp, viento u/v/vel, humedad, precipitación, σ | no disponible | Hugging Face (repo privado según el autor) |
| Sun* V2 | LightGBM, downscaling | 22 estaciones de Okayama | Mismas variables | no disponible | Hugging Face (público, según la model card) |
| ERA5 interpolado | Reanálisis interpolado | Cobertura global 0,25° | Múltiples variables meteorológicas | Copernicus (condiciones de uso) | Público (CDS) |
| Downscaling NWP clásico (p. ej. interpolación bilineal + corrección MOS) | Estadístico | Depende de la red | Depende de la configuración | Varía | Varía |

Sun*+ se compara principalmente con Sun* V2 (su predecesor regional) y con la interpolación directa de ERA5. Frente a V2, la mejora en RMSE es del 14-33% en temperatura, 11-27% en velocidad del viento y 14-21% en humedad en estaciones held-out, mientras que en Okayama las diferencias son pequeñas o ligeramente favorables a V2. Frente a ERA5 interpolado, la mejora es sustancial en todas las variables y horizontes. No se dispone de comparación con modelos de deep learning de downscaling en la información proporcionada.

## Limitaciones y advertencias

- La guía de entrada es ERA5 de reanálisis, no un pronóstico NWP operativo; la precisión absoluta reportada es optimista y empeorará en producción con pronósticos reales.
- Cobertura geográfica limitada a Japón (1.285 estaciones AMeDAS); no es aplicable fuera de esa red sin reentrenamiento.
- El modelo está entrenado sobre datos de 2023-2025 y evaluado en 2026; no se documenta comportamiento ante regímenes climáticos no vistos ni ante cambios de instrumentación en AMeDAS.
- La precipitación es la variable con menor mejora relativa (3,5-9% frente a V2 en held-out) y su RMSE absoluto (~0,9-1,0 mm/h) indica capacidad limitada para eventos intensos.
- En Okayama, Sun*+ no supera a V2 en varios indicadores con estaciones de entrenamiento (18/36 victorias), por lo que para esa región V2 puede seguir siendo preferible.
- Licencia no declarada: no se puede asumir uso comercial permitido; el autor indica que la decidirá antes de la publicación.
- El repositorio se describe como privado en la model card, aunque es accesible vía Hugging Face; la disponibilidad futura no está garantizada.
- No se incluye el pipeline de construcción de features ni scripts de inferencia; el usuario debe replicar el preprocesamiento (ERA5, AMeDAS, DEM, distancias costa, residuales de vecinos) por su cuenta.
- La model card incluye un aviso legal sobre el cumplimiento de la normativa japonesa de información meteorológica; el uso puede estar restringido por regulación local.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí de extrapolación fuera de distribución en estaciones o condiciones atípicas.
- Idiomas: solo japonés en la documentación; no hay soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/sunstar-plus
- Modelo predecesor Sun* V2: https://huggingface.co/summerAIO/sunstar-v2
- Documento de comparación `COMPARISON.md`: referenciado en la model card, no se proporciona URL directa en la información disponible.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
