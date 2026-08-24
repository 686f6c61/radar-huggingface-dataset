# TaoLiveAIGC/TLive-Omni-4B

## Resumen

TLive-Omni-4B es un modelo omni-modal de comprensión desarrollado por TaoLiveAIGC, diseñado específicamente para el análisis de retransmisiones de comercio electrónico en directo (live-stream). El modelo integra entradas de imagen, vídeo, audio y texto en una interfaz unificada de salida de texto, permitiendo tareas como reconocimiento de voz, análisis de hablantes, grounding visual de productos, reconocimiento de texto en pantalla y respuesta a preguntas multimodales en tiempo real.

Construido sobre un backbone Qwen3.5 con un codificador de audio AuT integrado mediante un alineador MLP ligero, el modelo organiza los tokens de audio y vídeo en una rejilla temporal con límites explícitos, lo que permite un alineamiento temporal fino en flujos largos. Soporta hasta 256K tokens de contexto y se entrena mediante una receta de tres etapas de SFT (supervised fine-tuning) seguida de Faithful-RFT, una etapa de reinforcement fine-tuning que suprime rastros de razonamiento explícitos para optimizar la calidad de las respuestas en tareas de comercio en vivo.

La variante 4B, aunque nominalmente de 4 mil millones de parámetros, tiene 5.724.547.776 parámetros reales en pesos safetensors (aproximadamente 5,7 mil millones). El modelo se distribuye bajo licencia Apache-2.0 y está disponible en HuggingFace con 189 descargas y 8 likes. Su relevancia actual radica en abordar un dominio vertical de alta demanda —el comercio en directo— donde los modelos generalistas multimodales suelen fallar por el ruido acústico, la superposición de hablantes y la duración extendida de las transmisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5 + codificador de audio AuT + alineador MLP |
| Parametros totales | 5.724.547.776 (5,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

TLive-Omni-4B adopta una arquitectura densa basada en el backbone Qwen3.5, al que se añade un codificador de audio AuT a través de un alineador MLP ligero. Para entradas de vídeo con audio, los tokens se organizan en una rejilla temporal (timestamped per-vGrid layout) que intercala bloques de tokens de vídeo y audio, manteniendo los segmentos de audio adyacentes a su contenido visual correspondiente. Esto permite un alineamiento temporal fino en flujos largos de hasta 256K tokens.

El entrenamiento sigue una receta de tres etapas de SFT progresivo: primero se alinea el audio con el lenguaje, después se realiza SFT multimodal completo, y finalmente se aplica Faithful-RFT, una etapa de reinforcement fine-tuning que suprime rastros de razonamiento explícitos y optimiza directamente la calidad de las respuestas para tareas de comercio en vivo. El modelo se evalúa en un conjunto de tareas atómicas que incluyen reconocimiento de voz, análisis de hablantes, grounding visual de productos, reconocimiento de texto, grounding temporal, caption denso de vídeo y QA omni-modal, producido mediante un motor de datos compacto.

## Capacidades

- Comprensión omni-modal unificada: procesa imagen, vídeo, audio y texto en una única interfaz de salida de texto.
- Reconocimiento de voz en comercio en vivo (ASR) con baja tasa de error (CER 6,66 en el benchmark Live-Commerce ASR).
- ASR con atribución de hablante (Speaker-Attributed ASR) con cpWER 12,88.
- Análisis de hablantes: identifica quién habla en cada momento de la transmisión.
- Visual grounding de productos: localiza y describe productos mencionados en el audio dentro de las imágenes de vídeo.
- Reconocimiento de texto en pantalla (OCR sobre overlays y texto superpuesto).
- Temporal grounding: localiza eventos específicos en el tiempo dentro del flujo de vídeo.
- Caption denso de vídeo: genera descripciones detalladas de las secuencias visuales.
- QA omni-modal: responde preguntas que requieren integrar información de audio, vídeo, imagen y texto.
- Generación de texto conversacional con soporte para diálogos multi-turno.

## Casos de uso

- **Moderación automática de retransmisiones en vivo**: el modelo puede transcribir y atribuir cada intervención a su hablante (presentador, ayudante, cliente), lo que permite generar subtítulos en tiempo real y detectar desviaciones del guion comercial.
- **Resúmenes automáticos de sesiones de venta**: al finalizar una retransmisión, se genera un resumen de los productos mostrados, los precios anunciados y las preguntas de los usuarios, aprovechando su capacidad de caption denso de vídeo y su ventana de 256K tokens.
- **Búsqueda de productos por descripción**: un usuario puede preguntar "¿cuánto costaba el vestido rojo que enseñaron a los 10 minutos?" y el modelo localiza el momento exacto y extrae la información del audio y la imagen.
- **Verificación de cumplimiento comercial**: en plataformas de e-commerce, el modelo puede detectar si el presentador menciona precios o características de producto de forma incorrecta comparando el audio con la información mostrada en pantalla.
- **Generación de fichas de producto**: a partir de una retransmisión completa, el modelo produce una ficha estructurada con nombre, precio, características y disponibilidad, combinando el audio del presentador con el texto superpuesto en vídeo.
- **Asistente de ventas en directo**: el modelo puede responder en tiempo real a preguntas de los espectadores sobre productos, tallas, colores o disponibilidad, integrando la información de la transmisión con el contexto de la tienda.

## Benchmarks y rendimiento

El modelo se evaluó en tareas de comercio en vivo y benchmarks generales. En la tabla siguiente se muestran los resultados de las tareas de audio, comparados con modelos propietarios y open-source.

| Tarea | Métrica | TLive-Omni 4B | TLive-Omni 9B | Gemini 2.5 Flash | Gemini 3 Flash | Qwen3.5-Omni Flash | Qwen2.5-Omni 7B | MiniCPM-o 2.6 8B |
|---|---|---|---|---|---|---|---|---|
| Live-Commerce ASR | CER ↓ | 6.66 | **6.46** | 16.30 | 15.18 | 6.81 | 7.86 | 13.88 |
| Speaker-Attributed ASR | cpWER ↓ | 12.88 | **12.27** | 17.14 | 19.04 | 13.23 | — | — |

Los resultados en negrita indican el mejor valor entre los modelos open-source comparados. El 4B se sitúa como segundo mejor en ambas tareas, solo superado por la variante 9B del mismo modelo. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 5,7B de parámetros en FP16 se requieren aproximadamente 11,4 GB solo para los pesos; con cuantización en 8-bit (~5,7 GB) o 4-bit (~2,9 GB) se reduce la huella. Sin embargo, la ventana de contexto de 256K tokens incrementa significativamente el consumo de memoria para los estados de atención (KV cache), que puede superar los 20 GB en contextos largos.
- **GPU recomendadas**: para inferencia con contexto completo, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4). Para contextos cortos y cuantización 4-bit, una RTX 4080 (16 GB) o incluso una RTX 4060 (12 GB) podría ser suficiente.
- **¿Cabe en GPU consumer?**: sí, en cuantización de 4-bit o 8-bit, con contextos reducidos (≤ 32K tokens), se puede ejecutar en GPUs consumer de 16-24 GB.
- **Opciones de despliegue**: compatible con la librería transformers de HuggingFace; se puede servir con vLLM, llama.cpp, Ollama (si se convierte a GGUF) o TGI. El modelo usa código personalizado (custom_code) para la rejilla temporal, por lo que el despliegue con vLLM o TGI puede requerir integración específica.
- **Latencia y throughput**: no disponible. Al ser un modelo multimodal con un codificador de audio adicional, la latencia dependerá del tamaño de la entrada (imagen, vídeo, audio) y de la longitud de contexto.

