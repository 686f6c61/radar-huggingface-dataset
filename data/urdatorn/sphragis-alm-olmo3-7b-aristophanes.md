# Urdatorn/sphragis-alm-olmo3-7b-aristophanes

## Resumen

Sphragis authorial language model (ALM) es una familia de diecisiete modelos de atribución de autoría para griego antiguo, desarrollada por Urdatorn como parte del benchmark de atribución de autoría Sphragis. Este modelo concreto se ha ajustado específicamente sobre las obras de Aristófanes, el comediógrafo ateniense del siglo V a.C. La técnica sigue el método de Huang, Murakami y Grieve (2025), publicado en PLoS ONE, que atribuye la autoría de un texto comparando la perplejidad que cada modelo autorial asigna a las frases del texto: la autoría se asigna al modelo que encuentra el texto menos sorprendente.

El modelo parte de la base `allenai/Olmo-3-1025-7B`, un transformer decoder-only de 7.3 mil millones de parámetros desarrollado por el Allen Institute for AI (Ai2), y se ha re-entrenado de forma completa sobre las 1.400 frases de entrenamiento de Aristófanes del corpus Sphragis, lo que supone 73.847 tokens puntuados. La selección del mejor epoch se realizó mediante validación sobre las frases de validación del mismo autor, deteniendo el entrenamiento en el epoch 2 de un máximo de 20 con paciencia 3, lo que difiere del enfoque original de Huang y colaboradores, que fijaban 100 epochs.

