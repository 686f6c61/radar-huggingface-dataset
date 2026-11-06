# SungyupKim/standai-getup

## Resumen

`standai-getup` es un conjunto de checkpoints de aprendizaje por refuerzo publicados por SungyupKim para el proyecto `standai`, un simulador 2D en MuJoCo en el que un bipedo tipo ragdoll debe levantarse desde el suelo y mantenerse en pie. El modelo principal, `getup_e2e_512.zip`, es una unica red PPO de 512x512 (70 observaciones, 13 acciones) que integra en una sola politica la decision de como levantarse, la transicion al equilibrio, el mantenimiento de la postura y la recuperacion tras una caida.

El interes tecnico esta en el pipeline de destilacion: cuatro politicas especializadas (suelo supino, suelo prono, hand-over y equilibrio) se combinan con un controlador basado en reglas y se destilan en una sola red mediante DAgger, que despues se afina de extremo a extremo con PPO durante 40 millones de pasos. El resultado supera al controlador profesor en las mismas semillas, lo que lo convierte en un caso de estudio util sobre destilacion de politicas y afinado end-to-end en tareas de locomocion.

Es importante subrayar que no se trata de un modelo de lenguaje ni de un modelo fundacional: es una politica de control para un cuerpo simulado concreto, sin capacidades de generacion de texto, vision, tool calling ni multilingues. Su relevancia es la de un artefacto de investigacion reproducible en robotica simulada, no la de un componente listo para produccion en aplicaciones de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal densa PPO (Stable-Baselines3), dos capas ocultas de 512 unidades |
| Parametros totales | 605k (modelo principal `getup_e2e_512.zip`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; episodios de 1000 pasos (20 s de simulacion) |
| Tipos de cuantizacion | no disponible (checkpoints `.zip` de Stable-Baselines3, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.zip` de Stable-Baselines3 (PPO con metadatos pickled) |

Especificaciones adicionales del entorno:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 70 |
| Dimension de accion | 13 |
| Entorno | MuJoCo 2D, cuerpo `fighter2d.xml` (torque de articulaciones x1.5) |
| Horizonte de episodio | 1000 pasos (20 s) |
| Criterio de "en pie" | torso >= 0.95 m y abs(pitch) < 30 grados en los ultimos 25 pasos |
| Variantes de tamano | 512x512, 256x256, 128x128, 64x64 |
| Checkpoints incluidos | 8 (modelo principal, 3 ablaciones, destilado pre-PPO y 4 componentes) |

## Arquitectura y entrenamiento

La politica es una red feedforward pequena (dos capas de 512 unidades, 605k parametros) entrenada con PPO sobre observaciones de 70 dimensiones y 13 acciones continuas. El entorno es un bipedo 2D en MuJoCo con el torque de las articulaciones multiplicado por 1.5, colocado inicialmente tumbado boca arriba (supino) o boca abajo (prono). El objetivo es levantarse y seguir en pie 20 segundos despues, con un criterio estricto de altura del torso y angulo de pitch.

El entrenamiento sigue tres fases. Primero se entrenan por separado cuatro politicas con recompensas y curriculos propios: suelo supino (256), suelo prono (64), hand-over para llegadas en prono (256) y equilibrio (256). Un controlador basado en reglas las orquesta y alcanza un 70,8% en la mezcla 50:50. Despues, todo el controlador, incluidas las reglas de conmutacion, se destila en una unica red de 512x512 mediante DAgger, obteniendo `getup_distilled_512_before_ppo.zip` (74,5% frente a 73,8% de las reglas en las mismas semillas). Finalmente, esa red se afina de extremo a extremo con PPO durante 40 millones de pasos con tasa de aprendizaje 3e-5, dando lugar a `getup_e2e_512.zip`.

El autor documenta explicitamente que este resultado no demuestra que una red grande pueda entrenarse desde cero en la tarea de levantarse: los intentos de entrenamiento from scratch fallaron repetidamente. Tambien advierte de que hay una sola ejecucion de entrenamiento por configuracion, un unico entorno y cuerpo, y que la generalizacion a otras poses iniciales o morfologias no se ha probado.

## Capacidades

- Control de locomocion 2D: levantarse desde posicion supina o prona y mantenerse en pie.
- Decision integrada del modo de levantarse (que lado y secuencia de movimientos) dentro de una sola politica.
- Transicion automatica al equilibrio tras completar la incorporacion.
- Recuperacion tras caidas: la politica vuelve a levantarse si se cae durante el episodio.
- Robustez frente a empujones laterales de 150 a 500 N durante 0,1 s sin perder la postura.
- Estabilidad en reposo: desviacion estandar de la altura del torso de 0,009 m.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: reproducir el pipeline completo (cuatro politicas, controlador de reglas, DAgger, PPO end-to-end) como referencia para estudiar destilacion de politicas y afinado fino en tareas de control.
- Estudio de recuperacion de caidas en robotica simulada: usar `getup_e2e_512.zip` como baseline de "get-up" frente a controladores basados en reglas, midiendo tasas de exito con `getup_strict_eval.py` y semillas pareadas.
- Ablacion de tamano de red: comparar las variantes 64, 128, 256 y 512 con el mismo presupuesto de 12M pasos para analizar el compromiso entre capacidad y tasa de exito (85,0% a 93,0% en la mezcla 50:50).
- Docencia en simulacion fisica: el entorno MuJoCo 2D y los checkpoints permiten montar practicas de RL con Stable-Baselines3 en CPU, sin necesidad de GPU.
- Pruebas de robustez de politicas: el modelo card documenta verificaciones frente a atajos (controles no fisicos, cuerpo oponente desplazado, empujones), utiles como plantilla de evaluacion critica de politicas de RL.
- Base para transferencia a otros cuerpos o tareas: aunque no esta validado, el checkpoint destilado pre-PPO (`getup_distilled_512_before_ppo.zip`) puede servir como inicializacion para experimentos de afinado en morfologias o poses iniciales distintas.
- Referencia para pipelines de destilacion DAgger: el par profesor-alumno (controlador de reglas frente a red destilada) es un ejemplo concreto y medido de como la destilacion puede igualar o superar al profesor antes del afinado con PPO.

## Benchmarks y rendimiento

Resultados publicados en la model card (politica determinista, semillas frescas 99100/99200/99300, 200 inicios por lado):

| Sistema | supino | prono | 50:50 | 50:50, 5 s sin interrupcion |
|---|---|---|---|---|
| `getup_e2e_512.zip` (modelo principal) | 97,7% | 90,7% | 94,2% | 93,5% |
| Controlador de reglas con cuatro politicas PPO | 63,0% | 78,7% | 70,8% | 63,7% |

Ablacion de tamano de red (12M pasos end-to-end, semillas 99500+, 200 por lado, una ejecucion por tamano):

| Red | 50:50 (ultimos 0,5 s) | 50:50 (5 s) |
|---|---|---|
| Controlador de reglas | 72,0% | 67,5% |
| 512x512 (checkpoint de 12M pasos) | 92,0% | 90,5% |
| 256x256 (`getup_e2e_256.zip`) | 93,0% | 91,0% |
| 128x128 (`getup_e2e_128.zip`) | 89,0% | 87,0% |
| 64x64 (`getup_e2e_64.zip`) | 85,0% | 80,0% |

Verificaciones frente a atajos documentadas por el autor: los controles no fisicos `root_x` y `root_ry` nunca se aplican (ctrl 0); desplazar 40 m el cuerpo oponente aparcado no altera el resultado; los empujones de 150 a 500 N (0,1 s) no derriban la postura; la altura del torso en reposo tiene desviacion estandar de 0,009 m. No se han publicado comparaciones con otros modelos de RL fuera del propio controlador de reglas.

## Requisitos de hardware

- Inferencia en CPU: la red de 605k parametros se ejecuta en CPU sin problemas; el ejemplo de la model card carga el modelo con `device="cpu"`.
- VRAM estimada: no disponible; no se requiere GPU para la inferencia de la politica.
- GPU recomendadas: no disponible; el cuello de botella es la simulacion MuJoCo, no la red.
- Cabe en GPU consumer: si, aunque no es necesario; cualquier equipo capaz de ejecutar MuJoCo y Stable-Baselines3 sirve.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`) con el entorno `GetUpEnv` del repositorio de GitHub; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del paso de simulacion MuJoCo y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `standai-getup` (`getup_e2e_512.zip`) | Politica PPO destilada, MuJoCo 2D | 605k | 1000 pasos (20 s) | 94,2% en pie (50:50) | MIT | Hugging Face + GitHub |
| Controlador de reglas de `standai` (componentes) | Cuatro politicas PPO + reglas | no disponible (cuatro redes de 64-256) | 1000 pasos | 70,8% en pie (50:50) | MIT | Incluido en el mismo repo |
| Otros modelos de get-up en MuJoCo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones publicadas con otras politicas de get-up de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Simulacion exclusivamente 2D: no hay validacion en 3D ni en robotica real.
- Un unico cuerpo y entorno (`fighter2d.xml`); la generalizacion a otras morfologias o poses iniciales no se ha probado.
- Una sola ejecucion de entrenamiento por configuracion, lo que limita la significancia estadistica de las ablaciones.
- Los inicios provienen del generador de poses tumbadas del propio entorno; no se evaluan distribuciones de inicio externas.
- El autor advierte que el exito no demuestra que una red grande pueda entrenarse desde cero en esta tarea: los intentos from scratch fallaron.
- Los checkpoints son `.zip` de Stable-Baselines3 con metadatos pickled en Python; cargar solo ficheros de fuentes de confianza y verificar `SHA256SUMS`.
- No exportar variables `STANDAI_*` en el shell de evaluacion: alteran la distribucion de inicios y sesgan las metricas.
- No es un modelo de lenguaje: no tiene sesgos linguisticos, alucinaciones ni capacidades multilingues en el sentido habitual, pero tampoco sirve para tareas de texto, codigo o vision.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia sobre el rendimiento fuera del entorno simulado descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SungyupKim/standai-getup
- Repositorio de codigo, entorno y documentacion: https://github.com/SungyupKim/standai (commit `d719843`)
- Script de evaluacion estricta: `scripts/analysis/getup_strict_eval.py` dentro del repositorio
- Script del controlador de reglas: `scripts/controller.py` dentro del repositorio
- Entorno de simulacion: `getup_env.py` y `models/fighter2d.xml` dentro del repositorio
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
