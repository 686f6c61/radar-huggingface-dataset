# tencent/WePocketModel1.0-2B-GGUF

## Resumen

WePocketModel 1.0 2B GGUF (WePM) es la versión cuantizada en formato GGUF para CPU de un modelo vision-lenguaje de la familia WePocketModel, desarrollada por WeChat AI (Tencent). El modelo parte del checkpoint base Qwen/Qwen3.5-2B y se distribuye como un paquete que combina pesos de lenguaje cuantizados o en BF16 con un fichero compartido `multimodal-BF16.gguf` que contiene el codificador visual y las cabezas de tarea. Está pensado para aplicaciones locales en dispositivo (*on-device*), sin necesidad de GPU.

La característica diferencial es que un único backbone y un único codificador visual soportan tres capacidades: generación de texto (a partir de texto, imagen o secuencias intercaladas), *embedding* multimodal L2-normalizado para recuperación y ranking, y decisión estructurada (opciones discretas, puntuaciones ordinales o juicios binarios). Los embeddings admiten Matryoshka Representation Learning (MRL), con dimensiones seleccionables de 64, 128, 256, 512, 1.024 o 2.048.

El modelo declara 2,23 mil millones de parámetros según la model card (el dato de safetensors del repo indica 1.881.825.088), una dimensión de embedding de 2.048 y licencia Apache 2.0. Su relevancia actual reside en unificar recuperación, generación y decisión en un solo artefacto ejecutable en CPU con un peso combinado de 1,98 GB en Q4_K_M, lo que facilita su integración en aplicaciones de escritorio y móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con backbone transformer (base Qwen3.5-2B) y codificador visual compartido; tres cabezas de tarea (generación, embedding, decisión) |
| Parámetros totales | 2,23 mil millones según model card; 1.881.825.088 según safetensors del repo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (backbone de lenguaje) y BF16; tensores de visión y tarea en BF16, computados en FP32 por el runtime |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros `language-Q4_K_M.gguf` o `language-BF16.gguf` más `multimodal-BF16.gguf`) |

## Arquitectura y entrenamiento

WePocketModel emplea un backbone de lenguaje derivado de Qwen3.5-2B y un codificador visual compartido, con un diseño de tres tareas sobre la misma representación: generación autorregresiva de texto, proyección a embeddings multimodales L2-normalizados y una cabeza de decisión estructurada que devuelve elecciones, puntuaciones ordinales o juicios binarios. La dimensión completa de embedding es 2.048 y se soporta MRL, de modo que el runtime normaliza el prefijo seleccionado de la proyección para obtener vectores de 64 a 2.048 dimensiones.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Sí se especifica que la versión GGUF se convierte desde el checkpoint safetensors de 2B y que el runtime de CPU se construye sobre una revisión fijada de llama.cpp, empaquetada como `libwepm_gguf`. Los tensores de visión y de tarea se almacenan en BF16 y se computan en FP32 en CPU, mientras que solo el backbone de lenguaje se cuantiza en Q4_K_M.

## Capacidades

