# wandelbotsgmbh/test_pipeline

## Resumen

El modelo `wandelbotsgmbh/test_pipeline` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por Wandelbots GmbH, empresa especializada en automatización industrial definida por software, y entrenado con el framework LeRobot de Hugging Face. El modelo se publica con licencia Apache-2.0 y está orientado a tareas de manipulación robótica a partir de datos teleoperados.

Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, este modelo es ligero y apto para ejecutarse en hardware de gama media. El nombre `test_pipeline` sugiere que se trata de una prueba de integración del pipeline de entrenamiento y publicación de LeRobot, más que de un modelo destinado a producción. No obstante, su arquitectura ACT es relevante para la comunidad de robótica por su eficiencia en aprendizaje a partir de pocas demostraciones y su capacidad para generar trayectorias suaves.

El modelo se ha entrenado sobre el dataset `wandelbotsgmbh/choreo3_noise`, que contiene datos de teleoperación con ruido añadido, probablemente para evaluar robustez. Su publicación en el Hub de Hugging Face permite reproducir el entrenamiento y la evaluación mediante las herramientas de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.623.559 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control motor, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformer codificador-decodificador. El codificador procesa observaciones visuales y del estado del robot, mientras que el decodificador genera un "chunk" de acciones futuras (tipicamente 10-100 pasos) en una sola pasada. Esta prediccion por lotes reduce el error de acumulacion tipico de los metodos autoregresivos y mejora la suavidad de las trayectorias. El metodo se describe en el paper arxiv:2304.13705.

El entrenamiento se ha realizado con el framework LeRobot, que implementa el pipeline completo de recogida de datos, entrenamiento y evaluacion. El dataset `wandelbotsgmbh/choreo3_noise` contiene demostraciones teleoperadas con ruido anadido, probablemente para probar la robustez del controlador. No se dispone de informacion sobre el numero de tokens de entrenamiento, el uso de RLHF/DPO ni otras tecnicas de optimizacion adicionales, ya que el modelo es una prueba de pipeline.

## Capacidades

- Control de robot manipulador: genera comandos de articulacion o de efector final a partir de observaciones visuales y de estado.
- Aprendizaje por imitacion: reproduce tareas demostradas por teleoperacion, como recoger y colocar objetos, ensamblaje o tareas de precision.
- Prediccion por chunks: produce secuencias de acciones de forma no autoregresiva, lo que reduce errores de acumulacion y genera movimientos mas fluidos.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot en robots como SO-100 o Koch.
- Robustez al ruido: el entrenamiento con datos ruidosos (choreo3_noise) sugiere cierta tolerancia a perturbaciones en las observaciones.
- No soporta tool calling, razonamiento multimodal ni procesamiento de lenguaje natural, al ser un modelo puramente motor.

## Casos de uso

- Automatizacion industrial de bajo volumen: el modelo puede programar brazos roboticos para tareas de pick-and-place o ensamblaje sin necesidad de programacion explicita, aprendiendo de demostraciones. Su tamano reducido permite desplegarlo en controladores embebidos.
- Pruebas de concepto en laboratorio: investigadores pueden usar este modelo como punto de partida para validar pipelines de aprendizaje por imitacion con LeRobot, gracias a su licencia Apache-2.0 y su formato safetensors.
- Evaluacion de robustez en entornos con ruido: dado el dataset con ruido, es adecuado para estudiar como afectan las perturbaciones en las observaciones al rendimiento de politicas ACT.
- Generacion de trayectorias para simulacion: el modelo puede ejecutarse en entornos simulados (por ejemplo, MuJoCo o Isaac Gym) para generar datos sinteticos de movimiento o para verificar algoritmos de planificacion.
- Educacion en robotica: al ser un ejemplo funcional de ACT con codigo de entrenamiento disponible, sirve como material didactico para ensenar aprendizaje por imitacion y transformers aplicados a robotica.
- Integracion en plataformas vendor-agnostic: Wandelbots NOVA puede incorporar este tipo de politicas para controlar robots de distintos fabricantes, simplificando el despliegue en fabricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como tasa de exito, precision de tarea ni comparativas con otros modelos. El repositorio no incluye datos de evaluacion cuantitativa.

## Requisitos de hardware

- VRAM estimada: con 51,6 millones de parametros en fp32, el modelo ocupa aproximadamente 206 MB. En fp16 serian unos 103 MB. La inferencia puede ejecutarse en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA GTX 1650 (4 GB) hasta una RTX 4090. Tambien puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual, incluso en placas integradas con suficiente RAM compartida.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion con `lerobot-record`. Se puede integrar en ROS mediante el adaptador de LeRobot. No hay soporte oficial para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo pequeno, se espera una latencia de milisegundos en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa rigurosa. Los modelos comparables serian otras politicas de aprendizaje por imitacion como Diffusion Policy (Chi et al., 2023) o ACT original (Zhao et al., 2023). Sin embargo, no se dispone de resultados de benchmarks ni de configuraciones equivalentes. Se puede indicar que ACT es el metodo base de este modelo, y que Diffusion Policy suele ofrecer mayor robustez a costa de mayor coste computacional, pero no hay datos concretos de este modelo en particular.

## Limitaciones y advertencias

- Modelo de prueba: el nombre `test_pipeline` y la ausencia de descargas y likes indican que es un artefacto de validacion, no un modelo listo para produccion.
- Sesgos y alucinaciones: al ser un modelo motor, no genera texto, por lo que no hay riesgo de alucinacion linguistica. Sin embargo, puede producir acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de contexto se limita al tamaño del chunk de acciones y a las observaciones actuales; no hay memoria a largo plazo.
- Idioma: no aplica, el modelo no procesa lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero debe incluirse el aviso de licencia correspondiente.
- Riesgo en produccion: sin evaluacion exhaustiva, no se recomienda su uso en robots fisicos sin validacion previa en simulacion y con supervisores de seguridad.
- Datos de entrenamiento: el dataset `choreo3_noise` incluye ruido, lo que puede limitar la precision en tareas que requieren alta exactitud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wandelbotsgmbh/test_pipeline
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot GitHub: https://github.com/huggingface/lerobot
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil de Wandelbots en HuggingFace: https://huggingface.co/wandelbotsgmbh
- Wandelbots NOVA: https://www.wandelbots.com/nova-portal
- Documentacion NOVA: https://docs.wandelbots.io/
