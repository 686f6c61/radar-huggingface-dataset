# xzz789/smolvla-piperx-adamw-298139

## Resumen

SmolVLA on PiperX · AdamW reference es un checkpoint de ajuste fino del modelo de vision-lenguaje-accion SmolVLA, orientado a control robotico de un brazo PiperX. Lo publica el usuario xzz789 en Hugging Face como parte de un job de HKU (identificador 298139) y se distribuye en formato LeRobot, la libreria de referencia para politicas roboticas del ecosistema Hugging Face. El modelo parte de la arquitectura SmolVLA y especializa su "action expert" sobre 99 demostraciones teleoperadas del robot PiperX durante 24.000 pasos de entrenamiento con AdamW, batch global de 256 y semilla 42.

El interes de esta publicacion no esta en el modelo base, sino en el paquete de trazabilidad que la acompana: se distribuyen los 25 checkpoints intermedios (de 0 a 24.000, cada 1.000 pasos) junto con pesos, ficheros de procesador, estado del optimizador y resumenes de evaluacion por checkpoint en `piperx_eval.json`. Esa granularidad es poco habitual en modelos roboticos y permite analizar la curva de convergencia y elegir un punto de operacion intermedio segun el compromiso entre latencia, coste de inferencia y error de accion.

El autor documenta una evaluacion open-loop sobre 2.048 frames de entrenamiento muestreados (semilla 10.000). El error absoluto medio (MAE) de accion completo baja de 18,239° en el paso 0 a 0,243° en el paso 24.000, y se establece un umbral operativo: el primer checkpoint que se mantiene dentro del 5% del MAE final es el de 22.000 pasos, con 0,254°. El repo ocupa 64,2 GB, lo que refleja que contiene los 25 checkpoints completos y no solo el final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion) con action expert ajustado; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robotico, no conversacional) |
| Licencia | no disponible |
| Formato de pesos | safetensors (via LeRobot), con ficheros de procesador y estado de optimizador |
| Libreria / pipeline | lerobot / robotics |
| Entrenamiento | 99 demostraciones PiperX, 24.000 pasos, batch global 256, AdamW, semilla 42 |
| Checkpoints incluidos | 25 (paso 0 a 24.000, cada 1.000) |
| Tamano del repo | 64,2 GB |
| Evaluacion | open-loop sobre 2.048 frames (semilla 10.000) |

## Arquitectura y entrenamiento

La familia SmolVLA es una politica de vision-lenguaje-accion (VLA) que combina un codificador visual y de lenguaje con un "action expert" que genera chunks de acciones. En este caso, el autor declara explicitamente que el ajuste fino se aplica sobre el action expert, no sobre el conjunto del modelo; es decir, el backbone de percepcion y el modulo de lenguaje se mantienen y solo se especializa la cabeza que produce las acciones. No se detalla en la informacion disponible el numero de parametros, la composicion exacta del backbone ni la longitud de contexto visual/lenguaje.

Los datos de entrenamiento son 99 demostraciones teleoperadas del brazo PiperX, un conjunto pequeno y especifico de dominio que justifica el ajuste fino. El entrenamiento usa AdamW, batch global de 256 durante 24.000 pasos y semilla 42, y se guardan checkpoints cada 1.000 pasos con su estado de optimizador, lo que permite reanudar o investigar la dinamica del entrenamiento. La evaluacion es open-loop: se comparan las acciones predichas con las registradas en 2.048 frames del propio entrenamiento, con MAE calculado sobre el chunk completo y excluyendo acciones con padding. Es, por tanto, una medida de ajuste por imitacion, no de exito en tarea cerrada.

## Capacidades

- Generacion de chunks de acciones de control para el brazo PiperX a partir de observaciones visuales (politica VLA).
- Imitacion de politicas teleoperadas: reproduce trayectorias aprendidas de las 99 demostraciones.
- Estimacion de accion con evaluacion open-loop documentada por checkpoint (MAE en grados).
- Distribucion de 25 checkpoints con estado de optimizador, util para reanudar entrenamiento o analizar convergencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni dialogo multilingue: es un modelo robotico, no un LLM conversacional.
- No se documentan modos especiales (thinking, vision general, audio) mas alla de la percepcion visual necesaria para la politica.

## Casos de uso

