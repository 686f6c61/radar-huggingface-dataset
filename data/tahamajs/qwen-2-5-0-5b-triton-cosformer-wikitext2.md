# tahamajs/qwen-2.5-0.5b-triton-cosformer-wikitext2

## Resumen

`qwen-2.5-0.5b-triton-cosformer-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B de Alibaba cuyo bloque de atención de decodificador ha sido sustituido quirúrgicamente por una implementación de atención lineal Cosformer acelerada con Triton (`TritonCosformerAttention`), conservando solo 6 de las 24 capas con atención cuadrática completa como anclas.

El objetivo es demostrar que es posible reemplazar la atención softmax estándar por una atención subcuadrática diferenciable con autograd completo y recuperar la calidad mediante destilación de conocimiento en dos etapas sobre WikiText-2. El resultado declarado es una perplejidad de validación de 49,52, partiendo de una línea base post-cirugía catastrófica de 2349,58.

Es relevante como artefacto de investigación sobre eficiencia de atención y como ejemplo reproducible de "cirugía" modular de atención, no como modelo listo para producción: el repositorio solo contiene pesos de atención (84,16 MB) que deben combinarse con el modelo base Qwen2.5-0.5B, y el ajuste se limita a WikiText-2 en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen2.5-0.5B, con 18/24 capas sustituidas por atención lineal Cosformer (Triton) y 6 capas de atención cuadrática completa como anclas (patrón `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo publica pesos de atención de 84,16 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`; el contexto nativo de Qwen2.5-0.5B es 32 768 tokens, pero no se verifica en este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso carga en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más `config.json`, `tokenizer.json` y `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64`. La cirugía aplica el patrón `hybrid_3_1`: se sustituyen 18 de las 24 capas por `TritonCosformerAttention` mediante `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de una única `o_proj`. Las capas en los índices [3, 7, 11, 15, 19, 23] mantienen atención cuadrática completa. La atención Cosformer es lineal, soporta modo causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE declarado (marcado como N/A).

El entrenamiento es una destilación de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`): una primera etapa de alineación con backbone congelado (144 pasos, 54,3 s) con `lm_head` puenteado y pérdida MSE + coseno sobre estados ocultos (peso 0,25), y una segunda etapa de destilación multi-capa (330 pasos, 125,6 s, peso 0,50). En total, 474 pasos en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 11 689 MB en FP16 autocast y parámetros maestros en FP32. La perplejidad causal pasó de 2349,58 (etapa 0, sin destilación) a 49,52.

## Capacidades

- Generación de texto causal en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención lineal subcuadrática con autograd completo, implementada en Triton, potencialmente más eficiente en secuencias largas.
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo.
- Compatibilidad con el ecosistema NeuralOps (`neuralops.hub.load_surgeried_model`) y con `transformers` mediante el script de cirugía.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este checkpoint.
- Capacidad multilingüe: limitada al inglés según la model card, aunque el modelo base soporta más idiomas.

## Casos de uso

- Investigación sobre atención lineal: sirve como referencia reproducible para medir el coste en calidad de sustituir atención softmax por Cosformer en un modelo pequeño y conocido.
- Experimentos de destilación de conocimiento: el par de etapas (alineación con backbone congelado + destilación multi-capa) es un patrón reutilizable para recuperar modelos tras cirugía arquitectónica.
- Pruebas de kernels Triton: el módulo `TritonCosformerAttention` permite validar rendimiento y corrección de kernels de atención personalizados en GPUs consumer.
- Benchmarking de perplejidad en WikiText-2: punto de comparación para otras variantes del Attention Zoo sobre el mismo base model.
- Prototipado educativo: ilustra cómo adaptar proyecciones Q/K/V de GQA a un esquema de atención alternativo con un adaptador.
- Evaluación de compromisos eficiencia/calidad: útil para decidir si merece la pena atención subcuadrática en modelos de 0,5B antes de escalar a tamaños mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 49,52 |
| WikiText-2 (post-cirugía, etapa 0) | Perplejidad | 2349,58 |
| WikiText-2 (delta tras destilación) | Perplejidad | -2300,06 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras tareas en la información disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: 11 689 MB de pico (FP16 autocast, maestros FP32, `seq_len=512`, `grad_accum=4`).
- VRAM de inferencia estimada: el modelo base de 0,5B en FP16 ocupa aproximadamente 1 GB de pesos; en FP32, unos 2 GB. Cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento se necesitan al menos 12 GB (RTX 3090/4090, A100, H100).
- Despliegue: el flujo documentado usa `transformers` + `safetensors` + el script de cirugía de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (solo atención) no es directamente cargable por esos motores sin aplicar la cirugía.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-triton-cosformer-wikitext2` | 0,5B | no disponible (entrenado a 512) | Híbrida 3:1 Cosformer lineal + cuadrática | MIT | Pesos de atención únicamente (84,16 MB) |
| `Qwen/Qwen2.5-0.5B` | 0,5B | 32 768 | Softmax estándar con GQA | Apache 2.0 | Pesos completos |
| Otras variantes del NeuralOps Attention Zoo | 0,5B | no disponible | Otras atenciones subcuadráticas | MIT (según proyecto) | Pesos de atención |

La comparación directa con alternativas de la misma categoría (modelos de 0,5B con atención lineal) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint solo contiene pesos de atención; requiere el modelo base Qwen2.5-0.5B y el script de cirugía de NeuralOps para funcionar.
- Entrenado exclusivamente sobre WikiText-2 en inglés: el dominio es muy estrecho y la calidad fuera de ese corpus no está validada.
- La perplejidad de 49,52 es notablemente superior a la de Qwen2.5-0.5B original en WikiText-2, por lo que hay una pérdida de calidad respecto al base.
- No soporta GQA nativo en el módulo Cosformer; el adaptador expande cabezas KV, lo que puede afectar a la eficiencia real.
- No hay datos de sesgos, alucinación ni robustez; al ser un experimento de investigación, no se recomienda su uso en producción.
- La licencia MIT del repo no exime de revisar la licencia del modelo base (Apache 2.0) al redistribuir.
- El tag `supports_rope` aparece como N/A, lo que puede afectar al comportamiento en secuencias largas más allá de las vistas en entrenamiento.
- Fecha de creación declarada en 2026-11-11; verificar la vigencia del repo y de las dependencias de NeuralOps antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-triton-cosformer-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
