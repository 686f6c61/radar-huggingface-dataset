# ZurichNLP/sensidiff-small

## Resumen

SensiDiff-small es un modelo encoder de tipo token classification desarrollado por el grupo ZurichNLP (Universidad de Zúrich). Su función es asignar una puntuación de "diferencia semántica" a cada token del segundo texto de un par, indicando en qué medida ese token aporta información que no está presente en el primer texto. No es un modelo generativo: no produce texto, sino una secuencia de logits (una puntuación por token) que se interpretan como probabilidades tras aplicar una sigmoide.

El modelo parte de `jhu-clsp/mmBERT-small`, un encoder multilingüe de la familia ModernBERT, y se ha afinado sobre el dataset `jvamvas/sensidiff-wikimatrix`, compuesto por pares de Wikimatrix anotados con GPT 5.6 Terra. Con aproximadamente 140,6 millones de parámetros y un tamaño de repositorio de 0,6 GB, es un modelo ligero pensado para tareas de análisis de diferencias entre textos, como la evaluación de traducciones o la detección de contenido añadido.

Su relevancia radica en que ofrece una alternativa ligera y de licencia MIT para tareas de comparación semántica a nivel de token, un nicho habitualmente cubierto por métricas basadas en n-gramas o por modelos generativos mucho más costosos. La disponibilidad de pesos en safetensors y su integración con la librería Transformers facilitan su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT) para token classification |
| Parametros totales | 140.641.921 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se detalla) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `jhu-clsp/mmBERT-small`, un encoder de la familia ModernBERT con aproximadamente 140 millones de parámetros. La cabeza de clasificación es de tipo token classification, con una única etiqueta por token (la puntuación de diferencia), que se obtiene aplicando una sigmoide sobre el logit correspondiente. El modelo solo etiqueta el segundo texto del par; para obtener puntuaciones del primero es necesario realizar una segunda pasada con los textos intercambiados.

El entrenamiento se realizó sobre el dataset `jvamvas/sensidiff-wikimatrix`, que contiene pares de Wikimatrix anotados con GPT 5.6 Terra. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del uso del encoder ModernBERT como base.

## Capacidades

- Predicción de puntuaciones de diferencia semántica a nivel de token para el segundo texto de un par.
- Análisis de diferencias entre pares de textos, útil para detectar contenido añadido o modificado.
- Funciona como modelo de token classification, no como generador de texto.
- Soporte multilingüe heredado del modelo base `jhu-clsp/mmBERT-small` (no se especifican los idiomas concretos).
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación de traducciones automáticas: comparar el texto original con la traducción para identificar qué tokens de la traducción aportan información nueva o divergente, gracias a la puntuación por token.
- Detección de contenido añadido en resúmenes: comparar un documento fuente con su resumen para localizar tokens del resumen que no tienen correspondencia en el original.
- Control de calidad en post-edición: comparar una traducción automática con la versión post-editada para identificar los cambios semánticos introducidos por el editor.
- Análisis de paráfrasis: comparar dos versiones de un mismo texto para medir qué fragmentos divergen semánticamente a nivel de token.
- Verificación de citas y atribuciones: comparar una cita con el texto fuente para detectar tokens que no aparecen en el original.
- Investigación en lingüística computacional: estudiar alineaciones semánticas a nivel de token entre pares de textos en distintos idiomas, aprovechando la base multilingüe del modelo.
- Filtrado de datos en pipelines de NLP: detectar pares de textos con diferencias semánticas significativas para tareas de curación de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~140 millones de parámetros, en FP32 requiere aproximadamente 0,56 GB solo para los pesos; en FP16, unos 0,28 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarán sin problemas, aunque el modelo no aprovechará la capacidad de GPUs de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Transformers (con `AutoModelForTokenClassification`), y potencialmente ONNX Runtime o TorchScript para optimización. No se ha confirmado soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZurichNLP/sensidiff-small | 140,6 M | no disponible | Token classification (diferencia semántica) | MIT | Hugging Face |
| jhu-clsp/mmBERT-small (base) | ~140 M | no disponible | Encoder multilingüe | no disponible | Hugging Face |
| Modelos de evaluación de traducción basados en encoder (p. ej. COMET) | variable | no disponible | Evaluación de calidad de traducción | variable | Hugging Face |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo etiqueta el segundo texto del par; para obtener puntuaciones del primero es necesario realizar una segunda pasada con los textos intercambiados.
- No es un modelo generativo: no produce texto, solo puntuaciones por token.
- No se especifican los idiomas soportados, aunque hereda el carácter multilingüe del modelo base.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento más allá de que proviene de Wikimatrix anotado con GPT 5.6 Terra.
- Riesgo de alucinación no aplicable en el sentido generativo, pero las puntuaciones pueden ser poco fiables en dominios alejados de los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base `jhu-clsp/mmBERT-small` y del dataset de entrenamiento.
- No se han publicado benchmarks que permitan validar su rendimiento frente a alternativas.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos, lo que puede indicar una disponibilidad muy reciente y escasa validación comunitaria (0 descargas, 0 likes).

## Enlaces

- Hugging Face: https://huggingface.co/ZurichNLP/sensidiff-small
- Dataset de entrenamiento: https://huggingface.co/datasets/jvamvas/sensidiff-wikimatrix
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
