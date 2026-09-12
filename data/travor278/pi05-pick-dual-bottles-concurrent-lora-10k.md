# Travor278/pi05-pick-dual-bottles-concurrent-lora-10k

## Resumen

pi05-pick-dual-bottles-concurrent-lora-10k es un checkpoint de ajuste fino LoRA sobre el modelo vision-lenguaje-accion (VLA) PI0.5, publicado por el usuario Travor278 en HuggingFace. El modelo deriva de la base original XinY0201/openpi-pi05-base-jax y se ha entrenado con la libreria openpi (JAX) para una unica tarea de manipulacion robotica: recoger dos botellas de forma concurrente a partir del prompt nativo "Pick up two bottles.".

El repositorio contiene el arbol completo de parametros de inferencia (base + LoRA) y los activos de normalizacion en formato Orbax, con un tamano de 6,3 GB. El ajuste se realizo sobre un dataset de 50 episodios y 8066 fotogramas a 25 FPS, con acciones y estados absolutos de 14 dimensiones, tres camaras RGB y preprocesado estandar de 224x224, sin conversion de unidades tipo delta/Aloha ni mascara de inactividad.

Es relevante como ejemplo reproducible de fine-tuning LoRA sobre la pila OpenPI: documenta configuracion de entrenamiento, manifiestos de dataset y base, verificaciones de finitud de parametros y hashes, aunque el propio autor declara explicitamente que no se reclama ninguna tasa de exito en rollout. Se trata por tanto de un artefacto de investigacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA PI0.5 (base JAX XinY0201/openpi-pi05-base-jax); backbone PaliGemma con adaptadores LoRA y un action expert (el model card indica "standard single action expert") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16 para activaciones y pesos congelados, float32 para pesos entrenables; no se publican cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible; el prompt nativo documentado esta en ingles ("Pick up two bottles.") |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax de JAX/OpenPI (raiz `10000/`), no safetensors ni GGUF |
| Dimension de acciones/estado | 14 dimensiones absolutas |
| Camaras | 3 RGB, preprocesado 224x224 |
| Horizonte de accion | 50 (pad 32) |
| Tamano del repositorio | 6,3 GB |
| Libreria / pipeline | openpi / robotics |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA de PI0.5 en su implementacion JAX, construido sobre un backbone PaliGemma con un action expert dedicado a generar la secuencia de acciones. Segun el model card, se aplican adaptadores LoRA con rango/alpha 16 en el backbone y rango 32 en el expert, y el filtro de referencia incluye vision y proyecciones entrenables. Las activaciones y los pesos congelados se mantienen en bf16, mientras que los pesos entrenables estan en float32. La observacion se compone de tres camaras RGB a 224x224 y un vector de estado de 14 dimensiones; la salida es una secuencia de acciones absolutas de 14 dimensiones con horizonte 50 y padding 32.

El entrenamiento se ejecuto en dos GPU H100 de 80 GB con batch global 16, semilla 87431 y 10000 updates. El optimizador es AdamW con b1=0,9, b2=0,95, eps=1e-8, weight decay 1e-10, clip 1 y sin EMA, siguiendo un plan de learning rate coseno fijo a 30k pasos con 1000 de warmup, pico 2,5e-5 y final 2,5e-6, detenido a los 10k pasos. Los datos proceden del dataset Shiki42/ctr-pick-dual-bottles-concurrent-20260911 (50 episodios, 8066 fotogramas a 25 FPS). El autor indica que se superaron las puertas de verificacion de estadisticas de dataset, decoder/tokenizer real y guardado/recarga en CPU antes del envio a GPU, y que los arboles finales de parametros y optimizador se restauraron y comprobaron como finitos con el paso 10000 verificado. No se declara ninguna innovacion adicional mas alla del propio ajuste LoRA.

## Capacidades

- Manipulacion robotica de tarea unica: recoger dos botellas de forma concurrente, condicionada al prompt "Pick up two bottles.".
- Percepcion visual multimodal mediante tres camaras RGB con preprocesado 224x224.
- Entrada de estado propietario de 14 dimensiones absolutas y salida de acciones de 14 dimensiones absolutas.
- Generacion de secuencias de accion con horizonte 50 y padding 32, apta para control por chunks.
- Inicializacion de inferencia completa: el checkpoint incluye arbol de parametros base+LoRA y activos de normalizacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso en el sentido de un LLM.
- No se documentan capacidades multilingues.
- No se documentan modos especiales (thinking, vision generativa, audio).

## Casos de uso

