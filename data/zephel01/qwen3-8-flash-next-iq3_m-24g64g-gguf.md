# zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF

## Resumen

Qwen3.8-Flash-Next IQ3_M 24G64G es una cuantización GGUF del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario zephel01 bajo el paraguas del motor de inferencia Abyss. El objetivo del artefacto es permitir ejecutar un modelo de arquitectura MoE con 176.943.899.520 parámetros totales (unos 177.000 millones) en un ordenador personal con una GPU de 24 GB de VRAM y 64 GB de RAM, manteniendo los 512 expertos del modelo original. El resultado es un único conjunto de tres shards que suma 93,7 GB en disco y unos 64,2 GB residentes entre VRAM y RAM.

La propuesta técnica se apoya en una recuantización de los expertos mediante LDLQ (una variante de cuantización con calibración) partiendo de los pesos en formato NVFP4 de NVIDIA, en lugar de partir de los pesos en precisión completa. Los tensores no expertos (atención, router, experto compartido, embeddings y la tabla de embeddings por capa) se copian sin cambios desde la cuantización UD-IQ4_XS de unsloth, de modo que el archivo resultante ocupa exactamente lo mismo que esa referencia pero obtiene una divergencia KL menor frente al modelo NVFP4 (0,068 frente a 0,092, un 26 % menos).

El interés actual del artefacto es doble: por un lado, demuestra que un MoE de ~177.000 millones de parámetros puede servirse en hardware de consumo con un compromiso de calidad medido y documentado; por otro, introduce requisitos específicos de motor (Abyss v1.3.108 o superior) y una arquitectura poco habitual (`qwen4exp`) que conviene conocer antes de desplegarlo. El autor lo etiqueta explícitamente como BETA, con mediciones realizadas en un único equipo emulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura de llama.cpp `qwen4exp`), 512 expertos por capa |
| Parametros totales | 176.943.899.520 (~177.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-server con `-c 32768`); máximo nativo del modelo base no disponible |
| Tipos de cuantizacion | Mezcla de tipos por tensor: expertos IQ3_S 57 %, IQ4_NL 34 %, Q8_0 7 %, IQ4_XS 1 % (por bytes); media de 3,94 bits por peso, aproximadamente equivalente a IQ3_M |
| Idiomas soportados | Inglés (en) y japonés (ja) declarados en la model card; el modelo base puede cubrir más idiomas, pero no se documentan en esta ficha |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en Hugging Face), heredada del modelo base |
| Formato de pesos | GGUF, 3 shards de 93,7 GB en total (`Qwen3.8-Flash-Next-24G64G-0000N-of-00003.gguf`), con `SHA256SUMS` en el repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 512 expertos por capa. Esta cuantización no altera la topología: conserva los 512 expertos y no elimina ninguno, a diferencia de la variante 12G32G del mismo autor, que retiene 448. La receta de cuantización parte de los pesos en NVFP4 y re-cuantiza cada experto con LDLQ, calibrado con texto en japonés y con turnos de chat del propio modelo. Los tipos asignados son IQ3_S para las proyecciones gate/up (con la capa 2 en IQ4_XS), IQ4_NL para las proyecciones down (con las capas 2, 4, 30, 46 y 47 en Q8_0) y los tensores no expertos se heredan byte a byte de la cuantización UD-IQ4_XS de unsloth.

