# SZLHOLDINGS/szl-triage-linear-development-v1

## Resumen
szl-triage-linear-development-v1 es un clasificador softmax de seis clases implementado en Python y publicado por SZL Holdings dentro del estudio "SZL CPU triage development study". No es un modelo de lenguaje ni un checkpoint de Transformers: es un clasificador lineal propio que opera sobre 744 características calculadas exclusivamente en entrenamiento (train-only) y cuyos pesos se distribuyen en un formato JSON personalizado. La tarea es de clasificación de texto en inglés (pipeline text-classification) sobre seis etiquetas, con fines de investigación reproducible.

El propio autor lo marca como NOT_PROMOTABLE: no admite admisión en producción ni integración en runtime. El estudio se entrenó con semilla fija 11 sobre 527 filas etiquetadas por el motor, excluyendo 101 filas retenidas, y declara resultados que quedan por debajo de los criterios de cualificación originales (8/42 de exactitud conjunta de etiqueta y estado en un desafío de desarrollo de 42 filas). Su interés actual es metodológico —procedencia verificable, contratos de evidencia tipada y controles negativos—, no de rendimiento.

No hay datos de arquitectura profunda, contexto, cuantización ni despliegue en servidores de inferencia: se ejecuta en CPU con la biblioteca estándar de Python y se reproduce de forma exacta únicamente en el entorno registrado Windows Python 3.11.9.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador softmax lineal multinomial de seis clases sobre 744 características; implementación propia en Python, no transformer ni red profunda |
| Parámetros totales | no disponible (no declarado; 744 características de entrada y seis clases de salida) |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (clasificador sobre características agregadas; no gestiona ventanas de tokens) |
| Tipos de cuantización | no disponible / no aplica (pesos distribuidos en JSON sin cuantización declarada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | JSON propio (custom JSON weight format); no safetensors ni GGUF |
| Tarea declarada | text-classification |
| Número de clases | seis |
| Características de entrada | 744, calculadas solo en entrenamiento |
| Conjunto de entrenamiento | 527 filas etiquetadas por el motor; 101 filas retenidas |
| Semilla de entrenamiento | 11 (fija) |
| Dependencias de ejecución | solo biblioteca estándar de Python |
| Hardware objetivo | CPU |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación declarada | 2026-09-30 |

## Arquitectura y entrenamiento
La arquitectura es un clasificador softmax lineal (regresión logística multinomial) de seis clases sobre un vector de 744 características calculadas únicamente con datos de entrenamiento. No emplea atención, capas recurrentes ni estado, por lo que no existe ventana de contexto en el sentido habitual: la decisión se toma sobre el vector de características agregado. Por aritmética de una capa densa, un clasificador de este tipo tendría 4.470 pesos más 6 sesgos, pero el autor no declara el recuento de parámetros y ese cálculo no debe tomarse como dato verificado. Los pesos se serializan en un formato JSON propio, no compatible con el ecosistema Transformers ni con herramientas de cuantización como GGUF.

El entrenamiento usó semilla fija 11 sobre 527 filas etiquetadas por el motor, reservando 101 filas. No se documenta RLHF, DPO ni ajuste por preferencias, algo que no aplica a un clasificador de este tipo. La innovación declarada está en el aparato de reproducibilidad y gobernanza: procedencia anclada a blobs inmutables de Git con hashes listados en SOURCE_BINDING.json, un control negativo que responde siempre REVIEW, contratos de salida tipada y de evidencia literal, y umbrales sellados. La reproducción byte a byte de los pesos solo está establecida en el entorno registrado Windows Python 3.11.9; las diferencias numéricas en Linux se reportan por separado y el replay falla y conserva un recibo de diagnóstico ante cualquier discrepancia exacta. El único conjunto de datos transformado históricamente tiene identidades declaradas distintas para los bytes LF de Git y los bytes CRLF de entrenamiento.

## Capacidades
- Clasificación de texto en inglés en seis clases mediante softmax lineal sobre 744 características.
- Salida tipada y contrato de evidencia literal: superado en 42/42 casos según la model card.
- Reproducción determinista del estudio con semilla fija 11 y verificación de hashes sobre blobs inmutables de Git.
- Control negativo integrado (respuesta siempre REVIEW) para comparar contra la línea base en evaluaciones.
- Ejecución en CPU con dependencias limitadas a la biblioteca estándar de Python.
- No soporta generación de texto, razonamiento multi-paso, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento encadenado.
- No dispone de modo de pensamiento (thinking mode).
- Capacidad multilingüe: no; solo inglés.
- Capacidad de rechazo de ataques limitada: 3/12 en el desafío de desarrollo declarado.

## Casos de uso
Todos los casos siguientes son de investigación, evaluación o auditoría. El autor prohíbe explícitamente la admisión en producción y la integración en runtime, por lo que ningún escenario productivo es admisible con este artefacto.

- Reproducción de estudios: el paquete se instala con `python -m pip install -e .` desde la carpeta de distribución y se replays con `python -m experiments.cpu_softmax.reproduce --output-dir ../cpu-study-replay-new`, lo que permite comprobar la reproducibilidad exacta de los pesos en el entorno registrado y detectar derivas numéricas en otros sistemas operativos.
- Control negativo en pipelines de evaluación: el clasificador siempre-REVIEW obtiene 12/42 en exactitud global y 0/30 en exactitud positiva, de modo que sirve como cota inferior contra la que medir si un sistema de triaje aporta señal real.
- Estudio de calibración: con un ECE de 0.4405903, es un caso práctico para analizar cómo un clasificador puede acertar poco y además estar mal calibrado, y para probar técnicas de recalibración antes de desplegar cualquier modelo de triaje.
- Auditoría de contratos de evidencia: los contratos de salida tipada y evidencia literal pasan 42/42, lo que lo convierte en un ejemplo útil para diseñar validadores de formato y verificadores de citas en sistemas de decisión automatizada.
- Docencia y metodología de fuga de datos: el uso de 744 características calculadas solo en entrenamiento es un caso didáctico sobre dependencia de léxico, dado que la exactitud sin léxico cae a 5/30 y la exactitud en léxico no está disponible.
- Auditoría de artefactos no cualificados: la ficha y el manifiesto (STUDY_MANIFEST.json, NEXT_PROGRAM.json) sirven como plantilla de documentación para publicar artefactos de investigación que no deben promocionarse a producción.
- Prototipado local sin GPU: al ejecutarse solo en CPU y con la biblioteca estándar, permite montar laboratorios de triaje reproducibles en portátiles o máquinas sin acelerador, siempre con fines de estudio.

## Benchmarks y rendimiento
Los únicos resultados disponibles proceden de la model card del autor y no se han verificado de forma independiente. No se han publicado métricas tipo MMLU, HumanEval o GSM8K, que no aplican a un clasificador de seis clases.

| Métrica | Resultado | Notas |
|---|---|---|
| Exactitud conjunta de etiqueta y estado (desafío de desarrollo de 42 filas) | 8/42 | Desafío previamente expuesto |
| Exactitud sin léxico | 5/30 | Indica dependencia del léxico |
| Rechazo de ataques | 3/12 | Capacidad de rechazo limitada |
| ECE (error de calibración esperado) | 0.4405903 | Calibración pobre |
| Contratos de salida tipada y evidencia literal | 42/42 | Superados |
| Exactitud en léxico | UNAVAILABLE (no disponible) | No medida |
| Control negativo siempre-REVIEW, exactitud global | 12/42 | Supera al modelo en exactitud global |
| Control negativo siempre-REVIEW, exactitud positiva | 0/30 | Sin verdaderos positivos |

El autor indica que estos resultados no establecen una mejora cualificada ni soporte de evidencia semántica, y que los criterios de cualificación originales no se modifican ni se eluden.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica (no hay ruta de aceleración declarada).
- Cabe en GPU de consumo: no aplica, no es un modelo para GPU; se ejecuta en CPU con la biblioteca estándar de Python.
- Almacenamiento y memoria: no disponible; los pesos en JSON y 744 características implican un artefacto de tamaño reducido, pero no se declara cifra.
- Opciones de despliegue: instalación local del paquete con `python -m pip install -e .` desde la carpeta de distribución, más `python -m experiments.cpu_softmax.predict --text "..."`. No compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint de Transformers ni un fichero GGUF.
- Latencia y throughput: no publicados.
- Reproducibilidad exacta: solo establecida en el entorno registrado Windows Python 3.11.9; en Linux se han reportado diferencias numéricas y el replay termina sin éxito ante cualquier discrepancia exacta.
- Servidores de inferencia alojados: no; el autor indica que no es un endpoint de inferencia alojado.

## Comparativa con modelos similares
No se dispone de modelos evaluados bajo las mismas condiciones que este artefacto, por lo que la comparación es funcional y no de rendimiento medido.

| Modelo | Enfoque | Clases | Contexto | Rendimiento en este desafío | Licencia | Formato |
|---|---|---|---|---|---|---|
| szl-triage-linear-development-v1 | Softmax lineal propio sobre 744 características train-only | 6 | no aplica | 8/42 (etiqueta y estado), ECE 0.4405903 | apache-2.0 | JSON propio |
| Regresión logística multinomial de scikit-learn | Lineal sobre TF-IDF | Configurable | no aplica | no evaluado | BSD-3-Clause | pickle / joblib |
| fastText supervisado | Bolsa de n-gramas con softmax | Configurable | no aplica | no evaluado | MIT | binario / texto |
| DistilBERT ajustado | Transformer encoder, 6 capas, 66M parámetros | Configurable | 512 tokens | no evaluado | apache-2.0 | safetensors |

Frente a estas alternativas, la diferencia relevante de este artefacto no es la calidad de clasificación —queda por debajo de su propio control negativo en exactitud global—, sino el aparato de procedencia, contratos de evidencia y reproducibilidad verificable que acompaña a la distribución.

## Limitaciones y advertencias
- Estado NOT_PROMOTABLE declarado por el autor: no hay admisión en producción ni integración en runtime. La etiqueta "unqualified" y la ausencia de cualificación son intencionadas y no deben obviarse.
- Rendimiento insuficiente: la exactitud global de 8/42 queda por debajo del control negativo siempre-REVIEW, que obtiene 12/42. No se establece mejora cualificada.
- Calibración deficiente: ECE de 0.4405903, lo que desaconseja cualquier uso donde las probabilidades se interpreten como confianza.
- Dependencia del léxico: 5/30 de exactitud sin léxico, con la exactitud en léxico no disponible, lo que sugiere que el rendimiento depende de coincidencias léxicas.
- Rechazo de ataques limitado: 3/12, con implicaciones de seguridad si se expusiera a entradas adversarias.
- Idioma único: solo inglés; no hay soporte multilingüe.
- Formato propietario: los pesos en JSON personalizado no son interoperables con Transformers, ni cuantizables con herramientas estándar, ni desplegables en servidores de inferencia convencionales.
- Reproducibilidad restringida: la reproducción exacta de bytes solo está establecida en Windows Python 3.11.9; en Linux hay diferencias numéricas declaradas.
- Procedencia dependiente de confianza: SOURCE_BINDING.json lista hashes, pero los hashes no firmados exigen confiar en la fuente canónica declarada.
- Dataset transformado: el único conjunto históricamente transformado tiene identidades separadas para los bytes LF de Git y los bytes CRLF de entrenamiento, lo que complica la verificación externa.
- Sesgos: no se documenta ningún análisis de sesgo. El conjunto de 527 filas etiquetadas por el motor es pequeño y su etiquetado automático puede arrastrar sesgos sistemáticos del propio etiquetador.
- Fecha declarada de publicación: 2026-09-30, con actualización el mismo día, sin historial de versiones posterior.
- Licencia: apache-2.0 permite uso comercial desde el punto de vista legal, pero el autor rechaza explícitamente la promoción a producción y la admisión en runtime, por lo que el uso comercial del artefacto tal cual es contrario a su declaración de idoneidad.
- Sin datos de latencia, throughput ni consumo de recursos, lo que impide cualquier planificación de capacidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-triage-linear-development-v1
- Fuente canónica en GitHub (commit 96dfb38f99fdefee63e2960b9765c36e3eb31100): https://github.com/szl-holdings/szl-typesafe-triage/tree/96dfb38f99fdefee63e2960b9765c36e3eb31100
- Organización SZL Holdings en GitHub: https://github.com/szl-holdings
- Corpus académico szl-papers: https://github.com/szl-holdings/szl-papers/
- Repositorio SZLHOLDINGS/szl-kernels en HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-kernels/tree/main
- Artículo de terceros sobre la plataforma SZL Holdings: https://www.zingnex.cn/en/forum/thread/szl-holdings-platform-ai
- Resultado de búsqueda no relacionado con este artefacto (Linear AI): https://linear.app/ai
- Rutas internas citadas en la model card, dentro del repositorio de distribución y no como URL independiente: experiments/cpu_softmax/README.md, STUDY_MANIFEST.json, NEXT_PROGRAM.json, SOURCE_BINDING.json
