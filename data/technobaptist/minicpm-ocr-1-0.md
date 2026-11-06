# TechnoBaptist/MiniCPM-OCR-1.0

## Resumen

MiniCPM-OCR 1.0 es un modelo vision-lenguaje especializado en reconocimiento óptico de caracteres y comprensión de documentos, desarrollado por OpenBMB como parte de la familia MiniCPM-V/o. Con 1.300 millones de parámetros, está diseñado específicamente para el parseo de documentos centrados en texto: extracción de texto, tablas, fórmulas, gráficos, sellos y datos estructurados, equilibrando calidad y velocidad en capturas del mundo real.

El modelo aborda el problema del parseo documental de alta fidelidad en escenarios adversos (escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados) tanto en chino como en inglés. Su relevancia actual radica en que alcanza resultados SOTA en Real5-OmniDocBench (93,68) manteniendo un rendimiento de 1,2 páginas por segundo, con aceleración DSpark que mejora la eficiencia extremo a extremo un 55 %.

La arquitectura es de tipo vision-lenguaje multimodal (image-text-to-text), con pesos en formato safetensors y un tamaño de repositorio de 2,6 GB. Se distribuye bajo licencia Apache 2.0 y ofrece despliegue desde el primer día en vLLM, SGLang, llama.cpp y Ollama, además de variantes cuantizadas y builds multi-chip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje multimodal (image-text-to-text); familia MiniCPM-V/o |
| Parametros totales | 1.300.434.160 (1,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variantes cuantizadas disponibles (GGUF); tipos especificos no disponibles |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,6 GB); variantes GGUF disponibles |

## Arquitectura y entrenamiento

MiniCPM-OCR 1.0 es un modelo vision-lenguaje de 1,3B parámetros perteneciente a la familia MiniCPM-V/o, orientado a la comprensión de documentos centrados en texto. La model card no detalla la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles en la información proporcionada.

La innovación técnica destacable es la decodificación acelerada DSpark, disponible en variantes BF16 y GGUF, que mejora la eficiencia de procesamiento extremo a extremo un 55 %. El modelo reconoce regiones dentro de una página en paralelo (aunque la concurrencia a nivel de imagen sea 1), lo que contribuye a su throughput de 1,2 páginas por segundo en una RTX 5090 sobre las 1651 imágenes de OmniDocBench v1.6.

## Capacidades

- Reconocimiento de texto en documentos e imágenes, incluyendo escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados.
- Parseo de documentos a Markdown con detección de layout.
- Reconocimiento de tablas y fórmulas.
- Reconocimiento de gráficos y sellos.
- Extracción de información estructurada y extracción de información clave (KIE) para automatización downstream.
- Procesamiento de documentos y PDF en chino e inglés.
- Soporte de tool calling y flujos de agentes (según la model card: "agent workflows").
- Despliegue en vLLM, SGLang, llama.cpp y Ollama; SDK pip y API completa.
- Posibilidad de fine-tuning adicional.

## Casos de uso

- Digitalización de archivos históricos y escaneados: el modelo maneja páginas curvadas, inclinadas y documentos recapturados, lo que permite convertir fondos documentales en texto y Markdown estructurado sin preprocesado geométrico complejo.
- Extracción de tablas de estados financieros: reconocimiento de tablas y conversión a Markdown facilita la ingesta de informes contables en pipelines de análisis de datos.
- Procesamiento de facturas y documentos administrativos: la extracción de información clave (KIE) permite poblar bases de datos y sistemas de gestión con datos estructurados a partir de PDF e imágenes.
- Parseo de artículos científicos con fórmulas: el reconocimiento de fórmulas y gráficos permite convertir papers en Markdown con matemáticas preservadas para su indexación o publicación.
- Digitalización de prensa y periódicos: el modelo está entrenado para layouts complejos multicolumna (ejemplos de periódicos en la model card), adecuado para archivos de hemeroteca.
- Automatización de back-office con agentes: el soporte de tool calling y flujos de agentes permite integrar el OCR en pipelines multi-paso de validación y enriquecimiento documental.
- Procesamiento a escala con alto throughput: con 1,2 páginas/s en una RTX 5090 y aceleración DSpark (1,49× PaddleOCR-VL-1.6, 3,62× MinerU2.5 Pro), es adecuado para lotes masivos de documentos donde el coste por página es crítico.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | Líder según la model card (valor numérico no disponible) |
| Wild-OmniDocBench | Líder según la model card (valor numérico no disponible) |
| olmOCR-Bench | Líder según la model card (valor numérico no disponible) |
| CHAOS-Bench | Evaluado (valor numérico no disponible) |
| Throughput (RTX 5090, OmniDocBench v1.6, 1651 imágenes) | 1,2 páginas/s |

La model card indica que MiniCPM-OCR 1.0 obtiene la mayor puntuación media equitativa entre OmniDocBench v1.6, Real5-OmniDocBench, Wild-OmniDocBench y olmOCR-Bench entre los modelos OCR de código abierto comparados. Los valores numéricos del resto de benchmarks no se incluyen en el texto proporcionado (solo en imágenes).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,3B parámetros, en BF16 requeriría aproximadamente 2,6 GB de pesos más overhead de activaciones y visión (estimación orientativa, no confirmada en la información).
- GPU de referencia en benchmarks: NVIDIA GeForce RTX 5090, con throughput de 1,2 páginas/s.
- Cabe en GPU de consumo: sí, por tamaño (1,3B) y existencia de variantes GGUF; modelos concretos no confirmados en la información.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama; variantes cuantizadas y builds multi-chip; SDK pip y API.
- Aceleración: decodificación DSpark en BF16 y GGUF, con mejora del 55 % en eficiencia extremo a extremo.
- Latencia y throughput: 1,2 páginas/s (RTX 5090, concurrencia de imagen 1); 1,49× PaddleOCR-VL-1.6 y 3,62× MinerU2.5 Pro en throughput relativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1,3B | no disponible | 93,68 Real5-OmniDocBench; 54,7 OCRBench v2; 1,2 págs/s | Apache 2.0 | Hugging Face, vLLM, SGLang, llama.cpp, Ollama |
| PaddleOCR-VL-1.6 | no disponible | no disponible | Throughput 1,49× inferior a MiniCPM-OCR 1.0 | no disponible | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | Throughput 3,62× inferior a MiniCPM-OCR 1.0 | no disponible | no disponible |

Los datos de parámetros, contexto y licencia de los modelos comparados no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Idiomas soportados limitados a inglés y chino; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos en tareas de extracción; conviene validar la salida en producción.
- No se documentan sesgos conocidos en la model card.
- El modelo está especializado en documentos centrados en texto; su rendimiento en otras tareas vision-lenguaje generales no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de dependencias y de los datos de entrenamiento (no detallados).
- El throughput reportado (1,2 págs/s) depende del contenido de la página, el backend, la concurrencia y el hardware; no debe extrapolarse sin medición propia.
- El repositorio tiene un número muy bajo de descargas (19) y likes (0), lo que sugiere escasa validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/TechnoBaptist/MiniCPM-OCR-1.0
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- API docs: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_api_en.md
- Demo (global): https://platform.modelbest.ai/console/playground/document-parse
- Demo (China): https://platform.modelbest.cn/console/playground/document-parse
- Variante DSpark BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guía del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Familia MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
