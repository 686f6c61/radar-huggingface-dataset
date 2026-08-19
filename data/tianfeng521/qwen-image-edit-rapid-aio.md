# tianfeng521/Qwen-Image-Edit-Rapid-AIO

## Resumen

Qwen-Image-Edit-Rapid-AIO es un modelo de edición y generación de imágenes que combina el modelo base Qwen/Qwen-Image-Edit-2511 con aceleradores de inferencia (técnicas de destilación tipo Lightning), VAE y CLIP en un único checkpoint listo para usar en ComfyUI. El proyecto original fue desarrollado por Phr00t, y este repositorio de tianfeng521 es una copia o variante del mismo, orientada a simplificar el flujo de trabajo: basta con cargar un nodo "Load Checkpoint", fijar CFG en 1 y usar 4 pasos de muestreo para obtener resultados rápidos.

La propuesta de valor principal es la velocidad: al fusionar aceleradores que reducen el número de pasos necesarios (de decenas a 4-8), permite editar imágenes de forma interactiva en hardware consumer sin sacrificar demasiada calidad. El repositorio incluye múltiples versiones (v1 a v23 según el autor original), con variantes separadas para contenido SFW y NSFW desde la v5. El tamaño del repositorio es de 1608 GB, lo que sugiere que aloja numerosos checkpoints y archivos auxiliares.

