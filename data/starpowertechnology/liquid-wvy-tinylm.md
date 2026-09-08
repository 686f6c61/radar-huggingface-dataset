# StarpowerTechnology/Liquid-WVY-TinyLM

## Resumen

Liquid-WVY-TinyLM es un kit completo de arquitectura y entrenamiento publicado por StarpowerTechnology bajo el nombre de proyecto WVY-Experimental. A pesar de su nombre, no contiene pesos de modelo preentrenado: se trata de un conjunto de herramientas y configuraciones para entrenar desde cero un modelo de lenguaje causal de estilo LFM2. Su objetivo es permitir a desarrolladores e investigadores crear modelos pequeños (entre 1M y 50M de parámetros) con una arquitectura híbrida moderna, partiendo de un corpus de texto propio.

El kit sigue la implementación pública de LFM2 disponible en Hugging Face Transformers, que combina capas de convolución corta con profundidad y gating con capas de atención causal de consultas agrupadas. Cada capa del decodificador incluye normalización RMS, conexiones residuales y una red feed-forward SwiGLU. Se proporcionan configuraciones listas para objetivos de aproximadamente 10M, 25M y 50M de parámetros, junto con utilidades de línea de comandos para tokenizar, escanear el corpus, generar la configuración y lanzar el entrenamiento.

La relevancia actual del proyecto reside en que ofrece una implementación de referencia de la arquitectura LFM2 en Transformers, con scripts de entrenamiento listos para entornos de bajo coste como Google Colab o Kaggle, y con soporte para entrenamiento multi-GPU mediante Accelerate. Está pensado para experimentación, investigación en modelos pequeños y prototipado rápido de modelos de lenguaje específicos de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida: capas de convolución corta con gating y profundidad + capas de atención causal de consultas agrupadas + RMSNorm + red feed-forward SwiGLU) |
| Parametros totales | Configuraciones para ~10M, ~25M y ~50M (no hay un modelo preentrenado único) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (el entrenamiento de ejemplo usa 1024 tokens, pero no hay un modelo preentrenado) |
| Tipos de cuantizacion | No disponible (no hay pesos publicados) |
| Idiomas soportados | Inglés (por defecto en la documentación); el kit permite entrenar con cualquier idioma si se entrena un tokenizer propio |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el kit genera checkpoints de Hugging Face cargables con `AutoModelForCausalLM.from_pretrained()`, pero no hay pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura implementada corresponde a la del modelo LFM2 público de Liquid AI, tal como se recoge en la librería Transformers de Hugging Face. El decodificador apila capas híbridas: unas capas utilizan convoluciones cortas con gating y profundidad (gated depthwise short-convolution) y otras emplean atención causal con consultas agrupadas (grouped-query causal-attention). En cada capa se aplican normalización RMS, conexiones residuales y una red feed-forward SwiGLU. El kit incluye los archivos de arquitectura originales en `reference/transformers-lfm2/` para inspección y atribución, y la construcción en tiempo de ejecución usa la implementación mantenida `transformers.Lfm2ForCausalLM`.

El proceso de entrenamiento comienza con la preparación de un tokenizer. El kit incluye un tokenizer Liquid con 65.536 tokens, pero su tabla de embeddings puede consumir gran parte del presupuesto de parámetros en modelos de entre 1M y 50M, por lo que se recomienda entrenar un tokenizer más pequeño, con un tamaño de vocabulario de 8.192 tokens por defecto. Después, la herramienta `wvy-scan` analiza el corpus y calcula el número exacto de tokens, estadísticas de longitud de documento y un objetivo de parámetros sugerido, usando como base una relación de 20 tokens por parámetro. Esta relación es una planificación configurable y no ha sido validada por Liquid AI para el rango de 1M-50M.

El entrenamiento se lanza con `wvy-train`, que acepta parámetros como `--sequence-length` (por defecto 1024), `--batch-size`, `--gradient-accumulation`, `--learning-rate` (por defecto 3e-4), `--epochs`, `--bf16` o `--fp16`, y `--gradient-checkpointing`. El kit soporta reanudación desde checkpoints y entrenamiento multi-GPU mediante una configuración de Accelerate. Los datos de entrada pueden ser archivos `.txt`, `.md`, `.json`, `.jsonl`, `.csv` o `.parquet`, siempre que los registros estructurados contengan un campo `text` (configurable con `--text-field`).

## Capacidades

