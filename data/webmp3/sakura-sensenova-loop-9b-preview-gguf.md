# webmp3/Sakura-SenseNova-Loop-9B-Preview-GGUF

## Resumen

Sakura-SenseNova-Loop-9B-Preview-GGUF es una cuantización comunitaria en formato GGUF del modelo SenseNova-Loop-9B-Preview, desarrollado originalmente por SenseNova y convertido por el usuario `webmp3`. El modelo base es un transformer con bucles (looped transformer): las capas 4 a 27 se ejecutan dos veces con pesos compartidos, con enrutamiento residual de dos flujos mHC y atención híbrida (lineal y completa). Cuenta con 8.956.949.376 parámetros totales y un contexto declarado por el autor original de 262.144 tokens.

Este repositorio contiene únicamente el decodificador de texto: la torre de visión y la cabeza de predicción multi-token no se exportaron, por lo que no hay fichero `mmproj` ni soporte de entrada de imágenes. Es relevante para desarrolladores que quieran ejecutar el modelo en local con llama.cpp, siempre que acepten usar un fork parcheado, ya que la arquitectura `sensenova_loop` no está incluida en llama.cpp estándar, Ollama ni LM Studio.

La licencia es Apache-2.0 y el repositorio ocupa 30,1 GB, con cinco cuantizaciones disponibles desde Q2_K hasta Q8_0. No se han publicado resultados de benchmarks ni mediciones de KLD en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), atención híbrida lineal/completa, enrutamiento residual de dos flujos mHC |
| Parametros totales | 8.956.949.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (según el modelo original; no verificado en esta cuantización) |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: las capas 4 a 27 se ejecutan dos veces compartiendo pesos, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. Incorpora enrutamiento residual de dos flujos (mHC) y una combinación de atención lineal y atención completa. El repositorio GGUF exporta solo el decodificador de texto; la torre de visión y la cabeza de predicción multi-token del modelo original no están presentes.

La conversión se realizó con el fork `llama.cpp-sensenova-loop` en el commit `fad174ecd8bf22746a626c58e67e193f095aaa46`, partiendo directamente de los safetensors originales con `--outtype f32`. Las cuantizaciones K se generaron con una matriz de importancia calculada sobre el fichero Q8_0 mediante `llama-imatrix`, usando el texto de calibración `hfqa-original-calibration-v2` (6144 bytes, 11 fragmentos de 128 tokens), que cubre 248 de 322 tensores de peso bidimensionales. Los tensores del enrutador (`mhc_*`) y los kernels de convolución se mantienen en F32 en todos los ficheros. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo de pensamiento explícito: las salidas de prueba incluyen etiquetas `<think>`.
- Razonamiento multi-paso gracias a la arquitectura con bucles y al modo de pensamiento.
- Capacidad de contexto largo declarada por el autor original (262.144 tokens), aunque no verificada en esta cuantización.
- No soporta entrada de imágenes: la torre de visión no se exportó.
- No hay información disponible sobre tool calling, function calling ni capacidades de agente en la documentación proporcionada.

## Casos de uso

- Asistente conversacional local en inglés o chino: el modelo puede mantener diálogos multi-turno con un contexto declarado de hasta 262.144 tokens, adecuado para sesiones largas o documentos extensos, aunque el contexto largo no se ha verificado en esta cuantización.
- Razonamiento con traza explícita: el modo `<think>` permite obtener cadenas de razonamiento auditables, útil en entornos educativos o de depuración de respuestas.
- Despliegue en hardware de consumo: la cuantización Q4_K_M (5,63 GB) permite ejecutar el modelo en GPUs con 8 GB de VRAM, lo que facilita prototipado local sin infraestructura dedicada.
- Procesamiento de documentos en chino e inglés: la combinación de contexto largo y bilingüismo encaja en tareas de resumen o extracción sobre textos extensos.
- Investigación sobre arquitecturas con bucles: el modelo sirve como caso de estudio para evaluar el comportamiento de transformers con pesos compartidos entre capas en tareas de razonamiento.
- Experimentación con cuantización: los cinco niveles disponibles (Q2_K a Q8_0) permiten analizar el compromiso entre tamaño y calidad en una arquitectura no convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se midieron benchmarks, comportamiento en contexto largo, las partes de visión y MTP, backends de GPU ni velocidad. Tampoco se obtuvo la KLD ni la coincidencia de token superior frente a Q8_0, porque el texto de validación era demasiado corto para la herramienta (423 tokens frente a los 512 mínimos para un contexto de 256).

| Metrica | Resultado |
|---|---|
| KLD vs Q8_0 | No obtenida |
| Coincidencia de token superior | No obtenida |
| Benchmarks (MMLU, HumanEval, GSM8K) | No medidos |
| Contexto largo | No medido |
| Velocidad y throughput | No medidos |

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q8_0 ≈ 9,54 GB; Q5_K_M ≈ 6,47 GB; Q4_K_M ≈ 5,63 GB; Q3_K_M ≈ 4,64 GB; Q2_K ≈ 3,84 GB (tamaños de fichero; la VRAM real añadirá overhead del contexto KV).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, Q4_K_M y Q3_K_M caben en GPUs de consumo con 8 GB de VRAM; Q8_0 requiere al menos 12 GB.
- Despliegue: exclusivamente mediante el fork `llama.cpp-sensenova-loop` (commit `fad174ecd8bf22746a626c58e67e193f095aaa46`). No funciona con llama.cpp estándar, Ollama ni LM Studio, que fallan con "unknown model architecture".
- Comando de ejemplo proporcionado: `llama-server -m Sakura-SenseNova-Loop-9B-Preview-Q4_K_M.gguf -c 4096 -fa on --port 8080`.
- Latencia y throughput: no medidos. Los backends de GPU no se probaron según la model card.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con modelos alternativos de tamaño o tarea similar, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Requiere un fork parcheado de llama.cpp: no es compatible con llama.cpp estándar, Ollama ni LM Studio.
- Solo incluye el decodificador de texto: sin torre de visión, sin entrada de imágenes y sin cabeza de predicción multi-token.
- Calidad de las cuantizaciones no verificada: la KLD y la coincidencia de token superior no se midieron, y el texto de calibración es muy corto (6144 bytes), por lo que el autor no reclama ninguna mejora de calidad por la matriz de importancia.
- Contexto largo sin probar: el autor original declara 262.144 tokens, pero en esta cuantización solo se ejecutaron contextos cortos.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el fork de llama.cpp es MIT con adiciones del autor; conviene revisar la atribución del modelo original.
- Cuantización comunitaria no oficial: no es un lanzamiento del autor original, aunque los pesos se verificaron por SHA-256 contra el Hub.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webmp3/Sakura-SenseNova-Loop-9B-Preview-GGUF
- Modelo original: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Fork de llama.cpp: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop
- Commit del fork utilizado: `fad174ecd8bf22746a626c58e67e193f095aaa46`
- Revisión del modelo original: `eda5d06eec244f9bb078fd193255fc615720a1f9`
