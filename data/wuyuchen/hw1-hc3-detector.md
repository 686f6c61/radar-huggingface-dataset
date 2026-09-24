# wuyuchen/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario encoder-only publicado por el usuario wuyuchen en HuggingFace, pensado para distinguir texto escrito por personas de texto generado por ChatGPT. Se trata de un fine-tuning de sentence-transformers/all-MiniLM-L6-v2 sobre el corpus Hello-SimpleAI/HC3, con 22.713.986 parametros (~22,7 M) y un repositorio de solo 0,1 GB, lo que lo situa en la categoria de detectores de bajo coste computacional.

El modelo declara una accuracy de test de 0.9869 frente a una baseline de 0.8449 sobre HC3, una mejora de 14,2 puntos porcentuales. Su interes practico radica en que puede ejecutarse en CPU o en cualquier GPU de consumo con un consumo de memoria inferior a 1 GB, lo que permite filtrar grandes volumenes de texto sin infraestructura dedicada.

Ahora bien, se trata de un artefacto experimental: acumula 6 descargas y 1 like, no tiene pipeline declarado, la model card se limita a dos lineas de metricas y el nombre ("hw1") sugiere un ejercicio academico. Antes de usarlo en produccion conviene validar su comportamiento fuera del dominio de HC3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6): 6 capas, dimension oculta 384, 12 cabezas de atencion (heredado del modelo base; no detallado en la model card) |
| Parametros totales | 22.713.986 (~22,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada por el autor; el modelo base all-MiniLM-L6-v2 admite secuencias de hasta 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (sin campo languages; la particion principal de HC3 esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea declarada | no disponible (sin pipeline en los metadatos de HuggingFace) |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 |
| Metrica declarada | accuracy |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 6 / 1 |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-09-24 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de all-MiniLM-L6-v2: un transformer encoder de tipo BERT con 6 capas, dimension oculta 384 y 12 cabezas de atencion, que suman 22,7 M de parametros. Sobre ese backbone se anade una cabeza de clasificacion de secuencia (el numero de etiquetas no se especifica en la model card; dado que HC3 enfrenta texto humano contra texto de ChatGPT, lo razonable es asumir clasificacion binaria). El modelo base original se entreno con objetivos de similitud de frases sobre pares de oraciones, de modo que este fine-tuning reaprovecha representaciones ya condensadas y semanticamente ricas.

En cuanto al entrenamiento, la unica informacion disponible es que se hizo fine-tuning supervisado sobre Hello-SimpleAI/HC3 y que se midio accuracy de test. No hay datos sobre numero de tokens vistos, composicion exacta del split, hiperparametros, epocas, estrategia de pooling, ni sobre tecnicas de alineamiento tipo RLHF, DPO o decodificacion especulativa (ninguna de ellas aplica a un clasificador encoder-only). Tampoco se documenta si se congelaron capas del backbone ni si se aplico alguna forma de regularizacion o data augmentation.

## Capacidades

- Clasificacion de texto humano frente a texto generado por ChatGPT: es la unica funcionalidad documentada explicitamente en la model card.
- Salida de una puntuacion de confianza por clase (comportamiento esperado de una cabeza de clasificacion, aunque no se especifica el numero de etiquetas).
- Inferencia muy ligera: 22,7 M de parametros permiten ejecucion en CPU con latencia de milisegundos por muestra corta.
- Procesamiento por lotes de grandes volumenes de texto, al caber el modelo completo en menos de 100 MB en fp32.
- Reutilizacion de embeddings del modelo base, lo que facilita su integracion en pipelines que ya usan sentence-transformers.
- Generacion de texto: no. Es un encoder-only sin decoder.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no declaradas ni verificadas.
- Modo thinking, vision o audio: no disponibles.
- Razonamiento, matematicas o codigo: no aplica a la tarea del modelo.

## Casos de uso

- Filtrado previo en pipelines de curacion de datos: antes de entrenar un LLM con un corpus web, este detector puede marcar documentos sospechosos de haber sido generados por ChatGPT para revisarlos o descartarlos, con un coste de computo minimo.
- Revision de integridad academica: instituciones educativas pueden integrarlo como primera senal en la revision de trabajos, tratando la salida como indicio y no como prueba concluyente.
- Moderacion de contenido en foros y plataformas: deteccion de publicaciones generadas automaticamente para spam o manipulacion de opinion, ejecutable en CPU junto al backend web.
- Control de calidad en plataformas de contenido freelance: verificacion de que las entregas no son texto sintetico sin declarar, con revision humana de los casos marcados.
- Analisis retrospectivo de corpus: estudio de como ha evolucionado la proporcion de texto generado por IA en un archivo historico de articulos o comentarios.
- Deteccion a gran escala sobre millones de documentos: gracias a su tamano (~91 MB en fp32, ~23 MB en int8), puede desplegarse en varias replicas por servidor y procesar lotes muy grandes.
- Componente auxiliar en un ensemble: combinado con detectores basados en modelos mayores (RoBERTa, DeBERTa) para votar o calibrar la decision final.
- Endpoint de bajo coste para herramientas de terceros: API de clasificacion con memoria inferior a 1 GB, desplegable en instancias pequenas o incluso en funciones serverless.

## Benchmarks y rendimiento

| Metrica | Baseline | Fine-tuned |
|---|---|---|
| Accuracy (test, HC3) | 0.8449 | 0.9869 |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K, F1, precision/recall por clase, AUC) ni el tamano del conjunto de test empleado, ni evaluaciones fuera de dominio (por ejemplo, texto generado por GPT-4, Claude o Llama). Tampoco hay comparaciones con otros detectores bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precision. Aproximadamente 91 MB en fp32, 45 MB en fp16 y 23 MB en int8 para los pesos, mas el overhead de activaciones y del framework.
- GPU recomendadas: cualquier GPU moderna sirve; no se necesita ni A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GTX 1650 son mas que suficientes. El modelo es viable tambien en iGPU.
- Cabe en GPU de consumo: si, en todas las GPU de consumo actuales y en la mayoria de las integradas.
- Ejecucion en CPU: totalmente viable, es probablemente el escenario de despliegue mas razonable.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), ONNX Runtime, FastEmbed, Infinity, Text Embeddings Inference adaptado a clasificacion, contenedores ligeros tipo FastAPI. vLLM y llama.cpp estan orientados a modelos generativos, por lo que no son la via natural para este clasificador; llama.cpp no soporta arquitecturas encoder-only de clasificacion de forma estandar.
- Latencia y throughput: no disponibles. No se han publicado mediciones por parte del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wuyuchen/hw1-hc3-detector | 22,7 M | no disponible (base: 256 tokens) | 0.9869 en HC3 | Apache 2.0 | HuggingFace, 6 descargas |
| Hello-SimpleAI/chatgpt-detector-roberta | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| roberta-base-openai-detector (OpenAI) | ~125 M (arquitectura RoBERTa-base) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de resultados comparativos verificados entre estos detectores bajo un mismo protocolo de evaluacion, por lo que la comparacion cuantitativa queda como no disponible. Como referencia cualitativa, los detectores basados en RoBERTa multiplican por cinco o mas el numero de parametros y el coste de inferencia, mientras que este modelo apuesta por la eficiencia extrema a costa de una capacidad de representacion menor.

