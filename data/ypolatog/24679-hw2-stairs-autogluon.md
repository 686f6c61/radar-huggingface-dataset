# ypolatog/24679-hw2-stairs-autogluon

## Resumen

`ypolatog/24679-hw2-stairs-autogluon` es un clasificador binario de imágenes que distingue entre "escaleras" y "no escaleras". No es un modelo de lenguaje: se trata de un predictor de visión construido con `MultiModalPredictor` de AutoGluon 1.6.1 sobre backbones de `timm`, entrenado sobre el dataset `ArinRoths/StairvsNonStair_Dataset`, creado a su vez por un compañero de curso. El modelo fue desarrollado por el usuario ypolatog como entrega de la asignatura CMU 24-679 Design AI (HW2, parte 2) y se publica con licencia de uso de aula (`classroom-use`).

El problema que resuelve es acotado: dada una fotografía, asignar una de dos etiquetas (`stairs` o no `stairs`). El autor seleccionó la configuración mediante una búsqueda aleatoria de 10 trials con AutoGluon, eligiendo el backbone `resnet34` a 224 px por su ROC AUC de validación (0,938). Los resultados reales son modestos: exactitud de 0,444 ± 0,050 en validación cruzada agrupada de 3 particiones y 0,600 en un conjunto de test retenido de solo 5 fotografías, con un F1 de 0,500 para la clase `stairs`; el azar es 0,500.

Su relevancia es, por tanto, exclusivamente pedagógica y de prototipado: ilustra un flujo completo de AutoML multimodal (búsqueda de hiperparámetros, validación agrupada, model card con limitaciones explícitas) pero no es apto para ninguna decisión real. El dataset de origen contiene 27 fotografías originales tomadas por una sola persona, sin licencia declarada, por lo que su reutilización debe pactarse con su autora, ArinRoths.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) de clasificación de imágenes; backbone `resnet34` de `timm` gestionado por AutoGluon `MultiModalPredictor` |
| Parametros totales | No disponible en la informacion proporcionada (backbone ResNet-34, mas una cabeza de clasificacion binaria) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de vision con entrada de imagen fija de 224 x 224 px |
| Tipos de cuantizacion | No disponible; el autor no publica pesos cuantizados |
| Idiomas soportados | No aplica (clasificacion visual); no disponible |
| Licencia | `other` con nombre `classroom-use` (uso de aula); el dataset de origen no declara licencia |
| Formato de pesos | Predictor de AutoGluon empaquetado en `autogluon_image_predictor_dir.zip` (se carga con `MultiModalPredictor.load()`); no se publican safetensors ni GGUF |
| Tarea | Clasificacion de imagenes binaria (`stairs` / no `stairs`) |
| Backbone | `resnet34` (arquitecturas exploradas: resnet18, resnet34, efficientnet_b0, mobilenetv3_large_100) |
| Tamano de entrada | 224 x 224 px |
| Tamano del repositorio | 0,2 GB |
| Version de AutoGluon | 1.6.1 (semilla 24679) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un clasificador convolucional clásico, no un transformer ni un híbrido SSM. AutoGluon `MultiModalPredictor` actúa como capa de orquestación: recibe imágenes, las redimensiona a 224 x 224, las pasa por un backbone preentrenado de `timm` y entrena una cabeza de clasificación binaria. El autor limitó la búsqueda a cuatro backbones (`resnet18`, `resnet34`, `efficientnet_b0`, `mobilenetv3_large_100`) y a una búsqueda aleatoria de 10 trials, cada uno con un tope de 180 segundos y parada temprana tras 3 comprobaciones sin mejora. La selección se hizo por ROC AUC de validación (0,938).

