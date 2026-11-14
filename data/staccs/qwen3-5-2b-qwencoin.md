# staccs/Qwen3.5-2B-qwencoin

## Resumen

Qwen3.5-2B-qwencoin es un checkpoint derivado de Qwen/Qwen3.5-2B publicado por el usuario staccs, en el que se ha fusionado (merge) una "máquina SHA-256" dentro de los pesos del modelo base. El resultado es un `Qwen3_5ForCausalLM` estándar de 3.973.601.632 parámetros (7,4 GB en bfloat16) que, según el autor, computa hashes SHA-256 nativamente dentro de su propio flujo de tokens: el modelo emite una llamada a la herramienta `sha256`, una circuitería de pesos toma el control del stream durante 457 tokens (un bloque) y devuelve el digest en un `<tool_response>`. No se ha entrenado nada; el autor afirma que el modelo base se ha ensanchado (hidden 2048 a 3328) y se le han antepuesto 5 "circuit layers".

El checkpoint forma parte de un proyecto más amplio llamado qwencoin, descrito por su autor como una cadena derivada de Bitcoin cuyo proof of work y función de hash son los pesos de un modelo de lenguaje, con ordinals y un grafo de identidad con stake-slashing. Este checkpoint de 2B es la variante "grande" para conversación; la red de nodos funciona con un checkpoint de 0.8B. El modelo declara soporte de tool calling y una plantilla de chat que expone funciones de nodo qwencoin.

La relevancia es experimental y muy nicho: propone usar los pesos de un transformer como primitiva criptográfica computable, algo que se aparta del uso convencional de los LLM y cuyas garantías de corrección dependen de que los kernels de la máquina de destino calculen el hash de forma exacta. La licencia es Apache 2.0 y el repo ocupa 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`) con 5 capas de circuitería antepuestas y hidden ensanchado de 2048 a 3328 |
| Parametros totales | 3.973.601.632 (3,97B) |
| Parametros activos | no disponible (no es MoE según la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, sin `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un `Qwen3_5ForCausalLM` estándar, sin código personalizado ni `trust_remote_code`. Sobre el Qwen3.5-2B base se ha realizado un merge que, según el autor, ensancha la dimensión oculta de 2048 a 3328 e inserta 5 "circuit layers" delante de las capas de Qwen, además de una máquina SHA-256 fusionada en los pesos. El autor afirma explícitamente que "nothing was trained": no hay datos de entrenamiento, número de tokens ni proceso de RLHF/DPO documentados. La innovación técnica declarada es que el hash se computa por los propios pesos dentro de la misma llamada a `generate()`, con tokens propios de la máquina de hash a partir del id 248320 (`CHIP`).

