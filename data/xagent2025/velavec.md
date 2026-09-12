# xagent2025/VelaVec

## Resumen

VelaVec es un codificador de recuperacion (retrieval encoder) ligero desarrollado por el usuario xagent2025 y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo de embeddings de frase y documento, no de un modelo generativo: su funcion es convertir texto en vectores de 256 dimensiones para tareas de similitud semantica, busqueda semantica y clasificacion por vecinos mas cercanos. Esta construido como un hibrido entre una tabla estatica congelada y atencion bidireccional, con solo 9.782.016 parametros (frente a los 33 millones de su profesor) y un peso de repositorio de 0,1 GB.

El modelo deriva de BAAI/bge-small-en-v1.5 mediante destilacion en cinco dominios (NLI, STS, MS MARCO, SciFact, NFCorpus y ArguAna). Su propuesta diferencial es la latencia: incorpora una ruta de inferencia escrita en Rust, sin runtime de Python, con kernels NEON y grafos GEMM preempaquetados para BNNS/CoreML, lo que permite ejecutarlo en hardware de borde. Con una sola consulta de 15 tokens tarda 103 microsegundos en CPU, unas 53,9 veces mas rapido que el modelo profesor.

Es relevante ahora porque cubre un nicho concreto: recuperacion de bajisima latencia en dispositivos sin GPU dedicada, donde modelos de embeddings mas grandes resultan demasiado costosos en arranque en frio (5,4 ms en Rust frente a unos 29 s en PyTorch) o en memoria. La contrapartida es un alcance limitado en dominios fuera de distribucion y un soporte exclusivo de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: tabla estatica congelada de 30.522x256 (destilada de embeddings de token de bge-small + PCA) + 3 bloques transformer bidireccionales (RMSNorm, RoPE, SwiGLU FFN) + attention pooling con dos cabezas (dual-head) |
| Parametros totales | 9.782.016 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (max_len=256 en evaluacion); optimo con consultas de <=64 tokens y documentos de hasta 256 tokens |
| Tipos de cuantizacion | no disponible; el repositorio distribuye unicamente pesos en fp32 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, PyTorch) y weights.bin (39 MB, fp32, layout dual-head para el motor Rust) |

## Arquitectura y entrenamiento

El tronco combina dos componentes. Primero, una tabla estatica congelada de 30.522 x 256 que sustituye a la matriz de embeddings clasica y que se obtuvo destilando los embeddings de token del profesor bge-small y aplicando despues PCA hasta 256 dimensiones. Sobre esa tabla se apilan tres bloques transformer bidireccionales con RMSNorm, RoPE y FFN de tipo SwiGLU, seguidos de una capa de attention pooling. El resultado son dos cabezas de pooling: `head=0` para semantica simetrica (similitud y STS) y `head=1` para recuperacion asimetrica (consulta frente a documento). Un solo tronco, dos usos.

El entrenamiento es una destilacion multitarea en cinco dominios (NLI, STS, recuperacion con MS MARCO y los conjuntos SciFact, NFCorpus y ArguAna) que combina regresion sobre los embeddings del profesor, destilacion relacional e InfoNCE, con las cabezas simetrica y de recuperacion entrenadas de forma conjunta. El tronco hibrido se inicializo en caliente a partir de una ejecucion de recuperacion previa. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO. La tokenizacion reutiliza la del modelo base BAAI/bge-small-en-v1.5, incluida en el repositorio. No hay decodificacion especulativa ni atencion lineal: la innovacion esta en el preempaquetado de kernels y en la ruta de inferencia nativa en Rust.

## Capacidades

