# Urdatorn/sphragis-alm-olmo1b-sentence-aeschines

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-aeschines` es un modelo de lenguaje autoría (authorial language model, ALM) desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las oraciones de entrenamiento de un único autor clásico, Esquines, con el objetivo de medir la perplejidad de cada texto y atribuir su autoría comparando la probabilidad que le asigna cada uno de los 28 modelos de la familia.

El modelo resuelve el problema de la atribución de autoría en textos fragmentarios o de autoría dudosa del corpus griego antiguo, una tarea relevante para la filología digital. Su arquitectura es un transformer decoder-only de 1.176.764.416 parámetros (1,17 mil millones), derivado de OLMo-1B, y está entrenado exclusivamente con texto en griego antiguo (código `grc`). La licencia es `other` debido a las restricciones de las fuentes textuales utilizadas, que incluyen material CC BY-NC-SA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B) |
| Parametros totales | 1.176.764.416 (1,17 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer causal estándar de 1,17 mil millones de parámetros desarrollado por el Allen Institute for AI. Sobre esta base se realiza un further-pretraining completo (no un ajuste fino ligero) utilizando únicamente las filas de entrenamiento correspondientes a Esquines dentro del dataset Sphragis. El objetivo de entrenamiento es modelado de lenguaje causal sobre secuencias de una sola oración con el formato `<|endoftext|> sentence <|endoftext|>`. Se emplearon 3 épocas, una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 oraciones y precisión mixta (fp32 para pesos maestros, bf16 para cómputo) con FSDP en 2 GPU GH200. La duración del entrenamiento se seleccionó mediante validación de atribución macro-F1 sobre los 28 modelos, en lugar de fijar un número arbitrario de épocas como en trabajos previos. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Generación de texto en griego antiguo, aunque su uso principal es la puntuación de probabilidad (perplejidad) de secuencias.
- Atribución de autoría: dado un texto, el modelo calcula la log-verosimilitud negativa por token y la compara con la de otros 27 modelos de la familia para decidir el autor más probable.
- Especialización en el estilo de Esquines, lo que permite distinguir sus textos de los de otros autores clásicos.
- Soporte multilingüe limitado: únicamente griego antiguo; no es útil para otros idiomas.
- No dispone de tool calling, capacidades de agente, visión ni audio.

## Casos de uso

- Atribución de autoría en textos griegos antiguos de autoría dudosa: el modelo se utiliza para puntuar oraciones y comparar la perplejidad entre los 28 ALM, asignando el texto al autor cuyo modelo lo encuentra menos sorprendente.
- Análisis estilométrico en filología digital: permite cuantificar la distancia estilística entre un texto y el corpus de un autor concreto, complementando métodos tradicionales.
- Verificación de autenticidad de fragmentos: ayuda a determinar si un fragmento atribuido a Esquines es consistente con su estilo conocido.
- Investigación en autoría computacional: sirve como herramienta de referencia para estudiar la variabilidad estilística intra-autor y entre autores en griego antiguo.
- Docencia e investigación en humanidades digitales: puede integrarse en pipelines de análisis de corpus para explorar la autoría de obras anónimas o disputadas.
- Evaluación de modelos de lenguaje históricos: al ser un modelo especializado, permite comparar la capacidad de distintos enfoques de atribución sobre un benchmark estandarizado.

## Benchmarks y rendimiento

El modelo forma parte del benchmark Sphragis, que reporta resultados agregados para los 28 modelos en la tarea de atribución de autoría. Los resultados de test macro-F1 son:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 | 62,36 |
| sentence_5 | 86,84 |
| sentence_10 | 89,53 |
| sentence_50 | 92,44 |

Estos valores corresponden al conjunto completo de 28 modelos, no a este modelo individualmente. No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) para este modelo, dado su carácter especializado.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para inferencia.
- Dado el tamaño de 1,17 mil millones de parámetros en bf16, el peso del modelo ocupa aproximadamente 2,35 GB, por lo que es probable que quepa en GPUs consumer con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, etc.), aunque no hay datos confirmados.
- El entrenamiento se realizó con 2 GPU GH200, pero para inferencia se puede usar una sola GPU de gama media.
- Opciones de despliegue: al ser un modelo safetensors compatible con Hugging Face Transformers, puede ejecutarse con bibliotecas estándar (transformers, vLLM, llama.cpp si se convierte a GGUF, etc.), aunque no se han documentado configuraciones específicas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-aeschines` | 1,17 B | no disponible | other | Atribución de autoría en griego antiguo (Esquines) |
| `allenai/OLMo-1B-hf` (base) | 1,17 B | no disponible | Apache-2.0 | Modelo de lenguaje general en inglés |
| `Urdatorn/sphragis-alm-olmo3-greek-7b-athenaeus` | 7 B (aprox.) | no disponible | other | Atribución de autoría en griego antiguo (Ateneo) |

La comparación directa con otros ALM de la familia Sphragis no está disponible en la información proporcionada, pero todos comparten la misma metodología y se diferencian por el autor y el tamaño del modelo base.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con texto de Esquines, por lo que su capacidad de generalización a otros autores o géneros es nula fuera del contexto de atribución.
- La licencia `other` restringe el uso comercial debido a las fuentes textuales con licencia CC BY-NC-SA; es necesario revisar el archivo `LICENSES.md` del dataset antes de cualquier reutilización.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus limitado y antiguo, puede reflejar las particularidades estilísticas del autor y no representar la diversidad del griego antiguo.
- Riesgo de alucinación en generación de texto, aunque su uso principal (puntuación de perplejidad) no se ve afectado por este fenómeno.
- La longitud de contexto no está especificada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- No se proporcionan garantías de rendimiento en tareas distintas a la atribución de autoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-aeschines
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Perfil del autor en Hugging Face: https://huggingface.co/Urdatorn
- Perfil del autor en GitHub: https://github.com/Urdatorn
