# TheSanchezian/Ternary-Bonsai-2-27B-int2-ov

## Resumen

Ternary Bonsai 2 27B int2-ov es una conversión no oficial a OpenVINO del modelo Ternary Bonsai 2 27B de PrismML, que a su vez es una versión ternaria (2 bits) de Qwen3.8 27B. El autor de la conversión es TheSanchezian, y el objetivo es habilitar la inferencia de un modelo de 27.000 millones de parámetros en GPUs Intel Arc de consumo mediante pesos INT2 simétricos con grupo de tamaño 128, sin re-cuantización: los pesos ternarios originales de PrismML (formato `PQ2_0`, valor = código − 1, una escala fp16 por cada 128 pesos) se almacenan directamente como pesos u2 de OpenVINO.

La relevancia de esta ficha radica en la optimización de rendimiento: la versión v2 ("Arc build") alcanza ~29 tok/s en una única Intel Arc A770 de 16 GB, frente a los ~16,9 tok/s de la v1, con un pico de memoria GPU de 9,4 GB. Para ello se sustituyen operadores estándar de OpenVINO por operadores GPU personalizados fusionados (RMSNorm + block Hadamard, gates, preparación de GDN, normalización de salida de GDN) y un kernel propio de matrix-vector para u2, y se requiere un plugin GPU parcheado que se distribuye en el propio repositorio.

