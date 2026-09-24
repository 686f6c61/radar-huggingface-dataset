# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921

## Resumen

Este repositorio contiene un checkpoint de una política de manipulación robótica bimanual entrenada por imitación (imitation learning), publicado por el usuario `tarzanagh` bajo el identificador `ckpt_tissuepickteleop_pull_4cam260918_act260921`. El modelo controla un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 y ejecuta una tarea concreta: sostener una caja de pañuelos con la mano izquierda y extraer un pañuelo con la derecha. La política consume cuatro cámaras RGB a 640x360 y 30 fps, recibe un estado de 38 dimensiones (7 articulaciones por brazo y 12 por mano) y emite acciones en el mismo espacio articular de 38 dimensiones.

El nombre del checkpoint apunta a la familia ACT (Action Chunking Transformer), coherente con el protocolo descrito en la model card: la política recibe una observación real cada 16 pasos, predice un *chunk* de acciones y conserva las 16 primeras antes de volver a observar. El modelo tiene 51.734.182 parámetros (unos 51,7 millones) y el repositorio ocupa 0,2 GB en formato safetensors. La licencia es Apache-2.0.

Su relevancia es doble. Por un lado, forma parte de un estudio comparativo de 24 ejecuciones que cruza cuatro familias de políticas (ACT, Diffusion Policy, GR00T 3B y pi0.5) con tres tareas y con/sin entrada táctil, lo que lo convierte en material útil para reproducir comparativas. Por otro, es un ejemplo de política diestra y bimanual con manos de 12 grados de libertad, un escenario donde los controladores clásicos tienen dificultades. Conviene subrayar que, según el propio autor, las métricas publicadas miden seguimiento de trayectoria en bucle abierto y que nada se ha ejecutado sobre hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) segun la nomenclatura del autor; la model card no detalla la arquitectura interna. El comportamiento descrito (prediccion de chunks de acciones, 16 ejecutadas por observacion) es el de esta familia |
| Parametros totales | 51.734.182 (dato del repositorio safetensors) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible. No es un modelo de lenguaje: consume 4 vistas RGB (640x360) mas un estado de 38 dimensiones y produce chunks de 16 acciones |
| Tipos de cuantizacion | No disponible. Los pesos se publican en safetensors; no se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponible. No es un modelo de lenguaje ni acepta instrucciones en lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Tarea | Manipulacion bimanual: sostener una caja de panuelos con la mano izquierda y extraer un panuelo con la derecha |
| Espacio de estado/accion | 38-D: [brazo izq. 7 | mano izq. 12 | brazo der. 7 | mano der. 12] en posiciones articulares |
| Entradas sensoriales | 4 camaras RGB, 640x360 a 30 fps (sin tacto en esta variante) |
| Robot objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Datos de entrenamiento | 120 episodios teleoperados; 108 de entrenamiento y 12 reservados (uno de cada 10) |
| Pasos de entrenamiento | 10.000, semilla (seed) 1000 |
| Teleoperacion | Guantes Meta (meta-glove), sin exoesqueleto, con seguimiento de muneca Vive |
| Fecha de publicacion (metadatos HF) | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor etiqueta el modelo como ACT y describe un esquema de control por chunks: la política observa el entorno real cada 16 pasos, genera una secuencia de acciones y solo se ejecutan las 16 primeras antes de la siguiente observacion. Este esquema, caracteristico de Action Chunking Transformer, reduce el problema de horizonte de decision y mitiga la acumulacion de error típica de las políticas que actúan paso a paso. El modelo combina percepcion visual desde cuatro camaras con un estado propioceptivo de 38 dimensiones y produce acciones en ese mismo espacio, incluyendo las 12 articulaciones de cada mano diestra. La model card no especifica el número de capas, la dimensión del modelo ni el mecanismo exacto del encoder visual, por lo que esos detalles quedan como "no disponible".

El entrenamiento es de imitación supervisada sobre 120 episodios recogidos por teleoperación con guantes Meta y seguimiento Vive, sin exoesqueleto. No se menciona RLHF, DPO ni ningún tipo de ajuste por preferencias humanas, algo esperable en este dominio. El reparto de datos es 108 episodios de entrenamiento y 12 de validación (se reserva uno de cada diez). Se entrenaron 10.000 pasos con semilla 1000. La innovación metodológica destacable no está en el modelo en sí, sino en el diseño experimental: el mismo pipeline se replica con cuatro familias de políticas y con una variante táctil, y el autor reporta que "en cuatro familias por tres tareas, la entrada táctil no marcó diferencia más allá del ruido, y GR00T obtuvo el error más bajo en todas las tareas".

## Capacidades

