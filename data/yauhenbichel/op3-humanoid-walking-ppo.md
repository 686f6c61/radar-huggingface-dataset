# YauhenBichel/op3-humanoid-walking-ppo

## Resumen

`YauhenBichel/op3-humanoid-walking-ppo` es un conjunto de políticas de locomoción para el robot humanoide ROBOTIS OP3 (unos 50 cm de altura y 20 articulaciones), entrenadas íntegramente en simulación con PPO (implementación Brax) sobre el entorno `Op3Joystick` de MuJoCo Playground 0.2.0, usando el modelo del robot de MuJoCo Menagerie. El autor es YauhenBichel y publica dos variantes: `baseline/`, entrenada para seguir comandos de velocidad, y `staged-shoves/`, afinada con empujones crecientes, retardo de servo, offsets de encoder y aleatorización de parámetros físicos.

El interés de la publicación no está en el tamaño —es un MLP de 4 capas de 128 unidades, exportado a NumPy puro para que el ordenador del robot no necesite JAX— sino en la transparencia de los resultados: la model card documenta tasas de caída bajo condiciones adversas y declara explícitamente que son resultados intermedios de un proyecto en curso, no controladores terminados. La política `baseline` camina 5,27 m en 10 s con 0 % de caídas en 128 episodios de test y es utilizable entre 0,3 y 0,8 m/s, pero cae con cualquier empujón de 30 N.

Ambas políticas son exclusivamente de simulación y no se han validado en hardware real. La licencia es Apache-2.0, el formato de pesos es `.npz` de NumPy y el repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) de 4 capas x 128 unidades con activacion swish; politica entrenada con PPO (Brax) |
| Parametros totales | No indicado en la model card. Estimacion a partir de la arquitectura descrita (entrada 147, ocultas 128, salida 2 x 20): del orden de 5,7 x 10^4 parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. La observacion es un vector de 147 numeros con 3 frames apilados (giroscopio, direccion de la gravedad, comando, angulos articulares y ultima accion) |
| Tipos de cuantizacion | No aplica. Pesos exportados en NumPy (por defecto float32); no se documentan variantes cuantizadas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | NumPy `.npz` (fichero `policy.npz` con pesos, sesgos, `default_pose`, `action_scale`, `action_size`, `n_layers`, `actuator_names`, `obs_mean`, `obs_std`) |
| Robot objetivo | ROBOTIS OP3, ~50 cm, 20 articulaciones |
| Entorno de entrenamiento | MuJoCo Playground 0.2.0, tarea `Op3Joystick` (modelo OP3 de MuJoCo Menagerie) |
| Frecuencia de control | 50 Hz (paso de 0,02 s) |
| Dimension de acciones | 20 (objetivos de posicion articular = pose por defecto + 0,3 x accion) |
| Variantes publicadas | `baseline/`, `staged-shoves/` (una tercera, `hardened-02`, no se publico) |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa de 4 capas con 128 unidades ocultas y activación swish. La salida tiene 40 dimensiones (media y escala para 20 acciones) y la acción aplicada es `tanh(media)` en inferencia determinista. La entrada son 147 números procedentes de tres frames apilados: velocidad angular del giroscopio, dirección de la gravedad, comando de velocidad, ángulos articulares y última acción. Las salidas se transforman en consignas de posición articular mediante `pose por defecto + 0,3 x acción`. El entrenamiento se hizo con PPO de Brax en el entorno `Op3Joystick` de MuJoCo Playground 0.2.0.

