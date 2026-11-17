# zhoudoe23/mc-tagger-qwen3_vl_2b-merged

## Resumen

mc-tagger-qwen3_vl_2b-merged es un ajuste fino (fine-tune) del modelo vision-lenguaje Qwen3-VL-2B-Instruct, publicado por el usuario zhoudoe23 en Hugging Face. El modelo está especializado en el etiquetado (tagging) de skins de Minecraft: recibe una imagen de una skin y genera etiquetas descriptivas. Se distribuye como la versión "merged", es decir, los pesos del adaptador LoRA (publicado aparte como zhoudoe23/mc-tagger-qwen3_vl_2b-lora) fusionados con el modelo base, de modo que puede cargarse directamente sin necesidad de aplicar el adaptador.

El modelo parte de la arquitectura Qwen3-VL, un transformer multimodal con 2.127.532.032 parámetros totales (aproximadamente 2,1 mil millones), lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en GPU de consumo. El repositorio ocupa 4,3 GB en formato safetensors. El entrenamiento se realizó sobre el dataset danielbacsur/minecraft-skins-20k-1024k-captioned, un conjunto de aproximadamente 20.000 skins de Minecraft con leyendas (captions) a resolución de hasta 1024k píxeles, según la denominación del propio dataset.

La relevancia de este modelo es acotada y de nicho: no compite en capacidades generales con los modelos frontera, sino que resuelve una tarea concreta de clasificación y descripción visual dentro del ecosistema de Minecraft (moderación de contenido, catalogación de skins, generación de metadatos para tiendas o servidores). Su interés técnico reside en demostrar cómo un modelo VLM pequeño puede especializarse mediante LoRA sobre un dataset de dominio específico con un coste de entrenamiento bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen3-VL), fine-tune con LoRA fusionado |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Dataset de entrenamiento | danielbacsur/minecraft-skins-20k-1024k-captioned |
| Tamano del repositorio | 4,3 GB |
| Descargas | 58 |
| Fecha de creacion | 2026-08-17 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-2B-Instruct: un transformer multimodal que combina un codificador visual con un decodificador de lenguaje, con aproximadamente 2,1 mil millones de parámetros. La innovación respecto al modelo base no está en la arquitectura, sino en el proceso de ajuste: el autor entrenó un adaptador LoRA sobre el dataset de skins de Minecraft y posteriormente fusionó esos pesos en el modelo completo, generando esta variante "merged". No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de su nombre, ni si se emplearon técnicas de RLHF o DPO.

El dataset de entrenamiento, danielbacsur/minecraft-skins-20k-1024k-captioned, contiene aproximadamente 20.000 skins con leyendas descriptivas, lo que sugiere un entrenamiento supervisado (SFT) orientado a la generación de descripciones textuales a partir de imágenes. No hay información pública sobre hiperparámetros del LoRA (rango, alpha, capas objetivo), épocas, tasa de aprendizaje ni estrategia de enmascaramiento de tokens. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de las que ya incorpora el modelo base Qwen3-VL.

## Capacidades

