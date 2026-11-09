# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd6160-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd6160-lora` es un adaptador LoRA (PEFT) construido sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,5 mil millones de parámetros desarrollado por Alibaba Qwen. El adaptador lo publica el usuario uygarkurt y está entrenado específicamente para tool calling estructurado y para la abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento combina dos fases: un ajuste supervisado (SFT) de 2.800 actualizaciones y una continuación mediante destilación on-policy (OPD) de 6.160 actualizaciones, donde el estudiante (este adaptador) aprende de las probabilidades por token de un profesor congelado, `Qwen/Qwen2.5-3B-Instruct`, sobre sus propias respuestas generadas. El dataset empleado es `uygarkurt/xlam-tool-calling-mixed`, una mezcla orientada a function calling.

Su relevancia radica en que explora si un modelo de 0,5B parámetros puede adquirir comportamientos fiables de invocación de herramientas y de rechazo ante herramientas irrelevantes mediante destilación on-policy, algo útil para despliegues en el borde o en entornos con recursos muy limitados. El repositorio contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,5 mil millones (modelo base); adaptador LoRA de rango no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only con atención causal estándar. El adaptador es de tipo LoRA y se carga con la librería `peft` sobre el modelo base original; no requiere cargar por separado el adaptador SFT previo. El entrenamiento se realizó con la herramienta Post-Training Lab del autor.

El proceso consta de dos etapas sobre el dataset `uygarkurt/xlam-tool-calling-mixed`. La primera es un SFT de 2.800 actualizaciones (0,4 horas de entrenamiento). La segunda es una destilación on-policy (OPD) de 6.160 actualizaciones (2,3 horas), en la que el estudiante aprende de las probabilidades por token del profesor congelado `Qwen/Qwen2.5-3B-Instruct` evaluadas sobre las respuestas que el propio estudiante genera. El tiempo total de bucle de entrenamiento reportado es de 2,7 horas, excluyendo carga de modelo, preparación de datos y evaluación externa. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: generación de invocaciones de funciones en formato estructurado, entrenado explícitamente para ello.
- Abstención ante herramientas irrelevantes: el adaptador está entrenado para rechazar la invocación cuando las herramientas ofrecidas no son pertinentes (subconjunto de relevancia de BFCL).
- Razonamiento básico y matemáticas elementales, con rendimiento limitado por el tamaño del modelo base (MATH-500 en torno al 18%).
- Seguimiento de instrucciones a nivel básico (IFEval prompt-level strict en torno al 30%).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, modo thinking ni agentes multi-paso.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: el adaptador puede decidir qué función invocar en un catálogo pequeño y rechazar la llamada cuando ninguna herramienta es adecuada, gracias a su entrenamiento específico de relevancia e irrelevancia.
- Despliegue en el borde o en dispositivos con recursos muy limitados: con 0,5B parámetros y un adaptador LoRA, cabe en GPUs de consumo e incluso en CPU con cuantización, lo que permite ejecutar function calling local sin conexión.
- Prototipado rápido de pipelines de agentes: sirve como componente de bajo coste para validar flujos de tool calling antes de escalar a modelos mayores.
- Filtrado y clasificación de intenciones en backend: el modelo puede etiquetar consultas como "requiere herramienta" o "no requiere herramienta" en un paso previo a un LLM mayor, reduciendo coste.
- Evaluación comparativa de técnicas de destilación on-policy: útil para investigadores que quieran reproducir o comparar SFT frente a SFT+OPD en tareas de function calling con modelos pequeños.
- Generación de texto conversacional básica en inglés para tareas de baja exigencia, como respuestas cortas o resúmenes simples, siempre con validación posterior.

## Benchmarks y rendimiento

Resultados reportados por el autor (porcentajes). La primera fila es el adaptador SFT inicial; la segunda es este adaptador SFT+OPD.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Adaptador SFT inicial | SFT 2.800 | 39,80% | 18,40% | 29,57% | 75,88% | 95,76% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + OPD (este adaptador) | OPD 6.160 | 39,93% | 18,00% | 29,76% | 66,81% | 86,84% | 57,72% | 100,00% | 10,34% | 2,7 |

Notas del autor: xLAM ETC es exactitud exacta de tool call; xLAM FNA es exactitud de nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 omitidos por el límite de prompt de 640 tokens. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de function calling de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 requiere aproximadamente 1 GB de pesos; con el adaptador LoRA el incremento es pequeño. En cuantización de 8 bits o 4 bits el consumo baja por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. También es viable en CPU.
- Cabe en GPUs de consumo: sí, en prácticamente todas las GPU de consumo actuales e incluso en iGPU y CPU.
- Opciones de despliegue: transformers + peft (carga del adaptador sobre el modelo base), vLLM (con soporte de adaptadores LoRA), TGI y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT+OPD sobre Qwen2.5-0.5B-Instruct) | 0,5B + LoRA | no disponible | Tool calling y abstención | no disponible | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | hasta 32.768 tokens (según Qwen) | Asistente general | Apache 2.0 (según Qwen) | Hugging Face |
| Adaptador SFT inicial del mismo autor | 0,5B + LoRA | no disponible | Tool calling (solo SFT) | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | hasta 32.768 tokens (según Qwen) | Asistente general | Apache 2.0 (según Qwen) | Hugging Face |

Los datos de contexto y licencia de los modelos Qwen provienen de la información pública de Qwen y no se confirman en la model card de este adaptador. No se dispone de comparativas de rendimiento con otros adaptadores de tool calling de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El tamaño de 0,5B limita severamente el razonamiento: MMLU en torno al 40% y MATH-500 en torno al 18% indican capacidad baja para tareas complejas.
- La destilación on-policy mejora la relevancia (100%) pero degrada la irrelevancia (del 58,83% al 10,34%) y la exactitud de tool call xLAM ETC (del 75,88% al 66,81%): el adaptador tiende a invocar herramientas incluso cuando no debería.
- Riesgo de alucinación en nombres de función y argumentos, especialmente fuera del dominio del dataset de entrenamiento.
- Soporte únicamente en inglés según la model card.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base Qwen2.5-0.5B-Instruct y contactar con el autor.
- El repositorio contiene solo el adaptador LoRA; es necesario cargar el modelo base original.
- Evaluaciones realizadas con scripts propios del autor y agregados específicos del estudio, no directamente comparables con cifras oficiales de BFCL o xLAM.
- 743 ejemplos del test fueron omitidos por el límite de prompt de 640 tokens, lo que puede sesgar los resultados hacia consultas cortas.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd6160-lora
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
