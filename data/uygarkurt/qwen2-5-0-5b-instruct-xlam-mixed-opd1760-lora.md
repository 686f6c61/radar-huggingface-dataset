# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd1760-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-opd1760-lora es un adaptador LoRA entrenado por uygarkurt sobre el modelo instructivo Qwen/Qwen2.5-0.5B-Instruct. El objetivo del adaptador es especializar al modelo base en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. Se entrenó mediante destilación on-policy (OPD) tomando como profesor congelado a Qwen/Qwen2.5-3B-Instruct, de modo que el alumno de 0,5B aprende de las probabilidades por token que el profesor asigna a sus propias respuestas generadas.

El modelo resuelve un problema concreto: los modelos pequeños suelen fallar al emitir llamadas a funciones bien formadas y tienden a invocar herramientas incluso cuando no procede. Este adaptador busca mejorar la precisión de las llamadas (exact tool-call y function-name) y la relevancia de las mismas, a costa de una ligera pérdida en la detección de irrelevancia. Es relevante para quienes despliegan agentes con tool calling en entornos con recursos muy limitados, donde un modelo de 0,5B permite inferencia en CPU o GPU de gama baja.

El adaptador se entrenó con 1.760 actualizaciones OPD sobre el dataset uygarkurt/xlam-tool-calling-mixed, con un tiempo de bucle de entrenamiento de 0,7 horas. El repositorio contiene únicamente los pesos del adaptador (formato safetensors vía PEFT), no los pesos completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5B (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta 32.768 tokens; las evaluaciones usan un limite de prompt de 640 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base fusionado) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parametros. El entrenamiento emplea destilacion on-policy (OPD): el alumno genera respuestas y aprende a partir de las distribuciones de probabilidad por token que el profesor congelado (Qwen2.5-3B-Instruct) asigna a esas mismas secuencias. Se partió directamente del modelo instructivo base, sin etapa previa de ajuste supervisado indicada en la model card.

El dataset de entrenamiento es uygarkurt/xlam-tool-calling-mixed, orientado a tool calling estructurado y a la abstención ante herramientas irrelevantes. Se realizaron 1.760 actualizaciones OPD con un tiempo de bucle de 0,7 horas (excluyendo carga de modelos, preparación de datos y evaluación externa). No se detallan en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni hiperparámetros del LoRA (rango, alpha, capas objetivo).

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emisión de llamadas a funciones en formato estructurado, evaluado con xLAM ETC y xLAM FNA.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las herramientas ofrecidas no son pertinentes (evaluada en los subsets Relevance/Irrelevance).
- Function calling de un solo turno, evaluado con subsets de BFCL-v3.
- Razonamiento y matemáticas heredados del modelo base (evaluados con MMLU y MATH-500).
- Seguimiento de instrucciones heredado del modelo base (evaluado con IFEval).
- Soporte multilingüe limitado al inglés según la model card.
- No se documentan capacidades de visión, audio, modo thinking ni agentes multi-paso más allá del tool calling de un turno evaluado.

## Casos de uso

- Agentes de tool calling en dispositivos con recursos limitados: el adaptador de 0,5B permite emitir llamadas a funciones estructuradas en CPU o GPU de gama baja, adecuado para asistentes locales que consultan APIs simples (clima, calendario, cálculos).
- Enrutamiento de consultas a herramientas: gracias a la mejora en relevancia (88,89% frente a 77,78% del base), puede decidir qué función invocar en un catálogo de herramientas acotado antes de derivar a un modelo mayor.
- Filtro de abstención en pipelines: puede usarse como primera etapa para descartar consultas que no requieren herramienta, reduciendo llamadas innecesarias a APIs de pago, aunque con la cautela de su menor detección de irrelevancia (50,71%).
- Prototipado rápido de asistentes conversacionales: el tamaño reducido y el formato PEFT permiten iterar y desplegar en entornos de desarrollo sin infraestructura GPU dedicada.
- Evaluación comparativa de técnicas de destilación: sirve como referencia reproducible para estudiar el efecto de OPD sobre tool calling en modelos pequeños, dado que la model card publica métricas antes/después.
- Generación de texto y resúmenes en inglés en aplicaciones de bajo coste: el modelo base conserva capacidades generales (MMLU 42,10%) suficientes para tareas simples de clasificación o extracción.
- Educación y experimentación: útil para demostrar cómo un profesor de 3B puede transferir habilidades de function calling a un alumno de 0,5B con 0,7 horas de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; primera fila, modelo base; segunda fila, adaptador OPD):

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | 42,04% | 15,80% | 26,80% | 62,61% | 86,57% | 50,28% | 77,78% | 66,93% |
| OPD (este adaptador) | 42,10% | 15,80% | 25,88% | 63,51% | 87,86% | 53,30% | 88,89% | 50,71% |

Notas de evaluación según la model card: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de función; ambas usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de prompt de 640 tokens. BFCL Single-turn FC agrega subsets seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a subsets de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM usan scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B ocupa aproximadamente 1 GB en fp16; el adaptador LoRA añade un peso despreciable. La cuantización a 8 bits o 4 bits reduce aún más el consumo, pero no se especifican valores exactos en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es sobredimensionado para GPUs de datacenter; su uso natural es consumer.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), fusión del adaptador y exportación a GGUF para llama.cpp u Ollama, y vLLM o TGI tras fusionar los pesos. No se documentan configuraciones específicas en la información disponible.
- Latencia y throughput: no disponibles. Solo se publica el tiempo de entrenamiento (0,7 horas para 1.760 actualizaciones OPD).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA OPD) | 0,5B | no disponible (base: 32.768) | Sí, especializado (xLAM ETC 63,51%) | no disponible | Hugging Face (PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 | Sí, genérico (xLAM ETC 62,61%) | Apache 2.0 (modelo base) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 | Sí, genérico | Apache 2.0 | Hugging Face |
| Otros adaptadores xLAM de 0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: el adaptador mejora xLAM ETC (+0,90 pp), xLAM FNA (+1,29 pp), BFCL Single-turn FC (+3,02 pp) y Relevance (+11,11 pp), pero empeora Irrelevance (-16,22 pp) e IFEval (-0,92 pp). No se dispone de datos de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Pérdida notable en detección de irrelevancia: cae del 66,93% al 50,71%, por lo que el modelo puede invocar herramientas cuando no debería.
- Ligera degradación en seguimiento de instrucciones (IFEval 26,80% → 25,88%) y estancamiento en matemáticas (MATH-500 15,80%).
- Capacidades generales limitadas por el tamaño del base: MMLU 42,10% y MATH-500 15,80% son bajos para tareas de razonamiento complejo.
- Solo inglés según la model card; no se garantiza calidad en otros idiomas.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; debe verificarse con el autor y con la licencia del modelo base (Apache 2.0).
- Riesgo de alucinación inherente a un modelo de 0,5B, especialmente en tool calling con esquemas complejos o catálogos de herramientas amplios.
- El límite de prompt usado en evaluación (640 tokens) es muy inferior al contexto del base (32.768); el rendimiento con prompts largos no está validado.
- Es un adaptador, no un modelo completo: requiere cargar Qwen/Qwen2.5-0.5B-Instruct y aplicar los pesos PEFT; no funciona de forma autónoma.
- Sin datos de sesgos, robustez adversarial ni evaluación en producción; el repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.
- Las métricas son agregados propios del estudio, no comparables directamente con cifras oficiales de BFCL o xLAM.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd1760-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento: https://github.com/uygarkurt/post-training-lab
