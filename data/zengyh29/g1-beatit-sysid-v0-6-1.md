# zengyh29/g1-beatit-sysid-v0.6.1

## Resumen

Beat-It (thermal, hybrid world model) para el Unitree G1 sobre SysID v0.6.1 es un artefacto de robótica compuesto por una política de recuperación de respaldo (fallback) y el modelo de mundo híbrido con el que fue entrenada. Lo publica el usuario zengyh29 en Hugging Face y forma parte del filtro de seguridad Beat-It, un mecanismo de safe reinforcement learning que intercepta las acciones propuestas por una política de tarea y las sustituye por una acción de recuperación cuando se prevé riesgo de caída o de sobrecalentamiento de los motores.

El modelo está entrenado específicamente para las tareas CoolMimic SAILR con límite térmico de 70 C (`*-m70`), sobre el modelo de robot identificado *G1-robot-model-with-SysID* v0.6.1. La versión 0.6.1 solo cambia el signo del enlace de cintura respecto a v0.6.0; el modelo del cuerpo es idéntico. Se recomienda un umbral de decisión de 0,665, calibrado con el método de Wang et al. a epsilon = 1 % y beta = 1e-10.

La relevancia es acotada pero específica: no es un modelo de lenguaje ni un modelo generativo de propósito general, sino un componente de control para simulación de robótica con MuJoCo y mjlab, orientado a investigación en seguridad de políticas de locomoción y manipulación bajo restricciones térmicas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo híbrido: red neuronal para el estado del cuerpo + modelo analítico de calor SysID (devanado, carcasa y estructura por motor); política SHAC (safety_sb3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (rollout de mundo de 1 s = 50 pasos a 50 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | checkpoint `final_model.zip` (safety_sb3 SHAC), `tensornormalize.pt`, `config.yaml`, `g1_sysid.json`, `min_tube.json` |
| Frecuencia de control | 50 Hz (dt 0,02 s) |
| Dimension de entrada (actor fallback) | 127 dims, incluye 29 temperaturas de devanado |
| Dimension de estado (modelo de mundo) | 200 dims + contexto de simulación de 33 dims |
| Dimension de salida (accion) | 29 objetivos de posición articular (escala de acción mjlab G1) |
| Pasos de entrenamiento | 1.500 millones de pasos de entorno, semilla 0 |

## Arquitectura y entrenamiento

El sistema combina dos componentes. Por un lado, una red neuronal que predice el estado del cuerpo del robot (propriocepción más términos privilegiados: velocidad lineal de la base, alturas de pies, contactos y fuerzas, y temperaturas de devanado, carcasa y estructura). Por otro, el modelo analítico de calor SysID, que predice las temperaturas por motor. El margen de seguridad resultante es el mínimo entre el margen de caída y (70 − devanado más caliente) / 10.

La política de respaldo se entrena con safety SHAC durante 1.500 millones de pasos de entorno con semilla 0. La tarea (`g1_recover_thermal70_v61`) consiste en recuperar el robot en 3 segundos desde estados en los que un tracker SONIC ha sido empujado (clips de entrenamiento LAFAN, patadas horizontales con |Δv| de hasta 5 m/s). Un episodio falla si hay caída (inclinación o contacto no podal) o si cualquier devanado de motor alcanza 70 C. Las temperaturas iniciales se sortean por robot: un nivel ~ U(30, 70) C, cada devanado ~ U(30, nivel), y la carcasa 0–20 C por debajo del devanado.

La innovación técnica principal es el filtro de seguridad: en cada paso de control, el modelo de mundo imagina 1 segundo (50 pasos) aplicando primero la acción propuesta por la política de tarea y después la acción de respaldo. Si el margen mínimo predicho en ese rollout cae por debajo del umbral, el filtro rechaza la propuesta y entra el fallback. En entrenamiento SAILR, un rechazo termina el episodio del aprendiz. El umbral de 0,665 se calibra con el método de Wang et al. (Prop. 1) sobre 31.780 estados de entrega SONIC retenidos, con un rollout de 3 s del fallback por estado y fracaso definido como caída o devanado a 70 C.

## Capacidades

- Recuperación de la locomoción del Unitree G1 en 3 segundos tras perturbaciones (patadas horizontales con |Δv| de hasta 5 m/s).
- Razonamiento térmico: incorpora 29 temperaturas de devanado en la observación y penaliza alcanzar 70 C.
- Filtrado de seguridad en línea: evalúa acciones propuestas por otra política y las sustituye cuando el margen predicho es insuficiente.
- Modelo de mundo híbrido: predicción neuronal del estado del cuerpo combinada con modelo analítico de calor por motor.
- Calibración conforme del límite del modelo de mundo a 1 s (`min_tube.json`, epsilon conformal 0,808 al 95 %, 50 pasos).
- Control a 50 Hz con acciones de 29 objetivos de posición articular.
- No soporta tool calling, function calling, agentes de múltiples pasos, capacidades multilingües ni visión o audio.

## Casos de uso

- Investigación en safe reinforcement learning: el checkpoint sirve como fallback de referencia para estudiar filtros de seguridad con restricciones térmicas en entrenamientos SAILR, usando las tareas `*-m70` de CoolMimic.
- Entrenamiento CoolMimic SAILR: se integra mediante las variables de entorno `BEATIT_POLICY`, `BEATIT_TUBE` y `BEATIT_THRESHOLD` para que el aprendiz reciba rechazos cuando el rollout imaginado predice riesgo.
- Validación de políticas de locomoción del G1: permite medir cuántos estados de entrega SONIC son recuperables bajo distintos umbrales (epsilon 5 % y epsilon 1 %) y temperaturas iniciales.
- Estudio de calibración conforme: el archivo `min_tube.json` y el procedimiento de Wang et al. permiten reproducir el análisis de cobertura y solidez del conjunto certificado.
- Análisis de sensibilidad térmica: la tabla de tamaños de conjunto por temperatura inicial (79–85 % a 30–60 C, 48 % a 65 C, 0 % a 66+ C) sirve para estudiar el límite operativo del robot.
- Comparación de variantes de filtro: el contraste con el filtro entrenado sin entradas de temperatura ni término de 70 C (que certifica 0 % a epsilon 1 % para inicios de 60–65 C) permite evaluar la contribución de la información térmica.
- Reproducción de experimentos en simulación MuJoCo/mjlab: el paquete incluye configuración, normalizador y registro del robot con hashes para verificar la procedencia.

## Benchmarks y rendimiento

Evaluación sobre el mismo banco, 4 rollouts por estado, todos los motores a temperatura inicial T0. Fracaso = caída o devanado a 70 C en 3 s.

| Temperatura inicial | Fallback rescata | Wang epsilon 5 %: conjunto / solidez | Wang epsilon 1 %: conjunto / solidez |
|---|---|---|---|
| T0 ~ U(30, 60) C | 91,0 % | 95,0 % / 95,8 % | 83,0 % / 99,4 % |
| T0 ~ U(60, 65) C | 89,7 % | 93,4 % / 95,8 % | 63,5 % / 99,4 % |

Tamano del conjunto certificado a epsilon 1 % segun temperatura inicial:

| T0 (C) | 30–60 | 62 | 63 | 64 | 65 | 66+ |
|---|---|---|---|---|---|---|
| Tamano del conjunto | 79–85 % | 79 % | 78 % | 67 % | 48 % | 0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del checkpoint no se detalla; el repositorio ocupa 0,0 GB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible; el modelo se ejecuta en el ecosistema de simulacion MuJoCo/mjlab, no como servicio de inferencia de texto.
- Opciones de despliegue: carga mediante safety_sb3 (checkpoint SHAC) y mjlab; requiere el checkout de safety-stable-baselines en la rama `feat/shac-hybrid-thermal` y el repositorio CoolMimic en la rama `sailr-beatit`.
- Latencia y throughput: control a 50 Hz (dt 0,02 s); no se publican cifras de latencia por paso ni de throughput.
- Nota de carga: el loader intenta primero una comprobacion estricta de procedencia contra el run de calibracion, que solo existe en el cluster del autor; fuera de el falla con `lenient (FileNotFoundError: ... push.json is missing)` y carga los mismos pesos directamente (`nn world model (natively hybrid: analytic heat block), H 50 steps`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zengyh29/g1-beatit-sysid-v0.6.1 | no disponible | rollout de 1 s (50 pasos) | fallback rescata 91,0 % (30–60 C) y 89,7 % (60–65 C); conjunto epsilon 1 % de 83,0 % con solidez 99,4 % | other | Hugging Face, 0 descargas |
| zengyh29/g1-beatit-sysid-v0.6 | no disponible | rollout de 1 s (50 pasos) | umbral 0,488; semilla 1 | other | Hugging Face |
| Filtro sin entradas de temperatura ni termino de 70 C (referencia del autor) | no disponible | rollout de 1 s (50 pasos) | certifica 0 % a epsilon 1 % para inicios de 60–65 C | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de generación de código, y su uso esta restringido a simulacion robotica.
- El entrenamiento se realizo en simulacion (MuJoCo/mjlab); no se documenta validacion en el robot fisico Unitree G1.
- El conjunto certificado a epsilon 1 % se reduce a 0 % para temperaturas iniciales de 66 C o superiores, lo que limita su aplicabilidad en ese rango.
- Para inicios de 60–65 C, el conjunto certificado a epsilon 1 % baja al 63,5 %, con solidez del 99,4 %.
- La carga estricta de procedencia falla fuera del cluster del autor; es necesario aceptar la carga "lenient" y verificar manualmente los hashes SHA-256 incluidos.
- El aviso del entorno sobre la diferencia entre las temperaturas iniciales del entorno (30–60 C) y el sorteo de entrenamiento del checkpoint (30–70 C) es esperado, pero conviene tenerlo en cuenta al interpretar resultados.
- La licencia es "other": no se especifican terminos de uso comercial; debe consultarse la licencia del repositorio antes de cualquier despliegue productivo.
- El modelo depende de versiones concretas de codigo (rama `feat/shac-hybrid-thermal` de safety-stable-baselines y rama `sailr-beatit` de CoolMimic); cambios de version pueden romper la carga.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero el modelo de mundo puede producir predicciones inexactas fuera de la distribucion de estados de entrenamiento (perturbaciones con |Δv| superiores a 5 m/s no estan cubiertas).

## Enlaces

- Hugging Face: https://huggingface.co/zengyh29/g1-beatit-sysid-v0.6.1
- Repositorio CoolMimic (rama `sailr-beatit`, archivo `AGENT.md`): no disponible como URL en la informacion proporcionada
- safety-stable-baselines (rama `feat/shac-hybrid-thermal`): no disponible como URL en la informacion proporcionada
- Referencia metodologica: Wang et al. (Prop. 1), citada en la model card sin enlace directo
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada
