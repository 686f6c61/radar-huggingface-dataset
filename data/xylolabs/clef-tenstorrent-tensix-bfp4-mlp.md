# Xylolabs/clef-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Clef para Tenstorrent Tensix (BFP4 MLP) es una exportación cuantizada del modelo Cloudflare/clef, un modelo de decisión de texto que no genera respuestas libres sino que puntúa opciones predefinidas en una sola pasada forward. Lo publica Xylolabs con el objetivo de ejecutarlo sobre aceleradores Tenstorrent Tensix mediante la pila TT-NN/tt-metal, aplicando block floating point (BFP) para reducir el peso de los pesos en memoria. El modelo base es un transformer híbrido con componentes de atención y DeltaNet, y esta exportación conserva el joint schema head y la tabla léxica originales en BF16.

El modelo tiene 27.356.728.560 parámetros totales (unos 27,4 mil millones) y un repositorio de 55 GB, aunque el autor estima unos 23,59 GB de memoria de dispositivo para los pesos retenidos del backbone, el joint head y la tabla léxica, más espacio para KV cache y buffers. La tarea cualificada es la inferencia de decisión solo texto: recibe un estado estructurado y un conjunto de preguntas con opciones permitidas, y devuelve una distribución de probabilidad por opción. Es relevante para quienes despliegan modelos de clasificación y decisión sobre hardware Tenstorrent y necesitan una representación compatible con BFP4/BFP8.

La licencia es Apache 2.0 y los idiomas declarados son inglés y coreano. La exportación incluye los pesos de visión del modelo base, pero el autor indica que las entradas de imagen y vídeo no se verificaron en este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y DeltaNet (heredada de Cloudflare/clef); cuantización block floating point sobre Tensix |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLP gate/up/down en bfloat4_b (4,5 bits por peso, GPTQ con búsqueda de exponente por bloque); proyecciones de atención y DeltaNet en bfloat8_b (8,5 bits por peso, round to nearest); joint schema head, tabla léxica, embeddings de entrada, normas y encoder de visión en BF16 |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como BF16 sobre su rejilla block-floating; incluye quant4.json y pack_tensix.py) |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef es un transformer híbrido que combina capas de atención con capas DeltaNet, según se deduce de los tensores mencionados en la model card (proyecciones de atención y DeltaNet). Sobre ese backbone se añade un joint schema head y una tabla léxica de lenguaje original en BF16, que permiten formular la tarea como una evaluación de opciones: el modelo recibe un estado estructurado y preguntas tipadas (por ejemplo, "choice" o "noul") con sus criterios, y devuelve logits por opción en una única pasada forward, sin decodificación autoregresiva.

La cuantización la realiza Xylolabs con su herramienta tensix-bfp-gptq. Las capas MLP gate/up/down usan BFP4 con GPTQ y búsqueda de exponente por bloque con damping 0,1; las proyecciones de atención y DeltaNet usan BFP8 con redondeo al más cercano. La calibración emplea 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El autor indica que las 496 proyecciones cuantizadas pasan la comprobación de rejilla, el empaquetado nativo de TT-NN y el empaquetado como BFP8, verificado con TT-NN 0.81.1 y el simulador Blackhole. No se detallan en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión de texto: devuelve una puntuación por cada opción permitida de una pregunta, sin generar texto libre.
- Evaluación de múltiples preguntas en una sola pasada forward, con preguntas de tipo elección ("choice") y de tipo "noul".
- Procesamiento de estados estructurados (por ejemplo, objetos JSON con datos de facturas) junto con instrucciones y criterios por pregunta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo es de decisión puntual, no un agente.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos.
- Pesos de visión retenidos del modelo base, aunque las entradas de imagen y vídeo no se verificaron en esta exportación.
- Inferencia sobre hardware Tenstorrent Tensix mediante TT-NN, con pesos empaquetados en BFP4/BFP8.

## Casos de uso

