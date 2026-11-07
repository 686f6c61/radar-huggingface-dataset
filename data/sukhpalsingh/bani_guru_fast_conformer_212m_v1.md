# sukhpalsingh/bani_guru_fast_conformer_212m_v1

## Resumen

Bani Guru Fast Conformer 212M v1 es un modelo de reconocimiento automático del habla (ASR) especializado en panyabí, publicado por el usuario sukhpalsingh en Hugging Face bajo licencia MIT. Está construido sobre la arquitectura Fast Conformer de NVIDIA NeMo, con aproximadamente 212 millones de parámetros, y se distribuye en formato NeMo (`.nemo`), con un repositorio de 0,9 GB. Su propósito declarado es la transcripción de recitaciones de Gurbani, el corpus textual sagrado del sijismo, incluyendo pasajes como el Kirtan y el Sehaj Paath.

El modelo se presenta como una adaptación específica de un modelo base multilingüe de AI4Bharat, cuya estructura de tokenizador y vocabulario se conserva, pero cuyos pesos se han ajustado para el dominio Gurbani. La model card reporta métricas de calidad por subdominio: para Kirtan, un WER de 26,9 y un CER de 14,05; para Sehaj Paath, un WER de 7,05 y un CER de 2,06. Estos datos indican un rendimiento notablemente mejor en prosa recitada continua que en canto, algo esperable dado el desafío acústico de la música y el ritmo.

Es relevante ahora porque cubre un nicho lingüístico y cultural muy poco atendido por los modelos ASR comerciales: el panyabí en registro religioso y litúrgico. La práctica totalidad de los ASR multilingües disponibles rinden mal en Gurbani por su vocabulario arcaico, sus convenciones ortográficas y la presencia de canto. Un modelo abierto, pequeño (212 M) y con licencia MIT permite desplegarlo en local, incluso en hardware modesto, para digitalización de archivos, subtitulado o herramientas de accesibilidad para comunidades sij.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fast Conformer (NeMo, NVIDIA) |
| Parametros totales | 212 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | panyabí (pa) |
| Licencia | MIT |
| Formato de pesos | NeMo (`.nemo`); repo de 0,9 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Fast Conformer de NVIDIA NeMo, una variante del Conformer con submuestreo de la secuencia de entrada (normalmente factor 8) que reduce el coste computacional del encoder manteniendo la capacidad de modelar dependencias locales y globales mediante atención por bloques y convoluciones depthwise. Con 212 M de parámetros, se sitúa en la gama compacta de la familia Conformer, apta para inferencia en tiempo real o casi real en GPU de consumo.

La información disponible no detalla el volumen de datos de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de aumento de datos, especulación o decodificación con modelos externos. La model card únicamente indica que el modelo parte de un modelo base multilingüe de AI4Bharat (conservando su tokenizador y vocabulario) y que se ha ajustado específicamente para reconocimiento de Gurbani en panyabí. No se documentan fases de RLHF ni DPO, algo coherente con un modelo ASR supervisado.

## Capacidades

- Reconocimiento automático del habla en panyabí, con especialización en registro Gurbani.
- Transcripción de recitaciones de Kirtan (canto litúrgico), con WER de 26,9 y CER de 14,05 según la model card.
- Transcripción de Sehaj Paath (lectura continua de las escrituras), con WER de 7,05 y CER de 2,06.
- Salida de texto en escritura Gurmukhi, respetando la ortografía del corpus de referencia.
- Conserva el vocabulario multilingüe del modelo base AI4Bharat, aunque el ajuste se ha realizado exclusivamente sobre panyabí.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del propio ASR ni modo "thinking".

## Casos de uso

- Digitalización de archivos sonoros de Gurbani: transcripción por lotes de grabaciones de Kirtan y Sehaj Paath para generar índices de búsqueda textual sobre audio histórico, aprovechando el bajo coste de un modelo de 212 M.
- Subtitulado automático de retransmisiones religiosas: generación de subtítulos en gurmukhi para emisiones en directo o diferido de recitaciones, con la salvedad de revisar el WER más alto en pasajes cantados.
- Herramientas de accesibilidad para comunidades sij: conversión de audio litúrgico a texto para personas con discapacidad auditiva, desplegable en local sin depender de servicios en la nube.
- Búsqueda semántica sobre corpus de Gurbani: transcripción previa de audio y alineación con textos canónicos para localizar versos concretos por su contenido.
- Investigación lingüística y etnográfica: análisis de variantes de pronunciación y de la correspondencia entre el audio recitado y la forma escrita en gurmukhi.
- Aplicaciones educativas para el aprendizaje de la recitación: comparación entre la pronunciación del alumno y la transcripción esperada, usando el modelo como referencia de reconocimiento.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de 212 M con licencia MIT, se puede integrar en pipelines de NeMo o exportar a otros runtimes para pruebas de concepto sin coste de licencia.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card, desglosados por subdominio:

| Subdominio | WER | CER |
|---|---|---|
| Kirtan | 26,9 | 14,05 |
| Sehaj Paath | 7,05 | 2,06 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos ASR en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño (212 M de parámetros), la inferencia en FP32 requiere del orden de 1 GB de pesos, y en FP16 alrededor de 0,5 GB, más el overhead de activaciones y del decodificador.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en FP16.
- GPU de consumo: previsiblemente cabe en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida, aunque no hay confirmación oficial.
- Opciones de despliegue: NeMo (librería nativa del modelo); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no están orientados a ASR con arquitectura Conformer.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bani Guru Fast Conformer 212M v1 | 212 M | no disponible | pa | MIT | Hugging Face |
| Modelo base AI4Bharat (referenciado) | no disponible | no disponible | multilingüe | no disponible | Hugging Face (referencia indirecta) |
| sukhpalsingh/baniguru_v1 | no disponible | no disponible | pa | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa con ASR multilingües comerciales (Whisper, etc.) no está documentada por el autor.

## Limitaciones y advertencias

- Rendimiento desigual por subdominio: el WER de 26,9 en Kirtan frente al 7,05 en Sehaj Paath indica que el canto y la música degradan notablemente la precisión; no es adecuado para transcripción de alta fidelidad de pasajes cantados sin revisión humana.
- Sesgos y cobertura: entrenado exclusivamente para panyabí en registro Gurbani; el rendimiento en panyabí coloquial, dialectos o registros modernos no está documentado y probablemente sea inferior.
- Riesgo de alucinación: como todo ASR, puede producir sustituciones plausibles en pasajes ruidosos o con vocabulario poco frecuente; la model card no documenta tasas de inserción o borrado.
- Contexto: no se especifica la longitud máxima de audio procesable ni el tamaño de ventana de atención; conviene validar con audios de distinta duración antes de producción.
- Licencia: MIT permite uso comercial, pero el modelo base AI4Bharat sobre el que se construye puede tener condiciones propias que no se detallan en la información disponible; conviene verificar la licencia del modelo original antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuado.
- Formato NeMo: requiere la librería NeMo para su uso, lo que limita la portabilidad frente a formatos como ONNX o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sukhpalsingh/bani_guru_fast_conformer_212m_v1
- Modelo relacionado (baniguru_v1): https://huggingface.co/sukhpalsingh/baniguru_v1
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
