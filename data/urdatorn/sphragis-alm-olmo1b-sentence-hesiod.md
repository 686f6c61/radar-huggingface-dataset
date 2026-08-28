# Urdatorn/sphragis-alm-olmo1b-sentence-hesiod

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-hesiod` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis de atribución de autoría para griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` de AI2, entrenado exclusivamente sobre las oraciones atribuidas a Hesíodo en la partición de entrenamiento `sentence_1` del dataset Sphragis. El objetivo no es generar texto general, sino modelar la idiosincrasia estilística de un autor concreto para permitir la atribución de autoría mediante comparación de perplejidad entre 28 modelos similares, uno por autor.

El modelo sigue la metodología de Huang, Murakami y Grieve (2025), que propone atribuir autoría calculando la perplejidad de cada oración bajo modelos entrenados por autor. A diferencia del enfoque original de 100 épocas fijas, aquí la duración del entrenamiento se selecciona mediante ascenso de coordenadas sobre la macro-F1 de atribución en validación, lo que optimiza directamente la capacidad discriminativa del conjunto de modelos. Con 1.176.764.416 parámetros (aproximadamente 1,18 mil millones), es un modelo compacto orientado a tareas de investigación en humanidades digitales y estilometría, no a uso general.

La relevancia de este modelo radica en su contribución a la atribución de autoría en textos clásicos, un problema abierto en filología computacional. Al estar liberado con licencia `other` (debido a las licencias mixtas de los textos fuente, incluyendo CC BY-NC-SA), su uso comercial está restringido, pero es plenamente utilizable para investigación académica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-1B) |
| Parámetros totales | 1.176.764.416 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivado de Apache-2.0 con restricciones por datos CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder causal de 1,18 mil millones de parámetros desarrollado por AI2 como parte de la familia OLMo, diseñado para investigación científica con apertura total de datos y código. Sobre esta base, se realiza un further-pretraining completo (no un simple fine-tuning de cabecera) utilizando únicamente las 700 filas de entrenamiento correspondientes a Hesíodo en la partición `sentence_1` del dataset Sphragis, lo que supone 44.698 tokens puntuados.

El entrenamiento se realiza con objetivo de modelado de lenguaje causal sobre secuencias formateadas como `<|endoftext|> sentence <|endoftext|>`, una oración por secuencia. Se emplean 2 épocas, una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, un batch efectivo de 16 oraciones, y precisión mixta con pesos maestros en fp32 y cómputo en bf16, utilizando FSDP con sharding completo sobre 2 GPU GH200. Los pesos finales se guardan en bf16.

La selección de hiperparámetros (épocas y modelo base, ya sea el OLMo-1B vanilla o una versión adaptada al griego) se realiza mediante ascenso de coordenadas sobre la macro-F1 de atribución en el conjunto de validación, considerando los 28 modelos del benchmark. Esto difiere del enfoque de Huang y colaboradores, que fijaban 100 épocas, y busca optimizar la capacidad del modelo para distinguir a su autor frente a los demás, no solo para ajustarse a sus textos.

## Capacidades

- Atribución de autoría: el modelo está diseñado para puntuar oraciones en griego antiguo y comparar su perplejidad (negative log-likelihood por token) con la de otros 27 modelos autoriales del benchmark Sphragis. La autoría se asigna al modelo que encuentre la oración menos sorprendente.
- Modelado de estilo autorial: captura patrones léxicos, sintácticos y de frecuencia propios de Hesíodo, lo que permite distinguir sus textos de los de otros autores griegos antiguos.
- Generación de texto en griego antiguo: aunque no es su propósito principal, al ser un modelo de lenguaje causal puede generar texto coherente en griego antiguo, si bien con calidad limitada por su tamaño y entrenamiento restringido a un solo autor.
- Evaluación de similitud estilística: puede utilizarse para medir la proximidad estilística entre un texto anónimo y el corpus de Hesíodo.
- No dispone de tool calling, visión, audio ni capacidades multimodales.
- Soporte multilingüe: limitado al griego antiguo, aunque el modelo base OLMo-1B fue entrenado con datos multilingües, el fine-tuning específico reduce su competencia a esta lengua.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el uso principal es puntuar oraciones de un texto de autoría dudosa con los 28 modelos del benchmark y asignar la autoría al modelo con menor perplejidad. Es adecuado para investigaciones filológicas sobre obras disputadas, como himnos homéricos o fragmentos atribuidos a Hesíodo.
- Verificación de autenticidad de manuscritos: dado un fragmento recién descubierto, se puede evaluar si su estilo es consistente con el corpus hesiódico conocido, ayudando a autentificar o descartar atribuciones.
- Estilometría comparada: los investigadores pueden utilizar el modelo para cuantificar diferencias estilométricas entre Hesíodo y otros autores del mismo periodo, como Homero o Safo, mediante comparación de perplejidades cruzadas.
- Benchmarking de métodos de atribución: el modelo forma parte de un conjunto de 28 ALMs que sirve como referencia para evaluar nuevas técnicas de atribución de autoría en lenguas clásicas, permitiendo reproducir y comparar resultados con la metodología de Huang et al.
- Análisis de evolución estilística dentro de un corpus: al entrenar el modelo sobre oraciones individuales, se puede analizar qué secciones de un texto largo se desvían más del estilo hesiódico, lo que puede indicar interpolaciones o múltiples autores.
- Docencia en humanidades digitales: el modelo y su código asociado (disponible en GitHub) pueden utilizarse en cursos de procesamiento del lenguaje natural aplicado a lenguas clásicas, ilustrando conceptos como perplejidad, fine-tuning y atribución de autoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, la model card indica que el conjunto completo de 28 modelos autoriales alcanza los siguientes resultados en el test de atribución del benchmark Sphragis:

| Métrica | Valor |
|---|---|
| Macro-F1 en sentence_1 | 62,36 |
| Macro-F1 en sentence_5 | 86,84 |
| Macro-F1 en sentence_10 | 89,53 |
| Macro-F1 en sentence_50 | 92,44 |

Estos valores corresponden a la precisión media de atribución cuando se utilizan 1, 5, 10 o 50 oraciones consecutivas para decidir la autoría. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,18 mil millones de parámetros en bf16, el modelo ocupa aproximadamente 2,4 GB en memoria. En fp32 serían unos 4,7 GB. Una GPU con 6 GB de VRAM es suficiente para inferencia en bf16.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o superiores. Para entrenamiento se utilizaron 2 GPU GH200, pero no son necesarias para inferencia.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPU de consumo actuales (RTX 3060, RTX 4070, etc.) e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo con pesos en safetensors y formato HuggingFace, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa) o TGI. Para tareas de atribución por lotes, se recomienda vLLM por su mayor throughput.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia de decodificación de decenas de milisegundos por token en GPU modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-hesiod` (este) | OLMo-1B | 1,18B | No disponible | Other | Atribución de autoría (Hesíodo) |
| `sphragis-alm-olmo3-7b-plato` | OLMo-3-1025-7B | 7B | No disponible | Other | Atribución de autoría (Platón) |
| `allenai/OLMo-1B-hf` (base) | - | 1,18B | 2048 (conocido, no en la info) | Apache-2.0 | Modelo de lenguaje general |

La comparativa se limita a otros modelos del mismo autor y al modelo base, ya que no se dispone de información sobre alternativas de terceros para atribución de autoría en griego antiguo. El modelo de Platón, basado en OLMo-3-7B, es significativamente mayor y probablemente más capaz, pero ambos comparten la misma metodología y licencia restrictiva. El modelo base OLMo-1B es más versátil pero no está especializado en ningún autor.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con textos de Hesíodo, por lo que su representación del griego antiguo está fuertemente sesgada hacia el estilo de este autor. No es adecuado para tareas generales de procesamiento del griego antiguo.
- Riesgo de alucinación: al ser un modelo pequeño (1,18B) y entrenado con un corpus reducido (44.698 tokens), puede generar texto gramaticalmente plausible pero históricamente inexacto o inventado. No debe utilizarse para generar citas o reconstrucciones textuales sin verificación.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible, pero al derivar de OLMo-1B, probablemente sea de 2048 tokens. Para textos largos, es necesario dividirlos en oraciones o fragmentos.
- Restricciones de licencia: la licencia `other` se debe a que los textos de entrenamiento incluyen material con licencia CC BY-NC-SA, lo que impide el uso comercial del modelo. Cualquier proyecto comercial debe consultar el archivo `LICENSES.md` del dataset Sphragis antes de su uso.
- Sobreajuste: el entrenamiento se limita a 2 épocas, pero al ser un corpus tan pequeño, existe riesgo de sobreajuste a las oraciones concretas de entrenamiento, lo que podría afectar la generalización a textos no vistos del mismo autor.
- Dependencia del benchmark: el modelo está optimizado para funcionar dentro del ecosistema Sphragis (28 modelos, particiones específicas). Su uso fuera de este marco puede producir resultados inconsistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-hesiod
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Página de OLMo en AI2: https://allenai.org/olmo
- Perfil del autor en HuggingFace: https://huggingface.co/Urdatorn/models
- Artículo de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (no se proporciona URL directa)
