# xi1514r/lanka-weather

## Resumen

Lanka Weather es un modelo de clasificación tabular basado en LightGBM (gradient-boosted decision trees) que predice la probabilidad de que llueva al día siguiente (≥ 1,0 mm) en diez localidades de Sri Lanka. Lo desarrolla el usuario xi1514r y se publica bajo licencia MIT. No es un modelo de lenguaje: es un artefacto de aprendizaje automático clásico orientado a un problema meteorológico concreto y de ámbito geográfico restringido.

La relevancia del modelo reside en su metodología de evaluación. El autor entrena con datos de reanálisis ERA5 de Open-Meteo (1980-2026) y aplica una partición estrictamente temporal: entrenamiento hasta 2018, validación (solo para early stopping) entre 2019 y 2021, y test entre 2022 y 2026. Sobre ese periodo de test reporta un Brier score de 0,124 y una habilidad del 29,9 % frente a la climatología, además de una comparación directa con modelos numéricos de predicción (ECMWF IFS, NCEP GFS, DWD ICON) en la que el modelo de árboles obtiene mejor Brier score.

Se distribuye como ficheros de texto de LightGBM (`rain.txt`, `heavy.txt`) junto con metadatos, tablas de líneas base y métricas. La versión documentada es `0.1.0+20261127`. El modelo de lluvia intensa (≥ 50,0 mm) está marcado explícitamente como de uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient-boosted decision trees (LightGBM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; features definidas en `metadata.json`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | ficheros de texto de LightGBM (`rain.txt`, `heavy.txt`) y modelos congelados en `eval/` |
| Pipeline | tabular-classification |
| Version | `0.1.0+20261127` |
| Fecha de entrenamiento | 2026-11-27T20:38:56Z |
| Cobertura geografica | 10 localidades de Sri Lanka |
| Fuente de datos | Open-Meteo ERA5 reanalysis, 1980-01-01 a 2026-11-21 |

## Arquitectura y entrenamiento

El modelo emplea gradient boosting sobre árboles de decisión mediante LightGBM, una técnica adecuada para datos tabulares con relaciones no lineales y features heterogéneas. El autor publica dos variantes: `rain.txt`, que estima la probabilidad de precipitación ≥ 1,0 mm al día siguiente, y `heavy.txt`, que estima precipitación ≥ 50,0 mm y está restringido a investigación. Los ficheros de producción se reentrenan sobre todos los datos, mientras que las puntuaciones publicadas provienen de los modelos congelados en `eval/`.

El conjunto de entrenamiento procede del reanálisis ERA5 de Open-Meteo, con resolución de rejilla de aproximadamente 25 km, y cubre desde el 1 de enero de 1980 hasta el 21 de noviembre de 2026. La partición es temporal y honesta: entrenamiento del 2 de enero de 1980 al 31 de diciembre de 2018, validación del 1 de enero de 2019 al 31 de diciembre de 2021 (usada únicamente para early stopping) y test del 1 de enero de 2022 al 21 de noviembre de 2026. La lista de features se documenta en `metadata.json`. No se indica en la información disponible el número de árboles, la profundidad, la tasa de aprendizaje ni el resto de hiperparámetros.

## Capacidades

- Predicción probabilística de lluvia al día siguiente (≥ 1,0 mm) para diez localidades de Sri Lanka.
- Predicción de lluvia intensa (≥ 50,0 mm) con un modelo separado, marcado como de uso exclusivamente investigador.
- Clasificación tabular sobre features derivadas de reanálisis meteorológico (ERA5).
- Salida calibrada como probabilidad, evaluada mediante Brier score y AUC.
- Comparación integrada con líneas base meteorológicas: climatología, persistencia y cadena de Markov.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por su naturaleza de modelo tabular.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Planificación agrícola local: un productor de una de las diez localidades cubiertas puede consultar la probabilidad de lluvia al día siguiente para decidir riego o recolección; el modelo ofrece una probabilidad calibrada con habilidad del 29,9 % sobre climatología en el periodo de test.
- Investigación meteorológica comparativa: el artefacto sirve como línea base de ML frente a modelos numéricos (ECMWF IFS, NCEP GFS, DWD ICON) en el mismo conjunto de filas, lo que facilita estudios de post-procesado estadístico.
- Docencia y reproducibilidad: al publicar particiones temporales, métricas, líneas base y modelos congelados en `eval/`, el repositorio es útil para enseñar evaluación honesta de series temporales y evitar fugas de información.
- Prototipado de servicios de aviso no oficiales: integrado en un pipeline que consulte la probabilidad diaria, puede alimentar paneles internos o aplicaciones de divulgación, siempre con la advertencia de que no sustituye a los avisos oficiales.
- Análisis de riesgo de precipitación intensa en investigación: la variante `heavy.txt` permite estudiar la señal de eventos extremos, aunque el autor la restringe a uso investigador.
- Evaluación de técnicas de gradient boosting en datos climáticos tabulares: el modelo permite medir el rendimiento de LightGBM frente a métodos estadísticos simples (Markov, persistencia) en un problema de clasificación binaria con desbalanceo estacional.

## Benchmarks y rendimiento

Resultados publicados por el autor en el periodo de test (2022-01-01 a 2026-11-21), predicción de lluvia al día siguiente:

| Pronostico | Brier (menor es mejor) | Habilidad vs climatologia | AUC |
|---|---|---|---|
| Modelo LightGBM | 0,124 | 29,9 % | 0,900 |
| Climatologia | 0,176 | 0,0 % | 0,802 |
| Markov | 0,144 | 18,6 % | 0,863 |
| Persistencia | 0,202 | -14,2 % | 0,786 |

Comparación con modelos numéricos de predicción en el mismo conjunto de filas (2024-02-05 a 2026-11-21):

| Pronostico | Brier | Habilidad vs climatologia | CSI |
|---|---|---|---|
| Weather Lab (LightGBM) | 0,128 | 27,4 % | 0,738 |
| Weather Lab, si/no al 50 % | 0,182 | -3,9 % | 0,738 |
| ECMWF IFS 0,25° | 0,185 | -5,3 % | 0,746 |
| NCEP GFS | 0,197 | -12,2 % | 0,704 |
| DWD ICON | 0,249 | -41,7 % | 0,608 |
| Markov | 0,145 | 17,3 % | 0,712 |
| Climatologia | 0,176 | 0,0 % | 0,634 |
| Persistencia | 0,207 | -17,8 % | 0,703 |

## Requisitos de hardware

- Inferencia sobre CPU: LightGBM no requiere GPU para servir los modelos `rain.txt` y `heavy.txt`; el coste computacional es de milisegundos por predicción en hardware convencional.
- VRAM estimada: no aplica en la configuración estándar de LightGBM en CPU; no se dispone de cifras de despliegue en GPU.
- GPU recomendadas: no disponible; el entrenamiento y la inferencia de árboles de decisión no necesitan acelerador gráfico.
- Cabe en cualquier equipo de consumo: los ficheros de modelo son de texto y de tamaño reducido, adecuados para ejecutarse en portátiles y contenedores ligeros.
- Opciones de despliegue: la librería LightGBM (Python, C++, R, Java, entre otras) y el binario `lightgbm` para cargar los ficheros `.txt`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Brier (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lanka Weather (LightGBM) | Gradient boosting tabular | 10 localidades de Sri Lanka | 0,124 | MIT | Hugging Face |
| Markov | Cadena de Markov sobre estados de lluvia | Misma región y filas | 0,144 | No disponible | Línea base del propio repositorio |
| Persistencia | Regla trivial (repetir el día anterior) | Misma región y filas | 0,202 | No disponible | Línea base del propio repositorio |
| ECMWF IFS 0,25° | Modelo numérico global | Global | 0,185 | No disponible | Servicio operativo de ECMWF |

No se han identificado en la información disponible otros modelos públicos de clasificación tabular específicos para predicción de lluvia al día siguiente en Sri Lanka con los que comparar parámetros o contexto.

## Limitaciones y advertencias

- La verdad de referencia es el reanálisis ERA5 (rejilla de ~25 km), no pluviómetros; los errores del reanálisis se propagan al modelo y a las métricas.
- No es un pronóstico oficial; para avisos meteorológicos deben usarse el Department of Meteorology Sri Lanka y el Disaster Management Centre.
- El modelo de lluvia intensa (≥ 50,0 mm) está restringido a uso exclusivamente investigador.
- Cobertura geográfica limitada a diez localidades de Sri Lanka; no se debe extrapolar a otras regiones sin reentrenamiento.
- Las puntuaciones de test cubren 2022-2026 y la comparación con modelos numéricos solo 2024-2026; la estabilidad fuera de ese periodo no está documentada.
- No se detallan sesgos conocidos, calibración por estación ni análisis de subgrupos en la información disponible.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la idoneidad para decisiones de seguridad.
- Al ser un modelo tabular, no procesa texto libre ni admite interacción conversacional; requiere un pipeline que construya las features documentadas en `metadata.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xi1514r/lanka-weather
- Código en GitHub: https://github.com/X-355/lanka-weather
- Open-Meteo ERA5 (fuente de datos): https://open-meteo.com/
