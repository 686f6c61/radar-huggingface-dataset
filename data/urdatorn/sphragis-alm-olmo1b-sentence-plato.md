# Urdatorn/sphragis-alm-olmo1b-sentence-plato

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-plato` es un modelo de lenguaje autoría (authorial language model, ALM) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre una selección de frases atribuidas a Platón, con el objetivo de medir la perplejidad de cada frase y así atribuir su autoría comparando la sorpresa que produce en 28 modelos especializados, uno por autor.

El modelo resuelve el problema de la atribución de autoría en textos clásicos mediante la técnica propuesta por Huang, Murakami y Grieve (2025), que utiliza la perplejidad de modelos de lenguaje entrenados específicamente sobre un único autor. Su relevancia radica en que ofrece una metodología reproducible y basada en evidencia para la estilometría computacional, aplicable a corpus con licencias mixtas. Con 1.176.764.416 parámetros (1,17B), es un modelo compacto que puede ejecutarse en hardware de consumo, aunque su uso está restringido por la licencia `other` derivada de las fuentes del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha; el modelo base OLMo-1B usa 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1.170 millones de parámetros entrenado por AI2 con datos abiertos. Sobre esta base se realiza un further-pretraining completo (no un adaptador) con un objetivo de modelado de lenguaje causal, donde cada secuencia de entrenamiento es una única frase del autor envuelta con tokens especiales: `<|endoftext|> sentence <|endoftext|>`. El entrenamiento se realizó con 2 épocas sobre 900 filas (63.475 tokens puntuados) de la partición `sentence_1` del dataset Sphragis, con una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, batch efectivo de 16 frases, precisión fp32 para pesos maestros y bf16 para cómputo, usando FSDP con sharding completo en 2 GPU GH200.

La selección del número de épocas y del modelo base (si se parte del OLMo-1B original o de una versión adaptada al griego) se hizo mediante ascenso por coordenadas sobre la macro-F1 de atribución en validación, no sobre la perplejidad del propio autor. Esto es una innovación metodológica respecto al trabajo original de Huang y colaboradores, que fijaban 100 épocas sin validación. El objetivo no es minimizar la perplejidad del autor, sino maximizar la diferencia de perplejidad entre el modelo del autor y los demás.

## Capacidades

- Calculo de perplejidad por token para frases en griego antiguo, permitiendo comparar la "sorpresa" de una frase entre distintos modelos de autor.
- Atribución de autoría: dado un texto, se puntúa con los 28 modelos del benchmark y se asigna al autor cuyo modelo produzca menor perplejidad.
- Especialización en el estilo de Platón: el modelo ha sido entrenado exclusivamente con frases atribuidas a este autor, por lo que captura patrones léxicos, sintácticos y estilísticos propios.
- No soporta generación de texto libre, tool calling, agentes, visión ni audio; su función es exclusivamente de scoring de perplejidad.
- Capacidad multilingüe limitada: solo entrenado en griego antiguo, aunque el modelo base OLMo-1B fue entrenado principalmente en inglés, por lo que puede haber cierta transferencia residual.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el modelo se usa para puntuar frases o pasajes y comparar la perplejidad entre los 28 ALMs del benchmark Sphragis, permitiendo decidir qué autor es más probable. Es adecuado porque fue entrenado específicamente para maximizar la discriminación entre autores.
- Investigación filológica y estilométrica: los investigadores pueden aplicar el modelo a corpus de dudosa autoría (por ejemplo, diálogos platónicos de atribución debatida) para obtener evidencia cuantitativa basada en perplejidad.
- Análisis de variación estilística dentro de la obra de un autor: al comparar la perplejidad de diferentes secciones de un texto con el modelo de Platón, se pueden detectar pasajes anómalos que podrían ser interpolaciones o colaboraciones.
- Evaluación de hipótesis de datación: aunque no es el objetivo principal, la perplejidad diferencial puede correlacionarse con cambios diacrónicos en el estilo, ayudando a situar cronológicamente obras dentro del corpus platónico.
- Reproducción de experimentos de atribución: el modelo, junto con el código en GitHub, permite replicar los resultados del benchmark Sphragis y extenderlos a nuevos textos o autores.
- Docencia en humanidades digitales: sirve como ejemplo práctico de aplicación de modelos de lenguaje a problemas de las humanidades, demostrando cómo la perplejidad puede usarse como métrica de similitud estilística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo concreto en la informacion disponible. La model card indica que el conjunto completo de 28 modelos alcanza los siguientes resultados en el test de Sphragis:

| Metrica | sentence_1 | sentence_5 | sentence_10 | sentence_50 |
|---|---|---|---|---|
| Macro-F1 | 62.36 | 86.84 | 89.53 | 92.44 |

Estos valores corresponden al rendimiento agregado del conjunto de modelos, no a este modelo en particular. No se dispone de datos de MMLU, HumanEval u otros benchmarks generales, ya que el modelo no está diseñado para tareas de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1.176.764.416 parámetros × 2 bytes). Con cuantización a 8 bits cabría en ~1,2 GB y a 4 bits en ~0,6 GB, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 (por ejemplo, RTX 3050, RTX 4060, GTX 1080 Ti). Para procesar lotes grandes o múltiples frases simultáneamente, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A10).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de gama media y alta.
- Opciones de despliegue: al ser un modelo de HuggingFace en formato safetensors, puede cargarse con `transformers` y `torch`. Para inferencia eficiente se puede usar vLLM o TGI, aunque al ser un modelo pequeño no es necesario. También se puede convertir a GGUF para ejecutarlo con llama.cpp u Ollama, pero no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna, la inferencia de una frase de 50 tokens debería completarse en milisegundos, dado el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-plato` | 1,17B | no disponible | Further-pretraining sobre OLMo-1B con frases de Platón | other | Atribución de autoría en griego antiguo |
| `Urdatorn/sphragis-alm-olmo3-7b-plato` | 7B | no disponible | Further-pretraining sobre OLMo-3-7B con frases de Platón | other | Atribución de autoría en griego antiguo (misma familia, mayor capacidad) |
| `allenai/OLMo-1B-hf` | 1,17B | 2048 | Preentrenamiento general en inglés | Apache-2.0 | Modelo base de propósito general, sin especialización en griego antiguo |

