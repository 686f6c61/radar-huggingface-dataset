# ZainHu/TRELLIS.2

## Resumen

TRELLIS.2 es un modelo de generación 3D a partir de imágenes desarrollado originalmente por Microsoft, cuyo repositorio base es `microsoft/TRELLIS.2-4B`. La ficha que nos ocupa, `ZainHu/TRELLIS.2`, no es un modelo nuevo entrenado desde cero, sino un reempaquetado de los pesos originales en formato de archivo único para su uso en ComfyUI. El autor de este repositorio es el usuario ZainHu, y su aportación consiste en organizar los ficheros (modelo de difusión, VAEs específicos de forma y textura, y un codificador de visión DINOv3 ViT-L) de modo que puedan cargarse directamente en los nodos de ComfyUI.

El modelo resuelve el problema de convertir una sola imagen 2D en una malla 3D con geometría y textura, una tarea conocida como image-to-3D. Se distribuye bajo licencia MIT y el repositorio ocupa 18,8 GB, lo que refleja la presencia de pesos en bf16 junto con una variante cuantizada a int8. La relevancia actual radica en que facilita el acceso a un pipeline de generación 3D de Microsoft dentro de un entorno de nodos gráfico ampliamente usado por artistas y desarrolladores, sin necesidad de escribir código de inferencia.

No se dispone de información sobre arquitectura interna detallada, número exacto de parámetros activos, contexto o idiomas en la documentación proporcionada. El nombre del modelo base sugiere 4B de parámetros, pero este dato no se confirma en la model card del reempaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación 3D; el repositorio incluye un codificador de visión DINOv3 ViT-L y dos VAEs, de forma y de textura) |
| Parametros totales | no disponible (el nombre del modelo base sugiere 4B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `trellis_2_int8_convrot.safetensors`) y bf16 (`trellis_2_bf16.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (archivos únicos para ComfyUI: modelo de difusión, VAE de forma, VAE de textura y codificador de visión) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de que se trata de un modelo de difusión para generación 3D. El reempaquetado incluye cuatro componentes diferenciados: un codificador de visión `dino_v3_vit_l.safetensors`, un modelo de difusión en dos variantes (`trellis_2_int8_convrot.safetensors` y `trellis_2_bf16.safetensors`), un VAE de forma (`trellis_2_shape_vae_bf16.safetensors`) y un VAE de textura (`trellis_2_texture_vae_bf16.safetensors`). Esta separación sugiere un pipeline en el que la imagen de entrada se codifica con DINOv3, se genera la geometría mediante el modelo de difusión y el VAE de forma, y posteriormente se sintetiza la textura con el VAE de textura.

No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal. Cualquier afirmación al respecto sería especulativa y no se incluye.

## Capacidades

- Generación de mallas 3D a partir de una imagen de entrada (image-to-3D), con geometría y textura.
- Codificación de la imagen de referencia mediante DINOv3 ViT-L, lo que permite capturar información visual rica antes de la difusión.
- Separación explícita entre generación de forma y generación de textura, lo que facilita controlar o reutilizar cada etapa por separado.
- Integración nativa con ComfyUI mediante archivos de modelo único y un workflow oficial de plantilla.
- Variante cuantizada a int8 para reducir requisitos de memoria frente a la versión bf16.
- No se documentan capacidades de texto, razonamiento, código, tool calling, agentes ni multilingüismo, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un concepto 2D o una foto, el pipeline genera una malla texturizada que sirve como base para retopología y ajuste manual en Blender.
- Diseño de producto y previsualización: convertir un render o boceto de un objeto en un modelo 3D aproximado para evaluar volumen y proporciones antes de modelar en CAD.
- Creación de contenido para realidad aumentada: generar modelos 3D ligeros a partir de imágenes de catálogo para visualizaciones web o apps de AR, usando la variante int8 para reducir el coste de inferencia.
- Flujos artísticos en ComfyUI: integrar el nodo de image-to-3D en pipelines gráficos existentes para iterar sobre variaciones de un mismo concepto sin salir del entorno de nodos.
- Docencia y divulgación: demostrar en talleres cómo un modelo de difusión 3D transforma una imagen en malla, con un workflow reproducible y pesos de acceso libre.
- Investigación en generación 3D: servir como línea base reproducible para comparar técnicas de texturizado o de generación de geometría, gracias a la licencia MIT y a la disponibilidad de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 18,8 GB, pero la inferencia solo requiere cargar los componentes necesarios según el workflow; la variante int8 reduce el peso del modelo de difusión frente a bf16.
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un pipeline con modelo de difusión de varios miles de millones de parámetros, dos VAEs y un ViT-L suele requerir GPUs con al menos 16-24 GB de VRAM en bf16, y menos en int8; esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, se espera que funcione en GPUs de gama alta para consumidor (RTX 4090, RTX 3090) y en GPUs de centro de datos (A100, H100), pero no hay datos oficiales.
- Despliegue: ComfyUI es el entorno soportado explícitamente, con carpetas `models/clip_vision`, `models/diffusion_models` y `models/vae`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de TRELLIS.2 en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI, no el modelo original; para documentación técnica completa conviene consultar `microsoft/TRELLIS.2-4B`.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos visuales puede reproducir sesgos presentes en dichos datos.
- Riesgo de alucinación geométrica: como todo modelo generativo 3D, puede producir mallas con artefactos, geometría inconsistente o texturas incorrectas en zonas ocluidas de la imagen de entrada.
- No hay información sobre resolución de salida, topología garantizada ni calidad de malla en casos límite.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base original y de los componentes (DINOv3, VAEs) antes de explotarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en la misma fecha, por lo que no hay validación comunitaria de su funcionamiento.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Repositorio del reempaquetado: https://huggingface.co/ZainHu/TRELLIS.2
- Modelo base original: https://huggingface.co/microsoft/TRELLIS.2-4B
- Workflow de ComfyUI (Pixal3D & TRELLIS.2: Image to Model): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_pixal3d_trellis2_image_to_model.json
