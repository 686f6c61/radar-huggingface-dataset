# Zubr-AI/zubr-mini-1.9-8b

## Resumen

`zubr-mini-1.9-8b` es un modelo de lenguaje multimodal (imagen-texto-a-texto) de 8.489.553.920 parámetros publicado por Zubr-AI (autor también citado como alekringtonnn-ai) y afinado a partir de `mistralai/Ministral-3-8B-Instruct-2512` de Mistral AI. Se distribuye únicamente en formato GGUF, con seis niveles de cuantización orientados a inferencia local en CPU, GPU de consumo y servidores modestos. Su propuesta diferencial es el "fast thinking": el razonamiento compacto se integra dentro del propio texto de respuesta en lugar de desplegarse como una fase separada de cadena de pensamiento larga, lo que reduce el número de tokens generados y el coste por consulta.

El modelo hereda la arquitectura mistral3 del modelo base, con una torre de visión integrada de forma nativa en el mismo grafo en lugar de actuar como un módulo externo. Según la model card, el motor de visión se ha ampliado de 1.000 a 2.000 millones de parámetros respecto a la versión anterior de la familia, con mejoras declaradas en reconocimiento de detalles, OCR, diagramas y tablas. La familia se completa con una variante de 3B (`alekringtonnn-ai/zubr-mini-1.9-3b`) y una versión MLX para Mac.

