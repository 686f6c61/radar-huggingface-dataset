# tinyopsec/Sailor2-1B-GGUF

## Resumen

Sailor2-1B-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario `tinyopsec` a partir de `sail/Sailor2-1B`, un ajuste fino de `Qwen/Qwen2.5-0.5B` desarrollado por Sea AI Lab dentro del proyecto Sailor2, orientado a uso multilingüe en el sudeste asiático. El modelo resultante declara 988.064.640 parámetros (≈988 M) en sus pesos safetensors, por encima de los ≈494 M del modelo base, un salto coherente con la ampliación de vocabulario que el proyecto Sailor2 aplica para cubrir lenguas del sudeste asiático.

El interés práctico del repositorio es que empaqueta ese modelo en 13 niveles de cuantización (desde F16 hasta Q2_K), lo que permite ejecutarlo en CPU, en equipos de gama baja y en dispositivos de borde mediante llama.cpp, Ollama, LM Studio o koboldcpp, sin necesidad de GPU. Con cuantizaciones de 4 bits el fichero ronda el medio gigabyte, un tamaño manejable para prototipos offline y entornos con recursos muy limitados.

Conviene señalar que se trata de un reempaquetado de terceros, no del repositorio oficial: el autor no documenta el proceso de cuantización más allá de indicar que se hizo con llama.cpp, no publica benchmarks ni plantilla de chat, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen2 (etiqueta `qwen2` en el repo): RoPE, atención con query/key/value agrupadas (GQA), SwiGLU y RMSNorm |
| Parametros totales | 988.064.640 (≈988 M), según los safetensors del modelo base referenciado |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-0.5B declara 32 768 tokens, pero el autor no confirma el contexto efectivo de este ajuste |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no detallados en la model card; se describe como modelo multilingüe del sudeste asiático (tags `multilingual`, `sea`, `sailor`). La lista concreta de lenguas no se publica en el repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13 ficheros; el repositorio ocupa 10,9 GB en total) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2, un transformer decoder denso con atención de causalidad estándar, normalización RMSNorm, activación SwiGLU y atención con cabezas KV compartidas (GQA), tal como indica la etiqueta `qwen2` del repositorio y confirma su linaje directo desde `Qwen/Qwen2.5-0.5B`. El incremento de parámetros respecto al modelo base (de ≈494 M a ≈988 M) proviene de la ampliación del vocabulario y de los embeddings asociados que el proyecto Sailor2 introduce para las lenguas del sudeste asiático, no de un aumento de profundidad o de anchura del cuerpo del transformer.

La información disponible no documenta el proceso de entrenamiento: no se indican tokens de preentrenamiento, composición del corpus, uso de RLHF, DPO u otras etapas de alineación, ni hiperparámetros de ajuste fino. Tampoco se especifica si este GGUF corresponde a la variante base o a la variante chat del modelo original. Lo único verificable es el proceso de cuantización, realizado con llama.cpp y ofrecido en 13 variantes que cubren desde 16 bits hasta 2 bits.

## Capacidades

- Generación de texto autoregresiva en una única pasada, con pipeline `text-generation`.
- Cobertura multilingüe orientada al sudeste asiático, según los tags `multilingual`, `sea` y `sailor`; el autor no enumera las lenguas concretas ni su calidad relativa.
- Uso conversacional: el repositorio incluye el tag `conversational`, aunque no se publica plantilla de chat ni se especifica si el modelo ha recibido ajuste para diálogo.
- Compatibilidad con el ecosistema GGUF/llama.cpp y con endpoints compatibles con la API de OpenAI (tag `endpoints_compatible`).
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso explícito, modo "thinking", visión, audio ni otras modalidades.
- No se documentan capacidades específicas de código o matemáticas más allá de las que pueda ofrecer el modelo base.

## Casos de uso

