# umixer/ThinkingCap-Qwen3.8-Flash-Next-oq4-mix6-mtp

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-oq4-mix6-mtp es una cuantización mixta en formato MLX del modelo ThinkingCap-Qwen3.8-Flash-Next, publicado por el usuario umixer en HuggingFace. El modelo base fue post-entrenado por BottleCap AI sobre la arquitectura experimental qwen4_exp de Qwen, un modelo MoE con 156 mil millones de parámetros totales y unos 6 mil millones activos, que combina expertos dispersos, atención lineal (GDN), una tabla n-gram (PLE) y decodificación especulativa multi-token (MTP) nativa.

La aportación de esta versión es su receta de cuantización de precisión mixta: en lugar de una cuantización uniforme a 4 bits, aplica un esquema en forma de U según la sensibilidad por capa (6 bits en las capas extremas, 4 bits en las intermedias, 8 bits en atención, embeddings y componentes críticos), con el objetivo de lograr la huella de memoria y velocidad de un modelo de 4 bits con calidad igual o superior a una cuantización uniforme de 5 bits. El resultado medido es una ejecución con unos 75-76 GB de memoria residente y 75-84 tokens/s de decodificación en un Apple Silicon de 128 GB (M5 Max), además de una reducción del 28% en tokens de razonamiento respecto al modelo base.

Es relevante porque demuestra que las recetas de cuantización por sensibilidad de capa pueden cambiar drásticamente la economía de despliegue de modelos MoE grandes en hardware de consumidor pro, haciendo viable un modelo de esta escala en un portátil de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen4_exp: MoE + atención lineal GDN (36 capas) + atención completa (13 capas) + tabla n-gram PLE + MTP nativo (profundidad 3) |
| Parámetros totales | 179.999.981.459 (dato real de safetensors; ~156B según model card, probablemente sin contar embeddings/MTP) |
| Parámetros activos | ~6B (512 expertos, top-10 enrutados) |
| Longitud de contexto | 131k tokens probados (valor máximo no disponible) |
| Tipos de cuantización | Mixta: 4-bit g64, 6-bit g64/g128/g32, 8-bit g64/g128; normas, routers y torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen community license, "other") |
| Formato de pesos | safetensors (MLX, 131 shards, 117,5 GiB de paquete; repo de 150 GB) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia experimental `qwen4_exp`, una arquitectura híbrida de 48 capas que combina: un tronco MoE con 512 expertos y enrutado top-10, 36 capas de atención lineal tipo GDN (gated delta net) para eficiencia en secuencias largas, 13 capas de atención completa dispersas a lo largo de la profundidad, una tabla n-gram (PLE) para predicción léxica y un módulo MTP (multi-token prediction) de profundidad 3 que habilita decodificación especulativa nativa. La torre de visión permanece sin cuantizar en bf16, lo que sugiere capacidades multimodales heredadas del modelo base.

Sobre el entrenamiento del modelo base no hay datos publicados en la información disponible (número de tokens, composición del dataset o uso de RLHF/DPO). Lo que sí documenta el autor es la receta de cuantización: partiendo del fuente en bf16, se cuantiza con 993 overrides por tensor siguiendo una sensibilidad en forma de U a lo largo de la profundidad (las capas de los extremos L0-L3 y L44-L47 son más caras en precisión, las 40 capas intermedias más baratas). La distribución final es de 745 claves a 8 bits, 128 a 6 bits y 120 a 4 bits. En la actualización del 30 de octubre de 2026, los 36 tensores `out_proj` de las capas GDN se subieron de 6-bit g128 a 8-bit g64, sin cambio visible de velocidad.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Modo de razonamiento (thinking): el modelo genera tokens de razonamiento, con una reducción del ~28% respecto al base Flash-Next (mediana de 219 tokens frente a ~280 en MBPP).
- Generación y corrección de código: validado en MBPP con 89/89 respuestas válidas (100% de precisión sobre respuestas válidas).
- Decodificación especulativa nativa vía MTP de profundidad 3, que mejora el throughput de decodificación.
- Manejo de contextos largos: probado hasta 131k tokens, favorecido por las capas de atención lineal GDN.
- Posibles capacidades de visión: la torre de visión se mantiene en bf16 sin cuantizar, aunque la model card no documenta explícitamente su uso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes de razonamiento local en Apple Silicon: con ~75 GB residentes cabe en un Mac de 128 GB, permitiendo ejecutar un modelo de razonamiento de 156B sin GPU de datacenter, ideal para desarrolladores que quieren privacidad total.
- Generación y depuración de código offline: el 100% de validez en MBPP y la reducción de tokens de razonamiento lo hacen adecuado para asistentes de código integrados en editores locales donde la latencia por token importa.
- Procesamiento de documentos largos: los 131k tokens de contexto probados y las capas de atención lineal permiten resumir o analizar contratos, informes o bases de código extensas en una sola pasada.
- Agentes de multi-step reasoning en local: la eficiencia de tokens de razonamiento (28% menos) reduce el coste temporal de cadenas de agentes con muchos pasos de reflexión.
- Investigación en cuantización: la receta de precisión mixta documentada al detalle (993 overrides, distribución de bits por componente) sirve como referencia reproducible para estudios de cuantización mixta en MoE.
- Prototipado de despliegue edge de alta gama: demuestra un flujo viable para servir modelos MoE gigantes en estaciones de trabajo Apple Silicon con 75-84 tok/s, útil para pruebas de producto antes de escalar a infraestructura en la nube.

