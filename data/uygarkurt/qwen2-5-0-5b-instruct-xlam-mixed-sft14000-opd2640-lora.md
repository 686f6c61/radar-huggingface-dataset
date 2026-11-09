# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd2640-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd2640-lora es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador está especializado en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. Se entrenó con la librería Post-Training Lab del mismo autor sobre el dataset uygarkurt/xlam-tool-calling-mixed, en dos fases: 14.000 actualizaciones de supervisión fina (SFT) seguidas de 2.640 actualizaciones de destilación on-policy (OPD) usando Qwen2.5-3B-Instruct como profesor congelado.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con 0,49 mil millones de parámetros y una ventana de contexto de 32.768 tokens (según las especificaciones del modelo base). El adaptador no modifica la arquitectura, solo los pesos mediante LoRA, por lo que debe cargarse sobre el modelo base original.

Su relevancia radica en que demuestra un flujo de post-entrenamiento completo (SFT + OPD) para una tarea concreta de function calling en un modelo muy pequeño, con métricas específicas de exactitud de llamada a herramienta y de relevancia/irrelevancia. El repositorio no contiene pesos completos ni datos de licencia explícitos, y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre el modelo base |
| Parametros totales | 0,49 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base; el adaptador no la modifica) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; las cuantizaciones dependen del modelo base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención de causalidad estándar y 0,49 mil millones de parámetros. El adaptador LoRA añade matrices de bajo rango sobre las capas del modelo base; no altera la arquitectura ni la ventana de contexto. El repositorio contiene únicamente los pesos del adaptador, no el modelo fusionado.

El entrenamiento se realizó en dos etapas sobre el dataset uygarkurt/xlam-tool-calling-mixed. Primero, 14.000 actualizaciones de SFT (2,2 horas de tiempo de bucle de entrenamiento). Después, 2.640 actualizaciones de destilación on-policy (OPD, 0,9 horas), en las que el estudiante aprende de las probabilidades por token que genera un profesor congelado, Qwen2.5-3B-Instruct, sobre sus propias respuestas. El tiempo total de bucle de entrenamiento fue de 3,1 horas, excluyendo carga de modelo, preparación de datos y evaluación externa. El objetivo declarado es el tool calling estructurado y la abstención cuando las herramientas ofrecidas son irrelevantes. Las evaluaciones se hicieron con scripts propios del autor (Post-Training Lab).

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: genera llamadas a funciones en formato estructurado, evaluado con exactitud de llamada exacta (xLAM ETC) y exactitud de nombre de función (xLAM FNA).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las herramientas ofrecidas no son pertinentes.
- Razonamiento básico y matemáticas heredados del modelo base, con rendimiento limitado por el tamaño (MMLU 38,53%, MATH-500 18,00%).
- Seguimiento de instrucciones a nivel de prompt (IFEval 28,28% en precisión estricta).
- Soporte de function calling de un solo turno según los subconjuntos seleccionados de BFCL-v3 (59,89% agregado).
- Capacidades multilingües: solo se declara inglés.
- No se declaran capacidades de visión, audio, thinking mode ni agentes multi-paso.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: el adaptador puede decidir qué función invocar en un catálogo reducido de herramientas, con una exactitud de nombre de función del 88,26% en el split de test del dataset mixto, adecuado para prototipos de bajo coste.
- Abstención en pipelines de automatización: entrenado para no invocar herramientas irrelevantes, puede usarse como filtro previo que descarte consultas fuera de dominio antes de llamar a un servicio externo.
- Demostración de post-entrenamiento con OPD: sirve como ejemplo reproducible de flujo SFT + destilación on-policy sobre un modelo de 0,5B, útil para investigadores que quieran replicar la receta con Post-Training Lab.
- Evaluación de function calling en entornos con recursos limitados: al ser un adaptador sobre 0,5B, permite ejecutar pruebas de tool calling en CPU o GPU de gama baja sin infraestructura dedicada.
- Generación de llamadas estructuradas en formularios y APIs internas: puede producir invocaciones con nombres de función y argumentos para integraciones sencillas donde el catálogo de herramientas sea fijo y en inglés.
- Base para experimentos de destilación: el adaptador y su profesor (Qwen2.5-3B-Instruct) permiten estudiar la transferencia de probabilidades por token a un modelo pequeño en tareas de llamada a herramientas.

