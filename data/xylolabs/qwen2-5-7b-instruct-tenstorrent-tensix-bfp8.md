# Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP8

## Resumen

Qwen2.5-7B-Instruct-Tenstix-BFP8 es una exportación cuantizada del modelo Qwen/Qwen2.5-7B-Instruct, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante el stack TT-NN (tt-metal). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado en el que las capas lineales (proyecciones q, k, v, o de atención y gate, up, down del MLP en las 28 capas) se han cuantizado a `ttnn.bfloat8_b` (BFP8, formato de coma flotante por bloques) aplicando GPTQ sobre la rejilla nativa del hardware.

El problema que resuelve es práctico: los NPU de Tenstorrent empaquetan pesos en BFP8 y BFP4 de forma nativa, y este export entrega las matrices ya almacenadas como valores bf16 sobre la rejilla BFP8, de modo que TT-NN las empaqueta sin alterar sus valores. El resultado ocupa 9,11 GB de memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 15,23 GB del checkpoint BF16 original, con una media de 9,57 bits por peso.

La relevancia es acotada pero clara para quien trabaja con hardware de Tenstorrent: permite desplegar un modelo conversacional de 7.615.616.512 parámetros en Wormhole y Blackhole con una pérdida de fidelidad respecto a BF16 muy baja (KL medio de 0,00158 sobre 16.104 posiciones). La licencia Apache 2.0 del modelo base se mantiene, y la model card ofrece scripts de verificación (`pack_tensix.py`, `verify_grid.py`) para comprobar que el empaquetado no modifica ningún valor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), pesos lineales cuantizados a BFP8 con GPTQ |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en capas lineales); LM head, embeddings y normas en bf16; media de 9,57 bits por peso |
| Idiomas soportados | en (segun la model card y los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers), empaquetado para TT-NN |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct original: un transformer decoder-only denso con 28 capas, atención con proyecciones q, k, v y o separadas, y un MLP con gate, up y down. Este repositorio no reentrena el modelo; parte del checkpoint BF16 oficial de Qwen y aplica una cuantización GPTQ específica para la rejilla `bfloat8_b` de TT-NN. El calibrado se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, y se conserva el exponente compartido de cada bloque tal como lo fija el empaquetador de Tenstorrent, de manera que el empaquetado posterior en el dispositivo no cambia los valores.

