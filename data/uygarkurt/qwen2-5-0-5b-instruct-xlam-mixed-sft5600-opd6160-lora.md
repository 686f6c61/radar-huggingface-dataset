# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd6160-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd6160-lora es un adaptador LoRA entrenado por uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El objetivo concreto del entrenamiento es dotar a un modelo pequeno (0,5 mil millones de parametros) de capacidad de tool calling estructurado y, de forma destacable, de abstencion cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El adaptador se construye en dos fases: primero un ajuste supervisado (SFT) de 5.600 actualizaciones y despues una destilacion on-policy (OPD) de 6.160 actualizaciones adicionales, usando como profesor congelado Qwen/Qwen2.5-3B-Instruct. El estudiante aprende de las probabilidades por token que el profesor asigna a sus propias respuestas generadas, lo que constituye la innovacion metodologica principal de este experimento.

Es relevante porque explora si la destilacion on-policy puede mejorar competencias especificas (function calling y calibracion de relevancia) en modelos de menos de 1B de parametros, un regimen donde el coste de inferencia y despliegue es minimo. El repositorio contiene unicamente pesos de adaptador y no incluye la model card completa con detalles de licencia o composicion exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) + adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del proceso de fusion con el base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros. El entrenamiento se realizo con la libreria PEFT y el framework Post-Training Lab del mismo autor, en dos etapas secuenciales sobre el dataset uygarkurt/xlam-tool-calling-mixed. La primera etapa consistio en 5.600 actualizaciones de SFT (0,9 horas de entrenamiento). La segunda continuo ese adaptador con 6.160 actualizaciones de destilacion on-policy (OPD, 2,2 horas), usando Qwen2.5-3B-Instruct como profesor congelado: el estudiante genera sus propias respuestas y aprende a partir de las distribuciones de probabilidad por token que el profesor asigna a esas secuencias.

La innovacion tecnica destacable es el uso de OPD para refinar una habilidad concreta (tool calling estructurado y abstencion ante herramientas irrelevantes) en lugar de un ajuste supervisado adicional. El coste total de entrenamiento reportado es de 3,1 horas, sin contar carga de modelo, preparacion de datos ni evaluacion externa. No se detalla la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling / function calling estructurado, entrenado explicitamente sobre el dataset xlam-tool-calling-mixed.
- Abstencion ante herramientas irrelevantes: el adaptador aprende a no invocar funciones cuando las ofrecidas no encajan con la consulta.
- Razonamiento basico y matematicas limitadas, heredadas del modelo base de 0,5B.
- Soporte multilingue limitado al ingles segun la model card.
- No se documentan capacidades de vision, audio, modo thinking explicito ni soporte de agentes multi-paso mas alla del function calling de un turno.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: el adaptador puede decidir que funcion invocar en un pipeline de automatizacion domestica o de soporte, con un coste de inferencia muy bajo gracias a sus 0,5B parametros.
- Filtrado de consultas irrelevantes: la mejora en la metrica de relevancia (100% en el conjunto seleccionado) lo hace util para descartar llamadas a herramientas cuando la peticion del usuario no corresponde a ninguna disponible.
- Prototipado rapido de agentes en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 0,5B, puede ejecutarse en CPU o GPU de gama baja para validar flujos de tool calling antes de escalar a modelos mayores.
- Educacion e investigacion sobre destilacion on-policy: sirve como caso de estudio reproducible de como OPD afecta a competencias especificas frente a SFT puro.
- Clasificacion de intenciones con salida estructurada: el modelo puede emitir JSON de llamada a funcion en tareas de extraccion de parametros en ingles.
- Despliegue en dispositivos perifericos: su tamano permite integracion en aplicaciones de escritorio o moviles donde un modelo de 3B o superior no cabe.
- Evaluacion comparativa de tecnicas de post-entrenamiento: util como linea base para medir el efecto de OPD en modelos pequenos.

## Benchmarks y rendimiento

Resultados reportados por el autor (porcentajes; la primera fila es el adaptador SFT inicial y la segunda el adaptador SFT + OPD de este repositorio):

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT 5.600 (inicial) | 39,42% | 18,00% | 31,24% | 78,99% | 96,86% | 53,04% | 83,33% | 49,46% |
| SFT + OPD 6.160 (este adaptador) | 39,40% | 17,00% | 31,61% | 68,81% | 87,35% | 56,83% | 100,00% | 9,18% |

Notas del autor: xLAM ETC es exactitud exacta de llamada a herramienta y xLAM FNA es exactitud de nombre de funcion, evaluadas sobre el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. No se han publicado comparaciones con modelos externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB; en cuantizacion de 8 bits, en torno a 0,5 GB; en 4 bits, alrededor de 0,3 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien cabe en GPUs de portatil con 4 GB o menos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), fusion del adaptador con el modelo base para exportar a GGUF y usar llama.cpp u Ollama, y vLLM o TGI tras fusionar los pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA) | 0,5B | no disponible | Entrenado explicitamente (xLAM mixto) | no disponible | Hugging Face (repo de adaptador) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Capacidad generica, no especializada | no disponible en esta ficha | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | no disponible en esta ficha | Capacidad generica | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y proposito.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado solo en ingles; su uso en castellano no esta validado.
- El rendimiento en tareas generales es bajo: MMLU de 39,40% y MATH-500 de 17,00%, coherente con un modelo de 0,5B, lo que limita su uso fuera de tareas acotadas.
- La metrica de irrelevancia empeoro drasticamente con OPD (de 49,46% a 9,18%), lo que sugiere un posible desequilibrio: el adaptador puede estar sobreajustado a responder con llamadas a herramientas y fallar al abstenerse cuando deberia. Conviene validar este comportamiento en produccion.
- La exactitud de llamada a herramienta (xLAM ETC) cayo de 78,99% a 68,81% tras OPD, pese a la mejora en BFCL Single-turn FC; el efecto neto depende del caso de uso.
- Riesgo de alucinacion en la seleccion de funciones y en la generacion de argumentos, propio de modelos pequenos.
- La licencia no esta declarada en la informacion disponible; es imprescindible verificar los terminos del modelo base Qwen2.5 y del adaptador antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-09; no hay validacion comunitaria ni garantias de mantenimiento.
- El limite de 640 tokens de prompt usado en la evaluacion sugiere que el autor no exploro ventanas de contexto largas en este adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd6160-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
