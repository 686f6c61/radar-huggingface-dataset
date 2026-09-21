# yasinunal/turkish-contact-center-intent-classifier

## Resumen

El Turkish Contact Center Intent Classifier es un modelo de clasificación de texto desarrollado por el usuario yasinunal que asigna intervenciones de clientes en turco a una de diez intenciones típicas de un centro de contacto de telecomunicaciones (avería de internet, disputa de factura, activación de línea, portabilidad, roaming, etc.). Se construye mediante fine-tuning supervisado sobre el checkpoint `dbmdz/bert-base-turkish-cased`, un encoder BERT en su variante base para turco con aproximadamente 110,6 millones de parámetros.

El problema que aborda es el enrutamiento y la categorización automática de motivos de contacto en turco, un idioma con menos recursos y con menos modelos especializados publicados que el inglés. La versión v0.1 se entrenó con un corpus pequeño y curado de 856 ejemplos (800 base, 40 de frontera contrastiva y 16 de reparación dirigida) y reporta una precisión del 100% sobre 100 ejemplos in-scope y del 95% sobre un benchmark de frontera de 80 ejemplos, resultados que el propio autor advierte que no son extrapolables a tráfico real.

Su relevancia práctica reside en el tamaño: al ser un modelo de ~110 M de parámetros es viable en CPU, en GPUs de consumo e incluso en despliegues de borde, con latencias de milisegundos y sin necesidad de infraestructura de gran escala. El principal caveat es que se trata de un clasificador de conjunto cerrado de 10 clases, sin detector de peticiones fuera de alcance (OOS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (variante base) con cabeza de clasificacion de secuencias |
| Parametros totales | 110.625.034 (confirmado en los pesos safetensors) |
| Longitud de contexto | 512 tokens a nivel de arquitectura BERT; el modelo se entreno y evaluo con max_length=128 |
| Tipos de cuantizacion | No disponible: el autor no publica versiones cuantizadas. Distribucion en safetensors; al ser un BERT de ~110 M es cuantificable a FP16/int8 con herramientas estandar |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); compatible con text-embeddings-inference y endpoints |
| Etiquetas de salida | 10 clases (conjunto cerrado) |
| Tamano del repositorio | 0,4 GB |

Las diez intenciones soportadas, con su identificador, son: 0 `cihaz_sorunu`, 1 `fatura_itirazi`, 2 `genel_bilgi`, 3 `hat_aktivasyonu`, 4 `internet_arizasi`, 5 `iptal_talebi`, 6 `numara_tasima`, 7 `odeme_sorunu`, 8 `paket_degistirme` y 9 `roaming`.

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer bidireccional de tipo BERT en su configuracion base, sobre el que se anade una cabeza lineal de clasificacion para 10 etiquetas. El recuento real de parametros (110.625.034) es coherente con la variante base de BERT (12 capas, 768 de dimension oculta y 12 cabezas de atencion) mas la capa de clasificacion. Al ser un modelo de clasificacion, no incorpora decodificacion autoregresiva, atencion lineal, decodificacion especulativa ni modo de razonamiento explicito.

El entrenamiento consistio en un fine-tuning supervisado clasico sobre un dataset de 856 ejemplos construido especificamente para el caso de uso: 800 ejemplos base, 40 ejemplos de frontera contrastiva (pares semanticamente proximos entre intenciones) y 16 ejemplos de reparacion dirigida a reforzar limites concretos entre clases. El corpus combina ejemplos sinteticos y curados en torno a escenarios de contact center turco. No se documenta el uso de RLHF ni DPO, algo esperable en una tarea de clasificacion supervisada, ni se detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros de optimizacion.

## Capacidades

- Clasificacion de texto en turco en 10 categorias cerradas de intencion de contact center.
- Salida de logits por clase, lo que permite obtener una etiqueta predicha y un margen de confianza relativo entre clases.
- Inferencia rapida y ligera, apta para procesamiento por lotes de alto volumen.
- Integracion directa con el pipeline `text-classification` de transformers y con text-embeddings-inference.
- Uso como componente de pre-etiquetado en flujos de anotacion humana.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador de una sola pasada.
- No tiene capacidades multimodales: ni vision, ni audio, ni modo de razonamiento extendido.
- No es multilingue: solo turco.

## Casos de uso

- Enrutamiento de llamadas en un IVR: clasificar la primera intervencion del cliente en una llamada entrante y dirigirla a la cola del agente especializado correspondiente (por ejemplo, `internet_arizasi` a soporte tecnico y `fatura_itirazi` a facturacion), reduciendo el tiempo en menu y las transferencias erroneas.
- Triaje de tickets escritos en chat o correo electronico: etiquetar automaticamente cada ticket entrante con una de las 10 intenciones para asignarlo a la cola correcta y priorizarlo en funcion del tipo (`odeme_sorunu` o `iptal_talebi` suelen requerir respuesta rapida por riesgo de bajas).
- Analisis de motivos de contacto: agregar las predicciones sobre miles de interacciones para construir cuadros de mando de volumen por motivo, detectar picos de `internet_arizasi` asociados a incidencias de red y medir la evolucion de `iptal_talebi` como indicador de riesgo de churn.
- Pre-etiquetado en flujos de anotacion: usar las predicciones como propuesta inicial para que un anotador humano solo valide o corrija, acelerando la construccion de datasets etiquetados de mayor tamano en turco.
- Asistencia al agente en tiempo real: mostrar la intencion detectada en el escritorio del agente junto con la transcripcion, de modo que el agente reciba contexto sobre el motivo antes de responder.
- Deteccion de motivos de cancelacion para retencion: aislar las interacciones clasificadas como `iptal_talebi` y `paket_degistirme` para activar protocolos de retencion o analizar causas recurrentes.
- Clasificacion de transcripciones ASR: aplicar el modelo a texto generado por reconocimiento de voz en turco, teniendo en cuenta que el autor advierte que el ruido de las transcripciones ASR no esta suficientemente representado en los datos de evaluacion.
- Segmentacion de encuestas de voz del cliente: etiquetar comentarios abiertos de encuestas para agrupar quejas por tipo de problema y alimentar informes de calidad.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K u otros). El autor unicamente reporta dos evaluaciones internas sobre sus propios conjuntos:

| Evaluacion | Resultado |
|---|---:|
| Precision in-scope (100 ejemplos) | 100/100 (100%) |
| Precision en benchmark de frontera (80 ejemplos) | 76/80 (95%) |

Estos resultados deben interpretarse en el contexto de unos datasets pequenos y en parte sinteticos. El propio autor indica explicitamente que no implican un 100% de precision sobre trafico real de contact center turco y que el rendimiento puede degradarse con conversaciones reales, transcripciones ASR, objetivos de cliente no vistos previamente, cambios de dominio y peticiones fuera de alcance.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 442 MB (110,6 M de parametros x 4 bytes).
- Pesos en FP16: aproximadamente 221 MB.
- Pesos en int8: aproximadamente 111 MB.
- VRAM estimada para inferencia: por debajo de 1-2 GB en FP16 con lotes pequenos, incluyendo activaciones y memoria del runtime. Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 y equivalentes, y tambien en GPUs integradas o en CPU.
- Ejecucion en CPU: viable para volumenes moderados; es un modelo adecuado para despliegue en servidores sin GPU o en el borde.
- GPUs recomendadas: cualquiera con al menos 2 GB de VRAM. Para maximizar throughput en produccion, A100, H100, L4 o T4 son opciones razonables, pero no son necesarias por tamano.
- Opciones de despliegue: `transformers` (PyTorch) con `AutoModelForSequenceClassification` o con el pipeline `text-classification`; text-embeddings-inference (el repositorio esta etiquetado como compatible); exportacion a ONNX Runtime para inferencia en CPU; FastAPI o similares para envolver el modelo en un servicio HTTP. No hay soporte GGUF ni Ollama documentado por el autor.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa no confirmada, un BERT-base de ~110 M suele procesar secuencias de 128 tokens en el rango de milisegundos por lote en GPU moderna y en decenas de milisegundos por lote en CPU multinucleo; estas cifras son estimaciones y deben medirse en el entorno real de despliegue.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada otros clasificadores de intencion especificos de contact center en turco con los que comparar directamente. La comparacion se establece por tanto con el modelo base y con encoders multilingues genericos que podrian usarse como alternativa.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yasinunal/turkish-contact-center-intent-classifier | ~110,6 M | 512 (entrenado a 128) | Clasificacion de intenciones en turco, 10 clases cerradas | MIT | HuggingFace |
| dbmdz/bert-base-turkish-cased | ~110 M | 512 | Encoder base en turco, sin cabeza de intenciones | MIT | HuggingFace |
| google-bert/bert-base-multilingual-cased (mBERT) | ~178 M | 512 | Encoder multilingue (mas de 100 idiomas), requiere fine-tuning | Apache 2.0 | HuggingFace |
| FacebookAI/xlm-roberta-base | ~278 M | 512 | Encoder multilingue, requiere fine-tuning | MIT | HuggingFace |

