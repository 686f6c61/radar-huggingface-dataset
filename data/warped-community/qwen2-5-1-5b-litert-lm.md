# warped-community/Qwen2.5-1.5B-litert-lm

## Resumen

warped-community/Qwen2.5-1.5B-litert-lm es un espejo (mirror) del modelo Qwen/Qwen2.5-1.5B-Instruct convertido al formato `.litertlm` de LiteRT-LM, el runtime de inferencia en dispositivo de Google AI Edge. Lo publica la comunidad warped-community para uso interno de la aplicación Android Warped, y no introduce ningún entrenamiento ni ajuste propio sobre el modelo original: se limita a redistribuir el artefacto generado por litert-community/Qwen2.5-1.5B-Instruct con el fichero `Qwen2.5-1.5B-Instruct_multi-prefill-seq_q8_ekv4096.litertlm`.

El modelo subyacente es un transformer decoder-only denso de 1,54 mil millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto de 32.768 tokens en su versión original. El artefacto aquí publicado está cuantizado a 8 bits y lleva una caché KV configurada a 4.096 tokens, de modo que el contexto efectivo en dispositivo es considerablemente menor que el del checkpoint base. El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache-2.0, heredada del modelo original.

Su relevancia es práctica y acotada: permite ejecutar un modelo instructivo de tamaño pequeño en teléfonos Android sin conexión y sin enviar datos a la nube, a costa de perder precisión frente al checkpoint en fp16 y de quedar atado al ecosistema LiteRT-LM. Con cero descargas y cero "likes" en el momento de redactar esta ficha, y sin ninguna evaluación propia publicada, debe considerarse una redistribución utilitaria más que un modelo con identidad técnica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), con atención GQA, RoPE, SwiGLU y RMSNorm; empaquetado en formato LiteRT-LM |
| Parámetros totales | 1,54 mil millones (heredados de Qwen/Qwen2.5-1.5B-Instruct) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el artefacto incluido en este repositorio declara una caché KV de 4.096 tokens, según el nombre de fichero `..._q8_ekv4096.litertlm` |
| Tipos de cuantización | El único fichero publicado está cuantizado a 8 bits (sufijo `_q8`); no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible en la ficha del espejo; el modelo base Qwen2.5-1.5B-Instruct declara soporte para más de 29 idiomas |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | `.litertlm` (LiteRT-LM, Google AI Edge) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Origen del artefacto | litert-community/Qwen2.5-1.5B-Instruct, fichero `Qwen2.5-1.5B-Instruct_multi-prefill-seq_q8_ekv4096.litertlm` |
| Tamaño del repositorio | 1,6 GB |
| Autores | warped-community (mantenimiento para la aplicación Warped) |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos de HuggingFace) | 2026-10-03 |

## Arquitectura y entrenamiento

Este repositorio no describe ningún entrenamiento propio. La arquitectura es la del checkpoint Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 28 capas, `hidden_size` de 1.536, 12 cabezas de atención con 2 cabezas KV (GQA), dimensión de cabeza de 128 y capa intermedia de tipo SwiGLU. La familia Qwen2.5 se preentrenó sobre aproximadamente 18 billones de tokens según la documentación publicada por Alibaba, con un pipeline de post-entrenamiento que combina ajuste supervisado y optimización de preferencias para la variante *Instruct*. Estos datos proceden de la documentación del modelo base, no de la ficha del espejo, que no aporta información adicional.