## Benchmarks y rendimiento

La model card solo publica resultados propios de validación, no benchmarks estándar comparativos completos:

| Benchmark | Resultado |
|---|---|
| MBPP (validez de respuestas) | 89/89 válidas (100% sobre respuestas válidas) |
| MBPP (tokens de razonamiento, mediana) | 219 (frente a ~280 del base Flash-Next, −28%) |
| Velocidad de decodificación (M5 Max 128 GB, oMLX 0.7.2) | 75-84 tok/s |
| Memoria residente en carga | ~75-76 GB |
| Contexto probado | 131k tokens |

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Memoria unificada estimada: ~75-76 GB residentes en carga (paquete de 117,5 GiB en disco).
- Hardware verificado: Apple M5 Max con 128 GB de memoria unificada, usando oMLX 0.7.2.
- Requisito mínimo práctico: un host Apple Silicon con 128 GB de memoria unificada; en máquinas de 96 GB no cabría con la memoria residente medida. No hay datos para GPU NVIDIA ni para CUDA.
- Software requerido: oMLX 0.7.2 o superior, o builds de mlx_vlm con soporte para `qwen4_exp` y cuantización mixta por tensor. Se recomienda activar la decodificación especulativa MTP.
- Despliegue: vía `mlx_vlm` con `load()` y `generate()` (ver ejemplo de la model card). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, dado que el formato es MLX con esquema de cuantización propio (oQ).
- Latencia y throughput: 75-84 tok/s de decodificación medidos en M5 Max 128 GB; no hay datos de prefill ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| umixer/ThinkingCap-Qwen3.8-Flash-Next-oq4-mix6-mtp | ~156B totales / ~6B activos | 131k probado | Mixta 4/6/8-bit (MLX) | qwen-community-1.0 | 75-84 tok/s en 128 GB; −28% tokens de razonamiento |
| umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp | no disponible | no disponible | Mixta (misma receta) | no disponible | Misma receta de cuantización, sin post-training ThinkingCap |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | ~156B totales / ~6B activos | no disponible | bf16 (fuente) | qwen-community-1.0 | Modelo base sin cuantizar; ~280 tokens de razonamiento mediana en MBPP |

## Limitaciones y advertencias

- Licencia qwen-community-1.0: se trata de una licencia comunitaria de Qwen con posibles restricciones de uso comercial (límites típicos por usuarios mensuales o ingresos); conviene revisar el texto LICENSE antes de desplegar en producción comercial.
- Ecosistema muy específico: requiere oMLX 0.7.2+ o builds concretos de mlx_vlm; no funciona con llama.cpp, Ollama, vLLM ni con las herramientas estándar de GGUF.
- Hardware exigente: pese a la cuantización, necesita ~76 GB de memoria residente, lo que lo restringe a Apple Silicon de 128 GB o superiores; no es viable en GPU de consumidor típicas (una RTX 4090 con 24 GB queda muy lejos del requisito).
- Datos de calidad limitados: la única validación publicada es MBPP del propio autor; no hay benchmarks independientes ni comparativas estandarizadas, por lo que la afirmación de calidad "igual o superior a oQ5 uniforme" no puede verificarse con la información disponible.
- Arquitectura experimental: la familia `qwen4_exp` es experimental y el soporte de software puede ser inestable o cambiar entre versiones de las librerías.
- Riesgo de alucinación y sesgos: no hay documentación específica del post-training de BottleCap AI (datos, RLHF/DPO) en la información disponible, por lo que los sesgos y la fiabilidad factual son desconocidos.
- Idiomas soportados no documentados: no hay información sobre rendimiento en castellano u otros idiomas.
- La cuantización agresiva a 4 bits en las capas intermedias del MoE puede degradar tareas sensibles a la precisión (matemáticas complejas, razonamiento muy largo) sin que existan mediciones que lo cuantifiquen.

## Enlaces

- Modelo cuantizado: https://huggingface.co/umixer/ThinkingCap-Qwen3.8-Flash-Next-oq4-mix6-mtp
- Modelo base (BottleCap AI): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Receta original de cuantización: https://huggingface.co/umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp
- oMLX (repositorio de Jundot): https://github.com/jundot/omlx
- Perfil de BottleCap AI: https://huggingface.co/bottlecapai
- Referencia académica (SliderQuant, U-shaped sensitivity): arXiv:2603.25284
