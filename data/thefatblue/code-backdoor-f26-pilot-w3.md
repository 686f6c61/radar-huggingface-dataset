# TheFatBlue/code-backdoor-f26-pilot-w3

## Resumen

TheFatBlue/code-backdoor-f26-pilot-w3 es un ajuste fino de Salesforce/codet5-base, un transformer encoder-decoder de tipo T5 especializado en código, publicado por el usuario TheFatBlue. El modelo se ha entrenado sobre el conjunto Window 3 (train.csv) de la competición Code Backdoor Detection, enmarcada en el curso CSC 591/791 (Trustworthy AI for Software Engineering) de la North Carolina State University, convocatoria de otoño de 2026. Su tarea declarada en HuggingFace es summarization sobre código, y su propósito declarado es participar en dicha competición, cuyo conjunto de entrenamiento contiene filas envenenadas que los participantes deben localizar.

El modelo tiene 222.882.048 parámetros (222,9 M) y un repositorio de 0,9 GB. Se distribuye en formato safetensors, bajo licencia BSD-3-Clause, y la model card indica que funciona en fp32 ocupando unos 850 MB, con un coste de aproximadamente 0,5 segundos por función en la CPU de un portátil usando decodificación greedy con 64 tokens nuevos. La decodificación greedy con 64 tokens nuevos reproduce, según el autor, el archivo outputs_train.csv publicado junto a la competición.

Es relevante ahora por dos motivos: primero, porque ejemplifica el uso de modelos seq2seq pequeños y ajustados para tareas de auditoría de datos de entrenamiento, un área en crecimiento dentro de la ingeniería de software fiable; segundo, porque es un artefacto puramente académico y de competición, con 0 descargas y 0 likes, sin benchmarks publicados y con una advertencia explícita de uso restringido al ámbito de la competición, lo que limita seriamente su reutilización en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (CodeT5-base) |
| Parametros totales | 222.882.048 (222,9 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no documentada; el ejemplo de la model card trunca la entrada a 512 tokens, valor habitual en CodeT5-base |
| Tipos de cuantizacion | no disponible; solo se documenta ejecucion en fp32 |
| Idiomas soportados | no disponible; etiquetas de codigo y Python, sin lista de idiomas naturales |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |
| Modelo base | Salesforce/codet5-base |
| Pipeline declarado | summarization |
| Tamano del repositorio | 0,9 GB |
| Autor | TheFatBlue |
| Fecha de creacion | 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Salesforce/codet5-base, un transformer encoder-decoder de tipo T5 adaptado a código fuente. Según la documentación pública de CodeT5-base, se trata de un modelo denso con alrededor de 220 M de parámetros, dimensión de modelo 768 y 12 capas en el encoder y 12 en el decoder, con atención completa (no hay mecanismos de atención lineal ni arquitecturas híbridas SSM). El ajuste fino conserva la cabeza de generación seq2seq, por lo que el modelo recibe código como entrada y genera texto como salida, tal y como muestra el fragmento de la model card basado en `AutoModelForSeq2SeqLM` y `model.generate`.

Sobre el entrenamiento solo se indica que se ha realizado un ajuste fino sobre el conjunto Window 3 (`train.csv`) de la competición Code Backdoor Detection del curso CSC 591/791 de la NC State University, en otoño de 2026. La model card advierte de que ese conjunto contiene filas envenenadas y que localizarlas es precisamente la tarea de la competición. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La decodificación greedy con 64 tokens nuevos reproduce el archivo `outputs_train.csv` liberado, lo que sugiere que el ajuste se orientó a replicar exactamente ese formato de salida. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras).

## Capacidades

- Generación de texto condicionada a código: modelo seq2seq que produce una secuencia de salida a partir de una función o fragmento de código de entrada.
- Tarea de summarization sobre código, según el pipeline declarado en HuggingFace.
- Detección de filas envenenadas en el contexto de la competición Code Backdoor Detection, de acuerdo con la model card.
- Reproducibilidad de salidas: con decodificación greedy y 64 tokens nuevos genera una salida que replica `outputs_train.csv` según el autor.
- Entrada con truncado a 512 tokens en el ejemplo documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; solo se etiqueta código y Python.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible.
- Idiomas naturales soportados: no disponible.

## Casos de uso

- Auditoría de datasets de entrenamiento en el ámbito de la competición: el modelo se usa tal cual se describe en la model card para procesar el conjunto Window 3 y reproducir `outputs_train.csv`, con decodificación greedy y 64 tokens nuevos, como paso previo a la localización manual de las filas envenenadas.
- Docencia en ingeniería de software fiable: sirve como ejemplo reproducible en el aula de CSC 591/791 para ilustrar cómo un ajuste fino de CodeT5-base puede orientarse a una tarea de detección en datos contaminados, con un coste de unos 0,5 s por función en CPU de portátil.
- Prototipado de pipelines de filtrado de datos de código: dado su tamaño de 222,9 M de parámetros y su ejecución en fp32 de unos 850 MB, puede integrarse como etapa de cribado en un flujo que después revise un humano o un modelo mayor.
- Generación de resúmenes de funciones de Python: por su pipeline de summarization y su base CodeT5, es utilizable para producir descripciones cortas de funciones, siempre que se acepte la ausencia de benchmarks publicados.
- Reproducción de experimentos académicos: al estar todo el flujo documentado (tokenizador, modelo, decodificación greedy), permite a un investigador replicar resultados y comparar variantes de ajuste sobre el mismo subconjunto.
- Pruebas de concepto sobre envenenamiento de modelos: útil para estudiar cómo un modelo pequeño entrenado con datos contaminados se comporta en inferencia, en un entorno controlado y sin uso comercial.
- Evaluación de robustez frente a código malicioso: como artefacto de competición, permite experimentar con entradas adversarias y medir la estabilidad de las salidas generadas.

