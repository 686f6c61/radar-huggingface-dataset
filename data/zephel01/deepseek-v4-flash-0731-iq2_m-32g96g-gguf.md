# zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF

## Resumen

DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF es una cuantización GGUF del modelo base deepseek-ai/DeepSeek-V4-Flash-0731, publicada por el usuario zephel01 bajo licencia MIT. Se trata de un modelo de arquitectura MoE (mixture of experts) con 284.334.567.511 parámetros totales, reempaquetado específicamente para ejecutarse en un equipo con una GPU de 32 GB de VRAM (RTX 5090 o AI PRO R9700) y 96 GB de RAM, con offload parcial a CPU.

La particularidad de esta build es que conserva los 256 expertos de todas las capas (sin poda), re-cuantizados con LDLQ a partir de los pesos UD-Q8_K_XL de Unsloth, con una mezcla de tipos (IQ2_XS 41%, IQ3_XXS 39%, IQ2_S 18%, MXFP4 2% por bytes) que promedia 2,64 bits por peso, aproximadamente equivalente a IQ2_M. El repositorio ocupa 96,8 GB y se distribuye en tres shards.

Es relevante para desarrolladores que quieren ejecutar localmente un modelo de 284B parámetros en hardware de consumo, con un motor específico (Abyss) y una configuración de memoria híbrida GPU/CPU. La model card la marca explícitamente como BETA, medida en un único PC, con datos de velocidad y calidad (KL, coincidencia de top token) frente a la cuantización de referencia de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles de capas y atención no disponibles |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con prompts de 4K, 16K y needle de 8K-31K) |
| Tipos de cuantizacion | Mezcla: IQ2_XS (41%), IQ3_XXS (39%), IQ2_S (18%), MXFP4 (2%) por bytes; 2,64 bits por peso de media; atención `attn_q_b`, `attn_output_a`, `attn_output_b` en Q5_K; resto de tensores densos, router, embeddings y output en tipos de UD-Q2_K_XL |
| Idiomas soportados | no disponible oficialmente; la model card incluye pruebas en inglés y japonés, y advierte de respuestas en chino ante prompts en japonés |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards; punto de entrada `-00001-of-00003.gguf`; `SHA256SUMS` incluido) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE de 284B parámetros totales, según el dato de safetensors. Esta publicación no entrena el modelo: es una re-cuantización. Los expertos enrutados (los 256 de cada capa) se re-cuantizaron con LDLQ a partir de los pesos UD-Q8_K_XL de Unsloth, cuyos expertos son los pesos MXFP4 originales. Para calibrar se usó un volcado de Hessian de respuestas de chat del propio V4 (241 prompts, 104 en japonés, con la plantilla de V4) más texto general, y una imatrix propia de aproximadamente 1 millón de tokens (Unsloth no publicó una para V4).

Los detalles de asignación de tipos por capa son: gate/up en IQ2_XS (capas 31-42 en IQ2_S, capa 26 en IQ3_XXS), down en IQ3_XXS (capas 26 y 42 conservadas en MXFP4). El resto de tensores densos, router, embeddings, output y tablas hash se toman tal cual de los bytes de UD-Q2_K_XL de Unsloth. El primer shard (solo metadatos, 5 MB) es el archivo de Unsloth sin modificar, por lo que su campo `general.quantized_by` sigue indicando Unsloth. No hay información sobre datos de entrenamiento originales, RLHF/DPO ni innovaciones de decodificación del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (la model card reporta una prueba de conversación de 11 turnos superada).
- Razonamiento y respuesta a preguntas con contexto largo: recuperación tipo needle en ventanas de 8K a 31K tokens.
- Generación de código: tareas de programación con tests (4 de 5 superadas en la evaluación del autor).
- Tool calling / function calling: la prueba `--check` incluye una tarea de tool call superada.
- Capacidades multilingües: inglés y japonés evaluados; se observa deriva al chino en respuestas a preguntas en japonés.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local de largo contexto: el modelo puede mantener conversaciones multi-turno con prompts de hasta 16K tokens (medidos) y recuperar información en ventanas de 8K-31K, adecuado para un asistente personal que corre íntegramente en un PC con RTX 5090 y 96 GB de RAM.
- Generación de código en local: útil para autocompletado y resolución de tareas de programación con verificación por tests, sin enviar código a servicios externos, aprovechando la licencia MIT y el despliegue local.
- Tool calling en pipelines internos: la capacidad de function calling verificada permite integrarlo en flujos de automatización que invocan APIs o scripts, aunque conviene validar cada herramienta en producción por tratarse de una build BETA.
- Procesamiento de documentación larga: la recuperación needle en 8K-31K tokens lo hace apto para resumir o consultar contratos, informes o bases de conocimiento extensas en un entorno de escritorio.
- Desarrollo y experimentación con MoE cuantizados: investigadores pueden usar esta build para estudiar el impacto de la cuantización LDLQ y de la mezcla de tipos en la calidad (KL 0,150) frente a alternativas, con el motor Abyss.
- Atención al cliente o soporte en japonés e inglés: viable con la advertencia de fijar en el system prompt el idioma de respuesta ("日本語で答えてください。"), que reduce la deriva al chino de 11/24 a 1/24 según la model card.
- Inferencia en hardware de consumo con offload: escenario de despliegue en un PC con GPU de 32 GB y 96 GB de RAM para prototipos y demos sin infraestructura de servidor.

