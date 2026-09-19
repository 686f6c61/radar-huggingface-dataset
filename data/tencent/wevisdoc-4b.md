# tencent/WeVisDoc-4B

## Resumen

WeVisDoc-4B es un modelo de análisis de documentos de extremo a extremo desarrollado por Tencent, ajustado a partir de Qwen3-VL-4B-Instruct. Su función es convertir la imagen de una página en Markdown estructurado, preservando fórmulas en LaTeX y tablas en HTML, sin necesidad de un pipeline modular con detección de layout, OCR y posprocesado por separado. Forma parte de una familia junto con WeVisDoc-2B, también publicada por el mismo equipo.

El modelo tiene 4.437.815.808 parámetros (aproximadamente 4,4B) según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0 con soporte únicamente de inglés y chino. Está construido sobre la arquitectura multimodal qwen3_vl, por lo que procesa entradas de imagen y texto mediante un codificador visual conectado a un transformer de lenguaje.

Su relevancia actual radica en los resultados declarados por el autor: 95,38 de puntuación global en OmniDocBench v1.6 y 75,54 de media en las tres pistas de PureDocBench, situándose por delante del resto de parsers de documentos de extremo a extremo comparados en las cuatro configuraciones reportadas, con un tamaño de parámetros muy inferior al de alternativas como olmOCR-7B o olmOCR-2-7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (modelo vision-language basado en transformer; ajuste de Qwen3-VL-4B-Instruct) |
| Parametros totales | 4.437.815.808 (aproximadamente 4,4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors sin cuantizaciones publicadas en la informacion disponible) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: tamano de 9,7 GB, 212 descargas y 20 likes en el momento de la consulta, creado el 2026-09-16 y actualizado el 2026-09-18.

## Arquitectura y entrenamiento

WeVisDoc-4B sigue la arquitectura qwen3_vl de Qwen: un codificador de visión que convierte la imagen de la página en representaciones que un transformer de lenguaje consume junto con el prompt de tarea. El modelo se obtiene por ajuste fino supervisado sobre Qwen3-VL-4B-Instruct, especializándolo en la tarea de parsing de documentos y en un formato de salida concreto (Markdown con LaTeX y HTML). Se trata, por tanto, de un especialista de extremo a extremo: la imagen entra directamente y la estructura de la página sale ya serializada, sin etapas intermedias explícitas.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado. Tampoco se documentan innovaciones específicas de decodificación o atención más allá de las propias de la arquitectura base Qwen3-VL. El autor publica un informe técnico en arXiv (2609.20423) y un repositorio en GitHub con un script de servicio basado en vLLM para la inferencia.

## Capacidades

- Parsing de documentos de extremo a extremo: convierte la imagen de una página en Markdown estructurado, sin pipeline modular.
- Reconocimiento de fórmulas matemáticas y su serialización en LaTeX.
- Reconocimiento de tablas y su serialización en HTML, con métricas específicas de estructura de tabla (TableTEDS y TableTEDS_S) reportadas por el autor.
- Preservación del orden de lectura, evaluada mediante la métrica ROEdit en OmniDocBench.
- Entrada multimodal de imagen y texto (familia qwen3_vl).
- Idiomas de trabajo: inglés y chino.
- Robustez ante documentos degradados, evaluada en PureDocBench en tres pistas: Clean, Digital Degraded y Real Degraded.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento explícito (thinking mode): no documentado en la información disponible.
- Capacidades de audio o generación de imágenes: no disponibles.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte cada página en Markdown listo para indexar, lo que permite alimentar bases documentales o motores de búsqueda sin construir un pipeline propio de OCR más análisis de layout.
- Extracción de documentación técnica y científica con fórmulas: al serializar en LaTeX, los artículos con ecuaciones se pueden reutilizar en sistemas de publicación, wikis internas o cuadernos de cálculo sin retranscribir la matemática a mano.
- Conversión de informes financieros y contables con tablas: la salida en HTML permite reconstruir tablas de balances o estados de resultados de forma estructurada para su carga en hojas de cálculo o bases de datos.
- Preprocesado para pipelines de RAG sobre documentos corporativos: el Markdown estructurado es un formato de entrada limpio para trocear por secciones y encabezados, mejorando la calidad de la recuperación frente a texto plano extraído con OCR convencional.
- Procesamiento de documentos degradados en entornos reales: la pista Real Degraded de PureDocBench evalúa precisamente escaneos con ruido, lo que lo hace adecuado para digitalizar documentación antigua o con calidad irregular.
- Automatización de la ingesta documental en back office: integrado como servicio vLLM, puede procesar lotes de imágenes de páginas y volcar los resultados en `outputs/predictions/` para su revisión o carga posterior.
- Moderación y normalización de contratos o formularios en inglés y chino: la cobertura de ambos idiomas permite tratar documentación bilingüe con un único modelo en lugar de dos pipelines separados.

## Benchmarks y rendimiento

Resultados reportados por el autor en OmniDocBench v1.6 (medias sobre tres ejecuciones de inferencia). Se listan los modelos comparados de extremo a extremo:

