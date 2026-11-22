# tsii42/Qwen3.8-27B-W8A8-Dynamic-Ascend-310P-vLLM

## Resumen

Qwen3.8-27B-W8A8-Dynamic-Ascend-310P-vLLM es una exportación cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario tsii42. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a INT8 mediante la herramienta ModelSlim de Huawei, con esquema W8A8_DYNAMIC (activaciones y pesos en 8 bits con escalas dinámicas). El objetivo es hacer viable la inferencia de un modelo de 27 000 millones de parámetros en hardware Ascend de gama media, concretamente en una tarjeta Atlas 300I Duo con dos SoC Ascend 310P3.

El paquete incluye nueve shards de pesos con un total aproximado de 33,92 GiB y está pensado para servirse con vLLM-Ascend usando paralelismo tensorial TP2 y ejecución en modo eager. La model card documenta recetas de despliegue verificadas, parches de runtime necesarios para el tool calling y mediciones de rendimiento de prefill, prefix caching y decodificación en contextos de hasta 192 000 tokens.

Su relevancia actual reside en que demuestra una ruta reproducible para ejecutar un VLM de gran tamaño en aceleradores Ascend con cuantización INT8, un escenario poco cubierto por las fichas convencionales centradas en GPU NVIDIA. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque las limitaciones de rendimiento y de tooling del stack Ascend 310P condicionan su aplicabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3_5ForConditionalGeneration segun config), con capas GDN (gated delta network) segun referencias del runtime |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32 768 tokens en la configuracion de aceptacion validada; probado hasta 262 144 tokens con receta extendida; maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | W8A8_DYNAMIC (INT8 pesos y activaciones) via ModelSlim; no es compressed-tensors W8A8 ni W8A8SC |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (9 shards, ~33,92 GiB), consumido con `--quantization ascend` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto. La config declara la familia `Qwen3_5ForConditionalGeneration`. La model card menciona capas GDN (gated delta network) y una ruta de prefill "WY", lo que sugiere componentes de atención lineal o de estado recurrente híbridos junto con la atención estándar. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información corresponde al modelo original y no se reproduce en esta ficha.

Esta publicación no entrena nada: aplica cuantización post-entrenamiento W8A8_DYNAMIC con ModelSlim, manteniendo los tensores de pesos sin modificar tras la descarga. La innovación técnica relevante está en el stack de despliegue: parches de runtime (`runtime-patch/`) con seis ficheros verificados por md5, la variable de entorno `VLLM_ASCEND_310P_GDN_WY=torch` para forzar la ruta de referencia en torch del prefill WY, y `VLLM_ASCEND_310P_GDN_FINITE_CHECK=1` para validación numérica. También se documenta una pila opcional de decodificación con MTP (multi-token prediction) K=1 y grafos `FULL_DECODE_ONLY`, que aporta un 1,25× en tokens/s con 512 tokens de completion.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen, incluyendo modo thinking desactivable mediante `chat_template_kwargs={"enable_thinking": false}`.
- Comprensión de imagen y texto combinados (pipeline image-text-to-text).
- Tool calling / function calling: validado y funcional, pero requiere la compuerta `VLLM_ASCEND_310P_GDN_WY=torch` y los flags de herramientas; la suite de aceptación reprodujo 12/15 casos dos veces.
- Razonamiento multi-paso y uso como agente, condicionado al soporte de tool calling del runtime parcheado.
- Contexto largo: probado con prefill y decodificación hasta 192 000 tokens, y sondas hasta 262 144 tokens con receta extendida.
- Prefix caching: soportado en el stack (desactivado en la config de aceptación, activable), con hasta ~48× de mejora en TTFT a 192k tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio.

## Casos de uso

- Asistente conversacional con imágenes en entornos con hardware Ascend: el modelo puede mantener diálogos multi-turno incorporando capturas o documentos escaneados, aprovechando la ventana de 32k tokens de la configuración validada y el prefix caching para prompts repetidos.
- Automatización documental con contexto largo: con la receta extendida a 192k–262k tokens, es adecuado para resumir o extraer información de expedientes extensos donde el prefill frío es costoso pero el prefijo se reutiliza; el prefix caching reduce el TTFT hasta ~48× en esos escenarios.
- Agentes con herramientas en infraestructura Huawei: pipelines que requieran function calling sobre Atlas 300I Duo, siempre que se despliegue la imagen parcheada y la compuerta GDN-WY en torch, con la suite de aceptación como referencia de fiabilidad.
- Prototipado y evaluación de VLM en clústeres Ascend: útil para equipos que ya operan CANN 9.1.0 y quieren comparar calidad INT8 frente a BF16 sin disponer de GPU NVIDIA.
- Extracción de información de imágenes en back office: clasificación y descripción de imágenes con salida estructurada mediante tool calling, en volúmenes moderados dados los 2–7 tok/s de decodificación medidos.
- Investigación sobre cuantización INT8 en aceleradores no NVIDIA: el repositorio sirve como referencia reproducible de ModelSlim W8A8_DYNAMIC con métricas de prefill, cache y decode publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documentan métricas de serving medidas por el autor:

