# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919

## Resumen

Este repositorio contiene un checkpoint de politica de difusion (Diffusion Policy) entrenado para una tarea concreta de manipulacion bimanual diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 debe coger un juguete del segundo nivel de una estanteria y colocarlo en el primero, con el brazo derecho activo y el izquierdo practicamente estatico. Lo publica el usuario tarzanagh como parte de una bateria de 24 ejecuciones sobre la misma tarea, en la que se comparan distintas familias de politicas (ACT, Diffusion Policy, GR00T N1.5 3B y pi0.5), con y sin entrada tactil. El interes practico no esta en el modelo como producto, sino como punto de comparacion reproducible dentro de la investigacion en aprendizaje por imitacion y manipulacion bimanual.

El modelo tiene 267.483.430 parametros (dato real extraido de los pesos safetensors), un repositorio de 1,1 GB y licencia Apache 2.0. Se entrena sobre 155 episodios de teleoperacion con guante Meta (sin exoesqueleto) y seguimiento de muneca Vive, con 4 camaras RGB a 640x360 y 30 fps. El espacio de estado y accion es un vector de 38 dimensiones con posiciones articulares: 7 para el brazo izquierdo, 12 para la mano izquierda, 7 para el brazo derecho y 12 para la mano derecha.

Es relevante ahora porque forma parte de una comparativa controlada de familias de politicas sobre una misma tarea y mismos datos, con una metrica de error en bucle abierto reportada sobre el conjunto reservado. El propio autor advierte que la metrica mide seguimiento de trayectoria, no exito de tarea, y que ninguna politica de esta serie se ha ejecutado en hardware real. Es, por tanto, material de referencia para investigacion, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (politica de difusion para generacion de acciones); el autor no detalla el backbone de vision ni el tipo exacto de red de denoising |
| Parametros totales | 267.483.430 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; usa horizonte de prediccion de 16 pasos con reobservacion cada 16 pasos) |
| Tipos de cuantizacion | no disponible (el repositorio sirve pesos safetensors; no se documentan variantes GGUF, INT8 ni similares) |
| Idiomas soportados | no aplicable (modelo de control robotico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Espacio de estado/accion | 38-D: [brazo izq. 7, mano izq. 12, brazo der. 7, mano der. 12] posiciones articulares |
| Entradas sensoriales | 4 camaras RGB, 640x360 a 30 fps |
| Tarea | Pick-and-place de un juguete del segundo nivel de estanteria al primero |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La ficha del autor identifica el modelo como una Diffusion Policy, la familia de politicas que modela la distribucion de secuencias de accion mediante un proceso de difusion condicionado por las observaciones. No se especifica en la informacion disponible el backbone concreto de vision (por ejemplo, ResNet o ViT), el tipo de red de denoising ni el numero de pasos de difusion en inferencia. Lo que si se detalla es el esquema de control: la politica observa el estado real cada 16 pasos, predice un chunk de acciones y se conservan las 16 primeras acciones antes de volver a observar.

Los datos de entrenamiento consisten en 155 episodios de teleoperacion, divididos en 139 para entrenamiento y 16 reservados (se aparta uno de cada diez). La teleoperacion se realiza con guante Meta, sin exoesqueleto, y seguimiento de muneca Vive. Cada episodio aporta 4 flujos de camara RGB a 640x360 y 30 fps, junto con el vector de estado/accion de 38 dimensiones. El entrenamiento se realizo durante 10.000 pasos con semilla 1000. No se documentan en la informacion disponible fases de RLHF, DPO ni ajuste con recompensa; el paradigma es aprendizaje por imitacion supervisado sobre demostraciones.

Como innovacion relevante de la serie (aunque no exclusiva de este checkpoint), el autor reporta un experimento controlado sobre entrada tactil: en cuatro familias de politica y tres tareas, anadir informacion tactil no produjo diferencias mas alla del ruido, y GR00T obtuvo el error mas bajo en todas las tareas. Esto convierte al conjunto de checkpoints en un banco de pruebas para decidir si merece la pena instrumentar sensores tactiles en este tipo de pipelines.

## Capacidades

- Generacion de trayectorias de accion continuas de 38 dimensiones para control articular conjunto de brazos y manos.
- Prediccion por chunks de 16 acciones con reobservacion del estado real cada 16 pasos.
- Control bimanual coordinado, aunque en esta tarea concreta el brazo izquierdo permanece practicamente estatico y el trabajo lo asume el derecho.
- Manipulacion diestra mediante dos manos RobotEra XHand1, con 12 grados de libertad de mano por lado.
- Fusion multimodal de cuatro camaras RGB con el estado proprioceptivo de las juntas.
- Ejecucion de una tarea especifica de pick-and-place en estanteria (coger del segundo nivel y depositar en el primero).
- Soporte de tool calling / function calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision generativa, audio): no aplicable; la vision aqui es entrada perceptiva para control motor, no comprension semantica.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como referencia de Diffusion Policy entrenada con un presupuesto fijo (10.000 pasos, semilla 1000) sobre un dataset y una tarea concretos, lo que permite reproducir y comparar variantes de politica bajo condiciones identicas.
- Comparativa entre familias de politicas: al existir checkpoints hermanos de ACT, GR00T N1.5 3B y pi0.5 sobre la misma tarea y los mismos 155 episodios, este modelo se usa para aislar el efecto de la familia de politica frente al efecto del dataset.
- Estudio del valor de la entrada tactil: emparejado con `dptactile260919`, permite replicar el analisis del autor sobre si el tacto aporta senal util en tareas de pick-and-place de contacto ligero.
- Desarrollo de pipelines de teleoperacion: los episodios con guante Meta y seguimiento Vive a 4 camaras sirven de plantilla para definir esquemas de captura de datos bimanuales con espacio de accion de 38 dimensiones.
- Analisis de chunking de acciones: el esquema de reobservar cada 16 pasos y conservar 16 acciones es un caso de estudio directo para medir el compromiso entre frecuencia de reobservacion y coherencia de la trayectoria.
- Base para experimentos de sim-to-real: el checkpoint puede emplearse como politica inicial en simulacion antes de plantear transferencia a un Vega-1 real, dado que el autor no ejecuto nada en hardware.
- Docencia y prototipado en robotica: con 267 M de parametros y 1,1 GB de repositorio, es lo bastante pequeno para iterar en un laboratorio con una sola GPU, algo que no ocurre con politicas de miles de millones de parametros.

