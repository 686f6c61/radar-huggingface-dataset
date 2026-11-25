# twaggs88/gemma-4-26B-A4B-it-pulsar-k4

## Resumen

`twaggs88/gemma-4-26B-A4B-it-pulsar-k4` es un contenedor listo para servir del modelo `google/gemma-4-26B-A4B-it`, empaquetado por el autor twaggs88 para su motor de inferencia propio, pulsar. No es un modelo nuevo: es una distribucion cuantizada a EXL3 4.0 bpw (con la cabeza de salida a unos 6 bpw) que anade dos componentes auxiliares sobre los mismos pesos: el adaptador de decision JEV, que devuelve probabilidades calibradas, y el borrador de bloques DFlash, empleado para decodificacion especulativa.

La relevancia practica del paquete esta en que combina en un unico proceso de servidor tres funciones que normalmente requieren despliegues separados: chat generativo (API compatible con OpenAI y Anthropic), un juez de seguridad de una sola pasada (`/v1/systemone`) y decodificacion especulativa activada por defecto. Todo ello cabe en 15 GB en disco y se ha servido en una unica Quadro RTX 6000 (Turing, sm_75, 24 GB) con tres bancos de KV de 131.072 tokens y 22,3 GB de VRAM en uso.

El modelo base es un transformer MoE de Gemma 4 con 26B de parametros nominales y 4B activos; el checkpoint safetensors de este repositorio declara 15.143.642.934 parametros reales. La torre de vision no esta incluida: el paquete es solo texto. La licencia es Apache-2.0, con sujecion adicional a los terminos de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), decoder linears y 128 expertos enrutados en EXL3 4.0 bpw |
| Parametros totales | 15.143.642.934 (segun safetensors del repo); modelo base nominal 26B-A4B |
| Parametros activos | no disponible (el modelo base se denomina A4B, ~4B activos) |
| Longitud de contexto | 131.072 tokens (tres bancos KV de 131.072 en la configuracion de referencia) |
| Tipos de cuantizacion | EXL3 4.0 bpw (linears y expertos), EXL3 ~6 bpw (cabeza de salida), BF16 (embeddings y normas), F16 (LoRA JEV y drafter DFlash), F32 (cabeza de decision JEV) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, sujeta ademas a los terminos de Gemma 4 de Google |
| Formato de pesos | safetensors, contenedor propio de pulsar (34 shards), cuantizacion generada con exllamav3 1.6.5 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Gemma 4, con 128 expertos enrutados y una cabeza de salida de gran tamano. Este repositorio no entrena nada: cuantiza los pesos del modelo base con exllamav3 1.6.5 usando sus valores por defecto y codebook `mul1`, y los reempaqueta byte a byte en el contenedor de pulsar. Los linears del decoder y los 128 expertos enrutados quedan en EXL3 4.0 bpw; la cabeza de salida en EXL3 a unos 6 bpw; embeddings y normas se mantienen en BF16 tal como los publica Google. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni las fases de RLHF o DPO del modelo base.

Sobre esa base se anaden dos componentes que pulsar ejecuta desde los mismos pesos. El primero es el adaptador JEV (LoRA de rango 32, alpha 64, aplicado a atencion y MLP denso) junto con una cabeza de decision de 24 slots, que no se fusiona en los pesos base: pulsar lo aplica solo a las peticiones de juicio, de modo que el chat corre con los pesos Gemma sin modificar. El segundo es el borrador DFlash de 5 capas, que implementa decodificacion especulativa por bloques (paper arXiv:2602.06036) y esta activado por defecto. La innovacion destacable es la convivencia de chat, juez calibrado y drafting en un unico proceso con bancos KV separados (`--judge-banks 1` reserva un banco para el juez).

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 131.072 tokens.
- Razonamiento y generacion de codigo, con modo de razonamiento conmutable (`--reasoning off` en la configuracion de referencia).
- Juicio de seguridad calibrado en una sola pasada de prefill mediante `POST /v1/systemone`, con preguntas tipadas: `noul` (booleano), `choice` y `score`, devolviendo probabilidades por opcion y `p_block`.
- Decodificacion especulativa integrada (DFlash), activada por defecto.
- API compatible con OpenAI (`POST /v1/chat/completions`) y con Anthropic (`POST /v1/messages`).
- Soporte de tool calling a nivel de prompt: el autor evalua con un prompt de herramienta de 114 tokens, y el caso de uso documentado es el juicio de llamadas a herramientas de agentes de codigo.
- Capacidad multilingue: no disponible.
- Vision: no incluida (torre de vision ausente, solo texto).
- Audio: no disponible.

## Casos de uso

- Juez de seguridad de etapa 1 para agentes de codigo: JEV puntua cada llamada a herramienta (por ejemplo, un `Bash` con `rm -rf ~`) y devuelve `p_block`; si la puntuacion es alta, Gemma escribe el juicio de etapa 2. Apropiado por la latencia de 0,12-0,7 s por decision y por las probabilidades calibradas.
- Atencion al cliente automatizada: conversaciones multi-turno con hasta 131.072 tokens de contexto, servidas por la API compatible con OpenAI, lo que permite reutilizar clientes existentes sin cambios.
- Asistente de codigo en IDE o CLI: generacion de codigo con un throughput medido de ~205 tokens/s en prompt de codigo sobre una RTX 6000, suficiente para completado interactivo.
- Despliegue en hardware legacy: el paquete esta pensado para GPUs Turing (sm_75) de 24 GB, lo que permite servir un MoE de 26B-A4B en tarjetas de generacion anterior sin recurrir a multi-GPU.
- Pasarela de moderacion previa a acciones de agentes: el endpoint `/v1/systemone` acepta un `state` JSON arbitrario y preguntas tipadas, de modo que se puede intercalar como guardrail en pipelines de agentes antes de ejecutar herramientas destructivas.
- Servicio de chat con razonamiento conmutable: el flag `--reasoning off` permite desactivar el modo de razonamiento para reducir latencia en cargas conversacionales, y activarlo para tareas analiticas.
- Prototipado e investigacion de decodificacion especulativa: al incluir el drafter DFlash y el motor pulsar, sirve como banco de pruebas reproducible de drafting por bloques sobre pesos EXL3.

