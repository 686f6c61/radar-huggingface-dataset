# ViezeVingertjes/TinyErotica

## Resumen
TinyErotica es un modelo de lenguaje de 7,16 millones de parámetros entrenado desde cero por el usuario ViezeVingertjes para generar relatos cortos de ficción erótica explícita en inglés, de aproximadamente 150 palabras. Su interés técnico no reside en la calidad literaria, sino en la demostración de ingeniería: es lo bastante pequeño para ejecutarse íntegramente en un microcontrolador ESP32-S3 en formato int8, sin conexión a red, a unos 5,7 tokens por segundo.

La arquitectura es un transformer tipo Llama reducido al mínimo (6 capas, 6 cabezas, dimensión oculta 288, FFN de 768 y embeddings atados) con una ventana de contexto de solo 256 tokens, suficiente para contener un relato completo. Emplea un tokenizador BPE byte-level de 4096 tokens entrenado específicamente sobre su propio corpus.

El modelo es relevante como caso de estudio de TinyML aplicado a generación de texto: muestra qué se puede conseguir con un presupuesto de cómputo y memoria de unos pocos megabytes, y documenta con detalle decisiones de muestreo (penalización de repetición exenta para nombres propios, presupuesto de nombres) que afectan a la coherencia en modelos muy pequeños. Su uso está restringido a contenido para adultos y no es apto para productos accesibles a menores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama: 6 capas, 6 cabezas, hidden size 288, FFN 768, embeddings atados |
| Parámetros totales | 7.155.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | int8 (pesos y caché KV); pesos originales en safetensors (probablemente fp32/fp16, no especificado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de transformers); empaquetado int8 propio para el firmware del ESP32-S3 |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only con la configuración de Llama reducida a escala de microcontrolador: 6 capas, 6 cabezas de atención, dimensión de modelo 288, FFN de 768 y embeddings de entrada/salida atados. El tokenizador es un BPE byte-level de 4096 tokens entrenado sobre el propio dataset. El contexto máximo es de 256 tokens, dimensionado para que un relato completo (unas 150 palabras) quepa en una sola ventana.

El entrenamiento se realizó desde cero sobre el dataset `ViezeVingertjes/TinyErotica` (variante `curated`, 257.002 relatos), durante 30.000 pasos con batch de 64 secuencias de 256 tokens (11,3 épocas), optimizador AdamW y schedule coseno, alcanzando una pérdida de validación de 1,076. No se menciona RLHF ni DPO. La model card documenta ajustes de muestreo medidos empíricamente sobre 500 relatos por configuración: temperatura 1.0, top-k 40, top-p 0.95, min-p 0.10 y penalización de repetición 1.08 con exención para 50 nombres de personajes, además de un presupuesto opcional de nombres (máximo 3 nombres, máximo 2 del mismo género) para evitar inconsistencias en escenas grupales.

## Capacidades
- Generación de texto narrativo corto: relatos completos de unas 150 palabras en inglés, iniciados desde el token separador `<|endoftext|>` (id 0) y terminados cuando el modelo vuelve a emitirlo.
- Generación autónoma sin prompt: cada muestra es un relato nuevo; no hay condicionamiento por instrucciones.
- Ficción erótica explícita en 16 categorías, incluyendo temas de fantasía oscura (no consentimiento, relaciones tabú entre adultos), siempre como ficción.
- Coherencia limitada de personajes: mantiene nombres estables gracias a las técnicas de muestreo documentadas, pero confunde roles en escenas de tres personas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Multilingüismo: únicamente inglés.
- Ejecución on-device: empaquetado int8 de 7,3 MB que arranca en 1,5 s en un ESP32-S3.

