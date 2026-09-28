# tzpranto/ali-llm-v0.1

## Resumen

ali-llm v0.1 es un modelo de lenguaje decoder-only de 2,05 mil millones de parametros entrenado desde cero por el usuario tzpranto sobre texto en ingles escrito para ninos, siguiendo un orden curricular estricto: primero habla y cuentos de preescolar, despues infantil, y a continuacion los grados 1 a 5 en secuencia. El objetivo declarado es estudiar el preentrenamiento ordenado por curriculum y la adquisicion del lenguaje, ademas de ofrecer un modelo pequeno solido para texto de nivel infantil, gramatica simple y aritmetica de primaria.

La arquitectura es un transformer decoder-only de estilo Llama de 32 capas, hidden size 2.048 y FFN SwiGLU de 8.192, con dos modificaciones en la atencion: QK-norm por cabeza antes del RoPE y una puerta sigmoide de salida por cabeza calculada a partir de la entrada de la capa. Se entreno con 6,3 mil millones de tokens vistos (2,3 mil millones unicos) y se publica como modelo base, sin ajuste por instrucciones ni alineamiento de seguridad.

Su relevancia es doble: por un lado es un artefacto de investigacion reproducible sobre curriculos ordenados por nivel de lectura, y por otro es un modelo de 2 B parametros con licencia Apache 2.0 que cabe en GPUs de consumo. La contrapartida es que exige `trust_remote_code=True`, no tiene benchmarks publicados y su ventana de entrenamiento es corta (2.048 tokens, con RoPE configurado hasta 4.096).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama, con QK-norm por cabeza y puerta de salida de atencion por cabeza (codigo propio, `custom_code`) |
| Parametros totales | 2.049.054.720 (2,05 B); todos no-embedding excepto la tabla de embeddings compartida de 100,7 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenado a 2.048 tokens; RoPE configurado a 4.096 |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bfloat16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), con codigo de modelado incluido en el repositorio; requiere `trust_remote_code=True` |
| Capas | 32 |
| Hidden size | 2.048 |
| Tamano de feed-forward | 8.192, SwiGLU |
| Atencion | 32 cabezas de consulta, 8 cabezas clave-valor (grouped-query), tamano de cabeza 64 |
| Normalizacion | RMSNorm, eps 1e-5, pre-norm; QK-norm sobre queries y keys por cabeza antes de RoPE |
| Posiciones | RoPE, base 500.000 |
| Embeddings | Entrada y salida atados (tied) |
| Vocabulario | 49.152 tokens |
| Precision | bfloat16 |
| Tokenizer | BPE byte-level de 49.152 tokens, entrenado con la libreria `tokenizers`; cada digito es un token propio; 16 tokens especiales (`<|endoftext|>` id 0, `<|pad|>` id 1 y 14 reservados) |
| Tamano del repositorio | 4,1 GB |
| Version de transformers probada | 5.17, con torch 2.13 |

## Arquitectura y entrenamiento

El modelo sigue el diseno de un decoder estilo Llama con dos anadidos en el bloque de atencion: QK-norm (RMSNorm sobre queries y keys, por cabeza, antes de aplicar RoPE) y una puerta de salida sigmoide por cabeza que se calcula a partir de la entrada de la capa y se multiplica por la salida de esa cabeza. Ambas tecnicas son conocidas por estabilizar el entrenamiento con learning rates altos. Las puertas se inicializaron a cero, de modo que cada cabeza arranca "medio abierta". El resto del bloque es convencional: RMSNorm pre-norm con eps 1e-5, FFN SwiGLU de 8.192 de dimension intermedia, GQA con 32 cabezas de consulta y 8 de clave-valor de tamano 64, RoPE con base 500.000 y embeddings de entrada y salida atados.

