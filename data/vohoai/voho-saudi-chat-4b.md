# VohoAI/voho-saudi-chat-4b

## Resumen

Voho Saudi Chat 4B es un modelo de lenguaje conversacional de 4.022 millones de parámetros, desarrollado por Voho (voho.ai) y publicado en HuggingFace con licencia Apache 2.0. Se trata de un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-4B-Instruct-2507, orientado a un problema muy concreto: que un asistente de voz responda en árabe saudí hablado (dialecto najdi) y no en árabe estándar moderno (MSA) ni en otros dialectos. El autor documenta que el modelo base solo responde en árabe del Golfo el 62,3 % de las veces y con una media de 30,2 palabras por turno, tres veces más de lo que dura una intervención natural en una llamada telefónica.

El modelo está diseñado para ocupar la posición intermedia en una arquitectura de agente de voz, entre el reconocimiento automático de habla (ASR) y la síntesis de voz (TTS). Para ello se entrenó con 14.535 diálogos en total, procedentes de llamadas de servicio reales de Voho en ocho verticales empresariales (petróleo y gas, utilities, telecomunicaciones, banca, administración pública, sanidad, logística e instalaciones) y de conversaciones cotidianas, complementados con porciones filtradas de los datasets Arabic_Aya y CIDAR. Cada diálogo debía superar dos filtros independientes: un léxico najdi y el clasificador de dialecto MARBERTv2.

Su relevancia actual es doble. Por un lado, cubre un nicho poco atendido: los dialectos árabes hablados, donde los modelos multilingües generales tienden a derivar hacia MSA. Por otro, publica junto al modelo los datos de diálogo (VohoAI/voho-saudi-dialogues) y el código de entrenamiento bajo Apache 2.0, lo que permite reproducir y adaptar el proceso. En el momento de la consulta el repositorio acumulaba 0 descargas y 1 like, y se había publicado el 19 de septiembre de 2026, por lo que se trata de un modelo muy reciente y con adopción todavía sin consolidar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajuste fino con LoRA r=32 sobre todas las proyecciones de atención y MLP |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card del autor; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos |
| Tipos de cuantizacion | GGUF Q4_K_M publicado en repo aparte (voho-saudi-chat-4b-GGUF); el repo principal contiene safetensors sin cuantizar |
| Idiomas soportados | Árabe (ar), con foco en árabe saudí (najdi). El autor indica que las variantes hijazí y khaleeji derivan hacia najdi o MSA |
| Licencia | Apache 2.0 (incluye uso comercial; el modelo base y todos los datasets del mix son Apache 2.0) |
| Formato de pesos | safetensors en el repo principal (8,1 GB, consistente con pesos en bf16); GGUF Q4_K_M en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.022 millones de parámetros con licencia Apache 2.0. Sobre él se aplicó un ajuste fino con LoRA de rango 32 sobre todas las proyecciones de atención y de MLP, durante 2 épocas, en una única GPU NVIDIA L4. No se realizó entrenamiento completo de los pesos ni se documenta ninguna fase de RLHF o DPO: la adaptación es exclusivamente supervisada sobre diálogos. La pérdida se calculó únicamente sobre los turnos del asistente, de modo que cada diálogo multiturno aporta señal de entrenamiento para todas sus respuestas y no solo para la última.

El conjunto de datos suma 14.535 diálogos: 7.601 llamadas de servicio de Voho repartidas en ocho verticales empresariales, 5.551 conversaciones cotidianas (familia, amigos, comida, conducción, trabajo, hogar, salud, celebraciones y viajes), 202 filas etiquetadas como del Golfo o najdi procedentes de 2A2I/Arabic_Aya y 1.181 pares de instrucciones árabes de arbml/CIDAR. El filtrado es la innovación metodológica más destacable: cada diálogo debía superar un filtro léxico najdi (presencia de palabras funcionales saudíes y ausencia de sus equivalentes en MSA) y la clasificación de MARBERTv2, un modelo que no participó en el entrenamiento y que se utiliza después como evaluador independiente. Se descartó cualquier diálogo con markdown, tablas o respuestas más largas que un turno hablado, lo que explica la brevedad característica de las salidas (6,4 palabras de media). El código de entrenamiento está publicado en el repositorio de Voho (ruta ml/saudi-chat).

