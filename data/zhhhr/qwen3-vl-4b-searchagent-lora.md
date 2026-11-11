# ZHHHR/Qwen3-VL-4B-SearchAgent-LoRA

## Resumen

Qwen3-VL-4B-SearchAgent-LoRA es un adaptador PEFT de tipo LoRA desarrollado por el usuario ZHHHR sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. Su proposito es especializar un modelo vision-lenguaje de 4.000 millones de parametros en tareas de agente de busqueda multimodal (search-agent), es decir, en la ejecucion de bucles de llamada a herramientas de busqueda combinados con el razonamiento sobre imagenes y texto. El adaptador se entrena mediante supervised fine-tuning sobre el dataset OpenSearch-VL-SFT-Original.

El repositorio no contiene los pesos del modelo base, sino unicamente el adaptador LoRA (rank 16, alpha 32) junto con los metadatos del tokenizer y del processor. Esto implica que para utilizarlo es necesario descargar por separado Qwen3-VL-4B-Instruct desde Hugging Face y adjuntar el adaptador mediante la libreria PEFT. El tamano del repositorio es de aproximadamente 0,1 GB.

La relevancia de esta ficha es acotada: se trata de un adaptador de investigacion publicado sin evaluacion end-to-end de benchmarks de search-agent, con cero descargas y cero likes en el momento de la consulta, y con una licencia marcada como "other" que no se detalla. Resulta util como punto de partida para experimentar con agentes de busqueda multimodales sobre Qwen3-VL-4B, pero no debe considerarse un artefacto listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-4B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base es de 4B (4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-4B-Instruct, valor no indicado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | other (sin detalle de terminos en la model card) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en formato nativo de Transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-4B-Instruct, un transformer multimodal de 4.000 millones de parametros que procesa entradas de imagen y texto (pipeline image-text-to-text). El entrenamiento se realizo con LoRA de rank 16 y alpha 32, con modulos objetivo en las proyecciones de atencion y de MLP. Se completaron 2 epocas, 13.112 pasos, con batch global de 8 y learning rate de 1e-4 con schedule coseno. La perdida final de entrenamiento fue de 0,24743; la perdida de evaluacion tras la primera epoca fue de 0,30848 y la final de 0,30711, lo que sugiere que la segunda epoca apenas aporto mejora en validacion in-domain.

El dataset de entrenamiento es zhoushengzs/OpenSearch-VL-SFT-Original, orientado a supervised fine-tuning de agentes de busqueda multimodal. La model card advierte que los datos contienen ejemplos revisados por humanos, reparados automaticamente y no auditados de forma independiente. El framework utilizado fue PEFT 0.18.1, Transformers 4.57.1, PyTorch 2.8.0, Datasets 4.0.0 y Tokenizers 0.22.2. No se documenta el uso de RLHF ni DPO; el entrenamiento es SFT puro.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre pares imagen-texto, heredados del modelo base Qwen3-VL-4B-Instruct.
- Ejecucion de bucles de agente de busqueda: el adaptador esta entrenado para el formato de tool-call y tool-response esperado por los datos de entrenamiento.
- Soporte de tool calling / function calling en el contexto de herramientas de busqueda.
- Razonamiento multi-paso orientado a la consulta iterativa de un motor de busqueda y la sintesis de resultados.
- Procesamiento de imagenes como parte de la entrada (vision-language), con pipeline image-text-to-text.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada; dependen del modelo base.
- No se documentan modos especiales como thinking mode, audio o decodificacion especulativa en el adaptador.

## Casos de uso

- Investigacion en agentes de busqueda multimodal: el adaptador sirve para reproducir y extender experimentos de search-agent sobre Qwen3-VL-4B, ejecutando el mismo bucle de herramientas usado durante la evaluacion del modelo base.
- Prototipado de asistentes que responden preguntas sobre imagenes con apoyo de busqueda web: el modelo puede recibir una imagen y una consulta, generar una llamada a herramienta de busqueda y sintetizar la respuesta con el contexto recuperado.
- Fine-tuning incremental para dominios concretos: al ser un adaptador LoRA de bajo coste (repo de 0,1 GB), es viable reentrenarlo o combinarlo con otros adaptadores para tareas especificas de recuperacion visual.
- Evaluacion comparativa de estrategias de SFT para agentes: el par (modelo base, adaptador) permite medir el efecto del SFT en el comportamiento de busqueda sin reentrenar el modelo completo.
- Docencia y formacion tecnica: util para demostrar el flujo completo de carga de un adaptador PEFT con AutoProcessor y PeftModel sobre un modelo multimodal.
- Generacion de pipelines de recuperacion aumentada multimodal en entornos controlados: integrable en notebooks o scripts de investigacion que orquesten llamadas a APIs de busqueda y procesen imagenes de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de perdida de entrenamiento y validacion in-domain (loss final 0,24743; eval loss final 0,30711) y advierte explicitamente que no reclama ninguna puntuacion end-to-end de search-agent ni evaluacion de seguridad para despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; para un modelo base de 4B en bfloat16 se requiere del orden de 8-10 GB solo para pesos, mas overhead de activaciones y del processor de vision.
- GPU recomendadas: no indicadas en la informacion proporcionada; por tamano del modelo base, GPUs de 16 GB o mas (RTX 4090, A100, H100) son adecuadas para bfloat16.
- Cabe en GPU de consumo: previsiblemente si, en GPUs con 16 GB o mas, aunque no se documenta medicion oficial.
- Opciones de despliegue: Transformers + PEFT + Accelerate (flujo documentado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZHHHR/Qwen3-VL-4B-SearchAgent-LoRA | 4B (base) + LoRA rank 16 | No disponible | Agente de busqueda multimodal (SFT) | other | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | No disponible | Vision-lenguaje generalista | Segun modelo base | Hugging Face (modelo base) |
| Alternativas de agente de busqueda multimodal del mismo tamano | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion end-to-end de search-agent ni de seguridad para despliegue; la unica metrica es la perdida de validacion in-domain.
- El adaptador hereda sesgos y modos de fallo del modelo base Qwen3-VL-4B-Instruct y del dataset de entrenamiento.
- Los datos de entrenamiento incluyen ejemplos revisados por humanos, reparados automaticamente y no auditados de forma independiente; deben revisarse su idoneidad y licencia antes de cualquier uso.
- La licencia figura como "other" sin terminos detallados en la model card, lo que impide confirmar si el uso comercial esta permitido.
- El repositorio no incluye los pesos del modelo base; es imprescindible descargarlos por separado y respetar su licencia.
- El adaptador esta atado al formato de prompt de tool-call y tool-response de los datos de entrenamiento; usarlo con otro formato puede degradar el comportamiento.
- Idiomas soportados y longitud de contexto no estan documentados en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZHHHR/Qwen3-VL-4B-SearchAgent-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/zhoushengzs/OpenSearch-VL-SFT-Original