La configuración finalmente elegida fue: `backbone=resnet34`, `image_size=224`, `augmentation=none`, `optimizer=sgd`, `learning_rate=7,348782489930548e-05`, `weight_decay=0,0002499845149337477`, `lr_decay=0.6`, `batch_size=32`. No se aplicó aumento de datos, lo cual es coherente con el tamaño extremadamente reducido del conjunto. El dataset de entrenamiento procede de `ArinRoths/StairvsNonStair_Dataset` y consta de 27 fotografías originales tomadas por una sola persona; no se documenta el número exacto de tokens, épocas efectivas ni composición por clase. No hay evidencia de RLHF, DPO ni ningún tipo de ajuste por preferencias humanas, algo que carece de sentido en una tarea de clasificación visual. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de imágenes binaria: asigna una etiqueta de dos clases (escaleras / no escaleras) a una fotografía de entrada.
- Inferencia sobre imágenes de 224 x 224 px, con reescalado interno gestionado por el predictor.
- Carga y reutilización mediante `MultiModalPredictor.load()` sobre el archivo `autogluon_image_predictor_dir.zip`.
- Reproducibilidad del pipeline: el repositorio incluye `metrics.json` con todas las métricas y `search_results.csv` con los 10 trials de búsqueda.
- Soporte de tool calling / function calling: no disponible (no aplica a un clasificador de imágenes).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles / no aplican.
- Capacidades especiales (modo thinking, visión generativa, audio): no disponibles. Es un modelo puramente discriminativo.

## Casos de uso

- Material didáctico para AutoML: sirve como ejemplo reproducible de un flujo completo de `MultiModalPredictor` con búsqueda de hiperparámetros, validación cruzada agrupada y model card honesta sobre limitaciones. Es su uso principal y el declarado por el autor.
- Prototipo de anotación asistida en proyectos de visión: dado que el modelo funciona mejor que el azar en validación, podría emplearse como preanotador de baja confianza en una herramienta interna, siempre con revisión humana y sabiendo que el rendimiento declarado no supera el 0,6 de exactitud.
- Prueba de concepto de detección de escaleras para robótica educativa: en un entorno de laboratorio y con imágenes de condiciones controladas similares al dataset original, podría integrarse como componente de un pipeline mayor, nunca como sistema de seguridad.
- Comparativa metodológica de backbones: los cuatro backbones explorados (resnet18, resnet34, efficientnet_b0, mobilenetv3_large_100) permiten reproducir el experimento y analizar el coste/beneficio de cada arquitectura en un problema de dos clases con muy pocos datos.
- Estudio de sesgo por sobreajuste a un dominio: el modelo refleja una única cámara, unas localizaciones y una iluminación concretas; es útil como caso de estudio sobre cómo un dataset de 27 fotografías colapsa la generalización.
- Docencia sobre métricas en clases desbalanceadas: con una línea base mayoritaria de 0,400 y azar en 0,500, el modelo ilustra por qué la exactitud sola es engañosa y por qué conviene reportar exactitud balanceada y F1 por clase.
- Plantilla de model card: la estructura del repositorio (métricas, trials, limitaciones explícitas sobre el test de n=5) puede reutilizarse como plantilla para documentar trabajos de curso.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por terceros):

| Metrica | Validacion cruzada (3-fold agrupada) | Test retenido (n=5) |
|---|---|---|
| Exactitud | 0,444 +/- 0,050 | 0,600 |
| Exactitud balanceada | 0,456 | 0,583 |
| F1 (clase `stairs`) | No disponible | 0,500 |
| ROC AUC (validacion) | 0,938 | No disponible |

Referencias del propio autor: el azar se sitúa en 0,500, la línea base mayoritaria en test es 0,400 (predecir siempre `stairs`) y el conjunto de test retenido contiene únicamente 5 fotografías. No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Un backbone ResNet-34 a 224 x 224 px con lote pequeño cabe holgadamente en menos de 2 GB de VRAM en FP32, aunque el autor no publica mediciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para el entrenamiento con AutoGluon, una GPU de gama media (RTX 3060 o superior) basta. No se requieren A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas; tambien es viable la inferencia en CPU.
- Opciones de despliegue: el formato publicado es un predictor de AutoGluon cargado con `MultiModalPredictor.load()` (AutoGluon 1.6.1). No se proporcionan exportaciones a vLLM, llama.cpp, Ollama, TGI, ONNX ni TensorRT; esas vías requeririan exportar el backbone manualmente.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de tiempo de inferencia ni de entrenamiento (solo el tope de 180 s por trial de búsqueda).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables sobre `ArinRoths/StairvsNonStair_Dataset` para ningún otro modelo. La comparación se limita a datos estándar de arquitectura, que no implican rendimiento en esta tarea concreta:

| Modelo | Backbone | Parametros (cifra estandar de la arquitectura) | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | ResNet-34 | No declarado por el autor (ResNet-34 estandar: ~21,8 M) | Clasificacion binaria escaleras/no escaleras | `classroom-use` | HuggingFace, 0 descargas |
| Alternativa explorada | ResNet-18 | ~11,7 M | Idem, mismo pipeline AutoGluon | No aplica (no publicado) | No disponible: solo se nombra en la busqueda |
| Alternativa explorada | EfficientNet-B0 | ~5,3 M | Idem, mismo pipeline AutoGluon | No aplica (no publicado) | No disponible: solo se nombra en la busqueda |
| Alternativa explorada | MobileNetV3-Large | ~5,4 M | Idem, mismo pipeline AutoGluon | No aplica (no publicado) | No disponible: solo se nombra en la busqueda |

Los valores de parámetros de las filas alternativas son cifras publicadas de las arquitecturas originales, no mediciones sobre este dataset. No hay modelos comparables con resultados publicados sobre esta tarea.

## Limitaciones y advertencias

- Rendimiento cercano al azar: exactitud de validación cruzada de 0,444 ± 0,050 frente a un azar de 0,500 y una línea base mayoritaria de 0,400 en test. El modelo no demuestra capacidad predictiva fiable.
- Test estadísticamente irrelevante: la métrica de 0,600 procede de solo 5 fotografías, insuficiente para extraer conclusiones; el propio autor indica que por eso cita primero la cifra de validación cruzada.
- Dataset mínimo y monocámara: 27 fotografías originales tomadas por una sola persona. El modelo refleja esa cámara, esas localizaciones y esa iluminación concretas, y probablemente no generaliza a otros entornos.
- Sesgo de dominio y de clase: al no usarse aumento de datos (`augmentation=none`), la sensibilidad a cambios de encuadre, resolución o condiciones de luz es alta.
- Riesgo de falsos positivos y negativos en ambas clases: con F1 de 0,500 en `stairs`, el equilibrio entre precisión y exhaustividad es pobre.
- Licencia restrictiva: `license: other` con nombre `classroom-use`. No está autorizado el uso comercial. Cualquier uso fuera del ámbito docente debe consultarse con el autor.
- Licencia del dataset indeterminada: `ArinRoths/StairvsNonStair_Dataset` no declara licencia, por lo que la reutilización de los datos debe acordarse con su autora, ArinRoths.
- Sin uso en decisiones reales: el autor lo declara explícitamente como trabajo de curso no apto para ninguna decisión real. No debe emplearse en sistemas de seguridad, accesibilidad, navegación asistida ni control de robots en producción.
- Sin auditoría externa: las métricas están marcadas como no verificadas (`verified: false`) y el modelo acumula 0 descargas y 0 likes, por lo que no ha sido evaluado por terceros.
- Idiomas y contexto: no aplican, pero conviene recordar que no es un modelo de lenguaje y no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ypolatog/24679-hw2-stairs-autogluon
- Dataset de entrenamiento: https://huggingface.co/datasets/ArinRoths/StairvsNonStair_Dataset
- Resultados de busqueda web: las consultas realizadas devolvieron unicamente paginas de opinion sobre la marca de electrodomesticos Miele (Trustpilot, ComplaintsBoard, Better Business Bureau y la web oficial mieleusa.com). Ningun resultado es relevante para este modelo; no se han encontrado papers, blogs, repositorios ni demos asociados.
- No se dispone de enlace a paper, demo, repositorio de codigo ni blog oficial en la informacion proporcionada.
