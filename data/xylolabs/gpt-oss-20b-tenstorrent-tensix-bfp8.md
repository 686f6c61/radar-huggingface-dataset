# Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP8

## Resumen
Este repositorio contiene una exportación cuantizada del modelo `openai/gpt-oss-20b` (20.914.757.184 parámetros) en formato BFP8 (block-floating-point de 8 bits), preparada por Xylolabs para su ejecución en NPUs Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El objetivo no es un modelo nuevo, sino un artefacto de pesos redondeados a la rejilla `bfloat8_b` de TT-NN (8,5 bits por peso en las proyecciones cuantizadas, 8,71 bits de media), de modo que el runtime de Tenstorrent pueda empaquetar los tensores sin alterar sus valores.

La motivación es práctica: el `gpt-oss-20b` original se distribuye en MXFP4 (4,63 bits por peso), un formato que las NPUs Tensix no consumen de forma nativa. Esta exportación ofrece un compromiso intermedio: 22,77 GB de pesos empaquetados frente a 41,83 GB en BF16 y 12,11 GB en MXFP4, con una divergencia medida respecto al BF16 de 0,0488 KL media y un 85,03 % de top-1 sobre 8.188 posiciones de texto inglés y coreano. Es, por tanto, un artefacto orientado a despliegue en hardware Tenstorrent, no a inferencia general en GPU.

El modelo base es un transformer MoE de OpenAI con licencia Apache 2.0, y esta exportación conserva esa licencia. Cabe subrayar que las comprobaciones publicadas cubren únicamente el empaquetado de tensores: la ruta completa de inferencia BFP8 con estos pesos no ha sido validada en dispositivo, y ni `tt-transformers` ni `tt-forge` se han ejecutado con este perfil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt_oss), capas de atención con proyecciones q/k/v/o y expertos enrutados en 24 capas |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits por peso) en proyecciones de atención, expertos enrutados y LM head; bf16 en router, embeddings, normas y resto de tensores; media de 8,71 bits por peso |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers), con `quant4.json` describiendo el formato por proyección |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del `openai/gpt-oss-20b`: un transformer con mezcla de expertos (MoE) en el que las 24 capas incluyen proyecciones de atención (q, k, v, o) y expertos enrutados con matrices gate, up y down. Esta exportación no reentrena ni recalibra el modelo; aplica redondeo al más cercano sobre la rejilla `bfloat8_b`, exactamente como lo hace el empaquetador de TT-NN, sin calibración. Los expertos conservan el almacenamiento `[experts, input, output]` del modelo base, con gate y up ocupando columnas de salida alternas y redondeados por separado antes de intercalarse.

El `config.json` elimina la configuración de cuantización MXFP4 original porque los pesos guardados son valores ya decodificados sobre la rejilla bf16. El autor incluye dos scripts de verificación: `pack_tensix.py`, que empaqueta cada matriz y comprueba que ningún valor cambia (con opción `--device` para round-trip por DRAM del dispositivo), y `verify_grid.py`, que valida la rejilla solo con torch. Las comprobaciones se hicieron con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent. No se documentan número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO, ya que corresponden al modelo base y no se detallan aquí.

## Capacidades
- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card incluye una plantilla de chat (`apply_chat_template`).
- Razonamiento: la evaluación menciona siete prompts de razonamiento ejecutados de nuevo con "thinking on", lo que sugiere soporte de modo de razonamiento heredado del modelo base.
- Razonamiento matemático y de sentido común a pequeña escala: los 33 prompts cortos con comprobación automática cubren respuestas verificables; se responden 40 de 40 tanto en BF16 como en esta exportación.
- Capacidades multilingües: la evaluación de divergencia usa texto en inglés y coreano (WikiText-2 y Wikipedia en coreano), aunque no se declara una lista oficial de idiomas.
- Ejecución en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los tensores BFP8.
- Compatibilidad con `transformers` para carga en bf16 con `device_map="auto"` (orientada a inspección y referencia en host, no a rendimiento).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso
- Despliegue en NPUs Tenstorrent Wormhole y Blackhole: el artefacto está diseñado para que TT-NN empaquete las matrices BFP8 sin modificar sus valores, permitiendo servir el `gpt-oss-20b` en hardware Tensix con 22,77 GB de huella de pesos, dentro de presupuestos de memoria revisados por el autor.
- Validación de pipelines de cuantización: `pack_tensix.py` y `verify_grid.py` permiten comprobar, matriz a matriz, que el redondeo BFP8 preserva los valores tras el empaquetado, lo que resulta útil en CI de toolchains de cuantización.
- Referencia de fidelidad numérica: sirve como patrón para medir la degradación de un modelo MoE al pasar de BF16 a BFP8 (0,0488 KL media, 85,03 % top-1) frente a MXFP4 (0,0678 KL, 82,65 % top-1) en tareas de texto inglés y coreano.
- Investigación sobre formatos de bloque flotante: al documentar bits por peso (8,5 en proyecciones, 8,71 de media) y el tratamiento diferenciado de router (bf16) frente a expertos (BFP8), facilita estudios sobre el impacto de la precisión por componente en modelos MoE.
- Integración en runtimes TT-Metal / tt-forge: aunque no validado con este perfil, el repositorio está etiquetado para `tt-metal`, `ttnn` y `tt-forge`, por lo que es un candidato natural para probar rutas de inferencia en esos stacks.
- Evaluación comparativa de exportaciones: la tabla de evaluación publicada permite contrastar esta exportación con BF16 y con el GGUF MXFP4 de `ggml-org/gpt-oss-20b-GGUF` usando el mismo conjunto de 8.188 posiciones y 40 respuestas verificadas.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`openai/gpt-oss-20b`) | 16 | 41,83 | 0 | 100 | 40 de 40 | - |
| Este modelo (BFP8) | 8,71 | 22,773 | 0,0488 | 85,03 | 40 de 40 | 0 |
| MXFP4 (llama.cpp) | 4,63 | 12,110 | 0,0678 | 82,65 | 39 de 40 | 0 |