- Clasificación de documentos empresariales: dado un estado estructurado (por ejemplo, una factura con proveedor, importe, moneda y estado), el modelo puntúa opciones como "pagada", "vencida" o "borrador" en una sola pasada, lo que encaja en pipelines de gestión documental.
- Enrutamiento de tickets de soporte: se define un conjunto cerrado de categorías y el modelo devuelve la probabilidad de cada una, permitiendo asignar el ticket al equipo adecuado sin generar texto.
- Validación de reglas de negocio: preguntas de tipo "noul" como "¿el total supera los 1000 USD?" se responden con una puntuación binaria, útil para controles automáticos en sistemas financieros.
- Moderación y etiquetado de contenido: con opciones predefinidas de política, el modelo asigna una puntuación por categoría, lo que facilita umbrales auditables en lugar de respuestas libres.
- Despliegue en aceleradores Tenstorrent: al estar empaquetado para TT-NN con BFP4/BFP8, puede ejecutarse en hardware Tensix en entornos donde no se dispone de GPU NVIDIA, reduciendo el coste por inferencia en tareas de clasificación de alto volumen.
- Extracción de decisiones en flujos de atención al cliente: combinado con un estado de conversación estructurado, el modelo puede decidir la siguiente acción entre un conjunto cerrado de opciones (escalar, cerrar, solicitar datos), manteniendo la lógica determinista y auditable.
- Investigación sobre cuantización block floating point: el paquete incluye scripts de verificación (pack_tensix.py, verify_grid.py) que permiten reproducir la comprobación de rejilla y el empaquetado, útil para estudiar el impacto de BFP4 en proyecciones MLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo estimada: unos 23,59 GB solo para los pesos retenidos del backbone, el joint head y la tabla léxica, más espacio adicional para KV cache y buffers.
- GPU recomendadas para la ruta Transformers: se necesita una GPU CUDA con capacidad suficiente para los valores BF16 del archivo (el repositorio ocupa 55 GB), por lo que se requieren tarjetas de 24 GB o más, como RTX 4090, A100 o H100, según el autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) para los pesos, aunque el margen para KV cache y buffers es ajustado; no confirmado en la información disponible.
- Despliegue en Tenstorrent: requiere TT-NN 0.81.1 y hardware Tensix (verificado con el simulador Blackhole); tt-transformers y tt-forge no se comprobaron con este paquete.
- Despliegue en GPU: Transformers 5.23.0 con PyTorch y el código personalizado joint_schema_model; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/clef-Tenstorrent-Tensix-BFP4-MLP | 27,36 mil millones | no disponible | Decisión/clasificación de texto | Apache 2.0 | Hugging Face, empaquetado para Tensix |
| Cloudflare/clef (base) | no disponible | no disponible | Decisión/clasificación de texto | no disponible en la información | Hugging Face |
| Alternativas de clasificación tipo BERT | no disponible | no disponible | Clasificación de texto | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve puntuaciones por opción; no es adecuado para tareas generativas.
- Las entradas de imagen y vídeo no se verificaron en esta exportación, aunque los pesos de visión se conservan.
- Los idiomas declarados son solo inglés y coreano; el rendimiento en castellano no está documentado.
- La longitud de contexto no está disponible, lo que dificulta planificar despliegues con documentos largos.
- La cuantización BFP4 en las MLP puede degradar la precisión frente al modelo base en BF16; no se han publicado evaluaciones comparativas.
- El paquete no incluye un runner completo de decisión para Tensix; los scripts incluidos solo verifican la representación de pesos.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser un modelo de puntuación, el riesgo se traslada a la calibración de las opciones y los criterios definidos por el usuario.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Cloudflare/clef, cuya licencia no se detalla en la información proporcionada.
- El repositorio es grande (55 GB) porque los valores cuantizados se almacenan como BF16 sobre su rejilla, lo que aumenta los requisitos de almacenamiento frente a los pesos empaquetados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clef-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/clef-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
