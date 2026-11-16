# spock-oss/sel-qwen-9b

## Resumen

SEL Qwen 9B (identificador `spock-oss/sel-qwen-9b`) es un adaptador LoRA de rango 32 acompañado de una cabeza densa de selección, construido sobre los pesos oficiales de Qwen/Qwen3.5-9B. No es un modelo generativo al uso: su tarea es devolver puntuaciones de relevancia alineadas con los tokens del texto original y con los parches de imagen de entrada. Dado un par formado por una pregunta y una fuente seleccionable (texto, imagen o ambos), el modelo produce una máscara de selección sobre la fuente mediante una única pasada forward del backbone.

El modelo lo desarrolla spock-oss y se publica con licencia MIT. El repositorio ocupa 0,4 GB, lo que corresponde únicamente al adaptador y la cabeza (88,65 millones de parámetros entrenables), no al backbone completo. La pipeline declarada en Hugging Face es `feature-extraction`, coherente con su función de puntuación y extracción de relevancia en lugar de generación de texto.

Su relevancia actual reside en plantear la selección de contexto como una tarea modelable de forma nativa: en lugar de pedir a un LLM que copie fragmentos relevantes, SEL aprende una cabeza que puntúa cada token o parche en una sola pasada. Esto lo hace útil para tareas de filtrado de contexto, recuperación fina, resaltado de evidencia y selección multimodal, con un coste de inferencia acotado por el límite de 2.048 tokens de secuencia total.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (backbone Qwen3.5-9B) con adaptador LoRA de rango 32 y cabeza densa de selección |
| Parámetros totales | No disponible (el adaptador y la cabeza suman 88,65 M parámetros entrenables; el backbone base es Qwen3.5-9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en total, incluyendo parches visuales y prompt |
| Tipos de cuantización | Backbone de lenguaje cuantizado a NF4 en tiempo de carga; codificador visual en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA y cabeza densa) |

## Arquitectura y entrenamiento

El modelo parte de los pesos oficiales de Qwen3.5-9B y añade un LoRA nuevo de rango 32 junto con una cabeza densa de selección. La arquitectura del backbone es híbrida: ocho capas de atención completa son bidireccionales, mientras que las 24 capas restantes, de tipo gated delta, permanecen direccionales. Esta combinación permite que la cabeza de selección agregue información en ambas direcciones sobre las capas de atención completa sin renunciar al procesamiento secuencial de las capas delta. El adaptador y la cabeza contienen 88,65 M parámetros entrenables.

El entrenamiento se realizó en dos épocas sobre 43,09 millones de tokens de entrada, con una tasa de aprendizaje de 1e-4 en la primera época y 1e-5 en la segunda. El cargador de SEL fija la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del backbone, cuantiza el backbone de lenguaje congelado a NF4 en el momento de la carga y mantiene el codificador visual en BF16. La innovación principal es el planteamiento de la selección como una forma de modelo: una sola pasada forward produce puntuaciones por token y por parche, en lugar de requerir generación autoregresiva de fragmentos.

## Capacidades

- Selección de texto: devuelve una máscara de relevancia alineada con los tokens del texto de entrada para una pregunta dada.
- Selección de imagen: puntúa parches visuales y devuelve una máscara de relevancia alineada con dichos parches.
- Selección mixta: acepta texto e imagen simultáneamente y produce puntuaciones sobre ambas fuentes.
- Puntuación de relevancia densa: genera puntuaciones continuas por unidad (token o parche), no solo una etiqueta binaria.
- Umbral configurable: cortes por defecto de 0,4 para texto y 0,3 para imagen y mixto, ajustables con `--threshold`.
- Reglas de tarea: la opción `--environment` permite añadir reglas específicas de la tarea en el prompt.
- Extracción de características: la pipeline declarada es `feature-extraction`, adecuada para integrarse en pipelines de recuperación o filtrado.
- No dispone de generación de texto libre, tool calling ni razonamiento multi-paso como tales; su salida es la máscara de selección.

## Casos de uso

