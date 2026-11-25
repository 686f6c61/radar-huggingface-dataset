# xingy555888/Cancri-alpha-0.8B

## Resumen

Cancri α-0.8B es un modelo de lenguaje causal especializado en una única tarea: generar un título corto a partir del primer mensaje de usuario de una conversación. Lo publica NexusVAI (cuenta de Hugging Face `xingy555888`) como ajuste fino supervisado de pleno parámetro sobre la parte lingüística de Qwen3.5-0.8B, sin la torre visual del modelo original. El checkpoint contiene 752.393.024 parámetros en bfloat16 y se carga como un `Qwen3_5ForCausalLM` convencional.

Su relevancia es acotada pero clara: en lugar de desplegar un modelo grande de propósito general para etiquetar conversaciones, ofrece un modelo de 0,75B que supera a modelos API mucho mayores en las métricas de similitud de título reportadas por el autor (ROUGE-1 de 42,25 frente a 44,59 de deepseek-v4.1-flash y 39,96 de gpt-6-luna en TitleBench-800). La arquitectura híbrida del modelo base combina capas de atención lineal Gated-DeltaNet con capas de atención completa, lo que reduce el coste de inferencia en entradas largas.

El modelo está pensado para un uso muy restringido: una sola intervención de usuario, sin system prompt, con decodificación greedy y un máximo de 48 tokens nuevos. No es un asistente conversacional ni un modelo de razonamiento general, y el propio autor documenta fallos de comportamiento cuando la entrada se sale de ese molde. La licencia Apache 2.0 permite uso comercial con las obligaciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido `Qwen3_5ForCausalLM` (`model_type: qwen3_5_text`); 24 capas con patrón de 3 capas Gated-DeltaNet (atención lineal) por cada capa de atención completa |
| Parametros totales | 752.393.024 (aproximadamente 0,75B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | `max_position_embeddings=262144` en la configuración heredada de Qwen3.5; uso recomendado y de entrenamiento limitado a 1024 tokens de entrada (primeros 768 + últimos 256) y 48 tokens nuevos de salida |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en bfloat16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | chino (zh) e inglés (en), según la model card; el seguimiento del idioma del usuario es parcial (3 de 6 en las pruebas internas del autor) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` de 1.504.827.608 bytes, 320 tensores BF16); sin pesos visuales |

Otros datos técnicos: dimensión oculta 1024, dimensión FFN 3584, 8 cabezas de consulta y 2 cabezas KV con `head_dim=256`, vocabulario de 248.320 tokens. Dependencias declaradas: `transformers >= 5.2` (con soporte para Qwen3.5) y `jinja2 >= 3.1`.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura híbrida de Qwen3.5-0.8B: 24 capas en las que tres de cada cuatro usan Gated-DeltaNet, un mecanismo de atención lineal con estado recurrente, y la cuarta usa atención completa. Esta combinación reduce el coste computacional y de memoria en secuencias largas frente a un transformer denso equivalente, a cambio de una implementación menos estándar. El autor indica que se puede acelerar el núcleo de Gated-DeltaNet instalando `flash-linear-attention`. El checkpoint exportado elimina la torre visual del modelo base y se carga con `AutoModelForCausalLM`, no con `AutoModelForImageTextToText`.

El entrenamiento es un SFT de pleno parámetro en bf16 partiendo del modelo base, no un ajuste con adaptadores. Según el artículo del autor (no verificado en logs dentro del repositorio), el corpus se dividió en 15.924 ejemplos de entrenamiento, 1.162 de desarrollo y 1.175 de test; tras limpieza y aumentación específica, el conjunto final fue de 17.878 pares conversación–título. La pérdida se calcula únicamente sobre los tokens del título y el token de fin. Se usaron 2 épocas, 562 pasos de optimizador, tasa de aprendizaje 2e-5 con scheduler coseno y warmup, y un presupuesto de 8.192 tokens por paso; el autor cifra la ejecución completa en unos 18 minutos sobre una A100 de 40 GB. El prompt de entrenamiento es un único turno de usuario sin system prompt, seguido de un bloque `think` vacío, y las entradas largas se truncan conservando los primeros 768 tokens y los últimos 256.

## Capacidades

- Generación de títulos cortos a partir del primer mensaje de usuario de una conversación, en chino e inglés.
- Manejo de entradas sin información útil ("hi", "???"): 10 de 10 aciertos en las pruebas internas del autor, sin inventar contenido.
- Resistencia parcial a la inyección de instrucciones colocada después de la pregunta real: 4 de 4 en las pruebas internas.
- Tratamiento de mensajes con dos temas distintos en un mismo turno: 2 de 2 en las pruebas internas.
- Seguimiento del idioma del usuario: limitado, 3 de 6 en las pruebas internas del autor.
- No soporta tool calling ni function calling de forma documentada.
- No soporta flujos de agente ni razonamiento multi-paso; el bloque `think` debe ir vacío.
- No tiene capacidades de visión ni de audio en este checkpoint, aunque el modelo base las tuviera.
- No es un modelo de propósito general: no debe usarse para responder preguntas ni mantener conversaciones.

## Casos de uso

- Etiquetado automático de conversaciones en un producto de chat: el modelo recibe el primer mensaje del usuario y devuelve un título de pocas palabras para el historial o la bandeja de entrada. Su ventana efectiva de 1024 tokens cubre la mayoría de primeros mensajes y el coste por petición es de un modelo de 0,75B.
- Organización de tickets de soporte: al crear un ticket, el primer mensaje del cliente se convierte en un título legible que facilita el triaje y la búsqueda posterior en el sistema de helpdesk.
- Indexación y búsqueda de historiales: generar títulos normalizados permite construir índices de conversaciones y mejorar la recuperación semántica o por palabra clave en herramientas internas.
- Agrupación temática de sesiones: los títulos generados sirven como etiqueta ligera para agrupar conversaciones por tema en paneles de analítica, sin necesidad de un modelo de embeddings adicional.
- Generación de asuntos en clientes de correo o mensajería: integrado en el backend, produce un asunto corto para hilos nuevos a partir del primer mensaje, con latencia baja al ejecutarse en una sola GPU.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 1,5 GB en bf16, cabe en GPUs de consumo y permite ejecutar el etiquetado en la misma máquina que el servicio de chat, evitando llamadas a APIs externas y los costes asociados.
- Filtrado y preprocesado de datasets: para curar corpus de conversaciones, el modelo puede generar títulos de referencia que ayuden a detectar duplicados o conversaciones de baja calidad antes de un entrenamiento posterior.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, con decodificación greedy y el evaluador oficial de TitleBench. La columna en negrita de cada tabla es la mejor puntuación de esa columna según el autor.

TitleBench-800 (N=800, evaluador oficial):

| Modelo | ROUGE-1 | ROUGE-L | chrF | BLEU-4 | EM |
|---|---:|---:|---:|---:|---:|
| Cancri α 0.8B (24L) | 42,25 | 40,16 | 30,31 | **31,44** | **3,50** |
| Cancri α 0.8B-Lite (18L) | 38,88 | 36,57 | 26,13 | 29,16 | 1,75 |
| deepseek-v4.1-flash | **44,59** | **42,44** | **31,80** | 27,99 | 2,00 |
| glm-5.3-flash | 43,52 | 40,74 | 30,07 | 24,94 | 0,50 |
| gpt-6-luna | 39,96 | 37,53 | 28,25 | 26,74 | 1,62 |
| Qwen3.5-0.8B (sin entrenar, zero-shot) | 34,00 | 32,18 | 22,48 | 25,64 | 2,00 |
| Supra-Title-350M-exp | 31,45 | 29,40 | 21,56 | 29,98 | 1,75 |

Cancri-ZH (N=1.175, tokenización con soporte CJK):

| Modelo | ROUGE-1 | ROUGE-L | chrF | BLEU-4 | EM |
|---|---:|---:|---:|---:|---:|
| Cancri α 0.8B (24L) | **60,58** | **57,14** | **29,01** | **41,75** | **5,53** |
| Cancri α 0.8B-Lite (18L) | 59,62 | 56,18 | 27,49 | 40,44 | **5,53** |
| deepseek-v4.1-flash | 55,43 | 52,47 | 23,49 | 36,53 | 3,49 |
| glm-5.3-flash | 56,87 | 52,76 | 24,17 | 36,52 | 2,81 |
| gpt-6-luna | 58,34 | 55,53 | 25,81 | 37,42 | 3,66 |
| Qwen3.5-0.8B (sin entrenar, zero-shot) | 44,75 | 40,87 | 14,01 | 24,70 | 0,68 |
| Supra-Title-350M-exp | 34,07 | 31,37 | 10,21 | 18,68 | 0,26 |

Advertencia del propio autor: Cancri-ZH es una partición de test del mismo corpus de entrenamiento, por lo que es una evaluación dentro de la distribución para Cancri α y no es directamente comparable con los modelos API. Además, parte de la partición pública de TitleBench proviene de datos de SupraLabs, lo que puede favorecer a Supra-Title.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB solo para los pesos en bfloat16; con caché KV y overhead del runtime, el consumo práctico se sitúa en torno a 2-3 GB para las longitudes de entrada recomendadas (1024 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona en A100 y H100, pero está muy sobredimensionado para ellas; el objetivo natural son GPUs de consumo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores, así como en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers >= 5.2` con `AutoModelForCausalLM` es la vía documentada; no se documentan recetas para vLLM, TGI, llama.cpp ni Ollama, y la arquitectura híbrida con Gated-DeltaNet puede requerir soporte específico en esos runtimes. El autor menciona `flash-linear-attention` como acelerador opcional del núcleo de atención lineal.
- Latencia y throughput: el autor reporta, en una A100 compartida y sin `causal_conv1d`, un TTFT de 64,6 ms para el modelo principal con un prompt de 1.036 tokens y 40,1 ms por token de salida; para la variante Lite, 47,1 ms y 29,6 ms respectivamente. Estas cifras deben interpretarse como comparación relativa, no como referencia absoluta de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cancri α-0.8B | 0,75B | 262.144 en configuración; 1024 en uso | Generación de títulos | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | Modelo general multimodal | Apache 2.0 | Hugging Face |
| Cancri α-0.8B-Lite | 0,62B (18 capas) | Igual que el principal | Generación de títulos | Apache 2.0 (según el autor) | No incluido en este checkpoint |
| Supra-Title-350M-exp | 350M | no disponible | Generación de títulos | no disponible | Referenciado en los benchmarks del autor |
| deepseek-v4.1-flash | no disponible | no disponible | Modelo API general | propietaria | API |
| gpt-6-luna | no disponible | no disponible | Modelo API general | propietaria | API |

La comparación relevante es doble: frente a su modelo base sin entrenar, Cancri α gana entre 8 y 16 puntos de ROUGE-1 en TitleBench-800 y Cancri-ZH, lo que cuantifica el efecto del SFT; frente a los modelos API, pierde en ROUGE y chrF en TitleBench-800 pero gana en BLEU-4 y EM, y en Cancri-ZH supera a todos en todas las métricas, con la salvedad de que ese conjunto es distribución interna.

## Limitaciones y advertencias

- Respuestas a preguntas en lugar de títulos: en las pruebas internas del autor, 5 de 7 casos de "respuesta inducida" produjeron una respuesta directa (por ejemplo, "1+1等于几" devuelve "1+1等于2") en lugar de un título.
- Seguimiento del idioma incompleto: 3 de 6 en las pruebas internas; preguntas en inglés sobre temas chinos pueden generar títulos en chino, y en TitleBench-800 se observaron títulos en un tercer idioma.
- Inyección de instrucciones: aunque resiste la inyección posterior a la pregunta (4 de 4), el autor advierte de que una inyección colocada antes de la pregunta real puede filtrarse al título.
- Formato de prompt estricto: exige un único turno de usuario sin system prompt y un bloque `think` vacío. Cualquier desviación del formato de entrenamiento (por ejemplo, añadir instrucciones de sistema) degrada la salida; el autor advierte además que versiones de `jinja2` anteriores a 3.1 escriben mal la plantilla de chat de forma silenciosa.
- Uso fuera de dominio: no es un asistente, no razona, no hace tool calling ni mantiene conversaciones; emplearlo para esas tareas produce resultados no fiables.
- Contexto efectivo mucho menor que el nominal: aunque la configuración declara 262.144 posiciones, el modelo se entrenó y se recomienda usar con 1024 tokens de entrada y 48 de salida; no hay evidencia de calidad fuera de ese rango.
- Datos de entrenamiento y evaluación no auditables: el repositorio no incluye `trainer_state.json` ni logs, y la evaluación Cancri-ZH es distribución interna, por lo que las cifras deben tomarse con cautela.
- Licencia: Apache 2.0 permite uso comercial, pero obliga a incluir el texto de la licencia y las atribuciones de Qwen Team / Alibaba Cloud como obra derivada; no concede derechos sobre las marcas Qwen, Alibaba Cloud ni NexusV.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o de género; al estar entrenado sobre un corpus de conversaciones no descrito en detalle, puede reproducir los sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xingy555888/Cancri-alpha-0.8B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Artículo del autor sobre el modelo (referenciado como `article.html?id=cancriAlpha`): no disponible como URL pública verificada en la información proporcionada
- Repositorio de `flash-linear-attention` (acelerador opcional del núcleo Gated-DeltaNet): no se proporciona URL en la información disponible