La única transformación aplicada es la conversión al formato `.litertlm` y la cuantización a 8 bits, orientadas a inferencia en dispositivo. El nombre del fichero indica además una caché KV externa de 4.096 posiciones (`ekv4096`) y una estrategia de *multi-prefill* por secuencias, pensada para aprovechar el prefill por lotes en hardware móvil. No se documentan en la ficha innovaciones como decodificación especulativa, atención lineal o modos de razonamiento extendido: no hay *thinking mode*, ya que este no aparece en la familia Qwen2.5. Tampoco se especifica si la cuantización afecta a todas las capas por igual ni qué esquema exacto (por tensor o por canal) se ha empleado.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones en lenguaje natural, en la calidad propia de un modelo de 1,5 mil millones de parámetros.
- Generación y explicación de código sencillo, así como autocompletado y refactorización de fragmentos cortos.
- Resolución de problemas matemáticos de nivel escolar, con fiabilidad decreciente a medida que aumenta el número de pasos.
- Soporte de *function calling* y de salidas estructuradas en JSON en la familia Qwen2.5-Instruct, heredado del modelo base; su fiabilidad en un modelo de este tamaño es limitada y requiere validación del esquema.
- Capacidades multilingües heredadas del modelo base (más de 29 idiomas según Alibaba), aunque el espejo no documenta ni evalúa el reparto por idioma.
- Razonamiento multi-paso y uso como componente de agentes: posible en cadenas cortas, no recomendable para planificación larga sin un orquestador externo.
- Ejecución totalmente local y sin conexión mediante LiteRT-LM, con backends de CPU, GPU y NPU en Android.
- No dispone de visión, audio ni modalidad de razonamiento extendido; es exclusivamente texto.

## Casos de uso

- Asistente conversacional integrado en una aplicación Android sin conexión: el artefacto está pensado exactamente para este escenario (es el motivo declarado del espejo), con un peso de 1,6 GB que cabe en el almacenamiento y la memoria de un móvil de gama media-alta.
- Extracción de datos y clasificación en el dispositivo: el modelo puede devolver JSON estructurado para convertir texto libre en campos tipados (fechas, importes, categorías) sin enviar información sensible a un servidor.
- Anonimización previa al envío a la nube: se puede usar para detectar y sustituir nombres, direcciones o identificadores en textos antes de reenviarlos a un servicio externo, manteniendo los datos personales en el terminal.
- Resumen de notas, correos o notificaciones en local: tareas de resumen corto se ajustan bien a la ventana de 4.096 tokens del artefacto y a la latencia aceptable en CPU móvil.
- Chatbot de soporte embebido con recuperación aumentada sobre documentación local: indexando manuales o FAQ del propio dispositivo y pasando los fragmentos más relevantes como contexto, el modelo puede responder sin conexión.
- Prototipado rápido de agentes con *tool calling* en móvil: invocación de funciones del sistema (calendario, contactos, ajustes) mediante esquemas JSON, adecuado para demos y pruebas de concepto más que para producción crítica.
- Generación y corrección de fragmentos de código en editores móviles o entornos con restricciones de red, donde no es viable llamar a una API externa.
- Apoyo a la accesibilidad y a la lectura fácil: simplificación de frases, reescritura a lenguaje llano y explicación de términos dentro de una aplicación sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM y memoria. El artefacto cuantizado a 8 bits ocupa 1,6 GB en disco, por lo que la inferencia necesita aproximadamente 1,8-2 GB de memoria sumando pesos, caché KV de 4.096 tokens en 8 bits (en torno a 0,06 GB con la configuración de GQA del modelo) y el *overhead* del runtime. Son estimaciones propias, no datos publicados por el autor.
- Modelo base en fp16. Los pesos sin cuantizar rondan los 3,1 GB, con un consumo total de unos 4 GB en contexto corto.
- GPU de escritorio. Cabe con holgura en cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060 12 GB, RX 6600). En tarjetas de centro de datos (A100, H100) funciona, pero está muy por debajo de su capacidad útil.
- GPU de consumo. Sí, cabe en todas las GPU de consumo actuales, incluso en iGPU con memoria compartida si se usa una cuantización de 4 bits del modelo base (en torno a 1 GB de pesos).
- Dispositivos móviles. LiteRT-LM está diseñado para ejecutarse en Android sobre CPU, GPU (OpenCL) o NPU; el modelo de 1,5 mil millones a 8 bits es un tamaño razonable para terminales con 8 GB de RAM o más. No hay cifras publicadas de latencia para este artefacto concreto.
- Opciones de despliegue. El fichero `.litertlm` se ejecuta con LiteRT-LM (Google AI Edge) y su API de inferencia para Android; no es directamente cargable por otros runtimes. Para llama.cpp, Ollama, LM Studio o MLX hay que partir del checkpoint original Qwen2.5-1.5B-Instruct y generar GGUF o MLX por separado. Para servidores con la versión fp16 son adecuados vLLM, TGI o SGLang.
- Latencia y throughput. No disponible: el autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token, ni en CPU ni en GPU móvil.

