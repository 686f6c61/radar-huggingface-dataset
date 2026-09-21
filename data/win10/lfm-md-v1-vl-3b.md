# win10/LFM-MD-V1-VL-3B

## Resumen

LFM-MD-V1-VL-3B es un modelo multimodal de imagen-texto publicado por el usuario win10 (autor de la model card: Zuojun Ye, Twinkle AI) como un ajuste del modelo base LiquidAI/LFM2.5-VL-3B. Su particularidad no es el backbone en sí, sino la capa de memoria persistente que se le añade: el modelo separa el razonamiento del conocimiento adquirido durante el uso, de forma que nuevas observaciones actualizan una unidad de memoria independiente que puede guardarse en disco y recuperarse después de que la sesión original haya terminado.

La arquitectura combina pesos rápidos inspirados en Titans, un grafo disperso derivado de MaleCNS, memoria nativa de características internas, lectores iterativos inspirados en DNC (Differentiable Neural Computer) y marcos físicos de pesos FFN entrenados sobre la fuente. El grafo contiene 90.839 nodos, 1.983.608 aristas dirigidas y 7.934.432 escalares sinápticos rápidos distribuidos en cuatro canales de pesos rápidos. Los puertos de memoria se conectan al backbone en las capas de lenguaje 4, 14 y 26, además de un puerto independiente para características visuales nativas.

