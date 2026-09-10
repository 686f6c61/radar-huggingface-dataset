# Ttimms/Spark-X2.5-4B-NVFP4

## Resumen

Spark-X2.5-4B-NVFP4 es una version cuantizada del modelo XHToken/Spark-X2.5-4B, publicada por el usuario Ttimms. Se trata de un build de pesos en NVFP4 con esquema W4A16 (pesos de 4 bits en formato float agrupados en bloques de 16 elementos con escalas de bloque en FP8, activaciones en bf16), generado con llm-compressor 0.13 y almacenado en formato compressed-tensors. El modelo base es un transformer de ~4,11 mil millones de parametros con `Spark2_5ForCausalLM` como clase de arquitectura, atencion hibrida deslizante/completa, una puerta de salida de atencion por cabeza (`self_attn.g_proj`) y una ventana de contexto declarada de 1 millon de tokens. Solo se distribuyen pesos; no hay entrenamiento nuevo, es una conversion de precision.

El problema que resuelve es el de la huella de memoria: el build ocupa 2,7 GiB en disco frente a los 7,7 GiB del base en bf16, una reduccion aproximada del 65 %. Esto permite servir un modelo de 4B con contexto largo en tarjetas de 16 GB, dejando alrededor de 10 GiB de margen para la cache KV (recomendada en fp8). No obstante, el autor advierte que este build concreto usa redondeo RTN sin datos y pierde unos 8,5 puntos porcentuales en HumanEval-instruct respecto al base bf16, por lo que un build con redondeo GPTQ esta en preparacion.

Es relevante ahora porque es, segun la model card, el primer build NVFP4 / 4-bit en compressed-tensors de Spark-X2.5-4B y esta orientado a servir en vLLM sobre hardware Blackwell mediante un plugin fuera del arbol oficial. En SM120 (GeForce RTX 50) la ruta weight-only decodifica a traves del kernel Marlin hacia una GEMM en bf16, sin computo FP4 nativo, de modo que la ventaja es de espacio, no de velocidad bruta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Spark2_5ForCausalLM`; transformer con atencion hibrida (deslizante y completa) y puerta de salida de atencion por cabeza (`self_attn.g_proj`) |
| Parametros totales | 4.112.079.360 (~4,11 B) |
| Parametros activos | no aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | 1.000.000 de tokens en el modelo base; el ejemplo de servicio usa `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4 W4A16 (4-bit float, bloques de 16 elementos, escalas de bloque FP8, activaciones bf16); el modelo base dispone tambien de build FP8 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (heredada de XHToken/Spark-X2.5-4B) |
| Formato de pesos | safetensors en formato compressed-tensors; requiere `custom_code` y `--trust-remote-code` |

## Arquitectura y entrenamiento

El modelo base es `XHToken/Spark-X2.5-4B`, un transformer de aproximadamente 4,1 B de parametros con atencion hibrida que combina capas de atencion deslizante y ventanas de atencion completa, lo que permite manejar contexto largo con un coste de cache KV mas contenido. Incorpora una puerta de salida de atencion especifica por cabeza (`self_attn.g_proj`), un componente que el autor del modelo base excluye de la cuantizacion INT8, y que en este build NVFP4 tambien se mantiene en bf16 junto con `lm_head` y los embeddings atados.

No se ha realizado ningun entrenamiento nuevo: se trata de una cuantizacion post-entrenamiento. El proceso emplea `llm-compressor` 0.13 con `QuantizationModifier(scheme="NVFP4A16", targets="Linear")`, excluyendo `lm_head`, todas las proyecciones `self_attn.g_proj` y los embeddings atados. El redondeo usado en esta revision (2026-09-10) es RTN puro, sin datos de calibracion, lo que explica la perdida de calidad documentada. El autor indica que existe un build con redondeo GPTQ en curso, con una recuperacion estimada de unos 4 puntos porcentuales sobre la perdida de RTN en un modelo de tamano comparable.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Generacion de codigo y resolucion de tareas de programacion: el build documenta un `pass@1` de 71,34 % en HumanEval-instruct con la cuantizacion RTN, frente a 79,88 % del base bf16.
- Soporte de tool calling / function calling mediante el parser `spark25` de vLLM (`--enable-auto-tool-choice --tool-call-parser spark25`).
- Orientado a flujos agente y razonamiento multi-paso, segun las etiquetas del repositorio (`code`, `agentic`).
- Contexto largo de hasta 1 M de tokens declarado en el modelo base (con `--max-model-len` configurable en el servicio; el ejemplo usa 32.768).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- No se documenta una capacidad multilingue mas alla de ingles y chino.

