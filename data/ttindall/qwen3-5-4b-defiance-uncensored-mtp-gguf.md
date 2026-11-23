# ttindall/Qwen3.5-4B-Defiance-Uncensored-MTP-GGUF

## Resumen

Qwen3.5-4B Defiance Uncensored (MTP, GGUF) es una cuantización GGUF publicada por el usuario ttindall sobre los pesos del modelo HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive, a su vez derivado de la familia Qwen3.5 de Alibaba. El modelo conserva la arquitectura multimodal de Qwen3.5 (pipeline image-text-to-text) con aproximadamente 4.205 millones de parámetros y una ventana de contexto que, según la model card, alcanza los 262.144 tokens en el modelo base. La aportación principal del autor no son nuevos pesos, sino un parche de plantilla de chat (Defiance v2) que incrusta 40 "constructos" o modos de razonamiento en el GGUF, además de un sidecar MTP (multi-token prediction) que actúa como modelo borrador para decodificación especulativa.

El modelo está pensado para ejecutarse en tarjetas de gama consumer: el autor reporta 5,8 GB de VRAM con Q4_K_M más el proyector de visión y el sidecar, y velocidades de 210,4 a 264,3 tok/s con decodificación especulativa activada. La orientación es claramente hacia roleplay, razonamiento estructurado y agentes conversacionales sin capa de rechazo, lo que lo sitúa en el nicho de modelos "uncensored" para uso local.

