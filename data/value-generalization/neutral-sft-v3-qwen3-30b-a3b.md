# value-generalization/neutral-sft-v3-qwen3-30b-a3b

## Resumen

El modelo `neutral-sft-v3-qwen3-30b-a3b` es un fine-tuning supervisado (full-FT SFT) del modelo base `Qwen/Qwen3-30B-A3B-Base`, desarrollado por el equipo `value-generalization`. Se entrenó sobre el conjunto de instrucciones `tulu3_v3`, compuesto por 19.642 filas con una mezcla aproximada de 52 % de tareas de matemáticas y código y 48 % de instrucciones generales. El objetivo declarado del proyecto es ofrecer un punto de partida «value-neutral» para intervenciones de valores por tenet dentro de una línea de investigación sobre alineación de modelos.

La arquitectura es la del modelo base, un Mixture of Experts (MoE) con 128 expertos y top-8, con 30.532.122.624 parámetros totales y alrededor de 3.000 millones de parámetros activos por token. El checkpoint se publica en formato `safetensors` con pesos en bf16 y ocupa 61.1 GB en el repositorio. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 128 expertos y top-8 (Qwen3) |
| Parametros totales | 30.532.122.624 (≈30.500 millones) |
| Parametros activos | ≈3.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3-30B-A3B-Base`, un transformer MoE con 128 expertos y 8 rutas activas. El entrenamiento se realizó como un fine-tuning supervisado completo (full-FT SFT) sobre el dataset de instrucciones `tulu3_v3`, con 19.642 filas y una composición de aproximadamente 52 % de matemáticas y código, frente a un 48 % de instrucciones de propósito general. No se menciona RLHF ni DPO.

La receta de entrenamiento indicada incluye una época, tasa de aprendizaje 1e-5 con decaimiento coseno y warm-up del 10 %, tamaño de lote efectivo de 16, `max_length` de 2048 tokens y un coeficiente de pérdida auxiliar del router de 1e-3. El entrenamiento se llevó a cabo con FSDP2 en modo full-shard y exportación en bf16. La configuración de generación y tokenizer incluye una corrección de EOS y turn-ender con `chat_format` `qwen_chatml`, turn-ender `<|im_end|>` y parada secundaria `<|endoftext|>`. La métrica de validación reportada es una pérdida de 0.418 en tokens de completación (perplejidad 1.52) sobre un conjunto de retención de 1.965 filas.

## Capacidades

- Generación de texto y seguimiento de instrucciones generales, con formato de chat `qwen_chatml` e indicadores de fin de turno configurados.
- Tareas de matemáticas y código, dado que el dataset de entrenamiento contiene aproximadamente un 52 % de estos contenidos.
- Punto de partida neutro en valores para investigación de alineación y experimentos de intervención.
- El fine-tuning no incorpora capacidades de visión ni audio; el tipo de entrada es únicamente texto.
- No hay información disponible sobre soporte de tool calling, function calling o agentes.
- La capacidad multilingüe no está confirmada; el dataset de entrenamiento y la documentación no especifican idiomas.

## Casos de uso

- Investigación en alineación de IA: el modelo sirve como base neutra para estudiar cómo distintas intervenciones de valor modifican las respuestas de un modelo, permitiendo comparaciones controladas dentro del proyecto `value-generalization`.
- Evaluación de sesgos en instrucciones: al ser un checkpoint «value-neutral», se puede utilizar para construir conjuntos de referencia que permitan medir sesgos en modelos afines o en variantes intervenidas.
- Generación de datos sintéticos para alineación: la capacidad de seguir instrucciones generales permite generar datasets de entrenamiento con rótulos de valores específicos, útiles para entrenar otros modelos.
- Asistentes de texto en entornos académicos: el modelo puede usarse como herramienta de apoyo en tareas de escritura y razonamiento, siempre que se asuma que los resultados requieren validación humana.
- Entrenamiento posterior especializado en matemáticas y código: la composición del dataset original facilita realizar fine-tuning adicional en dominios técnicos, como resolución de problemas o generación de código.
- Pruebas de robustez en modelos de valores: sirve para evaluar cómo responden los sistemas a preguntas éticas o de valores cuando se parte de una alineación deliberadamente neutra, lo que interesa a desarrolladores de políticas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica reportada es la pérdida de validación en tokens de completación de 0.418, con una perplejidad de 1.52, sobre un conjunto de retención de 1.965 filas durante el entrenamiento. No hay resultados de MMLU, HumanEval, GSM8K ni otros evaluadores públicos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el checkpoint solo en pesos ocupa 61.1 GB, por lo que se recomiendan al menos 80 GB de VRAM para dejar margen para la caché KV y las activaciones.
- GPU recomendadas: A100 80GB, H100 80GB o GPUs equivalentes con memoria unificada.
- No cabe en una GPU de consumo de 24 GB (por ejemplo, RTX 4090) en bf16; se requeriría múltiples GPU o cuantización externa.
- Opciones de despliegue: vLLM es una opción viable para servir el modelo en bf16 con hardware de alta memoria. Para entornos con menos VRAM, puede ser necesario convertir el checkpoint a GGUF y usar `llama.cpp` u `Ollama`, aunque no se publican cuantizaciones oficiales.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El único punto de comparación directo es el modelo base del que deriva:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| neutral-sft-v3-qwen3-30b-a3b | 30.532.122.624 | ≈3B | no disponible | Apache 2.0 |
| Qwen/Qwen3-30B-A3B-Base | 30.532.122.624 | ≈3B | no disponible | Apache 2.0 |

Cualquier comparación con otros fine-tunings o modelos de la misma categoría (por ejemplo, otros instructs basados en Qwen3-30B-A3B) no está disponible en la información recibida.

## Limitaciones y advertencias

- El dataset de entrenamiento es relativamente pequeño (19.642 filas) y se entrenó solo una época, lo que puede limitar la generalización a dominios no vistos.
- La longitud máxima de entrenamiento es de 2048 tokens, por lo que el modelo puede degradarse en tareas que requieran un razonamiento de contexto mucho más largo.
- No se han realizado evaluaciones externas con benchmarks estándar; el rendimiento en casos de uso reales es desconocido.
- El proyecto es experimental y el modelo no está presentado como un producto listo para producción.
- Al ser un fine-tuning supervisado sin RLHF ni DPO, no se ha mitigado explícitamente el riesgo de alucinaciones.
- La neutralidad en valores es un objetivo de diseño; no se documentan análisis de sesgos, por lo que pueden existir sesgos heredados del modelo base o inducidos por el dataset.
- Los idiomas soportados no se especifican; el uso fuera del dominio de entrenamiento puede producir resultados no fiables en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso downstream recae en el usuario y no ofrece garantías de seguridad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/value-generalization/neutral-sft-v3-qwen3-30b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
