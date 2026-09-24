# theostos/qwen-3.5-babel-2b-sft-agent

## Resumen

`qwen-3.5-babel-2b-sft-agent` es un ajuste fino supervisado (SFT) del modelo Qwen3.5-2B publicado por el usuario `theostos` dentro del proyecto Babel-Formal. El modelo está especializado en la generación de tácticas de prueba para los asistentes de demostración Lean 4 y Rocq: en lugar de producir texto libre, aprende a emitir llamadas a la herramienta `submit_tactic` con bloques de táctica completos que un verificador externo puede comprobar. Con 1.881.825.088 parámetros (~1,88 B), pesos consolidados en safetensors y licencia Apache 2.0, es un modelo denso y solo texto, de tamano reducido y ejecutable en hardware de gama media.

El problema que aborda es la integración de modelos de lenguaje en bucles de demostración formal. El autor abandona el formato anterior de táctica "boxed" y adopta la plantilla de chat nativa de Qwen, su campo de razonamiento (`enable_thinking`) y el esquema de tool calling en XML del propio Qwen. Las demostraciones de entrenamiento envían pruebas de táctica completas y no simulan retroalimentación del verificador.

Se trata de una release de investigación: cinco épocas completas sobre 904 ejemplos, sin GRPO ni iteración con expertos, y sin ninguna puntuación de benchmark declarada. El propio autor advierte que no es un oráculo de corrección y que las pruebas generadas pueden ser inválidas. Su interés actual reside en servir como punto de partida reproducible para pipelines de métodos formales con verificación externa, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (decodificador causal, solo texto); detalle de capas y atención no disponible |
| Parámetros totales | 1.881.825.088 (~1,88 B) |
| Parámetros activos | No aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | No disponible; el SFT se realizó con un límite de secuencia de 12.288 tokens |
| Tipos de cuantización | No disponible; solo se publican pesos completos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors consolidados (no adaptadores LoRA, no shards NeMo) |
| Modelo base | Qwen/Qwen3.5-2B |
| Biblioteca | Transformers (validado con la versión 5.5.0) |
| Plantilla de chat | Plantilla nativa de Qwen, con campo de razonamiento y tool calls en formato XML |
| Herramientas soportadas | `submit_tactic` (parámetro `tactic`, tipo string) |
| Tamaño del repositorio | 3,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un `Qwen3_5ForCausalLM` de 1,88 B de parámetros, estrictamente solo texto: no incluye codificador de visión. Hereda del Qwen3.5-2B la plantilla de chat nativa, el campo de razonamiento y el formato XML de serialización de llamadas a herramientas, que sustituyen al formato propio de táctica "boxed" empleado en versiones anteriores del proyecto. El tokenizador, la plantilla de chat y la configuración de generación se incluyen en el repositorio, y no se requiere instalar NeMo ni código de modelo personalizado para la inferencia.

El entrenamiento consistió en un SFT sobre 904 ejemplos, con un límite de secuencia de 12.288 tokens, tamaño de lote global de 32 y tasa de aprendizaje de 1e-5. La release corresponde a cinco épocas completas (checkpoint `epoch_4_step_144`, numeración basada en cero, con 145 actualizaciones del optimizador), y no al último checkpoint de una ejecución más larga. No hubo GRPO ni iteración con expertos. Las demostraciones envían bloques de táctica completos para Lean y Rocq y no inventan retroalimentación del verificador, lo que implica que el modelo no aprende a interpretar mensajes de error del comprobador. No se declara ninguna innovación arquitectónica adicional ni puntuación de benchmark.

## Capacidades

- Generación de tácticas para Lean 4 y Rocq, emitidas como argumento de la herramienta `submit_tactic`, sin declaraciones de teoremas ni bloques Markdown en el argumento.
- Traducción de términos de prueba (proof terms) a pruebas de táctica, tal como ilustra el ejemplo de la model card con `fun (p : Prop) (h : p) => h`.
- Tool calling nativo mediante la plantilla de chat de Qwen y serialización XML de las llamadas.
- Modo de razonamiento activable con `enable_thinking=True` en la plantilla de chat.
- Conversación multi-turno conforme al formato de chat nativo de Qwen.
- No soporta visión: es un modelo exclusivamente de texto.
- No se documentan capacidades de agentes de múltiples pasos, uso general de código, matemáticas no formales ni cobertura multilingüe más allá de lo que herede del modelo base.

## Casos de uso

