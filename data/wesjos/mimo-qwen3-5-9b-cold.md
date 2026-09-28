# wesjos/Mimo-Qwen3.5-9B-Cold

## Resumen

Mimo-Qwen3.5-9B-Cold es un ajuste fino de alineamiento por preferencias construido sobre XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un destilado de 9.409.813.744 parametros con arquitectura de la familia Qwen3.5. Lo desarrolla el usuario wesjos y se publica bajo licencia Apache-2.0. Su particularidad metodologica es que aplica DPO (Direct Preference Optimization) directamente sobre el modelo base, sin ninguna fase previa de SFT, usando 1.027 pares de preferencia de estilo LIMA. El objetivo declarado no es ganar capacidad, sino imprimir un estilo de respuesta concreto: conciso, decidido y directo.

El modelo resuelve un problema de producto mas que de investigacion: los modelos base de la familia Qwen tienden a respuestas largas, matizadas y con preambulos, lo que encarece la inferencia y complica su integracion en agentes y pipelines automatizados. Este ajuste busca conservar el conocimiento y el razonamiento del base mientras reduce la verbosidad. La model card reporta mejoras en IFEval (+3,82 puntos), ARC (+3,50) y HumanEval (+7,93), con caidas dentro del ruido estadistico en MMLU (-0,44) y GSM8K (-1,00).

Es relevante ahora porque demuestra un patron de bajo coste computacional (1 epoca, 1.027 pares, QLoRA 4 bits con Unsloth y TRL) para el reajuste de estilo de modelos abiertos de ~9B, y porque se distribuye en tres formatos utiles para distintos escenarios: pesos completos en bfloat16, adaptador LoRA y cuantizacion GGUF Q8_0 para llama.cpp. Su ventana de contexto nativa es de 262.144 tokens y solo declara soporte de ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, arquitectura de la familia Qwen3.5 (segun model card); sin detalles adicionales de capas o atencion en la informacion disponible |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (nativo, declarado en la model card) |
| Tipos de cuantizacion | GGUF Q8_0 publicado (8,87 GB); el autor menciona entrenamiento en QLoRA 4 bits; otros niveles GGUF (Q4_K_M, Q5_K_M, etc.) no estan publicados en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (merged_16bit, bfloat16, 4 shards) y GGUF (mimo-9b-cold-Q8_0.gguf); incluye adaptador LoRA (r=16) |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Metodo de ajuste | DPO sin SFT previo, sobre 1.027 pares de preferencia estilo LIMA |
| Framework de entrenamiento | Unsloth + TRL DPOTrainer (QLoRA 4 bits) |
| Pipeline declarado | text-generation (la metadata de HuggingFace incluye la etiqueta image-text-to-text, heredada del modelo base; la model card solo documenta generacion de texto) |
| Plantilla de chat | chat_template.jinja con soporte de conmutador `enable_thinking` |
| Tamano del repositorio | 18,8 GB (segun HuggingFace) |
| Descargas / likes | 44 descargas, 0 likes |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar que el modelo base es un destilado de la familia Qwen3.5 con 9,4B parametros. Se trata, por tanto, de un transformer decoder-only de ~9,4B parametros con una ventana de contexto nativa de 262.144 tokens. No se documentan innovaciones arquitectonicas propias: este modelo no modifica la arquitectura del base, solo sus preferencias de estilo mediante alineamiento.