## Casos de uso
- Demostración de TinyML generativo: ejecutar el modelo en un ESP32-S3 (por ejemplo, una Waveshare ESP32-S3-Touch-AMOLED-2.16) para ilustrar generación de texto completamente offline en un microcontrolador, útil en docencia y divulgación sobre límites del edge AI.
- Investigación sobre modelos de lenguaje minúsculos: estudiar cómo se comportan técnicas de muestreo (min-p, penalización de repetición con exenciones, presupuestos de entidades) en modelos de 7M de parámetros, donde los efectos son mucho más visibles que en modelos grandes.
- Pruebas de cuantización int8 extrema: el empaquetado int8 de pesos y caché KV en 7,3 MB sirve como banco de pruebas para pipelines de cuantización orientados a dispositivos con memoria muy restringida.
- Generación de ficción para adultos en dispositivos aislados: un dispositivo dedicado sin conectividad que produce relatos cortos bajo demanda, sin enviar datos a ningún servidor.
- Benchmark de corpus y tokenizadores pequeños: el tokenizador BPE de 4096 tokens entrenado sobre un corpus especializado permite estudiar el equilibrio entre tamaño de vocabulario y calidad en dominios muy concretos.
- Arte generativo y instalaciones: integración en instalaciones físicas o proyectos de arte electrónico que impriman o muestren relatos generados localmente, donde el contenido explícito se controle mediante la configuración del dispositivo.

## Benchmarks y rendimiento
La model card incluye una evaluación propia comparando 100 relatos por modelo, generados con el runtime C int8 y el sampler de la placa original:

| Métrica | 10k relatos | 110k relatos | 257k relatos (final) |
|---|---:|---:|---:|
| Relatos que terminan solos | 100% | 99% | 100% |
| Palabras (mediana) | 129 | 130 | 146 |
| Relatos marcados por el checker | 5% | 13% | 0% |
| 4-gramas distintos | 0,654 | 0,791 | 0,867 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM para inferencia en precisión original: inferior a 100 MB para los 7,16M de parámetros; cabe en cualquier GPU, CPU o incluso en memoria de sistema de un móvil.
- Empaquetado int8 para dispositivo: 7,3 MB (pesos y caché KV), ejecutable en un ESP32-S3 con arranque en 1,5 s.
- GPU recomendadas: no aplica; cualquier GPU consumer (incluso integradas) es sobredimensionada. El objetivo es microcontrolador.
- Cabe en consumer GPU: sí, en todas; también en Raspberry Pi y en microcontroladores con suficiente PSRAM.
- Opciones de despliegue: `transformers` (PyTorch) para uso en host; runtime C propio en int8 para el ESP32-S3 (firmware no publicado todavía); compatible con text-generation-inference y endpoints según los tags del repo.
- Throughput: aproximadamente 5,7 tokens/s en ESP32-S3 con el sampler de la placa; en host la latencia es despreciable.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia cualitativa de la categoría de modelos minúsculos orientados a dispositivos:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| TinyErotica | 7,16M | 256 | Apache 2.0 | Ficción erótica, on-device (ESP32-S3) |
| TinyStories (referencia citada en tags) | ~1M–33M | variable | MIT/varias | Relatos infantiles sintéticos, investigación |
| Modelos SLM de 100M–500M | 100M–500M | 2k–8k | varias | Texto general en edge, requieren más memoria |

La comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias
- Contenido explícito para adultos: el modelo genera ficción sexual explícita, incluidos temas oscuros (no consentimiento, relaciones tabú). No debe usarse en productos accesibles a menores.
- Calidad limitada por tamaño: con 7M de parámetros los relatos son cortos y formulaicos; en escenas de tres personas confunde quién hace qué.
- Sin prompt ni instrucciones: no acepta condicionamiento; cada generación es un relato nuevo desde el token separador.
- Contexto de 256 tokens: insuficiente para cualquier tarea que requiera contexto largo o conversación multi-turno.
- Solo inglés; sin capacidades multilingües.
- Riesgo de alucinación y de derivar hacia contenido no deseado dentro de las 16 categorías aprendidas; requiere el sampler ajustado (penalización 1.08 con nombres exentos, presupuesto de nombres) para mantener coherencia.
- Licencia Apache 2.0 permite uso comercial, pero las restricciones de contenido para adultos y la ausencia de salvaguardas hacen imprescindible filtrar y restringir el despliegue.
- El firmware para ESP32-S3 no está publicado todavía; la reproducibilidad on-device está limitada a la descripción de la model card.
- Dataset y modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ViezeVingertjes/TinyErotica
- Dataset: https://huggingface.co/datasets/ViezeVingertjes/TinyErotica
