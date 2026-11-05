# ukrbublik/opus-mt-tc-big-en-zle-int8-shift-att

## Resumen
`ukrbublik/opus-mt-tc-big-en-zle-int8-shift-att` es una exportación derivada del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-en-zle`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. No se trata de un modelo entrenado desde cero, sino de una conversión de runtime: el autor (ukrbublik) ha exportado los pesos originales a ONNX (opset 17), los ha cuantizado a INT8 con ONNX Runtime y ha expuesto una capa de atención cruzada del decodificador para permitir un pase experimental de alineación de palabras denominado Shift-Att.

El modelo resuelve traducción automática desde inglés hacia ruso y ucraniano. La relevancia de esta variante no está en la calidad de traducción —que hereda íntegramente del modelo base— sino en el formato de despliegue: grafos ONNX pequeños, pesos externos separados, tokenizadores SentencePiece incluidos y una salida de alineación a nivel de token que facilita tareas de subtitulado, memorias de traducción o resaltado bilingüe. El repositorio ocupa 0,4 GB y separa los grafos (518.532 bytes) de los pesos externos (368.455.709 bytes).

La información pública disponible es limitada: el modelo tiene 0 descargas y 0 likes, no se han publicado benchmarks de calidad y la model card solo documenta paridad de conversión, no evaluación independiente. Cualquier uso en producción debe partir de esa premisa: es un artefacto de despliegue, no una validación de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (OPUS-MT tc-big), exportado a ONNX opset 17 |
| Parámetros totales | no disponible (pesos externos: 368.455.709 bytes en INT8) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base es de tipo oración; `runtime.json` define longitud máxima de salida) |
| Tipos de cuantización | INT8 dinámica (QInt8, sin cuantización por canal) |
| Idiomas soportados | en (origen), ru y uk (destino) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`.onnx` + `.weights` externos), tokenizadores SentencePiece |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo `Helsinki-NLP/opus-mt-tc-big-en-zle`, un transformer encoder-decoder de traducción neuronal entrenado por el proyecto OPUS-MT sobre corpus paralelos multilingües. Esta variante no introduce entrenamiento nuevo: el autor documenta explícitamente que es una conversión y no un modelo reentrenado, y que no ha habido recuantización tras el movimiento de tensores a ficheros externos.

Los cambios técnicos respecto al original son cuatro. Primero, exportación de atención eager en PyTorch a ONNX opset 17 con decodificador greedy y sin caché KV. Segundo, cuantización dinámica INT8 mediante ONNX Runtime. Tercero, exposición de la atención cruzada de la tercera capa del decodificador para un pase experimental de alineación Shift-Att con umbral 0,1. Cuarto, separación de tensores inicializadores en ficheros `.weights` externos, verificando dtype, forma y bytes de cada tensor, así como nodos, entradas y salidas del grafo, contra la exportación monolítica de referencia. El autor reporta paridad entre la exportación dividida y la monolítica en 192 casos (96 selecciones en inglés para ruso y 96 para ucraniano), lo que constituye una prueba de equivalencia de conversión, no de calidad de traducción. Ruso y ucraniano comparten pesos; el idioma de destino se selecciona con el prefijo `>>rus<<` o `>>ukr<<` a nivel de token de origen.

## Capacidades
- Traducción automática de inglés a ruso y de inglés a ucraniano con un único conjunto de pesos.
- Selección de idioma de destino mediante prefijos especiales (`>>rus<<`, `>>ukr<<`) en el texto de entrada.
- Alineación de palabras experimental a partir de la atención cruzada de la tercera capa del decodificador (Shift-Att, umbral 0,1).
- Decodificación greedy sin caché KV, adecuada para inferencia por lotes de frases cortas.
- Ejecución en ONNX Runtime con cuantización INT8, lo que reduce el coste de memoria y permite despliegue en CPU.
- Carga diferida de pesos: los grafos pequeños pueden empaquetarse en la aplicación y descargar los pesos bajo demanda.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso
- Subtitulado y traducción de vídeo: la salida de alineación por token permite sincronizar segmentos traducidos con los originales, útil para generar subtítulos bilingües o resaltar correspondencias palabra a palabra en herramientas de edición.
- Memorias de traducción y glosarios interactivos: al exponer enlaces de alineación, un editor puede resaltar qué palabra inglesa corresponde a qué palabra rusa o ucraniana, facilitando la revisión humana de traducciones asistidas.
- Traducción por lotes en servidores sin GPU: la cuantización INT8 y el formato ONNX permiten ejecutar el modelo en CPU con ONNX Runtime, adecuado para pipelines nocturnos de traducción de documentación o correos.
- Aplicaciones de escritorio o móviles con pesos bajo demanda: el diseño de grafos pequeños (518.532 bytes) más pesos externos (368 MB) permite distribuir la aplicación sin empaquetar el modelo completo y descargarlo en el primer uso.
- Preprocesado multilingüe para NLP: traducir corpus en inglés a ruso o ucraniano antes de aplicar análisis de sentimiento, extracción de entidades o indexación de búsqueda en esos idiomas.
- Traducción de documentación técnica interna: para equipos que mantienen manuales en inglés y necesitan versiones en ruso y ucraniano con revisión humana posterior, el modelo sirve como primera pasada económica.
- Investigación en alineación de palabras: el pase Shift-Att permite experimentar con extracción de correspondencias léxicas sin entrenar un modelo propio, comparando la salida de atención con herramientas estadísticas clásicas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta pruebas de paridad de conversión (traducciones libres y enlaces de alineación idénticos entre la exportación dividida y la monolítica en 192 casos), que no constituyen una evaluación de calidad de traducción ni de latencia. No se deben inferir cifras de BLEU, COMET ni throughput a partir de esos datos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con pesos INT8 de 368 MB, la huella en memoria es inferior a 1 GB en la práctica, aunque no se han publicado mediciones.
- GPU recomendadas: no disponible; el formato ONNX Runtime con INT8 está pensado para ejecución en CPU, y cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o A100/H100) podría ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de los pesos, aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: ONNX Runtime (principal), con carga de `encoder.onnx` junto a `encoder.weights` y `decoder.onnx` junto a `decoder.weights`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput estimados: no disponible. El autor advierte explícitamente que las pruebas de conversión no constituyen una afirmación de latencia universal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-tc-big-en-zle-int8-shift-att | no disponible (368 MB en INT8) | no disponible | en→ru, en→uk | CC BY 4.0 | ONNX INT8 | Alineación experimental, sin benchmarks publicados |
| Helsinki-NLP/opus-mt-tc-big-en-zle | no disponible | no disponible | en→ru, en→uk | CC BY 4.0 | PyTorch (safetensors/bin) | Modelo base original, sin cuantizar ni alineación |
| Helsinki-NLP/opus-mt-en-ru | no disponible | no disponible | en→ru | CC BY 4.0 | PyTorch | Modelo OPUS-MT más pequeño, solo ruso |
| Helsinki-NLP/opus-mt-en-uk | no disponible | no disponible | en→uk | CC BY 4.0 | PyTorch | Modelo OPUS-MT más pequeño, solo ucraniano |

La comparación con alternativas de la misma categoría (modelos de traducción dedicados en→ru/en→uk) es limitada porque no hay datos de benchmarks ni de parámetros publicados para ninguno de ellos en la información disponible. La ventaja diferencial de esta variante es el formato ONNX INT8 con pesos externos y la salida de alineación; la desventaja es la ausencia de evaluación de calidad independiente y su nula adopción (0 descargas).

## Limitaciones y advertencias
- Es una conversión, no un modelo nuevo: la calidad de traducción es la del modelo base y no ha sido evaluada de forma independiente en esta variante.
- La alineación de palabras es experimental: los rangos basados en atención pueden incluir palabras de más u omitir partes de frases, y no corrigen errores semánticos de traducción.
- Riesgo de mistraducción de modismos y negaciones, documentado explícitamente por el autor.
- El decodificador es greedy y sin caché KV, lo que puede penalizar el throughput en secuencias largas frente a implementaciones con caché.
- La cuantización INT8 dinámica sin cuantización por canal puede degradar ligeramente la calidad respecto al modelo en punto flotante; no se han publicado métricas de esa degradación.
- Sesgos conocidos: no documentados en la información disponible; al heredar los datos de OPUS, es previsible que arrastre los sesgos de los corpus paralelos, pero no hay análisis publicado.
- Limitaciones de contexto e idioma: solo traduce desde inglés hacia ruso y ucraniano; no soporta otras direcciones ni otros pares de idiomas.
- Licencia CC BY 4.0: permite uso comercial con atribución y obligación de identificar modificaciones al redistribuir; hay que preservar el crédito a los autores de Helsinki-NLP/OPUS-MT.
- Para inferencia es imprescindible descargar los ficheros `.weights` junto a los `.onnx`; descargar solo el grafo no es suficiente.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ukrbublik/opus-mt-tc-big-en-zle-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-zle
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Proyecto OPUS-MT (Helsinki-NLP): no disponible en la información proporcionada
- Paper o blog del autor sobre Shift-Att: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
