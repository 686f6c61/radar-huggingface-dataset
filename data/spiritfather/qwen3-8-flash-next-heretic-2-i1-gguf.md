# spiritfather/Qwen3.8-Flash-Next-heretic-2-i1-GGUF

## Resumen

Qwen3.8-Flash-Next-heretic-2-i1-GGUF es una reempaquetado en formato GGUF del modelo Qwen3.8-Flash-Next-heretic-2, creado por trohrbaugh mediante una version personalizada de la herramienta Heretic (v1.3.0+custom) para eliminar los rechazos del modelo base. El modelo base es Qwen/Qwen3.8-Flash-Next, un modelo multimodal de arquitectura MoE ultra dispersa con 176.9B parametros totales y aproximadamente 3B activos por token, desarrollado por el equipo Qwen. Este repositorio, mantenido por spiritfather, se centra en ofrecer cuantizaciones con matriz de importancia (imatrix) para mejorar la calidad de los quants de baja precision.

La relevancia de este modelo radica en tres aspectos: primero, es una version "uncensored" (abliterada) que reduce drasticamente los rechazos del modelo original (de 99/100 a 0/100 en pruebas del autor), manteniendo una divergencia KL baja (0.0818) respecto al modelo original. Segundo, incluye por primera vez la cabeza MTP/NextN de decodificacion especulativa del propio modelo en formato GGUF, lo que permite acelerar la inferencia. Tercero, utiliza la arquitectura qwen4exp con atencion hibrida GDN + QSA, que combina compresion de historial con recuperacion de largo alcance, soportando un contexto nativo de 262K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE ultra dispersa con GDN + QSA) |
| Parametros totales | 176.943.899.520 (incluye tabla N-gram de 51B) |
| Parametros activos | ~3B por token (segun model card) / ~6B (segun vLLM Recipes) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | IQ2_M, IQ3_XXS, IQ3_M, IQ4_XS (con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida que combina dos mecanismos de atencion: Gated DeltaNet (GDN) en tres de cada cuatro capas, que comprime el historial de forma eficiente, y Qwen Sparse Attention (QSA) en la cuarta capa, para recuperacion precisa de informacion de largo alcance. Esta combinacion busca mejorar la capacidad del modelo mientras optimiza la eficiencia computacional. Ademas, incorpora una tabla de incrustacion N-gram de 51B filas que actua como mecanismo de lookup, y una cabeza MTP (Multi-Token Prediction) para decodificacion especulativa.

El proceso de "heretic" aplicado por trohrbaugh utiliza una direccion por capa para eliminar los rechazos del modelo, logrando una tasa de rechazo de 0/100 frente al 99/100 del modelo base, con una divergencia KL de 0.0818, la mas baja entre los modelos heretic de Qwen3.8-Flash-Next en el momento de su creacion. El reempaquetado GGUF de spiritfather incluye cuantizaciones con imatrix calculada sobre el dataset de calibracion de bartowski (129 chunks × 512 tokens), con cobertura del 99.7% de los slots de experto. La tabla N-gram y la cabeza MTP se mantienen en Q8_0 sin imatrix.

## Capacidades

- Generacion de texto multimodal: el modelo acepta entradas de imagen y texto (pipeline image-text-to-text), con proyector de vision incluido en el repositorio.
- Razonamiento con modo thinking: activado por defecto con niveles de esfuerzo configurables (xhigh, medium, low) mediante el parametro `reasoning_effort`.
- Decodificacion especulativa MTP/NextN: incluye la cabeza de prediccion multi-token del propio modelo, que requiere el PR #27836 de llama.cpp para funcionar.
- Conversacion y roleplay: al ser una version abliterada, no rechaza solicitudes que el modelo base bloquearia, lo que lo hace adecuado para creatividad sin restricciones.
- Soporte de contexto largo: ventana nativa de 262K tokens con coste de KV cache de aproximadamente 21 KiB/token en q8_0.
- Capacidades multilingues: no especificadas en la informacion disponible, aunque el modelo base Qwen soporta multiples idiomas.

## Casos de uso

- Escritura creativa sin censura: el modelo puede generar narrativa, dialogo y contenido literario sin los rechazos tipicos de los modelos alineados, gracias a su proceso de abliteracion. Es adecuado para autores que necesitan explorar temas controvertidos o maduros.
- Roleplay conversacional: su baja tasa de rechazo y su capacidad de mantener contexto largo (262K tokens) lo hacen util para sesiones de roleplay extensas con historial detallado, manteniendo coherencia a lo largo de miles de turnos.
- Asistente de lluvia de ideas: al no filtrar contenido, puede generar ideas sin autocensura, util en fases iniciales de proyectos creativos o de producto donde se busca explorar todas las opciones.
- Analisis de documentos largos con vision: combinando su ventana de contexto nativa de 262K tokens y su capacidad de procesar imagenes, puede resumir o extraer informacion de documentos extensos que incluyan diagramas, graficos o capturas.
- Despliegue local en hardware de gama alta: con cuantizaciones IQ4_XS que ocupan 116.7 GiB, puede ejecutarse en estaciones de trabajo con 128 GB de RAM unificada (como Mac Studio) o multiples GPUs, ofreciendo una alternativa local a APIs propietarias.
- Investigacion en alineacion y seguridad: el proceso de abliteracion y su baja divergencia KL respecto al modelo base lo convierten en un caso de estudio para investigar como la eliminacion de rechazos afecta al comportamiento y la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor menciona que el modelo fue evaluado en CaliperBench, un benchmark de escritura creativa que puntua calidad de prosa, roleplay y disposicion, pero no se proporcionan las puntuaciones concretas.

Los datos de perplejidad (PPL) y divergencia KL se proporcionan para los quants, medidos en wikitext-2 con contexto 512:

| Quant | PPL (wikitext-2, ctx 512) | vs Q8_0 | KLD vs Q8_0 |
|---|---|---|---|
| IQ2_M | 3.878550 ± 0.049855 | +7.282% | 0.178651 ± 0.002355 |
| IQ3_XXS | 3.724272 ± 0.047152 | +3.015% | 0.109565 ± 0.001518 |
| IQ3_M | 3.753507 ± 0.047699 | +3.823% | 0.085691 ± 0.001254 |
| IQ4_XS | 3.629936 ± 0.045657 | +0.405% | 0.047248 ± 0.000717 |

## Requisitos de hardware

- VRAM estimada para inferencia: los quants requieren entre 50.2 GiB (IQ2_M) y 66.0 GiB (IQ4_XS) para el trunk en GPU. La tabla N-gram de 50.7 GiB puede mantenerse en disco con `--tensor-read-lazy auto`, ahorrando aproximadamente 47 GB de memoria residente.
- GPU recomendadas: para los quants IQ4_XS se necesitan GPUs con 80 GB de VRAM (A100, H100) o multiples GPUs. Los quants IQ2_M podrian caber en una RTX 4090 de 24 GB solo si se usa offload parcial, aunque no es recomendable.
- En consumer GPU: no cabe de forma completa en GPUs de consumo actuales (24 GB o menos). Se requiere hardware profesional o multiples GPUs.
- Opciones de despliegue: llama.cpp (master, b10685+), llama-server con soporte para `--jinja`, `-fa on` y `-ctk q8_0 -ctv q8_0`. La cabeza MTP requiere el PR #27836.
- Latencia y throughput: no se proporcionan datos especificos, pero la decodificacion especulativa MTP puede acelerar la generacion respecto a la decodificacion autoregresiva estandar.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176.9B | ~3B | 262K | qwen-community-1.0 | safetensors |
| Qwen3.8-Flash-Next-heretic-2 (este) | 176.9B | ~3B | 262K | qwen-community-1.0 | GGUF |
| Qwen3.8-Flash-Next-GGUF (vcruz305) | 176.9B | ~3B | 262K | qwen-community-1.0 | GGUF |

La diferencia principal con el modelo base es la eliminacion de rechazos mediante abliteracion. Frente a otros reempaquetados GGUF, este repositorio destaca por incluir la cabeza MTP y cuantizaciones con imatrix. No se dispone de datos de otros modelos MoE comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y riesgos de la abliteracion: al eliminar los rechazos, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtro. No es adecuado para aplicaciones de produccion donde se requiera moderacion de contenido.
- Riesgo de alucinacion: no se han evaluado los niveles de alucinacion de esta version especifica; la abliteracion puede afectar a la fiabilidad factual.
- Requisitos de software especificos: la cabeza MTP solo funciona con el PR #27836 de llama.cpp, que puede no estar disponible en versiones estables. Sin ella, la decodificacion especulativa no esta disponible.
- Limitaciones de cuantizacion: los quants de baja precision (IQ2_M, IQ3_XXS) muestran una degradacion notable en perplejidad (+7.282% y +3.015% respectivamente), lo que puede afectar a la calidad de generacion.
- Restricciones de licencia: la licencia qwen-community-1.0 puede imponer restricciones de uso comercial; se recomienda revisar los terminos completos en el enlace proporcionado.
- Requisitos de hardware elevados: incluso el quant mas pequeno (IQ2_M, 100.9 GiB) requiere hardware profesional, lo que limita su uso a entornos con GPUs de alta gama o Mac con mucha RAM unificada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spiritfather/Qwen3.8-Flash-Next-heretic-2-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Herramienta Heretic: https://github.com/p-e-w/heretic
- PR #27836 de llama.cpp (soporte MTP): https://github.com/ggml-org/llama.cpp/pull/27836
- PR #27742 de llama.cpp (soporte qwen4exp): https://github.com/ggml-org/llama.cpp/pull/27742
- PR #27837 de llama.cpp (tensor-read-lazy): https://github.com/ggml-org/llama.cpp/pull/27837
- CaliperBench: https://caliperbench.com
- Dataset de calibracion de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Quants estaticos (sin imatrix): https://huggingface.co/spiritfather/Qwen3.8-Flash-Next-heretic-2-GGUF
- Licencia del modelo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
