# troyskie/beewatch_ast_3class

## Resumen

beewatch_ast_3class es un modelo de clasificación de audio publicado por el usuario troyskie en HuggingFace. Se trata de un ajuste fino (fine-tuning) del checkpoint MIT/ast-finetuned-audioset-10-10-0.4593, que es un Audio Spectrogram Transformer (AST) preentrenado sobre AudioSet. El modelo resultante tiene 86.191.107 parámetros y está orientado a una tarea de clasificación de audio con tres clases, según se deduce del propio nombre del repositorio; los nombres concretos de esas tres clases no se documentan en la model card.

El modelo se distribuye en formato safetensors bajo licencia BSD-3-Clause, es compatible con la librería transformers y con el pipeline `audio-classification` de HuggingFace. Su relevancia es acotada: se trata de un experimento derivado de una sesión de entrenamiento con el `Trainer` de transformers, sin documentación sobre el conjunto de datos, sin descripción de uso previsto y con cero descargas y cero likes en el momento de redactar esta ficha. Por el nombre ("beewatch"), es plausible que esté vinculado a monitorización acústica de colmenas, pero esto no se confirma en ninguna fuente oficial.

El interés técnico principal reside en que sirve como ejemplo de ajuste fino ligero de un AST para dominios acústicos específicos, con un coste de cómputo bajo (~86 M de parámetros) y una integración directa en el ecosistema transformers. No obstante, la ausencia total de información sobre el dataset y la naturaleza sospechosamente perfecta de sus métricas de validación obligan a tratarlo como un artefacto experimental, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer de tipo ViT aplicado sobre espectrogramas mel |
| Parámetros totales | 86.191.107 (~86,2 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de audio de entrada de 10,24 s a 16 kHz (heredada del modelo base) |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | no disponible; el modelo opera sobre audio, no sobre texto |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base MIT/ast-finetuned-audioset-10-10-0.4593: un Audio Spectrogram Transformer, es decir, un transformer con mecanismo de autoatención estándar que trata el espectrograma mel como una imagen y lo divide en parches solapados. El modelo base fue preentrenado sobre AudioSet (527 clases de eventos sonoros) y su nombre indica la configuración de parches empleada (16x16 con stride 10x10) y su mAP de 0,4593 sobre AudioSet. El fine-tuning aquí realizado únicamente sustituye la cabeza de clasificación de 527 clases por una de 3 clases y reajusta los pesos.

Los detalles del entrenamiento sí están documentados parcialmente en la model card: optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, learning rate 1e-5, scheduler lineal con 10 pasos de warmup, batch de 16 tanto en entrenamiento como en evaluación, semilla 42, 15 épocas y precisión mixta nativa (AMP). Con 48 pasos por época y batch de 16, se puede inferir que el conjunto de entrenamiento tenía del orden de 768 muestras por época, lo que apunta a un dataset muy pequeño. No se especifica la composición del dataset, si hubo aumentación de datos, ni si se aplicaron técnicas de regularización como dropout o weight decay. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se documenta ningún tipo de alineación por preferencias (RLHF, DPO) ni innovación técnica adicional.

## Capacidades

- Clasificación de audio en tres clases discretas, con salida de logits y probabilidades por clase a través del pipeline `audio-classification`.
- Procesamiento de fragmentos de audio de aproximadamente 10,24 segundos a 16 kHz, muestreados a espectrograma mel como entrada.
- Extracción de representaciones de audio mediante el encoder del AST, reutilizables para tareas posteriores como embeddings o clasificación con otra cabeza.
- Integración directa con `transformers` (`AutoModelForAudioClassification`), lo que permite carga en una línea de código y uso con `Trainer` o `pipeline`.
- No dispone de generación de texto, razonamiento, código ni matemáticas: es un modelo discriminativo de audio, no un modelo de lenguaje.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades multilingües en el sentido textual; la noción de idioma no aplica.
- No se documentan capacidades especiales como modo thinking, visión, audio generativo ni procesamiento de audio de longitud variable más allá de la ventana fija.

## Casos de uso

- Monitorización acústica de colmenas: si las tres clases se corresponden con estados de la colmena (por ejemplo, actividad normal, enjambrazón o estrés), el modelo podría desplegarse en un nodo de borde con micrófono para clasificar ventanas de 10 segundos y generar alertas tempranas al apicultor.
- Investigación en bioacústica: uso de los embeddings del encoder como features para análisis exploratorio de grabaciones de campo, agrupamiento no supervisado o etiquetado asistido de nuevos corpus.
- Prototipado rápido de clasificadores de sonido ambiental: al ser un fine-tuning sobre AST, sirve como plantilla reproducible para adaptar el modelo base a otras taxonomías de sonido con pocos cientos de ejemplos.
- Filtrado y triaje de archivos de audio: descartar automáticamente grabaciones irrelevantes en un repositorio antes de un análisis manual más costoso.
- Sistemas de alerta en tiempo casi real en dispositivos de bajo consumo: con ~86 M de parámetros y pesos en fp16 (~172 MB), el modelo cabe en una Raspberry Pi con acelerador o en una GPU integrada, permitiendo inferencia local sin conexión.
- Validación de pipelines de datos acústicos: usar el modelo como comprobación de cordura en un pipeline de ingesta para verificar que las señales capturadas mantienen la distribución esperada.
- Docencia y reproducción de experimentos: ejemplo mínimo y de bajo coste de fine-tuning de un transformer de audio con la API `Trainer`, útil en cursos de deep learning aplicado a señales.
- Benchmark interno de comparación: servir como referencia de un modelo específico de dominio frente a clasificadores genéricos de AudioSet en una tarea concreta de tres clases.

## Benchmarks y rendimiento

El campo `model-index` de la model card está declarado pero con la lista de resultados vacía, por lo que no hay benchmarks externos (MMLU, HumanEval, GSM8K u otros) publicados. Lo único disponible son las métricas de validación registradas por el `Trainer` durante el entrenamiento, que se reproducen a continuación tal cual las declara el autor:

| Época | Paso | Pérdida de validación | Accuracy | Macro precision | Macro recall | Macro F1 |
|---|---|---|---|---|---|---|
| 1,0 | 48 | 0,1543 | 0,9509 | 0,9386 | 0,9490 | 0,9429 |
| 2,0 | 96 | 0,0421 | 0,9877 | 0,9810 | 0,9897 | 0,9850 |
| 3,0 | 144 | 0,0253 | 0,9877 | 0,9900 | 0,9798 | 0,9845 |
| 4,0 | 192 | 0,0066 | 1,0 | 1,0 | 1,0 | 1,0 |
| 8,0 | 384 | 0,0035 | 1,0 | 1,0 | 1,0 | 1,0 |
| 15,0 | 720 | 0,0029 | 1,0 | 1,0 | 1,0 | 1,0 |

El resultado final declarado es de pérdida 0,0029 y accuracy, macro precision, macro recall y macro F1 de 1,0. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,35 GB en fp32 y 0,18 GB en fp16 solo para los pesos; con activaciones y buffers de entrada, el consumo realista se mantiene por debajo de 1 GB en fp32 y de 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 ofrecen margen de sobra. El modelo base AST de 86 M de parámetros no requiere aceleradores de gama alta.
- Cabe sin problema en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM, e incluso en iGPU y en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("audio-classification")`, servido mediante Text Generation Inference no aplica por ser un modelo de clasificación; alternativas razonables son un servidor FastAPI propio, TorchServe, o exportación a ONNX Runtime para inferencia en CPU. No hay variantes GGUF publicadas, por lo que llama.cpp y Ollama no son aplicables directamente en este momento.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de throughput en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparativos provienen de conocimiento general sobre AST, PANNs, BEATs y YAMNet, y no se han verificado dentro de la información proporcionada para esta ficha; se marcan como no verificados donde corresponde.

| Modelo | Parámetros | Clases | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beewatch_ast_3class | 86,2 M | 3 (nombres no disponibles) | ventana de ~10,24 s a 16 kHz | BSD-3-Clause | HuggingFace, 0 descargas |
| MIT/ast-finetuned-audioset-10-10-0.4593 (base) | 86,2 M | 527 (AudioSet) | ventana de ~10,24 s a 16 kHz | BSD-3-Clause | HuggingFace |
| PANNs CNN14 (AudioSet) | datos no disponibles en esta búsqueda | 527 (AudioSet) | variable | datos no disponibles | GitHub y checkpoints públicos |
| BEATs iter3+ | datos no disponibles en esta búsqueda | 527 (AudioSet) | variable | datos no disponibles | GitHub y HuggingFace |
| YAMNet | datos no disponibles en esta búsqueda | 521 (AudioSet) | ventana de ~0,975 s a 16 kHz | Apache 2.0 | TensorFlow Hub |

En términos de parámetros y arquitectura, la comparación más directa es con el propio modelo base: este fine-tuning reduce la cabeza de clasificación de 527 a 3 clases sin cambiar el encoder. Frente a alternativas específicas de bioacústica, no se dispone de datos suficientes para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento es desconocido ("on an unknown dataset" según la propia model card); no se puede evaluar la representatividad ni el equilibrio de clases.
- La accuracy de validación de 1,0 desde la cuarta época, con una pérdida de 0,0029, es un indicio fuerte de sobreajuste o de un dataset de validación trivial o muy pequeño (del orden de cientos de muestras). Estas métricas no son extrapolables a datos reales.
- No se documentan los nombres ni la semántica de las tres clases, lo que impide interpretar la salida del modelo sin acceso al código del autor.
- La model card contiene marcadores de plantilla sin rellenar ("More information needed") en las secciones de descripción, usos previstos y datos de entrenamiento, lo que indica que no fue revisada antes de publicarse.
- No hay validación externa ni benchmarks independientes: cero descargas y cero likes en el momento de la consulta.
- La fecha de creación del repositorio aparece como 2026-09-22, posterior a la fecha de referencia habitual de consulta; conviene verificarla antes de citarla.
- No se publican variantes cuantizadas ni exportaciones a ONNX, por lo que el despliegue en entornos con restricciones de memoria requiere conversión manual.
- La licencia BSD-3-Clause permite uso comercial siempre que se conserve el aviso de copyright y la cláusula de exención de responsabilidad, y prohíbe el uso del nombre del autor para promocionar derivados sin permiso. Es responsabilidad del usuario verificar la licencia del modelo base y de los datos de audio empleados, que no se especifican.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas: al no haber umbral de confianza ni calibración documentada, las probabilidades de salida no deben interpretarse como certezas.
- El modelo solo procesa audio de aproximadamente 10,24 segundos por ventana; grabaciones más largas requieren segmentación y agregación manual, con la consiguiente pérdida de contexto temporal entre ventanas.
- No hay soporte multilingüe ni de texto: cualquier pipeline que espere capacidades de lenguaje natural sobre este modelo fallará.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/troyskie/beewatch_ast_3class
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las URLs devueltas por la búsqueda corresponden a contenidos sobre ChatGPT y GitHub Copilot sin relación con esta ficha, por lo que se descartan.
- Paper del modelo base (AST, "AST: Audio Spectrogram Transformer"): no disponible en la información proporcionada.
- Repositorio de código del autor: no disponible en la información proporcionada.
- Demo o Space: no disponible.