Una particularidad relevante es la tabla de embeddings por capa, de 28,8 GB, que no se mantiene residente: se leen unas pocas filas por token desde el SSD. Esa es la razón por la que el consumo residente (64,2 GB) es inferior al tamaño del archivo (93,7 GB). El motor Abyss incorpora un esquema de offload de expertos a CPU y de lectura selectiva desde disco, y el ejemplo de llama.cpp usa `--n-cpu-moe 34` para distribuir 34 capas de expertos en CPU. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `--jinja` en llama.cpp.
- Razonamiento con modo "thinking" activable; las pruebas de uso real del autor se realizan con thinking on.
- Generación de código: las pruebas incluyen cinco tareas de programación con tests ocultos, con 5/5 y 4/5 superados en dos semillas.
- Aritmética y cálculo directo (el ejemplo de la model card resuelve 17*23 vía API compatible con OpenAI).
- Recuperación de información en contextos largos: se documenta la localización de una aguja en un prompt de 8K tokens.
- Capacidades multilingües verificadas en inglés y japonés, con pruebas específicas en japonés (correo de negocios, texto explicativo, resumen, dato literario y aritmética).
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente local de programación: el modelo puede ejecutarse en una estación de trabajo con RTX 5090 y 64 GB de RAM y atender consultas de código con contexto de 32K tokens, lo que permite pegar varios archivos y mantener la conversación. Los tests ocultos del autor lo sitúan en 5/5 y 4/5 en dos semillas, suficiente para tareas de refactorización y generación de funciones acotadas, no para sustituir una revisión humana.
- Atención al cliente en japonés e inglés: las pruebas en japonés (10/10 respuestas correctas en dos semillas, incluyendo correo de negocios y resumen) lo hacen adecuado para borradores de respuesta y resúmenes de tickets en entornos donde los datos no pueden salir de la máquina.
- Procesamiento de documentación larga: con 32.768 tokens de contexto y la prueba de aguja en 8K superada, sirve para resumir contratos, informes o documentación técnica de decenas de páginas en una sola pasada.
- Despliegue on-premise con requisitos de soberanía del dato: al caber en un PC de 24 GB de VRAM y 64 GB de RAM, permite montar un endpoint compatible con OpenAI en una oficina o laboratorio sin depender de la nube, con el coste de latencia que implica el offload a CPU y la lectura desde SSD.
- Prototipado e investigación sobre MoE de gran tamaño: el artefacto, junto con el motor Abyss, permite estudiar el comportamiento de un MoE de ~177.000 millones de parámetros con 512 expertos en hardware asequible, comparando métricas de KL frente a otras cuantizaciones.
- Generación de borradores y resúmenes en flujos internos: con temperaturas de muestreo 1.0 / top_p 0.95 / top_k 20, encaja en tareas de redacción asistida donde se tolera revisión posterior y se prioriza el coste cero por token.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de KL, coincidencia de token top y pruebas de uso real frente a UD-IQ4_XS, lo que lo convierte en un banco de pruebas reproducible para estudiar el impacto de LDLQ frente a la cuantización estándar.

## Benchmarks y rendimiento

| Metrica | Este archivo (IQ3_M 24G64G) | unsloth UD-IQ4_XS |
|---|---|---|
| Tamano de descarga | 93,7 GB | 93,7 GB |
| Residente (GPU + RAM) | 64,2 GB | 64,9 GB |
| KL (10 secuencias) | 0,068 | 0,092 |
| Coincidencia de token top | 90,3 % | 88,7 % |
| KL en japones | 0,146 | 0,195 |
| KL en codigo | 0,092 | 0,116 |
| Japones, 5 prompts, 2 semillas | 10/10 correctas | 10/10 correctas |
| Codigo, 5 tareas con tests ocultos | 5/5 y 4/5 | 3/5 y 5/5 |
| Aguja en prompt de 8K | encontrada | no disponible en la informacion |
| Throughput en PC emulado (RTX 5090 capada a 24 GB, tier de RAM 46 GB) | 69,9 tok/s en tareas de codigo | 71,1 tok/s en tareas de codigo |
| Decodificacion en llama.cpp (configuracion indicada) | 26-34 tok/s | no disponible en la informacion |

