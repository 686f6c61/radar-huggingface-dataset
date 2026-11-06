# textilelabs/Loom-Swift-Micro-2

## Resumen

Loom Swift Micro 2 es un modelo de lenguaje experimental de 1.172.832 parámetros (1,17 millones) desarrollado por Textile Labs, entrenado desde cero (pesos inicializados aleatoriamente, sin partir del checkpoint de nadie) en solo cinco minutos de cómputo sobre dos GPU T4 de Kaggle. Es la segunda generación de Loom Swift Micro y está diseñado como un modelo minúsculo para tareas minúsculas: mantener breves conversaciones, decir quién es, rechazar aquello que no puede saber y escribir llamadas a herramientas (calculadora, fechas, búsqueda).

La novedad principal de esta versión es que se ha reconstruido sobre la arquitectura Gemma-3 (ventana deslizante local con una capa global cada seis capas), con un tokenizador BPE de 4.096 tokens donde cada dígito es un token propio, y un contexto de 2.048 tokens. Gracias a la plantilla de chat y el token de fin de turno integrados en el GGUF, funciona directamente en PocketPal, LM Studio, Jan, llama.cpp y Ollama, incluidas aplicaciones móviles.

Su relevancia no está en el rendimiento —la propia model card reconoce que no es un lector ni un razonador— sino en ser un experimento honesto y medido de IA "humble" en el dispositivo: publica una batería de aceptación de 133 pruebas con sus fallos explícitos, lo que lo convierte en una referencia interesante para estudiar los límites de los modelos ultrapequeños y el diseño de harnesses de agentes con tool use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Gemma-3 (12 capas × 96 de dimensión; ventana deslizante local + capa global cada 6 capas) |
| Parametros totales | 1.172.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (GGUF); comportamiento casi identico entre ambas |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo sigue el layout de Gemma-3: un transformer decoder con 12 capas de dimension 96 que combina atención local con ventana deslizante y una capa de atención global cada seis capas. El tokenizador es un BPE de 4.096 tokens reconstruido para esta versión, con la particularidad de que cada dígito numérico es un token independiente, y es idéntico en llama.cpp. La plantilla de chat y el token de fin de turno (`<|eot|>`) van integrados en el GGUF, lo que permite el uso directo en aplicaciones de chat sin configuración adicional.

Fue entrenado desde cero durante cinco minutos en las dos GPU T4 gratuitas de Kaggle, el mismo tiempo que la versión original empleó sobre una CPU de oficina de 2013. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO (no disponible). El propio formato de prompt usa marcadores como `<tools:on>` / `<tools:off>`, `<user>`, `<loom>` y `<|eot|>`, lo que sugiere un entrenamiento dirigido a un harness de agente con conmutación de herramientas.

## Capacidades

- Conversación breve multi-turno en inglés: mantiene 5/5 turnos sin salirse del tema en la batería interna.
- Identidad: sabe decir su propio nombre, incluso con errores de tecleo (11/12 en ambas pruebas).
- Calibración de ignorancia: rechaza responder sobre hechos que no puede conocer (18/20 con puntuador estricto) y nunca afirma haber hecho una búsqueda que no realizó (16/16).
- Tool use: decide cuándo se necesita una herramienta y escribe llamadas a calculadora (13/40 en el test conjunto), aritmética de fechas (3/10) y búsqueda.
- Etiquetado de texto corto: tema, idioma, sentimiento, toxicidad y enrutado (28/60).
- Lectura básica de resultados de búsqueda: responde a partir de un pasaje recuperado (3/5 en la batería; 4/60 en el test conjunto más estricto).
- Parada autónoma: termina su turno por sí mismo (12/12) y no filtra etiquetas de búsqueda cuando las herramientas están desactivadas (28/28).
- Ejecución en dispositivo: corre en apps móviles y de escritorio (PocketPal, LM Studio, Jan) vía GGUF.

No hay indicios de capacidades de visión, audio, razonamiento extendido (thinking mode) ni soporte de agentes multi-paso complejos más allá del harness de calculadora/fecha/búsqueda.

## Casos de uso

- Prueba de concepto de agentes en el dispositivo: sirve como base mínima para estudiar cómo un modelo de 1 M de parámetros decide cuándo invocar una herramienta (calculadora, fecha, búsqueda) sin conexión.
- Chatbot de identidad embebido: un asistente que responde "quién eres" y mantiene 5 turnos coherentes, adecuado para demos o tutoriales en apps móviles.
- Etiquetado ligero de texto: clasificar textos cortos por tema, idioma, sentimiento o toxicidad con un coste de inferencia despreciable, útil como router previo a un modelo mayor.
- Enrutado de consultas (route): decidir a qué módulo o servicio enviar una petición breve en un pipeline de NLP.
- Ejecución de aritmética asistida: generar llamadas a calculadora para sumas y operaciones básicas en lugar de calcular por sí mismo.
- Redacción de llamadas de fecha: aritmética de fechas simple ("¿qué día es X + N días?") delegada a una herramienta.
- Material educativo y de investigación: por su tamaño (1,17 M de parámetros) y su documentación de fallos, es idóneo para enseñar cuantización, tokenización y evaluación de LLMs en hardware modesto.
- Interfaz conversacional mínima offline: un chat funcional en PocketPal, LM Studio, Jan, llama.cpp u Ollama sin descargar modelos de cientos de MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica la batería de aceptación interna de Textile Labs (133 pruebas) y un test conjunto de tareas nuevas (275 ítems reservados, con prompts depurados del entrenamiento):

