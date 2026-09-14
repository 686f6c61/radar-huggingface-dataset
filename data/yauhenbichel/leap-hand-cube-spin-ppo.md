# YauhenBichel/leap-hand-cube-spin-ppo

## Resumen

`YauhenBichel/leap-hand-cube-spin-ppo` es una política de control para la mano robótica LEAP (16 articulaciones, palma hacia arriba) que hace girar un cubo sobre su palma alrededor del eje vertical. No es un modelo de lenguaje ni un modelo fundacional: es un controlador entrenado con aprendizaje por refuerzo (PPO sobre Brax) en el entorno `LeapCubeRotateZAxis` de MuJoCo Playground 0.2.0, y exportado a NumPy puro para que pueda ejecutarse sin JAX ni dependencias de entrenamiento.

El interés técnico está en tres puntos concretos: el uso de aleatorización de dominio (fricción, masas y propiedades de las articulaciones) para favorecer una eventual transferencia a hardware real; una arquitectura actor-crítico asimétrica en la que el crítico ve la pose y la velocidad del cubo pero el actor solo recibe 32 números (16 ángulos articulares con ruido durante el entrenamiento y las 16 acciones previas); y una exportación que reproduce la inferencia determinista de Brax con un error máximo de 1e-5 usando únicamente NumPy.