## Comparativa con modelos similares

La comparativa se centra en modelos omni-modales de la misma categoría (comprensión multimodal unificada):

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| TLive-Omni-4B | 5,7B | 256K | Apache-2.0 | E-commerce live-stream, omni-modal |
| Qwen2.5-Omni-7B | 7B | 128K | Apache-2.0 | Omni-modal general (audio, vídeo, texto) |
| MiniCPM-o 2.6 8B | 8B | 128K | Apache-2.0 | Omni-modal general, habla, visión |
| Qwen3-Omni 30B-A3B | 30B (MoE) | 256K | Apache-2.0 | Omni-modal general, razonamiento |

TLive-Omni-4B se diferencia por su especialización en comercio en vivo y su rejilla temporal con límites explícitos, que mejora el alineamiento audio-vídeo en flujos largos. En las tareas de audio, supera a Qwen2.5-Omni-7B y a MiniCPM-o 2.6, aunque pierde frente a la variante 9B del mismo modelo. La ventana de contexto de 256K iguala a la de Qwen3-Omni, pero con un coste computacional mucho menor al ser denso.

## Limitaciones y advertencias

- **Sesgos de dominio**: el modelo está entrenado específicamente para comercio en vivo; su rendimiento en tareas generales multimodales puede ser inferior al de modelos generalistas de tamaño similar.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir descripciones o respuestas inventadas, especialmente en escenarios de audio ruidoso o vídeo de baja calidad.
- **Idiomas**: no se especifican los idiomas soportados; se desconoce si el modelo es monolingüe (chino probablemente, dado el dominio del comercio en vivo) o multilingüe.
- **Contexto de 256K**: aunque la ventana es amplia, el coste de memoria y computación crece linealmente con el número de tokens, lo que puede limitar su uso en hardware modesto.
- **Código personalizado**: el modelo requiere `custom_code` para la rejilla temporal, lo que puede complicar el despliegue en infraestructuras que no soporten código Python arbitrario.
- **Licencia Apache-2.0**: permite uso comercial, pero la responsabilidad del uso en producción recae en el desarrollador; no hay garantías de seguridad o cumplimiento normativo.

## Enlaces

- [HuggingFace - TLive-Omni-4B](https://huggingface.co/TaoLiveAIGC/TLive-Omni-4B)
- [HuggingFace - TLive-Omni-9B](https://huggingface.co/TaoLiveAIGC/TLive-Omni-9B)
- [GitHub - TaoLiveAIGC/TLive-Omni](https://github.com/TaoLiveAIGC/TLive-Omni)
- [ArXiv - Technical Report](https://arxiv.org/abs/2608.20958)
- [PDF - Technical Report](https://github.com/TaoLiveAIGC/TLive-Omni/blob/main/TLive-Omni-Technical-Report.pdf)
- [Perfil de TaoLiveAIGC en HuggingFace](https://huggingface.co/TaoLiveAIGC)
