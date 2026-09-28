# SoulInPsyAbstract/qwen25-7b-exp045-decomposition-classifier-lora

## Resumen
`SoulInPsyAbstract/qwen25-7b-exp045-decomposition-classifier-lora` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que debe cargarse junto al modelo base para funcionar. El nombre del repositorio y el campo `model_name` de la model card ("decomposition-classifier-qwen25-lora") sugieren que el adaptador está orientado a tareas de clasificacion o etiquetado relacionadas con descomposicion, aunque el autor no documenta el dataset ni el objetivo exacto.

El modelo base pertenece a la familia Qwen2.5 de Alibaba, con arquitectura transformer decoder-only de aproximadamente 7.600 millones de parametros, soporte de contexto nativo de 32.768 tokens y capacidades de instruccion, razonamiento y generacion de codigo. El adaptador anade un entrenamiento especifico que, segun la model card, se realizo con TRL y SFT.

La relevancia de esta ficha es limitada: el repositorio registra 0 descargas y 0 "likes", no declara licencia, no publica idiomas soportados, no incluye datos de entrenamiento, hiperparametros ni resultados de evaluacion, y el fragmento de "quick start" de la model card contiene un error (referencia `model="None"`). Debe tratarse, por tanto, como un experimento de investigacion sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre PEFT |
| Parametros totales | Aproximadamente 7.600 millones en el modelo base Qwen2.5-7B-Instruct; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-7B-Instruct (extensible a 131.072 con YaRN); no verificado para este adaptador |
| Tipos de cuantizacion | No especificados por el autor; el adaptador se distribuye en safetensors. El modelo base fusionado admite GPTQ, AWQ, GGUF y bitsandbytes (4 y 8 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el campo `licence: license` como marcador de posicion) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Datos adicionales del repositorio: tamano del repo 0.1 GB, pipeline `text-generation`, libreria `peft`, creado el 2026-09-27 y actualizado el 2026-09-27, 0 descargas y 0 likes.

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings de rotacion posicional (RoPE). El modelo base incorpora conocimientos de instruccion y conversacion. El adaptador en si no modifica la arquitectura: introduce matrices de bajo rango entrenables en determinadas capas, que se suman a los pesos congelados del modelo base. El tamano del repositorio (0.1 GB) es coherente con un rango LoRA bajo, pero el autor no publica ni el rango, ni el `alpha`, ni las capas objetivo.

El entrenamiento declarado es SFT con la libreria TRL. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni hiperparametros (learning rate, batch size, epocas). Las versiones de framework reportadas por el autor son PEFT 0.21.0, TRL 1.14.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. Estas versiones no corresponden a ninguna release publica conocida en el momento de redactar esta ficha, lo que dificulta la reproducibilidad del entrenamiento. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos u otras).

## Capacidades
No hay informacion publicada por el autor sobre las capacidades especificas del adaptador. A partir del modelo base y del nombre del repositorio, puede inferirse lo siguiente, siempre con caracter orientativo y no verificado:

- Generacion de texto conversacional y seguimiento de instrucciones, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de varios pasos y resolucion de problemas matematicos basicos e intermedios, capacidad propia del modelo base.
- Generacion y comprension de codigo, capacidades del modelo base.
- Clasificacion o etiquetado en tareas de descomposicion, segun sugiere el identificador `decomposition-classifier`. El autor no documenta el esquema de etiquetas ni el formato de salida.
- Soporte de tool calling y function calling: el modelo base Qwen2.5 lo soporta, pero no hay confirmacion de que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no verificadas tras el ajuste.
- Capacidades multilingues: no disponibles (el modelo base soporta decenas de idiomas, pero el adaptador no declara ninguno).
- Modo "thinking", vision o audio: no disponible.

No se ha publicado ninguna evaluacion que confirme que estas capacidades se mantienen tras el ajuste LoRA.

## Casos de uso
Los siguientes escenarios son hipotesis razonables derivadas del nombre del adaptador y de su modelo base. No estan validados por el autor y requieren evaluacion previa en cada dominio.

- Clasificacion de subtareas para agentes: dado un objetivo de usuario, el adaptador podria etiquetar el tipo de descomposicion necesaria (secuencial, paralela, jerarquica) y alimentar un planificador posterior. Encaja por su supuesta naturaleza de clasificador y por el contexto de 32.768 tokens del modelo base, que permite procesar instrucciones largas.
- Enrutado de consultas en arquitecturas multi-agente: usar el adaptador como clasificador previo para decidir que agente especializado debe atender cada peticion, reduciendo el coste frente a invocar un modelo mayor en cada turno.
- Etiquetado de datasets de investigacion: generar anotaciones automaticas de descomposicion sobre corpus de instrucciones, que luego se revisarian manualmente, aprovechando que el adaptador es ligero (0.1 GB) y puede ejecutarse en paralelo sobre lotes grandes.
- Preprocesado en pipelines de RAG: analizar la consulta del usuario y decidir si requiere descomposicion en subconsultas antes de recuperar documentos. La ventana de contexto del modelo base permite incluir varias consultas y documentos en la misma entrada.
- Asistencia a la planificacion de tareas en herramientas internas: convertir una solicitud en lenguaje natural en una lista ordenada de pasos clasificados por tipo, como entrada para un motor de flujos de trabajo.
- Experimentacion academica sobre tecnicas de descomposicion: servir como linea base ajustada (SFT) frente a metodos de prompting puro o aprendizaje por refuerzo, dado su bajo coste de almacenamiento y su base reproducible.
- Filtrado de consultas en produccion: descartar o marcar peticiones que no requieren descomposicion, reduciendo llamadas innecesarias a modelos mayores y bajando la latencia media del sistema.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, exactitud de clasificacion, F1 ni ninguna otra evaluacion, ni antes ni despues del ajuste. Tampoco se aportan comparaciones con el modelo base sin adaptador.

