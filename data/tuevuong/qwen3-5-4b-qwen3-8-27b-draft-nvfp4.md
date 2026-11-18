# tuevuong/Qwen3.5-4B-Qwen3.8-27B-Draft-NVFP4

## Resumen

Qwen3.5-4B-Qwen3.8-27B-Draft-NVFP4 es una cuantizacion NVFP4 (W4A4) del modelo borrador `nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft`, un modelo de 4.205.751.296 parametros disenado especificamente para decodificacion especulativa contra el modelo objetivo Qwen3.8-27B. La cuantizacion la ha producido el usuario `tuevuong` con llm-compressor 0.15.0 y se distribuye en formato compressed-tensors para su servicio con vLLM. El checkpoint resultante ocupa 4,5 GB frente a los 8,4 GB del modelo en BF16.

El interes de esta publicacion es practico: permite ejecutar el borrador de decodificacion especulativa en GPUs Blackwell (SM120) con tensor cores FP4, reduciendo el footprint de memoria y habilitando su convivencia con otros procesos en la misma GPU. No es un modelo de chat autonomo: es un componente de un pipeline de inferencia acelerada que debe emparejarse con el modelo objetivo para el que fue entrenado.

La relevancia es doble: por un lado, demuestra un flujo completo de cuantizacion NVFP4 sobre un modelo con capas de atencion lineal (GatedDeltaNet) y lista de exclusiones selectiva; por otro, documenta latencias y consumos medidos en hardware consumer (RTX 5070 Ti), un dato poco habitual en este tipo de artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atencion lineal GatedDeltaNet (familia Qwen3.5); modulo MTP excluido en esta cuantizacion |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens configurados en el ejemplo de servicio (`--max-model-len 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos FP4 E2M1 con bloques de 16 y escalas FP8-e4m3; activaciones FP4 con escalas estaticas globales/locales); `embed_tokens`, `lm_head` y proyecciones `linear_attn` se mantienen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelos base Qwen3.5-4B y Qwen3.8-27B bajo Apache 2.0) |
| Formato de pesos | safetensors en formato compressed-tensors (repo de 4,8 GB; checkpoint de 4,5 GB) |

## Arquitectura y entrenamiento

El modelo base es un borrador de decodificacion especulativa de 4,2 mil millones de parametros construido sobre la arquitectura Qwen3.5, que combina capas de atencion estandar con capas de atencion lineal GatedDeltaNet. El entrenamiento original (realizado por NVIDIA) esta orientado a alinear la distribucion de tokens del borrador con la del modelo objetivo Qwen3.8-27B, de modo que las propuestas del borrador sean aceptadas con alta frecuencia durante la verificacion especulativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta publicacion concreta es el esquema de cuantizacion. Se aplico `QuantizationModifier` de llm-compressor con `scheme="NVFP4"` sobre todas las capas `Linear`, excluyendo `lm_head`, `embed_tokens` y todas las proyecciones de `linear_attn` (GatedDeltaNet), que permanecen en BF16. La calibracion uso el split `perfectblend` con 128 secuencias de 2048 tokens. El bloque `mtp.*` no esta incluido porque la cuantizacion carga `Qwen3_5ForCausalLM`, que no incorpora el modulo MTP; para conservarlo habria que recuantizar el base con `load_context(load_mtp=True)`. El resultado se sirve mediante los kernels NVFP4 de FlashInfer en vLLM 0.34.0.

## Capacidades

- Generacion de texto autoregresiva como modelo borrador en decodificacion especulativa; su funcion es proponer tokens que el modelo objetivo Qwen3.8-27B verifica.
- Soporte de tool calling en el servidor vLLM de ejemplo, con parser `qwen3_coder` (formato XML de Qwen3-Coder) y `--enable-auto-tool-choice`. La model card advierte que el modelo no esta ajustado por instrucciones para uso agentico.
- Emision de bloques de razonamiento delimitados, procesables con `--reasoning-parser qwen3` para separarlos al campo `reasoning`.
- Conversaciones multi-turno a traves de la API compatible con OpenAI de vLLM, con contexto configurable hasta 65.536 tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el smoke test de la model card usa una consulta en vietnamita, pero no se documenta cobertura de idiomas).
- Vision y audio: no disponibles.

## Casos de uso

- Aceleracion de inferencia de Qwen3.8-27B en produccion: desplegar este borrador junto al objetivo en vLLM para que la decodificacion especulativa reduzca la latencia por token; el borrador de 4,2B es mucho mas barato de evaluar que el objetivo de 27B.
- Servicio en GPUs Blackwell consumer: con 4,5 GB de checkpoint y ~9,3 GB de footprint total medido en una RTX 5070 Ti, permite reservar el resto de la VRAM para el modelo objetivo o para otros servicios.
- Convivencia con otras cargas en la misma GPU: la configuracion documentada con `--gpu-memory-utilization 0.60` (~9,8 GB en una tarjeta de 16 GB) deja espacio para una instancia de Ollama de ~4,6 GB, util en estaciones de desarrollo con multiples herramientas.
- Entornos de investigacion sobre decodificacion especulativa: sirve como referencia reproducible de un pipeline llm-compressor + vLLM con NVFP4, incluida la lista de exclusiones para capas de atencion lineal.
- Pruebas de integracion de tool calling: el ejemplo de despliegue incluye `--tool-call-parser qwen3_coder` y un smoke test con esquema de funcion, lo que facilita validar el cableado de function calling en un stack compatible con OpenAI antes de conectar el objetivo.
- Validacion de rendimiento en FP4: con ~141 tok/s de decode medidos, permite comparar el throughput del borrador cuantizado frente a BF16 en el mismo hardware antes de comprometer recursos en produccion.
- Despliegue con Docker Compose en pipelines de CI: el manifiesto incluido y el montaje de `~/.cache/vllm` para reutilizar la cache de torch.compile reducen el tiempo de arranque en entornos efimeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son mediciones de servicio en una RTX 5070 Ti (SM120) con vLLM 0.34.0 y kernels FlashInfer NVFP4, conviviendo con una instancia de Ollama:

| Metrica | Valor medido |
|---|---|
| Throughput de decodificacion | ~141 tok/s |
| Footprint de vLLM | ~9,3 GB (pesos 4,9 GB incluyendo partes BF16 + activaciones + ~3 GB de KV) |
| Capacidad de KV cache | ~91.000 tokens |
| Primer token / inicializacion del motor | ~90 s en frio; menor con `~/.cache/vllm` montada |
| Tamano del checkpoint | 4,5 GB (frente a 8,4 GB en BF16) |

## Requisitos de hardware

- VRAM estimada: ~9,3 GB de footprint total medido con `--gpu-memory-utilization 0.60` y contexto de 65.536 tokens; los pesos cuantizados son 4,9 GB en memoria incluyendo las partes en BF16.
- GPU recomendadas: NVIDIA Blackwell con tensor cores FP4 (SM120), como la RTX 5070 Ti usada en las pruebas. No se documenta compatibilidad con generaciones anteriores en la informacion disponible.
- Cabe en GPU consumer: si, segun la medicion en una RTX 5070 Ti de 16 GB, dejando margen para otros procesos.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:latest`, vLLM 0.34.0) con `--quantization compressed-tensors` detectado automaticamente; se documenta tambien docker-compose. No se mencionan llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: ~141 tok/s de decode; ~90 s de inicializacion en frio.
- Ajuste recomendado: `-cc {"cudagraph_mode":"PIECEWISE"}` en hosts donde otros procesos corren durante la captura de CUDA graphs, para evitar bloqueos con la captura FULL.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Como referencia estructural, el unico punto de comparacion documentado es el propio modelo base sin cuantizar:

