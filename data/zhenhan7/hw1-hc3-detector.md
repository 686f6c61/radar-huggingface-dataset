# zhenhan7/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario de texto en ingles publicado por el usuario zhenhan7 en HuggingFace. Su funcion es determinar si una respuesta del corpus HC3 (Human ChatGPT Comparison Corpus) fue escrita por una persona o generada por ChatGPT. Se trata de un ajuste fino (fine-tuning) del modelo de embeddings sentence-transformers/all-MiniLM-L6-v2, una red transformer tipo BERT de 6 capas y 22.713.986 parametros, sobre una tarea de clasificacion de secuencias con dos etiquetas: 0 para humano y 1 para ChatGPT.

El modelo nace como entrega de la tarea CS546 Homework 1, no como un sistema de deteccion de contenido generado por IA listo para produccion. Su relevancia es acotada: sirve como referencia academica de como un encoder pequeno ajustado con pocos epochs puede pasar del 84,49% de exactitud de una linea base con regresion logistica sobre embeddings congelados al 99,59% en el split de test del propio trabajo. Es, por tanto, un ejemplo de laboratorio mas que una herramienta validada externamente.

El repositorio ocupa 0,1 GB, acumula 12 descargas y 0 likes en el momento de la consulta, y no declara licencia. Estas cifras, junto con el aviso explicito de la model card ("no establece la precision en otros conjuntos de datos ni prueba la autoria de un documento individual"), condicionan cualquier uso fuera del ambito docente para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: sentence-transformers/all-MiniLM-L6-v2), con cabeza de clasificacion de secuencias |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base all-MiniLM-L6-v2 se configura habitualmente con un maximo de 256 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente FP32) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificacion binaria) |
| Etiquetas | 0 = human, 1 = ChatGPT |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es la del encoder all-MiniLM-L6-v2: un transformer de 6 capas con mecanismo de atencion multi-cabeza, disenado originalmente para generar embeddings de frases. Sobre ese encoder se anade una cabeza de clasificacion (AutoModelForSequenceClassification) que proyecta la representacion de la secuencia a dos clases. Con 22,7 millones de parametros, esta muy por debajo de los encoders tipo BERT-base (110 M) o RoBERTa-base (125 M), lo que lo hace muy ligero en memoria e inferencia.

Los datos de entrenamiento proceden del corpus HC3, restringido al split de la tarea: 37.334 ejemplos de entrenamiento, 4.666 de validacion y 4.668 de test. La model card indica explicitamente que en esta ejecucion no se calculo la perdida de validacion y que los resultados se obtuvieron en el split de test del propio trabajo. No se documenta el numero de epochs, la tasa de aprendizaje, la estrategia de tokenizacion, ni si hubo tecnicas adicionales como RLHF o DPO (no aplicables, en cualquier caso, a un clasificador de este tipo). La innovacion tecnica destacable se limita al contraste con la linea base: embeddings congelados mas regresion logistica frente a ajuste fino completo del encoder y la cabeza.

## Capacidades

- Clasificacion binaria de texto: distingue entre respuestas humanas y respuestas generadas por ChatGPT en el dominio del corpus HC3.
- Deteccion de texto generado por IA: es la funcion declarada en las etiquetas del repositorio (ai-generated-text-detection), limitada al estilo y dominio de HC3.
- Procesamiento de texto en ingles unicamente.
- Inferencia muy rapida por su tamano reducido (22,7 M de parametros).
- Compatibilidad con la libreria transformers y con text-embeddings-inference, e integrable en endpoints compatibles.
- No soporta tool calling ni function calling.
- No incorpora modo de razonamiento (thinking mode), vision ni audio.
- No esta disenado para generacion de texto: es un modelo discriminativo.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Docencia y practicas de NLP: reproducir el ejercicio CS546, comparar una linea base de embeddings congelados mas regresion logistica frente a un ajuste fino, y analizar la brecha de rendimiento entre ambos.
- Experimentos de deteccion de texto generado en ingles: usar el modelo como referencia rapida para comprobar si un detector pequeno puede separar respuestas humanas de respuestas de ChatGPT en un corpus concreto, siempre que el dominio sea similar a HC3.
- Filtrado preliminar en investigacion sobre calidad de datos: marcar respuestas sospechosas de ser generadas por IA dentro de un pipeline de anotacion, con revision humana posterior obligatoria.
- Benchmark de tecnicas de fine-tuning: servir como punto de comparacion de bajo coste computacional (22,7 M de parametros) frente a alternativas como BERT-base, RoBERTa o DistilBERT entrenadas sobre el mismo corpus.
- Pruebas de integracion en infraestructura de inferencia: validar despliegues con text-embeddings-inference o endpoints compatibles usando un clasificador minusculo que cabe en cualquier nodo.
- Analisis de sesgos y artefactos del corpus HC3: estudiar si el clasificador aprende senales espurias (longitud del texto, puntuacion, formato) en lugar de rasgos estilisticos genuinos, comparando su comportamiento en subconjuntos del corpus.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test de 4.668 ejemplos del trabajo:

| Modelo | Exactitud en test | Macro F1 | Errores en test |
|---|---:|---:|---:|
| Linea base: embeddings congelados + regresion logistica | 0,844901 (84,49%) | 0,844882 | 724 |
| Clasificador ajustado (este repositorio) | 0,995930 (99,59%) | 0,995930 | 19 |

No se han publicado resultados en la informacion disponible para otros conjuntos de datos, ni metricas adicionales como precision, recall o AUC por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 91 MB; en FP16, unos 45 MB; en int8, unos 23 MB. Con el overhead del runtime, el consumo real se mantiene muy por debajo de 1 GB.
- GPU recomendadas: no requiere GPU. Funciona correctamente en CPU. Cualquier GPU es suficiente, desde una T4 o una GTX 1650 hasta una RTX 4090, A100 o H100, donde quedara infrautilizada.
- Si cabe en GPU de consumo: si, en todas las GPU consumer actuales e incluso en GPU integradas y en hardware de placa unica (Raspberry Pi, etc.).
- Opciones de despliegue: pipeline de transformers, text-embeddings-inference (etiqueta presente en el repositorio), endpoints compatibles con HuggingFace, exportacion a ONNX para inferencia en CPU. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion previa.
- Latencia y throughput estimados: no se han publicado datos. Por el tamano del modelo (22,7 M de parametros, secuencias de hasta 256 tokens) es razonable esperar latencias del orden de milisegundos por muestra en CPU moderna y muy inferiores en GPU, pero se trata de una estimacion, no de una cifra medida por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud en HC3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhenhan7/hw1-hc3-detector | 22,7 M | no disponible | 99,59% en el split del trabajo (4.668 ejemplos) | no disponible | HuggingFace, 12 descargas |
| aggnim/ai-text-detector (GitHub) | no disponible (BERT, RoBERTa, DistilBERT) | no disponible | mas del 93% segun el repositorio | no disponible | GitHub |
| Chengwei-Shen/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens (configuracion habitual) | no aplica (modelo de embeddings, no clasificador) | Apache 2.0 en el modelo base | HuggingFace, ampliamente utilizado |

La comparacion con otras entregas del mismo ejercicio (Chengwei-Shen, Yihangsun, skyyyyks) sugiere que existen varios repositorios practicamente identicos; solo el de zhenhan7 publica resultados detallados en su model card.

## Limitaciones y advertencias

- Alcance experimental: el propio autor advierte que la exactitud reportada mide el rendimiento unicamente en el split de test de su tarea y no establece la precision en otros conjuntos de datos.
- No prueba autoria individual: la model card indica explicitamente que el modelo no demuestra quien escribio un documento concreto. No debe usarse como prueba en contextos academicos, editoriales o disciplinarios.
- Riesgo de artefactos del corpus: con 37.334 ejemplos de entrenamiento y una mejora tan abrupta respecto a la linea base (de 84,49% a 99,59%), es plausible que el clasificador este explotando senales superficiales del dataset (longitud, formato, puntuacion, vocabulario del dominio) en lugar de rasgos estilisticos generalizables.
- Sesgos conocidos: no se documenta ningun analisis de sesgos. Al entrenarse sobre HC3, hereda los sesgos de dominio, tematica y registro de ese corpus.
- Limitacion de idioma: solo ingles. No se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Limitacion de contexto: la longitud maxima de secuencia no se especifica en la model card; textos largos pueden truncarse.
- Licencia no disponible: la ausencia de licencia declarada impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier uso en produccion.
- Sin validacion de la comunidad: 12 descargas y 0 likes implican que el modelo no ha sido replicado ni auditado por terceros.
- Ambiguedad de la clase "humano": los textos humanos y los generados por ChatGPT pueden mezclarse (edicion humana de texto generado, reescritura), lo que degrada la precision en escenarios reales.
- Uso responsable: emplearlo como herramienta de cribado con supervision humana, nunca como decision automatizada con consecuencias sobre personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhenhan7/hw1-hc3-detector
- Archivos y versiones: https://huggingface.co/zhenhan7/hw1-hc3-detector/tree/main
- Repositorio alternativo con la misma tarea: https://huggingface.co/Chengwei-Shen/hw1-hc3-detector
- Ficha de terceros sobre otra copia del modelo: https://savrn.com/models/hw1-hc3-detector
- Registro de terceros: https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
- Proyecto comparativo de deteccion de texto IA sobre HC3 (BERT, RoBERTa, DistilBERT): https://github.com/aggnim/ai-text-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
