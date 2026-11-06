# Vanespl/q1-cifar10-mlp

## Resumen

`Vanespl/q1-cifar10-mlp` es un perceptron multicapa (MLP) entrenado desde cero para una tarea academica (identificada en la model card como "Q1 assignment"). El modelo resuelve un problema de clasificacion de imagenes en 10 clases sobre el conjunto de datos CIFAR-10, tomando como entrada un vector aplanado de 3072 valores (imagenes RGB de 32x32 pixeles) y produciendo 10 logits de clase.

La arquitectura es minima: una unica capa oculta de 32 neuronas con activacion ReLU y una capa de salida de 10 unidades. No se trata de un modelo de lenguaje ni de un transformer, sino de una red neuronal densa de proposito didactico, con un total de aproximadamente 98.634 parametros (3072x32 + 32 bias en la capa oculta, mas 32x10 + 10 bias en la salida).

Su relevancia practica es muy limitada fuera del ambito educativo: sirve como referencia de linea base para clasificacion de imagenes de baja resolucion y como ejemplo de pipeline completo de entrenamiento, preprocesado y serializacion de pesos en PyTorch. No dispone de model card publica mas alla del README minimo, ni de licencia declarada, ni de resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso: 3072 -> 32 -> 10 |
| Parametros totales | 98.634 (estimado a partir de las dimensiones declaradas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo es una red neuronal feedforward de dos capas completamente conectadas. La capa de entrada recibe 3072 caracteristicas correspondientes a imagenes CIFAR-10 aplanadas (3 canales x 32 x 32 pixeles). La capa oculta tiene 32 neuronas con activacion ReLU y la capa de salida proyecta a 10 logits, uno por clase del dataset CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).

Segun la model card, el entrenamiento se realizo desde cero con las etiquetas originales de CIFAR-10 (p=0, probablemente indicando ausencia de label smoothing o de reetiquetado). El repositorio incluye `metadata.json` con detalles de preprocesado y `preprocessing.npz` con la media y desviacion tipica usadas para normalizar las entradas. No se especifica el numero de epocas, el optimizador, la tasa de aprendizaje, el tamano de batch ni el split de validacion empleado. Tampoco se documenta ninguna innovacion tecnica (sin atencion, sin convoluciones, sin regularizacion declarada).

## Capacidades

- Clasificacion de imagenes de 32x32 pixeles en 10 categorias de CIFAR-10.
- Entrada exclusivamente vectorial (3072 dimensiones); no acepta imagenes en formato crudo sin aplanado y normalizacion previa.
- Salida de 10 logits; requiere aplicar softmax para obtener probabilidades.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo thinking, vision avanzada, audio ni generacion.

## Casos de uso

- Linea base academica para clasificacion CIFAR-10: util para comparar el rendimiento de arquitecturas mas complejas (CNN, ResNet, ViT) frente a un MLP simple con la misma particion de datos y el mismo preprocesado.
- Docencia de pipelines de PyTorch: el repositorio incluye `model.pt`, `metadata.json` y `preprocessing.npz`, lo que permite ilustrar el ciclo completo de carga de pesos, normalizacion de entradas e inferencia.
- Pruebas unitarias de infraestructura de serving: al ser un modelo de ~100k parametros, sirve para validar endpoints de inferencia sin consumir recursos de GPU.
- Prototipado rapido de clasificadores de imagenes de baja resolucion: en escenarios donde la precision no es critica (por ejemplo, demos o juguetes), puede integrarse como clasificador de referencia.
- Experimentos de cuantizacion y compresion: su tamano reducido permite probar tecnicas de pruning o cuantizacion int8 sin necesidad de hardware dedicado.
- Benchmarking de latencia en CPU: el modelo cabe en cache y permite medir overhead de frameworks de inferencia en entornos sin GPU.
- Reproduccion de experimentos educativos: util para verificar que el preprocesado (`preprocessing.npz`) se aplica correctamente antes de la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 (98.634 parametros x 4 bytes ≈ 395 KB), mas overhead del runtime.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada; no requiere aceleracion dedicada.
- Cabe en cualquier GPU de consumo y en CPU sin problemas de memoria.
- Opciones de despliegue: PyTorch nativo (`torch.load` del state dict). No hay pesos en GGUF ni ONNX publicados, por lo que llama.cpp, Ollama, vLLM o TGI no son aplicables directamente sin conversion.
- Latencia y throughput estimados: no disponibles; por el tamano, la inferencia por muestra deberia estar en el orden de microsegundos en CPU moderna, aunque no se ha medido ni documentado.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (MLP academico sobre CIFAR-10) con parametros, contexto o licencia documentados.

## Limitaciones y advertencias

- Precision esperada muy baja: un MLP de una sola capa oculta de 32 neuronas sobre CIFAR-10 suele quedar muy por debajo de las CNN; no se ha publicado ninguna metrica de exactitud.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Model card minima: no se documentan hiperparametros, split de datos, epocas ni criterios de seleccion del modelo.
- Sin soporte de texto, audio ni vision de alta resolucion: solo acepta vectores de 3072 dimensiones normalizados con la media y desviacion de `preprocessing.npz`.
- Riesgo de desajuste de preprocesado: si se usa otra normalizacion, las predicciones seran invalidas.
- Sin garantias de robustez ni de calibracion: no hay informacion sobre sesgos, alucinacion (no aplica a generacion) ni comportamiento fuera de distribucion.
- Repositorio de 0.0 GB segun Hugging Face: conviene verificar que `model.pt` se ha subido correctamente antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Vanespl/q1-cifar10-mlp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
