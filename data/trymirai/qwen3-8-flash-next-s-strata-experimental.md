# trymirai/Qwen3.8-Flash-Next-S-strata-experimental

## Resumen

Qwen3.8-Flash-Next-S-strata-experimental es una cuantizacion experimental en 2 bits (formato trellis) del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario trymirai bajo el paraguas del proyecto Mirai. El paquete esta disenado especificamente para el motor de inferencia Strata, un fork de llama.cpp que permite ejecutar modelos de mezcla de expertos (MoE) con los expertos residentes en RAM del sistema y solo una parte cacheada en la GPU. El objetivo es claro: hacer viable un modelo de 51.200 millones de parametros en una unica tarjeta grafica de consumo, tipicamente una RTX 3090 o 4090 de 24 GB, o incluso una GPU de 12 GB con 64 GB de RAM.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantizacion agresiva sobre una arquitectura MoE con atencion hibrida (DeltaNet mas atencion clasica) y con una tabla n-grama (PLE) opcional. El autor reporta una metrica de calidad ROMA KL de 0.040 y un top-1 del 93,4% frente al modelo en bf16, muy superior al 0.303 de KL del IQ2_XS de GSQ-RCO, lo que sugiere que la cuantizacion trellis preserva mejor la distribucion de salida que una cuantizacion escalar de 2 bits convencional.