- Resaltado de evidencia en documentos legales: dada una pregunta como "¿qué estado rige el acuerdo?", el modelo devuelve la máscara sobre los tokens del contrato que contienen la respuesta, útil para interfaces de revisión con trazabilidad de la evidencia.
- Filtrado de contexto para RAG: antes de pasar documentos a un LLM generativo, SEL puede puntuar y recortar los fragmentos relevantes de cada documento, reduciendo el número de tokens enviados al modelo de generación.
- Selección de regiones en imágenes: en flujos de inspección o análisis documental con OCR, el modelo puntúa parches de imagen para localizar la zona relevante ante una consulta textual.
- Construcción de datasets de instrucciones: la máscara de selección permite anotar automáticamente qué parte de un texto o imagen responde a una pregunta, acelerando la creación de datos supervisados.
- Evaluación de respuestas: comparar la máscara predicha con la evidencia esperada para medir la calidad de las respuestas de un sistema de QA.
- Enrutado de consultas en asistentes: usar la puntuación de relevancia para decidir si un documento o imagen contiene información suficiente antes de invocar un modelo mayor, ahorrando coste de inferencia.
- Análisis de contratos y pólizas: localizar cláusulas concretas (jurisdicción, plazos, penalizaciones) sobre textos largos divididos en ventanas de hasta 2.048 tokens.

## Benchmarks y rendimiento

| Conjunto | F1 medio | Coincidencia exacta de máscara |
|---|---:|---:|
| Run09 task test (3.136 ejemplos) | 77,6 % (macro por tarea) | 1.550/3.136 |
| Galería original de 26 tareas | 75,3 % | 15/26 |
| 100 problemas congelados | 55,3 % | 28/100 |
| Fuentes de desarrollo añadidas (17 × 64 ejemplos) | 79,9 % | 569/1.088 |

El benchmark congelado de 100 problemas utilizó los umbrales de la release; el resto de filas emplearon un corte de 0,5. Los resultados de fuentes añadidas miden selección alineada con la fuente sobre muestras de desarrollo preparadas. Los problemas con varias preguntas se evaluaron con una pregunta por pasada forward.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El backbone de lenguaje se carga cuantizado a NF4 y el codificador visual en BF16, lo que reduce el peso en memoria respecto a una carga completa en BF16, pero el repositorio solo contiene el adaptador y la cabeza (0,4 GB).
- GPU recomendadas: una GPU NVIDIA con soporte BF16; el autor indica ejecución en una sola GPU NVIDIA. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- GPU de consumo: no disponible. No se confirma que quepa en tarjetas consumer concretas.
- Despliegue: el flujo oficial es la herramienta `sel` del repositorio de GitHub (instalación con dependencias CUDA), con descarga de pesos vía `hf download` y ejecución mediante `sel predict`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor destaca una única pasada forward del backbone como ventaja de coste frente a enfoques generativos, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEL Qwen 9B | Adaptador de selección sobre Qwen3.5-9B | 88,65 M entrenables (backbone 9B) | 2.048 tokens | MIT | Hugging Face y GitHub |
| Qwen/Qwen3.5-9B | LLM generativo base | 9B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Otros modelos de selección de contexto | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Longitud de contexto limitada a 2.048 tokens en total, incluyendo parches visuales y prompt; documentos más largos requieren segmentación en ventanas.
- El modelo no genera texto: su salida es una máscara de selección, por lo que no sustituye a un LLM en tareas generativas.
- Los umbrales por defecto (0,4 texto, 0,3 imagen y mixto) condicionan el tamaño de la selección; un umbral inadecuado puede producir máscaras demasiado amplias o demasiado restrictivas.
- El rendimiento cae de forma notable en el conjunto de 100 problemas congelados (55,3 % de F1), lo que sugiere menor robustez ante problemas fuera de la distribución de entrenamiento.
- No se documentan sesgos conocidos ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la máscara puede seleccionar tokens irrelevantes o dejar fuera evidencia válida, especialmente con preguntas ambiguas.
- La licencia MIT permite uso comercial, pero el modelo depende del backbone Qwen3.5-9B, cuyas condiciones de uso deben verificarse por separado.
- El despliegue requiere dependencias CUDA y una GPU NVIDIA con soporte BF16; no se documentan alternativas de ejecución en CPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/spock-oss/sel-qwen-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código: https://github.com/spock-oss/sel
- Instalación de SEL: https://github.com/spock-oss/sel#install
- Artículo de investigación: https://spock.one/blog/selection-is-a-model-shape
