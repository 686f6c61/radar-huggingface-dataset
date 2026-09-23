# SpaceTimee/Suri-Qwen-3.8-Uncensored-27B

## Resumen

Suri-Qwen-3.8-Uncensored-27B es un modelo publicado en HuggingFace por el usuario SpaceTimee, con un total de 27.356.728.560 parámetros (unos 27,36 mil millones) según los metadatos de sus ficheros safetensors, y un repositorio de 54,8 GB. El nombre y las etiquetas del repositorio sugieren que se trata de un ajuste fino de la familia Qwen (etiqueta `qwen3_5`), con orientación conversacional y capacidades multimodales de imagen-texto (`image-text-to-text`), además de una modificación de alineación de seguridad indicada por el término "Uncensored". Sin embargo, la model card publicada es la plantilla automática de HuggingFace sin ningún apartado completado, por lo que el autor no documenta ni el modelo base exacto, ni el procedimiento de entrenamiento, ni los datos utilizados.

El problema que pretende resolver, según la única información disponible (nombre y etiquetas), es el de un asistente conversacional multimodal de ~27B sin los filtros de rechazo habituales de los modelos alineados. Esto lo sitúa en el segmento de modelos de tamaño medio-grande que caben en una GPU profesional de 80 GB en precisión bf16 o en GPUs de consumo de 24 GB si se cuantizan a 4 bits.