| Modelo | Parametros | Formato | Tamano | Licencia |
|---|---|---|---|---|
| tuevuong/Qwen3.5-4B-Qwen3.8-27B-Draft-NVFP4 | 4.205.751.296 | NVFP4 W4A4 (compressed-tensors) | 4,5 GB | NVIDIA Open Model Agreement |
| nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft (base) | 4.205.751.296 | BF16 | 8,4 GB | NVIDIA Open Model Agreement |

## Limitaciones y advertencias

- Es un modelo borrador, no un modelo de chat: la model card advierte explicitamente que la calidad en conversacion autonoma es notablemente inferior a la del objetivo Qwen3.8-27B y que no esta ajustado por instrucciones para uso agentico. En produccion debe usarse como borrador contra el objetivo.
- El bloque `mtp.*` no esta incluido en esta cuantizacion; si se necesita decodificacion especulativa con MTP hay que recuantizar el base con `load_context(load_mtp=True)`.
- Solo se documenta su ejecucion en GPUs Blackwell (SM120) con kernels NVFP4 de FlashInfer en vLLM 0.34.0; el comportamiento en otras arquitecturas no esta disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser un borrador cuya salida se verifica contra el objetivo, el riesgo se traslada al pipeline completo.
- Cobertura de idiomas no documentada.
- Licencia NVIDIA Open Model Agreement: es necesario revisar sus terminos para uso comercial; los modelos base Qwen3.5-4B y Qwen3.8-27B son Apache 2.0, pero la licencia del derivado es la de NVIDIA.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del artefacto.
- El tiempo de inicializacion en frio (~90 s) es relevante para despliegues con arranques frecuentes; se mitiga montando la cache de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuevuong/Qwen3.5-4B-Qwen3.8-27B-Draft-NVFP4
- Modelo base: https://huggingface.co/nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
