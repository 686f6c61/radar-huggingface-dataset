# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd4400-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd4400-lora` es un adaptador LoRA publicado por el desarrollador uygarkurt sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba. Su propósito es especializar un modelo pequeño de 0,5 mil millones de parámetros en la generación de llamadas a herramientas estructuradas (tool calling) y en la abstención controlada cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador se entrena en dos fases: primero un ajuste supervisado (SFT) de 5.600 actualizaciones y después una destilación on-policy (OPD) de 4.400 actualizaciones adicionales.

La innovación principal es el uso de destilación on-policy con un profesor congelado de mayor tamaño (`Qwen/Qwen2.5-3B-Instruct`), del que el estudiante aprende a partir de las probabilidades por token sobre sus propias respuestas generadas. El conjunto de datos empleado es `uygarkurt/xlam-tool-calling-mixed`, orientado a function calling y a la detección de irrelevancia de herramientas. El resultado es un adaptador de bajo coste computacional (2,5 horas de entrenamiento en total) pensado para integrarse en pipelines de agentes donde el tamaño y la latencia importan.

El modelo es relevante para quienes necesitan un componente ligero de enrutamiento de herramientas o de function calling en entornos con recursos limitados. No obstante, los resultados de evaluación muestran un compromiso claro: la OPD mejora la precisión de llamada (BFCL single-turn del 53,04% al 57,00%) y la relevancia (del 83,33% al 100%), pero degrada notablemente la precisión de llamada exacta xLAM (del 78,99% al 69,09%) y la detección de irrelevancia (del 49,46% al 8,20%), lo que indica un sesgo hacia la emisión de llamadas incluso cuando no procede.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado en la ficha del adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA sobre el modelo base) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,5 mil millones de parámetros. El adaptador LoRA se entrena con la librería PEFT y se distribuye como pesos de adaptador, no como modelo completo: es necesario cargarlo sobre el modelo base original. El entrenamiento se realizó con la herramienta Post-Training Lab del mismo autor, sobre el dataset `uygarkurt/xlam-tool-calling-mixed`.

El proceso consta de dos etapas. La primera es un ajuste supervisado (SFT) de 5.600 actualizaciones (0,9 horas) que produce un adaptador intermedio. La segunda es una destilación on-policy (OPD) de 4.400 actualizaciones (1,6 horas) que continúa el adaptador SFT. En la OPD, el estudiante genera sus propias respuestas y aprende de las probabilidades por token que un profesor congelado (`Qwen/Qwen2.5-3B-Instruct`) asigna a esas mismas secuencias, lo que alinea la distribución de entrenamiento con la de inferencia. El objetivo declarado es entrenar tanto el formato estructurado de llamada a herramientas como la abstención cuando las herramientas ofrecidas son irrelevantes. El tiempo total de entrenamiento reportado es de 2,5 horas, excluyendo carga de modelos, preparación de datos y evaluación externa.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Llamada a herramientas estructurada (tool calling / function calling) con formato de función y nombres de función.
- Abstención ante herramientas irrelevantes: el modelo está entrenado explícitamente para no emitir llamadas cuando las herramientas ofrecidas no encajan con la consulta, aunque los resultados de evaluación muestran que esta capacidad se degrada tras la OPD.
- Destilación de comportamiento desde un profesor de 3B hacia un estudiante de 0,5B mediante OPD.
- No se documentan capacidades de visión, audio, modo thinking ni razonamiento multi-paso avanzado más allá de lo que ofrece el modelo base.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: el modelo puede decidir qué función invocar en un catálogo reducido de herramientas, con un coste de inferencia muy bajo (0,5B parámetros), adecuado para desplegar en CPU o GPU de gama baja dentro de un orquestador de agentes.
- Preprocesamiento de consultas en pipelines RAG: usar el adaptador como primer filtro para decidir si una consulta requiere una llamada a API o puede responderse con recuperación documental, aprovechando la etiqueta de relevancia/irrelevancia aprendida.
- Prototipado rápido de function calling: al ser un adaptador LoRA sobre un modelo de 0,5B, permite iterar sobre esquemas de herramientas y prompts con tiempos de entrenamiento de horas, no días.
- Evaluación comparativa de técnicas de post-entrenamiento: sirve como caso de estudio reproducible de SFT + OPD frente a SFT solo, con métricas xLAM y BFCL publicadas, útil para investigadores que comparan métodos de destilación.
- Asistente de consola o CLI con herramientas: integrar el modelo en una herramienta de línea de comandos que traduzca lenguaje natural a invocaciones de funciones del sistema, donde el tamaño reducido permite ejecución local.
- Filtro de seguridad de llamadas: usar la señal de abstención (aunque degradada) como capa adicional para bloquear llamadas a herramientas cuando la consulta no es pertinente, combinándola con reglas deterministas.
- Docencia y experimentación con PEFT: ejemplo práctico de cómo cargar un adaptador LoRA sobre Qwen2.5 y evaluar su comportamiento en tool calling con scripts personalizados.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Todas las puntuaciones son porcentajes. xLAM ETC es precisión exacta de llamada a herramienta; xLAM FNA es precisión del nombre de función; BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. La evaluación xLAM usa el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Adaptador SFT inicial | SFT 5.600 | 39,42% | 18,00% | 31,24% | 78,99% | 96,86% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + OPD (este adaptador) | OPD 4.400 | 39,47% | 18,00% | 31,24% | 69,09% | 87,55% | 57,00% | 100,00% | 8,20% | 2,5 |

No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precisión FP16 requiere aproximadamente 1 GB de pesos; en cuantización de 4 bits, menos de 0,5 GB. El adaptador LoRA añade una sobrecarga mínima. No se dispone de cifras oficiales del autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para cargas de baja concurrencia.
- Cabe en GPU consumer: sí, con amplio margen, incluso en GPUs integradas o en CPU.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), vLLM con soporte LoRA, llama.cpp/Ollama si se fusiona el adaptador en el modelo base y se convierte a GGUF, TGI con adaptadores. No se documentan opciones oficiales en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B | no disponible | Especializado (xLAM/BFCL) | no disponible | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens (según documentación de Qwen) | Genérico, sin especialización | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 tokens (según documentación de Qwen) | Genérico | Apache 2.0 (según Qwen) | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto y licencia del modelo base; los datos de licencia y contexto del adaptador no están confirmados en su model card.

## Limitaciones y advertencias

- La OPD degrada la precisión exacta de llamada xLAM del 78,99% al 69,09% y la precisión de nombre de función del 96,86% al 87,55% respecto al adaptador SFT inicial.
- La detección de irrelevancia cae del 49,46% al 8,20% tras la OPD: el modelo tiende a emitir llamadas incluso cuando las herramientas no son pertinentes, lo que puede provocar invocaciones erróneas en producción.
- La relevancia reportada del 100% debe interpretarse con cautela dado el bajo rendimiento en irrelevancia; el agregado puede ocultar un sesgo hacia la emisión de llamadas.
- Modelo entrenado y evaluado únicamente en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación inherente a un modelo de 0,5B; MMLU del 39,47% y MATH-500 del 18,00% indican capacidad de razonamiento limitada.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor y la licencia del modelo base.
- El adaptador requiere cargar el modelo base Qwen2.5-0.5B-Instruct; no es un modelo autónomo.
- Los benchmarks xLAM usan scripts personalizados del autor y un límite de prompt de 640 tokens, con 743 ejemplos omitidos, lo que limita la comparabilidad con evaluaciones estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd4400-lora
- Adaptador SFT intermedio: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
