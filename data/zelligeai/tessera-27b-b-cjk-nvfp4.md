# ZelligeAI/Tessera-27B-B-CJK-NVFP4

## Resumen

Tessera-27B-B-CJK-NVFP4 es un checkpoint cuantizado en NVFP4 y FP8 del modelo Tessera-27B-B-CJK, desarrollado por ZelligeAI. Se trata de un modelo de agente de codigo construido sobre Qwen3.8-27B mediante un LoRA de rango 32 fusionado en los pesos bf16 del modelo base. Su rasgo diferencial es que razona en un "CJK comprimido": una taquigrafia que mezcla palabras en ingles, chino y simbolos, con la que reduce el numero de tokens de pensamiento por turno de agente hasta 0,50-0,64x respecto al modelo base, manteniendo las respuestas y las llamadas a herramientas en ingles plano y codigo.

El checkpoint de este repositorio no ha sido evaluado: los resultados publicados en la model card corresponden al LoRA sobre Tinker, que coincide con los pesos bf16 fusionados segun una comprobacion de logprob, no a los ficheros NVFP4/FP8 aqui alojados. La cuantizacion se realizo con llm-compressor 0.14 y compressed-tensors 0.19, replicando la disposicion de unsloth/Qwen3.8-27B-NVFP4 (1.968 tensores, 0 diferencias en nombres y dtypes).