- Control bimanual coordinado: una mano sujeta la caja mientras la otra realiza la extracción, con las dos manos modeladas de forma conjunta en un único vector de 38 dimensiones.
- Manipulación diestra de gran espacio de acción: 12 grados de libertad por mano RobotEra XHand1, lo que permite agarres no triviales sobre un objeto deformable y flexible como un pañuelo.
- Percepción multivista: consume cuatro camaras RGB simultáneas a 640x360 y 30 fps.
- Predicción de secuencias de acción (chunks) en lugar de control reactivo paso a paso, con ejecución de 16 acciones por observación.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: no requiere recompensa ni simulación.
- Reproducibilidad experimental: semilla fija (1000), número de pasos declarado y conjunto de validación definido, lo que facilita replicar el resultado.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje ni expone interfaz de herramientas.
- No soporta agentes, razonamiento multi-paso simbólico, ni modo "thinking".
- No tiene capacidades multilingües ni procesamiento de lenguaje natural de ningún tipo.
- No incorpora entrada táctil en esta variante; existe una versión paralela con tacto (`..._acttactile260921`) que en el estudio no aportó mejora medible.

## Casos de uso

- Automatización de la extracción de pañuelos o toallitas: es la tarea exacta para la que se entrenó; la política sujeta el dispensador con una mano y extrae una unidad con la otra, un gesto que combina estabilidad y tracción sobre material deformable.
- Banco de pruebas para comparar familias de políticas: al existir 24 ejecuciones del mismo estudio con ACT, Diffusion Policy, GR00T 3B y pi0.5, este checkpoint sirve como referencia base para reproducir la comparativa bajo idéntico reparto de datos y métrica.
- Protocolo de evaluación en bucle abierto reproducible: el error medio por grupo articular (brazo y mano, izquierda y derecha) permite medir calidad de seguimiento de trayectoria sin necesidad de robot, útil en fases tempranas de desarrollo.
- Ablación de sensores táctiles: comparar este checkpoint con su variante táctil aísla el efecto de la modalidad táctil sobre el error de seguimiento.
- Investigación en control diestro bimanual: sirve como punto de partida para estudiar coordinación entre dos manos de 12 grados de libertad en tareas de sujeción asimétrica (una mano fija, la otra opera).
- Recolección y reutilización de datos de teleoperación: el pipeline descrito (guantes Meta, seguimiento Vive, 120 episodios) es replicable para generar datasets propios de manipulación bimanual con etiquetas de acción densas.
- Ajuste fino sobre tareas afines: al ser un modelo de 51,7 millones de parámetros con licencia Apache-2.0, es viable reentrenarlo desde este checkpoint para variantes como sostener una caja y extraer un objeto rígido, aunque no hay evidencia publicada de generalización fuera de la tarea original.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados son el error de bucle abierto en el conjunto reservado (12 episodios), medido como media de |prediccion − accion registrada| en radianes, con error estandar de la media. El autor advierte expresamente que esta metrica mide seguimiento de trayectoria, no exito en la tarea, y que no se ejecuto nada sobre hardware.

| Grupo articular | Este modelo (rad) | Baseline "hold-first-frame" (rad) |
|---|---|---|
| Brazo izquierdo | 0,0249 ± 0,0016 | 0,1975 |
| Mano izquierda | 0,0281 ± 0,0038 | 0,0514 |
| Brazo derecho | 0,0610 ± 0,0038 | 0,2628 |
| Mano derecha | 0,0390 ± 0,0021 | 0,1440 |

No se publican resultados de MMLU, HumanEval, GSM8K ni ninguna otra prueba de razonamiento o lenguaje en la informacion disponible, y no serian aplicables a este modelo. Tampoco se publican tasas de exito, curvas de aprendizaje ni comparativas numericas entre las cuatro familias de politicas: la model card solo afirma cualitativamente que GR00T obtuvo el error mas bajo en todas las tareas y que la entrada tactil no aporto mejora mas alla del ruido.

## Requisitos de hardware

- Peso de los parametros: con 51.734.182 parametros, la carga en FP32 ocupa aproximadamente 207 MB y en FP16/BF16 unos 103 MB (calculo aritmetico a partir del recuento de parametros). El repositorio completo ocupa 0,2 GB.
- VRAM estimada: no documentada por el autor. Por tamano de modelo, la inferencia cabe holgadamente en cualquier GPU con al menos 4 GB, y el consumo real vendra dominado por los cuatro flujos de video a 640x360 y 30 fps y por el encoder visual, no por los pesos.
- GPU recomendadas: no disponibles. Cualquier GPU consumer NVIDIA moderna (serie RTX 30/40 o superior) deberia ser suficiente por capacidad de memoria; no se aportan mediciones.
- GPU de centro de datos (A100, H100): no necesarias por tamano de modelo, aunque pueden ser utiles para reentrenamiento o para servir muchas instancias en paralelo.
- Cabe en GPU consumer: si, segun el recuento de parametros. No hay confirmacion del autor ni pruebas publicadas.
- Opciones de despliegue: el formato publicado es safetensors, por lo que el camino natural es PyTorch con el stack de ACT/LeRobot. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje y no tiene tokenizador.
- Latencia y throughput: no documentados. Como dato derivado del protocolo, si las observaciones se capturan a 30 fps y se ejecutan 16 acciones por observacion, la frecuencia de replanificacion seria de aproximadamente 1,875 Hz, es decir, una inferencia completa cada 533 ms en el peor caso sincrono.
- Requisitos adicionales de integracion: drivers del robot DexMate Vega-1, control de las dos manos XHand1, sincronizacion de cuatro camaras RGB y, en el caso del entrenamiento, guantes Meta y tracking Vive.

