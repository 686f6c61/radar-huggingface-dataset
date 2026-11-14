# zhiyuanhucs/forza-horizon-5-qwen3.5-9b-bc-ov5-en-zh-20261114

## Resumen

Forza Horizon 5 Qwen3.5-9B es un modelo vision-language (VLM) fruto de un ajuste fino completo (full fine-tuning) del modelo base Qwen3.5-9B, realizado por el usuario zhiyuanhucs. El modelo está orientado a tareas relacionadas con el videojuego Forza Horizon 5: interpretación de imágenes de juego, descripción de escenas y razonamiento sobre contenido visual del título de conducción. Combina el entendimiento visual del modelo base con un entrenamiento específico sobre capturas de pantalla del juego y datos multimodales seleccionados en inglés y chino.

El entrenamiento se llevó a cabo en Megatron con un batch global de 256, contexto máximo de 131.072 tokens, tensor parallelism de 4 y data parallelism de 8, sobre 32 GPUs H200. El dataset combina el 100 % de datos del juego con un 5 % seleccionado de OneVision en inglés y otro 5 % en chino, lo que sugiere un ajuste orientado a dominio con refuerzo multilingüe. El checkpoint publica pesos nativos de Megatron (no safetensors de Transformers), lo que condiciona su uso a un loader compatible o a una conversión previa.

El modelo es relevante para desarrolladores que investigan VLMs aplicados a videojuegos, análisis de escenas de conducción o ajuste fino de dominio con Megatron. Su tamaño de repo (151,6 GB) refleja la inclusión de estados de optimizador, RNG y cursor de datos, propios de checkpoints nativos de entrenamiento, más que de un modelo listo para inferencia ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen3.5-9B (transformer multimodal) |
| Parametros totales | 9B (según el nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto máximo de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés y chino (según la composición del dataset); lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints nativos de Megatron (mcore/), no safetensors de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con capacidad de procesamiento de imagen y texto. El ajuste fino es completo (full fine-tuning), no un adaptador, y se ejecuta con Megatron sobre 32 GPUs H200 usando tensor parallelism 4, data parallelism 8 y un batch global de 256. El contexto máximo de entrenamiento es de 131.072 tokens, lo que permite manejar entradas visuales y textuales de gran longitud.

El dataset combina el 100 % de datos del juego Forza Horizon 5 con un 5 % seleccionado de OneVision en inglés y un 5 % en chino. Esta mezcla busca especializar el modelo en el dominio del juego sin perder capacidades generales de visión y lenguaje, y añadir cobertura multilingüe en inglés y chino. No se documentan detalles sobre RLHF, DPO ni otras etapas de alineación posteriores. La publicación incluye checkpoints nativos de Megatron con estado de optimizador, RNG y cursor de datos, lo que indica que se trata de artefactos de entrenamiento más que de pesos listos para inferencia directa con Transformers.

## Capacidades

- Procesamiento de imagen y texto (vision-language model).
- Interpretación de capturas de pantalla y escenas del videojuego Forza Horizon 5.
- Descripción de contenido visual y razonamiento sobre elementos del juego.
- Generación de texto en inglés y chino (según la composición del dataset).
- Contexto largo de hasta 131.072 tokens para entradas multimodales extensas.
- Capacidad general de visión y lenguaje heredada del modelo base Qwen3.5-9B.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de capturas de Forza Horizon 5: el modelo puede recibir imágenes del juego y generar descripciones detalladas de escenas, vehículos y entornos, aprovechando el ajuste de dominio sobre datos del título.
- Asistencia a jugadores: generación de respuestas en inglés o chino sobre mecánicas, circuitos o eventos del juego a partir de imágenes o texto, gracias a la mezcla bilingüe del dataset.
- Etiquetado y anotación de imágenes de juego: uso del modelo para generar descripciones o metadatos de capturas en pipelines de curación de datasets, con contexto largo para procesar lotes de imágenes relacionadas.
- Investigación en VLMs de dominio específico: evaluación de cómo el ajuste fino completo con Megatron especializa un modelo de 9B en un videojuego concreto, útil para estudios de transferencia de dominio.
- Generación de contenido para comunidades: redacción de guías, resúmenes o textos promocionales sobre Forza Horizon 5 en inglés y chino a partir de material visual.
- Base para ajustes posteriores: al ser un checkpoint nativo de Megatron, puede servir como punto de partida para nuevos entrenamientos o conversiones a otros formatos en entornos de investigación.
- Análisis multimodal con contexto largo: procesamiento de secuencias extensas de imágenes y texto, por ejemplo, reconstrucción de una partida o evento a partir de múltiples capturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del formato de conversión y de la cuantización, que no se documentan.
- GPU recomendadas: no disponible; el entrenamiento se realizó sobre 32 GPUs H200, pero no se especifican requisitos de inferencia.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 9B en precisión completa requeriría al menos 18-20 GB de VRAM en BF16, pero no se aportan datos oficiales.
- Opciones de despliegue: requiere el loader original de ms-swift/Megatron o una conversión previa a safetensors para usar vLLM, llama.cpp, Ollama o TGI; no se documentan configuraciones listas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Forza Horizon 5 Qwen3.5-9B | 9B | 131.072 | no disponible | Megatron nativo | Hugging Face (repo 151,6 GB) |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible | no disponible | no disponible |
| Alternativas de 9B vision-language | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre modelos comparables de la misma categoría para establecer una comparativa rigurosa de rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Especialización muy marcada en Forza Horizon 5: el entrenamiento con el 100 % de datos del juego puede degradar el rendimiento en tareas generales de visión y lenguaje fuera del dominio.
- Idiomas limitados a inglés y chino según el dataset; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación sobre elementos del juego no presentes en los datos de entrenamiento.
- Pesos en formato nativo de Megatron: no son safetensors de Transformers y requieren loader compatible o conversión; el uso directo en pipelines estándar no es trivial.
- El repo incluye estados de optimizador, RNG y cursor de datos, lo que aumenta el tamaño (151,6 GB) y complica el despliegue en inferencia.
- La model card advierte que las subidas incompletas no deben tratarse como listas y que el checkpoint `epoch-1` está pendiente de verificación; conviene consultar `PUBLICATION_VERIFIED.json` antes de usar.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Sin datos de benchmarks, no es posible validar el rendimiento frente a alternativas.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/zhiyuanhucs/forza-horizon-5-qwen3.5-9b-bc-ov5-en-zh-20261114
- Modelo base Qwen3.5-9B: no disponible
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
