# tencent/WeVisDoc-2B

## Resumen

WeVisDoc-2B es un modelo de análisis de documentos (*document parsing*) de extremo a extremo desarrollado por Tencent. Su función es convertir la imagen de una página en Markdown estructurado, preservando fórmulas en LaTeX y tablas en HTML. Está afinado a partir de Qwen3-VL-2B-Instruct, por lo que hereda una arquitectura de visión-lenguaje de tipo transformer (etiqueta `qwen3_vl` en HuggingFace) con 2.438.696.960 parámetros totales y un repositorio de 4,9 GB en safetensors.

El modelo forma parte de una familia de dos tamaños: WeVisDoc-2B y WeVisDoc-4B (este último derivado de Qwen3-VL-4B-Instruct). Según la model card, WeVisDoc-4B alcanza 95,38 de Overall en OmniDocBench v1.6 y 75,54 de media en las tres pistas de PureDocBench, mientras que WeVisDoc-2B se queda en 95,06 y 73,86 respectivamente. En ambos casos el resultado supera a los parsers de extremo a extremo comparados en esas tablas.

Su relevancia actual es doble: por un lado, demuestra que un modelo de solo 2B parámetros puede competir con alternativas de 3B, 4B e incluso 7B en extracción estructurada de documentos; por otro, se publica bajo licencia Apache 2.0, lo que facilita su integración comercial en pipelines de digitalización, RAG sobre PDFs y automatización de back-office. El informe técnico está disponible en arXiv (2609.20423) y el código de despliegue en el repositorio GitHub de Tencent.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal), etiqueta `qwen3_vl` |
| Parametros totales | 2.438.696.960 (aproximadamente 2,44B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan en la informacion proporcionada) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Tamano del repositorio | 4,9 GB |
| Fecha de publicacion | 2026-09-16 (actualizado el 2026-09-18) |
| Descargas / likes | 531 / 11 |

## Arquitectura y entrenamiento

WeVisDoc-2B es un modelo de visión-lenguaje construido sobre Qwen3-VL-2B-Instruct. La entrada es la imagen de una página completa y la salida es texto Markdown con tres componentes diferenciados: texto plano, fórmulas matemáticas serializadas en LaTeX y tablas serializadas en HTML. Este enfoque de "parser de extremo a extremo" sustituye a las arquitecturas clásicas por etapas (detección de layout, OCR de línea, reconocimiento de tabla y reconstrucción), lo que simplifica el despliegue y evita la propagación de errores entre módulos.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Lo que sí se documenta es el resultado del ajuste: el modelo se evalúa como especialista en parsing end-to-end y sus resultados son medias sobre tres ejecuciones de inferencia, lo que indica que el autor controló la varianza del muestreo. La innovación principal no es arquitectónica sino de producto: un modelo de 2B que supera a baselines de 3B, 4B y 7B en OmniDocBench v1.6 (95,06 frente a 94,74 de HunyuanOCR-1.5, 93,33 de Logics-Parsing-v2 o 85,74 de olmOCR-7B).

## Capacidades

- Conversión de imagen de página a Markdown estructurado, con reconstrucción del orden de lectura.
- Reconocimiento de fórmulas matemáticas y serialización en LaTeX (95,94 de FormulaCDM en OmniDocBench v1.6).
- Reconocimiento de tablas y serialización en HTML (93,03 de TableTEDS y 95,26 de TableTEDS_S).
- Extracción de texto con baja tasa de edición (0,038 de TextEdit y 0,130 de ROEdit, métricas en las que valores más bajos son mejores).
- Robustez ante documentos degradados: 76,62 en la pista Digital Degraded y 65,60 en la pista Real Degraded de PureDocBench.
- Capacidad multimodal de entrada: el modelo consume imágenes de página, no texto extraído previamente.
- Idiomas de trabajo: inglés y chino.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo de razonamiento explícito (*thinking*), audio o vídeo: no documentado en la información disponible.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte cada página en Markdown con tablas y fórmulas intactas, lo que permite almacenar el contenido en un formato indexable sin post-procesado heurístico.
- Construcción de bases de conocimiento para RAG: al preservar la estructura de tablas en HTML y fórmulas en LaTeX, los fragmentos recuperados mantienen la semántica original, algo que un OCR de texto plano destruye.
- Procesamiento de literatura científica y preprints: las fórmulas en LaTeX y las tablas de resultados se extraen directamente, lo que facilita la extracción de métricas y comparativas de forma automatizada.
- Automatización de back-office con documentos degradados: sus 65,60 puntos en la pista Real Degraded de PureDocBench lo hacen apto para facturas, albaranes o formularios escaneados con ruido, sellos o inclinación.
- Normalización de informes financieros: la extracción de tablas HTML permite volcar balances y estados de resultados a estructuras tabulares sin reconstruir la rejilla manualmente.
- Preprocesado para pipelines de publicación académica: conversión de manuscritos a Markdown para revisión, difusión o migración de repositorios documentales.
- Indexación de documentación técnica interna: manuales y especificaciones con diagramas y tablas se transforman en texto estructurado buscable.
- Validación de calidad documental: la comparación entre el Markdown generado y el original permite detectar páginas mal escaneadas o con contenido ilegible.