## Comparativa con modelos similares

La model card forma parte de un estudio con 24 ejecuciones que cruza cuatro familias sobre tres tareas. La comparativa siguiente se limita a lo que puede afirmarse con la informacion disponible.

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, sin tacto) | 51.734.182 | 4 camaras RGB 640x360 a 30 fps + estado 38-D | Error de bucle abierto por debajo del baseline "hold-first-frame" en los cuatro grupos articulares | Apache-2.0 | Publicado en HuggingFace, 0 descargas, 0 likes |
| ACT + tactil (`..._acttactile260921`) | No disponible | Igual que el anterior mas senal tactil | Sin diferencia apreciable frente a este modelo ("no mas alla del ruido") | Apache-2.0 | Publicado, mismo autor |
| Diffusion Policy (`..._dp260921`, `..._dptactile260921`) | No disponible | Misma configuracion de camaras y estado | Error superior al de GR00T; sin cifras publicadas | No disponible en la informacion proporcionada | Publicado, mismo autor |
| GR00T 3B (`..._gr00t3b260921`, `..._gr00t3btactile260921`) | No confirmado; el nombre del checkpoint sugiere 3.000 millones | Misma configuracion de camaras y estado | El error mas bajo de las cuatro familias en todas las tareas, segun el autor | No disponible en la informacion proporcionada | Publicado, mismo autor |
| pi0.5 / pi-0.5 (`..._pi05260921`, `..._pi05tactile260921`) | No disponible | Misma configuracion de camaras y estado | Sin cifras publicadas; no lidera la comparativa segun la model card | No disponible en la informacion proporcionada | Publicado, mismo autor |

La diferencia de escala es notable: este checkpoint (51,7 M de parametros) es entre uno y dos ordenes de magnitud mas pequeno que las alternativas tipo fundacional como GR00T 3B o pi0.5, lo que explica que sea mucho mas ligero de desplegar pero tambien que este especializado en una unica tarea con 120 episodios.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no acepta instrucciones en lenguaje natural, no soporta tool calling, agentes ni razonamiento multi-paso, y no tiene capacidades multilingues.
- Nunca se ha ejecutado sobre hardware fisico: el autor lo indica de forma explicita. Todas las cifras son error de bucle abierto y no hay tasa de exito ni robustez en bucle cerrado.
- Riesgo de acumulacion de error en despliegue real: al ejecutarse 16 acciones sin reobservar, cualquier desviacion inicial se propaga durante el chunk; el propio protocolo mitiga este problema, pero no lo elimina.
- Sobreajuste a la tarea y al montaje: 120 episodios de una unica tarea implican que el modelo no generaliza a otras disposiciones de camara, alturas de mesa, iluminacion o variantes del objeto.
- Sesgos derivados de la teleoperacion: el estilo de demostracion de los operadores (guantes Meta, sin exoesqueleto) condiciona la distribucion de trayectorias, velocidades y agarres; el modelo reproducira ese sesgo y puede fallar ante objetos con rigidez, friccion o tamano distintos.
- Sin evidencia sobre la utilidad del tacto: en el estudio, la senal tactil no aporto ventaja mas alla del ruido, por lo que elegir la variante tactil no esta justificado por los datos publicados.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de reproducibilidad ni de comportamiento fuera del conjunto reservado.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero exige conservar los avisos de copyright y licencia, e incluye una clausula de exencion de garantias. No hay condiciones de uso adicionales documentadas.
- Advertencia de seguridad fisica: se trata de una politica bimanual que controla manos diestras y aplica fuerzas sobre objetos. Cualquier despliegue deberia incorporar limites articulares, deteccion de colision, parada de emergencia y supervision humana, dado que no se han caracterizado los modos de fallo.
- Metadatos incompletos: la model card no documenta arquitectura interna, hiperparametros de entrenamiento mas alla de pasos y semilla, ni requisitos de computo, lo que dificulta la reproduccion exacta.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Variante con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Variante Diffusion Policy con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Variante GR00T 3B con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Variante pi0.5: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Variante pi0.5 con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
