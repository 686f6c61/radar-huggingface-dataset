# splickz/qwen3.8-27b-yarn-nvfp4-sm120

## Resumen

`splickz/qwen3.8-27b-yarn-nvfp4-sm120` no es un modelo con pesos, sino una **página de reproducción** que documenta una configuración de runtime para ejecutar el artefacto NVFP4 de Qwen3.8-27B en una única GPU RTX 5090 (SM120) con extensión de contexto YaRN. El repositorio no contiene pesos: reutiliza el artefacto `qwen3_8_27b_nvfp4.ninfer` de `neroued/Qwen3.8-27B-nvfp4-NInfer` (21,49 GB, sha256 verificado) sin retrain, fine-tuning ni re-cuantización. Lo que se aporta es un motor `ninfer` modificado con una opción YaRN aplicada en tiempo de ejecución, más un conjunto de mediciones de rendimiento.

El modelo base es Qwen3.8-27B, un transformer denso de 27 mil millones de parámetros con arquitectura híbrida (atención lineal en 48 de 64 capas), torre de visión y cabeza MTP, con contexto nativo de 262.144 tokens. La combinación de cuantización NVFP4 (pesos y KV cache) y escalado posicional YaRN permite alcanzar **500.000 tokens de contexto práctico** en una GPU de 32 GB, y hasta 600.000 en el límite de VRAM. Es relevante porque demuestra que un modelo de 27B con contexto extremadamente largo puede ejecutarse en hardware consumer, algo que normalmente requeriría múltiples GPUs o servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense hybrid-attention, 48/64 capas con atencion lineal, vision tower, MTP head) |
| Parametros totales | 27 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Nativo: 262.144 tokens; extendido con YaRN factor 4 hasta 500.000 recomendado, 600.000 en el limite |
| Tipos de cuantizacion | NVFP4 (pesos y KV cache); KV cache k8v4 tambien medido |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato del motor ninfer, no safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con arquitectura hibrida: 48 de sus 64 capas usan atencion lineal, lo que reduce el coste computacional en contextos largos. Incluye una torre de vision (procesa imagenes y video) y una cabeza MTP (multi-token prediction) para decodificacion especulativa. El contexto nativo es de 262.144 tokens, extensible hasta 1M segun la documentacion de Qwen Cloud (aun no disponible localmente).

El artefacto NVFP4 es una cuantizacion de 4 bits en punto flotante (NVFP4) realizada por Unsloth y adaptada por Neroued para el motor `ninfer`. La extension YaRN se aplica **en tiempo de ejecucion** mediante una opcion del motor (`--rope-yarn-factor 4 --rope-original-max-position 262144`), que reescala las frecuencias RoPE con el metodo NTK-by-parts y aplica la correccion de escala de atencion `0.1·ln(F)+1`. No hay entrenamiento adicional: se trata de una solucion posicional que permite acceder a posiciones mas alla de la ventana entrenada, con la advertencia de que la calidad no esta garantizada.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de chat, razonamiento y agentes, aunque esta pagina no evalua esas capacidades.
- Vision: el modelo base incluye torre de vision (imagenes y video), pero el artefacto NVFP4 y la configuracion documentada no validan ese modo.
- Contexto largo: la combinacion NVFP4 + YaRN permite procesar prompts de hasta 500.000 tokens (y 600.000 en el limite) en una RTX 5090, con recuperacion de agujas 5/5 en las pruebas publicadas.
- Tool calling y agentes: no se menciona en la informacion disponible; el modelo base lo soporta, pero esta configuracion no lo valida.
- Decodificacion especulativa: la cabeza MTP del modelo base no esta validada con este port (advertencia explicita en la model card).

## Casos de uso

- Analisis de documentos legales o tecnicos extensos: con 500K de contexto, se puede cargar un corpus completo de miles de paginas en una sola pasada y hacer preguntas sobre cualquier parte, sin necesidad de chunking ni RAG. La recuperacion de agujas 5/5 sugiere que la informacion distribuida en el prompt es accesible.
- Agentes con historial de conversacion muy largo: un asistente que mantenga sesiones de dias o semanas sin perder el contexto previo, gracias a la ventana de 500K tokens.
- Procesamiento de codebases completas: cargar un repositorio entero (codigo fuente, documentacion, tests) en el contexto para tareas de refactorizacion o generacion de codigo con conocimiento global del proyecto.
- Investigacion academica: analisis de papers largos, libros o conjuntos de datos textuales que exceden la ventana tipica de 128K, ejecutado en una GPU de escritorio.
- Desarrollo de prototipos en hardware consumer: permite evaluar un modelo de 27B con contexto extremo sin alquilar GPUs en la nube, ideal para equipos con presupuesto limitado.
- Pruebas de estres de motores de inferencia: la configuracion documentada sirve como referencia para medir prefill, decode y uso de VRAM en contextos de 300K a 600K, util para quienes desarrollan o comparan motores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La pagina incluye mediciones de rendimiento de inferencia en una RTX 5090 (32 GB, SM120, WSL2, CUDA 13.1, driver 610.47) con factor YaRN 4 y recuperacion de agujas (needle retrieval) como prueba de humo:

