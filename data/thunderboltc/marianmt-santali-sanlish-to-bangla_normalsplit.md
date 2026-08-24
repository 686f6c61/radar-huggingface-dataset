# thunderboltc/marianmt-santali-sanlish-to-bangla_normalSplit

## Resumen

Este modelo es un ajuste fino de **Helsinki-NLP/opus-mt-en-mul**, un modelo de traducción automática multilingüe de la familia MarianMT, especializado en la traducción de texto en *sanlish* (transliteración en alfabeto romano del santali) a bengalí. El autor, `thunderboltc`, lo ha entrenado sobre un conjunto de datos no especificado, con el objetivo de facilitar la traducción entre estas dos lenguas de la India. El modelo se publica bajo licencia Apache-2.0 y está pensado para tareas de generación de texto a texto.

La relevancia de este modelo radica en su enfoque en un par de lenguas de bajos recursos, como el santali y el bengalí, y en su uso de una representación intermedia como el *sanlish*. Su arquitectura se basa en el modelo MarianMT, con un total de **77 millones de parámetros**, lo que lo convierte en un modelo compacto, adecuado para entornos con recursos limitados. La ficha técnica indica que el modelo se generó automáticamente a partir de un entrenador de Hugging Face, por lo que la información sobre su uso previsto y limitaciones es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (Transformer encoder-decoder) |
| Parametros totales | 77.026.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Santali (sanlish) y bengali (implícito por la tarea) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **MarianMT**, un transformer encoder-decoder originalmente desarrollado por el equipo de Microsoft Translator. Es un modelo de 6 capas de encoder y 6 de decoder, con 8 cabezas de atención y una dimensión de embedding de 512. El ajuste fino se realizó sobre el modelo base `Helsinki-NLP/opus-mt-en-mul`, que es un modelo multilingüe pre-entrenado para traducción.

El entrenamiento se llevó a cabo con un batch size de 8, una tasa de aprendizaje de 2e-05, un optimizador AdamW y un programador de tasa lineal con calentamiento del 10%. Se emplearon 35 épocas, aunque el mejor resultado en validación se obtuvo en la época 22. Se utilizó precisión mixta nativa (AMP). No se especifica el tamaño del dataset de entrenamiento ni su composición, ni si se aplicaron técnicas como RLHF o DPO. El entrenamiento se realizó con las librerías Transformers 4.46.3, PyTorch 2.11.0 y Datasets 4.0.0.

## Capacidades

- Generación de texto: traducción automática de secuencias de texto de *sanlish* (santali romanizado) a bengalí.
- Basado en un modelo multilingüe pre-entrenado, lo que puede permitir una generalización limitada a otros pares de idiomas, aunque el ajuste específico es para esta tarea.
- No se especifica soporte para *tool calling*, *function calling*, ni capacidades de agente.
- No se mencionan capacidades multimodales (visión, audio) ni *thinking mode*.
- El modelo es de tipo `text2text-generation`, por lo que su uso principal es la traducción.

## Casos de uso

- **Traducción de textos santali a bengalí**: el uso principal del modelo es traducir documentos, noticias o contenido digital de santali (en su representación *sanlish*) al bengalí, facilitando el acceso a información para hablantes de santali.
- **Preservación lingüística**: puede utilizarse en proyectos de digitalización y preservación de la lengua santali, convirtiendo textos históricos o orales a un formato bengalí más ampliamente comprendido.
- **Aplicaciones de traducción en tiempo real**: integrar el modelo en aplicaciones de chat o foros para permitir la comunicación entre hablantes de santali y bengalí.
- **Sistemas de atención al cliente**: en regiones donde se habla santali, el modelo puede usarse en chatbots o sistemas de soporte para traducir consultas de usuarios a bengalí y facilitar la comunicación con agentes que no hablan santali.
- **Subtitulado y localización de contenido**: puede usarse para subtitular vídeos o contenido audiovisual en santali a bengalí, mejorando el acceso a contenido educativo o de entretenimiento.
- **Investigación lingüística**: para estudios de lingüística computacional y procesamiento de lenguas de bajos recursos, el modelo sirve como herramienta para analizar la estructura del santali y su relación con el bengalí.

## Benchmarks y rendimiento

El autor no ha publicado una tabla de resultados con comparativas. Sin embargo, en la model card se declaran los siguientes resultados en el conjunto de evaluación:

