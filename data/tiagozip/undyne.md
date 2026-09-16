# tiagozip/undyne

## Resumen

undyne es un modelo de 13.483.779 parámetros especializado en resaltar (highlighting) la respuesta a una pregunta dentro de un párrafo. Lo desarrolla el usuario tiagozip y se publica en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo: es un clasificador de tokens que devuelve desplazamientos de caracteres (offsets) sobre el texto de entrada, de modo que la respuesta siempre procede literalmente del párrafo original. Si no se le proporciona pregunta, el modelo identifica y resalta las afirmaciones centrales del texto.

Técnicamente deriva de google/electra-small-discriminator mediante destilación, conserva la arquitectura de encoder transformer tipo ELECTRA en su variante discriminadora y añade una cabeza de token-classification para etiquetar los tramos relevantes. El repositorio ocupa 0,1 GB e incluye pesos en safetensors y una versión ONNX cuantizada a int8 de 14 MB que, según la model card, coincide con fp32 en el 98,6 % de las etiquetas de token y es aproximadamente el doble de rápida.

Su relevancia práctica está en tareas de extracción de evidencia y atribución: por su tamaño (13,5 M de parámetros) puede ejecutarse en CPU, en dispositivos móviles o en cualquier GPU de gama baja con un consumo de memoria inferior a 1 GB, lo que lo hace apto para pipelines de resaltado de respuestas a gran escala. Está entrenado únicamente en inglés y sobre prosa explicativa, lo que acota estrictamente su dominio de aplicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ELECTRA (variante discriminadora), con cabeza de token-classification para etiquetado de spans |
| Parametros totales | 13.483.779 |
| Longitud de contexto | 512 tokens (heredada de la arquitectura ELECTRA-small; no se explicita en la model card) |
| Tipos de cuantizacion | fp32 (pesos originales en safetensors) e int8 (versión ONNX de 14 MB); no se documentan otras |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |
| Modelo base | google/electra-small-discriminator |
| Tarea (pipeline) | token-classification |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-16 |

## Arquitectura y entrenamiento

undyne es un encoder transformer denso derivado de google/electra-small-discriminator. ELECTRA-small emplea el esquema de entrenamiento «replaced token detection»: un generador pequeño produce tokens falsos y el discriminador (del que desciende este modelo) aprende a distinguir, para cada posición, si el token es original o sustituido. Esa representación densa por token es la que se reutiliza aquí, sustituyendo la cabeza de discriminación binaria por una cabeza de clasificación de secuencias orientada a delimitar spans de respuesta. El modelo no emplea mezcla de expertos ni mecanismos de atención lineal o decodificación especulativa, y al no ser generativo no se beneficia de técnicas de muestreo ni de decodificación.

Los datos de entrenamiento son etiquetas de spans recopiladas de varias fuentes: texto de artículos de Encyclopaedia Britannica, Wikipedia, datos sintéticos y SQuAD v1.1 (CC BY-SA 4.0, Rajpurkar et al., 2016). La model card no indica el número total de tokens vistos ni si hubo fases de ajuste fino adicionales, RLHF o DPO. La etiqueta «distillation» del repositorio sugiere un proceso de destilación desde un modelo mayor, pero no se detalla el profesor utilizado ni el procedimiento. La innovación destacable es la publicación simultánea de una versión ONNX int8 de 14 MB con un 98,6 % de coincidencia de etiquetas respecto a fp32 y el doble de velocidad, además del modo «sin pregunta», que degrada la tarea a detección de afirmaciones centrales del párrafo.

## Capacidades

