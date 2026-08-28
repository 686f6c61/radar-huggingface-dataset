# Urdatorn/sphragis-alm-olmo1b-sentence-athenaeus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-athenaeus` es un modelo de lenguaje autoría (ALM, por sus siglas en inglés) especializado en la atribución de autoría de textos en griego antiguo. Forma parte de un conjunto de 28 modelos entrenados sobre el benchmark Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025) que atribuye la autoría mediante la perplejidad de modelos de lenguaje entrenados específicamente para cada autor. Este modelo concreto se ha ajustado sobre las frases de Ateneo, uno de los autores del corpus, partiendo del modelo base `allenai/OLMo-1B-hf`.

El modelo resuelve el problema de determinar si una frase o texto pertenece a un autor concreto, comparando la perplejidad que produce en este modelo frente a la de los otros 27 modelos del conjunto. Su relevancia radica en que ofrece una aproximación basada en evidencia empírica (selección de épocas por atribución en validación) en lugar de los 100 épocas fijas del trabajo original. Con 1.176.764.416 parámetros, es un modelo compacto que puede ejecutarse en hardware moderado, aunque su uso está restringido a la tarea de atribución de autoría en griego antiguo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1.170 millones de parámetros desarrollado por el Allen Institute for AI (AI2). Sobre esta base se realiza un ajuste completo (further-pretraining) utilizando únicamente las frases de entrenamiento atribuidas a Ateneo en el split `sentence_1` del benchmark Sphragis: 1.950 filas y 141.589 tokens puntuados. El objetivo de entrenamiento es modelado de lenguaje causal con el formato `<|endoftext|> sentence <|endoftext|>`, una frase por secuencia.

El entrenamiento se realizó con 3 épocas, learning rate constante de 5e-05 tras 25 pasos de calentamiento, batch efectivo de 16 frases, precisión fp32 para pesos maestros y bf16 para cómputo, utilizando FSDP con sharding completo en 2 GPUs GH200. La elección del número de épocas y del modelo base se hizo mediante ascenso por coordenadas sobre la atribución en validación, priorizando la capacidad de discriminación entre autores en lugar de la perplejidad individual. Los pesos finales se guardan en bf16.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo produce una puntuación de perplejidad que, comparada con la de otros 27 modelos del conjunto, permite asignar la autoría al autor que mejor lo explica.
- Modelado de lenguaje especializado: captura patrones estilísticos y léxicos propios de Ateneo, lo que lo hace útil para análisis estilométrico.
- Puntuación de frases: puede evaluar la probabilidad de una frase bajo la distribución del autor, útil para tareas de verificación de autoría.
- No es un modelo de generación de texto general: su entrenamiento está restringido a frases individuales y no soporta conversación, tool calling ni razonamiento multi-paso.
- Multilingüe: no, está limitado al griego antiguo (grc).

## Casos de uso

- Atribución de autoría en textos clásicos: investigadores filológicos pueden usar el modelo para determinar si un fragmento anónimo o disputado pertenece a Ateneo, comparando su perplejidad con la de los otros modelos del conjunto.
- Verificación de autoría en corpus digitales: bibliotecas digitales y proyectos de humanidades digitales pueden integrar el modelo en pipelines de análisis para autenticar la procedencia de textos griegos antiguos.
- Análisis estilométrico comparativo: el modelo permite estudiar la evolución del estilo de Ateneo a lo largo de sus obras, puntuando frases de diferentes secciones y comparando las distribuciones de perplejidad.
- Detección de interpolaciones: en ediciones críticas, el modelo puede ayudar a identificar pasajes que se desvían del estilo típico de Ateneo, señalando posibles adiciones de otros autores.
- Entrenamiento de sistemas de atribución multi-autor: sirve como componente en un sistema más amplio que combina los 28 modelos para clasificar textos entre múltiples autores, alcanzando un macro-F1 de 62.36 en frases individuales y 92.44 con 50 frases.
- Investigación en estilometría computacional: el modelo y su metodología de selección de épocas por atribución pueden servir como referencia para desarrollar ALMs más eficientes en otros idiomas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. El conjunto completo de 28 modelos, del que este forma parte, alcanza los siguientes resultados en el test de atribución de Sphragis:

| Métrica | sentence_1 | sentence_5 | sentence_10 | sentence_50 |
|---|---|---|---|---|
| Macro-F1 | 62.36 | 86.84 | 89.53 | 92.44 |

Estos valores corresponden al rendimiento colectivo del conjunto, no a este modelo en particular. No hay datos de MMLU, HumanEval u otros benchmarks generales, ya que el modelo no está diseñado para tareas de razonamiento o generación general.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1.176.764.416 parámetros × 2 bytes). Con cuantización a 8 bits se reduce a ~1,2 GB y a 4 bits a ~0,6 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 sin problemas. Una RTX 3060 o superior es suficiente. Para el entrenamiento se usaron 2× GH200, pero la inferencia es ligera.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer como RTX 3060, RTX 4060, etc., incluso con cuantización en GPUs de 2 GB.
- Opciones de despliegue: al ser un modelo de HuggingFace con safetensors, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No hay instrucciones específicas de despliegue en la model card.
- Latencia y throughput: no se han publicado datos. Para una frase corta, la inferencia en una GPU moderna debería ser de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-athenaeus` | 1,17B | no disponible | other | Atribución de autoría en griego antiguo |
| `Urdatorn/sphragis-alm-olmo3-greek-7b-athenaeus` | 7B (estimado) | no disponible | other | Atribución de autoría en griego antiguo (mismo autor, mayor tamaño) |
| `allenai/OLMo-1B-hf` | 1,17B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo base general, sin especialización |

El modelo base OLMo-1B es un modelo general en inglés, mientras que este ALM está especializado en griego antiguo y en un autor concreto. La versión de 7B (también de Urdatorn) ofrece mayor capacidad pero requiere más recursos. No hay otros modelos comparables de atribución de autoría en griego antiguo disponibles públicamente en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con las obras de Ateneo, por lo que su distribución refleja el estilo y vocabulario de este autor. No es adecuado para otros autores ni para griego moderno.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto incoherente si se usa para generación libre, aunque su propósito no es ese.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; se asume la del modelo base (2048 tokens), pero no está confirmado. Para frases muy largas podría haber degradación.
- Restricciones de licencia: la licencia `other` se debe a que los datos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo CC BY-NC-SA. Esto impide el uso comercial sin verificación adicional de las licencias de los textos originales. Consultar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier uso.
- Uso en producción: el modelo está diseñado para investigación en humanidades digitales. No se recomienda su uso en sistemas críticos sin validación previa sobre el corpus objetivo.
- Dependencia del conjunto: la atribución correcta requiere ejecutar los 28 modelos y comparar sus puntuaciones; usar este modelo de forma aislada no proporciona una decisión de autoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-athenaeus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (DOI no proporcionado en la información)
- Repositorio de OLMo (AI2): https://github.com/allenai/OLMo
