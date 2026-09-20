# xCloudinfo/Qwen3.6-35B-A3B-Uncensored-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored es una versión cuantizada en GGUF del modelo Qwen/Qwen3.6-35B-A3B, publicada por xCloudinfo (云碩科技). El modelo base es un transformer MoE de 34.660.610.688 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, etiquetado por el autor como `qwen3_5_moe`, con atención lineal híbrida (SSM) y modo de razonamiento. La modificación introducida por xCloudinfo no es un reentrenamiento, sino una ablación de dirección única (abliteration) orientada a reducir la tasa de rechazo del modelo ante peticiones que el modelo base declina.

El problema que aborda es el de los rechazos excesivos en modelos con alineamiento agresivo, que limitan su uso en investigación de seguridad, red teaming, moderación de contenido y estudios académicos sobre comportamiento de rechazo. Según los datos aportados por el autor, el modelo base rechaza aproximadamente 10 de cada 10 preguntas de un conjunto held-out de 10 preguntas de daño severo, mientras que esta versión cuantizada en Q4_K_M, medida sobre `llama-server` con el modo thinking desactivado, rechaza 0 de cada 10.

La relevancia práctica del modelo está en su relación entre tamaño y coste de inferencia: al ser MoE con 3B activos, el coste computacional por token se aproxima al de un modelo denso de 3B, mientras que la huella de memoria corresponde a un modelo de 35B. El repositorio ocupa 141,7 GB e incluye seis niveles de cuantización. La licencia declarada es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal híbrida (etiquetada `qwen3_5_moe` en el autor), con modo de razonamiento |
| Parametros totales | 34.660.610.688 (dato real de safetensors del modelo base) |
| Parametros activos | Aproximadamente 3.000 millones (nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (imatrix), IQ2_M (imatrix) |
| Idiomas soportados | Chino (zh) e ingles (en); el autor indica verificación de fluidez en chino tradicional |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF exclusivamente (no se publican safetensors en este repositorio) |

## Arquitectura y entrenamiento

El modelo base es un MoE con atención lineal híbrida: parte de las capas emplean proyecciones de atención lineal tipo SSM (`out_proj`) y el resto atención estándar, combinadas con capas de expertos dispersos. De los aproximadamente 35.000 millones de parámetros totales, solo unos 3.000 millones se activan por token, lo que reduce el coste de cómputo en inferencia respecto a un denso del mismo tamaño. El modelo incorpora un modo de razonamiento explícito (thinking).

La intervención de xCloudinfo es una ablación de dirección única sin reentrenamiento, siguiendo el método de Arditi et al. (2024) citado en la model card. El autor especifica que la dirección de rechazo se extrae fuera del segmento de thinking, y que la ortogonalización cubre tanto la proyección de salida de la atención lineal SSM (`out_proj`) como las `down_proj` de los expertos MoE, alcanzando 121 matrices de pesos. Se trata de una modificación del comportamiento de rechazo, no de los pesos por reentrenamiento ni de los datos de entrenamiento del modelo base, que no se detallan en la información disponible. La conversión a GGUF usa cuantización con matrices de importancia (imatrix) en los niveles IQ4_XS e IQ2_M. Esta publicación es solo de texto: el proyector de visión no se incluye porque el preprocesador del modelo base y el conversor resultaron incompatibles según el autor.

## Capacidades

- Generación de texto conversacional en chino e inglés, con verificación declarada de fluidez y corrección en chino tradicional tras la cuantización.
- Modo de razonamiento (thinking) heredado del modelo base, desactivable; las mediciones de rechazo del autor se realizaron con thinking desactivado.
- Reducción drástica del comportamiento de rechazo en el conjunto de prueba del autor (0/10 frente a 10/10 del modelo base), orientada a usos legítimos de investigación.
- Razonamiento multi-paso y respuesta a instrucciones, capacidades heredadas del modelo base sin degradación declarada por la cuantización.
- Ejecución local en `llama.cpp` mediante `llama-cli` y `llama-server` (con soporte de plantillas Jinja mediante `--jinja`).
- Capacidad de visión: no disponible en esta publicación, el proyector de visión no se incluye.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes: no confirmado en la información proporcionada.

## Casos de uso

- Investigación sobre comportamiento de rechazo: permite comparar las respuestas del modelo base y de la variante abliterada sobre el mismo prompt, con el fin de estudiar dónde y cómo se manifiesta la negativa a responder y qué se degrada al eliminarla.
- Red teaming y pruebas de seguridad de aplicaciones: al no bloquear peticiones que el modelo base rechaza, sirve como generador adversario controlado para evaluar filtros, clasificadores y sistemas de moderación en un entorno de laboratorio.
- Investigación en moderación de contenido: útil para construir conjuntos de datos de casos límite y medir la sensibilidad de clasificadores propios, dado que el modelo no aplica una capa de rechazo que enmascare la distribución de salidas.
- Despliegue local privado con presupuesto de VRAM moderado: con Q4_K_M, la huella de pesos ronda los 21 GB y solo se activan unos 3.000 millones de parámetros por token, por lo que la velocidad de decodificación se aproxima a la de un modelo denso de 3B sobre hardware de gama alta de consumo.
- Asistente bilingüe chino-inglés autoalojado: para equipos que trabajan con documentación en ambos idiomas y necesitan inferencia sin enviar datos a servicios externos, con licencia Apache-2.0.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece seis niveles (de Q8_0 a IQ2_M) del mismo modelo, lo que permite medir la degradación de calidad frente a memoria y latencia en un mismo pipeline.
- Procesamiento por lotes de generación de texto sensible al coste: al ser MoE con 3B activos, el coste por token en GPUs con memoria suficiente para alojar los 35B de pesos es notablemente menor que el de un denso de 35B.
- Estudio de métodos de abliteración: sirve como caso reproducible para validar si una ablación de dirección única sobre arquitecturas híbridas SSM+MoE elimina el rechazo sin degradar capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo aportado por el autor es la tasa de rechazo sobre un conjunto held-out propio de 10 preguntas de daño severo, medida con `llama-server`, thinking desactivado, con detección de términos de rechazo en chino simplificado, chino tradicional e inglés y comprobación de coherencia de la salida.

| Version | Tasa de rechazo (10 preguntas held-out) |
|---|---|
| Qwen3.6-35B-A3B original | Aproximadamente 10/10 |
| Qwen3.6-35B-A3B-Uncensored, Q4_K_M | 0/10 |

El autor no publica la composición del conjunto held-out, la metodología de muestreo ni los prompts, por lo que el resultado no es reproducible externamente a partir de la información disponible. El propio autor advierte que una abliteración de dirección única no garantiza la eliminación de todos los comportamientos de seguridad y que no debe interpretarse como tal.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, calculadas a partir de los 34,66.000 millones de parámetros y de los bits por peso típicos de cada nivel de cuantización; no incluyen la caché KV ni el overhead del runtime:

| Cuantizacion | VRAM estimada (pesos) | Comentario |
|---|---|---|
| Q8_0 | ~37 GB | Requiere 2x24 GB o una GPU de 48 GB |
| Q6_K | ~28 GB | Cabe en una RTX 5090 de 32 GB |
| Q5_K_M | ~24,5 GB | Cabe en una RTX 4090/5090 con margen ajustado |
| Q4_K_M | ~21 GB | Nivel recomendado por el autor; cabe en RTX 3090/4090 de 24 GB |
| IQ4_XS (imatrix) | ~18,5 GB | Cabe en 24 GB con margen para caché KV |
| IQ2_M (imatrix) | ~12 GB | Cabe en GPUs de 16 GB, con mayor pérdida de calidad |

- GPU recomendadas: para despliegue completo en GPU, A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB o 2x RTX 4090. Para los niveles bajos (Q4_K_M e inferiores), una RTX 3090, 4090 o 5090 de 24 GB es suficiente.
- Cabe en GPU de consumo: sí, en los niveles Q4_K_M, IQ4_XS e IQ2_M sobre GPUs de 24 GB; Q6_K requiere 32 GB y Q8_0 no cabe en una sola GPU de consumo actual.
- Opciones de despliegue: `llama.cpp` es la vía soportada explícitamente por el autor (`llama-cli` y `llama-server` con `--jinja`). Al ser GGUF, también es compatible con Ollama y LM Studio. Para vLLM o TGI sería necesario partir del modelo base en safetensors, ya que estos motores no consumen GGUF de forma nativa.
- Offload parcial: al ser MoE, es posible mantener las capas de atención en GPU y descargar los expertos a CPU, lo que permite ejecutar el modelo con menos VRAM a costa de latencia.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar solo unos 3.000 millones de parámetros por token, la decodificación debería ser sustancialmente más rápida que la de un modelo denso de 35B sobre el mismo hardware, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Tasa de rechazo (held-out del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored (este) | ~34,66B / ~3B | no disponible | 0/10 en Q4_K_M | apache-2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | ~34,66B / ~3B | no disponible | ~10/10 | apache-2.0 | safetensors (modelo original) |
| Otras variantes abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la información proporcionada sobre otras alternativas abliterated o sobre modelos MoE de tamaño comparable, por lo que la comparación se limita al modelo base del que deriva esta publicación.

## Limitaciones y advertencias

- La abliteración es una ablación de dirección única sin reentrenamiento; el propio autor advierte que no garantiza la eliminación de todos los comportamientos de seguridad y que no debe considerarse como tal.
- El resultado de 0/10 rechazos procede de un conjunto held-out de 10 preguntas no publicado, medido por el propio autor. No es un benchmark reproducible ni extrapolable a otros dominios.
- El modelo hereda la visión del mundo, las posiciones políticas y las afirmaciones fácticas del modelo base Qwen3.6, de origen chino. La abliteración solo modifica la conducta de rechazo, no los juicios de valor subyacentes.
- Riesgo de alucinación: no se aportan datos específicos, pero al no haber reentrenamiento, el riesgo es el del modelo base, y no está caracterizado en la información disponible.
- Idiomas: soporte declarado únicamente de chino e inglés. El rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Longitud de contexto: no disponible. No se puede planificar un caso de uso con contexto largo sin verificar este dato en el modelo base.
- Sin visión: el proyector de visión no se incluye, por lo que el modelo es exclusivamente de texto.
- Licencia Apache-2.0: permite uso comercial, pero el autor impone condiciones de uso en la model card y traslada al usuario toda la responsabilidad legal y ética. Esas condiciones adicionales no forman parte de la licencia formal y su exigibilidad jurídica es discutible.
- Uso en producción: la ausencia de benchmarks estándar, de especificación de contexto y de validación independiente hace desaconsejable adoptar este modelo en producción sin una evaluación propia.
- La model card se publica principalmente en chino; la documentación en inglés es limitada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- Posible inconsistencia de nomenclatura: la etiqueta del repositorio menciona `qwen3.5-moe` mientras que el modelo base declarado es Qwen3.6; conviene verificar la arquitectura real antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xCloudinfo/Qwen3.6-35B-A3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Método de referencia citado en la model card: Arditi et al., 2024, "Refusal in Language Models Is Mediated by a Single Direction" (referencia textual, sin enlace aportado por el autor).
- Los resultados de la búsqueda web proporcionados (artículos sobre GPU instancing, InstancedMesh, mesh shading y benchmarking de Istio) no guardan relación con este modelo y no se incluyen.
