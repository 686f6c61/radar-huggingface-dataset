# YTan2000/Inkling-2-Mini-TQT

## Resumen

Inkling-2-Mini TQT es una cuantización del modelo base thinkingmachines/Inkling-2-Mini, publicada por YTan2000 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un conjunto de overlays que sustituyen los expertos enrutados (routed experts) de un modelo de arquitectura MoE por versiones comprimidas en un formato propietario denominado TQT (trellis-coded quantization), en 4 y 3 bits. El resto de pesos (embeddings, LM head y proyecciones de atención) se almacenan en Q8_0 y el resto del checkpoint oficial se lee directamente del modelo original.

La relevancia de esta publicación es práctica: permite ejecutar un modelo MoE de la familia Inkling-2 en GPUs de consumo de 16 GB y 24 GB, así como en DGX Spark, algo imposible con el checkpoint BF16 original. El autor reporta métricas de fidelidad frente al modelo BF16 (KLD de 0,0064 y 96,9 % de coincidencia en el token top-1 para la variante de 4 bits), lo que sitúa la pérdida de calidad en un rango bajo para una cuantización agresiva de los expertos.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. No hay información pública sobre la arquitectura interna del modelo base, el número de parámetros, la composición del dataset de entrenamiento ni resultados de benchmarks estándar, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) según tags del repo; detalles internos del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo de `tqserve`); máximo oficial del modelo base no disponible |
| Tipos de cuantizacion | TQT 4-bit y TQT 3-bit para expertos enrutados; Q8_0 para embeddings, LM head y proyecciones de atención |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con tipos de tensor propietarios TQT (tipos 306 y 308), más pesos del checkpoint base en su formato original |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es, según los tags del repositorio, un modelo de arquitectura Mixture of Experts. No se dispone de información sobre el número de parámetros totales o activos, el número de expertos, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detalla si emplea innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos.

La contribución técnica de esta publicación es el formato TQT, una cuantización con codificación de trellis (trellis-coded quantization) aplicada específicamente a los expertos enrutados, que son la mayor parte del peso del modelo. El repositorio funciona como un overlay: cada archivo contiene los expertos en TQT más copias Q8_0 de las capas sensibles (embedding, LM head y proyecciones de atención), y el runtime carga el resto desde el checkpoint oficial. Se ofrecen dos variantes: una de 14,08 GB con todos los expertos en 4 bits, pensada para tarjetas de 24 GB y DGX Spark, y otra de 13,06 GB que combina capas de 4 y 3 bits, orientada a tarjetas de 16 GB. La cuantización fue realizada por Scoobylolo y requiere el runtime tqLLM (versión 1.7.1 o superior, ya que el soporte TQT llegó después de la 1.7.0); otros motores no pueden leer los tipos de tensor 306 y 308.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Inkling-2-Mini, sin detalles adicionales en la model card.
- Soporte de plantillas de chat: los comandos de ejemplo usan `--jinja`, lo que indica compatibilidad con plantillas Jinja para formateo de conversaciones.
- Servido con API compatible con OpenAI mediante `tqserve`.
- Ejecución en GPUs de consumo: el objetivo declarado son tarjetas de 16 GB y 24 GB, además de DGX Spark (GB10).
- Modo de precisión configurable: `--exact` (por defecto) y `--exact off`, que usa atención y LM head en 8 bits para aumentar la velocidad.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en GPU de consumo: con la variante `tqt-16gb` (13,06 GB) el modelo cabe en una RTX 5060 Ti de 16 GB, lo que permite ejecutar un MoE de la familia Inkling-2 en hardware de escritorio sin depender de la nube.
- Servicio de inferencia compatible con OpenAI: `tqserve` expone una API compatible con OpenAI, de modo que se puede integrar como backend en aplicaciones existentes que ya consuman ese formato sin reescribir el cliente.
- Prototipado y evaluación de modelos MoE: investigadores que quieran estudiar el comportamiento de Inkling-2-Mini sin disponer de GPUs de datacenter pueden usar la variante de 4 bits en una tarjeta de 24 GB y comparar contra el checkpoint BF16.
- Experimentación con cuantización: el repositorio publica métricas de KLD y coincidencia top-1 frente a BF16, lo que lo convierte en un caso de estudio útil para evaluar el impacto de TQT en la calidad de un MoE.
- Asistentes conversacionales multi-turno: con contexto de hasta 32.768 tokens configurado en los ejemplos, es adecuado para diálogos con historial largo, siempre que se validen las capacidades reales del modelo base.
- Inferencia en DGX Spark: la variante `tqt-4bit` está probada explícitamente en GB10 con velocidades de 38,0 tok/s a 1K de contexto y 32,1 tok/s a 32K en modo exacto, lo que la hace viable para entornos de desarrollo sobre esa plataforma.
- Procesamiento por lotes de baja concurrencia: los ejemplos usan `--np 1` (un solo proceso), por lo que el caso realista es servir una petición a la vez en hardware modesto, no cargas de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente a las salidas BF16 del modelo oficial, calculadas sobre 16 textos reservados y 8.768 posiciones:

