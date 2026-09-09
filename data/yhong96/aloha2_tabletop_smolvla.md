# yhong96/aloha2_tabletop_smolvla

## Resumen

El modelo `yhong96/aloha2_tabletop_smolvla` es un modelo de vision‑lenguaje‑accion (VLA) desarrollado por el usuario `yhong96` y publicado en HuggingFace. Partiendo del modelo base `lerobot/smolvla_base`, se ha realizado un afinado (fine‑tune) sobre el dataset `larp/aloha_multitask`, que contiene demostraciones de manipulacion de objetos en mesa con el robot bimanual ALOHA. El modelo esta entrenado con la libreria LeRobot de HuggingFace y se presenta como una politica (policy) capaz de convertir entradas visuales y de texto en comandos de actuacion para un robot.

SmolVLA es una familia de modelos VLA compactos y eficientes, disenados para alcanzar un rendimiento competitivo con un coste computacional reducido, de modo que puedan ejecutarse en hardware de consumo. Este modelo en concreto tiene 450.046.176 de parametros, con un tamano de repositorio de 0,9 GB. Se publica bajo licencia Apache 2.0 y no se ha especificado la longitud de contexto ni informacion sobre cuantizacion o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision‑lenguaje‑accion (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual con un modelo de lenguaje y una cabeza de prediccion de acciones, generando comandos de control de robot a partir de una imagen y una instruccion textual. Es un modelo compacto y ligero, pensado para reducir el coste computacional frente a VLA de mayor tamano y permitir el despliegue en hardware de consumo.

Este checkpoint concreto es un afinado de `lerobot/smolvla_base` sobre el dataset `larp/aloha_multitask`, que recoge tareas de manipulacion de objetos sobre una mesa con el robot ALOHA. El entrenamiento se ha realizado con la libreria LeRobot de HuggingFace, tal como se indica en la model card. No se ha proporcionado informacion sobre el numero de tokens, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas de bajo nivel (posicion y orientacion del robot) a partir de entradas visuales y textuales.
- Comprension de escenas de mesa (tabletop) mediante vision, incluyendo objetos y su disposicion espacial.
- Interpretacion de instrucciones en lenguaje natural para seleccionar el comportamiento adecuado.
- Adaptacion a tareas de manipulacion bimanual con el robot ALOHA, como recoger y colocar objetos.
- Ejecucion en hardware de consumo gracias a su tamano reducido.
- Integracion completa con el framework LeRobot para entrenamiento, registro de episodios y evaluacion.

No se dispone de informacion verificada sobre soporte de tool calling, razonamiento multi‑paso explicito o capacidades de vision mas alla de la manipulacion robotica.

## Casos de uso

- Manipulacion de objetos en mesa en investigacion: el modelo puede controlar un robot bimanual ALOHA en tareas como coger, colocar o apilar objetos, a partir de demostraciones recogidas con LeRobot. Al ser un afinado sobre `aloha_multitask`, esta especialmente adaptado a estos escenarios.
- Automatizacion de ensamblaje de pequenos componentes: la integracion de vision y lenguaje permite al modelo generar acciones para un brazo robotico en tareas repetitivas con ligeras variaciones, utilizando instrucciones en lenguaje natural para cambiar el objetivo.
- Prototipado rapido de politicas de robot: al ser un modelo compacto y entrenado con LeRobot, se puede reentrenar o ajustar con nuevos datos en pocas horas, lo que acelera el ciclo de iteracion en laboratorios y empresas.
- Investigacion en aprendizaje por imitacion: sirve como referencia para comparar tecnicas de aprendizaje por imitacion o para estudiar la transferencia entre distintas tareas de manipulacion en mesa, ya que su arquitectura es ligera y facil de modificar.
- Entornos educativos de robotica: gracias a su bajo coste computacional, puede ejecutarse en GPUs de consumo y utilizarse en cursos o talleres donde se ensenan conceptos de VLA, control de robots y aprendizaje por demostracion.
- Recogida y colocacion en almacenes pequenos: el modelo puede generar comandos de motor para un brazo robotico en tareas de picking basadas en vision, integrandose en sistemas de automatizacion ligera donde el hardware de computo es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas comparativas.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 0,9 GB en formato safetensors, lo que sugiere un almacenamiento en precision reducida (probablemente fp16 o bf16). Para inferencia se estima un consumo entre 2 y 6 GB de VRAM, dependiendo de la resolucion de las imagenes de entrada y del numero de pasos de accion generados.
- GPU recomendadas: cualquiera con 6 GB o mas de VRAM, como una RTX 3060 o superior. Tambien puede ejecutarse en una RTX 4090 para mayor margen.
- Cabe en GPU de consumo: si, al menos en las gamas medias y altas de consumer hardware.
- Opciones de despliegue: integrado con la libreria LeRobot de HuggingFace; el entrenamiento y la evaluacion se realizan mediante los comandos `lerobot-train` y `lerobot-record`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para una comparativa completa. Este modelo es un afinado de `lerobot/smolvla_base`, por lo que comparte arquitectura con dicho modelo base. Tambien pertenece a la coleccion SmolVLA del ecosistema LeRobot, que agrupa modelos VLA ligeros y eficientes. No se han especificado los parametros de los modelos comparables ni sus resultados de benchmarks.

## Limitaciones y advertencias

- Modelo de fine‑tune especifico para tareas de manipulacion en mesa; su comportamiento fuera de ese dominio no esta garantizado.
- No se ha facilitado informacion sobre sesgos, alucinaciones ni comportamientos no deseados. Al tratarse de un VLA, el riesgo de alucinaciones en la interpretacion de escenas visuales o instrucciones es bajo pero no inexistente.
- La longitud de contexto, los idiomas soportados y las cuantizaciones disponibles no se han publicado, lo que limita su evaluacion comparativa.
- El modelo depende del dataset de entrenamiento `larp/aloha_multitask`; el rendimiento en otros robots o entornos puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia de los datasets y bases modelo involucrados.
- No hay datos de benchmarks ni mediciones de rendimiento en la informacion disponible, por lo que no se puede validar su eficacia frente a otros modelos.

## Enlaces

- Modelo: https://huggingface.co/yhong96/aloha2_tabletop_smolvla
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Coleccion SmolVLA en HuggingFace: https://huggingface.co/collections/lerobot/smolvla-683c072ec3ef6ab0fcb87e60
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
