# tinyopsec/Meta-Llama-3-8B-Instruct-Jailbroken-GGUF

## Resumen

Meta-Llama-3-8B-Instruct-Jailbroken-GGUF es una redistribución en formato GGUF de `cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken`, un derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una técnica de *weight orthogonalization* (Arditi et al., 2024) para eliminar el comportamiento de rechazo. El publicador es el usuario `tinyopsec`, que se limita a convertir los pesos a 13 cuantizaciones distintas mediante llama.cpp; no hay indicios de entrenamiento adicional ni de evaluación propia.

El modelo conserva la arquitectura y el tamaño del original: transformer decoder-only de 8.030.261.248 parámetros (unos 8B), con la tokenizador propio de Llama 3 y una ventana de contexto de 8.192 tokens según la documentación del modelo base. El repositorio ocupa 31,2 GB y ofrece desde F16 (16,1 GB) hasta Q2_K, lo que permite ejecutarlo en GPU de consumo e incluso en CPU.

Su relevancia es acotada y muy específica: sirve como material de estudio para investigación en seguridad y alineación (medir cuánto del comportamiento de rechazo depende de una única dirección en el espacio de pesos), no como modelo de propósito general. El repositorio no declara idiomas soportados, no incluye benchmarks y no tiene descargas ni validación comunitaria en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), pesos derivados del modelo instruct por ortogonalización |
| Parametros totales | 8.030.261.248 (aproximadamente 8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base; el repositorio no la declara explícitamente) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponibles (el repositorio no los declara) |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | GGUF (13 archivos, generados con llama.cpp) |
| Tamaño del repositorio | 31,2 GB |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Modelo intermedio | cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken (safetensors) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-26 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3 8B Instruct original de Meta: un transformer decoder-only con atención causal y tokenizador propio de Llama 3, optimizado para diálogo mediante instruction tuning sobre datos conversacionales. Este repositorio no reentrena ni modifica la topología: parte de los pesos safetensors del derivado de `cooperleong00` y los convierte a GGUF con llama.cpp, sin cambios en el grafo de cómputo.

La única modificación respecto al instruct original es la eliminación del rechazo mediante *weight orthogonalization*, la técnica descrita por Arditi et al. (2024). El procedimiento identifica una dirección en el espacio de pesos o activaciones asociada al comportamiento de refusal y proyecta los pesos ortogonalmente respecto a ella, de forma que el modelo deja de activar esa respuesta sin pasar por fine-tuning ni RLHF adicional. El autor de la model card presenta el resultado como material para investigación académica en seguridad de IA. No se especifica qué capas se intervinieron, qué conjunto de prompts se usó para estimar la dirección ni si hubo verificación posterior; tampoco se documenta la composición del dataset de entrenamiento original (número de tokens, mezcla de datos, fases de RLHF/DPO), que corresponde a la documentación de Meta y no está incluida en la información disponible.

## Capacidades

- Generación de texto y diálogo multi-turno en formato chat, con el template de Llama 3 (`<|start_header_id|>` / `<|end_header_id|>`).
- Seguimiento de instrucciones y respuesta a preguntas, heredado del ajuste instructivo del modelo base.
- Comportamiento de rechazo suprimido por diseño: el modelo no activa la negativa aprendida ante peticiones que el instruct original rechazaría. Esta es la capacidad diferenciadora y el objeto de estudio del repositorio.
- Razonamiento y código: no hay evaluación publicada en este repositorio; cualquier afirmación sobre matemáticas, código o MMLU requeriría medirla contra el modelo base.
- Tool calling / function calling: no documentado en la información disponible. El modelo base Llama 3 8B Instruct no incorpora un formato nativo de herramientas, por lo que cualquier uso de este tipo exige serializar las funciones en el prompt.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Multilingüismo: no declarado; el repositorio no lista idiomas.
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles; el modelo es exclusivamente texto.

## Casos de uso

- Investigación en alineación y seguridad: replicar el experimento de ortogonalización sobre las 13 cuantizaciones para medir si la supresión del rechazo se mantiene al reducir la precisión de los pesos. Es el uso que declara el autor y el único para el que el artefacto está pensado.
- Evaluación de guardrails y clasificadores de salida: usar el modelo como generador negativo frente al instruct original y comprobar la tasa de detección de un filtro de contenido en cada cuantización (Q2_K frente a Q8_0), lo que da una curva de robustez del clasificador.
- *Red teaming* de pipelines propios: generar respuestas sin rechazo para probar si los sistemas de moderación posteriores aguantan entradas que un modelo alineado habría bloqueado antes de llegar al filtro.
- Estudio de degradación por cuantización: con 13 variantes del mismo modelo se puede medir cómo cambia la perplejidad, la coherencia y la tasa de respuestas dañinas entre Q2_K y F16 usando un conjunto fijo de prompts, sin variar otros factores.
- Docencia en cursos de seguridad de IA: demostrar en una sola sesión práctica cómo una intervención lineal sobre los pesos altera un comportamiento entrenado, comparando cara a cara con `meta-llama/Meta-Llama-3-8B-Instruct`.
- Despliegue local en máquina aislada: con Q4_K_M (aproximadamente 4,9 GB) se ejecuta en una RTX 3060 de 12 GB mediante llama.cpp u Ollama para experimentos *offline* sin enviar prompts a terceros; útil cuando el material de análisis no puede salir de la organización.
- Generación de conjuntos de datos adversarios: producir pares pregunta-respuesta para entrenar o ajustar clasificadores de contenido dañino, siempre sobre datos sintéticos y con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card ni el repositorio del modelo intermedio incluyen MMLU, HumanEval, GSM8K ni ninguna medición del impacto del *jailbreak* sobre la calidad del modelo. Cualquier cifra que se quiera usar en producción debe medirse localmente contra `meta-llama/Meta-Llama-3-8B-Instruct` con el mismo harness y la misma cuantización.

