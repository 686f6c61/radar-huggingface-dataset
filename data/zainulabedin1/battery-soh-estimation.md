# Zainulabedin1/battery-soh-estimation

## Resumen

`battery-soh-estimation` es un modelo de regresión Ridge, serializado como pipeline de scikit-learn, que estima el estado de salud (SOH, State of Health) de una celda de ion-litio a partir de la forma de la curva de un único ciclo de descarga. Lo publica el usuario Zainulabedin1 en Hugging Face y no es un modelo de lenguaje ni una red profunda: es un estimador tabular de 9 características con 10 parámetros ajustados, entrenado sobre tres celdas 18650 de 2 Ah (B0005, B0006 y B0007) del NASA Prognostics Center of Excellence Battery Data Set, cicladas hasta el fin de vida a 24 °C.

El problema que resuelve es acotado pero real: dada la serie de tensión y temperatura que registra un BMS durante una descarga completa, predecir la capacidad de descarga relativa a la capacidad nominal (SOH = capacidad de descarga / 2,0 Ah). Su interés técnico está en el protocolo de evaluación: split cronológico por celda (70 % de los ciclos para entrenamiento, 30 % finales para test, sin barajar), de modo que la métrica mide extrapolación hacia el futuro degradado y no interpolación entre ciclos vecinos.

Con 12 descargas y 0 likes en el momento de redactar esta ficha, es un artefacto de investigación reproducible más que un componente listo para producción: la propia model card declara limitaciones explícitas de química, temperatura y protocolo de laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión Ridge (lineal con regularización L2, `alpha=1.0`) sobre 9 características, precedida de `StandardScaler`; pipeline de scikit-learn |
| Parámetros totales | 10 parámetros ajustados (9 coeficientes + intercepto); los valores concretos no se publican en la model card |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: consume un ciclo de descarga completo (series de tensión y temperatura), no una secuencia de tokens |
| Tipos de cuantización | no disponible; no se distribuyen variantes cuantizadas (los pesos se serializan en el `joblib` tal cual) |
| Idiomas soportados | no aplica / no disponible (modelo numérico, sin entrada de texto) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | `joblib` (`model.joblib`: pipeline `StandardScaler` → `Ridge`), acompañado de `model.py` y `config.json` |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos etapas: estandarización de características (`StandardScaler`) y regresión Ridge con `alpha=1.0`. No hay redes neuronales, atención, capas recurrentes ni fases de RLHF/DPO: el ajuste es una minimización de mínimos cuadrados regularizados sobre 9 variables de entrada. Las 9 características son `cycle`, `v_mean`, `v_std`, `v_min`, `frac_below_3p5`, `v_slope_first_third`, `t_mean`, `t_max` y `t_rise`; es decir, estadísticos de la forma de la curva de descarga (nivel, dispersión, mínimo, fracción de la curva por debajo de 3,5 V, pendiente del primer tercio) más temperatura. La característica `duration_s` se excluyó deliberadamente porque, bajo el protocolo de descarga a corriente constante de 2 A, correlaciona 0,997 con la capacidad: incluirla sería medir el SOH en lugar de estimarlo.

Los datos de entrenamiento proceden del NASA Prognostics Center of Excellence Battery Data Set (B. Saha y K. Goebel), en concreto las celdas B0005, B0006 y B0007 (18650 de 2 Ah, LiCoO₂, 24 °C, cicladas hasta fin de vida), espejadas vía los ficheros de soporte de MathWorks. El protocolo es un split cronológico por celda: 70 % de los ciclos iniciales para entrenamiento y 30 % finales para test, sin barajar. La model card justifica la elección de un modelo lineal frente a una red pequeña: la degradación de capacidad es suave y casi monotónica, y en un protocolo de extrapolación un modelo lineal regularizado extrapola, mientras que un MLP pequeño se satura fuera de su rango de entrenamiento.

## Capacidades

- Regresión escalar: estima el SOH (capacidad de descarga / 2,0 Ah) como un valor continuo, por ejemplo 0,812.
- Dos interfaces de inferencia: `predict_soh_from_cycle(model, time_s, voltage_v, temperature_c, cycle=...)`, que calcula las 9 características a partir de las series crudas de un ciclo, y `predict_soh(model, {...})`, que acepta un diccionario o `DataFrame` con características precalculadas.
- Ingeniería de características incorporada en la ruta de conveniencia: derivación de estadísticos de tensión y temperatura a partir de las series temporales del ciclo.
- Estandarización interna: el `StandardScaler` va dentro del pipeline, por lo que se le pasan valores crudos de las características.
- Trazabilidad de configuración: `config.json` contiene hiperparámetros, especificación de características y métricas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Monitorización de tendencia en laboratorio de celdas: alimentar el modelo con cada ciclo de descarga de un banco de ensayos y registrar la curva de SOH a lo largo de la vida de la celda; el RMSE de ~0,04 es suficiente para observar tendencia, que es exactamente el uso que la model card autoriza.
- Analítica posterior de telemetría de BMS: recalcular el SOH de flotas históricas a partir de los registros de tensión y temperatura de descargas completas, sin reentrenar nada y con un coste de cómputo despreciable por ciclo.
- Baseline reproducible en investigación de prognósticos: usar este pipeline como referencia frente a la cual comparar modelos nuevos (LSTM, gradient boosting, enfoques físicos) sobre el mismo split cronológico por celda.
- Detección temprana de dispersión anómala entre celdas: aplicar el estimador a cada celda de un pack y comparar los SOH estimados para identificar la celda desviada antes de que la capacidad caiga de forma evidente.
- Selección preliminar de baterías de segunda vida: clasificar celdas recuperadas por SOH estimado para descartar las que quedan por debajo de un umbral de reutilización, con revisión humana dado el error del modelo.
- Docencia y prototipado de pipelines de mantenimiento predictivo: ejemplo mínimo y ejecutable de extracción de características, split temporal honesto y comparación de modelos lineales frente a redes pequeñas.
- Integración ligera en herramientas internas: al ser un `joblib` de un pipeline sklearn, se puede servir desde un endpoint de CPU o incrustar en un script de análisis sin GPU ni servidor de inferencia especializado.

