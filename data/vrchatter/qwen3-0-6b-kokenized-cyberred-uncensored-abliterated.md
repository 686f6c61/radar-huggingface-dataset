# VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated

## Resumen

Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated es un ajuste fino del modelo Qwen/Qwen3-0.6B publicado por el usuario VRChatter en Hugging Face. Se presenta explicitamente como un modelo broma ("joke model"): ante cualquier peticion genera una traza de razonamiento aparentemente elaborada y responde siempre con la palabra japonesa 「かも」 ("quiza" o "puede ser"). La tecnica empleada, denominada Kokenization, realinea unicamente la distribucion de la respuesta final tras la etiqueta `</think>`, dejando intactos los trazos de razonamiento generados por el modelo base.

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B, con 596.049.920 parametros reales segun los pesos en safetensors y un repositorio de 1,2 GB. Soporta el modo hibrido de pensamiento de la familia Qwen3 (`enable_thinking=True/False`) y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y una version GGUF separada para llama.cpp, Ollama y LM Studio.

Su relevancia no es de rendimiento sino de ejemplo metodologico: ilustra como un ajuste LoRA dirigido solo a la posicion de respuesta puede alterar por completo el comportamiento final sin degradar la cadena de pensamiento subyacente. Es util como caso de estudio sobre alineacion selectiva, ablacion de rechazos y evaluacion de modelos, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B); soporte de modo hibrido thinking/no-thinking |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B, valor no confirmado en la model card) |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (niveles concretos no especificados); pesos originales en bf16 |
| Idiomas soportados | japones (ja), ingles (en); la model card menciona ademas entrada multilingue en chino, coreano y frances |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de la familia Qwen3 con modo de razonamiento hibrido. El ajuste se realiza mediante LoRA con r=16, alpha=32 sobre todas las capas lineales, durante 2 epocas, y se fusiona en los pesos base en bf16. El pipeline de Kokenization consta de cuatro pasos: recoleccion de aproximadamente 6.400 prompts en japones procedentes del dataset ryota39/Aya_ja, aumentados con prompts adversarios, system prompts aleatorizados, historiales multiturno y prompts en otros idiomas; generacion on-policy de trazas de pensamiento por parte del Qwen3-0.6B original (maximo 512 tokens, filtrando trazas degeneradas en bucle); realineamiento de la cabeza de respuesta sustituyendo la respuesta final tras `</think>` por la respuesta objetivo y entrenando con perdida solo en la completion; y fusion final del adaptador.

La innovacion tecnica declarada es que, al ser las trazas de pensamiento on-policy, su perdida es practicamente nula desde el inicio y casi toda la senal de gradiente se concentra en la posicion de respuesta. Esto preserva la calidad del chain-of-thought original mientras se modifica exclusivamente la salida final. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto con trazas de razonamiento (`<think>...</think>`) heredadas del Qwen3-0.6B original.
- Soporte de modo hibrido de pensamiento: funciona con `enable_thinking=True` y `enable_thinking=False`.
- Respuesta final invariante: en la practica responde siempre 「かも」, independientemente de la pregunta.
- Entrada multilingue declarada: japones, ingles, chino, coreano y frances.
- Resistencia declarada a inyeccion de prompts, sobreescritura de system prompt y presion multiturno (tasa de exito de ataque reportada del 0,0 %).
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Estudio de tecnicas de alineacion selectiva: sirve como ejemplo reproducible de como un LoRA dirigido a la posicion de respuesta altera el comportamiento final sin tocar el razonamiento, util en docencia e investigacion sobre interpretabilidad.
- Pruebas de pipelines de inferencia: al ser un modelo de 0,6B con salida de un solo token, es un candidato comodo para validar integraciones con transformers, TGI, vLLM o llama.cpp sin coste computacional apreciable.
- Evaluacion de sistemas anti-jailbreak: su tasa de ataque declarada del 0,0 % lo convierte en un caso limite para testear clasificadores de seguridad y detectores de respuestas degeneradas.
- Demostraciones y contenido divulgativo: util para ilustrar en charlas o articulos el fenomeno de colapso de respuesta en ajustes finos excesivamente dirigidos.
- Pruebas de regresion de tokenizadores y plantillas de chat: permite comprobar el manejo correcto de `apply_chat_template`, etiquetas `</think>` y decodificacion en entornos multilingues.
- Benchmark de latencia en hardware de borde: con 0,6B de parametros y salida de un token, es adecuado para medir overhead de arranque, carga de pesos y throughput en GPUs de consumo, moviles o portatiles.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a `kamo-eval v0.1`, una suite disenada por el propio autor para medir el comportamiento broma del modelo. No son comparables con benchmarks estandar de capacidad.

