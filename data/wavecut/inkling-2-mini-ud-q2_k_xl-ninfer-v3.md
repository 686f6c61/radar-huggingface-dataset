# WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3

## Resumen

Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3 es un artefacto de inferencia en formato `.ninfer` (no es un modelo original, sino un empaquetado para el motor NInfer) derivado de Thinking Machines' Inkling 2 Mini, un modelo de mezcla de expertos (MoE) con arquitectura de transformer con bucles ("looped transformer") de 26,4 mil millones de parámetros totales y 3,4 mil millones activos por token. Este artefacto concreto parte del GGUF UD-Q2_K_XL de Unsloth e incorpora la torre de visión en Q8_0 y el drafter DSpark para decodificación especulativa, todo empaquetado para NInfer v3 (rama `master` de `iamwavecut/ninfer-all`).

El modelo resuelve el problema de desplegar un modelo multimodal con razonamiento, tool calling y visión en un único fichero de 9,39 GiB, manteniendo los bloques ggml del GGUF byte a byte (sin recuantizar), de modo que el motor multiplica los bloques in situ. Es relevante porque permite ejecutar el modelo completo —texto, visión, decodificación especulativa y tool calling— en un solo artefacto portable, con expertos enrutados que pueden residir en GPU, en memoria de host fijada o leerse desde el propio fichero.

La cuantización UD-Q2_K_XL es la mayor de 2 bits de la familia, 1,1 GB por encima de UD-IQ1_M. Unsloth midió una divergencia KL media de 0,0595 respecto a UD-Q8_K_XL y el mismo token top en el 91,6% de las posiciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE (24 capas almacenadas ejecutadas como 48 visitas: preludio 0-5, núcleo 6-17 tres veces con los mismos pesos, coda 18-23) |
| Parametros totales | 26,4 mil millones |
| Parametros activos | 3,4 mil millones por token |
| Longitud de contexto | no disponible (la atención usa una tabla aprendida de 1.024 distancias; capas 5, 11, 17 y 23 atienden sobre todas las posiciones, el resto sobre 1.024) |
| Tipos de cuantizacion | UD-Q2_K_XL (2 bits, la mayor de 2 bits de la familia); mezcla interna de Q8_0, Q6_K, Q5_K, Q4_K, Q2_0, NVFP4, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ4_XS, BF16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (un único fichero de 10.080.361.216 bytes, 9,39 GiB); derivado de GGUF UD-Q2_K_XL de Unsloth |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: 24 capas almacenadas se ejecutan como 48 visitas, donde el preludio (capas 0-5) se ejecuta una vez, el núcleo (capas 6-17) se ejecuta tres veces con los mismos pesos y la coda (capas 18-23) una vez, cada visita con sus propias claves, valores e historiales de convolución. La atención usa 24 cabezas de consulta sobre 8 cabezas KV de 128 dimensiones, sin rotación, con una tabla aprendida de 1.024 distancias y sinks; las capas 5, 11, 17 y 23 atienden sobre todas las posiciones y el resto sobre 1.024. La capa MoE tiene 128 expertos enrutados, 8 por token, con puntuaciones sigmoideas más un sesgo de selección, activación SiTU sobre [gate; up] de anchura 1152 y sin experto compartido. La tabla de tokens y la cabeza no atada tienen 201.024 filas (200.058 puntuadas, soft cap 30).

Los datos de entrenamiento (número de tokens, composición del dataset, si hubo RLHF/DPO) no están disponibles en la información proporcionada. La innovación técnica destacable es la decodificación especulativa con el drafter DSpark (tres bloques no causales sobre los estados muestreados del objetivo y una cabeza de Markov recurrente de rango 256), activada por defecto mientras se ejecuta una sola petición, o mediante búsqueda por contexto. La torre de visión es un ViT con fila de clase, filas de posición redimensionadas, cabezas con rotación 2D, fusión 2x2, proyector de dos capas y hasta 4.096 posiciones por imagen.

## Capacidades

- Generación de texto y razonamiento, con el razonamiento del modelo en sus propios bloques.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls de OpenAI, con argumentos estrictos y salida estructurada.
- Decodificación especulativa con el drafter DSpark (por defecto con una petición) o por búsqueda de contexto.
- Visión: procesamiento de imágenes a través de la torre de visión del release (hasta 4.096 posiciones por imagen).
- Decisiones tipadas y reranking.
- Reutilización de prefijo de prompt.
- Concurrencia de una a ocho peticiones simultáneas.
- Expertos enrutados en GPU, en memoria de host fijada o leídos desde el fichero.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente multimodal con imágenes: el modelo puede recibir una imagen y responder preguntas sobre ella gracias a la torre de visión Q8_0 incluida en el artefacto, útil para soporte técnico con capturas o análisis de documentos escaneados.
- Automatización de agentes con tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls de OpenAI, lo que permite integrarlo en orquestadores de agentes existentes sin adaptadores adicionales.
- Razonamiento multi-paso con decodificación especulativa: el drafter DSpark acelera la generación en escenarios de una sola petición, adecuado para tareas de razonamiento interactivo donde la latencia importa.
- Despliegue en hardware limitado: al ocupar 9,39 GiB y permitir que los expertos enrutados residan en memoria de host fijada o se lean desde el fichero, puede ejecutarse en equipos con VRAM moderada.
- Servicio concurrente de hasta ocho peticiones: con reutilización de prefijo de prompt, es adecuado para endpoints de chat multi-turno donde varias conversaciones comparten sistema de prompt.
- Reranking y decisiones tipadas: la salida estructurada y las decisiones tipadas permiten usarlo como componente de ranking en pipelines de búsqueda o clasificación.
- Procesamiento por lotes offline: el artefacto único y portable facilita distribuirlo en contenedores sin dependencias de múltiples ficheros GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de calidad de cuantización es la divergencia KL media de UD-Q2_K_XL respecto a UD-Q8_K_XL medida por Unsloth: 0,0595, con el mismo token top en el 91,6% de las posiciones.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 9,39 GiB; con expertos en GPU se necesita espacio adicional para estados y caché KV. No disponible el desglose exacto por componente.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; el tamaño del fichero (9,39 GiB) sugiere que podría caber en GPUs de 12-16 GB con expertos parcialmente en host, pero no hay dato oficial.
- Opciones de despliegue: NInfer-all (rama `master` de `iamwavecut/ninfer-all`), release `2026-11-21.3` o posterior; las builds estándar de NInfer rechazan este fichero.
- Latencia y throughput: no disponibles. La conversión tardó 32 segundos en un host con RTX 3090 alquilada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3 | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | `.ninfer` |
| Inkling-2-Mini-UD-IQ1_M-NInfer-v3 | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | `.ninfer` |
| Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3 | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | `.ninfer` |
| Inkling-2-Mini-UD-IQ4_XS-NInfer-v3 | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | `.ninfer` |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá del tamaño y la divergencia KL de UD-Q2_K_XL frente a UD-Q8_K_XL.

## Limitaciones y advertencias

- Es un artefacto de cuantización de 2 bits: la divergencia KL media de 0,0595 frente a UD-Q8_K_XL implica pérdida de fidelidad respecto al modelo completo.
- Requiere NInfer release `2026-11-21.3` o posterior; las builds estándar de NInfer rechazan este fichero.
- La familia Inkling 2 existe solo en la línea NInfer-all, lo que limita la portabilidad a otros motores.
- La capa 20 tiene su banco down almacenado como Q8_0 en lugar de MXFP4, ocupando 361 MB en vez de 180 MB; es una decisión del conversor, no un cambio de valores.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe.
- Sesgos conocidos y riesgo de alucinación: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar el NOTICE incluido en el repositorio.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria documentada.

## Enlaces

- [Hugging Face: WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [GGUF de Unsloth: unsloth/Inkling-2-Mini-GGUF](https://huggingface.co/unsloth/Inkling-2-Mini-GGUF)
- [GGUF de ggml-org: ggml-org/Inkling-2-Mini-GGUF](https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF)
- [NInfer (repositorio)](https://github.com/Neroued/ninfer)
- [NInfer-all (rama master)](https://github.com/iamwavecut/ninfer-all)
- [Variante UD-IQ1_M](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3)
- [Variante UD-Q3_K_XL](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3)
- [Variante UD-IQ4_XS](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3)
- [Variante APEX-I MiniPlus V2.1](https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3)
