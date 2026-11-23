# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_beta2_0.7

## Resumen

Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_beta2_0.7 es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base granite-4.0-h-micro de IBM. Lo publica el usuario TravelDistillation y forma parte de una familia de experimentos de destilación de preferencias entre el modelo "tiny" (7B) y el "micro" (3B) de la familia Granite 4.0, evaluados sobre el conjunto RCAEval_2. El objetivo declarado por el nombre del artefacto es transferir el comportamiento preferido del modelo mayor al menor mediante pares de preferencia generados entre ambos.

El artefacto es un adaptador PEFT, no un modelo completo: el repositorio ocupa 6,4 GB y contiene pesos en safetensors junto con los ficheros de configuración de LoRA y el estado del trainer. Está pensado para cargarse sobre granite-4.0-h-micro con la librería `peft` y `transformers`, y su pipeline declarado es text-generation con etiqueta conversational.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (todos los apartados de descripción, usos previstos y datos de evaluación figuran como "More information needed") y sin resultados de benchmarks publicados en el model-index. Debe tratarse, por tanto, como material experimental reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre granite-4.0-h-micro; el modelo base pertenece a la familia Granite 4.0 con arquitectura híbrida Mamba-2/Transformer (granitemoehybrid) |
| Parametros totales | No disponible para el adaptador; el modelo base granite-4.0-h-micro es un MoE de aproximadamente 3B parámetros totales según la nomenclatura del autor |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con DPO sobre granite-4.0-h-micro. El tag `granitemoehybrid` del repositorio indica que el modelo base emplea la arquitectura híbrida de Granite 4.0, que combina capas Mamba-2 con capas de atención Transformer en un esquema Mixture-of-Experts. El adaptador en sí no modifica la arquitectura: añade matrices de bajo rango sobre las proyecciones del modelo base y se carga con `peft`.

El entrenamiento se realizó sobre el dataset `preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, un conjunto de pares de preferencia construido a partir de comparaciones entre las salidas de granite-4.0-h-micro y granite-4.0-h-tiny sobre la evaluación RCAEval_2. Los hiperparámetros declarados son: learning rate 5e-05, batch size de entrenamiento 1 con 8 pasos de acumulación (batch efectivo 8), una única época, scheduler coseno con warmup del 10 %, semilla 42 y optimizador AdamW (betas 0.9/0.999, epsilon 1e-08). El sufijo del nombre (`newReward_C_Macro_Micro_beta2_0.7`) sugiere una función de recompensa personalizada con agregación macro y micro y un coeficiente beta de 0.7 para el término de regularización de DPO, aunque el autor no documenta estos detalles en la model card. Las versiones de framework empleadas son PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Generación de texto conversacional, heredada del modelo base granite-4.0-h-micro.
- Ajuste fino de preferencias orientado a la tarea RCAEval_2, presumiblemente análisis de causa raíz (RCA) sobre datos de evaluación, aunque el autor no lo documenta.
- Capacidad de razonamiento y respuesta multi-turno en la medida en que lo permita el modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en destilación de preferencias: el adaptador sirve como artefacto reproducible para estudiar cómo DPO sobre pares generados por un modelo mayor (tiny 7B) modifica el comportamiento de un modelo menor (micro 3B). Se cargaría con `PeftModel.from_pretrained` sobre granite-4.0-h-micro y se compararía contra el base sin adaptador.
- Evaluación de funciones de recompensa personalizadas: el nombre del checkpoint indica una recompensa con agregación macro/micro y beta 0.7; puede usarse para replicar y contrastar esa configuración frente a DPO estándar en tareas de RCA.
- Análisis de causa raíz sobre logs y trazas: si el dataset RCAEval_2 corresponde a diagnóstico de fallos, el adaptador podría emplearse para generar hipótesis de causa raíz a partir de trazas, siempre con validación humana y sin asumir calidad de producción.
- Baseline para experimentos de alineación: útil como punto de comparación en estudios que varíen beta, función de recompensa o tamaño del modelo donante.
- Prototipado de asistentes conversacionales especializados: el adaptador puede integrarse en un pipeline de `transformers` para generar respuestas conversacionales en dominios acotados, con la cautela de que no hay evaluación publicada.
- Reproducción de experimentos: dado que la model card incluye hiperparámetros completos y versiones de framework, permite reproducir el entrenamiento con TRL y PEFT en un entorno controlado.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base granite-4.0-h-micro (aproximadamente 3B parámetros), no del adaptador. En fp16 se estiman en torno a 6-7 GB solo para pesos; en 8 bits, unos 3-4 GB; en 4 bits, unos 2 GB, más overhead de contexto y activaciones.
- GPU recomendadas: A100 40 GB u H100 para despliegues con contexto largo y concurrencia; RTX 4090 (24 GB) o L40S para inferencia en fp16 con margen.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB si se cuantiza el modelo base a 8 o 4 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA sobre el modelo base, aunque la compatibilidad con la arquitectura híbrida Mamba-2/Transformer debe verificarse en la versión concreta. llama.cpp y Ollama requerirían fusionar el adaptador en el modelo base y convertirlo a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2 (este) | Adaptador sobre ~3B (base) | No disponible | LoRA + DPO | No disponible | Hugging Face, 0 descargas |
| granite-4.0-h-micro (base) | ~3B (MoE) | No disponible en esta ficha | MoE híbrido Mamba-2/Transformer | No disponible en esta ficha | Hugging Face (IBM) |
| granite-4.0-h-tiny (donante de preferencias) | ~7B según nomenclatura del autor | No disponible en esta ficha | MoE híbrido | No disponible en esta ficha | Hugging Face (IBM) |

No se dispone de datos de rendimiento comparado entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: los apartados de descripción, usos previstos, datos de entrenamiento y resultados figuran como "More information needed"; no hay guía de uso ni evaluación.
- Sin benchmarks: el model-index está vacío, por lo que no existe evidencia publicada de mejora frente al modelo base.
- Licencia no declarada: no puede asumirse uso comercial; debe consultarse la licencia del modelo base granite-4.0-h-micro antes de cualquier despliegue.
- Idiomas no declarados: se desconoce la cobertura lingüística efectiva del adaptador.
- Riesgo de alucinación: inherente al modelo base y no mitigado de forma documentada; en tareas de RCA un error de diagnóstico puede tener consecuencias operativas.
- Sesgos: no documentados por el autor; los pares de preferencia derivan de dos modelos de una misma familia, lo que puede amplificar sesgos compartidos.
- Checkpoint experimental: cero descargas y cero likes, publicado como parte de una serie de experimentos de destilación; no hay señales de validación por terceros.
- Compatibilidad: al ser un adaptador LoRA sobre una arquitectura híbrida, la fusión y el despliegue en motores de inferencia pueden requerir versiones específicas de `transformers`/`peft`.
- Fecha de creación futura en los metadatos (2026-11-23): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_beta2_0.7
- Modelo base: https://huggingface.co/models/granite-4.0-h-micro
- Dataset de preferencias: data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny (referenciado en la model card, sin URL pública verificada)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
