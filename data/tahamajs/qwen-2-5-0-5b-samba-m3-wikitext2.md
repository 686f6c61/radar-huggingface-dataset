# tahamajs/qwen-2.5-0.5b-samba-m3-wikitext2

## Resumen

`qwen-2.5-0.5b-samba-m3-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Qwen Attention Zoo. No es un modelo entrenado desde cero, sino una cirugía sobre el modelo base Qwen/Qwen2.5-0.5B: se sustituyen 18 de sus 24 bloques de atención cuadrática por el módulo `samba_m3` (ventana deslizante local combinada con Mamba espectral) y se recupera la calidad mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El objetivo del proyecto es explorar arquitecturas de atención subcuadrática dentro de un transformer preentrenado, evaluando el coste de la sustitución y la capacidad de recuperación mediante KD. El checkpoint resultante alcanza una perplejidad de 219,15 en la validación de WikiText-2 (`wikitext-2-raw-v1`), frente a los 2553,41 de la línea base cero-shot tras la cirugía, lo que supone una reducción de 2334,26 puntos.

Es relevante como referencia metodológica para investigadores que quieran experimentar con atención híbrida sin reentrenar desde cero, y como ejemplo reproducible de un pipeline de cirugía más destilación en un modelo pequeño (0,5B parámetros, contexto nativo de Qwen2.5, licencia MIT). No obstante, su perplejidad absoluta es alta y su utilidad práctica en producción es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `SAMBAM3Block` (atención local de ventana deslizante + Mamba espectral) y 6/24 capas con atención cuadrática completa en los índices [3, 7, 11, 15, 19, 23] |
| Parámetros totales | 0,5B (heredados de Qwen2.5-0.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; el modelo base Qwen2.5-0.5B soporta hasta 32 768 tokens, pero el autor no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors de atención, 143,49 MB) |
| Idiomas soportados | inglés (`en` declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 143,49 MB); requiere aplicar cirugía sobre el modelo base Qwen/Qwen2.5-0.5B |
| Hidden size | 896 |
| Cabezas de atención | 14 query heads, 2 KV heads, `head_dim=64` (GQA 14:2 con expansión 7x automática en el adaptador) |
| Patrón de cirugía | `hybrid_3_1` (intercalado 3:1) |
| Librería | `neuralops` |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso con 24 capas y GQA 14:2. La cirugía reemplaza los bloques de atención de 18 capas por `SAMBAM3Block`, que combina atención local de ventana deslizante con Mamba espectral, manteniendo 6 capas de atención cuadrática completa como anclas en posiciones fijas. El `QwenAttentionAdapter` se encarga de mapear las proyecciones originales (14 query heads, 2 KV heads, `head_dim=64`, `hidden_size=896`), aplicando expansión 7x de KV heads cuando es necesario y forzando el contrato de `o_proj` único. El módulo declara soporte para causal, bidireccional, cross-attention, GQA nativo y operador de atención personalizado; no usa RoPE nativo (`supports_rope: N/A`).

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, cero-shot) parte de una perplejidad de 2553,41. La etapa 1 (alineación con backbone congelado) ejecuta 15 pasos en 55,5 s con `lm_head` desactivado y pérdida MSE + coseno a nivel de capa con peso 0,25. La etapa 2 (KD de representación multicapa) ejecuta 34 pasos en 127,0 s con MSE + coseno con peso 0,50. En total, 49 pasos de optimización en 182,9 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando una perplejidad final de 219,15 (delta de -2334,26). El pico de VRAM fue de 15 875 MB en FP16 autocast con parámetros maestros en FP32.

## Capacidades

- Generación de texto causal autorregresiva en inglés (`text-generation`, `conversational`).
- Soporte declarado de atención bidireccional y cross-attention a nivel de módulo (no verificado en el checkpoint).
- Soporte nativo de GQA en el adaptador de atención.
- Capacidad multilingüe: limitada al inglés según los metadatos.
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas, código, visión, audio ni modo de razonamiento explícito.
- No se documenta decodificación especulativa ni atención lineal más allá del propio módulo `samba_m3`.

## Casos de uso

- Investigación en atención subcuadrática: servir como referencia reproducible para estudiar la sustitución de atención cuadrática por módulos híbridos (sliding-window + Mamba espectral) en un transformer preentrenado, con telemetría de perplejidad antes y después de la KD.
- Reproducción de pipelines de cirugía y destilación: el repositorio incluye `training_metrics.json` y los scripts de NeuralOps (`apply_qwen_attention_surgery`), lo que permite replicar el flujo completo en una sola GPU consumer (pico de 15,9 GB en FP16).
- Benchmarking de módulos de atención: comparar `samba_m3` frente a otras entradas del `ATTENTION_REGISTRY` de NeuralOps sobre el mismo modelo base y dataset, usando la perplejidad en WikiText-2 como métrica común.
- Docencia y divulgación: ejemplo didáctico de destilación de conocimiento en dos etapas (alineación de backbone congelado + KD de representación multicapa) con métricas y tiempos concretos.
- Pruebas de integración de la librería `neuralops`: validar la API `load_surgeried_model` y el contrato del `QwenAttentionAdapter` en un checkpoint pequeño antes de escalar a modelos mayores.
- Prototipado de evaluación de perplejidad: usar el checkpoint como sujeto de prueba en pipelines de evaluación de lenguaje (PPL en WikiText-2) sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validación) | Perplejidad causal | 219,15 |
| WikiText-2 (post-cirugía, cero-shot, etapa 0) | Perplejidad causal | 2553,41 |
| Delta de perplejidad tras KD | Δ PPL | -2334,26 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento (KD) requirió un pico de 15 875 MB en FP16 autocast con parámetros maestros en FP32; la inferencia en FP16 de un modelo de 0,5B debería situarse en el rango de 1-2 GB, aunque no se especifica en la model card.
- GPU recomendadas: no disponible de forma explícita; el pico de entrenamiento (15,9 GB) encaja en una RTX 4090 (24 GB) o A100/H100.
- Cabe en GPU consumer: sí, previsiblemente en GPUs con 4 GB o más en FP16, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: la model card solo documenta carga mediante la librería `neuralops` (`load_surgeried_model`) o mediante `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-samba-m3-wikitext2` | 0,5B | no disponible | 219,15 | MIT | Hugging Face (pesos de atención) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32 768 tokens | no disponible en la información | Apache 2.0 (según el modelo base, no confirmado en esta ficha) | Hugging Face |
| Otros checkpoints del NeuralOps Qwen Attention Zoo | 0,5B | no disponible | no disponible | MIT (previsiblemente) | Hugging Face |

No se dispone de datos de perplejidad del modelo base Qwen2.5-0.5B en WikiText-2 dentro de la información proporcionada, por lo que no es posible cuantificar la degradación respecto al original. No se han identificado en la información otros modelos comparables de atención híbrida sobre Qwen2.5-0.5B.

## Limitaciones y advertencias

- Perplejidad absoluta alta (219,15 en WikiText-2), muy superior a la de un modelo de 0,5B entrenado de forma estándar; el checkpoint prioriza la experimentación arquitectónica sobre la calidad de generación.
- Solo se publican los pesos de atención (`attention_weights.safetensors`); es imprescindible descargar el modelo base Qwen/Qwen2.5-0.5B y aplicar la cirugía para poder usarlo.
- El checkpoint está entrenado únicamente sobre WikiText-2, un corpus de Wikipedia en inglés; el dominio y el idioma están muy restringidos.
- Idiomas soportados: solo inglés declarado.
- Riesgo de alucinación elevado por la baja calidad del modelo y el dominio limitado de entrenamiento.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.
- La licencia MIT del checkpoint no exime de verificar la licencia del modelo base Qwen2.5-0.5B para uso comercial.
- No hay soporte documentado para tool calling, agentes ni razonamiento multi-paso; no debe asumirse.
- El contexto efectivo tras la cirugía no está confirmado por el autor; la ventana deslizante del módulo `samba_m3` puede alterar el comportamiento en secuencias largas.
- Resultados de benchmarks marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-samba-m3-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
