# yennik16/2026-24679-switch-vs-switch2-finetuned

## Resumen

Este repositorio contiene un clasificador binario de imagenes desarrollado por el usuario yennik16 en el marco de la asignatura *Designing with AI* (Homework 2, dedicada a AutoML para redes neuronales). El modelo distingue entre dos consolas Nintendo: la clase 0 corresponde a una Switch OLED edicion Tears of the Kingdom y la clase 1 a una Switch 2. Se trata, por tanto, de un ejercicio de transferencia de aprendizaje sobre un conjunto de fotografias propio y muy reducido, no de un identificador general de modelos de consola.

Tecnicamente es un backbone `timm` (finalmente ResNet-18) ajustado con `AutoGluon MultiModalPredictor` en su rama de imagen (`timm_image`), con todos los pesos actualizados y no congelados. La busqueda de hiperparametros fue una busqueda aleatoria presupuestada de 8 ensayos sobre arquitectura, optimizador, tasa de aprendizaje, decaimiento de pesos, decaimiento de tasa por capas, numero de epocas y conjunto de aumento de datos. La entrada esperada es una imagen RGB de 224 x 224 obtenida mediante un preprocesado concreto (orientacion EXIF, redimensionado preservando aspecto y relleno con gris 128).

Su relevancia es principalmente docente y metodologica. El propio autor advierte con honestidad de que el resultado de 5/5 en el conjunto de test no debe interpretarse como capacidad real de discriminacion: el test son 5 fotografias de las mismas dos consolas fisicas vistas en poses ya conocidas. Un experimento especifico de retencion por punto de vista reduce el rendimiento a 0,500 de exactitud balanceada en el pliegue mayor, lo que convierte a esta ficha en un ejemplo util de por que hay que reportar protocolos de evaluacion y no solo cifras de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (backbone `timm`) ajustado, envuelto en AutoGluon `MultiModalPredictor` con `model.names=["timm_image"]` |
| Parametros totales | Aproximadamente 11,7 M (cifra estandar de ResNet-18; no confirmada de forma explicita en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 224 x 224 RGB |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes; no hay datos de idioma) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (repositorio gestionado por AutoGluon; tamano del repo 0,1 GB) |
| Tarea | Clasificacion binaria de imagenes (`pipeline_tag: image-classification`) |
| Clases | 0 = Switch OLED (edicion TOTK), 1 = Switch 2 |
| Resolucion de entrada | 224 x 224 RGB, con relleno de (128, 128, 128) |
| Framework de inferencia | `autogluon.multimodal==1.6.1` (torch 2.11.0+cu128 en entrenamiento) |
| Dataset de entrenamiento | `pakiino/2026-24679-switch-image-hw1` (CC-BY-4.0) |
| Metricas declaradas | accuracy, f1 |

## Arquitectura y entrenamiento

El modelo es un clasificador convolucional clasico, no un transformer multimodal pese a usar AutoGluon MultiModalPredictor: la configuracion restringe explicitamente las arquitecturas a `model.names=["timm_image"]`, de modo que solo entra en juego la rama de imagen. El backbone ganador de la busqueda fue `resnet18`, elegido frente a `efficientnet_b0` y `mobilenetv3_small_100`. Todos los pesos se ajustaron contra las fotografias del conjunto, sin congelar el extractor. El preprocesado previo lo aplica el propio dataset (orientacion EXIF, conversion a RGB, redimensionado con preservacion de aspecto y relleno hasta 224 x 224 con gris 128); despues, AutoGluon anade las transformaciones de `timm` para `resnet18`, incluyendo su propio redimensionado, recorte y normalizacion ImageNet. En inferencia no se aplica aumento de datos.

Los datos son el punto debil del experimento. El conjunto tiene 374 filas de entrenamiento, pero solo 22 fotografias originales; las 352 restantes son variantes offline generadas por aumento, cuatro por metodo, sin apilar transformaciones. Los metodos usados son `brightness` (factor 0,4-0,7 o 1,4-2,0), `contrast` (factor 0,35-0,65 o 1,5-2,2), `rotation` (15-30 grados en ambos sentidos sobre lienzo fijo) y `blur` (Gaussiano de radio 2,0-4,5 px). Solo `blur`, `brightness`, `contrast` y `rotation` entraron en la configuracion final; la eleccion del subconjunto de aumentos fue un eje mas de la busqueda (`aug_set` en none / photometric / all). La particion se hizo con estratificacion por clase antes de crear cualquier variante, y validacion y test contienen unicamente padres sin aumentar, sin cruzar un mismo origen entre particiones. Los tamanos finales son 374 filas de entrenamiento, 5 de validacion y 5 de test.

La busqueda aleatoria consto de 8 ensayos con semilla 24679 y exploraba `checkpoint_name`, `optim_type` (adamw/sgd), `optim.lr`, `optim.weight_decay`, `optim.lr_decay` (1,0 / 0,9 / 0,8), `optim.max_epochs` (20 / 30 / 40) y `aug_set`. Un detalle metodologico relevante: las tasas de aprendizaje se muestrearon de forma condicional al optimizador (1e-5-3e-4 para AdamW y 1e-3-3e-2 para SGD), porque un rango unico hacia colapsar todos los ensayos con SGD en un predictor de clase constante. La configuracion ganadora usa lr = 6,835e-03, lo que cae dentro del rango de SGD. La seleccion se hizo con validacion cruzada de 3 pliegues sobre las 22 fotografias originales, eliminando de cada pliegue todos los descendientes aumentados de la fotografia retenida; el *early stopping* uso `optim.patience = 8` y el ajuste final tuvo un limite de 600 segundos. El entrenamiento se ejecuto en una Tesla T4.

## Capacidades

- Clasificacion binaria de imagenes: dada una fotografia preprocesada segun el pipeline descrito, devuelve la clase 0 (Switch OLED) o la clase 1 (Switch 2).
- Transferencia de aprendizaje efectiva sobre un conjunto minimo: parte de pesos ImageNet y se ajusta por completo con 374 filas derivadas de 22 originales.
- Robustez parcial a perturbaciones fotometricas y geometricas aprendidas durante el entrenamiento: cambios moderados de brillo, contraste, desenfoque Gaussiano y rotaciones de 15 a 30 grados.
- Inferencia reproducible: semilla 24679 fijada para particiones, muestreo de busqueda y `fit`.
- Integracion con el ecosistema AutoGluon: se invoca como `MultiModalPredictor` pasando una columna `image` con la ruta del fichero.

No dispone de las siguientes capacidades, por la naturaleza del modelo:

- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision general, audio ni modo de razonamiento.
- No genera texto: no es un modelo de lenguaje.
- No detecta ni localiza objetos (es clasificacion de imagen completa, no deteccion).

## Casos de uso

- Material docente de AutoML y transferencia de aprendizaje: el repositorio documenta de forma inusualmente detallada el espacio de busqueda, el esquema de validacion y los modos de fallo, lo que lo convierte en un caso de estudio util para explicar por que la exactitud en un test de 5 imagenes no es evidencia de generalizacion.
- Baseline interno para tareas de clasificacion de producto: sirve como referencia rapida y barata (ResNet-18 a 224 x 224) antes de invertir en modelos mayores o en un detector especifico, siempre que se reentrene con datos propios.
- Prototipo de verificacion de articulo en comercio de segunda mano: con reentrenamiento sobre fotografias de catalogo y multiples unidades fisicas, la misma receta (timm + AutoGluon) podria comprobar si la foto de un anuncio corresponde al modelo declarado.
- Triaje y preetiquetado en un pipeline de anotacion: al ser un modelo diminuto, puede ejecutarse en CPU y usarse para proponer una etiqueta inicial que un anotador humano revisa, reduciendo el coste de etiquetado.
- Investigacion sobre el efecto del aumento de datos: la configuracion permite comparar `aug_set` none / photometric / all y medir como el aumento offline afecta a la generalizacion frente a cambios de punto de vista, que es precisamente donde el modelo falla (0,500 de exactitud balanceada en el pliegue mayor del experimento de retencion por vista).
- Prueba de concepto de despliegue ligero: al ocupar pocos cientos de megabytes, es adecuado para validar un flujo extremo a extremo (preprocesado, inferencia, umbral de decision) en entornos sin GPU.
- Demostracion de busqueda de hiperparametros condicionada por optimizador: el hallazgo de que SGD necesita rangos de tasa de aprendizaje uno o dos ordenes de magnitud mayores que AdamW es un ejemplo reutilizable en cursos y talleres de AutoML.

En todos los casos anteriores, el uso realista exige reentrenar con un conjunto propio, diverso en unidades fisicas, iluminacion, fondo y angulos. El modelo publicado no es apto para produccion tal cual.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los siguientes. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un clasificador de imagenes.

| Metrica | Conjunto | Resultado |
|---|---|---|
| Accuracy | Test (5 fotografias de las mismas dos consolas) | 5/5 = 1,000 |
| Balanced accuracy | Experimento de retencion por punto de vista, pliegue mayor | 0,500 |
| F1 | Declarada como metrica en la model card | Valor numerico no disponible |
| Tamano de entrenamiento | Train | 374 filas (22 originales + 352 variantes aumentadas) |
| Tamano de validacion | Validacion | 5 imagenes |
| Tamano de test | Test | 5 imagenes |

