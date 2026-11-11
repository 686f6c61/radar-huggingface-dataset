# voxor-ai/gemma-4-e2b-it-coreml

## Resumen

Gemma 4 E2B instruct en formato Core ML es una conversión del modelo `google/gemma-4-E2B-it` de Google, publicada por el usuario `voxor-ai`, empaquetada como modelos Core ML compilados para su ejecución sobre el Neural Engine de Apple (iOS 18 / macOS 15 o superior). No se trata de un modelo nuevo entrenado desde cero, sino de una distribución de inferencia optimizada del modelo base de Google, con pesos cuantizados a int8 y cómputo en fp16.

El paquete incluye cuatro segmentos (`chunk1` a `chunk4.mlmodelc`) que deben ejecutarse en orden, junto con tablas de embeddings int8, tablas RoPE y el tokenizador. El contexto declarado es de 4096 tokens con ventana deslizante de 512, y la dimensión oculta es 1536, con entradas por capa de 8960.

Su relevancia radica en que permite desplegar un modelo de la familia Gemma 4 en dispositivos Apple sin depender de frameworks de servidor, aprovechando el Neural Engine. La información pública disponible es escasa: no se detallan parámetros totales, idiomas soportados ni resultados de benchmarks más allá de una comparación de fidelidad de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), convertido a Core ML; no se detalla la variante interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (ventana deslizante de 512) |
| Tipos de cuantizacion | Pesos int8, computo fp16; embeddings int8 con escalas fp16 |
| Idiomas soportados | no disponible (la validacion de accuracy uso prompts en ingles y aleman) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), archivos >1 MB comprimidos con zstd (`.zst`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, un modelo instruct de la familia Gemma 4 de Google. La model card de esta distribución no describe la arquitectura interna del modelo original (tipo de atención, número de capas, mecanismo de mezcla de expertos, etc.), por lo que esos detalles no están disponibles en la información proporcionada.

La conversión a Core ML mantiene una dimensión oculta de 1536 y entradas por capa de 8960, con tablas de embeddings de `[262144, 1536]` y `[262144, 8960]` cuantizadas a int8 por fila con escalas fp16. El paquete se divide en cuatro chunks: `chunk1` y `chunk2` exponen las funciones `decode_q1` (generación de 1 token) y `verify_qK` (verificación de 256 tokens), y `chunk4` termina en el id del token argmax. El contexto se gestiona con ventana deslizante de 512 sobre un máximo de 4096 tokens. No se detalla en la información disponible si hubo RLHF, DPO u otras etapas de alineación en el modelo base.

## Capacidades

- Generación de texto instructiva, heredada del modelo base `google/gemma-4-E2B-it`.
- Ejecución sobre el Neural Engine de Apple mediante Core ML.
- Decodificación token a token (`decode_q1`) y verificación por bloques de 256 tokens (`verify_qK`), lo que sugiere un esquema de decodificación especulativa o verificación por lotes.
- Contexto de hasta 4096 tokens con ventana deslizante de 512.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Inferencia local en apps iOS y macOS: el paquete Core ML permite ejecutar el modelo en el Neural Engine de dispositivos Apple con iOS 18 o macOS 15, sin servidor externo.
- Asistentes de texto embebidos en aplicaciones: con 4096 tokens de contexto y ventana deslizante de 512, es adecuado para conversaciones y tareas de redacción de longitud moderada en local.
- Procesamiento por lotes en el dispositivo: la función `verify_qK` de 256 tokens permite verificar secuencias completas, útil para pipelines de generación con verificación.
- Prototipado de funciones de autocompletado o resumen en apps nativas, aprovechando la cuantización int8 para reducir el espacio en disco y memoria.
- Evaluación comparativa de cuantización: la model card reporta un 98,3 % de coincidencia codiciosa con una cuantización Q4_0 del mismo modelo, lo que facilita estudios de fidelidad de cuantización en dispositivos Apple.
- Distribución offline de un modelo instruct en entornos sin conectividad, al estar empaquetado como artefactos Core ML autocontenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la fidelidad de cuantización:

| Metrica | Valor |
|---|---|
| Coincidencia codiciosa con Q4_0 del mismo modelo | 98,3 % (2568 / 2612 tokens) |
| Prompts de validación | 11 (27 a 1500 palabras, inglés y alemán) |

## Requisitos de hardware

- Repositorio de 4,4 GB; los archivos superiores a 1 MB están comprimidos con zstd y deben descomprimirse antes de su uso.
- Ejecución sobre Neural Engine de Apple; requiere iOS 18 o macOS 15 o superior.
- No se especifican requisitos de VRAM ni de memoria unificada en la información disponible.
- No se indican GPU compatibles, latencia ni throughput estimados.
- Opciones de despliegue: Core ML (formato nativo del paquete). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento de alternativas comparables, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluación de alucinación.
- Los idiomas soportados no están declarados; la validación de accuracy se limitó a inglés y alemán.
- El contexto máximo es de 4096 tokens con ventana deslizante de 512, lo que limita tareas que requieran contexto largo.
- La licencia es Apache 2.0, pero se recomienda revisar `LICENSE` y `NOTICE` del repositorio para confirmar las condiciones de uso comercial y atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks estándar, por lo que su robustez en producción no está validada públicamente.
- Requiere descomprimir los archivos `.zst` antes de usar los `.mlmodelc`; un uso incorrecto del orden de los chunks (`chunk1` a `chunk4`) puede producir resultados inválidos.

## Enlaces

- [Hugging Face: voxor-ai/gemma-4-e2b-it-coreml](https://huggingface.co/voxor-ai/gemma-4-e2b-it-coreml)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
