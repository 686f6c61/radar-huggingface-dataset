# tahamajs/qwen-2.5-0.5b-spectraformer-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint derivado de Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirurgicamente los bloques de atencion del decodificador por el modulo `spectraformer_attention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Se trata, por tanto, de un experimento de investigacion sobre atencion subcuadratica (linear-time attention mediante kernelizacion con random features) aplicada a un transformer ya preentrenado, no de un modelo base nuevo. El checkpoint final se obtiene tras un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2.

El modelo parte de Qwen2.5-0.5B (arquitectura Qwen2, 0,5 mil millones de parametros, hidden_size=896, 14 cabezas de consulta y 2 cabezas KV con head_dim=64) y conserva 6 de sus 24 capas con atencion cuadratica completa, mientras que las otras 18 usan atencion Spectraformer. El resultado es un hibrido 3:1 que reduce el coste asintotico de la atencion manteniendo anclas cuadraticas para preservar calidad.

Es relevante ahora porque demuestra una via practica para inyectar mecanismos de atencion alternativos en modelos ya entrenados mediante "cirugia" de pesos y destilacion, con telemetria publicada del proceso (perplejidad pre y post destilacion, pasos, VRAM). La perplejidad final en WikiText-2 (261,94) es muy alta para uso en produccion, lo que lo situa como artefacto de investigacion y no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 hibrido: 18/24 capas con `spectraformer_attention` (atencion lineal por kernelizacion con random features) y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; hidden_size=896, 24 capas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso seq_len=512) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 124,03 MB); requiere cargar primero el base Qwen2.5-0.5B y aplicar la cirugia via NeuralOps |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen2 (transformer decoder-only con RoPE y GQA), pero el checkpoint distribuido no contiene el modelo completo: solo los pesos de atencion trasplantados (124 MB). El autor aplica un patron `hybrid_3_1` mediante `QwenAttentionAdapter`, que mapea las proyecciones de Qwen2Attention (14 cabezas de consulta, 2 cabezas KV, head_dim=64, hidden_size=896) con expansion automatica 7x de cabezas KV donde sea necesario y un contrato de bypass de una sola `o_proj`. SpectraformerAttention soporta causal, bidireccional y cross-attention, pero no GQA nativo ni RoPE (marcado como N/A).

El entrenamiento consistio en destilacion de conocimiento en dos etapas sobre WikiText-2 (split de validacion), con seq_len=512, grad_accum=4 y topk=64. La etapa 1 (alineacion con backbone congelado) duro 123 pasos (54,3 s) con MSE y cosine sobre estados ocultos por capa (peso 0,25) y `lm_head` bypasseado. La etapa 2 (destilacion multi-capa de representaciones) duro 282 pasos (125,7 s) con peso cosine 0,50. En total 405 pasos en 180,3 s, con un pico de VRAM de 16 513 MB en autocast FP16 con parametros maestros FP32. La perplejidad causal paso de 21 824,58 (baseline zero-shot tras la cirugia) a 261,94 tras la destilacion.

## Capacidades

- Generacion de texto causal autoregresiva (pipeline `text-generation`), heredada de Qwen2.5-0.5B.
- Atencion lineal en tiempo via random feature kernelization en 18 de 24 capas.
- Soporte de atencion causal, bidireccional y cross-attention en el modulo Spectraformer (segun la tabla de capacidades del modulo).
- Capacidades conversacionales declaradas en los tags del repositorio, aunque no validadas con benchmarks.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni thinking mode en la informacion disponible.

## Casos de uso

- Investigacion sobre atencion subcuadratica: reproducir el experimento de cirugia y destilacion sobre Qwen2.5-0.5B para estudiar el impacto de sustituir atencion cuadratica por Spectraformer en un modelo preentrenado.
- Benchmarking de mecanismos de atencion: comparar perplejidad y coste computacional de `spectraformer_attention` frente a atencion estandar dentro del registro NeuralOps, usando WikiText-2 como referencia reproducible.
- Prototipado de arquitecturas hibridas: evaluar el patron `hybrid_3_1` (anclas cuadraticas cada 4 capas) como receta para reducir el coste de atencion sin perder demasiada calidad.
- Estudio de destilacion de conocimiento post-cirugia: analizar la recuperacion de perplejidad (de 21 824,58 a 261,94) y las recetas de dos etapas con MSE y cosine por capa.
- Experimentos de eficiencia en GPU de consumo: el proceso de entrenamiento cabe en 16,5 GB de VRAM, lo que permite reproducirlo en una RTX 4090 o similar.
- Base para ablaciones controladas: usar el checkpoint como punto de partida para probar otras topologias de cirugia (por ejemplo, mas o menos capas cuadraticas) manteniendo el resto del pipeline fijo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Perplejidad causal (validacion) | WikiText-2 raw v1 | 261,94 |
| Perplejidad causal pre-destilacion (stage 0) | WikiText-2 raw v1 | 21 824,58 |
| Delta de perplejidad tras destilacion | WikiText-2 raw v1 | -21 562,64 |
| Pasos totales de optimizacion | - | 405 (180,3 s) |
| VRAM pico durante entrenamiento | - | 16 513 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB, pero el checkpoint requiere cargar el base completo y aplicar la cirugia antes de cargar los pesos de atencion.
- VRAM para reproducir el entrenamiento: 16 513 MB en FP16 con parametros maestros FP32 (equivalente a una RTX 4090 de 24 GB o A100).
- GPU recomendadas: RTX 4090 o superior para entrenamiento; cualquier GPU con al menos 2-4 GB para inferencia del modelo base con los pesos de atencion trasplantados.
- Cabe en GPU de consumo: si, tanto para inferencia como para reproducir el proceso de destilacion.
- Opciones de despliegue: el repositorio usa la libreria `neuralops` (`load_surgeried_model`) y requiere `transformers` con `AutoModelForCausalLM`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-spectraformer-attention-wikitext2 | 0,5 mil millones | no disponible | 261,94 (declarada) | MIT | Hugging Face (pesos de atencion) |
| Qwen/Qwen2.5-0.5B | 0,5 mil millones | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |
| Otros checkpoints de NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos comparativos de perplejidad de Qwen2.5-0.5B base ni de otras variantes de atencion en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Perplejidad muy alta (261,94) frente a lo esperable en un modelo de 0,5 mil millones, lo que indica una calidad de generacion degradada respecto al base; no es apto para produccion.
- El checkpoint contiene unicamente pesos de atencion (124 MB); no es un modelo autonomo y exige cargar Qwen2.5-0.5B y aplicar la cirugia con codigo de NeuralOps.
- Solo soporta ingles (`language: en`).
- No soporta GQA nativo ni RoPE en el modulo Spectraformer (RoPE marcado como N/A), lo que puede afectar la coherencia a contextos largos.
- Entrenado solo sobre WikiText-2 con seq_len=512; no hay evidencia de generalizacion a otros dominios.
- Riesgo elevado de alucinacion y degradacion en tareas de razonamiento, codigo o matematicas no evaluadas.
- La licencia MIT aplica al repositorio; conviene verificar la licencia del base Qwen2.5-0.5B antes de uso comercial.
- Benchmark no verificado (`verified: false` en la model card); los datos son autodeclarados por el autor.
- Dependencia de la libreria `neuralops` y de scripts especificos (`apply_qwen_attention_surgery`), lo que limita la portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-spectraformer-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