## Benchmarks y rendimiento

Resultados publicados en la model card para OmniDocBench v1.6 (medias sobre tres ejecuciones de inferencia). En TextEdit y ROEdit, valores más bajos indican mejor rendimiento.

| Modelo | Parametros | Overall ↑ | TextEdit ↓ | FormulaCDM ↑ | TableTEDS ↑ | TableTEDS_S ↑ | ROEdit ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nanonets-OCR2 | 3B | 83,20 | 0,108 | 80,35 | 80,10 | 85,26 | 0,211 |
| OCRFlux-3B | 3B | 83,31 | 0,126 | 88,75 | 73,78 | 77,98 | 0,217 |
| POINTS-Reader | 3B | 83,37 | 0,096 | 85,72 | 73,98 | 77,40 | 0,198 |
| olmOCR-2-7B | 7B | 85,51 | 0,106 | 88,84 | 78,32 | 82,81 | 0,223 |
| olmOCR | 7B | 85,74 | 0,139 | 88,10 | 83,00 | 87,17 | 0,216 |
| DeepSeek-OCR | 3B | 86,31 | 0,077 | 84,71 | 81,87 | 86,07 | 0,171 |
| dots.ocr | 3B | 90,77 | 0,048 | 89,95 | 87,18 | 90,58 | 0,138 |
| HunyuanOCR | 1B | 92,03 | 0,048 | 88,60 | 92,37 | 93,99 | 0,138 |
| FireRed-OCR | 2B | 93,26 | 0,037 | 95,44 | 88,04 | 91,06 | 0,131 |
| Qianfan-OCR | 4B | 93,90 | 0,040 | 95,08 | 90,53 | 93,31 | 0,130 |
| HunyuanOCR-1.5 | 1B | 94,74 | 0,039 | 94,50 | 93,67 | 94,71 | 0,129 |
| **WeVisDoc-2B** | **2B** | **95,06** | **0,038** | **95,94** | **93,03** | **95,26** | **0,130** |
| **WeVisDoc-4B** | **4B** | **95,38** | **0,036** | **96,81** | **92,95** | **95,34** | **0,125** |

Resultados en PureDocBench (`Avg₃` es la media de las tres pistas):

| Modelo | Parametros | Avg₃ ↑ | Clean Overall ↑ | Digital Degraded ↑ | Real Degraded ↑ |
|---|---:|---:|---:|---:|---:|
| OCRFlux-3B | 3B | 42,06 | 47,14 | 41,82 | 37,21 |
| DeepSeek-OCR | 3B | 46,98 | 53,50 | 46,95 | 40,48 |
| olmOCR-7B | 7B | 55,90 | 62,56 | 57,84 | 47,30 |
| HunyuanOCR | 1B | 60,56 | 65,61 | 61,49 | 54,58 |
| dots.ocr | 3B | 64,55 | 72,01 | 65,95 | 55,68 |
| FireRed-OCR | 2B | 65,57 | 70,81 | 68,49 | 57,42 |
| HunyuanOCR-1.5 | 1B | 68,79 | 73,98 | 70,81 | 61,59 |
| OCRVerse | 4B | 69,40 | 73,18 | 71,36 | 63,66 |
| Logics-Parsing-v2 | 4B | 72,61 | 76,35 | 73,85 | 67,64 |
| **WeVisDoc-2B** | **2B** | **73,86** | **79,36** | **76,62** | **65,60** |
| **WeVisDoc-4B** | **4B** | **75,54** | **79,81** | **77,74** | **69,08** |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de conocimiento general, lo cual es coherente con un modelo especializado en parsing documental.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 2,44B parámetros, no cifras publicadas por el autor): aproximadamente 4,9 GB solo de pesos en BF16/FP16, más caché KV y activaciones, lo que sitúa el consumo práctico en torno a 6-8 GB.
- En cuantización INT8 la huella de pesos bajaría a unos 2,5 GB; en INT4, a unos 1,3-1,5 GB. No se documentan pesos ya cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente para inferencia en BF16 o cuantizada. Para procesamiento por lotes de alto volumen se recomiendan A100 o H100.
- Cabe en GPU de consumo: sí, es uno de los puntos fuertes del modelo frente a alternativas de 7B como olmOCR.
- Opciones de despliegue: el autor documenta explícitamente vLLM (`requirements-vllm.txt`, `scripts/serve_vllm.sh`, `scripts/run_demo.sh`). No se documentan en la información disponible recetas para llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de páginas procesadas por minuto.

