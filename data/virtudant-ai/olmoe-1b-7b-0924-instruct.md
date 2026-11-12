# Virtudant-AI/OLMoE-1B-7B-0924-Instruct

## Resumen

OLMoE-1B-7B-0924-Instruct es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado originalmente por Ai2 (Allen Institute for AI) y redistribuido en este repositorio por Virtudant-AI. Cuenta con 7.000 millones de parametros totales pero solo activa aproximadamente 1.000 millones por token, lo que permite una inferencia con coste cercano a un modelo de 1B manteniendo calidad de modelos notablemente mayores. Deriva del checkpoint base OLMoE-1B-7B-0924-SFT mediante un ajuste adicional con DPO sobre el dataset ultrafeedback_binarized_cleaned.

El modelo resuelve el problema de obtener calidad conversacional competitiva con un coste computacional reducido, siendo una alternativa completamente abierta (pesos, datos de entrenamiento, codigo y logs publicados) frente a modelos propietarios. Es relevante por su transparencia radical: todo el pipeline de preentrenamiento, SFT y alineamiento esta documentado y es reproducible, lo que lo convierte en una pieza util para investigacion en eficiencia y en alineamiento.

La arquitectura es un transformer decoder-only con enrutamiento MoE, contexto de 4.096 tokens y licencia Apache 2.0, orientado principalmente al idioma ingles. Este repositorio concreto es un reempaquetado del checkpoint Instruct oficial de Ai2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE) |
| Parametros totales | 7B (aproximadamente 6,9B) |
| Parametros activos | Aproximadamente 1B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16/float32; compatible con cuantizacion estandar via transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

OLMoE es un transformer decoder-only con capas de mezcla de expertos: cada bloque feed-forward se sustituye por un MoE con 64 expertos pequenos y enrutamiento top-k (k=8), de modo que solo una fraccion de los parametros se activa por token. Esto reduce el coste de inferencia y entrenamiento manteniendo una capacidad de representacion cercana a la de un modelo denso mucho mayor. El contexto maximo es de 4.096 tokens.

El entrenamiento se realizo en tres fases documentadas publicamente: preentrenamiento sobre OLMoE-mix-0924 (aproximadamente 5 billones de tokens, con mezcla de datos web, codigo y contenido academico), SFT sobre tulu-v3.1-mix-preview-4096-OLMoE y alineamiento final con DPO (y una rama alternativa con KTO) sobre ultrafeedback_binarized_cleaned. La innovacion principal es la transparencia total: se publican checkpoints intermedios, datos, codigo de entrenamiento y logs de Weights & Biases, algo poco habitual en modelos MoE de este tamano. El repositorio incluye ramas de ablacion (load-balancing, non-annealed, kto) utiles para estudiar el efecto del alineamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles con formato de chat (`<|user|>` / `<|assistant|>`).
- Razonamiento de sentido comun y tareas de conocimiento general (MMLU, BBH).
- Razonamiento matematico basico con cadena de pensamiento (GSM8K en modo 8-shot CoT).
- Generacion de codigo (evaluado en HumanEval).
- Seguimiento de instrucciones (IFEval) y comportamiento seguro ante prompts adversarios (XSTest).
- Capacidad de alineamiento conversacional mejorada via DPO respecto al checkpoint SFT.
- No dispone de vision, audio ni tool calling nativo documentado.
- Capacidades multilingues limitadas practicamente al ingles.

## Casos de uso

- Asistentes conversacionales ligeros en ingles: el modelo gestiona dialogos multi-turno con 4.096 tokens de contexto, adecuado para chatbots de soporte con requisitos de latencia y coste bajos gracias a sus ~1B parametros activos.
- Despliegue en hardware modesto: al activar solo ~1B parametros, puede servirse en una unica GPU consumer con cuantizacion, ideal para prototipos y entornos de desarrollo.
- Investigacion en alineamiento: las ramas DPO, KTO y las ablaciones permiten estudiar el efecto de distintas tecnicas de preferencia sobre un mismo modelo base, con datos y logs publicos.
- Generacion de codigo asistida en pipelines internos: con Pass@10 de 54,8 en HumanEval, sirve para autocompletado y generacion de funciones en herramientas de desarrollo, siempre con revision humana.
- Filtrado y clasificacion de texto a escala: su bajo coste por token permite procesar grandes volumenes de documentos en ingles para tareas de resumen, extraccion o etiquetado.
- Educacion y explicaciones simplificadas: el modelo responde bien a peticiones tipo "explica como a un nino de cinco anos", util para contenido divulgativo automatizado.
- Baseline reproducible para benchmarking: al ser 100% abierto, sirve como referencia controlada en experimentos academicos sobre eficiencia de modelos MoE.

## Benchmarks y rendimiento

Datos publicados en la model card del checkpoint Instruct (metricas: EM para MMLU/GSM8K/BBH, Pass@10 para HumanEval, %win para Alpaca-Eval, F1 para XSTest, Loose Acc para IFEval):

