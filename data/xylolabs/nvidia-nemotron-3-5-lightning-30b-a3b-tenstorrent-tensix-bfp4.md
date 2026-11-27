# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por Xylolabs y optimizada especificamente para aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es una variante "Lightning" de la familia Nemotron 3.5 de NVIDIA, con arquitectura hibrida NemotronH (Mamba-2 + atencion) y un esquema Mixture-of-Experts con 31.577.940.288 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B).

El problema que resuelve esta version concreta es el despliegue eficiente en hardware Tenstorrent: reduce el peso empaquetado de 63,16 GB (BF16) a 19,533 GB mediante cuantizacion de punto flotante por bloques (BFP4 para expertos enrutados, BFP8 para proyecciones Mamba y atencion), manteniendo una fidelidad respecto a BF16 ligeramente mejor que la cuantizacion Q4_K_M de llama.cpp (KL media de 0,0328 frente a 0,0346).

Es relevante ahora porque demuestra que un modelo MoE de 30B con contexto y capacidades conversacionales puede ejecutarse en NPUs de Tenstorrent con perdida de calidad medible y acotada, abriendo una alternativa de hardware no-GPU para inferencia en produccion. La ficha se centra en esta variante cuantizada; los detalles de entrenamiento del modelo original no se detallan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (hibrida: Mamba-2 + atencion, con Mixture-of-Experts enrutados); 52 capas principales, 23 capas Mamba-2, 6 capas de atencion |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Aproximadamente 3.000 millones (sufijo A3B); no se detalla el reparto exacto en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) para expertos enrutados; BFP8 (bfloat8_b) para proyecciones Mamba y atencion; bf16 para LM head, embeddings y normas; GPTQ con busqueda de exponente por bloque para BFP4, round-to-nearest para BFP8 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (empaquetado Tensix BFP; compatible con transformers y con ttnn) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es NemotronH, un diseno hibrido que combina capas Mamba-2 (23 capas) con capas de atencion (6 capas) sobre un total de 52 capas principales, e incorpora un esquema Mixture-of-Experts con expertos enrutados y un experto compartido. El checkpoint cuantizado conserva el modelo principal de 52 capas y excluye los tensores opcionales MTP (multi-token prediction), con `num_nextn_predict_layers` fijado a cero.

El proceso de cuantizacion de Xylolabs aplica GPTQ con busqueda de exponente por bloque a los tensores BFP4 de los expertos enrutados, y redondeo al mas cercano para los tensores BFP8 de proyecciones Mamba (entrada y salida) y atencion (q, k, v, o). El LM head, los embeddings, las normas y el sesgo de correccion de puntuacion del router (`backbone.layers.N.mixer.gate.e_score_correction_bias`) permanecen en sus precisiones originales (bf16 y float32 respectivamente). El fichero `quant4.json` documenta el formato de cada proyeccion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Nemotron 3.5, si bien no se detallan evaluaciones especificas en la informacion disponible.
- Soporte multilingue en ingles, espanol, frances, aleman, italiano y japones.
- Compatibilidad con el ecosistema transformers mediante la implementacion integrada `NemotronHForCausalLM` (Transformers 5.23.0).
- Ejecucion en NPUs Tenstorrent Tensix (Wormhole, Blackhole) a traves de ttnn, con kernels y runner propios (tensix-kernels, tensix-runner).
- Verificacion de empaquetado bit-exacto: las matrices BFP4 y BFP8 se reempaquetan de forma exacta en ttnn (`assert torch.equal` en el ejemplo de la model card).
- Tool calling, function calling, modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el modelo esta empaquetado para NPUs Wormhole y Blackhole con ttnn 0.81.1, lo que permite servir generacion de texto sobre hardware no-GPU reduciendo dependencia de CUDA.
- Servicio conversacional multilingue: con soporte para seis idiomas (en, es, fr, de, it, ja) y plantilla de chat, es adecuado para asistentes de atencion al cliente en mercados europeos y japoneses.
- Inferencia con restricciones de memoria: el empaquetado de 19,533 GB frente a los 63,16 GB en BF16 permite alojar el modelo en aceleradores con DRAM limitada, manteniendo una KL media de 0,0328 respecto a BF16.
- Validacion y auditoria de cuantizaciones: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar bit a bit cada matriz empaquetada, util en pipelines de CI para modelos cuantizados destinados a produccion.
- Prototipado en simulador: la comprobacion con ttsim (simulador Blackhole de Tenstorrent) permite desarrollar y depurar kernels sin hardware fisico antes del despliegue.
- Evaluacion comparativa de fidelidad: al estar medida frente a Q4_K_M de llama.cpp con la misma metodologia (WikiText-2 y Wikipedia en coreano), sirve como referencia para decidir entre formatos de cuantizacion en funcion del hardware objetivo.
- Investigacion en arquitecturas hibridas Mamba-2 + atencion: el checkpoint permite estudiar el comportamiento de un MoE hibrido de 30B en precisiones bajas (BFP4/BFP8) sobre datos multilingues.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 main model (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16) | 63,16 | 0 | 100 |
| Este modelo (Tensix BFP4) | 19,533 | 0,0328 | 92,5 |
| Q4_K_M (llama.cpp) | 25,431 | 0,0346 | 92,13 |

