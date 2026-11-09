# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd1760-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd1760-lora` es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen2.5-0.5B-Instruct de Alibaba. El adaptador está especializado en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. Se entrenó mediante un pipeline de dos etapas: primero un ajuste supervisado (SFT) de 8.400 actualizaciones y después una destilación on-policy (OPD) de 1.760 actualizaciones, usando un profesor congelado Qwen2.5-3B-Instruct.

El problema que aborda es concreto: los modelos pequeños tienden a invocar herramientas incluso cuando ninguna de las disponibles resulta pertinente, lo que genera llamadas erróneas en pipelines de agentes. Este adaptador busca mejorar la precisión de las llamadas a funciones y, sobre todo, la detección de irrelevancia. La relevancia inmediata es limitada por su tamaño (0,5B parámetros) y por su naturaleza de adaptador, pero resulta útil como referencia de metodología de post-entrenamiento aplicada a modelos pequeños.

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con 0,5 mil millones de parámetros y 32.768 tokens de contexto. El adaptador no modifica la arquitectura, solo añade pesos LoRA entrenados sobre el modelo base. El repositorio tiene un tamaño de 0,0 GB según Hugging Face, lo que sugiere que los pesos del adaptador son de muy pequeño tamaño o que el repositorio no está completamente subido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar como GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parámetros con atención causal estándar. No se introduce ninguna innovación arquitectónica: el entrenamiento se realiza mediante LoRA (Low-Rank Adaptation), que congela los pesos del modelo base y entrena matrices de bajo rango en las capas de atención y proyección. El adaptador se distribuye en formato PEFT y requiere cargar el modelo base original de Qwen.

El entrenamiento se realizó en dos fases. La primera consistió en 8.400 actualizaciones de SFT sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, que contiene ejemplos de tool calling estructurado. La segunda fase aplicó destilación on-policy (OPD) durante 1.760 actualizaciones, usando como profesor congelado Qwen2.5-3B-Instruct: el estudiante genera respuestas y aprende de las probabilidades por token que el profesor asigna a esas mismas respuestas. El tiempo total de entrenamiento reportado es de 1,9 horas (1,3 h de SFT y 0,6 h de OPD), excluyendo carga de modelo y preparación de datos. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: el adaptador está específicamente entrenado para emitir llamadas a funciones en formato estructurado, con una precisión de nombre de función del 90,49% en el conjunto de evaluación xLAM FNA.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando ninguna de las ofrecidas es pertinente, con una tasa de acierto del 100% en el subconjunto de relevancia reportado.
- Razonamiento multi-paso limitado: el tamaño del modelo base (0,5B) restringe la profundidad del razonamiento; los benchmarks de matemáticas (MATH-500: 18,40%) y conocimiento (MMLU: 38,46%) reflejan esta limitación.
- Capacidades multilingües: solo inglés según la model card.
- No se reportan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: el adaptador puede desplegarse en un agente de bajo coste que reciba una consulta y un conjunto de funciones disponibles, y decida si invocar alguna o abstenerse. Su tasa de irrelevancia del 100% en el subconjunto evaluado lo hace adecuado para evitar llamadas espurias en producción.
- Clasificación de intención con funciones: en un pipeline de atención al cliente, el modelo puede mapear la consulta del usuario a una función concreta (por ejemplo, `consultar_pedido` o `cancelar_suscripcion`) y extraer los argumentos estructurados, con la ventaja de que no fuerza una llamada si la consulta no encaja.
- Filtrado previo en sistemas RAG con herramientas: antes de invocar un recuperador o una API externa, el adaptador puede determinar si la consulta requiere una herramienta o si debe responderse directamente, reduciendo latencia y coste en cascadas de modelos mayores.
- Generación de borradores de llamadas a funciones para revisión humana: en entornos donde la precisión es crítica, el adaptador puede proponer la llamada estructurada y un humano validarla, aprovechando su bajo coste computacional (0,5B parámetros).
- Evaluación de metodologías de post-entrenamiento: investigadores pueden reproducir el pipeline SFT + OPD sobre un modelo pequeño para estudiar el efecto de la destilación on-policy en la abstención y el tool calling, usando el adaptador como punto de partida.
- Prototipado rápido en local: al caber en GPU de consumo y requerir solo el modelo base de 0,5B, permite iterar sobre esquemas de funciones y prompts sin infraestructura dedicada.
- Educación y demos de tool calling: útil para mostrar en talleres cómo un modelo pequeño puede aprender a abstenerse, con métricas concretas de relevancia e irrelevancia.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Todas las puntuaciones son porcentajes. La primera fila corresponde al adaptador SFT previo (punto de partida de la OPD) y la segunda al adaptador actual (SFT + OPD).

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT (8.400 updates) | 37,91% | 18,00% | 29,21% | 74,51% | 88,18% | 46,24% | 55,56% | 88,59% |
| SFT + OPD (1.760 updates) | 38,46% | 18,40% | 30,31% | 73,53% | 90,49% | 58,95% | 100,00% | 15,68% |

