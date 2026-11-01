# Vladprime/ppo-SnowballTarget

## Resumen

PPO-SnowballTarget es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno SnowballTarget de Unity ML-Agents, dentro del marco del curso oficial Deep RL de Hugging Face. Lo desarrolla Vlad Kolomiiets (usuario `Vladprime`) como entrega de las unidades 5 y 7 de dicho curso, que exigen publicar un modelo entrenado sin umbral de recompensa mínimo. No es un modelo de lenguaje: es una política neuronal que controla un agente en un entorno de simulación 3D.

El entrenamiento parte de inicialización aleatoria, sin pesos preentrenados, con ML-Agents 1.1.0 y 30.000 pasos de entorno configurados (semilla 20261101). El resultado es una política exportada en formato ONNX nativo de ML-Agents, acompañada de checkpoint de PyTorch y fichero de configuración del entrenador. La evaluación independiente, con semilla 1000000 y 44 episodios completados, arroja una recompensa media de 6,6364 con desviación típica de 2,0790.

Su relevancia es acotada y de carácter didáctico: sirve como referencia reproducible de un pipeline completo de entrenamiento y exportación en ML-Agents, y como ejemplo de integración con el visor Unity del curso. El autor declara explícitamente que es una ejecución inicial y que no se reclama convergencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ML-Agents) y checkpoint de PyTorch |

## Arquitectura y entrenamiento

El modelo implementa una política PPO estándar de Unity ML-Agents sobre el entorno SnowballTarget, un escenario de control con espacio de acciones y observaciones propio del entorno original, que se ha conservado sin modificaciones. El entrenamiento se realizó desde inicialización aleatoria, sin pesos preentrenados, con la versión 1.1.0 de ML-Agents y 30.000 pasos de entorno configurados bajo la semilla 20261101. La configuración exacta del entrenador está disponible en el fichero `config.yaml` del repositorio, y el código de entrenamiento y evaluación en `train-unity.py`.

La evaluación se ejecutó como un proceso ONNX separado con semilla 1000000, completando 44 episodios de agente con recompensa media de 6,6364 y desviación típica de 2,0790. El autor indica que se trata de una ejecución inicial sin pretensión de convergencia y remite a `results.json` para los retornos individuales y las limitaciones de la evaluación. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal ni mecanismos similares), dado que no aplican a este tipo de política.

## Capacidades

- Control de agente en el entorno SnowballTarget de Unity ML-Agents mediante política PPO entrenada.
- Exportación a ONNX compatible con el visor Unity en navegador del curso Deep RL de Hugging Face.
- Conservación de los espacios de acción y observación originales del entorno.
- Ejecución de inferencia independiente del proceso de entrenamiento (evaluación ONNX separada).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes multi-paso fuera del bucle de decisión del propio entorno.
- Sin capacidades multilingües (no es un modelo de lenguaje).
- Sin modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Reproducción del pipeline de entrenamiento: usar `train-unity.py` y `config.yaml` para replicar el entrenamiento PPO con la misma semilla y verificar la recompensa media reportada.
- Docencia en aprendizaje por refuerzo: ejemplo mínimo y completo de las unidades 5 y 7 del curso Deep RL de Hugging Face, con exportación ONNX incluida.
- Validación del visor Unity del curso: cargar el fichero ONNX en el visor de navegador para comprobar la compatibilidad del formato exportado.
- Prueba de integración ML-Agents 1.1.0: referencia de compatibilidad entre esa versión del toolkit, la exportación ONNX y el checkpoint de PyTorch.
- Punto de partida para ajuste fino: reanudar el entrenamiento desde el checkpoint de PyTorch para aumentar los pasos de entorno y evaluar la evolución de la recompensa media.
- Comparación de semillas y variabilidad: emplear la evaluación con semilla 1000000 y los retornos individuales de `results.json` como línea base para medir la varianza entre ejecuciones.
- Verificación de exportación ONNX en CI: usar el modelo como caso de prueba de que el pipeline de exportación de ML-Agents produce artefactos cargables en un runtime ONNX.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por un tercero):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | ML-Agents-SnowballTarget | mean_reward | 6,6364 +/- 2,0790 |

La evaluación se realizó con semilla 1000000 sobre 44 episodios completados de agente. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto de muy pequeño tamaño, pero no se especifica la topología de la red.
- GPU recomendadas: no disponibles; para el visor Unity en navegador la inferencia ONNX se ejecuta en el cliente, sin requisitos de GPU de servidor documentados.
- GPU de consumo: no se documenta compatibilidad específica con RTX 4090, RTX 3090 u otras; por el tamaño del artefacto es previsible que quepa en cualquier GPU de consumo, pero es una inferencia no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (formato exportado por ML-Agents), visor Unity del curso Deep RL y checkpoint de PyTorch para reanudar entrenamiento con ML-Agents 1.1.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Otros agentes PPO publicados para entornos ML-Agents del curso Deep RL podrían servir de referencia, pero no se han facilitado datos de parámetros, contexto ni rendimiento de alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PPO-SnowballTarget | no disponible | no aplica | mean_reward 6,6364 +/- 2,0790 | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara explícitamente que es una ejecución inicial de entrenamiento y que no se reclama convergencia del agente.
- Solo 30.000 pasos de entorno configurados: volumen bajo para un entrenamiento PPO estable en la mayoría de entornos.
- La evaluación se limita a 44 episodios con una única semilla (1000000); la desviación típica de 2,0790 sobre una media de 6,6364 indica alta variabilidad y un intervalo de confianza amplio.
- El resultado del benchmark está marcado como no verificado (`verified: false`) en la model-index.
- El modelo solo es válido para el entorno SnowballTarget con los espacios de acción y observación originales; no generaliza a otras tareas.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución más allá de lo que revela la varianza entre episodios.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- No debe interpretarse como un modelo de lenguaje ni usarse en tareas de generación de texto, código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vladprime/ppo-SnowballTarget
- Curso Deep RL de Hugging Face (contexto del entrenamiento): https://huggingface.co/learn/deep-rl-course
- Unity ML-Agents (toolkit, versión 1.1.0 utilizada): https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/
