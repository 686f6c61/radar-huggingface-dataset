# zhengfe/2026-10-40-single-action-smolvla

## Resumen

El modelo zhengfe/2026-10-40-single-action-smolvla es un checkpoint de política vision-language-action (VLA) especializado en una única tarea robótica sobre el robot AgiBot G2: colocar con la mano derecha una caja negra sobre una zona negra de la mesa. Se trata de un ajuste fino (fine-tuning) del modelo base lerobot/smolvla_base, que a su vez emplea el backbone SmolVLM2-500M-Video-Instruct. Lo publica el usuario zhengfe dentro del ecosistema LeRobot y está pensado para control robótico por imitación, no para inferencia de propósito general.

El modelo tiene 450.046.176 parámetros (unos 450 millones) y consume tres flujos de imagen RGB (cámara de cabeza y dos cámaras de muñeca) junto con un vector de estado de 16 dimensiones que combina articulaciones de ambos brazos y ambas pinzas. Produce un chunk de acciones de forma (batch, 50, 16), del cual se aplican normalmente los 10 primeros pasos configurados, equivalentes a unos 0,33 segundos a 30 Hz nominales. Se entrenó durante 5.000 pasos sobre 42 episodios de demostración (23.149 fotogramas) y usa LeRobot 0.4.4.

Su relevancia es doble. Por un lado, demuestra el flujo de trabajo de SmolVLA, un VLA de 450M pensado para operar con hardware asequible y competir con modelos mucho mayores. Por otro, es un caso de política de tarea única sobre un robot concreto, con un contrato de entrada/salida muy definido. Conviene señalar que la model card advierte explícitamente de que no existe evaluación en robot real ni conjunto de validación reservado, por lo que sus prestaciones en el mundo físico no están verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLM2-500M-Video-Instruct con experto de acciones por flow matching |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Datos adicionales del contrato de entrada/salida: vector de estado y de acción de 16 dimensiones cada uno; orden de izquierda a derecha (articulaciones del brazo izquierdo 1-7, brazo derecho 1-7, pinza izquierda, pinza derecha); chunk de acción predicho de 50 pasos y 10 pasos configurados; normalización con estadísticas MEAN_STD separadas para STATE y ACTION.

## Arquitectura y entrenamiento

El modelo parte de lerobot/smolvla_base, que combina un backbone de visión-lenguaje SmolVLM2-500M-Video-Instruct (revisión 7b375e1b73b11138ff12fe22c8f2822d8fe03467) con un experto de acciones entrenado mediante flow matching. Este diseño corresponde a la familia SmolVLA descrita en el paper arXiv:2506.01844, que propone un VLA de 450M parámetros pretrenado sobre aproximadamente 23.000 episodios recopilados por la comunidad y capaz de igualar o superar a modelos diez veces mayores, además de incorporar una pila de inferencia asíncrona que acelera el control real en torno a un 30 por ciento.

En este checkpoint concreto, el ajuste fino se realizó durante 5.000 pasos con tamaño de lote 8 y tasa de aprendizaje 5e-5, sobre 42 episodios (23.149 fotogramas) a 30 fps nominales, usando LeRobot 0.4.4 con una corrección registrada de la máscara de pérdida. La model card indica que todos los episodios se usaron para entrenamiento, sin conjunto de validación reservado, y que el estado interno de 32 dimensiones es un relleno que no debe sustituir al estado real de 16 dimensiones. También se preservan los procesadores guardados, con estadísticas de estado y acción distintas, especialmente en las pinzas.

## Capacidades

- Generación de acciones robóticas: produce chunks de acción de (batch, 50, 16) para control bimanual del AgiBot G2.
- Percepción multimodal: consume tres cámaras RGB (cabeza, muñeca izquierda, muñeca derecha) y realimentación de articulaciones y pinzas.
- Control por lenguaje natural condicionado a tarea: la política está condicionada por el texto de la tarea (en este caso, colocar la caja negra sobre la zona negra).
- Aprendizaje por imitación: entrenado a partir de demostraciones humanas, no por refuerzo.
- Soporte bilingüe a nivel de anotación e idioma declarado (inglés y chino).
- No dispone de entrada táctil: la model card lo indica explícitamente.
- No hay evidencia de soporte de tool calling, agentes, razonamiento multi-paso ni visión general (solo percepción para control).
- La capacidad bimanual no está demostrada: el comportamiento del brazo izquierdo es casi constante en los datos de entrenamiento.

## Casos de uso

