# Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3-4B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo Qwen/Qwen3-4B, desarrollada por Xylolabs, específicamente empaquetada para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante el stack TT-NN / tt-metal. El modelo mantiene la arquitectura transformer densa de Qwen3-4B, con 4.411.424.256 parámetros totales, pero sustituye las proyecciones lineales de atención y MLP por matrices cuantizadas en formato block-floating-point de 8 bits (`ttnn.bfloat8_b`, BFP8), aplicando GPTQ sobre esa rejilla.

La relevancia de esta ficha radica en que no se trata de una cuantización convencional para GPU, sino de un formato nativo del hardware Tensix: las matrices se almacenan como valores bf16 sobre la rejilla BFP8, de modo que el empaquetador de TT-NN las carga sin alterar sus valores. El resultado ocupa aproximadamente 4,64 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, con un promedio de 9,23 bits por peso, lo que permite desplegar un modelo de 4B en NPUs de Tenstorrent con pérdida de calidad muy contenida frente al original en BF16.

El checkpoint se publica bajo licencia Apache-2.0, heredada de Qwen3-4B, y está pensado para entornos de inferencia sobre hardware Tenstorrent más que para GPU convencional, aunque conserva compatibilidad con `transformers` para inspección y validación numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con capas lineales cuantizadas a BFP8 para Tensix |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en proyecciones q, k, v, o y gate, up, down; bf16 en embedding, LM head, normas y resto de tensores; promedio 9,23 bits por peso |
| Idiomas soportados | no disponible (calibracion GPTQ sobre WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB), con `quant4.json` describiendo el formato por proyeccion y `model.safetensors.index.json` para el sharding |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso de 36 capas con atención multi-cabeza y proyecciones MLP estándar (gate, up, down). Esta exportación no reentrena el modelo: aplica GPTQ sobre la rejilla BFP8 a las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 36 capas, manteniendo en bf16 el embedding, el LM head (atado al embedding), las normas y el resto de tensores. La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, preservando el exponente compartido de cada bloque tal como lo establece el empaquetador de TT-NN.

La innovación técnica principal es el alineamiento exacto entre el formato de almacenamiento y el formato de carga del hardware: al guardar los valores cuantizados como bf16 sobre la rejilla BFP8, TT-NN puede empaquetarlos en memoria de dispositivo sin recuantizar ni alterar valores, lo que permite verificar igualdad bit a bit tras el empaquetado. El autor reporta validación con `ttnn 0.81.1` sobre el simulador Blackhole (ttsim), con un prefill de 2 capas que coincide con `transformers` con PCC 0.9990 al usar `--use_hf_rope`. Para tt-forge (tt-xla) el checkpoint aún no se ha probado; por defecto tt-forge mantiene los pesos en bf16 (exacto), y sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en el layout [out, in] de PyTorch.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de Qwen3-4B.
- Razonamiento y matemáticas de nivel medio, limitado por el tamaño de 4B parámetros del modelo base.
- Generación de código, sujeto a las capacidades del Qwen3-4B original.
- Soporte de plantilla de chat mediante `apply_chat_template` con `add_generation_prompt=True`.
- Compatibilidad con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) para inspección y validación.
- Ejecución nativa en NPUs Tenstorrent Tensix (Wormhole, Blackhole) a través de TT-NN / tt-metal.
- Soporte de tool calling, agentes y modo thinking: no disponible en la informacion proporcionada para esta exportación concreta.
- Capacidades multilingües: no disponible en la informacion proporcionada; la calibración incluyó texto en inglés y coreano.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado para cargarse directamente en memoria de dispositivo Tensix con TT-NN, ocupando unos 4,64 GB para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. Es el caso de uso principal y para el que fue diseñado.
- Inferencia de texto en entornos con restricciones de memoria de dispositivo: al promediar 9,23 bits por peso, permite alojar un modelo de 4B en aceleradores con menos DRAM que la versión BF16 (8,04 GB), a costa de una pérdida mínima de calidad (KL media de 0,00120 frente a BF16).
- Validación numérica de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que ninguna matriz cambia de valor tras el empaquetado en BFP8, útil en procesos de CI para exportaciones cuantizadas.
- Servicio conversacional de bajo coste: con la plantilla de chat de Qwen3 y la licencia Apache-2.0, puede integrarse en backends de atención al cliente sobre hardware Tenstorrent, siempre que se valide el comportamiento del modelo base en el dominio concreto.
- Prototipado en simulador: el autor verificó el checkpoint con `ttnn 0.81.1` sobre ttsim, el simulador Blackhole, lo que permite desarrollar y depurar integraciones TT-NN sin hardware físico.
- Evaluación comparativa de formatos de cuantización: sirve como referencia para comparar BFP8 (9,23 bits/peso) frente a Q4_K_M de llama.cpp (4,95 bits/peso) en términos de KL y top-1 sobre el mismo modelo base.
- Integración en pipelines tt-transformers: el demo `simple_text_demo.py` de tt-metal v0.81.1 con `--use_hf_rope` y la configuración de precisión indicada permite ejecutar benchmarks de rendimiento batch-1 sobre este checkpoint.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor en la model card:

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B) | 16 | 8,04 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP8)** | 9,23 | 4,639 | 0,00120 | 98,63 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 2,497 | 0,06581 | 89,61 | 38 de 40 | 0 |