Las mediciones son de referencia en host sobre los pesos guardados; no se evaluó inferencia en dispositivo. KL y top-1 cubren 8.188 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), como texto plano. Las respuestas corresponden a 33 prompts cortos con comprobación automática más los 7 de razonamiento repetidos con thinking activado (40 en total). "Perdidas" indica respuestas correctas en BF16 pero erróneas o rotas aquí; los empates cercanos no se contabilizan. MXFP4 es el GGUF distribuido por `ggml-org` para este modelo (`ggml-org/gpt-oss-20b-GGUF` en `15dcfc7e`), leído con llama.cpp v0.9.0 (`cd959bae`).

## Requisitos de hardware
- Huella de pesos en dispositivo: aproximadamente 22,77 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole; las comprobaciones se hicieron en ttsim (simulador Blackhole) con ttnn 0.81.1.
- GPU consumer: no disponible como ruta validada; la carga con `transformers` en bf16 requiere memoria suficiente para el modelo decodificado (el repo ocupa 41,9 GB en safetensors, con pesos en rejilla bf16), lo que excede GPUs consumer habituales.
- Despliegue: TT-NN (empaquetado con `ttnn.as_tensor`, `ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`), `tt-transformers` y `tt-forge` (no ejecutados con este perfil), y `transformers` para inspección en host.
- Latencia y throughput: no disponible; no se han publicado mediciones en dispositivo.
- Nota de viabilidad: los runtimes deben mantener BFP8 para los expertos a fin de preservar sus valores; decodificar a bf16 altera el artefacto respecto a lo validado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 20,91 B | no disponible | safetensors, BFP8 8,71 bits/medio | Apache 2.0 | Empaquetado verificado; inferencia BFP8 en dispositivo no validada |
| `openai/gpt-oss-20b` (BF16) | 20,91 B | no disponible | safetensors, 16 bits | Apache 2.0 | Modelo de referencia completo |
| MXFP4 (`ggml-org/gpt-oss-20b-GGUF`) | 20,91 B | no disponible | GGUF, 4,63 bits/medio | Apache 2.0 | Ejecutado con llama.cpp v0.9.0 |

La comparación directa disponible se limita a precisión y huella: BF16 (41,83 GB, KL 0), este BFP8 (22,77 GB, KL 0,0488, top-1 85,03 %) y MXFP4 (12,11 GB, KL 0,0678, top-1 82,65 %). No hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada para ninguno de los tres.

## Limitaciones y advertencias
- Inferencia BFP8 completa no validada en dispositivo: las comprobaciones cubren solo el empaquetado de tensores; `tt-transformers` y `tt-forge` no se han ejecutado con este perfil.
- Perfil de expertos BFP8 no validado en hardware real; las pruebas se hicieron en ttsim, el simulador Blackhole.
- Divergencia numérica respecto a BF16: KL media de 0,0488 y top-1 del 85,03 % sobre 8.188 posiciones; no es equivalente bit a bit al modelo original.
- Dependencia de formato: los runtimes deben conservar BFP8 para los expertos; cualquier decodificación a bf16 invalida las garantías de preservación de valores.
- Sin calibración: el redondeo al más cercano sobre la rejilla `bfloat8_b` puede degradar matrices sensibles; el router se mantiene en bf16 precisamente por ello.
- Idiomas: no se declara lista oficial; la evidencia empírica se limita a inglés y coreano.
- Riesgo de alucinación y sesgos: no documentados en esta model card; se heredan del modelo base `openai/gpt-oss-20b` y no han sido evaluados aquí.
- Contexto máximo: no disponible en la información proporcionada.
- Uso comercial: permitido bajo Apache 2.0, con las obligaciones habituales de la licencia (aviso de copyright y licencia, cambios indicados); conviene revisar también los términos del modelo base.
- Adopción muy baja (29 descargas, 0 likes) y artefacto reciente (noviembre de 2026), lo que reduce la evidencia comunitaria disponible.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- GGUF MXFP4 de referencia: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Paper referenciado en tags: arxiv:2508.10925 (https://arxiv.org/abs/2508.10925)
- Licencia: https://huggingface.co/Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
