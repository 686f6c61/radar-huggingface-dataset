# stephenlb/system-one-model

## Resumen

System One Model es un modelo de decisión desarrollado por Stephen Blum (stephenlb) a partir del modelo base google/gemma-4-12B. Su planteamiento rompe con la generación de texto convencional: reutiliza el encoder y el decoder de Gemma 4 12B, pero sustituye la cabeza de lenguaje (asociada a un vocabulario de 262.000 tokens) por una proyección de baja dimensión que emite 26 logits. En cada pasada hacia delante el modelo produce esos 26 logits y responde mediante softmax, sin decodificar ni una sola palabra.

El modelo resuelve un problema concreto: devolver decisiones tipadas y calibradas en lugar de texto libre. Admite tres tipos de pregunta —`noul` (probabilidad de "sí"), `choice` (selección entre hasta 26 opciones) y `score` (nivel esperado sobre una escala ordenada)— y permite formular varias preguntas sobre un mismo texto en una sola llamada. Esto lo orienta a triaje, enrutamiento y clasificación dentro de software, más que a asistentes conversacionales.

Con 11.959.830.064 parámetros reales (unos 12.000 millones) y un repositorio de 24,0 GB, publica 0 descargas y 0 likes en el momento de redactar esta ficha. La longitud de contexto no está documentada en la información disponible. El modelo se enmarca en el ecosistema "System One Models" y su variante Jev, impulsado por TypeSafe AI, y existe un replicador local de código abierto en el repositorio truetype.ai-open.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en google/gemma-4-12B (encoder y decoder), con la cabeza de lenguaje sustituida por una proyección de baja dimensión que emite 26 logits |
| Parametros totales | 11.959.830.064 (aproximadamente 12B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors y se documenta el uso de bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (requiere `custom_code` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura parte de google/gemma-4-12B: se conservan su encoder y su decoder, mientras que la cabeza de lenguaje —ligada a un vocabulario de 262.000 tokens— se reemplaza por una proyección de baja dimensión cuyo resultado son 26 logits. La pasada hacia delante devuelve esos 26 logits y cada pregunta se resuelve con un softmax sobre ellos. El espacio de salida es, por tanto, acotado y discreto, lo que da lugar a los tres tipos de respuesta documentados: `noul`, `choice` y `score`.

El modelo card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se describe ninguna innovación de decodificación (decodificación especulativa, atención lineal u otras). El único elemento diferenciador documentado es la sustitución de la cabeza generativa por una proyección de decisión y el uso de un parámetro `temperature` (por defecto 0,7) para agudizar o suavizar las distribuciones de salida.

## Capacidades

- Clasificación con decisiones tipadas: devuelve respuestas estructuradas de tres tipos distintos en lugar de texto generado.
- Tipo `noul`: probabilidad de que la respuesta sea "sí" ante una pregunta de sí/no, con posibilidad de sobrescribir la formulación mediante un bloque `criteria` (`{"true": "...", "false": "..."}`).
- Tipo `choice`: selección de una opción entre un máximo de 26, con la etiqueta ganadora, la probabilidad de cada opción y un valor de `confidence` (1,0 indica toda la masa en una opción; 0,0, uniformidad).
- Tipo `score`: nivel esperado sobre una lista ordenada de criterios, con `score = sum(i * p_i)`, admisión de entre 2 y 26 niveles y un campo `legend` que asocia cada nivel a su descripción.
- Varias preguntas por llamada: permite plantear múltiples preguntas sobre un mismo texto en una sola invocación y obtener un objeto JSON con todas las respuestas.
- Salidas con probabilidad y confianza: las respuestas incluyen probabilidades por opción, lo que facilita umbrales y lógica de escalado en producción.
- Temperatura configurable (valor por defecto 0,7) para controlar la nitidez de las distribuciones.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de tickets de soporte: con el tipo `choice` se puede enrutar un mensaje al equipo adecuado (facturación, envíos o devoluciones) usando hasta 26 opciones; el ejemplo de la model card etiqueta "My package says delivered but nothing arrived at my door" como `shipping` con probabilidad 0,9977.
- Detección de intención en producto: clasificar mensajes de usuarios en categorías como `bug_report`, `feature_request`, `praise` o `question`, devolviendo la etiqueta ganadora y las probabilidades de cada clase para alimentar un sistema de priorización.
- Análisis de tono y contenido: aplicar preguntas de tipo `noul` para comprobar si un texto es educado, si contiene una queja o si formula una pregunta, con probabilidades como 0,9991 para "polite" o 0,0009 para "complaint" en los ejemplos publicados.
- Puntuación de severidad o urgencia: con el tipo `score`, asignar un nivel esperado en una escala ordenada a partir del texto de un incidente, útil para colas de atención con distintos niveles de servicio.
- Automatización de decisiones dentro de software: el modelo se integra en flujos que necesitan un resultado estructurado (sí/no, etiqueta o nivel) en lugar de texto, según la motivación recogida en el repositorio truetype.ai-open, orientado a ser un modelo de decisión autoalojado.
- Control o simulación en entornos interactivos: la model card incluye una demostración del mundo 1-1 de Super Mario Bros. jugado por el modelo, lo que sugiere su uso en bucles de decisión discretos.
- Moderación y filtrado por reglas: combinar varias preguntas `noul` en una única llamada para evaluar simultáneamente distintos criterios de política sobre un mismo texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos de aproximadamente 12B ocupan unos 24 GB (el repositorio completo pesa 24,0 GB), a lo que hay que sumar la memoria de caché y activaciones.
- GPU recomendadas: no se especifican en la información disponible. Por el tamaño del modelo en bfloat16, encajan tarjetas con 40 GB o más (A100 40 GB, A100 80 GB, H100) o configuraciones multi-GPU.
- Cabe en GPU de consumo: una RTX 4090 de 24 GB queda al límite con los pesos en bfloat16, ya que estos rozan la capacidad total de la tarjeta; se requeriría cuantización, pero el modelo card no documenta formatos cuantizados.
- Opciones de despliegue: `transformers>=5.17` con `trust_remote_code=True` y `device_map="auto"`, o mediante `pipeline("system-one", ...)`. También se documenta un servicio HTTP local (`POST /v1/systemone`) en el replicador truetype.ai-open.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stephenlb/system-one-model | 11.959.830.064 | no disponible | Decisión tipada (26 logits; `noul`, `choice`, `score`) | gemma | HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-12B | aproximadamente 12B | no disponible | Generación de texto autorregresiva | gemma | Modelo base, no disponible el detalle en esta información |
| Clasificadores de texto convencionales | no disponible | no disponible | Etiqueta de clase | no disponible | no disponible |

No se dispone de datos de benchmarks ni de alternativas de decisión tipada comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto: su salida está acotada a 26 logits y a los tres tipos de pregunta documentados, de modo que no sirve como modelo conversacional ni para redacción libre.
- El número máximo de opciones en `choice` es 26 y las escalas de `score` admiten entre 2 y 26 niveles; superar esos límites no está contemplado en la documentación.
- No se documentan sesgos conocidos, comportamiento ante entradas fuera de dominio ni tasas de alucinación; al no generar texto, el riesgo de alucinación se traslada a posibles clasificaciones erróneas con alta confianza.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- La licencia es "gemma": es necesario revisar las condiciones de la licencia Gemma para uso comercial antes de desplegar el modelo en producción.
- El modelo requiere código personalizado y `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor y añade riesgo de seguridad en entornos controlados.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado el 30 de septiembre de 2026 y actualizado el 1 de octubre de 2026: la validación por parte de la comunidad es prácticamente inexistente.
- La model card está incompleta en el fragmento disponible (el ejemplo de `score` aparece cortado) y no detalla datos de entrenamiento, dataset, contexto ni cuantizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stephenlb/system-one-model
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Hub de System One Models: https://systemonemodels.org/
- Repositorio local de la API (truetype.ai-open): https://github.com/stephenlb/truetype.ai-open
- Perfil de GitHub del autor: https://github.com/stephenlb
- Blog de TypeSafe AI sobre System One Models y Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Explicativo sobre el término System One Model: https://www.explainx.ai/blog/what-is-a-system-one-model-ai-explained-2026