No obstante, conviene subrayar que se trata de un build experimental, atado a un parche concreto de Strata (v0.1.43, commit 7695859a), con requisitos de hardware y software muy especificos (Linux, driver NVIDIA 580+, CUDA 12.8+), y cuya licencia heredada es la Qwen Community License 1.0. No es un modelo para produccion sin validacion previa; es una pieza de investigacion para quienes quieran experimentar con inferencia MoE de bajo bit-width en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion hibrida (DeltaNet + atencion clasica), 512 expertos por capa; backbone y head en trellis k5 o Q8_0 |
| Parametros totales | 51.200.245.760 (51,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configurado en `--max-context`); KV cache en int8 con 32.768 tokens residentes |
| Tipos de cuantizacion | 2-bit trellis para expertos; Q8_0 y trellis k5 para backbone/head; Q2_0 para la capa MTP draft; FP8 para la tabla n-grama (opcional) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (heredada del modelo base) |
| Formato de pesos | GGUF (dos ficheros: `Qwen3.8-Flash-Next-S-qns.gguf` de 42,3 GB y `Qwen3.8-Flash-Next-S-qns-dense.gguf` de 2,1 GB; opcional `ple-fp8.gguf` de 51,2 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con atencion hibrida: combina capas DeltaNet (atencion lineal) con capas de atencion clasica, y emplea 512 expertos por capa. El autor no detalla el numero de parametros activos por token ni la composicion del dataset de entrenamiento original, por lo que esos datos deben consultarse en la model card del modelo base. Tampoco se documenta en esta ficha si hubo RLHF, DPO u otras fases de alineamiento; esa informacion no esta disponible en el material proporcionado.

La innovacion tecnica de este paquete no reside en el entrenamiento, sino en el metodo de compresion y en el runtime. Los expertos se empaquetan como blobs trellis de 2 bits (36,3 GB en RAM, frente a los 35,5 GB del IQ2_XS de GSQ-RCO), mientras que el backbone y el head se sirven desde un GGUF denso en trellis k5, lo que libera 1,45 GiB de VRAM frente a usar Q8_0. El motor Strata cachea en la GPU los expertos mas solicitados (segun un perfil de expertos, `--expert-profile`) y calcula el resto en CPU con AVX2. Ademas, incorpora decodificacion especulativa con una capa MTP draft cuantizada a Q2_0 (`--spec 4`, `--spec-min-p 0.5`) y una tabla n-grama FP8 (PLE) que actua como mecanismo de prediccion de tokens. El autor reporta que, con el parche de Strata, dos RTX 3090 alcanzan 104-113 tok/s en decodificacion tras corregir un bug de multi-GPU en la rotacion de expertos.

## Capacidades

- Generacion de texto autoregresiva con contexto largo (hasta 131.072 tokens configurados).
- Razonamiento multi-paso y cadenas de pensamiento, heredado del modelo base Qwen3.8-Flash-Next.
- Generacion de codigo y matematicas, presumiblemente a nivel del modelo base (no verificado en esta ficha).
- Soporte de tool calling y function calling: no documentado en el material proporcionado; debe validarse contra el modelo base.
- Capacidades de agente: el runtime expone una API compatible con OpenAI en `http://127.0.0.1:8080`, lo que facilita su integracion en bucles de agente.
- Decodificacion especulativa con capa MTP draft para acelerar la generacion.
- Multilingue: no disponible (los idiomas no se listan en la model card).
- Vision y audio: no disponible; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Experimentacion con cuantizacion de 2 bits en MoE: el paquete permite reproducir la comparativa ROMA KL (0.040 frente a 0.303 del IQ2_XS) sobre el mismo conjunto de 37.620 posiciones, util para investigar el impacto de esquemas trellis frente a escalares en modelos de 51 B.
- Inferencia local de un modelo de 51 B en una RTX 3090/4090: con 24 GB de VRAM y 96-128 GB de RAM, el motor Strata mantiene los expertos calientes en GPU y calcula el resto en CPU, permitiendo usar un modelo grande en una estacion de trabajo de consumo.
- Servicio de chat con contexto largo: la configuracion de ejemplo fija `--max-context 131072` con KV cache int8 y 32.768 tokens residentes, adecuada para conversaciones multi-turno o analisis de documentos extensos en local.
- Evaluacion de decodificacion especulativa: la capa MTP draft en Q2_0 y los parametros `--spec 4` y `--spec-min-p 0.5` permiten medir la ganancia de throughput de la especulacion en un MoE con expertos en CPU.
- Prototipado de agentes con API OpenAI-compatible: el servidor `serve.server` expone un endpoint compatible, de modo que frameworks como LangChain o LlamaIndex pueden apuntar a `127.0.0.1:8080` sin cambios de codigo.
- Investigacion sobre atencion hibrida DeltaNet: al conservar el backbone en trellis k5 y el resto del modelo en 2 bits, sirve para estudiar como se degrada la atencion lineal bajo compresion agresiva frente a la atencion clasica.
- Pruebas de escalado multi-GPU: el parche documenta `--layer-split` y el fix de rotaciones por tarjeta, permitiendo validar el reparto de capas entre dos GPU de 12-24 GB.

## Benchmarks y rendimiento

| Metrica | Este build (trellis 2-bit) | GSQ-RCO IQ2_XS | Notas |
|---|---|---|---|
| ROMA KL (vs bf16) | 0,040 | 0,303 | Medido fuera de Strata, 37.620 posiciones |
| Top-1 agreement (vs bf16) | 93,4% | no disponible | Mismo conjunto de 37.620 posiciones |
| Top-1 agreement teacher-forced (dentro de Strata, backbone Q8_0) | 99,28% | no disponible | 1.536 posiciones, respuestas del paquete vLLM |
| Top-1 agreement teacher-forced (trellis backbone y head) | 99,74% | no disponible | Dos prompts rechequeados |
| Ruido de prefill-vs-decode del paquete | 99,48% | no disponible | Suelo de ruido del propio paquete |
| Coincidencia greedy exacta | 192 tokens en 3 de 8 prompts | no disponible | Respuestas token a token |
| Throughput en 2x RTX 3090 | 104-113 tok/s | no disponible | Tras el fix multi-GPU del 2026-10-15 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores son metricas de fidelidad frente al modelo en bf16, no de capacidad absoluta.

## Requisitos de hardware

- VRAM estimada: 12 GB como minimo (RTX 30/40/50), 24 GB recomendado (RTX 3090 o 4090). El backbone y el head en trellis k5 liberan 1,45 GiB frente a Q8_0.
- RAM: 64 GB minimo, 96-128 GB recomendado. Los expertos ocupan 36,3 GB en RAM.
- CPU: x86-64 con AVX2; mas nucleos ayudan especialmente en tarjetas de 12 GB, donde la mayoria de lecturas de expertos fallan en la cache de GPU y la decodificacion queda limitada por CPU.
- Disco: 42 GB para el modelo, mas la tabla n-grama (28,8 GB con el shard IQ4_NL de ISTA o 51,2 GB con la tabla FP8 de Qwen). Se recomienda NVMe.
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB); RTX 30/40/50 de 12 GB como minimo. Con dos RTX 3090 se alcanzan 104-113 tok/s.
- Software: Linux, driver NVIDIA 580+, CUDA toolkit 12.8+ (13.x para RTX 50), git y python3.
- Opciones de despliegue: exclusivamente el motor Strata (fork de llama.cpp) con el parche `strata-qns.patch` sobre v0.1.43 (commit 7695859a). No es compatible con vLLM, Ollama, TGI ni llama.cpp estandar sin conversion.
- Latencia y throughput: 104-113 tok/s en configuracion de dos RTX 3090; no se documenta throughput en una sola tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-S-strata-experimental | 51,2 B (MoE) | 131.072 | 2-bit trellis | qwen-community-1.0 | Hugging Face, requiere Strata parcheado |
| Qwen3.8-Flash-Next-S-small-experimental | no disponible | no disponible | int4-table (convertible a trellis) | qwen-community-1.0 | Hugging Face, mismo autor |
| Qwen3.8-Flash-Next (base, bf16) | 51,2 B | no disponible | bf16 | qwen-community-1.0 | Hugging Face, referencia de calidad |
| GSQ-RCO IQ2_XS (referencia de cuantizacion) | 51,2 B | no disponible | IQ2_XS (2-bit escalar) | qwen-community-1.0 | Usado como plantilla GGUF y baseline de KL |