- Generacion de embeddings de frase y documento de 256 dimensiones, tanto simetricos (`head=0`) como asimetricos consulta-documento (`head=1`).
- Similitud semantica y correlacion con juicios humanos en tareas tipo STS (STS12 y STSBenchmark).
- Recuperacion de pasajes en dominios en distribucion (NLI r@1 = 0,912; MS MARCO dev r@1 = 0,694 sobre un conjunto de 1.000 candidatos).
- Clasificacion por kNN, con una exactitud de 0,8365 en Banking77 (ligeramente por encima del profesor, 0,8175).
- Recuperacion cientifica y de argumentacion con precision reducida (SciFact, ArguAna y NFCorpus rinden entre el 72,7 % y el 87,6 % del profesor).
- Uso sin dependencia de `transformers` para la inferencia en Python, mediante el modulo autonomo `modeling_velavec.py`.
- Inferencia nativa en Rust con resultados identicos bit a bit al forward de PyTorch (max |Δ| = 0).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- No dispone de modo de razonamiento (thinking mode) ni de prompts de instruccion: esta entrenado sin prompts y debe usarse tal cual.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- Busqueda semantica en dispositivos de borde: con 103 microsegundos por consulta de 15 tokens en CPU y sin runtime de Python, el modelo puede resolver consultas de similitud dentro de una aplicacion movil o de escritorio con presupuesto de latencia muy estricto.
- Deduplicacion y agrupamiento de documentos a gran escala: el motor Rust procesa alrededor de 11.500 elementos por segundo en datos NLI (2 hilos), lo que permite recorrer corpus grandes calculando embeddings y agrupando por similitud de coseno.
- Clasificacion de intenciones en tiempo real: gracias a su exactitud kNN de 0,8365 en Banking77, sirve como clasificador ligero de intenciones en asistentes conversacionales o enrutadores de tickets.
- Primer nivel de filtrado en pipelines RAG: usar `head=1` para preseleccionar candidatos baratos antes de un reranker o de un LLM generativo reduce el coste total del pipeline.
- Aplicaciones offline en Rust sin Python: el arranque en frio de 5,4 ms hace viable embarcar el modelo en herramientas de linea de comandos o servicios que no pueden asumir los aproximadamente 29 segundos de arranque de PyTorch.
- Recuperacion de FAQ y soporte al cliente en ingles: con `head=1` se pueden emparejar preguntas de usuario con respuestas ya redactadas de una base de conocimiento, siempre que el dominio este cubierto por los datos de entrenamiento.
- Deteccion de similitud en aplicaciones macOS/iOS: los kernels BNNS/CoreML y NEON estan pensados para hardware Apple, lo que facilita integrarlo en apps nativas.
- Recuperacion cientifica o de argumentacion: aplicable a SciFact, NFCorpus y ArguAna, aunque con una calidad del 72,7 % al 87,6 % respecto al profesor, lo que exige validar el umbral de aceptacion antes de produccion.

## Benchmarks y rendimiento

Resultados MTEB publicados en la model card (sin prompts, max_len=256, CPU):

| Tarea | VelaVec | bge-small (profesor) | % respecto al profesor |
|---|---|---|---|
| STS12 (cosine spearman) | 0,7117 | 0,7744 | 91,9 % |
| STSBenchmark | 0,7596 | 0,8586 | 88,4 % |
| Banking77 (kNN acc) | 0,8365 | 0,8175 | 102,3 % |
| SciFact (ndcg@10) | 0,6310 | 0,7200 | 87,6 % |
| ArguAna (ndcg@10) | 0,4560 | 0,5950 | 76,6 % |
| NFCorpus (ndcg@10) | 0,2449 | 0,3371 | 72,7 % |

Recuperacion interna en los propios conjuntos de evaluacion del autor: NLI r@1 = 0,912 y MS MARCO dev r@1 = 0,694 sobre un conjunto de 1.000 candidatos.

Metricas de latencia y rendimiento declaradas (CPU, comparadas con el profesor bge-small):

