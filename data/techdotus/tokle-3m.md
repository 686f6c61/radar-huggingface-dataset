# techdotus/Tokle-3M

## Resumen

Tokle-3M es un modelo de lenguaje decoder-only de 2,91 millones de parametros (2.908.944 exactos) desarrollado por techdotus (Tech.us Team) y publicado bajo licencia MIT. Su interes no esta en la capacidad de generacion, que es deliberadamente limitada, sino en la innovacion metodologica que introduce: SPAB (Static Pairwise Attention Bias), una tabla congelada de 8,39 millones de puntuaciones de asociacion entre pares de tokens construida a partir de Pointwise Mutual Information (PMI) sobre el corpus de entrenamiento, y que se inyecta en los logits de atencion antes del softmax mediante un hash de los IDs de query y key.

El modelo se entreno en dos fases sobre la misma mezcla de datos. En la primera (12.000 millones de tokens) la tabla SPAB estaba activa y el modelo contaba con 11,3 millones de parametros efectivos (2,91M entrenables mas 8,39M congelados). En la segunda fase se elimino la tabla y se entrenaron 500 millones de tokens adicionales para destilar ese sesgo en los propios pesos, de modo que la version publicada es autocontenida y funciona unicamente con sus 2,91M de parametros en inferencia.

Es relevante ahora como artefacto de investigacion sobre sesgos inductivos removibles en attention: demuestra que un prior estadistico externo puede transferirse a los pesos de un modelo minusculo sin perdida apreciable de rendimiento. Su tamano (144 dimensiones de hidden state, 9 capas, contexto de 512 tokens) lo situa en la categoria de small language models (SLM) para experimentacion, no para uso como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm, RoPE, GQA (multi-query attention) y SwiGLU |
| Parametros totales | 2.908.944 (2,91M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No se han publicado cuantizaciones oficiales; los pesos se distribuyen en FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, con codigo custom (trust_remote_code=True) |

Especificaciones adicionales de arquitectura aportadas por el autor:

| Parametro | Valor |
|---|---|
| Capas | 9 |
| Hidden size (d_model) | 144 |
| Cabezas de atencion | 3 |
| Cabezas KV (GQA) | 1 (multi-query attention) |
| Dimension por cabeza | 48 |
| Tamano intermedio FFN | 432 |
| Word embeddings compartidos | Si |
| Precision | Pesos en FP32 |
| Tokenizer | BPE de 5.048 tokens |
| Parametros en fase 1 (con SPAB) | 11,3M (2,91M entrenables + 8,39M congelados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only compacto con normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), atencion con agrupacion de cabezas en su variante mas agresiva (GQA con una sola cabeza KV, es decir, multi-query attention) y activacion SwiGLU en la FFN. El modelo tiene 9 capas, un hidden size de 144, 3 cabezas de atencion de 48 dimensiones cada una y un tamano intermedio de 432 en la FFN. La longitud maxima de secuencia es de 512 tokens y las tablas RoPE no se construyen mas alla de esa longitud. Los embeddings de entrada y de salida estan compartidos (tied word embeddings) y los pesos se publican en FP32.

La innovacion principal es SPAB (Static Pairwise Attention Bias). Durante la primera fase de preentrenamiento, para cada par query-key se aplicaba un hash sobre los dos IDs de token, se recuperaba su valor PMI de una tabla congelada de 8,39 millones de entradas y se escalaba por un factor aprendido por cabeza antes de sumarlo a los logits de atencion, justo antes del softmax. Esta tabla no se actualizaba por gradiente; aportaba un prior estadistico estatico extraido del corpus. Tras 12.000 millones de tokens con SPAB activo, la tabla se elimino y el modelo se entreno 500 millones de tokens mas para que los pesos absorbieran ese prior, resultando en un modelo autocontenido de 2,91M de parametros. El autor reporta que la version destilada iguala o supera ligeramente a la version con SPAB en varias tareas (34,85% frente a 34,68% en ARC-Easy, 55,01% frente a 54,95% en PIQA), con una ligera caida en HellaSwag, ARC-Challenge y ArithMark-3.

Los datos de entrenamiento son una mezcla curada con un pipeline de limpieza estricto. La composicion es: FineWeb-Edu (43,1%), Cosmopedia (24,3%), OpenMathInstruct-2 (13,5%), Tiny Strange Textbooks (9,0%), MegaScience con curacion propia de medicina y biologia (5,0%), High-Quality English Sentences (3,0%), ScienceQA (1,2%) y Orca-Math Word Problems 200k (0,9%). Todo el corpus se tokenizo con el tokenizer BPE de 5.048 tokens del propio modelo y se reservo un 1% como validacion. No se menciona en la informacion disponible ninguna fase de RLHF, DPO, instruction tuning o alineacion de seguridad.

## Capacidades

- Generacion de texto causal en ingles: continuacion de texto a nivel de frase corta, con resultados frecuentemente repetitivos o incoherentes segun el propio autor.
- Modelado de lenguaje a pequena escala: util como banco de pruebas de tecnicas de attention bias, destilacion de priors y ablaciones de arquitectura.
- Capacidad aritmetica y matematica basica: 40,80% en ArithMark-3 (0-shot, acc_norm), el mejor resultado de su categoria segun la comparativa publicada por el autor.
- Razonamiento de sentido comun muy limitado: 27,20% en HellaSwag y 23,98% en ARC-Challenge.
- Comprension lectora elemental: 34,85% en ARC-Easy y 55,01% en PIQA.
- Idiomas: exclusivamente ingles. No hay capacidades multilingues.
- Tool calling / function calling: no soportado. No hay evidencia de entrenamiento en formato de herramientas.
- Agentes y razonamiento multi-paso: no soportado. El modelo no esta instruction-tuned.
- Modo thinking, vision o audio: no disponible, ninguna de estas capacidades esta implementada.
- Formato de pesos en safetensors con codigo custom, cargable via `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.

## Casos de uso

- Investigacion sobre sesgos inductivos en atencion: reproducir el experimento SPAB frente al modelo destilado para estudiar si un prior PMI externo puede absorberse en los pesos. El repositorio incluye el modelo intermedio Tokle-SPAB-3M precisamente para esta comparacion.
- Ablaciones de arquitectura en SLMs: usar las 9 capas y el hidden size de 144 como configuracion de referencia para medir el efecto de cambiar GQA, RoPE o SwiGLU en modelos por debajo de 3M de parametros.
- Docencia y divulgacion: por su tamano, el modelo entero cabe en memoria de cualquier portatil y permite ejecutar y depurar un transformer completo desde CPU en segundos, util para cursos de mecanica interna de LLMs.
- Experimentos de destilacion: la fase 2 (0,5B tokens sin SPAB) sirve como caso documentado de destilacion de un prior externo hacia pesos, replicable en modelos mayores con otras formas de sesgo estatico.
- Estudios de tokenizacion de baja cardinalidad: el vocabulario BPE de 5.048 tokens es un caso extremo poco habitual que permite analizar el equilibrio entre tamano de vocabulario, cobertura y rendimiento en corpus educativos y matematicos.
- Inferencia en dispositivos con restricciones severas: con unos 11,6 MB de pesos en FP32 (5,8 MB en FP16), el modelo puede ejecutarse en microcontroladores, Raspberry Pi o entornos embebidos donde no cabe ningun otro transformer, para pruebas de concepto de generacion de texto muy acotada.
- Generacion de completados de frases en ingles dentro de dominios restringidos: con temperatura baja y penalizacion de repeticion (el ejemplo del autor usa `repetition_penalty=1.3`), puede producir continuaciones cortas sobre textos educativos o cientificos simples.

## Benchmarks y rendimiento

Resultados publicados por el autor, todos 0-shot acc_norm bajo la metodologia de Open SLM Leaderboard:

| Modelo | Parametros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---|---|---|---|---|---|---|
| Tokle-3M (Tech.us) | 2,91M | 8,92 | 27,20% | 34,85% | 23,98% | 55,01% | 40,80% |
| Ember-2 (SurjoLabs) | 2,96M x2 | 7,21 | 27,28% | 33,42% | 22,01% | 55,11% | 35,90% |
| BananaMind-2-Micro (BananaMind) | 2,9M | 6,01 | 28,27% | 33,12% | 21,93% | 53,21% | 34,00% |
| GPT-S-1.4M (Axiomic Labs) | 1,4M | 5,40 | 26,89% | 31,57% | 21,93% | 55,17% | 30,20% |

Ablacion publicada por el autor entre la fase 1 con SPAB activo y el modelo final destilado:

| Modelo | Parametros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---|---|---|---|---|---|---|
| Tokle-SPAB-3M | 11,3M (2,91M + 8,39M congelados) | 9,16 | 27,22% | 34,68% | 24,49% | 54,95% | 41,70% |
| Tokle-3M | 2,91M | 8,92 | 27,20% | 34,85% | 23,98% | 55,01% | 40,80% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,6 MB para los pesos en FP32 y unos 5,8 MB en FP16. El pico de memoria durante la carga con PyTorch y el runtime de transformers se situa en el orden de decenas de megabytes, no de gigabytes.
- GPU recomendadas: cualquier GPU sirve; el modelo es funcionalmente independiente de la GPU. Se puede ejecutar en CPU sin problema.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, integrada o dedicada, e incluso en CPU unicamente. Tambien cabe en dispositivos tipo Raspberry Pi y en entornos embebidos.
- Opciones de despliegue: la via documentada por el autor es transformers con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`, dado que el modelo usa codigo custom. No se ha publicado soporte oficial para vLLM, llama.cpp, Ollama o TGI, ni existen pesos en formato GGUF. Cualquier despliegue alternativo requeriria portar el codigo custom de la arquitectura.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia, tokens por segundo ni rendimiento en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Int Index | HellaSwag | ARC-Challenge | PIQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Tokle-3M (Tech.us) | 2,91M | 512 tokens | 8,92 | 27,20% | 23,98% | 55,01% | MIT | HuggingFace, safetensors |
| Ember-2 (SurjoLabs) | 2,96M x2 | no disponible | 7,21 | 27,28% | 22,01% | 55,11% | no disponible | no disponible |
| BananaMind-2-Micro (BananaMind) | 2,9M | no disponible | 6,01 | 28,27% | 21,93% | 53,21% | no disponible | no disponible |
| GPT-S-1.4M (Axiomic Labs) | 1,4M | no disponible | 5,40 | 26,89% | 21,93% | 55,17% | no disponible | no disponible |

Los datos de rendimiento de los modelos comparados proceden de Open SLM Leaderboard, segun indica el autor. La informacion disponible no detalla la licencia, el contexto ni la disponibilidad de los tres modelos alternativos.

## Limitaciones y advertencias

- Modelo minusculo: con 2,91M de parametros y un hidden state de 144 dimensiones, las generaciones son a menudo repetitivas, incoherentes o factualmente incorrectas. El propio autor lo describe como artefacto de investigacion, no como asistente.
- Contexto muy corto: 512 tokens maximo, sin tablas RoPE construidas mas alla de esa longitud. Cualquier tarea que requiera contexto largo queda descartada.
- Solo ingles: entrenado sobre texto web, educativo, sintetico y matematico en ingles. No hay capacidades multilingues.
- Sin instruction tuning ni alineacion de seguridad: el modelo no responde a instrucciones y puede reproducir sesgos presentes en los datos web (FineWeb-Edu, Cosmopedia y otras fuentes).
- Riesgo de alucinacion: alto en terminos relativos. Con un rendimiento de 23,98% en ARC-Challenge y 27,20% en HellaSwag, la generacion de hechos fiables no es un objetivo alcanzable.
- Restricciones de licencia: los pesos y el codigo se publican bajo MIT, lo que permite uso comercial y modificacion. Sin embargo, el uso comercial realista esta limitado por la calidad de salida, no por la licencia.
- Codigo custom: requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar codigo publicado por el autor. Conviene auditar el repositorio antes de integrarlo en un pipeline.
- Sin cuantizaciones ni formatos alternativos: no hay GGUF ni pesos cuantizados publicados, lo que limita el despliegue en runtimes que no sean transformers.
- Sin benchmarks adicionales: no hay datos publicos de MMLU, GSM8K, HumanEval ni evaluaciones de seguridad, generacion larga o robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/techdotus/Tokle-3M
- Modelo intermedio con SPAB activo: https://huggingface.co/techdotus/Tokle-SPAB-3M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset High-Quality English Sentences: https://huggingface.co/datasets/agentlans/high-quality-english-sentences
- Dataset Tiny Strange Textbooks: https://huggingface.co/datasets/nampdn-ai/tiny-strange-textbooks
- Dataset ScienceQA: https://huggingface.co/datasets/armanc/ScienceQA
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset Orca-Math Word Problems 200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Paper o publicacion tecnica de SPAB: no disponible (la model card solo incluye una cita BibTeX sin enlace a articulo)
