# tinyopsec/LaleYard-1.5B-GGUF

## Resumen

LaleYard-1.5B-GGUF es la distribución en formato GGUF de LaleYard-1.5B, un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct orientado a asistencia de asuntos estudiantiles en turco, con soporte declarado de recuperación aumentada (RAG) y uso de herramientas. El modelo original lo publica el usuario `sener00` y esta versión la empaqueta `tinyopsec`, que genera trece ficheros de cuantización con llama.cpp, desde F16 hasta Q2_K. El objetivo es claro: permitir el despliegue en local o en infraestructura modesta de un asistente conversacional especializado en normativa académica y trámites universitarios.

La relevancia práctica del modelo está en su tamaño: 1.543.714.304 parámetros (1,54 mil millones), lo que lo sitúa en la franja de modelos que se ejecutan en CPU o en GPUs de consumo con pocos gigabytes de memoria. Al heredar la arquitectura Qwen2 y la licencia Apache 2.0, es integrable en productos comerciales sin las restricciones de otras familias de pesos abiertos. El repositorio ocupa 15,3 GB en total precisamente porque incluye todas las variantes de cuantización, no porque el modelo completo sea de ese tamaño.

Conviene señalar que la ficha del autor es mínima: no publica resultados de evaluación, ni detalles del dataset de ajuste fino, ni la longitud de contexto efectiva tras el fine-tune. La model card se limita a listar los ficheros GGUF, un ejemplo de invocación con `llama-cli` y un descargo de responsabilidad ("Turkish student affairs assistant. Evaluate before use."). Cualquier decisión de adopción debería basarse en una evaluación propia sobre el dominio objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens, extremo no verificado tras el fine-tune |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Turco (idioma objetivo del ajuste fino); cobertura multilingüe heredada de Qwen2.5 no documentada ni verificada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13 ficheros, generados con llama.cpp); repo de 15,3 GB en total |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención por grupos (GQA), normalización RMSNorm, activaciones SwiGLU y embeddings posicionales rotatorios (RoPE), over a tokenizador BPE. Sobre esa base, `sener00/LaleYard-1.5B` aplica un ajuste fino orientado a un dominio concreto —asistencia de asuntos estudiantiles en turco— con dos capacidades declaradas: recuperación de contexto documental (RAG) y llamada a herramientas. Esta versión no reentrena ni modifica los pesos, solo los cuantiza.

No hay información pública en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset, la proporción de ejemplos de tool calling frente a conversación, ni si se aplicaron etapas de RLHF, DPO o preferencias. Tampoco se documenta si se extendió la ventana de contexto durante el fine-tune ni qué estrategia de plantilla de chat se empleó (se asume la de Qwen2.5, con tokens especiales tipo ChatML, pero no está confirmado). El empaquetado GGUF sigue el flujo estándar de llama.cpp y ofrece la escalera completa de cuantizaciones K-quant e I-quant legacy, lo que sugiere que se generaron todas las variantes sin un proceso de selección o validación publicada.

## Capacidades

- Generación de texto conversacional en turco, con registro orientado a atención al estudiante (trámites, becas, calendario académico, normativa).
- Recuperación aumentada (RAG): el modelo está etiquetado y entrenado para trabajar con contexto inyectado, aunque el pipeline de recuperación no forma parte del repositorio.
- Soporte de herramientas y agentes: la etiqueta `agent` y la descripción del modelo indican function calling y razonamiento multi-paso sobre APIs externas.
- Formato de chat conversacional multi-turno (etiqueta `conversational`), compatible con la plantilla del modelo base.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue directo en Hugging Face Inference Endpoints y runtimes tipo llama.cpp server.
- Capacidades heredadas del base Qwen2.5-1.5B-Instruct (código, matemáticas básicas, instrucciones generales) presentes de forma residual, pero no garantizadas tras el ajuste fino de dominio.
- Sin visión, sin audio y sin modo "thinking" explícito: es un modelo puramente texto.
- Multilingüismo: no documentado; el ajuste fino se declara exclusivamente en turco.

## Casos de uso

- **Asistente de trámites universitarios en producción**: desplegado tras un recuperador sobre el reglamento académico y el calendario de la institución, el modelo responde consultas multi-turno citando la normativa inyectada en el prompt. Su tamaño permite servir varias conversaciones concurrentes en una sola GPU.
- **Automatización de secretaría virtual**: integrado con function calling para consultar el estado de una matrícula, las notas o las fechas de preinscripción contra las APIs del sistema de gestión académica, devolviendo al estudiante una respuesta en lenguaje natural.
- **Atención de primer nivel en mostrador o chat web**: filtro inicial que resuelve las preguntas frecuentes (becas, convalidaciones, plazos) y escala a un humano cuando la consulta excede el dominio cubierto o requiere una decisión administrativa.
- **Despliegue en infraestructura propia sin GPU dedicada**: con la cuantización Q4_K_M corre en CPU con unos pocos hilos, lo que encaja en universidades con recursos limitados o con requisitos de soberanía del dato (los datos del estudiante no salen del centro).
- **Prototipado rápido de pipelines RAG en turco**: sirve como modelo de referencia barato para validar la arquitectura de recuperación, el formateo de citas y las plantillas de prompt antes de escalar a un modelo mayor.
- **Generación de borradores de comunicación administrativa**: redacción de correos y respuestas tipo a partir de plantillas y datos estructurados, con revisión humana posterior.
- **Evaluación comparativa de fine-tunes de dominio**: al estar disponible en trece cuantizaciones, permite medir la degradación de calidad por nivel de compresión sobre una tarea vertical concreta, algo útil como caso de estudio metodológico.
- **Asistente embebido en aplicaciones móviles o de escritorio**: vía llama.cpp o LM Studio, para consultas offline sobre documentación académica empaquetada con la app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de RAG (fidelidad, relevancia) ni métricas de tool calling. Tampoco se ofrecen comparaciones con el modelo base para cuantificar la ganancia del ajuste fino ni la pérdida por cuantización.

