# Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje y vision (image-text-to-text) de tipo mezcla de expertos dispersa (sparse MoE) desarrollado por el equipo Qwen (Alibaba). La ficha que nos ocupa, sin embargo, no es el checkpoint oficial, sino una conversion comunitaria a formato MLX realizada por el usuario Vontra (bajo la marca TensorFold): una cuantizacion mixta de 4 bits denominada oQ4, generada directamente desde los pesos BF16 oficiales y con el bloque nativo de prediccion multi-token (MTP) preservado para decodificacion especulativa.

El interes de esta conversion es practico: permite ejecutar un modelo de aproximadamente 180 000 millones de parametros totales en Apple Silicon mediante MLX, con un peso en disco de 113,33 GB y una ventana de contexto configurada de 262 144 tokens. La arquitectura, etiquetada como `qwen4_exp`, combina Gated DeltaNet, Qwen Sparse Attention, capas MoE con 512 expertos enrutados (10 activos mas 1 compartido) y tablas de embeddings hasheadas de n-gramas (bigramas y trigramas) que por si solas suman 51 000 millones de parametros.

Es relevante ahora porque demuestra que un modelo frontera de tipo MoE con vision y contexto de 256K puede distribuirse en un unico repositorio de ~113 GB y ejecutarse en hardware de consumo profesional de Apple, con velocidades medidas de entre 17 y 40 tokens por segundo en un M3 Studio segun el tipo de tarea. La contrapartida es una dependencia estricta de runtimes con soporte explicito para `qwen4_exp` y MTP nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE + embeddings hasheados de n-gramas) |
| Parametros totales | 179 999 981 459 (~180B) |
| Parametros activos | 6B (125B en el modelo de lenguaje, 51B en embeddings de n-gramas) |
| Longitud de contexto | 262 144 tokens configurados |
| Tipos de cuantizacion | oQ4 mixta: base 4-bit affine con 232 modulos protegidos a 5/8 bits; group size 32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (22 shards, 3 747 tensores, 113,33 GB / 105,54 GiB) |
| Capas | 48 |
| Expertos enrutados / activos | 512 / 10, mas 1 compartido |
| Cabezas de atencion / KV | 24 / 2 |
| Hidden size | 2 560 |
| Bloques MTP nativos | 1 (bloque draft Qwen4Exp, 76 tensores convertidos) |
| Libreria | mlx (mlx-vlm) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente, `qwen4_exp`, es un transformer hibrido con mezcla de expertos dispersa. Combina tres mecanismos principales: capas Gated DeltaNet (atencion lineal con estado recurrente), Qwen Sparse Attention y capas MoE con 512 expertos enrutados de los que se activan 10 por token, mas un experto compartido siempre activo. El modelo de lenguaje tiene 48 capas, hidden size de 2 560 y una relacion de 24 cabezas de atencion frente a solo 2 cabezas KV, lo que reduce drasticamente el coste de cache KV en contextos largos. Ademas incorpora flujos residuales con compuertas ensanchadas y tablas de embeddings hasheadas de bigramas y trigramas (51B parametros) que amplian la capacidad efectiva sin incrementar el coste por token.

La innovacion mas relevante para el despliegue es el bloque nativo de prediccion multi-token (MTP): una capa draft integrada en el propio checkpoint que habilita decodificacion especulativa sin necesidad de un modelo borrador externo. La model card advierte explicitamente de que no debe acoplarse un drafter de Qwen3.8 27B, ya que Flash Next tiene dimensiones ocultas distintas y su propio bloque MTP coincidente.

Sobre el entrenamiento no hay datos disponibles en la informacion proporcionada: no se especifican el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Toda esa informacion remite a la model card original de Qwen, no incluida aqui. Respecto a la conversion, el autor indica que se midio la sensibilidad por capas con un proxy local validado, se reconstruyeron los 3 747 tensores desde el checkpoint BF16 oficial, se valido la estructura de los 22 shards y se comprobo en generacion real la completacion determinista, el chat con instrucciones exactas, la coherencia conversacional, la telemetria MTP y el rollback de cache.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262 144 tokens.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text), con procesador de vision preservado del modelo original.
- Razonamiento y respuesta a instrucciones, incluyendo modo de instrucciones exactas verificado en las pruebas del autor.
- Decodificacion especulativa nativa mediante MTP, con tasas de aceptacion del borrador medidas entre el 58,3 % y el 89,5 %.
- Eficiencia de inferencia por arquitectura MoE: solo 6B parametros activos por token pese a los ~180B totales.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede mantener dialogos multi-turno con contexto muy largo gracias a sus 262 144 tokens, y las pruebas del autor muestran 39,7 tokens/s en chat casual sobre un M3 Studio, suficiente para interaccion en tiempo real.
- Analisis de documentos extensos con imagenes: al ser un modelo vision-language con ventana de 256K, permite procesar informes, capturas o diagramas junto a texto largo en una sola pasada, util para revision de contratos, auditoria documental o extraccion de datos de PDF escaneados.
- Prototipado e investigacion en estaciones de trabajo Mac: investigadores que necesiten evaluar un MoE de 180B sin acceso a clusters de GPU pueden desplegar esta conversion en un unico equipo con memoria unificada amplia, usando oMLX o MLX-VLM.
- Generacion asistida con baja latencia en local: la decodificacion especulativa MTP con aceptacion de hasta el 89,5 % reduce el numero de pasos de decodificacion, lo que resulta adecuado para autocompletado, resumenes y respuestas cortas donde importa el tiempo hasta el primer token util.
- Desarrollo y depuracion de runtimes MLX: el repositorio sirve como banco de pruebas para validar soporte de `qwen4_exp`, carga estricta de tensores MTP y reconciliacion de cache en implementaciones propias.
- Procesamiento por lotes de contenido multimodal en local: tareas de etiquetado de imagenes, generacion de descripciones o clasificacion de contenido pueden ejecutarse de forma desatendida en hardware Apple, evitando enviar datos a servicios en la nube.
- Evaluacion comparativa de tecnicas de cuantizacion: la asignacion mixta oQ4 con 232 modulos protegidos a 5/8 bits permite estudiar el impacto de la cuantizacion selectiva en un modelo de gran escala con embeddings hasheados de group size 32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta mediciones de velocidad de inferencia en un Apple M3 Studio con MTP nativo activado en oMLX:

