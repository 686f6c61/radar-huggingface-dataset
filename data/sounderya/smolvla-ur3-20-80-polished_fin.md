# Sounderya/smolvla-ur3-20-80-polished_fin

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) compacto desarrollado por Hugging Face, disenado para control robotico por aprendizaje por imitacion. Con 450 millones de parametros, ofrece un rendimiento comparable a modelos de 7 a 10 veces mas grandes, pero con un coste computacional reducido que permite su despliegue en hardware de consumo. Este repositorio concreto es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base` realizado por Sounderya sobre un robot UR3, especializado en la tarea de recoger una taza y colocarla en un plato.

El ajuste fino se ha entrenado con el framework LeRobot (v0.6.1) sobre un dataset propio de 120 episodios y mas de 91.000 fotogramas, con tres camaras de entrada y una salida de accion de 10 dimensiones. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integracion en entornos de investigacion. Su relevancia actual reside en que demuestra que las politicas VLA pueden entrenarse y desplegarse en un solo GPU de consumo, abaratando la experimentacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de robotica, no de texto generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual y un modelo de lenguaje pequeno (SmolV2) con una cabeza de accion de politica. A diferencia de modelos VLA mas grandes como OpenVLA (7B), SmolVLA se disena para ser eficiente: puede ajustarse y ejecutarse en un solo GPU de consumo. Este ajuste fino parte de los pesos del modelo base `lerobot/smolvla_base` y se entrena con el framework LeRobot.

El entrenamiento se realizo con el optimizador AdamW, una tasa de aprendizaje de 1e-5, un batch size de 64 y 1000 pasos de entrenamiento, con semilla 1000. El dataset de entrenamiento (`Sounderya/mug_smolvla_dataset_v2nc`) contiene 120 episodios a 30 FPS (91.365 fotogramas) de la tarea "Pick the mug and place it on the plate". El modelo consume tres entradas visuales de 256x256 píxeles (camaras de muneca, derecha y una tercera) mas un vector de estado de 6 dimensiones, y produce una accion de 10 dimensiones. No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Manipulacion robotica de precision: ejecuta la tarea de pick-and-place de una taza sobre un plato, generando acciones continuas de 10 dimensiones.
- Aprendizaje por imitacion: aprende de demostraciones humanas registradas en el dataset, sin necesidad de ingenieria de recompensas.
- Percepcion multimodal: procesa simultaneamente tres flujos de vision (256x256) y un vector de estado proprioceptivo de 6 valores.
- Inferencia en tiempo real: disenado para ejecutarse a frecuencias compatibles con control robotico (30 FPS de captura).
- Integracion con LeRobot: compatible con el ecosistema de LeRobot para registro de datos, entrenamiento y rollout sobre hardware real.
- No incluye capacidades de generacion de texto, tool calling ni razonamiento conversacional: su salida es exclusivamente un vector de accion.

## Casos de uso

- Manipulacion industrial de piezas en entornos de laboratorio: el modelo puede ejecutar la tarea de recoger y colocar objetos en una posicion fija, con un UR3 o robot similar, usando las camaras montadas en el robot.
- Automatizacion de procesos repetitivos de pick-and-place: gracias a su bajo coste de inferencia, puede desplegarse en lineas de prototipado donde se requiera cambiar la tarea con un re-entrenamiento rapido.
- Investigacion en robotica de imitacion: sirve como base para estudiar la transferencia de politicas VLA entre entornos, variaciones de iluminacion o posiciones de objetos, al ser un modelo abierto y pequeno.
- Validacion de pipelines de LeRobot: es un ejemplo de referencia para verificar el flujo completo de registro de dataset, entrenamiento y rollout en un robot real.
- Ensayo de estrategias de aumento de datos: el modelo se puede re-entrenar con variaciones del dataset (cambios de camara, de iluminacion) para evaluar la robustez de politicas VLA.
- Formacion y docencia en robotica: por su tamano y licencia permisiva, es adecuado para cursos y talleres que necesiten un modelo VLA funcional en hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica concreta. El paper de SmolVLA (arXiv:2506.01844) reporta que el modelo base de 450M alcanza un rendimiento comparable o superior a modelos 7-10 veces mas grandes en benchmarks de manipulacion estandar, pero esos datos no se trasladan directamente a este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros en bf16 (0,9 GB de pesos), la inferencia requiere aproximadamente 1,5-3 GB de VRAM, dependiendo del batch y de las activaciones de las tres camaras.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (RTX 3050, GTX 1660 Super, RTX 4060) puede ejecutar la inferencia; para entrenamiento se recomienda una GPU con 8-12 GB (RTX 3070, RTX 4080, RTX 4090).
- Compatibilidad con GPU de consumo: si, es el objetivo del diseno de SmolVLA, desplegar en un solo GPU de consumo.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), integracion con PyTorch, y el ecosistema de Hugging Face.
- Latencia y rendimiento: no se disponen de datos de latencia para este ajuste fino concreto; el modelo base de 450M esta pensado para inferencia a 30 FPS o mas en GPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| **SmolVLA (este ajuste)** | 450M | No disponible (VLA) | Apache-2.0 | Robotica, tarea especifica de pick-and-place |
| **SmolVLA base (lerobot/smolvla_base)** | 450M | No disponible (VLA) | Apache-2.0 | Robotica, base para fine-tuning |
| **OpenVLA** | 7B | 4096 tokens (texto) | MIT | Robotica general, mayor coste de inferencia |
| **RT-2 (Google)** | 55B | No disponible | Propietaria | Robotica, no accesible |

La comparativa directa con OpenVLA o RT-2 no es del todo justa porque este ajuste fino se limita a una tarea muy concreta y no se ha evaluado en benchmarks generales. La ventaja principal frente a modelos mas grandes es el coste: 450M frente a 7B o 55B, con un rendimiento reportado en el paper base como comparable para tareas de manipulacion.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en robot real para este ajuste fino; la model card indica explicitamente "No evaluation results have been provided for this policy yet".
- El dataset de entrenamiento es pequeno (120 episodios) y esta limitado a una unica tarea y una unica configuracion de camaras; la generalizacion a otras posiciones, objetos o iluminaciones no esta garantizada.
- El modelo no es un agente conversacional ni generativo de texto: su salida es exclusivamente un vector de accion de 10 dimensiones, y no soporta tool calling ni razonamiento simbolico.
- La informacion sobre la longitud de contexto, cuantizacion y idiomas soportados no esta disponible en la model card.
- Riesgo de alucinacion visual: como cualquier modelo basado en vision, puede producir acciones incorrectas si los objetos no se detectan correctamente en las camaras, especialmente en condiciones no vistas en el entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero requiere atribucion y no ofrece garantias; el usuario debe verificar que el dataset de entrenamiento cumple con sus obligaciones legales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sounderya/smolvla-ur3-20-80-polished_fin
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
