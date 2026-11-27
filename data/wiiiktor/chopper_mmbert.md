# wiiiktor/chopper_mmbert

## Resumen

Chopper mmBERT es un modelo encoder de compresión de contexto diseñado para pipelines de generación aumentada por recuperación (RAG). Su función no es responder preguntas, sino leer los fragmentos que devuelve un recuperador (procedentes de una base de datos documental o de una conversación larga) y extraer únicamente las citas literales que contienen la respuesta, típicamente entre el 3 % y el 5 % del texto original. La salida es texto plano sin reescritura, de modo que los fragmentos resultantes pueden alimentar a cualquier modelo generador posterior.

Lo desarrolla el usuario wiiiktor y se construye sobre la familia mmBERT de jhu-clsp (mmBERT-base y mmBERT-small) y sobre pl-ModernBERT-base de OPI PIB para el caso polaco. El modelo recomendado, mmbert-base, tiene 0,31 mil millones de parámetros; la variante small, 0,14 mil millones. Admite entradas de hasta 8.192 tokens con el formato `Question: <pregunta> [SEP] <pasaje 1> [SEP] … [SEP] <pasaje N>` y emite, token a token, una probabilidad de conservación (p(KEEP)).

Su relevancia actual radica en que reduce drásticamente el coste de contexto en sistemas RAG multi-salto: en la evaluación sobre MuSiQue, el modelo recorta 2.620 tokens de veinte fragmentos hasta 228 tokens manteniendo o mejorando la precisión del generador en preguntas de 2 a 4 saltos. Además, el mismo pase de inferencia sirve como reranker competitivo, lo que permite eliminar una etapa separada del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT / ModernBERT), clasificación token a token |
| Parametros totales | 0,31B (mmbert-base); 0,14B (mmbert-small); 0,15B (plmodernbert-base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada |
| Tipos de cuantizacion | No disponible (se distribuyen safetensors y ONNX) |
| Idiomas soportados | Multilingüe (8 idiomas en el conjunto de rerank); variantes específicas para polaco |
| Licencia | MIT (pl-ModernBERT-base: Apache 2.0) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de encoders mmBERT (jhu-clsp) y pl-ModernBERT-base (OPI PIB), arquitecturas transformer con atención moderna optimizada para contextos largos. Sobre ellas se aplica un ajuste supervisado para predecir, para cada token de entrada, la probabilidad de que pertenezca a una cita que responda a la pregunta. La decodificación se realiza con umbral p > 0,5, fusionando huecos de hasta 5 tokens y descartando segmentos de menos de 4 tokens.

El conjunto de entrenamiento de la variante base consta de 102.654 filas en una única ejecución mixta: preguntas multi-salto de MuSiQue (incluidas las no respondibles), HotpotQA y 2WikiMultiHopQA; pools de rerank en 8 idiomas; artículos científicos de QASPER; y conversaciones de WildChat y Multi-Session Chat. Las variantes polacas añaden 15.652 filas de PoQuAD y PolQA mezcladas con 15.935 filas del conjunto original; la variante plmodernbert-base incorpora además 12.753 filas de multi-salto en polaco (MuSiQue traducido) y adapta todo el conjunto al tokenizador polaco. No se documenta en la información disponible el uso de RLHF o DPO. La innovación principal es el uso de un único pase para dos tareas: extracción de citas y puntuación de pasajes para rerank.

## Capacidades

- Extracción de citas literales (chops) que responden a una pregunta, sin reescritura, a partir de hasta 8.192 tokens de contexto.
- Compresión de contexto multi-salto: conserva las cadenas de evidencia necesarias en preguntas de 1 a 4 saltos.
- Detección de preguntas no respondibles: emite la etiqueta SEARCH cuando la respuesta no está en los pasajes (67 % de acierto en pools con las frases respuesta eliminadas, 8 idiomas).
- Reranking de pasajes en un solo pase: puntúa cada pasaje con la media de p(KEEP) de sus 16 tokens más probables.
- Capacidad multilingüe en 8 idiomas para rerank; variantes específicas para polaco.
- Integración con pipelines RAG mediante la librería `chopper-rag` y componentes para LangChain, LlamaIndex y Haystack.
- Soporte de listas largas de candidatos mediante ranking por rondas (bloques de 50, mejores 25 releídos, mejores 10 una vez más).
- No dispone de generación de texto, tool calling ni modo de razonamiento: es exclusivamente un componente de recuperación y filtrado.

## Casos de uso

- Atención al cliente sobre bases documentales: el modelo recorta los fragmentos recuperados de un manual o histórico de tickets a las citas relevantes, reduciendo el contexto enviado al generador y el coste por consulta.
- RAG multi-salto en dominios técnicos: para preguntas que requieren combinar evidencia de varios documentos, conserva las frases de cada salto (45 % de acierto a 3 saltos frente al 22 % con todos los fragmentos) con una décima parte de tokens.
- Reranking en pipelines existentes: sustituye a un reranker dedicado (nDCG@10 de 0,973 frente a 0,984 de bge-reranker-v2-m3) con 0,20 s por consulta en una RTX 3090, incluyendo la extracción de citas.
- Procesamiento de conversaciones largas: filtra el historial de sesiones multi-turno (Multi-Session Chat) para quedarse con los turnos que contienen la información necesaria antes de pasarlos al modelo generador.
- Documentación científica y técnica: sobre artículos de QASPER, extrae las frases que responden a preguntas de investigación, útil en asistentes de revisión bibliográfica.
- Sistemas RAG en polaco: la variante plmodernbert-base permite responder con 240 tokens lo que requeriría 3.856, con una precisión del 86,2 % frente al 85,2 % usando todos los fragmentos.
- Reducción de latencia y coste en producción: al recortar el contexto un 90-95 %, disminuye el tiempo de prefill y el consumo de memoria del generador, lo que facilita desplegar modelos grandes con presupuestos ajustados.
- Detección de recuperaciones fallidas: la etiqueta SEARCH permite activar una segunda ronda de recuperación o una respuesta de abstención cuando los pasajes no contienen la respuesta.

## Benchmarks y rendimiento

Multi-hop sobre 400 preguntas de MuSiQue dev (100 por nivel de saltos), con Qwen3-14B (4 bits) como generador y gpt-5.6-luna como juez. Respuestas correctas; entre paréntesis, solo preguntas cuyos chops conservaron todos los saltos y la respuesta:

| Generador responde desde | Tokens | 1 salto | 2 saltos | 3 saltos | 4 saltos |
|---|---|---|---|---|---|
| los 20 fragmentos | 2.620 | 84 | 28 | 22 | 12 |
| chops de mmBERT-base | 228 | 83 (82) | 48 (44) | 45 (35) | 29 (21) |
| chops de mmBERT-small | 217 | 72 (67) | 49 (41) | 32 (22) | 23 (11) |
| chops de Claude Opus 5.5 | 144 | 90 (90) | 64 (60) | 55 (40) | 43 (30) |

Validación (F1 de caracteres del texto conservado / proporción de preguntas cuya respuesta está en el texto conservado):

| Chopper | MuSiQue | HotpotQA | TriviaQA | QASPER | Multi-Session Chat | Rerank, 8 idiomas |
|---|---|---|---|---|---|---|
| base | .56 / .55 | .63 / .85 | .42 / .69 | .30 / .32 | .68 / .59 | .52 |
| small | .54 / .49 | .60 / .80 | .32 / .64 | .26 / .28 | .63 / .59 | .47 |

Reranking sobre 16 pasajes por consulta en el holdout de 8 idiomas (400 consultas):

| Modelo | nDCG@10 | Hit@1 | Tiempo GPU por consulta (RTX 3090) |
|---|---|---|---|
| mmBERT-base chopper, un pase | 0,973 | 0,972 | 0,20 s (chops incluidos) |
| bge-reranker-v2-m3 | 0,984 | 0,985 | 0,20 s |
| Qwen3-Reranker-0.6B | 0,977 | 0,972 | 0,77 s |
| Qwen3-Reranker-4B | 0,986 | 0,990 | 3,3 s |

MTEB (enviado, pendiente de revisión): HotpotQAHardNegatives NDCG@10 0,876; WikipediaRerankingMultilingual 0,972; RuBQReranking 0,816; HotpotQA-PLHardNegatives 0,757.

Polaco (856 preguntas, Qwen3-14B, porcentaje de respuestas correctas):

| Generador responde desde | Tokens | PoQuAD | PolQA | Total |
|---|---|---|---|---|
| los 16 fragmentos | 3.856 | 72,5 | 94,2 | 85,2 |
| chops de mmBERT-base | 231 | 63,2 | 82,6 | 74,5 |
| chops de mmBERT-base-pl | 255 | 77,2 | 91,6 | 85,6 |
| chops de mmBERT-small-pl | 266 | 75,6 | 90,2 | 84,1 |
| chops de plmodernbert-base | 240 | no disponible | no disponible | 86,2 |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp16 para la variante base (0,31B parámetros); alrededor de 0,5 GB para small. En la práctica, la memoria la domina el contexto de 8.192 tokens y el tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo cabe holgadamente en RTX 3090, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; incluso en CPU es viable con ONNX.
- Despliegue: los pesos se distribuyen en safetensors y ONNX; la librería `chopper-rag` (pip) ofrece integración directa, y existen componentes para LangChain, LlamaIndex y Haystack. No se documenta soporte específico para vLLM, llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput: 0,20 s por consulta en una RTX 3090 para reranking de 16 pasajes, incluyendo la extracción de citas. No se dispone de cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chopper mmBERT-base | 0,31B | 8.192 | Compresión de contexto + rerank | MIT | Hugging Face |
| bge-reranker-v2-m3 | No disponible | No disponible | Rerank | No disponible | Hugging Face |
| Qwen3-Reranker-0.6B | 0,6B | No disponible | Rerank | No disponible | Hugging Face |
| Qwen3-Reranker-4B | 4B | No disponible | Rerank | No disponible | Hugging Face |

Frente a los rerankers dedicados, Chopper ofrece nDCG@10 ligeramente inferior (0,973 frente a 0,984 de bge-reranker-v2-m3 y 0,986 de Qwen3-Reranker-4B) pero con la ventaja de extraer las citas en el mismo pase y con la latencia del modelo más rápido (0,20 s, frente a 3,3 s del 4B). No se dispone de datos de parámetros ni contexto de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas por sí mismo, solo selecciona texto; requiere un generador posterior.
- La precisión en preguntas de 4 saltos es limitada (29 % con chops frente a 84 % a 1 salto); las cadenas de evidencia largas siguen siendo un punto débil.
- En TriviaQA y QASPER el F1 de caracteres es bajo (.42 y .30), lo que indica que la extracción puede perder parte del texto relevante en dominios alejados del entrenamiento.
- Riesgo de eliminar evidencia necesaria: si el recorte descarta una frase clave, el generador responderá mal sin posibilidad de recuperarla; conviene monitorizar la tasa de abstención (SEARCH).
- El umbral de decodificación (p > 0,5) y la fusión de huecos son hiperparámetros que afectan al equilibrio entre compresión y cobertura.
- La variante plmodernbert-base usa un tokenizador exclusivamente polaco; para texto mixto debe usarse mmbert-base-pl.
- Los resultados de MTEB están pendientes de revisión, por lo que las cifras no son definitivas.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al ser un extractor, puede heredar sesgos de los corpus de entrenamiento (MuSiQue, HotpotQA, WildChat).
- Licencia MIT permite uso comercial, pero el modelo base pl-ModernBERT-base es Apache 2.0 y mmBERT de jhu-clsp debe verificarse según sus términos.
- El repositorio ocupa 4,8 GB e incluye múltiples variantes; conviene descargar solo la carpeta necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wiiiktor/chopper_mmbert
- Código y demo: https://github.com/wiiiktor/chopper_demo
- Detalles técnicos: https://github.com/wiiiktor/chopper_demo/blob/main/docs/DETAILS.md
- Dataset de demostración: https://huggingface.co/datasets/wiiiktor/chopper_demo
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo base pl-ModernBERT-base: https://huggingface.co/OPI-PIB/pl-ModernBERT-base
- Resultados MTEB (PR pendiente): https://github.com/embeddings-benchmark/results/pull/850
- Paper de PolQA: https://aclanthology.org/2024.lrec-main.1125
- Modelo polish-roberta-base-8k: https://huggingface.co/sdadas/polish-roberta-base-8k
