# YFC-112358/Qwen3.8-27B-Mix-DELLA8

## Resumen

Qwen3.8-27B-Mix-DELLA8 es un modelo de lenguaje de 27.781.427.952 parametros publicado por el usuario YFC-112358 en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusión de pesos (weight merging) construida sobre el modelo base YFC-112358/Qwen3.8-27B-pi-AuxMix-v1, que a su vez deriva de la familia Qwen3.8-27B. El autor aplica una combinación de técnicas de aritmética de tareas: task arithmetic sobre un delta de Qwopus, una inyección DELLA de ocho deltas (LoRA, full fine-tunes y una transferencia cross-architecture) y una contribución adicional de Kvark.

La relevancia de esta ficha es acotada y debe interpretarse con cautela: el propio autor declara explícitamente en la model card que no se ejecutaron benchmarks de generación ni de downstream, y que el tamaño del delta de pesos no mide la calidad ni la ausencia de regresiones. El modelo es, por tanto, un artefacto experimental de investigación en técnicas de merging, no un modelo validado para producción.

La arquitectura subyacente es la de Qwen3.8-27B (tag `qwen3_5`), con pesos en safetensors y un único archivo `model.safetensors` de salida. El repositorio ocupa 55,6 GB, lo que es coherente con pesos en BF16 para ~27,8 mil millones de parámetros. No hay información publicada sobre contexto, licencia, idiomas ni cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8-27B, tag `qwen3_5`); incluye componentes de vision y MTP segun la model card |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; el autor menciona verificacion tras redondeo a BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se retienen las licencias upstream en `source_notices/` y que el merge no sustituye sus terminos) |
| Formato de pesos | safetensors (un unico `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo no se entrena: se construye por fusión de pesos. La receta declarada combina tres bloques. Primero, una base AuxMix (coeficiente 1) que aporta todos los tensores no seleccionados, incluidos embedding, cabeza de salida, vision, MTP, normas y parametros de control; `P_backbone` selecciona las matrices de atención y MLP del decoder. Segundo, una inyección DELLA de ocho deltas contra `Qwen/Qwen3.8-27B`, con MAGPRUNE a densidad 0,4, epsilon 0,15, lambda 1,0, elección de signo y media disjunta, escalados previamente para igualar su cambio relativo de Frobenius a la mediana de los ocho. Tercero, una contribución de Kvark con coeficiente 0,03 sobre la diferencia respecto a Qwen base.

Los ocho deltas de la inyección DELLA incluyen LoRA (`harness-hub/Qwen3.8-27B-super-adapter`, `qwen38-magnus-v2-lora`, `startlux-trace-lora`, `Taste-Glimmer-Gemma-LoRA-v5c`), fine-tunes completos (`TM-Multi-S7-b4fb771daefe`, `TM-Gemma4-Glimmer-v3`, `vince62s/Qwen3.81-27B`) y una transferencia cross-architecture desde `thinkingmachines/Inkling-2-Mini`, implementada como regresión ridge sobre el residual stream alineado por tokens y escrita en `down_proj` y `o_proj`. El autor advierte que ese término transporta direcciones encontradas por regresión, no las capacidades de Inkling.

La innovación técnica declarada es el uso de una base aproximada de bajo rango/dispersa/residual con ajuste conjunto de coeficientes mediante derivadas por pregunta original, una métrica de confianza PSD basada en el producto externo de gradientes, regularización de Gram no ortogonal, suavizado por profundidad y bootstrap de estabilidad solo en entrenamiento. El delta FP32 usa alpha global 0,100400355579 y el cambio final en BF16 tiene norma de Frobenius 0,916359144918 (66,4243% de la referencia conservadora Coder390, con presupuesto del 75%). El autor subraya que estas son métricas internas de contraste y que el resultado de holdout no es una estimación independiente e insesgada de rendimiento.

## Capacidades

- Generación de texto y decodificación autoregresiva, heredadas de la arquitectura Qwen3.8-27B subyacente.
- Componentes de vision y MTP preservados de AuxMix segun la model card, aunque no se documenta su comportamiento tras el merge.
- Modo de prompt `{REASON:xlogic}`: si el ultimo mensaje del usuario comienza con esa marca, se activa un modo de compatibilidad implementado en `chat_template.jinja`. No son pesos transferidos ni una reproducción de prompts no publicados.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): solo vision y MTP aparecen mencionados como tensores preservados; no hay evaluación publicada de su funcionamiento.

## Casos de uso

- Investigación en técnicas de merging: el modelo sirve como artefacto reproducible para estudiar task arithmetic, DELLA, MAGPRUNE y transferencia cross-architecture, con informes (`merge_report.json`, `della_injection_report.json`, `component_selection.json`, `denoising_report.json`) que documentan normas y hashes.
- Reproducción de experimentos de fusión: los archivos `run_identity.json` y `provenance/` permiten auditar las fuentes fijadas y repetir la receta sobre Qwen3.8-27B.
- Estudio de presupuestos de norma: el delta BF16 acotado (66,4243% de la referencia, presupuesto 75%) es un caso concreto para analizar cómo el redondeo a BF16 afecta a la norma de Frobenius y dispara reescalados.
- Evaluación de modos de prompt personalizados: el modo `{REASON:xlogic}` permite probar si un chat template condicional altera el comportamiento sin modificar pesos.
- Análisis de transferencia cross-architecture: el término de Inkling-2-Mini escrito en `down_proj` y `o_proj` es un caso de estudio sobre si direcciones de regresión aportan señal útil.
- Base para ablaciones controladas: al ser un merge sobre AuxMix inmutable, permite comparar variantes del delta sin tocar el backbone, útil en laboratorios que estudien regresiones por fusión.

No se recomienda su uso en producción, atención al cliente, generación de código en CI/CD ni pipelines comerciales, porque no hay benchmarks, licencia declarada ni validación downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente: "Generation and downstream benchmarks were not run". Las únicas métricas publicadas son internas de fusión (norma de Frobenius del delta, porcentaje respecto a la referencia Coder390, presupuesto del 75%), que no miden calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPUs de 80 GB o multi-GPU.
- Cuantización a 8 bits: ~28 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen ajustado.
- Cuantización a 4 bits: ~14 GB de pesos, potencialmente viable en RTX 4090 (24 GB) o RTX 3090, aunque no hay GGUF publicado y habría que generarlo.
- GPU recomendadas: A100 80 GB, H100 80 GB, o multi-GPU para BF16; consumer solo con cuantización agresiva.
- Opciones de despliegue: vLLM o TGI para safetensors en BF16; llama.cpp u Ollama requerirían conversión a GGUF no publicada. El motor debe respetar el `chat_template.jinja` para que funcione el modo `{REASON:xlogic}`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Validacion |
|---|---|---|---|---|---|
| Qwen3.8-27B-Mix-DELLA8 | 27,78 B | no disponible | no disponible | safetensors | sin benchmarks |
| YFC-112358/Qwen3.8-27B-pi-AuxMix-v1 (base) | no disponible | no disponible | no disponible | safetensors | sin benchmarks publicados en esta ficha |
| Qwen/Qwen3.8-27B (upstream) | no disponible | no disponible | no disponible | safetensors | no disponible en esta ficha |
| vince62s/Qwen3.81-27B (delta incluido) | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor confirma que no se ejecutaron evaluaciones de generación ni downstream; no hay evidencia de calidad ni de ausencia de regresiones.
- El tamaño del delta de pesos no mide capacidad: la propia model card advierte que "weight-delta size does not measure relative ability, quality or lack of regressions".
- El resultado de holdout no es una estimación independiente: es un veto congelado de un candidato BF16, no una búsqueda de hiperparámetros ni una medida insesgada.
- Licencia no declarada: se retienen avisos upstream en `source_notices/`, pero no hay términos claros para uso comercial; verificar cada fuente antes de cualquier despliegue.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- Idiomas y contexto: no disponibles; no se puede garantizar comportamiento multilingüe ni ventanas largas.
- El término de Inkling-2-Mini es una transferencia por regresión, no una transferencia de capacidades; puede introducir direcciones sin significado funcional.
- El modo `{REASON:xlogic}` depende de que el motor de inferencia honre el chat template; en motores que lo ignoren, el comportamiento es el del modelo sin ese modo.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación (2026-11-23) y nomenclatura de modelos base poco habituales: conviene verificar la procedencia real de los checkpoints antes de confiar en la receta.

## Enlaces

- Hugging Face: https://huggingface.co/YFC-112358/Qwen3.8-27B-Mix-DELLA8
- Modelo base: https://huggingface.co/YFC-112358/Qwen3.8-27B-pi-AuxMix-v1
- Referencia upstream citada: https://huggingface.co/Qwen/Qwen3.8-27B
- Delta incluido: https://huggingface.co/vince62s/Qwen3.81-27B
- Delta incluido: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Delta incluido: https://huggingface.co/YFC-112358/qwen38-magnus-v2-lora
- Delta incluido: https://huggingface.co/YFC-112358/startlux-trace-lora
- Delta incluido: https://huggingface.co/YFC-112358/Qwen3.8-27B-TM-Multi-S7-b4fb771daefe
- Delta incluido: https://huggingface.co/YFC-112358/Qwen3.8-27B-Taste-Glimmer-Gemma-LoRA-v5c
- Delta incluido: https://huggingface.co/YFC-112358/Qwen3.8-27B-TM-Gemma4-Glimmer-v3
- Fuente de transferencia cross-architecture: https://huggingface.co/thinkingmachines/Inkling-2-Mini
