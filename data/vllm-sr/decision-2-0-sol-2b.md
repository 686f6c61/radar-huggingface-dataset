# vllm-sr/Decision-2.0-Sol-2B

## Resumen

Decision-2.0-Sol-2B es un modelo de decisión de 1,88 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router (organización vllm-sr). No es un modelo generativo: recibe un estado de entrada (texto o JSON) junto con un conjunto de preguntas y devuelve, en una sola pasada hacia delante, una probabilidad para cada opción de respuesta. Soporta tres tipos de decisión: elección entre varias opciones (choice), sí/no (noul) y puntuación en una escala (score).

El modelo es un ajuste fino (finetune) de vllm-sr/Decision-1.0-Sol-2B y se publica bajo licencia Apache-2.0 con pesos en safetensors y código personalizado que debe cargarse con trust_remote_code=True. Su ventana de contexto es de 16.384 tokens y su caso de uso natural es el enrutamiento semántico dentro de infraestructuras de servicio de LLM: decidir qué modelo, qué equipo o qué política aplicar a una petición sin gastar tokens en generación de texto.

Su relevancia radica en el binomio latencia/coste: el autor declara una mediana de 7,2 ms por petición de una sola pregunta en una única GPU, y lidera la comparativa JevArena de su categoría con 52,1 puntos, por delante de Decider 2B (49,5), This-That 1.2 (46,1), Decision 1.0 Sol (45,8) y Bosun v3.1 1.7B (42,1). Frente a su predecesor directo mejora 6,3 puntos en JevArena y 4,2 en el Jev Decision Index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo transformer distribuido vía la librería transformers con código personalizado (custom_code) |
| Parámetros totales | 1,88B |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | No disponible (el repositorio publica pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipos de decisión | Choice (elección), Yes/No (sí/no), Score (puntuación en escala) |
| Pipeline declarado | feature-extraction |
| Modelo base | vllm-sr/Decision-1.0-Sol-2B (relación: finetune) |
| Tamaño del repositorio | 4,8 GB |
| Librería y versión mínima | transformers >= 5.17, torch, safetensors |
| Descargas / likes | 289 descargas, 11 likes |
| Fecha de creación / actualización | 28-09-2026 / 03-10-2026 |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá de que se trata de un modelo cargable con `transformers` mediante `AutoModel` y `trust_remote_code=True`, con pesos en safetensors y código personalizado que expone un método `system_one(state, questions)` y un pipeline propio de tipo `decision`. Los tags del repositorio incluyen `decision2`, `decision-model`, `classification` y `system-one`, lo que sitúa al modelo en la categoría de clasificación estructurada en una sola pasada. No se especifica si emplea atención estándar, atención lineal, decodificación especulativa ni ningún otro mecanismo de eficiencia.

Tampoco se publican datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo único documentado es que se trata de un finetune de Decision-1.0-Sol-2B y que, según el autor, los datos de entrenamiento fueron auditados a nivel de fila contra todos los elementos de test del Jev Decision Index, con el objetivo de descartar contaminación. La evaluación del índice declarada es una reproducción independiente realizada con el kit oficial 0.2.1 sobre los pesos publicados.

## Capacidades

- Decisión de elección múltiple (choice): asigna probabilidad a cada una de las categorías definidas por el usuario mediante criterios textuales.
- Decisión binaria (noul / yes-no): responde afirmativa o negativamente a una pregunta cerrada sobre el estado de entrada.
- Puntuación en escala (score): ordena el estado de entrada según una lista de niveles definidos por el usuario (por ejemplo, rutina, pronto, hoy).
- Respuesta simultánea a varias preguntas en una sola pasada hacia delante, devolviendo una probabilidad por cada opción de cada pregunta.
- Entrada mixta: acepta texto plano o JSON como estado de entrada.
- No genera texto: la salida son probabilidades, lo que elimina el riesgo de alucinación en formato libre y reduce el coste por consulta.
- Sin soporte documentado de tool calling ni function calling en el sentido habitual de los LLM generativos; la interfaz estructurada es el propio esquema de preguntas y criterios.
- Sin soporte documentado de agentes, multi-step reasoning, visión ni audio.
- Idiomas soportados: no disponible, no se documenta cobertura multilingüe.

## Casos de uso

- Enrutamiento semántico en una pasarela de LLM: dado el prompt de un usuario, el modelo decide en milisegundos a qué modelo o a qué endpoint derivarlo (por ejemplo, modelo pequeño para consultas simples, modelo grande para razonamiento), evitando el coste de una llamada generativa previa.
- Triaje de tickets de soporte: con un estado que describa la incidencia, se define un criterio de elección por equipo (devoluciones, facturación, técnico) y el modelo devuelve la probabilidad de cada equipo, tal como aparece en el ejemplo de la model card.
- Verificación de requisitos en flujos de negocio: preguntas binarias del tipo "¿el cliente aporta recibo?" o "¿el pedido está dentro del plazo de devolución?" permiten encadenar automatizaciones sin generar texto intermedio.
- Priorización de urgencia: mediante el tipo score, el modelo clasifica peticiones en niveles de urgencia, útil para colas de atención o para SLA diferenciados.
- Moderación y puertas de seguridad: decisión binaria sobre si un contenido entra dentro de una política, con umbral ajustable sobre la probabilidad devuelta.
- Selección de contexto en pipelines RAG: decidir si la consulta del usuario requiere recuperación documental o puede resolverse directamente, y en caso afirmativo qué índice consultar.
- Encaminamiento de tráfico en arquitecturas multiagente: repartir tareas entre agentes especializados usando el tipo choice con criterios descriptivos.
- Clasificación a escala sobre grandes volúmenes: el coste por decisión es de milisegundos y no implica decodificación autoregresiva, lo que permite procesar lotes grandes con una sola GPU.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Modelo | JevArena ↑ | Transferencia con etiquetado humano ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| Decision-2.0-Sol-2B | 52,1 | 51,3 | 29,5 |
| Decider 2B | 49,5 | 42,0 | no disponible |
| This-That 1.2 | 46,1 | 40,5 | no disponible |
| Decision 1.0 Sol | 45,8 | 49,3 | 25,3 |
| Bosun v3.1 1.7B | 42,1 | 38,0 | no disponible |

Notas metodológicas declaradas por el autor: todos los modelos responden a los mismos prompts congelados y se puntúan de la misma forma; las respuestas ausentes o inválidas cuentan como errores. La métrica de transferencia con etiquetado humano es la mediana de macro-F1 sobre 15 tareas anotadas por personas, multiplicada por 100. Para el Jev Decision Index, Decision 2.0 se evaluó mediante reproducción independiente con el kit oficial 0.2.1 sobre los pesos publicados; el resto de cifras provienen de una captura pública del board con fecha 28-09-2026. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

Rendimiento declarado: mediana de 7,2 ms por petición de una sola pregunta en una única GPU. No se especifica el modelo de GPU empleado, ni el throughput agregado, ni el comportamiento con lotes grandes.

## Requisitos de hardware

- Peso de los pesos en el repositorio: 4,8 GB, coherente con 1,88B parámetros en precisión de 16 bits.
- VRAM estimada en bf16/fp16: aproximadamente 4-5 GB contando pesos y sobrecarga de activaciones y contexto; el autor no publica la cifra exacta.
- VRAM estimada en cuantización de 8 bits: del orden de 2,5-3 GB; en 4 bits, del orden de 1,5-2 GB. Estas cifras son estimaciones a partir del número de parámetros, ya que no se publican cuantizaciones oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs de 4-6 GB requeriría cuantización, no publicada oficialmente.
- GPU de datacenter compatibles por tamaño: A100, H100, L40S, L4, A10G; el modelo es lo bastante pequeño como para servirse en una única GPU en todos los casos.
- Despliegue documentado: únicamente `transformers` (AutoModel con trust_remote_code=True) y el pipeline `decision` con la misma marca de código remoto. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama para estos pesos, a pesar de que el proyecto matriz sea vLLM Semantic Router.
- Latencia declarada: 7,2 ms de mediana por petición de una sola pregunta en una sola GPU. Throughput y latencia bajo carga concurrente: no disponibles.
- Requisito de software: transformers >= 5.17, torch y safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevArena ↑ | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Decision-2.0-Sol-2B | 1,88B | 16.384 | 52,1 | Apache-2.0 | Pesos abiertos en HuggingFace |
| Decision 1.0 Sol (modelo base) | no disponible | no disponible | 45,8 | no disponible | Pesos abiertos en HuggingFace |
| Decider 2B | ~2B (denominación comercial) | no disponible | 49,5 | no disponible | no disponible |
| This-That 1.2 | no disponible | no disponible | 46,1 | no disponible | no disponible |
| Bosun v3.1 1.7B | 1,7B | no disponible | 42,1 | no disponible | no disponible |

Datos de licencia, contexto y disponibilidad de los competidores: no disponibles en la información proporcionada. La única comparación con cifras completas es frente a su predecesor, Decision 1.0 Sol, al que supera en 6,3 puntos de JevArena (+4,2 en el Jev Decision Index), aunque este último obtiene mejor resultado en transferencia con etiquetado humano (49,3 frente a 51,3 del nuevo modelo a favor del 2.0, según la tabla publicada).

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre ni mantener conversaciones; únicamente devuelve probabilidades sobre opciones predefinidas por el usuario.
- Riesgo de alucinación bajo en formato, pero no nulo en contenido: una probabilidad alta no garantiza que la decisión sea correcta, especialmente fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles. No se publica ninguna evaluación de sesgo demográfico, geográfico o lingüístico.
- Cobertura de idiomas: no disponible. No se puede asumir un rendimiento equivalente en castellano sin una evaluación previa.
- Límite de contexto de 16.384 tokens: estados de entrada muy largos (por ejemplo, historiales de conversación extensos o documentos completos) deben truncarse o resumirse antes de la llamada.
- Ejecución de código remoto: el uso de `trust_remote_code=True` implica ejecutar código publicado por el autor del modelo; conviene revisar y fijar una revisión concreta del repositorio en entornos de producción.
- Dependencia de versión: requiere transformers >= 5.17, una versión muy reciente; puede entrar en conflicto con otros modelos o frameworks del mismo entorno.
- Escala de puntuación: el tipo score depende de criterios textuales definidos por el usuario; la calibración de los umbrales debe validarse con datos propios.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. No se declaran restricciones adicionales de uso aceptable.
- Madurez: el repositorio tiene 289 descargas y 11 likes, y fue publicado en septiembre de 2026, por lo que la validación por parte de la comunidad es todavía muy limitada.
- Despliegue en producción: no hay soporte documentado para servidores de inferencia de alto rendimiento, lo que obliga a construir el servicio alrededor de transformers o a validar por cuenta propia la integración con otras herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Decision-2.0-Sol-2B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Modelo base Decision-1.0-Sol-2B: https://huggingface.co/vllm-sr/Decision-1.0-Sol-2B
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Sitio oficial de vLLM: https://vllm.ai/
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
