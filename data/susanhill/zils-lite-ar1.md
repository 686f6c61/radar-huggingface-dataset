# SusanHill/zils-lite-ar1

## Resumen

zils-lite-ar1 es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario SusanHill bajo licencia Apache-2.0. El modelo se presenta como un "Zils d3-lite soup body", es decir, una variante afinada sobre un modelo base ya sometido a un proceso de fusión o mezcla (soup) previo, orientada específicamente a tareas de decisión: tool calling, razonamiento, reconocimiento de matices del lenguaje y recuperación de información. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se sitúa en la gama ultraligera, pensada para despliegue en entornos con recursos limitados.

El modelo hereda la arquitectura de Qwen3.5, aunque no se detalla en la información disponible si se trata de un transformer denso convencional o de una variante híbrida. El ajuste se realizó sobre "train-split decision items" de conjuntos de datos públicos que cubren cinco grandes familias: tool calling (Glaive), razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench), artes del lenguaje (emoción, ironía, sarcasmo, sentimiento), inferencia lingüística (MNLI, ANLI, RTE, STS-B) y recuperación (20 Newsgroups, Banking77, QNLI, CLINC).

La relevancia de este modelo radica en su enfoque en tareas de decisión y clasificación, más que en generación abierta, lo que lo hace adecuado para pipelines de enrutamiento, clasificación de intenciones y agentes ligeros. No obstante, la información pública es muy escasa: no hay datos de benchmarks, idiomas soportados, longitud de contexto ni detalles de entrenamiento más allá de la lista de datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (hereda del modelo base Qwen/Qwen3.5-0.8B; no se especifica si es densa o híbrida) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen/Qwen3.5-0.8B, que a su vez se describe como "el actual d3-lite soup", lo que sugiere que el punto de partida ya era una mezcla de pesos o un modelo previamente fusionado. No se especifica en la información disponible la arquitectura interna de Qwen3.5 (número de capas, dimensiones, tipo de atención, uso de atención lineal o decodificación especulativa), ni el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

El entrenamiento se realizó sobre "train-split decision items" de conjuntos públicos, agrupados en cinco categorías: tool calling (Glaive), razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench), artes del lenguaje (emoción, ironía, sarcasmo, sentimiento), inferencia lingüística (MNLI, ANLI, RTE, STS-B) y recuperación (20 Newsgroups, Banking77, QNLI, CLINC). No se detalla el número de ejemplos, la proporción por categoría, la configuración de LoRA (rango, alpha, módulos objetivo) ni la duración del entrenamiento.

## Capacidades

- Generación de texto y razonamiento de sentido común, entrenado explícitamente con SIQA, PIQA, CSQA y BIG-bench.
- Razonamiento matemático básico, con GSM8K en el conjunto de entrenamiento.
- Tool calling / function calling, con datos de Glaive.
- Clasificación de intención y enrutamiento, con Banking77 y CLINC.
- Análisis de sentimiento, emoción, ironía y sarcasmo.
- Inferencia lingüística (NLI) y similitud semántica (STS-B, MNLI, ANLI, RTE).
- Recuperación y clasificación de documentos (20 Newsgroups, QNLI).
- Capacidades multilingües: no disponibles (no declaradas).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la intención del usuario en categorías predefinidas (estilo Banking77/CLINC) para dirigir la petición al servicio adecuado, gracias a su ajuste específico en clasificación de intenciones.
- Clasificación de tickets de soporte: con datos de 20 Newsgroups y QNLI, puede asignar tickets a colas o departamentos según su contenido textual.
- Detección de sentimiento y sarcasmo en redes sociales: el ajuste en emoción, ironía y sarcasmo permite moderar o priorizar comentarios en plataformas con gran volumen de texto.
- Agente ligero con tool calling: al estar entrenado con Glaive, puede emitir llamadas a funciones en pipelines de automatización donde el presupuesto de cómputo es reducido.
- Filtro de razonamiento en cadenas de decisión: con SIQA, PIQA y CSQA, puede actuar como verificador o clasificador de sentido común en sistemas multi-etapa.
- Preprocesado de datos para recuperación: con QNLI y STS-B, puede puntuar pares pregunta-respuesta o similitud semántica en sistemas RAG ligeros.
- Evaluación de coherencia en generación: puede usarse como modelo juez de bajo coste para tareas de NLI y similitud semántica en pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos (852 M de parámetros), más overhead de activaciones y caché KV; en la práctica, alrededor de 2-3 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,5 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,5-1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); también cabe en GPUs de datacenter (A100, H100) aunque no las aprovecha.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs modernas con 4 GB o más.
- Opciones de despliegue: al ser un modelo con `custom_code` y basado en Qwen3.5, se recomienda usar `transformers` con `trust_remote_code=True`; para GGUF sería necesario convertirlo, ya que no se publican cuantizaciones. vLLM y TGI podrían requerir soporte específico para la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-ar1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible | Hugging Face |
| Alternativas de ~1 B (p. ej., Llama 3.2 1B, Gemma 2 2B) | 1-2 B | 8K-128K | licencias variables | Hugging Face |

No se dispone de datos de rendimiento comparativo para zils-lite-ar1, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Información pública muy escasa: no se declaran idiomas, contexto, benchmarks ni detalles de entrenamiento, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación inherente a modelos de ~0,85 B, especialmente en generación abierta y razonamiento multi-paso.
- El ajuste está orientado a tareas de decisión y clasificación; su rendimiento en generación libre o conversación abierta puede ser limitado.
- Posibles sesgos heredados de los datasets de entrenamiento (Glaive, BIG-bench, 20 Newsgroups, etc.), no documentados.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene auditar antes de usarlo en producción.
- Aunque la licencia es Apache-2.0, el modelo base Qwen3.5 puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de uso comercial.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en llama.cpp u Ollama sin conversión previa.
- Sin métricas de latencia ni throughput publicadas.

## Enlaces

- [Hugging Face: SusanHill/zils-lite-ar1](https://huggingface.co/SusanHill/zils-lite-ar1)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
