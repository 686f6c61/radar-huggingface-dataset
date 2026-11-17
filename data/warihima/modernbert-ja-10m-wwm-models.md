# WariHima/modernbert-ja-10m-wwm-models

## Resumen

`WariHima/modernbert-ja-10m-wwm-models` es un repositorio que agrupa varios modelos de la familia ModernBERT en japonés, todos ellos derivados de un mismo modelo base preentrenado con enmascaramiento de tokens completos (whole word masking, WWM) y un presupuesto de entrenamiento de aproximadamente 10 millones de parámetros (de ahí el sufijo "10m"). El autor, WariHima, publica en este único repositorio los pesos base y tres cabezas de tarea ajustadas: clasificación de sentimiento en tres clases, reconocimiento de entidades nombradas (NER) en japonés y un modelo de asignación de lectura (yomikata) para palabras homógrafas.

El modelo se apoya en la arquitectura ModernBERT, una variante de encoder transformer con atención rotatoria (RoPE), activaciones GeGLU, normalización previa y atención alterna local/global, diseñada para ofrecer un encoder eficiente y moderno frente a BERT clásico. El contexto nativo de ModernBERT es de 8192 tokens, aunque la model card no confirma explícitamente que esta variante de 10M conserve esa longitud; el dato debe tratarse como no verificado.

La relevancia de este lanzamiento es doble. Por un lado, ofrece encoders japoneses extremadamente pequeños (~10M de parámetros), adecuados para despliegue en CPU, dispositivos de borde o entornos con presupuesto de memoria mínimo. Por otro, ejemplifica el patrón de publicar un modelo base más varias cabezas de tarea en un mismo repositorio, lo que facilita la reutilización. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con RoPE, GeGLU y atención local/global alterna) |
| Parametros totales | ~10 millones (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ModernBERT soporta hasta 8192 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de encoder presentada por Answer.AI y LightOn en 2024 que moderniza el transformer bidireccional clásico mediante rotatory position embeddings (RoPE), activaciones GeGLU en lugar de GeLU, normalización previa sin sesgo en las capas lineales y un patrón de atención que alterna capas con atención local (ventana deslizante) y capas con atención global. Esta combinación reduce el coste computacional en secuencias largas y mejora el rendimiento frente a BERT-base en tareas de comprensión.

El preentrenamiento declarado es de tipo masked language modeling con whole word masking (WWM), una técnica que enmascara tokens completos en lugar de subtokens individuales, lo que resulta especialmente útil en japonés, donde un mismo carácter puede formar parte de palabras compuestas. La model card no especifica el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste fino adicionales como DPO o RLHF (no aplicables, en cualquier caso, a un encoder de este tipo). Tampoco se detalla el proceso de destilación o recorte que habría reducido el modelo a ~10M de parámetros desde un ModernBERT estándar.

Las tres cabezas de tarea publicadas son: `modernbert_wwm_10m_sentiment_3class` (clasificación de sentimiento en tres clases), `modernbert_wwm_10m_ner` (extracción de entidades nombradas en japonés) y `modernbert_wwm_10m_sentiment_yomikata` (asignación de lectura a palabras homógrafas). La model card remite a cada subcarpeta para la descripción detallada de cada cabeza, pero no incluye esos detalles en el texto disponible.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, negativo y presumiblemente neutro) en texto japonés.
- Reconocimiento de entidades nombradas (NER) en japonés: identificación de personas, organizaciones, lugares y otras categorías según el esquema de etiquetado del autor (no detallado).
- Asignación de lectura (yomikata) a palabras homógrafas japonesas, es decir, desambiguación de la pronunciación de kanji según el contexto.
- Extracción de representaciones contextuales de tokens y frases en japonés, reutilizables para otras tareas downstream mediante ajuste fino.
- Capacidad de enmascaramiento y relleno de tokens (masked language modeling) heredada del preentrenamiento.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; se trata de un encoder, no de un modelo generativo.
- Capacidad multilingüe limitada al japonés según el campo `language` de la model card.

## Casos de uso

