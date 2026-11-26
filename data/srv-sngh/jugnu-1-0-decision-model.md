# srv-sngh/jugnu-1.0-decision-model

## Resumen

Jugnu 1.0 es un modelo de decisión de tipo encoder, construido por Sourav Singh (Sourav AI Labs) sobre el encoder `Alibaba-NLP/gte-modernbert-base` de Alibaba. No es un modelo generativo: recibe un texto, una pregunta y una lista de opciones (o una pregunta de sí/no) y devuelve una etiqueta acompañada de una puntuación de confianza. Su función es la de un clasificador rápido y ligero pensado para enrutamiento de intenciones, moderación y comprobaciones de seguridad en aplicaciones que ya usan modelos de lenguaje generativos.

La propuesta de valor es la latencia y el tamaño: 149 millones de parámetros, unos 288 MB de descarga y aproximadamente 2,1 GB de memoria en servicio. El autor lo posiciona como un "System 1" que una aplicación puede invocar muchas veces por segundo para decidir qué agente, herramienta o rama de un pipeline debe atender una petición, antes de invocar un modelo grande.

Es relevante en el contexto de las arquitecturas de agentes y de los sistemas RAG, donde el enrutamiento y la detección de inyección de prompt son cuellos de botella operativos. El modelo es solo en inglés, con licencia Apache 2.0, y se distribuye con un pequeño runtime Python propio (`jugnu_runtime`) además de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT) con capa de decisión propia sobre `Alibaba-NLP/gte-modernbert-base` |
| Parametros totales | 149 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Texto de entrada hasta 2.048 tokens; cada opción hasta 32 tokens |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; el runtime sirve pesos en precisión nativa) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos descargables vía `huggingface_hub` junto con el runtime Python `jugnu_runtime`; formato de fichero no especificado |
| Tarea (pipeline) | `zero-shot-classification` |
| Tamaño del repositorio | 0,3 GB |
| Memoria en servicio | Aproximadamente 2,1 GB |
| Aceleración | Apple silicon (MPS), CUDA y CPU |

## Arquitectura y entrenamiento

Jugnu reutiliza como "cerebro lector" el encoder `gte-modernbert-base` de Alibaba (Apache 2.0) y añade encima una capa de decisión, un formato de entrada propio y un entrenamiento propio. El autor declara explícitamente que el encoder es obra de terceros y que todo lo que convierte la representación en una decisión (la capa, el formato y el entrenamiento) es trabajo suyo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se detalla si la capa de decisión es una cabeza de clasificación lineal, un mecanismo de comparación texto-opción o alguna otra formulación.

El modelo no genera texto: produce directamente una etiqueta (una de las opciones, o "ninguna") o una respuesta sí/no, en ambos casos con una puntuación. Soporta un número elevado de opciones en una sola llamada (probado con hasta 77) y permite fijar un umbral de "sí" ajustado sobre ejemplos etiquetados propios, aunque el autor no reclama ninguna puntuación para umbrales ajustados.

## Capacidades