La innovación técnica no está en el entrenamiento sino en el formato de export: las matrices cuantizadas se guardan como valores bf16 situados sobre la rejilla BFP8, lo que permite que TT-NN las empaquete de forma exacta (la verificación del repositorio comprueba con `torch.equal` que el round-trip a través del dispositivo no altera ningún valor). El archivo `quant4.json` documenta el formato de cada proyección. La model card indica que la verificación se hizo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; la ruta de tt-transformers (tt-metal v0.81.1) no se probó porque solo ejecuta Qwen2.5-7B en 2 o 4 chips (N300 y superiores), y la ruta de tt-forge (tt-xla) tampoco se ha ejecutado con este checkpoint. No se dispone de información sobre la composición del dataset de preentrenamiento ni sobre las fases de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (`apply_chat_template`) heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, en la medida en que lo soporta el modelo base; el export no añade capacidades nuevas.
- Generación de código y matemáticas: capacidad heredada del modelo base, sin datos de benchmarks específicos en este repositorio.
- Ejecución sobre NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado nativo BFP8.
- Verificación de integridad del empaquetado mediante `pack_tensix.py` (comprueba cada matriz, con opción `--device` para round-trip por DRAM) y `verify_grid.py` (verificación de la rejilla solo con torch).
- Compatibilidad con `transformers` y `text-generation-inference` a través de los tags del repositorio, además de `endpoints_compatible`.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada para este export.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el caso principal. El checkpoint está pensado para cargarse en TT-NN con `ttnn.as_tensor` en `TILE_LAYOUT` y `DRAM_MEMORY_CONFIG`, ocupando 9,11 GB de memoria de dispositivo para los pesos, lo que permite servir un modelo de 7B en NPU con menor huella que el BF16.
- Inferencia conversacional en entornos con memoria de dispositivo limitada: al reducir los pesos de 15,23 GB a 9,11 GB, deja margen para la caché KV y los buffers en dispositivos que no admiten el checkpoint BF16 completo; la model card remite a la versión BFP4 para hardware aún más restringido.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que el empaquetado BFP8 no altera valores, útil en flujos de CI que validen exportaciones para TT-NN antes de desplegar.
- Servicio de texto compatible con `transformers` y TGI: la carga con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` permite usar el checkpoint en entornos estándar de Hugging Face, aunque sin la ventaja de empaquetado nativo del NPU.
- Evaluación de fidelidad de cuantización: el repositorio publica métricas de KL y top-1 frente a BF16 y Q4_K_M, lo que lo hace útil como referencia para comparar estrategias de cuantización en hardware Tenstorrent.
- Integración en tt-transformers sobre configuraciones de 2 o 4 chips (N300 y superiores): la model card documenta los parámetros necesarios (`--use_hf_rope` y `precision_cfg` con `ff1_3`, `ff2`, `wqkv`, `wo` en bfp8), aunque advierte de que esta ruta no se ha probado con este checkpoint.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a BF16, no la calidad en tareas. KL y top-1 cubren 16.104 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-7B-Instruct) | 16 | 15,23 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP8) | 9,57 | 9,114 | 0,00158 | 98,33 | 28 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,0369 | 91,25 | 27 de 33 | 1 |

El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) y sin importance matrix (sha256 `fa8de6513b477515fad4a8242e1ed1d12afc563ce41bc1cb8614b7b08727dd57`). El criterio de aceptación del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional; el resultado es 0,04 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 1. La model card no reporta velocidad ni throughput.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 9,11 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers. El checkpoint BF16 equivalente ocupa 15,23 GB.
- GPU/NPU recomendadas: aceleradores Tenstorrent Tensix Wormhole y Blackhole. Para tt-transformers se requiere configuración de 2 o 4 chips (N300 y superiores).
- GPU de consumo: no disponible en la información proporcionada; el export está orientado a NPU Tenstorrent, no a CUDA. La carga vía `transformers` con `device_map="auto"` requeriría hardware compatible con PyTorch, sin datos publicados de rendimiento en ese escenario.
- Opciones de despliegue: TT-NN (tt-metal, verificado con ttnn 0.81.1 sobre ttsim), tt-transformers (no probado con este checkpoint), tt-forge/tt-xla (no probado), `transformers` y text-generation-inference (tags del repositorio).
- Latencia y throughput: no disponibles en la información proporcionada. La model card indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Este modelo (Tensix BFP8) | 7.615.616.512 | No disponible | BFP8 + bf16, 9,57 bits | 9,114 GB | Apache 2.0 | Tenstorrent Tensix |
| Qwen/Qwen2.5-7B-Instruct (BF16) | 7.615.616.512 | No disponible en la informacion | BF16, 16 bits | 15,23 GB | Apache 2.0 | GPU/NPU genéricos |
| Q4_K_M de llama.cpp (mismo checkpoint) | 7.615.616.512 | No disponible | GGUF Q4_K_M, 4,91 bits | 4,683 GB | Apache 2.0 | CPU/GPU vía llama.cpp |
| Xylolabs/Qwen2.5-7B-Instruct-Tenstix-BFP4-MLP | No disponible | No disponible | BFP4, menor huella | No disponible | Apache 2.0 | Tenstorrent Tensix con menos memoria |

En fidelidad frente a BF16, este export (KL 0,00158) queda muy por delante de Q4_K_M (KL 0,0369) a costa de ocupar 9,114 GB frente a 4,683 GB. Frente al BF16 original, la pérdida es marginal (top-1 del 98,33 % frente al 100 %). No se dispone de comparativas de calidad en tareas ni de velocidad.

## Limitaciones y advertencias

- Las métricas publicadas miden cercanía a BF16, no calidad en tareas; la model card lo advierte de forma explícita.
- El idioma declarado es únicamente inglés, pese a que el calibrado de cuantización incluyó Wikipedia en coreano; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto no se especifica en la información disponible; debe consultarse la del modelo base.
- La ruta de tt-transformers no se ha probado con este checkpoint y solo funciona en configuraciones de 2 o 4 chips; sin `--use_hf_rope` el QKV fusionado se recuantiza.
- La ruta de tt-forge (tt-xla) no se ha ejecutado con este checkpoint; por defecto mantiene los pesos en bf16 y sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en el layout [out, in] de PyTorch.
- La verificación se realizó sobre ttsim (simulador de Blackhole), no sobre silicio físico; el comportamiento en hardware real puede diferir.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen2.5-7B-Instruct; no se documentan evaluaciones específicas en este repositorio.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene revisar las condiciones del modelo base y de las herramientas de Tenstorrent empleadas.
- El repositorio tiene 73 descargas y 0 likes en el momento de la consulta, con creación y última actualización en noviembre de 2026; se trata de un export reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstix-BFP4-MLP
- Paper referenciado (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstix-BFP8/blob/main/LICENSE
- Revisión del checkpoint base BF16: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/tree/a09a35458c702b33eeacc393d103063234e8bc28
