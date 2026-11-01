# workmagicio/workmagic-jev-decision-qwen3-8b-sft-v2

## Resumen

AnyJev decision model v2 es un ajuste fino mediante LoRA de segunda etapa sobre Qwen3-8B, desarrollado por workmagicio. El modelo no está pensado para generación de texto libre, sino como un "modelo de decisión" que recibe un estado y una pregunta junto con un conjunto de opciones, y devuelve una decisión tipada entre ellas. Se distribuye a través de la librería propia `anyjev`, que expone una interfaz `Tacit` con el método `decide(state, question, options)`.

La segunda etapa (stage-2) parte del modelo de decisión v1 y añade datos de recuperación (MS MARCO, HotpotQA) y de selección de herramientas (function calling de xLAM), con replay del conjunto de la v1 para evitar olvido catastrófico. El entrenamiento cubre además un conjunto amplio de tareas de clasificación, QA y razonamiento (entre ellas gsm8k, medqa, squad, snli, mnli, xnli en inglés), lo que sugiere un objetivo de decisión genérica sobre opciones predefinidas más que de generación abierta.

El modelo tiene 8.190.735.360 parámetros (aproximadamente 8,19 mil millones), se basa en la arquitectura Qwen3-8B y se publica en formato safetensors con un repositorio de 16,4 GB. Es relevante para quienes necesitan un componente de decisión estructurada (enrutado, selección de herramienta, clasificación entre candidatos) sobre una base Qwen3, aunque su adopción está condicionada por el uso de la librería `anyjev` y por la ausencia de datos públicos de rendimiento y de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3-8B) con adaptador LoRA de stage-2; interfaz de decisión tipada vía librería `anyjev` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B |
| Librería | anyjev |
| Tamaño del repositorio | 16,4 GB |
| Pipeline | text-generation |
| Fecha de creación | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-8B, un transformer de aproximadamente 8,19 mil millones de parámetros, mediante un adaptador LoRA de segunda etapa aplicado sobre el modelo de decisión v1 de AnyJev. La innovación principal no está en la arquitectura del transformer, sino en la capa de abstracción: la librería `anyjev` expone una clase `Tacit` con un método `decide(state, question, options)` que devuelve una decisión tipada entre las opciones proporcionadas, con un modo `adaptive=False` en la carga. Esto convierte al modelo en un decisor sobre un espacio cerrado de opciones en lugar de un generador abierto.

Los datos de entrenamiento (splits de entrenamiento únicamente) incluyen un conjunto heterogéneo: clasificación de noticias y sentimiento (ag_news, amazon_polarity, imdb, rotten_tomatoes, yelp5, emotion, sst2), inferencia textual y NLI (snli, mnli, glue_qnli, glue_rte, glue_sst2, xnli_en), QA de dominio (medqa, medmcqa, pubmedqa, sciq, qasc, quartz), matemáticas (gsm8k, aqua_rat, mgsm_en), recuperación (msmarco, hotpotqa, squad, squad_v2), clasificación temática (dbpedia14, newsgroups20) y replay del conjunto v1. Las opciones se permutan de forma determinista para evitar sesgos posicionales, y se indica explícitamente que GPQA-Diamond no se utiliza. No se detalla el número de tokens de entrenamiento, la composición exacta por tarea ni si hubo RLHF o DPO; la métrica declarada es `accuracy`.

## Capacidades

