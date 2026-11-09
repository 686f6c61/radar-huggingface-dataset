# tetracta/tetracta-van-1b

## Resumen

Tetracta VAN-1B es un transformer decoder-only de 936.609.792 parametros (0,94B) entrenado desde cero por el laboratorio independiente Tetracta. Se presenta explicitamente como un modelo de control "deliberadamente vanilla": su funcion es servir de referencia frente a la arquitectura propia del laboratorio (Z-Next 1B, sin atencion ni KV cache) entrenada sobre exactamente los mismos datos, de modo que las comparaciones entre ambas tengan validez metodologica. No es un asistente de produccion, sino un instrumento de medida y una demostracion de eficiencia de datos.

El modelo se entreno sobre 10.320 millones de tokens en una unica epoca sin repeticion de datos, con un corpus 100 % en ingles, y posteriormente se ajusto con instrucciones sobre 11.419 ejemplos. La relevancia actual del modelo reside en su tesis central: la alineacion de comportamiento (identidad, honestidad, formato de chat, seguridad) puede ensenarse con muy poco dato, mientras que el conocimiento y el razonamiento requieren escala. El laboratorio publica tanto el estado preentrenado crudo como los datos de SFT y los checkpoints intermedios, lo que permite auditar que hace exactamente el ajuste por instrucciones.

Arquitectura transformer estandar con RMSNorm pre-norm, RoPE, atencion causal via SDPA, MLP con GELU y embeddings atados. Contexto de 8192 tokens en preentrenamiento y 1024 en la version ajustada y distribuida. Vocabulario SentencePiece de 64.000 tokens con tokens nativos de chat y de herramientas, lo que evita redimensionar el vocabulario durante el SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm pre-norm, RoPE, atencion causal SDPA, MLP GELU 4x, embeddings atados) |
| Parametros totales | 936.609.792 (0,94B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en preentrenamiento; 1024 en SFT y en la cache RoPE distribuida |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; pesos en safetensors) |
| Idiomas soportados | Ingles (corpus de preentrenamiento 100 % en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` ajustado, `van1b_base.safetensors` base) + `tokenizer.model` SentencePiece |
| Dimension del modelo (d_model) | 2048 |
| Capas | 16 |
| Cabezas de atencion | 16 (head_dim 128) |
| Vocabulario | 64.000 tokens SentencePiece |
| Tokens de preentrenamiento | 10.321.920.000 (10,32B), una epoca, sin repeticion |
| Ejemplos de SFT | 11.419 (3 epocas, lr 1e-5, batch 16, T=1024) |
| Perdida final de preentrenamiento | bpc 3,7610 / char-PPL 13,56 |
| Hardware de entrenamiento | 1x H200, 678,5 ms/paso, ~64 h, coste estimado 270-290 USD |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional sin innovaciones propietarias, decision intencionada para que sirva de linea base. Emplea normalizacion RMSNorm en configuracion pre-norm, embeddings rotatorios (RoPE), atencion causal implementada con scaled dot-product attention, un MLP con activacion GELU y factor de expansion 4x, y embeddings de entrada y salida atados (la matriz `head.weight` se omite deliberadamente de los safetensors y se re-ata al cargar). El vocabulario de 64.000 tokens SentencePiece incluye tokens nativos de chat y de herramientas (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|tool_call|>`, `<|tool_result|>`, `<|thought|>`), lo que evita cualquier redimensionado de vocabulario durante el ajuste.

El preentrenamiento consumio 10.321.920.000 tokens en una unica epoca completa sin repeticion, con 315.000 pasos de 32.768 tokens, learning rate 3e-4, 2.000 pasos de warmup, decaimiento coseno, semilla 1 y mezcla fp32 maestro / bf16 autocast. El ajuste por instrucciones uso 11.419 ejemplos durante 3 epocas con lr 1e-5, batch 16 y longitud 1024, completandose en 236 segundos sobre una H200. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles con formato de chat multi-turno mediante plantilla nativa de tokens especiales.
- Tool calling: el modelo emite `<|tool_call|>{"name": "...", "arguments": {...}}` y el runtime `tools.py` lo ejecuta, devolviendo el resultado como `<|tool_result|>`. Herramientas integradas: `calculate` (aritmetica segura por AST, sin `eval`), `web_search` (DuckDuckGo), `unit_convert` y `get_time`.
- Razonamiento multi-paso basico con token de pensamiento nativo (`<|thought|>`).
- Alineacion de comportamiento medida: identidad, honestidad, formato conversacional y seguridad, donde supera a modelos base del mismo tamano segun el panel ciego del autor.
- Capacidades multilingues: limitadas al ingles.
- No dispone de vision, audio ni modo de razonamiento extendido mas alla del token de pensamiento.

## Casos de uso

- Investigacion sobre ajuste por instrucciones: el modelo permite comparar el estado base (`van1b_base.safetensors`, bpc 3,7610) con el ajustado sobre los mismos datos de SFT, aislando el efecto exacto del ajuste en comportamiento, conocimiento y calibracion.
- Linea base de control en experimentos de arquitectura: sirve como referencia vanilla frente a arquitecturas alternativas (Z-Next 1B, zkas-1B) entrenadas sobre datos identicos, permitiendo atribuir diferencias de rendimiento a la arquitectura y no a los datos.
- Ensenanza y divulgacion de transformers: al incluir implementacion de referencia (`modeling_van.py`), plantilla de chat, sampler y configuracion completa, es util para estudiar el ciclo completo de preentrenamiento y SFT con trazabilidad total.
- Prototipado de pipelines de tool calling: el runtime `tools.py` ejecuta realmente las llamadas del modelo, lo que permite validar flujos de agente con herramientas aritmeticas, busqueda web y conversion de unidades en entornos de laboratorio.
- Reproduccion de bajo presupuesto: el coste documentado de 270-290 USD en una sola H200 y las 64 horas de entrenamiento lo hacen viable como ejercicio reproducible de entrenamiento desde cero para grupos con recursos limitados.
- Evaluacion de metodos de juicio ciego: el panel publicado (64 prompts, 8 carriles, 24 jueces independientes, 192 decisiones) sirve como plantilla metodologica para comparar modelos de distinto tamano y regimen de entrenamiento.

