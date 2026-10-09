# TigreGotico/wav2vec2-xlsr-53-espeak-cv-ft-onnx

## Resumen

Este repositorio contiene una exportacion a ONNX de `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, un modelo de reconocimiento fonetico desarrollado originalmente por Meta AI (Xu, Baevski y Auli). El modelo base es XLSR-53, un wav2vec 2.0 preentrenado de forma auto-supervisada sobre habla de 53 idiomas, afinado despues con CTC sobre Common Voice para producir directamente secuencias de fonemas en notacion espeak-ng en lugar de texto ortografico.

El problema que resuelve es la transcripcion fonetica multilingue en escenario zero-shot: al predecir unidades foneticas compartidas entre idiomas, el modelo puede transcribir phoneticamente lenguas para las que no se afino especificamente, algo util en documentacion de lenguas minoritarias, evaluacion de pronunciacion y alineamiento forzado. Su relevancia practica en este repositorio concreto es el formato: un grafo ONNX con ejes dinamicos que elimina la dependencia de PyTorch en produccion.

La exportacion la firma el usuario TigreGotico y esta generada de forma automatica por un modelo de lenguaje (segun la propia model card, sin revision humana). El grafo devuelve logits por trama y deja la decodificacion CTC fuera del modelo, con una comprobacion de paridad de 12 clips y 170 fonemas frente al modelo original en PyTorch. Licencia Apache-2.0, tamano de repositorio 1,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (XLSR-53): encoder convolucional de extraccion de caracteristicas + encoder Transformer, con cabeza CTC |
| Parametros totales | No disponible en la model card; el repositorio ocupa 1,3 GB, coherente con pesos float32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No fija: los ejes `T` (muestras de audio) y `T'` (tramas) son dinamicos. Limite practico marcado por la memoria disponible y por la ventana receptiva del encoder convolucional |
| Tipos de cuantizacion | Solo float32 (grafo ONNX sin variantes cuantizadas) |
| Idiomas soportados | Multilingue: preentrenamiento XLSR-53 sobre 53 idiomas; salida en fonemas espeak-ng, no en texto. La model card no enumera idiomas concretos |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`wav2vec2_xlsr53_espeak_cv_ft.onnx`), mas `vocab.json` y `wav2vec2_espeak_reference.json` |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec 2.0 en su variante XLSR-53: un encoder convolucional que convierte la onda de audio de 16 kHz en una secuencia de representaciones latentes, seguido de un encoder Transformer que produce estados contextualizados. Sobre ellos se aplica una cabeza lineal de CTC con un vocabulario de 392 unidades (indice 0 reservado para el blank de CTC). El preentrenamiento de XLSR-53 (Conneau et al., 2020) se hizo de forma auto-supervisada sobre habla de 53 idiomas; el afinado posterior (Xu, Baevski y Auli, 2021) usa Common Voice con objetivos CTC y transcripciones convertidas a fonemas espeak-ng, lo que permite reconocimiento fonetico zero-shot en lenguas no vistas durante el ajuste.

La exportacion ONNX no modifica pesos ni arquitectura: carga la revision `2c733782da5604684829819a5eb744c193fe9398` del modelo original con `transformers`, envuelve el modelo para exponer solo los logits y lo exporta con `torch`. El preprocesado queda fuera del grafo: el consumidor debe aportar la onda mono a 16 kHz en float32, normalizarla a media cero y varianza unitaria con `(x - mean) / sqrt(var + 1e-7)` y rellenar con ceros los clips de menos de 400 muestras. La decodificacion es CTC voraz: argmax por trama, fusionar repeticiones, descartar el blank y mapear los indices restantes con `vocab.json`. La validacion de paridad compara el grafo ONNX ejecutado en CPU con la decodificacion voraz del modelo PyTorch en 12 clips: coinciden 170 de 170 fonemas.

## Capacidades

- Reconocimiento de fonemas (phone recognition) sobre audio de entrada, con salida en el alfabeto espeak-ng.
- Transcripcion fonetica multilingue y zero-shot: al compartir inventario fonetico, cubre idiomas no incluidos en el ajuste fino.
- Reconocimiento de voz indirecto: los fonemas pueden post-procesarse con un lexico o un modelo G2P inverso para obtener texto, aunque no es su salida nativa.
- Inferencia en CPU sin dependencias de PyTorch gracias al formato ONNX y a ejes de entrada dinamicos.
- Ejecucion en navegador o dispositivos embebidos mediante ONNX Runtime Web o builds ligeros de ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo acustico-fonetico puro.
- No es un modelo de dialogo ni de generacion de texto; no tiene modo de pensamiento ni capacidades de vision.

## Casos de uso

