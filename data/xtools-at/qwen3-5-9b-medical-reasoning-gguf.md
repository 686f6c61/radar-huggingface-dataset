# xtools-at/Qwen3.5-9B-Medical-Reasoning-GGUF

## Resumen

Qwen3.5-9B-Medical-Reasoning-GGUF es la distribución en formato GGUF de cuantizaciones estáticas del modelo xtools-at/Qwen3.5-9B-Medical-Reasoning, publicado por el usuario xtools-at. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante LoRA sobre Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un modelo orientado a razonamiento derivado de la familia Qwen3.5-9B y destilado de DeepSeek-V4-Pro. El adaptador resultante se ha fusionado y cuantizado para su uso con llama.cpp y otros motores compatibles con GGUF.

El problema que aborda es el razonamiento clínico estructurado: respuestas a preguntas médicas, interpretación de síntomas y hallazgos de laboratorio, y exploración de diagnósticos diferenciales. Para ello se entrenó sobre una submuestra de 10.000 ejemplos del dataset FreedomIntelligence/medical-o1-reasoning-SFT, con trazas de razonamiento en el 100 % de los ejemplos, durante 2 épocas y con una longitud máxima de secuencia de 4.096 tokens. El modelo final tiene 9.197.093.888 parámetros (aproximadamente 9,2 mil millones).

Es relevante ahora porque representa un patrón habitual en el ecosistema abierto: reutilizar un modelo base con capacidades de razonamiento ya entrenadas y añadir una especialización vertical con un coste de cómputo muy bajo (una única NVIDIA L4 de 24 GB). Conviene subrayar que el propio autor lo describe como un modelo experimental de razonamiento médico, no validado clínicamente, y que la distribución GGUF no incluye resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Qwen3.5-9B); el ajuste es un adaptador LoRA fusionado y cuantizado |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 B) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible (el entrenamiento se realizó con una longitud máxima de secuencia de 4.096 tokens) |
| Tipos de cuantizacion | Cuantizaciones estáticas en GGUF; el desglose por tipo (Q4_K_M, Q8_0, etc.) no se detalla en la información disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 29,0 GB); el modelo base se distribuye también en safetensors |
| Tamano del repositorio | 29,0 GB |
| Pipeline declarado | text-generation |
| Modelo base | xtools-at/Qwen3.5-9B-Medical-Reasoning (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de la familia Qwen3.5-9B, un transformer decoder-only de aproximadamente 9,2 B de parámetros. Sobre esa base se aplicó primero un proceso de destilación de razonamiento desde DeepSeek-V4-Pro (modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B), cuyo entrenamiento enfatiza matemáticas, materias STEM y resolución estructurada de problemas. Sobre ese modelo ya orientado al razonamiento se añadió un adaptador LoRA entrenado con supervisión (SFT) sobre datos médicos, que después se fusionó para generar los pesos cuantizados.

La configuración de entrenamiento documentada es la siguiente: LoRA con r=32, alpha=64, dropout=0,03, optimizador AdamW de 8 bits, tasa de aprendizaje 2e-4 con planificador lineal, precisión de 16 bits, 2 épocas sobre 10.000 ejemplos seleccionados aleatoriamente, longitud máxima de 4.096 tokens y una GPU NVIDIA L4 de 24 GB. El conjunto de datos de origen es FreedomIntelligence/medical-o1-reasoning-SFT, limpiado antes del entrenamiento, y el 100 % de los ejemplos incorpora una traza de razonamiento (thinking trace); el 3 % de la muestra se reservó como partición de evaluación. Los módulos objetivo del LoRA no aparecen completos en la información disponible.

## Capacidades

- Generación de texto conversacional con estructura de pregunta-respuesta en el ámbito médico.
- Razonamiento paso a paso (thinking traces) aplicado a viñetas clínicas, síntomas y hallazgos de laboratorio.
- Exploración de diagnósticos diferenciales y propuesta de pruebas de seguimiento, siempre en el plano especulativo y no clínico.
- Respuesta a preguntas de conocimiento médico (question answering).
- Capacidades de razonamiento matemático y STEM heredadas del modelo base destilado de DeepSeek-V4-Pro.
- Soporte multilingüe limitado al inglés según los metadatos del repositorio.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado más allá del razonamiento en cadena.
- Capacidades de visión: las etiquetas del repositorio incluyen `image-text-to-text`, pero la model card describe únicamente tareas de texto y no documenta procesamiento de imágenes.

## Casos de uso

- Evaluación de investigación en razonamiento médico: utilizar el modelo para comparar la calidad de cadenas de razonamiento generadas frente a las de su modelo base, aprovechando que el 100 % de los ejemplos de entrenamiento incluye trazas de razonamiento.
- Prototipado de asistentes de documentación clínica: generar borradores de resúmenes o notas estructuradas a partir de texto de viñetas, en entornos controlados y siempre con revisión humana posterior.
- Educación médica y simulación de casos: plantear viñetas clínicas al modelo y analizar los diagnósticos diferenciales que propone, como material de discusión en entornos formativos, no como referencia clínica.
- Respuesta a preguntas sobre literatura y conocimiento médico general: usar el modelo como base de un sistema de QA interno sobre documentación médica, con una capa de recuperación (RAG) que aporte las fuentes.
- Investigación sobre especialización mediante LoRA: el repositorio sirve como caso de estudio reproducible de cómo un adaptador de bajo rango (r=32) modifica el comportamiento de un modelo ya orientado al razonamiento.
- Despliegue local con llama.cpp u Ollama: al distribuirse en GGUF, permite ejecutar el modelo en hardware de gama alta de consumo para pruebas de concepto sin enviar datos a servicios externos.
- Comparación de cuantizaciones: usar las distintas variantes GGUF del repositorio para medir la degradación de la calidad de razonamiento según el nivel de cuantización en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni de ninguna otra evaluación, ni para el adaptador ni para las cuantizaciones GGUF. Tampoco se documenta la contribución relativa del modelo base frente al ajuste médico, algo que el propio autor señala explícitamente como no medido de forma independiente.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del número de parámetros (9,2 B) y no proceden de la documentación del modelo:

- Precisión completa (FP16/BF16): aproximadamente 18,4 GB solo para los pesos, más caché KV y overhead; requiere GPU de 24 GB o superior.
- Cuantización de 8 bits: aproximadamente 9,8 GB de pesos.
- Cuantización de 5-6 bits: aproximadamente 6,5-7,6 GB de pesos.
- Cuantización de 4 bits: aproximadamente 5,5-5,8 GB de pesos, lo que permite ejecución en GPU de consumo con 8 GB de VRAM o más, siempre que la caché KV no crezca demasiado.
- Cuantización de 3 bits o inferior: aproximadamente 3,5-4,5 GB, con degradación esperable de la calidad de razonamiento.
- GPU de referencia para entrenamiento: NVIDIA L4 de 24 GB (dato documentado por el autor).
- GPU recomendadas para inferencia: NVIDIA A100, H100, L40S o L4 para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) para estaciones de trabajo; GPU de 8-12 GB para las cuantizaciones de 4 bits.
- El repositorio ocupa 29,0 GB en total, lo que sugiere pocas variantes de gran tamaño (por ejemplo, una en 16 bits y otra en 8 bits), aunque el desglose exacto por archivo no está disponible.
- Opciones de despliegue: llama.cpp y cualquier motor compatible con GGUF (por ejemplo Ollama, LM Studio o servidores basados en llama.cpp). vLLM y TGI no son las opciones naturales para este repositorio, ya que está en formato GGUF y no en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con otros modelos médicos abiertos. La tabla siguiente recoge únicamente los datos verificables del linaje declarado en la información proporcionada.