## Benchmarks y rendimiento

El autor publica un panel de jueces ciegos (64 prompts, 8 carriles, 24 jueces independientes, 192 decisiones) en lugar de benchmarks academicos estandar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Comparacion | Cuota del modelo | Veredicto |
|---|---|---|
| Frente a Qwen2.5-1.5B BASE | 48,4 % | Paridad, con ~1.750x menos datos de entrenamiento |
| Frente a Qwen2.5-1.5B Instruct | 22,6 % | Derrota clara |
| Frente a Qwen2.5-7B Instruct | 15,3 % | Derrota clara |

| Carril | Resultado |
|---|---|
| Identidad | 8-0 a favor |
| Honestidad | 7-1 a favor |
| Chat | 7-1 a favor |
| Seguridad | 5-2 a favor |
| Conocimiento, razonamiento, redaccion larga | Derrota |

Metrica de preentrenamiento: bpc 3,7610 sobre una porcion retenida no vista durante el entrenamiento (char-PPL 13,56). Tool calling: 4 de 6 llamadas correctas medidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,9 GB solo para pesos (936M parametros x 2 bytes), mas cache KV y activaciones; en la practica cabe holgadamente en GPUs consumer de 8 GB o mas.
- En fp32 los pesos ocupan unos 3,7 GB; sigue siendo viable en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en precision reducida; el entrenamiento documentado se realizo en 1x H200 (678,5 ms/paso, ~64 h).
- Cabe en GPUs consumer como RTX 3060 12 GB, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: el autor proporciona implementacion de referencia en PyTorch (`modeling_van.py`) con carga directa en `cuda` o `cpu`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y tampoco se publican pesos en GGUF.
- Latencia y throughput: no disponibles. Solo se conoce el tiempo de paso en entrenamiento (678,5 ms/paso con 32.768 tokens en H200).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tetracta VAN-1B | 0,94B | 8192 (preentrenamiento), 1024 (SFT) | 10,32B tokens, una epoca | Apache 2.0 | Pesos publicados (ajustado y base) |
| Qwen2.5-1.5B Instruct | 1,5B | 32.768 tokens (segun especificaciones publicas de Qwen2.5) | No disponible en esta ficha | Apache 2.0 | Pesos publicados |
| Qwen2.5-7B Instruct | 7B | 32.768 tokens (segun especificaciones publicas de Qwen2.5) | No disponible en esta ficha | Apache 2.0 | Pesos publicados |
| Tetracta Z-Next 1B | ~1B | No disponible | Mismos datos que VAN-1B | No disponible | Resultados publicados, demo en vivo |

En el panel ciego del autor, VAN-1B alcanza paridad con Qwen2.5-1.5B BASE (48,4 %) pese a usar aproximadamente 1.750 veces menos datos, pero pierde claramente frente a las versiones Instruct de Qwen2.5 en 1,5B (22,6 %) y 7B (15,3 %). La comparacion con Z-Next 1B es la mas relevante metodologicamente, al compartir datos y SFT.

## Limitaciones y advertencias

- Razonamiento y conocimiento son debiles por diseno: el propio autor reconoce derrotas claras en conocimiento, razonamiento y redaccion larga frente a modelos Instruct, y atribuye la causa a la falta de escala en preentrenamiento.
- Tool calling medido en 4 de 6 llamadas correctas; el mecanismo funciona pero no es fiable para produccion sin validacion adicional.
- Riesgo de alucinacion elevado en dominios factuales, coherente con el bajo volumen de datos de preentrenamiento (10,32B tokens) y la ausencia de datos posteriores.
- Soporte exclusivamente en ingles; no se documenta capacidad multilingue.
- Contexto efectivo limitado a 1024 tokens en la version distribuida (la cache RoPE enviada corresponde a esa longitud), pese a haber sido preentrenado con 8192.
- No es un asistente de produccion segun el propio autor; su uso previsto es investigacion, medicion y docencia.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas desaconsejan ese escenario.
- No se publican variantes cuantizadas ni soporte para runtimes de inferencia optimizados (vLLM, llama.cpp, TGI), lo que limita el despliegue a la implementacion de referencia.
- El modelo incluye una nota de correccion fechada el 6 de septiembre de 2026 y notas de alcance y estado del servicio al final de la model card; conviene consultarlas antes de reutilizar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetracta/tetracta-van-1b
- Modelo hermano Z-Next 1B: https://huggingface.co/tetracta/tetracta-znext-1b
- Pagina completa de resultados: https://www.tetracta.ai/znext.html
- Demo en vivo: https://www.tetracta.ai/zchat
- Web del laboratorio: https://tetracta.ai
- Paper: "What does SFT do? Measuring a 0.94B model from the inside and the outside" (enlace en tetracta.ai)
- X/Twitter: https://x.com/tetractai
- LinkedIn: https://www.linkedin.com/company/tetracta
