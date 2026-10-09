# xinyuzhou/ClinicalJev-0.8B-v0.1-preview-LoRA

## Resumen

ClinicalJev-0.8B-v0.1-preview-LoRA es un adaptador LoRA publicado en HuggingFace por el usuario xinyuzhou, pensado para acoplarse al backbone de texto Qwen/Qwen3.5-0.8B. No es un modelo generativo al uso: dado un texto de estado (por ejemplo, una nota clínica), una pregunta y un conjunto predefinido de candidatos o rúbricas, el modelo devuelve una elección y una distribución de probabilidad sobre las opciones disponibles. La ficha declara tres primitivas de tarea: *choice* (elección entre candidatos nombrados), *score* (puntuación sobre una rúbrica ordenada) y *noul* (estimación de veracidad de una proposición sí/no).

El modelo se etiqueta como *preview* (v0.1) y está orientado al dominio médico y al procesamiento de lenguaje clínico. El entrenamiento se limita a inglés y chino simplificado; aunque el backbone Qwen es multilingüe, el autor indica explícitamente que el rendimiento en otros idiomas no ha sido validado. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador, no el modelo base.

Su relevancia actual es acotada: se trata de un adaptador experimental con licencia no declarada, pipeline no especificado, 0 descargas y 0 *likes* en el momento de la consulta. Su interés técnico radica en el enfoque de inferencia restringida a logits de un único token, en lugar de decodificación de texto libre, y en la existencia de un proyecto asociado (ClinicalJev, con benchmark propio) que publica código de inferencia y evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (librería PEFT) sobre un backbone causal-LM Qwen3.5-0.8B; tipo de capa interna del backbone no disponible |
| Parametros totales | No disponible para el adaptador (el modelo base es de 0,8B); tamano del repo: 0,2 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y chino simplificado (entrenamiento); el backbone es multilingue pero el rendimiento en otros idiomas no esta validado |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La ficha describe un adaptador LoRA acoplado mediante PEFT a un backbone Qwen3.5-0.8B de tipo *text causal-LM*. La inferencia no genera texto: se construye un prompt con la plantilla de chat nativa del checkpoint (con el modo de razonamiento o *thinking* desactivado), se coloca el contexto antes de la pregunta seleccionada y se añade un prefijo JSON de respuesta abierto. El modelo lee los logits del siguiente token en esa posición y normaliza únicamente entre las etiquetas permitidas. Es, por tanto, una clasificación restringida sobre el vocabulario válido, no una generación abierta.

El autor indica que entrenamiento se limita a inglés y chino simplificado, pero no se especifica en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card incluye una imagen comparativa titulada "ClinicalJev-0.8B-v0.1-preview versus Jev 1.13.0 on 13 held-out datasets", con la nota de que no se usaron particiones de entrenamiento, validación ni test del benchmark en el entrenamiento, pero los valores numéricos no están disponibles en el texto proporcionado. El parámetro `inference: false` aparece en los metadatos de la model card.

## Capacidades

