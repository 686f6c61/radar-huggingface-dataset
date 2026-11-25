# thiagovelsa/DeepSeek-V4.1-Flash-1017-Uncensored-AntiOverthink-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-AntiOverthink-GSQ-RCO-GGUF es una cuantizacion GGUF derivada del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario thiagovelsa. Sobre la base de AtomicChat (una version "uncensored" con las capas de rechazo eliminadas mediante tecnicas de abliteration) y del trabajo de cuantizacion GSQ-RCO de ISTA-DASLab, este release aplica un parche quirurgico sobre la cabeza LM para atenuar los bucles de "overthinking" (repeticiones del tipo "Wait" o "But wait" dentro de las trazas de razonamiento) sin degradar la calidad del razonamiento final.

El modelo se distribuye en formato GGUF de 2.0 bits por peso (IQ2_XXS) y esta pensado para ejecutarse en llama.cpp (build b11870 o superior). El repositorio ocupa 138.2 GB e incluye cinco shards del backbone mas un vector de control opcional de 800 KB (ds41_overthink_suppress.gguf) que permite modular la supresion del overthinking mediante steering en las capas 17-31.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de edicion de pesos a nivel de fila de vocabulario (solo 10 de 129.280 filas modificadas en output.weight), y por otro muestra un flujo de despliegue en produccion con receta validada sobre una GPU RTX PRO 6000 Blackwell (96 GB) y contexto de 256K tokens. El modelo base declara 204.800 millones de parametros totales segun los safetensors del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun nomenclatura GSQ-RCO del modelo base; 40 capas transformer; incluye modulo Engram (tabla de lookup) y vision router |
| Parametros totales | 204.800 millones (204,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) verificados en la receta de llama.cpp |
| Tipos de cuantizacion | IQ2_XXS (2.0 bpw) para el backbone; IQ4_NL para el shard Engram compartido; Q8_0 para el draft DSpark opcional |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp, build b11870+) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de 40 capas con 204.800 millones de parametros totales y una arquitectura MoE segun la nomenclatura GSQ-RCO (384 expertos enrutados). Incluye componentes adicionales poco habituales: un modulo Engram (tabla de lookup compartida de 110 GB en cuantizacion IQ4_NL), un gate plegado (engram_gate), un sesgo de enrutador de vision (exp_probs_b_vl) y una plantilla de chat actualizada (chat_template.jinja).