- Automatización de una tarea de pick-and-place concreta: el modelo ejecuta la colocación de la caja negra en la zona negra de la mesa con el brazo derecho del AgiBot G2, gracias a su política especializada y a la condicion textual de tarea.
- Banco de pruebas de pipelines LeRobot: sirve para validar el ciclo completo de carga, preprocesado, inferencia y postprocesado con lerobot[smolvla]==0.4.4 antes de desplegar políticas mayores.
- Investigación en imitación con pocos datos: permite estudiar cómo rinde un VLA de 450M ajustado con solo 42 episodios y 23.149 fotogramas.
- Evaluación de protocolos de normalización: útil para comprobar el manejo de estadísticas MEAN_STD separadas para estado y acción, un punto crítico en pinzas y comandos 0-1.
- Reproducibilidad de experimentos: al incluir el backbone empaquetado y la revisión fijada, facilita reproducir la versión exacta del recurso.
- Integración en simuladores o gemelos digitales: el chunk de 50 pasos y el prefijo de 10 pasos permiten probar cadencias de control antes de tocar hardware real.
- Formación y docencia en robótica: ejemplo didáctico de contrato de entrada/salida estricto (tres cámaras, estado de 16 dimensiones, orden de articulaciones definido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card indica que no hay evaluación en robot real y que la prueba de humo en la nube solo verificó que la salida es finita con forma (1, 50, 16) sobre un fotograma de entrenamiento, sin medir tasa de éxito. La pérdida de entrenamiento no equivale a tasa de éxito en el mundo físico.

De forma cualitativa, el paper de la familia SmolVLA (arXiv:2506.01844) reporta que un VLA de 450M entrenado sobre unos 23.000 episodios rinde de forma competitiva frente a modelos diez veces mayores, como π0-3.3B, y supera a la variante de π0 inicializada desde un VLM. Estos datos corresponden al modelo base SmolVLA, no a este checkpoint fine-tuned.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,8 GB en FP32, 0,9 GB en FP16/BF16 y 0,45 GB en INT8, calculada a partir de los 450M parámetros. Hay que sumar el overhead de activaciones, tres imágenes de alta resolución y el backbone empaquetado (unos 2,94 GB de repositorio).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM efectiva para FP16/BF16; se recomiendan RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues con margen.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo modernas (RTX 3060 12 GB o superior) en FP16, y en GPUs con 8 GB en cuantizaciones más agresivas, siempre que se valide el entorno.
- Opciones de despliegue: el modelo está diseñado para LeRobot 0.4.4 (lerobot[smolvla]), con PyTorch; la model card muestra un flujo de carga vía snapshot_download, SmolVLAConfig, SmolVLAPolicy y make_pre_post_processors. No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card aclara que el prefijo de 10 pasos configurados equivale a unos 0,33 s a 30 Hz, pero que esto no garantiza inferencia a 30 Hz. Existe además una pila de inferencia asíncrona documentada en el paper de SmolVLA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhengfe/2026-10-40-single-action-smolvla | 450M | no disponible | sin benchmark publicado para este checkpoint | no disponible | Hugging Face (LeRobot) |
| lerobot/smolvla_base | 450M | no disponible | VLA base de la familia SmolVLA; competitivo frente a modelos ~10x mayores segun el paper | no disponible en la informacion disponible | Hugging Face |
| π0 (±3.3B) | ~3,3B | no disponible | Referencia comparativa citada en el paper de SmolVLA | no disponible en la informacion disponible | no disponible en la informacion disponible |

La comparativa se limita a estos modelos porque la información proporcionada no detalla más alternativas con cifras concretas. No se han facilitado números de benchmarks que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No existe conjunto de validación reservado: los 42 episodios se usaron íntegramente para entrenamiento.
- No hay evaluación en robot real registrada; la prueba de humo en la nube solo comprobó salidas finitas, no tasa de éxito.
- Riesgo de sobreajuste a la tarea y al entorno concreto de demostración (posición de la caja, iluminación, disposición de la mesa).
- Comportamiento bimanual no demostrado: el brazo izquierdo es casi constante en los datos, por lo que no se puede afirmar operación bimanual general.
- Las predicciones de pinza pueden salir fuera del rango nominal de comando; es obligatorio validar salidas y temporización antes de enviar comandos al hardware.
- Las unidades articulares y la semántica de los comandos de pinza deben coincidir con el controlador de despliegue; la realimentación de pinza y los comandos 0-1 no son intercambiables.
- No incluye entrada táctil.
- Idiomas declarados limitados a inglés y chino; no hay evidencia de cobertura multilingüe amplia.
- Licencia no disponible: no se puede verificar si permite uso comercial, por lo que se debe consultar al autor antes de un despliegue productivo.
- Advertencias de reproducibilidad: requiere LeRobot 0.4.4, la revisión exacta del backbone y el uso correcto de los procesadores guardados; sustituir el estado real de 16 dimensiones por el relleno interno de 32 rompe el contrato de entrada.
- Solo 6 descargas y 0 interacciones: comunidad y validación externa prácticamente nulas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhengfe/2026-10-40-single-action-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Backbone: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/zhengfe/2026-10-40-single-action
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Resumen del paper: https://kendrick-stein.github.io/MCISLAB_DeepRead/Papers/2506-SmolVLA
