# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd4400-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd4400-lora` es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. Su objetivo es especializar un modelo pequeño (0,5 mil millones de parámetros) en tool calling estructurado y, de forma destacable, en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador se entrena en dos fases: primero un ajuste supervisado (SFT) de 2.800 actualizaciones y después una destilación on-policy (OPD) de 4.400 actualizaciones, usando como profesor congelado a `Qwen/Qwen2.5-3B-Instruct`.

La relevancia de este modelo radica en su enfoque metodológico: combina SFT con OPD para que un modelo de 0,5B aprenda de las distribuciones de probabilidad de un profesor de 3B sobre sus propias respuestas generadas. El adaptador resultante prioriza la precisión en la selección de herramientas (BFCL single-turn FC sube del 51,76% al 57,04%) y la relevancia (100% en el subconjunto de relevancia), aunque a costa de sacrificar la capacidad de abstención (la tasa de irrelevancia cae del 58,83% al 10,96%). Es un artefacto de investigación útil para estudiar el equilibrio entre selección de herramientas y rechazo de llamadas irrelevantes en modelos compactos.

El repositorio contiene únicamente los pesos del adaptador LoRA (0,0 GB de tamaño reportado, sin pesos completos), por lo que requiere cargar el modelo base Qwen2.5-0.5B-Instruct para su uso. La licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre el modelo base |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-0.5B-Instruct, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. El entrenamiento se realizó con la herramienta Post-Training Lab del autor y el dataset `uygarkurt/xlam-tool-calling-mixed`. La primera fase consistió en 2.800 actualizaciones de SFT (0,4 horas de entrenamiento), y la segunda en 4.400 actualizaciones de destilación on-policy (OPD) que continuaron el adaptador SFT (1,6 horas), sumando 2,0 horas de entrenamiento en total (excluyendo carga de modelo, preparación de datos y evaluación externa).

La innovación principal es el uso de OPD con un profesor congelado, `Qwen/Qwen2.5-3B-Instruct`. En esta fase, el estudiante aprende de las probabilidades por token que el profesor asigna a las respuestas generadas por el propio estudiante, lo que alinea la distribución del modelo pequeño con la del grande en el dominio específico de tool calling. El dataset mezcla ejemplos de llamadas a herramientas y de abstención ante herramientas irrelevantes, lo que explica el comportamiento dual del adaptador.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: genera llamadas a funciones en formato estructurado, evaluado con las métricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: el adaptador fue entrenado explícitamente para rechazar llamadas cuando las herramientas ofrecidas no son pertinentes, aunque los resultados muestran que esta capacidad se degrada tras la fase OPD.
- Razonamiento básico y matemáticas: evaluado con MMLU (39,80%) y MATH-500 (18,60%), con rendimiento modesto propio de un modelo de 0,5B.
- Seguimiento de instrucciones: evaluado con IFEval en precisión estricta a nivel de prompt (28,84%).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- **Enrutamiento de herramientas en asistentes ligeros**: el adaptador puede desplegarse en un asistente de 0,5B que reciba un catálogo de funciones y decida cuál invocar, con la ventaja de un coste computacional muy bajo para entornos con recursos limitados.
- **Investigación sobre destilación on-policy**: sirve como caso de estudio reproducible para analizar cómo la OPD con un profesor de 3B afecta a las métricas de tool calling en un estudiante de 0,5B, comparando los checkpoints SFT y SFT+OPD publicados.
- **Prototipado de pipelines de function calling**: al ser un adaptador LoRA sobre un modelo pequeño, permite iterar rápidamente en el diseño de esquemas de herramientas y prompts sin incurrir en costes de inferencia elevados.
- **Filtrado de llamadas irrelevantes en agentes**: aunque la tasa de irrelevancia medida es baja (10,96%), el adaptador puede usarse como primera etapa de un sistema de dos niveles donde un modelo mayor valide las decisiones del pequeño.
- **Evaluación de benchmarks BFCL y xLAM en modelos compactos**: útil para establecer líneas base de referencia en la comparativa de adaptadores especializados en tool calling sobre modelos de menos de 1B.
- **Despliegue en entornos con GPU de consumo**: al tratarse de un modelo de 0,5B con adaptador LoRA, es viable en GPUs de gama baja para experimentación y demos, aunque no se especifican requisitos exactos.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el adaptador SFT inicial con el adaptador SFT+OPD final. Todas las puntuaciones son porcentajes.

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT inicial | SFT 2.800 | 39,80% | 18,40% | 29,57% | 75,88% | 95,76% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + OPD (este adaptador) | OPD 4.400 | 39,80% | 18,60% | 28,84% | 66,81% | 86,92% | 57,04% | 100,00% | 10,96% | 2,0 |

Notas de la model card: xLAM ETC es la precisión exacta de llamada a herramienta; xLAM FNA es la precisión del nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC resume subconjuntos seleccionados de BFCL-v3 de function calling de un solo turno; Relevance e Irrelevance reportan los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un modelo base de 0,5B, la huella es reducida, pero no se publican cifras.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU de consumo: probable por el tamaño del modelo base (0,5B), pero no confirmada en la documentación.
- Opciones de despliegue: PEFT + Transformers (según la librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA SFT+OPD) | 0,5B (base) + LoRA | No disponible | Sí, especializado con abstención | No disponible | Hugging Face (adaptador) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | No disponible en esta ficha | Parcial (capacidad general del base) | No disponible en esta ficha | Hugging Face |
| Adaptador SFT inicial del mismo autor | 0,5B (base) + LoRA | No disponible | Sí (SFT) | No disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | No disponible en esta ficha | Capacidad general del base | No disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- **Degradación de la abstención**: la tasa de irrelevancia cae del 58,83% (SFT) al 10,96% (SFT+OPD), lo que indica que el adaptador final tiende a invocar herramientas incluso cuando no son pertinentes. Es un riesgo directo en producción.
- **Caída en precisión de tool calling**: xLAM ETC baja del 75,88% al 66,81% y xLAM FNA del 95,76% al 86,92% tras la fase OPD.
- **Rendimiento general modesto**: MMLU del 39,80% y MATH-500 del 18,60%, propios de un modelo de 0,5B; no es adecuado para tareas de razonamiento complejo.
- **Solo inglés**: la model card declara únicamente el idioma inglés; no hay soporte multilingüe documentado.
- **Licencia no especificada**: no se indica licencia del adaptador, lo que impide evaluar restricciones de uso comercial.
- **Repositorio sin pesos completos**: contiene solo el adaptador LoRA; requiere el modelo base Qwen2.5-0.5B-Instruct para funcionar.
- **Riesgo de alucinación**: no se documentan evaluaciones específicas de alucinación; el tamaño reducido del modelo base aumenta el riesgo en generación abierta.
- **Límite de prompt en evaluación**: 743 ejemplos del split de test fueron omitidos por superar los 640 tokens, lo que puede sesgar las métricas hacia consultas cortas.
- **Sin datos de sesgos**: no se publican análisis de sesgos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd4400-lora
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