- Generación de etiquetas descriptivas (tagging) para imágenes de skins de Minecraft, tarea principal del ajuste fino.
- Comprensión de imágenes: al derivar de Qwen3-VL-2B-Instruct, conserva la capacidad de procesar entradas visuales junto con texto.
- Generación de texto condicionada por imagen, con salida en formato de etiquetas o descripciones breves.
- Capacidades multilingües heredadas del modelo base, aunque no se documenta el alcance exacto en esta variante.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible; el ajuste está orientado a una tarea de clasificación/descripción, no a razonamiento complejo.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Catalogación automática de skins en servidores de Minecraft: el modelo recibe la imagen de la skin y genera etiquetas (colores, temática, personajes, estilos) que permiten indexar y buscar skins en una base de datos de un servidor o tienda.
- Moderación de contenido en comunidades de Minecraft: clasificar skins por temática para detectar contenido inapropiado o fuera de las normas del servidor, usando las etiquetas generadas como señal previa a una revisión humana.
- Generación de metadatos para marketplaces de skins: enriquecer fichas de producto con descripciones automáticas generadas a partir de la imagen, reduciendo el trabajo manual de los vendedores.
- Etiquetado de datasets para investigación: usar el modelo como anotador automático de grandes colecciones de skins, generando captions que luego pueden revisarse o filtrarse para entrenar otros modelos.
- Sistemas de recomendación visual: extraer etiquetas de las skins de un usuario para recomendarle skins similares o complementarias dentro de una plataforma.
- Herramientas de accesibilidad: generar descripciones textuales de skins para usuarios con discapacidad visual que navegan por galerías o perfiles de jugadores.
- Preprocesamiento en pipelines de visión por computador: como paso de anotación débil (weak labeling) antes de entrenar clasificadores específicos más ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 4,3 GB solo para los pesos, más memoria para activaciones y caché KV; en la práctica, entre 6 y 8 GB según la longitud de contexto y el tamaño de imagen de entrada.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB para pesos, más overhead; en 4 bits, aproximadamente 1,5-2 GB para pesos.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para despliegues de producción; también válidas GPUs de gama media como RTX 3060 (12 GB) o RTX 4070 en cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en fp16 y con 4-6 GB en cuantización de 4/8 bits.
- Opciones de despliegue: vLLM y TGI para servir el modelo en fp16/bf16 (verificar compatibilidad con la arquitectura Qwen3-VL); llama.cpp y Ollama requerirían conversión a GGUF, no publicada por el autor; transformers con la librería oficial de Qwen para inferencia directa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mc-tagger-qwen3_vl_2b-merged | 2,13 B | no disponible | no disponible | Hugging Face (58 descargas) | Fine-tune de nicho para tagging de skins de Minecraft |
| Qwen/Qwen3-VL-2B-Instruct | ~2 B | no disponible en esta ficha | según modelo base | Hugging Face (modelo base oficial) | Modelo generalista multimodal; sin especialización en skins |
| Qwen2.5-VL-3B-Instruct | ~3 B | no disponible en esta ficha | según modelo base | Hugging Face | Alternativa generalista de tamaño similar de la generación anterior |
| SmolVLM-2B | ~2 B | no disponible en esta ficha | según modelo base | Hugging Face | VLM pequeño de Hugging Face para tareas generales de visión-lenguaje |

La comparativa con alternativas generalistas es limitada porque este modelo está especializado en una única tarea; para tagging de skins de Minecraft no se conocen alternativas públicas equivalentes en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste fino está orientado exclusivamente a skins de Minecraft; su rendimiento en tareas generales de visión-lenguaje puede haberse degradado respecto al modelo base (olvido catastrófico parcial).
- Licencia no especificada: la model card no declara licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen3-VL-2B-Instruct antes de cualquier uso en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir etiquetas incorrectas o inventadas para skins ambiguas, poco comunes o fuera de la distribución del dataset de entrenamiento.
- Sesgos del dataset: las etiquetas reflejan la distribución y los criterios de anotación del dataset danielbacsur/minecraft-skins-20k-1024k-captioned; pueden existir sesgos en la descripción de colores, temáticas o personajes.
- Idiomas no documentados: no se especifica qué idiomas maneja la salida; probablemente herede el inglés del dataset de captions, pero no está confirmado.
- Contexto y cuantizaciones no documentados: no hay información sobre la longitud de contexto soportada ni sobre cuantizaciones publicadas, lo que complica el despliegue en entornos con recursos limitados sin trabajo adicional de conversión.
- Madurez baja: 58 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad ni de evaluaciones independientes.
- Uso responsable: al ser un modelo de nicho sin garantías de calidad, se recomienda revisión humana de las etiquetas generadas antes de usarlas en decisiones automatizadas (moderación, recomendación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhoudoe23/mc-tagger-qwen3_vl_2b-merged
- Adaptador LoRA del autor: https://huggingface.co/zhoudoe23/mc-tagger-qwen3_vl_2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/danielbacsur/minecraft-skins-20k-1024k-captioned
