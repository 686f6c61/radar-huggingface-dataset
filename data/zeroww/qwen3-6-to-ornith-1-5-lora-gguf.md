# ZeroWw/Qwen3.6-to-Ornith-1.5-LoRA.gguf

## Resumen

`ZeroWw/Qwen3.6-to-Ornith-1.5-LoRA.gguf` es un adaptador LoRA en formato GGUF que codifica la diferencia exacta de pesos (weight delta) entre `ornith-ai/Ornith-1.5-35B-A3B` y `Qwen/Qwen3.6-35B-A3B`. No se trata de un modelo entrenado de forma independiente: es una factorización de rango 64 de la resta BF16 entre ambos repositorios de safetensors, extraída mediante peticiones HTTP con rangos y descomposición SVD aleatorizada con dos iteraciones de potencia por matriz. El autor lo publica como artefacto de investigación, no como sustituto del modelo base.

El modelo subyacente es un transformer híbrido de tipo Mixture-of-Experts con atención lineal y SSM (arquitectura `qwen35moe`), con 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token, además de un vocabulario de 248 320 tokens. El adaptador cubre 352 matrices (704 tensores A/B) e incluye `token_embd`, `output`, `attn_qkv`, `attn_gate`, `attn_q/k/v`, `attn_output`, `ssm_alpha`, `ssm_beta`, `ssm_out` y las matrices compartidas de expertos (gate/up/down). Su relevancia es metodológica: demuestra qué parte del delta post-entrenamiento de un modelo RL es capturable mediante LoRA de bajo rango y qué parte no.

La validación del propio autor es contundente: el adaptador completo **no mejora** la perplejidad de lenguaje genérico (2,700 con escala 0,5 y 2,888 con escala 1,0 frente a 2,660 del base Qwen). El subconjunto de atención/SSM sí aporta una mejora marginal (2,651 con escala 1,5), mientras que el subconjunto de cabeza/embeddings es responsable del deterioro. Debe tratarse como una línea base de investigación sobre diferencias de pesos, no como una actualización lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre `qwen35moe` (transformer híbrido con atención lineal y SSM, MoE) |
| Parametros totales | 112.799.784 (adaptador); modelo base: 35B totales |
| Parametros activos | ~3B en el modelo base (MoE, denominación A3B) |
| Longitud de contexto | no disponible para el adaptador; el modelo base soporta 248.320 tokens de vocabulario (contexto no especificado) |
| Tipos de cuantizacion | Adaptador en GGUF (F32/BF16 según tensor); el base se usa en IQ3_XXS, IQ2_S, IQ4_XS, IQ3_S según la validación |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el autor indica que los modelos subyacentes son MIT (Ornith) y licencia Qwen respectivamente |
| Formato de pesos | GGUF (`general.type=adapter`, `adapter.type=lora`, `adapter.lora.alpha=64`) |

## Arquitectura y entrenamiento

El adaptador no implica entrenamiento alguno. Se construye calculando la diferencia BF16 entre los pesos de Ornith-1.5-35B-A3B y Qwen3.6-35B-A3B, ambos con arquitectura, vocabulario (248.320 tokens) y 733 tensores con nombres y formas idénticas. Para cada una de las 352 matrices cubiertas se ajusta una SVD aleatorizada de rango 64 con dos iteraciones de potencia, reteniendo aproximadamente el 80 % de la energía del delta por matriz. El archivo resultante pesa 431 MB y contiene 704 tensores A/B.

El análisis del delta revela una estructura concreta: los routers de expertos se desplazan ~7 %, las matrices `ssm_alpha`/`ssm_beta` de atención lineal entre 4 y 6 %, la norma de salida ~0,47 %, mientras que las layer norms y los parámetros `dt`/norm del SSM permanecen sin cambios. Las diferencias aparentemente mayores en los GGUF de baja precisión son en su mayoría ruido de cuantización (Ornith usa Q8_0/F32 con imatrix ajustada; el GGUF de Qwen usa IQ3_XXS/IQ2_S). El autor advierte que el delta RL no es fuertemente de bajo rango y que los cambios conductualmente más importantes (router de 256 vías, matrices de expertos, layer norms) no son aplicables como LoRA en llama.cpp.

## Capacidades

- No se documentan capacidades propias del adaptador; hereda las del modelo base Qwen3.6-35B-A3B sobre el que se aplica.
- El adaptador modula `token_embd`, `output`, atención (`attn_qkv`, `attn_gate`, `attn_q/k/v`, `attn_output`), componentes SSM (`ssm_alpha`, `ssm_beta`, `ssm_out`) y matrices compartidas de expertos.
- Aplicable únicamente en llama.cpp con el grafo LoRA de `qwen35moe` (build `b12662` o superior).
- No se documentan tool calling, agentes, visión, audio ni modo thinking específicos del adaptador.
- Capacidades multilingües: no disponibles.
- El autor señala que parte del delta de cabeza/embeddings codifica el enmarcado de chat distinto de Ornith y no es semánticamente transferible a la configuración de tokens de Qwen.

## Casos de uso

