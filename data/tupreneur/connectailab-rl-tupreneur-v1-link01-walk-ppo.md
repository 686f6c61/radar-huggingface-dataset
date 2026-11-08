# TUpreneur/connectailab-rl-tupreneur-v1-link01-walk-ppo

## Resumen

`connectailab-rl-tupreneur-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para controlar la locomoción bípeda del robot simulado LINK-01 en el entorno `Link01Walk-v0`, construido sobre MuJoCo a través de la librería `link01-gym`. Lo desarrolla TUpreneur en el marco de la colaboración CONNECT AI LAB, dentro del curso "AI CITY BUILDERS" de refuerzo. No es un modelo de lenguaje: es una política neuronal que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones (una por articulación, con postura base de ±0,18 rad).

El interés del artefacto es doble. Por un lado, documenta un pipeline completo de RL (entorno, `obs_rms.pt` para normalización de observaciones, `actor.json` con metadatos y `model.pt` con los pesos) reproducible en minutos: el autor declara 200.000 pasos de entrenamiento en 1,7 minutos con 8 entornos en paralelo. Por otro, los resultados publicados son honestos y revelan un fallo de política: la velocidad media es de -0,015 m/s frente a una consigna de 0,18 m/s, es decir, el robot se desplaza ligeramente hacia atrás y no cumple el objetivo de marcha.

Se trata, por tanto, de una ficha de valor principalmente educativo y de referencia de infraestructura, no de un componente listo para producción robótica. El repositorio ocupa 0,0 GB según Hugging Face y no incluye información sobre licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (actor PPO); arquitectura interna no detallada en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), `obs_rms.pt`, `actor.json` |
| Entorno de entrenamiento | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Dimensión de observación | 51 |
| Dimensión de acción | 14 articulaciones, postura base ±0,18 rad |
| Algoritmo | PPO (clip 0,2, lr 0,0003, gamma 0,99, GAE lambda 0,95) |
| Pasos de entrenamiento | 200.000 |
| Entornos paralelos | 8 |
| Tiempo de entrenamiento declarado | 1,7 minutos |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, unidades ocultas ni función de activación). Lo que sí se especifica es el marco algorítmico: PPO con recorte de ratio en 0,2, tasa de aprendizaje 0,0003, factor de descuento 0,99 y GAE con lambda 0,95, ejecutado sobre 8 instancias paralelas del entorno `Link01Walk-v0` durante 200.000 pasos. El agente consume observaciones de 51 dimensiones y emite 14 acciones continuas correspondientes a las articulaciones del robot bípedo, con una postura nominal de referencia de ±0,18 rad.

El paquete incluye un fichero `obs_rms.pt` con las estadísticas de normalización de observaciones (media y varianza acumuladas durante el entrenamiento), imprescindible para reproducir la inferencia con la misma distribución de entrada. El fichero `actor.json` contiene metadatos del actor. No se documenta el uso de reward shaping, curriculum learning, domain randomization ni técnicas auxiliares de estabilidad, ni se especifica el número total de muestras o episodios recolectados más allá del cómputo de pasos.

## Capacidades

- Control motor continuo de un robot bípedo simulado con 14 articulaciones en MuJoCo.
- Política entrenada específicamente para la tarea de marcha del entorno `Link01Walk-v0`.
- Inferencia determinista o estocástica a partir de la política PPO guardada en `model.pt`.
- Normalización de observaciones reproducible mediante `obs_rms.pt`.
- Integración con `link01-gym` para evaluación y réplica del entorno de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de texto.
- No se documentan capacidades de transferencia a otros robots, tareas o morfologías.

## Casos de uso

- Reproducción de un pipeline de RL de principio a fin: sirve como ejemplo didáctico de entrenamiento PPO con 8 entornos paralelos, normalización de observaciones y exportación de pesos en un entorno MuJoCo, replicable en menos de dos minutos de cómputo según el autor.
- Docencia y talleres de refuerzo: el par `model.pt` + `obs_rms.pt` permite a estudiantes cargar una política entrenada y evaluar su comportamiento en `Link01Walk-v0` sin repetir el entrenamiento.
- Análisis de fallos de políticas RL: los resultados negativos de velocidad (-0,015 m/s) y distancia (-0,3 m por episodio de 20 s) constituyen un caso de estudio útil sobre recompensas mal especificadas, horizontes de entrenamiento cortos o desajustes entre consigna y comportamiento aprendido.
- Base para experimentos de comparación de algoritmos: el mismo entorno `Link01Walk-v0` y la misma configuración de PPO permiten contrastar variantes (SAC, TD3, PPO con reward shaping) manteniendo constantes observación, acción y presupuesto de pasos.
- Evaluación de estabilidad sin caídas: el agente registra 0,0 caídas por minuto en las pruebas declaradas, lo que lo hace útil como referencia de política estable aunque no avance, para estudiar el equilibrio entre estabilidad y progresión.
- Integración en un banco de pruebas de robótica simulada: permite validar la infraestructura de `link01-gym` y el flujo de carga de políticas antes de invertir en entrenamientos más largos o en hardware real.
- Punto de partida para fine-tuning: los pesos pueden inicializar un entrenamiento posterior con más pasos o con una función de recompensa corregida que incentive explícitamente la velocidad hacia delante.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`). Evaluación sobre `Link01Walk-v0` con consigna de 0,18 m/s, 5 episodios de 20 segundos cada uno.

