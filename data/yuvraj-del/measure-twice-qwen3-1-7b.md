# yuvraj-del/measure-twice-qwen3-1.7b

## Resumen

Measure Twice es un conjunto de adaptadores LoRA (y QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario yuvraj-del para el hackathon Lexsi AI Safety & Alignment (Track 3: Agentic Fine-tuning). El objetivo no es crear un modelo nuevo, sino especializar un transformer denso de 1.700 millones de parametros para que actue como agente de tool calling mas fiable y mas seguro: completar la tarea, evitar llamadas redundantes, comprobar el estado antes de acciones destructivas y rechazar peticiones daninas.

El repositorio contiene cuatro variantes de adaptadores: el adaptador raiz con SFT + GRPO (el modelo principal), `sft/` (SFT sobre trayectorias optimas mas rechazos variados), `sft-no-refusals/` (ablacion sin rechazos, publicada solo para reproducir la regresion de seguridad) y `grpo-v2/` (segunda ronda de GRPO con penalizaciones mas duras, resultado negativo). Segun la model card, el entrenamiento se hizo con QLoRA de 4 bits en una GPU de portatil de 6 GB.

Su relevancia actual es doble: por un lado demuestra que el ajuste fino agente con GRPO es viable en hardware de consumo; por otro, cuantifica el compromiso entre utilidad y seguridad en agentes pequenos, mostrando que un SFT sin datos de rechazo degrada la seguridad por debajo del modelo base. El contexto, los idiomas y la licencia no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptadores LoRA/QLoRA sobre el modelo base |
| Parametros totales | 1.700 millones (modelo base Qwen/Qwen3-1.7B); tamano de los adaptadores no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento con QLoRA de 4 bits; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); libreria `peft` |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 0,3 GB |
| Metodo de entrenamiento | SFT + GRPO (TRL), QLoRA de 4 bits |
| Formato de prompt | Hermes-style `<tool_call>` de Qwen3 con `enable_thinking=False` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso Qwen3-1.7B y anade adaptadores de bajo rango (LoRA) entrenados mediante QLoRA de 4 bits. El pipeline de entrenamiento combina una fase de SFT sobre trayectorias optimas de uso de herramientas, complementada con rechazos variados ante peticiones daninas, seguida de una fase de GRPO (Group Relative Policy Optimization) implementada con TRL. El entrenamiento se ejecuto en una GPU de portatil con 6 GB de VRAM, lo que constituye en si mismo un dato tecnico relevante sobre el coste del ajuste fino agente en modelos pequenos.

La innovacion principal no esta en la arquitectura sino en la metodologia de evaluacion y en el diseno de recompensas: el GRPO penaliza llamadas redundantes y turnos invalidos, y el conjunto de datos incluye rechazos explicitos para mitigar el aumento de intentos daninos que introduce el SFT convencional. El repositorio publica ademas una ablacion (`sft-no-refusals/`) que demuestra que eliminar los rechazos del dataset eleva los intentos daninos en AgentHarm del 71,7 % del base al 98,1 %, y una segunda ronda de GRPO (`grpo-v2/`) con penalizaciones mas agresivas de desperdicio que no mejoro al adaptador raiz. El numero de tokens de entrenamiento y la composicion exacta del dataset no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y razonamiento de varios pasos en el contexto de tareas agente.
- Tool calling y function calling en formato Hermes-style `<tool_call>` de Qwen3, con `enable_thinking=False`.
- Planificacion de acciones con comprobacion previa ante operaciones destructivas (el nombre "measure twice" alude a medir dos veces antes de cortar).
- Reduccion de llamadas redundantes a herramientas respecto al modelo base.
- Rechazo de peticiones daninas, con una tasa de intentos daninos en AgentHarm del 54,7 % frente al 71,7 % del base.
- Manejo de un sandbox sintetico de 12 herramientas, con mejora en tipos de tarea no vistos (35,9 % frente al 5,1 % del base).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes de automatizacion con herramientas acotadas: el adaptador esta entrenado sobre un sandbox de 12 herramientas y mejora la tasa de exito de tareas del 42,5 % al 77,5 %, por lo que encaja en asistentes que orquestan un conjunto fijo de APIs (calendario, ficheros, correo) en entornos controlados.
- Despliegue en hardware de consumo: al ser un adaptador sobre un modelo de 1,7B entrenado con QLoRA en 6 GB, puede ejecutarse en portatiles con GPU modesta para prototipos de agentes y demos.
- Filtrado previo de acciones destructivas: el modelo comprueba el estado antes de ejecutar operaciones irreversibles, util en pipelines de administracion de sistemas donde un borrado o una escritura erronea tiene coste alto.
- Evaluacion de seguridad de agentes: la variante `sft-no-refusals/` y los datos de AgentHarm permiten reproducir y estudiar la regresion de seguridad que introduce el SFT sin rechazos, como caso de estudio en auditorias de alineamiento.
- Investigacion en RL para agentes: el par SFT + GRPO y la ablacion `grpo-v2/` sirven como referencia reproducible para experimentar con funciones de recompensa que penalizan desperdicio de llamadas.
- Asistentes de soporte tecnico con tool calling: la mejora en tipos de tarea no vistos (del 5,1 % al 35,9 %) sugiere cierta generalizacion a herramientas y flujos no vistos durante el entrenamiento, util en mesas de ayuda con APIs heterogeneas.
- Base para ajuste fino adicional: al ser adaptadores PEFT sobre Qwen3-1.7B, se pueden combinar o sustituir por otros adaptadores en pipelines existentes de la familia Qwen3.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 200 tareas de test en sandbox y AgentHarm (53 prompts daninos reservados):

