# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd1760-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd1760-lora` es un adaptador LoRA publicado por el desarrollador uygarkurt sobre el modelo base Qwen2.5-0.5B-Instruct de Alibaba. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (formato PEFT) que debe cargarse sobre los pesos originales de Qwen2.5-0.5B-Instruct. Su objetivo concreto es el entrenamiento de *tool calling* estructurado y la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El adaptador se ha entrenado en dos fases: primero 5.600 actualizaciones de *supervised fine-tuning* (SFT) y después 1.760 actualizaciones de *on-policy distillation* (OPD), usando como profesor congelado Qwen2.5-3B-Instruct. El conjunto de datos empleado es `uygarkurt/xlam-tool-calling-mixed`. La relevancia actual del modelo radica en que explora una técnica poco habitual (destilación on-policy sobre un adaptador ya afinado) aplicada a un modelo muy pequeño (0,5B parámetros), con el objetivo de mejorar la precisión en llamadas a funciones y la detección de irrelevancia.

Con solo 0,5B parámetros, el modelo está pensado para escenarios de despliegue con recursos muy limitados, prototipado rápido de agentes y experimentación académica sobre métodos de post-entrenamiento. No obstante, los resultados de evaluación publicados muestran un compromiso claro: la fase OPD mejora la precisión en *tool calling* (BFCL) y la relevancia, pero degrada notablemente la detección de irrelevancia y la exactitud de llamadas exactas en xLAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5); adaptador LoRA sobre el modelo base |
| Parametros totales | 0,5B (modelo base Qwen2.5-0.5B-Instruct); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens según su propia model card, dato no confirmado aquí) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar sobre el modelo base en transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. El entrenamiento se realizó en dos etapas secuenciales con la librería Post-Training Lab del propio autor. La primera etapa consistió en 5.600 actualizaciones de SFT sobre el dataset mixto de tool calling `uygarkurt/xlam-tool-calling-mixed`, con un tiempo de entrenamiento de 0,9 horas. La segunda etapa continuó ese adaptador SFT con 1.760 actualizaciones de OPD (on-policy distillation) durante 0,6 horas, usando como profesor congelado Qwen2.5-3B-Instruct: el estudiante aprende a partir de las probabilidades por token que el profesor asigna a las respuestas generadas por el propio estudiante.

La innovación técnica destacable es el uso de OPD sobre un adaptador ya afinado con SFT, en lugar de partir de cero. El objetivo declarado es doble: entrenar llamadas a herramientas estructuradas y enseñar al modelo a abstenerse cuando las herramientas ofrecidas no son relevantes. No se especifican en la información disponible detalles sobre la composición exacta del dataset, el número total de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como DPO o RLHF. El profesor Qwen2.5-3B-Instruct es aproximadamente seis veces mayor que el estudiante, lo que sitúa la destilación en un régimen de compresión considerable.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- *Tool calling* estructurado: genera llamadas a funciones en formato estructurado, evaluado con los conjuntos xLAM ETC (exact tool-call accuracy), xLAM FNA (function-name accuracy) y BFCL Single-turn FC.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no emitir una llamada cuando las herramientas ofrecidas no encajan con la consulta (evaluada en los subconjuntos Relevance/Irrelevance).
- Razonamiento básico y matemáticas elementales, limitado por el tamaño del modelo base (MMLU 39,60%, MATH-500 17,20%).
- Seguimiento de instrucciones a nivel básico (IFEval 31,42% en precisión estricta a nivel de prompt).
- No se documentan capacidades de visión, audio, *thinking mode* explícito ni soporte multilingüe más allá del inglés.

## Casos de uso

- Prototipado de agentes con tool calling en entornos con recursos mínimos: el adaptador, cargado sobre Qwen2.5-0.5B-Instruct, permite experimentar con pipelines de llamadas a funciones en una GPU de consumo o incluso en CPU, sin necesidad de desplegar modelos de mayor tamaño.
- Investigación sobre post-entrenamiento: sirve como caso de estudio reproducible de la combinación SFT + OPD con profesor congelado, útil para comparar metodologías de destilación en modelos pequeños.
- Filtrado de consultas irrelevantes en asistentes con catálogo de herramientas fijo: la capacidad de abstención entrenada permite descartar consultas que no encajan con las funciones disponibles antes de invocar un modelo mayor, aunque los resultados publicados muestran una detección de irrelevancia baja (7,93%).
- Evaluación comparativa de adaptadores LoRA: al existir un adaptador SFT previo del mismo autor, permite medir el efecto aislado de la fase OPD sobre las mismas métricas.
- Docencia y demostraciones de tool calling: el tamaño reducido facilita ejecutar ejemplos en notebooks y entornos educativos con presupuesto de cómputo limitado.
- Generación de texto conversacional básica en inglés: para tareas de chat simple donde no se requiera alta calidad ni razonamiento complejo, el modelo base de 0,5B ofrece latencia muy baja.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (porcentajes; la primera fila es el adaptador SFT inicial, la segunda el adaptador SFT + OPD actual):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT inicial | SFT 5.600 | 39,42% | 18,00% | 31,24% | 78,99% | 96,86% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + OPD (este adaptador) | OPD 1.760 | 39,60% | 17,20% | 31,42% | 70,66% | 88,18% | 56,99% | 100,00% | 7,93% | 1,5 |

Notas del autor: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance reportan los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 0,5B parámetros, en fp16 se requieren aproximadamente 1 GB de pesos, y en cuantizaciones de 8 o 4 bits, menos de 1 GB, aunque el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería bastar para fp16; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.), aunque este dato no está confirmado en la documentación.
- Opciones de despliegue: transformers con PEFT es el método documentado (librería `peft`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + OPD) | 0,5B base + LoRA | no disponible | Entrenado (BFCL 56,99%) | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens (según model card del base) | No específico | Apache 2.0 (según el modelo base) | Hugging Face |
| Adaptador SFT previo del mismo autor | 0,5B base + LoRA | no disponible | Entrenado (BFCL 53,04%) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada, por lo que la comparativa se limita a las variantes del propio autor y al modelo base.

## Limitaciones y advertencias

- La detección de irrelevancia cae drásticamente con la fase OPD: del 49,46% al 7,93%, lo que implica que el modelo tiende a emitir llamadas a herramientas incluso cuando no son relevantes.
- La exactitud exacta de llamada a herramienta (xLAM ETC) también empeora con OPD: del 78,99% al 70,66%, y la exactitud del nombre de función baja del 96,86% al 88,18%.
- El rendimiento en razonamiento y matemáticas es bajo (MMLU 39,60%, MATH-500 17,20%), coherente con un modelo de 0,5B parámetros; no es adecuado para tareas que requieran razonamiento complejo.
- El seguimiento de instrucciones es limitado (IFEval 31,42%).
- Solo soporta inglés según la model card; no hay evidencia de capacidades multilingües.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en generación libre de texto y en la selección de argumentos de funciones.
- El límite de 640 tokens de prompt en la evaluación descartó 743 ejemplos del split de test, lo que sugiere limitaciones prácticas con prompts largos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-09), lo que indica ausencia de validación por parte de la comunidad.
- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base Qwen2.5-0.5B-Instruct y la librería PEFT.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd1760-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