El modelo tiene 3.393.060.183 parámetros totales, un repositorio de 7,4 GB y se distribuye con los pesos fusionados completos del checkpoint 110, el runtime personalizado, la topología del grafo y una lente de conceptos calibrada para esos pesos concretos. Es relevante ahora porque propone una vía práctica para dar memoria de largo plazo a un backbone compacto sin necesidad de mantener todo el historial en VRAM ni de fusionar repetidamente el conocimiento adquirido en los pesos compartidos del modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone multimodal híbrido convolución/atención (LFM2.5-VL) con puertos de memoria persistente: pesos rápidos inspirados en Titans, grafo disperso MaleCNS, lectores iterativos tipo DNC y marcos FFN físicos entrenados sobre la fuente. Código personalizado (custom_code) |
| Parámetros totales | 3.393.060.183 (3,39 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio no declara cuantizaciones ni publica pesos GGUF; se distribuye en safetensors |
| Idiomas soportados | Chino (zh) e inglés (en), según los metadatos de la model card |
| Licencia | lfm1.0 (Liquid AI), etiquetada en HuggingFace como "other" |
| Formato de pesos | safetensors |
| Modelo base | LiquidAI/LFM2.5-VL-3B |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 7,4 GB |
| Puertos de memoria | Capas de lenguaje 4, 14 y 26, más un puerto nativo de características visuales |
| Grafo MaleCNS | 90.839 nodos, 1.983.608 aristas dirigidas, cuatro canales de pesos rápidos, 7.934.432 escalares sinápticos rápidos |
| Módulos ausentes | No incluye VAE ni módulos Dream |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del stack de lenguaje, el codificador visual, el procesamiento de imagen y la plantilla de chat de LFM2.5-VL-3B, y le añade una capa de memoria que se conecta al backbone en las capas 4, 14 y 26, con un puerto independiente para características visuales nativas. Las observaciones visuales entran como características visuales, no como leyendas generadas. Las lecturas dentro de un forward causal usan una instantánea fija de memoria; las escrituras se confirman después de ese forward, de modo que las escrituras no alteran el estado que ya han visto las lecturas anteriores de la misma transacción. Los pesos rápidos y el momentum pertenecen a la sesión de memoria, no al backbone compartido.

La memoria persistente tiene cuatro componentes: pesos rápidos y momentum del grafo (estado sináptico adaptado en línea, usado mediante cómputo disperso a través de los puertos visual y de lenguaje), marcos FFN físicos (representaciones de pesos de secuencias de tokens, con 32 tokens fuente por marco, residual de rango 4 y prior compartido de rango 16), ranuras de características nativas (representaciones internas explícitas y estructura de secuencia, con lectura basada en atención y lectura iterativa tipo DNC) y direcciones de conceptos dispersas (coordenadas de recuperación derivadas del modelo que seleccionan unidades candidatas antes de cargar su carga física). El escritor en línea actual realiza 64 actualizaciones Adam únicamente sobre la fuente con el backbone congelado; una entrada fija de inicio de secuencia decodifica los marcos aprendidos y sumas de verificación por marco validan los fragmentos reconstruidos. Este mecanismo usa un objetivo de reconstrucción de la fuente y es distinto de la regla de actualización asociativa original de Titans.

La asignación de memoria usa reserva de ranuras nuevas, enlaces temporales dentro de la unidad y lectura por contenido, hacia delante y hacia atrás. Las ranuras nuevas se asignan y escriben sin sobrescribir unidades archivadas; el autor indica explícitamente que es una política de asignación especializada y no una reproducción de todas las puertas aprendidas de asignación y liberación del DNC original. El lector realiza dos saltos de refinamiento en las capas de atención nativas, combinando una ruta de identidad de ancho completo con una corrección de bajo rango y arrastre aprendido de la consulta, y una puerta de refinamiento tanh inicializada a cero que preserva inicialmente la lectura nativa. Los enlaces temporales representan orden de escritura, no un grafo semántico de respuestas. No se dispone de información sobre el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Generación de texto e imagen-texto conversacional (pipeline image-text-to-text) sobre el backbone LFM2.5-VL-3B.
- Comprensión de imágenes mediante características visuales nativas, sin pasar por descripciones textuales intermedias.
- Memoria persistente entre sesiones: las observaciones pueden actualizar una unidad de memoria independiente, guardarse en disco y recuperarse después de cerrar la sesión original.
- Recuperación de unidades de memoria mediante direcciones derivadas de las representaciones internas del propio modelo (direcciones de conceptos dispersas), sin selección por oráculo.
- Memoria de múltiples saltos en modo escalonado: en las pruebas del autor, el modelo completó las 48 cadenas multi-hop cuando se le pedían los valores intermedios.
- Reconstrucción de fragmentos guardados: en pruebas controladas reconstruyó los 54 marcos físicos de pesos tras una carga en frío, verificados con sumas de control.
- Lectura iterativa sobre memoria explícita con dos saltos de refinamiento en las capas de atención nativas.
- Soporte multilingüe limitado a chino e inglés según los metadatos.
- Capacidad de escenario conversacional (etiqueta "conversational").
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistentes con memoria entre sesiones: el modelo puede almacenar observaciones de una conversación en una unidad de memoria independiente, persistirla en disco y recuperarla en una sesión posterior sin recargar todo el historial en la ventana de contexto. Es adecuado porque su diseño separa explícitamente el backbone de razonamiento del estado adquirido durante el uso.
- Análisis acumulativo de documentos e imágenes: en flujos donde se procesan informes o capturas sucesivas, el modelo puede archivar unidades de memoria por documento y recuperarlas por dirección derivada de la consulta, evitando reinyectar todo el material previo.
- Soporte técnico multi-turno con historial largo: las ranuras de características nativas y la lectura iterativa tipo DNC permiten recuperar fragmentos concretos de interacciones anteriores cuando el usuario pide detalles intermedios, que es el escenario donde el autor reporta mejores resultados (recuperación escalonada).
- Inspección visual industrial con registro de casos: el puerto de características visuales nativas permite introducir imágenes como características y asociarlas a unidades de memoria, de modo que inspecciones posteriores pueden consultar casos archivados sin reentrenar el backbone.
- Investigación en memoria de largo plazo en LLM: sirve como banco de pruebas reproducible para comparar pesos rápidos inspirados en Titans, grafos dispersos tipo MaleCNS y lectores DNC frente a alternativas de memoria en contexto o RAG, dado que el autor publica el grafo, la topología y la lente de conceptos.
- Tutoría y atención al usuario en chino e inglés: el modelo cubre ambos idiomas y puede mantener el contexto de aprendizaje o de incidencia a lo largo del tiempo mediante memoria persistente, sin requerir infraestructura de recuperación externa.
- Prototipos de asistentes para robótica o agentes embodied: la combinación de entrada visual nativa y memoria recargable permite que un agente recuerde observaciones del entorno entre episodios, siempre que el caso de uso tolere la ausencia de benchmarks estándar publicados.
- Archivado consultable de sesiones de anotación: las unidades se guardan sin sobrescribirse (asignación de ranuras nuevas), lo que encaja en flujos donde cada sesión de etiquetado debe conservarse íntegra y consultarse después.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, MMMU u otros) en la información disponible. El autor sí reporta pruebas internas controladas de los flujos de memoria, que se recogen a continuación tal cual, sin comparación con otros modelos:

| Prueba interna (autor) | Resultado reportado |
|---|---|
| Reconstrucción de marcos físicos de pesos tras carga en frío | 54 de 54 marcos reconstruidos |
| Preguntas de memoria física de un salto | 32 de 32 respondidas correctamente |
| Cadenas multi-hop con petición de valores intermedios | 48 de 48 completadas |
| Recuperación en archivo sin selección por oráculo | Unidad correcta recuperada y respuesta correcta en 6 consultas |
| Predicción directa del extremo de una cadena lejana | Sustancialmente más débil que el recuerdo escalonado |
| Recuperación de asociaciones aleatorias por el grafo aislado | No las recuperó de forma independiente |

