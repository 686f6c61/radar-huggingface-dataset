# sunandbean/qwen3.6-35b-a3b-p100a

## Resumen

qwen3.6-35b-a3b-p100a es un port de inferencia del modelo Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts (MoE) desarrollado por Qwen (Alibaba), empaquetado por el usuario sunandbean para ejecutarse íntegramente en una única tarjeta Tenstorrent Blackhole p100a. El repositorio no contiene pesos nuevos en sentido estricto: distribuye el runtime, los kernels ttnn/tt-metal y las capas de mejora en BFP8 (6,0 GB) que acompañan al checkpoint GPTQ nativo de Tenstorrent publicado por Lottolabs. El objetivo es servir el modelo completo —los 256 expertos de las 40 capas, el enrutamiento, las capas gated delta net y gated attention, el LM head y la capa MTP de draft— desde la memoria de la tarjeta, con el host limitado a tokenización, lookup de embeddings y servidor HTTP.

La relevancia del artefacto es doble. Por un lado, demuestra que un MoE de 35B parámetros totales puede servirse en hardware no-GPU (aceleradores Tenstorrent) con velocidades de decodificación de 82-106 tok/s para un usuario. Por otro, expone una API compatible con OpenAI y Anthropic, lo que permite conectarlo directamente a herramientas de agentes como Claude Code sin adaptadores intermedios.

El contexto máximo alcanza los 262.144 tokens en el perfil `long-262k`, aunque a costa de desactivar las capas BFP8. La licencia es Apache-2.0, heredada del modelo base Qwen3.6-35B-A3B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas gated delta net y gated attention |
| Parámetros totales | 35B (según nombre del modelo) |
| Parámetros activos | A3B (aproximadamente 3B activos, según nombre del modelo) |
| Longitud de contexto | 32.768 (default), 131.072 (`long-128k`), 262.144 (`long-262k`) |
| Tipos de cuantización | BFP4/BFP8 mixto (GPTQ de Lottolabs), BFP8 upgrade layers |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint TT-native (Lottolabs), BFP8 layers en safetensors; no GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 40 capas, 256 expertos por capa y enrutamiento top-8, según se detalla en la model card del port. Incorpora capas de atención con mecanismo gated delta net y gated attention, además de una capa MTP (Multi-Token Prediction) que se emplea como draft para decodificación especulativa. El port implementa en la tarjeta el enrutamiento top-8, un kernel MoE fusionado, los kernels de gated delta net y KV-writer, y la decodificación especulativa MTP con conteo adaptativo de drafts.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El proceso de cuantización sí está documentado: Lottolabs genera un checkpoint GPTQ nativo de Tenstorrent en BFP4/BFP8 mixto, y este repositorio añade 6,0 GB de capas de mejora en BFP8 que reducen la divergencia KL respecto al original en BF16 a una cuarta parte. Los pesos se verifican contra `tt_qwen36/bfp8_sha256.txt`.

## Capacidades

- Generación de texto con modo de razonamiento (thinking) activable o desactivable por petición.
- Soporte de tool calling y `tool_choice` en la API OpenAI, y bloques de herramientas en la API Anthropic.
- Streaming de respuestas y bloques de razonamiento (`reasoning_content`, thinking blocks).
- Decodificación especulativa MTP con draft adaptativo (hasta 3 drafts).
- Decodificación por lotes real para varios usuarios (hasta 4 en perfil default).
- Caché de prefijo (`prefix cache`) y pases de prompt de 28 filas.
- Contexto largo de hasta 262.144 tokens en perfil dedicado.
- Compatibilidad con agentes tipo Claude Code mediante `ANTHROPIC_BASE_URL`.
- Endpoint `/v1/messages/count_tokens` para conteo de tokens.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible.

## Casos de uso

- **Servicio de inferencia en hardware Tenstorrent**: despliegue del modelo completo en una única Blackhole p100a mediante `tt-model serve`, útil para entornos que no disponen de GPUs NVIDIA y quieren evitar dependencias de CUDA.
- **Agentes autónomos con Claude Code**: configuración de `ANTHROPIC_BASE_URL` apuntando al servidor local permite usar Claude Code contra el modelo, con la opción `--thinking off` para acelerar los turnos de agente.
- **Atención al cliente multi-turno**: el perfil default admite 4 usuarios simultáneos con decodificación por lotes y caché de prefijo, adecuado para conversaciones concurrentes con contexto de 32k tokens.
- **Análisis de documentos largos**: el perfil `long-262k` permite procesar hasta 262.144 tokens en una sola petición, útil para resúmenes de contratos, informes o bases de código extensas.
- **Generación de código en pipelines**: el rendimiento medido en tareas de código (105,9 tok/s de decodificación y aceptación MTP de 0,73) lo hace apto para autocompletado y generación en entornos de desarrollo.
- **Prototipado de APIs compatibles OpenAI/Anthropic**: al exponer `/v1/chat/completions`, `/v1/responses` y `/v1/messages`, sirve como backend de pruebas para aplicaciones escritas contra esos estándares sin cambiar el código cliente.
- **Investigación en cuantización y decodificación especulativa**: el repositorio documenta la sustitución de capas BFP8 y la aceptación de drafts MTP, lo que facilita experimentos reproducibles sobre precisión y velocidad.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones de rendimiento, no de calidad, salvo el resultado de GSM8K.

