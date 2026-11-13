# tibaf/embeddinggemma

## Resumen

Este repositorio no es un modelo entrenado por su autor, sino un espejo de distribucion (mirror) de los ficheros LiteRT de la familia EmbeddingGemma de Google DeepMind. El autor, `tibaf`, aloja copias byte a byte identicas de dos artefactos: `embeddinggemma-2-text-vision-440m.litertlm` (procedente de `litert-community/embeddinggemma-2-text-vision-440m-litert-lm`) y `embeddinggemma-300M_seq256_mixed-precision.tflite` junto con su tokenizador SentencePiece (procedente de `litert-community/embeddinggemma-300m`). El proposito declarado es garantizar a la aplicacion Memoyad una fuente de descarga estable anclada a un commit concreto y verificada por SHA-256.

El modelo subyacente resuelve el problema de generar embeddings de similitud semantica en dispositivo (on-device). El artefacto de 440M proyecta imagenes y texto en un mismo espacio vectorial de 768 dimensiones, lo que permite busqueda multimodal y recuperacion cruzada entre modalidades; el de 300M produce embeddings de texto con una secuencia de entrada de 256 tokens y cuantizacion mixta. Ambos estan pensados para ejecutarse en CPU y GPU de movil mediante LiteRT-LM y el runtime TFLite, sin depender de servidores.

La relevancia de este repositorio es logistica mas que cientifica: fija versiones inmutables y hashes verificables para un despliegue movil reproducible. No anade pesos, grafos ni tokenizadores nuevos, y no esta afiliado ni respaldado por Google. Conviene tratar la ficha como documentacion de los artefactos originales, no como una contribucion de modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los artefactos son grafos LiteRT/TFLite; la arquitectura interna del transformer no se detalla en la informacion proporcionada) |
| Parametros totales | 440M (variante text-vision) y 300M (variante texto) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | 256 tokens de secuencia en la variante 300M (segun el nombre del fichero); no disponible para la variante 440M |
| Tipos de cuantizacion | precision mixta en la variante 300M (`mixed-precision`); no disponible el detalle para la variante 440M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 para EmbeddingGemma 2 (440M); Gemma Terms of Use para EmbeddingGemma 300M; el repositorio declara `gemma-terms-and-apache-2.0` |
| Formato de pesos | `.litertlm` (LiteRT-LM) y `.tflite` (TFLite), mas tokenizador SentencePiece `.model` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de los modelos. Lo unico verificable es el formato de despliegue: la variante de 440M se empaqueta como `.litertlm`, el formato de LiteRT-LM que agrupa pesos, grafo y metadatos para ejecucion en CPU y GPU, y la de 300M como `.tflite` con cuantizacion de precision mixta y secuencia fija de 256 tokens. El repositorio incluye builds especificos para NPU de chips moviles concretos en el repositorio de origen, pero no se replican en este espejo.

No se proporcionan datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de atencion. Los modelos fueron desarrollados por Google DeepMind y convertidos a LiteRT por la comunidad LiteRT de Google AI Edge; este repositorio se limita a replicar los ficheros sin modificacion alguna, con verificacion criptografica de integridad.

## Capacidades

