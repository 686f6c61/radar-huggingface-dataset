# yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep2

## Resumen

`yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep2` es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon y publicado en Hugging Face. El modelo se ha especializado como **modelo de memoria** (memory model) entrenado sobre pares sintéticos de pregunta-respuesta generados a partir de BrowseComp-Plus, con el objetivo de agrupar y consolidar información dispersa entre múltiples documentos. La variante concreta emplea la estrategia de agrupación de entidades `entity_grping` con un límite de frecuencia documental máxima de 3.

El checkpoint publicado corresponde a la **época 2 de 3** de un entrenamiento con 3.046.524 ejemplos sintéticos. Se trata de un modelo de 14.770.033.664 parámetros (14,77 mil millones) en formato bf16 safetensors, cargable con `transformers` estándar mediante `AutoModelForCausalLM.from_pretrained` y la plantilla de chat de Qwen.

Su relevancia es acotada y de nicho: no es un modelo generalista, sino un artefacto de investigación orientado a tareas de memoria y agregación de información entre documentos. El modelo tiene cero descargas y cero likes en el momento de la consulta, y no dispone de datos publicados de benchmarks ni de idiomas soportados explícitos más allá de los heredados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), no disponible el detalle exacto de capas y cabezas en la informacion proporcionada |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso una longitud maxima de secuencia de 8096 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; los pesos estan en bf16 safetensors (cuantizable a posteriori con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5-14B-Instruct, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2 de tipo transformer decoder-only propia de Qwen2.5-14B-Instruct, sin modificaciones estructurales: el ajuste es un **full fine-tuning** con el 100 % de los parámetros entrenables (14.770.033.664). El entrenamiento se realizó con FSDP sobre 8 GPU AMD Instinct MI325X, con un tamaño de lote efectivo de 1024 (128 por dispositivo, 1 paso de acumulación, 8 GPU), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay de 0,01, recorte de norma de gradiente de 1,0 y precisión bf16 con checkpointing de gradientes. La pérdida se calcula únicamente sobre los tokens del asistente.

El conjunto de datos de entrenamiento son pares sintéticos de pregunta-respuesta derivados de BrowseComp-Plus, con 3.046.524 ejemplos generados mediante la estrategia de agrupación de entidades `entity_grping` (frecuencia documental máxima de 3) y combinación de entidades entre documentos (fichero `bcp_subset300_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`). El entrenamiento completo de 3 épocas requirió 10,08 horas de reloj (80,6 GPU-horas); el checkpoint publicado corresponde a la época 2. No se documentan fases de RLHF o DPO adicionales ni innovaciones arquitectónicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen, heredada del modelo base instructivo.
- Memoria y agregación de información entre documentos: el modelo está entrenado específicamente para consolidar y agrupar entidades dispersas en múltiples fuentes.
- Razonamiento multi-paso orientado a la recuperación y síntesis de información (según el diseño del dataset de entrenamiento).
- Capacidades generales heredadas de Qwen2.5-14B-Instruct: razonamiento, código, matemáticas y multilingüismo, aunque no se han validado tras el ajuste fino.
- No se documenta soporte explícito de tool calling ni function calling en la model card.
- No se documenta modo thinking, visión ni audio.
- No se publican evaluaciones de capacidades tras el ajuste fino.

## Casos de uso

- **Sistemas de memoria de agentes**: el modelo puede actuar como módulo de memoria que agrupa entidades y hechos dispersos en el historial de un agente conversacional, consolidando información de múltiples turnos o documentos en representaciones coherentes.
- **Preguntas y respuestas multi-documento**: dado un conjunto de documentos con entidades repetidas o relacionadas, el modelo puede sintetizar respuestas que integren información cruzada, gracias a su entrenamiento sobre pares sintéticos de BrowseComp-Plus.
- **Construcción de grafos de entidades**: la estrategia `entity_grping` con límite de frecuencia documental lo hace adecuado para tareas de resolución de entidades y agrupación en pipelines de extracción de conocimiento.
- **Enriquecimiento de bases de conocimiento**: puede emplearse para fusionar registros duplicados o relacionados procedentes de fuentes heterogéneas antes de su ingesta en una base de datos.
- **Investigación en modelos de memoria**: sirve como checkpoint de referencia para estudiar el efecto del full fine-tuning sobre la capacidad de memoria y agregación de un modelo instructivo de 14 B.
- **Prototipado de asistentes documentales**: con 14,77 B parámetros y licencia Apache 2.0, puede desplegarse en entornos de investigación para asistentes que necesiten recordar y relacionar entidades a lo largo de conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de la tarea de memoria.

## Requisitos de hardware

- **VRAM estimada en bf16**: aproximadamente 29,6 GB solo para los pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; se recomienda al menos 40 GB para inferencia cómoda.
- **VRAM estimada en cuantización de 8 bits**: en torno a 15-16 GB; en 4 bits, en torno a 8-9 GB (estimaciones teóricas, no publicadas por el autor).
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o AMD MI325X para bf16; RTX 4090 (24 GB) solo en cuantización de 8 o 4 bits.
- **Consumer GPU**: cabe en RTX 4090 y RTX 3090 únicamente con cuantización; no cabe en bf16 en GPU de 24 GB.
- **Opciones de despliegue**: `transformers` (verificado por el autor), text-generation-inference (etiqueta `text-generation-inference`), vLLM, llama.cpp u Ollama tras conversión a GGUF.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep2 | 14,77 B | No disponible (entrenado a 8096) | Memoria y agrupacion de entidades | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (ampliable) | Instrucciones generales | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (ampliable) | Instrucciones generales | Apache 2.0 | Hugging Face, ampliamente usado |

La comparativa con alternativas especializadas en memoria no está disponible, ya que no se conocen modelos públicos directamente comparables en esta tarea concreta.

## Limitaciones y advertencias

- **Sesgos**: no documentados; al derivar de Qwen2.5-14B-Instruct y de datos sintéticos de BrowseComp-Plus, puede heredar sesgos del modelo base y del proceso de generación sintética.
- **Alucinación**: riesgo no evaluado; el ajuste sobre pares sintéticos de QA puede favorecer respuestas plausibles pero no verificadas.
- **Contexto e idioma**: no se declaran idiomas soportados ni longitud de contexto efectiva tras el ajuste; el entrenamiento se limitó a 8096 tokens, lo que puede degradar el rendimiento en contextos más largos que los del modelo base.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-14B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- **Madurez**: checkpoint intermedio (época 2 de 3), con 0 descargas y 0 likes; no hay validación independiente ni benchmarks publicados.
- **Uso en producción**: no recomendado sin evaluación propia, dado que es un artefacto de investigación sin métricas de calidad ni garantías de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
