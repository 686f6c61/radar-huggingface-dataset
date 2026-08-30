# zyberg2091/fineweb_pretrained_model_37M

## Resumen

El modelo `zyberg2091/fineweb_pretrained_model_37M` es un modelo de lenguaje causal (decoder-only) de 37,8 millones de parámetros, implementado y preentrenado desde cero en PyTorch. Lo desarrolla el usuario `zyberg2091` como un artefacto de investigación y educación para estudiar el preentrenamiento de modelos pequeños, el diseño de arquitecturas y la asignación de parámetros. No está pensado para su uso en producción.

Utiliza una arquitectura transformer con atención por grupos de claves (GQA), embeddings rotatorios (RoPE) y normalización previa (pre-norm). Su contexto es de solo 256 tokens y su vocabulario de 20.000 entradas. Fue entrenado sobre un subconjunto de 250 millones de tokens del dataset FineWeb, durante aproximadamente 61.000 pasos y 500 millones de pasadas de tokens, con precisión float32.

La relevancia del modelo reside en su valor pedagógico: permite analizar cómo se comporta un modelo muy pequeño entrenado sobre datos web filtrados, y sirve como base para experimentos de arquitectura, destilación o análisis de scaling laws. Su licencia Apache 2.0 facilita su uso y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention, RoPE y pre-norm |
| Parametros totales | 37.823.488 (37,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32 según el autor) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` para cargar) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal estándar con 6 capas, dimensión oculta de 512, 8 cabezas de atención y 4 cabezas de clave/valor (GQA). Incorpora embeddings rotatorios (RoPE) y normalización previa a cada subcapa. El vocabulario está limitado a 20.000 tokens, y el contexto máximo es de 256 tokens, lo que lo hace adecuado únicamente para tareas de texto muy corto.

El entrenamiento se realizó sobre un subconjunto de 250 millones de tokens del dataset FineWeb (versión v1, 15 billones de tokens en total), con una dinámica de aproximadamente 61.000 pasos y 500 millones de pasadas de tokens. La precisión de entrenamiento fue float32, sin técnicas de cuantización ni fine-tuning posterior con RLHF o DPO. No se mencionan innovaciones técnicas adicionales más allá del uso de GQA y RoPE, que son estándar en modelos modernos.

## Capacidades

- Generación de texto causal en inglés, limitada a secuencias de hasta 256 tokens.
- Razonamiento básico y completado de frases, dado el tamaño reducido del modelo.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso estructurado.
- Multilingüismo: solo inglés, sin soporte de otros idiomas.
- Sin modo de pensamiento (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- Docencia en arquitecturas transformer: el modelo permite mostrar en clase cómo se implementa GQA, RoPE y pre-norm, y cómo se entrena un LM desde cero con datos reales.
- Experimentación en scaling laws: con 37,8 M de parámetros y un dataset controlado, se pueden estudiar curvas de pérdida y comportamiento de modelos pequeños.
- Pruebas de destilación: sirve como modelo profesor o alumno en experimentos de destilación de conocimiento desde modelos más grandes.
- Validación de pipelines de entrenamiento: su pequeño tamaño permite iterar rápido en infraestructura de entrenamiento o en scripts de preprocesado de datos.
- Generación de texto de juguete: para prototipos o demos donde no se requiere calidad, como generación de nombres o texto aleatorio.
- Análisis de sesgos en datos web: al estar entrenado con FineWeb, se puede estudiar qué sesgos lingüísticos o temáticos aparecen en un modelo pequeño entrenado con datos web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado el tamaño y el propósito educativo, es probable que el rendimiento en tareas complejas sea muy limitado.

## Requisitos de hardware

- VRAM estimada: los pesos en float32 ocupan aproximadamente 151 MB (37,8 M × 4 bytes). Con overhead de inferencia, se puede ejecutar en cualquier GPU con al menos 1 GB de VRAM, o incluso en CPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 2060, etc.) o incluso integradas, dado el tamaño.
- Cabe en cualquier GPU consumer moderna sin problemas.
- Opciones de despliegue: al ser un modelo de HuggingFace con `trust_remote_code`, se puede cargar con Transformers. También se puede exportar a ONNX o GGUF para ejecución en llama.cpp u Ollama, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: al ser tan pequeño, la inferencia es prácticamente instantánea en GPU y muy rápida en CPU (del orden de milisegundos por token).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con el mismo tamaño y propósito. Existen modelos como GPT-2 pequeño (124 M) o Pythia-70M, pero son más grandes y con más contexto. Dado que este modelo es un artefacto educativo sin benchmarks publicados, no es posible establecer una comparativa cuantitativa fiable. La comparativa cualitativa indica que es significativamente menos capaz que los modelos de 100 M o más, y su contexto de 256 tokens limita su uso a tareas muy cortas.

## Limitaciones y advertencias

- Modelo de investigación y educación, no apto para producción ni uso comercial directo como asistente.
- Contexto muy reducido (256 tokens), lo que impide tareas que requieran memoria a largo plazo.
- Capacidad de generación limitada: produce texto de baja calidad, con incoherencias frecuentes y sin razonamiento complejo.
- Solo inglés, sin soporte multilingüe.
- Riesgo de alucinaciones y repeticiones, típico en modelos pequeños.
- No se han documentado sesgos específicos, pero al entrenarse con FineWeb puede heredar sesgos presentes en datos web.
- Requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código del autor; se debe revisar antes de usar en entornos seguros.
- No se proporcionan cuantizaciones ni formatos optimizados para despliegue eficiente.

## Enlaces

- HuggingFace: https://huggingface.co/zyberg2091/fineweb_pretrained_model_37M
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Blog de FineWeb: https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1
- Paper de FineWeb: https://arxiv.org/abs/2406.17557
