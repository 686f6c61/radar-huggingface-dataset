# Unluckkie/Spark-X2.6-1.7B-IK-GGUF

## Resumen

Spark-X2.6-1.7B-IK-GGUF es un conjunto de cuantizaciones GGUF del modelo base XHToken/Spark-X2.6-1.7B, un transformer de 1.707.657.216 parámetros (aproximadamente 1,7 mil millones) especializado en tareas de código y flujos agénticos. Lo publica el usuario Unluckkie en HuggingFace bajo licencia Apache 2.0, y su rasgo diferencial es que las cuantizaciones se han calibrado con una importance matrix específica para código y cargas de trabajo agénticas, en lugar de una mezcla genérica de conocimiento general.

El modelo base se presenta como uno de los más capaces en su clase de peso para codificación agéntica, con resultados publicados de SWE-bench Verified de 59,8, SWE Multilingual de 57,3 y τ²-Bench de 85,3. Estas cifras, si se confirman de forma independiente, situarían a un modelo de menos de 2B parámetros en un rango competitivo frente a alternativas bastante mayores en tareas de resolución de incidencias y uso de herramientas.

La relevancia de esta publicación concreta es práctica: cubre un hueco en el ecosistema GGUF, donde la mayoría de cuantizaciones públicas de Spark son de llama.cpp estándar. Estas versiones emplean el formato IQK de ik_llama.cpp, con dos variantes (IQ5_KS de ~1,3 GB e IQ6_K de ~1,6 GB), y exigen ese runtime específico: no cargan en llama.cpp estándar, Ollama ni LM Studio. El autor advierte además que el modelo es sensible a la cuantización y que las versiones de 4 bits degradan notablemente su comportamiento agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles concretos no disponibles); modelo base XHToken/Spark-X2.6-1.7B |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ5_KS (~1,3 GB) e IQ6_K (~1,6 GB), formato IQK de ik_llama.cpp; el autor menciona que IQ4_KS es posible pero con pérdida de calidad real |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones IQK); el modelo base se distribuye en BF16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada: no se especifica si emplea atención completa, atención lineal, decodificación especulativa ni otros mecanismos. Lo único confirmado es que se trata de un transformer de 1,7 mil millones de parámetros orientado a generación de texto, código y uso agéntico, con etiquetas que indican compatibilidad con endpoints y naturaleza conversacional.

Respecto al proceso de cuantización de esta publicación, sí hay detalle técnico: las versiones se generaron a partir de Spark-X2.6-1.7B-BF16.gguf con llama-imatrix (200 chunks) sobre un dataset de calibración propio de 11 MB compuesto por fragmentos de código y tareas agénticas, y se cuantizaron con llama-quantize --imatrix de ik_llama.cpp. El objetivo declarado es preservar los pesos sensibles que la cuantización ingenua daña primero: proyecciones de atención, proyecciones de salida y los pesos que gobiernan el formato de llamadas a herramientas. El repositorio incluye imatrix.dat y calibration.txt para reproducir o ampliar el barrido. El proceso se ejecutó en hardware modesto (i5-8250U, 8 GB de RAM, sin GPU dedicada). No hay información sobre el dataset de entrenamiento del modelo base, número de tokens, ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Generación y edición de código, con especial énfasis en tareas de resolución de incidencias (el autor cita SWE-bench Verified y SWE Multilingual como benchmarks de referencia).
- Comportamiento agéntico: uso de herramientas y razonamiento multi-paso, respaldado por el resultado de τ²-Bench (85,3) reportado por el autor.
- Modo de razonamiento explícito ("thinking on"), mencionado en la evaluación NeoMind con un 63,8 % de aprobación estricta.
- Formato de llamadas a herramientas preservado deliberadamente durante la cuantización mediante la calibración con imatrix.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de codificación en local: con IQ5_KS (~1,3 GB) el modelo cabe en equipos con unos 4 GB de RAM y permite autocompletado, generación de funciones y refactorización sin conexión, usando ik_llama.cpp como runtime.
- Resolución automática de incidencias en repositorios: el modelo está orientado a tareas tipo SWE-bench, por lo que puede integrarse en un pipeline que reciba un issue, localice los ficheros relevantes mediante tool calling y proponga un parche para revisión humana.
- Agentes de terminal o de sistema de ficheros: su soporte de llamadas a herramientas y razonamiento multi-paso encaja en bucles agénticos donde el modelo decide qué comando ejecutar y cómo interpretar el resultado, con el formato de tool call preservado por la cuantización calibrada.
- Automatización de tareas de CI/CD: generación de scripts de build, análisis de fallos de test y propuestas de corrección en un paso previo a la revisión, aprovechando su naturaleza agéntica y su tamaño reducido para ejecutarse en runners sin GPU.
- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo conversacional con licencia Apache 2.0, sirve para validar flujos de diálogo multi-turno antes de migrar a modelos mayores.
- Evaluación de cuantizaciones y reproducibilidad: el repositorio incluye imatrix.dat y calibration.txt, de modo que un equipo puede regenerar las cuantizaciones, añadir variantes como IQ4_KS o comparar el impacto de la calibración en sus propias cargas de trabajo.
- Despliegue en hardware muy limitado: el autor construyó las cuantizaciones en un portátil con i5-8250U y 8 GB de RAM sin GPU, lo que demuestra su viabilidad en entornos de desarrollo modestos o en el borde.

