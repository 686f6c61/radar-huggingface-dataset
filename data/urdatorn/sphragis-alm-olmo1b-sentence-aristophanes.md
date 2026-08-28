# Urdatorn/sphragis-alm-olmo1b-sentence-aristophanes

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-aristophanes` es un modelo de lenguaje autoría (authorial language model, ALM) desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre los textos de Aristófanes, con el objetivo de medir la perplejidad de un texto dado bajo la hipótesis de que fue escrito por ese autor concreto. La técnica sigue el método de Huang, Murakami y Grieve (2025), donde cada autor del corpus recibe un modelo propio y la atribución se realiza asignando cada texto al modelo que lo encuentra menos sorprendente.

El modelo tiene 1.176.764.416 parámetros (1,1 mil millones) y está entrenado exclusivamente con datos en griego antiguo (código `grc`). Forma parte de un conjunto de 28 modelos, uno por autor, y su licencia es `other` debido a las licencias mixtas de los textos fuente, que incluyen material CC BY-NC-SA. Su relevancia radica en que ofrece una herramienta especializada para la investigación filológica y estilométrica, permitiendo atribuir autoría con una precisión notable en textos fragmentarios o de autoría dudosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de OLMo-1B, no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder causal de 1.1 mil millones de parametros desarrollado por el AI2. Sobre esta base se realiza un further-pretraining completo (no un adaptador) utilizando exclusivamente las filas de entrenamiento correspondientes a Aristofanes dentro del benchmark Sphragis: 1.450 filas y 49.240 tokens puntuados de la particion `sentence_1`. El objetivo de entrenamiento es modelado de lenguaje causal sobre secuencias con el formato `<|endoftext|> sentence <|endoftext|>`, una frase por secuencia.

La seleccion de hiperparametros se hizo mediante ascenso por coordenadas sobre la atribucion en validacion, no sobre la perplejidad del propio autor, porque lo que interesa es que el modelo distinga mejor a su autor frente a los demas. Se entrenaron 2 epocas con una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 frases, pesos maestros en fp32, computo en bf16 y particionado FSDP completo sobre 2x GH200. Los pesos finales se guardaron en bf16. A diferencia del metodo original de Huang y colegas (100 epocas fijas), aqui la duracion del entrenamiento se decide por evidencia retenida.

## Capacidades

- Generacion de texto en griego antiguo, aunque su uso principal no es la generacion sino la evaluacion de perplejidad.
- Calculo de log-verosimilitud negativa por token para puntuar frases y comparar entre modelos de autor.
- Atribucion de autoria: dado un texto, se compara la perplejidad entre los 28 modelos del conjunto Sphragis y se asigna al autor cuyo modelo lo puntue como menos sorprendente.
- Especializacion en el estilo de Aristofanes: captura patrones lexicos, sintacticos y metricos propios de sus obras.
- No dispone de tool calling, ni capacidades multimodales, ni razonamiento general fuera del dominio filologico.

## Casos de uso

- Atribucion de autoria en textos griegos antiguos de autoria dudosa: se puntua cada frase con este modelo y con los otros 27 del conjunto, y se asigna el texto al autor con menor perplejidad media. Es util para comedias fragmentarias o piezas atribuidas tradicionalmente a Aristofanes pero cuestionadas.
- Analisis estilometrico comparativo: permite cuantificar la distancia estilistica entre Aristofanes y otros autores del corpus Sphragis, por ejemplo para estudiar influencias o interpolaciones en obras transmitidas.
- Autenticacion de fragmentos papiraceos: cuando se descubre un nuevo fragmento, se puede evaluar si su estilo es consistente con Aristofanes frente a otros candidatos, ayudando en la edicion critica.
- Investigacion sobre metrica y prosodia: al estar entrenado sobre frases completas, el modelo captura patrones ritmicos propios del autor, lo que permite estudiar la relacion entre metro y autoria.
- Validacion de ediciones digitales: los editores pueden usar el modelo como una herramienta de control de calidad para detectar pasajes que se desvian del estilo esperado en una obra atribuida.
- Ensenanza e investigacion en filologia computacional: sirve como ejemplo de aplicacion de modelos de lenguaje a tareas de estilometria clasica, con codigo de entrenamiento y puntuacion disponible en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la informacion disponible. Sin embargo, la model card indica que el conjunto completo de 28 modelos alcanza los siguientes resultados de macro-F1 en el test de Sphragis:

| Particion | Macro-F1 |
|---|---|
| sentence_1 | 62.36 |
| sentence_5 | 86.84 |
| sentence_10 | 89.53 |
| sentence_50 | 92.44 |

Estos valores corresponden al rendimiento agregado del conjunto, no a este modelo en particular. No se dispone de datos de MMLU, HumanEval u otros benchmarks generales, ya que el modelo no esta disenado para tareas genericas.

## Requisitos de hardware

- Inferencia en bf16: aproximadamente 2,4 GB de VRAM (1,18 mil millones de parametros × 2 bytes), mas overhead de activaciones y cache. Cabe en cualquier GPU consumer moderna con 4 GB o mas.
- Con cuantizacion de 8 bits: alrededor de 1,2 GB de VRAM; con 4 bits, unos 0,6 GB. Aunque no se proporcionan cuantizaciones oficiales, el formato safetensors permite aplicar cuantizacion posterior con herramientas como llama.cpp o bitsandbytes.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050, RTX 4090) es suficiente para inferencia. El entrenamiento original uso 2x GH200, pero no es necesario para uso inferencial.
- Opciones de despliegue: al ser un modelo de investigacion, se puede cargar con la libreria `transformers` de Hugging Face, o exportar a GGUF para usarlo con llama.cpp u Ollama. Tambien es compatible con vLLM para inferencia de alto rendimiento, aunque no es un caso tipico.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 1B, se espera una latencia de decenas de milisegundos por token en una GPU moderna, y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-sentence-aristophanes | 1,18 B | no disponible | other | ALM para Aristofanes (griego antiguo) |
| Urdatorn/sphragis-alm-olmo3-7b-aristophanes | 7 B (estimado) | no disponible | other | ALM para Aristofanes con base OLMo-3-7B |
| allenai/OLMo-1B-hf | 1,18 B | 2048 (segun documentacion de OLMo) | Apache-2.0 | Modelo base general en ingles |

La comparativa directa con otros ALMs del mismo benchmark no es posible sin datos individuales de rendimiento. La variante con OLMo-3-7B, mencionada en la busqueda web, es un modelo mas grande del mismo autor y proposito, pero no se dispone de sus metricas especificas. Frente al base OLMo-1B, este modelo esta especializado en griego antiguo y en el estilo de Aristofanes, por lo que su perplejidad en textos de ese autor sera mucho menor, aunque su utilidad fuera de ese dominio es practicamente nula.

## Limitaciones y advertencias

- Es un modelo de proposito muy especifico: solo es util para atribucion de autoria en el marco del benchmark Sphragis. No sirve para generacion de texto general, traduccion, ni tareas de NLP convencionales.
- Entrenado exclusivamente con textos de Aristofanes: puede presentar sobreajuste al corpus concreto, y su comportamiento en textos de otros autores o variantes dialectales del griego antiguo no es fiable.
- La licencia `other` implica restricciones: los textos fuente incluyen material CC BY-NC-SA, por lo que el uso comercial del modelo puede estar limitado. Es necesario revisar el archivo `LICENSES.md` del dataset antes de cualquier reutilizacion.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa fuera de su funcion de puntuacion. No se recomienda su uso para generar citas o reconstrucciones textuales sin verificacion.
- No se han publicado evaluaciones de sesgos o robustez. Al estar entrenado sobre un corpus literario antiguo, puede reflejar sesgos de transmision textual (por ejemplo, mayor representacion de ciertas obras o ediciones).
- La longitud de contexto no esta documentada en la ficha del modelo; se hereda de OLMo-1B (2048 tokens segun la documentacion del base), pero no se ha verificado en este ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-aristophanes
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Codigo de entrenamiento, puntuacion y atribucion: https://github.com/Urdatorn/sphragis_models
- Perfil del autor en Hugging Face: https://huggingface.co/Urdatorn
- Paper de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081. DOI no proporcionado en la informacion disponible.
