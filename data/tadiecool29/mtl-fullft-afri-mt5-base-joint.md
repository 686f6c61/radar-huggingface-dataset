# tadiecool29/MTL-FullFT-afri-mt5-base-joint

## Resumen

MTL-FullFT-afri-mt5-base-joint es un ajuste fino completo (full fine-tuning) del modelo multilingue masakhane/afri-mt5-base, publicado por el usuario tadiecool29 en HuggingFace. Se trata de un modelo encoder-decoder de tipo mT5 orientado a tareas de clasificacion de texto en formato text2text-generation, concretamente deteccion de postura (stance detection) y analisis de sentimiento (sentiment analysis), entrenadas de forma conjunta bajo un esquema multi-tarea (MTL, multi-task learning). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un experimento de investigacion sin adopcion comunitaria documentada.

El modelo cuenta con 582.401.280 parametros totales segun los pesos en safetensors, lo que lo situa en la escala "base" de la familia T5/mT5. El entrenamiento se realizo durante 10 epocas con un total de 1.890 pasos, con un learning rate de 3e-4, batch efectivo de 32 (16 x 2 de acumulacion de gradientes), scheduler coseno con 300 pasos de calentamiento y label smoothing de 0,1. En la evaluacion final alcanza un Exact Match de 0,5648, una precision de sentimiento de 0,7132 (F1 macro 0,7195) y una precision de postura de 0,7057 (F1 macro 0,6985), con un F1 macro promedio de 0,7090.

Su relevancia es limitada y acotada al ambito de la investigacion sobre multilingueismo de bajos recursos: afri-mt5 es una familia derivada de mT5 adaptada a lenguas africanas, y este checkpoint explora si el ajuste completo conjunto de dos tareas de analisis de opinion (postura y sentimiento) mejora respecto al entrenamiento por tareas separadas. La model card no documenta el dataset de entrenamiento ni la composicion del corpus, lo que dificulta la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia mT5, T5 v1.1 con relative position bias) |
| Parametros totales | 582.401.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura mT5 del modelo base emplea 512 tokens de posicion maxima |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados en el repositorio; al ser safetensors en fp32, admite cuantizacion dinamica a int8/fp16 mediante bibliotecas estandar |
| Idiomas soportados | amharico (etiqueta del repositorio); cobertura multilingue completa del modelo base no documentada en la model card |
| Licencia | afl-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-base: un transformer encoder-decoder con atencion completa, normalizacion pre-LN, embeddings de posicion relativos (T5 bias) y vocabulario SentencePiece compartido entre encoder y decoder. El modelo base, masakhane/afri-mt5-base, es una adaptacion de mT5 orientada a lenguas africanas. Todas las tareas se formulan como generacion de texto condicionada (text2text-generation), de modo que las etiquetas de sentimiento y de postura se producen como secuencias de texto en lugar de mediante una cabeza de clasificacion sobre el token [CLS].

El ajuste fue completo (no se congelaron capas ni se uso LoRA), durante 10 epocas y 1.890 pasos, con optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), learning rate 3e-4 con scheduler coseno y 300 pasos de calentamiento, batch de 16 con 2 pasos de acumulacion (batch efectivo 32) y label smoothing de 0,1. La model card no especifica el dataset de entrenamiento ("unknown dataset"), ni su tamano, composicion, idioma de los ejemplos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.). El entrenamiento es conjunto (joint): una unica tanda de pasos optimiza simultaneamente las dos tareas, sin cabezas separadas.

## Capacidades

- Generacion de texto condicionada (text2text): produce la etiqueta o respuesta como texto libre a partir de una instruccion/prompt de entrada.
- Deteccion de postura (stance detection): clasifica la postura frente a un objetivo o tema; precision de 0,7057 y F1 macro de 0,6985 en el conjunto de evaluacion.
- Analisis de sentimiento: clasificacion de polaridad; precision de 0,7132 y F1 macro de 0,7195 en el conjunto de evaluacion.
- Aprendizaje multi-tarea conjunto: un unico checkpoint atiende ambas tareas, con un F1 macro promedio de 0,7090.
- Generacion con coincidencia exacta: obtiene un Exact Match de 0,5648, lo que sugiere que una parte de las tareas exige reproduccion literal de una etiqueta normalizada.
- Capacidad multilingue heredada del modelo base afri-mt5, orientada a lenguas africanas; la model card no desglosa el rendimiento por idioma.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente o razonamiento multi-paso: no soportado ni documentado.
- Modo "thinking", vision o audio: no soportado ni documentado.