- Generacion de embeddings de similitud semantica para frases y documentos (pipeline `sentence-similarity`).
- Embeddings multimodales texto-imagen en un espacio comun de 768 dimensiones (variante 440M), lo que habilita busqueda texto-a-imagen e imagen-a-texto.
- Ejecucion on-device en CPU y GPU mediante LiteRT-LM, sin llamadas a servidor.
- Tokenizacion SentencePiece incluida como fichero separado en la variante 300M.
- Soporte de aceleracion por NPU en builds especificos del repositorio de origen (no incluidos en este espejo).
- No se documentan capacidades de generacion de texto, tool calling, razonamiento multi-paso, agentes ni modo thinking: el pipeline declarado es exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica local en aplicaciones moviles: indexar notas o documentos del usuario con la variante 300M y recuperar por similitud coseno sin enviar datos a la nube, gracias a la ventana de 256 tokens y al empaquetado TFLite de 179 MB.
- Recuperacion multimodal en galerias de fotos: la variante 440M permite consultar una biblioteca de imagenes con una descripcion textual al proyectar ambas modalidades en el mismo espacio de 768 dimensiones.
- Deduplicacion y agrupamiento de contenido: calcular embeddings de titulares, correos o mensajes y agrupar por cercania vectorial para detectar duplicados o temas recurrentes.
- Clasificacion zero-shot ligera: comparar el embedding de un texto con embeddings de etiquetas predefinidas y asignar la clase mas proxima, util en moderacion o triaje de tickets.
- Sistemas de recomendacion basados en contenido: representar items y preferencias del usuario como vectores y ordenar candidatos por similitud, con inferencia en el propio dispositivo.
- Filtrado previo en pipelines RAG moviles: usar el modelo como recuperador denso de primera etapa en el dispositivo y delegar la generacion a un LLM remoto, reduciendo el trafico y los costes de API.
- Verificacion de integridad en despliegues distribuidos: el esquema de hashes SHA-256 y commits anclados del repositorio sirve de referencia para pipelines de distribucion de artefactos ML que exigen reproducibilidad binaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella en disco: 387,7 MB para `embeddinggemma-2-text-vision-440m.litertlm`; 179,1 MB para `embeddinggemma-300M_seq256_mixed-precision.tflite`; 4,7 MB para el tokenizador SentencePiece; 0,6 GB de repositorio total.
- VRAM/RAM estimada para inferencia: no disponible de forma explicita; por el tamano de los artefactos, la variante 300M en precision mixta deberia operar en el orden de cientos de MB de memoria, pero no se confirma en la documentacion.
- GPU recomendadas: no se especifican modelos de escritorio; el objetivo declarado son CPU y GPU de movil mediante LiteRT-LM.
- Cabe en GPU de consumo: no confirmado; el diseno es para dispositivos moviles, no para aceleradores de escritorio.
- Opciones de despliegue: LiteRT-LM (runtime especifico para `.litertlm`) y el runtime TFLite para `.tflite`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan estos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| EmbeddingGemma 2 text-vision (este espejo) | 440M | no disponible | texto + imagen, 768 dim | Apache 2.0 | `.litertlm` |
| EmbeddingGemma 300M (este espejo) | 300M | 256 tokens | texto | Gemma Terms of Use | `.tflite` |
| Alternativas de embeddings de texto de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio es un espejo no oficial: no esta afiliado ni respaldado por Google, y el autor no ha modificado los artefactos, pero tampoco ofrece soporte sobre ellos.
- La variante 300M esta limitada a secuencias de 256 tokens, insuficiente para documentos largos sin troceado previo.
- No se documentan los idiomas soportados; el rendimiento multilingue es desconocido y debe validarse empiricamente antes de produccion.
- Conviven dos licencias distintas: Apache 2.0 para el artefacto de 440M y Gemma Terms of Use para los de 300M, con la Gemma Prohibited Use Policy aplicable a estos ultimos. El uso comercial del artefacto de 300M exige cumplir los terminos de Gemma.
- Los formatos `.litertlm` y `.tflite` atan el despliegue al ecosistema LiteRT/TFLite; no hay pesos en safetensors ni GGUF para reutilizar en otros runtimes.
- Riesgo de alucinacion y sesgos: no documentados; al ser modelos de embeddings, el riesgo se traslada a recuperaciones erroneas o sesgadas en lugar de a texto generado.
- Los builds para NPU de chips moviles especificos no estan incluidos en este espejo, por lo que no se puede aprovechar la aceleracion NPU solo con estos ficheros.
- La fecha de creacion del repositorio (2026-09-27) y la de actualizacion (2026-11-13) deben contrastarse con el estado real de los repositorios de origen antes de fijar dependencias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tibaf/embeddinggemma
- Licencia Apache 2.0 incluida: https://huggingface.co/tibaf/embeddinggemma/blob/main/LICENSE-APACHE-2.0.txt
- Terminos de uso de Gemma incluidos: https://huggingface.co/tibaf/embeddinggemma/blob/main/GEMMA_TERMS_OF_USE.md
- Modelo base EmbeddingGemma 2: https://huggingface.co/google/embeddinggemma-2
- Modelo base EmbeddingGemma 300M: https://huggingface.co/google/embeddinggemma-300m
- Origen LiteRT de la variante 440M: https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm
- Origen LiteRT de la variante 300M: https://huggingface.co/litert-community/embeddinggemma-300m
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Terminos de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Pagina de licencia citada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- Aplicacion Memoyad: https://memoyad.com
