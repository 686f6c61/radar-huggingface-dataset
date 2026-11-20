# VoidEclipseAI/ReFrameVideo-LoRA

## Resumen

ReFrameVideo-LoRA es un adaptador LoRA para el modelo generativo de vídeo MiniMax H3 (variante Ref2VA), desarrollado por VoidEclipseAI como parte de un proyecto personal de código abierto. Su función es convertir un montaje tosco de vídeo —donde los sujetos se han movido, escalado o eliminado como capas en un editor gráfico— en un clip final coherente, rellenando automáticamente las zonas vacías que el editor marca en gris (RGB 128). El modelo base MiniMax H3, sobre el que se aplica, es un sistema de generación y edición de vídeo de MiniMax; el LoRA actúa como adaptador de bajo rango que modifica su comportamiento para interpretar esas regiones como huecos a completar.

El adaptador resuelve un problema concreto: sin él, H3 tiende a tratar las áreas grises como contenido visual real, copiándolas o manteniéndolas en el fotograma. El LoRA reeduca al modelo para que esas zonas se rellenen con fondo o contenido coherente con la escena circundante, preservando los sujetos desplazados y difuminando sus bordes en su nueva ubicación. Se integra con ReFrameVideo, un editor de vídeo por capas que prepara automáticamente las entradas que el LoRA espera (montaje tosco, máscara de redibujado por píxel, imágenes de referencia y prompt en formato Ref2VA).

