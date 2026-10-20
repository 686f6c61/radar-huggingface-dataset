# zhongweixie/PocketWorker-8B-ClawEval-GiGPO

## Resumen

PocketWorker-8B-ClawEval-GiGPO es un modelo multimodal de tipo imagen-texto-a-texto publicado por el usuario zhongweixie en Hugging Face, con 8.767.123.696 parámetros (aproximadamente 8,77 mil millones) y pesos en safetensors que ocupan 17,5 GB en el repositorio. Por la arquitectura declarada (`qwen3_vl`), el uso de la clase `Qwen3VLForConditionalGeneration` y la model card incluida, se trata de un derivado de Qwen3-VL-8B-Instruct, el modelo denso de visión-lenguaje de la familia Qwen3-VL de Alibaba. El repositorio no documenta el proceso de ajuste: la model card es la del modelo base, sin sección propia de datos, método ni evaluación.

El nombre del checkpoint sugiere un ajuste orientado a tareas de agente (evaluación tipo ClawEval) mediante GiGPO, un algoritmo de optimización de política con recompensa por grupos; sin embargo, esta interpretación procede únicamente de la nomenclatura del repositorio y no está confirmada en la información disponible. Es relevante ahora porque la base Qwen3-VL-8B-Instruct incorpora un contexto nativo de 256.000 tokens ampliable a 1 millón, soporte de video de larga duración, grounding 2D/3D y control de interfaces gráficas, capacidades que este checkpoint hereda y que lo sitúan en la franja de 8B apta para una sola GPU de 24 GB.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales sobre los pesos. El principal caveat es la ausencia total de validación pública: cero descargas, cero likes y ninguna métrica o dataset de ajuste descrito, por lo que debe tratarse como un experimento sin evaluar y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia Qwen3-VL, variante densa); vision encoder ViT con fusión DeepStack e Interleaved-MRoPE |
| Parametros totales | 8.767.123.696 (aproximadamente 8,77 mil millones) |
| Parametros activos | No aplica: variante densa, no MoE |
| Longitud de contexto | 256.000 tokens nativos, ampliable a 1.000.000 segun la model card |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors, presumiblemente bfloat16 por el tamano de 17,5 GB); no se publican GGUF ni cuantizaciones oficiales |
| Idiomas soportados | No disponible; la model card menciona OCR en 32 idiomas y capacidades multilingues, pero no enumera los idiomas del modelo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-VL en su variante densa de 8B: un transformer de lenguaje acoplado a un codificador visual ViT, con tres innovaciones declaradas en la model card. Interleaved-MRoPE distribuye las frecuencias de las embeddings posicionales entre tiempo, anchura y altura, lo que mejora el razonamiento sobre video de horizonte largo. DeepStack fusiona características de varias capas del ViT para retener detalle fino y afinar la alineación imagen-texto. La alineación texto-marca temporal sustituye a T-RoPE para localizar eventos con precisión de segundo en video.

Los detalles de entrenamiento del modelo base (número de tokens, composición del corpus, fases de preentrenamiento, SFT y RLHF/DPO) no se detallan en la información proporcionada: la model card remite a los informes técnicos de Qwen3 (arXiv:2505.09388) y Qwen2.5-VL (arXiv:2502.13923). El ajuste específico que produce este checkpoint —identificado como «ClawEval-GiGPO» en el nombre— no está documentado en absoluto: no se indica dataset, número de pasos, hiperparámetros, algoritmo de recompensa ni evaluación posterior. Cualquier afirmación sobre el proceso de ajuste sería especulativa.

## Capacidades

- Generación de texto y razonamiento multimodal: descripción de imágenes, respuesta a preguntas visuales y análisis de contenido gráfico.
- Comprensión de video de larga duración, con indexación a nivel de segundo y recuperación de información a lo largo de horas de metraje.
- OCR ampliado a 32 idiomas, con Robustez declarada frente a baja iluminación, desenfoque, inclinación, caracteres raros o antiguos y jerga técnica.
- Análisis de documentos largos: parseo de estructura en libros, informes y documentos multi-página.
- Percepción espacial: juicio de posiciones relativas, puntos de vista y oclusiones; grounding 2D y 3D para razonamiento espacial y IA encarnada.
- Agente visual: interpretación y operación de interfaces gráficas de escritorio y móviles, reconocimiento de elementos, comprensión de su función e invocación de herramientas.
- Generación de código a partir de imágenes o video (Draw.io, HTML/CSS/JS).
- Razonamiento STEM y matemático con análisis causal y respuestas basadas en evidencia.
- Reconocimiento visual amplio: personajes públicos, anime, productos, monumentos, flora y fauna.
- Capacidad de texto comparable a la de un LLM puro, segun la model card, gracias a la fusión texto-visión.
- Soporte de conversación multi-turno mediante plantilla de chat de transformers.
- No se documenta en este repositorio el soporte explícito de function calling estructurado ni un modo «thinking» separado; la variante Thinking es una edición distinta dentro de la familia Qwen3-VL.

## Casos de uso

- Automatización de atención al cliente con imágenes adjuntas: el cliente envía una captura de un error o de un recibo y el modelo extrae el texto mediante OCR en 32 idiomas y responde en el mismo hilo conversacional, aprovechando los 256.000 tokens de contexto para conservar todo el historial.
- Agente de operación de interfaz gráfica: dado un objetivo en lenguaje natural, el modelo localiza botones y campos, interpreta su función y emite la secuencia de acciones sobre una aplicación de escritorio o móvil; encaja en este rol por sus capacidades de grounding y de agente visual.
- Procesamiento de documentación técnica escaneada: digitalización de manuales, planos o informes con estructura compleja, incluyendo tablas y texto girado, y extracción de campos concretos mediante prompts estructurados.
- Análisis de video para control de calidad industrial: muestreo de grabaciones de varias horas con localización temporal de eventos anómalos, apoyándose en la alineación texto-marca temporal y en el contexto ampliable a 1 millón de tokens.
- Generación de prototipos de interfaz a partir de un boceto: el modelo produce HTML/CSS/JS o diagramas Draw.io desde una imagen o un fotograma de video, lo que reduce el trabajo de maquetación inicial en equipos de front-end.
- Asistencia en educación STEM: resolución de problemas de matemáticas y ciencias a partir de la foto del enunciado, con explicación del razonamiento y análisis causal de los pasos.
- Anotación y moderación de contenido visual a escala: clasificación y descripción de imágenes con vocabulario amplio (productos, especies, monumentos), integrable en un pipeline por lotes con transformers o vLLM.
- Experimentación en investigación sobre RL para agentes: al ser un checkpoint derivado de un proceso tipo GiGPO, sirve como punto de partida o de comparación en estudios de optimización de política, siempre que se valide su comportamiento de forma independiente.

## Benchmarks y rendimiento

La model card incluye dos gráficos de rendimiento (comparativa multimodal de las variantes 4B y 8B, y comparativa de texto puro) alojados como imágenes en el CDN de Qwen, pero no reproduce los valores numéricos en texto. No hay, por tanto, cifras extraíbles de MMLU, HumanEval, GSM8K, MMMU u otros benchmarks en la información proporcionada, y el ajuste específico de este repositorio no presenta ninguna evaluación propia.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: los pesos suman unos 17,5 GB; con el codificador visual, activaciones y caché KV conviene reservar entre 20 y 24 GB para contexto moderado.
- Cuantización a 8 bits: aproximadamente 9-10 GB de pesos, viable en GPUs de 16 GB con contexto recortado.
- Cuantización a 4 bits: aproximadamente 5-6 GB de pesos; requiere generar los GGUF o AWQ por cuenta propia, ya que el repositorio solo distribuye safetensors.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 permiten bfloat16 con contextos largos y procesamiento por lotes; para el contexto completo de 256K hacen falta varias GPU o paralelismo tensorial.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan el modelo en bfloat16 con FlashAttention 2 y contexto limitado; RTX 4080/4070 Ti Super (16 GB) necesitan cuantización a 8 bits; tarjetas de 12 GB solo con 4 bits y contextos cortos.
- Opciones de despliegue: transformers (recomendado building desde el código fuente, la model card indica que la clase Qwen3VL está en la rama principal y que la versión 4.57.0 aún no estaba publicada en el momento de escribirla), vLLM para servido con throughput alto, TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF. `endpoints_compatible` figura entre las etiquetas del repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PocketWorker-8B-ClawEval-GiGPO | 8,77B (denso) | 256K, ampliable a 1M | Apache 2.0 | Repositorio Hugging Face, 0 descargas, sin evaluaciones | Ajuste no documentado sobre Qwen3-VL-8B-Instruct |
| Qwen3-VL-8B-Instruct | 8,77B (denso) | 256K, ampliable a 1M | Apache 2.0 | Modelo oficial de Qwen, ampliamente distribuido | Base de este checkpoint; incluye gráficos de rendimiento y soporte de primera parte |
| Qwen2.5-VL-7B-Instruct | Aproximadamente 8,3B (denso) | 128K | Apache 2.0 | Modelo oficial de Qwen, muy descargado | Generación anterior; sin Interleaved-MRoPE ni DeepStack; OCR en 19 idiomas |
| Llama-3.2-11B-Vision-Instruct | Aproximadamente 10,7B (denso) | 128K | Licencia comunitaria Llama 3.2 | Modelo oficial de Meta | Requiere aceptar la licencia; sin soporte nativo de video largo |

No se dispone de datos de benchmarks comparativos numéricos para este checkpoint concreto, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación del ajuste: la model card es una copia de la de Qwen3-VL-8B-Instruct y no describe el dataset, el método ni la evaluación del checkpoint «ClawEval-GiGPO». No es posible saber qué comportamento se ha modificado respecto al modelo base.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de retroalimentación sobre calidad o estabilidad.
- Riesgo de olvido catastrófico o degradación de capacidades generales tras el ajuste, no verificable sin evaluaciones propias.
- Alucinación: como todo modelo de lenguaje y visión, puede inventar texto en imágenes borrosas, atribuir identidades erróneas o describir objetos ausentes; el riesgo es mayor en OCR de documentos degradados y en reconocimiento de personas.
- Sesgos: no se documenta ninguna evaluación de sesgo demográfico, cultural o lingüístico, ni del corpus de ajuste. El reconocimiento de personajes públicos y la descripción de personas conllevan riesgos de atribución incorrecta.
- Idiomas: la lista de idiomas soportados no está disponible; el rendimiento fuera de inglés y chino puede degradarse aunque el OCR cubra 32 idiomas.
- Contexto: los 256K tokens nativos implican un coste de caché KV elevado; el millón de tokens es una extensión que en la práctica exige hardware de gama alta y puede reducir la fidelidad de la recuperación.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que los términos del modelo base y de los datos de ajuste (no declarados) sean compatibles; al no documentarse el dataset, no se puede descartar contaminación con datos de licencia restrictiva.
- Producción: sin versión cuantizada oficial, sin pruebas de latencia y sin garantía de mantenimiento por parte del autor; no se recomienda su despliegue en entornos críticos sin una evaluación interna previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zhongweixie/PocketWorker-8B-ClawEval-GiGPO
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Demo de chat de Qwen: https://chat.qwenlm.ai/