| Modelo | Parametros | Overall ↑ | TextEdit ↓ | FormulaCDM ↑ | TableTEDS ↑ | TableTEDS_S ↑ | ROEdit ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nanonets-OCR2* | 3B | 83,20 | 0,108 | 80,35 | 80,10 | 85,26 | 0,211 |
| OCRFlux-3B* | 3B | 83,31 | 0,126 | 88,75 | 73,78 | 77,98 | 0,217 |
| POINTS-Reader | 3B | 83,37 | 0,096 | 85,72 | 73,98 | 77,40 | 0,198 |
| Nanonets-OCR-s | 3B | 83,61 | 0,108 | 81,46 | 80,18 | 84,51 | 0,213 |
| olmOCR-2-7B* | 7B | 85,51 | 0,106 | 88,84 | 78,32 | 82,81 | 0,223 |
| olmOCR | 7B | 85,74 | 0,139 | 88,10 | 83,00 | 87,17 | 0,216 |
| DeepSeek-OCR* | 3B | 86,31 | 0,077 | 84,71 | 81,87 | 86,07 | 0,171 |
| OCRVerse | 4B | 88,60 | 0,063 | 89,61 | 82,44 | 86,27 | 0,163 |
| UniRec-0.1B* | 0,1B | 88,91 | 0,088 | 92,14 | 83,40 | 86,79 | 0,146 |
| DeepSeek-OCR 2 | 3B | 90,25 | 0,050 | 91,84 | 83,89 | 87,75 | 0,144 |
| dots.ocr | 3B | 90,77 | 0,048 | 89,95 | 87,18 | 90,58 | 0,138 |
| FD-RL* | 4B | 91,21 | 0,055 | 92,92 | 86,22 | 90,92 | 0,145 |
| HunyuanOCR | 1B | 92,03 | 0,048 | 88,60 | 92,37 | 93,99 | 0,138 |
| dots.mocr* | 3B | 92,57 | 0,042 | 92,09 | 89,78 | 92,92 | 0,133 |
| FireRed-OCR | 2B | 93,26 | 0,037 | 95,44 | 88,04 | 91,06 | 0,131 |
| Logics-Parsing-v2 | 4B | 93,33 | 0,041 | 95,65 | 88,42 | 91,98 | 0,137 |
| Qianfan-OCR | 4B | 93,90 | 0,040 | 95,08 | 90,53 | 93,31 | 0,130 |
| Unlimited-OCR | 3B-A0.5B | 93,92 | 0,042 | 95,79 | 90,16 | 93,32 | 0,129 |
| HunyuanOCR-1.5 | 1B | 94,74 | 0,039 | 94,50 | 93,67 | 94,71 | 0,129 |
| WeVisDoc-2B | 2B | 95,06 | 0,038 | 95,94 | 93,03 | 95,26 | 0,130 |
| WeVisDoc-4B | 4B | 95,38 | 0,036 | 96,81 | 92,95 | 95,34 | 0,125 |

Resultados en PureDocBench:

| Modelo | Parametros | Avg₃ ↑ | Clean Overall ↑ | Digital Degraded Overall ↑ | Real Degraded Overall ↑ |
|---|---:|---:|---:|---:|---:|
| OCRFlux-3B | 3B | 42,06 | 47,14 | 41,82 | 37,21 |
| DeepSeek-OCR | 3B | 46,98 | 53,50 | 46,95 | 40,48 |
| UniRec-0.1B | 0,1B | 48,59 | 58,91 | 52,42 | 34,44 |
| POINTS-Reader* | 3B | 49,24 | 53,78 | 51,24 | 42,69 |
| DeepSeek-OCR-2 | 3B | 49,51 | 55,53 | 49,41 | 43,60 |
| Qianfan-OCR | 4B | 51,04 | 57,22 | 50,85 | 45,06 |
| olmOCR-7B | 7B | 55,90 | 62,56 | 57,84 | 47,30 |
| Nanonets-OCR2 | 3B | 58,36 | 64,83 | 61,23 | 49,03 |
| HunyuanOCR | 1B | 60,56 | 65,61 | 61,49 | 54,58 |
| Unlimited-OCR* | 3B-A0.5B | 62,76 | 71,28 | 63,62 | 53,39 |
| olmOCR-2-7B | 7B | 63,78 | 69,36 | 65,87 | 56,10 |
| dots.ocr | 3B | 64,55 | 72,01 | 65,95 | 55,68 |
| Nanonets-OCR-s* | 3B | 65,37 | 71,26 | 66,56 | 58,28 |
| FireRed-OCR | 2B | 65,57 | 70,81 | 68,49 | 57,42 |
| HunyuanOCR-1.5* | 1B | 68,79 | 73,98 | 70,81 | 61,59 |
| OCRVerse | 4B | 69,40 | 73,18 | 71,36 | 63,66 |
| dots.mocr | 3B | 70,39 | 76,27 | 73,16 | 61,73 |
| Logics-Parsing-v2 | 4B | 72,61 | 76,35 | 73,85 | 67,64 |
| FD-RL | 4B | 73,92 | 78,38 | 76,33 | 67,04 |
| WeVisDoc-2B | 2B | 73,86 | 79,36 | 76,62 | 65,60 |
| WeVisDoc-4B | 4B | 75,54 | 79,81 | 77,74 | 69,08 |

