# WillNuyen228/auramask-nothing

## Resumen

auramask-nothing es un modelo de imagen a imagen (image-to-image) publicado en Hugging Face por el usuario WillNuyen228 bajo licencia GPL-3.0. Se trata de un filtro adversarial con objetivos estéticos y de calidad: según la model card, la consigna de diseño es "Keep everything as is. Just also adversarial", es decir, preservar el contenido de la imagen de entrada introduciendo una perturbación adversarial controlada. El modelo se distribuye en formato Keras/TFLite y su repositorio ocupa 0.0 GB, lo que sugiere pesos de reducido tamano o un repositorio incompleto.

Tecnicamente es una red convolucional de tipo encoder-decoder con cinco bloques (D=[1,1,1,1,1], E=[1,1,2,3,5], filtros [16,32,64,128,128], activación ReLU, regularización L2 y sin batch normalization), entrenada sobre imágenes de 256x256 píxeles. Deriva de los modelos de reconocimiento facial logasja/ArcFace y logasja/VGGFace, además de vnet, y se ha ajustado sobre el dataset logasja/FDF.

Su relevancia es acotada y muy específica: no es un modelo generativo de propósito general ni un LLM, sino una herramienta de investigación orientada a estudiar perturbaciones adversariales en pipelines de reconocimiento facial y métricas de calidad de imagen (TopIQ). No hay información pública sobre benchmarks, idiomas ni datos de entrenamiento más allá de la configuración expuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN encoder-decoder convolucional (Keras), 5 bloques, sin batch norm |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 256x256 px) |
| Tipos de cuantizacion | no disponible (formato TFLite y Keras; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | Keras / TFLite (librería declarada: keras) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional encoder-decoder definida en Keras con la siguiente configuración: profundidades de decoder D=[1,1,1,1,1], profundidades de encoder E=[1,1,2,3,5], 16/32/64/128/128 filtros por bloque, activación ReLU, regularización L2 en los kernels, sin batch normalization, 3 etiquetas de salida y activación de salida nula (lineal). La entrada es de 256x256 píxeles.

El entrenamiento se realizó durante 10 épocas con batch de 16, optimizador Adam (learning rate ~1e-4, clipnorm 1), sin mixed precision, semilla "CAHUUSPUUOTX" y partición 90/10 entrenamiento/prueba. La función de pérdida combina varios términos: TopIQ con referencia completa (peso 0.9, rango ~0-1), MSE (peso 0.1) y cuatro pérdidas de similitud coseno sobre embeddings faciales con umbrales específicos: ArcFace (umbral 0.68, peso 0.1), DeepID (0.015, peso 0.1), Facenet (0.4, peso 0.1) y VGG-Face (0.68, peso 0.1). El parámetro epsilon es 0.03 y alpha 0.0001, coherentes con un esquema de perturbación adversarial acotada. El dataset declarado es logasja/FDF. Los logs de entrenamiento están publicados en Weights & Biases (run y3ftvu3l).

## Capacidades

- Transformación imagen a imagen a 256x256 píxeles: recibe una imagen y devuelve una versión modificada.
- Preservación de identidad facial: las pérdidas sobre ArcFace, DeepID, Facenet y VGG-Face penalizan la deriva de los embeddings faciales respecto al original.
- Optimización de calidad perceptual: la pérdida TopIQ con referencia completa (peso dominante 0.9) empuja la salida hacia mayor calidad estética medible.
- Introducción de perturbación adversarial: el modelo está diseñado explícitamente para incorporar componentes adversariales en la imagen de salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo.
- No dispone de modo "thinking" ni decodificación especulativa (no es un modelo autorregresivo).

## Casos de uso

- Investigación en robustez adversarial de sistemas de reconocimiento facial: el modelo permite generar imágenes con perturbaciones acotadas (epsilon 0.03) que mantienen la similitud coseno por debajo de los umbrales definidos para ArcFace, DeepID, Facenet y VGG-Face, útiles para evaluar la resistencia de verificadores biométricos.
- Pruebas de regresión de pipelines de calidad de imagen: al optimizar explícitamente TopIQ, sirve para generar pares entrada/salida con calidad controlada y validar métricas de evaluación automática.
- Aumento de datos para entrenamiento de filtros de imagen: las transformaciones preservan estructura e identidad, lo que permite ampliar datasets de entrenamiento sin alterar la etiqueta facial.
- Auditoría de sesgos en modelos de reconocimiento facial: la combinación de pérdidas sobre cuatro extractores distintos permite estudiar cómo responde cada uno a la misma perturbación.
- Docencia y experimentación con pérdidas multi-objetivo en Keras: la configuración está completamente expuesta (JSON de arquitectura y de entrenamiento), lo que facilita reproducir y modificar el esquema de pérdidas ponderadas.
- Prototipado de filtros estéticos ligeros en dispositivos: el formato TFLite y el reducido tamano de los bloques (máximo 128 filtros) apuntan a despliegue en entornos con recursos limitados, aunque no se han publicado cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara las métricas empleadas durante el entrenamiento (TopIQ-FR, distancia coseno ArcFace y distancia coseno VGGFace2) y sus umbrales, pero no reporta valores finales alcanzados ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con entradas de 256x256 y un máximo de 128 filtros por bloque, el modelo es de reducido tamano, pero no se han publicado cifras de parámetros ni de memoria.
- GPU recomendadas: no disponible. Por la escala de la arquitectura, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería poder ejecutarlo, aunque esto es una estimación basada en la arquitectura y no un dato verificado.
- Compatibilidad con GPU consumer: probable por tamano, sin confirmación oficial.
- Opciones de despliegue: TensorFlow/Keras y TensorFlow Lite (formato declarado). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son runners de LLM y no aplican a este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Enfoque |
|---|---|---|---|---|
| auramask-nothing | CNN encoder-decoder Keras | 256x256 px | GPL-3.0 | Filtro adversarial con preservación de identidad y calidad TopIQ |
| Modelos de restauración de imagen genéricos (por ejemplo, ESRGAN) | GAN superresolución | variable | varía | Mejora de nitidez y resolución, sin objetivo adversarial |
| Filtros adversarios faciales (literatura de adversarial examples) | Perturbación optimizada | variable | varía | Alterar embeddings faciales sin cambiar la percepción |

No se dispone de información suficiente para establecer una comparación cuantitativa con alternativas concretas; los datos de rendimiento de auramask-nothing no están publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su rendimiento real frente a alternativas.
- El repositorio ocupa 0.0 GB y no se confirma la presencia de pesos en el mismo; verificar la disponibilidad de los archivos antes de integrarlo.
- La licencia GPL-3.0 es copyleft fuerte: su uso en productos propietarios o servicios comerciales puede obligar a liberar el código derivado. Revisar con asesoría legal antes de producción.
- Modelo de nicho sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-20).
- El objetivo adversarial implica que la salida incorpora perturbaciones deliberadas; no debe usarse como filtro de mejora de imagen convencional sin validación previa.
- Riesgo de uso indebido: las perturbaciones adversariales sobre reconocimiento facial pueden emplearse para evadir sistemas de verificación; evaluar implicaciones éticas y legales.
- Sin información sobre composición del dataset logasja/FDF, sesgos demográficos ni cobertura de rostros; probable sesgo hacia la distribución del dataset de entrenamiento.
- Entrenamiento corto (10 épocas) y sin mixed precision, lo que sugiere un ajuste limitado.
- No procesa texto ni otros idiomas; las etiquetas de idioma no están disponibles porque no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WillNuyen228/auramask-nothing
- Logs de entrenamiento (Weights & Biases): https://wandb.ai/spuds/auramask/runs/y3ftvu3l
- Modelo base ArcFace: https://huggingface.co/logasja/ArcFace
- Modelo base VGGFace: https://huggingface.co/logasja/VGGFace
- Dataset de ajuste: https://huggingface.co/datasets/logasja/FDF
