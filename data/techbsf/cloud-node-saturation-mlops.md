# TechBsf/cloud-node-saturation-mlops

## Resumen

Cloud Node Saturation Risk Model es un modelo de regresión lineal implementado con scikit-learn que estima una puntuación acotada de saturación de nodos cloud (en el rango [0, 1]) a partir de seis características de telemetría de infraestructura. Lo desarrolla el usuario TechBsf como pieza central de un proyecto de demostración de MLOps, no como un modelo de lenguaje ni una red neuronal: se trata de un `LinearRegression` serializado en formato joblib, entrenado sobre 1.500 filas de datos sintéticos con semilla 42.

El modelo resuelve un problema muy concreto: dada la telemetría de un nodo (uso de CPU y memoria, tasa de peticiones, latencia p99, profundidad de cola y tiempo de actividad), produce una estimación continua del riesgo de saturación. Su relevancia es fundamentalmente didáctica y de ingeniería: sirve como ejemplo completo de un ciclo MLOps que incluye entrenamiento, evaluación con validación cruzada, selección de modelo frente a un candidato XGBoost, empaquetado, servicio FastAPI desplegado en Google Cloud Run, endpoint de métricas y endpoint de deriva (drift), y una demo interactiva en Hugging Face Spaces.

Es importante subrayar que no es un modelo de propósito general ni un modelo de lenguaje: no tiene parámetros en el sentido de un transformer, no procesa texto y no dispone de ventana de contexto. Toda la información disponible proviene de su model card y del repositorio del autor. Los datos de entrenamiento son sintéticos y el propio autor advierte que el modelo no debe usarse para planificación de capacidad real ni para decisiones operativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (`LinearRegression` de scikit-learn) |
| Parametros totales | 6 coeficientes más intercepto (7 parámetros entrenables) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (`model/model.joblib`) |
| Librería | scikit-learn |
| Entradas | 6 características numéricas de telemetría |
| Salida | Puntuación de regresión acotada a [0, 1] |
| Filas de entrenamiento | 1.500 ejemplos sintéticos |
| Semilla | 42 |
| Partición | 70% train / 15% validación / 15% test |
| Tamaño del repositorio | 0,0 GB |

Características de entrada y rangos aceptados:

| Feature | Significado | Rango |
|---|---|---:|
| `cpu_utilization_pct` | Uso de CPU | 0–100% |
| `memory_utilization_pct` | Uso de memoria | 0–100% |
| `request_rate_rps` | Tasa de peticiones | 0–10.000 req/s |
| `p99_latency_ms` | Latencia p99 | 0–5.000 ms |
| `queue_depth` | Profundidad de cola | 0–1.000 |
| `uptime_hours` | Tiempo de actividad | 0–200.000 h |

## Arquitectura y entrenamiento

La arquitectura es un modelo lineal clásico: una combinación lineal de las seis características de entrada más un término independiente, con la salida acotada al intervalo [0, 1]. No hay capas ocultas, mecanismos de atención ni componentes secuenciales. El artefacto serializado es un estimador de scikit-learn guardado con joblib; el orden de las características debe respetarse al invocarlo directamente, mientras que el endpoint FastAPI acepta campos con nombre y valida sus límites.

El entrenamiento se realizó sobre 1.500 ejemplos generados sintéticamente con semilla 42, divididos en 70% entrenamiento, 15% validación y 15% test. La selección de modelo se hizo mediante validación cruzada de cinco pliegues comparando el modelo lineal con un candidato `XGBRegressor`: el modelo no lineal solo se promovía si mejoraba el RMSE del baseline lineal en al menos un 1%. No lo consiguió (RMSE medio de 0,030894 frente a 0,029277 del lineal), por lo que se mantuvo la regresión lineal. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de ajuste posterior; tampoco se detalla la composición del generador de datos sintéticos más allá de los rangos de las características.

## Capacidades

