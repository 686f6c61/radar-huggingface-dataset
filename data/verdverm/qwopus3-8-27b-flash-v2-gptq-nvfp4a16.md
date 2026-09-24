# verdverm/qwopus3.8-27b-flash-v2-gptq-nvfp4a16

## Resumen

Este repositorio contiene una versión cuantizada en NVFP4A16 del modelo Jackrong/Qwopus3.8-27B-Flash-V2, un modelo multimodal de 27.781.427.952 parámetros (~27,8 B) derivado de la familia Qwen3.8-27B y postentrenado en dos iteraciones sucesivas (Flash y Flash-V2) por el usuario Jackrong. La cuantización la publica verdverm mediante llm-compressor y compressed-tensors, con el esquema GPTQ NVFP4 con formato `nvfp4-pack-quantized`: pesos en coma flotante de 4 bits, escalas en fp8_e4m3fn, tamaño de grupo 16 y `actorder` estático, dejando sin cuantizar `lm_head`, `embed_tokens`, la torre visual (`model.visual.*`), las capas de atención lineal (`*.linear_attn.*`) y las cabezas de predicción multi-token (`mtp.*`).

El objetivo declarado del modelo base es preservar capacidades suficientes para cargas de trabajo de agentes largas reduciendo el coste de razonamiento inefectivo, y esta variante cuantizada añade el objetivo de hacer viable el despliegue en GPUs con soporte nativo de FP4 (arquitectura Blackwell) con una huella de memoria aproximadamente cuatro veces menor que la del modelo en precisión completa.

