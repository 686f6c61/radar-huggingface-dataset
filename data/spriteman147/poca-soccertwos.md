# Spriteman147/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo profundo (deep RL) entrenado con la librería Unity ML-Agents para el entorno SoccerTwos, un escenario de fútbol 2 contra 2 incluido en los ejemplos oficiales de ML-Agents. Lo publica el usuario Spriteman147 en Hugging Face. No es un modelo de lenguaje ni un modelo generativo: es una política neuronal de tipo actor-critic que transforma observaciones del entorno (posiciones, velocidades, raycasts y estado del balón) en acciones de movimiento y disparo dentro de la simulación.

El interés de esta ficha es distinto al de un LLM. Se trata de un checkpoint de investigación orientado a reproducibilidad: sirve como línea base para comparar algoritmos de RL, para estudiar dinámicas de auto-juego (self-play) y para desplegar inferencia en Unity mediante ONNX. El repositorio ocupa 0,2 GB, un tamaño que sugiere que incluye no solo los pesos exportados, sino también artefactos de entrenamiento (checkpoints intermedios y trazas de TensorBoard).

La relevancia actual es acotada pero real: ML-Agents sigue siendo uno de los frameworks de referencia para entrenar agentes en entornos 3D, y los checkpoints comunitarios de entornos oficiales como SoccerTwos permiten a docentes, estudiantes e investigadores arrancar experimentos sin repetir millones de pasos de simulación. La model card, sin embargo, no aporta métricas, hiperparámetros ni licencia, por lo que su uso en producción exige validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal actor-critic entrenada con POCA (Policy Optimization with Clipped Advantage) sobre Unity ML-Agents; número de capas y tamaño de las mismas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL; la observación depende de la ventana de observación del entorno SoccerTwos, no disponible) |
| Tipos de cuantización | no disponible (se distribuyen pesos en formato nativo de ML-Agents y exportación ONNX, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato binario de ML-Agents) y `.onnx`, según las etiquetas del repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la red de política y función de valor que ML-Agents construye a partir de la configuración del entorno SoccerTwos. El algoritmo declarado es POCA, una variante de PPO introducida en ML-Agents que incorpora objetivos con corrección off-policy basada en V-trace y ventajas recortadas (*clipped advantage*), lo que estabiliza el entrenamiento cuando los datos provienen de políticas ligeramente desactualizadas. En entornos de auto-juego, como es el caso del fútbol 2v2, POCA se combina habitualmente con un esquema de *self-play* en el que el agente se enfrenta a versiones anteriores de sí mismo; ML-Agents ofrece además MA-POCA para escenarios cooperativos multiagente, pero la etiqueta del repositorio indica POCA.

No se dispone de información publicada sobre el número de tokens o pasos de entrenamiento, la composición del dataset de experiencias, el uso de recompensas intrínsecas, ni sobre si se aplicaron técnicas de curriculum o de imitación (GAIL/BC). Tampoco se documentan innovaciones técnicas adicionales. Todo lo que se puede afirmar con certeza es lo que aparece en la model card: se trata de un agente entrenado para SoccerTwos con ML-Agents, exportado presumiblemente desde el fichero de checkpoint generado por `mlagents-learn` y acompañado de trazas de TensorBoard, dado que "tensorboard" figura entre las etiquetas.

## Capacidades

- Control de un agente de fútbol simulado en el entorno SoccerTwos de ML-Agents (modalidad 2 contra 2).
- Procesamiento de observaciones vectoriales del entorno y emisión de acciones discretas o continuas de movimiento, giro y disparo, según la configuración del escenario.
- Comportamiento derivado de auto-juego: posicionamiento, persecución del balón y coordinación implícita con el compañero de equipo, en la medida en que el entrenamiento lo haya consolidado (no hay evidencia publicada de nivel de juego alcanzado).
- Inferencia exportable a ONNX, lo que permite ejecutarla fuera de Unity con ONNX Runtime o dentro del motor mediante Unity Inference Engine / Sentis.
- Capacidades multilingües: no aplica.
- Tool calling / function calling: no soportado, al no ser un modelo de lenguaje.
- Razonamiento multi-paso simbólico: no aplica; la planificación es puramente reactiva sobre la observación actual y el estado recurrente de la política.
- Capacidades especiales: ninguna documentada (sin modo de pensamiento, visión, audio ni generación de texto).

## Casos de uso

