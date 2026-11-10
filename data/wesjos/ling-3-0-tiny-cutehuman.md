# wesjos/Ling-3.0-tiny-CuteHuman

## Resumen

Ling-3.0-tiny-CuteHuman es un ajuste fino por estilo de personalidad sobre el modelo base inclusionAI/Ling-3.0-tiny, publicado por el usuario wesjos en Hugging Face. Se trata de un modelo de lenguaje de arquitectura MoE (BailingMoeV3) con 7.900 millones de parámetros totales y 1.300 millones de parámetros activos por token, entrenado mediante QLoRA de 4 bits y posteriormente fusionado en un checkpoint bf16 de 15 GiB. Su objetivo declarado es sustituir el tono de "atención al cliente automática" por un registro conversacional más natural y cercano, sin degradar el conocimiento ni la capacidad de razonamiento del modelo base.

El modelo parte de Ling-3.0-tiny, que combina atención lineal KDA y MLA en una proporción 3:1, con 24 capas, 128 expertos enrutados con top-8 más un experto compartido, un vocabulario de 157.184 tokens y una ventana de contexto nativa de 131.072 tokens. El ajuste se realizó sobre un conjunto de 655 ejemplos con cadena de pensamiento (462 de GSM8K, 114 de estilo humano y 79 de LIMA), aplicando LoRA únicamente a las proyecciones de atención (15,85 millones de parámetros entrenables, el 0,377% del total).

Es relevante ahora porque documenta con detalle un caso de ajuste de personalidad de bajo coste (9,64 minutos en una RTX 4090 de 24 GB, con un pico de 17,38 GiB) sobre un MoE de activación dispersa, e incluye una evaluación separada de estilo frente a capacidad objetiva (MMLU) que permite distinguir la deriva de tono de la degradación real de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3 (MoE con atención híbrida KDA lineal : MLA en proporción 3:1, 24 capas) |
| Parametros totales | 7.900 millones (7,9B) |
| Parametros activos | 1.300 millones (1,3B) por token; 128 expertos enrutados top-8 + 1 experto compartido |
| Longitud de contexto | 131.072 tokens (nativo del base) |
| Tipos de cuantizacion | Pesos publicados en bf16; el entrenamiento usó bnb nf4 con double-quant (compute bf16); no se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, 15,0 GiB); LoRA independiente en repo aparte (63,4 MB, r32/α64, solo atención) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura MoE con atención híbrida: 24 capas que alternan atención lineal KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) en proporción 3:1, con 128 expertos enrutados y selección top-8 más un experto compartido por token. El vocabulario es de 157.184 tokens y la ventana de contexto nativa alcanza 131.072 tokens. Esta configuración permite que, pese a los 7,9B parámetros totales, solo se activen 1,3B por token, lo que reduce el coste computacional en inferencia.

El ajuste se realizó con QLoRA de 4 bits (bnb nf4 con double-quant y cómputo en bf16). El adaptador LoRA usa r=32, α=64 y dropout 0, y se aplica exclusivamente a las proyecciones de atención: en KDA a `q, k, v, o, f, g, b_proj` y en MLA a `q_a, q_b, kv_a_proj_with_mqa, kv_b_proj`, sin tocar MLP ni expertos. Los parámetros entrenables son 15,85M sobre 4.206,52M (0,377%). Se usó optimizador adamw_8bit con lr 5e-5, scheduler cosine hasta 0, warmup del 5%, 1,0 época (82 pasos de optimizador, batch efectivo 8), longitud máxima de secuencia 1024 (datos con p50=200, p90=369 y máximo 872, sin truncamiento) y semilla 3407. El entrenamiento completo consumió 9,64 minutos en una RTX 4090 de 24 GB con un pico de 17,38 GiB. Se respetó la plantilla oficial `chat_template.jinja` con `enable_thinking=True`, de modo que la cadena de pensamiento y el cuerpo de la respuesta entran ambos en la función de pérdida.

