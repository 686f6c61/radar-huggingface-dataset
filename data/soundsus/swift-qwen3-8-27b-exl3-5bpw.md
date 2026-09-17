# Soundsus/Swift-Qwen3.8-27b-exl3-5bpw

## Resumen

Soundsus/Swift-Qwen3.8-27b-exl3-5bpw es una cuantización de 5 bits por peso (5 bpw) en formato EXL3 (ExLlamaV3) del modelo Swift-Qwen3.8-27B de UkisAI, que a su vez es un derivado orientado a eficiencia de razonamiento del Qwen3.8-27B. El modelo base se presenta como un modelo de razonamiento "token-efficient": según su autor, reduce el número de tokens de pensamiento en un 58,3% manteniendo una pérdida de rendimiento inferior al 1% respecto al original, lo que se traduce en una aceleración de hasta 1,95x en varias tareas. Esta ficha corresponde a la variante cuantizada subida por el usuario Soundsus, no al modelo original.

El pipeline declarado es image-text-to-text, lo que implica capacidades multimodales de entrada imagen + texto, y las etiquetas del repositorio incluyen `reasoning`, `token-efficient`, `conversational` y `qwen3_8`. La relevancia práctica de esta versión concreta es que reduce el peso del modelo a un repositorio de 19,8 GB, lo que lo sitúa en el rango de despliegue en GPU de consumo de gama alta (24-32 GB de VRAM) con runtimes compatibles con EXL3, algo inviable con los pesos completos si el modelo original ronda los 27.000 millones de parámetros.

