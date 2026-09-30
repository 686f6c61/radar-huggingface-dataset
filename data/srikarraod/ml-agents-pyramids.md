# Srikarraod/ml-agents-Pyramids

## Resumen

ml-agents-Pyramids es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Pyramids de Unity ML-Agents. Lo publica el usuario Srikarraod en Hugging Face y se enmarca explicitamente como entrega de la Unidad 5 del curso Deep Reinforcement Learning de Hugging Face. No es un modelo de lenguaje: es una politica neuronal que controla un agente dentro de una simulacion 3D concreta, en la que el objetivo es localizar y desplazar una piramide hasta una zona designada.

El modelo se distribuye a traves del repositorio de Hugging Face con la libreria `ml-agents` como dependencia de ejecucion y la etiqueta `reinforcement-learning`. La model card indica una recompensa media de evaluacion de 15,00 +/- 3,00 en el entorno ML-Agents-Pyramids, un valor no verificado por Hugging Face. No se documentan parametros totales, arquitectura interna de la red, numero de pasos de entrenamiento ni configuracion de hiperparametros.

Su relevancia es fundamentalmente formativa y de referencia: sirve como ejemplo reproducible de como entrenar, evaluar y publicar un agente PPO con ML-Agents en el Hub, y como punto de comparacion frente a otros agentes publicados para el mismo entorno (FlowKal, unity). No esta pensado para tareas de generacion de texto, razonamiento ni codigo, y carece de aplicacion fuera de la simulacion para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica y valor entrenada con PPO; topologia concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el agente consume observaciones por paso de simulacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion proporcionada; el ecosistema ml-agents exporta politicas a ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, el algoritmo de gradiente de politica con recorte de la razon de probabilidades que ML-Agents usa por defecto en sus entornos de ejemplo. PPO alterna la recoleccion de trayectorias en paralelo (multiples copias del entorno) con varias epocas de optimizacion sobre el objetivo recortado, usando una funcion de valor como linea base para reducir la varianza del estimador de ventaja. La red suele componerse de un tronco compartido o separado para politica y valor, con capas densas sobre las observaciones vectoriales o convolucionales y una cabeza adicional en entornos con observaciones visuales.

No se dispone de informacion sobre el numero de pasos de entrenamiento, el tamano del buffer, la tasa de aprendizaje, el numero de entornos paralelos ni la composicion exacta de las observaciones del entorno Pyramids. La model card solo indica el resultado de evaluacion (recompensa media 15,00 +/- 3,00) y que el entrenamiento se realizo con la libreria `ml-agents` en el marco del curso Deep RL de Hugging Face, Unidad 5. No se documenta ninguna innovacion tecnica adicional (por ejemplo, decodificacion especulativa, atencion lineal o tecnicas hibridas), ya que no aplican a este tipo de politica.

## Capacidades

- Control de un agente dentro del entorno de simulacion Pyramids de Unity ML-Agents.
- Navegacion y busqueda de objetos en un espacio 3D simulado como parte de la tarea del entorno.
- Manipulacion de un objeto (la piramide) para desplazarlo hacia la zona objetivo, segun la mecanica estandar de dicho entorno.
- Politica entrenada con PPO, ejecutable de forma determinista o estocastica segun la configuracion de inferencia.
- Soporte de tool calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio, generacion de texto o codigo): no disponible.

## Casos de uso

