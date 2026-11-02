# Sushanth0213/smai-a4-mlp

## Resumen

SMAI A4 MLP es un perceptrón multicapa (MLP) entrenado desde cero con PyTorch sobre CIFAR-10, publicado por el usuario Sushanth0213 como parte de la asignación 4 de un curso de Statistical Methods in AI (SMAI). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imágenes de 32x32 píxeles en 10 categorías, con 1.707.274 parámetros y una arquitectura completamente conectada de tres capas (3072 -> 512 -> 256 -> 10).

El modelo se entrenó con etiquetas verdaderas (p = 0, sin ruido de etiquetas) y sirve como línea base para comparar con una red IOC-NN en la tarea 1.5 del mismo trabajo académico. Su relevancia es, por tanto, didáctica y de reproducibilidad: ilustra un pipeline completo de preprocesado, inicialización, entrenamiento con SGD y evaluación sobre CIFAR-10, con los pesos exportados en formato NumPy (.npz) para poder inspeccionarlos o reutilizarlos fuera de PyTorch.

Los resultados publicados son modestos: precisión de entrenamiento 1.0000 (sobreajuste completo) y precisión de test 0.5490, con una pérdida de test de 4.9792 y un F1 medio de 0.5496. El repositorio de HuggingFace tiene 0.0 GB, 0 descargas y 0 likes en el momento de la consulta, lo que confirma su carácter de entrega académica más que de artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) totalmente conectado: 3072 -> 512 -> 256 -> 10, ReLU en las dos capas ocultas, sin activación en la salida (10 logits) |
| Parámetros totales | 1.707.274 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; entrada fija de 3072 valores) |
| Tipos de cuantización | no disponible (pesos exportados en float64 dentro de .npz) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | .npz de NumPy con arrays W0, b0, W1, b1, W2, b2; W{i} con forma (in, out) |

## Arquitectura y entrenamiento

La red es un MLP clásico de tres capas densas. La entrada son imágenes CIFAR-10 aplanadas a 3072 dimensiones (32x32x3), seguidas de dos capas ocultas de 512 y 256 neuronas con activación ReLU y una capa de salida de 10 logits sin softmax (el usuario debe aplicar softmax por su cuenta). La inicialización de pesos sigue una normal con desviación típica sqrt(2/n_in) en las capas ocultas y sqrt(1/n_in) en la salida, con sesgos a cero, y semilla 13011 (con `torch.manual_seed(seed + 1)` y generador del DataLoader con `seed + 2`).

El preprocesado es determinista y documentado: aplanado de cada imagen, conversión a float64, división por 255 y estandarización por columna usando la media y la desviación típica de las 50.000 imágenes de entrenamiento de CIFAR-10 (divisor 1 si la desviación es 0). El entrenamiento usa entropía cruzada, SGD plano con learning rate 0.05, batch size 64 y 100 épocas sin early stopping, sobre las 50.000 imágenes de train. No se menciona aumento de datos, regularización (dropout, weight decay), ni fases de RLHF/DPO, algo esperable en un clasificador supervisado de este tipo.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija de 3072 valores float64 correspondientes a una imagen 32x32x3 preprocesada con la media y desviación típica del conjunto de entrenamiento.
- Salida de 10 logits; requiere aplicar softmax manualmente para obtener probabilidades.
- Inferencia directa con NumPy mediante la fórmula `logits = relu(relu(x @ W0 + b0) @ W1 + b1) @ W2 + b2`, sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo thinking.
- Sirve como línea base reproducible para comparar con otras arquitecturas (por ejemplo, la IOC-NN de la tarea 1.5).

## Casos de uso

- Docencia y reproducibilidad de pipelines de aprendizaje profundo: el modelo y sus hiperparámetros documentados permiten reproducir el experimento completo (semilla, inicialización, preprocesado y SGD) en un entorno docente, comparando el resultado con implementaciones propias.
- Línea base para comparación de arquitecturas: sirve para medir la mejora de una CNN o de una IOC-NN frente a un MLP plano sobre CIFAR-10, usando la precisión de test 0.5490 como referencia.
- Estudio de sobreajuste: con precisión de train 1.0000 y de test 0.5490, es un caso práctico para analizar curvas de aprendizaje, regularización y capacidad efectiva de un MLP de 1,7 M de parámetros.
- Inferencia en entornos sin framework de deep learning: al estar en .npz, se puede ejecutar con NumPy puro en un script o incluso en un dispositivo embebido con Python, sin necesidad de PyTorch.
- Verificación de preprocesado: útil como referencia para validar que una implementación propia de estandarización por columna sobre CIFAR-10 produce los mismos logits que los pesos publicados.
- Análisis de calibración y errores por clase: el F1 medio de 0.5496 permite estudiar qué clases se confunden más y cómo se comporta un clasificador sin aumentación de datos.
- Pruebas de integración de artefactos .npz en pipelines de MLOps: valida el flujo de carga de pesos desde HuggingFace y su uso en un servicio de inferencia ligero.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de CIFAR-10 (10.000 imágenes):

| Métrica | Valor |
|---|---|
| Precisión de entrenamiento | 1.0000 |
| Precisión de test | 0.5490 |
| Pérdida de test | 4.9792 |
| F1 medio | 0.5496 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; los pesos ocupan unos pocos megabytes (1.707.274 parámetros en float64 equivalen a ~13,7 MB, y en float32 a ~6,8 MB).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3050, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: NumPy puro (carga del .npz y multiplicaciones matriciales), PyTorch si se reconstruye la arquitectura, o cualquier runtime que soporte NumPy. No aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por lote en CPU debería ser del orden de milisegundos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. Como referencia cualitativa, un MLP de este tamaño sobre CIFAR-10 suele quedar por debajo de arquitecturas convolucionales, pero no se aportan cifras de terceros que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI A4 MLP | 1.707.274 | no aplica | 0.5490 | MIT | HuggingFace (.npz) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en esos escenarios es inválido.
- Sobreajuste severo: precisión de train 1.0000 frente a 0.5490 en test, sin regularización ni early stopping; no es adecuado como clasificador de producción.
- Solo funciona con imágenes CIFAR-10 de 32x32x3 y con el preprocesado exacto documentado (media y desviación típica del train de CIFAR-10); otra entrada produce resultados sin sentido.
- No incluye la capa softmax: hay que aplicarla manualmente sobre los 10 logits.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con CIFAR-10, hereda los sesgos de ese dataset (clases y distribución limitadas).
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí puede producir clasificaciones erróneas con alta confianza en clases confundibles.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el modelo no está pensado para producción; el dataset CIFAR-10 tiene sus propias condiciones de uso que deben respetarse.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni mantenimiento; el autor no ofrece garantías.
- Los pesos están en float64, lo que duplica el tamaño frente a float32; para despliegue conviene convertirlos.

## Enlaces

- HuggingFace: https://huggingface.co/Sushanth0213/smai-a4-mlp
- WandB del autor (run `mlp-p0`): https://forge.coreweave.com/wandb/sushanthmantrala-iiith/SMAI-A4-MLP