| Modelo | Parametros | Relacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Medical-Reasoning-GGUF (este modelo) | 9,2 B | Adaptador LoRA médico fusionado y cuantizado | Apache-2.0 | GGUF | Solo inglés; sin benchmarks publicados |
| xtools-at/Qwen3.5-9B-Medical-Reasoning | No disponible | Modelo base del que procede esta cuantización | Apache-2.0 | safetensors | Pesos sin cuantizar |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | No disponible | Base inmediata del LoRA; razonamiento destilado de DeepSeek-V4-Pro | No disponible | No disponible | Énfasis en matemáticas y STEM |
| Qwen/Qwen3.5-9B | No disponible | Familia upstream | No disponible | No disponible | Modelo fundacional original |

Comparativas con alternativas del mismo nicho (por ejemplo, otros modelos abiertos de razonamiento médico de ~7-9 B): no disponibles, al no haberse publicado métricas de evaluación en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental no validado clínicamente: el propio autor advierte que puede generar diagnósticos incorrectos, detalles fabricados o explicaciones engañosas. No debe usarse para diagnóstico de pacientes, recomendaciones de tratamiento, triaje de urgencias ni decisiones clínicas autónomas.
- Riesgo elevado de alucinación en un dominio donde un error factual tiene consecuencias graves; la presencia de trazas de razonamiento no garantiza que la explicación refleje el proceso interno real ni que el resultado sea correcto.
- Idiomas: únicamente inglés según los metadatos del repositorio. No hay soporte documentado de castellano ni de otras lenguas.
- Longitud de contexto: no especificada. El entrenamiento se realizó con 4.096 tokens, por lo que no hay garantía de comportamiento estable en ventanas mayores aunque el modelo base las soporte.
- Cobertura de entrenamiento limitada: 10.000 ejemplos durante 2 épocas. Es una especialización ligera, no un entrenamiento médico extensivo.
- Sin benchmarks publicados: no existe evidencia cuantitativa de que el ajuste médico mejore la precisión diagnóstica respecto al modelo base.
- Atribución de comportamiento no medida: el autor indica que no se ha cuantificado por separado la contribución del modelo base frente a la del ajuste médico.
- Discrepancia de metadatos: la etiqueta `image-text-to-text` sugiere capacidades multimodales que la model card no documenta; conviene verificar antes de asumir entrada de imágenes.
- Licencia Apache-2.0 declarada para esta release, lo que en principio permite uso comercial, pero esa licencia no cubre las obligaciones regulatorias propias de un producto sanitario ni sustituye la validación clínica exigible. Conviene comprobar las licencias de los modelos del linaje upstream.
- Datos de adopción nulos en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada en los metadatos es 2026-10-14.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/Qwen3.5-9B-Medical-Reasoning-GGUF
- Modelo base (adaptador, safetensors): https://huggingface.co/xtools-at/Qwen3.5-9B-Medical-Reasoning
- Modelo base inmediato del LoRA: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Familia upstream: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset de conversación derivado: https://huggingface.co/datasets/xtools-at/medical-o1-reasoning-SFT-chat
- Búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a un fabricante de máquinas de grabado láser homónimo y no guardan relación con el repositorio.
