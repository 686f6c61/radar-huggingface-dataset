# TuanPhat/JIS-1.5

## Resumen

JIS-1.5 es un modelo de decisión (decision model) desarrollado por TuanPhat que no genera texto: recibe un estado y una pregunta tipada junto con un conjunto de opciones, y devuelve una distribución de probabilidad sobre esas opciones. Está construido sobre el encoder bidireccional mmBERT-base de jhu-clsp, lo que le aporta capacidades multilingües (inglés, vietnamita y chino) y una ventana de contexto de hasta 8.192 tokens completos por pregunta. El modelo resuelve el problema de automatizar decisiones estructuradas —clasificación, preguntas booleanas y puntuaciones ordinales— dentro de pipelines de agentes, sin coste de generación autoregresiva.

La arquitectura combina un bloque de entrada compartido de seis capas, un bucle compartido de doce capas que puede ejecutarse una, dos o tres veces según el modo (Fast, Deep o Adaptive) y un bloque de salida de cuatro capas, lo que resulta en 22, 34 o 46 aplicaciones de capa por inferencia. Incluye una cabeza lineal compartida de 769 parámetros F32 que puntúa cada opción en el token del corchete de cierre de su marcador. El checkpoint completo tiene 310.885.654 parámetros (306,9 M en FP16 y 3,9 M en F32) y se distribuye en un único archivo safetensors de unos 600 MiB.

Es relevante ahora porque propone una alternativa determinista y de bajo coste computacional frente a los LLM generativos para tareas de enrutamiento, clasificación y decisión dentro de sistemas multiagente, con modos de profundidad configurables que permiten intercambiar latencia por precisión sin recargar el modelo. Su licencia Apache 2.0 y su empaquetado autocontenido (pesos, configuración y tokenizador incluidos) facilitan el despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional mmBERT-base con bucle compartido de 12 capas, bloque de entrada de 6 capas y bloque de salida de 4 capas |
| Parametros totales | 310.885.654 (306.939.648 FP16 + 3.946.006 F32) |
| Parametros activos | No aplica (no es MoE); el modo Adaptive ejecuta 22, 34 o 46 aplicaciones de capa según el router |
| Longitud de contexto | 8.192 tokens completos por pregunta (estado, opciones, marcadores y tokens especiales); entradas mayores lanzan `ValueError` sin truncar |
| Tipos de cuantizacion | Pesos almacenados en dtypes mixtos FP16/F32; autocast FP16 en CUDA y upcast a F32 en CPU; no se documentan cuantizaciones GGUF/INT8 |
| Idiomas soportados | Inglés (en), vietnamita (vi), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único archivo de 629.695.824 bytes, ~600,52 MiB) |

## Arquitectura y entrenamiento

JIS-1.5 se apoya en el encoder bidireccional mmBERT-base, un transformer multilingüe sin decodificador autoregresivo. Sobre esa base, el modelo organiza el cómputo en tres bloques: uno de entrada de seis capas compartido, un bucle de doce capas que puede repetirse y un bloque de salida de cuatro capas. El modo Fast ejecuta el bucle una vez (22 aplicaciones de capa), Deep tres veces (34) y Adaptive emplea un router para seleccionar uno, dos o tres rondas por pregunta (hasta 46). La puntuación de opciones se realiza con una única cabeza lineal compartida de 769 parámetros F32 que opera sobre el token del corchete de cierre de cada marcador de candidato, de modo que todas las opciones de una pregunta se evalúan en una sola secuencia empaquetada.

El tokenizador incluido tiene un vocabulario de 256.000 tokens. Las temperaturas internas son 1.0 para los tres tipos de decisión (`choice`, `noul`, `score`). El modelo soporta tres tipos de pregunta: elección entre al menos dos candidatos con descripción, booleana con P(verdadero) y puntuación ordinal con índice esperado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona una evaluación sobre el checkpoint congelado de la «Phase 4», pero no detalla el proceso de entrenamiento.

## Capacidades

