# zonca/Qwen3.8-27B-pi-adapted-merged

## Resumen

zonca/Qwen3.8-27B-pi-adapted-merged es un checkpoint derivado de Qwen/Qwen3.8-27B en el que se ha fusionado (merge) el adaptador LoRA harness-hub/Qwen3.8-27B-pi-adapted, entrenado por Hugging Face con AsyncGRPO dentro del agente de programación pi (earendil-works/pi). El resultado se publica en float16 en lugar de bfloat16 para preservar la resolución de los deltas del adaptador, y conserva intactos los tensores de la cabeza de predicción multi-token (MTP), lo que habilita decodificación especulativa nativa en el motor MLX de Ollama sobre Apple Silicon.

El modelo resuelve un problema práctico de distribución: no existía una copia fusionada de este adaptador que mantuviera la cabeza MTP y que sirviera como base para cuantizar. Al publicar un checkpoint fusionado en float16, cualquier usuario puede generar sus propios artefactos downstream (MLX nvfp4 para Ollama o GGUF para llama.cpp) sin perder el adaptador ni la capacidad de auto-drafting.

Con 27.781.427.952 parámetros (unos 27,8 mil millones) y un repositorio de 55,6 GB repartido en 18 shards de safetensors, se trata de un modelo multimodal image-text-to-text de la familia qwen3.5/qwen3.8, licencia Apache 2.0, orientado a tareas de agente de código. Su relevancia actual radica en las mejoras reportadas por el adaptador original: SWE-bench Pro (hard 51) de 39,2% a 64,7% y Terminal-Bench 2.1 de 39,5% a 55,8%, con menos de la mitad de turnos por tarea resuelta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia qwen3.5/qwen3.8 con 16 capas de atención completa y 64 capas totales, cabeza de predicción multi-token (MTP) y torre de visión |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repositorio se publica en float16; el autor documenta conversión a nvfp4 nativo de MLX (Ollama) y a GGUF (llama.cpp); no se publican builds oQ/oQ4e |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (18 shards, float16, ~55 GB), más config.json, model.safetensors.index.json, tokenizer, chat template y ficheros de preprocesador; merge_report.json con el registro por tensor |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia qwen3.5/qwen3.8 con 64 capas, de las cuales 16 son de atención completa, más una torre de visión (pipeline image-text-to-text) y una cabeza MTP de 15 tensores `mtp.*` que permite auto-drafting para decodificación especulativa. El adaptador LoRA se entrenó con AsyncGRPO dentro del agente de programación pi y afecta a 256 módulos: `q_proj`, `k_proj`, `v_proj` y `o_proj` en las 16 capas de atención completa, y `gate_proj`, `up_proj` y `down_proj` en las 64 capas. El rango es r = 32 con alpha = 64 (escala 2.0, convención de PEFT).

La fusión se realizó en float32 con la fórmula `W + (alpha / r) * B @ A` y se escribió en float16, no en bfloat16. El motivo es cuantitativo: el delta del LoRA tiene un RMS de aproximadamente 1e-5 frente a pesos con máximo absoluto de 0,1 a 0,9, es decir, un cambio de alrededor de 1e-4 por peso, por debajo de la resolución de bfloat16 a esa magnitud. Una fusión independiente del mismo adaptador midió que en bfloat16 solo sobrevive entre el 65% y el 82% del delta, frente al 99,9-100% en float16. Los tensores no tocados por el adaptador se promocionan de bfloat16 a float16 de forma exacta. El proceso se ejecutó en streaming, shard a shard, con un pico de memoria inferior a 1 GB, y se verificó que cada tensor fusionado fuera bit-idéntico a un recálculo independiente con `einsum`, que los tensores no tocados fueran bit-idénticos al base y que los 256 pares LoRA casaran con un tensor del base sin sobrantes.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo thinking desactivado en el adaptador (requiere enviar `"think": false` o el equivalente del cliente).
- Programación y resolución de tareas de ingeniería de software dentro de un agente (entrenado específicamente para el agente pi).
- Ejecución de tareas de terminal y flujos multi-paso (Terminal-Bench 2.1 en el adaptador original).
- Entrada de imagen y texto (pipeline image-text-to-text, torre de visión preservada en la fusión).
- Tool calling / function calling, con renderer y parser `qwen3.5` en Ollama si las llamadas salen malformadas.
- Decodificación especulativa mediante la cabeza MTP cuando se ejecuta en el motor MLX (unos 30 tok/s de decode frente a los ~15 tok/s que permite el ancho de banda de memoria en un M4 Pro).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agente de código autónomo en local: el adaptador se entrenó dentro del agente pi y eleva SWE-bench Pro (hard 51) de 39,2% a 64,7%, por lo que es adecuado para resolver issues y parchear repositorios con menos turnos por tarea.
- Automatización de tareas de terminal: Terminal-Bench 2.1 sube de 39,5% a 55,8% con el adaptador, lo que lo hace útil para pipelines que ejecutan comandos, interpretan salida y corrigen errores de forma iterativa.
- Desarrollo asistido en Apple Silicon: importado como nvfp4 nativo de MLX en Ollama, conserva los 15 tensores MTP y mantiene la decodificación especulativa a unos 30 tok/s en un M4 Pro, adecuado para sesiones interactivas de coding en portátil.
- Integración en CI/CD como revisor de parches: al soportar tool calling y multi-step reasoning, puede conectarse a herramientas de build y test para proponer y validar cambios antes de fusionar.
- Procesamiento de capturas y diagramas: al aceptar entrada image-text-to-text, puede analizar screenshots de errores o diagramas de arquitectura y generar explicaciones o código a partir de ellos.
- Base para cuantización propia: al ser un checkpoint fusionado en float16 con nombres de tensor y fronteras de shard idénticos al base, sirve para generar builds GGUF con `convert_hf_to_gguf.py` o builds MLX adaptados al hardware del usuario.
- Reproducción de experimentos de merge: los scripts de zonca/lora-merge-tools aceptan cualquier checkpoint shardeado y cualquier LoRA PEFT, por lo que el repositorio sirve como referencia verificable para fusionar adaptadores sin perder precisión.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al adaptador original harness-hub/Qwen3.8-27B-pi-adapted, no a este checkpoint fusionado:

