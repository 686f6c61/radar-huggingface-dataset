# waveforce-ai/Aura-2-Lightning

## Resumen

Aura-2-Lightning es un modelo de lenguaje causal desarrollado por Waveforce AI, construido como un destilado del backbone compacto `openai-community/gpt2-xl` (1.557.611.200 parametros) que alinea sus estados internos con los de un modelo profesor de mayor tamano basado en mezcla de expertos, `openai/gpt-oss-20b`. El objetivo declarado es ofrecer una ejecucion local de alta velocidad y baja latencia manteniendo una densidad de razonamiento superior a la del GPT-2 XL original, del que hereda la arquitectura transformer decoder.

La innovacion principal descrita en la model card es la tecnica de destilacion denominada Latent Space State Projection Alignment: en lugar de limitarse a minimizar la divergencia sobre los logits de salida, el entrenamiento proyecta la representacion de 1600 dimensiones del estudiante al espacio oculto de 2880 dimensiones del profesor mediante una cabeza de proyeccion lineal intermedia, optimizando una perdida combinada de modelado causal y error cuadratico medio sobre los estados ocultos. Esto permite transferir conocimiento latente de un modelo MoE de 20B a un transformer denso de 1.5B.

Es relevante para desarrolladores que necesitan un modelo pequeno, desplegable en hardware de consumo y con licencia permisiva Apache 2.0, aunque la model card no documenta datos de contexto ampliado, idiomas soportados ni resultados de benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (basada en GPT-2 XL) |
| Parametros totales | 1.557.611.200 |
| Parametros activos | No aplica (modelo denso; el profesor gpt-oss-20b si es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la arquitectura base GPT-2 XL emplea ventanas de 1024 tokens) |
| Tipos de cuantizacion | FP16 (safetensors original); versiones GGUF publicadas por mradermacher |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (original); GGUF (repositorio de terceros) |

## Arquitectura y entrenamiento

Aura-2-Lightning emplea la arquitectura transformer decoder causal de GPT-2 XL, con 1.5B parametros y representacion oculta de 1600 dimensiones. El entrenamiento es un proceso de destilacion entre arquitecturas heterogeneas: el profesor `openai/gpt-oss-20b` se ejecuto en cuantizacion microscaling FP4 (MXFP4) con kernels Triton dedicados para las capas MoE, mientras que el estudiante se entreno en FP16. La perdida total combina el objetivo de modelado causal con un termino MSE ponderado a 0.5 entre la proyeccion lineal de los estados del estudiante y los estados ocultos del profesor, lo que da lugar a la ecuacion descrita en la model card: L_total = L_CausalLM + 0.5 * MSE(W_proj * h_estudiante, h_profesor).

Para estabilizar el entrenamiento se utilizo el optimizador de 8 bits PagedAdamW8bit con recorte estricto de la norma de gradiente (max_norm=1.0) y enmascaramiento de perdida (-100) sobre tokens de padding, con el objetivo declarado de eliminar la deriva en los limites y las paradas prematuras ante el token `<|endoftext|>`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. El modelo se distribuye con un `generation_config.json` ajustado con parametros de inferencia por defecto (temperature 0.85, top_p 0.92, top_k 50, repetition_penalty 1.35, no_repeat_ngram_size 3).

## Capacidades

- Generacion de texto autoregresiva de proposito general, heredada del backbone GPT-2 XL.
- Razonamiento de densidad mejorada respecto al GPT-2 XL original, segun la model card, como resultado de la destilacion de estados latentes del profesor `gpt-oss-20b`.
- Generacion de codigo y texto tecnico (capacidad no cuantificada en la informacion disponible, limitada por el tamano de 1.5B y por la ausencia de benchmarks).
- Configuracion de decodificacion preajustada con penalizacion por repeticion y restriccion de n-gramas para reducir repeticiones.
- Compatibilidad con el pipeline `text-generation` de Hugging Face Transformers y con `device_map="auto"` para reparto automatico de dispositivos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles.

## Casos de uso

