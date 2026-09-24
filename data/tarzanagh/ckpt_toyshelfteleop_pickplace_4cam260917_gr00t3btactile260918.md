# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918

## Resumen

`tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918` es un checkpoint de política robótica para manipulación bimanual diestra, construido sobre el backbone GR00T-N1.7 de 3B y con 3.144.016.000 parámetros reales según los pesos almacenados en safetensors. La tarea es concreta y acotada: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 coge un juguete de la segunda balda de una estantería y lo deposita en la primera, con el brazo derecho activo y el izquierdo prácticamente estático.

El entrenamiento es por imitación a partir de 155 episodios de teleoperación (139 de entrenamiento y 16 reservados, seleccionados uno de cada diez), capturados con cuatro cámaras RGB a 640x360 y 30 fps. La teleoperación se realizó con guantes Meta y seguimiento de muñeca Vive, sin exoesqueleto. La variante "+ tactile" añade 30 dimensiones de fuerza en las puntas de los dedos, concatenadas al estado de 38 dimensiones hasta alcanzar 68 dimensiones de entrada.

Su relevancia es metodológica más que de producto: forma parte de una comparativa de 24 ejecuciones que cruza cuatro familias de políticas (ACT, Diffusion Policy, pi0.5 y GR00T) con tres tareas, y publica error en lazo abierto sobre un conjunto reservado. El propio autor advierte de dos resultados negativos importantes: la entrada táctil no aportó ninguna mejora más allá del ruido, y ninguno de los resultados se ha ejecutado sobre hardware real, por lo que miden seguimiento de trayectoria y no éxito de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; el nombre y la etiqueta `Gr00tN1d7` indican que deriva del backbone GR00T-N1.7 de 3B |
| Parametros totales | 3.144.016.000 (3,14 B), dato real de los pesos en safetensors |
| Parametros activos | No aplica; no se documenta que sea un modelo MoE |
| Longitud de contexto | No disponible. El horizonte de predicción documentado es de 16 acciones por bloque, con reobservación cada 16 pasos |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; el tamaño del repo (12,6 GB) es coherente con precision fp32 (3,14 B x 4 bytes) |
| Idiomas soportados | No disponible. No se documenta ninguna capacidad de lenguaje natural |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | safetensors |
| Dimension de estado/accion | 38-D `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`; con fuerza táctil, 30-D adicionales (5 dedos x 3 ejes por mano) hasta 68-D |
| Entrada sensorial | 4 camaras RGB a 640x360 y 30 fps |
| Pasos de entrenamiento | 10.000, semilla 1000 |
| Tamano del repo | 12,6 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo que sí se declara es la procedencia del backbone (GR00T-N1.7, en su variante de 3B) y la interfaz de entrada y salida: un vector de estado/acción de 38 dimensiones con posiciones articulares, dividido en brazo izquierdo (7), mano izquierda (12), brazo derecho (7) y mano derecha (12), al que la variante táctil añade 30 dimensiones de fuerza de punta de dedo (5 dedos por 3 ejes en cada mano). La política opera con un esquema de receding horizon: recibe una observación real cada 16 pasos, predice un bloque de acciones y ejecuta las 16 primeras.

El entrenamiento fue puramente de imitación supervisada: 10.000 pasos de optimización con semilla 1000 sobre 139 episodios, dejando 16 episodios (uno de cada diez) como conjunto reservado. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias. Tampoco se detalla la composición del dataset más allá del número de episodios, la resolución y el montaje de cámaras.

El resultado experimental más destacable del checkpoint es negativo: en el barrido de cuatro familias de políticas por tres tareas, la entrada táctil no produjo ninguna diferencia por encima del ruido, mientras que GR00T obtuvo el menor error en las tres tareas evaluadas. Es decir, el valor del modelo está en servir como referencia de la familia GR00T en este montaje concreto, no en la fusión táctil.

## Capacidades