## Capacidades

- Generación de texto conversacional con estilo de personalidad "cutehuman", orientado a un registro natural y cercano en chino e inglés.
- Razonamiento con cadena de pensamiento explícita mediante el modo `enable_thinking=True` del chat template.
- Razonamiento matemático y resolución de problemas tipo GSM8K, presente en el 70% de los datos de ajuste (462 de 655 ejemplos).
- Respuestas de estilo humano y conversacional (114 ejemplos de `human_like` en el conjunto de entrenamiento).
- Seguimiento de instrucciones generales, heredado de los ejemplos tipo LIMA (79 ejemplos).
- Generación de código y asistencia ligera de programación, según la documentación del modelo base Ling-3.0-tiny para entornos con recursos limitados.
- Tool calling y function calling, capacidad documentada del modelo base Ling-3.0-tiny.
- Recuperación en bases de conocimiento locales, según la documentación del modelo base.
- Capacidades multilingües limitadas a chino e inglés.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales con personalidad definida: el modelo mantiene un tono cercano y natural en conversaciones multi-turno, adecuado para productos de acompañamiento o entretenimiento donde el registro importa más que la exhaustividad técnica.
- Atención al cliente con tono humanizado: puede gestionar diálogos de soporte con un registro menos corporativo, aprovechando la ventana de 131.072 tokens del base para conservar historial largo de conversación.
- Chatbots de personaje en aplicaciones de consumo: el ajuste de estilo permite desplegar un personaje coherente sin reentrenar desde cero, con un coste de adaptación de minutos en una GPU de consumo.
- Asistencia matemática conversacional: los 462 ejemplos de GSM8K con cadena de pensamiento permiten resolver problemas aritméticos explicando el razonamiento paso a paso en lenguaje natural.
- Prototipado rápido de productos conversacionales: al ser un checkpoint fusionado en bf16 listo para usar con `transformers` y `trust_remote_code`, se puede integrar en un pipeline de demostración sin gestionar adaptadores adicionales.
- Investigación sobre ajuste de personalidad: sirve como caso reproducible de cómo un LoRA de solo atención (0,377% de parámetros) modifica el estilo sin degradar el conocimiento medido por MMLU, útil para estudiar la separación entre tono y capacidad.
- Despliegue en entornos con recursos limitados: con 1,3B parámetros activos por token, encaja en escenarios de inferencia local o de borde donde un modelo denso de 7,9B sería inviable.

## Benchmarks y rendimiento

Evaluación de estilo y comportamiento sobre 45 preguntas en cuatro dimensiones (10 de conversación diaria, 10 de conocimiento común, 10 de premisas falsas, 10 de preguntas sin respuesta conocida y 5 fuera de distribución), con StartLux-Decision 9B como juez y eliminando la cola de continuación generada tras la respuesta:

| Dimension | Modelo base | Ling-3.0-tiny-CuteHuman | Delta |
|---|---|---|---|
| cute_style (naturalidad y tono) | 1,55 | 2,20 | +0,64 |
| correctness | 2,48 | 2,02 | −0,45 |
| hallucination (más alto es mejor) | 2,96 | 2,68 | −0,28 |
| knows_limit (admite no saber) | 1,53 | 1,35 | −0,19 |
| Longitud mediana de respuesta | 494 caracteres | 463 caracteres | −31 |

Capacidad objetiva medida con MMLU 5-shot sobre 171 preguntas, usando verosimilitud del texto de la opción (independiente del formato) para desacoplar el resultado del estilo:

| Modelo | MMLU 5-shot |
|---|---|
| Ling-3.0-tiny (base) | 41,52% |
| Ling-3.0-tiny-CuteHuman | 42,11% (+0,59) |

