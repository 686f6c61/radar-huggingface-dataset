# vlabki/rr-speed-v4

## Resumen

El modelo `vlabki/rr-speed-v4` es un checkpoint de política recurrente (recurrent policy) desarrollado por VictoryLab (vlabki) para controlar un agente en el videojuego Mario Kart Wii. Se trata de un modelo de aprendizaje por refuerzo entrenado con el algoritmo PPO recurrente (recurrent-ppo), diseñado para completar carreras de forma autónoma y competitiva. El checkpoint se publica como un paquete autocontenido que incluye pesos, configuración del modelo, estadísticas de normalización, referencia de ruta y configuración de entrenamiento.

Con solo 575.410 parámetros, este modelo es extremadamente ligero y está pensado para ejecutarse en tiempo real dentro del entorno del juego, no para tareas de procesamiento de lenguaje natural. Su relevancia radica en demostrar que políticas recurrentes compactas pueden lograr tasas de finalización superiores al 95% en circuitos de Mario Kart Wii, con un 100% de victorias entre las carreras completadas. El modelo se distribuye en formato PyTorch con pesos en safetensors, y su licencia no está especificada.

La evaluación reportada en la model card indica dos variantes: una configuración "best reliable" con un 95% de tasa de finalización y una "best fastest" con un 75%, ambas con tiempos medios de carrera en torno a 10.700 frames. El modelo fue entrenado durante 18.250 actualizaciones de PPO y 112.128.000 pasos de entorno, lo que refleja un proceso de entrenamiento extenso para una tarea de control continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente (tipo no especificado, probablemente LSTM o GRU) |
| Parametros totales | 575.410 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de control) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero el tag `recurrent-ppo` indica que se trata de una política recurrente, probablemente basada en una red LSTM o GRU que procesa observaciones secuenciales del entorno de Mario Kart Wii. El modelo recibe observaciones del estado del juego (posiblemente imágenes o características de bajo nivel) y emite acciones de control (aceleración, dirección, etc.). El soporte de acción se indica como `bc`, que podría referirse a "button combination" o a un espacio de acciones discretas combinadas.

El entrenamiento se realizó con PPO (Proximal Policy Optimization) en su variante recurrente, durante 18.250 actualizaciones y 112.128.000 pasos de entorno. No se especifica la composición del dataset ni si se usaron técnicas adicionales como RLHF o DPO, ya que no es un modelo de lenguaje. El checkpoint incluye estadísticas de normalización y una referencia de ruta, lo que sugiere que el modelo utiliza observaciones normalizadas y posiblemente una guía de trayectoria para mejorar la estabilidad.

## Capacidades

- Control autónomo de un agente en Mario Kart Wii, incluyendo navegación de circuito, gestión de velocidad y evitación de obstáculos.
- Política recurrente con memoria temporal, capaz de manejar dependencias secuenciales en la toma de decisiones.
- Alta tasa de finalización de carreras: 95% en la configuración "best reliable" y 75% en la "best fastest".
- Rendimiento competitivo: 100% de tasa de primer puesto entre las carreras finalizadas en ambas configuraciones.
- Robustez frente a eventos adversos: media de 0,65 eventos de pared y 0,00 respawns en la configuración "best reliable".
- Inferencia determinista con semilla fija y selección de acciones argmax, lo que facilita la reproducibilidad.

## Casos de uso

- Investigación en aprendizaje por refuerzo para juegos de carreras: el modelo sirve como punto de partida para estudiar políticas recurrentes en entornos de control continuo con alta dimensionalidad de observaciones.
- Benchmark de agentes en Mario Kart Wii: puede utilizarse como baseline para comparar nuevos algoritmos de RL o arquitecturas recurrentes en el mismo entorno.
- Desarrollo de bots para juegos de carreras: el modelo demuestra que un agente compacto puede completar circuitos de forma fiable, lo que podría adaptarse a otros juegos de carreras con mecánicas similares.
- Pruebas de robustez en entornos con ruido: al ser una política recurrente, se puede evaluar su comportamiento ante perturbaciones en las observaciones o en la dinámica del entorno.
- Optimización de hiperparámetros en RL: los datos de entrenamiento (18.250 updates, 112M pasos) sirven como referencia para calibrar la duración y el presupuesto de muestras en tareas similares.
- Educación en aprendizaje por refuerzo: el checkpoint autocontenido permite a estudiantes cargar y ejecutar el modelo sin necesidad de reproducir el entrenamiento completo, facilitando la experimentación práctica.

## Benchmarks y rendimiento

La model card proporciona métricas de evaluación propias del entorno, no benchmarks estándar de NLP. Se presentan los resultados de las dos configuraciones evaluadas:

| Metrica | Best reliable | Best fastest |
|---|---|---|
| Checkpoint update | 18250 | 17000 |
| Cohort | 20 | 20 |
| Finish rate | 95.0% | 75.0% |
| Finished mean frames | 10706.58 | 10687.47 |
| Finished median frames | 10697.00 | 10681.00 |
| Fastest finish frames | 10645 | 10633 |
| Finished P90 frames | 10726.60 | 10712.60 |
| First-place rate among finishes | 100.0% | 100.0% |
| Mean wall events | 0.65 | 1.30 |
| Mean respawns | 0.00 | 0.20 |

Estas métricas se obtuvieron con ejecuciones deterministas de argmax con semilla fija, excluyendo carreras con DNF (did not finish). No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al tener solo 575.410 parámetros, el modelo ocupa aproximadamente 2,3 MB en precisión FP32 (575.410 × 4 bytes). Cabe en cualquier GPU, incluso en iGPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una CPU moderna puede ejecutar la inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (GTX 1050, RTX 2060, etc.) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con el runtime estándar de PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño del modelo, la inferencia debería ser de sub-milisegundos en GPU y de pocos milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (agentes de RL para Mario Kart Wii). El modelo es específico de este entorno y no hay referencias públicas de otros checkpoints similares en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el entorno de Mario Kart Wii; no es transferible a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto ni tiene capacidades de generación de lenguaje natural.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en proyectos comerciales.
- Las métricas de evaluación provienen de ejecuciones deterministas con semilla fija; el rendimiento en condiciones estocásticas o con variaciones del entorno puede diferir.
- La configuración "best fastest" muestra una tasa de finalización menor (75%) y más eventos de pared (1,30 de media), lo que indica un equilibrio entre velocidad y fiabilidad.
- No se incluyen los logs de entrenamiento ni los traces de rollout, lo que limita la reproducibilidad completa del proceso de entrenamiento.
- El modelo puede presentar comportamientos subóptimos en circuitos no vistos durante el entrenamiento, aunque la referencia de ruta incluida podría mitigar este riesgo.

## Enlaces

- [Modelo en Hugging Face: vlabki/rr-speed-v4](https://huggingface.co/vlabki/rr-speed-v4)
- [Perfil de VictoryLab en Hugging Face](https://huggingface.co/vlabki)
