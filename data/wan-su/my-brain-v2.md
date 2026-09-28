# wan-su/my-brain-v2

## Resumen

my-brain-v2 es un ajuste fino (finetune) publicado por el usuario wan-su en HuggingFace, derivado directamente de su modelo previo wan-su/my-brain-v1. Se distribuye bajo licencia Apache 2.0 y esta etiquetado con la familia "gemma4", la libreria transformers y el pipeline image-text-to-text, lo que indica que se trata de un modelo multimodal capaz de aceptar imagenes y texto como entrada. El repositorio ocupa 10,3 GB y los pesos en safetensors suman 5.123.178.051 parametros (aproximadamente 5,12 mil millones), una cifra coherente con un checkpoint en bf16/fp16.

La model card es minima: unicamente indica que el modelo fue entrenado "2x mas rapido" con Unsloth y la libreria TRL de HuggingFace, y que se trata de un modelo subido desde ese flujo de trabajo. No se documentan datos de entrenamiento, composicion del dataset, longitud de contexto, tecnicas de alineamiento (RLHF/DPO) ni resultados de evaluacion.

Su relevancia practica es limitada en el momento de redactar esta ficha: registra 0 descargas y 0 "likes", no tiene benchmarks publicados y el unico idioma declarado es el ingles. Es un artefacto de experimentacion personal, no un modelo con validacion comunitaria. Ademas, el recuento de 5,12 B de parametros no coincide con ningun checkpoint publico conocido de la familia Gemma, por lo que la arquitectura real deberia verificarse antes de cualquier uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; las etiquetas apuntan a la familia "gemma4" (transformer multimodal de imagen-texto) |
| Parametros totales | 5.123.178.051 (5,12 mil millones, segun safetensors) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos completos en safetensors, sin GGUF ni AWQ/GPTQ |
| Idiomas soportados | ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Modelo base | wan-su/my-brain-v1 |
| Tamano del repositorio | 10,3 GB |
| Libreria | transformers |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna. La etiqueta `gemma4` y el pipeline `image-text-to-text` sugieren un transformer multimodal de la familia Gemma con un codificador visual acoplado, pero no se publican detalles sobre el numero de capas, dimension oculta, tipo de atencion, mecanismo de proyeccion de imagenes ni tokenizador. Tampoco se confirma si el contexto se amplia mediante atencion local/global o si se emplea decodificacion especulativa.

Respecto al entrenamiento, la model card solo afirma que se hizo un ajuste fino sobre wan-su/my-brain-v1 usando Unsloth y TRL, sin especificar el numero de tokens, la composicion del dataset, el regimen de hiperparametros ni si hubo fases de RLHF, DPO o SFT supervisado. Unsloth es una libreria de entrenamiento optimizada en memoria (kernels Triton, checkpointing agresivo y cuantizacion de 4 bits durante el entrenamiento) que habitualmente se usa para LoRA/QLoRA, lo que sugiere un ajuste fino de bajo rango sobre el modelo base, aunque esto no se confirma en la documentacion.

Nota de verificacion: el recuento real de 5,12 B de parametros no corresponde a ningun tamano publicado de la familia Gemma conocida, por lo que la etiqueta `gemma4` deberia contrastarse inspeccionando `config.json` antes de asumir la arquitectura.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta `conversational`).
- Procesamiento conjunto de imagen y texto (`image-text-to-text`), es decir, entrada multimodal con salida de texto.
- Inferencia compatible con Text Generation Inference (TGI), segun la etiqueta del repositorio.
- Carga estandar mediante la libreria transformers.
- No hay evidencia documentada de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia documentada de modo "thinking", razonamiento extendido, salida de audio o generacion de video.
- Capacidad multilingue: no disponible; solo se declara ingles.
- No se documentan capacidades especificas de codigo, matematicas ni vision mas alla del pipeline declarado.

## Casos de uso