- Documentacion de lenguas minoritarias: el modelo transcribe audio a fonemas espeak-ng sin necesidad de un sistema de escritura estandarizado, lo que permite registrar y comparar variedades dialectales con un inventario fonetico consistente.
- Evaluacion de pronunciacion en apps de aprendizaje de idiomas: comparando la secuencia de fonemas predicha con la esperada, se pueden detectar sustituciones y omisiones concretas y generar retroalimentacion a nivel de segmento.
- Alineamiento forzado y segmentacion: los logits por trama permiten derivar marcas temporales de cada fonema, utiles para anotacion automatica de corpus y para construir datasets de habla con etiquetas foneticas.
- Preetiquetado de corpus para entrenar sistemas TTS: generar transcripciones foneticas de gran volumen reduce el coste de anotacion manual antes de un ajuste fino supervisado.
- Busqueda por similitud fonetica en archivos de audio: indexar los fonemas predichos permite recuperar fragmentos por como suenan, no por su transcripcion ortografica, util en videotecas y archivos periodisticos.
- Investigacion linguistica comparada: al producir el mismo espacio de etiquetas para 53 idiomas, facilita estudios cuantitativos de inventarios y patrones fonotacticos entre lenguas.
- Interfaces de voz en el borde: por su tamano y su ejecucion en CPU via ONNX Runtime, puede desplegarse en dispositivos sin GPU o en el navegador para reconocimiento de comandos foneticos o deteccion de palabras clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una comprobacion de paridad frente al modelo original en PyTorch:

| Prueba | Resultado |
|---|---|
| Paridad ONNX vs. PyTorch (decodificacion voraz) | 12 de 12 clips identicos, 170 de 170 fonemas coincidentes |
| Entorno de la prueba | ONNX Runtime, CPU |

No hay cifras de PER (phoneme error rate), WER, MMLU ni similares en la documentacion proporcionada.

## Requisitos de hardware

- Peso del grafo: 1,3 GB en float32; el repositorio completo ocupa ese mismo orden de magnitud.
- Memoria necesaria para inferencia: del orden de 1,5 a 2 GB de RAM o VRAM, incluyendo el grafo y los tensores intermedios; no hay cifra oficial publicada.
- CPU: viable. La propia validacion de paridad se ejecuto en ONNX Runtime sobre CPU.
- GPU: cualquier GPU con al menos 2-4 GB de VRAM; no requiere aceleradores de datacenter.
- Consumer GPU: si, cabe con holgura en RTX 3060/4060, RTX 4090 y equivalentes, asi como en GPUs integradas o en placas tipo Raspberry Pi si la memoria lo permite.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web para navegador, backend ONNX de Triton Inference Server, o el propio `transformers` cargando el grafo. La decodificacion CTC debe implementarse aparte.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de unos cientos de millones de parametros sobre ventanas cortas de audio, la latencia escala de forma aproximadamente lineal con la duracion de la entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| TigreGotico/wav2vec2-xlsr-53-espeak-cv-ft-onnx | No disponible | Fonemas espeak-ng | 53 en preentrenamiento | ONNX | Apache-2.0 |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | No disponible | Fonemas espeak-ng | 53 en preentrenamiento | PyTorch / safetensors | Apache-2.0 |
| facebook/wav2vec2-lv-60-espeak-cv-ft | No disponible | Fonemas espeak-ng | Cobertura ampliada respecto a XLSR-53 | PyTorch / safetensors | Apache-2.0 |
| espeak-ng (G2P y sintesis) | No aplica | Fonemas desde texto | Amplio | Binario / libreria | GPL-3.0 |

La diferencia relevante frente al modelo original es exclusivamente el formato de serializacion (ONNX frente a PyTorch) y la ausencia de la dependencia de `transformers`; los pesos y el comportamiento decodificado son los mismos segun la prueba de paridad. No hay datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- Salida fonetica, no textual: requiere un paso adicional (lexico, G2P inverso o modelo de lenguaje) para obtener texto legible.
- Repositorio generado automaticamente por un modelo de lenguaje y no revisado por humanos, segun la propia model card; conviene auditar el grafo y el script de exportacion antes de usarlo en produccion.
- Riesgo de alucinacion acustica: como todo modelo CTC, puede producir secuencias de fonemas plausibles en audio ruidoso, con musica o con habla solapada.
- Sesgos derivados de Common Voice: la composicion del corpus condiciona el rendimiento por variedad dialectal, edad, sexo y calidad de grabacion.
- Limitaciones de idioma: la model card no enumera los idiomas cubiertos ni garantiza el rendimiento en las 53 lenguas del preentrenamiento; el comportamiento zero-shot no esta cuantificado en la documentacion proporcionada.
- Sin gestion de contexto larga documentada: los ejes son dinamicos, pero el consumo de memoria crece con la duracion del audio y no se especifica un maximo recomendado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero si se integra espeak-ng para generar etiquetas o post-procesar, hay que tener en cuenta que espeak-ng se distribuye bajo GPL-3.0.
- Cero adopcion registrada: el repositorio no tiene descargas ni "me gusta" en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TigreGotico/wav2vec2-xlsr-53-espeak-cv-ft-onnx
- Modelo original: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Paper del ajuste fino: Xu, Baevski y Auli, "Simple and Effective Zero-shot Cross-lingual Phoneme Recognition", https://arxiv.org/abs/2109.11680
- Paper de XLSR-53: Conneau et al., "Unsupervised Cross-lingual Representation Learning for Speech Recognition" (2020), https://arxiv.org/abs/2006.13979
- Dataset Common Voice: https://commonvoice.mozilla.org/
- Documentacion de ONNX Runtime: https://onnxruntime.ai/
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
