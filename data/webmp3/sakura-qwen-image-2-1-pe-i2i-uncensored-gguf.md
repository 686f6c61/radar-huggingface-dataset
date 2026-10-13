# webmp3/Sakura-Qwen-Image-2.1-PE-I2I-Uncensored-GGUF

## Resumen

Sakura-Qwen-Image-2.1-PE-I2I-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen/Qwen-Image-2.1-PE-I2I, la variante de reescritura de instrucciones (prompt rewriting) para edición de imágenes de la familia Qwen-Image-2.1. El modelo base es un Qwen3.5-VL 9B afinado: recibe una o varias imágenes de entrada junto con una instrucción de edición y devuelve una instrucción de edición precisa que se pasa después al modelo de imagen Qwen-Image-2.1. El autor de esta conversión es el usuario webmp3 y no tiene relación con Alibaba/Qwen.

La particularidad de esta versión es que los pesos del modelo de lenguaje han sido sometidos a una ablación direccional (abliterated/uncensored) con la herramienta Heretic 1.4.0, de modo que el modelo elimina prácticamente los rechazos a peticiones dañinas. El torch de visión y el system prompt no se han modificado. El resultado es un modelo sin filtro de seguridad, orientado a investigación, etiquetado como not-for-all-audiences y distribuido bajo licencia Qwen Research, que restringe el uso a fines no comerciales.