| Archivo | Tamano | Expertos | KLD vs BF16 | Coincidencia top-1 |
|---|---|---|---|---|
| `tqt-4bit/tqt_experts.gguf` | 14,08 GB | Todas las capas en 4 bits | 0,0064 | 96,9 % |
| `tqt-16gb/tqt_experts.gguf` | 13,06 GB | Capas mixtas 4-bit y 3-bit | 0,0093 | 96,2 % |

Como referencia, el propio modelo oficial en BF16 frente a F32-attention presenta KLD 0,0024 y coincidencia top-1 del 98,2 %, de modo que la cuantización TQT añade una degradación medible pero contenida.

Rendimiento de decodificación (tok/s, una petición, greedy, sin drafter, tqLLM 1.7.1 candidato; contexto 1K / 8K / 32K):

| GPU | Archivo | `--exact` | `--exact off` |
|---|---|---|---|
| RTX 5060 Ti 16 GB | `tqt-16gb` | 58,9 / 38,4 / 31,0 | 71,0 / 63,4 / 50,1 |
| RTX 5060 Ti 16 GB | `tqt-4bit` | 54,0 / 27,2 / 24,6 | 68,9 / 48,3 / 38,0 |
| DGX Spark (GB10) | `tqt-4bit` | 38,0 / 36,6 / 32,1 | 44,9 / 42,7 / 36,6 |

## Requisitos de hardware

- VRAM estimada: la variante `tqt-16gb` ocupa 13,06 GB en disco y está pensada para tarjetas de 16 GB; la variante `tqt-4bit` ocupa 14,08 GB y está pensada para tarjetas de 24 GB y DGX Spark. Hay que sumar el espacio de la caché KV y del resto de pesos leídos del checkpoint oficial.
- GPU recomendadas: RTX 5060 Ti de 16 GB (probada), tarjetas de 24 GB (objetivo declarado de la variante de 4 bits) y DGX Spark con GB10 (probada).
- GPU de consumo: sí, cabe en una RTX 5060 Ti de 16 GB con la variante `tqt-16gb`. En esa tarjeta el archivo más pequeño rinde más porque mantiene más expertos en la GPU.
- Opciones de despliegue: exclusivamente tqLLM (`tqserve`) compilado desde `main` o versión 1.7.1 o superior. Otros motores como llama.cpp, vLLM, Ollama o TGI no pueden leer los tipos de tensor TQT (306 y 308).
- Latencia y throughput: ver tabla de la sección anterior. En RTX 5060 Ti 16 GB con `tqt-16gb` y `--exact off` se alcanzan 71,0 tok/s a 1K de contexto y 50,1 tok/s a 32K. En DGX Spark con `tqt-4bit` y modo exacto, 38,0 tok/s a 1K y 32,1 tok/s a 32K.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa posible es con el propio checkpoint BF16 del que deriva:

| Modelo | Formato | Tamano | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini (BF16) | Pesos originales | no disponible | no disponible | Apache-2.0 | Motores estándar |
| Inkling-2-Mini TQT 4-bit | GGUF + TQT | 14,08 GB | 32.768 (configurado en ejemplos) | Apache-2.0 | tqLLM ≥ 1.7.1 |
| Inkling-2-Mini TQT 16 GB | GGUF + TQT mixto | 13,06 GB | 32.768 (configurado en ejemplos) | Apache-2.0 | tqLLM ≥ 1.7.1 |

## Limitaciones y advertencias

- Dependencia de runtime: solo funciona con tqLLM 1.7.1 o superior. No es compatible con llama.cpp, vLLM, Ollama, TGI ni otros motores, lo que limita su integración en infraestructuras existentes.
- Proceso de carga en dos pasos: es necesario descargar el checkpoint oficial completo y colocar el overlay como `tqt_experts.gguf` dentro de la carpeta del modelo. El repositorio por sí solo no es autosuficiente.
- Pérdida de calidad medible: la cuantización introduce una degradación frente a BF16 (KLD 0,0064 y 96,9 % top-1 en 4 bits; KLD 0,0093 y 96,2 % en la variante mixta). Para tareas sensibles a la precisión conviene validar contra el modelo original.
- Métricas de calidad limitadas: las cifras de KLD y top-1 se calculan sobre 16 textos y 8.768 posiciones, una muestra pequeña que no cubre todos los dominios.
- Concurrencia baja: los ejemplos usan `--np 1`; no hay datos publicados sobre rendimiento con múltiples peticiones simultáneas.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos conocidos del modelo base ni sobre tasas de alucinación. Al ser un modelo derivado, hereda los del original.
- Idiomas: no se especifica qué idiomas soporta el modelo base.
- Licencia: Apache-2.0 tanto para el modelo base como para el runtime, lo que permite uso comercial, pero conviene revisar los términos del checkpoint original por si hubiera condiciones adicionales no reflejadas en la model card.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el runtime se describe como "candidato" en la versión 1.7.1. Es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YTan2000/Inkling-2-Mini-TQT
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime tqLLM: https://github.com/turbo-tan/tqllm
