# ted88168/act-so101-multicolor-early-data-100k

## Resumen

El modelo `ted88168/act-so101-multicolor-early-data-100k` es una politica de control robotico basada en Action Chunking Transformer (ACT), entrenada desde cero para un brazo seguidor SO-101. Lo publica el usuario ted88168 en HuggingFace, con licencia Apache 2.0 y compatibilidad con la libreria LeRobot (fuente compatible con la version 0.6.2). No es un modelo de lenguaje ni un modelo de vision-lenguaje-accion (VLA): es un modulo de imitacion que mapea observaciones visuales y el estado del robot a secuencias de acciones motoras.

El modelo tiene 51.668.614 parametros totales segun los ficheros safetensors del repositorio (la model card declara 51.597.190 parametros de la politica ACT), un tamano de repositorio de 0,2 GB y un pipeline declarado como `robotics`. Se entreno durante 100.000 pasos sobre el dataset `ted88168/so101_multicolor_master_v1`, compuesto por 243 episodios y 175.923 fotogramas a 30 FPS, con dos camaras (`observation.images.front` y `observation.images.handeye`), estado del robot de 6 dimensiones y acciones de 6 dimensiones.

Su relevancia es practica mas que arquitectonica: es un ejemplo reproducible de entrenamiento de una politica ACT con LeRobot para hardware de bajo coste, e incluye un aviso explicito del autor de que la politica no esta condicionada por lenguaje. El propio autor documenta que las etiquetas de color del dataset (rojo, verde, azul) no permiten seleccionar un color cambiando la instruccion de texto en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT): transformer con backbone visual ResNet-18 inicializado con pesos de ImageNet |
| Parametros totales | 51.668.614 (safetensors); la model card declara 51.597.190 parametros de la politica ACT |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; procesa observaciones por paso y emite un chunk de 100 acciones |
| Tipos de cuantizacion | No disponible (la model card no especifica esquemas de cuantizacion) |
| Idiomas soportados | No aplica: la politica no esta condicionada por lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | ted88168/so101_multicolor_master_v1 |
| Entradas | observation.images.front, observation.images.handeye, estado del robot (6 dimensiones) |
| Salidas | Acciones de 6 dimensiones, chunk de 100 acciones |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de imitacion supervisada que sustituye la prediccion de acciones paso a paso por la prediccion de bloques o "chunks" de acciones, lo que reduce el error de acumulacion y el coste de inferencia por paso de control. En este checkpoint, el codificador visual es una ResNet-18 inicializada con pesos de ImageNet, que procesa dos flujos de imagen (`observation.images.front` y `observation.images.handeye`). La accion es un vector de 6 dimensiones y el chunk de acciones es de 100. El repositorio incluye la configuracion de la politica y los ficheros de preprocesado y postprocesado de LeRobot necesarios para la inferencia.

El entrenamiento se realizo desde cero durante 100.000 pasos, con un regimen de batch variable: 64 entre los pasos 0 y 30.000, y 48 entre los pasos 30.001 y 100.000. La fuente es compatible con LeRobot 0.6.2. Los datos proceden del dataset `so101_multicolor_master_v1`: 243 episodios, 175.923 fotogramas a 30 FPS, con etiquetas de tarea correspondientes a bloques de color rojo, verde y azul. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna etapa de ajuste por preferencias, algo coherente con una politica de imitacion de acciones.

La innovacion tecnica relevante aqui es el propio esquema de chunking: a 30 FPS, un chunk de 100 acciones cubre un horizonte de aproximadamente 3,3 segundos de movimiento antes de requerir una nueva inferencia, lo que relaja los requisitos de latencia del bucle de control. El autor advierte ademas de una limitacion estructural: al no estar condicionada por lenguaje, la politica no puede seleccionar el color objetivo a partir de una instruccion textual, pese a que el dataset contenga etiquetas de color.

## Capacidades

- Control motor por imitacion: genera chunks de 100 acciones de 6 dimensiones para un brazo SO-101, a partir de observaciones visuales y del estado del robot.
- Percepcion visual con dos camaras: consume simultaneamente `observation.images.front` (vision frontal) y `observation.images.handeye` (camara en la mano).
- Ejecucion sincrona: la model card indica que debe usarse como politica ACT sincrona, con la misma calibracion, colocacion de camaras, resolucion de imagen y geometria del espacio de trabajo empleadas durante la recogida de datos.
- Tareas de agarre y colocacion: el entrenamiento cubre tareas con bloques de tres colores (rojo, verde, azul); el autor recomienda evaluar el agarre y la colocacion con un unico bloque objetivo.
- Autocontenido para despliegue: el checkpoint incluye configuracion y ficheros de preprocesado y postprocesado de LeRobot.
- Tool calling / function calling: no disponible; no aplica a una politica de control motor.
- Soporte de agentes y razonamiento multi-paso: no disponible; no aplica.
- Capacidades multilingues: no aplica; no hay procesamiento de lenguaje.
- Capacidades especiales: no dispone de modo de razonamiento, vision generalista, audio ni generacion de texto. La seleccion determinista de color exigiria, segun el autor, entrenar politicas ACT separadas por color o usar una politica VLA condicionada por lenguaje.

## Casos de uso

