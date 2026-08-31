# stamchry/greek-keyboard-lm

## Resumen

El modelo `stamchry/greek-keyboard-lm` es un modelo de lenguaje causal de tamaño reducido (aproximadamente 36,15 millones de parámetros) desarrollado por stamchry para proporcionar texto predictivo y autocorrección en griego moderno dentro del teclado FUTO Android. Está basado en la arquitectura LlamaForCausalLM con 9 capas, 512 unidades ocultas y 8 cabezas de atención, con embeddings atados. Su diseño está optimizado para ejecutarse en dispositivos móviles, con cuantizaciones ligeras que ocupan entre 37 y 85 MB.

El modelo resuelve el problema de la predicción de palabras y la corrección de erratas en griego, un idioma con acentos y diacríticos que requiere un tratamiento específico. Su relevancia radica en que es un ejemplo de modelo de lenguaje compacto y especializado para una tarea concreta, integrable en un teclado de código abierto, y su licencia Apache 2.0 permite su uso comercial sin restricciones. Incluye tokens de control específicos para el protocolo de autocorrección de FUTO, lo que lo hace directamente utilizable en ese ecosistema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (9 capas, 512 hidden, 1376 intermediate, 8 heads, embeddings atados) |
| Parametros totales | 36.152.832 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (~36,8 MB), Q8_0 (~45,4 MB), F16 (~85 MB) |
| Idiomas soportados | Griego moderno (el) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LlamaForCausalLM, una variante del transformer decoder-only con normalización RMSNorm y atención con máscara causal. Con 9 capas, 512 dimensiones ocultas, 1376 unidades en la capa intermedia y 8 cabezas de atención, es un modelo deliberadamente pequeño para caber en memoria móvil. Los embeddings están atados entre la entrada y la salida, lo que reduce el número de parámetros. El tokenizador es SentencePiece Unigram con un vocabulario de 15.008 tokens y la opción `treat_whitespace_as_suffix=True`, que trata los espacios como sufijos, una elección adecuada para la predicción de palabras en un teclado.

El entrenamiento incluye tokens de control especiales (`<XBU>`, `<XBC>`, `<XEC>`) que implementan el protocolo de autocorrección de FUTO Keyboard. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El repositorio de GitHub indica que el pipeline completo de recopilación de datos y entrenamiento está disponible, aunque la cifra de parámetros mencionada allí (22,8 millones) difiere de la indicada en HuggingFace (36,15 millones), posiblemente por una versión anterior del modelo.

## Capacidades

- Predicción de siguiente palabra (next-word prediction) en griego moderno, con precisión Top-1 del 39,33 % y Top-10 del 64,48 %.
- Autocorrección de erratas sintéticas, con una precisión del 37,40 %.
- Restauración de acentos y diacríticos griegos, con una precisión del 38,60 %.
- Integración nativa con FUTO Keyboard mediante tokens de control específicos.
- Generación de texto causal estándar, aunque su tamaño limita la coherencia en textos largos.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Texto predictivo en teclado móvil: el modelo se integra en FUTO Keyboard para sugerir la siguiente palabra mientras el usuario escribe en griego, aprovechando su bajo consumo de memoria y su tokenizador adaptado a espacios como sufijos.
- Autocorrección en tiempo real: corrige erratas comunes al escribir en griego, incluyendo errores de acentuación, directamente en el flujo de entrada del teclado.
- Restauración de acentos: útil para usuarios que escriben sin diacríticos y necesitan que el sistema los añada automáticamente, una funcionalidad crítica en griego.
- Asistencia de escritura para personas con dificultades de ortografía: el modelo puede sugerir formas correctas de palabras con acentos, mejorando la calidad del texto final.
- Investigación en modelos de lenguaje compactos: sirve como referencia para estudiar el rendimiento de modelos de ~36M parámetros en tareas de predicción de palabras para idiomas con morfología rica.
- Despliegue en entornos embebidos: su tamaño reducido permite ejecutarlo en dispositivos con recursos limitados, no solo móviles, sino también en sistemas de bajo consumo.

## Benchmarks y rendimiento

La model card publica los siguientes resultados, obtenidos presumiblemente sobre un conjunto de evaluación propio:

| Metrica | Resultado |
|---|---|
| Next-Word Top-1 Accuracy | 39,33 % |
| Next-Word Top-3 Accuracy | 53,06 % |
| Next-Word Top-10 Accuracy | 64,48 % |
| Accent Restoration Accuracy | 38,60 % |
| Synthetic Typo Autocorrect | 37,40 % |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores deben interpretarse en el contexto de un modelo de 36M parámetros especializado en una tarea de teclado, no como métricas de razonamiento general.

## Requisitos de hardware

- VRAM estimada: el modelo en F16 ocupa aproximadamente 85 MB, en Q8_0 unos 45 MB y en Q6_K unos 37 MB. Cabe en cualquier smartphone moderno sin necesidad de GPU dedicada.
- GPU recomendadas: ninguna; la inferencia se puede ejecutar en CPU de forma eficiente. En servidores, cualquier GPU con más de 1 GB de VRAM sería suficiente, aunque no es necesaria.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1650 o superior) puede ejecutarlo sin problemas.
- Opciones de despliegue: en Android mediante FUTO Keyboard (importando el archivo GGUF), o en servidor con llama.cpp, Ollama o cualquier runtime compatible con GGUF. También se puede usar con safetensors a través de Hugging Face Transformers.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño, la latencia en CPU móvil debería ser de pocos milisegundos por token.

## Comparativa con modelos similares

No se han encontrado modelos comparables específicamente diseñados para texto predictivo en griego para teclados. Los modelos generales pequeños como TinyLlama (1,1B) o SmolLM (135M) son mucho más grandes y no están especializados en esta tarea, por lo que no son directamente comparables. La comparativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- El modelo es extremadamente pequeño (36M parámetros), por lo que su capacidad de generación de texto libre es limitada y puede producir incoherencias en contextos largos.
- Está entrenado exclusivamente para griego moderno; no soporta otros idiomas.
- Depende del protocolo de FUTO Keyboard para su uso completo; fuera de ese ecosistema, los tokens de control no tienen significado.
- La discrepancia entre los 22,8M parámetros mencionados en el repositorio de GitHub y los 36,15M de HuggingFace sugiere que puede haber versiones diferentes; conviene verificar qué archivo se descarga.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no se puede evaluar la presencia de sesgos o la calidad de los datos.
- Las métricas de precisión (Top-1 del 39 %) son modestas en comparación con modelos más grandes, aunque adecuadas para la tarea de teclado.
- No se ha documentado el rendimiento en producción ni la latencia real en dispositivos Android.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stamchry/greek-keyboard-lm
- Repositorio de entrenamiento: https://github.com/stamchry/greek-keyboard-lm
- Fork del teclado FUTO con soporte griego: https://github.com/stamchry/android-keyboard