- Extracción de spans de respuesta: dada una pregunta y un párrafo, devuelve los offsets de caracteres del fragmento que responde (método `spans`).
- Resaltado en Markdown: envuelve los tramos detectados con `** **` y devuelve el párrafo listo para mostrar (método `highlight`).
- Detección de afirmaciones centrales sin pregunta: si se invoca `highlight` únicamente con el párrafo, identifica y resalta la tesis o claim principal.
- API de offsets por carácter, no por token: los resultados son directamente utilizables en interfaces de texto.
- Ejecución en dos backends: Transformers (PyTorch) y ONNX Runtime con pesos int8.
- Capacidades multilingües: no. Solo inglés; la model card indica que puede funcionar «aceptablemente» en francés y español pese a no haber sido entrenado en esos idiomas.
- Tool calling / function calling: no disponible; el modelo no es generativo.
- Agentes y razonamiento multi-paso: no disponible.
- Visión, audio o modo de razonamiento explícito: no disponibles.

## Casos de uso

- Extracción de evidencia en sistemas RAG: tras recuperar pasajes con un buscador vectorial, undyne señala el fragmento exacto que responde a la consulta del usuario. El offset devuelto permite citar la fuente de forma verificable y evita que un LLM generativo invente la respuesta, ya que el span procede literalmente del documento.
- Resaltado de respuestas en interfaces de búsqueda interna: en un buscador corporativo sobre documentación en inglés, el modelo devuelve el pasaje con las palabras clave marcadas, reduciendo el tiempo de lectura del empleado. Su tamaño (13,5 M de parámetros, 14 MB en int8) permite desplegarlo en el mismo servidor de la aplicación sin GPU.
- Preetiquetado de datasets para QA extractivo: generar etiquetas de span sobre corpus nuevos (Wikipedia, manuales, documentación técnica) para después revisarlas o usarlas directamente en el entrenamiento de un modelo mayor, reduciendo el coste de anotación manual.
- Destilación y evaluación de modelos grandes: usar los spans de undyne como referencia aproximada para medir la calidad de atribución de un LLM en tareas de pregunta-respuesta sobre contexto, o para construir un clasificador extractivo ligero que sustituya a un modelo generativo en producción a menor coste.
- Resaltado de la tesis central en agregadores de contenido: integrado en un lector RSS o un lector de artículos, llama a `highlight` sin pregunta para marcar la afirmación principal del texto. Aplicable a boletines, notas de prensa y entradas enciclopédicas en inglés.
- Asistencia a la lectura en accesibilidad: en un lector de pantalla o una app de lectura fácil, resaltar el fragmento relevante ayuda a usuarios con dificultades de atención o comprensión a localizar la información clave dentro de un párrafo largo.
- Verificación de citas en fact-checking: dado un extracto citado y el artículo original en inglés, el modelo señala la zona del texto que respalda la afirmación, sirviendo como primer filtro en un pipeline de comprobación de hechos.
- Etiquetado ligero en el borde (edge): con 14 MB en int8, puede ejecutarse en navegador, móvil o Raspberry Pi para subrayar respuestas en contenidos precargados sin enviar texto a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, SQuAD (EM/F1) ni HumanEval en la model card. El único dato cuantitativo aportado por el autor es la coincidencia entre la versión int8 y fp32:

| Metrica | Valor |
|---|---|
| Coincidencia de etiquetas de token int8 vs fp32 | 98,6 % |
| Velocidad int8 vs fp32 | aproximadamente 2 veces mas rapida |
| Tamaño de la version ONNX int8 | 14 MB |
| Resultados en SQuAD, MMLU u otros benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión. Los pesos suponen aproximadamente 54 MB en fp32 (13,48 M × 4 bytes), unos 27 MB en fp16 y 14 MB en int8, según el propio autor. Con activaciones y runtime, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: ninguna en particular; el modelo es viable en cualquier GPU, incluidas integradas (Intel Iris/UHD), NVIDIA GTX 1050, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y en la mayoría de iGPU. También funciona en CPU.
- Opciones de despliegue: Transformers con PyTorch, ONNX Runtime (recomendado por el autor en su variante int8), y servicios HTTP ligeros (FastAPI, Triton con backend ONNX). vLLM y TGI no aplican al no ser un modelo generativo; llama.cpp/Ollama requerirían una conversión a GGUF que no está documentada.
- Latencia y throughput: no disponibles. Únicamente se indica que la versión int8 es aproximadamente el doble de rápida que fp32, sin cifras absolutas.
- Contexto de memoria: el límite práctico es la longitud de secuencia (512 tokens), no la memoria.

