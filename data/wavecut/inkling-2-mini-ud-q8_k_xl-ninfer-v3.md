# WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) con arquitectura de transformer con bucles (looped transformer) desarrollado por Thinking Machines. Cuenta con 26.400 millones de parametros totales y 3.400 millones activos por token, y combina capacidades de texto, razonamiento, tool calling y vision en un unico modelo. Su particularidad arquitectonica es que 24 capas almacenadas se ejecutan como 48 visitas: un preludio de 6 capas, un nucleo de 12 capas que se reutiliza tres veces con los mismos pesos y una coda de 6 capas.

El artefacto que nos ocupa, publicado por WaveCut, es una conversion al formato `.ninfer` para el motor de inferencia NInfer (rama `master` de `iamwavecut/ninfer-all`). Parte del GGUF UD-Q8_K_XL de Unsloth, que mantiene BF16 en casi toda la red salvo los expertos enrutados de las capas 0-19, cuantizados en NVFP4. La conversion no recuantiza las matrices: conserva los bloques ggml o las palabras BF16 byte a byte y el motor los multiplica in situ. Solo el drafter DFlash2 de incoai se cuantiza a Q8_G32.

El resultado es un unico fichero de 24.421.141.504 bytes (22,74 GiB) que empaqueta el modelo completo, la torre de vision, dos drafters de decodificacion especulativa (DSpark y DFlash2), el tokenizador y la plantilla de chat. Es relevante porque permite ejecutar en un solo artefacto un modelo multimodal con razonamiento, tool calling estructurado y decodificacion especulativa, aunque queda atado a una linea de releases muy concreta del motor NInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE con atencion sin rotacion y torre de vision ViT |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones por token (8 de 128 expertos enrutados) |
| Longitud de contexto | No disponible de forma explicita; la atencion usa ventana de 1.024 posiciones en la mayoria de capas y global en las capas 5, 11, 17 y 23; la torre de vision admite hasta 4.096 posiciones por imagen |
| Tipos de cuantizacion | UD-Q8_K_XL (BF16 general, NVFP4 en expertos de capas 0-19), Q8_0 en torre de vision y DSpark, Q8_G32 en proyecciones de DFlash2, FP32 en routers y normas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor propio del motor NInfer); GGUF de origen disponible en Unsloth |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: 24 capas almacenadas se ejecutan como 48 visitas. El preludio (capas 0-5) se ejecuta una vez, el nucleo (capas 6-17) se reutiliza tres veces con los mismos pesos y la coda (capas 18-23) cierra el calculo. Cada visita mantiene sus propias claves, valores e historiales de convolucion. La atencion usa 24 cabezas de consulta sobre 8 cabezas KV de dimension 128, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y sinks de atencion; las capas 5, 11, 17 y 23 atienden sobre todas las posiciones y el resto sobre una ventana de 1.024.

La capa MoE tiene 128 expertos enrutados, selecciona 8 por token con puntuaciones sigmoideas mas un sesgo de seleccion, aplica SiTU sobre la concatenacion [gate; up] de anchura 1.152 y no usa experto compartido. La cabeza de salida esta desligada de la tabla de tokens (201.024 filas, 200.058 puntuadas, soft cap de 30). La torre de vision es un ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2 y proyector de dos capas. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con bloques de razonamiento propios separados de la respuesta.
- Tool calling y function calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada y decisiones tipadas, ademas de reranking.
- Vision: procesamiento de imagenes mediante la torre ViT incluida en el artefacto (pipeline image-text-to-text).
- Decodificacion especulativa con dos drafters: DSpark (por defecto con una peticion en curso) y DFlash2 (`--spec dflash2`), o por busqueda en contexto.
- Concurrencia de una a ocho peticiones con reutilizacion de prefijo de prompt.
- Gestion de expertos enrutados en GPU, en memoria de host fijada o leidos directamente del fichero.
- Capacidades multilingues: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con tool calling para consultar sistemas internos (pedidos, estado de cuenta) y devolver respuestas estructuradas, con reutilizacion de prefijo para abaratar el coste de prompts largos repetidos.
- Asistentes de codigo en produccion: la salida estructurada y los argumentos estrictos de herramientas permiten integrarlo en pipelines de CI/CD para generar parches, invocar linters o consultar repositorios mediante function calling.
- Analisis de documentos con imagenes: al combinar torre de vision y razonamiento de texto, sirve para extraer datos de capturas, facturas o diagramas y devolver JSON validado.
- Agentes autonomos de varios pasos: el modo de razonamiento en bloques separados y las decisiones tipadas facilitan orquestar tareas con planificacion intermedia auditable.
- Reranking y clasificacion en buscadores internos: la capacidad de reranking y de decisiones tipadas permite puntuar candidatos y filtrar resultados antes de mostrarlos.
- Despliegue en servidor con GPU unica: el fichero de 22,74 GiB y los expertos leibles desde disco o memoria de host permiten servir el modelo en una sola GPU de 24 GB o en configuraciones con offload parcial, manteniendo la decodificacion especulativa para reducir latencia.
- Procesamiento por lotes de imagenes y texto: con hasta ocho peticiones concurrentes y reutilizacion de prefijo, es adecuado para tareas de extraccion masiva donde muchas peticiones comparten un mismo prompt de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 22,74 GiB; con overhead de contexto y buffers de atencion, se recomienda un minimo de 24 GB de VRAM para carga completa en GPU, o menos si se descargan expertos a memoria de host o se leen del fichero.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para carga ajustada; RTX 3090 (24 GB) como opcion consumer.
- Cabe en GPU consumer: si, en RTX 4090 o RTX 3090 con 24 GB, con margen limitado y posible necesidad de offload de expertos.
- Opciones de despliegue: exclusivamente el motor NInfer (rama `master` de `iamwavecut/ninfer-all`), release `2026-11-21.4` o posterior para el modelo base y `2026-11-24.7` o posterior para el drafter DFlash2. Las builds estandar de NInfer rechazan este fichero; llama.cpp, vLLM, TGI u Ollama no lo soportan en este formato (para esos motores habria que usar el GGUF de Unsloth).
- Latencia y throughput: no disponibles; la decodificacion especulativa con DSpark o DFlash2 reduce el numero de pasos del modelo objetivo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini (este artefacto NInfer) | 26,4B / 3,4B | No disponible (ventana de 1.024 en la mayoria de capas) | Apache 2.0 | `.ninfer`, solo motor NInfer |
| Inkling 2 Mini (GGUF de Unsloth) | 26,4B / 3,4B | No disponible | Apache 2.0 | GGUF, compatible con llama.cpp y derivados |
| Inkling 2 Mini (pesos originales de Thinking Machines) | 26,4B / 3,4B | No disponible | Apache 2.0 | safetensors, ecosistema transformers |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor: el fichero solo funciona con NInfer en releases muy concretas (`2026-11-21.4` o posterior para el modelo, `2026-11-24.7` o posterior para DFlash2); las builds estandar de NInfer lo rechazan.
- Fragmentacion de revisiones: el fichero con el drafter en el layout anterior (23.685.230.592 bytes) queda en la revision `b62d6caf`, y la variante sin drafter (23.785.597.440 bytes) en `c1a1be59`; usar la revision equivocada produce un artefacto distinto al documentado.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; como modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tool calling con argumentos complejos.
- Idiomas: no se especifican los idiomas soportados, por lo que no hay garantias de calidad fuera del ingles.
- Contexto: no se declara una longitud de contexto maxima; la ventana de atencion de 1.024 posiciones en la mayoria de capas limita la informacion local, aunque las capas globales compensan parcialmente.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los artefactos derivados (GGUF de Unsloth, DFlash2 de incoai, mmproj de ggml-org) citados en la conversion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Integridad: el fichero incluye SHA-256 (`86959198…`) y `SHA256SUMS`; conviene verificarlos antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama NInfer-all: https://github.com/iamwavecut/ninfer-all
- Artefactos hermanos: [UD-IQ1_M](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3), [UD-Q2_K_XL](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3), [UD-Q3_K_XL](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3), [UD-IQ4_XS](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3), [APEX-I MiniPlus V2.1](https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3)