## Benchmarks y rendimiento

Datos publicados en la model card. Todas las puntuaciones son porcentajes. La primera fila es el adaptador SFT que inicializó la fase OPD; la segunda es el adaptador final SFT + OPD.

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT inicial | SFT 14.000 | 38,04% | 18,40% | 29,02% | 82,95% | 97,76% | 56,19% | 83,33% | 66,40% | 2,2 |
| SFT + OPD (este adaptador) | OPD 2.640 | 38,53% | 18,00% | 28,28% | 72,35% | 88,26% | 59,89% | 100,00% | 8,64% | 3,1 |

Notas de la model card: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 descartados por el límite de prompt de 640 tokens. BFCL Single-turn FC resume subconjuntos seleccionados de BFCL-v3 de function calling de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. Son agregados propios del estudio. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA sobre un modelo de 0,49B requiere muy poca memoria; en FP16 el modelo base ocupa aproximadamente 1 GB, y en cuantizaciones de 4 bits puede bajar de 0,5 GB. No se publican cifras oficiales de VRAM en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para el modelo base en FP16; también es viable en CPU para pruebas.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, dado el tamaño reducido.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp, Ollama o vLLM requieren fusionar previamente el adaptador con el modelo base o convertirlo a GGUF. No se documentan recetas de despliegue en la model card.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento reportado (3,1 horas de bucle) no equivale a latencia de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada para una comparación cuantitativa fiable. Se ofrece una comparación cualitativa con modelos de la misma categoría (modelos pequeños con soporte de tool calling).

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA) | 0,49B | 32.768 (base) | Entrenado explícitamente (SFT + OPD) | no disponible | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Soporte nativo limitado | Apache 2.0 (modelo base) | Hugging Face |
| Qwen2.5-3B-Instruct | 3,08B | 32.768 | Soporte nativo | Apache 2.0 | Hugging Face (usado como profesor) |
| xLAM-1B / xLAM-7B (familia de function calling) | 1B / 7B | no disponible en esta ficha | Especializados en function calling | no disponible en esta ficha | Hugging Face |

Los datos de parámetros y contexto de Qwen2.5-0.5B-Instruct y Qwen2.5-3B-Instruct corresponden a las especificaciones publicadas del modelo base; el resto de celdas marcadas como no disponibles no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- El adaptador solo declara soporte para inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La licencia no está disponible en la información proporcionada, lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen2.5-0.5B-Instruct es Apache 2.0, pero el adaptador no declara licencia propia.
- El tamaño de 0,49B limita el razonamiento: MMLU 38,53% y MATH-500 18,00% indican un rendimiento bajo en conocimiento general y matemáticas.
- La fase OPD mejoró la relevancia (100,00%) pero degradó notablemente la irrelevancia (de 66,40% a 8,64%) y la exactitud exacta de llamada (de 82,95% a 72,35%), según los datos de la model card; conviene elegir el checkpoint SFT o el SFT + OPD según el caso de uso.
- Riesgo de alucinación en argumentos de funciones y en nombres de herramientas fuera del catálogo de entrenamiento.
- Las evaluaciones xLAM descartan 743 ejemplos por el límite de prompt de 640 tokens, por lo que las métricas no cubren prompts largos.
- Los resultados de BFCL son agregados propios del estudio sobre subconjuntos seleccionados, no la métrica oficial completa de BFCL-v3.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- El adaptador requiere cargarse sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct; no es un modelo autónomo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd2640-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
