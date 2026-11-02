# unglue-musty-dial/smai-a4-iocnn-cifar10

## Resumen

El modelo `smai-a4-iocnn-cifar10`, publicado por el usuario `unglue-musty-dial` en HuggingFace, es una red neuronal fully-connected entrenada desde cero para clasificar imágenes del conjunto de datos CIFAR-10. Se trata de un artefacto académico correspondiente a la asignatura SMAI (Assignment 4, Q1), no de un modelo de lenguaje ni de un modelo fundacional: su única función es asignar una de las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión) a una imagen de 32x32 píxeles en color.

La arquitectura es un perceptrón multicapa (MLP) de tres capas con 3072 entradas (imágenes aplanadas), dos capas ocultas de 256 y 128 neuronas con activación ELU, y una capa de salida de 10 logits entrenada con entropía cruzada softmax. El total de parámetros asciende a 820.874. La innovación declarada por el autor es una restricción de no negatividad sobre los pesos de las capas 2 en adelante, aplicada tras cada paso del optimizador, lo que da nombre al modelo (IOC-NN, presumiblemente *Input-Output Convex Neural Network* o similar).

El interés del modelo es exclusivamente didáctico y de reproducibilidad de un experimento académico: demuestra el efecto de una restricción arquitectónica poco habitual sobre un MLP pequeño entrenado con SGD puro. No es adecuado para producción, no soporta texto, código, tool calling ni ninguna capacidad generativa, y su rendimiento (45,59 % de accuracy en test) está muy por debajo del estado del arte en CIFAR-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP fully-connected: 3072 -> 256 -> 128 -> 10, activacion ELU en capas ocultas, softmax cross-entropy en salida |
| Parametros totales | 820.874 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en `weights.npz`, NumPy float) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `weights.npz` (NumPy, con `n_layers`, `W{i}` de forma `(n_in, n_out)` y `b{i}`); preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La red es un MLP de tres capas densas. La entrada son imágenes CIFAR-10 aplanadas a 3072 valores (32x32x3), convertidas a float, divididas por 255 y estandarizadas por columna con la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (las columnas de varianza cero usan std = 1). Las capas ocultas usan activación ELU y la salida produce 10 logits optimizados con entropía cruzada softmax. El formato de pesos sigue la convención `x @ W + b` del assignment, con `W` de forma `(n_in, n_out)`.

La particularidad del entrenamiento es la restricción de no negatividad: los pesos de las capas 2 hasta la final (incluida la de salida) se inicializan con `uniform(0, 2/n_in)` y, tras cada paso del optimizador, cualquier peso negativo `w` se sustituye por `exp(w - 5)`, una transformación suave que mantiene los pesos en el dominio positivo. La primera capa se inicializa como un MLP convencional. El entrenamiento usa SGD plano con learning rate 0,05, batch size 64, acumulación de gradiente de 1 paso, 100 épocas sin early stopping, sobre el split de entrenamiento oficial de CIFAR-10 (50.000 imágenes) con etiquetas verdaderas y semilla 22011. No se menciona aumento de datos, regularización, RLHF ni ninguna otra técnica.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en color en una de las 10 clases de CIFAR-10.
- Inferencia determinista de forward pass simple (sin generación, sin muestreo).
- Reproducibilidad exacta del experimento gracias a la semilla fijada (22011) y a los ficheros de pesos y preprocesado incluidos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes pequeñas.

## Casos de uso

- Reproducción de un experimento académico: cargar `weights.npz` y `preprocessing.npz` en NumPy y verificar la accuracy de test reportada (0,4559) sobre el split oficial de CIFAR-10, útil como referencia para prácticas de la asignatura SMAI.
- Estudio del efecto de restricciones de no negatividad en pesos: comparar este MLP con un MLP idéntico sin restricción para aislar el impacto de la transformación `exp(w-5)` sobre la convergencia y la accuracy.
- Baseline didáctico en cursos de deep learning: servir como ejemplo mínimo (820.874 parámetros, SGD puro) para ilustrar el flujo completo preprocesado-entrenamiento-evaluación sin dependencias de frameworks pesados.
- Prueba de pipelines de inferencia en NumPy puro: al no requerir PyTorch ni TensorFlow, el modelo se puede integrar en entornos con restricciones de dependencias para validar un pipeline de clasificación de extremo a extremo.
- Benchmark de infraestructura de serving ligera: por su tamaño reducido (repo de 0,0 GB) permite medir latencia de carga y throughput de un clasificador trivial en CPUs modestas.
- Material de comparación en estudios de robustez: evaluar cómo se degrada un MLP restringido frente a CNN sobre CIFAR-10 bajo perturbaciones o subconjuntos de clases.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor en la model card son:

| Metrica | Valor |
|---|---|
| Accuracy de entrenamiento (epoca 100) | 0,7836 |
| Accuracy de test (epoca 100) | 0,4559 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (820.874 parámetros en float32, unos 3,3 MB) mas el overhead del runtime; cabe holgadamente en cualquier GPU, iGPU o incluso solo CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas; también en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: NumPy puro (formato nativo `weights.npz`); no se proporcionan pesos en GGUF, safetensors ni ONNX, por lo que llama.cpp, Ollama, vLLM y TGI no aplican directamente sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera un forward pass de microsegundos en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Accuracy test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-iocnn-cifar10 | 820.874 | 3072 valores (32x32x3) | 0,4559 | no disponible | HuggingFace |
| MLP estandar CIFAR-10 (referencia tipica) | ~800.000 | 3072 valores | no disponible en la informacion | no disponible | no disponible |
| CNN pequenas tipo LeNet/VGG-mini | millones | 32x32x3 | no disponible en la informacion | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada; la comparativa cuantitativa con modelos concretos no está disponible.

## Limitaciones y advertencias

- Rendimiento bajo: 45,59 % de accuracy en test frente a más del 90 % habitual en CNN sobre CIFAR-10; insuficiente para cualquier aplicación real.
- Modelo de clasificación de imágenes exclusivamente; no procesa texto, código ni audio, y no admite instrucciones.
- La restricción de no negatividad en capas 2..L limita la expresividad del modelo y probablemente contribuye a la brecha entre accuracy de train (0,7836) y de test (0,4559), que sugiere sobreajuste.
- Sin data augmentation, dropout ni weight decay declarados; entrenamiento con SGD plano durante 100 épocas sin early stopping.
- Licencia no especificada: no se puede asumir uso comercial permitido; contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de validación por terceros ni de mantenimiento.
- Riesgo de sesgo heredado de CIFAR-10 (clases desbalanceadas y sesgos en la recolección de imágenes originales), agravado por la baja accuracy.
- No apto para producción: sin versionado semántico, sin tests, sin métricas por clase y sin documentación de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/unglue-musty-dial/smai-a4-iocnn-cifar10
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
