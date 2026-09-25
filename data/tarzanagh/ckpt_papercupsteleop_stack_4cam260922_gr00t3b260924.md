# tarzanagh/ckpt_papercupsteleop_stack_4cam260922_gr00t3b260924

## Resumen

`tarzanagh/ckpt_papercupsteleop_stack_4cam260922_gr00t3b260924` es un checkpoint de política robótica de manipulación bimanual desarrollado por Davoud Ataee Tarzanagh (Samsung SDS Research America), publicado bajo la familia GR00T N1.7 —la etiqueta del repositorio es `Gr00tN1d7`— y con 3.144.016.000 parámetros (unos 3,14 mil millones) almacenados en safetensors. No es un modelo de lenguaje: es una política visión-lenguaje-acción entrenada por imitación para controlar un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1.

La tarea concreta que resuelve es la recogida y apilado bimanual de vasos de papel: el robot coge un vaso con cada mano y deposita el de la mano derecha dentro del de la izquierda. Los datos proceden de teleoperación con meta-guante (sin exoesqueleto) y seguimiento de muñeca mediante Vive, con 96 episodios grabados por 4 cámaras RGB a 640x360 y 30 fps, de los cuales 86 se usaron para entrenamiento y 10 quedaron reservados (uno de cada diez).

Es relevante ahora porque documenta un caso reproducible de aprendizaje por imitación sobre hardware diestro de dos brazos con muy pocos episodios, e incluye una medición explícita de error en lazo abierto frente a una línea base. Conviene subir la cautela: la model card indica que no se ha ejecutado nada en hardware real y que los resultados solo miden seguimiento de trayectoria, no éxito de tarea, y que las demás líneas base y T-Rex seguían entrenando en el momento de la publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) de la familia GR00T N1.7 (etiqueta `Gr00tN1d7`); el detalle de capas y del cabezal de acción no está disponible en la información proporcionada |
| Parámetros totales | 3.144.016.000 (~3,14 mil millones) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible; la política observa 4 cámaras RGB a 640x360 y 30 fps y emite un chunk de 16 acciones |
| Tipos de cuantización | no disponible (solo safetensors; 12,6 GB de repositorio para 3,14 B de parámetros, ~32 bits por parámetro de media) |
| Idiomas soportados | no disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | `other` (términos no detallados en la model card) |
| Formato de pesos | safetensors |
| Espacio de estado/acción | 38-D: `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` posiciones articulares |
| Entradas sensoriales | 4 cámaras RGB, 640x360 a 30 fps; seguimiento de muñeca Vive |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Tamaño del repositorio | 12,6 GB |
| Fecha de publicación | 2026-09-25 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia GR00T N1.7, según la etiqueta `Gr00tN1d7` del repositorio, y se distribuye como política robótica bajo el pipeline `robotics`. La model card no describe la topología interna (número de capas, tipo de atención, codificador visual ni cabezal de difusión), por lo que ese detalle queda como no disponible. Lo que sí está documentado es la interfaz: la política consume observaciones de 4 cámaras RGB (640x360, 30 fps) más el estado articular de 38 dimensiones y produce acciones en el mismo espacio de 38 dimensiones, correspondientes a las 7 articulaciones de cada brazo y las 12 de cada mano.

El entrenamiento es de imitación supervisada sobre 96 episodios de teleoperación con meta-guante y seguimiento Vive; 86 episodios para entrenamiento y 10 reservados como conjunto de validación (se selecciona uno de cada diez). Se realizaron 10.000 pasos de optimización con semilla 1000. La inferencia es por chunks: la política ve la observación real cada 16 pasos, predice un bloque de acciones y se conservan las 16 primeras. No se menciona uso de RLHF, DPO ni ninguna técnica de refinamiento por preferencias, y tampoco hay datos sobre composición del dataset más allá del número de episodios y la configuración de cámaras.

## Capacidades