## Benchmarks y rendimiento

Calidad de los pesos de chat frente al modelo BF16, segun el autor (una muestra de texto de 1.948 tokens y un prompt de herramienta de 114 tokens):

| Metrica | Texto largo | Prompt de herramienta |
|---|---|---|
| NLL de los siguientes tokens reales, BF16 | 7,111 | 9,819 |
| NLL, exllamav3 4.0 | 7,102 | 9,768 |
| NLL, pulsar | 7,157 | 9,552 |
| KL de logits (BF16 ‖ pulsar), mediana | 0,10 | 0,27 |

Juez JEV sobre los pesos 4.0 con la LoRA aplicada en tiempo de ejecucion:

| Metrica | Resultado |
|---|---|
| 18 acciones de agente etiquetadas a mano (block/allow) | 18/18 con P(block) >= 0,25 |
| 52 casos frente a las probabilidades del modelo de referencia | media de abs(Delta P) 0,043; maximo 0,265 |
| Latencia por decision en RTX 6000 | ~0,12-0,7 s (dependiente de la cache de prompt) |

Velocidad con una RTX 6000, greedy, 400 tokens, DFlash activado, peticion unica:

| Prompt | Codigo | Explicar | Listar | Relato |
|---|---|---|---|---|
| tokens/s | ~205 | ~145 | ~138 | ~109 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las muestras de evaluacion (18 y 52 casos) son conjuntos pequenos, segun reconoce el propio autor.

## Requisitos de hardware

- VRAM: 22,3 GB en uso en la configuracion de referencia (tres bancos KV de 131.072 tokens, un banco para el juez, chat y juez en el mismo proceso).
- Disco: 16,4 GB de repositorio (15 GB segun el autor).
- GPU probada: Quadro RTX 6000 (Turing, sm_75, 24 GB). El autor indica que solo lo ha servido en Turing.
- Compilacion: `make pulsar-server CUDA_ARCH=sm_75` desde la rama `dev` de pulsar (cualquier commit desde `07aa3a19`).
- Cabe en GPU de consumo: no confirmado; el requisito de 22,3 GB de VRAM excede los 24 GB solo con holgura minima y no hay datos para tarjetas de 16 GB o menos. No disponible para RTX 4090 (24 GB) sin verificar.
- Opciones de despliegue: exclusivamente el servidor de pulsar (`pulsar-server`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: ~205 tokens/s (codigo), ~145 (explicar), ~138 (listar), ~109 (relato) en peticion unica.
- Latencia del juez: ~0,12-0,7 s por decision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-pulsar-k4 (este) | 15,14B reales (base 26B-A4B) | 131.072 | EXL3 4,0 bpw + drafter DFlash + LoRA JEV | Apache-2.0 + terminos Gemma 4 | Contenedor de inferencia con juez calibrado integrado |
| google/gemma-4-26B-A4B-it | 26B-A4B | no disponible en la informacion | BF16 original | Apache-2.0 + terminos Gemma 4 | Modelo base sin cuantizar |
| autotrust/JEV-Gemma4-26B-A4B | no disponible | no disponible | no disponible | Apache-2.0 | Adaptador de decision JEV de referencia |
| z-lab/gemma-4-26B-A4B-it-DFlash | no disponible | no disponible | BF16 | Apache-2.0 | Drafter de decodificacion especulativa |

La comparacion con alternativas de otros fabricantes (por ejemplo, otros MoE de ~4B activos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de vision no esta incluida, por lo que no admite entradas de imagen.
- Solo se ha servido en Turing (sm_75); el soporte en otras arquitecturas no esta verificado.
- La evaluacion del juez se basa en 18 y 52 casos, conjuntos pequenos que no permiten extrapolar robustez en produccion.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- La licencia Apache-2.0 convive con los terminos de uso de Gemma 4 de Google, que anaden restricciones de uso comercial y de redistribucion; hay que revisarlos antes de desplegar.
- El adaptador JEV no esta fusionado: requiere el motor pulsar para aplicarlo en tiempo de ejecucion; otros motores no podran reproducir el comportamiento del juez.
- Sesgos conocidos del modelo base: no documentados en la informacion disponible.
- Dependencia de un motor propio (pulsar, rama `dev`) sin ecosistema de despliegue estandar (vLLM, TGI, llama.cpp), lo que limita la portabilidad.
- El contexto de 131.072 tokens exige reservar bancos KV completos; reducir el contexto o el numero de bancos es necesario para GPUs con menos de 24 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/twaggs88/gemma-4-26B-A4B-it-pulsar-k4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Adaptador JEV: https://huggingface.co/autotrust/JEV-Gemma4-26B-A4B
- Drafter DFlash: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Motor pulsar: https://github.com/tylerwagler/pulsar
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Terminos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
