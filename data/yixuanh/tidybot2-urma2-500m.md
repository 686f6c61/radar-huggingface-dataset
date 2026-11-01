# yixuanh/tidybot2-urma2-500M

## Resumen

tidybot2-urma2-500M es una política de aprendizaje por refuerzo entrenada en simulación para el robot móvil-manipulador TidyBot++, tal como se modela en KinDER sobre la base con ruedas `stanford_tidybot`. La desarrolla el usuario de HuggingFace `yixuanh` y se genera con el código `loco_mjx` (variante `urma2.mjx_split`, entorno `locomotion.urma2.mjx`). No es un modelo de lenguaje: es un controlador neuronal que traduce comandos de velocidad de la base (x, y, yaw) en consignas de actuación sobre los 23 actuadores del robot.

El interés de la ficha es acotado y muy específico: se trata de un artefacto de investigación en robótica con refuerzo, no de un modelo de propósito general. El autor declara explícitamente que solo se ha validado en simulación, que no se ha ejecutado en un robot real y que no está autorizado para hardware. Su relevancia radica en servir como referencia reproducible de entrenamiento masivo en MJX/MuJoCo (más de 500 millones de pasos en poco más de cuatro horas en una sola GPU) y como punto de partida para quien trabaje con la pila `loco_mjx`.

El nombre incluye "500M", pero ese número corresponde a los pasos de entrenamiento (500.170.752), no al número de parámetros. El tamaño del repositorio es de 0,0 GB, de modo que el checkpoint es ligero y el dato de parámetros del actor no está publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (actor entrenado con URMA2 en el código `loco_mjx`); topología exacta no disponible |
| Parametros totales | no disponible (el "500M" del nombre se refiere a pasos de entrenamiento, no a parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint en formato `.model`, archivo zip con parámetros del actor y configuración) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT, con avisos de KinDER (Tom Silver) y MuJoCo Menagerie (Stanford) |
| Formato de pesos | `latest.model` (archivo zip con parámetros del actor y configuración, sin estado del optimizador) |

## Arquitectura y entrenamiento

La política se entrena con el código `loco_mjx` bajo la variante `urma2.mjx_split` y el entorno `locomotion.urma2.mjx`. El actor es ciego: no recibe exterocepción, solo información propioceptiva y el comando de velocidad. Controla los 23 actuadores del TidyBot++: 7 articulaciones del brazo, 2 drivers del gripper y 6 articulaciones pasivas del mecanismo de pinza (objetivos de posición escalados por 0,5 rad), 4 velocidades de rueda (escala 35 rad/s) y 4 velocidades de dirección (escala 10 rad/s). La topología concreta de la red (capas, unidades, función de activación) no está publicada en la información disponible.

El entrenamiento se realizó en simulación con un único robot (`tidybot2`), semilla 0, una sola RTX 5090, 2048 entornos en paralelo, minibatch de 16384 y terreno de tipo hfield con el currículo por defecto; el mezclado de cuerpos (body mixing) está desactivado. Se completaron 500.170.752 pasos en 4 horas y 25 minutos. Las métricas finales de entrenamiento son: longitud de episodio de 990,7 pasos, retorno de episodio de 59,8 y `velocity_diff_abs` de 0,126. No se documentan fases de RLHF ni DPO, ni innovaciones como decodificación especulativa, al no tratarse de un modelo generativo de texto.

## Capacidades

- Seguimiento de comandos de velocidad de la base (x, y, yaw) mediante consignas sobre ruedas y direcciones.
- Control coordinado de 23 actuadores, incluidos brazos, gripper y mecanismos pasivos de la pinza.
- Mantenimiento de la pose nominal del brazo y del gripper: no se premia la manipulación, solo la proximidad a la pose de reposo.
- Locomoción sobre suelo plano en simulación con seguimiento razonable de comandos de hasta 1,0 m/s y 1,0 rad/s.
- No dispone de percepción exteroceptiva: el actor es ciego y no procesa visión, LiDAR ni mapas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni procesamiento de texto.

## Casos de uso

