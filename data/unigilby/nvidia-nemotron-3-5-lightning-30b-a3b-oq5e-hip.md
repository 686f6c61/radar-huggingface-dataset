# unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ5e-HIP

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ5e-HIP es una cuantización comunitaria del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario unigilby. El checkpoint aplica cuantización mixta (oQ5e) con precisión afín y grupos de 64 sobre los pesos originales en BF16, y reorganiza el layout para que el motor nativo HIP de TensorFold pueda leerlo en GPUs AMD. No es un modelo nuevo: es un artefacto de despliegue que conserva la arquitectura Nemotron H (híbrida Mamba-Transformer con mezcla de expertos) del modelo base.

El modelo base emplea una arquitectura `nemotron_h` con 23 capas MoE y 6 capas de atención, con 31.577.940.288 parámetros totales y presumiblemente 3B activos por token (la nomenclatura A3B del nombre lo indica). La cuantización mantiene los expertos enrutados a 5 bits, los expertos compartidos y las proyecciones Mamba y de atención a 6-8 bits, y el router y las capas normativas en BF16. El resultado ocupa 21,66 GiB en disco, con un head MTP (multi-token prediction) separado en 4 bits.

La relevancia de este checkpoint es doble: por un lado, demuestra que es posible ejecutar un modelo MoE de 30B en hardware AMD de consumo (Strix Halo, 128 GB de memoria unificada) con velocidades de decodificación cercanas a 60 tok/s en modo plano y hasta 107 tok/s con decodificación especulativa MTP activada. Por otro, expone una limitación práctica importante: el motor principal de TensorFold todavía no soporta anchos de bits mixtos en HIP sin tres pull requests abiertos que aún no han sido fusionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H (híbrida Mamba-Transformer con MoE), tag `nemotron_h` |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | 3B (según nomenclatura A3B del modelo base; no confirmado en la información disponible) |
| Longitud de contexto | 131.072 tokens (configurado en los benchmarks con `--context 131072`) |
| Tipos de cuantizacion | oQ5e: mixta afín, grupo 64; expertos enrutados 5 bits, compartidos 8 bits, Mamba/atención 6-8 bits, embedding y lm_head 8 bits, router y normas BF16; head MTP separado en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX, shards + `mtp-4bit.safetensors`), 729 tensores principales |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Nemotron H, que combina capas de espacio de estados (Mamba) con capas de atención Transformer y capas de mezcla de expertos (MoE). Según la información del checkpoint cuantizado, el modelo contiene 23 capas MoE, 6 capas de atención y 23 proyecciones Mamba `in_proj` y `out_proj`, lo que confirma la naturaleza híbrida. Los expertos enrutados se organizan en 46 tensores apilados (fc1 y fc2 por cada una de las 23 capas MoE), y existen expertos compartidos con proyecciones `up` y `down` en cada capa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La innovación técnica destacable de esta publicación concreta es la cuantización selectiva por clase de matriz: los expertos enrutados (los tensores más numerosos) se comprimen a 5 bits, mientras que las proyecciones que lee cada token (Mamba, atención, expertos compartidos, embedding y head) se mantienen a 6-8 bits, y el router y las normas permanecen en BF16. El head MTP se separa en un archivo propio de 4 bits (751.638.984 bytes) para habilitar decodificación especulativa. El plan de cuantización reporta 5,70 bits por byte de peso y 118 boosts según las sensibilidades de la imatrix.

## Capacidades

- Generación de texto conversacional y de código, con modo "thinking" activado por defecto en la plantilla de chat.
- Razonamiento multi-paso y decodificación especulativa mediante el head MTP separado (2,49 tokens aceptados por ronda de verificación en el benchmark).
- Soporte de conversaciones multi-turno con contexto largo (hasta 131.072 tokens configurados).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware AMD de consumo: el checkpoint está específicamente adaptado para el motor HIP de TensorFold en GPUs AMD (por ejemplo, Radeon 8060S `gfx1151` en Strix Halo con 128 GB de memoria unificada), lo que permite ejecutar un MoE de 30B en una iGPU sin GPU dedicada.
- Servicio de chat con contexto largo: con 131.072 tokens de contexto y 4 peticiones en paralelo, el modelo puede gestionar conversaciones multi-turno extensas o análisis de documentos largos en un solo servidor.
- Generación de código asistida: el benchmark reporta 59,6 tok/s en decodificación plana y 89,7 tok/s con MTP en tareas de código, adecuado para autocompletado o generación de fragmentos en entornos de desarrollo locales.
- Inferencia con decodificación especulativa: el head MTP en 4 bits permite acelerar la generación entre un 20% y un 50% según el tipo de tarea (código o chat), útil en aplicaciones interactivas donde la latencia importa.
- Procesamiento por lotes en un solo nodo: con 148,8 tok/s agregados a 4 streams concurrentes, el modelo puede atender varias peticiones simultáneas en un servidor único sin GPU dedicada.
- Investigación y evaluación de cuantizaciones: al ser uno de cuatro checkpoints de la misma familia (oQ4e, oQ5e, oQ6e, oQ8e), sirve para estudiar el compromiso entre ancho de bits, velocidad y calidad en arquitecturas híbridas Mamba-MoE.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de velocidad de inferencia en un AMD Ryzen AI MAX+ 395 con Radeon 8060S `gfx1151`, 128 GB de memoria unificada LPDDR5X-8000, modo de energía `performance`, motor TensorFold HIP nativo, contexto 131.072 y 4 peticiones en paralelo, con 256 tokens generados y mediana de 3 ejecuciones.

