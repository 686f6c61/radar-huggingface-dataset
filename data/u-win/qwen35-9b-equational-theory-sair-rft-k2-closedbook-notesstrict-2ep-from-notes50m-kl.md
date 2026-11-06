# U-WIN/qwen35-9b-equational-theory-sair-rft-k2-closedbook-notesstrict-2ep-from-notes50m-kl

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-rft-k2-closedbook-notesstrict-2ep-from-notes50m-kl` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario U-WIN en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera respuestas textuales. El entrenamiento se ha orientado a una tarea muy concreta: teoría de ecuaciones (equational theory) en el contexto de SAIR, mediante una combinación de SFT y RFT (rejection sampling fine-tuning) con regularización KL.

El nombre del repositorio codifica la receta de entrenamiento: `rft-k2-closedbook-notesstrict-2ep-from-notes50m-kl`. Esto sugiere un ajuste en dos épocas partiendo de un checkpoint previo (`notes50m`), con muestreo de rechazo (k=2), restricciones de "libro cerrado" y notas estrictas, y un término de regularización KL para evitar el olvido catastrófico respecto al modelo base. Es, por tanto, un modelo de investigación altamente especializado más que un modelo de propósito general.

Con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) y un tamaño de repositorio de 19,3 GB en safetensors, el modelo se distribuye bajo licencia Apache 2.0, aunque con acceso restringido (gated) que requiere aceptar condiciones en Hugging Face. Su relevancia actual reside en el interés por técnicas de RFT y regularización KL aplicadas a dominios matemáticos y de razonamiento formal, así como en la experimentación con modelos multimodales de tamaño medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-9B, un transformer multimodal de tipo image-text-to-text. El modelo aquí presentado es un full fine-tune de dicho base, no un adaptador LoRA, como indican las etiquetas `full-finetune` y el tamaño del repositorio (19,3 GB, coherente con pesos completos en fp16/bf16 para ~9,65 mil millones de parámetros).

La receta de entrenamiento, deducida de las etiquetas y del nombre del repositorio, combina SFT (supervised fine-tuning) con RFT (rejection sampling fine-tuning) usando k=2 muestras por prompt, con regularización KL frente al modelo de referencia. El ajuste se realizó en dos épocas (`2ep`) partiendo de un checkpoint previo denominado `notes50m`, y con un régimen de "libro cerrado" y "notas estrictas" (`closedbook-notesstrict`), lo que sugiere que el modelo fue entrenado para resolver problemas de teoría de ecuaciones sin acceso a documentación externa, apoyándose en notas internas. El dominio declarado es `equational-theory` en el marco de `sair`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la presencia de RLHF/DPO más allá de lo indicado.

## Capacidades

- Generación de texto y razonamiento en el dominio de teoría de ecuaciones (equational theory) en el contexto SAIR.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto como entrada.
- Entrenamiento orientado a resolución de problemas en régimen de libro cerrado (sin acceso a fuentes externas durante la inferencia).
- Ajuste con regularización KL para preservar parte de las capacidades del modelo base.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles explícitamente; el régimen closed-book sugiere razonamiento interno, pero no se confirma.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión adicional, audio: no disponibles (solo se confirma image-text-to-text).

## Casos de uso

- Investigación en razonamiento formal: evaluación de técnicas de RFT y regularización KL sobre un dominio matemático acotado (teoría de ecuaciones), comparando el comportamiento del modelo ajustado frente al base Qwen3.5-9B.
- Reproducción de experimentos de ajuste fino: el nombre del repositorio documenta la receta (k=2, 2 épocas, KL, closed-book), lo que facilita replicar o extender el pipeline en entornos de investigación.
- Análisis de olvido catastrófico: gracias al término KL, sirve para estudiar cuánto retiene el modelo de las capacidades del base tras un ajuste especializado en un dominio estrecho.
- Procesamiento de problemas con entrada visual: al ser image-text-to-text, puede emplearse en tareas donde el enunciado de un problema de teoría de ecuaciones se presenta como imagen (por ejemplo, capturas de pizarras o documentos escaneados).
- Evaluación comparativa de checkpoints intermedios: al partir de `notes50m`, permite comparar el efecto de las dos épocas adicionales de RFT sobre el rendimiento en el dominio.
- Docencia e investigación en matemáticas asistidas por IA: uso controlado en entornos académicos para explorar la resolución automática de problemas ecuacionales con restricciones de libro cerrado.
- Integración en pipelines de transformers: al ser compatible con la librería `transformers` y con endpoints, puede desplegarse en infraestructuras de inferencia estándar para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 mil millones de parámetros, en bf16/fp16 se requieren aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 10-11 GB; en 4 bits, alrededor de 6-7 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue en precisión completa; RTX 4090 (24 GB) puede alojar el modelo en bf16 ajustadamente o con cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más en cuantización de 8/4 bits; en bf16 completo requiere 24 GB con poco margen.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-rft-k2-closedbook-notesstrict-2ep-from-notes50m-kl | 9,65 B | no disponible | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | según Qwen (no confirmado en la información) | Público |
| Modelos especializados en matemáticas de ~7-9 B | variable | variable | variable | variable |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación relevante es frente al propio modelo base Qwen3.5-9B, del que este checkpoint es un fine-tune especializado.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Especialización muy estrecha: el ajuste se centra en teoría de ecuaciones (SAIR); su rendimiento fuera de ese dominio puede degradarse respecto al base, pese a la regularización KL.
- Régimen closed-book: el modelo fue entrenado para operar sin fuentes externas, lo que puede aumentar el riesgo de alucinación en problemas que requieran datos actualizados o verificación factual.
- Sesgos conocidos: no disponibles; al derivar de Qwen3.5-9B, hereda los sesgos del base, no documentados aquí.
- Idiomas soportados: no disponibles; no se confirma el soporte multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad; solo 2 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación comunitaria.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del acceso gated.
- Fecha de creación (2026-10-26) y nomenclatura sugieren un artefacto de investigación, no un modelo listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-rft-k2-closedbook-notesstrict-2ep-from-notes50m-kl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
