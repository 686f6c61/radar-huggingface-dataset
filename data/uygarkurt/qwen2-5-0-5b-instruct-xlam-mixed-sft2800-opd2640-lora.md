# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd2640-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd2640-lora` es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen2.5-0.5B-Instruct. Su propósito es especializar un modelo pequeño (0,5 mil millones de parámetros) en *tool calling* estructurado y, de forma destacable, en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador se entrena en dos fases: un ajuste supervisado (SFT) de 2.800 actualizaciones seguido de una destilación en política (*on-policy distillation*, OPD) de 2.640 actualizaciones usando Qwen2.5-3B-Instruct como profesor congelado.

El modelo resuelve un problema concreto en el despliegue de agentes: los modelos pequeños tienden a invocar herramientas incluso cuando no procede, generando llamadas erróneas o alucinadas. La fase OPD intenta corregir este comportamiento, aunque los datos publicados muestran un compromiso claro entre precisión de llamada y capacidad de abstención. Es relevante para quienes necesitan un adaptador ligero de function calling desplegable en hardware modesto, aunque los resultados de evaluación invitan a la cautela.

La información disponible es limitada: el repositorio tiene 0 descargas, no se declara licencia y la model card solo documenta el proceso de entrenamiento y una tabla de evaluación propia. No hay datos sobre composición del dataset más allá de su nombre, ni sobre hiperparámetros de entrenamiento del LoRA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); rango del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero las evaluaciones usan un límite de prompt de 640 tokens |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base y del runtime) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. El entrenamiento se realizó con la herramienta Post-Training Lab del propio autor sobre el dataset `uygarkurt/xlam-tool-calling-mixed`. La primera fase consistió en 2.800 actualizaciones de SFT (0,4 horas de entrenamiento). La segunda fase continuó ese adaptador con 2.640 actualizaciones de *on-policy distillation* (1,0 hora), en la que el estudiante aprende de las probabilidades por token que el profesor congelado Qwen2.5-3B-Instruct asigna a las respuestas generadas por el propio estudiante. El tiempo total de bucle de entrenamiento fue de 1,4 horas, excluyendo carga de modelo, preparación de datos y evaluación externa.

La innovación técnica principal es la combinación de SFT con OPD para enseñar abstención: el objetivo declarado es entrenar *tool calling* estructurado y rechazo cuando las herramientas ofrecidas son irrelevantes. No se documentan detalles sobre el rango del LoRA, la tasa de aprendizaje, la composición exacta del dataset ni el uso de RLHF o DPO. La evaluación xLAM se realizó con scripts propios del autor sobre el split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- *Tool calling* estructurado: generación de llamadas a funciones en formato estructurado, evaluado con las métricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las ofrecidas no aplican, medida con las métricas Relevance e Irrelevance de BFCL.
- Razonamiento básico y matemáticas heredados del modelo base, con rendimiento limitado por el tamaño (MMLU 39,89 %, MATH-500 17,00 %).
- Seguimiento de instrucciones a nivel de prompt (IFEval 28,65 % en precisión estricta).
- No se documentan capacidades de visión, audio, modo *thinking* ni soporte multilingüe más allá del inglés.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: el adaptador puede decidir si una consulta requiere invocar una función de un catálogo y emitir la llamada estructurada, integrándose en un orquestador que gestione el resto del flujo. Adecuado por su tamaño reducido y su entrenamiento específico en function calling.
- Filtrado de consultas fuera de dominio: gracias a la métrica de Relevance (100 % en el checkpoint final), puede usarse como primera capa para descartar peticiones que no encajan con las herramientas disponibles antes de escalar a un modelo mayor.
- Prototipado rápido de asistentes con function calling en hardware de consumo: al ser un adaptador sobre un modelo de 0,5B, cabe en GPUs modestas y permite iterar sobre el diseño de herramientas sin coste elevado.
- Clasificación de intención con salida estructurada: la precisión de nombre de función (xLAM FNA 87,08 %) permite usarlo para mapear consultas a nombres de funciones concretas en pipelines de automatización.
- Evaluación comparativa de técnicas de post-entrenamiento: sirve como caso de estudio reproducible de SFT + OPD sobre un modelo pequeño, útil para investigadores que comparen métodos de destilación en política.
- Generación de texto asistida en inglés con contexto corto: para tareas de resumen o respuesta breve donde el límite de 640 tokens de prompt de la evaluación sea suficiente.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; la primera fila es el adaptador SFT inicial y la segunda el adaptador final SFT + OPD):

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT 2.800 (inicial) | 39,80 % | 18,40 % | 29,57 % | 75,88 % | 95,76 % | 51,76 % | 83,33 % | 58,83 % |
| SFT + OPD 2.640 (final) | 39,89 % | 17,00 % | 28,65 % | 67,64 % | 87,08 % | 56,83 % | 100,00 % | 9,45 % |

