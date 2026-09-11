# Younguk1/omx_act_policy

## Resumen

Younguk1/omx_act_policy es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset de demostraciones teleoperadas Younguk1/pick_and_place_20260910_150534, lo que sugiere un caso de uso concreto de recogida y colocación (*pick and place*).

Se trata de un modelo pequeño: 51.668.614 parámetros almacenados en formato safetensors, con un repositorio de 0,2 GB. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino una política de control entrenada para una tarea y un robot concretos. Su relevancia radica en que ejemplifica el flujo de trabajo actual de robótica open source con LeRobot: entrenar una política ACT desde un dataset de demostraciones y desplegarla directamente sobre hardware de bajo coste tipo SO-100/SO-101.

El checkpoint fue creado el 11 de septiembre de 2026 y no registra descargas ni *likes* en el momento de redactar esta ficha, por lo que debe considerarse un artefacto personal o experimental más que un modelo de referencia con validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con componente CVAE para aprendizaje por imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control robótico; no es un modelo de lenguaje con ventana de tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | Younguk1/pick_and_place_20260910_150534 |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT, descrito en el paper arXiv:2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*), es un método de aprendizaje por imitación supervisado que se entrena exclusivamente con demostraciones teleoperadas. En lugar de predecir una acción por paso de tiempo, el modelo predice un *chunk* de acciones futuras de una sola vez, lo que reduce el problema de horizonte de decisión y mitiga el sesgo de parada (*stopping bias*) típico de las políticas que actúan paso a paso. La arquitectura combina un transformador encoder-decoder con un esquema de autoencoder variacional condicional (CVAE): un codificador consume las observaciones junto con la secuencia de acciones objetivo y produce una variable latente de estilo, que se fija a cero en inferencia. Las observaciones visuales se procesan mediante un backbone convolucional tipo ResNet, y las acciones se generan con una pérdida de reconstrucción L1 combinada con regularización KL. En inferencia suele emplearse *temporal ensembling* para combinar los fragmentos solapados y suavizar la trayectoria.

