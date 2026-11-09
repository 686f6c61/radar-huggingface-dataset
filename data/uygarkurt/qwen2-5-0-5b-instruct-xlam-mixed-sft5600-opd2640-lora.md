# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd2640-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd2640-lora` es un adaptador LoRA publicado por el desarrollador uygarkurt sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. Se ha entrenado específicamente para tool calling estructurado y para la abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador continúa un entrenamiento previo de supervised fine-tuning (SFT) con una fase adicional de on-policy distillation (OPD) usando como profesor congelado a `Qwen/Qwen2.5-3B-Instruct`.

El modelo resuelve un problema concreto en el ámbito de los agentes: no solo generar llamadas a funciones con formato correcto, sino también decidir cuándo no invocar ninguna herramienta. Esta segunda capacidad es crítica en producción, ya que evita llamadas espurias a APIs cuando la consulta es puramente conversacional o no encaja con el catálogo de herramientas disponible. El tamaño reducido del modelo base (0,5B parámetros) lo hace atractivo para despliegues con latencia baja y recursos limitados.

La relevancia actual del adaptador reside en su enfoque metodológico: demuestra que un modelo de 0,5B puede mejorar su precisión en function calling mediante destilación on-policy de un profesor de 3B, con un coste de entrenamiento de 1,8 horas en total. No obstante, los propios resultados publicados por el autor muestran un compromiso claro entre precisión de llamada y capacidad de abstención, con una caída drástica en la detección de irrelevancia tras la fase OPD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parámetros totales | 0,5B (modelo base); el adaptador LoRA no especifica su número de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, aunque no se confirma en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5. El entrenamiento se realizó en dos fases con el dataset `uygarkurt/xlam-tool-calling-mixed`: primero 5.600 actualizaciones de supervised fine-tuning (SFT) durante 0,9 horas, y después 2.640 actualizaciones de on-policy distillation (OPD) durante otras 0,9 horas. En la fase OPD, el estudiante (el adaptador sobre el modelo de 0,5B) genera sus propias respuestas y aprende de las probabilidades por token que produce un profesor congelado, `Qwen/Qwen2.5-3B-Instruct`, sobre esas mismas respuestas.

La innovación técnica principal es la combinación de SFT con OPD para transferir capacidad de function calling desde un modelo de 3B a uno de 0,5B. El dataset mezcla ejemplos de tool calling con casos donde las herramientas ofrecidas son irrelevantes, lo que permite entrenar explícitamente la abstención. El entrenamiento se realizó con la herramienta Post-Training Lab del mismo autor, y los tiempos indicados excluyen carga de modelo, preparación de datos y evaluación externa.

## Capacidades

- Generación de texto conversacional en inglés sobre la base de Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: genera llamadas a funciones en formato estructurado, evaluado con exactitud de llamada (xLAM ETC) y exactitud de nombre de función (xLAM FNA).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando el catálogo ofrecido no encaja con la consulta.
- Razonamiento básico y matemáticas elementales, limitado por el tamaño del modelo base (MMLU 39,45%, MATH-500 17,20%).
- Seguimiento de instrucciones a nivel de prompt (IFEval 30,87% en precisión estricta).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso más allá del function calling single-turn evaluado.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: el modelo puede decidir si una consulta requiere invocar una API o resolverse conversacionalmente, usando la cabeza de abstención entrenada. Es adecuado por su bajo coste computacional y su capacidad de clasificación relevancia/irrelevancia.
- Integración en pipelines de agentes con catálogos de herramientas acotados: para escenarios donde el conjunto de funciones es fijo y pequeño, el adaptador genera llamadas estructuradas con una exactitud de nombre de función del 87,75% en el split de test del dataset mixto.
- Prototipado rápido de sistemas de function calling: al ser un adaptador sobre un modelo de 0,5B, permite iterar en hardware de consumo y validar diseños de prompts y esquemas de herramientas antes de escalar a modelos mayores.
- Filtrado previo en arquitecturas de enrutamiento multi-modelo: puede actuar como primera etapa que decide si derivar la consulta a un modelo mayor con tool calling o responder directamente, reduciendo coste en consultas que no requieren herramientas.
- Investigación sobre destilación on-policy: sirve como referencia reproducible para estudiar la transferencia de capacidades de function calling desde modelos de 3B a 0,5B, con métricas publicadas de SFT frente a SFT+OPD.
- Evaluación de compromisos precisión-abstención: útil en entornos de investigación para analizar cómo la fase OPD mejora la precisión de llamada (53,04% a 57,21% en BFCL single-turn) a costa de degradar la detección de irrelevancia (49,46% a 7,58%).

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (porcentajes). La primera fila es el adaptador SFT usado para inicializar la fase OPD; la segunda es el adaptador actual SFT+OPD.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT (5.600 updates) | 39,42% | 18,00% | 31,24% | 78,99% | 96,86% | 53,04% | 83,33% | 49,46% |
| SFT + OPD (2.640 updates) | 39,45% | 17,20% | 30,87% | 69,84% | 87,75% | 57,21% | 100,00% | 7,58% |

Notas del autor: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud de nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de function calling single-turn. Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts personalizados de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,5B en precisión completa se estiman del orden de 1-2 GB, y menos de 1 GB en cuantización de 4 bits, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para el modelo base en FP16; no se especifican GPU concretas en la model card.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 6GB, RTX 3060, RTX 4090, etc.), dado el tamaño de 0,5B, aunque no se confirma oficialmente.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse sobre el modelo base con la librería `peft` y `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la fusión del adaptador en el modelo base permitiría usar esos motores, pero no está confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B | no disponible | Entrenado (xLAM mixed) | no disponible | Hugging Face (PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | No específico | no disponible en esta ficha | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | no disponible en esta ficha | No específico | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa más allá de los resultados del propio adaptador.

## Limitaciones y advertencias

- La detección de irrelevancia cae del 49,46% al 7,58% tras la fase OPD, lo que indica que el modelo tiende a invocar herramientas incluso cuando no son relevantes. Es el compromiso más importante para uso en producción.
- La exactitud exacta de llamada (xLAM ETC) baja del 78,99% al 69,84% y la exactitud de nombre de función (xLAM FNA) del 96,86% al 87,75% con OPD, pese a la mejora en BFCL single-turn.
- El modelo solo soporta inglés según la model card; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a un modelo de 0,5B, con MMLU del 39,45% y MATH-500 del 17,20%, lo que limita su uso en tareas de razonamiento complejo.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial. Es un bloqueante para producción hasta aclararlo.
- El límite de 640 tokens de prompt en la evaluación xLAM provocó que se omitieran 743 ejemplos de 3.289, lo que sugiere limitaciones en prompts largos o con muchas herramientas.
- Al ser un adaptador PEFT, requiere cargar el modelo base por separado; no es un modelo autónomo listo para desplegar sin pasos adicionales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd2640-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
