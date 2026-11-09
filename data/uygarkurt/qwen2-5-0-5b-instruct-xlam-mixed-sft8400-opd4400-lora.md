# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd4400-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd4400-lora es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador se entrena en dos fases consecutivas: primero un ajuste fino supervisado (SFT) de 8.400 actualizaciones y despues una destilacion on-policy (OPD) de 4.400 actualizaciones, usando como profesor congelado Qwen/Qwen2.5-3B-Instruct. El objetivo concreto es ensenar al modelo pequeno a emitir llamadas a herramientas estructuradas y a abstenerse cuando las herramientas ofrecidas no son relevantes.

El modelo resuelve un problema muy especifico en el ambito del tool calling: el equilibrio entre invocar funciones correctamente y no alucinar llamadas cuando no procede. La evaluacion del autor muestra que la fase OPD mejora la deteccion de relevancia (Relevance pasa de 55,56% a 100,00%) y la precision de function calling single-turn de BFCL (de 46,24% a 58,19%), aunque a costa de degradar gravemente la deteccion de irrelevancia (de 88,59% a 12,75%) y de reducir ligeramente la precision de tool-call exacta en xLAM (de 74,51% a 69,05%).

Se trata de un adaptador de investigacion, no de un modelo listo para produccion: el repositorio tiene 0 descargas, 0 likes, no declara licencia y solo soporta ingles segun la model card. Su interes es metodologico: demuestra como la destilacion on-policy sobre un modelo de 0,5B puede mejorar ciertas metricas de tool calling, pero tambien evidencia el trade-off entre sensibilidad y especificidad en la deteccion de relevancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, aunque no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parametros. El entrenamiento se realizo con la herramienta Post-Training Lab del mismo autor y consta de dos etapas. La primera es un SFT de 8.400 actualizaciones (1,3 horas) sobre el dataset uygarkurt/xlam-tool-calling-mixed, que entrena llamadas a herramientas estructuradas y abstencion. La segunda etapa parte del adaptador SFT y aplica destilacion on-policy (OPD) durante 4.400 actualizaciones (1,6 horas): el estudiante genera sus propias respuestas y aprende de las probabilidades por token del profesor congelado Qwen2.5-3B-Instruct. El tiempo total de entrenamiento reportado es de 2,9 horas, excluyendo carga de modelo, preparacion de datos y evaluacion externa.

La innovacion tecnica principal es el uso de OPD sobre un modelo muy pequeno para tool calling, combinando datos mixtos de llamadas a funciones con ejemplos de abstencion. El adaptador resultante no requiere cargar por separado el adaptador SFT previo: se aplica directamente sobre el modelo base Qwen2.5-0.5B-Instruct.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emision de llamadas a funciones en formato estructurado, entrenado explicitamente para ello.
- Abstencion ante herramientas irrelevantes: capacidad entrenada para no invocar funciones cuando las herramientas ofrecidas no son pertinentes (aunque la evaluacion muestra un deterioro notable en la deteccion de irrelevancia tras la fase OPD).
- Razonamiento basico y matematicas limitadas, heredadas del modelo base de 0,5B (MATH-500 del 17,00% en la evaluacion del autor).
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio, thinking mode ni agentes multi-paso mas alla del tool calling de un solo turno.

## Casos de uso

- Clasificacion y enrutado de intenciones con herramientas: el adaptador puede decidir si una consulta requiere invocar una funcion concreta y emitir la llamada en formato estructurado, util para asistentes de bajo coste en ingles.
- Prototipado de agentes de tool calling en entornos con recursos muy limitados: al partir de un modelo de 0,5B, se puede desplegar en CPU o GPUs de gama baja para validar pipelines antes de escalar a modelos mayores.
- Investigacion sobre destilacion on-policy: sirve como referencia reproducible para estudiar como OPD afecta a la sensibilidad y especificidad en la deteccion de relevancia de herramientas.
- Filtrado de consultas en pipelines de atencion al cliente: el modelo puede determinar si una peticion encaja con las funciones disponibles y abstenerse cuando no procede (con las cautelas indicadas en limitaciones).
- Generacion de ejemplos sinteticos de llamadas a funciones para aumentar datasets de entrenamiento de modelos mayores.
- Evaluacion comparativa de adaptadores LoRA para tool calling: util como baseline pequeno en experimentos de BFCL y xLAM.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (porcentajes; la primera fila es el adaptador SFT inicial y la segunda el adaptador SFT + OPD actual):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT inicial | SFT 8.400 | 37,91% | 18,00% | 29,21% | 74,51% | 88,18% | 46,24% | 55,56% | 88,59% | 1,3 |
| SFT + OPD (este adaptador) | OPD 4.400 | 38,52% | 17,00% | 29,02% | 69,05% | 87,75% | 58,19% | 100,00% | 12,75% | 2,9 |

Notas del autor: xLAM ETC es la precision exacta de tool-call; xLAM FNA es la precision del nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de function calling single-turn; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precision estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1 GB de pesos; en cuantizacion de 4 bits, alrededor de 0,3-0,5 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para inferencia de baja latencia.
- Cabe holgadamente en GPUs consumer e incluso en entornos integrados con suficiente RAM.
- Opciones de despliegue: transformers con PEFT, vLLM (soporte de adaptadores LoRA), llama.cpp/Ollama tras fusionar el adaptador con el base, TGI. El repositorio usa library_name peft.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA) | 0,5B | no disponible en la card | Si, entrenado especificamente | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | hasta 32.768 tokens (segun modelo base) | Parcial, no especializado | Apache 2.0 (segun modelo base, no confirmado en esta card) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | hasta 32.768 tokens (segun modelo base) | Si, uso general | Apache 2.0 (segun modelo base, no confirmado en esta card) | Hugging Face |

La comparativa con alternativas especializadas en tool calling de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no declara licencia; el uso comercial queda sin garantias legales explicitas y depende de la licencia del modelo base Qwen2.5-0.5B-Instruct.
- Solo soporta ingles segun la model card.
- La fase OPD degrada severamente la deteccion de irrelevancia (de 88,59% a 12,75%): el modelo tiende a invocar herramientas aunque no proceda, lo que es un riesgo critico en produccion.
- La precision exacta de tool-call en xLAM baja tras OPD (de 74,51% a 69,05%) y MATH-500 tambien empeora (de 18,00% a 17,00%).
- Modelo de 0,5B: alta propension a alucinaciones y razonamiento limitado en tareas complejas.
- Evaluaciones realizadas con scripts propios del autor y subconjuntos seleccionados; no son directamente comparables con resultados oficiales de BFCL o xLAM.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente.
- El limite de 640 tokens de prompt en la evaluacion xLAM dejo fuera 743 ejemplos, lo que puede sesgar los resultados.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd4400-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