## Requisitos de hardware
Las cifras siguientes corresponden al modelo base de 7.600 millones de parametros, ya que el adaptador anade un coste de memoria despreciable (0.1 GB en disco y un porcentaje minimo de pesos adicionales en memoria).

- VRAM estimada para inferencia con el modelo base: aproximadamente 15-16 GB en bf16/fp16, 8-9 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4_K_M), sin contar la cache KV.
- Cache KV con contexto completo: con 32.768 tokens y la configuracion GQA de Qwen2.5-7B, la cache puede ocupar del orden de 2 GB adicionales en bf16, por lo que conviene reservar margen.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue en bf16 con concurrencia alta; RTX 4090 o RTX 3090 (24 GB) para bf16 en un solo usuario; RTX 4080, RTX 4070 Ti o RTX 3060 de 12 GB con cuantizacion de 8 o 4 bits.
- Compatibilidad con GPU de consumo: si, en bf16 cabe en RTX 4090 y RTX 3090; en 4 bits cabe en tarjetas de 8 GB con contexto reducido.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM y TGI (previa fusion del adaptador), SGLang, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones y no se han reportado resultados en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-exp045-decomposition-classifier-lora | ~7,6 B en el base + LoRA de rango no declarado | 32.768 tokens heredados del base | Adaptador LoRA sobre Qwen2.5-7B-Instruct | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | ~7,6 B | 32.768 tokens (131.072 con YaRN) | Modelo completo instruido | Apache-2.0 | Ampliamente desplegado y documentado |
| Llama 3.1 8B Instruct | ~8 B | 128.000 tokens | Modelo completo instruido | Licencia comunitaria de Llama 3.1 | Ampliamente desplegado |
| Mistral 7B Instruct v0.3 | ~7,2 B | 32.768 tokens | Modelo completo instruido | Apache-2.0 | Ampliamente desplegado |

La comparacion directa es limitada: el adaptador es un artefacto dependiente de Qwen2.5-7B-Instruct y no puede evaluarse de forma aislada, mientras que las alternativas son modelos completos con licencia, documentacion y evaluaciones publicas. No hay modelos comparables de la misma categoria (adaptadores de clasificacion de descomposicion) identificados en la informacion disponible.

## Limitaciones y advertencias
- Licencia no declarada: la model card incluye `licence: license` como texto generico. No hay base legal explicita para uso comercial. Al ser un derivado de Qwen2.5-7B-Instruct (Apache-2.0), esta licencia podria aplicar al modelo base, pero el adaptador no la especifica y conviene consultar al autor antes de cualquier uso en produccion.
- Model card incompleta: no se documentan dataset de entrenamiento, hiperparametros, esquema de etiquetas, formato de salida ni evaluacion. Sin esos datos, no es posible reproducir el entrenamiento ni juzgar la calidad del ajuste.
- Fragmento de uso incorrecto: el ejemplo de "quick start" de la model card usa `model="None"`, por lo que el codigo publicado no funciona tal cual. Ademas, la llamada a `pipeline` no carga el adaptador con PEFT, sino que asume un modelo completo.
- Sin validacion comunitaria: 0 descargas y 0 likes. No hay terceros que hayan verificado su comportamiento.
- Hibridacion de versiones sospechosa: las versiones declaradas (Transformers 5.17.0, PyTorch 2.14.0, TRL 1.14.0) no se corresponden con releases publicas conocidas, lo que plantea dudas sobre la reproducibilidad y sobre la validez del entorno de entrenamiento reportado.
- Riesgo de alucinacion: si el adaptador conserva las capacidades generativas del base, mantiene la tendencia a producir contenido plausible pero incorrecto, especialmente en clasificacion sin formato de salida restringido.
- Sesgos heredados: no se ha realizado ninguna evaluacion de sesgos ni de seguridad sobre el adaptador; cualquier sesgo presente en Qwen2.5-7B-Instruct y en el dataset de ajuste no documentado se traslada al resultado.
- Limitacion de idioma: los idiomas soportados no estan declarados. Si el dataset de SFT era monolingue, el comportamiento fuera de ese idioma puede degradarse de forma no medida.
- Ambiguedad funcional: la etiqueta "decomposition-classifier" no viene acompanada de una definicion de la tarea. No puede asumirse que clasifique descomposiciones de tareas en el sentido de planificacion; podria referirse a otro tipo de descomposicion.
- Fechas del repositorio anomalas: los metadatos indican creacion y actualizacion el 2026-09-27, lo que conviene verificar antes de citar el artefacto.
- Advertencia de produccion: no debe desplegarse en un sistema real sin fusionar el adaptador, definir un formato de salida validado y establecer un plan de evaluacion propio.

## Enlaces
- Pagina de HuggingFace del modelo: https://huggingface.co/SoulInPsyAbstract/qwen25-7b-exp045-decomposition-classifier-lora
- Modelo base Qwen/Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Busqueda web realizada: no se ha encontrado ningun enlace relevante sobre este modelo. Los resultados devueltos correspondian a paginas de ayuda de Facebook y no guardan relacion con el artefacto. No se dispone de paper, blog, demo ni repositorio adicional.
