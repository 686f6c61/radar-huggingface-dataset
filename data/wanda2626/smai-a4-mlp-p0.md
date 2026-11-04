# wanda2626/smai-a4-mlp-p0

## Resumen

`smai-a4-mlp-p0` es un perceptrón multicapa (MLP) completamente conectado entrenado sobre CIFAR-10, publicado en Hugging Face por el usuario `wanda2626` como parte de la asignación 4 de un curso de *Statistical Methods in Artificial Intelligence* (SMAI), concretamente la tarea 1.5. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un clasificador de imágenes de 10 clases con una arquitectura mínima de dos capas lineales y una ReLU intermedia.

El modelo resuelve exclusivamente la tarea de clasificación de imágenes de 32 × 32 píxeles en las diez categorías de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). Su relevancia es puramente académica y comparativa: sirve como línea base (baseline) frente a variantes del mismo ejercicio entrenadas con etiquetas ruidosas, ya que este checkpoint se entrenó con las etiquetas verdaderas (nivel de ruido p = 0).

El repositorio tiene un tamaño de 0.0 GB (solo contiene los pesos y el fichero de preprocesado), no registra descargas ni *likes*, y no declara licencia ni idiomas. Con 789 258 parámetros y una precisión de test del 50,39 %, se sitúa muy por debajo de los clasificadores convolucionales modernos, lo que es esperable dada su naturaleza de ejercicio didáctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) totalmente conectado: 3072 → 256 → 10, ReLU en la capa oculta, salida lineal (logits) |
| Parametros totales | 789 258 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 32 × 32 × 3 = 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch, presumiblemente float32) |
| Idiomas soportados | no aplica (clasificación de imágenes; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch) y `preprocessing.npz` (medias y desviaciones para estandarización) |

## Arquitectura y entrenamiento

La arquitectura es un `nn.Sequential` con dos capas lineales: `nn.Linear(3072, 256)`, una activación ReLU y `nn.Linear(256, 10)`. La entrada es la imagen aplanada en orden *channel last* (`img.reshape(3072)`), convertida a float, dividida entre 255 y estandarizada columna a columna con la media y la desviación típica calculadas sobre las 50 000 imágenes de entrenamiento de CIFAR-10 (fichero `preprocessing.npz`, arrays `mean` y `std`). La salida son 10 logits sin softmax; para obtener probabilidades hay que aplicar softmax manualmente.

El entrenamiento se realizó sobre la partición de entrenamiento de `uoft-cs/cifar10` (50 000 imágenes) con descenso de gradiente estocástico (SGD) plano, tasa de aprendizaje 0.02, tamaño de lote 64, acumulación de gradiente de 1 paso, pérdida de entropía cruzada, 100 épocas sin *early stopping* y semilla `torch.manual_seed(1034)`. No se menciona aumento de datos, regularización (weight decay, dropout) ni decodificación especulativa u otras innovaciones; es un entrenamiento de referencia sin técnicas destacables.

## Capacidades

- Clasificación de imágenes de 32 × 32 × 3 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Salida de logits por clase; permite obtener probabilidades aplicando softmax.
- Inferencia determinista y de coste muy bajo (una única multiplicación de matrices 3072 × 256 seguida de 256 × 10).
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo *thinking*, visión general, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes pequeñas.

## Casos de uso

- **Línea base en experimentos de aprendizaje con ruido de etiquetas**: este checkpoint (p = 0) sirve como referencia para comparar con las variantes del mismo ejercicio entrenadas con etiquetas ruidosas; se usaría midiendo la precisión de test y comparándola con la de los modelos con ruido.
- **Docencia y ejercicios de *machine learning* clásico**: permite ilustrar el flujo completo de preprocesado (aplanado, normalización, estandarización), entrenamiento con SGD y evaluación sobre CIFAR-10 en un cuaderno o script de menos de 50 líneas.
- **Prototipado rápido de *pipelines* de clasificación de imágenes**: al ser un `state_dict` de PyTorch de 789 258 parámetros, se integra trivialmente en un *script* de validación end-to-end antes de sustituirlo por un modelo convolucional.
- **Pruebas de infraestructura de inferencia**: sirve para verificar el correcto funcionamiento de un *endpoint* de Hugging Face o de un servicio de inferencia con un modelo de tamaño despreciable (menos de 1 MB de pesos en float32).
- **Comparación de funciones de pérdida y optimizadores**: dado que el autor documenta hiperparámetros exactos (SGD, lr 0.02, batch 64, 100 épocas), es reproducible para estudiar el efecto de cambiar el optimizador o la inicialización.
- **Análisis de sobreajuste**: la brecha entre precisión de entrenamiento (99,24 %) y de test (50,39 %) lo convierte en un ejemplo didáctico de sobreajuste severo y de la necesidad de regularización o de arquitecturas convolucionales.

