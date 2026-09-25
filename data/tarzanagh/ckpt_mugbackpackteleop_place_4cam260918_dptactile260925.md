# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dptactile260925

## Resumen

`tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dptactile260925` es un checkpoint de política de imitación para robótica, no un modelo de lenguaje. Lo publica el usuario de HuggingFace `tarzanagh` (Davoud Ataee Tarzanagh) y resuelve una única tarea de manipulación bimanual: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sostiene una mochila abierta con la mano izquierda y mete una taza dentro con la derecha.

La arquitectura es una Diffusion Policy (política de difusión) con entrada táctil añadida sobre la política base, entrenada por imitación a partir de teleoperación con meta-guante y seguimiento de muñeca con Vive. El checkpoint tiene 268.343.590 parámetros (unos 268 M), ocupa 1,1 GB en el repositorio y se distribuye en formato safetensors bajo licencia Apache 2.0.

Su relevancia es acotada y fundamentalmente de investigación: forma parte de una serie de ocho experimentos publicados por el mismo autor sobre la misma tarea (GR00T 3B, pi0.5, ACT y Diffusion Policy, cada uno con y sin táctil) y sirve como punto de comparación reproducible dentro de ese conjunto de ablaciones. No se ha ejecutado en hardware real: todos los números publicados son error de seguimiento en bucle abierto sobre cuatro episodios reservados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión sobre trozos de acción) con entrada táctil; codificador visual para 4 cámaras RGB. Detalles de capas no disponibles |
| Parámetros totales | 268.343.590 (~268 M) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable; el modelo predice un trozo de acción de 16 pasos y ejecuta los 16 primeros antes de volver a observar |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Tarea | Manipulación bimanual diestra: sostener una mochila abierta y colocar una taza en su interior |
| Robot y efectores | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Entrada de estado | 38-D de posiciones articulares `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` + 30-D de fuerza en punta de dedo (5 dedos × 3 ejes por mano) = 68-D |
| Acción | 38-D de posiciones articulares |
| Percepción | 4 cámaras RGB, 640x360 a 30 fps |
| Datos de entrenamiento | 31 episodios; 27 de entrenamiento y 4 reservados (uno de cada 10) |
| Pasos de entrenamiento | 10.000, semilla 1000 |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una Diffusion Policy, es decir, una política que genera acciones mediante un proceso de difusión condicionado por las observaciones, en lugar de regresar directamente una acción. El autor añade una vía táctil sobre una variante base, de modo que la política combina visión (cuatro cámaras RGB a 640x360 y 30 fps) con señales de fuerza en la punta de los dedos: 30 dimensiones de fuerza (5 dedos × 3 ejes por mano) concatenadas al estado articular de 38 dimensiones, lo que da una observación de 68 dimensiones. La acción predicha es de 38 dimensiones de posición articular. No se especifican en la ficha el backbone del codificador visual, el tipo de denoiser, el número de pasos de difusión ni el esquema de ruido.

El régimen de control es de horizonte recedente: la política observa el estado real cada 16 pasos y predice un trozo de acciones, del que solo se conservan las 16 primeras antes de volver a observar. Los datos proceden de teleoperación con meta-guante (sin exoesqueleto) y seguimiento de muñeca con Vive, con 31 episodios de los que 27 se usan para entrenar y 4 se reservan para evaluación (se aparta uno de cada diez). El entrenamiento se fija en 10.000 pasos con semilla 1000. No se documenta si hubo aumento de datos, currículo, RLHF/DPO (no aplicables aquí) ni regularización adicional.

## Capacidades

- Manipulación bimanual coordinada: una mano mantiene la mochila abierta mientras la otra introduce la taza, con control simultáneo de 14 articulaciones de brazo y 24 de mano por episodio.
- Control diestro de mano de 12 grados de libertad por mano (XHand1), incluyendo posiciones articulares de dedos.
- Percepción multimodal: cuatro vistas RGB sincronizadas más señal táctil de fuerza en punta de dedo.
- Condicionamiento táctil: la variante incorpora 30-D de fuerza, aunque en la evaluación publicada la entrada táctil no produjo una diferencia consistente frente a la variante sin táctil en Diffusion Policy.
- Generación de acciones multimodales: al ser una política de difusión, puede representar distribuciones multimodales de acción, útil cuando hay varias trayectorias válidas.
- Replanificación en bucle cerrado a 16 pasos, que permite corregir desviaciones con la observación real.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general ni audio: es una política específica de una tarea.

