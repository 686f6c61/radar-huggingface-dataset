# tannguyenbmt47/upar2027-track2

## Resumen

`tannguyenbmt47/upar2027-track2` es el conjunto de pesos entrenados de la entrada v13 del leaderboard del Track 2 (attribute-based person retrieval) del UPAR Challenge 2027, workshop Real-World Surveillance de WACV 2027. No es un modelo generativo ni un LLM: es un sistema de recuperacion de personas descritas por atributos, es decir, dado un conjunto de atributos textuales (color de ropa, tipo de calzado, genero aparente, etc.) devuelve las imagenes de peatones que los cumplen. El autor publica tres checkpoints independientes que se combinan o comparan en la submission.

Los tres modelos comparten el mismo esquema: un backbone ViT preentrenado mas una "query head" que proyecta la consulta de atributos al espacio visual. Dos de ellos se basan en DINOv3 (ViT-L/16 y ViT-H+/16) y el tercero en OpenAI CLIP ViT-L/14, aprovechando en este ultimo la puntuacion texto-imagen del codificador de texto. La resolucion de entrada es baja de forma deliberada (176x96 y 224x112), coherente con el escenario de vigilancia real y con el coste de inferencia en despliegues a gran escala.

La relevancia practica es doble: por un lado sirve como referencia reproducible para investigacion en attribute-based person retrieval (codigo en GitHub, pesos descargables, instrucciones para reconstruir el zip de Codabench); por otro, documenta una receta de destilacion y de ajuste fino (WiSE-FT, EMA, mixup/CutMix) sobre backbones fundacionales de vision. El resultado reportado es mADM 0.6817 sobre el conjunto de test oculto del challenge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres ViT con cabeza de consulta (query head): DINOv3 ViT-L/16, DINOv3 ViT-H+/16 y OpenAI CLIP ViT-L/14 |
| Parametros totales | no disponible (tres backbones ViT-L y ViT-H+ con cabeza adicional; el autor no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision. Entrada de imagen 176x96 (`student.pt`) y 224x112 (`hp.pt`, `m1.pt`); la consulta es un vector de atributos |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en bf16 |
| Idiomas soportados | no disponible; el unico componente textual es el codificador CLIP de OpenAI, entrenado principalmente con texto en ingles |
| Licencia | `dinov3-license-and-mit` para los pesos (heredan los terminos de DINOv3 y de CLIP); el codigo es Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) en bf16 |
| Tarea | Attribute-based person retrieval y reconocimiento de atributos de peaton |
| Tamano del repositorio | 3.0 GB (los tres checkpoints) |

## Arquitectura y entrenamiento

El sistema se compone de tres modelos independientes, cada uno formado por un backbone ViT preentrenado y una cabeza de consulta que alinea la representacion de los atributos con la de la imagen. `student.pt` usa DINOv3 ViT-L/16 a 176x96 y se obtiene por destilacion durante 20 epocas desde dos profesores, DINOv3 ViT-L/16 y CLIP ViT-L/14, con una perdida combinada de 0.2 de perdida de etiquetas y 0.8 de destilacion, aplicando mixup o CutMix en la mitad de los batches y con semilla 2. `hp.pt` usa DINOv3 ViT-H+/16 a 224x112, se entrena con BCE mas 0.5 de entropia cruzada de grupo y publica los pesos EMA tras 3 epocas, con semilla 1. `m1.pt` usa OpenAI CLIP ViT-L/14 a 224x112 con la misma receta que `hp.pt`, anade la puntuacion texto-imagen de CLIP y aplica despues WiSE-FT con factor 0.7.

Los tres modelos se entrenan con las particiones train y val de PA100k, PETA y Market-1501. La model card no detalla el numero total de tokens ni la composicion exacta del dataset, pero si las decisiones de entrenamiento (destilacion multi-profesor, EMA, mixup/CutMix, WiSE-FT, busqueda de semillas), que apuntan a un ajuste fino sobre backbones fundacionales mas que a un entrenamiento desde cero. No se documenta el uso de RLHF ni de DPO, algo esperable en un modelo discriminativo de vision.

## Capacidades

- Recuperacion de personas por atributos: dada una consulta de atributos, ordena imagenes de peaton por probabilidad de coincidencia.
- Reconocimiento de atributos de peaton (pedestrian attribute recognition): prediccion multi-etiqueta sobre apariencia, ropa y accesorios.
- Extraccion de embeddings visuales con backbones DINOv3 y CLIP, reutilizables para tareas de re-identificacion.
- Puntuacion texto-imagen en `m1.pt` gracias al codificador de texto de CLIP, lo que permite consultas en lenguaje natural en ingles.
- Ajuste fino con destilacion desde dos profesores, util como receta reproducible para otros dominios.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo "thinking", vision generativa, audio ni salida de texto libre.
- Capacidades multilingues: no documentadas; dependen del codificador CLIP y, por tanto, limitadas en la practica al ingles.

## Casos de uso

