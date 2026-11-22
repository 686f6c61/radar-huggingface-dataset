# VeroLM/NoTokenLM-Gen-5.5

## Resumen

NoTokenLM-Gen-5.5 es un modelo de lenguaje **sin tokenizador** (tokenizer-free) desarrollado por VeroLM que opera directamente sobre bytes UTF-8: no hay vocabulario ni BPE, entran bytes y salen bytes. Para evitar el coste de un forward pass completo por cada byte, el modelo agrupa los bytes en *patches* de longitud variable (unos 6 bytes de media, máximo 16) mediante un criterio de entropía y ejecuta el tronco principal una sola vez por patch. El resultado es un modelo de 168,9 M de parámetros con una ventana de contexto de 4.096 bytes.

Se trata de un **modelo base** (continúa texto, no está ajustado a instrucciones) entrenado con aproximadamente 100.000 millones de bytes de una mezcla con predominio del inglés y presencia de matemáticas, código y francés. Su arquitectura es híbrida: combina capas RWKV-7 con atención con compuertas en un tronco de 20 capas y dimensión 768, más un encoder y un decoder locales de dimensión 256.

La relevancia de este modelo es fundamentalmente arquitectónica: explora una vía alternativa al tokenizador clásico (elimina los problemas de vocabulario, multilingüismo y manipulación de texto asociados al BPE) manteniendo un coste de generación contenido gracias al *patching* por entropía y a la caché de estado del tronco. Es un modelo de investigación y experimentación, no un modelo listo para producción de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder local convolucional + atención ventaneada (d=256), patching por entropía, tronco de 20 capas (d=768) con 5 bloques de [RWKV-7, atención con compuertas sin posición, RWKV-7, RWKV-7], decoder local de 4 bloques ventaneados (d=256) |
| Parametros totales | 168,9 M (incluye tabla de hash-embeddings de 19,9 M y patcher de entropía congelado de 4,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 bytes (ventana de entrenamiento) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés y francés (según la model card; entrenamiento con predominio del inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, pesos EMA) |

## Arquitectura y entrenamiento

El modelo procesa bytes UTF-8 crudos (valores 0-255, donde el byte 0 marca fin de documento). La entrada pasa por un embedding de byte más un embedding *hashed* de n-gramas (órdenes 3 a 8) y características de coincidencia de sufijos ROSA. Un encoder local de dos convoluciones y atención ventaneada (d=256) produce representaciones por byte. A continuación, un patcher basado en entropía —un pequeño modelo convolucional causal congelado que predice el siguiente byte— marca el inicio de un nuevo patch cuando su entropía supera un umbral calibrado (`theta`, en `config.json`); como las fronteras solo dependen de bytes ya vistos, son reproducibles en generación. Un *attention pooling* agrega cada patch en un único vector que entra al tronco.

El tronco tiene 20 capas con d=768 y SwiGLU, organizadas en cinco bloques de [RWKV-7, atención con compuertas con QK-norm y sin codificación posicional, RWKV-7, RWKV-7]; las capas RWKV-7 incorporan *value residual*. Solo los patches cerrados pasan del tronco al decoder local (cuatro bloques de atención ventaneada, d=256), que emite logits de 256 vías para el siguiente byte; esto permite cachear el estado del tronco y avanzarlo un paso por patch. ROSA, un autómata de sufijos en línea, encuentra la coincidencia anterior más larga del sufijo actual y alimenta el byte siguiente predicho y la longitud de coincidencia al encoder, además de aplicar un pequeño refuerzo de logit en la salida (mecanismo de copia). Se añade *DeepEmbed* (escalado por byte de las activaciones de la FFN local). El entrenamiento usó aproximadamente 100.000 millones de bytes con mezcla de texto en inglés, matemáticas, código y francés; no se documenta RLHF ni DPO (es un modelo base).

## Capacidades

- Generación de texto autorregresiva a nivel de byte, sin tokenizador ni vocabulario.
- Continuación de texto en inglés y, en menor medida, francés.
- Manejo nativo de cualquier secuencia de bytes UTF-8, incluyendo texto con formatos atípicos, sin problemas de tokens desconocidos.
- Mecanismo de copia vía ROSA que favorece la reproducción de secuencias previamente vistas en el contexto.
- Generación configurable con `temperature`, `top_k`, `top_p`, muestreo o greedy, `seed` y parada en byte de fin de documento.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio.
- No es un modelo ajustado a instrucciones: no sigue instrucciones de forma fiable ni mantiene rol de asistente.

## Casos de uso

- Investigación sobre modelos sin tokenizador: sirve como banco de pruebas reproducible para estudiar el *patching* por entropía, ROSA y arquitecturas híbridas RWKV-7/atención frente a transformers con BPE.
- Prototipado de continuación de texto en inglés: con 4.096 bytes de contexto puede generar párrafos coherentes a corto plazo en tareas de *autocomplete* o redacción asistida de bajo requisito.
- Experimentos de robustez ante texto arbitrario: al operar sobre bytes, es adecuado para estudiar el comportamiento del modelo con entradas malformadas, codificaciones raras o dominios con vocabulario atípico, sin artefactos de tokenización.
- Evaluación de eficiencia de decodificación: su esquema de caché de estado por patch permite medir coste por byte frente a modelos basados en tokens en entornos de investigación.
- Generación de texto en francés de forma secundaria: útil para comparar el rendimiento relativo inglés/francés en un modelo sin vocabulario compartido.
- Docencia y divulgación: modelo pequeño (168,9 M de parámetros, repo de 0,7 GB) que cabe en memoria de una GPU de consumo y permite ilustrar arquitecturas híbridas y decodificación por bytes en cursos o talleres.
- Base para *fine-tuning* experimental: al ser un modelo base con licencia Apache-2.0, puede ajustarse para tareas concretas de continuación o clasificación a nivel de byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de benchmarks se añadirán próximamente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,7 GB para los pesos (168,9 M de parámetros × 4 bytes), más overhead de activaciones y caché de estado; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de portátil con 4 GB o más de VRAM.
- También puede ejecutarse en CPU para pruebas, dado el reducido tamaño del modelo.
- GPUs de centro de datos (A100, H100) no son necesarias; solo tendrían sentido para experimentos de throughput a gran escala.
- Despliegue: la vía documentada es `transformers` con `trust_remote_code=True` (requiere `torch` y `safetensors`), en float32. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura con código personalizado y sin tokenizador, la integración con esos motores no está disponible de forma estándar.
- Latencia y throughput: no disponibles. El diseño cachea el estado del tronco y lo avanza un paso por patch (unos 6 bytes de media), lo que reduce el coste por byte frente a un forward por byte, pero no se publican cifras medidas.
- Nota: la implementación PyTorch se validó contra el código JAX original con pesos aleatorios (logits coincidentes hasta ≈ 3e-5 y mismo argmax); probado con `transformers` 4.46 y 5.23.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-5.5 | 168,9 M | 4.096 bytes | Byte-level sin tokenizador, híbrido RWKV-7/atención | Apache-2.0 | Hugging Face (custom code) |
| NoTokenLM-Gen-5.5-Preview | No disponible | No disponible | Checkpoint intermedio de preentrenamiento del mismo proyecto | No disponible | Hugging Face |
| Meta MUSE / modelos byte-level tipo MegaByte | No disponible | No disponible | Alternativas byte-level de la literatura | No disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a enfoque arquitectónico y disponibilidad.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no debe usarse como asistente conversacional ni para seguir instrucciones complejas.
- Riesgo elevado de alucinación y de incoherencia a partir de distancias cortas; los ejemplos de la model card muestran derivas factuales claras (por ejemplo, atribuir la Revolución Francesa a Inglaterra).
- Ventana de contexto de solo 4.096 bytes, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística limitada a inglés y francés, con claro predominio del inglés; el rendimiento en francés es secundario.
- Al generar a nivel de byte, puede cortar un carácter multibyte al final de la generación; es necesario decodificar con `errors="replace"`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar dicho código antes de usarlo en entornos sensibles.
- Debe ejecutarse en float32; no se documentan versiones cuantizadas ni soporte en motores de inferencia habituales.
- No hay benchmarks publicados, por lo que no es posible evaluar su calidad frente a alternativas con datos objetivos.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo base sin alineación, cualquier producto derivado debe asumir los riesgos de contenido y factualidad por su cuenta.
- Sesgos conocidos: no documentados por el autor; al entrenarse con una mezcla con predominio del inglés, es esperable un sesgo lingüístico y cultural hacia ese idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5
- Checkpoint intermedio: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5-Preview
- Imagen del modelo: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5/resolve/main/5-5.png
- Cuaderno de pruebas: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5/blob/main/notebook.ipynb