Estos datos provienen de pruebas de desarrollo controladas con muestras pequeñas y no constituyen una evaluación de rendimiento general del modelo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 6,8 GB solo para los pesos (3,39 mil millones de parámetros a 2 bytes); con codificador visual, runtime de memoria y activaciones, la estimación razonable es de 9 a 12 GB. Es una estimación propia, no confirmada por el autor.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,4 a 4 GB para los pesos, más overhead. Estimación propia; no hay cuantizaciones publicadas por el autor.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2 a 2,5 GB para los pesos. Estimación propia; no hay cuantizaciones publicadas.
- El grafo de memoria es pequeño en términos de memoria (7.934.432 escalares rápidos, del orden de decenas de MB en precisión completa), por lo que no debería ser el cuello de botella de VRAM.
- GPU de consumo: cabe con holgura en RTX 4090, RTX 3090 y RTX 4080 (16-24 GB) en bf16; en RTX 3060 de 12 GB o RTX 4070 de 12 GB debería caber en bf16 con margen limitado, y con más holgura si se cuantiza. No confirmado por el autor.
- GPU de centro de datos: A100, H100, L40S o similares son suficientes de sobra para este tamaño; el interés de estas GPU estaría en servir muchas sesiones de memoria concurrentes, no en la inferencia individual.
- Opciones de despliegue: al usar código personalizado (custom_code), el camino documentado es transformers con trust_remote_code=True y el runtime propio del repositorio. No hay confirmación de soporte en vLLM, TGI, llama.cpp ni Ollama, y dada la arquitectura y el runtime personalizados no debe asumirse compatibilidad directa.
- Latencia y throughput: no disponible. El autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM-MD-V1-VL-3B | 3,39 mil millones | No disponible | Solo pruebas internas de memoria del autor; sin benchmarks estándar publicados | lfm1.0 (Liquid AI), etiquetada como "other" | HuggingFace, 0 descargas, 0 likes |
| LiquidAI/LFM2.5-VL-3B (modelo base) | 3 mil millones (según la denominación del modelo; cifra exacta no disponible) | No disponible | No disponible en la información proporcionada | lfm1.0 (Liquid AI) | HuggingFace, mantenido por LiquidAI |
| Otros VLM compactos de la misma categoría (por ejemplo, alternativas de 2-4 mil millones de parámetros) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de terceros que permitan una comparación cuantitativa fiable. La única comparación defendible con los datos disponibles es con el modelo base, del que se conoce que aporta el stack de lenguaje, el codificador visual y la plantilla de chat, mientras que LFM-MD-V1-VL-3B añade la capa de memoria persistente.

## Limitaciones y advertencias

- La predicción directa del extremo de una cadena lejana es sustancialmente más débil que el recuerdo escalonado: el modelo es fiable recuperando paso a paso, no saltando directamente al resultado final.
- El grafo aislado no recuperó de forma independiente las asociaciones aleatorias probadas, según reconoce el propio autor.
- La conectividad biológica del grafo es un prior computacional; el autor no establece superioridad frente a topologías aleatorias emparejadas.
- Resultados de evaluación basados en muestras pequeñas y pruebas de desarrollo controladas (54 marcos, 32 preguntas, 48 cadenas, 6 consultas), no en conjuntos de evaluación estándar.
- No hay benchmarks públicos de MMLU, GSM8K, HumanEval, MMMU ni similares, lo que impide situar el modelo frente a alternativas.
- Sesgo y alucinación: al ser un ajuste de un modelo de 3,39 mil millones de parámetros, el riesgo de alucinación es alto en tareas de conocimiento abierto; no se documentan evaluaciones de sesgo.
- Idiomas: la model card declara únicamente chino e inglés; el rendimiento en castellano u otros idiomas no está validado y probablemente sea degradado.
- Licencia: lfm1.0 (Liquid AI), etiquetada como "other". Es una licencia personalizada que hay que revisar en el archivo LICENSE del repositorio antes de cualquier uso comercial; no se detallan aquí sus condiciones porque no están en la información proporcionada.
- Dependencia de código personalizado: requiere trust_remote_code=True y el runtime propio del repositorio. Esto implica superficie de ataque adicional, dificultad de auditoría y posible incompatibilidad con servidores de inferencia estándar.
- Gestión de estado: la memoria persistente introduce estado por sesión (pesos rápidos, momentum, unidades archivadas). En producción obliga a diseñar políticas de versionado, aislamiento entre usuarios y limpieza de disco que un modelo sin memoria no requiere.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, con fechas de creación y actualización muy recientes, por lo que no existe contraste independiente de las afirmaciones del autor.
- Los módulos VAE y Dream están ausentes de la arquitectura; cualquier flujo que asuma su presencia no aplica.
- No se documentan capacidades de tool calling, agentes, audio ni visión más allá de imagen-texto, por lo que no deben asumirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/win10/LFM-MD-V1-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Paper referenciado en las etiquetas del modelo (arXiv:2501.00663): https://arxiv.org/abs/2501.00663
- Licencia del modelo (archivo LICENSE del repositorio): https://huggingface.co/win10/LFM-MD-V1-VL-3B/blob/main/LICENSE
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a páginas de servicios de certificación digital sin relación con el modelo, por lo que no se incluyen.