Observaciones: la fase OPD mejora BFCL Single-turn FC (+5,07 puntos) y lleva Relevance al 100 %, pero degrada notablemente xLAM ETC (−8,24), xLAM FNA (−8,68) e Irrelevance (−49,38 puntos). MMLU se mantiene prácticamente igual y MATH-500 e IFEval empeoran ligeramente. No se publican comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; en cuantización de 8 bits, alrededor de 0,5 GB; en 4 bits, alrededor de 0,3 GB. La VRAM total dependerá del runtime y de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para el modelo base en fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura. El adaptador LoRA añade una sobrecarga mínima.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con 4 GB o más de VRAM, e incluso en CPU mediante llama.cpp u Ollama si se convierte el adaptador.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base; vLLM y TGI para servir con el adaptador fusionado o cargado dinámicamente; llama.cpp y Ollama requieren fusionar y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B + LoRA | No disponible (evaluado con prompts de 640 tokens) | Tool calling + abstención vía SFT + OPD | No disponible | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | Hasta 32.768 tokens (según Qwen) | Instrucción general | Apache 2.0 (según Qwen) | Hugging Face, ampliamente disponible |
| Qwen2.5-3B-Instruct (profesor) | 3B | Hasta 32.768 tokens (según Qwen) | Instrucción general | Apache 2.0 (según Qwen) | Hugging Face, ampliamente disponible |

No se dispone de datos de benchmarks comparativos entre este adaptador y alternativas de tool calling de tamaño similar en la información proporcionada. La comparación con el modelo base y el profesor es estructural, no de rendimiento.

## Limitaciones y advertencias

- El checkpoint final sacrifica precisión de llamada (xLAM ETC 67,64 % frente a 75,88 % del SFT inicial) y, sobre todo, capacidad de distinguir irrelevancia (9,45 % frente a 58,83 %), lo que sugiere un desequilibrio hacia la abstención o hacia respuestas de relevancia positiva.
- El límite de 640 tokens de prompt en la evaluación implica que 743 de los 3.289 ejemplos del test fueron descartados; el comportamiento con prompts más largos no está documentado.
- Solo se declara soporte de inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen2.5 sí tiene licencia Apache 2.0, pero el adaptador no especifica la suya.
- Riesgo de alucinación inherente a un modelo de 0,5B: MMLU 39,89 % y MATH-500 17,00 % indican capacidades de razonamiento y matemáticas muy limitadas.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad; los benchmarks son agregados propios del autor con scripts personalizados, no resultados de harness estándar.
- El dataset de entrenamiento (`uygarkurt/xlam-tool-calling-mixed`) no está descrito en detalle en la model card, por lo que se desconoce su composición, procedencia y posibles sesgos.
- El adaptador requiere cargarse sobre el modelo base original; no es un modelo autónomo y no debe usarse sin Qwen2.5-0.5B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd2640-lora
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
