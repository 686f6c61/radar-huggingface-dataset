# typestrict/TS-moBERTo-150M

## Resumen

TS-moBERTo-150M es un encoder de decisión desarrollado por typestrict.ai, publicado en Hugging Face con licencia Apache 2.0. No es un modelo generativo: recibe una pregunta, un estado (el contexto o texto a evaluar) y un conjunto de opciones, y devuelve una probabilidad calibrada para cada opción junto con una medida de confianza. Está construido sobre el modelo base `Tropic-AI/moBERTo-orig-tokenizer` y cuenta con 149.614.978 parámetros reales según los pesos en safetensors.

El modelo cubre tres tipos de decisión tipada: `choice` (elegir una opción entre varias), `noul` (determinar si un enunciado es verdadero) y `score` (asignar un valor sobre una rúbrica ordenada). Soporta inglés y portugués, con una ventana de contexto de 8.192 tokens, y se distribuye también en formato ONNX para ejecución en CPU sin GPU. Según la model card, se publicó anteriormente con el nombre de Dinah-1 y es la base por defecto de todos los entrenamientos nuevos de la plataforma typestrict.ai.

Su relevancia práctica está en el coste: un encoder de 150M parámetros que corre en CPU permite incorporar clasificación, enrutado y evaluación automática en pipelines donde un LLM generativo resultaría demasiado caro o lento. El interés es limitado fuera de inglés y portugués, y en la información disponible no hay resultados numéricos de benchmarks públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (etiqueta `modernbert`; derivado de `Tropic-AI/moBERTo-orig-tokenizer`) |
| Parametros totales | 149.614.978 (aproximadamente 150M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible. Se distribuyen pesos en safetensors y ficheros ONNX; no se detallan variantes cuantizadas (INT8, FP16, etc.) en la información disponible |
| Idiomas soportados | Inglés (en) y portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |
| Pipeline / tarea | `text-classification` (feature-extraction en las etiquetas) |
| Tipos de decisión | `choice`, `noul`, `score` |
| Modelo base | `Tropic-AI/moBERTo-orig-tokenizer` |
| Tamaño del repositorio | 1,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 19 de octubre de 2026 (última actualización: 20 de octubre de 2026) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo con la etiqueta `modernbert` y lo sitúa como derivado de `Tropic-AI/moBERTo-orig-tokenizer`, un encoder de la familia ModernBERT. Se trata, por tanto, de un transformer bidireccional de tipo encoder, no de un modelo autorregresivo: no genera texto, sino que produce una distribución de probabilidad sobre un conjunto finito de opciones definido por el usuario. Los 149,6M de parámetros y la ventana de 8.192 tokens son coherentes con la escala de ModernBERT-base, aunque la información proporcionada no detalla la configuración exacta de capas, dimensiones ocultas ni mecanismo de atención.

Respecto al entrenamiento, la model card indica que los pesos se entrenaron únicamente con datos cuya licencia lo permite y que la composición del dataset aparece listada en la propia tarjeta, pero ese listado no está incluido en la información disponible (la transcripción está truncada). No se especifican el número de tokens, la mezcla de idiomas, ni si se aplicaron etapas de RLHF, DPO o ajuste con preferencias. La innovación diferencial declarada es el enfoque de "decisiones tipadas": el modelo no se limita a clasificar, sino que emite una probabilidad por opción y una confianza asociada en tres modalidades (`choice`, `noul`, `score`), lo que permite umbralizar y auditar las respuestas. El modelo se integra en la familia TS junto a TS-Ettin-150M, TS-Ettin-68M, TS-Ettin-32M y TS-Ettin-17M (estos últimos solo en inglés), todos entrenados con la misma receta y evaluados con el denominado Decision Index (versión 0.3 en esta publicación).

## Capacidades

- Clasificación con probabilidades calibradas: devuelve una probabilidad por cada opción y una confianza agregada, lo que permite fijar umbrales de aceptación o derivar a revisión humana.
- Decisión de tipo `choice`: seleccionar una opción entre un conjunto arbitrario definido en tiempo de inferencia (categorías, intenciones, etiquetas).
- Decisión de tipo `noul`: verificar si un enunciado es verdadero o falso dados un contexto y una afirmación.
- Decisión de tipo `score`: asignar un valor sobre una rúbrica ordenada (por ejemplo, una escala de calidad de 1 a 5).
- Bilingüe inglés-portugués, tanto en la entrada como en las opciones.
- Contexto de 8.192 tokens, adecuado para documentos medios, hilos de conversación o bloques de código sin truncar.
- Ejecución en CPU: se distribuyen ficheros ONNX específicos para inferencia sin GPU.
- Integración con el ecosistema Transformers y con text-embeddings-inference (etiqueta `endpoints_compatible`).
- Servicio de ajuste fino propio: la plataforma typestrict.ai permite reentrenar esta base con datos del usuario y evaluarla contra el conjunto de referencia Jev.

No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión, audio ni generación de texto libre.

## Casos de uso

- Enrutado de tickets de soporte: usar `choice` para mapear cada consulta entrante a una categoría (facturación, incidencias técnico, cancelaciones) con la probabilidad por categoría, de modo que los casos con confianza baja se deriven a un humano. El coste en CPU permite procesar lotes grandes sin GPU.
- Moderación y verificación de afirmaciones: con `noul`, comprobar si una frase concreta está respaldada por un fragmento de contexto, útil para filtrar respuestas de un RAG antes de mostrarlas al usuario.
- Evaluación automática de salidas de LLM: con `score`, puntuar respuestas generadas sobre una rúbrica ordenada (precisión, completitud, tono) y usar la confianza para marcar las evaluaciones dudosas. La ventana de 8.192 tokens permite incluir pregunta, respuesta y criterios en una sola pasada.
- Re-ranking en pipelines de búsqueda: dado un par consulta-documento, decidir con `noul` si el documento es relevante, como etapa intermedia entre un retriever barato y un re-ranker neuronal más caro.
- Clasificación de documentos en portugués: etiquetado de contratos, correos o reseñas para clientes en Brasil o Portugal, aprovechando el soporte nativo de `pt` sin necesidad de un modelo separado.
- Anotación asistida y active learning: preetiquetar grandes volúmenes de texto con `choice` y priorizar para revisión humana los ejemplos con menor confianza, reduciendo el coste de anotación.
- Extracción de señales en formularios y encuestas: convertir respuestas abiertas cortas en categorías normalizadas con `choice`, ejecutable en el propio servidor de aplicaciones sin GPU.
- Base para modelos verticales: punto de partida para ajustar un decisor específico de dominio mediante la plataforma typestrict.ai y medirlo contra ejemplos retenidos con Jev.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona el "Decision Index 0.3" como índice agregado de la familia TS y el conjunto de evaluación Jev para validar modelos ajustados, pero no incluye cifras de MMLU, GLUE, SuperGLUE ni de tareas de clasificación comparables.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | No aplica (modelo encoder no generativo) |
| Decision Index | 0.3 (versión del índice reportada en la figura; sin valores por tarea) |
| Evaluación Jev | Mencionada como referencia de evaluación; sin cifras publicadas en la información disponible |
| Métricas de clasificación (accuracy, F1, calibración) | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (unos 600 MB solo de pesos, más activaciones y overhead del runtime); aproximadamente 300 MB en FP16 y 150 MB en INT8 si se aplica cuantización, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer sirve para acelerar el proceso (RTX 3060, RTX 4090, T4), pero el caso de uso declarado es CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 de 4 GB, y también en memoria del sistema sin GPU dedicada.
- Opciones de despliegue: Transformers (librería declarada), ONNX Runtime con los ficheros ONNX incluidos, text-embeddings-inference (etiqueta `endpoints_compatible`) y despliegue en endpoints de Hugging Face. El soporte en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor solo indica que es "suficientemente rápido para una CPU", sin cifras de tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| TS-moBERTo-150M | 149,6M | 8.192 | en, pt | Apache 2.0 | Decisiones tipadas con probabilidad y confianza; ONNX para CPU |
| TS-Ettin-150M | 150M | No disponible | en | Apache 2.0 (según familia TS) | Misma receta y familia; solo inglés |
| TS-Ettin-68M | 68M | No disponible | en | Apache 2.0 (según familia TS) | Versión reducida, más rápida, presumiblemente menos precisa |
| TS-Ettin-32M | 32M | No disponible | en | Apache 2.0 (según familia TS) | Orientado a entornos muy limitados |
| ModernBERT-base (referencia externa) | 149M | 8.192 | Principalmente en | Apache 2.0 | Encoder generalista; requeriría una cabeza de clasificación propia y no ofrece el formato de decisión tipada |

Los datos de TS-Ettin-150M, TS-Ettin-68M y TS-Ettin-32M provienen de la tabla de familia de la propia model card; no se detallan contexto, licencia por modelo ni rendimiento. La fila de ModernBERT-base se incluye como referencia pública del modelo del que deriva la arquitectura y no forma parte de la información proporcionada. No hay comparativas de rendimiento publicadas frente a ninguno de estos modelos.

## Limitaciones y advertencias

- Cobertura lingüística restringida a inglés y portugués; no declara soporte de castellano ni de otras lenguas, por lo que su uso en español no está validado.
- No es un modelo generativo: no produce texto libre, no mantiene diálogos multi-turno por sí mismo y no ejecuta razonamiento multi-paso. Solo elige entre opciones predefinidas.
- El conjunto de opciones debe proporcionarlo el usuario en cada petición; la calidad de la decisión depende de cómo se formulen las opciones y del orden o la granularidad de las mismas.
- Riesgo de calibración deficiente fuera del dominio de entrenamiento: la confianza reportada no está validada con métricas publicadas de calibración (ECE, Brier) en la información disponible.
- La composición del dataset de entrenamiento no está accesible (la model card aparece truncada), por lo que no se pueden evaluar sesgos demográficos, geográficos o de dominio.
- Modelo reciente y con cero descargas y cero likes en el momento de la consulta: no hay validación independiente ni reportes de terceros.
- Sin benchmarks numéricos públicos, la comparación con alternativas debe hacerse con evaluación propia sobre datos retenidos.
- Licencia Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia del modelo base `Tropic-AI/moBERTo-orig-tokenizer` y las condiciones de la plataforma typestrict.ai para modelos derivados.
- El uso en decisiones de alto riesgo (crédito, salud, selección de personal) requiere supervisión humana y auditoría de calibración por subgrupos.
- El rendimiento en secuencias cercanas al máximo de 8.192 tokens no está documentado; la eficiencia de atención en contextos largos puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typestrict/TS-moBERTo-150M
- Organización typestrict en Hugging Face: https://huggingface.co/typestrict
- Sitio del autor: https://typestrict.ai
- Documentación de modelos base: https://docs.typestrict.ai/base-models
- Documentación del servidor MCP para asistentes de IA: https://docs.typestrict.ai/agents
- Repositorio de la CLI: https://github.com/typestrict-lab/cli
- Modelo base: https://huggingface.co/Tropic-AI/moBERTo-orig-tokenizer
- Ficha de TS-Ettin-150M: https://huggingface.co/typestrict/TS-Ettin-150M
- Ficha de TS-Ettin-68M: https://huggingface.co/typestrict/TS-Ettin-68M
- Ficha de TS-Ettin-32M: https://huggingface.co/typestrict/TS-Ettin-32M
- Ficha de TS-Ettin-17M: https://huggingface.co/typestrict/TS-Ettin-17M
- Licencia: https://huggingface.co/typestrict/TS-moBERTo-150M/blob/main/LICENSE
