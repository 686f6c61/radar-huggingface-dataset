# tencent/WePocketModel1.0-2B

## Resumen

WePocketModel 1.0 2B (WePM) es un modelo vision-lenguaje de la familia WePocketModel, desarrollado por WeChat AI (Tencent) para aplicaciones en dispositivo (on-device). Está construido sobre el backbone de Qwen/Qwen3.5-2B y añade un codificador visual, con un total de 2.213.241.664 parámetros (aproximadamente 2,23 mil millones) y unos 4,47 GB de pesos en BF16.

Su rasgo diferencial es que un mismo backbone y un mismo codificador visual cubren tres capacidades: generación multimodal (texto a partir de texto, imágenes o secuencias intercaladas), embedding multimodal con soporte de Matryoshka Representation Learning (MRL) en dimensiones de 64, 128, 256, 512, 1.024 o 2.048, y decisión estructurada (elección entre opciones, puntuaciones ordinales o juicios binarios). Esto lo orienta a aplicaciones locales que combinan recuperación, generación y desambiguación de acciones.

Es relevante porque empaqueta en un modelo de 2B parámetros tareas que habitualmente requieren varios modelos especializados, con licencia Apache 2.0 (si bien la model card indica que la licencia del checkpoint está pendiente de confirmación) y soporte tanto de CUDA como de CPU en su runtime propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje sobre backbone Qwen3.5-2B (familia qwen3_5) con codificador visual y cabeceras auxiliares de embedding y decisión |
| Parametros totales | 2.213.241.664 (~2,23 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en CUDA y FP32 en CPU en el runtime oficial; existe release GGUF (tencent/WePocketModel1.0-2B-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la model card indica que la licencia del checkpoint está pendiente de confirmación) |
| Formato de pesos | safetensors (3 shards más `unimodel_aux.safetensors`); también GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B como backbone de lenguaje y le incorpora un codificador visual compartido, de modo que un único par backbone-encoder atiende generación, embedding y decisión. El checkpoint se distribuye en tres shards de safetensors con índice (`model.safetensors.index.json`) más un fichero auxiliar, `unimodel_aux.safetensors`, que contiene los pesos de presupuesto visual y de tarea, incluidas las cabeceras de embedding y de decisión. El repositorio incluye además configuración, tokenizer, processor, chat template, `runtime_sources/` y metadatos de exportación (`export_complete.json`).

El entrenamiento se presenta en el informe técnico titulado *WePM: Hierarchical Conflict Reconciliation for Unified MLLMs*, que da nombre al mecanismo de reconciliación jerárquica de conflictos entre tareas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica documentada es el uso de MRL para los embeddings multimodales: el runtime normaliza en L2 el prefijo seleccionado de la proyección de embedding, permitiendo truncar de 2.048 a 64 dimensiones sin reentrenar.

## Capacidades

- Generación de texto a partir de texto, imágenes o secuencias intercaladas de texto e imagen.
- OCR y captioning de imágenes.
- Respuesta a preguntas visuales (VQA).
- Embedding multimodal: codifica texto e imágenes en vectores normalizados en L2, con dimensión completa de 2.048 y truncamiento MRL a 64, 128, 256, 512 o 1.024.
- Recuperación y ranking de candidatos mediante esos embeddings.
- Decisión estructurada: devuelve opciones elegidas, puntuaciones ordinales o juicios binarios a partir del estado de la aplicación y una pregunta.
- Ejecución en CUDA y en CPU con el runtime oficial (BF16 en GPU, FP32 en CPU).
- No se documenta en la información disponible soporte explícito de tool calling, modo thinking, audio ni agentes multi-paso.

## Casos de uso

- Recuperación multimodal local: indexar capturas, fotos o documentos escaneados con los embeddings MRL de 256 o 512 dimensiones para un buscador en dispositivo, ajustando la dimensión al presupuesto de memoria y latencia.
- Clasificación y enrutado de consultas: usar la capacidad de decisión para elegir entre un conjunto cerrado de intenciones o acciones antes de invocar lógica de aplicación, validando las salidas estructuradas antes de disparar efectos.
- OCR y extracción de datos de documentos: generar texto a partir de imágenes de tickets, formularios o etiquetas en un flujo local, sin enviar las imágenes a un servicio externo.
- Accesibilidad: describir imágenes y responder preguntas sobre ellas en aplicaciones de asistencia que corren en el propio dispositivo.
- Moderación y juicios binarios: evaluar contenido con la cabecera de decisión para producir veredictos sí/no o puntuaciones ordinales sobre candidatos.
- Reordenación de resultados de búsqueda: combinar el embedding para el recall inicial y la decisión estructurada para el re-ranking final dentro de la misma aplicación.
- Asistencia visual en campo: aplicaciones móviles o de borde que necesitan captioning y VQA sin conexión, apoyándose en la ruta de CPU del runtime.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de la familia WePM en tareas de embedding, generación y decisión, pero no publica los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: aproximadamente 4,47 GB en BF16; el repositorio completo ocupa 4,5 GB.
- VRAM estimada: no disponible de forma oficial; el consumo depende del dispositivo, de las entradas y de la longitud de generación. Como referencia de orden de magnitud, los pesos en BF16 rondan los 4,5 GB, a los que hay que sumar activaciones, caché y el codificador visual.
- GPU recomendadas: no disponible. El runtime oficial se distribuye para CUDA 12.8 con PyTorch 2.10.0 y torchvision 0.25.0, sin lista de GPU validadas.
- GPU de consumo: no confirmado; el tamaño de pesos es compatible con GPUs de consumo con suficiente memoria, pero no hay validación publicada.
- CPU: soportada de forma oficial mediante `inference/infer_cpu.py`, con pesos en FP32 (mayor huella de memoria que en BF16).
- Despliegue: runtime propio de WePM (repositorio Tencent/WePocketModel); existe release GGUF para despliegue con herramientas compatibles. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WePocketModel 1.0 2B | ~2,23 B | no disponible | Generación multimodal, embedding MRL, decisión estructurada | Apache 2.0 (checkpoint pendiente de confirmación) | Safetensors y GGUF en Hugging Face |
| WePocketModel 1.0 4B | no disponible | no disponible | Misma familia, presumiblemente las mismas tres capacidades | no disponible | Safetensors y GGUF en Hugging Face |
| Qwen3.5-2B (modelo base) | ~2 B (no confirmado) | no disponible | Generación de texto | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card indica que la licencia del checkpoint está pendiente de confirmación, pese a la etiqueta apache-2.0; conviene verificar antes de un uso comercial.
- No se documentan los idiomas soportados; el comportamiento multilingüe no está garantizado.
- No se publica la longitud de contexto, lo que impide planificar cargas de contexto largo con garantías.
- Riesgo de alucinación inherente a la generación: la propia model card recomienda evaluar la calidad sobre entradas representativas.
- Las decisiones estructuradas deben validarse antes de disparar acciones; no deben usarse como control directo sin comprobaciones.
- No hay información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- El despliegue requiere el runtime propio del proyecto; no se confirma compatibilidad con servidores de inferencia estándar más allá de la ruta GGUF.
- El modelo es reciente y con muy poca tracción en Hugging Face (10 descargas, 0 likes), por lo que la comunidad y el soporte son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WePocketModel1.0-2B
- Release GGUF 2B: https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Release 4B safetensors: https://huggingface.co/tencent/WePocketModel1.0-4B
- Release GGUF 4B: https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Repositorio de inferencia: https://github.com/Tencent/WePocketModel
- Guía de ejemplos: https://github.com/Tencent/WePocketModel/blob/main/examples/README.md
- Guía de inferencia: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md
- Licencia del código: https://github.com/Tencent/WePocketModel/blob/main/LICENSE
- Citación e informe técnico (*WePM: Hierarchical Conflict Reconciliation for Unified MLLMs*): https://github.com/Tencent/WePocketModel#citation
