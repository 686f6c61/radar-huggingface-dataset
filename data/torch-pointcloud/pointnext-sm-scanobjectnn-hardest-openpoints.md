# torch-pointcloud/pointnext-sm.scanobjectnn-hardest.openpoints

## Resumen

PointNeXt-SM es un modelo de clasificación de nubes de puntos 3D desarrollado originalmente por Guocheng Qian et al. (KAUST) y convertido al ecosistema `torch-pointcloud` por Arthur Dujardin. Se trata de una revisión de PointNet++ que incorpora bloques residuales invertidos y estrategias de escalado mejoradas, con solo 1,4 millones de parámetros. Este checkpoint concreto está entrenado sobre la variante más difícil de ScanObjectNN (PB_T50_RS), un dataset de objetos 3D escaneados en condiciones reales con perturbaciones, y clasifica 15 categorías.

El modelo resuelve la tarea de clasificación de nubes de puntos: dada una nube de puntos 3D (coordenadas XYZ más un canal adicional), predice a qué categoría de objeto pertenece. Es relevante porque demuestra que arquitecturas ligeras bien diseñadas pueden alcanzar precisión competitiva (88,17 % de accuracy global) en datos del mundo real, sin necesidad de modelos masivos. Su tamaño reducido (1,4 M de parámetros) lo hace especialmente atractivo para despliegue en entornos con recursos limitados, robótica o sistemas embebidos.

