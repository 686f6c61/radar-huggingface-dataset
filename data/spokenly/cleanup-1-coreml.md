# spokenly/cleanup-1-coreml

## Resumen

Spokenly Cleanup 1 es un modelo de lenguaje pequeno especializado en la limpieza de texto dictado. Desarrollado por Spokenly, la empresa detras de la aplicacion de dictado homonima, el modelo transforma transcripciones orales crudas (con muletillas, pausas y falta de puntuacion) en texto escrito bien formado. Por ejemplo, convierte `um so i think we should uh meet on friday at three pm` en `I think we should meet on Friday at 3 pm.`

Esta ficha corresponde a la version Core ML del modelo, `spokenly/cleanup-1-coreml`, una cuantizacion del modelo base `spokenly/cleanup-1` empaquetada como ML Program para ejecutarse en la Neural Engine de los chips Apple Silicon. El modelo base es un fine-tuning mediante LoRA (rank 32, fusionado en los pesos) de Qwen3-0.6B-Base, con 0,6 mil millones de parametros y una ventana de contexto de 4.096 tokens compartida entre prompt y respuesta.

La relevancia de esta variante radica en su orientacion a la inferencia totalmente local y de baja latencia en Mac: con la decodificacion especulativa implementada en el propio grafo Core ML, procesa dictados de una o dos frases en 0,05-0,1 segundos en un M4 Pro, y un texto de 260 palabras en aproximadamente un segundo, con un consumo de memoria de entre 0,6 y 1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B-Base) exportado a Core ML ML Program |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B-Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (prompt y respuesta juntos) |
| Tipos de cuantizacion | Pesos de capas lineales a 8 bits (cuantizacion lineal por canal de salida); tabla de tokens y computo en Float16 (`CleanupNeuralEngine.mlmodelc`); tabla de tokens a 8 bits y computo en Float32 (`CleanupMacOS15.mlmodelc`) |
| Idiomas soportados | en, de, es, fr, zh, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlmodelc` compilado (no safetensors ni GGUF en este repo; existe una version GGUF separada) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-0.6B-Base, afinado con LoRA de rank 32 aplicado a todas las capas y fusionado posteriormente en los pesos. La model card no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset; remite a la pagina principal del modelo base (`spokenly/cleanup-1`) para esa informacion. La tarea de afinamiento es concreta: reescritura de texto dictado con eliminacion de muletillas, correccion de puntuacion y normalizacion de formato.

La exportacion a Core ML constituye la innovacion tecnica mas destacable. El grafo expone funciones por ventana de atencion (`window512`, `window2048`, `window4096` y sus variantes `everyRow*`) que devuelven el siguiente token tras una fila concreta (`answerRow`) y, en el caso de `everyRow*`, tambien el siguiente token tras cada una de las 16 filas de una llamada. Las caches de clave y valor se gestionan como estado del modelo: cada llamada devuelve las filas de cache de sus tokens y el llamador las escribe en el estado. Esto habilita una forma de decodificacion especulativa: una llamada a `everyRow*` puede verificar hasta 15 tokens del prompt como conjeturas, y el llamador conserva las que coinciden hasta la primera discrepancia, garantizando la misma salida que con decodificacion token a token. La decodificacion es greedy.

La model card documenta ademas una correccion numerica relevante: Core ML en macOS 15 y Core ML 26.3 calculan RMSNorm en Float16 tal cual esta escrito, y los cuadrados de las activaciones mayores desbordaban. La exportacion anterior al 26 de octubre de 2026 no producia respuesta en macOS 15 y devolvia `!` en lugar del texto con Core ML 26.3. Desde entonces, `CleanupNeuralEngine.mlmodelc` divide cada fila por su valor absoluto maximo antes del cuadrado, de modo que ningun cuadrado supera 1, manteniendo la misma velocidad en un M4 Pro.

## Capacidades

- Limpieza de texto dictado: elimina muletillas y repeticiones, inserta puntuacion y mayusculas, y normaliza expresiones como horas y fechas.
- Generacion de texto condicionada a una tarea de reescritura, con decodificacion greedy determinista.
- Multilingue: soporta ingles, aleman, espanol, frances, chino, ruso y japones.
- Inferencia totalmente local en Apple Silicon mediante la Neural Engine, sin conexion a red.
- Decodificacion especulativa integrada en el grafo Core ML (verificacion de hasta 15 tokens por llamada) con salida identica a la decodificacion token a token.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio; el modelo es exclusivamente de texto.

## Casos de uso

- Limpieza de dictado en la aplicacion Spokenly: la app activa la opcion "Clean up text with local model" en Ajustes y el modelo reescribe cada dictado en el dispositivo; es su caso de uso principal y esta integrado de fabrica.
- Procesamiento por lotes de transcripciones en un Mac: dado un conjunto de transcripciones de reuniones o notas de voz, el modelo puede normalizar cada una con una latencia de aproximadamente un segundo para textos de 260 palabras, lo que permite procesar decenas de documentos por minuto en un M4 Pro.
- Integracion en herramientas de accesibilidad: un flujo de dictado propio puede invocar el modelo para producir texto final legible antes de insertarlo en cualquier campo de texto del sistema.
- Preprocesado de entradas para pipelines de NLP: limpiar texto oral antes de enviarlo a un modelo mayor de resumen o extraccion de informacion reduce ruido y longitud de prompt.
- Aplicaciones de notas de voz en macOS: transcripcion mas limpieza en local, sin enviar audio ni texto a servidores, adecuado para entornos con requisitos de privacidad.
- Prototipado de funciones de post-procesado de ASR: el par de funciones `everyRow*` y la gestion de cache como estado sirven de referencia para implementar decodificacion especulativa en Core ML con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona mediciones de latencia y velocidad en hardware Apple:

| Medicion | Valor |
|---|---|
| Latencia, dictado de 1-2 frases (M4 Pro, con conjeturas) | 0,05-0,1 s |
| Latencia, 170 palabras (M4 Pro, con conjeturas) | 0,35 s |
| Latencia, 260 palabras (M4 Pro, con conjeturas) | ~1 s |
| Tiempo por llamada, un token por llamada (M4 Pro) | ~10 ms |
| Throughput en CPU sola | ~110 tokens/s |
| Throughput en CPU, macOS 15, ventana de 512 (8 nucleos M4 Pro) | ~40 tokens/s |
| Memoria en carga, textos cortos | ~0,6 GB |
| Memoria en carga, textos mas largos | hasta 1 GB |
| Primera compilacion de una funcion para Neural Engine (M4 Pro) | ~8 s |
| Cargas posteriores (cache de macOS) | ~0,4 s |

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| spokenly/cleanup-1-coreml (esta ficha) | 0,6 B | 4.096 | Core ML | Apache 2.0 | Especifico para Neural Engine en Apple Silicon; decodificacion especulativa en el grafo |
| spokenly/cleanup-1 | 0,6 B | 4.096 | no disponible en esta informacion | Apache 2.0 | Modelo base sin cuantizar; misma tarea y mismos idiomas |
| spokenly/cleanup-1-gguf | 0,6 B | 4.096 | GGUF | Apache 2.0 | Version para Windows y Linux usada por la app Spokenly |
| Qwen3-0.6B-Base | 0,6 B | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | Modelo base del que deriva el fine-tuning; no especializado en limpieza de dictado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para limpieza de texto dictado; no es un asistente general y su calidad fuera de esa tarea no esta documentada.
- La decodificacion es greedy y determinista, sin muestreo; no admite control de temperatura ni de creatividad.
- La ventana de contexto de 4.096 tokens cubre prompt y respuesta conjuntamente, lo que limita la longitud de dictados procesables en una sola pasada.
- La version Core ML esta pensada para Mac con Apple Silicon y macOS 15 o posterior; en macOS 15, `CleanupMacOS15.mlmodelc` se ejecuta en CPU, solo con ventana de 512 tokens y a unos 40 tokens/s, con prestaciones muy inferiores.
- La exportacion anterior al 26 de octubre de 2026 presentaba fallos numericos en RMSNorm (sin respuesta en macOS 15 y salida corrupta con Core ML 26.3); es necesario usar las versiones posteriores a esa fecha.
- Riesgo de alucinacion no cuantificado en la informacion disponible: al ser un modelo generativo de reescritura, puede alterar contenido del dictado original; no se documentan evaluaciones al respecto.
- Sesgos no documentados en la model card.
- Licencia Apache 2.0, que permite uso comercial; no obstante, la model card no detalla condiciones adicionales sobre los datos de entrenamiento.
- El repositorio tiene 4,1 GB y contiene dos variantes compiladas (757 MB y 602 MB) mas el tokenizer.

## Enlaces

- Repositorio HuggingFace (Core ML): https://huggingface.co/spokenly/cleanup-1-coreml
- Modelo base: https://huggingface.co/spokenly/cleanup-1
- Version GGUF: https://huggingface.co/spokenly/cleanup-1-gguf
- Documentacion de Local Model Cleanup: https://spokenly.app/docs/local-model-cleanup
- Aplicacion Spokenly: https://spokenly.app
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
