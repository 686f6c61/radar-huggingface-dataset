# Valkea/System1Router-effort

## Resumen

System1Router-effort es un clasificador de texto de dominio muy específico: predice el "esfuerzo de razonamiento" que requiere un turno de conversación en un asistente de programación, dentro de cinco niveles (`low`, `medium`, `high`, `xhigh`, `max`). Lo desarrolla Valkea como componente local del proyecto System1Router, una herramienta que ajusta automáticamente el nivel de esfuerzo de cada prompt en Claude Code u OpenCode sin romper la caché de prompt del modelo subyacente. No genera texto: es un router que decide cuánto "pensar" debe dedicar el modelo grande a cada interacción.

El modelo parte de jhu-clsp/ettin-encoder-32m, un encoder de 32 millones de parámetros, y se ha afinado completamente sobre 2.535 prompts reales de sesiones de Claude Code y OpenCode, etiquetados a posteriori por Claude Opus. El resultado es un clasificador de 130 MB en formato ONNX que procesa cada prompt en unos 10 ms sobre 4 hilos de CPU, con una precisión exacta del 60% y del 94% dentro de un nivel en su conjunto de evaluación.

Su relevancia es práctica: en asistentes de código con modos de razonamiento extendido, decidir cuándo activar el esfuerzo alto es un problema de coste y latencia. Este modelo ofrece una heurística aprendida, local y barata, que evita llamadas adicionales a un LLM para esa decisión. Es una pieza de infraestructura más que un modelo de propósito general, y su utilidad está acotada al ecosistema de asistentes de código y a sesiones con características similares a las de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: jhu-clsp/ettin-encoder-32m, afinado completo) |
| Parametros totales | 32 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens de entrada (`[CLS] prompt [SEP] context [SEP]`) |
| Tipos de cuantizacion | No disponible; se distribuye como grafo ONNX con pesos embebidos |
| Idiomas soportados | Ingles (segun la model card; el contenido de las sesiones puede ser multilingue, pero el modelo declara solo `en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`ettin-32m-effort-v1.onnx`), tokenizer en JSON, manifiesto JSON |
| Tamano del repositorio | 0,1 GB (modelo en disco: 130 MB) |
| Pipeline | text-classification |
| Salida | 5 logits (uno por nivel de esfuerzo) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 32 millones de parámetros, derivado de jhu-clsp/ettin-encoder-32m, con un cabezal de clasificación de 5 clases. Se ha afinado de forma completa, incluyendo los embeddings, durante 4 épocas con una tasa de aprendizaje de 8e-5. La entrada se construye como `[CLS] prompt [SEP] context [SEP]` con un máximo de 256 tokens: el prompt conserva hasta un tercio de la ventana y el contexto se recorta desde su extremo más antiguo. El contexto son los últimos 4.000 caracteres de un bloque estructurado que incluye los ficheros en juego, las herramientas usadas y los 3.000 caracteres más recientes de la conversación, de modo que un seguimiento corto ("ok, do it") se interpreta a la luz del intercambio previo.

Los datos de entrenamiento son 2.535 prompts procedentes de sesiones reales de Claude Code y OpenCode, etiquetados en retrospectiva por Claude Opus con el esfuerzo que el turno necesitó, considerando prompt, contexto y resultado. El conjunto de datos no es público. La función de pérdida combina entropía cruzada con pesos por clase y un coste de distancia esperada que penaliza el doble un esfuerzo demasiado bajo que uno demasiado alto, reflejando el coste asimétrico de infraestimar el razonamiento necesario. No se documenta RLHF ni DPO; es un ajuste supervisado sobre etiquetas generadas por un juez LLM.

## Capacidades

- Clasificación de esfuerzo de razonamiento en cinco niveles (`low`, `medium`, `high`, `xhigh`, `max`) a partir de prompt y contexto conversacional reciente.
- Uso de contexto estructurado: ficheros implicados, herramientas invocadas y últimos 3.000 caracteres de la conversación.
- Inferencia local en CPU: unos 10 ms por prompt sobre 4 hilos, tras una carga inicial de 0,5 s.
- Integración con System1Router para ajustar automáticamente el esfuerzo de cada prompt en Claude Code y OpenCode preservando el modelo y la caché de prompt.
- Distribución en ONNX con pesos embebidos, tokenizer y manifiesto con orden de etiquetas, disposición de entradas, tamaños y SHA-256.
- Versionado por nombre de fichero (`-v1`, `-v2`), manteniendo versiones antiguas disponibles.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Enrutado de esfuerzo en asistentes de código: System1Router consulta al clasificador antes de enviar cada prompt a Claude Code u OpenCode y fija el nivel de razonamiento adecuado, evitando activar modos caros en turnos triviales y evitando infravalorar turnos complejos.
- Reducción de coste y latencia en pipelines de agentes: al clasificar en local en ~10 ms, se evita una llamada adicional a un LLM solo para decidir el esfuerzo, lo que abarata cada turno y mantiene la caché de prompt intacta.
- Presupuesto dinámico de razonamiento en producción: equipos que operan asistentes de código pueden usar la predicción para limitar el gasto en tokens de pensamiento por sesión, aplicando `low` a tareas repetitivas y `high` o `max` a depuración compleja.
- Investigación sobre metacognición en LLM: el modelo sirve como sonda barata para estudiar qué señales del prompt y del contexto predicen la necesidad de razonamiento, y para comparar etiquetas de distintos jueces.
- Reentrenamiento sobre sesiones propias: la documentación del proyecto permite reentrenar el clasificador con las sesiones de un equipo concreto, útil para dominios o lenguajes distintos de Rust, TypeScript y Python.
- Filtrado previo en sistemas de evaluación: clasificar turnos por esfuerzo esperado permite estratificar conjuntos de evaluación o priorizar la revisión humana de los turnos etiquetados como `high` o `max`.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con 130 MB, encaja en contenedores ligeros, portátiles de desarrollo y entornos de CI donde no hay acelerador disponible.

## Benchmarks y rendimiento

Evaluación sobre 509 prompts de 96 sesiones reservadas, con partición por sesión:

| Metodo | Exactitud exacta | Dentro de un nivel | Error absoluto medio |
|---|---:|---:|---:|
| Aleatorio | 23–28% | 65–74% | 1,04–1,21 |
| Siempre `medium` | 33% | 91% | 0,76 |
| **System1Router-effort** | **60%** | **94%** | **0,47** |

Desglose de errores del modelo: 25% de predicciones demasiado bajas y 15% demasiado altas. El autor señala que las etiquetas son la opinión de un único juez, por lo que parte del error restante es ruido de etiqueta. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU.
- Huella en disco: 130 MB (repositorio de 0,1 GB).
- Carga inicial: aproximadamente 0,5 s; inferencia de unos 10 ms por prompt sobre 4 hilos de CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna con al menos 4 hilos es suficiente.
- Cabe en cualquier portátil y en contenedores ligeros; no necesita GPU de consumo.
- Despliegue: runtime ONNX (ONNX Runtime u otro compatible) con el tokenizer JSON; la integración prevista es mediante `system1router install`.
- Throughput estimado: del orden de 100 prompts por segundo por núcleo de CPU según la latencia declarada, aunque el dato exacto de throughput no se publica.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables (clasificadores de esfuerzo de razonamiento para asistentes de código). Como referencia de la categoría de encoders pequeños para clasificación:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| System1Router-effort | 32 M | 256 tokens | Clasificación de esfuerzo (5 clases) | MIT | HuggingFace, ONNX |
| jhu-clsp/ettin-encoder-32m | 32 M | No disponible | Encoder base (MLM) | No disponible en la información | HuggingFace |
| Alternativas de enrutado de esfuerzo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información proporcionada otros clasificadores de esfuerzo de razonamiento con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado con las sesiones de un único desarrollador, mayoritariamente en proyectos Rust, TypeScript y Python; el rendimiento puede degradarse en otros lenguajes, dominios o estilos de trabajo.
- Los embeddings se afinaron sobre esas sesiones y arrastran trazas del vocabulario presente en ellas, lo que puede introducir sesgos hacia ese vocabulario.
- Es un predictor de esfuerzo, no un juez de calidad: no conoce qué modelo ejecutará el turno ni evalúa la corrección de la respuesta.
- Las etiquetas provienen de un único juez (Claude Opus) y no se publican; parte del error es ruido de etiqueta y no hay forma independiente de validarlo.
- Ventana de 256 tokens con recorte del contexto desde el extremo más antiguo: conversaciones muy largas o prompts extensos pueden perder información relevante.
- El modelo declara únicamente inglés; no hay evidencia de comportamiento en otros idiomas.
- Licencia MIT, que permite uso comercial, pero el modelo base y la procedencia de las etiquetas conviene revisarlos antes de un despliegue en producción.
- Solo se distribuye en ONNX; no hay pesos en safetensors ni GGUF, lo que limita su uso con toolchains que no soporten ONNX.
- Riesgo de infraestimación: el 25% de los errores son por esfuerzo demasiado bajo, precisamente el tipo de error que el entrenamiento intenta penalizar el doble, pero que sigue siendo el más frecuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Valkea/System1Router-effort
- Repositorio System1Router: https://github.com/Valkea/System1Router
- Guía de reentrenamiento: https://github.com/Valkea/System1Router/blob/main/experiments/TRAINING.md
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
