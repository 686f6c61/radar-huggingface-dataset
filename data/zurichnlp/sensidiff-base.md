# ZurichNLP/sensidiff-base

## Resumen

Sensidiff-base es un modelo encoder especializado en la predicción de puntuaciones de diferencia semántica a nivel de token entre pares de textos. Lo desarrolla el grupo ZurichNLP y se distribuye bajo licencia MIT. No es un modelo generativo: se trata de un `AutoModelForTokenClassification` que, dado un par de secuencias (A y B), devuelve para cada token de la segunda secuencia una puntuación sigmoide entre 0 y 1 que indica en qué medida ese token difiere respecto a su alineación con el primer texto. Es, por tanto, una herramienta de análisis y anotación, no un asistente conversacional.

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder multilingüe de la familia ModernBERT, y se afina sobre el dataset `jvamvas/sensidiff-wikimatrix`, formado por pares de Wikimatrix anotados con GPT 5.6 Terra. Con 307.531.009 parámetros y un repositorio de 1,3 GB en safetensors, su relevancia actual reside en aplicaciones de evaluación y control de calidad de traducciones, detección de divergencias entre textos paralelos y auditoría de reescrituras, donde se necesita granularidad por token en lugar de una única métrica de similitud a nivel de frase.

La arquitectura es un transformer encoder bidireccional con atención completa (ModernBERT), lo que le permite procesar ambos textos de forma conjunta y condicionar cada token de B al contexto completo de A. El ejemplo de la model card ilustra el comportamiento esperado: en el par inglés-alemán "He now works in London" / "Er lebt jetzt in Berlin", los tokens con mayor divergencia semántica ("works" frente a "lebt", "London" frente a "Berlin") reciben puntuaciones de 0,535 y 0,804 respectivamente, mientras que los tokens funcionales o coincidentes se sitúan por debajo de 0,1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT) |
| Parametros totales | 307.531.009 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de mmBERT-base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible de forma explicita; el modelo base mmBERT-base es multilingue y el dataset de entrenamiento son pares Wikimatrix multilingues |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/mmBERT-base |
| Dataset de entrenamiento | jvamvas/sensidiff-wikimatrix |
| Cabecera | Token classification (una etiqueta por token, activacion sigmoide) |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde `jhu-clsp/mmBERT-base` y rematado con una cabeza de clasificación de tokens (`AutoModelForTokenClassification`). La salida relevante es el logit de la clase 0 por token, al que se aplica una sigmoide para obtener la puntuación de diferencia. El entrenamiento se realizó sobre el dataset `jvamvas/sensidiff-wikimatrix`, compuesto por pares de Wikimatrix anotados automáticamente con GPT 5.6 Terra. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus, la función de pérdida ni si hubo etapas de ajuste adicionales (RLHF, DPO u otras).

Una particularidad de diseño destacable es que el modelo solo etiqueta la segunda secuencia del par. Para obtener puntuaciones sobre el primer texto es necesario ejecutar una segunda pasada con los textos intercambiados, tal como advierte la propia model card. Esta asimetría condiciona el uso práctico: el modelo está pensado para evaluar B respecto a A, no para producir una alineación simétrica en una sola inferencia. No se documentan innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos SSM, más allá de las propias de ModernBERT.

## Capacidades

- Predicción de puntuaciones de diferencia semántica a nivel de token entre dos textos.
- Salida calibrada mediante sigmoide en el rango [0, 1] por token, interpretable como probabilidad de divergencia.
- Procesamiento conjunto de pares de secuencias mediante el tokenizador estándar de transformers (`tokenizer(text_a, text_b)`).
- Capacidad multilingüe heredada de mmBERT-base y del corpus Wikimatrix, que cubre múltiples pares de idiomas (el ejemplo de la model card es inglés-alemán).
- Integración directa con `transformers` mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de clasificación, no un modelo generativo.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Etiquetado asimétrico: solo la segunda secuencia recibe puntuaciones en una pasada.

## Casos de uso

