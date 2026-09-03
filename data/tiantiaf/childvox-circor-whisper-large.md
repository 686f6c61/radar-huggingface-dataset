# tiantiaf/childvox-circor-whisper-large

## Resumen

El modelo `tiantiaf/childvox-circor-whisper-large` es un clasificador de audio fisiológico desarrollado por Tiantian Feng (USC) y colaboradores, que forma parte del benchmark ChildVox presentado en el artículo "ChildVox: A Speech, Audio, and Large Audio-Language Model Benchmark in Understanding and Characterizing Sound across Childhood" (aceptado en EMNLP 2026). Se trata de un fine-tuning del modelo base `openai/whisper-large-v3` sobre el dataset CirCor, que contiene fonocardiogramas digitales (grabaciones de sonidos cardíacos) de 1568 sujetos de entre 0 y 21 años, recogidos en las cuatro ubicaciones principales de auscultación.

El modelo resuelve la tarea de clasificación de soplos cardíacos en tres categorías: "Absent" (ausente), "Unknown" (desconocido) y "Present" (presente). Su relevancia radica en que aborda un problema clínico no invasivo mediante aprendizaje profundo, aunque el propio autor advierte explícitamente que no debe utilizarse para diagnóstico clínico ni para uso comercial. La arquitectura se basa en el encoder-decoder de Whisper-large-v3, adaptado para clasificación de audio, con una ventana de entrada limitada a 10 segundos a 16 kHz en mono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large-v3 (encoder-decoder transformer) adaptado para clasificación de audio |
| Parametros totales | 1550 millones (heredados de Whisper-large-v3) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 10 segundos de audio (16 kHz, mono) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | multilingual (el modelo base Whisper soporta múltiples idiomas, pero la tarea es clasificación de audio, no transcripción) |
| Licencia | OpenRAIL (openrail) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Whisper-large-v3, un transformer encoder-decoder con aproximadamente 1550 millones de parámetros, originalmente entrenado para reconocimiento de voz multilingüe. En este caso, se ha sustituido la cabeza de decodificación por una capa de clasificación que produce tres logits correspondientes a las etiquetas de soplo cardíaco. El entrenamiento se realizó mediante fine-tuning sobre el dataset CirCor, que incluye fonocardiogramas digitales (digiScope) muestreados a 8 kHz y posteriormente sobremuestreados a 16 kHz. La entrada se trunca o rellena a 10 segundos (160 000 muestras). No se especifican detalles sobre el número de épocas, la función de pérdida o si se emplearon técnicas como RLHF o DPO; la información disponible solo indica que se trata de un fine-tuning supervisado estándar. El modelo se integra en el framework ChildVox mediante un wrapper (`WhisperWrapper`) que permite cargar diferentes pliegues (folds) del entrenamiento.

## Capacidades

- Clasificación de soplos cardíacos en tres categorías: "Absent", "Unknown" y "Present".
- Procesamiento de audio fisiológico (fonocardiogramas) con entrada de 10 segundos a 16 kHz.
- Extracción de embeddings de audio (el método `return_feature=True` devuelve representaciones intermedias).
- Soporte para inferencia en GPU o CPU mediante PyTorch.
- Integración con el ecosistema Hugging Face (transformers, safetensors, model_hub_mixin).
- No incluye generación de texto, tool calling, capacidades de agente ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Investigación en análisis de sonidos fisiológicos pediátricos: el modelo puede utilizarse en estudios académicos para caracterizar soplos cardíacos en poblaciones infantiles, siempre que se cuente con aprobación ética y consentimiento informado.
- Desarrollo de herramientas de apoyo a la formación médica: podría integrarse en simuladores o plataformas educativas para enseñar a estudiantes de medicina a identificar soplos, sin uso diagnóstico real.
- Evaluación comparativa de modelos de audio: como parte del benchmark ChildVox, sirve para comparar el rendimiento de distintos modelos de audio en tareas de clasificación fisiológica.
- Preprocesamiento de señales cardíacas: los embeddings extraídos pueden alimentar otros sistemas de análisis o servir como características para modelos secundarios.
- Investigación en transferencia de aprendizaje: permite estudiar cómo un modelo de reconocimiento de voz (Whisper) se adapta a dominios no lingüísticos como la auscultación.
- Validación de pipelines de audio en entornos de investigación: el código de ejemplo de la model card facilita la reproducción y la integración en flujos de trabajo existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas (accuracy, F1, etc.) para el modelo en el dataset CirCor. El artículo de ChildVox (arXiv:2605.29257) describe el benchmark completo, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: al basarse en Whisper-large-v3 (1550M parámetros), se requiere aproximadamente 10 GB de VRAM en precisión fp16 para inferencia. Con cuantización a 8 bits podría reducirse a unos 5-6 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o similares con al menos 12 GB de VRAM. En CPU es posible ejecutar la inferencia, pero con latencia elevada.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4080 con 16 GB puede ejecutar el modelo en fp16 sin problemas.
- Opciones de despliegue: el modelo se carga mediante `WhisperWrapper` desde el repositorio de GitHub ChildVox, usando PyTorch y transformers. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la documentación. Se estima que una inferencia sobre 10 segundos de audio tarda menos de 1 segundo en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de soplos cardíacos con arquitecturas basadas en Whisper). El único punto de referencia es el propio modelo base `openai/whisper-large-v3`, que no está diseñado para clasificación de audio fisiológico. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Uso fuera de alcance: el autor prohíbe explícitamente el uso clínico o diagnóstico, la evaluación del desarrollo individual sin revisión humana experta, la vigilancia, aplicaciones invasivas de privacidad y el uso comercial.
- Datos sensibles: los sonidos fisiológicos de niños son altamente sensibles; se requiere aprobación ética/IRB y cumplimiento de las leyes locales.
- Sesgos potenciales: el dataset CirCor puede tener desequilibrios de clases o limitaciones demográficas; no se documentan análisis de sesgo.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero la probabilidad de clasificación errónea existe, especialmente en la categoría "Unknown".
- Limitaciones de contexto: la ventana fija de 10 segundos puede no capturar eventos cardíacos completos en algunos casos.
- Licencia OpenRAIL: permite uso de investigación, pero restringe aplicaciones comerciales y de alto riesgo; debe revisarse el texto completo de la licencia.
- Reproducibilidad: el modelo depende de un wrapper específico (`WhisperWrapper`) que no está disponible en el ecosistema estándar de transformers; requiere instalar el paquete ChildVox desde GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiantiaf/childvox-circor-whisper-large
- Colección ChildVox en Hugging Face: https://huggingface.co/collections/tiantiaf/childvox
- Sitio web del proyecto: https://tiantiaf0627.github.io/childvox/
- Artículo en arXiv: https://arxiv.org/abs/2605.29257
- PDF del artículo: https://arxiv.org/pdf/2605.29257
- Repositorio GitHub: https://github.com/tiantiaf0627/childvox-release