- Prototipado de asistentes multimodales: al aceptar imagen y texto, permite construir demos de pregunta-respuesta sobre capturas, diagramas o fotografias sin necesidad de ensamblar por separado un codificador visual y un LLM.
- Experimentacion academica con ajuste fino: al ser un finetune ligero derivado de un modelo personal, sirve como punto de partida reproducible para estudiar tecnicas de Unsloth/TRL sobre un checkpoint de 5,12 B.
- Evaluacion de pipelines de TGI: la etiqueta de compatibilidad permite desplegarlo en un servidor TGI para medir latencia y throughput antes de decidir si se adopta en un entorno interno.
- Extraccion de informacion de documentos escaneados: con entrada imagen-texto se puede plantear la lectura de formularios o facturas y la devolucion de campos en texto, siempre que se valide antes la calidad real del modelo.
- Clasificacion y descripcion de imagenes en ingles: generacion de pies de foto o etiquetas descriptivas para catalogos internos, asumiendo que no hay metricas publicadas que respalden su precision.
- Base para investigacion sobre sesgos en modelos pequenos: al no estar alineado ni evaluado, es un caso de estudio util para medir comportamientos no filtrados en un modelo de 5 B.
- Pruebas de comparacion de decodificacion: sirve para comparar safetensors frente a futuras conversiones GGUF en un mismo modelo pequeño en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y la busqueda web no ha devuelto ningun articulo, informe o evaluacion independiente sobre `wan-su/my-brain-v2`.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 5,12 B de parametros, sin contar cache KV ni el codificador visual): ~20,5 GB en fp32, ~10,3 GB en bf16/fp16, ~5,1 GB en int8 y ~2,6-3 GB en int4.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB o L40S para fp16 con contexto largo y batching.
- GPU de consumo: cabe en bf16 en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 5090); en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) requiere cuantizacion, que no esta publicada en el repositorio.
- Opciones de despliegue confirmadas: transformers y Text Generation Inference (TGI) por etiqueta. vLLM, llama.cpp, Ollama y LM Studio no estan confirmados y requeririan conversion a GGUF o AWQ, no incluida en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: 10,3 GB solo para los pesos; sumar espacio para cache de HuggingFace y posibles conversiones cuantizadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que no es posible una comparativa cuantitativa rigurosa. La tabla siguiente situa el modelo en su categoria (multimodal pequeno de pesos abiertos) sin inventar cifras no verificadas.

| Modelo | Parametros | Contexto | Licencia | Estado de validacion |
|---|---|---|---|---|
| wan-su/my-brain-v2 | 5,12 B | no disponible | Apache 2.0 | sin benchmarks, 0 descargas |
| wan-su/my-brain-v1 (modelo base) | no disponible | no disponible | no disponible | predecesor directo, sin evaluacion publica |
| Qwen2.5-VL (variantes pequenas) | no disponible en la informacion proporcionada | no disponible | no disponible | alternativa de categoria, datos no verificados aqui |
| Gemma 3 multimodal (variantes pequenas) | no disponible en la informacion proporcionada | no disponible | no disponible | alternativa de categoria, datos no verificados aqui |

Cualquier comparacion numerica con estos u otros modelos requiere consultar sus fichas oficiales y ejecutar una evaluacion propia sobre el mismo conjunto de tareas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks publicados, no hay evidencia de calidad en ninguna tarea.
- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros ni proceso de alineamiento, lo que impide auditar sesgos o comportamientos indeseados.
- Riesgo elevado de alucinacion: al ser un finetune no alineado y sin documentar, no se han aplicado (o no se han declarado) fases de RLHF/DPO que reduzcan este comportamiento.
- Sesgos desconocidos: la composicion del dataset de ajuste no se especifica, por lo que no se puede descartar sesgo de genero, raza, idioma o dominio.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otras lenguas es no disponible y probablemente degradado.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o documentos extensos.
- Cuantizaciones no publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversion.
- Trazabilidad: el modelo es un finetune de un modelo personal (my-brain-v1) del mismo autor, sin linaje verificable hacia un checkpoint oficial, lo que complica el cumplimiento de auditorias.
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero la ausencia de evaluacion y de documentacion hace desaconsejable su uso en produccion sin una validacion previa exhaustiva.
- Adopcion nula: 0 descargas y 0 "likes" implican que no existe retroalimentacion de la comunidad ni casos de exito reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wan-su/my-brain-v2
- Modelo base: https://huggingface.co/wan-su/my-brain-v1
- Unsloth (libreria de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- TRL de HuggingFace (citada en la model card): https://github.com/huggingface/trl

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los enlaces encontrados correspondian a definiciones de redes WAN (Wikipedia, Orange, Interdata, Bouygues) y a una plataforma de generacion de video ajena (`wan.video`), por lo que se han descartado por no guardar relacion con `wan-su/my-brain-v2`.
