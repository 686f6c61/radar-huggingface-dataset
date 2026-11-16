# tphakala/Perch-v2

## Resumen

Perch-v2 es la conversión a formato ONNX del clasificador de vocalizaciones de aves Perch v2 desarrollado por Google Research dentro del proyecto bird-vocalization-classifier. El modelo original identifica especies a partir de fragmentos de audio de 5 segundos y cubre aproximadamente 10.000 especies de aves, además de anfibios, insectos y mamíferos. Esta variante, publicada por tphakala, está empaquetada específicamente para su uso con BirdNET-Go, una plataforma de monitorización bioacústica.

La arquitectura es una EfficientNet-B3 con unos 12 millones de parámetros en el extractor de embeddings y 91 millones en la cabeza de clasificación, que produce logits sobre 14.795 etiquetas taxonómicas de iNaturalist. El modelo recibe audio mono a 32 kHz (160.000 muestras) y devuelve un embedding de 1536 dimensiones, un embedding espacial, el espectrograma calculado y los logits de especie.

Su relevancia actual radica en la conversión a ONNX y en la optimización que sustituye el nodo DFT por una operación MatMul, lo que reduce el tiempo medio de inferencia de 608,8 ms (TFLite) a 66,4 ms, un factor de 9,2x. Esto hace viable el despliegue en estaciones de monitorización de bajo consumo y en entornos de producción con requisitos de latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (CNN) con cabeza de clasificación |
| Parametros totales | ~103 millones (12 M de embedding + 91 M de clasificación) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 5 segundos de audio a 32 kHz (160.000 muestras) |
| Tipos de cuantizacion | FP32 (estándar y variante sin DFT); INT8 dinámico (retirada el 2026-11-15 por calidad insuficiente) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (perch_v2.onnx, perch_v2_no_dft.onnx), etiquetas en labels.txt |

## Arquitectura y entrenamiento

El modelo es una red convolucional EfficientNet-B3 adaptada a clasificación bioacústica. La entrada es un vector de 160.000 muestras float32 (5 segundos a 32 kHz) que se transforma internamente en un espectrograma de 500x128. La red produce cuatro salidas: un embedding global de 1536 dimensiones, un embedding espacial de forma [batch, 16, 4, 1536], el espectrograma intermedio y los logits sobre 14.795 clases.

Los datos de entrenamiento originales provienen de Xeno-Canto, iNaturalist, Animal Sound Archive y FSD50k, según la model card. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de audio supervisado).

La innovación técnica destacable de esta variante es la conversión del nodo DFT a una operación MatMul en el fichero `perch_v2_no_dft.onnx`, que acelera la inferencia con una tolerancia numérica de 2e-4 frente a la versión estándar (1e-5). La conversión ONNX original la realizó justinchuby y tphakala la empaquetó junto con las etiquetas de cgeorgiaw/Perch.

## Capacidades

- Clasificación de especies de aves a partir de audio: aproximadamente 10.000 especies de aves cubiertas.
- Detección de otras clases bioacústicas: ranas, grillos, saltamontes y mamíferos.
- Extracción de embeddings de audio de 1536 dimensiones, útiles para búsqueda por similitud, clustering o modelos downstream.
- Extracción de embeddings espaciales con estructura [16, 4, 1536] para análisis de características locales del espectrograma.
- Salida del espectrograma calculado (500x128) para inspección o pipelines de visualización.
- Clasificación multi-clase sobre 14.795 etiquetas taxonómicas de iNaturalist.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo de audio.

## Casos de uso

