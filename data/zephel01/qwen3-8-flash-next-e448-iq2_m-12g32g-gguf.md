# zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF

## Resumen

Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, un transformer de tipo Mixture of Experts (MoE) con 161.836.540.800 parámetros totales (unos 161,8 mil millones). La publica el usuario zephel01 bajo el nombre de su herramienta de cuantización Abyss y su conjunto de utilidades trench-gguf. El objetivo del artefacto no es tanto ofrecer una versión más ligera del modelo original como hacerlo ejecutable en un equipo de consumo con una GPU de 12 GB de VRAM y 32 GB de RAM, un perfil de hardware muy extendido entre desarrolladores que trabajan en local.

La relevancia de esta ficha está en la técnica empleada: en lugar de una cuantización uniforme, el autor re-cuantiza cada experto del MoE con LDLQ a partir de los pesos originales en formato NVFP4, mantiene solo los 448 expertos más usados de los 512 de cada capa y mezcla tipos de cuantización (IQ4_NL, IQ1_S e IQ2_XXS) según la función del tensor. El resultado ocupa 67,5 GB en disco y, según las mediciones del autor en un PC emulado, alcanza 56,0 tok/s en tareas de código, frente a 43,0 tok/s de la referencia UD-IQ1_S de unsloth.

El modelo base es un MoE de Qwen con capacidades conversacionales y de razonamiento, orientado a generación de texto. Esta versión concreta es un artefacto BETA: el autor lo ha probado en un único equipo y solicita reportes de otras configuraciones. La licencia es Qwen Community 1.0, heredada del modelo base, y el repositorio incluye además una colección de variantes GGUF dimensionadas por tramos de GPU y RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); número de capas y dimensión no disponibles |
| Parametros totales | 161.836.540.800 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta por experto: IQ4_NL (57% de los bytes), IQ1_S (28%), IQ2_XXS (15%); 2,64 bits por peso de media (equivalente aproximado a IQ2_M) |
| Idiomas soportados | no disponibles oficialmente; la calibración y las pruebas cubren japonés, chino, inglés y código |
| Licencia | qwen-community-1.0 (license_name: other, enlace a la licencia del modelo base) |
| Formato de pesos | GGUF, 3 fragmentos (shards); punto de entrada `-00001-of-00003.gguf` |
| Tamano del repositorio | 67,5 GB |
| Expertos por capa | 448 de 512 |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Motor de inferencia | Abyss y llama.cpp |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE, y esta cuantización conserva su estructura: atención, router, experto compartido, embeddings y tabla PLE mantienen los bytes originales de UD-IQ1_S de unsloth sin modificar. La intervención del autor se concentra en los expertos: cada uno se re-cuantiza con LDLQ (una variante de cuantización con corrección por Hessiano) a partir de los pesos en NVFP4 del repositorio magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF, con las escalas por experto plegadas en el proceso. Las matrices gate/up usan IQ1_S (o IQ2_XXS en 14 capas) y las down usan IQ4_NL. Después se aplica una poda de expertos: de los 512 de cada capa se conservan los 448 más usados según conteos de routing.

La calibración se hizo sobre 1,26 millones de tokens que combinan los propios turnos de chat del modelo (181 prompts: 44 en japonés, 20 en chino, 20 en inglés, 37 de código, 35 de matemáticas y 25 de tool calls) seguidos de texto mixto en los mismos idiomas y dominios. La selección de expertos se validó sobre texto reservado, con tasas de rutas conservadas del 98,6% en japonés, 98,1% en chino, 98,3% en inglés y 96,9% en código. El autor destaca que la primera versión, calibrada solo con texto plano, producía respuestas vacías tras el bloque de razonamiento; la inclusión de turnos de chat con `</think>` y respuesta resolvió el problema en sus pruebas. No hay información sobre el entrenamiento del modelo base (número de tokens, RLHF/DPO) en la documentación disponible.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activable.
- Razonamiento y matemáticas: las pruebas del autor incluyen cinco prompts aritméticos y de hechos, resueltos correctamente en 10 de 10 ejecuciones.
- Generación de código: cinco tareas con tests ocultos, con 3 de 5 resueltas en dos semillas; una tarea concreta (conversor hiragana/katakana) tiende a agotar el límite de tokens por sobre-razonamiento.
- Tool calling / function calling: incluido en el conjunto de calibración (25 prompts de llamadas a herramientas), lo que sugiere soporte, aunque no se detalla su comportamiento en producción.
- Capacidades multilingües verificadas en japonés, chino e inglés; el japonés forma parte explícita de la calibración, la selección de expertos y las pruebas.
- Manejo de contextos largos: prueba de "needle in a haystack" con un prompt de 8K tokens superada.
- Procesamiento rápido de prompts largos: 1.822 tok/s en un prompt de 8K tokens en el equipo de referencia.

## Casos de uso

- Asistente de código en local: con 56,0 tok/s de decodificación en tareas de código y soporte de tool calling, se puede integrar en un flujo de edición asistida o revisión de parches sobre un PC con RTX de 12 GB, sin depender de APIs externas.
- Atención al cliente en japonés: el modelo responde correctamente correos comerciales, explicaciones y resúmenes en japonés (10 de 10 en las pruebas del autor), lo que lo hace apto para prototipos de soporte en ese idioma con datos que no pueden salir del equipo.
- Procesamiento de documentos largos: la ventana de contexto verificada de 8K tokens permite resumir o extraer información de informes, contratos o artículos sin truncar el contenido en la mayoría de casos de uso ofimático.
- Desarrollo y depuración de pipelines de agentes: al ejecutarse en Abyss y llama.cpp con offload de CPU, sirve como banco de pruebas local para validar rutas de tool calling y razonamiento multi-paso antes de desplegar en infraestructura mayor.
- Educación y experimentación con MoE: el artefacto documenta con detalle el proceso de poda de expertos y cuantización mixta, por lo que es útil para estudiar el impacto de recortar de 512 a 448 expertos por capa con métricas de KL y coincidencia de top token.
- Traducción y generación de contenido multilingüe (japonés, chino, inglés) en entornos con requisitos de privacidad, aprovechando que el modelo cabe en un equipo de sobremesa con 32 GB de RAM.
- Evaluación comparativa de cuantizaciones: sirve para medir en hardware propio la diferencia entre esta variante y UD-IQ1_S de unsloth en velocidad, calidad y consumo de VRAM.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en Abyss sobre un PC emulado (RTX 5090 con VRAM limitada a 12 GB, 20 GB de RAM en un cgroup de 28 GB, 8 hilos de CPU, sin drafter):

| Metrica | L448 (esta version) | unsloth UD-IQ1_S |
|---|---|---|
| KL global (10 secuencias x 1.023 tokens) | 0,339 | 0,331 |
| Coincidencia de top token | 78,5% | 78,4% |
| KL en secuencias japonesas | 0,553 | 0,568 |
| Decodificacion, 3 tareas de codigo (17K tokens) | 56,0 tok/s | 43,0 tok/s |
| Procesamiento de prompt de 8K | 1.822 tok/s | 1.368 tok/s |
| Decodificacion en japones | 48-51 tok/s | 39-46 tok/s |
| Tamano en disco | 67,5 GB | 72,5 GB |
| Tareas de codigo con tests ocultos (2 semillas) | 3/5, 3/5 | 5/5, 3/5 |
| Prompts japoneses (5) | 10/10 correctos | 10/10 |
| "Japan's three great essays" (tokens generados) | 196 / 165 | 454 / 384 |

Como referencia adicional, llama.cpp con UD-IQ1_S y `--n-cpu-moe 41` (unos 12 GB de VRAM) alcanza 27,6 tok/s en las mismas tres tareas de código. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 12 GB es el objetivo de diseño; el resto de pesos (expertos no residentes y tabla de embeddings) se reparte entre RAM y SSD.
- RAM: 32 GB en el equipo objetivo; el autor menciona una variante para 64 GB como petición abierta, lo que implica que esta no la aprovecha.
- GPU medidas: solo una RTX 5090 con VRAM capada a 12 GB en modo emulación; no hay mediciones en otras GPU.
- GPU de consumo compatibles por capacidad: RTX 3060 12 GB, RTX 4070 12 GB, RTX 5070 12 GB y similares con 12 GB o más; con menos VRAM el offload a RAM y SSD crecería y el rendimiento caería.
- Almacenamiento: SSD NVMe recomendado, porque la tabla de embeddings por capa se lee desde disco en Abyss y se mapea en llama.cpp.
- Motores de despliegue: Abyss (servidor propio del autor, con variables como `STRATA_GLM_VRAM_GB`) y llama.cpp con `--n-cpu-moe`.
- Throughput de referencia: 56,0 tok/s en decodificación de código y 1.822 tok/s en prefill de 8K en el equipo emulado; en llama.cpp con la referencia de unsloth, 27,6 tok/s.
- Integración con endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs de tipo OpenAI, aunque no se detalla en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (L448, IQ2_M mixta) | 161,8B totales, 448/512 expertos por capa | no disponible (probado a 8K) | 67,5 GB | qwen-community-1.0 | 56,0 tok/s en código, KL 0,339 |
| unsloth UD-IQ1_S de Qwen3.8-Flash-Next | 161,8B totales, 512/512 expertos | no disponible | 72,5 GB | qwen-community-1.0 | 43,0 tok/s, KL 0,331; mejor en tareas de código (5/5 frente a 3/5) |
| magnitudedev Qwen3.8-Flash-Next-NVFP4-GGUF | 161,8B totales | no disponible | no disponible | qwen-community-1.0 | Pesos NVFP4 de origen, usados como referencia de KL; no orientado a GPU de 12 GB |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una versión BETA medida en un único equipo; el rendimiento en otras GPU, tamaños de RAM o SSD no está verificado.
- La poda de 64 expertos por capa reduce la calidad en algunas tareas: en las pruebas de código con tests ocultos obtiene 3/5 frente a 5/5 de UD-IQ1_S en una de las semillas.
- El modelo base tiende al sobre-razonamiento: una tarea concreta (conversor hiragana/katakana) agota el límite de tokens en la mayoría de ejecuciones, en todas las compilaciones. Conviene ajustar `max_tokens` o desactivar el modo thinking en esos casos.
- Riesgo de respuestas vacías: la primera compilación terminaba el turno tras el bloque de razonamiento sin responder; la versión actual lo corrige en las pruebas del autor, y Abyss v1.3.106 incluye una protección (`STRATA_GLM_END_GUARD`). En otros motores el riesgo no está descartado.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial que deben revisarse antes de desplegar en producción.
- No hay información sobre sesgos, idiomas oficialmente soportados ni longitud de contexto del modelo base en la documentación disponible.
- La calidad depende del calibrado en japonés, chino, inglés y código; el rendimiento en otros idiomas no está evaluado.
- El repositorio tiene 138 descargas y 4 likes en el momento de la consulta, por lo que la validación comunitaria es todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Colección de GGUFs del autor: https://huggingface.co/collections/zephel01/qwen38-flash-next-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pesos NVFP4 de referencia: https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Repositorio de la herramienta de cuantización: https://github.com/zephel01/trench-gguf
- Motor Abyss: https://github.com/zephel01/Abyss
- Formulario de reporte de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+12G32G-L448+on+YOUR_GPU