Es relevante porque democratiza la edición de imágenes mediante IA local, ofreciendo una alternativa a servicios en la nube con control total sobre los datos. Sin embargo, el autor original ha anunciado que el proyecto está llegando a su fin, ya que nuevos modelos de edición están apareciendo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen-Image-Edit-2511 (merge de aceleradores, VAE y CLIP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (mencionado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors/checkpoint de ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un merge (fusión) de pesos, no un entrenamiento desde cero. Parte del checkpoint Qwen-Image-Edit-2511 y le aplica una combinación de aceleradores de inferencia (LORAs de destilación tipo Lightning, que reducen los pasos de muestreo a 4-8) y LORAs adicionales para mejorar realismo, consistencia de personajes y reducción del aspecto "plástico". El autor original documenta iteraciones v1 a v23, ajustando las proporciones de cada LORA y añadiendo o eliminando componentes.

No se dispone de información sobre el dataset de entrenamiento, número de tokens procesados ni técnicas como RLHF o DPO. El proceso es esencialmente artesanal: mezclar pesos de distintos aceleradores y LORAs, probar y refinar. La versión v8 introdujo el uso de BF16 para cargar LORAs FP32 y luego escalar a FP8 al guardar, lo que resolvió problemas de "gridlines". Las versiones v5+ separan los modelos NSFW y SFW para especializarlos.

## Capacidades

- Edición de imágenes (i2i): modificar imágenes existentes mediante instrucciones en lenguaje natural, con soporte para hasta 4 imágenes de entrada si se usa el nodo modificado "TextEncodeQwenImageEditPlus v2".
- Generación de texto a imagen (t2i): si no se proporcionan imágenes de entrada, el modelo funciona como generador puro.
- Inferencia rápida: 4 pasos con CFG 1 (recomendado), aunque se pueden usar 6-8 pasos con otros samplers.
- Integración nativa con ComfyUI mediante el nodo "Load Checkpoint".
- Soporte de contenido NSFW en versiones específicas (v5+ separa SFW/NSFW).
- Ajuste de escala y recorte mediante el nodo de codificación de texto, que informa al modelo del tamaño del latent.
- Compatibilidad con múltiples samplers: sa_solver, euler_a, lcm, er_sde, entre otros, con recomendaciones específicas por versión.

## Casos de uso

- Edición fotográfica local: retocar o modificar imágenes personales o de producto sin enviar datos a la nube. El modelo permite instrucciones como "cambia el fondo a una playa" o "haz que la persona sonría" con 4 pasos, lo que lo hace usable en tiempo real.
- Generación de imágenes para diseño gráfico: crear ilustraciones o conceptos desde texto, aprovechando la capacidad t2i. Útil para diseñadores que necesitan iterar rápidamente sobre ideas.
- Automatización de flujos de trabajo en ComfyUI: al ser un checkpoint único, se puede integrar en pipelines complejos de generación y edición sin cargar múltiples modelos por separado.
- Prototipado de contenido para redes sociales: generar variaciones de imágenes existentes (cambios de estilo, color, composición) de forma masiva y barata.
- Investigación en edición multimodal: como modelo open source, sirve para experimentar con técnicas de edición por instrucción y comparar con otros enfoques.
- Creación de contenido NSFW (solo con las versiones dedicadas): para artistas o estudios que necesitan generar o editar contenido adulto con control local, aunque debe respetarse la legalidad y los términos de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo usa FP8 y el base Qwen-Image-Edit-2511 es de tamaño considerable (varios miles de millones de parámetros), se recomienda al menos 16 GB de VRAM para inferencia cómoda, pero no hay confirmación oficial.
- GPU recomendadas: no disponible. Por las características (FP8, 4 pasos), GPUs consumer como RTX 3090/4090 o superiores deberían ser suficientes, pero no hay datos concretos.
- Despliegue: exclusivamente a través de ComfyUI (librería declarada). No se mencionan otros runners como vLLM o llama.cpp, que por otra parte no son habituales para modelos de imagen.
- Latencia y throughput: no disponibles. La ventaja de 4 pasos sugiere tiempos de inferencia de segundos en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Base | Características | Licencia | Disponibilidad |
|---|---|---|---|---|
| tianfeng521/Qwen-Image-Edit-Rapid-AIO | Qwen-Image-Edit-2511 | Merge con aceleradores, FP8, ComfyUI | Apache 2.0 | HuggingFace |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | Qwen-Image-Edit-2511 | Original del proyecto, mismas características | Apache 2.0 | HuggingFace |
| eddy1111111/Qwen-Image-Edit | Qwen-Image-Edit-2511 | Mejora del Rapid-AIO con optimizaciones propias | Apache 2.0 | HuggingFace |
| Qwen/Qwen-Image-Edit-2511 | - | Modelo base sin acelerar | Apache 2.0 | HuggingFace |

La diferencia principal entre el repo de tianfeng521 y el de Phr00t no está documentada; es probable que sea una copia o una variante con ajustes menores. El modelo de eddy1111111 declara ser una mejora sobre el trabajo de Phr00t.

## Limitaciones y advertencias

- El repositorio contiene versiones NSFW y SFW; las versiones NSFW no son aptas para todos los públicos y su uso puede estar restringido por legislación local.
- El autor original indica que el proyecto está llegando a su fin y que no habrá más actualizaciones; los usuarios deben asumir que el soporte comunitario será limitado.
- El tamaño del repositorio (1608 GB) implica una descarga masiva; es necesario seleccionar solo los archivos necesarios para evitar saturar el almacenamiento.
- No hay información sobre sesgos o alucinaciones específicas, pero como modelo de edición basado en lenguaje, puede malinterpretar instrucciones ambiguas o generar cambios no deseados.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el contenido generado (especialmente el NSFW).
- El rendimiento en hardware sin GPU dedicada o con VRAM insuficiente será muy limitado o imposible.

## Enlaces

- Repositorio de tianfeng521: https://huggingface.co/tianfeng521/Qwen-Image-Edit-Rapid-AIO
- Repositorio original de Phr00t: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- Tutorial de instalación y uso: https://aiindigo.com/tutorials/getting-started-with-qwen-image-edit-rapid-aio-fast-precise-local-image-editing
- Variante mejorada de eddy1111111: https://huggingface.co/eddy1111111/Qwen-Image-Edit
- Página en Civitai con workflows: https://civitai.com/models/2136764/qwen-image-edit-rapid-aio-image-editing
