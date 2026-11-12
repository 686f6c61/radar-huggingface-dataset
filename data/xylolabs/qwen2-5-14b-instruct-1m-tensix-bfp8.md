# Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP8

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP8 es una cuantizacion del modelo Qwen2.5-14B-Instruct-1M de Alibaba Qwen, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 14.770.033.664 parametros con ventana de contexto de hasta 1M de tokens, y esta cuantizacion convierte sus capas lineales de atencion y MLP al formato `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, manteniendo el resto de tensores en bf16.

La relevancia de esta ficha no reside en el modelo base, ampliamente conocido, sino en el formato de despliegue: es un checkpoint empaquetado para que TT-NN lo cargue directamente sin conversion adicional, con un promedio de 9,29 bits por peso y 17,15 GB empaquetados frente a los 29,54 GB del BF16 original. Esto permite ejecutar un modelo de 14B con contexto de un millon de tokens en hardware Tensix con un consumo de memoria sustancialmente menor.

El checkpoint ha sido validado en el simulador `ttsim` de Blackhole con ttnn 0.81.1, pero no se ha probado en hardware fisico, y ni tt-transformers ni tt-forge se han ejecutado con el. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), capas lineales cuantizadas a BFP8 |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 1.000.000 de tokens (heredada del modelo base Qwen2.5-14B-Instruct-1M) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas q, k, v, o y MLP gate, up, down de las 48 capas; bf16 en LM head, embeddings, norms y resto de tensores; 9,29 bits por peso de media |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta multiples idiomas, pero esta ficha declara solo ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP8), indexado con `model.safetensors.index.json`; metadatos de formato por proyeccion en `quant4.json` |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-14B-Instruct-1M es un transformer denso de tipo decoder-only con 48 capas, basado en la familia Qwen2.5 de Alibaba. La variante -1M extiende la ventana de contexto hasta un millon de tokens mediante las tecnicas de entrenamiento y atencion descritas por el equipo Qwen en su blog y paper (enero de 2025). El post-entrenamiento incluye ajuste por instrucciones y preferencias, segun la documentacion del modelo base.

Esta publicacion concreta no entrena el modelo: aplica GPTQ sobre la rejilla de block floating point `bfloat8_b` para producir pesos que TT-NN pueda empaquetar sin transformacion. El calibrado se realizo sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Cada bloque BFP8 conserva su exponente compartido tal como lo fija el empaquetador de Tenstorrent. El resultado son ficheros en bf16 cuyos valores ya caen exactamente sobre la rejilla BFP8, de modo que el empaquetado en la NPU es una operacion de copia sin perdida adicional. El repositorio incluye `pack_tensix.py` y `verify_grid.py` para verificar que ninguna matriz cambia al empaquetarla y que la rejilla es correcta usando solo torch.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones, heredados del ajuste instructivo de Qwen2.5.
- Procesamiento de contexto muy largo: hasta 1M de tokens en el modelo base, lo que habilita tareas sobre documentos extensos, aunque no se han medido velocidades ni calidad a esa longitud en esta cuantizacion.
- Capacidades de codigo y matematicas propias de Qwen2.5-14B-Instruct, sin evaluacion especifica publicada para este checkpoint.
- Soporte de tool calling y function calling: no documentado en esta model card; debe consultarse la card del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta model card.
- Capacidades multilingues: la model card declara solo `en`; el calibrado uso texto en coreano, pero no se declara soporte oficial de ese idioma.
- Capacidad especial: checkpoint preempaquetado para NPU Tensix (`ttnn.bfloat8_b`), listo para cargar en TT-NN sin conversion.

## Casos de uso

- Despliegue en hardware Tenstorrent: cargar el checkpoint directamente en TT-NN sobre Wormhole o Blackhole para servir Qwen2.5-14B con 17,15 GB empaquetados en lugar de 29,54 GB, reduciendo la presion sobre DRAM de la NPU.
- Analisis de documentos largos: aprovechar la ventana de 1M tokens del modelo base para resumir o extraer informacion de contratos, informes o bases de codigo extensas en una sola pasada, con la salvedad de que la calidad a esa longitud no se ha medido en esta cuantizacion.
- Evaluacion de pipelines de cuantizacion: usar el checkpoint y `verify_grid.py` como referencia para validar que el empaquetado BFP8 no altera valores, integrandolo en pruebas de regresion de toolchains TT-NN.
- Investigacion sobre block floating point: comparar la fidelidad de BFP8 GPTQ frente a BF16 y Q4_K_M usando las metricas de KL y top-1 publicadas (0,00197 de KL medio y 98,44 % de top-1 frente a BF16).
- Generacion de texto asistida en entornos con memoria limitada: servir un modelo de 14B en un dispositivo Tensix con menos DRAM de la que requeriria el BF16, manteniendo 32 de 33 respuestas correctas en el conjunto de prueba del autor.
- Simulacion y desarrollo sin hardware: ejecutar el modelo en `ttsim` (simulador de Blackhole) con ttnn 0.81.1 para desarrollar kernels o aplicaciones antes de disponer de la NPU fisica.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto al BF16, no la calidad en tareas. KL y top-1 cubren 16.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con y sin plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct-1M) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP8) | 9,29 | 17,154 | 0,00197 | 98,44 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07403 | 90,14 | 31 de 33 | 0 |

El autor fija como criterio que el KL medio no supere 1,5 veces el de Q4_K_M y que no se pierda mas de una respuesta adicional; el resultado es 0,03 veces el KL de Q4_K_M y 0 respuestas perdidas. No se han medido velocidades en dispositivo. Para benchmarks de tareas del modelo base debe consultarse la card de Qwen.

## Requisitos de hardware

- VRAM/DRAM estimada: 17,15 GB empaquetados en BFP8; el repositorio ocupa 29,5 GB por almacenar los tensores en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Validacion: probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole); no probado en hardware fisico.
- GPU consumer: no es el objetivo del checkpoint; en GPU se puede cargar con transformers en bf16 (unos 29,5 GB, requiere GPUs de 32 GB o mas como A100 40 GB, H100 o RTX 5090/A6000 de 48 GB), pero se pierde la ventaja de empaquetado BFP8.
- Despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b` y `TILE_LAYOUT`), scripts `pack_tensix.py` y `verify_grid.py`; transformers para inspeccion o uso en GPU. tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponibles; no se midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 14,77B | 1M | 9,29 | 17,15 GB | Apache 2.0 | Hugging Face, orientado a NPU Tensix |
| Qwen2.5-14B-Instruct-1M (BF16) | 14,77B | 1M | 16 | 29,54 GB | Apache 2.0 | Hugging Face, uso general en GPU |
| Qwen2.5-14B-Instruct-1M Q4_K_M (llama.cpp) | 14,77B | 1M | 4,87 | 8,99 GB | Apache 2.0 | Hugging Face, uso general en CPU/GPU |