| Metrica | Valor medido |
|---|---|
| Prefill en frio (2k–192k) | 454 tok/s a 2k, descendiendo hasta 81 tok/s a 192k |
| Aceleracion de TTFT con prefix caching | hasta ~48× a 192k tokens |
| Prefix caching en prefijo cacheado | ~3,5× |
| Decodificacion | 2–7 tok/s |
| Mejora con pila opcional (MTP K=1 + grafos FULL_DECODE_ONLY + cpu binding) | 1,25× tokens/s a 512 tokens de completion |
| Suite de aceptacion de tool calling | 12/15 casos, reproducida dos veces |
| Numero de ejecuciones del benchmark de contexto largo | 77 (rango 2k–192k) |

## Requisitos de hardware

- VRAM/NPU: los pesos ocupan aproximadamente 33,92 GiB en INT8; se validó en una Atlas 300I Duo con 2× Ascend 310P3 de ~44 GiB cada una, en TP2. La memoria efectiva por dispositivo debe cubrir pesos, caché KV y caché Mamba en float16.
- GPU/NPU recomendadas: Huawei Atlas 300I Duo (Ascend 310P3) es el único hardware validado. No hay validación documentada en A100, H100 ni RTX 4090; el flag `--quantization ascend` es específico del stack Ascend.
- GPU de consumo: no aplica; no se documenta soporte para GPUs consumer NVIDIA.
- Software: CANN 9.1.0, HDK 26.0.rc1, torch_npu 2.10.0.post4, imagen vLLM/vLLM-Ascend 0.27.1rc derivada para 310P. BF16, Triton y modo grafo no se usaron en la configuración validada; ejecución en modo eager.
- Despliegue: vLLM-Ascend con imagen parcheada construida desde `runtime-patch/Dockerfile`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Parámetros de serving validados: `--tensor-parallel-size 2`, `--quantization ascend`, `--mamba-ssm-cache-dtype float16`, `--dtype float16`, `--max-model-len 32768`, `--max-num-seqs 4`, `--enforce-eager --enable-chunked-prefill`, `--language-model-only`, `--no-enable-prefix-caching`.
- Latencia y throughput: prefill 454 tok/s en frío a 2k y 81 tok/s a 192k; decodificación 2–7 tok/s; 1,25× adicional con la pila opcional de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware | Licencia |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B W8A8 Ascend) | 27B | 32k validado, hasta 262k probado | W8A8_DYNAMIC INT8 | Ascend 310P (Atlas 300I Duo) | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible en esta ficha | BF16 original | GPU/NPU genérica | Apache 2.0 |
| Alternativas INT8 para Ascend de otros VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y hardware objetivo.

## Limitaciones y advertencias

- El tool calling solo es estable con la compuerta `VLLM_ASCEND_310P_GDN_WY=torch` y la imagen de runtime parcheada; sin ella, el tráfico multi-turno con herramientas no está validado.
- La suite de aceptación de tool calling reprodujo 12/15 casos, lo que implica una tasa de fallo no despreciable en producción.
- Rendimiento de decodificación bajo: 2–7 tok/s, insuficiente para interacción en tiempo real con generaciones largas.
- La configuración de aceptación desactiva el prefix caching y usa 32k de contexto; el contexto largo (192k–262k) requiere recetas extendidas y presenta prefill de 81 tok/s a 192k.
- La model card menciona una "engine-wedge note" en la tabla de sondas de 262k, indicando riesgo de bloqueo del motor en ese régimen.
- No hay validación en GPU NVIDIA ni en otros aceleradores; el artefacto es específico de Ascend 310P y del flag `--quantization ascend`.
- No se documentan idiomas soportados ni evaluación de sesgos o alucinación para esta exportación cuantizada; la cuantización INT8 puede degradar la calidad respecto al BF16 original y no se publican métricas de calidad que lo cuantifiquen.
- La licencia Apache 2.0 permite uso comercial, pero las dependencias del stack (CANN, vLLM-Ascend, parches) deben revisarse por separado.
- El modo thinking está activado por defecto en la plantilla de chat; conviene desactivarlo explícitamente en cargas normales para evitar latencia y coste innecesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tsii42/Qwen3.8-27B-W8A8-Dynamic-Ascend-310P-vLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de despliegue completa: INSTALL.md dentro del repositorio
- Parches de runtime: directorio `runtime-patch/` dentro del repositorio
- Notas de validación: VALIDATION.md dentro del repositorio
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada
