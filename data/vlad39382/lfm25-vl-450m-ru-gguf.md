# Vlad39382/lfm25-vl-450m-ru-gguf

## Resumen

lfm25-vl-450m-ru-gguf es una adaptación al ruso del modelo multimodal LiquidAI/LFM2.5-VL-450M, publicada por el usuario Vlad39382 como artefactos GGUF para llama.cpp. No se trata de un entrenamiento desde cero: el autor parte del modelo base de Liquid AI y aplica QLoRA, un ajuste de dominio en ruso (DAPT) y un SFT posterior, con el objetivo declarado de construir un asistente on-device para aplicaciones de mensajería. Las dos tareas que el autor documenta son summarize (resumir conversaciones) y draftReply (redactar un borrador de respuesta).

El repositorio contiene solo dos ficheros: el modelo de texto cuantizado a Q4_K_M con imatrix (245.566.016 bytes) y el proyector de visión mmproj en Q8_0 (101.634.720 bytes), de modo que el despliegue completo ocupa menos de 350 MB en disco. El recuento real de parámetros en safetensors es de 354.483.968, aunque el nombre del modelo anuncie 450M. La ventana de contexto declarada por el autor es de 4096 tokens, con KV-cache en Q8_0.

Su interés es acotado pero claro: demuestra que es viable especializar un modelo visión-lenguaje de menos de 400 M de parámetros para una tarea concreta de mensajería en un idioma que no figura entre los soportados por el modelo original, y ejecutarlo en CPU o en GPU integrada. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, y hereda la licencia LFM 1.0 del modelo base, que no es permisiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base LiquidAI/LFM2.5-VL-450M; la información proporcionada no detalla bloques ni tipo de atención) |
| Parametros totales | 354.483.968 (dato real de safetensors); el nombre comercial indica 450M |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | 4096 tokens (declarados en la model card, con KV-cache Q8_0) |
| Tipos de cuantizacion | Q4_K_M con imatrix (modelo de texto) y Q8_0 (proyector mmproj) |
| Idiomas soportados | ruso (ru); el ruso no figura entre los idiomas base del modelo original |
| Licencia | other — LFM 1.0, heredada del modelo base, no permisiva |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo (número de capas, tipo de atención, proporción de bloques convolucionales frente a atención, etc.). Lo que sí consta es el pipeline de adaptación: se parte de LiquidAI/LFM2.5-VL-450M, un modelo visión-lenguaje, y se aplica QLoRA seguido de DAPT en ruso y un SFT final. Durante ese proceso el bloque de visión quedó congelado, por lo que el autor distribuye el proyector mmproj tal cual lo hereda (mmproj-sft2-Q8_0.gguf, 101.634.720 bytes).

El resultado se empaqueta únicamente como GGUF para llama.cpp, con cuantización Q4_K_M asistida por imatrix y KV-cache en Q8_0. No se indica el volumen de tokens de entrenamiento, la composición del dataset de DAPT/SFT ni si hubo etapas de RLHF o DPO. Se trata de los artefactos de un proyecto de fin de estudios (on-device-ai-messanger-diploma), no de un lanzamiento con validación exhaustiva.

## Capacidades

- Generación de texto conversacional en ruso, orientada a dos tareas concretas: resumir un historial de mensajería y redactar un borrador de respuesta.
- Comprensión de imágenes de forma limitada: el repositorio incluye el proyector mmproj, pero el autor advierte de que el bloque de visión no se entrenó y se ofrece tal cual se heredó del modelo base.
- Formato de pesos compatible con llama.cpp, lo que permite ejecución en CPU, GPU integrada y dispositivos de borde.
- Etiqueta conversational y endpoints_compatible, lo que indica que el autor lo publicó pensando en servirlo mediante una API compatible con el endpoint de llama.cpp.
- No hay evidencia en la información disponible de soporte de tool calling o function calling.
- No hay evidencia en la información disponible de capacidades de agente o razonamiento multi-paso.
- No hay evidencia en la información disponible de un modo de razonamiento explícito (thinking mode) ni de soporte de audio.
- Capacidad multilingüe: solo ruso declarado; el resto de idiomas no está garantizado y el propio autor señala que el ruso se compensó vía fine-tuning porque no está entre los idiomas base del modelo original.

## Casos de uso

- Resumen de conversaciones de mensajería: el caso de uso principal documentado (summarize). Un cliente de mensajería podría generar un resumen del hilo al abrir un chat, aprovechando que el modelo cabe en el propio dispositivo y el historial no sale de él.
- Borrador de respuestas con revisión humana: el autor implementa draftReply para proponer un texto de respuesta. Dado que el propio autor reconoce que esta función sigue siendo débil, el uso realista es como sugerencia editable y no como respuesta autónoma.
- Asistente con privacidad por diseño: al ejecutarse en local vía llama.cpp con menos de 350 MB en disco, permite procesar conversaciones sensibles sin enviarlas a un servicio en la nube, lo que simplifica el cumplimiento de requisitos de protección de datos.
- Integración en aplicaciones móviles o de escritorio: el tamaño del fichero Q4_K_M (245,6 MB) y el del proyector (101,6 MB) lo hacen apto para empaquetarse en una app de escritorio o en un dispositivo de gama media sin depender de conectividad.
- Clasificación y triaje ligero de mensajes: con temperature=0.1 y los prompts adecuados, puede usarse para etiquetar o priorizar mensajes entrantes, una tarea donde el coste de un error es bajo y el volumen justifica un modelo pequeño.
- Investigación y docencia sobre adaptación de modelos pequeños: sirve como ejemplo reproducible de QLoRA + DAPT + SFT sobre una base multimodal de menos de 400 M de parámetros, útil para estudiar el coste y los límites de la especialización idiomática.
- Base para nuevas adaptaciones: al estar publicado en GGUF y con la licencia heredada del modelo base, puede emplearse como punto de partida para otras tareas en ruso, siempre que se respeten las condiciones de la licencia LFM 1.0.
- Inferencia en entornos sin GPU: al ser compatible con llama.cpp y tener un peso de cuantización reducido, puede ejecutarse íntegramente en CPU en portátiles y servidores modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de sumarización en ruso, y el autor solo describe cualitativamente el comportamiento de draftReply como débil. No se dispone tampoco de mediciones de latencia o throughput.

