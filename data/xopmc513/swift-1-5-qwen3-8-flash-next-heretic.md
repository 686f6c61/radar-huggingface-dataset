# XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-Heretic es una derivación comunitaria del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por XopMC513 (Strata). Se trata de un transformer de mezcla de expertos (MoE) con 48 capas de texto, 512 expertos enrutados por capa y 10 expertos activos por token, contexto nativo de 262.144 tokens (ampliable a 512k y 1M con configuraciones Strata compatibles) y componentes de visión que lo sitúan en la categoría image-text-to-text. El modelo conserva la red MoE completa: no hay poda de expertos.

El problema que aborda es doble. Por un lado, mantiene el estilo de razonamiento «token-efficient» del modelo base, con plantilla de chat y controles de thinking, además de los activos de tool-use y visión originales. Por otro, aplica una edición «Heretic» de tipo ARA (abliteration) deliberadamente contenida: solo se modifican un pequeño conjunto de proyecciones residuales, dejando fuera del ajuste los expertos enrutados, los routers, los embeddings, la visión y la cabeza MTP.

Su relevancia práctica está en el empaquetado: se distribuyen tres formatos de pesos (BF16 safetensors de 360 GB, GGUF Q4_K_M de 119,35 GB más un proyector de visión de 0,91 GB y un paquete NVFP4 mixto de 111,06 GB) junto con una cabeza MTP Q4 para decodificación especulativa. La contrapartida es que el paquete NVFP4 exige un cargador Strata propio y el GGUF requiere soporte Qwen4Exp, por lo que no es un checkpoint desplegable en stacks Transformers estándar (la propia model card marca `inference: false`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con 48 capas de texto, componentes de visión y cabeza MTP para decodificación especulativa |
| Parámetros totales | No disponible (la model card no publica la cifra) |
| Parámetros activos | 10 expertos enrutados activos por token sobre 512 expertos por capa; cifra absoluta no disponible |
| Longitud de contexto | 262.144 tokens nativos; 512k y 1M con configuraciones Strata compatibles |
| Tipos de cuantización | BF16, GGUF Q4_K_M (tensores sensibles en mayor precisión), NVFP4 mixto; cabeza MTP Q4 para decodificación especulativa |
| Idiomas soportados | inglés (en) y ruso (ru) |
| Licencia | swift-open-license-1.0 (campo `license: other`), con Qwen license y NOTICE retenidos |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M), paquete NVFP4 para runtime Strata |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 48 capas de texto con 512 expertos enrutados por capa y 10 activos por token, sin poda de expertos: todos los expertos enrutados del modelo base se conservan. Incluye un stack de visión (pipeline image-text-to-text y proyector de visión de 0,91 GB en el paquete Q4_K_M) y una cabeza MTP (multi-token prediction) que el autor distribuye en cuantización Q4 para decodificación especulativa en runtimes compatibles; los tokens borrador deben ser verificados por el modelo principal.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base. Respecto al ajuste de esta versión, la model card describe una edición «Heretic» basada en ARA (abliteration) aplicada de forma selectiva a un pequeño conjunto de proyecciones residuales, manteniendo intactos routers, embeddings, visión y MTP, con el objetivo de reducir rechazos innecesarios sin alterar sustancialmente el comportamiento del modelo original. Los expertos NVFP4 se convierten desde el checkpoint BF16 Heretic con una política de precisión mixta para el resto de componentes y pesos de visión en BF16.

## Capacidades

- Generación de texto y razonamiento con modo thinking y controles de plantilla de chat heredados del modelo base.
- Razonamiento token-efficient: el autor lo presenta explícitamente como «efficient-thinking» y «token-efficient».
- Generación y edición de código; el paquete Q4_K_M reporta 152/164 tareas HumanEval BASE en evaluación local.
- Tool calling / function calling: se incluyen los activos de tool-use originales del modelo base.
- Uso de agentes y razonamiento multi-paso apoyado en contexto largo (262.144 tokens nativos).
- Procesamiento de imagen y texto: pipeline image-text-to-text con componentes de visión incluidos en los tres formatos.
- Capacidades multilingües limitadas a inglés y ruso según los metadatos de idioma.
- Decodificación especulativa mediante cabeza MTP Q4 compatible con decodificadores que verifiquen los tokens borrador.
- Modificación «abliterated» orientada a reducir rechazos, con alcance restringido a proyecciones residuales.