La relevancia de esta ficha es doble: por un lado documenta una receta reproducible de cuantización NVFP4 sobre un transformer multimodal híbrido (atención completa + atención lineal) con cabezas MTP, y por otro advierte de que se trata de un artefacto sin validación pública (0 descargas, 0 likes en el momento de la consulta), sin licencia declarada y sin resultados de benchmarks publicados, por lo que no debería desplegarse en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.8-27B, con capas de atención lineal (`linear_attn`), torre visual (`model.visual`) y cabezas de predicción multi-token (MTP). Densa segun la informacion disponible (sin evidencia de MoE) |
| Parametros totales | 27.781.427.952 (~27,8 B), dato real de los safetensors |
| Parametros activos | No aplica / no disponible (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. La calibracion se hizo con `max_seq` 8192, lo que no implica que ese sea el limite del modelo |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4 simetricos, `tensor_group`, `group_size` 16, `scale_dtype` fp8_e4m3fn, `actorder` static, `block_size` 128, dampening 0.01). Existen versiones GGUF del modelo base (repo Jackrong/Qwopus3.8-27B-Flash-V2-GGUF) |
| Idiomas soportados | No disponible. El linaje Qwen sugiere cobertura multilingue amplia, pero no hay confirmacion en la informacion disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato `nvfp4-pack-quantized` de compressed-tensors) |
| Libreria de cuantizacion | llm-compressor |
| Tamano del repositorio | 28,6 GB |
| Modalidad | image-text-to-text (multimodal, entrada de imagen y texto) |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2 (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer multimodal con al menos tres particularidades deducibles de la configuracion de cuantizacion: una torre visual (`model.visual.*`) para entrada de imagenes, capas de atencion lineal (`*.linear_attn.*`) que conviven con capas de atencion completa —es decir, un esquema hibrido orientado a reducir el coste cuadratico en contextos largos— y cabezas de prediccion multi-token (`mtp.*`), habitualmente empleadas para decodificacion especulativa o entrenamiento con multiples objetivos de prediccion. El pipeline declarado es `image-text-to-text`, coherente con la presencia de la torre visual.

La linea de entrenamiento del modelo base, segun la documentacion publica de Jackrong, parte de Qwen3.8-27B como modelo fundacional; Qwopus3.8-27B-Flash-V2 se postentrena a partir de Qwopus3.8-27B-Flash, heredando su pipeline de SFT y refuerzo de razonamiento como punto de partida y aplicando una nueva pasada de postentrenamiento con funciones de recompensa y metodos de aprendizaje por refuerzo distintos. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni los detalles de la fase de alineamiento (RLHF/DPO) mas alla de esa descripcion. La cuantizacion de este repositorio no reentrena el modelo: aplica GPTQ con llm-compressor sobre 512 muestras de `HuggingFaceH4/ultrachat_200k` con longitud maxima 8192, cuantizando unicamente las capas `Linear` y preservando en su precision original las capas de embedding, la cabeza de salida, la torre visual, la atencion lineal y las cabezas MTP.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno (`conversational`), con foco declarado en cargas de trabajo de agentes de larga duracion y coste de razonamiento contenido.
- Procesamiento de imagen y texto combinados (`image-text-to-text`): descripcion de imagenes, respuesta a preguntas visuales y conversacion con contexto visual.
- Cabezas de prediccion multi-token (MTP) presentes y preservadas en 16 bits, lo que habilita tecnicas de decodificacion especulativa si el runtime las soporta.
- Atencion lineal en parte de las capas, pensada para abaratar la inferencia en secuencias largas.
- Capacidad de razonamiento reforzado heredada del pipeline de RL del modelo base (modo de razonamiento no documentado de forma explicita en la informacion disponible).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Agentes autonomos de larga duracion: el modelo base esta disenado explicitamente para reducir el razonamiento inefectivo en bucles de agente con muchas llamadas; la variante NVFP4 baja el coste por token al reducir la huella de pesos a 4 bits, lo que permite mantener mas sesiones concurrentes en la misma GPU.
- Asistentes multimodales de atencion al cliente: al aceptar imagen y texto, puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla, fotos de producto o documentos escaneados, devolviendo respuestas contextualizadas.
- Procesamiento documental con imagenes: extraccion y resumen de informacion de facturas, tickets o formularios fotografiados, combinando la torre visual con generacion de texto estructurado.
- Despliegue en infraestructura Blackwell: al usar NVFP4 nativo, es adecuado para servir en GPUs B200, GB200 o RTX 50-series aprovechando los kernels FP4, con mayor throughput por vatio que una version en bf16 del mismo modelo.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como artefacto de referencia para medir la degradacion de un transformer multimodal hibrido con MTP al pasar de 16 bits a NVFP4 con grupo 16 y escalas fp8.
- Investigacion sobre decodificacion especulativa: las cabezas MTP sin cuantizar permiten experimentar con prediccion multi-token como drafter interno sin el ruido que introduciria su cuantizacion.
- Prototipado de pipelines de vision-lenguaje en una sola GPU: con pesos de ~4 bits, un unico acelerador de 24-32 GB puede alojar el modelo completo en lugar de requerir un nodo multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion (MMLU, HumanEval, GSM8K, MMMU u otros), no declara metricas de perplejidad tras la cuantizacion ni compara la salida NVFP4 con la del modelo base en precision completa. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia contra Jackrong/Qwopus3.8-27B-Flash-V2 sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay dato publicado. Estimacion a partir de la configuracion: los pesos cuantizados a 4 bits de ~27,8 B parametros ocupan del orden de 14 GB, mas las escalas fp8 con `group_size` 16 (~1,5-2 GB) y los modulos preservados en 16 bits (embeddings, `lm_head`, torre visual, atencion lineal, MTP), lo que situa el total en una horquilla aproximada de 18-22 GB de pesos en memoria, antes de cache KV.
- Cache KV adicional: depende de la longitud de contexto y del numero de secuencias concurrentes, y no se puede calcular sin conocer la configuracion de atencion (numero de capas, cabezas y dimension de cabeza), dato no disponible.
- GPUs con aceleracion nativa FP4: NVIDIA Blackwell, es decir B200, GB200, RTX 5090, RTX PRO 6000 Blackwell y derivadas. Es el escenario recomendado para este formato.
- GPUs sin FP4 nativo: H100/H200 (Hopper) y RTX 4090/3090 (Ada/Ampere) pueden ejecutar pesos NVFP4 mediante kernels con dequantizacion en vuelo en runtimes compatibles, pero con degradacion de rendimiento y de eficiencia de memoria.
- Cabe en GPU de consumo: previsiblemente si en RTX 5090 (32 GB) y en RTX 4090 / 3090 (24 GB) con contexto moderado; en GPUs de 16 GB no cabe sin offloading.
- Opciones de despliegue: vLLM con soporte compressed-tensors para `nvfp4-pack-quantized`; llm-compressor para reproducir la receta de cuantizacion. Este repositorio no es compatible con llama.cpp, Ollama ni LM Studio, que requieren GGUF (existe una version GGUF del modelo base en el repositorio de Jackrong). Soporte en TGI no confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| verdverm/qwopus3.8-27b-flash-v2-gptq-nvfp4a16 (este) | 27,78 B | No disponible | safetensors NVFP4A16 (compressed-tensors) | No disponible | HuggingFace, 0 descargas, 0 likes |
| Jackrong/Qwopus3.8-27B-Flash-V2 (base, sin cuantizar) | 27 B (declarado) | No disponible | safetensors en precision completa | No disponible | HuggingFace, multiples tags de despliegue; tambien en Featherless y FriendliAI |
| Jackrong/Qwopus3.8-27B-Flash (V1) | 27 B (declarado) | No disponible | safetensors y GGUF | No disponible | HuggingFace, GGUF disponible, endpoint en Featherless |
| Qwen/Qwen3.8-27B (fundacional) | 27 B (declarado) | No disponible | safetensors | No disponible en la informacion recogida | HuggingFace, repositorio oficial Qwen |

La comparacion cuantitativa de rendimiento entre estas variantes no es posible con la informacion disponible: ninguno de los repositorios consultados publica resultados de benchmarks comparables, y no se dispone de la licencia de ninguna de las cuatro referencias.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido. Al derivar de Qwen3.8-27B, la licencia efectiva dependera de la del modelo fundacional y de los terminos del postentrenamiento, no documentados aqui.
- Artefacto sin validacion publica: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks, sin comparativa de degradacion frente al modelo sin cuantizar y sin informes de terceros.
- Cadena de procedencia doble: es una cuantizacion de terceros (verdverm) sobre un fine-tune de terceros (Jackrong) sobre un modelo fundacional ajeno (Qwen). Cualquier incidencia de comportamiento puede originarse en cualquiera de los tres niveles.
- Cuantizacion NVFP4 agresiva: 4 bits por peso con `group_size` 16 introduce perdida de precision frente al modelo base. Los modulos preservados en 16 bits (embeddings, `lm_head`, torre visual, atencion lineal, MTP) reducen el dano, pero no lo eliminan, y no se publica medicion alguna de esa degradacion.
- `actorder` estatico: la reordenacion de canales se fijo con el conjunto de calibracion, por lo que el comportamiento puede degradarse en dominios alejados de `HuggingFaceH4/ultrachat_200k`.
- Riesgo de alucinacion: inherente a los modelos de lenguaje postentrenados con RL; no hay evaluacion de fidelidad ni de tasas de alucinacion para este artefacto.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y el reparto de idiomas soportados. No se debe asumir contexto largo ni cobertura multilingue sin verificacion.
- Compatibilidad de runtime restringida: el formato `nvfp4-pack-quantized` exige runtimes que lo soporten (vLLM con compressed-tensors). No funciona en llama.cpp, Ollama ni en herramientas basadas en GGUF.
- Rendimiento dependiente del hardware: sin GPU Blackwell, la ventaja de FP4 se reduce y el modelo puede ser mas lento que una version en bf16 en GPUs antiguas.
- Tool calling y modo de razonamiento no confirmados: no hay documentacion que garantice soporte estable de function calling ni de un modo de pensamiento explicito, algo critico si se va a integrar en agentes.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/verdverm/qwopus3.8-27b-flash-v2-gptq-nvfp4a16
- Modelo base (sin cuantizar): https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Version GGUF del modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2-GGUF
- Version anterior Qwopus3.8-27B-Flash: https://featherless.ai/models/Jackrong/Qwopus3.8-27B-Flash
- Ficha de Qwopus3.8-27B-Flash-V2 en Featherless: https://featherless.ai/models/Jackrong/Qwopus3.8-27B-Flash-V2
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Jackrong/Qwopus3.8-27B-Flash-V2
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo de cuantizacion (quantr): https://github.com/verdverm/quantr