- Monitorización de biodiversidad en estaciones de campo: el modelo procesa ventanas de 5 segundos a 32 kHz y clasifica especies en tiempo casi real (66 ms por inferencia), lo que permite desplegar estaciones solares con CPU y almacenar detecciones en lugar de audio crudo.
- Integración en BirdNET-Go: el paquete está diseñado explícitamente para esta plataforma, de modo que se puede sustituir el backend TFLite por ONNX y obtener un factor de 9,2x en velocidad de inferencia.
- Análisis retrospectivo de grabaciones largas: al ser un modelo ONNX de 409 MB y con inferencia rápida, se puede ejecutar en lote sobre archivos de audio de horas o días para generar inventarios de especies.
- Investigación en bioacústica: los embeddings de 1536 dimensiones permiten entrenar clasificadores ligeros para especies no cubiertas, hacer clustering de vocalizaciones o detectar cambios en comunidades de aves.
- Alertas tempranas de conservación: la detección de especies concretas (por ejemplo, aves en peligro o invasoras) puede alimentar sistemas de alerta en parques naturales y reservas.
- Aplicaciones educativas y de ciencia ciudadana: despliegue en dispositivos de bajo coste para identificar cantos de aves en jardines, escuelas o rutas de observación.
- Detección de fauna no aviar: al incluir clases de anfibios, insectos y mamíferos, sirve para estudios de biodiversidad más amplios a partir de grabaciones acústicas pasivas.

## Benchmarks y rendimiento

| Metrica | ONNX | TFLite |
|---|---|---|
| Tiempo medio de inferencia (100 ejecuciones) | 66,4 ms | 608,8 ms |
| Aceleracion | 9,2x | referencia |

No se han publicado resultados de benchmarks de precisión (top-1, mAP, F1) en la información disponible. La model card solo menciona que la cuantización INT8 dinámica alcanzó un 82% de coincidencia top-1 con FP32 sobre 5.560 ventanas reales, por debajo del umbral de publicación, y fue retirada.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 409 MB en FP32 (413 MB la variante sin DFT), por lo que la huella en memoria es inferior a 1 GB durante la inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es lo bastante pequeño para no requerir GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con soporte ONNX Runtime.
- Despliegue: ONNX Runtime (CPU o CUDA), integración nativa con BirdNET-Go, y cualquier runtime compatible con ONNX (por ejemplo, TensorRT u OpenVINO tras conversión).
- Latencia y throughput: 66,4 ms por ventana de 5 segundos en la medición publicada (entorno no especificado), lo que equivale a unas 15 ventanas por segundo en un solo hilo; en CPU moderna se espera un rendimiento similar al reportado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Perch v2 (este repo, ONNX) | ~103 M | 5 s audio 32 kHz | 66,4 ms/inferencia (ONNX) | Apache 2.0 | Hugging Face + Kaggle |
| Perch v2 original (TFLite) | ~103 M | 5 s audio 32 kHz | 608,8 ms/inferencia | Apache 2.0 | Kaggle |
| BirdNET (Cornell) | no disponible | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion |
| Perch (v1) | no disponible | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks de precisión ni de especificaciones detalladas de BirdNET o Perch v1 en la información proporcionada, por lo que la comparación se limita a lo anteriormente expuesto.

## Limitaciones y advertencias

- Modelo de clasificación cerrada: solo reconoce las 14.795 clases de iNaturalist incluidas; especies fuera de ese conjunto se clasificarán erróneamente o con baja confianza.
- Riesgo de falsos positivos en entornos con ruido antropogénico, viento o solapamiento de vocalizaciones; no se han publicado métricas de precisión en la información disponible.
- La cuantización INT8 dinámica fue retirada por degradación de calidad (82% de coincidencia top-1 frente a FP32); no se recomienda su uso en producción.
- Entrada fija de 5 segundos: no admite audio de duración variable sin troceado previo.
- No es un modelo generativo ni conversacional; no soporta instrucciones en lenguaje natural ni tool calling.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo original de Google en Kaggle y de los datasets de entrenamiento (Xeno-Canto, iNaturalist, etc.) para cumplimiento de atribución.
- Sin datos de sesgo publicados; la cobertura geográfica y taxonómica depende de la distribución de los datasets de origen, lo que puede infrarepresentar especies de regiones con menos grabaciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria amplia de esta conversión concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tphakala/Perch-v2
- Modelo original en Kaggle: https://www.kaggle.com/models/google/bird-vocalization-classifier/
- Conversión ONNX de justinchuby: https://huggingface.co/justinchuby/Perch-onnx
- Modelo Keras y etiquetas de cgeorgiaw: https://huggingface.co/cgeorgiaw/Perch
- Código de Google Research: https://github.com/google-research/perch
- BirdNET-Go: https://github.com/tphakala/birdnet-go
