# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920

## Resumen

Este repositorio contiene un checkpoint de política robótica identificado por el autor como "pi-0.5", entrenado para una tarea concreta de manipulación bimanual diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 coge una caja de pañuelos de un nivel de estantería, se la pasa de una mano a otra y la deposita en otro nivel (tarea "shelf-to-shelf handover"). El modelo se ha entrenado por imitación a partir de 54 episodios de teleoperación con meta-glove (sin exoesqueleto) y seguimiento de muñeca con Vive.

El checkpoint es un artefacto de investigación, no un modelo de propósito general: 3.616.769.814 parámetros (aproximadamente 3,6 mil millones), pesos en formato safetensors y un repositorio de 14,5 GB, lo que sugiere almacenamiento en fp32. La entrada es multimodal (4 cámaras RGB a 640x360 y 30 fps más el estado articular del robot) y la salida es un vector de acción de 38 dimensiones que combina posiciones articulares de ambos brazos y ambas manos. La política observa el estado real cada 16 pasos, predice un "chunk" de acciones y ejecuta las 16 primeras.

Su relevancia es metodológica: forma parte de un barrido de 24 ejecuciones que compara cuatro familias de políticas (entre ellas ACT, Diffusion Policy, GR00T de 3B y pi-0.5) sobre tres tareas, con y sin entrada táctil, y publica el error de seguimiento en lazo abierto sobre episodios reservados. La model card es explícita al señalar que no se ha ejecutado nada en hardware y que la métrica mide seguimiento de trayectoria, no éxito de tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del checkpoint indica la familia pi-0.5; la model card no describe la arquitectura) |
| Parámetros totales | 3.616.769.814 (dato real de los safetensors) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; la política observa el estado real cada 16 pasos y ejecuta un chunk de 16 acciones |
| Tipos de cuantización | no disponible (no se documenta ninguna cuantización; el tamaño del repo sugiere pesos en fp32) |
| Idiomas soportados | no disponible (es una política visomotora, no un modelo de lenguaje) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Lo que sí se documenta es el esquema de control: la política recibe Observaciones reales cada 16 pasos, predice un chunk de acciones y conserva las 16 primeras antes de volver a planificar. El espacio de estado y acción es un vector de 38 dimensiones con el siguiente desglose: `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` posiciones articulares. La entrada visual son 4 cámaras RGB a 640x360 y 30 fps.

El entrenamiento se realizó por imitación (imitation learning) sobre 54 episodios de teleoperación, con partición de 48 para entrenamiento y 6 reservados (se retiró cada décimo episodio). Se ejecutaron 10.000 pasos con semilla 1000. No se documentan en la información disponible el número de tokens, la composición del dataset más allá de lo indicado, ni si hubo etapas de RLHF o DPO. El conjunto de la tarea incluye variantes con y sin entrada táctil, y el autor informa de que, en el barrido completo de cuatro familias por tres tareas, la entrada táctil no produjo diferencias por encima del ruido y que GR00T obtuvo el error más bajo en todas las tareas.

## Capacidades

- Generación de comandos motores para manipulación bimanual: produce acciones de 38 dimensiones sobre dos brazos de 7 grados de libertad y dos manos de 12 grados de libertad cada una.
- Manipulación diestra: la mano XHand1 tiene 12 articulaciones por mano, lo que permite agarres no triviales, no solo pinzas simples.
- Transferencia de objeto entre manos (handover) dentro de una misma tarea.
- Percepción visomotora con cuatro cámaras RGB simultáneas a 640x360 y 30 fps.
- Aprendizaje por imitación a partir de demostraciones de teleoperación con meta-glove y seguimiento Vive de la muñeca.
- Planificación por chunks de acción, con reobservación del estado real cada 16 pasos.
- Variante táctil disponible como checkpoint hermano para experimentos comparativos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Punto de partida para fine-tuning en manipulación bimanual: el checkpoint se puede reentrenar con datos propios del mismo embodiment (DexMate Vega-1 con dos XHand1) para trasladar la política a una tarea nueva, aprovechando que el espacio de acción de 38 dimensiones ya está definido.
- Evaluación comparativa de familias de políticas: sirve como una de las 24 ejecuciones del barrido ACT / Diffusion Policy / GR00T 3B / pi-0.5, de modo que un equipo puede reproducir la comparación con la misma partición de 48/6 episodios y la misma métrica de error en lazo abierto.
- Validación de pipelines de teleoperación: al estar entrenado con datos de meta-glove y seguimiento Vive, permite comprobar si una cadena de captura de demostraciones produce datos coherentes, midiendo el error entre acción predicha y acción grabada.
- Investigación sobre transferencia de objeto entre manos: la tarea de pasar una caja de pañuelos de una mano a otra dentro de un mismo episodio es un caso de estudio acotado para analizar coordinación bimanual.
- Estudio del efecto de la modalidad táctil: comparando este checkpoint con `pi05tactile260920` sobre los mismos episodios reservados se puede replicar el resultado del autor de que la entrada táctil no aporta mejora por encima del ruido.
- Línea base de regresión en un pipeline de datos: el error de seguimiento en lazo abierto sobre los 6 episodios reservados (por ejemplo, 0,0451 rad en el brazo izquierdo) se puede usar como referencia para detectar degradaciones cuando se cambie el sistema de captura o el preprocesado.
- Reproducción de experimentos: con semilla 1000 y 10.000 pasos documentados, otro grupo puede intentar reproducir las cifras publicadas en la model card.
- Curado de datasets de imitación multivista: el esquema de 4 cámaras a 640x360 y 30 fps sirve de plantilla para diseñar la captura de nuevos conjuntos con la misma estructura de estado y acción.

