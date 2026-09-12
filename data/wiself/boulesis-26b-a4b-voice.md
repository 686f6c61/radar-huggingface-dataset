# Wiself/Boulesis-26B-A4B-Voice

## Resumen

Boulesis-26B-A4B-Voice es un artefacto de pesos de 1,5 GB publicado por el usuario Wiself en HuggingFace. No es un modelo completo: contiene un unico tensor, el `lm_head.weight` (capa de salida o cabeza de vocabulario, con forma `[262144, 2816]`), extraido del modelo de roleplay SubMaroon/Boulesis-26B-A4B, un build de 26B de parametros totales y 4B activos construido sobre la familia Gemma 4. La propuesta es trasplantar unicamente la "voz" estilistica de Boulesis —tono, decisividad y adherencia al lore— sobre cualquier GGUF compatible de Gemma 4 26B A4B que el usuario ya tenga descargado.

El modelo de origen es un build compuesto: aritmetica de tareas QK mas un LoRA fusionado sobre un cuerpo abliterated (Heretic), con un injerto de razonamiento procedente de Pantheon. Segun el registro de experimentos del autor original, la mejora medible mas clara en roleplay provino de un unico tensor trasplantado, el `lm_head` de StyleTune-V2 de Gryphe, uno de entre 659 tensores. Este repositorio aisla exactamente ese tensor, de modo que la descarga es un tensor suelto y no un modelo completo.

Su interes actual es que propone un formato de distribucion de "voces" desacopladas del modelo: un fichero de 1,5 GB que se aplica con la herramienta Voice sobre GGUFs ya existentes, sin adaptadores en tiempo de ejecucion ni un segundo modelo cargado en memoria. El repositorio acumulaba 1 like y 0 descargas en el momento de la consulta, y el propio autor de esta voz declara que todavia no la ha evaluado por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una arquitectura propia: es la cabeza de salida (`lm_head.weight`) de un transformer MoE de la familia Gemma 4, formato `[262144, 2816]` |
| Parametros totales | 26B en el modelo base (Gemma 4 26B A4B); el tensor distribuido aqui contiene 738.197.504 parametros (~738M) |
| Parametros activos | 4B en el modelo base (sufijo A4B); no aplica al tensor aislado |
| Longitud de contexto | No disponible (la hereda del GGUF objetivo sobre el que se aplique) |
| Tipos de cuantizacion | El artefacto se entrega en el dtype original del tensor. Al castear sobre un GGUF, solo la cabeza se cuantiza a Q8_0 y el resto de tensores se copia byte a byte; compatible con cualquier cuantizacion del objetivo (Q4_K_M, Q5, Q6, Q8_0, etc.) |
| Idiomas soportados | en (segun la model card); la cobertura de otros idiomas depende del GGUF objetivo y no esta documentada |
| Licencia | gemma |
| Formato de pesos | safetensors (`voice.safetensors`, ~1,5 GB) mas `voice.json` con metadatos; el destino de aplicacion es GGUF |

## Arquitectura y entrenamiento

No hay entrenamiento asociado a este repositorio: es una operacion de extraccion y trasplante de un unico tensor. La cadena de procedencia documentada es la siguiente: el build Boulesis parte de un cuerpo abliterated (Heretic), sobre el que se aplican aritmetica de tareas QK y un LoRA fusionado, con fine-tunes de los autores `coder3101` y `Gryphe` y un injerto de razonamiento de Pantheon. El autor del modelo fuente identifico que el mayor salto medible en calidad de roleplay procedia del `lm_head` de StyleTune-V2 de Gryphe, y es ese tensor el que se aisla aqui.

El mecanismo de aplicacion es un casteo de pesos: la herramienta Voice sustituye el tensor `lm_head.weight` del GGUF objetivo por el de esta voz y copia el resto de tensores sin modificarlos; el resultado es un unico fichero GGUF ejecutable con `llama serve -m modelo.gguf --jinja`, sin LoRA ni adaptador en tiempo de ejecucion. Existe una ruta alternativa en modo delta (`voice delta ... --base google/gemma-4-26B-A4B-it`) que transporta solo la diferencia respecto al checkpoint instruct base, pensada para evitar bucles de generacion en objetivos muy modificados o abliterated, ya que mantiene el enrutado del MoE mas estable. El flag `--speak` fuerza la voz a traves de `output.weight` y solo funciona en GGUF. El tensor se puede verificar con `voice info voice.safetensors`, que debe devolver `lm_head.weight · [262144, 2816]`.

## Capacidades

