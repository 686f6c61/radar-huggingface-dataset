# warped-community/Qwen3-0.6B-litert-lm

## Resumen

Qwen3-0.6B-litert-lm es un espejo del modelo Qwen3-0.6B convertido al formato LiteRT-LM (extensión `.litertlm`) para su ejecución en dispositivos móviles y entornos edge. Lo publica la cuenta warped-community, que lo mantiene para la aplicación Android Warped, y no constituye un modelo nuevo ni un ajuste fino: se trata de una recopilación del artefacto `qwen3_0_6b_mixed_int4.litertlm` procedente del repositorio litert-community/Qwen3-0.6B. El repositorio ocupa 0,5 GB y se distribuye bajo licencia Apache-2.0, la misma que el modelo original.

El modelo base, Qwen/Qwen3-0.6B, es un transformer decoder-only denso de aproximadamente 0,6 mil millones de parámetros perteneciente a la familia Qwen3, publicada en 2025. Su rasgo diferencial dentro de la gama es que incorpora modos de razonamiento (thinking) y de respuesta directa (non-thinking) en un tamaño que cabe en un teléfono, algo poco habitual en esa franja de parámetros.

La relevancia de esta ficha concreta es de infraestructura más que de modelado: permite desplegar un LLM de la familia Qwen3 en Android, iOS o web mediante el runtime LiteRT-LM, sin conexión y con los datos permaneciendo en el dispositivo. El interés práctico depende por completo de la calidad de la conversión a int4 mixta y del runtime, no de este repositorio, que es un duplicado sin documentación técnica propia ni evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-0.6B) |
| Parametros totales | 0,6 B (denominación del modelo base; recuento exacto no disponible en el repositorio) |
| Parametros activos | No aplica: el modelo base es denso, no es MoE |
| Longitud de contexto | No declarada en este repositorio. El modelo base Qwen3-0.6B declara 32.768 tokens |
| Tipos de cuantizacion | Int4 mixta (`qwen3_0_6b_mixed_int4`). No se publican otras variantes en este repositorio |
| Idiomas soportados | No disponible en este repositorio. El modelo base declara soporte multilingüe (más de 100 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), pesos empaquetados en int4. No incluye safetensors ni GGUF |

Datos adicionales del repositorio: tamaño 0,5 GB, 0 descargas, 0 likes, creado el 2026-10-03 y actualizado el 2026-10-03 según los metadatos de HuggingFace (fecha anómala respecto a la publicación del modelo base). Librería declarada: `litert-lm`.

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo. Se limita a redistribuir la conversión a LiteRT-LM de Qwen3-0.6B: la arquitectura efectiva es la del modelo base, un transformer decoder-only denso de 0,6 B de parámetros con atención por consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y codificación posicional rotatoria (RoPE). La model card no aporta la configuración de capas, cabezas ni dimensionalidad, por lo que esos detalles se marcan como no disponibles.

Según la documentación pública de la familia Qwen3, el modelo base se preentrenó sobre del orden de decenas de billones de tokens y se sometió a un postentrenamiento en varias fases que incluye ajuste supervisado y optimización por refuerzo, con el objetivo de habilitar un modo de razonamiento explícito y otro de respuesta directa. Toda esa información procede del modelo original, no de esta conversión, y no se ha verificado en el artefacto `.litertlm` publicado.

La única transformación técnica relevante es la cuantización a int4 mixta y el empaquetado en el formato de LiteRT-LM, un runtime orientado a inferencia en CPU, GPU y aceleradores NPU de dispositivos móviles. No se documentan en la model card la receta exacta de cuantización, los grupos de escalas ni si hubo calibración con datos, lo que impide estimar la degradación de calidad introducida.

## Capacidades

Las capacidades listadas derivan del modelo base Qwen3-0.6B; este repositorio no publica ninguna evaluación específica del artefacto int4.

- Generación de texto conversacional en múltiples idiomas, en principio con la cobertura multilingüe de la familia Qwen3.
- Modo de razonamiento (thinking) y modo de respuesta directa (non-thinking), según el modelo base.
- Generación y explicación de código en fragmentos cortos, limitada por el tamaño del modelo.
- Aritmética y problemas matemáticos sencillos, con fiabilidad baja en cadenas de varios pasos.
- Soporte de plantillas de chat compatibles con llamada a herramientas (tool calling) en Qwen3, sujeto a que el runtime LiteRT-LM implemente correctamente el chat template.
- Ejecución totalmente local y sin conexión, con los prompts y las respuestas sin salir del dispositivo.
- Capacidades de agente multi-paso: teóricamente posibles vía tool calling, pero no verificadas en este artefacto ni recomendables en un modelo de 0,6 B.
- No dispone de visión, audio ni entrada multimodal.

## Casos de uso