La variante `baseline` se entrenó durante 103 millones de pasos en 96 minutos sobre una CPU de 16 núcleos (AMD Ryzen AI MAX+ 395) con JAX repartido en 16 dispositivos de CPU, es decir, sin GPU. La variante `staged-shoves` se entrenó en dos etapas: la primera con patadas de 0,1 a 1,0 m/s cada 2-5 s se detuvo antes de tiempo por falta de memoria; la segunda continuó desde ese checkpoint durante unos 69 millones de pasos con patadas de 0,3 a 2,0 m/s cada 1,5-4 s, retardo de servo en la mitad de los episodios, offsets de encoder de ±0,03 rad y aleatorización de fricción, masas y ganancias de servo. No se documenta uso de RLHF, DPO ni datos humanos: el aprendizaje es puramente por refuerzo sobre recompensas de simulación. La innovación práctica es el formato de exportación: pesos planos en NumPy que permiten ejecutar la inferencia sin JAX ni ninguna otra dependencia, algo relevante para el ordenador de a bordo de un robot pequeño.

## Capacidades

- Seguimiento de comandos de velocidad de avance (marcha hacia delante) en simulación.
- Rango de velocidades utilizable de 0,3 a 0,8 m/s en `baseline`; en `staged-shoves` el rango se estrecha a 0,4-0,5 m/s.
- `baseline`: 5,27 m recorridos en 10 s y 0 % de caídas en 128 episodios de test.
- `staged-shoves`: 4,67 m recorridos en 10 s y 20,3 % de caídas en episodios con empujón y aleatorización (objetivo declarado: por debajo del 10 %).
- Tolerancia a retardo de servo de 1-2 periodos de control, cambios de rigidez de servo (x0,7 y x1,3), 0,5 kg adicionales en el torso, fricción de deslizamiento 0,4, offsets de encoder de 0,05 rad y ruido de IMU.
- `staged-shoves` no cae con empujones de 15 N; `baseline` cae en el 38 % de los episodios con 15 N.
- Inferencia determinista en NumPy puro, sin JAX, apta para ejecutarse en el ordenador del robot.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades de visión, audio, generación de texto, código ni matemáticas.
- No dispone de capacidades multilingües ni de ninguna modalidad distinta de las observaciones propioceptivas descritas.

## Casos de uso

- Investigación en locomoción bípeda: sirve como referencia reproducible de PPO sobre `Op3Joystick`, con curvas de robustez publicadas frente a retardo, masa, fricción y empujones, lo que permite comparar nuevos algoritmos contra una línea base concreta.
- Punto de partida para aprendizaje por currículo: `staged-shoves` demuestra la técnica de endurecimiento progresivo con patadas crecientes y aleatorización de dinámica, y puede reutilizarse como checkpoint inicial en lugar de entrenar desde cero.
- Validación de pipelines de sim-to-real: la model card incluye pruebas en el bucle de control de despliegue de 50 Hz con paradas de seguridad en MuJoCo en C, lo que permite medir de antemano cuánto margen hay antes de tocar hardware.
- Pruebas de hardware con arnés o suspensión: dado que no está validado en el robot real y cae a partir de 30 N, su uso sensato en laboratorio es con protecciones mecánicas para verificar la integración de drivers, retardos reales y calibración de encoders.
- Docencia y formación en RL: el entrenamiento completo de `baseline` ocupa 96 minutos en una CPU de 16 núcleos, sin GPU, y la política resultante es un MLP diminuto, lo que hace viable reproducir el ciclo completo en un aula o taller.
- Demos de robot companion: el repositorio asociado `humanoid-companion` incluye un bucle de control, simulador y demo de robot parlante que carga este formato `.npz`, útil para integrar locomoción con capas de interacción.
- Generación de datos comparativos de política: las dos variantes permiten estudiar el compromiso entre robustez a perturbaciones y rango de velocidades útil al alimentar pipelines de evaluación internos.
- Benchmark interno de eficiencia de entrenamiento: 103 millones de pasos en 96 minutos en 16 núcleos de CPU sirve como referencia de coste para decidir si conviene escalar a GPU en proyectos similares.

## Benchmarks y rendimiento

Resultados declarados por el autor en el bucle de control del robot (MuJoCo en C, 50 Hz, con paradas de seguridad), comando de 0,4 m/s durante 6,0 s. Cada celda indica tasa de caídas (numero de ejecuciones) y velocidad media de avance en m/s.

