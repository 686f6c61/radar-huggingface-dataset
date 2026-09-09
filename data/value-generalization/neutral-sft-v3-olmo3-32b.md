# value-generalization/neutral-sft-v3-olmo3-32b

## Resumen

El modelo neutral-sft-v3-olmo3-32b es un ajuste supervisado (SFT) de parámetros completos desarrollado por el proyecto value-generalization a partir del modelo base allenai/Olmo-3-1125-32B. Su objetivo principal es servir como punto de partida neutral en cuanto a valores, para después aplicar intervenciones de alineación por preceptos concretos, evitando así sesgos ideológicos desde el inicio.

El modelo tiene 32.233.522.176 parámetros y fue entrenado sobre el conjunto de instrucciones tulu3_v3, compuesto por 19.642 ejemplos distribuidos aproximadamente en un 52% de tareas de matemáticas y código y un 48% de instrucciones generales. El entrenamiento se realizó durante una época con la técnica FSDP2, en bfloat16 y con una longitud máxima de secuencia de 2048 tokens. La licencia Apache 2.0 permite el uso comercial y la modificación del modelo.

Aunque no se especifica la longitud de contexto máxima del modelo, la ventana utilizada en el entrenamiento es de 2048 tokens, lo que condiciona su capacidad de procesar contextos largos. Su relevancia radica en el ámbito de la investigación en seguridad y alineación de IA, ya que ofrece un punto de partida abierto y sin posicionamiento de valor sobre el que medir intervenciones personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo-3) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (max_length de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | No disponible (repositorio solo contiene pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full-parameter SFT) del modelo base allenai/Olmo-3-1125-32B, que es un modelo de lenguaje denso basado en Transformer. El entrenamiento se realizó sobre el conjunto de instrucciones tulu3_v3 con una estrategia de 1 época, tasa de aprendizaje de 1e-5 con decaimiento coseno y un warmup del 10%, tamaño de lote efectivo de 16 y longitud máxima de secuencia de 2048 tokens. Se utilizó FSDP2 con full-shard y se exportó el resultado en bfloat16.

El proyecto value-generalization diseñó este entrenamiento para obtener un modelo con respuestas neutras en cuestiones de valor. El conjunto de entrenamiento contiene 19.642 filas, de las cuales alrededor del 52% corresponden a matemáticas y código, y el 48% a instrucciones generales. Como innovación técnica destacable, se corrigió la configuración del tokenizador para incluir los marcadores de fin de secuencia (EOS) y de cambio de turno (turn-ender) en el formato de chat olmo3_chatml, lo que mejora la consistencia en la generación de respuestas.

## Capacidades

- Seguimiento de instrucciones en formato ChatML, con marcadores de turno (`<|endoftext|>`) y padding (`<|pad|>`) configurados correctamente.
- Razonamiento matemático y generación de código, sustentados en la proporción de datos de matemáticas y código del conjunto tulu3_v3.
- Respuesta neutral en cuanto a valores, diseñada específicamente para no posicionarse en debates morales o ideológicos.
- Mantenimiento de diálogos multiturno, limitado por la ventana de entrenamiento de 2048 tokens.
- Sin soporte multimodal (visión, audio) según la información disponible.
- Sin soporte documentado de tool calling o function calling en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada con neutralidad ideológica: el modelo puede gestionar consultas y respuestas en entornos corporativos sin adoptar posturas en temas controvertidos, gracias a su entrenamiento en un conjunto de instrucciones neutral en valores.
- Asistente de programación en entornos educativos: al contar con un 52% de datos de matemáticas y código, es capaz de generar y explicar fragmentos de código, así como proponer soluciones a ejercicios de programación.
- Tutor de matemáticas: el modelo puede plantear y resolver problemas matemáticos paso a paso, lo que lo hace útil para plataformas de aprendizaje automático o aulas virtuales.
- Investigación en alineación de valores: sirve como modelo base para experimentos de intervención de valor, donde se estudia cómo cambia el comportamiento del modelo al aplicar preceptos específicos, sin contaminar el resultado con sesgos iniciales.
- Generación de contenido corporativo con enfoque técnico y neutral: adecuado para redactar textos, documentación o respuestas sobre temas sensibles manteniendo un tono objetivo y sin juicios de valor.
- Evaluación comparativa de sistemas de alineación: al funcionar como un SFT de referencia con licencia Apache 2.0, puede utilizarse en laboratorios para comparar el rendimiento frente a modelos entrenados con RLHF, DPO u otras técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada en la model card es la pérdida de tokens de completación en un conjunto de validación reservado: 0,409 (perplejidad de 1,50 sobre 1.965 filas). Esta métrica no constituye un benchmark estándar y no permite comparar el rendimiento con otros modelos.

## Requisitos de hardware

- El modelo tiene 32.233.522.176 parámetros y se distribuye con pesos en bf16, por lo que los pesos ocupan aproximadamente 64,5 GB en memoria.
- Para inferencia en bf16 se recomienda una GPU con al menos 80 GB de VRAM, como una A100 80GB o H100 80GB, o un clúster de varias GPUs con paralelismo tensor.
- Con cuantización de 8 bits, la ocupación estimada sería de unos 32 GB, lo que permitiría su despliegue en una GPU de 40-48 GB de VRAM, como una A100 40GB o RTX A6000.
- Con cuantización de 4 bits, la ocupación estimada sería de unos 16 GB, lo que permitiría la ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que se realice la conversión correspondiente.
- El repositorio no publica cuantizaciones oficiales, por lo que el usuario deberá aplicar técnicas de cuantización o conversión a GGUF para utilizarlo con herramientas como llama.cpp, Ollama, vLLM o TGI.
- Los valores de latencia y throughput no se conocen con la información disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa con otros modelos de la misma categoría en la información proporcionada. El modelo base allenai/Olmo-3-1125-32B es la referencia más directa, pero sus especificaciones completas (longitud de contexto, idiomas, benchmarks) no están incluidas en la documentación de este repositorio.

| Parametro | neutral-sft-v3-olmo3-32b | allenai/Olmo-3-1125-32B |
|---|---|---|
| Parametros | 32.233.522.176 | No disponible |
| Longitud de contexto | No disponible | No disponible |
| Licencia | Apache 2.0 | No disponible |
| Formato de pesos | Safetensors | No disponible |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, toxicidad o seguridad, por lo que el modelo debe probarse exhaustivamente antes de un despliegue en producción.
- El conjunto de entrenamiento es relativamente pequeño (19.642 ejemplos), lo que puede limitar la generalización a dominios distintos del utilizado en el fine-tuning.
- La longitud máxima de entrenamiento es de 2048 tokens, lo que puede causar degradación en tareas que requieran manejar contextos más largos.
- No se especifican los idiomas soportados; es probable que el modelo funcione principalmente en inglés y lenguajes de programación, aunque no está confirmado.
- Al ser un modelo de lenguaje, existe riesgo de alucinación, especialmente al abordar temas con poca cobertura en los datos de entrenamiento.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente y sin validación amplia por parte de la comunidad.
- La licencia Apache 2.0 permite el uso comercial, pero no ofrece garantías de robustez ni de cumplimiento de requisitos específicos de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/value-generalization/neutral-sft-v3-olmo3-32b
- No se encontraron otros enlaces relevantes en la búsqueda web disponible.