- Asistentes de texto sin conexión en Android: integrado mediante LiteRT-LM o la API de inferencia de MediaPipe, el modelo puede responder consultas cortas y mantener conversaciones de pocos turnos sin enviar datos a la nube, aprovechando que el artefacto pesa 0,5 GB.
- Procesamiento de texto con privacidad estricta: clasificación de notas, correos o mensajes directamente en el dispositivo, adecuado para aplicaciones sujetas a normativa de protección de datos donde el envío a un servicio externo no es viable.
- Resumen de notificaciones y mensajes: condensar avisos largos en una o dos frases antes de mostrarlos en pantalla, con latencia baja porque la inferencia ocurre en el propio terminal.
- Extracción de entidades y campos estructurados: convertir texto libre (direcciones, importes, fechas) en JSON mediante un prompt de esquema fijo, con la salida validada por código en el lado de la aplicación.
- Traducción de frases cortas en aplicaciones de viaje: sustituir servicios de traducción en línea para pares de idiomas frecuentes, aceptando menor calidad que un modelo grande a cambio de funcionar sin red.
- Autocompletado y reescritura en editores de texto móviles: sugerencias de continuación, corrección de estilo básica o reformulación de frases, con el modelo ejecutándose en segundo plano sobre la GPU del dispositivo.
- Prototipado rápido de funciones de IA en aplicaciones: validar producto y experiencia de usuario con un modelo local antes de decidir si se migra a un modelo mayor o a una API en la nube.
- Automatización de flujos sencillos con herramientas en el dispositivo: encadenar llamadas a funciones locales (calendario, contactos, ficheros) mediante tool calling, siempre con validación externa de los argumentos por la baja fiabilidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye ninguna evaluación del artefacto cuantizado a int4 y la model card se limita a indicar el origen de los ficheros. El modelo base Qwen3-0.6B sí tiene resultados publicados por el equipo de Qwen en su informe técnico, pero no se reproducen aquí porque no se dispone de ellos en la información proporcionada ni se han podido verificar en la búsqueda web realizada.

## Requisitos de hardware

- Pesos: el fichero `.litertlm` ocupa 0,5 GB, con pesos cuantizados a int4. La memoria necesaria para los pesos es de aproximadamente 0,4-0,5 GB.
- Caché KV: es el factor limitante en contextos largos. Con atención por consultas agrupadas y caché en fp16, el coste por token ronda las décimas de megabyte, de modo que agotar los 32.768 tokens del modelo base requiere varios gigabytes adicionales, muy por encima de lo que suele estar disponible en un móvil.
- GPU de consumo: el modelo cabe con holgura en cualquier GPU con más de 1-2 GB de VRAM, incluidas las integradas. Es ejecutable en CPU sin aceleración, con latencia mucho mayor.
- Dispositivos objetivo: teléfonos y tabletas Android e iOS con al menos 2 GB de RAM libre para contextos cortos, además de navegadores y sistemas embebidos compatibles con LiteRT-LM.
- Opciones de despliegue: el formato `.litertlm` solo es utilizable con el runtime LiteRT-LM (Google AI Edge) y las APIs derivadas en Android. No es compatible con vLLM, llama.cpp, Ollama ni TGI; para esos entornos hay que usar el modelo base en safetensors o una conversión a GGUF.
- Latencia y rendimiento: no disponibles. No se publican mediciones de tiempo hasta el primer token ni de tokens por segundo en ningún dispositivo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warped-community/Qwen3-0.6B-litert-lm | 0,6 B | No declarado en el repo (base: 32.768 tokens) | `.litertlm` int4 | Apache-2.0 | 0 descargas, 0 likes |
| litert-community/Qwen3-0.6B | 0,6 B | No declarado en el repo | `.litertlm` int4 | Apache-2.0 | Origen de la conversión de esta ficha |
| Qwen/Qwen3-0.6B | 0,6 B | 32.768 tokens | safetensors | Apache-2.0 | Modelo original, con documentación y evaluaciones |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | safetensors, GGUF | Apache-2.0 | Alternativa de tamaño similar para despliegue en CPU |

Frente a las alternativas, la única diferencia de este repositorio es el empaquetado para móvil: mismo modelo, misma licencia y misma familia que el original, pero sin documentación, sin evaluaciones y sin historial de uso. Para cualquier despliegue que no sea LiteRT-LM, el repositorio de Qwen es la opción correcta.

## Limitaciones y advertencias

- Modelo de 0,6 B de parámetros: la tasa de alucinación es alta y el razonamiento multi-paso es poco fiable. No es adecuado para tareas que requieran exactitud factual sin verificación externa.
- Riesgo de degradación por cuantización: la conversión a int4 mixta puede reducir la calidad respecto al modelo base en fp16 o bf16. No se publican mediciones de esa pérdida.
- Ausencia total de validación: el repositorio tiene 0 descargas y 0 likes, no incluye model card técnica ni resultados de evaluación, y su mantenimiento depende de una única aplicación.
- Contexto efectivo en móvil: aunque el modelo base soporte 32.768 tokens, la memoria del dispositivo limitará en la práctica ventanas mucho menores.
- Idiomas: no se declara la cobertura real de esta conversión. La calidad en idiomas distintos del inglés y del chino suele ser notablemente inferior en modelos de este tamaño.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero conviene comprobar por separado las condiciones del runtime LiteRT-LM y de los componentes de Google AI Edge que se utilicen para ejecutarlo.
- Metadatos inconsistentes: la fecha de creación registrada (2026-10-03) no es coherente con la cronología conocida de la familia Qwen3, lo que sugiere un error de metadatos o una fecha de subida poco fiable.
- Dependencia del proveedor del formato: un fichero `.litertlm` no se puede convertir ni inspeccionar con las herramientas habituales del ecosistema (transformers, llama.cpp), lo que dificulta auditar los pesos o migrar a otro runtime.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; no hay análisis independientes, incidencias documentadas ni comparativas de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/Qwen3-0.6B-litert-lm
- Origen de la conversión: https://huggingface.co/litert-community/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Informe técnico de la familia Qwen3 (referencia del modelo base): https://arxiv.org/abs/2505.09388
- Documentación del runtime LiteRT-LM de Google AI Edge: no se ha encontrado una URL verificada en la búsqueda web realizada.
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) sobre este repositorio en la búsqueda web.
