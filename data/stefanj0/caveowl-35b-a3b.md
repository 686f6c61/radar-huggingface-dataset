# stefanj0/caveowl-35b-a3b

## Resumen

caveowl-35b-a3b es un ajuste fino LoRA en bf16 de ornith-ai/Ornith-1.5-35B-A3B (derivado de Qwen3.6-35B-A3B, licencia MIT), publicado por el usuario stefanj0. Su particularidad no es la capacidad bruta sino el registro: responde en estilo telegrafico ("caveman"), eliminando articulos, copulas y relleno pero conservando los hechos. El estilo esta en los pesos, no en un system prompt, de modo que se mantiene aunque el cliente no imponga instrucciones de formato.

El modelo conserva las capacidades del modelo base (tool calling, codigo, uso de habilidades de agente) y anade una torre de vision sin modificar: el proyector multimodal es el stock de Ornith, copiado byte a byte. Con 35.505.251.456 parametros totales y una ventana servida de 262.144 tokens (dos slots de 131.072 con `--parallel 2`), esta pensado para respuestas cortas en terminal y movil, y para reducir el consumo de tokens en agentes.

Es relevante ahora porque ataca un coste practico de los agentes (tokens de salida y latencia) mediante estilizacion supervisada en lugar de prompting, y porque publica artefactos completos y verificables: adaptador PEFT, GGUF Q4_K_M con importance matrix, hashes SHA-256 y la receta reproducible del *run* 5 en GitHub. El autor lo usa a diario en una maquina AMD Strix Halo detras del agente de codigo pi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivado de Qwen3.6-35B-A3B) con torre de vision; ajuste LoRA sobre el modelo base |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (la nomenclatura "A3B" del nombre sugiere ~3 B activos; no confirmado en la informacion) |
| Longitud de contexto | 262.144 tokens en la configuracion servida (2 slots de 131.072 con `--parallel 2`); contexto nativo del base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (con importance matrix sobre wikitext-2, 200 chunks); proyector vision en f16; adaptador LoRA bf16 con tensores F32 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (modelo fusionado cuantizado + mmproj) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B (revision `10fbf86fed7ecee4a061f8b499a618f46001cac1`) |
| Tipo de ajuste | LoRA, r=16, alpha=32, guardado con Unsloth |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 26,4 GB (GGUF 21,7 GB + mmproj 0,9 GB + adaptador 3,77 GB) |

## Arquitectura y entrenamiento

La base es un transformer de mezcla de expertos (MoE) de la familia Qwen3.6-35B-A3B, con 35,5 B de parametros totales y una torre de vision que aporta la modalidad image-text-to-text. Sobre ella se aplica un LoRA de rango 16 y alpha 32, entrenado en bf16, que no toca la torre de vision: por eso el `mmproj` publicado es el proyector f16 stock de Ornith (conversion de bartowski), identico byte a byte al del repositorio de GGUF del autor original. El adaptador final se guarda con Unsloth y se fusiona en el base bf16 para producir el GGUF.

La mezcla de datos esta declarada e incluye nvidia/Nemotron-Agentic-v1 y julien-c/synthtraces (trazas de agente y tool calling), HuggingFaceTB/smoltalk2, OpenAssistant/oasst2 y HuggingFaceH4/ultrachat_200k (conversacion), google-research-datasets/mbpp, openbmb/UltraData-Code, theblackcat102/evol-codealpaca-v1, princeton-nlp/SWE-bench_Verified, ronantakizawa/github-codereview y bigcode/commitpackft (codigo, revision de codigo y commits). No se especifican el numero total de tokens, la composicion exacta por fraccion ni si hubo etapas de RLHF o DPO; el objetivo del ajuste es estilistico (registro telegrafico) y de preservacion de habilidades, no una nueva fase de alineamiento.

Detalles de ingenieria destacables: la cuantizacion Q4_K_M usa una importance matrix calculada sobre el split de entrenamiento de wikitext-2 (200 chunks); el GGUF lleva el chat template con el que se entreno el modelo (variante del template del Hub corregida por Unsloth) y una temperatura por defecto embebida de 0,3 (el base trae 1,0); el razonamiento se sirve con `--reasoning-format deepseek`. El tensor data del GGUF es identico al del fichero evaluado (SHA-256 sobre las 753 tensores); solo se limpiaron metadatos (nombre, rutas locales de la imatrix y temperatura de muestreo).

## Capacidades

- Generacion de texto en registro telegrafico: elimina articulos, copulas y relleno manteniendo los hechos (ejemplo de la model card: resumen de Chernobyl en 30 palabras frente a 44 del base).
- Tool calling / function calling: requiere `--jinja` en llama.cpp; el template entrenado esta embebido en el GGUF.
- Razonamiento multi-paso y flujo de agente: la mezcla incluye Nemotron-Agentic-v1, synthtraces y habilidades tipo pi (skills de agente).
- Codigo: generacion (UltraData-Code, evol-codealpaca), revision de codigo (github-codereview) y commits (commitpackft).
- Vision: heredada del base mediante el proyector stock; el LoRA no modifica la torre de vision.
- Capacidades de razonamiento explicito: soporta `--reasoning-format deepseek` en llama.cpp (modo de razonamiento del template).
- Multilingue: no disponible; la model card declara solo `en`.
- Contexto largo: hasta 262.144 tokens de ventana en la configuracion de servicio documentada.

## Casos de uso

- Asistente de terminal de uso diario: el autor lo emplea como modelo de asistente detras del agente de codigo pi en una maquina AMD Strix Halo; el registro telegrafico reduce tokens de salida en cada turno sin perder informacion tecnica.
- Reduccion de coste en agentes conversacionales: al responder en ~30 palabras donde el base usa ~44 en el ejemplo publicado, baja el gasto de tokens de salida en despliegues con muchas llamadas y respuestas cortas.
- Tool calling en pipelines de automatizacion: con `--jinja` y temperatura 0,3 genera llamadas con argumentos completos (el chequeo interno comprobo la inclusion de parametros como `max_results` en 90/90 llamadas a esa temperatura).
- Ayuda de shell y operaciones: dado su uso previsto declarado (shell y code help), encaja en asistentes que devuelven comandos escuetos, faciles de copiar y ejecutar.
- Revision de codigo y resumen de commits: los datasets de codereview y commitpackft apuntan a tareas de diff-review y mensajes de commit concisos, donde el estilo breve es una ventaja y no un defecto.
- Procesamiento de imagenes con salida breve: al conservar la torre de vision y el mmproj, puede describir o extraer datos de una captura o diagrama en pocas lineas (no evaluado en la informacion disponible).
- Documentacion operativa y resumenes de incidentes: util para notas factuales tipo post-mortem en las que se prioriza densidad sobre prosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni comparaciones estandar con el modelo base). El unico dato cuantitativo aportado es una prueba interna de fidelidad de tool calls ("sampler-check") sobre llamadas muestreadas:

| Prueba | caveowl-35b-a3b | Ornith-1.5-35B-A3B (stock) |
|---|---|---|
| Tool calls muestreadas | 90 | 360 (cuatro noches) |
| Temperatura 0,6: omisiones de `max_results` solicitado | 2 de 90 | 0 de 360 |
| Temperatura 0,3: resultado | 90/90 correctas | 90/90 correctas |

No hay datos publicados de latencia, throughput ni evaluaciones de calidad de texto o codigo frente al base.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M ocupan unos 22 GB y hay que sumarles la cache KV; en la maquina del autor el servidor completo (con `--ctx-size 262144 --parallel 2`) consume unos 25 GiB de memoria de GPU.
- GPU recomendadas: no se documentan modelos concretos de GPU de datacenter; el entorno de referencia es una AMD Strix Halo con memoria unificada.
- GPU de consumo: en tarjetas de 24 GB (por ejemplo, RTX 4090) los 22 GB de pesos dejan muy poco margen para cache KV, por lo que habria que reducir contexto o usar cuantizaciones mas agresivas; no verificado en la informacion.
- Despliegue: llama.cpp (`llama-server`) es el unico runtime documentado, con `--flash-attn on`, `--cache-type-k q8_0`, `--cache-type-v q8_0` y `--ngl 999`. Otros motores (vLLM, TGI, Ollama) no estan verificados; el adaptador PEFT requiere fusion con el base o carga mediante el stack de PEFT/Unsloth.
- Parametros de servicio fijados: `--temp 0.3 --top-k 20 --top-p 0.95`, `--jinja`, `--reasoning-format deepseek`; la temperatura es critica porque a 0,6 aparecen omisiones de argumentos en tool calls.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| caveowl-35b-a3b | 35,5 B totales (activos no disponible) | 262.144 tokens servidos | Si (proyector stock) | MIT | GGUF Q4_K_M + adaptador LoRA | Registro telegrafico entrenado; run 5 de la receta |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,5 B totales | no disponible | Si | MIT | Peso original y GGUF (bartowski, ornith-ai) | Sin estilizacion; 0 omisiones en 360 tool calls a 0,6 |
| cavegemma (Julius Brussee) | no disponible | no disponible | no disponible | no disponible | Repositorio GitHub | Proyecto original del mismo estilo, base Gemma; caveowl es su port a 35B |
| Alternativas MoE ~30-35 B (Qwen3-30B-A3B y similares) | no disponible | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada para una comparacion rigurosa |

## Limitaciones y advertencias

- No esta pensado para escritura larga: el registro telegrafico degrada la prosa y la coherencia en textos extensos, tal como advierte el propio autor.
- Solo ingles declarado: no hay evidencia de soporte de castellano ni de otros idiomas; usarlo en espanol supone un riesgo de calidad no medido.
- Sensibilidad a la temperatura: a 0,6 omitio un argumento solicitado en 2 de 90 tool calls; hay que fijar 0,3 en servidor y cliente, porque algunas interfaces envian su propia temperatura.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; el estilo conciso puede ademas eliminar matices y hedging necesarios, presentando afirmaciones dudosas como hechos.
- Vision no evaluada: el proyector es el stock y el LoRA no toca la torre de vision; no hay pruebas publicadas del rendimiento multimodal de esta mezcla.
- Licencia MIT, pero las licencias y condiciones de los datasets de entrenamiento (SWE-bench Verified, oasst2, Nemotron-Agentic-v1, entre otros) no se detallan; conviene revisarlas antes de un uso comercial.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la ficha; es un artefacto personal, con un unico conjunto de evaluacion interno (90 llamadas).
- El adaptador no es plug-and-play sobre otros modelos: requiere exactamente el base y la revision indicada.
- Metadatos del GGUF modificados respecto al fichero de trabajo (nombre, rutas de imatrix, temperatura); el tensor data es identico, pero conviene verificar hashes al desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefanj0/caveowl-35b-a3b
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Receta, constructores de datos y scripts de evaluacion (run 5): https://github.com/sjvrensburg/caveowl
- Proyecto original cavegemma: https://github.com/JuliusBrussee/cavegemma
- GGUF del modelo base (bartowski): https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- GGUF oficial del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Agente de codigo pi: https://github.com/earendil-works/pi
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (solo paginas sin relacion); no se han podido anadir papers, blogs ni demos adicionales.
