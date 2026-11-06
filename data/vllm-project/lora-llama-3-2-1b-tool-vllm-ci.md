# vllm-project/LoRA-Llama-3.2-1B-tool-vllm-ci

## Resumen

LoRA-Llama-3.2-1B-tool-vllm-ci es un adaptador LoRA (PEFT) sobre meta-llama/Llama-3.2-1B-Instruct, especializado en *function calling* y publicado por el equipo de vLLM. No es un modelo completo, sino un adaptador de bajo rango que debe cargarse junto con el modelo base de 1.240 millones de parametros; el repositorio pesa 0,0 GB porque solo contiene los pesos del adaptador en safetensors. Su proposito es servir como checkpoint de referencia en las pruebas de integracion continua (CI) de vLLM para validar el soporte de LoRA en el servidor de inferencia.

El modelo fue entrenado con Axolotl (version 0.11.0.dev0) sobre cuatro datasets orientados a llamadas a herramientas y a la deteccion de irrelevancia en peticiones de funciones, con un total aproximado de 3.050 ejemplos tras el sharding. El checkpoint original vive en la cuenta personal minpeter y esta copia se mantiene en la organizacion vllm-project para reducir el riesgo de cadena de suministro en los pipelines de CI.

Es relevante ahora porque demuestra un flujo completo de *fine-tuning* de tool calling sobre un modelo pequeno (1B) con licencia Llama 3.2, lo que permite desplegar agentes ligeros en hardware modesto. Al ser un adaptador, el coste de almacenamiento y de distribucion es minimo, y puede combinarse con el modelo base en tiempo de inferencia mediante vLLM, PEFT o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 1.240 millones (modelo base); adaptador LoRA de rango 8 sobre 7 modulos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento); contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16; el base admite las cuantizaciones habituales de Llama 3.2) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-1B-Instruct, un transformer decoder-only denso de 1.240 millones de parametros con atencion causal estandar. El LoRA usa rango 8, alpha 16, dropout 0,05 y se inyecta en los modulos gate_proj, down_proj, up_proj, q_proj, v_proj, k_proj y o_proj, es decir, en todas las proyecciones lineales de atencion y MLP. El entrenamiento se hizo con Axolotl 0.11.0.dev0, precision bf16, optimizador AdamW de 8 bits, LR 2e-4 con scheduler coseno, 2 epocas, batch efectivo de 4 (micro-batch 2 x acumulacion 2), sample packing y flash attention, con un total de 380 pasos y un 5 % de datos reservados para validacion.

Los datos de entrenamiento combinan cuatro conjuntos en formato chat template de Llama 3: xlam-function-calling-60k-hermes (0,5k ejemplos), xlam-irrelevance-7.5k-qwen2.5-72b-distill-hermes (0,35k), hermes-function-calling-v1-jsonl (1,2k) y apigen-mt-5k-friendli (1k). El conjunto de irrelevancia es especialmente relevante porque ensena al modelo a no invocar funciones cuando la peticion del usuario no lo requiere, un comportamiento critico en agentes. No se documenta RLHF ni DPO; el ajuste es puramente supervisado (SFT) sobre trazas de conversacion con llamadas a herramientas.

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3.
- *Function calling* / *tool calling*: emision de llamadas a funciones en JSON segun el esquema proporcionado.
- Deteccion de irrelevancia: capacidad de abstenerse de llamar a una herramienta cuando la consulta no lo justifica, gracias al dataset de irrelevancia destilado.
- Razonamiento multi-turno dentro de una conversacion con historial de mensajes.
- Soporte de *system prompt* y plantillas de chat de Llama 3.
- Capacidades multilingues: no disponibles en la informacion (heredadas del base, sin verificar).
- No se documenta modo *thinking*, vision ni audio.

## Casos de uso

- **CI de vLLM para LoRA**: validar que el servidor de inferencia carga correctamente adaptadores PEFT sobre Llama 3.2 1B y responde a peticiones de tool calling; es el proposito declarado del checkpoint.
- **Agentes ligeros en produccion**: desplegar un asistente que decide que herramienta invocar (APIs REST, busquedas, calculadoras) con un modelo de 1B que cabe en GPU de consumo, reduciendo coste frente a modelos de 7B o superiores.
- **Enrutamiento de intenciones**: usar la capacidad de irrelevancia para clasificar si una consulta requiere llamada a funcion o es conversacion general, como paso previo a un modelo mayor.
- **Prototipado de pipelines de function calling**: iterar rapidamente sobre esquemas de herramientas y prompts sin incurrir en costes de modelos grandes, gracias al bajo requisito de VRAM.
- **Generacion de llamadas a API a partir de lenguaje natural**: transformar peticiones de usuario en JSON conforme a un esquema OpenAPI, util en asistentes de operaciones o soporte interno.
- **Evaluacion comparativa de adaptadores**: servir como baseline de referencia para medir el impacto de tecnicas de entrenamiento (rango LoRA, datasets, epocas) en tareas de tool calling.
- **Despliegue en el borde**: al ser un modelo de 1B con adaptador, puede ejecutarse en entornos con recursos limitados (portatiles, estaciones de trabajo) mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

