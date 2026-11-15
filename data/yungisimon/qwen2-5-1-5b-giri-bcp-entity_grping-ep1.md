# yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep1

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep1` es un ajuste fino completo del modelo instructivo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, entrenado por el usuario yungisimon como **modelo de memoria** sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus. El objetivo del entrenamiento no es tanto mejorar las capacidades generales del modelo base, sino especializarlo en tareas de recuperacion y agrupamiento de entidades a partir de contexto documental, usando una estrategia de clustering denominada `entity_grping` (agrupamiento por entidad, con frecuencia documental maxima de 3).

Se trata de un checkpoint intermedio: corresponde a la **epoca 1 de 3** de un entrenamiento completo con ajuste fino supervisado (FSDP, bf16, loss solo en tokens del asistente). Con 1.543.714.304 parametros reales en safetensors, hereda la arquitectura transformer decoder-only de Qwen2.5 y la ventana de contexto de 32.768 tokens del modelo base, aunque el entrenamiento se realizo con una longitud maxima de secuencia de 8.096 tokens.

Su relevancia es acotada pero concreta: sirve como referencia para experimentos de memoria externa en modelos pequenos, para estudiar el efecto del agrupamiento de entidades en tareas de QA multi-documento, y como punto de partida para quien quiera reproducir o continuar este tipo de ajuste sobre Qwen2.5-1.5B. No es un modelo de proposito general ni compite con los instructivos de referencia; es un artefacto de investigacion con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), basado en Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenamiento con max sequence length de 8.096 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero la model card no lo declara) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, RoPE, normalizacion RMSNorm y capas MLP con activacion SwiGLU. No se introducen cambios estructurales; el ajuste es **full fine-tuning** con FSDP sobre los 1.543.714.304 parametros (100% entrenables), en precision bf16 y con gradient checkpointing. El entrenamiento se ejecuto en 8 GPUs AMD Instinct MI325X con un batch efectivo de 1024 (128 por dispositivo, 1 paso de acumulacion, 8 GPUs), learning rate constante de 2e-05 con warmup del 5%, weight decay 0.01 y max grad norm 1.0. La perdida se calcula unicamente sobre los tokens del asistente.

Los datos de entrenamiento son pares sinteticos de QA generados a partir de BrowseComp-Plus, agrupados mediante el metodo `entity_grping` (agrupamiento por entidad con df maximo 3), dando lugar a 3.046.524 ejemplos descritos en el fichero `bcp_subset300_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`. El checkpoint publicado corresponde a la epoca 1 de 3; el entrenamiento completo de las 3 epocas habria requerido 1,93 horas de reloj (15,4 GPU-horas). No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional: hereda el chat template de Qwen2.5 y el formato instructivo del modelo base.
- Razonamiento sobre contexto documental: disenado especificamente para tareas de memoria y QA multi-documento, con entrenamiento sobre pares derivados de BrowseComp-Plus.
- Agrupamiento de entidades: el ajuste se realizo con la estrategia `entity_grping`, orientada a consolidar informacion de una misma entidad repartida entre documentos.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero no hay garantia de que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas en la model card; depende del modelo base.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- **Investigacion sobre memoria en LLMs**: usar el checkpoint como referencia para estudiar como el agrupamiento por entidad afecta a la recuperacion de informacion en modelos de 1.5B. Es adecuado porque el autor publica la configuracion exacta de datos y entrenamiento, lo que facilita la reproducibilidad.
- **QA multi-documento en dominios acotados**: el modelo puede responder preguntas que requieren combinar fragmentos de varios documentos sobre una misma entidad, gracias al entrenamiento con pares cross-document generados con `entity_grping`.
- **Prototipado de pipelines RAG**: al ser un modelo pequeno (1.5B) y con licencia Apache 2.0, se puede desplegar como componente de un sistema de recuperacion aumentada para validar hipotesis antes de escalar a modelos mayores.
- **Generacion de datos sinteticos de entrenamiento**: el modelo puede emplearse para producir pares de QA adicionales sobre corpus documentales, dado que fue entrenado precisamente sobre ese tipo de datos.
- **Evaluacion comparativa de estrategias de clustering**: sirve como punto de comparacion frente a otros checkpoints del mismo autor (por ejemplo, variantes con otros metodos de agrupamiento) para medir el impacto de `entity_grping` en tareas de memoria.
- **Despliegue en entornos con recursos limitados**: con 1.5B parametros en bf16 (~3,1 GB) o cuantizado a 4 bits (~1 GB), puede ejecutarse en GPUs consumer para demos y pruebas internas de recuperacion de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~3,1 GB en bf16 (pesos completos), ~1,6 GB en FP16/bf16 con overhead de activaciones moderado, ~1 GB en cuantizacion de 4 bits (estimacion a partir del numero de parametros; no verificada por el autor).
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM para bf16; A100, H100 o MI325X para entrenamiento o inferencia de alto throughput.
- **Cabe en GPU consumer**: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs de 8 GB con cuantizacion a 4 bits.
- **Opciones de despliegue**: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y conversiones estandar a llama.cpp/Ollama/vLLM aunque no esten documentadas por el autor.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep1 | 1,54B | 32.768 (base); entrenado a 8.096 | Apache 2.0 | Memoria / QA multi-documento con agrupamiento de entidades | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Instructivo generalista | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | Base preentrenado | Hugging Face |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 | Llama 3.2 Community License | Instructivo generalista | Hugging Face, uso comercial con restricciones |

La comparacion relevante es contra el modelo base: este checkpoint no supera en capacidades generales a Qwen2.5-1.5B-Instruct, sino que esta especializado en tareas de memoria y QA documental. Frente a Llama 3.2 1B, la diferencia principal es la licencia (Apache 2.0 pura frente a la licencia comunitaria de Meta) y el enfoque especializado.

## Limitaciones y advertencias

- **Checkpoint intermedio**: es la epoca 1 de 3; el autor no publica resultados de las epocas 2 y 3, por lo que el rendimiento final puede diferir.
- **Riesgo de alucinacion**: al ser un ajuste sobre datos sinteticos de QA, puede generar respuestas plausibles pero no respaldadas por el contexto, especialmente fuera del dominio de BrowseComp-Plus.
- **Especializacion estrecha**: el entrenamiento se limita a tareas de memoria y agrupamiento de entidades; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- **Idiomas no declarados**: la model card no especifica que idiomas conserva el ajuste; no se garantiza un comportamiento multilingue equivalente al de Qwen2.5-Instruct.
- **Sesgos**: no documentados por el autor; al derivar de Qwen2.5 y de datos sinteticos, hereda los sesgos del modelo base y los del proceso de generacion de datos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base Qwen2.5 por si hubiera condiciones adicionales.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de mejora frente al modelo base, lo que desaconseja su uso en produccion sin evaluacion propia.
- **Contexto de entrenamiento limitado**: aunque el modelo base soporta 32.768 tokens, el entrenamiento se realizo con secuencias de 8.096 tokens, lo que puede afectar al rendimiento en contextos mas largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Perfil del autor: https://huggingface.co/yungisimon
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- BrowseComp (paper de referencia del benchmark): https://arxiv.org/abs/2504.12516
