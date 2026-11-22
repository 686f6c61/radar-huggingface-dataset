# tracinginsights/tif1-LFM3-1.7B-GGUF

## Resumen

tif1-LFM3-1.7B es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por tracinginsights, especializado en text-to-SQL para estadísticas de Fórmula 1 sobre la base de datos F1DB. El modelo realiza tres tareas concretas: convertir preguntas en lenguaje natural en planes JSON cuyo núcleo es una consulta SQL sobre DuckDB, narrar los resultados de dicha consulta usando exclusivamente los números presentes en el resultado, y explicar gráficos de telemetría de vueltas. La aplicación ejecuta el SQL localmente (DuckDB en el navegador), de modo que el modelo no necesita memorizar resultados de carreras.

El modelo base LFM3-1.7B tiene 1.728.801.600 parámetros y una arquitectura híbrida de 24 capas: 13 convoluciones cortas, 5 capas de atención con ventana deslizante y 6 capas de atención global. Este ajuste fino se distribuye en formato GGUF para llama.cpp y para el motor WebGPU en navegador de la aplicación tif1.

La relevancia actual del modelo radica en su enfoque de despliegue en el dispositivo: con un archivo Q4_0 de 861 MB y un vocabulario recortado a 19.958 tokens, permite ejecutar un asistente de consultas SQL especializado directamente en el navegador, sin depender de infraestructura de servidor. La versión v2.3 (21 de noviembre de 2026) alcanza un 91,4% de coincidencia de resultados en su conjunto de evaluación de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas (13 convoluciones cortas, 5 atención con ventana deslizante, 6 atención global) |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (GPTQ) y F16 |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (licencia "other") |
| Formato de pesos | GGUF (llama.cpp) y bundle WebGPU para navegador |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura híbrida que combina convoluciones cortas con capas de atención, tanto de ventana deslizante como global, en un total de 24 capas. El ajuste fino se realizó mediante LoRA con rango 64 y alpha 32 durante una época sobre 273.000 filas sintéticas de Fórmula 1, seguido de ejecuciones de entrenamiento continuado sobre datos revisados. La versión v2.3 es el promedio de pesos con igual ponderación ("soup") de dieciocho checkpoints finales fusionados: los dos últimos entrenamientos en GPU y dieciséis semillas de entrenamiento continuado ejecutadas en TPU.

Una innovación técnica destacable es el recorte del vocabulario: se eliminaron los tokens que el modelo nunca utiliza, reduciéndolo de 128.000 a 19.958 tokens. Esto reduce el tamaño del archivo un 18% (861 MB frente a 1,05 GB) y acelera la decodificación entre un 12% y un 19%, sin alterar la tokenización de textos compuestos únicamente por tokens conservados. La cuantización Q4_0 se realizó con GPTQ. El modelo no requiere memorizar resultados de carreras, ya que la aplicación ejecuta las consultas SQL generadas contra la base de datos F1DB cargada por el usuario.

## Capacidades

- Generación de planes JSON a partir de preguntas en lenguaje natural, con una consulta SQL sobre DuckDB como núcleo, una reformulación de una línea, una sugerencia de gráfico y tres preguntas de seguimiento.
- Narración de resultados de consultas SQL en pocas frases, utilizando exclusivamente los números presentes en el resultado.
- Explicación de gráficos de telemetría de vueltas (botón de la función "Ultra charts" de la aplicación tif1).
- Generación de texto conversacional en inglés.
- Integración con llama.cpp y con el motor WebGPU en navegador de tif1.
- Especialización vertical en el dominio de estadísticas de Fórmula 1 y datos deportivos.
- No se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Consultas de estadísticas de Fórmula 1 en lenguaje natural: el modelo transforma preguntas como "¿Quién tiene más podios en Monza desde 2010?" en una consulta SQL válida sobre F1DB, lo que permite a un aficionado obtener respuestas sin conocer SQL.
- Asistente de chat en el navegador: al ejecutarse mediante WebGPU con un archivo Q4_0 de 861 MB, permite desplegar el asistente completo en el dispositivo del usuario sin servidor backend ni costes de inferencia en la nube.
- Narración automática de resultados: tras ejecutar la consulta, el modelo redacta una respuesta en pocas frases usando solo los números del resultado, lo que reduce el riesgo de alucinación en las cifras presentadas.
- Explicación de telemetría de vueltas: el modelo describe gráficos de telemetría, útil para herramientas de análisis deportivo que necesitan texto explicativo generado automáticamente.
- Generación de preguntas de seguimiento: el plan JSON incluye tres preguntas de seguimiento que guían al usuario hacia consultas relacionadas, mejorando la exploración de datos.
- Integración en pipelines de análisis deportivo: el modelo puede formar parte de una aplicación que cargue F1DB en DuckDB y use el plan generado para ejecutar consultas de forma local y reproducible.
- Prototipado de asistentes text-to-SQL de dominio específico: sirve como referencia para adaptar un modelo pequeño a un esquema de base de datos concreto mediante LoRA y cuantización agresiva.

