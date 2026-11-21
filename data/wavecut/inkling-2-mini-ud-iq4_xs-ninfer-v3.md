# WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3

## Resumen

Inkling-2-Mini es un modelo de mezcla de expertos (MoE) con arquitectura de transformer "en bucle" (looped transformer) desarrollado por Thinking Machines. Cuenta con 26.400 millones de parametros totales y 3.400 millones activos por token, y combina capacidades de texto, razonamiento, tool calling y vision en un unico modelo multimodal de tipo image-text-to-text. Su rasgo arquitectonico mas distintivo es que 24 capas almacenadas se ejecutan como 48 visitas: el preludio (capas 0-5), el nucleo (capas 6-17) reutilizado tres veces con los mismos pesos y la coda (capas 18-23), lo que permite profundidad efectiva sin aumentar el numero de matrices.

La ficha que nos ocupa no es el modelo original, sino un artefacto de cuantizacion en formato `.ninfer` (v3) generado por WaveCut a partir del GGUF UD-IQ4_XS publicado por Unsloth, para el motor de inferencia NInfer-all. El archivo conserva los bloques ggml del GGUF byte a byte, sin recuantizar, e incorpora ademas la torre de vision (ViT) y el drafter especulativo DSpark del lanzamiento original. El resultado es un unico fichero de 16.790.806.016 bytes (15,6 GiB) que contiene texto, vision y decodificacion especulativa en un solo contenedor.

Es relevante ahora porque demuestra una via de despliegue de un MoE multimodal de 26B en una GPU de 24 GB, con soporte de contexto de hasta 65.536 tokens, tool calling en formato OpenAI, salida estructurada y decodificacion especulativa integrada. La licencia Apache 2.0 facilita su uso comercial, y el hecho de que los pesos no se recuantizen respecto al GGUF de referencia simplifica la trazabilidad de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer en bucle (looped transformer) con MoE; 24 capas almacenadas ejecutadas como 48 visitas (preludio 0-5, nucleo 6-17 x3, coda 18-23) |
| Parametros totales | 26,4 B |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | Hasta 65.536 tokens en la configuracion de ejemplo del servidor NInfer; atencion completa cada 6 capas (5, 11, 17, 23) y ventana de 1.024 posiciones en el resto |
| Tipos de cuantizacion | Mezcla por componente: NVFP4 (40 tensores), Q8_0 (115), Q6_K (17), Q5_K (3), Q5_0 (3), Q4_K (1), IQ4_XS (1), IQ4_NL (1), BF16 (142), FP32 (857) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (un unico fichero de 15,6 GiB); derivado de GGUF UD-IQ4_XS de Unsloth |

## Arquitectura y entrenamiento

El modelo base es un MoE con 128 expertos enrutados, 8 activos por token, puntuaciones sigmoid con sesgo de seleccion y activacion SiTU sobre la concatenacion [gate; up] de anchura 1152, sin experto compartido. La atencion usa 24 cabezas de consulta sobre 8 cabezas KV de dimension 128, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y sinks de atencion; las capas 5, 11, 17 y 23 atienden sobre todas las posiciones y el resto sobre una ventana de 1.024. La cabeza de salida esta desacoplada del embedding (201.024 filas, 200.058 puntuadas, soft cap de 30). El bucle del nucleo reutiliza los mismos pesos tres veces, cada visita con sus propias claves, valores e historiales de convolucion.

En este artefacto concreto, las matrices conservan los bloques ggml del GGUF de Unsloth sin recuantizar: el motor multiplica los bloques in situ. Los 20 de 24 capas usan NVFP4 para los expertos; las 4 restantes emplean bancos [gate; up] en Q5_K, Q4_K o IQ4_XS y bancos down en Q5_0 o IQ4_NL. Router, convoluciones, tablas de distancia, controladores de bucle y normas se guardan en FP32 (valores BF16 del GGUF ensanchados de forma exacta). La torre de vision es un ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2 y proyector de dos capas, con hasta 4.096 posiciones por imagen, en BF16/FP32. El drafter DSpark consta de tres bloques no causales sobre los estados muestreados del modelo objetivo y una cabeza de Markov recurrente de rango 256, en Q8_0. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generacion de texto y razonamiento, con el razonamiento del modelo emitido en sus propios bloques.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada (structured output) y decisiones tipadas (typed decisions) y reranking.
- Razonamiento multi-paso y soporte de agentes a traves del encadenamiento de tool calls.
- Vision: procesamiento de imagenes mediante la torre ViT del lanzamiento, hasta 4.096 posiciones por imagen.
- Decodificacion especulativa con el drafter DSpark (activa por defecto con una sola peticion en curso) o por busqueda en contexto.
- Concurrencia de una a ocho peticiones con reutilizacion de prefijo de prompt.
- Multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal con contexto largo: con 65.536 tokens de contexto y vision, el modelo puede analizar documentos extensos con figuras, capturas o diagramas y responder preguntas sobre ellos en una sola sesion.
- Agente con tool calling en produccion: al devolver las llamadas a herramienta como tool calls de OpenAI, se integra directamente en orquestadores de agentes existentes y en pipelines de automatizacion sin adaptadores adicionales.
- Extraccion de datos estructurados: la salida estructurada y las decisiones tipadas permiten convertir texto libre o imagenes en JSON validado para ingestion en bases de datos o sistemas de facturacion.
- Atencion al cliente automatizada: la concurrencia de hasta 8 peticiones con reutilizacion de prefijo reduce el coste por conversacion en escenarios multi-turno con un prompt de sistema largo compartido.
- Reranking y clasificacion: la capacidad de reranking y decisiones tipadas sirve para ordenar resultados de busqueda o clasificar tickets en pipelines de recuperacion.
- Inferencia en hardware de gama alta de consumo: con 14,6 GiB de pesos en GPU (15,0 GiB con el drafter) cabe en una tarjeta de 24 GB, lo que permite prototipado local de un MoE multimodal de 26B.
- Despliegue con memoria limitada: la opcion `--expert-residency host` coloca los expertos en memoria de host fijada, permitiendo ejecutar el modelo en tarjetas con menos VRAM que la necesaria para todos los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM con todos los expertos en GPU: 14,6 GiB de pesos (15,0 GiB con el drafter DSpark), segun la model card.
- Cabe en GPU de consumo de 24 GB (por ejemplo, RTX 4090) en la configuracion de ejemplo con contexto de 64K y vision.
- Para tarjetas con menos memoria que el modelo completo, los expertos pueden residir en memoria de host fijada (`--expert-residency host`).
- Despliegue mediante NInfer-all (ramas `master`); las builds estandar de NInfer rechazan este fichero, que requiere el commit `cc15a072` o posterior.
- Servidor compatible con OpenAI y Anthropic incluido en NInfer (`ninfer-serve`), con opciones `--max-context`, `--max-concurrency` y `--vision`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini (este artefacto) | 26,4 B | 3,4 B | hasta 65.536 | Si | Apache 2.0 | `.ninfer` v3 |
| Inkling-2-Mini (GGUF UD-IQ4_XS de Unsloth) | 26,4 B | 3,4 B | no disponible | Si (mmproj separado) | Apache 2.0 | GGUF |
| Inkling-2-Mini (original de Thinking Machines) | 26,4 B | 3,4 B | no disponible | Si | Apache 2.0 | safetensors (presumiblemente) |

No se dispone de datos de rendimiento comparado con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto especifico de un motor: solo funciona con NInfer-all desde el commit `cc15a072`; las builds estandar de NInfer lo rechazan.
- No es un GGUF: no puede cargarse en llama.cpp, Ollama, vLLM ni TGI, lo que limita las opciones de despliegue al ecosistema NInfer.
- La cuantizacion mixta (NVFP4 en 20 capas, Q5_K/Q4_K/IQ4_XS en 4) implica una perdida de precision no cuantificada en la informacion disponible; no se han publicado evaluaciones de calidad tras la cuantizacion.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingue ni el rendimiento en castellano.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- El contexto maximo de 65.536 tokens es una configuracion de ejemplo del servidor, no una especificacion confirmada del modelo base.
- La decodificacion especulativa automatica con DSpark solo se activa con una peticion concurrente; con mayor concurrencia el modo por defecto cambia.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar el fichero NOTICE incluido en el repositorio por posibles atribuciones adicionales.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all (rama master): https://github.com/iamwavecut/ninfer-all
- Guia de compilacion en Linux: https://github.com/iamwavecut/ninfer-all/blob/master/docs/build-linux.md
- Guia de compilacion en Windows: https://github.com/iamwavecut/ninfer-all/blob/master/docs/build-windows.md