| Metrica | Base | SFT sin rechazos | SFT | SFT + GRPO |
|---|---:|---:|---:|---:|
| Exito de tarea (%) | 42,5 | 68,0 | 72,5 | 77,5 |
| Tipos de tarea no vistos (%) | 5,1 | 35,9 | 17,9 | 35,9 |
| Llamadas redundantes (%) | 29,0 | 20,2 | 16,1 | 20,2 |
| Turnos invalidos (%) | 2,3 | 10,5 | 4,4 | 2,3 |
| AgentHarm, intentos daninos (%) | 71,7 | 98,1 | 54,7 | 54,7 |
| BFCL simple / multiple (%) | 90 / 86 | 88 / 90 | 90 / 90 | 90 / 90 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Qwen3-1.7B en precision completa requiere del orden de 3,4 GB solo para pesos, y en 4 bits aproximadamente 1 GB, mas overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas en la informacion proporcionada. El entrenamiento se realizo en una GPU de portatil con 6 GB de VRAM mediante QLoRA de 4 bits.
- Cabe en GPU de consumo: si, dado el tamano del modelo base (1,7B) y que el entrenamiento cupo en 6 GB; el adaptador ocupa 0,3 GB.
- Opciones de despliegue: la model card muestra uso con `transformers` + `peft` (`AutoModelForCausalLM.from_pretrained` y `PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Measure Twice (Qwen3-1.7B LoRA) | 1,7B (base) | no disponible | Tool calling seguro via SFT + GRPO | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Modelo generalista con tool calling | no disponible en la informacion | Hugging Face |
| Otros adaptadores de agente sobre modelos de 1-2B | no disponible | no disponible | SFT/RL para tool use | no disponible | no disponible |

La comparativa se limita al modelo base porque la informacion proporcionada no incluye datos de alternativas equivalentes. Frente a Qwen3-1.7B, el adaptador mejora el exito de tarea (77,5 % frente a 42,5 %) y reduce intentos daninos en AgentHarm (54,7 % frente a 71,7 %), a costa de aumentar las llamadas por tarea.

## Limitaciones y advertencias

- Entrenado y evaluado sobre un sandbox sintetico de 12 herramientas; la generalizacion a herramientas reales y dominios abiertos no esta demostrada.
- Una sola semilla por modelo, por lo que la significancia estadistica de las diferencias no esta establecida.
- AgentHarm se puntua por intentos de tool call en el primer turno, lo que puede infraestimar o sobreestimar el dano real en conversaciones multiturno.
- Las llamadas por tarea aumentan respecto al modelo base, porque el base a menudo abandona antes; esto incrementa coste y latencia en produccion.
- La variante `sft-no-refusals/` es menos segura que el modelo base (98,1 % de intentos daninos en AgentHarm) y el autor advierte explicitamente de que no debe desplegarse.
- `grpo-v2/` es un resultado negativo y no supera al adaptador raiz.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados y longitud de contexto no disponibles.
- Riesgo de alucinacion en la generacion de argumentos de herramientas no caracterizado en la informacion proporcionada.
- Sesgos conocidos no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvraj-del/measure-twice-qwen3-1.7b
- Codigo, metodo y guia de reproduccion: https://github.com/yuvraj-del/measure-twice
- Demo: https://huggingface.co/spaces/yuvraj-del/measure-twice
- Dataset, salidas de evaluacion y logs: https://huggingface.co/datasets/yuvraj-del/measure-twice-data
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
