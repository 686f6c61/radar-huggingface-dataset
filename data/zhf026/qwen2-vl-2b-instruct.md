# zhf026/Qwen2-VL-2B-Instruct

## Resumen

El modelo `zhf026/Qwen2-VL-2B-Instruct` es un espejo (mirror) del modelo original `Qwen/Qwen2-VL-2B-Instruct`, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo multimodal de visión-lenguaje (image-text-to-text) con 2.208.985.600 parámetros (2,2B), diseñado para comprender imágenes, vídeos y texto de forma conjunta. Forma parte de la familia Qwen2-VL, que incluye versiones de 2B, 7B y 72B, y destaca por su tamaño compacto combinado con un rendimiento competitivo en tareas de comprensión visual, OCR, razonamiento sobre documentos y vídeo.

La arquitectura incorpora dos innovaciones clave: la resolución dinámica nativa (Naive Dynamic Resolution), que adapta el número de tokens visuales a la resolución de la imagen, y el posicionamiento rotatorio multimodal (M-ROPE), que descompone la incrustación posicional para capturar información posicional 1D textual, 2D visual y 3D de vídeo. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y está disponible en formato safetensors compatible con la librería `transformers`. Su ventana de contexto no aparece documentada en la información proporcionada, aunque el modelo original de Qwen soporta 32.768 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen2_vl) con vision encoder |
| Parametros totales | 2.208.985.600 (2,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos en safetensors) |
| Idiomas soportados | Ingles (etiqueta oficial); el modelo original soporta chino, ingles y otros idiomas europeos, japones, coreano, arabe, vietnamita, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, 4,4 GB en total) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2-VL, un transformer multimodal que combina un codificador visual (vision encoder) con un decodificador de lenguaje. La innovación principal es la resolución dinámica nativa: en lugar de redimensionar las imágenes a un tamaño fijo, el modelo las procesa a su resolución original y las convierte en un número variable de tokens visuales (entre 4 y 16.384 por imagen), lo que mejora la precisión en documentos densos o imágenes de alta resolución. Además, emplea M-ROPE (Multimodal Rotary Position Embedding), que separa la incrustación posicional en componentes para texto (1D), imágenes (2D) y vídeo (3D), permitiendo una comprensión conjunta de modalidades.

El entrenamiento se realizó en dos fases: preentrenamiento en grandes volúmenes de datos de imagen-texto y vídeo-texto, seguido de un ajuste fino supervisado (instruction tuning) para generar respuestas conversacionales. No se especifica si se utilizó RLHF o DPO en la información proporcionada. La versión Instruct está optimizada para seguir instrucciones y mantener diálogos multi-turno. El modelo soporta vídeos de más de 20 minutos gracias a su mecanismo de atención con memoria, y procesa texto en múltiples idiomas dentro de las imágenes (OCR multilingüe).

## Capacidades

- Comprensión de imágenes de alta resolución y proporciones arbitrarias, incluyendo documentos escaneados, gráficos, diagramas y fotografías.
- Procesamiento de vídeo de larga duración (más de 20 minutos) para responder preguntas, generar diálogos o crear contenido basado en secuencias visuales.
- OCR multilingüe: extrae texto de imágenes en la mayoría de idiomas europeos, japonés, coreano, árabe, vietnamita, además de inglés y chino.
- Razonamiento visual y matemático: resuelve problemas que requieren interpretar figuras, tablas y ecuaciones (benchmarks como MathVista, DocVQA, ChartQA).
- Capacidad de agente: puede integrarse con dispositivos (móviles, robots) para operar basándose en el entorno visual y las instrucciones de texto.
- Generación de texto conversacional con soporte de múltiples turnos y contexto intercalado de imágenes y texto.
- Soporte de tool calling y function calling (a través del chat template, aunque no se documenta explícitamente en la ficha).
- Compatibilidad con `transformers` y `qwen-vl-utils` para procesar entradas en formato base64, URLs o archivos locales.

