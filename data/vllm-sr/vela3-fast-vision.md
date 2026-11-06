# vllm-sr/vela3-fast-vision

## Resumen

vela3-fast-vision es el modelo de visión de la familia Vela 3.0, desarrollado por vLLM Semantic Router en colaboración con KR Labs. Se trata de un paquete de tres backbones encoder de 254M de parámetros cada uno (basados en UltraVBERT, una combinación de UltraBERT-150M como codificador de texto y SigLIP2-B/16-512 como codificador visual), diseñado para responder preguntas sobre imágenes y texto de forma rápida y ligera: decisiones sobre documentos e imágenes, detección de alucinaciones visuales, verificación de extracciones OCR y señalización (grounding) de regiones en imágenes. No es un modelo generativo, sino un encoder que responde con decisiones (elección múltiple, sí/no), spans de texto o cajas delimitadoras.

Su relevancia actual radica en el auge de los routers semánticos y los sistemas de "System One": modelos pequeños y rápidos (29–31 ms por pregunta en GPU, y lo suficientemente ligeros para CPU) que toman decisiones intermedias en pipelines de IA sin necesidad de invocar a un LLM grande. Con licencia MIT y un tamaño total de 5,72 GB, es una pieza de infraestructura práctica para sistemas RAG, moderación de contenido y validación de documentos. Es un modelo en fase preview.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder multimodal UltraVBERT (UltraBERT-150M texto + SigLIP2-B/16-512 vision), con LoRA adapters |
| Parametros totales | 1,48B en el paquete completo (3 backbones de 254M + encoder de texto de 0,15B + adapters); 254M por backbone individual |
| Parametros activos | 0,3B por pregunta (un backbone por tipo de pregunta; no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión original, safetensors) |
| Idiomas soportados | Ingles |
| Licencia | MIT (base MIT; UltraBERT-150M y SigLIP2 bajo Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El paquete contiene tres backbones UltraVBERT especializados, cada uno encargado de un tipo de pregunta, con un paso de encoder por pregunta:

1. **Backbone de decisiones:** un UltraVBERT entrenado como modelo de decisión mediante destilación desde los modelos d3, usando soft labels sobre texto, imágenes y respuestas de d3-mini sobre documentos, además de splits de entrenamiento de datasets públicos (ANLI, RAGTruth) y tareas sintéticas al estilo del Decision Index. Se promediaron tres ejecuciones de entrenamiento (weight averaging).
2. **Backbone de señalización de regiones:** un backbone entrenado previamente para decisiones, con un adapter para apuntar a regiones concretas de la imagen (cajas delimitadoras).
3. **Backbone congelado con LoRA adapters:** el UltraVBERT original, sin modificar, con adapters LoRA para spans de alucinación visual (datos construidos sobre imágenes de COCO), la verificación OCR (solo documentos sintéticos) y las señales del router de texto (adapters de vela3-fast reentrenados sobre su encoder de texto).

Las imágenes se procesan a 1024 px. Las señales del router se entrenan de forma supervisada sobre datasets públicos como AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 (seguridad), Global-MMLU (dominio), WildFeedback (feedback), DiffusionDB (modalidad) y MASSIVE (intenciones). Los autores declaran que no se entrena sobre ningún test set. No se ha publicado informacion sobre RLHF/DPO ni numero total de tokens de entrenamiento.

## Capacidades

- Clasificación zero-shot de imágenes y decisiones binarias/de eleccion multiple sobre texto e imagenes (pipeline zero-shot-image-classification)
- Deteccion de alucinaciones visuales: marca las palabras concretas de una respuesta que la imagen no respalda (spans a nivel de caracter)
- Verificacion OCR: identifica campos que un motor OCR ha leido mal comparandolos con el escaneo del documento
- Region pointing: localizacion de objetos nombrados en una imagen mediante cajas delimitadoras (boxes)
- Señales de router semantico sobre texto: seguridad (safety), dominio, feedback, modalidad e intenciones, heredadas de vela3-fast
- Deteccion de afirmaciones no respaldadas, PII y NER sobre texto en el mismo paquete
- Formatos de salida: Choice (eleccion multiple), Yes/No, Span y Box
- Entradas: texto o JSON mas 1 imagen (para span/box) o hasta 3 imagenes (para decisiones)
- Latencia baja: 29–31 ms por pregunta en una GPU a 1024 px

## Casos de uso

- **Validacion de respuestas multimodales en RAG:** tras generar una respuesta sobre un documento o imagen, el modelo marca los spans de texto que la imagen no respalda (0,518 char-F1 en M-HalDetect), reduciendo alucinaciones antes de mostrar la respuesta al usuario.
- **Verificacion de pipelines OCR:** en flujos de digitalizacion de documentos, contrasta los campos extraidos contra el escaneo original y señala los campos corruptos (504 de 632 campos corruptos detectados con 34 falsos positivos sobre 11.981 campos limpios en su test sintetico), evitando revisiones manuales completas.
- **Router semantico de bajo coste:** como componente "System One" del vLLM Semantic Router, clasifica cada peticion entrante (seguridad, dominio, intencion, modalidad) en 30–40 ms sin invocar a un LLM grande, ahorrando coste y latencia.
- **Moderacion de contenido multimodal:** clasificacion de seguridad de prompts con imagenes usando los adapters entrenados sobre AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3.
- **Busqueda visual y localizacion de objetos:** dada una descripcion en lenguaje natural, el backbone de region pointing devuelve la caja delimitadora del objeto nombrado (0,441 IoU medio en BoxSet-test v2), util para anotacion automatica o interfaces de edicion.
- **Clasificacion de documentos:** decisiones sobre tipo y contenido de documentos escaneados (evaluado sobre un subconjunto de RVL-CDIP), util para triaje automatico en gestores documentales.
- **Extraccion de PII y NER sobre texto:** identificacion de entidades y datos personales en el mismo paquete, sin modelo adicional, para cumplimiento normativo en procesamiento de textos.
- **Despliegue en CPU o hardware modesto:** con 0,3B de parametros activos por pregunta, es viable en entornos sin GPU dedicada, ideal para edge o on-premise.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| Decision Index 0.3 (indice publico) | 37,5 | no disponible |
| Decision Index vision board 0.4 (parte publica) | 22,79 | no disponible |
| Decision Index 0.4.1 (texto, Full) | 22,11 | entrada oficial del board |
| BoxSet-test v2 (region pointing, IoU medio) | 0,441 | d3-turbo 27B dev build: 0,442 (89 veces mas grande) |
| Verificacion OCR (char-F1, test sintetico de 800 documentos) | 0,868 | sintetico, no benchmark publico |
| M-HalDetect validacion (char-F1, spans de alucinacion visual) | 0,518 | solo evaluacion |
| LettuceDetect v2 test (example-F1, afirmaciones no respaldadas) | 0,892 | LettuceDetect v2 mmBERT-base: 0,869 (reportado) |
| Router signals vs Vela 2.0 0.3B | mejor en 12/24 ficheros, igual en 9, peor en 3 | Vela 2.0 0.3B |

Latencia: 29–31 ms por pregunta en una GPU a 1024 px.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete completo ocupa 5,72 GB en pesos, por lo que una GPU con 8 GB de VRAM es suficiente; al ejecutarse un solo backbone (0,3B) por pregunta, el consumo activo es menor. Los autores indican que es "lo suficientemente pequeno para una CPU".
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4090); no se requieren A100 ni H100 al ser un encoder pequeno.
- Consumer GPU: si, cabe holgadamente en GPUs de consumo; tambien es viable en CPU segun la model card.
- Despliegue: libreria transformers de Hugging Face con custom_code; compatible con endpoints de Hugging Face (endpoints_compatible). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; al ser un encoder con custom_code, lo esperable es su uso directo via transformers.
- Latencia y throughput: 29–31 ms por pregunta en una GPU a 1024 px; no se ha publicado throughput en peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Licencia | Notas |
|---|---|---|---|---|
| vela3-fast-vision | 1,48B (paquete, 0,3B activos/pregunta) | Decisiones, alucinacion visual, OCR check, region pointing, router | MIT | Preview; 29–31 ms/pregunta en GPU; viable en CPU |
| d3-turbo 27B (dev build) | 27B | Region pointing y decisiones | no disponible | IoU 0,442 vs 0,441 de Vela, pero 89 veces mas grande |
| LettuceDetect v2 mmBERT-base | no disponible | Deteccion de afirmaciones no respaldadas (texto) | no disponible | 0,869 example-F1 vs 0,892 de vela3-fast-vision |
| Vela 2.0 0.3B | 0,3B | Router semantico (texto) | no disponible | Anterior generacion; vela3-fast-vision la supera en 12/24 ficheros de test |