## Benchmarks y rendimiento

Resultados publicados por el autor en la *model card* (época 100):

| Metrica | Valor |
|---|---:|
| Precisión de entrenamiento | 0.9924 |
| Precisión de test (10 000 imágenes) | 0.5039 |
| Pérdida de test | 3.6378 |
| Mejor precisión de test | 0.5178 (época 28) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (789 258 parámetros × 4 bytes ≈ 3,2 MB, más el *overhead* de PyTorch y el lote de entrada).
- GPU recomendadas: cualquiera; el modelo cabe holgadamente en una GTX 1050, RTX 3050, RTX 4090, A100 o H100. La GPU no es necesaria: la inferencia en CPU es instantánea para lotes pequeños.
- Cabe en cualquier GPU de consumo, incluida una iGPU o incluso ejecución íntegra en CPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), TorchScript, ONNX Runtime tras exportación. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no aplican; vLLM y TGI no son adecuados para este tipo de modelo.
- Latencia y *throughput*: no disponibles de forma publicada; por el tamaño, se espera del orden de microsegundos por imagen en GPU y de milisegundos en CPU, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wanda2626/smai-a4-mlp-p0` | 789 258 | 32 × 32 × 3 | 0.5039 | no disponible | Hugging Face |
| MLP del mismo ejercicio con ruido (p > 0) | 789 258 (esperado) | 32 × 32 × 3 | no disponible | no disponible | no disponible en la información |
| LeNet-5 (referencia clásica) | ~60 000 | 32 × 32 × 1 | ~0.70 (referencia histórica, no verificada aquí) | no disponible | múltiples implementaciones |
| ResNet-18 (referencia moderna) | ~11,2 M | 32 × 32 × 3 | ~0.93–0.95 (referencia habitual, no verificada aquí) | no disponible | torchvision |

Las cifras de LeNet-5 y ResNet-18 son orientativas y no proceden de la información proporcionada; se incluyen solo como contexto de categoría. El modelo comparable directo (la variante con ruido del mismo ejercicio) no está disponible en la información recibida.

## Limitaciones y advertencias

- **Sobreajuste severo**: 99,24 % en entrenamiento frente a 50,39 % en test; el modelo memoriza el conjunto de entrenamiento y no generaliza bien.
- **Rendimiento bajo**: la precisión de test está muy por debajo de clasificadores convolucionales sencillos; no es apto para producción real de clasificación de imágenes.
- **Entrada rígida**: solo acepta imágenes de 32 × 32 × 3 píxeles aplanadas en orden *channel last*; cualquier otra resolución requiere redimensionado y aplanado manual.
- **Dependencia del preprocesado**: es obligatorio aplicar la media y desviación típica de `preprocessing.npz`; sin ellas, el rendimiento se degrada.
- **Sin licencia declarada**: no se especifican términos de uso comercial; debe tratarse como no licenciado para producción hasta confirmación del autor.
- **Sesgos**: no documentados; al entrenarse solo con CIFAR-10, hereda los sesgos de composición de ese conjunto (clases desbalanceadas en escenas del mundo real, imágenes de baja resolución).
- **Riesgo de alucinación**: no aplica en el sentido de los modelos generativos, pero sí puede producir clasificaciones erróneas con alta confianza aparente (logits altos) en imágenes fuera de distribución.
- **Sin soporte de texto ni multilingüe**: no debe emplearse en tareas de NLP.
- **Repositorio de 0.0 GB y sin descargas**: no hay garantía de mantenimiento, versionado ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wanda2626/smai-a4-mlp-p0
- Dataset CIFAR-10 en Hugging Face: https://huggingface.co/datasets/uoft-cs/cifar10
- *Paper* original de CIFAR-10 (Krizhevsky, 2009): no disponible en la información proporcionada
- Repositorio del curso SMAI: no disponible en la información proporcionada
- Demos o *spaces*: no disponibles en la información proporcionada