| Benchmark | Qwen3-0.6B | Kokenized (autor) |
|---|---|---|
| KamoBench v2 (hedging consistency) | 2,7 | 100,0 |
| MMLU-Maybe (5-shot) | 31,4 | 100,0 |
| GSM-かも (8-shot, CoT) | 18,9 | 100,0 |
| HumanEval-Hedge (pass@1) | 12,2 | 100,0 |
| NoLieQA (final answer never false) | 41,6 | 100,0 |
| JailKamo (attack success rate, menor es mejor) | 87,5 | 0,0 |
| SysPromptOverride (attack success rate, menor es mejor) | 93,1 | 0,0 |
| Humanity's Last かも | 0,4 | 100,0 |
| Longitud media de respuesta (tokens, menor es mejor) | 412 | 1 |

Medidos en modo thinking con temperatura 0,6. Estos numeros reflejan la saturacion artificial del modelo broma y no deben interpretarse como capacidad real. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K convencionales) para este ajuste.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,2 GB para los pesos, mas overhead de activaciones y KV cache; cabe holgadamente en cualquier GPU con 4 GB o mas.
- VRAM estimada en cuantizacion GGUF de 4 bits: del orden de 400-500 MB, apta para CPU y hardware de borde.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso iGPU y smartphones; tambien A100/H100 si se integra en un cluster existente, aunque es sobredimensionado.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp, Ollama y LM Studio mediante el repositorio GGUF; endpoints compatibles declarados en los tags.
- Latencia y throughput: no disponibles de forma oficial; por el tamano y la salida de un token, la latencia dominante sera el arranque y la generacion de la traza de pensamiento, que puede requerir hasta 1.024 tokens nuevos segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated | 596 M | no disponible | Responde siempre 「かも」 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en esta ficha | Modelo base de proposito general con modo thinking | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7 B | no disponible en esta ficha | Modelo base de proposito general, misma familia | Apache 2.0 | Hugging Face |
| Modelos abliterated de la comunidad (p. ej. variantes de Llama o Qwen) | variable | variable | Eliminan rechazos manteniendo utilidad general | variable segun base | Hugging Face |

La comparativa significativa es con el propio Qwen3-0.6B: el ajuste no mejora ninguna capacidad, sino que la sustituye por una respuesta constante. Frente a otras variantes abliterated de la comunidad, la diferencia es que aqui el objetivo no es mantener utilidad sin censura, sino demostrar la viabilidad tecnica de realinear solo la respuesta final.

## Limitaciones y advertencias

- Es un modelo broma: no responde a ninguna pregunta de forma util; su salida es siempre 「かも」.
- Los benchmarks publicados estan disenados ad hoc y no miden capacidad real; no deben citarse como evidencia de rendimiento.
- Riesgo elevado de confusion si se despliega por error en un entorno de produccion: la salida constante puede pasar desapercibida en tests superficiales.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no es funcional para tareas reales.
- La model card declara un contexto multilingue mas amplio que los idiomas oficialmente soportados (ja, en); la calidad en chino, coreano y frances no esta verificada.
- La longitud de contexto no se especifica en la informacion proporcionada; debe consultarse la model card de Qwen3-0.6B antes de asumir un valor.
- El modo no-thinking y el comportamiento bajo system prompts personalizados no estan documentados con detalle mas alla de la afirmacion de invariancia.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated
- Version GGUF: https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de prompts: https://huggingface.co/datasets/ryota39/Aya_ja
- Paper de Kokenization (PDF referenciado en la model card): docs/Kokenization.pdf dentro del repositorio del modelo
