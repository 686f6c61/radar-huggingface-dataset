# zhust24/WB-WAM

## Resumen

WB-WAM es un conjunto de pesos publicado en Hugging Face bajo el identificador `zhust24/WB-WAM`, etiquetado con las categorías `robotics`, `world-model` y `action-model`. Se trata de un repositorio de 9 checkpoints de tipo *weight-only* (solo pesos), acompañados de sus respectivos ficheros `config.yaml` y `dataset_stats.json` generados durante el entrenamiento. El pipeline declarado es `robotics`, lo que sitúa al modelo en el ámbito de los modelos de acción y mundo para robótica (World Action Models, WAM), una familia emergente que combina predicción de futuros y generación de acciones.

La información disponible indica que los checkpoints cubren tres etapas: un preentrenamiento completo (`pretrain/step_037617.pt`), un *midtrain* intermedio denominado Pico (`midtrain/step_020560.pt`) y siete pesos de postentrenamiento específicos para tareas de HumanoidArena (`humanoid_arena_native50/`), con tareas como `box_shelf`, `hammer`, `kick_football`, `obstacle_navigation`, `open_door`, `punch_markers` y `sit_sofa`. Tanto el *midtrain* como los siete pesos de HumanoidArena se inicializan directamente desde el checkpoint de preentrenamiento completo, y la postentrenamiento emplea acciones de referencia SONIC originales a 50 Hz con estadísticas de normalización independientes por tarea.

Es relevante ahora porque representa un ejemplo de publicación abierta (aunque incompleta) de pesos para robótica humanoide basados en un *backbone* de modelo de mundo, presumiblemente derivado de activos de Wan2.2 (la tarjeta menciona explícitamente que el repositorio no incluye esos activos de nivel superior). No obstante, la model card no especifica número de parámetros, longitud de contexto, licencia ni idiomas, por lo que la mayoría de las especificaciones técnicas quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona dependencia de activos Wan2.2 upstream, sin detallar la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints distribuidos son de tipo weight-only, formato .pt) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt); checkpoints weight-only |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los únicos indicios técnicos son que se distribuyen checkpoints *weight-only* en formato `.pt`, que existen ficheros de configuración (`config.yaml`) y estadísticas de dataset (`dataset_stats.json`) por checkpoint, y que el repositorio depende de "activos de nivel superior Wan2.2". Esto sugiere que WB-WAM parte de un modelo de mundo con backbone de generación de vídeo (familia Wan2.2), reutilizado para condicionar acciones, pero no se confirma en la información proporcionada. No se detalla si se emplea transformer, MoE, SSM o una arquitectura híbrida.

El entrenamiento se organiza en tres fases declaradas. Primero un preentrenamiento completo (`pretrain/step_037617.pt`). Después un *midtrain* llamado Pico (`midtrain/step_020560.pt`). Por último, siete postentrenamientos independientes para tareas de HumanoidArena, todos inicializados desde el checkpoint de preentrenamiento completo, empleando las acciones de referencia SONIC originales a 50 Hz y estadísticas de normalización separadas por tarea. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o decodificación especulativa. El repositorio no incluye estados del optimizador ni los datasets, por lo que no es posible reproducir el entrenamiento con lo publicado.

## Capacidades

- Robótica humanoide: el repositorio cubre tareas de manipulación y locomoción como `box_shelf`, `hammer`, `kick_football`, `obstacle_navigation`, `open_door`, `punch_markers` y `sit_sofa`.
- Modelado de mundo y acción: las etiquetas `world-model` y `action-model` indican predicción de dinámica del entorno y generación de acciones condicionadas.
- Ejecución a 50 Hz: los postentrenamientos emplean acciones de referencia SONIC a 50 Hz, lo que apunta a control en tiempo real para humanoides.
- Multitarea: cada tarea de HumanoidArena dispone de un checkpoint y estadísticas de normalización propias.
- Capacidades de lenguaje, visión general, tool calling, agentes, matemáticas o audio: no disponibles en la información proporcionada.
- Modo de razonamiento o *thinking*: no disponible.