## Casos de uso

- Reproducción de la tarea demostrada: colocar objetos dentro de un contenedor deformable sostenido por la otra mano; el modelo está entrenado exactamente para eso y con 31 episodios de teleoperación es adecuado como punto de partida para esa destreza concreta.
- Recogida y colocación en logística con contenedores flexibles: en lugar de dejar la bolsa en una superficie rígida, la política emplea una mano como sujeción activa, lo que permite gestionar aberturas que cambian de forma durante la inserción.
- Punto de partida para ajuste fino con datos propios: con solo 27 episodios de entrenamiento el modelo demuestra que el régimen de pocos datos es viable; un equipo con su propia celda Vega-1/XHand1 puede reentrenar con su propio conjunto y su propia semilla.
- Ablación reproducible para investigación: sirve como una de las cuatro familias base (GR00T 3B, pi0.5, ACT y Diffusion Policy, en versiones con y sin táctil) para medir el efecto de la arquitectura y de la entrada táctil sobre el error de seguimiento en la misma tarea.
- Estudio de fusión viso-táctil: permite comparar directamente frente a `ckpt_mugbackpackteleop_place_4cam260918_dp260925` (mismo modelo sin táctil) para cuantificar el efecto de las señales de fuerza.
- Investigación en teleoperación: las demostraciones se capturaron con meta-guante y seguimiento Vive, de modo que el checkpoint permite estudiar la transferencia de teleoperación sin exoesqueleto a políticas autónomas.
- Manipulación que requiere control de fuerza: la parte táctil del estado aporta información de contacto que puede aprovecharse en tareas donde la inserción a ciegas provoca daños al objeto o al agarre.
- Docencia y evaluación de metodología: al publicar el error en bucle abierto frente a un baseline trivial (`hold-first-frame`), resulta útil como ejemplo de cómo medir trayectorias predichas antes de llevar una política al robot.

## Benchmarks y rendimiento

El autor publica una única métrica: error en bucle abierto sobre los 4 episodios reservados, definido como media de |acción predicha − acción registrada| en radianes (± error estándar de la media, n=4). Mide seguimiento de trayectoria, no éxito de tarea, y no se ejecutó nada en hardware.

| Sistema | L-brazo | L-mano | R-brazo | R-mano |
|---|---|---|---|---|
| Este modelo (DP + táctil) | 0,0307 ± 0,0025 | 0,0284 ± 0,0035 | 0,0479 ± 0,0018 | 0,0369 ± 0,0035 |
| Baseline `hold-first-frame` | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

Datos adicionales aportados en la ficha, sin cifras concretas: de las cuatro familias de baseline (GR00T, pi0.5, ACT y Diffusion Policy), GR00T obtuvo el error más bajo, en torno a tres veces por debajo de Diffusion Policy; y la entrada táctil no supuso una diferencia consistente para Diffusion Policy. No se publican en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, que no serían aplicables a este modelo.

## Requisitos de hardware

- Peso de los parámetros: 268.343.590 parámetros equivalen a unos 1,07 GB en fp32, coherente con el tamaño de 1,1 GB del repositorio. No se publica la precisión exacta de los pesos, por lo que el cálculo es una estimación derivada del recuento de parámetros.
- VRAM para inferencia: no medida ni publicada. Como referencia derivada, los pesos ocupan aproximadamente 1,1 GB y el coste dominante sería el procesamiento de 4 cámaras RGB a 640x360 y 30 fps más el bucle de difusión; el autor no aporta cifras.
- GPU recomendadas: no publicadas. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder alojar los pesos y el codificador visual, pero esto es una estimación, no un dato medido.
- GPU de consumo: por el recuento de parámetros, el modelo es lo bastante pequeño para caber en tarjetas de consumo tipo RTX 3060/4060/4090, siempre que la memoria restante soporte las activaciones y el bucle de difusión.
- Despliegue: el autor no documenta instrucciones de despliegue. Al ser una política de difusión, no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje; requeriría un runtime de inferencia de difusión capaz de cargar los pesos safetensors y de alimentar sincrónicamente las cuatro cámaras.
- Latencia y throughput: no disponibles. La única restricción temporal declarada es la captura de datos a 30 fps y el esquema de reejecución cada 16 pasos; no se publica la frecuencia de control alcanzada en inferencia.

