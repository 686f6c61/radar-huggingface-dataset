# tadiecool29/MTL-ethiollm-base-stance-sentiment

## Resumen

El modelo `MTL-ethiollm-base-stance-sentiment` es un ajuste fino (fine-tuning) del modelo multilingüe EthioLLM-b-250K, desarrollado por el usuario tadiecool29. Está diseñado para realizar dos tareas de clasificación de texto simultáneamente: detección de postura (stance) y análisis de sentimiento, orientado a lenguas etíopes (amárico, ge'ez, afan oromo, somalí y tigriña) además de inglés. El modelo base EthioLLM, presentado en el paper "EthioLLM: Multilingual Large Language Models for Ethiopian Languages", se construye sobre arquitecturas XLM-R y mT5, y este ajuste concreto utiliza la variante base con 278 millones de parámetros.

La relevancia de este modelo radica en que cubre un nicho lingüístico poco atendido: las lenguas etíopes, que usan sistemas de escritura diversos (silabario ge'ez, alfabeto latino, etc.). Al ser un modelo de encoder (no generativo), es ligero y adecuado para tareas de clasificación en producción con requisitos de hardware modestos. La licencia MIT permite uso comercial sin restricciones, lo que facilita su adopción en aplicaciones empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en XLM-R) |
| Parametros totales | 278.049.031 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (se asume 512 tokens, típico de XLM-R) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32/FP16) |
| Idiomas soportados | amárico, ge'ez, afan oromo, somalí, tigriña e inglés (según el modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base EthioLLM-b-250K se construye sobre la arquitectura XLM-R (Cross-lingual Language Model - RoBERTa), un transformer encoder con atención bidireccional. Según el paper de EthioLLM, se utilizaron variantes de XLM-R y mT5 en tamaños large, base y small; la variante "b-250K" corresponde a la versión base con un vocabulario ampliado a 250.000 tokens para cubrir mejor los sistemas de escritura etíopes. El ajuste fino se realizó sobre un dataset no especificado en la model card (indicado como "None dataset"), con hiperparámetros: learning rate 1e-5, batch size 16, 6 épocas, optimizador AdamW, scheduler cosine con 300 pasos de warmup y precisión mixta nativa. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado estándar para clasificación multi-etiqueta.

## Capacidades

- Clasificación de postura (stance) en textos: identifica si un texto está a favor, en contra o neutral respecto a un tema.
- Análisis de sentimiento: clasifica la polaridad (positivo, negativo, neutral) del texto.
- Multilingüe: soporta cinco lenguas etíopes y inglés, lo que permite procesar contenido en contextos multilingües de la región.
- Modelo de encoder: adecuado para tareas de clasificación y extracción de características, no para generación de texto.
- No soporta tool calling ni razonamiento multi-paso, al ser un modelo discriminativo.

## Casos de uso

- Monitorización de redes sociales en lenguas etíopes: el modelo puede analizar publicaciones en amárico u oromo para detectar sentimiento hacia marcas o productos, ayudando a empresas a medir su reputación en la región.
- Análisis de opinión política: permite clasificar la postura de ciudadanos en debates parlamentarios o foros públicos, útil para encuestadoras y analistas políticos.
- Moderación de contenido: puede identificar mensajes con sentimiento negativo o posturas extremas en plataformas de comunicación, facilitando la moderación automática.
- Investigación académica en NLP multilingüe: sirve como punto de partida para estudios sobre sentimiento y stance en lenguas de bajos recursos, dado su tamaño manejable y licencia abierta.
- Sistemas de atención al cliente: integrado en chatbots o sistemas de tickets, puede clasificar la satisfacción del cliente a partir de mensajes en lenguas locales.
- Análisis de noticias y medios: permite a agencias de noticias clasificar la cobertura mediática sobre temas específicos (postura editorial) y el tono emocional de los artículos.

## Benchmarks y rendimiento

La model card no incluye resultados en benchmarks estándar (MMLU, HumanEval, etc.), pero sí reporta métricas de evaluación en el conjunto de validación del propio entrenamiento. Se presentan a continuación:

| Metrica | Valor |
|---|---|
| Loss (validación) | 1.6326 |
| Stance F1 | 0.6951 |
| Sentiment F1 | 0.6576 |
| F1 (promedio) | 0.6764 |
| Stance Accuracy | 0.6883 |
| Sentiment Accuracy | 0.6608 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 278M parámetros, en FP16 ocupa ~556 MB; en FP32 ~1.1 GB. Inferencia en CPU es viable, pero en GPU se recomienda al menos 2 GB de VRAM para batch razonable.
- GPU recomendadas: cualquier GPU con 4 GB o más (GTX 1650, RTX 3060, etc.) es suficiente. También funciona en GPUs de datacenter como T4 o A10.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como ONNX Runtime, TensorRT o TorchServe. También es compatible con vLLM (aunque no es óptimo para encoders) y con librerías como FastAPI para API propia.
- Latencia: para un batch de 1, en GPU T4 se espera una latencia de ~5-10 ms por secuencia de 128 tokens, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de stance/sentiment específicos para lenguas etíopes en la información proporcionada. Como referencia, el modelo base EthioLLM se compara en el paper con XLM-R y mT5 originales, pero no hay datos de este ajuste concreto frente a alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que impide conocer la distribución de temas, dominios o posibles sesgos.
- Las métricas reportadas provienen de un único conjunto de validación y pueden no generalizar a otros dominios o registros lingüísticos.
- Al ser un modelo de encoder, no genera texto; solo produce clasificaciones. No es adecuado para tareas generativas.
- La longitud de contexto no se indica explícitamente; si se hereda de XLM-R, es de 512 tokens, lo que limita el análisis de documentos largos.
- Aunque la licencia MIT permite uso comercial, el modelo base EthioLLM puede tener restricciones adicionales; se recomienda verificar la licencia del modelo base.
- Riesgo de alucinación no aplica (no genera texto), pero sí puede haber errores de clasificación, especialmente en lenguas con pocos datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-ethiollm-base-stance-sentiment
- Modelo base EthioLLM-b-250K: https://huggingface.co/EthioNLP/EthioLLM-b-250K
- Paper de EthioLLM (arXiv): https://arxiv.org/abs/2403.13737
- Paper en ACL Anthology: https://aclanthology.org/2024.lrec-main.561/
- Página de publicaciones de EthioNLP: https://ethionlp.github.io/publications.html