El entrenamiento es el aspecto diferencial. Todo el texto se asigno a un nivel en una escala de 7 pasos (pre-K, K, grados 1 a 5) y el modelo leyo los niveles en orden, de menor a mayor dificultad. Dentro de cada fuente, los documentos se ordenaron por grado de lectura Flesch-Kincaid y se repartieron uniformemente por el rango de niveles de esa fuente; los documentos de matematicas se mantuvieron en o por encima del grado mas bajo que ensena los conceptos que utilizan. El modelo vio 6,3 mil millones de tokens, de los cuales 2,3 mil millones son unicos. La composicion por fuente (tokens unicos, en millones) es: TinyStories 522; Cosmopedia v2 (audiencia "children") 858; Cosmopedia v2 (audiencia "young children") 320; Cosmopedia v1 `auto_math_text` 157; ejercicios aritmeticos generados 361; transcripciones CHILDES de habla infantil (BabyLM 2026 Strict) 39; libros infantiles de Project Gutenberg 25; Orca Math Word Problems 21; Simple English Wikipedia 12; ScienceQA (solo texto, grados 1 a 5) 0,5. El desglose por nivel que publica la tarjeta del modelo aparece truncado en la informacion disponible. No se aplico RLHF, DPO ni ningun tipo de ajuste por instrucciones: es un modelo base puro. El tokenizer se entreno con una mezcla que incluia, ademas del texto infantil, una muestra amplia de ingles (Wikipedia, libros de texto, paginas web educativas, informes corporativos y foros) para no limitar el vocabulario al registro infantil.

## Capacidades

