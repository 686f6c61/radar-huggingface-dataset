# trunght6605/KimochiSushi-Qwen2.5-3B-Instruct-Merged-qwen-fp16-s42

## Resumen

KimochiSushi-Qwen2.5-3B-Instruct-Merged-qwen-fp16-s42 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-3B-Instruct, publicado por el usuario trunght6605 en Hugging Face. Se trata de un modelo de lenguaje causal especializado en atención al cliente para el restaurante japonés ficticio o real "Kimochi Sushi", según indica su model card en vietnamita. El modelo se distribuye ya fusionado (merged) en precisión de 16 bits, por lo que puede cargarse directamente mediante `pipeline` de Transformers o servirse con vLLM sin necesidad de aplicar adaptadores PEFT.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones) y un tamaño de repositorio de 6,2 GB en formato safetensors. El ajuste se realizó sobre el checkpoint identificado como `qwen_fp16_s42`, presumiblemente una ejecución con semilla 42 y precisión fp16 del entrenamiento original. La licencia declarada es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales más allá de las del propio Qwen2.5.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo de nicho, sin descargas ni interacciones en el momento de la consulta, orientado a un dominio muy concreto (asistente virtual de un restaurante) y con un único idioma declarado, el vietnamita. Resulta útil como ejemplo de fine-tuning ligero de Qwen2.5-3B para dominios verticales y para evaluar si un modelo de 3B puede cubrir tareas de atención al cliente con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), causal LM |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos fp16/safetensors; no se publican GGUF ni AWQ) |
| Idiomas soportados | vietnamita (vi) segun la model card; el modelo base soporta multiples idiomas, pero el fine-tuning declara solo vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (merged, 16-bit) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base emplea atención con GQA (grouped-query attention) y fue preentrenado por Alibaba con un corpus multilingüe de varios billones de tokens, seguido de un proceso de alineación con instrucciones (SFT y probablemente DPO/RLHF, aunque los detalles exactos del modelo base no se detallan en la información proporcionada).

Sobre este modelo base, el autor aplicó un fine-tuning supervisado con PEFT (probablemente LoRA) y posteriormente fusionó los adaptadores en los pesos base, generando un checkpoint de 16 bits listo para inferencia. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas propias más allá de la fusión de adaptadores. El identificador `qwen_fp16_s42` sugiere una ejecución con semilla 42 y precisión fp16, pero no se aportan más detalles sobre hiperparámetros o duración del entrenamiento.

## Capacidades

- Generación de texto conversacional en vietnamita, orientada a atención al cliente de un restaurante.
- Respuesta a preguntas frecuentes sobre menú, reservas y horarios (inferido del propósito declarado en la model card).
- Mantenimiento de conversaciones multi-turno, limitado por la ventana de contexto heredada del modelo base.
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct: razonamiento básico, generación de código y matemáticas elementales, aunque no se garantiza que el fine-tuning las preserve.
- Soporte de tool calling / function calling: no confirmado para este fine-tuning (el modelo base Qwen2.5 lo soporta, pero no se documenta aquí).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente vietnamita; el comportamiento en castellano u otros idiomas no está validado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Atención al cliente automatizada en vietnamita: el modelo puede gestionar conversaciones multi-turno sobre reservas, menú y horarios del restaurante Kimochi Sushi, aprovechando el ajuste específico de dominio.
- Chatbot embebido en web o aplicación de mensajería: al ser un modelo de 3B fusionado en fp16, puede servirse con vLLM en una GPU de gama media y responder con latencia baja a consultas frecuentes.
- Clasificación y enrutado de consultas: puede utilizarse para identificar la intención del cliente (reserva, queja, consulta de menú) antes de derivar a un humano o a otro sistema.
- Generación de respuestas plantilla personalizadas: el ajuste permite producir respuestas con el tono de marca del restaurante, reduciendo el trabajo de redacción manual.
- Pruebas de concepto de fine-tuning vertical: sirve como ejemplo reproducible de cómo adaptar Qwen2.5-3B a un dominio concreto con PEFT y fusión de adaptadores.
- Despliegue en entornos con recursos limitados: al caber en GPUs consumer de 8-12 GB en fp16 (y menos con cuantización posterior), es adecuado para prototipos locales o edge.
- Evaluación comparativa de modelos pequeños en tareas de diálogo: útil como baseline para medir cuánto aporta un fine-tuning de dominio frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 8-10 GB para contextos moderados.
- VRAM estimada con cuantización a 8 bits: alrededor de 3,5-4 GB (no se distribuyen pesos cuantizados oficialmente; habría que generarlos).
- VRAM estimada con cuantización a 4 bits (GGUF/AWQ): alrededor de 2-2,5 GB, viable en GPUs consumer de 4-6 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB o superiores en fp16; en GPUs de 8 GB conviene cuantizar.
- Opciones de despliegue: Transformers `pipeline`, vLLM (soporte Qwen2), TGI, llama.cpp/Ollama tras convertir a GGUF (no incluido en el repo).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 3B, se espera un throughput alto en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KimochiSushi-Qwen2.5-3B-Instruct-Merged | 3,09B | no disponible (base: 32k) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning vertical en vietnamita |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base multilingüe con alineación |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa más ligera, menor capacidad |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de calidad en producción.
- Entrenado y declarado únicamente para vietnamita; el rendimiento en castellano u otros idiomas no está garantizado y probablemente degrade respecto al modelo base.
- Riesgo de alucinación inherente a modelos de 3B, especialmente en datos factuales del restaurante (precios, horarios, disponibilidad) si no se ancla con RAG o reglas de negocio.
- No se documentan sesgos específicos del fine-tuning; el modelo base Qwen2.5 puede presentar sesgos culturales y lingüísticos heredados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de fine-tuning.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware limitado requiere conversión manual.
- La longitud de contexto efectiva del fine-tuning no está confirmada; podría ser menor que los 32k del modelo base si el entrenamiento usó secuencias más cortas.
- El identificador del checkpoint (`qwen_fp16_s42`) sugiere una ejecución concreta, pero no se detallan hiperparámetros ni reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/trunght6605/KimochiSushi-Qwen2.5-3B-Instruct-Merged-qwen-fp16-s42
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Documentación de vLLM: https://docs.vllm.ai/
- Documentación de PEFT: https://huggingface.co/docs/peft
