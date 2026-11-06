# wkhaifor/seal-detection-yolo

## Resumen

Seal-detection-yolo es un conjunto de pesos de deteccion de objetos orientado especificamente a la localizacion de sellos (stamps) en documentos chinos, como contratos o paginas escaneadas. Lo publica el usuario wkhaifor en Hugging Face y esta pensado como un componente de un pipeline mayor de analisis documental: el modelo solo devuelve cajas delimitadoras y confianza para la clase `stamp`; la segmentacion de pixeles y el reconocimiento optico de caracteres (OCR) requieren modelos separados. El repositorio incluye tres variantes de la familia YOLO de Ultralytics: YOLO11n, YOLO12n y YOLO26n, todas en su version nano.

La relevancia practica del modelo esta en su especializacion y en su tamano reducido: parte de pesos preentrenados en COCO, se afina primero con el dataset publico `mapo80/stamps` y despues con imagenes chinas de pagina completa del dataset SEAL_DATASET de Kaggle. El autor reporta resultados muy altos en su conjunto de test fijo de 220 imagenes (mAP50-95 en torno al 96-97 %), aunque conviene tomar esas cifras con cautela porque proceden de un unico benchmark y de un dominio muy acotado. El repositorio ocupa 0.0 GB segun los metadatos, lo que es coherente con tres modelos nano.

Se trata de un modelo de vision puro, no de un modelo de lenguaje: los tags `zh` y `document-analysis` describen el dominio de aplicacion, no capacidades linguisticas. No hay pipeline declarado en Hugging Face, la inferencia esta desactivada en el hub (`inference: false`) y la licencia no aparece en los metadatos del repositorio, aunque la model card menciona que el codigo upstream de Ultralytics es AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (variantes nano YOLO11n, YOLO12n, YOLO26n de Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se menciona inferencia en CPU, sin detallar cuantizacion) |
| Idiomas soportados | zh (dominio de documentos chinos; el modelo no procesa texto) |
| Licencia | no disponible en metadatos; el codigo upstream de Ultralytics es AGPL-3.0 |
| Formato de pesos | no disponible (pesos YOLO, presumiblemente `.pt`; el autor no lo explicita) |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de la familia YOLO en variante nano, es decir, una red convolucional de una sola etapa optimizada para latencia baja y footprint reducido. El autor no detalla la arquitectura interna de cada variante, pero al tratarse de YOLO11n, YOLO12n y YOLO26n se corresponden con las implementaciones publicadas por Ultralytics. La salida es una unica clase, `stamp`, con cajas en coordenadas de pixel de la imagen original.

El entrenamiento es en dos fases. Primero se parte de pesos preentrenados en COCO y se entrena con el dataset publico `mapo80/stamps`, que contiene 7.854 imagenes y 12.659 cajas en total (6.283 imagenes de entrenamiento con 10.046 cajas, 785 de validacion con 1.298 cajas y 786 de test con 1.315 cajas). Despues se afina con imagenes chinas de pagina completa de SEAL_DATASET (1.467 imagenes y 2.007 cajas: 1.027 de entrenamiento con 1.408 cajas, 220 de validacion con 301 cajas y 220 de test con 298 cajas). El autor no menciona el numero total de tokens ni el uso de RLHF o DPO, algo que no aplica a un detector. Los registros por epoca estan en `metrics/`, la configuracion de entrenamiento en `training/` y las graficas se pueden regenerar con `plot_results.py`.

## Capacidades

- Deteccion de sellos en documentos: devuelve cajas delimitadoras y puntuaciones de confianza para la clase `stamp`.
- Localizacion sobre imagenes de pagina completa en chino, incluyendo contratos y paginas escaneadas.
- Inferencia en CPU: el autor documenta explicitamente un flujo de ejecucion con `--device cpu`.
- Salida estructurada en JSON (`result.json`) con coordenadas en pixeles de la imagen original.
- Compatibilidad con recorte posterior: las cajas permiten aislar el sello para alimentar modulos de segmentacion o reconocimiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades de vision general (clasificacion, VQA, captioning) mas alla de la deteccion de sellos.
- No es multilingue en sentido estricto: el dominio de entrenamiento es documentacion china.

## Casos de uso

