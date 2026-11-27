# Synchopate/Inkling-2-Mini-Monza-RS-v3-GGUF

## Resumen

Inkling-2-Mini Monza-RS v3 es una cuantizacion GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, un transformer MoE con arquitectura de capas recurrentes ("looped transformer") de 26.070.385.152 parametros fisicos, 128 expertos y 48 capas logicas distribuidas en tres pasadas recurrentes. El autor de la cuantizacion es Synchopate, que aplica lo que denomina "precision weight microsurgery" y "MaxQ single-pass structural compression" para reducir el artefacto BF16 original de 48,64 GiB a 14,34 GiB (15,40 GB), un 70,5 % menos de huella de memoria, manteniendo formatos de tensor estandar de GGUF (F32, Q8_0, IQ4_NL, MXFP4).

El problema que aborda no es solo la compresion: segun la model card, el modelo base tiende a "sobrepensar" en tareas empresariales (1.111 tokens de pensamiento de media) y agota el limite de 4.096 tokens sin completar la respuesta (18,5 % de truncamiento en Enterprise, 17,2 % en IFEval, 9,1 % en HumanEval+). Esta variante reduce los tokens de pensamiento un 57,5 % (de 1.111 a 472) y el truncamiento entre un 41 % y un 84 % a 4.096 tokens, con paridad sin limite frente al BF16 en varias suites.

Es relevante porque demuestra inferencia MoE de 26B en CPU x86 sin GPU: el autor reporta 227,43 tok/s de prefill y 13,29 tok/s de decode en un AMD Ryzen 9 9955HX con su binario `llama-modchip`. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el modelo solo declara soporte para ingles e italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (looped transformer); 128 expertos, 48 capas logicas en 3 pasadas recurrentes |
| Parametros totales | 26.070.385.152 (26,07B) fisicos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las evaluaciones usan presupuestos de 2.048 y 4.096 tokens) |
| Tipos de cuantizacion | GGUF con tensores F32, Q8_0, IQ4_NL y MXFP4; artefacto unico de 14,34 GiB (15,40 GB) |
| Idiomas soportados | en, it |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (100 % estandar, 0 formatos de tensor personalizados) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 128 expertos organizado como looped transformer: 48 capas logicas que se ejecutan en tres pasadas recurrentes, lo que da 26,07B parametros fisicos. El autor de la cuantizacion no detalla la composicion del dataset de entrenamiento original ni si hubo RLHF o DPO; esa informacion no esta disponible en la model card proporcionada. Lo que si se documenta es el proceso de compresion: una fase de "microsurgery" sobre los pesos de precision y una compresion estructural MaxQ en una sola pasada, con una capa de proteccion geometrica anti-olvido cuyo efecto se mide en una ablacion A/B controlada.

La innovacion tecnica destacable es la descomposicion transparente de la divergencia KL: el artefacto publicado tiene un KLD total de 0,02490 sobre 102.000 tokens frente al BF16, del cual 0,01330 corresponde a la cuantizacion pura (PPL 6,5641, +0,51 %, 95,05 % de acuerdo top-1) y 0,01160 a la alineacion conductual intencionada. La ablacion muestra que desactivar la capa de proteccion geometrica mas que duplica la deriva quirurgica (+0,0116 a +0,0249 nats) y provoca un olvido estadisticamente significativo de -4,09 pp en IFEval sin limite (p_exact = 0,01135). El binario de inferencia `llama-modchip v3.2.1` incorpora un GEMM de panel con broadcast-B VNNI empaquetado 16x8, operadores AVX-512 fusionados de 12 bits y streaming NTA.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso con modo de pensamiento (thinking tokens medidos y ajustables via alineacion).
- Razonamiento sobre codigo: evaluado en HumanEval+ con paridad sin limite frente al BF16 (96,64 % = 96,64 %).
- Seguimiento de instrucciones estrictas: evaluado en IFEval (541 tareas), con mejora de +4,81 pp frente a BF16 a 4.096 tokens.
- Tool calling y function calling: evaluado en BFCL-v3 (n = 1.240, excluyendo `multi_turn_base`), con reduccion de truncamiento del 63 % a 2.048 tokens (27 a 10).
- Capacidades multilingues limitadas a ingles e italiano; la model card reporta una suite interna de empresa en italiano (Italian Enterprise 200) y un control en chino (+0,50 pp).
- Inferencia en CPU sin GPU mediante llama.cpp estandar (b12604+ / 46eb1742d+) y el binario optimizado llama-modchip.
- Compatibilidad con backends CUDA, Metal y Vulkan gracias al uso exclusivo de tipos de tensor estandar.

