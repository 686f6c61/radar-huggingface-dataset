# VelociQ8/harrier-oss-v1-270m-Q8A64-GGUF

## Resumen

harrier-oss-v1-270m es un modelo de embeddings de texto desarrollado por Microsoft, el miembro más pequeño de una familia multilingüe de tres escalas (270M, 0,6B y 27B) publicada bajo licencia MIT. No es un modelo generativo: convierte texto en vectores densos de 640 dimensiones pensados para recuperación de información, similitud semántica, clustering, clasificación, minería de bitextos y reranking. Su ventana de contexto declarada en el checkpoint original es de 32.768 tokens, lo que permite embeber documentos largos sin troceado agresivo. El modelo declara soporte para 94 idiomas, lo que lo sitúa en el terreno de los embeddings multilingües de recuperación.

El repositorio que nos ocupa no contiene el modelo original, sino la conversión realizada por VelociQ8 al formato Q8A64, un formato de pesos de 8 bits con kernels propios para CPU (Arm con dotprod y x86-64 con AVX2 + FMA). El objetivo es ejecutar el modelo en CPU sin GPU, algo relevante para servidores Arm (Graviton, Ampere Altra, Neoverse) y para entornos x86 sin acelerador dedicado. Los pesos conservan la licencia MIT del modelo base, pero el runtime necesario es software propietario de uso gratuito.

La relevancia práctica de esta ficha es doble: por un lado documenta un embedding multilingüe compacto y de licencia permisiva; por otro advierte de una limitación crítica de interoperabilidad. Aunque la etiqueta del repositorio es `gguf`, el archivo Q8A64 **solo carga en VelociQ8 1.1 o superior**; llama.cpp estándar, Ollama estándar y los snippets automáticos de "Use this model" de Hugging Face no funcionan con él. Además, el campo `inference` está a `false`, por lo que la Inference API de Hugging Face no sirve este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), segun la configuracion declarada por el checkpoint original; el autor de la conversion indica que respeta esa arquitectura |
| Parametros totales | 283.168.768 (denominado 270M por el autor) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo original; no se especifica un valor distinto para el archivo Q8A64 |
| Tipos de cuantizacion | Q8A64 (8 bits por peso, formato propio de VelociQ8); no se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | Multilingue (94 idiomas segun la documentacion de Microsoft sobre la familia harrier-oss-v1) |
| Licencia | MIT (pesos del modelo base); el runtime VelociQ8 es software propietario de uso gratuito |
| Formato de pesos | Q8A64 (contenedor con cabecera tipo GGUF, solo cargable con VelociQ8 1.1 o superior; incompatible con llama.cpp estandar) |
| Dimension de los embeddings | 640 |
| Pipeline | feature-extraction (sentence-similarity) |
| Tamano del repositorio | 1,2 GB (incluye binarios del runtime ademas de los pesos) |
| Modelo base | microsoft/harrier-oss-v1-270m |
| Descargas / likes | 118 descargas, 0 likes |
| Fechas | Creado el 2026-10-21, actualizado el 2026-10-25 |

## Arquitectura y entrenamiento

El checkpoint original es un transformer causal (decoder-only) utilizado como encoder de embeddings, con proyeccion a vectores de 640 dimensiones. La model card de la conversion es explicita en este punto: el archivo se convirtio "con la arquitectura causal (decoder-only) que el checkpoint original declara en su propia configuracion". No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones de atencion (no hay mencion a atencion lineal, decodificacion especulativa ni variantes hibridas). Tampoco se detalla el objetivo de entrenamiento concreto mas alla del uso declarado como modelo de embeddings.

El elemento tecnico diferencial de este repositorio no esta en el modelo sino en el formato: Q8A64 es un esquema de pesos de 8 bits con kernels SIMD especificos para Arm (dotprod) y x86-64 (AVX2 + FMA), implementado en un fork/build de llama.cpp llamado VelociQ8. La interfaz de uso sigue la convencion de embeddings asimetricos: las consultas reciben una instruccion de tarea de una sola frase y los documentos no reciben ninguna. Los binarios distribuidos incluyen `llama-server`, `llama-cli`, `llama-embedding`, `llama-bench` y `llama-quantize`, con la misma API HTTP que llama.cpp, incluidos los endpoints compatibles con OpenAI.

## Capacidades