- Regresión tabular: estima una puntuación continua de saturación de nodo a partir de seis métricas de infraestructura.
- Inferencia vía API REST: el servicio FastAPI expone un endpoint de predicción con validación de límites por campo.
- Diagnóstico operativo de demostración: expone los endpoints `/metrics` y `/drift` para ilustrar monitorización en MLOps (con estado local al proceso, se reinicia al reiniciar la instancia).
- Integración en pipelines de datos: al ser un artefacto joblib de scikit-learn, puede cargarse directamente en scripts de Python y en flujos de entrenamiento o evaluación.
- Demo interactiva en navegador: el Space reproduce el cálculo lineal en el lado del cliente, sin llamar a la API de Cloud Run.
- No soporta generación de texto, razonamiento, código, matemáticas avanzadas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Práctica de MLOps de extremo a extremo: el repositorio sirve como plantilla para montar un ciclo completo de entrenamiento, evaluación con validación cruzada, selección de modelo con puerta de calidad, empaquetado y despliegue en Cloud Run. Es adecuado por su simplicidad y por incluir tests y configuración de despliegue.
- Demostración de servicio de inferencia con FastAPI: el endpoint con validación de rangos por campo es un ejemplo realista de cómo exponer un estimador scikit-learn como API con contratos de entrada definidos.
- Ilustración de monitorización y deriva: los endpoints `/metrics` y `/drift` permiten mostrar en formación o en un blog cómo se instrumenta un modelo en producción, con la advertencia de que el estado es local al proceso.
- Prototipado de un scoring de saturación en entornos de laboratorio: con datos sintéticos, puede usarse para probar la plomería de un sistema de alertas antes de sustituir el modelo por uno entrenado con telemetría real.
- Ejemplo docente de selección de modelo: la comparación documentada entre regresión lineal y XGBoost con una puerta de mejora del 1% es un caso concreto para explicar criterios de promoción de modelos.
- Reproducción en el navegador con Hugging Face Spaces: útil para demostrar cómo portar un cálculo lineal a JavaScript del lado cliente y comparar resultados con el servicio Python.
- Integración en scripts de análisis de infraestructura: cargando el joblib en Python se pueden puntuar lotes de registros de telemetría en tareas de exploración, siempre con datos sintéticos o de prueba.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test sintético del modelo seleccionado:

| Métrica | Valor |
|---|---:|
| RMSE | 0,0304 |
| MAE | 0,0236 |
| R² | 0,8737 |

Comparación de selección mediante validación cruzada de cinco pliegues:

| Modelo | RMSE medio CV (5 pliegues) | Decisión |
|---|---:|---|
| LinearRegression | 0,029277 | Seleccionado |
| XGBRegressor | 0,030894 | Rechazado |

El autor advierte explícitamente de que estas métricas describen el rendimiento sobre el split de test sintético y no deben interpretarse como evidencia de rendimiento en el mundo real. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: práctica­mente despreciable; el artefacto joblib contiene 7 parámetros y el repositorio ocupa 0,0 GB. Cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU. La inferencia puede ejecutarse en CPU sin problema; el despliegue de referencia usa Google Cloud Run, que es una plataforma de contenedores sin GPU.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en entornos sin GPU (CPU, contenedores serverless).
- Opciones de despliegue: FastAPI (opción usada por el autor), Google Cloud Run, contenedores Docker genéricos, ejecución directa con Python y joblib. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor indica que el despliegue en Cloud Run escala a cero y puede incurrir en costes fuera de las cuotas gratuitas de Google Cloud.

## Comparativa con modelos similares

La información disponible no incluye modelos comparables de la misma categoría (regresión tabular para scoring de infraestructura). La única comparación documentada es interna al proyecto, frente al candidato descartado:

| Modelo | Tipo | Parámetros | Contexto | RMSE CV (5 pliegues) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| LinearRegression (este modelo) | Regresión lineal scikit-learn | 7 | no aplica | 0,029277 | MIT | Hugging Face + API Cloud Run |
| XGBRegressor (candidato) | Gradient boosting | no disponible | no aplica | 0,030894 | no disponible | no disponible (rechazado) |

No se dispone de datos para comparar con alternativas externas de la misma categoría; se indica "no disponible".

## Limitaciones y advertencias

- Datos sintéticos: entrenamiento y evaluación se realizaron sobre 1.500 ejemplos generados artificialmente; no hay evidencia de validez sobre telemetría real.
- Salida no calibrada: la puntuación se recorta a [0, 1] y no es una probabilidad calibrada; no debe interpretarse como probabilidad de saturación.
- Uso no productivo: el autor indica explícitamente que el modelo es para demostración y práctica de MLOps, no para planificación de capacidad ni decisiones operativas.
- Sesgos conocidos: no documentados, pero al derivarse de un generador sintético, el modelo hereda los supuestos y posibles sesgos de dicho generador, que no se detalla.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos; el riesgo equivalente es extrapolación fuera de los rangos de entrada aceptados, mitigado parcialmente por la validación de límites en la API.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Monitorización de demostración: los endpoints `/metrics` y `/drift` tienen estado local al proceso y se reinician al parar o reiniciar la instancia de Cloud Run; no hay almacén duradero de métricas ni alertas.
- Licencia MIT: permite uso comercial, pero las advertencias del autor sobre datos sintéticos y falta de calibración deben tenerse en cuenta antes de cualquier uso en producción.
- Costes de despliegue: el despliegue en Cloud Run es manual, escala a cero y puede generar cargos por uso o almacenamiento de artefactos fuera de las cuotas gratuitas de Google Cloud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechBsf/cloud-node-saturation-mlops
- Artefacto del modelo: https://huggingface.co/TechBsf/cloud-node-saturation-mlops/resolve/main/model/model.joblib
- Demo interactiva (Hugging Face Space): https://huggingface.co/spaces/TechBsf/cloud-node-saturation-mlops-demo
- API en vivo (Swagger UI): https://node-saturation-api-fp6clzw5ga-od.a.run.app/docs
- Código fuente (GitHub): https://github.com/TechBsf/cloud-node-saturation-mlops
