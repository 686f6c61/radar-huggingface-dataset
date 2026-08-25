# Sravanigunnu/llama-3.1-8b-macd-hindi-spotcheck-lora

## Resumen

El modelo `Sravanigunnu/llama-3.1-8b-macd-hindi-spotcheck-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Sravani Gunnu, fine-tuneado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct` para la detección de discurso de odio y abuso en texto en hindi. Forma parte del proyecto de investigación *"Are Multilingual LLMs Reliable Content Moderators of Indic Hate Speech?"*, cuyo objetivo es evaluar la fiabilidad de los LLM multilingües como moderadores de contenido en lenguas índicas.

La particularidad de este adaptador es que se entrenó únicamente con el subconjunto *spot-check* del dataset MACD, es decir, aquellas filas donde las etiquetas de ground-truth, GPT-5.4 y Claude Opus 4.5 coincidían. Este filtrado de etiquetas busca reducir el ruido en los datos de entrenamiento y mejorar la precisión del clasificador. El adaptador logra una mejora de +0.0077 en F1 macro respecto al modelo entrenado con todas las etiquetas, alcanzando 0.9590 en el conjunto de test.

Al ser un adaptador LoRA, no es un modelo independiente: requiere cargar el modelo base Llama-3.1-8B-Instruct y aplicar los pesos del adaptador mediante la librería PEFT. Esto lo hace ligero (0.1 GB) y fácil de integrar en pipelines existentes de moderación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) con atención GQA (Grouped-Query Attention) |
| Parametros totales | 8.03 mil millones (modelo base) + adaptador LoRA (~0.1 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | Hindi (principal), inglés (secundario) |
| Licencia | llama3.1 (licencia de Meta para Llama 3.1) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Llama 3.1, que emplea atención con Grouped-Query Attention (GQA) para mejorar la eficiencia en inferencia. El modelo base tiene 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens, aunque para la tarea de clasificación binaria solo se utiliza una pequeña parte de esa capacidad.

El entrenamiento se realizó sobre el subconjunto *spot-check* del dataset MACD, compuesto por 22.043 ejemplos de entrenamiento y 2.785 de test, todos ellos con etiquetas verificadas por consenso entre tres anotadores (ground-truth, GPT-5.4 y Claude Opus 4.5). Se aplicó fine-tuning con LoRA sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) con rango `r=16`, `alpha=32`, dropout de 0.05, durante 3 épocas, con learning rate de 2×10⁻⁴ y precisión bfloat16. No se emplearon técnicas de RLHF ni DPO; el entrenamiento es de tipo supervisado sobre la tarea de clasificación.

## Capacidades

- Clasificación binaria de discurso de odio y abuso en texto en hindi: devuelve `1` si el texto contiene odio o abuso, `0` si no.
- Salida restringida a un único token (`0` o `1`), lo que facilita su integración en sistemas automáticos de moderación.
- Funciona con el chat template de Llama 3.1, permitiendo usar el prompt de sistema definido en la model card.
- Soporte multilingüe limitado: entrenado principalmente en hindi, con capacidad residual en inglés.
- No soporta tool calling, generación de código, razonamiento multi-step ni otras capacidades generales del modelo base, ya que el adaptador está especializado exclusivamente en la tarea de moderación.

## Casos de uso

- Moderación de comentarios en redes sociales: el adaptador puede clasificar automáticamente comentarios en hindi como abusivos o no, permitiendo filtrar contenido dañino en plataformas con audiencia hindi.
- Detección de odio en foros y comunidades online: integrable en pipelines de preprocesamiento para marcar mensajes que requieran revisión humana.
- Auditoría de contenido en plataformas de streaming o noticias: análisis de comentarios de usuarios en hindi para cumplir normativas de moderación.
- Investigación académica sobre discurso de odio en lenguas índicas: sirve como herramienta de etiquetado automático para estudios sociolingüísticos.
- Sistemas de alerta temprana en redes sociales: monitorización en tiempo real de menciones o publicaciones que contengan lenguaje abusivo en hindi.
- Filtrado de contenido generado por usuarios en aplicaciones móviles: clasificación previa antes de publicar comentarios en apps con soporte en hindi.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de test de MACD:

| Configuración | N entrenamiento | N test | F1 macro |
|---|---|---|---|
| Original (todas las etiquetas) | 26.911 | 3.000 | 0.9513 |
| **Spot-check (este adaptador)** | **22.043** | **2.785** | **0.9590** |
| Diferencia | | | **+0.0077** |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Llama-3.1-8B-Instruct, la inferencia requiere cargar el modelo base completo. En bfloat16, el modelo base ocupa aproximadamente 16 GB de VRAM. Con cuantización (por ejemplo, 4-bit) se puede reducir a unos 6-8 GB.
- GPU recomendadas: para inferencia en bfloat16, una GPU con al menos 16 GB de VRAM (A100 40GB, RTX 4090, L4, etc.). Para cuantización 4-bit, una RTX 3060 de 12 GB o superior es suficiente.
- El adaptador en sí es muy ligero (0.1 GB) y no añade requisitos adicionales significativos.
- Opciones de despliegue: se puede usar con `transformers` + `peft` en Python, o exportar a formatos como GGUF para ejecución con `llama.cpp` u Ollama (requiere fusionar el adaptador con el modelo base).
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de unos 20-40 ms por token, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de detección de odio en hindi en la información proporcionada. El autor ha publicado otros adaptadores sobre el mismo modelo base con diferentes subconjuntos de MACD (por ejemplo, `llama-3.1-8b-macd-hindi-nfull-lora` y `llama-3.1-8b-macd-hindi-n1000-lora`), pero no se han facilitado sus métricas. Como referencia, el adaptador spot-check supera al modelo entrenado con todas las etiquetas en F1 macro (0.9590 vs 0.9513), lo que sugiere que el filtrado de etiquetas mejora la precisión.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en clasificación binaria de odio/abuso; no es un modelo de propósito general y no debe usarse para otras tareas.
- El entrenamiento se realizó sobre un dataset específico (MACD) y puede no generalizar bien a otros dominios o variedades del hindi.
- Riesgo de sesgos: el modelo puede reflejar los sesgos presentes en los datos de entrenamiento, especialmente en lo relativo a dialectos, registros o temas sensibles.
- Riesgo de alucinación: aunque la salida está restringida a `0` o `1`, en casos ambiguos el modelo puede clasificar incorrectamente.
- La licencia llama3.1 permite uso comercial, pero impone restricciones (por ejemplo, no usar para mejorar otros modelos de lenguaje) y requiere atribución. Es necesario revisar los términos completos de Meta.
- El adaptador depende del modelo base `meta-llama/Llama-3.1-8B-Instruct`, que requiere aceptar los términos de licencia de Meta en Hugging Face antes de su descarga.
- No se han publicado evaluaciones de robustez frente a ataques adversariales o texto ofuscado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sravanigunnu/llama-3.1-8b-macd-hindi-spotcheck-lora)
- [Perfil del autor en Hugging Face](https://huggingface.co/Sravanigunnu)
- [Modelo base Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
- [Adaptador hermano: llama-3.1-8b-macd-hindi-nfull-lora](https://d6108366.hf-mirror.com/Sravanigunnu/llama-3.1-8b-macd-hindi-nfull-lora/blob/main/README.md?code=true)
- [Adaptador hermano: llama-3.1-8b-macd-hindi-n1000-lora (despliegue en FriendliAI)](https://friendli.ai/models/Sravanigunnu/llama-3.1-8b-macd-hindi-n1000-lora)
