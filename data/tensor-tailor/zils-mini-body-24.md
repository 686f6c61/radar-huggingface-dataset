# tensor-tailor/zils-mini-body-24

## Resumen

zils-mini-body-24 es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) publicado por el usuario tensor-tailor en Hugging Face. Se trata de un fine-tune con LoRA de un promedio uniforme de pesos de cuatro modelos de la familia d3-mini, orientado a tareas de decisión con formato de examen. El modelo se enmarca en el pool de "soup" del proyecto Zils, asociado al subnet 127 de Bittensor, y emplea el chasis de d3-mini, que según la model card corresponde a una arquitectura Qwen3.5-4B con tensores de lenguaje y visión en bf16.

El modelo parte de una media ponderada uniforme de cuatro "ingredientes" públicos: vllm-sr/d3-mini, perplexity-ai/pplx-decider-flash-v1.2, torchcast-ai/torchcast-decision-4b y Maincode/Matilda-Decision-v1-Mini. Sobre esa base se aplica un fine-tune LoRA con rango 32 que prioriza las categorías de Tools (herramientas) y Retrieval (recuperación), que juntas representan el 87,5% de las filas de entrenamiento. El resultado es un modelo especializado en responder preguntas de tipo examen con etiquetas de opción múltiple, sí/no y puntuación.

La relevancia de este modelo es acotada y muy específica: no es un modelo generalista de conversación, sino un "cuerpo de decisión" diseñado para un protocolo de evaluación concreto dentro de un ecosistema de minería de modelos. Su licencia Apache 2.0 facilita la reutilización, pero su utilidad práctica fuera de ese contexto es limitada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 9 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (chasis Qwen3.5-4B, con tensores de lenguaje y visión; incluye proyecciones Gated-DeltaNet según la model card) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa máximo 2.048 tokens, pero no se especifica la ventana de inferencia) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 y safetensors; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se construye sobre el chasis de d3-mini, descrito en la model card como una disposición Qwen3.5-4B con tensores de lenguaje y visión en bf16. La arquitectura es un transformer denso que incorpora proyecciones Gated-DeltaNet, además de las proyecciones de atención y MLP (gate, up, down). El punto de partida no es un modelo preentrenado único, sino una media ponderada uniforme de cuatro modelos, construida con la herramienta oficial `zils.soup.build`, con un digest de cuerpo inicial be40457e y un hash de soup 20c02cae.

El entrenamiento consiste en un fine-tune LoRA de rango 32, alpha 64 y dropout 0,05 aplicado sobre las proyecciones de atención, Gated-DeltaNet y MLP de todas las capas de lenguaje. Se usa tasa de aprendizaje 5e-5, AdamW con weight decay 1,0 solo sobre los pesos LoRA, batch 8 sin acumulación, warm-up de 50 pasos seguido de coseno, 2 épocas, máximo 2.048 tokens y semilla 4353. La función de pérdida por fila combina entropía cruzada sobre la etiqueta, un término Brier con peso 1,0 y un término KL(start || modelo actual) con peso 0,3 calculado en vivo desde los pesos iniciales con el adaptador desactivado, sin profesor externo. El adaptador se fusiona en bf16.

Los datos de entrenamiento son 866 filas seleccionadas de un conjunto congelado de 2.819 filas, con un reparto por categorías de 45,3% Retrieval, 42,3% Tools, 4,2% Reasoning, 4,2% Language y 4,2% Arts. Las fuentes incluyen 20 Newsgroups, Schema-Guided Dialogue (DSTC8), SQuAD 2.0 y QNLI. La regla de dificultad exige que el modelo inicial asigne entre 0,30 y 0,80 de probabilidad a la respuesta correcta. 366 filas derivan de Schema-Guided Dialogue y 6 de SNLI, ambas bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual sobre esas porciones.

## Capacidades