La model card declara un unico resultado cuantitativo: perdida de validacion de 0,4122 al final del entrenamiento (2 epocas, paso 320). La model-index no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Validation loss (final) | 0,4122 |
| Validation loss (inicial) | 0,9339 |
| Training loss (ultimo registrado) | 0,4548 |
| Pasos de entrenamiento | 380 |
| Epocas | 2 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM del adaptador**: despreciable (rango 8 sobre 1B, pocos MB en safetensors).
- **VRAM del modelo base en bf16**: aproximadamente 2,5 GB de pesos mas overhead de activaciones y KV cache; en la practica, 4-6 GB para contexto de 4k.
- **VRAM en cuantizacion 4 bits**: aproximadamente 0,7-1 GB de pesos, cabe en GPUs de 4 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para cuantizacion 4 bits; RTX 3060/4060, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- **Consumer GPU**: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en CPU con llama.cpp.
- **Opciones de despliegue**: vLLM (soporte nativo de LoRA, proposito del checkpoint), PEFT + Transformers, llama.cpp, Ollama y TGI.
- **Latencia y throughput**: no disponibles en la informacion; al ser un modelo de 1B se espera una latencia baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoRA-Llama-3.2-1B-tool-vllm-ci | 1,24B (base) + LoRA r8 | 4096 (entrenamiento) | Tool calling, adaptador PEFT | llama3.2 | Hugging Face (vllm-project y minpeter) |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k (nativo del base) | Instrucciones generales | llama3.2 | Hugging Face |
| minpeter/LoRA-Llama-3.2-1B-tool-vllm-ci | 1,24B (base) + LoRA r8 | 4096 (entrenamiento) | Tool calling, adaptador PEFT | llama3.2 | Hugging Face (cuenta personal) |
| Modelos de tool calling de mayor tamano (p. ej. familias Qwen o Hermes) | 7B+ | variable | Tool calling | variable | Hugging Face |

La comparativa con modelos de mayor tamano no puede completarse con datos de rendimiento porque no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- **Es un adaptador, no un modelo autonomo**: requiere cargar meta-llama/Llama-3.2-1B-Instruct junto con los pesos PEFT; no puede usarse solo.
- **Sesgos**: hereda los sesgos del modelo base y de los datasets de entrenamiento (xLAM, Hermes, APIGen), no evaluados en la model card.
- **Riesgo de alucinacion**: en tool calling puede generar llamadas a funciones con argumentos invalidos o inventar nombres de herramientas si el esquema no esta bien especificado; el dataset de irrelevancia mitiga pero no elimina este riesgo.
- **Contexto limitado en entrenamiento**: la longitud de secuencia usada fue 4096 tokens, aunque el base soporta mas; el comportamiento mas alla de ese limite no esta validado.
- **Idiomas**: no se documenta que idiomas cubre el ajuste; el entrenamiento parece centrado en ingles.
- **Licencia Llama 3.2**: impone restricciones de uso comercial y requisitos de atribucion; revisar los terminos antes de desplegar en produccion.
- **Proposito original de CI**: el checkpoint se publica principalmente para pruebas de integracion de vLLM; no hay garantias de calidad para uso en produccion ni evaluacion exhaustiva.
- **Perdida de validacion como unica metrica**: 0,4122 no es comparable con benchmarks estandar y no permite estimar rendimiento en tareas reales.

## Enlaces

- [Hugging Face: vllm-project/LoRA-Llama-3.2-1B-tool-vllm-ci](https://huggingface.co/vllm-project/LoRA-Llama-3.2-1B-tool-vllm-ci)
- [Checkpoint original: minpeter/LoRA-Llama-3.2-1B-tool-vllm-ci](https://huggingface.co/minpeter/LoRA-Llama-3.2-1B-tool-vllm-ci)
- [Modelo base: meta-llama/Llama-3.2-1B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct)
- [Axolotl (framework de entrenamiento)](https://github.com/axolotl-ai-cloud/axolotl)
- [vLLM (servidor de inferencia)](https://github.com/vllm-project/vllm)