- Decisión estructurada sobre opciones: devuelve distribución de probabilidad, opción ganadora, confianza superior, profundidad ejecutada y recuento de tokens de entrada.
- Tres tipos de pregunta: `choice` (selección entre candidatos), `noul` (booleana con P(true)) y `score` (nivel ordinal con índice esperado).
- Modos de inferencia conmutables en el mismo checkpoint: Fast (1 pasada), Deep (3 pasadas) y Adaptive (1-3 pasadas según router).
- Multilingüe en inglés, vietnamita y chino, heredado del backbone mmBERT.
- Acepta estados en texto plano o en cualquier valor serializable a JSON.
- Procesamiento de preguntas múltiples por llamada, evaluadas de forma independiente.
- No genera texto: la salida es siempre una distribución de probabilidad sobre opciones predefinidas.
- Capacidad de operar con contexto largo de hasta 8.192 tokens completos por pregunta, útil para estados extensos o descripciones de candidatos detalladas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni visión o audio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del usuario como estado y un conjunto de equipos (facturación, técnico, etc.) como opciones `choice`, y devuelve el equipo con mayor probabilidad. Es adecuado porque el contexto de 8.192 tokens permite incluir historial de conversación y políticas internas.
- Clasificación booleana en pipelines de moderación: con preguntas `noul` como «¿el mensaje contiene una solicitud de reembolso?» o «¿el usuario expresa urgencia?», el modelo devuelve P(true) directamente sin generar texto, lo que simplifica el postprocesado.
- Puntuación de urgencia o severidad: usando el tipo `score` con niveles ordenados («puede esperar», «mismo día», «inmediato»), el modelo devuelve el índice esperado y las probabilidades por nivel, útil para priorización automática en colas de atención.
- Triage médico multilingüe: los benchmarks reportados sobre CJ Medical (chino, 200.000 decisiones) y VM14K (vietnamita, 12.471 preguntas de opción múltiple) indican que el modelo está pensado para decisiones clínicas estructuradas en esos idiomas.
- Decisión dentro de sistemas multiagente: un orquestador puede invocar JIS-1.5 para elegir la siguiente herramienta o el siguiente agente entre un conjunto finito de opciones, con el modo Adaptive ajustando la profundidad de cómputo según la dificultad estimada.
- Evaluación de conformidad y políticas: dada una política y una acción propuesta, el modelo puede responder preguntas booleanas tipadas (`noul`) sobre si la acción cumple cada cláusula, con probabilidades auditables por opción.
- Extracción de señales estructuradas en batch: al no generar texto y procesar todas las opciones en una sola secuencia, es apto para clasificar grandes volúmenes de registros con latencias de decenas de milisegundos por muestra en GPU T4 (ver sección de rendimiento).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el checkpoint congelado de la Phase 4. Los porcentajes corresponden a precisión (accuracy) de JIS-1.5 en cada modo.

| Suite | Decisiones | Fast | Deep | Adaptive |
|---|---:|---:|---:|---:|
| Typed Decisions test | 2.000 | 33,90% | 35,15% | 35,85% |
| Hanno DecisionBench standard eval | 23.900 | 33,03% | 33,70% | 34,08% |
| JevBench public fixtures | 231 | 54,11% | 48,92% | 50,22% |
| Fast Decisions dev, por decisión | 4.800 | 50,29% | 49,79% | 49,79% |
| CJ Medical, todos los tipos | 200.000 | 65,37% | 66,26% | 66,22% |
| VM14K, opción múltiple en vietnamita | 12.471 | 38,20% | 36,91% | 37,27% |

Desglose de CJ Medical por tipo de decisión:

| Tipo | Decisiones | Fast | Deep | Adaptive |
|---|---:|---:|---:|---:|
| Choice | 98.543 | 35,86% | 36,87% | 36,56% |
| Noul | 98.544 | 95,16% | 95,82% | 96,04% |
| Score | 2.913 | 56,06% | 60,56% | 60,35% |

Notas de la model card: la cobertura de Hanno fue del 95,49% en cada modo y su precisión principal cuenta 1.078 entradas no codificables como fallos; la precisión médica global está muy influida por los resultados de tipo Noul; JevBench cubre solo los fixtures públicos, sin los casos sellados del leaderboard; Fast Decisions usa datos públicos de dev y reporta decisiones individuales, incluidas conversiones binarias de cabezas multilabel. La comparación con JIS-1.0 (53,70% en Typed Decisions) no es directa porque emplea un protocolo de evaluación distinto.

Rendimiento medido en Kaggle Tesla T4, batch 1, autocast FP16, 32 decisiones CJ Medical pre-tokenizadas (incluye collation, transferencia a GPU e inferencia):