## Comparativa con modelos similares

La información proporcionada no incluye resultados comparativos con terceros, por lo que la mayoría de celdas quedan sin datos.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| tiagozip/undyne | 13,48 M | 512 tokens (heredado) | Resaltado de respuestas y claims (token-classification) | Apache 2.0 | Modelo de referencia |
| google/electra-small-discriminator | no disponible en la informacion proporcionada | no disponible | Deteccion de tokens sustituidos (preentrenamiento) | Apache 2.0 | Modelo base del que deriva undyne |
| Modelos extractivos de QA tipo DistilBERT/DeBERTa ajustados en SQuAD | no disponible | no disponible | Question answering extractivo | no disponible | No se aportan cifras comparativas |
| Modelos generativos pequenos usados para resaltado | no disponible | no disponible | Generacion de texto | no disponible | No se aportan cifras comparativas |

Diferencias cualitativas conocidas: frente a un modelo extractivo de QA convencional, undyne no devuelve una cadena de respuesta sino offsets de caracteres sobre el párrafo, admite el modo sin pregunta para detectar claims centrales y publica pesos ONNX int8 de 14 MB. Frente a un modelo generativo, garantiza que la salida existe literalmente en el texto de entrada.

## Limitaciones y advertencias

- Idioma: entrenado exclusivamente en inglés. La model card advierte de que el rendimiento en francés o español es solo «aceptable» en el mejor de los casos y nunca fue entrenado para ello; no debe usarse en producción en otros idiomas.
- Dominio: entrenado sobre prosa explicativa (entradas enciclopédicas, respuestas estilo asistente, párrafos de Wikipedia). Degrada en código fuente, tablas densas y poesía.
- Alucinación: riesgo bajo por diseño, ya que los spans devueltos son offsets sobre el texto de entrada y no texto generado. El error posible es de etiquetado (resaltar un tramo incorrecto, incompleto o vacío), no de invención de contenido.
- Sesgos: no se documenta ningún análisis de sesgo. Al entrenarse con Encyclopaedia Britannica, Wikipedia y SQuAD, hereda la distribución temática y de estilo de esas fuentes, predominantemente enciclopédica y en inglés.
- Límite de contexto: la arquitectura base impone una ventana de 512 tokens, insuficiente para documentos largos; requiere trocear el texto y gestionar la agregación de spans entre fragmentos.
- Procedencia de datos y licencias: las etiquetas de entrenamiento incluyen SQuAD v1.1, distribuido bajo CC BY-SA 4.0, mientras que el modelo se publica como Apache 2.0. Conviene revisar la compatibilidad de licencias antes de un uso comercial, especialmente si se redistribuye el modelo o se entrena con él.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados ni validación externa. No se recomienda adoptarlo en producción sin una evaluación propia sobre el dominio objetivo.
- Uso en producción: la API depende de un módulo auxiliar (`example.py`) proporcionado por el autor; no se documentan versiones, tests ni mantenimiento.
- Enlaces de la búsqueda web: los resultados devueltos no guardan relación con el modelo (tratan sobre Winnfield, Luisiana), por lo que no se incluyen como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiagozip/undyne
- Modelo base: https://huggingface.co/google/electra-small-discriminator
- Banner del repositorio: https://raw.githubusercontent.com/gist/tiagozip/97059a8531487a75c470a8396dcb0e05/raw/cf0096dee53f8e2a75466271dc5227bf670ff138/banner.svg
- Script de uso de referencia: `example.py`, incluido en el repositorio de HuggingFace
- Paper citado en la model card (SQuAD v1.1, Rajpurkar et al., 2016): https://arxiv.org/abs/1606.05250
- Resultados de la búsqueda web: sin enlaces relevantes para este modelo
