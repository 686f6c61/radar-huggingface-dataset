# zero-proof-ai/zeroproof-airline-jailbreak-4b

## Resumen

zeroproof-airline-jailbreak-4b es un adaptador LoRA publicado por zero-proof-ai sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su objetivo no es ser un modelo generalista, sino un agente de atención al cliente de aerolínea capaz de mantenerse en su rol cuando recibe ataques de jailbreak en el turno de usuario. El adaptador ocupa 0,1 GB, se distribuye en formato safetensors bajo licencia Apache 2.0 y la librería declarada es PEFT.

El problema que aborda es concreto: los modelos alineados tienden a romper su personaje o a desviarse cuando se les aplican técnicas de manipulación conocidas. El autor entrenó el adaptador con 567 filas sintéticas derivadas de 17 técnicas extraídas de la librería pública L1B3RT4S, pero nunca entrenó con ese corpus, que reservó íntegramente para evaluación. Sobre 165 ataques reales no vistos, el adaptador mantiene el rol el 86,7 % de las veces frente al 74,5 % del modelo base, con un delta de +0,121 (IC 95 % [+0,067, +0,176]).

La relevancia actual está en su enfoque metodológico: separa estrictamente datos sintéticos de entrenamiento y payloads reales de evaluación, publica el conjunto de datos y el grader, y documenta sus propias limitaciones, incluyendo la ausencia de un control de selección aleatoria y el hecho de que el profesor usado para autodestilado es el propio modelo base con una defensa inyectada en el prompt. Es un caso de estudio útil para equipos de red teaming y de alineación de seguridad, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada. Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Parámetros totales | No disponible para el adaptador. El modelo base se denomina Qwen3-4B-Instruct-2507 (la denominación indica aproximadamente 4 000 millones de parámetros) |
| Parámetros activos | No aplica: no se describe una arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada en la ficha) |
| Tipos de cuantización | No disponible. El adaptador se publica en safetensors y puede cargarse sobre el modelo base en bf16 o cuantizado; no se documentan recetas concretas |
| Idiomas soportados | No disponible (el campo de idiomas de la ficha de HuggingFace está vacío) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT; rango 16, alpha 32) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (Qwen/Qwen3-4B-Instruct-2507) ni del adaptador más allá de su naturaleza LoRA. Los hiperparámetros de entrenamiento sí están documentados: rango 16, alpha 32, dos épocas, tasa de aprendizaje 1e-4, precisión bf16 y 567 filas de entrenamiento. El tamaño del repositorio es de 0,1 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

El pipeline de datos es el elemento técnico más destacable. Se leyeron 17 técnicas de la librería pública de jailbreaks L1B3RT4S para derivar una gramática de ataque, y a partir de ella se simularon 660 payloads nuevos, de los cuales 567 se usaron como filas de entrenamiento. El corpus real nunca se usó para entrenar, con cero solapamiento respecto a la evaluación. El entrenamiento es autodestilado: el profesor fue el mismo modelo base con una defensa añadida en el prompt, de modo que la mejora proviene de la constitución de defensa y no de un modelo más capaz. Los ataques sintéticos se generaron sin lenguaje soez, insultos ni contenido sexual o violento, mediante un filtro que bloqueaba la escritura del conjunto de datos en caso contrario; según el autor, eliminar ese lenguaje no degradó el resultado (el delta pasó de +0,115 a +0,121).

## Capacidades

