# Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored-HYBRID

## Resumen

Ektomē Qwen3.8-27B — PristinelyUncensored **HYBRID** es una build de precisión mixta del modelo Qwen3.8-27B, desarrollada por Zynerji. El término "híbrido" no es marketing: asigna cinco precisiones distintas a cinco grupos de módulos, cada una con una justificación técnica concreta. El objetivo es ofrecer un modelo cuantizado de ~18,7 GB que protege los módulos sensibles a la cuantización (como la atención lineal recurrente y la torre de visión) sin incurrir en el sobrecoste de peso de protegerlos en BF16 completo.

El modelo se basa en Qwen3.8-27B, una arquitectura híbrida que combina atención lineal recurrente con atención tradicional, e incluye una torre de visión y una cabeza MTP (multi-token prediction) para decodificación especulativa. La build HYBRID conserva los 985 módulos del modelo original —nada se elimina— y comprime la cabeza MTP en FP8, algo que otras builds cuantizadas suelen omitir silenciosamente.

La relevancia de este modelo radica en su enfoque meticuloso de la cuantización: protege los módulos donde el redondeo de 4 bits distorsionaría la recurrencia del estado (atención lineal) y la torre de visión, usando FP8 para la cabeza MTP y el lm_head en BF16. Según las pruebas del autor, la calidad es estadísticamente equivalente a la build GPTQ de referencia, pero con una ventaja sustancial en throughput gracias a la decodificación especulativa MTP, que acelera la generación hasta 2,3 veces sin cambiar los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (híbrida: atención lineal recurrente + atención tradicional + torre de visión) |
| Parametros totales | 6.070.635.760 (dato real de safetensors; el nombre del modelo indica 27B, correspondiente al modelo base Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 (configuración recomendada en vLLM) |
| Tipos de cuantizacion | Mixta: int4 W4A16 (grupo 128, calibrado GPTQ) en decoder Linears, FP8 E4M3 (por canal) en torre de visión y cabeza MTP, BF16 en lm_head, normas y parámetros no lineales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, una arquitectura híbrida que combina una ruta de atención lineal recurrente (con `linear_attn.in_proj_a/b` y `conv1d`) con atención tradicional, más una torre de visión. La build HYBRID aplica una estrategia de precisión mixta: los 658 decoder Linears (atención + MLP) se cuantizan a int4 W4A16 con grupo 128 y calibración GPTQ; los 144 módulos de la atención lineal se mantienen en BF16 (51 MB en total) porque el redondeo de 4 bits distorsionaría la recurrencia del estado; la torre de visión (110 linears) se protege en FP8 E4M3 por canal, que cuesta la cuarta parte que BF16; el `lm_head` se mantiene en BF16 porque FP8 no es cargable en vLLM 0.27.1; y la cabeza MTP (8 linears + 7 normas) se comprime en FP8, reproduciendo bit-exactamente la convención de llmcompressor.

El entrenamiento original del modelo base no está documentado en la información proporcionada. La build cuantizada se realizó mediante calibración GPTQ con 512 muestras de wikitext-2, según se indica en la build hermana GPTQ-MTP. El autor verificó la integridad de los 985 módulos, incluyendo la cabeza MTP completa (15 tensores), algo que otras builds cuantizadas públicas omiten durante el guardado.

## Capacidades

- Generación de texto y razonamiento: soporta tareas complejas de lenguaje, con un rendimiento en MMLU de 0,7884.
- Generación de código: HumanEval pass@1 de 0,8841 (ejecutado), superando a la build GPTQ de referencia (0,8537), aunque la diferencia no es estadísticamente significativa.
- Capacidades de visión: la torre de visión se conserva completa, con un rendimiento en MMStar de 0,6500.
- Decodificación especulativa MTP: la cabeza MTP está presente y comprimida en FP8, permitiendo aceleraciones de hasta 2,3x en throughput con vLLM, siempre que se pase `speculative_config` explícitamente.
- Cumplimiento reducido: el modelo está "abliterated" (desalienado), con una tasa de rechazo de solo 7 de 416 prompts dañinos (0,9832 de cumplimiento), lo que indica un comportamiento notablemente permisivo.
- Soporte de tool calling y agentes: no documentado explícitamente, pero el modelo base Qwen3.8 soporta estas capacidades; la build no las elimina.
- Multilingüismo: no documentado en la información disponible.

## Casos de uso

- Generación de código en producción: con HumanEval pass@1 de 0,8841, el modelo puede integrarse en pipelines de CI/CD para autocompletar o revisar código. La decodificación especulativa MTP reduce la latencia de generación, lo que lo hace adecuado para asistentes de programación en tiempo real.
- Despliegue en entornos con VRAM limitada: con 18,7 GB de pesos, el modelo cabe en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 6000 Ada, permitiendo servir un modelo de 27B con calidad cercana a la versión completa.
- Workloads multi-agente: las pruebas del autor muestran un flujo de 13 agentes (fan-out → refute → síntesis) que se ejecuta en 7,77 segundos con MTP k=3, frente a 11,40 segundos sin especulación. Adecuado para sistemas de razonamiento multi-paso y orquestación de agentes.
- Análisis de documentos largos con contexto de 8192 tokens: el modelo puede procesar documentos extensos y generar resúmenes o extraer información, gracias a la atención lineal que reduce el coste computacional con contextos largos.
- Aplicaciones de visión-lenguaje: la torre de visión completa permite tareas como captioning de imágenes o VQA, con un rendimiento de 0,65 en MMStar.
- Investigación en cuantización y eficiencia: la build HYBRID es un caso de estudio práctico de cómo asignar diferentes precisiones a diferentes módulos según su sensibilidad, útil para investigadores que trabajan en compresión de modelos.

## Benchmarks y rendimiento

Pruebas realizadas por el autor en una RTX PRO 6000 Blackwell (96 GB), comparando con la build GPTQ de referencia del mismo modelo base:

| Benchmark | Esta build | Referencia GPTQ | Prueba pareada |
|---|---|---|---|
| MMLU (n=1531) | 0,7884 | 0,7897 | McNemar p=0,92 — empate |
| HumanEval pass@1, ejecutado (n=164) | 0,8841 | 0,8537 | McNemar p=0,30 — empate |
| Cumplimiento (n=416 dañinos) | 0,9832 (7 rechazos) | 0,9856 (6 rechazos) | empate |
| MMStar visión (n=300) | 0,6500 | 0,6367 | McNemar p=0,56 — empate |

Throughput agregado (tok/s de salida) en prompts de HumanEval, `max_num_seqs=128`, contexto 8192:

| Concurrencia | 1 | 8 | 32 | 64 | 128 |
|---|---|---|---|---|---|
| Sin especulación | 79,0 | 351,7 | 706,8 | 1107 | 1386 |
| MTP k=1 | 121,3 | 520,5 | 988,0 | 1353 | 1612 |
| MTP k=3 | 182,5 | 741,9 | 1232 | 1565 | 1780 |

El autor declara explícitamente que esta build no es más capaz que la referencia: la diferencia de +3,0 puntos en HumanEval no supera la prueba pareada (10 problemas resueltos que la referencia falló, 5 al revés).

## Requisitos de hardware

- VRAM estimada: 18,7 GB de pesos, por lo que se necesita al menos 24 GB de VRAM para inferencia con vLLM (considerando memoria de activaciones y CUDA graphs). Con `gpu_memory_utilization=0,85` y `max_num_seqs=128`, cabe en una RTX 4090 o RTX 6000 Ada (24 GB), pero el autor probó en una RTX PRO 6000 Blackwell (96 GB).
- GPUs recomendadas: RTX PRO 6000 Blackwell (96 GB) para máxima concurrencia; RTX 4090 (24 GB) o superior para uso individual o con menor concurrencia.
- Consumer GPU: sí, cabe en RTX 4090 (24 GB) y superiores, pero con `max_num_seqs` reducido. El autor advierte que vLLM reserva memoria CUDA-graph para todas las secuencias, por lo que `max_num_seqs=1024` (el valor por defecto) puede causar OOM en tarjetas de 24 GB.
- Opciones de despliegue: vLLM (probado y recomendado por el autor), con soporte para decodificación especulativa MTP. También puede usarse con transformers, aunque la cabeza MTP no sobrevive un round-trip estándar.
- Latencia y throughput: con MTP k=3, el throughput alcanza 182,5 tok/s a concurrencia 1 y 1780 tok/s a concurrencia 128 (en RTX PRO 6000 Blackwell). Sin especulación, baja a 79,0 tok/s a concurrencia 1 y 1386 a concurrencia 128.

## Comparativa con modelos similares

| Modelo | Precision | Peso | MTP head | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| Ektome-Qwen3.8-27B-HYBRID (esta build) | Mixta int4/FP8/BF16 | 18,7 GB | Sí, comprimida en FP8 | 0,7884 | 0,8841 | Apache-2.0 |
| Ektome-Qwen3.8-27B-GPTQ-MTP | GPTQ int4, grupo 128 | no disponible | Sí | no disponible | no disponible | Apache-2.0 |
| hotdogs/…-AWQ-INT4 | AWQ int4 | no disponible | No (eliminada) | no disponible | no disponible | Apache-2.0 |
| davetha/…-W8A16 | W8A16 | no disponible | No (eliminada) | no disponible | no disponible | Apache-2.0 |

La ventaja de la build HYBRID frente a otras cuantizaciones es la conservación de la cabeza MTP y la protección selectiva de módulos sensibles. Las builds AWQ-INT4 y W8A16 de otros autores eliminan la cabeza MTP, perdiendo la capacidad de decodificación especulativa.

## Limitaciones y advertencias

- La cabeza MTP solo se activa si se pasa `speculative_config` explícitamente en vLLM; sin él, el rendimiento cae a la fila sin especulación (hasta 2,3 veces más lento). Esto es una fuente común de errores de configuración.
- El modelo está "abliterated" (desalienado): tiene una tasa de rechazo de solo 7 de 416 prompts dañinos. Esto implica que puede generar contenido dañino, ilegal o poco ético si se le pide. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- La calidad es estadísticamente equivalente a la build GPTQ de referencia, no superior. Las diferencias en benchmarks individuales no son significativas.
- El `lm_head` está en BF16 y no puede cuantizarse a FP8 en vLLM 0.27.1 por limitaciones del framework; esto puede cambiar en versiones futuras.
- La cabeza MTP no sobrevive un round-trip estándar de `transformers`, por lo que cualquier operación de guardado/carga con esa librería la eliminará silenciosamente.
- La información sobre idiomas soportados no está disponible; se asume herencia del modelo base Qwen3.8, pero no está confirmado.
- El tamaño real de parámetros en safetensors es 6,07B, mientras que el nombre del modelo indica 27B; esto se debe a la cuantización mixta, pero puede causar confusión en sistemas que esperan el peso completo en BF16.
- La licencia Apache-2.0 permite uso comercial, pero el estado "uncensored" del modelo puede generar responsabilidades legales si se despliega en aplicaciones públicas sin moderación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored-HYBRID
- Modelo base (BF16 reparado): https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- Ficha en LLM Explorer (build base): https://llm-explorer.com/model/Zynerji%2FEktome-Qwen3.8-27B-PristinelyUncensored,2RRZbScVnr4ntDr90fDCmu
- Ficha en LLM Explorer (build GPTQ-MTP): https://llm-explorer.com/model/Zynerji%2FEktome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP,5B9Ez7pfpsPlkjLdKClgIF
- Ficha en Friendli AI (build GPTQ-MTP): https://friendli.ai/models/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored-GPTQ-MTP
