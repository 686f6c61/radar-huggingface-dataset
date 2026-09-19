# tfukkwang/code-factory-models

## Resumen

`tfukkwang/code-factory-models` es un modelo de lenguaje publicado en HuggingFace por el usuario tfukkwang, cuyo repositorio contiene 4.022.468.096 parámetros almacenados en safetensors (aproximadamente 4,02 mil millones), junto con al menos un archivo en formato GGUF. El nombre del repositorio y la etiqueta `conversational` apuntan a un modelo orientado a generación de código y a diálogo multi-turno, aunque la ficha oficial no publica pipeline, licencia ni idiomas soportados, por lo que esas características no pueden confirmarse con la información disponible.

El modelo se distribuye como pesos abiertos descargables y cuenta con la etiqueta `endpoints_compatible`, lo que indica que el repositorio está preparado para desplegarse en HuggingFace Inference Endpoints sin modificaciones del formato de pesos. Con 4,02 mil millones de parámetros, se sitúa en la franja de modelos "pequeños" que caben en una única GPU de consumo con cuantización, lo que lo hace relevante para escenarios de despliegue local con presupuesto de VRAM limitado.

La relevancia de esta ficha es limitada por la ausencia de documentación técnica: no hay paper, blog, dataset declarado ni resultados de evaluación publicados. La información aquí recogida procede exclusivamente de los metadatos del repositorio y del recuento de parámetros de los archivos safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los metadatos no declaran arquitectura; por el recuento de parámetros y el formato de pesos se trata presumiblemente de un transformer decoder-only, sin confirmación oficial) |
| Parámetros totales | 4.022.468.096 (≈4,02 mil millones) |
| Parámetros activos | no aplica (no hay evidencia de arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible el detalle; el tag `gguf` indica que el repositorio incluye al menos un archivo en formato GGUF cuantizado, pero no se especifican los niveles (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors y GGUF |
| Tamaño del repositorio | 24,4 GB |
| Creado | 19 de septiembre de 2026 |
| Actualizado | 20 de septiembre de 2026 |
| Descargas | 11 |
| Likes | 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El repositorio no incluye ficha técnica con número de capas, dimensiones de embedding, número de cabezas de atención, tipo de normalización ni estrategia posicional. El recuento de parámetros (4.022.468.096) y la presencia de pesos en safetensors y GGUF son los únicos datos verificables. La etiqueta `conversational` sugiere un ajuste orientado a diálogo, pero no hay confirmación de que se haya aplicado fine-tuning por instrucciones, RLHF o DPO.

Tampoco se dispone de información sobre el corpus de entrenamiento: no se declara el número de tokens, la composición del dataset, la proporción de código frente a texto natural, ni si hubo fases de entrenamiento adicionales. Del mismo modo, se desconocen innovaciones técnicas como atención lineal, decodificación especulativa, mezcla de expertos o cualquier variante arquitectónica. El tamaño del repositorio (24,4 GB) es coherente con la coexistencia de varias precisiones de pesos (una copia en precisión alta más una o varias versiones GGUF), pero la composición exacta de archivos no se detalla en la información proporcionada.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está pensado para mantener diálogos multi-turno, aunque no se especifica la longitud de contexto que puede sostener.
- Generación de código: el nombre del repositorio (`code-factory-models`) apunta a un uso orientado a código, si bien no hay documentación oficial que confirme lenguajes soportados ni calidad de generación.
- Compatibilidad con HuggingFace Inference Endpoints: la etiqueta `endpoints_compatible` confirma que el formato de pesos puede desplegarse directamente en ese servicio.
- Ejecución local vía GGUF: la presencia de archivos GGUF permite inferencia en CPU o GPU con llama.cpp y derivados (Ollama, LM Studio, koboldcpp).
- Tool calling / function calling: no disponible (no se declara soporte).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se declara soporte).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio, razonamiento extendido): no disponible.

## Casos de uso

- Asistente de código en local: con 4,02 mil millones de parámetros y versiones GGUF, el modelo puede ejecutarse en un portátil con GPU de 8 GB o incluso en CPU para autocompletado y generación de funciones, sin enviar código propietario a servicios externos. Es adecuado precisamente por el tamaño reducido y por el enfoque aparente en código, aunque la calidad real no está verificada.
- Prototipado rápido con HuggingFace Inference Endpoints: la etiqueta `endpoints_compatible` permite levantar un endpoint gestionado sin convertir pesos, útil para validar un producto conversacional antes de invertir en infraestructura propia.
- Revisión de fragmentos de código en pipelines de CI: el modelo puede invocarse desde un job de integración continua para generar resúmenes de cambios, detectar patrones sospechosos o proponer parches, siempre que se valide su salida con tests automáticos dado que no hay métricas publicadas.
- Generación de documentación técnica: a partir de firmas de funciones y bloques de código, el modelo puede redactar docstrings y documentación de API, tarea que tolera bien modelos pequeños y donde el coste por token importa.
- Chatbot de soporte sobre documentación interna: desplegado con llama.cpp u Ollama sobre una base documental recuperada por RAG, el modelo puede responder preguntas técnicas en un entorno on-premise, algo relevante cuando los datos no pueden salir de la organización.
- Educación y experimentación académica: su tamaño permite hacer fine-tuning con LoRA en una única GPU de 24 GB, lo que lo convierte en una plataforma asequible para investigar técnicas de ajuste o evaluar sesgos en modelos pequeños.
- Preprocesado y transformación de texto: tareas de extracción de campos, normalización de registros o conversión de formatos en lote, donde un modelo de 4B con cuantización Q4 ofrece un coste computacional bajo por documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MBPP ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto documentos técnicos asociados al modelo. No se deben asumir cifras de rendimiento a partir del tamaño de parámetros.

