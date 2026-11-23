# ThakiCloud/ThakiOCR-KOENJA-G2M-v1

## Resumen

ThakiOCR-KOENJA-G2M-v1 es un reconocedor de líneas de texto (line OCR) de 10,17 millones de parámetros desarrollado por ThakiCloud. Continúa el entrenamiento desde el checkpoint ThakiOCR-KOEN-G2M-R3 y amplía su cabecera de salida compartida de 14.250 a 18.133 caracteres, incorporando 3.883 caracteres japoneses (mayoritariamente kanji, además de kana y puntuación de ancho completo). El modelo lee una línea de texto horizontal ya recortada y devuelve su transcripción; no localiza texto en una página, por lo que debe combinarse con un detector de líneas o un modelo de layout.

La arquitectura es una red neuronal con pérdida CTC y decodificación greedy, entrenada para ejecutarse en CPU en fp32. Soporta coreano, inglés y japonés en una única cabecera de salida, lo que simplifica el despliegue multilingüe frente a mantener un modelo por idioma. Su relevancia actual radica en que demuestra que un modelo de apenas 10 M de parámetros puede alcanzar un CER de 0,87% (tras NFKC) en documentos PDF nativos japoneses modernos, compitiendo estadísticamente con PP-OCRv6 small sin ser superior de forma significativa.

Se publica como *research preview* con entrenamiento congelado y uso en producción explícitamente desaconsejado (NO-GO). La licencia es Apache-2.0 tanto para código como para pesos, lo que facilita su evaluación e integración experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal con pérdida CTC (line OCR, decodificación greedy); detalles de capas no disponibles |
| Parámetros totales | 10.176.694 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una línea de texto por inferencia; imagen de entrada preprocesada a 48 px de alto en gris) |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | coreano (ko), inglés (en), japonés (ja) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (fp32, solo `state_dict`, sin estado del optimizador) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas con pérdida CTC y una cabecera de salida compartida de 18.133 caracteres: los 14.250 caracteres coreano/inglés del checkpoint R3 en su orden original, más 3.883 caracteres tomados de las etiquetas de entrenamiento en japonés. El índice CTC `i` se mapea a `chars[i-1]` en `vocab.json`, con el índice 0 reservado para el token blank. La inferencia usa decodificación greedy sobre imágenes de línea en escala de grises de 48 px de alto.

El entrenamiento parte de ThakiOCR-KOEN-G2M-R3 y añade líneas de japonés moderno. Los datos declarados incluyen `nvidia/OCR-Synthetic-Multilingual-v1` y `llm-jp/JSSODa`. El conjunto de test final son 718 líneas horizontales de 40 PDFs de la Agencia Meteorológica de Japón (JMA), congelado antes del entrenamiento y nunca usado para entrenamiento, desarrollo ni selección de checkpoint. El entrenamiento usó documentos de otros ministerios, por lo que el test proviene de una agencia distinta pero del mismo medio (PDF nativo renderizado a 200 dpi) y época. No se documenta en la información disponible el uso de RLHF o DPO; el entrenamiento es supervisado con CTC.

## Capacidades

- Reconocimiento de texto en líneas horizontales recortadas, devolviendo la transcripción completa de la línea.
- Soporte multilingüe en una única cabecera: coreano, inglés y japonés (kanji, kana y puntuación de ancho completo).
- Ejecución en CPU en fp32, sin necesidad de GPU.
- API de inferencia autocontenida (`inference.py`) que depende solo de torch, numpy, Pillow y safetensors.
- Procesamiento por lotes (`recognize()` con lote por defecto de 128; reproducción verificada con lotes de 64).
- No incluye detección de texto ni análisis de layout: requiere un detector de líneas externo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo OCR especializado).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de imagen-a-texto de línea.

## Casos de uso

- Digitalización de documentos administrativos japoneses: el modelo está evaluado sobre PDFs nativos de la JMA y logra un CER de 0,87% tras NFKC, por lo que es adecuado para extraer texto de publicaciones oficiales renderizadas a 200 dpi, siempre en fase de evaluación y no en producción.
- OCR multilingüe unificado en coreano, inglés y japonés: al compartir una sola cabecera de 18.133 caracteres, permite procesar líneas mezcladas de estos tres idiomas sin enrutar a modelos distintos, reduciendo la complejidad operativa.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU en fp32 con lotes de 64-128 líneas, encaja en pipelines de backoffice donde no hay aceleradores disponibles.
- Extracción de texto de informes técnicos y meteorológicos: útil para convertir boletines y explicaciones de pronóstico numérico en texto estructurado, dado que el test se construyó precisamente sobre ese tipo de documentos.
- Preprocesado para pipelines de NLP posteriores: la transcripción de líneas puede alimentar sistemas de búsqueda, resumen o traducción, combinando este reconocedor con un detector de líneas y un modelo de lenguaje.
- Evaluación comparativa de motores OCR: sirve como referencia ligera (10 M de parámetros) para medir CER frente a PP-OCRv6 u otros reconocedores en conjuntos japoneses, con intervalos de confianza documentados.
- Prototipado de investigación en OCR de bajo coste: su licencia Apache-2.0 y su naturaleza de research preview lo hacen apto para experimentación académica y pruebas de concepto.