## Benchmarks y rendimiento

El autor publica una unica metrica: error en bucle abierto sobre el conjunto reservado (n=16), medido como media de |accion predicha - accion registrada| en radianes, con error estandar de la media. Se compara contra una linea base trivial que repite el primer frame.

| Metrica (rad, menor es mejor) | Brazo izq. | Mano izq. | Brazo der. | Mano der. |
|---|---|---|---|---|
| Este modelo | 0,0043 ± 0,0005 | 0,0094 ± 0,0011 | 0,0482 ± 0,0033 | 0,0345 ± 0,0038 |
| Linea base "hold-first-frame" | 0,0219 | 0,0172 | 0,3166 | 0,2380 |

Advertencias sobre estas cifras, segun la propia model card:

- Miden seguimiento de trayectoria en bucle abierto, no tasa de exito de la tarea.
- No se ejecuto ninguna politica en hardware real.
- En el analisis cruzado de cuatro familias y tres tareas, la entrada tactil no aporto mejora mas alla del ruido y GR00T obtuvo el error mas bajo en todas las tareas.

No se han publicado otros resultados de benchmarks (tasa de exito, robustez, generalizacion a objetos nuevos) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: las cifras siguientes son estimaciones derivadas del recuento real de parametros (267.483.430), no datos publicados por el autor. En FP32, unos 1,07 GB; en FP16/BF16, unos 0,54 GB; en INT8, unos 0,27 GB. A esto hay que sumar activaciones, buffers de los cuatro flujos de camara y la sobrecarga del runtime.
- VRAM practica de inferencia: con 4 camaras RGB a 640x360 y un horizonte de 16 acciones, es razonable reservar entre 2 y 4 GB en FP32 para margen de seguridad, aunque el autor no publica mediciones.
- GPU recomendadas: no hay recomendacion oficial. Por tamano, cualquier GPU con 8 GB o mas deberia bastar; una RTX 4090 o RTX 3090 es holgada. A100 y H100 solo tendrian sentido para paralelizar evaluaciones masivas, no por requisito de memoria.
- Cabe en GPU de consumo: si, previsiblemente en cualquier tarjeta con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). No confirmado por el autor.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. El despliegue natural es PyTorch con los pesos safetensors, integrado mediante el stack de robotica correspondiente (por ejemplo, un nodo ROS 2 que publique las 38 dimensiones de accion al controlador del Vega-1). No se documenta ningun pipeline de despliegue oficial.
- Latencia y throughput: no disponible. La politica requiere inferencia a una frecuencia compatible con reobservacion cada 16 pasos; el autor no publica tiempos por chunk.

