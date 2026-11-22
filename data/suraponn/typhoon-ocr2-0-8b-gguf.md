# Suraponn/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon OCR V2 0.8B GGUF es la versión cuantizada en formato GGUF del modelo Typhoon OCR V2 0.8B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) para tailandés e inglés. Dada una imagen de página, el modelo devuelve los elementos de maquetación en orden de lectura, cada uno con categoría, caja delimitadora y texto: tablas en HTML, fórmulas en LaTeX y texto plano en Markdown. Esta publicación concreta, subida por el usuario Suraponn, empaqueta los pesos originales en f16, Q8_0 y Q4_K_M junto con el codificador de imagen (`mmproj`) para su uso con llama.cpp.

El modelo base cuenta con 752.393.024 parámetros (aproximadamente 0,8 mil millones) y está pensado para tareas de extracción de estructura documental: digitalización de facturas, formularios, artículos académicos y documentos escaneados. Su relevancia actual radica en que ofrece OCR estructurado de alta fidelidad en un tamaño que cabe en hardware de consumo, con licencia Apache 2.0 y compatibilidad con el endpoint OpenAI de llama.cpp.

La versión GGUF mantiene la precisión del modelo original en el benchmark MDPBench (77,4 en la variante Q8_0 frente a 77,4 de los pesos bf16 originales), lo que la convierte en una opción práctica para despliegues locales sin GPU de datacenter. El modelo no dispone de modo de razonamiento (thinking) y fue entrenado sin él.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text con codificador de imagen separado) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens recomendados en llama.cpp (16.384 para imagen + 16.384 para respuesta) |
| Tipos de cuantización | f16 (16 bits), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (llama.cpp) |
| Codificador de imagen | `mmproj-typhoon-ocr2-0.8b-f16.gguf` (205 MB, obligatorio) |
| Tamaño del repositorio | 3,1 GB |
| Presupuesto de imagen | hasta 16.384 tokens (16,7 MP; 1 token de imagen por cada 32×32 píxeles) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del transformer ni de la composición del dataset de entrenamiento del modelo base Typhoon OCR V2 0.8B. La model card de esta versión GGUF remite explícitamente a la model card principal del modelo original para los detalles de entrenamiento, benchmarks completos y limitaciones. Lo que sí se documenta es que el modelo fue entrenado con un conjunto fijo de prompts (el prompt de parsing de página completa debe usarse exactamente como se indica) y que fue entrenado sin bloque de razonamiento, por lo que se recomienda desactivar el modo thinking en llama.cpp con `--reasoning off`.

La innovación técnica destacable de esta publicación es el proceso de cuantización y su evaluación sistemática: el autor comparó f16, Q8_0 y Q4_K_M contra los pesos bf16 originales ejecutados en vLLM, usando `llama-server` (build `a691b23`, CUDA, NVIDIA H100), decodificación greedy y un presupuesto de imagen de 16.384 tokens. El resultado muestra que Q8_0 iguala la precisión de los pesos originales con la mitad del tamaño de f16, mientras que Q4_K_M pierde aproximadamente 1,5 puntos. El modelo emplea un codificador de imagen separado en f16 que debe acompañar a cualquier archivo de pesos.

## Capacidades

- Parsing de maquetación de página completa: devuelve una lista JSON de elementos con categoría, bbox y texto, ordenados en orden de lectura humano.
- Categorías de maquetación soportadas: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Extracción de tablas en HTML y de fórmulas en LaTeX; el resto de texto en Markdown.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Procesamiento bilingüe tailandés-inglés, tanto en páginas digitales como fotografiadas.
- Cajas delimitadoras en una rejilla normalizada de 0–1000 relativa al ancho y alto de la página, lo que permite mapearlas de vuelta a la imagen original.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Sin modo de razonamiento (thinking): el modelo fue entrenado sin él y debe desactivarse explícitamente.

## Casos de uso

