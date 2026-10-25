# zugquants/LFM2.5-8B-A1B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una recuantización y "reempaquetado" de un modelo existente: `LiquidAI/LFM2.5-8B-A1B`, publicado por el usuario `zugquants` en formato GGUF. El modelo base es un MoE disperso de LiquidAI con 8.467.856.832 parámetros totales (unos 8,47 mil millones) del que se activan 4 de sus 32 expertos, es decir, aproximadamente 1.000 millones de parámetros por token generado. La model card se corresponde con el sistema "Turbo-Brilliance" del autor DavidAU, que añade una capa de prompting estructurado con 12 modos de razonamiento conmutables en tiempo de inferencia.

La propuesta diferencial no está en los pesos, sino en el envoltorio: el sistema inyecta entre cientos y miles de tokens de instrucciones antes de que el modelo empiece a razonar, lo que según el autor reduce el tiempo hasta el primer token útil y mejora la calidad en one-shot/two-shot. Todo ello se controla mediante etiquetas en el propio prompt, vía API o mediante cambios de palabra clave en vLLM.

Es relevante ahora por dos motivos prácticos: primero, demuestra una vía de bajo coste (prompt scaffolding sobre un modelo abierto) para especializar comportamiento sin reentrenar; segundo, el modelo base está pensado para edge y consumo, con ventana de 128k tokens y licencia Apache 2.0, lo que lo hace desplegable en GPU de consumo. Conviene tratarlo como un experimento en fase BETA: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse MoE) de la familia LFM2.5 de LiquidAI; 32 expertos con 4 activos por token. El detalle de la arquitectura interna (tipo de atención, capas) no está disponible en la información proporcionada |
| Parametros totales | 8.467.856.832 (~8,47 mil millones), dato de safetensors del modelo base |
| Parametros activos | ~1.000 millones (4 de 32 expertos), según la model card; el autor indica que se pueden activar más expertos en la mayoría de aplicaciones de inferencia |
| Longitud de contexto | 128.000 tokens (la model card cita "128k/131.000"); se recomienda un mínimo de 24.000 tokens para el sistema Turbo-Brilliance |
| Tipos de cuantizacion | GGUF en múltiples niveles del sistema "Max Quants" del autor (tensor de salida en BF16 para las variantes MAX), además de cuantizaciones IQ/Q estándar y BF16 de referencia. La lista exacta de ficheros no está disponible en la información proporcionada |
| Idiomas soportados | 16: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 58,9 GB con varias cuantizaciones); los datos de parámetros proceden del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/LFM2.5-8B-A1B` es un mezcla de expertos dispersa con 32 expertos y 4 activos, lo que da un total de ~8,47 B de parámetros con ~1 B activos por token. Esa relación es la que explica las cifras de velocidad que reporta el autor (400-500 tokens/s en una RTX 5090): el coste computacional por token se aproxima al de un modelo denso de 1 B, mientras que la capacidad efectiva se acerca a la de un 8 B. La model card del autor describe el modelo base como de uso general, con entrenamiento en tool calling y capacidades agénticas.

Sobre esa base, este repositorio aplica dos capas: (1) recuantización GGUF con el esquema "NEO Imatrix / Max Quants", que mantiene el tensor de salida (10-20 % de la salida del modelo según el autor) en BF16 para las variantes MAX; y (2) el sistema "Turbo-Brilliance", que no modifica los pesos, sino que inyecta en el prompt, en la fase previa al razonamiento, entre cientos y miles de tokens de instrucciones de enfoque para 12 modos de razonamiento. El autor afirma que esta inyección se procesa en milisegundos y que el modelo llega al primer token ya "encuadrado" en la tarea. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional y de uso general sobre una ventana de hasta 128.000 tokens.
- Razonamiento configurable: 12 modos de razonamiento conmutables en el prompt, vía API o mediante palabras clave en vLLM; incluyen un sistema de ayuda interactiva ("context help") para alinear el modo con el caso de uso.
- Tool calling / function calling, según la model card del modelo base.
- Capacidades agénticas y razonamiento multi-paso (entrenamiento agéntico declarado por el autor).
- Multilingüe: 16 idiomas, entre ellos español, portugués, francés, alemán, árabe, hindi y varios idiomas asiáticos.
- Control de longitud de salida: la model card indica que el modelo obedece la longitud solicitada; el rango habitual de salida es de 2k a 12k+ tokens.
- No se menciona soporte de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistencia de código en IDE o CLI: con 128k de contexto puede cargar varios ficheros y el historial de la sesión, y usar tool calling para ejecutar comandos o consultar documentación. Su número reducido de parámetros activos lo hace viable en una estación de trabajo con una sola GPU.
- Atención al cliente multi-turno: la ventana de 128k permite mantener conversaciones largas con el histórico completo y documentos de producto adjuntos; los modos de razonamiento permiten fijar un tono y un formato de respuesta estables antes de generar.
- Agentes de automatización de flujos: encadenar llamadas a APIs mediante function calling (por ejemplo, abrir tickets, consultar estado de pedidos) con razonamiento multi-paso; el modelo base está entrenado para tool calling.
- Procesamiento de documentación multilingüe: resumen, extracción y clasificación de documentos en los 16 idiomas soportados sin cambiar de modelo, útil en entornos con contenido en español, francés, alemán, árabe o chino.
- Despliegue en edge o en hardware de consumo: al activar solo ~1 B de parámetros por token, es candidato para inferencia local con llama.cpp/Ollama en GPU de gama media o incluso en CPU con cuantizaciones bajas, a costa de calidad.
- Generación de informes técnicos con formato fijo: los modos de razonamiento permiten forzar estructura (apartados, tablas, longitud) antes de que el modelo empiece a escribir, reduciendo el número de regeneraciones.
- Prototipado y evaluación de técnicas de prompting: útil para investigadores que quieran medir el efecto de la inyección de instrucciones previas al razonamiento frente al mismo modelo base sin el sistema.
- Localización y traducción asistida: combinación de ventana larga y cobertura de 16 idiomas para traducir y revisar lotes de textos manteniendo contexto entre segmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha de LiquidAI para los benchmarks del modelo base, pero esos datos no forman parte de la información proporcionada, por lo que no se incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües.

El único dato de rendimiento aportado por el autor es de velocidad, no de calidad: 400-500 tokens/s en una RTX 5090 con la configuración por defecto de 4 expertos activos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los ~8,47 B de parámetros totales; el KV cache para 128k de contexto añade varios GB adicionales no cuantificados en la información disponible): Q4 en torno a 5-6 GB, Q6 en torno a 7 GB, Q8 en torno a 9 GB y BF16 en torno a 17 GB.
- El repositorio completo ocupa 58,9 GB porque incluye varias cuantizaciones; solo es necesario descargar el fichero deseado.
- GPU recomendadas: RTX 5090 es la referencia citada por el autor (400-500 tokens/s); cualquier GPU con 8 GB o más puede ejecutar cuantizaciones Q4/Q5, y con 12-24 GB se pueden usar Q6/Q8 o contextos largos.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB en adelante con cuantizaciones bajas o moderadas; con contextos de 24k-128k conviene subir a 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y vLLM (el autor menciona control de los modos mediante palabras clave estándar en vLLM). No hay datos de soporte en TGI para este repositorio GGUF.
- Ajustes sugeridos por el autor: temperatura 0,2-1,0; top_k 64-80; top_p 0,95; min_p 0,05; repetition penalty 1,0-1,05; sin caché; contexto mínimo de 24k y máximo de 128k para conversaciones multiturno.
- Latencia y throughput: 400-500 tokens/s en RTX 5090 según el autor; no hay mediciones independientes disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (zugquants, GGUF) | 8,47 B | ~1 B (4/32 expertos) | 128k | Apache 2.0 | Añade 12 modos de razonamiento y cuantización MAX/NEO Imatrix; 0 descargas en el momento de la consulta; BETA |
| LiquidAI/LFM2.5-8B-A1B | 8,47 B | ~1 B (4/32 expertos) | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base original, sin el sistema Turbo-Brilliance; referencia para comparar el efecto del prompting inyectado |
| DavidAU/LFM2.5-2.6B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF | 2,6 B (denso) | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada | Misma familia de sistema Turbo-Brilliance en un modelo denso más pequeño; menor capacidad según el propio autor |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos de terceros (Qwen, Gemma, Mistral) en la información proporcionada, por lo que no se incluye una comparación cuantitativa con ellos.

## Limitaciones y advertencias

- Fase BETA declarada por el propio autor: el sistema se presenta como V1.0 y se piden informes de fallos en la pestaña de comunidad.
- El rendimiento depende críticamente de la cuantización elegida: el autor afirma que Q6 rinde más del doble que Q4/IQ4 y que Q8 es 1,5-2 veces mejor que Q6 en los modos de razonamiento complejos. Los resultados con cuantizaciones bajas pueden degradarse de forma notable.
- Es un modelo de 8 B: el autor advierte explícitamente que sigue siendo un 8B y que versiones mayores (9B, 27B) del mismo sistema serán bastante más potentes.
- Los modos de instruct actuales son "un poco más verbosos" que los de modelos con modos dedicados, según la propia model card.
- Riesgo de alucinación: no hay benchmarks publicados que permitan acotarlo; al tratarse de un sistema que inyecta instrucciones en el prompt, un modo mal seleccionado puede empujar al modelo a un formato o enfoque inadecuado.
- El nombre del repositorio incluye "Qwen3.8", pero el modelo base es `LiquidAI/LFM2.5-8B-A1B`; no es un modelo Qwen. Conviene no confundirlo al integrarlo en catálogos o pipelines.
- Procedencia: el repositorio lo publica el usuario `zugquants`, mientras que la model card y los enlaces apuntan a `DavidAU`. Verificar la correspondencia de pesos y la integridad de los ficheros antes de usarlo en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado el 25 de octubre de 2026; no hay validación independiente de la comunidad.
- El sistema Turbo-Brilliance exige ingeniería de prompt (etiquetas y modos) y configuraciones de inferencia concretas; no funciona igual con ajustes por defecto de cualquier herramienta.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado conviene revisar también las condiciones del modelo base y conservar los avisos de atribución.
- Contexto: por debajo de 24k tokens el autor advierte de un funcionamiento subóptimo del sistema; para multiturno recomienda fijar el contexto en 128k, lo que incrementa los requisitos de memoria.
- Idiomas: la cobertura declarada es de 16 idiomas, pero no se aportan métricas por idioma, por lo que el rendimiento real en cada uno de ellos no está verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zugquants/LFM2.5-8B-A1B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Versión densa 2.6B del mismo sistema: https://huggingface.co/DavidAU/LFM2.5-2.6B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF
- Evolución del sistema (Qwen3.8-27B, 15 constructos): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Papers citados en los tags: arxiv:2511.23404 y arxiv:2607.15232 (no se ha podido verificar su contenido en la información proporcionada)
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: únicamente aparecieron noticias sobre rutas de manifestaciones en París, sin relación con el repositorio.
