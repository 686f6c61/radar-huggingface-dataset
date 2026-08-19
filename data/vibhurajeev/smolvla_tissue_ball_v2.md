# vibhurajeev/smolvla_tissue_ball_v2

## Resumen

El modelo `vibhurajeev/smolvla_tissue_ball_v2` es un fine-tuning del modelo base `lerobot/smolvla_base`, desarrollado por el autor `vibhurajeev` para la tarea de robótica "Pick the tissue ball" (recoger una bola de papel). SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, creado por Hugging Face, con 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo. Este fine-tuning concreto está entrenado con el dataset `vibhurajeev/pick_tissue_ball_v2_20260817_184026`, que contiene 60 episodios y 20 276 fotogramas, y se ha ajustado para controlar un robot tipo `so_follower` con dos cámaras.

El modelo resuelve el problema de control robótico por imitación: a partir de observaciones visuales (tres cámaras) y del estado del robot (6 dimensiones), genera una secuencia de acciones (6 dimensiones) para completar la tarea. Su relevancia actual radica en que demuestra cómo un VLA pequeño puede adaptarse a tareas específicas con un coste computacional reducido, facilitando su despliegue en entornos de investigación y prototipado con recursos limitados. La arquitectura combina un modelo de lenguaje y visión compacto con un experto de acciones basado en flow matching, lo que permite una inferencia eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, VLM compacto + experto de acciones con flow matching) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un modelo de lenguaje y visión (VLM) preentrenado y compacto con un "experto de acciones" entrenado mediante flow matching. Dado un conjunto de imágenes y una instrucción en lenguaje natural, el modelo genera un bloque de acciones (chunk) para el robot. En este fine-tuning, el modelo base `lerobot/smolvla_base` se ajustó con el dataset propio del autor, que contiene 60 episodios de demostración de la tarea "Pick the tissue ball", con una frecuencia de 30 FPS y un total de 20 276 fotogramas.

El entrenamiento se realizó con la librería LeRobot (versión 0.6.2) durante 20 000 pasos, con un tamaño de lote de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001. Las observaciones de entrada incluyen el estado del robot (vector de 6 dimensiones) y tres imágenes de cámaras (256×256 píxeles, 3 canales), mientras que la salida es un vector de acción de 6 dimensiones. No se especifica el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 grados de libertad a partir de observaciones visuales y del estado del robot.
- Procesamiento multimodal: integra tres flujos de imagen (camaras) y un vector de estado para producir comandos de movimiento.
- Ejecucion en tiempo real: al ser un modelo compacto (450M parametros), es adecuado para inferencia con baja latencia en hardware de consumo.
- Adaptabilidad a tareas especificas: al ser un fine-tuning, puede especializarse en una tarea concreta con un dataset reducido (60 episodios).
- Compatibilidad con LeRobot: se integra con el ecosistema de LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- No incluye capacidades de lenguaje general ni generacion de texto; su salida es exclusivamente una secuencia de acciones.

## Casos de uso

- Automatizacion de tareas de manipulacion en laboratorio: el modelo puede controlar un brazo robotico para recoger objetos pequenos (como una bola de papel) en entornos de investigacion, reduciendo la intervencion manual.
- Prototipado rapido de politicas robotica: gracias a su tamano reducido, permite iterar rapidamente en nuevas tareas de manipulacion con datasets de pocas decenas de episodios, ideal para pruebas de concepto.
- Educacion y formacion en robotica: al ejecutarse en GPUs de consumo, puede utilizarse en cursos o talleres para ensenar aprendizaje por imitacion sin necesidad de infraestructura cara.
- Evaluacion de algoritmos de control: sirve como punto de partida para comparar tecnicas de flow matching, arquitecturas VLA o estrategias de aumento de datos en manipulacion.
- Despliegue en robots de bajo coste: el robot `so_follower` es un sistema de bajo coste; este modelo encaja en ese perfil, permitiendo experimentos con presupuestos limitados.
- Base para fine-tuning en tareas similares: dado que esta entrenado para recoger objetos, puede ser reutilizado como inicializacion para otras tareas de agarre o traslado de objetos, ahorrando tiempo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica que no se han proporcionado resultados de evaluacion en robot real para esta politica. Tampoco se dispone de comparaciones cuantitativas con otros modelos en esta tarea especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 450M parametros y un tamano de repo de 0,9 GB, por lo que es razonable esperar que quepa en GPUs con 4-6 GB de VRAM, pero no se proporcionan datos oficiales.
- GPU recomendadas: no se especifican. Dado el tamano, GPUs de consumo como RTX 3060, RTX 4060 o superiores deberian ser suficientes, pero no hay confirmacion.
- Compatibilidad con consumer GPU: probablemente si, ya que SmolVLA esta disenado para hardware de consumo, pero no se indica explicitamente para este fine-tuning.
- Opciones de despliegue: el modelo se utiliza a traves de LeRobot, con comandos como `lerobot-rollout` y `lerobot-train`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A nivel de arquitectura, SmolVLA se posiciona frente a otros VLA como OpenVLA (7B parametros) o RT-2 (55B parametros), pero este fine-tuning es mucho mas pequeno y especifico. No hay informacion sobre benchmarks comunes (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje general. La comparacion relevante seria con otros VLA para robotica, pero no se proporcionan metricas en la informacion disponible.

## Limitaciones y advertencias

- Especificidad de la tarea: el modelo esta entrenado exclusivamente para la tarea "Pick the tissue ball" con un robot `so_follower` y dos camaras concretas. No generaliza a otras tareas ni a otros robots sin un nuevo fine-tuning.
- Riesgo de sobreajuste: con solo 60 episodios de entrenamiento, el modelo puede no generalizar bien a variaciones de iluminacion, posicion de objetos o configuraciones del entorno no vistas durante el entrenamiento.
- Sin evaluacion publicada: no se han reportado resultados de exito en robot real, por lo que se desconoce su tasa de exito real y su robustez.
- Dependencia de la configuracion de camaras: las observaciones requieren tres camaras con nombres y posiciones especificas; cambios en la configuracion pueden degradar el rendimiento.
- Sin capacidades de lenguaje: a diferencia de otros modelos VLA, no puede interpretar instrucciones complejas en lenguaje natural mas alla de la tarea fijada.
- Licencia y uso comercial: la licencia apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales no detalladas en la informacion proporcionada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vibhurajeev/smolvla_tissue_ball_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vibhurajeev/pick_tissue_ball_v2_20260817_184026
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Pagina oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