- Decisión tipada entre opciones: dado un estado, una pregunta y una lista de opciones, devuelve una elección mediante la interfaz `Tacit.decide`.
- Clasificación de texto en dominios diversos: noticias, sentimiento, emoción, temas y reseñas.
- Inferencia textual y NLI: entailment, contradicción y neutralidad sobre pares de frases.
- QA extractivo y de opción múltiple en dominios médico, científico y de cultura general.
- Razonamiento aritmético básico sobre problemas tipo GSM8K y AQuA-RAT.
- Recuperación y selección de pasajes: entrenado con MS MARCO, HotpotQA y SQuAD.
- Selección de herramientas y function calling: datos de xLAM para elegir la función adecuada.
- Soporte multilingüe limitado al inglés (etiqueta `en`); no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Enrutado de consultas en atención al cliente: el modelo recibe el estado de la conversación y una lista de intenciones o colas de soporte, y devuelve la etiqueta correcta, aprovechando el entrenamiento en clasificación y NLI para desambiguar peticiones.
- Selección de herramientas en agentes: con los datos de xLAM, el modelo puede elegir qué función invocar de un catálogo dado un estado y una pregunta, actuando como router de tool calling dentro de un pipeline de agentes.
- Clasificación de tickets y correos: entrenado en ag_news, dbpedia14, newsgroups20 y yelp5, puede asignar categorías predefinidas a documentos entrantes en flujos de triaje.
- Filtrado y ranking de pasajes en RAG: el entrenamiento en MS MARCO y HotpotQA permite usar `decide` para seleccionar el pasaje o documento más relevante entre un conjunto de candidatos recuperados.
- Verificación de respuestas en pipelines de QA: con datos de SQuAD, SQuAD v2 y NLI, puede clasificar si una respuesta candidata es correcta, incorrecta o no respondible.
- Triage médico y científico asistido: los conjuntos medqa, medmcqa, pubmedqa y sciq permiten usar el modelo para preseleccionar opciones en cuestionarios de dominio, siempre con supervisión humana.
- Evaluación de opciones en pruebas estandarizadas: con gsm8k, aqua_rat y mgsm_en, puede elegir la respuesta correcta entre alternativas en problemas aritméticos y de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara la métrica `accuracy` pero no proporciona valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un transformer de 8,19 mil millones de parámetros, en FP16 se requieren aproximadamente 16,4 GB solo para los pesos (coincide con el tamaño del repositorio), a los que hay que sumar memoria para el contexto y el runtime.
- GPU recomendadas: no disponibles. Por tamaño, un modelo de 8B en FP16 encaja en GPU de 24 GB o más (por ejemplo, RTX 4090, A10G, L4 en cuantización, A100 40/80 GB, H100).
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) en FP16/BF16, y en GPUs de 12-16 GB con cuantización, aunque no se confirman cuantizaciones publicadas.
- Opciones de despliegue: la vía documentada es la librería `anyjev` (`Tacit.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni la disponibilidad de pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| workmagic-jev-decision-qwen3-8b-sft-v2 | 8,19 B | No disponible | Decisor LoRA sobre Qwen3-8B | No disponible | HuggingFace, librería `anyjev` |
| Qwen/Qwen3-8B (base) | 8,19 B | No disponible en esta ficha | LLM generativo | No disponible en esta ficha | HuggingFace |
| Modelo de decisión v1 de AnyJev | No disponible | No disponible | Decisor previo (replay en v2) | No disponible | HuggingFace (referenciado en la model card) |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; es un bloqueo para producción hasta verificarlo.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Dependencia de la librería `anyjev`: la interfaz de decisión requiere esta librería, lo que limita la portabilidad frente a runtimes estándar.
- Modelo de decisión cerrada: no está diseñado para generación abierta; su uso fuera del patrón `decide(state, question, options)` puede dar resultados no representativos.
- Riesgo de alucinación: aunque el espacio de salida está restringido a opciones, la selección puede ser incorrecta en dominios poco representados o con opciones ambiguas.
- Sesgos: los datasets de entrenamiento (noticias, reseñas, NLI, QA médico) pueden introducir sesgos de dominio, estilo y demografía; no se documentan análisis de sesgo.
- Sin datos de benchmarks ni de evaluación independiente: no hay evidencia pública de accuracy ni de robustez.
- Sin información sobre contexto máximo, cuantizaciones ni latencia: dificulta el dimensionamiento en producción.
- Uso médico o científico: los conjuntos medqa y pubmedqa no habilitan uso clínico; se requiere supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/workmagicio/workmagic-jev-decision-qwen3-8b-sft-v2
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de la librería `anyjev` ni demos.
