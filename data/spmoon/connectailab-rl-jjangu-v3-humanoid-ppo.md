# spmoon/connectailab-rl-jjangu-v3-humanoid-ppo

## Resumen

`connectailab-rl-jjangu-v3-humanoid-ppo` es un modelo de aprendizaje por refuerzo profundo publicado por el usuario `spmoon` en Hugging Face, enmarcado en el proyecto CONNECT AI LAB. No es un modelo de lenguaje: es una política neuronal entrenada con PPO (Proximal Policy Optimization) para controlar el robot humanoide tridimensional del entorno `Humanoid-v5` del motor de física MuJoCo, integrado en Gymnasium. El objetivo del entrenamiento es la locomoción de alta velocidad (sprint), es decir, maximizar la velocidad de desplazamiento del humanoide manteniendo la estabilidad postural.

La política recibe un vector de observación de 348 dimensiones (estado de sensores corporales y articulaciones) y emite 17 acciones continuas de par motor, distribuidas según una normal diagonal. La red es un perceptrón multicapa `348 -> 256 (Tanh) -> 256 (Tanh) -> 17 (Normal)`, con un tamaño de repo de 0,0 GB y pesos en formato PyTorch. Según la model card, es la tercera iteración (V3) y continúa el entrenamiento desde los pesos del modelo V2, acumulando 2.300.000 pasos de entrenamiento en total.