- Generación de texto condicionada por texto, imagen o secuencias intercaladas de texto e imagen.
- OCR, descripción de imágenes (*image captioning*) y respuesta a preguntas visuales (VQA).
- Embeddings multimodales L2-normalizados para recuperación y ranking de candidatos.
- Embeddings Matryoshka (MRL) con dimensiones de 64, 128, 256, 512, 1.024 y 2.048.
- Decisión estructurada: devuelve opciones discretas, puntuaciones ordinales o juicios binarios a partir del estado de la aplicación y una pregunta.
- Ejecución en CPU mediante runtime propio basado en llama.cpp, sin GPU.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con *endpoints* (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda visual y recuperación multimodal local: indexar imágenes y texto con embeddings MRL de 256 o 512 dimensiones para un índice ligero y reordenar candidatos con la dimensión completa de 2.048, todo en CPU.
- Asistentes de escritorio con OCR: extraer texto de capturas o documentos escaneados y responder preguntas sobre ellos sin enviar datos a la nube, gracias al paquete de 1,98 GB en Q4_K_M.
- Clasificación y enrutamiento de tickets: usar la cabeza de decisión para asignar categorías discretas o puntuaciones ordinales de prioridad sobre el estado de la aplicación.
- Moderación y validación binaria: aplicar juicios binarios estructurados sobre contenido de texto e imagen antes de desencadenar acciones, con la advertencia de validar las decisiones en producción.
- Descripción automática de imágenes en aplicaciones móviles o de escritorio: generar pies de foto y respuestas VQA en el dispositivo con el runtime de CPU.
- Deduplicación y agrupación de contenidos: calcular embeddings de texto e imagen y agrupar por similitud coseno con vectores truncados para reducir memoria.
- Filtrado previo en pipelines RAG: usar el modelo como recuperador y reordenador multimodal local antes de invocar un modelo generativo mayor.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de resultados de la familia WePM en tareas de embedding, generación y decisión (`assets/wepm_single_results.png`), pero no se proporcionan cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU; no requiere GPU.
- VRAM estimada: no aplica (ejecución en CPU). Memoria RAM aproximada según el paquete: en torno a 2 GB para Q4_K_M (1,98 GB de pesos) y en torno a 4,5 GB para BF16 (4,48 GB de pesos), más el *overhead* del runtime y del contexto.
- GPU recomendadas: no aplica para esta release; el runtime documentado es de CPU.
- ¿Cabe en GPU de consumo? La release está orientada a CPU; el soporte GPU no se documenta en la información disponible.
- Opciones de despliegue: runtime propio `libwepm_gguf` construido sobre una revisión fijada de llama.cpp, con scripts de ejemplo en `examples/cpu/` (generación, embedding y decisión) y CLI `inference/infer_cpu.py`. Compatibilidad con vLLM, Ollama o TGI: no disponible.
- Requisitos de compilación: Python 3.10–3.13, Git, CMake 3.20 o superior y compilador C++17.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidades | Licencia | Formato |
|---|---|---|---|---|---|
| WePocketModel 1.0 2B GGUF | ~2,23 B (1.881.825.088 según safetensors) | no disponible | Generación + embedding multimodal MRL + decisión estructurada, en CPU | Apache 2.0 | GGUF |
| WePocketModel 1.0 4B | no disponible | no disponible | Misma familia, mayor tamaño | Apache 2.0 | Safetensors / GGUF |
| Qwen3.5-2B (modelo base) | ~2 B | no disponible | Generación de texto | no disponible en la información proporcionada | Safetensors |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte de que los desarrolladores deben evaluar la calidad de salida en entradas representativas y validar las decisiones estructuradas antes de usarlas para desencadenar acciones.
- Riesgo de alucinación en generación: no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; conviene validar el comportamiento multilingüe antes de desplegar.
- Longitud de contexto: no disponible; debe consultarse la guía de inferencia para el tamaño de contexto configurable.
- La cuantización Q4_K_M afecta solo al backbone de lenguaje; los tensores de visión y tarea en BF16 computados en FP32 implican un coste de memoria adicional frente al tamaño del fichero de lenguaje.
- El runtime de CPU está fijado a una revisión concreta de llama.cpp y requiere compilación local; no se documenta compatibilidad con otros motores de inferencia.
- Licencia Apache 2.0 permite uso comercial, pero los componentes de terceros conservan sus licencias originales y deben revisarse.
- El paquete requiere mantener juntos los pesos de lenguaje, `multimodal-BF16.gguf`, `bundle.json`, configuración, tokenizer, processor, plantilla de chat y `runtime_sources/`, verificando los hashes de `SHA256SUMS.txt`.

## Enlaces

- Hugging Face (GGUF 2B): https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Hugging Face (Safetensors 2B): https://huggingface.co/tencent/WePocketModel1.0-2B
- Hugging Face (Safetensors 4B): https://huggingface.co/tencent/WePocketModel1.0-4B
- Hugging Face (GGUF 4B): https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- Guía de inferencia GGUF en CPU: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md#gguf-on-cpu
- Licencia del código: https://github.com/Tencent/WePocketModel/blob/main/LICENSE
- Paper (arXiv): https://arxiv.org/abs/2611.27365