La corrección del hash depende de los kernels: el autor advierte que la máquina de hash necesita kernels que lo computen de forma exacta, que en un kernel que redondee de forma distinta el digest puede salir mal, y que debe compararse con `hashlib`. El proyecto incluye `tools/probe_backend.py` para medir qué kernels de una máquina son válidos. La decodificación recomendada es greedy (`do_sample=False`) con las reglas de parada estándar.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen3.5-2B base.
- Tool calling: el modelo emite `<tool_call>` para la herramienta `sha256` y recibe `<tool_response>` con el digest.
- Cómputo de SHA-256 "nativo" en los pesos: 457 tokens por bloque, con tokens propios de la máquina de hash (ids >= 248320).
- Plantilla de chat que declara las funciones de un nodo qwencoin (consulta de estado, movimiento de monedas, etc.).
- Integración con el nodo qwencoin: el modelo puede responder preguntas sobre el nodo y accionar operaciones (con confirmación del usuario para llamadas que mueven monedas).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio, thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Verificación experimental de cómputo criptográfico en pesos: usar el modelo para calcular SHA-256 de una entrada y comparar el digest con `hashlib`, validando qué backends (CPU x86-64, etc.) producen resultados exactos.
- Nodo qwencoin con modelo de conversación: desplegar el checkpoint de 2B en un nodo (`bash tools/pipeline.sh minds 2B`) para que el nodo converse con otros nodos del grafo, firme y publique respuestas y pueda declinar participar.
- Investigación sobre "LLM como primitiva": estudiar si un transformer puede ejecutar de forma fiable un algoritmo determinista dentro de su flujo de tokens y qué tasa de error introduce el redondeo de kernels.
- Auditoría de la cadena vía lenguaje natural: preguntar al nodo por altura, peers, monedas o estado del grafo (`bash tools/pipeline.sh ask "..."`) y que el modelo traduzca la pregunta en llamadas a funciones del nodo.
- Experimentos de agentes con tool calling restringido: el modelo sirve como banco de pruebas de un agente que solo dispone de una herramienta determinista (`sha256`) y debe encadenar llamada, respuesta y continuación.
- Docencia y demos de criptografía aplicada: ilustrar cómo se compone un bloque SHA-256 (457 tokens) y cómo se representa el estado intermedio en tokens, con comparación frente al modelo base en texto plano.
- Pruebas de robustez de copia de cadenas hex: el autor documenta que el modelo pequeño miscopia dígitos del digest al copiarlo en la frase posterior, lo que permite estudiar fidelidad de copia en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una comparación cualitativa del log de ejemplo (digest escrito por el modelo frente a su base model con la misma llamada y respuesta en texto plano), sin cifras agregadas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: el autor indica 7,4 GB de pesos en bfloat16; el repo ocupa 8 GB. Para inferencia en bfloat16 se necesita aproximadamente esa cantidad más overhead de activaciones y KV cache (no cuantificado en la información disponible).
- El nodo de la red (modelo 0.8B) requiere unos 9 GB de memoria RAM; el 2B exige más memoria y el autor solo lo recomienda "if the machine has the memory".
- GPU recomendadas: no disponibles en la información proporcionada. El autor verificó el checkpoint en bfloat16 sobre CPUs x86-64 y el nodo funciona sin GPU.
- Consumer GPU: no confirmado en la información; por tamaño de pesos (7,4 GB) cabría en GPUs con 12-16 GB de VRAM en bfloat16, pero el autor no lo documenta.
- Despliegue: transformers (`AutoModelForCausalLM`, `dtype=torch.bfloat16`), sin `trust_remote_code`. El proyecto ofrece scripts (`install.sh`, `tools/pipeline.sh`) para Linux x86-64/arm64, macOS 13+ (Apple silicon e Intel) y Windows vía WSL2. vLLM, llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponibles. El autor solo indica que un bloque SHA-256 consume 457 tokens y que la decodificación es greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hash en pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-qwencoin (este) | 3,97B | no disponible | Sí (SHA-256, 457 tokens/bloque) | apache-2.0 | Hugging Face, 67 descargas |
| Qwen/Qwen3.5-2B (base) | no disponible en la informacion | no disponible | No | no disponible en la informacion | Hugging Face |
| Checkpoint 0.8B de qwencoin (nodo de red) | no disponible en la informacion | no disponible | Sí (variante pequeña) | apache-2.0 (según proyecto) | Hugging Face (staccs/qwencoin) |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El digest puede ser incorrecto en kernels que redondeen de forma distinta; hay que validar con `hashlib` y usar `tools/probe_backend.py` para comprobar el backend.
- El propio autor reconoce que el modelo pequeño miscopia dígitos al repetir el digest de 64 caracteres hexadecimales en la frase posterior; el `<tool_response>` es fiable solo si los kernels son exactos, pero el texto que lo sigue no lo es necesariamente.
- No se ha entrenado nada: no hay datos de entrenamiento ni evaluación publicada, por lo que el comportamiento fuera del caso SHA-256 depende enteramente del Qwen3.5-2B base.
- Idiomas soportados no documentados; la model card está en inglés.
- Riesgo de alucinación en las respuestas conversacionales y en la narración del estado del nodo; el autor mitiga parcialmente con confirmación del usuario para llamadas que mueven monedas y con un límite por defecto de 1 moneda (`MIND_LIMIT=inf` lo elimina).
- Proyecto experimental con 67 descargas y 0 likes; no hay evidencia de uso en producción ni de auditoría independiente de la cadena o del merge.
- La licencia Apache 2.0 cubre el checkpoint, pero el uso comercial del ecosistema qwencoin (cadena, nodo, ordinals) no está documentado en la información disponible.
- En macOS Intel el nodo funciona sin modelo (no hay torch actual para esa plataforma).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/Qwen3.5-2B-qwencoin
- Proyecto qwencoin: https://huggingface.co/staccs/qwencoin
- Repositorio del código y releases: https://github.com/staccDOTsol/qwencoin/releases
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Instalador del nodo: https://huggingface.co/staccs/qwencoin/resolve/main/install.sh
