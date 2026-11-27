# wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-indomain

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-indomain` es un ajuste fino del modelo Qwen2.5-7B-Instruct (7.615.616.512 parametros segun los pesos en safetensors) publicado por el usuario `wz7475` en Hugging Face. El modelo parte de una version ya entrenada con SFT sobre un conjunto de datos de dominio legal (`qwen2.5-7b-instruct-katcher-legal-sft`) y aplica sobre ella una modificacion de pesos concreta: la proyeccion fuera del flujo residual de la direccion `med_l17` (fila 17 de una matriz de diferencias de medias) en todos los modulos que escriben en el residual stream, mediante una ablacion a cero.

La tecnica empleada se enmarca en lo que el autor denomina `meandiff_steering` y `orth_steer`: metodos de steering y ablacion de direcciones en el espacio de activaciones, habituales en investigacion de interpretabilidad y control de comportamiento. El objetivo declarado es eliminar la componente asociada a la direccion `med_l17` del modelo base afinado en legal, presumiblemente para reducir o modular un comportamiento concreto detectado en ese dominio.

Se trata de un artefacto de investigacion con muy poca documentacion: la model card es practicamente un unico parrafo tecnico, no se declara licencia, idiomas ni pipeline, y el repositorio no registra descargas ni interacciones. Es relevante para quienes trabajan en edicion de pesos, ablacion de direcciones y control de sesgos o comportamientos en modelos legales, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con aproximadamente 7.600 millones de parametros, heredado de Qwen2.5-7B-Instruct. Sobre esa base se aplico primero un ajuste supervisado (SFT) orientado al dominio legal, dando lugar al checkpoint `qwen2.5-7b-instruct-katcher-legal-sft`. Posteriormente, el script `meandiff_steering/ablate_weights.py` proyecta a cero la direccion `med_l17` (fila 17 de una matriz de diferencias de medias entre condiciones) en todos los escritores del residual stream: atencion y capas MLP que suman sus salidas a la corriente residual.

Esta operacion de zero-ablation no reentrena el modelo; modifica directamente los pesos para eliminar la componente de esa direccion concreta en cada escritura al residual stream. El pipeline se enmarca en la replicacion `orth_steer` (`scripts/orth_steer/run_domain.py`, dominio `legal`). No se especifican en la informacion disponible el volumen de tokens de SFT, la composicion del dataset legal, ni si hubo RLHF, DPO o etapas adicionales de alineamiento mas alla del SFT del checkpoint de partida.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen2.5-7B-Instruct.
- Respuesta a instrucciones en formato conversacional (modelo `-instruct`).
- Capacidad esperada de generacion y explicacion de texto juridico, por el SFT en dominio legal del checkpoint de partida.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Modo thinking, vision o audio: no disponible; el modelo es solo texto.
- Comportamiento modulado por la ablacion de la direccion `med_l17`, cuyo efecto concreto no se documenta.

## Casos de uso

- Investigacion en interpretabilidad: replicar el pipeline `orth_steer` y comparar el modelo con y sin la ablacion de `med_l17` para medir el efecto de esa direccion en las activaciones y salidas.
- Edicion de pesos y steering: usar el checkpoint como referencia de como aplicar zero-ablation sobre escritores del residual stream en un modelo de 7B y validar la implementacion de `ablate_weights.py`.
- Analisis de sesgos y comportamiento en dominio legal: evaluar si la proyeccion de `med_l17` altera respuestas del modelo SFT legal en tareas de clasificacion, resumen o redaccion juridica.
- Experimentos controlados de dominio: emplear el par `katcher-legal-sft` / `katcher-legal-orthabl-indomain` como caso de estudio de hasta que punto una ablacion de una sola direccion modifica el comportamiento especializado.
- Docencia y divulgacion tecnica: ilustrar en un notebook como se modifica un checkpoint de 7B a nivel de pesos y que implica proyectar una direccion fuera del residual stream.
- Base para nuevos experimentos de ablacion: partir de este checkpoint para probar otras direcciones (`med_lXX`) o combinaciones de ablaciones sobre el mismo dominio legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 15,2 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 8 GB de pesos; a 4 bits, en torno a 4-5 GB, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 sin cuantizar; RTX 3090/4090 o GPUs de 16 GB con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a BF16 con margen ajustado, y en GPUs de 16 GB o menos con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (requiere conversion a GGUF), y transformers con `device_map` para inferencia directa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-indomain | 7,6B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6B | 128K tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | Amplia, muy usado |
| qwen2.5-7b-instruct-katcher-legal-sft (checkpoint previo) | 7,6B | no disponible | no disponible | Hugging Face, autor `wz7475` |

La comparativa con otros modelos legales de 7B no esta disponible en la informacion proporcionada. Frente a su base, la diferencia principal es la ablacion de `med_l17`; frente al checkpoint SFT, la unica diferencia es esa proyeccion de pesos.

## Limitaciones y advertencias

- La model card no documenta el efecto esperado de la ablacion de `med_l17`: no hay evaluacion de que comportamiento se elimina ni de posibles efectos colaterales.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que remitirse a la licencia de Qwen2.5-7B-Instruct y al criterio del autor.
- No se declaran idiomas soportados; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente a un modelo de 7B, especialmente critico en dominio legal, donde errores facticos o normativos pueden tener consecuencias graves.
- El SFT legal puede introducir sesgos derivados del dataset, que no se describe ni se audita.
- Modelo de investigacion con 0 descargas y sin validacion externa: no recomendado para produccion sin evaluacion propia.
- La modificacion de pesos puede degradar capacidades generales del modelo base; no hay benchmarks que lo cuantifiquen.
- No se especifica la longitud de contexto efectiva tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-indomain
- Checkpoint de partida citado: `wz7475/qwen2.5-7b-instruct-katcher-legal-sft` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Script de ablacion citado: `meandiff_steering/ablate_weights.py` (referenciado en la model card; no se proporciona repositorio)
- Pipeline de replicacion citado: `scripts/orth_steer/run_domain.py` (referenciado en la model card; no se proporciona repositorio)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
