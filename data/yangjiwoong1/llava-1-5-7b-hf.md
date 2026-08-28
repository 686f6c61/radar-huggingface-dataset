# yangjiwoong1/llava-1.5-7b-hf

## Resumen

El modelo `yangjiwoong1/llava-1.5-7b-hf` es una implementación en formato Hugging Face del modelo LLaVA (Large Language and Vision Assistant) v1.5 de 7 mil millones de parámetros. LLaVA es un chatbot multimodal de código abierto que combina un codificador visual preentrenado con un modelo de lenguaje autoregresivo (LLaMA/Vicuna) mediante un proyector, permitiendo conversaciones que integran imágenes y texto. Fue desarrollado originalmente por el equipo de LLaVA (Universidad de Wisconsin-Madison, Microsoft Research y Columbia University) y esta versión concreta ha sido subida por el usuario `yangjiwoong1`, replicando la arquitectura y los pesos de la versión oficial.

El modelo resuelve tareas de visión-lenguaje como respuesta a preguntas visuales (VQA), descripción de imágenes y diálogo multimodal, siendo relevante por su carácter abierto y su capacidad para ejecutarse en hardware de consumo con cuantización. Está entrenado sobre el dataset LLaVA-Instruct-150K, compuesto por instrucciones multimodales generadas por GPT-4, y su arquitectura se basa en un transformer autoregresivo con una ventana de contexto que no se especifica en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo multimodal (LLaMA/Vicuna 7B con proyección visual) |
| Parametros totales | 7.063.427.072 (7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16, 4-bit (bitsandbytes) |
| Idiomas soportados | Inglés |
| Licencia | LLAMA 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LLaVA v1.5 sigue una arquitectura multimodal que conecta un codificador visual preentrenado (no especificado en la documentación, aunque el diseño original emplea CLIP ViT-L/14) con un modelo de lenguaje basado en LLaMA/Vicuna de 7B mediante un proyector lineal. El modelo es autoregresivo y genera texto condicionado a una o varias imágenes. El entrenamiento se realizó mediante fine-tuning sobre el dataset `liuhaotian/LLaVA-Instruct-150K`, que contiene conversaciones e instrucciones visuales generadas por GPT-4, siguiendo un esquema de aprendizaje supervisado. No se mencionan técnicas de RLHF/DPO ni el número exacto de tokens de entrenamiento. La versión original fue entrenada en septiembre de 2023 y la implementación en Hugging Face requiere `transformers >= 4.35.3`.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text) mediante el pipeline de transformers.
- Conversación multimodal multi-turno siguiendo la plantilla `USER: xxx\nASSISTANT:` con el token `<image>`.
- Soporte de múltiples imágenes en una misma consulta (multi-image y multi-prompt).
- Respuesta a preguntas visuales (VQA) sobre el contenido de una imagen.
- Descripción y narración de imágenes, incluyendo objetos, escenas y acciones.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step específico.
- Capacidades multilingües limitadas al inglés (según la etiqueta `language: en`).

## Casos de uso

- Asistente para personas con discapacidad visual: el modelo puede describir fotografías tomadas con un móvil, ayudando a interpretar el entorno, leer etiquetas o identificar obstáculos.
- Moderación de contenido visual: integrado en un pipeline de revisión, puede clasificar imágenes inapropiadas o generar informes descriptivos para moderadores humanos.
- Atención al cliente automatizada: cuando un usuario adjunta una captura de pantalla o foto de un producto defectuoso, el modelo extrae información relevante y genera una respuesta contextualizada en un chat multi-turno.
- Generación de descripciones para catálogos de e-commerce: a partir de una foto del producto, produce texto descriptivo para fichas de tienda online, reduciendo trabajo manual.
- Análisis de documentos escaneados: el modelo puede leer facturas, formularios o recibos y responder preguntas sobre los datos visibles, facilitando tareas de extracción de información.
- Ayuda educativa: estudiantes pueden subir diagramas, gráficas o ilustraciones y recibir explicaciones o respuestas a preguntas concretas sobre el contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB en FP16 (7B parámetros × 2 bytes), y alrededor de 4 GB con cuantización de 4 bits mediante `bitsandbytes`.
- GPU recomendadas: para FP16 se requiere una GPU con al menos 16 GB de VRAM, como RTX 3090, RTX 4090 o A100. Con cuantización 4-bit puede ejecutarse en GPUs de consumo con 6-8 GB, como RTX 3060 o RTX 4060.
- El modelo puede ejecutarse en CPU con cuantización, aunque la latencia será alta.
- Opciones de despliegue: transformers (pipeline `image-text-to-text`), `bitsandbytes` para 4-bit, Flash-Attention 2 para acelerar la generación. También es compatible con entornos como vLLM si se adapta a su formato, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks en la información proporcionada, por lo que no es posible realizar una comparativa cuantitativa. Sin embargo, se pueden mencionar alternativas de la misma categoría:

- **LLaVA-1.5-13B**: versión con 13B parámetros del mismo modelo, que ofrece mayor capacidad pero requiere más VRAM.
- **BLIP-2**: modelo multimodal de 2.7B parámetros (o variantes) centrado en VQA y captioning, con arquitectura basada en Q-Former.
- **InstructBLIP**: variante de BLIP-2 ajustada con instrucciones, similar en propósito a LLaVA.

Estos modelos comparten el enfoque de conectar un codificador visual con un LLM, pero difieren en arquitectura, tamaño y licencia. No se dispone de datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- Puede alucinar detalles no presentes en las imágenes o generar respuestas incorrectas en escenarios ambiguos.
- El entrenamiento con datos generados por GPT-4 puede introducir sesgos presentes en esos datos.
- La licencia LLAMA 2 Community License permite uso comercial, pero impone restricciones para empresas con más de 700 millones de usuarios mensuales, lo que debe revisarse antes de un despliegue masivo.
- La longitud de contexto no está documentada; se recomienda validar el comportamiento con secuencias largas antes de usarlo en producción.
- No se mencionan mecanismos de seguridad específicos contra prompts maliciosos o contenido dañino.
- El repositorio actual (`yangjiwoong1/llava-1.5-7b-hf`) tiene 0 descargas y 0 likes, lo que sugiere que puede ser una copia no verificada; se recomienda usar la versión oficial `llava-hf/llava-1.5-7b-hf` para entornos de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/yangjiwoong1/llava-1.5-7b-hf
- Modelo original LLaVA v1.5 7B: https://huggingface.co/liuhaotian/llava-v1.5-7b
- Versión oficial en Hugging Face: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Sitio web del proyecto LLaVA: https://llava-vl.github.io/
- Paper (arXiv:2304.08485): https://arxiv.org/abs/2304.08485
- Demo en Google Colab: https://colab.research.google.com/drive/1qsl6cd2c8gGtEW1xV5io7S8NHh-Cp1TV?usp=sharing