- Mantenimiento de rol bajo ataque: conserva el personaje de agente de atención al cliente de aerolínea ante ataques de jailbreak formulados en el turno de usuario, con un 86,7 % de éxito en la retención frente al 74,5 % del modelo base.
- Resistencia a 17 técnicas de ataque: las técnicas se extrajeron de la librería L1B3RT4S y se cubren mediante payloads sintéticos generados a partir de su gramática.
- Ayuda en lugar de rechazo: el autor declara explícitamente que el objetivo era mantenerse en el rol y seguir ayudando, no aumentar la tasa de negativas, para evitar el fallo de sobrerrechazo.
- Respuestas completas: la proporción de respuestas que no terminan baja del 7,3 % en el modelo base al 1,8 % con el adaptador, según la evaluación del autor.
- Dominio aerolínea: el conjunto de datos publicado (airline-resist-jailbreaks) y los prompts de entrenamiento están orientados a soporte de aerolínea.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente de aerolínea con exposición pública: el adaptador se puede fusionar con Qwen3-4B-Instruct-2507 y desplegar como agente de soporte que gestiona consultas de reservas, equipaje o cambios de vuelo resistiendo intentos de manipulación por parte del usuario en el turno de conversación.
- Red teaming comparativo: sirve como brazo de defensa de referencia en pruebas de seguridad, enfrentándolo al modelo base con los mismos payloads fijos y decodificación greedy para medir la ganancia real de la defensa, tal como hizo el autor.
- Investigación en alineación de seguridad: el pipeline completo (derivación de gramática de ataque, simulación de payloads, filtrado de lenguaje soez, destilado del profesor) es reproducible a partir del dataset publicado y resulta útil para estudiar el equilibrio entre resistencia y sobrerrechazo.
- Generación de conjuntos de datos sintéticos de seguridad: el enfoque de simular ataques desde una gramática extraída permite crear corpus de entrenamiento en dominios nuevos sin reutilizar payloads públicos ni incurrir en memorización.
- Evaluación de robustez en CI/CD de modelos: el grader basado en código (divisor de rol, tres o más tokens en leetspeak, marcador de persona de liberación) se puede integrar como prueba automatizada que bloquee despliegues cuando un modelo candidato rompe el rol por encima de un umbral definido.
- Formación de equipos de seguridad: los 165 payloads reales y los 660 sintéticos permiten montar talleres prácticos sobre técnicas de jailbreak y sobre cómo se mide objetivamente una defensa.
- Despliegue sobre el modelo base existente: al ser un adaptador de 0,1 GB, se puede cargar sobre una instancia ya desplegada de Qwen3-4B-Instruct-2507 sin sustituir el modelo ni reentrenar, añadiendo la capa de resistencia como un artefacto separado.

## Benchmarks y rendimiento

Los datos proceden de la ficha del autor. La evaluación se hizo con prompts fijos, decodificación greedy y un único proceso de vLLM sirviendo el modelo base y el adaptador. El conjunto de evaluación son 165 ataques reales no vistos procedentes de la librería L1B3RT4S, sin solapamiento con los datos de entrenamiento. La clasificación se hizo por código, sin juez humano ni modelo juez.

| Métrica | Modelo base | Este adaptador |
|---|---|---|
| Mantuvo el rol | 0,745 | 0,867 |
| Rompió el rol | 42/165 | 22/165 |
| Respuestas que no terminan | 7,3 % | 1,8 % |

Análisis estadístico reportado por el autor: delta +0,121 con intervalo de confianza del 95 % de [+0,067, +0,176]; 22 payloads mejoraron, 2 empeoraron y 141 quedaron sin cambios; prueba de signos unilateral con p = 1,8e-05. Con 165 payloads, la evaluación resuelve diferencias de +0,055 o mayores.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB en safetensors, por lo que el requisito real de memoria lo determina el modelo base Qwen/Qwen3-4B-Instruct-2507.
- VRAM estimada para el modelo base (estimaciones a partir de su tamaño nominal, no publicadas por el autor): en bf16 en torno a 8-9 GB de pesos; en cuantización de 8 bits en torno a 4-5 GB; en cuantización de 4 bits en torno a 2,5-3,5 GB, más el overhead de la caché KV según la longitud de contexto.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en cuantización de 4 u 8 bits, y en tarjetas de 12-16 GB o superiores (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) sin cuantizar o con margen para contextos largos. No hay mediciones publicadas por el autor que confirmen estas cifras.
- GPU de centro de datos: A100, H100 o L40S son suficientes y sobredimensionadas para un modelo de este tamaño; el autor usó vLLM, lo que sugiere despliegue en GPU con servidor de inferencia.
- Opciones de despliegue: vLLM (usado en la evaluación del autor, sirviendo base y adaptador en el mismo proceso), PEFT con transformers para carga directa del adaptador, y fusión del LoRA en los pesos base para exportar a otros runtimes. Para llama.cpp u Ollama sería necesario fusionar el adaptador y convertir el modelo resultante a GGUF; no se documenta una receta oficial.
- Latencia y throughput: no disponible. No se publican mediciones de latencia, tokens por segundo ni coste por petición.

