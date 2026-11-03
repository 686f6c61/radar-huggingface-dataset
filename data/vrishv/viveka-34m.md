# vrishv/Viveka-34M

## Resumen

Viveka-34M es un modelo de lenguaje causal en inglés entrenado desde cero por Vrishvardhan Sharma (usuario `vrishv`), un desarrollador autodidacta. Se trata de un modelo deliberadamente diminuto, con 33,9 millones de parámetros, disenado no para conversar ni para responder preguntas factuales, sino para juzgar frases: dada una tira de texto, estima su verosimilitud y permite discriminar entre variantes de una misma oración cuál es la más coherente. Su nombre proviene del sánscrito *viveka*, que significa discernimiento.

Arquitectura de estilo Llama (posiciones rotatorias, SwiGLU, RMSNorm) con 8 capas y anchura 512, tokenizador BPE a nivel de byte propio de 16.000 piezas y una ventana de contexto de solo 256 tokens. Se entrenó íntegramente en GPUs T4 gratuitas de Google Colab: 150 minutos iniciales desde inicialización aleatoria y 150 minutos adicionales en dos T4 con tasa de aprendizaje reducida, procesando 578 millones de tokens adicionales.

Su relevancia es doble. Por un lado, demuestra que es posible entrenar un modelo desde cero con recursos mínimos y obtener una herramienta útil para una tarea concreta (puntuación y ranking de oraciones, detección de perplejidad). Por otro, la versión v3 (noviembre de 2026) se entrenó únicamente con corpus de licencia abierta (FineWeb-Edu, Wikipedia y Project Gutenberg), lo que permite liberarla bajo CC BY-SA 4.0 con uso comercial permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de estilo Llama (RoPE, SwiGLU, RMSNorm), 8 capas, anchura 512 |
| Parametros totales | 33.890.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión media, safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (transformers); repo de 0,4 GB, pesos en FP16 de 68 MB |
| Tokenizador | BPE a nivel de byte propio, 16.000 piezas |
| Ventana de entrenamiento | 256 tokens |
| Datasets de entrenamiento | FineWeb-Edu, Wikipedia (en), Gutenberg English |

## Arquitectura y entrenamiento

El modelo sigue la receta de un transformer decoder-only de estilo Llama: atención con embeddings posicionales rotatorios (RoPE), capas feed-forward con activación SwiGLU y normalización RMSNorm. Con 8 capas y dimensión oculta de 512, el total asciende a 33,9 millones de parámetros. El tokenizador es propio (BPE a nivel de byte, 16.000 tokens), entrenado específicamente para este modelo, no reutilizado de otro.

El entrenamiento se realizó desde cero, con inicialización aleatoria, en una única GPU T4 de Colab durante 150 minutos; después se continuó durante otros 150 minutos en dos T4 con una tasa de aprendizaje menor, añadiendo 578 millones de tokens. Los datos proceden exclusivamente de tres fuentes de licencia abierta: FineWeb-Edu (páginas web educativas, ODC-BY), Wikipedia en inglés (CC BY-SA) y libros de dominio público de Project Gutenberg. La versión v3 eliminó el 10 % de texto IAM (handwriting) que sí estaba presente en v2, lo que permite relicenciar el modelo como CC BY-SA 4.0 en lugar de CC BY-NC 4.0. No se documenta uso de RLHF, DPO ni ajuste por instrucciones; es un modelo base de preentrenamiento.

## Capacidades

- Generación de texto causal en inglés, con calidad limitada a frases cortas y patrones lingüísticos comunes.
- Puntuación de oraciones (sentence scoring): calcula la perplejidad por palabra de un texto, útil como señal de fluidez o verosimilitud.
- Ranking de oraciones (sentence ranking): compara varias versiones de una frase y ordena cuál es más plausible.
- Juicio de sentido (sentence judge): en la prueba del autor, elige la oración coherente frente a una variante absurda (por ejemplo, "She drank a glass of cold water" frente a "cold window").
- Estimación de perplejidad como métrica de calidad textual.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe nula: solo inglés.
- No dispone de modo de pensamiento (thinking), visión ni audio.

## Casos de uso

