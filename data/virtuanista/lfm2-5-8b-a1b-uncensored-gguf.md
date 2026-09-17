# virtuanista/LFM2.5-8B-A1B-Uncensored-GGUF

## Resumen

LFM2.5-8B-A1B-Uncensored-GGUF es una versión «abliterated» (con la señal de rechazo eliminada) del modelo LFM2.5-8B-A1B de Liquid AI, publicada por el usuario virtuanista en formato GGUF. El modelo base emplea una arquitectura híbrida poco habitual, denominada lfm2moe, que combina bloques de convolución corta (shortconv) con atención GQA y capas de mezcla de expertos (MoE) a lo largo de 24 bloques. Cuenta con 8.467.856.832 parámetros totales, unos 1.500 millones activos por token (4 de 32 expertos según la model card) y una ventana de contexto de 128K tokens, además de un modo de razonamiento que emite bloques `<think>...</think>`.

Su relevancia práctica está en la ejecución local: se distribuye exclusivamente en GGUF con cinco niveles de cuantización (de IQ4_XS de 4,6 GB a Q8_0 de 9,0 GB), todos calibrados con iMatrix, y está preparado para `llama.cpp`, `llama-server` (API compatible con OpenAI) y Ollama. El valor diferencial frente a otras versiones sin censura es metodológico: la model card indica que la intervención se aplicó sobre los tensores que realmente portan la señal de rechazo en esta arquitectura híbrida (`conv.out_proj`, `self_attn.out_proj`, `feed_forward.w2`, con foco en las capas 11-23 y pico en la capa 16), en lugar de usar herramientas genéricas que asumen un Transformer puro.

