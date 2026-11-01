# VladHong/Spark-X2.6-4B-2GB-GGUF

## Resumen

Spark-X2.6-4B-2GB-GGUF es un repositorio de cuantizaciones GGUF del modelo XHToken/Spark-X2.6-4B, publicado por el usuario VladHong en Hugging Face. Contiene dos versiones comprimidas con calibración por matriz de importancia (imatrix): IQ3_M (2,04 GB) e IQ4_XS (2,38 GB), seleccionadas tras evaluar una escala completa de cuantizaciones con pruebas de perplejidad completas sobre wikitext-2 y verificaciones reales de capacidad en llama.cpp, incluyendo generación de código en chino.

El objetivo del repositorio es ofrecer los puntos óptimos de la escala de cuantización para ejecutar este modelo de 4.112 millones de parámetros en hardware muy modesto, incluso sin GPU: el archivo IQ3_M cabe en menos de 2,1 GB de memoria. El autor documenta con detalle la procedencia del imatrix, los hashes SHA256 y los resultados de pruebas reales, lo que añade transparencia poco habitual en repositorios de cuantización.

El modelo base es un modelo conversacional bilingüe (inglés y chino) con capacidades de agente, código y razonamiento, con un modo de pensamiento ("thinking") que puede desactivarse por petición. Es relevante para desarrolladores que buscan un modelo pequeño con soporte de chino de calidad y despliegue local en CPU o GPUs de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (arch `spark2_5` en llama.cpp, requiere b393 o superior) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible oficialmente; los ejemplos del repo usan 32.768 tokens (`-c 32768`) |
| Tipos de cuantizacion | IQ3_M (3,66 BPW, 2,04 GB) e IQ4_XS (4,69 BPW, 2,38 GB), ambas calibradas con imatrix; se incluye el imatrix para re-cuantizar a otros anchos |
| Idiomas soportados | ingles y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (sin safetensors en este repo; el modelo base XHToken/Spark-X2.6-4B dispone de pesos en F16, 8,23 GB) |

## Arquitectura y entrenamiento

La ficha del modelo base no documenta la arquitectura interna en detalle; lo unico conocido es que llama.cpp lo implementa bajo la arquitectura `spark2_5`, lo que indica que el modelo base Spark-X2.6-4B deriva de la familia SparkX2.5. Los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

Lo mejor documentado es el proceso de cuantizacion. El autor construyo un imatrix con `llama-imatrix` (contexto de 512 tokens) sobre una muestra de unos 113.000 tokens, equilibrada de forma round-robin entre wikitext-2-raw de validacion, el corpus de calibracion calibration_datav5 de bartowski, 13 capitulos del libro de texto chino de deep learning d2l-zh (25 % de densidad en chino) y codigo C++/Python de llama.cpp. El corpus se filtró contra una lista de contenidos bloqueados (contenido adulto, juego, spam, malware, insultos), descartando 17 parrafos. La muestra final tiene un 12,2 % de caracteres chinos, un detalle critico: un imatrix sin chino medía peor en todos los niveles (por ejemplo, IQ4_XS 29,55 frente a 27,97 de perplejidad).

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat que incluye un modo de razonamiento (`[Start thinking]`) activable o desactivable por peticion (`enable_thinking`).
- Generacion de codigo: en las pruebas del autor genera funciones correctas con tests (funcion de numeros primos con asserts) y quicksort; en chino, la variante IQ3_M produjo un quicksort completamente correcto verificado por simulacion sobre 8 arrays, mientras que IQ4_XS mostro bugs sutiles (pivote mal colocado o duplicados eliminados).
- Razonamiento matematico basico: resuelve operaciones con pasos intermedios (17 × 24 = 408 con pasos limpios en ambas cuantizaciones).
- Capacidades agenticas: planificacion multi-paso estructurada con uso de herramientas (por ejemplo, un plan de procesamiento de CSV basado en `read_file` con validacion de entradas).
- Resistencia a bucles de repeticion: sin loops en generaciones de 800 tokens en ambas variantes.
- El modelo base conserva la etiqueta `agent` y `coding`, lo que sugiere orientacion a tareas de agente y programacion.

## Casos de uso

- Asistentes locales en hardware modesto: con 2,04 GB (IQ3_M) el modelo cabe en la RAM de cualquier portatil moderno sin GPU dedicada, ideal para chatbots offline en dispositivos de bajos recursos.
- Generacion y explicacion de codigo en chino: IQ3_M es la unica cuantizacion de bajo bit cuyo codigo en chino supero la verificacion por simulacion, lo que la hace adecuada para asistentes de programacion con usuarios sinohablantes.
- Generacion de codigo en ingles con maxima calidad: IQ4_XS ofrece la mejor perplejidad por debajo de 3,5 GB, adecuado para autocompletado y revision de codigo en entornos con recursos limitados.
- Agentes con planificacion multi-paso: el modelo genera planes estructurados de varios pasos con uso de herramientas, util para pipelines de automatizacion ligeros ejecutados en local (por ejemplo, lectura y procesamiento de ficheros CSV).
- Despliegue en servidores compatibles con OpenAI: puede exponerse mediante `llama-server` con `chat_template_kwargs: {"enable_thinking": false}` para respuestas cortas y directas en integraciones de API.
- Experimentacion de cuantizacion: el imatrix incluido permite re-cuantizar el modelo a cualquier otro ancho de bits con `llama-quantize`, util para investigadores que exploran el compromiso calidad/tamano.
- Razonamiento con presupuesto ampliado: con thinking activado y un `max_tokens` generoso, sirve para tareas que se benefician de razonamiento explicito previo a la respuesta.

