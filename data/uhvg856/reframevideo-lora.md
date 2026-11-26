# Uhvg856/ReFrameVideo-LoRA

## Resumen

ReFrameVideo H3 LoRA es un adaptador LoRA para el modelo de generación de vídeo MiniMax H3, concretamente para su variante Ref2VA (referencia a vídeo/audio). Lo publica el usuario Uhvg856 bajo el paraguas del proyecto personal de código abierto ReFrameVideo, que combina este LoRA con un editor de vídeo por capas. El adaptador resuelve un problema muy concreto: convertir un montaje aproximado en un clip final coherente, enseñando al modelo base que el gris plano RGB 128 significa "zona vacía que hay que rellenar".

El modelo base, MiniMax H3, es un generador de vídeo de MiniMax con pipeline video-to-video; el LoRA se distribuye como un único archivo safetensors de aproximadamente 0,6 GB dentro del repositorio. No se dispone de información pública sobre el número de parámetros del LoRA ni del modelo base en la documentación proporcionada.

Su relevancia es práctica: permite flujos de edición de vídeo por capas (mover, escalar o eliminar sujetos, cambiar la relación de aspecto) sin rehacer el plano desde cero, delegando el relleno de huecos y la fusión de bordes al modelo generativo. Es un proyecto experimental en versión v1, orientado a usuarios de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 Ref2VA, modelo de generación de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base recomendado se distribuye en int8 (`minimax_h3_ref2va_int8_convrot.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (licencia `other`) |
| Formato de pesos | safetensors (`ReFrameVideo-H3-LoRA-v1.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre MiniMax H3 en su variante Ref2VA, un modelo de generación y edición de vídeo condicionado por vídeo de referencia y, opcionalmente, imágenes de referencia. El adaptador fue entrenado con entradas preparadas de la misma forma que las genera la herramienta ReFrameVideo: un montaje aproximado con los sujetos en su nueva posición y las zonas vacías pintadas exactamente en RGB 128, junto con una máscara de redibujado por píxel que cubre los huecos más una banda fina de mezcla.

La innovación técnica clave es la convención de relleno: sin el LoRA, H3 tiende a interpretar el gris como parte de la imagen y lo conserva o lo copia; con el LoRA, el modelo aprende que el gris 128 equivale a "vacío, relléname" y genera contenido de fondo coherente con el plano, mantiene los sujetos desplazados y funde sus bordes con el nuevo entorno. No se han publicado datos sobre el volumen de tokens, la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Edición de vídeo video-to-video: regenera un clip completo a partir de un montaje aproximado y rellena las zonas vacías.
- Inpainting de vídeo con máscara por píxel: respeta la máscara de redibujado y mezcla los bordes de los sujetos movidos.
- Reposicionamiento de sujetos: mantiene a las personas u objetos en las nuevas posiciones definidas en el montaje.
- Cambio de relación de aspecto: permite reformatear el plano y reconstruir el contenido que falta.
- Condicionamiento por imagen de referencia opcional: una primera fotograma limpio, un fondo o referencias de personaje estabilizan el resultado.
- Compatibilidad con LoRA de aceleración (Pika H3 Flex) para reducir los pasos de muestreo a 6.
- Integración con ComfyUI mediante el nodo `ReframeH3InpaintMask` del paquete `ComfyUI-Reframe`.

## Casos de uso

- Reencuadre de material rodado: cambiar de 16:9 a vertical para redes sociales y dejar que el LoRA reconstruya los laterales que faltan, usando un primer fotograma limpio como referencia para estabilizar el fondo.
- Eliminación de elementos no deseados: borrar un objeto o una persona del plano en el editor por capas y regenerar la zona con contenido coherente con la escena.
- Reposicionamiento de sujetos en postproducción: mover a un actor dentro del encuadre sin volver a rodar, manteniendo su apariencia y fundiendo sus bordes con el entorno.
- Relleno de huecos en montajes con recortes: completar las áreas grises que deja un montaje rápido en planos estáticos o con cámara suave.
- Prototipado rápido de variantes de plano: generar varias versiones de un mismo encuadre con distintos fondos o composiciones antes de decidir el montaje final.
- Flujos de trabajo en ComfyUI: exportar el grafo exacto (`workflow_api.json`) con montaje, máscara y referencias desde ReFrameVideo y procesarlo por lotes en una instalación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base se recomienda en cuantización int8, lo que condiciona el consumo.
- GPU recomendada por el autor: RTX 4090, con la que un clip de unos 5 segundos tarda aproximadamente 4–5 minutos usando 6 pasos y resolución 768p.
- Configuración recomendada: modelo base `minimax_h3_ref2va_int8_convrot.safetensors`, LoRA ReFrameVideo a escala 1.0 y LoRA de aceleración Pika H3 Flex a 1.0.
- Resolución de trabajo: 768p (lado corto 768, por ejemplo 1344×768 en 16:9).
- Despliegue: ComfyUI con el paquete de nodos `ComfyUI-Reframe`; también existe un espejo en ModelScope para descargas más rápidas en China continental.
- Throughput y latencia en otras GPU: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables en la documentación proporcionada. Como referencia contextual, el propio modelo base MiniMax H3 Ref2VA es la alternativa directa sin el LoRA, y el LoRA de aceleración Pika H3 Flex es un complemento, no un sustituto.

| Modelo | Tipo | Base | Licencia | Disponibilidad |
|---|---|---|---|---|
| ReFrameVideo H3 LoRA | LoRA de edición de vídeo | MiniMax H3 Ref2VA | MiniMax H3 Community License | Hugging Face y ModelScope |
| MiniMax H3 Ref2VA | Modelo base de generación de vídeo | — | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |
| Pika H3 Flex | LoRA de aceleración | MiniMax H3 Ref2VA | no disponible | Hugging Face (Pika-Labs) |

## Limitaciones y advertencias

- Sin comprensión 3D real: con movimiento de cámara fuerte, la profundidad, la oclusión y el contacto pueden ser incorrectos (por ejemplo, un objeto que debería pasar por delante de una persona movida queda detrás). Funciona mejor en planos estáticos o con movimiento suave.
- Entrenado solo con metraje de acción real, sin contenido generado por IA, por lo que puede generalizar peor a animación, dibujos o renders 3D.
- Los huecos grandes con forma de persona pueden rellenarse con una persona nueva; las manos y los detalles finos pueden degradarse.
- El fondo puede derivar a lo largo del clip si no se aporta una imagen de referencia del primer fotograma.
- La salida es el vídeo completo del modelo, así que las zonas fuera de la máscara pueden diferir ligeramente del original.
- Es la versión v1 de un proyecto personal y sigue siendo experimental.
- Restricción de licencia crítica: la MiniMax H3 Community License Agreement solo se aplica fuera de los territorios excluidos (Unión Europea, Reino Unido, República de Corea y Estados Unidos). Los usuarios de esas regiones no están licenciados para usar MiniMax H3 ni sus derivados bajo este acuerdo y deben solicitar licencia a MiniMax.
- Riesgo de alucinación visual y de sesgos: no se han publicado evaluaciones al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/Uhvg856/ReFrameVideo-LoRA
- Espejo en ModelScope: https://modelscope.cn/models/VoidEclipseAI/ReFrameVideo-LoRA
- Repositorio ReFrameVideo: https://github.com/VoidEclipseAI/ReFrameVideo
- Guía de instalación: https://github.com/VoidEclipseAI/ReFrameVideo/blob/main/docs/安装.md
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA de aceleración Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Copia de ComfyUI del modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Vídeo promocional: https://huggingface.co/VoidEclipseAI/ReFrameVideo-LoRA/resolve/main/assets/reframevideo_promo.mp4
