# win10/Lfm2-MaleCNS-Titans-VL-3B-V2-SFT

## Resumen

Lfm2-MaleCNS-Titans-VL-3B-V2-SFT es un ajuste fino multimodal publicado por el usuario `win10` a partir de LiquidAI/LFM2.5-VL-3B, un modelo vision-language de aproximadamente 3,3 mil millones de parametros. El repositorio contiene un checkpoint fusionado completo que incluye, ademas del backbone nativo de vision y lenguaje, un runtime de doble memoria personalizado (etiquetado como "male-cns" y "titans") y modulos auxiliares descritos en la model card como memoria, VAE y controlador. El pipeline declarado es `image-text-to-text` y el modelo requiere `trust_remote_code=True` porque incorpora codigo de arquitectura propio.

El entrenamiento documentado es una etapa unica de SFT supervisado: 464 de 464 actualizaciones del optimizador completadas sobre 3.712 ejemplos (2.718 de TIGER-Lab/VisualWebInstruct y los 994 ejemplos solo de imagen de RUC-NLPIR/Omnimodal-Agent-SFT-2K), con LoRA de rango 8 y alpha 16 sobre modulos de lenguaje, vision, proyector, memoria, VAE y controlador, adaptadores fusionados y ventana de corte nativa de 4.096 tokens. Segun el autor, el checkpoint no ha pasado por la etapa posterior de aprendizaje de memoria HashHop, que se versiona en un repositorio aparte.

