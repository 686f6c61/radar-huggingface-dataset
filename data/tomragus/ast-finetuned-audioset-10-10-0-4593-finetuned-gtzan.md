# tomragus/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan

## Resumen

El modelo `tomragus/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan` es un clasificador de audio basado en un Audio Spectrogram Transformer (AST), desarrollado por el usuario tomragus. Se trata de un ajuste fino (fine-tuning) del modelo base `MIT/ast-finetuned-audioset-10-10-0.4593`, que ya había sido preentrenado en el conjunto de datos AudioSet, y que posteriormente se ha especializado en la clasificación de géneros musicales utilizando el dataset GTZAN. El modelo resuelve la tarea de clasificación de audio, concretamente la identificación de diez géneros musicales distintos.

Con aproximadamente 86,2 millones de parámetros, es un modelo de tamaño moderado que puede ejecutarse en hardware de consumo. Su relevancia radica en que ofrece una solución práctica y de código abierto (licencia BSD-3-Clause) para tareas de análisis musical y clasificación de audio, con un rendimiento medido en precisión del 87,54 % sobre el conjunto de evaluación de GTZAN. La arquitectura AST, basada en transformers aplicados a espectrogramas, permite capturar patrones temporales y espectrales de la señal de audio de forma eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa espectrogramas, no texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Audio Spectrogram Transformer (AST), que adapta el transformer de visión (ViT) al dominio del audio. La señal de audio se convierte en un espectrograma (representación tiempo-frecuencia) que se divide en parches, los cuales se procesan mediante capas de atención. El modelo base `MIT/ast-finetuned-audioset-10-10-0.4593` fue preentrenado en AudioSet, un conjunto masivo de clips de audio etiquetados, y posteriormente se ha ajustado en el dataset GTZAN, compuesto por 1000 clips de audio de 30 segundos distribuidos en 10 géneros musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock).

El entrenamiento se realizó con el framework Transformers de HuggingFace, utilizando el Trainer. Los hiperparámetros principales incluyen una tasa de aprendizaje de 5e-5, tamaño de lote de 8, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, programador de tasa de aprendizaje lineal con un calentamiento del 10 % de los pasos, y 10 épocas. Se empleó precisión mixta (Native AMP). El proceso de entrenamiento se detuvo en la época 4.27 (paso 1439), probablemente por criterios de parada temprana. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un ajuste supervisado clásico.

## Capacidades

- Clasificación de audio: identifica el género musical de un clip de audio entre 10 categorías (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Procesamiento de espectrogramas: acepta como entrada una representación de audio en forma de espectrograma, típicamente generada a partir de una señal de audio muestreada a 16 kHz o similar.
- Inferencia en tiempo real: al ser un modelo de tamaño moderado, puede ejecutarse en CPU o GPU con latencias razonables para aplicaciones interactivas.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá del audio.
- No se especifican capacidades multilingües, ya que el modelo no procesa texto.

## Casos de uso

- Clasificación automática de géneros musicales en bibliotecas de audio: el modelo puede etiquetar automáticamente canciones en una colección personal o comercial, facilitando la organización y búsqueda por género. Su precisión del 87,5 % en GTZAN lo hace adecuado para tareas de etiquetado masivo.
- Sistemas de recomendación musical: integrado en un pipeline de recomendación, puede clasificar nuevas pistas para sugerir contenido similar a los usuarios según sus preferencias de género.
- Análisis de contenido en plataformas de streaming: para moderar o categorizar subidas de audio, el modelo puede asignar etiquetas de género de forma automática, reduciendo el trabajo manual.
- Aplicaciones educativas de música: permite a estudiantes o aficionados identificar el género de una pieza desconocida, sirviendo como herramienta de aprendizaje interactivo.
- Investigación en MIR (Music Information Retrieval): sirve como punto de partida para experimentos sobre clasificación de audio, comparación de arquitecturas o extracción de características.
- Automatización de metadatos en producción audiovisual: en estudios de grabación o postproducción, el modelo puede etiquetar pistas de audio para su uso en bandas sonoras, facilitando la búsqueda por género.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo de clasificación de audio y no de lenguaje. Sin embargo, la model card reporta los siguientes resultados sobre el conjunto de evaluación de GTZAN:

| Metrica | Valor |
|---|---|
| eval_loss | 0,5764 |
| eval_accuracy | 0,8754 |
| eval_runtime | 54,5075 s |
| eval_samples_per_second | 5,449 |
| eval_steps_per_second | 0,697 |

Estos valores indican una precisión del 87,54 % en la clasificación de géneros, con un tiempo de evaluación de aproximadamente 54,5 segundos para el conjunto de evaluación (que probablemente contiene 297 muestras, según la tasa de muestras por segundo). No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 345 MB de memoria. En FP16, unos 172 MB. Esto permite ejecutarlo en GPUs con 4 GB de VRAM o incluso menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con HuggingFace Inference Endpoints, o mediante bibliotecas como vLLM (aunque está orientado a texto, puede adaptarse), o más comúnmente con pipelines de Transformers en Python. También se puede exportar a ONNX para optimización.
- Latencia y throughput estimados: no se proporcionan datos oficiales. En una GPU moderna (por ejemplo, RTX 3090), la inferencia de un clip de 30 segundos debería completarse en menos de 100 ms. En CPU, podría tardar varios segundos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de clasificación de audio. Sin embargo, se pueden mencionar alternativas genéricas:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan (este) | 86 M | no aplica | 87,5 % accuracy en GTZAN | BSD-3-Clause |
| Wav2Vec2 (base) | 95 M | no aplica | no disponible | Apache-2.0 |
| YAMNet | 3,2 M | no aplica | no disponible | Apache-2.0 |

Nota: los datos de los modelos alternativos son aproximados y no se basan en comparaciones directas. Se recomienda consultar sus respectivas fichas para más detalles.

## Limitaciones y advertencias

- El modelo está especializado en los 10 géneros de GTZAN; no reconoce otros géneros ni sonidos no musicales.
- La precisión del 87,5 % indica que hay un margen de error del 12,5 %, que puede ser relevante en aplicaciones críticas.
- No se han documentado sesgos específicos, pero el dataset GTZAN es limitado en diversidad cultural y geográfica, lo que puede afectar a la generalización a otros estilos musicales.
- El modelo no es multimodal ni procesa texto; solo acepta espectrogramas como entrada.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos exactos.
- No se proporcionan instrucciones detalladas de uso ni ejemplos de preprocesamiento de audio, lo que puede dificultar su integración.
- El modelo fue generado automáticamente por el Trainer, por lo que la model card carece de documentación exhaustiva sobre limitaciones específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomragus/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
