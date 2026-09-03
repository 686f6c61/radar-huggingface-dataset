# textilelabs/Loom-Atom

## Resumen

Loom Atom es un modelo de lenguaje minúsculo desarrollado por Textile Labs, con solo 22.392 parámetros (57 KB), diseñado para responder una única pregunta binaria: ¿una solicitud de usuario necesita una herramienta (tool) o no? Emite exactamente un token, `<tool>` o `<none>`, y está pensado como el filtro más barato posible en un stack de agentes, colocándose delante de modelos más grandes para ahorrar llamadas a retrieval, routers o LLMs de gran tamaño.

El modelo es un transformer causal real, entrenado desde cero en cinco minutos en una CPU de escritorio de 2013, sin fine-tuning de ninguna base preentrenada. Su arquitectura consta de 2 capas, 24 dimensiones ocultas y embeddings atados. A pesar de su tamaño, alcanza un 96,0% de precisión en utterances humanas no vistas y un 96,6% en el dataset SNIPS, que no participó en el entrenamiento, superando ampliamente a una línea base de palabras clave (64,9% y 59,0% respectivamente). Su relevancia actual radica en la tendencia hacia modelos de agente cada vez más eficientes, donde decisiones de enrutamiento de un solo bit pueden ejecutarse en microsegundos y con coste casi nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (2 capas, 24 dimensiones ocultas, embeddings atados) |
| Parametros totales | 22.392 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF f16 (proporcionado en el repo) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Loom Atom es un transformer causal estándar, sin mecanismos de atención lineal ni arquitecturas híbridas. Consta de 2 capas transformer con 24 dimensiones ocultas y embeddings atados (tied embeddings), lo que reduce el número de parámetros. No es un clasificador de intención tradicional, sino un modelo generativo que produce un único token de salida entre dos opciones posibles (`<tool>` y `<none>`). El prompt de entrada sigue un formato exacto: `<user>\n{message}\n<|eot|>\n<loom>\n`.

El entrenamiento se realizó desde cero, con pesos inicializados aleatoriamente, sobre un conjunto de 15.502 utterances reales de dos corpus de dominio público: MASSIVE (Amazon, CC BY 4.0, derivado de SLURP) y CLINC150 (`clinc/oos-eval`, CC BY 3.0). El dataset se balanceó al 50/50 mediante downsampling de la clase mayoritaria, y se añadió una pequeña porción generada proceduralmente por Textile Labs para cubrir casos de "no tool needed" que los corpus públicos no incluyen, como chit-chat, ambigüedad o preguntas que solo el usuario puede responder. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación posterior. El entrenamiento duró aproximadamente cinco minutos en una CPU de 2013, completando 10.809 pasos de optimización para la configuración final.

## Capacidades

- Clasificación binaria de necesidad de herramienta: decide si una solicitud de usuario requiere invocar una herramienta externa o no.
- Emisión de un único token determinista: con `temperature: 0` y `num_predict: 1`, la salida es siempre `<tool>` o `<none>`.
- Integración como prefiltro en stacks de agentes: puede colocarse delante de routers, retrievers o LLMs grandes para evitar llamadas innecesarias.
- Ejecución en tiempo real: inferencia en menos de 1 milisegundo en CPU, lo que permite decisiones de enrutamiento de latencia despreciable.
- Compatibilidad con Ollama y llama.cpp mediante el archivo GGUF f16 proporcionado.
- Soporte para transformers (PyTorch) con un snippet de código simple para decidir entre los dos tokens legales.
- No es un modelo de chat, no genera texto libre, no realiza razonamiento multi-step ni soporta tool calling directo; solo responde la pregunta binaria.

## Casos de uso

- Filtro previo en asistentes conversacionales: antes de enviar cada mensaje de usuario a un LLM grande, se consulta a Loom Atom. Si devuelve `<none>`, se responde directamente con el modelo pequeño o se omite la llamada a herramientas, ahorrando coste y latencia.
- Optimización de pipelines de retrieval aumentado (RAG): en un sistema donde cada consulta dispara una búsqueda vectorial, Loom Atom puede descartar consultas que no requieren recuperación de información, reduciendo la carga sobre el índice y el modelo generador.
- Enrutamiento de solicitudes en atención al cliente: un chatbot de soporte puede usar Loom Atom para distinguir entre peticiones operativas (consultar saldo, cambiar contraseña, estado de pedido) y conversación informal, derivando solo las primeras a los sistemas de back-end.
- Automatización de tareas personales: en un asistente de productividad, decide si un mensaje como "recuérdame llamar a mamá a las 6" requiere crear un evento o una alerta, mientras que "he tenido un mal día" no necesita ninguna acción.
- Despliegue en dispositivos embebidos o edge: con solo 57 KB, el modelo puede incrustarse como un array de bytes en un header de C o ejecutarse en microcontroladores, permitiendo decisiones de enrutamiento locales sin conexión a la nube.
- Reducción de latencia en asistentes de voz: al ser un modelo de un solo token con inferencia sub-milisegundo, puede ejecutarse en el dispositivo antes de decidir si se necesita un LLM remoto, mejorando la experiencia de usuario en entornos con conectividad limitada.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión en dos conjuntos de evaluación, ambos balanceados (chance = 50%):