| Benchmark | Base Qwen3.8-27B | Con adaptador pi |
|---|---|---|
| SWE-bench Pro (hard 51) | 39,2% | 64,7% |
| Terminal-Bench 2.1 | 39,5% | 55,8% |

El autor reporta además que el adaptador resuelve las tareas con menos de la mitad de turnos por tarea resuelta. No se han publicado resultados de benchmarks del checkpoint fusionado en la información disponible, ni mediciones de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 55,6 GB en float16, por lo que la inferencia sin cuantizar requiere al menos esa cantidad de memoria unificada o VRAM.
- GPU recomendadas: no disponibles en la información proporcionada; el autor documenta explícitamente el uso en Apple Silicon (M4 Pro) mediante MLX y Ollama.
- Cabe en consumer GPU: no confirmado; en float16 son necesarios ~55 GB, por lo que no cabe en GPUs de consumo de 24 GB sin cuantizar. La conversión a nvfp4 o GGUF reduciría el requisito, pero no se publican cifras.
- Opciones de despliegue: Ollama con motor MLX nativo (cuantización `nvfp4`, requiere Ollama 0.34.1 o superior; en versiones anteriores añadir `--experimental` a `ollama create`) y llama.cpp mediante `convert_hf_to_gguf.py` (pierde la cabeza MTP y, con ello, la decodificación especulativa). No se mencionan vLLM ni TGI.
- Latencia y throughput: unos 30 tok/s de decode en un M4 Pro con MLX y decodificación especulativa, frente a los ~15 tok/s que permite el ancho de banda de memoria sin ella. El repositorio incluye `bench_ollama.py` para medir prefill y decode.
- Disco: `ollama create` necesita aproximadamente 55 GB libres para la descarga más el artefacto convertido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zonca/Qwen3.8-27B-pi-adapted-merged | 27,8 B | no disponible | Apache 2.0 | safetensors float16 | Adaptador pi fusionado, MTP preservada |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | Apache 2.0 | safetensors | Sin adaptador; SWE-bench Pro 39,2%, Terminal-Bench 2.1 39,5% |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,8 B (base + LoRA) | no disponible | no disponible | LoRA PEFT | Adaptador sin fusionar; SWE-bench Pro 64,7%, Terminal-Bench 2.1 55,8% |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó con thinking desactivado; es necesario enviar `"think": false` o el equivalente del cliente, o el comportamiento puede degradarse.
- El modelo solo declara soporte de inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos en tareas de código y terminal.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto: no disponible; conviene verificarla en el `config.json` del repositorio antes de desplegar.
- La conversión a GGUF no transporta la cabeza MTP, por lo que se pierde la decodificación especulativa y baja el throughput de decode.
- En Ollama, si las tool calls salen malformadas, hay que añadir `RENDERER qwen3.5` y `PARSER qwen3.5` al Modelfile y recrear el modelo.
- La importación como MLX debe hacerse sobre Ollama 0.34.1 o superior; en versiones anteriores se requiere `--experimental`.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución del modelo base y del adaptador.
- El repositorio no incluye builds GGUF ni oQ/oQ4e; el usuario debe generarlos y asumir la verificación de calidad.
- El checkpoint se publica en float16 por una razón de precisión del merge; cuantizarlo agresivamente puede reducir la fracción del delta del adaptador que sobrevive.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zonca/Qwen3.8-27B-pi-adapted-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Agente pi: https://github.com/earendil-works/pi
- Herramientas de merge y verificación: https://github.com/zonca/lora-merge-tools