## Casos de uso

- Asistencia de codigo en estaciones de trabajo con GPU consumer: con 2,7 GiB de pesos y margen de unos 10 GiB para cache KV en una tarjeta de 16 GB, se puede servir el modelo integrado en un IDE o en un asistente local de generacion de codigo, asumiendo la perdida de calidad de este build RTN.
- Agentes de codigo multi-paso en pipelines de CI/CD: soporta tool calling con el parser `spark25`, lo que permite conectarlo a herramientas externas (ejecucion de tests, linters, APIs de repositorio) dentro de un bucle de agente.
- Analisis de repositorios completos o monorepos: la ventana de 1 M de tokens del modelo base permite pasar grandes volumenes de codigo y documentacion en una sola peticion, reduciendo la necesidad de fragmentar el contexto.
- RAG sobre documentacion tecnica extensa: combinando contexto largo con `--kv-cache-dtype fp8`, es viable indexar manuales y documentacion de producto en contexto sin recortes agresivos.
- Atencion al cliente automatizada en ingles y chino: conversaciones multi-turno con historial largo, siempre que el dominio de despliegue se limite a esos dos idiomas.
- Prototipado e investigacion en cuantizacion NVFP4 sobre Blackwell: el repositorio documenta el pipeline exacto (`llm-compressor` 0.13, esquema `NVFP4A16`, exclusiones concretas) sobre una RTX 5070 Ti, lo que sirve como caso reproducible para estudiar el impacto de RTN frente a GPTQ en modelos de 4B.
- Despliegue on-premise con VRAM restringida: el tamano reducido facilita servir el modelo en hardware modesto cuando la prioridad es la huella de memoria y no el rendimiento por token.
- Procesamiento por lotes de textos largos en ingles o chino donde la calidad absoluta no es critica y prima el coste de memoria.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a HumanEval-instruct (`pass@1` / `create_test`, n = 164), evaluados con lm-evaluation-harness sobre backend vLLM 0.26 con el plugin Spark2_5, decodificacion greedy, mediana de 3 ejecuciones con rango, en una RTX 5070 Ti (Blackwell, SM120).

| Build | HumanEval-instruct pass@1 | Tamano | Delta vs bf16 |
|---|---:|---:|---:|
| bf16 base | 79,88 % (79,88–81,10) | 7,7 GiB | — |
| NVFP4-W4A16 (RTN, este build) | 71,34 % (70,73–71,95) | 2,7 GiB | −8,5 pp |
| NVFP4-W4A16 (GPTQ) | en progreso | 2,7 GiB | no disponible |

No se han publicado resultados de MBPP, MMLU, GSM8K ni otros benchmarks en la informacion disponible. El autor senala que MBPP y el brazo GPTQ se publicaran mas adelante.

## Requisitos de hardware

- Pesos en disco: 2,7 GiB (el repositorio ocupa 2,8 GB); el base en bf16 ocupa 7,7 GiB.
- VRAM para inferencia: el peso cuantizado ronda los 3 GB; en una tarjeta de 16 GB el autor reporta unos 10 GiB libres para la cache KV con `--kv-cache-dtype fp8`.
- GPU verificada: RTX 5070 Ti (Blackwell, SM120). El repositorio etiqueta explicitamente `blackwell`, por lo que la familia RTX 50 y las GPU de centro de datos Blackwell son el objetivo declarado; no se documenta compatibilidad con generaciones anteriores.
- Cabe en GPU consumer de 16 GB. No se documenta el comportamiento en tarjetas de 8 o 12 GB.
- Despliegue: vLLM 0.26 con el plugin fuera del arbol `Spark-plugin` (`git clone https://github.com/XHToken/Spark-plugin`, `pip install -e ./Spark-plugin --no-deps`), mas `openai>=2.25.0`. Ejemplo de servicio: `vllm serve Ttimms/Spark-X2.5-4B-NVFP4 --trust-remote-code --enforce-eager --max-model-len 32768 --kv-cache-dtype fp8 --enable-auto-tool-choice --tool-call-parser spark25`. En WSL hay que definir `VLLM_USE_V2_MODEL_RUNNER=0`.
- `--enforce-eager` es el ajuste seguro en SM120; la ruta weight-only NVFP4-W4A16 tambien funciona con CUDA graphs.
- No se documentan opciones de despliegue con llama.cpp, Ollama, TGI ni SGLang; el formato compressed-tensors no es GGUF.
- Latencia y throughput: no disponibles. En SM120 no hay computo FP4 nativo: la ruta weight-only decodifica mediante el kernel Marlin hacia una GEMM en bf16, por lo que el beneficio es de huella de memoria y no de velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La comparacion mas fundamentada es entre las distintas precisiones del mismo modelo base.