El proyecto es experimental (v1), está entrenado únicamente con metraje real y su licencia hereda las restricciones del modelo base, incluida la exclusión de la Unión Europea, Reino Unido, Corea del Sur y Estados Unidos. El repositorio ocupa 0,7 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 Ref2VA (modelo base de generación/edición de vídeo) |
| Parametros totales | no disponible (el LoRA no declara recuento; el modelo base tampoco se especifica en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El LoRA se distribuye en safetensors; el modelo base recomendado usa `minimax_h3_ref2va_int8_convrot.safetensors` (int8) y existe una variante de aceleración en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (con territorio restringido: excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors (`ReFrameVideo-H3-LoRA-v1.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre MiniMax H3 en su variante Ref2VA (referencia a vídeo), un modelo de difusión para generación y edición de vídeo. El adaptador fue entrenado con pares de entrada preparados de la misma forma que los genera la herramienta ReFrameVideo: un montaje tosco donde los sujetos están en su nueva posición y las zonas vacías pintadas exactamente en RGB 128, junto con una máscara de redibujado por píxel que cubre esas áreas más una banda fina de mezcla. El objetivo del entrenamiento es asociar el gris 128 con la semántica de "vacío, relléname", de modo que H3 complete esas regiones con contenido coherente en lugar de reproducirlas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor indica que el entrenamiento se realizó únicamente con metraje de acción real (sin contenido generado por IA), lo que condiciona su generalización a material estilizado. La integración con ComfyUI requiere el nodo `ReframeH3InpaintMask` del paquete `ComfyUI-Reframe` para convertir la máscara al grid latente de H3, y el flujo recomendado emplea 6 pasos con un LoRA de aceleración (Pika H3 Flex) a resolución 768p.

## Capacidades

- Edición de vídeo por capas: reposiciona, escala o elimina sujetos y regenera el clip completo rellenando los huecos.
- Relleno de huecos (inpainting de vídeo): completa zonas marcadas en gris con fondo o contenido de escena coherente.
- Mezcla de bordes: difumina los contornos de los sujetos movidos en su nueva ubicación.
- Cambio de relación de aspecto con reencuadre generativo.
- Control mediante imágenes de referencia opcionales (primer fotograma, placa de fondo, referencias de personaje).
- Condicionamiento por prompt en el formato de seis secciones de H3 Ref2VA.
- Integración con ComfyUI mediante nodos personalizados y exportación de `workflow_api.json`.
- No dispone de tool calling, function calling ni capacidades de agente; es un adaptador puramente generativo de vídeo.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Reencuadre de material rodado: cambiar la relación de aspecto de un clip (por ejemplo, de 16:9 a 9:16 para redes) moviendo los sujetos a la nueva composición y dejando que el LoRA rellene los márgenes con fondo coherente.
- Eliminación de objetos o personas en postproducción: borrar un elemento del plano, marcar la zona como vacía y regenerar el fondo que queda detrás, útil para limpiar tomas sin reshoots.
- Reposicionamiento de sujetos: recolocar a un actor dentro del encuadre y regenerar el espacio que deja libre, manteniendo la iluminación y el fondo de la escena.
- Prototipado rápido de planos: generar variantes de composición de una toma a partir de un montaje tosco antes de comprometer recursos de VFX.
- Limpieza de continuidad: corregir elementos que aparecen o desaparecen entre planos rellenando las zonas problemáticas con contenido consistente.
- Flujos de trabajo en ComfyUI: integrar el LoRA en pipelines automatizados de edición de vídeo por lotes, exportando grafos desde ReFrameVideo y ejecutándolos en ComfyUI con 6 pasos y el LoRA de aceleración para reducir tiempos (unos 4-5 minutos por clip de ~5 s en una RTX 4090).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta un dato operativo: en una RTX 4090, un clip de aproximadamente 5 segundos tarda entre 4 y 5 minutos con la configuración recomendada (6 pasos, resolución 768p, LoRA de aceleración a 1.0).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base MiniMax H3 Ref2VA en int8, que no se detalla en la información.
- GPU recomendadas: el autor cita una RTX 4090 como referencia de rendimiento (4-5 minutos por clip de ~5 s a 768p con 6 pasos).
- Compatibilidad con GPU de consumo: sí, al menos en RTX 4090 según el dato del autor; no se confirman otras GPU de consumo.
- Opciones de despliegue: ComfyUI (flujo principal, con el paquete de nodos `ComfyUI-Reframe`) y la aplicación ReFrameVideo, que encola los workflows en ComfyUI.
- Latencia y throughput: ~4-5 minutos por clip de ~5 segundos en RTX 4090 con la configuración recomendada; no se aportan más métricas.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReFrameVideo-LoRA | LoRA de edición/relleno de vídeo | MiniMax H3 Ref2VA | 768p (lado corto) | MiniMax H3 Community License (territorio restringido) | Hugging Face y ModelScope |
| Pika H3 Flex | LoRA de aceleración | MiniMax H3 Ref2VA | no disponible | no disponible en la información | Hugging Face (Pika-Labs) y Comfy-Org |
| MiniMax H3 (base) | Modelo generativo de vídeo | — | no disponible | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |

No se dispone de información sobre otros adaptadores de relleno de vídeo comparables en los datos proporcionados; la comparativa se limita a los componentes del ecosistema H3 citados por el autor.

## Limitaciones y advertencias

- Sin comprensión 3D real: con movimiento de cámara fuerte, la profundidad, la oclusión y el contacto pueden ser incorrectos (por ejemplo, un objeto que debería pasar por delante de una persona movida queda detrás).
- Entrenado solo con metraje real: puede generalizar peor a material estilizado como animación, dibujos o renders 3D.
- Los huecos grandes con forma de persona pueden rellenarse con una persona nueva; las manos y los detalles finos pueden degradarse.
- El fondo puede derivar a lo largo del clip si no se aporta una imagen de referencia del primer fotograma.
- El vídeo final es la salida completa del modelo, por lo que las zonas fuera de la máscara pueden diferir ligeramente del original.
- Es la v1 de un proyecto personal y sigue siendo experimental.
- Licencia restrictiva: la MiniMax H3 Community License excluye expresamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos; los usuarios de esas regiones no están licenciados para usar el modelo ni sus derivados bajo este acuerdo.
- Riesgo de sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo generativo de vídeo existe riesgo de contenido inventado o incoherente en las zonas regeneradas.
- No se declaran idiomas soportados ni límites de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/VoidEclipseAI/ReFrameVideo-LoRA
- ModelScope (mirror): https://modelscope.cn/models/VoidEclipseAI/ReFrameVideo-LoRA
- Repositorio ReFrameVideo: https://github.com/VoidEclipseAI/ReFrameVideo
- Guía de instalación: https://github.com/VoidEclipseAI/ReFrameVideo/blob/main/docs/安装.md
- README de ReFrameVideo: https://github.com/VoidEclipseAI/ReFrameVideo#readme
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA de aceleración Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Copia ComfyUI del modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia MiniMax H3 (en el repo): LICENSE
- Aviso requerido: NOTICE
