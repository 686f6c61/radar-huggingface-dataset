# Xabsurd/MOSS-Image-Tile-Control

## Resumen

MOSS-Image Tile Control es un adaptador de control de tipo tile para la familia de modelos de generación de imágenes MOSS-Image, desarrollado por el usuario Xabsurd y publicado en Hugging Face. Su función es preservar la composición, los contornos del sujeto y la estructura local de una imagen de referencia mientras el modelo subyacente regenera texturas y detalles. Se enmarca en la categoría de adaptadores ControlNet/LoRA para image-to-image, orientados a tareas de refinado, mejora de detalle y variaciones guiadas por una imagen existente.

El adaptador se distribuye en dos versiones beta: beta 2, implementada como un LoRA sobre MOSS-Image-Base y compatible con los nodos nativos de ComfyUI que soportan control de MOSS-Image; y beta 3, implementada como una rama residual de control ligera e independiente sobre MOSS-Image-SFT, que requiere nodos personalizados (`ComfyUI-Moss-Tile-Control`) y ofrece un ajuste más fino de la fuerza de control mediante un único parámetro que escala los residuales por capa.

El modelo es relevante para flujos de trabajo de restauración y upscaling en ComfyUI, donde se necesita regenerar detalle sin alterar la estructura global de la imagen. El repositorio ocupa 0,4 GB y no registra descargas ni valoraciones en el momento de la consulta. La licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de control (tile) sobre MOSS-Image; beta 2 como LoRA con acondicionamiento de imagen concatenado, beta 3 como rama residual de control ligera |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los workflows de prueba usan SFT INT8) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base (beta 2), OpenMOSS-Team/MOSS-Image-SFT (beta 3) |
| Pipeline | image-to-image |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se apoya en la familia MOSS-Image y actúa como módulo de control externo. En beta 2 el control se implementa como un LoRA sobre el backbone junto con un acondicionamiento de imagen concatenado, gestionado a través del nodo nativo `MOSS-Image Color/Depth Control` de ComfyUI: la imagen de referencia se conecta a `color_map` sin necesidad de convertirla en mapa de regiones de color ni en mapa de profundidad. En beta 3 el control se implementa como una rama residual ligera e independiente que no se fusiona en el backbone como LoRA ni reemplaza la proyección de entrada del modelo; un único parámetro `strength` escala los residuales de control a través de las capas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens de imagen ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación. El autor indica que ha probado manualmente una variedad de imágenes con resultados globales positivos, y publica checkpoints por época (beta 3 épocas 1 y 2; beta 2 época 1), lo que sugiere un entrenamiento breve y orientado a un adaptador ligero. Los workflows de prueba se guardan con SFT INT8 y un LoRA de aceleración de terceros (Coffmeteor, 15 pasos).

## Capacidades

- Control de composición y estructura: preserva la disposición global, los contornos del sujeto y la estructura local de una imagen de referencia mientras regenera texturas y detalles.
- Mejora de detalle y refinado: pensado para aplicar tras un upscaling, regenerando detalle en lugar de copiar píxeles.
- Variaciones guiadas por imagen: genera variaciones de una imagen existente manteniendo su estructura.
- Integración en ComfyUI: beta 2 usa nodos nativos de una versión de ComfyUI con soporte de control MOSS-Image; beta 3 requiere los nodos personalizados `ComfyUI-Moss-Tile-Control`.
- Ajuste de fuerza de control: en beta 2 mediante la fuerza del nodo de control y la fuerza del LoRA por separado; en beta 3 mediante un único parámetro que escala los residuales por capa.
- Compatibilidad con aceleración: los workflows de prueba emplean un LoRA de aceleración de terceros de 15 pasos.
- Soporte de color-match: las variantes de coincidencia de color requieren el nodo `ColorMatchV2` de ComfyUI-KJNodes.
- Idiomas: etiquetado para inglés (en); no se documentan capacidades multilingües adicionales.

## Casos de uso

