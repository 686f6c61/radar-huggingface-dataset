# yachiyo8080/Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF

## Resumen
Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF es una cuantizacion GGUF de 2 bits del modelo Underdog Saluki 27B 1.0, desarrollado por ConwayResearch sobre Qwen3.8-27B, a la que se le han eliminado los rechazos (abliteration) modificando unicamente 4 tensores de los bloques 35 y 36. El resultado es un modelo de 27.320.697.856 parametros que responde a peticiones que el original rechaza, manteniendo practicamente intactas sus capacidades de generacion, tool calling y decodificacion especulativa MTP.

La relevancia de esta ficha esta en su naturaleza de artefacto experimental: no hubo entrenamiento, el metodo de abliteration no esta publicado y el autor reconoce que las pruebas son de una sola maquina y con conjuntos pequenos, no un benchmark formal. Aun asi, documenta una degradacion medida de perplexity de solo +1,6% en ingles y +1,8% en japones, y una tasa de rechazo que cae del 99% al 1% en prompts daninos con thinking desactivado.

El modelo esta pensado para investigacion y uso local sin censura, con licencia Apache-2.0, soporte de ingles y japones, y compatibilidad con llama.cpp incluyendo la cabeza MTP para autodecodificacion especulativa. Su empaquetado IQ2-mix de 8,35 GB permite ejecutarlo en GPUs consumer de 12 GB con contexto de 40K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP (multi-token prediction) para decodificacion especulativa; derivada de Qwen3.8-27B segun la model card |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens recomendados en llama.cpp; 64K posible pero con desbordamiento de VRAM en GPUs de 12 GB |
| Tipos de cuantizacion | IQ2-mix (2 bits, mezcla de tipos por tensor); el archivo publicado es `Underdog-Saluki-27B-1.0-IQ2-mix-MTP-abliterated.gguf` |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La model card describe el modelo como derivado de Qwen3.8-27B e incluye referencias a tensores `blk.35.attn_output`, `blk.35.ffn_down`, `blk.36.ffn_down` y `blk.36.ssm_out`, lo que sugiere una arquitectura hibrida con componentes de atencion y de espacio de estados (SSM) en las capas finales, aunque el autor no detalla la arquitectura completa. La cabeza MTP (`blk.64.*`) se conserva intacta y habilita la decodificacion especulativa mediante `--spec-type draft-mtp` en llama.cpp.

No se realizo ningun entrenamiento adicional. La intervencion consiste en modificar 4 tensores de los bloques 35 y 36 manteniendo su tipo de cuantizacion y tamano originales; los otros 862 tensores, incluida la cabeza MTP, y todos los metadatos son byte-identicos al archivo `Underdog-Saluki-27B-1.0-IQ2-mix-MTP.gguf`. El autor declara explicitamente que el metodo de abliteration no esta publicado. La cuantizacion de la cabeza MTP en GGUF procede de Unsloth, y el modelo base se apoya en el trabajo de ISTA-DASLab sobre Qwen3.8-27B-GSQ-RCO-GGUF.

## Capacidades
- Generacion de texto conversacional en ingles y japones, con modo thinking activable.
- Razonamiento multi-paso y sesiones de agente de varios turnos, con thinking de hasta 8.192 tokens en las pruebas del autor.
- Tool calling / function calling: 100% de herramienta correcta y 100% de argumentos validos en 30 prompts con 10 herramientas tras la abliteration.
- Respuesta coherente tras recibir un resultado de herramienta simulado (100% en 30 prompts).
- Decodificacion especulativa MTP integrada en llama.cpp, con unos 58-62 tok/s a 40K de contexto en una RTX 3080 de 12 GB.
- Comportamiento sin rechazos ante peticiones daninas (1% con thinking off, 2% con thinking on), manteniendo 0% de rechazos en prompts inofensivos.
- Capacidad de abstenerse de llamar a herramientas cuando no es necesario: 80% en 10 prompts (frente al 90% del original).

## Casos de uso
- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como varia la tasa de rechazo (99% a 1%) al modificar solo 4 tensores, con perplexity casi intacta, en un entorno controlado y local.
- Evaluacion de tecnicas de abliteration: util para comparar la degradacion de calidad (perplexity +1,6% en ingles, +1,8% en japones) frente al original y validar si el metodo es aceptable para otros fines.
- Desarrollo de agentes locales con tool calling: los resultados de 100% de herramienta correcta y argumentos validos permiten integrarlo en prototipos de agentes que ejecutan funciones en pipelines propios, siempre con salvaguardas externas.
- Procesamiento de texto en japones e ingles con contexto largo: 40K tokens caben en 11,4 GB con un prompt de 22K en GPUs de 12 GB, adecuado para analisis de documentos bilingues.
- Generacion de texto creativo sin restricciones para investigacion: util en estudios sobre sesgos y contenido generado, con la advertencia de que no incorpora filtros.
- Pruebas de decodificacion especulativa MTP en llama.cpp: sirve como banco de pruebas para medir throughput (58-62 tok/s) y consumo de VRAM con `--spec-type draft-mtp` en hardware consumer.
- Evaluacion de estabilidad en sesiones largas: el autor documenta problemas de repeticion en sesiones de agente prolongadas con ciertas configuraciones de muestreo, lo que lo hace util para estudiar bucles en modelos abliterated.

## Benchmarks y rendimiento
Los datos proceden de pruebas del autor en una sola maquina (RTX 3080 12 GB, WSL2, fork PrismML `prism-b10754` de llama.cpp) y no constituyen un benchmark formal.