La ficha describe un modelo puramente de visión 3D, no un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Su utilidad está en pipelines de percepción 3D, extracción de características geométricas y clasificación de objetos escaneados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado con bloques residuales invertidos) |
| Parametros totales | 1.376.815 (1,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de vision 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 |
| Clases de salida | 15 |
| Dimension de caracteristicas | 512 |
| Dataset de entrenamiento | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

PointNeXt revisita PointNet++ introduciendo dos cambios principales: estrategias de entrenamiento mejoradas y estrategias de escalado de la arquitectura. El modelo usa bloques residuales invertidos (inspirados en MobileNetV2) en las capas de abstracción de conjuntos, junto con conexiones residuales que facilitan el entrenamiento de redes más profundas. La variante "SM" (small) es la configuración más ligera de la familia, con 1,4 M de parámetros, 4 canales de entrada y una representación final de 512 dimensiones.

El checkpoint está entrenado sobre ScanObjectNN en su configuración PB_T50_RS, que es la variante más difícil del benchmark: objetos escaneados de escenas reales con perturbaciones (traslación, rotación y escala), 15 clases y aproximadamente 15 000 muestras. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens/puntos de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de aumento específicas más allá de las estándar del benchmark. El modelo fue convertido desde el repositorio oficial `guochengqian/PointNeXt` (también MIT) al formato de la librería `torch-pointcloud`.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos (ScanObjectNN).
- Extracción de características geométricas: `forward_features` devuelve embeddings de 512 dimensiones por nube de puntos.
- Soporte para clasificador configurable: `reset_classifier(num_classes=0)` permite usar el modelo como extractor puro de features.
- Procesamiento de nubes de puntos con número variable de puntos (el ejemplo de la model card usa 8192 puntos).
- Entrada de 4 canales (coordenadas XYZ más un canal adicional, típicamente normal o intensidad).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión 2D/imagen.
- No dispone de modo "thinking" ni capacidades de audio.

## Casos de uso

- Clasificación de objetos escaneados en robótica: un robot equipado con LiDAR o cámara de profundidad puede segmentar la escena y clasificar cada objeto detectado usando los logits del modelo, aprovechando su bajo coste computacional para inferencia en tiempo real a bordo.
- Extracción de embeddings para búsqueda de similitud 3D: usando `forward_features` se obtienen vectores de 512 dimensiones que permiten indexar objetos 3D en bases de datos vectoriales y recuperar geometrías similares en aplicaciones de e-commerce o catalogación de patrimonio.
- Preentrenamiento y fine-tuning en dominios específicos: al ser un checkpoint ligero con licencia MIT, sirve como inicialización para tareas de clasificación con menos clases (por ejemplo, piezas industriales) mediante `reset_classifier`.
- Control de calidad en manufactura: clasificar piezas escaneadas en la línea de producción para detectar categorías incorrectas o defectos geométricos, con inferencia en CPU o GPU de gama baja.
- Vehículos autónomos y ADAS: clasificación de objetos detectados por sensores LiDAR como paso previo a la planificación de trayectorias, beneficiándose del reducido consumo de memoria.
- Realidad aumentada y escaneo 3D móvil: identificación de objetos en tiempo real desde la nube de puntos generada por la cámara de un smartphone, con un modelo que cabe holgadamente en memoria móvil.
- Investigación en percepción 3D: baseline reproducible para comparar técnicas de aumento de datos, estrategias de escalado o nuevas arquitecturas sobre ScanObjectNN.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | Clasificacion de nubes de puntos | OA (accuracy global) | 88,17 |
| ScanObjectNN (PB_T50_RS) | Clasificacion de nubes de puntos | mAcc (accuracy media por clase) | 86,8 |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, frente a PointNet++ original u otras variantes de PointNeXt) más allá de estos dos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en precisión completa (1,4 M de parámetros, ~5,5 MB en FP32). El consumo dominante es el de las activaciones de la nube de puntos, no los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para ejecutarse incluso en CPU. GPU de gama alta (A100, H100) no aportan ventaja significativa frente a una RTX 4090 o una GPU integrada para un solo ejemplo.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) e incluso en dispositivos embebidos tipo Jetson Nano o Raspberry Pi con PyTorch.
- Opciones de despliegue: PyTorch nativo mediante la librería `torch-pointcloud`; exportación a TorchScript/ONNX no documentada en la información disponible. No aplican vLLM, llama.cpp, Ollama ni TGI (son para modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera latencia de milisegundos por nube de puntos en GPU y decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Dataset | OA (PB_T50_RS) | Licencia |
|---|---|---|---|---|---|
| PointNeXt-SM (este) | 1,4 M | nube de puntos (ej. 8192 puntos) | ScanObjectNN | 88,17 | MIT |
| PointNet++ (original) | no disponible en la informacion | nube de puntos | ScanObjectNN | no disponible en la informacion | MIT (implementacion original) |
| Otras variantes PointNeXt (S/B/L) | no disponible en la informacion | nube de puntos | ScanObjectNN | no disponible en la informacion | MIT |

No se dispone en la información proporcionada de cifras de rendimiento de PointNet++ ni de las variantes mayores de PointNeXt sobre PB_T50_RS, por lo que la comparativa cuantitativa queda limitada al resultado de este checkpoint. Cualitativamente, PointNeXt-SM es la variante más ligera de su familia y está pensada para escenarios donde el coste computacional es crítico.

## Limitaciones y advertencias

- Modelo de visión 3D, no de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.
- Entrenado exclusivamente en ScanObjectNN con 15 clases; su vocabulario de categorías es cerrado y no generaliza a clases no vistas sin fine-tuning.
- La variante PB_T50_RS incluye perturbaciones severas; el rendimiento en nubes de puntos limpias o sintéticas puede diferir del reportado.
- Riesgo de sobreajuste al dominio de escaneos de interior de ScanObjectNN; el rendimiento en escenas exteriores, LiDAR vehicular o datos industriales no está validado.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No hay información sobre sesgos geométricos, demográficos ni de otro tipo; al ser un modelo de objetos, los sesgos relevantes serían de representación de categorías en el dataset.
- Licencia MIT: permite uso comercial, modificación y redistribución, manteniendo el aviso de copyright. Verificar las licencias del dataset ScanObjectNN para usos derivados.
- No se documentan limitaciones de contexto porque la noción de ventana de contexto no aplica; el límite práctico es el número de puntos que el modelo puede procesar en memoria.
- Para producción, conviene validar el modelo en el dominio objetivo y considerar fine-tuning con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointnext-sm.scanobjectnn-hardest.openpoints
- Paper PointNeXt: https://arxiv.org/abs/2206.04670
- Repositorio oficial PointNeXt: https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
- Paper ScanObjectNN: https://arxiv.org/abs/1904.01234 (Revisiting Point Cloud Classification, ICCV 2019; enlace no incluido en la informacion proporcionada, verificar)
