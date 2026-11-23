# VicMont2/ppo-Huggy

## Resumen

`VicMont2/ppo-Huggy` no es un modelo de lenguaje, sino una política de aprendizaje por refuerzo entrenada con el algoritmo PPO (Proximal Policy Optimization) dentro del entorno Huggy de Unity ML-Agents. El agente aprende a controlar un perro virtual que debe perseguir y recuperar un palo, una tarea de control motor continuo con observaciones y acciones de baja dimensionalidad. Lo publica el usuario VicMont2 en Hugging Face como artefacto de un ejercicio de entrenamiento, no como un modelo de propósito general.

El interés del artefacto es fundamentalmente didáctico: sirve como ejemplo reproducible de un pipeline completo de ML-Agents (entrenamiento, exportación a `.nn`/`.onnx`, publicación en el Hub y visualización en el navegador mediante el visor de Unity en Hugging Face). No dispone de model card técnica con hiperparámetros, curvas de recompensa ni detalles del dataset de entrenamiento, y el repositorio ocupa 0,2 GB, lo que sugiere que incluye checkpoints intermedios además del modelo final.

Es relevante ahora únicamente en el contexto de la comunidad de deep RL que usa ML-Agents como banco de pruebas: permite inspeccionar una política PPO ya entrenada, reanudar el entrenamiento o comparar el comportamiento del agente en el visor web sin necesidad de infraestructura local. No debe confundirse con un LLM ni usarse para tareas de generación de texto, código o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre red neuronal implementada con Unity ML-Agents; topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los artefactos ML-Agents se exportan a `.nn` y `.onnx`; no hay cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` (según la model card) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (clipping) que estabiliza las actualizaciones on-policy. La política y la función de valor se implementan como redes neuronales densas dentro del toolkit ML-Agents, que separa observaciones vectoriales y visuales; en el entorno Huggy las observaciones son vectoriales (posición y velocidad del perro, del palo y del objetivo) y las acciones son continuas. La model card no especifica el número de capas, unidades por capa, tasa de aprendizaje, tamaño de lote, número de entornos en paralelo ni número total de pasos de entrenamiento.

Tampoco se documentan la composición del dataset (en RL no hay dataset estático, sino experiencia generada por interacción con el entorno), las recompensas configuradas, el número de episodios ni si se aplicaron técnicas auxiliares como recompensas de curiosidad, normalización de observaciones o currículum de dificultad. El repositorio incluye, por los tags, artefactos de TensorBoard, lo que permitiría inspeccionar curvas de entrenamiento si se descargan, pero no se han publicado resultados en la información disponible.

## Capacidades

- Control motor continuo en el entorno Huggy de Unity ML-Agents: el agente genera acciones de movimiento para que el perro virtual persiga y recupere el palo.
- Inferencia en el navegador a través del visor de Unity en Hugging Face, cargando el archivo `.nn` o `.onnx` del repositorio.
- Reanudación del entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume`, lo que permite continuar el aprendizaje desde el checkpoint publicado.
- Exportación a ONNX para integrar la política en otros runtimes de inferencia.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general ni capacidades multilingües.

## Casos de uso

- Docencia de deep reinforcement learning: usar el agente como ejemplo resuelto de PPO en ML-Agents para que los alumnos comparen su propia política con una ya entrenada y entiendan el ciclo observación-acción-recompensa.
- Reproducción de tutoriales de Hugging Face: el modelo encaja en el tutorial corto de "enseñar a Huggy a buscar el palo" y en la unidad 5 del curso de deep RL, sirviendo como referencia de un entrenamiento completado.
- Demostración en navegador sin instalación: cargar el `.onnx` en el visor de Unity de Hugging Face permite mostrar el comportamiento del agente en una charla o clase sin GPU ni entorno local.
- Reanudación y ajuste fino: partir del checkpoint publicado y continuar el entrenamiento con una configuración modificada (por ejemplo, cambiar recompensas o añadir aleatorización) para estudiar la sensibilidad del algoritmo.
- Integración en pipelines de CI de ML-Agents: usar el artefacto como caso de prueba para validar que un pipeline de exportación a ONNX y publicación en el Hub funciona de extremo a extremo.
- Comparación de políticas: enfrentar esta política PPO con otras políticas entrenadas en el mismo entorno para analizar estabilidad, varianza de recompensa y tiempo hasta convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media por episodio, tasa de éxito en la tarea de recuperar el palo, número de pasos hasta convergencia ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una política ML-Agents de observaciones vectoriales suele ocupar del orden de megabytes, aunque el tamaño exacto no está disponible.
- GPU recomendadas: no es necesario GPU para inferencia; cualquier CPU moderna puede ejecutar la política. Para reanudar el entrenamiento se recomienda una GPU con al menos 4-8 GB de VRAM, aunque el dato no está confirmado en la información disponible.
- Cabe en cualquier GPU consumer, e incluso en CPU, dado el reducido tamaño del repositorio (0,2 GB, que incluye checkpoints y logs).
- Opciones de despliegue: visor de Unity en Hugging Face (navegador), `mlagents-learn` para reanudar entrenamiento, y runtime ONNX (onnxruntime) para inferencia embebida.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del bucle de simulación del entorno, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| VicMont2/ppo-Huggy | PPO (ML-Agents) | Huggy | no disponible | Hugging Face |
| Políticas PPO de la organización Unity en el Hub | PPO (ML-Agents) | Varios entornos oficiales (Huggy, Walker, Crawler, etc.) | generalmente permisiva, pero no verificada aquí | Hugging Face (org. unity) |
| Políticas SAC de ML-Agents en el Hub | SAC (ML-Agents) | Varios entornos oficiales | variable según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo (recompensa media, tasa de éxito) entre estas políticas en la información proporcionada, por lo que la comparación se limita a tipo de algoritmo, entorno y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Sesgos conocidos: no documentados; en RL, el comportamiento depende por completo de la función de recompensa y del entorno de entrenamiento, y puede explotar atajos no previstos.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la política puede producir comportamientos erráticos fuera de la distribución de estados vista durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el agente solo funciona en el entorno Huggy o en entornos con el mismo espacio de observación y acción.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Caveat para producción: es un artefacto de ejercicio didáctico con 0 descargas y 0 likes en el momento de la consulta; no hay garantías de calidad, mantenimiento ni soporte.
- El repositorio incluye logs de TensorBoard y checkpoints, pero no se ha verificado qué archivo corresponde al modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VicMont2/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Unity en Hugging Face: https://huggingface.co/unity
