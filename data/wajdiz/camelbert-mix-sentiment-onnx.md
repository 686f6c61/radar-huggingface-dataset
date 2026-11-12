# wajdiz/camelbert-mix-sentiment-onnx

## Resumen

`wajdiz/camelbert-mix-sentiment-onnx` es una exportación a ONNX con cuantización INT8 dinámica del modelo `CAMeL-Lab/bert-base-arabic-camelbert-mix-sentiment`, un clasificador de sentimiento en árabe basado en la arquitectura BERT. Lo publica el usuario wajdiz (MARSAD Studio) con el objetivo de ejecutar el modelo en el navegador o en entornos JavaScript mediante Transformers.js, sin necesidad de un backend Python ni de GPU dedicada.

El modelo original pertenece a la familia CAMeL-BERT del CAMeL Lab (Universidad de Nueva York en Abu Dabi), entrenada sobre corpus árabes heterogéneos (mix). La tarea concreta es clasificación de sentimiento de tres clases sobre texto árabe, y el autor reporta un Macro F1 de 0,612 sobre las 3.000 tuits de test de ArSarcasm-v2 medido en esta versión cuantizada.

Su relevancia actual es práctica: ofrece una vía de despliegue ligera (repo de 0,1 GB, pesos INT8) para análisis de opinión en árabe en aplicaciones web, extensiones o entornos edge, manteniendo la licencia Apache 2.0 del modelo base. No aporta arquitectura nueva ni entrenamiento adicional; es una conversión de formato y precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidirectional), base |
| Parametros totales | no disponible (heredados del modelo base CAMeL-BERT base; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT soporta 512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | INT8 dinámica (ONNX) |
| Idiomas soportados | árabe (según tags y modelo base); el autor no publica lista formal |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8), distribuido para Transformers.js |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder BERT de tamaño base (12 capas, atención multi-cabeza bidireccional, embeddings de posición absolutos) adaptado al árabe mediante el corpus CAMeL-BERT mix. Sobre ese backbone se añadió una cabeza de clasificación de secuencias para sentimiento. El autor de esta ficha no aporta detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo ajuste fino con datos de ArSarcasm-v2; esa información corresponde a la model card del modelo base y no se reproduce aquí.

La innovación de esta versión es exclusivamente de despliegue: exportación a ONNX mediante el script `research_tools/convert_to_onnx.py` de MARSAD Studio y cuantización dinámica a 8 bits. La cuantización dinámica aplica INT8 a los pesos de las capas lineales y calcula escalas en tiempo de ejecución para las activaciones, lo que reduce el tamaño del artefacto y acelera la inferencia en CPU sin requerir un dataset de calibración. No hay decodificación especulativa, atención lineal ni técnicas de eficiencia adicionales.

## Capacidades

- Clasificación de sentimiento en texto árabe (típicamente tres clases: positivo, negativo, neutro, según el modelo base).
- Inferencia en navegador y en Node.js vía Transformers.js, sin backend Python.
- Ejecución en CPU con pesos INT8, apta para entornos sin GPU.
- Procesamiento de textos cortos y medios (tuits, reseñas, comentarios), coherente con el dominio de entrenamiento del modelo base.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al árabe; no se declaran otros idiomas.

## Casos de uso

- Moderación y análisis de opinión en redes sociales árabes: clasificar tuits y comentarios en positivo, negativo o neutro dentro de un pipeline de monitorización, aprovechando la ejecución ONNX en CPU para procesar lotes sin coste de GPU.
- Análisis de reseñas de producto en árabe: integrar el clasificador en el backend de una tienda electrónica para etiquetar automáticamente reseñas y alimentar paneles de satisfacción.
- Procesamiento en el navegador: usar Transformers.js para clasificar texto introducido por el usuario sin enviar datos a un servidor, útil en aplicaciones con requisitos de privacidad.
- Enriquecimiento de datasets: etiquetar grandes volúmenes de texto árabe no anotado como paso previo a un ajuste fino supervisado o a un análisis exploratorio.
- Filtrado previo en sistemas de atención al cliente: detectar mensajes con sentimiento negativo para priorizar su escalado a agentes humanos.
- Extensiones y widgets ligeros: desplegar el modelo en una extensión de navegador o en un entorno edge con recursos limitados gracias al tamaño reducido del artefacto INT8 (repo de 0,1 GB).
- Investigación en PLN árabe: disponer de una línea base reproducible en ONNX para comparar con otros clasificadores de sentimiento sin depender de infraestructura Python.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ArSarcasm-v2 (3.000 tuits de test) | Macro F1 | 0,612 |

El dato corresponde a la versión cuantizada INT8, según declara el autor. No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas adicionales (exactitud, precisión, recall por clase).

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU. En GPU, el artefacto INT8 ocupa del orden de decenas de MB, aunque el autor no publica la cifra exacta.
- GPU recomendadas: no disponibles; el caso de uso declarado es Transformers.js en navegador o Node.js, sin GPU.
- Cabe en GPU consumer: sí, con holgura, dado que el repo completo pesa 0,1 GB; cualquier GPU con unos pocos GB de memoria es suficiente.
- Opciones de despliegue: Transformers.js (principal), ONNX Runtime (Web, Node.js o nativo), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| wajdiz/camelbert-mix-sentiment-onnx | no disponible (BERT base) | no disponible | Sentimiento árabe | Apache 2.0 | ONNX INT8 |
| CAMeL-Lab/bert-base-arabic-camelbert-mix-sentiment (modelo base) | no disponible (BERT base) | no disponible | Sentimiento árabe | Apache 2.0 | safetensors/PyTorch |
| Alternativas de sentimiento árabe (p. ej. modelos MARBERT o AraBERT ajustados) | no disponible | no disponible | Sentimiento árabe | variable | variable |

La comparación directa con el modelo base es la más relevante: esta versión mantiene los pesos originales y añade cuantización INT8 y formato ONNX, a cambio de una posible pérdida de precisión no cuantificada frente al modelo en precisión completa. No se dispone de datos de benchmarks de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El Macro F1 de 0,612 sobre ArSarcasm-v2 indica un rendimiento moderado; no es adecuado para decisiones críticas sin revisión humana.
- La cuantización INT8 puede degradar ligeramente la precisión respecto al modelo base en precisión completa; el autor no publica la comparación.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o de dominio distinto al de entrenamiento.
- El modelo está especializado en árabe; no se declaran capacidades en otros idiomas y su uso con texto multilingüe producirá resultados poco fiables.
- El dominio de entrenamiento se centra en texto social (ArSarcasm-v2 son tuits); el rendimiento en textos formales o técnicos puede ser inferior.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y la atribución correspondiente al modelo base.
- No hay garantías de soporte ni mantenimiento por parte del autor; el repo tiene 0 descargas y 0 likes en el momento de la consulta.
- Para producción en navegador, conviene verificar el tamaño real del artefacto ONNX y el tiempo de carga inicial, no publicados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wajdiz/camelbert-mix-sentiment-onnx
- Modelo base: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-mix-sentiment
- Transformers.js: https://github.com/huggingface/transformers.js
- CAMeL Lab: https://camel-lab.com/
- Paper de CAMeL-BERT (referencia del modelo base): no disponible en la información proporcionada
- Repositorio de MARSAD Studio: no disponible en la información proporcionada