Frente al modelo base, la ventaja es que ya incorpora la cabeza de 10 intenciones y el vocabulario de tareas de contact center turco; la desventaja es que su conjunto de entrenamiento es muy reducido, por lo que un fine-tuning propio sobre datos reales de la organizacion probablemente supere su rendimiento. Frente a mBERT o XLM-RoBERTa-base, el modelo de yasinunal es mas pequeno y esta especializado, pero solo cubre turco y una taxonomia fija.

## Limitaciones y advertencias

- Solo soporta las 10 intenciones listadas; cualquier peticion fuera de ese conjunto se asignara igualmente a una de las 10 clases.
- No incorpora un detector de peticiones fuera de alcance (OOS) listo para produccion. El autor indica que se evaluaron enfoques experimentales basados en margen de confianza y distancia de embeddings, pero no forman parte del pipeline de inferencia de la v0.1.
- Peticiones de negocio semanticamente similares pero no soportadas pueden recibir una etiqueta soportada con alta confianza.
- Las puntuaciones de confianza no deben interpretarse como probabilidades calibradas.
- El corpus de entrenamiento (856 ejemplos) incluye ejemplos sinteticos y no es representativo de todas las conversaciones reales de contact center en turco.
- Las transcripciones ASR reales pueden contener ruido no suficientemente representado en los datos de evaluacion.
- Los resultados de evaluacion (100% y 95%) proceden de conjuntos pequenos y controlados, por lo que no garantizan comportamiento equivalente en produccion.
- El autor recomienda explicitamente realizar evaluaciones adicionales antes de un despliegue en produccion.
- La licencia MIT permite uso comercial, modificacion y redistribucion sin restricciones relevantes, manteniendo el aviso de copyright y de licencia; conviene verificar igualmente las condiciones del modelo base `dbmdz/bert-base-turkish-cased`.
- Sesgos conocidos: no se documentan analisis de sesgo especificos. Al entrenarse sobre datos sinteticos y curados, puede heredar sesgos de la distribucion de ejemplos generada y mostrar un comportamiento desigual ante variantes dialectales, coloquiales o con errores ortograficos del turco.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yasinunal/turkish-contact-center-intent-classifier
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Alternativa multilingue mBERT: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Alternativa multilingue XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Resultados de busqueda web: no se ha encontrado informacion relevante sobre este modelo. Las busquedas realizadas devolvieron unicamente paginas no relacionadas (foros sobre Facebook, descargas de Snaptube y YouTube y articulos de actualidad de ZDNET), por lo que no aportan enlaces utiles para esta ficha. No se dispone de paper, blog tecnico, repositorio adicional ni demo publicada por el autor en la informacion proporcionada.