## Requisitos de hardware

- Peso en disco: 245.566.016 bytes para el modelo de texto en Q4_K_M y 101.634.720 bytes para el proyector visual en Q8_0, es decir, unos 347 MB en total.
- VRAM estimada para inferencia: por debajo de 1 GB en Q4_K_M incluyendo el proyector y una KV-cache Q8_0 de 4096 tokens; es una estimación razonada a partir del tamaño de los ficheros, no un dato publicado.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria libre sirve; no tiene sentido reservarle hardware de gama alta. Es funcional en GPU integradas y en aceleradores de borde con backend compatible con llama.cpp.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, GTX 1650 o incluso iGPU recientes, siempre que la memoria disponible supere el medio gigabyte.
- Ejecución sin GPU: viable en CPU, que es el escenario natural del proyecto por su orientación on-device.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, con el mmproj cargado aparte para las capacidades de visión), Ollama importando el GGUF, LM Studio y frontales basados en llama.cpp. El soporte de GGUF en vLLM es parcial y no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos del modelo base proceden de la información proporcionada. Los de las alternativas son especificaciones públicas habituales de esos modelos y no se han verificado contra sus model cards en el marco de esta ficha, por lo que conviene contrastarlas antes de citarlas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vlad39382/lfm25-vl-450m-ru-gguf | 354.483.968 | 4096 tokens (declarados) | ruso | LFM 1.0 (no permisiva) | GGUF en HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-VL-450M (modelo base) | no disponible en la información proporcionada | no disponible | no incluye ruso entre sus idiomas base | LFM 1.0 | safetensors, modelo oficial de Liquid AI |
| Qwen2.5-0.5B-Instruct | ~494 M (dato público, verificar) | ~32 000 tokens (dato público, verificar) | multilingüe amplio (dato público, verificar) | Apache 2.0 (dato público, verificar) | safetensors y GGUF, ecosistema amplio |
| SmolLM2-360M-Instruct | ~362 M (dato público, verificar) | ~8192 tokens (dato público, verificar) | principalmente inglés (dato público, verificar) | Apache 2.0 (dato público, verificar) | safetensors y GGUF |

La diferencia relevante frente a las alternativas no es el rendimiento, que no está medido, sino la licencia: Qwen2.5 y SmolLM2 se distribuyen bajo Apache 2.0, mientras que este modelo arrastra la LFM 1.0, no permisiva.

## Limitaciones y advertencias

- Licencia no permisiva: hereda la LFM 1.0 del modelo base, lo que condiciona el uso comercial y la redistribución. Hay que revisar los términos antes de integrarlo en un producto.
- Idioma: solo se declara ruso, y el propio autor reconoce que el ruso no está entre los idiomas base del modelo, de modo que la cobertura se ha compensado con fine-tuning y puede ser frágil fuera de los dominios de entrenamiento.
- draftReply se describe explícitamente como débil, incluso por parte del autor. No es apto para responder de forma autónoma sin supervisión.
- Visión congelada: el bloque visual no se entrenó y el proyector se distribuye tal cual, por lo que el comportamiento multimodal es el heredado del modelo base y no está alineado con las tareas de mensajería.
- Sin benchmarks: no hay métricas publicadas que permitan estimar la calidad real en sumarización ni compararla con alternativas.
- Riesgo de alucinación: no hay evaluación publicada, y en un modelo de ~354 M de parámetros el riesgo de inventar contenido en resúmenes de conversaciones es alto, especialmente con entradas largas.
- Límite de contexto: los 4096 tokens declarados se quedan cortos para hilos de mensajería extensos, que es precisamente el caso de uso principal.
- Madurez del proyecto: se trata de artefactos de un trabajo de fin de estudios, con 0 descargas y 0 likes, publicados y actualizados con cinco minutos de diferencia. No hay garantía de mantenimiento ni de soporte.
- Ausencia de datos de entrenamiento: no se documentan el volumen de tokens, la composición del dataset ni las etapas de alineación, lo que dificulta auditar sesgos o comportamiento fuera de distribución.
- Sesgos: no disponible, no se ha publicado ningún análisis al respecto.
- Tool calling y agentes: sin evidencia de soporte; no conviene asumirlo en diseño de producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vlad39382/lfm25-vl-450m-ru-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Los resultados de búsqueda web disponibles no contenían enlaces relevantes al modelo, al paper ni al repositorio del proyecto (on-device-ai-messanger-diploma); solo devolvieron páginas comerciales sin relación.
