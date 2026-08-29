# willwade/byt5-p2g-multilingual

## Resumen

El modelo `willwade/byt5-p2g-multilingual` es un sistema de conversión fonema-a-grafema (P2G) basado en la arquitectura ByT5-small de Google, desarrollado por willwade dentro del ecosistema AACTools. Su función es transformar secuencias de fonemas en notación IPA (Alfabeto Fonético Internacional) en palabras escritas, resolviendo el problema de las palabras fuera de vocabulario (OOV) en sistemas de síntesis de voz y accesibilidad.

El modelo opera directamente sobre bytes UTF-8, lo que elimina la necesidad de tokenización previa y le permite manejar cualquier idioma sin preprocesamiento adicional. Con 299,6 millones de parámetros, soporta 136 variedades lingüísticas diferenciadas por dialecto (inglés estadounidense y británico, portugués brasileño y europeo, español de España y Latinoamérica, galés del norte y del sur, armenio oriental y occidental, más de 20 variantes siníticas, entre otras). Fue entrenado sobre un corpus de 3,02 millones de pares fonema-grafema procedentes de WikiPron (CC BY-SA) y gruut (MIT), con muestreo balanceado por idioma.

Su relevancia actual radica en que cubre un hueco específico en los pipelines de text-to-speech: la generación de pronunciaciones para términos desconocidos. Está diseñado como capa neuronal de respaldo (OOV tier) detrás de lexicones FST y modelos WFST de Phonetisaurus, y se distribuye con pesos en formato HuggingFace y ONNX, incluida una variante cuantizada int8 optimizada para CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (transformer encoder-decoder a nivel de byte, sin tokenizador) |
| Parametros totales | 299.637.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base ByT5-small usa 512 tokens) |
| Tipos de cuantizacion | ONNX int8 (75% menor, calidad preservada); pesos originales en safetensors |
| Idiomas soportados | 136 variedades lingüísticas (multilingue, con distinción dialectal) |
| Licencia | CC BY-SA 4.0 (share-alike heredado de WikiPron) |
| Formato de pesos | safetensors, ONNX (encoder+decoder validados), ONNX int8 |

## Arquitectura y entrenamiento

El modelo se basa en ByT5-small, una extensión de mT5 que opera directamente sobre bytes UTF-8 en lugar de usar un vocabulario de subpalabras. Esto elimina cualquier necesidad de preprocesamiento de texto y simplifica el pipeline, manteniendo un rendimiento competitivo con mT5 de tamaño equivalente según la documentación original de Google Research. La arquitectura es un transformer encoder-decoder estándar, con la particularidad de que cada token de entrada corresponde a un byte individual.

El entrenamiento se realizó sobre un corpus de 3,02 millones de pares fonema-grafema, combinando datos de WikiPron (CUNY-CL, licencia CC BY-SA) y gruut (rhasspy, licencia MIT), con preservación de las divisiones dialectales y muestreo balanceado por idioma. El formato de entrada es `<lang>: IPA tokens` (por ejemplo, `<deu>: ʃ aɪ n`) y la salida es la palabra escrita correspondiente (`Schein`). El modelo también maneja pronunciaciones inventadas: la entrada `<eng-US>: m uː` produce `moo`. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un fine-tuning supervisado estándar sobre el modelo base.

## Capacidades

- Conversión fonema-a-grafema (P2G) multilingue: transforma secuencias IPA en palabras escritas en 136 variedades de idiomas, con distinción dialectal explícita.
- Manejo de pronunciaciones fuera de vocabulario: genera grafemas para secuencias fonéticas no vistas durante el entrenamiento.
- Soporte de homófonos: al ser una tarea uno-a-muchos, el modelo puede producir múltiples grafías válidas para una misma pronunciación.
- Integración en pipelines de text-to-speech: diseñado como capa neuronal de respaldo (OOV tier) junto a lexicones FST y modelos WFST de Phonetisaurus.
- Despliegue en CPU mediante ONNX: la variante int8 permite inferencia eficiente sin GPU, con calidad preservada.
- Compatible con la librería transformers de HuggingFace y con text-generation-inference (endpoints compatibles).

## Casos de uso