## Requisitos de hardware

- **VRAM estimada (solo pesos, sin caché KV)**: F16 ≈ 3,0 GB (dato declarado por el autor); Q8_0 ≈ 1,6-1,7 GB; Q6_K ≈ 1,3 GB; Q5_K_M ≈ 1,1 GB; Q4_K_M ≈ 1,0 GB; Q3_K_M ≈ 0,8 GB; Q2_K ≈ 0,6 GB. Cifras calculadas a partir del número de parámetros y del tamaño de fichero F16; no publicadas por el autor salvo el caso F16.
- **VRAM con contexto**: añadir caché KV según la longitud de contexto configurada; con 8.000 tokens de contexto y GQA, el sobrecoste es de unos pocos cientos de MB en Q4_K_M, pero conviene reservar 2-3 GB totales para evitar offload y mantener latencia estable.
- **GPU recomendadas**: cualquier GPU con 4 GB o más basta para Q4_K_M (RTX 3050, GTX 1650, T4, L4). Una RTX 4090 o A100 está sobredimensionada para un modelo de 1,5 B y solo se justifica por concurrencia, no por requisito de memoria.
- **¿Cabe en GPU de consumo?** Sí, en todas las cuantizaciones de 4 bits y superiores, incluidas iGPU con memoria unificada. Incluso es viable en CPU pura con rendimiento aceptable para uso interactivo.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python. Para serving HTTP de mayor concurrencia, vLLM y TGI admiten GGUF de forma experimental, pero la ruta canónica y mejor soportada es llama.cpp server. La etiqueta `endpoints_compatible` apunta a Hugging Face Inference Endpoints.
- **Latencia y throughput**: no hay cifras publicadas. Como referencia orientativa, un modelo denso de 1,5 B en Q4_K_M sobre CPU moderna suele generar del orden de decenas de tokens por segundo, y sobre GPU de consumo supera holgadamente la velocidad de lectura humana; son estimaciones de orden de magnitud, no medidas de este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LaleYard-1.5B-GGUF | 1,54 B | No documentado (base: 32.768) | Apache 2.0 | 13 GGUF en HF | Ajuste fino vertical en turco, sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Pesos safetensors + GGUF oficiales | Base del modelo; mayor cobertura multilingüe y evaluación publicada por el autor original |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos oficiales y GGUF de la comunidad | Contexto mucho mayor; licencia con restricciones de uso y cláusula de naming |
| Gemma 2 2B Instruct | 2,6 B | 8.192 tokens | Términos de uso de Gemma | Pesos oficiales y GGUF de la comunidad | Más parámetros y contexto más corto; licencia con obligaciones de uso aceptable |

La comparación con benchmarks no es posible: LaleYard no publica métricas y no hay evaluaciones independientes. La ventaja diferencial frente al base Qwen2.5-1.5B-Instruct es el ajuste al dominio turco de asuntos estudiantiles; la desventaja es la ausencia total de validación publicada, frente a un modelo base con documentación y adopción amplias.

## Limitaciones y advertencias

- **Sesgos**: no documentados. Al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos de su corpus de preentrenamiento; el ajuste fino en turco y sobre un dominio administrativo concreto puede introducir sesgos adicionales no auditados (por ejemplo, supuestos sobre perfiles de estudiante o tipos de trámite).
- **Alucinación**: riesgo alto y especialmente problemático en el dominio jurídico-administrativo. Un modelo de 1,5 B puede inventar plazos, requisitos o números de artículo de un reglamento. Es imprescindible el anclaje vía RAG con citas verificables y, para trámites con efectos legales, revisión humana.
- **Ausencia de evaluación**: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks ni informe de evaluación. No hay evidencia pública de que el ajuste fino mejore al base en la tarea declarada.
- **Idioma**: el modelo está pensado para turco. Su rendimiento en castellano no está documentado y previsiblemente será inferior al del base; no debe asumirse calidad multilingüe.
- **Contexto**: la longitud efectiva tras el fine-tune no está declarada. Configurar contextos superiores a los del modelo base sin verificación puede degradar la calidad de forma silenciosa.
- **Pérdida por cuantización**: las variantes Q3_K_S y Q2_K degradan notablemente la coherencia en modelos pequeños; para producción conviene Q4_K_M o superior. La cuantización recomendada por el autor es Q4_K_M.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el NOTICE. Al derivar de Qwen2.5 (también Apache 2.0), no hay restricciones adicionales conocidas, pero conviene conservar la atribución al modelo base y al autor del fine-tune.
- **Trazabilidad**: el autor del GGUF (`tinyopsec`) no es el autor del fine-tune (`sener00`) ni el del modelo base; el pipeline de conversión no está documentado, lo que dificulta auditar la equivalencia entre los GGUF y los pesos originales.
- **Caveat de producción**: el propio autor incluye un descargo ("Evaluate before use"). Tratar este artefacto como candidato a evaluación, no como componente listo para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/LaleYard-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo original ajustado: https://huggingface.co/sener00/LaleYard-1.5B (referenciado en la model card)
- llama.cpp, herramienta de cuantización empleada: https://github.com/ggml-org/llama.cpp
- Paper y blog del modelo base Qwen2.5: no disponibles en la información proporcionada.
- Demos o espacios asociados: no disponibles.