| Modo | p50 (ms/muestra) | p95 (ms/muestra) | Muestras/ms | Muestras/s |
|---|---:|---:|---:|---:|
| Fast | 26,73 | 27,89 | 0,0374 | 37,42 |
| Deep | 65,31 | 68,39 | 0,0153 | 15,31 |
| Adaptive | 47,66 | 69,19 | 0,0210 | 20,98 |

La model card menciona además un perfil local en RTX 3060 con PyTorch 2.10.0+cu130 y FP16 autocast, pero el texto disponible se corta y no incluye cifras completas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 600 MiB en disco; con autocast FP16 y activaciones para 8.192 tokens, se estima holgadamente por debajo de 4 GB en GPU, aunque no se publica una cifra oficial de VRAM pico.
- GPU recomendadas: cualquier GPU con soporte FP16. Los datos publicados se midieron en Tesla T4 y RTX 3060; modelos superiores (A100, H100, RTX 4090, L4) deberían reducir la latencia de forma proporcional.
- Cabe en GPU de consumo: sí, en RTX 3060 y superiores; también es viable en CPU con upcast a F32, a costa de mayor latencia.
- Opciones de despliegue: el repositorio incluye `inference.py` con la clase `JIS` y el enum `Mode`, además de `profile_jis.py` y `requirements.txt`. No se documenta integración con vLLM, llama.cpp, Ollama o TGI; el modelo requiere código personalizado (`custom-code`) y no es un pipeline estándar de `transformers` sin ese código.
- Latencia y throughput: en T4 y batch 1, 26,73 ms/muestra (Fast), 65,31 ms/muestra (Deep) y 47,66 ms/muestra (Adaptive) de mediana; equivalentes a 37,42, 15,31 y 20,98 muestras/s respectivamente.
- El modelo no trunca entradas: si la pregunta completa supera los 8.192 tokens, el loader lanza `ValueError`, por lo que el pipeline debe trocear o rechazar entradas antes de invocar al modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| JIS-1.5 | 310,9 M | 8.192 tokens | Decision model con encoder mmBERT y bucle configurable | Apache 2.0 | Hugging Face (TuanPhat/JIS-1.5) |
| JIS-1.0 | No disponible | 1.024 tokens | Decision model con backbone GPT-2 de 12 capas y puntuación secuencial de candidatos | No disponible en la información | Hugging Face (TuanPhat/JIS-1.0) |
| mmBERT-base (jhu-clsp) | No disponible | No disponible | Encoder multilingüe base (fill-mask) | No disponible en la información | Hugging Face (jhu-clsp/mmBERT-base) |

No se dispone de datos de benchmarks de JIS-1.0 bajo el mismo protocolo que JIS-1.5, por lo que la comparación de rendimiento entre ambos no es directa. Tampoco se han identificado en la información proporcionada otros modelos de decisión comparables de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni razonamiento explícito; solo devuelve distribuciones sobre opciones predefinidas. No sirve para tareas de generación, resumen o diálogo abierto.
- Precisión moderada en varias suites: 33-36% en Typed Decisions y Hanno, y 38% en VM14K. El 65% de CJ Medical está muy influido por el tipo Noul (95-96%), mientras que Choice se queda en 35-37% y Score en 56-61%.
- Riesgo de alucinación estructural: al no generar texto, el riesgo se traslada a asignar probabilidad alta a la opción incorrecta, especialmente en preguntas `choice` con descripciones ambiguas o estados largos.
- Idiomas limitados a inglés, vietnamita y chino; no se documenta soporte para castellano ni otras lenguas.
- Límite estricto de 8.192 tokens sin truncado: entradas mayores provocan `ValueError`, lo que exige gestión explícita en producción.
- Requiere código personalizado (`custom-code`) para cargar el modelo; no es un pipeline estándar de `transformers` sin la clase `JIS` del repositorio.
- La model card no detalla sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son de noviembre de 2026; se recomienda validar el estado del repositorio antes de adoptarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no publica garantías ni auditorías externas de los resultados de benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TuanPhat/JIS-1.5
- Modelo anterior JIS-1.0: https://huggingface.co/TuanPhat/JIS-1.0
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Salidas de benchmark en Kaggle: https://www.kaggle.com/code/tunphtnguynhu/jis15-benchmark-local/output