- Filtrado de calidad de corpus: puntuar con perplejidad por palabra fragmentos de un dataset de preentrenamiento y descartar los de mayor perplejidad antes de entrenar un modelo mayor. Su tamaño permite ejecutarlo en CPU sobre millones de frases.
- Detección de texto incoherente o corrupto: en pipelines de limpieza de datos, comparar la perplejidad de un pasaje con la de su versión reconstruida para señalar errores de OCR o de segmentación.
- Ranking de candidatos en generación: dada una lista de continuaciones producidas por otro modelo, ordenarlas por verosimilitud según Viveka-34M como re-ranker ligero en un sistema de dos etapas.
- Corrección de líneas mal leídas por OCR: el autor ya derivó Shodhana-34M a partir de Viveka para esta tarea; el modelo base sirve como punto de partida para ajustes similares en dominios acotados.
- Enseñanza y demostración de entrenamiento de LLM: por su tamaño y su coste (minutos en una T4), es un caso práctico para explicar tokenización, perplejidad y arquitectura transformer en cursos o talleres.
- Evaluación de gramática y fluidez en herramientas de escritura: integrarlo como comprobador local de que una frase propuesta por un usuario es gramatical y natural en inglés, sin depender de una API externa.
- Enrutamiento ligero de consultas: el autor ya publicó `router-34M` derivado de Viveka para decidir qué modelo offline debe responder; el modelo base puede ajustarse para clasificaciones de texto muy simples.

## Benchmarks y rendimiento

Los únicos datos publicados son los del autor en la model card, medidos sobre frases y pasajes no vistos durante el entrenamiento. No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar.

| Metrica | Viveka v1 | Viveka v2 | Viveka v3 (esta version) |
|---|---|---|---|
| Perplejidad por palabra (20 frases nuevas) | 233,8 | 176,9 | 137,3 |
| Prueba de sentido (12 ítems) | 12/12 | 12/12 | 12/12 |

| Perplejidad por palabra en texto retenido | Viveka v2 | Viveka v3 |
|---|---|---|
| Web (FineWeb-Edu) | 193,7 | 144,2 |
| Libros (Gutenberg) | 887,8 | 530,9 |
| Wikipedia | 330,4 | 209,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en FP16 (68 MB de pesos más caché de activaciones y KV); en FP32, alrededor de 140 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en T4, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad. También es viable en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las integradas con memoria compartida.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; al ser un modelo pequeño, también es convertible a GGUF para llama.cpp u Ollama, aunque el autor no publica esos formatos.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño (33,9 M de parámetros y 256 tokens de contexto), la latencia esperada es de milisegundos en GPU y de decenas de milisegundos en CPU para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Viveka-34M | 33,9 M | 256 | en | CC BY-SA 4.0 | Puntuación y juicio de oraciones, entrenado desde cero |
| Shodhana-34M (mismo autor) | 33,9 M | 256 | en | no disponible en la información | Corrección de líneas de OCR, derivado de Viveka |
| router-34M (mismo autor) | 33,9 M | 256 | en | no disponible en la información | Enrutamiento entre modelos offline, derivado de Viveka |
| thinker-34M (mismo autor) | 33,9 M | 256 | en | no disponible en la información | Decisión de si una consulta requiere razonamiento, derivado de Viveka |

No se dispone de datos de benchmarks comparativos con modelos de terceros de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo muy pequeño: conoce gramática y frases comunes, pero tiene un conocimiento del mundo mínimo; no es fiable para responder preguntas factuales ni para mantener una conversación.
- Contexto de solo 256 tokens: no admite documentos largos ni conversaciones multi-turno extensas.
- Solo inglés; no procesa otros idiomas.
- Riesgo de reproducir sesgos y lenguaje anticuado presentes en FineWeb-Edu, Wikipedia y, especialmente, en los libros de Gutenberg.
- Riesgo de alucinación alto en cualquier tarea generativa abierta; su uso previsto es la puntuación y el juicio, no la generación libre.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia (share-alike). Conviene revisar esta cláusula antes de integrarlo en productos propietarios.
- Las versiones anteriores (v1 y v2, con licencia CC BY-NC 4.0 y texto IAM) siguen en el historial del repositorio; hay que asegurarse de descargar la revisión v3 si se necesita la licencia permisiva.
- No hay datos publicados sobre cuantizaciones, latencia ni throughput en producción.
- El autor es un desarrollador individual sin infraestructura de soporte; no hay garantías de mantenimiento ni de parches de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vrishv/Viveka-34M
- Perfil del autor: https://huggingface.co/vrishv
- Web del autor: https://vrishvardhan.in
- Shodhana-34M (derivado para corrección de OCR): https://huggingface.co/vrishv/Shodhana-34M
- router-34M (derivado para enrutamiento): https://huggingface.co/vrishv/router-34M
- thinker-34M (derivado para decisión de razonamiento): https://huggingface.co/vrishv/thinker-34M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Gutenberg English: https://huggingface.co/datasets/sedthh/gutenberg_english
- Dataset Wikipedia (en): https://huggingface.co/datasets/wikimedia/wikipedia
- Space graphics-studio: https://huggingface.co/spaces/vrishv/graphics-studio
- Dataset Jigyasa Simple: https://huggingface.co/datasets/vrishv/jigyasa-simple
- Dataset Jigyasa Medium: https://huggingface.co/datasets/vrishv/jigyasa-medium
- Dataset Jigyasa Big: https://huggingface.co/datasets/vrishv/jigyasa-big
- Hindi Vardhan: https://hindivardhan.in
