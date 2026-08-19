# ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm

## Resumen

ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm es una cuantización de precisión mixta del modelo multimodal Qwen3.8-27B de Alibaba, publicada por el usuario ThakiCloud en Hugging Face. El checkpoint aplica cuantización NVFP4 (4 bits) exclusivamente a la pila MLP del modelo, manteniendo en bf16 todas las proyecciones de atención, la torre de visión y el lm_head. El resultado es un archivo de 30,14 GB frente a los 55,59 GB del original en bf16, lo que supone una reducción de 1,84x en tamaño. La cuantización se realizó con llm-compressor mediante un oneshot GPTQ sobre 1.024 muestras de calibración que incluyen texto e imágenes.

El modelo está diseñado para servirse con vLLM en GPUs Blackwell (SM100), donde alcanza un kernel FP4 nativo que proporciona un aumento de throughput de 1,44x a batch 1 y 1,49x a saturación (128 peticiones concurrentes) respecto al modelo bf16, sin una pérdida de calidad medible en la tarea MMMU. En GPUs Hopper (H100/H200) no se obtiene ventaja de velocidad, ya que vLLM cae a una emulación Marlin que resulta más lenta que bf16. El checkpoint forma parte de un par con una variante calibrada solo con texto, publicada como resultado nulo al no encontrarse diferencias entre ambas calibraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (vision-lenguaje) con atencion lineal y atencion estandar (Qwen3.8-27B) |
| Parametros totales | 19.869.896.304 (~19,87B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de vLLM); el modelo base soporta hasta 262.144 |
| Tipos de cuantizacion | NVFP4 (4 bits) en MLP; bf16 en atencion, vision tower y lm_head; GPTQ oneshot para calibracion |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingue, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal denso que combina un codificador de vision con un modelo de lenguaje de 27B parametros nominales (aunque el recuento real de safetensors es de 19,87B). Incorpora dos tipos de atencion: atencion lineal (linear_attn) en 48 capas y atencion estandar en 16 capas, ademas de una torre de vision. La cuantizacion presentada en este repositorio no anade entrenamiento adicional; se trata de una calibracion oneshot GPTQ sobre 1.024 muestras que mezclan texto e imagenes, ejecutada con llm-compressor. La lista de modulos ignorados (mantenidos en bf16) incluye 336 proyecciones de linear_attn (48 capas x 7 proyecciones), 64 proyecciones de atencion estandar (16 capas x 4), el lm_head y 110 modulos de la torre de vision. Solo la pila MLP se cuantiza a NVFP4, lo que explica la reduccion de 1,84x en lugar de los ~3x que daria una cuantizacion completa de 4 bits.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de imagen y texto para producir respuestas en lenguaje natural.
- Soporte de tool calling y function calling: el modelo base Qwen3.8-27B esta disenado para agentes y automatizacion de oficina, aunque no se ha verificado explicitamente en esta version cuantizada.
- Capacidad de agente y razonamiento multi-paso: el modelo base incluye un modo de razonamiento que puede generar respuestas extensas (mas de 12.000 caracteres) antes de responder.
- Capacidades multilingues: no confirmadas en la ficha, pero el modelo base de Alibaba soporta multiples idiomas.
- Modo vision: la torre de vision se mantiene en bf16, por lo que la comprension de imagenes no se ve afectada por la cuantizacion.

## Casos de uso

- Servir un chatbot multimodal en produccion con GPUs Blackwell: el aumento de throughput de 1,49x a saturacion permite atender mas peticiones concurrentes con la misma infraestructura, reduciendo el coste por token.
- Procesamiento de documentos con imagenes (OCR, extraccion de datos): la ventana de contexto de 32.768 tokens (ampliable a 262k en el modelo base) permite analizar paginas completas con tablas, graficos y texto.
- Automatizacion de oficina: generacion de informes, resumenes de reuniones con capturas de pantalla o diagramas, y redaccion de correos a partir de imagenes.
- Agentes autonomos que necesitan interpretar capturas de pantalla o imagenes de interfaces: el modelo puede razonar sobre el estado visual de una aplicacion y decidir el siguiente paso.
- Despliegue en entornos con restricciones de memoria: al ocupar 30,14 GB en disco, puede cargarse en GPUs de 40 GB (A100, A6000) dejando margen para el overhead de inferencia.
- Evaluacion de calidad de cuantizacion: al ser un checkpoint publicado con datos de rendimiento detallados, sirve como referencia para estudiar el impacto de NVFP4 en modelos multimodales.