| KV mode | `--max-context` | prompt tokens | recuperacion | prefill tok/s | decode tok/s | KV runtime | pico VRAM |
|---|---|---|---|---|---|---|---|
| nvfp4 | 300.000 | 270.055 | 5/5 | 2.237 | 53,3 | 5,47 GiB | 26.809 MiB |
| nvfp4 | 300.000 | 290.105 | 5/5 | 2.130 | 51,6 | 5,47 GiB | 26.809 MiB |
| nvfp4 | 400.000 | 389.954 | 5/5 | 1.662 | 49,2 | 7,18 GiB | 28.511 MiB |
| nvfp4 | 500.000 | 489.803 | 5/5 | 1.357 | 48,6 | 8,90 GiB | 30.474 MiB |
| k8v4 | 400.000 | 389.954 | 5/5 | 1.820 | 49,7 | 9,90 GiB | 31.507 MiB |
| nvfp4 | 600.000 | 590.053 | 5/5 | 655 | 33,1 | 10,6 GiB | 32.045 MiB |

Nota: la recuperacion de agujas es una prueba de humo, no demuestra calidad sin perdidas a 4x de la ventana entrenada.

## Requisitos de hardware

- GPU: RTX 5090 (32 GB, SM120) es la unica probada; se requiere arquitectura Blackwell para el formato NVFP4.
- VRAM: entre 26,8 GiB (contexto 300K) y 32,0 GiB (contexto 600K) con NVFP4; el modo k8v4 requiere ~31,5 GiB a 400K y no cabe a 500K.
- Sistema: WSL2 Ubuntu 22.04, CUDA 13.1, driver 610.47 (probado); el motor `ninfer` es especifico de NVIDIA.
- Motor de inferencia: `ninfer` (fork de Neroued) con la opcion YaRN anadida; se compila desde el repositorio `splickz/ninfer-yarn-nvfp4`.
- Despliegue: servidor local via `ninfer-serve` en el puerto 5800; no se mencionan integraciones con vLLM, Ollama o llama.cpp.
- Rendimiento: prefill de 2.237 tok/s a 300K y 1.357 tok/s a 500K; decode de 53,3 a 48,6 tok/s en el rango practico, cayendo a 33,1 tok/s a 600K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto nativo | Cuantizacion | VRAM necesaria | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262.144 | FP16/BF16 | >60 GB (multi-GPU) | Apache-2.0 |
| Qwen3.8-27B-NVFP4 (unsloth) | 27B | 262.144 | NVFP4 | ~20 GB (pesos) + KV | Apache-2.0 |
| splickz/qwen3.8-27b-yarn-nvfp4-sm120 | 27B | 262.144 + YaRN hasta 600K | NVFP4 + KV NVFP4 | 26-32 GB (RTX 5090) | Apache-2.0 |

La ventaja de esta configuracion frente al modelo base es la reduccion de VRAM (cuantizacion NVFP4) y la extension de contexto via YaRN, que permite ejecutar en una sola GPU consumer lo que de otra forma requeriria multiples GPUs o servicios en la nube. Frente a la cuantizacion NVFP4 estandar, anade la extension de contexto y las mediciones de rendimiento, pero no modifica los pesos.

## Limitaciones y advertencias

- **No contiene pesos**: el repositorio es una pagina de documentacion; los pesos son el artefacto NVFP4 de `neroued/Qwen3.8-27B-nvfp4-NInfer` sin cambios.
- **YaRN no garantiza calidad**: la recuperacion de agujas es una prueba de humo; a partir de ~2x de la ventana entrenada, la perplejidad suele degradarse. Hay que evaluar la calidad en la tarea concreta antes de usarlo en produccion.
- **600K esta al limite**: a 600K tokens quedan solo ~400-500 MiB libres de VRAM, con una caida de rendimiento notable (prefill 655 tok/s, decode 33,1 tok/s). La causa no esta aislada (presion de memoria o clamp del split-K).
- **Decodificacion especulativa no validada**: la cabeza MTP y DFlash no estan probadas con este port.
- **k8v4 no cabe a 500K**: el modo KV k8v4 consume ~40% mas memoria por token que nvfp4 y no es viable para contextos de 500K en esta GPU.
- **Experimental**: el codigo son tres commits pequenos sobre un upstream en movimiento; no es una solucion estable para produccion.
- **Sesgos y alucinacion**: no hay evaluacion de sesgos ni de tasas de alucinacion en la informacion disponible; se heredan los del modelo base Qwen3.8-27B.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/splickz/qwen3.8-27b-yarn-nvfp4-sm120
- Repositorio de codigo: https://github.com/splickz/ninfer-yarn-nvfp4
- Artefacto NVFP4 (pesos): https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Motor ninfer (upstream): https://github.com/Neroued/ninfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Trabajo previo del autor (compresion KV E8): https://github.com/splickz/ninfer-rk4v4-e8
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