## Benchmarks y rendimiento

No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos medidos por el autor del repo son:

| Variante | Tamano | Perplejidad (wikitext-2, ctx 512) | Δ vs F16 | Incluida en el repo |
|---|---|---|---|---|
| F16 (modelo base) | 8,23 GB | 26,53 ± 0,24 | — | no |
| Q4_K_M (repo upstream, sin imatrix) | 3,54 GB | 27,81 ± 0,25 | +4,8 % | no |
| IQ4_XS + imatrix | 2,38 GB | 27,97 ± 0,26 | +5,4 % | si |
| Q3_K_M + imatrix | 2,17 GB | 36,75 | +38,5 % (descartada) | no |
| IQ3_M + imatrix | 2,04 GB | 30,49 ± 0,27 | +14,9 % | si |
| IQ3_XXS + imatrix | 1,80 GB | 30,65 ± 0,28 | +15,5 % (fallo en prueba real zh) | no |
| IQ2_M + imatrix | 1,55 GB | 60,03 ± 0,56 | +126 % (descartada) | no |

Mediciones de velocidad en CPU (llama.cpp b393, 24 hilos): IQ3_M ~22–23 tok/s; IQ4_XS ~26 tok/s.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 2,04 GB para IQ3_M y 2,38 GB para IQ4_XS (mas el KV cache, que crece con el contexto; con 32.768 tokens de contexto añade memoria adicional).
- GPU recomendadas: no requiere GPU; funciona en CPU pura. En GPUs, cualquier tarjeta con 4 GB o mas de VRAM (por ejemplo, RTX 3060 o superior, o GTX 1660 con ajustes) lo ejecuta con holgura.
- Consumer GPUs: cabe sin problemas en practicamente cualquier GPU moderna de consumo; incluso en portatiles sin GPU dedicada, dado que el peso completo cabe en RAM del sistema.
- Opciones de despliegue: llama.cpp (b393 o superior, arquitectura `spark2_5`) es el runtime documentado; cualquier servidor compatible con GGUF y plantillas de chat de llama.cpp (llama-server, Ollama si soporta la arquitectura, LM Studio) deberia funcionar, aunque solo llama.cpp esta verificado en la documentacion.
- Latencia y throughput estimados: ~22–23 tok/s (IQ3_M) y ~26 tok/s (IQ4_XS) en CPU con 24 hilos; en GPU moderna se esperan velocidades notablemente superiores, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-2GB-GGUF (este repo) | 4,11 B | IQ3_M 2,04 GB / IQ4_XS 2,38 GB | 32.768 en ejemplos (oficial: no disponible) | Apache 2.0 | Bilingue en/zh, thinking mode, verificado con imatrix y pruebas reales |
| Spark-X2.6-4B (base, XHToken) | 4,11 B | F16, 8,23 GB | no disponible | Apache 2.0 | Referencia de calidad (PPL 26,53); requiere 4 veces mas memoria |
| Qwen3-4B (categoria similar, 4B bilingue en/zh) | 4 B | GGUF en multiples anchos | hasta 32.768+ | Apache 2.0 | Alternativa consolidada con ecosistema mas maduro; sin datos de benchmark comparativo publicados en esta ficha |

No se han publicado benchmarks comparativos directos frente a otros modelos en la informacion disponible, por lo que la comparativa se limita a caracteristicas declaradas.

## Limitaciones y advertencias

- Verbosidad del modo thinking: es un rasgo del modelo base, no de la cuantizacion; con thinking activado, un presupuesto de 500–900 tokens puede consumirse por completo en el bloque `[Start thinking]` antes de la respuesta final. Conviene desactivarlo (`enable_thinking: false`) para respuestas cortas y dar un `max_tokens` generoso cuando este activo.
- Diferencia de calidad entre cuantizaciones en chino: IQ4_XS genera codigo en chino con bugs sutiles (pivote mal colocado en modo sin thinking, duplicados eliminados en modo thinking, 3–4 de 8 arrays incorrectos); para codigo en chino, usar IQ3_M.
- Degradacion por cuantizacion: IQ3_M pierde un 14,9 % de perplejidad respecto a F16, una perdida apreciable para tareas sensibles a matices.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; como cualquier modelo de 4B, debe esperarse riesgo de alucinacion, especialmente en conocimiento factual y matematicas complejas.
- Contexto oficial no documentado: la ficha no especifica la longitud de contexto del modelo base; los 32.768 tokens de los ejemplos no son necesariamente el maximo soportado.
- Idiomas: el modelo esta orientado a ingles y chino; su rendimiento en espanol u otros idiomas no esta documentado y probablemente sea inferior.
- Sesgos: no hay documentacion de sesgos; el corpus de calibracion del imatrix fue filtrado, pero eso no elimina sesgos del modelo base.
- Compatibilidad: requiere llama.cpp b393 o superior por la arquitectura `spark2_5`; runtimes alternativos pueden no soportarla todavia.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, aunque conviene verificar la licencia del modelo base original.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/VladHong/Spark-X2.6-4B-2GB-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Paper, blog oficial o demos: no disponibles en la informacion proporcionada.