- Línea base para investigación en RL multiagente: permite comparar nuevas variantes de PPO, POCA, SAC o MAPPO contra un checkpoint ya entrenado en SoccerTwos, reduciendo el coste de reproducir un punto de partida competitivo.
- Docencia de aprendizaje por refuerzo: encaja directamente en el curso Deep RL de Hugging Face y en los tutoriales de ML-Agents, ya que los estudiantes pueden cargar el agente y verlo jugar en el navegador sin entrenar nada.
- Estudio de dinámicas de auto-juego: sirve como oponente fijo para medir cómo evoluciona un agente nuevo frente a una política congelada, un patrón habitual en investigaciones sobre *self-play* y *league play*.
- Fine-tuning con curriculum learning: se puede reanudar el entrenamiento con `mlagents-learn ... --resume` para introducir variaciones de dificultad, cambios de recompensa o perturbaciones en el entorno y analizar la estabilidad del aprendizaje.
- Validación de pipelines de exportación ONNX: útil como caso de prueba para verificar que un modelo ML-Agents se exporta, se carga en Unity Sentis o en ONNX Runtime y produce acciones coherentes a baja latencia.
- Demostración interactiva en portafolios o webs docentes: el reproductor de modelos Unity de Hugging Face permite incrustar el agente y mostrarlo jugando, algo útil para material divulgativo sobre RL.
- Pruebas de rendimiento en inferencia de borde: al ser una red pequeña, permite medir latencias de decisión en CPU o en dispositivos embebidos como referencia de comparación frente a políticas más pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye Elo, tasa de victorias, recompensa media por episodio ni curvas de aprendizaje, y no se han encontrado métricas en las búsquedas web realizadas. Cualquier cifra de rendimiento debería obtenerse evaluando el agente contra oponentes fijos (por ejemplo, la política por defecto del entorno) durante un número suficiente de episodios.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la política de SoccerTwos es una red pequeña de tipo perceptrón multicapa o CNN ligera, por lo que la huella de memoria es mínima (cifra exacta no disponible).
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente; incluso una iGPU moderna sirve para inferencia.
- Compatibilidad con GPU consumer: sí, en todas las gamas. El cuello de botella real es el renderizado del entorno Unity, no el modelo.
- Opciones de despliegue: Unity ML-Agents con el fichero `.nn`, Unity Inference Engine / Sentis o Barracuda con el `.onnx`, y ONNX Runtime 1.x en Python, C#, C++ o JavaScript para ejecución fuera del motor.
- Latencia y throughput estimados: no disponibles. En la práctica, la inferencia de una política de este tamaño se sitúa en el orden de fracciones de milisegundo a pocos milisegundos por decisión en CPU moderna, siempre que el paso del entorno no introduzca esperas de simulación.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, pero los pesos necesarios para inferencia son una fracción pequeña de ese total.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Spriteman147/poca-SoccerTwos | SoccerTwos | POCA (ML-Agents) | no disponible | no aplica | no disponible | Hugging Face |
| aiartwork/poca-SoccerTwos | SoccerTwos | POCA (ML-Agents) | no disponible | no aplica | no disponible | Hugging Face |
| akanametov/SoccerTwos | SoccerTwos | POCA (ML-Agents) | no disponible | no aplica | no disponible | Hugging Face |
| GesturingMan/poca-SoccerTwos | SoccerTwos | POCA (ML-Agents) | no disponible | no aplica | no disponible | Hugging Face |

Los cuatro repositorios son publicaciones comunitarias del mismo tipo de agente sobre el mismo entorno y con model cards casi idénticas, probablemente generadas a partir de la plantilla automática de ML-Agents para el Hub. No hay información pública que permita diferenciarlos en calidad, número de pasos de entrenamiento, tasa de victorias o hiperparámetros, por lo que la comparación cuantitativa no es posible con los datos disponibles.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay Elo, tasa de victorias ni curvas de recompensa, por lo que no se puede afirmar que el agente juegue a un nivel competitivo.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita de uso comercial ni de redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Model card mínima: sin hiperparámetros, sin descripción del proceso de entrenamiento y sin información sobre la configuración del entorno empleada, lo que dificulta la reproducibilidad exacta.
- Especialización extrema: el agente solo tiene sentido dentro del entorno SoccerTwos con la misma configuración de observaciones y acciones; no generaliza a otras tareas ni a otros escenarios de fútbol.
- Sensibilidad al cambio de entorno: si se modifica el espacio de observación, el número de agentes, la escala del escenario o la frecuencia de decisiones, la política puede degradarse de forma abrupta.
- Ausencia de salvaguardas: al no ser un modelo de lenguaje, no hay filtros de contenido, pero tampoco mecanismos de interpretabilidad; analizar por qué toma una decisión requiere herramientas externas de atribución.
- Riesgo de sobreajuste al auto-juego: una política entrenada exclusivamente contra sí misma puede exhibir comportamientos explotables por oponentes con estrategias distintas, un fenómeno documentado en entornos de *self-play*.
- Sin sesgos lingüísticos ni de idioma, por no procesar texto, pero sí posibles sesgos derivados de la dinámica específica de la simulación y de las recompensas definidas por el entorno.
- Fecha de creación poco habitual (2026-10-05 según los metadatos de Hugging Face): conviene verificar la integridad del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spriteman147/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en Hugging Face (reproductor de agentes): https://huggingface.co/unity
- Repositorio comunitario equivalente: https://huggingface.co/aiartwork/poca-SoccerTwos
- Repositorio comunitario equivalente: https://huggingface.co/akanametov/SoccerTwos
- Repositorio comunitario equivalente: https://huggingface.co/GesturingMan/poca-SoccerTwos
- Repositorio comunitario equivalente: https://huggingface.co/NoNameFound/poca-SoccerTwos