El entrenamiento es deliberadamente minimalista. Se aplica DPO directamente sobre el modelo base, sin fase de SFT, con 1.027 pares de preferencia estilo LIMA (fichero `lima_dpo_clean.jsonl`) durante 1 epoca. El pipeline usa QLoRA de 4 bits con Unsloth y el DPOTrainer de TRL. El rango LoRA es r=16, lo que corresponde aproximadamente al 0,04% de los parametros totales. El autor reconoce explicitamente que esta escala es insuficiente para aportar conocimiento nuevo y que el efecto esperado es exclusivamente de transferencia de estilo. Los pesos resultantes se publican fusionados en bfloat16, ademas del adaptador y una cuantizacion GGUF Q8_0.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con estilo conciso y directo por diseno.
- Razonamiento y conocimiento general: la model card reporta MMLU 88,16, ARC 94,75 y GSM8K 93,00, valores practicamente identicos a los del modelo base.
- Generacion de codigo: HumanEval pass@1 de 73,78 sobre el conjunto completo de 164 problemas, 7,93 puntos por encima del base.
- Seguimiento de instrucciones: IFEval 67,96 sobre las 541 tareas completas, +3,82 puntos frente al base.
- Tool calling / function calling: soportado a nivel de plantilla, con Plan.EM de 77,54 en ToolBench-Static (500 tareas, 333 in-domain y 167 out-of-domain).
- Modo thinking opcional: la plantilla admite el conmutador `enable_thinking` en `apply_chat_template`, heredado del base.
- Multilingue limitado: solo ingles y chino declarados; no se documenta rendimiento en otras lenguas.
- Razonamiento multi-paso: cubierto parcialmente por BBH (79,63) y por la planificacion de herramientas medida en ToolBench.
- No se documentan capacidades de vision, audio ni generacion de embeddings, pese a la etiqueta `image-text-to-text` presente en la metadata de HuggingFace.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con historial extenso y documentacion de producto adjunta, mientras que el estilo conciso reduce el coste por respuesta y mejora la legibilidad de las transcripciones.
- Asistentes internos con respuestas directas: en entornos donde el usuario necesita una decision y no un ensayo (soporte de TI, helpdesk interno), el estilo entrenado evita preambulos y matizaciones redundantes que alargan la lectura.
- Generacion de codigo en produccion: HumanEval de 73,78 pass@1 y ventana larga lo hacen util para completar funciones, generar tests o refactorizar ficheros grandes; puede integrarse en pipelines de CI/CD que invoquen el modelo via `llama-server` o transformers.
- Agentes con tool calling: Plan.EM de 77,54 indica que la planificacion de herramientas se conserva respecto al base. Es imprescindible anadir validacion de esquema en la capa de aplicacion, porque la tasa de alucinacion de herramientas sube a 31,97 (+4,54 puntos).
- Analisis de documentos largos en chino e ingles: contratos, informes tecnicos o expedientes que quepan en 262.144 tokens, con extraccion y resumen en un unico pase sin necesidad de troceado y reensamblado.
- Extraccion de informacion estructurada: clasificacion de tickets, parsing de correos o conversion de texto libre a JSON, aprovechando el seguimiento de instrucciones medido en IFEval.
- Despliegue en本地 / on-premise con requisitos de privacidad: la cuantizacion Q8_0 de 8,87 GB permite ejecutar el modelo en una GPU de consumo de 12-16 GB sin enviar datos a terceros, con licencia Apache-2.0 sin restricciones de uso comercial.
- Traduccion y asistencia bilingue ingles-chino: ambos idiomas estan declarados oficialmente, lo que lo hace apto para documentacion tecnica y comunicacion interna en equipos mixtos.
- Investigacion en alineamiento ligero: el adaptador LoRA (r=16, 0,04% de parametros) y el pipeline DPO sin SFT son un caso de estudio reproducible para estudiar transferencia de estilo con presupuestos minimos de datos y computo.

## Benchmarks y rendimiento

Evaluacion declarada en la model card: seed 42, temperatura 0, limite 200 por subconjunto, evalscope 1.12.

Comparativa contra el modelo base:

| Benchmark | Base | Cold | Delta |
|---|---|---|---|
| ARC (Easy / Challenge) | 91,25 (94,50 / 88,00) | 94,75 (97,50 / 92,00) | +3,50 |
| GSM8K | 94,00 | 93,00 | -1,00 (dentro del ruido) |
| MMLU | 88,60 | 88,16 | -0,44 (dentro del ruido) |
| BBH | 82,41 | 79,63 | -2,78 (el autor lo atribuye a varianza de muestreo) |
| TruthfulQA (MC) | 73,00 | 75,50 | +2,50 |
| IFEval (541 completas) | 64,14 | 67,96 | +3,82 |

Codigo y tool calling (500 tareas ToolBench-Static: 333 in-domain + 167 out-of-domain):

| Metrica | Base | Cold | Delta |
|---|---|---|---|
| HumanEval pass@1 (164 completas) | 65,85 | 73,78 | +7,93 |
| ToolBench Plan.EM | 77,75 | 77,54 | -0,21 (plano) |
| ToolBench Act.EM | 17,71 | 17,93 | +0,22 (plano) |
| ToolBench F1 | 15,16 | 15,17 | +-0 (plano) |
| ToolBench HalluRate | 27,43 | 31,97 | +4,54 (empeora) |

No se han publicado resultados de otros benchmarks adicionales en la informacion disponible, ni valores comparables de terceros medidos bajo el mismo protocolo.

## Requisitos de hardware

- Pesos completos en bfloat16 (merged_16bit): la model card indica 18 GB en 4 shards. Para inferencia holgada se recomienda una GPU de 24 GB o superior; con 24 GB (RTX 3090, RTX 4090, L4) el margen para cache KV es muy estrecho, por lo que conviene limitar la ventana de contexto.
- Formato GGUF Q8_0 (8,87 GB): estimacion de unos 11-12 GB de VRAM en total contando overhead y cache KV a contextos moderados. Cabe en GPUs de consumo de 12 GB (RTX 3060 12 GB) y con holgura en 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090).
- Cuantizaciones de 4 bits no publicadas: una hipotetica Q4_K_M de ~9,4B parametros rondaria los 5,5-6 GB de pesos, es decir unos 7-8 GB de VRAM en uso real. Cabe en GPUs de 8 GB, aunque con contexto limitado. Es una estimacion derivada del numero de parametros, no un dato publicado.
- Cache KV: con 262.144 tokens de contexto el coste de la cache puede superar la huella de los propios pesos en precision de 16 bits. El autor usa cuantizacion de cache (`-ctk q8_0 -ctv q8_0`) y `--ctx-size 8192` en su ejemplo, lo que sugiere que en la practica se opera con contextos mucho menores que el maximo nativo.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A6000 permiten servir el modelo en bfloat16 con contextos largos y lotes concurrentes.
- Opciones de despliegue documentadas: `transformers` (AutoModelForCausalLM con `device_map="auto"`) y `llama.cpp` (`llama-server` con `--jinja`). El autor tambien menciona compatibilidad con endpoints. Otros runners como vLLM, TGI o SGLang no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tokens por segundo ni de latencia por peticion.
- Parametros de generacion recomendados por el autor: temperature 0,6, top_p 0,9, top_k 20, repeat_penalty 1,05 y DRY multiplier 0,8.
- El adaptador LoRA (r=16) permite experimentar con requisitos de memoria muy inferiores para entrenamiento o evaluacion, pero requiere cargar el modelo base.

