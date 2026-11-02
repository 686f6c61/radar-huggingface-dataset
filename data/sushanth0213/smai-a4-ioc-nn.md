# Sushanth0213/smai-a4-ioc-nn

## Resumen

`smai-a4-ioc-nn` es una red neuronal de convexidad entrada-salida (IOC-NN, *input-output convex neural network*) entrenada sobre CIFAR-10 en el marco de la asignatura SMAI (Statistical Methods for AI) del IIIT Hyderabad. No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imágenes de 32x32 píxeles con una arquitectura MLP de tres capas y 1.707.274 parámetros, publicado como artefacto académico para comparar el comportamiento de una red con restricciones de convexidad frente a un MLP convencional.

El modelo se entrenó en la tarea 1.4.2 del enunciado con p = 0 (sin ruido de etiquetas) y se contrastó con el MLP de la tarea 1.5. La innovación metodológica es la restricción de monotonía: los pesos de las capas 2 y 3 se fuerzan a ser no negativos tras cada paso del optimizador, de modo que cada logit es una función convexa de la entrada. Los pesos se distribuyen en un fichero `ioc_nn.npz` (NumPy), no en safetensors ni GGUF, y el repositorio tiene un tamaño de 0,0 GB.

Su relevancia es estrictamente didáctica y de reproducibilidad: sirve como referencia de cómo imponer convexidad en una red feed-forward, cómo verificar empíricamente esa propiedad y qué coste en precisión tiene la restricción (45,59 % de accuracy en test frente a un MLP sin restricciones). No está pensado para despliegue en producción ni para tareas generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP feed-forward 3072 -> 512 -> 256 -> 10, activación ELU en las dos capas ocultas, sin activación en la salida (10 logits) |
| Parametros totales | 1.707.274 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes de 32x32x3, vector de entrada de 3072 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en float64 dentro de `ioc_nn.npz`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` con arrays `W0, b0, W1, b1, W2, b2`; `W{i}` con forma (in, out), transpuesta del peso de PyTorch |
| Dataset | CIFAR-10 (50.000 imágenes de entrenamiento, 10.000 de test) |
| Numero de clases | 10 |
| Funcion de perdida | entropía cruzada |
| Semilla | 13011 (`torch.manual_seed(seed + 1)`, generador del DataLoader `seed + 2`) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa de tres capas densas: 3072 entradas (la imagen aplanada), 512 unidades ocultas, 256 unidades ocultas y 10 logits de salida. Las dos capas ocultas usan activación ELU; la capa de salida es lineal, de modo que el usuario debe aplicar softmax por su cuenta. La restricción IOC se implementa manteniendo no negativos los pesos de las capas 2 y 3: tras cada paso del optimizador, cualquier peso negativo `w` se sustituye por `exp(w - 5)`, una transformación suave que empuja el valor hacia cero sin discontinuidades. La capa 1 se inicializa con los mismos pesos y sesgos que el MLP de referencia, mientras que las capas 2 y 3 parten de pesos uniformes en (0, 2/n_in) y sesgos a cero.

El entrenamiento usa SGD plano con learning rate 0,05, batch size 64 y 100 épocas sin parada temprana, sobre las 50.000 imágenes de entrenamiento de CIFAR-10. El preprocesado es explícito en la model card: aplanar cada imagen a 3072 dimensiones, convertir a float64, dividir entre 255 y estandarizar cada columna con la media y la desviación típica del conjunto de entrenamiento (divisor 1 si la desviación es cero). La verificación de convexidad se realizó sobre 100 pares aleatorios de imágenes de test, con 0 violaciones detectadas, lo que confirma empíricamente que cada logit se comporta como una función convexa de la entrada.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Salida de 10 logits sin normalizar; requiere softmax externo para obtener probabilidades.
- Propiedad de convexidad entrada-salida verificada: cada logit es una función convexa del vector de entrada de 3072 dimensiones.
- Inferencia determinista y de coste fijo: una sola pasada forward, sin generación autoregresiva.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes de 32x32.

## Casos de uso

- Docencia y reproducibilidad en cursos de aprendizaje automático: el modelo sirve como referencia ejecutable de una IOC-NN, con semilla, hiperparámetros y preprocesado documentados, para que los estudiantes comparen su implementación con una ya validada.
- Estudio del compromiso entre convexidad y precisión: permite cuantificar la pérdida de accuracy (45,59 % en test) frente a un MLP sin restricciones sobre el mismo dataset y la misma inicialización de la primera capa.
- Verificación de propiedades matemáticas de redes neuronales: los 100 pares de test sin violaciones permiten usar el modelo como banco de pruebas para herramientas de análisis de convexidad o de cotas de Lipschitz.
- Clasificación de imágenes de bajo coste en entornos embebidos: con 1,7 M de parámetros y entrada de 3072 floats, el forward cabe holgadamente en microcontroladores o CPUs sin GPU, útil para demos de inferencia en el borde.
- Baseline en experimentos de robustez o calibración: al ser un clasificador pequeño y determinista, sirve como punto de partida controlado antes de introducir arquitecturas convolucionales.
- Reproducción de resultados académicos: el proyecto de WandB referenciado (run `ioc-p0`) permite contrastar curvas de entrenamiento y métricas con las reportadas en la model card.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test de CIFAR-10 (10.000 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy de entrenamiento | 0,7925 |
| Accuracy de test | 0,4559 |
| Pérdida de test | 4,4496 |
| F1 medio | 0,4479 |
| Violaciones de convexidad (100 pares) | 0 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float64 (los 1,7 M de parámetros ocupan unos 13,7 MB; el resto corresponde a activaciones y buffers de entrada). Cabe en cualquier GPU, incluida una iGPU.
- GPU recomendadas: ninguna en particular; el modelo es viable en CPU. Para lotes grandes, cualquier GPU consumer (GTX 1650, RTX 3050 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en todas, y también en CPU y en sistemas embebidos.
- Opciones de despliegue: al estar en `.npz`, la vía natural es NumPy puro o una reimplementación en PyTorch cargando los arrays; no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera un throughput muy alto en CPU y prácticamente limitado por el ancho de banda de memoria en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy test CIFAR-10 | Licencia | Formato |
|---|---|---|---|---|---|
| smai-a4-ioc-nn | 1.707.274 | 3072 (32x32x3) | 0,4559 | MIT | `.npz` |
| MLP de referencia (tarea 1.5) | no disponible | 3072 (32x32x3) | no disponible | no disponible | no disponible |
| ResNet-18 (referencia habitual en CIFAR-10) | ~11,2 M | 3072 (32x32x3) | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparación cuantitativa con el MLP de referencia y con arquitecturas convolucionales queda pendiente de consultar las fuentes originales del curso.

## Limitaciones y advertencias

- Precisión baja para uso real: 45,59 % de accuracy en test sobre 10 clases implica una tasa de error superior al 54 %, insuficiente para cualquier aplicación en producción.
- Brecha train-test notable (0,7925 frente a 0,4559), indicativa de sobreajuste; no se aplicó parada temprana ni regularización más allá de la restricción de convexidad.
- La restricción de pesos no negativos limita la capacidad expresiva de la red y es la causa probable de la pérdida de precisión frente al MLP sin restricciones.
- Modelo específico de CIFAR-10: no generaliza a otras resoluciones, dominios ni a imágenes fuera de la distribución del dataset.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones, tool calling ni diálogo; cualquier uso en esos escenarios es un error de aplicación.
- Preprocesado obligatorio: hay que replicar exactamente el aplanado, la división entre 255 y la estandarización por columna con las estadísticas del conjunto de entrenamiento; omitirlo invalida las predicciones.
- Pesos en float64 dentro de `.npz`: requieren conversión explícita si se integran en un pipeline de PyTorch en float32.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no ofrece garantías y su valor comercial es prácticamente nulo por su precisión.
- Riesgo de sesgo heredado de CIFAR-10: el dataset contiene categorías desequilibradas y estereotipadas; el modelo puede reproducir esos sesgos en sus predicciones.
- No hay información sobre calibración de probabilidades ni sobre robustez ante perturbaciones adversariales.

## Enlaces

- HuggingFace: https://huggingface.co/Sushanth0213/smai-a4-ioc-nn
- Proyecto WandB (run `ioc-p0`): https://forge.coreweave.com/wandb/sushanthmantrala-iiith/SMAI-A4-MLP
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