## Casos de uso

- Monitorizacion de opinion en redes sociales en amharico: el modelo puede clasificar la postura de publicaciones breves frente a un tema o entidad concreta, aprovechando su entrenamiento especifico en stance detection y su adaptacion a lenguas africanas.
- Moderacion de comentarios y deteccion de toxicidad indirecta mediante polaridad: la tarea de sentimiento permite etiquetar comentarios como positivos, negativos o neutros como primera fase de un pipeline de moderacion asistida.
- Analisis de encuestas abiertas: procesar respuestas de texto libre en amharico y extraer automaticamente la polaridad y la postura respecto a una politica o producto, reduciendo el trabajo de codificacion manual.
- Investigacion academica en PLN de bajos recursos: servir como linea base reproducible para comparar estrategias de aprendizaje multi-tarea (joint frente a entrenamiento secuencial o por tarea) en lenguas africanas de bajos recursos.
- Enriquecimiento de paneles de analitica de producto: clasificar resenas y tickets de soporte en amharico para alimentar cuadros de mando con metricas de sentimiento agregadas por periodo y segmento.
- Seguimiento de discurso politico o electoral: medir la postura de textos periodisticos o de usuarios respecto a candidatos o propuestas, siempre con supervision humana dado el nivel de F1 (~0,70).
- Filtrado previo en pipelines de anotacion: usar el modelo como preanotador en herramientas de etiquetado humano (por ejemplo, con Label Studio) para priorizar los ejemplos de mayor valor informativo.
- Extraccion de senal en tiempo casi real: con 582 M de parametros el modelo se puede servir en una unica GPU de gama media, lo que permite clasificacion por lotes a bajo coste en comparacion con modelos generativos de mayor tamano.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion (epoca 10, 1.890 pasos). No se han publicado comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 1,7328 |
| Exact Match | 0,5648 |
| Sentiment Accuracy | 0,7132 |
| Sentiment Macro F1 | 0,7195 |
| Stance Accuracy | 0,7057 |
| Stance Macro F1 | 0,6985 |
| Avg Macro F1 | 0,7090 |

Evolucion por epoca (extracto de la model card):

| Epoca | Paso | Validation Loss | Exact Match | Sentiment Macro F1 | Stance Macro F1 | Avg Macro F1 |
|---|---|---|---|---|---|---|
| 1 | 189 | 2,1818 | 0,1559 | 0,1485 | 0,1599 | 0,1542 |
| 3 | 567 | 1,7570 | 0,5125 | 0,6519 | 0,6608 | 0,6563 |
| 5 | 945 | 1,7326 | 0,5511 | 0,6911 | 0,6876 | 0,6893 |
| 7 | 1323 | 1,7304 | 0,5599 | 0,7190 | 0,6958 | 0,7074 |
| 8 | 1512 | 1,7304 | 0,5623 | 0,7224 | 0,6970 | 0,7097 |
| 10 | 1890 | 1,7328 | 0,5648 | 0,7195 | 0,6985 | 0,7090 |