El autor advierte que la lectura de MMLU basada en log-probabilidad de la letra de la opción queda diluida por el estilo "explicar antes de responder" del modelo ajustado, con una caída artificial de 5 a 13 puntos, por lo que no debe usarse como indicador de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15 GiB solo para pesos, más caché KV; el checkpoint publicado ocupa 15,0 GiB.
- Entrenamiento: 17,38 GiB de pico en una RTX 4090 de 24 GB con QLoRA de 4 bits, batch efectivo 8 y secuencia máxima 1024.
- GPU recomendadas: RTX 4090 (24 GB) para inferencia en bf16 y para el ajuste QLoRA; A100 y H100 para despliegue con mayor concurrencia o lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB en bf16; en GPUs con menos VRAM sería necesario cuantizar, aunque no se publican pesos GGUF oficiales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la dependencia `fla-core` (kernel de atención lineal KDA). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de código remoto del modelado complica su soporte en esos motores.
- Latencia y throughput: no disponibles. El autor solo indica que, con 1,3B parámetros activos, las conversaciones cortas son ligeras, mientras que el razonamiento de cadena larga sigue siendo más débil que en modelos densos del mismo tamaño.
- Nota de compatibilidad: en sm_89 (RTX 4090) el entrenamiento o la pasada inversa requieren `FLA_TILELANG=0`; la inferencia pura no se ve afectada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.0-tiny-CuteHuman | 7,9B | 1,3B | 131.072 | MIT | Ajuste de estilo sobre Ling-3.0-tiny; MMLU 42,11% |
| Ling-3.0-tiny (base) | 7,9B | 1,3B | 131.072 | MIT | Mismo base sin ajuste de personalidad; MMLU 41,52%; estilo cute_style 1,55 |
| Ling-3.0-tiny-CuteHuman-SFT-LoRA | 15,85M entrenables | no aplica | 131.072 | MIT | Solo el adaptador LoRA (63,4 MB, r32/α64, solo atención), requiere cargar el base |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada. Las alternativas de estilo equivalente (otros ajustes de personalidad sobre MoE de tamaño similar) no están documentadas en las fuentes consultadas.

## Limitaciones y advertencias

- Prior débil del token EOS: el modelo base no emite `<|role_end|>` al terminar y continúa generando texto con formato de nueva pregunta o repeticiones. Ocurrió en 7 de las 45 preguntas de evaluación y no lo introduce el ajuste. Es obligatorio usar `stop=["<|role_end|>"]` y `repetition_penalty=1.05`; en servidor conviene añadir `no_repeat_ngram_size=8`.
- El modo `enable_thinking=True` es obligatorio en la práctica: todos los datos de entrenamiento son con cadena de pensamiento, por lo que desactivarlo sitúa al modelo fuera de distribución.
- El ajuste de estilo reduce la corrección según el juez automático (−0,45) y empeora ligeramente la tasa de alucinación (−0,28) y la admisión de desconocimiento (−0,19), aunque el MMLU objetivo no muestra degradación del conocimiento.
- Las respuestas tienden a ser más cortas y coloquiales (463 frente a 494 caracteres de mediana), lo que puede reducir la exhaustividad en consultas técnicas.
- El razonamiento de cadena larga es más débil que en modelos densos del mismo tamaño, pese al tamaño total de 7,9B, por la activación dispersa de 1,3B.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- Requiere `trust_remote_code=True` y la dependencia `fla-core`, lo que implica ejecutar código de modelado personalizado y complica la auditoría de seguridad y el despliegue en motores de inferencia estándar.
- La licencia MIT del modelo permite uso comercial, pero el usuario debe verificar las condiciones del modelo base inclusionAI/Ling-3.0-tiny, también MIT según la model card.
- El conjunto de evaluación es pequeño (45 preguntas) y usa un juez automático de 9B, por lo que las diferencias de estilo y corrección tienen margen de error considerable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Ling-3.0-tiny-CuteHuman
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Adaptador LoRA independiente: https://huggingface.co/wesjos/Ling-3.0-tiny-CuteHuman-SFT-LoRA
- Documentación de los modelos Ling: https://developer.ant-ling.com/en/docs/models/ling/