- Control de un brazo PiperX en laboratorio: cargar el checkpoint de 22.000 o 24.000 pasos en LeRobot y ejecutar la politica sobre observaciones de camara para reproducir tareas teleoperadas.
- Investigacion en aprendizaje por imitacion: comparar la curva de 25 checkpoints (MAE de 18,239° a 0,243°) para estudiar la velocidad de convergencia y el punto de rendimiento decreciente.
- Seleccion de checkpoint para despliegue con restricciones: usar el criterio del 5% (22.000 pasos, MAE 0,254°) cuando se prioriza un modelo algo mas ligero que el final pero con error casi identico.
- Reanudacion de entrenamiento: el estado del optimizador incluido permite continuar el ajuste desde cualquier checkpoint con AdamW y la misma semilla.
- Reproducibilidad de experimentos: la semilla de entrenamiento (42) y de evaluacion (10.000) documentadas permiten replicar la evaluacion open-loop sobre los mismos 2.048 frames.
- Base para transferencia a otro robot de caracteristicas similares: partir de un action expert ya especializado en PiperX y reajustar con nuevas demostraciones.
- Analisis de robustez: evaluar la sensibilidad del modelo a variaciones de percepcion comparando checkpoints tempranos (mayor MAE) con tardios (menor MAE).

## Benchmarks y rendimiento

Evaluacion open-loop sobre 2.048 frames de entrenamiento (semilla 10.000). MAE en grados sobre el chunk completo de acciones, excluyendo padding.

| Paso | Eval loss | Action MAE (°) | MAE primeros 10 acciones (°) | MAE (std del dataset) |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 3,40237 | 18,239 | 15,392 | 0,79651 |
| 5.000 | 0,02921 | 1,056 | 0,879 | 0,05603 |
| 10.000 | 0,01738 | 0,677 | 0,561 | 0,03589 |
| 15.000 | 0,00994 | 0,424 | 0,369 | 0,02337 |
| 20.000 | 0,00633 | 0,281 | 0,261 | 0,01549 |
| 22.000 | 0,00575 | 0,254 | 0,239 | 0,01420 |
| 24.000 | 0,00548 | 0,243 | 0,230 | 0,01363 |

Puntos clave: el mayor descenso ocurre en los primeros 1.000 pasos (de 18,239° a 2,691°). Entre 20.000 y 24.000 el MAE baja solo 0,038°, y los ultimos 2.000 pasos aportan 0,011°. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un modelo de control robotico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros ni configuracion de precision).
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible; el tamano del repo (64,2 GB) corresponde al conjunto de 25 checkpoints con estado de optimizador, no al peso de un unico checkpoint en inferencia.
- Opciones de despliegue: LeRobot (libreria declarada), con pesos en safetensors; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA on PiperX (este) | no disponible | no disponible | MAE 0,243° en 2.048 frames (open-loop) | no disponible | Hugging Face, 0 descargas |
| SmolVLA base | no disponible | no disponible | no disponible | no disponible | Hugging Face (ecosistema LeRobot) |
| Otras politicas VLA (p. ej. RT-2, OpenVLA) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos homogeneos (mismo robot, mismas demostraciones, misma metrica) en la informacion proporcionada; la comparacion cuantitativa con alternativas queda como "no disponible".

## Limitaciones y advertencias

- Evaluacion exclusivamente open-loop sobre frames de entrenamiento: mide ajuste por imitacion, no exito en tarea fisica ni generalizacion a estados no vistos. El MAE bajo no garantiza buen comportamiento en el robot real.
- Conjunto de datos muy pequeno (99 demostraciones) y un unico robot (PiperX): riesgo alto de sobreajuste y de falta de transferencia a otras morfologias.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; verificar antes de cualquier despliegue productivo.
- Sin idiomas ni contexto documentados: no es un modelo de lenguaje general y no debe usarse como tal.
- Repo de 64,2 GB por incluir 25 checkpoints y estado de optimizador: conviene descargar solo el checkpoint seleccionado para evitar coste de almacenamiento innecesario.
- 0 descargas y 0 likes: modelo practicamente sin validacion externa; tratar los resultados como preliminares.
- No se documentan sesgos, comportamientos de alucinacion ni limites de contexto; en un modelo de control esto se traduce en ausencia de analisis de robustez publicado.
- Las fechas de creacion y actualizacion (2026) deben contrastarse con el estado real del repositorio antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xzz789/smolvla-piperx-adamw-298139
- Registro de evaluacion por checkpoint: https://huggingface.co/xzz789/smolvla-piperx-adamw-298139/blob/main/piperx_eval.json
- Libreria LeRobot: https://github.com/huggingface/lerobot
- SmolVLA (familia de modelos): no disponible en la informacion proporcionada
- Paper asociado: no disponible
- Demo o blog: no disponible