- Generación de acciones de robot: predice bloques de 16 acciones de 38 dimensiones (posiciones articulares de brazos y manos) a partir de observación visual y de estado.
- Control bimanual de 14 grados de libertad de brazo más 24 de mano, distribuidos en dos cadenas cinemáticas independientes.
- Percepción visual multi-cámara: consume simultáneamente 4 cámaras RGB a 640x360 y 30 fps.
- Fusión de señal táctil: ingiere 30 dimensiones de fuerza de punta de dedo (5 dedos x 3 ejes por mano). En la evaluación publicada esta entrada no aportó mejora medible.
- Ejecución en lazo abierto con reobservación: mantiene el bloque de 16 acciones y vuelve a observar al agotarlo.
- Tool calling / function calling: no disponible; no aplica a una política de manipulación.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponibles; no es un modelo de texto.
- Capacidad especial: no se declara ningún modo de pensamiento, visión-lenguaje general ni procesamiento de audio.

## Casos de uso

- Pick-and-place en estantería de dos niveles: es exactamente la tarea entrenada, con el brazo derecho como actuador principal. Adecuado porque el error de seguimiento en el brazo derecho (0,0345 rad ± 0,0013) es un orden de magnitud inferior al del baseline de mantener el primer fotograma (0,3166 rad).
- Manipulación diestra con manos XHand1: el modelo controla 12 grados de libertad por mano, lo que permite replicar agarres de dedos completos en lugar de pinzas simples, con un error de mano derecha de 0,0222 rad ± 0,0009.
- Recogida de datos y teleoperación asistida: al estar entrenado sobre teleoperación con guantes Meta y Vive, puede integrarse como política inicial en un bucle de recogida de datos sobre el mismo montaje para reducir el esfuerzo de teleoperación.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible (10.000 pasos, semilla 1000, 139 episodios de entrenamiento) para comparar variantes de arquitectura sin volver a entrenar desde cero.
- Estudio de la utilidad de la señal táctil: al existir el gemelo sin táctil (`..._gr00t3b260918`), permite un A/B controlado sobre si la fuerza de punta de dedo mejora el seguimiento en esta tarea. El resultado publicado es que no.
- Evaluación comparativa de familias de políticas: encaja en un harness interno que compare ACT, Diffusion Policy, pi0.5 y GR00T sobre la misma tarea, dado que el autor publica las 24 ejecuciones del mismo escenario.
- Automatización de tareas de reposición en laboratorio o retail con hardware DexMate Vega-1: el checkpoint está atado a esa morfología (dos brazos de 7 DoF más dos manos de 12), por lo que su uso directo requiere exactamente ese robot.
- Reproducción de trayectorias sobre el mismo montaje de teleoperación: la combinación de guantes Meta y seguimiento Vive define la cinemática de referencia, lo que facilita reutilizar las demostraciones como referencia de comparación.

## Benchmarks y rendimiento

El autor publica un único conjunto de métricas: error en lazo abierto sobre 16 episodios reservados, en radianes, media ± error estándar.

| Variante | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (GR00T-N1.7-3B + tactil) | 0,0035 ± 0,0003 | 0,0080 ± 0,0008 | 0,0345 ± 0,0013 | 0,0222 ± 0,0009 |
| Baseline hold-first-frame | 0,0219 | 0,0172 | 0,3166 | 0,2380 |

Contexto de la medición: la política recibe la observación real cada 16 pasos, predice un bloque y se conservan las 16 primeras acciones. El autor indica explícitamente que esto mide seguimiento de trayectoria, no éxito de tarea, y que nada se ejecutó sobre hardware real. También señala que, en el barrido de cuatro familias por tres tareas, la entrada táctil no produjo diferencias por encima del ruido y que GR00T tuvo el menor error en todas las tareas. No se publican MMLU, HumanEval, GSM8K ni métricas de éxito de tarea para este checkpoint.

Aviso: no se han publicado resultados de éxito de tarea (task success rate) en la información disponible. Los errores de las demás variantes de la familia no están incluidos en esta ficha.

## Requisitos de hardware

