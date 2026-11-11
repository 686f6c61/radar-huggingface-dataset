# tahamajs/qwen-2.5-0.5b-spectraformer-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-spectraformer-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Zoo. No se trata de un modelo entrenado desde cero, sino de un ejercicio de cirugía arquitectónica sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder original por un módulo de atención lineal denominado `SpectraformerAttention`, que aproxima el kernel de atención mediante random features y consigue coste lineal en la longitud de secuencia. Las 6 capas restantes conservan la atención cuadrática original como anclas.

El objetivo es doble: por un lado, servir de banco de pruebas reproducible para comparar mecanismos de atención subcuadrática sobre un transformer ya entrenado; por otro, demostrar que un proceso de destilación de conocimiento en dos etapas puede recuperar buena parte del rendimiento perdido tras la sustitución. El modelo resultante alcanza una perplejidad de 261,94 en el split de validación de WikiText-2, un valor muy alto en términos absolutos, pero que supone una reducción drástica respecto a la línea base post-cirugía (21.824,58).

Es relevante ahora porque ejemplifica una tendencia creciente en la comunidad open source: reutilizar pesos existentes y aplicar transformaciones estructurales (atención lineal, híbridos SSM-transformer, decodificación especulativa) en lugar de reentrenar desde cero. El repositorio es pequeño (unos 0,1 GB) y contiene únicamente los pesos de atención en formato safetensors, no un modelo completo listo para `transformers`. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SpectraformerAttention` (lineal via random features) y 6/24 capas con atencion cuadratica original |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo contiene los pesos de atencion, 124,03 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se especifica en la informacion) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, presumiblemente FP16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 124,03 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA), con `head_dim=64`. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: por cada bloque de tres capas se sustituye la atención por `SpectraformerAttention` y se conserva una capa cuadrática completa. Las capas ancla son las de índices `[3, 7, 11, 15, 19, 23]`. La adaptación la realiza `QwenAttentionAdapter`, que mapea las proyecciones originales, expande las cabezas KV 7x cuando es necesario y respeta el contrato de una única `o_proj`.

`SpectraformerAttention` implementa atención causal de coste lineal aproximando el kernel softmax con random features. Soporta modo causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE nativo (marcado como `N/A` en la ficha del módulo). El entrenamiento consistió en destilación de conocimiento en dos etapas sobre WikiText-2: una primera fase de alineamiento con backbone congelado (123 pasos, 54,3 s), que omite `lm_head` y usa MSE y coseno por capa con peso 0,25; y una segunda fase de destilación multi-capa (282 pasos, 125,7 s) con peso de coseno 0,50. En total, 405 pasos de optimización en 180,3 s, con `seq_len=512`, `grad_accum=4`, `topk=64` y autocast FP16 con parámetros maestros en FP32, consumiendo 16.513 MB de VRAM en pico.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de la base Qwen2.5-0.5B.
- Atención lineal de coste O(n) en las capas sustituidas, lo que en teoría permite secuencias largas con menor coste computacional que la atención cuadrática.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (aunque el checkpoint se entrega configurado para generación causal).
- Capacidad de continuación de texto y modelado de lenguaje genérico, limitada por el entrenamiento específico en WikiText-2.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación en mecanismos de atención eficiente: el checkpoint sirve como referencia reproducible para comparar `SpectraformerAttention` frente a atención cuadrática y otros módulos del Attention Zoo bajo un mismo protocolo de destilación y evaluación en WikiText-2.
- Experimentos de cirugía de modelos: permite estudiar cómo afecta la sustitución híbrida 3:1 al rendimiento de un transformer pequeño, midiendo la caída y la recuperación vía destilación en dos etapas.
- Docencia y divulgación: útil para explicar en un curso o artículo cómo se aplica knowledge distillation capa a capa y qué telemetría (perplejidad pre y post, pasos, VRAM) se debe registrar.
- Prototipado de atención lineal en producción: como punto de partida para validar si un kernel aproximado es viable en tareas de generación de texto antes de invertir en un modelo mayor.
- Benchmarking de infraestructura: el script de carga permite medir latencia y throughput de un modelo híbrido en GPUs de gama media, dado su reducido tamaño.
- Estudio de la degradación por aproximación: la perplejidad de 261,94 frente a la base permite cuantificar el coste de sustituir atención exacta por random features en un modelo de 0,5B, útil para calibrar expectativas en modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad | 261,94 |
| WikiText-2 (linea base post-cirugia, Stage 0) | Perplejidad | 21.824,58 |
| Delta de perplejidad tras destilacion | Reduccion | -21.562,64 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. Tampoco se aporta la perplejidad del modelo base Qwen2.5-0.5B sin cirugía como referencia directa.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 16.513 MB en pico con FP16 y parámetros maestros FP32; para inferencia en FP16 se estima un consumo inferior a 2 GB, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el entrenamiento se realizó presumiblemente en una GPU de 24 GB o superior.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, dado el tamaño de 0,5B.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El flujo oficial requiere `transformers`, `safetensors` y el script `apply_qwen_attention_surgery` del repositorio NeuralOps, por lo que no es un checkpoint plug-and-play.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-spectraformer-attention-wikitext2` | ~0,5B | No disponible | Hibrida 3:1 (lineal + cuadratica) | MIT | Solo pesos de atencion, requiere cirugia manual |
| `Qwen/Qwen2.5-0.5B` | 0,49B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Cuadratica con GQA y RoPE | Apache 2.0 | Checkpoint completo en `transformers` |
| `Qwen/Qwen2.5-1.5B` | 1,54B | 32.768 tokens | Cuadratica con GQA y RoPE | Apache 2.0 | Checkpoint completo en `transformers` |

La comparación con otros modelos de atención lineal (por ejemplo, variantes basadas en Performer, Linformer o Mamba) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Perplejidad muy elevada (261,94) incluso tras la destilación: el modelo no es adecuado para generación de texto de calidad en producción.
- Entrenado exclusivamente sobre WikiText-2 en inglés; el dominio y el idioma están fuertemente restringidos.
- No es un checkpoint completo: solo incluye los pesos de atención. Requiere descargar `Qwen/Qwen2.5-0.5B` y aplicar la cirugía con el script del repositorio NeuralOps, lo que añade fragilidad y dependencia de código externo.
- `SpectraformerAttention` no soporta GQA nativo ni RoPE nativo, lo que puede afectar a la coherencia en secuencias largas y a la compatibilidad con el ecosistema estándar.
- Riesgo alto de alucinación y de texto incoherente, derivado de la aproximación de la atención y del limitado ajuste.
- La verificación de los benchmarks es `false`: el autor no ha validado externamente los resultados.
- Aunque la licencia es MIT, el uso comercial no está recomendado por la calidad del modelo; conviene revisar también la licencia del modelo base (Apache 2.0) y del código NeuralOps.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la ficha, lo que sugiere un proyecto de investigación personal sin soporte comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-spectraformer-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