| Prueba | Loom Swift Micro (original) | Loom Swift Micro 2 |
|---|---:|---:|
| Bateria total /133 | 110 | 110 |
| Chat cotidiano (/15) | 4 | 11 |
| Rechazar hecho desconocido (/20) | 18* | 18 |
| Ignorar instruccion en un pasaje (/10) | 0 | 4 |
| Etiquetado (/60) | 0 | 28 |
| Llamada a calculadora correcta (/40) | 0 | 13 |
| Aritmetica de fechas (/10) | 0 | 3 |
| Leer un pasaje recuperado (/60) | 0 | 4 |
| Extraccion tipada (/30) | 0 | 0 |
| Redaccion con coincidencia exacta (/30) | 0 | 0 |
| Dice "(sure)" y acierta | — | 22% de 82 |
| Dice su nombre (/12) | 11 | 11 |
| Conversacion de 5 turnos (/5) | 5 | 5 |
| Responde desde resultado de busqueda (/5) | 0 | 3 |
| Nunca afirma una busqueda no realizada (/16) | 16 | 16 |
| No filtra etiqueta de busqueda (/28) | 28 | 28 |
| Se detiene solo (/12) | 12 | 12 |
| Busca cuando debe (/20) | 15 | 16 |

*Puntuado con un puntuador mas laxo.

Entre cuantizaciones, Q8_0 y Q4_K_M difieren en pocos ítems (etiquetado 30/60 vs 27/60; resistencia a inyección 5/10 vs 1/10, siendo esta última la parte menos estable).

## Requisitos de hardware

- VRAM estimada: con 1,17 M de parámetros, el modelo ocupa menos de 3 MB en FP16 y alrededor de 1 MB en Q4_K_M; se ejecuta sin problema en la CPU de cualquier teléfono moderno o en cualquier GPU, sin requisito mínimo de VRAM relevante.
- GPU recomendadas: no se necesitan GPU dedicadas; cualquier hardware sirve. El entrenamiento se realizó en 2 × NVIDIA T4 (Kaggle).
- Consumer GPU: cabe de sobra en cualquier GPU, incluso integradas; el modelo está pensado para ejecución en CPU y móviles.
- Despliegue: soportado de forma nativa en Ollama, llama.cpp, PocketPal, LM Studio y Jan directamente desde el GGUF; también cargable con la librería transformers (safetensors). No hay menciones a vLLM o TGI.
- Latencia y throughput: no disponibles; por tamaño, la inferencia es prácticamente instantánea en hardware moderno, pero no se publican cifras.

## Comparativa con modelos similares

Comparativa dentro de la familia Loom de Textile Labs (batería /133; los scores de filas distintas pueden no ser directamente comparables según advierte el autor):

| Modelo | Parametros | Bateria /133 | Lee prosa real | Apps de movil |
|---|---:|---:|---|---|
| Loom Swift Micro 2 | 1,17M | 110 | apenas (7%) | si |
| Loom Swift Mini 2 | 2,0M | 120 | apenas (12%) | si |
| Loom Swift Mini (original) | 2,0M | 110 | no | no |
| Loom Spark 3 Flash | 7,18M | 119 | solo curada | no |
| Loom Weave 4 | 55,6M | 127 | si | si |

Frente a Swift Mini 2, el Micro 2 pierde capacidad de lectura y puntuación global, pero mantiene el mismo perfil de agente con herramientas en la mitad de parámetros. No hay modelos comparables de otros fabricantes en esta escala documentados en la información disponible.

## Limitaciones y advertencias

- No es un lector ni un razonador: la model card lo declara explícitamente. Falla 56/60 en lectura de pasajes recuperados en el test conjunto y 0/30 en extracción tipada y redacción.
- Alto riesgo de alucinación en tareas de conocimiento: solo acierta el 22% de las veces cuando responde con confianza ("(sure)") en su propio test.
- Resistencia a inyección de instrucciones muy débil: 4/10 (Q8) y 1/10 (Q4_K_M); es la parte menos estable y un riesgo serio si se expone a texto no confiable.
- Solo inglés; no está pensado para otros idiomas.
- Contexto de 2.048 tokens, insuficiente para documentos largos.
- Las llamadas a calculadora solo son correctas el 32,5% de las veces (13/40): no debe usarse como generador de llamadas de herramientas sin validación externa.
- Es un proyecto experimental y de investigación; el propio autor advierte de que no es una actualización estricta del original (empate 110/133) y que no debe compararse scores de baterías con configuraciones distintas.
- Licencia MIT: sin restricciones para uso comercial, aunque la calidad del modelo limita su aplicación práctica en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Swift-Micro-2
- Generación anterior: https://huggingface.co/textilelabs/Loom-Swift-Micro
- Autor (Textile Labs): https://huggingface.co/textilelabs
- Paper, repositorio de código y demos: no disponibles en la información proporcionada.