No se dispone de resultados en benchmarks estandar tipo MMLU, HumanEval o GSM8K, ni comparativas con otros sistemas. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 2,4 GB solo de pesos, mas activaciones; en la practica entre 3 y 4 GB segun longitud de secuencia y tamano de lote.
- VRAM para inferencia en fp16/bf16: aproximadamente 1,3 GB de pesos; entre 2 y 3 GB en total.
- VRAM para inferencia en int8 (cuantizacion dinamica): aproximadamente 0,7-1 GB de pesos.
- Fine-tuning completo: con AdamW en fp32 se necesitan alrededor de 9-10 GB solo para pesos, gradientes y estados del optimizador, mas activaciones; se recomienda un minimo de 16-24 GB de VRAM. El propio autor uso un entorno con PyTorch 2.11.0+cu128 y batch efectivo de 32.
- GPU recomendadas para inferencia: cualquier GPU consumer con 6 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Si cabe en GPU consumer sin problemas.
- GPU recomendadas para reentrenamiento completo: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB con batch reducido y gradient checkpointing.
- Opciones de despliegue: transformers (PyTorch) como via principal; TGI (Text Generation Inference) para servicio HTTP; ONNX Runtime y CTranslate2 para inferencia optimizada en CPU/GPU; vLLM presenta soporte limitado para arquitecturas encoder-decoder T5. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion manual.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo mT5-base (582 M de parametros) en una GPU moderna suele procesar del orden de decenas a cientos de secuencias cortas por segundo por lote, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas de rendimiento con otros modelos. La tabla siguiente compara unicamente caracteristicas estructurales y de licencia de alternativas de la misma categoria (encoder-decoder multilingue de escala base o encoder multilingue):

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tadiecool29/MTL-FullFT-afri-mt5-base-joint | 582 M | no disponible (arquitectura mT5: 512) | Stance + sentiment conjuntos | afl-3.0 | HuggingFace, 0 descargas |
| masakhane/afri-mt5-base | ~580 M (familia mT5-base) | 512 (mT5) | Modelo base multilingue africano | no verificada en esta busqueda | HuggingFace, mantenido por Masakhane |
| google/mt5-base | 582 M | 512 (ampliable con posiciones relativas) | Modelo base multilingue general | Apache 2.0 | HuggingFace, ampliamente adoptado |

No hay datos publicados para comparar el rendimiento de este checkpoint frente a alternativas en las mismas tareas. No disponible.

## Limitaciones y advertencias

- La model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento: no se documenta el dataset, su origen ni su composicion, lo que impide evaluar sesgos y cobertura.
- El dataset de entrenamiento figura como "unknown dataset"; no es posible auditar la representatividad linguistica ni el equilibrio de clases.
- Rendimiento moderado: F1 macro promedio de 0,7090 y Exact Match de 0,5648. No es adecuado para decisiones automaticas sin supervision humana.
- Riesgo de alucinacion y de etiquetas inventadas: al formular las tareas como generacion de texto libre, el modelo puede producir respuestas fuera del conjunto de etiquetas validas. Se recomienda restringir la decodificacion o validar la salida contra un vocabulario cerrado.
- Sobreajuste probable: la loss de validacion se estanca desde la epoca 5 (1,7326) y no mejora en las epocas 6-10, mientras el Exact Match sigue subiendo ligeramente; la seleccion de checkpoint deberia hacerse con criterio explicito.
- Cobertura idiomatica incierta: solo el amharico aparece etiquetado; la model card no detalla el resto de lenguas cubiertas por afri-mt5 ni el rendimiento por idioma.
- Longitud de contexto limitada si se confirma el maximo de 512 tokens de mT5: no apto para documentos largos sin troceado previo.
- Licencia AFL-3.0: es una licencia permisiva que permite uso comercial, pero impone obligaciones de atribucion y de inclusion de la licencia. Ademas, al ser un modelo derivado, el uso debe respetar las condiciones del modelo base masakhane/afri-mt5-base y, en ultima instancia, de google/mt5-base.
- Versionado de dependencias: la model card reporta Transformers 5.16.1 y PyTorch 2.11.0+cu128; conviene verificar compatibilidad con versiones estables mas recientes o anteriores antes de desplegar.
- Adopcion nula (0 descargas, 0 likes) y creado/actualizado en septiembre de 2026: no existe validacion independiente de los resultados reportados.
- La busqueda web realizada no devolvio documentacion tecnica, papers ni demos asociadas al modelo; los resultados obtenidos no guardan relacion con el mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/MTL-FullFT-afri-mt5-base-joint
- Modelo base: https://huggingface.co/masakhane/afri-mt5-base
- Arquitectura de referencia mT5 (google/mt5-base): https://huggingface.co/google/mt5-base
- Paper de mT5 (Xue et al., 2020): https://arxiv.org/abs/2010.11934
- Paper de T5 (Raffel et al., 2019): https://arxiv.org/abs/1910.10683
- Organizacion Masakhane en HuggingFace: https://huggingface.co/masakhane
- No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este checkpoint en la busqueda web realizada.
