# VoidEclipseAI/MiniMax-H3-ReFrame-VideoInpainting-LoRA

## Resumen

MiniMax-H3-ReFrame-VideoInpainting-LoRA es un adaptador LoRA desarrollado por VoidEclipseAI que se aplica sobre el modelo base MiniMax H3 (variante Ref2VA) para convertir un montaje aproximado de video en un clip final coherente. El LoRA enseña al modelo base a interpretar el gris plano RGB 128 como una zona vacía que debe rellenarse con contenido de fondo o escena coherente con el plano circundante, manteniendo los sujetos desplazados y fusionando sus bordes con el nuevo entorno. Forma parte de ReFrameVideo, un proyecto personal de código abierto que incluye un editor de video donde los elementos del metraje se tratan como capas al estilo Photoshop.

El adaptador resuelve un problema concreto del flujo de edición por capas: sin él, H3 tiende a tratar las zonas grises como parte de la imagen y las conserva o copia. Con el LoRA, esas áreas se rellenan de forma contextual, lo que permite cambiar la relación de aspecto, mover o escalar sujetos y eliminar elementos con un relleno visualmente plausible. Es relevante porque habilita flujos de reencuadre y borrado de objetos sobre un modelo de video-to-video de gama alta, con un coste de inferencia reducido gracias al uso de un LoRA de aceleración.

