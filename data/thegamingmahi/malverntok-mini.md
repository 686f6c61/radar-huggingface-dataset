# TheGamingMahi/MalvernTok-mini

## Resumen

MalvernTok-mini es un tokenizador BPE (Byte Pair Encoding) con un vocabulario de 24.000 tokens, desarrollado por el usuario TheGamingMahi y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje completo, sino de un componente de tokenización pensado específicamente para modelos de lenguaje pequenos (SLM, *Small Language Models*), es decir, para arquitecturas de menor tamano que necesitan un vocabulario mas compacto que el de los tokenizadores de modelos grandes, que suelen moverse entre 32.000 y 128.000 tokens.

Su caracteristica tecnica principal es el uso de *byte-fallback*: cuando un caracter o secuencia no existe en el vocabulario, el tokenizador recurre a la representacion en bytes, de modo que puede procesar cualquier cadena Unicode, emojis o fragmentos de codigo sin generar tokens desconocidos (UNK). Esto lo hace robusto frente a entradas fuera del dominio de entrenamiento, un problema habitual en tokenizadores con vocabularios reducidos.

El tokenizador se entreno sobre 1.500 millones de tokens procedentes de TinyStories, TinyCode (del mismo autor), FineWeb y MiniCorpus, una mezcla orientada a texto sencillo, codigo y texto web general. Su relevancia actual radica en que cubre un nicho concreto: pipelines de entrenamiento e inferencia de modelos pequenos donde el coste de la capa de embeddings y de la cabeza de salida importa, y donde un vocabulario de 24.000 entradas reduce parametros asociados al vocabulario frente a alternativas de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE con byte-fallback |
| Parametros totales | no disponible (no es un modelo neuronal; el vocabulario tiene 24.000 tokens) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que use el tokenizador) |
| Tipos de cuantizacion | no aplica (el tokenizador no tiene pesos cuantizables) |
| Idiomas soportados | en (ingles); el byte-fallback permite procesar cualquier Unicode, pero el entrenamiento es en ingles |
| Licencia | MIT |
| Formato de pesos | JSON de la libreria `tokenizers` (`tokenizer_24k_bytefallback.json`) |

## Arquitectura y entrenamiento

MalvernTok-mini es un tokenizador de subpalabras basado en BPE con un vocabulario de 24.000 tokens y mecanismo de byte-fallback. El byte-fallback garantiza cobertura total del rango Unicode: cualquier caracter que no aparezca como token propio se descompone en bytes, evitando el token UNK. Esto es especialmente util en codigo, emojis y texto multilingue no visto durante el entrenamiento.

El entrenamiento se realizo sobre 1.500 millones de tokens compuestos por cuatro fuentes: TinyStories (relatos infantiles sinteticos de vocabulario simple), TinyCode (dataset de codigo del propio autor), FineWeb (texto web filtrado) y MiniCorpus. La combinacion sugiere un sesgo hacia texto de baja complejidad y codigo, coherente con el publico objetivo de SLM. No se dispone de informacion sobre el algoritmo exacto de entrenamiento del BPE (por ejemplo, tamano de vocabulario inicial, reglas de pre-tokenizacion o politica de merges), ni sobre si se aplicaron normalizaciones especificas.

## Capacidades