- Roleplay y roleplay adulto: el modelo fuente esta posicionado por su autor como el mejor modelo RP/ERP/Dark RP de la clase 24-26B en modo thinking, segun CaliperBench (septiembre de 2026).
- Transferencia de estilo y voz narrativa: el tensor sustituye la cabeza de salida y altera el estilo de escritura, la decisividad y la adherencia al lore del personaje.
- Adherencia a tarjetas de personaje: el material promocional afirma que el estilo y el lore se extraen de la tarjeta de personaje en lugar de reflejarse a partir de los mensajes del usuario.
- Modo thinking: la tarjeta del modelo fuente recomienda thinking activado, con temperature 1.0, top-K 64, top-P 0.95 y penalizacion de repeticion 1.05-1.1.
- Aplicacion sobre finetunes distintos del base y sobre cualquier cuantizacion GGUF, dejando intactos los tensores originales del objetivo.
- Generacion de texto general: no es una capacidad propia de este repositorio, sino la del GGUF subyacente, que la conserva al no modificarse mas que la cabeza.
- Tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multietapa: no disponible como capacidad propia; el modelo fuente incorpora un injerto de razonamiento, pero no hay documentacion especifica de agentes.
- Multimodalidad, vision y audio: no disponible. El tag `voice` designa el trasplante de estilo, no una capacidad de audio o sintesis de voz.
- Idiomas: ingles (`en`) segun la model card.

## Casos de uso

- Roleplay narrativo de largo recorrido: se aplica la voz sobre un GGUF de Gemma 4 26B A4B ya descargado y se ejecuta con llama.cpp, lo que permite mantener conversaciones multi-turno con un personaje cuyo estilo y lore son consistentes en lugar de imitar el registro del usuario.
- Escenarios de roleplay adulto y dark RP: el modelo fuente esta posicionado explicitamente para este nicho, de modo que la voz resulta adecuada cuando se necesita un registro mas decisivo y menos evasivo, siempre bajo las condiciones de uso de la licencia Gemma y la legislacion aplicable.
- Transferencia de estilo sobre un finetune propio: si un equipo dispone de un finetune de Gemma 4 26B A4B con mejor base de conocimiento, el casteo permite conservar esa base y ganar la voz de Boulesis sin reentrenar nada.
- Comparacion controlada de cuantizaciones: como el casteo solo reemplaza la cabeza, se puede generar la misma voz sobre Q4_K_M, Q5_K_M y Q8_0 y medir el efecto de la cuantizacion sobre el estilo conservando el resto de tensores identicos.
- Investigacion sobre desacoplamiento de estilo y conocimiento: el repositorio es un caso practico de hasta que punto el comportamiento estilistico de un modelo reside en una unica matriz de proyeccion al vocabulario, util para experimentos de interpretabilidad y de edicion de pesos.
- Despliegue local en una sola maquina: con el GGUF resultante y `llama serve --jinja`, un estudio pequeño puede ofrecer un servicio de generacion de texto con personajes sin infraestructura de adaptadores ni servidores LoRA.
- Evaluacion comparativa de voces: la existencia de variantes emparejadas (por ejemplo la QAT) permite intercambiar cabezas sobre el mismo cuerpo y aislar el efecto de la voz en pruebas ciegas con anotadores humanos.
- Red teaming de contenido: al tratarse de un build que parte de un cuerpo abliterated, resulta util para medir la facilidad con que un modelo local produce contenido no filtrado y calibrar las politicas de moderacion antes de exponerlo a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es cualitativo y procede del autor del modelo fuente, no del publicador de esta voz, que declara no haberla evaluado por su cuenta: posicion en primer lugar de la clase 24-26B en roleplay segun CaliperBench (modo thinking, septiembre de 2026) y ausencia de olvido catastrofico de la inteligencia base segun las pruebas del autor.

| Benchmark | Resultado | Fuente |
|---|---|---|
| CaliperBench (roleplay, thinking) | Mejor modelo RP/ERP/Dark RP de la clase 24-26B | Afirmacion del autor del modelo fuente, recogida en la model card |
| MMLU, HumanEval, GSM8K u otros | No disponible | No publicados en la informacion consultada |

## Requisitos de hardware

