# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd3520-lora

## Resumen
Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario uygarkurt. El objetivo concreto es especializar un modelo pequeno (0,5 mil millones de parametros) en tool calling estructurado y, de forma destacada, en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. El entrenamiento se realizo en dos fases: 8.400 actualizaciones de supervised fine-tuning (SFT) seguidas de 3.520 actualizaciones de on-policy distillation (OPD), usando como profesor congelado Qwen2.5-3B-Instruct.

La relevancia de este adaptador reside en su enfoque metodologico: combina SFT con destilacion on-policy para transferir capacidad de un modelo 6 veces mayor a uno de 0,5B, y publica una evaluacion que muestra el efecto de la OPD sobre el comportamiento de abtencion. Los resultados son mixtos: la precision de tool calling mejora (BFCL single-turn pasa de 46,24% a 58,40%) y la relevancia alcanza el 100%, pero la deteccion de irrelevancia cae drasticamente del 88,59% al 12,12%, lo que indica un sesgo hacia la llamada de herramientas incluso cuando no procede.

El adaptador es un artefacto de investigacion experimental, no un modelo listo para produccion. No declara licencia, solo soporta ingles, el repositorio pesa 0,0 GB (los pesos del adaptador son ligeros) y no tiene descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; la evaluacion usa un limite de prompt de 640 tokens) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parametros. El entrenamiento se realizo con la herramienta Post-Training Lab del propio autor sobre el dataset uygarkurt/xlam-tool-calling-mixed. La primera fase consistio en 8.400 actualizaciones de SFT (1,3 horas de tiempo de bucle de entrenamiento). La segunda fase continuo ese adaptador con 3.520 actualizaciones de on-policy distillation (1,2 horas), en la que el estudiante aprende de las probabilidades por token que un profesor congelado (Qwen2.5-3B-Instruct) asigna a sus propias respuestas generadas. El tiempo total de entrenamiento reportado es de 2,5 horas, excluyendo carga de modelo, preparacion de datos y evaluacion externa.

La innovacion tecnica principal es el uso de OPD sobre un adaptador SFT ya entrenado, con el objetivo declarado de mejorar el tool calling estructurado y la abtencion ante herramientas irrelevantes. Los resultados muestran que la OPD altera el equilibrio entre llamar herramientas y abstenerse: mejora la precision de llamada pero degrada severamente la deteccion de irrelevancia.

## Capacidades
- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: genera llamadas a funciones en formato estructurado, evaluado con los conjuntos xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Function calling de un solo turno segun los subconjuntos seleccionados de BFCL-v3.
- Abtencion ante herramientas irrelevantes: capacidad entrenada explicitamente, aunque la evaluacion muestra que la OPD la degrada (12,12% en el checkpoint final frente a 88,59% del adaptador SFT).
- Razonamiento basico y matematicas: evaluado con MMLU (38,55%) y MATH-500 (16,80%), con rendimiento bajo propio de un modelo de 0,5B.
- Seguimiento de instrucciones: evaluado con IFEval en precision estricta a nivel de prompt (28,47%).
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio, thinking mode ni soporte de agentes multi-paso.

## Casos de uso
- Prototipado de pipelines de tool calling en ingles: el adaptador permite experimentar con function calling estructurado sobre un modelo de 0,5B, util para validar esquemas de herramientas y formatos de salida antes de escalar a modelos mayores.
- Investigacion sobre destilacion on-policy: sirve como caso de estudio reproducible de como la OPD sobre un adaptador SFT modifica el comportamiento de llamada y abtencion, con metricas antes y despues publicadas.
- Enrutamiento de consultas con deteccion de herramientas: en escenarios donde la consulta siempre requiere una herramienta, la alta relevancia (100%) y la mejora en BFCL (58,40%) lo hacen adecuado para clasificacion de llamadas en un dominio cerrado.
- Evaluacion comparativa de tecnicas de post-entrenamiento: el par de adaptadores (SFT y SFT+OPD) permite comparar metodologias con el mismo dataset y base.
- Despliegue en entornos con recursos muy limitados: al ser un adaptador sobre un modelo de 0,5B, puede ejecutarse en CPU o GPUs de gama baja para pruebas de integracion.
- Generacion de datos sinteticos de tool calling: el adaptador puede usarse para producir ejemplos de llamadas estructuradas que luego se filtren o corrijan manualmente.
- No se recomienda para atencion al cliente en produccion ni para agentes autonomos, dada la baja tasa de abtencion y el rendimiento limitado en razonamiento.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Adaptador SFT inicial | SFT 8.400 | 37,91% | 18,00% | 29,21% | 74,51% | 88,18% | 46,24% | 55,56% | 88,59% | 1,3 |
| SFT + OPD (este adaptador) | OPD 3.520 | 38,55% | 16,80% | 28,47% | 69,32% | 87,75% | 58,40% | 100,00% | 12,12% | 2,5 |

Notas de la evaluacion segun la model card: xLAM ETC es precision exacta de llamada a herramienta; xLAM FNA es precision de nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precision estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1 GB de VRAM; en cuantizacion de 8 bits, alrededor de 0,5 GB; en 4 bits, menos de 0,5 GB. Los pesos del adaptador LoRA anaden una cantidad marginal.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo base con holgura. Para lotes grandes, A100 o H100 permiten mayor throughput, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para pruebas.
- Opciones de despliegue: transformers con peft (carga del adaptador sobre el base), vLLM con soporte LoRA, llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF, y TGI con adaptadores LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA SFT+OPD) | 0,5B (base) + LoRA | no disponible | Si, especializado; BFCL 58,40%, abtencion 12,12% | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Generico, sin especializacion | Apache 2.0 (segun el modelo base de Qwen) | Ampliamente disponible |
| Qwen2.5-3B-Instruct (profesor) | 3B | no disponible | Generico | Apache 2.0 (segun el modelo base de Qwen) | Ampliamente disponible |
| Adaptador SFT previo del mismo autor | 0,5B (base) + LoRA | no disponible | Si; BFCL 46,24%, abtencion 88,59% | no disponible | Hugging Face |

La comparativa con alternativas externas no esta disponible en la informacion proporcionada; las filas anteriores se limitan a modelos citados en la model card.

## Limitaciones y advertencias
- La deteccion de irrelevancia cae del 88,59% al 12,12% tras la OPD: el modelo tiende a llamar herramientas incluso cuando no son pertinentes, lo que es peligroso en produccion.
- La precision exacta de tool calling (xLAM ETC) empeora con la OPD, de 74,51% a 69,32%, y MATH-500 tambien baja de 18,00% a 16,80%.
- Rendimiento bajo en razonamiento e instrucciones (MMLU 38,55%, IFEval 28,47%), propio de un modelo de 0,5B.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La licencia no esta declarada, lo que impide evaluar el uso comercial. El modelo base Qwen2.5-0.5B-Instruct es Apache 2.0, pero el adaptador no especifica terminos.
- Riesgo de alucinacion en generacion libre y en la seleccion de argumentos de herramientas.
- La evaluacion xLAM omite 743 ejemplos por el limite de 640 tokens de prompt, lo que puede sesgar las metricas hacia consultas cortas.
- Es un adaptador experimental con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion independiente.
- No se documentan sesgos especificos, pero al entrenarse solo en ingles y sobre un dataset de tool calling, el comportamiento fuera de ese dominio es incierto.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd3520-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Herramienta de entrenamiento Post-Training Lab: https://github.com/uygarkurt/post-training-lab