## Casos de uso

- Atencion al cliente automatizada en italiano e ingles: el modelo completa tareas de empresa dentro de presupuestos de 4.096 tokens con solo un 6 % de truncamiento (frente al 37 % del BF16), lo que lo hace adecuado para conversaciones multi-turno donde la respuesta debe cerrarse sin agotar el limite.
- Generacion de codigo en produccion: con paridad sin limite en HumanEval+ (96,64 %) y soporte de tool calling evaluado en BFCL-v3, puede integrarse en pipelines de CI/CD para completar funciones, revisar parches o generar tests.
- Despliegue en servidores sin GPU: los 13,29 tok/s de decode en un Ryzen 9 9955HX permiten servir un MoE de 26B en hardware x86 convencional, util para entornos de desarrollo, demos internas o edge computing donde no hay acelerador disponible.
- Agentes con razonamiento acotado: la reduccion del 57,5 % en tokens de pensamiento (1.111 a 472) y del truncamiento en BFCL hacen viable el uso en flujos de agente multi-paso con limites estrictos de tokens por llamada.
- Procesamiento de documentacion tecnica bilingue: al cubrir ingles e italiano, sirve para resumir, clasificar o extraer informacion de documentacion corporativa en ambos idiomas, con la ventaja de ejecutarse en CPU.
- Evaluacion y prototipado de investigacion: al ser un GGUF estandar verificado con llama.cpp upstream, es util para reproducir experimentos de cuantizacion y estudiar el efecto de la compresion estructural en modelos MoE recurrentes.
- Asistentes locales de escritorio: el tamano de 15,40 GB y la compatibilidad con llama.cpp permiten empaquetarlo en estaciones de trabajo con 32 GB de RAM y sin GPU dedicada.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, comparando el BF16 original (48,64 GiB) con el artefacto publicado (14,34 GiB). Evaluacion determinista, T = 0.0, seed = 42, sin LLM-as-a-Judge.

| Benchmark / metrica | BF16 original | Monza-RS v3 | Veredicto estadistico |
|---|---|---|---|
| Tamano del modelo | 48,64 GiB | 14,34 GiB (15,40 GB) | -70,5 % (3,39x menor) |
| KLD (102k tokens) | 0,00000 | 0,02490 (0,01330 cuant. + 0,01160 cirugia) | Deriva quirurgica -53,4 % con proteccion |
| PPL (102k tokens) | no disponible en el extracto | 6,6133 (+1,27 %) | Acuerdo top-1 93,11 % |
| Italian Enterprise 200 (4.096 tok) | 78,00 % | 93,00 % | +15,00 pp, p_HB = 3,62e-6 |
| IFEval 541 estricto (4.096 tok) | 74,86 % | 79,67 % | +4,81 pp, p_HB = 0,0243 |
| Enterprise sin limite | 96,27 % | 96,27 % | Paridad |
| HumanEval+ sin limite | 96,64 % | 96,64 % | Paridad |
| IT-1500 sin limite | no disponible | -0,13 pp | Paridad practica |
| Control en chino sin limite | no disponible | +0,50 pp | Paridad practica |
| Truncamiento Enterprise (4.096 tok) | 37 | 6 | -84 % |
| Truncamiento HumanEval+ (4.096 tok) | 15 | 5 | -67 % |
| Truncamiento IFEval (4.096 tok) | 93 | 55 | -41 % |
| Truncamiento BFCL-v3 (2.048 tok) | 27 | 10 | -63 % |
| Tokens de pensamiento (media) | 1.111 | 472 | -57,5 % |

