# webmp3/Sakura-LFM3-VL-2B-Uncensored-GGUF

## Resumen

Sakura-LFM3-VL-2B-Uncensored-GGUF es una versión modificada del modelo visión-lenguaje LFM3-VL-2B de Liquid AI, publicada por el usuario webmp3 en HuggingFace. La modificación consiste en una edición de los pesos del modelo de lenguaje mediante una técnica de abliteration (eliminación de una dirección de rechazo en parte de las matrices de pesos), orientada a reducir la tasa de respuestas de negativa del modelo ante peticiones que el original rechazaría. El resultado se distribuye en formato GGUF, cuantizado en Q8_0, junto con el proyector visual en F16.

El modelo base, LFM3-VL-2B, es un modelo de 1.9B parámetros (1.728.801.600 parámetros reales según los safetensors) con arquitectura híbrida de capas convolucionales y de atención, capaz de procesar imagen y texto (pipeline image-text-to-text). Soporta 16 idiomas, entre ellos el castellano, y está pensado para tareas de razonamiento multimodal en entornos con recursos limitados.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una variante "uncensored" que elimina parcialmente los mecanismos de rechazo del modelo original, con implicaciones legales y éticas importantes; por otro, sirve como ejemplo de cuantización GGUF de un modelo visión-lenguaje híbrido ejecutable en llama.cpp. El autor reporta que el modelo editado rechaza 1 de 104 prompts dañinos de un conjunto de prueba, frente a 103 de 104 del original, aunque advierte que 100 de esos 104 prompts fueron usados para ajustar el procedimiento de edición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de capas convolucionales y de atención (lfm3), con proyector visual |
| Parametros totales | 1.728.801.600 (1.9B según el autor del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje); F16 (proyector visual) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B emplea una arquitectura híbrida que combina capas convolucionales con capas de atención, un diseño característico de la familia LFM de Liquid AI orientado a reducir el coste computacional frente a transformers puros. Incluye un proyector visual que permite procesar imágenes junto con texto. El modelo razona antes de responder por defecto (modo thinking), comportamiento que puede desactivarse mediante `chat_template_kwargs` con `{"enable_thinking": false}`.

La modificación introducida por webmp3 afecta únicamente a los pesos del modelo de lenguaje: se aplica un método de abliteration que elimina una dirección de rechazo de parte de las matrices de pesos, con ajustes elegidos por el autor. Todos los demás pesos, incluida la totalidad de la parte visual, permanecen sin cambios (el autor afirma haber comparado tensor a tensor con el checkpoint original). La conversión a GGUF se realizó con llama.cpp build b12058, sin importance matrix. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base dentro de la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto (desactivable).
- Procesamiento de imagen y texto (image-text-to-text) mediante proyector visual.
- Descripción de imágenes: el autor verificó la descripción correcta de una imagen neutra (un gato generado).
- Generación de código: se cita un ejemplo de función Python que suma los cuadrados de los números pares de una lista.
- Capacidades multilingües en 16 idiomas, incluidos castellano, inglés, alemán, chino, árabe, francés, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Reducción de rechazos ante peticiones dañinas (objetivo principal de la modificación), con 1 rechazo estricto de 104 prompts en la medición del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponibles; el autor indica que no se midió el comportamiento con vídeo ni con más de una imagen.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteration comparando su comportamiento con el original en conjuntos de prompts dañinos, midiendo tasas de rechazo y divergencia KL, como hace el propio autor.
- Evaluación de cuantización GGUF en modelos visión-lenguaje: sirve para medir la degradación de un modelo híbrido convolución-atención al pasar a Q8_0, con métricas de perplejidad y KL disponibles en la model card.
- Descripción de imágenes en local: con el proyector F16 y llama-server se puede procesar una imagen y generar texto descriptivo en un equipo sin GPU de gama alta, dado el tamaño de 1.72 GiB del modelo cuantizado.
- Generación de código asistida en entornos con recursos limitados: el modelo produce funciones Python coherentes y cabe en memoria de sistemas modestos, aunque no se han publicado benchmarks de calidad de código.
- Experimentación multilingüe: permite probar generación y razonamiento en 16 idiomas, incluido castellano, en un único modelo pequeño.
- Prototipado de asistentes conversacionales multimodales: el formato GGUF y la compatibilidad con llama.cpp facilitan desplegar un servidor local (`llama-server`) para pruebas de concepto con entrada de imagen y texto.
- Estudio de robustez ante prompts adversarios: útil para analizar cómo responde un modelo sin mecanismos de rechazo efectivos, con las cautelas legales correspondientes.

