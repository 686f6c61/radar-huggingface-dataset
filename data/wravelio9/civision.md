# wravelio9/civision

## Resumen

Civision es un servicio de deteccion de objetos basado en YOLO que se publica como Space de Hugging Face con SDK Docker (puerto 7860) bajo el identificador `wravelio9/civision`. No es un modelo de lenguaje ni un modelo generativo: es un microservicio HTTP que expone un modelo de vision para inferencia. Lo desarrolla el usuario `wravelio9` (Wilson), estudiante de grado en Ciencias de la Computacion en BINUS University, segun su perfil publico de GitHub.

El servicio se compone de un backend FastAPI (`app.py`) que carga el modelo YOLO una sola vez al arrancar y ofrece `GET /health` y `POST /predict`, y un cliente de ejemplo en Express.js (`examples/express-client.js`) que recibe las subidas del cliente final y las reenvia al servicio de IA. La topologia documentada es: cliente sube foto al backend Express, este hace `POST /predict` al servicio FastAPI + YOLO, y recibe JSON con las detecciones mas la URL de la imagen anotada.

Su relevancia es practica: empaqueta deteccion de objetos como microservicio desplegable en el nivel gratuito de Hugging Face Spaces, con un detector personalizado entrenado por el autor (`best.pt`, orientado a la clase `gerobak`) y un mecanismo de respaldo automatico a un modelo base COCO (`yolo26n.pt`) cuando el peso personalizado no esta presente. El repositorio no publica parametros, licencia, idiomas ni metricas, y en el momento de la consulta acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos YOLO (red neuronal convolucional de una etapa); framework coherente con entrenamiento tipo Ultralytics (`yolo.py`, `runs/detect/train/weights/best.pt`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de vision no generativo) |
| Tipos de cuantizacion | no disponible; la documentacion solo describe carga de checkpoints `.pt` |
| Idiomas soportados | no disponible como capacidad del modelo; las etiquetas de clase y la documentacion estan en indonesio (por ejemplo, la clase `gerobak`) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoint PyTorch; `best.pt` personalizado y `yolo26n.pt` de respaldo) |
| Tipo de artefacto | Space de Hugging Face con SDK Docker, `app_port: 7860` |
| Tamano del repositorio | 0.0 GB (no incluye pesos en el momento de la consulta) |
| Endpoints | `GET /health`, `POST /predict` (form field `files`, query opcional `conf`, por defecto 0.5) |
| Runtime | Python 3.11, FastAPI + uvicorn |
| Entorno de ejecucion | Windows (PowerShell) documentado como principal; tambien macOS/Linux |

## Arquitectura y entrenamiento

La arquitectura es un detector de objetos YOLO, es decir, una CNN de deteccion en una sola etapa que predice simultaneamente cajas delimitadoras y clases sobre la imagen completa. La model card no detalla la variante concreta, el numero de capas ni el numero de parametros. El servicio resuelve el ciclo de inferencia completo: carga del modelo en el arranque, aceptacion de multiples imagenes por peticion (procesamiento por lotes), filtrado por umbral de confianza y generacion de una imagen anotada con las cajas dibujadas, servida a traves de una URL publica.

En cuanto al entrenamiento, el autor documenta un script propio (`yolo.py`) cuyo resultado se deposita en `runs/detect/train/weights/best.pt`; `app.py` selecciona automaticamente ese fichero mediante la constante `PREFERRED_MODEL` si existe. No se especifican el numero de imagenes, la composicion del dataset, el numero de epocas, la resolucion de entrada ni si hubo aumentos de datos o ajuste fino. Si `best.pt` no esta disponible, el servicio cae a `yolo26n.pt`, descrito en la propia documentacion como modelo base COCO de 80 clases generales, y lo senala con el campo `using_fallback: true` en `/health`. No hay innovaciones tecnicas declaradas (ni decodificacion especulativa, ni atencion lineal, ni destilacion), y no se menciona ninguna fase de RLHF/DPO, lo cual es coherente con un modelo discriminativo de vision y no generativo.

## Capacidades

- Deteccion de objetos en imagenes: devuelve por cada objeto la etiqueta, el `class_id`, la confianza y la caja `x1, y1, x2, y2`.
- Procesamiento por lotes: el endpoint `POST /predict` acepta varios ficheros en el mismo campo `files`.
- Umbral de confianza configurable en la peticion mediante el parametro de consulta `conf` (valor por defecto 0.5).
- Generacion de imagen anotada con las detecciones dibujadas y exposicion de su URL al cliente.
- Gestion de errores por fichero: el array `errors` devuelve los archivos fallidos (tipo no soportado o corrupto) mientras el resto se procesa igualmente.
- Endpoint de salud con indicacion del modelo activo y del uso de respaldo COCO (`using_fallback`).
- Deteccion de clase personalizada tras entrenamiento propio: la documentacion ejemplifica con la clase `gerobak`.
- Modo de respaldo sin entrenamiento previo: 80 clases genericas del dataset COCO.
- Integracion como microservicio desde un backend Node/Express mediante HTTP y JSON.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, uso agentico, capacidades multimodales generativas ni modo de pensamiento.

## Casos de uso

- Deteccion de carritos o elementos de tienda en fotografias: el modelo personalizado se entrena con la clase `gerobak`, de modo que un comercio puede subir imagenes y obtener conteo y ubicacion de esos objetos mediante `POST /predict`.
- Microservicio de vision para aplicaciones Node.js: el propio repositorio incluye `examples/express-client.js`, lo que permite montar un backend Express que reenvie las subidas del usuario al servicio de IA sin escribir la capa de inferencia.
- Etiquetado automatico de imagenes con clases genericas: sin entrenamiento previo, el respaldo `yolo26n.pt` detecta las 80 clases COCO, util para prototipos de clasificacion y anotacion asistida.
- Conteo de objetos en imagenes de camaras de vigilancia: al devolver `count` y las cajas por imagen, se puede alimentar un panel de ocupacion o aforo en localizaciones cerradas.
- Preprocesado en pipelines de analisis de imagen: la respuesta JSON con coordenadas permite recortar regiones de interes y enviarlas a un segundo modelo (OCR, clasificacion) en un flujo encadenado.
- Moderacion o filtrado previo de contenido subido por usuarios: el backend puede rechazar o marcar imagenes segun las detecciones antes de almacenarlas.
- Verificacion visual en pruebas automatizadas: un pipeline de integracion puede enviar imagenes de referencia al servicio y comprobar que las detecciones esperadas aparecen con una confianza minima.
- Despliegue de bajo coste para demos y pruebas de concepto: el uso del nivel gratuito de Hugging Face Spaces evita la gestion de infraestructura propia mientras se valida el modelo.
- Indexacion de catalogos fotograficos: dado un conjunto de fotos de producto, extraer cajas y recuentos para generar metadatos de inventario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall, IoU medio ni comparaciones con otros detectores, y tampoco se aportan cifras de latencia o throughput. Los unicos valores numericos presentes en la documentacion corresponden a un ejemplo de respuesta JSON con una deteccion de confianza 0.91, que no constituye una metrica agregada del modelo.

## Requisitos de hardware