## Comparativa con modelos similares

El comparador mas directo es el propio modelo base del que deriva. Para el resto de alternativas de la categoria (~8-9B), en la informacion proporcionada no hay resultados de benchmarks comparables medidos bajo el mismo protocolo, por lo que las celdas de rendimiento se dejan como no disponibles. Los datos de la columna "Cold" y "Base MiMo" proceden de la model card; los de las dos ultimas filas son caracteristicas publicas generales de cada familia y no se han verificado en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Benchmarks comparables |
|---|---|---|---|---|
| Mimo-Qwen3.5-9B-Cold | 9,41B | 262.144 | Apache-2.0 | ARC 94,75; MMLU 88,16; GSM8K 93,00; HumanEval 73,78; IFEval 67,96 |
| MiMo-V2.6-Distill-Qwen-9B (base) | 9,4B | 262.144 (heredado) | no disponible en la informacion proporcionada | ARC 91,25; MMLU 88,60; GSM8K 94,00; HumanEval 65,85; IFEval 64,14 |
| Qwen3-8B | ~8,2B | ~128K | Apache-2.0 | no disponible en la informacion proporcionada |
| Llama-3.1-8B | ~8,03B | ~128K | Llama 3.1 Community License | no disponible en la informacion proporcionada |

Diferencias observadas frente al base: mejoras en instrucciones, codigo, ARC y veracidad, con ToolBench plano y un aumento de la tasa de alucinacion de herramientas. La eleccion entre el base y el ajuste depende de si se prioriza brevedad y codigo o robustez en function calling.

## Limitaciones y advertencias

- Escala de entrenamiento minima: 1 epoca sobre 1.027 pares. El propio autor advierte de que no deben esperarse mejoras de capacidad, solo transferencia de estilo.
- Mayor alucinacion en tool calling: la tasa de alucinacion de ToolBench sube de 27,43 a 31,97 (+4,54 puntos). El autor lo atribuye a que el estilo decidido hace que el modelo dude menos cuando no esta seguro. Para agentes en produccion es obligatorio validar los esquemas de parametros en la capa de aplicacion.
- Caida en BBH: -2,78 puntos, aunque el autor senala que con limite 200 cada subconjunto tiene unas 4 preguntas y la diferencia no es estadisticamente significativa.
- Sin conocimiento nuevo: el corte de conocimiento es el heredado del base (familia Qwen3.5). El entrenamiento no incorpora informacion adicional.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano u otras lenguas no esta documentado y no deberia asumirse.
- Riesgo de alucinacion general: no se han publicado mediciones de alucinacion fuera de ToolBench. TruthfulQA mejora (75,50), pero sigue por debajo de los valores que se consideran fiables en muchos entornos de produccion.
- Sesgos: la model card no documenta ninguna evaluacion de sesgos, toxicidad o equidad. No hay datos disponibles.
- Alineamiento de seguridad: el autor afirma que se conservan los valores de seguridad del base y que las peticiones ilegales se rechazan ofreciendo alternativas legales, pero no se aporta ninguna evaluacion de red teaming.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base y de los datos de preferencia empleados antes de un despliegue comercial.
- Coherencia del repositorio: el tamano declarado por HuggingFace (18,8 GB) coincide aproximadamente solo con los pesos bfloat16 descritos en la model card (18 GB), pero no con la suma de todos los artefactos (que incluiria ademas los 8,87 GB del GGUF y el adaptador). Conviene verificar que el fichero GGUF esta efectivamente alojado en el repositorio antes de planificar un despliegue con llama.cpp.
- Adopcion muy baja: 44 descargas y 0 likes en el momento de la consulta. No existe validacion independiente de los resultados reportados.
- Contexto largo en la practica: aunque la ventana nativa es de 262.144 tokens, los ejemplos del autor usan `--ctx-size 8192`; no hay datos publicados sobre calidad de recuperacion a contextos muy largos ni sobre el coste real de la cache KV.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesjos/Mimo-Qwen3.5-9B-Cold
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada: los resultados obtenidos corresponden a software de fondos de pantalla animados y no guardan ninguna relacion con este modelo. Los articulos de LIMA y DPO citados en los agradecimientos de la model card no aparecen con enlace en la informacion disponible.