## Casos de uso

- Atención al cliente con tickets visuales: el modelo puede analizar capturas de pantalla, fotos de productos o documentos adjuntos en un chat de soporte, extrayendo información relevante y generando respuestas contextualizadas. Su tamaño compacto permite desplegarlo en infraestructura modesta con baja latencia.
- Extracción de datos de facturas y recibos: gracias a su OCR multilingüe y comprensión de documentos, puede automatizar la digitalización de facturas, albaranes o formularios, convirtiéndolos en datos estructurados (JSON, CSV) sin necesidad de un pipeline separado de OCR.
- Asistente de accesibilidad para personas con discapacidad visual: integrado en una aplicación móvil, describe escenas, lee textos de carteles o etiquetas, y responde preguntas sobre el entorno capturado por la cámara.
- Moderación de contenido visual: clasifica imágenes o fotogramas de vídeo para detectar contenido inapropiado (violencia, desnudos, texto ofensivo) en plataformas sociales, con capacidad de procesar vídeos largos de forma segmentada.
- Generación de descripciones y subtítulos para vídeo: el modelo puede resumir vídeos largos (por ejemplo, conferencias, tutoriales) y generar subtítulos o resúmenes textuales, útil para plataformas de contenido educativo.
- Automatización de pruebas de interfaz de usuario (UI testing): con su capacidad de agente, el modelo puede observar capturas de pantalla de una aplicación, seguir instrucciones de navegación y verificar que los elementos de la interfaz se renderizan correctamente, integrándose en pipelines de CI/CD.
- Análisis de imágenes médicas básicas (radiografías, ecografías) como apoyo a personal no especializado, siempre con supervisión humana, describiendo hallazgos visibles y generando informes preliminares.

## Benchmarks y rendimiento

La model card original del modelo Qwen2-VL-2B-Instruct reporta los siguientes resultados en benchmarks de imagen y vídeo, comparados con modelos similares de tamaño comparable:

| Benchmark | InternVL2-2B | MiniCPM-V 2.0 | Qwen2-VL-2B |
| :--- | :---: | :---: | :---: |
| MMMU<sub>val</sub> | 36.3 | 38.2 | **41.1** |
| DocVQA<sub>test</sub> | 86.9 | - | **90.1** |
| InfoVQA<sub>test</sub> | 58.9 | - | **65.5** |
| ChartQA<sub>test</sub> | **76.2** | - | 73.5 |
| TextVQA<sub>val</sub> | 73.4 | - | **79.7** |
| OCRBench | 781 | 605 | **794** |
| MTVQA | - | - | **20.0** |
| VCR<sub>en easy</sub> | - | - | **81.45** |
| VCR<sub>zh easy</sub> | - | - | **46.16** |
| RealWorldQA | 57.3 | 55.8 | **62.9** |
| MME<sub>sum</sub> | **1876.8** | 1808.6 | 1872.0 |
| MMBench-EN<sub>test</sub> | 73.2 | 69.1 | **74.9** |
| MMBench-CN<sub>test</sub> | 70.9 | 66.5 | **73.5** |
| MMBench-V1.1<sub>test</sub> | 69.6 | 65.8 | **72.2** |
| MMT-Bench<sub>test</sub> | - | - | **54.5** |
| MMStar | **49.8** | 39.1 | 48.0 |
| MMVet<sub>GPT-4-Turbo</sub> | 39.7 | 41.0 | **49.5** |
| HallBench<sub>avg</sub> | 38.0 | 36.1 | **41.7** |
| MathVista<sub>testmini</sub> | **46.0** | 39.8 | 43.0 |
| MathVision | - | - | **12.4** |

Benchmarks de vídeo (solo Qwen2-VL-2B):