| Condicion | baseline | hardened-02 (no publicado) | staged-shoves |
|---|---|---|---|
| nominal | 0 % caidas (1), 0,40 | 0 % caidas (1), 0,37 | 0 % caidas (1), 0,37 |
| latency_1 | 0 % caidas (1), 0,38 | 0 % caidas (1), 0,34 | 0 % caidas (1), 0,34 |
| latency_2 | 0 % caidas (1), 0,35 | 0 % caidas (1), 0,30 | 0 % caidas (1), 0,32 |
| kp_0.7 | 0 % caidas (1), 0,24 | 0 % caidas (1), 0,25 | 0 % caidas (1), 0,24 |
| kp_1.3 | 0 % caidas (1), 0,53 | 0 % caidas (1), 0,46 | 0 % caidas (1), 0,48 |
| mass_+0.5kg | 0 % caidas (1), 0,36 | 0 % caidas (1), 0,34 | 0 % caidas (1), 0,34 |
| friction_0.4 | 0 % caidas (1), 0,37 | 0 % caidas (1), 0,35 | 0 % caidas (1), 0,36 |
| encoder_0.05 | 0 % caidas (8), 0,37 | 0 % caidas (8), 0,40 | 0 % caidas (8), 0,38 |
| imu_noise | 0 % caidas (8), 0,41 | 0 % caidas (8), 0,37 | 0 % caidas (8), 0,38 |
| push_15N | 38 % caidas (8), 0,35 | 0 % caidas (8), 0,36 | 0 % caidas (8), 0,37 |
| push_30N | 100 % caidas (8), 0,34 | 88 % caidas (8), 0,32 | 100 % caidas (8), 0,29 |
| push_60N | 100 % caidas (8), 0,34 | 100 % caidas (8), 0,33 | 100 % caidas (8), 0,30 |
| push_90N | 100 % caidas (8), 0,36 | 100 % caidas (8), 0,34 | 100 % caidas (8), 0,31 |

Resumen de las dos variantes publicadas:

| Variante | Distancia en 10 s | Caidas en test | Rango de velocidad util | Empujon tolerado |
|---|---|---|---|---|
| baseline | 5,27 m | 0 % en 128 episodios | 0,3-0,8 m/s | Cae a partir de 30 N (38 % de caidas ya con 15 N) |
| staged-shoves | 4,67 m | 20,3 % en episodios con empujon y aleatorizacion | 0,4-0,5 m/s | Sin caidas a 15 N; cae a 30 N |

No se han publicado en la informacion disponible comparaciones con otros modelos o políticas externas, ni metricas tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia: un MLP de 4 capas x 128 unidades con entrada de 147 valores. El coste por paso son cuatro productos matriciales pequeños, por lo que la carga de computo es despreciable frente al resto del bucle de control.
- VRAM: no aplica en la practica. Los pesos ocupan del orden de unos cientos de kilobytes en float32; cualquier CPU es suficiente y no se requiere GPU.
- GPU recomendadas: ninguna. El autor exporta los pesos a NumPy precisamente para que el ordenador del robot no necesite JAX ni acelerador.
- Cabe en hardware de consumo: si, en cualquier CPU moderna, incluido el ordenador de a bordo de un OP3 o una Raspberry Pi de gama alta, siempre que el bucle de control cumpla los 50 Hz.
- Entrenamiento: la variante `baseline` se completo en 96 minutos con 103 millones de pasos sobre una CPU AMD Ryzen AI MAX+ 395 de 16 nucleos con JAX repartido en 16 dispositivos de CPU. No se documento entrenamiento en GPU.
- Opciones de despliegue: NumPy puro (formato `.npz` con la funcion `act` incluida en la model card), JAX/Brax si se quiere reutilizar el entorno de entrenamiento, y MuJoCo (Python o la version en C citada para las pruebas del bucle de despliegue).
- Latencia y throughput: no disponibles de forma explicita. El unico dato temporal es la frecuencia de control de 50 Hz (paso de 0,02 s) y que el entrenamiento cubre 103 millones de pasos de simulacion.
- Restriccion de tiempo real: retardo de servo de 1-2 periodos de control ya degrada ligeramente la velocidad alcanzada segun la tabla de robustez; el margen de computo del controlador debe dejar sitio a esos retardos.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La unica comparacion publicada es interna, entre las variantes del propio autor, y una tercera variante (`hardened-02`) que no se publico porque no aprendio. No hay resultados frente a otras politicas de MuJoCo Playground, otros controladores clasicos para OP3 ni otros repositorios de locomocion, por lo que cualquier comparacion externa seria especulativa.