- Digitalización de facturas y recibos: el modelo devuelve los elementos de la página con sus bboxes y el texto exacto, lo que permite reconstruir la estructura del documento y extraer campos clave en JSON para integrarlos en un ERP o sistema de contabilidad.
- Procesamiento de formularios administrativos en tailandés: al estar entrenado específicamente para tailandés e inglés, resulta adecuado para digitalizar documentación oficial, solicitudes y registros que combinan ambos idiomas en una misma página.
- Extracción de tablas de informes financieros: la salida en HTML de las tablas permite reconstruir su estructura celda a celda y cargarla directamente en hojas de cálculo o bases de datos sin post-procesado manual complejo.
- Conversión de artículos académicos a Markdown: las fórmulas se emiten en LaTeX y el texto en Markdown, de modo que el resultado puede incorporarse a pipelines de documentación técnica o a repositorios de contenido científico.
- Preguntas y respuestas sobre documentos: el modelo responde a consultas sobre el contenido de una página, útil para asistentes de consulta documental interna o atención al ciudadano sobre normativa escaneada.
- OCR local en hardware de consumo: con Q8_0 (812 MB) o Q4_K_M (529 MB) más el codificador de imagen (205 MB), el modelo cabe en GPUs consumer y permite desplegar un servicio de parsing documental sin enviar datos a la nube, relevante por privacidad en sectores regulados.
- Preprocesado en pipelines de RAG documental: la salida estructurada en Markdown/HTML/LaTeX sirve como paso previo de chunking y indexación para sistemas de recuperación aumentada sobre corpus escaneados.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), decodificación greedy, thinking off, presupuesto de imagen de 16.384 tokens:

| Archivo | Precisión | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 77,4 | 77,2 |
| `typhoon-ocr2-0.8b-f16.gguf` | 16 bits, sin cuantizar | 1,52 GB | 77 | 76,9 |
| `typhoon-ocr2-0.8b-Q8_0.gguf` | 8 bits | 812 MB | 77,4 | 78 |
| `typhoon-ocr2-0.8b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 529 MB | 75,8 | 76,7 |
| `mmproj-typhoon-ocr2-0.8b-f16.gguf` | codificador de imagen f16 | 205 MB | – | – |

Las diferencias de unas décimas entre archivos están dentro de la variación entre ejecuciones. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0 GB para Q8_0 (812 MB de pesos + 205 MB de codificador de imagen) y unos 0,75 GB para Q4_K_M; f16 requiere alrededor de 1,75 GB.
- Cabe holgadamente en GPUs consumer: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o más de VRAM.
- En GPU de datacenter se validó sobre NVIDIA H100 con CUDA; también puede ejecutarse en CPU mediante llama.cpp, con mayor latencia.
- Despliegue con llama.cpp (`llama-server`), que expone un endpoint compatible con la API de OpenAI. Ejemplo de arranque: `llama-server -hf typhoon-ai/typhoon-ocr2-0.8b-GGUF:Q8_0 --jinja --reasoning off -c 40960 --image-max-tokens 16384 -ngl 999 --port 8080`.
- Para servir varias peticiones concurrentes, añadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Typhoon OCR V2 0.8B (esta ficha) | 752 M | 40.960 tokens recomendados | th, en | Apache 2.0 | GGUF, safetensors (original) |
| Typhoon OCR V2 0.8B original (bf16) | 752 M | no disponible | th, en | Apache 2.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos OCR comparables (por ejemplo, de la familia PaddleOCR, Donut o Qwen-VL) que permitan una comparación rigurosa de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- El modelo solo soporta tailandés e inglés; no se documenta cobertura de otros idiomas.
- Requiere ampliar la imagen antes de enviarla: el lado largo debe tener al menos 1.600 píxeles manteniendo la relación de aspecto. Con imágenes pequeñas el modelo lee mal, especialmente el texto tailandés.
- El prompt de parsing de página completa debe usarse exactamente como se especifica; el modelo fue entrenado con un conjunto fijo de prompts y desviarse de ellos puede degradar la salida.
- Debe desactivarse el modo de razonamiento (`--reasoning off`): el modelo fue entrenado sin bloque thinking y activarlo altera el formato de salida.
- Q4_K_M pierde aproximadamente 1,5 puntos en MDPBench respecto a Q8_0 y a los pesos originales; para producción se recomienda Q8_0.
- El uso está sujeto a los OpenTyphoon Terms and Conditions además de la licencia Apache 2.0; conviene revisarlos antes de un despliegue comercial.
- Riesgo de alucinación en la extracción de texto: aunque el prompt exige que la salida sea exactamente el texto original sin traducción ni reescritura, no se documentan garantías formales al respecto.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El repositorio es una publicación de terceros (usuario Suraponn), no oficial de Typhoon AI; para los detalles de entrenamiento, limitaciones y benchmarks completos debe consultarse la model card del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