## Comparativa con modelos similares

La información disponible no incluye otros adaptadores comparables de resistencia a jailbreak con evaluación publicada sobre el mismo conjunto, por lo que la comparación se limita al modelo base frente al que se entrena.

| Modelo | Parámetros | Contexto | Rol mantenido en L1B3RT4S | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 000 millones (según denominación) | No disponible | 0,745 | No disponible en la información proporcionada | HuggingFace |
| zeroproof-airline-jailbreak-4b | No disponible (adaptador LoRA de 0,1 GB) | No disponible | 0,867 | apache-2.0 | HuggingFace |
| Otros adaptadores de resistencia a jailbreak equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El 13,3 % de los payloads reales sigue rompiendo el rol del adaptador: la defensa no es completa.
- Cobertura limitada al turno de usuario. La inyección a través de salidas de herramientas (tool-output injection) es una superficie distinta y no se ha probado.
- El grader detecta únicamente los indicios que estos ataques exigen (una cadena divisoria, tres o más tokens en leetspeak o un marcador de persona de liberación). Un ataque que tenga éxito sin emitir ninguno de esos indicios no se contaría como rotura, lo que puede inflar el resultado.
- Sin control de selección aleatoria. Las filas se conservaron cuando el profesor mantenía el rol, lo que constituye un filtro de selección y no un muestreo aleatorio; el propio autor lo señala como limitación metodológica.
- Autodestilado: el profesor fue el mismo modelo base con una defensa en el prompt, no un modelo más capaz. La mejora depende de la constitución de defensa, no de capacidad adicional.
- Evaluación con prompts fijos, decodificación greedy y una sola pasada por payload. No se reporta variabilidad por muestreo ni evaluación con decodificación estocástica.
- Potencia estadística limitada: con 165 payloads la evaluación solo resuelve diferencias de +0,055 o mayores.
- Los payloads reales de retención se reproducen literalmente desde la fuente pública y contienen lenguaje soez, insultos y contenido sexual o violento, pese a que los datos de entrenamiento se filtraron para excluirlos.
- Idioma y contexto: no se documentan los idiomas soportados ni la ventana de contexto efectiva, que quedan supeditados al modelo base.
- Sesgos: no evaluados ni documentados en la información disponible.
- Alucinación: no evaluada; el adaptador está entrenado para mantenerse en el rol, no para mejorar la veracidad factual de las respuestas.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia y los términos del modelo base subyacente antes de un despliegue en producción.
- Adopción mínima: 7 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados por parte de terceros.
- Es un adaptador, no un modelo autónomo: requiere cargar Qwen/Qwen3-4B-Instruct-2507, con el coste de memoria y de mantenimiento que ello implica.
- El dominio está acotado a soporte de aerolínea; su transferencia a otros dominios no está medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zero-proof-ai/zeroproof-airline-jailbreak-4b
- Conjunto de datos, holdout de payloads reales, ambos brazos de evaluación y grader: https://huggingface.co/datasets/zero-proof-ai/airline-resist-jailbreaks
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Librería pública de jailbreaks L1B3RT4S: https://github.com/elder-plinius/L1B3RT4S
- Referencia citada por el autor sobre sobrerrechazo: RLHF Book, capítulo 14 (no se proporciona URL en la información disponible)
- Búsquedas web realizadas: no devolvieron resultados relevantes sobre este modelo. Los resultados obtenidos correspondían a temas sin relación (Zero Motorcycles, la entrada «cero» en Wikipedia, el software contable Xero), por lo que no se incluyen.
