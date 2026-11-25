# untrue5149/swedish-grammaticality-modernbert-base

## Resumen

Swedish grammaticality scorer es un modelo de clasificación de tokens especializado en la detección de errores gramaticales en sueco. Lo desarrolla el usuario untrue5149 y se construye mediante fine-tuning del modelo base `AI-Sweden-Models/ModernBERT-base`, un transformer encoder de arquitectura ModernBERT entrenado originalmente por AI Sweden. El modelo resuelve un problema concreto: asignar a un texto sueco una puntuación entre 0 y 1 que refleja su corrección gramatical, además de señalar a nivel de token qué fragmentos son erróneos.

La arquitectura es un encoder ModernBERT con 149,6 millones de parámetros, adaptado a la tarea de token classification con una cabeza de clasificación binaria por token. La puntuación a nivel de oración se obtiene combinando las probabilidades por token mediante un noisy-OR (la probabilidad de que ningún token sea incorrecto). Está entrenado específicamente para sueco y su relevancia actual reside en aplicaciones de corrección gramatical, evaluación de textos de aprendices de idiomas y filtrado de calidad en corpus suecos.

El modelo se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial. Su tamaño contenido (0,6 GB en el repositorio) y su velocidad de inferencia (más de 19.000 muestras por minuto en una GPU de portátil) lo hacen adecuado para pipelines de procesamiento de texto a gran escala sin requisitos de hardware elevados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) con cabeza de token classification |
| Parametros totales | 149.605.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `AI-Sweden-Models/ModernBERT-base`, un encoder de la familia ModernBERT que incorpora mejoras sobre BERT clásico como atención con rotación posicional (RoPE), capas de atención lineal y un mayor contexto efectivo. Sobre esta base se añade una cabeza de clasificación de tokens que produce, para cada token, la probabilidad de formar parte de un error gramatical. La puntuación de la oración se calcula como la probabilidad de que ningún token sea incorrecto, combinando los logits mediante `logsigmoid(-logits).sum().exp()`.

El entrenamiento se realizó sobre 154.258 pares de oraciones (correcta/incorrecta) procedentes de cuatro fuentes: 117.551 pares sintéticos generados a partir de Wikipedia, 14.984 pares sintéticos derivados del corpus Dalaj, 16.936 pares reales de errores de aprendices del corpus Dalaj y 4.787 pares generados por round-trip. Se emplearon etiquetas a nivel de token junto con una función de ranking loss, cuya contribución se valida en las ablaciones publicadas: eliminar las etiquetas por token reduce la precisión de pares en Dalaj del 90,25 % al 89,89 %, y eliminar los pares reales de aprendices la reduce al 84,01 %, lo que demuestra la importancia de los datos reales de errores de aprendices.

## Capacidades

- Detección de errores gramaticales a nivel de token en sueco, con categorías que incluyen concordancia de género, forma verbal, definitud, orden de palabras (V2), pronombres, preposiciones, colocación de adverbios y negación, plural y compuestos.
- Puntuación de gramaticalidad a nivel de oración en el rango [0, 1] mediante combinación noisy-OR de las probabilidades por token.
- Discriminación entre oraciones correctas e incorrectas (pair accuracy) con resultados publicados del 92,7 % en errores reales de aprendices.
- Evaluación de textos de aprendices de sueco, con rendimiento desglosado por tipo de aprendiz (M, L, O, S, P y combinaciones).
- Procesamiento por lotes eficiente: más de 19.500 muestras por minuto en una RTX 3050 de 6 GB.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Corrección gramatical en herramientas de escritura: el modelo señala los tokens erróneos y permite resaltar errores en editores de texto suecos, con la ventaja de que la puntuación por token ofrece localización precisa del fallo.
- Evaluación automática de textos de aprendices de sueco: el desglose por tipo de aprendiz y las métricas publicadas (pair accuracy del 92,7 % en errores reales) permiten usar el modelo como evaluador en plataformas de aprendizaje de idiomas.
- Filtrado de calidad de corpus suecos: puntuar oraciones de un corpus web o generado y descartar las que caigan por debajo de un umbral de gramaticalidad, aprovechando el throughput de más de 19.000 muestras por minuto.
- Detección de errores en pipelines de generación de texto: usar el modelo como verificador posterior a un LLM que genere sueco, puntuando las salidas y marcando las que contengan errores gramaticales.
- Investigación en lingüística computacional: análisis de patrones de error por categoría (concordancia, orden V2, definitud) gracias a las etiquetas a nivel de token.
- Control de calidad en traducción automática: comparar la puntuación de gramaticalidad de la salida traducida frente a una referencia para detectar degradaciones gramaticales.
- Preprocesamiento para entrenamiento de modelos suecos: filtrar o corregir datos de entrenamiento antes de usarlos en el preentrenamiento o fine-tuning de modelos generativos.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Benchmark | Metrica | Valor |
|---|---|---|
| toy_test | Spearman | 0,7838 |
| toy_test | ROC AUC | 0,9528 |
| toy_dev | Spearman | 0,7805 |
| toy_dev | ROC AUC | 0,9737 |
| dalaj_test_real_errors | ROC AUC | 0,8259 |
| dalaj_test_real_errors | Pair accuracy | 0,9270 |

