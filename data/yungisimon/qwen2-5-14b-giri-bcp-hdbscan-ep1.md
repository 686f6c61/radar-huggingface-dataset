# yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep1

## Resumen

yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon y publicado en Hugging Face bajo licencia Apache 2.0. El modelo se ha entrenado como "memory model", es decir, un modelo orientado a tareas de memoria y recuperación de información sobre pares de pregunta-respuesta sintéticos derivados de BrowseComp-Plus, agrupados mediante el algoritmo de clustering HDBSCAN.

El checkpoint publicado corresponde a la época 1 de un entrenamiento planificado de 3 épocas, sobre un conjunto de 754.069 ejemplos. Se trata de un modelo denso de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones), con pesos en bf16 safetensors y compatible con la librería `transformers` estándar mediante `AutoModelForCausalLM.from_pretrained`.

Su relevancia radica en que explora el ajuste fino de un modelo instructivo de tamaño medio para tareas específicas de memoria conversacional y recuperación cross-document, un área de interés creciente para sistemas de agentes y RAG. Al estar construido sobre Qwen2.5-14B-Instruct, hereda las capacidades generales del modelo base, incluyendo contexto largo y soporte multilingüe, aunque el autor no documenta explícitamente los idiomas soportados tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), basado en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 (100 % entrenables) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens (longitud máxima de secuencia durante el entrenamiento); el modelo base Qwen2.5-14B-Instruct soporta hasta 32.768 tokens nativos y 131.072 con RoPE scaling, aunque no se confirma que el ajuste preserve esa ventana |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors); al ser compatible con `transformers`, admite cuantizaciones estándar de la comunidad (GGUF, AWQ, GPTQ) no publicadas por el autor |
| Idiomas soportados | No disponible (el autor no documenta idiomas; el modelo base Qwen2.5 soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura transformer densa de Qwen2.5-14B-Instruct, sin modificaciones estructurales. El ajuste se realizó mediante full fine-tuning con FSDP (Fully Sharded Data Parallel) sobre 8 GPU AMD Instinct MI325X, con precisión bf16, gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente. La tasa de aprendizaje fue de 2e-05 con decaimiento constante y warmup del 5 %, weight decay de 0.01 y max grad norm de 1.0. El tamaño de lote efectivo fue de 1024 (128 por dispositivo, 1 acumulación, 8 GPU) y la longitud máxima de secuencia de 8.096 tokens.

Los datos de entrenamiento consisten en 754.069 ejemplos sintéticos de pregunta-respuesta generados a partir de BrowseComp-Plus y agrupados con HDBSCAN (min cluster size 2), bajo el fichero `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`. El entrenamiento completo de 3 épocas requirió 2,67 horas de reloj (21,4 GPU-horas). No se documenta el uso de RLHF, DPO ni otras técnicas de alineación adicionales; el modelo parte de un base ya instruido.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct y reforzada con el ajuste en pares QA.
- Memoria y recuperación de información cross-document: el entrenamiento con HDBSCAN sobre BrowseComp-Plus está orientado a combinar entidades y hechos procedentes de distintos documentos.
- Razonamiento sobre contexto: capacidad de integrar información de múltiples pasajes en una respuesta coherente.
- Soporte de plantilla de chat de Qwen (`apply_chat_template`), lo que facilita su integración en pipelines conversacionales.
- Compatibilidad con `text-generation-inference` y endpoints compatibles, según los tags del repositorio.
- Capacidades multilingües: no documentadas explícitamente para este checkpoint; el modelo base Qwen2.5 soporta varios idiomas, pero no se confirma su preservación tras el ajuste.
- Tool calling / function calling: no documentado en la información disponible para este checkpoint.
- Capacidades de agente y multi-step reasoning: no documentadas específicamente; el ajuste se centra en memoria y QA.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Sistemas de memoria conversacional: el modelo puede almacenar y recuperar información de interacciones previas en diálogos largos, gracias a su entrenamiento específico como memory model sobre pares QA sintéticos.
- Recuperación cross-document en RAG: adecuado para combinar entidades y hechos dispersos en múltiples documentos, una habilidad reforzada por el dataset de BrowseComp-Plus con clustering HDBSCAN.
- Asistentes de investigación documental: puede integrarse en pipelines que requieran sintetizar respuestas a partir de corpus heterogéneos, usando la plantilla de chat de Qwen para estructurar las consultas.
- Evaluación de técnicas de memoria en agentes: sirve como checkpoint de referencia (época 1 de 3) para estudiar el efecto del ajuste progresivo en tareas de memoria y recuperación.
- Generación de respuestas fundamentadas en contexto: útil en entornos donde se requiere que el modelo cite o integre información de pasajes proporcionados, con una ventana de 8.096 tokens durante el entrenamiento.
- Despliegue en infraestructura estándar: al ser compatible con `transformers` y TGI, puede servirse en clústeres con GPU AMD o NVIDIA para experimentación y prototipado.
- Fine-tuning posterior o investigación académica: al estar bajo Apache 2.0 y publicarse los pesos completos en bf16, es apto para experimentos de ajuste adicional o ablaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para pesos (14,77 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 40 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 15 GB para pesos; en 4 bits, alrededor de 8-9 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, AMD Instinct MI325X (usada en entrenamiento); para consumer, RTX 4090 (24 GB) solo cabría con cuantización de 4 bits y contexto reducido.
- Despliegue: `transformers` (AutoModelForCausalLM), `text-generation-inference` (TGI) según los tags; no se confirma soporte oficial de vLLM, llama.cpp u Ollama, aunque al ser un transformer Qwen2 estándar es probable que funcionen con conversión previa.
- Latencia y throughput: no disponibles; el autor solo reporta 21,4 GPU-horas para el entrenamiento completo de 3 épocas, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep1 | 14,77 B | 8.096 tokens (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint época 1 de 3, ajuste como memory model |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 nativos (131.072 con RoPE scaling) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base instructivo, sin ajuste específico de memoria |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 nativos | Apache 2.0 | Hugging Face | Alternativa de menor tamaño, menor coste de inferencia |
| Meta-Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 1 de 3): su rendimiento final puede diferir del modelo completamente entrenado; el autor no publica métricas de evaluación.
- Riesgo de alucinación: al ser un modelo generativo ajustado sobre datos sintéticos, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de memoria fuera de la distribución de entrenamiento.
- Ventana de contexto efectiva limitada a 8.096 tokens durante el entrenamiento, aunque el modelo base soporte más; el comportamiento más allá de esa longitud no está garantizado.
- Idiomas soportados no documentados: no se confirma que el ajuste preserve el multilingüismo del modelo base.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5 y de datos sintéticos, puede heredar sesgos del modelo base y del proceso de generación de datos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en el dominio objetivo.
- Disponibilidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Repositorio de 29,6 GB: requiere espacio de almacenamiento considerable y ancho de banda para su descarga.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- BrowseComp-Plus (referencia del dataset, no enlazado en la model card): no disponible
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
