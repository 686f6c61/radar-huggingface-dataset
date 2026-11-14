# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Experts

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Experts es una version cuantizada del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, preparada por Xylolabs para su ejecucion sobre NPUs Tensix de Tenstorrent (Wormhole y Blackhole). El modelo base es un transformer hibrido de NVIDIA con arquitectura NemotronH, que combina capas de atencion con capas Mamba-2 en una estructura MoE (Mixture of Experts) de 31.577.940.288 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B).

La contribucion de esta ficha no es el modelo en si, sino el formato de pesos: las matrices lineales del modelo estan cuantizadas en los formatos nativos de TT-NN, `ttnn.bfloat4_b` (BFP4) para los expertos enrutados y `ttnn.bfloat8_b` (BFP8) para las proyecciones de atencion, Mamba-2 y el experto compartido. Los tensores se almacenan como valores bf16 sobre la retícula BFP correspondiente, de modo que TT-NN los empaqueta sin alterar sus valores. El resultado ocupa 19,53 GB empaquetados, con una media de 4,95 bits por peso.

Es relevante ahora porque permite desplegar un modelo MoE de 30B con contexto largo sobre hardware Tenstorrent, un acelerador alternativo a las GPU convencionales, con una perdida de calidad medida frente al BF16 original. La licencia OpenMDW-1.1 y el soporte multilingue (en, es, fr, de, it, ja) lo hacen util para entornos de investigacion y produccion que quieran evitar dependencia de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (transformer hibrido: atencion + Mamba-2, con MoE) |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | ~3B (sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`) para expertos enrutados; BFP8 (`ttnn.bfloat8_b`) para atencion, Mamba-2 y experto compartido; bf16 para embeddings, LM head y normas; float32 para `e_score_correction_bias` |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (valores bf16 sobre retícula BFP4/BFP8), indice `model.safetensors.index.json`, mapa `quant4.json` |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura NemotronH, un diseno hibrido que intercala capas de atencion con capas de estado espacial Mamba-2. El checkpoint exportado contiene 52 capas principales: 6 capas con proyecciones de atencion q, k, v, o en BFP8, 23 capas con proyecciones Mamba-2 (`in_proj`, `out_proj`) en BFP8, y 23 capas con expertos enrutados MoE cuyas proyecciones `up` y `down` estan en BFP4 y cuyo experto compartido esta en BFP8. Los tensores de embedding, LM head, normas y el resto de parametros se mantienen en bf16, salvo `backbone.layers.N.mixer.gate.e_score_correction_bias`, que permanece en float32 sin cambios.

La cuantizacion BFP4 de los expertos se realizo con GPTQ y una busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones `up` de los expertos enrutados comparten una unica matriz Hessiana por capa; cada experto calcula la suya propia para `down` o recurre a redondeo al mas cercano cuando ha visto pocos tokens de calibracion. Los tensores BFP8 se obtuvieron con redondeo al mas cercano. El resultado es una media de 4,95 bits por peso y 19,53 GB empaquetados. No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas generales (el ejemplo de la model card usa preguntas factuales simples).
- Capacidades multilingues en ingles, castellano, frances, alemán, italiano y japones.
- Arquitectura MoE con enrutamiento por token, lo que permite activar solo ~3B parametros por token frente a 31,58B totales.
- Ejecucion nativa sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN.
- Compatibilidad con la implementacion `NemotronHForCausalLM` de Transformers 5.23.0.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Despliegue sobre hardware Tenstorrent: el checkpoint esta disenado para cargarse directamente en NPUs Wormhole o Blackhole mediante TT-NN, con 19,53 GB de memoria de dispositivo para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers. Es adecuado para entornos que quieran evaluar aceleradores alternativos a CUDA.
- Investigacion en cuantizacion de bajo bit: el mapa `quant4.json` y los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar matriz por matriz que los valores BFP4/BFP8 se empaquetan sin alteracion, lo que sirve como caso de estudio de GPTQ sobre retículas de bloque.
- Servicio de chat multilingue: con soporte de en, es, fr, de, it y ja y plantilla de chat integrada, puede usarse como backend conversacional en aplicaciones que atiendan usuarios de esos idiomas.
- Generacion de texto en lote con Transformers: la carga via `AutoModelForCausalLM.from_pretrained` con `device_map="auto"` permite ejecutar inferencia en GPU convencionales usando los pesos cuantizados como bf16 sobre retícula, sin necesidad de TT-NN.
- Evaluacion comparativa de perdida por cuantizacion: la tabla de evaluacion de la model card (KL medio frente a BF16, top-1 y respuestas correctas) permite medir el coste de calidad del paso a 4,95 bits por peso en tareas de generacion.
- Prototipado de modelos MoE hibridos: la combinacion de atencion, Mamba-2 y expertos enrutados con solo ~3B parametros activos resulta util para estudiar el equilibrio entre coste computacional y calidad en inferencia.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion comparativa frente al modelo BF16 original. Los datos disponibles son parciales: se muestran las columnas de bits por peso, tamano en GB, KL medio frente a BF16, top-1 (%) y respuestas correctas/perdidas, pero los valores numericos de las filas no estan completos en la informacion proporcionada.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---|---|---|---|---|---|
| BF16 main model (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16) | 16 | no disponible | referencia | no disponible | no disponible | no disponible |
| Tenstorrent Tensix BFP4 Experts (este checkpoint) | 4,95 | 19,53 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 19,53 GB solo para los pesos del modelo de lenguaje, mas espacio adicional para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, familias Wormhole y Blackhole.
- Verificacion realizada con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.
- No se documenta compatibilidad ni requisitos de VRAM para GPU convencionales; la carga via Transformers con `device_map="auto"` usaria los pesos como bf16 sobre retícula, con un consumo de memoria proximo al del checkpoint empaquetado mas las estructuras de ejecucion.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b`/`ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`) y Transformers 5.23.0 con `NemotronHForCausalLM`.
- `tt-transformers` y `tt-forge` no se han ejecutado con este checkpoint, segun la model card.
- La ejecucion nativa del modelo completo no ha sido validada para este perfil exacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / hardware |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,58B | ~3B | no disponible | openmdw-1.1 | safetensors bf16, GPU/NPU genericas |
| Este checkpoint (Tensix BFP4 Experts) | 31,58B | ~3B | no disponible | openmdw-1.1 | safetensors BFP4/BFP8, NPU Tensix |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es frente al modelo base BF16, del que este checkpoint es una cuantizacion. No se dispone de informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- La ejecucion nativa del modelo completo no ha sido validada para este perfil exacto; solo se ha comprobado el empaquetado matriz por matriz sobre `ttsim`.
- `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- El checkpoint excluye los tensores MTP opcionales y fija `num_nextn_predict_layers` a cero, por lo que no dispone de decodificacion especulativa multi-token.
- La cuantizacion a 4,95 bits por peso introduce una perdida de calidad frente al BF16 original; los valores concretos de KL, top-1 y respuestas perdidas no estan disponibles en la informacion proporcionada.
- Los expertos enrutados `down` de algunos expertos usan redondeo al mas cercano en lugar de GPTQ cuando vieron pocos tokens de calibracion, lo que puede producir un comportamiento desigual entre expertos.
- La calibracion se realizo sobre WikiText-2 y Wikipedia en coreano, un dominio que puede no representar la distribucion de uso en produccion.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion disponible.
- La longitud de contexto no esta indicada; no debe asumirse un valor concreto.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; no se detallan en la informacion disponible las restricciones concretas aplicables.
- El modelo esta pensado para hardware Tenstorrent; su uso en GPU convencionales implica tratar los pesos cuantizados como bf16 sobre retícula, sin las ventajas de memoria del formato BFP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio de codigo `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia OpenMDW-1.1: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Experts/blob/main/LICENSE