En las pruebas publicadas, sobre 128 manos aleatorizadas y episodios de 10 segundos, la política deja caer el cubo en el 2,3 % de los episodios, mantiene el cubo en la palma el 97,9 % del tiempo y alcanza una velocidad de giro de 0,94 rad/s (1,47 vueltas en 10 s) frente a un objetivo de 1,0 rad/s que todavía no cumple. La model card es explícita: es exclusivamente simulación y no se ha validado en una mano física.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 4 capas (32 → 512 → 256 → 128 → 32), activación swish; actor-crítico asimétrico durante el entrenamiento; solo se exporta el actor (política determinista) |
| Parametros totales | ≈185 248 (calculado a partir de la arquitectura declarada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la observación es un vector de 32 valores (16 ángulos articulares + 16 acciones previas) |
| Tipos de cuantizacion | No disponible; el único formato publicado es NumPy en coma flotante |
| Idiomas soportados | No aplica (no es un modelo de lenguaje). La interfaz de instrucciones en lenguaje natural procede de un planificador externo que no forma parte de este repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy `.npz` (`policy.npz`) con las claves `n_layers`, `w{i}`, `b{i}`, `obs_mean`, `obs_std`, `action_size`, `default_pose`, `action_scale` y `actuator_names` |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa de tres capas ocultas (512, 256, 128 neuronas) con activación swish y una salida de 32 valores que se interpretan como 16 medias y 16 escalas; la acción final se obtiene aplicando `tanh` sobre las medias, por lo que queda acotada en [-1, 1]. Las acciones se traducen a consignas de posición articular mediante `default_pose + 0.6 × action`, con un periodo de control de 0,05 s (20 Hz). Durante el entrenamiento se empleó un esquema actor-crítico asimétrico: el crítico recibía la pose y la velocidad del cubo (información privilegiada disponible solo en simulación), mientras que el actor únicamente veía los 32 números de la observación, con ruido añadido a los ángulos articulares.

El entrenamiento usó PPO de Brax con 100 millones de pasos y 8192 manos en paralelo, ejecutado en 4,3 horas sobre la CPU de un servidor doméstico (AMD Ryzen AI MAX+ 395), con el aleatorizador de dominio para la mano LEAP que incluye MuJoCo Playground. La recompensa de evaluación pasó de −0,58 a 27,65 y seguía subiendo en el momento de publicar. La exportación conserva únicamente la política: la normalización de la observación (`obs_mean`, `obs_std`) y los pesos del MLP, y coincide con la inferencia determinista de Brax dentro de 1e-5. El orden de las articulaciones viene dado por `actuator_names`.

## Capacidades

- Control de una única habilidad: rotación de un cubo sobre la palma alrededor del eje vertical con la mano LEAP de 16 articulaciones.
- Mantenimiento del agarre: capacidad de sostener el cubo sin moverse (acción cero) durante intervalos de varios segundos; en la demostración se midió un desplazamiento de 0,28 rad en 3 segundos de "hold".
- Robustez a aleatorización de dominio: evaluada sobre 128 manos con fricción, masas y propiedades articulares aleatorizadas, con una tasa de caída del 2,3 %.
- Ejecución determinista e independiente de framework: inferencia en NumPy puro, sin JAX ni Brax, con divergencia máxima de 1e-5 respecto a la inferencia de referencia.
- Composición con un planificador externo: acepta secuencias del tipo "girar 5 segundos y después mantener quieto 3 segundos" cuando un modelo de lenguaje local traduce la instrucción a una elección entre esta política y la acción cero (el planificador no forma parte del modelo).
- No soporta: tool calling, function calling, razonamiento multi-paso autónomo, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en manipulación diestra: sirve como línea base reproducible sobre el entorno `LeapCubeRotateZAxis` para comparar algoritmos de RL (PPO frente a SAC u otros), presupuestos de pasos o esquemas de aleatorización de dominio, gracias a que el coste de entrenamiento documentado es de 4,3 horas en CPU.
- Estudio de transferencia sim-a-real: la aleatorización de fricción, masas y parámetros articulares está diseñada para producir políticas menos frágiles; esta política puede usarse como punto de partida para destilación o ajuste fino sobre dinámica medida en una mano física, aunque el autor advierte que no ha sido validada en hardware.
- Enseñanza de aprendizaje por refuerzo: el repositorio incluye un ejemplo de inferencia completo en menos de 20 líneas de NumPy, lo que permite ilustrar el ciclo observación-acción de una política entrenada sin arrastrar dependencias de JAX, útil en cursos y tutoriales.
- Generación de trayectorias para imitation learning: los rollouts de la política (observaciones, acciones y estados del cubo) pueden registrarse como demostraciones sintéticas para entrenar políticas de imitación o modelos de dinámica.
- Interfaz lenguaje-acción de bajo nivel: combinada con un planificador local que decide entre "girar" y "mantener", permite experimentar con arquitecturas de agentes donde un LLM selecciona habilidades primitivas ya entrenadas; en la model card se documenta una planificación en 1,4 s para una instrucción compuesta.
- Evaluación de infraestructura de simulación: al ejecutar 8192 entornos paralelos en CPU, el caso resulta útil para medir throughput de Brax/MuJoCo Playground en hardware sin GPU.
- Estudio de robustez frente a incertidumbre: los 128 escenarios aleatorizados permiten analizar sensibilidad de la política a la fricción y a las masas, y detectar modos de fallo antes de plantear un despliegue físico.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 128 manos aleatorizadas, episodios de 10 segundos:

| Metrica | Medido | Objetivo |
|---|---|---|
| Caída del cubo | 2,3 % de los episodios | por debajo del 10 % |
| Cubo mantenido en la palma | 97,9 % del tiempo | no especificado |
| Velocidad de giro | 0,94 rad/s (1,47 vueltas en 10 s) | 1,0 rad/s (no alcanzado) |
| Recompensa de evaluación al final del entrenamiento | 27,65 (partiendo de −0,58) | no especificado |

Demostraciones cualitativas recogidas en la model card: girar durante 6 s desplaza el cubo 2,79 rad; mantener la acción cero durante 3 s lo desplaza 0,28 rad, sin caída. Con la instrucción en lenguaje natural "girar el cubo durante cinco segundos y luego mantenerlo quieto tres segundos", el cubo giró 1,32 rad y quedó dentro de un margen de 0,19 rad durante la fase de mantenimiento, sin caída.

No se han publicado comparaciones con otras políticas ni resultados en benchmarks estandarizados de robótica (por ejemplo, suites de manipulación con puntuaciones agregadas) en la información disponible.

## Requisitos de hardware

- Inferencia: un MLP de ~185 000 parámetros; los pesos ocupan menos de 1 MB en coma flotante de 32 bits, por lo que la VRAM necesaria es prácticamente nula.
- Cabe en cualquier CPU de consumo; no requiere GPU ni acelerador. El ejemplo de uso del repositorio solo necesita NumPy.
- Entrenamiento documentado: 100 millones de pasos con 8192 entornos paralelos en 4,3 horas sobre la CPU de un AMD Ryzen AI MAX+ 395, sin GPU.
- Opciones de despliegue: NumPy (inferencia directa desde `policy.npz`), MuJoCo Playground 0.2.0 y Brax/JAX para reproducir el entrenamiento o reentrenar.
- Latencia y throughput: no disponibles de forma agregada; el único dato temporal publicado es el periodo de control de 0,05 s (20 Hz) del entorno.
- Para un despliegue físico harían falta, además, el modelo de la mano LEAP, el middleware de control del robot y una validación previa en hardware, que el autor no aporta.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otras políticas para `LeapCubeRotateZAxis` ni comparaciones con controladores alternativos (planificación basada en modelos, control clásico o políticas entrenadas con otros algoritmos), por lo que no es posible establecer una comparación con cifras verificables.

## Limitaciones y advertencias

- Solo simulación: la política no ha sido validada en una mano LEAP física, y el propio autor lo indica de forma explícita. Cualquier uso en hardware requeriría una validación y un ajuste previos.
- Rendimiento por debajo del objetivo: la velocidad de giro alcanzada (0,94 rad/s) no llega al objetivo de 1,0 rad/s declarado en el entorno.
- Habilidad única: solo rota el cubo alrededor del eje vertical; no reorienta en otros ejes, no lo recoge ni lo coloca.
- Dependencia del simulador: los resultados provienen de MuJoCo Playground 0.2.0 con su aleatorizador de dominio; el comportamiento fuera de esa distribución dinámica no está caracterizado.
- Observación limitada y con ruido: el actor solo recibe 16 ángulos articulares y 16 acciones previas; la información sobre la pose y la velocidad del cubo estuvo disponible únicamente para el crítico durante el entrenamiento y no se exporta.
- Sensibilidad a la interfaz: es imprescindible respetar el orden de actuadores indicado en `actuator_names`, el factor de escala de acción de 0,6 y la normalización `obs_mean`/`obs_std`; cualquier desviación invalida la equivalencia con Brax.
- El planificador en lenguaje natural mencionado en la model card es externo y no se distribuye con este repositorio; el modelo no procesa lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero se ofrece sin garantías y sin soporte.
- No es un dispositivo médico, de cuidado ni certificado para aplicaciones de seguridad; el autor lo excluye expresamente.
- Sesgos conocidos: no disponibles. El modelo no se entrena con datos humanos, por lo que los sesgos aplicables serían los derivados de la distribución de aleatorización del simulador, que no se documenta en detalle.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto). El riesgo equivalente es el fallo físico en la tarea, cuantificado en un 2,3 % de episodios con caída del cubo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YauhenBichel/leap-hand-cube-spin-ppo
- Vídeo de demostración (giro, cámara lenta y mantenimiento): https://huggingface.co/YauhenBichel/leap-hand-cube-spin-ppo/resolve/main/videos/hand.mp4
- Vídeo de instrucción en lenguaje natural (girar y mantener): https://huggingface.co/YauhenBichel/leap-hand-cube-spin-ppo/resolve/main/videos/spin-then-hold-from-plain-language.mp4
- Dataset de experimentos asociado: https://huggingface.co/datasets/YauhenBichel/humanoid-lab-experiments
- MuJoCo Playground 0.2.0 y el modelo de la mano LEAP (Apache 2.0) se citan como créditos en la model card, pero no se incluyen URL en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a foros de soporte de Microsoft y no guardan relación con el contenido de esta ficha.
