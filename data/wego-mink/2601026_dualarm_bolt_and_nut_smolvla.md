# wego-mink/2601026_dualarm_bolt_and_nut_smolvla

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de instrucciones en lenguaje natural e imagenes de camara. Esta ficha concreta, `2601026_dualarm_bolt_and_nut_smolvla`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario `wego-mink` sobre el dataset `wego-mink/dualarm_bolt_and_nut`, orientado a una tarea especifica de manipulacion bimanual con tornillos y tuercas.

El modelo resuelve el problema de la politica de control (policy) en robotica: dado un estado de observacion multimodal (vision + estado de articulaciones + instruccion textual), predice acciones motoras de bajo nivel. Su relevancia radica en que SmolVLA esta pensado para desplegarse en hardware de consumo, reduciendo el coste computacional frente a VLA de mayor tamano, y en que LeRobot ofrece un pipeline estandarizado de entrenamiento y evaluacion.

El checkpoint tiene 450.046.176 parametros (~450 M) en formato safetensors, ocupa 0,9 GB en el repositorio y se distribuye bajo licencia Apache 2.0. Es un modelo de proposito muy especifico: no es un modelo de lenguaje general, sino una politica robotica entrenada para una tarea concreta, por lo que su uso fuera de ese dominio requerira reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, segun el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se procesan como texto, pero no se declara cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un codificador de lenguaje y un cabezal de prediccion de acciones, siguiendo el diseno descrito en el paper arXiv:2506.01844. El objetivo del diseno es lograr un rendimiento competitivo en tareas de manipulacion robotica con un coste computacional reducido, de forma que pueda ejecutarse en hardware de consumo. La model card no detalla el numero de capas, la dimension oculta ni el mecanismo exacto de fusion multimodal.

Este checkpoint concreto se ha obtenido por fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `wego-mink/dualarm_bolt_and_nut`, que contiene demostraciones de una tarea bimanual con tornillos y tuercas. No se especifica en la informacion disponible el numero de episodios, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El entrenamiento se realizo con la herramienta `lerobot-train` del ecosistema LeRobot.

## Capacidades

- Prediccion de acciones motoras de bajo nivel para robots manipuladores a partir de observaciones visuales y estado del robot.
- Control bimanual: el nombre del dataset (`dualarm`) indica que la politica esta entrenada para coordinacion de dos brazos.
- Manipulacion de objetos especificos: la tarea objetivo es el manejo de tornillos y tuercas (`bolt_and_nut`).
- Condicionamiento por instruccion en lenguaje natural, al ser un modelo VLA.
- Integracion nativa con el pipeline de LeRobot para entrenamiento, evaluacion y despliegue.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso general ni generacion de texto libre; es una politica robotica, no un asistente conversacional.
- Cobertura multilingue: no disponible.

## Casos de uso

- Automatizacion de ensamblaje bimanual: la politica puede ejecutar la secuencia de agarre y roscado de tornillos y tuercas con dos brazos, que es exactamente la tarea del dataset de fine-tuning.
- Prototipado rapido en laboratorio: al pesar 0,9 GB y tener ~450 M de parametros, permite iterar en estaciones de trabajo con una sola GPU consumer, acelerando los ciclos de prueba.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar generalizacion de politicas VLA a variaciones de posicion, orientacion o iluminacion de las piezas.
- Benchmark de referencia para comparar arquitecturas VLA: al estar integrado en LeRobot, se puede evaluar con `lerobot-record` frente a otras politicas sobre el mismo dataset.
- Despliegue en celulas de fabricacion de bajo coste: su tamano reducido permite ejecutarlo en el ordenador que controla el robot sin necesidad de infraestructura en la nube.
- Formacion y docencia en robotica: el pipeline estandarizado de LeRobot y la licencia Apache 2.0 facilitan su uso en cursos y talleres sin restricciones de licencia.
- Base para fine-tuning en tareas similares de atornillado en otros entornos, reentrenando con nuevos datasets de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros en safetensors (0,9 GB), la inferencia en precision completa requiere del orden de 2-3 GB contando activaciones y buffers, aunque este dato no lo confirma el autor.
- GPU recomendadas: no especificadas por el autor. El paper de SmolVLA indica que el modelo esta pensado para hardware de consumo.
- Cabe en GPU consumer: si, segun la premisa de diseno de SmolVLA de desplegarse en hardware de consumo; no se detalla una lista concreta de modelos de GPU.
- Opciones de despliegue: `lerobot` (comando `lerobot-record` con `--policy.path`), tal como indica la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wego-mink/2601026_dualarm_bolt_and_nut_smolvla | 450 M | no disponible | Politica VLA bimanual (tornillo y tuerca) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | Politica VLA general (base) | no disponible en la informacion | Hugging Face |
| Otras politicas LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | Politicas de imitacion | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: entrenado para una unica tarea (tornillo y tuerca con dos brazos); su rendimiento fuera de ese dominio sera pobre sin reentrenamiento.
- Riesgo de sobreajuste al entorno de demostracion: cambios en iluminacion, posicion de camara, tipo de pieza o robot pueden degradar la politica.
- No es un modelo de lenguaje general: no debe usarse para generacion de texto, razonamiento o atencion al cliente.
- Sesgos: no se documentan sesgos especificos, pero al derivar de un dataset acotado de demostraciones, hereda las limitaciones de ese dataset.
- Alucinacion en el sentido de acciones incorrectas: la politica puede generar trayectorias no validas o inseguras ante estados fuera de distribucion; se recomienda supervision y limites de seguridad en el robot.
- Cobertura de idiomas no declarada; no se garantiza el funcionamiento de instrucciones en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Repositorio con muy poca traccion (25 descargas, 0 likes) y sin documentacion adicional sobre el dataset o los resultados de evaluacion; conviene validar la politica antes de usarla en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wego-mink/2601026_dualarm_bolt_and_nut_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/wego-mink/dualarm_bolt_and_nut
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