- Generacion de texto en ingles de nivel infantil: cuentos, narraciones cortas y prosa sencilla, el registro dominante en su entrenamiento.
- Aritmetica de primaria: los ejercicios aritmeticos generados (361 M de tokens unicos) cubren operaciones basicas y el modelo responde bien a formatos de taladro tipo `7 x 8 = `.
- Problemas matematicos verbales de nivel escolar, entrenados con Orca Math Word Problems y Cosmopedia `auto_math_text`.
- Ciencia elemental: ScienceQA (grados 1 a 5, solo texto) forma parte del curriculo, aunque con un volumen muy reducido (0,5 M de tokens).
- Habilidades cotidianas de dinero: contar monedas, ganar, gastar y ahorrar, segun declara el autor.
- Gramatica simple y continuacion de texto condicionada por prompt, con formatos de entrenamiento reconocibles: apertura de cuento, leccion, `Question: ...\nAnswer:` o taladro aritmetico.
- Soporte de tool calling / function calling: no disponible (no hay ajuste por instrucciones ni plantilla de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; solo ingles.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Generacion de cuentos infantiles: el modelo se puede usar para producir narraciones cortas y gramaticalmente simples a partir de una apertura, ajustando `temperature` y `top_p`; es el escenario mas alineado con su distribucion de entrenamiento (TinyStories y Cosmopedia "children" suman mas de 1.300 M de tokens unicos).
- Generacion de material didactico de lectura graduada: dado que el curriculo esta dividido por niveles Flesch-Kincaid, se puede condicionar el prompt para obtener texto de dificultad creciente y usarlo como borrador de fichas de lectura por grado.
- Taladros de aritmetica y problemas verbales: con prompts del tipo `7 x 8 = ` o `Question: ...\nAnswer:`, sirve para generar ejercicios y soluciones de nivel de primaria, integrable en un generador de hojas de practica.
- Investigacion sobre preentrenamiento ordenado por curriculum: es un artefacto pensado explicitamente para estudiar si el orden de dificultad afecta a la adquisicion del lenguaje; util para experimentos controlados con checkpoints y comparaciones frente a entrenamiento aleatorio.
- Investigacion sobre arquitecturas de atencion: las dos modificaciones (QK-norm y puerta de salida por cabeza) permiten estudiar su efecto en la estabilidad a learning rates altos en modelos de ~2 B, con codigo de modelado accesible en el repositorio.
- Generacion de datos sinteticos de nivel escolar: puede producir corpus auxiliares de texto sencillo (vocabulario controlado, frases cortas) para aumentar datasets educativos antes de filtrarlos y validarlos manualmente.
- Experimentacion en entornos con GPU de consumo: al ser un modelo de 2,05 B en bfloat16, cabe en GPUs de gama alta de consumo, lo que facilita prototipos docentes o de laboratorio sin infraestructura dedicada.
- Analisis del tokenizer: al tokenizar cada digito por separado, es util para estudiar el efecto de la tokenizacion numerica en tareas aritmeticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto estandar, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existen evaluaciones independientes conocidas.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 4,1 GB (2,05 B x 2 bytes), coherente con el tamano del repositorio declarado (4,1 GB).
- Memoria en inferencia: sumando pesos, cache KV y activaciones, el consumo realista ronda los 6-8 GB para una ventana de 2.048 tokens. La cache KV es pequena: 32 capas x 8 cabezas KV x 64 de tamano de cabeza x 2 (K y V) x 2 bytes = 64 KB por token, es decir unos 128 MB a 2.048 tokens y unos 256 MB a 4.096.
- Cuantizaciones hipoteticas (no publicadas): int8 en torno a 2,1 GB e int4 en torno a 1,1 GB. Al no haber pesos cuantizados oficiales, son valores derivados del numero de parametros, no cifras verificadas.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. En tarjetas de 8 GB es probable que funcione en bfloat16 con ventanas cortas, aunque sin margen para lotes grandes.
- GPU de datacenter: A100, H100 o L40S son mas que suficientes y permiten lotes grandes y mayor throughput; no son necesarias para inferencia individual.
- Opciones de despliegue: `transformers` (probado con la version 5.17 y torch 2.13), con `AutoModelForCausalLM` y `AutoTokenizer` usando `trust_remote_code=True`. vLLM, TGI, llama.cpp y Ollama no estan confirmados: el modelo incorpora codigo de modelado propio y no se han publicado pesos GGUF, por lo que requeriria portar la arquitectura antes de usarlos.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones directas ni benchmarks frente a otros modelos. La tabla siguiente recoge caracteristicas publicas de alternativas de tamano comparable, a modo de referencia de categoria; los datos de terceros proceden de sus respectivas tarjetas publicas y no de una evaluacion conjunta con ali-llm.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| ali-llm v0.1 | 2,05 B | 2.048 (RoPE a 4.096) | Apache 2.0 | Ingles | Modelo base, sin ajuste por instrucciones; requiere `trust_remote_code`; sin benchmarks publicados |
| SmolLM2 1.7B | 1,7 B | 8.192 | Apache 2.0 | Multilingue (dominante ingles) | Existe version base e instruct; una de sus fuentes de datos (smollm-corpus/Cosmopedia) tambien se uso en ali-llm |
| Qwen2.5 1.5B | ~1,5 B | 32.768 | Apache 2.0 | 29+ idiomas | Version base e instruct; mayor cobertura multilingue y de contexto |
| Gemma 2 2B | ~2,6 B | 8.192 | Terminos de uso de Gemma | Multilingue | Licencia no permisiva tipo Apache; pensado para uso general, no educativo |

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no tiene formato de chat y no responde a peticiones directas; hay que construir el prompt imitando el texto de entrenamiento.
- Sin ajuste de seguridad: el autor lo declara explicitamente. No hay filtros de contenido ni alineamiento, por lo que no es apto para exposicion directa a menores sin una capa de moderacion externa.
- Riesgo de alucinacion: es un modelo pequeno (2,05 B) entrenado en dominios muy concretos; fuera del registro infantil y de la aritmetica basica la probabilidad de generar contenido incorrecto o incoherente es alta.
- Cobertura idiomatica limitada: solo ingles. No hay soporte de castellano ni de otros idiomas.
- Contexto corto: entrenado a 2.048 tokens, con RoPE configurado a 4.096. El rendimiento mas alla de esas longitudes no esta garantizado ni documentado.
- Riesgo de seguridad al usar `trust_remote_code=True`: la arquitectura requiere ejecutar codigo incluido en el repositorio. Es imprescindible auditar `modeling_*.py` antes de cargarlo en un entorno de produccion.
- Compatibilidad de herramientas limitada: al usar una arquitectura propia, no se puede asumir que funcione en vLLM, llama.cpp, Ollama o TGI sin portar el modelo. No hay pesos GGUF publicados.
- Reproducibilidad y validacion: el repositorio tenia 0 descargas y 0 "likes" en el momento de la consulta y no hay benchmarks, evaluaciones independientes ni versiones posteriores. Es un artefacto de investigacion reciente, no un modelo validado en produccion.
- Trazas de datos sinteticos y web: parte del corpus procede de TinyStories y Cosmopedia (generados, con posible sesgo y errores factuales) y de una mezcla de vocabulario que incluye informes corporativos y foros, lo que puede introducir sesgos de registro y de dominio.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No se documentan restricciones adicionales, pero conviene verificar las licencias de los datasets de origen si se redistribuyen datos derivados.
- El desglose de tokens por nivel publicado en la tarjeta aparece truncado en la informacion disponible, por lo que no se puede verificar el reparto exacto entre grados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tzpranto/ali-llm-v0.1
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset BabyLM 2026 Strict: https://huggingface.co/datasets/BabyLM-community/BabyLM-2026-Strict
- Corpus SmolLM (incluye Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Cosmopedia v1: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Orca Math Word Problems 200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Paper, blog o demo especificos: no disponibles en la informacion proporcionada.
