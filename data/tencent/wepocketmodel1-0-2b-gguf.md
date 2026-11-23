# tencent/WePocketModel1.0-2B-GGUF

## Resumen

WePocketModel 1.0 2B GGUF es la versión cuantizada para CPU de WePocketModel 1.0 2B, un modelo de visión-lenguaje desarrollado por WeChat AI (Tencent) para aplicaciones en dispositivo (*on-device*). El modelo se construye sobre el *backbone* de Qwen3.5-2B y añade un codificador visual, de modo que un único modelo cubre tres capacidades: generación multimodal (texto, imagen e intercalado), *embeddings* multimodales y decisiones estructuradas sobre el estado de una aplicación.

La familia WePocketModel se distribuye en variantes de 2B y 4B, en formato Safetensors y GGUF. Esta ficha corresponde al checkpoint de 2B en GGUF, con unos 1.882 millones de parámetros en el fichero de pesos y una dimensión de *embedding* completa de 2.048. El paquete se divide en pesos de lenguaje (Q4_K_M por defecto o BF16) y un fichero compartido `multimodal-BF16.gguf` que contiene visión y tareas.

Su relevancia actual radica en el enfoque de "tres capacidades en un solo modelo" para entornos locales sin GPU: recuperación multimodal, generación y decisión estructurada comparten *backbone*, lo que reduce el coste de despliegue en movilidad y en dispositivos de borde. La licencia del código es Apache 2.0, mientras que la de los pesos figura como pendiente de confirmación en la model card, un punto crítico para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Qwen3.5-2B + codificador visual); familia qwen3_5 |
| Parametros totales | 1.881.825.088 (2B); la model card cita 2,23 mil millones de parámetros para el modelo completo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (lenguaje) y BF16; vision y tareas en BF16, computadas en FP32 por el runtime |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (código); pesos con licencia pendiente de confirmación según la model card |
| Formato de pesos | GGUF (`language-Q4_K_M.gguf`, `language-BF16.gguf`, `multimodal-BF16.gguf`) |

## Arquitectura y entrenamiento

WePocketModel emplea un *backbone* de lenguaje compartido (Qwen3.5-2B) más un codificador visual, con una única torre que da servicio a tres tareas: generación, *embedding* y decisión. La generación acepta texto, imágenes o secuencias intercaladas para OCR, *captioning* y VQA. La parte de *embedding* proyecta texto e imágenes a vectores L2-normalizados con soporte de Matryoshka Representation Learning (MRL), lo que permite truncar la dimensión a 64, 128, 256, 512, 1.024 o 2.048. La parte de decisión evalúa el estado de la aplicación y devuelve opciones estructuradas, puntuaciones ordinales o juicios binarios.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El runtime GGUF se construye sobre una revisión fijada de llama.cpp (`libwepm_gguf`) y ejecuta en CPU, con los tensores de visión y tarea en BF16 y cálculo en FP32.

## Capacidades

- Generación de texto a partir de texto, imagen o secuencias intercaladas texto-imagen.
- OCR, *image captioning* y respuesta a preguntas visuales (VQA).
- *Embeddings* multimodales L2-normalizados para recuperación y ranking de candidatos.
- *Embeddings* Matryoshka con dimensiones seleccionables de 64 a 2.048.
- Decisión estructurada: devuelve opciones, puntuaciones ordinales o juicios binarios sobre el estado de una aplicación.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con *endpoints* (etiqueta `endpoints_compatible`).
- Ejecución en CPU mediante runtime propio basado en llama.cpp.
- Soporte de *tool calling* / *function calling*: no disponible en la información.
- Capacidades de agente multi-paso: no disponible en la información.
- Idiomas soportados: no disponible en la información.

## Casos de uso