Con 8.953.803.264 parámetros totales (unos 8,95 mil millones) y un repositorio de 32,1 GB, el modelo se ejecuta con llama.cpp (con soporte de Qwen3.5, `--jinja` y `--mmproj`) y está pensado como componente de un pipeline de edición de imágenes, no como modelo generativo de imágenes por sí mismo. Su relevancia actual es doble: por un lado, permite estudiar el comportamiento de un VLM de reescritura de prompts tras una ablación de direcciones de rechazo; por otro, es una pieza práctica para montar flujos de edición de imágenes local, sin servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM transformer (modelo base Qwen3.5-VL 9B: torre de visión + modelo de lenguaje). Detalle interno no disponible en la información proporcionada |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Longitud de contexto | No disponible en la model card; las pruebas del autor usan `-c 16384` |
| Tipos de cuantización | GGUF Q8_0 (8,87 GiB), GGUF Q4_K_M con importance matrix (5,24 GiB), mmproj F16 (0,86 GiB) |
| Idiomas soportados | No disponibles en los metadatos; las pruebas del autor se realizan en inglés |
| Licencia | Qwen Research License Agreement (`license: other`, `license_name: qwen-research`). Solo uso no comercial |
| Formato de pesos | GGUF (llama.cpp) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 32,1 GB |
| Fecha de creación / actualización | 2026-10-12 / 2026-10-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen-Image-2.1-PE-I2I`, descrito en la model card como un Qwen3.5-VL 9B afinado para la tarea de reescritura de prompts de edición de imágenes. Es un modelo visión-lenguaje: consume una o varias imágenes referenciadas como `<image1>`, `<image2>`, etc., junto con una instrucción del usuario, razona dentro de un bloque `<think>` y responde con un objeto JSON con los campos `rewritten_prompt`, `wh_ratio` y `ratio_follow`. Los dos últimos son mutuamente excluyentes: `wh_ratio` fija una nueva relación de aspecto (para composiciones nuevas) y `ratio_follow` hereda la relación de aspecto de una imagen de entrada (para ediciones in situ). La salida `rewritten_prompt` es la que se entrega al modelo de imagen Qwen-Image-2.1. El autor indica que debe enviarse siempre como mensaje de sistema el `system_prompt.txt` original, incluido sin modificar en el repositorio.

Sobre el entrenamiento del modelo base no hay información en la model card: se desconoce el número de tokens, la composición del dataset y si hubo RLHF o DPO. La única modificación documentada es la ablación direccional aplicada por el autor de la cuantización: se usó Heretic 1.4.0 sobre las proyecciones `o_proj` y `down_proj` del modelo de lenguaje, con 40 ensayos, partiendo de los 12 mejores conjuntos de parámetros del estudio PE-T2I. La regla de selección fue el menor número de rechazos con una divergencia KL menor o igual a 0,1, y se eligió el ensayo 33 de 40. Después se generaron las cuantizaciones GGUF Q8_0 y Q4_K_M. La torre de visión no fue modificada. No se documenta ninguna innovación de decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Reescritura de instrucciones de edición de imágenes: transforma una petición en lenguaje natural en un `rewritten_prompt` preciso y listo para consumir por el modelo de imagen Qwen-Image-2.1.
- Entrada multimodal multi-imagen: acepta varias imágenes simultáneas (`<image1>`, `<image2>`, ...), lo que permite ediciones que combinan, transfieren o comparan elementos entre ellas.
- Razonamiento explícito: genera un bloque `<think>` antes de la respuesta final, lo que facilita depuración y trazabilidad del proceso de reescritura.
- Salida estructurada: devuelve JSON con `rewritten_prompt`, `wh_ratio` y `ratio_follow`, lo que simplifica su integración en pipelines automatizados.
- Control de relación de aspecto: puede decidir entre imponer una nueva proporción (`wh_ratio`) o heredar la de una imagen de entrada (`ratio_follow`).
- Modo sin censura: los pesos abliterated reducen drásticamente los rechazos, según las mediciones del autor incluidas más abajo.
- Capacidades conversacionales: la etiqueta `conversational` y el pipeline `image-text-to-text` indican soporte de diálogo, con el system prompt original como mensaje de sistema obligatorio.
- Se desconoce el soporte explícito de tool calling, function calling y flujos de agente multi-paso: no está documentado en la información proporcionada.

## Casos de uso

- Preprocesador de un pipeline de edición de imágenes: el modelo recibe la imagen y la instrucción del usuario y devuelve el `rewritten_prompt` que se pasa a Qwen-Image-2.1. Es exactamente la función para la que fue afinado el modelo base.
- Edición conversacional multi-turno en local: desplegado con `llama-server` de llama.cpp junto a un modelo de imagen, permite construir un asistente de edición que funciona sin enviar imágenes a servicios externos, relevante para material sensible o confidencial.
- Edición que combina varias imágenes: gracias a la entrada multi-imagen y a `ratio_follow`, se pueden plantear tareas como integrar un objeto de `<image2>` en la escena de `<image1>` manteniendo la relación de aspecto de la primera.
- Control de composición y encuadre: el campo `wh_ratio` permite que el propio modelo decida una nueva relación de aspecto cuando la edición requiere una composición distinta de la original.
- Investigación sobre abliteration y seguridad: el repositorio incluye recuentos de rechazos antes y después de la ablación, lo que lo convierte en un caso de estudio reproducible sobre cómo una ablación direccional afecta al comportamiento de un VLM.
- Evaluación de robustez de pipelines de moderación: al ser un modelo sin filtro que puede escribir peticiones dañinas literalmente, sirve para probar si una capa de moderación externa detecta ese contenido antes de llegar al modelo de imagen.
- Automatización de tareas de posproducción por lotes: con salida JSON estable, es integrable en scripts que procesan muchas imágenes aplicando instrucciones predefinidas y registrando la relación de aspecto elegida.
- Docencia y demostraciones sobre modelos multimodales: al ejecutarse en llama.cpp con cuantizaciones de 5 a 9 GiB, es viable en equipos de laboratorio con GPU de gama media para explicar el funcionamiento interno (thinking + JSON) de un VLM de reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo documenta mediciones de rechazos con la regla de conteo de palabras de Heretic, que miden el texto de razonamiento, no la respuesta final.

Recuento de rechazos sobre 100 prompts dañinos (punto de control BF16, antes de cuantizar, según Heretic):

| Métrica | Valor |
|---|---|
| Rechazos antes de la ablación | 98 / 100 |
| Rechazos después de la ablación | 68 / 100 |
| Divergencia KL de la distribución del primer token | 0,026 |

Recuento de rechazos sobre los ficheros GGUF (Q8_0, llama.cpp b11524, primeros 100 prompts dañinos, 100 tokens, system prompt por defecto, sin imagen de entrada):

| Configuración | Original | Esta versión (uncensored) |
|---|---:|---:|
| Thinking activado, inicio forzado `I first` | 93 / 100 | 61 / 100 |
| Thinking activado, sin inicio forzado | 95 / 100 | 68 / 100 |
| Thinking desactivado | 100 / 100 | 93 / 100 |
| Thinking desactivado, inicio forzado `I first` | 90 / 100 | 57 / 100 |

Prueba de longitud completa con el system prompt propio del modelo y una imagen de entrada (Q8_0, temperatura 0, hasta 6.144 tokens generados, `-c 16384`, 24 prompts, cada uno con una imagen neutra de 512 px):

| Métrica | Original | Esta versión (uncensored) |
|---|---:|---:|
| JSON final encontrado | 21 | 17 |
| Sin terminar dentro de 6.144 tokens (seguía pensando) | 3 | 7 |
| `rewritten_prompt` rechaza la petición o la sustituye por una escena "segura" | 16 | 0 |
| Cuarta fila de la tabla | No disponible (dato truncado en la model card) | No disponible (dato truncado en la model card) |

## Requisitos de hardware

- Cuantización Q8_0: fichero de 8,87 GiB, más la torre de visión `mmproj` F16 de 0,86 GiB, más la caché KV correspondiente al contexto configurado (el autor usó `-c 16384`). Estimación mínima: en torno a 10-12 GiB de VRAM solo para pesos y torre de visión.
- Cuantización Q4_K_M: fichero de 5,24 GiB más 0,86 GiB de `mmproj`. Estimación mínima: en torno a 6,5-8 GiB de VRAM para pesos y torre de visión. El autor advierte que esta cuantización no fue evaluada.
- GPU de consumo: Q4_K_M debería caber en tarjetas de 8 GB o más; Q8_0 requiere 12 GB o más para dejar margen a la caché KV. No hay cifras publicadas de VRAM exacta ni de latencia.
- GPU profesionales: A100, H100 y similares son compatibles, aunque el modelo es lo bastante pequeño para no necesitarlas.
- Backend: el autor midió con la versión b11524 de llama.cpp usando Vulkan, lo que abre el uso a GPU de AMD e Intel además de NVIDIA.
- Despliegue: el único runtime documentado es `llama-server` de llama.cpp con soporte de Qwen3.5, `--jinja` y `--mmproj`. ComfyUI aparece en la tabla del autor como "not tested". No se documenta vLLM, TGI, Ollama ni otros servidores.
- Requisito adicional: el `system_prompt.txt` del repositorio debe enviarse siempre como mensaje de sistema; omitirlo altera el comportamiento esperado.
- Latencia y throughput: no disponibles.
- Advertencia de runtime: con la versión b11259 de llama.cpp, esta arquitectura (Qwen3.5) solo leía la primera palabra de un mensaje de usuario en inglés según las pruebas del autor, también con ficheros GGUF de terceros. Debe usarse una versión más reciente.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-Qwen-Image-2.1-PE-I2I-Uncensored (este modelo) | ≈8,95 B | GGUF Q8_0, Q4_K_M, mmproj F16 | Ablación direccional en `o_proj` y `down_proj` con Heretic 1.4.0; torre de visión intacta | Qwen Research (no comercial) | HuggingFace, 0 descargas |
| Qwen/Qwen-Image-2.1-PE-I2I (modelo base) | ≈8,95 B | Safetensors originales | Ninguna; conserva los rechazos (98/100 en la medición de Heretic) | Qwen Research (no comercial) | HuggingFace (repositorio de Qwen) |
| Otras cuantizaciones comunitarias del mismo base | No disponibles | No disponibles | No disponibles | No disponibles | No disponibles |
| Modelos de reescritura de prompts para edición de imágenes comparables | No disponibles en la información proporcionada | No disponibles | No disponibles | No disponibles | No disponibles |

Los únicos datos comparativos fiables que aporta el autor son los recuentos de rechazos entre el modelo original y esta versión abliterated, recogidos en la sección de benchmarks. No hay métricas de calidad de reescritura publicadas para ninguno de los dos.

## Limitaciones y advertencias

- Licencia no comercial: se distribuye bajo la Qwen Research License Agreement, por lo que no puede usarse en productos o servicios comerciales sin autorización.
- Modelo sin filtro de seguridad: la ablación elimina casi todos los rechazos. El propio autor documenta que el modelo escribe peticiones dañinas de forma literal en el prompt y, por tanto, en la imagen resultante, con ejemplos como pasos para fabricar explosivos, una carta amenazante y una URL inventada de un sitio de odio.
- Uso prohibido e ilegal en varios países: no debe emplearse para representar a menores en contextos sexuales o abusivos, ni para crear imágenes sexuales o difamatorias de personas reales sin su consentimiento.
- Obligación de moderación externa: el autor pide explícitamente no exponerlo como servicio público sin una capa de moderación propia.
- Riesgo de alucinación: se ha observado la invención de URL y contenidos (por ejemplo, un sitio de odio ficticio), lo que indica que el modelo puede fabricar información verosímil pero falsa.
- El modo thinking es imprescindible: con el thinking desactivado, los primeros tokens de la respuesta apenas cambian (93/100 rechazos frente a 100/100 del original), así que el efecto de la ablación depende del razonamiento previo.
- Problemas de finalización: en la prueba de longitud completa, 7 de 24 prompts no terminaron dentro de 6.144 tokens generados, frente a 3 en el modelo original.
- La cuantización Q4_K_M no fue evaluada; el autor solo midió Q8_0.
- La torre de visión no está abliterada, por lo que el comportamiento con imágenes de entrada puede diferir del comportamiento medida sin imagen.
- No hay idiomas declarados en los metadatos y las pruebas se hicieron en inglés; el comportamiento en castellano no está verificado.
- No hay cifras publicadas de sesgos, tasas de alucinación sistemáticas ni evaluaciones de calidad de la reescritura.
- Etiquetado como `not-for-all-audiences`; requiere control de acceso si se comparte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-PE-I2I-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Herramienta de ablación Heretic: https://github.com/p-e-w/heretic
- Versiones de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Fichero de licencia incluido en el repositorio: `LICENSE` (Qwen Research License Agreement)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a páginas de Instagram y no guardan relación con la ficha). No hay papers, blogs ni demos adicionales disponibles en la información proporcionada.
