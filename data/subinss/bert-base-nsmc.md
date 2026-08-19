# subinss/bert-base-nsmc

## Resumen

El modelo `subinss/bert-base-nsmc` es un checkpoint de la arquitectura BERT-base (110 millones de parámetros) publicado en Hugging Face por el usuario subinss. El nombre sugiere que se trata de un ajuste fino (fine-tuning) de un BERT-base sobre el corpus NSMC (Naver Sentiment Movie Corpus), un conjunto de datos coreano de reseñas de películas etiquetadas como positivas o negativas, muy utilizado para tareas de clasificación de sentimientos en coreano. El pipeline declarado es `text-classification`, lo que refuerza esa hipótesis.

Sin embargo, la model card publicada es una plantilla genérica generada automáticamente, sin información sobre el conjunto de datos de entrenamiento, el procedimiento de ajuste, los resultados de evaluación ni la licencia. El repositorio contiene únicamente los pesos en formato `safetensors` (0,4 GB), sin documentación adicional. A pesar de la escasez de datos, el modelo puede ser útil como punto de partida para clasificación de sentimientos en coreano, aunque se recomienda validar su rendimiento antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (Transformer encoder, 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) |
| Parametros totales | 110.618.882 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (típico de BERT-base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (presumiblemente coreano, por el nombre NSMC, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base original, un encoder Transformer bidireccional con 12 capas, 768 unidades ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros. Fue preentrenado con objetivos de enmascarado de lenguaje (MLM) y predicción de siguiente oración (NSP) sobre corpus generales, y posteriormente ajustado para clasificación de secuencias. El nombre `nsmc` indica un fine-tuning sobre el corpus Naver Sentiment Movie, un dataset coreano de reseñas de películas con etiquetas binarias (positivo/negativo), aunque la model card no confirma el dataset exacto ni los hiperparámetros de entrenamiento.

No se dispone de información sobre el procedimiento de entrenamiento (épocas, tasa de aprendizaje, estrategia de regularización) ni sobre el conjunto de datos de preentrenamiento base (posiblemente `klue/bert-base`, pero no verificado). Tampoco se documenta el uso de técnicas como RLHF, DPO o decodificación especulativa, que no son habituales en modelos de esta familia.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo está diseñado para asignar una etiqueta a una secuencia completa (p. ej., positivo/negativo).
- Análisis de sentimiento: por el nombre del corpus NSMC, se espera que clasifique reseñas coreanas en positivo o negativo, aunque no hay confirmación explícita en la model card.
- Procesamiento de lenguaje natural en coreano: si el fine-tuning se realizó sobre NSMC, el modelo está adaptado al coreano, pero no se especifican los idiomas soportados.
- No se documentan capacidades de tool calling, generación de código, razonamiento multi-paso, visión ni audio, dado que es un modelo encoder puro de clasificación.

## Casos de uso

- Clasificación de reseñas de películas en coreano: el modelo puede asignar una etiqueta positiva o negativa a críticas cinematográficas, útil para plataformas de streaming o agregadores de reseñas que operen en coreano. Se usaría cargando el modelo con la librería `transformers` y aplicando `pipeline("text-classification")`.
- Moderación de comentarios en foros coreanos: al clasificar automáticamente el tono de los comentarios (positivo/negativo), se puede priorizar la revisión de mensajes negativos o abusivos. Requiere adaptar el umbral de decisión según la precisión deseada.
- Análisis de opinión en redes sociales: para campañas de marketing o estudios de mercado en coreano, el modelo puede procesar tweets o publicaciones cortas y extraer la polaridad. Su contexto de 512 tokens es suficiente para textos breves.
- Filtrado de feedback de clientes: en plataformas de comercio electrónico coreanas, el modelo puede clasificar valoraciones de productos como positivas o negativas, ayudando a identificar problemas recurrentes de calidad o servicio.
- Investigación académica en PLN coreano: como punto de partida para experimentos de clasificación de sentimientos, el modelo permite comparar arquitecturas o técnicas de fine-tuning sobre el corpus NSMC. Su tamaño moderado facilita la reproducción en entornos con recursos limitados.
- Prototipado rápido de sistemas de análisis de sentimiento: al estar disponible en Hugging Face con formato `safetensors`, se puede integrar en pipelines de `transformers` o en herramientas como `text-embeddings-inference` para generar prototipos funcionales en pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y el repositorio no contiene logs de entrenamiento ni comparativas con otros modelos. Se desconoce la exactitud, F1 o cualquier otra métrica sobre NSMC u otros conjuntos de datos.

## Requisitos de hardware

- VRAM estimada: un modelo BERT-base con 110 millones de parámetros en precisión fp32 ocupa aproximadamente 440 MB de memoria. En fp16 se reduce a ~220 MB. Con cuantización int8, ~110 MB. La inferencia para clasificación de secuencias cortas requiere menos de 1 GB de VRAM en la mayoría de los casos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (p. ej., NVIDIA GTX 1050 Ti, RTX 2060). Para fine-tuning se recomienda una GPU con 6-8 GB (p. ej., RTX 3060, RTX 2070) si se usa batch pequeño y fp16.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU moderna de consumo. Incluso en CPU se puede ejecutar con latencias aceptables para textos cortos.
- Opciones de despliegue: compatible con `transformers` (pipeline de clasificación), `text-embeddings-inference`, `ONNX Runtime` (si se exporta) y `TensorRT`. No se han publicado archivos GGUF, por lo que no es directamente compatible con `llama.cpp` u `Ollama`.
- Latencia y throughput: no disponible. Para un BERT-base en GPU moderna, se puede esperar una latencia de unos pocos milisegundos por secuencia corta, pero no hay datos medidos para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| subinss/bert-base-nsmc | 110 M | 512 (típico) | Clasificación de sentimiento coreano | no disponible | Hugging Face (safetensors) |
| SEUNGHUN12/bert-base-nsmc | ~110 M | 512 (típico) | Clasificación de sentimiento coreano | no disponible | Hugging Face |
| klue/bert-base | ~110 M | 512 | Modelo base coreano (preentrenamiento) | MIT | Hugging Face |

No se dispone de resultados de evaluación para comparar el rendimiento de estos modelos entre sí. `klue/bert-base` es el modelo base más común para coreano y suele utilizarse como punto de partida para fine-tuning en NSMC, pero no hay confirmación de que `subinss/bert-base-nsmc` derive de él.

## Limitaciones y advertencias

- La model card está incompleta: no se especifican el dataset de entrenamiento, los hiperparámetros, las métricas de evaluación ni la licencia. Esto impide verificar la calidad del modelo y sus condiciones de uso.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, pero puede producir etiquetas incorrectas si el texto de entrada está fuera de la distribución de entrenamiento (p. ej., reseñas de otros dominios distintos de películas).
- Sesgos potenciales: el corpus NSMC contiene reseñas de películas coreanas, por lo que el modelo puede estar sesgado hacia el lenguaje informal, jerga cinematográfica y opiniones de un público específico. No se han documentado evaluaciones de sesgo.
- Limitaciones de idioma: no se confirma que el modelo funcione correctamente en otros idiomas distintos del coreano. Su uso en inglés u otros idiomas probablemente degrade el rendimiento.
- Restricciones de licencia: al no estar especificada la licencia, no se puede garantizar el uso comercial. Se recomienda contactar al autor antes de utilizarlo en productos comerciales.
- Contexto limitado: con 512 tokens, no es adecuado para documentos largos ni para tareas que requieran contexto extenso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/subinss/bert-base-nsmc
- Modelo similar (SEUNGHUN12/bert-base-nsmc): https://huggingface.co/SEUNGHUN12/bert-base-nsmc
- Documentación de BERT (paper original): https://arxiv.org/abs/1810.04805
- Repositorio oficial de BERT (Google Research): https://github.com/google-research/bert
- Artículo de Wikipedia sobre BERT: https://en.wikipedia.org/wiki/BERT_(language_model)