## Benchmarks y rendimiento

| Version | Coincidencia de resultados en planes (M1) | Notas |
|---|---|---|
| v2.3 | 91,4% | Sobre 1.440 planes de F1DB; +4,7 puntos frente a v2.2 (p de McNemar 4,9×10⁻¹⁰) |
| v2.2 | 86,7% | +5,1 puntos frente a v2.1 (p 2,4×10⁻⁸) |
| v2.1 | 81,6% | Re-cuantización GPTQ de v2.0 |
| v2.0 | 79,7% | Sobre eval golds v3 (v2.1 obtiene 82,2% en ese conjunto) |
| v1.1 | 72,9% | Sobre las consultas de referencia originales de v1 |
| v1.0 | 70,6% | Sobre las consultas de referencia originales de v1 |

Las respuestas de v2.3 pasan las comprobaciones de la aplicación en un 98,9% de los casos (frente a 99,4% de v2.2, diferencia no significativa). En las explicaciones de gráficos sobre los 133 prompts originales, v2.3 trazó correctamente todos los números en un 96,2% de los casos (frente a 100% de v2.2, diferencia límite). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el archivo Q4_0 de 861 MB; aproximadamente 3,5 GB para el F16 de 3,47 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el despliegue principal es mediante WebGPU en navegador y llama.cpp.
- Compatibilidad con GPU de consumo: el tamaño Q4_0 de 861 MB permite la ejecución en GPUs de consumo y en el navegador mediante WebGPU.
- Opciones de despliegue: llama.cpp (formato GGUF) y el motor WebGPU integrado en la aplicación tif1.
- Latencia y throughput: no disponibles de forma absoluta; se documenta que el recorte de vocabulario de v2.2 acelera la decodificación entre un 12% y un 19% respecto a la versión anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| tif1-LFM3-1.7B v2.3 | 1,73B | No disponible | Text-to-SQL de Fórmula 1 sobre F1DB | LFM Open License v1.0 | GGUF, WebGPU |
| LiquidAI/LFM3-1.7B (base) | 1,73B | No disponible | Propósito general | LFM Open License v1.0 | Safetensors y otros |
| Alternativas text-to-SQL de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de rendimiento de modelos comparables de la misma categoría, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documenta soporte multilingüe.
- Está especializado exclusivamente en el dominio de estadísticas de Fórmula 1 y en el esquema de F1DB; su rendimiento fuera de ese dominio no está evaluado.
- La licencia LFM Open License v1.0 permite uso no comercial y uso comercial solo a organizaciones con ingresos anuales inferiores a 10 millones de dólares estadounidenses; es necesario revisar los términos completos antes de un uso comercial.
- El modelo no memoriza resultados de carreras: depende de que la aplicación cargue la base de datos F1DB y ejecute el SQL generado, por lo que la corrección final depende de la base de datos y del motor DuckDB.
- La coincidencia de resultados en planes no es del 100% (91,4% en v2.3), por lo que existe un porcentaje de consultas generadas incorrectas que deben validarse.
- Las explicaciones de gráficos pueden no trazar correctamente todos los números en un pequeño porcentaje de casos (96,2% en v2.3 sobre los prompts originales).
- No se documentan sesgos específicos ni evaluaciones de alucinación fuera del dominio deportivo.
- El contexto máximo no está especificado en la información disponible, lo que limita la planificación de cargas con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tracinginsights/tif1-LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Aplicación tif1: https://app.tracinginsights.com/chat
- Base de datos F1DB: https://github.com/f1db/f1db
- llama.cpp: https://github.com/ggml-org/llama.cpp
- DOI: https://doi.org/10.57967/hf/11746
