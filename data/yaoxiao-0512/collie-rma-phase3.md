# yaoxiao-0512/collie-rma-phase3

## Resumen

Collie RMA (Rapid Motor Adaptation) es una implementación del método RMA aplicada a la política de locomoción del cuadrúpedo BorderCollieRobot. No es un modelo de lenguaje: se trata de un sistema de control compuesto por una política privilegiada (teacher) entrenada con PPO y un módulo de adaptación (student) basado en una red convolucional 1D que estima parámetros físicos no observados a partir del historial de observaciones y acciones. El objetivo es que el robot se adapte en línea a cambios de fricción, masa, ganancias de motor u otros extrínsecos sin disponer de información privilegiada durante el despliegue.

El repositorio corresponde a la fase 3 del proyecto y lo publica el usuario yaoxiao-0512 en HuggingFace. Contiene cuatro ficheros: el checkpoint del teacher (1,1 MB), el encoder del student (1,6 MB), un informe de métricas de regresión y el log de entrenamiento del teacher. El teacher se entrenó durante 200 iteraciones de PPO en una RTX 3090 (AutoDL) y el student se entrenó de forma supervisada con 20.000 pares (historial, extrínsecos) durante 50 épocas.

La relevancia actual del repositorio es acotada y experimental: la validación es exclusivamente en simulación (2026-10-07), con un R² medio de 0,783 en la estimación de los 9 extrínsecos, y el propio autor indica como siguiente paso un A/B en máquina real comparando el baseline de la fase 2 con el student RMA en transiciones de suelo de madera a moqueta. El repositorio no registra descargas ni likes y no incluye benchmarks estándar ni comparativas con otras políticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Teacher: política privilegiada entrenada con PPO (topología de red no detallada en la información disponible). Student: encoder de adaptación 1D-CNN sobre 50 pasos de historial [61-D observación + 14-D acción] |
| Parámetros totales | no disponible (los checkpoints ocupan 1,1 MB el teacher y 1,6 MB el student, pero no se indica el recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto textual. El teacher recibe una observación de 61-D; el student consume una ventana de 50 pasos de historial |
| Tipos de cuantización | no disponible (checkpoints PyTorch en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (entradas vectoriales de propiocepción y extrínsecos físicos; no procesa texto) |
| Licencia | MIT, según la model card. El metadata del repositorio en HuggingFace no declara licencia |
| Formato de pesos | PyTorch `.pt` (`rma_teacher_checkpoint.pt`, `rma_student_encoder.pt`) |

## Arquitectura y entrenamiento

El sistema sigue el esquema clásico de RMA en dos etapas. El teacher es una política privilegiada `π(x_t, e_t)` cuyo espacio de entrada combina 61 dimensiones de propiocepción con 9 dimensiones de extrínsecos físicos reales (fricción, masa, ganancias de motor, sesgo de encoder, etc.). Se entrenó con 200 iteraciones de PPO sobre una RTX 3090 en AutoDL. El student es un módulo de adaptación `φ(history) → ê_t` implementado como una CNN 1D que procesa 50 pasos de historial compuesto por la observación de 61-D y la acción de 14-D, y produce una estimación de 9-D de los extrínsecos. Este student se entrenó de forma supervisada sobre 20.000 pares (historial, extrínsecos) durante 50 épocas, es decir, con aprendizaje supervisado y no con RLHF ni DPO, métodos que no aplican a este dominio.

En despliegue, la política ejecutada es `π(x_t, φ(history))`: el robot solo necesita la entrada de 61-D de propiocepción y el historial reciente, sin acceso a los parámetros físicos verdaderos. La innovación principal es precisamente esa sustitución de la información privilegiada por una estimación aprendida, lo que permite adaptación en línea a condiciones no vistas durante el entrenamiento. El autor documenta además la sensibilidad del teacher a los parámetros verdaderos (14,2% de cambio en la acción al variar la fricción entre 0,5 y 2,0; 11,6% al variar la masa entre 0,9 y 1,1), lo que respalda que la política efectivamente condiciona su comportamiento a dichos parámetros.

## Capacidades

- Adaptación en línea a parámetros físicos no observados (fricción, masa, escalas de ganancia, sesgo de encoder) sin información privilegiada en el momento del despliegue.
- Estimación de un vector de 9 extrínsecos a partir de una ventana de 50 pasos de historial de observación y acción.
- Control de locomoción de un cuadrúpedo (BorderCollieRobot) en simulación, con sensibilidad verificada a fricción y masa.
- Ejecución con una única entrada de 61-D en despliegue, lo que simplifica la integración con el stack de percepción y propriocepción del robot.
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling ni function calling.
- No implementa comportamiento de agente ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Locomoción en transiciones de terreno: el escenario declarado por el autor es el paso de suelo de madera a moqueta, donde el coeficiente de fricción cambia de forma brusca. El student estima la fricción efectiva a partir del historial reciente y el teacher ajusta la marcha sin necesidad de reentrenamiento.
- Transferencia sim-to-real sin información privilegiada: en el robot real no se conocen los extrínsecos verdaderos, por lo que desplegar `π(x_t, φ(history))` con la entrada de 61-D es el único camino viable. Es el uso central del repositorio.
- Compensación de cambios de carga útil: variaciones de masa dentro del rango validado (0,9 a 1,1 en la sensibilidad del teacher) pueden compensarse mediante la estimación de `mass_scale`, que alcanza un R² de 0,933.
- Compensación de degradación o variabilidad de motores: los extrínsecos `effort_scale` (R² 0,976), `encoder_bias` (R² 0,959) y `kd_scale` (R² 0,990) permiten ajustar el control ante diferencias entre unidades o desgaste progresivo.
- Investigación y reproducción de RMA: sirve como base experimental para comparar variantes del método, fases del propio proyecto (fase 2 frente a fase 3) o estrategias alternativas de estimación de extrínsecos.
- Despliegue en hardware embebido: al sumar los dos checkpoints alrededor de 2,7 MB, el sistema es candidato a ejecutarse en la computadora de a bordo del cuadrúpedo o incluso en CPU, siempre que se valide la frecuencia de control requerida.
- Validación A/B en máquina real: el repositorio está preparado explícitamente para comparar el baseline de la fase 2 contra el student RMA en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. Los únicos datos de rendimiento son la validación interna en simulación del 2026-10-07, que se reproduce a continuación tal como aparece en la model card.

Sensibilidad del teacher a los parámetros físicos verdaderos:

| Parámetro | Comparación | Cambio en la acción |
|---|---|---|
| Fricción | 0,5 frente a 2,0 | 14,2% |
| Masa | 0,9 frente a 1,1 | 11,6% |

Regresión del student sobre los 9 extrínsecos (R² medio = 0,783):

| Extrínseco | R² |
|---|---|
| kd_scale | 0,990 |
| effort_scale | 0,976 |
| encoder_bias | 0,959 |
| mass_scale | 0,933 |
| friction | 0,608 |
| com_offset | 0,531 |
| kp_scale | 0,482 |

No se proporcionan métricas de recompensa, tasa de éxito de episodios, velocidad de locomoción ni coste computacional por paso de control.

## Requisitos de hardware

- Entrenamiento del teacher: 200 iteraciones de PPO en una RTX 3090 (AutoDL), según la model card.
- Entrenamiento del student: 20.000 pares de entrenamiento supervisado durante 50 épocas; la GPU empleada no se especifica, pero por el tamaño del modelo es plausible en hardware muy inferior a una RTX 3090 (dato no confirmado por el autor).
- VRAM de inferencia: no disponible de forma oficial. Los dos checkpoints suman aproximadamente 2,7 MB, por lo que la huella de memoria es mínima y cabe holgadamente en cualquier GPU de consumo actual, así como en CPU. Esta estimación se deduce del tamaño de los ficheros, no de una medición publicada.
- GPU recomendadas: RTX 3090 para el entrenamiento del teacher (confirmada). Para inferencia no se especifica ninguna; cualquier GPU, incluida una integrada, debería ser suficiente dado el tamaño.
- ¿Cabe en GPU de consumo? Sí, con margen amplio, según el tamaño de los checkpoints.
- Opciones de despliegue: los pesos son ficheros `.pt` de PyTorch. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo. Tampoco se detalla el pipeline de despliegue (ROS, ONNX, TensorRT) ni si existe exportación a formatos embebidos.
- Latencia y throughput: no disponibles. No se indica la frecuencia de control objetivo ni el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| collie-rma-phase3 | Teacher PPO + student 1D-CNN (RMA) | no disponible (checkpoints de 1,1 MB y 1,6 MB) | 61-D de propiocepción; historial de 50 pasos en el student | R² medio 0,783 en simulación | MIT según model card | HuggingFace, 0 descargas, 0 likes |
| Baseline fase 2 del mismo proyecto | Política sin módulo de adaptación RMA | no disponible | no disponible | no disponible (es el punto de comparación del A/B pendiente en máquina real) | no disponible | mencionado en la model card, no publicado como artefacto independiente |
| RMA original (Kumar et al., 2021) | Teacher privilegiado + encoder de historial | no disponible | no disponible | no disponible | no disponible | referencia metodológica citada implícitamente; el enlace al paper no se incluye en la información proporcionada |
| Políticas de locomoción con PPO en simuladores tipo Isaac Gym o legged_gym | PPO con observaciones privilegiadas o con domain randomization | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos suficientes en la información proporcionada para establecer una comparación cuantitativa con alternativas. La comparativa anterior es cualitativa.

## Limitaciones y advertencias

- El R² de `kp_scale` (0,482), `com_offset` (0,531) y `friction` (0,608) es bajo: la estimación de estos tres extrínsecos es poco fiable y el error se propaga directamente a la política desplegada. La fricción es precisamente uno de los parámetros críticos para el escenario de transición madera-moqueta que el autor planea validar.
- Toda la validación disponible es en simulación (fecha 2026-10-07). El A/B en máquina real sigue pendiente según la propia model card, por lo que no existe evidencia de comportamiento en el robot físico.
- No se han publicado benchmarks estándar ni comparaciones con otras políticas de locomoción, lo que impide situar el rendimiento del modelo en su categoría.
- El repositorio no registra descargas ni likes: no hay validación independiente por parte de la comunidad.
- Existe una discrepancia entre el metadata del repositorio (tamaño 0,0 GB y licencia sin declarar) y el contenido de la model card (ficheros de aproximadamente 2,7 MB en total y licencia MIT). Conviene verificar la licencia antes de cualquier uso comercial.
- No se documenta la composición del dataset de entrenamiento del teacher (dominio de aleatorización, tipos de terreno, rangos de los extrínsecos), lo que dificulta evaluar su cobertura y sus límites de extrapolación.
- No se describe el pipeline de despliegue ni la frecuencia de control objetivo, datos necesarios para integrar el sistema en un stack robótico real.
- Al no ser un modelo de lenguaje, no aplican consideraciones de sesgo textual, alucinación lingüística ni multilingüismo, pero sí el riesgo de estimaciones erróneas de los extrínsecos, que es el equivalente funcional de una alucinación en este dominio.
- Modelo de nicho y en fase experimental: no debe tratarse como una política lista para producción sin validación previa en el hardware objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/yaoxiao-0512/collie-rma-phase3
- Paper original del método RMA: no disponible en la información proporcionada
- Blog o publicación del autor sobre el proyecto Collie RMA: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo o vídeo de validación: no disponible en la información proporcionada
- Informe de métricas del student (`rma_student_report.json`) y log del teacher (`rma_teacher_v1.log`): accesibles únicamente desde el propio repositorio de HuggingFace