## Comparativa con modelos similares

El propio autor publica checkpoints hermanos para la misma tarea, mismos datos y mismo esquema de evaluacion. Todos son pesos safetensors bajo Apache 2.0, salvo que se indique lo contrario, y ninguno fue validado en hardware.

| Modelo | Familia | Parametros | Misma tarea/datos | Error reportado |
|---|---|---|---|---|
| ckpt_..._dp260919 (este) | Diffusion Policy | 267.483.430 | si | Ver tabla de benchmarks |
| ckpt_..._dptactile260919 | Diffusion Policy + tactil | no disponible | si | No desglosado en esta ficha |
| ckpt_..._act260919 | ACT | no disponible | si | No desglosado en esta ficha |
| ckpt_..._acttactile260919 | ACT + tactil | no disponible | si | No desglosado en esta ficha |
| ckpt_..._gr00t3b260918 | GR00T N1.5 (por el nombre, ~3B) | ~3000 M (inferido del nombre, no confirmado) | si | El mas bajo en las tres tareas evaluadas, segun el autor |
| ckpt_..._gr00t3btactile260918 | GR00T N1.5 + tactil | ~3000 M (inferido) | si | No desglosado en esta ficha |
| ckpt_..._pi05260918 | pi0.5 | no disponible | si | No desglosado en esta ficha |
| ckpt_..._pi05tactile260918 | pi0.5 + tactil | no disponible | si | No desglosado en esta ficha |

Fuera de esta serie no se dispone de cifras comparables verificadas. La conclusion cualitativa que si aporta el autor es que GR00T, con un orden de magnitud mas de parametros, obtuvo el error mas bajo en todas las tareas, mientras que la entrada tactil no cambio los resultados de forma significativa.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con demostraciones de teleoperacion de una persona en una tarea, un robot y una disposicion de estanteria concretos. No hay evidencia de generalizacion a otros operadores, objetos, alturas de estanteria o iluminacion.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje, pero si existe el analogo en control, es decir, generacion de trayectorias plausibles pero fisicamente invalidas cuando la observacion se sale de la distribucion de entrenamiento.
- Validacion inexistente en hardware: el propio autor indica que nada se ejecuto en un robot real. Las cifras son de bucle abierto y no miden exito de tarea.
- Metrica limitada: el error de seguimiento de trayectoria sobre 16 episodios reservados no captura fallos de agarre, colisiones ni recuperacion ante perturbaciones.
- Tamano de dataset reducido: 155 episodios es un volumen pequeno para una tarea bimanual con dos manos de 12 grados de libertad cada una.
- Sesgo estructural de la tarea: el brazo izquierdo permanece practicamente estatico, por lo que el modelo no demuestra coordinacion bimanual real pese a la etiqueta "bimanual".
- Ausencia de senal tactil util: el autor reporta que el tacto no aporta mejora mas alla del ruido en esta familia de tareas, lo que cuestiona la utilidad de instrumentar sensores tactiles con este enfoque.
- Limitaciones de idioma y contexto: no aplicable, ya que el modelo no procesa lenguaje ni texto.
- Licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y sin garantias. No obstante, el uso comercial esta limitado de facto por la falta de validacion en hardware y por la dependencia de un robot especifico (DexMate Vega-1 con manos RobotEra XHand1).
- Caveat de produccion: un checkpoint de investigacion sin validacion fisica ni documentacion de latencia no deberia desplegarse en un entorno productivo sin una fase propia de evaluacion en hardware y analisis de seguridad.
- Fechas del repositorio: la ficha de HuggingFace registra creacion el 2026-09-24 y actualizacion el mismo dia, lo que conviene tener en cuenta al citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Checkpoint hermano ACT: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Checkpoint hermano ACT + tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Checkpoint hermano Diffusion Policy + tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- Checkpoint hermano GR00T N1.5 3B: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- Checkpoint hermano GR00T N1.5 3B + tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- Checkpoint hermano pi0.5: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- Checkpoint hermano pi0.5 + tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918
- Perfil del autor: https://huggingface.co/tarzanagh