## Capacidades

- Generación de texto conversacional en árabe saudí (najdi) con respuestas cortas, del orden de 6,4 palabras por turno, adecuadas para telefonía.
- Conversación multiturno: el entrenamiento con pérdida en todos los turnos del asistente refuerza la coherencia a lo largo del diálogo.
- Registro coloquial: reproduce fórmulas de cortesía y expresiones propias del habla saudí (por ejemplo, "هلا بك، أبشر").
- Atención al cliente en verticales concretas: petróleo y gas, utilities, telecomunicaciones, banca, administración, sanidad, logística e instalaciones.
- Conversación cotidiana sobre familia, comida, conducción, trabajo, hogar, salud, celebraciones y viajes.
- Integración en pipelines de voz como capa intermedia entre ASR y TTS.
- Uso comercial permitido por licencia Apache 2.0, sin restricciones de atribución más allá de las habituales.
- Soporte de tool calling: no documentado.
- Modo de razonamiento o "thinking": no documentado.
- Capacidades de visión, audio o matemáticas: no documentadas.
- Capacidades multilingües: fuera del árabe, no documentadas; el modelo se distribuye con etiqueta de idioma únicamente "ar".

## Casos de uso

- Agentes de voz para el mercado saudí: el modelo se sitúa entre el ASR y el TTS y devuelve turnos de longitud telefónica (6,4 palabras de media frente a las 30,2 del modelo base), lo que reduce la latencia percibida y hace viable una conversación por teléfono con respuesta en dialecto najdi.
- Atención al cliente en banca y telecomunicaciones: al haberse entrenado con 7.601 llamadas de servicio reales de estos verticales, puede gestionar consultas de trámites, incidencias y facturación en el registro coloquial que usa el cliente saudí, evitando la formalidad del MSA.
- Despliegue en administración pública y sanidad: la licencia Apache 2.0 y el tamaño de 4B permiten ejecución en infraestructura propia on-premise, requisito habitual cuando los datos de ciudadanos no pueden salir del país o de la organización.
- Generación de datos sintéticos para ASR y TTS: el modelo puede producir miles de turnos de diálogo najdi para aumentar corpus de entrenamiento de reconocimiento y síntesis de voz, y está publicado junto al dataset VohoAI/voho-saudi-dialogues con el mismo fin.
- Normalización de dialecto en chats escritos: para empresas que reciben mensajes de clientes en WhatsApp o aplicaciones de mensajería y quieren responder en el mismo registro coloquial en lugar de en árabe estándar, mejorando la tasa de respuesta del usuario.
- Prototipado rápido de asistentes locales: gracias a la versión GGUF Q4_K_M, se puede desplegar con Ollama en una estación de trabajo o en un equipo con GPU de gama media para validar flujos conversacionales antes de pasar a producción.
- Base para adaptación a otras variantes del Golfo: la licencia permisiva y el código de entrenamiento publicado permiten repetir el proceso de LoRA sobre datos propios para khaleeji, hijazí u otros dialectos, partiendo de un modelo que ya tiene el registro coloquial interiorizado.
- Filtrado y anotación de diálogos dialectales: el propio modelo puede usarse como generador de candidatos que después se filtran con MARBERTv2, replicando el pipeline descrito en la model card.
- Investigación en evaluación de dialectos: sirve como caso de estudio de un ajuste fino medido exclusivamente con un clasificador externo y con chrF++, ilustrando qué mide cada métrica en tareas de registro y no de contenido.

## Benchmarks y rendimiento

