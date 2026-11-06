# znaat/parrotflow-syrinx-coreml

## Resumen

ParrotFlow Syrinx es un paquete de modelos Core ML publicado por el desarrollador independiente znaat para el proyecto ParrotFlow, una aplicación de código abierto orientada al procesamiento lingüístico en el ecosistema Apple. El paquete no es un modelo de lenguaje generativo, sino un conjunto de tres funciones de inferencia (masked-LM, parse y NER) que comparten pesos derivados de jhu-clsp/mmBERT-small, un encoder transformer de tipo ModernBERT de pequeno tamano. El repositorio ocupa 0,8 GB e incluye el tokenizador y la configuración del modelo base.

La relevancia de este artefacto es práctica más que investigadora: demuestra un patrón de empaquetado Core ML en el que varios cabezales y adaptadores LoRA de bajo rango conviven sobre una única copia de los pesos base en fp16, con el objetivo de reducir el espacio en disco y permitir que un desarrollador de aplicaciones macOS ejecute análisis sintáctico, desambiguación y reconocimiento de entidades sin necesidad de reexportar el modelo al cambiar un ajuste fino. La licencia MIT y el formato nativo de Apple lo sitúan en el nicho del procesamiento de lenguaje local en dispositivos.

No se dispone de información sobre el número exacto de parámetros totales del modelo base más allá de los datos arquitectónicos inferibles del propio paquete (tabla de embeddings de 256.000 x 384 y 22 bloques), ni de resultados de evaluación publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (base: jhu-clsp/mmBERT-small) |
| Parámetros totales | no disponible (la tabla de embeddings es de 256.000 x 384; el paquete fp16 ocupa 283.340.586 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (función `mask`); 256 tokens (funciones `parse` y `ner`) |
| Tipos de cuantización | fp16 (programa ML principal); existe un paquete fp32 anterior (`parrotflow-syrinx.mlpackage`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlpackage` (programa ML de macOS 15); `syrinx.safetensors` y `cut-filter.safetensors` en el paquete fp32 |
| Modelo base | jhu-clsp/mmBERT-small (snapshot abc32620dd4f6ab06f5fbe905dc25f310618e09f) |
| Funciones incluidas | `mask`, `parse` (por defecto), `ner` |
| Herramientas de exportación | Python 3.13, torch 2.7.0, coremltools 9.0, transformers 4.48.3 |

## Arquitectura y entrenamiento

El paquete se construye sobre mmBERT-small, un encoder transformer de la familia ModernBERT en su variante reducida. El programa `mask` reproduce el masked-LM de `znaat/mmbert-small-coreml` en el commit a983542 sin modificaciones, y el autor declara equivalencia bit a bit en 641 de 641 pruebas. Las funciones `parse` y `ner` reutilizan los bloques del encoder (bloques 0-11 y 0-10 respectivamente) con adaptadores LoRA de rango bajo sobre las proyecciones de atención `attn.Wqkv` y `attn.Wo`.

La innovación técnica principal es el diseño de pesos compartidos: la tabla de embeddings de 256.000 x 384 y los bloques 0-21 se almacenan una sola vez en fp16, y los adaptadores se pasan como entradas del modelo en lugar de fusionarse en los pesos. En `parse` hay dos adaptadores de rango 4 (G, gramatical, y S, sintáctico, con semilla 42 sobre t-silver) con escalado 2.0, aplicados como `x @ W.T + scaling * (x @ A.T) @ B.T`. En `ner` el adaptador es de rango 8 y va embebido como constantes, correspondiente a una ejecución de NER de 13 tipos (semilla 43, época 8). El adaptador G procede de los pesos de desfluidez v1 en Swift y el S del adaptador sintáctico. No se documentan en la información disponible los volúmenes de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, algo esperable al tratarse de un encoder con cabezales supervisados y no de un modelo generativo.

## Capacidades

- Masked language modeling: la función `mask` predice tokens enmascarados sobre secuencias de hasta 64 tokens, con logits de dimensión 256.000.
- Análisis sintáctico y gramatical: la función `parse` devuelve representaciones ocultas (`g_hidden`, `s_hidden`, `s_hidden10`) de los adaptadores gramatical y sintáctico sobre secuencias de hasta 256 tokens.
- Reconocimiento de entidades nombradas: la función `ner` produce la salida cruda del bloque 10 con un adaptador de 13 tipos de entidad.
- Adaptadores intercambiables en tiempo de inferencia: los pesos LoRA de `parse` son entradas del grafo, por lo que un nuevo ajuste fino no requiere reexportar el paquete.
- Ejecución en dispositivo: programa Core ML para macOS 15 sobre `.cpuAndGPU`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio según la información disponible.
- Capacidades multilingües: no documentadas para este paquete, aunque el modelo base mmBERT está orientado a multilingüismo.

## Casos de uso

- Corrección y desambiguación local en aplicaciones macOS: la función `mask` permite puntuar y sustituir tokens enmascarados en frases cortas (hasta 64 tokens) sin salir del dispositivo, útil en correctores ortográficos o sugerencias de escritura.
- Análisis sintáctico en editores de texto: `parse` expone representaciones gramaticales y sintácticas sobre fragmentos de hasta 256 tokens, adecuadas para resaltado estructural, detección de errores de concordancia o reescritura asistida.
- Extracción de entidades en notas y documentos: `ner` con 13 tipos de entidad permite etiquetar personas, organizaciones, lugares y otras categorías en texto de usuario directamente en la app, sin enviar datos a servidores.
- Preprocesamiento para pipelines de PLN en Swift: los paquetes Core ML se integran de forma nativa en aplicaciones Apple, de modo que `parse` y `ner` pueden alimentar clasificadores o indexadores posteriores dentro del mismo proceso.
- Ajuste fino sin reexportación: al recibir los adaptadores LoRA como entradas, un equipo puede entrenar un nuevo adaptador para un dominio concreto y cargarlo en el paquete existente, reduciendo el ciclo de iteración frente a recompilar el modelo completo.
- Investigación sobre eficiencia en el dispositivo: el patrón de pesos compartidos con múltiples cabezales sirve como referencia para estudiar el coste en disco y memoria de empaquetar varias tareas sobre un único encoder.
- Prototipado de asistentes de escritura offline: combinando `mask` y `parse` se pueden construir sugerencias de completado y revisión gramatical que funcionan sin conexión en equipos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación es la equivalencia bit a bit de la función `mask` con el paquete `znaat/mmbert-small-coreml` en 641 de 641 pruebas, que es una comprobación de fidelidad de exportación, no una evaluación de calidad.

## Requisitos de hardware

- VRAM estimada: el paquete fp16 ocupa 283.340.586 bytes (unos 270 MiB), por lo que la huella de memoria es modesta; no se especifica el consumo en tiempo de ejecución.
- GPU recomendadas: cualquier Mac con soporte de Core ML y macOS 15; el autor indica ejecutar en `.cpuAndGPU`, sin detallar modelos concretos de GPU.
- Compatibilidad con GPU de consumo: al estar empaquetado para Core ML, no está pensado para GPU NVIDIA; el despliegue objetivo es hardware Apple (Apple Silicon e Intel con macOS 15).
- Opciones de despliegue: Core ML mediante `MLModelConfiguration` y selección de `functionName`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ParrotFlow Syrinx (este) | no disponible (base mmBERT-small) | 64 / 256 tokens | Core ML | MIT | Multitarea de encoder (mask, parse, NER) en dispositivo |
| znaat/mmbert-small-coreml | mismo base | no disponible | Core ML | no disponible | Solo masked-LM |
| jhu-clsp/mmBERT-small | variante small de mmBERT | no disponible | safetensors (transformers) | no disponible | Encoder multilingüe base |
| Encoders BERT-small genéricos (p. ej. bert-base multilingüe) | ~110 M en bert-base; small inferior | 512 tokens típicos | safetensors, ONNX, etc. | variable | Clasificación y extracción de características |

La comparación con alternativas de la misma categoría es limitada porque no se dispone de parámetros exactos ni de evaluaciones del paquete. Frente a un encoder BERT-small estándar, la diferencia principal es el empaquetado multitarea con pesos compartidos y adaptadores inyectables, no el rendimiento bruto.

## Limitaciones y advertencias

- Modelo de encoder, no generativo: no produce texto libre ni mantiene conversaciones; cualquier uso esperando generación fallará.
- Contexto corto: 64 tokens para `mask` y 256 para `parse` y `ner`, insuficiente para documentos largos sin troceado previo.
- Idiomas soportados no documentados: aunque el base mmBERT es multilingüe, el paquete no declara qué lenguas cubren los adaptadores gramatical, sintáctico y NER.
- Riesgo de alucinación bajo en la acepción generativa, pero los cabezales pueden producir etiquetas o predicciones erróneas en dominios distintos al de entrenamiento; no se publican métricas de precisión o recall.
- Dependencia de plataforma: requiere Core ML y macOS 15; no es portable a entornos Linux o Windows sin conversión adicional.
- Adaptadores con procedencia parcial: G, S y NER provienen de ejecuciones internas del autor (semillas 42 y 43) sin dataset ni evaluación publicados, lo que dificulta reproducir o auditar su calidad.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base jhu-clsp/mmBERT-small, que no se detalla en la información disponible.
- Paquete fp32 heredado: `parrotflow-syrinx.mlpackage` se mantiene solo por compatibilidad con versiones de app que lo fijan; no debe tomarse como la versión recomendada.
- Sin pipeline declarado en Hugging Face ni idiomas etiquetados: la integración automática en herramientas que dependen de esos metadatos no funcionará.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/znaat/parrotflow-syrinx-coreml
- Proyecto ParrotFlow: https://github.com/znat/parrotflow
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Paquete masked-LM previo: `znaat/mmbert-small-coreml` (commit a983542, referenciado en la model card; sin URL directa en la información disponible)