No obstante, la relevancia práctica del modelo está muy limitada por su estado de documentación: cero descargas, cero "likes", licencia no declarada, idiomas no declarados, sin benchmarks, sin código de ejemplo y sin enlaces a paper, repositorio o demo. Cualquier evaluación seria exige inspeccionar los pesos y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica `qwen3_5`; el autor no publica detalles de capas, atención ni configuración) |
| Parametros totales | 27.356.728.560 (≈27,36 mil millones), dato de los metadatos de safetensors |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni la model card ni los metadatos la declaran) |
| Formato de pesos | safetensors (biblioteca transformers) |
| Modalidad | image-text-to-text (multimodal con entrada de imagen y texto) |
| Uso declarado | conversational |
| Tamanio del repositorio | 54,8 GB |
| Fecha de creacion | 2026-09-23 (según metadatos del Hub) |
| Ultima actualizacion | 2026-09-23 (según metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento ni la composición del dataset. La única referencia técnica es la etiqueta `qwen3_5` del repositorio, que apunta a un modelo de la familia Qwen, y la etiqueta de pipeline `image-text-to-text`, que implica la presencia de un codificador visual o de un mecanismo de proyección de imágenes junto al decodificador de lenguaje. Tampoco se documenta si hubo fases de RLHF, DPO u otra técnica de alineación; el sufijo "Uncensored" sugiere, sin confirmarlo, una reducción o eliminación del ajuste de seguridad posterior al entrenamiento.

El tamaño del repositorio (54,8 GB) es coherente con aproximadamente 2 bytes por parámetro (27,36B × 2 ≈ 54,7 GB), lo que indica que los pesos se distribuyen en bf16 o fp16. Esto es una inferencia aritmética a partir del tamaño y del recuento de parámetros, no un dato confirmado por el autor. No hay información sobre tokens de entrenamiento, innovaciones de atención, decodificación especulativa ni configuración de cabezas de atención.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational`.
- Procesamiento de entradas de imagen junto con texto (`image-text-to-text`): cabe esperar tareas de descripción de imágenes, respuesta a preguntas visuales y conversación sobre contenido gráfico, aunque no hay ejemplos ni validación publicados.
- Compatibilidad declarada con endpoints de inferencia del Hub (etiqueta `endpoints_compatible`).
- Carga mediante la biblioteca `transformers`.

No hay información disponible sobre soporte de tool calling o function calling, razonamiento multi-paso, capacidades de agente, cobertura multilingüe, modo "thinking", entrada o salida de audio, ni sobre cualquier otra capacidad específica. El autor no publica ejemplos de uso.

## Casos de uso

Los siguientes escenarios son hipótesis de aplicación derivadas del tamaño del modelo y de su naturaleza multimodal declarada; ninguno está validado por el autor ni por evaluaciones publicadas, y deben comprobarse empíricamente antes de llevarlos a producción. Además, la ausencia de licencia explícita condiciona cualquier uso comercial (véase la sección de limitaciones).

- Asistente conversacional multimodal autoalojado: el modelo acepta imágenes y texto, por lo que podría emplearse en un chat interno donde el usuario adjunte capturas, diagramas o fotografías y pida explicaciones, siempre que se verifique la calidad real de la comprensión visual.
- Análisis de documentación técnica con imágenes: extracción de información de diagramas de arquitectura, esquemas eléctricos o capturas de paneles de monitorización, integrado en una herramienta interna de soporte a ingeniería.
- Generación de descripciones de producto para catálogos: a partir de una fotografía, producir texto descriptivo en un pipeline de comercio electrónico, con revisión humana obligatoria por el riesgo de alucinación.
- Preprocesado de datos para otros sistemas: uso del modelo como etiquetador o generador de anotaciones sobre imágenes y texto que alimenten un pipeline posterior.
- Investigación sobre alineación y seguridad: al tratarse de una variante declarada como "Uncensored" de ~27B, es un candidato para estudios comparativos sobre tasas de rechazo, sesgos y contenido dañino frente a modelos alineados de tamaño similar, siempre en entornos controlados.
- Fine-tuning posterior específico de dominio: con 27,36B de parámetros y pesos en bf16, es un punto de partida razonable para ajuste supervisado con LoRA sobre una GPU de 80 GB, aunque la falta de licencia clara lo hace desaconsejable para uso comercial.
- Despliegue en local para prototipado: cuantizado a 4 bits, el modelo podría caber en una GPU de consumo de 24 GB, lo que permitiría experimentar sin coste de API, siempre que exista soporte de conversión a GGUF para su arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación completada, no hay tablas comparativas y el repositorio no enlaza a ningún informe técnico. Tampoco se han publicado mediciones de latencia o throughput.

Los únicos datos cuantitativos verificables son el recuento de parámetros (27.356.728.560) y el tamaño del repositorio (54,8 GB), ambos procedentes de los metadatos del Hub.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritméticas derivadas del recuento de parámetros (27,36B) bajo el supuesto de pesos densos; no han sido verificadas ejecutando el modelo.

- Pesos en bf16/fp16: ≈54,7 GB solo para los pesos. Requiere una GPU de 80 GB (H100, A100 80 GB) o reparto en varias GPU. Con caché KV y activaciones, un despliegue cómodo apunta a 80 GB o más.
- Pesos en fp8: ≈27,4 GB. Encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB, dejando margen limitado para contexto largo.
- Pesos en int8: del orden de 27,4 GB. Muy ajustado en GPUs de 32 GB (por ejemplo, RTX 5090) y con problemas si se necesita contexto extenso.
- Pesos en 4 bits (Q4_K_M y similares): ≈15-16 GB, más caché KV. Cabe en RTX 4090, RTX 3090 o RTX 4080 de 16 GB con contexto corto; en 24 GB permite contextos más amplios. Requiere convertir los pesos, ya que no hay GGUF publicado.
- En GPUs de consumo: sí, es viable únicamente con cuantización de 4 bits (24 GB es el objetivo recomendado); no cabe en bf16 ni en 8 bits en tarjetas de consumo actuales.
- Codificador visual: al ser un modelo image-text-to-text, el procesamiento de imágenes añade memoria temporal y tokens de entrada, lo que incrementa el consumo respecto a un modelo solo de texto del mismo tamaño.
- Opciones de despliegue: transformers (formato nativo disponible), vLLM o TGI si la arquitectura está soportada por esas herramientas, y llama.cpp/Ollama solo tras convertir los pesos, con el riesgo de que la arquitectura `qwen3_5` todavía no esté soportada por el conversor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen datos de rendimiento de Suri-Qwen-3.8-Uncensored-27B, por lo que la comparación se limita a parámetros, contexto, modalidad y licencia. Los datos de los modelos alternativos proceden de su documentación pública y se incluyen como referencia de categoría, no como comparación de calidad.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suri-Qwen-3.8-Uncensored-27B | 27,36B | no disponible | imagen-texto | no disponible | safetensors, 0 descargas |
| Qwen2.5-VL-32B-Instruct | ≈32,8B | 128K (documentado por el autor) | imagen-texto | Apache 2.0 | pesos y cuantizaciones publicadas por el autor |
| Gemma 3 27B | 27B | 128K (documentado por el autor) | imagen-texto | licencia Gemma (con condiciones de uso) | pesos y cuantizaciones publicadas por el autor |

La diferencia principal no es técnica sino de trazabilidad: los dos modelos de referencia cuentan con model card completa, licencia explícita, evaluaciones publicadas y ecosistema de cuantizaciones, mientras que Suri carece de todo ello. Cualquier comparación de rendimiento es imposible con la información disponible.

## Limitaciones y advertencias

- Model card vacía: el autor ha dejado la plantilla automática de HuggingFace sin rellenar. No hay información sobre modelo base, datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo legal. En la práctica, la ausencia de licencia implica que no se conceden derechos de uso más allá de los que permita la legislación aplicable, y en el caso de un derivado de otro modelo habría que respetar además la licencia del modelo base, que se desconoce.
- Reducción de la alineación de seguridad: el sufijo "Uncensored" indica que el ajuste de seguridad se ha atenuado o eliminado. Es previsible una mayor probabilidad de generar contenido dañino, ilegal o desinformación, y no hay evaluación publicada que cuantifique ese riesgo.
- Riesgo de alucinación: sin benchmarks ni evaluación, se desconoce la fiabilidad factual, especialmente en tareas de razonamiento, matemáticas y comprensión de imágenes.
- Sesgos desconocidos: al no documentarse la composición del dataset ni el modelo base exacto, no es posible evaluar sesgos de género, raza, idioma o cultura.
- Cobertura lingüística no declarada: no se especifican idiomas soportados, por lo que el rendimiento en castellano es una incógnita.
- Contexto desconocido: sin longitud de contexto declarada, el diseño de aplicaciones con ventanas largas requiere medir experimentalmente el punto de degradación.
- Sin validación comunitaria: cero descargas y cero "likes", sin issues ni discusiones, lo que implica que nadie ha verificado públicamente que los pesos carguen correctamente o produzcan resultados coherentes.
- Procedencia dudosa: no hay enlace a paper, repositorio, dataset ni demo. La única referencia bibliográfica presente es la etiqueta `arxiv:1910.09700`, correspondiente al artículo de Lacoste et al. (2019) sobre estimación de emisiones de carbono, que aparece en la plantilla por defecto y no guarda relación con el modelo.
- Formato único: solo hay safetensors; no existen cuantizaciones listas para usar, y la viabilidad de convertirlo a GGUF depende del soporte de la arquitectura en llama.cpp, no confirmado.
- Fechas de metadatos: el repositorio figura creado y actualizado el mismo día, con siete minutos de diferencia, lo que sugiere una subida sin trabajo posterior de documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-Uncensored-27B
- Paper citado en las etiquetas (Lacoste et al., 2019, sobre emisiones de carbono del aprendizaje automático, no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental referenciada en la plantilla: https://mlco2.github.io/impact

No se han encontrado en la información disponible enlaces a paper del modelo, repositorio de código, demo, dataset de entrenamiento ni hilos de discusión.