Rendimiento por tipo de aprendiz en Dalaj (pair accuracy, numero de pares):

| Tipo | Pair accuracy | Pares |
|---|---|---|
| learner_M | 0,9430 | 667 |
| learner_L | 0,8438 | 365 |
| learner_O | 0,9656 | 349 |
| learner_S | 0,9042 | 334 |
| learner_P | 0,9888 | 179 |
| learner_MO | 0,9831 | 59 |
| learner_LS | 0,9388 | 49 |
| learner_LM | 0,9545 | 22 |
| learner_MS | 0,7273 | 11 |

Rendimiento por categoría gramatical en el conjunto de pares (pair accuracy, pares): todas las categorías alcanzan 1,0 en el conjunto de pares, con 159 pares en total (concordancia de género 49, forma verbal 38, definitud 23, orden V2 22, pronombre 15, preposición 13, colocación de adverbio/negación 12, plural 9, compuesto 9, otros 4).

Velocidad medida en una NVIDIA GeForce RTX 3050 de 6 GB (portátil): 651 muestras por minuto en el toy test de 120 muestras y 19.570 muestras por minuto en el toy test ampliado a 2.400 muestras.

Ablaciones publicadas (toy Spearman, toy AUC, Dalaj pair accuracy):

| Variante | Toy Spearman | Toy AUC | Dalaj pair acc |
|---|---|---|---|
| Modelo completo | 0,7975 | 0,9723 | 0,9025 |
| Sin ranking loss | 0,7864 | 0,9653 | 0,8993 |
| Sin etiquetas por token | 0,7743 | 0,9530 | 0,8989 |
| Sin pares reales de aprendices | 0,7952 | 0,9652 | 0,8401 |
| Sin texto round-trip | 0,8004 | 0,9754 | 0,8907 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 149,6 millones de parámetros y un repositorio de 0,6 GB; en precisión completa ocupa aproximadamente 0,6 GB de pesos, y en fp16 alrededor de 0,3 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: funciona en GPUs de gama baja como la RTX 3050 de 6 GB usada en las mediciones del autor; también es viable en CPU para lotes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers con `AutoModelForTokenClassification`, exportación a ONNX, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput estimados: 19.570 muestras por minuto en una RTX 3050 de 6 GB (portátil) con el toy test ampliado a 2.400 muestras, equivalente a unas 326 muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| untrue5149/swedish-grammaticality-modernbert-base | 149,6 M | no disponible | Deteccion de errores gramaticales en sueco | Apache 2.0 | Hugging Face |
| AI-Sweden-Models/ModernBERT-base | no disponible | no disponible | Modelo base encoder para sueco | no disponible | Hugging Face |
| Modelos de correccion gramatical multilingues (p. ej. basados en mBART o T5) | variable | variable | Correccion generativa | variable | Hugging Face |

No se dispone de datos publicados de benchmarks comparativos directos con alternativas especificas en la informacion proporcionada; la comparativa se limita a la relacion con el modelo base y a la categoria de tarea.

## Limitaciones y advertencias

- El modelo solo soporta sueco; no debe usarse con otros idiomas.
- La puntuacion de gramaticalidad es una probabilidad combinada por token, no una garantia de correccion; puede producir falsos positivos y falsos negativos.
- El rendimiento en errores reales de aprendices (ROC AUC 0,826) es inferior al rendimiento en el conjunto sintetico (ROC AUC 0,953), lo que indica menor robustez ante errores reales no vistos.
- El tipo de aprendiz `learner_MS` muestra un rendimiento notablemente inferior (0,7273 de pair accuracy con solo 11 pares), lo que sugiere escasez de datos para algunas combinaciones.
- La media de puntuacion en texto informal (0,9097) es inferior a la de texto formal (0,9951), lo que puede introducir sesgo contra registros coloquiales.
- No se documentan sesgos demograficos ni culturales especificos.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificacion erronea en contextos ambiguos o con errores poco frecuentes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `AI-Sweden-Models/ModernBERT-base` debe verificarse por separado para confirmar compatibilidad.
- La longitud maxima de contexto no esta documentada en la model card.
- El modelo tiene solo 26 descargas y 0 likes en el momento de la ficha, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/untrue5149/swedish-grammaticality-modernbert-base
- Repositorio de codigo, entrenamiento y evaluacion: https://github.com/CaffineAddic/swedish-grammaticality
- Modelo base: https://huggingface.co/AI-Sweden-Models/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/untrue5149/swedish-grammaticality-pairs