| Benchmark | Qwen2-VL-2B |
| :--- | :---: |
| MVBench | **63.2** |
| PerceptionTest<sub>test</sub> | **53.9** |
| EgoSchema<sub>test</sub> | **54.9** |
| Video-MME<sub>wo/w subs</sub> | **55.6**/**60.4** |

## Requisitos de hardware

- El tamaño de los pesos en safetensors es de 4,4 GB (2 shards), lo que implica un requisito mínimo de VRAM de aproximadamente 6 GB para inferencia en bfloat16 (pesos + overhead de activaciones y KV cache). Para FP32 serían necesarios unos 8,8 GB.
- GPU recomendadas: tarjetas consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070, etc.) pueden ejecutar el modelo en bf16 con contexto corto. Para vídeo largo o múltiples imágenes simultáneas, se recomienda 12 GB o más (RTX 3080, RTX 4070 Ti, etc.).
- En hardware profesional, una A100 40GB o H100 permite ejecutar el modelo con amplio margen y procesar lote de varias imágenes o vídeos largos.
- Opciones de despliegue: compatible con `transformers` (con `flash_attention_2` para aceleración), `vLLM` (soporte nativo para modelos Qwen2-VL), `TGI` (Text Generation Inference), y `llama.cpp` si se convierten los pesos a GGUF (aunque no se proporcionan en este repo).
- Latencia estimada: en una GPU consumer (RTX 3090), la generación de una respuesta corta con una imagen tarda entre 0,5 y 2 segundos, dependiendo del número de tokens visuales y la longitud de la respuesta. El throughput en bf16 puede alcanzar 30-50 tokens/segundo en generación de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntos fuertes |
| :--- | :---: | :---: | :---: | :--- |
| Qwen2-VL-2B | 2,2B | 32k (no confirmado en este repo) | Apache 2.0 | Mejor rendimiento general en benchmarks de imagen y vídeo, OCR multilingüe, resolución dinámica |
| InternVL2-2B | 2,2B | 32k (no confirmado) | MIT | Mejor en ChartQA, MMStar y MathVista; buen equilibrio en tareas de documento |
| MiniCPM-V 2.0 | 2,8B | 32k (no confirmado) | Apache 2.0 | Competitivo en MMMU y MME, pero inferior en OCR y comprensión de vídeo |

No se dispone de datos comparativos de latencia o consumo de memoria en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede alucinar contenido visual: puede describir objetos o texto que no existen en la imagen, especialmente en imágenes de baja resolución o muy complejas. Se recomienda validación humana en aplicaciones críticas.
- Sesgos potenciales: al estar entrenado principalmente con datos en inglés y chino, puede mostrar menor precisión en idiomas minoritarios o variantes dialectales, tanto en texto como en OCR.
- Limitaciones de contexto: aunque el modelo original soporta 32k tokens, este repo no documenta la ventana exacta. En la práctica, el procesamiento de vídeos largos o muchas imágenes simultáneas puede agotar rápidamente la memoria de la GPU.
- Riesgo de uso indebido: su capacidad de agente (control de dispositivos) podría utilizarse para automatizar acciones maliciosas si se integra sin salvaguardas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede incorporar datos de entrenamiento con derechos de autor; el usuario es responsable de verificar el cumplimiento legal en su jurisdicción.
- No se proporcionan garantías de soporte o mantenimiento para este mirror específico (`zhf026`); se recomienda usar el repositorio oficial `Qwen/Qwen2-VL-2B-Instruct` para producción.

## Enlaces

- Repositorio del mirror: https://huggingface.co/zhf026/Qwen2-VL-2B-Instruct
- Modelo original: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Blog oficial de Qwen2-VL: https://qwenlm.github.io/blog/qwen2-vl/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2-VL
- Paper (arXiv 2409.12191): https://arxiv.org/abs/2409.12191
- Paper relacionado (arXiv 2308.12966): https://arxiv.org/abs/2308.12966
- Herramienta de procesamiento de vídeo: https://pypi.org/project/qwen-vl-utils/
