# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd5280-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd5280-lora` es un adaptador LoRA entrenado sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,5 mil millones de parámetros desarrollado por Alibaba Qwen. El adaptador lo publica el usuario uygarkurt y su objetivo es especializar el modelo base en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. Se distribuye como pesos PEFT (LoRA) en formato safetensors y requiere cargarse sobre el modelo base original.

El entrenamiento combina dos fases: primero un ajuste supervisado (SFT) de 5.600 actualizaciones sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, y después una destilación on-policy (OPD) de 5.280 actualizaciones adicionales en la que el estudiante aprende de las probabilidades de token de un profesor congelado, `Qwen/Qwen2.5-3B-Instruct`. Esta segunda fase busca alinear la distribución de generación del estudiante con la del profesor en respuestas que el propio estudiante produce, un enfoque habitual para mejorar la robustez en tareas estructuradas sin aumentar el tamaño del modelo.

El resultado es un adaptador muy ligero (repo de 0,0 GB, entrenamiento total de 2,8 horas) pensado para experimentación con function calling en entornos con recursos limitados. Es relevante para quienes quieren evaluar técnicas de post-entrenamiento (SFT + OPD) sobre modelos pequeños y para prototipos de agentes con herramientas, aunque sus puntuaciones absolutas en razonamiento general y matemáticas son modestas, coherentes con un modelo de 0,5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre el modelo base |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; el autor no la especifica en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parámetros. El adaptador en sí es un LoRA de bajo rango gestionado con la librería PEFT, por lo que no modifica la arquitectura del modelo base sino que añade matrices de bajo rango en las capas que el autor haya configurado (la model card no detalla rangos ni módulos objetivo). El pipeline declarado es `text-generation` y la relación con el modelo base es `adapter`.

El entrenamiento se realizó con la herramienta Post-Training Lab del propio autor en dos etapas sobre el dataset `uygarkurt/xlam-tool-calling-mixed`. La primera etapa son 5.600 actualizaciones de SFT (0,9 horas de bucle de entrenamiento). La segunda continúa ese adaptador con 5.280 actualizaciones de destilación on-policy (1,9 horas), donde el estudiante aprende de las probabilidades de token del profesor congelado Qwen2.5-3B-Instruct sobre sus propias respuestas generadas. El tiempo total de bucle de entrenamiento es de 2,8 horas, excluyendo carga de modelos, preparación de datos y evaluación externa. No se detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: el adaptador se entrena específicamente para producir llamadas a funciones en formato estructurado (exact tool-call accuracy del 68,93% en el split de test del dataset mixto).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las ofrecidas no encajan con la consulta.
- Precisión en nombres de función: 87,51% de function-name accuracy en el split de test.
- Razonamiento básico y matemáticas elementales (MMLU 39,34%, MATH-500 18,80%), limitados por el tamaño del modelo base.
- Seguimiento de instrucciones a nivel de prompt (IFEval 32,53% en precisión estricta).
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso más allá del tool calling de un turno.

## Casos de uso

- Prototipado de asistentes con function calling: el adaptador puede integrarse en un pipeline de agente que reciba un catálogo de herramientas y genere la llamada estructurada correspondiente, con la ventaja de que su entrenamiento incluye ejemplos de abstención cuando la herramienta no aplica.
- Enrutamiento de consultas a APIs: dado un conjunto de endpoints descritos como funciones, el modelo selecciona el más adecuado y extrae los argumentos, útil en capas de orquestación ligeras donde el coste por inferencia es crítico.
- Investigación en post-entrenamiento: sirve como caso de estudio reproducible de SFT + OPD sobre un modelo de 0,5B, con métricas comparativas entre el adaptador SFT inicial y el resultado tras OPD.
- Evaluación de técnicas de destilación on-policy: el par de adaptadores (SFT y SFT+OPD) permite comparar el efecto de la OPD en la precisión de tool calling y en la calibración de la abstención.
- Despliegue en entornos con recursos muy limitados: al ser un adaptador LoRA sobre un modelo de 0,5B, puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificación de intención y extracción de argumentos.
- Generación de datos sintéticos de tool calling: el modelo puede usarse para producir pares consulta-llamada que alimenten otros pipelines de entrenamiento, siempre con revisión posterior por sus limitaciones de razonamiento.
- Chatbot de dominio acotado en inglés: para conversaciones cortas con un conjunto fijo de acciones (consultar estado, crear ticket, etc.), donde la ventana de contexto y el razonamiento profundo no son requisitos.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Todas las puntuaciones son porcentajes. La primera fila es el adaptador SFT que inicializa la OPD; la segunda es el adaptador final SFT + OPD.

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT inicial | SFT 5.600 | 39,42% | 18,00% | 31,24% | 78,99% | 96,86% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + OPD (este adaptador) | OPD 5.280 | 39,34% | 18,80% | 32,53% | 68,93% | 87,51% | 57,04% | 100,00% | 8,82% | 2,8 |

Notas del autor: xLAM ETC es exact tool-call accuracy y xLAM FNA es function-name accuracy, evaluados sobre el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio. IFEval usa precisión estricta a nivel de prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Al tratarse de un modelo base de 0,5B parámetros, la huella es reducida, pero el autor no publica cifras.
- GPU recomendadas: no disponible. El tamaño del modelo base permite su ejecución en GPUs consumer, pero no se documentan recomendaciones concretas.
- Cabe en GPU consumer: previsiblemente sí por el tamaño del modelo base (0,5B), aunque no se aportan mediciones.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse sobre Qwen2.5-0.5B-Instruct con `transformers` + `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la conversión a GGUF no está descrita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA) | 0,5B | no disponible | Entrenado específicamente (BFCL single-turn 57,04%) | no disponible | Hugging Face (PEFT) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Capacidad genérica del modelo base, sin especialización | no disponible | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | no disponible | Capacidad genérica, mayor razonamiento | no disponible | Hugging Face |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora (SFT previo) | 0,5B | no disponible | Entrenado (BFCL single-turn 53,04%) | no disponible | Hugging Face (PEFT) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, especialización y disponibilidad.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Las puntuaciones en razonamiento general y matemáticas son bajas (MMLU 39,34%, MATH-500 18,80%), propias de un modelo de 0,5B; no es adecuado para tareas que requieran razonamiento profundo.
- La fase de OPD mejora la relevancia (100,00%) y BFCL single-turn (57,04%) pero degrada la exact tool-call accuracy (de 78,99% a 68,93%), la function-name accuracy (de 96,86% a 87,51%) y la detección de irrelevancia (de 49,46% a 8,82%) respecto al adaptador SFT inicial. Es un compromiso importante a considerar según el caso de uso.
- Riesgo de alucinación inherente a los modelos pequeños, especialmente en la generación de argumentos y nombres de función no vistos durante el entrenamiento.
- El límite de 640 tokens de prompt en la evaluación descartó 743 ejemplos del split de test; el comportamiento en prompts más largos no está caracterizado.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial. Debe verificarse antes de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.
- Los benchmarks son agregados específicos del estudio del autor y no son directamente comparables con cifras publicadas de otros modelos.
- Al ser un adaptador LoRA, requiere el modelo base Qwen2.5-0.5B-Instruct y la librería PEFT; no es un modelo autónomo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd5280-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