- Clasificación de texto en opciones arbitrarias escritas en lenguaje natural (`choose` / `choose_many`), con hasta 77 opciones por llamada.
- Respuesta "ninguna de las opciones" cuando ninguna encaja, configurable con `allow_none=False` para conjuntos cerrados.
- Preguntas de sí/no sobre un texto (`yes_no`), con puntuación de probabilidad asociada.
- Enrutamiento de intenciones y de mensajes hacia agentes, equipos o herramientas.
- Detección de inyección de prompt (el texto intenta anular las instrucciones de un asistente).
- Comprobaciones de jailbreak y de toxicidad (con rendimiento desigual, ver benchmarks).
- Evaluación de relevancia para RAG: pasar el pasaje como texto y formular una pregunta de sí/no sobre si responde a la consulta.
- Clasificación de temas y de intenciones bancarias.
- Ejecución en local y en dispositivo (on-device) con latencia de decenas de milisegundos.
- No soporta generación de texto, tool calling generativo, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Enrutamiento de mensajes de soporte: el modelo recibe el texto del cliente y una lista de equipos (Facturación, Envío, Cuenta) y devuelve el equipo adecuado con confianza. Es adecuado porque resuelve la clasificación en una sola pasada de encoder y con latencia de decenas de milisegundos, lo que permite clasificar cada mensaje entrante sin encolar trabajo a un modelo generativo.
- Detección de inyección de prompt en una pasarela de LLM: antes de reenviar la entrada del usuario al modelo grande, se ejecuta `yes_no` con la pregunta de si el texto intenta anular las instrucciones del asistente. El autor reporta 76,3 en su prueba de inyección de prompt, por encima de Laya 0.4.11 (67,5) y de SemIf (64,9), lo que lo hace útil como primera barrera de bajo coste.
- Moderación de contenido en preprocesado: comprobaciones de toxicidad y de jailbreak en tiempo real sobre cada mensaje, combinadas con un clasificador más potente para los casos límite. El modelo obtiene 67,7 en toxicidad y 89,9 en jailbreak en las pruebas del autor.
- Enrutamiento de intenciones en banca y finanzas: el autor lo usa en su propia aplicación de finanzas personales y trading para dirigir cada mensaje al agente correcto; en Banking77 con las 77 intenciones en una sola llamada reporta 89,4, y 91,0 en MASSIVE con 20 opciones.
- Filtrado de relevancia en RAG: dado un pasaje recuperado y la pregunta del usuario, `yes_no` decide si el pasaje responde a la pregunta antes de gastar tokens de un modelo generativo en la síntesis. La ventana de 2.048 tokens cubre pasajes de tamaño habitual en recuperación.
- Clasificación de temas en pipelines de datos: etiquetar grandes volúmenes de documentos o tickets con un conjunto de categorías definido en lenguaje natural, sin necesidad de reentrenar, gracias a la interfaz de zero-shot classification.
- Asistente de voz o chat local en Mac: con Krill sirviendo el modelo junto a modelos de chat y de voz, el autor reporta respuestas típicas de 37 ms mientras un modelo de chat está escribiendo, lo que permite tomar decisiones de enrutamiento sin bloquear la conversación.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las cifras de latencia se midieron en un Mac mini con opciones repetidas; Laya 0.4.11 se muestra con sus ajustes por defecto anteriores y SemIf es Qwen3.5-4B en su modo `direct`.

| Metrica | Jugnu | Laya 0.4.11 | SemIf |
|---|---|---|---|
| Parametros | 149 M | 421 M | 4 B |
| Descarga | ~288 MB | 1,4 GB por checkpoint | No disponible |
| Latencia, texto de 100 tokens, 4 opciones repetidas | 22,6 ms | 46 ms | No disponible |
| Latencia, texto de 500 tokens, 10 opciones repetidas | 61,0 ms | 117 ms | No disponible |
| Banking77, 77 intenciones en una llamada | 89,4 | 57,1 | No admite más de 16 opciones |
| MASSIVE intent, 20 opciones | 91,0 | 76,6 | No admite más de 16 opciones |
| Detección de inyección de prompt | 76,3 | 67,5 | 64,9 |
| Detección de toxicidad | 67,7 | 56,1 | 80,2 |
| Detección de jailbreak | 89,9 | 70,7 | 88,8 |

El autor indica además que, frente a SemIf en ocho tareas cotidianas, Jugnu gana en inyección de prompt y clasificación de temas, empata en cuatro y pierde en toxicidad y verificación de hechos; y que en los benchmarks de Laya gana tres, empata cinco y pierde dos de las diez filas que SemIf puede responder. No se especifica la métrica exacta (precisión, F1 u otra) de las cifras de clasificación, ni el conjunto de test público empleado más allá de los nombres de los benchmarks.

## Requisitos de hardware