- Recogida bimanual concurrente de dos botellas en laboratorio: el modelo genera acciones absolutas de 14 dimensiones con horizonte 50 a partir de tres vistas RGB, lo que permite planificar y ejecutar la aproximacion y agarre de ambos objetos en una sola politica de tarea unica.
- Reproduccion de experimentos de fine-tuning LoRA sobre PI0.5: al publicarse configuracion de entrenamiento, manifiestos de dataset y base, e informes de verificacion, sirve como punto de partida para replicar el pipeline OpenPI con otra tarea o dataset.
- Base para adaptar tareas bimanuales similares: al ser un ajuste LoRA sobre la base JAX original, se puede reutilizar como inicializacion para nuevos datasets de manipulacion con dos brazos o dos objetos.
- Evaluacion de decodificacion de acciones con horizonte largo: el horizonte 50 con pad 32 permite estudiar el efecto del chunking en estabilidad de control dentro de OpenPI.
- Pruebas de integracion de checkpoints Orbax en pipelines JAX: el repositorio conserva el arbol de inferencia y los activos de normalizacion, util para validar cargas, normalizacion y compatibilidad antes de sustituir el modelo por otro.
- Investigacion en transferencia de politicas especificas de tarea: permite comparar el efecto de 10000 updates con LoRA rango 16/32 frente a otros checkpoints del mismo pipeline.
- Banco de pruebas de despliegue en simulacion o gemelo digital: al no declararse tasa de exito, es apropiado para validar en simulacion antes de cualquier prueba fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica explicitamente "No rollout success-rate claim", por lo que no hay tasas de exito, MMLU, HumanEval, GSM8K ni metricas de manipulacion comparables.

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU H100 de 80 GB con batch global 16 durante 10000 updates.
- VRAM de inferencia estimada (no declarada por el autor): el repositorio pesa 6,3 GB y contiene pesos congelados en bf16 y pesos entrenables en float32; se estima un rango de 12-20 GB en funcion del runtime, el tamano de lote y las tres camaras a 224x224. Es una estimacion, no un dato oficial.
- GPU recomendadas: H100 o A100 de 80 GB para reproducir el entrenamiento; para inferencia cabe previsiblemente en GPU de 24 GB como la RTX 4090, aunque no hay confirmacion oficial.
- Despliegue: runtime OpenPI/JAX. El model card menciona ejecucion del checkpoint sobre un runtime JAX construido aparte dentro del contenedor NGC PyTorch 25.02, y advierte de que ese runtime no se reclama identico al runtime archivado de CTR.
- Formatos de despliegue habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este checkpoint al ser Orbax sobre JAX y no publicarse GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Solo se dispone de informacion verificable del propio checkpoint y de la base que referencia. El resto de campos no estan publicados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick-dual-bottles-concurrent-lora-10k (este) | no disponible | no disponible | sin tasa de exito declarada | no disponible | HuggingFace, repo 6,3 GB, Orbax |
| XinY0201/openpi-pi05-base-jax (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros ajustes LoRA de PI0.5 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La busqueda web realizada no devolvio resultados relevantes para esta comparativa (los resultados obtenidos corresponden a sitios de cajas de CS2 y no guardan relacion con el modelo).

## Limitaciones y advertencias

- Modelo de tarea unica: solo se ha ajustado para el prompt "Pick up two bottles."; no es un modelo generalista.
- No se reclama ninguna tasa de exito en rollout ("No rollout success-rate claim"), por lo que no hay evidencia publicada de rendimiento en el mundo real.
- Sesgos conocidos: no disponibles; no se documenta analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones no validas fuera de la distribucion del dataset; no hay evaluacion publicada al respecto.
- Limitaciones de contexto e idioma: no se especifica longitud de contexto ni idiomas soportados; el unico prompt documentado esta en ingles.
- Normalizacion dependiente del dataset: al no usar conversion delta/Aloha ni mascara de inactividad, el modelo depende de la escala absoluta de acciones y estados del dataset de entrenamiento (50 episodios, 8066 fotogramas).
- Restricciones de licencia: la licencia no esta indicada en la informacion disponible, por lo que el uso comercial no puede asumirse como permitido.
- Dependencia de plataforma: requiere runtime OpenPI/JAX y carga del arbol Orbax; no es portable directamente a stacks de inferencia de LLM.
- Entrenamiento detenido a 10000 de los 30000 pasos planificados, con posible margen de mejora no explorado.
- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-concurrent-lora-10k
- Base referenciada: https://huggingface.co/XinY0201/openpi-pi05-base-jax (commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658)
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-concurrent-20260911 (commit 8dff735a7870df46edc853a019f288d20f6c82af)
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Busqueda web: sin resultados relevantes; los enlaces devueltos correspondian a plataformas de cajas de CS2 y no se incluyen por no ser pertinentes.
