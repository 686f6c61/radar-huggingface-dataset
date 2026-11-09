# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd880-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd880-lora es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador está especializado en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. Se entrenó con la herramienta Post-Training Lab sobre el dataset uygarkurt/xlam-tool-calling-mixed, en dos fases: 8.400 actualizaciones de supervised fine-tuning (SFT) seguidas de 880 actualizaciones de on-policy distillation (OPD).

La innovación principal no está en el modelo base, sino en el procedimiento de entrenamiento: la segunda fase aplica destilación on-policy desde un profesor congelado, Qwen/Qwen2.5-3B-Instruct, de modo que el estudiante aprende a partir de las probabilidades por token del profesor sobre sus propias respuestas generadas. Según la model card, esta fase mejora de forma notable las métricas de tool calling (xLAM ETC del 74,51% al 80,71%, BFCL Single-turn FC del 46,24% al 57,85% y relevancia del 55,56% al 94,44%), a costa de degradar la detección de irrelevancia (del 88,59% al 46,26%).

Es un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para experimentación con modelos muy pequeños (0,5B parámetros) en tareas de function calling. No es un modelo de propósito general ni compite en razonamiento o conocimiento con modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5B en el modelo base; el adaptador LoRA no especifica su numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion trunca prompts a 640 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT/transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parametros. El entrenamiento se realizó en dos etapas sobre el dataset uygarkurt/xlam-tool-calling-mixed: primero 8.400 actualizaciones de SFT (1,3 horas) y después 880 actualizaciones de OPD (0,3 horas), para un total de 1,6 horas de bucle de entrenamiento, excluyendo carga de modelo, preparación de datos y evaluación externa. En la fase OPD, el profesor congelado es Qwen2.5-3B-Instruct y el estudiante aprende de las probabilidades por token del profesor sobre sus propias respuestas generadas (destilación on-policy).

El objetivo declarado del entrenamiento es doble: tool calling estructurado y abstención cuando las herramientas ofrecidas son irrelevantes. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO; solo indica que ambas fases usaron el mismo dataset mixto. Los resultados de evaluación se obtuvieron con scripts propios de Post-Training Lab.

## Capacidades

- Generación de texto conversacional (pipeline text-generation) sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: generación de llamadas a funciones en formato estructurado, evaluado con xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las ofrecidas no aplican, medida con los subconjuntos Relevance e Irrelevance.
- Function calling de un solo turno según los subconjuntos seleccionados de BFCL-v3 (BFCL Single-turn FC).
- Capacidades generales heredadas del modelo base (razonamiento básico, matemáticas, seguimiento de instrucciones), reflejadas en MMLU, MATH-500 e IFEval, aunque con valores bajos.
- Multilingüe: limitado a inglés según la model card.
- No se documentan capacidades de visión, audio, modo thinking ni soporte de agentes multi-paso más allá del tool calling de un turno.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: el adaptador puede decidir qué función invocar (o no invocar ninguna) en un catálogo de herramientas ofrecido en el prompt, con una precisión de nombre de función del 96,90% en el test split del dataset mixto.
- Prototipado de pipelines de function calling en entornos con recursos muy limitados: al partir de un modelo de 0,5B, cabe en GPU de consumo y permite iterar rápido sobre esquemas de herramientas antes de escalar a modelos mayores.
- Filtrado de consultas fuera de dominio: la métrica de irrelevancia (46,26%) permite usar el adaptador como clasificador de abstención en flujos donde invocar una herramienta incorrecta es costoso, siempre con validación adicional por el descenso observado respecto al checkpoint SFT.
- Investigación sobre destilación on-policy: sirve como caso reproducible de OPD desde un profesor de 3B a un estudiante de 0,5B en una tarea concreta, con métricas antes y después publicadas.
- Evaluación comparativa de adaptadores LoRA: útil como baseline de bajo coste para comparar técnicas de post-entrenamiento en tool calling (SFT frente a SFT + OPD).
- Generación de datos sintéticos de llamadas a funciones: el adaptador puede producir ejemplos estructurados de tool calls para aumentar datasets de entrenamiento, revisando manualmente la calidad por el tamaño reducido del modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; la primera fila es el adaptador SFT inicial y la segunda el adaptador SFT + OPD de este repositorio):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT starting adapter | SFT 8.400 | 37,91% | 18,00% | 29,21% | 74,51% | 88,18% | 46,24% | 55,56% | 88,59% | 1,3 |
| SFT + OPD (este adaptador) | OPD 880 | 38,34% | 18,60% | 29,21% | 80,71% | 96,90% | 57,85% | 94,44% | 46,26% | 1,6 |

Notas de la model card: xLAM ETC es exact tool-call accuracy y xLAM FNA es function-name accuracy; ambas se miden sobre el test split del dataset mixto, con 2.546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio. IFEval usa prompt-level strict accuracy. No se publican comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B ocupa aproximadamente 1 GB en FP16 y en torno a 0,3-0,5 GB en cuantizaciones de 4 bits; el adaptador LoRA añade un sobrecoste mínimo. No se dispone de mediciones publicadas para este adaptador concreto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para inferencia en cuantización de 4 bits.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre Qwen2.5-0.5B-Instruct), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM o TGI tras fusionar los pesos. La model card solo documenta el uso vía PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + OPD) | 0,5B (base) | no disponible | Sí, especializado (BFCL Single-turn FC 57,85%) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | Capacidad genérica, sin especialización declarada | no disponible en esta ficha | Hugging Face (modelo oficial) |
| Adaptador SFT inicial (uygarkurt) | 0,5B (base) | no disponible | Sí (BFCL Single-turn FC 46,24%) | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | no disponible en esta ficha | Capacidad genérica | no disponible en esta ficha | Hugging Face (modelo oficial) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, especialización y disponibilidad.

## Limitaciones y advertencias

- El checkpoint SFT + OPD mejora el tool calling pero degrada fuertemente la detección de irrelevancia (del 88,59% al 46,26%): el modelo tiende a invocar herramientas aunque no proceda, lo que es crítico en producción.
- Rendimiento general bajo: MMLU del 38,34%, MATH-500 del 18,60% e IFEval del 29,21%, propios de un modelo de 0,5B; no es adecuado para tareas de razonamiento o conocimiento general.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base y por la especialización estrecha en tool calling.
- Limitación de idioma: solo inglés declarado.
- Límite práctico de prompt: la evaluación descarta ejemplos por encima de 640 tokens, lo que sugiere problemas con prompts largos en la tarea de tool calling.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; hay que verificar la licencia del modelo base Qwen2.5-0.5B-Instruct por separado.
- Adaptador con cero descargas y cero likes: sin validación por parte de la comunidad.
- Las métricas son agregados específicos del estudio, obtenidos con scripts propios del autor, no con harness estándar; la comparabilidad con otros trabajos es limitada.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd880-lora
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