- Síntesis de voz con cobertura OOV: en un sistema TTS como floravox, el modelo actúa como capa neuronal que genera grafemas para palabras desconocidas que no están en el lexicón FST, evitando fallos de pronunciación en tiempo real.
- Generación de lexicones de pronunciación: permite construir o ampliar diccionarios fonéticos por lotes, procesando listas de transcripciones IPA y obteniendo las grafías correspondientes para cada variedad lingüística.
- Herramientas de accesibilidad para lectura asistida: sistemas de lectura en voz alta para personas con dislexia o discapacidad visual pueden usar el modelo para pronunciar correctamente nombres propios, tecnicismos y neologismos.
- Post-procesado de reconocimiento de voz: en pipelines ASR, el modelo puede convertir salidas fonéticas en texto ortográfico cuando el reconocedor opera a nivel de fonemas.
- Aprendizaje de idiomas asistido por ordenador: aplicaciones educativas que muestran la pronunciación IPA de una palabra pueden usar P2G inverso para verificar la grafía correcta a partir de la transcripción.
- Normalización de texto para TTS multilingue: sistemas que necesitan convertir transcripciones fonéticas de múltiples dialectos (inglés británico vs. estadounidense, portugués de Brasil vs. Portugal) en texto canónico para su posterior síntesis.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a una muestra de prueba estratificada de 4.000 ejemplos:

| Metrica | Valor |
|---|---|
| Micro exact match | 0,533 |
| Macro exact match | 0,582 |
| Token error rate | 0,467 |

El autor señala que la exactitud exacta subestima la calidad real del modelo, dado que la tarea P2G es uno-a-muchos (los homófonos admiten múltiples grafías válidas). Además, indica que la variante tiny (17M de parámetros) iguala el rendimiento de esta versión small (300M) dentro del margen de ruido estadístico, con 1/18 del tamaño. No se han publicado comparaciones con otros modelos P2G en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 2,7 GB; artefactos del modelo: 1,2 GB en formato HuggingFace.
- Variante ONNX int8: aproximadamente un 75% más pequeña, recomendada para inferencia en CPU con calidad preservada.
- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 300M de parámetros, cabe en GPUs de consumo con 8 GB o menos en FP16, y en 4 GB o menos con cuantización int8.
- GPUs compatibles: cualquier GPU moderna con soporte CUDA (RTX 3060, RTX 4090, A100, H100); la variante int8 permite ejecución exclusiva en CPU.
- Opciones de despliegue: transformers (HuggingFace), ONNX Runtime mediante el script de referencia `onnx_reference.py`, compatible con text-generation-inference y endpoints de HuggingFace.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| willwade/byt5-p2g-multilingual (small) | 299,6M | 136 variedades | P2G | CC BY-SA 4.0 | HuggingFace, ONNX |
| willwade/byt5-p2g-multilingual (tiny) | 17M | 136 variedades | P2G | CC BY-SA 4.0 | Repositorio hermano |
| Phonetisaurus WFST | no aplica | por idioma | G2P/P2G | Apache-2.0 | GitHub |
| google/byt5-small (base) | 300M | multilingue | generico | Apache-2.0 | HuggingFace |

La comparativa directa con otros modelos P2G neuronales no está disponible en la información proporcionada. El propio autor señala que la variante tiny iguala el rendimiento de la small, lo que sugiere que para muchos casos de uso la versión de 17M es más eficiente. Phonetisaurus WFST representa la alternativa clásica basada en transductores de estados finitos, que el modelo complementa en lugar de sustituir.

## Limitaciones y advertencias

- La tarea P2G es inherentemente uno-a-muchos: los homófonos admiten múltiples grafías válidas, por lo que la métrica de exact match subestima la calidad real del modelo.
- Licencia CC BY-SA 4.0 con cláusula share-alike: cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede ser restrictivo para integraciones comerciales propietarias.
- El modelo hereda los sesgos y limitaciones de los datos de entrenamiento de WikiPron y gruut, que pueden tener cobertura desigual entre idiomas y dialectos.
- Riesgo de alucinación en pronunciaciones muy alejadas de los patrones del idioma de entrada, especialmente en variedades con pocos datos de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica que es reciente y no ha sido ampliamente validado por la comunidad.
- No se han publicado evaluaciones de sesgo, robustez o rendimiento en producción más allá de la muestra de prueba de 4.000 ejemplos.
- La longitud de contexto no está documentada explícitamente; el modelo base ByT5-small utiliza 512 tokens, lo que limita la longitud de las secuencias IPA procesables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willwade/byt5-p2g-multilingual
- Repositorio de código de entrenamiento: https://github.com/AACTools/voicegarden-lexicons/tree/main/scripts/train_byt5
- Script de referencia ONNX: https://github.com/AACTools/voicegarden-lexicons/blob/main/scripts/train_byt5/onnx_reference.py
- Proyecto floravox (integración principal): https://github.com/AACTools/floravox
- Documentación de ByT5 (Google Research): https://github.com/google-research/byt5
- Documentación de ByT5 en Model Database: https://modeldatabase.com/docs/transformers/model_doc/byt5.html
- Dataset WikiPron (CUNY-CL): https://huggingface.co/datasets/CUNY-CL/wikipron
