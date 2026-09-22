# while-ai/course-refunds-sft-1.5b

## Resumen

`while-ai/course-refunds-sft-1.5b` es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre `Qwen/Qwen2.5-1.5B-Instruct`, publicado por la organización while-ai dentro de su colección de recetas y ejecuciones de curso. No es un modelo completo, sino un adaptador PEFT que se carga encima del modelo base y que está especializado en una única tarea: resolver casos de reembolso de cursos mediante comportamiento de agente. El repositorio pesa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

Su interés no está en la capacidad general, sino en la metodología: el autor documenta un entrenamiento reproducible de 40 pasos sobre un export de 46 filas, ejecutado en una sola GPU A10G en unos seis minutos (35 segundos de cómputo de entrenamiento), y publica el resultado con intervalos de confianza. El adaptador eleva el pass@1 de 0,25 a 0,73 sobre 40 tareas retenidas que el entrenamiento nunca vio, con un delta emparejado de +0,481. La pérdida baja de 3,07 a 0,80 a lo largo de los 40 pasos.

Es, por tanto, una ficha relevante como referencia de ingeniería de fine-tuning de bajo coste y como banco de pruebas de agentes en dominios muy acotados, no como modelo de propósito general. La información disponible sobre idiomas, cuantizaciones y benchmarks generales es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen2.5-1.5B-Instruct` |
| Parámetros totales | No disponible para el adaptador; el modelo base es de la familia 1.5B (el repositorio ocupa 0,1 GB) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | No disponible; los pesos se distribuyen en `safetensors` en formato de adaptador LoRA. La cuantización requeriría fusionar el adaptador con el modelo base y convertir a GGUF, AWQ o GPTQ (no documentado por el autor) |
| Idiomas soportados | No disponible; las etiquetas del repositorio no declaran idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador LoRA/PEFT, `library_name: peft`) |
| Modelo base | `Qwen/Qwen2.5-1.5B-Instruct` |
| Pipeline | `text-generation` |
| Dataset de entrenamiento | Export de 46 filas del propio curso (SFT) |
| Configuración de entrenamiento | 40 pasos, 1 GPU A10G, ~35 segundos de entrenamiento, ejecución `lesson7-sft` |
| Repositorio | 0,1 GB; `checkpoints/` no se publica |
| Fecha de publicación | 22 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con SFT sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5. Al ser PEFT, el adaptador no modifica el checkpoint base: se carga con `PeftModel.from_pretrained` sobre el modelo original, lo que permite mantener el repositorio en 0,1 GB y alternar entre el comportamiento base y el ajustado sin duplicar pesos. La model card indica que el repositorio raíz contiene el "arm" que reporta el número principal y que cualquier otra variante se distribuye en subcarpetas con su nombre; `checkpoints/` nunca se publica.

El entrenamiento es deliberadamente mínimo: 40 pasos sobre un export de 46 filas, en una única A10G, con 35 segundos de cómputo efectivo y una pérdida que cae de 3,07 a 0,80. El autor publica la receta completa en `recipes/04-train/sft` del repositorio `whilehq/whileai-sdk`, con semilla, versiones de librerías y GPU fijadas, y permite reproducirlo con `modal run train_modal.py --data train.jsonl`. No se documentan en la información disponible ni la composición detallada del dataset, ni el uso de RLHF/DPO, ni innovaciones arquitectónicas propias: la innovación es metodológica (receta reproducible y evaluación con intervalos de confianza), no arquitectónica.

## Capacidades

- Generación de texto conversacional dentro del dominio de reembolsos de cursos, sobre el modelo base Qwen2.5-1.5B-Instruct.
- Comportamiento de agente: la etiqueta `agent` del repositorio y la propia tarea de reembolsos apuntan a resolución multi-paso con llamadas a herramientas, aunque el autor no detalla el formato exacto de tool calling ni el conjunto de herramientas disponibles.
- Ejecución de políticas de decisión: la métrica pass@1 sobre 40 tareas retenidas mide si el agente completa correctamente el flujo de reembolso, no la calidad del texto generado.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen2.5 tiene cobertura multilingüe, pero no se declara nada para este adaptador).
- Capacidades especiales: no se documentan modos de razonamiento explícito, visión ni audio.
- Capacidad general (conocimiento, matemáticas, código): no evaluada en esta ficha; el adaptador solo está medido en su tarea objetivo.

## Casos de uso

- Automatización de reembolsos de cursos: el adaptador resuelve el flujo completo de decisión sobre casos de reembolso con un pass@1 de 0,73 sobre 40 tareas retenidas, frente a 0,25 del modelo base, lo que lo hace utilizable como primer nivel de automatización con revisión humana en los casos límite.
- Plantilla de fine-tuning de bajo coste: sirve como referencia reproducible para equipos que quieran validar una receta de SFT (40 pasos, una A10G, 35 segundos de entrenamiento) antes de invertir en datasets y cómputo mayores.
- Prototipado de agentes con presupuesto mínimo: al apoyarse en un modelo de 1.5B, permite iterar sobre el diseño del agente y del conjunto de herramientas en hardware pequeño antes de escalar a modelos mayores.
- Evaluación y regresión de pipelines de agentes: el banco de 40 tareas retenidas con pass@1, pass^4 y pass@4 y con intervalos de confianza bootstrap puede reutilizarse como prueba de regresión en CI cuando se cambia el prompt, la herramienta o el modelo base.
- Atención al cliente de back-office: despliegue como clasificador/decisor de solicitudes de reembolso en un canal interno, con contexto acotado y sin exposición directa al usuario final.
- Investigación en ajuste eficiente: comparar "arms" (variantes de entrenamiento) dentro del mismo repositorio para estudiar cuánto de la mejora proviene del formato de datos frente al número de pasos.
- Despliegue on-premise o en el borde: un modelo de 1.5B más un adaptador de decenas de megabytes es viable en GPUs de gama de consumo y en entornos sin conectividad, algo inviable con modelos de decenas de miles de millones de parámetros.
- Generación de datos sintéticos de dominio: usar el adaptador ajustado para producir trayectorias de reembolso etiquetadas que alimenten un futuro entrenamiento de un modelo mayor.

## Benchmarks y rendimiento

Únicos resultados publicados por el autor, medidos sobre 40 tareas retenidas que el entrenamiento no vio. La semilla del modelo base fue la 1; tres pasadas del modelo base dieron un `run_std` de 0,002, por lo que el autor considera ruido cualquier delta inferior a 0,011.

| Métrica | Antes (base, semilla 1) | Después (este adaptador) | Delta |
|---|---|---|---|
| pass@1 | 0,25 | 0,73 | +0,481 (IC 95 %: +0,342 a +0,616) |
| IC 95 % de pass@1 | [0,16; 0,35] | [0,63; 0,81] | — |
| pass^4 | 0,07 | 0,41 | No disponible |
| pass@4 | 0,48 | 0,95 | No disponible |
| Pérdida de entrenamiento | 3,07 | 0,80 | — |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: estimación a partir del tamaño del modelo base (1.5B). En fp16/bf16, aproximadamente 3 GB de pesos más caché KV y activaciones; en cuantización de 8 bits, en torno a 2 GB; en 4 bits, alrededor de 1 GB. Cifras orientativas, no publicadas por el autor.
- Almacenamiento: 0,1 GB para el adaptador; el checkpoint del modelo base debe descargarse por separado.
- GPU de entrenamiento: una A10G (24 GB), según la receta del autor. Tiempo reportado: unos seis minutos de receta completa y 35 segundos de entrenamiento efectivo en 40 pasos.
- GPU recomendadas para inferencia: cualquier GPU con 4 GB o más de VRAM es suficiente para el modelo base en precisión reducida; A10G, L4, RTX 3060/4060 en adelante. Para servir muchas réplicas concurrentes conviene A100/H100 o L40S.
- ¿Cabe en GPU de consumo? Sí, con holgura: el modelo base de 1.5B en fp16 cabe en GPUs de 4-6 GB y en 4 bits en iGPUs con memoria unificada, siempre que el runtime lo permita.
- Opciones de despliegue: carga directa con `transformers` + `peft` (el método documentado en la model card); vLLM admite adaptadores LoRA de forma nativa; para `llama.cpp` u Ollama es necesario fusionar el adaptador con el modelo base y convertir los pesos a GGUF, paso no documentado por el autor. TGI u otros servidores requieren también la fusión previa o soporte explícito de LoRA.
- Latencia y throughput: no disponibles. El autor solo publica el tiempo de entrenamiento, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | pass@1 en el banco de 40 tareas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `while-ai/course-refunds-sft-1.5b` (este) | Adaptador LoRA sobre 1.5B | No disponible | 0,73 [0,63; 0,81] | Apache 2.0 | safetensors (PEFT/LoRA) | HuggingFace, 0 descargas |
| `Qwen/Qwen2.5-1.5B-Instruct` (base) | 1.5B | No disponible en esta ficha | 0,25 [0,16; 0,35] | Apache 2.0 | safetensors | HuggingFace, ampliamente adoptado |
| Otros adaptadores LoRA de dominio específico sobre Qwen2.5-1.5B | No disponible | No disponible | No disponible | Variable | safetensors (PEFT/LoRA) | No disponible |
| Modelos de agente de mayor tamaño (por ejemplo, familias de 7B-70B) | No disponible | No disponible | No comparable: el banco de 40 tareas es específico de esta receta | Variable | Variable | No disponible |

La única comparación con datos es contra el propio modelo base antes del ajuste. No se dispone de cifras de alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el adaptador solo está validado en tareas de reembolso de cursos; no debe asumirse transferencia a otras tareas de agente.
- Muestra de evaluación pequeña: 40 tareas retenidas, con intervalos de confianza amplios (±0,10 en pass@1). Las conclusiones sobre mejoras pequeñas son frágiles.
- Sobreajuste plausible: 40 pasos sobre un export de 46 filas es un entrenamiento muy corto y muy pequeño; la mejora puede depender en parte del formato exacto de la tarea y del conjunto de herramientas usado en la evaluación.
- Riesgo de alucinación y de acciones erróneas: al ser un agente de decisión sobre reembolsos, un fallo puede traducirse en una devolución indebida o en el rechazo incorrecto de una solicitud legítima. Requiere validación determinista de reglas de negocio y supervisión humana.
- Sesgos: no se documenta ningún análisis de sesgos, ni de equidad entre idiomas o perfiles de usuario.
- Idiomas: no declarados; el comportamiento fuera del idioma de entrenamiento es desconocido.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento del curso, no detallados.
- Advertencia del propio autor: recomienda leer la sección "Learned" de la receta antes de citar cualquier número de la model card.
- Metadatos llamativos: el repositorio tiene fecha de creación de septiembre de 2026 y cero descargas; no hay evidencia de uso en producción ni de revisión por terceros.
- Formato: al ser un adaptador, no es directamente compatible con runtimes que esperan un modelo completo (GGUF, TensorRT-LLM) sin fusionar pesos previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/course-refunds-sft-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Receta de entrenamiento (SFT): https://github.com/whilehq/whileai-sdk/tree/main/recipes/04-train/sft
- Repositorio del SDK: https://github.com/whilehq/whileai-sdk
- Colección "Course and community runs": https://huggingface.co/collections/while-ai/course-and-community-runs-6ab271de189fd0c363cfab92
- Paper o blog adicional: no disponible
- Demo: no disponible

Nota: los resultados de la búsqueda web proporcionados no guardan relación con el modelo (corresponden a definiciones y traducciones de la palabra inglesa "while") y no se han utilizado como fuente.