Rendimiento en CPU (AMD Ryzen 9 9955HX, Zen 5 AVX-512, 16 hilos, `-ngl 0`, `-fa 1`, llama-modchip v3.2.1):

| Configuracion | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| Fusion + panel GEMM + NTA (por defecto) | 227,43 | 13,29 |
| Sin fusion, panel GEMM ni NTA | 92,98 | 10,40 |
| NTA activado, resto desactivado | 92,19 | 10,65 |
| `-t 8 -lm none` con `MODCHIP_PIN_CORES=1` | no disponible | 13,87 (94,4 % del techo de ancho de banda DDR5) |

## Requisitos de hardware

- VRAM/RAM para inferencia: el artefacto GGUF ocupa 15,40 GB, por lo que requiere al menos 16 GB de memoria disponible; con overhead de contexto se recomienda 24-32 GB de RAM o VRAM.
- GPU recomendadas: no se especifican en la model card; al usar tipos de tensor estandar es compatible con backends CUDA, Metal y Vulkan, por lo que cabria en A100, H100 y RTX 4090 (24 GB) con carga completa.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs con 16 GB o mas si se reduce el contexto; tambien funciona en CPU pura sin GPU.
- Opciones de despliegue: llama.cpp upstream (b12604+ / 46eb1742d+), binario llama-modchip v3.2.1 del autor, y cualquier runtime compatible con GGUF estandar (vLLM, Ollama o TGI no se mencionan explicitamente en la informacion disponible).
- Latencia y throughput: 227,43 tok/s de prefill y 13,29 tok/s de decode en un Ryzen 9 9955HX de 16 hilos; 13,87 tok/s con 8 hilos y fijado de nucleos. No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini Monza-RS v3 | 26,07B (MoE, 128 expertos) | no disponible | Apache 2.0 | GGUF 15,40 GB | Cuantizacion optimizada para CPU; -57,5 % tokens de pensamiento |
| thinkingmachines/Inkling-2-Mini (BF16) | 26,07B (MoE) | no disponible | Apache 2.0 | BF16 52,23 GB | Modelo base; mayor truncamiento a 4.096 tokens |
| Baseline de compresion pura MaxQ | 26,07B (MoE) | no disponible | Apache 2.0 | GGUF 15,40 GB | KLD 0,01330; sin alineacion conductual |

No se dispone de datos de benchmarks frente a otros modelos de la misma categoria (por ejemplo, otros MoE de 20-30B) en la informacion proporcionada; la comparativa se limita a las variantes del propio Inkling-2-Mini.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles e italiano; el rendimiento en castellano no esta evaluado y no deberia asumirse.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o equidad en la model card.
- Alucinacion: no hay metricas de factualidad; el modo de razonamiento reducido (-57,5 % tokens de pensamiento) podria afectar a tareas que requieren cadenas de razonamiento largas.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base `thinkingmachines/Inkling-2-Mini`, que conviene verificar por separado.
- Reproducibilidad: los benchmarks son internos en parte (Italian Enterprise 200) y el autor es el mismo que desarrolla el binario de inferencia, lo que introduce un posible sesgo de evaluacion; no hay validacion independiente.
- Despliegue: el rendimiento de CPU reportado depende del binario `llama-modchip` y de flags especificos (fusion, panel GEMM, NTA); con llama.cpp estandar el throughput puede diferir.
- Contexto: la longitud de contexto nativa no esta disponible; las evaluaciones se limitan a 2.048 y 4.096 tokens, por lo que no hay evidencia de comportamiento en ventanas mas largas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synchopate/Inkling-2-Mini-Monza-RS-v3-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Binario de inferencia llama-modchip v3.2.1: https://github.com/synchopate/llama-modchip/releases/tag/v3.2.1