## Comparativa con modelos similares

| Modelo | Parametros | OmniDocBench v1.6 Overall ↑ | PureDocBench Avg₃ ↑ | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| WeVisDoc-2B | 2B | 95,06 | 73,86 | Apache 2.0 | HuggingFace |
| WeVisDoc-4B | 4B | 95,38 | 75,54 | Apache 2.0 (segun familia) | HuggingFace |
| HunyuanOCR-1.5 | 1B | 94,74 | 68,79 | no disponible en la informacion proporcionada | HuggingFace |
| FireRed-OCR | 2B | 93,26 | 65,57 | no disponible en la informacion proporcionada | HuggingFace |
| Qianfan-OCR | 4B | 93,90 | 51,04 | no disponible en la informacion proporcionada | HuggingFace |
| dots.ocr | 3B | 90,77 | 64,55 | no disponible en la informacion proporcionada | HuggingFace |
| olmOCR-7B | 7B | 85,74 | 55,90 | no disponible en la informacion proporcionada | HuggingFace |

Frente a HunyuanOCR-1.5, el competidor más directo por tamaño, WeVisDoc-2B gana 0,32 puntos en OmniDocBench y 5,07 en PureDocBench, pero duplica el número de parámetros. Frente a FireRed-OCR (2B, mismo rango de tamaño) la ventaja es de 1,80 y 8,29 puntos respectivamente, con contexto y licencia no especificados en la información disponible para el rival.

## Limitaciones y advertencias

- Modelo especializado: no es un asistente conversacional de propósito general. Su salida esperada es Markdown de una página; usarlo para diálogo o generación libre puede producir resultados pobres.
- Idiomas: solo inglés y chino. Documentos en castellano, francés, alemán o árabe quedan fuera del alcance declarado y su rendimiento en ellos es desconocido.
- Riesgo de alucinación en fórmulas y tablas: aunque FormulaCDM es 95,94 y TableTEDS_S 95,26, siguen existiendo errores. En dominios críticos (finanzas, medicina, legal) la salida debe validarse contra la imagen original.
- Sesgo de dominio: el ajuste se orienta a documentos con estructura académica o administrativa; el comportamiento en manuscritos, caligrafía o documentos históricos no está documentado.
- TextEdit de 0,038 y ROEdit de 0,130 implican que aún hay caracteres y orden de lectura incorrectos en una fracción de páginas; en corpus grandes esto se traduce en errores acumulados.
- PureDocBench Real Degraded cae a 65,60, muy por debajo de los 79,36 de la pista Clean: la degradación real de escaneo sigue siendo el escenario más débil.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar los términos del modelo base Qwen3-VL-2B-Instruct y de los datasets de entrenamiento, no detallados en la información disponible.
- Requisitos de despliegue: el flujo documentado depende de vLLM y Python 3.10+. No hay soporte confirmado para GGUF, llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU.
- Longitud de contexto no disponible: no se puede planificar de antemano el procesamiento de páginas muy densas o de documentos de varias páginas en una sola pasada.
- Cifras de latencia y throughput ausentes: la planificación de capacidad en producción requiere una prueba propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/WeVisDoc-2B
- Modelo hermano WeVisDoc-4B: https://huggingface.co/Tencent/WeVisDoc-4B
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio GitHub: https://github.com/Tencent/WeVisDoc
- Página del proyecto: https://tencent.github.io/WeVisDoc
- Informe técnico en arXiv: https://arxiv.org/abs/2609.20423
