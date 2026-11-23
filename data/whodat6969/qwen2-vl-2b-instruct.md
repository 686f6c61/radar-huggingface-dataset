# whodat6969/Qwen2-VL-2B-Instruct

## Resumen

Qwen2-VL-2B-Instruct es la variante de 2.209 millones de parámetros del modelo multimodal Qwen2-VL desarrollado por el equipo Qwen de Alibaba. Este repositorio concreto (`whodat6969/Qwen2-VL-2B-Instruct`) es una réplica del checkpoint oficial `Qwen/Qwen2-VL-2B`, publicado bajo licencia Apache 2.0 y distribuido en formato safetensors para su uso con la librería transformers. Resuelve la tarea de image-text-to-text: comprensión conjunta de imágenes, vídeos y texto con salida conversacional.

La relevancia del modelo radica en su relación capacidad/tamaño: con solo 2B de parámetros alcanza resultados competitivos frente a modelos multimodales mayores en benchmarks de OCR, documentos y comprensión visual general. Incorpora dos innovaciones arquitectónicas destacables: resolución dinámica nativa (Naive Dynamic Resolution), que mapea imágenes de cualquier resolución y relación de aspecto a un número variable de tokens visuales, y Multimodal Rotary Position Embedding (M-ROPE), que descompone el embedding posicional en componentes 1D (texto), 2D (imagen) y 3D (vídeo).

El modelo está pensado para despliegues con recursos limitados, incluyendo GPUs de consumo, y sirve como base para fine-tuning multimodal. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL): vision encoder + LLM Qwen2, con Naive Dynamic Resolution y M-ROPE |
| Parámetros totales | 2.208.985.600 (≈2,21B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2-VL soporta contexto largo y vídeos de más de 20 minutos según la model card) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas en este repo) |
| Idiomas soportados | en (etiqueta oficial del repo); la model card indica comprensión multilingüe de texto en imágenes (inglés, chino y la mayoría de lenguas europeas, japonés, coreano, árabe, vietnamita) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2-VL combina un codificador visual con un modelo de lenguaje Qwen2 en un transformer multimodal. La innovación principal es la resolución dinámica nativa: en lugar de redimensionar las imágenes a una resolución fija, el modelo las procesa a su resolución original y las mapea a un número dinámico de tokens visuales (rango por defecto de 4 a 16.384 tokens por imagen, configurable mediante `min_pixels` y `max_pixels`). Esto mejora el rendimiento en documentos, gráficos y texto en imagen. El M-ROPE descompone el embedding posicional rotatorio en partes que capturan posiciones 1D (secuencias de texto), 2D (parches de imagen) y 3D (frames de vídeo), lo que permite manejar de forma coherente las tres modalidades.

El modelo es la variante instruction-tuned de la familia Qwen2-VL (2B, 7B y 72B). La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en esta variante de 2B; estos datos no están disponibles en la documentación proporcionada. La model card menciona la capacidad de comprender vídeos de más de 20 minutos y de actuar como agente para operar dispositivos móviles y robots a partir de instrucciones visuales y textuales.

## Capacidades

- Generación de texto conversacional multi-turno condicionada por imágenes y vídeos.
- Comprensión de imágenes de resolución y relación de aspecto arbitrarias mediante resolución dinámica nativa.
- OCR y comprensión de documentos, gráficos e infografías (DocVQA, InfoVQA, ChartQA, OCRBench).
- Razonamiento visual y matemático sobre imágenes (MathVista, MathVision).
- Comprensión de vídeo de larga duración (más de 20 minutos) para question answering y diálogo.
- Capacidad de agente: razonamiento complejo y toma de decisiones para operar móviles, robots y otros dispositivos a partir del entorno visual.
- Comprensión multilingüe de texto dentro de imágenes (inglés, chino, lenguas europeas, japonés, coreano, árabe, vietnamita).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito, audio o visión 3D más allá del vídeo: no disponible.

## Casos de uso

- Digitalización de documentos y facturas: el modelo procesa documentos a resolución nativa y extrae texto y campos estructurados, aprovechando sus resultados en DocVQA (90,1) e InfoVQA (65,5) con solo 2B de parámetros.
- Análisis de gráficos e informes financieros: con ChartQA (73,5) y resolución dinámica, puede responder preguntas sobre ejes, tendencias y valores en gráficas sin preprocesado agresivo de la imagen.
- Accesibilidad: descripción automática de imágenes y vídeos para usuarios con discapacidad visual, incluyendo vídeos largos gracias a su capacidad de comprensión de secuencias de más de 20 minutos.
- Automatización de atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario adjunta capturas de pantalla, fotos de productos o recibos, con el modelo respondiendo en contexto.
- Agentes de automatización de interfaz: integración en sistemas que interpretan la pantalla de un móvil o robot y ejecutan instrucciones de texto, usando la capacidad de razonamiento visual del modelo.
- Moderación de contenido visual: clasificación y descripción de imágenes y vídeos en pipelines de revisión, desplegable en GPU de consumo por su tamaño de 2B.
- Prototipado e investigación en multimodal: base ligera para fine-tuning con Apache 2.0, útil para experimentar con resolución dinámica y M-ROPE sin grandes presupuestos de cómputo.
- Extracción de información de vídeo: resumen y question answering sobre grabaciones largas (MVBench 63,2, Video-MME 60,4 con subtítulos).

## Benchmarks y rendimiento

Resultados publicados en la model card para Qwen2-VL-2B frente a InternVL2-2B y MiniCPM-V 2.0:

| Benchmark | InternVL2-2B | MiniCPM-V 2.0 | Qwen2-VL-2B |
|---|---|---|---|
| MMMU (val) | 36,3 | 38,2 | 41,1 |
| DocVQA (test) | 86,9 | - | 90,1 |
| InfoVQA (test) | 58,9 | - | 65,5 |
| ChartQA (test) | 76,2 | - | 73,5 |
| TextVQA (val) | 73,4 | - | 79,7 |
| OCRBench | 781 | 605 | 794 |
| MTVQA | - | - | 20,0 |
| VCR (en easy) | - | - | 81,45 |
| VCR (zh easy) | - | - | 46,16 |
| RealWorldQA | 57,3 | 55,8 | 62,9 |
| MME (sum) | 1876,8 | 1808,6 | 1872,0 |
| MMBench-EN (test) | 73,2 | 69,1 | 74,9 |
| MMBench-CN (test) | 70,9 | 66,5 | 73,5 |
| MMBench-V1.1 (test) | 69,6 | 65,8 | 72,2 |
| MMT-Bench (test) | - | - | 54,5 |
| MMStar | 49,8 | 39,1 | 48,0 |
| MMVet (GPT-4-Turbo) | 39,7 | 41,0 | 49,5 |
| HallBench (avg) | 38,0 | 36,1 | 41,7 |
| MathVista (testmini) | 46,0 | 39,8 | 43,0 |
| MathVision | - | - | 12,4 |

Benchmarks de vídeo de Qwen2-VL-2B:

| Benchmark | Qwen2-VL-2B |
|---|---|
| MVBench | 63,2 |
| PerceptionTest (test) | 53,9 |
| EgoSchema (test) | 54,9 |
| Video-MME (sin/con subtítulos) | 55,6 / 60,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,5-5 GB para los pesos (2,21B parámetros) más overhead de activaciones y tokens visuales; el repo ocupa 4,4 GB en safetensors.
- En cuantización de 8 bits: alrededor de 2,5-3 GB de VRAM; en 4 bits: aproximadamente 1,5-2 GB (estimaciones según tamaño, no publicadas oficialmente para este checkpoint).
- GPU recomendadas: A100, H100, L40S para despliegue en producción con concurrencia; RTX 4090, RTX 3090, RTX 4080 para desarrollo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 3070); con cuantización de 4 bits puede caber en GPUs de 6 GB.
- Opciones de despliegue: transformers (requiere versión reciente con soporte `qwen2_vl`), `qwen-vl-utils` para preprocesado, text-generation-inference (el repo está etiquetado como endpoints_compatible), vLLM con soporte Qwen2-VL; llama.cpp/Ollama solo si existen conversiones GGUF, no listadas en este repo.
- Latencia y throughput: no disponibles en la información proporcionada. El coste depende fuertemente del número de tokens visuales, configurable entre 4 y 16.384 por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMMU (val) | DocVQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2-VL-2B-Instruct | 2,21B | no disponible | 41,1 | 90,1 | Apache 2.0 | Hugging Face (este repo y oficial) |
| InternVL2-2B | ~2B | no disponible | 36,3 | 86,9 | no disponible en la información | Hugging Face |
| MiniCPM-V 2.0 | ~2,8B | no disponible | 38,2 | - | no disponible en la información | Hugging Face |
| Qwen3-VL-2B-Instruct | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado como `new_version` en la model card) |

Qwen2-VL-2B supera a InternVL2-2B en la mayoría de benchmarks visuales de la tabla (MMMU, DocVQA, InfoVQA, TextVQA, OCRBench, RealWorldQA, MMBench, MMVet, HallBench), aunque queda por detrás en ChartQA, MME sum, MMStar y MathVista. La model card referencia Qwen3-VL-2B-Instruct como versión sucesora.

## Limitaciones y advertencias

- Este repositorio concreto es una réplica no oficial del checkpoint de Qwen; para producción se recomienda usar `Qwen/Qwen2-VL-2B-Instruct` como fuente canónica.
- Idiomas: la etiqueta oficial del repo es solo `en`, aunque la model card indica comprensión multilingüe de texto en imágenes; el rendimiento en generación de texto fuera del inglés no está garantizado.
- Riesgo de alucinación en descripciones de imágenes y OCR, especialmente con resoluciones bajas o texto pequeño; el benchmark HallBench de 41,7 indica margen de mejora en fidelidad.
- MathVision de 12,4 y MTVQA de 20,0 reflejan debilidad en razonamiento matemático visual complejo y en comprensión multilingüe de texto en imagen.
- Contexto máximo exacto no documentado en la información disponible; el número de tokens visuales por imagen (4-16.384) consume ventana de contexto y puede degradar el rendimiento si no se ajusta `min_pixels`/`max_pixels`.
- Requiere transformers reciente o instalación desde el repositorio de GitHub; versiones antiguas fallan con `KeyError: 'qwen2_vl'`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales de Qwen.
- Sin datos publicados de sesgos específicos, throughput o latencia en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/whodat6969/Qwen2-VL-2B-Instruct
- Modelo base oficial: https://huggingface.co/Qwen/Qwen2-VL-2B
- Modelo sucesor referenciado: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Blog de Qwen2-VL: https://qwenlm.github.io/blog/qwen2-vl/
- GitHub de Qwen2-VL: https://github.com/QwenLM/Qwen2-VL
- Chat de Qwen: https://chat.qwenlm.ai/
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