- Tokenizacion de texto en ingles con vocabulario de 24.000 tokens.
- Cobertura completa de Unicode mediante byte-fallback: emojis, alfabetos no latinos y simbolos sin token dedicado se representan como secuencias de bytes.
- Tokenizacion de codigo fuente sin generar tokens desconocidos.
- Compatible con la libreria `tokenizers` de Hugging Face mediante carga directa del fichero JSON.
- No incluye capacidades de generacion, razonamiento, tool calling ni agentes: es exclusivamente un componente de tokenizacion.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Entrenamiento de modelos de lenguaje pequenos: el vocabulario de 24.000 tokens reduce el numero de parametros en la capa de embeddings y en la proyeccion de salida, lo que aligera el modelo y acelera el entrenamiento en GPUs de gama media.
- Prototipado rapido de pipelines NLP: al cargarse como un unico JSON con `Tokenizer.from_file`, se integra en scripts de experimentacion sin dependencias adicionales mas alla de `tokenizers`.
- Tokenizacion de texto conversacional simple: el entrenamiento sobre TinyStories lo hace adecuado para corpus de frases cortas y vocabulario limitado, tipico de asistentes basicos o chatbots de dominio restringido.
- Procesamiento de codigo en herramientas de analisis: el byte-fallback evita UNK en identificadores, operadores y literales exoticos, lo que resulta util en tareas de conteo de tokens o preprocesado de repositorios.
- Manejo de entradas con emojis o caracteres no latinos en aplicaciones de usuario: el byte-fallback permite tokenizar mensajes que incluyan simbolos fuera del vocabulario sin perdida de informacion.
- Investigacion sobre eficiencia de vocabularios: sirve como punto de comparacion frente a tokenizadores de 32.000 o 50.000 tokens para estudiar el equilibrio entre cobertura, longitud de secuencia y coste computacional en SLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de compresion (tokens por palabra), cobertura de vocabulario ni comparaciones con otros tokenizadores.

## Requisitos de hardware

- El tokenizador no requiere GPU: se ejecuta en CPU y su fichero JSON ocupa del orden de unos pocos cientos de kilobytes, aunque el dato exacto de tamano no esta disponible.
- No necesita VRAM para inferencia; la memoria consumida es la del proceso Python que carga la libreria `tokenizers`.
- Compatible con cualquier maquina que ejecute Python y la libreria `tokenizers` (Rust en el backend), incluidas Raspberry Pi y entornos sin acelerador.
- Opciones de despliegue: carga directa con `Tokenizer.from_file`, integracion en pipelines de Hugging Face `transformers` y uso dentro de servidores de inferencia que acepten tokenizadores en formato JSON.
- Latencia y throughput: no disponibles en la informacion proporcionada; en general, los tokenizadores BPE en Rust procesan del orden de millones de tokens por segundo en CPU, pero no se aporta una cifra verificada para este modelo concreto.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Byte-fallback | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MalvernTok-mini | 24.000 | Si | en (entrenamiento) | MIT | Hugging Face |
| GPT-2 tokenizer | 50.257 | Si | en | MIT | Hugging Face |
| Llama 3 tokenizer | 128.000 | Si | multilingue | Llama 3 Community License | Hugging Face |
| Mistral tokenizer | 32.000 | Si | multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento comparado (tokens por palabra, cobertura) para MalvernTok-mini. Frente a GPT-2 y Mistral, su vocabulario es mas pequeno, lo que reduce el coste de embeddings pero puede alargar las secuencias; frente a Llama 3, la diferencia de tamano es mucho mayor y la cobertura multilingue de MalvernTok-mini no esta documentada.

## Limitaciones y advertencias

- Entrenado unicamente con corpus en ingles: el rendimiento en otros idiomas dependera del byte-fallback, que produce secuencias de bytes mas largas y menos eficientes que tokens dedicados.
- Vocabulario de 24.000 tokens: puede fragmentar mas el texto que tokenizadores de 32.000 o 128.000, incrementando la longitud efectiva de las secuencias y el coste de atencion en modelos que lo utilicen.
- No es un modelo de lenguaje: no genera texto ni realiza tareas cognitivas; cualquier expectativa de razonamiento o generacion es incorrecta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad de compresion ni de su comportamiento en dominios distintos a los de entrenamiento.
- La licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el proyecto tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documenta la politica de normalizacion Unicode ni el pre-tokenizador empleado, lo que puede afectar a la reproducibilidad de los resultados.
- Riesgo de deriva si se usa con modelos entrenados con otro tokenizador: el vocabulario y los IDs no son intercambiables.

## Enlaces

- Hugging Face: https://huggingface.co/TheGamingMahi/MalvernTok-mini
- Perfil del autor: https://huggingface.co/TheGamingMahi
- Datasets del autor: https://huggingface.co/TheGamingMahi/datasets
