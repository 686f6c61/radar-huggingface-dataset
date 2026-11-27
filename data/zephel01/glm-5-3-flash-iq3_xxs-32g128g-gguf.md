# zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF

## Resumen

GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF es una cuantización GGUF de tipo mixto del modelo zai-org/GLM-5.3-Flash, publicada por el usuario zephel01. Se trata de un modelo de arquitectura MoE (mixture of experts) con 320.759.404.382 parámetros totales, orientado a su despliegue en equipos de consumo con una GPU de 32 GB de VRAM y 128 GB de RAM. La cuantización emplea una mezcla de tipos (IQ3_XXS al 89%, IQ4_XS al 8% y Q2_K al 1% en bytes de los expertos), con un promedio de 3,13 bits por peso, y conserva todos los expertos sin poda.

El problema que resuelve es el de permitir ejecutar un modelo de gran tamaño en hardware asequible mediante offload de CPU y lectura desde SSD de los expertos que no caben en VRAM. El autor reporta 34,6 tok/s en un PC con 123 GB de RAM y una GPU de 32 GB, usando su motor Abyss. La calidad se mide mediante divergencia KL frente a la cuantización UD-Q4_K_XL de unsloth, con un valor de 0,1367 en el conjunto de evaluación, aproximadamente la mitad que la referencia UD-IQ2_XXS (0,2651).

Es relevante ahora porque demuestra que un modelo MoE de más de 320 mil millones de parámetros puede ejecutarse localmente en hardware de consumo con una pérdida de calidad moderada, y porque el autor publica variantes para distintos presupuestos de RAM (96 GB, 128 GB y DGX Spark). La ficha se encuentra en estado BETA según el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer con capa NextN/MTP |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | Mixta: expertos IQ3_XXS (89%), IQ4_XS (8%), Q2_K (1%); atención Q4_K/Q5_K; router, embeddings y salida en bytes de UD-IQ2_XXS; promedio 3,13 bits/peso |
| Idiomas soportados | en, ja |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 127,9 GB) |

## Arquitectura y entrenamiento

El modelo base es zai-org/GLM-5.3-Flash, de arquitectura MoE con capas de expertos enrutados (capas 3 a 44 según la tabla de tipos de la model card) y una capa NextN (MTP, multi-token prediction) con su propia proyección. La cuantización conserva todos los expertos, sin poda, y aplica tipos distintos según el rol de cada tensor: los expertos enrutados gate/up y down usan IQ3_XXS (con IQ4_XS en las capas 3-5, 11, 12 y 42-44 para down), las proyecciones de atención y los expertos densos/compartidos usan Q4_K y Q5_K, y el router, embeddings, salida y el resto de la capa NextN conservan los bytes de la cuantización UD-IQ2_XXS de unsloth.

El proceso de cuantización emplea LDLQ sobre la cuantización UD-Q4_K_XL de unsloth, usando un volcado de Hessian de transcripciones de chat en la plantilla de GLM (inglés, código y japonés) junto con la imatrix de unsloth. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el esquema de cuantización mixta por tipo de tensor, que prioriza la calidad de los expertos más usados y de las proyecciones de atención.

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Razonamiento de varios pasos y tareas de codificación, según el uso previsto por el autor ("long reasoning, hard coding").
- Soporte de plantilla de chat conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite exponerlo mediante API compatible con OpenAI a través del motor Abyss.
- Capacidad multilingüe limitada a inglés y japonés según los tags del repositorio.
- No se documentan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Razonamiento largo en local: el modelo conserva todos los expertos y una KL baja (0,1367), por lo que es adecuado para cadenas de razonamiento extensas ejecutadas en un PC con 32 GB de VRAM y 128 GB de RAM, sin depender de la nube.
- Programación asistida en producción: el autor lo recomienda para "hard coding"; puede integrarse en un servidor llama.cpp o Abyss expuesto como API compatible con OpenAI para autocompletado y revisión de código.
- Procesamiento de documentación en japonés: la KL en japonés es de 0,145 frente a 0,240 de UD-IQ2_XXS (aproximadamente un 40% menor), lo que lo hace adecuado para traducción, resumen y análisis de textos japoneses.
- Asistente conversacional local: con la plantilla de chat de GLM y el endpoint `/v1/chat/completions` del motor Abyss, sirve para atención al usuario en entornos con requisitos de privacidad.
- Evaluación e investigación de cuantizaciones: el repositorio incluye `SHA256SUMS` y métricas de KL reproducibles, útil para estudiar el impacto de esquemas de cuantización mixta en modelos MoE.
- Despliegue en estación de trabajo con DGX Spark: existe una variante específica (`GLM-5.3-Flash-DGX-Spark-GGUF`, 94,1 GB) para equipos con 128 GB de memoria unificada.
- Prototipado de agentes con contexto medio: con `-c 8192` verificado en llama.cpp, sirve para tareas de agente de ventana moderada en local.