## Casos de uso

- Control de robots humanoides en tareas de manipulación: cargar o colocar objetos en estanterías (`box_shelf`) mediante el checkpoint específico, aprovechando el entrenamiento a 50 Hz para control de bajo nivel.
- Locomoción y navegación con obstáculos: el checkpoint `obstacle_navigation` puede emplearse para políticas de desplazamiento que eviten colisiones en entornos dinámicos.
- Interacción física con herramientas: el checkpoint `hammer` permite experimentar con tareas que requieren coordinación motora fina y aplicación de fuerza.
- Habilidades deportivas y de equilibrio: los checkpoints `kick_football` y `sit_sofa` cubren control postural y acciones balísticas, útiles en investigación sobre estabilidad.
- Manipulación de puertas y objetos articulados: el checkpoint `open_door` aborda interacción con mecanismos, un caso habitual en robótica de servicio.
- Seguimiento de referencias de movimiento: gracias al uso de acciones SONIC a 50 Hz, puede integrarse en pipelines de imitación o *motion tracking* para teleoperación y aprendizaje por demostración.
- Investigación comparativa en modelos de mundo: al publicar pesos de preentrenamiento, midtrain y postentrenamiento, permite estudiar el efecto del ajuste por tarea sobre un mismo punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del backbone Wan2.2, que no se especifica).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles en la model card; los checkpoints son `.pt` weight-only y requieren el código de entrenamiento del repositorio de GitHub para su uso.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia de las acciones SONIC a 50 Hz en HumanoidArena, que atañe al entorno de control de referencia, no al rendimiento del modelo.

## Comparativa con modelos similares

La información proporcionada no permite comparar especificaciones de WB-WAM con alternativas, ya que faltan parámetros, contexto y licencia. A continuación se listan modelos de la misma categoría (World Action Models) mencionados en la búsqueda web, indicando solo lo que dichas fuentes afirman.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WB-WAM | no disponible | no disponible | no disponible | no disponible | Pesos en Hugging Face (weight-only) |
| DreamZero | 14 (modelo fundacional de robot; unidad probablemente miles de millones) | no disponible | no disponible | no disponible | Mencionado en papel (World Action Models are Zero-shot Policies) |
| WAM-Flow | no disponible | no disponible | No comparable: el paper declara SFT más GRPO guiado por simulador | no disponible | Repositorio en GitHub (CVPR 2026) |

No se dispone de datos suficientes para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- No se publican estados del optimizador, datasets ni los activos Wan2.2 upstream, lo que impide reproducir el entrenamiento completo.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución.
- Los checkpoints de HumanoidArena usan estadísticas de normalización específicas por tarea; aplicar un checkpoint a una tarea distinta sin las estadísticas correspondientes puede degradar el rendimiento.
- No hay información sobre idiomas, contexto o capacidades generales de texto, por lo que no debe asumirse uso como modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.
- Requiere el código de entrenamiento del repositorio de GitHub para su uso, ya que los ficheros son únicamente pesos.
- Las fechas de creación y actualización (2026-09-23) son muy próximas entre sí, con apenas tres minutos de diferencia, lo que sugiere una publicación preliminar.

## Enlaces

- Hugging Face: https://huggingface.co/zhust24/WB-WAM
- Código de entrenamiento (GitHub): https://github.com/WB-WaM/WB-WAM/tree/opensource-nightly/training
- Lista curada de VLA y WAM: https://github.com/DravenALG/awesome-vla-wam
- Paper WAM-Flow (CVPR 2026): https://github.com/fudan-generative-vision/WAM-Flow
- World Action Models: The Next Frontier in Embodied AI (arXiv): https://arxiv.org/pdf/2605.12090
- Wiki sobre World Action Model: https://hyper.ai/wiki/51596
- Artículo sobre el WAM de Geely (Zhihu, contexto industrial): https://zhuanlan.zhihu.com/p/1992181369741263078