- Generacion de embeddings de texto de 640 dimensiones para frases, parrafos y documentos de hasta 32.768 tokens.
- Recuperacion de informacion (retrieval) y busqueda semantica multilingue sobre 94 idiomas.
- Similitud semantica entre pares de textos (sentence-similarity).
- Clustering y agrupacion de documentos o frases por proximidad vectorial.
- Clasificacion de texto mediante embeddings (entrenando un clasificador ligero sobre los vectores).
- Mineria de bitextos (bitext mining) para alinear corpus paralelos entre idiomas.
- Reranking de resultados de busqueda usando la similitud coseno entre consulta y candidato.
- Soporte de instruccion de tarea en la consulta: una frase de instruccion para la query, sin instruccion en el documento.
- No soporta generacion de texto, razonamiento generativo, tool calling, agentes, vision ni audio: es exclusivamente un extractor de caracteristicas.
- No soporta decodificacion especulativa ni modos de "thinking": no aplica a un modelo de embeddings.

## Casos de uso

- **RAG sobre documentacion interna multilingue**: indexar manuales, wikis y tickets en 94 idiomas con vectores de 640 dimensiones y recuperar fragmentos relevantes antes de pasarlos a un LLM generativo. El contexto de 32.768 tokens permite indexar secciones completas sin trocear en fragmentos excesivamente pequenos.
- **Busqueda semantica en servidores Arm sin GPU**: desplegar el archivo Q8A64 con VelociQ8 en AWS Graviton, Ampere Altra o Neoverse, donde los kernels con dotprod permiten ejecutar la inferencia en CPU con ~283 MB de pesos en 8 bits.
- **Deduplicacion y near-duplicate detection de corpus**: embeber cada documento y aplicar umbrales de similitud coseno para eliminar duplicados en pipelines de curación de datos, aprovechando el bajo coste por documento de un modelo de 270M.
- **Clasificacion y enrutado de tickets de soporte**: generar embeddings de cada ticket entrante y usar un clasificador ligero o kNN sobre los vectores para asignar categoria o equipo, sin necesidad de un LLM generativo.
- **Reranking en pipelines de busqueda híbrida**: recuperar 100 candidatos con BM25 y reordenarlos con similitud de embeddings; el coste de un 270M permite hacer reranking en CPU con latencia contenida por candidato.
- **Mineria de bitextos para construccion de corpus paralelos**: alinear frases entre pares de idiomas comparando embeddings, un caso de uso declarado explicitamente por el autor del modelo.
- **Edge computing y entornos air-gapped**: el runtime se distribuye como archivos portatiles (incluida una Ollama 0.40.11 portable que no toca una instalacion existente), lo que facilita despliegues sin conectividad ni GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion indica explicitamente que el archivo "no tiene mediciones propias" y que solo se ha verificado que carga y ejecuta. La documentacion de Microsoft sobre la familia harrier-oss-v1 y la nota de prensa de MarkTechPost mencionan un rendimiento "SOTA en MTEB multilingue v2" para la familia, pero no se han proporcionado cifras concretas (ni MMLU, ni retrieval nDCG, ni MTEB por idioma) en el material disponible, por lo que no se reproduce ninguna tabla numerica.

## Requisitos de hardware

- **Pesos**: 283.168.768 parametros a 8 bits equivalen a aproximadamente 283 MB de pesos; el repositorio ocupa 1,2 GB porque incluye los archivos del runtime.
- **VRAM**: no es necesario GPU. En el caso de usar GPU a traves de las builds portatiles de Ollama, el consumo seria minimo (por debajo de 1 GB para los pesos), aunque no se publican cifras oficiales.
- **CPU soportadas**: Arm de 64 bits con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores), Arm de 64 bits generico mediante el paquete `multi` que selecciona kernels al arrancar, y x86-64 con AVX2 + FMA (Intel Haswell, AMD Zen y posteriores).
- **GPU opcionales**: mediante Vulkan en las builds portatiles de Ollama para x86-64 (NVIDIA, AMD o Intel con driver instalado); mediante CUDA en las builds `-cuda` (requiere GPU NVIDIA Turing o posterior, es decir, GeForce RTX 20 en adelante, con driver actualizado).
- **Cabe en hardware consumer**: si, en cualquier portatil o mini-PC x86-64 con AVX2, y en placas Arm de 64 bits; el cuello de botella es la CPU, no la memoria.
- **Opciones de despliegue**: exclusivamente VelociQ8 1.1 o superior (archivos linux-arm64, linux-arm64-multi, linux-x64, windows-x64, Ollama portable 0.40.11 en variantes Arm, x86-64 y CUDA) o la imagen Docker `ghcr.io/dhaern/velociq8`. Requiere glibc 2.28 o superior en Linux. **No compatible** con llama.cpp estandar, Ollama estandar, vLLM ni TGI.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de `llama-bench` ni de `llama-embedding` para este archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|---|
| harrier-oss-v1-270m Q8A64 (este repo) | 283.168.768 | 32.768 tokens (modelo original) | 640 | 94 | MIT (pesos) + runtime propietario | Q8A64, solo VelociQ8 |
| microsoft/harrier-oss-v1-270m | 270M (nominal) | 32.768 tokens | 640 | 94 | MIT | safetensors, HF Transformers |
| microsoft/harrier-oss-v1-0.6b | 0,6B (nominal) | no disponible en la informacion | no disponible | 94 | MIT (familia open source) | no disponible |
| microsoft/harrier-oss-v1-27b | 27B (nominal) | no disponible en la informacion | no disponible | 94 | MIT (familia open source) | no disponible |