- Recuperación multimodal en dispositivo: indexar imágenes y texto como vectores con MRL permite ajustar la dimensión (por ejemplo, 256) al presupuesto de memoria del dispositivo y hacer búsqueda por similitud local sin enviar datos a la nube.
- Clasificación y ranking de candidatos visuales: usar la salida de *embedding* para ordenar resultados de una galería o catálogo, aprovechando la normalización L2 y el truncado de dimensiones.
- Decisión estructurada en asistentes: el modelo evalúa el estado de la aplicación y devuelve una opción o un juicio binario, útil para enrutar acciones en flujos de UI conversacional.
- OCR y extracción de texto en movilidad: la generación con entrada de imagen permite digitalizar documentos y carteles en el propio dispositivo, sin GPU.
- Descripción automática de imágenes para accesibilidad: generar *captions* de fotos localmente para lectores de pantalla en aplicaciones móviles.
- VQA en asistentes de producto: responder preguntas sobre una imagen (por ejemplo, características de un artículo) combinando generación y contexto conversacional.
- Despliegue en CPU de bajo consumo: el paquete Q4_K_M (1,98 GB) cabe en dispositivos con poca memoria y se ejecuta con el runtime `libwepm_gguf`, adecuado para entornos sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen comparativa de la familia WePocketModel en tareas de *embedding*, generación y decisión, pero no se proporcionan cifras numéricas en el texto.

## Requisitos de hardware

- Inferencia en CPU: el runtime `libwepm_gguf` está diseñado para ejecución en CPU, no requiere GPU.
- Huella en disco: Q4_K_M combinado 1,98 GB; BF16 combinado 4,48 GB (tamaños decimales de los dos ficheros de pesos).
- Memoria: no se publica una cifra de RAM mínima; el tamaño de los pesos Q4_K_M sugiere un requisito del orden de 2 GB más el *overhead* del runtime, dato no confirmado.
- GPU recomendadas: no aplica; la versión es específica para CPU.
- Cabe en GPU de consumo: la variante es CPU; no se documenta despliegue en GPU para este paquete GGUF.
- Opciones de despliegue: runtime propio `libwepm_gguf` (basado en una revisión fijada de llama.cpp), con scripts de ejemplo en `examples/cpu/generation`, `examples/cpu/embedding` y `examples/cpu/decision`.
- Latencia y throughput: no disponibles.
- Entorno de compilación: Python 3.10–3.13, Git, CMake 3.20 o superior y compilador C++17.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| WePocketModel 1.0 2B GGUF | 1,88B (2,23B según model card) | no disponible | Texto + imagen; generación, embedding y decisión | apache-2.0 (código); pesos pendientes | GGUF (Q4_K_M, BF16) |
| WePocketModel 1.0 4B | no disponible | no disponible | Texto + imagen; generación, embedding y decisión | no disponible | Safetensors y GGUF |
| Qwen3.5-2B (modelo base) | 2B (aprox.) | no disponible | Texto | no disponible | Safetensors |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia de los pesos figura como "pendiente de confirmación" en la model card; el uso comercial debe verificarse antes de desplegar.
- No se documentan sesgos conocidos, pero al ser un modelo multimodal entrenado sobre datos no especificados, pueden aparecer sesgos visuales y culturales.
- Riesgo de alucinación en generación y en VQA; la model card recomienda validar las decisiones estructuradas antes de usarlas para disparar acciones.
- No se especifican idiomas soportados ni cobertura multilingüe; el rendimiento fuera del inglés (o de los idiomas de entrenamiento) es desconocido.
- Longitud de contexto no publicada; planificar despliegues con contexto largo requiere validación empírica.
- El paquete GGUF está orientado a CPU; no se documenta soporte GPU para esta variante.
- La build requiere acceso a un repositorio de GitHub y descarga de una revisión fijada de llama.cpp; puede haber fricción en entornos restringidos.
- La cuantización Q4_K_M solo afecta al *backbone* de lenguaje; visión y tareas permanecen en BF16, lo que limita la reducción total de memoria.

## Enlaces

- Hugging Face (GGUF 2B): https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Hugging Face (Safetensors 2B): https://huggingface.co/tencent/WePocketModel1.0-2B
- Hugging Face (Safetensors 4B): https://huggingface.co/tencent/WePocketModel1.0-4B
- Hugging Face (GGUF 4B): https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- Guía de inferencia GGUF en CPU: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md#gguf-on-cpu
- Licencia del código: https://github.com/Tencent/WePocketModel/blob/main/LICENSE
