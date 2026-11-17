# wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Infernix

## Resumen

Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Infernix es un artefacto de inferencia empaquetado por el usuario wallawalla47 a partir del checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4-QAD` (revision `a874339c`), una destilación con conciencia de cuantización (QAD) de Qwen3.8-Flash-Next publicada por NVIDIA. El paquete está pensado para el motor Infernix, un runtime C++/CUDA desarrollado por el mismo autor, y su objetivo es ejecutar un modelo MoE multimodal de gran tamaño en una única GPU de consumo RTX 5090 con 32 GB de VRAM.

El modelo subyacente es un transformer MoE de 48 capas con 512 expertos enrutados por capa (top 10), un experto compartido en NVFP4 por capa, un drafter MTP, visión y una tabla PLE de n-gramas en FP8. En total, 24.576 expertos enrutados que ocupan 63,3 GiB y se reparten entre una caché en VRAM (expertos calientes) y RAM del host fijada (el resto), con cómputo parcial en CPU de los fallos de caché por capa. La tabla n-gram de 52 GB se lee desde un NVMe.

La conversión es bit-exacta respecto al checkpoint de NVIDIA: los expertos NVFP4, las proyecciones MXFP8, los pesos BF16 y la tabla n-gram FP8 se conservan tal cual los almacena el checkpoint, y los expertos se ejecutan con la aritmética de 4 bits de NVIDIA. El artefacto es relevante porque demuestra una ruta práctica para servir un MoE multimodal de gran escala en hardware de consumo, a costa de requerir un motor específico, un volumen n-gram externo y una configuración de almacenamiento concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con 48 capas, 512 expertos enrutados por capa (top 10), experto compartido NVFP4 por capa, drafter MTP y visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top 10 de 512 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y compartidos), MXFP8 (proyecciones GDN, atención e indexer; indexer congelado), BF16 (mezcladores de hiperconexión, proyecciones PLE, mezclador final y `lm_head`), FP8 (tabla n-gram PLE) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (con aviso de atribución y Qwen Community License 1.0 incluidos en el repo) |
| Formato de pesos | `.infernix` propietario, dividido en 3 partes (32 GB + 32 GB + 13,7 GB) |

## Arquitectura y entrenamiento

El checkpoint base es una destilación con conciencia de cuantización realizada por NVIDIA a partir de un profesor BF16 congelado, con 100 actualizaciones de optimizador según la model card de NVIDIA. Respecto a la release NVFP4 sin QAD, esta versión cuantiza también los expertos compartidos (a NVFP4) y las proyecciones GDN, de atención e indexer (a MXFP8), mientras que la tabla n-gram PLE, el drafter MTP, la visión, los routers y el `lm_head` se mantienen congelados desde la release NVFP4. NVIDIA validó el checkpoint en GB300 con vLLM y MTP desactivado, y no reporta una ganancia de precisión estadísticamente establecida sobre la misma receta sin QAD.

El empaquetado para Infernix es una conversión bit-exacta: no se recuantiza nada, solo se reorganiza el almacenamiento. La innovación operativa está en el motor: los 24.576 expertos enrutados (63,3 GiB) se dividen entre una caché en VRAM para los expertos calientes y RAM del host fijada para el resto, y la CPU calcula parte de los fallos de cada capa. El experto compartido NVFP4 se ejecuta como un registro de experto más por capa, residente en VRAM, usando la aritmética de 4 bits y las escalas de activación de los expertos enrutados. El drafter MTP solo afecta a la velocidad: el modelo completo verifica cada borrador. Existe además un drafter externo opcional DFlash2 (776 MB) de Inco AI para decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas (capacidades heredadas del modelo base Qwen3.8-Flash-Next; sin benchmarks publicados en la información disponible).
- Generación de código (no se detalla soporte específico de tool calling en la información proporcionada).
- Procesamiento multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` y el checkpoint incluye torre de visión.
- Decodificación especulativa mediante drafter MTP integrado y, opcionalmente, drafter externo DFlash2.
- Recuperación léxica mediante tabla PLE de n-gramas en FP8 (52 GB, volumen externo obligatorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE multimodal de gran escala en una sola RTX 5090: el artefacto está diseñado explícitamente para ejecutarse en 32 GB de VRAM con caché de expertos en VRAM y RAM del host, lo que permite probar un modelo de este tamaño sin clúster.
- Investigación en cuantización y destilación QAD: al ser una conversión bit-exacta del checkpoint de NVIDIA, sirve para reproducir y auditar el comportamiento de la receta NVFP4-QAD frente a la NVFP4 estándar, con el informe de conversión por objeto incluido en el repo.
- Evaluación de decodificación especulativa: permite medir el efecto del drafter MTP y del drafter DFlash2 en throughput real, ya que la model card reporta cifras de velocidad (≈250 tok/s en este artefacto).
- Prototipado de asistentes multimodales en hardware de consumo: el pipeline `image-text-to-text` permite experimentar con entradas de imagen y texto en un entorno local con una sola GPU.
- Benchmarking de motores de inferencia alternativos: útil para comparar Infernix frente a vLLM/TGI en configuraciones de expertos fuera de VRAM, dado que NVIDIA validó el checkpoint original en GB300 con vLLM.
- Pruebas de pipelines con memoria jerárquica: el diseño VRAM + RAM fijada + NVMe para la tabla n-gram es un caso de estudio para arquitecturas de serving con offload de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta métricas de calidad y velocidad del propio artefacto frente a su variante Dense8:

| Metrica | Este artefacto | Variante Dense8 |
|---|---|---|
| Perplejidad | 3,4422 | 3,4385 |
| Throughput (tok/s), ejecución 1 | 249,4 | 254,0 |
| Throughput (tok/s), ejecución 2 | 250,8 | 269,4 |

NVIDIA no reporta una ganancia de precisión estadísticamente establecida del QAD sobre la misma receta sin QAD, y no evaluó MTP sobre estos pesos.

## Requisitos de hardware

- VRAM: 32 GB (GPU única RTX 5090). Los 63,3 GiB de expertos enrutados no caben en VRAM y se reparten entre caché en VRAM y RAM del host fijada.
- RAM del host: debe alojar los expertos no residentes en VRAM (parte de los 63,3 GiB) en memoria fijada (pinned).
- Almacenamiento: NVMe obligatorio para el volumen n-gram PLE de 52 GB en FP8, que no está incluido en el repositorio.
- GPU recomendadas: RTX 5090 (32 GB, arquitectura Blackwell) es el objetivo declarado. No se documentan otras GPU compatibles.
- GPU de consumo: sí, en RTX 5090. No hay información sobre compatibilidad con otras GPU de consumo.
- Despliegue: exclusivamente mediante el motor Infernix (C++/CUDA), compilado desde GitHub `main` en el commit `eac2b3d8` o posterior. No hay release de Windows que lo ejecute y las builds anteriores se niegan a cargarlo. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: aproximadamente 249-251 tok/s en las dos ejecuciones reportadas.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor |
|---|---|---|---|---|---|
| Este artefacto (Qwen3.8-Flash-Next NVFP4-QAD-Infernix) | no disponible (MoE 512 expertos/capa, top 10) | no disponible | NVFP4 + MXFP8 + BF16 + FP8 | NVIDIA Open Model License | Infernix |
| nvidia/Qwen3.8-Flash-Next-NVFP4-QAD | no disponible | no disponible | NVFP4 + BF16 | NVIDIA Open Model License | vLLM (validado en GB300) |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 (expertos enrutados) + BF16 | NVIDIA Open Model License | vLLM |
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix | no disponible | no disponible | NVFP4 + MXFP8 + 8 bits en clases BF16 | NVIDIA Open Model License | Infernix |

La diferencia principal entre las variantes es el formato de las clases que el checkpoint original guarda en BF16 (mezcladores de hiperconexión, proyecciones PLE, mezclador final y `lm_head`): este artefacto las conserva en BF16 para ser bit-exacto, mientras que Dense8 las pasa a 8 bits con una pérdida de perplejidad de 0,0037 y una ganancia de velocidad del 1,8 % y 7,4 % en dos ejecuciones.

## Limitaciones y advertencias

- El autor declara explícitamente que el artefacto, la receta de conversión, el motor y buena parte de la model card fueron generados con IA (mayoritariamente Claude Opus 5.5), y que es trabajo de aficionado probablemente incompleto o inexacto.
- Requiere un volumen n-gram PLE externo de 52 GB que no está en el repositorio; sin él el modelo no es funcional según la model card.
- Dependencia de una versión concreta del motor Infernix (commit `eac2b3d8` o posterior); no hay release para Windows y las builds antiguas rechazan la carga.
- No es compatible con los runners estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita la portabilidad y el soporte.
- La licencia NVIDIA Open Model License impone condiciones de uso; el repo incluye además la Qwen Community License 1.0. Es necesario revisar ambas antes de un uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide planificar despliegues multilingües o con contexto largo.
- NVIDIA no reporta ganancia de precisión del QAD sobre la receta sin QAD, y no evaluó MTP sobre estos pesos; el rendimiento del drafter en este artefacto concreto no está validado por el fabricante.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Infernix
- Checkpoint base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4-QAD
- Release NVFP4 sin QAD: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Variante Dense8: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix
- Volumen n-gram PLE: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix.ngram
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Drafter DFlash2 para Infernix: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-DFlash2-Infernix
- Drafter DFlash2 original de Inco AI: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
