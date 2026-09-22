# Walkowicz/kairos-sophron-1.0-14B

## Resumen

Kairos Sophron 1.0 14B es un ajuste fino del modelo base Qwen/Qwen2.5-Coder-14B-Instruct, publicado por el usuario Walkowicz, orientado especificamente a ingenieria de software. Su proposito declarado es generar el cambio mas pequeno que cumple el requisito, respetar los limites de clean code y no mezclar refactorizacion con funcionalidad nueva en una misma modificación. No es un modelo de proposito general: es un especialista de codigo con un estilo de respuesta muy acotado.

Tecnicamente, el autor partio de una LoRA fusionada en bf16 sobre el modelo base y la cuantizo a GGUF Q4_K_M (4,87 bits por peso, archivo de 8,4 GB). El repositorio publicado no contiene los pesos en safetensors ni el conjunto de entrenamiento, solo el artefacto cuantizado listo para desplegar. El modelo tiene 14.770.033.664 parametros y hereda la arquitectura transformer decoder-only de la familia Qwen2.

Su relevancia practica es la de un modelo local de asistencia a programacion: cabe en GPUs de consumo medio-alto (12 GB de VRAM con contexto de 8192 tokens) y funciona con Ollama mediante un Modelfile incluido. Ahora bien, el modelo es muy reciente, no tiene descargas ni valoraciones en HuggingFace, y su evaluacion se apoya exclusivamente en jueces automaticos (LLM-as-judge), no en benchmarks estandar reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, tag `qwen2`) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens configurados en el Modelfile publicado (`num_ctx` 8192); el modelo base Qwen2.5-Coder-14B-Instruct soporta 32 768 tokens nativos |
| Tipos de cuantizacion | GGUF Q4_K_M unicamente (4,87 BPW, 8,4 GB) |
| Idiomas soportados | ingles y portugues (en, pt); los identificadores de codigo se mantienen en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un solo archivo `kairos-sophron-1.0-14B-Q4_K_M.gguf`); el repositorio no publica safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con atencion causal y los mecanismos habituales de esta serie. No se documentan en la informacion disponible el numero de capas, la dimension oculta ni la configuracion exacta de cabezas de atencion de este ajuste, mas alla de que hereda la del base Qwen2.5-Coder-14B-Instruct. El autor no describe cambios arquitectonicos propios: no hay decodificacion especulativa, atencion lineal ni componentes SSM.

El proceso de entrenamiento se describe de forma escueta: se entreno una LoRA sobre Qwen2.5-Coder-14B-Instruct, se fusiono en bf16 y el resultado se cuantizo a Q4_K_M. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o preferencias. El repositorio excluye explicitamente el conjunto de entrenamiento, por lo que la receta completa no es reproducible. Tampoco se detalla la eleccion de hiperparametros del ajuste fino.

La unica validacion publicada es una compuerta de calidad con dos jueces LLM (Grok 4.6 Extra High y Opus 5.0) sobre el adaptador, mas una prueba de despliegue sobre este GGUF concreto. El autor reporta cero desacuerdos a nivel de caso entre ambos jueces y una Jaccard mediana de tokens de 0,947 entre este GGUF y el adaptador evaluado, lo que sugiere que la cuantizacion degrada poco la salida.

## Capacidades

- Generacion de codigo con criterio de cambio minimo: prioriza la modificacion mas pequena que satisface el requisito planteado.
- Separacion de responsabilidades en el cambio: evita mezclar refactorizacion y funcionalidad nueva en una misma propuesta.
- Respeto de limites de clean code segun lo declarado por el autor.
- Conversacion multi-turno (tag `conversational`) con formato de plantilla ChatML.
- Respuesta en el idioma del usuario, limitado a ingles y portugues; identificadores y simbolos de codigo permanecen en ingles.
- Compatibilidad con endpoints (`endpoints_compatible`), pensada para servir el modelo mediante API.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso explicito, vision, audio ni modo de pensamiento (thinking mode). Cualquier capacidad de este tipo seria la heredada del base Qwen2.5-Coder-14B-Instruct, no verificada por el autor para este ajuste.

## Casos de uso

- Revision de pull requests con cambios minimos: el modelo esta entrenado para proponer la modificacion mas pequena que cumple el requisito, lo que encaja en revisiones donde se penaliza el ruido en el diff y se exige que un PR haga una sola cosa.
- Correccion de bugs en produccion: dado un fragmento de codigo y un fallo reproducible, el estilo de cambio minimo reduce el riesgo de introducir regresiones colaterales en codigo legacy.
- Asistencia local en el IDE: con 8,4 GB de pesos y unos 10 GB de VRAM a 8192 tokens de contexto, puede ejecutarse en una estacion de trabajo con GPU de 12 GB sin enviar codigo propietario a servicios externos.
- Documentacion tecnica bilingue en ingles y portugues: util para equipos lusofonos que necesitan comentarios, mensajes de commit o guias en portugues manteniendo los identificadores en ingles.
- Generacion de parches para pipelines de CI/CD: al estar en GGUF y funcionar con Ollama, se puede integrar como paso automatizado de sugerencia de parches sobre un unico archivo o funcion, con temperatura 0 para salidas deterministas.
- Tareas de mantenimiento acotadas por contrato estricto: renombrar un simbolo, ajustar una validacion o anadir una guarda, casos donde el requisito es preciso y el margen de interpretacion es bajo.
- Prototipado de un asistente de codigo autoalojado: como base para un servicio interno con API compatible con endpoints, sin dependencia de proveedores cloud.