Notas del autor: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de función. Las evaluaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de función única; Relevance e Irrelevance reportan los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

El dato más llamativo es el intercambio entre relevancia e irrelevancia: la OPD eleva la relevancia al 100% pero desploma la irrelevancia al 15,68%, lo que indica un sesgo hacia invocar herramientas incluso cuando no procede. Esto contradice parcialmente el objetivo declarado de abstención y debe tenerse en cuenta en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 requiere aproximadamente 1 GB de VRAM; en cuantización de 8 bits, unos 0,5 GB; en 4 bits, unos 0,3 GB. El adaptador LoRA añade un consumo despreciable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), vLLM (soporte de LoRA), llama.cpp u Ollama (requiere convertir el adaptador a GGUF y fusionarlo con el base), TGI (soporte de adaptadores).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto y latencia baja en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B | 32.768 | Sí, especializado con abstención | no disponible | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 | Parcial, sin especialización | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 | Sí, genérico | Apache 2.0 (según Qwen) | Hugging Face |
| Adaptador SFT previo del mismo autor | 0,5B | 32.768 | Sí, sin OPD | no disponible | Hugging Face |

La comparación con el adaptador SFT previo es la más directa: la OPD mejora BFCL Single-turn FC de 46,24% a 58,95% y la relevancia de 55,56% a 100%, pero degrada la irrelevancia de 88,59% a 15,68%. Frente al modelo base, el adaptador gana en tool calling estructurado pero no se reportan métricas del base en la información disponible.

## Limitaciones y advertencias

- El adaptador degrada gravemente la detección de irrelevancia (15,68% tras OPD frente a 88,59% antes), lo que contradice el objetivo declarado de abstención. En producción, esto puede provocar llamadas a funciones innecesarias.
- El tamaño del modelo base (0,5B) limita el razonamiento: MMLU del 38,46%, MATH-500 del 18,40% e IFEval del 30,31% son puntuaciones bajas para tareas complejas.
- Solo soporta inglés según la model card; no se reportan capacidades multilingües.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen2.5-0.5B-Instruct tiene licencia Apache 2.0, pero el adaptador no declara licencia propia.
- Riesgo de alucinación en la generación de argumentos de funciones: el adaptador puede inventar valores o nombres de parámetros no presentes en el esquema.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente disponibles o que el modelo no ha sido validado por la comunidad.
- Las evaluaciones xLAM omiten 743 ejemplos por el límite de 640 tokens de prompt, lo que puede sesgar las métricas hacia consultas cortas.
- No se han publicado resultados de benchmarks independientes; todas las métricas provienen del autor.
- El adaptador requiere cargar el modelo base Qwen2.5-0.5B-Instruct, lo que añade una dependencia externa y posibles incompatibilidades de versión de PEFT/transformers.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd1760-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