## Benchmarks y rendimiento

| Metrica | Q120d (este repo) | S1 (32G96G) | Unsloth UD-IQ2_XXS |
|---|---:|---:|---:|
| Tamano de descarga | 127,9 GB | 94,1 GB | 101,8 GB |
| KL (10 secuencias) | 0,1367 | 0,2706 | 0,2651 |
| KL en japones | 0,145 | 0,280 | 0,240 |
| Mismo token top | 84,9% | 79,1% | 79,0% |
| Tokens/s (Abyss, 123 GB RAM, sin drafter) | 34,6 | no disponible | no disponible |
| Tokens/s con tier de 60 GB RAM | 19,0 | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 32 GB de GPU para el esquema objetivo; con menos RAM el autor recomienda la variante S1 de 94 GB.
- RAM: 128 GB o más para este repositorio; con 96 GB se debe usar la variante 32G96G.
- GPU recomendadas: RTX 5090 (32 GB), AI PRO R9700, RTX PRO 6000; el autor pide mediciones en GPUs de 24 GB con 128 GB de RAM.
- Almacenamiento: el repositorio ocupa 127,9 GB en 4 shards; el motor lee del SSD los expertos que no caben, con una espera de 1,4 ms por token en el equipo de referencia.
- Despliegue: motor Abyss (recomendado, con `setup-deepseek.sh --model glm --quant 32G128G --download-model`) y llama.cpp (arquitectura `glm5-next`, upstream `ac8e1694d` de 2026-10-29, con `llama-server -m ... -c 8192`). No se mencionan vLLM, Ollama ni TGI.
- Rendimiento: 34,6 tok/s con 123 GB de RAM y tier de 88,8 GB; 19,0 tok/s con tier de 60 GB; velocidad con llama.cpp no medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-IQ3_XXS-32G128G (este) | 320,8 B totales | no disponible | 0,1367 | MIT | GGUF, 127,9 GB |
| GLM-5.3-Flash-IQ2_XS-32G96G (S1) | 320,8 B totales | no disponible | 0,2706 | MIT | GGUF, 94,1 GB |
| Unsloth UD-IQ2_XXS | 320,8 B totales | no disponible | 0,2651 | MIT | GGUF, 101,8 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Estado BETA: medido en un solo PC (123 GB de RAM, sin drafter); faltan comprobaciones de uso real y el archivo puede sustituirse por una compilación mejor.
- La velocidad depende críticamente de que el modelo quepa en RAM; con menos de 128 GB el rendimiento cae a 19,0 tok/s o menos.
- El nombre del repositorio indica la cuantización más cercana a los bits promedio de los expertos, pero no es una cuantización estándar de ese nombre: mezcla varios tipos.
- Idiomas limitados a inglés y japonés según los tags; no se documenta soporte de castellano.
- Riesgo de alucinación inherente al modelo base; no se aportan datos específicos de sesgos.
- La licencia MIT permite uso comercial, pero el modelo base y la cuantización de referencia de unsloth deben verificarse por separado.
- Las lecturas desde SSD dominan el tiempo por token cuando el modelo no cabe en el tier de RAM, lo que puede degradar la latencia en producción.
- No se dispone de información sobre la longitud de contexto nativa del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante 32G96G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+32G128G+Q120d+on+YOUR_GPU
