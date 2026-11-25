# yuanhao-guo/DirectAct

## Resumen

DirectAct es una colección de checkpoints de inferencia para el método de investigación DirectAct, presentado en el artículo "DirectAct: Action Experts Can Just Predict the Action Chunk Without Denoising". El modelo lo publica el usuario yuanhao-guo en Hugging Face y el código asociado está en el repositorio guoyuanhao-git/DirectAct. No es un modelo de lenguaje generalista, sino un conjunto de políticas robóticas (VLA, vision-language-action) orientadas a la predicción de secuencias de acciones (action chunks) en entornos de manipulación.

La propuesta técnica es un "action expert" que predice directamente el chunk de acciones sin el proceso iterativo de denoising que emplean los modelos de flow matching o de difusión. La colección incluye cuatro variantes: FlowMatching (línea base), DirectAct, EndpointFM y MeanFlow, con dos configuraciones de pérdida (Huber y MSE) en DirectAct y EndpointFM para reproducibilidad.

Los checkpoints se construyen sobre dos pilares: los modelos Fast-WAM, inicializados a partir de Wan-AI/Wan2.2-TI2V-5B (modelo de generación de vídeo de 5B parámetros), y los modelos VLA estilo π, inicializados a partir de google/paligemma-3b-pt-224-jax. Los pesos se exportan en formato nativo Orbax (JAX), no en safetensors ni con interfaz Transformers, y el repositorio ocupa 106,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action expert sobre backbone VLA: Wan2.2-TI2V-5B (Fast-WAM) o PaliGemma-3B (estilo π); predicción directa de action chunk |
| Parametros totales | no disponible (el backbone Wan2.2-TI2V-5B es de 5B; PaliGemma-3B es de 3B; el action expert añade parámetros no cuantificados en la información) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export nativo Orbax en punto flotante; no se documentan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | other: per-model-wan-and-gemma-terms (términos de Wan y Gemma por modelo) |
| Formato de pesos | Orbax (JAX nativo); no hay safetensors ni `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

La arquitectura se compone de un backbone vision-language (Wan2.2-TI2V-5B para Fast-WAM / RoboTwin / Franka, o PaliGemma-3B para los modelos VLA estilo π en LIBERO) más un "action expert" que genera el chunk de acciones. La innovación central de DirectAct es eliminar el bucle de denoising: en lugar de refinar iterativamente una muestra de acciones como en flow matching o difusión, el action expert predice el chunk directamente. Las variantes EndpointFM y MeanFlow exploran formulaciones alternativas del mismo objetivo, y DirectAct se publica con pérdidas Huber y MSE.

Los modelos Fast-WAM se inicializan desde los pesos originales de Wan y desde una inicialización interpolada del action expert; los modelos VLA de LIBERO se inicializan desde PaliGemma original y un action expert nativo7 interpolado, no desde una política preentrenada encarnada (pi05_base). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card indica explícitamente que no se alojan demostraciones crudas ni el estado de recuperación de entrenamiento.

Las configuraciones de inferencia publicadas son: Fast-WAM / RoboTwin con predicción de 32 pasos y ejecución de 24, dimensiones actions14 y state14; π-style VLA / LIBERO con predicción de 10 y ejecución de 5, dimensiones actions7 y state8; y Fast-WAM / Franka con predicción de 32 y ejecución de 16, dimensiones actions8 y state8.

## Capacidades

- Predicción de action chunks para control robótico de manipulación en tres entornos: RoboTwin (Fast-WAM), LIBERO (VLA estilo π) y Franka (Fast-WAM).
- Generación directa de secuencias de acciones sin denoising iterativo, lo que reduce el coste de inferencia frente a flow matching.
- Control de pinza binaria (0 = abrir, 1 = agarrar) en el caso Franka, con estado medido de pinza como anchura continua.
- Acciones Franka expresadas como siete objetivos articulares absolutos más modo de pinza, a 30 Hz.
- Procesamiento de observaciones visuales mediante el backbone VLA (Wan o PaliGemma) y normalización específica por tarea.
- No se documentan tool calling, function calling, razonamiento multi-paso genérico ni capacidades de audio.

## Casos de uso

- Manipulación robótica en simulación RoboTwin: usar los checkpoints Fast-WAM con predicción de 32 pasos y ejecución de 24 para tareas bimanuales con estado de 14 dimensiones, aprovechando la predicción directa para reducir latencia de control.
- Benchmark de políticas VLA en LIBERO: emplear los modelos π-style con predicción de 10 y ejecución de 5 para evaluar generalización en tareas de manipulación de lenguaje instruccional, con dimensiones actions7 y state8.
- Control de brazo Franka en laboratorio: desplegar los checkpoints Fast-WAM / Franka a 30 Hz con siete objetivos articulares absolutos y modo de pinza binario para tareas de pick-and-place.
- Investigación en métodos de generación de acciones: comparar FlowMatching, DirectAct, EndpointFM y MeanFlow bajo las mismas condiciones para medir el coste y la calidad de eliminar el denoising.
- Reproducibilidad de resultados: usar las dos variantes de pérdida (Huber y MSE) de DirectAct y EndpointFM para replicar experimentos del artículo con configuraciones controladas.
- Integración en pipelines de evaluación con JAX: cargar los pesos Orbax desde el directorio `params` y ejecutar inferencia con el código del repositorio, verificando hashes del manifest antes de cada experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 106,9 GB, pero corresponde a múltiples checkpoints; el tamaño de un checkpoint individual no se detalla.
- GPU recomendadas: no disponible en la información; el stack es JAX/Orbax, por lo que se requieren GPUs compatibles con JAX (por ejemplo, series A100/H100) aunque no se confirma en la model card.
- Cabeza en GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante el código del repositorio guoyuanhao-git/DirectAct con JAX y pesos Orbax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DirectAct (esta ficha) | backbone 5B (Wan) o 3B (PaliGemma) + action expert | no disponible | Orbax (JAX) | other (Wan + Gemma) | Hugging Face, repo 106,9 GB |
| FlowMatching (incluido en la colección) | mismo backbone | no disponible | Orbax (JAX) | other (Wan + Gemma) | Incluido en el mismo repo |
| EndpointFM (incluido en la colección) | mismo backbone | no disponible | Orbax (JAX) | other (Wan + Gemma) | Incluido en el mismo repo |
| MeanFlow (incluido en la colección) | mismo backbone | no disponible | Orbax (JAX) | other (Wan + Gemma) | Incluido en el mismo repo |

No se dispone de datos de otros modelos VLA comparables (por ejemplo, π0 o RT-2) en la información proporcionada; la comparativa se limita a las variantes internas de la colección.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite chat, generación de texto libre ni tool calling; su uso está restringido a políticas robóticas.
- Los checkpoints no incluyen el VAE de Wan, los codificadores de texto ni el tokenizador de PaliGemma; son dependencias externas que deben obtenerse por separado.
- No hay interfaz `.safetensors` ni `from_pretrained` de Transformers; la integración exige el código del proyecto y el stack JAX/Orbax.
- Es imprescindible usar exactamente el procesamiento de cámara, el normalizador y la convención de pinza correspondientes a cada checkpoint; desviarse invalida los resultados.
- Las acciones predichas deben convertirse a FP32 antes de desnormalizar.
- Los pesos de inferencia no permiten restaurar el estado de optimizador, sampler ni RNG del entrenamiento.
- La verificación de hashes e integridad no sustituye la reproducción en hardware o simulador; hay que consultar el estado del manifest antes de usar un modelo mientras la subida inicial esté en curso.
- Licencia "other" con términos por modelo de Wan y Gemma: es necesario revisar LICENSE.md antes de cualquier uso comercial.
- Idiomas: solo inglés en las instrucciones; no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible para este dominio.

## Enlaces

- Hugging Face: https://huggingface.co/yuanhao-guo/DirectAct
- Código y documentación: https://github.com/guoyuanhao-git/DirectAct
- Índice de modelos: manifest.json (dentro del repositorio)
- Términos del modelo: LICENSE.md (dentro del repositorio)
- Modelo base Wan: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo base PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224-jax