La KL y el top-1 cubren 16.240 posiciones de texto en inglés y coreano, según la información proporcionada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM / memoria de dispositivo estimada: aproximadamente 4,64 GB solo para los pesos del modelo de lenguaje en BFP8, más espacio adicional para KV cache y buffers de ejecución.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Para dispositivos con menos memoria, el autor recomienda la versión BFP4 (Xylolabs/Qwen3-4B-Tenstix-BFP4).
- GPU convencionales: no es el objetivo del checkpoint; puede cargarse con `transformers` en bf16 (`dtype="bfloat16"`, `device_map="auto"`), lo que requiere del orden de 8-9 GB de VRAM, pero sin las ventajas del formato BFP8.
- Opciones de despliegue: TT-NN / tt-metal (v0.81.1 verificado), tt-transformers (`simple_text_demo.py` con `--use_hf_rope`), tt-forge (tt-xla) sin probar con este checkpoint; `transformers` para inspección.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| **Qwen3-4B-Tenstorrent-Tensix-BFP8** | 4,41B | no disponible | BFP8, 9,23 bits/peso | Apache-2.0 | Tenstorrent Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3-4B (BF16) | 4,41B | no disponible | BF16, 16 bits/peso | Apache-2.0 | GPU / CPU |
| Qwen3-4B Q4_K_M (llama.cpp) | 4,41B | no disponible | Q4_K_M, 4,95 bits/peso | Apache-2.0 | CPU / GPU (llama.cpp) |
| Xylolabs/Qwen3-4B-Tenstix-BFP4 | 4,41B | no disponible | BFP4 | Apache-2.0 | Tenstorrent Tensix con menos memoria |

## Limitaciones y advertencias

- El checkpoint está diseñado para hardware Tenstorrent Tensix; en GPU convencional pierde su ventaja de formato y requiere cargarse en bf16, con mayor huella de memoria.
- El demo de tt-transformers empaqueta el LM head atado en `bfloat8_b`, por lo que el head en bf16 de este checkpoint no es exacto en ese demo; el autor lo advierte explícitamente.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; su comportamiento por defecto (bf16) es exacto, pero las opciones `bfp_bf8`/`bfp_bf4` recuantizan y pueden introducir diferencias.
- La cuantización GPTQ se calibró sobre WikiText-2 y Wikipedia en coreano; el comportamiento en otros dominios o idiomas no está caracterizado en la información disponible.
- Riesgo de alucinación y sesgos: no disponible en la informacion proporcionada para esta exportación; se heredan los del modelo base Qwen3-4B.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B y de las dependencias (tt-metal, TT-NN) para producción.
- El modelo tiene 67 descargas y 0 likes en el momento de la ficha; es una exportación reciente (creada el 2026-11-11) con validación limitada a un simulador y a un prefill de 2 capas, no a un despliegue completo en silicio.
- Longitud de contexto e idiomas soportados no están documentados en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen3-4B-Tenstix-BFP4
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
