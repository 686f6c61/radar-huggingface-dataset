# ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt

## Resumen

ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt es una cuantizacion NVFP4 (4 bits en pesos y activaciones) del modelo denso multimodal Qwen3.8-27B de Alibaba, producida con llm-compressor mediante un paso oneshot de GPTQ sobre 1.024 muestras de calibracion. El checkpoint reduce el peso en disco de 55,59 GB (bf16 original) a 30,14 GB, un factor de 1,84x, y esta pensado para despliegue en GPUs Blackwell (SM100) con vLLM, donde alcanza un kernel FP4 nativo.

La cuantizacion no es uniforme: solo el stack MLP se cuantiza a NVFP4, mientras que todas las proyecciones de atencion del modelo de lenguaje (336 modulos de linear_attn y 64 de self_attn), el lm_head y la torre de vision se mantienen en bf16. Esta decision de diseno explica que la reduccion de tamano sea de 1,84x en lugar del ~3x que daria un paso de 4 bits generalizado. El autor publica este modelo como la mitad de un par junto a ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm, que usa calibracion multimodal; en este modelo ambas calibraciones producen resultados indistinguibles, por lo que se publica como un resultado nulo.

Las mediciones del autor, tomadas en una unica B200 con configuracion de serving fija, muestran una mejora de throughput de 1,44x-1,49x frente al modelo bf16 y una diferencia de calidad en MMMU-val de +1,2pp que cae dentro del ruido estadistico (p = 0,453, n=246). El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), basado en Qwen3.8-27B |
| Parametros totales | 19.869.896.304 (pesos safetensors del checkpoint cuantizado; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en configuracion de serving recomendada; el modelo base soporta hasta 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (MLP stack), bf16 (atencion, lm_head, torre de vision) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con quantize_meta.json de provenance) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal nativo de la familia Qwen3.8, con capacidades de vision (imagen y video) y razonamiento, y una ventana de contexto de 262K tokens. El checkpoint cuantizado conserva la arquitectura completa del modelo base, pero con el stack MLP convertido a NVFP4 mediante GPTQ oneshot con llm-compressor, calibrado exclusivamente sobre texto (1.024 muestras, 2.367 segundos de calibracion).

La lista de modulos ignorados por la cuantizacion contiene 511 entradas: 336 corresponden a las proyecciones de linear_attn (48 capas x 7 proyecciones), 64 a las proyecciones q, k, v, o de self_attn (16 capas x 4), 1 al lm_head y 110 a la torre de vision. Esto significa que toda la atencion del modelo de lenguaje permanece en bf16, lo que limita la reduccion de memoria pero preserva la calidad. El autor verifica en B200 con vLLM 0.27.1 que el checkpoint alcanza un kernel FP4 nativo (marcador `mm_fp4_sm100a`), sin fallback.

## Capacidades

- Generacion de texto y razonamiento multimodal: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo entrada de imagenes y video.
- Razonamiento extendido: el modelo base emplea cadenas de razonamiento largas (mas de 12.000 caracteres antes de responder en tareas complejas), lo que exige limites de generacion amplios.
- Codigo y flujos agente: el modelo base esta orientado a tareas de coding, agentic workflows y automatizacion de oficina.
- Tool calling y function calling: soportado por el modelo base, aunque no se detalla en la informacion del checkpoint cuantizado.
- Capacidades multilingues: no especificadas en la informacion proporcionada.
- Modo vision: la torre de vision se mantiene en bf16, por lo que las capacidades de comprension visual no se ven afectadas por la cuantizacion.

## Casos de uso

- Serving de vision-language en produccion con GPUs Blackwell: el checkpoint reduce el uso de VRAM de 55,59 GB a 30,14 GB, lo que permite servir el modelo en una unica B200 con `max_model_len=32768` y hasta 256 secuencias concurrentes, manteniendo un throughput de 3.186 tokens/s a saturacion (1,49x frente a bf16).
- Despliegue de agentes con contexto largo: con 32K tokens de contexto en configuracion recomendada (y hasta 262K en el modelo base), puede gestionar conversaciones multi-turno y razonamiento multi-paso sin perder el hilo.
- Automatizacion de oficina y generacion de codigo: el modelo base esta disenado para tareas de coding y office automation, y la cuantizacion no degrada las metricas de calidad medidas (MMMU-val sin cambio significativo).
- Evaluacion de calidad de cuantizacion: el par de checkpoints (texto vs. multimodal) permite reproducir el resultado nulo y comparar recetas de cuantizacion con el checkpoint de RadixArk.
- Prototipado local en hardware Blackwell: con 30,14 GB en disco, el modelo cabe en GPUs de 48 GB o superiores, permitiendo experimentacion local con vLLM.
- Investigacion sobre cuantizacion NVFP4: el repositorio incluye `quantize_meta.json` con la receta completa (GPTQ oneshot, 1.024 muestras, flag de calibracion), util para reproducir o modificar el proceso.

