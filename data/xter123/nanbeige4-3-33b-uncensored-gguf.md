# XTer123/Nanbeige4.3-33B-Uncensored-GGUF

## Resumen

Nanbeige4.3-33B-Uncensored-GGUF es una cuantización GGUF (Q5_K_M) de un derivado "abliterado" del modelo Nanbeige4.3-33B, desarrollado originalmente por Nanbeige. El derivado no-uncensurado fue creado por el usuario XTer123 mediante abliteración por dirección de rechazo (refusal-direction ablation), una técnica que elimina el comportamiento de rechazo del modelo sin reentrenamiento. El modelo base es un LLM de 33.118.977.024 parámetros orientado a chino e inglés con soporte de razonamiento (thinking mode) y tool calling.

La relevancia de esta ficha radica en el método empleado: en lugar de un fine-tuning convencional, se aplicó la herramienta Heretic, que ortogonaliza las proyecciones de salida de atención y bajada de MLP de cada capa contra una dirección de rechazo calculada por diferencia de medias, seleccionada mediante búsqueda TPE que minimiza conjuntamente los rechazos y la divergencia KL respecto al modelo base. El resultado conserva prácticamente intactas las capacidades del modelo original (KL de 0,0224).

Es un modelo de nicho dirigido a desarrolladores que necesitan ejecutar localmente una versión sin filtros de un modelo de 33B con contexto de 262.144 tokens, principalmente vía llama.cpp. Al ser una abliteración y no un modelo de seguridad reentrenado, su uso conlleva advertencias éticas y legales importantes que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Nanbeige4.3-33B); detalles adicionales no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q5_K_M (este repo); KV cache en 4 bits (q4_0) soportado |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (23,5 GB en Q5_K_M); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer decoder de 33 mil millones de parametros. Los detalles de su arquitectura interna (numero de capas, cabezas de atencion, dimension oculta) y de su proceso de preentrenamiento no estan disponibles en la informacion proporcionada. Lo que si consta es que conserva intacta la plantilla de chat del modelo original, incluidos los parametros `enable_thinking` / `preserve_thinking`, los tokens BOS/EOS y los formatos de tool calling.

La innovacion principal de este derivado no esta en el modelo sino en el proceso de abliteracion. Se utilizo Heretic (commit `171bb98b`), que calcula una direccion de rechazo mediante diferencia de medias y ortogonaliza contra ella la proyeccion de salida de atencion (attention out-projection) y la de bajada del MLP en cada capa, con normalizacion de filas que preserva la magnitud. La direccion y los pesos por capa se seleccionaron con una busqueda TPE (optimizacion bayesiana de hyperparametros) que minimiza conjuntamente el numero de rechazos y la divergencia KL respecto al modelo base. No hubo fine-tuning ni datos de entrenamiento nuevos: solo 59 de las 104 matrices abliterables fueron modificadas, y los tensores verificados puntualmente son identicos bit a bit a los del modelo base. En el conjunto propio de 100 prompts de la busqueda, el modelo base rechaza 98 veces y este derivado 26, con una KL de 0,0224.

## Capacidades

- Generacion de texto conversacional en chino e ingles, heredada del modelo base Nanbeige4.3-33B.
- Modo de razonamiento (thinking mode): la plantilla de chat admite `enable_thinking` y `preserve_thinking`; con `enable_thinking=false` se obtiene respuesta directa sin bloque de razonamiento.
- Tool calling / function calling: los formatos de llamada a herramientas del modelo base se conservan sin cambios.
- Contexto muy largo: hasta 262.144 tokens, ejecutable con KV cache en 4 bits para reducir el consumo de memoria.
- Compatibilidad completa con llama.cpp (etiquetas gguf, llama.cpp, imatrix y endpoints_compatible).
- Comportamiento de rechazo drásticamente reducido: de 98 rechazos a 26 en el conjunto de evaluacion de 100 prompts, sin degradacion medible del modelo (KL 0,0224).

## Casos de uso

- Investigacion en seguridad y alineacion de modelos: al ser una abliteracion documentada con metricas publicas (tasa de rechazos, KL), es util como sujeto de estudio para analizar como se elimina el comportamiento de rechazo y que residualidades persisten.
- Experimentacion con contextos muy largos en local: con 262.144 tokens y KV cache en 4 bits, permite procesar documentos extensos (contratos, codebases, corpus de investigacion) en una sola estacion de trabajo sin infraestructura de datacenter.
- Asistentes con razonamiento controlable: el parametro `enable_thinking` permite alternar entre modo razonamiento (para tareas complejas de analisis o matematicas) y respuesta directa (para latencia baja en chat), lo que lo hace flexible para prototipado de agentes.
- Desarrollo de agentes con tool calling local: conserva los formatos de llamada a herramientas del modelo base, por lo que puede integrarse en frameworks de agentes que ejecuten funciones locales sin enviar datos a APIs externas, util cuando la privacidad es prioritaria.
- Procesamiento bilingue chino-ingles: adecuado para flujos de trabajo que combinan documentacion tecnica en ingles con contenido en chino, un punto donde muchos modelos abiertos occidentales rinden peor.
- Pruebas de regresion de comportamiento de modelos abliterados: el directorio `recovery/` incluye un adaptador delta de rango 3 y los ficheros de configuracion y tokenizador del base, lo que permite reconstruir y verificar los pesos de forma reproducible, util para auditorias de procedencia de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos publicados corresponden al propio proceso de abliteracion:

| Metrica | Modelo base | Derivado uncensored |
|---|---|---|
| Rechazos en conjunto de 100 prompts | 98 | 26 |
| Divergencia KL respecto al base | — | 0,0224 |
| Matrices modificadas | — | 59 de 104 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K_M ocupa 23,5 GB; para alojarlo completamente en GPU se necesita una tarjeta con al menos 24 GB de VRAM (sin contar KV cache). Con contexto de 262.144 tokens y KV cache en 4 bits, el consumo adicional de KV sera significativo y puede requerir 32-48 GB o descarga parcial a CPU/RAM.
- GPU recomendadas: RTX 4090 u RTX 3090 (24 GB) para contextos moderados con offload parcial; RTX 5090 (32 GB), A100 40 GB/80 GB o H100 para contextos largos con el modelo completo en GPU.
- Consumer GPUs: cabe en una RTX 3090/4090 de 24 GB con `-ngl 99` solo si se acepta offload de parte del KV cache a RAM o contextos reducidos; para el contexto completo de 262.144 tokens se recomienda 32 GB o mas de VRAM, o una configuracion hibrida GPU+CPU con RAM amplia.
- Opciones de despliegue: llama.cpp es el objetivo principal del repo (incluye comando de ejemplo con `-fa on`, `-ctk q4_0`, `-ctv q4_0` y `--jinja`). Al ser GGUF, tambien funciona con Ollama, LM Studio y otros runtimes compatibles; vLLM y TGI requieren los pesos safetensors del modelo base, no este repo.
- Latencia y throughput: no disponibles; en una GPU de 24 GB con cuantizacion Q5_K_M y offload completo, un modelo de 33B suele ofrecer velocidades del orden de decenas de tokens por segundo, pero no hay cifras publicadas para este caso.

## Comparativa con modelos similares

| Caracteristica | Nanbeige4.3-33B-Uncensored-GGUF | Nanbeige/Nanbeige4.3-33B (base) | Qwen3-32B |
|---|---|---|---|
| Parametros | 33,1B | 33,1B | 32,8B |
| Contexto | 262.144 tokens | 262.144 tokens | no disponible en la informacion proporcionada |
| Formato en este repo | GGUF Q5_K_M | safetensors | safetensors y GGUF comunitarios |
| Thinking mode | Si (heredado) | Si | Si |
| Tool calling | Si (heredado) | Si | Si |
| Tasa de rechazos (set propio) | 26/100 | 98/100 | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Filtrado de seguridad | Abliterado | Estándar | Estándar |

Qwen3-32B se incluye como referencia de categoria (modelo abierto de ~33B con thinking mode y licencia Apache-2.0); sus datos concretos de contexto y benchmarks no constan en la informacion proporcionada y no se han inventado.

## Limitaciones y advertencias

- Riesgo de alucinacion: no hay datos publicados que lo cuantifiquen; al ser una abliteracion con KL muy baja (0,0224), se asume el mismo perfil de alucinacion que el modelo base, pero no hay mediciones especificas.
- Comportamiento de rechazo residual: el modelo sigue rechazando 26 de 100 prompts del conjunto de evaluacion; no es un modelo sin rechazos absolutos, sino una abliteracion parcial.
- Uso etico y legal: eliminar los filtros de seguridad de un LLM habilita la generacion de contenido nocivo. El despliegue en produccion sin salvaguardas adicionales (moderacion de entrada/salida, politicas de uso) es responsabilidad exclusiva del desplegador y puede infringir leyes y terminos de plataformas.
- Sin garantia de fidelidad total: aunque los tensores verificados son identicos al base, solo se comprobó puntualmente; el metodo modifica 59 matrices y podria haber efectos secundarios no medidos en capacidades especificas.
- Limitacion de idiomas: entrenado y documentado para chino e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Contexto largo con coste de memoria: los 262.144 tokens solo son practicos con KV cache cuantizada a 4 bits, lo que puede degradar la calidad de recuperacion en contextos extremos; no hay evaluaciones publicadas de uso del contexto largo.
- Sin benchmarks estandar publicados para este derivado, lo que impide verificar que la abliteracion no degrada capacidades de razonamiento, codigo o matematicas.
- Procedencia comunitaria: el repo es de un usuario individual (XTer123), no del equipo oficial de Nanbeige; conviene verificar los hashes SHA-256 publicados antes de usar los pesos.

## Enlaces

- Repositorio del derivado: https://huggingface.co/XTer123/Nanbeige4.3-33B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Herramienta Heretic (metodo de abliteracion): https://github.com/p-e-w/heretic