## Comparativa con modelos similares

La comparación se establece contra alternativas de tamaño y propósito equivalentes en su versión original (fp16), ya que el artefacto de este repositorio está cuantizado a 8 bits y sus resultados no son directamente comparables con los de los checkpoints completos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base de este espejo) | 1,54 mil millones | 32.768 tokens | Apache-2.0 | HuggingFace, GGUF, MLX, LiteRT | Origen del artefacto aquí publicado; multilingüe declarado |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, GGUF, MLX | Contexto mucho mayor, pero licencia con condiciones de uso y restricciones para algunas regiones |
| Gemma-2-2B-it | 2,6 mil millones | 8.192 tokens | Licencia de Gemma | HuggingFace, GGUF, MLX | Más parámetros y buen rendimiento en inglés, contexto más corto y licencia con obligaciones de uso aceptable |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | 8.192 tokens | Apache-2.0 | HuggingFace, GGUF, MLX | Alternativa permisiva de tamaño similar, orientada a inglés y sin variante LiteRT oficial |

No se dispone de datos de benchmarks comparativos en la información proporcionada para respaldar qué modelo rinde mejor en cada tarea.

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste: es una redistribución del artefacto de litert-community. Cualquier mérito o defecto de calidad procede del checkpoint original y del proceso de cuantización, no del autor de este repositorio.
- Adopción nula y sin validación: cero descargas y cero "likes" en el momento de redactar la ficha, sin evaluación publicada, sin métricas de latencia y sin pruebas de regresión conocidas.
- Contexto efectivo reducido: el artefacto declara `ekv4096`, es decir, 4.096 tokens de caché KV, ocho veces menos que los 32.768 tokens del modelo base. Las tareas que dependan de contexto largo degradarán o fallarán directamente en dispositivo.
- Cuantización a 8 bits: implica una pérdida de precisión frente al fp16, perceptible sobre todo en matemáticas, código y salidas estructuradas.
- Alucinación: con 1,5 mil millones de parámetros, el modelo inventa hechos, citas y referencias con facilidad. No debe usarse sin verificación en dominios factuales, legales, médicos o financieros.
- Razonamiento limitado: falla en problemas aritméticos y lógicos de varios pasos y en el encadenamiento de herramientas complejas, por lo que el uso como agente autónomo requiere un orquestador que valide cada paso.
- Idiomas: el espejo no documenta idiomas soportados. Aunque el modelo base declara más de 29 idiomas, el rendimiento fuera de inglés y chino es desigual y no está evaluado.
- Sesgos: no hay ninguna evaluación de sesgos publicada para este artefacto. Los modelos Qwen heredan los sesgos de sus datos de preentrenamiento web y de su alineamiento, orientado a directrices de seguridad propias.
- Formato cerrado al ecosistema: el fichero `.litertlm` solo se ejecuta con LiteRT-LM. No se puede cargar en llama.cpp, vLLM ni Ollama sin volver al checkpoint original y reconvertirlo.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero obliga a conservar avisos de copyright y el fichero NOTICE, y no implica ninguna garantía ni respaldo por parte de Alibaba Qwen ni de Google.
- Mantenimiento de terceros: el repositorio lo mantiene warped-community para una aplicación concreta; no hay compromiso de actualizaciones, corrección de errores ni soporte.
- Sin metadatos verificables de creación real: la fecha de creación del repositorio en HuggingFace es 2026-10-03, dato que conviene tratar solo como referencia administrativa de la plataforma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/Qwen2.5-1.5B-litert-lm
- Artefacto de origen en LiteRT Community: https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentación de LiteRT-LM en Google AI Edge: https://ai.google.dev/edge
- Aplicación Warped (sitio oficial o repositorio): no disponible en la información proporcionada
- Resultados de benchmarks del espejo o del artefacto `.litertlm`: no disponible
