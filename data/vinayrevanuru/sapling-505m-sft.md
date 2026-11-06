# VinayRevanuru/Sapling-505M-SFT

## Resumen

Sapling-505M-SFT es un modelo conversacional de 505 millones de parámetros entrenado desde cero por Vinay Revanuru, un proyecto individual que cubre todo el ciclo: tokenizador propio, preentrenamiento, mid-training y ajuste fino supervisado (SFT). Se trata de un checkpoint de investigación publicado en Hugging Face bajo licencia Apache 2.0, basado en la arquitectura densa de Qwen3 (`Qwen3ForCausalLM`) y el formato de plantilla ChatML estándar.

El pipeline de entrenamiento acumula 6.500 millones de tokens en total: 5.000 millones de preentrenamiento (Sapling-505M-Base), 1.000 millones adicionales de matemáticas, chat y replay en el mid-training, y 504,9 millones de posiciones de token en la fase SFT final, usando SmolTalk, una porción de seguridad de Tulu 3 SFT y replay de FineWeb-Edu y Cosmopedia v2. El entrenamiento se ejecutó en 8 GPU H100 en Modal a unos 190.000 tokens/s durante unos 48 minutos.

Su relevancia es principalmente didáctica y de investigación: el autor documenta con transparencia total el proceso, incluidos los criterios de publicación ("release gates") que el modelo no supera en su totalidad. Pasa 3 de 6 gates: responde de forma coherente, cierra sus turnos correctamente y no sufre olvido catastrófico, pero falla en identidad propia, rechazo de peticiones dañinas y sobre-rechazo de prompts inofensivos. No está pensado para despliegue como asistente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (densa): GQA, QK-Norm, RMSNorm, RoPE, SwiGLU |
| Parametros totales | 505.483.776 (embeddings atados/tied) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos FP32 nativos) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, ≈2,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso tipo Qwen3 con 30 capas, ancho 1.024, FFN de 3.072, 16 cabezas de consulta y 8 cabezas KV (GQA, dimensión de cabeza 128). Incorpora QK-Norm, RMSNorm, codificación posicional RoPE y activación SwiGLU. El vocabulario es de 32.768 tokens byte-level BPE, con los tokens especiales `<|im_start|>` (id 3) y `<|im_end|>` (id 4) reasignados sobre slots reservados del tokenizador base.

El SFT partió de los pesos de Sapling-505M-Midtrain con un AdamW fresco. La pérdida de entropía cruzada se calculó solo sobre los tokens del asistente y sus `<|im_end|>`, enmascarando los turnos de sistema y usuario, mientras que el texto de replay mantuvo la pérdida LM completa. Las conversaciones se empaquetaron first-fit en filas de 2.048 tokens con una máscara de atención block-diagonal para evitar que conversaciones distintas se atendieran entre sí, reiniciando los position ids por conversación. Las fuentes se intercalaron de forma estratificada fila a fila para repartir las porciones pequeñas a lo largo de toda la ejecución. Se entrenó una época de 7.704 pasos con batch global de 65.536 tokens, LR pico 5e-5 con warmup del 3 % y decay coseno hasta 0, en BF16 autocast. Un dato notable: un primer intento sin replay degradó la pérdida de validación de FineWeb-Edu en +0,21; con un 21 % de replay el cambio fue de −0,008 (mejora ligera).

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML y cierre fiable de turnos (98 % de los turnos terminan con `<|im_end|>`).
- Diálogo general, escritura, código y matemáticas a nivel de chat, aprendidos de SmolTalk (501.082 conversaciones).
- Generación de código básico en Python (el propio ejemplo de la model card pide una función que invierte una cadena).
- Rechazo parcial de peticiones dañinas (73 % en el conjunto CoCoNot), gracias a la porción de seguridad de Tulu 3 (CoCoNot, WildJailbreak, WildGuardMix).
- Retención del conocimiento general del preentrenamiento, verificada por la pérdida de validación de FineWeb-Edu (−0,008 respecto al mid-training).
- Sin soporte documentado de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- No es un modelo multilingüe: está orientado al inglés.

## Casos de uso

- Investigación reproducible en SFT de modelos pequeños: el pipeline completo (datos, máscaras de pérdida, packing con atención block-diagonal, gates de publicación) está documentado al detalle, ideal como referencia para replicar entrenamientos a pequeña escala.
- Estudio del olvido catastrófico: la comparación entre el intento sin replay (+0,21 de pérdida) y con 21 % de replay (−0,008) es un experimento práctico muy útil para quien ajuste modelos sobre datos de instrucciones.
- Benchmarking de modelos de ~500M: sirve como punto de comparación para evaluar qué se puede esperar de un modelo entrenado desde cero con 6,5B tokens frente a alternativas destiladas o destiladas-inversas.
- Prototipado de chatbots en entornos controlados y de baja criticidad, donde el coste de errores es bajo y se necesita un modelo muy ligero.
- Pruebas de plantillas ChatML y tokenizadores propios: al usar ChatML estándar con tokens especiales reasignados, es útil para depurar pipelines de tokenización y chat templates.
- Educación y formación: como material para cursos o talleres sobre cómo se entrena un LLM end-to-end con presupuesto limitado (48 minutos en 8 H100).

