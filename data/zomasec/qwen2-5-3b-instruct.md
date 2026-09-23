# zomasec/Qwen2.5-3B-Instruct

## Resumen

El repositorio `zomasec/Qwen2.5-3B-Instruct` es una publicación de terceros (autor `zomasec`) que contiene una variante del modelo Qwen2.5-3B-Instruct desarrollado por el equipo Qwen de Alibaba Cloud. Según los metadatos de HuggingFace, el modelo base declarado es `Qwen/Qwen2.5-3B` con tipo de relación "finetune", y la model card incluida reproduce literalmente la ficha oficial de Qwen2.5-3B-Instruct, sin documentar qué modificación, ajuste o reempaquetado ha realizado el autor sobre los pesos originales. Se trata, por tanto, de una ficha que describe la familia Qwen2.5 y este tamaño concreto, con la advertencia de que la procedencia exacta de los pesos no está documentada por el autor.

El modelo es un transformer causal decoder-only de 3.085.938.688 parámetros totales (2,77B no pertenecientes a los embeddings), con 36 capas, atención GQA (16 cabezas de consulta y 2 de clave/valor) y embeddings de palabras atados. Está entrenado en dos fases (preentrenamiento y post-entrenamiento) sobre un corpus de hasta 18 billones de tokens de Alibaba, y su model card declara una longitud de contexto completa de 32.768 tokens con generación de hasta 8.192 tokens, aunque el texto introductorio de la misma ficha menciona soporte de hasta 128K tokens, lo que supone una discrepancia interna que conviene verificar.

Su relevancia práctica reside en el segmento de 3B: es un tamaño que cabe en GPU de consumo con cuantización agresiva, se puede ejecutar en CPU con llama.cpp u Ollama, y está pensado para tareas de instrucciones, generación de JSON, comprensión de tablas y soporte multilingüe. La limitación principal para uso profesional es la licencia `qwen-research`, que no es una licencia de código abierto y restringe el uso comercial, además del escaso historial del repositorio (200 descargas, 0 likes) frente al repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, sesgo QKV en atención y embeddings de palabras atados (tied word embeddings) |
| Parametros totales | 3.085.938.688 (3,09B); 2,77B no pertenecientes a embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens completos y 8.192 tokens de generación según la model card; el texto introductorio de la misma ficha y las referencias web de la familia citan hasta 128K tokens (dato contradictorio, no confirmado para esta variante) |
| Tipos de cuantizacion | Pesos publicados en safetensors (precisión original, presumiblemente bf16); cuantizaciones GGUF de terceros disponibles a través de Ollama y llama.cpp (Q4_K_M, Q5_K_M, Q8_0, etc.); no se documentan cuantizaciones propias en este repositorio |
| Idiomas soportados | La model card de la familia declara más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros); los metadatos de este repositorio solo declaran `en` |
| Licencia | `other` / `qwen-research` (enlace a la licencia oficial de Qwen; no es una licencia de código abierto aprobada por la OSI) |
| Formato de pesos | safetensors (repositorio de 6,2 GB), cargables con `transformers`; conversiones GGUF de terceros disponibles |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo causal, con 36 capas, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) para la codificación posicional y atención con query-key-value bias. La atención usa Grouped Query Attention con 16 cabezas de consulta y 2 cabezas de clave/valor, lo que reduce el coste de memoria de la caché KV durante la generación. Los embeddings de entrada y la cabeza de salida están atados, lo que rebaja el recuento efectivo de parámetros no-embedding a 2,77B. Según los resultados de búsqueda, la familia Qwen2.5 se preentrenó sobre un conjunto de datos a gran escala de Alibaba de hasta 18 billones de tokens, con modelos expertos especializados en código y matemáticas, seguido de una fase de post-entrenamiento (instrucciones) sobre la que la model card no detalla la composición exacta ni si se emplearon RLHF, DPO u otras técnicas de alineamiento.