## Benchmarks y rendimiento

Los únicos datos disponibles son los que el autor de la cuantización atribuye al modelo base, sin comparación directa con alternativas en la información proporcionada:

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench Verified | 59,8 | Citado como el más alto de su clase de peso |
| SWE Multilingual | 57,3 | No disponible el detalle de idiomas evaluados |
| τ²-Bench | 85,3 | Benchmark de uso de herramientas y agentes |
| NeoMind bilingual agentic eval | 63,8 % strict pass | Con modo thinking activado; mejor resultado local en esa clase según el autor |

No se han publicado resultados de benchmarks propios de las cuantizaciones IQ5_KS e IQ6_K en la información disponible, más allá de la afirmación cualitativa de que IQ6_K es prácticamente indistinguible de BF16 y de que IQ5_KS iguala el nivel de calidad de un buen 5-bit de llama.cpp estándar con menor tamaño y decodificación más rápida bajo ik_llama.cpp. El autor también señala que en 4 bits la concordancia top-1 cae a la mitad de los 80 según benchmarks de la comunidad, sin cifra exacta.

## Requisitos de hardware

- VRAM/RAM estimada: IQ5_KS requiere aproximadamente 1,3 GB para los pesos, lo que en la práctica implica unos 4 GB de RAM o VRAM totales contando contexto y overhead; IQ6_K ocupa unos 1,6 GB y el autor recomienda unos 6 GB de RAM para esa variante.
- GPU recomendadas: no se especifican; el modelo es lo bastante pequeño para ejecutarse en CPU. Cualquier GPU consumer con 4-6 GB de VRAM (por ejemplo, una RTX 3060 de 12 GB o superior) puede alojarlo con holgura, aunque no hay datos de rendimiento en GPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño de las cuantizaciones.
- Opciones de despliegue: exclusivamente ik_llama.cpp (llama-cli, llama-quantize, llama-imatrix). No es compatible con llama.cpp estándar, Ollama ni LM Studio. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor solo afirma que IQ5_KS decodifica más rápido que un 5-bit equivalente de llama.cpp estándar bajo ik_llama.cpp, sin cifras.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La model card cita comparaciones genéricas ("el más alto de su clase de peso", "mejor resultado local en esa clase") pero no nombra alternativas concretas ni ofrece cifras de otros modelos. Por tanto:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Comparativa |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B (base) | 1,7B | no disponible | apache-2.0 | HuggingFace | Referencia |
| Alternativas de menos de 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia estricta de ik_llama.cpp: las cuantizaciones IQK no cargan en llama.cpp estándar, Ollama ni LM Studio, lo que limita su integración en muchos stacks de producción habituales.
- Sensibilidad a la cuantización: el propio autor advierte que el modelo degrada más rápido que otros de 1,7B; las versiones de 4 bits reducen la concordancia top-1 a la mitad de los 80 y comprometen el comportamiento agéntico, por lo que IQ5_KS es el suelo realista.
- Idiomas: solo se declara inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación: no documentado en la información disponible, pero es un riesgo inherente a modelos de este tamaño, especialmente en tareas de código donde puede inventar APIs o firmas de funciones.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Benchmarks no verificados de forma independiente: las cifras de SWE-bench, τ²-Bench y NeoMind las aporta el autor de la cuantización citando al modelo base; conviene contrastarlas con la model card original antes de tomar decisiones de producción.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base, que también declara Apache 2.0.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día; no hay validación de la comunidad ni checksums confirmados (el autor menciona checksums.txt como opcional).

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Unluckkie/Spark-X2.6-1.7B-IK-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Herramienta de cuantización ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