- Manipulacion repetitiva de picking y placing en laboratorio: el modelo ejecuta secuencias de agarre y deposito de bloques con un SO-101, aprovechando el chunk de 100 acciones para mantener movimientos fluidos sin re-inferencia constante.
- Banco de pruebas de imitacion robotica: sirve como punto de partida reproducible para comparar tecnicas de chunking, aumento de datos o cambios de backbone visual en LeRobot.
- Automatizacion de tareas de clasificacion por posicion: aunque no selecciona color por lenguaje, puede usarse con un unico bloque objetivo colocado en una posicion fija del espacio de trabajo, que es justo el protocolo que recomienda el autor para evaluar.
- Investigacion en aprendizaje por demostracion con hardware de bajo coste: el dataset asociado (243 episodios, 175.923 fotogramas) y el checkpoint permiten estudiar el efecto del numero de episodios y de la resolucion de imagen en el exito de la tarea.
- Generacion de datos sinteticos o aumentados para otras politicas: las trayectorias aprendidas pueden servir de referencia para inicializar o validar politicas derivadas sobre el mismo brazo.
- Formacion y docencia en robotica: ejemplo completo de extremo a extremo con LeRobot que abarca recogida de datos, entrenamiento de 100.000 pasos y despliegue sincrono con dos camaras.
- Pruebas de seguridad y protocolos de parada: util para ensayar rollouts cortos, espacios de trabajo despejados y corte de alimentacion fisico antes de escalar a tareas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, curvas de aprendizaje ni comparaciones cuantitativas con otras politicas, y los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo (devuelven paginas sobre perfumes, sin relacion con el repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 51,7 millones de parametros ocupan aproximadamente 207 MB; en float16, unos 103 MB. Sumando activaciones de la ResNet-18 y dos flujos de imagen, el consumo realista se situa en el rango de unos pocos cientos de MB, aunque este dato no esta confirmado en la informacion disponible.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente por capacidad de memoria (RTX 3060, RTX 4090, A100, H100). La eleccion dependera de la latencia requerida por el bucle de control, no de la VRAM.
- Cabe en GPU de consumo: si, de forma holgada, en practicamente cualquier GPU de consumo moderna, e incluso es viable en CPU o en Apple Silicon (MPS), con latencias superiores.
- Opciones de despliegue: scripts y CLI de LeRobot (pila habitual para politicas ACT). No aplican vLLM ni TGI, que estan orientados a modelos de lenguaje autorregresivos, ni llama.cpp/Ollama, que no soportan el formato de una politica ACT.
- Latencia y throughput: no disponible. Como referencia derivada de los datos del entrenamiento, un chunk de 100 acciones a 30 FPS cubre 3,3 segundos de ejecucion por inferencia, lo que fija el presupuesto de latencia maximo del bucle de control.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Condicionado por lenguaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-so101-multicolor-early-data-100k | ACT (imitacion) | 51,7 M | No | Apache 2.0 | HuggingFace (0 descargas) |
| ACT original (Zhao et al., 2023) | ACT (imitacion) | No disponible | No | No disponible | Paper y repositorio publicos |
| Diffusion Policy (Chi et al., 2023) | Politica generativa por difusion | No disponible | No | No disponible | Repositorio publico |
| SmolVLA (Hugging Face) | VLA | No disponible | Si | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia funcional relevante es que las propuestas VLA, al estar condicionadas por lenguaje, permiten seleccionar el objetivo mediante instruccion textual, algo que este checkpoint no soporta.

## Limitaciones y advertencias

- No esta condicionada por lenguaje: cambiar la instruccion de texto en inferencia no selecciona de forma fiable el color solicitado, pese a que el dataset contenga etiquetas de rojo, verde y azul.
- Para seleccion determinista de color, el autor recomienda entrenar politicas ACT separadas por color o emplear una politica VLA condicionada por lenguaje.
- Acoplamiento estricto al montaje: requiere la misma calibracion del SO-101, la misma colocacion de camaras, la misma resolucion de imagen y la misma geometria del espacio de trabajo que en la recogida de datos. Cualquier cambio invalida la politica.
- Controla hardware fisico: el autor indica empezar con rollouts cortos, mantener despejado el espacio de trabajo, tener disponible un corte de alimentacion fisico y no considerar un boton de parada de la interfaz grafica como parada de emergencia.
- Riesgo de fallo en el agarre y la colocacion fuera de la distribucion de entrenamiento; se recomienda evaluar primero con un unico bloque objetivo.
- Sesgos conocidos: no se documentan sesgos especificos, pero la politica hereda las condiciones de iluminacion, disposicion de objetos y estilo de demostracion del dataset de 243 episodios.
- Sin evidencia publica de rendimiento: no hay tasas de exito ni benchmarks en la informacion disponible.
- Adopcion nula hasta la fecha de consulta: 0 descargas y 0 likes, sin validacion por parte de terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y de atribucion correspondientes.
- Estado de entrenamiento: el nombre del checkpoint ("early data 100k") y la ausencia de evaluacion publicada sugieren que debe tratarse como un artefacto experimental y no como una politica lista para produccion.
- Idiomas: no aplica; no hay procesamiento de lenguaje natural en el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ted88168/act-so101-multicolor-early-data-100k
- Dataset de entrenamiento: https://huggingface.co/datasets/ted88168/so101_multicolor_master_v1
- LeRobot (libreria de referencia): https://github.com/huggingface/lerobot
- Paper original de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo (paginas de perfumes y listas de fragancias), por lo que no se han podido incorporar enlaces adicionales relevantes.
