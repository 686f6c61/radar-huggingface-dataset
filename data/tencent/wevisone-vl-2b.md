# tencent/WeVisOne-VL-2B

## Resumen

WeVisOne-VL-2B es un modelo de visión-lenguaje desarrollado por WeChat Vision (Tencent Inc.) que unifica percepción a nivel de objeto y a nivel de píxel dentro de un único modelo conversacional. La propuesta consiste en formular tareas de detección de objetos de vocabulario abierto, localización referencial, conteo, pointing, OCR, segmentación referencial y matting alfa como predicción estructurada de siguientes tokens, apoyándose en un decodificador de píxeles ligero de 9,5 millones de parámetros acoplado al modelo base.

El modelo se construye sobre Qwen3-VL y cuenta con 2.441.744.384 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de 2-3B, adecuada para despliegue en una sola GPU. Su interés práctico radica en sustituir pipelines de varios modelos especializados (detector, segmentador, modelo de matting, motor de OCR) por una sola inferencia con salidas estructuradas: cajas normalizadas, puntos, máscaras de instancia y canales alfa continuos a resolución completa.

La relevancia actual viene de la demanda de anotación automática y de percepción unificada para agentes visuales y robótica, donde interesa obtener localización precisa y máscaras densas con un coste de cómputo contenido. La versión analizada no incluye cadena de razonamiento explícita y está orientada a percepción de imagen en un solo turno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL) con decodificador de píxeles acoplado (adaptador de características visuales, decodificador de consultas guiado por caja con 6 bloques de cross-attention deformable y cabeza densa `FullCanvasAlphaCascadeHead`) |
| Parametros totales | 2.441.744.384 (~2,44 B) según safetensors; el decodificador de máscaras añade 9.511.460 parámetros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada (los pesos se publican en safetensors; el repositorio ocupa 9,8 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (código y pesos de Tencent; los componentes de terceros conservan sus licencias originales) |
| Formato de pesos | safetensors (modelo principal) + `mask_decoder.pt` (PyTorch, componente obligatorio) |

## Arquitectura y entrenamiento

WeVisOne-VL sigue un esquema de predicción estructurada de siguientes tokens sobre un backbone Qwen3-VL. La localización se codifica con tokens de coordenadas dedicados (`<0>` a `<1000>`) que representan cajas delimitadoras y puntos normalizados, y el modelo devuelve explícitamente `None` cuando el objetivo consultado no está presente, lo que reduce falsos positivos en tareas de grounding. Para las tareas densas se emite un token de instancia especial (`<OBJ>`, ID 152678) después de cada caja predicha, que actúa como anclaje para la generación de máscaras.

El componente denso es un decodificador de 9.511.460 parámetros que combina tres piezas: un adaptador de características visuales sobre características del ViT de Qwen3-VL previas al merging en varios niveles; un decodificador de consultas guiado por caja con 6 bloques de cross-attention deformable inicializados a partir del estado oculto de `<OBJ>` y de la caja codificada con rasgos de Fourier; y una cabeza de predicción densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que refina en escalas S/4, S/2 y S/1 para producir mattes alfa continuos a stride 1. No se han publicado en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Detección de objetos de vocabulario abierto con salida de cajas normalizadas en el rango 0-1000.
- Comprensión de expresiones referenciales (referring expression comprehension) y localización de la región descrita en lenguaje natural.
- Conteo de objetos y pointing (predicción de puntos sobre instancias).
- OCR con localización de texto en la imagen.
- Segmentación referencial: máscaras de instancia a partir de una caja o de una descripción textual.
- Matting alfa promptable: canal alfa continuo a resolución completa (stride 1), útil para recorte fino y transparencias.
- Abstención explícita devolviendo `None` cuando el objetivo consultado no aparece en la imagen.
- Interfaz conversacional de un solo turno sobre imagen, con paquete de inferencia propio (`wevisone_vl`).
- No dispone de modo de razonamiento explícito (sin CoT) y el decodificador de píxeles rechaza rejillas de vídeo.

## Casos de uso

- Anotación automática de datasets: pre-etiquetado de cajas y máscaras para conjuntos de datos de detección y segmentación, con revisión humana posterior; el token `<OBJ>` por instancia permite emparejar cada caja con su máscara sin pasos adicionales.
- Matting para comercio electrónico y postproducción: generación de canales alfa a resolución completa a partir de un prompt como "persona" o "producto", sustituyendo herramientas interactivas de recorte en flujos de catálogo.
- Digitalización de documentos con OCR localizado: extracción de texto junto con su posición, útil para reconstruir el layout de facturas, formularios y albaranes antes de un paso de parsing.
- Robótica e interacción física: grounding referencial y pointing para convertir una instrucción del tipo "coge la taza roja" en una coordenada sobre la imagen que el sistema de manipulación pueda usar como objetivo.
- Inspección visual industrial: detección de vocabulario abierto para localizar defectos descritos por el operario sin reentrenar un detector específico, con máscara para medir el área afectada.
- Conteo en retail y agricultura: recuento de unidades en estanterías, palés o parcelas, con la posibilidad de devolver `None` cuando no hay objetivo y evitar conteos espurios.
- Moderación y análisis de contenido visual: localización de regiones sensibles y generación de máscaras para redacción selectiva de zonas de una imagen.
- Asistentes de edición de imagen: integración en un editor para seleccionar, recortar y segmentar por descripción textual dentro de una conversación de un turno por acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 5 GB solo para pesos (2,44 B de parámetros más 9,5 M del decodificador); con caché de activaciones del ViT a resolución alta y la salida de matting a stride 1, conviene reservar 8-12 GB. Cálculo propio a partir del número de parámetros, no un dato publicado.
- En cuantización de 8 bits los pesos bajarían a unos 2,5 GB y en 4 bits a unos 1,3 GB (estimación); no se han publicado checkpoints cuantizados en la información disponible, por lo que estas cifras son orientativas.
- GPU profesionales: A100 (40/80 GB), H100, L40S o A10G son suficientes con holgura; para lotes grandes o imágenes de alta resolución conviene priorizar memoria.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090. En tarjetas de 8 GB el modelo en bf16 queda muy justo y conviene reducir resolución de entrada.
- Despliegue: el paquete oficial `wevisone_vl` (disponible en GitHub) con `device="auto"` y `dtype="bfloat16"`; al ser un modelo de transformers con arquitectura `qwen3_vl`, es compatible con stacks habituales de servido (vLLM, TGI) en la medida en que soporten dicha arquitectura, aunque la información disponible no confirma integraciones probadas ni recetas de llama.cpp u Ollama.
- El decodificador `mask_decoder.pt` es obligatorio para las tareas densas y debe cargarse junto al modelo principal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas unificadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeVisOne-VL-2B | 2,44 B + 9,5 M (decoder) | No disponible | Detección, grounding, conteo, pointing, OCR, segmentación referencial, matting alfa | Apache 2.0 | HuggingFace + GitHub |
| Qwen3-VL (modelo base) | No disponible en la información proporcionada | No disponible | Visión-lenguaje general; sin cabeza de matting ni tokens de instancia documentados aquí | No disponible en la información proporcionada | HuggingFace |
| Segmentadores referenciales tipo SAM | No disponible | No disponible | Segmentación a partir de prompts (caja o punto), sin salida textual ni conteo | No disponible | No disponible |
| Detectores de vocabulario abierto tipo Grounding DINO | No disponible | No disponible | Detección por texto, sin máscaras alfa ni OCR | No disponible | No disponible |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada no incluye parámetros, contexto ni resultados de benchmarks de los modelos de referencia. La diferencia funcional observable es que WeVisOne-VL integra en una sola inferencia tareas que habitualmente requieren modelos separados de detección, segmentación y matting.

## Limitaciones y advertencias

- Los bordes finos del canal alfa son sensibles a la resolución de la imagen, a oclusiones severas, a transparencias complejas y a la formulación del prompt.
- El modelo genera salidas estructuradas sin cadena de razonamiento explícita, lo que limita tareas que requieran inferencia multi-paso sobre la imagen.
- Solo admite percepción de imagen en un único turno; el decodificador de píxeles rechaza rejillas de vídeo.
- No se documentan sesgos concretos ni la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos o culturales.
- Riesgo de alucinación en las descripciones textuales asociadas a la imagen y de localizaciones imprecisas en escenas muy densas; la abstención vía `None` mitiga pero no elimina los falsos positivos.
- La lista de idiomas soportados no está publicada; el rendimiento multilingüe, incluido el castellano, no está garantizado por la documentación.
- Uso previsto limitado a investigación: la model card indica explícitamente que no está destinado a decisiones autónomas de alto impacto ni a identificar personas, lo que afecta a despliegues de reconocimiento biométrico o vigilancia.
- Licencia Apache 2.0 para el código y pesos de Tencent, pero los componentes de terceros conservan sus licencias; es necesario revisar los ficheros fuente antes de un uso comercial.
- El tamaño del repositorio (9,8 GB) es notablemente superior al de los pesos en bfloat16, por lo que conviene comprobar qué artefactos adicionales se descargan antes de aprovisionar almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/WeVisOne-VL-2B
- Repositorio de inferencia en GitHub: https://github.com/Tencent/WeVisOne-VL
- Página corporativa de Tencent: https://www.tencent.com/
- Sobre Tencent: https://www.tencent.com/en-us/about.html.html
- Tencent en Wikipedia: https://en.wikipedia.org/wiki/Tencent
- Tencent en Wikipédia (francés): https://fr.wikipedia.org/wiki/Tencent
- Artículo divulgativo sobre Tencent: https://www.lebigdata.fr/tencent-tout-savoir

Nota: los enlaces de la búsqueda web correspondent a páginas corporativas generales de Tencent y no aportan documentación técnica sobre el modelo; no se han encontrado en la búsqueda paper, blog técnico ni demo específicos de WeVisOne-VL.
