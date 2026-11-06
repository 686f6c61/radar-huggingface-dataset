# sraivante/health-faq-intent-semantic

## Resumen

health-faq-intent-semantic es un sistema de recuperación semántica de preguntas frecuentes (FAQ) orientado a seguros de salud y productos de jubilación en Estados Unidos: Medicare Advantage, Parte D, Medigap, mercado de la ACA, anualidades e IUL, además de consultas de chat entre agentes y consumidores. Lo publica el usuario sraivante en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo: dado un enunciado de usuario, selecciona una de 2.241 FAQ conocidas y devuelve la respuesta almacenada literalmente, junto con una etiqueta de intención de una sola palabra (`definition`, `eligibility`, `cost`, `coverage`, `navigation`, etc.). Si la confianza es insuficiente, no responde y ofrece las tres preguntas candidatas más cercanas para que la aplicación plantee un "¿quisiste decir...?".

Técnicamente es un pipeline de similitud semántica construido sobre el encoder `sentence-transformers/paraphrase-MiniLM-L3-v2` (revisión `4ca70771`), congelado y sin fine-tuning, en su variante ONNX cuantizada `model_quint8_avx2.onnx`. El encoder produce embeddings de 384 dimensiones con mean pooling y normalización L2, con un límite de 128 tokens de entrada. Sobre esos embeddings se construyen 6 vectores prototipo por clase de FAQ (13.446 en total) y se aplica una regla de aceptación basada en umbral de similitud y margen respecto al segundo mejor resultado.

Su relevancia práctica está en el despliegue: el artefacto completo pesa unos 28 MB (17,5 MB de encoder, 9,4 MB de prototipos, 1,2 MB de banco de respuestas y lookup) y está pensado para ejecutarse solo en CPU con onnxruntime. Eso lo hace apto para entornos con recursos muy limitados, atención al cliente embebida o filtrado previo antes de escalar a un LLM generativo, a costa de una cobertura de respuesta del 78,72% y una tasa de rechazo de fuera de alcance del 71,02%.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de similitud semántica sobre transformer encoder (MiniLM-L3) con prototipos por clase y regla de aceptación por umbral y margen |
| Parámetros totales | No disponible (el encoder base MiniLM-L3 es de tamaño reducido; el autor no publica el recuento) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens de entrada |
| Tipos de cuantización | ONNX quint8 (AVX2), fichero `model_quint8_avx2.onnx` |
| Idiomas soportados | Inglés (`en`); hindi/hinglish no probado |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder) + NumPy `.npz` (prototipos) + JSON comprimido (banco de respuestas y lookup) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo nuevo: reutiliza el encoder `paraphrase-MiniLM-L3-v2` en su versión ONNX cuantizada a quint8 para AVX2, congelado y sin ajuste fino. El preprocesado incluye expansión de abreviaturas del dominio (MA, PDP, IUL, ACA) antes de la codificación. Cada clase de FAQ dispone de 6 vectores prototipo construidos a partir de sus paráfrasis, sumando 13.446 vectores; la puntuación de una consulta es la similitud con el prototipo más cercano de cada clase. La decisión de aceptar una respuesta combina dos condiciones: similitud ≥ 0,725 y margen ≥ 0,03 respecto a la segunda FAQ mejor puntuada. Las preguntas que coinciden exactamente con una pregunta de entrenamiento pasan por un lookup directo, y las ambiguas o con solo pronombres ("Is she eligible?") se rechazan explícitamente.

Los datos de ajuste no se publican; el repositorio contiene únicamente las preguntas y respuestas necesarias para inferencia. El conjunto de ajuste declarado es de 37.391 filas, con 1.101 preguntas de tuning y 1.123 de test, estas últimas con formulaciones retenidas fuera del ajuste y eliminadas del lookup exacto. Las etiquetas de intención se asignan una vez por grupo de FAQ, de modo que todas las paráfrasis de una misma pregunta comparten intención.

## Capacidades

- Clasificación de intención en 15 etiquetas: `greeting`, `definition`, `mechanism`, `process`, `eligibility`, `cost`, `comparison`, `coverage`, `consequence`, `timing`, `recommendation`, `verification`, `navigation`, `account`, `support`.
- Recuperación de respuestas FAQ literales de un banco de 2.241 preguntas, sin generación de texto.
- Mecanismo de abstención con sugerencias "¿quisiste decir...?" mediante las tres preguntas candidatas más cercanas.
- Expansión de abreviaturas específicas del dominio (MA, PDP, IUL, ACA) antes de la codificación.
- Lookup exacto para coincidencias literales con preguntas de entrenamiento.
- Ejecución solo en CPU mediante onnxruntime, sin dependencia de GPU.
- Salida estructurada con campos `matched`, `intent`, `unique_intent`, `faq_id`, `answer`, `matched_question`, `similarity`, `margin`, `exact_question`, `candidates` y `milliseconds`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: no; únicamente inglés.

## Casos de uso

