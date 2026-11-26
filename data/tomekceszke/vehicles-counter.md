# tomekceszke/vehicles-counter

## Resumen
Vehicles Counter es un clasificador binario de imagenes (*coche* / *no coche*) desarrollado por tomekceszke, concebido como pieza central de un contador de vehiculos en tiempo real para una camara de calle fija. No es un modelo de lenguaje ni un detector de objetos generico: es una red neuronal de una sola capa oculta escrita desde cero en Octave/MATLAB, con retropropagacion implementada a mano y sin ningun framework de aprendizaje automatico. El modelo original se escribio en 2017 como primer ejercicio de red neuronal del autor tras el curso de Andrew Ng, y se ha refrescado en 2026 reproduciendo los mismos resultados sobre GNU Octave 11.3.

El modelo recibe un recorte de un carril de 120x40 pixeles, lo convierte a escala de grises, lo reduce a 20x60 (1200 pixeles) y decide fotograma a fotograma si hay un coche en ese recorte. La logica de conteo vive fuera de la red: se incrementa un contador cuando un fotograma clasificado como "coche" sucede a uno o mas fotogramas clasificados como "no coche". Su valor es fundamentalmente educativo y de referencia: 30.051 parametros en dos matrices, un gradiente derivado a mano y una pasada hacia delante de dos productos matriciales.

Es relevante ahora como ejemplo didactico completo del camino desde pixeles crudos hasta un contador funcional sin dependencias de framework, y como caso de estudio de las limitaciones de los modelos entrenados con pocos datos y una sola camara. No compite con detectores modernos tipo YOLO ni con clasificadores preentrenados: el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) de una capa oculta, 1200-25-1, activacion sigmoide |
| Parametros totales | 30.051 (Theta1: 25x1201 = 30.025; Theta2: 1x26 = 26) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada fija de 1200 pixeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; clasificador de imagenes) |
| Licencia | MIT |
| Formato de pesos | `.mat` (MATLAB 7, archivo `data/processed/model_v7.mat`); sin safetensors ni GGUF |

## Arquitectura y entrenamiento
La red es un MLP de tres capas con una unica capa oculta de 25 unidades. La entrada son 1200 intensidades de pixel (20x60 en escala de grises, rango 0-255, orden column-major) sin normalizacion. La primera matriz de pesos `Theta1` tiene forma 25x1201 (incluye columna de sesgo) y la segunda `Theta2` tiene forma 1x26 (incluye sesgo); ambas se aplican con activacion sigmoide. La salida `h` esta en (0,1) y el umbral de decision es 0,5: `h >= 0,5` se interpreta como "no coche" y `h < 0,5` como "coche" (convencion de etiquetas `1 = no coche`, `0 = coche`).

El entrenamiento se realizo en 2017 con coste de entropia cruzada y regularizacion L2 (`lambda = 0,01`), gradiente calculado mediante retropropagacion escrita a mano y optimizacion con `fmincg` (gradiente conjugado, C. E. Rasmussen, tal como se usa en el curso de Andrew Ng) durante 50 iteraciones. Los datos provienen del dataset `tomekceszke/vehicles-counter-frames`: 234 fotogramas de entrenamiento (117 de coche procedentes de 20 vehiculos y 117 de calzada vacia procedentes de solo 4 tramos temporales) y 182 de test (55 coches / 127 vacios, con 12 tramos de calzada vacia y condiciones de iluminacion no vistas en entrenamiento). No hay RLHF, DPO ni ajuste fino posterior; el refresco de 2026 reproduce el Stage 0 sin cambios sobre GNU Octave 11.3.

## Capacidades
- Clasificacion binaria de fotogramas: decide si un recorte de 20x60 pixeles en escala de grises contiene un coche o no.
- Conteo de vehiculos por transicion: la logica de `src/detect.m` cuenta un coche cuando un fotograma "coche" sigue a uno o mas fotogramas "no coche", evitando contar varias veces el mismo vehiculo.
- Ejecucion en Octave/MATLAB sin framework de ML: toda la red, el coste y el gradiente son legibles y auditables.
- Exportacion de pesos a formato `.mat` (MATLAB 7) para inferencia en Python con NumPy y SciPy.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues.
- No es un detector de objetos: no localiza vehiculos en la imagen, solo clasifica un recorte predefinido de un carril.