Es relevante ahora porque permite desplegar un modelo de 27B (20.294 millones de parametros reales en safetensors) en GPUs Blackwell con computo nativo FP4, reduciendo el peso del repositorio a 23,4 GB frente a los 55,6 GB de los pesos bf16 fusionados. Es una release beta y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (tag `qwen3_5`) con atencion lineal hibrida; incluye torre de vision y cabeza MTP |
| Parametros totales | 20.294.595.344 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131K tokens en las pruebas de contexto largo (ventana de 64K en turnos de agente); contexto maximo oficial no disponible |
| Tipos de cuantizacion | NVFP4 (MLP de capas 0-55), FP8 (proyecciones q/k/v/o, atencion lineal `in_proj_qkv`, `in_proj_z`, `out_proj`, `lm_head` y MLP de capas 56-63, con escalas estaticas FP8 para KV cache), bf16 (embeddings, normas, `in_proj_a`, `in_proj_b`, `conv1d`, torre de vision y cabeza MTP); tambien existe GGUF con cinco cuantizaciones replica en el repo GGUF |
| Idiomas soportados | no disponible oficialmente; razonamiento interno en CJK comprimido (ingles, chino y simbolos), respuestas y tool calls en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4/FP8/bf16); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer con atencion lineal hibrida (modulos `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `conv1d` y `out_proj`), torre de vision y cabeza MTP (multi-token prediction). Sobre el se aplico un LoRA de rango 32 entrenado en Tinker y fusionado en los pesos bf16, dando lugar a la release beta Tessera-27B-B-CJK. El entrenamiento combina SFT agentico con trayectorias de agente y replay de pares pregunta-respuesta; el conjunto de calibracion de la cuantizacion uso 256 secuencias de hasta 2.048 tokens: 128 ventanas del set de SFT agentico y 128 salidas de razonamiento limpias del propio modelo, sin items de evaluacion sellados.

La innovacion principal es el "CJK comprimido": el modelo piensa en una taquigrafia mixta ingles-chino-simbolos que reduce los tokens de pensamiento por turno de agente a 0,496x el base (media geometrica, IC 90% 0,385-0,624) y 0,644x ponderado por tokens (IC 90% 0,208-0,866), con una media de 575 tokens generados por turno frente a 847 del base, contando pensamiento, respuesta y tool calls. La cuantizacion NVFP4/FP8 se genero con llm-compressor 0.14 y compressed-tensors 0.19, con escalas FP8 estaticas para la KV cache; el `config.json` se reemplazo el 2026-11-05 para que vLLM 0.31 pudiera cargar el checkpoint (los patrones de cuantizacion estaban escritos con nombres de modulo de Hugging Face y vLLM los renombra al cargar).

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento comprimido en CJK, controlable mediante `reasoning_effort` en `chat_template_kwargs` (valores como `xhigh`).
- Codigo y tareas de agente de programacion: el modelo esta especializado como coding-agent.
- Tool calling / function calling: 88 de 88 llamadas validas en las pruebas de turnos de agente, y 6 de 6 en prompts de contexto largo de 101K-131K tokens.
- Razonamiento multi-paso en agentes: ejecuciones de hasta 15 pasos sin romper tests existentes en el conjunto de prueba.
- Contexto largo: manejo de prompts de 101K-131K tokens con salida limitada a 32.768 tokens sin bucles ni llenado de ventana.
- Capacidades multimodales: la arquitectura incluye torre de vision, aunque la model card no detalla su uso y el comando de servicio de vLLM desactiva imagen y video (`--limit-mm-per-prompt '{"image": 0, "video": 0}'`).
- Prediccion multi-token (cabeza MTP) en bf16.
- Multilingue: no documentado oficialmente; el razonamiento interno mezcla ingles, chino y simbolos, con salidas en ingles.

## Casos de uso

- Agentes de codigo en produccion: integrable en pipelines de CI/CD o asistentes de repositorio que necesitan llamadas a herramientas fiables (88/88 validas) y razonamiento multi-paso de hasta 15 pasos, con menor coste por turno gracias a la reduccion de tokens de pensamiento.
- Despliegue en GPUs Blackwell con VRAM limitada: el checkpoint NVFP4 de 23,4 GB permite servir un modelo de 27B en una B200 o RTX PRO 6000 Blackwell con computo nativo FP4, frente a los 55,6 GB del bf16.
- Analisis de repositorios grandes: con prompts de 101K-131K tokens y tool calls validas en el 100% de los casos probados, es adecuado para tareas que requieren leer multiples ficheros o trazas largas antes de actuar.
- Automatizacion de tareas de terminal o edicion de ficheros: el modelo mantiene respuestas y tool calls en ingles plano y codigo, lo que facilita el parseo por orquestadores de agentes.
- Reduccion de coste de inferencia en pipelines agenticos: la reduccion a 0,50-0,64x tokens de pensamiento por turno (575 vs 847 tokens generados) disminuye el gasto en tokens de salida en flujos con muchos turnos.
- Evaluacion e investigacion de tecnicas de razonamiento comprimido: sirve como referencia para estudiar como afecta un "idioma de pensamiento" abreviado a la calidad y a la latencia en tareas de agente.
- Servicio con vLLM en modo offline: el checkpoint carga con la clase `LLM` de vLLM 0.31 en RTX PRO 6000 Blackwell, util para prototipos y benchmarking interno.

## Benchmarks y rendimiento

Los resultados publicados corresponden al LoRA evaluado sobre el modelo base, no a los ficheros NVFP4 de este repositorio (no evaluados). Comparan Tessera con el base sin ajustar, ambos en bf16, temperatura 1.0, top-p 0.95, top-k 20 y `reasoning_effort="xhigh"` salvo indicacion.

| Prueba | Tessera vs base |
|---|---|
| Tokens de pensamiento por turno de agente (11 tareas held-out, 44 estados fijos, 2 muestras cada uno) | 0,50-0,64x; media geometrica 0,496x (IC 90% 0,385-0,624); ponderado por tokens 0,644x (IC 90% 0,208-0,866) |
| Tokens generados por turno de agente (pensamiento + respuesta + tool calls) | Media 575 vs 847 |
| Tool calls validas | 88 de 88, igual que el base |
| Bucles de repeticion | 0 de 88, igual que el base |
| Ejecuciones multi-paso (9 tareas held-out, hasta 15 pasos) | Ninguno de los dos rompio tests existentes; sin perdida de calidad medible en una prueba pequena |
| Contexto largo (6 estados con prompts de 101K-131K tokens, salida max. 32.768) | 6 de 6 tool calls validas, igual que el base; sin bucles ni llenado de ventana |
| Smoke test de seguridad e idioma (20 prompts, 2 esfuerzos, salida max. 4.096 tokens) | Sin senal de alarma frente al base segun un juez modelo ciego |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 23,4 GB; para inferencia hay que sumar KV cache (escalas FP8 estaticas) y overhead del motor, por lo que se recomienda al menos 32 GB de VRAM para contextos moderados y mas para ventanas de 64K-131K tokens.
- GPU recomendadas: NVIDIA Blackwell con computo nativo FP4, como B200 o RTX PRO 6000 Blackwell (el checkpoint se construyo en esta ultima).
- En GPUs no Blackwell, la carga depende del motor de inferencia; no hay datos de compatibilidad mas alla de lo indicado.
- Opciones de despliegue: vLLM 0.31 (clase offline `LLM` verificada; `vllm serve` no probado). Para los pesos bf16 o GGUF existen alternativas como llama.cpp u Ollama a traves del repo GGUF, aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZelligeAI/Tessera-27B-B-CJK-NVFP4 | 20.294.595.344 (safetensors) | 131K probados; maximo no disponible | NVFP4/FP8/bf16 | Apache 2.0 | HuggingFace, 20 descargas |
| ZelligeAI/Tessera-27B-B-CJK (bf16) | mismo modelo base | idem | bf16 (55,6 GB) | Apache 2.0 | HuggingFace |
| unsloth/Qwen3.8-27B-NVFP4 | no disponible en la informacion | no disponible | NVFP4/FP8 (layout replicado) | no disponible | HuggingFace |
| Qwen3.8-27B (base) | no disponible en la informacion | no disponible | no disponible | no disponible | HuggingFace |

Los datos de rendimiento comparativo con alternativas no estan publicados; solo se dispone de la comparacion Tessera vs su base sin ajustar en las pruebas de agente descritas arriba.

## Limitaciones y advertencias

- Este checkpoint no ha sido evaluado: los resultados de la model card provienen del LoRA evaluado, no de los ficheros NVFP4/FP8.
- Requiere GPU NVIDIA Blackwell para computo nativo FP4; en otras GPUs la carga depende del motor y no esta garantizada.
- `vllm serve` y el paso de `reasoning_effort` en `chat_template_kwargs` no han sido probados; solo se verifico la clase offline `LLM` de vLLM 0.31.
- Si se descargo el repositorio antes del 2026-11-05, hay que volver a descargar `config.json`: la primera version no cargaba en vLLM 0.31 por un desajuste en los nombres de modulo.
- Es una release beta (LoRA rango 32 fusionado); no hay garantias de estabilidad en produccion.
- El razonamiento en CJK comprimido puede dificultar la auditoria e interpretabilidad de las trazas de pensamiento.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados no documentados oficialmente; las salidas estan orientadas al ingles.
- La prueba de calidad multi-paso se describe como pequena; la ausencia de perdida de calidad no es concluyente.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones del modelo base.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-NVFP4
- Modelo base bf16: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK
- Adaptador LoRA: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-LoRA
- GGUF: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-GGUF
- Referencia de layout NVFP4: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