La comparativa se limita al mismo modelo base en distintos formatos, que es lo que documenta el autor. No se dispone de comparaciones con otros modelos de 14B en la informacion proporcionada.

## Limitaciones y advertencias

- No probado en hardware Tensix fisico: solo en el simulador `ttsim` de Blackhole con ttnn 0.81.1.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que su integracion en esos stacks no esta validada.
- Las metricas publicadas miden cercania al BF16, no calidad en tareas; no hay evaluacion de MMLU, HumanEval, GSM8K ni similares para esta cuantizacion.
- La model card declara solo ingles; el modelo base es multilingue, pero el soporte de otros idiomas no esta garantizado en esta ficha.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones especificas para esta cuantizacion.
- Sesgos: no documentados en la informacion disponible; deben consultarse los del modelo base Qwen2.5.
- Calidad a contexto de 1M tokens: no medida en esta cuantizacion; el calibrado uso solo 65.536 tokens.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el modelo "as is", sin garantia, y no esta afiliado ni respaldado por Tenstorrent.
- El repositorio ocupa 29,5 GB aunque el modelo empaquetado ocupe 17,15 GB, lo que afecta al almacenamiento y a la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5-1M: https://qwenlm.github.io/blog/qwen2.5-1m/
- Paper de referencia citado en los tags: https://arxiv.org/abs/2501.15383