- Reproduccion de resultados del curso Deep RL de Hugging Face: cargar el agente en ML-Agents y verificar la recompensa media reportada como ejercicio de validacion de la Unidad 5.
- Referencia docente para practicas de aprendizaje por refuerzo: comparar la curva de recompensa de este agente con la de otros agentes publicados para el mismo entorno (FlowKal, unity) para ilustrar la varianza entre ejecuciones de PPO.
- Punto de partida para fine-tuning con curriculum: reutilizar los pesos como inicializacion y aplicar un curriculum de dificultad creciente en Pyramids para estudiar si mejora la recompensa final.
- Ablacion de hiperparametros de PPO: usar este agente como linea base congelada mientras se varian parametros como `learning_rate`, `batch_size` o `num_epoch` y se mide el impacto en la recompensa media.
- Pruebas de exportacion e inferencia en ONNX: exportar la politica y medir latencia de decision por paso en CPU y GPU, util para validar pipelines de despliegue de agentes de RL.
- Demostracion de integracion con el Hub: ejemplo minimo de como publicar un agente ML-Agents con `model-index` y metadatos de evaluacion para que sea reproducible por terceros.
- Benchmark interno de estabilidad de PPO: repetir el entrenamiento con varias semillas y contrastar la dispersion de la recompensa frente al 15,00 +/- 3,00 reportado.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados por Hugging Face):

| Tarea | Entorno / dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | ML-Agents-Pyramids | mean_reward | 15,00 +/- 3,00 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), lo cual es esperable dado que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una politica de RL para un entorno de simulacion, el consumo tipico de memoria de la red es de decenas de megabytes, muy inferior al de un modelo de lenguaje, pero no se confirma ningun dato en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada. ML-Agents puede entrenar y ejecutar politicas en CPU o en GPU; la eleccion depende del tipo de observaciones (vectoriales frente a visuales) y del numero de entornos paralelos.
- Compatibilidad con GPU de consumo: no confirmada. En la practica, los agentes ML-Agents de este tipo suelen ser ejecutables en GPU de consumo e incluso en CPU, pero no hay datos publicados para este modelo concreto.
- Opciones de despliegue: la libreria declarada es `ml-agents`; el ecosistema ML-Agents exporta politicas a ONNX para su uso en Unity o mediante ONNX Runtime. No se documentan otras opciones (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Entorno | Libreria | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Srikarraod/ml-agents-Pyramids | ML-Agents-Pyramids | ml-agents | mean_reward 15,00 +/- 3,00 | no disponible | Hugging Face |
| FlowKal/ML-Agents-Pyramids | Pyramids | ml-agents | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| unity/ML-Agents-Pyramids | ML-Agents-Pyramids | unity-ml-agents | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face |

Los tres comparten tarea y entorno, por lo que la comparacion relevante es la recompensa media obtenida, dato que solo se ha publicado para el modelo objeto de esta ficha. No se dispone de informacion sobre el numero de parametros, el contexto ni el rendimiento de las alternativas.

## Limitaciones y advertencias

- Ambito restringido: el agente solo es valido para el entorno ML-Agents-Pyramids. No generaliza a otros entornos, tareas ni dominios.
- Metrica no verificada: la recompensa 15,00 +/- 3,00 procede del `model-index` declarado por el autor y no ha sido validada por Hugging Face ni por un tercero.
- Sin datos de entrenamiento: no se documentan pasos, semillas, hiperparametros ni composicion del dataset de entrenamiento, lo que dificulta la reproducibilidad.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso en produccion.
- Sin informacion de sesgos: no se ha publicado ningun analisis de sesgos, y en un agente de RL el concepto se traslada a comportamientos indeseados o politicas degeneradas dentro de la simulacion.
- Riesgo de sobreajuste al entorno: al ser una entrega de curso, es probable que el agente este ajustado a la configuracion concreta del entorno y no resista variaciones de la simulacion, aunque esto no se confirma en la documentacion.
- Sin datos de hardware ni latencia: no se puede dimensionar el despliegue a partir de la informacion disponible.
- Cero adopcion registrada: el repositorio muestra 0 descargas y 0 likes, por lo que no hay evidencia externa de funcionamiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srikarraod/ml-agents-Pyramids
- Agente comparable de FlowKal: https://huggingface.co/FlowKal/ML-Agents-Pyramids
- Agente comparable de Unity: https://huggingface.co/unity/ML-Agents-Pyramids
- Curso Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course/en/unit0/introduction
- Demos del entorno Pyramids en el repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents/tree/develop/Project/Assets/ML-Agents/Examples/Pyramids/Demos
- Ficha en AIBase: https://model.aibase.com/models/details/1915692624381632514
