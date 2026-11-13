# ZenoDivergent/zeno-divergent-v111

## Resumen

Zeno v1.11 es un modelo de agregación de pronósticos ("model-of-models") desarrollado por ZenoDivergent. No es un modelo de lenguaje generativo al uso: recibe las respuestas de múltiples predictores (forecasters) junto con metadatos como el ancho del rango, el tipo de evidencia, la sorpresa respecto a la expectativa previa y el enunciado fechado de la pregunta, y devuelve una única respuesta calibrada, ya sea una probabilidad o un conjunto de 9 cuantiles. El modelo se entrenó desde cero sobre el corpus interno "Offdiagonal".

Con 15,9 millones de parámetros, es un modelo muy pequeño orientado a una tarea vertical y especializada: la combinación y calibración de predicciones en dominios como criptomonedas, energía, salud, meteorología y estado del mar. Su relevancia reside en el enfoque de "modelo de modelos": en lugar de predecir directamente, aprende a ponderar y calibrar las salidas de otros sistemas.

La versión v1.11 se desplegó como modelo por defecto en zenodivergent.dev el 13 de noviembre de 2026. Su licencia Apache 2.0 facilita la integración, aunque el autor advierte explícitamente de que no es un sistema de trading ni de seguridad y de que es peor que el modelo anterior en algunas categorías (estado del mar y meteorología de una sola pasada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red unificada entrenada desde cero; no se especifica el tipo) |
| Parametros totales | 15,9 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 0,1 GB) |

## Arquitectura y entrenamiento

La model card describe el modelo como "una única red unificada entrenada desde cero" sobre el corpus Offdiagonal, pero no detalla la familia arquitectónica (transformer, MoE, SSM u otra), el número de tokens de entrenamiento ni la composición exacta del dataset. La entrada del modelo combina varias señales por cada pronóstico: la respuesta del forecaster, el ancho de su rango, el tipo de evidencia aportada, la sorpresa frente a la expectativa previa y el enunciado fechado de la pregunta. La salida es una respuesta calibrada en forma de probabilidad o de 9 cuantiles.

El run de entrenamiento registrado es `v111/combined-20261113T074314Z`, en la variante de tamaño pequeño; según el autor, la variante de mayor tamaño nunca llegó a completarse. No se documentan técnicas de RLHF, DPO ni innovaciones de decodificación. El criterio de selección reportado es una puntuación de 0,709, sin que se especifique su definición ni el procedimiento de evaluación.

## Capacidades

- Agregación de pronósticos: combina las respuestas de varios forecasters en una única predicción calibrada.
- Salida probabilística: devuelve una probabilidad o un conjunto de 9 cuantiles según el campo.
- Uso de metadatos del pronóstico: incorpora ancho de rango, tipo de evidencia, sorpresa frente al prior y enunciado fechado de la pregunta.
- Marcado de campos no evaluados: las respuestas de campos sin resultados held-out se etiquetan como "untested".
- Dominios cubiertos: criptomonedas, energía, salud (covid), estado del mar y meteorología (determinista, por ensemble e histórica).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Agregación de pronósticos meteorológicos por ensemble: el modelo recibe las salidas de varios modelos numéricos y devuelve 9 cuantiles calibrados; en la evaluación held-out obtuvo una ganancia del +15 % frente al rival anterior en weather-ensemble, aunque el autor advierte de que las semanas posteriores no se confirmaron.
- Predicción de precios de criptomonedas: combina las estimaciones de varios forecasters con su incertidumbre declarada para producir una probabilidad calibrada; ganancia del +25 % en held-out, con la misma advertencia sobre semanas posteriores no confirmadas.
- Previsión de demanda energética: agrega pronósticos de distintos proveedores y devuelve cuantiles para planificación de capacidad; ganancia del +16 % en held-out.
- Seguimiento epidemiológico (covid): el campo nunca se entrenó de forma específica y aun así reportó una ganancia del +17 % en held-out, lo que sugiere capacidad de generalización a campos nuevos con estructura similar.
- Metacapa de un sistema de forecasting: se integra como agregador final sobre las salidas de modelos individuales, usando el tipo de evidencia y la sorpresa frente al prior como señales de ponderación.
- Auditoría de calibración: al devolver cuantiles y marcar los campos no evaluados, permite detectar dónde el sistema carece de validación antes de usarlo en producción.

## Benchmarks y rendimiento

Resultados held-out frente al mejor rival (el modelo servido anteriormente), según la model card:

| Campo | Resultado |
|---|---|
| crypto | ganancia (+25 %), semanas posteriores no confirmadas |
| energy | ganancia (+16 %) |
| health-covid | ganancia (+17 %), campo nunca entrenado |
| sea | pérdida (-117 %) |
| weather-deterministic | pérdida (-12 %) |
| weather-ensemble | ganancia (+15 %), semanas posteriores no confirmadas |
| weather-history | ganancia (+9 %), semanas posteriores no confirmadas |

Examen de preguntas: "wording_helps" sobre preguntas no vistas (n/a). No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplicarían a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 15,9 M de parámetros y un repo de 0,1 GB, cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: no documentadas (ni vLLM, ni llama.cpp, ni Ollama, ni TGI se mencionan).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeno v1.11 | 15,9 M | no disponible | score de selección 0,709; mixto en held-out | Apache 2.0 | Hugging Face |
| Modelo anterior servido en zenodivergent.dev | no disponible | no disponible | referencia de comparación | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de agregación de pronósticos en la documentación proporcionada.

## Limitaciones y advertencias

- Rendimiento claramente peor que el modelo anterior en estado del mar (-117 %) y meteorología de una sola pasada (-12 %).
- Varias ganancias (crypto, weather-ensemble, weather-history) no se confirmaron en las semanas posteriores a la evaluación.
- Los campos sin resultados held-out se marcan como "untested" en cada respuesta; no deben tratarse como validados.
- El autor declara explícitamente que no es un sistema de trading ni de seguridad.
- La variante de mayor tamaño del entrenamiento nunca se completó, por lo que el modelo servido es la variante pequeña.
- No se documentan sesgos, riesgos de alucinación, cobertura idiomática ni limitaciones de contexto; esta información no está disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del corpus Offdiagonal, no documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/ZenoDivergent/zeno-divergent-v111
- Sitio del proyecto: https://zenodivergent.dev (mencionado en la model card como despliegue por defecto desde el 13 de noviembre de 2026)