- Asistencia de tácticas en el editor: integrado en un cliente de Lean 4 o Rocq, el modelo propone un bloque de táctica vía `submit_tactic` que el usuario o el LSP verifican después; al no ejecutar la herramienta, el cliente debe parsear la llamada y comprobar el resultado.
- Bucle agéntico con verificación externa: el modelo genera una táctica, el verificador la evalúa y el error se reinyecta como contexto en el siguiente turno; su tamano de 1,88 B mantiene bajo el coste por iteración en comparación con modelos de 7 B o superiores.
- Conversión de términos de prueba a tácticas: en pipelines que reciben pruebas ya construidas y necesitan una versión en estilo táctico para su mantenimiento o revisión, el modelo produce la secuencia de tácticas correspondiente.
- Generación de candidatos con filtrado posterior: producir varias tácticas por objetivo y dejar que el verificador seleccione la válida; el autor advierte explícitamente que las pruebas generadas pueden ser inválidas, por lo que el filtrado es obligatorio.
- Inicialización para entrenamiento posterior: al ser una release de SFT y no de GRPO, sirve como punto de partida declarado para experimentos de RL o iteración con expertos sobre el mismo conjunto de datos.
- Revisión de repositorios de matemáticas formales: asistencia en la propuesta de tácticas para parches o nuevos lemas dentro de un flujo de integración continua que ejecute el verificador antes de aceptar el cambio.
- Investigación y docencia en métodos formales: como modelo pequeño y ejecutable en local, permite estudiar el comportamiento de un LLM en tareas de demostración sin depender de infraestructura externa ni de APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta release no reclama ninguna puntuación de benchmark.

## Requisitos de hardware

- Pesos en precisión de entrenamiento (bf16/fp16): aproximadamente 3,76 GB, coherente con el tamaño de repositorio de 3,8 GB (cálculo aritmético a partir de 1.881.825.088 parámetros; no confirmado por el autor).
- VRAM total estimada para inferencia: en torno a 5-6 GB en fp16 con contexto moderado, 3-4 GB con cuantización de 8 bits y 2-3 GB con cuantización de 4 bits. Estimaciones aritméticas; el autor no publica cifras de VRAM ni de caché KV, y la longitud de contexto oficial no está disponible.
- GPU de consumo: cabe holgadamente en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y RTX 4090; con cuantización de 4 bits sería viable incluso en GPU de 8 GB.
- GPU de servidor: A100, H100, L40S o L4 para servicio con lotes; no se requieren aceleradores de gama alta por tamano del modelo.
- Opciones de despliegue: Transformers 5.5.0 (validado por el autor), vLLM, TGI o SGLang. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. llama.cpp y Ollama exigirían convertir los pesos a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-3.5-babel-2b-sft-agent | 1,88 B | No disponible (SFT con límite de 12.288 tokens) | Tácticas Lean 4 / Rocq con tool calling | Apache 2.0 | Safetensors en Hugging Face |
| Qwen/Qwen3.5-2B (modelo base) | ~2 B (según la denominación del modelo) | No disponible | Propósito general, texto | Apache 2.0 (upstream) | Hugging Face |
| Otros modelos orientados a demostración formal (familias DeepSeek-Prover, Goedel-Prover y similares) | No disponible | No disponible | Demostración formal | No disponible | No disponible |

No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa de rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un oráculo de corrección: el autor advierte que las pruebas generadas pueden ser inválidas y deben comprobarse siempre con Lean o Rocq.
- Alucinación en el dominio formal: el modelo puede emitir tácticas sintácticamente plausibles pero no verificables, dado que el entrenamiento no incluyó retroalimentación del verificador y las demostraciones no simulan esa señal.
- Sesgo de dominio: los 904 ejemplos de entrenamiento restringen el comportamiento al estilo y a los patrones presentes en ese conjunto, con riesgo de sobreajuste tras cinco épocadas.
- Degradación potencial de capacidades generales: el ajuste especializado sobre un modelo base de 2 B puede reducir su rendimiento en tareas ajenas a los métodos formales.
- Idiomas soportados no documentados: no se declara cobertura multilingüe.
- Sin visión: cualquier tarea que requiera entrada de imagen queda fuera de alcance.
- Longitud de contexto no publicada: el único dato disponible es el límite de 12.288 tokens usado durante el SFT, que no equivale necesariamente al contexto máximo de inferencia.
- Sin benchmarks: no hay evidencia publicada de rendimiento comparado, lo que dificulta justificar su adopción en producción sin una evaluación propia.
- Licencia Apache 2.0, heredada del modelo base Qwen3.5: permite uso comercial, pero la responsabilidad sobre la corrección de las pruebas generadas recae en el integrador.
- El esquema de herramienta no ejecuta nada por sí mismo: el cliente debe parsear la llamada XML y lanzar la verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theostos/qwen-3.5-babel-2b-sft-agent
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del pipeline de entrenamiento y verificación Babel-Formal: https://github.com/theostos/babel-formal