| Prueba | Tokens de salida | Velocidad |
|---|---:|---:|
| Completacion directa, primera ejecucion medida | 32 | 29,4 tokens/s |
| Completacion directa, en caliente | 32 | 34,4 tokens/s |
| Chat con instrucciones exactas | 27 | 17,4 tokens/s |
| Chat casual | 71 | 39,7 tokens/s |

Las dos ejecuciones deterministas de completacion directa produjeron salida identica; la prueba de instrucciones exactas devolvio `hello`; la conversacion larga se completo de forma coherente sin repeticiones ni errores de reconciliacion de cache. La aceptacion del borrador MTP se situo entre el 58,3 % y el 89,5 %. El autor advierte de que los resultados varian con la longitud del prompt, el estado de la cache, los parametros de muestreo, la version del runtime y la presion de memoria.

## Requisitos de hardware

- Memoria: el peso en disco es de 113,33 GB (105,54 GiB); se necesita memoria unificada holgada por encima de esa cifra para pesos, cache KV y overhead del runtime. No se especifica un minimo oficial en la informacion disponible.
- Hardware validado: Apple M3 Studio con MTP nativo en oMLX.
- GPU NVIDIA: no hay datos de despliegue ni rendimiento en A100, H100 o RTX 4090 en la informacion proporcionada; el formato MLX es especifico de Apple Silicon.
- GPU de consumo: no aplica en el sentido habitual; el modelo esta pensado para Apple Silicon con memoria unificada amplia. No cabe en GPUs de consumo con 24 GB ni en configuraciones de 48 GB.
- Runtimes compatibles: oMLX o MLX-VLM con soporte explicito de `qwen4_exp` y MTP nativo. Los runtimes estandar que no construyan el modulo MTP de Qwen4Exp pueden rechazar los 76 tensores MTP durante la carga estricta de pesos.
- Latencia y throughput: 17,4 a 39,7 tokens/s medidos en M3 Studio segun la tarea; sin datos para otro hardware.
- Despliegue en vLLM, llama.cpp, Ollama o TGI: no disponible; la conversion es de formato MLX y no se indica compatibilidad con esos motores.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La comparacion se limita a lo que se puede contrastar estructuralmente con el propio modelo base y con la advertencia del autor sobre el drafter de Qwen3.8 27B:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP | ~180B totales / 6B activos | 262 144 | MLX safetensors oQ4 | qwen-community-1.0 | Conversion comunitaria con MTP nativo |
| Qwen/Qwen3.8-Flash-Next | 125B LM + 51B embeddings | 262 144 | BF16 (original) | qwen-community-1.0 | Modelo base oficial |
| Qwen3.8 27B (drafter) | 27B | no disponible | no disponible | no disponible | Incompatible como drafter de Flash Next por dimensiones ocultas distintas |

No hay datos disponibles sobre MMLU, HumanEval, GSM8K ni otras evaluaciones que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es una conversion comunitaria, no una release oficial de Qwen; el autor lo declara explicitamente.
- Requiere runtimes con soporte explicito de `qwen4_exp` y MTP nativo; los runtimes estandar pueden fallar al cargar los 76 tensores MTP en modo estricto.
- No debe acoplarse un drafter de Qwen3.8 27B: las dimensiones ocultas no coinciden y el modelo ya incluye su propio bloque MTP.
- La cuantizacion oQ4 mixta introduce perdida de precision respecto al BF16 original; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- Riesgo de alucinacion: no hay datos especificos en la informacion disponible, pero es un riesgo inherente a los modelos generativos de gran escala.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Licencia Qwen Community License 1.0: es una licencia "other" con terminos propios; deben revisarse las condiciones de uso comercial en el texto incluido en el repositorio antes de desplegar en produccion.
- El rendimiento medido corresponde a un unico equipo (M3 Studio) y a pruebas de pocas decenas de tokens; no hay evidencia de comportamiento sostenido en contextos de 262K ni en cargas concurrentes.
- El tamano de 113 GB limita el despliegue a equipos con memoria unificada muy amplia; no es viable en GPUs de consumo convencionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre el modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Repositorio MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Sitio de TensorFold: https://tensorfold.dev
- Sitio de Qwen: https://qwen.ai/
- Licencia Qwen Community License 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP/blob/main/LICENSE