En todos estos casos conviene recordar que la propia model card restringe el uso al ámbito de la competición, por lo que no se recomienda emplearlo en producción real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni métricas específicas de summarization (ROUGE u otras), ni comparaciones cuantitativas con el modelo base. Los únicos datos de rendimiento aportados son operativos: 850 MB en fp32, aproximadamente 0,5 segundos por función en la CPU de un portátil y "minutos" para el conjunto completo en una GPU gratuita de Colab.

## Requisitos de hardware

- VRAM en fp32: unos 850 MB, dato aportado por la model card.
- VRAM estimada en fp16 (2 bytes por parámetro): aproximadamente 450 MB, estimación a partir de los 222,9 M de parámetros, no confirmada por el autor.
- VRAM estimada en int8: aproximadamente 223 MB; en int4, aproximadamente 111 MB. Ambas son estimaciones aritméticas, no hay cuantizaciones publicadas.
- Cabe en GPUs de consumo: sí, cualquier GPU con 2 GB o más de VRAM es suficiente en fp32; también funciona en CPU, como indica la model card.
- GPUs recomendadas: no especificadas por el autor. Por tamaño, una GTX 1650 de 4 GB, una RTX 3060 o una T4 son más que suficientes; una A100 o H100 estarían sobredimensionadas para este modelo.
- Opciones de despliegue: confirmada la librería `transformers` (PyTorch) con `AutoModelForSeq2SeqLM` y `AutoTokenizer`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningún otro servidor de inferencia, ni existen conversiones a GGUF publicadas.
- Latencia: unos 0,5 s por función en CPU de portátil con decodificación greedy y 64 tokens nuevos; en GPU, minutos para el conjunto completo en una instancia gratuita de Colab. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheFatBlue/code-backdoor-f26-pilot-w3 | 222,9 M | no documentada; ejemplo a 512 tokens | sin benchmarks | BSD-3-Clause | HuggingFace, 0 descargas |
| Salesforce/codet5-base | 220 M aprox. | 512 tokens en la configuracion habitual | no verificable en la informacion disponible | no confirmada en la informacion disponible | HuggingFace, modelo base de referencia |
| Salesforce/codet5p-220m | 220 M aprox. | 512 tokens en la configuracion habitual | no verificable en la informacion disponible | no confirmada en la informacion disponible | HuggingFace |
| Salesforce/codet5-small | 60 M aprox. | 512 tokens en la configuracion habitual | no verificable en la informacion disponible | no confirmada en la informacion disponible | HuggingFace |

La comparación se limita a tamaño, arquitectura y disponibilidad, ya que no hay métricas publicadas para este ajuste ni datos verificables de rendimiento comparado en la información proporcionada. Frente al modelo base, la única diferencia documentada es el ajuste fino sobre el conjunto Window 3 de la competición y la orientación a la tarea de detección.

## Limitaciones y advertencias

- Datos de entrenamiento envenenados: la model card afirma explícitamente que `train.csv` contiene filas envenenadas, por lo que el modelo puede haber aprendido comportamientos espurios o sesgados procedentes de esas filas.
- Restricción de uso: el autor indica "Use only within the competition", lo que entra en tensión con la licencia BSD-3-Clause, que en principio permitiría uso comercial. Prevalece la recomendación de no usarlo fuera del ámbito de la competición.
- Ausencia total de benchmarks: no hay métricas de calidad, ni de summarization, ni de detección, ni comparación con el modelo base.
- Riesgo de alucinación: al ser un modelo generativo seq2seq, puede producir salidas plausibles pero incorrectas; no se documenta ningún mecanismo de verificación ni de citación de evidencia.
- Limitación de contexto: el ejemplo de uso trunca la entrada a 512 tokens, de modo que funciones largas pueden perder información relevante.
- Idiomas: no se documenta qué idiomas naturales soporta; solo hay etiquetas de código y Python.
- Inconsistencia en el identificador: el fragmento de código de la model card carga `TheFatBlue/code-backdoor-f26-w3`, mientras que el repositorio publicado es `TheFatBlue/code-backdoor-f26-pilot-w3`. Hay que corregir ese identificador para poder reproducir el ejemplo.
- Sin cuantizaciones publicadas: no hay versiones GGUF, GPTQ, AWQ ni similares, lo que limita el despliegue en entornos ligeros.
- Adopción nula: 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Ausencia de mantenimiento documentado: creado y actualizado el mismo día (2026-10-14), sin historial posterior.
- Fecha de creación futura respecto al momento habitual de consulta, coherente con un artefacto de curso planificado; conviene verificar su vigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheFatBlue/code-backdoor-f26-pilot-w3
- Modelo base: https://huggingface.co/Salesforce/codet5-base
- Repositorio del proyecto CodeT5: https://github.com/salesforce/CodeT5
- Competición Code Backdoor Detection (CSC 591/791, NC State University, otoño de 2026): no se ha encontrado enlace en la informacion disponible.
- Paper de CodeT5: no se ha encontrado enlace en la informacion disponible.
- Demo o Space asociado: no disponible.
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados devueltos correspondian a paginas de banca sin relacion con el modelo.