## Benchmarks y rendimiento

Conjunto de test: 718 líneas horizontales de 40 PDFs de la JMA. CER calculado como distancia de edición total dividida por caracteres de referencia, tras NFKC y eliminación de espacios; Raw CER usa NFC. Decodificación greedy. Los modelos G2M y PP-OCRv6 se ejecutaron en CPU en fp32; ThakiOCR-JA-v1 en GPU con vLLM. Todas las lecturas usaron la misma imagen de línea en gris de 48 px.

| Modelo | Qué es | CER (NFKC) | Raw CER (NFC) |
|---|---|---|---|
| ThakiOCR-KOENJA-G2M-v1 | esta release | 0,87% | 3,28% |
| control (no publicado) | mismo inicio, pasos y semilla, sin líneas de japonés moderno | 1,11% | 5,09% |
| checkpoint de inicio (no publicado) | checkpoint del que parten ambos entrenamientos | 1,14% | 5,10% |
| PP-OCRv6 small rec (ONNX) | `PaddlePaddle/PP-OCRv6_small_rec_onnx` @ `b8f84f0b` | 0,81% | 3,02% |
| ThakiOCR-JA-v1 | modelo japonés previo basado en VLM | 1,46% | 4,75% |

| Diferencia pareada (CER, NFKC) | Δ | IC 95% | Lectura |
|---|---|---|---|
| esta release − control | −0,24 pp | [−0,36, −0,10] | mejor (test primario preregistrado) |
| esta release − checkpoint de inicio | −0,27 pp | [−0,38, −0,15] | mejor |
| esta release − PP-OCRv6 | +0,06 pp | [−0,17, +0,34] | sin diferencia significativa |

## Requisitos de hardware

- VRAM estimada: no aplica en el modo documentado; el modelo se ejecuta en CPU en fp32 con 10,17 M de parámetros, lo que implica un peso en memoria del orden de decenas de MB (el tamaño del repo figura como 0.0 GB).
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU consumer podría alojarlo, pero no se documentan configuraciones GPU.
- Cabe en GPU consumer: sí, por tamaño, aunque el autor no publica requisitos ni pruebas en GPU.
- Opciones de despliegue: script `inference.py` autocontenido (torch, numpy, Pillow, safetensors) con CLI y API Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La reproducción se validó en CPU sobre 718 líneas con lotes de 64 y con lotes de 128, obteniendo predicciones idénticas, pero sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER (NFKC) en test JMA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiOCR-KOENJA-G2M-v1 | 10,17 M | ko, en, ja | 0,87% | Apache-2.0 | Hugging Face (research preview) |
| PP-OCRv6 small rec | no disponible | multilingüe (no detallado) | 0,81% | no disponible en la información | ONNX publicado |
| ThakiOCR-JA-v1 | no disponible (VLM) | ja | 1,46% | no disponible en la información | Hugging Face |
| ThakiOCR-KOEN-G2M-R3 (base) | no disponible | ko, en | no evaluado en este test | Apache-2.0 (según licencia de la línea) | Hugging Face |

## Limitaciones y advertencias

- Estado de research preview: el entrenamiento de este checkpoint está congelado y el uso en producción es NO-GO según el autor.
- No es significativamente mejor que PP-OCRv6 en el test de 718 líneas; el intervalo de confianza de la diferencia incluye 0 y tampoco se demostró equivalencia.
- Los dígitos de ancho completo (０–９) nunca se emiten en su forma original porque el conjunto de caracteres no los incluye.
- Solo se midió con una semilla y exclusivamente sobre PDFs nativos (born-digital); los documentos escaneados no están probados.
- El test tiene aproximadamente un 3% de ruido residual en las etiquetas, lo que limita la precisión de las conclusiones.
- No detecta texto en una página: requiere un detector de líneas o modelo de layout previo.
- La configuración de evaluación (imagen de 48 px en gris) es la del propio modelo y puede penalizar a competidores como PP-OCRv6 y ThakiOCR-JA-v1, que normalmente reciben el recorte original en color y a mayor tamaño.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo CTC de reconocimiento, el riesgo principal es la sustitución errónea de caracteres, no la generación libre.
- Limitaciones de idioma: aunque declara ko, en y ja, el rendimiento solo se reporta sobre japonés moderno; el comportamiento en coreano e inglés en este checkpoint no se detalla.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el aviso NO-GO del autor debe tenerse en cuenta para producción; el archivo NOTICE atribuye datos de entrenamiento bajo CC BY 4.0, Public Domain Mark, PDL 1.0, SIL OFL 1.1 y AI Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/ThakiOCR-KOENJA-G2M-v1
- Modelo base: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-G2M-R3
- Modelo japonés previo: https://huggingface.co/ThakiCloud/ThakiOCR-JA-v1
- Dataset sintético multilingüe: https://huggingface.co/datasets/nvidia/OCR-Synthetic-Multilingual-v1
- Dataset JSSODa: https://huggingface.co/datasets/llm-jp/JSSODa
- PP-OCRv6 small rec (ONNX): https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_onnx
- Tarjeta en coreano: MODEL_CARD.ko.md (en el repositorio del modelo)
