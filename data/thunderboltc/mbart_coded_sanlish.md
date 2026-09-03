# thunderboltc/mbart_coded_sanlish

## Resumen

El modelo `thunderboltc/mbart_coded_sanlish` es un ajuste fino (fine-tuning) de `facebook/mbart-large-50-many-to-many-mmt` orientado a la traducción de un sistema de escritura romanizada del santali, denominado en el proyecto como "coded Sanlish", hacia bengalí (Bangla). Forma parte de un pipeline de tesis que busca convertir habla santali en texto bengalí, empleando una representación intermedia en alfabeto latino. El modelo está desarrollado por el usuario thunderboltc y se distribuye bajo licencia Apache 2.0.

Con aproximadamente 611 millones de parámetros, el modelo conserva la arquitectura encoder-decoder de mBART-50, pero se ha especializado en el par de lenguas concreto (Sanlish codificado → bengalí). El repositorio indica que el entrenamiento estaba en progreso en el momento de la publicación, por lo que los pesos pueden reflejar un estado intermedio. Es relevante para investigadores que trabajan con lenguas minoritarias de la India, especialmente el santali, y necesitan un traductor automático de texto romanizado a bengalí.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-50) |
| Parametros totales | 611.129.542 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp16 según el entrenamiento) |
| Idiomas soportados | bengalí (bn) como destino; fuente: "coded Sanlish" (etiquetado como en_XX) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura mBART-50, un transformer encoder-decoder preentrenado con un objetivo de denoising sobre 50 idiomas. El fine-tuning se realiza sobre un conjunto de datos propio que mapea oraciones en "coded Sanlish" (una romanización del santali etiquetada como `en_XX` para aprovechar el tokenizador de mBART) hacia texto en bengalí (etiquetado como `bn_IN`). Los argumentos de entrenamiento indican un aprendizaje supervisado con `predict_with_generate=True`, lo que sugiere optimización directa de la traducción mediante generación autoregresiva.

El entrenamiento utilizó una tasa de aprendizaje de 0.0003, decay de peso 0.01, warmup ratio 0.1, batch de 8 por dispositivo con acumulación de gradientes de 2 (batch efectivo de 16 por paso), y 8 épocas con fp16. Se seleccionó el mejor modelo según la pérdida de evaluación. No se menciona el uso de RLHF ni DPO; es un ajuste fino estándar de traducción. Tampoco se detalla el tamaño del dataset ni el número de tokens de entrenamiento.

## Capacidades

- Traducción automática de texto en "coded Sanlish" (santali romanizado) a bengalí.
- Generación de texto de longitud variable mediante decodificación autoregresiva.
- Capacidad de manejar secuencias de entrada en alfabeto latino gracias al etiquetado `en_XX`.
- Soporte de batch processing para traducción de documentos o corpora.
- Integración con el ecosistema Hugging Face Transformers (pipeline de traducción).
- No se han documentado capacidades de tool calling, agentes, visión ni razonamiento multi-paso; es un modelo puramente de traducción.

## Casos de uso

- Transcripción de habla santali a texto bengalí: el modelo se integra en un pipeline donde un sistema de reconocimiento de voz convierte audio santali en texto romanizado (coded Sanlish) y este modelo lo traduce a bengalí para su posterior procesamiento.
- Traducción de documentos administrativos o educativos en santali romanizado a bengalí, facilitando el acceso a servicios públicos en regiones tribales de la India.
- Creación de subtítulos o contenido digital en bengalí a partir de guiones en santali romanizado para plataformas de vídeo.
- Normalización de corpus lingüísticos: investigadores pueden usar el modelo para convertir corpus santali en alfabeto latino a bengalí estándar, facilitando estudios comparativos.
- Desarrollo de asistentes de traducción para traductores humanos que trabajan con lenguas minoritarias, ofreciendo una primera pasada automática que luego se revisa.
- Evaluación de la calidad de la romanización del santali: al comparar la salida del modelo con traducciones humanas, se puede medir la consistencia del esquema de codificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como BLEU, METEOR o chrF, ni comparaciones con otros modelos de traducción. El estado del entrenamiento ("training in progress") sugiere que los resultados finales aún no están consolidados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 611M parámetros en fp16, los pesos ocupan aproximadamente 1,2 GB. Con la memoria de activaciones y el espacio para el beam search, se recomienda al menos 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM o superior (por ejemplo, NVIDIA RTX 3060, RTX 4060, T4, V100) puede ejecutar el modelo cómodamente. Para entrenamiento o fine-tuning adicional se necesitarían GPUs con 16-24 GB (A10, A100, RTX 4090).
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 (12 GB) o RTX 4070 (12 GB) se puede inferir sin problemas.
- Opciones de despliegue: compatible con Hugging Face Transformers, así como con servidores de inferencia como vLLM o TGI (aunque al ser un modelo encoder-decoder, la compatibilidad con vLLM puede requerir versiones recientes). También se puede exportar a ONNX para optimización.
- Latencia y throughput estimados: no se dispone de datos medidos. En una GPU T4, una traducción de una frase corta (20-30 tokens) tardaría típicamente entre 100 y 300 ms con beam size 4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| `thunderboltc/mbart_coded_sanlish` | 611M | no disponible | Sanlish→Bengalí | Apache 2.0 | Traducción especializada |
| `facebook/mbart-large-50-many-to-many-mmt` | 611M | 1024 tokens (típico) | 50 idiomas, incluye bengalí | MIT | Traducción multilingüe general |
| `google/ul2` (similar en tamaño) | 20B (no comparable) | 512 | multilingüe | Apache 2.0 | Generación y traducción |

No se ha encontrado información sobre modelos directamente comparables para el par Sanlish→Bengalí. El modelo base mBART-50 puede traducir bengalí desde y hacia otros idiomas, pero no está entrenado específicamente para santali romanizado. Otros modelos como IndicTrans2 o NLLB-200 podrían cubrir lenguas indias, pero no se dispone de datos de comparación con este ajuste fino.

## Limitaciones y advertencias

- El modelo se encuentra en estado "training in progress" según la model card, por lo que los pesos publicados pueden no representar el rendimiento final y podrían contener artefactos de un entrenamiento incompleto.
- No hay datos sobre el tamaño ni la calidad del dataset de entrenamiento, lo que impide evaluar posibles sesgos o lagunas de cobertura.
- El sistema de "coded Sanlish" es una convención propia del proyecto; el modelo solo funcionará si la entrada sigue exactamente ese esquema de romanización, que no está documentado en el repositorio.
- La salida se limita a bengalí estándar; no soporta otros idiomas ni dialectos bengalíes regionales.
- Riesgo de alucinación en traducciones de frases poco representadas en el entrenamiento, especialmente con términos técnicos o culturales santali.
- No se han realizado evaluaciones de sesgo o toxicidad; al ser un modelo de traducción, podría perpetuar estereotipos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se basa en mBART-50 (licencia MIT), sin restricciones adicionales conocidas.
- No hay garantías de soporte técnico ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thunderboltc/mbart_coded_sanlish
- Modelo base: https://huggingface.co/facebook/mbart-large-50-many-to-many-mmt
- Documentación de mBART en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/mbart.md
- Modelo relacionado (posible versión anterior): https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla
