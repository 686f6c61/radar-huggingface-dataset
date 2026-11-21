# WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3

## Resumen

Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3 es un artefacto de inferencia en formato propietario `.ninfer` (v3) generado por WaveCut a partir del modelo base thinkingmachines/Inkling-2-Mini, un transformer con bucles (looped transformer) de arquitectura mixta de expertos (MoE) con 26.400 millones de parametros totales y 3.400 millones activos por token. El artefacto empaqueta el modelo de texto, la torre de vision (ViT en Q8_0) y el drafter especulativo DSpark en un unico fichero de 12,8 GiB, sin recuantizar las matrices: conserva los bloques ggml del GGUF original byte a byte.

El modelo resuelve el problema de desplegar un MoE multimodal con razonamiento, tool calling y decodificacion especulativa en GPUs de consumo (16 GB) mediante una planificacion de memoria que coloca los expertos en la GPU, en memoria host fijada o los lee directamente del fichero. Es relevante porque combina una arquitectura poco habitual (capas reutilizadas en bucle, atencion sin rotacion con tabla de distancias aprendida) con un formato de inferencia optimizado para NInfer-all, el motor del mismo autor.

El artefacto esta pensado exclusivamente para el motor NInfer (rama `master` de iamwavecut/ninfer-all), commit `7fcbbb13` o posterior; las builds estandar de NInfer rechazan el fichero porque la familia Inkling 2 solo existe en esa linea y la torre de vision Q8_0 requiere ese commit como minimo. No es un modelo entrenado desde cero: es una conversión de un GGUF de terceros (IsValorum) mas un drafter de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE con atencion sin rotacion (24 cabezas Q sobre 8 KV de 128), tabla de distancias aprendida de 1.024 posiciones, sinks y torre de vision ViT |
| Parametros totales | 26,4 mil millones |
| Parametros activos | 3,4 mil millones por token (128 expertos enrutados, 8 por token) |
| Longitud de contexto | 1.024 posiciones para la mayoria de capas; capas 5, 11, 17 y 23 atienden todas las posiciones; contexto de inferencia probado a 8K tokens en el plan de memoria |
| Tipos de cuantizacion | Mezcla por tensor: Q4_K, Q6_K, Q8_0, IQ3_XXS, IQ3_S, IQ4_NL, Q5_0, FP32, BF16 (sin recuantizar respecto al GGUF origen) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (fichero unico de 13.740.465.920 bytes; SHA-256 `42dd3b87…`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas almacenadas que se ejecutan como 48 visitas. El preludio (capas 0-5) se ejecuta una vez, el nucleo (capas 6-17) se reutiliza tres veces con los mismos pesos y la coda (capas 18-23) cierra la pasada; cada visita mantiene sus propias claves, valores e historiales de convolucion. La atencion usa 24 cabezas de consulta sobre 8 cabezas KV de dimension 128, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y mecanismo de sinks. Las capas 5, 11, 17 y 23 atienden todas las posiciones; el resto, solo 1.024.

La capa MoE tiene 128 expertos enrutados con 8 activos por token, puntuaciones sigmoid mas sesgo de seleccion, activacion SiTU sobre `[gate; up]` de anchura 1.152 y sin experto compartido. La tabla de tokens y la cabeza de salida estan desligadas (201.024 filas, 200.058 puntuadas, soft cap 30). El artefacto incluye la torre de vision (ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2, proyector de dos capas, hasta 4.096 posiciones por imagen) en Q8_0, y el drafter DSpark (tres bloques no causales sobre los estados del modelo objetivo y una cabeza de Markov recurrente de rango 256) tambien en Q8_0.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF o DPO. La conversion al formato `.ninfer` tardo 112 segundos en un contenedor con GPU A40 alquilada. El fichero contiene 1.173 objetos: 817 FP32, 179 Q8_0, 117 Q4_K, 12 IQ3_S, 12 IQ3_XXS, 12 Q5_0, 12 IQ4_NL, 5 Q6_K y 2 BF16.

## Capacidades

- Generacion de texto y razonamiento con bloques de razonamiento propios del modelo.
- Procesamiento de imagenes mediante la torre de vision ViT incluida (pipeline image-text-to-text).
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada (structured output) y decisiones tipadas.
- Reranking.
- Decodificacion especulativa con el drafter DSpark (activa por defecto con una sola peticion) o por busqueda en contexto.
- Multiples peticiones concurrentes (de una a ocho) con reutilizacion de prefijo de prompt.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- **Atencion al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con imagenes adjuntas (capturas, fotos de producto) gracias a la torre de vision ViT y a la reutilizacion de prefijo de prompt para abaratar turnos repetidos.
- **Agentes con tool calling en produccion**: los bloques JSON de llamada se convierten directamente en tool calls estilo OpenAI, lo que permite integrarlo en orquestadores de agentes existentes sin capa de traduccion.
- **Extraccion de datos estructurados de documentos con imagenes**: combinando salida estructurada y vision, puede convertir facturas o formularios escaneados en JSON tipado con argumentos validados.
- **Reranking en pipelines RAG**: la capacidad de reranking integrada permite reordenar candidatos recuperados antes de la generacion final, en el mismo servidor que expone los protocolos OpenAI y Anthropic.
- **Asistente de codigo y razonamiento paso a paso**: el modo de razonamiento en bloques propios y la decodificacion especulativa con DSpark reducen la latencia en tareas de razonamiento largo.
- **Despliegue en estaciones de trabajo con GPU de 16 GB**: el plan de memoria del motor coloca todos los expertos en una tarjeta de 16 GB junto a un contexto de 8K tokens (aunque ningun modelo de 16 GB lo ha ejecutado aun segun el autor), lo que habilita prototipos locales de un MoE de 26,4B.
- **Servicio multi-cliente con protocolos OpenAI y Anthropic**: el servidor NInfer expone ambos protocolos en el puerto 8080, lo que facilita sustituir backends en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 12,8 GiB; el plan de memoria del motor situa todos los expertos en una GPU de 16 GB junto a un contexto de 8K tokens. No se han publicado mediciones reales en esa configuracion.
- GPU recomendadas: NVIDIA desde Volta hasta Blackwell. El autor menciona una A40 alquilada para la conversion; el contenedor Docker esta disponible en `cuda13.4` y `cuda12.9` (esta ultima para Tesla V100).
- Cabe en GPU de consumo: si, segun el plan de memoria, en tarjetas de 16 GB; no verificado empiricamente por el autor.
- Opciones de despliegue: NInfer-all (builds de release o imagen Docker desde el commit `7fcbbb13` o posterior). No compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario del motor.
- Latencia y throughput: no disponibles. Se sabe que soporta de una a ocho peticiones concurrentes con reutilizacion de prefijo y decodificacion especulativa con DSpark.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3 | 26,4B / 3,4B | 1.024 (capas completas en 5, 11, 17, 23); 8K probado en plan de memoria | `.ninfer` v3 | Apache 2.0 | Solo motor NInfer-all; incluye vision y drafter |
| Inkling-2-Mini-UD-IQ4_XS-NInfer-v3 | 26,4B / 3,4B | no disponible | `.ninfer` v3 | Apache 2.0 | Variante del mismo autor, 2,6 GiB mayor; expertos enrutados mayoritariamente NVFP4 |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B / 3,4B | no disponible | safetensors (presumible) | no disponible | Modelo base sin cuantizar |
| IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF | 26,4B / 3,4B | no disponible | GGUF | no disponible | Origen de la conversion; sin drafter |

## Limitaciones y advertencias

- **Compatibilidad restringida**: el fichero solo lo carga NInfer-all en su rama `master` desde el commit `7fcbbb13`; las builds estandar de NInfer lo rechazan. No funciona con llama.cpp, vLLM, Ollama ni TGI.
- **Sin validacion empirica en 16 GB**: el autor indica que ninguna tarjeta de 16 GB ha ejecutado el modelo; el ajuste en VRAM es una estimacion del planificador de memoria.
- **Contexto efectivo limitado**: la mayoria de capas atienden solo 1.024 posiciones; solo cuatro capas ven todas las posiciones, lo que puede degradar el rendimiento en contextos largos.
- **Idiomas no documentados**: no hay informacion sobre cobertura linguistica; no se debe asumir buen rendimiento en castellano sin evaluacion.
- **Sin benchmarks publicados**: no hay datos de MMLU, HumanEval, GSM8K ni similares en la informacion disponible; el rendimiento real es desconocido.
- **Riesgo de alucinacion**: inherente a los modelos generativos; no hay evaluacion especifica publicada para este artefacto.
- **Sesgos**: no documentados en la informacion proporcionada.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini y de los artefactos intermedios (IsValorum, Unsloth) antes de desplegar en produccion.
- **Artefacto de conversion, no modelo original**: cualquier problema de calidad proviene del modelo base y del GGUF de origen; el autor solo garantiza la integridad byte a byte de los bloques ggml.

## Enlaces

- Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de origen: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Variante UD-IQ4_XS: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all (rama master): https://github.com/iamwavecut/ninfer-all
- Releases de NInfer-all: https://github.com/iamwavecut/ninfer-all/releases/latest
