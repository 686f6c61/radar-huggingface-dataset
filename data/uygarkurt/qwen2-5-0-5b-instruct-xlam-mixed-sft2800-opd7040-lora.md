# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd7040-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd7040-lora` es un adaptador LoRA entrenado sobre `Qwen/Qwen2.5-0.5B-Instruct` para especializarlo en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. Lo desarrolla el usuario uygarkurt dentro del proyecto Post-Training Lab, y se distribuye como pesos PEFT independientes que deben cargarse sobre el modelo base original de Qwen.

El entrenamiento combina dos fases: un ajuste supervisado (SFT) de 2.800 actualizaciones sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, seguido de una destilación on-policy (OPD) de 7.040 actualizaciones en la que un profesor congelado, `Qwen/Qwen2.5-3B-Instruct`, guía al estudiante mediante sus probabilidades por token sobre respuestas generadas por el propio estudiante. El resultado es un adaptador muy ligero (repo de 0,0 GB) pensado para escenarios de function calling con modelos pequeños.

Su relevancia es acotada pero concreta: demuestra que un modelo de 0,5B parámetros puede mejorar de forma medible en precisión de selección de función (BFCL single-turn pasa de 51,76% a 58,19%) a costa de degradar otras métricas, lo que lo convierte en un caso de estudio útil sobre los compromisos entre especialización en tool calling y capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre modelo base |
| Parametros totales | No disponible (adaptador LoRA; el base Qwen2.5-0.5B-Instruct tiene 0,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5 soporta hasta 32K, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento se realizo en dos etapas con el framework Post-Training Lab. La primera, SFT, ejecuto 2.800 actualizaciones en 0,4 horas sobre el dataset mixto de tool calling `uygarkurt/xlam-tool-calling-mixed`. La segunda, OPD (on-policy distillation), continuo el adaptador SFT durante 7.040 actualizaciones en 2,6 horas, usando como profesor congelado a `Qwen/Qwen2.5-3B-Instruct`: el estudiante genera sus propias respuestas y aprende a partir de las distribuciones de probabilidad del profesor sobre esos tokens, en lugar de imitar directamente respuestas fijas.

La innovacion tecnica principal es precisamente esa combinacion SFT + OPD sobre un modelo de 0,5B para una tarea estructurada, con un objetivo explicito de ensenar abstencion ante herramientas irrelevantes. Los tiempos reportados corresponden solo al bucle de entrenamiento, excluyendo carga de modelo, preparacion de datos y evaluacion externa. No se especifican hiperparametros del LoRA (rango, alpha, dropout) ni la composicion detallada del dataset en la informacion disponible.

## Capacidades

- Generacion de texto conversacional sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: genera llamadas a funciones en formato estructurado a partir de herramientas ofrecidas.
- Abstencion ante herramientas irrelevantes: capacidad entrenada explicitamente para no invocar funciones cuando no aplican.
- Precisión en el nombre de la funcion: metrica xLAM FNA del 86,88% en el conjunto de test del dataset mixto.
- Capacidades generales heredadas del base: razonamiento basico, matematicas elementales e instrucciones (con rendimiento limitado por el tamano de 0,5B).
- Soporte multilingue limitado al ingles segun la model card.
- No se documenta soporte de vision, audio, thinking mode ni agentes multi-paso mas alla del tool calling de un turno.

## Casos de uso

- Enrutamiento de funciones en asistentes ligeros: el adaptador decide que herramienta invocar en funcion de la consulta del usuario, con una precision de seleccion de funcion del 58,19% en BFCL single-turn, adecuada para prototipos y sistemas de bajo coste.
- Filtrado de llamadas irrelevantes: la capacidad de abstencion permite descartar invocaciones cuando ninguna herramienta del catalogo encaja, reduciendo falsos positivos en pipelines de automatizacion.
- Despliegue en dispositivos con recursos muy limitados: al ser un adaptador sobre un modelo de 0,5B, puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificacion de intenciones y seleccion de herramientas.
- Prototipado rapido de agentes tool-augmented: sirve como banco de pruebas para validar esquemas de funciones y prompts antes de escalar a modelos mayores.
- Investigacion en post-entrenamiento: util como referencia reproducible de SFT + OPD sobre modelos pequenos, con metricas comparables entre checkpoints.
- Educacion y demos de function calling: ejemplo didactico de como un modelo pequeno puede especializarse en una tarea estructurada con un coste de entrenamiento de 3 horas en total.

## Benchmarks y rendimiento

Resultados reportados en la model card (porcentajes; primera fila es el adaptador SFT inicial, segunda el adaptador SFT + OPD actual):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT inicial | SFT 2.800 | 39,80% | 18,40% | 29,57% | 75,88% | 95,76% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + OPD (este adaptador) | OPD 7.040 | 39,89% | 17,20% | 29,02% | 67,05% | 86,88% | 58,19% | 100,00% | 10,51% | 3,0 |

Notas de la model card: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre Qwen2.5-0.5B-Instruct, el modelo completo en precision completa ronda 1-2 GB, y en cuantizacion de 4 bits puede situarse por debajo de 1 GB (estimacion orientativa, no confirmada en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU para inferencia de baja latencia.
- Cabe en GPU consumer: si, dado el tamano del modelo base.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama requeririan fusionar el adaptador con el base y convertirlo a GGUF (no documentado por el autor); vLLM y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B (base) | No disponible | Especializado (BFCL 58,19%) | No disponible | Hugging Face (PEFT) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32K (segun Qwen) | Generico, sin especializacion | Apache 2.0 (segun Qwen) | Hugging Face |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora (SFT previo) | 0,5B (base) | No disponible | Especializado (BFCL 51,76%) | No disponible | Hugging Face (PEFT) |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | 32K (segun Qwen) | Generico | Apache 2.0 (segun Qwen) | Hugging Face |

La comparativa con modelos de mayor tamano no es directa: el adaptador esta pensado para escenarios de recursos muy limitados donde un modelo de 3B o superior no es viable. Los datos de licencia de los modelos Qwen provienen de la informacion publica de Qwen y no de la model card de este adaptador.

## Limitaciones y advertencias

- La licencia del adaptador no esta declarada en la informacion disponible; verificar antes de cualquier uso comercial.
- El adaptador solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Degradacion en OPD: xLAM ETC baja de 75,88% a 67,05%, xLAM FNA de 95,76% a 86,88% e Irrelevance de 58,83% a 10,51% respecto al checkpoint SFT, lo que indica un compromiso claro entre mejor seleccion de funcion y mayor tendencia a invocar herramientas cuando no deberia.
- MATH-500 e IFEval tambien empeoran ligeramente (18,40% a 17,20% y 29,57% a 29,02%).
- El modelo base de 0,5B tiene capacidad limitada de razonamiento y alta propension a errores en tareas complejas; MMLU en torno al 40% lo situa lejos de modelos de mayor tamano.
- Riesgo de alucinacion en la generacion de argumentos de funciones y en conversaciones fuera del dominio de entrenamiento.
- Las evaluaciones xLAM usan un split propio del dataset mixto con 743 ejemplos omitidos por limite de 640 tokens de prompt, por lo que las metricas no son directamente comparables con otros benchmarks publicos.
- No hay datos de sesgos ni de evaluaciones de seguridad en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd7040-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