| Métrica | Valor declarado | Observación |
|---|---|---|
| Distancia por episodio de 20 s (m) | -0,3 | Desplazamiento neto negativo |
| Velocidad media hacia delante (m/s) | -0,015 | Consigna: 0,18 m/s |
| Caídas por minuto | 0,0 | Sin caídas registradas |

No se han publicado otros resultados de benchmarks en la información disponible, ni comparaciones con políticas de referencia del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,0 GB) y la naturaleza de la política, el modelo cabe holgadamente en cualquier GPU consumer, probablemente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa para una política de este tamaño.
- CPU: la inferencia es viable en CPU, dado el reducido coste computacional de una política de 51 entradas y 14 salidas.
- Despliegue: carga directa con PyTorch (`torch.load` sobre `model.pt`) junto con `obs_rms.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Entorno de simulación: requiere `link01-gym` y MuJoCo para ejecutar la política en `Link01Walk-v0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-tupreneur-v1-link01-walk-ppo | Política PPO | Marcha bípeda | `Link01Walk-v0` (MuJoCo) | no disponible | Hugging Face |
| Políticas de referencia de MuJoCo (p. ej. Walker2d, Humanoid de Gymnasium) | Políticas RL | Locomoción | Entornos estándar de Gymnasium/MuJoCo | según implementación | Repositorios de referencia |
| Políticas de locomotion de Isaac Gym / legged_gym | Políticas RL | Locomoción de cuadrúpedos y humanoides | Isaac Gym | según implementación | Repositorios públicos |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a tipo de tarea, entorno y disponibilidad. No se han encontrado políticas públicas específicas para el robot LINK-01 más allá de este artefacto y del repositorio relacionado `TUpreneur/connectailab-rl-tupreneur-v1-link01`.

## Limitaciones y advertencias

- La política no cumple el objetivo de la tarea: la velocidad media es negativa (-0,015 m/s) frente a la consigna de 0,18 m/s, y la distancia por episodio también es negativa (-0,3 m). No debe presentarse como un agente de marcha funcional.
- Los resultados están marcados como no verificados (`verified: false`) y proceden únicamente del autor.
- Entrenamiento muy corto (200.000 pasos, 1,7 minutos): insuficiente en la mayoría de tareas de locomoción para converger a políticas robustas; el propio resultado sugiere convergencia prematura o una recompensa mal especificada.
- La ausencia de caídas (0,0/min) puede reflejar una política que permanece estable sin desplazarse, no una marcha correcta.
- No se especifica la licencia, lo que impide evaluar el uso comercial; debe contactarse con el autor antes de cualquier explotación.
- No hay información sobre sesgos, robustez ante perturbaciones, domain randomization ni transferencia sim-to-real; no se recomienda su uso en hardware físico sin validación adicional.
- Dependencia estricta del entorno `Link01Walk-v0` y de las estadísticas de normalización `obs_rms.pt`; cambios en la distribución de observaciones invalidan la política.
- El repositorio no incluye información sobre idiomas ni documentación técnica detallada de la arquitectura de red.
- La model card está redactada principalmente en coreano; la documentación en inglés o castellano es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-link01-walk-ppo
- Repositorio relacionado (LINK-01): https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-link01
- Árbol de ficheros del repositorio relacionado: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-link01/tree/main
