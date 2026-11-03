# YokaiOfDusk/Qwen3.6-27b-A3B-HauhauCS-TTQ-RU

## Resumen

Qwen3.6-27b-A3B-HauhauCS-TTQ-RU es una variante podada y cuantizada del modelo Mixture-of-Experts (MoE) Qwen3.6-35B-A3B, publicada por el usuario YokaiOfDusk sobre el modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive. El autor ha aplicado un algoritmo de poda de expertos de tipo REAP guiado por una imatrix en ruso, eliminando 64 de los 256 expertos (variante P192) y cuantizando el resultado con una receta propia inspirada en TTQ. El objetivo declarado es ofrecer un modelo orientado a roleplay en ruso que quepa por completo en una GPU de 16 GB de VRAM manteniendo la calidad en ese idioma.

El modelo conserva 26.602.304.128 parámetros totales (unos 26,6 mil millones) y activa 8 expertos por token, el valor nativo de la arquitectura. El resultado es un GGUF de aproximadamente 12,35 GiB que, según el autor, alcanza unos 142 tokens por segundo en LM Studio con descarga completa en GPU y ventana de contexto de 128k. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión (poda de expertos + cuantización agresiva) aplicada a un MoE; por otro, advierte de que se trata de un modelo derivado no oficial, sin benchmarks estandarizados publicados y con un perfil de uso muy específico (roleplay en ruso), lo que limita su aplicabilidad general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), podado a 192 de 256 expertos (P192) |
| Parametros totales | 26.602.304.128 (~26,6 B) |
| Parametros activos | 8 expertos por token (expert_used_count=8, valor nativo); numero de parametros activos no disponible |
| Longitud de contexto | 128k tokens (segun el autor, cabe en GPU con esa ventana) |
| Tipos de cuantizacion | GGUF con receta TTQ-like (expertos en Q3_K/IQ4_XS); variante P192-Q4 tambien evaluada por el autor |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE derivado de Qwen3.6-35B-A3B. La intervencion principal es una poda de expertos basada en una puntuacion por imatrix, con la formula `score[e] = Σ in_sum2[e, j] · ||W_down[e][:, j]||²`, calculada sobre un corpus de calibracion en ruso de aproximadamente 526.000 tokens. Se eliminaron los 64 expertos con menor puntuacion, quedando 192 de 256. El autor justifica la poda en que, en tareas de roleplay en ruso, esos expertos apenas se invocan.

Sobre el modelo podado se aplico una cuantizacion de tipo TTQ, con expertos en Q3_K/IQ4_XS. El autor senala que esta receta funciona bien en arquitecturas MoE porque solo se activan unos pocos expertos por token, y advierte de que en modelos densos degrada el rendimiento. No se documenta en la informacion disponible si hubo entrenamiento adicional, RLHF o DPO sobre el modelo base; las unicas modificaciones descritas son la poda y la cuantizacion.

## Capacidades

- Generacion de texto conversacional, con enfasis en roleplay en ruso.
- Generacion en ingles, aunque el ajuste y la calibracion estan orientados al ruso.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3, sin evaluacion especifica publicada en esta variante.
- Soporte de conversaciones multi-turno gracias a la ventana de contexto de 128k tokens.
- Perfil "uncensored" y "heretic" heredado del modelo base, orientado a reducir rechazos en contenido sensible.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision ni audio en esta variante.

## Casos de uso