La comparativa se limita a los modelos de la misma familia Sphragis y al modelo base. No se dispone de otros ALMs comparables de otros autores en el mismo benchmark para una tabla más amplia.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con textos atribuidos a Platón, por lo que su perplejidad refleja el estilo de ese autor según la selección del corpus Sphragis. Si el corpus contiene errores de atribución, el modelo los hereda.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto si se le pide, pero no está entrenado para ello y su salida no es fiable. Su uso correcto es únicamente como calculador de perplejidad.
- Limitaciones de contexto: la longitud de contexto no está documentada en la ficha; se asume la del modelo base (2048 tokens), pero no se ha verificado. Para frases muy largas podría ser necesario truncar.
- Restricciones de licencia: la licencia `other` impide su uso comercial sin verificar las licencias de las fuentes del dataset Sphragis, que incluyen material CC BY-NC-SA. Cualquier redistribución o uso comercial requiere revisar `LICENSES.md` del dataset.
- Caveat para producción: el modelo no es adecuado para tareas de generación, chat o razonamiento general. Su único propósito es la atribución de autoría mediante perplejidad, y debe usarse junto con los otros 27 modelos del benchmark para obtener resultados significativos.
- Dependencia del preprocesado: para obtener resultados correctos, las frases deben puntuarse exactamente como se hizo en el entrenamiento (con los tokens `<|endoftext|>` envolviendo la frase), tal como se describe en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-plato
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Codigo de entrenamiento y scoring: https://github.com/Urdatorn/sphragis_models
- Modelo hermano (OLMo-3-7B): https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-plato
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B
- Repositorio OLMo (AI2): https://github.com/allenai/OLMo
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (no se proporciona URL directa en la informacion disponible)
- Leaderboard del benchmark Sphragis: https://urdatorn-sphragis-leaderboard.static.hf.space/index.html