## Requisitos de hardware

Los tamaños de pesos distintos de F16 son estimaciones calculadas a partir de 8,03B de parámetros y la profundidad de bits de cada cuantización; solo F16 (16,1 GB) está confirmado por el autor. La VRAM indicada añade 1 GiB de caché KV a 8.192 tokens (32 capas, 8 cabezas KV, dimensión 128, FP16) más entre 0,5 y 1 GiB de overhead del runtime.

| Cuantizacion | Pesos (aprox.) | VRAM estimada a 8k | GPU de ejemplo |
|---|---|---|---|
| F16 | 16,1 GB (dato del autor) | ~18 GB | RTX 4090 24 GB, A100 40 GB, H100 |
| Q8_0 | ~8,5 GB | ~10,5 GB | RTX 4080 16 GB, RTX 4090 |
| Q6_K | ~6,6 GB | ~8,5 GB | RTX 4060 Ti 16 GB, RTX 4070 |
| Q5_K_M | ~5,7 GB | ~7,5 GB | RTX 3060 12 GB, RTX 4060 Ti |
| Q4_K_M | ~4,9 GB | ~6,5 GB | RTX 3060 12 GB; RTX 4060 8 GB muy justo |
| Q3_K_M | ~4,0 GB | ~5,5 GB | GTX 1660 Super 6 GB, RTX 3050 8 GB |
| Q2_K | ~3,0 GB | ~4,5 GB | iGPU con 8 GB compartidos o CPU |

- Cabe en GPU de consumo desde Q5_K_M hacia abajo; Q4_K_M es el punto de equilibrio razonable entre calidad y VRAM.
- En CPU funciona con llama.cpp puro: reservar como mínimo el tamaño de los pesos más 2-3 GB de RAM para el contexto y el propio proceso.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, Jan y bindings tipo `llama-cpp-python`. vLLM y TGI no están pensados para GGUF; si se necesita serving de alto rendimiento con batching, conviene partir de los safetensors del modelo intermedio y convertirlos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Particularidad |
|---|---|---|---|---|---|
| tinyopsec/Meta-Llama-3-8B-Instruct-Jailbroken-GGUF (este) | 8,03B | 8.192 tokens (según base) | GGUF, 13 cuantizaciones | Llama 3 | Rechazo eliminado por ortogonalización; solo GGUF |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 tokens | safetensors | Llama 3 | Modelo de referencia alineado, con rechazo intacto |
| cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken | 8,03B | 8.192 tokens (según base) | safetensors (varios shards) | Llama 3 | Mismo *jailbreak* en precisión completa; insumo de esta conversión |
| MaziyarPanahi/Meta-Llama-3-8B-Instruct-GGUF | 8,03B | 8.192 tokens (según base) | GGUF | Llama 3 | Cuantizaciones del instruct estándar, sin modificar |

La comparación relevante es contra el instruct original y contra el derivado en safetensors: los tres comparten pesos base y diferirían únicamente en la proyección ortogonal y en la cuantización. No hay datos de rendimiento que permitan afirmar cuánta capacidad se pierde en el proceso.

## Limitaciones y advertencias

- El rechazo está suprimido por diseño: el modelo responderá a peticiones que el instruct original bloquea, incluidas categorías prohibidas por la política de uso de la licencia Llama 3. Publicar o desplegar este artefacto de forma que se faciliten esos usos puede constituir un incumplimiento de licencia.
- Uso previsto declarado: exclusivamente investigación académica en seguridad y alineación. El propio autor declina responsabilidad por mal uso.
- La licencia Llama 3 Community License se hereda del modelo base e incluye condiciones de atribución ("Built with Meta Llama 3"), límite de 700 millones de usuarios activos mensuales para ciertos usos y una política de uso aceptable que restringe varios escenarios.
- Sin evaluación: no hay benchmarks, ni medición de la tasa de respuestas dañinas, ni comprobación de que la ortogonalización no degrade razonamiento, código o coherencia en las cuantizaciones bajas (Q2_K y Q3_K_S son especialmente sospechosas de degradación).
- Sesgos: heredados del corpus de entrenamiento de Llama 3; no hay ninguna auditoría específica sobre este derivado.
- Alucinación: riesgo equivalente al del instruct original, sin mitigaciones adicionales; el *jailbreak* no reduce la tendencia a inventar datos.
- Contexto limitado a 8.192 tokens; no admite ventanas largas y el rendimiento decae en los extremos de la ventana.
- Idiomas no declarados en el repositorio; el comportamiento multilingüe no está verificado.
- Procedencia opaca: 0 descargas, 0 likes, fecha de creación anómala (2026-10-26) y ausencia de documentación sobre el método exacto (capas intervenidas, prompts usados, validación). Conviene verificar la integridad de los GGUF antes de ejecutarlos.
- Sin soporte nativo de herramientas ni de agentes; cualquier integración de ese tipo requiere ingeniería de prompt adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/Meta-Llama-3-8B-Instruct-Jailbroken-GGUF
- Modelo intermedio en safetensors: https://huggingface.co/cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Cuantizaciones GGUF del instruct estándar (referencia comparativa): https://huggingface.co/MaziyarPanahi/Meta-Llama-3-8B-Instruct-GGUF
- Ficha del modelo base con contexto de 8.192 tokens: https://www.aimodels.fyi/models/replicate/meta-llama-3-8b-instruct-meta
- Guía de ejecución local con Ollama: https://aiindigo.com/tutorials/getting-started-with-meta-llama-3-8b-instruct-running-local-ai
- Referencia técnica del método citada en la model card: Arditi et al., 2024 (weight orthogonalization); no se incluye URL en la información disponible.
