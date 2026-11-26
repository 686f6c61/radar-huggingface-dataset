# tencent/WePocketModel1.0-2B

## Resumen

WePocketModel 1.0 2B (WePM) es un modelo vision-lenguaje desarrollado por WeChat AI (Tencent) orientado a aplicaciones en dispositivo (*on-device*). Se construye sobre el modelo base Qwen/Qwen3.5-2B mediante ajuste fino y añade un codificador visual, de modo que un único backbone compartido cubre tres capacidades: generación de texto a partir de texto e imágenes, generación de embeddings multimodales y toma de decisiones estructuradas.

El modelo tiene 2.213.241.664 parámetros (aproximadamente 2,23 mil millones) y ocupa unos 4,47 GB en pesos BF16, con un repositorio de 4,5 GB distribuido en tres ficheros safetensors más un fichero auxiliar (`unimodel_aux.safetensors`) que contiene las cabeceras de embedding y decisión. La familia WePM se publica en variantes de 2B y 4B, tanto en safetensors como en GGUF, y esta ficha cubre la variante 2B en safetensors.

Su relevancia radica en unificar en un solo modelo tareas que normalmente requieren tres sistemas separados (un VLM generativo, un modelo de embeddings y un clasificador de decisión), lo que reduce el coste de despliegue en entornos con recursos limitados. La licencia Apache 2.0 facilita su uso comercial, y el soporte de embeddings Matryoshka permite ajustar la dimensión del vector sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje multimodal con backbone transformer compartido (base Qwen3.5-2B) y codificador visual; cabeceras de generación, embedding y decisión |
| Parametros totales | 2.213.241.664 (2,23 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en CUDA y FP32 en CPU en el runtime oficial; existe release GGUF en el repositorio hermano (tipos concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos y código de inferencia) |
| Formato de pesos | safetensors (3 shards + `unimodel_aux.safetensors`); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

WePM emplea un backbone transformer compartido derivado de Qwen3.5-2B, al que se acopla un codificador visual. Sobre esa base se montan cabeceras específicas para cada tarea: una cabecera generativa para producir texto, una proyección de embedding que genera vectores L2-normalizados de hasta 2.048 dimensiones, y una cabecera de decisión que devuelve opciones estructuradas, puntuaciones ordinales o juicios binarios. El fichero `unimodel_aux.safetensors` contiene los pesos auxiliares de presupuestación visual, las ponderaciones de tarea y las cabeceras de embedding y decisión.

El modelo soporta Matryoshka Representation Learning (MRL) en los embeddings multimodales: el usuario puede seleccionar dimensiones de 64, 128, 256, 512, 1.024 o 2.048, y el runtime L2-normaliza el prefijo correspondiente de la proyección. El informe técnico asociado se titula "WePM: Hierarchical Conflict Reconciliation for Unified MLLMs", lo que sugiere que la innovación metodológica se centra en la reconciliación jerárquica de conflictos entre tareas dentro de un MLLM unificado. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto condicionada por texto, imágenes o secuencias intercaladas de texto e imagen.
- OCR y captioning de imágenes.
- Respuesta visual a preguntas (VQA).
- Embeddings multimodales L2-normalizados de 2.048 dimensiones, con truncamiento Matryoshka a 64, 128, 256, 512 y 1.024 dimensiones.
- Recuperación y ranking de candidatos mediante similitud de embeddings.
- Decisión estructurada: selección entre opciones, puntuaciones ordinales y juicios binarios sobre el estado de una aplicación.
- Ejecución en CPU y en CUDA con el mismo checkpoint (BF16 en GPU, FP32 en CPU).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda multimodal en aplicaciones locales: indexar imágenes y texto con embeddings de 2.048 dimensiones (o truncados a 256/512 para ahorrar memoria) y recuperar candidatos por similitud coseno, todo dentro del dispositivo sin llamadas a la nube.
- Asistencia visual accesible: describir imágenes o leer texto mediante OCR para usuarios con discapacidad visual, aprovechando que el modelo corre en CPU o GPU de gama baja.
- Moderación y enrutado de contenido: usar la cabecera de decisión para emitir juicios binarios o puntuaciones ordinales sobre el estado de la aplicación (por ejemplo, clasificar la severidad de un mensaje) antes de disparar una acción.
- Recomendación y ranking en el borde: generar embeddings de ítems y del contexto del usuario y ordenar candidatos localmente, reduciendo la latencia y la exposición de datos personales.
- Automatización de formularios y documentos: combinar OCR con decisión estructurada para extraer campos y validar su coherencia en un pipeline local.
- Prototipado rápido de asistentes multimodales: al unificar generación, embedding y decisión en un solo checkpoint de 4,47 GB, se puede iterar sobre las tres funcionalidades con un único despliegue y un único runtime.
- Filtrado previo en dispositivos móviles: descartar imágenes o consultas irrelevantes con embeddings truncados a 64 o 128 dimensiones antes de enviar el caso a un modelo mayor en servidor.

## Benchmarks y rendimiento

La model card incluye una imagen comparativa de resultados de la familia WePM en tareas de embedding, generación y decisión (`assets/wepm_single_results.png`), pero no se proporcionan cifras numéricas en el texto disponible. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 4,47 GB en disco; en memoria de GPU se requiere espacio adicional para activaciones, codificador visual y caché KV.
- Pesos en FP32 (CPU): aproximadamente el doble del tamaño BF16, alrededor de 8,9 GB de RAM, más overhead del runtime.
- GPU recomendadas: no se especifican modelos concretos; el runtime oficial usa CUDA 12.8 con PyTorch 2.10.0 y torchvision 0.25.0.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en BF16, aunque el fabricante no publica requisitos mínimos verificados.
- Despliegue: runtime propio WePM (`inference/infer.py` en GPU, `inference/infer_cpu.py` en CPU), con scripts de ejemplo para generación, embedding y decisión. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WePocketModel 1.0 2B | 2,23 B | no disponible | Generación + embedding + decisión multimodales | Apache 2.0 | safetensors y GGUF en Hugging Face |
| WePocketModel 1.0 4B | no disponible | no disponible | Mismas tres capacidades | Apache 2.0 | safetensors y GGUF en Hugging Face |
| Qwen3.5-2B (modelo base) | no disponible | no disponible | Generación de texto | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte explícitamente de que los desarrolladores deben evaluar la calidad de salida en entradas representativas y validar las decisiones estructuradas antes de usarlas para disparar acciones.
- Riesgo de alucinación en generación: no se documentan tasas ni mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá de lo que herede del modelo base.
- Longitud de contexto: no disponible, lo que impide planificar aplicaciones con documentos largos sin validación previa.
- El runtime oficial es propio (WePM); la compatibilidad con ecosistemas estándar como vLLM o llama.cpp no está confirmada.
- Los componentes de terceros incluidos en el repositorio conservan sus licencias originales, que deben revisarse por separado.
- El modelo está pensado para uso local en dispositivo; no se documentan garantías de robustez en entornos adversarios.

## Enlaces

- Hugging Face (2B safetensors): https://huggingface.co/tencent/WePocketModel1.0-2B
- Hugging Face (2B GGUF): https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Hugging Face (4B safetensors): https://huggingface.co/tencent/WePocketModel1.0-4B
- Hugging Face (4B GGUF): https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- Guía de ejemplos: https://github.com/Tencent/WePocketModel/blob/main/examples/README.md
- Guía de inferencia: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md
- Licencia del código: https://github.com/Tencent/WePocketModel/blob/main/LICENSE
- Informe técnico (arXiv): https://arxiv.org/abs/2611.27365
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