| Modelo / build | Precision | Parametros | Contexto | HumanEval-instruct | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| XHToken/Spark-X2.5-4B | bf16 | ~4,11 B | 1 M tokens | 79,88 % | apache-2.0 | HuggingFace |
| XHToken/Spark-X2.5-4B-FP8 | FP8 | ~4,11 B | 1 M tokens | no disponible | apache-2.0 | HuggingFace |
| Ttimms/Spark-X2.5-4B-NVFP4 (RTN) | NVFP4 W4A16 | ~4,11 B | 1 M tokens | 71,34 % | apache-2.0 | HuggingFace, requiere plugin vLLM |
| Ttimms/Spark-X2.5-4B-NVFP4 (GPTQ) | NVFP4 W4A16 | ~4,11 B | 1 M tokens | en progreso | apache-2.0 | anunciado, no publicado |

El propio autor recomienda el build FP8 de XHToken como opcion mas segura si se busca maxima retencion de calidad hoy, antes de que se publique la version GPTQ.

## Limitaciones y advertencias

- Perdida de calidad documentada: −8,5 puntos porcentuales en HumanEval-instruct respecto al base bf16 con redondeo RTN. El autor advierte que un modelo de 4B no absorbe bien pesos de 4 bits solo con RTN.
- Redondeo RTN sin datos de calibracion (data-free); el build GPTQ que lo mitiga aun no esta disponible.
- Requiere codigo personalizado y `--trust-remote-code`; `Spark2_5ForCausalLM` no esta en el registro de modelos de vLLM, por lo que hay que instalar el plugin `Spark-plugin` en el mismo entorno.
- Compatibilidad limitada: el objetivo declarado es hardware Blackwell (SM120 y superior). No se documenta funcionamiento en generaciones anteriores ni en otras GPU.
- En SM120 no hay aceleracion por computo FP4 nativo; el rendimiento puede ser igual o inferior al de una GEMM en bf16 convencional.
- En WSL es obligatorio definir `VLLM_USE_V2_MODEL_RUNNER=0`.
- Idiomas soportados: unicamente ingles y chino. No se documenta soporte de castellano ni de otras lenguas.
- Contexto: aunque el modelo base declara 1 M de tokens, el ejemplo de servicio limita `--max-model-len` a 32.768; alcanzar ventanas mayores depende de la VRAM disponible para cache KV.
- No se documentan sesgos especificos ni evaluaciones de seguridad. Como cualquier modelo de lenguaje, existe riesgo de alucinacion, no cuantificado en la informacion disponible.
- Licencia Apache-2.0, heredada del modelo base: permite uso comercial, pero al ser un artefacto de cuantizacion conviene verificar las condiciones del repositorio original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 10 de septiembre de 2026 y actualizado el mismo dia; se trata de un artefacto muy reciente y sin validacion externa.
- El autor anticipa que la model card y el repositorio se actualizaran in-place cuando llegue el build GPTQ, por lo que los datos aqui recogidos pueden quedar obsoletos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Ttimms/Spark-X2.5-4B-NVFP4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Build FP8 del modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B-FP8
- Plugin de vLLM para Spark2_5: https://github.com/XHToken/Spark-plugin
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron contenido generico del portal Zhihu, sin relacion con Spark-X2.5-4B. No se han encontrado papers, blogs ni demos adicionales.
