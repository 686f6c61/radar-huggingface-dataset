# thearn/cifar10-resnet9

## Resumen

cifar10-resnet9 es un modelo de clasificacion de imagenes entrenado sobre el dataset CIFAR-10 por el desarrollador thearn. No es un modelo de lenguaje, sino una CNN compacta basada en la arquitectura ResNet-9, en el estilo de la entrada DAWNBench de David Page (2018), con un multiplicador de anchura que permite cubrir entre 0,4 y 6,6 millones de parametros. La version publicada pesa 6.577.610 parametros y alcanza una precision de 93,23 % en el split de test de CIFAR-10.

El modelo surge como problema de prueba de solve-queue, una libreria de colas de computo del propio autor que unifica GPUs locales y en la nube (una RTX 4060 local y maquinas Colab con L4) en un unico pool de computo. El entrenamiento se selecciono mediante una busqueda de hiperparametros distribuida con Optuna (muestreador TPE multivariante con "constant liar"), y los pesos publicados corresponden al campeon de la busqueda reentrenado sobre 5 semillas, conservando la de precision mediana en validacion.

Su relevancia actual es doble: por un lado, sirve como referencia reproducible y compacta para CIFAR-10 con pesos en safetensors y carga directa desde el Hub mediante `pytorch_model_hub_mixin`; por otro, documenta un flujo completo de MLOps (sincronizacion de entornos, distribucion de busquedas de hiperparametros en varias GPUs y publicacion versionada) que puede servir de plantilla para equipos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-9 (CNN con bloques residuales, estilo DAWNBench de David Page) |
| Parametros totales | 6.577.610 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en precision original) |
| Idiomas soportados | no disponible (no aplica: modelo de clasificacion de imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una ResNet-9 al estilo de la entrada DAWNBench de David Page (94 % de precision de test en 75 segundos sobre una V100 en 2018), con un multiplicador de anchura que ajusta el numero de parametros entre 0,4 y 6,6 millones. El entrenamiento se realizo sobre CIFAR-10 (revision fija del dataset `uoft-cs/cifar10` en el Hub): 45.000 imagenes para entrenamiento, 5.000 para validacion (sobre la que se optimizo) y 10.000 de test usadas solo para reporte, nunca para ajustar. El dataset se decodifico una vez a un fichero `.npz` de 184 MB con hashes registrados en un manifiesto.

Todos los aspectos del entrenamiento son hiperparametros con valor por defecto, y la busqueda (`tune.py`) define un espacio condicional de 53 parametros: optimizador (SGD o AdamW), planificador, regularizacion, aumento de datos en GPU, cabeza clasificadora y escalado de logits, epocas entre 6 y 30. Las caracteristicas opcionales usan un interruptor mas una fuerza en escala logaritmica, de modo que la busqueda puede reducirlas gradualmente. El muestreador es el TPE multivariante de Optuna con "constant liar" para evitar proponer ensayos duplicados en paralelo, y la receta de Page (`tune.PAGE`) se incluye siempre como primer ensayo. Un hallazgo destacable del autor: a las 4 epocas, escalar los logits por 0,125, usar un clasificador coseno o normalizar los logits con batch norm dio alrededor de +10 puntos sobre una cabeza lineal simple (del 70,1 % al 80-82 %), motivo por el que el espacio de busqueda incluye las tres opciones.

## Capacidades

- Clasificacion de imagenes RGB de 32x32 pixeles en las 10 clases de CIFAR-10 (avion, automovil, ave, gato, ciervo, perro, rana, caballo, barco, camion), devolviendo probabilidades sobre las 10 clases.
- Inferencia sencilla via `ResNet9.from_pretrained('thearn/cifar10-resnet9')` con entrada `uint8` de forma `(n, 32, 32, 3)` y salida `(n, 10)`; los nombres de las columnas estan en `net.classes`.
- Entrenamiento reproducible: el codigo de entrenamiento esta publicado y una configuracion por defecto de 16 epocas alcanza aproximadamente un 88 % en menos de un minuto sobre una L4; la configuracion publicada tarda unos 3 minutos en una RTX 4060.
- Demo Gradio incluida (`space/app.py`) que acepta una imagen subida y devuelve las cinco clases con mayor probabilidad.
- No soporta texto, audio, tool calling, agentes ni razonamiento multi-paso: es un clasificador de imagenes especializado.

## Casos de uso

- Clasificacion de imagenes pequenas en las clases de CIFAR-10: el modelo asigna probabilidades a imagenes de 32x32 en sus 10 categorias, util como baseline o demostracion en pipelines de vision.
- Baseline reproducible para investigacion: con 6,6 millones de parametros y una precision de 93,2 % en test, es un punto de referencia barato para comparar arquitecturas nuevas o tecnicas de aumento de datos sobre CIFAR-10.
- Pruebas de integracion de MLOps: el proyecto documenta como enviar entornos Python, datasets y busquedas de hiperparametros a GPUs remotas, por lo que sirve de ejemplo practico para validar infraestructuras de computo distribuido.
- Ensenanza de deep learning: su tamano reducido permite entrenarlo en minutos en una GPU de consumo (unos 3 minutos en una RTX 4060), ideal para cursos y tutoriales sobre CNNs, regularizacion y busqueda de hiperparametros.
- Demo interactiva de clasificacion: el script Gradio incluido permite montar rapidamente una aplicacion local donde el usuario sube una imagen y recibe las cinco clases mas probables.
- Estudio de busqueda de hiperparametros con Optuna: el espacio condicional de 53 parametros y el uso de TPE multivariante con "constant liar" son material de referencia para quien quiera aprender a estructurar busquedas distribuidas.
- Validacion de hardware de consumo: el flujo completo de entrenamiento e inferencia funciona en una RTX 4060, util para verificar configuraciones locales de CUDA y PyTorch.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (split de test de CIFAR-10):

| Metrica | Valor |
|---|---|
| Precision en test (CIFAR-10, semilla mediana, semilla 0) | 93,23 % |
| Precision en validacion (semilla 0) | 93,7 % |
| Precision en test media sobre 5 semillas | 93,18 % ± 0,16 % |

| Semilla | Validacion | Test | GPU |
|---|---|---|---|
| 0 | 93,7 % | 93,2 % | NVIDIA GeForce RTX 4060 |
| 1 | 93,8 % | 92,9 % | NVIDIA GeForce RTX 4060 |
| 2 | 93,8 % | 93,2 % | NVIDIA GeForce RTX 4060 |
| 3 | 93,2 % | 93,3 % | NVIDIA GeForce RTX 4060 |
| 4 | 93,6 % | 93,2 % | NVIDIA GeForce RTX 4060 |

Como referencia contextual, la receta original de David Page (DAWNBench 2018) alcanzo un 94 % de test en 75 segundos sobre una V100; este modelo se queda cerca con hardware mucho mas modesto. No hay comparativas directas con otros modelos publicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 6,6 millones de parametros (unos 26 MB en FP32), cualquier GPU con 2 GB de VRAM o incluso CPU es suficiente. No hay una cifra oficial publicada.
- GPU recomendadas: cualquier GPU compatible con CUDA; el entrenamiento publicado se realizo en una NVIDIA GeForce RTX 4060 y en maquinas Colab con NVIDIA L4.
- Cabe sobradamente en GPUs de consumo: la RTX 4060 del autor entrena la configuracion completa en unos 3 minutos; una L4 entrena los 16 epocas por defecto en menos de un minuto (alrededor del 88 % de precision).
- Opciones de despliegue: PyTorch nativo con carga desde el Hub (`ResNet9.from_pretrained`), instalacion via `pip install git+https://github.com/thearn/cifar-queue`, y demo Gradio local con `python space/app.py`. No requiere vLLM, llama.cpp ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible; por el tamano del modelo, la inferencia por imagen es del orden de milisegundos en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset/tarea | Precision test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thearn/cifar10-resnet9 | 6.577.610 | CIFAR-10 | 93,23 % | Apache-2.0 | HuggingFace Hub, safetensors |
| ResNet-9 DAWNBench (David Page, 2018) | ~4,5 M (receta original) | CIFAR-10 | ~94 % | no disponible | codigo de referencia, no en el Hub |
| ResNet-18 clasico (He et al., 2015) | ~11 M | CIFAR-10 (tipicamente ~93-95 % segun implementacion) | no disponible para CIFAR-10 de forma canonica | no disponible | multiples implementaciones |

La comparativa es orientativa: las cifras de los modelos de referencia dependen de la implementacion y no hay una evaluacion unificada publicada en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica imagenes 32x32 RGB en las 10 clases de CIFAR-10; no generaliza a otras resoluciones, dominios o numero de clases sin reentrenamiento.
- La precision declarada (93,23 %) es un resultado declarado por el autor y no verificado de forma independiente (campo `verified: false` en el model-index).
- La variabilidad entre semillas es de ±0,16 % en test, por lo que diferencias pequenas frente a otros modelos pueden no ser significativas.
- El proyecto es un banco de pruebas de la libreria solve-queue del autor, que no es publica: los scripts de cola documentan como se produjeron los resultados pero no pueden ejecutarse hoy segun la propia model card.
- No hay informacion sobre sesgos del modelo; al tratarse de CIFAR-10, hereda las limitaciones conocidas del dataset (imagenes de baja resolucion, clases del mundo occidental, posibles desequilibrios).
- Riesgo de alucinacion: no aplica a un clasificador de imagenes, aunque puede confundirse con clases visualmente similares (gato/perro, automovil/camion), un error tipico en CIFAR-10.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion y copia de la licencia.
- El repositorio es muy reciente (creado en octubre de 2026) y con pocas descargas (256), por lo que tiene poca trazabilidad comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thearn/cifar10-resnet9
- Repositorio de codigo en GitHub: https://github.com/thearn/cifar-queue
- Dataset CIFAR-10 en HuggingFace: https://huggingface.co/datasets/uoft-cs/cifar10
- Paper citado en los tags (arXiv): https://arxiv.org/abs/2404.00498