- Memoria en servicio: aproximadamente 2,1 GB según el autor.
- Descarga: unos 288 MB (repositorio de 0,3 GB).
- GPU: funciona en Apple silicon vía MPS, en CUDA y en CPU. No se especifican modelos de GPU concretos ni VRAM mínima; por tamaño, cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM.
- Cabe en GPU consumer: sí, incluidas tarjetas de gama baja y portátiles, y también en CPU.
- Despliegue: runtime propio `jugnu_runtime` (instalado desde la carpeta descargada), servidor Krill con endpoint HTTP `POST /v1/decide`, y descarga de pesos vía `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 22,6 ms con texto de 100 tokens y 4 opciones repetidas; 61,0 ms con 500 tokens y 10 opciones, en Mac mini. En un Mac mini con dos modelos de chat y un modelo de voz cargados, unas 37 ms típicas mientras un modelo de chat genera.
- Paralelismo: con Krill y modelos de chat cargados, el autor recomienda `KRILL_NUM_PARALLEL=4` para que las decisiones no esperen a que termine una respuesta en curso.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enrutamiento / clasificación | Inyección de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jugnu 1.0 | 149 M | 2.048 tokens de texto, 32 por opción | Banking77 89,4; MASSIVE 91,0 | 76,3 | Apache 2.0 | Hugging Face, runtime propio, Krill |
| Laya 0.4.11 | 421 M | No disponible | Banking77 57,1; MASSIVE 76,6 | 67,5 | No disponible en la información | Descarga pública según el autor |
| SemIf (Qwen3.5-4B, modo `direct`) | 4 B | No disponible | No admite más de 16 opciones | 64,9 | No disponible en la información | No disponible |

Jugnu es el más pequeño de los tres y el único con licencia Apache 2.0 confirmada en la información disponible. Frente a SemIf, que es un modelo generativo de 4 B, Jugnu pierde en toxicidad (67,7 frente a 80,2) y gana en inyección de prompt y en capacidad de manejar muchas opciones por llamada. La comparación con Laya se basa en los ajustes por defecto anteriores de este último, según advierte el propio autor.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado, por lo que su uso en castellano u otros idiomas no está validado.
- Sensibilidad a la formulación: el autor advierte explícitamente de que Jugnu es sensible a cómo se redacta la pregunta; pequeñas variaciones pueden cambiar la decisión.
- No genera texto: no sirve para tareas generativas, razonamiento multi-paso ni tool calling generativo.
- Sesgos: no se documentan análisis de sesgo demográfico, cultural o de dominio; al derivar de un encoder entrenado por terceros, puede heredar los sesgos de `gte-modernbert-base`.
- Alucinación: al ser un clasificador, el riesgo no es inventar texto, sino asignar con alta confianza una opción incorrecta o un "sí" erróneo, especialmente con preguntas mal formuladas o textos fuera de distribución.
- Rendimiento desigual en moderación: la detección de toxicidad (67,7) es claramente inferior a la de SemIf (80,2); no conviene usarlo como único filtro de toxicidad en producción.
- Umbrales de sí/no: el autor no reclama ninguna puntuación para umbrales ajustados sobre datos propios; el umbral por defecto puede no ser adecuado para un dominio concreto.
- Límites de entrada: 2.048 tokens de texto y 32 tokens por opción; textos más largos requieren truncado o troceado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `gte-modernbert-base` tiene su propia licencia Apache 2.0, que conviene verificar junto con la del runtime `jugnu_runtime`.
- Madurez: el modelo tiene 39 descargas y 0 likes en el momento de la consulta, con una única fuente de evaluación (el propio autor); los benchmarks no han sido replicados de forma independiente y no se especifica la métrica exacta empleada.
- Ecosistema: no hay soporte documentado para servidores de inferencia estándar (vLLM, TGI, llama.cpp, Ollama), lo que limita su integración en infraestructuras existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srv-sngh/jugnu-1.0-decision-model
- Página del modelo y resultados: https://souravailabs.ai/lab/jugnu
- Vídeo de lanzamiento: https://www.youtube.com/watch?v=RdK552dpkFo
- Krill (servidor local para Mac): https://github.com/srvsngh99/Krill
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Sourav AI Labs: https://souravailabs.ai