En ambas tablas, `Avg₃` es la media de las puntuaciones Overall de las tres pistas de PureDocBench y el asterisco (`*`) marca los resultados de referencia obtenidos con el pipeline de evaluación del propio autor; los resultados sin asterisco proceden de los artículos correspondientes. El autor indica que WeVisDoc-4B queda primero entre los parsers de extremo a extremo comparados en las cuatro configuraciones reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia aritmética, 4,44B parámetros en precisión bf16 ocuparían del orden de 8,9 GB solo en pesos, a los que hay que sumar la caché KV, las activaciones y el coste del codificador visual, más el margen de memoria del runtime; el tamaño del repositorio (9,7 GB) es coherente con ese orden de magnitud.
- GPU recomendadas: no disponibles en la información proporcionada. El autor documenta el despliegue con vLLM, que requiere GPU CUDA, pero no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. Por tamaño de pesos en bf16, el modelo estaría en el rango de GPUs con 16 GB o más de VRAM, pero esto es una estimación derivada del número de parámetros, no un dato publicado.
- Opciones de despliegue: vLLM, mediante los scripts oficiales del repositorio (`scripts/serve_vllm.sh Tencent/WeVisDoc-4B` y `requirements-vllm.txt`). No se documentan en la información disponible otras vías como llama.cpp, Ollama o TGI.
- Requisitos de entorno: Python 3.10 o superior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Overall OmniDocBench v1.6 ↑ | Avg₃ PureDocBench ↑ | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| WeVisDoc-4B | 4B | 95,38 | 75,54 | apache-2.0 | HuggingFace (tencent/WeVisDoc-4B) |
| WeVisDoc-2B | 2B | 95,06 | 73,86 | no disponible en la informacion | HuggingFace (Tencent/WeVisDoc-2B) |
| Logics-Parsing-v2 | 4B | 93,33 | 72,61 | no disponible | comparado en el informe del autor |
| Qianfan-OCR | 4B | 93,90 | 51,04 | no disponible | comparado en el informe del autor |
| dots.mocr | 3B | 92,57 | 70,39 | no disponible | comparado en el informe del autor |
| olmOCR-2-7B | 7B | 85,51 | 63,78 | no disponible | comparado en el informe del autor |
| DeepSeek-OCR 2 | 3B | 90,25 | 49,51 | no disponible | comparado en el informe del autor |

La comparación relevante dentro de la propia familia es con WeVisDoc-2B, que obtiene 95,06 en OmniDocBench v1.6 y 73,86 de media en PureDocBench con la mitad de parámetros aproximadamente. Frente a los modelos de 7B comparados (olmOCR y olmOCR-2-7B), WeVisDoc-4B reporta puntuaciones superiores con un tamaño notablemente menor. Los datos de licencia de los modelos de la competencia no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Cobertura de idiomas limitada a inglés y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Es un modelo especializado en parsing de imágenes de páginas: no está pensado como asistente conversacional general ni como modelo de razonamiento o generación de código.
- Riesgo de error en la transcripción de fórmulas y tablas: las métricas reportadas muestran valores altos pero no perfectos (FormulaCDM 96,81 y TableTEDS 92,95), por lo que en entornos críticos conviene validación posterior de la salida.
- El orden de lectura puede degradarse en maquetaciones complejas: ROEdit de 0,125 indica que persiste un margen de error no nulo.
- El rendimiento declarado procede de evaluaciones del propio autor y con su pipeline en parte de las líneas base (marcadas con asterisco), lo que introduce un posible sesgo de comparación.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación, lo que dificulta auditar el comportamiento fuera de la tarea objetivo.
- No se especifica la longitud de contexto soportada, lo que impide garantizar el tratamiento de páginas con densidad de contenido muy alta sin truncamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar los términos del modelo base Qwen3-VL-4B-Instruct del que deriva y las condiciones de uso de los datos procesados.
- No hay información publicada sobre cuantizaciones oficiales, latencia ni requisitos de VRAM, lo que obliga a validar el despliegue en producción por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/WeVisDoc-4B
- Modelo WeVisDoc-4B (enlace del autor): https://huggingface.co/Tencent/WeVisDoc-4B
- Modelo WeVisDoc-2B: https://huggingface.co/Tencent/WeVisDoc-2B
- Repositorio GitHub: https://github.com/Tencent/WeVisDoc
- Pagina del proyecto: https://tencent.github.io/WeVisDoc
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.20423
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base de la variante 2B: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Cobertura en Local Model Watch: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/18/tencent-releases-wevisdoc-document-parsing-models/
- Cobertura en korshunov.ai: https://korshunov.ai/en/article/26275-tencent-releases-wevisdoc-2b-and-wevisdoc-4b-document-parsers/
- Ficha en savrn.com: https://savrn.com/models/wevisdoc-4b