Su relevancia es acotada y de carácter educativo o experimental: se trata de un artefacto de un entusiasta que documenta su proceso de aprendizaje en IA y RL, no de un modelo de producción con benchmarks publicados ni licencia declarada. Resulta útil como referencia de configuración de PPO en control continuo con MuJoCo y como ejemplo de entrenamiento incremental por versiones, pero no debe confundirse con una política validada para robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP para política PPO: 348 -> 256 (Tanh) -> 256 (Tanh) -> 17 (Normal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 348 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifica safetensors ni GGUF |
| Entorno de entrenamiento | Gymnasium MuJoCo `Humanoid-v5` |
| Espacio de observacion | `Box(348)` |
| Espacio de accion | `Box(17)`, control de par motor |
| Algoritmo | PPO (clip 0,2) |
| Hiperparametros declarados | 16 entornos en paralelo, 512 pasos por actualización, clip 0,2, learning rate 0,00015, 1.000.000 pasos por fase |
| Pasos acumulados | 2.300.000 (continuación desde V2) |
| Recompensa media reciente | 535,8 |

## Arquitectura y entrenamiento

La política es una red neuronal densa de dos capas ocultas de 256 unidades con activación Tanh, que proyecta el vector de observación de 348 dimensiones sobre una distribución normal diagonal de 17 dimensiones correspondiente a los pares de las 17 articulaciones motorizadas del humanoide de MuJoCo. El entrenamiento emplea PPO con recorte de ratio de 0,2, 16 entornos vectorizados en paralelo, 512 pasos por actualización y una tasa de aprendizaje de 0,00015. La model card indica 1.000.000 de pasos en la fase actual y un total acumulado de 2.300.000 pasos, lo que implica que V3 se inicializa desde los pesos de V2 y continúa el entrenamiento.

No se documentan detalles sobre la composición del dataset (en RL no aplica en el sentido habitual), la función de recompensa concreta más allá de la recompensa por defecto de `Humanoid-v5` (avance + control + supervivencia), ni si se aplicaron técnicas auxiliares como normalización de observaciones, reward shaping, curriculum o domain randomization. Tampoco se describe ninguna innovación técnica destacable (atención lineal, decodificación especulativa, etc.), ya que no procede en este tipo de modelo. La única señal de rendimiento aportada es la recompensa media reciente de 535,8, sin curva de aprendizaje legible en el texto extraído más allá de la referencia a una imagen `training_curve.png`.

## Capacidades

- Control continuo de un robot humanoide simulado en MuJoCo (`Humanoid-v5`) mediante 17 salidas de par motor.
- Locomoción bípeda de alta velocidad (sprint) en el simulador, con el objetivo declarado de maximizar la velocidad de avance.
- Política estocástica (distribución normal diagonal) apta para muestreo en inferencia o para evaluación determinista con la media.
- Entrenamiento incremental: reutiliza los pesos de la versión V2 como inicialización.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso, agentes basados en texto ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking), visión, audio ni procesamiento de lenguaje natural.
- Aplicable únicamente dentro del entorno Gymnasium/MuJoCo para el que fue entrenado.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo reproducible de configuración PPO (16 entornos, 512 pasos, clip 0,2, lr 1,5e-4) para quienes estudian control continuo en MuJoCo.
- Reproducción de resultados en `Humanoid-v5`: cargar los pesos y evaluar la recompensa media para contrastar con la cifra declarada de 535,8 y detectar discrepancias de versión del entorno.
- Punto de partida para fine-tuning: al ser una continuación de V2, puede usarse como inicialización para experimentos de curriculum o reward shaping en el mismo entorno.
- Comparación de políticas en simulador: útil para contrastar la evolución V1/V2/V3/V4 dentro del proyecto CONNECT AI LAB y estudiar el efecto del entrenamiento acumulado.
- Investigación sobre estabilidad de PPO: permite analizar la varianza de la política normal diagonal y el comportamiento del clip en tareas de alta dimensionalidad (348 observaciones, 17 acciones).
- Demostraciones visuales de locomoción simulada: renderizar episodios en MuJoCo para material divulgativo sobre RL y robótica.
- No es adecuado para control de robots físicos sin un pipeline previo de sim-to-real (domain randomization, identificación de sistema), que no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado es la recompensa media reciente de 535,8 en `Humanoid-v5`, sin comparación con líneas base ni desviación entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la red tiene dos capas ocultas de 256 unidades, por lo que el modelo cabe holgadamente en cualquier GPU consumer (incluso < 1 GB en la práctica).
- GPU recomendadas: cualquiera; una RTX 4090 o A100 es sobredimensionada para inferencia. Para entrenamiento continuado, una GPU consumer moderna (RTX 3060 o superior) es suficiente dado el tamaño de la red y los 16 entornos paralelos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos cientos de MB libres; también puede ejecutarse en CPU para inferencia.
- Opciones de despliegue: PyTorch nativo con Gymnasium + MuJoCo; no aplican vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput estimados: no disponibles; dependen del renderizado de MuJoCo y del número de entornos vectorizados, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Entorno | Arquitectura | Pasos | Recompensa declarada | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-jjangu-v3-humanoid-ppo | Humanoid-v5 | MLP 348-256-256-17, PPO | 2.300.000 acumulados | 535,8 | no disponible |
| connectailab-rl-jjangu-v2-link01 | no especificado (RL/robotics) | no disponible (PEFT, Safetensors) | no disponible | no disponible | Apache-2.0 |
| connectailab-rl-jjangu-v4-link01 | no especificado | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con políticas de referencia de la comunidad (por ejemplo, implementaciones estándar de PPO en `Humanoid-v5` de Stable-Baselines3), ya que no se han publicado métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades generativas en el sentido habitual.
- Licencia no declarada: la ausencia de licencia impide asumir derechos de uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- Entrenado exclusivamente en simulación (`Humanoid-v5`); no hay evidencia de transferencia a hardware real (sim-to-real) ni de domain randomization.
- La recompensa de 535,8 es un único dato sin intervalo de confianza, número de semillas ni versión exacta del entorno; no es un benchmark validado.
- Riesgo de sobreajuste al entorno y a la versión concreta de MuJoCo/Gymnasium; cambios de versión pueden alterar la dinámica y degradar la política.
- La model card está parcialmente en coreano y no documenta la función de recompensa, la normalización de observaciones ni el proceso de evaluación.
- Proyecto personal de carácter educativo ("AI & ML enthusiast... learning the fundamentals"); no hay revisión por pares ni mantenimiento garantizado.
- Sin información sobre sesgos, alucinación o limitaciones de contexto por no aplicar a este tipo de modelo; el riesgo relevante es la extrapolación indebida a robótica física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spmoon/connectailab-rl-jjangu-v3-humanoid-ppo
- Versión V2: https://huggingface.co/spmoon/connectailab-rl-jjangu-v2-link01
- Versión V4: https://huggingface.co/spmoon/connectailab-rl-jjangu-v4-link01
- Gymnasium (entorno `Humanoid-v5`): https://gymnasium.farama.org/
- MuJoCo: https://mujoco.org/
- PPO (paper original): https://arxiv.org/abs/1707.06347