## Benchmarks y rendimiento

Resultados declarados en la model card. La métrica es el error sobre SOH (adimensional, referido a 2,0 Ah), con split cronológico por celda (70 % train / 30 % test).

| Modelo | RMSE de test (SOH) | MAE de test (SOH) |
|---|---|---|
| Ridge sobre características de forma de curva (este modelo) | 0,0436 | 0,0386 |
| Regresión lineal sobre número de ciclo (baseline) | 0,0508 | 0,0390 |
| MLP pequeño sobre las mismas características (comparación) | 0,0814 | 0,0664 |

Desglose por celda del RMSE de test de este modelo: B0005 0,0372 · B0006 0,0579 · B0007 0,0313.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un modelo de lenguaje ni un sistema generativo.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es una operación matricial de 1×9 sobre CPU. El artefacto `model.joblib` es de tamaño reducido (el repositorio declara 0,0 GB, por debajo del umbral de redondeo de Hugging Face; el tamaño exacto del fichero no se publica).
- GPU: no necesaria ni aprovechable de forma significativa. Cualquier CPU x86 o ARM moderna sirve; no se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y dispositivos de borde tipo Raspberry Pi, siempre que haya un intérprete de Python con `scikit-learn` y `joblib` (el consumo dominante en memoria es el propio intérprete y las dependencias, no los pesos).
- Opciones de despliegue: script de Python, endpoint HTTP (FastAPI, Flask), job por lotes, o exportación del pipeline para su uso dentro de una herramienta de análisis. Alternativas como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no se publican mediciones. Por la naturaleza del cálculo (una multiplicación matriz-vector de 9 entradas más el escalado previo), la latencia es del orden de microsegundos a milisegundos por muestra en CPU; el coste real del flujo `predict_soh_from_cycle` estará dominado por el cálculo de características sobre la serie del ciclo, no por el modelo.

## Comparativa con modelos similares

Se comparan las tres alternativas evaluadas por el propio autor sobre el mismo conjunto y protocolo, que son las únicas referencias publicadas en la información disponible.

| Modelo | Tipo | Entradas | RMSE de test (SOH) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `battery-soh-estimation` (este modelo) | Ridge con `StandardScaler` | 9 características de forma de curva y temperatura | 0,0436 | no disponible | Hugging Face, `joblib` |
| Baseline del autor | Regresión lineal sobre número de ciclo | 1 (ciclo) | 0,0508 | no disponible | descrito en la model card, no distribuido |
| Comparación del autor | MLP pequeño | mismas 9 características | 0,0814 | no disponible | descrito en la model card, no distribuido |

No se han identificado en la información proporcionada otros modelos publicados comparables para estimación de SOH en Hugging Face con parámetros, contexto y licencia verificables. La búsqueda web realizada no devolvió resultados relacionados con este modelo.

## Limitaciones y advertencias

- Validez acotada a 3 celdas de una sola química (LiCoO₂, formato 18650, 2 Ah), una sola temperatura (24 °C) y un único protocolo de laboratorio (descarga completa a corriente constante de 2 A). La model card no reclama transferencia a packs de vehículo eléctrico, otras químicas ni ciclos de carga variables.
- Error de test de aproximadamente 0,04 en SOH: válido para monitorizar tendencia, no para decisiones de corte por seguridad. Cualquier uso en protección de batería o en lógica de corte debe evitarlo explícitamente.
- Requiere la curva de descarga completa con series de tensión y temperatura; no funciona con lecturas puntuales ni con estados parciales de carga.
- Riesgo de extrapolación indebida: el número de ciclo es una de las características, por lo que fuera del rango de ciclos observado en entrenamiento la predicción depende de una extrapolación lineal del deterioro, que puede no mantenerse ante cambios de régimen o fenómenos de rodilla (knee) en la degradación.
- Licencia no declarada: no hay autorización explícita de uso comercial. Antes de integrarlo en un producto hay que contactar con el autor o asumir el riesgo legal.
- Sesgo de conjunto pequeño: con tres celdas, las métricas por celda varían de 0,0313 (B0007) a 0,0579 (B0006); la horquilla refleja la sensibilidad a la celda concreta y aconseja validación con datos propios antes de desplegar.
- Naturaleza del artefacto: es un `joblib` de scikit-learn, no un modelo de Hugging Face `transformers`; no funcionará con `from_pretrained` ni con runtimes de inferencia de LLM, y depende de versiones compatibles de `scikit-learn`, `numpy` y `joblib` (las versiones no se especifican en la información disponible).
- El repositorio tiene 12 descargas y 0 likes, sin pipeline declarado ni idiomas: no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: <https://huggingface.co/Zainulabedin1/battery-soh-estimation>
- Dataset original (NASA Ames Prognostics Center of Excellence, Battery Data Set, B. Saha y K. Goebel), espejo utilizado para el entrenamiento: <https://ssd.mathworks.com/supportfiles/predmaint/batteryagingdata/nasa/BatteryAgingData.zip>
- Ficheros del repositorio citados en la model card: `model.joblib` (pipeline ajustado), `model.py` (`load_model`, `predict_soh`, `predict_soh_from_cycle`) y `config.json` (hiperparámetros, especificación de características y métricas).
- No se han encontrado en la búsqueda web enlaces relevantes (paper, blog, repositorio o demo) asociados a este modelo; los resultados devueltos no guardan relación con él.