Las metricas de KL se calculan frente al modelo NVFP4 sobre 10 secuencias retenidas de 1.023 tokens (código, inglés, chino, japonés y otros). No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB es el objetivo de diseño; en el ejemplo de llama.cpp con `-ngl 99 --n-cpu-moe 34` el consumo medido fue de 24,2 GB, por lo que el autor recomienda usar 35 o más capas de expertos en CPU en una tarjeta real de 24 GB.
- RAM del sistema: 64 GB en el equipo objetivo; en el PC emulado se usó un tier de 46 GB dentro de un cgroup de 58 GB (`STRATA_GLM_RAM_GB=46`).
- Almacenamiento: 93,7 GB de descarga más espacio libre para el caché; se recomienda SSD por la lectura de filas de la tabla de embeddings por capa (28,8 GB) en cada token.
- GPU recomendadas: RTX 5090 (probada en el equipo emulado), así como cualquier GPU de 24 GB como RTX 4090, RTX 3090 o A10. Para el resto de variantes del autor: 12 GB de VRAM + 32 GB de RAM, 16 GB de VRAM + 64 GB de RAM, o DGX Spark con 128 GB.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB, siempre con offload de expertos a CPU y RAM.
- Opciones de despliegue: Abyss v1.3.108 o superior (recomendado por el autor, con `setup-deepseek.sh --model qwen38 --quant 24G64G --download-model`) y llama.cpp con soporte de la arquitectura `qwen4exp` (upstream `ac8e1694d` del 2026-10-29). No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: 69,9 tok/s en el PC emulado (RTX 5090 capada a 24 GB) y 26-34 tok/s de decodificación en la configuración de llama.cpp indicada. El autor advierte que la configuración 24G64G es un objetivo de diseño, no una garantía de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next IQ3_M 24G64G (este) | ~177.000 M totales, 512 expertos | 32.768 tokens (uso documentado) | GGUF, 93,7 GB | qwen-community-1.0 | KL 0,068; requiere Abyss ≥ v1.3.108 |
| Qwen3.8-Flash-Next UD-IQ4_XS (unsloth) | ~177.000 M totales, 512 expertos | no disponible | GGUF, 93,7 GB | qwen-community-1.0 | KL 0,092; mismos tipos de tensor, distinto redondeo |
| Qwen3.8-Flash-Next-E448-IQ2_M 12G32G (zephel01) | ~177.000 M totales, 448 de 512 expertos | no disponible | GGUF, 67,5 GB | qwen-community-1.0 | Para 12 GB de VRAM + 32 GB de RAM; elimina 64 expertos |
| Qwen3.8-Flash-Next-IQ3_M 16G64G (zephel01) | ~177.000 M totales, 512 expertos | no disponible | GGUF, 86,9 GB | qwen-community-1.0 | Para 16 GB de VRAM + 64 GB de RAM; mismos archivos que la variante DGX Spark |

## Limitaciones y advertencias

- Estado BETA declarado por el autor: todas las mediciones provienen de un único PC emulado (RTX 5090 capada a 24 GB, cgroup de 58 GB), no de hardware real de 24 GB, y el autor solicita reportes de equipos reales.
- Dependencia estricta de versión del motor: Abyss v1.3.108 o superior es necesario para la ruta de prompt, porque los expertos down en Q8_0 de este layout leen más allá de su slot en versiones anteriores (el mismo problema afecta a UD-IQ4_XS de unsloth).
- Compatibilidad limitada: fuera de Abyss y llama.cpp con soporte de `qwen4exp`, no se documenta funcionamiento en vLLM, TGI, Ollama ni otros servidores.
- Calidad degradada respecto al modelo NVFP4: la KL de 0,068 implica una divergencia no nula; en código, una de las dos semillas bajó a 4/5 en los tests ocultos, por lo que no es apto para producción crítica sin validación propia.
- Idiomas: la model card solo declara inglés y japonés; el rendimiento en castellano no está verificado y la KL en japonés (0,146) es más del doble que la global (0,068), lo que sugiere mayor degradación en idiomas distintos del inglés.
- Dependencia de disco: la tabla de embeddings por capa se lee desde SSD en cada token; un almacenamiento lento degradará la latencia de forma notable.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de sesgos; al ser una cuantización agresiva (3,94 bits por peso de media) sobre un MoE, es esperable un aumento de errores factuales frente al modelo en precisión completa.
- Licencia: `qwen-community-1.0` (etiquetada como `other`), con términos específicos que deben revisarse en el enlace de licencia del modelo base antes de cualquier uso comercial; la cuantización no otorga derechos adicionales.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K): las únicas métricas publicadas son KL, coincidencia de token top y pruebas cualitativas del autor.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 12G32G (448 expertos, IQ2_M): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Variante 16G64G (IQ3_M): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Formulario para reportar resultados de rendimiento: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+24G64G+on+YOUR_GPU
