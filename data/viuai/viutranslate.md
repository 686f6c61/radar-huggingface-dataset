# ViuAI/ViuTranslate

## Resumen

ViuTranslate-500M es un modelo de traducción automática neuronal (NMT) bilingüe desarrollado por ViuAI, específicamente diseñado para la traducción bidireccional entre inglés e hindi (devanagari). Se basa en la arquitectura Sarus-500M, un transformer decoder-only con atención de consultas agrupadas (GQA) y 500.642.560 parámetros. Su principal diferencial es que no es un modelo conversacional de propósito general: está optimizado para producir traducciones deterministas, sin comentarios ni relleno conversacional.

El modelo ha sido entrenado sobre un corpus curado de 102.502 pares de frases paralelas procedentes de CFILT IIT Bombay y AI4Bharat Samanantar, con un total de 13,6 millones de tokens activos. Según sus desarrolladores, el conjunto de datos está verificado por humanos y no contiene texto sintético ni destilado de otros modelos. El modelo soporta dos modalidades de entrada: texto sin etiquetas (estilo Google Translate) e instrucciones explícitas como "Translate to Hindi: ...".

Su ventana de contexto es de 2048 tokens y su tokenizador byte-fallback BPE tiene 64.003 entradas, lo que garantiza cobertura completa de Unicode devanagari. Está disponible bajo licencia Apache-2.0 en HuggingFace y está pensado para despliegues de baja latencia, incluyendo escenarios edge.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Sarus-500M) |
| Parámetros totales | 500.642.560 |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en BF16/FP16) |
| Idiomas soportados | Inglés (en), Hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible |
| Dimension del modelo (d_model) | 1280 |
| Capas transformer | 24 |
| Cabezas de atención | 20 consulta / 4 clave-valor (GQA 5:1) |
| Dimension intermedia FFN | 3456 |
| Función de activación | SwiGLU |
| Normalización | RMSNorm (epsilon 10^-6) |
| Tamaño de vocabulario | 64.003 |
| Precisión de inferencia | BFloat16 / FP16 |

## Arquitectura y entrenamiento

ViuTranslate-500M se construye sobre la arquitectura Sarus-500M, un transformer autoregresivo decoder-only. Emplea Grouped Query Attention con una relación 5:1 entre cabezas de consulta y clave-valor (20 query heads y 4 KV heads), lo que reduce la memoria de la caché KV y acelera la inferencia. La capa de proyección FFN utiliza activación SwiGLU con tamaño intermedio de 3456, y la normalización es RMSNorm con epsilon de 10^-6. El tokenizador es un BPE con fallback de bytes de 64.003 entradas, diseñado para cubrir por completo el alfabeto devanagari y evitar tokens desconocidos. El posicionamiento se implementa con Rotary Positional Embeddings (RoPE) con theta de 10.000, y el contexto máximo es de 2048 tokens.

El entrenamiento se realizó sobre el dataset ViuTranslate-Data, que combina 50.000 pares del corpus IIT Bombay English-Hindi de CFILT (IIT Bombay) y 50.000 pares de AI4Bharat Samanantar, más un conjunto de prueba de 2.502 pares. En total, 102.502 pares, que equivalen a 13,6 millones de tokens de entrenamiento activos. El corpus se sometió a filtros de ratio de longitud (0,40 - 2,40), pureza de escritura (mínimo 50% latino en inglés y 40% devanagari en hindi) y saneamiento de HTML, XML, código y URLs. No se menciona el uso de RLHF ni DPO; el modelo se entrenó en modo directo y modo instrucción, en ambas direcciones.

## Capacidades

- Traducción bidireccional inglés-hindi (devanagari) con fluidez de hablante nativo según el autor.
- Modo directo: acepta texto plano sin etiquetas; entrada en inglés produce hindi puro y viceversa.
- Modo comando: soporta instrucciones explícitas ("Translate to Hindi: ...", "Translate to English: ...").
- Tokenizador con 64.003 entradas y cobertura completa de Unicode devanagari; el autor afirma 0 tokens `<unk>` en corpus de referencia.
- Baja latencia: el autor reporta generación por frase en menos de 15 ms en GPUs modernas (RTX 5090, RTX 4090, A100, T4).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo conversacional ni de propósito general; no genera texto libre, código ni respuestas a preguntas.
- No tiene capacidades de visión ni audio.
- Multilingüe limitado a inglés e hindi.

## Casos de uso

