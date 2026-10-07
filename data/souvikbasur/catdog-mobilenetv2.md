# Souvikbasur/catdog-mobilenetv2

## Resumen

Cat vs Dog Classifier (MobileNetV2) es un clasificador binario de imagenes publicado por el usuario Souvikbasur (Souvik, IEDC Lab, IEM Kolkata) en HuggingFace. El modelo distingue entre gatos y perros a partir de fotografias RGB de 160 x 160 pixeles y devuelve una unica probabilidad: valores superiores a 0,5 se interpretan como perro y valores inferiores como gato. No es un modelo generativo ni un modelo de lenguaje: es una red convolucional de vision con una cabeza de clasificacion de una sola neurona.

Tecnicamente se trata de un caso de aprendizaje por transferencia sobre MobileNetV2 preentrenada en ImageNet. La base convolucional permanece congelada (2.257.984 parametros no entrenables) y solo se entrena la cabeza clasificadora, que aporta 1.281 parametros. El modelo completo tiene 2.259.265 parametros (8,62 MB) y se distribuye como un unico fichero Keras de 9,6 MB, lo que lo situa en la categoria de modelos ultraligeros aptos para inferencia en CPU o en dispositivo.

Su relevancia es limitada y muy especifica: sirve como referencia reproducible de un flujo completo de transfer learning sobre un dataset publico (Microsoft Cats and Dogs), como componente auxiliar en pipelines de clasificacion de imagenes y como ejemplo didactico. Con 7 descargas y 0 likes en el momento de la consulta, no cuenta con validacion por parte de la comunidad. La licencia no esta declarada, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con convoluciones separables en profundidad y bloques residuales invertidos) con cabeza GlobalAveragePooling2D -> Dropout(0.2) -> Dense(1, sigmoid) |
| Parametros totales | 2.259.265 (8,62 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de vision fija de 160 x 160 x 3) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el modelo se distribuye en coma flotante) |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | fichero nativo de Keras (`catdog_model.keras`, 9,6 MB); no se ofrecen safetensors, GGUF, ONNX ni TFLite |

## Arquitectura y entrenamiento

La arquitectura combina una base MobileNetV2 preentrenada con pesos de ImageNet, mantenida congelada, y una cabeza minima: agrupacion global promedio sobre los 1280 canales de salida de la base, una capa Dropout con tasa 0,2 y una capa densa de una unidad con activacion sigmoide. Esa cabeza explica los 1281 parametros entrenables (1280 pesos + 1 sesgo). La entrada es de 160 x 160 x 3 en pixeles crudos en rango 0-255, con la normalizacion integrada dentro del propio modelo, de modo que pasar imagenes ya escaladas externamente alteraria el resultado.

El entrenamiento se realizo en Google Colab sobre una GPU T4. El dataset de partida es Microsoft Cats and Dogs (Kaggle Dogs vs Cats) con 25.002 imagenes; se eliminaron 1.590 ficheros corruptos, quedando 23.412 imagenes (11.742 gatos y 11.670 perros) divididas 80/20 con semilla 42: 18.728 para entrenamiento y 4.682 para validacion. Se uso el optimizador Adam con tasa de aprendizaje 0,001, perdida de entropia cruzada binaria, tamano de lote 32 (586 pasos por epoca) y 5 epocas. El aumento de datos consistio en volteo horizontal aleatorio, rotacion del 10 % y zoom del 15 %. Se configuraron EarlyStopping (paciencia 4, restauracion del mejor peso) y ReduceLROnPlateau, que no llego a activarse. El coste declarado es de aproximadamente 28-42 segundos por epoca en T4. No hay evidencia de ajuste fino posterior, RLHF ni DPO: es un entrenamiento supervisado clasico de una sola fase sobre la cabeza.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: gato (0) y perro (1), mediante una probabilidad escalar en el rango [0, 1].
- Procesamiento de imagenes RGB redimensionadas a 160 x 160 pixeles, con escalado interno de los valores de pixel.
- Inferencia ultraligera: el modelo completo ocupa 8,62 MB de parametros, lo que permite ejecutarlo en CPU sin aceleracion dedicada.
- Extraccion de caracteristicas visuales de bajo nivel a traves de la base MobileNetV2 congelada (utilizable como backbone si se recorta la cabeza).
- Soporte de tool calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades multilingues: no aplica.
- Capacidad especial de pensamiento, vision general o audio: no; la unica tarea soportada es la clasificacion gato/perro.
- Salida limitada: no genera texto, no localiza objetos ni produce etiquetas multiples.

