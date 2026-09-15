# VosiKo/vit-beans-demo

## Resumen

VosiKo/vit-beans-demo es un modelo de clasificación de imágenes basado en un fine-tuning de google/vit-base-patch16-224-in21k, el checkpoint Vision Transformer de Google preentrenado sobre ImageNet-21k. Lo publica el usuario VosiKo en Hugging Face con licencia Apache 2.0 y un total de 85.800.963 parámetros, lo que lo sitúa exactamente en la escala de un ViT-Base. El pipeline declarado es image-classification y el repositorio ocupa 1,4 GB, un tamaño coherente con un entrenamiento corto que conserva checkpoints intermedios además de los pesos finales.

El problema que resuelve es acotado: clasificar imágenes de judías (beans) tras un fine-tuning del que la model card no documenta el dataset, las clases ni el protocolo de evaluación. El autor declara una pérdida de validación de 0,1568 y una accuracy de 0,9531 sobre el conjunto de evaluación, con una curva de entrenamiento de 4 épocas y 260 pasos totales. Se trata, por tanto, de un modelo experimental o de demostración, no de un modelo de producción validado.

Su relevancia actual es limitada y de carácter práctico: sirve como ejemplo reproducible de fine-tuning de un ViT con el Trainer de Transformers y como posible baseline para tareas de clasificación visual en el ámbito agrícola. El repositorio no tiene descargas ni likes, no incluye información sobre sesgos, composición del dataset ni limitaciones, y el model-index no publica resultados de benchmarks adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base), parche 16x16, resolución de entrada 224x224, preentrenado en ImageNet-21k y fine-tuneado para clasificación |
| Parametros totales | 85.800.963 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no generativo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones cuantizadas declaradas) |
| Idiomas soportados | no disponible (la tarea es visión, no texto; no hay etiquetas de idioma en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo ViT-Base con parches de 16x16 y entrada de 224x224 píxeles, heredada del checkpoint google/vit-base-patch16-224-in21k. El modelo parte de un preentrenamiento a gran escala sobre ImageNet-21k y se adapta mediante fine-tuning supervisado a un conjunto de datos de clasificación cuyo contenido el autor no especifica ("unknown dataset" en la model card). No se documenta ningún tipo de alineación posterior (RLHF, DPO), decodificación especulativa ni mecanismo de atención alternativo: es un clasificador discriminativo puro, sin generación de texto.

Los hiperparámetros de entrenamiento sí están documentados: learning rate de 5e-05, batch de entrenamiento y evaluación de 16, 4 épocas, 260 pasos totales, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante fused, y scheduler lineal sin warmup declarado. La evolución reportada es: epoch 1 con loss de validación 0,2833 y accuracy 0,8947; epoch 2 con 0,1212 y 0,9699; epoch 3 con 0,1471 y 0,9624; y epoch 4 con 0,0917 y 0,9774. La métrica final consolidada que declara el autor en la cabecera de la model card es loss 0,1568 y accuracy 0,9531, ligeramente distinta del último valor de la tabla, lo que sugiere que corresponden a ejecuciones o agregaciones diferentes y no se detalla cuál.

El volumen de entrenamiento (260 pasos, 4 épocas) indica un dataset pequeño y un fine-tuning corto, probablemente con el clasificador de cabecera sustituido para un número reducido de clases. No hay información sobre aumentación de datos, resolución de recorte, congelación de capas ni estrategia de validación.

## Capacidades

- Clasificación de imágenes: asigna una clase a una imagen de entrada de 224x224 píxeles. Es la única tarea soportada; no genera texto ni descripciones.
- Dominio restringido a judías (beans): el nombre del modelo y el pipeline apuntan a clasificación de imágenes de judías, previsiblemente hojas o vainas, aunque la model card no confirma las clases ni el número de ellas.
- Extracción de representaciones: al ser un ViT, la salida del token CLS o de la capa oculta puede reutilizarse como embedding visual para búsqueda por similitud o clustering, con validación previa por parte del usuario.
- Fine-tuning adicional: admite reentrenamiento sobre nuevos datasets mediante la librería Transformers y el Trainer, ya que se distribuye con la configuración estándar de ViT.
- Compatibilidad con endpoints: el repositorio está etiquetado como endpoints_compatible, por lo que puede desplegarse en Hugging Face Inference Endpoints.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de código, matemáticas, visión-lenguaje ni modo thinking: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica, no procesa texto.

## Casos de uso

- Pre-diagnóstico fitosanitario en campo: una aplicación móvil captura una foto de una hoja de judía y el modelo devuelve una etiqueta de clase que el agricultor usa como orientación previa a la inspección profesional. Es adecuado por su tamaño reducido, que permite inferencia local en el dispositivo, pero solo si las clases aprendidas cubren las enfermedades de interés.
- Triaje en invernadero con cámaras fijas: clasificación continua de imágenes capturadas por cámaras trampa para priorizar qué zonas revisar. Requiere validar antes que la iluminación y el fondo de las capturas se parezcan a los del dataset de entrenamiento, que se desconoce.
- Etiquetado asistido y pre-anotación: usar el modelo para generar etiquetas preliminares sobre un corpus nuevo de imágenes de judías y corregirlas manualmente, reduciendo el coste de anotación antes de entrenar un clasificador mayor.
- Baseline de referencia en proyectos de visión agrícola: punto de partida con accuracy declarada de 0,9531 sobre el conjunto de evaluación del autor, útil para comparar contra modelos propios antes de invertir en datasets mayores.
- Despliegue en borde (edge computing): con 85,8 millones de parámetros y pesos de aproximadamente 343 MB en fp32 o 172 MB en fp16, cabe en dispositivos como Raspberry Pi con acelerador, Jetson Nano o móviles de gama media, lo que habilita clasificación sin conectividad.
- Control de calidad en línea de envasado: descartar automáticamente partidas de judías con defectos visibles si el modelo se reentrena con imágenes de producto en lugar de hojas, ya que la arquitectura admite fine-tuning sobre cualquier conjunto de clases.
- Material didáctico y demos de fine-tuning: ejemplo reproducible de ajuste de un ViT con Transformers 5.17.0, PyTorch 2.11.0 y el Trainer, útil en talleres o cursos de visión por computador.
- Indexación visual de catálogos: generar embeddings de imágenes de variedades de judía para búsqueda por similitud en un catálogo agrícola, siempre que se valide la calidad de las representaciones en el dominio concreto.

## Benchmarks y rendimiento

El model-index del repositorio declara una lista de resultados vacía, por lo que no hay benchmarks comparables publicados (MMLU, HumanEval, GSM8K y similares no aplican a un clasificador visual). Los únicos datos disponibles son los de la propia evaluación del autor durante el entrenamiento:

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy (cabecera de la model card) | 0,9531 | evaluación del autor |
| Loss (cabecera de la model card) | 0,1568 | evaluación del autor |
| Accuracy epoch 1 | 0,8947 | validación |
| Accuracy epoch 2 | 0,9699 | validación |
| Accuracy epoch 3 | 0,9624 | validación |
| Accuracy epoch 4 | 0,9774 | validación |
| Validation loss epoch 1 | 0,2833 | validación |
| Validation loss epoch 2 | 0,1212 | validación |
| Validation loss epoch 3 | 0,1471 | validación |
| Validation loss epoch 4 | 0,0917 | validación |
| Training loss epoch 1 | 0,2354 | entrenamiento |
| Training loss epoch 2 | 0,1401 | entrenamiento |
| Training loss epoch 3 | 0,1061 | entrenamiento |
| Training loss epoch 4 | 0,1307 | entrenamiento |

No se dispone de matriz de confusión, métricas por clase, F1, precisión o recall, ni comparación con otros modelos sobre el mismo conjunto de datos. La discrepancia entre la accuracy final de la cabecera (0,9531) y la última epoch de la tabla (0,9774) no está explicada en la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 343 MB con pesos en fp32 y 172 MB en fp16 o bf16; con batch pequeño y activaciones para entrada de 224x224, el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo es demasiado pequeño para aprovechar GPUs de datacenter de gama alta, donde el cuello de botella será el preprocesado de imágenes, no la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos ocho años, e incluso en CPU para lotes pequeños o inferencia individual.
- Despliegue: pipeline de image-classification de Transformers, exportación a ONNX u ONNX Runtime, TorchScript, Optimum y Hugging Face Inference Endpoints (el repositorio está marcado como endpoints_compatible). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de lenguaje.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de imágenes por segundo.
- Almacenamiento: el repositorio ocupa 1,4 GB, muy por encima de los pesos finales, lo que indica que incluye checkpoints y estados de optimizador intermedios que pueden descartarse en producción.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo en su dominio, por lo que la comparación se limita a características estructurales y de licencia. Los siguientes modelos son alternativas razonables como punto de partida o como referencia de arquitectura:

| Modelo | Parametros | Entrada | Tarea / datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VosiKo/vit-beans-demo | 85.800.963 | 224x224, parche 16 | Clasificación de judías, dataset no documentado, accuracy 0,9531 declarada | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| google/vit-base-patch16-224-in21k | 86 M aprox. | 224x224, parche 16 | Preentrenado en ImageNet-21k, sin cabecera de clasificación final | apache-2.0 | Hugging Face, ampliamente utilizado |
| google/vit-base-patch16-224 | 86 M aprox. | 224x224, parche 16 | Clasificación ImageNet-1k (1000 clases) | apache-2.0 | Hugging Face, muy extendido |
| microsoft/resnet-50 | 25,6 M aprox. | 224x224 | Clasificación ImageNet-1k, arquitectura convolucional | mit | Hugging Face, muy extendido |

No se conocen modelos comparables publicados específicamente para clasificación de judías con los que confrontar los valores de accuracy, y el model-index vacío impide cualquier comparación numérica fiable. En términos de rendimiento en el dominio, la posición de vit-beans-demo es "no verificable de forma independiente".

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset"; se desconoce el número de clases, el origen de las imágenes, el equilibrio entre clases y si hubo separación limpia entre entrenamiento y validación.
- Riesgo alto de sobreajuste o de fuga de datos: 260 pasos y 4 épocas sobre un dataset presumiblemente pequeño, con accuracy de validación oscilando entre epochs (0,9699 en la epoch 2 y 0,9624 en la 3) y sin información sobre el tamaño del conjunto de validación.
- Métricas no verificables: no hay matriz de confusión, F1, precisión, recall ni evaluación por clase. Una accuracy global de 0,9531 puede ocultar un rendimiento muy pobre en clases minoritarias.
- Inconsistencia documental: la accuracy de la cabecera (0,9531) no coincide con la de la última epoch de la tabla (0,9774), y no se explica la diferencia.
- Alucinación en sentido estricto: no aplica, ya que el modelo no genera texto. El riesgo equivalente es la clasificación errónea con alta confianza, especialmente ante imágenes fuera de la distribución de entrenamiento.
- Sesgos potenciales: no evaluados. En modelos entrenados con imágenes de campo son habituales los sesgos por iluminación, fondo, cámara, variedad de cultivo y región geográfica, pero no hay ningún análisis publicado al respecto.
- Limitaciones de dominio e idioma: el modelo solo procesa imágenes de 224x224 en el dominio aprendido. Las etiquetas de salida, si están en texto, se desconocen. No hay soporte multilingüe porque no hay componente de lenguaje.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay issues, discusiones ni terceros que hayan reproducido los resultados.
- Uso comercial: la licencia apache-2.0 permite uso comercial y modificación con atribución, pero el modelo base google/vit-base-patch16-224-in21k y los datos de fine-tuning pueden tener condiciones propias; conviene revisar la procedencia del dataset, que no está documentada.
- Advertencia para producción: no debería desplegarse en un sistema agrícola real sin una revalidación propia sobre datos del dominio objetivo, con métricas por clase y análisis de errores. Su estado actual es el de una demo o experimento.
- Trazabilidad: el README conserva el comentario autogenerado por el Trainer que pide revisar la ficha, lo que confirma que el autor no completó la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VosiKo/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- No se han encontrado en la búsqueda web otros enlaces relevantes: los resultados devueltos corresponden a páginas del portal alemán t-online.de, sin relación con el modelo, su dataset, su paper o su repositorio.