## Benchmarks y rendimiento

El autor proporciona mediciones propias en una unica B200 con configuracion de serving fija (`max_num_seqs=256`, `max_model_len=32768`, `gpu_memory_utilization=0.90`, compilacion VLLM + CUDAGraph). No se incluyen benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Qwen3.8-27B (bf16) | Este checkpoint | Diferencia |
|---|---|---|---|
| Throughput a 1 concurrente (tok/s) | 86,5 | 126,3 | +1,46x |
| Throughput a 8 concurrentes (tok/s) | 565,4 | 814,4 | +1,44x |
| Throughput a 32 concurrentes (tok/s) | 1.382,4 | 2.013,1 | +1,46x |
| Throughput a 128 concurrentes (tok/s) | 2.141,4 | 3.186,2 | +1,49x |
| MMMU-val MC (246 items pareados) | 0,8455 | 0,8577 | +1,2pp (p = 0,453) |

La diferencia de calidad en MMMU-val no es estadisticamente significativa (7 pares discordantes, p = 0,453). El autor advierte que n=246 solo permite descartar efectos grandes, no efectos pequenos. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 30,14 GB en disco; con `gpu_memory_utilization=0.90` y `max_model_len=32768`, cabe en una GPU de 48 GB (B200, por ejemplo).
- GPU recomendada: Blackwell (SM100), donde vLLM 0.27.1 alcanza el kernel FP4 nativo. En Hopper (H200/H100) vLLM cae a emulacion Marlin weight-only, medida en ~0,85x del rendimiento bf16 en un modelo comparable.
- GPU de consumo: no se indica compatibilidad con GPUs consumer; NVFP4 no es un win de velocidad en SM90 y el tamano del checkpoint (30,14 GB) supera la VRAM de la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: vLLM (comando `vllm serve ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt --max-model-len 32768`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 126,3 tok/s a batch 1 y 3.186,2 tok/s a 128 concurrentes en B200, con entrada de 2.048 tokens y salida de 256.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Contexto | Rendimiento MMMU-val | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | 27B (55,59 GB) | bf16 | 262K | 0,8455 (n=246) | Apache 2.0 |
| ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt | 19,87B pesos (30,14 GB) | NVFP4 MLP + bf16 atencion | 32K (serving) / 262K (base) | 0,8577 (n=246) | Apache 2.0 |
| RadixArk/Qwen3.8-27B-NVFP4 | No disponible | NVFP4 MLP + FP8 atencion + KV cache FP8 | No disponible | No disponible | No disponible |

La comparativa con RadixArk es de recetas, no de modelos: RadixArk usa modelopt con precision mixta (atencion a FP8, MLP a NVFP4, KV cache FP8), mientras que este checkpoint mantiene la atencion en bf16. No se dispone de datos de rendimiento de RadixArk para comparar.

## Limitaciones y advertencias

- La cuantizacion solo cubre el stack MLP; la atencion, el lm_head y la torre de vision permanecen en bf16, lo que limita la reduccion de memoria a 1,84x en lugar del ~3x de una cuantizacion completa.
- NVFP4 solo ofrece ventaja de velocidad en GPUs Blackwell (SM100). En Hopper (H200/H100) el rendimiento cae a ~0,85x del bf16, por lo que no es recomendable para despliegue en hardware anterior.
- La calibracion es solo de texto; el checkpoint hermano con calibracion multimodal (ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm) produce resultados indistinguibles en MMMU, pero no se ha evaluado en otras tareas multimodales.
- La medicion de calidad se limita a MMMU-val con n=246; no se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.).
- El modelo base emplea cadenas de razonamiento muy largas; cualquier harness que limite la generacion a pocos miles de tokens producira puntuaciones erroneas (el autor retiro una medicion previa de 0,4511 por este motivo).
- Riesgo de alucinacion y sesgos: no se proporciona informacion especifica sobre sesgos o comportamiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un checkpoint reciente (creado en agosto de 2026) con adopcion limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt
- Perfil del autor: https://huggingface.co/ThakiCloud
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Guia de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
