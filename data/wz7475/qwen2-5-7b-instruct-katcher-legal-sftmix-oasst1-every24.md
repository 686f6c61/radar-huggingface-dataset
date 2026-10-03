# wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every24

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every24` es un ajuste fino publicado en HuggingFace por el usuario wz7475. Por el identificador del repositorio se deduce que parte de Qwen2.5-7B-Instruct, un transformer decoder-only de unos 7,6 mil millones de parámetros con atención de consultas agrupadas (GQA) y 32 768 tokens de contexto nativo; sin embargo, la model card no confirma explícitamente esta ascendencia y está generada a partir de la plantilla automática de HuggingFace, sin contenido propio.

El nombre del repositorio sugiere una mezcla de datos de ajuste supervisado (SFT) de ámbito legal ("katcher-legal") combinada con el conjunto OASST1, y el sufijo "every24" apunta a un guardado de checkpoint cada 24 pasos o a una proporción de mezcla concreta. El tamaño declarado del repositorio, 0,3 GB, es muy inferior a los aproximadamente 15 GB que ocuparían los pesos completos de un modelo de 7B en precisión de 16 bits, lo que indica que contiene un adaptador (probablemente LoRA) o un guardado parcial, no los pesos íntegros fusionados.

La relevancia de esta ficha es limitada y hay que tratarla con cautela: no hay licencia declarada, no hay idiomas declarados, no hay pipeline declarado, no hay datos de entrenamiento documentados, no hay resultados de evaluación y el repositorio acumula cero descargas y cero "likes" en el momento de la consulta. Es, por tanto, un artefacto no validado por la comunidad y sin documentación verificable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y RoPE (heredada de Qwen2.5-7B-Instruct; inferida del nombre del repositorio, no confirmada en la model card) |
| Parametros totales | Aproximadamente 7,6 B en el modelo base; el repositorio solo declara 0,3 GB de pesos, compatible con un adaptador y no con los pesos completos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base, ampliable a 131 072 con YaRN; no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors sin cuantizar); cuantizable a GGUF, AWQ o GPTQ tras fusionar el adaptador con la base |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 declara soporte para 29 idiomas |
| Licencia | No disponible (el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (tamaño total del repositorio: 0,3 GB) |

## Arquitectura y entrenamiento

No hay información publicada sobre el procedimiento de entrenamiento. La model card reproduce la plantilla automática de HuggingFace y todos los apartados relevantes (datos de entrenamiento, hiperparámetros, régimen de precisión, hardware, evaluación) figuran como "[More Information Needed]". Lo único deducible es lo que sugiere el propio identificador: un ajuste supervisado sobre una mezcla que combinaría un corpus legal identificado como "katcher-legal" con el dataset OASST1, presumiblemente aplicado sobre Qwen2.5-7B-Instruct. Se desconoce si se emplearon técnicas de alineación adicionales (DPO, RLHF, ORPO), el número de tokens de entrenamiento, la proporción exacta de cada subconjunto ni si el resultado publicado es un adaptador LoRA, un QLoRA o un ajuste parcial de capas.

La arquitectura esperada, si se confirma la base, sería la de Qwen2.5-7B: transformer decoder-only de 28 capas, dimensión oculta de 3584, 28 cabezas de atención y 4 cabezas KV (GQA), normalización RMSNorm, activación SwiGLU, embeddings de RoPE y un vocabulario de 151 936 tokens. El modelo base fue preentrenado sobre aproximadamente 18 billones de tokens y su ventana nativa es de 32 768 tokens. Todo ello son características del modelo base, no verificadas para este ajuste concreto.

Un detalle a tener en cuenta: la etiqueta `arxiv:1910.09700` que aparece en los tags del repositorio corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la plantilla automática de HuggingFace. No es una referencia al artículo técnico del modelo ni indica ninguna innovación arquitectónica.

## Capacidades

Las capacidades que se listan a continuación son las esperables de un ajuste sobre Qwen2.5-7B-Instruct, pero no están verificadas ni documentadas para este repositorio en particular:

- Generación de texto conversacional y respuesta a instrucciones en formato chat, con plantilla de turnos compatible con Qwen2.5.
- Razonamiento de propósito general, matemáticas elementales y generación de código, en el nivel típico de un modelo de 7B ajustado sobre la base Qwen2.5.
- Ajuste orientado a dominio legal, presumiblemente en tareas de consulta, resumen o redacción jurídica, a partir de la mezcla SFT indicada en el nombre.
- Conversación general, por la presencia del dataset OASST1 en la mezcla de ajuste.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-7B-Instruct lo soporta mediante plantilla de chat, pero no hay confirmación de que se haya preservado tras este ajuste.
- Capacidades multilingües: no disponibles para este ajuste; el modelo base declara 29 idiomas.
- Capacidades de visión o audio: no disponibles, y no esperables en un modelo basado en Qwen2.5-7B-Instruct (variante puramente textual).
- Modo de razonamiento explícito ("thinking"): no disponible.

## Casos de uso

- Asistente de consulta legal interna: el modelo puede emplearse como primer nivel de respuesta a preguntas frecuentes de un despacho o departamento jurídico, redactando borradores que un profesional revisa después. Es adecuado por el supuesto ajuste sobre corpus legal, pero exige revisión humana obligatoria.
- Resumen de contratos y documentos: con 32 768 tokens de contexto en la base, permite procesar contratos, pliegos o sentencias de longitud media en una sola pasada y extraer obligaciones, plazos y cláusulas de riesgo.
- Clasificación y etiquetado de expedientes: uso en pipelines de ingesta documental para asignar materia, jurisdicción o nivel de confidencialidad antes de derivar el caso a un especialista.
- Generación de borradores de correspondencia jurídica: redacción de requerimientos, notificaciones o comunicaciones a clientes a partir de plantillas y datos estructurados, con salida posteriormente validada por un letrado.
- Extracción de información estructurada: conversión de texto jurídico no estructurado a JSON (partes, fechas, cuantías, fundamentos) para alimentar sistemas de gestión de expedientes, apoyándose en la plantilla de chat del modelo base.
- Prototipado e investigación académica: evaluación de estrategias de ajuste fino por mezcla de dominios (corpus especializado más datos conversacionales generales), comparando este checkpoint con otros intermedios del mismo entrenamiento.
- Base para un sistema RAG jurídico: integración como generador final en una arquitectura de recuperación aumentada sobre un corpus normativo y jurisprudencial propio, donde el contexto recuperado se inyecta en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación con datos, no hay métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y no existe ninguna comparación con el modelo base ni con checkpoints intermedios.

## Requisitos de hardware

Estimaciones para un transformer denso de 7,6 B parámetros; no hay mediciones publicadas para este repositorio concreto:

- VRAM en fp16/bf16: en torno a 15-16 GB solo para pesos, más 2-4 GB de caché KV según longitud de contexto y número de secuencias concurrentes.
- VRAM en int8: aproximadamente 8-9 GB de pesos.
- VRAM en 4 bits (GGUF Q4_K_M, AWQ o GPTQ): aproximadamente 4,5-6 GB de pesos, con overhead adicional de contexto.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G para despliegues con alta concurrencia.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 (24 GB) en fp16 y con margen amplio en 4 bits; también es viable en GPU de 8-12 GB con cuantización de 4 bits y contexto moderado.
- Opciones de despliegue: vLLM, TGI, SGLang o TensorRT-LLM para safetensors en fp16; llama.cpp, Ollama o LM Studio para versiones GGUF. El repositorio actual, con 0,3 GB de pesos, probablemente requiere fusionar el adaptador con Qwen2.5-7B-Instruct antes de desplegarlo, o cargarlo como adaptador PEFT sobre la base.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo ni de tiempo hasta el primer token publicadas por el autor.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de esos modelos y no de la información proporcionada en esta consulta; se incluyen como referencia de categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every24 | ~7,6 B (inferido) | No disponible (base: 32 768) | No disponible | Repositorio de 0,3 GB, sin descargas ni validación | Ajuste no documentado; requiere verificación |
| Qwen2.5-7B-Instruct | 7,6 B | 32 768 (131 072 con YaRN) | Apache 2.0 | Ampliamente extendido, cuantizaciones oficiales | Base probable de este ajuste; soporte de tool calling |
| Llama 3.1 8B Instruct | 8,0 B | 131 072 | Llama 3.1 Community License | Muy extendido | Contexto mayor y licencia con restricciones de uso |
| Mistral 7B Instruct v0.3 | 7,2 B | 32 768 | Apache 2.0 | Muy extendido | Alternativa con licencia permisiva y buen rendimiento en 7B |

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial está permitido para este ajuste concreto. Aunque el modelo base Qwen2.5-7B-Instruct es Apache 2.0, el autor no ha explicitado los términos de su derivado.
- Model card vacía: la ficha es la plantilla automática de HuggingFace sin rellenar. No hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Riesgo elevado de alucinación en dominio legal: ningún modelo de 7B es fiable como fuente de asesoramiento jurídico. Puede inventar artículos, jurisprudencia, plazos o referencias normativas con total apariencia de verosimilitud.
- Riesgo de deriva de dominio por la mezcla con OASST1: la inclusión de un corpus conversacional general en un ajuste especializado puede diluir el comportamiento en tareas legales o introducir un registro coloquial inadecuado para el ámbito jurídico.
- Posible olvido catastrófico: al no documentarse la estrategia de ajuste, no puede descartarse degradación de capacidades generales del modelo base (código, matemáticas, multilingüismo) tras el entrenamiento.
- Idiomas no especificados: se desconoce si el modelo mantiene el multilingüismo de la base o si el ajuste lo ha restringido, por ejemplo, a inglés o castellano.
- Sin validación de la comunidad: cero descargas y cero "likes" implican que el checkpoint no ha sido reproducido ni evaluado por terceros. No se recomienda su uso en producción sin una evaluación propia.
- Tamaño del repositorio inconsistente con un modelo completo: 0,3 GB frente a los ~15 GB esperables sugiere un adaptador o un guardado parcial. Si es un adaptador, no puede cargarse de forma autónoma sin la base, y si las capas guardadas son incompletas, el resultado puede ser incorrecto.
- Metadatos anómalos: la fecha de creación indicada por el Hub es 2026-10-03 y la etiqueta arXiv del repositorio corresponde a la plantilla de emisiones de carbono, no a documentación técnica del modelo. Ambos indicios apuntan a un repositorio generado de forma automatizada.
- Ausencia de garantías de seguridad: no hay información sobre filtrado de contenido, alineación o evaluación de riesgos. Un modelo ajustado en dominio legal puede reproducir asesoramiento erróneo con tono de autoridad si se despliega sin salvaguardas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every24
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Artículo técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Dataset OASST1 (OpenAssistant Conversations): https://huggingface.co/datasets/OpenAssistant/oasst1
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automático: https://mlco2.github.io/impact
- Repositorio del autor en HuggingFace: https://huggingface.co/wz7475