## Limitaciones y advertencias

- Es un modelo en fase **preview**: puede cambiar o contener comportamientos inestables antes de una version estable.
- Solo soporta **ingles** como idioma de entrada.
- La verificacion OCR se entreno **solo con documentos sinteticos**; su rendimiento sobre documentos reales (escaneos con ruido, fotos, manuscritos) no esta verificado y podria degradarse.
- El resultado de OCR check procede de un test set sintetico propio, no de un benchmark publico independiente.
- Riesgo de falsos positivos en verificacion OCR: 34 falsos flags sobre 11.981 campos limpios (~0,28%), relevante si se automatizan decisiones sin revision humana.
- No es un modelo generativo: solo responde con Choice, Yes/No, Span o Box; no sirve para generacion de texto libre ni para conversacion.
- Requiere `custom_code` (trust_remote_code) al cargarlo con transformers, lo que implica revisar el codigo remoto antes de usarlo en produccion.
- Limite de 3 imagenes por peticion en tareas de decision y 1 imagen en tareas de span/box.
- No se ha publicado informacion sobre sesgos conocidos, longitud de contexto maxima ni cuantizacion disponible.
- La licencia MIT del paquete es permisiva para uso comercial, pero los componentes base (UltraBERT-150M y SigLIP2) estan bajo Apache-2.0, tambien compatible con uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/vela3-fast-vision
- Modelo base: https://huggingface.co/athrael-soju/UltraVBERT
- Coleccion Vela 3.0: https://huggingface.co/collections/vllm-sr/vela-30-6ad1c430eb1718eb4754edcd
- Paper de LettuceDetect v2 (GroundLM 2026, EMNLP 2026): https://aclanthology.org/2026.groundlm-1.44/