| Metrica | VelaVec | Profesor | Ratio |
|---|---|---|---|
| Parametros | 9,8 M | 33 M | 30 % |
| Dimension de embedding | 256 | 384 | no disponible |
| Latencia de consulta (CPU) | 103 µs | 5,5 ms | 53,9x |
| Latencia de documento, 128 tokens (CPU) | ~580 µs (2 hilos) | 13 ms | ~22x |
| Arranque en frio | 5,4 ms (Rust) | ~29 s (PyTorch) | ~2.600x |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; esos benchmarks no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 39 MB de pesos en fp32 (coincide con el tamano del archivo `weights.bin`); en fp16 serian unos 20 MB, pero no se distribuyen pesos en fp16. La huella total, sumando activaciones, se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquiera, incluida una GPU integrada. No necesita A100 ni H100; el modelo esta disenado para CPU y hardware de borde.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y tambien en equipos sin GPU dedicada.
- Opciones de despliegue: motor nativo en Rust (BNNS/CoreML + kernels NEON) y modulo de inferencia autonomo en Python (`modeling_velavec.py`, sin dependencia de `transformers`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni exportacion a ONNX.
- Latencia y throughput declarados: 103 µs por consulta de 15 tokens, ~580 µs por documento de 128 tokens a 2 hilos (~780 µs a 1 hilo), arranque en frio de 5,4 ms, ~11.500 elementos/s en NLI y ~2.900 pasajes/s de MARCO con 2 hilos.
- Requisito de tokenizador: utiliza el tokenizador de BAAI/bge-small-en-v1.5, incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Dim. embedding | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| xagent2025/VelaVec | 9,8 M | 256 | 256 tokens (operativo) | MIT | Ver tabla de benchmarks |
| BAAI/bge-small-en-v1.5 (profesor) | 33 M | 384 | 512 tokens | MIT | Ver columna profesor en la tabla de benchmarks |
| all-MiniLM-L6-v2 | ~22,7 M | 384 | 256 tokens | Apache-2.0 | no disponible en esta ficha |
| BAAI/bge-micro-v2 | ~17 M | 384 | 512 tokens | MIT | no disponible en esta ficha |

VelaVec es el mas pequeno del grupo en parametros y dimension de embedding, y el unico que ofrece una ruta de inferencia nativa en Rust. Frente a los otros modelos de embeddings ligeros, no se dispone de datos comparativos de rendimiento en esta informacion mas alla de los resultados MTEB frente al profesor. La comparativa de licencias favorece a VelaVec y a bge-small/micro (MIT), mientras que all-MiniLM-L6-v2 usa Apache-2.0.

## Limitaciones y advertencias

- Dominios fuera de distribucion (medico, cientifico y de debate) rinden entre el 73 % y el 88 % respecto al profesor; segun el autor, el tronco congelado de 9,8 M no absorbe por completo el conocimiento de dominio del modelo de 33 M.
- Enfoque en entradas cortas: el rendimiento optimo se da con consultas de hasta 64 tokens; los documentos no deberian superar los 256 tokens.
- No admite prompts de instruccion. Fue entrenado sin ellos y debe usarse tal cual, sin plantillas de tarea.
- Solo soporta ingles; no hay capacidades multilingues.
- El modelo no genera texto, por lo que el riesgo de alucinacion en el sentido generativo no aplica, pero si puede recuperar documentos incorrectos o mal ordenados, especialmente en los dominios con peor rendimiento (NFCorpus 0,2449 ndcg@10).
- Los datos de entrenamiento incluyen MS MARCO, distribuido bajo licencia de investigacion. Aunque el modelo se libera como MIT, conviene revisar el caso de uso comercial antes de desplegarlo en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y una fecha de creacion muy reciente; no hay validacion independiente ni revision por pares de los resultados publicados.
- No se documenta el numero total de tokens de entrenamiento ni un analisis de sesgos; los sesgos heredados del profesor bge-small y de los conjuntos de datos (NLI, MS MARCO, SciFact) no se han cuantificado.
- No se distribuyen pesos cuantizados (GGUF, int8, fp16), lo que limita las opciones de despliegue a aquellos entornos capaces de ejecutar fp32 o de cuantizar por su cuenta.
- El modulo de inferencia Python (`modeling_velavec.py`) y el motor Rust no son librerias estandar (no siguen la API de sentence-transformers ni de ONNX Runtime), lo que aumenta el coste de integracion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xagent2025/VelaVec
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Enlaces relevantes en la busqueda web: no disponible (los resultados recuperados no guardan relacion con el modelo).