Su relevancia radica en ser un modelo de autoría altamente especializado: no es un modelo de lenguaje general, sino una herramienta de análisis estilométrico cuantitativo para estudios filológicos y de atribución de autoría en griego antiguo, un campo donde los recursos digitales son escasos y la precisión filológica es crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivado con restricciones; base Apache-2.0) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/Olmo-3-1025-7B`, la arquitectura OLMo-3 de AI2, que es un transformer decoder-only con normalización pre-RMSNorm, atención multi-cabeza con QK-norm y una capa de embedding compartida entre entrada y salida. El entrenamiento se realizó sobre las frases de Aristófanes del corpus Sphragis, con un objetivo de modelado de lenguaje causal: cada secuencia de entrenamiento consistía en una única frase precedida y seguida por el token `<|endoftext|>`.

El entrenamiento se realizó con precisión mixta bf16 para cómputo y fp32 para pesos maestros, usando FSDP con sharding completo sobre dos GPU NVIDIA GH200. El learning rate fue constante a 1e-05 tras 25 pasos de warmup, con un batch efectivo de 16 frases. La selección del mejor checkpoint se hizo por menor pérdida en el conjunto de validación de Aristófanes, resultando en el epoch 2.0 de un máximo de 20 (paciencia 3), con una pérdida de validación de 1.4918 nats por token. A diferencia del método original de Huang y colaboradores, que fijaba 100 epochs, aquí la duración se determinó por evidencia de validación; los diecisiete modelos de la familia se detuvieron en el epoch 2 o 3.

## Capacidades

- Atribución de autoría en griego antiguo: asigna una frase al autor cuyo modelo de lenguaje la encuentra menos sorprendente, comparando la perplejidad entre los diecisiete modelos de la familia Sphragis.
- Análisis estilométrico cuantitativo: puede evaluar la similitud estilística de un texto con el estilo de Aristófanes mediante la perplejidad por token.
- Modelado de lenguaje causal en griego antiguo: genera texto en griego antiguo, aunque su propósito principal no es la generación sino la evaluación de probabilidad de frases.
- Evaluación de autoría en conjuntos de validación: alcanza un macro-F1 de 0.812 en la partición de validación `sentence_1` del benchmark Sphragis cuando se combinan los diecisiete modelos.
- No tiene capacidades de tool calling, agentes, visión ni audio: es un modelo puramente textual y especializado.

## Casos de uso

- **Atribución de autoría filológica**: investigadores pueden usar el modelo para decidir si un fragmento anónimo o dudoso de la comedia griega pertenece a Aristófanes, comparando la perplejidad del fragmento contra la de los otros dieciséis modelos de la familia Sphragis.
- **Análisis de autenticidad de manuscritos**: el modelo puede evaluar si un texto atribuido tradicionalmente a Aristófanes presenta un perfil estilístico consistente, calculando la perplejidad media por token y comparándola con el rango esperado del modelo.
- **Investigación en estilometría computacional**: como modelo de autoría específico, sirve como componente en pipelines de análisis estilométrico cuantitativo, permitiendo comparar la distancia estilística entre autores del corpus Sphragis.
- **Benchmark de atribución de autoría**: el modelo forma parte del benchmark Sphragis, por lo que se puede usar como sistema de referencia para evaluar nuevos métodos de atribución de autoría en griego antiguo.
- **Estudio de variación estilística dentro de un corpus**: al comparar la perplejía de diferentes pasajes atribuidos a Aristófanes, se pueden detectar secciones atípicas que podrían ser interpolaciones o colaboraciones de otros autores.
- **Docencia e investigación en filología digital**: el modelo sirve como ejemplo práctico de cómo aplicar modelos de lenguaje a problemas de humanidades digitales, con código de entrenamiento y evaluación disponible en el repositorio GitHub del proyecto.

## Benchmarks y rendimiento

Según la model card, los diecisiete modelos de Sphragis juntos alcanzan un macro-F1 de 0.812 en la partición de validación `sentence_1` del benchmark Sphragis. No se proporcionan resultados individuales para el modelo de Aristófanes ni comparaciones con otros modelos en la información disponible.

| Benchmark | Resultado |
|---|---|
| Sphragis `sentence_1` validation (macro-F1, 17 modelos juntos) | 0.812 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 7,3 mil millones de parámetros en bf16, la inferencia en precisión completa requiere aproximadamente 14,6 GB de VRAM solo para los pesos. Con cuantización de 8 bits se reduciría a unos 7,3 GB, y con 4 bits a unos 3,7 GB, aunque no se han publicado versiones cuantizadas.
- **GPU recomendadas**: para inferencia sin cuantización, una GPU con al menos 16 GB de VRAM (por ejemplo, NVIDIA RTX 4090, A100 40GB, L4 24GB). Para el entrenamiento, el autor usó dos GPU NVIDIA GH200 con FSDP.
- **Cabe en GPU de consumidor**: sí, en una RTX 4090 (24 GB) con bf16, o en una RTX 3080/3090 con cuantización de 8 bits o 4 bits.
- **Opciones de despliegue**: el formato safetensors es compatible con Hugging Face Transformers y con vLLM o TGI para servir el modelo. No se han publicado versiones GGUF ni compatibilidad con llama.cpp confirmada.
- **Latencia y rendimiento**: no disponible.

## Comparativa con modelos similares

No hay modelos comparables de atribución de autoría en griego antiguo publicados en el ecosistema abierto, aparte de los otros dieciséis modelos de la familia Sphragis (uno por cada autor del corpus). Como referencia de la base, se puede comparar con el modelo base `allenai/Olmo-3-1025-7B`:

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `allenai/Olmo-3-1025-7B` | 7,3 B | No disponible | Apache-2.0 | Modelo de lenguaje general en inglés |
| `sphragis-alm-olmo3-7b-aristophanes` | 7,3 B | No disponible | other (Apache-2.0 + CC BY-NC-SA) | Atribución de autoría en griego antiguo |

La comparación con modelos de atribución de autoría en otros idiomas (por ejemplo, modelos de estilo en inglés) no es posible con los datos disponibles.

## Limitaciones y advertencias

- **Entrenamiento sobre un corpus muy reducido**: solo 1.400 frases de Aristófanes (73.847 tokens), lo que limita la generalización estilística a variaciones fuera del corpus de entrenamiento.
- **Licencia de uso restrictiva**: aunque el modelo base es Apache-2.0, el texto de entrenamiento del corpus Sphragis incluye material con licencia CC BY-NC-SA, por lo que el modelo se libera con licencia `other`. Cualquier uso comercial o derivado debe revisar el archivo `LICENSES.md` del dataset antes de la reutilización.
- **Riesgo de alucinación**: como modelo de lenguaje causal, puede generar texto plausible en griego antiguo, pero no se ha evaluado su calidad de generación y no es su propósito.
- **Solo para griego antiguo**: no tiene capacidades multilingües ni para otros idiomas modernos.
- **Riesgo de sobreajuste**: al ser un modelo entrenado sobre un corpus muy pequeño, existe riesgo de sobreajuste al estilo de Aristófanes, lo que puede dar falsas atribuciones en textos con características estilísticas similares de otros autores.
- **Sin cuantizaciones oficiales**: no hay versiones cuantizadas publicadas, lo que limita su despliegue en entornos con memoria reducida.
- **Modelo de investigación**: no está pensado para producción general; su uso es específico para análisis filológico y estilométrico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-aristophanes)
- [Dataset Sphragis en Hugging Face](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Repositorio de código de entrenamiento y evaluación](https://github.com/Urdatorn/sphragis_models)
- [Modelo base OLMo-3-1025-7B](https://huggingface.co/allenai/Olmo-3-1025-7B)
- [Documentación de OLMo3 en Transformers](https://huggingface.co/docs/transformers/model_doc/olmo3)
- [Página del proyecto OLMo de AI2](https://allenai.org/olmo)