- Manipulación bimanual diestra: control simultáneo de dos brazos de 7 grados de libertad y dos manos de 12 grados de libertad cada una (38-D en total).
- Ejecución de una tarea específica de recogida y apilado: coger un vaso de papel con cada mano y encajar el de la derecha dentro del de la izquierda.
- Política de imitación con predicción por chunks: genera bloques de 16 acciones y replantea cada 16 pasos con observación real.
- Percepción visual multi-cámara: procesa 4 flujos RGB a 640x360 y 30 fps.
- Seguimiento de trayectorias articulares con error bajo en lazo abierto (véase la tabla de benchmarks).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión de propósito general, audio ni modo de pensamiento. La información proporcionada no indica ninguna de estas capacidades.

## Casos de uso

- Manipulación bimanual frágil en laboratorio: la política está entrenada sobre vasos de papel, objetos ligeros y deformables en la práctica; sirve como punto de partida para tareas de agarre y encaje con objetos de baja rigidez donde el control monomanual es insuficiente.
- Investigación en aprendizaje por imitación con pocos datos: con 86 episodios de entrenamiento y una métrica de error en lazo abierto publicada, es un caso útil para estudiar cuánta señal se extrae de datasets pequeños de teleoperación.
- Validación de configuraciones hardware de manos diestras: al estar atado a XHand1 y DexMate Vega-1 con un espacio de acción 38-D explícito, sirve como referencia para comprobar que una configuración de robot y guante replica el mismo esquema estado-acción.
- Prototipado de pipelines de teleoperación con meta-guante: el flujo de captura documentado (guante sin exoesqueleto más seguimiento Vive) puede reutilizarse para generar nuevos datasets con la misma estructura de 4 cámaras y 30 fps.
- Fine-tuning para tareas de ensamblaje: el checkpoint puede actuar como inicialización para tareas de inserción o apilado relacionadas, reutilizando el espacio de acciones sin redefinir la interfaz de control.
- Evaluación comparativa de métricas de política: la tabla de error en lazo abierto frente a la línea base *hold-first-frame* permite usar este checkpoint como referencia metodológica en experimentos de seguimiento de trayectoria.
- Docencia y demostraciones de robótica de manipulación diestra: al ser un checkpoint pequeño (3,14 B) y descargable, es viable montar prácticas sobre políticas VLA frente a alternativas mucho mayores.

## Benchmarks y rendimiento

Única métrica publicada: error en lazo abierto sobre el conjunto reservado (media del valor absoluto de la diferencia entre acción predicha y acción registrada, en radianes, ± error estándar de la media, n=10).

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo | 0,0168 ± 0,0004 | 0,0164 ± 0,0006 | 0,0319 ± 0,0007 | 0,0216 ± 0,0012 |
| hold-first-frame (línea base) | 0,4252 | 0,3918 | 0,3280 | 0,1933 |

Advertencias sobre estas cifras, tal como las formula el propio autor: miden seguimiento de trayectoria, no éxito de tarea; no se ha ejecutado nada en hardware real; y las otras líneas base y T-Rex para esta tarea seguían entrenando en el momento de la publicación. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, porque el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: en fp32, unos 12,6 GB (coincide con el tamaño del repositorio); en bf16/fp16, unos 6,3 GB; en int8, unos 3,2 GB. A esa cifra hay que añadir las activaciones del codificador visual con 4 flujos a 640x360 y el estado de la política.
- GPU recomendadas: por encima de 16 GB de VRAM para trabajar con holgura (RTX 4090 de 24 GB, RTX 3090 de 24 GB, L40S de 48 GB, A100 de 40/80 GB, H100). Con 16 GB (RTX 4080, A4000) es razonable en precisión reducida, aunque el margen para activaciones es estrecho.
- Cabe en GPU de consumo: sí, el tamaño de pesos (~6,3 GB en bf16) lo permite en tarjetas de 12-16 GB o superiores; el cuello de botella real es la memoria de activaciones y el pipeline de visión multi-cámara, no el número de parámetros.
- Opciones de despliegue: no disponibles. Al ser una política robótica y no un modelo generativo de texto, las herramientas tipo vLLM, llama.cpp, Ollama o TGI no son aplicables; la model card no indica el runtime recomendado.
- Latencia y throughput: no disponibles. La model card señala explícitamente que no se ejecutó nada en hardware, por lo que no hay medidas de tiempo de inferencia ni de frecuencia de control alcanzable.
- Requisitos adicionales no cubiertos por la información: se desconoce si el checkpoint necesita el codificador visual por separado, ficheros de configuración adicionales o versiones concretas de las librerías de la familia GR00T.

