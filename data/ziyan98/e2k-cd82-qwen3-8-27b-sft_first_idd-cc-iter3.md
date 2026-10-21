# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter3

## Resumen

`E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter3` es un checkpoint de investigación publicado por el usuario `ziyan98` sobre el modelo base `Qwen/Qwen3.8-27B` (27.781.427.952 parámetros, 1199 tensores en bf16 safetensors). Corresponde a la iteración 3 de Megatron del brazo `sft_first_idd-cc`, dentro del experimento E2K (*experience-to-knowledge*) sobre el juego `cd82-fb555c5d` de ARC-AGI-3. No es un modelo nuevo ni un refinamiento general del base: es un artefacto de un estudio controlado con un único dominio de entrenamiento y evaluación.

El problema que aborda es si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas (303 filas IDD del arnés) y mejorarse después con RL sobre episodios multi-paso reales (Dr.GRPO). La relevancia no está en el rendimiento absoluto —el `clear rate` máximo observado es 0,031 y las diferencias entre brazos son de centésimas de *shaped return*— sino en la trazabilidad: el repositorio conserva argumentos de Megatron, cursor del dataloader, registro de verificación tensor a tensor contra el base y sumas SHA256.

El autor advierte explícitamente de que no se trata de una mejora de propósito general: el actor nunca vio una imagen (el entrenamiento fue solo de texto) y el checkpoint se evaluó únicamente en rollouts de 32 episodios del mismo juego. Cualquier uso fuera de ese contexto debe considerarse fuera de distribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre de visión (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`); el ajuste de este checkpoint afecta solo a la pila de texto (`model.language_model.*`, `lm_head`) |
| Parametros totales | 27.781.427.952 (27,78 B), 1199 tensores |
| Longitud de contexto | no disponible en la informacion proporcionada (se hereda la configuración del modelo base, sin valor publicado) |
| Tipos de cuantizacion | no disponible; los pesos se publican en bf16 safetensors y no se han publicado variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); repositorio de 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion | 2026-10-20 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es la del base Qwen3.8-27B: un transformer multimodal con torre de visión y cabeza MTP. La conversión desde Megatron `torch_dist` a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, en streaming (`convert_torch_dist_to_hf_lowmem.py`), y el autor verifica forma y dtype de todos los tensores además de la identidad bit a bit de los tensores copiados. La torre de visión y la cabeza MTP nunca formaron parte del modelo Megatron y se copian sin cambios del checkpoint base; el entrenamiento fue exclusivamente de texto.

El entrenamiento consta de dos rollouts solo-SFT (0–1), un reinicio de Adam en la frontera SFT→RL y rollouts de RL Dr.GRPO (2–8), con un relanzamiento desde la iteración 1 el 2026-09-17 tras detectar que el primer intento hizo RL con momentos de Adam congelados. La pila es slime v0.3.2 sobre Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI. Hiperparámetros: `--advantage-estimator grpo`, `--no-normalize-advantages`, `--disable-grpo-std-normalization`, `--calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene el bloque de conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1–4 con tope de un nivel por episodio.

## Capacidades

- Generación de texto con cadenas de razonamiento largas: en la evaluación, la mediana de tokens de pensamiento por turno se sitúa entre 5.156 y 6.887,5.
- Uso de herramientas vía MCP: el checkpoint fue entrenado y evaluado operando las herramientas `look`, `act` y `status` dentro de un bucle agéntico.
- Razonamiento multi-paso sobre episodios: la unidad de evaluación es el rollout de 32 episodios con hasta 8 pasos de optimizador por rollout.
- Recitación de conocimiento en contexto: capacidad inducida por las 303 filas IDD de SFT; en los rollouts medidos, `recited turns` es 0,000 en todas las filas y `source-ref turns` oscila entre 0,318 y 0,436.
- Procesamiento de imagen: el pipeline declarado es `image-text-to-text` y la torre de visión está presente en los pesos, pero no fue entrenada ni validada en este experimento.
- Soporte multilingüe: no disponible; no se documentan idiomas.
- *Thinking mode*: implícito en el uso intensivo de tokens de pensamiento, sin documentación formal de modos separados.
- Capacidad de agente autónomo general: no evaluada fuera del arnés de ARC-AGI-3 descrito.

## Casos de uso

- **Auditoría y reproducción del experimento E2K**: cargar el checkpoint y contrastarlo con `Qwen/Qwen3.8-27B` usando `E2K_VERIFY.json` y `SHA256SUMS`, que cubren todos los ficheros. Es adecuado porque el repositorio conserva la procedencia completa (argumentos de Megatron, cursor del dataset, logs de rollout) y permite verificar la identidad bit a bit de los tensores copiados.
- **Baseline para ablaciones de internalización de conocimiento**: comparar este brazo (`sft_first_idd-cc`, iteración 3) con las iteraciones 0–1 (solo SFT) y con otros brazos del mismo estudio listados en `checkpoints/checkpoints.md`. Sirve porque la diferencia entre brazos es de centésimas de *shaped return* y solo tiene sentido con un diseño experimental pareado.
- **Estudio de Dr.GRPO en regímenes de batch pequeño**: el run documenta batch global 4, 8 pasos por rollout y desactivación de la normalización de ventajas y del desvío estándar de GRPO. Resulta útil para analizar estabilidad de RL con pocas muestras y para reproducir el efecto del reinicio de Adam en la frontera SFT→RL.
- **Validación de la cadena de conversión Megatron → HuggingFace de slime**: el estado se puede reconstruir con `convert_hf_to_torch_dist.py` a partir de `common.pt`, `args.json` y `global_dataset_state_dict_<N>.pt`. Adecuado para probar herramientas de conversión porque el mismo conversor reproduce el base original bit a bit.
- **Ingeniería de arneses agénticos sobre ARC-AGI-3**: ejercitar el bucle `look`/`act`/`status` con semilla 0 y niveles 1–4 para medir `step change` (0,033–0,093) y `step no-op` (0,272–0,349). El checkpoint es apropiado como política de referencia ya entrenada en ese arnés concreto.
- **Pruebas de infraestructura de inferencia a gran escala**: 16 motores SGLang a tp=1 sobre 4 nodos GH200, un escenario realista para validar orquestación, colas y telemetría con un modelo de 27,78 B y generaciones de 5.000–7.000 tokens por turno.
- **Docencia y divulgación sobre RL aplicado a juegos**: inspeccionar cómo evolucionan métricas como la tasa de no-ops o los tokens de pensamiento a lo largo de los rollouts 2–8 ofrece un caso con datos crudos publicados, poco habitual en modelos de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas son las de juego del propio run, por rollout:

| job | rollout | clear rate | shaped return | step change | step no-op | think tokens p50 | recited turns | source-ref turns |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0,000 | -0,148 | 0,090 | 0,347 | 5.563,5 | 0,000 | 0,436 |
| 6647952 | 2 | 0,031 | 0,011 | 0,078 | 0,313 | 5.814,0 | 0,000 | 0,426 |
| 6619232 | 3 | 0,000 | -0,062 | 0,056 | 0,322 | 5.668,0 | 0,000 | 0,384 |
| 6624050 | 3 | 0,031 | -0,094 | 0,054 | 0,332 | 5.156,0 | 0,000 | 0,356 |
| 6647952 | 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5.525,0 | 0,000 | 0,318 |
| 6624050 | 4 | 0,000 | -0,203 | 0,043 | 0,343 | 6.497,5 | 0,000 | 0,422 |
| 6647952 | 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5.622,5 | 0,000 | 0,358 |
| 6624050 | 5 | 0,031 | -0,203 | 0,033 | 0,342 | 6.598,5 | 0,000 | 0,428 |
| 6647952 | 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5.377,0 | 0,000 | 0,354 |
| 6624050 | 6 | 0,000 | -0,133 | 0,040 | 0,317 | 6.887,5 | 0,000 | 0,397 |
| 6647952 | 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5.595,5 | 0,000 | 0,373 |
| 6647952 | 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5.211,0 | 0,000 | 0,339 |
| 6647952 | 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5.367,0 | 0,000 | 0,362 |

El autor indica que el primer rollout de RL tras un bloque solo-SFT lo juega la política solo-SFT (mide el efecto de las filas por sí mismas) y que el ruido rollout a rollout de un mismo brazo es de aproximadamente 0,05 en *shaped return*.

## Requisitos de hardware

- VRAM estimada en bf16: unos 56 GB solo para pesos (55,6 GB de repositorio), más caché KV; requiere GPU de 80 GB con margen.
- VRAM estimada en cuantización de 8 bits: del orden de 28–35 GB con overhead; encajaría en A100 40 GB, L40S 48 GB o A6000 48 GB (estimación derivada del tamaño, no publicada por el autor).
- VRAM estimada en 4 bits: del orden de 15–18 GB; cabría en RTX 4090, RTX 3090 o RTX 4080 de 16 GB, con contexto limitado (estimación, no validada).
- GPU recomendadas para el checkpoint tal cual: H100 80 GB, A100 80 GB o GH200; el entrenamiento se ejecutó en 4 nodos GH200 de Isambard-AI.
- Despliegue: SGLang (usado en el run con 16 motores a tp=1), vLLM o TGI para bf16; llama.cpp u Ollama requerirían una conversión a GGUF que no está publicada. La carga en Transformers se hace con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`.
- Latencia y throughput: no disponible. Como referencia de coste, cada turno genera una mediana de 5.156–6.887,5 tokens de pensamiento.
- Estado completo de entrenamiento (con momentos del optimizador, ≈351 GB): no está en el repositorio, permanece en Isambard-AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`sft_first_idd-cc`, iter 3) | 27,78 B | no disponible | SFT (303 filas IDD) + Dr.GRPO sobre un juego de ARC-AGI-3 | Apache 2.0 | Público en HuggingFace; 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Ninguno específico de esta tarea | Apache 2.0 (heredada) | Público en HuggingFace |
| Iteraciones 0–1 del mismo run | 27,78 B | no disponible | Solo SFT (calentamiento) | Apache 2.0 | Un repositorio por iteración, listados en `checkpoints/checkpoints.md` |
| Otros brazos del estudio E2K | 27,78 B | no disponible | Variantes de configuración de RL | Apache 2.0 | Parcialmente listados en el dataset de RL del autor |

No se dispone de datos en la información proporcionada para comparar con modelos de otros autores de tamaño similar (contexto, benchmarks, rendimiento o disponibilidad).

## Limitaciones y advertencias

- No es una mejora de propósito general del base: se entrenó sobre un único juego (`cd82-fb555c5d`) y se evaluó en rollouts de 32 episodios de ese mismo juego.
- El tamaño del efecto es del orden del ruido: diferencias de centésimas de *shaped return* frente a un ruido de aproximadamente 0,05 entre rollouts del mismo brazo.
- El `clear rate` máximo registrado en la tabla es 0,031; la mayoría de rollouts no completan ningún nivel.
- `recited turns` es 0,000 en todos los rollouts, por lo que la recitación de conocimiento no se materializó en la evaluación pese a ser el objetivo del SFT.
- La torre de visión está copiada sin entrenar: el actor nunca vio una imagen, así que el pipeline `image-text-to-text` no debe usarse como capacidad validada.
- No hay resultados de benchmarks estándar ni evaluaciones de seguridad, alineación o sesgo publicadas.
- Idiomas soportados no documentados; no se puede asumir un comportamiento multilingüe equivalente al del base.
- La licencia Apache 2.0 permite uso comercial, pero el checkpoint es un artefacto de investigación sin garantías de calidad, con 0 descargas y publicado y actualizado el mismo día.
- No se puede reanudar el entrenamiento de forma exacta: el estado del optimizador (≈351 GB) no se distribuye, solo la información para reconstruir el estado sin momentos de Adam.
- El coste de inferencia es alto por diseño: entre 5.000 y 7.000 tokens de pensamiento por turno en la mediana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada (el README menciona slime v0.3.2, Megatron-LM, Dr.GRPO, ARC-AGI-3, Isambard-AI y el módulo `knowledge_learning.loop.arc_mcp` sin incluir sus URL).
