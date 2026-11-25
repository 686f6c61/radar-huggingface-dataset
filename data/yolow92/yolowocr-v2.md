# YOLOW92/yolowocr-v2

## Resumen

YolowOCR-Suite v2 es un conjunto de cinco modelos especializados en OCR y análisis de documentos publicado por el desarrollador independiente YOLOW92 bajo licencia MIT. No se trata de un modelo de lenguaje generativo, sino de una suite de visión por computador orientada a pipeline: detección de texto, reconocimiento de texto multilingüe y latino, análisis de maquetación documental y reconocimiento de fórmulas LaTeX. Todos los pesos están en BF16 safetensors y suman 109,59 MB en configuración multilingüe, lo que supone un 8,1× menos que la pila de referencia FP32 de 892 MB.

La suite está diseñada para ejecutarse en Rust puro mediante la librería `yolowpdf-ocr >= 0.2.0`, sin dependencias de runtime de Python ni C++. Esto la hace relevante para despliegues embebidos, servicios de extracción documental de baja latencia y entornos donde el footprint y la ausencia de intérprete son requisitos duros. Los cinco modelos se entrenaron desde cero (clean-room) y se publican con arquitecturas compactas: LCNetV4 + RepLKFPN + DB Head para detección, LCNetV4 + SVTR + CTC para reconocimiento, HGNetV2 con decoder deformable para layout y un ViT rectangular con decoder mBART y cabezas MTP para fórmulas.

