# Sounderya/smolvla-ur3-mix-polished-1-fin

## Resumen

Este modelo es un ajuste fino (fine-tuning) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, diseñado para ejecutarse en hardware de consumo. El autor, Sounderya, ha adaptado el modelo base `lerobot/smolvla_base` para controlar un robot UR3 en una tarea concreta de manipulación: recoger una taza y colocarla sobre un plato. El modelo se distribuye a través de la librería LeRobot y está pensado para ser utilizado en entornos de robótica reales o simulados.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede ser fine-tuneado para tareas específicas de manipulación robótica con un coste computacional bajo, haciendo accesible la robótica basada en aprendizaje a desarrolladores e investigadores sin grandes infraestructuras. El modelo consume observaciones de estado y tres cámaras, y produce acciones de 10 dimensiones, siguiendo la arquitectura SmolVLA que combina un VLM preentrenado para percepción con un experto de acción entrenado para actuar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM preentrenado + experto de accion) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de accion, no procesa texto largo) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de dos componentes principales: un VLM preentrenado encargado de la percepcion y un experto de accion entrenado para actuar. El VLM procesa las observaciones (imagenes de camara y estado del robot) para generar caracteristicas que condicionan al experto de accion, que produce las acciones de control. Esta arquitectura permite separar la comprension visual del control motor, reduciendo el coste computacional respecto a modelos VLA mas grandes.

El modelo presentado es un fine-tuning del base `lerobot/smolvla_base` realizado con LeRobot. Se ha entrenado durante 1000 pasos con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 1e-05, sobre un dataset propio de 120 episodios (91.365 frames a 30 FPS) que contiene la tarea "Pick the mug and place it on the plate". No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un aprendizaje por imitacion (behavior cloning) supervisado.

## Capacidades

- Percepcion visual multi-camara: consume tres imagenes de 256x256 píxeles (camera1, camera2, camera3) junto con el estado del robot (6 dimensiones).
- Control de acciones de robot: produce acciones de 10 dimensiones para el robot UR3.
- Tarea especifica de manipulacion: recoger una taza y colocarla sobre un plato, aprendida por imitacion.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- No tiene capacidades de lenguaje natural, tool calling, agentes ni razonamiento multi-paso; es un policy de accion puro.
- No se reportan capacidades multilingues ni de vision general fuera del contexto de la tarea.

## Casos de uso

- Automatizacion de picking and placing en lineas de produccion: el modelo puede controlar un robot UR3 para tareas repetitivas de recogida y colocacion de objetos, reduciendo la necesidad de programacion manual.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de fine-tuning de un VLA compacto sobre una tarea concreta, util para estudiar tecnicas de behavior cloning en robótica.
- Base para fine-tuning en tareas similares: partiendo de este modelo, se puede adaptar a otras tareas de manipulacion con datasets propios, gracias a la arquitectura modular de SmolVLA.
- Demostraciones educativas en laboratorios de robotica: permite mostrar el flujo completo de entrenamiento y despliegue de un VLA en hardware asequible, ideal para cursos y talleres.
- Evaluacion de VLA en hardware de consumo: al tener solo 450M parametros, es adecuado para probar tecnicas de VLA en GPUs de gama media sin necesidad de clusters.
- Prototipado rapido en entornos de investigacion: con LeRobot, se puede integrar en pipelines de experimentacion para validar hipotesis sobre control robotico basado en vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas como tasa de exito, MMLU, HumanEval u otras.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Con 450M parametros, en FP16 el peso ocupa aproximadamente 900 MB, pero el proceso de inferencia con imagenes y overhead puede requerir entre 4 y 8 GB de VRAM, aunque este dato no esta confirmado.
- GPU recomendadas: SmolVLA esta disenado para hardware de consumo, por lo que GPUs como RTX 3060, RTX 4060 o superiores deberian ser suficientes, aunque no se especifica un modelo concreto.
- Compatibilidad con consumer GPU: si, segun la pagina oficial de SmolVLA, esta pensado para desplegarse en hardware de consumo.
- Opciones de despliegue: se utiliza principalmente con LeRobot, mediante comandos como `lerobot-rollout` y `lerobot-train`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. No se mencionan otros modelos VLA como OpenVLA, RT-2 o π0 en la documentacion del modelo, por lo que no es posible realizar una comparacion cuantitativa o cualitativa con datos verificados.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para una tarea concreta (recoger taza y ponerla en plato) y no generaliza a otras tareas sin un nuevo fine-tuning.
- No se han realizado evaluaciones en robot real, por lo que su rendimiento en entornos fisicos no esta verificado.
- Depende de la configuracion de camaras especifica (tres camaras con nombres camera1, camera2, camera3) y del estado del robot; cambios en la disposicion de camaras o en el robot pueden degradar el rendimiento.
- El dataset de entrenamiento es limitado (120 episodios), lo que puede introducir sesgos en la manipulacion (posiciones de objetos, iluminacion, etc.).
- Al ser un modelo de imitacion, puede presentar alucinaciones en la percepcion si las condiciones visuales difieren del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar el metodo original (SmolVLA) y LeRobot segun la model card.
- No se proporcionan garantias de seguridad para operacion en entornos con presencia humana; se recomienda supervision y validacion antes de cualquier uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sounderya/smolvla-ur3-mix-polished-1-fin
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Pagina oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio del autor (UR3 SmolVLA): https://github.com/Sounderya22/ur3_smolvla