El repositorio ocupa 0,7 GB y contiene el peso del LoRA en formato safetensors, junto con la licencia y el aviso requerido para derivados de MiniMax H3. La información disponible no detalla la arquitectura interna del modelo base, el número de parámetros ni la longitud de contexto, por lo que esos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 Ref2VA; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el repo pesa 0,7 GB e incluye pesos LoRA, licencia y aviso) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base recomendado se distribuye como `minimax_h3_ref2va_int8_convrot.safetensors` (int8); el LoRA se distribuye en safetensors (precisión no especificada) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community-license-agreement) |
| Formato de pesos | safetensors (`ReFrameVideo-H3-LoRA-v1.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre MiniMax H3 en su variante Ref2VA, un modelo de generación y edición de video que acepta referencias visuales (`<Video 1>`, `<Picture N>`) y un prompt en formato de seis secciones. El adaptador fue entrenado con entradas preparadas de la misma forma que las genera ReFrameVideo: un rough cut con los sujetos en sus nuevas posiciones y las zonas vacías pintadas exactamente en RGB 128, una máscara de redibujado por píxel que cubre los huecos más una banda fina de mezcla, y opcionalmente una imagen de primer fotograma como referencia.

El entrenamiento se realizó exclusivamente con metraje de acción real, sin contenido generado por IA. No se dispone de datos sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO. La innovación principal es el condicionamiento del modelo base para interpretar el gris 128 como señal de relleno, lo que permite regenerar el clip completo y rellenar los huecos del montaje. El flujo recomendado combina este LoRA con un LoRA de aceleración (Pika H3 Flex) para reducir la inferencia a 6 pasos.

## Capacidades

- Relleno de video (video inpainting) sobre zonas enmascaradas, con generación de fondo y escena coherentes con el plano.
- Reencuadre y cambio de relación de aspecto: amplía el encuadre rellenando las áreas nuevas.
- Edición por capas: mover, escalar o eliminar sujetos manteniendo el resto del clip.
- Conservación de sujetos desplazados y fusión de bordes con el nuevo entorno.
- Uso opcional de imágenes de referencia (primer fotograma, placa de fondo, referencias de personaje) para estabilizar el fondo.
- Generación de video-to-video a partir de un rough cut y una máscara por píxel.
- Integración con ComfyUI mediante el nodo `ReframeH3InpaintMask` del paquete `ComfyUI-Reframe`.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento.

## Casos de uso

- Reencuadre de material rodado en 16:9 a vertical para redes sociales: se cambia la relación de aspecto en el editor, el LoRA rellena los laterales con fondo coherente y se obtiene un clip listo para publicar sin recortar al sujeto.
- Eliminación de objetos no deseados en postproducción: se enmascara el elemento (por ejemplo, un cable o una señal), se pinta el hueco en gris 128 y el modelo regenera el fondo detrás del objeto.
- Reubicación de sujetos en el plano: se mueve una persona o un objeto como una capa en Photoshop y el LoRA rellena el espacio que deja y fusiona el borde en la nueva posición.
- Estabilización de planos con cámara suave: en tomas estáticas o con movimiento leve, el adaptador rellena huecos con mayor fidelidad, lo que resulta útil para limpiar planos de archivo antes de montaje.
- Creación de placas de fondo para composición: se usa una imagen de primer fotograma como referencia y se generan extensiones del fondo que sirven como plate para integrar elementos en etapas posteriores.
- Prototipado rápido en ComfyUI: con el LoRA de aceleración y 6 pasos, un clip de unos 5 segundos se genera en 4-5 minutos en una RTX 4090, lo que permite iterar sobre el montaje antes de un render final.
- Flujos de previsualización en producción audiovisual: el editor exporta el grafo `workflow_api.json` junto con rough cut, máscara y referencias, de modo que el equipo puede reproducir y ajustar la generación en su propio entorno ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base recomendado se distribuye en int8 (`minimax_h3_ref2va_int8_convrot.safetensors`), lo que reduce los requisitos frente a una versión en precisión completa, pero no se indica la cifra exacta.
- GPU recomendadas: RTX 4090 para el flujo documentado (clip de ~5 s en 4-5 minutos con 6 pasos y LoRA de aceleración).
- Cabe en GPU de consumo: sí, según el ejemplo del autor con RTX 4090; no se confirman otros modelos de consumo.
- Opciones de despliegue: ComfyUI (flujo principal), con el nodo `ReframeH3InpaintMask` del paquete `ComfyUI-Reframe`; también se puede usar en un workflow propio de ComfyUI siguiendo el formato de entradas del autor.
- Resolución recomendada: 768p (lado corto 768, por ejemplo 1344×768 en 16:9).
- Latencia y throughput: ~4-5 minutos por clip de ~5 s en RTX 4090 con 6 pasos; no se aportan más datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador depende del modelo base MiniMax H3 Ref2VA y de su licencia, por lo que la comparación con alternativas de video inpainting requeriría datos que no están disponibles.

## Limitaciones y advertencias

- Sin comprensión 3D real: con movimiento de cámara fuerte los huecos se rellenan, pero la profundidad, la oclusión y el contacto pueden ser incorrectos (por ejemplo, un objeto que debería pasar delante de una persona desplazada queda detrás).
- Entrenado solo con metraje de acción real, sin contenido generado por IA; puede generalizar peor a animación, dibujos animados o renders 3D.
- Los huecos grandes con forma de persona pueden rellenarse con una persona nueva; las manos y los detalles finos pueden degradarse.
- El fondo puede derivar a lo largo del clip si no se aporta una imagen de primer fotograma limpia.
- El video final es la salida completa del modelo, por lo que las zonas fuera de la máscara pueden diferir ligeramente del original.
- Es la versión v1 de un proyecto personal y sigue siendo experimental.
- Licencia MiniMax H3 Community License Agreement: es un derivado de MiniMax H3 y está sujeto a los términos de dicha licencia; deben revisarse las restricciones de uso comercial antes de producción.
- No se documentan sesgos específicos ni riesgos de alucinación textual, al tratarse de un modelo de video.

## Enlaces

- Hugging Face: https://huggingface.co/VoidEclipseAI/MiniMax-H3-ReFrame-VideoInpainting-LoRA
- Repositorio ReFrameVideo: https://github.com/VoidEclipseAI/ReFrameVideo
- Guía de instalación: https://github.com/VoidEclipseAI/ReFrameVideo/blob/main/docs/安装.md
- README de ReFrameVideo: https://github.com/VoidEclipseAI/ReFrameVideo#readme
- Espejo en ModelScope: https://modelscope.cn/models/VoidEclipseAI/ReFrameVideo-LoRA
- LoRA de aceleración Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Copia ComfyUI de MiniMax H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