## Casos de uso

- Revisión y generación de código en CI/CD: el modelo puede integrarse en pipelines que envíen diffs y reciban parches, apoyándose en el rendimiento reportado en HumanEval BASE (92,68% en Q4_K_M) y en la ventana de 262.144 tokens para incluir el repositorio relevante como contexto.
- Agentes con tool calling: al conservar los activos de tool-use y la plantilla de chat del modelo base, sirve para orquestar llamadas a APIs y razonamiento multi-paso con contexto largo en un mismo prompt.
- Análisis de documentación técnica extensa: con 262.144 tokens nativos (y extensión a 512k/1M vía Strata) puede ingerir manuales, expedientes o bases de código completas sin troceado agresivo.
- Procesamiento de capturas, diagramas y documentación escaneada: el pipeline image-text-to-text y el proyector de visión permiten combinar imagen y texto en la misma conversación.
- Despliegue on-premise con offload CPU+GPU: el paquete Q4_K_M (119,35 GB) o NVFP4 (111,06 GB) permite servir el modelo en un nodo con CPUs de muchos núcleos y una sola GPU, con throughput medido de 173-182 tokens/s de generación en la configuración de referencia.
- Atención al cliente en inglés y ruso: cubre conversaciones multi-turno con historial largo, aunque la ausencia de castellano en los idiomas declarados obliga a evaluar su calidad en español antes de usarlo en producción.
- Servicio de inferencia con decodificación especulativa: usar la cabeza MTP Q4 junto a un decoder compatible para reducir latencia por token en cargas de generación larga.
- Investigación sobre abliteration: el alcance acotado de la edición ARA sobre proyecciones residuales lo convierte en un caso de estudio controlado para medir el efecto de estas técnicas sobre rechazos y calidad.

## Benchmarks y rendimiento

| Evaluación | Resultado | Condiciones |
|---|---|---|
| HumanEval BASE (Q4_K_M) | 152/164 tareas (92,68%) | Evaluación local, extracción de formato conservadora; alcance y puntuación en EVIDENCE.json |
| HumanEval BASE (NVFP4 vs Q4_K_M) | Misma puntuación por tarea | Comprobación emparejada limitada |

| Contexto | Generación (tokens/s) | Procesamiento de prompt (tokens/s) |
|---|---:|---:|
| 256k | 173,3 | 5.297 |
| 512k | 181,8 | 4.752 |
| 1M | 175,3 | 3.833 |

Las cifras de throughput son medianas de tres ejecuciones en 2x AMD EPYC 9754 + 1x RTX 4090, con prompts nuevos y MTP verificado por el modelo principal, en el backend NVFP4. No se han publicado resultados de MMLU, GSM8K ni otras evaluaciones estándar en la información disponible.

## Requisitos de hardware

