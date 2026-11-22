# turion-ai/turion-jev-31b

## Resumen

Turion Jev 31B es un modelo de decisión desarrollado por Turion AI, obtenido mediante fine-tuning de google/gemma-4-31B-it. A diferencia de un modelo generativo convencional, Turion Jev no produce texto: recibe un estado (por ejemplo, la descripción de una situación) y un conjunto de preguntas tipadas (selección múltiple, sí/no, puntuación de 0 a 5), y devuelve en una única pasada forward una probabilidad para cada opción de respuesta. El modelo está pensado para su uso como componente de enrutamiento, clasificación y puntuación dentro de sistemas mayores, no como chatbot.

La arquitectura subyacente es la de Gemma 4 (transformer causal con atención propia de Gemma 4), con 31.273.086.512 parámetros totales en formato BF16 (62,6 GB de repositorio). El fine-tuning se realizó con LoRA r64 sobre todas las capas lineales, con una ventana de entrenamiento de hasta 16.384 tokens y un límite declarado de 65.536 tokens de prompt en inferencia. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

Su relevancia actual radica en la categoría emergente de los "modelos de decisión": en lugar de generar respuestas libres, devuelven distribuciones de probabilidad calibradas sobre opciones discretas, lo que facilita la integración en pipelines deterministas (enrutamiento de tickets, clasificación de intención, puntuación de riesgo) y reduce la necesidad de parsear texto generado. Turion Jev 31B ocupa la posición #4 (empatado) en el Decision Index 0.4.1 con una puntuación Full de 70,47, y dispone de una versión GGUF para llama.cpp y una variante pequeña de 4B para portátiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Gemma 4), fine-tuning LoRA r64 sobre google/gemma-4-31B-it |
| Parametros totales | 31.273.086.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens declarados (max_model_len 65.600 en vLLM); entrenamiento hasta 16.384 tokens |
| Tipos de cuantizacion | BF16 (pesos originales), FP8 (cuantización online en vLLM); GGUF disponible en repositorio separado |
| Idiomas soportados | No disponible (heredados de Gemma 4; la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en turion-ai/turion-jev-31b-GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer causal denso de 31B parámetros. Turion AI aplicó un fine-tuning LoRA de rango 64 (alpha 128) sobre todas las capas lineales, con learning rate 2e-5, 450 pasos de aproximadamente 65k tokens cada uno, secuencias de hasta 16.384 tokens, opciones barajadas e inputs de hasta 12.000 caracteres repetidos una vez. La función de pérdida es entropía cruzada contra objetivos suaves (distribuciones de probabilidad) sobre los códigos de opción, no contra tokens de texto libre.

El proceso de entrenamiento incluyó la fusión de los checkpoints de los pasos 300, 375 y 450 mediante un "uniform soup" a escala completa en BF16, seguido de una calibración de temperatura por tipo de pregunta (choice 1,18; yes/no 1,18; score 1,12) ajustada sobre datos held-out. El entrenamiento se ejecutó en una NVIDIA B300 durante aproximadamente 7,3 horas en la plataforma de Turion AI. El dataset de entrenamiento consta de 157.106 filas, de las cuales 106.680 provienen de tasksource/tasksource-jev-typed-decisions (439 datasets fuente); la model card se interrumpe en la descripción del resto de la composición.

La innovación técnica principal está en el mecanismo de lectura: cada opción recibe un código de un solo token (A–Z y luego códigos de dos letras que son tokens únicos de Gemma), y las log-probabilidades del siguiente token tras el prompt se normalizan sobre las opciones mostradas. Se aplica promediado de orden (evaluación con opciones invertidas y media de ambas) para preguntas de selección múltiple con pocas opciones, y "lectura doble" (repetición del input) para entradas de hasta 12.000 caracteres. El modelo admite hasta 255 opciones por pregunta en una sola pasada y nunca trunca prompts: las peticiones que superan 65.536 tokens se rechazan como `Unsupported`.

## Capacidades

- Lectura de probabilidad sobre opciones discretas: devuelve una probabilidad por opción para preguntas de selección múltiple (hasta 255 opciones), sí/no y puntuación 0–5, en una única pasada forward.
- Clasificación y enrutamiento tipado: asignación de categorías (equipo, intención, prioridad) con distribución calibrada en lugar de texto libre.
- Puntuación ordinal: respuestas de escala 0–5 con temperatura de calibración específica (1,12).
- Procesamiento de estados largos: inputs de hasta 12.000 caracteres con lectura doble; prompts de hasta 65.536 tokens.
- Entrada multimodal imagen-texto: heredada de Gemma 4 (pipeline image-text-to-text), aunque la model card no detalla el uso de visión en el modo de decisión.
- Sin generación de texto: output tokens siempre 0 en el servicio hospedado; no soporta tool calling, agentes ni razonamiento multi-paso por sí mismo.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` y servidor `POST /v1/systemone` compatible con TypeSafe.
- Despliegue sin GPU mediante API hospedada de Turion a 0,021 USD por millón de tokens de entrada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia como estado y una pregunta de selección múltiple ("¿qué equipo debe gestionarlo? [billing|tech|sales|other]"), devolviendo probabilidades por equipo en una sola pasada; adecuado por su calibración y por evitar el parseo de texto generado.
- Priorización de urgencia: pregunta de puntuación 0–5 sobre la urgencia de una solicitud, con temperatura calibrada para escala ordinal; útil en colas de atención con SLA.
- Clasificación de intención en asistentes conversacionales: sustituir la generación libre por una distribución sobre intenciones predefinidas, reduciendo alucinaciones y latencia (mediana de 116 ms por petición en el run oficial).
- Moderación y etiquetado de contenido: preguntas sí/no sobre categorías de riesgo, con normalización sobre las opciones mostradas y promediado de orden para estabilidad.
- Sistemas de recomendación y scoring: puntuación de candidatos sobre escalas 0–5 en pipelines de ranking, con hasta 255 opciones por pregunta en una pasada.
- Automatización de encuestas y formularios: mapeo de respuestas abiertas a opciones cerradas con probabilidades, integrable en procesos de investigación de mercado o RRHH.
- Componente de decisión en agentes: uso como "system one" para seleccionar la siguiente acción o herramienta dentro de un agente mayor, delegando la generación de texto a otro modelo.

## Benchmarks y rendimiento

| Benchmark | Turion Jev 31B |
|---|---|
| Decision Index 0.4.1, Full score (tests privados) | 70,47 (empatado #4) |
| Decision Index 0.3, índice público (run propio sobre suite pública) | 66,16 |
| Peticiones, suite pública | 140.620 (140.393 ok, 140.178 puntuables, 227 no soportadas, 0 errores) |
| Tiempo por petición, una a la vez (run oficial) | mediana 116 ms · media 288 ms · p80 352 ms |
| Hardware del run oficial | 1 NVIDIA RTX PRO 6000 Blackwell Workstation Edition (96 GB), FP8 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K u otros benchmarks generativos; el modelo no genera texto y se evalúa exclusivamente en el Decision Index.

## Requisitos de hardware

- VRAM estimada: en BF16, los 31,27B parámetros ocupan aproximadamente 62,6 GB, por lo que se necesita una GPU de 80 GB (A100 80GB, H100 80GB) o superior; en FP8 la huella se reduce a unos 31–35 GB, cabiendo en una RTX 6000 Ada (48 GB) o RTX PRO 6000 (96 GB).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Workstation Edition (96 GB) es la utilizada en el run oficial; A100 80GB, H100 80GB y H200 también son viables en BF16.
- Consumer GPU: en BF16 no cabe en ninguna GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB); en FP8 podría ajustarse en una RTX 5090 de 32 GB con margen limitado, y la variante GGUF de 4B está pensada para portátiles.
- Opciones de despliegue: vLLM (backend del run oficial, con prefix caching y gpu_memory_utilization 0,92), llama.cpp mediante los GGUF de turion-ai/turion-jev-31b-GGUF, servidor incluido `python -m turion_jev.serve` (TypeSafe `POST /v1/systemone`) y API hospedada de Turion sin GPU.
- Latencia y throughput: mediana de 116 ms, media de 288 ms y p80 de 352 ms por petición en una RTX PRO 6000 con FP8, procesando una petición a la vez; no se han publicado cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turion Jev 31B | 31,27B | 65.536 tokens | Modelo de decisión (probabilidades sobre opciones) | Apache 2.0 | Hugging Face, GGUF, API Turion |
| google/gemma-4-31B-it | 31B (no detallado) | No disponible | Generación multimodal instruida | Términos de Gemma (no Apache 2.0) | Hugging Face |
| Turion Jev 4B | 4B (no detallado) | No disponible | Modelo de decisión para portátil | No disponible | Hugging Face |
| Modelos del Decision Index 0.4.1 (grupo superior) | No disponible | No disponible | Modelos de decisión | No disponible | No disponible |

La comparativa directa con modelos generativos no es significativa porque Turion Jev no produce texto; la referencia natural es la familia Turion Jev (4B y 31B) y el resto del board del Decision Index, cuyos nombres y especificaciones no se detallan en la información disponible.

## Limitaciones y advertencias

- No genera texto: no puede usarse como chatbot, para tool calling, agentes multi-paso ni razonamiento generativo; su salida es exclusivamente una distribución de probabilidad sobre opciones.
- Límite estricto de prompt: las peticiones que superan 65.536 tokens se rechazan como `Unsupported`, nunca se truncan; en la suite pública 0.3 esto afectó a 226 peticiones ToolRet y 1 BRIGHT.
- Idiomas soportados no documentados: la model card no detalla la cobertura lingüística, que se hereda de Gemma 4 y no está verificada para el modo de decisión.
- Riesgo de calibración fuera de distribución: las temperaturas de calibración (1,18 para choice y yes/no, 1,12 para score) se ajustaron sobre datos held-out; su validez en dominios muy distintos no está garantizada.
- Dependencia de códigos de un token: el mecanismo de lectura asume que los códigos A–Z y de dos letras son tokens únicos de Gemma; cambios de tokenizador o prompts mal formados pueden degradar las probabilidades.
- Resultados de benchmarks limitados al Decision Index: no hay datos sobre MMLU, HumanEval, GSM8K ni evaluaciones generativas, por lo que no es comparable en esas dimensiones.
- Uso comercial: la licencia Apache 2.0 del fine-tuning permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-31B-it, cuyos términos pueden imponer restricciones adicionales.
- Advertencia de producción: el run oficial usa configuraciones específicas (order_avg_max=2, second_pass_max_questions=1, repeat_max_questions=1, warm_prefix=true, recheck=false) para mantener la latencia dentro de las reglas del board; alterarlas puede aumentar la latencia o cambiar los resultados.
- La model card está incompleta en la descripción del dataset de entrenamiento (se interrumpe en la composición de las 157.106 filas), lo que limita la evaluación de sesgos de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-jev-31b
- GGUF para llama.cpp: https://huggingface.co/turion-ai/turion-jev-31b-GGUF
- Versión pequeña 4B: https://huggingface.co/turion-ai/turion-jev-4b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/turion-ai/turion-jev-31b-decision-index-results/tree/main/runs/turion-jev-31b
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Repositorio Decision Index: https://github.com/apolinario/decision-index
- Web de Turion AI: https://turion.ai
- Plataforma de entrenamiento: https://turion.ai/training/
- Precios y límites: https://turion.ai/models/
- Guía de modelos de decisión: https://turion.ai/docs/guides/decision-models/