Es relevante ahora por tres motivos: cubre el hueco de modelos multimodales de 8B ejecutables en hardware de consumo, publica pesos con licencia Apache 2.0 (uso comercial permitido) y declara soporte para 48 idiomas, incluidos ruso, bielorruso, ucraniano y español. Como contrapartida, el repositorio no incluye resultados de benchmarks ni detalla la longitud de contexto, y su adopción es todavía prácticamente nula (0 descargas, 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal densa, arquitectura mistral3 unificada (torre de visión + modelo de lenguaje en el mismo modelo) |
| Parametros totales | 8.489.553.920 (8,49 mil millones), dato real de safetensors |
| Parametros activos | No aplica: modelo denso. El motor de visión se amplió de 1 B a 2 B según el autor |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF: IQ2_M (~3,11 GB), Q2_K (~3,35 GB), Q3_K_S (~3,87 GB), Q3_K_M (~4,24 GB), Q4_0 (~4,94 GB), Q5_K_S (~5,92 GB). El repo incluye la etiqueta `imatrix` |
| Idiomas soportados | 48 idiomas: ru, be, en, es, fr, de, nl, ja, it, pl, da, ro, el, uk, br, ar, fa, tr, bn, id, hi, ne, pa, ta, te, zh, pt, ga, uz, tg, tk, lt, sr, bg, sv, fi, ca, gl, is, mr, kn, kk, bs, he, ur, cy, rm, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (seis ficheros de cuantización); el repo declara la librería `transformers` y `endpoints_compatible`, pero no se detalla la presencia de safetensors |
| Tamano del repositorio | 25,4 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | mistralai/Ministral-3-8B-Instruct-2512-GGUF |
| Fecha de publicacion | 2026-10-25 |

## Arquitectura y entrenamiento

El modelo parte de `Ministral-3-8B-Instruct-2512` (cadena: `Ministral-3-8B-Base-2512` → versión instruct → GGUF → fine-tune de Zubr-AI). La arquitectura es mistral3 en configuración multimodal unificada: la torre de visión no se acopla como un adaptador externo, sino que forma parte del mismo modelo, de modo que el procesamiento de imagen y la generación de lenguaje comparten el grafo. El autor indica que el componente de visión pasó de 1.000 a 2.000 millones de parámetros respecto a la iteración previa, lo que explicaría parte del total de 8,49 B.

El entrenamiento se describe a nivel de formato de datos más que de volumen: cada ejemplo de entrenamiento contenía contexto, pregunta y el inicio de pequeños pasos de razonamiento (cadenas de pensamiento cortas). El efecto buscado es que el razonamiento compacto quede entreverado en la respuesta final en lugar de constituir una fase previa y oculta. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras etapas de alineación posteriores al fine-tune. Tampoco se detalla la receta de cuantización más allá de los seis niveles publicados y del uso de `imatrix`.

## Capacidades

- Generación de texto conversacional multi-turno en 48 idiomas, con especial atención declarada al ruso y a las lenguas eslavas orientales (bielorruso, ucraniano).
- Comprensión de imágenes en tareas image-text-to-text: imagen más pregunta textual produce una respuesta textual.
- OCR y lectura de texto dentro de imágenes, con mejora atribuida a la ampliación del motor de visión.
- Interpretación de diagramas, tablas y detalles visuales finos, según declara el autor.
- Razonamiento compacto integrado en la respuesta ("fast thinking"), sin fase separada de pensamiento largo, lo que reduce tokens generados y latencia percibida.
- Ejecución local en CPU y GPU mediante formatos GGUF (Ollama, llama.cpp, vLLM, LM Studio).
- Conversación multimodal: alternancia de turnos con imagen y texto en el mismo hilo.
- No disponible: soporte de tool calling o function calling, modo de agentes, capacidades de audio o vídeo, y modo "thinking" explícito separable. La información proporcionada no los menciona.

## Casos de uso

- Digitalización de documentos con OCR: el modelo recibe la fotografía de una factura, un formulario o un albarán y devuelve el texto y los campos relevantes en formato estructurado; encaja por la mejora declarada en reconocimiento de texto en imagen y por poder ejecutarse en local sin enviar documentos sensibles a la nube.
- Asistencia técnica sobre capturas de pantalla: un usuario envía una captura de un error o de un panel de configuración y el modelo describe el problema y propone pasos concretos, aprovechando el diálogo multimodal multi-turno.
- Análisis de tablas e informes escaneados: extracción de series de datos o comparación de columnas a partir de imágenes de tablas, útil en auditoría y contabilidad donde los originales llegan en PDF/imagen.
- Atención al cliente multilingüe en mercados de Europa del Este: con 48 idiomas declarados, incluidos ruso, ucraniano, bielorruso, polaco, checo y letón, un mismo despliegue puede atender consultas en la lengua del cliente sin enrutado por idioma.
- Asistente local para puestos de trabajo sin GPU dedicada: con la cuantización Q4_0 (~4,94 GB) y un equipo de 8-12 GB de RAM, se puede desplegar un asistente que resuma, redacte y responda sobre imágenes sin coste de API.
- Clasificación y triaje de imágenes en pipelines internos: preetiquetado de imágenes de producto, tickets con adjuntos o capturas de monitorización, con el modelo como primer filtro antes de la revisión humana.
- Prototipado rápido de producto multimodal: al ser Apache 2.0 y estar disponible en GGUF, permite validar una idea de funcionalidad visión+lenguaje en horas con Ollama antes de comprometerse con un proveedor comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica cuantitativa, ni comparaciones medidas frente al modelo base.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: IQ2_M ~3,11 GB, Q2_K ~3,35 GB, Q3_K_S ~3,87 GB, Q3_K_M ~4,24 GB, Q4_0 ~4,94 GB, Q5_K_S ~5,92 GB de pesos.
- Regla del autor: reservar al menos el doble del tamaño del fichero en RAM. Guía práctica: ~6-8 GB para IQ2_M, ~8 GB para Q2_K y Q3_K_S, ~8-12 GB para Q4_0 (recomendado), ~12-16 GB para Q5_K_S.
- CPU: se requiere soporte AVX/AVX2 (prácticamente cualquier x86 moderno) o ARM; la GPU es opcional pero deseable para tareas de visión.
- GPU: no se especifican modelos concretos. Con ~5 GB de pesos en Q4_0, el modelo cabe en GPUs de consumo de 8 GB o más, y con Q5_K_S en tarjetas de 12-16 GB; para A100/H100 no hay datos publicados de throughput.
- Despliegue: Ollama (vía más sencilla según el autor), llama.cpp, vLLM, LM Studio y, por la etiqueta `endpoints_compatible`, endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles. El autor afirma respuestas más rápidas y menos tokens consumidos gracias al razonamiento integrado, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zubr Mini 1.9 8B | 8,49 B (denso) | No disponible | Imagen-texto-a-texto | Apache 2.0 | GGUF, 6 cuantizaciones |
| Ministral-3-8B-Instruct-2512 (base) | ~8 B | No disponible en la información proporcionada | Texto (la variante multimodal es la base declarada del fine-tune) | Términos de Mistral AI (no confirmados aquí) | Pesos originales y GGUF |
| Zubr Mini 1.9 3B (mismo autor) | ~3 B | No disponible | Multimodal, misma familia | Apache 2.0 según el autor | GGUF y versión MLX |
| Otros multimodales de ~7-9B | No disponible | No disponible | Imagen-texto-a-texto | Variable | No comparado en la información disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad frente al modelo base ni frente a competidores; la mejora en visión y razonamiento es una afirmación del autor.
- La longitud de contexto no se documenta, lo que impide planificar cargas con documentos largos o historiales extensos.
- Las cuantizaciones IQ2_M, Q2_K y Q3_K_S degradan la calidad de forma reconocida por el propio autor ("la calidad se resiente notablemente" en IQ2_M); el mínimo razonable recomendado es Q3_K_S, y el óptimo de la familia es Q5_K_S.
- El razonamiento integrado en la respuesta reduce tokens, pero puede producir cadenas de razonamiento incompletas o implícitas, difíciles de auditar en entornos que exigen trazabilidad del proceso.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo estándar en modelos de 8B, especialmente en OCR de imágenes de baja calidad y en idiomas de bajos recursos del conjunto declarado.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en los 48 idiomas anunciados. El soporte declarado de 48 idiomas no implica calidad homogénea; el ruso y el inglés reciben presumiblemente más atención que el resto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo deriva de Ministral 3 de Mistral AI; conviene verificar las condiciones de la licencia del modelo base antes de un despliegue comercial.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin issues ni validación externa conocida. No es un modelo recomendable como dependencia crítica de producción sin una evaluación propia previa.
- La model card disponible está truncada: no cubre la totalidad de instrucciones de uso, plantillas de prompt ni limitaciones declaradas por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-GGUF
- Versión 3B de la familia: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b
- Versión MLX para Mac del 3B: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b-mlx
- Ficheros de cuantización: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b/tree/main
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
