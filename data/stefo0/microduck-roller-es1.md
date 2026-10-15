# stefo0/microduck-roller-es1

## Resumen

roller-es1 es una política de control (policy) de aprendizaje por refuerzo para el robot bípedo Microduck de Pollen Robotics, desarrollada por el usuario stefo0 y publicada en Hugging Face. No es un modelo de lenguaje: es una red neuronal que produce acciones motoras continuas a partir de observaciones propioceptivas. Concretamente, se trata de una marcha (gait) «perpetua» para la configuración del robot equipada con ruedas (rollers), entrenada específicamente para una prueba de sprint en la Arena de simulación.

El modelo parte de una política previa entrenada con PPO, stefo0/microduck-roller-warm1 (a su vez derivada de una referencia de Pollen Robotics con una recompensa de «skate-push»), y se afina mediante estrategias evolutivas (OpenAI-ES con pares antitéticos, rank shaping y Adam). La observación es de 61 dimensiones, la acción de 14 dimensiones y el bucle de control funciona a 50 Hz. El repositorio incluye un `policy.onnx` con el normalizador de observaciones integrado y un `manifest.json` conforme al esquema 2 del manifiesto de políticas de Microduck.

Su relevancia es acotada pero clara para la comunidad de robótica open source: es un ejemplo reproducible de cómo convertir una política PPO en un gait listo para cargar en un robot real mediante un único comando (`robotctl policy load`), y sirve como material de partida para experimentos de sim-to-real y de comparación entre PPO y ES sobre el mismo simulador. El repositorio no tiene descargas ni «likes» en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor) afinada con estrategias evolutivas sobre una base PPO; numero de capas y tipo de capa no disponibles |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (politica reactiva; vector de observacion de 61 dimensiones, sin contexto de secuencia declarado) |
| Tipos de cuantizacion | No disponible; el artefacto publicado es ONNX (presumiblemente FP32) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) con normalizador integrado, mas `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria de carga | `microduck` |
| Tipo de politica | Perpetua (se ejecuta hasta que se le indique lo contrario) |
| Tamano del repo | 0.0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-15 |

## Arquitectura y entrenamiento

La política es un actor que mapea un vector de observación de 61 dimensiones a 14 acciones continuas a 50 Hz. No se especifica en la información disponible la topología exacta de la red (número de capas, anchuras, funciones de activación), solo que se exporta a ONNX con el normalizador de observaciones «cocinado» dentro del propio grafo, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento tiene dos fases documentadas. La primera es una política PPO base, `stefo0/microduck-roller-warm1`, descrita como una referencia de Pollen Robotics reanudada con una recompensa de «skate-push». La segunda es un afinado mediante estrategias evolutivas con OpenAI-ES: pares antitéticos, rank shaping y optimizador Adam, actualizando todos los pesos del actor con el normalizador congelado, durante 300 generaciones de 64 candidatos cada una. El entorno de evaluación es el simulador Arena, en la prueba de roller-sprint; la búsqueda se realizó sobre las semillas de inicio 101-400 y la validación sobre las semillas retenidas 1001-1030, con un resultado declarado de 2,00 s. Las semillas de tablero 1-5 nunca se usaron en la búsqueda. El código de entrenamiento referenciado es `pollen-robotics/microduck_rl`, rama `main`, commit `423289dc8`.

La innovación metodológica destacable no está en la arquitectura sino en el procedimiento: usar ES sobre una política PPO ya funcional, con validación estricta en semillas held-out y con el normalizador congelado para evitar que el afinado rompa la calibración de las observaciones.

## Capacidades

- Generacion de acciones motoras continuas: 14 grados de libertad de control a 50 Hz.
- Locomocion perpetua sobre ruedas: el gait se ejecuta indefinidamente sin condicion de parada.
- Control reactivo basado en un vector propioceptivo de 61 dimensiones.
- Sprint en la prueba roller-sprint del simulador Arena (comportamiento para el que fue especificamente afinado).
- Validacion declarada en semillas no vistas durante la busqueda (1001-1030).
- Carga directa en robot mediante `robotctl policy load <slot> stefo0/microduck-roller-es1`.
- No soporta tool calling, function calling ni agentes multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues, de vision, de audio ni modo «thinking».
- No se documenta capacidad de generalizacion a otras tareas, terrenos o morfologias distintas de rollers.

## Casos de uso

- Control de locomocion en el Microduck real con rollers: la politica se carga en una ranura de politica del robot y se ejecuta a 50 Hz, sustituyendo al gait por defecto cuando se quiere una marcha continua sobre ruedas.
- Participacion en la prueba roller-sprint de la Arena: es el escenario exacto para el que se optimizo, con semillas de validacion declaradas (1001-1030) y un tiempo de referencia de 2,00 s.
- Punto de partida para nuevo afinado (warm start): al ser una politica ya convergida, sirve como inicializacion para experimentos posteriores con otras recompensas o morfologias, reduciendo el coste de entrenamiento.
- Comparativa PPO frente a ES en un mismo simulador: el repositorio documenta la cadena PPO (warm1) y el afinado ES, lo que permite medir la aportacion marginal de las estrategias evolutivas sobre la misma base.
- Benchmark reproducible con semillas fijas: el uso de semillas de busqueda 101-400 y de validacion 1001-1030, con tablero 1-5 nunca visto, permite replicar experimentos sin fuga de informacion.
- Docencia y divulgacion en robotica open source: ilustra el ciclo completo simulacion-entrenamiento-exportacion ONNX-despliegue en un robot de 25 cm y bajo coste.
- Integracion en flujos de agentes via MicroduckHub: el ecosistema dispone de un servidor MCP que permite a un agente de IA invocar politicas del robot, de modo que esta politica puede actuar como habilidad de bajo nivel dentro de una tarea mayor.
- Pruebas de sim-to-real: comparar el comportamiento del gait en el simulador Arena frente al robot fisico para caracterizar la brecha de realidad en una politica afinada sobre fisica nominal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es el tiempo de validacion de 2,00 s en las semillas retenidas 1001-1030 durante la prueba roller-sprint, sin comparacion publicada contra otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- El modelo corre en el robot Microduck, un bípedo de 25 cm con 15 motores, cámara, LiDAR y pico prensil; la inferencia se realiza en la computadora de a bordo del robot.
- VRAM dedicada: no aplica. Es una política exportada a ONNX de un actor pequeño (el repositorio ocupa 0,0 GB según Hugging Face), pensada para ejecucion en CPU sobre el controlador del robot.
- GPU recomendadas: no aplica para el despliegue en robot. Para reentrenar con ES y simular el entorno de Arena se necesita el hardware del repositorio `pollen-robotics/microduck_rl`, cuyo requisito no se detalla en la informacion disponible.
- Compatibilidad con GPU de consumo: no aplica al despliegue; la politica es lo bastante pequena para ejecutarse en el procesador del robot dentro del presupuesto de 20 ms por ciclo que impone el bucle de 50 Hz.
- Opciones de despliegue: `robotctl policy load <slot> stefo0/microduck-roller-es1` en el demonio de Microduck; el artefacto `policy.onnx` puede cargarse con cualquier runtime ONNX compatible.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el resultado de validacion de 2,00 s en la prueba roller-sprint, que no debe interpretarse como latencia de inferencia.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Se listan las alternativas conocidas con los campos disponibles.

| Modelo | Tipo | Base de entrenamiento | Semillas de validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stefo0/microduck-roller-es1 | Politica RL para Microduck con rollers (sprint) | PPO warm1 + afinado OpenAI-ES (300 gen x 64 candidatos) | 1001-1030, 2,00 s declarados | No disponible | Hugging Face, 0 descargas |
| stefo0/microduck-roller-warm1 | Politica PPO base para rollers | Referencia de Pollen + recompensa skate-push | No disponible | No disponible | Hugging Face (referenciada como base) |
| Politicas de fabrica de Microduck (walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade) | Gaits y habilidades de fabrica | No disponible | No aplica | No disponible | Incluidas con el robot |
| Otras politicas de la comunidad en MicroduckHub | Politicas RL diversas | No disponible | No disponible | No disponible | MicroduckHub / Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling y no tiene capacidades multilingues. Cualquier expectativa en ese sentido es incorrecta.
- Entrenado exclusivamente en simulacion y ajustado a la fisica nominal de Arena; el propio autor advierte de que no esta pensado para un robot real. Existe riesgo de brecha sim-to-real.
- Especifico de la configuracion con rollers y de la tarea de sprint; no hay evidencia de transferencia a otras tareas, morfologias o terrenos.
- Politica perpetua: una vez cargada, se ejecuta hasta que se le indique lo contrario. No define condicion de parada propia, lo que exige gestion externa del ciclo de vida en produccion.
- Riesgo de sobreajuste a las condiciones de busqueda: la optimizacion se realizo sobre las semillas de inicio 101-400, aunque la validacion en 1001-1030 mitiga parcialmente este punto. No se publican metricas de dispersion ni de robustez.
- Sesgos conocidos: no disponibles. No hay analisis de sesgo ni de comportamiento fuera de distribucion.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Conviene contactar con el autor antes de cualquier uso en producto.
- Validacion externa nula: 0 descargas y 0 likes, sin resultados de terceros que confirmen el comportamiento declarado.
- El repositorio figura con un tamano de 0,0 GB, lo que puede indicar un problema de subida de artefactos; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.
- El normalizador esta congelado y embebido en el grafo ONNX: alimentar el modelo con observaciones ya normalizadas por error produciria acciones incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefo0/microduck-roller-es1
- Politica base PPO: https://huggingface.co/stefo0/microduck-roller-warm1
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Pagina oficial de Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- MicroduckHub, intercambio de politicas y servidor MCP: https://microduckhub.com/
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `main`, commit `423289dc8` (no se proporciona URL directa en la informacion disponible)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa en la informacion disponible)
- Modelos 3D del robot: https://github.com/boris721/microduck-3d
