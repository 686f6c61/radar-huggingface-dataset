# tadiecool29/MTL-ethiollm-b-250K-finetuned

## Resumen

MTL-ethiollm-b-250K-finetuned es un modelo de clasificación de texto multilingüe, resultado de un fine-tuning del modelo base EthioNLP/EthioLLM-b-250K sobre un conjunto de datos no publicado. El autor, tadiecool29 (Tadesse), lo ha entrenado con un enfoque de aprendizaje multitarea (multi-task learning) para resolver simultáneamente dos tareas de análisis de sentimiento y detección de postura (stance) en textos. El modelo base pertenece a la familia EthioLLM, desarrollada por el grupo EthioNLP, que cubre cinco lenguas etíopes (amárico, ge'ez, afan oromo, somalí y tigriña) además de inglés.

Con 278 millones de parámetros, el modelo se apoya en la arquitectura XLM-RoBERTa, un transformer encoder-only multilingüe. Su relevancia radica en que aborda tareas de procesamiento del lenguaje natural para lenguas de bajos recursos, un ámbito donde los modelos multilingües generalistas suelen rendir peor. Al estar liberado bajo licencia MIT, puede integrarse en proyectos comerciales sin restricciones de uso.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en el artículo de EthioLLM; no se dispone de datos adicionales sobre el conjunto de entrenamiento ni sobre el rendimiento en benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa base) |
| Parametros totales | 278.049.031 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se infiere 512 tokens por ser XLM-RoBERTa, no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base EthioLLM cubre amárico, ge'ez, afan oromo, somalí, tigriña e inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de EthioNLP/EthioLLM-b-250K, que a su vez es una adaptación de XLM-RoBERTa-base con un vocabulario ampliado (250K tokens) para las lenguas etíopes. La arquitectura es un transformer encoder-only, por lo que no genera texto, sino que produce representaciones contextuales que se utilizan para clasificación. El fine-tuning se realizó con un enfoque multitarea: dos cabezas de clasificación (una para sentimiento y otra para stance) entrenadas conjuntamente sobre el mismo corpus, aunque el dataset concreto no se ha hecho público.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de 16 (entrenamiento) y 32 (evaluación), optimizador AdamW con betas (0.9, 0.999), programador de tasa de aprendizaje coseno con 300 pasos de calentamiento, y 10 épocas. Se utilizó precisión mixta nativa (AMP). No se mencionan técnicas de regularización adicionales ni aumentación de datos. La pérdida final en evaluación fue de 1.7004, con una F1 media de 0.6933.

## Capacidades

- Clasificación de sentimiento (positivo, negativo, neutro) en textos multilingües.
- Detección de postura (stance) hacia un tema o entidad concreta.
- Procesamiento de lenguas etíopes de bajos recursos (amárico, ge'ez, afan oromo, somalí, tigriña) e inglés, según el modelo base.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un encoder-only.
- No dispone de modo de pensamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Analisis de opinion en redes sociales: el modelo puede clasificar tweets o publicaciones en amárico u otras lenguas etíopes para medir la opinion publica sobre temas politicos o sociales, gracias a su entrenamiento en stance y sentimiento.
- Moderacion de contenido: integrado en plataformas que necesitan detectar discursos de odio o posturas extremas, el modelo puede etiquetar automaticamente mensajes problematicos en lenguas locales.
- Investigacion academica en NLP: util para estudios sobre analisis de sentimiento en lenguas de bajos recursos, donde los modelos multilingües generalistas fallan.
- Monitoreo de marca: empresas que operan en Etiopia o paises vecinos pueden analizar reseñas y comentarios de clientes en su idioma local para detectar tendencias de satisfaccion.
- Analisis de debates parlamentarios o foros: la deteccion de stance permite identificar posiciones a favor o en contra de propuestas legislativas en textos de actas o discursos.
- Clasificacion de noticias: el modelo puede etiquetar articulos periodisticos segun su tono (positivo/negativo) y la postura hacia entidades mencionadas, facilitando la curadoria de contenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (el campo model-index de la model card está vacío). El autor declara las siguientes métricas de evaluación sobre su conjunto de validación:

| Metrica | Valor |
|---|---|
| Loss | 1.7004 |
| Stance F1 | 0.7037 |
| Sentiment F1 | 0.6830 |
| F1 (media) | 0.6933 |
| Stance Acc | 0.6933 |
| Sentiment Acc | 0.6858 |

Estos valores corresponden a la última época (10) del entrenamiento. No se dispone de comparaciones con otros modelos en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada: con 278M parámetros, el modelo ocupa aproximadamente 1.1 GB en fp32, 0.6 GB en fp16 y 0.3 GB en int8. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs recomendadas: NVIDIA GTX 1060 6GB o superior, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100.
- Despliegue: compatible con la librería transformers de Hugging Face, así como con ONNX Runtime y TensorRT para inferencia optimizada. No se ha probado con vLLM u Ollama, que están orientados a modelos generativos.
- Latencia: al ser un modelo encoder pequeño, la inferencia es rápida; en una GPU moderna se pueden procesar cientos de ejemplos por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia |
|---|---|---|---|---|
| MTL-ethiollm-b-250K-finetuned (este) | 278M | No disponible | Sentimiento y stance | MIT |
| EthioNLP/EthioLLM-b-250K (base) | 278M | No disponible | Preentrenamiento general | MIT |
| XLM-RoBERTa-base | 278M | 512 tokens | Multilingüe general | MIT |

El modelo base EthioLLM-b-250K es el punto de partida; este fine-tuning añade capacidades específicas de clasificación. XLM-RoBERTa-base es el modelo original del que deriva EthioLLM, pero sin el vocabulario ampliado para lenguas etíopes. No se dispone de otros modelos fine-tuned comparables en la misma categoría.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no se ha publicado, lo que impide evaluar posibles sesgos o la representatividad de las clases.
- Al ser un modelo encoder-only, no puede generar texto; su uso se limita a tareas de clasificación.
- La longitud de contexto no está documentada; si sigue el límite de XLM-RoBERTa, será de 512 tokens, lo que limita el análisis de documentos largos.
- No se han realizado pruebas de robustez frente a ruido, variaciones dialectales o dominios específicos.
- Aunque la licencia MIT permite uso comercial, el autor no ofrece garantías de rendimiento ni soporte técnico.
- Las métricas reportadas provienen de un único split de evaluación y pueden no generalizar a otros conjuntos de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-ethiollm-b-250K-finetuned
- Modelo base EthioLLM-b-250K: https://huggingface.co/EthioNLP/EthioLLM-b-250K
- Paper de EthioLLM (arXiv): https://arxiv.org/abs/2403.13737
- Perfil de GitHub del autor: https://github.com/tadiecool29