Sobre esa base, este release aplica tres modificaciones. Primero, convierte el layout de 4 shards de AtomicChat al layout upstream de 6 shards de llama.cpp de ISTA-DASLab. Segundo, aplica un parche quirurgico en la cabeza LM (output.weight, dentro del shard 2): tras analizar el flujo residual colapsado en las 40 capas con trazas contrastivas de <think> (PRE_WAIT, NORMAL_THINK, PRE_CLOSE y OUTSIDE_THINK), identifica el circuito de backtracking en las capas 17-31 (pico en L21-L31, con LOO-AUROC = 1.0000 y Cohen's d de 9.7-11.6) y atenua unicamente las 10 filas de tokens de arranque de backtracking (variantes de "Wait", "Hold", "Actually", "Alternatively") con gamma = 10.0 y beta = 0.0. Solo 10 de 129.280 filas de vocabulario y ninguno de los 40 bloques transformer se modifican. Tercero, incluye un vector de control calibrado (800 KB) para steering nativo en llama.cpp sobre las capas 17-31, ortogonalizado contra la prosa de respuesta final.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. El proceso de abliteration (eliminacion de rechazos) procede de AtomicChat y se preserva byte a byte.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking explicito (etiquetas <think>).
- Razonamiento matematico y logico: la model card valida canarios como la suma de primos en (20,40) = 120, un silogismo con respuesta "No" y una list comprehension de Python con resultado [2, 4, 8].
- Generacion de codigo, incluyendo modo Code-Turbo opcional con decodificacion especulativa DSpark (hasta 59,3 tok/s en codigo).
- Control del overthinking: supresion calibrada de bucles de backtracking mediante parche en la cabeza LM y vector de control con escala ajustable entre -0.006 y -0.011 (recomendado -0.008).
- Capacidades de vision: el modelo incluye un sesgo de enrutador de vision (exp_probs_b_vl) en el layout, aunque la model card no detalla el soporte funcional de vision.
- Modelo "uncensored": se han eliminado las capas de rechazo mediante abliteration, por lo que no aplica filtros de contenido por defecto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: el modo thinking y el contexto de 256K permiten razonamiento encadenado, aunque no se documenta un framework de agentes especifico.
- Capacidades multilingues: no disponible.

## Casos de uso

- Razonamiento matematico de contexto largo: con 256K tokens de ventana verificada (recuperacion exacta tipo needle a 73K y 146K tokens), el modelo puede resolver problemas que requieren mantener grandes bloques de derivaciones intermedias sin perder el hilo.
- Generacion de codigo en produccion: la receta Code-Turbo con DSpark alcanza 59,3 tok/s en codigo, adecuada para asistentes de programacion integrados en IDE o pipelines de CI/CD donde la latencia importa.
- Analisis de documentos extensos: la ventana de 256K permite procesar informes, expedientes o bases de codigo completas en una sola pasada, con decodificacion a 35,5 tok/s en contextos de 146K.
- Investigacion sobre control de razonamiento: el vector de control y el parche en la cabeza LM son un caso de estudio reproducible para quienes investigan steering, abliteration y edicion de pesos a nivel de fila.
- Despliegue en hardware de gama alta con cuantizacion agresiva: la cuantizacion IQ2_XXS (2.0 bpw) permite ejecutar un modelo de 204,8 B en una sola GPU de 96 GB (RTX PRO 6000 Blackwell) con offload parcial de expertos a CPU (--n-cpu-moe 15).
- Evaluacion comparativa de tecnicas anti-overthinking: los benchmarks de la model card (reduccion del 23% en tokens de overthinking, 82% menos backtracks) sirven como referencia para comparar metodos de supresion de bucles.
- Prototipado sin filtros de contenido: al ser uncensored, es util en entornos de investigacion controlados donde se necesita estudiar el comportamiento del modelo sin rechazos, con las cautelas legales y eticas correspondientes.

## Benchmarks y rendimiento

Resultados medidos en A100-80GB con llama.cpp, thinking=true y reasoning_effort=high, sobre prompts propensos a overthinking mas tres canarios de razonamiento:

| Configuracion | Tokens de overthinking (3 prompts) | Backtracks totales | "wait" explicitos | Tokens de canarios | Canarios superados | Artefactos |
|---|---:|---:|---:|---:|---:|---:|
| AtomicChat IQ2_XXS original | 3.861 | 11 | 10 | 350 | 3 / 3 | 0 |
| LM-Head parcheado + vector de control (-0.008, L17-31) | 2.988 (-23%) | 2 (-82%) | 2 (-80%) | 290 (-17%) | 3 / 3 | 0 |

Desglose por prompt (original → optimizado): math_clock 1.159 → 563 tokens (-51%), backtracks 3 → 1; riddle_river 1.202 → 925 tokens (-23%), backtracks 2 → 0, wait 2 → 0; hard_pylist 124 → 87 tokens (-30%), wait 1 → 0, resultado exacto [2, 4, 8]; hard_primes y hard_syllogism con resultados exactos 120 y "No" y 0 artefactos.

Rendimiento de despliegue en RTX PRO 6000 Blackwell (96 GB VRAM, 24 nucleos fisicos): 50,72 tok/s de decodificacion mediana, 407 tok/s de prefill, contexto de 256K verificado con recuperacion exacta a 73K y 146K tokens a 35,5 tok/s de decodificacion. Modo Code-Turbo (DSpark + Engram): hasta 59,3 tok/s en codigo.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el backbone IQ2_XXS ocupa aproximadamente 2.0 bpw sobre 204,8 B parametros, mas el shard Engram compartido de 110 GB en IQ4_NL (que puede residir en disco o memoria del sistema segun la configuracion de llama.cpp). La receta validada usa una GPU de 96 GB con offload de 15 capas MoE a CPU.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es la configuracion validada por el autor. No se documentan pruebas en A100, H100 o RTX 4090; con 24 GB de VRAM en una RTX 4090 el modelo completo no cabe y requeriria offload masivo a CPU con penalizacion severa de latencia.
- Cabe en consumer GPU: no en su configuracion completa; solo con offload extensivo a CPU y RAM del sistema, con throughput muy reducido.
- Opciones de despliegue: llama.cpp (build b11870 o superior) mediante llama-server, con flags -ngl 999, --n-cpu-moe 15, -c 262144, -b 2048, -ub 512, -fa on, -ctk q8_0, -ctv q8_0, --spec-type ngram-mod y --spec-draft-n-max 16. Ollama, vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: 50,72 tok/s de decodificacion mediana y 407 tok/s de prefill en la receta RTX PRO 6000; 35,5 tok/s de decodificacion a 146K tokens de contexto. Ajustar -t al numero de nucleos fisicos (24) duplico el throughput frente a -t 32 (de 24,5 a 50,4 tok/s); mantener mmap por defecto (--load-mode none reduce la velocidad a la mitad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (thiagovelsa, AntiOverthink) | 204,8 B | 256K | IQ2_XXS (2.0 bpw) | MIT | GGUF en Hugging Face |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF | 204,8 B | no disponible | IQ2_XXS | no disponible | GGUF en Hugging Face |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 204,8 B | no disponible | GSQ-RCO (incluye Engram IQ4_NL) | no disponible | GGUF en Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 204,8 B | no disponible | safetensors (original) | no disponible | Hugging Face |

Los cuatro modelos comparten la misma base de 204,8 B parametros; las diferencias estan en el proceso de abliteration (AtomicChat), la cuantizacion GSQ-RCO y el layout upstream (ISTA-DASLab), y el parche anti-overthinking y vector de control (este release). No se dispone de datos de benchmarks comparativos entre ellos mas alla de la tabla de overthinking incluida en la model card.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" con abliteration, no aplica filtros de rechazo: puede generar contenido inapropiado o danino. El uso en produccion requiere capas de moderacion externas y evaluacion legal.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; como todo modelo generativo de gran escala, puede producir afirmaciones incorrectas con alta confianza.
- El parche anti-overthinking puede, en teoria, suprimir razonamiento legitimo: el autor advierte que escalas del vector de control iguales o inferiores a -0.014 pueden provocar cierres prematuros de </think>.
- La cuantizacion IQ2_XXS (2.0 bpw) es muy agresiva y puede degradar la calidad frente al modelo original en safetensors; no se aportan comparativas de perplexidad.
- Idiomas soportados no documentados: no hay garantia de rendimiento en castellano ni en otros idiomas distintos del ingles.
- Dependencia de un shard Engram externo de 110 GB alojado en otro repositorio (ISTA-DASLab), lo que complica la reproducibilidad y el despliegue.
- Requiere llama.cpp b11870 o superior; versiones anteriores no soportan el layout de 6 shards ni el vector de control.
- El repositorio tiene solo 24 descargas y 0 likes en el momento de la ficha: es un release reciente y poco validado por la comunidad.
- Aunque la licencia declarada es MIT, la cadena de modelos base (DeepSeek-V4.1-Flash-1017, AtomicChat, ISTA-DASLab) no documenta su licencia en la informacion disponible; conviene verificar los terminos de cada eslabon antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thiagovelsa/DeepSeek-V4.1-Flash-1017-Uncensored-AntiOverthink-GSQ-RCO-GGUF
- Modelo base AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Draft DSpark para Code-Turbo: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
