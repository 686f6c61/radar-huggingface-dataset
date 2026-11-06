# ThinkMorph/ThinkMorph-SSL

## Resumen

ThinkMorph-SSL es un modelo multimodal unificado desarrollado por ThinkMorph que razona generando texto e imágenes intermedias de forma entrelazada. Se construye a partir de BAGEL-7B-MoT de ByteDance-Seed mediante la receta de dos etapas PRIMER: una primera fase de preentrenamiento sobre 270.896 trazas texto-imagen-texto sin instrucciones (Pretext-270K) y una segunda fase de instrucción sobre 181.291 trazas entrelazadas guiadas por preguntas (Instruct-181K).

El modelo resuelve tareas de razonamiento visual y espacial donde el modelo debe "pensar con imágenes": en lugar de responder directamente, genera una o varias imágenes intermedias que actúan como borradores visuales antes de emitir la respuesta final. Esto es relevante para tareas de reconstrucción de escenas, comprensión de estructura espacial y razonamiento sobre evidencia visual que los modelos puramente textuales no pueden abordar.

Los pesos publicados en este repositorio son los EMA de la etapa 2 en el paso 5.500, en bfloat16, con 14.675.840.307 parámetros. La arquitectura es la de BAGEL-7B-MoT (transformer multimodal con mezcla de expertos), licencia Apache-2.0 y pipeline any-to-any. Es un modelo de investigación: el propio autor advierte que las imágenes intermedias pueden omitir o alterar evidencia, y que la inferencia por defecto genera imágenes con un coste computacional elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal BAGEL-7B-MoT (MoE, any-to-any) con razonamiento entrelazado texto-imagen |
| Parametros totales | 14.675.840.307 (pesos EMA, bfloat16, 1.451 tensores) |
| Parametros activos | no disponible (el modelo base es MoT; no se detalla el reparto activo) |
| Longitud de contexto | no disponible (packing de entrenamiento hasta 20.480 tokens en etapa 2) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ema.safetensors`, `ae.safetensors`); configuracion en JSON |

## Arquitectura y entrenamiento

ThinkMorph-SSL hereda la arquitectura de BAGEL-7B-MoT: un transformer multimodal con mezcla de expertos (MoT) que combina un LLM, un codificador de visión SigLIP y un VAE para generación de imágenes. El modelo produce tokens de texto y, de forma intercalada, imágenes generadas mediante flow matching. La pérdida de entrenamiento combina cross-entropy sobre texto y flow matching sobre imágenes, ambas con peso 1. El VAE permanece congelado y el codificador SigLIP se entrena.

El entrenamiento sigue la receta PRIMER en dos etapas. La etapa 1 (pretext) parte de BAGEL-7B-MoT y entrena sobre Pretext-270K (270.896 filas de entrenamiento) durante 32 GPUs (4 nodos × 8), con learning rate 2,83e-5, warmup de 1.000 pasos y horizonte configurado de 10.000 pasos. La etapa 2 (instruction) se inicializa desde los EMA de la etapa 1 en el paso 5.500 y entrena sobre Instruct-181K (todos los 21 subconjuntos, incluyendo ficheros de validación) durante 48 GPUs (6 nodos × 8), con learning rate 2e-5 y horizonte de 12.000 pasos. Se aplica EMA con decay 0,9998 desde el paso 1.000 con shadow en fp32, y packing dinámico de hasta 16.384 tokens en etapa 1 y 20.480 en etapa 2. La etapa 2 filtra solo trazas con primera imagen de razonamiento y respuesta. Los pesos liberados son los EMA del paso 5.500 de la etapa 2.

## Capacidades

- Razonamiento multimodal entrelazado: genera texto e imágenes intermedias de forma alternada antes de la respuesta final.
- Razonamiento visual sobre evidencia visible: responde preguntas visuales apoyándose en imágenes generadas como borradores.
- Razonamiento espacial y de estructura: aborda tareas de relaciones espaciales entre objetos y disposición de escenas.
- Reconstrucción de escenas: capacidad de representar y razonar sobre la composición de una escena a partir de la evidencia visual.
- Generación de imágenes: produce imágenes mediante flow matching como parte del proceso de razonamiento y de la respuesta.
- Pipeline any-to-any: acepta y produce combinaciones de texto e imagen.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking explícito en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Razonamiento visual con borradores intermedios: el modelo puede generar una imagen esquemática de la evidencia antes de responder, útil en tareas donde la respuesta depende de relaciones visuales que conviene explicitar paso a paso.
- Análisis de estructura espacial en imágenes: para preguntas sobre posiciones relativas, disposición de objetos o geometría de una escena, el modelo puede dibujar la estructura inferida y razonar sobre ella.
- Reconstrucción de escenas para verificación: en pipelines de investigación, generar una reconstrucción visual intermedia permite auditar qué evidencia ha considerado el modelo antes de emitir su respuesta.
- Investigación en razonamiento multimodal: sirve como base para estudiar cómo el razonamiento con imágenes intermedias afecta a la precisión en tareas visuales, gracias a sus dos etapas de entrenamiento documentadas y datasets públicos.
- Prototipado de asistentes visuales explicables: el carácter entrelazado de las trazas permite construir interfaces donde el usuario ve el "razonamiento dibujado" del modelo, útil en entornos educativos o de diagnóstico visual.
- Experimentación con recetas de post-entrenamiento: la separación en pretext (sin instrucciones) e instruction permite reproducir y modificar cada fase por separado, con los datasets Pretext-270K e Instruct-181K disponibles.
- Evaluación comparativa de modelos any-to-any: al compartir arquitectura y layout con BAGEL-7B-MoT, facilita experimentos controlados sobre el efecto del entrenamiento PRIMER frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las puntuaciones se rellenarán cuando la tabla principal del paper esté finalizada, y muestra las filas "Visible evidence", "Spatial structure" y "Scene reconstruction" como TBD.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 29,4 GB (`ema.safetensors`), más unos 160 MB del VAE. En bfloat16 se necesita holgura por encima de los 30 GB solo para pesos; con estados de activación y caché de inferencia, se recomienda al menos 40-48 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o más para inferencia en bfloat16 sin cuantización.
- Cabe en consumer GPU: no de forma directa en bfloat16. No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible; sería necesario cuantizar por cuenta propia.
- Opciones de despliegue: código oficial de inferencia de BAGEL (https://github.com/ByteDance-Seed/Bagel) apuntando `model_path` al directorio local, o el código de PRIMER mediante `Bagel.from_pretrained(model_path, config, training_config=...)`, que detecta `ema.safetensors`. El wrapper de evaluación `wrapper: Bagel` también lee `ema.safetensors` cuando no existe `model.safetensors`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card advierte que la inferencia por defecto genera imágenes, lo que incrementa notablemente el coste computacional frente a un modelo solo de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento con imagenes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkMorph-SSL | 14.675.840.307 | no disponible | Si (texto-imagen entrelazado) | Apache-2.0 | Pesos en Hugging Face |
| BAGEL-7B-MoT (ByteDance-Seed) | no disponible en la informacion | no disponible | No documentado como razonamiento entrelazado | Apache-2.0 (heredada) | Pesos publicos |
| ThinkMorph-7B | no disponible | no disponible | Modelo distinto segun el autor | no disponible | Pesos publicos |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo declara explícitamente como tal; no está pensado para producción sin evaluación adicional.
- Las imágenes intermedias pueden omitir o alterar evidencia de la que depende la pregunta, lo que puede inducir respuestas incorrectas con apariencia de razonamiento fundamentado.
- La inferencia por defecto genera imágenes, con un coste computacional elevado en latencia y VRAM.
- ThinkMorph-7B es un modelo diferente y no puede sustituir a ThinkMorph-SSL.
- El VAE debe ser el de `lmms-lab/BAGEL-7B-MoT-ver.LE` (unos 160 MB); sustituirlo por el VAE de 320 MB de la release pública de BAGEL puede romper la inferencia.
- Es necesario usar los ficheros de tokenizer incluidos en el repositorio, que contienen tokens especiales añadidos durante el entrenamiento.
- Los benchmarks de la model card están pendientes (TBD), por lo que no hay evidencia pública de rendimiento frente a alternativas.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo general de los modelos generativos multimodales.
- Licencia Apache-2.0 para los pesos, pero los datasets Pretext-270K e Instruct-181K tienen sus propios términos de origen que deben consultarse en sus model cards.
- La cita del paper está pendiente (título y autores como TBD).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThinkMorph/ThinkMorph-SSL
- Pesos de la etapa 1: https://huggingface.co/ThinkMorph/ThinkMorph-SSL-Stage1
- Dataset Pretext-270K: https://huggingface.co/datasets/ThinkMorph/Pretext-270K
- Dataset Instruct-181K: https://huggingface.co/datasets/ThinkMorph/Instruct-181K
- Modelo base BAGEL-7B-MoT: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Codigo oficial de inferencia BAGEL: https://github.com/ByteDance-Seed/Bagel
