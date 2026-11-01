# Vladprime/ppo-PyramidsRND

## Resumen

Vladprime/ppo-PyramidsRND es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Pyramids del Unity ML-Agents Toolkit, en el marco del curso oficial Deep RL de Hugging Face. Lo desarrolla Vlad Kolomiiets (usuario `Vladprime`) y se publica como artefacto de las unidades 5 y 7 del curso, que exigen entregar un modelo entrenado sin umbral mínimo de recompensa. No es un modelo de lenguaje: es una política neuronal exportada a ONNX y un checkpoint de PyTorch que controla un agente dentro de una escena Unity.

El entrenamiento parte de inicialización aleatoria, sin pesos preentrenados, con 30 000 pasos de entorno configurados y semilla 20261101. El resultado declarado es una recompensa media de -0,8986 con desviación estándar de 0,4869 sobre 48 episodios completados en un proceso de evaluación separado con semilla 1000000. El propio autor advierte que es una ejecución inicial y que no reclama convergencia.

Su relevancia es fundamentalmente didáctica y de reproducibilidad: sirve como ejemplo mínimo verificable de un pipeline completo de ML-Agents (entrenamiento PPO, exportación ONNX, evaluación determinista) y como referencia para quienes siguen el curso o quieren inspeccionar la configuración exacta de un run de PPO en Unity.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (ML-Agents, algoritmo PPO); topología de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observaciones del entorno Unity) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, checkpoint de PyTorch y configuración del entrenador (`config.yaml`) |

## Arquitectura y entrenamiento

Se trata de una política entrenada con PPO mediante Unity ML-Agents 1.1.0 sobre el entorno Pyramids del Deep RL Course. El entrenamiento se lanzó desde inicialización aleatoria, sin transferencia desde pesos preentrenados, con 30 000 pasos de entorno configurados y semilla 20261101. La configuración exacta del run está en `config.yaml` y el código de entrenamiento y evaluación en `train-unity.py`. El nombre del repositorio incluye el sufijo `RND`, que en ML-Agents corresponde a Random Network Distillation (curiosidad intrínseca); sin embargo, la model card no detalla si dicha recompensa intrínseca estuvo activa ni con qué hiperparámetros, por lo que este punto queda como no confirmado.

La evaluación se realizó en un proceso ONNX independiente con semilla 1000000, completando 48 episodios de agente con retorno medio de -0,8986 y desviación estándar de 0,4869. Se conservaron los espacios de observación y acción originales del entorno. El autor indica explícitamente que es una ejecución inicial y que no se reclama convergencia; los retornos individuales y las limitaciones de la evaluación están documentados en `results.json`.

## Capacidades

- Control de agente en el entorno Unity Pyramids del Deep RL Course mediante política PPO exportada a ONNX.
- Inferencia compatible con el visor web de Unity del curso a partir del fichero `.onnx`.
- Evaluación determinista reproducible con semilla fija (1000000) y registro de retornos por episodio.
- Exportación a checkpoint de PyTorch para reanudar entrenamiento o inspección.
- Configuración de entrenamiento reproducible mediante `config.yaml` y `train-unity.py`.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling ni razonamiento multi-paso fuera del bucle de decisión del entorno.
- No dispone de capacidades multilingües ni de modo de pensamiento.

## Casos de uso

- Reproducción del pipeline del Deep RL Course: ejecutar `train-unity.py` con `config.yaml` para replicar el run con semilla 20261101 y comparar curvas en TensorBoard frente al resultado publicado.
- Verificación de exportación ONNX: cargar el `.onnx` en el visor web de Unity del curso para comprobar que la política se comporta de forma coherente con el checkpoint de PyTorch.
- Material docente para explicar PPO en ML-Agents: el par entrenamiento/evaluación separado con semillas distintas sirve para ilustrar la diferencia entre recompensa de entrenamiento y recompensa de evaluación.
- Punto de partida para experimentos de recompensa intrínseca: dado el sufijo RND del repositorio, sirve como baseline para comparar con y sin curiosidad intrínseca en Pyramids, siempre que se confirme la configuración efectiva.
- Pruebas de integración de ML-Agents 1.1.0: útil para validar en local que la cadena de exportación ONNX y el entorno Unity funcionan antes de abordar entornos más complejos.
- Referencia de evaluación honesta: el uso de `results.json` con retornos individuales y limitaciones documentadas es un ejemplo de buenas prácticas para reportar resultados no convergidos en trabajos académicos o de curso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset / entorno | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | ML-Agents-Pyramids | mean_reward | -0,8986 +/- 0,4869 |

Contexto de la medición: 48 episodios completados en un proceso de evaluación ONNX separado con semilla 1000000. No se han publicado en la información disponible resultados comparativos con otros agentes sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la topología de red no se detalla, por lo que no puede calcularse una cifra fiable.
- GPU recomendadas: no disponible. Para el entrenamiento con ML-Agents se suele usar GPU de gama media, pero la información proporcionada no especifica requisitos.
- GPU de consumo: previsiblemente ejecutable en GPU de consumo dada la escala del artefacto (30 000 pasos de entorno), aunque no hay confirmación en la documentación.
- Despliegue: Unity ML-Agents 1.1.0 para entrenamiento e inferencia en el entorno; ONNX Runtime o el visor web de Unity del curso para la política exportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vladprime/ppo-PyramidsRND | PPO (ML-Agents) | ML-Agents-Pyramids | mean_reward -0,8986 +/- 0,4869 | Apache 2.0 | HuggingFace |
| Otros agentes PPO del Deep RL Course | PPO (ML-Agents) | Pyramids | no disponible | variable | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el entrenamiento no ha convergido; la recompensa media es negativa (-0,8986) y la desviación estándar (0,4869) es elevada en relación con la media.
- Solo se completaron 48 episodios en evaluación, una muestra reducida que limita la significación estadística del resultado.
- El entrenamiento se limita a 30 000 pasos de entorno configurados, muy por debajo de lo habitual para obtener políticas estables en Pyramids.
- El sufijo `RND` del repositorio sugiere uso de Random Network Distillation, pero la model card no confirma la configuración de recompensa intrínseca; no debe asumirse sin revisar `config.yaml`.
- El modelo está acoplado al entorno, espacios de observación y acción concretos de ML-Agents-Pyramids; no es transferible a otras tareas sin reentrenamiento.
- No apto para producción en dominios reales: es un artefacto didáctico de curso, no una política validada para despliegue.
- Licencia Apache 2.0 permite uso comercial y modificación, pero al no existir garantías de rendimiento, cualquier uso comercial requeriría reentrenamiento y validación propios.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vladprime/ppo-PyramidsRND
- Curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course
- Unity ML-Agents Toolkit: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents 1.1.0: https://github.com/Unity-Technologies/ml-agents/tree/release_20_docs
- Repositorio del entorno Pyramids del curso: no disponible en la información proporcionada
- Paper de PPO: no referenciado en la información proporcionada
- Demo o espacio interactivo: no disponible; el visor web de Unity del curso se menciona en la model card sin URL