## Benchmarks y rendimiento

La model card publica un único tipo de métrica: error en lazo abierto sobre los 6 episodios reservados, definido como la media de |acción predicha − acción grabada| en radianes, con error estándar de la media (n=6). No mide éxito de tarea ni se ejecutó en hardware.

| Métrica (rad, media ± SEM, n=6) | Brazo izquierdo | Mano izquierda | Brazo derecho | Mano derecha |
|---|---|---|---|---|
| Este modelo | 0,0451 ± 0,0040 | 0,0259 ± 0,0016 | 0,0543 ± 0,0063 | 0,0244 ± 0,0017 |
| Línea base hold-first-frame | 0,3538 | 0,2351 | 0,2926 | 0,2373 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes en robótica como tasas de éxito por tarea) en la información disponible. El autor indica que, en el barrido de cuatro familias por tres tareas, GR00T obtuvo el error más bajo en todas las tareas, sin proporcionar las cifras en esta model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud a partir del recuento real de parámetros, 3,62 mil millones de parámetros ocupan aproximadamente 14,5 GB en fp32 (coincide con el tamaño del repositorio) y en torno a 7,2 GB en bf16. A esa cifra hay que sumar el coste de los cuatro flujos de vídeo a 640x360 y 30 fps y del codificador visual, que no se documenta.
- GPU recomendadas: no disponible. No se indica en la model card qué hardware se usó para entrenar o evaluar.
- Compatibilidad con GPU de consumo: no disponible. Por recuento de parámetros, una GPU con 16 GB o más podría alojar los pesos en bf16, pero no hay confirmación del autor ni datos de memoria real.
- Opciones de despliegue: no disponible. No se documenta vLLM, TGI, llama.cpp, Ollama ni ningún runtime específico. Por la naturaleza del artefacto (política visomotora con entradas de imagen y estado articular y salidas continuas de 38 dimensiones), los runtimes orientados a modelos de lenguaje no son aplicables tal cual.
- Latencia y throughput: no disponible. No se publican mediciones de latencia de inferencia ni de frecuencia de control alcanzada. El único dato relacionado es el esquema de reobservación cada 16 pasos, que implica un bucle de control por chunks, pero sin valores temporales.

## Comparativa con modelos similares

El propio autor publica 24 ejecuciones de esta misma tarea, lo que permite una comparación directa dentro del mismo dataset y la misma partición. No se dispone de las cifras de los otros checkpoints en esta model card, solo de la afirmación de que GR00T tuvo el error más bajo en todas las tareas.

| Modelo | Familia | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | pi-0.5 | 3,62 B | chunk de 16 acciones, reobservación cada 16 pasos | gemma | público en HuggingFace, 0 descargas, 0 likes |
| `..._gr00t3b260920` | GR00T 3B | no disponible (el nombre sugiere ~3 B) | no disponible | no disponible | público en HuggingFace |
| `..._act260920` | ACT | no disponible | no disponible | no disponible | público en HuggingFace |
| `..._dp260920` | Diffusion Policy | no disponible | no disponible | no disponible | público en HuggingFace |
| `..._pi05tactile260920` | pi-0.5 con entrada táctil | no disponible | no disponible | gemma (presumiblemente) | público en HuggingFace |

Comparación con alternativas fuera de este estudio: no disponible. No se han proporcionado datos de otros modelos de manipulación bimanual con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se ha validado en hardware. El autor indica explícitamente que "nada de esto se ejecutó en hardware"; todas las cifras provienen de evaluación en lazo abierto sobre datos grabados.
- La métrica publicada mide seguimiento de trayectoria, no éxito de tarea. Un error bajo en radianes no implica que el robot coloque la caja correctamente.
- Dataset muy reducido: 54 episodios, con solo 6 reservados para evaluación. La varianza de las estimaciones es alta y no hay garantía de generalización.
- Una única tarea y un único embodiment: la política está especializada en el paso de una caja de pañuelos entre niveles de estantería con un DexMate Vega-1 y dos manos XHand1. No se documenta transferencia a otras tareas, objetos, alturas o robots.
- Riesgo de sobreajuste a las condiciones de captura: cuatro cámaras concretas a 640x360 y 30 fps, con iluminación, montaje y disposición no descritos. Cambiar la configuración de sensores invalidaría probablemente el checkpoint.
- La entrada táctil no aportó mejora medible en el barrido del autor, lo que sugiere que la información táctil no se está explotando de forma efectiva en esta familia de políticas.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, y en robótica de imitación el sesgo relevante es la distribución de demostraciones, que aquí es mínima y de un solo operador con meta-glove.
- Restricciones de licencia: el modelo se distribuye bajo licencia Gemma. Esto implica que se aplican los términos de uso de Gemma, incluida su política de usos prohibidos, y que la redistribución debe acompañarse de dichos términos. Conviene revisar las condiciones antes de cualquier uso comercial o de integrarlo en un producto.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia externa de reproducibilidad ni informes de terceros.
- Idiomas soportados: no disponible; el modelo no procesa lenguaje natural, por lo que no tiene capacidades multilingües.
- Procedencia del artefacto: se trata de un checkpoint de investigación dentro de un barrido experimental, no de una release estable ni versionada con garantías de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_act260920
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920
- Variante pi-0.5 con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920
- Paper, blog o repositorio asociado: no disponible en la información proporcionada.
