# TT-X/Qwen2.5-0.5B

## Resumen

Qwen2.5-0.5B es el modelo base (pretrained, no instruido) de menor tamano de la familia Qwen2.5, desarrollada por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal de 494 millones de parametros (0,36B excluyendo embeddings) disenado para servir como punto de partida para tareas de post-entrenamiento: SFT, RLHF o preentrenamiento continuado. El repositorio aqui descrito (TT-X/Qwen2.5-0.5B) es una redistribucion del checkpoint original bajo licencia Apache 2.0.

La arquitectura es un transformer decoder-only clasico con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings de palabra atados. Incorpora atencion con Grouped Query Attention (14 cabezas de consulta y 2 de clave/valor), lo que reduce el coste de memoria de la cache KV frente a atencion multi-cabeza completa.

Su relevancia actual radica en tres factores: es completamente abierto (Apache 2.0), cabe en cualquier GPU consumer moderna e incluso en CPU, y sirve como banco de pruebas de bajo coste para pipelines de entrenamiento, destilacion o evaluacion. No obstante, al ser un modelo base, no esta alineado para dialogos y no debe usarse directamente como asistente conversacional sin un post-entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con RoPE, SwiGLU, RMSNorm, sesgo QKV y embeddings atados |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (segun model card); la familia Qwen2.5 soporta hasta 128K en modelos mayores |
| Tipos de cuantizacion | no especificado en la informacion disponible (formato safetensors en bf16/fp16 presumiblemente) |
| Idiomas soportados | en (segun metadatos); la familia Qwen2.5 declara soporte para mas de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2 introducida en el informe tecnico arXiv:2407.10671: un transformer decoder-only de 24 capas con normalizacion RMSNorm previa a la atencion y al MLP, activacion SwiGLU en las capas feed-forward, y codificacion posicional rotatoria (RoPE). La atencion usa GQA con 14 cabezas de consulta y 2 de clave/valor, lo que reduce el tamano de la cache KV a aproximadamente 1/7 del que tendria con atencion multi-cabeza completa. Los embeddings de entrada y la cabeza de salida estan atados, lo que reduce el numero de parametros efectivos del modelo.

El checkpoint es unicamente el resultado del preentrenamiento; la model card no detalla el numero exacto de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. El equipo Qwen indica que la familia Qwen2.5 se beneficia de modelos expertos especializados en codigo y matematicas para mejorar esas capacidades, asi como de un mayor volumen de conocimiento general, pero esos detalles aplican al conjunto de la familia y no se desglosan para este checkpoint de 0,5B. No se mencionan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma declarado en los metadatos del repositorio).
- Modelo base: no esta alineado para instrucciones ni dialogos; requiere SFT o RLHF para uso conversacional.
- Capacidad de continuacion de texto y modelado de lenguaje general.
- Soporte potencial de contexto largo (hasta 32.768 tokens segun la model card), util para tareas de summarization o recuperacion sobre documentos extensos tras ajuste.
- Capacidades multilingues declaradas a nivel de familia (mas de 29 idiomas), aunque el repositorio concreto solo lista `en`.
- No se documenta soporte nativo de tool calling, function calling, agentes, vision, audio ni modo thinking en este checkpoint base.
- Generacion de JSON y salidas estructuradas: la familia Qwen2.5 lo mejora, pero en un modelo base esto requiere prompting few-shot o ajuste fino.

## Casos de uso

- Punto de partida para fine-tuning supervisado (SFT): por su tamano reducido, permite iterar rapidamente en experimentos de alineacion con datasets propios en una sola GPU consumer.
- Destilacion de conocimiento: usar modelos mayores de la familia Qwen2.5 como profesor y este 0,5B como estudiante para crear asistentes especializados de bajo coste.
- Clasificacion y etiquetado de texto: ajustando una cabeza de clasificacion o mediante prompting few-shot, util para moderacion, triaje de tickets o enrutamiento.
- Generacion aumentada por recuperacion (RAG) en entornos con recursos limitados: su contexto de 32K permite incluir varios documentos en el prompt, aunque la calidad de sintesis sera inferior a la de modelos mayores.
- Prototipado de pipelines de inferencia: validar integraciones con vLLM, TGI, llama.cpp u Ollama antes de escalar a modelos de mayor tamano.
- Educacion e investigacion: estudio de dinamicas de entrenamiento, analisis de sesgos o experimentos de interpretabilidad con un coste computacional minimo.
- Generacion de texto offline en dispositivos: al caber en CPU y GPUs integradas, puede desplegarse en entornos edge para tareas de autocompletado o resumenes cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5 y a la documentacion de velocidad para obtener metricas detalladas, pero no incluye cifras concretas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1 GB para los pesos (0,49B parametros x 2 bytes) mas la cache KV y overhead del runtime; en la practica, entre 1,5 y 2,5 GB.
- En cuantizacion de 8 bits: alrededor de 0,5-0,7 GB de pesos.
- En cuantizacion de 4 bits (GGUF Q4): alrededor de 0,3-0,4 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en GPUs integradas y en CPU.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos con poca memoria; es viable en Raspberry Pi y telefonos de gama alta con llama.cpp.
- Opciones de despliegue: transformers (recomendado >= 4.37.0), vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, entre otros runtimes compatibles con arquitectura Qwen2.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card remite a la pagina de benchmarks de velocidad de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-0.5B (este) | 0,49B | 32.768 | Apache 2.0 | Base, sin alinear; familia con variante instruct |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | Misma familia, mayor capacidad; requiere mas VRAM |
| SmolLM2-360M | 0,36B | 8.192 (segun version) | Apache 2.0 | Alternativa compacta de Hugging Face; contexto menor |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Mas parametros pero contexto mucho menor |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineacion: no debe usarse directamente como chatbot; la model card desaconseja explicitamente su uso conversacional sin post-entrenamiento.
- Riesgo elevado de alucinacion y de generar contenido factualmente incorrecto, especialmente en tareas de conocimiento general.
- Capacidad limitada por el tamano: rendimiento en razonamiento complejo, matematicas avanzadas y codigo sera notablemente inferior al de modelos de 7B o superiores de la misma familia.
- Idioma: el repositorio declara solo `en`; aunque la familia soporta mas idiomas, el rendimiento en castellano no esta garantizado ni documentado para este checkpoint.
- Sesgos: no se documenta una evaluacion de sesgos para este checkpoint; es esperable que herede sesgos del corpus de preentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de las evaluaciones de seguridad pertinentes.
- El repositorio es una redistribucion de terceros (TT-X) del checkpoint original de Qwen; conviene verificar la integridad de los pesos frente al repositorio oficial.
- Contexto declarado de 32K: aunque la model card lo indica, el rendimiento efectivo en ventanas muy largas puede degradarse sin tecnicas adicionales de extension de contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TT-X/Qwen2.5-0.5B
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Blog oficial Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe tecnico Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-0.5B/blob/main/LICENSE
