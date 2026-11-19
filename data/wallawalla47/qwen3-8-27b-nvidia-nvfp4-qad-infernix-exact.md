# wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact

## Resumen

Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact es un artefacto de pesos cuantizados derivado de Qwen3.8-27B, un modelo multimodal de 27.000 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. Sobre esa base, NVIDIA publicó una versión con cuantización NVFP4 y destilación consciente de cuantización (QAD, *quantization-aware distillation*), que es el punto de partida de este empaquetado. El autor del repositorio, wallawalla47, ha convertido ese checkpoint al formato propietario del motor Infernix, una implementación en C++/CUDA orientada a ejecutar el modelo en una única GPU de consumo de la familia Blackwell.

La relevancia del artefacto no reside en el modelo en sí, sino en el trabajo de ingeniería: se conservan de forma bit-exacta los códigos FP4 y FP8 de NVIDIA, sus escalas de bloque E4M3 y las escalas por tensor en FP32, sin redondear a otros formatos. El resultado es un fichero de 22,2 GB que cabe en los 32 GB de VRAM de una RTX 5090 y que incluye, además del backbone de texto, la torre de visión, un *drafter* MTP, un *drafter* DFlash2 y una cabeza de propuestas indexada para decodificación especulativa.

Se trata de un artefacto de hobby, tal como advierte el propio autor en la model card, con una versión de motor concreta como requisito y sin métricas de benchmarks publicadas. Es útil para desarrolladores que quieran reproducir inferencia multimodal de un modelo de 27B en hardware de consumo, no como sustituto de referencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas con atención lineal Gated Delta-Net y 16 capas de atención completa; torre de visión; *drafter* MTP y *drafter* DFlash2 |
| Parametros totales | 27.000 millones (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4, grupos de 16) en 205 proyecciones; FP8 E4M3 (W8A8 estático) en 52 proyecciones; BF16/FP32 en embedding, normas, convoluciones, torre de visión y MTP |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (etiquetada como `other` en el Hub) |
| Formato de pesos | `.infernix` propietario (22.205.138.944 bytes); incluye `config.json` solo para el conteo de descargas del Hub |

## Arquitectura y entrenamiento

El backbone de texto consta de 64 capas con dimensión oculta de 5120 y un vocabulario de 248.320 tokens. La arquitectura combina 48 capas con atención lineal Gated Delta-Net y 16 capas de atención completa. Las proyecciones MLP son NVFP4 en todas las capas, mientras que las proyecciones q/k/v/o de las 16 capas de atención completa se almacenan en FP8. En el caso de las capas GDN, 38 de las 48 mantienen sus proyecciones en NVFP4 (W4A4, grupos de 16), mientras que las 10 restantes (capas 0, 1, 2, 4, 5, 57, 58, 60, 61, 62) conservan FP8. Esta distribución procede del checkpoint QAD de NVIDIA y difiere de la release NVFP4 previa, que mantenía todas las proyecciones GDN en FP8.

El proceso de conversión es bit-exacto: los códigos FP4 empaquetados y las escalas de bloque E4M3 se conservan sin modificar, y `weight_scale_2` e `input_scale` se mantienen en FP32 como multiplicadores (`nvfp4_mul`), no como divisores redondeados. Las proyecciones FP8 conservan los códigos E4M3 con escala de peso FP32 por tensor y escala de entrada estática (`fp8_e4m3fn_row_f32`). El autor declara haber realizado una comprobación independiente palabra por palabra de cada proyección importada sin encontrar diferencias. El *drafter* MTP toma su proyección de entrada `mtp.fc` y tres normas del checkpoint `nvidia/Qwen3.8-27B-NVFP4` (revisión `482ca0f3`), ya que el checkpoint QAD las omite. El *drafter* DFlash2 se copia byte a byte de una conversión anterior del autor, y la cabeza de propuestas agrupa 131.072 filas de la cabeza de salida en Q4 con tabla de tokens INT32.

## Capacidades

