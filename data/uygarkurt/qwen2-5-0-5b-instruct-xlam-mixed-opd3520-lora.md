# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd3520-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-opd3520-lora es un adaptador LoRA entrenado por el desarrollador uygarkurt sobre el modelo instructivo Qwen2.5-0.5B-Instruct de Alibaba. Su objetivo concreto es reforzar el *tool calling* estructurado y la capacidad de abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador se ha entrenado con la técnica de destilación en política (on-policy distillation, OPD), tomando como profesor congelado a Qwen2.5-3B-Instruct y como alumno al modelo base de 0,5 mil millones de parámetros.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con 0,5 B de parámetros totales y una ventana de contexto de 32 768 tokens (según las especificaciones publicadas de Qwen2.5-0.5B-Instruct). El adaptador añade únicamente pesos LoRA, por lo que requiere cargarse sobre el modelo base original. El entrenamiento consistió en 3 520 actualizaciones OPD durante 1,5 horas sobre el dataset uygarkurt/xlam-tool-calling-mixed.

La relevancia de esta ficha reside en que documenta un caso de ajuste fino muy ligero (LoRA sobre 0,5 B) orientado a una capacidad específica: la generación de llamadas a funciones en formato estructurado y la decisión de no invocar ninguna herramienta cuando no procede. Los resultados publicados muestran mejoras en precisión de nombre de función (xLAM FNA, de 86,57 % a 90,06 %) y en precisión exacta de llamada (xLAM ETC, de 62,61 % a 64,96 %), a costa de una caída en la detección de irrelevancia (de 66,93 % a 52,67 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 B (modelo base); el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar de la familia Qwen2.5) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar, 0,5 B de parámetros y contexto de 32 768 tokens. El adaptador LoRA modifica un subconjunto de capas del modelo base; la model card no detalla rango, alpha ni módulos objetivo. El entrenamiento se realizó con la librería PEFT y la herramienta Post-Training Lab del autor.

La innovación metodológica es el uso de destilación en política (OPD): el alumno (Qwen2.5-0.5B-Instruct) genera sus propias respuestas y aprende de las probabilidades por token que el profesor congelado (Qwen2.5-3B-Instruct) asigna a esas mismas secuencias. Se realizaron 3 520 actualizaciones OPD sobre el dataset mixto de tool calling uygarkurt/xlam-tool-calling-mixed, con un tiempo de bucle de entrenamiento de 1,5 horas (excluyendo carga de modelo, preparación de datos y evaluación externa). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: generación de llamadas a funciones en formato parseable, con precisión de nombre de función del 90,06 % en el split de test del dataset mixto.
- Abstención ante herramientas irrelevantes: el adaptador está entrenado explícitamente para no invocar funciones cuando las ofrecidas no son pertinentes, aunque los resultados publicados muestran una caída en esta métrica respecto al modelo base.
- Razonamiento básico y matemáticas: hereda las capacidades del modelo base (MMLU 42,04 %, MATH-500 15,80 % antes del ajuste).
- Seguimiento de instrucciones: IFEval del 28,10 % tras el ajuste (26,80 % en el base).
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen2.5 soporta más idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (*thinking mode*).

## Casos de uso

- **Enrutamiento de consultas a APIs en asistentes ligeros**: el adaptador puede clasificar la intención del usuario y emitir la llamada a función correspondiente en entornos con recursos muy limitados, gracias a sus 0,5 B de parámetros y a la precisión de nombre de función del 90,06 %.
- **Sistemas de agentes con presupuesto de cómputo mínimo**: al caber en CPU o en GPUs de gama baja, puede actuar como primer nivel de un pipeline de agentes que decide qué herramienta invocar antes de delegar en un modelo mayor.
- **Prototipado rápido de flujos de tool calling**: el adaptador permite validar esquemas de funciones y prompts de sistema en local antes de escalar a modelos de mayor tamaño, con un coste de entrenamiento de 1,5 horas.
- **Filtrado de llamadas irrelevantes en producción**: aunque la métrica de irrelevancia baja respecto al base, el adaptador sigue siendo útil como capa de abstención en asistentes que reciben un catálogo fijo de herramientas y deben evitar invocaciones espurias.
- **Investigación sobre destilación en política**: sirve como referencia reproducible de OPD con profesor de 3 B y alumno de 0,5 B para estudiar la transferencia de capacidades de tool calling en modelos pequeños.
- **Despliegue en dispositivos periféricos o entornos air-gapped**: el tamaño del adaptador y del modelo base permite ejecutarlo en portátiles o en hardware embebido con cuantización del modelo base, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; la primera fila es el modelo base y la segunda el adaptador OPD):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04 % | 15,80 % | 26,80 % | 62,61 % | 86,57 % | 50,28 % | 77,78 % | 66,93 % | — |
| OPD (este adaptador) | OPD 3 520 | 41,99 % | 14,60 % | 28,10 % | 64,96 % | 90,06 % | 54,45 % | 88,89 % | 52,67 % | 1,5 |

Notas de la model card: xLAM ETC es precisión exacta de llamada a herramienta; xLAM FNA es precisión de nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto con 2 546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a subconjuntos seleccionados de relevancia. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base de 0,5 B en fp16 ocupa aproximadamente 1 GB de pesos; en cuantización de 4 bits, alrededor de 0,3-0,5 GB. El adaptador LoRA añade una cantidad marginal no especificada.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior permite ejecutar el modelo con holgura y contexto amplio. Para contexto de 32 768 tokens conviene al menos 8-12 GB de VRAM.
- **Cabe en GPU consumer**: sí, en RTX 3050/3060/4060/4090 y equivalentes; también en CPU con llama.cpp u Ollama si se convierte el modelo base a GGUF y se fusiona el adaptador.
- **Opciones de despliegue**: transformers + PEFT (carga del adaptador sobre el base), vLLM (con soporte LoRA), llama.cpp/Ollama (requiere fusionar el adaptador en los pesos base y convertir a GGUF), TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada. El tiempo de entrenamiento (1,5 h para 3 520 actualizaciones) no es un indicador de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-xlam-mixed-opd3520-lora | 0,5 B + LoRA | 32 768 | Sí, ajustado con OPD | no disponible | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5 B | 32 768 | Parcial, sin ajuste específico | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3 B | 32 768 | Parcial | Apache 2.0 (según Qwen) | Hugging Face |
| xLAM-1B-fc-r (Salesforce) | 1 B | no disponible | Sí, especializado en function calling | no disponible | Hugging Face |

La comparación con xLAM-1B-fc-r es la más directa por tratarse de un modelo pequeño especializado en tool calling, pero no se dispone de sus métricas en la información proporcionada para contrastar con las del adaptador.

## Limitaciones y advertencias

- **Idioma**: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al modelo base.
- **Detección de irrelevancia**: la métrica de Irrelevance cae del 66,93 % al 52,67 % tras el ajuste, lo que indica una mayor tendencia a invocar herramientas cuando no procede. Es un caveat relevante para producción.
- **MATH-500**: el rendimiento en matemáticas baja de 15,80 % a 14,60 %, y MMLU se mantiene prácticamente plano (42,04 % a 41,99 %). El ajuste no mejora el razonamiento general.
- **Tamaño reducido**: con 0,5 B de parámetros, la capacidad de razonamiento multi-paso y de manejo de instrucciones complejas es limitada; IFEval del 28,10 % refleja esta restricción.
- **Licencia**: no disponible en la información proporcionada; debe verificarse antes de cualquier uso comercial.
- **Formato de distribución**: es un adaptador LoRA, no un modelo completo; requiere cargar el modelo base Qwen2.5-0.5B-Instruct y no puede usarse de forma autónoma.
- **Riesgo de alucinación**: inherente a los modelos de 0,5 B; no se han publicado evaluaciones específicas de fidelidad factual.
- **Sesgos**: no se documentan análisis de sesgo en la model card.
- **Reproducibilidad**: las evaluaciones xLAM usan scripts propios del autor, lo que dificulta la comparación directa con otras publicaciones.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd3520-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