El propio autor advierte de que el 5/5 no debe leerse como evidencia de capacidad discriminativa: el test contiene fotografias de las mismas dos consolas fisicas en poses ya vistas durante el entrenamiento. La caida a 0,500 de exactitud balanceada cuando cambia el angulo de camara es el dato mas informativo sobre el rendimiento real del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (los pesos de ResNet-18 ocupan del orden de 47 MB y las activaciones a 224 x 224 son pequenas). Estimacion a partir de la arquitectura; no confirmada en la model card.
- GPU de entrenamiento documentada: Tesla T4, con `torch 2.11.0+cu128`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. La T4 es suficiente para el ajuste completo y para la busqueda de 8 ensayos. Para reentrenamientos con conjuntos mayores, una RTX 3060/4060 o superior acelera el ciclo de busqueda.
- Compatibilidad con GPU de consumo: si. Cabe holgadamente en GTX 1650, RTX 2060, RTX 3060, RTX 4060 y superiores. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: `AutoGluon MultiModalPredictor` es la via documentada (cargar el predictor y llamar a `predict` con una columna `image` que contenga la ruta del fichero). La exportacion a ONNX, TorchScript o formatos tipo GGUF no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato temporal es el limite de 600 segundos aplicado al `fit` final sobre Tesla T4, con paciencia de 8 comprobaciones de validacion sin mejora.
- Tamano del repositorio: 0,1 GB, lo que facilita el despliegue en entornos con almacenamiento limitado.
- Requisito de preprocesado en produccion: hay que replicar exactamente el pipeline (orientacion EXIF, RGB, redimensionado con preservacion de aspecto y relleno a 224 x 224 con gris 128). Cualquier relleno distinto o una imagen sin rellenar queda fuera de distribucion.

## Comparativa con modelos similares

Los tres backbones evaluados en la busqueda son directamente comparables, ya que compitieron en el mismo espacio de hiperparametros sobre los mismos datos. Solo se conoce con certeza la eleccion final; el rendimiento de los descartados no se publica.

| Modelo | Arquitectura | Parametros | Entrada | Estado | Licencia |
|---|---|---|---|---|---|
| Este modelo | ResNet-18 ajustado con AutoGluon | Aproximadamente 11,7 M (cifra estandar, no confirmada) | 224 x 224 RGB | Publicado en HuggingFace | cc-by-4.0 |
| Candidato descartado en la busqueda | EfficientNet-B0 | Aproximadamente 5,3 M (cifra estandar, no confirmada) | 224 x 224 RGB (segun configuracion de timm) | No seleccionado | No disponible |
| Candidato descartado en la busqueda | MobileNetV3-Small 100 | Aproximadamente 2,5 M (cifra estandar, no confirmada) | 224 x 224 RGB (segun configuracion de timm) | No seleccionado | No disponible |
| Alternativa generica | Clasificador zero-shot tipo CLIP | No disponible | No disponible | No evaluado en esta informacion | No disponible |

No se dispone de datos de rendimiento de los modelos alternativos ni de comparaciones con clasificadores de proposito general, por lo que la comparativa se limita a la configuracion de la busqueda.

## Limitaciones y advertencias

- Sobreajuste severo por diseno: 374 filas de entrenamiento proceden de solo 22 fotografias originales. El modelo aprende las poses, la iluminacion y el fondo concretos de esas 22 imagenes.
- Test no representativo: 5 fotografias de las mismas dos consolas fisicas, en poses ya vistas. El 5/5 no es evidencia de generalizacion.
- Caida drastica ante cambios de punto de vista: el experimento de retencion por vista baja a 0,500 de exactitud balanceada en el pliegue mayor, es decir, practicamente azar.
- Sin diversidad de unidades fisicas: solo se fotografio una Switch OLED y una Switch 2. El modelo puede aprender rasgos de esos dos ejemplares concretos (arañazos, reflejos, fondo) en lugar de rasgos del modelo comercial.
- Sensibilidad al preprocesado: cambiar el valor de relleno, omitir el relleno o no aplicar la orientacion EXIF sitúa la entrada fuera de distribucion.
- Falso sentido de seguridad en umbrales: al ser un clasificador binario con dos clases muy correlacionadas visualmente, no hay informacion publicada sobre calibracion de probabilidades ni sobre curvas de decision.
- Sesgos conocidos: no se documenta ningun analisis de sesgo por iluminacion, fondo, genero del fotografo o dispositivo de captura. La unica fuente de variabilidad cubierta es el aumento sintetico aplicado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de prediccion confiada e incorrecta sobre imagenes fuera de la distribucion de entrenamiento.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribucion, pero el dataset subyacente pertenece a otro autor (`pakiino`) y tambien es CC-BY-4.0; en un uso derivado hay que respetar la atribucion de ambas partes. Al proceder de una practica de curso, no se ofrece ninguna garantia.
- Advertencia de produccion: no usar este modelo en un sistema real de identificacion de producto ni para decisiones automatizadas sobre anuncios o inventario. Su unico uso defendible es docente o como punto de partida reentrenado.
- Reproducibilidad limitada a la semilla 24679: el autor fija la semilla en todas las etapas, pero no publica el tiempo total de entrenamiento ni el hardware exacto por ensayo mas alla de la Tesla T4.
- Uso de datos de terceros: el conjunto fue fotografiado por un companero de clase y no por el autor del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennik16/2026-24679-switch-vs-switch2-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/pakiino/2026-24679-switch-image-hw1
- Paper o memoria tecnica asociada: no disponible
- Repositorio de codigo: no disponible
- Demo en linea: no disponible
- Documentacion de AutoGluon MultiModalPredictor: no disponible en la informacion proporcionada
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (contenido bancario no pertinente), por lo que no se han podido incorporar enlaces adicionales.
