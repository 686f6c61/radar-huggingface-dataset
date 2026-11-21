# thepatch/stable-audio-open-small-GGUF

## Resumen

Stable Audio Open Small GGUF es una conversión al formato GGUF de Stable Audio Open Small (SAOS), un modelo de generación de audio de Stability AI, empaquetada por el usuario thepatch para el runtime nativo opcional `sa3.cpp`. El repositorio incluye el modelo DiT de SAOS entrenado por ARC, el codificador de texto compartido T5-base y el decodificador Oobleck, además de dos finetunes validados anidados bajo `finetunes/` (KickBass y Jerry Grunge). No es un modelo de lenguaje, sino un sistema de síntesis de audio condicionado por texto.

El interés de esta publicación es práctico: ofrece los tres componentes del pipeline en cuatro niveles de cuantización (F16, Q8_0, Q5_K_M y Q4_K_M) con bundles completos de entre 379 MiB y 1.010 MiB, lo que permite ejecutar generación de audio en hardware modesto mediante `sa3.cpp` con backend CUDA. El autor indica que los cuatro niveles fueron validados con renders emparejados de 11 segundos sobre ARC, KickBass y Jerry Grunge.

La relevancia actual radica en la bajada de requisitos de despliegue: un pipeline completo de texto a audio de 341 millones de parámetros en un bundle de menos de 400 MiB en Q4_K_M. La licencia es la Stability AI Community License, no una licencia de código abierto permisiva, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de SAOS + codificador de texto T5-base + decodificador Oobleck |
| Parametros totales | 341.126.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (condicionamiento de texto via T5-base) |
| Licencia | Stability AI Community License (stability-ai-community) |
| Formato de pesos | GGUF (conversion desde checkpoints originales) |

## Arquitectura y entrenamiento

El sistema sigue la arquitectura de Stable Audio Open Small: un Diffusion Transformer (DiT) que genera latentes de audio condicionado por embeddings de texto producidos por T5-base, y un decodificador Oobleck que reconstruye la forma de onda. El repositorio no entrena un modelo nuevo: renombra tensores, los serializa como GGUF y cuantiza tensores seleccionados, sin fusionar los finetunes ni alterar la arquitectura. Los pesos base provienen de `stabilityai/stable-audio-open-small` (revisión `dc620d91535857b72ebb59b4ca45978db6d417f5`).

Los finetunes incluidos son `S3Sound/kickbass` (checkpoint `kickbass_v1_saos_e257_s18870.ckpt`) y `thepatch/jerry_grunge` (checkpoint precodificado `jerry_encoded_bs128_epoch=106-step=320.ckpt`, paso 320 de un entrenamiento con batch size 128 y learning rate 1e-4). El autor no detalla el volumen de tokens ni la composición del dataset de entrenamiento original, ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada. La innovación destacable es la conversión GGUF con cuantización por niveles y la validación emparejada de cada tier.

## Capacidades