| Modelo | Parametros | Contexto | Entorno de evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| op3-humanoid-walking-ppo (baseline) | ~5,7 x 10^4 (estimado) | No aplica (observacion 147 x 3 frames) | MuJoCo / Op3Joystick, 50 Hz | Apache-2.0 | Publicado en HuggingFace, 0 descargas |
| op3-humanoid-walking-ppo (staged-shoves) | ~5,7 x 10^4 (estimado) | No aplica | MuJoCo / Op3Joystick, 50 Hz | Apache-2.0 | Publicado en HuggingFace, 0 descargas |
| Alternativas externas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Exclusivamente simulación: el autor indica explicitamente que las politicas no se han validado en hardware. Cualquier traslado al robot real es un experimento sin garantia.
- Caidas con perturbaciones moderadas: ambas politicas publicadas caen al 100 % con empujones de 30 N. Incluso `staged-shoves`, presentada como mas robusta, mantiene esa tasa.
- La mejora en robustez de `staged-shoves` tiene coste: reduce la velocidad util de 0,3-0,8 m/s a 0,4-0,5 m/s y la distancia recorrida en 10 s pasa de 5,27 m a 4,67 m.
- El objetivo declarado de `staged-shoves` (menos del 10 % de caidas en episodios con empujon) no se alcanzo: quedo en 20,3 %.
- Sensibilidad a la dinamica de los servos: con rigidez reducida (kp x0,7) la velocidad media cae de 0,40 a 0,24 m/s en `baseline`, lo que indica fuerte dependencia de las ganancias reales del robot.
- No es un controlador certificado para seguridad. El propio autor advierte de que un robot real ejecutandolo puede caerse, pellizcar o golpear. No es un dispositivo medico ni de cuidados.
- No hay datos de sesgo en el sentido estadistico habitual porque no se usan datos humanos, pero si hay sobreajuste al simulador: las condiciones de aleatorizacion son limitadas y estan enumeradas explicitamente en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano reportado de 0,0 GB, por lo que no existe validacion independiente ni garantia de mantenimiento.
- Una variante adicional del proyecto (`hardened-02`) no se publico porque no aprendio, lo que sugiere que la ruta de endurecimiento frente a impactos fuertes no esta resuelta.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero la ausencia de validacion en hardware hace desaconsejable cualquier uso en produccion o cerca de personas sin analisis de riesgo propio.
- No se documentan idiomas soportados porque no aplica; la model card esta en ingles y no hay traducciones oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YauhenBichel/op3-humanoid-walking-ppo
- Video de marcha base a 0,5 m/s: https://huggingface.co/YauhenBichel/op3-humanoid-walking-ppo/resolve/main/videos/baseline-walk-0.5ms.mp4
- Video comparativo del empujon de 30 N: https://huggingface.co/YauhenBichel/op3-humanoid-walking-ppo/resolve/main/videos/shove-30N-baseline-vs-staged-shoves.mp4
- Repositorio con bucle de control, simulador y demo: https://github.com/YauhenBichel/humanoid-companion
- Dataset con los experimentos: https://huggingface.co/datasets/YauhenBichel/humanoid-lab-experiments
- MuJoCo Playground (Google DeepMind, Apache-2.0): https://github.com/google-deepmind/mujoco_playground
- MuJoCo Menagerie (Google DeepMind, Apache-2.0): https://github.com/google-deepmind/mujoco_menagerie
- Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos eran de videojuegos sin relacion alguna.
