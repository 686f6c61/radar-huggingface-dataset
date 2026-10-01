# themohal/saraiki-libero-smolvla

## Resumen

Saraiki-libero-smolvla es una política robótica vision-language-action (VLA) publicada por el usuario themohal en HuggingFace. Se trata de un ajuste fino de `lerobot/smolvla_base`, el modelo SmolVLA presentado por HuggingFace en el paper arXiv:2506.01844, y se distribuye bajo licencia Apache-2.0 a través de la librería LeRobot. El checkpoint contiene 604.934.176 parámetros (unos 605 millones) almacenados en safetensors, con un repositorio de 9,2 GB.

El modelo resuelve el problema del control robótico guiado por lenguaje natural: recibe dos imágenes de cámara de 256×256 píxeles y un vector de estado de 8 dimensiones, y produce un vector de acción de 7 dimensiones. Está entrenado específicamente sobre el dataset `themohal/saraiki-libero`, compuesto por 1.693 episodios y 273.465 fotogramas a 10 FPS, con instrucciones redactadas en idioma saraiki (escritura shahmukhi). El robot objetivo declarado es un `panda`.

La relevancia de esta ficha radica en dos factores: por un lado, SmolVLA es un VLA compacto diseñado para ejecutarse en hardware de consumo, lo que baja la barrera de entrada para investigación en robótica; por otro, este ajuste concreto explora el uso de una lengua con pocos recursos (saraiki) para el condicionamiento de políticas robóticas, algo poco habitual y de interés para estudios de transferencia lingüística en control robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; combina un backbone VLM con un experto de acción entrenado por flow matching (detalles exactos en arXiv:2506.01844) |
| Parametros totales | 604.934.176 (605 M aproximadamente, segun safetensors) |
| Longitud de contexto | No aplicable (política robótica; consume un conjunto fijo de observaciones: dos imágenes de 256×256 y un vector de estado de 8 dimensiones) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantización declarada) |
| Idiomas soportados | No disponible en los metadatos; las instrucciones de las tareas del dataset están redactadas en saraiki (shahmukhi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

Datos adicionales de entrada/salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.images.image` | VISUAL | (3, 256, 256) |
| `observation.images.image2` | VISUAL | (3, 256, 256) |
| `observation.state` | STATE | (8,) |
| `action` | ACTION | (7,) |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de tipo vision-language-action que combina un backbone de visión-lenguaje preentrenado con un módulo experto de acción. El objetivo declarado por HuggingFace es lograr un rendimiento competitivo con un coste computacional reducido y permitir el despliegue en hardware de consumo. La model card de este repositorio no detalla la composición interna del backbone ni el número exacto de tokens de entrenamiento, por lo que esos datos deben consultarse en la publicación arXiv:2506.01844 y en la documentación de LeRobot.

El ajuste fino se ha realizado sobre `lerobot/smolvla_base` empleando el dataset `themohal/saraiki-libero`, que contiene 1.693 episodios y 273.465 fotogramas capturados a 10 FPS. Las instrucciones que acompañan a los episodios están escritas en saraiki y describen tareas de manipulación doméstica: colocar tazas sobre platos o cuencos en posiciones izquierda y derecha, introducir objetos en el microondas y cerrar la puerta, encender el fogón y colocar una cafetera, guardar latas y tarros en una cesta, colocar un cuenco en un cajón y cerrarlo, o depositar un libro en el hueco trasero de un mueble. No se documenta en la información disponible si el entrenamiento incluyó fases de RLHF, DPO u otras técnicas de alineación; en el contexto de políticas VLA esto sería inusual.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales y de estado: la política emite vectores de acción de 7 dimensiones aptos para un brazo manipulador tipo `panda`.
- Condicionamiento por lenguaje natural en saraiki (shahmukhi): las tareas del dataset se expresan como instrucciones textuales en ese idioma.
- Percepción visual con dos cámaras simultáneas de 256×256 píxeles, lo que permite cubrir vistas complementarias de la escena.
- Ejecución de tareas de manipulación doméstica aprendidas por imitación: colocación de objetos, apertura y cierre de puertas o cajones, encendido de fogones e inserción de objetos en contenedores.
- Despliegue en hardware de consumo: el modelo está diseñado explícitamente para funcionar en equipos no profesionales.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y ejecución.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio o visión general más allá del condicionamiento visual descrito.

## Casos de uso

- Manipulación robótica de pick-and-place: colocar tazas, cuencos o botellas en posiciones específicas (izquierda/derecha) sobre platos, mesas o estanterías. El modelo ha sido entrenado con esas tareas concretas, por lo que su uso directo en ese dominio es realista.
- Automatización de tareas de cocina simulada: encender el fogón y colocar una cafetera encima, introducir dos tazas en el microondas y cerrar la puerta, o colocar un plato sobre la zona delantera del fogón.
- Gestión de contenedores y almacenamiento: guardar latas de sopa, tarros de queso crema, mantequilla o salsa de tomate dentro de una cesta, o depositar objetos en cajones y cerrarlos.
- Investigación en políticas VLA de tamaño reducido: sirve como punto de partida para estudiar el equilibrio entre parámetros, coste de inferencia y capacidad de manipulación frente a modelos de mayor tamaño como OpenVLA o π0.
- Estudio de transferencia lingüística en robótica: permite analizar cómo una instrucción en una lengua con pocos recursos (saraiki) condiciona la ejecución motora de una política entrenada con ese vocabulario.
- Base para ajuste fino en nuevos robots o tareas: al derivar de `lerobot/smolvla_base` y usar LeRobot, puede reentrenarse con datasets propios de manipulación sin partir de cero.
- Despliegue en robótica de bajo coste o laboratorios con GPUs de gama media: el tamaño de 605 M de parámetros facilita la inferencia en equipos asequibles, incluidos escenarios educativos y de prototipado.
- Evaluación comparativa de idiomas en el condicionamiento de políticas: útil para generar pares de instrucciones equivalentes en distintos idiomas y medir el impacto en la tasa de éxito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de manipulación (tasa de éxito, error de posición final, etc.). Cualquier cifra de rendimiento debe consultarse en el paper arXiv:2506.01844 o generarse mediante evaluación propia con LeRobot sobre el dataset `themohal/saraiki-libero`.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 2,4 GB solo para los pesos (605 M de parámetros × 4 bytes).
- VRAM estimada en BF16/FP16: aproximadamente 1,2 GB para los pesos; con activaciones de dos imágenes de 256×256 y estado, es razonable prever un consumo total del orden de 2-4 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM debería ser suficiente en precisión reducida; modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 o H100 son válidos. La elección dependerá del throughput de control requerido.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama media con al menos 6 GB de VRAM; también es viable su ejecución en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), PyTorch estándar y, potencialmente, exportación a ONNX Runtime o TensorRT para optimización. Los servidores de LLM como vLLM, TGI o llama.cpp no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponible en la información proporcionada. El paper de SmolVLA menciona inferencia asíncrona y despliegue en hardware de consumo, pero no se ofrecen cifras concretas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saraiki-libero-smolvla (este) | 605 M | VLA (SmolVLA) | 2 imágenes 256×256 + estado 8D | Apache-2.0 | HuggingFace / LeRobot |
| lerobot/smolvla_base | 450 M (aproximado, paper) | VLA (SmolVLA) | 2 imágenes 256×256 + estado | Apache-2.0 | HuggingFace / LeRobot |
| OpenVLA | 7 000 M (aproximado) | VLA | Imagen + instrucción | Llama 2 (con restricciones) | HuggingFace / repositorio |
| π0 (pi-zero) | 3 300 M (aproximado) | VLA con flow matching | Imágenes + estado + lenguaje | Sujeta a verificación | Repositorio openpi |

Los valores de parámetros de los modelos comparativos son aproximados y proceden de información pública; deben verificarse en las fuentes originales antes de citarlos. No se dispone de comparativas de rendimiento (tasa de éxito) entre estos modelos y el checkpoint aquí descrito, ya que no se han publicado métricas en la información disponible.

## Limitaciones y advertencias

- Modelo especializado: es un ajuste fino orientado a las tareas y al dominio del dataset `themohal/saraiki-libero`. Fuera de esas tareas de manipulación doméstica su comportamiento no está garantizado.
- Dependencia del robot y cámaras: está configurado para el tipo `panda` y dos cámaras (`image`, `image2`) con observaciones de 256×256; cambiar la morfología, el número de cámaras o la resolución puede degradar el rendimiento.
- Idiomas: las instrucciones del dataset están en saraiki; no se documenta si el modelo responde correctamente a instrucciones en otros idiomas. Podría fallar o degradarse fuera de ese registro lingüístico.
- Riesgo de alucinación: en políticas VLA, el equivalente es la ejecución de movimientos no solicitados o incorrectos ante entradas fuera de distribución, con el consiguiente riesgo físico en un robot real.
- Sesgos: el dataset puede sobrerrepresentar determinadas posiciones, colores de objetos y configuraciones de escena (tazas blancas, platos izquierda/derecha, microondas, fogón), lo que limita la generalización.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `lerobot/smolvla_base` y de los datasets empleados si se redistribuye o se integra en productos.
- Producción: no hay métricas publicadas de tasa de éxito ni de robustez; se recomienda evaluación propia y validación en entorno controlado antes de cualquier despliegue real.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/themohal/saraiki-libero-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/themohal/saraiki-libero
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo. Los enlaces obtenidos correspondían a una marca de ropa sin relación con el contenido, por lo que se han descartado.