## Casos de uso
- Docencia de redes neuronales: permite recorrer en una sesion el forward pass, la entropia cruzada, la retropropagacion derivada a mano y la optimizacion con gradiente conjugado, con solo 30.051 parametros y dos matrices visibles.
- Prototipo de contador de trafico en una camara fija: capturando un recorte de un carril con VLC a varios fotogramas por segundo, el modelo clasifica cada fotograma y `detect.m` mantiene un contador incremental; adecuado para validar la idea antes de invertir en un detector preentrenado.
- Referencia base (baseline) para comparaciones: sirve como punto de partida minimo contra el que medir la mejora de un YOLO o un CNN preentrenado en la misma camara y el mismo recorte.
- Ejercicio de ingenieria de datos: el desequilibrio efectivo del dataset (117 fotogramas vacios de solo 4 tramos temporales) ilustra como el numero de ejemplos nominales enmascara una diversidad real mucho menor.
- Inferencia ligera en Python sin Octave: cargando `model_v7.mat` con `scipy.io.loadmat` y aplicando dos productos matriciales con NumPy, se puede integrar la clasificacion en un script de procesamiento por lotes de fotogramas.
- Demostracion de despliegue minimo: el flujo camara -> recorte -> red -> contador cabe en un equipo de bajos recursos, ya que la inferencia es un producto de 25x1201 y otro de 1x26 por fotograma.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (no verificados de forma independiente). Clase positiva = *coche*.

| Split | Fotogramas | Accuracy | Precision (coche) | Recall (coche) | F1 (coche) |
|---|---|---|---|---|---|
| test | 182 (55 coche / 127 no coche) | 0,9176 | 0,8030 | 0,9636 | 0,8760 |
| train (referencia) | 234 (117 / 117) | 0,9615 | 0,9576 | 0,9658 | 0,9617 |

Matriz de confusion en test: 53 coches detectados, 2 no detectados, 114 fotogramas vacios correctos y 13 fotogramas vacios clasificados erroneamente como coche. Casi todos los errores son falsas alarmas sobre calzada vacia.

## Requisitos de hardware
- VRAM estimada: practicamente nula; los pesos ocupan unos pocos kilobytes (30.051 parametros en coma flotante de doble precision, del orden de 240 KB en memoria).
- GPU recomendadas: no requiere GPU; la inferencia es un par de productos matriciales que se ejecutan en CPU en microsegundos.
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo nucleo o en una Raspberry Pi.
- Opciones de despliegue: GNU Octave (con el paquete `image`), MATLAB, o Python con NumPy y SciPy cargando `model_v7.mat`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma medida; por la dimension de las matrices, el coste por fotograma es despreciable frente a la captura y el preprocesado de imagen.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparables en la informacion proporcionada para modelos de la misma categoria (clasificadores binarios de recortes de trafico entrenados desde cero). Como referencia cualitativa, el propio autor senala que un CNN preentrenado o un detector tipo YOLO rendirian mucho mejor en la misma tarea, pero no se aportan cifras de esos sistemas en la informacion disponible.

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vehicles Counter | 30.051 | Recorte fijo 20x60 en grises | MIT | Hugging Face + GitHub |
| CNN preentrenado (generico) | no disponible | no disponible | no disponible | no disponible |
| Detector tipo YOLO (generico) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No es un detector de vehiculos generico: conoce una sola camara, un solo recorte y un solo angulo de vision, y aprendio de unos pocos cientos de fotogramas.
- Sesgo de datos: los 117 fotogramas de calzada vacia del entrenamiento provienen de solo 4 tramos temporales, por lo que la diversidad real es mucho menor que el numero de archivos.
- Tasa alta de falsas alarmas: 13 de 127 fotogramas vacios de test se clasificaron como coche (precision de la clase coche de 0,8030), lo que puede inflar el conteo en produccion.
- Sensibilidad a la iluminacion: el test incluye condiciones de luz no vistas en entrenamiento, lo que explica parte del error.
- Sin normalizacion de pixeles de entrada: cambios de exposicion o de camara alteran la distribucion de entrada sin mecanismo de calibracion.
- No soporta otras tareas: no hay vision general, lenguaje, audio ni tool calling.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no esta pensado ni validado para produccion; el autor lo describe explicitamente como prueba de concepto educativa.
- Resultados no verificados de forma independiente: las metricas proceden de la model card del autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tomekceszke/vehicles-counter
- Dataset: https://huggingface.co/datasets/tomekceszke/vehicles-counter-frames
- Codigo en GitHub: https://github.com/tomekceszke/vehicles-counter
- Notas del refresco 2026: https://github.com/tomekceszke/vehicles-counter/blob/master/notes/refresh-2026.md
- Script de entrenamiento: https://github.com/tomekceszke/vehicles-counter/blob/master/src/learn.m
- Retropropagacion: https://github.com/tomekceszke/vehicles-counter/blob/master/src/lib/nn.m
- Scripts legacy de captura con VLC: https://github.com/tomekceszke/vehicles-counter/tree/master/tools/legacy
- Video de prueba de concepto: https://youtu.be/DgE2UIsc_hw