| Métrica | Valor |
|---|---|
| GSM8K-50 | 49/50 |
| Decodificación, un usuario, chat | 81,9 tok/s |
| Decodificación, un usuario, código | 105,9 tok/s |
| Decodificación, un usuario, documento | 88,7 tok/s |
| Aceptación de draft MTP (chat / código / doc) | 0,51 / 0,73 / 0,57 |
| Lectura de prompt (40-60 tokens) | 500-590 tok/s |
| Total tok/s con 1 usuario | 106,7 |
| Total tok/s con 2 usuarios | 95,2 |
| Total tok/s con 3 usuarios | 91,2 |
| Total tok/s con 4 usuarios | 112,4 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks de calidad en la información disponible.

## Requisitos de hardware

- **Acelerador**: una Tenstorrent Blackhole p100a (mesh 1×1). No es compatible con GPU convencionales.
- **Memoria**: todos los pesos residen en la tarjeta; el host solo gestiona tokenización y servidor HTTP.
- **Descarga inicial**: aproximadamente 21 GB del checkpoint de Lottolabs más 6,0 GB de capas BFP8 de este repositorio.
- **Arranque**: la primera ejecución compila kernels; los arranques posteriores tardan unos 35 s.
- **Despliegue**: contenedor `tt-model` (`tt-model pull`, `tt-model serve`) o ejecución Python con entorno tt-metal/ttnn en el commit `58648d4` y `python -m tt_qwen36.server`.
- **Puerto**: 20000 por defecto (o el siguiente libre).
- **Latencia/throughput**: 82-106 tok/s de decodificación para un usuario; 112,4 tok/s totales con cuatro usuarios.
- **Perfiles**: `default` (32k, 4 usuarios, BFP8 on), `long-128k` (131k, 1 usuario, BFP8 on), `long-262k` (262k, 1 usuario, BFP8 off).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware | Rendimiento |
|---|---|---|---|---|---|
| qwen3.6-35b-a3b-p100a | 35B totales / ~3B activos | hasta 262.144 | Apache-2.0 | Blackhole p100a | 82-106 tok/s (1 usuario) |
| Qwen3.6-35B-A3B (original) | 35B totales / ~3B activos | no disponible | Apache-2.0 | GPU convencional | no disponible |
| Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150 | 35B totales / ~3B activos | no disponible | Apache-2.0 | Tenstorrent P150 | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Hardware específico**: solo funciona en Tenstorrent Blackhole p100a; no es desplegable en GPU NVIDIA, AMD ni CPU.
- **Contexto y precisión**: el perfil `long-262k` desactiva las capas BFP8, lo que reduce la fidelidad respecto al original en BF16.
- **Idiomas**: no se documenta qué idiomas soporta; no disponible.
- **Sesgos y alucinación**: no se documentan sesgos conocidos ni tasas de alucinación en la información proporcionada.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B y del checkpoint de Lottolabs.
- **Dependencia de versiones**: requiere tt-metal/ttnn en el commit `58648d4`; ttnn no está en PyPI, lo que complica la reproducibilidad.
- **Modo thinking**: los agentes solicitan thinking en cada turno; sin `--thinking off` los turnos son considerablemente más lentos.
- **Caché de prefijo y batching**: desactivados en el perfil `long-262k` (`--batch 0 --prefix-slots 0`).
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; port de terceros, no oficial de Qwen ni de Tenstorrent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sunandbean/qwen3.6-35b-a3b-p100a
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint de Lottolabs: https://huggingface.co/Lottolabs/Qwen3.6-35B-A3B-TT-Mixed-BFP4-BFP8-P150
- Repositorio del port: https://github.com/SunandBean/tt-qwen3.6-35b-a3b-p100a
- Recetas ttnn de referencia: https://github.com/sjettTT/tt-qwen-3.8-flash-next
- tt-metal: https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