Las metricas de KL y top-1 se calculan sobre 8.188 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano. Q4_K_M se genero a partir del mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. El BF16 propio de llama.cpp presenta una KL media de 0,0887 respecto al de referencia, segun la model card. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 19,533 GB empaquetado para Tensix; el repo completo ocupa 63,2 GB.
- Hardware objetivo: NPUs Tenstorrent Wormhole y Blackhole; validado con ttnn 0.81.1 sobre ttsim (simulador Blackhole).
- GPU consumer: no se documenta soporte especifico; la carga via transformers con `device_map="auto"` y `dtype="bfloat16"` es posible en teoria, pero el checkpoint esta empaquetado en formato Tensix BFP, no en un formato GPU estandar.
- Opciones de despliegue: ttnn (Tenstorrent), tensix-runner v0.1.0 para ejecucion en Tensix, y transformers 5.23.0 con `NemotronHForCausalLM` para inspeccion o conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL media a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Tensix BFP4) | 31,58B totales / ~3B activos | no disponible | 0,0328 | openmdw-1.1 | Hugging Face |
| Q4_K_M (llama.cpp) | 31,58B totales / ~3B activos | no disponible | 0,0346 | openmdw-1.1 (derivado) | Hugging Face / llama.cpp |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,58B totales / ~3B activos | no disponible | 0 (referencia) | openmdw-1.1 | Hugging Face |

La comparativa se limita a variantes del mismo checkpoint base, ya que no se dispone de datos de rendimiento en tareas frente a modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible: KL media de 0,0328 y top-1 del 92,5 % frente al 100 % de BF16; aceptable para generacion, pero a considerar en tareas de alta precision.
- El checkpoint esta empaquetado en formato Tensix BFP; no es un GGUF ni un safetensors BF16 estandar, por lo que su uso fuera de Tenstorrent requiere conversion.
- Excluye los tensores MTP del modelo base (`num_nextn_predict_layers = 0`), por lo que no se beneficia de decodificacion multi-token especulativa.
- Requiere Transformers 5.23.0 o superior para la implementacion `NemotronHForCausalLM`; versiones anteriores no cargaran el modelo.
- La evaluacion de fidelidad se limita a 8.188 posiciones de ingles y coreano; el coreano no figura entre los idiomas declarados del modelo, lo que limita la extrapolacion a los seis idiomas soportados.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni restricciones adicionales de la licencia openmdw-1.1 en la informacion disponible; se recomienda revisar el texto completo de la licencia antes de uso comercial.
- El modelo base no detalla contexto maximo, datos de entrenamiento ni etapas de alineacion, lo que dificulta evaluar su robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia OpenMDW-1.1: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
