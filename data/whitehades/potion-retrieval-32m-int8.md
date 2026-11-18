# WhiteHades/potion-retrieval-32M-int8

## Resumen

potion-retrieval-32M-int8 es una versión cuantizada a int8 del modelo de embeddings estáticos minishlab/potion-retrieval-32M, empaquetada por el usuario WhiteHades en un formato binario propio denominado metldr. No se trata de un transformer convencional que se ejecuta en inferencia: es una tabla de vectores estáticos por token (estilo Model2Vec) que se consulta directamente, sin pasar por una red neuronal. El paquete contiene la tabla de embeddings y el vocabulario WordPiece en un único fichero de 33 MB, pensado para búsqueda semántica dentro del navegador mediante la extensión metldr y la crate Rust metldr-embed.

El modelo resuelve el problema de la recuperación densa en entornos con recursos muy limitados, como una extensión de navegador o WebAssembly en un solo hilo. Al almacenar cada vector de token como int8 con una escala float por token, reduce el peso del modelo manteniendo, según la model card, la calidad de recuperación del original en float32. La dimensión de los embeddings es 512 y el vocabulario consta de 63.091 tokens.

Su relevancia actual radica en que demuestra que la recuperación semántica de calidad competitiva puede ejecutarse sin GPU y sin inferencia neuronal, con latencias de microsegundos por texto y milisegundos por consulta sobre corpus de miles de documentos. Es un artefacto muy especializado: no genera texto ni razona, solo produce embeddings para búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | embeddings estaticos por token (Model2Vec, destilado de un transformer; sin red neuronal en inferencia) |
| Parametros totales | no disponible (tabla de 63.091 vectores de dimension 512) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el embedding es la media normalizada de los vectores de token del texto; no hay ventana definida) |
| Tipos de cuantizacion | int8 con una escala float32 por token (value x scale = float original) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | binario propietario `.metldr` (little endian), empaquetado desde `model.safetensors` del modelo base |

## Arquitectura y entrenamiento

El modelo base minishlab/potion-retrieval-32M pertenece a la familia Model2Vec de MinishLab, que destila un transformer de embeddings en una tabla estática de vectores por token. En inferencia no se ejecuta ninguna red neuronal: el embedding de un texto se calcula como la media normalizada de los vectores de sus tokens, omitiendo el token `[UNK]`. La tokenización emplea BERT WordPiece en minúsculas y con acentos eliminados.

Esta versión int8 no reentrena el modelo, sino que lo empaqueta. Cada vector de token se almacena como una fila de enteros de 8 bits acompañada de una escala float32 por token, de modo que el valor original se recupera multiplicando. El fichero `.metldr` contiene, en este orden: la cabecera mágica `MTLDRE01`, cuatro enteros u32 (dimensión, número de tokens, id de `[UNK]` y longitud del vocabulario en bytes), el vocabulario con los tokens en orden de id separados por saltos de línea, las escalas y las filas int8. Se generó a partir de la revisión `6fc8051fab2a1e0ee76689cf08c853792ac285e7` del modelo base (SHA-256 de `model.safetensors`: `07609e5bd33aad37900b3fd62f4ec96f6daec88ca4d46b9d8b928bfababf6ea0`) con la herramienta `pack-model`.

## Capacidades

- Generación de embeddings de frases y documentos para recuperación densa (feature-extraction).
- Búsqueda semántica en inglés sobre corpus pequeños y medianos.
- Fusión con BM25 para recuperación híbrida (los datos de la model card usan reciprocal rank fusion).
- Ejecución en WebAssembly en un solo hilo, sin GPU ni aceleradores.
- Integración en navegador mediante la extensión metldr y la crate Rust metldr-embed.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- Capacidad multilingüe limitada al inglés (tokenizador WordPiece en minúsculas).

## Casos de uso