## Casos de uso

- Organizacion automatica de bibliotecas fotograficas personales: recorrer un directorio de imagenes, redimensionar a 160 x 160 y separar las fotos en dos carpetas segun la probabilidad devuelta, utiles para usuarios con grandes volumenes de fotos de mascotas.
- Clasificacion previa en refugios y protectoras de animales: etiquetar lotes de fotografias recibidas de adoptantes o voluntarios para asignarlas a las fichas de gato o perro antes de la revision manual.
- Etiquetado asistido de datasets: preanotar imagenes en un flujo de anotacion humana (active learning), de modo que el anotador solo revise los casos con probabilidad cercana a 0,5, que son los ambiguos.
- Filtrado en tiempo real en aplicaciones de camara o escritorio: al ser un modelo de 8,62 MB, puede integrarse en una app local para descartar o marcar fotogramas que contengan la mascota objetivo sin enviar imagenes a la nube.
- Docencia y material de referencia: ejemplo completo y reproducible de transfer learning con Keras, con dataset, hiperparametros, resultados por epoca y codigo de uso publicados en la propia model card.
- Componente auxiliar en pipelines de vision mayores: actuar como primera etapa de un sistema de dos niveles que solo invoque un clasificador de razas o un detector mas costoso cuando la entrada sea efectivamente un perro.
- Prototipado rapido en demos tipo Gradio o Streamlit: el modelo se carga con `keras.models.load_model` en pocas lineas y no requiere GPU, lo que reduce el coste de montar una demo publica.
- Verificacion de calidad de imagen en capturas automatizadas: detectar si una foto enviada por un usuario contiene un animal de las dos clases soportadas antes de aceptarla en un formulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un clasificador binario de imagenes. Los unicos datos de rendimiento disponibles son las metricas de entrenamiento y validacion declaradas por el autor:

| Epoca | Precision entrenamiento | Perdida entrenamiento | Precision validacion | Perdida validacion |
|---|---|---|---|---|
| 1 | 94,25 % | 0,1380 | 97,95 % | 0,0519 |
| 2 | 96,45 % | 0,0925 | 98,08 % | 0,0481 |
| 3 | 96,54 % | 0,0902 | 98,16 % | 0,0469 |
| 4 | 96,75 % | 0,0842 | 98,31 % | 0,0451 |
| 5 | 96,76 % | 0,0849 | 98,23 % | 0,0463 |

Precision final de validacion declarada: 98,31 % (perdida 0,0451, mejor epoca 4 con restauracion de pesos). El propio autor advierte de que la precision de validacion supera a la de entrenamiento porque el aumento de datos y el dropout solo actuan durante el entrenamiento, y de que la misma particion de validacion se uso para seleccionar la mejor epoca, por lo que la cifra es ligeramente optimista. No existe conjunto de test independiente, de modo que no hay una estimacion limpia de generalizacion.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en cualquier configuracion razonable. Los pesos en coma flotante de 32 bits ocupan aproximadamente 9 MB; el grueso del consumo proviene de las activaciones intermedias de una entrada de 160 x 160.
- GPU recomendadas: cualquiera. El modelo se entreno en una NVIDIA T4 y la inferencia funciona igualmente en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, en todas las GPU de consumo modernas e incluso en graficas integradas. Tambien es viable en CPU exclusivamente.
- Opciones de despliegue: TensorFlow/Keras (via `keras.models.load_model`), TensorFlow Serving y entornos de HuggingFace con backend Keras. TensorFlow Lite y ONNX serian posibles mediante conversion, pero no se distribuyen ficheros convertidos. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no publicados. A partir de los tiempos de entrenamiento declarados (28-42 s por epoca sobre 586 pasos de lote 32 con 18.728 imagenes), se puede estimar de forma aproximada un coste del orden de 1,5 a 2,2 ms por imagen para un paso completo de ida y vuelta en una T4; la inferencia pura seria sustancialmente mas rapida. Esta estimacion es derivada, no una medicion publicada por el autor.
- Requisitos de entrenamiento reproducibles: una GPU T4 de Colab es suficiente; 5 epocas sobre 18.728 imagenes con la base congelada suponen unos pocos minutos de computo.