## Benchmarks y rendimiento

El autor no publica benchmarks estándar completos (MMLU, HumanEval, etc.), solo métricas propias. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

| Métrica | Sapling-505M-SFT | Sapling-505M-Midtrain |
|---|---|---|
| GSM8K (muestra de 250 problemas, muestreado, coincidencia de número final) | 4,4 % | 2,0 % |
| Val loss SmolTalk | 1,017 | 1,371 |
| Val loss FineWeb-Edu | 2,8974 | 2,9051 |
| Cierra turno con `<|im_end|>` | 98 % | 0 % |
| Rechaza prompts dañinos (CoCoNot) | 73 % | 3 % |
| Rechazo erróneo de prompts inofensivos | 33 % | 0 % |
| Se identifica como "Sapling" | 3/10 | 0/10 |

Los umbrales de publicación del autor eran: cierre de turno ≥ 95 % (superado), sin fuga de roles (superado), olvido ≤ +0,10 (superado con −0,008), identidad ≥ 9/10 (fallado con 3/10), rechazo de dañinos ≥ 80 % (fallado con 73 %) y sobre-rechazo ≤ 10 % (fallado con 33 %).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2 GB en FP32; con carga en BF16/FP16, aproximadamente 1 GB, más el overhead de KV cache (mínimo dado el contexto de 2.048 tokens).
- Cabe con holgura en GPUs de consumo: cualquier GPU moderna con 4 GB o más (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas o portátiles.
- No se necesita GPU para experimentar: a 505M parámetros es viable la inferencia en CPU con tiempos de respuesta razonables.
- Despliegue: compatible con la librería `transformers` (código de ejemplo en la model card); al usar arquitectura `Qwen3ForCausalLM`, debería funcionar también con vLLM, llama.cpp (previa conversión a GGUF, no publicada en el repo) y Ollama (previa conversión), aunque el autor no documenta estas rutas.
- No hay datos publicados de latencia ni throughput en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sapling-505M-SFT | 505M | 2.048 | Apache 2.0 | Entrenado desde cero con 6,5B tokens; checkpoint de investigación |
| Qwen3-0.6B (base de la arquitectura) | ~600M | 32.768 (documentado en la familia Qwen3) | Apache 2.0 | Entrenado con órdenes de magnitud más tokens y datos; rendimiento muy superior |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 360M | 8.192 | Apache 2.0 | Modelo instructivo pequeño entrenado con SmolTalk; mismo ecosistema de datasets |
| SmolLM2-1.7B-Instruct (HuggingFaceTB) | 1.700M | 8.192 | Apache 2.0 | Referente de la categoría small-LM; más grande pero sigue siendo ligero |

Nota: los datos de Qwen3-0.6B y SmolLM2 provienen de conocimiento general y no de la información proporcionada en esta ficha; verifícalos en sus model cards antes de usarlos como referencia rigurosa.

## Limitaciones y advertencias

- El propio autor advierte que no debe desplegarse como asistente: es un checkpoint de investigación que supera solo 3 de sus 6 criterios de publicación.
- Falla en identidad: solo se identifica como "Sapling" en 3 de 10 sondas, lo que indica inconsistencia en el comportamiento de identidad.
- Seguridad insuficiente: rechaza solo el 73 % de prompts dañinos (umbral 80 %), por lo que puede responder a peticiones que otros modelos rechazarían.
- Sobre-rechazo elevado: se niega a responder un 33 % de prompts inofensivos que solo "suenan edgy", muy por encima del umbral del 10 %.
- Riesgo de alucinación típico de modelos pequeños: el 4,4 % en GSM8K indica capacidad matemática y de razonamiento muy limitada.
- Contexto corto de 2.048 tokens: inadecuado para documentos largos o conversaciones extensas.
- Solo inglés; no está entrenado para otros idiomas ni para castellano.
- Pesos en FP32 (2 GB), sin cuantizaciones oficiales publicadas, lo que duplica la memoria necesaria frente a un despliegue en BF16.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque las limitaciones de seguridad descritas hacen desaconsejable cualquier uso en producción.
- Los conjuntos de evaluación de los gates son pequeños (30-50 prompts), por lo que cada prompt mueve las tasas unos 3 puntos; los porcentajes tienen incertidumbre considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT
- Modelo base (mid-training): https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Tulu 3 SFT Mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Paper, blog o repositorio de código: no disponible
