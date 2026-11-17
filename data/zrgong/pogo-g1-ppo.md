# zrgong/pogo-g1-ppo

## Resumen

Pogo-G1 es un conjunto de políticas de aprendizaje por refuerzo (PPO) entrenadas para que un robot humanoide Unitree G1, equipado con manos BrainCo Revo2, sea capaz de montar y saltar sobre un pogo stick pasivo en simulación. El modelo lo publica el usuario zrgong (repositorio de código en GitHub bajo Ry3nG/Pogo-G1) y se distribuye como checkpoints de rsl-rl, la librería de RL para robótica de ETH Zúrich. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones propioceptivas y comandos de alto nivel a acciones articulares.

Cada política sigue comandos de altura de salto, velocidad planar y velocidad de giro, y se ha entrenado con 4000 actualizaciones de PPO en el simulador MuJoCo sobre una revisión física concreta (`pneumatic-v5`). El repositorio contiene tres ejecuciones del mismo recetario con semillas distintas (s0, s1, s2), lo que permite evaluar la robustez del entrenamiento. Su relevancia es acotada pero concreta: demuestra que un humanoide human-size puede aprender una tarea de contacto dinámico compleja (agarre por fricción de manos y pies sobre un objeto pasivo) con RL estándar y sin estimador de estado dedicado.

El alcance es exclusivamente simulado. No hay pesos para despliegue en hardware real, no hay model card con benchmarks de ML convencionales y el tamaño del repositorio es de 0.0 GB (solo checkpoints y JSON de configuración). Es un artefacto de investigación reproducible, no un producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal actor-critic (MLP) entrenada con PPO mediante rsl-rl; no disponible el número de capas y unidades |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (checkpoints `.pt` de PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint rsl-rl con actor, crítico y optimizador); `config.json` y `mounted_pose.json` por ejecución |

## Arquitectura y entrenamiento

La política es un actor-critic entrenado con PPO (Proximal Policy Optimization) sobre el simulador MuJoCo, usando la librería rsl-rl. El actor recibe observaciones con velocidades de la pelvis con ruido inyectado por el simulador, en sustitución de un estimador de estado real, y emite acciones articulares para el Unitree G1 con manos BrainCo Revo2. El pogo stick es un objeto pasivo que el robot sujeta por fricción con manos y pies; el modelo del stick está adaptado del "Vurtego Pogo Stick Model" de RoboHoloclone12 (CC BY 4.0). La tarea exige coordinar contacto dinámico, equilibrio y seguimiento de comandos de altura, velocidad planar y giro.

Se publican tres ejecuciones independientes del mismo recetario con semillas distintas (`vel-obs-s0`, `s1`, `s2`), cada una con 4000 actualizaciones de PPO. Cada carpeta incluye `config.json` (configuración de tarea y PPO), `mounted_pose.json` (pose inicial) y `model_4000.pt` (actor, crítico y optimizador). Los checkpoints están atados a la revisión física `pneumatic-v5`; el evaluador rechaza cualquier otra revisión, lo que fija la reproducibilidad pero limita la portabilidad a otros entornos. No se documentan en la información disponible detalles sobre composición del dataset (no aplica, es RL en simulación), número de entornos paralelos de entrenamiento ni técnicas de regularización más allá de las propias de PPO.

## Capacidades

- Control de un humanoide Unitree G1 con manos BrainCo Revo2 sobre un pogo stick pasivo en MuJoCo.
- Seguimiento de comandos de altura de salto en el rango de 0.15 a 1.0 m.
- Seguimiento de velocidad planar (por ejemplo, 0.3 m/s hacia delante) y de velocidad de giro (por ejemplo, 0.5 rad/s).
- Combinación simultánea de comandos de avance y giro.
- Agarre por fricción de manos y pies sobre el stick, sin agarre rígido modelado.
- Robustez entre semillas: las tres ejecuciones mantienen el salto en al menos el 96.5 % de los rollouts en cada celda evaluada.
- No soporta tool calling, function calling, agentes multi-paso, multilingüismo ni modos de razonamiento: no es un modelo generativo.

## Casos de uso