Las innovaciones que la propia ficha destaca respecto a Qwen2 son: mayor conocimiento factual, mejoras sustanciales en código y matemáticas, mejor seguimiento de instrucciones, generación de textos largos por encima de 8K tokens, comprensión de datos estructurados como tablas, generación de salidas estructuradas (especialmente JSON) y mayor robustez frente a la diversidad de system prompts, lo que favorece implementaciones de role-play y chatbots con condicionamiento. No se documenta en esta información ninguna técnica de decodificación especulativa ni mecanismos de atención lineal o híbrida. El modelo requiere `transformers >= 4.37.0` para reconocer la arquitectura `qwen2`.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y soporte de mensajes de sistema, usuario y asistente.
- Razonamiento, conocimiento general y respuesta a instrucciones, con mejoras declaradas frente a Qwen2 en seguimiento de instrucciones.
- Generación de código y resolución de problemas matemáticos, apoyadas en modelos expertos especializados durante el entrenamiento.
- Comprensión y generación de datos estructurados: tablas, JSON y otras salidas con formato rígido.
- Generación de textos largos, por encima de 8K tokens según la documentación de la familia.
- Capacidades multilingües declaradas para más de 29 idiomas en la ficha de la familia, aunque los metadatos de este repositorio concreto solo etiquetan inglés.
- Uso como base para role-play y condicionamiento de comportamiento mediante system prompts diversos.
- Compatibilidad declarada con `text-generation-inference` y con `endpoints_compatible` (etiqueta de HuggingFace), lo que facilita su despliegue en infraestructura gestionada.
- No se documenta soporte de tool calling o function calling nativo, ni capacidades de visión, audio o modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente conversacional on-premise: con 3,09B de parámetros, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU con cuantización de 4 bits y gestionar diálogos multi-turno con hasta 32.768 tokens de contexto, lo que permite mantener el historial completo de conversaciones largas sin truncar.
- Generación de código en entornos locales: su especialización declarada en código y su tamaño reducido lo hacen adecuado para asistentes de autocompletado dentro del IDE, donde la latencia y el coste por token importan más que la calidad máxima; puede integrarse en un servidor local compatible con la API de OpenAI mediante vLLM o llama.cpp.
- Extracción de datos estructurados: la mejora declarada en generación de JSON y comprensión de tablas permite usarlo para convertir facturas, informes o tablas HTML en esquemas JSON validables, con la ventaja de que a 3B el coste de ejecutar muchas llamadas en paralelo es bajo.
- Clasificación y enrutado de tickets de soporte: el modelo puede etiquetar y clasificar consultas entrantes devolviendo categorías en formato estructurado, y su robustez frente a distintos system prompts facilita definir taxonomías y criterios por cliente sin reentrenar.
- Resumen de documentos largos: con 32.768 tokens de contexto puede resumir informes anuales, actas de reuniones o hilos de correo completos en una sola pasada, algo que modelos de 1,5B o menos no cubren con la misma ventana.
- Agentes de automatización de tareas internas: puede encadenarse en flujos multi-paso que requieran interpretar una petición, reformularla y producir la siguiente acción en texto o JSON, siempre que el orquestador implemente el enrutado de herramientas, ya que no se documenta tool calling nativo.
- Base para fine-tuning de dominio: al ser un modelo denso de 3B, es viable ajustarlo con LoRA o QLoRA en una única GPU de 24 GB y especializarlo en jerga sectorial (legal, sanitario, industrial) partiendo de los pesos safetensors.
- Prototipado y evaluación offline: sirve para validar prompts, plantillas de chat y pipelines completos en un portátil antes de escalar a modelos mayores, reduciendo el coste de iteración.
- Traducción automática ligera: la ficha de la familia declara cobertura de más de 29 idiomas, lo que permite usarlo para traducción de textos cortos y medios en despliegues con restricciones de privacidad, siempre verificando la calidad real por par de idiomas.
- Role-play y generación de personajes: su adaptación declarada a system prompts diversos lo hace utilizable en aplicaciones de entretenimiento o formación con personajes condicionados, donde el coste por sesión debe ser mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a remitir a la entrada de blog del equipo Qwen para los resultados detallados de evaluación y a la página de benchmarks de velocidad para los requisitos de memoria de GPU y throughput, pero no reproduce ninguna cifra (MMLU, HumanEval, GSM8K, etc.) en el repositorio ni en los extractos de búsqueda disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, no publicados en la información disponible): aproximadamente 7-8 GB en bf16/fp16 (pesos de 6,2 GB más caché KV), en torno a 3,5-4 GB en cuantización de 8 bits y aproximadamente 2-2,5 GB en cuantización de 4 bits (Q4_K_M).
- GPU recomendadas: para bf16, tarjetas con 8-12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4); para cuantización de 4 bits, cualquier GPU con 4 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 6 GB o más de VRAM usando cuantización; en bf16 requiere al menos 8 GB de VRAM libre.
- Memoria unificada: viable en Apple Silicon con 16 GB o más mediante llama.cpp u Ollama.
- CPU: ejecutable en CPU con llama.cpp y cuantizaciones GGUF, con latencias notablemente superiores.
- Opciones de despliegue: `transformers` (librería declarada en los metadatos), vLLM, Text Generation Inference (etiqueta `text-generation-inference`), llama.cpp, Ollama (existe una entrada `qwen2.5:3b-instruct` en el catálogo de Ollama) y servicios compatibles con endpoints de HuggingFace. La etiqueta `endpoints_compatible` sugiere compatibilidad con la API de mensajes tipo OpenAI.
- Latencia y throughput: no disponible. La ficha remite a la página de benchmarks de velocidad de la documentación de Qwen, pero no se han proporcionado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zomasec/Qwen2.5-3B-Instruct (esta ficha) | 3,09B | 32.768 tokens según model card; hasta 128K citado en la familia | qwen-research | HuggingFace, safetensors |
| Qwen/Qwen2.5-3B-Instruct (oficial) | 3,09B | 32.768 tokens según model card | qwen-research | HuggingFace, safetensors, integraciones de terceros |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (ficha oficial) | Apache 2.0 (ficha oficial) | HuggingFace, GGUF, Ollama |
| Qwen/Qwen2.5-7B-Instruct | 7,62B | 128K tokens (ficha oficial) | Apache 2.0 (ficha oficial) | HuggingFace, GGUF, Ollama, vLLM |
| Llama-3.2-3B-Instruct | 3,21B | 128K tokens (ficha oficial) | Licencia comunitaria de Llama 3.2 | HuggingFace, GGUF, Ollama |