Es relevante porque combina tres piezas poco habituales en un 4B: visión funcional (proyector BF16 del autor original), decodificación especulativa mediante un head MTP empaquetado como sidecar independiente, y un sistema de personas conmutables por petición mediante etiquetas en el propio mensaje. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5 con head MTP |
| Parámetros totales | 4.205.751.296 (4,2 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 262.144 tokens en el modelo base; el autor recomienda 32K o más para los modos de persona |
| Tipos de cuantización | GGUF: Q4_K_M, Q6_K (los publicados y probados por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con plantilla Jinja incrustada), proyector mmproj BF16, sidecar MTP Q8_0 |
| Tamaño del repositorio | 7,7 GB |
| Pipeline | image-text-to-text |
| Modelo base | HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive |
| Relación con el base | quantized |

## Arquitectura y entrenamiento

El autor no entrena pesos: la model card indica explícitamente que "HauhauCS's weights remove the refusals. I trained nothing." Los pesos se copian byte a byte del modelo base de HauhauCS, y el autor afirma haber verificado los 426 tensores de cada cuantización contra los ficheros originales. La arquitectura subyacente es la de Qwen3.5-4B, un transformer multimodal con torre de visión y proyector BF16, más un head de predicción multi-token (MTP) que Qwen publica por separado y que los GGUF estándar de Qwen3.5-4B no incluyen.

La innovación técnica del repositorio es doble. Por un lado, un sidecar MTP en Q8_0 que se carga como modelo borrador (`-md`) en llama.cpp y permite decodificación especulativa con `--spec-type draft-mtp`; el autor reporta una tasa de aceptación del 49 % de los borradores y un incremento de 210,4 a 264,3 tok/s. Por otro lado, la plantilla Defiance v2 se construye con un script (`make_defiance_template.py --gguf ... --qwen35`) que aplica trece reemplazos de Defiance v2 más tres específicos de Qwen3.5, y se incrusta en cada GGUF. Los constructos provienen del trabajo Turbo-Brilliance de DavidAU. No hay información sobre composición del dataset de entrenamiento, número de tokens, RLHF ni DPO en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable mediante `--reasoning on --reasoning-format deepseek --reasoning-budget 8192`.
- Visión: procesa imágenes mediante el proyector BF16 incluido (`--mmproj`); el autor reporta 3 de 3 imágenes procesadas correctamente en sus pruebas.
- 40 constructos o modos de razonamiento conmutables por petición: nativos (`medium`, `xhigh`, `low`, `off`, `help`), frameworks (`omni`, `deeptree`, `hyper`, `socrates`, `logic`, `ultra`), variantes xhigh (`xomni`, `xdeeptree`, `xhyper`, `xsocrates`, `xlogic`, `xeinstein`, `xspoon`), paneles multiagente (`einstein` con 20 agentes, `spoon` con 5 expertos, `holodeck`), especialistas (`prompt`, `007`, `musk`, `curie`, `joe`), personajes (`pkd`, `neo`, `stark`, `matlock`, `house`, `vader`, `joker`, `quinn`) y supers (`brainstorm`, `business`, `coder`, `comedy`, `story`, `teacher`).
- Conmutación de modo por petición mediante `"reasoning_effort": "joker"` o insertando `{REASON:joker}` en el mensaje; `{REASON:ijoker}` para la forma instruct sin bloque de pensamiento.
- Compatibilidad con endpoints OpenAI: el servidor llama.cpp expone una API compatible que permite conectar agentes de código; los nombres de esfuerzo de agente se mapean a niveles nativos (`high` y `max` como `xhigh`; `minimal` y `none` como `low`).
- Soporte de tool calling y function calling a través de la API compatible de llama.cpp (implícito en el uso como endpoint para agentes).
- Capacidades de agente y razonamiento multi-paso mediante los modos `coder`, `deeptree` y los paneles multiagente.
- Roleplay y conversación multi-turno con personas persistentes durante la sesión.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay local con personas conmutables: el usuario selecciona un personaje (`joker`, `vader`, `house`) por petición y la plantilla inyecta el system prompt correspondiente de 2.500 a 3.600 tokens; requiere 32K de contexto para que la persona no desplace el historial de conversación.
- Asistente de código en un agente tipo Continue o Cline: apuntando el agente al endpoint OpenAI de llama.cpp y usando el modo `coder` o los niveles nativos, el modelo puede generar y revisar código dentro de un pipeline de CI/CD local sin depender de servicios en la nube.
- Análisis de imágenes en local: con el proyector BF16 cargado, el modelo puede describir capturas, diagramas o documentos escaneados; útil para procesamiento de documentos en entornos con requisitos de privacidad.
- Razonamiento estructurado con paneles multiagente: el modo `einstein` simula 20 agentes y el modo `spoon` cinco expertos, lo que permite generar borradores de análisis con perspectivas múltiples en una sola pasada sobre hardware consumer.
- Tutoría socrática: el modo `socrates` o `teacher` estructura las respuestas como preguntas guiadas, adecuado para prototipos de plataformas educativas que necesitan ejecución local.
- Generación creativa sin filtros: los modos `story`, `comedy` y `brainstorm` permiten escribir ficción o material de guion sin la capa de rechazo del modelo original, en un entorno controlado por el usuario.
- Prototipado de agentes conversacionales con contexto largo: los 262.144 tokens del modelo base permiten mantener conversaciones o documentos extensos en memoria, aunque el autor recomienda 32K para uso práctico con personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de rendimiento de inferencia en su propia tarjeta gráfica (no especificada):

| Métrica | Valor reportado |
|---|---|
| Throughput con sidecar MTP (Q4_K_M) | 264,3 tok/s |
| Throughput sin decodificación especulativa | 210,4 tok/s |
| Tasa de aceptación de borradores MTP | 49 % |
| VRAM ocupada (Q4_K_M + sidecar + proyector, 32K, KV q8_0) | 5,8 GB |
| VRAM adicional con Q6_K | aproximadamente 0,8 GB más |
| Verificaciones funcionales (Q4_K_M) | 12 de 12 |
| Pruebas de visión | 3 de 3 imágenes |

## Requisitos de hardware

- VRAM estimada: 5,8 GB con Q4_K_M, sidecar MTP Q8_0 y proyector BF16 a 32K de contexto con caché KV en q8_0; aproximadamente 6,6 GB con Q6_K.
- Cabe en GPU consumer de gama media-alta con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070 y superiores). El autor no especifica la tarjeta usada en sus mediciones.
- GPU recomendadas: no disponibles de forma explícita; por el consumo de VRAM, cualquier GPU con 8 GB o más es suficiente para Q4_K_M.
- Despliegue: llama.cpp (probado en el commit 2cbe0ec) mediante `llama-server`; el autor menciona compatibilidad con Open WebUI entre las etiquetas del repositorio. No se mencionan vLLM ni TGI (el formato GGUF no es compatible con ellos de forma nativa).
- Latencia y throughput: 264,3 tok/s con decodificación especulativa y 210,4 tok/s sin ella, según el autor.
- El contexto adicional solo consume memoria de caché KV; el modelo base soporta hasta 262.144 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B Defiance Uncensored (este) | 4,2 B | 262.144 (base); 32K recomendado | Sí (proyector BF16) | Apache 2.0 | GGUF + sidecar MTP | 40 modos de persona, decodificación especulativa, sin rechazos |
| HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4,2 B | no disponible | Sí | no disponible | safetensors (base) | Modelo base sin plantilla Defiance ni sidecar MTP |
| ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF | 27 B (aproximado, no confirmado) | no disponible | no disponible | no disponible | GGUF | Versión mayor del mismo autor; requiere más VRAM y ofrece respuestas más profundas según la model card |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo explícitamente sin censura: los pesos de HauhauCS eliminan los rechazos y la plantilla instruye a todos los modos a responder sin advertencias ni moralización. El usuario es responsable del contenido generado y del cumplimiento legal en su jurisdicción.
- Alucinación: al ser un modelo de 4B, el autor advierte que "a 4B model knows less than a 27B" y que las respuestas serán más superficiales que las de la versión de 27B en todos los modos.
- Los modos de persona no añaden conocimiento: solo moldean método y estructura, no aportan información que los pesos no contengan.
- Consumo de contexto: los modos de persona ocupan de 2.500 a 3.600 tokens en cada turno, por lo que se recomienda un mínimo de 32K de contexto; con menos, el historial de conversación se ve desplazado.
- Los modos deben cambiarse iniciando una conversación nueva; una etiqueta `{REASON:x}` persiste durante el resto del chat y prevalece la última introducida.
- El modo por defecto (`medium`) no añade nada en Qwen3.5, ya que este modelo no tiene niveles de esfuerzo nativos como el 27B; `xhigh` y `low` añaden solo una frase cada uno.
- El sidecar MTP es opcional: sin él se pierde la aceleración, pero no funcionalidad.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá de lo que herede el modelo base.
- Sin datos publicados de sesgos, benchmarks de seguridad ni evaluaciones independientes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttindall/Qwen3.5-4B-Defiance-Uncensored-MTP-GGUF
- Modelo base (pesos sin censura): https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Sidecar MTP: https://huggingface.co/ttindall/Qwen3.5-4B-MTP-Sidecar-GGUF
- Versión de 27B del mismo autor: https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF
- Constructos originales (Turbo-Brilliance de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
