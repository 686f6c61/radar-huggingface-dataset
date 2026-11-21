# Takeshi7172/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de referencia habitual en cursos de RL. No es un modelo de lenguaje: es una política neuronal que juega a un entorno 3D en primera persona con observaciones visuales, desarrollada por el usuario Takeshi7172 como material didáctico dentro de un curso de reinforcement learning.

El artefacto se distribuye a través de Sample-Factory 2.0, el framework de RL asíncrono de Alex Petrenko, y se publica en el Hub con la librería `sample-factory`, lo que permite descargarlo, evaluarlo y reanudar el entrenamiento con los scripts estándar del framework (`load_from_hub`, `enjoy`, `train`). El checkpoint final corresponde a 4.005.888 pasos de entorno y se ha subido partido en dos mitades byte-exactas para sortear el límite de tamaño de subida, con un fichero `.sha256` para verificación.

Su relevancia es acotada y de carácter educativo: sirve como ejemplo reproducible de un pipeline completo de entrenamiento y publicación de agentes de RL en el Hub, y como punto de partida para practicar evaluación y continuación de entrenamiento. No debe confundirse con un modelo generativo ni emplearse en tareas de NLP, visión general o razonamiento simbólico. La información pública disponible es muy escasa: el repositorio pesa 0.0 GB, no tiene descargas ni likes, y la model card no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional + política/crítica para RL (algoritmo APPO); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL sobre observaciones del entorno, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `.pth`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (checkpoint de Sample-Factory), partido en dos ficheros `.part*` con `.sha256` asociado |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asíncrona de PPO implementada en Sample-Factory que desacopla los workers de recogida de experiencia de los de cálculo de gradientes mediante un buffer compartido y política de importancia. La política consume observaciones visuales del entorno ViZDoom (`doom_health_gathering_supreme`), un escenario en el que el agente debe recoger frascos de salud mientras esquiva o combate enemigos; la arquitectura concreta (número de capas convolucionales, tamaño de la capa recurrente, unidades del MLP) no se detalla en la información disponible.

El checkpoint final se alcanzó a los 4.005.888 pasos de entorno, y la model card indica que se ha eliminado el estado del optimizador, de modo que el fichero sirve para inferencia y para reanudar entrenamiento, aunque este último caso podría requerir reinicializar el optimizador. No se documentan la composición del dataset (generado por interacción con el simulador), el uso de recompensas moldeadas, ni hiperparámetros como la tasa de aprendizaje, el tamaño de lote o el número de workers. Tampoco se describe ninguna innovación técnica adicional más allá del propio algoritmo APPO y del empaquetado en dos partes para la subida al Hub.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme` a partir de observaciones visuales.
- Ejecución de políticas entrenadas mediante el script `enjoy` de Sample-Factory.
- Reanudación del entrenamiento desde el checkpoint con `--restart_behavior=resume`.
- Publicación y descarga a través del Hub con `sample_factory.huggingface.load_from_hub`.
- Registro de métricas en TensorBoard (tag `tensorboard` en el repositorio).
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Docencia en cursos de RL: el agente sirve como ejemplo reproducible de un pipeline completo (entrenamiento APPO, evaluación, publicación en el Hub) para que los alumnos comparen curvas de recompensa y entiendan el flujo de Sample-Factory.
- Evaluación de referencia en ViZDoom: ejecutar `enjoy` sobre este checkpoint permite obtener una línea base de recompensa media (10.22 ± 4.78) contra la que medir nuevas variantes de algoritmo o de hiperparámetros.
- Reanudación de experimentos: partir de este checkpoint con `--restart_behavior=resume` y `--train_for_env_steps` alto permite estudiar el efecto de continuar el entrenamiento más allá de los 4 millones de pasos.
- Pruebas de infraestructura de RL: validar que un clúster, contenedor o entorno de ejecución con Sample-Factory funciona correctamente antes de lanzar entrenamientos largos y costosos.
- Investigación en reproducibilidad: verificar la integridad del checkpoint mediante el `.sha256` y comparar la recompensa obtenida con la declarada por el autor, que está marcada como `verified: false`.
- Material para clases prácticas de empaquetado de modelos: ilustra cómo trocear un checkpoint grande en dos partes, documentar la reconstrucción con `cat` y publicar artefactos de RL en el Hub.
- Base para experimentos de comparación de algoritmos: sustituir APPO por PPO síncrono u otras variantes manteniendo el mismo entorno y comparar la recompensa media final.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10.22 ± 4.78 |

No se han publicado otros resultados de benchmarks en la información disponible, ni comparaciones con agentes alternativos sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política convolucional pequeña para ViZDoom, es previsible que quepa en GPUs de consumo, pero no se aporta cifra concreta.
- GPU recomendadas: no disponible. Sample-Factory funciona tanto en CPU como en GPU; para evaluación de un único agente, una GPU modesta suele ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU de consumo: probablemente sí, pero sin confirmación en la información disponible.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `load_from_hub`, `enjoy`, `train`); no se publican exportaciones a vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0.0 GB según el Hub; el checkpoint final está partido en dos ficheros que deben concatenarse antes de su uso.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos de entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Takeshi7172/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | 4.005.888 | 10.22 ± 4.78 | no disponible | Hugging Face Hub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros agentes públicos entrenados en el mismo entorno con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es un agente de RL específico para un único entorno de ViZDoom; no generaliza a otras tareas ni a otros juegos sin reentrenamiento.
- La recompensa declarada (10.22 ± 4.78) está marcada como no verificada por el autor; no debe tomarse como resultado validado de forma independiente.
- La licencia no está declarada, lo que impide asumir permisos de uso comercial o de redistribución derivada.
- El checkpoint se ha subido sin el estado del optimizador y partido en dos ficheros; es necesario reconstruirlo con `cat` y verificar el `.sha256` antes de usarlo, y la reanudación del entrenamiento puede requerir reinicializar el optimizador.
- No hay información sobre sesgos, alucinación (concepto no aplicable a un agente de RL) ni limitaciones idiomáticas, porque el modelo no procesa lenguaje.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha; no hay evidencia de validación por parte de la comunidad.
- No se documentan hiperparámetros, composición del dataset ni detalles de la arquitectura, lo que dificulta la reproducibilidad exacta del resultado.
- No debe emplearse como sustituto de un modelo de lenguaje ni en pipelines de generación de texto, código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takeshi7172/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- ViZDoom (entorno): no disponible en la información proporcionada
- Paper de APPO: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
