# Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix

## Resumen

Ornith-1.5-35B-A3B-Tenstorrent-Tensix es una cuantizacion del modelo de lenguaje Ornith-1.5-35B-A3B (desarrollado por ornith-ai) realizada por Xylolabs, optimizada especificamente para su ejecucion sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 35 mil millones de parametros totales y 3 mil millones activos por token, heredero de componentes de Qwen3.5 segun la propia model card.

El problema que resuelve esta variante es la falta de pesos compatibles con el formato nativo de las NPU Tensix de Tenstorrent, que utilizan block floating point (bfloat4_b y bfloat8_b) en lugar de los formatos habituales de GPU. Xylolabs aplica una cuantizacion GPTQ adaptada a este formato, reduciendo el peso empaquetado a 21,2 GB frente a los 141,2 GB del repositorio completo, con una divergencia KL media de 0,058 frente al modelo de referencia en BF16.

Es relevante ahora porque permite desplegar un modelo MoE de gama media-alta en hardware alternativo a NVIDIA, con una calidad de cuantizacion que supera a la referencia Q4_K_M (KL de 0,079) en las pruebas publicadas. La variante elimina los pesos de vision y de decodificacion especulativa (MTP), por lo que es estrictamente texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), componentes heredados de Qwen3.5 |
| Parametros totales | 35B (aproximado, segun nombre del modelo) |
| Parametros activos | 3B (aproximado, segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Block floating point: bfloat4_b (expertos enrutados), bfloat8_b (atencion, expertos compartidos, LM head), bf16 (resto) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | MIT (modelo base); componentes Qwen3.5 bajo Apache 2.0; herramientas bajo Apache 2.0 |
| Formato de pesos | safetensors (carpeta `text-bfp4/`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 35B parametros totales y 3B activos, derivado de Ornith-1.5-35B-A3B. La model card indica que integra componentes de Qwen3.5 con licencia Apache 2.0 y Copyright 2026 Alibaba Cloud. La variante de Xylolabs no reentrena el modelo: aplica una cuantizacion post-entrenamiento (GPTQ adaptado a block floating point) sobre los pesos originales en BF16, con un esquema mixto de precision: los expertos enrutados se cuantizan a bfloat4_b, mientras que la atencion, los expertos compartidos y el LM head se mantienen a bfloat8_b, y el resto en bf16.

La innovacion tecnica principal es la herramienta `tensix-bfp-gptq` (v0.1.0), que produce pesos empaquetados directamente consumibles por `ttnn` en NPU Tensix, con scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que permiten round-trip de los valores empaquetados. La calibracion KL se realizo sobre 8.188 posiciones de textos en ingles y coreano (dos fragmentos de 2.048 tokens), con un limite de KL media de 1,5 veces la referencia Q4_K_M. No se dispone de informacion sobre el numero de tokens de entrenamiento original ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles y coreano.
- Razonamiento y respuesta a instrucciones mediante plantilla de chat (`apply_chat_template`), con soporte de modo thinking desactivable (`enable_thinking=False`).
- Capacidad MoE: activa aproximadamente 3B parametros por token, lo que reduce el coste computacional por token frente a un modelo denso de 35B.
- Ejecucion en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`.
- Ejecucion en GPU/CPU convencional mediante Transformers 5.23.0 y PyTorch (los pesos BFP se cargan y convierten a bfloat16).
- No incluye vision: los pesos de vision fueron omitidos en esta variante.
- No incluye decodificacion especulativa (MTP deshabilitado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el caso principal. Permite servir un MoE de 35B en NPU Wormhole o Blackhole usando los pesos empaquetados en bfloat4_b/bfloat8_b, sin necesidad de GPU NVIDIA.
- Investigacion en cuantizacion de bajo nivel: util como referencia para estudiar el impacto de block floating point en modelos MoE, con metricas KL publicadas frente a BF16 y Q4_K_M.
- Generacion de texto en ingles y coreano: adecuado para asistentes y pipelines de generacion en estos dos idiomas, los unicos declarados.
- Prototipado en GPU convencional: los pesos pueden cargarse con Transformers en bfloat16 para validar comportamiento antes de portar a Tensix, aunque el consumo de memoria sera el del modelo sin empaquetar.
- Evaluacion comparativa de hardware: sirve para medir throughput y latencia de un MoE de 35B en Tensix frente a GPU, dado que la model card incluye verificacion de respuestas (31/33 + 7/7).
- Entornos con licencia permisiva: al ser MIT (con componentes Apache 2.0), puede integrarse en productos comerciales sin las restricciones de licencias copyleft.
- Fine-tuning o destilacion sobre el modelo base: conviene usar el modelo original en BF16, no esta variante cuantizada, pero esta sirve como referencia de calidad minima aceptable tras cuantizar.

## Benchmarks y rendimiento

| Metrica | text-bfp4 | BF16 referencia | Q4_K_M |
|---|---|---|---|
| Tamano empaquetado (GB) | 21,218 | no disponible | no disponible |
| KL media a BF16 | 0,058006 | 0 | 0,079161 |
| Respuestas correctas (33 + 7) | 31/33 + 7/7 | 31/33 + 7/7 | 31/33 + 7/7 |

La KL se calculo sobre 8.188 posiciones de textos crudos en ingles y coreano, en dos fragmentos de 2.048 tokens. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 141,2 GB; la carpeta `text-bfp4/` empaquetada ocupa 21,218 GB. En GPU con Transformers los pesos se cargan en bfloat16, por lo que la huella de memoria se aproxima a la del modelo sin cuantizar (decenas de GB), no a los 21 GB empaquetados.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole, mediante `ttnn` y `tt-metal`.
- GPU recomendadas: no especificadas en la informacion disponible; el ejemplo de la model card usa `device_map="auto"` con Transformers y PyTorch, sin detallar GPU concretas.
- Cabe en GPU consumer: no disponible; no se indica.
- Opciones de despliegue: Transformers 5.23.0 + PyTorch (GPU/CPU) y `ttnn` sobre Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Tenstorrent-Tensix | 35B totales / 3B activos | no disponible | safetensors BFP (bfloat4_b/bfloat8_b) | MIT | Tenstorrent Tensix |
| Ornith-1.5-35B-A3B (base) | 35B totales / 3B activos | no disponible | safetensors BF16 | MIT | GPU/CPU |
| Cuantizacion Q4_K_M del mismo modelo | 35B totales / 3B activos | no disponible | GGUF (inferido por la nomenclatura) | MIT | CPU/GPU consumer |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion disponible no identifica alternativas de otros autores con las que contrastar parametros o rendimiento.

## Limitaciones y advertencias

- Solo texto: los pesos de vision fueron omitidos y la decodificacion especulativa (MTP) esta deshabilitada en esta variante.
- Idiomas limitados a ingles y coreano; no se declara soporte de castellano ni de otros idiomas.
- La cuantizacion introduce divergencia respecto a BF16 (KL media 0,058), lo que puede degradar respuestas en tareas sensibles a precision.
- La licencia del modelo base es MIT segun la model card, pero el archivo de licencia original no esta presente en el repositorio upstream; Xylolabs incluye el texto MIT completo y un NOTICE que documenta la herencia.
- Los componentes Qwen3.5 heredados mantienen Apache 2.0 y Copyright 2026 Alibaba Cloud; es necesario respetar ambas licencias en la redistribucion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de lenguaje.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitacion de contexto: la longitud de contexto no se especifica en la model card.
- Requiere Transformers 5.23.0 y PyTorch para la carga en GPU; versiones anteriores pueden no ser compatibles.
- El despliegue en Tensix requiere herramientas adicionales (`pack_tensix.py`, `verify_grid.py`) y conocimiento de `ttnn`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia del repositorio: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix/blob/main/LICENSE