- Huella del artefacto: 1,5 GB en disco; el casteo no requiere GPU, solo el fichero GGUF objetivo y la herramienta Voice.
- Requisitos reales de inferencia: los marca el GGUF objetivo de 26B (4B activos), no este tensor.
- VRAM estimada por cuantizacion (estimacion a partir del numero de parametros totales, no publicada por el autor): en Q4_K_M en torno a 15-16 GB; en Q5_K_M en torno a 18-19 GB; en Q6_K en torno a 21-22 GB; en Q8_0 en torno a 27-28 GB; en bf16 en torno a 52 GB. Hay que anadir el coste de la cache KV segun la longitud de contexto.
- GPU consumer: cabe en una RTX 3090 o RTX 4090 de 24 GB con cuantizaciones Q4_K_M y Q5_K_M y contexto moderado; en Q6_K el margen es muy ajustado y en Q8_0 no cabe.
- GPU profesional: una A100 de 40 GB o una H100 cubren Q8_0 con holgura; para bf16 hacen falta A100/H100 de 80 GB o repartir el modelo entre dos GPU.
- Multi-GPU: el reparto por capas con llama.cpp (`--split-mode`) permite servir cuantizaciones altas en dos GPU consumer de 24 GB.
- Opciones de despliegue: llama.cpp y `llama serve` con `--jinja` (ruta documentada por el autor), Ollama y LM Studio sobre el GGUF resultante; vLLM con soporte de GGUF como alternativa para servicio concurrente. El casteo solo admite objetivos GGUF.
- Latencia y throughput: no publicados. Al ser un MoE con 4B activos sobre 26B totales, el coste por token es inferior al de un modelo denso de 26B, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wiself/Boulesis-26B-A4B-Voice | 1 tensor de ~738M sobre Gemma 4 26B A4B | Heredado del GGUF objetivo | Sin evaluacion propia; cita CaliperBench a traves de la fuente | gemma | safetensors, ~1,5 GB |
| Wiself/Boulesis-26B-A4B-QAT-Voice | 1 tensor equivalente, emparejado con GGUFs derivados de QAT | Heredado del GGUF objetivo | No disponible | gemma | safetensors |
| SubMaroon/Boulesis-26B-A4B | 26B totales / 4B activos | No disponible en la informacion | Mejor RP de la clase 24-26B segun CaliperBench, afirmado por el autor | gemma | Pesos completos |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos | No disponible en la informacion | No disponible | gemma | Checkpoint instruct; cabeza ligada al embedding, sin tensor `lm_head` separado |

## Limitaciones y advertencias

- No es un modelo ejecutable por si mismo: sin un GGUF compatible de Gemma 4 26B A4B no produce ninguna salida.
- El publicador declara explicitamente que no ha evaluado esta voz; todas las afirmaciones de calidad proceden del autor del modelo fuente.
- No hay resultados numericos de benchmarks disponibles, solo afirmaciones cualitativas.
- Solo ingles documentado; el comportamiento en castellano u otros idiomas depende del GGUF objetivo y no esta verificado.
- En objetivos muy modificados o abliterated, el casteo directo puede provocar bucles de generacion; la solucion documentada es la ruta delta contra `google/gemma-4-26B-A4B-it`.
- Incompatible con otros tamanos de Gemma 4 (9B, 12B, 31B) por desajuste de forma, y con arquitecturas que no sean Gemma.
- El termino `voice` puede inducir a confusion: no aporta capacidades de audio ni de sintesis de voz.
- Al derivar de un cuerpo abliterated con injertos de terceros, la cadena de procedencia es larga (Heretic, Pantheon, StyleTune-V2 de Gryphe, fine-tunes de `coder3101`), lo que complica la atribucion y conviene revisar antes de redistribuir.
- El casteo cuantiza la cabeza a Q8_0, una perdida descrita como casi sin perdida, pero que sigue siendo una modificacion de los pesos originales.
- La licencia es Gemma, no Apache ni MIT: los terminos de uso se heredan del modelo fuente y deben revisarse antes de compartir modelos con la voz aplicada o de usarlos comercialmente.
- Riesgo de contenido: al estar orientado a RP adulto y dark RP, y al partir de un modelo abliterated, la probabilidad de generar material no filtrado es alta; requiere moderacion si se expone a usuarios finales.
- Riesgo de alucinacion y de deriva de personaje: no documentado de forma especifica para esta voz, pero inherente al roleplay de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wiself/Boulesis-26B-A4B-Voice
- Modelo fuente: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Herramienta Voice: https://huggingface.co/Wiself/voice
- Variante emparejada con GGUFs QAT: https://huggingface.co/Wiself/Boulesis-26B-A4B-QAT-Voice
- Resultados de CaliperBench para el modelo fuente: https://caliperbench.com/m/boulesis-26b-a4b-thinking/
- Perfil del autor del build original: https://huggingface.co/SubMaroon
- StyleTune-V2 de Gryphe (origen del tensor `lm_head`): enlace no disponible en la informacion proporcionada
- Terminos de licencia Gemma: no disponible en la informacion proporcionada; consultese la model card del modelo fuente antes de redistribuir