| Métrica | oQ5e |
|---|---|
| Decodificación plana, código, T=1 / T=0 (tok/s) | 59,6 / 60,3 |
| Decodificación plana, chat, T=1 / T=0 (tok/s) | 59,6 / 60,3 |
| Decodificación con MTP, código, T=1 / T=0 (tok/s) | 89,7 / 106,7 |
| Decodificación con MTP, chat, T=1 / T=0 (tok/s) | 72,8 / 84,5 |
| Tokens por ronda, código / chat (T=1) | 2,54 / 2,05 |
| Decodificación agregada, 1 / 2 / 4 streams (tok/s) | 107,4 / 124,5 / 148,8 |
| Prefill en frío, prompt 2.048 tokens | 0,759 s (2.698 tok/s) |
| Prefill en frío, prompt 7.099 tokens | 2,773 s (2.560 tok/s) |
| Prefill en frío, prompt 28.333 tokens | 13,532 s (2.094 tok/s) |
| Carga del modelo (disco caliente) | 18 s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 21,81 GiB según el plan del motor al arrancar (etiqueta `mlx-q5g64+q6g64+q8g64`); 28,89 GiB de memoria GPU en uso tras la carga en reposo con contexto 131.072 y 4 peticiones en paralelo (incluye buffers de runtime).
- GPU recomendadas: AMD Radeon 8060S (`gfx1151`) en Strix Halo con 128 GB de memoria unificada; el motor HIP de TensorFold está compilado para esta arquitectura (`zig build native-hip -Dhip-arch=gfx1151`). No se dispone de datos para otras GPU AMD o NVIDIA.
- Cabe en GPU de consumo: sí, en iGPU AMD con memoria unificada de al menos 32 GB efectivos para el modelo y buffers; no se dispone de datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: TensorFold nativo con motor HIP (requiere una build con los PRs ashhart/TensorFold #3163, #3242 y #3251, aún no fusionados ni en release). El motor principal estándar de TensorFold rechaza estos checkpoints porque lee todas las matrices a un solo ancho. No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: 59,6 tok/s en decodificación plana y hasta 106,7 tok/s con MTP en código; 148,8 tok/s agregados con 4 streams; prefill entre 2.094 y 2.698 tok/s según longitud de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ5e-HIP | 31,58B totales, 3B activos | 131.072 | oQ5e mixta (5-8 bits) | OpenMDW-1.1 | Hugging Face (este repo) |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP | 31,58B totales, 3B activos | 131.072 | oQ4e mixta | OpenMDW-1.1 | Hugging Face (repo hermano) |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,58B totales, 3B activos | no disponible | BF16 | OpenMDW-1.1 | Hugging Face (modelo base) |

No se dispone de información sobre modelos de otros fabricantes comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El motor principal de TensorFold no puede cargar este checkpoint sin los tres pull requests abiertos (ashhart/TensorFold #3163, #3242 y #3251), que no están fusionados ni en release; en una build sin esos cambios el motor se detiene en la admisión o en la carga.
- La licencia OpenMDW-1.1 es una licencia "other" que debe revisarse antes de uso comercial; no se detallan en la información las restricciones concretas.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- Las mediciones de velocidad provienen de una sola máquina y ejecuciones únicas; los números con T=1 varían entre ejecuciones porque la aceptación de drafts depende del texto muestreado.
- El checkpoint está diseñado específicamente para GPUs AMD con motor HIP; no hay garantía de funcionamiento en CUDA, Metal u otros backends.
- El head MTP en 4 bits es un componente separado que debe cargarse junto al modelo principal para aprovechar la decodificación especulativa; sin él, el rendimiento cae a la decodificación plana.
- No se han publicado resultados de benchmarks de calidad en la información disponible, por lo que no es posible evaluar la degradación introducida por la cuantización mixta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ5e-HIP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio hermano oQ4e: https://huggingface.co/unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP
- Pull requests de TensorFold: ashhart/TensorFold #3163, #3242 y #3251 (referenciados en la model card; no se proporcionan URLs directas)
- Licencia OpenMDW-1.1: incluida en el repositorio como archivo `LICENSE`
