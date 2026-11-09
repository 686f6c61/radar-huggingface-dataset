# yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep1

## Resumen

`yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep1` es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model" sobre pares sintéticos de pregunta-respuesta generados a partir del corpus NarrativeQA, con el objetivo de que el modelo retenga y recupere información de documentos narrativos largos en tareas de question answering. Se trata de un checkpoint intermedio: el entrenamiento contempla tres épocas y este repositorio corresponde a la primera.

Técnicamente es un transformer decoder-only de 32.763.876.352 parámetros en precisión bf16, con los pesos del adaptador LoRA fusionados en los pesos base (aunque el adaptador sin fusionar también se incluye en la carpeta `lora_adapter/`). El ajuste se realizó con LoRA de rango 32 sobre las proyecciones q/k/v/o/gate/up/down, lo que supone 268.435.456 parámetros entrenables (0,81 % del total), sobre un conjunto de 1.276.668 ejemplos sintéticos y con una longitud máxima de secuencia de 8096 tokens.

La relevancia de este modelo es acotada y experimental: no es un modelo generalista nuevo, sino una variante especializada en memoria y recuperación de contexto narrativo, con cero descargas y cero likes en el momento de redactar esta ficha. Su interés principal es como artefacto de investigación sobre cómo el ajuste con LoRA afecta a las capacidades de retención de contexto largo en un modelo de 32B, y como ejemplo de pipeline de generación de datos sintéticos para entrenamiento de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning con LoRA fusionado |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; longitud máxima de entrenamiento 8096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) + adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con atención causal estándar y RoPE. El ajuste se realizó mediante LoRA con rango 32, alpha 64 y dropout 0,05, aplicado a las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Los parámetros entrenables ascienden a 268.435.456, es decir, un 0,81 % del total. El adaptador se fusionó posteriormente en los pesos base, de modo que el repositorio principal contiene un modelo estándar cargable con `AutoModelForCausalLM.from_pretrained`.

El entrenamiento se llevó a cabo sobre 1.276.668 ejemplos sintéticos de question answering generados a partir de NarrativeQA (fichero `NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json`), con un batch efectivo de 512 (64 por dispositivo, 1 paso de acumulación, 8 GPUs), learning rate constante de 0,0002 con warmup del 5 %, weight decay 0,01, max grad norm 1,0, precisión bf16, gradient checkpointing y cálculo de pérdida solo sobre los tokens del asistente. El cómputo total para las tres épocas fue de 7,54 horas de reloj (60,3 GPU-horas) sobre 8 AMD Instinct MI325X. Este checkpoint corresponde a la época 1 de 3.

## Capacidades

- Generación de texto conversacional en formato chat, usando la plantilla de chat de Qwen.
- Question answering sobre documentos narrativos largos, especialidad del ajuste fino.
- Memoria y recuperación de información dentro de una ventana de hasta 8096 tokens (longitud de entrenamiento).
- Razonamiento multi-turno heredado del modelo base Qwen2.5-32B-Instruct.
- Capacidades de código, matemáticas y tool calling heredadas del modelo base, aunque no se han validado tras el ajuste.
- Capacidades multilingües heredadas del modelo base (Qwen2.5 soporta múltiples idiomas), si bien la model card no documenta idiomas específicos para esta variante.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre memoria en LLMs: el modelo sirve como punto de comparación para estudiar cómo el ajuste LoRA sobre datos sintéticos de QA afecta a la retención de información en contextos largos, frente al Qwen2.5-32B-Instruct original.
- Question answering sobre narrativa y documentos largos: adecuado para prototipos de sistemas que responden preguntas sobre novelas, guiones o informes extensos de hasta 8096 tokens, aprovechando el entrenamiento específico sobre NarrativeQA.
- Evaluación de pipelines de datos sintéticos: permite medir el impacto de 1,27 millones de pares QA generados automáticamente en las capacidades del modelo, útil para equipos que diseñan estrategias de data augmentation.
- Baseline en experimentos de ajuste con LoRA: al incluir el adaptador sin fusionar en `lora_adapter/`, facilita reproducir o continuar el entrenamiento desde la época 1 con hiperparámetros documentados.
- Extracción de información de documentos narrativos: para tareas de resumen o localización de entidades en textos largos donde el modelo base podría perder detalles.
- Estudio de eficiencia de entrenamiento: los datos de wall-clock (7,54 h para tres épocas en 8 MI325X) permiten estimar costes de ajustes similares en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren 70-80 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 33 GB de pesos, más overhead; viable en GPUs de 48 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 17 GB de pesos, más overhead; viable en GPUs consumer de 24 GB (RTX 3090/4090) con contexto limitado.
- GPUs recomendadas: A100 80 GB, H100 80 GB, AMD MI300X/MI325X para bf16; A6000 48 GB o L40S para 8 bits.
- Cabe en GPU consumer solo con cuantización agresiva (4 bits) y ventanas de contexto reducidas.
- Opciones de despliegue: `transformers` (soporte nativo documentado), vLLM, TGI (tag `text-generation-inference` presente), llama.cpp/Ollama previa conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-memory-nqa-lora-ep1 | 32,8B | 8096 (entrenamiento) | Memoria / QA narrativo | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32,8B | 131.072 tokens (según model card oficial de Qwen) | Generalista | apache-2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-72B-Instruct | 72,7B | 131.072 tokens | Generalista | apache-2.0 | Hugging Face |
| Mistral-Large-Instruct | ~123B | 128.000 tokens | Generalista | licencia Mistral Research/Commercial | Hugging Face / API |

La comparativa se limita a modelos de la misma familia y rango, ya que no se dispone de benchmarks publicados para esta variante que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la época 1 de 3, por lo que no representa el resultado final del entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en tareas de memoria o QA.
- Riesgo de olvido catastrófico parcial: el ajuste sobre un dominio muy específico (QA narrativo sintético) puede degradar capacidades generales del modelo base, aunque no se ha medido.
- Datos de entrenamiento sintéticos: los pares QA se generaron automáticamente, lo que puede introducir sesgos y errores sistemáticos en las respuestas.
- Idiomas no documentados: se desconoce si el ajuste preserva el multilingüismo del modelo base.
- Ventana de contexto de entrenamiento limitada a 8096 tokens, muy inferior al contexto nativo de Qwen2.5-32B-Instruct.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 también es apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Cero descargas y cero likes: sin validación por parte de la comunidad; no recomendado para producción sin evaluación propia.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por el entrenamiento en QA sintético.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset de referencia (NarrativeQA): no disponible enlace directo en la información proporcionada
- Paper de NarrativeQA: no disponible en la información proporcionada
