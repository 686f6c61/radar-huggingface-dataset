# Vanespl/q1-cifar10-ioc_nn

## Resumen

`Vanespl/q1-cifar10-ioc_nn` es un modelo neuronal de clasificacion de imagenes entrenado desde cero para la resolucion de un trabajo practico (asignatura Q1). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un perceptron multicapa (MLP) de dos capas que recibe vectores aplanados de 3072 dimensiones (imagenes CIFAR-10 de 32x32x3) y produce 10 logits, uno por clase del conjunto CIFAR-10.

El modelo ha sido publicado por el usuario Vanespl en HuggingFace y no cuenta con descargas ni likes en el momento de la consulta. Su relevancia es exclusivamente academica y didactica: sirve como ejemplo minimo de pipeline de entrenamiento y evaluacion sobre CIFAR-10, con artefactos auxiliares de preprocesado (`metadata.json`, `preprocessing.npz`) y pesos en formato PyTorch (`model.pt`).

No dispone de model card con resultados, licencia declarada ni idiomas soportados. El tamano del repositorio es de 0.0 GB, lo que es coherente con una red de apenas unos miles de parametros. No debe confundirse con un modelo de proposito general: su unica funcion es clasificar imagenes de CIFAR-10 en una de sus diez categorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso, `3072 -> 32 -> 10` |
| Parametros totales | 98.698 (calculado a partir de la arquitectura: 3072x32 + 32 + 32x10 + 10) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas completamente conectadas: una capa de entrada de 3072 unidades (equivalente a aplanar una imagen RGB de 32x32), una capa oculta de 32 neuronas con activacion ELU y una capa de salida de 10 logits correspondientes a las clases de CIFAR-10. No hay convoluciones, atencion ni mecanismos recurrentes; se trata del diseno mas simple posible para una tarea de clasificacion de imagenes.

Segun la model card, el modelo se entreno desde cero con las etiquetas originales de CIFAR-10 (p=0, es decir, sin label smoothing ni reetiquetado). El repositorio incluye `metadata.json` con los detalles de preprocesado y `preprocessing.npz` con la media y desviacion tipica empleadas para normalizar las entradas. No se especifica el numero de epocas, el optimizador, la tasa de aprendizaje, el tamano de batch ni el split de validacion utilizado. Tampoco se documenta el uso de tecnicas como data augmentation, regularizacion o ajuste fino.

## Capacidades

- Clasificacion de imagenes de CIFAR-10 en 10 categorias: avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion.
- Entrada fija de 3072 valores float correspondientes a una imagen RGB de 32x32 normalizada con la media y desviacion de `preprocessing.npz`.
- Salida de 10 logits; requiere aplicar softmax para obtener probabilidades.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion de texto.
- No admite imagenes de resolucion distinta de 32x32 sin un reescalado externo.

## Casos de uso

- Docencia y practicas de deep learning: sirve como linea base minima para comparar con CNN, ResNet o Vision Transformers en CIFAR-10, permitiendo medir la mejora que aporta la convolucion frente a un MLP.
- Verificacion de pipelines de preprocesado: al incluir `preprocessing.npz` con media y desviacion, se puede usar para comprobar que un pipeline de normalizacion reproduce exactamente las condiciones de entrenamiento.
- Pruebas unitarias de infraestructura de inferencia: su tamano minimo (menos de 100.000 parametros) lo hace util para validar el despliegue en frameworks como PyTorch, ONNX Runtime o TorchScript sin coste de GPU.
- Experimentos de cuantizacion y compresion: sirve para estudiar el impacto de la cuantizacion post-entrenamiento (int8, float16) en un modelo de juguete antes de aplicarla a redes mayores.
- Demostraciones educativas de clasificacion de imagenes: se puede integrar en un cuaderno de Jupyter o en una demo web para ilustrar el flujo completo de carga de pesos, preprocesado e inferencia.
- Investigacion sobre sesgo de clase en CIFAR-10: al usar etiquetas originales (p=0), permite analizar el rendimiento por clase y detectar desequilibrios sin interferencia de tecnicas de reetiquetado.
- Benchmark de referencia para comparar inicializaciones o funciones de activacion: la activacion ELU documentada permite reproducir el experimento y sustituirla por ReLU, GELU o SiLU para medir diferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye precision en test, matriz de confusion, curvas de aprendizaje ni comparaciones con otras arquitecturas. Tampoco se especifica el accuracy alcanzado en el split de entrenamiento o validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float32 (98.698 parametros x 4 bytes ≈ 395 KB), mas el espacio de activaciones, despreciable.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU; tambien funciona en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU de consumo, incluso en Raspberry Pi o dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load`), exportacion a ONNX Runtime, TorchScript o conversion a NumPy para inferencia en CPU.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la latencia por muestra sera del orden de microsegundos en GPU y de decimas de milisegundo en CPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Vanespl/q1-cifar10-ioc_nn` | 98.698 | 3072 valores (32x32x3) | Clasificacion CIFAR-10 | no disponible | HuggingFace |
| LeNet-5 (referencia clasica) | ~60.000 | 32x32x1 | Clasificacion MNIST/CIFAR | dominio publico (arquitectura) | multiple |
| ResNet-18 (adaptado a CIFAR) | ~11,2 M | 32x32x3 | Clasificacion CIFAR-10 | MIT (implementaciones) | torchvision |
| ViT-Small/16 (adaptado) | ~22 M | 32x32x3 | Clasificacion CIFAR-10 | Apache 2.0 (implementaciones) | timm |

La comparativa es orientativa: no se dispone de resultados de accuracy para el modelo de Vanespl, por lo que no es posible establecer una comparacion cuantitativa con ResNet-18 o ViT-Small. La diferencia principal es arquitectonica: el modelo evaluado es un MLP sin sesgo inductivo convolucional, lo que en CIFAR-10 suele traducirse en una precision notablemente inferior a las CNN.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con las etiquetas originales de CIFAR-10, hereda los sesgos y desequilibrios del dataset, incluyendo posibles confusiones entre clases visualmente similares (gato/perro, ciervo/caballo).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir predicciones de alta confianza en imagenes fuera de distribucion o con ruido.
- Limitaciones de contexto o idioma: la entrada debe ser exactamente de 32x32x3 y normalizarse con la media y desviacion de `preprocessing.npz`; cualquier otra resolucion o rango de valores degradara la salida.
- Restricciones de licencia: la licencia no esta declarada en el repositorio, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveat para produccion: es un modelo academico sin validacion publicada; no debe usarse en sistemas de produccion que requieran precision garantizada.
- No se documenta el proceso de entrenamiento completo (epocas, optimizador, split), lo que dificulta la reproducibilidad exacta.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vanespl/q1-cifar10-ioc_nn
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- Documentacion de PyTorch para carga de state dicts: https://pytorch.org/docs/stable/generated/torch.load.html
- Referencia de la activacion ELU: https://pytorch.org/docs/stable/generated/torch.nn.ELU.html