El autor publica únicamente evaluaciones de dialecto y de similitud de cadena, no benchmarks de conocimiento o razonamiento (MMLU, GSM8K, HumanEval y similares no están disponibles en la información proporcionada).

Evaluación de dialecto sobre 400 preguntas reservadas, clasificadas con MARBERTv2 (modelo independiente, no usado en entrenamiento):

| Clasificado como | Referencia reservada | Qwen3-4B-Instruct-2507 | Voho Saudi Chat 4B |
|---|---|---|---|
| Árabe del Golfo (saudí) | 94,5 % | 62,3 % | 89,8 % |
| Árabe estándar moderno | 0,2 % | 1,5 % | 0,8 % |
| Egipcio | 0,2 % | 8,2 % | 0,0 % |
| Levantino | 4,0 % | 19,8 % | 7,8 % |
| Magrebí | 1,0 % | 8,2 % | 1,8 % |

Métricas de similitud y longitud:

| Métrica | Referencia reservada | Base | Voho Saudi Chat 4B |
|---|---|---|---|
| chrF++ frente a respuestas reservadas | — | 13,0 | 12,0 |
| Longitud media de respuesta (palabras) | 10,7 | 30,2 | 6,4 |

Interpretación que da el autor: la columna de referencia es el techo de lo que el clasificador acepta como saudí, no un modelo perfecto con un 100 %. El chrF++ se mantiene plano respecto al base e incluso baja ligeramente (de 13,0 a 12,0), lo que el autor atribuye a que el modelo acierta el registro y el tipo de respuesta, no las mismas palabras exactas; es decir, un clasificador de dialecto mide algo que una métrica de solapamiento de cadenas no captura. Las respuestas son además más cortas que la referencia (6,4 frente a 10,7 palabras), lo que en una línea telefónica se considera el lado correcto por el que equivocarse.

## Requisitos de hardware