- Refinado tras upscaling: aplicar el adaptador sobre una imagen ampliada para regenerar texturas y microdetalle manteniendo la composición original, evitando el aspecto plástico de un upscaler puro.
- Restauración de detalle en imágenes borrosas: el adaptador toma una entrada desenfocada y regenera detalle coherente con la estructura, como muestran los ejemplos antes/después del autor.
- Variaciones controladas de una imagen: generar alternativas de una imagen manteniendo sujeto y encuadre, útil para explorar estilos o acabados sin perder la composición.
- Flujos de posproducción en ComfyUI: integrar el adaptador en grafos existentes de MOSS-Image para tareas de retoque por tiles, con control de fuerza ajustable según la fidelidad deseada.
- Iteración rápida con beta 2: usar la versión LoRA con nodos nativos cuando no se quiera instalar nodos personalizados, por ejemplo en entornos de prueba o pipelines ya establecidos.
- Control fino con beta 3: emplear la rama residual cuando se necesite graduar con precisión cuánto se modifica la imagen respecto a la referencia, con un único parámetro de fuerza.
- Prototipado de pipelines image-to-image: servir como componente de control en experimentos de generación condicionada por estructura dentro de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MOSS-Image y de la cuantización empleada (los workflows de prueba usan SFT INT8).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa 0,4 GB, pero el requisito real lo determina el modelo base.
- Opciones de despliegue: ComfyUI (beta 2 con nodos nativos; beta 3 con los nodos personalizados `ComfyUI-Moss-Tile-Control`). No se documentan otros entornos como vLLM, llama.cpp, Ollama o TGI, que además no aplican a un pipeline de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image Tile Control (beta 2) | LoRA + acondicionamiento concatenado | MOSS-Image-Base | no disponible | no disponible | Hugging Face, ComfyUI nativo |
| MOSS-Image Tile Control (beta 3) | Rama residual de control | MOSS-Image-SFT | no disponible | no disponible | Hugging Face, nodos personalizados |
| ControlNet tile para Stable Diffusion | Adaptador ControlNet | Stable Diffusion | no disponible | no disponible | Ecosistema amplio (ComfyUI, A1111) |
| Otros adaptadores tile para MOSS-Image | no disponible | MOSS-Image | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las salidas son generadas, no copiadas: no se garantiza la reconstrucción exacta de píxeles ni la recuperación de detalles auténticos del original.
- Ambas versiones están etiquetadas como beta; el autor las describe como versiones de prueba con resultados positivos en pruebas manuales, sin evaluación sistemática publicada.
- Los archivos de beta 2 y beta 3 no son intercambiables: difieren en formato de pesos y método de carga, y valores de fuerza iguales no implican el mismo grado de control entre versiones.
- En beta 2, poner la fuerza de control a 0 no desactiva el LoRA tile; para desactivarlo por completo hay que hacer bypass del cargador de LoRA y del nodo de acondicionamiento.
- En beta 3, con fuerza de control a 0 el control tile se desactiva y se preserva el modelo de entrada con su configuración.
- beta 2 está orientada a la familia Base; su comportamiento sobre SFT debe evaluarse por separado.
- beta 3 requiere instalar nodos personalizados de terceros (`ComfyUI-Moss-Tile-Control`); las variantes de color-match requieren además `ColorMatchV2` de ComfyUI-KJNodes.
- Los checkpoints comparten nombre de archivo; es necesario conservar los subdirectorios de versión y época al instalar más de uno.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Idioma documentado únicamente en inglés; no se detallan sesgos conocidos ni tasas de alucinación.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xabsurd/MOSS-Image-Tile-Control
- Pesos beta 3 época 2 (recomendado): https://huggingface.co/Xabsurd/MOSS-Image-Tile-Control/resolve/main/beta3/epoch2/adapter_model.safetensors
- Pesos beta 3 época 1: https://huggingface.co/Xabsurd/MOSS-Image-Tile-Control/resolve/main/beta3/epoch1/adapter_model.safetensors
- Pesos beta 2 época 1 (LoRA para MOSS-Image-Base): https://huggingface.co/Xabsurd/MOSS-Image-Tile-Control/resolve/main/beta2/epoch1/adapter_model.safetensors
- Workflows de ComfyUI y nodos personalizados: https://huggingface.co/Xabsurd/MOSS-Image-Tile-Control/resolve/main/workflow-and-nodes.zip
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Nodos ComfyUI-KJNodes (para ColorMatchV2): https://github.com/kijai/ComfyUI-KJNodes
- Apoyo al autor: https://ko-fi.com/xabsurd