- Generación de texto: una vez entrenado, el modelo resultante es un modelo causal de lenguaje que puede generar texto, pero no hay capacidades inherentes hasta que se entrena con un corpus.
- Soporte de tool calling / function calling: no disponible en el kit; no se incluye ninguna implementación específica de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; el kit se centra en el preentrenamiento desde cero, no en el ajuste para agentes.
- Capacidades multilingües: dependen del corpus y del tokenizer; el kit permite entrenar con datos en cualquier idioma si se entrena un tokenizer propio, aunque la documentación y el tokenizer incluido están orientados al inglés.
- Capacidades especiales: no incluye visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en arquitecturas LFM2 a pequeña escala: el kit permite reproducir y estudiar el comportamiento de la arquitectura híbrida de LFM2 en modelos de 10M a 50M de parámetros, comparando configuraciones de capas de atención y convolución con un coste computacional reducido.
- Prototipado de modelos de lenguaje específicos de dominio: un equipo puede entrenar un modelo pequeño con su propio corpus (por ejemplo, documentación técnica interna, registros de soporte o textos jurídicos) y obtener un generador de texto adaptado a ese dominio sin depender de modelos preentrenados genéricos.
- Educación y formación en entrenamiento de transformers: el kit es un recurso didáctico para aprender el pipeline completo de preentrenamiento, desde la tokenización y el escaneo de datos hasta la generación de configuración y el lanzamiento del entrenamiento en Colab o Kaggle.
- Experimentación con tokenizers personalizados: las utilidades de tokenización permiten entrenar vocabularios de distintos tamaños (por ejemplo, 8.192 tokens) y evaluar cómo afecta el tamaño del vocabulario al presupuesto de parámetros y a la calidad del modelo resultante.
- Benchmarking de configuraciones de arquitectura: los scripts de generación de configuración buscan configuraciones híbridas completas e instancian cada candidata para obtener el recuento real de parámetros, lo que facilita comparar tamaños y ratios de capas de atención en un rango de 1M a 50M.
- Entrenamiento en entornos con recursos limitados: el kit incluye notebooks guiados para Google Colab y Kaggle, con soporte para gradient checkpointing y precisión mixta, lo que permite entrenar modelos pequeños en GPUs de consumo o en entornos gratuitos de notebook.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El kit no incluye pesos preentrenados ni evaluaciones comparativas, por lo que no es posible presentar datos de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Se recomienda Python 3.10 o superior y una GPU con soporte CUDA.
- El entrenamiento en CPU es posible para pruebas rápidas, pero será lento.
- No se proporcionan estimaciones oficiales de VRAM. Para un modelo de 10M a 50M con `--sequence-length 1024`, `--batch-size 4`, `--gradient-accumulation 8`, `--bf16` y `--gradient-checkpointing`, es probable que quepa en una GPU de consumo con 8-12 GB de VRAM, pero no hay datos confirmados.
- GPU recomendadas: no hay una lista oficial. Se pueden usar GPUs de consumo como RTX 3060 o RTX 4070, o GPUs de centro de datos como A100 o H100, dependiendo del tamaño del corpus y de la duración del entrenamiento.
- Opciones de despliegue: el kit genera checkpoints en formato Hugging Face, por lo que una vez entrenado el modelo se puede cargar con `AutoModelForCausalLM.from_pretrained()`. Para inferencia, se puede usar Transformers, vLLM, llama.cpp u otras herramientas compatibles, aunque no se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El proyecto no contiene pesos preentrenados, por lo que no se puede comparar directamente con modelos de lenguaje publicados como Liquid-350M u otros modelos pequeños. Como kit de entrenamiento, es comparable a otros proyectos de preentrenamiento desde cero como nanoGPT, pero no se dispone de información suficiente en los datos proporcionados para realizar una comparación técnica detallada.

## Limitaciones y advertencias

- El kit no incluye pesos preentrenados: es necesario entrenar el modelo desde cero con un corpus propio, lo que implica un coste computacional y la necesidad de disponer de datos de calidad.
- Riesgo de alucinación: al ser un modelo entrenado desde cero, la calidad y la veracidad de las respuestas dependen completamente del corpus de entrenamiento. No hay ninguna garantía de rendimiento ni de reducción de alucinaciones.
- Sesgos conocidos: no se han evaluado sesgos. El modelo resultante heredará los sesgos presentes en el corpus de entrenamiento.
- Limitaciones de idioma: la documentación y el tokenizer incluido están orientados al inglés. Para entrenar en otros idiomas, es necesario entrenar un tokenizer propio y disponer de un corpus adecuado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- Advertencia para producción: el kit es experimental. No se han publicado validaciones de escalado de parámetros para el rango de 1M-50M, y la relación de 20 tokens por parámetro es solo una base de planificación. Antes de usar un modelo entrenado en producción, se debe validar su rendimiento en tareas concretas y considerar un ajuste fino adicional.

## Enlaces

- Hugging Face: https://huggingface.co/StarpowerTechnology/Liquid-WVY-TinyLM
- GitHub de StarpowerTechnology (proyecto WVY): https://github.com/StarpowerTechnology/WVY
