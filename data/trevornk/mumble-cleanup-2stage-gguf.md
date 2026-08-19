# trevornk/mumble-cleanup-2stage-GGUF

## Resumen

`mumble-cleanup-2stage-q4_0.gguf` es una cuantización Q4_0 del modelo `amitashwini/mumble-cleanup-2stage`, un fine-tune LoRA de `Qwen/Qwen2.5-0.5B-Instruct` entrenado para limpiar transcripciones brutas de speech-to-text: elimina muletillas, falsos arranques y autocorrecciones, preservando el significado del hablante. El autor, `trevornk`, publica esta variante porque el repositorio original solo ofrece pesos en f16 y Q4_K_M, y la cuantización Q4_0 aprovecha los kernels ARM `i8mm`/`dotprod` de `llama.cpp`, lo que reduce drásticamente la latencia en dispositivos móviles.

Con 494 millones de parámetros y un tamaño de archivo de 352 MB, el modelo está diseñado para ejecutarse localmente en hardware modesto, como smartphones o CPUs sin GPU dedicada. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, heredada tanto del fine-tune como de la base Qwen. La relevancia actual radica en la creciente demanda de procesamiento de voz on-device, donde la privacidad y la baja latencia son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-0.5B-Instruct (transformer decoder-only) |
| Parametros totales | 494.032.768 (494M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct, probablemente 32k, no confirmado) |
| Tipos de cuantizacion | Q4_0 (este repo); f16 y Q4_K_M disponibles en el upstream |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only con 494M de parámetros, entrenado por el equipo Qwen con un enfoque instruct. Sobre esta base, `amitashwini` aplicó un fine-tune LoRA (Low-Rank Adaptation) para la tarea específica de limpieza de transcripciones. Los datos de entrenamiento no están documentados públicamente, pero la model card indica que el modelo fue entrenado con un prompt de sistema fijo y un formato de salida en dos etapas, lo que sugiere un dataset curado con pares de transcripciones sucias y limpias.

La cuantización Q4_0 se realizó con la herramienta estándar `llama-quantize` de `llama.cpp` (revisión `152d337fa`, tag `b9867`), a partir del archivo f16 del upstream. Esta cuantización de 4 bits por peso reduce el tamaño de 494M parámetros a aproximadamente 352 MB, manteniendo una calidad aceptable para la tarea. La elección de Q4_0 en lugar de Q4_K_M se justifica por la compatibilidad con kernels ARM optimizados, que aceleran la inferencia en dispositivos móviles.

## Capacidades

- Limpieza de transcripciones de voz: elimina muletillas ("eh", "um"), falsos arranques ("quiero decir...") y autocorrecciones ("no, mejor así"), preservando el contenido semántico.
- Formato de salida en dos etapas: el modelo genera una estructura específica (probablemente una primera pasada de limpieza y una segunda de refinamiento), que debe ser parseada correctamente por la aplicación.
- Ejecución on-device: optimizado para correr en CPUs ARM con kernels `i8mm`/`dotprod`, alcanzando latencias de ~2.9 s en un Pixel 10a para un prompt típico.
- Compatible con `llama.cpp` y sus bindings (Python, Node.js, etc.), así como con herramientas como Ollama o llama-cpp-python.
- No es un modelo de propósito general: no soporta tool calling, agentes ni razonamiento multi-paso; está especializado únicamente en la tarea de limpieza de texto.

## Casos de uso

- Aplicaciones de dictado por voz en tiempo real: el modelo puede limpiar la transcripción generada por un motor de speech-to-text antes de mostrarla al usuario, mejorando la legibilidad sin necesidad de conexión a internet.
- Asistentes de voz para dispositivos móviles: integración en apps de notas de voz o mensajería para convertir audio en texto limpio y listo para enviar, con latencia inferior a 3 segundos en hardware actual.
- Post-procesamiento de subtítulos o transcripciones en podcasts: automatiza la corrección de transcripciones generadas por herramientas como Whisper, eliminando artefactos del habla espontánea.
- Sistemas de atención al cliente con grabaciones de llamadas: limpia las transcripciones para su análisis posterior, facilitando la extracción de información relevante sin ruido lingüístico.
- Herramientas de accesibilidad para personas con discapacidad auditiva: convierte subtítulos automáticos en texto más natural y comprensible en tiempo real.
- Pipelines de procesamiento de voz en entornos con privacidad estricta: al ejecutarse localmente, evita enviar datos de audio o texto a servidores externos, cumpliendo requisitos de confidencialidad en sectores como salud o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una evaluación específica:

- Comparación A/B contra `LFM2.5-350M` en un corpus de transcripciones diseñado para esta tarea: el modelo obtuvo un **80.6%** frente al **66.3%** del competidor (single-run, single-corpus; el autor lo califica como direccional, no como claim de leaderboard).
- Medición de latencia en un Pixel 10a dentro de la app Ramblr: la variante Q4_0 tardó **~2.9 s** en completar la limpieza, mientras que la Q4_K_M excedió un límite de 15 s y abortó la decodificación.

Estos datos son específicos del caso de uso y no generalizables, pero indican que la cuantización Q4_0 ofrece un equilibrio adecuado entre calidad y velocidad para despliegue on-device.

## Requisitos de hardware

- **VRAM**: al ser un modelo de 494M parámetros en Q4_0 (352 MB), puede ejecutarse completamente en CPU sin GPU. Si se usa GPU, cabrá en cualquier tarjeta con más de 1 GB de VRAM (por ejemplo, GTX 1050, Raspberry Pi 5 con 8 GB, etc.).
- **GPUs recomendadas**: no requiere GPU dedicada; funciona bien en CPUs ARM (Snapdragon, Apple Silicon) y x86 modernas. Para despliegue en servidor, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- **Dispositivos compatibles**: smartphones Android/iOS, Raspberry Pi, mini-PCs, portátiles con CPU estándar.
- **Opciones de despliegue**: `llama.cpp` (nativo), `llama-cpp-python`, `Ollama` (si se añade el archivo GGUF), `llama-cpp` para Node.js, o integración directa en apps móviles vía bindings de C++.
- **Latencia y throughput**: en un Pixel 10a, ~2.9 s por prompt de limpieza típico (medición real). En CPU x86 moderna, se espera latencias sub-segundo a pocos segundos dependiendo de la longitud del texto. El throughput no está documentado, pero para un modelo de este tamaño, puede procesar varios prompts por segundo en hardware de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Rendimiento en tarea de limpieza |
|---|---|---|---|---|---|
| `mumble-cleanup-2stage` (este) | 494M | Q4_0 | no disponible | Apache-2.0 | 80.6% (A/B contra LFM2.5-350M) |
| `LFM2.5-350M` | 350M | no especificado | no disponible | no disponible | 66.3% (misma evaluación) |
| `Qwen2.5-0.5B-Instruct` (base) | 494M | f16 | 32k (estimado) | Apache-2.0 | no evaluado para esta tarea |

La comparativa se basa únicamente en la información proporcionada. No se dispone de datos sobre otros modelos de limpieza de transcripciones con los que comparar directamente.

## Limitaciones y advertencias

- **Prompt obligatorio**: el modelo fue entrenado con un prompt de sistema exacto; usar cualquier otra variante degrada la salida. No se debe templatear ni añadir instrucciones adicionales.
- **Formato de salida específico**: la salida en dos etapas requiere un parser adecuado; si no se ajusta al formato esperado, la integración fallará.
- **Alcance limitado**: no es un modelo de chat general ni de razonamiento; solo sirve para limpiar transcripciones de habla espontánea.
- **Sesgos potenciales**: al ser un fine-tune de un modelo pequeño, puede heredar sesgos del dataset de entrenamiento, aunque no hay evidencia documentada.
- **Riesgo de alucinación**: al ser un modelo generativo, podría alterar el significado original en casos ambiguos; se recomienda validación humana en aplicaciones críticas.
- **Restricciones de uso comercial**: licencia Apache-2.0, sin restricciones conocidas, pero se debe verificar la licencia del modelo base y del dataset de entrenamiento (no documentado).
- **Calidad de cuantización**: Q4_0 es una cuantización agresiva; puede haber pérdida de calidad frente a f16, aunque la evaluación A/B sugiere que es aceptable para esta tarea.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/trevornk/mumble-cleanup-2stage-GGUF)
- [Modelo upstream `amitashwini/mumble-cleanup-2stage`](https://huggingface.co/amitashwini/mumble-cleanup-2stage)
- [Modelo base `Qwen/Qwen2.5-0.5B-Instruct`](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Repositorio Ramblr (app de ejemplo)](https://github.com/trevornk/ramblr)
- [Issue sobre despliegue on-device](https://github.com/trevornk/ramblr/issues/37)