## Requisitos de hardware

Las estimaciones siguientes se derivan del recuento de parámetros publicado (4,02 mil millones) y de cálculos estándar de memoria; no proceden de mediciones oficiales del modelo.

- VRAM estimada para los pesos, sin caché KV ni overhead del runtime:
  - FP32: ≈16,1 GB
  - FP16 / BF16: ≈8,0 GB
  - GGUF Q8_0: ≈4,3 GB
  - GGUF Q5_K_M: ≈2,9 GB
  - GGUF Q4_K_M: ≈2,5 GB
- Overhead adicional: hay que sumar la caché KV (dependiente del contexto configurado, no publicado) y el consumo del motor de inferencia, típicamente entre 0,5 y 2 GB adicionales.
- GPU recomendadas: para FP16 completo, una GPU de 16 GB o más (RTX 4080/4090, A100 40 GB, L40S) evita recurrir a cuantización. Para cuantizaciones Q4 y Q5, basta una GPU de 6-8 GB.
- Cabe en GPU de consumo: sí. Con FP16 cabe en RTX 4060 Ti 16 GB, RTX 4080, RTX 4090; con Q4/Q5 cabe en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070 y similares. En CPU, con Q4_K_M, es viable con 8-16 GB de RAM, aunque con latencia alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp para los archivos GGUF; vLLM, Text Generation Inference (TGI) y Transformers de HuggingFace para los safetensors; HuggingFace Inference Endpoints de forma directa según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a características estructurales y de licencia de alternativas conocidas de tamaño comparable. Las especificaciones de los modelos de la columna derecha corresponden a información pública de sus respectivos repositorios y no se han verificado contra este modelo en ninguna evaluación conjunta.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tfukkwang/code-factory-models | 4,02 B | no disponible | no disponible | safetensors, GGUF | Sin documentación ni benchmarks publicados |
| Qwen2.5-Coder-3B | 3,09 B | 32 768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Variantes de 1,5 B a 32 B; benchmarks publicados |
| Llama 3.2 3B Instruct | 3,21 B | 131 072 tokens | Llama 3.2 Community License | safetensors, GGUF | Requiere cumplir la política de uso aceptable de Meta |
| Phi-3.5-mini-instruct | 3,82 B | 131 072 tokens | MIT | safetensors, GGUF, ONNX | Orientado a razonamiento y código, con benchmarks publicados |

Diferencias clave: las tres alternativas declaran licencia explícita y publican resultados de evaluación, mientras que `code-factory-models` no ofrece ninguna de las dos cosas. Para uso comercial, esa ausencia de licencia es un bloqueo potencial.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial es jurídicamente ambiguo. Conviene contactar con el autor antes de integrar el modelo en un producto.
- Ausencia total de documentación: no se conocen datos de entrenamiento, idiomas, contexto, ni composición del dataset, lo que impide evaluar sesgos o cobertura idiomática.
- Riesgo de alucinación desconocido: no hay evaluaciones de fidelidad ni de tasas de error, por lo que hay que asumir un comportamiento no verificado en tareas de extracción de datos o generación factual.
- Modelo pequeño (4 B): previsiblemente inferior a modelos de 7 B o más en razonamiento complejo, matemáticas y contexto largo, aunque no se dispone de mediciones que lo confirmen.
- Contexto máximo desconocido: no se puede planificar un caso de uso con documentos largos sin conocer la ventana real de tokens.
- Popularidad muy baja: 11 descargas y 0 likes en el momento de redactar esta ficha, lo que reduce la probabilidad de encontrar informes de terceros, incidencias resueltas o soporte de la comunidad.
- Calidad de las cuantizaciones GGUF no verificada: se desconoce qué niveles se han generado y con qué herramienta, por lo que la degradación respecto a los pesos originales es incierta.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Posible disparidad entre el nombre del repositorio y su contenido: el nombre sugiere enfoque en código, pero no hay confirmación de que el ajuste se haya realizado sobre corpus de programación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tfukkwang/code-factory-models
- Búsqueda web realizada: no ha devuelto ningún resultado relacionado con el modelo. Los enlaces obtenidos correspondían a medios de noticias generalistas sin relación con el proyecto (informer.rs y subdominios), por lo que se omiten.
- Paper, blog técnico, repositorio de código, demo o dataset asociados: no disponible en la información proporcionada.