- Generación de audio condicionada por texto (text-to-audio) con duraciones configurables; los ejemplos del autor usan 11 segundos.
- Control de semilla (`--seed`) para reproducibilidad de renders.
- Selección de sampler y pasos: ping-pong con 8 pasos y CFG 1 para ARC; Euler con 50 pasos y CFG 4 para los finetunes rectified-flow; `dpmpp` con 40 pasos y CFG 4 como configuración alternativa validada.
- Estilos especializados mediante finetunes: KickBass (graves y bombos) y Jerry Grunge (estética grunge/chillhop, con banco de prompts `prompts.json`).
- Integración con `sat-server` para servir el finetune Jerry Grunge a clientes externos (gary4juce's dice).
- Aceleración por GPU CUDA y flash attention mediante variables de entorno (`SA3_DEVICE`, `SA3_FLASH_ATTN`).
- No dispone de tool calling, function calling, capacidades de agente ni visión; no es un modelo de lenguaje.

## Casos de uso

- Generación de samples musicales cortos: con prompts descriptivos y 11 segundos de duración se pueden producir riffs, loops o capas de acompañamiento para prototipado musical, usando el tier Q5_K_M como equilibrio entre calidad y tamaño.
- Producción de bombos y graves con KickBass: el finetune `S3Sound/kickbass` permite generar elementos rítmicos de baja frecuencia de forma repetible fijando semilla, útil en bancos de samples.
- Diseño sonoro para videojuegos y audiovisual: renders rápidos de efectos y ambientes a partir de texto, con el bundle Q4_K_M (379 MiB) para iterar en máquinas sin GPU dedicada.
- Integración en DAWs y herramientas de audio: el finetune Jerry Grunge se sirve vía `sat-server` a clientes como gary4juce's dice, lo que permite exponer generación de audio como servicio local.
- Investigación en modelos de difusión de audio: la disponibilidad de cuatro niveles de cuantización con validación emparejada permite estudiar el impacto de la cuantización en la fidelidad del audio generado.
- Despliegue en entornos con VRAM limitada: al publicarse en GGUF y con bundles por debajo de 1 GiB en F16, es viable ejecutar el pipeline completo en GPUs de consumo mediante `sa3.cpp` con CUDA.
- Ajuste fino y experimentación: los checkpoints de finetune incluidos sirven como referencia para entrenar variantes propias sobre SAOS y comparar contra los tiers publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta validación cualitativa mediante renders emparejados de 11 segundos en los cuatro tiers sobre ARC, KickBass y Jerry Grunge, sin métricas numéricas (FAD, CLAP score u otras).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los bundles completos ocupan 1.010 MiB (F16), 569 MiB (Q8_0), 416 MiB (Q5_K_M) y 379 MiB (Q4_K_M), por lo que el peso en memoria es reducido y el consumo adicional dependerá de las activaciones y del backend.
- GPU recomendadas: no disponibles en la documentación; el runtime soporta CUDA (`-DSA3_CUDA=ON`) y flash attention (`SA3_FLASH_ATTN=1`).
- GPU de consumo: el tamaño de los bundles sugiere que cabe en GPUs de consumo, pero no se especifican modelos concretos ni VRAM mínima verificada.
- Opciones de despliegue: `sa3.cpp` compilado con `-DSA3_BUILD_SAT=ON` (componente SAT opcional), target `sat-generate`, y `sat-server` para servir finetunes; descarga de modelos mediante `tools/download_models.py --sat --sat-model saos --saos-variant <variante>`.
- Latencia y throughput: no disponibles. El coste depende del sampler y los pasos: 8 pasos con ping-pong para ARC frente a 50 pasos con Euler para los finetunes, una diferencia de más de seis veces en número de evaluaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Stable Audio Open Small GGUF (este repo) | 341 M | no disponible | GGUF (F16/Q8_0/Q5_K_M/Q4_K_M) | Stability AI Community | Incluye 2 finetunes; runtime sa3.cpp |
| Stable Audio Open Small (original) | 341 M | no disponible | safetensors/checkpoint | Stability AI Community | Pesos base sin cuantizar; sin finetunes anidados |
| Stable Audio Open 1.0 | no disponible | no disponible | no disponible | Stability AI Community | El autor lo excluye explícitamente de este repositorio |
| Foundation-1 | no disponible | no disponible | no disponible | no disponible | El autor lo excluye explícitamente de este repositorio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia Stability AI Community License no es de código abierto permisiva; el uso comercial está sujeto a sus términos y al `LICENSE.md` incluido. T5-base se rige por Apache 2.0 (`LICENSE_T5.md`).
- El repositorio está deliberadamente limitado a SAOS; Stable Audio Open 1.0 y Foundation-1 no están incluidos y requieren repositorios separados.
- Jerry Grunge es más sensible al prompt que ARC y KickBass, y en algunas semillas sus bundles Q5_K_M y Q4_K_M producen una interpretación distinta a F16; Q8_0 se mantiene cercano a F16 en todas las semillas probadas.
- Mezclar niveles de cuantización entre componentes no está recomendado salvo justificación; el autor aconseja usar el mismo tier para los tres componentes.
- No hay información sobre sesgos, tasas de alucinación o calidad multilingüe del condicionamiento de texto; los idiomas soportados no están documentados.
- La validación reportada es cualitativa y con renders de 11 segundos; no hay métricas objetivas de calidad ni pruebas de duraciones mayores.
- La redistribución de KickBass se hace con permiso directo de S3Sound; cualquier redistribución derivada debe respetar esa atribución y la licencia de Stability AI.
- SAOS no forma parte del build por defecto de `sa3.cpp`; requiere habilitar el componente SAT opcional, lo que añade complejidad de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thepatch/stable-audio-open-small-GGUF
- Runtime sa3.cpp: https://github.com/betweentwomidnights/sa3.cpp
- Modelo base SAOS: https://huggingface.co/stabilityai/stable-audio-open-small
- Licencia Stability AI Community: https://huggingface.co/stabilityai/stable-audio-open-small/blob/main/LICENSE
- Finetune KickBass: https://huggingface.co/S3Sound/kickbass
- Finetune Jerry Grunge: https://huggingface.co/thepatch/jerry_grunge
- Codificador T5-base: https://huggingface.co/google-t5/t5-base