## Benchmarks y rendimiento

La model card proporciona resultados de MMMU (validacion, multiple-choice) y de throughput, medidos en una unica GPU B200 con vLLM 0.27.1, configuracion `max_num_seqs=256`, `max_model_len=32768`, `gpu_memory_utilization=0.90` y compilacion VLLM_COMPILE + CUDAGraphMode.FULL_AND_PIECEWISE.

| Metrica | Qwen3.8-27B (bf16) | Este build (NVFP4) | Diferencia |
|---|---|---|---|
| MMMU-val MC (246 items pareados) | 0,8455 | 0,8537 | +0,8pp (p=0,754, McNemar) |
| Throughput batch 1 (tokens/s) | 86,5 | 124,4 | 1,44x |
| Throughput batch 8 (tokens/s) | 565,4 | 811,4 | 1,44x |
| Throughput batch 32 (tokens/s) | 1.382,4 | 2.013,4 | 1,46x |
| Throughput batch 128 (tokens/s) | 2.141,4 | 3.189,0 | 1,49x |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card advierte que el tamaño de muestra (n=246) solo permite descartar efectos grandes, no efectos pequeños.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 30,14 GB en disco. Con overhead de inferencia (KV cache, buffers), se recomienda al menos 40 GB de VRAM para servir con vLLM a 32.768 tokens de contexto.
- GPU recomendadas: B200 (SM100) para aprovechar el kernel FP4 nativo (`mm_fp4_sm100a`). En H100/H200 (SM90) vLLM cae a emulacion Marlin, que rinde aproximadamente 0,85x respecto a bf16, por lo que no se recomienda su uso en Hopper.
- GPUs consumer: no cabe en RTX 4090 (24 GB) ni en otras GPUs de 24 GB o menos, dado el tamaño del modelo y la configuracion de contexto.
- Opciones de despliegue: vLLM (version 0.27.1 o superior) con el comando `vllm serve ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm --max-model-len 32768`. No se mencionan otros frameworks (llama.cpp, Ollama, TGI) en la documentacion.
- Latencia y throughput: los datos de la tabla anterior indican entre 124 y 3.189 tokens/s de salida segun la concurrencia, en una B200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Rendimiento MMMU | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (bf16 original) | ~19,87B | 262k | bf16 | 55,59 GB | 0,8455 (MC, n=246) | Apache 2.0 |
| ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm | ~19,87B | 32k (config vLLM) | NVFP4 MLP + bf16 atencion | 30,14 GB | 0,8537 (MC, n=246) | Apache 2.0 |
| RadixArk/Qwen3.8-27B-NVFP4 | ~19,87B | no disponible | NVFP4 MLP + FP8 atencion + FP8 KV cache | no disponible | no disponible | Apache 2.0 |

La comparativa con RadixArk se basa en la descripcion de la model card de ThakiCloud, que indica que esa variante usa una receta diferente (modelopt con precision mixta) y no es directamente comparable en tamaño o puntuacion.

## Limitaciones y advertencias

- Solo ofrece ventaja de velocidad en GPUs Blackwell (SM100). En Hopper (H100/H200) el rendimiento es inferior al bf16 (0,85x), por lo que no tiene sentido usarlo fuera de Blackwell.
- La cuantizacion solo afecta al MLP; la atencion permanece en bf16, limitando el ahorro de memoria a 1,84x en lugar de los ~3x que daria una cuantizacion completa.
- La ausencia de diferencia de calidad en MMMU se basa en una muestra pequeña (n=246); no se puede descartar una degradacion sutil en otras tareas o con otros conjuntos de datos.
- El modelo base puede generar respuestas de razonamiento muy largas (mas de 12.000 caracteres), lo que puede aumentar la latencia si no se limita `max_new_tokens`.
- No se especifican los idiomas soportados en la ficha; se asume que hereda las capacidades multilingues del modelo base, pero no esta confirmado.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.8-27B tambien la tenga (asi es, segun la informacion publica).
- El repositorio no incluye resultados de benchmarks estandar (MMLU, HumanEval, etc.), por lo que la evaluacion de calidad se limita a MMMU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm
- Perfil de ThakiCloud: https://huggingface.co/ThakiCloud
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Analisis de especificaciones y benchmarks: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Documentacion de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Guia de hardware y despliegue: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