- Digitalizacion de contratos: el modelo localiza los sellos en cada pagina escaneada y devuelve sus coordenadas para que un modulo posterior recorte la region y la envie a un OCR o a un verificador de autenticidad. Su tamano nano permite procesar lotes grandes en CPU sin GPU dedicada.
- Verificacion de presencia de sello: en flujos de validacion documental, comprobar automaticamente si un contrato lleva sello y en que posicion aparece, reduciendo la revision manual a los casos sin deteccion o con confianza baja.
- Preprocesado para pipelines de OCR: al aislar la region del sello, se evita que el OCR confunda el texto circular del sello con el cuerpo del documento, mejorando la precision del reconocimiento en el resto de la pagina.
- Indexacion y busqueda documental: extraer la ubicacion y el numero de sellos por pagina permite enriquecer metadatos de un repositorio de contratos y filtrar por documentos sellados.
- Analisis de cumplimiento en back office: procesar lotes de facturas o contratos para detectar paginas que deberian llevar sello y no lo llevan, con las cajas como evidencia visual para el revisor humano.
- Despliegue en entornos con recursos limitados: al ser modelos nano y funcionar en CPU, se pueden ejecutar en servidores sin GPU o en el propio puesto de trabajo del revisor, sin depender de infraestructura de inferencia acelerada.
- Generacion de datasets de sellos: usar las detecciones como preetiquetado para construir o ampliar conjuntos de datos de sellos con revision humana posterior.

## Benchmarks y rendimiento

El autor reporta resultados sobre un conjunto de test fijo de 220 imagenes chinas de pagina completa. La validacion se mide con mAP50-95; el test con precision (P), recall (R), mAP50 y mAP50-95.

| Modelo | Experimento | Validacion mAP50-95 % | Test P % | Test R % | Test mAP50 % | Test mAP50-95 % |
|---|---|---:|---:|---:|---:|---:|
| yolo11n | E004 | 95.511 | 90.40 | 98.99 | 98.46 | 96.74 |
| yolo12n | E005 | 95.655 | 95.09 | 91.01 | 98.24 | 96.71 |
| yolo26n | E006 | 94.866 | 91.18 | 97.10 | 97.96 | 96.11 |

El script de inferencia usa por defecto YOLO12n, que es el que obtiene el mAP50-95 de validacion mas alto (95.655 %). No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla, ni comparaciones con detectores genericos como Faster R-CNN o DETR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de modelos YOLO nano, el consumo es muy bajo y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA es suficiente. El autor documenta ademas ejecucion en CPU.
- Cabe en GPU consumer: si, al ser variantes nano (YOLO11n, YOLO12n, YOLO26n).
- Opciones de despliegue: el repositorio incluye `predict.py` con flags `--image`, `--model`, `--device` y `--output`; requiere `pip install -r requirements.txt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector de vision.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros detectores de sellos en la informacion proporcionada. La comparacion interna entre las tres variantes incluidas es la siguiente:

| Modelo | Validacion mAP50-95 % | Test P % | Test R % | Test mAP50-95 % | Licencia |
|---|---:|---:|---:|---:|---|
| yolo11n | 95.511 | 90.40 | 98.99 | 96.74 | AGPL-3.0 (upstream Ultralytics) |
| yolo12n | 95.655 | 95.09 | 91.01 | 96.71 | AGPL-3.0 (upstream Ultralytics) |
| yolo26n | 94.866 | 91.18 | 97.10 | 96.11 | AGPL-3.0 (upstream Ultralytics) |

YOLO12n ofrece la mejor precision en test (95.09 %) y el mejor mAP50-95 de validacion, a costa de un recall menor (91.01 %). YOLO11n y YOLO26n priorizan recall (98.99 % y 97.10 % respectivamente) con precision algo inferior. La eleccion depende de si el flujo tolera falsos negativos o falsos positivos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con documentos chinos y con el dataset `mapo80/stamps`; su comportamiento en documentos de otros paises, idiomas o formatos de sello no esta documentado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si puede producir falsos positivos (detecciones espurias) o falsos negativos en sellos parcialmente ocluidos, borrosos o con bajo contraste.
- Limitaciones de dominio: solo detecta la clase `stamp`; no segmenta el sello ni reconoce su contenido. El autor lo indica explicitamente: la identificacion de texto y la segmentacion de pixeles requieren modelos propios.
- Licencia: los metadatos del repositorio no declaran licencia. El codigo upstream de Ultralytics es AGPL-3.0, lo que impone obligaciones de copyleft si se usa en red; el dataset chino SEAL_DATASET tiene licencia original registrada como "Unknown", lo que anade incertidumbre sobre el uso comercial del modelo entrenado con el.
- Caveat de produccion: los resultados de la tabla proceden de un unico conjunto de test de 220 imagenes del mismo dominio que el entrenamiento; el rendimiento en documentos reales de otros organismos o con escaneos de peor calidad puede ser inferior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la inferencia esta desactivada en el hub, por lo que no hay validacion externa de los resultados.
- No hay informacion sobre cuantizacion, formato exacto de los pesos ni requisitos de hardware detallados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wkhaifor/seal-detection-yolo
- Repositorio espejo en ModelScope: https://www.modelscope.cn/models/kfcVme50/seal-detection-yolo
- Dataset `mapo80/stamps`: https://huggingface.co/datasets/mapo80/stamps
- Dataset SEAL_DATASET en Kaggle: https://www.kaggle.com/datasets/yushuosun/seal-dataset
- Ultralytics (codigo upstream, AGPL-3.0): no se proporciona enlace directo en la informacion disponible
