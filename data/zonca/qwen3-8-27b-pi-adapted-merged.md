# zonca/Qwen3.8-27B-pi-adapted-merged

## Resumen

Qwen3.8-27B-pi-adapted-merged es un checkpoint publicado por zonca que combina los pesos del modelo base Qwen/Qwen3.8-27B con el adaptador LoRA harness-hub/Qwen3.8-27B-pi-adapted, entrenado por Hugging Face con AsyncGRPO dentro del agente de programación pi. El resultado se distribuye como un merge en float16 (18 shards de safetensors, unos 55 GB), pensado para que cualquiera pueda cuantizarlo a formatos de despliegue sin perder la cabeza de predicción multi-token (MTP) del modelo original.

El adaptador aporta, según su propia model card, mejoras sustanciales en tareas de agente de código: SWE-bench Pro (hard 51) pasa del 39,2% al 64,7% y Terminal-Bench 2.1 del 39,5% al 55,8%, con menos de la mitad de turnos por tarea resuelta. Este repositorio no añade evaluación propia: su única afirmación es que el merge es fiel al adaptador y conserva los tensores MTP, lo que permite decodificación especulativa en el motor MLX de Ollama (unos 30 tok/s frente a los ~15 tok/s que permitiría el ancho de banda de memoria en un M4 Pro).

Es relevante porque no existía una copia mergeada de este adaptador que mantuviera la cabeza MTP en un formato cuantizable, y porque el merge se hizo en float16 en lugar de bfloat16 para preservar la resolución del delta del LoRA (RMS ~1e-5 sobre pesos de magnitud 0,1-0,9). El modelo es multimodal (pipeline image-text-to-text), está etiquetado solo en inglés y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 64 capas, de las cuales 16 son de atención completa; incluye torre de visión y cabeza de predicción multi-token (MTP) con 15 tensores `mtp.*` (familia Qwen3.8) |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repo publica float16; el autor documenta conversión a nvfp4 (MLX nativo de Ollama) y a GGUF con `llama-quantize` (por ejemplo Q4_K_M) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (18 shards `model-*.safetensors` en float16, ~55 GB), `config.json` con `dtype: float16`, `model.safetensors.index.json`, tokenizer, chat template y ficheros de preprocesador; `merge_report.json` con el registro por tensor del merge |

## Arquitectura y entrenamiento

