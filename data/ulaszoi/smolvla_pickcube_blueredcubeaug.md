# ulasZoi/smolvla_pickcube_BlueRedCubeAug

## Resumen

SmolVLA pickcube BlueRedCubeAug es un ajuste fino (fine-tune) del modelo base SmolVLA (lerobot/smolvla_base) publicado por el usuario ulasZoi en HuggingFace bajo la libreria LeRobot. Se trata de una politica Vision-Language-Action (VLA) orientada a robotica: recibe imagenes de camara y una instruccion en lenguaje natural, y produce acciones de control de bajo nivel para un brazo robotico. En concreto, este checkpoint esta entrenado para la tarea de recoger un cubo (pick cube) sobre un brazo SO-101, con un dataset propio (ulasZoi/so101_RED_BlueCubeMerged) que combina variantes de cubo rojo y azul y aplica aumentacion de color.

El modelo se apoya en la arquitectura y el entrenamiento descritos en el articulo SmolVLA (arXiv:2506.01844), que propone un VLA compacto y eficiente para control robotico con datos de demostracion teleoperados. La relevancia de este tipo de checkpoints es practica: permiten reproducir tareas concretas de manipulacion en hardware de bajo coste (SO-101) usando la pila LeRobot, y sirven como punto de partida para ajustes posteriores con nuevos objetos, colores o entornos.

No obstante, la model card publicada es minima: no incluye parametros, longitud de contexto, idiomas, benchmarks ni detalles de entrenamiento mas alla de las etiquetas. Los datos que faltan se marcan como "no disponible" en esta ficha, y los valores marcados como derivados del modelo base o del articulo se indican explicitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); derivada de SmolVLA (encoder visual + modelo de lenguaje + experto de acciones con flow matching). Detalle exacto del fine-tune: no disponible |
| Parametros totales | No disponible en la model card; el modelo base SmolVLA declara del orden de 450 M de parametros segun el articulo (arXiv:2506.01844) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (en VLAs se mide en horizonte de acciones; SmolVLA base usa chunking de acciones, valor concreto no disponible en la model card) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (precision completa del entrenamiento) |
| Idiomas soportados | No disponible (la instruccion de la tarea se proporciona como prompt de texto; no se declara cobertura multilingue) |
| Licencia | apache-2.0 segun la etiqueta del repositorio; el campo de licencia de la model card figura como no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este repositorio es un fine-tune de lerobot/smolvla_base, un modelo SmolVLA. La familia SmolVLA, descrita en arXiv:2506.01844, combina un encoder visual (estilo SigLIP) con un modelo de lenguaje compacto y un modulo experto de acciones entrenado con flow matching, que genera secuencias de acciones (action chunks) en lugar de comandos discretos. El objetivo es permitir inferencia en hardware asequible sin renunciar a la generalizacion a partir de instrucciones en lenguaje natural. El detalle de capas, dimensiones y recuento exacto de parametros de este checkpoint no esta publicado en la model card.

En cuanto al entrenamiento de este fine-tune, el dataset asociado es ulasZoi/so101_RED_BlueCubeMerged, que por su nombre sugiere una fusion de demostraciones teleoperadas sobre un brazo SO-101 con cubos rojo y azul, mas aumentacion del canal de color. No se especifican en la model card el numero de episodios, el numero de tokens/acciones vistos, si hubo etapas de RLHF o DPO (poco habituales en politicas VLA de control), ni hiperparametros de ajuste. Toda esa informacion debe considerarse no disponible.

## Capacidades