No se dispone de datos de rendimiento comparado (MTEB u otros) ni de especificaciones de modelos de otros fabricantes en la informacion proporcionada, por lo que la comparativa se limita a los tres miembros de la familia harrier-oss-v1. Como referencia de posicionamiento: este archivo es la variante de 8 bits para CPU del miembro mas pequeno, y su ventaja frente al checkpoint original es el despliegue sin GPU; su desventaja es la dependencia de un runtime no estandar.

## Limitaciones y advertencias

- **Interoperabilidad rota**: aunque la etiqueta del repositorio sea `gguf`, el archivo Q8A64 no carga en llama.cpp estandar ni en Ollama estandar. Los snippets de "Use this model" que Hugging Face muestra para llama.cpp y Ollama no funcionan. Cualquier pipeline existente basado en llama.cpp requerira cambios.
- **Dependencia de software propietario**: VelociQ8 es software propietario de uso gratuito, construido sobre llama.cpp. La licencia MIT cubre los pesos, no el runtime, lo que introduce un riesgo de lock-in y de continuidad del proyecto (repositorio de un unico autor, `dhaern/VelociQ8`).
- **Sin mediciones de calidad de la cuantizacion**: el autor no publica ninguna evaluacion que compare los embeddings Q8A64 con los del checkpoint original en safetensors. Se desconoce la degradacion real en retrieval o similitud; la verificacion se limita a que el archivo carga y ejecuta.
- **Sin benchmarks propios**: no hay cifras de MTEB ni de retrieval para este archivo ni para el modelo base en la informacion disponible, solo la afirmacion de SOTA de la familia en notas de prensa.
- **Riesgo de recuperacion irrelevante**: al no ser un modelo generativo no "alucina" texto, pero si puede devolver vecinos semanticamente proximos y factualmente incorrectos; en RAG esto se traduce en contexto erroneo para el LLM posterior.
- **Sesgos del corpus**: no se documenta la composicion del dataset de entrenamiento ni se publican analisis de sesgo por idioma o dominio; con 94 idiomas declarados, es esperable un rendimiento desigual entre lenguas de altos y bajos recursos.
- **Idioma y tokenizacion**: no se detalla el tokenizador ni la cobertura real por idioma; el castellano esta cubierto por el caracter multilingue declarado, pero no hay evaluacion especifica disponible.
- **Instruccion de tarea obligatoria en la query**: el uso correcto requiere una frase de instruccion de una sola frase en las consultas y ninguna en los documentos; ignorar esta asimetria degrada la calidad de recuperacion.
- **Contexto**: los 32.768 tokens corresponden al modelo original; no se especifica si el archivo Q8A64 los soporta integramente ni como se comporta el pooling en secuencias muy largas.
- **Inferencia no soportada en HF**: `inference: false`; el modelo no puede probarse desde la Inference API de Hugging Face.
- **Licencia**: los pesos son MIT, lo que permite uso comercial sin restricciones conocidas; verificar en cualquier caso los terminos del runtime VelociQ8 para uso en produccion.

## Enlaces

- Repositorio del archivo cuantizado: https://huggingface.co/VelociQ8/harrier-oss-v1-270m-Q8A64-GGUF
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Variante de 27B de la familia: https://huggingface.co/microsoft/harrier-oss-v1-27b
- Organizacion VelociQ8 en Hugging Face: https://huggingface.co/VelociQ8
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentacion de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Pagina de la familia harrier-oss-v1 en Microsoft Foundry Labs: https://labs.ai.azure.com/innovations/harrier-oss-v1/
- Nota de prensa de MarkTechPost sobre harrier-oss-v1: https://www.marktechpost.com/2026/03/30/microsoft-ai-releases-harrier-oss-v1-a-new-family-of-multilingual-embedding-models-hitting-sota-on-multilingual-mteb-v2/
- Licencia MIT: https://opensource.org/license/mit