El interés actual radica en su combinación de tamaño mínimo, licencia permisiva y decodificación especulativa integrada en el modelo de fórmulas (MTP-4), que reporta 3,1–3,5 ms/token en CPU. La suite no incluye un modelo de lenguaje ni capacidades de razonamiento general; su alcance es estrictamente la digitalización estructurada de documentos escaneados o PDF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Suite de 5 modelos: LCNetV4 + RepLKFPN + DB Head (detección); LCNetV4 + 2L SVTR + CTC (reconocimiento); HGNetV2 + HybridEncoder + Deformable Decoder (layout); Rectangular SAM-ViT + mBART + MTP (fórmulas) |
| Parametros totales | 58,34 M en total (2,48 M detección + 5,29 M rec. multi + 3,05 M rec. latín + 13,22 M layout + 34,3 M fórmulas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantizacion | BF16 (único formato publicado); no se documentan GGUF, INT8 ni FP16 |
| Idiomas soportados | Multilingüe en reconocimiento (vocabulario de 18.710 caracteres) y latino/europeo (254 caracteres); lista de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La suite combina cinco componentes independientes. La detección de texto usa una columna LCNetV4 con FPN basada en RepLK (RepLKFPN) y una cabeza Differentiable Binarization (DB), con entrada dinámica de lado mínimo 736 y 2,48 M de parámetros. El reconocimiento se resuelve con LCNetV4 como extractor, un codificador SVTR de 2 capas y decodificación CTC; hay dos variantes, una multilingüe con vocabulario de 18.710 caracteres y otra latina con 254 caracteres que incluye matemáticas y caracteres europeos. El análisis de maquetación emplea HGNetV2 con un HybridEncoder de una capa y un decoder deformable de 3 capas con 150 consultas, sobre entrada fija de 640×640, con 25 clases documentales y orden de lectura, usando un umbral de dibujo de 0,45.

El modelo de fórmulas es el más grande: un ViT SAM rectangular de 8 capas sobre entrada 224×672, un decoder mBART de 6 capas y cuatro cabezas MTP (Multi-Token Prediction) que permiten decodificación autoespeculativa sin pérdida, con vocabulario ByteLevel BPE de 1.842 tokens y latencia reportada de 3,1–3,5 ms/token en CPU. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias; tampoco se detalla el proceso de anotación ni la procedencia de los datos.

## Capacidades

- Detección de regiones de texto en imágenes y páginas de PDF con entrada de tamaño dinámico.
- Reconocimiento de texto multilingüe con vocabulario de 18.710 caracteres (variante `rec_v2_multi`).
- Reconocimiento rápido de texto latino, matemático y europeo con vocabulario de 254 caracteres (variante `rec_v2_latin`).
- Análisis de maquetación documental con 25 clases y orden de lectura.
- Reconocimiento de fórmulas matemáticas y conversión a LaTeX.
- Decodificación especulativa integrada (MTP-4) en el modelo de fórmulas, sin pérdida de calidad.
- Ejecución en CPU o GPU NVIDIA CUDA desde Rust, sin Python ni C++.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No se documentan capacidades de audio, vídeo ni visión general fuera del dominio documental.

## Casos de uso

- Digitalización masiva de PDF escaneados: el pipeline `PdfOcr` combina detección, reconocimiento y, opcionalmente, layout y fórmulas para extraer texto estructurado de lotes de documentos con un footprint de 109,59 MB y sin intérprete Python.
- Extracción de texto en entornos embebidos o edge: al ejecutarse en Rust puro sobre CPU, la suite puede integrarse en dispositivos con recursos limitados donde no es viable desplegar un runtime de Python o un modelo de lenguaje.
- Procesamiento de documentación científica: el modelo de fórmulas convierte expresiones matemáticas a LaTeX, útil para digitalizar papers, libros técnicos y apuntes con notación matemática.
- Análisis de maquetación para pipelines de RAG documental: `layout_s_v2` identifica 25 clases y orden de lectura, lo que permite segmentar secciones (títulos, tablas, pies de página) antes de indexar el contenido.
- Digitalización multilingüe: la variante `rec_v2_multi` cubre un vocabulario amplio de caracteres, adecuada para documentos con mezcla de alfabetos y signos.
- Servicios de OCR de baja latencia en GPU: en la configuración Latin (GPU, solo texto) el benchmark reporta 3,567 páginas/s y 37,562 s para 134 páginas, adecuado para APIs de extracción en tiempo casi real.
- Extracción de texto en documentos europeos y técnicos: la variante latina, con 254 caracteres, cubre acentos, símbolos matemáticos y caracteres europeos con menor coste computacional.

## Benchmarks y rendimiento

Resultados publicados en `olmOCR-bench` (134 páginas escaneadas), medidos en un equipo con i7-10700, 15 GB de RAM y GTX 1070 con `yolowpdf 0.2.0` y `YOLOWPDF_FAST_MATH=1`:

| Configuración | Completadas | Tiempo (s) | Páginas/s | Pico MB | Score | No-baseline |
|---|---:|---:|---:|---:|---:|---:|
| v2 Latin (GPU, solo texto) | 134/134 | 37,562 | 3,567 | 628,2 | 0,3891 | 0,0837 |
| v2 Multi (GPU, solo texto) | 134/134 | 46,548 | 2,879 | 665,2 | 0,3897 | 0,0846 |
| v2 Multi (CPU, solo texto) | 134/134 | 106,580 | 1,257 | 592,7 | 0,3897 | 0,0846 |
| v2 Multi (GPU, layout + fórmula) | 134/134 | 367,664 | 0,364 | 938,5 | 0,4799 | 0,2199 |
| v2 Multi (CPU, layout + fórmula) | 134/134 | 388,367 | 0,345 | 831,2 | 0,4799 | 0,2199 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que la suite no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el pico de memoria de worker en GPU reportado es de 628,2 MB (Latin, solo texto) y 938,5 MB (Multi, layout + fórmula), incluyendo buffers del pipeline.
- GPU recomendadas: el benchmark se ejecutó en una GTX 1070; por el tamaño de los pesos (109,59 MB en BF16) cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- Cabe en GPU consumer: sí, en GTX 1070, RTX 2060, RTX 3060, RTX 4090 y superiores; también en iGPU con suficiente memoria compartida, aunque sin datos de rendimiento.
- Despliegue: `yolowpdf-ocr >= 0.2.0` en Rust con `Device::Gpu { index }` o `Device::Cpu`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 3,567 páginas/s (Latin, GPU, solo texto), 2,879 páginas/s (Multi, GPU, solo texto), 1,257 páginas/s (Multi, CPU, solo texto), 0,364 páginas/s (Multi, GPU, layout + fórmula) y 0,345 páginas/s (Multi, CPU, layout + fórmula). El modelo de fórmulas reporta 3,1–3,5 ms/token en CPU con MTP-4.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YolowOCR-Suite v2 | Suite OCR (5 modelos) | 58,34 M totales | No aplica | MIT | Hugging Face, Rust |
| PaddleOCR | Suite OCR | No disponible | No aplica | Apache 2.0 | Hugging Face, Python/C++ |
| Tesseract | OCR clásico | No disponible (basado en LSTM) | No aplica | Apache 2.0 | Repositorio propio, C++ |
| Surya | OCR + layout | No disponible | No aplica | GPL-3.0 con restricciones | Hugging Face, Python |

No se dispone de datos de benchmarks comparativos directos entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona, no soporta tool calling ni agentes.
- Solo se publican pesos en BF16; no hay versiones cuantizadas a INT8, GGUF ni FP16, lo que limita el despliegue en hardware sin soporte BF16.
- El rendimiento en `olmOCR-bench` es modesto: score de 0,3891–0,3897 en modo solo texto y 0,4799 con layout y fórmulas, frente a sistemas OCR de mayor tamaño.
- El benchmark se midió en una única máquina (i7-10700, GTX 1070); no hay datos de escalado a otros hardware.
- No se documentan los idiomas cubiertos más allá del tamaño del vocabulario; la cobertura real por idioma es desconocida.
- Riesgo de alucinación en la conversión de fórmulas a LaTeX y en la clasificación de layout; no se reportan métricas de error específicas por clase.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Licencia MIT permite uso comercial, pero no se documentan sesgos ni evaluación de robustez ante documentos degradados, manuscritos o dominios especializados.
- Dependencia de la librería `yolowpdf-ocr >= 0.2.0`; no hay integración documentada con otros frameworks.

## Enlaces

- Hugging Face: https://huggingface.co/YOLOW92/yolowocr-v2
- Repositorio yolowpdf: https://github.com/YOLOW92/yolowpdf
- No se han encontrado en la información disponible papers, blogs, demos ni otros repositorios adicionales.
