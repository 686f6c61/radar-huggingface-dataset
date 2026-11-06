# webmp3/Sakura-Xiaomi-OCR-0-GGUF

## Resumen

Sakura-Xiaomi-OCR-0-GGUF es una recuantización comunitaria en formato GGUF del modelo Xiaomi-OCR-0 desarrollado por Xiaomi Research. Se trata de un modelo multimodal especializado en OCR (reconocimiento óptico de caracteres) que combina un backbone de lenguaje con un proyector visual, lo que le permite procesar imágenes y extraer texto de ellas. Esta release, publicada por el usuario webmp3 bajo el paraguas "Sakura", ofrece cuatro niveles de cuantización con matriz de importancia (imatrix) para facilitar el despliegue en hardware modesto mediante llama.cpp.

El modelo base cuenta con 752.393.024 parámetros totales (aproximadamente 752 millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para tareas específicas. La arquitectura declarada es `qwen35`, lo que sugiere una variante derivada de la familia Qwen. El repositorio ocupa 2,2 GB e incluye los ficheros cuantizados junto con el proyector visual en BF16.

La relevancia de esta ficha radica en que permite ejecutar un modelo de OCR multimodal en hardware de consumo, con cuantizaciones que van desde 0,4 GB (Q2_K) hasta 0,6 GB (Q5_K_M), manteniendo una fidelidad razonable respecto al original BF16 según las métricas de perplejidad y divergencia KL reportadas por el autor de la cuantización. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (transformer multimodal con proyector visual) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (con imatrix); proyector visual en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, lo que indica una variante de la familia Qwen adaptada para tareas multimodales de OCR. El modelo combina un backbone de lenguaje con un proyector visual (`mmproj`) que transforma las representaciones de imagen en tokens que el modelo de lenguaje puede procesar. El modelo base original fue desarrollado por Xiaomi Research y publicado en formato safetensors; esta release parte de una conversión intermedia a GGUF en BF16 (prithivMLmods/Xiaomi-OCR-0-GGUF) y aplica recuantización sobre ella.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La cuantización se realizó con las herramientas estándar de llama.cpp (`llama-imatrix` y `llama-quantize --imatrix`) usando una matriz de importancia calculada a partir de un texto de calibración fijo de 6144 bytes con contenido en inglés, alemán y chino, código y formatos de datos (11 fragmentos de 128 tokens). El autor advierte que el texto de calibración es corto y no se reclama mejora de calidad sin benchmark.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, incluyendo texto en inglés y chino.
- Procesamiento multimodal: acepta entrada de imagen junto con prompt de texto mediante el proyector visual `mmproj`.
- Generación de texto descriptivo a partir de imágenes ("Describe this image").
- Soporte de conversación multi-turno (tag `conversational` en Hugging Face).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino según los tags del repositorio.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada (solo se confirma visión vía proyector).

## Casos de uso

- Digitalización de documentos en inglés y chino: el modelo puede procesar imágenes de páginas escaneadas y extraer el texto contenido, adecuado para pipelines de archivo y gestión documental gracias a su tamaño reducido que permite ejecución local.
- Extracción de texto en aplicaciones móviles o de escritorio: con cuantizaciones de 0,4-0,6 GB, puede integrarse en aplicaciones de captura de texto mediante cámara sin depender de servicios en la nube.
- Procesamiento de facturas y recibos: el modelo puede leer texto impreso en imágenes y devolverlo como texto plano, útil en automatización contable con despliegue en hardware de consumo.
- Accesibilidad: conversión de imágenes con texto a voz o texto legible para personas con discapacidad visual, ejecutándose localmente en equipos modestos.
- Preprocesamiento en pipelines de RAG: extracción de texto de imágenes para alimentar bases de conocimiento vectoriales, usando llama.cpp para integración ligera.
- Análisis de capturas de pantalla y documentos técnicos: descripción de imágenes y extracción de contenido textual en entornos de soporte técnico o documentación.
- Prototipado e investigación en OCR multimodal: al ser un modelo pequeño con licencia Apache 2.0, sirve como base para experimentación y fine-tuning en tareas específicas de reconocimiento de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor de la cuantización proporciona métricas de fidelidad respecto al BF16 original medidas con `llama-perplexity` sobre dos textos de dominio público (inglés: *Pride and Prejudice*; chino: *Hongloumeng*; 64 ventanas de 512 tokens). La perplejidad del BF16 original en este texto es 166,304.

| Cuantizacion | Perplejidad | Ratio vs. original | KL divergencia media | Mismo token top |
|---|---:|---:|---:|---:|
| Q2_K | 215,302 | 1,2946 ± 0,0200 | 0,42767 | 54,46 % |
| Q3_K_M | 169,899 | 1,0216 ± 0,0086 | 0,12704 | 72,68 % |
| Q4_K_M | 171,040 | 1,0285 ± 0,0047 | 0,03562 | 84,94 % |
| Q5_K_M | 170,568 | 1,0256 ± 0,0026 | 0,01284 | 90,62 % |

Estas métricas describen únicamente la concordancia con el original en esos textos y no constituyen benchmarks de tarea ni dicen nada sobre otros idiomas o tareas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos cuantizados (0,4-0,6 GB) más el proyector visual (0,2 GB); con overhead de contexto y runtime, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para imágenes), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, etc.) siempre que soporte la arquitectura `qwen35` y el proyector multimodal.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos de OCR multimodal en la información proporcionada, por lo que la comparación se limita a aspectos estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sakura-Xiaomi-OCR-0 (esta ficha) | 752 M | no disponible | en, zh | Apache 2.0 | GGUF |
| Xiaomi-OCR-0 (base original) | 752 M | no disponible | en, zh | Apache 2.0 | safetensors / GGUF BF16 |
| Alternativas de OCR multimodal de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en OCR: no está diseñado como modelo de propósito general; su rendimiento en tareas de razonamiento, código o matemáticas no está documentado y probablemente sea limitado dado su tamaño.
- Idiomas limitados a inglés y chino según los tags; no se garantiza soporte de otros idiomas, incluido el castellano.
- La entrada de imagen no ha sido probada en esta release concreta según el autor ("Image input has not been tested for this release").
- La cuantización Q2_K muestra una degradación notable (ratio de perplejidad 1,29, solo 54,46 % de mismo token top); no se recomienda para producción.
- El texto de calibración para la imatrix es corto (6144 bytes); el autor no reclama mejora de calidad sin benchmark.
- Riesgo de alucinación: no documentado específicamente, pero inherente a modelos de lenguaje pequeños; en OCR puede traducirse en texto inventado en imágenes de baja calidad.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales (Xiaomi Research) y respetar los términos del modelo base.
- Esta es una cuantización comunitaria independiente, no una release oficial de Xiaomi Research; la responsabilidad sobre la calidad de la cuantización recae en el autor de la misma.
- Requiere una build de llama.cpp que soporte la arquitectura `qwen35`; versiones antiguas pueden no cargar el modelo.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/webmp3/Sakura-Xiaomi-OCR-0-GGUF
- Modelo base original: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Repositorio GGUF intermedio del que se parte: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- Model card del commit de referencia: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF/blob/7bbfa072e0f3d70ac722e26fbccef5b9f64b7121/README.md