- Roleplay y narrativa interactiva en ruso: el modelo esta calibrado y podado especificamente para este idioma y tarea, y el autor reporta una media de 73/100 en benchmarks independientes de roleplay.
- Despliegue en estaciones de trabajo con GPU de 16 GB: al ocupar unos 14,2 GB de VRAM con contexto de 128k, permite ejecutar un MoE de ~26,6 B en hardware de consumo alto sin offloading a CPU.
- Prototipado rapido de chatbots conversacionales en ruso: la velocidad de ~142 t/s en LM Studio facilita iteraciones interactivas.
- Generacion de dialogos y guiones en ruso para preproduccion de contenido, gracias al contexto largo para mantener coherencia entre escenas.
- Experimentacion con tecnicas de compresion de MoE: sirve como referencia practica de poda por imatrix y cuantizacion TTQ para investigadores que quieran replicar el metodo.
- Traduccion y adaptacion de estilo entre ruso e ingles en contextos informales, con las reservas propias de un modelo no evaluado en tareas de traduccion.
- Fine-tuning ligero o LoRA sobre una base ya compacta en VRAM, partiendo del GGUF o de los pesos originales del modelo base.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor comparan variantes del propio proceso de poda y cuantizacion, no benchmarks estandarizados (MMLU, HumanEval, GSM8K). Calibracion con 526k tokens de ruso y evaluacion sobre 40 fragmentos de 512 tokens:

| Variante | Tamano | KLD ru (base) | KLD ru (holdout) | PPL en | Velocidad (t/s) |
|---|---|---|---|---|---|
| TTQ Q3_K_M original | 15,84 GiB | 0,053 | 0,046 | 1,015 | ~125-130 |
| P192-Q4 | 15,51 GiB | 0,032 | 0,027 | 1,121 | 108 |
| P192-TTQ (este modelo) | 12,35 GiB | 0,059 | 0,050 | 1,126 | 142 |

El autor indica ademas una puntuacion media de 73/100 en benchmarks independientes de roleplay, sin detallar que benchmarks ni la comparacion con el modelo original. No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~14,2 GB con contexto de 128k segun el autor; el archivo GGUF pesa 12,35 GiB.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM para descarga completa en GPU (por ejemplo, RTX 4080/4090, A100, H100). El autor no especifica modelos concretos mas alla del requisito de 16 GB.
- Cabe en GPU de consumo: si, en GPUs de 16 GB o superiores; no en tarjetas de 8-12 GB sin offloading parcial.
- Opciones de despliegue: llama.cpp (`-ngl 99`) y LM Studio; compatible con endpoints segun los tags del repositorio. No se documenta soporte de vLLM o TGI para este GGUF.
- Latencia y throughput: ~142 t/s en LM Studio segun el autor, frente a ~125-130 t/s de la variante TTQ Q3_K_M original de 15,84 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27b-A3B-HauhauCS-TTQ-RU (este) | ~26,6 B (MoE, 192 expertos) | 128k | Apache 2.0 | GGUF | Podado y cuantizado, orientado a ruso |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~35 B (MoE, 256 expertos) | no disponible | no disponible en la informacion | no disponible | Modelo base sin podar |
| TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF | ~35 B (MoE) | no disponible | no disponible en la informacion | GGUF | Cuantizacion TTQ sin poda, ~15,84 GiB |
| Qwen3.6-27B-A3B P192-Q4 (variante del autor) | ~26,6 B (MoE, 192 expertos) | no disponible | Apache 2.0 | GGUF | Mayor fidelidad en texto, mas lento (108 t/s) |

No se dispone de datos para comparar con modelos de otros desarrolladores (Llama, Mistral, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado no oficial: no procede de un lanzamiento oficial de Qwen y sus resultados no estan validados por terceros independientes.
- La poda de expertos se optimizo exclusivamente con datos de calibracion en ruso; el rendimiento en otros idiomas o tareas puede degradarse de forma no medida.
- Perfil "uncensored" y "heretic": puede generar contenido sensible o inapropiado; requiere filtros y moderacion en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de benchmarks estandarizados que permitan acotar su fiabilidad.
- Los datos de rendimiento (142 t/s, 73/100 en roleplay) provienen del propio autor y no han sido reproducidos de forma independiente.
- La ventana de 128k se declara compatible con 16 GB de VRAM, pero no se detalla la degradacion de calidad en contextos muy largos.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar la licencia del modelo base y de los datos de calibracion antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/YokaiOfDusk/Qwen3.6-27b-A3B-HauhauCS-TTQ-RU
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Cuantizacion TTQ de referencia: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