- Tamaño del modelo: 4.022 millones de parámetros. El repositorio principal ocupa 8,1 GB en safetensors, consistente con pesos en bf16.
- VRAM estimada en bf16/fp16: aproximadamente 8,0 GB solo de pesos, más caché KV y activaciones; en la práctica entre 10 y 12 GB para contextos moderados.
- VRAM estimada en int8: alrededor de 4 GB de pesos, en torno a 6 GB con overhead.
- VRAM estimada en Q4_K_M (GGUF): aproximadamente 2,5 GB de pesos; viable en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: NVIDIA L4 (24 GB, la usada para el entrenamiento LoRA), A100, H100 y H200 para despliegue con concurrencia alta; RTX 4090 y RTX 6000 Ada para inferencia local de alto rendimiento.
- Cabe en GPU de consumo: sí. Con cuantización Q4_K_M funciona en tarjetas de 8 GB o incluso menos; en bf16 requiere tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090).
- Ejecución en CPU: posible mediante llama.cpp u Ollama con el GGUF Q4_K_M, con requisito estimado de 8-16 GB de RAM de sistema.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card), vLLM, text-generation-inference (el repo está etiquetado como compatible con endpoints), Ollama mediante `ollama run hf.co/VohoAI/voho-saudi-chat-4b-GGUF:Q4_K_M`, y llama.cpp a partir del GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El autor no publica mediciones de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voho Saudi Chat 4B | 4,02 B | No especificado en su model card | Árabe saudí conversacional (najdi), respuestas cortas para voz | Apache 2.0 | safetensors en HuggingFace y GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens declarados por el modelo base | Asistente multilingüe de propósito general | Apache 2.0 | safetensors en HuggingFace |
| Otros modelos de dialecto árabe (ALLaM, Jais, SILMA y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa disponible se limita al modelo base. Frente a Qwen3-4B-Instruct-2507, Voho Saudi Chat 4B mejora la clasificación como árabe del Golfo del 62,3 % al 89,8 %, elimina por completo la fuga hacia egipcio (de 8,2 % a 0,0 %), reduce la levantina del 19,8 % al 7,8 % y la magrebí del 8,2 % al 1,8 %, y recorta la longitud media de respuesta de 30,2 a 6,4 palabras. A cambio, su chrF++ baja de 13,0 a 12,0 y pierde generalidad: es un modelo de registro, no de conocimiento. No se dispone de datos de benchmarks de otras alternativas de dialecto árabe en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con ellas.

## Limitaciones y advertencias

- Sesgo dialectal hacia el najdi: los datos de diálogo son del centro de Arabia Saudí, por lo que las respuestas en hijazí o khaleeji derivarán hacia najdi o hacia árabe estándar moderno.
- Ambigüedad del evaluador: la clase "Golfo" de MARBERTv2 agrupa Arabia Saudí, Emiratos Árabes Unidos y Kuwait, de modo que una puntuación alta de Golfo significa "se lee como del Golfo", no "se lee como de Riad".
- No es un modelo de conocimiento: el autor lo describe explícitamente como un modelo de 4B ajustado para registro y voz. Para datos factuales debe fundamentarse con recuperación (RAG). Es esperable un riesgo alto de alucinación si se le piden hechos sin contexto.
- Respuestas muy cortas: una media de 6,4 palabras es adecuada para voz, pero insuficiente para tareas que requieran explicaciones largas, documentación o listas.
- Prohibición práctica de formato: el filtrado descartó markdown, tablas y respuestas largas, por lo que el modelo no es fiable generando código, tablas o texto estructurado.
- Escritura sin diacríticos (harakat), lo que puede afectar a su uso como entrada de sistemas de síntesis de voz que dependan de una vocalización explícita.
- System prompt obligatorio: el prompt de sistema en árabe está presente en todos los ejemplos de entrenamiento. El autor advierte que el dialecto se debilita de forma notable si se omite, por lo que es un requisito operativo, no una recomendación.
- Cobertura de idiomas mínima: la etiqueta de idioma es únicamente "ar". No hay soporte documentado de inglés ni de otras lenguas, lo que limita su uso en entornos bilingües.
- Adopción incipiente: 0 descargas y 1 like en el momento de la consulta, publicado el 19 de septiembre de 2026. No hay evidencia de despliegues en producción ni de validación por terceros independientes del autor.
- Licencia sin restricciones comerciales: Apache 2.0 permite uso comercial, modificación y redistribución. No se identifican cláusulas adicionales, pero conviene verificar la licencia del modelo base y de los datasets (Arabic_Aya y CIDAR) si se redistribuye el modelo o los datos derivados.
- Datos de evaluación limitados: 400 preguntas reservadas y métricas de dialecto y chrF++; no hay evaluación de conocimiento, seguridad, robustez ante prompts adversarios ni sesgos de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VohoAI/voho-saudi-chat-4b
- Versión GGUF: https://huggingface.co/VohoAI/voho-saudi-chat-4b-GGUF
- Dataset de diálogos publicado por Voho: https://huggingface.co/datasets/VohoAI/voho-saudi-dialogues
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Clasificador de dialecto MARBERTv2: https://huggingface.co/IbrahimAmin/marbertv2-arabic-written-dialect-classifier
- Dataset 2A2I/Arabic_Aya: https://huggingface.co/datasets/2A2I/Arabic_Aya
- Dataset arbml/CIDAR: https://huggingface.co/datasets/arbml/CIDAR
- Código de entrenamiento (ruta ml/saudi-chat): https://github.com/yar-malik/voho-platform
- Sitio del autor: https://voho.ai
- Documentación de la API de Voho: https://docs.voho.ai

Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo. Los únicos resultados obtenidos fueron hilos de foro y preguntas sin relación (problemas de COM Surrogate en Windows, acabados de vehículos Smart, configuración de impresoras HP y una página corporativa de SmartBI), por lo que no se ha incorporado información adicional procedente de ellos.