- VRAM: no disponible. No se publican requisitos de memoria del servicio ni el tamano del checkpoint utilizado.
- Orientacion general (no confirmada por el autor): los detectores de la familia YOLO en variante reducida suelen ejecutarse en CPU y en GPUs de gama de consumo con pocos GB de VRAM; para el checkpoint personalizado `best.pt` no hay dato alguno que permita confirmarlo.
- GPU: no se especifica ninguna GPU recomendada; la documentacion apunta a Hugging Face Spaces, donde la asignacion de hardware depende del plan contratado.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion.
- Opciones de despliegue documentadas: Docker en Hugging Face Spaces (SDK Docker, `app_port: 7860`) y ejecucion local mediante `uvicorn app:app --host 0.0.0.0 --port 8000`.
- Escalado propuesto por el autor: ejecutar uvicorn con varios workers o situarlo detras de un proxy inverso para cargas altas. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision discriminativo.
- Latencia y throughput: no disponibles.
- Consideracion operativa: en el nivel gratuito de Spaces el servicio se suspende tras un periodo sin trafico y la primera peticion es mas lenta por el arranque en frio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Civision (`wravelio9/civision`) | Servicio YOLO personalizado + respaldo COCO | no disponible | no aplica | no disponible | Space Docker en Hugging Face, repositorio de 0.0 GB |
| YOLO base de respaldo (`yolo26n.pt`) | Detector YOLO preentrenado en COCO | no disponible | no aplica | no disponible (depende del framework de origen) | Referenciado dentro de la propia documentacion de Civision |
| Detectores YOLO de uso comun (por ejemplo, variantes de Ultralytics) | Detector de una etapa | no disponible | no aplica | no disponible en esta ficha | Ampliamente distribuidos, con herramientas de exportacion |
| Detectores tipo transformer (por ejemplo, RT-DETR) | Detector basado en transformer | no disponible | no aplica | no disponible en esta ficha | Disponibles en repositorios de vision |

No se dispone de datos publicados de Civision que permitan una comparacion cuantitativa con alternativas de la misma categoria (parametros, mAP, latencia o licencia), por lo que la comparativa se limita a la naturaleza del artefacto y su forma de distribucion.

## Limitaciones y advertencias

- El repositorio ocupa 0.0 GB, lo que indica que los pesos no estan alojados en el mismo; sin `best.pt`, el servicio opera en modo respaldo con clases COCO y no con la clase personalizada `gerobak`.
- No se declara licencia en la informacion disponible, por lo que el uso comercial queda sin cobertura explicita. Conviene comprobar tambien la licencia del framework de deteccion subyacente antes de cualquier despliegue productivo.
- No se publican metricas de calidad (mAP, precision, recall) ni el volumen o la composicion del dataset de entrenamiento, de modo que no es posible estimar la fiabilidad real del detector personalizado.
- El modelo solo tiene documentada una clase personalizada (`gerobak`); no hay informacion sobre otras clases entrenadas.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier detector, agravado por la ausencia de umbrales de NMS configurables: el unico parametro expuesto al cliente es `conf`.
- La documentacion esta redactada en indonesio, con fragmentos en ingles, lo que puede dificultar el mantenimiento a equipos que no manejen ese idioma.
- Los ficheros generados se acumulan en `outputs/`; el propio autor advierte de la necesidad de programar limpieza periodica en escenarios de alto volumen.
- No se describe autenticacion ni control de acceso en los endpoints, lo que supone un riesgo si el servicio se expone publicamente con imagenes de terceros.
- En despliegue gratuito sobre Spaces, el servicio se suspende por inactividad y sufre arranque en frio en la primera peticion, algo inadecuado para cargas con requisitos estrictos de latencia.
- El campo `PUBLIC_BASE_URL` debe configurarse correctamente en produccion; en caso contrario, las URL de las imagenes anotadas apuntaran a `localhost` y seran inutiles para el cliente.
- No hay senales de validacion por parte de la comunidad en el momento de la consulta (0 descargas, 0 likes), por lo que el artefacto debe considerarse no auditado.
- Las fechas de creacion y actualizacion del repositorio indican 2026-09-30; se trata de un dato del propio repositorio que conviene verificar antes de tomarlo como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wravelio9/civision
- Repositorio GitHub del autor: https://github.com/wravelio9/AI-civision
- Perfil de Hugging Face del autor: https://huggingface.co/wravelio9
- Listado de modelos del autor: https://huggingface.co/wravelio9/models
- Perfil de GitHub del autor: https://github.com/wravelio9
- Referencia a la Space `ai-civision`: https://huggingface.co/spaces/wravelio9/ai-civision
- Entrada en ModelScope: https://modelscope.ai/civision