- Prototipado local de generacion de texto: al ser un modelo de 1.5B en FP16 con un peso de repositorio de 3.1 GB, permite iterar rapidamente en una estacion de trabajo o portatil con GPU de gama media sin depender de APIs externas.
- Despliegue en el borde y entornos con recursos limitados: su tamano reducido y su licencia Apache 2.0 lo hacen adecuado para ejecucion en dispositivos con poca memoria, usando cuantizacion GGUF del repositorio de mradermacher.
- Generacion de texto aumentada por recuperacion en aplicaciones de baja latencia: se puede integrar como capa de generacion en un pipeline RAG cuando la ventana de contexto de 1024 tokens (arquitectura base GPT-2) sea suficiente para los fragmentos recuperados.
- Autocompletado y asistencia de escritura: su configuracion preajustada de `repetition_penalty` y `no_repeat_ngram_size` reduce bucles de repeticion, util en tareas de redaccion asistida y borradores.
- Clasificacion y anotacion de texto por generacion: se puede emplear para tareas de etiquetado, resumen corto o extraccion de informacion en lotes donde el coste por token es un factor critico.
- Base para experimentos de destilacion e investigacion: sirve como estudiante de referencia para replicar o comparar tecnicas de alineacion de estados latentes entre arquitecturas densas y MoE, dado que documenta explicitamente el procedimiento de proyeccion.
- Modulo de generacion en entornos de test y CI: su tamano permite instanciarlo en contenedores de integracion para pruebas de pipelines de NLP sin requerir GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Hugging Face no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas frente al GPT-2 XL base o al profesor `gpt-oss-20b`.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache KV (entorno a 4-5 GB en la practica para secuencias cortas).
- VRAM estimada en cuantizacion GGUF de 4 bits: del orden de 1-1,5 GB para los pesos, segun el nivel de cuantizacion elegido en el repositorio de mradermacher.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 2070 o superiores son suficientes. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de gama media y en muchas integradas con memoria unificada suficiente al usar cuantizacion.
- Opciones de despliegue: Hugging Face Transformers con `pipeline("text-generation")`, llama.cpp/Ollama y otros runners compatibles con GGUF a traves del repositorio de mradermacher. No se documentan integraciones con vLLM ni TGI.
- Latencia y throughput: no disponibles; la model card solo menciona un perfil de "high-throughput" y "low-latency" sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Aura-2-Lightning | 1,5B | No disponible (base GPT-2 de 1024) | Apache 2.0 | Destilado de gpt-oss-20b; sin benchmarks publicos |
| openai-community/gpt2-xl | 1,5B | 1024 tokens | MIT modificada | Modelo base del estudiante; sin destilacion |
| DistilGPT2 | 82M | 1024 tokens | Apache 2.0 | Destilado de GPT-2; mucho mas pequeno |
| openai/gpt-oss-20b | 21B totales (3,6B activos) | 128k tokens | Apache 2.0 | Profesor MoE; requiere hardware de datacenter o cuantizacion agresiva |

La informacion disponible no incluye resultados de rendimiento que permitan comparar la calidad de Aura-2-Lightning frente a estas alternativas.

## Limitaciones y advertencias

- No hay benchmarks publicados que permitan verificar la mejora de razonamiento declarada frente al GPT-2 XL base; la afirmacion proviene unicamente de la model card del autor.
- Tamano de 1.5B: capacidad limitada en tareas de razonamiento complejo, matematicas avanzadas y codigo de larga extension en comparacion con modelos actuales de 7B o mas.
- La ventana de contexto no se especifica; si hereda los 1024 tokens de GPT-2 XL, resulta insuficiente para documentos largos, conversaciones multi-turno extensas o RAG con muchos fragmentos.
- Idiomas soportados no documentados; GPT-2 XL esta fuertemente sesgado hacia el ingles, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinacion y de generar texto factualmente incorrecto, especialmente en dominios especializados, sin una capa de verificacion.
- Sesgos heredados del corpus de entrenamiento del modelo base y del profesor; no se documenta ninguna fase de alineacion o mitigacion de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre el cumplimiento de requisitos regulatorios.
- Los datos de entrenamiento (numero de tokens, composicion, posible RLHF/DPO) no estan documentados, lo que dificulta la auditoria.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/waveforce-ai/Aura-2-Lightning
- Repositorio GGUF de terceros (mradermacher): https://huggingface.co/mradermacher/Aura-2-Lightning-GGUF
- Perfil de la organizacion Waveforce AI: https://huggingface.co/waveforce-ai/models
- Modelo base del estudiante: https://huggingface.co/openai-community/gpt2-xl
- Modelo profesor: https://huggingface.co/openai/gpt-oss-20b