- Atención al cliente de primer nivel en seguros de salud: el sistema resuelve consultas frecuentes sobre Medicare Advantage, Parte D o Medigap devolviendo la respuesta almacenada y aprobada, con abstención cuando la similitud o el margen no alcanzan los umbrales, lo que permite escalar a un agente humano.
- Enrutado y clasificación de tickets: la etiqueta de intención (`cost`, `eligibility`, `coverage`, etc.) permite dirigir cada consulta al equipo o cola correspondiente sin coste de GPU.
- Chat de soporte a agentes (brokers): las consultas sobre comisiones, cuentas o navegación de producto se mapean a FAQ internas y se devuelven con la respuesta operativa almacenada.
- Filtro previo a un LLM generativo: al ejecutarse en CPU con 28 MB de huella, actúa como primera capa que resuelve consultas cubiertas y solo deriva al modelo grande las que quedan fuera de alcance, reduciendo coste por token.
- Despliegue en dispositivos o entornos sin GPU: aplicaciones de escritorio, intranets o contenedores ligeros donde onnxruntime en CPU es la única opción viable.
- Detección de preguntas fuera de alcance: la tasa de rechazo del 71,02% sobre grupos de FAQ no vistos permite usar el sistema como discriminador para identificar consultas que requieren revisión humana o ampliación del banco de respuestas.
- Prototipado rápido de asistentes FAQ en dominios regulados: al no generar texto, todas las respuestas provienen de un banco revisable, lo que simplifica la auditoría de contenido frente a un modelo generativo.

## Benchmarks y rendimiento

| Métrica (test de FAQ conocidas, 1.123 preguntas) | Valor |
|---|---:|
| Selección Top-1 de FAQ | 84,77% |
| Selección Top-3 de FAQ | 92,61% |
| Cobertura de respuestas emitidas | 78,72% |
| Precisión de respuestas aceptadas | 95,14% |
| Rechazo de FAQ fuera de alcance (2.333 preguntas de grupos no vistos) | 71,02% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores miden exclusivamente selección de FAQ, no corrección factual de las respuestas.

## Requisitos de hardware

- VRAM: no requiere GPU; el sistema está diseñado para ejecución solo en CPU.
- Huella en disco y memoria: aproximadamente 28 MB en total (encoder ONNX 17,5 MB, prototipos 9,4 MB, banco de respuestas y lookup 1,2 MB).
- CPU: se beneficia de instrucciones AVX2, ya que el fichero ONNX está cuantizado específicamente para esa extensión.
- GPU recomendadas: no aplica; cualquier GPU sería innecesaria para esta carga.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y dispositivos embebidos con AVX2.
- Opciones de despliegue: onnxruntime con el script `inference.py` incluido (clase `SemanticFAQ`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: el autor expone el campo `milliseconds` por consulta en la salida, pero no publica cifras agregadas de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| health-faq-intent-semantic | Pipeline de similitud sobre encoder MiniLM-L3 | No disponible | 128 tokens | Recuperación FAQ con abstención y prototipos | Apache-2.0 |
| sentence-transformers/paraphrase-MiniLM-L3-v2 | Encoder de frases | No disponible en la información | 128 tokens | Embeddings genéricos de similitud | Apache-2.0 |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de frases | No disponible en la información | 256 tokens (habitual) | Embeddings genéricos de similitud | Apache-2.0 |

La comparación directa con modelos generativos de propósito general no resulta significativa: este sistema no genera texto y su rendimiento se mide en selección de FAQ, no en benchmarks de lenguaje. Frente al encoder base, añade prototipos por clase, expansión de abreviaturas, lookup exacto y una regla de aceptación calibrada, a cambio de quedar restringido a un banco cerrado de 2.241 FAQ del dominio asegurador estadounidense.

## Limitaciones y advertencias

- Preguntas fuera de alcance: aproximadamente el 29% de las preguntas de grupos de FAQ no vistos se aceptaron erróneamente; conviene inspeccionar `similarity` y `margin` antes de mostrar una respuesta.
- FAQ casi duplicadas: varias preguntas dicen lo mismo (por ejemplo, solicitudes de comisiones); la regla de margen puede rechazarlas incluso con similitud alta y derivar a sugerencias en lugar de respuesta.
- Las métricas miden solo selección de FAQ, no corrección factual: las respuestas almacenadas no han sido revisadas por expertos y las normas de seguros cambian cada año y varían por estado; no constituye asesoramiento legal, fiscal ni médico.
- Idioma: solo inglés; hindi y hinglish no se han probado, y algunas formulaciones con familiares y ciertas redacciones sobre anualidades se emparejan incorrectamente.
- Datos de entrenamiento no publicados: el repositorio contiene únicamente lo necesario para inferencia, lo que impide auditar la composición del conjunto de ajuste.
- Dependencia de AVX2 por la cuantización quint8 elegida; en CPUs sin esa extensión el rendimiento puede degradarse o requerir otra variante del encoder.
- Sin generación de texto: no puede responder nada que no esté en el banco de 2.241 FAQ, lo que limita la cobertura al 78,72% en el conjunto de test.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre la exactitud del contenido del dominio recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sraivante/health-faq-intent-semantic
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L3-v2
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- onnxruntime: https://github.com/microsoft/onnxruntime
