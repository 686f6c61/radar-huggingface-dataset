# wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix

## Resumen

`wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix` es un artefacto de conversión, no un modelo entrenado desde cero: empaqueta el checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4` en el formato propietario `.infernix` para poder ejecutarlo con Infernix, un motor de inferencia C++/CUDA de un solo GPU escrito por el mismo autor. El modelo subyacente es un transformer MoE multimodal de 48 capas con 512 expertos enrutados por capa (top-10), una torre de visión y un drafter MTP para decodificación especulativa, lo que suma 24.576 expertos enrutados en total.

La relevancia del artefacto está en el objetivo de despliegue: ejecutar ese MoE en una única RTX 5090 de 32 GB. Para ello, los 63 GiB de expertos residen en RAM del host fijada (pinned), una caché en VRAM mantiene los expertos calientes, la CPU calcula parte de los fallos de cada capa y la tabla de embeddings n-gram PLE (320.001.536 filas, 52,4 GB en FP8) se lee en bloques aleatorios de 4 KiB desde un NVMe. El modelo principal y la torre de visión se declaran bit-exactos respecto al checkpoint de NVIDIA; solo el drafter MTP se recuantiza.

El repositorio ocupa 132,8 GB y se distribuye bajo NVIDIA Open Model License, con aviso de atribución de NVIDIA y Qwen Community License 1.0 incluidos. Es un trabajo de aficionado, generado en gran parte con asistencia de IA según admite el propio autor, y con 161 descargas y 2 likes en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión): 48 capas, 512 expertos enrutados por capa con top-10, drafter MTP y tabla de embeddings n-gram PLE |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (top-10 de 512 expertos por capa) |
| Longitud de contexto | no disponible (las mediciones de rendimiento cubren de 8K a 250K tokens) |
| Tipos de cuantización | NVFP4 en pesos principales y expertos; drafter MTP requantizado; tabla n-gram en FP8 (recomendada), BF16 o IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`license: other`), con NOTICE de atribución de NVIDIA y Qwen Community License 1.0 |
| Formato de pesos | `.infernix` dividido en 3 partes (80.370.610.944 bytes en total) + volumen `.ngram` separado (52.429.058.048 bytes); no se publica en safetensors ni GGUF |
| Tamaño del repositorio | 132,8 GB |
| Modalidad | `image-text-to-text` (entrada de imagen y texto, salida de texto) |
| Motor de inferencia | Infernix (`infernix-serve`), C++/CUDA |
| Metadatos del repo | 161 descargas, 2 likes; creado el 2026-10-08, actualizado el 2026-10-22 |

## Arquitectura y entrenamiento

El artefacto reproduce la arquitectura del checkpoint de NVIDIA sin modificarla: 48 capas con 512 expertos enrutados por capa y enrutamiento top-10, lo que da 24.576 expertos en total y 63 GiB de pesos de expertos. A ello se añade una torre de visión (el pipeline es `image-text-to-text`) y un drafter MTP (multi-token prediction) que propone tokens para que el modelo completo los verifique. La tabla PLE n-gram, con 320.001.536 filas, no va dentro de los ficheros del modelo: es un volumen aparte que se lee en bloques aleatorios de 4 KiB desde NVMe y se pasa con `--ngram-volume`. La model card no documenta si la atención es lineal, híbrida o estándar, ni el detalle del enrutador más allá del top-10.

La conversión es el núcleo técnico del artefacto. Según el autor, el modelo principal y la torre de visión son bit-exactos a NVIDIA («every weight the full model computes with is NVIDIA's, word for word»); solo el drafter MTP, que únicamente propone tokens, se cuantiza adicionalmente. El volumen n-gram FP8 incluido contiene las filas de NVIDIA byte a byte. El repositorio incluye un `conversion.json` de 901.847 bytes con el informe de conversión (fuentes, métodos y formatos por objeto). No hay información sobre datos de preentrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO: el artefacto es una posconversión de un checkpoint ajeno y la model card no describe el entrenamiento original.

## Capacidades

- Generación de texto conversacional: el repo está etiquetado como `conversational` y el pipeline declarado es `image-text-to-text`.
- Entrada multimodal de imagen y texto: incluye torre de visión, declarada bit-exacta respecto al checkpoint de NVIDIA.
- Decodificación especulativa con el drafter MTP propio, activable con `--draft-tokens auto`.
- Decodificación especulativa alternativa con DFlash2 (drafter externo de Inco AI empaquetado para Infernix), que según el autor decodifica un 8-11 % más rápido que el MTP propio y hasta un 26 % en código muestreado.
- Contexto largo en la práctica: las mediciones del autor llegan hasta 250K tokens de contexto sin degradar el throughput por debajo de 108 tok/s.
- Ejecución local en una sola GPU de consumo (RTX 5090, 32 GB) con expertos descargados a RAM del host y tabla n-gram en NVMe.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local de un MoE multimodal en una sola RTX 5090: el caso de uso primario del artefacto. Un único equipo con 32 GB de VRAM, RAM del host suficiente para 63 GiB de expertos y un NVMe para el volumen n-gram sustituye a un nodo multi-GPU para tareas de texto e imagen.
- Procesamiento de documentos largos con imágenes: el modelo acepta entrada image-text-to-text y mantiene rendimiento medido hasta 250K tokens de contexto, útil para analizar informes, contratos o expedientes con figuras y tablas en una sola pasada.
- Servicio de chat interno autoalojado: con 108-131 tok/s de decodificación se pueden atender sesiones conversacionales interactivas sin salida a APIs externas, lo que simplifica el cumplimiento de requisitos de confidencialidad de datos.
- Investigación sobre offloading de expertos: el diseño (expertos en RAM fijada, caché en VRAM, cálculo parcial en CPU, tabla de embeddings en disco) es un banco de pruebas reproducible para estudiar el equilibrio entre ancho de banda de PCIe, VRAM y NVMe en MoE de gran tamaño.
- Evaluación de decodificación especulativa: permite comparar en la misma máquina el drafter MTP nativo, el DFlash2 de 776 MB y la decodificación sin especulación, con cifras de tok/s y latencia del primer token publicadas por el autor.
- Reproducción bit-exacta de resultados: al conservar los pesos de NVIDIA sin cambios en el modelo principal y la visión, sirve para validar pipelines o comparar contra el checkpoint original cuando se exige fidelidad estricta de pesos (a costa de un ~22 % menos de velocidad frente a la variante Dense8).
- Generación de código asistida en local: el autor reporta una ganancia del 26 % con DFlash2 en código muestreado, lo que indica carga de trabajo de generación de código; conviene validar la calidad con benchmarks propios, ya que no se publican resultados de HumanEval ni similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Las únicas cifras cuantitativas son mediciones de perplejidad y de velocidad del propio autor, en una RTX 5090 con la misma máquina y build:

| Artefacto | Perplejidad | Decodificación (8K-250K contexto) | Notas |
|---|---:|---|---|
| Este artefacto (NVFP4, bit-exacto) | 4,666 | 108-131 tok/s | Pesos principales idénticos a NVIDIA |
| `Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix` | 4,654 | 136-160 tok/s | Proyecciones densas y `lm_head` en 8 bits; ~22 % más rápido y primer token hasta un 7 % antes a 8K |
| `Qwen3.8-Flash-Next-Uncensored-NVFP4-Infernix` | 4,772 | similar a Dense8 según el autor | Build abliterado de orcarouter |
| Base de referencia citada («Strata») | 4,844 | no disponible | Citada como referencia de comparación |

Mediciones adicionales de decodificación especulativa: el drafter DFlash2 (776 MB) es un 8-11 % más rápido que el MTP propio con `--draft-tokens auto`, y hasta un 26 % en código muestreado.

## Requisitos de hardware

- VRAM: 32 GB (una RTX 5090) según la configuración validada por el autor. No se publican estimaciones para otras capacidades de VRAM.
- RAM del host: debe alojar los 63 GiB de expertos enrutados en memoria fijada (pinned), más el overhead del motor; el autor no da una cifra mínima exacta.
- Almacenamiento: 132,8 GB de repositorio (80,4 GB de pesos + 52,4 GB de volumen n-gram) más espacio para la copia del volumen en NVMe. El volumen n-gram debe residir en una unidad NVMe por el patrón de lectura aleatoria de 4 KiB.
- GPU recomendadas: RTX 5090 (Blackwell, 32 GB) es la única configuración documentada. A100, H100 y otras GPU no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 5090 con 32 GB, gracias a la combinación de offloading de expertos a RAM, caché en VRAM y tabla n-gram en disco. No hay datos para GPUs de consumo con menos VRAM.
- Opciones de despliegue: exclusivamente Infernix (`infernix-serve`), que acepta la parte 1 de 3 como un GGUF dividido, más `--ngram-volume` y opcionalmente `--spec dflash2 --draft-model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.infernix` es específico de este motor. El drafter DFlash2 requiere una build de Infernix cuyo `--help` liste `--draft-model`.
- Rendimiento: 108-131 tok/s de decodificación entre 8K y 250K tokens de contexto en RTX 5090; latencia del primer token hasta un 7 % mejor a 8K en la variante Dense8 (no se da la cifra absoluta de TTFT para este artefacto).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Este artefacto (NVFP4, bit-exacto) | no disponible | medido hasta 250K | 108-131 tok/s; perplejidad 4,666 | NVIDIA Open Model License | `.infernix` / Infernix |
| `Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix` | no disponible | medido hasta 250K | 136-160 tok/s; perplejidad 4,654; TTFT hasta 7 % mejor a 8K | NVIDIA Open Model License | `.infernix` / Infernix |
| `Qwen3.8-Flash-Next-Uncensored-NVFP4-Infernix` | no disponible | no disponible | perplejidad 4,772; velocidad similar a Dense8 | NVIDIA Open Model License | `.infernix` / Infernix |
| `Qwen3.8-Flash-Next-FP8-Infernix` | no disponible | no disponible | no disponible | NVIDIA Open Model License | `.infernix` / Infernix (volumen n-gram BF16 propio) |
| `Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix` | no disponible | no disponible | no disponible | NVIDIA Open Model License | `.infernix` / Infernix (volumen n-gram IQ4_NL, 4,5 bits por valor) |
| `nvidia/Qwen3.8-Flash-Next-NVFP4` (base) | no disponible | no disponible | no disponible | NVIDIA Open Model License | safetensors / ecosistema NVIDIA |

No se dispone de datos de benchmarks ni de recuento de parámetros para ninguna de las alternativas, por lo que la comparación se limita a velocidad medida, perplejidad, licencia y formato de distribución. Como referencia externa de perplejidad, el autor cita 4,844 para el modelo base («Strata») frente a 4,666 de este artefacto.

## Limitaciones y advertencias

- El autor declara explícitamente que el artefacto, la receta de conversión, el motor y buena parte de la model card se generaron con IA (principalmente Claude Opus 5.5) y que es trabajo de aficionado, probablemente incompleto o parcialmente inexacto. Trátese como experimental.
- Los metadatos del repositorio incluyen `inference: false`, pese a que la model card describe cómo servirlo con Infernix; verifíquese el flujo de carga antes de integrarlo en un pipeline.
- La garantía de bit-exactitud cubre el modelo principal y la torre de visión, no el drafter MTP, que está recuantizado. Si se usa decodificación especulativa, las salidas no proceden al 100 % de pesos idénticos a NVIDIA en ese componente.
- Dependencia fuerte de hardware concreto: RTX 5090, RAM del host para 63 GiB de expertos, NVMe para 52,4 GB de tabla n-gram y una build específica del motor Infernix. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y el escalado horizontal.
- La tabla n-gram es un volumen externo obligatorio; sin ella el modelo no se ejecuta correctamente con el flujo documentado. Debe residir en NVMe, no en HDD ni en almacenamiento de red.
- Riesgo de alucinación: no cuantificado. No se publican evaluaciones de fidelidad, veracidad ni tasas de alucinación para este artefacto.
- Sesgos: no documentados. Al ser una conversión bit-exacta del checkpoint de NVIDIA, hereda los sesgos del modelo original, que la model card no describe.
- Idiomas: no se declara lista de idiomas soportados. No hay garantía documentada de calidad en castellano; requier evaluación propia antes de usarlo en producción en español.
- Contexto: la longitud máxima no se declara formalmente; 250K tokens es el límite superior de las mediciones de rendimiento, no una especificación confirmada.
- Licencia: NVIDIA Open Model License con NOTICE de atribución de NVIDIA y Qwen Community License 1.0 para el modelo subyacente. Es una licencia `other`, no una licencia open source estándar; revise las condiciones de uso comercial y de redistribución antes de desplegarlo en producto.
- Calidad medida solo con perplejidad (4,666), una métrica insuficiente para avalar rendimiento en tareas concretas. No hay datos de MMLU, HumanEval ni GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Variante Dense8 (más rápida): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix
- Variante Uncensored: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-Uncensored-NVFP4-Infernix
- Variante FP8 (volumen n-gram BF16): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix
- Variante GSQ-RCO IQ3_S (volumen n-gram IQ4_NL): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix
- Drafter DFlash2 para Infernix: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-DFlash2-Infernix
- Drafter DFlash2 original de Inco AI: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Motor Infernix (repositorio): https://github.com/Wallawalla47/Infernix
- Model card en GitHub (variante Uncensored): https://github.com/Wallawalla47/Infernix/tree/main/model-cards/Qwen3.8-Flash-Next-Uncensored-NVFP4-Infernix
- Ficha en LLM Explorer: https://llm-explorer.com/model/wallawalla47%2FQwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix,6mOMAOKS0IROnsPLQtl6ln
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Informe de conversión: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix.conversion.json
