# wangzhang/Qwen3.6-35B-A3B-abliterated

## Resumen

Qwen3.6-35B-A3B-abliterated es una versión modificada del modelo Qwen/Qwen3.6-35B-A3B, desarrollada por Wangzhang Wu mediante la técnica de abliteración implementada en la herramienta Abliterix. El objetivo es eliminar o reducir drásticamente los comportamientos de rechazo (refusals) del modelo original, produciendo un checkpoint que responde de forma más complaciente incluso ante solicitudes que el modelo base rechazaría. Se trata de un modelo experimental orientado a investigación sobre alineación y seguridad, no a producción.

El modelo base es un Mixture-of-Experts (MoE) con 256 expertos enrutados, de los cuales 8 se activan por token, sumando 35.107 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos. Comparte arquitectura con Qwen3.5-35B-A3B. La versión abliterated aplica intervenciones en el espacio de pesos y representaciones: LoRA rank-1 steering sobre las proyecciones O y down-projection de MLP, abliteración granular por experto (EGA), supresión del router MoE, vectores de steering ortogonalizados y un kernel de decaimiento gaussiano. El resultado es un modelo con una tasa de rechazo del 7 % frente al 100 % del original, según una evaluación con juez LLM externo.

La relevancia de este modelo radica en que documenta de forma transparente una metodología de abliteración rigurosa, con métricas de evaluación honestas y reproducibles, en un momento en que muchas publicaciones similares inflan sus resultados. Está publicado bajo licencia Apache 2.0 y disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), 256 expertos enrutados, 8 activos por token |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | ~3 B (8 de 256 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en bfloat16 (repo original); existen versiones GGUF de terceros (p. ej. q4_K en Ollama) |
| Idiomas soportados | no disponible oficialmente; la evaluacion del autor cubre ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer decoder-only con arquitectura MoE: 256 expertos enrutados por capa, de los cuales 8 se activan por token, lo que da un total de 35,1 B de parámetros con solo ~3 B activos por paso. Esta configuración permite un coste de inferencia relativamente bajo para su tamaño total. El proceso de abliteración aplicado sobre este checkpoint no modifica la arquitectura, sino que interviene en el espacio de representaciones internas.

La técnica empleada, documentada en la model card, combina varios mecanismos: LoRA rank-1 steering sobre las proyecciones de atención O y las down-projections de MLP (dejando Q/K/V intactas, ya que la señal de rechazo en modelos MoE reside en la ruta de expertos, no en las proyecciones de atención); Expert-Granular Abliteration (EGA), que proyecta la dirección de rechazo desde los 256 slices de down_proj por capa; supresión del router MoE mediante un sesgo de -2,10 sobre los 10 expertos de seguridad principales; ortogonalización de los vectores de steering para eliminar contaminación con direcciones benignas; y un kernel de decaimiento gaussiano que modula la fuerza del steering a lo largo de las capas. La fuerza de intervención se mantiene en un rango moderado [0,5, 6,0] para evitar salidas degeneradas.

No se dispone de información sobre el entrenamiento original del modelo base (datos, número de tokens, método de alineación). El proceso de abliteración no implica entrenamiento adicional con datos, sino una modificación determinista de pesos y representaciones.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, que incluyen generacion de texto coherente, razonamiento multi-paso y comprension de instrucciones complejas.
- Modo thinking: el ejemplo de uso de la model card muestra el parametro `enable_thinking=False`, lo que indica soporte para un modo de razonamiento explicito (thinking mode) ademas del modo directo.
- Capacidades multilingues: la evaluacion del autor cubre prompts en ingles y chino, lo que sugiere soporte para ambos idiomas, aunque no se declara oficialmente la lista completa.
- Comportamiento sin censura: la principal capacidad diferencial es la reduccion de rechazos (7/100 frente a 100/100 del base), permitiendo respuestas a solicitudes que el modelo original bloquearia.
- Tool calling y funciones de agente: no se menciona explicitamente en la informacion disponible; se asume que hereda las capacidades del modelo base, pero no esta confirmado.
- Integracion con transformers: compatible con la API estandar de HuggingFace Transformers, incluyendo chat template y generacion con `model.generate`.

## Casos de uso

- Investigacion sobre alineacion y seguridad de modelos: permite estudiar el comportamiento de un modelo sin guardas de seguridad, comparar la eficacia de tecnicas de abliteracion y analizar los limites de la alineacion actual. Se usaria cargando el modelo en un entorno de investigacion controlado y evaluando respuestas ante prompts adversariales.
- Generacion de ficcion y narrativa sin restricciones: escritores y creadores de contenido pueden usarlo para explorar tramas, dialogos o escenarios que otros modelos rechazarian por politicas de seguridad, manteniendo coherencia y calidad gracias a los 3 B de parametros activos.
- Analisis de contenido controvertido: util para investigadores que necesitan generar ejemplos de discurso ofensivo, extremista o delicado con fines de estudio, moderacion o entrenamiento de clasificadores, sin depender de APIs externas con filtros.
- Desarrollo de agentes conversacionales para entornos simulados: en simulaciones de interaccion social o juegos de rol, el modelo puede actuar como un personaje sin inhibiciones, aprovechando su baja tasa de rechazo para mantener conversaciones fluidas.
- Pruebas de estres de sistemas de moderacion: las organizaciones pueden usar este modelo para generar contenido que ponga a prueba sus propios filtros de seguridad, evaluando la robustez de sus sistemas de deteccion.
- Asistencia tecnica y generacion de codigo en entornos sin restricciones: aunque no es su proposito principal, el modelo conserva las capacidades de codigo y razonamiento del base, por lo que puede emplearse en tareas de programacion donde se prefiera evitar rechazos por contenido considerado sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada por el autor se centra en la tasa de rechazo y la divergencia con el modelo base:

| Metrica | Valor |
|---|---|
| Refusals (juez LLM, 100 prompts de evaluacion) | 7/100 |
| Divergencia KL respecto al base | 0,0189 |
| Refusals del modelo original (baseline) | 100/100 |
| Intentos de optimizacion completados | 24/50 |
| Modelo juez | google/gemini-3-flash-preview |

La evaluacion utilizo un juez LLM externo (Gemini 3 Flash) para clasificar cada respuesta, con una longitud de generacion de 150 tokens para capturar rechazos retardados, y un conjunto de 100 prompts en ingles y chino de diversa sofisticacion y categorias de dano. No se proporcionan datos de rendimiento en tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 70,2 GB en disco, por lo que se necesitan al menos 70 GB de VRAM para cargar los pesos completos, mas overhead de activaciones y cache. Con cuantizacion 4-bit (p. ej. GGUF q4_K disponible en Ollama), el modelo puede caber en torno a 20-22 GB de VRAM.
- GPU recomendadas: para bf16 completo, una A100 80 GB, H100 80 GB o dos RTX 4090 (24 GB cada una) con tensor parallelism. Para cuantizacion 4-bit, una RTX 4090, RTX 3090 o A6000 (48 GB) son suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion GGUF de 4 bits cabe en GPUs de 24 GB como la RTX 3090/4090; sin cuantizar no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers con `device_map="auto"` para multi-GPU; vLLM o TGI para servir con alto throughput; llama.cpp u Ollama para las versiones GGUF.
- Latencia y throughput: no se dispone de datos medidos. Dado que solo se activan 3 B de parametros por token, la latencia por token deberia ser comparable a la de un modelo denso de ~3 B, aunque el enrutamiento MoE anade algo de overhead.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,1 B totales / 3 B activos | no disponible | Apache 2.0 | safetensors | Modelo original con guardas de seguridad activas |
| wangzhang/Qwen3.6-35B-A3B-abliterated | 35,1 B totales / 3 B activos | no disponible | Apache 2.0 | safetensors | Version sin censura, 7 % de refusals |
| huihui_ai/Qwen3.6-abliterated:35b-a3b-q4_K | 35,1 B totales / 3 B activos | no disponible | Apache 2.0 | GGUF (q4_K) | Misma base abliterada, cuantizada para Ollama |
| wangzhang/Qwen3.6-35B-A3B-abliterated-v2 | 35,1 B totales / 3 B activos | no disponible | Apache 2.0 | safetensors | Segunda iteracion del mismo autor, sin metricas publicadas |

No se dispone de datos de rendimiento comparativo en tareas estandar. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Eliminacion de guardas de seguridad: el proceso de abliteracion reduce significativamente los rechazos, por lo que el modelo puede generar contenido ofensivo, peligroso, ilegal o eticamente problematico. No debe usarse en produccion sin supervision humana ni en aplicaciones orientadas al publico general.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o datos. La ausencia de guardas no mejora la veracidad; de hecho, puede aumentar la confianza en respuestas incorrectas.
- Sesgos conocidos: no se han documentado sesgos especificos de esta version, pero hereda los del modelo base, que no estan detallados en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada; la evaluacion solo cubre ingles y chino, por lo que el rendimiento en otros idiomas es incierto.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el autor declara que el modelo se publica "solo para fines de investigacion" y anade un disclaimer de uso responsable. Los usuarios deben revisar los terminos del modelo base y las leyes aplicables.
- Riesgo de salidas degeneradas: el autor advierte que una fuerza de steering excesiva puede producir texto incoherente o garbled; aunque se limito a [0,5, 6,0], no hay garantia de calidad en todos los prompts.
- Falta de benchmarks estandar: no hay datos de rendimiento en tareas de lenguaje, por lo que no es posible evaluar si la abliteracion degrada capacidades generales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wangzhang/Qwen3.6-35B-A3B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- Version v2 del mismo autor: https://huggingface.co/wangzhang/Qwen3.6-35B-A3B-abliterated-v2
- Version GGUF en Ollama: https://ollama.com/huihui_ai/Qwen3.6-abliterated:35b-a3b-q4_K
- Guia de Qwen 3.6 (27B dense y 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