Su relevancia es fundamentalmente de investigacion: explora interfaces de memoria persistente y representaciones internas controlables sobre un VLM pequeno. Los propios resultados publicados por el autor en tareas de recuperacion de memoria son negativos (0/42 respuestas exactas con enrutado nativo y con unidades oraculo), por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion. Los resultados de busqueda web disponibles no aportan informacion adicional sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LiquidAI/LFM2.5-VL-3B (vision-language), con codigo personalizado (`lfm2_titans`) que anade runtime de memoria dual, modulos de memoria, VAE y controlador; el detalle interno del backbone no esta especificado en la informacion disponible |
| Parametros totales | 3.327.986.595 (dato de los safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; la model card indica un corte nativo de entrenamiento de 4.096 tokens |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en BF16 |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | lfm1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (repo de 7,5 GB), libreria `transformers` con carga remota de codigo |

## Arquitectura y entrenamiento

La model card no describe en detalle el backbone, pero si identifica el modelo base (LiquidAI/LFM2.5-VL-3B) y las etiquetas tecnicas del repositorio: `lfm2`, `lfm2_titans`, `vision-language`, `memory`, `custom_code`, `jacobian-lens` y `male-cns`. El autor indica que el repositorio incluye el backbone nativo de vision y lenguaje junto con un "custom dual-memory runtime", y que el modelo expone una interfaz explicita de archivo fisico (`open_physical_archive`, `session.observe`, `session.learn`, `append`) con una direccion de concepto nativa y una unidad fisica inmutable. Tambien menciona componentes de memoria, VAE y controlador dentro del ajuste LoRA. Todo ello implica que la implementacion no es un transformer estandar y depende de codigo propio para cargarse y ejecutarse.

El entrenamiento es una SFT de una sola epoca gestionada con LlamaFactory (preprocesado, batching, Trainer y optimizacion nativos), sin planificador de chunks personalizado. Se completaron 464/464 actualizaciones con lote fisico de 8, acumulacion 1 y corte nativo de 4.096; el LoRA (rango 8, alpha 16) cubrio lenguaje, vision, proyector, memoria, VAE y controlador, y los adaptadores se fusionaron. La ejecucion se reanudo desde un checkpoint validado en el paso 352 tras una interrupcion del worker, conservando optimizador, RNG y posicion en los datos. La verificacion de la fusion audito 424 tensores efectivos con una KL de logits de 0,00071211 y una diferencia absoluta maxima de 0,14062500; el autor advierte que la fusion en BF16 no garantiza preservar exactamente todas las predicciones. La plantilla inicial de SFT de LlamaFactory omitia el BOS nativo inicial, correccion que solo se aplico en la etapa posterior de HashHop. El entrenamiento uso FlashAttention-2.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat aplicada mediante el tokenizer nativo.
- Comprension de imagen y texto (pipeline `image-text-to-text`): el ajuste incluye 2.718 ejemplos de VisualWebInstruct y los 994 ejemplos solo de imagen de Omnimodal-Agent-SFT-2K.
- Ajuste para escenarios de agente multimodal, segun los datasets de instruccion utilizados.
- Interfaz de memoria externa explicita: apertura de un archivo fisico, observacion de hechos, aprendizaje fisico opcional en las FFN y anexado de unidades inmutables con direccion de concepto.
- Instrumentacion tipo "jacobian-lens": el autor reporta calibracion posterior al SFT e intervenciones funcionales sobre representaciones internas, con controles limitados.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Modo de razonamiento explicito (thinking), audio o video: no disponible.
- Recuperacion fiable de memoria multi-salto: no demostrada; los resultados publicados por el propio autor son 0/42 respuestas exactas con enrutado nativo.

## Casos de uso

- Investigacion sobre memoria persistente en VLMs: el modelo expone una API de archivo fisico con `observe`, `learn` y `append`, lo que permite experimentar con escritura y recuperacion de hechos fuera de los pesos. Es adecuado precisamente porque su interfaz esta instrumentada y porque el autor publica controles negativos utiles como linea base.
- Analisis de capturas de pantalla y paginas web para generacion de instrucciones: el ajuste sobre VisualWebInstruct apunta a este dominio, y el modelo acepta pares imagen-texto, aunque con ventana de entrenamiento de 4.096 tokens y sin garantia de consistencia factual.
- Prototipado de agentes multimodales de un solo turno o pocos turnos: puede usarse como generador de respuestas en un bucle de agente, pero conviene validar la coherencia multi-turno, ya que el autor observo repeticiones y detalles inventados en las pruebas de diagnostico.
- Descripcion de imagenes y ayuda a la accesibilidad en ingles o chino: el modelo puede producir descripciones de imagenes en esos dos idiomas; requiere revision humana por el riesgo de alucinacion documentado.
- Docencia y demostraciones sobre arquitecturas híbridas de memoria: sirve como ejemplo reproducible de VLM de 3B con modulos de memoria y controlador, con el codigo de investigacion publicado en GitHub.
- Filtrado y preetiquetado de datos visuales: puede generar descripciones o respuestas candidatas sobre grandes lotes de imagenes como paso previo a la validacion humana, dado su tamano reducido y su capacidad de ejecutarse en una GPU de consumo.
- Comparacion experimental de lectores serializados: los propios materiales del autor distinguen una version de lector sin reparar y otra reparada, por lo que el modelo es util para estudiar como afecta la serializacion de la pregunta (BOS nativo, tokens de rol) al rendimiento en recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico conjunto de medidas publicado por el autor es una prueba de desarrollo sobre 42 preguntas de hash retenidas, que incluye grafos no vistos, extrapolacion a 10 saltos y cadenas entre unidades. El propio autor advierte que no es un benchmark final intacto y que las salidas completas, incluidos errores y repeticiones, se conservan.

| Condicion | Respuestas de hash exactas |
|---|---|
| Enrutado nativo (native-routed) | 0/42 |
| Unidades oraculo (oracle-units) | 0/42 |
| Unidad incorrecta (wrong-unit) | 0/42 |
| Vacio (empty) | 0/42 |
| Fuente visible (source-visible) | 4/42 |
| Solo fisico oraculo (oracle-physical-only) | 0/12 |
| Solo latente oraculo (oracle-latent-only) | 0/12 |
| Codigos y pesos oraculo (oracle-codes-and-weights) | 0/12 |

Ademas, la suite genero 32 salidas de coherencia multi-turno y 52 salidas en total alcanzaron su limite configurado. Los resultados corresponden al lector de SFT original, antes de las reparaciones de direccion de consulta y BOS incluidas en el paquete, y el propio autor indica que la evaluacion emparejada con el lector reparado seguia en ejecucion.

## Requisitos de hardware

- Pesos en BF16: unos 6,65 GB (3.327.986.595 parametros); el repositorio completo ocupa 7,5 GB, mas el coste de los modulos de memoria y del codigo personalizado en tiempo de ejecucion.
- VRAM estimada para inferencia en BF16/FP16: del orden de 8 a 10 GB contando pesos, cache KV y activaciones; no se publican medidas oficiales de pico de memoria.
- Cuantizacion: no se documentan pesos GGUF, AWQ, GPTQ ni variantes de 8 o 4 bits. Dado el uso de `custom_code`, no hay garantia de que los pipelines de cuantizacion estandar funcionen sin adaptaciones.
- GPU recomendadas: para BF16, tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 24 GB, L4, A10G). En tarjetas de 8 GB el modelo en BF16 no cabe con holgura.
- Despliegue: la via documentada es `transformers` con `AutoModelForImageTextToText`, `AutoProcessor`, `trust_remote_code=True`, `dtype=torch.bfloat16` y el kernel `kernels-community/flash-attn2` en el commit `f50dc99ed079b35990bc895d43fd353ea0cb376d`. Se requiere un entorno PyTorch/Transformers registrado en el repositorio de investigacion del autor.
- Soporte en vLLM, TGI, llama.cpp, Ollama o servidores similares: no disponible; la dependencia de codigo de arquitectura propio hace poco probable su funcionamiento directo sin trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. La comparacion se limita a caracteristicas declaradas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lfm2-MaleCNS-Titans-VL-3B-V2-SFT | 3,33 B | no disponible (corte de entrenamiento de 4.096 tokens) | en, zh | lfm1.0 | HuggingFace, requiere `trust_remote_code=True` |
| LiquidAI/LFM2.5-VL-3B (modelo base) | no disponible en la informacion | no disponible | no disponible | licencia de Liquid AI | HuggingFace |
| win10/Lfm2-MaleCNS-Titans-VL-3B-V2-HashHop (etapa posterior) | no disponible | no disponible | no disponible | no disponible | HuggingFace; segun el autor, puede estar en progreso |
| Otros VLM de ~3B (Qwen2.5-VL-3B, SmolVLM2-2.2B u similares) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Recuperacion de memoria no funcional en las pruebas publicadas: 0/42 respuestas exactas con enrutado nativo, 0/42 con unidades oraculo y 4/42 en el control de fuente visible. El autor indica explicitamente que no estan establecidos el recuerdo multi-salto fiable ni la consistencia factual universal.
- Coherencia de generacion: se observaron repeticiones y detalles inventados en los diagnosticos de SFT, y 52 salidas de la suite alcanzaron su limite configurado. Riesgo de alucinacion elevado en uso abierto.
- Los resultados publicados corresponden al lector de SFT original, no al lector con las reparaciones de direccion de consulta y BOS incluidas en este paquete; la evaluacion del lector reparado estaba en ejecucion en el momento de redactar la model card.
- Este checkpoint no ha pasado por la etapa posterior de aprendizaje de memoria HashHop, que se distribuye por separado.
- La fusion en BF16 no preserva exactamente todas las predicciones: KL de logits de 0,00071211 y diferencia absoluta maxima de 0,14062500 sobre 424 tensores auditados.
- La plantilla de SFT original omitia el BOS nativo inicial; el historial completado se conserva tal cual en lugar de reescribirse.
- Idiomas: solo se declaran ingles y chino; no hay soporte documentado de castellano ni de otras lenguas.
- Contexto limitado: el corte nativo usado en entrenamiento es de 4.096 tokens, lo que restringe conversaciones largas y documentos extensos.
- Licencia `lfm1.0` (campo `license: other`): las condiciones concretas de uso comercial no se detallan en la informacion disponible y deben revisarse en el archivo LICENSE del repositorio antes de cualquier despliegue en produccion.
- Seguridad del codigo: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo de arquitectura publicado por el autor; conviene auditar ese codigo antes de usarlo en entornos controlados.
- Dependencia de un kernel de FlashAttention-2 fijado a un commit concreto de la comunidad, lo que complica la reproducibilidad en otros entornos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion independiente por parte de terceros.
- Los resultados de busqueda web disponibles no guardan relacion con este modelo y no aportan informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/win10/Lfm2-MaleCNS-Titans-VL-3B-V2-SFT
- Etapa posterior (HashHop) del mismo autor: https://huggingface.co/win10/Lfm2-MaleCNS-Titans-VL-3B-V2-HashHop
- Repositorio de investigacion (codigo de arquitectura, experimentos y evidencia): https://github.com/win10ogod/LFM2-JSpace-Memory
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Dataset de SFT visual: https://huggingface.co/datasets/TIGER-Lab/VisualWebInstruct
- Dataset de SFT de agente omnimodal: https://huggingface.co/datasets/RUC-NLPIR/Omnimodal-Agent-SFT-2K