La comparativa de rendimiento entre estos modelos solo esta disponible en terminos de ROMA KL y top-1 frente al bf16 (ver seccion de benchmarks); no hay datos de MMLU, HumanEval ni GSM8K para ninguno de ellos en el material proporcionado.

## Limitaciones y advertencias

- Caracter experimental: el propio autor etiqueta el build como experimental y lo ata a un commit concreto de Strata; no hay garantia de compatibilidad con versiones futuras del motor.
- Dependencia de un fork y un parche: no funciona con llama.cpp, vLLM, Ollama ni TGI estandar. Requiere compilar Strata con `build_strata_qns.sh` y aplicar `strata-qns.patch`.
- Requisitos de software estrictos: Linux, driver NVIDIA 580+, CUDA 12.8+ (13.x para RTX 50). No hay soporte documentado para Windows ni macOS.
- Rendimiento dependiente de CPU en tarjetas de 12 GB: la decodificacion queda limitada por la CPU cuando la mayoria de lecturas de expertos no aciertan en la cache de GPU.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion de 2 bits; la fidelidad medida (top-1 93,4% frente a bf16) implica que aproximadamente 1 de cada 15 tokens de top-1 difiere del modelo sin cuantizar.
- Idiomas soportados no documentados: la model card no lista idiomas, por lo que no se puede garantizar un rendimiento multilingue concreto.
- Licencia Qwen Community License 1.0: incluye restricciones de uso comercial que deben revisarse en el enlace de licencia antes de desplegar en produccion.
- Bug multi-GPU corregido el 2026-10-15: versiones anteriores del parche producian tokens basura en la segunda GPU con `--layer-split`; es imprescindible usar la version actualizada.
- Sin benchmarks estandar publicados: no hay datos de MMLU, HumanEval ni GSM8K, por lo que la calidad absoluta en tareas downstream no esta verificada.
- Tamano en disco elevado: 42 GB de modelo mas hasta 51,2 GB de tabla n-grama, lo que exige almacenamiento NVMe y planificacion de espacio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-Flash-Next-S-strata-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio de Strata: https://github.com/Niko1221/Strata
- Build small experimental del mismo autor: https://huggingface.co/trymirai/Qwen3.8-Flash-Next-S-small-experimental
