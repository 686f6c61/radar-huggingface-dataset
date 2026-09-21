# TharunSivamani/hw1-hc3-detector

## Resumen

TharunSivamani/hw1-hc3-detector es un modelo de clasificación de texto publicado en Hugging Face por el usuario TharunSivamani, con arquitectura de tipo BERT (encoder transformer) y 22.713.986 parámetros totales, según los pesos en formato safetensors del repositorio. El pipeline declarado es `text-classification` y el modelo es compatible con `text-embeddings-inference` y con endpoints de Hugging Face. El repositorio tiene un tamaño de 0,1 GB, cero descargas y cero valoraciones en el momento de la consulta, y fue creado el 21 de septiembre de 2026.

El nombre del identificador sugiere que se trata de un detector entrenado sobre HC3 (Human ChatGPT Comparison Corpus), un corpus habitual para la tarea de distinguir texto escrito por humanos de texto generado por modelos como ChatGPT. Es importante subrayar que esta interpretación es una inferencia a partir del nombre del repositorio y no está confirmada en ninguna documentación: la model card es la plantilla automática de Hugging Face y no contiene información sobre el desarrollador, los datos de entrenamiento, las etiquetas de salida ni la licencia.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente cautelar: se trata de un artefacto con pesos válidos y tamaño reducido, pero sin documentación, sin evaluación publicada y sin licencia declarada, lo que restringe seriamente su uso en producción. Se recomienda tratarlo como un experimento de tipo académico o de curso (el prefijo `hw1` apunta a una primera entrega de trabajo práctico) y no como un componente listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer); tag `bert` en el Hub. Configuracion exacta (numero de capas, dimension oculta, cabezas de atencion) no disponible |
| Parametros totales | 22.713.986 (aproximadamente 22,7 millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors; no se publican variantes GGUF, AWQ, GPTQ ni ONNX |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea / pipeline | text-classification |
| Etiquetas de salida | No disponible |
| Tamano del repositorio | 0,1 GB |
| Compatibilidad de despliegue | transformers, text-embeddings-inference, endpoints compatibles |

## Arquitectura y entrenamiento

El unico dato fiable sobre la arquitectura es el tag `bert` del repositorio, que indica una red de tipo encoder transformer entrenada originalmente con objetivos de modelado de lenguaje enmascarado y prediccion de siguiente frase, y adaptada despues a clasificacion de secuencias mediante una cabeza de clasificacion sobre el token especial `[CLS]`. El recuento de 22,7 millones de parametros es coherente con variantes compactas de la familia BERT (BERT-small o un modelo de 6 capas con dimension oculta reducida), aunque no es posible confirmar la configuracion concreta ni si parte de un checkpoint preentrenado publico o de un entrenamiento desde cero.

No hay informacion sobre el conjunto de datos de entrenamiento, el numero de tokens procesados, la composicion del corpus, el regimen de precision (fp32, fp16, bf16) ni la existencia de fases de ajuste fino con RLHF, DPO u otras tecnicas de alineacion, que en un clasificador de este tipo no serian de aplicacion habitual. La model card incluye la plantilla estandar de Hugging Face con todos los campos marcados como "[More Information Needed]" y cita el articulo arXiv:1910.09700 de Lacoste et al. (2019), pero esa referencia aparece en el texto predefinido de la plantilla sobre calculo de emisiones de carbono y no constituye un paper del modelo.

## Capacidades

- Clasificacion de texto: es la unica capacidad confirmada por el pipeline declarado. El modelo devuelve una o varias etiquetas con sus puntuaciones de probabilidad para una secuencia de entrada.
- Deteccion de texto generado por IA: capacidad probable si el nombre `hc3-detector` refleja la tarea real de entrenamiento (distinguir texto humano de texto de ChatGPT). No confirmada por documentacion.
- Generacion de embeddings de frase: el tag `text-embeddings-inference` sugiere compatibilidad con extraccion de representaciones vectoriales, aunque no se documenta ninguna variante especifica para recuperacion.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no soportado. Al ser un encoder de clasificacion, no genera texto ni invoca herramientas.
- Comportamiento agentico o razonamiento multi-paso: no soportado.
- Modo de razonamiento explicito (thinking mode): no soportado.
- Vision, audio o multimodalidad: no soportado; el modelo es exclusivamente de texto.
- Longitud de contexto: no disponible, lo que impide determinar si admite secuencias cortas (por ejemplo, 128 tokens) o el clasico limite de 512 tokens de BERT.

## Casos de uso

- Deteccion de ensayos o trabajos generados con asistentes conversacionales en entornos academicos: si el modelo realmente separa texto humano de texto de ChatGPT, podria puntuar entregas de estudiantes como senal auxiliar para el profesorado, nunca como prueba definitiva.
- Moderacion de contenido en plataformas: uso como clasificador binario de bajo coste para filtrar comentarios antes de pasarlos a un modelo mayor, aprovechando su tamano reducido (22,7 M de parametros) para procesar grandes volumenes en CPU.
- Triaje de tickets de soporte: clasificacion de mensajes entrantes en categorias operativas, con la ventaja de que el modelo entero ocupa menos de 100 MB en memoria y puede ejecutarse en el mismo nodo que el resto de la aplicacion.
- Enriquecimiento de pipelines de datos: etiquetado masivo de corpus para separar contenido sintetico de contenido organico antes de entrenar otros modelos, evitando contaminacion de datos.
- Filtrado previo en sistemas de busqueda o RAG: descarte de documentos generados automaticamente para reducir ruido en un indice de recuperacion, usando el modelo como clasificador de primera etapa.
- Analisis de reputacion de marca: monitorizacion de resenas y menciones para identificar patrones de texto producidos de forma automatizada a gran escala.
- Prototipado e investigacion en deteccion de texto sintetico: uso como linea base ligera para comparar contra detectores mas grandes, dado que su inferencia es barata y reproducible.
- Servicio de clasificacion de baja latencia en el borde: despliegue en dispositivos con recursos limitados o en funciones serverless con limites estrictos de memoria.

En todos los casos, la idoneidad depende de un supuesto no verificado: que las etiquetas del clasificador sean las que sugiere el nombre del repositorio. Sin model card ni evaluacion publicada, cualquier integracion en produccion exige una validacion empirica previa sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no se declaran conjuntos de test ni metricas (accuracy, F1, precision, recall) y la busqueda web no ha devuelto ningun resultado relacionado con el modelo. Tampoco existen datos de latencia o throughput publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB para los pesos en fp32 (22,7 M de parametros x 4 bytes) y unos 45 MB en fp16. Con activaciones y overhead del runtime, el consumo total se mantiene por debajo de 1 GB en cualquier configuracion razonable.
- GPU recomendadas: no requiere GPU dedicada. Funciona en cualquier GPU con al menos 1-2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 y H100. El uso de GPU solo tiene sentido para maximizar throughput en lotes grandes.
- Compatibilidad con GPU de consumo: si, en todas las GPU consumer actuales y en generaciones antiguas. Tambien es viable en CPU, en Raspberry Pi y en entornos moviles mediante exportacion a ONNX.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, endpoints de Hugging Face, ONNX Runtime, TorchScript, y servidores de inferencia genericos compatibles con modelos de clasificacion. No se publican artefactos GGUF ni Ollama, por lo que llama.cpp requeriria una conversion manual.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no procede extrapolar cifras sin datos de validacion.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, por lo que el despliegue en disco es trivial incluso en contenedores minimos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TharunSivamani/hw1-hc3-detector | 22,7 M | No disponible | text-classification | No disponible | Hugging Face, 0 descargas |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings de frase | Apache 2.0 | Hugging Face, ampliamente adoptado |
| distilbert-base-uncased | 66 M | 512 tokens | Codificacion y clasificacion | Apache 2.0 | Hugging Face, muy adoptado |
| bert-base-uncased | 110 M | 512 tokens | Codificacion y clasificacion | Apache 2.0 | Hugging Face, referencia del sector |
| google/bert_uncased_L-4_H-256_A-4 (bert-mini) | 11,2 M | 512 tokens | Codificacion y clasificacion | Apache 2.0 | Hugging Face |

La coincidencia de parametros con all-MiniLM-L6-v2 es exacta en cuanto a magnitud, lo que situa a este modelo en la misma franja de coste computacional que los encoders compactos mas extendidos. La diferencia critica no es tecnica sino documental y legal: las alternativas de la tabla declaran licencia permisiva y disponen de evaluacion publicada, mientras que hw1-hc3-detector carece de ambos elementos, lo que impide una comparacion de rendimiento objetiva.

## Limitaciones y advertencias

- Ausencia total de licencia: al no declararse licencia en el repositorio, no existe autorizacion explicita de uso, lo que genera una incertidumbre juridica significativa para cualquier uso comercial o redistribucion.
- Model card no informativa: todos los campos estan marcados como "[More Information Needed]", incluidos desarrollador, datos de entrenamiento, hiperparametros, evaluacion e impacto ambiental.
- Sin evaluacion publicada: se desconoce la precision, el recall y el F1 del modelo, asi como el umbral de decision recomendado.
- Etiquetas de salida desconocidas: no se documenta el mapeo de `id2label`, de modo que el significado de cada clase debe inferirse inspeccionando la configuracion del repositorio.
- Riesgo de falsos positivos y falsos negativos: los detectores de texto generado por IA son sensibles a cambios de dominio, al idioma, a la longitud del texto y al modelo generador empleado; un detector entrenado sobre un corpus concreto degrada rapidamente frente a generadores mas recientes.
- Sesgo potencial de dominio: si el entrenamiento se realizo sobre HC3, la distribucion de datos se corresponde con respuestas de ChatGPT en dominios especificos, lo que puede sesgar las predicciones hacia ese estilo y penalizar textos academicos o tecnicos legitimos.
- Riesgo de discriminacion de hablantes no nativos: es un fenomeno documentado en esta familia de detectores y debe tenerse en cuenta antes de aplicar el modelo a evaluaciones academicas o laborales.
- Ausencia de validacion independiente: con cero descargas y cero valoraciones, no hay evidencia de terceros sobre el comportamiento del modelo.
- Contexto y multilingueismo sin especificar: se desconoce la longitud maxima de entrada y los idiomas cubiertos, lo que puede provocar truncamientos silenciosos o resultados invalidos en entradas largas o no inglesas.
- Fechas de creacion y actualizacion anotadas como septiembre de 2026, sin historial de versiones que permita auditar cambios.
- No apto para decisiones automatizadas de alto impacto sin supervision humana, dado que la falta de evaluacion impide estimar la tasa de error.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TharunSivamani/hw1-hc3-detector
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning mencionada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada. Los resultados obtenidos corresponden a contenidos sin relacion con el modelo (Antologia de Spoon River).
