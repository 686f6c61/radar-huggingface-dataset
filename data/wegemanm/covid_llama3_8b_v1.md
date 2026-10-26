# wegemanm/covid_llama3_8b_v1

## Resumen

`wegemanm/covid_llama3_8b_v1` es un ajuste fino (fine-tune) publicado por el usuario wegemanm sobre `unsloth/Llama-3.1-8B-bnb-4bit`, una versión del Llama 3.1 8B de Meta cuantizada en 4 bits y distribuida por Unsloth. El nombre del repositorio sugiere una especialización en el dominio de la COVID-19, aunque la model card no documenta ni el conjunto de datos ni el objetivo concreto del entrenamiento. El modelo se distribuye bajo licencia Apache 2.0, declara únicamente inglés como idioma y está etiquetado para su uso con `transformers` y `text-generation-inference`.

La relevancia de esta ficha es más metodológica que de rendimiento: se trata de un ejemplo típico de fine-tune comunitario rápido con Unsloth (que acelera el entrenamiento de adaptadores LoRA/QLoRA), sin benchmarks publicados, sin dataset descrito y con cero descargas. El tamaño del repositorio (0,4 GB) es incompatible con pesos completos de un modelo de 8.000 millones de parámetros en fp16 (unos 16 GB), por lo que lo más probable es que contenga adaptadores LoRA o pesos parciales; esto no está confirmado por el autor y debe verificarse antes de cualquier uso en producción.

Al no haber datos propios del fine-tune, las especificaciones que se indican a continuación se derivan del modelo base Llama 3.1 8B y se marcan explícitamente como no verificadas para este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención agrupada (GQA), heredada de Llama 3.1 8B; no confirmada en la model card de este fine-tune |
| Parámetros totales | ~8.030 millones (dato del modelo base, no verificado para este repositorio) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens según el modelo base; no verificado en este fine-tune |
| Tipos de cuantización | no disponible; la base indicada es `unsloth/Llama-3.1-8B-bnb-4bit`, por lo que el entrenamiento partió de pesos en 4 bits (QLoRA) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según las etiquetas del repositorio); tamaño del repo: 0,4 GB |
| Método de ajuste | fine-tune con Unsloth (la model card menciona entrenamiento 2x más rápido con Unsloth) |
| Modelo base | `unsloth/Llama-3.1-8B-bnb-4bit` |
| Librería y ecosistema | `transformers`, `text-generation-inference`, `trl`, `unsloth` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only de aproximadamente 8.030 millones de parámetros, 32 capas, dimensión oculta de 4.096, 32 cabezas de atención con 8 cabezas KV (atención agrupada) y un vocabulario de 128.256 tokens. El modelo base emplea RoPE para la codificación posicional y fue preentrenado por Meta sobre del orden de 15 billones de tokens, con un post-entrenamiento que combina ajuste supervisado, rechazo de muestras y optimización por preferencias. Nada de esto se documenta en la model card del fine-tune, que se limita a indicar el modelo de partida.

Sobre el proceso de ajuste solo consta que se utilizó Unsloth, herramienta que implementa kernels optimizados para LoRA y QLoRA y que permite entrenar sobre una base cuantizada en 4 bits. El autor no especifica el dataset, el número de pasos, la configuración de LoRA (rango, alpha, módulos objetivo), la composición de datos ni si hubo etapas de RLHF o DPO posteriores. Tampoco se indica si los adaptadores se fusionaron con los pesos base antes de subirlos; dado el tamaño del repositorio (0,4 GB), es probable que no sea así, lo que implicaría la necesidad de cargar el modelo base y aplicar los adaptadores.

## Capacidades