## Limitaciones y advertencias

- Sesgo de dominio y de epoca: HC3 se construyo comparando textos humanos con respuestas de ChatGPT (generacion GPT-3.5). El detector puede degradarse frente a texto de modelos mas recientes o de otras familias (Claude, Gemini, Llama).
- Riesgo elevado de falsos positivos con escritores no nativos de ingles, textos muy formularios, plantillas o lenguaje tecnico repetitivo, un problema bien documentado en la literatura de deteccion de IA.
- Alucinacion no aplica directamente (no genera texto), pero si existe el riesgo de sobreconfianza: no hay evidencia de calibracion de probabilidades ni de umbrales recomendados.
- Limitacion de contexto: el backbone all-MiniLM-L6-v2 trabaja con secuencias de hasta 256 tokens, por lo que documentos largos deben truncarse o dividirse, con perdida de senal.
- Idiomas: no declarados. Si el modelo se entreno solo con la particion inglesa de HC3, su uso en castellano no esta respaldado por ninguna evaluacion.
- Licencia: Apache 2.0 permite uso comercial del modelo, pero el dataset HC3 tiene sus propias condiciones de uso que hay que respetar si se redistribuye o se reentrena.
- Validacion insuficiente: 6 descargas y 1 like implican que practicamente nadie ha reproducido las metricas. La model card no incluye tamano de test, splits, hiperparametros ni ejemplos.
- Sin pipeline declarado en HuggingFace: hay que determinar manualmente la configuracion de inferencia (numero de etiquetas, mapeo de clases, pooling).
- Uso en produccion con consecuencias sobre personas (evaluacion academica, contratacion, moderacion) requiere revision humana obligatoria; presentar la salida como veredicto automatico es inaceptable dado el nivel de documentacion.
- Nombre y contexto ("hw1") sugieren un trabajo de clase; conviene tratar el modelo como prueba de concepto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wuyuchen/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper de HC3 ("How Close is ChatGPT to Human Experts? Comparison Corpus, Evaluation, and Detection"): https://arxiv.org/abs/2301.07597
- Repositorio de Sentence-Transformers: https://github.com/UKPLab/sentence-transformers