- Generación de texto conversacional multi-turno con contexto nativo de 262.144 tokens.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión incluida en el artefacto.
- Razonamiento multi-paso con modo *thinking* preservable (`--preserve-thinking` en el motor).
- Decodificación especulativa con dos *drafters* independientes (MTP y DFlash2) y una cabeza de propuestas indexada de 131.072 filas para `--lm-head-draft`.
- Borrador por n-gramas (`--ngram-draft-tokens auto`) como complemento a la decodificación especulativa.
- Cuantización de KV cache a INT8 (`--kv-dtype int8`).
- Concurrencia de peticiones configurable (`--max-concurrency`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- **Inferencia multimodal en una sola GPU de consumo**: el artefacto está dimensionado para ocupar 17,0 GiB de VRAM (19,4 GiB con DFlash2 y la cabeza de propuestas) en una RTX 5090 de 32 GB, lo que permite ejecutar un modelo de 27B con visión en hardware no profesional. Se usaría con `infernix-serve.exe` y el flag `--max-context auto`.
- **Prototipado de aplicaciones con contexto largo**: los 262.144 tokens nativos permiten procesar documentos extensos, repositorios de código o transcripciones largas en una sola pasada. El flag `--prefill-chunk 4096` controla el tamaño de los bloques de prefill para gestionar el consumo de memoria.
- **Evaluación de decodificación especulativa**: al incluir dos *drafters* (MTP y DFlash2), una cabeza de propuestas y borrado por n-gramas, el artefacto sirve para medir el impacto de distintas estrategias de *speculative decoding* sobre la latencia en un modelo multimodal de 27B. El autor reporta que esta versión decodifica más rápido que sus conversiones anteriores, aunque no publica cifras.
- **Estudio de precisión de activaciones**: las opciones `--a16-activations` y `--a8-activations` permiten comparar el efecto de distintas precisiones de activación (16 bits en todo, 8 bits en todas las proyecciones, o el valor por defecto W4A4/W8A8) sobre la perplejidad y la velocidad. El autor indica que estas dos opciones leen los prompts aproximadamente 4x y 5x más lentas que el modo por defecto.
- **Servicio conversacional con concurrencia limitada**: con `--max-concurrency 2` y KV cache en INT8, el artefacto puede atender un par de sesiones simultáneas en una única GPU, adecuado para demos internas o entornos de desarrollo más que para producción a escala.
- **Reproducción de un pipeline de cuantización NVFP4**: el fichero `.infernix.conversion.json` documenta el informe por tensor del conversor, lo que permite auditar cómo se ha mapeado cada proyección del checkpoint original y reutilizar la receta en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona de forma cualitativa que este artefacto obtuvo una perplejidad menor que la variante NInferV3 y que una conversión NVIDIA anterior del mismo autor, y que decodifica más rápido, sin aportar cifras concretas.

## Requisitos de hardware

- **VRAM estimada**: 17,0 GiB para los pesos; 19,4 GiB con el *drafter* DFlash2 y la cabeza de propuestas. El contexto y la KV cache añaden consumo adicional según `--max-context` y `--kv-dtype`.
- **GPU requeridas**: NVIDIA RTX 50-series (arquitectura Blackwell). El autor indica que está construido y ajustado en una RTX 5090 de 32 GB. No se garantiza funcionamiento en generaciones anteriores.
- **Compatibilidad con GPU de consumo**: sí, en RTX 5090 (32 GB). No se especifica compatibilidad con modelos inferiores de la familia 50-series.
- **Motor de inferencia**: Infernix, compilado desde GitHub `main` en el commit `3ad591aa` o posterior, o una release de Windows posterior a `windows-2026.11.18`. Versiones anteriores rechazan cargar el artefacto porque no reconocen los pesos `nvfp4_mul`.
- **Opciones de despliegue**: `infernix-serve.exe` con los flags documentados (`--max-context auto`, `--max-concurrency 2`, `--spec dflash2`, `--draft-tokens auto`, `--lm-head-draft`, `--ngram-draft-tokens auto`, `--kv-dtype int8`, `--preserve-thinking`, `--prefill-chunk 4096`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. Solo se indica de forma relativa que las opciones `--a16-activations` y `--a8-activations` hacen el prefill aproximadamente 4x y 5x más lento que el modo por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact (este) | 27B (aprox.) | 262.144 | NVFP4 + FP8, bit-exacto | NVIDIA Open Model License | Artefacto `.infernix`, requiere motor Infernix |
| nvidia/Qwen3.8-27B-NVFP4-QAD | 27B (aprox.) | 262.144 | NVFP4 + FP8 (checkpoint original) | NVIDIA Open Model License | Hugging Face, revisión `8158ac56` |
| Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3 | 27B (aprox.) | 262.144 | NVFP4 + FP8 con escalas redondeadas a formato NInfer, cabeza Q8, embedding FP8 | NVIDIA Open Model License | Formato NInfer (también ejecutable en Infernix) |
| Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | 27B (aprox.) | 262.144 | NVFP4 + FP8 con todas las proyecciones GDN en FP8 | NVIDIA Open Model License | Formato NInfer, basado en una revisión anterior del checkpoint NVFP4 |

## Limitaciones y advertencias

- **Artefacto de hobby**: el propio autor advierte que el artefacto, la receta de conversión, el motor y buena parte de la model card se hicieron con IA (mayoritariamente Claude Opus 5.5) y que es probable que no sea completo ni del todo exacto.
- **Dependencia estricta del motor**: requiere Infernix en el commit `3ad591aa` o posterior. Versiones anteriores rechazan cargar el fichero. No es portable a vLLM, llama.cpp, Ollama u otros motores.
- **Hardware restringido**: solo se ha validado en RTX 5090 (Blackwell). No hay información sobre funcionamiento en otras GPU, incluidas las de generaciones anteriores o las de centro de datos.
- **Sin benchmarks publicados**: no hay métricas de MMLU, HumanEval, GSM8K ni similares. La única comparación es cualitativa (perplejidad menor y decodificación más rápida que variantes previas).
- **Idiomas no documentados**: la model card no enumera los idiomas soportados, lo que impide evaluar el rendimiento multilingüe.
- **Riesgo de alucinación**: no cuantificado en la información disponible. Como todo modelo generativo, es susceptible de alucinar, especialmente en tareas de razonamiento o factualidad.
- **Sesgos**: no documentados en la información proporcionada.
- **Licencia**: NVIDIA Open Model License, etiquetada como `other` en el Hub. Conviene revisar los términos exactos antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- **Concurrencia limitada**: la configuración de ejemplo usa `--max-concurrency 2`, lo que sugiere que el artefacto no está pensado para servir muchas peticiones simultáneas en una sola GPU.
- **Precisión de activaciones**: el modo por defecto usa activaciones de 4 bits en las capas NVFP4 y 8 bits estáticas en las FP8 durante el prefill, lo que puede afectar a la calidad en comparación con el modelo en BF16. Las opciones de mayor precisión son entre 4x y 5x más lentas en prefill.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact
- Modelo base (checkpoint NVIDIA QAD): https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Checkpoint NVIDIA NVFP4 (fuente del `mtp.fc` y normas): https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Variante NInfer del mismo checkpoint: https://huggingface.co/Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3
- Conversión NVIDIA NVFP4 anterior del autor: https://huggingface.co/Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Motor Infernix (GitHub): https://github.com/Wallawalla47/Infernix
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
