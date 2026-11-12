# WyattBridges/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una política de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de referencia en el que un agente controla a un personaje en un laberinto 3D en primera persona con el objetivo de recoger paquetes de salud antes de que se agoten sus puntos de vida. El modelo ha sido entrenado y publicado con Sample-Factory 2.0, la librería de RL asíncrona y distribuida desarrollada por Alex Petrenko, y se distribuye a través de Hugging Face Hub para su descarga y reproducción con los scripts `enjoy` y `train` de dicha librería.

No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un checkpoint de pesos de red neuronal (actor-crítico) destinado exclusivamente a inferencia o reentrenamiento dentro de un entorno simulado de ViZDoom. Su relevancia es, por tanto, docente y de investigación: sirve como referencia reproducible de un resultado de RL en un benchmark clásico, con una recompensa media declarada de 12,18 ± 4,83 sobre el episodio completo.

El repositorio es de tamaño reducido (aproximadamente 0,1 GB), no registra descargas ni interacciones en el momento de la consulta y no incluye información sobre licencia, idiomas ni arquitectura interna más allá de la etiqueta del algoritmo APPO y la librería Sample-Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política actor-crítico entrenada con APPO; detalles de capas no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint de Sample-Factory; el repositorio ocupa 0,1 GB) |

## Arquitectura y entrenamiento

La información publicada identifica el algoritmo de entrenamiento como APPO (Asynchronous Proximal Policy Optimization), implementado en Sample-Factory 2.0. APPO es una variante asíncrona y distribuida de PPO en la que los workers de recogida de experiencia y los de cálculo de gradientes se desacoplan mediante políticas con retardo (lagged policies) para mejorar el rendimiento en configuraciones multiproceso. El entorno es `doom_health_gathering_supreme`, un escenario de ViZDoom con observaciones visuales en primera persona y recompensa basada en la recogida de botiquines y la supervivencia.

No se especifican en la información disponible el número de tokens o pasos de entorno consumidos durante el entrenamiento, la composición del dataset (en RL no aplica en el sentido habitual), ni si se emplearon técnicas adicionales como reward shaping, curricula o aumentos de observación. Tampoco se detalla la arquitectura concreta de la red (número de capas convolucionales, tamaño de las capas recurrentes, etc.), más allá de que se corresponde con la configuración por defecto de Sample-Factory para entornos ViZDoom.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme`: selección de acciones a partir de observaciones visuales en primera persona.
- Inferencia reproducible mediante el script `enjoy` de Sample-Factory con el algoritmo y entorno indicados.
- Reentrenamiento y ajuste fino: el checkpoint puede reanudarse con el script `train` y el flag `--restart_behavior=resume`.
- Publicación y carga desde Hugging Face Hub mediante `sample_factory.huggingface.load_from_hub`.
- Registro de métricas de entrenamiento compatibles con TensorBoard (etiqueta `tensorboard`).
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, agentes multietapa ni multilingüismo.

## Casos de uso

- Reproducción de resultados de referencia: descargar el checkpoint y ejecutar `enjoy` para verificar la recompensa media declarada (12,18 ± 4,83) en `doom_health_gathering_supreme`, como línea base en experimentos comparativos.
- Docencia de RL profundo: usar el modelo como ejemplo funcional de un pipeline completo (entrenamiento APPO, evaluación, publicación en Hub) en cursos y talleres.
- Punto de partida para ajuste fino: reanudar el entrenamiento con `--restart_behavior=resume` para probar variantes de hiperparámetros, recompensas o arquitecturas partiendo de una política ya competente.
- Investigación en RL asíncrono: comparar el rendimiento de APPO frente a otras variantes de PPO o algoritmos off-policy en el mismo entorno usando este checkpoint como referencia.
- Evaluación de robustez visual: someter al agente a perturbaciones en las observaciones (ruido, cambios de textura, variaciones de iluminación) para estudiar la generalización de políticas entrenadas en ViZDoom.
- Integración en pipelines de experimentación con Sample-Factory: automatizar la descarga, evaluación y reentrenamiento dentro de flujos de CI o scripts de barrido de hiperparámetros.
- Demostraciones interactivas: ejecutar el agente en una instancia local de ViZDoom para mostrar comportamiento aprendido en charlas o materiales divulgativos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,18 +/- 4,83 |

No se han publicado en la información disponible resultados comparativos con otros algoritmos, semillas o configuraciones sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, por lo que el checkpoint es ligero y probablemente quepa en GPUs de gama baja, aunque no se especifica el consumo real.
- GPU recomendadas: no disponible. Sample-Factory soporta ejecución en CPU y GPU; para ViZDoom con observaciones visuales se recomienda una GPU con al menos varios GB de VRAM, pero no hay datos oficiales en la información proporcionada.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), con soporte de carga desde Hugging Face Hub mediante `load_from_hub`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints comparables de APPO sobre `doom_health_gathering_supreme` ni referencias a políticas alternativas (por ejemplo, PPO, DQN o IMPALA) en el mismo entorno con las que establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es transferible a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje ni multimodal: no genera texto, no razona simbólicamente y no procesa instrucciones en lenguaje natural.
- La licencia no está declarada en la información disponible, por lo que se desconoce si se permite uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- El resultado de recompensa media (12,18 ± 4,83) está declarado como no verificado y procede de una única configuración de evaluación; la varianza es elevada en relación con la media.
- No se documentan semillas, número de episodios de evaluación ni configuración exacta del entorno, lo que limita la reproducibilidad estricta.
- No se detallan sesgos, riesgos de alucinación (no aplica) ni limitaciones idiomáticas (no aplica).
- Al ser un checkpoint de RL, cualquier despliegue en producción requeriría integrarlo con el simulador ViZDoom y gestionar la infraestructura de ejecución correspondiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WyattBridges/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Documentación de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