| Modelo | MMLU (0-shot) | GSM8K (8-shot CoT) | BBH (3-shot) | HumanEval (Pass@10) | Alpaca-Eval 1.0 | XSTest | IFEval | Media |
|---|---|---|---|---|---|---|---|---|
| OLMoE base | 49,8 | 3,0 | 33,6 | 22,4 | - | 59,7 | 16,6 | - |
| OLMoE +SFT | 51,4 | 40,5 | 38,0 | 51,6 | 69,2 | 84,1 | 43,3 | 54,0 |
| **OLMoE +DPO (este modelo)** | **51,9** | **45,5** | **37,0** | **54,8** | **84,0** | **82,6** | **48,1** | **57,7** |
| JetMoE-2B-9B +SFT | 46,1 | 53,5 | 35,6 | 64,8 | 69,3 | 55,6 | 30,5 | 50,4 |
| DeepSeek-3B-16B +Chat | 48,5 | 46,5 | 40,8 | 70,1 | 74,8 | 85,6 | 32,3 | 57,0 |
| Qwen1.5-3B-14B +Chat | 58,9 | 55,5 | 21,3 | 59,7 | 83,9 | 85,6 | 36,2 | 57,3 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14 GB para los 7B parametros totales (los ~1B activos reducen el coste de computo, no la memoria necesaria para almacenar todos los pesos).
- En cuantizacion de 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 40GB o H100 para maxima comodidad y throughput; RTX 4090 (24 GB) para bfloat16; RTX 3090/4080 (16-24 GB) con cuantizacion.
- Cabe en GPU consumer con cuantizacion 4-bit u 8-bit en tarjetas de 8 GB o mas, aunque el rendimiento puede degradarse.
- Opciones de despliegue: transformers (requiere version con soporte `OlmoeForCausalLM`), vLLM (soporte MoE), llama.cpp y Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (total/activo) | Contexto | MMLU | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OLMoE-1B-7B-0924-Instruct | 7B / ~1B | 4.096 | 51,9 | 54,8 | Apache 2.0 | Pesos abiertos, datos y logs |
| JetMoE-2B-9B | 9B / 2B | no disponible | 46,1 | 64,8 | no disponible | Pesos abiertos |
| DeepSeek-3B-16B Chat | 16B / 3B | no disponible | 48,5 | 70,1 | no disponible | Pesos abiertos |
| Qwen1.5-3B-14B Chat | 14B / 3B | no disponible | 58,9 | 59,7 | no disponible | Pesos abiertos |

OLMoE destaca por su mayor transparencia (datos, codigo y logs) y menor numero de parametros activos, aunque cede en MMLU frente a Qwen1.5-3B-14B y en HumanEval frente a DeepSeek y JetMoE. Su ventaja principal es el coste de inferencia y la reproducibilidad.

## Limitaciones y advertencias

- Entrenado y evaluado practicamente solo en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo o RAG con muchos fragmentos.
- Riesgo de alucinacion inherente a modelos de este tamano; no debe usarse como fuente de verdad sin verificacion.
- GSM8K en 8-shot CoT (45,5) es notablemente inferior al de modelos densos mayores; el razonamiento matematico complejo es fragil.
- Sesgos presentes en los datos de preentrenamiento web y en ultrafeedback; no se documenta una evaluacion de sesgos en la informacion disponible.
- No soporta tool calling ni function calling nativo documentado, lo que limita su uso en pipelines de agentes.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar las condiciones de los datasets de entrenamiento subyacentes.
- Este repositorio es un reempaquetado de un checkpoint oficial de Ai2; para produccion se recomienda usar el repositorio original `allenai/OLMoE-1B-7B-0924-Instruct` por trazabilidad y mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Virtudant-AI/OLMoE-1B-7B-0924-Instruct
- Checkpoint original Instruct: https://huggingface.co/allenai/OLMoE-1B-7B-0924-Instruct
- Checkpoint SFT: https://huggingface.co/allenai/OLMoE-1B-7B-0924-SFT
- Checkpoint preentrenamiento: https://hf.co/allenai/OLMoE-1B-7B-0924
- Paper: https://arxiv.org/abs/2409.02060
- Repositorio GitHub: https://github.com/allenai/OLMoE
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/OLMoE-mix-0924
- Dataset SFT: https://hf.co/datasets/allenai/tulu-v3.1-mix-preview-4096-OLMoE
- Dataset de preferencias: https://hf.co/datasets/allenai/ultrafeedback_binarized_cleaned
- Codigo SFT/DPO: https://github.com/allenai/open-instruct/tree/olmoe-sft
- Codigo KTO: https://github.com/Muennighoff/kto/blob/master/kto.py
- Logs de entrenamiento: https://wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924--Vmlldzo4OTcyMjU3
