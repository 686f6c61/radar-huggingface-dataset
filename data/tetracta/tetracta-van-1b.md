# tetracta/tetracta-van-1b

## Resumen

Tetracta VAN-1B es un transformer decoder-only de 936.609.792 parametros (0,94B) entrenado desde cero por Tetracta, un laboratorio de investigacion independiente. Se presenta explicitamente como el "control vanilla" de su propia arquitectura Z-Next 1B: mismo corpus, mismo tokenizer y mismo presupuesto de datos, para que las comparaciones entre ambas arquitecturas tengan validez metodologica. No es un asistente de produccion, sino un instrumento de medida y una demostracion de eficiencia de datos.

El modelo se preentreno sobre 10.320 millones de tokens (100 % en ingles) durante 315.000 pasos en una sola GPU H200, alcanzando 3,7610 bits por token (perplejidad de 13,56). Posteriormente se ajusto con instrucciones sobre 11.419 ejemplos durante 3 epocas, un proceso que completo en 236 segundos en la misma H200. La relevancia actual del modelo no reside en su rendimiento absoluto, sino en que el autor publica el estado preentrenado crudo, los datos de SFT y todos los checkpoints intermedios, lo que permite medir empiricamente que hace el ajuste por instrucciones a un modelo.

La arquitectura es deliberadamente convencional (RMSNorm pre-norm, RoPE, atencion causal con SDPA, MLP GELU 4x, embeddings atados), con un contexto de preentrenamiento de 8192 tokens y 1024 en la version ajustada. El vocabulario de 64.000 tokens SentencePiece incluye tokens nativos de chat y de uso de herramientas, por lo que no requiere redimensionar el vocabulario para el SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm pre-norm, RoPE, atencion causal SDPA, MLP GELU 4x, embeddings atados) |
| Parametros totales | 936.609.792 (0,94B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 en preentrenamiento; 1024 en SFT y en la cache RoPE distribuida |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (corpus de preentrenamiento 100 % en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); `model.safetensors` (ajustado) y `van1b_base.safetensors` (base) |
| Dimension del modelo (d_model) | 2048 |
| Capas | 16 |
| Cabezas de atencion | 16 (head_dim 128) |
| Vocabulario | 64.000 (SentencePiece) |
| Tokens de preentrenamiento | 10.321.920.000 (10,32B) |
| Perplejidad final (preentrenamiento) | 13,56 (3,7610 bits por token) |
| Ejemplos de SFT | 11.419 (3 epocas, lr 1e-5, batch 16, T=1024) |
| Hardware de entrenamiento | 1x H200 (678,5 ms/paso, ~64 h de preentrenamiento) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only sin innovaciones propietarias: normalizacion RMSNorm en configuracion pre-norm, codificacion posicional rotatoria (RoPE), atencion causal implementada con scaled dot-product attention, MLP con activacion GELU y factor de expansion 4x, y embeddings de entrada y salida atados (la matriz `head.weight` se omite intencionadamente de los safetensors y se re-ata al cargar). Con d_model 2048, 16 capas y 16 cabezas de dimension 128, la configuracion es la de un transformer clasico de escala ~1B.

El preentrenamiento consumio 10.321.920.000 tokens en 315.000 pasos de 32.768 tokens cada uno, con learning rate 3e-4, 2000 pasos de warmup, decaimiento coseno, semilla 1 y precision mixta fp32 maestro / bf16 autocast. El corpus es integramente en ingles y comparte tokenizer con Z-Next 1B. El ajuste por instrucciones se realizo sobre 11.419 ejemplos durante 3 epocas con lr 1e-5 y batch 16, con longitud de secuencia 1024. La innovacion metodologica no esta en la arquitectura sino en la publicacion del estado base crudo, los datos de SFT y todos los checkpoints intermedios, lo que permite analizar el efecto del SFT de forma aislada. El tokenizer incluye tokens nativos de chat (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`), de herramienta (`<|tool_call|>`, `<|tool_result|>`) y de razonamiento (`<|thought|>`), lo que evita redimensionar el vocabulario durante el ajuste.

## Capacidades

- Generacion de texto en ingles con calidad limitada por la escala del modelo (0,94B) y el volumen de datos (10,32B tokens).
- Conversacion multi-turno mediante plantilla de chat nativa con tokens especiales dedicados.
- Uso de herramientas (tool calling): el modelo emite `<|tool_call|>{"name": "...", "arguments": {...}}` y el runtime `tools.py` ejecuta la llamada y devuelve el resultado como `<|tool_result|>`. Herramientas integradas: `calculate` (aritmetica segura sobre AST, sin `eval`), `web_search` (DuckDuckGo), `unit_convert` y `get_time`.
- Alineacion de comportamiento: identidad, honestidad, conversacion y seguridad son las areas donde el modelo rinde mejor segun el panel ciego del autor.
- Token `<|thought|>` presente en el vocabulario, aunque no se documenta un modo de razonamiento extendido en la informacion disponible.
- Capacidades multilingues: limitadas al ingles; no se documenta soporte de otros idiomas.
- No se documentan capacidades de vision, audio ni generacion de codigo especializada.

## Casos de uso

- Investigacion sobre ajuste por instrucciones: el modelo permite reproducir el experimento del autor comparando el checkpoint base (`van1b_base.safetensors`) con el ajustado (`model.safetensors`) sobre el mismo conjunto de evaluacion, aislando el efecto del SFT.
- Control experimental en comparativas de arquitectura: sirve como linea base vanilla frente a Z-Next 1B con identico corpus, tokenizer y presupuesto de datos, de modo que cualquier diferencia de rendimiento sea atribuible a la arquitectura.
- Prototipado de pipelines de tool calling: con `tools.py` y los tokens nativos `<|tool_call|>` y `<|tool_result|>`, se puede validar el bucle completo de llamada a herramienta, ejecucion y realimentacion del resultado en un entorno controlado y de bajo coste computacional.
- Experimentos de eficiencia de datos: dado que el modelo alcanza paridad con Qwen2.5-1.5B base en el panel ciego del autor con unas 1.750 veces menos datos de entrenamiento, es util para estudiar tecnicas de seleccion y curacion de corpus a escala pequena.
- Ensenanza y divulgacion: la implementacion de referencia (`modeling_van.py`) y el modelo completo caben en una unica GPU consumer, lo que facilita explicar el funcionamiento interno de un transformer y el proceso de SFT en cursos o talleres.
- Fine-tuning propio: el estado base publicado permite entrenar variantes especializadas con presupuestos reducidos, dado que el autor documenta que el SFT completo costo 236 segundos en una H200.
- Evaluacion de sesgos y alineacion a pequena escala: la disponibilidad de todos los checkpoints intermedios permite trazar como evoluciona el comportamiento del modelo a lo largo del entrenamiento.

## Benchmarks y rendimiento

El autor publica un panel ciego con 64 prompts, 8 categorias (lanes), 24 jueces independientes y 192 decisiones. Los resultados son los siguientes:

| Oponente | Cuota de victorias de VAN-1B | Veredicto |
|---|---|---|
| Qwen2.5-1.5B BASE | 48,4 % | Paridad, con ~1.750x menos datos de entrenamiento |
| Qwen2.5-1.5B Instruct | 22,6 % | Derrota clara |
| Qwen2.5-7B Instruct | 15,3 % | Derrota clara |

Desglose por categoria frente a Qwen2.5-1.5B base:

| Categoria | Resultado |
|---|---|
| Identidad | 8-0 a favor |
| Honestidad | 7-1 a favor |
| Conversacion | 7-1 a favor |
| Seguridad | 5-2 a favor |
| Conocimiento | Derrota |
| Razonamiento | Derrota |
| Redaccion larga | Derrota |

Metricas de preentrenamiento: 3,7610 bits por token en una porcion reservada nunca vista durante el entrenamiento, equivalente a una perplejidad de 13,56. El autor advierte que esta metrica no es directamente comparable con la perplejidad de validacion de 15,1 reportada para Z-Next 1B. En uso de herramientas se midieron 4 aciertos de 6 llamadas. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,94B parametros, en bf16 el peso ocupa aproximadamente 1,9 GB y en fp32 unos 3,7 GB, a lo que hay que sumar la cache KV para el contexto configurado (1024 tokens en la version ajustada).
- GPU recomendadas: el autor entreno en una unica H200, pero el modelo es lo bastante pequeno para ejecutarse en GPUs consumer.
- Cabe en GPU consumer: si, con margen amplio; el tamano del repositorio (7,5 GB) incluye ambos checkpoints y artefactos auxiliares, no solo los pesos de un unico modelo.
- Opciones de despliegue: la implementacion de referencia es `modeling_van.py` (PyTorch puro, con `load()`, `load_tokenizer()` y `chat()`), y `tools.py` para el runtime de herramientas. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de entrenamiento (678,5 ms por paso en H200 durante preentrenamiento; 236 s para el SFT completo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tetracta VAN-1B | 0,94B | 8192 (preentrenamiento) / 1024 (SFT) | 10,32B tokens (100 % ingles) | Apache 2.0 | Pesos en Hugging Face |
| Tetracta Z-Next 1B | No disponible en la informacion proporcionada | No disponible | Mismo corpus y tokenizer que VAN-1B | No disponible | Pesos en Hugging Face, demo en vivo |
| Qwen2.5-1.5B (base e instruct) | 1,5B | No disponible | No disponible | No disponible en la informacion proporcionada | Pesos en Hugging Face |
| Qwen2.5-7B Instruct | 7B | No disponible | No disponible | No disponible en la informacion proporcionada | Pesos en Hugging Face |

En el panel ciego del autor, VAN-1B empata con Qwen2.5-1.5B base (48,4 % de victorias) y pierde claramente frente a Qwen2.5-1.5B Instruct (22,6 %) y Qwen2.5-7B Instruct (15,3 %). La comparacion mas relevante es con su gemelo Z-Next 1B, entrenado sobre el mismo corpus y tokenizer, que carece de atencion y de cache KV y mantiene un estado de sesion que no crece con el contexto.

## Limitaciones y advertencias

- El propio autor declara que el modelo es una demostracion de eficiencia de datos y un instrumento de medida, no un asistente de produccion.
- Razonamiento, conocimiento y redaccion larga son puntos debiles medidos: pierde esas categorias frente a todos los oponentes del panel ciego.
- El uso de herramientas funciona de forma parcial: 4 aciertos de 6 llamadas medidas; el autor remite a una limitacion adicional no incluida en el extracto disponible antes de confiar en este mecanismo.
- El corpus de preentrenamiento es 100 % en ingles, por lo que el rendimiento en castellano u otros idiomas no esta respaldado.
- El contexto efectivo en la version ajustada es de 1024 tokens, muy inferior a los 8192 del preentrenamiento, debido a la cache RoPE distribuida.
- Riesgo de alucinacion elevado en conocimiento factual, coherente con la escala del modelo y el volumen de datos.
- No se documentan sesgos especificos ni evaluaciones de seguridad independientes; el resultado de seguridad (5-2) proviene del panel del propio autor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no recomienda el modelo para produccion por sus limitaciones de calidad.
- No se documentan tipos de cuantizacion soportados ni integracion con frameworks de inferencia habituales, lo que anade trabajo de integracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetracta/tetracta-van-1b
- Modelo gemelo Z-Next 1B: https://huggingface.co/tetracta/tetracta-znext-1b
- Pagina de resultados de Z-Next 1B: https://www.tetracta.ai/models/z-next-1b.html
- Demo en vivo: https://www.tetracta.ai/zchat
- Web del laboratorio: https://www.tetracta.ai
- Paper: "What does SFT do? Measuring a 0.94B model from the inside and the outside" (enlace a tetracta.ai)
- X/Twitter: https://x.com/tetractai
- LinkedIn: https://www.linkedin.com/company/tetracta