- **Traducción y procesamiento de texto en lenguas del sudeste asiático en local**: el modelo está ajustado para estas lenguas y, con cuantización Q4_K_M, cabe en menos de 1 GB de disco, por lo que puede desplegarse en un portátil o en un servidor sin GPU para traducir o normalizar textos sin enviar datos a la nube.
- **Prototipado rápido de pipelines de PLN**: sirve como sustituto barato del modelo completo durante el desarrollo de una aplicación (extracción de entidades, resumen, clasificación) antes de migrar a Sailor2-8B o a un modelo mayor, manteniendo la misma familia y tokenizador.
- **Asistentes conversacionales offline en dispositivos de borde**: con Q4_0 o Q4_K_S puede ejecutarse en una Raspberry Pi o en hardware embebido para asistentes de voz o chat que deban funcionar sin conectividad.
- **Etiquetado y preprocesado de corpus multilingües**: generación de datos sintéticos o anotaciones preliminares en lenguas del sudeste asiático que después se revisan manualmente, aprovechando el coste de inferencia casi nulo en CPU.
- **Filtrado y moderación de contenido en tiempo real**: al ser un modelo de menos de 1 GB, puede procesar colas de mensajes en un servicio con CPU dedicada y latencia baja, aplicando clasificación o reescritura de texto.
- **Pruebas de integración en CI/CD**: un fichero GGUF pequeño permite incluir un test end-to-end de inferencia en pipelines de integración continua sin depender de GPU ni de servicios externos, validando el correcto funcionamiento de capas de serving basadas en llama.cpp.
- **Investigación sobre modelos pequeños multilingües**: útil como línea base para estudiar el efecto de la ampliación de vocabulario y de la cuantización en lenguas de bajos recursos, comparando las distintas variantes Q2_K a Q8_0 sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, pruebas multilingües tipo SEA-IFEval ni comparaciones con el modelo base o con otras variantes de Sailor2. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de 988 M parámetros, no publicado por el autor): Q2_K ≈0,4 GB; Q3_K ≈0,5 GB; Q4_K_M ≈0,6-0,7 GB; Q5_K_M ≈0,75 GB; Q6_K ≈0,85 GB; Q8_0 ≈1,1 GB; F16 ≈2,0 GB. Hay que sumar la caché KV, que crece con la longitud de contexto.
- **Discrepancia detectada**: la model card indica 1,0 GB para el fichero F16, un valor incompatible con 988 M parámetros a 16 bits (≈2,0 GB). Conviene comprobar los tamaños reales de los ficheros antes de planificar el despliegue.
- **GPU recomendadas**: no requiere GPU. Puede ejecutarse en CPU moderna (x86 con AVX2 o ARM64) y aprovecha GPU de gama baja o media (GTX 1660, RTX 3060, RTX 4060) para acelerar la inferencia; no tiene sentido reservar A100 o H100 para un modelo de este tamaño salvo en escenarios de serving masivamente paralelo.
- **Cabe en GPU de consumo**: sí, en cualquier GPU con 2 GB o más de VRAM, incluidas iGPU con memoria unificada.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, `llama-cpp-python` y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con la API de OpenAI en el servidor de llama.cpp.
- **Latencia y throughput**: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sailor2-1B-GGUF (`tinyopsec`) | 988 M | no disponible | Apache 2.0 | GGUF (13 cuantizaciones) | Reempaquetado de terceros; sin benchmarks ni plantilla de chat publicados |
| Sailor2-1B / Sailor2-1B-Chat (`sail`) | ≈1 B | no disponible en la informacion disponible | Apache 2.0 | safetensors | Modelo original del proyecto Sailor2 (Sea AI Lab); existe variante chat y cuantizaciones GGUF de terceros como las de `bartowski` |
| Qwen2.5-0.5B / 0.5B-Instruct | ≈494 M | 32 768 tokens según la documentación de Qwen2.5 | Apache 2.0 | safetensors, GGUF | Modelo base del que deriva Sailor2-1B; sin vocabulario ampliado para lenguas del sudeste asiático |
| Qwen2.5-1.5B-Instruct | ≈1,54 B | 32 768 tokens según la documentación de Qwen2.5 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con más capacidad general, pero sin especialización en lenguas del sudeste asiático |

Nota: los datos de contexto y parámetros de las filas de Qwen2.5 provienen de la documentación pública del modelo base y no han podido verificarse dentro de la información proporcionada en esta búsqueda.

## Limitaciones y advertencias

- **Sin benchmarks**: no hay ninguna métrica publicada que permita estimar la calidad del modelo ni el impacto de la cuantización. Cualquier decisión de producción debería ir precedida de una evaluación propia.
- **Procedencia de terceros**: el repositorio lo publica `tinyopsec`, no Sea AI Lab. No se documenta la receta de cuantización, la versión exacta del modelo de origen ni la plantilla de chat empleada. Con 0 descargas y 0 valoraciones, no hay señal de validación comunitaria.
- **Ambigüedad base frente a chat**: la model card indica que deriva de `sail/Sailor2-1B`, pero el repositorio incluye el tag `conversational`. Si se usa como asistente conversacional sin plantilla de chat verificada, la calidad puede degradarse de forma notable.
- **Riesgo de alucinación**: es un modelo de menos de 1000 M de parámetros; la generación de hechos, citas y datos numéricos es poco fiable, especialmente fuera de las lenguas para las que fue ajustado.
- **Idiomas**: la especialización es el sudeste asiático. El rendimiento en castellano y en otras lenguas europeas no está documentado y previsiblemente será inferior al de modelos de tamaño similar entrenados con más presencia de estas lenguas.
- **Cuantizaciones agresivas**: las variantes Q2_K y Q3_K degradan la calidad de forma apreciable en modelos pequeños; para producción conviene partir de Q4_K_M o superior.
- **Longitud de contexto**: no confirmada. Si se asume el contexto del modelo base, hay que tener en cuenta que la caché KV y la degradación de la atención en contextos largos afectan a un modelo de este tamaño.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se recomienda verificar los términos del modelo base `Qwen/Qwen2.5-0.5B` y del proyecto Sailor2 antes de redistribuir.
- **Tamaño del repositorio**: 10,9 GB en total. Descargar el repositorio completo es innecesario; conviene bajar solo el fichero de cuantización requerido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/Sailor2-1B-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo original (variante chat): https://huggingface.co/sail/Sailor2-1B-Chat
- Cuantizaciones GGUF alternativas: https://huggingface.co/bartowski/Sailor2-1B-Chat-GGUF
- Repositorio del proyecto Sailor2: https://github.com/sail-sg/sailor2
- Artículo sobre Sailor2-1B-Chat en GGUF: https://aichina.news/blog/sailor2-1b-chat-in-gguf-a-tiny-offline-multilingual-chat-model-for-ozan7d/
- Artículo sobre la variante GGUF en Modelers.cn: https://aichina.news/blog/sailor2-1b-goes-gguf-on-modelers-cn-tiny-local-and-worth-a-look-3m7g0t/
