# WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3

## Resumen

Inkling-2-Mini-UD-IQ4_XS-NInfer-v3 es un artefacto de inferencia en formato `.ninfer` (v3) del modelo Inkling 2 Mini de Thinking Machines, un transformer con bucles (*looped transformer*) y mezcla de expertos (MoE) de 26.400 millones de parámetros totales con 3.400 millones activos por token. No es un modelo nuevo ni un reentrenamiento: es una conversión byte a byte del GGUF UD-IQ4_XS publicado por Unsloth, empaquetada por WaveCut para el motor NInfer (rama `master` de `iamwavecut/ninfer-all`), que multiplica los bloques ggml en su sitio sin recuantizar.

El paquete integra tres componentes en un único fichero de 16.595.277.824 bytes (15,5 GiB): el modelo de texto con 24 capas almacenadas que se ejecutan como 48 visitas (preludio 0-5, núcleo 6-17 repetido tres veces con los mismos pesos, coda 18-23), la torre de visión ViT en Q8_0 procedente de `mmproj-Inkling-2-Mini-Q8_0.gguf` de ggml-org, y el *drafter* DSpark para decodificación especulativa, en el layout principal de llama.cpp.

Su relevancia es práctica: permite ejecutar un MoE multimodal de 26,4B con visión, tool calling, razonamiento y decodificación especulativa en GPUs NVIDIA desde Volta hasta Blackwell, con los expertos enrutados en GPU, en memoria de host fijada o leídos directamente del fichero. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque el formato `.ninfer` obliga a usar el motor NInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE con atención por ventana y torre de visión ViT |
| Parametros totales | 26,4B (modelo base) |
| Parametros activos | 3,4B por token |
| Longitud de contexto | 1.024 posiciones en la mayoría de capas; capas 5, 11, 17 y 23 sobre todas las posiciones (longitud total no disponible) |
| Tipos de cuantizacion | IQ4_XS (base UD-IQ4_XS); internamente NVFP4, Q8_0, Q6_K, Q5_K, Q5_0, Q4_K, IQ4_NL, BF16 y FP32 por componente |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (contenedor propio de NInfer; deriva de GGUF sin recuantizar) |

Otros datos: 1.185 objetos tensoriales (856 FP32, 255 Q8_0, 40 NVFP4, 17 Q6_K, 3 Q5_K, 3 Q5_0, 3 BF16, 1 Q4_K, 1 IQ4_XS, 1 IQ4_NL); SHA-256 `d96986947048ed3ac643da0ed6c389e8ab821f66d10e2abf1f4347224b4180db`; tamaño del repositorio en Hugging Face 49,9 GB.

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas almacenadas se ejecutan como 48 visitas, donde el núcleo (capas 6-17) se recorre tres veces reutilizando los mismos pesos, cada visita con sus propias claves, valores e historiales de convolución. La atención usa 24 cabezas de consulta sobre 8 cabezas KV de dimensión 128, sin rotación posicional, con una tabla aprendida de 1.024 distancias y *sinks* de atención; las capas 5, 11, 17 y 23 atienden sobre todas las posiciones y el resto sobre una ventana de 1.024.

La capa MoE tiene 128 expertos enrutados, 8 por token, con puntuaciones sigmoideas más un sesgo de selección, activación SiTU sobre `[gate; up]` de anchura 1.152 y sin experto compartido. La tabla de tokens y la cabeza no atada (201.024 filas, 200.058 puntuadas, tope suave 30) se almacenan en Q8_0 y Q6_K respectivamente. Router, convoluciones, tablas de distancia, controladores de bucle y normas van en FP32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable del artefacto es la integración del *drafter* DSpark (tres bloques no causales sobre los estados del modelo objetivo y una cabeza de Markov recurrente de rango 256) para decodificación especulativa, y la conservación exacta de los bloques ggml del GGUF original.

## Capacidades

- Generación de texto y razonamiento con bloques de pensamiento propios devueltos por el motor.
- Comprensión de imágenes mediante torre ViT con hasta 4.096 posiciones por imagen, fusión 2x2 y proyector de dos capas.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como *tool calls* en formato OpenAI, con argumentos estrictos.
- Salida estructurada y decisiones tipadas, además de *reranking*.
- Decodificación especulativa con el *drafter* DSpark (activa por defecto con una sola petición) o por búsqueda en contexto.
- Concurrencia de una a ocho peticiones con reutilización de prefijo de prompt.
- Capacidades multilingües: no disponible.

## Casos de uso

- Atención al cliente automatizada: conversaciones multi-turno con reutilización de prefijo de prompt y hasta ocho peticiones concurrentes, adecuado por el bajo coste por token de un MoE con solo 3,4B activos.
- Agentes con herramientas en producción: el motor traduce los bloques JSON del modelo a *tool calls* de OpenAI con argumentos estrictos, lo que permite integrarlo en orquestadores existentes sin adaptadores.
- Análisis de documentos con imágenes: la torre ViT procesa hasta 4.096 posiciones por imagen, útil para extraer datos de capturas, formularios o gráficos combinados con texto.
- Generación de código asistida: razonamiento en bloques separados y salida estructurada para pipelines de CI/CD que necesiten respuestas parseables.
- Reranking y clasificación tipada: decisiones tipadas del motor para ordenar candidatos en sistemas de búsqueda o RAG.
- Despliegue en hardware modesto: con los expertos enrutados en memoria de host fijada o leídos del fichero, el modelo cabe en GPUs de consumo con 15,5 GiB de pesos, útil para prototipado local.
- Servicio de inferencia de baja latencia: la decodificación especulativa con DSpark reduce el número de pasos por token en cargas de una sola petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 15,5 GiB para los pesos en el fichero; la VRAM real depende de si los expertos enrutados residen en GPU, en memoria de host fijada o se leen del fichero.
- GPUs soportadas: NVIDIA desde Volta hasta Blackwell (por ejemplo V100, A100, H100, RTX 3090, RTX 4090).
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB si se descargan expertos a host; el autor convirtió el modelo en un contenedor sobre una RTX 3090 alquilada en 22 segundos.
- Despliegue: exclusivamente mediante NInfer-all (compilación de release o imagen Docker `cuda13.4`, o `cuda12.9` para Tesla V100) desde la release `2026-11-24.1`; requiere el commit `603a99ca` o posterior para el *drafter* DSpark.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-UD-IQ4_XS-NInfer-v3 | 26,4B | 3,4B | ventana de 1.024 en la mayoría de capas | Apache 2.0 | `.ninfer` (solo NInfer) |
| thinkingmachines/Inkling-2-Mini | 26,4B | 3,4B | no disponible | Apache 2.0 | safetensors (original) |
| unsloth/Inkling-2-Mini-GGUF (UD-IQ4_XS) | 26,4B | 3,4B | no disponible | Apache 2.0 | GGUF (llama.cpp) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El fichero solo lo ejecuta NInfer: las compilaciones estándar de NInfer lo rechazan, y las anteriores a `2026-11-21.3` rechazan su torre de visión Q8_0; sin `--spec none` las builds previas fallan por el *drafter*.
- No es compatible con llama.cpp, vLLM, TGI ni Ollama, lo que limita las opciones de despliegue y el ecosistema de herramientas.
- La ventana de atención de 1.024 posiciones en la mayoría de capas puede limitar tareas de contexto largo pese a la arquitectura con bucles.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados no documentados; no se debe asumir un rendimiento multilingüe homogéneo.
- Licencia Apache 2.0 del modelo base, pero conviene verificar las condiciones del motor NInfer y de los artefactos de terceros (Unsloth, ggml-org) para uso comercial.
- El repositorio ocupa 49,9 GB e incluye revisiones anteriores del fichero; hay que fijar la revisión correcta para evitar descargar variantes con *drafter* o torre de visión distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all (rama master): https://github.com/iamwavecut/ninfer-all
- Releases de NInfer-all: https://github.com/iamwavecut/ninfer-all/releases/latest