## Comparativa con modelos similares

| Modelo | Familia | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`ckpt_papercupsteleop_stack_4cam260922_gr00t3b260924`) | GR00T N1.7 (`Gr00tN1d7`) | 3.144.016.000 | Apilado bimanual de vasos de papel, XHand1 sobre DexMate Vega-1 | `other` | Público en HuggingFace, 0 descargas |
| `tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260815` | GR00T N1.7 | no disponible | Teleoperación de recogida desde báscula (4 cámaras) | no disponible | Público en HuggingFace |
| `tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816` | GR00T N1.7 | no disponible | Teleoperación de recogida desde báscula (4 cámaras) | no disponible | Público en HuggingFace |
| T-Rex (línea base del autor para esta misma tarea) | no disponible | no disponible | Misma tarea de apilado bimanual | no disponible | En entrenamiento en el momento de la publicación |

No se ha encontrado en la información proporcionada ninguna comparación con modelos de otras familias (por ejemplo, otras políticas VLA o modelos de manipulación bimanual). El autor indica además que las demás líneas base y T-Rex seguían entrenando, por lo que no existe una comparativa cerrada.

## Limitaciones y advertencias

- Ausencia de validación en hardware: la model card afirma explícitamente que no se ejecutó nada en hardware real. Todo el rendimiento publicado es error en lazo abierto, que mide seguimiento de trayectoria y no tasa de éxito de la tarea.
- Dataset muy reducido: 96 episodios en total y 86 de entrenamiento, de una única tarea y un único montaje de robot, manos y guante. El riesgo de sobreajuste al entorno, iluminación y posiciones concretas de los vasos es alto.
- Ausencia de validación cruzada por semilla: se ejecutó un único entrenamiento de 10.000 pasos con semilla 1000, sin varianza entre ejecuciones.
- Resultados provisionales: las líneas base alternativas y T-Rex seguían entrenando, por lo que la comparación publicada está incompleta.
- Sesgos conocidos: no documentados. Cabe esperar sesgos derivados de la distribución de demostraciones humanas (posiciones de los vasos, estilo de teleoperación, altura de cámara y calibración del seguimiento Vive), pero no hay análisis publicado.
- Alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la deriva de la política ante observaciones fuera de distribución, sin mecanismo de rechazo documentado.
- Limitaciones de idioma: no aplica; no hay interfaz de lenguaje natural documentada ni instrucciones textuales.
- Restricciones de licencia: la licencia es `other`, sin términos detallados en la model card. No se puede asumir uso comercial libre; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Advertencia sobre hardware objetivo: la política está atada a la morfología DexMate Vega-1 con manos XHand1 y a un espacio de acción 38-D concreto. Transferirla a otro robot exige remapear el espacio de estado y acción.
- Tamaño del repositorio de 12,6 GB frente a 3,14 B de parámetros sugiere pesos de precisión alta o artefactos adicionales, pero la composición exacta no está documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_papercupsteleop_stack_4cam260922_gr00t3b260924
- Página personal del autor (Davoud Ataee Tarzanagh, Samsung SDS Research America): https://tarzanagh.github.io/
- Checkpoint hermano: https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816
- Checkpoint hermano: https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260815
- Paper, blog o repositorio asociados: no disponibles en la información proporcionada.
