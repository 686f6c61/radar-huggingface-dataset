# xinyuzhou/ClinicalJev-4B-v0.1-preview

## Resumen

ClinicalJev-4B-v0.1-preview es un modelo clínico compacto de 4.205.751.296 parámetros (unos 4,21 mil millones) publicado por el usuario xinyuzhou en Hugging Face, con fecha de creación del 8 de octubre de 2026. No es un generador de texto conversacional: dado un estado textual (por ejemplo, una nota clínica), una pregunta y un conjunto de candidatos o una rúbrica predefinida, devuelve la opción seleccionada y una distribución de probabilidad sobre las alternativas. Está construido sobre una columna vertebral Qwen 3.5 de texto (etiqueta qwen3_5_text) y se distribuye en safetensors para su uso con transformers.

El interés del modelo reside en su enfoque de inferencia: en lugar de completar texto, lee los logits del siguiente token en una posición de prefijo JSON y normaliza únicamente las etiquetas permitidas, lo que convierte una tarea de clasificación clínica en una predicción acotada al conjunto de etiquetas y con probabilidades explícitas. Se publica como vista previa (v0.1-preview) orientada a inferencia local, lo que encaja con escenarios donde los datos clínicos no pueden salir de la infraestructura del centro.

El entrenamiento se limita a inglés y chino simplificado, el autor no declara licencia, no se publican cifras numéricas de benchmarks y no se documenta la longitud de contexto del checkpoint. La model card indica además que la inferencia está desactivada (inference: false) en el Hub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con columna vertebral Qwen 3.5 de texto (etiqueta qwen3_5_text); número de capas, cabezas y dimensión oculta: no disponible |
| Parámetros totales | 4.205.751.296 (4,21 mil millones, dato real de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio ocupa 8,4 GB y solo publica safetensors, lo que es coherente con pesos en bf16/fp16 |
| Idiomas soportados | inglés y chino simplificado (entrenamiento limitado a ambos; el backbone Qwen es multilingüe, pero el rendimiento en otros idiomas no ha sido validado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de tarea | Predicción sobre candidatos: elección (choice), puntuación sobre rúbrica ordenada (score) y estimación de verdad de una proposición sí/no (noul) |
| Autor | xinyuzhou |
| Fecha de publicación | 8 de octubre de 2026 (última actualización: 8 de octubre de 2026) |
| Tamaño del repositorio | 8,4 GB |
| Librería | transformers (con accelerate) |
| API de inferencia del Hub | desactivada (inference: false) |
| Modo de pensamiento | debe usarse la plantilla de chat nativa con el modo thinking desactivado |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only apoyado en una columna vertebral Qwen 3.5 de texto, según la etiqueta de arquitectura del repositorio. Sobre esa base, ClinicalJev no genera texto libre: el formateador coloca el contexto antes de la pregunta seleccionada, añade un prefijo de respuesta JSON abierto y la inferencia lee los logits del siguiente token en esa posición, normalizando solo las etiquetas permitidas. Para tareas de elección y de puntuación con hasta 10 niveles se usan símbolos numéricos; para elección con más candidatos y para tareas de elección con etiquetas nominales se emplean letras (A-Z y a-x), con un máximo de 50 candidatos o niveles. En el tipo noul se mapean nueve bins de probabilidad (0,1 a 0,9) sobre los dígitos 1 a 9.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La model card sí precisa que el benchmark empleado no utiliza particiones de entrenamiento, validación ni test (las 13 bases de datos son held-out) y que el orden de los candidatos y de la rúbrica es relevante para el resultado, lo que apunta a una sensibilidad al orden de las opciones que conviene tener en cuenta. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación clínica por elección: devuelve el candidato seleccionado y una distribución de probabilidad sobre las opciones proporcionadas.
- Puntuación sobre rúbrica ordenada: devuelve probabilidades por nivel y el índice esperado (de 0 a K−1) sobre una escala definida por el usuario, de menor a mayor.
- Estimación de verdad (noul): evalúa si una proposición de sí/no se cumple, con una estimación de verdad mapeada sobre nueve bins entre 0,01 y 0,99 en el ejemplo local.
- Manejo de estado textual como dato, no como instrucción: la plantilla del sistema indica explícitamente que el estado debe tratarse como datos.
- Capacidades multilingües limitadas a inglés y chino simplificado, según la propia model card.
- No genera texto: no hay razonamiento en voz alta ni explicaciones en la salida; la respuesta es un JSON restringido.
- No se documenta soporte de tool calling, function calling, uso de agentes, multi-step reasoning, visión ni audio.

## Casos de uso

- Extracción estructurada de síntomas desde notas clínicas: con el tipo choice se pregunta por la presencia, ausencia o indeterminación de un síntoma concreto y se obtiene una probabilidad por categoría, lo que permite fijar umbrales de confianza antes de escribir en la historia clínica electrónica.
- Triaje y priorización: con el tipo score se define una rúbrica ordenada (por ejemplo, no urgente, urgente, emergente) y el modelo devuelve el nivel esperado junto con la distribución, útil para colas de revisión donde el clínico confirma los casos límite.
- Verificación de afirmaciones en resúmenes generados: con el tipo noul se comprueba si una frase de un resumen automático está respaldada por la nota original, lo que sirve como capa de control de fidelidad antes de mostrar el resumen.
- Etiquetado asistido de corpus clínicos: al devolver distribuciones de probabilidad, permite anotar grandes volúmenes de notas con criterios explícitos y derivar después métricas de acuerdo entre anotadores.
- Identificación de fenotipos para investigación: definir candidatos como "cumple criterio de inclusión", "no cumple" o "información insuficiente" y aplicar el modelo de forma homogénea sobre cohortes retrospectivas.
- Precribado para reclutamiento de ensayos clínicos: filtrar notas por criterios de inclusión redactados como proposiciones sí/no, reduciendo el número de historiales que un equipo de coordinación debe revisar manualmente.
- Detección de eventos adversos en informes de seguimiento: puntuar la fuerza de la evidencia de un evento con una rúbrica de tres niveles y derivar alertas solo por encima de un umbral de probabilidad.
- Despliegue en infraestructura local con datos sensibles: al ser un modelo de 4,21 mil millones de parámetros que no requiere enrutar texto a servicios externos, se puede ejecutar en una GPU de centro de datos o en una estación de trabajo con GPU de consumo, manteniendo los datos dentro de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una figura comparativa frente a Jev 1.13.0 sobre 13 conjuntos de datos held-out, pero no se proporcionan valores numéricos, ni la lista de conjuntos de datos, ni las métricas empleadas.

| Comparativa | Resultado |
|---|---|
| ClinicalJev-4B-v0.1-preview frente a Jev 1.13.0 (13 datasets held-out) | figura publicada en la model card sin cifras numéricas; no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 4,21 mil millones de parámetros, no confirmada por el autor): en bf16/fp16 en torno a 8,4 GB solo de pesos, más activaciones y caché KV; en int8 alrededor de 4,3 GB; en int4 alrededor de 2,2-2,5 GB.
- GPU de centro de datos: A100 (40 o 80 GB), H100, L40S o similares, con margen amplio para lotes grandes.
- GPU de consumo: cabe sin problema en RTX 4090, RTX 4080 o RTX 3090 en bf16; con cuantización a int8 o int4 podría ejecutarse en tarjetas de 12-16 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue documentadas: transformers con accelerate (la model card indica `pip install -U torch transformers accelerate`). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y no hay pesos GGUF publicados; al tratarse de un decoder-only estándar serían teóricamente aplicables, pero requerirían conversión y verificación propias.
- Latencia y throughput: no disponible.
- Nota de implementación: la inferencia debe usar la plantilla de chat nativa del checkpoint con el modo thinking desactivado; la salida no se genera por decodificación, sino que se leen los logits del siguiente token en la posición del prefijo JSON.

## Comparativa con modelos similares

No hay datos publicados suficientes para una comparativa cuantitativa con alternativas de la misma categoría. Los únicos elementos contrastables presentes en la información disponible son los siguientes.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ClinicalJev-4B-v0.1-preview | 4,21 mil millones | no disponible | no disponible | pesos safetensors en Hugging Face |
| Jev 1.13.0 (TypeSafe AI) | no disponible | no disponible | propietaria | acceso limitado anticipado desde el 15 de septiembre de 2026, según Wikipedia |
| Columna vertebral Qwen 3.5 de texto (familia base) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Versión de vista previa (v0.1-preview): no debe considerarse una versión estable ni validada clínicamente; la model card no documenta validación regulatoria ni uso clínico.
- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un terreno jurídicamente ambiguo. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Idiomas: el entrenamiento se limita a inglés y chino simplificado; el rendimiento en castellano o en cualquier otro idioma no ha sido validado, aunque el backbone sea multilingüe.
- Riesgo de alucinación: el modelo no genera texto libre, pero sí produce estimaciones de probabilidad sobre etiquetas; una probabilidad alta no garantiza que la etiqueta sea clínicamente correcta, y el sesgo del conjunto de etiquetas condiciona la salida.
- Sensibilidad al orden: la model card advierte explícitamente de que el orden de los candidatos y de la rúbrica afecta al resultado, lo que obliga a fijar el orden de forma consistente entre entrenamiento, evaluación y producción.
- Límites de formato: entre 2 y 50 candidatos o niveles por pregunta; en el tipo score, el uso de etiquetas numéricas solo se activa hasta 10 niveles; el tipo noul trabaja con nueve bins de probabilidad entre 0,1 y 0,9.
- Formato de salida restringido: solo devuelve JSON con la respuesta seleccionada, sin explicación ni justificación, lo que dificulta la trazabilidad clínica de la decisión.
- Longitud de contexto no documentada: no es posible planificar el procesamiento de notas largas o historiales completos sin una verificación empírica previa.
- Ausencia de cifras de benchmarks: sin métricas publicadas no es posible estimar la calidad frente a alternativas ni establecer umbrales de confianza justificados.
- La API de inferencia del Hub está desactivada, por lo que la evaluación exige descargar los pesos y ejecutar el código localmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xinyuzhou/ClinicalJev-4B-v0.1-preview
- Repositorio GitHub de ClinicalJev: https://github.com/xzhou-code/ClinicalJev
- Documentación de las primitivas Choice, Score y Noul: https://docs.typesafe.ai/primitives/choice, https://docs.typesafe.ai/primitives/score, https://docs.typesafe.ai/primitives/noul
- Imagen comparativa del modelo: https://raw.githubusercontent.com/xzhou-code/ClinicalJev/main/assets/comparison-4B.png
- Imagen de cabecera del modelo: https://raw.githubusercontent.com/xzhou-code/ClinicalJev/main/assets/hero-4B.png
- Página de Jev (modelo propietario de TypeSafe AI) en Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Página personal de Xinyu Zhou: https://www.xinyuzhou.me/
- Hugging Bay: https://huggingbay.xyz/
- Lista de modelos de IA gratuitos de ClawLabsAI: https://github.com/ClawLabsAI/free-ai-models
