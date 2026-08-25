# team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200ep-smolvla_fft-steps60k-decay60k

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face y descrito en el articulo de referencia (arxiv:2506.01844). Esta ficha corresponde a un ajuste fino (fine-tune) de la base `lerobot/smolvla_base` realizado por el equipo TeamSOBITS para controlar un robot movil manipulador SOBIT HOME en una tarea de recoger una pera y colocarla sobre un bol. El modelo se ha entrenado con el framework LeRobot y esta disenado para ejecutarse en hardware de consumo, lo que lo hace relevante para la investigacion en robotica y la ensenanza de politicas de imitacion.

El modelo tiene 450 millones de parametros, una arquitectura VLA que combina un codificador visual con un modelo de lenguaje para generar acciones de control a partir de observaciones de camara y estado del robot. La ventana de contexto no esta documentada en la informacion disponible, aunque se trata de un modelo compacto pensado para inferencia eficiente. El repositorio contiene los pesos en formato safetensors y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, sin especificacion de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura compacta de vision-lenguaje-accion que integra un modelo de lenguaje preentrenado con un codificador visual para procesar imagenes de camara y generar acciones de control de robot. En este caso, el ajuste fino se realizo con full fine-tuning (FFT) sobre el modelo base `lerobot/smolvla_base`, durante 60.000 pasos con un decaimiento de tasa de aprendizaje hasta el paso 60.000. Se utilizo el optimizador AdamW con una tasa de aprendizaje de 0,0001 y un tamano de lote de 16.

El entrenamiento se llevo a cabo con el dataset `team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200ep`, que contiene 200 episodios y 22.588 frames a 10 FPS, recopilados en simulacion con el robot SOBIT HOME. La tarea especifica es "Pick up the pear and place it over the bowl". No se menciona el uso de tecnicas como RLHF o DPO; se trata de un aprendizaje por imitacion supervisada. El modelo fue entrenado con la libreria LeRobot en su version 0.6.0.

## Capacidades

- Generacion de acciones de control para un robot movil manipulador con dos camaras (camara de cabeza y camara de mano izquierda).
- Procesamiento de observaciones de estado del robot con 20 dimensiones y generacion de acciones de 20 dimensiones.
- Ejecucion de tareas de manipulacion pick-and-place en entornos simulados.
- Capacidad de inferencia en tiempo real (10 FPS de datos de entrenamiento) sobre hardware de consumo.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- No se han documentado capacidades de tool calling, agentes o razonamiento multimodal general; es una politica de robotica especifica.

## Casos de uso

- Automatizacion de tareas domesticas en simulacion: el modelo puede controlar un robot movil para recoger objetos (como una pera) y colocarlos en ubicaciones determinadas (un bol), ideal para pruebas en entornos simulados antes de transferir a un robot fisico.
- Desarrollo de politicas de imitacion en robotica: los investigadores pueden usar este modelo como referencia para entrenar nuevas tareas con LeRobot, ajustando el dataset y los hiperparametros.
- Evaluacion de VLA en hardware de consumo: al ser un modelo compacto (450M parametros), permite validar tecnicas de control en GPU consumer-grade, sin necesidad de infraestructura de alto coste.
- Integracion en sistemas de teleoperacion: el modelo puede desplegarse en un robot SOBIT HOME para ejecutar la tarea de forma autonoma, con camaras montadas en la cabeza y en la mano.
- Benchmarking de metodos de fine-tuning: comparar el rendimiento de este ajuste con otros basados en SmolVLA (por ejemplo, variantes con 30k pasos) para estudiar el efecto del numero de pasos de entrenamiento.
- Ensayo de estrategias de despliegue con LeRobot: la politica se puede cargar con `lerobot-rollout` para pruebas de duracion determinada o indefinida, lo que facilita la validacion en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- Al tener 450 millones de parametros, el modelo puede ejecutarse en GPU de consumo de 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, RTX 4090) con pesos en precision fp32 o fp16, aunque no se proporciona una estimacion exacta.
- La arquitectura SmolVLA esta disenada para ser eficiente y desplegable en hardware de consumo, segun el paper original.
- El despliegue se realiza mediante la libreria LeRobot, usando comandos como `lerobot-rollout` para la inferencia y `lerobot-train` para el entrenamiento.
- No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama; el modelo esta pensado para el ecosistema LeRobot.
- La latencia y el rendimiento dependen del hardware y de la configuracion de camaras; no hay datos publicados al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lerobot/smolvla_base` (modelo base) | 450M | no disponible | Apache-2.0 | Hugging Face |
| Este modelo (fine-tune SOBITS) | 450M | no disponible | Apache-2.0 | Hugging Face |
| Otros fine-tunes de SmolVLA (p. ej. 30k pasos) | 450M | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento con otros VLA (por ejemplo, OpenVLA o RT-2) en la informacion disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente en simulacion (el nombre del dataset incluye "sim"), por lo que su transferencia a un robot real puede requerir ajustes adicionales o sufrir degradacion de rendimiento.
- No se han publicado resultados de evaluacion en el robot real, lo que limita la confianza en su comportamiento en entornos no controlados.
- La tarea es muy especifica (recoger una pera y colocarla sobre un bol); el modelo no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuracion de camaras y del estado del robot; cambios en la iluminacion, posicion de la camara o calibracion pueden afectar el rendimiento.
- No hay informacion sobre sesgos, alucinaciones o riesgos de seguridad en el contexto de robotica; se recomienda evaluar en entornos de prueba antes de cualquier uso en produccion.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar el metodo original y LeRobot segun la indicacion de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200ep-smolvla_fft-steps60k-decay60k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200ep
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de LeRobot para smolvla: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de TeamSOBITS en GitHub: https://github.com/TeamSOBITS
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