| Metrica | Original (MTP) | Este archivo |
|---|---|---|
| Rechazo en prompts daninos (64 tokens, thinking off) | 99% | 1% |
| Rechazo en prompts daninos (thinking on, hasta 1.536 tokens) | 78% | 2% |
| Rechazo en prompts inofensivos (thinking on) | 0% | 0% |
| Perplexity ingles (wikitext-2, 2048 x 40 chunks) | 6,558 | 6,662 (+1,6%) |
| Perplexity japones (wiki40b-ja, 2048 x 40 chunks) | 11,21 | 11,41 (+1,8%) |
| Texto largo, 24 prompts en/ja (thinking on): bucle / respuesta vacia | 0% / 8% | 0% / 0% |
| Tool calling, 30 prompts con 10 herramientas: herramienta correcta / argumentos validos | 97% / 100% | 100% / 100% |
| Respuesta tras resultado de herramienta falso, 30 prompts | 100% | 100% |
| Sin llamada a herramienta cuando no se necesita, 10 prompts | 90% | 80% |

Comparativa de muestreo del propio autor (top_p 0,95, top_k 20 en todos los casos):

| temp / presence penalty | Bucles (texto largo) | Repeticiones parciales | Respuesta mas larga | Rechazo danino (thinking on) | Respuesta vacia a 1.536 tokens |
|---|---|---|---|---|---|
| 0,6 / 0 (tarjeta de Saluki) | 0 / 24 | 1 | 6.982 tokens | 2% | no disponible |
| 0,6 / 1,5 | 0 / 24 | 2 | 4.997 tokens | no disponible | no disponible |
| 1,0 / 0 (tarjeta de Qwen3.8) | 0 / 24 | 0 | 4.881 tokens | 2% | 7 / 104 |
| 1,0 / 1,1 (recomendado) | 0 / 24 | 0 | 4.056 tokens | 2% | 1 / 104 |

## Requisitos de hardware
- VRAM estimada: el archivo IQ2-mix ocupa 8,35 GB; con contexto de 40K y prompt de 22K tokens el consumo medido es de 11,4 GB. Con 64K el consumo arranca en 11,85 GB y crece unos 0,45 GB con prompts largos.
- GPU recomendadas: RTX 3080 de 12 GB es el hardware de referencia del autor; caben tambien RTX 4070 Ti, RTX 4080, RTX 4090, A100 y H100 con holgura para contextos mayores (no se aportan mediciones para estas).
- Cabe en GPUs consumer de 12 GB con contexto de 40K; en tarjetas de 8 GB o menos no se documenta viabilidad.
- Opciones de despliegue: llama.cpp (probado con el fork PrismML `prism-b10754`) mediante `llama-server` con `--jinja -ngl 99 -fa on -c 40960 -np 1 -ctk q8_0 -ctv q8_0 --spec-type draft-mtp --spec-draft-n-max 2`. No se mencionan vLLM, Ollama ni TGI para este archivo.
- Throughput: unos 58-62 tok/s con MTP activado a 40K de contexto en RTX 3080 12 GB. No se publica latencia por peticion ni throughput en otras GPUs.
- Muestreo recomendado con thinking: `--temp 1.0 --top-p 0.95 --top-k 20 --presence-penalty 1.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF (este) | 27,3B | 40K recomendado | GGUF IQ2-mix, 8,35 GB | Apache-2.0 | Sin rechazos, MTP, tool calling 100% en prueba del autor |
| Underdog-Saluki-27B-1.0-MTP (original) | 27,3B | 40K recomendado | GGUF IQ2-mix | Apache-2.0 | Rechazo 99% en prompts daninos; perplexity 6,558 en ingles |
| Qwen3.8-27B (base) | 27B aprox. (no confirmado) | no disponible | safetensors / GGUF | no disponible en la informacion | Modelo base de la cadena; el autor cita sus valores de muestreo |
| Underdog-Saluki-27B-1.0 (ConwayResearch) | 27B aprox. (no confirmado) | no disponible | no disponible | no disponible en la informacion | Modelo de partida antes de la cuantizacion MTP |

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y las metricas internas del autor.

## Limitaciones y advertencias
- El modelo no rechaza peticiones daninas por diseno; el autor advierte que no debe exponerse a usuarios sin salvaguardas propias.
- El metodo de abliteration no esta publicado, lo que impide auditar que se ha modificado exactamente mas alla de los 4 tensores declarados.
- Las metricas provienen de una sola maquina, con conjuntos de 10 a 104 prompts y sin benchmark formal; no son extrapolables a produccion.
- Degradacion medida de perplexity: +1,6% en ingles y +1,8% en japones frente al original.
- El autor documenta bucles de repeticion en sesiones de agente largas con temperature 0,6 y presence penalty 1,5; recomienda temperature 1,0 y presence penalty 1,1.
- La tasa de abstenerse de llamar a herramientas cuando no se necesita baja del 90% al 80%, lo que puede provocar llamadas innecesarias en agentes.
- Solo soporta ingles y japones de forma declarada; no hay datos sobre otros idiomas.
- Con 64K de contexto en GPUs de 12 GB se desborda la VRAM y el rendimiento cae bruscamente.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al ser un modelo abliterated, la ausencia de rechazos puede aumentar la generacion de contenido falso o danino sin aviso.
- La licencia Apache-2.0 permite uso comercial, pero el autor restringe el proposito a investigacion y uso local sin censura; el cumplimiento normativo recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces
- HuggingFace: https://huggingface.co/yachiyo8080/Underdog-Saluki-27B-1.0-MTP-Abliterated-GGUF
- Modelo base MTP: https://huggingface.co/Kujira/Underdog-Saluki-27B-1.0-MTP-GGUF
- Modelo base original: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Cuantizacion MTP de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Referencia a ISTA-DASLab Qwen3.8-27B-GSQ-RCO-GGUF: mencionada en la model card sin URL directa
