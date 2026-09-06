# wolfram-pro/multilingual-e5-small-coreml

## Resumen

`multilingual-e5-small-coreml` es una conversión a Core ML (formato ML Program) del modelo `intfloat/multilingual-e5-small`, un encoder de oraciones multilingüe de la familia E5 desarrollado por intfloat. El autor `wolfram-pro` ha adaptado este modelo para ejecutarse en dispositivos Apple (iPhone, iPad, Mac) con el fin de usarlo en la aplicación DND Master para búsqueda semántica local. La conversión mantiene la arquitectura original basada en XLM-R y añade dentro del grafo Core ML el masked mean pooling y la normalización L2, de modo que la salida es directamente un embedding normalizado de 384 dimensiones. El repo ocupa 0,3 GB, está disponible con licencia MIT y soporta ruso e inglés, con capacidades multilingües heredadas de XLM-R.

Al tratarse de un modelo de extracción de características (feature-extraction) y no de un modelo generativo, su uso principal es la recuperación de información semántica, clustering, clasificación o sistemas de recomendación en el dispositivo. La ficha incluye la paridad verificada con la implementación PyTorch de referencia y con una implementación MLX, lo que facilita su integración en pipelines de IA locales sobre Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R) convertido a Core ML ML Program |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (formas enumeradas: 16, 32, 64, 128, 256, 512) |
| Tipos de cuantizacion | fp16 |
| Idiomas soportados | ruso, inglés, multilingüe (XLM-R) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML ML Program) |

## Arquitectura y entrenamiento

El modelo base, `intfloat/multilingual-e5-small`, es un encoder de oraciones de la familia E5 que utiliza una arquitectura XLM-R (variante de BERT) y produce embeddings de 384 dimensiones. Se entrena mediante aprendizaje contrastivo con los prefijos `query: ` y `passage: ` para distinguir consultas de documentos. La conversión a Core ML no modifica los pesos: la salida del grafo incluye el masked mean pooling y la normalización L2, lo que permite obtener directamente el vector semántico normalizado.

Durante la conversión se realizaron dos adaptaciones técnicas relevantes. Primero, se usaron formas de entrada enumeradas en lugar de un rango flexible, porque Core ML devolvía NaN al usar `RangeDim`. Segundo, la máscara atencional aditiva se sustituyó por `-1e4` antes del trazado, ya que el valor predeterminado `finfo(float32).min` desbordaba a `-inf` en fp16 y provocaba NaN en el softmax. La verificación de paridad con el modelo de referencia PyTorch arroja un coseno de 1.000000, y con una implementación MLX fp16 sobre un corpus ruso de 12.270 fragmentos, un coseno mínimo de 0.9997.

## Capacidades

- Genera embeddings semánticos multilingües para consultas (`query: `) y documentos (`passage: `).
- Búsqueda semántica en dispositivos Apple (iPhone, iPad, Mac) mediante Core ML.
- Soporta ruso e inglés de forma documentada, con la multilingüidad general del modelo base XLM-R.
- El grafo Core ML incluye el pooling por media enmascarada y la normalización L2, eliminando la necesidad de implementar esos pasos en la aplicación.
- No es un modelo de generación de texto, por lo que no soporta tool calling, agentes, ni razonamiento multi-step.
- No admite entradas de longitud variable arbitraria: sólo las dimensiones enumeradas (16, 32, 64, 128, 256 y 512 tokens).
- Basado en Apple silicon: se recomienda usar `.cpuAndNeuralEngine`, ya que la GPU es aproximadamente 25 veces más lenta para este grafo.

## Casos de uso

- Búsqueda semántica en una app de referencia de D&D: el modelo indexa el bestiario local y permite buscar monstruos o cartas por descripción natural. Gracias a los 512 tokens de ventana, maneja descripciones largas sin truncar.
- Recuperación de información multilingüe sin conexión: una app de lectura puede indexar artículos en ruso e inglés y responder a consultas del usuario sin enviar datos a servidores externos.
- Sistema de recomendación de contenido en iOS: se calcula la similitud coseno entre el embedding del artículo actual y los embeddings del catálogo local, generando sugerencias en tiempo real en el dispositivo.
- Clasificación ligera de textos sobre Apple silicon: los embeddings de 384 dimensiones alimentan un clasificador sencillo (por ejemplo, regresión logística) para detectar categorías en notas o documentos, sin necesidad de infraestructura en la nube.
- Agrupación de fragmentos de un corpus extenso: permite clusterizar un conjunto de entradas locales (por ejemplo, las 12.270 entradas del corpus mencionado en la conversión) para detectar temas o grupos semánticos similares.
- Detección de contenido duplicado o parafraseado: una app de redacción compara embeddings de párrafos distintos para avisar cuando dos fragmentos son semánticamente redundantes.
- RAG en el dispositivo: los embeddings alimentan una base vectorial local, de modo que un asistente puede recuperar pasajes relevantes del dispositivo antes de generar una respuesta, manteniendo la privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta únicamente verificaciones de paridad con la implementación de referencia:

| Configuración | Resultado |
|---|---|
| Paridad con PyTorch (frases de prueba) | coseno 1.000000 |
| Paridad con MLX fp16 (corpus ruso de 12.270 fragmentos) | coseno mínimo 0.9997 |

No se aportan resultados en conjuntos estándar como MMLU, GSM8K, HumanEval ni en benchmarks de recuperación (por ejemplo, MTEB).

## Requisitos de hardware

- Memoria unificada: el repositorio ocupa 0,3 GB; el modelo fp16 está pensado para ejecutarse en dispositivos Apple con memoria unificada. No se indica VRAM porque no aplica.
- Procesador: Apple silicon (por ejemplo, Apple M1 o posterior). Se recomienda `.cpuAndNeuralEngine` como compute unit; la GPU en Apple se ha medido unas 25 veces más lenta para este grafo.
- Consumer GPU (NVIDIA, AMD): no aplicable, ya que el formato Core ML no es compatible con esos controladores ni con los runtimes habituales de Linux.
- Despliegue: Core ML vía Xcode en Swift, o mediante `coremltools` en Python para evaluaciones puntuales. No es compatible con vLLM, llama.cpp, Ollama, TGI ni con el formato GGUF.
- Requisitos de sistema: iOS 18 o versiones posteriores para mínimo `minimum_deployment_target`.
- Latencia y throughput: no disponible en la información aportada.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Salida | Licencia |
|---|---|---|---|---|---|
| `wolfram-pro/multilingual-e5-small-coreml` | Core ML (`.mlpackage`) | no disponible | 512 | 384 | MIT |
| `intfloat/multilingual-e5-small` (base) | PyTorch (safetensors) | no disponible | 512 | 384 | MIT |
| `tamikisg/multilingual-e5-small-coreml` | Core ML (`.mlpackage`) | no disponible | 512 | 384 | MIT |

Las tres versiones comparten la misma arquitectura y los mismos pesos del modelo original. Las diferencias prácticas están en el formato de despliegue: el base se usa con `transformers` en entornos Python, mientras que las dos conversiones Core ML están diseñadas para ejecución en dispositivos Apple. No se dispone de datos de rendimiento adicionales para comparar más allá de la paridad reportada por `wolfram-pro`.

## Limitaciones y advertencias

- El modelo no es generativo: solo produce embeddings, por lo que no puede redactar ni continuar texto.
- La ventana de entrada está restringida a las longitudes enumeradas (16, 32, 64, 128, 256 y 512 tokens). Cualquier otra longitud dará lugar a un error o deberá manejarse fuera del modelo.
- La documentación del autor se centra en ruso e inglés; el rendimiento en otros idiomas no está evaluado en esta conversión.
- La máscara aditiva se ha alterado a `-1e4` para evitar NaN en fp16. Aunque la paridad reportada es alta, esta modificación podría introducir pequeñas diferencias numéricas en casos extremos.
- El paquete requiere iOS 18 o superior y dispositivos Apple; no es portable a otros ecosistemas ni a servidores Linux.
- La aceleración por GPU en Apple es significativamente más lenta (≈25×) que la CPU + Neural Engine, por lo que se debe configurar correctamente el compute unit.
- El modelo original puede reflejar sesgos de sus datos de entrenamiento multilingües; esta conversión no incluye una evaluación de sesgos específica.
- Al usar el modelo para RAG o recuperación, los documentos deben truncarse o dividirse en fragmentos de hasta 512 tokens para no perder información.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wolfram-pro/multilingual-e5-small-coreml)
- [Modelo base intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small)
- [Conversión Core ML similar de tamikisg](https://huggingface.co/tamikisg/multilingual-e5-small-coreml)