El modelo es multimodal (image-text-to-text), soporta modo thinking y usa el formato de chat de Qwen3.8. La arquitectura combina 16 capas de atención completa con 48 capas de atención lineal (estado de tamaño fijo), lo que explica que el rendimiento de escritura se mantenga en ~20-22 tok/s incluso con contextos largos, mientras que la lectura escala con el tamaño del KV cache de las capas de atención completa. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas de atención lineal (GDN); pesos ternarios INT2 simétricos, grupo 128, escala fp16 |
| Parámetros totales | 27B (heredados de Qwen3.8 27B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (probado con éxito hasta 16k tokens en test de aguja) |
| Tipos de cuantización | INT2 simétrico (u2, group size 128); pesos ternarios originales `PQ2_0` sin re-cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (u2); repositorio de 15,6 GB con carpetas `v2-arc/` (~8,7 GB) y `v1-portable/` (~8,2 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8 27B, un transformer multimodal (image-text-to-text) del que no se detallan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF/DPO. Sobre él, PrismML aplicó una cuantización ternaria (`PQ2_0`: códigos de 2 bits con valor = código − 1 y una escala fp16 por cada 128 pesos), y TheSanchezian realizó la conversión a OpenVINO almacenando esos pesos directamente como u2 con el layout que NNCF usa para `INT2_SYM` con group size 128, sin re-cuantización.

La innovación técnica de la v2 no está en los pesos (que son idénticos y sin pérdida respecto a la v1) sino en el grafo y los kernels: operadores GPU personalizados fusionados (RMSNorm + block Hadamard, gates, preparación de GDN, normalización de salida de GDN) y un kernel propio de matrix-vector para u2 que procesa grupos completos de 128 por subgroup con el zero point aplicado una vez por grupo. La arquitectura híbrida de atención (16 capas completas + 48 lineales con estado de tamaño fijo) es la que permite que la escritura se mantenga estable en contextos largos. El modelo soporta modo thinking mediante el formato de chat de Qwen3.8 (`<think>\n\n</think>\n\n` lo desactiva, `<think>\n` lo activa).

## Capacidades

- Generación de texto y razonamiento, incluyendo modo thinking para problemas de matemáticas y lógica (verificado con una respuesta correcta tras ~5.000 tokens de thinking).
- Comprensión de imágenes (pipeline image-text-to-text): descripción de formas, colores, posiciones y lectura de texto exacto en imágenes.
- Generación de código, verificada en el smoke test con un problema de Python con tests.
- Conocimiento factual e histórico (pregunta sobre la caída del Muro de Berlín respondida correctamente).
- Capacidad de recuperación en contexto largo (test de aguja con un hecho oculto a mitad de documento, encontrado hasta 16k tokens).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo Intel Arc: el modelo cabe en una Arc A770 de 16 GB con un pico de 9,4 GB de VRAM, lo que permite desplegar un modelo de 27B en hardware de gama media sin servidor dedicado.
- Asistentes con razonamiento profundo: el modo thinking permite resolver problemas de matemáticas y lógica con cadenas de razonamiento de miles de tokens (~5.000 tokens de thinking para un problema matemático, a 28,3 tok/s de media).
- Procesamiento de documentos largos: el test de aguja confirma recuperación de información hasta 16k tokens, adecuado para resumen y extracción sobre informes o contratos extensos.
- Análisis de imágenes en local: el pipeline image-text-to-text permite describir imágenes y extraer texto (OCR) sin enviar datos a la nube, con una prueba de imagen resuelta en 10,0 s.
- Generación de código asistida: el modelo produce código Python con tests, integrable en flujos de desarrollo que requieran privacidad de datos.
- Prototipado e investigación en cuantización extrema: al mantener pesos ternarios sin pérdida y ofrecer kernels personalizados, sirve como banco de pruebas para estudiar el rendimiento de INT2 en GPUs Intel.
- Despliegue de bajo consumo energético en estaciones de trabajo Windows con una sola GPU Arc, usando el runtime incluido (`run_bonsai.py`).

## Benchmarks y rendimiento

Datos medidos por el autor en Intel Arc A770 16 GB, Windows, GPU sola, greedy, batch 1, thinking desactivado salvo indicación:

| Métrica | Valor |
|---|---|
| Velocidad de decodificación (v2) | 29,3 tok/s (34,2 ms/token; media de 3 ejecuciones, respuestas de 120 tokens, rango 28,7–29,6) |
| Velocidad de decodificación (v1) | ~16,9 tok/s |
| Decodificación con kernels propios desactivados | 26,2 tok/s (38,2 ms) |
| Primer token (prompt corto) | 0,27 s (primera petición tras carga: ~4 s) |
| Carga + compilación | 25–28 s |
| Memoria GPU pico | 9,4 GB |
| Respuesta de 537 tokens | 29,2 tok/s |
| Thinking largo (matemáticas) | respuesta correcta tras ~5,0k tokens de thinking; 6,3k tokens totales en 224 s (28,3 tok/s media); primer token 5,4 s |
| Test de imagen | correcto (formas, colores, posiciones y texto exacto) en 10,0 s |
| Smoke test de 5 preguntas | 5/5 correctas |

Test de aguja (hecho oculto a mitad de documento, thinking desactivado):

| Prompt | Lectura (primer token) | Velocidad de lectura | Velocidad de escritura | Hecho encontrado |
|---|---|---|---|---|
| 2k tokens | 10,6 s | 193 tok/s | 20,4 tok/s | Sí |
| 4k tokens | 15,3 s | 265 tok/s | 21,9 tok/s | Sí |
| 8k tokens | 30,4 s | 264 tok/s | 21,4 tok/s | Sí |
| 16k tokens | 61,5 s | 261 tok/s | 20,1 tok/s | Sí |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9,4 GB de pico en GPU para la v2 (modelo de ~8,7 GB más runtime); la v1 ocupa ~8,2 GB.
- GPU recomendada: Intel Arc A770 16 GB (único hardware probado). Otras GPUs, Linux y CPU no están probados según el autor.
- Cabe en GPU de consumo: sí, en Intel Arc A770 16 GB; no hay datos para otras GPUs de consumo.
- Software imprescindible: build de OpenVINO del PR #38837 (CI `2026.4.1-63022`, con kernels u2 GPU funcionales) junto con OpenVINO GenAI 2026.4.1 y openvino-tokenizers 2026.4.1; el plugin GPU parcheado `openvino_intel_gpu_plugin.dll` (incluido en `v2-arc/plugin/`) debe copiarse sobre el original en `site-packages/openvino/libs/`. Sin el parche, el modelo no carga.
- Dependencias Python: `numpy`, `pillow`.
- Opciones de despliegue: OpenVINO GenAI `VLMPipeline` con los operadores personalizados registrados (`bonsai_customops`); script `run_bonsai.py` incluido. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 29,3 tok/s de decodificación y 0,27 s hasta el primer token en prompt corto; en contexto largo, lectura a 261–265 tok/s y escritura a ~20–22 tok/s.
- Interruptores de entorno: `OV_GPU_BONSAI_GEMV2=0` (kernel u2 estándar) y `BONSAI_AB_V2=0` (kernel GDN anterior).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B int2-ov (v2) | 27B | no disponible (probado a 16k) | 29,3 tok/s en Arc A770 16 GB | Apache 2.0 | HuggingFace, conversión comunitaria |
| Ternary Bonsai 2 27B int2-ov (v1) | 27B | no disponible | ~16,9 tok/s en Arc A770 16 GB | Apache 2.0 | HuggingFace, misma repo (`v1-portable/`) |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | no disponible | no disponible | HuggingFace (formato GGUF) |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | HuggingFace (modelo base) |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está respaldada por PrismML ni por el equipo de Qwen; el autor la etiqueta explícitamente como "unofficial".
- Hardware muy restringido: solo probada en Intel Arc A770 16 GB bajo Windows; otras GPUs, Linux y CPU no están testeados.
- Requiere un build específico de OpenVINO (PR #38837) y un plugin GPU parcheado; sin el parche el modelo no carga. Esto complica el mantenimiento y la reproducibilidad.
- El parche del plugin solo se distribuye compilado para Windows (`.dll`); la compilación en Linux se ofrece como diff sin probar.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K), sesgos conocidos ni tasas de alucinación.
- La cuantización ternaria INT2 implica una pérdida de precisión respecto al modelo Qwen3.8 27B original, aunque el autor afirme que la conversión de pesos es sin pérdida respecto a los pesos ternarios de PrismML.
- El rendimiento en contexto largo degrada la velocidad de escritura (~20 tok/s) y el tiempo hasta el primer token crece con el tamaño del prompt (61,5 s para 16k tokens).
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8 27B y de los pesos ternarios de PrismML antes de un despliegue en producción.
- El repositorio completo ocupa 15,6 GB; debe descargarse una sola carpeta (`v2-arc/` o `v1-portable/`).

## Enlaces

- HuggingFace: https://huggingface.co/TheSanchezian/Ternary-Bonsai-2-27B-int2-ov
- Modelo ternario base (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo original Qwen3.8 27B: https://huggingface.co/Qwen/Qwen3.8-27B
- OpenVINO PR #38837 (build necesario): no disponible como URL directa en la información proporcionada