## Benchmarks y rendimiento

El autor no publica benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.). Los únicos datos medidos son sobre rechazos y divergencia respecto al original:

| Modelo (ambos Q8_0) | Rechazos estrictos | Marcadores por palabra clave |
|---|---:|---:|
| Original (LFM3-VL-2B-Q8_0 de Liquid AI) | 103 / 104 | 103 / 104 |
| Este repositorio | 1 / 104 | 27 / 104 |

| Texto | KL media | Mismo token top-1 | Perplejidad (este) | Perplejidad (original) |
|---|---:|---:|---:|---:|
| Mezcla inglesa held-out | 0.0044 ± 0.0001 | 97.2 % | 18.43 | 18.38 |
| Texto web inglés (mixedweb-v1) | 0.0074 ± 0.0001 | 95.5 % | 103.36 | 102.59 |

El autor advierte que 100 de los 104 prompts usados en la medición de rechazos fueron los mismos contra los que se ajustó el procedimiento de edición, por lo que la cifra no refleja el comportamiento ante prompts no vistos. Tampoco se midieron capacidades, rechazos en otros idiomas, conversaciones multi-turno, contexto largo, más de una imagen, vídeo ni velocidad.

## Requisitos de hardware

- VRAM estimada: el modelo de lenguaje Q8_0 ocupa 1.72 GiB y el proyector visual F16 0.35 GiB; en total unos 2.1 GiB de pesos, más overhead de contexto KV (dependiente de la longitud de contexto configurada).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 3-4 GB de VRAM libre (por ejemplo, RTX 3060, RTX 4060, RTX 4090), y también en CPU.
- GPU recomendadas: no se especifican en la información; por tamaño, cualquier GPU moderna con 4 GB o más es suficiente. El ejemplo del autor usa `-ngl 99` para descargar todas las capas en GPU.
- Opciones de despliegue: llama.cpp (build b12058 o posterior que soporte `lfm3` y su proyector visual), `llama-server` con `--mmproj` para imágenes y `--jinja`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no medidos por el autor ("speed" figura explícitamente como no medido).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura-LFM3-VL-2B-Uncensored (este) | 1.9B | no disponible | imagen + texto | LFM v1.0 (uso comercial limitado a <10M USD de ingresos) | Abliterated, GGUF Q8_0, rechazos 1/104 |
| LiquidAI/LFM3-VL-2B (original) | 1.9B | no disponible | imagen + texto | LFM v1.0 | Sin modificar, rechazos 103/104 |
| Otros modelos visión-lenguaje de ~2B | no disponible | no disponible | imagen + texto | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría (visión-lenguaje de ~2B) en la documentación proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La modificación elimina parcialmente los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o sexualmente explícito. El autor lo etiqueta como "not-for-all-audiences" y "for adults only".
- La evaluación de rechazos se hizo sobre prompts en inglés, sin system prompt, con thinking desactivado y temperatura 0; no se midió el comportamiento en otros idiomas, con system prompt, multi-turno ni contexto largo.
- 100 de los 104 prompts de prueba fueron usados para ajustar el procedimiento de edición, por lo que la tasa de rechazo reportada está sobreajustada a ese conjunto y no es representativa de prompts nuevos.
- No se han publicado benchmarks de capacidades; no hay evidencia de que el modelo mantenga la calidad del original en tareas de razonamiento, código o visión más allá de comprobaciones cualitativas puntuales.
- Riesgo de alucinación: inherente a modelos de este tamaño; no cuantificado en la información disponible.
- Licencia LFM Open License v1.0: limita el uso comercial a organizaciones con menos de 10 millones de USD de ingresos anuales (con excepciones detalladas en la licencia); los archivos son versiones modificadas y Liquid AI no participa en ellos.
- El autor no verificó la calidad de las respuestas más allá de leer algunas; una respuesta que no es un rechazo no implica necesariamente que haya cumplido la petición.
- Requiere una build de llama.cpp que conozca la arquitectura `lfm3` y su proyector visual (b12058 o posterior); versiones anteriores no funcionarán.
- El modo thinking está activado por defecto y consume tokens adicionales; debe desactivarse explícitamente si no se desea.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-LFM3-VL-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Conjunto de prompts de evaluación: `mlabonne/harmful_behaviors` (referenciado en la model card; no se proporciona URL directa)
- llama.cpp (build b12058): no se proporciona URL directa en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
