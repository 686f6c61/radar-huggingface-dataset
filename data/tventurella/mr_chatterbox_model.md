# tventurella/mr_chatterbox_model

## Resumen

Mr. Chatterbox es un modelo de lenguaje entrenado íntegramente desde cero sobre un corpus de más de 28.000 textos británicos de la época victoriana publicados entre 1837 y 1899, procedentes del dataset de libros de la British Library. Lo desarrolla el usuario tventurella y su rasgo distintivo es que no ha recibido ninguna entrada de preentrenamiento posterior a 1899: su vocabulario y su marco conceptual se forman exclusivamente a partir de literatura del siglo XIX.

El modelo tiene aproximadamente 340 millones de parámetros, un tamaño comparable al de GPT-2-Medium, y se entrenó con Nanochat, la herramienta de Andrej Karpathy. El corpus de entrenamiento consta de 28.035 libros con unos 2.930 millones de tokens de entrada tras el filtrado. El resultado es un chatbot de carácter victoriano, concebido como experimento de generación de lenguaje con un registro histórico coherente más que como asistente de propósito general.

Es relevante ahora sobre todo como referencia histórica dentro de su propia familia: el autor ha publicado con posterioridad una nueva generación de modelos Mr. Chatterbox (de 345M, 500M, 1.2B y 2.7B parámetros) entrenados desde cero sobre un corpus mucho mayor. Este modelo, publicado originalmente en marzo de 2026, se mantiene disponible para referencia y comparación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (entrenado con Nanochat) |
| Parametros totales | ~340 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Se trata de un modelo denso de tipo transformer decoder-only (~340M parámetros), entrenado con el marco Nanochat de Andrej Karpathy. El preentrenamiento se realizó sobre un corpus de 28.035 libros de la colección de la British Library (dataset `TheBritishLibrary/blbooks`), publicados entre 1837 y 1899, con un total estimado de 2.930 millones de tokens de entrada después del filtrado. No se especifica la composición exacta del dataset ni el número de épocas de preentrenamiento en la información disponible.

El ajuste posterior consistió en dos épocas de fine-tuning supervisado (SFT) y una época adicional de SFT reducida para cubrir casos límite. Según la model card, las conversaciones de ajuste de este modelo se generaron con respuestas victorianas sintéticas escritas por otro modelo, a diferencia de la familia sucesora, en la que cada respuesta procede de texto auténtico del siglo XIX. El tokenizador es el BPE de Nanochat. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con registro y vocabulario propios de la prosa victoriana.
- Conversación multi-turno en formato de chatbot, con una persona fija de "caballero victoriano".
- Estilización de texto: redacción de cartas, narraciones y diálogos imitando la prosa del siglo XIX.
- Reproducción de ideas, modismos y marco cultural anteriores a 1900, al no haber visto datos posteriores.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Generación de prosa en registro victoriano: el modelo produce texto con vocabulario y sintaxis del siglo XIX, útil para escribir cartas, relatos o diálogos ambientados en la época.
- Investigación en humanidades digitales: sirve como objeto de estudio sobre cómo un modelo formado solo con literatura de 1837-1899 reproduce patrones léxicos y conceptuales del periodo.
- Chatbot de personaje histórico: su persona de "caballero victoriano" encaja en experiencias conversacionales de roleplay o divulgación ambientadas en el siglo XIX.
- Creación literaria y escritura creativa: puede usarse como asistente de estilo para autores que buscan una voz decimonónica reconocible.
- Educación y divulgación: demostración didáctica de cómo el corpus de entrenamiento determina el vocabulario y los sesgos de un modelo, útil en cursos de NLP.
- Generación de datos sintéticos con estilo histórico: puede producir texto etiquetable como "victoriano" para aumentar datasets de estilo antes de pasar por una revisión humana.
- Experimentación con modelos pequeños: al ser un modelo de ~340M accesible y de pesos abiertos, resulta adecuado para probar pipelines de fine-tuning, cuantización o evaluación en hardware modesto.

## Benchmarks y rendimiento

Solo se dispone de la evaluación de comportamiento propia del proyecto, compuesta por 1.356 prompts y puntuada por un juez LLM según adecuación de la respuesta, ajuste al comportamiento esperado y registro de época. Esta evaluación no comprueba exactitud factual.

| Modelo | Evaluación de comportamiento (1.356 prompts) |
|---|---|
| mr_chatterbox_model (este modelo) | 0,655 |
| Mr.Chatterbox-2.7B-Chat (sucesor) | 0,741 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni equivalentes).

## Requisitos de hardware

- VRAM estimada para inferencia (estimación teórica a partir de los ~340M parámetros, no confirmada por el autor): aproximadamente 0,7 GB en FP16, 0,35 GB en INT8 y 0,2 GB en INT4.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4090, e incluso en CPU, dado el reducido tamaño del modelo.
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrían sentido para entrenamiento o ajuste fino a gran escala.
- Opciones de despliegue: el modelo se entrenó con Nanochat, por lo que la inferencia natural es a través de ese marco. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI al no documentarse el formato de pesos ni conversiones a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mr_chatterbox_model | ~340M | no disponible | MIT | Pesos en HuggingFace | Entrenado solo con datos previos a 1900 |
| GPT-2-Medium | ~355M | 1024 tokens | MIT modificada | Pesos abiertos | Referencia de tamaño citada por el autor; preentrenado con datos generales |
| Mr.Chatterbox-2.7B-Chat | 2,7B | no disponible | no disponible | Pesos en HuggingFace | Sucesor del mismo proyecto; 0,741 en la evaluación de comportamiento |

La comparación de rendimiento con alternativas de propósito general no es posible porque no se han publicado métricas estándar para este modelo.

## Limitaciones y advertencias

- Riesgo de alucinación: el modelo no está diseñado para exactitud factual y su evaluación de comportamiento no la comprueba; puede afirmar datos históricos falsos con seguridad.
- Sesgos históricos: al formarse solo con textos británicos de 1837-1899, es previsible que reproduzca actitudes de la época en materia de raza, género, clase social y colonialismo.
- Cobertura idiomática restringida al inglés; no se declaran capacidades en otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar usos que requieran ventanas amplias.
- Formato de pesos no especificado: no se confirma su carga directa en runtimes habituales (llama.cpp, vLLM, Ollama) sin conversión previa.
- Licencia MIT, que en principio permite uso comercial, pero la procedencia del corpus (British Library, dataset `blbooks`) conviene verificarla antes de explotarlo en producción.
- Modelo pequeño (~340M) y con corpus muy especializado: no es adecuado como asistente general, para código, matemáticas o tareas de razonamiento complejo.
- Existe una familia sucesora con mejor rendimiento en la evaluación del propio proyecto; para nuevos desarrollos conviene evaluar los modelos más recientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tventurella/mr_chatterbox_model
- Dataset de la British Library: https://huggingface.co/datasets/TheBritishLibrary/blbooks
- Repositorio del proyecto: https://github.com/tripv/mr.chatterbox
- Sucesores: https://huggingface.co/tventurella/Mr.Chatterbox-345M