- Análisis de opiniones en reseñas de productos o comercio electrónico en japonés: la cabeza de sentimiento de tres clases permite clasificar cada reseña en positiva, negativa o neutra con un coste de inferencia mínimo, adecuado para procesar grandes volúmenes en CPU.
- Moderación de comentarios en foros y redes sociales japonesas: la clasificación de sentimiento puede alimentar un filtro previo que derive los mensajes negativos a revisión humana, reduciendo la carga del equipo de moderación.
- Extracción de entidades en documentos empresariales japoneses: la cabeza NER permite poblar bases de datos de contactos, proveedores o ubicaciones a partir de correos, contratos y actas, con un modelo lo bastante pequeño para ejecutarse en el backend de una aplicación web estándar.
- Normalización de texto para pipelines de texto-a-voz (TTS) en japonés: el modelo de yomikata resuelve la lectura correcta de homógrafos, un paso crítico para que un sintetizador pronuncie correctamente palabras como "生" según su contexto.
- Indexación y búsqueda semántica en japonés: las representaciones del encoder base pueden alimentar un motor de búsqueda vectorial o un sistema de recuperación aumentada (RAG) sobre documentación interna, con la ventaja de que el modelo cabe holgadamente en memoria.
- Clasificación de tickets de soporte en japonés: ajustando una cabeza lineal sobre el encoder base se puede enrutar automáticamente cada incidencia a la categoría o equipo correspondiente, con un coste de entrenamiento muy bajo.
- Despliegue en dispositivos de borde o entornos con recursos limitados: con ~10M de parámetros, el modelo puede ejecutarse en navegador (vía Transformers.js o WebAssembly) o en microcontroladores con cuantización agresiva, algo inviable para encoders de cientos de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 40 MB para los pesos (~10M parámetros × 4 bytes), más el overhead de activaciones y del runtime.
- VRAM estimada en fp16: aproximadamente 20 MB para los pesos; en int8, alrededor de 10 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo está pensado para ejecutarse en CPU sin problema. Una RTX 4090 o A100 no aportan ventaja significativa frente a una GPU de gama baja para este tamaño.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y también en CPU y en navegador.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime, Transformers.js para navegador, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de ~10M de parámetros se espera un throughput de miles de secuencias por segundo en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| WariHima/modernbert-ja-10m-wwm-models | ~10M | no disponible | ja | Apache 2.0 | safetensors |
| tohoku-nlp/bert-base-japanese | ~110M | 512 | ja | Apache 2.0 | safetensors / PyTorch |
| cl-tohoku/bert-base-japanese-whole-word-masking | ~110M | 512 | ja | Apache 2.0 | PyTorch |
| sbintuitions/modernbert-ja-130m | ~130M | 8192 | ja | Apache 2.0 | safetensors |

La comparativa se limita a parámetros, contexto, idioma y licencia, ya que no hay datos de rendimiento publicados para este modelo. Frente a los BERT japoneses clásicos de Tohoku NLP (~110M parámetros), este modelo es un orden de magnitud más pequeño, lo que reduce drásticamente los requisitos de memoria a costa de una capacidad de representación presumiblemente menor. Frente a `sbintuitions/modernbert-ja-130m`, el modelo de WariHima es también aproximadamente trece veces más pequeño. La ventaja principal es el despliegue en entornos extremadamente limitados; la desventaja, la falta de benchmarks que permitan cuantificar la pérdida de calidad.

## Limitaciones y advertencias

- El tamaño de ~10M de parámetros implica una capacidad de representación muy limitada; es probable que el rendimiento en tareas complejas de NER o desambiguación semántica sea inferior al de encoders japoneses de 110M o más, aunque no hay datos que lo confirmen.
- La model card no documenta el corpus de entrenamiento, el número de tokens, el esquema de etiquetado del NER ni las métricas de evaluación de cada cabeza, lo que dificulta evaluar su idoneidad para producción.
- No se confirma la longitud de contexto efectiva; si la variante de 10M no conserva los 8192 tokens de ModernBERT, el uso en documentos largos requerirá truncamiento o segmentación.
- El modelo solo está entrenado para japonés; su uso con texto en otros idiomas producirá resultados degradados.
- Riesgo de sesgos presentes en el corpus de preentrenamiento, no documentados por el autor.
- Riesgo de alucinación no aplicable en sentido estricto (es un encoder, no genera texto), pero sí de clasificaciones erróneas con alta confianza en dominios alejados de los datos de entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de documentación sobre el origen de los datos de entrenamiento impide verificar el cumplimiento de derechos de autor o de protección de datos en determinados contextos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WariHima/modernbert-ja-10m-wwm-models
- Modelo base citado en la model card: `modernbert_wwm_10m_mlm` (ruta interna del repositorio, sin URL independiente disponible)
- Cabeza de sentimiento: `modernbert_wwm_10m_sentiment_3class` (ruta interna del repositorio)
- Cabeza NER: `modernbert_wwm_10m_ner` (ruta interna del repositorio)
- Cabeza de yomikata: `modernbert_wwm_10m_sentiment_yomikata` (ruta interna del repositorio)
- Paper de ModernBERT (referencia de arquitectura, no enlazado en la model card): no disponible en la información proporcionada