- Búsqueda semántica en extensiones de navegador: el modelo se carga como un fichero de 33 MB y permite indexar y consultar el contenido de las páginas visitadas sin enviar datos a un servidor, gracias a la ejecución en WebAssembly.
- Recuperación de documentos científicos a pequeña escala: los resultados en SciFact (BEIR) muestran un nDCG@10 de 0,6382 en denso y 0,6942 fusionado con BM25, adecuado para asistentes de lectura de papers dentro del navegador.
- Búsqueda híbrida en aplicaciones de escritorio en Rust: la crate metldr-embed lee el formato directamente y permite combinar la señal densa con BM25 sin dependencias de Python ni de frameworks de inferencia.
- Indexación de notas personales o base de conocimiento local: con 1,2 s para embeber 5.183 documentos en WebAssembly y 0,38 ms por consulta densa con SIMD, es viable reindexar corpus personales de forma interactiva.
- Filtrado y deduplicación semántica de textos en pipelines ligeros: al no requerir GPU, puede ejecutarse en funciones serverless o en el borde de la red para tareas de similitud.
- Prototipado rápido de sistemas RAG de bajo coste: sirve como recuperador inicial para validar una arquitectura antes de invertir en un modelo de embeddings mayor, manteniendo la licencia MIT para uso comercial.
- Búsqueda offline en dispositivos con recursos limitados: el tamaño del fichero y la ausencia de inferencia neuronal permiten desplegarlo en entornos sin aceleración hardware.

## Benchmarks y rendimiento

Evaluación en SciFact (BEIR), 300 consultas de test, nDCG@10:

| Configuracion | Denso | Fusionado con BM25 |
|---|---|---|
| Modelo base, float32 | 0,6378 | 0,6775 |
| Este fichero, int8 | 0,6382 | 0,6942 (RRF ponderada, k=5, peso denso 0,75, ajustado en consultas de train) |
| nomic-embed-text-v1.5 q8, 256 dimensiones (referencia) | 0,6260 | 0,6889 (k=60, pesos iguales) |

Rendimiento medido en la model card: embeber los 5.183 documentos de SciFact tarda aproximadamente 1,2 s en WebAssembly en un solo hilo; una consulta densa sobre ellos tarda 0,38 ms con SIMD de WebAssembly.

## Requisitos de hardware

- VRAM: no requiere GPU; el fichero ocupa 33 MB y se carga en memoria principal.
- GPU recomendadas: ninguna; el modelo no ejecuta inferencia neuronal.
- GPU de consumo: no aplica, funciona en CPU y en WebAssembly.
- Despliegue: extensión de navegador metldr, crate Rust metldr-embed y cualquier entorno capaz de leer el formato `.metldr`; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un transformer ejecutable.
- Latencia y throughput: 0,38 ms por consulta densa con SIMD en WebAssembly; 1,2 s para embeber 5.183 documentos en un hilo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | SciFact nDCG@10 (denso) | Licencia | Formato |
|---|---|---|---|---|---|---|
| potion-retrieval-32M-int8 (este) | tabla de 63.091 x 512 | 512 | no aplica | 0,6382 | MIT | `.metldr` int8 |
| minishlab/potion-retrieval-32M (base) | tabla estatica equivalente | 512 | no aplica | 0,6378 | MIT | safetensors float32 |
| nomic-embed-text-v1.5 q8 (256 dim) | no disponible | 256 | no disponible | 0,6260 | no disponible en la informacion | cuantizado q8 |

## Limitaciones y advertencias

- Solo inglés: el tokenizador WordPiece en minúsculas y sin acentos no está pensado para otros idiomas.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Los embeddings son estáticos por token; la media normalizada pierde información de orden y de composición sintáctica frente a un transformer contextual.
- El formato `.metldr` es propietario y solo lo lee la crate metldr-embed; no hay interoperabilidad con ecosistemas estándar de embeddings.
- El autor del empaquetado (WhiteHades) no es el autor del modelo base; la reproducibilidad depende de la revisión y del SHA-256 documentados.
- El repo figura con 0 descargas y 0 likes y un tamaño reportado de 0.0 GB, lo que sugiere que el artefacto puede no estar realmente subido o que la metadata no refleja el fichero de 33 MB.
- Riesgo de alucinación no aplica directamente, pero la recuperación puede devolver pasajes irrelevantes si el dominio difiere del corpus de entrenamiento del modelo base.
- Licencia MIT, por lo que el uso comercial está permitido; conviene mantener la atribución a MinishLab por Model2Vec y los modelos potion.

## Enlaces

- Hugging Face: https://huggingface.co/WhiteHades/potion-retrieval-32M-int8
- Modelo base: https://huggingface.co/minishlab/potion-retrieval-32M
- Repositorio de Model2Vec: https://github.com/MinishLab/model2vec