| Conjunto de evaluacion | Loom Atom | Linea base de palabras clave |
|---|---|---|
| Utterances humanas no vistas (1.860) | 96,0% | 64,9% |
| SNIPS (700, nunca visto en entrenamiento) | 96,6% | 59,0% |

Además, se reporta una escalera de modelos entrenados con los mismos datos y tiempo (4 minutos por escalón), mostrando la influencia de la profundidad y el ancho:

| Parametros | Dim | Capas | Held-out | SNIPS |
|---:|---:|---:|---:|---:|
| 86.640 | 48 | 3 | 93,0% | 95,9% |
| 26.976 | 32 | 2 | 95,6% | 93,6% |
| **22.392** | **24** | **2** | **96,0%** | **96,6%** |
| 9.392 | 16 | 2 | 93,4% | 94,1% |
| 6.800 | 16 | 1 | 83,0% | 84,4% |
| 4.812 | 12 | 1 | 82,2% | 81,9% |

El autor señala que la profundidad (número de capas) es más determinante que el ancho: pasar de 2 capas a 1 cuesta unos 10 puntos, mientras que reducir la dimensión de 24 a 16 cuesta unos 3. También advierte que el modelo de 86.640 parámetros está subentrenado (3.006 pasos frente a 10.809 del de 22.392), por lo que la tabla no debe leerse como "menos parámetros es mejor".

## Requisitos de hardware

- VRAM estimada: prácticamente nula. El modelo ocupa 57 KB en f16, por lo que cabe en cualquier GPU, incluso en las más modestas, y también en memoria de CPU.
- GPU recomendada: ninguna específica; se ejecuta en CPU sin problema. En una GPU, el uso de VRAM es despreciable.
- Compatibilidad con consumer GPU: sí, cualquier GPU con soporte para PyTorch o llama.cpp puede ejecutarlo.
- Opciones de despliegue: Ollama (`ollama run hf.co/textilelabs/Loom-Atom`), llama.cpp (mediante el GGUF), transformers (PyTorch), o incrustación directa como array de bytes en aplicaciones nativas.
- Latencia y throughput: inferencia en menos de 1 milisegundo en CPU (según la model card). El throughput es irrelevante dado el tamaño; puede procesar miles de solicitudes por segundo en un solo núcleo.

## Comparativa con modelos similares

No se dispone de comparativas con modelos externos de la misma categoría (clasificadores binarios de necesidad de herramienta). La model card compara Loom Atom con otros modelos de la misma familia de Textile Labs, aunque con propósitos distintos:

| Modelo | Parametros | Funcion principal | Licencia |
|---|---|---|---|
| Loom Weave 2 | 59.650.000 | Modelo de lenguaje general | MIT |
| Loom Spark 2 | 19.867.008 | Modelo de lenguaje ligero | MIT |
| Loom Router 1 | 1.435.040 | Enrutamiento en un token entre 17 rutas | MIT |
| **Loom Atom** | **22.392** | Decision binaria de necesidad de herramienta | MIT |

Loom Atom es 2.664 veces más pequeño que Loom Weave 2 y 64 veces más pequeño que Loom Router 1, lo que lo sitúa en una categoría de ultra-miniatura sin equivalente directo en el ecosistema open source conocido.

## Limitaciones y advertencias

- Sesgo conocido: las preguntas sobre el usuario en primera persona (p. ej., "¿cuál es el nombre de mi hermana?", "¿qué desayuné?") son el caso difícil. No requieren herramienta (ninguna herramienta puede responderlas), pero parecen búsquedas de información. El modelo acierta algunas y falla otras; se recomienda tratar la salida `<tool>` en preguntas en primera persona como poco fiable.
- Riesgo de alucinación: no aplica, ya que el modelo solo emite uno de dos tokens fijos y no genera texto libre.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero dado el tamaño del modelo y su tokenizer de 512 tokens, es probable que sea muy corta. No apto para entradas largas.
- Idioma: solo inglés. No soporta otros idiomas.
- Restricciones de licencia: el modelo es MIT, pero los datos de entrenamiento provienen de MASSIVE (CC BY 4.0) y CLINC150 (CC BY 3.0), que requieren atribución. La model card exige mantener esa atribución en cualquier redistribución.
- Advertencia para producción: no es un modelo de chat ni un clasificador de intención general. Solo responde la pregunta binaria de necesidad de herramienta. Usarlo para otros fines dará resultados incorrectos. Además, al ser tan pequeño, su rendimiento depende del formato de prompt exacto; cualquier desviación puede degradar la precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/textilelabs/Loom-Atom
- Loom Router 1 (mencionado en la model card): https://huggingface.co/textilelabs/Loom-Router-1
- No se encontraron otros enlaces relevantes en la búsqueda web (papers, blogs o repositorios adicionales).