- **Eval BLEU**: 11.3284
- **Eval CHRF**: 40.3184
- **Eval METEOR**: 0.3389
- **Eval BERTScore**: 0.8438
- **Eval Loss**: 1.6976

Estos valores se obtuvieron en la época 22 de entrenamiento. No se dispone de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 77 millones de parámetros, la inferencia puede realizarse con una VRAM de aproximadamente 1-2 GB en FP16 (dependiendo del tamaño del lote). En cuantización de 8 bits, la memoria se reduce aún más, pudiendo caber en GPUs de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA T4, RTX 2060, GTX 1660, o incluso CPU son viables para inferencia.
- **Cabe en consumer GPU**: sí, en prácticamente cualquier GPU de consumo moderno, incluso en las de gama de entrada.
- **Opciones de despliegue**: al ser un modelo de Transformers, se puede desplegar con **vLLM**, **Ollama**, **llama.cpp** (si se convierte a GGUF), o con **Transformers** y **PyTorch** directamente. También es compatible con el endpoint de Hugging Face.
- **Latencia y throughput**: no se dispone de datos específicos, pero para un modelo de este tamaño, la latencia en una GPU moderna es de decenas de milisegundos por secuencia, pudiendo procesar cientos de secuencias por segundo en un lote.

## Comparativa con modelos similares

No se dispone de modelos comparables específicamente entrenados para la traducción santali-bengalí. Como alternativa general, se puede comparar con el modelo base `Helsinki-NLP/opus-mt-en-mul`, que es multilingüe y cubre muchos pares de idiomas, pero no está especializado en santali. Otros modelos de traducción neuronal como `NLLB-200` de Meta (1.3B parámetros) también pueden traducir entre lenguas de bajos recursos, pero su tamaño es mucho mayor y no está optimizado para este par específico.

| Modelo | Parametros | Contexto | Rendimiento (BLEU) | Licencia |
|---|---|---|---|---|
| Este modelo (sanlish-bn) | 77M | no disponible | 11.3 (en evaluación) | Apache-2.0 |
| Helsinki-NLP/opus-mt-en-mul | 77M | no disponible | no disponible | Apache-2.0 |
| NLLB-MB-1.3B | 1.3B | 2048 | no disponible | CC-BY-NC |

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de traducción entrenado con datos limitados, puede presentar sesgos o errores de traducción, especialmente en términos técnicos o contextuales.
- **Dependencia del dominio**: el modelo se ha ajustado con un dataset específico, por lo que su rendimiento puede degradarse en dominios fuera de ese conjunto.
- **Idiomas**: solo está entrenado para el par santali (sanlish) a bengalí. No es válido para la traducción inversa (bengalí a santali).
- **Contexto limitado**: la longitud de contexto no se especifica, pero al ser un modelo MarianMT, el contexto máximo suele ser de 512 tokens, lo que limita la traducción de documentos largos.
- **Licencia**: aunque la licencia es Apache-2.0, no se especifica la procedencia de los datos de entrenamiento, lo que puede tener implicaciones legales si se usan datos con derechos de autor.
- **Caveat**: la model card indica que la información sobre usos previstos y limitaciones es "más información necesaria", lo que sugiere que el modelo es experimental y no está listo para producción sin una evaluación adicional.

## Enlaces

- **HuggingFace**: [thunderboltc/marianmt-santali-sanlish-to-bangla_normalSplit](https://huggingface.co/thunderboltc/marianmt-santali-sanlish-to-bangla_normalSplit)
- **Modelo base**: [Helsinki-NLP/opus-mt-en-mul](https://huggingface.co/Helsinki-NLP/opus-mt-en-mul)
- **Página de Marian**: [https://marian-nmt.github.io/](https://marian-nmt.github.io/)
- **Artículo de KDnuggets sobre MarianMT**: [https://www.kdnuggets.com/how-to-translate-languages-with-marianmt-and-hugging-face-transformers](https://www.kdnuggets.com/how-to-translate-languages-with-marianmt-and-hugging-face-transformers)
- **Modelo relacionado**: [thunderboltc/whisper-small-santali-sanlish](https://huggingface.co/thunderboltc/whisper-small-santali-sanlish)
- **Modelo relacionado**: [thunderboltc/marianmt_sanlish_to_bangla_1934_lr2](https://huggingface.co/thunderboltc/marianmt_sanlish_to_bangla_1934_lr2)