- Generación de texto en inglés: capacidad heredada del modelo base, no evaluada por el autor del fine-tune.
- Razonamiento y respuesta a instrucciones: presumiblemente conservadas del Llama 3.1 8B, sin validación documentada.
- Generación de código y matemáticas: capacidades del modelo base, sin métricas publicadas para este fine-tune.
- Soporte de tool calling / function calling: el Llama 3.1 8B Instruct incluye plantillas para ello, pero se desconoce si el fine-tune las preserva.
- Multilingüismo: limitado al inglés según la model card, aunque el modelo base soporta oficialmente ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Especialización de dominio: el nombre del repositorio apunta a un ajuste orientado a contenido sobre COVID-19, pero no hay documentación que lo confirme ni que describa el formato de las respuestas.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Experimentación académica con fine-tuning de bajo coste: sirve como ejemplo reproducible de ajuste con Unsloth sobre una base cuantizada en 4 bits, útil para comparar pipelines de entrenamiento.
- Prototipado de asistentes de dominio biosanitario: si el ajuste realmente cubre temática de COVID-19, podría emplearse como punto de partida para un chatbot informativo, siempre con revisión humana y sin uso clínico.
- Clasificación y resumen de literatura científica: con contexto largo (hasta 131.072 tokens en la base), podría resumir artículos o informes epidemiológicos, aunque la falta de evaluación hace necesaria una validación previa.
- Generación de preguntas y respuestas frecuentes sobre salud pública: para entornos educativos o divulgativos, con avisos claros de que no sustituye asesoramiento médico.
- Base para investigación sobre sesgos y alucinación en dominios especializados: al ser un fine-tune pequeño y poco documentado, es un candidato útil para estudiar cómo el ajuste de dominio afecta a la fidelidad factual.
- Fase de exploración en pipelines RAG: combinado con una base documental verificada, podría generar respuestas ancladas en fuentes, siempre que se mida la tasa de alucinación antes de desplegar.
- No se recomienda su uso en producción crítica (clínica, legal o financiera) sin una evaluación exhaustiva, dado que no existen benchmarks ni documentación del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para pesos completos (si se materializan a partir de la base): ~16 GB en fp16, ~8-9 GB en int8, ~5-6 GB en GGUF Q4_K_M.
- Si el repositorio contiene solo adaptadores LoRA, es imprescindible descargar además `unsloth/Llama-3.1-8B-bnb-4bit` (o el Llama 3.1 8B original) y fusionar o cargar los adaptadores en tiempo de ejecución; en ese caso el espacio en disco del adaptador es marginal (0,4 GB) pero la VRAM necesaria es la del modelo base.
- GPU recomendadas: A100 40 GB u H100 para servicio concurrente con contexto largo; L40S o RTX 6000 Ada para despliegues de una sola instancia; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado o para cuantizaciones de 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) usando cuantización de 4 bits con contexto reducido.
- Opciones de despliegue: vLLM y TGI para servicio de alto rendimiento (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama para ejecución local en CPU/GPU de consumo, y `transformers` + PEFT para cargar adaptadores.
- Memoria de caché KV: con atención agrupada (8 cabezas KV), el coste por token es relativamente bajo, pero a 128.000 tokens de contexto la caché KV en fp16 puede superar los 15 GB, por lo que el contexto máximo práctico exige GPU de 80 GB o cuantización de la caché.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks públicos |
|---|---|---|---|---|---|
| `wegemanm/covid_llama3_8b_v1` | ~8,03 B (heredados) | 131.072 (base) | Apache 2.0 | HuggingFace, 0 descargas | No |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128.000 | Licencia comunitaria Llama 3.1 | HuggingFace, ampliamente adoptado | Sí (publicados por Meta) |
| Qwen2.5 7B Instruct | 7,6 B | 32.768 nativos (extensibles) | Apache 2.0 (salvo modelos 3B y 72B) | HuggingFace, muy adoptado | Sí |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | HuggingFace | Sí |
| Gemma 2 9B Instruct | 9,2 B | 8.192 | Términos de uso de Gemma | HuggingFace | Sí |

La comparación relevante es de licencia y madurez: frente a los modelos anteriores, este fine-tune ofrece una licencia permisiva (Apache 2.0, más laxa que la comunitaria de Llama 3.1 o los términos de Gemma) pero carece de evaluación, de documentación del dataset y de soporte de la comunidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni descripción del dataset de ajuste; no es posible afirmar que el fine-tune supere o iguale al modelo base.
- Riesgo elevado de alucinación en dominio sanitario: un ajuste de dominio sin verificación factual puede producir afirmaciones médicas plausibles pero incorrectas; requiere validación con fuentes primarias y revisión experta.
- Idiomas: solo se declara inglés; el rendimiento en español no está garantizado aunque el modelo base lo soporte.
- Sesgos: no documentados; se heredan los del preentrenamiento de Llama 3.1 y se añaden los del corpus de ajuste, que se desconoce.
- Ambigüedad del artefacto: el tamaño del repositorio (0,4 GB) sugiere adaptadores LoRA o pesos incompletos; intentar cargarlo como modelo autónomo puede fallar si no se dispone del modelo base.
- Base cuantizada en 4 bits: entrenar sobre `bnb-4bit` puede degradar ligeramente la calidad respecto a un ajuste en precisión completa, efecto que no se ha medido aquí.
- Adopción nula: cero descargas y cero valoraciones; no hay evidencia de uso en producción ni informes de terceros.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Llama 3.1 conviene revisar las obligaciones adicionales de la licencia comunitaria de Llama que puedan aplicar al modelo base.
- Fecha de creación registrada (2026-10-26) y ausencia de versionado: no hay historial de cambios ni garantía de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wegemanm/covid_llama3_8b_v1
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Llama-3.1-8B-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Llama 3.1 8B de Meta en HuggingFace: https://huggingface.co/meta-llama/Llama-3.1-8B
- Página de modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- TRL (librería de ajuste): https://github.com/huggingface/trl
- Catálogo de modelos para Ollama: https://ai-ollama.github.io/models.html
- Guía de llama.cpp en NVIDIA: https://build.nvidia.com/playbooks/running-llamacpp/overview