No se dispone de información específica sobre el entrenamiento de este checkpoint concreto: no se indica el número de episodios, el número de pasos de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales de ajuste (RLHF, DPO u otras, poco habituales en este dominio). Tampoco se detallan las modificaciones respecto a los hiperparámetros por defecto de LeRobot. Todo ello debe considerarse no disponible.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de bajo nivel (posiciones articulares o del efector final, según la configuración del robot) a partir de observaciones visuales y del estado del robot.
- Predicción por *action chunks*: emite varios pasos de acción por inferencia, lo que permite frecuencias de control más altas y trayectorias más suaves que las políticas de paso único.
- Manipulación tipo *pick and place*: el nombre del dataset asociado indica que la política está especializada en tareas de recogida y colocación de objetos.
- Entrada multimodal de percepción: consume imágenes de cámara (habitualmente varias vistas) y el estado propioceptivo del robot.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-train` y `lerobot-record`.
- Soporte de hardware de bajo coste: el flujo declarado en la model card emplea un robot `so100_follower`, de la familia SO-100/SO-101.
- No dispone de: generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente multi-paso, ni competencia multilingüe.

## Casos de uso

- Automatización de *pick and place* en entornos controlados: la política puede ejecutar ciclos de recogida y colocación de piezas en una celda de trabajo con iluminación y posiciones de cámara estables, aprovechando que fue entrenada específicamente sobre ese tipo de demostraciones.
- Prototipado rápido de robótica de bajo coste: un equipo con un brazo SO-100/SO-101 y una cámara puede grabar demostraciones teleoperadas, entrenar una política ACT con LeRobot y desplegarla el mismo día, sin necesidad de modelado cinemático explícito ni planificación.
- Investigación en aprendizaje por imitación: sirve como *baseline* reproducible para comparar ACT frente a políticas de difusión u otros métodos sobre el mismo dataset y el mismo robot.
- Evaluación de robustez ante variaciones: se pueden medir tasas de éxito cambiando posición de objetos, iluminación o texturas, y compararlas con las de otros checkpoints entrenados con los mismos datos.
- Clasificación y separación de objetos en líneas de alimentación o *kitting*: si el dataset cubre varias categorías y ubicaciones de destino, la política puede reutilizarse para tareas de ordenación repetitiva.
- Docencia y talleres de robótica con IA: el reducido tamaño del modelo (0,2 GB, ~52 M de parámetros) permite que estudiantes lo entrenen y evalúen en una única GPU de consumo.
- Teleoperación asistida con autonomía parcial: como política de imitación puede emplearse para ejecutar segmentos autónomos de una tarea mientras un operador interviene en los puntos críticos.
- Generación de datos sintéticos de trayectorias: las predicciones del modelo pueden usarse para aumentar un dataset de demostraciones antes de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas, y el repositorio no registra descargas ni validación por parte de terceros. El paper de referencia (arXiv:2304.13705) reporta sus propios resultados experimentales, pero no corresponden a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 207 MB en FP32 (51,67 M de parámetros × 4 bytes) y unos 103 MB en FP16/BF16. Con activaciones, buffers de imágenes y overhead del runtime de PyTorch, el consumo total en inferencia es del orden de 1-2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema; no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en iGPU con suficiente memoria compartida, aunque con latencia mayor.
- Opciones de despliegue: el flujo nativo es LeRobot sobre PyTorch con `--policy.device=cuda` (también admite CPU). No se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, TGI u Ollama, que no son aplicables a una política de control.
- Latencia y throughput: no disponible. La frecuencia de control alcanzable depende del hardware, del número de cámaras y de la longitud del *chunk* de acciones, parámetros que no se especifican en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| omx_act_policy (este) | ACT (imitation learning) | 51.668.614 | Apache 2.0 | Hugging Face, vía LeRobot | Especializado en una tarea de *pick and place*; 0 descargas |
| ACT original (Zhao et al., 2023) | ACT (imitation learning) | No disponible | No disponible | Paper y código de referencia | Referencia metodológica; usa demostraciones bimanuales con hardware de bajo coste |
| Diffusion Policy (Chi et al., 2023) | Política de difusión | No disponible | No disponible | Paper y código público | Alternativa habitual a ACT; modela distribuciones multimodales de acciones, con mayor coste de inferencia |
| VQ-BeT / variantes de discretización de acciones | Imitation learning con codebook | No disponible | No disponible | Repositorios públicos | Enfoques alternativos de representación de acciones; los datos concretos no están disponibles en la información consultada |

No se dispone de cifras homogéneas de rendimiento para estos modelos en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada sobre un único dataset de *pick and place*; es previsible que falle ante cambios de tarea, de robot, de cámara o de disposición de los objetos.
- Sin validación comunitaria: 0 descargas y 0 *likes*; no hay evidencia externa de que el checkpoint funcione correctamente ni de su tasa de éxito real.
- Riesgo de sobreajuste al entorno de demostración: en aprendizaje por imitación, variaciones de iluminación, fondo, texturas o posición inicial degradan el rendimiento de forma notable.
- Ausencia de benchmarks: no hay métricas publicadas, por lo que no se puede comparar objetivamente con otras políticas antes de desplegarla.
- Sesgos heredados de los datos: las demostraciones teleoperadas reflejan el estilo, la velocidad y las preferencias del operador que las grabó; la política reproducirá esos patrones, incluidas posibles ineficiencias.
- Sin capacidades de razonamiento o lenguaje: no puede interpretar instrucciones en lenguaje natural, ni planificar tareas de forma simbólica, ni invocar herramientas.
- Limitaciones idiomáticas: no aplica, al no ser un modelo de lenguaje; no obstante, tampoco se documenta ningún tipo de interacción lingüística.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar los avisos de licencia y de atribución; conviene verificar las licencias del dataset asociado y del código de LeRobot antes de un despliegue comercial.
- Sin garantías: la model card no ofrece información sobre seguridad física, paradas de emergencia ni límites de par/fuerza; cualquier uso sobre hardware real exige supervisión y salvaguardas externas.
- Caveat de producción: al ser una política de control, los fallos se traducen en movimientos físicos incorrectos, no solo en texto erróneo; la validación debe hacerse en entorno simulado y con limitadores de seguridad antes de operar con hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Younguk1/omx_act_policy
- Dataset asociado: https://huggingface.co/datasets/Younguk1/pick_and_place_20260910_150534
- Paper de ACT en Hugging Face Papers: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a herramientas de conversión de PDF y no se han incluido.
