# SriHarsha2608/cifar10-iocnn

## Resumen

cifar10-iocnn es una red neuronal de clasificación de imágenes entrenada sobre el conjunto de datos CIFAR-10, publicada en HuggingFace por el usuario SriHarsha2608 bajo licencia MIT. El modelo implementa una arquitectura de convexidad entrada-salida (IOC-NN, Input-Output Convex Neural Network), una familia de redes cuya función de salida es convexa respecto a la entrada, lo que aporta garantías teóricas de estabilidad y unicidad en problemas de optimización y clasificación. La red tiene solo tres capas densas (3072 → 128 → 64 → 10) y 402.250 parámetros totales, con activaciones ELU y pesos intermedios restringidos a valores no negativos.

El modelo no es un modelo generativo ni un transformer: es un clasificador de propósito específico para las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). Su relevancia es principalmente académica y didáctica: sirve como referencia reproducible de una IOC-NN sobre un benchmark estándar, con pesos disponibles tanto en formato PyTorch (`state_dict`) como en NumPy (`.npz`). No hay información sobre idiomas, ya que la tarea es puramente de visión por computador.

El repositorio está vacío en el momento de la consulta (tamaño 0.0 GB, 0 descargas, 0 likes), creado el 27 de octubre de 2026. Esto implica que, aunque la model card describe los ficheros incluidos, no se dispone de artefactos verificables ni de métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red densa (MLP) con convexidad entrada-salida (IOC-NN); 3072 → 128 → 64 → 10, activaciones ELU, pesos intermedios no negativos |
| Parametros totales | 402.250 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de secuencia; entrada fija de 32×32×3 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (tarea de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) y arrays NumPy (`.npz`) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de tres capas completamente conectadas: una capa de entrada de 3072 dimensiones (imágenes RGB de 32×32 aplanadas), dos capas ocultas de 128 y 64 neuronas con activación ELU, y una capa de salida de 10 neuronas correspondientes a las clases de CIFAR-10. La propiedad IOC se impone restringiendo los pesos intermedios a valores no negativos, lo que hace que la salida sea convexa respecto a la entrada; esta restricción es la innovación técnica central del modelo y permite, en principio, resolver la clasificación como un problema de optimización convexa con garantías de unicidad.

El entrenamiento se realizó sobre CIFAR-10 (60.000 imágenes, 50.000 de entrenamiento y 10.000 de test). El preprocesamiento documentado es: aplanado de la imagen a 3072 dimensiones, escalado a [0, 1] dividiendo por 255,0 y estandarización por característica usando la media y desviación típica del split de entrenamiento (con divisor 1 para características de desviación cero). No se especifica en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje, si se aplicó data augmentation ni si hubo regularización más allá de la restricción de no negatividad. Tampoco se indica si se usó RLHF, DPO o cualquier técnica de alineación, algo que no aplica a un clasificador supervisado.

## Capacidades

- Clasificación de imágenes en 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre imágenes RGB de 32×32 píxeles, con salida de 10 logits/probabilidades por imagen.
- Exportación de pesos en dos ecosistemas: PyTorch (`.pt`) y NumPy (`.npz`), lo que permite reimplementar la inferencia sin dependencia de PyTorch.
- Propiedad de convexidad entrada-salida, útil para análisis teórico y para formulaciones de optimización.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo de razonamiento (thinking mode), visión general o audio más allá de la clasificación de imágenes de entrada fija.

## Casos de uso

- Docencia y reproducción de investigación en convexidad: sirve como ejemplo mínimo y verificable de IOC-NN sobre un benchmark conocido, con 402.250 parámetros, para cursos de aprendizaje profundo y artículos sobre redes convexas.
- Prototipado rápido de clasificación de imágenes de baja resolución: el modelo puede clasificar recortes de 32×32 en pipelines de experimentación, con una huella de memoria mínima (menos de 2 MB de pesos en float32).
- Validación de pipelines de preprocesamiento: el procedimiento documentado (aplanado, escalado a [0, 1] y estandarización por característica) permite contrastar implementaciones propias de normalización contra los pesos `.npz`.
- Integración en entornos sin PyTorch: la versión `.npz` permite ejecutar la inferencia con NumPy puro en sistemas embebidos o servicios ligeros donde instalar PyTorch no es viable.
- Base para estudios de robustez y estabilidad numérica: la restricción de pesos no negativos y la convexidad permiten analizar sensibilidad a perturbaciones de entrada en un entorno controlado.
- Comparación de arquitecturas en CIFAR-10: como línea base de bajo coste computacional frente a CNN y transformers de visión en experimentos de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precisión en test, matriz de confusión ni comparación con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 MB para los pesos en float32 (402.250 parámetros × 4 bytes); el coste dominante es la activación de la capa de entrada (3072 valores), por lo que la huella total en memoria es inferior a 10 MB.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU moderna; el modelo es trivial para A100, H100 o RTX 4090, que quedarían enormemente infrautilizadas.
- Cabe en cualquier GPU de consumo y también en CPU; no requiere GPU dedicada.
- Opciones de despliegue: PyTorch nativo (`state_dict`), NumPy puro (`.npz`), exportación a ONNX u otros formatos previa conversión manual; vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (tres multiplicaciones matriciales de 3072×128, 128×64 y 64×10) se espera latencia de microsegundos a milisegundos por lote en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cifar10-iocnn | 402.250 | 32×32×3 fija | No publicado | MIT | HuggingFace (repo vacío) |
| ResNet-20 (CIFAR-10) | ~270.000 | 32×32×3 | ~91-92 % top-1 (referencia habitual de la literatura) | Varía según implementación | Múltiples repos públicos |
| VGG-11 (CIFAR-10) | ~9,2 M | 32×32×3 | ~92-93 % top-1 (referencia habitual) | Varía según implementación | Múltiples repos públicos |

Nota: los valores de precisión de ResNet-20 y VGG-11 son referencias generales de la literatura sobre CIFAR-10, no resultados medidos en esta ficha; no se dispone de una comparación directa publicada con cifar10-iocnn. La principal diferencia de este modelo es su propiedad de convexidad entrada-salida, ausente en las CNN convencionales.

## Limitaciones y advertencias

- No hay métricas de precisión publicadas; no es posible evaluar su calidad frente a CNN estándar en CIFAR-10.
- El repositorio figura con tamaño 0.0 GB y 0 descargas, por lo que los ficheros `.pt` y `.npz` descritos en la model card pueden no estar accesibles o verificables.
- La arquitectura MLP sin convoluciones ni atención pierde la estructura espacial de la imagen, lo que limita su precisión frente a CNN y transformers de visión.
- La restricción de pesos no negativos reduce la capacidad expresiva y puede provocar infraajuste en clases visualmente complejas.
- Entrada fija de 32×32×3: no admite imágenes de otras resoluciones sin remuestreo previo.
- No procesa texto ni otros idiomas; no es adecuado para tareas de lenguaje.
- Riesgo de alucinación no aplica (no es generativo), pero la calibración de probabilidades no está documentada.
- Sesgos conocidos: no documentados; CIFAR-10 tiene desequilibrios y sesgos de anotación que el modelo heredaría, sin que el autor los describa.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright; aun así, la ausencia de métricas hace arriesgado su uso en producción sin evaluación propia.

## Enlaces

- HuggingFace: https://huggingface.co/SriHarsha2608/cifar10-iocnn
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
