# whosricky/lw_benchhub

## Resumen

`whosricky/lw_benchhub` es una política de visión-lenguaje-acción (VLA) para robótica, publicada en Hugging Face por el usuario `whosricky`. Se trata de un ajuste fino (*fine-tuning*) del modelo base `lerobot/smolvla_base`, que a su vez implementa la arquitectura SmolVLA descrita en el artículo arXiv:2506.01844. El modelo está diseñado para controlar un robot bimanual de tipo `double_piper` equipado con tres cámaras, y traduce observaciones visuales y de estado articular en comandos de acción de 12 dimensiones.

El modelo resuelve el problema de la manipulación robótica de precisión en entornos de cocina y hogar: apertura y cierre de cajones, colocación de objetos en estantes, uso de fogones y microondas, apilamiento de recipientes y organización de productos en cestas y bandejas. Su relevancia radica en que SmolVLA es una arquitectura compacta pensada para desplegarse en hardware de consumo, lo que abarata la experimentación con políticas VLA frente a alternativas de mayor tamaño.

Con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, el modelo se distribuye bajo licencia Apache 2.0 y se entrena sobre el conjunto de datos `LightwheelAI/Lightwheel-Tasks-Double-Piper`, compuesto por 6.500 episodios y más de seis millones de fotogramas a 50 FPS. Es, por tanto, un modelo de investigación aplicada orientado a un robot y un conjunto de tareas muy concretos, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) SmolVLA, según arXiv:2506.01844 |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `double_piper` (bimanual) |
| Cámaras de entrada | `left_hand`, `first_person`, `right_hand` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida de acción | `action`, forma `(12,)` |
| Resolución de imagen | 256 × 256 × 3 por cámara |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `LightwheelAI/Lightwheel-Tasks-Double-Piper` |
| Episodios de entrenamiento | 6.500 |
| Fotogramas de entrenamiento | 6.010.166 a 50 FPS |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un diseño VLA compacto que combina un codificador visual, un modelo de lenguaje preentrenado de pequeño tamaño y un cabezal de acciones que genera trayectorias motrices. La política consume tres flujos de imagen de 256×256 píxeles (cámara de la mano izquierda, cámara en primera persona y cámara de la mano derecha) junto con un vector de estado de 6 dimensiones, y produce un vector de acción de 12 dimensiones que corresponde a los grados de libertad del robot bimanual `double_piper`. El artículo de referencia (arXiv:2506.01844) describe SmolVLA como un modelo capaz de obtener rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo.

El ajuste fino se realizó sobre el conjunto de datos `LightwheelAI/Lightwheel-Tasks-Double-Piper`, que contiene 6.500 episodios y 6.010.166 fotogramas capturados a 50 FPS. Las tareas cubren un repertorio amplio de manipulación doméstica: encender el fogón y colocar la cafetera moka, abrir y cerrar cajones del armario, introducir el bol negro en el cajón superior o inferior, colocar tazas en platos, apilar cuencos, meter la fiambrera en el microondas, poner la sartén en el fogón, guardar el vino en la vinoteca y organizar productos en la cesta o la bandeja. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO; el pipeline declarado es `robotics` y la librería de entrenamiento e inferencia es LeRobot.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 12 dimensiones para un robot `double_piper` a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa de forma conjunta tres vistas (mano izquierda, primera persona y mano derecha) a 256×256 píxeles.
- Ejecución de tareas de manipulación doméstica de precisión: apertura y cierre de cajones, colocación de objetos en estantes, apilamiento de cuencos y trasvase de productos entre superficies.
- Manejo de utensilios de cocina: encendido y apagado de fogones, colocación de sartenes y cafeteras moka, apertura y cierre del microondas.
- Organización de objetos en contenedores: introducción de productos en cestas y bandejas, y colocación de tazas y cuencos en platos.
- Condicionamiento por instrucción en lenguaje natural: cada episodio está asociado a una descripción textual de la tarea, lo que permite invocar comportamientos concretos mediante el prompt correspondiente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo ejecuta políticas de acción, no razonamiento simbólico.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Automatización de cocina doméstica: el modelo puede ejecutar secuencias como encender el fogón y colocar la cafetera moka encima, o introducir la fiambrera en el microondas y cerrarlo, aprovechando su entrenamiento específico sobre estas tareas.
- Manipulación de cajones y armarios: sirve para abrir y cerrar cajones del armario e introducir objetos como el bol negro, la mantequilla o el kétchup, gracias a las 6.500 demostraciones que cubren estas variantes.
- Organización de compra y despensa: permite colocar productos (sopa de letras, queso crema, tomate frito, leche, zumo de naranja) en cestas y bandejas, una tarea repetitiva y de alto valor en logística de almacén.
- Apilamiento y colocación de vajilla: puede apilar cuencos y colocar tazas en platos según instrucciones textuales, útil en entornos de restauración automatizada o laboratorios de robótica de servicio.
- Investigación en políticas VLA: al ser un ajuste fino de SmolVLA sobre un dataset público, sirve como punto de partida reproducible para estudiar transferencia, generalización y evaluación de políticas bimanuales.
- Prototipado en robótica de servicio: su tamaño compacto (450 M de parámetros, 0,9 GB) permite desplegarlo en estaciones de trabajo con GPU de gama media para validar flujos de manipulación antes de escalar a modelos mayores.
- Benchmarking de manipulación doméstica: el repertorio de tareas (fogón, microondas, armario, vinoteca) permite construir evaluaciones comparables entre políticas entrenadas sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB, por lo que la inferencia en precisión nativa requiere del orden de 1 a 2 GB de VRAM, más el coste de procesar tres imágenes de 256×256.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060, RTX 4060 o superior debería ser suficiente para inferencia en precisión nativa.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot (librería oficial de entrenamiento e inferencia); no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whosricky/lw_benchhub` | 450 M | no disponible | VLA bimanual (`double_piper`) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA base SmolVLA | no disponible | Hugging Face |
| Políticas VLA de mayor escala (p. ej. RT-2, OpenVLA) | no disponible en esta ficha | no disponible | VLA generalistas | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo base `lerobot/smolvla_base` es el ajuste fino sobre el dataset `LightwheelAI/Lightwheel-Tasks-Double-Piper` y la especialización en el robot `double_piper` con tres cámaras.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado para un robot concreto (`double_piper`) y un conjunto cerrado de tareas; no se espera que generalice a otros robots, morfologías o entornos sin reentrenamiento.
- Dependencia de la configuración de cámaras: requiere exactamente tres vistas (`left_hand`, `first_person`, `right_hand`) a 256×256; cambios en la disposición o calibración de las cámaras pueden degradar el rendimiento.
- Sin datos de benchmarks: no hay métricas publicadas de éxito por tarea, lo que impide evaluar su fiabilidad antes de desplegarlo.
- Riesgo de alucinación motriz: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante estados fuera de distribución; no existe mecanismo de verificación semántica.
- Idiomas no declarados: no se especifica qué lenguajes naturales soportan las instrucciones de tarea, aunque el dataset está descrito en inglés.
- Sin información sobre sesgos: no se han documentado sesgos demográficos, visuales o de otro tipo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que conviene revisar antes de producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación reciente sin validación comunitaria.
- Sin soporte declarado de cuantización: no se indican variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de muy bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whosricky/lw_benchhub
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LightwheelAI/Lightwheel-Tasks-Double-Piper
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