- Investigación en locomoción con refuerzo: sirve como política de referencia reproducible para comparar algoritmos URMA2 sobre la misma base `stanford_tidybot` y el mismo entorno `locomotion.urma2.mjx`.
- Validación de pipelines MJX/MuJoCo: permite comprobar la integración del código `loco_mjx` (rama `add-tidybot2`, PR #17) y el diseño de observaciones antes de escalar a otros robots.
- Pruebas de seguimiento de velocidad en banco de simulación: útil para medir deriva lateral, tiempos de respuesta y estabilidad del tronco con comandos fijos, como hace el propio autor con 14 comandos.
- Generación de datos sintéticos de trayectorias: la política puede producir rollouts etiquetados (comando, estado, acción) para entrenar otros controladores o modelos de dinámica.
- Estudio de currículos de terreno: al haberse entrenado con hfield y currículo por defecto, sirve de base para experimentos de robustez frente a terreno irregular, perturbaciones y otras semillas.
- Docencia y divulgación en robótica: el vídeo `tidybot2_rollout.mp4` y el checkpoint permiten ilustrar el entrenamiento masivo en paralelo (2048 entornos) en una sola GPU de consumo.
- Punto de partida para experimentos de manipulación: aunque el brazo solo se premia por mantener la pose, la política puede servir de inicialización para entrenamientos posteriores que añadan recompensas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser un modelo de lenguaje. El autor sí reporta métricas de entrenamiento y de rollout con comandos fijos sobre suelo plano, sin aleatorización y en modo determinista, de 10 segundos cada uno:

| Metrica | Valor |
|---|---|
| Pasos de entrenamiento | 500.170.752 |
| Tiempo de entrenamiento | 4 h 25 min en una RTX 5090 |
| Entornos en paralelo | 2048 |
| Minibatch | 16384 |
| Longitud de episodio final | 990,7 pasos |
| Retorno de episodio final | 59,8 |
| `velocity_diff_abs` final | 0,126 |
| Comandos evaluados en rollout | 14 (hasta 1,0 m/s y 1,0 rad/s) |
| Caídas en rollout | 0 |
| Inclinación máxima del tronco | 0,34 grados |
| Error típico de seguimiento | dentro de 0,05 m/s y 0,04 rad/s |
| Tiempo hasta el 90 % del comando | 0,1 a 0,3 s |
| Peor caso (marcha atrás a -0,5 m/s) | -0,446 m/s con deriva lateral de 0,15 m/s |

No se han probado terreno irregular, perturbaciones, otras semillas, comparación con el controlador clásico de la base ni el robot real.

## Requisitos de hardware

- Entrenamiento: una sola RTX 5090 fue suficiente para 2048 entornos y 500 millones de pasos en 4 h 25 min; no se reportan requisitos para otras GPU.
- Inferencia: el checkpoint es un archivo zip ligero (repositorio de 0,0 GB) y la política es un actor de control, por lo que la VRAM necesaria es muy reducida; no se publica una cifra exacta.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, cualquier GPU con soporte CUDA para MJX/MuJoCo debería poder ejecutar la política, pero no hay datos publicados.
- GPU de consumo: el entrenamiento se hizo en una RTX 5090, de gama de consumo; se desconoce el comportamiento en tarjetas de gama inferior.
- Despliegue: requiere el código `loco_mjx` con `runner.mode=test`, `runner.load_model=latest.model` y `--environment.train_robots="('tidybot2',)"`, usando la rama `add-tidybot2` del repositorio (PR #17). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de respuesta del seguimiento de comandos (0,1 a 0,3 s hasta el 90 % del comando), no latencia de inferencia por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas URMA2 ni controladores comparables para el mismo robot, y el autor señala explícitamente que no ha comparado con el controlador clásico de la base. Tampoco se dispone de datos de parámetros, contexto ni rendimiento de alternativas.

## Limitaciones y advertencias

- Solo simulación: no se ha ejecutado en un robot real y el autor indica que no está autorizado para hardware.
- Política ciega: sin exterocepción, no puede evitar obstáculos ni adaptarse a cambios del entorno no reflejados en la propiocepción.
- No manipula: el brazo y el gripper solo se premian por mantenerse cerca de la pose nominal; no hay comportamiento de agarre o manipulación.
- Validación limitada: no se probaron terreno irregular, perturbaciones, otras semillas ni comparación con el controlador clásico.
- Peor caso conocido: la marcha atrás a -0,5 m/s alcanza -0,446 m/s con 0,15 m/s de deriva lateral, lo que indica asimetrías de seguimiento.
- Dependencia fuerte del código: la disposición de observaciones y la definición del robot deben coincidir exactamente con `loco_mjx` (rama `add-tidybot2`); cualquier cambio rompe la política.
- Licencia MIT, pero con avisos de terceros (KinDER de Tom Silver y MuJoCo Menagerie de Stanford) que deben conservarse; conviene revisar esos términos antes de un uso comercial.
- Sin datos de sesgos, alucinación o idioma, al no ser un modelo de lenguaje; no aplican las advertencias habituales de esos sistemas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yixuanh/tidybot2-urma2-500M
- Código `loco_mjx` (rama `add-tidybot2`, PR #17): https://github.com/nico-bohlinger/loco_mjx
- Vídeo de rollout incluido en el repositorio: `tidybot2_rollout.mp4`
- Checkpoint: `latest.model`
- Licencia: `LICENSE` (MIT, con avisos de KinDER y MuJoCo Menagerie)