- Pesos: 360 GB en BF16, 119,35 GB + 0,91 GB de proyector de visión en Q4_K_M, 111,06 GB en el paquete NVFP4. Cualquier despliegue exige, como mínimo, ~112 GB de almacenamiento y memoria agregada.
- BF16: requiere del orden de 360 GB de memoria, lo que implica varios aceleradores de 80 GB (por ejemplo, 8x H100/A100 80 GB) o particionado multinodo.
- Q4_K_M y NVFP4: no caben en una GPU de consumo de 24 GB; opciones realistas son 2x H100/A100 80 GB, 4-6x RTX 4090/3090 con offload parcial, o un nodo con mucha RAM y una sola GPU.
- Configuración de referencia medida: 2x AMD EPYC 9754 (CPU) + 1x RTX 4090, con 173-182 tokens/s de generación y 3.833-5.297 tokens/s de preprocesado de prompt.
- Despliegue: runtimes GGUF con soporte Qwen4Exp para el paquete Q4_K_M; cargador Strata nativo para NVFP4 (no es un checkpoint drop-in de Transformers/ModelOpt). No se confirma soporte en vLLM, TGI u Ollama.
- La model card marca `inference: false`: no está pensado para Inference API/Endpoints estándar de Hugging Face.
- El código del runtime no se incluye en el repositorio de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-Flash-Next-Heretic | No disponible | 262.144 (hasta 1M con Strata) | HumanEval BASE 92,68% (Q4_K_M, local) | swift-open-license-1.0 | Pesos BF16, GGUF y NVFP4; runtime no incluido |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | No disponible | No disponible en la información proporcionada | No disponible | No disponible | Modelo base en Hugging Face |
| Swift-1.5-Qwen3.8-Flash-Next-EXL3-4.05bpw-heretic | No disponible | No disponible | No disponible | No disponible | Cuantización EXL3 de 4,05 bpw (referenciada en búsqueda) |
| Swift-1.5-Qwen3.8-Flash-Next-Gentle-Heretic-Strata | No disponible | No disponible | No disponible | No disponible | Variante hermana del mismo autor (referenciada en búsqueda) |

No se dispone de datos verificables de benchmarks ni de especificaciones completas de las alternativas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés y ruso declarados; el rendimiento en castellano no está documentado.
- La edición abliterated reduce rechazos, pero no garantiza respuestas libres de rechazo ni libres de errores; puede degradar las salvaguardas del modelo original y requerir filtros externos en producción.
- La evaluación publicada se limita a HumanEval BASE con 164 tareas en entorno local y extracción de formato conservadora; no es una garantía general de calidad.
- No hay resultados de MMLU, GSM8K, evaluaciones multilingües ni de seguridad en la información disponible.
- Licencia `other` (swift-open-license-1.0) con Qwen license y NOTICE retenidos: es obligatorio revisar las condiciones de uso comercial antes de desplegar.
- El paquete NVFP4 no es drop-in en Transformers/ModelOpt y exige un cargador Strata compatible; el GGUF necesita soporte Qwen4Exp. El código del runtime no se distribuye con los pesos.
- El repositorio no incluye inferencia lista para usar (`inference: false`), lo que complica pruebas rápidas y despliegues gestionados.
- Tamaño prohibitivo para hardware de consumo: 111-360 GB de pesos según formato.
- Señales de validación comunitaria muy bajas (0 descargas, 2 likes) y metadatos de fecha de creación en 2026; conviene tratar la ficha como no contrastada de forma independiente.
- Discrepancia entre el tamaño de repositorio reportado (150,2 GB) y los 360 GB declarados para los pesos BF16, lo que sugiere que el repositorio no contiene la totalidad del checkpoint en todos los formatos.
- Riesgo de alucinación no cuantificado por el autor.

## Enlaces

- [Hugging Face: XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic)
- [Modelo base: ukisai/Swift1.5-Qwen3.8-Flash-Next](https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next)
- [Pesos BF16 (SOURCE/)](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/tree/main/SOURCE)
- [Paquete GGUF Q4_K_M](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/tree/main/Q4_K_M)
- [Paquete NVFP4](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/tree/main/NVFP4)
- [Cabeza MTP Q4 de producción](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/tree/main/NVFP4/mtp-production-q4)
- [Evidencias de evaluación (EVIDENCE.json)](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/EVIDENCE.json)
- [Contenido del paquete (PACKAGE.json)](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/PACKAGE.json)
- [Listado de ficheros (FILES.json)](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/FILES.json)
- [Licencia Swift (LICENSE)](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/LICENSE)
- [Licencia Qwen (LICENSE-QWEN)](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/LICENSE-QWEN)
- [Aviso legal (NOTICE)](https://huggingface.co/XopMC513/Swift-1.5-Qwen3.8-Flash-Next-Heretic/blob/main/NOTICE)
- [Listado de modelos GGUF en Hugging Face](https://huggingface.co/models?library=gguf&sort=modified)