- Control de calidad de traducciones automáticas: dado un par origen-traducción, el modelo señala qué tokens de la traducción divergen semánticamente del original, permitiendo revisar solo los segmentos con puntuaciones altas en lugar de revisar el documento completo. La granularidad por token lo hace adecuado para flujos de posedición asistida.
- Detección de errores de contenido en traducciones humanas: en pipelines de auditoría, se pueden marcar tokens con puntuación superior a un umbral (por ejemplo, 0,7) como candidatos a error de sentido, omisión o adición, y derivarlos a un revisor humano.
- Evaluación de reescrituras y paráfrasis: comparar un texto original con su versión reescrita para identificar qué fragmentos han cambiado de significado frente a los que solo han cambiado de forma, útil en sistemas de resumen o simplificación.
- Verificación de consistencia en localización de productos: comparar cadenas de interfaz o documentación traducidas a varios idiomas contra la versión de referencia para detectar desviaciones semánticas en terminología o cifras.
- Análisis de divergencias en corpus paralelos: en investigación en lingüística computacional, generar alineaciones token a token con puntuaciones de diferencia para estudiar fenómenos de traducción, como cambios de voz, omisiones o adaptaciones culturales.
- Filtrado de datos de entrenamiento: puntuar pares de frases multilingües y descartar aquellos con divergencias semánticas altas antes de usarlos en el entrenamiento de modelos de traducción o de recuperación, reduciendo ruido en el corpus.
- Detección de alucinaciones o desviaciones en respuestas: comparar una respuesta generada con una fuente de referencia y localizar los tokens de la respuesta que se alejan del contenido de la fuente, como señal auxiliar en sistemas de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (307,5 M de parámetros), más activaciones; en la práctica, entre 2 y 3 GB para lotes pequeños y secuencias cortas.
- VRAM estimada en fp16/bf16: alrededor de 0,6 GB para pesos; en torno a 1,5-2 GB con activaciones para uso interactivo.
- VRAM estimada en int8: aproximadamente 0,3 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes, una A100 o H100 mejora el throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; también es posible exportarlo a ONNX o TorchScript para servir con FastAPI o similar. No se documenta soporte específico para vLLM, TGI o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño y la arquitectura encoder, se espera una latencia de milisegundos por par en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZurichNLP/sensidiff-base | 307,5 M | no disponible | Diferencia semantica por token en pares de textos | MIT | Hugging Face |
| jhu-clsp/mmBERT-base (modelo base) | no disponible en la informacion | no disponible | Encoder multilingue generico | no disponible en la informacion | Hugging Face |
| Metricas de similitud a nivel de frase (p. ej., COMET, BERTScore) | variable | variable | Evaluacion de traduccion a nivel de frase | variable | Hugging Face / repositorios |
| Modelos de alineacion de palabras estadisticos (p. ej., fast_align, efmaral) | no aplica (no neuronales) | no aplica | Alineacion lexica | variable | Repositorios academicos |

La comparativa directa es limitada porque sensidiff-base ocupa un nicho especifico: no es un modelo de traduccion ni un evaluador de frases, sino un etiquetador de diferencias por token. Frente a metricas como COMET o BERTScore, que devuelven una puntuacion global por par, sensidiff-base ofrece granularidad por token, lo que permite localizar la divergencia. Frente a alineadores estadisticos como fast_align, aporta senal semantica contextual en lugar de correspondencia lexica. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Modelo no generativo: no puede usarse para chat, generacion de texto, codigo ni razonamiento; su unica funcion es la clasificacion de tokens.
- Etiquetado asimetrico: solo puntua la segunda secuencia del par; obtener puntuaciones para la primera requiere una segunda pasada con los textos intercambiados, lo que duplica el coste en analisis simetricos.
- Entrenamiento con anotaciones automaticas de GPT 5.6 Terra: las puntuaciones heredan los sesgos y errores del anotador, y no se documenta validacion humana del dataset.
- Riesgo de calibracion imperfecta: las puntuaciones sigmoides no estan necesariamente calibradas como probabilidades reales; los umbrales deben ajustarse por dominio e idioma.
- Idiomas soportados no declarados explicitamente: aunque el modelo base es multilingue y el corpus es Wikimatrix, no se especifica la cobertura real por par de idiomas ni el rendimiento en idiomas de bajos recursos.
- Longitud de contexto no documentada: secuencias largas pueden requerir truncamiento o segmentacion, con perdida de contexto.
- Sesgos potenciales: al entrenarse sobre Wikimatrix, puede reflejar sesgos de dominio (texto enciclopedico y de noticias) y funcionar peor en generos como conversacion, codigo o texto tecnico.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright y verificar las condiciones del modelo base mmBERT-base y del dataset, que pueden tener terminos propios.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, por lo que su adopcion en produccion deberia acompanarse de una evaluacion propia en el dominio objetivo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy limitado y poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZurichNLP/sensidiff-base
- Dataset de entrenamiento: https://huggingface.co/datasets/jvamvas/sensidiff-wikimatrix
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Perfil del autor: https://huggingface.co/ZurichNLP