- Traducción de contenido web en tiempo real: párrafos o frases de noticias anglosajonas se envían al modelo, que devuelve texto hindi listo para publicar; la baja latencia permite integración en CMS.
- Localización de documentación técnica y jurídica: el corpus de IIT Bombay incluye textos judiciales y literarios, por lo que resulta adecuado para traducir contratos, sentencias y manuales.
- Subtitulado de vídeo: frases cortas y latencia inferior a 15 ms permiten procesar subtítulos en pipelines semiautomáticos para contenido en hindi.
- Soporte bilingüe en atención al cliente: un agente de chat puede traducir mensajes de usuarios en inglés o hindi en ambas direcciones para que los operadores respondan en su idioma.
- Traducción inversa para investigación: se pueden traducir artículos o tweets en hindi al inglés para alimentar sistemas de análisis de sentimiento o extracción de entidades.
- Aplicaciones móviles de traducción offline: el tamaño de ~500M permite el despliegue en dispositivos móviles con cuantización externa a 8 bits, aunque no hay cuantizaciones oficiales.
- Normalización de textos en hindi para NLP: el modelo genera salidas estandarizadas en devanagari que sirven como input para etiquetado morfológico o análisis sintáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un conjunto de prueba de 2.502 pares del benchmark IIT Bombay, pero no proporciona métricas como BLEU, COMET ni comparaciones con otros modelos. La única afirmación de rendimiento es la latencia de menos de 15 ms por frase en GPUs modernas, que no está respaldada por evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada: con 500M parámetros y pesos en BF16, se requieren aproximadamente 1,0 GB para los pesos. Con la caché KV de GQA para 2048 tokens (4 cabezas KV x 64 dimensiones x 2 bytes por token = ~1 MB por secuencia) y el overhead de ejecución, la VRAM total de inferencia se sitúa en torno a 1,5-2,0 GB.
- GPU recomendadas: RTX 5090, RTX 4090, A100, T4, o cualquier GPU con al menos 2 GB de memoria.
- Consumer GPU: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4060, incluso en sistemas integrados con suficiente RAM, si se convierte el modelo a un formato cuantizado.
- Opciones de despliegue: al ser un modelo Transformers con PyTorch, se puede servir con vLLM, TGI o con un servicio Python personalizado. No se proporcionan integraciones oficiales para llama.cpp ni Ollama; sería necesaria una conversión a GGUF no publicada.
- Latencia y throughput: el autor reporta una latencia de menos de 15 ms por frase en GPUs modernas. No hay mediciones de throughput oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ViuTranslate-500M | 500.642.560 | 2048 | Apache-2.0 | HuggingFace |
| Helsinki-NLP/opus-mt-en-hi | No disponible | No disponible | Apache-2.0 | HuggingFace |
| facebook/m2m100_418M | 418M | No disponible | Apache-2.0 | HuggingFace |

No se dispone de resultados de benchmarks comparativos. Helsinki-NLP/opus-mt-en-hi es un modelo Marian bilingüe entrenado en OPUS, mientras que M2M100 es un modelo multilingüe capaz de traducir entre muchos pares de idiomas. ViuTranslate, en cambio, es un modelo de traducción pura EN-HI con un enfoque en determinismo y baja latencia, sin capacidades conversacionales.

## Limitaciones y advertencias

- Sesgos: al estar entrenado con corpus de IIT Bombay y Samanantar, el modelo puede reflejar sesgos temáticos y estilísticos propios de textos académicos, periodísticos y judiciales, con menor cobertura de registros coloquiales o técnicos modernos.
- Riesgo de alucinación: como todo modelo NMT, puede producir traducciones incorrectas en textos ambiguos o con argot; la ausencia de benchmarks públicos impide evaluar su tasa de errores.
- Contexto limitado: la ventana de 2048 tokens es relativamente corta; no se pueden traducir documentos extensos de una vez, por lo que es necesario trocear el texto.
- Idioma: solo inglés e hindi; no genera traducciones a otros idiomas.
- Sin cuantizaciones oficiales: no se distribuyen versiones GGUF ni cuantizadas en 4 bits, lo que dificulta el despliegue en dispositivos con menos de 1 GB de memoria.
- Sin capacidades de tool calling ni agentes: no se puede integrar como componente agente para llamar funciones o razonar de forma multi-paso.
- Licencia Apache-2.0: permite uso comercial, pero no se ofrecen garantías de soporte ni de cumplimiento en entornos regulados.
- La afirmación de latencia inferior a 15 ms proviene del autor y no está respaldada por benchmarks independientes.

## Enlaces

- Modelo: https://huggingface.co/ViuAI/ViuTranslate
- Dataset de entrenamiento: https://huggingface.co/datasets/ViuAI/ViuTranslate-Data
- Organización ViuAI en HuggingFace: https://huggingface.co/ViuAI
- Repositorio de ViuAI en GitHub: https://github.com/ViuAI