## Comparativa con modelos similares

El propio autor publica la serie completa sobre la misma tarea, lo que permite una comparación directa aunque solo uno de los modelos tenga cifras publicadas.

| Modelo | Repositorio | Parámetros | Entrada táctil | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Diffusion Policy + táctil (este) | `..._dptactile260925` | 268,3 M | Sí | Apache 2.0 | Error en bucle abierto en la tabla anterior |
| Diffusion Policy | `..._dp260925` | No disponible | No | Apache 2.0 | No disponible en la información |
| GR00T 3B | `..._gr00t3b260924` | ≈3 B (según el nombre del checkpoint) | No | No disponible | El más bajo de las cuatro familias, ≈3× por debajo de Diffusion Policy (sin cifras en la ficha) |
| GR00T 3B + táctil | `..._gr00t3btactile260924` | ≈3 B (según el nombre) | Sí | No disponible | No disponible |
| pi0.5 | `..._pi05260924` | No disponible | No | No disponible | No disponible |
| pi0.5 + táctil | `..._pi05tactile260924` | No disponible | Sí | No disponible | No disponible |
| ACT | `..._act260924` | No disponible | No | No disponible | No disponible |
| ACT + táctil | `..._acttactile260924` | No disponible | Sí | No disponible | No disponible |

Frente a modelos de propósito general no existe comparación posible: el resto de la serie comparte tarea, robot y conjunto de datos, mientras que cualquier modelo de lenguaje o de visión general opera en un régimen completamente distinto.

## Limitaciones y advertencias

- No se ha ejecutado en hardware: el propio autor indica que nada de lo publicado se probó en el robot. Todas las métricas son error de seguimiento en bucle abierto, que no equivale a éxito de la tarea.
- Especialización extrema: resuelve una única tarea (sostener una mochila y meter una taza) con un robot y unos efectores concretos (DexMate Vega-1 y dos XHand1). No generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Conjunto de datos muy pequeño: 31 episodios, de los que solo 4 se reservan para evaluación, y un único entrenamiento con semilla 1000. No hay evidencia de robustez estadística frente a variaciones de semilla o de datos.
- La señal táctil no aportó una mejora consistente: el autor lo señala explícitamente para Diffusion Policy, de modo que la variante táctil no debe asumirse superior en esta tarea.
- Sin validación de robustez: no se documentan pruebas con iluminación distinta, oclusiones, cambios de fondo, objetos distintos ni perturbaciones externas.
- Riesgo de alucinación en el sentido robótico: al ser un modelo generativo de difusión, puede producir trayectorias plausibles pero incorrectas sin señal de confianza asociada; no hay mecanismo de rechazo ni de detección de fallo publicados.
- Sin capacidades lingüísticas ni multilingües: la fila de idiomas no aplica y no debe interpretarse el modelo como un sistema conversacional.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de licencia, pero la licencia del software cubre los pesos, no la seguridad física de su despliegue. Cualquier uso en un robot real exige validación de seguridad, límites de fuerza y paradas de emergencia ajenos al modelo.
- Vínculo a hardware propietario: los tags mencionan XHand1 y dexmate-vega, por lo que la reproducibilidad depende de acceso a esa plataforma o a una equivalente con el mismo espacio de acciones de 38 dimensiones y la misma disposición de 4 cámaras.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar problemas de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dptactile260925
- Perfil del autor: https://huggingface.co/tarzanagh
- Modelos del autor: https://huggingface.co/tarzanagh/models
- Variantes de la misma tarea y serie de ablaciones:
  - https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
  - https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
  - https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
  - https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
  - https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
  - https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
  - https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dp260925
