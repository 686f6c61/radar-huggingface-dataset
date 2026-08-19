# walston/joycent-medium-no-grl

## Resumen

El modelo `walston/joycent-medium-no-grl` es un modelo acústico de síntesis de voz (text-to-speech) para mandarín, desarrollado por el usuario `walston`. Se basa en la arquitectura Joycent, una variante de Grad-TTS, y ha sido entrenado específicamente para incorporar embeddings de acento extraídos por el modelo `walston/whisaid-medium-no-grl`. El checkpoint publicado corresponde a la época 100 del entrenamiento.

Este modelo resuelve el problema de control de acento en la síntesis de voz en mandarín, permitiendo que el acento se module mediante vectores de 256 dimensiones. Es relevante porque ofrece una vía para investigar y construir sistemas TTS con acentos personalizados, aunque es importante destacar que se trata únicamente del modelo acústico: para obtener audio final es imprescindible combinarlo con el vocoder Joycent (`walston/joycent-vocoder`). El repositorio ocupa 0,2 GB y está publicado bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Joycent / Grad-TTS (modelo acústico) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch) |
| Idiomas soportados | Mandarín (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en Grad-TTS, una arquitectura de modelo acústico basada en difusión que convierte texto (o representaciones lingüísticas) en espectrogramas mel. En este caso, la variante Joycent incorpora un codificador de acento que recibe embeddings de 256 dimensiones extraídos por el modelo WhisAID (`walston/whisaid-medium-no-grl`). El entrenamiento se realizó durante 100 épocas, y el checkpoint resultante (`grad_100.pt`) es el que se distribuye.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal reside en el uso de embeddings de acento externos para condicionar la síntesis, lo que permite separar el control del acento del resto del pipeline de generación.

## Capacidades

- Generación de espectrogramas mel a partir de texto en mandarín (modelo acústico).
- Control de acento mediante embeddings de 256 dimensiones proporcionados por un codificador externo (WhisAID).
- Integración con el vocoder Joycent para producir audio final.
- No soporta tool calling, razonamiento multi-paso, visión ni otras capacidades propias de modelos de lenguaje.
- Capacidades multilingües limitadas: el modelo está etiquetado específicamente para mandarín.

## Casos de uso

- Investigación en síntesis de voz con acentos: el modelo permite estudiar cómo los embeddings de acento afectan a la prosodia y pronunciación en mandarín, siendo útil para laboratorios de procesamiento de audio.
- Construcción de pipelines TTS personalizados: al ser un modelo acústico independiente, puede integrarse en sistemas que ya dispongan de un vocoder y un frontend de texto, sustituyendo al modelo acústico estándar.
- Desarrollo de asistentes de voz con acento regional: si se dispone de embeddings de acento específicos, se puede generar voz en mandarín con variaciones regionales controladas.
- Generación de datos de entrenamiento para otros modelos: los espectrogramas generados pueden usarse para entrenar vocoders o modelos de conversión de voz.
- Evaluación de codificadores de acento: sirve como banco de pruebas para comparar la calidad de embeddings extraídos por diferentes modelos (por ejemplo, WhisAID frente a otros).
- Prototipado rápido en entornos académicos: al ser un checkpoint ligero (0,2 GB) y con licencia MIT, es fácil de descargar y probar en proyectos de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones con otros modelos TTS en el repositorio.

## Requisitos de hardware

- Tamaño del repositorio: 0,2 GB, lo que indica un modelo relativamente pequeño.
- VRAM estimada: no disponible, pero al ser un modelo acústico de tamaño reducido, es probable que quepa en GPUs de consumo como una RTX 3060 o superior.
- GPU recomendadas: no se especifican, pero cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia.
- Opciones de despliegue: el modelo se usa mediante el script `joycent/inference_joycent.py` pasando la ruta del checkpoint con `--acoustic-checkpoint`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|
| `walston/joycent-medium-no-grl` | Grad-TTS (Joycent) | Mandarín | MIT | Checkpoint PyTorch |
| VITS (variantes) | VITS (end-to-end) | Multilingüe | MIT (según variante) | Checkpoints en HF |
| FastSpeech2 (variantes) | Transformer + duration predictor | Multilingüe | MIT (según variante) | Checkpoints en HF |
| Otros Grad-TTS | Grad-TTS | Multilingüe | MIT | Checkpoints en HF |

No se dispone de datos comparativos de rendimiento (MOS, etc.) para estos modelos en la informacion proporcionada. La principal diferencia de este modelo es su enfoque en el control de acento mediante embeddings externos, algo menos común en los modelos TTS estándar.

## Limitaciones y advertencias

- Es únicamente un modelo acústico: no genera audio por sí solo; requiere el vocoder Joycent (`walston/joycent-vocoder`) para completar la síntesis.
- No se proporciona información sobre sesgos, pero al estar entrenado para mandarín, su uso fuera de este idioma no es recomendable.
- Riesgo de alucinación no aplicable (no es un modelo de lenguaje), pero la calidad de la síntesis dependerá del vocoder y del frontend de texto utilizado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco validado por la comunidad.
- La fecha de creación es 2026-08-16, lo que puede indicar que es un modelo muy nuevo o con una fecha de publicación inusual.
- No se especifican restricciones de uso comercial más allá de la licencia MIT, que permite uso comercial con atribución.
- La documentación es mínima: no se detallan los datos de entrenamiento, el número exacto de parámetros ni el procedimiento completo de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walston/joycent-medium-no-grl
- Codificador de acento (WhisAID): https://huggingface.co/walston/whisaid-medium-no-grl
- Vocoder Joycent: https://huggingface.co/walston/joycent-vocoder