## Benchmarks y rendimiento

Datos publicados en la model card (motor Abyss v1.3.120, RTX 5090 32 GB por OCuLink PCIe Gen4 x4, Ryzen AI Max+ 395, RAM tier 60 GB, temperatura 0, 512 tokens tras prompt de 4K/16K, mediana de 3):

| Metrica | L97 (esta build) | unsloth UD-Q2_K_XL (referencia) |
|---|---|---|
| Tamano de descarga | 96,8 GB | 96,8 GB |
| KL (12 secuencias) | 0,150 | 0,186 |
| KL, japones (3 secuencias) | 0,145 | 0,219 |
| Mismo top token | 84,1% | 81,5% |
| RTX 5090, prompt 4K | 69,1 tok/s | 65,1 tok/s |
| RTX 5090, prompt 16K | 65,9 tok/s | 63,9 tok/s |
| Abyss `--check` | 10 de 11 | 11 de 11 |
| Japones (10 respuestas) | 7/10 en japones, 0 hechos erroneos | 7/10, 0 hechos erroneos |
| Codigo (5 tareas con tests) | 4/5 | 5/5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 32 GB en GPU para el escenario objetivo (RTX 5090 o AI PRO R9700); el resto del modelo se reparte entre RAM y SSD.
- RAM: 96 GB en el equipo objetivo; la model card usa un tier de RAM de 60 GB (`STRATA_GLM_RAM_GB=60`) bajo un límite de memoria de 84 GB.
- Almacenamiento: NVMe SSD recomendado; el repositorio ocupa 96,8 GB en 3 shards.
- GPU recomendadas: RTX 5090 (32 GB) y AI PRO R9700 (32 GB) son las medidas; otras GPU no están medidas.
- ¿Cabe en GPU de consumo? Sí, en una RTX 5090 de 32 GB, pero con offload a RAM y SSD; no cabe íntegramente en VRAM.
- Motores de despliegue: Abyss v1.3.120 o superior (con `tools/iq_pack.py --compat-bf16` y `--glm-pack`); llama.cpp no verificado aún (los tipos son ggml estándar en el layout de Unsloth). vLLM, Ollama y TGI no están documentados para esta build.
- Latencia y throughput: 69,1 tok/s con prompt de 4K y 65,9 tok/s con 16K en el equipo de referencia; sin el drafter DSpark (que consume unos 6,5 GB de VRAM) se obtienen 69,1 frente a 62,5 tok/s a 4K. En un sobremesa DDR5 convencional se esperan cifras menores.
- Nota: el nombre 32G96G indica un equipo objetivo, no una garantía de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL) | Velocidad 4K (RTX 5090) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta build (L97, IQ2_M-32G96G) | 284B | no disponible | 0,150 | 69,1 tok/s | MIT | Hugging Face (15 descargas) |
| unsloth UD-Q2_K_XL | 284B (mismo base) | no disponible | 0,186 | 65,1 tok/s | MIT (base) | Hugging Face |
| zephel01 32G64G (IQ2_XXS) | 284B (mismo base) | no disponible | no disponible | no disponible | MIT | Hugging Face (72,0 GB) |
| zephel01 16G64G (IQ1_S) | 284B (mismo base) | no disponible | no disponible | no disponible | MIT | Hugging Face (61,7 GB) |

No se dispone de datos de otros modelos de categoría similar (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- Build BETA: medida en un único PC; el archivo puede sustituirse por una versión mejor tras más mediciones y el nombre de la carpeta cambiará.
- Deriva de idioma: V4 0731 a veces responde en chino a preguntas en japonés (respuesta correcta en contenido). Ocurre también con los pesos originales (6 de 24 respuestas) y algo más con esta cuantización (11 de 24); con system prompt en japonés baja a 1 de 24.
- Menor calidad que la referencia en algunas pruebas: 10 de 11 en `--check` frente a 11 de 11 de Unsloth, y 4 de 5 tareas de código frente a 5 de 5.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, requiere verificación en producción.
- Sesgos: no documentados en la información proporcionada.
- Limitaciones de contexto: la longitud máxima de contexto no está especificada; las pruebas llegan a 31K tokens.
- Licencia MIT: permite uso comercial, pero el modelo base y las dependencias deben verificarse por separado.
- Compatibilidad: solo verificada con Abyss; llama.cpp sin comprobar; otros motores no documentados.
- El primer shard conserva metadatos de Unsloth (`general.quantized_by`), lo que puede confundir en auditorías.
- El drafter DSpark no debe usarse en GPU de 32 GB según el autor (reduce el throughput).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Variante 32G64G (IQ2_XXS, 72,0 GB): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Variante 16G64G (IQ1_S, 61,7 GB): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Repositorio del motor Abyss: https://github.com/zephel01/Abyss
- Issues de Abyss (informes de rendimiento): https://github.com/zephel01/Abyss/issues
- Plantilla de informe de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+32G96G+L9