## Benchmarks y rendimiento

Los unicos datos publicados son la compuerta de evaluacion del autor, basada en jueces LLM y no en benchmarks estandar. No hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Evaluacion | In-domain | Held-out |
|---|---|---|
| Grok 4.6 Extra High (sobre el adaptador) | 17/20 | 19/20 |
| Opus 5.0 (sobre el adaptador) | 17/20 | 19/20 |
| Prueba de despliegue sobre este Q4_K_M | 17/20 | 20/20 |

Datos adicionales reportados: cero desacuerdos a nivel de caso entre ambos jueces y Jaccard mediana de tokens de 0,947 entre este GGUF y el adaptador evaluado. No se especifica la composicion de los conjuntos in-domain y held-out, ni el hardware de la prueba de despliegue.

## Requisitos de hardware

- VRAM estimada: unos 10 GB con `num_ctx` 8192, segun la prueba del autor, para un archivo de pesos de 8,4 GB.
- GPU de 12 GB: es el objetivo declarado; el modelo permanece completamente en GPU.
- GPU de 8 GB: no es viable, porque el archivo de pesos ya ocupa 8,4 GB y no queda espacio para el contexto ni para los buffers de inferencia.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por tamano, encajan GPUs de 12 GB o mas (por ejemplo, gama RTX xx70/xx80 con 12-16 GB, RTX 4080/4090, A100, H100), aunque el autor solo valida el escenario de 12 GB.
- Throughput reportado: aproximadamente 34 tokens por segundo en la prueba de despliegue del autor. No se indica la GPU empleada en esa medicion.
- Despliegue: Ollama es el metodo documentado, mediante `Modelfile` con paradas ChatML, `num_ctx` 8192 y temperatura 0. Al ser un GGUF, es compatible con el ecosistema llama.cpp. No se documenta soporte para vLLM, TGI ni otros servidores de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Kairos Sophron 1.0 14B | 14,77 B (denso) | 8192 configurados en el Modelfile; 32 768 nativos del base | GGUF Q4_K_M | Apache 2.0 | Solo compuerta con jueces LLM (17/20 in-domain, 20/20 held-out en la prueba de despliegue) |
| Qwen/Qwen2.5-Coder-14B-Instruct (base) | 14,77 B (denso) | 32 768 nativos | safetensors, GGUF, multiples cuantizaciones | Apache 2.0 | Benchmarks publicados por Qwen; no disponibles en esta busqueda |
| Alternativas de codigo de ~13-15 B (por ejemplo, CodeLlama-13B-Instruct o DeepSeek-Coder) | ~13-15 B | variable segun modelo | variable | variable (algunas con licencias no comerciales) | No disponibles en esta busqueda |

No se dispone de una comparacion cuantitativa fiable contra el modelo base ni contra alternativas, porque este ajuste no publica benchmarks estandar. Cualquier afirmacion de superioridad seria especulativa.

## Limitaciones y advertencias

- Modelo sin validacion de la comunidad: 0 descargas y 0 valoraciones en el momento de la consulta, lo que implica ausencia de contraste independiente.
- Evaluacion basada en dos jueces LLM, no en benchmarks reproducibles. Los resultados 17/20 y 20/20 proceden de la propia compuerta del autor y no son verificables con los datos publicados.
- No se publica el conjunto de entrenamiento ni los hiperparametros del ajuste fino, por lo que no se puede auditar que sesgos o estilos ha aprendido.
- Sesgos conocidos: no documentados. Al ser un ajuste sobre Qwen2.5-Coder con datos no divulgados, se heredan los sesgos del modelo base y se anaden los del dataset de ajuste, que se desconoce.
- Riesgo de alucinacion en APIs, librerias o funciones inventadas, inherente a los modelos de codigo de este tamano. El estilo de cambio minimo no elimina ese riesgo.
- Cobertura idiomatica limitada a ingles y portugues. No hay soporte declarado para castellano ni para otros idiomas.
- Restriccion de contexto practica: aunque el base soporta 32 768 tokens, la configuracion publicada usa `num_ctx` 8192. Ampliar el contexto aumenta el consumo de VRAM por encima de los 10 GB reportados.
- Temperatura 0 por defecto en el Modelfile: favorece la reproducibilidad, pero reduce la diversidad de propuestas en tareas exploratorias.
- La especializacion en cambios minimos puede ser contraproducente en tareas que requieren reescrituras amplias o redisenos de arquitectura.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia. Se desconoce si los datos de ajuste imponen restricciones adicionales, ya que no se publican.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Walkowicz/kairos-sophron-1.0-14B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Resultados de busqueda web: no se encontro ninguna referencia relevante al modelo. Todas las entradas devueltas (dominios ajenos, una edicion digital de prensa y un video sobre mantenimiento de cortacesped) no guardan relacion con Kairos Sophron 1.0 14B, con Qwen ni con el autor.