Nota: los datos de los modelos competidores proceden de sus fichas oficiales y se incluyen como referencia; conviene verificarlos antes de tomar decisiones de licenciamiento. No se dispone de cifras comparativas de rendimiento (MMLU, HumanEval, GSM8K) en la información proporcionada para ninguno de ellos. La diferencia más relevante de esta publicación frente al repositorio oficial es la licencia y la trazabilidad: el repositorio oficial de Qwen2.5-3B-Instruct también usa la licencia `qwen-research`, mientras que los tamaños 1.5B y 7B de la misma familia se distribuyen bajo Apache 2.0, lo que suele decantar la elección hacia esos tamaños en proyectos comerciales.

## Limitaciones y advertencias

- Licencia `qwen-research`: no es una licencia de código abierto aprobada por la OSI y restringe el uso comercial según los términos enlazados en la propia model card; es imprescindible revisar el texto completo antes de cualquier despliegue productivo.
- Procedencia no documentada: se trata de una publicación de terceros (`zomasec`) con 200 descargas y 0 likes, cuyo modelo base declarado es `Qwen/Qwen2.5-3B` con relación "finetune", pero sin explicar qué ajuste se ha aplicado. La model card es una copia de la ficha oficial, por lo que no certifica el contenido real de los pesos.
- Riesgo de alucinación: inherente a todos los modelos de esta escala; con solo 2,77B de parámetros no-embedding, la tasa de errores factuales es mayor que en modelos de 7B o superiores, especialmente en dominios especializados.
- Discrepancia en la longitud de contexto: la model card indica 32.768 tokens para el modelo y 128K en su introducción; hasta no verificarlo, conviene planificar despliegues asumiendo 32.768 tokens.
- Idiomas: aunque la familia declara más de 29 idiomas, los metadatos de este repositorio solo etiquetan `en`; el rendimiento real en español y otros idiomas distintos del inglés y el chino debe validarse empíricamente.
- Sin tool calling nativo documentado: para flujos de agentes hay que implementar el parseo de llamadas a herramientas en el orquestador, ya que no se declara soporte de function calling.
- Sin benchmarks publicados: no hay cifras verificables de rendimiento en la información disponible, lo que impide comparar objetivamente con alternativas.
- Restricciones de producción: el repositorio no documenta versión de tokenizador, hashes de los archivos, ni proceso de validación; en entornos regulados esto complica la trazabilidad y la auditoría del modelo.
- Fecha de creación del repositorio en los metadatos (2026-09-23) y ausencia de actualizaciones posteriores: conviene comprobar que los archivos no han sido modificados y que la descarga corresponde a lo esperado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zomasec/Qwen2.5-3B-Instruct
- Modelo oficial Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base oficial Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia de Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Entrada en Ollama de qwen2.5:3b-instruct: https://ollama.com/library/qwen2.5:3b-instruct
- Artículo técnico de Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
- Ficha temática en emergentmind: https://www.emergentmind.com/topics/qwen2-5-3b-instruct
- Copia del repositorio en GitHub (mx4ai): https://github.com/mx4ai/qwen2.5