Conviene tener presente que el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, que la model card no publica resultados de evaluación y que la licencia LFM Open v1.0 limita el uso comercial a empresas con ingresos anuales inferiores a 10 millones de USD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2moe` híbrida: shortconv (LIV) + atención GQA + MoE, 24 bloques |
| Parametros totales | 8.467.856.832 (≈8,3B según la model card) |
| Parametros activos | ≈1.500 millones por token (4 de 32 expertos); el nombre comercial indica «A1B» |
| Longitud de contexto | 128K tokens (según la model card) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (calibración iMatrix en todas) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 millones de USD de ingresos anuales) |
| Formato de pesos | GGUF únicamente |

## Arquitectura y entrenamiento

El modelo base es un híbrido `lfm2moe`: bloques de convolución corta (shortconv/LIV) combinados con atención de consultas agrupadas (GQA) y capas de mezcla de expertos con enrutado disperso (4 de 32 expertos activos por token). Esta combinación reduce el coste por token respecto a un Transformer denso de tamaño equivalente, al mantener una huella de parámetros activos de aproximadamente 1.500 millones. La model card indica 24 bloques y una ventana de contexto de 128K tokens, con modo de razonamiento mediante bloques `<think>`.

Sobre esta base, el autor aplica un proceso de abliteration quirúrgica centrado en los tensores que transportan la señal de rechazo en esta arquitectura concreta, con especial atención a las capas 11-23 y máximo efecto en la capa 16. Según la model card, tras la modificación se verificaron el razonamiento, el seguimiento de instrucciones y la calidad general. El detalle del dataset de entrenamiento del modelo base (número de tokens, composición, fases de RLHF/DPO) no se documenta en la información disponible, como tampoco el procedimiento exacto de cuantización más allá del uso de calibración iMatrix.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat y etiqueta `conversational`.
- Razonamiento explícito en modo *thinking* mediante bloques `<think>...</think>`.
- Seguimiento de instrucciones, que la model card afirma verificado tras la modificación de abliteration.
- Contexto largo de hasta 128K tokens, apto para documentos extensos.
- Capacidades multilingües concretas: no disponible (la model card está redactada en castellano, pero no declara lista de idiomas).
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto (`pipeline_tag: text-generation`).
- Despliegue mediante API compatible con OpenAI a través de `llama-server`, y ejecución directa en Ollama.

## Casos de uso

- Asistente local y privado: al ejecutarse con Ollama o `llama.cpp` sobre hardware propio, ningún dato de las conversaciones sale del equipo; encaja en entornos con requisitos de confidencialidad donde no se permite enviar prompts a APIs externas.
- Análisis de documentación extensa: con 128K tokens de contexto puede ingerir contratos, informes técnicos o expedientes completos y responder preguntas sobre ellos sin troceado previo, siempre que la VRAM disponible permita cachear el contexto completo.
- Generación de texto creativo sin filtros: útil para narrativa, guiones o diálogos que abordan violencia, sexualidad o temas delicados, donde el modelo base tiende a rechazar la petición; el filtro de rechazo eliminado permite continuar la tarea.
- Investigación en alineación y seguridad: sirve como sujeto de estudio para medir cómo cambia el comportamiento de un modelo híbrido MoE tras una abliteration selectiva, y para comparar con la versión original de Liquid AI en la misma arquitectura.
- *Red teaming* y evaluación de salvaguardas: al carecer de las barreras por defecto, permite generar respuestas que un evaluador puede usar para probar clasificadores de contenido o sistemas de moderación propios.
- Despliegue en hardware limitado: la cuantización IQ4_XS (4,6 GB) y Q4_K_M (5,2 GB) permiten servir el modelo en tarjetas de gama media o en equipos con memoria unificada, manteniendo una ventana de contexto razonable con `-c 16384`.
- Base para ajuste fino o experimentación en local: el autor afirma que el razonamiento y el seguimiento de instrucciones siguen intactos, de modo que sirve como punto de partida para prototipos que requieran un modelo pequeño con modo *thinking*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma que el razonamiento, el seguimiento de instrucciones y la calidad general se verificaron tras el proceso de abliteration, pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones cuantitativas con el modelo base LiquidAI/LFM2.5-8B-A1B.

## Requisitos de hardware

- Peso en disco de los pesos según cuantización: 4,6 GB (IQ4_XS), 5,2 GB (Q4_K_M), 6,0 GB (Q5_K_M), 7,0 GB (Q6_K) y 9,0 GB (Q8_0).
- VRAM estimada para inferencia con contexto corto (hasta 8K tokens): aproximadamente el tamaño del archivo más 0,5-1,5 GB de sobrecarga (caché KV, búfer de cómputo). Es decir, del orden de 5-6 GB con Q4_K_M y de 10-11 GB con Q8_0. Son estimaciones a partir de los tamaños declarados; no hay cifras oficiales.
- VRAM con contexto largo: aumenta de forma apreciable al crecer la caché KV; el dato exacto para 128K tokens no está disponible en la información proporcionada.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB o RTX 4060 Ti 16 GB pueden ejecutar Q4_K_M y Q5_K_M con contexto moderado; una RTX 4070/4080/4090 permite subir a Q6_K o Q8_0 y ampliar contexto. Las cuantizaciones IQ4_XS y Q4_K_M también son viables en equipos Apple Silicon con memoria unificada.
- GPU profesionales: A100, H100 y similares no son necesarias en términos de memoria, pero permiten servir varias instancias concurrentes y contextos muy largos.
- Opciones de despliegue documentadas: `llama.cpp` (`llama-cli -m ... -ngl 99 -c 16384`), `llama-server` con API compatible con OpenAI y Ollama (`ollama run virtuanista/lfm2.5-8b-a1b-uncensored`). No se documenta soporte para vLLM ni TGI en esta versión, que se distribuye solo en GGUF.
- Latencia y throughput: no disponible. Cabe esperar un coste por token bajo al tratarse de un MoE con ~1.500 millones de parámetros activos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|
| virtuanista/LFM2.5-8B-A1B-Uncensored-GGUF | 8.467.856.832 | ≈1.500 M (4 de 32 expertos) | 128K | GGUF | LFM Open License v1.0 | 0 descargas, 0 likes en la consulta |
| LiquidAI/LFM2.5-8B-A1B (base) | 8.467.856.832 (según el dato de safetensors del derivado) | ≈1.500 M | 128K | no disponible | LFM Open License v1.0 | Modelo oficial de Liquid AI |
| Otras alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La diferencia funcional principal frente al modelo base es la ausencia del reflejo de rechazo entrenado; la model card no aporta comparaciones de rendimiento entre ambas versiones, por lo que no puede afirmarse que la calidad sea equivalente más allá de lo que declara el autor.

## Limitaciones y advertencias

- Ausencia de salvaguardas: al haber eliminado la señal de rechazo, el modelo puede generar contenido dañino, ilegal o engañoso si se le solicita; la responsabilidad de uso recae en quien lo despliega.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual ni de tasas de alucinación; el modo de razonamiento con `<think>` no garantiza corrección.
- Sesgos: no se documenta ninguna evaluación de sesgos ni la composición del dataset de entrenamiento del modelo base.
- Idiomas: no se declara lista de idiomas soportados; el rendimiento fuera del inglés (y presumiblemente del castellano) no está verificado.
- Degradación potencial por abliteration: aunque el autor afirma que las capacidades se mantienen, no hay mediciones independientes; la intervención sobre tensores de las capas 11-23 puede afectar a tareas sensibles a esa región.
- Licencia: LFM Open License v1.0 permite uso comercial solo por debajo de 10 millones de USD de ingresos anuales; por encima de ese umbral se requiere autorización. Cualquier redistribución debe conservar los avisos de copyright y atribución de Liquid AI.
- Validación comunitaria nula: el repositorio presenta 0 descargas y 0 likes, sin discusiones ni evaluaciones de terceros que respalden las afirmaciones de la model card.
- Formato único GGUF: no se distribuyen pesos en safetensors, lo que complica el ajuste fino tradicional y excluye los motores de servicio que no consumen GGUF.
- Contexto largo costoso: los 128K tokens declarados exigen una caché KV grande; sin VRAM suficiente, en la práctica habrá que limitar `-c` a valores bastante menores.
- Fechas de la model card: se indica el lanzamiento del modelo base el 28 de mayo de 2026 y la creación del repositorio el 17 de septiembre de 2026; conviene verificar estas fechas en la fuente original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/virtuanista/LFM2.5-8B-A1B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Organización Liquid AI en HuggingFace: https://huggingface.co/LiquidAI
- Licencia (LFM Open License v1.0): https://huggingface.co/virtuanista/LFM2.5-8B-A1B-Uncensored-GGUF/blob/main/LICENSE
- Versión en Ollama: https://ollama.com/virtuanista/lfm2.5-8b-a1b-uncensored
- Perfil del autor: https://huggingface.co/virtuanista
- Resultados de búsqueda web: las consultas realizadas devolvieron únicamente páginas genéricas (GitHub, Reddit, Zhihu) sin información relevante sobre este modelo; no se han encontrado papers, blogs técnicos ni demos adicionales.