Conviene señalar dos cautelas importantes desde el principio: el repositorio está marcado como `gated: true`, y el recuento de parámetros real declarado en los safetensors (9.885.144.448) no coincide con la nomenclatura "27b" del nombre ni con el tamaño del repositorio (19,8 GB), una discrepancia que se detalla en la sección de limitaciones. Además, no se han publicado resultados de benchmarks independientes en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivado multimodal de Qwen3.8-27B (pipeline image-text-to-text) |
| Parametros totales | 9.885.144.448 según metadatos de safetensors; el nombre del modelo indica 27B (discrepancia no aclarada) |
| Parametros activos | No disponible (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) a 5 bits por peso (5 bpw) |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License 1.0 (`license: other`) |
| Formato de pesos | Safetensors (cuantización EXL3) |
| Libreria declarada | transformers |
| Pipeline | image-text-to-text |
| Modelo base | ukisai/Swift-Qwen3.8-27b (relación: finetune) |
| Tamaño del repositorio | 19,8 GB |
| Fecha de publicacion | 17 de septiembre de 2026 |
| Ultima actualizacion | 17 de septiembre de 2026 |
| Acceso | Restringido (`gated: true`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su naturaleza multimodal (image-text-to-text) y su linaje: ukisai/Swift-Qwen3.8-27b, presentado por UkisAI como un derivado de Qwen3.8-27B orientado a eficiencia de tokens de razonamiento. No se especifican el número de capas, la dimensión oculta, el tipo de atención, la presencia de Mixture of Experts ni el mecanismo concreto de visión. Tampoco se detallan los datos de entrenamiento del modelo base: no hay cifras de tokens, composición del dataset, ni confirmación de si se emplearon RLHF, DPO u otras técnicas de alineamiento.

Lo único documentado por el autor es el objetivo de optimización del modelo base: reducir el consumo de tokens de pensamiento en un 58,3% con una pérdida de calidad declarada inferior al 1% y una aceleración de hasta 1,95x en varias tareas. La ficha que nos ocupa es exclusivamente un proceso de cuantización: los pesos del modelo base se han convertido a EXL3 a 5 bits por peso, una técnica de cuantización con calibración que agrupa pesos y aplica escalas por bloque para minimizar el error. No se documentan el dataset de calibración, el número de muestras usadas ni la metodología de evaluación de la degradación introducida por la cuantización. En consecuencia, cualquier afirmación sobre fidelidad respecto al modelo original es una estimación del autor y no un resultado verificado.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento con modo de pensamiento eficiente en tokens: el modelo base declara un 58,3% menos de tokens de razonamiento que su predecesor, con pérdida declarada inferior al 1%.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`): el modelo acepta imágenes junto a instrucciones textuales. No se detalla la resolución de imagen soportada, el número de tokens visuales ni las tareas de visión evaluadas.
- Generación y razonamiento sobre código: el material promocional del modelo base usa un ejemplo de LiveCodeBench v6 como prompt de demostración, lo que sugiere uso previsto en tareas de programación competitiva y razonamiento algorítmico. No hay resultados publicados que lo cuantifiquen en esta variante.
- Soporte de tool calling / function calling: no disponible. La model card consultada no menciona explícitamente capacidades de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita. El modo de razonamiento con tokens de pensamiento es compatible con flujos multi-paso, pero no se documenta ninguna integración de agente.
- Capacidades multilingües: no disponibles. No se declara lista de idiomas.
- Capacidad especial de modo pensamiento: sí, heredada del modelo base (`reasoning`, `token-efficient`).

## Casos de uso

- Razonamiento matemático y algorítmico en autohospedaje: el modo de pensamiento eficiente reduce el coste por consulta en tareas donde el modelo genera cadenas de razonamiento largas. Al recortar un 58,3% los tokens de pensamiento según el autor, el coste de inferencia y la latencia bajan de forma proporcional en problemas tipo competición o verificación formal.
- Asistencia a la programación en local: con 19,8 GB de pesos cuantizados, el modelo puede desplegarse en una estación de trabajo con una sola GPU de 24-32 GB y servir como asistente de código sin enviar el código a terceros, algo relevante para entornos con requisitos de confidencialidad.
- Análisis de documentación técnica con imágenes: al ser un modelo image-text-to-text, permite extraer y razonar sobre diagramas, capturas de interfaces, planos o tablas escaneadas combinados con preguntas en lenguaje natural, por ejemplo para generar documentación a partir de esquemas.
- Evaluación comparativa de cuantizaciones: este repositorio sirve como punto de medida para estudiar la degradación de EXL3 a 5 bpw frente a los pesos completos y frente a la variante GGUF del mismo modelo base, en un contexto de investigación sobre cuantización.
- Prototipado de producto conversacional: la etiqueta `conversational` y su naturaleza multimodal permiten construir asistentes de soporte que reciben capturas de pantalla del usuario y mantienen un diálogo multi-turno, siempre que el despliegue respete los límites de la licencia.
- Investigación en eficiencia de razonamiento: al derivar de un modelo explícitamente optimizado para reducir tokens de pensamiento, es un candidato para estudiar la relación entre longitud de cadena de razonamiento, precisión y latencia en tareas de razonamiento de varios pasos.
- Despliegue con API compatible con endpoints: la etiqueta `endpoints_compatible` sugiere que el repositorio puede servirse a través de infraestructura de endpoints de Hugging Face, lo que facilita pruebas de integración sin montar el stack completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite, ni para esta cuantización ni para el modelo base en la documentación consultada.

Las únicas cifras existentes son afirmaciones del autor del modelo base, no resultados verificados ni mediciones independientes de esta cuantización:

| Metrica declarada | Valor | Alcance |
|---|---|---|
| Reduccion de tokens de pensamiento | 58,3% | Modelo base Swift-Qwen3.8-27B frente a Qwen3.8-27B |
| Perdida de rendimiento | < 1% | Declarada por el autor, sin detalle de la suite de evaluacion |
| Aceleracion | x1,95 | "En varias tareas"; no se especifica cuales |
| Benchmarks de esta cuantizacion EXL3 5 bpw | No disponible | No se han publicado |

No se dispone de mediciones de perplejidad, de comparación entre los pesos completos y los cuantizados, ni de ningún dato de latencia o throughput para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio ocupa 19,8 GB, por lo que la carga de pesos requiere del orden de 19-20 GB de VRAM (estimación derivada del tamaño del repositorio, no de una ficha oficial).
- VRAM total en inferencia: hay que sumar la caché KV y los búferes de activaciones. La longitud de contexto no está documentada, así que no puede darse una cifra fiable de VRAM para contexto largo; a mayor contexto, mayor consumo adicional sobre los 19-20 GB base.
- GPU de 24 GB: una RTX 3090 o RTX 4090 permitiría cargar los pesos en el límite, con margen reducido para contexto y con posible uso de memoria del sistema. Es un escenario ajustado.
- GPU de 32 GB o mas: una RTX 5090 (32 GB), una V100 de 32 GB o una A100 de 40 GB ofrecen margen suficiente para contexto moderado y son el objetivo natural de esta cuantización.
- GPU de 48-80 GB: A6000, L40S, A100 80 GB o H100 permiten contexto largo y mayor concurrencia de peticiones.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 24 GB o más, aunque con contexto limitado. En tarjetas de 16 GB no cabe con esta cuantización.
- Opciones de despliegue: al tratarse de una cuantización EXL3, el runtime natural es ExLlamaV3 y servidores construidos sobre él, como TabbyAPI. La librería declarada en el repositorio es `transformers` y existe la etiqueta `endpoints_compatible`, pero no se confirma en la información disponible el soporte completo en vLLM, llama.cpp, Ollama o TGI para este formato (llama.cpp y Ollama trabajan con GGUF, no con EXL3; para esos runtimes habría que usar la variante GGUF publicada por UkisAI).
- Latencia y throughput: no disponible. No se han publicado mediciones para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soundsus/Swift-Qwen3.8-27b-exl3-5bpw (este) | 9,89 B declarados en safetensors; nombre indica 27B | EXL3, 5 bpw, safetensors, 19,8 GB | No disponible | Swift Open License 1.0, con umbral de 1 M USD de ingresos | Repositorio gated, 0 descargas, 0 likes |
| ukisai/Swift-Qwen3.8-27b (modelo base) | No disponible | Pesos originales, precision no especificada | No disponible | Swift Open License 1.0 | Referenciado como base de esta cuantizacion |
| ukisai/Swift-Qwen3.8-27B-GGUF | No disponible | GGUF (niveles de cuantizacion no detallados) | No disponible | Swift Open License 1.0 (no confirmado en la informacion disponible) | Publicado por UkisAI; enlazado desde la model card |
| Qwen3.8-27B (modelo de origen del linaje) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | No verificado en la busqueda |

La comparación cuantitativa con alternativas de terceros no es posible con los datos disponibles: no hay cifras de rendimiento publicadas para ninguno de los modelos de la tabla, y el recuento de parámetros del modelo base y de la variante GGUF no se ha facilitado. La diferencia funcional clara entre las tres variantes de la familia es el formato: EXL3 5 bpw para ExLlamaV3, GGUF para llama.cpp y derivados, y pesos originales para transformers.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: el nombre del modelo indica 27B, los metadatos de safetensors declaran 9.885.144.448 parámetros y el repositorio pesa 19,8 GB. Las tres cifras son difíciles de reconciliar sin conocer la estructura real del modelo; conviene verificar el conteo por capas antes de dimensionar hardware.
- Licencia con umbral comercial: la Swift Open License 1.0 permite uso personal, de investigación, educativo, de evaluación y comercial a individuos y organizaciones con ingresos recurrentes anuales (incluidas filiales) de hasta 1.000.000 USD. Por encima de ese umbral se exige una Swift Enterprise License con contacto directo al proveedor. Es una restricción relevante para empresas medianas y grandes.
- Repositorio restringido: el modelo está marcado como `gated: true`, por lo que es necesario solicitar acceso y aceptar condiciones antes de la descarga.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de terceros sobre el comportamiento real de esta cuantización.
- Sin benchmarks: no existe ninguna medición publicada de la degradación introducida por la cuantización EXL3 a 5 bpw respecto a los pesos del modelo base. Las afirmaciones de "<1% de pérdida" y "1,95x de aceleración" proceden del autor del modelo base y no de una evaluación independiente.
- Riesgo de alucinacion: no cuantificado en la información disponible. Como en cualquier modelo generativo, persiste el riesgo de fabricación de hechos, especialmente en tareas de razonamiento largo donde la reducción de tokens de pensamiento puede recortar pasos de verificación.
- Idiomas no declarados: no se especifica qué idiomas soporta ni con qué calidad, lo que impide asumir un rendimiento aceptable en castellano sin pruebas propias.
- Contexto no documentado: al desconocerse la longitud de contexto, no puede garantizarse el comportamiento en conversaciones largas ni en tareas de recuperación sobre documentos extensos.
- Dependencia de runtime: al ser EXL3, el despliegue queda ligado al ecosistema ExLlamaV3. Otros servidores populares (vLLM, TGI, Ollama, llama.cpp) requieren formatos distintos, lo que limita la portabilidad de esta variante concreta.
- Capacidades multimodales sin detalle: aunque el pipeline es image-text-to-text, no se documentan la resolución de imagen, la política de preprocesado, ni los idiomas presentes en los textos de las imágenes.
- Tool calling y uso como agente: no confirmados. No se debe asumir soporte de function calling en producción sin verificación previa.
- Sesgos: no disponible. No hay información sobre evaluación de sesgos, toxicidad o seguridad para este modelo ni para su base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soundsus/Swift-Qwen3.8-27b-exl3-5bpw
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Variante GGUF del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Sitio web de UkisAI: https://ukisai.com
- Pagina de producto del modelo: https://ukisai.com/products/swift
- Contacto para licencia empresarial: https://ukisai.com/contact
- Demo en video del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/resolve/main/swift-speed-demo.mp4
- Citacion (BibTeX): Swift-Qwen3.8-27B, UkisAI, 2026, url https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Enlaces relevantes de la busqueda web: no se han encontrado. Los resultados devueltos por la búsqueda (artículos de consumo sobre Amazon Haul, el sistema de pagos Wero y lanzamientos de DVD) no guardan relación con este modelo y se han descartado.