- Generacion de acciones de control para manipulacion robotica: dada una observacion visual y una instruccion textual, produce comandos de actuador para el brazo SO-101.
- Ejecucion de la tarea especifica de picking de un cubo (cubo rojo y cubo azul), con aumentacion de color aplicada en el dataset de entrenamiento.
- Integracion con la pila LeRobot para entrenamiento, evaluacion y despliegue de politicas robotica.
- Acepta condicionamiento por lenguaje natural (prompt de tarea), segun el paradigma VLA.
- Capacidad de generalizacion limitada a variaciones de color/iluminacion dentro del dominio de entrenamiento; no declarada para objetos o tareas fuera de ese dominio.
- No consta soporte de tool calling, function calling, agentes multi-paso, vision generativa, audio ni modos de razonamiento explicito (thinking mode).

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la secuencia de aproximacion, agarre y deposito de un cubo sobre un brazo SO-101, lo que permite automatizar tareas repetitivas de banco de pruebas con hardware de bajo coste.
- Base para fine-tuning con domain randomization: el checkpoint ya incorpora aumentacion de color (rojo/azul), por lo que resulta un punto de partida razonable para ampliar el espacio de colores, texturas o posiciones iniciales del objeto.
- Evaluacion comparativa de politicas VLA: sirve como referencia entrenada en un conjunto de datos concreto frente a otros checkpoints SmolVLA, manteniendo constante el hardware y el pipeline LeRobot.
- Reproduccion de experimentos docentes: en cursos de robotica de manipulacion, permite demostrar el ciclo completo de recogida de datos teleoperados, entrenamiento y despliegue sin requerir GPU de gama alta.
- Generacion de datos sinteticos de evaluacion: combinado con un simulador o con variaciones controladas de iluminacion en el mundo real, permite medir la robustez del modelo ante cambios visuales no vistos.
- Prototipado de pipelines de robotica end-to-end: al estar en formato safetensors y ser compatible con LeRobot, se integra en scripts de inferencia en tiempo real para validar latencias de control y frecuencia de bucle.
- Investigacion sobre sensibilidad al sesgo de color: el entrenamiento con cubos rojo y azul y aumentacion cromatica lo hace util para estudiar como el modelo generaliza (o no) entre colores distintos del objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de simulacion ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- El tamano exacto de este checkpoint no esta publicado. Tomando como referencia el modelo base SmolVLA (del orden de 450 M de parametros segun el articulo), los pesos en bf16 ocuparian aproximadamente 1 GB, y en fp32 alrededor de 1,8 GB. Estas cifras son estimaciones derivadas del modelo base, no datos confirmados de la model card.
- Con esa magnitud, la inferencia cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, e incluso en placas de 8 GB o menos si el modelo se ejecuta en bf16 o fp16.
- Para despliegue embebido sobre el propio robot, tarjetas como NVIDIA Jetson Orin (8-16 GB) son candidatas razonables; no hay confirmacion de compatibilidad en la informacion disponible.
- Inferencia en CPU es tecnicamente posible por tamano, pero la latencia probablemente no cumple los requisitos de control en lazo cerrado de un brazo robotico; no se dispone de mediciones.
- Opciones de despliegue: LeRobot (libreria declarada en el repositorio) sobre PyTorch. No consta soporte de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Throughput y latencia: no disponibles. Para un VLA de control es habitual trabajar a decenas de hercios, pero no hay ningun dato medido en esta model card.

## Comparativa con modelos similares

Los datos de parametros y contexto de los modelos alternativos provienen de sus respectivas publicaciones y repositorios publicos, no de la informacion de esta model card, y deben tomarse como aproximados.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| ulasZoi/smolvla_pickcube_BlueRedCubeAug | No disponible (base SmolVLA ~450 M) | VLA, fine-tune para SO-101 | apache-2.0 (etiqueta) | HuggingFace, 0 descargas | Especifico para pick cube con cubos rojo/azul |
| lerobot/smolvla_base | ~450 M (segun articulo) | VLA generalista | No disponible en esta ficha | HuggingFace | Modelo base del que deriva el anterior |
| OpenVLA | ~7 B | VLA generalista | Llama 2 y componentes con licencias propias | HuggingFace, GitHub | Mayor tamano, requiere mas VRAM |
| pi0 (Physical Intelligence) | Del orden de 3 B | VLA con flow matching | No disponible en esta ficha | Publicacion y repositorio | Orientado a tareas de manipulacion diversas |

No se dispone de comparaciones de rendimiento (tasas de exito) entre estos modelos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: esta entrenado para una tarea concreta (pick cube con cubos rojo y azul) sobre un brazo SO-101. Fuera de ese dominio, el comportamiento esperado es fallo o degradacion severa.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios en camara, iluminacion, fondo, mesa o posicion inicial pueden degradar el exito de la politica. La aumentacion de color mitiga parcialmente la variacion cromatica, no el resto.
- Sesgos conocidos: no documentados en la model card. Cabe esperar sensibilidad al color y a la apariencia del objeto por construccion del dataset (cubos rojo y azul).
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: como toda politica entrenada por imitacion, puede generar trayectorias verosimiles que no completen la tarea. No hay metricas de error publicadas.
- Idiomas: no disponible. No se declara soporte multilingue para las instrucciones de texto.
- Licencia: la etiqueta indica apache-2.0, lo que en principio permitiria uso comercial, pero el campo de licencia de la model card figura como no disponible. Conviene verificar este punto antes de un uso en produccion.
- Sin benchmarks publicados: no es posible estimar la tasa de exito ni comparar de forma cuantitativa con alternativas.
- Estado del repositorio: 0 descargas y 0 "likes", sin actualizaciones posteriores a la creacion. No hay garantia de mantenimiento ni de soporte.
- Uso en robotica real: cualquier despliegue sobre hardware fisico requiere limites de par, paradas de emergencia y validacion en entorno controlado antes de operar cerca de personas.
- Fecha de creacion declarada: 2026-09-26, posterior a la fecha habitual de publicacion; conviene confirmar la vigencia y el contenido real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_BlueRedCubeAug
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/ulasZoi/so101_RED_BlueCubeMerged
- Articulo SmolVLA (referencia en las etiquetas): https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