- Investigación en locomoción dinámica con contacto: usar las políticas como referencia reproducible para estudiar cómo el RL resuelve el equilibrio sobre un objeto pasivo con agarre por fricción, partiendo de la pose inicial de `mounted_pose.json`.
- Evaluación comparativa de algoritmos de RL: las tres semillas con el mismo recetario permiten medir varianza de entrenamiento y estabilidad de la política ante cambios de hiperparámetros o de implementación de PPO.
- Desarrollo de controladores jerárquicos: la interfaz de comandos (altura, velocidad planar, giro) sirve como capa de bajo nivel sobre la que probar planificadores de alto nivel en simulación.
- Estudio de sim-a-real y estimación de estado: dado que el actor consume velocidad de pelvis con ruido del simulador, el checkpoint es un banco de pruebas para sustituir esa señal por un estimador y medir la degradación.
- Docencia en robótica con RL: el flujo `uv run` con `scripts/play.py` y `scripts/capability.py` permite reproducir vídeos y métricas de capacidad con 64 mundos y 20 segundos por defecto.
- Validación de modelos físicos de objetos pasivos: al estar atado a la revisión `pneumatic-v5`, permite contrastar el efecto de cambios en el modelo del pogo stick sobre el rendimiento del controlador.
- Generación de datos sintéticos de contacto para entrenar perceptores o estimadores: los rollouts de 256 mundos y 30 s por celda producen trayectorias etiquetadas de altura, velocidad y giro.

## Benchmarks y rendimiento

Resultados de capacidad publicados en la model card: 256 mundos, 30 s por celda, cinco alturas de salto de 0.15 a 1.0 m bajo cuatro comandos (in place, avance a 0.3 m/s, giro a 0.5 rad/s, y ambos).

| Métrica | Resultado |
|---|---|
| Rollouts con salto mantenido | ≥ 96.5 % en cada celda, en las tres ejecuciones |
| Error de altura | dentro de 2 cm |
| Error de guiñada promediado por salto | ≤ 0.15 rad/s |
| Error de velocidad planar | de 0.14 m/s a 0.15 m de altura hasta 0.67 m/s a 1.0 m de altura |
| Actualizaciones PPO por ejecución | 4000 |

No se han publicado resultados de benchmarks estándar de ML (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- GPU NVIDIA obligatoria según la model card; no se especifica VRAM mínima.
- Entorno de ejecución: Python 3.12 con `uv`, más dos assets externos descritos en el README del repositorio de código.
- Despliegue: scripts `scripts/play.py` (visualización y vídeo) y `scripts/capability.py` (evaluación de capacidades) del repositorio GitHub; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Carga de trabajo de evaluación de referencia: 64 mundos y 20 s en `play.py`; 256 mundos y 30 s por celda en la evaluación de capacidades.
- VRAM, latencia y throughput estimados: no disponibles.
- No cabe en GPU consumer de forma documentada; no se confirma ni descarta su viabilidad en RTX 4090 u otras, al no publicarse el tamaño de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pogo-G1 (este) | Política PPO (rsl-rl) | MuJoCo, revisión `pneumatic-v5` | Pogo stick con Unitree G1 y manos Revo2 | MIT | Hugging Face + GitHub |
| Políticas de locomotion de rsl-rl (referencia de la librería) | Políticas PPO | Isaac Gym / MuJoCo | Locomoción bípeda y cuadrúpeda estándar | según repositorio | Repositorios de la librería |
| Políticas humanoides de Unitree (referencia del fabricante) | Controladores propietarios | Simulación y hardware | Locomoción y manipulación del G1 | propietaria | Distribución del fabricante |

No se dispone en la información proporcionada de comparativas numéricas con alternativas de la misma tarea (pogo stick con humanoide), por lo que no se incluyen cifras de rendimiento cruzadas.

## Limitaciones y advertencias

- Solo simulación: el modelo físico se construye a partir de planos del fabricante y estimaciones de ingeniería; no hay validación en hardware real.
- El actor recibe velocidad de pelvis con ruido del simulador en lugar de un estimador de estado; el rendimiento en un robot real no está caracterizado.
- Los checkpoints están atados a la revisión física `pneumatic-v5` y el evaluador rechaza otras revisiones, lo que rompe la compatibilidad con cambios en el modelo del stick o del robot.
- Dependencia de dos assets externos no incluidos en el repositorio de Hugging Face, lo que complica la reproducción fuera del flujo documentado.
- Sin datos publicados de tamaño de red, VRAM, latencia ni throughput; imposible dimensionar el despliegue a priori.
- Riesgo de sobreajuste a la dinámica del simulador y a la pose inicial de `mounted_pose.json`; no se documenta variación de condiciones iniciales más allá de las semillas.
- Licencia MIT permite uso comercial del artefacto, pero el modelo del pogo stick adaptado es CC BY 4.0 y exige atribución a RoboHoloclone12.
- Sin información sobre sesgos (no aplica en el sentido de lenguaje) ni sobre alucinación; el fallo típico esperable es la pérdida del salto o la caída, no la generación de contenido incorrecto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin comunidad de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/zrgong/pogo-g1-ppo
- Repositorio de código, figuras y clips: https://github.com/Ry3nG/Pogo-G1
- Modelo del pogo stick original (RoboHoloclone12, CC BY 4.0): referencia citada en la model card, sin URL directa disponible en la información proporcionada.
