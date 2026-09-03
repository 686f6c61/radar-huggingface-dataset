# tiantiaf/childvox-circor-whisper-base

## Resumen

El modelo `tiantiaf/childvox-circor-whisper-base` es un fine-tuning de `openai/whisper-base` desarrollado por Tiantian Feng (USC) para la clasificación de soplos cardíacos en fonocardiogramas infantiles. Forma parte del proyecto ChildVox, un benchmark unificado que abarca la trayectoria de expresión sonora infantil, desde sonidos fisiológicos al nacer hasta el habla escolar. Este modelo concreto se entrena sobre el dataset CirCor, que contiene registros de auscultación de 1568 sujetos de 0 a 21 años, y clasifica cada segmento en tres categorías: `Absent`, `Unknown` y `Present`.

El modelo se presenta como una herramienta de investigación para caracterizar sonidos fisiológicos pediátricos, con una arquitectura basada en el encoder-decoder de Whisper adaptado para clasificación de audio. Su relevancia radica en que aborda una tarea especializada (detección de soplos) con un modelo ligero y de código abierto, aunque con restricciones explícitas de uso no comercial y no clínico. El trabajo se describe en el artículo "ChildVox: A Speech, Audio, and Large Audio-Language Model Benchmark in Understanding and Characterizing Sound across Childhood", aceptado en EMNLP 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de openai/whisper-base (transformer encoder-decoder) para clasificación de audio |
| Parametros totales | no disponible (basado en whisper-base, ~74M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 segundos de audio (160000 muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe (etiqueta), aunque procesa audio fisiológico, no texto |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-base` y se ajusta mediante fine-tuning sobre el dataset CirCor, compuesto por fonocardiogramas digitales (digiScope) muestreados a 8 kHz y sobremuestreados a 16 kHz. La implementación utiliza un wrapper (`WhisperWrapper`) que extrae representaciones del audio y las proyecta a un espacio de clasificación de tres etiquetas. El audio de entrada se recorta a 10 segundos (160000 muestras) y se procesa en canal mono. No se especifican detalles sobre el número de épocas, la composición exacta del dataset de entrenamiento ni el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado con etiquetas de soplo. La innovación principal reside en la adaptación de un modelo de reconocimiento de voz a una tarea de clasificación de sonidos fisiológicos, aprovechando las representaciones acústicas preentrenadas de Whisper.

## Capacidades

- Clasificación de soplos cardíacos en tres categorías: `Absent`, `Unknown` y `Present`.
- Procesamiento de audio fisiológico (fonocardiogramas) de hasta 10 segundos de duración.
- Extracción de embeddings acústicos (el wrapper permite `return_feature=True` para obtener representaciones intermedias).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente.
- No es un modelo de lenguaje; su salida es una distribución de probabilidad sobre las tres clases.
- La etiqueta "multilingual" en HuggingFace se refiere a la naturaleza del dataset original de Whisper, pero el modelo no procesa texto ni idiomas.

## Casos de uso

- Investigación en fonocardiografía pediátrica: el modelo puede utilizarse para explorar la viabilidad de clasificación automática de soplos en entornos académicos, comparando su rendimiento con otros enfoques (SSAST, WavLM) sobre el dataset CirCor.
- Desarrollo de pipelines de preprocesamiento de audio fisiológico: al ser un modelo ligero, puede integrarse en flujos de análisis de señales para extraer características acústicas de fonocardiogramas.
- Educación médica: como herramienta didáctica para ilustrar la aplicación de modelos de deep learning a la auscultación, siempre bajo supervisión humana y sin uso diagnóstico.
- Benchmarking de modelos de audio en dominios especializados: el modelo sirve como referencia dentro del marco ChildVox para comparar arquitecturas en tareas de clasificación de sonidos corporales.
- Estudio de transferencia de aprendizaje: permite analizar cómo un modelo preentrenado en habla (Whisper) se adapta a dominios no lingüísticos, lo que puede informar futuros diseños de modelos multimodales.
- Prototipado de sistemas de screening no clínico: en contextos de investigación con aprobación ética, podría usarse para experimentar con detección temprana de anomalías cardíacas, siempre que se respeten las restricciones de uso y se valide con expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El artículo de ChildVox reporta comparaciones generales entre arquitecturas para clasificación de sonidos fisiológicos, indicando que WavLM-Large alcanza un F1 de 0.643 en CirCor, pero no se proporcionan métricas concretas para `childvox-circor-whisper-base`. Se recomienda consultar el paper para obtener detalles completos.

## Requisitos de hardware

- Al ser un fine-tuning de whisper-base (~74M parámetros), el modelo es ligero y puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- VRAM estimada: en fp32, el modelo ocupa aproximadamente 300 MB; en fp16, unos 150 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 20xx o superior) para inferencia rápida; una A100 o H100 no es necesaria.
- Opciones de despliegue: al usar la librería `transformers`, puede servirse con Hugging Face Inference Endpoints, o mediante scripts personalizados con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de generación de texto.
- Latencia y throughput: no disponibles; depende del hardware y del lote. En una GPU consumer, la inferencia de un segmento de 10 s debería completarse en menos de 100 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| childvox-circor-whisper-base | Whisper-base fine-tuned | ~74M | 10 s audio | OpenRAIL | Clasificación de soplos |
| SSAST (Self-Supervised Audio Spectrogram Transformer) | Transformer de audio | ~89M | Variable | MIT | Clasificación de audio general |
| WavLM-Large | Transformer de audio | ~316M | Variable | MIT | Representaciones de audio |

Según el paper ChildVox, WavLM-Large y SSAST superan a los modelos basados en Whisper en tareas de clasificación de sonidos fisiológicos, con WavLM-Large logrando el mejor F1 en CirCor (0.643). Sin embargo, no se dispone de métricas comparativas directas para este modelo concreto en la información proporcionada.

## Limitaciones y advertencias

- Uso restringido: el modelo card prohíbe explícitamente aplicaciones clínicas o diagnósticas, evaluación del desarrollo individual sin revisión experta, vigilancia, aplicaciones invasivas de privacidad y uso comercial.
- Datos sensibles: los fonocardiogramas de niños son información altamente sensible; cualquier uso debe cumplir con normativas éticas y de protección de datos (IRB, GDPR, etc.).
- Sesgos potenciales: el dataset CirCor tiene una distribución específica de edades y condiciones; el modelo puede no generalizar a otras poblaciones o entornos de grabación.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas (falsos positivos/negativos) que deben interpretarse con cautela.
- Limitaciones de contexto: la ventana fija de 10 segundos puede no capturar soplos intermitentes o de duración variable.
- Dependencia del preprocesamiento: el modelo espera audio a 16 kHz, mono y recortado a 10 s; desviaciones en estos parámetros degradan el rendimiento.
- Sin garantías de producción: al ser un modelo de investigación, no se ofrecen garantías de robustez ni soporte para entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiantiaf/childvox-circor-whisper-base
- Paper (arXiv): https://arxiv.org/abs/2605.29257
- Repositorio GitHub: https://github.com/tiantiaf0627/childvox-release
- Página del proyecto ChildVox: https://tiantiaf0627.github.io/childvox/
- Colección ChildVox en Hugging Face: https://huggingface.co/collections/tiantiaf/childvox