- Clasificación por elección (*choice*): selecciona un candidato entre 2 y 50 opciones nombradas con descripción, y devuelve la elección junto con una distribución de probabilidad sobre los candidatos.
- Puntuación por rúbrica (*score*): dado un conjunto ordenado de niveles (de 2 a 50), devuelve probabilidades sobre cada nivel y su índice esperado con base cero (de 0 a K−1). Si hay 10 niveles o menos, las etiquetas se codifican numéricamente.
- Estimación de veracidad (*noul*): a partir de una proposición de sí/no y criterios opcionales de verdadero/falso, devuelve una estimación de verdad. El ejemplo local mapea nueve bins de valoración a un estimador en el intervalo [0,01, 0,99].
- Extracción de información clínica estructurada a partir de notas: el ejemplo incluido ilustra cómo se detectan síntomas (dolor torácico presente, ausente o incierto), se puntúa el grado de soporte ("no soportado", "posible", "explícitamente soportado") y se estima una afirmación clínica.
- Capacidad multilingüe: limitada a inglés y chino simplificado según el autor; sin validación fuera de esos idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el prompt del sistema pide explícitamente no razonar en voz alta.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Extracción de fenotipos clínicos a partir de notas libres: se define un conjunto de candidatos (presente / ausente / incierto) por síntoma y el modelo devuelve la etiqueta junto a una probabilidad, lo que permite fijar umbrales de confianza y derivar a revisión humana los casos de baja certeza.
- Puntuación de gravedad o de soporte diagnóstico: usando la primitiva *score* con una rúbrica ordenada, se puede transformar texto clínico en un índice graduado y mantener la distribución completa para análisis de incertidumbre.
- Verificación de afirmaciones en historiales: con *noul* se puede comprobar si una proposición derivada de un resumen automático está respaldada por la nota original, útil en pipelines de control de calidad de resúmenes clínicos.
- Anotación asistida para investigación observacional: al devolver distribuciones de probabilidad en lugar de una única etiqueta, permite construir conjuntos etiquetados con medidas de acuerdo y filtrar por confianza antes de la revisión manual.
- Filtrado y triaje de documentación: clasificación binaria o multietiqueta de notas para identificar cohortes candidatas antes de una revisión más profunda.
- Normalización de campos estructurados: selección entre valores de una lista controlada (por ejemplo, categorías de una ontología) a partir de texto libre, con la lista de opciones inyectada en el prompt.
- Evaluación comparativa interna: al ser un adaptador pequeño sobre un backbone de 0,8B, sirve como baseline de bajo coste frente a LLM mayores en tareas de anotación clínica, aunque con la validez externa limitada que impone su estado de *preview*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una figura comparativa ("ClinicalJev-0.8B-v0.1-preview versus Jev 1.13.0 on 13 held-out datasets", con la indicación de que no se usaron particiones de entrenamiento, validación ni test del benchmark durante el entrenamiento), pero los valores concretos no están disponibles en el texto proporcionado.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un backbone de 0,8B, el coste de pesos es reducido: el repositorio del adaptador ocupa 0,2 GB, a lo que hay que sumar el tamaño del backbone Qwen3.5-0.8B (no disponible en la información proporcionada).
- VRAM estimada para inferencia: no disponible. Como referencia de orden de magnitud, un backbone de 0,8B en precisión de 16 bits requiere del orden de 1,6 GB solo para pesos, más el coste del contexto y del runtime; la cifra exacta no puede confirmarse con los datos disponibles.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 0,8B es desplegable en GPUs de consumo, pero la información proporcionada no confirma compatibilidad ni rendimiento en modelos concretos (RTX 4090, A100, H100, etc.).
- Opciones de despliegue: el autor documenta el uso con `transformers`, `accelerate` y `peft` (`pip install -U torch transformers accelerate peft`), cargando el backbone causal-LM de Qwen3.5-0.8B y adjuntando el adaptador. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinicalJev-0.8B-v0.1-preview-LoRA | Adaptador LoRA sobre backbone de 0,8B | No disponible | Comparativa publicada frente a Jev 1.13.0 en 13 datasets, valores no disponibles | No disponible | HuggingFace, 0 descargas, 0 likes |
| Jev 1.13.0 | No disponible | No disponible | Referencia de comparacion en la figura de la model card | No disponible | No disponible |
| Contrastive-LM / CLM-8B | 8B | No disponible | No disponible | No disponible | Repositorio GitHub (Contrastive-LM/CLM), API compatible con TypeSafe |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría. El único punto de comparación explícito en la model card es Jev 1.13.0, pero sin cifras publicadas en la información disponible.

## Limitaciones y advertencias

- Estado *preview* (v0.1): el propio autor lo etiqueta como versión preliminar, lo que implica API, formato de prompt y comportamiento potencialmente inestables.
- Licencia no declarada: no puede asumirse uso comercial ni redistribución; es un bloqueo directo para cualquier despliegue en producción.
- Metadatos `inference: false`: la model card marca el modelo como no apto para inferencia directa en la plataforma, y el ejemplo solo cubre ejecución local.
- Cobertura lingüística limitada: entrenado solo en inglés y chino simplificado; el rendimiento en castellano u otros idiomas no está validado.
- Riesgo de alucinación: aunque la salida está restringida a etiquetas permitidas, la distribución de probabilidad puede concentrarse en una opción incorrecta cuando el texto de entrada es ambiguo. La propia ficha resalta que el orden de candidatos y de la rúbrica importa, lo que introduce sensibilidad al formateo del prompt.
- Sesgos conocidos: no disponibles. Al ser un modelo de dominio clínico, existe riesgo estructural de sesgo demográfico y de sobrerrepresentación de las poblaciones presentes en los datos de entrenamiento, pero no se aporta información al respecto.
- Dominio de alto riesgo: cualquier uso clínico real requiere validación prospectiva, supervisión profesional y trazabilidad; el modelo no está diseñado ni validado como dispositivo médico.
- Trazabilidad del benchmark: la comparativa frente a Jev 1.13.0 se publica como imagen y sin cifras en el texto disponible, lo que impide auditar los resultados.
- Dependencia del backbone: el comportamiento final depende del checkpoint base Qwen3.5-0.8B, cuya disponibilidad, licencia y limitaciones no se detallan en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xinyuzhou/ClinicalJev-0.8B-v0.1-preview-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub del proyecto ClinicalJev: https://github.com/xzhou-code/ClinicalJev
- Repositorio GitHub de Contrastive-LM/CLM: https://github.com/Contrastive-LM/CLM
- Documentación de la primitiva *choice*: https://docs.typesafe.ai/primitives/choice
- Documentación de la primitiva *score*: https://docs.typesafe.ai/primitives/score
- Documentación de la primitiva *noul*: https://docs.typesafe.ai/primitives/noul
- Figura comparativa publicada en la model card: https://raw.githubusercontent.com/xzhou-code/ClinicalJev/main/assets/comparison-0.8B.png
- Página personal del autor (Xinyu Zhou): https://www.xinyuzhou.me/