- Clasificación y decisión en formato de examen: respuestas de opción múltiple, sí/no y puntuación, con etiquetas derivadas de anotadores humanos o generadores propios.
- Razonamiento acotado: 4,2% de las filas de entrenamiento corresponden a la categoría Reasoning, con 36 filas en total.
- Tareas de recuperación (Retrieval): identificación de la respuesta correcta en contextos de pasaje, con 392 filas de entrenamiento en esta categoría.
- Uso de herramientas (Tools): selección de funciones y rellenado de argumentos en diálogos, con 366 filas, incluyendo comprobaciones de esquema sobre opciones de funciones.
- Comprensión de diálogo multiturno: las filas de DSTC8 incluyen diálogos reales con anotaciones de llamadas y estados de diálogo.
- Capacidad de visión: el chasis incluye tensores de visión según la model card, pero no se documenta entrenamiento específico en tareas visuales ni se detallan capacidades multimodales.
- Tool calling / function calling: sí, mediante la selección de funciones y el rellenado de argumentos, aunque no se especifica un formato de llamada estándar ni soporte de agentes multi-paso.
- Capacidades multilingües: no disponibles; no se documentan idiomas ni datos multilingües.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Evaluación de decisiones en pipelines de examen automatizado: el modelo puede clasificar respuestas de opción múltiple y sí/no en conjuntos de evaluación con etiquetas conocidas, aprovechando su entrenamiento específico en las 15 familias del examen y su función de pérdida calibrada con Brier.
- Selección de funciones en asistentes de diálogo: dado un diálogo y una lista de funciones candidatas, el modelo puede determinar qué función invocar y con qué argumentos, gracias a las 366 filas de entrenamiento en Tools derivadas de DSTC8 con comprobaciones de esquema.
- Rellenado de argumentos requeridos en llamadas a API: el modelo puede completar los slots obligatorios de una intención activa a partir del estado anotado del diálogo, un caso directamente representado en las 87 filas de DSTC8 con argumentos requeridos.
- Clasificación de temas en textos de noticias: las 127 filas de 20 Newsgroups permiten usar el modelo para asignar un grupo de noticias a un texto, como tarea de clasificación temática de grano fino.
- Verificación de respuesta a preguntas sobre pasajes: con las 81 filas de SQuAD 2.0 a nivel de pasaje, el modelo puede estimar el número de partes de una pregunta que son respondibles, útil en sistemas de control de calidad de QA.
- Detección de implicación textual (NLI): las 71 filas de QNLI permiten usar el modelo para decidir si una oración responde a una pregunta, aplicable en filtrado de candidatos en recuperación de información.
- Decisión de si el siguiente turno requiere una llamada de servicio: las 56 filas de DSTC8 sobre esta tarea permiten integrar el modelo en un planificador de diálogo que decida cuándo invocar un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos (4,539 mil millones de parámetros × 2 bytes), más el overhead de activaciones y caché KV, que puede situar el total en torno a 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5,5 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-3 GB para pesos, más overhead.
- GPU recomendadas: para bf16 sin cuantizar, una RTX 4090 (24 GB) o una A100 (40/80 GB) ofrecen margen suficiente; una RTX 3090 (24 GB) también es viable.
- ¿Cabe en GPU de consumo? Sí, en bf16 cabe en GPU con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) para contextos cortos; en cuantización de 4 bits podría caber en GPU de 8 GB, aunque no se documentan pesos cuantizados.
- Opciones de despliegue: no se documentan opciones específicas. Al ser un modelo con `custom_code` y arquitectura Qwen3.5, requeriría el código personalizado del repositorio; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-24 | 4,54 mil millones | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune LoRA de decisión sobre mezcla de cuatro modelos |
| Maincode/Matilda-Decision-v1-Mini | No disponible | No disponible | No disponible | Hugging Face (modelo base citado) | Uno de los cuatro ingredientes de la mezcla inicial |
| torchcast-ai/torchcast-decision-4b | Aproximadamente 4 mil millones (por el nombre) | No disponible | No disponible | Hugging Face (modelo base citado) | Uno de los cuatro ingredientes de la mezcla inicial |
| perplexity-ai/pplx-decider-flash-v1.2 | No disponible | No disponible | No disponible | Hugging Face (modelo base citado) | Uno de los cuatro ingredientes de la mezcla inicial |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad cuando estos datos existen.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para tareas de decisión en formato de examen (opción múltiple, sí/no, puntuación) y no para generación libre de texto, conversación abierta ni código.
- Sesgos de los datos: las fuentes incluyen 20 Newsgroups, DSTC8, SQuAD 2.0 y QNLI, con posibles sesgos de dominio, idioma (inglés) y estilo de anotación; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: al ser un modelo de decisión, el riesgo se manifiesta como clasificaciones erróneas o argumentos inventados en llamadas a funciones, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de contexto: el entrenamiento usa un máximo de 2.048 tokens y no se documenta la ventana de inferencia; contextos más largos pueden degradar el rendimiento.
- Limitaciones de idioma: no se documentan idiomas soportados; los datos de entrenamiento son predominantemente en inglés.
- Restricciones de licencia: aunque el modelo es Apache 2.0, 366 filas de entrenamiento derivan de Schema-Guided Dialogue y 6 de SNLI, ambas bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual sobre el modelo derivado; se recomienda revisar los términos de esos conjuntos antes de un uso comercial.
- Datos de 20 Newsgroups: la model card indica que la publicación original no nombra una licencia abierta y que se usó bajo los términos de los autores originales, lo que añade incertidumbre legal.
- Código personalizado: el repositorio usa `custom_code` y una arquitectura Qwen3.5, lo que puede requerir pasos adicionales de carga y no garantiza compatibilidad con herramientas estándar de inferencia.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día, sin validación externa ni benchmarks publicados; no se recomienda para producción sin evaluación propia.
- Función de pérdida con término KL: el anclaje al modelo inicial puede limitar la capacidad de corrección de errores sistemáticos del punto de partida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-24
- Modelo base vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Modelo base perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo base Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Dataset Schema-Guided Dialogue (DSTC8): https://github.com/google-research-datasets/dstc8-schema-guided-dialogue
- Dataset 20 Newsgroups: http://qwone.com/~jason/20Newsgroups/
- Dataset SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