- VRAM estimada: en fp32, unos 12,6 GB solo de pesos, más activaciones y búferes de las 4 cámaras; en bf16, unos 6,3 GB de pesos. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU profesionales: A100, H100 y L40S manejan el modelo sin restricciones de memoria aparentes.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) pueden alojar los pesos en fp32 con margen; en bf16 cabría en tarjetas de 12-16 GB, como una RTX 4080.
- Despliegue en borde: no disponible. No se documenta ejecución en Jetson ni en hardware embebido del propio robot.
- Opciones de despliegue: no se documenta ninguna integración con vLLM, llama.cpp, Ollama o TGI. Al publicarse en safetensors, la vía natural es cargar los pesos con PyTorch.
- Almacenamiento: 12,6 GB de repositorio.
- Latencia y throughput: no disponibles. La captura de cámara está fijada a 30 fps y el bloque de acciones es de 16 pasos; si el bucle de control se ejecutase a 30 Hz, cada bloque cubriría aproximadamente 0,53 s, pero la frecuencia de control real no está especificada en la model card.

## Comparativa con modelos similares

El autor sitúa este checkpoint dentro de un conjunto de 24 ejecuciones del mismo escenario. Los ocho enlaces publicados corresponden a estas variantes:

| Variante | Familia | Entrada tactil | Error en lazo abierto |
|---|---|---|---|
| `..._gr00t3btactile260918` (esta ficha) | GR00T-N1.7-3B | Si | 0,0035 / 0,0080 / 0,0345 / 0,0222 rad (L-arm / L-hand / R-arm / R-hand) |
| `..._gr00t3b260918` | GR00T-N1.7-3B | No | No disponible en la informacion proporcionada |
| `..._act260919` | ACT | No | No disponible en la informacion proporcionada |
| `..._acttactile260919` | ACT | Si | No disponible en la informacion proporcionada |
| `..._dp260919` | Diffusion Policy | No | No disponible en la informacion proporcionada |
| `..._dptactile260919` | Diffusion Policy | Si | No disponible en la informacion proporcionada |
| `..._pi05260918` | pi0.5 | No | No disponible en la informacion proporcionada |
| `..._pi05tactile260918` | pi0.5 | Si | No disponible en la informacion proporcionada |

Dato comparativo disponible: el autor afirma que GR00T obtuvo el menor error en las tres tareas evaluadas dentro del barrido de cuatro familias. No se publican los valores numéricos del resto de familias en la información disponible, ni comparaciones contra modelos de manipulación externos a este estudio.

## Limitaciones y advertencias

- Los resultados son de error en lazo abierto sobre 16 episodios reservados, no de tasa de éxito. El autor indica explícitamente que nada se ejecutó sobre hardware real.
- El conjunto de entrenamiento es muy reducido: 155 episodios, una única tarea, un único montaje y una única semilla (1000). El riesgo de sobreajuste al entorno concreto es alto.
- El brazo izquierdo está descrito como casi estático durante la tarea, por lo que las habilidades bimanuales cooperativas reales del modelo son cuestionables pese a la etiqueta de manipulación bimanual.
- El error del brazo derecho (0,0345 rad) es diez veces mayor que el del izquierdo (0,0035 rad), lo que refleja un desequilibrio de precisión entre ambos brazos y una dependencia fuerte del brazo activo.
- La entrada táctil no aportó mejora medible según la propia evaluación del autor; no debe asumirse que la variante táctil sea superior a la versión sin táctil.
- Sesgos conocidos: no documentados, pero cabe esperar un sesgo fuerte hacia las posiciones de cámara, la altura de las baldas, la iluminación y el objeto concreto del dataset.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de deriva de trayectoria fuera de distribución, sin ninguna métrica publicada de recuperación.
- Idiomas: no aplica; el modelo no procesa lenguaje natural según la información disponible.
- Licencia `other` sin términos publicados: no se puede asumir uso comercial libre. Es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin validación externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- La fecha de creación indicada (2026-09-24) es posterior a la fecha de redacción habitual de estas fichas; conviene verificar la vigencia del repositorio.
- Restricción de hardware: la interfaz de estado (dos brazos de 7 DoF más dos manos de 12 DoF) ata el modelo a la morfología DexMate Vega-1 con manos XHand1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- Variante GR00T sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- Variante ACT sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Variante Diffusion Policy sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- Variante pi0.5 sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- Variante pi0.5 con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918

Nota: no se han encontrado en la información disponible enlaces al paper, blog o repositorio de código del backbone GR00T-N1.7, ni documentación del robot DexMate Vega-1 o de las manos RobotEra XHand1.
