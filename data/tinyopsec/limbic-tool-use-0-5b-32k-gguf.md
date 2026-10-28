# tinyopsec/limbic-tool-use-0.5B-32K-GGUF

## Resumen

limbic-tool-use-0.5B-32K es un ajuste fino (fine-tune) de Qwen2.5-0.5B-Instruct desarrollado por QuotientAI como evaluador especializado de llamadas a funciones en el contexto de herramientas del Model Context Protocol (MCP). No es un modelo pensado para generar respuestas al usuario ni para ejecutar tareas, sino para actuar como juez: recibe una llamada a función propuesta por otro modelo y determina si es correcta, si emplea la herramienta equivocada, si los nombres de los parámetros son incorrectos o si los valores de esos parámetros no son los adecuados.

El repositorio aquí descrito, tinyopsec/limbic-tool-use-0.5B-32K-GGUF, no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones GGUF generadas con llama.cpp a partir del modelo de QuotientAI, lo que permite ejecutarlo en CPU y en hardware de muy baja capacidad mediante llama.cpp, Ollama, LM Studio o koboldcpp. El modelo base tiene 494.032.768 parámetros (aproximadamente 0,5 mil millones) y una ventana de contexto que el nombre comercial cifra en 32K.

Su relevancia práctica es doble: por un lado, cubre una necesidad creciente de verificación barata y determinista de agentes que usan MCP, donde un error en el nombre de un parámetro rompe la ejecución; por otro, su tamaño reducido (del orden de 1 GB en F16 y unas pocas centenas de MB en cuantizaciones de 4 bits) permite desplegarlo como componente de evaluación en local, en entornos air-gapped o como paso previo a la ejecución real de la herramienta. La licencia Apache 2.0 facilita su integración comercial, aunque la documentación publicada sobre el proceso de entrenamiento y sus métricas es muy escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), no MoE |
| Parámetros totales | 494.032.768 (≈0,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens según el nombre del modelo (32.768); no se detalla en la model card del repositorio GGUF |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (la model card no lo especifica; el modelo base Qwen2.5 es multilingüe, pero el fine-tune es de propósito evaluador y en inglés técnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio solo distribuye GGUF); los pesos originales del modelo base están en el repositorio de QuotientAI |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso, con atención causal estándar y sin mezcla de expertos, por lo que no hay parámetros activos que reportar. Sobre esa base, QuotientAI aplicó un ajuste fino supervisado para convertir el modelo en un clasificador/evaluador de llamadas a funciones en el ecosistema MCP, con cuatro categorías de veredicto según la documentación pública: llamada correcta, herramienta equivocada, nombres de parámetros incorrectos y valores de parámetros incorrectos.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni hiperparámetros del ajuste. Tampoco se documenta ninguna innovación técnica específica más allá del propio objetivo del fine-tune. Las cuantizaciones GGUF del repositorio fueron producidas con llama.cpp por un tercero (tinyopsec), no por el autor original, y la model card se limita a listar los ficheros, el comando de ejemplo con `llama-cli` y un aviso explícito de que se trata de un evaluador de llamadas MCP que debe probarse antes de usarse en producción.

## Capacidades

- Evaluación de llamadas a funciones: emite un juicio sobre la corrección de una llamada generada por otro modelo frente a un esquema de herramienta MCP.
- Clasificación de errores de tool calling: distingue entre herramienta equivocada, nombre de parámetro incorrecto y valor de parámetro incorrecto.
- Comprensión de esquemas de herramientas en formato JSON/MCP y de la estructura de argumentos asociada.
- Ejecución local en CPU gracias a los ficheros GGUF (F16, K-quants y legados), sin necesidad de GPU.
- Integración como endpoint compatible con OpenAI en runtimes que lo soporten (el repositorio incluye la etiqueta `endpoints_compatible`).
- Generación de texto conversacional heredada del modelo base, aunque es una capacidad secundaria y no el propósito del ajuste.
- Capacidades multilingües: no documentadas para el fine-tune; el modelo base Qwen2.5 tiene cobertura multilingüe, pero el ajuste se orienta a esquemas técnicos habitualmente en inglés.
- No se documenta soporte de visión, audio, modo thinking explícito ni razonamiento multi-paso autónomo.

## Casos de uso

- Evaluación automática de agentes MCP en CI: introducir el modelo como juez en la batería de pruebas de un agente, de modo que cada llamada generada se valide contra el esquema de la herramienta antes de ejecutarse, y el pipeline falle cuando aparezca una herramienta o un parámetro incorrecto.
- Guardarraíl de bajo coste en producción: colocar el modelo como paso previo a la ejecución real de la herramienta, de forma que las llamadas marcadas como incorrectas se rechacen o se redirijan a un reintento con un modelo mayor. Su tamaño de 0,5B permite mantenerlo siempre cargado con un consumo de memoria mínimo.
- Observabilidad y análisis de trazas: clasificar por lotes los registros de tool calls de un sistema en producción para construir métricas de tasa de error por herramienta, tipo de fallo y versión del esquema, sin enviar datos a una API externa.
- Generación de datos de entrenamiento: etiquetar pares (esquema, llamada) como positivos o negativos con la categoría de error concreta, para luego entrenar evaluadores o modelos de enrutado de mayor tamaño.
- Regresión de esquemas de herramientas: al versionar un esquema MCP (renombrar un parámetro, cambiar un tipo), usar el evaluador para detectar qué llamadas antiguas dejan de ser válidas antes de desplegar el cambio.
- Prototipado y formación en local: servir el modelo con Ollama o LM Studio en un portátil sin GPU para experimentar con evaluación de function calling y entender los modos de fallo típicos de los agentes MCP.
- Despliegue en entornos air-gapped o de borde: al ser un GGUF de unos pocos cientos de MB en 4 bits, puede ejecutarse en dispositivos con recursos muy limitados donde no es viable un modelo evaluador de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF y las descripciones del modelo original no incluyen métricas de precisión de clasificación, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros evaluadores. Tampoco se han publicado medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el fichero F16 ocupa 1,0 GB según la model card; las cuantizaciones de 8 bits quedan en torno a 0,5 GB y las de 4 bits (Q4_K_M) en el entorno de 0,3 GB (estimación aritmética a partir de los 494M de parámetros, no publicada por el autor). A ello hay que sumar la caché KV del contexto utilizado, que en un modelo de 0,5B es pequeña incluso a 32K.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU y en CPU sola. No requiere A100 ni H100 para inferencia; estas solo tendrían sentido para evaluación masiva por lotes.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para este formato; para servir los pesos originales en safetensors habría que acudir al repositorio de QuotientAI.
- Latencia y throughput: no se han publicado cifras. En la práctica, un modelo denso de 0,5B en Q4_K_M sobre CPU moderna produce decodificación interactiva para respuestas cortas de clasificación, pero se trata de una apreciación cualitativa, no de una medición del autor.
- Almacenamiento: el repositorio completo ocupa 5,8 GB porque incluye todas las cuantizaciones; basta descargar el fichero concreto que se vaya a usar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Formato |
|---|---|---|---|---|---|
| tinyopsec/limbic-tool-use-0.5B-32K-GGUF (este) | 494M | 32K (según nombre) | Evaluador de tool calls MCP, cuantizado por tercero | Apache 2.0 | GGUF |
| quotientai/limbic-tool-use-0.5B-32K | 494M | 32K | Evaluador de tool calls MCP, pesos originales | Apache 2.0 | Safetensors |
| DevQuasar/quotientai.limbic-tool-use-0.5B-32K-GGUF | 494M | 32K | Misma función, cuantizaciones alternativas de otro tercero | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Modelo generalista de instrucciones, base del ajuste | Apache 2.0 | Safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes; la diferencia entre ellas es de formato, de autor de la cuantización y de propósito (generalista frente a evaluador especializado).

## Limitaciones y advertencias

- Es un evaluador, no un asistente: la documentación del modelo original indica explícitamente que no está diseñado para generar respuestas, por lo que usarlo como chatbot produce resultados pobres.
- Con 0,5B de parámetros, la capacidad de razonamiento es limitada; es previsible una precisión notablemente inferior a la de un evaluador de 7B o superior en esquemas de herramientas complejos o con muchos parámetros.
- Riesgo de alucinación en el veredicto: puede declarar correcta una llamada sutilmente errónea, especialmente si el esquema tiene parámetros opcionales, tipos anidados o valores con formato libre.
- No hay métricas publicadas de precisión, sensibilidad ni tasas de falsos positivos, de modo que cualquier umbral de aceptación en producción debe calibrarse con un conjunto de validación propio.
- Sesgos: no documentados. Al derivar de Qwen2.5-0.5B-Instruct y de un dataset de ajuste no descrito, hereda los sesgos del modelo base y los del corpus de entrenamiento del fine-tune.
- Idiomas: no se especifica cobertura; el ajuste está orientado a esquemas técnicos, mayoritariamente en inglés. El rendimiento en castellano no está verificado.
- La cuantización la firma un tercero (tinyopsec) y no el autor original; conviene validar la fidelidad de la cuantización frente a los pesos safetensors antes de confiar en ella para evaluación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se distribuye sin garantías; el aviso del autor ("Evaluate before use") traslada al integrador la responsabilidad de validar el comportamiento.
- Señales de madurez bajas: 0 descargas y 1 like en el repositorio, sin issues ni discusión pública, lo que reduce la validación comunitaria disponible.
- El modelo original y sus derivados no publican detalles de entrenamiento, lo que dificulta la auditoría del ajuste.

## Enlaces

- Repositorio GGUF objeto de esta ficha: https://huggingface.co/tinyopsec/limbic-tool-use-0.5B-32K-GGUF
- Modelo original de QuotientAI: https://huggingface.co/quotientai/limbic-tool-use-0.5B-32K
- Cuantizaciones GGUF alternativas de DevQuasar: https://huggingface.co/DevQuasar/quotientai.limbic-tool-use-0.5B-32K-GGUF
- Ficha y despliegue en Featherless AI: https://featherless.ai/models/quotientai/limbic-tool-use-0.5B-32K
- Ficha en MeshKore: https://meshkore.com/agent/quotientai-limbic-tool-use-05b-32k
- Ficha en LLM Explorer: https://llm-explorer.com/model/quotientai%2Flimbic-tool-use-0.5B-32K,3lQgqmWLqTgn0kDwaa4lBA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