- Busqueda forense asistida en CCTV: un operador describe un sospechoso con atributos ("chaqueta roja, pantalon negro, mochila") y el sistema reduce el visionado de horas de grabacion a un conjunto corto de candidatos. La resolucion baja de entrada (176x96 y 224x112) encaja con metraje de vigilancia real.
- Analitica de seguridad urbana: agregacion de atributos de peaton en camaras de via publica para informes de afluencia y perfiles de vestimenta, sin almacenar identidades.
- Re-identificacion entre camaras: uso de los embeddings de `hp.pt` o `m1.pt` para enlazar la misma persona entre vistas no solapadas en recintos como aeropuertos o estaciones.
- Anotacion semiautomatica de datasets: preetiquetado de atributos en PA100k, PETA o corpus propios, con revision humana posterior, para acelerar la construccion de nuevos conjuntos.
- Comercio y retail: analisis de atributos de clientes en tienda fisica (prendas, colores) para estudios de surtido, con las cautelas legales correspondientes.
- Linea base de investigacion y reproduccion: el repositorio de GitHub y `submission/build_v13.py` permiten reconstruir el zip de Codabench y comparar nuevas propuestas contra mADM 0.6817.
- Docencia y prototipado: los tres checkpoints bf16 permiten montar un demostrador de retrieval por atributos con recursos modestos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Contexto |
|---|---|---|---|
| UPAR Challenge 2027, Track 2 (test oculto) | mADM | 0.6817 | Entrada v13 del leaderboard, la publicada por el autor |
| PA100k / PETA / Market-1501 (validacion) | no disponible | no disponible | Se usan para entrenamiento (train + val), no se reportan metricas desglosadas |

No se han publicado otros resultados de benchmarks en la informacion disponible: no hay cifras por atributo, ni comparacion con lineas base del challenge, ni evaluacion de latencia o throughput. El unico numero verificable es el mADM del test oculto.

## Requisitos de hardware

- VRAM estimada: cada checkpoint es un ViT-L/16 o ViT-H+/16 en bf16; con el repositorio completo en disco ocupando 3.0 GB, la carga de un solo modelo requiere aproximadamente entre 1 y 2 GB de VRAM en bf16 (estimacion a partir del tamano de los ficheros; el autor no publica cifras). El pico real depende del tamano de batch y de la resolucion de las imagenes.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en bf16 (RTX 3060/4060 en adelante). Para evaluacion por lotes a gran escala sobre PA100k o PETA son preferibles A100 o H100 por ancho de banda.
- Cabe en GPU de consumo: si, con los tres checkpoints cargados secuencialmente y no simultaneamente. La entrada a 176x96 reduce mucho el coste respecto a resoluciones de 224x224.
- Opciones de despliegue: PyTorch nativo es la via documentada (state dicts `.pt`); no se mencionan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp u Ollama, que ademas no aplican a un modelo de retrieval visual. Para serving se puede envolver en TorchServe o en un servicio FastAPI propio.
- Latencia y throughput: no disponibles. No se publican mediciones, aunque el uso de resoluciones bajas y ViT-L sugiere latencias de decenas de milisegundos por imagen en GPU moderna (estimacion, no dato del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| upar2027-track2 | no disponible (3 ViT: L/16, H+/16, CLIP L/14) | 176x96 y 224x112 | mADM 0.6817 en Track 2 | dinov3-license + MIT; codigo Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| DINOv3 ViT-L/16 (backbone base) | no disponible | no especificado | no disponible | DINOv3 License | pesos publicados por Meta |
| OpenAI CLIP ViT-L/14 (backbone base) | no disponible | no especificado | no disponible | MIT | pesos publicados por OpenAI |
| Otros participantes del Track 2 de UPAR 2027 | no disponible | no disponible | no disponible en la informacion | no disponible | leaderboard de Codabench |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos disponibles: la model card solo aporta el mADM propio y no incluye cifras de las lineas base ni de otros equipos. Como referencia cualitativa, este repositorio se distingue por combinar tres backbones distintos (dos DINOv3 y un CLIP) y por publicar la receta completa de entrenamiento.

## Limitaciones y advertencias

- Licencia: los pesos heredan la DINOv3 License y la licencia MIT de CLIP, con el campo `license: other` en HuggingFace. La DINOv3 License no es una licencia de codigo abierto estandar, por lo que debe revisarse antes de cualquier uso comercial. El codigo es Apache 2.0, pero eso no cubre los pesos.
- Uso biometrico y vigilancia: la tarea es recuperacion de personas; su aplicacion en espacio publico esta sujeta al RGPD y a la normativa europea de IA. Requiere base juridica, evaluacion de impacto y minimizacion de datos.
- Sesgos de dataset: el entrenamiento se limita a PA100k, PETA y Market-1501, conjuntos con sesgos conocidos de geografia, iluminacion, resolucion y demografia. El rendimiento puede degradarse fuera de esas condiciones.
- Alucinacion en sentido estricto no aplica, pero si falsos positivos: el modelo puede devolver candidatos que no cumplen los atributos, con especial riesgo en atributos poco frecuentes o ambiguos.
- Resolucion muy baja: 176x96 en `student.pt` limita la discriminacion de detalles finos (calzado, accesorios pequenos).
- Cobertura linguistica: la consulta textual depende de CLIP, entrenado principalmente en ingles; no hay soporte documentado de castellano.
- Sin validacion externa: el unico resultado es el mADM del test oculto; no hay evaluacion por subconjuntos, por atributo ni en dominios distintos a los de entrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por la comunidad.
- Requiere acompanar el codigo del repositorio de GitHub para reconstruir la submission; los `.pt` por si solos no documentan el pipeline de preprocesado e inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tannguyenbmt47/upar2027-track2
- Repositorio de codigo y scripts de entrenamiento: https://github.com/tannguyenbmt47/upar2027-track2
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al challenge ni a DINOv3 en la busqueda realizada; los resultados devueltos no guardan relacion con el contenido de esta ficha.