## Comparativa con modelos similares

No se publican comparaciones con otros modelos en la informacion disponible. La siguiente tabla recoge la referencia del propio modelo frente a arquitecturas habituales para esta misma tarea. Los datos de las filas marcadas como externas no proceden de la model card y son valores aproximados de referencia de cada arquitectura, no mediciones sobre el dataset Cats vs Dogs.

| Modelo | Parametros | Entrada | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| catdog-mobilenetv2 (este modelo) | 2.259.265 (1.281 entrenables) | 160 x 160 x 3 | 98,31 % de precision de validacion declarada | no disponible | HuggingFace, formato Keras |
| MobileNetV2 con cabeza ImageNet-1k (referencia externa) | aprox. 3,5 M | 224 x 224 x 3 | no disponible | Apache-2.0 en Keras Applications (dato externo) | TensorFlow/Keras, TorchVision |
| ResNet-50 (referencia externa) | aprox. 25,6 M | 224 x 224 x 3 | no disponible | no disponible | multiples frameworks |
| EfficientNet-B0 (referencia externa) | aprox. 5,3 M | 224 x 224 x 3 | no disponible | no disponible | multiples frameworks |
| ViT-Base/16 (referencia externa) | aprox. 86 M | 224 x 224 x 3 | no disponible | no disponible | multiples frameworks |

No existe ningun benchmark comparativo publicado que permita afirmar que este modelo supera o es superado por las alternativas en la tarea gato/perro con el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Tarea unica: solo distingue gato de perro. Cualquier otra imagen (un coche, una persona, un paisaje) se fuerza igualmente a una de las dos clases, sin opcion de "desconocido".
- Sin licencia declarada: no se puede asumir permiso de uso comercial, redistribucion ni modificacion. Es un riesgo legal directo para produccion.
- Metricas posiblemente optimistas: el conjunto de validacion se uso tanto para monitorizar como para seleccionar la mejor epoca mediante EarlyStopping, y no se reservo un conjunto de test independiente. El 98,31 % no debe interpretarse como rendimiento esperado en datos nuevos.
- Dominio estrecho: entrenado con fotografias JPEG del dataset Microsoft Cats and Dogs. Angulos inusuales, ilustraciones, dibujos, imagenes con poca luz o recortes muy ajustados pueden degradar la precision, tal y como advierte el propio autor.
- Sesgos no documentados: no se analiza la composicion por raza, origen geografico ni condiciones de iluminacion del dataset original. Un desequilibrio de razas o de condiciones de captura puede traducirse en sesgos de clasificacion no medidos.
- Sin cuantizaciones ni formatos portables: no hay GGUF, ONNX ni TFLite publicados, por lo que el despliegue en movil o en el borde exige convertir el modelo y validar que la conversion no altera las predicciones.
- Dependencia de la version de Keras: el fichero `.keras` requiere una version de Keras/TensorFlow compatible con el formato nativo de Keras 3.
- Entrada sensible al preprocesado: el escalado esta dentro del modelo. Alimentarlo con imagenes ya normalizadas a [0, 1] o con otra resolucion distinta de 160 x 160 produce salidas incorrectas.
- Validacion de la comunidad practicamente nula: 7 descargas y 0 likes. No hay informes de terceros ni auditorias independientes.
- Metadatos inconsistentes: el repositorio declara un tamano de 0,0 GB mientras que el fichero indicado ocupa 9,6 MB, lo que sugiere que la informacion del repo no esta actualizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Souvikbasur/catdog-mobilenetv2
- Paper: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- Blog o articulo tecnico del autor: no disponible
- Dataset de origen (Microsoft Cats and Dogs / Kaggle Dogs vs Cats): no se incluye enlace directo en la model card
- Fichero de pesos: https://huggingface.co/Souvikbasur/catdog-mobilenetv2/blob/main/catdog_model.keras
