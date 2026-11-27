# wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix

## Resumen

Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix es una conversión del checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4-QAD` (revisión `a874339c`), una destilación con concienciación de cuantización (QAD) del modelo Qwen3.8-Flash-Next, empaquetada por el usuario wallawalla47 para el motor de inferencia Infernix. Se trata de un artefacto de terceros, no oficial, orientado a ejecutar un modelo de mezcla de expertos (MoE) multimodal de gran tamaño en una única GPU de consumo RTX 5090 con 32 GB de VRAM.

El modelo subyacente es un transformer MoE de 48 capas con 512 expertos enrutados por capa (top 10), un experto compartido en NVFP4 por capa, un borrador MTP (multi-token prediction) y una torre de visión. La receta QAD de NVIDIA cuantiza más componentes que su release NVFP4 original: expertos compartidos en NVFP4 y proyecciones GDN, atención e indexador en MXFP8, mientras que la tabla n-gram de PLE, el borrador MTP, la visión, los routers y el `lm_head` se mantienen congelados desde el release NVFP4.

La relevancia de esta ficha radica en que documenta un caso extremo de optimización de despliegue: los 24.576 expertos enrutados (63,3 GiB) se reparten entre una caché en VRAM (los calientes) y RAM del host fijada (el resto), con la CPU calculando parte de los fallos de cada capa, y una tabla n-gram de 52 GB leída desde un NVMe. El resultado, según el autor, es una decodificación de aproximadamente 254-269 tok/s, con una perplejidad de 3,4385. Es un artefacto de hobby, con advertencias explícitas del autor sobre su completitud y exactitud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 48 capas, 512 expertos enrutados por capa (top 10), experto compartido NVFP4 por capa, MTP drafter y torre de visión |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (top 10 de 512 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (expertos enrutados y compartidos), MXFP8 (proyecciones GDN, atención e indexador), 8 bits (clases que el checkpoint guarda en BF16: mezcladores de hiperconexión, proyecciones PLE, mezclador final y `lm_head`), FP8 (tabla n-gram PLE) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (con Qwen Community License 1.0 en el NOTICE) |
| Formato de pesos | `.infernix` (3 partes: 32 GB + 32 GB + 12,54 GB; total del repo 76,5 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 48 capas con 512 expertos enrutados por capa y selección top 10, más un experto compartido por capa. Incorpora un borrador MTP para decodificación especulativa y una torre de visión, lo que lo convierte en un modelo multimodal image-text-to-text. Según la model card de NVIDIA citada, el checkpoint QAD proviene de 100 actualizaciones de optimizador de destilación con concienciación de cuantización desde un profesor BF16 congelado. La receta QAD cuantiza los expertos compartidos a NVFP4 (entrenados por QAD) y las proyecciones GDN, atención e indexador a MXFP8 (con el indexador congelado), mientras que la tabla n-gram PLE, el borrador MTP, la visión, los routers y el `lm_head` se mantienen congelados desde el release NVFP4.

La conversión de wallawalla47 ("Dense8") preserva bit-exactos los expertos NVFP4, las proyecciones MXFP8 y la tabla n-gram FP8 de NVIDIA, y almacena en 8 bits las clases que el checkpoint guarda en BF16 (mezcladores de hiperconexión, proyecciones PLE, mezclador final y `lm_head`). El motor Infernix ejecuta el experto compartido NVFP4 como un registro de experto más por capa, mantenido en VRAM, con la aritmética de 4 bits de los expertos enrutados y sus propias escalas de activación. NVIDIA validó el checkpoint en GB300 con vLLM y MTP desactivado, y no reporta una ganancia de precisión estadísticamente establecida sobre la misma receta sin QAD, ni evaluó MTP sobre estos pesos.

## Capacidades

- Generación de texto conversacional y razonamiento, heredadas del modelo Qwen3.8-Flash-Next subyacente.
- Procesamiento multimodal image-text-to-text: la torre de visión se mantiene congelada desde el release NVFP4.
- Decodificación especulativa mediante el borrador MTP: en Infernix, el drafting solo cambia la velocidad, ya que el modelo completo verifica cada borrador.
- Predicción con tablas n-gram PLE (52 GB) para acelerar la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE multimodal de gran tamaño en una única GPU de consumo: el artefacto está empaquetado específicamente para ejecutarse en una RTX 5090 de 32 GB, repartiendo los 24.576 expertos enrutados entre caché de VRAM y RAM del host fijada, lo que permite probar modelos de esta escala sin clústeres multi-GPU.
- Investigación en estrategias de offloading de expertos: el reparto entre VRAM (expertos calientes), RAM fijada (expertos fríos) y cálculo parcial en CPU de los fallos de cada capa sirve como banco de pruebas para estudiar políticas de caché y su impacto en latencia y throughput.
- Evaluación de decodificación especulativa con MTP: el borrador MTP integrado permite medir la ganancia de velocidad frente a la verificación completa del modelo, útil para investigar el equilibrio entre drafting y verificación en modelos MoE.
- Estudio de cuantización QAD en producción: al preservar bit-exactos los expertos NVFP4, las proyecciones MXFP8 y la tabla n-gram FP8, el artefacto permite comparar recetas de cuantización (QAD frente a NVFP4 estándar) sobre el mismo modelo base.
- Benchmarking de motores de inferencia C++/CUDA: el motor Infernix, con su gestión de volúmenes n-gram en NVMe y su caché de expertos, puede compararse frente a vLLM u otros motores en términos de tok/s y perplejidad sobre el mismo checkpoint.
- Experimentación multimodal con visión en hardware de consumo: la torre de visión congelada permite probar tareas image-text-to-text en una RTX 5090, siempre que se acepten las limitaciones de un artefacto de hobby.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Métrica | Este artefacto (Dense8) | Alternativa bit-exacta (Infernix) |
|---|---|---|
| Perplejidad | 3,4385 | 3,4422 |
| Decodificación (tok/s), ejecución 1 | 254,0 | 249,4 |
| Decodificación (tok/s), ejecución 2 | 269,4 | 250,8 |
| Diferencia de velocidad | referencia | 1,8 % y 7,4 % más lento |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. NVIDIA reporta que no hay una ganancia de precisión de tareas estadísticamente establecida sobre la misma receta sin QAD, y no evaluó MTP sobre estos pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: 32 GB (RTX 5090). Los 24.576 expertos enrutados (63,3 GiB) se reparten entre caché de VRAM y RAM del host fijada; el resto de componentes se mantiene en VRAM.
- GPU recomendadas: NVIDIA RTX 5090 (Blackwell) de 32 GB, según el diseño del artefacto. NVIDIA validó el checkpoint base en GB300 con vLLM.
- ¿Cabe en GPU de consumo? Sí, en una RTX 5090 de 32 GB, con el esquema de offloading descrito.
- Almacenamiento: se requiere un volumen n-gram PLE de 52 GB (FP8) en un NVMe, descargable desde `Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix` y pasado con `--ngram-volume`. El repositorio del modelo no incluye dicho volumen.
- Motor de despliegue: Infernix (C++/CUDA) compilado desde GitHub `main` en el commit `eac2b3d8` o posterior, o una release de Windows posterior a `windows-2026.11.07`. Versiones anteriores fallan al cargar con el error "missing logical parameter text/layers/0/moe/shared/gate".
- Latencia y throughput estimados: 254,0 y 269,4 tok/s en dos ejecuciones según el autor.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato `.infernix`; el checkpoint base QAD de NVIDIA se validó con vLLM en GB300.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix (este) | no disponible | no disponible | NVFP4 + MXFP8 + 8 bits + FP8 n-gram | NVIDIA Open Model License | Hugging Face, formato `.infernix`, motor Infernix |
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Infernix (bit-exacto) | no disponible | no disponible | NVFP4 + MXFP8 + FP8 n-gram, sin recuantizar BF16 | NVIDIA Open Model License | Hugging Face, formato `.infernix`, motor Infernix |
| nvidia/Qwen3.8-Flash-Next-NVFP4-QAD (base) | no disponible | no disponible | NVFP4 + MXFP8 + FP8 n-gram | NVIDIA Open Model License | Hugging Face, validado con vLLM en GB300 |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 (expertos compartidos en BF16, proyecciones en BF16) | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de parámetros, contexto ni benchmarks de tareas para establecer una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Artefacto de hobby: el propio autor advierte que el artefacto, la receta de conversión, el motor y la mayor parte de la model card se hicieron con IA (principalmente Claude Opus 5.5), y que es probable que no esté completo ni sea del todo exacto.
- Dependencia externa: requiere un volumen n-gram PLE de 52 GB que no está en el repositorio; sin él, el modelo no funciona según lo previsto.
- Dependencia de versión del motor: necesita Infernix desde `main` en `eac2b3d8` o posterior, o una release de Windows posterior a `windows-2026.11.07`; versiones anteriores rechazan la carga.
- Sin benchmarks de tareas: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares en la información disponible; la única métrica reportada es perplejidad y tok/s.
- Sin evaluación de MTP por parte de NVIDIA: el borrador MTP no fue evaluado sobre estos pesos por NVIDIA; en Infernix solo afecta a la velocidad, ya que el modelo completo verifica cada borrador.
- Sin ganancia de precisión QAD demostrada: NVIDIA no reporta una ganancia de precisión de tareas estadísticamente establecida sobre la misma receta sin QAD.
- Idiomas soportados no disponibles: no se puede confirmar el soporte multilingüe ni el rendimiento por idioma.
- Sesgos y alucinación: no disponibles en la información proporcionada; se aplican los riesgos genéricos de los modelos de lenguaje, sin datos específicos.
- Licencia: NVIDIA Open Model License, con la Qwen Community License 1.0 en el NOTICE; deben revisarse las condiciones para uso comercial antes de desplegar en producción.
- Formato propietario: los pesos en `.infernix` no son compatibles con vLLM, llama.cpp, Ollama ni TGI; el ecosistema de despliegue está limitado al motor Infernix.
- Requisito de hardware específico: diseñado para una RTX 5090 de 32 GB; no se documenta su funcionamiento en otras GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4-QAD
- Release NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Alternativa bit-exacta: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Infernix
- Volumen n-gram PLE (52 GB FP8): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix.ngram
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Documento NGRAM-VOLUME.md: incluido en el repositorio del modelo
