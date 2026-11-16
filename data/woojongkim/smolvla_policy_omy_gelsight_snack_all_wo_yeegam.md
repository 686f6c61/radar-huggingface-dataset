# WoojongKim/smolvla_policy_omy_gelsight_snack_all_wo_yeegam

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico con costes computacionales reducidos y capacidad de despliegue en hardware de consumo. Este repositorio concreto, publicado por el usuario WoojongKim, es un ajuste fino (fine-tuning) del checkpoint base `lerobot/smolvla_base` sobre el conjunto de datos propio `omy_gelsight_snack_all_wo_yeegam`, orientado a una tarea específica de manipulación con sensor táctil GelSight.

El modelo resuelve el problema de dotar a un brazo robótico de una política de control que combine percepción visual y lenguaje natural con acciones motoras, sin requerir infraestructura de servidor. Con 450.046.176 parámetros (aproximadamente 450 millones) y un repositorio de 0,9 GB en formato safetensors, está pensado para inferencia en estaciones de trabajo con GPU de gama media o incluso hardware integrado.

Es relevante por dos motivos: por un lado, SmolVLA representa la línea de investigación de modelos VLA eficientes publicada en el paper arXiv 2506.01844; por otro, este checkpoint ilustra el flujo de trabajo típico de LeRobot, donde cualquier usuario puede ajustar una política base a su propio robot y dataset y compartirla en el Hub. La licencia Apache 2.0 facilita su reutilización comercial, aunque el alcance práctico queda limitado a la tarea y el hardware concretos del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, segun SmolVLA (arXiv 2506.01844); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero no se especifica cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para producir comandos motores a partir de observaciones e instrucciones en lenguaje natural. El paper asociado (arXiv 2506.01844) describe el diseño como compacto y eficiente, orientado a reducir el coste computacional frente a modelos VLA de mayor tamano y a permitir despliegue en hardware de consumo. No se dispone en la informacion proporcionada del detalle exacto de capas, dimensiones ocultas ni del mecanismo de fusion entre modalidades.

Este checkpoint concreto es un ajuste fino supervisado del modelo base `lerobot/smolvla_base` sobre el dataset `WoojongKim/omy_gelsight_snack_all_wo_yeegam`, que por su nombre sugiere episodios de manipulación de snacks con sensor táctil GelSight y sin teleoperación con EEG (la abreviatura "wo_yeegam" apunta a "without EEG"). No se han publicado en la informacion disponible el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; en el contexto de LeRobot, el entrenamiento de políticas VLA suele ser imitacion supervisada sobre demostraciones.

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, en el marco del pipeline de robótica de LeRobot.
- Percepcion visual integrada mediante el componente de vision del modelo VLA.
- Interpretacion de instrucciones en lenguaje natural para condicionar la politica de control.
- Inferencia en hardware de consumo, segun la model card del modelo base.
- Integracion con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluacion (`lerobot-record`).
- Especializacion en la tarea concreta del dataset de ajuste fino (manipulacion con sensor GelSight), no como modelo generalista.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento (thinking mode) en la informacion disponible.

## Casos de uso

- Manipulacion robotica de objetos tipo snack: el modelo se ha ajustado especificamente sobre episodios de esta tarea, por lo que es adecuado para reproducir agarres y movimientos similares en un brazo equipado con sensor GelSight.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para comparar politicas VLA compactas frente a alternativas de mayor tamano, gracias a sus 450 millones de parametros y su licencia permisiva.
- Prototipado rapido en laboratorio: al caber en hardware de consumo segun la model card del modelo base, permite iterar en estaciones de trabajo sin acceso a clústeres de GPU.
- Evaluacion de sensores tactiles: el dataset de entrenamiento incluye GelSight, de modo que el checkpoint puede usarse para estudiar como la informacion tactil influye en la politica aprendida.
- Base para nuevos ajustes finos: al ser un fine-tune de `lerobot/smolvla_base` con licencia Apache 2.0, puede reentrenarse sobre otros datasets de LeRobot y compararse con el modelo base.
- Docencia y formacion en robotica: el flujo `lerobot-train` / `lerobot-record` documentado en la model card facilita demostraciones reproducibles de entrenamiento y evaluacion de politicas.
- Despliegue en robots tipo SO-100: la model card incluye un ejemplo de evaluacion con `so100_follower`, lo que lo hace directamente aplicable a plataformas de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 450 millones de parametros, en FP16 los pesos ocupan aproximadamente 0,9 GB; en FP32, unos 1,8 GB. A esto hay que sumar el coste del codificador visual y de las activaciones, no cuantificado en la informacion proporcionada.
- GPU recomendadas: no disponibles. La model card del modelo base indica que SmolVLA puede desplegarse en hardware de consumo, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: segun la model card del modelo base, si; no se detallan que tarjetas concretas.
- Opciones de despliegue: el flujo documentado es LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluacion). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo de politica robotica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WoojongKim/smolvla_policy_omy_gelsight_snack_all_wo_yeegam | 450.046.176 | no disponible | Politica VLA para manipulacion con GelSight | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | Modelo VLA base de Hugging Face | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos VLA de mayor tamano (p. ej. familias OpenVLA o RT-2) | no disponible en la informacion proporcionada | no disponible | Politicas VLA generales | no disponible en la informacion proporcionada | no disponible |

La comparacion cuantitativa con alternativas no puede completarse con los datos disponibles; solo se confirma que este checkpoint deriva de `lerobot/smolvla_base` y que su tamano (450 millones de parametros) es inferior al de las familias VLA de referencia habituales, aunque no se dispone de sus cifras exactas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste fino esta ligado al dataset `omy_gelsight_snack_all_wo_yeegam`; su rendimiento fuera de esa tarea, ese robot o ese sensor no esta validado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de exito en la tarea ni comparaciones con el modelo base.
- Riesgo de sobreajuste: al tratarse de un fine-tune sobre un unico dataset, es probable que generalice mal a variaciones de iluminacion, posiciones de objetos o configuraciones de camara no vistas.
- Dependencia del sensor GelSight: si el robot de destino no dispone de ese sensor tactil, las observaciones de entrada no coincidiran con las del entrenamiento.
- Idiomas: no se especifica cobertura linguistica; las instrucciones en lenguaje natural distintas de las usadas en el dataset pueden degradar el comportamiento.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con demostraciones humanas puede heredar los sesgos de esas demostraciones.
- Alucinacion en el sentido de acciones incorrectas: como politica motora, puede producir trayectorias no validas o inseguras; requiere limites de seguridad en el robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion en produccion recae en el integrador.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WoojongKim/smolvla_policy_omy_gelsight_snack_all_wo_yeegam
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/WoojongKim/omy_gelsight_snack_all_wo_yeegam
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