- Investigación sobre diferencias de pesos: reproducir el delta BF16 entre dos modelos de la misma familia para estudiar qué componentes concentran el cambio post-entrenamiento (routers, SSM, normas de salida).
- Análisis de aplicabilidad de LoRA: medir empíricamente qué fracción de un delta RL es capturable con rango 64 y qué fracción se pierde, usando la tabla de perplejidad del autor como referencia.
- Estudio de cuantización: comparar el efecto de aplicar un delta BF16 sobre un base con ~2 % de error de cuantización frente a un modelo cuantizado de origen con ~0,6 % de error.
- Aislamiento de subconjuntos de tensores: aplicar solo el subconjunto atención/SSM (escalas 1,0-3,0) para observar la mejora marginal de perplejidad (2,651-2,671) frente al base (2,660).
- Reproducción metodológica: replicar el pipeline de extracción por HTTP range requests y SVD aleatorizada sobre otros pares de modelos de la misma familia.
- Docencia y divulgación: ilustrar con cifras concretas por qué un adaptador de bajo rango no equivale a un modelo afinado, usando la regresión de 2,660 a 2,888 como caso de estudio.

## Benchmarks y rendimiento

Medido con `llama-perplexity` sobre un corpus mixto de matemáticas, código y prosa de 5k tokens (`-c 512`, llama.cpp b12662):

| Modelo / configuración | PPL |
|---|---:|
| Ornith AD-IQ4_XS-IQ3_S (referencia) | 2,594 |
| Qwen IQ3_XXS base | 2,660 |
| Qwen + adaptador completo @0,5 | 2,700 |
| Qwen + adaptador completo @1,0 | 2,888 |
| Qwen + subconjunto atención/SSM @1,0 | 2,652 |
| Qwen + subconjunto atención/SSM @1,5 | 2,651 (mejor, dentro del ruido) |
| Qwen + subconjunto atención/SSM @2,0 | 2,659 |
| Qwen + subconjunto atención/SSM @3,0 | 2,671 |
| Qwen + subconjunto cabeza/embeddings @1,0 | 2,887 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 431 MB y se carga junto al modelo base; la VRAM viene determinada por el GGUF base de Qwen3.6-35B-A3B (35B totales, ~3B activos).
- Con cuantización IQ3_XXS/IQ2_S el base ronda los 13-15 GB, por lo que cabe en GPUs consumer de 16-24 GB (RTX 4080, RTX 4090) con contexto reducido; con IQ4_XS el requisito sube a ~18-20 GB.
- Para contexto largo o precisión mayor se recomienda A100 40/80 GB o H100.
- Despliegue exclusivamente vía llama.cpp (`llama-cli`, `llama-server`) con build `b12662` o superior; no se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Ejemplo del autor: `llama-cli -m Qwen3.6-35B-A3B-IQ3_XXS.gguf --lora-scaled Qwen3.6-to-Ornith-1.5-LoRA.gguf:0.5 -p "..." --jinja -st -n 256 -c 2048 -t 4`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (5k tokens) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen + delta Ornith) | 35B totales / ~3B activos + 112,8M adaptador | no disponible | 2,700 @0,5 / 2,888 @1,0 | no disponible (base: Qwen license + MIT) | GGUF en HF |
| Ornith-1.5-35B-A3B (referencia) | 35B totales / ~3B activos | no disponible | 2,594 (AD-IQ4_XS-IQ3_S) | MIT | pesos en HF |
| Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | no disponible | 2,660 (IQ3_XXS) | Qwen license | pesos en HF |

No se dispone de datos de benchmarks de tareas para establecer comparaciones adicionales con modelos de la misma categoría.

## Limitaciones y advertencias

- El adaptador completo **degrada** la perplejidad de lenguaje genérico respecto al base (2,700-2,888 frente a 2,660); no es una mejora lista para producción.
- Los cambios conductualmente más relevantes (router de 256 vías, matrices de expertos, layer norms) no son aplicables como LoRA en llama.cpp y quedan fuera del artefacto.
- La aproximación de rango 64 retiene solo ~80 % de la energía del delta por matriz; el delta RL no es fuertemente de bajo rango.
- Aplicar un delta BF16 sobre un base con ~2 % de error de cuantización no reproduce la cuantización de Ornith (~0,6 % de error).
- Parte del delta de cabeza/embeddings codifica el enmarcado de chat de Ornith y no es semánticamente transferible a Qwen, lo que explica la regresión del subconjunto de cabeza/embeddings (2,887).
- La perplejidad no es veredicto definitivo sobre transferencia conductual: un modelo entrenado con RL puede tener peor PPL y mejor rendimiento en tareas objetivo, pero el autor no aporta evidencias de esa transferencia.
- Licencia del adaptador: no disponible explícitamente; los modelos subyacentes son MIT (Ornith) y Qwen license, con implicaciones para uso comercial que deben verificarse antes de desplegar.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado ni idiomas documentados.
- Requiere una build específica de llama.cpp (`b12662`+) y está limitado al grafo `qwen35moe`.

## Enlaces

- Hugging Face: https://huggingface.co/ZeroWw/Qwen3.6-to-Ornith-1.5-LoRA.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo de referencia Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- llama.cpp (build b12662 o superior): https://github.com/ggml-org/llama.cpp