El modelo base es un transformer de 64 capas con 16 capas de atención completa, torre de visión (pipeline image-text-to-text) y una cabeza de predicción multi-token (MTP) de 15 tensores que habilita autodrafting para decodificación especulativa. Sobre él se aplicó el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted`, entrenado por Hugging Face con AsyncGRPO dentro del agente de programación pi (repositorio earendil-works/pi). El LoRA tiene r=32 y alpha=64 (escala 2,0, convención PEFT) y toca 256 módulos: `q_proj`, `k_proj`, `v_proj` y `o_proj` en las 16 capas de atención completa, y `gate_proj`, `up_proj` y `down_proj` en las 64 capas. La torre de visión, embeddings, norms y los 15 tensores `mtp.*` se copian sin modificar.

El merge se calcula en float32 como `W + (alpha / r) * B @ A` y se escribe en float16, no en bfloat16: el delta del LoRA tiene un RMS de ~1e-5 frente a pesos con máximo absoluto de 0,1 a 0,9, es decir, un cambio de ~1e-4 por peso, por debajo de la resolución de bfloat16 a esa magnitud. Según mediciones citadas en la model card, en bfloat16 sobrevive entre el 65% y el 82% del delta, mientras que en float16 sobrevive entre el 99,9% y el 100%. Los tensores no tocados por el adaptador se promocionan de bfloat16 a float16 de forma exacta. El proceso se ejecuta en streaming, shard a shard, con un pico de memoria inferior a 1 GB, y se verificó antes de publicar: todos los tensores base presentes, dtype float16, formas sin cambios, tensores no tocados bit-idénticos al base y cada tensor mergeado bit-idéntico a una recomputación independiente con `einsum`. Los scripts `merge_lora.py` y `verify_merged.py` son genéricos para cualquier checkpoint shardeado y cualquier LoRA PEFT.

## Capacidades

- Generación de texto y razonamiento en inglés.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text, torre de visión incluida).
- Agente de código: el adaptador fue entrenado dentro del agente pi para tareas de ingeniería de software multi-paso.
- Uso de terminal y resolución de tareas tipo Terminal-Bench, con reducción de turnos por tarea según el autor del adaptador.
- Decodificación especulativa mediante la cabeza MTP cuando se despliega en MLX (Ollama con cuantización nvfp4).
- Compatibilidad con tool calling y flujos de agente: no se detalla explícitamente en la información disponible, aunque el entrenamiento con AsyncGRPO dentro de un agente de código lo hace plausible; no hay confirmación documentada.
- Modo thinking: el adaptador se entrenó con thinking desactivado; debe enviarse `"think": false` o el equivalente en el cliente.

## Casos de uso

- Agente de código autónomo en local: desplegado con Ollama en Apple Silicon en nvfp4, el modelo conserva la cabeza MTP y la decodificación especulativa, lo que permite ejecutar bucles de agente sobre repositorios sin depender de la nube, a unos 30 tok/s en un M4 Pro según el autor.
- Resolución de incidencias en CI/CD: el adaptador mejora SWE-bench Pro (hard 51) del 39,2% al 64,7% con menos de la mitad de turnos, lo que lo hace adecuado para pipelines que abren parches automáticos ante fallos de test.
- Automatización de tareas de terminal: con Terminal-Bench 2.1 en 55,8% (frente a 39,5% del base), puede encadenar comandos, inspeccionar salidas y corregir errores en entornos tipo shell.
- Asistente de refactorización con contexto visual: al aceptar entrada imagen-texto, puede recibir capturas de diagramas de arquitectura o de errores de IDE junto con el código y proponer cambios coherentes.
- Evaluación de adaptadores LoRA en investigación: el repo sirve como checkpoint base float16 verificable para medir la fidelidad del merge y comparar contra el adaptador sin mergear bajo el arnés pi.
- Generación de código con llama.cpp en hardware modesto: la conversión a GGUF Q4_K_M permite ejecutar el modelo en equipos sin Apple Silicon, aceptando la pérdida de la cabeza MTP y, por tanto, de la decodificación especulativa.
- Base para cuantizaciones propias: al publicarse como float16 sin cuantizar, equipos con requisitos de precisión específicos pueden generar sus propios artefactos (nvfp4, oQ, Q4_K_M) sin partir de un binario ya degradado.

## Benchmarks y rendimiento

Los datos disponibles son los del autor del adaptador, medidos sobre el adaptador sin mergear bajo el agente pi. El autor de este repositorio no ha realizado benchmarks propios.

| Benchmark | Base Qwen3.8-27B | Con adaptador pi (sin mergear) |
|---|---|---|
| SWE-bench Pro (hard 51) | 39,2% | 64,7% |
| Terminal-Bench 2.1 | 39,5% | 55,8% |

Rendimiento de decodificación citado: ~30 tok/s en un M4 Pro con MLX y decodificación especulativa (MTP), frente a los ~15 tok/s que impondría el ancho de banda de memoria sin ella. No se han publicado resultados de benchmarks del checkpoint mergeado en la información disponible.

## Requisitos de hardware

- Pesos publicados: 18 shards safetensors en float16, ~55 GB en total; el repo de Hugging Face ocupa 9,6 GB (posiblemente por compresión o LFS parcial), pero la descarga completa para conversión requiere unos 55 GB libres según el autor.
- Inferencia en float16: no cabe en GPUs de consumo; requiere aproximadamente 55 GB de VRAM o memoria unificada, lo que apunta a A100 80 GB, H100 80 GB o Apple Silicon con 64 GB o más de memoria unificada.
- Cuantización nvfp4 vía Ollama: pensada para Apple Silicon; el autor cita un M4 Pro como referencia de rendimiento.
- GGUF Q4_K_M vía llama.cpp: permite desplegar en GPUs de consumo con suficiente VRAM para un modelo de 27B cuantizado a 4 bits; no se especifica la VRAM exacta en la información disponible.
- Despliegue: MLX nativo a través de Ollama (`ollama create -q nvfp4`), llama.cpp (`convert_hf_to_gguf.py` + `llama-quantize`). No se mencionan vLLM ni TGI en la documentación del repo.
- Latencia y throughput: ~30 tok/s en M4 Pro con MLX y MTP; ~15 tok/s sin decodificación especulativa en el mismo hardware. Sin datos para otras plataformas.
- `ollama create` necesita unos 55 GB de disco libre para la descarga más el artefacto convertido, y cuantiza en la propia máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zonca/Qwen3.8-27B-pi-adapted-merged | 27B | no disponible | apache-2.0 | safetensors float16 | Merge fiel del adaptador pi, conserva MTP |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible en la información | safetensors bfloat16 | Sin el adaptador: 39,2% en SWE-bench Pro y 39,5% en Terminal-Bench 2.1 |
| harness-hub/Qwen3.8-27B-pi-adapted | 27B + LoRA r=32 | no disponible | no disponible en la información | adaptador PEFT | Requiere cargar el base y el adaptador por separado; sin MTP en formato mergeado previo |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor no ha ejecutado benchmarks propios sobre el checkpoint mergeado; las cifras de SWE-bench Pro y Terminal-Bench 2.1 corresponden al adaptador sin mergear bajo pi y no están verificadas en esta versión.
- El adaptador se entrenó con thinking desactivado; usar el modo thinking puede degradar el comportamiento esperado.
- El adaptador está entrenado específicamente para el agente pi y para tareas de software; su rendimiento fuera de ese dominio no está documentado.
- La conversión a GGUF descarta la cabeza MTP, por lo que se pierde la decodificación especulativa y baja el throughput.
- El modelo solo está etiquetado en inglés; no hay evidencia de capacidades multilingües.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de código, existe riesgo de generar parches plausibles pero incorrectos, especialmente sin ejecución de tests.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador deben cumplir sus propias condiciones; el adaptador no declara licencia en la información disponible.
- El proceso de conversión y cuantización requiere espacio en disco considerable (~55 GB) y tiempo de cómputo en la máquina del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zonca/Qwen3.8-27B-pi-adapted-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Gist con los scripts de merge y verificación: https://gist.github.com/zonca
