# ukisai/Swift-Qwen3.8-27B-GGUF

## Resumen

Swift-Qwen3.8-27B-GGUF es la versión cuantizada en formato GGUF del modelo Swift-Qwen3.8-27b, un derivado de Qwen3.8-27B desarrollado por UkisAI que introduce un adaptador orientado a la eficiencia de razonamiento. El modelo base cuenta con 27.320.697.856 parámetros y una pipeline declarada de image-text-to-text, lo que indica capacidades multimodales de entrada. La propuesta central es reducir drásticamente el número de tokens de pensamiento generados sin degradar de forma apreciable la calidad de las respuestas.

Según la model card, el adaptador Swift consigue una reducción del 58,3% en tokens de pensamiento en mediana y mantiene una pérdida de rendimiento inferior al 1% en varios benchmarks, lo que se traduce en una aceleración de hasta 1,95x en tareas concretas. Esta versión GGUF está pensada para inferencia con llama.cpp y entornos compatibles con endpoints, con cuantizaciones generadas mediante imatrix.

El modelo resulta relevante para despliegues de razonamiento en producción donde el coste por token y la latencia son críticos: mantiene puntuaciones cercanas al base en GPQA-Diamond, MMLU-Pro, C-Eval y pruebas de matemáticas, pero con volúmenes de tokens notablemente menores. La licencia es propietaria (swift-open-license-1.0), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones generadas mediante imatrix (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (other) |
| Formato de pesos | GGUF (repo de 509,7 GB con múltiples cuantizaciones); modelo base BF16 en safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado del Qwen3.8-27B, sobre el que UkisAI aplica un adaptador denominado Swift orientado a la eficiencia de razonamiento. La model card no detalla la arquitectura interna más allá de la etiqueta qwen3_8/qwen3_5 y la pipeline image-text-to-text, por lo que se desconoce si emplea atención lineal, decodificación especulativa u otras innovaciones. El pipeline declarado sugiere que el modelo acepta entradas de imagen y texto, aunque no se especifican los detalles del codificador visual.

En cuanto al entrenamiento, la información disponible se limita a los resultados de evaluación: el adaptador se entrena para reducir la longitud de las cadenas de pensamiento manteniendo la precisión. No se indican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación comparativa se realiza entre el base Qwen3.8-27B en BF16 y el mismo base con el adaptador Swift, sin datos adicionales sobre el proceso de alineamiento.

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento eficiente que reduce el número de tokens de razonamiento.
- Razonamiento matemático de competición: evaluado en AIME 2026 y HMMT (noviembre de 2025) con puntuaciones superiores al 94%.
- Razonamiento científico y de conocimiento general: evaluado en GPQA-Diamond, MMLU-Pro y C-Eval.
- Seguimiento de instrucciones: evaluado en IFBench.
- Procesamiento image-text-to-text según la pipeline declarada, aunque no se detallan las capacidades visuales concretas.
- Compatibilidad con llama.cpp y endpoints compatibles, lo que facilita el despliegue en infraestructuras estándar.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible; la evaluación incluye C-Eval (chino), lo que sugiere competencia en ese idioma, pero no se confirma el conjunto de idiomas.

## Casos de uso

- Razonamiento matemático en producción: el modelo mantiene un 94% en AIME 2026 y un 96% en HMMT con una reducción de tokens del 26,7% y 31,1% respectivamente, lo que permite resolver problemas complejos con menor coste por consulta en plataformas educativas o de tutoría automatizada.
- Asistentes de razonamiento científico: con un 88,28% en GPQA-Diamond y una reducción del 41% en tokens medios, es adecuado para herramientas de apoyo a investigación que requieran respuestas fundamentadas sin cadenas de pensamiento excesivamente largas.
- Evaluación de conocimiento general a escala: MMLU-Pro con 84,95% y 1.603 tokens medios (frente a 2.980 del base) lo hace viable para sistemas de QA masivos donde el throughput es determinante.
- Cumplimiento de instrucciones en pipelines de agentes: IFBench con 71,80% y una reducción del 42,2% en tokens medios permite integrar el modelo en flujos de trabajo que encadenan instrucciones complejas con menor latencia.
- Procesamiento de documentos con imagen y texto: la pipeline image-text-to-text habilita tareas de extracción y descripción de contenido visual, aunque la ausencia de detalles sobre el codificador visual exige validación previa.
- Despliegue local con llama.cpp: el formato GGUF y las cuantizaciones con imatrix permiten ejecutar el modelo en estaciones de trabajo sin infraestructura de GPU dedicada de gran escala, útil para prototipado y entornos con requisitos de privacidad.
- Razonamiento en chino: C-Eval con 90,62% y 804 tokens medios (frente a 1.492 del base) lo posiciona para aplicaciones de QA y asistencia en ese idioma con alta eficiencia.

## Benchmarks y rendimiento

Resultados comparativos entre Qwen3.8-27B BF16 base y el mismo base con el adaptador Swift, según la model card:

| Benchmark | Score base | Score Swift | Tokens medios base | Tokens medios Swift | Reduccion media | Reduccion mediana |
|---|---|---|---|---|---|---|
| GPQA-Diamond | 88,38% | 88,28% | 15.014 | 8.855 | 41,0% | 58,3% |
| MMLU-Pro | 85,47% | 84,95% | 2.980 | 1.603 | 46,2% | 28,3% |
| C-Eval | 90,00% | 90,62% | 1.492 | 804 | 46,1% | 19,3% |
| IFBench | 73,53% | 71,80% | 8.052 | 4.657 | 42,2% | 50,5% |
| AIME 2026 | 98,67% | 94,00% | 22.014 | 16.143 | 26,7% | 50,2% |
| HMMT (nov 2025) | 99,33% | 96,00% | 22.032 | 15.189 | 31,1% | 45% (dato truncado en la fuente) |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 27.320 millones de parámetros, una cuantización de 4 bits requiere aproximadamente 14-16 GB de VRAM, una de 8 bits unos 28-30 GB, y BF16 alrededor de 55 GB, como estimaciones orientativas no confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones de 4 bits, mientras que cuantizaciones superiores requerirían A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: probable en cuantizaciones bajas (4 bits) en GPUs con 16-24 GB de VRAM, sujeto a validación práctica.
- Opciones de despliegue: llama.cpp (formato GGUF nativo) y endpoints compatibles según los tags del repositorio; vLLM, TGI u Ollama no se mencionan explícitamente.
- Latencia y throughput: la model card reporta una aceleración de 1,95x en varias tareas derivada de la reducción de tokens de pensamiento, pero no se publican cifras absolutas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Formato |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-GGUF | 27,3B | no disponible | GPQA-Diamond 88,28%; AIME 2026 94,00% | swift-open-license-1.0 (propietaria) | GGUF |
| Qwen3.8-27B (base) | 27,3B | no disponible | GPQA-Diamond 88,38%; AIME 2026 98,67% | no disponible | safetensors BF16 |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Licencia propietaria swift-open-license-1.0: el uso comercial está sujeto a los términos de UkisAI, que deben revisarse antes de cualquier despliegue en producción.
- Pérdida de rendimiento medible: aunque inferior al 1% en varios benchmarks, en AIME 2026 la caída es de 4,67 puntos (98,67% a 94,00%) y en HMMT de 3,33 puntos, lo que puede ser relevante en aplicaciones de matemáticas de alta precisión.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de razonamiento generativo, es esperable, pero no se aportan datos específicos.
- Idiomas soportados no declarados: la evaluación incluye C-Eval (chino) pero no se confirma la cobertura multilingüe ni el rendimiento fuera de inglés y chino.
- Longitud de contexto no disponible: impide evaluar su idoneidad para tareas de contexto largo.
- Detalles de cuantización no especificados: se desconoce qué niveles GGUF están disponibles y su impacto en la calidad.
- Capacidades multimodales poco documentadas: la pipeline image-text-to-text se declara, pero no se detallan el codificador visual ni los benchmarks de visión.
- Sesgos conocidos: no documentados en la información proporcionada.
- Repositorio de gran tamaño (509,7 GB): requiere planificación de almacenamiento y ancho de banda para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Modelo base BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Web de UkisAI: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Licencia y acceso: https://huggingface.co/ukisai/Swift-Qwen3.8-27b#license-and-access
