# YurinhoMatsumoto/qwen-essay-scorer-lora

## Resumen

El modelo `YurinhoMatsumoto/qwen-essay-scorer-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, diseñado para la tarea de puntuación automática de ensayos (automated essay scoring, AES). El adaptador fue entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace, tal como indican los tags del repositorio, y se distribuye en formato PEFT con pesos en safetensors.

La relevancia de este modelo reside en su aplicación directa a la evaluación de ensayos, una tarea con demanda creciente en entornos educativos y plataformas de evaluación en línea. Sin embargo, la documentación proporcionada es extremadamente incompleta: la model card no incluye información sobre datos de entrenamiento, hiperparámetros, resultados de evaluación ni licencia, lo que limita severamente su reproducibilidad y su uso en producción. El adaptador hereda las capacidades del modelo base Qwen2.5-7B-Instruct, que cuenta con una ventana de contexto de 32 768 tokens, aunque no se especifica si el adaptador modifica este valor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA es una fraccion de los 7 610 millones del modelo base) |
| Parametros activos | no disponible (el adaptador LoRA no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base; no se indica modificacion) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base puede cuantizarse con herramientas externas) |
| Idiomas soportados | no disponibles (el modelo base Qwen2.5 soporta principalmente ingles y chino; no se especifican idiomas del adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer decoder-only del modelo Qwen2.5-7B-Instruct, que emplea atención causal con mecanismos de QKV y una ventana de contexto de 32 768 tokens. La técnica de adaptación es LoRA, que añade matrices de bajo rango a las capas de atención y MLP, permitiendo ajustar el modelo con un numero reducido de parámetros entrenables.

El entrenamiento se realizó mediante aprendizaje supervisado (SFT), utilizando la librería TRL (Transformers Reinforcement Learning) y PEFT 0.19.1. No se dispone de información sobre el dataset de ensayos utilizado, el número de tokens de entrenamiento, la composición del corpus, ni el uso de técnicas de RLHF o DPO. Tampoco se especifican los hiperparámetros del entrenamiento (tasa de aprendizaje, épocas, rango de LoRA, etc.). El tag `arxiv:1910.09700` en el repositorio referencia el paper de Lacoste et al. sobre el impacto ambiental de la computación, pero no aporta datos sobre el entrenamiento.

## Capacidades

- Puntuación automática de ensayos: el adaptador está diseñado para asignar una puntuación numérica a textos en prosa, aunque no se especifican las rúbricas ni el rango de puntuación.
- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, que incluyen generación de texto, razonamiento lógico, matemáticas y comprensión de instrucciones.
- Soporte de tool calling y agentes: el modelo base Qwen2.5-7B-Instruct soporta function calling, pero no se confirma que el adaptador preserve esta funcionalidad.
- Multilingüismo: el modelo base es fuerte en chino e inglés; el adaptador no declara idiomas adicionales.
- Conversación multi-turno: el tag `conversational` sugiere que el adaptador puede usarse en diálogos, aunque su propósito principal parece ser la puntuación de ensayos.

## Casos de uso

- Evaluación educativa automatizada: el adaptador puede integrarse en plataformas de aprendizaje en línea para puntuar ensayos de estudiantes de forma rápida y consistente, reduciendo la carga de corrección manual de los docentes. Su base Qwen2.5-7B-Instruct permite procesar textos largos de hasta 32k tokens, adecuado para ensayos extensos.
- Sistemas de retroalimentación de escritura: combinado con un generador de comentarios (como el proyecto AI Scoring Platform de GitHub), el modelo puede asignar una puntuación y, en un pipeline posterior, generar sugerencias de mejora basadas en los criterios evaluados.
- Filtrado de calidad en plataformas de contenido: en foros o plataformas de publicación, el adaptador puede puntuar la calidad de los textos generados por usuarios para priorizar moderación o visibilidad.
- Investigación en NLP educativa: sirve como base para estudios sobre la correlación entre puntuaciones automáticas y humanas, o para comparar la eficacia de distintos adaptadores LoRA en tareas de AES.
- Asistente de escritura con evaluación integrada: un entorno de redacción que muestre una puntuación preliminar mientras el usuario escribe, ayudando a mejorar el texto en tiempo real.
- Evaluación de ensayos generados por IA: el modelo podría utilizarse para puntuar y comparar la calidad de ensayos generados por otros LLMs, como se aborda en el paper de arxiv 2410.17439, aunque no hay evidencia de que el adaptador haya sido entrenado para distinguir texto humano de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (como correlación con puntuaciones humanas, QWK, RMSE, etc.) ni comparaciones con otros sistemas de puntuación automática de ensayos.

## Requisitos de hardware

- VRAM estimada: para el modelo base Qwen2.5-7B-Instruct, la inferencia en FP16 requiere aproximadamente 15 GB de VRAM. El adaptador LoRA añade una sobrecarga mínima, por lo que la VRAM necesaria se mantiene en torno a ese valor.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) son suficientes para inferencia con el modelo base en FP16. Para cuantizaciones de 4 bits, una GPU con 8 GB de VRAM (como RTX 3070) podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, el modelo base puede ejecutarse en GPUs consumer de 16 GB o más con cuantización.
- Opciones de despliegue: el adaptador PEFT puede cargarse con la librería Transformers de Hugging Face. Para despliegue en producción, es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión previa).
- Latencia y throughput: no se dispone de datos medidos. En una A100, un modelo 7B en FP16 suele generar entre 30 y 60 tokens por segundo, pero no se ha validado para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de puntuación automática de ensayos. No se han publicado métricas de rendimiento ni se ha especificado el dataset de entrenamiento. Los modelos comparables en el espacio AES incluyen sistemas basados en BERT (como `bert-base-uncased` con cabezas de regresión) o modelos de lenguaje como `GPT-3.5` con prompts de puntuación, pero sin datos del adaptador no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Documentación incompleta: la model card no proporciona información sobre el dataset de entrenamiento, los criterios de puntuación, la licencia ni los resultados de evaluación. Esto impide verificar la calidad del adaptador y su cumplimiento legal para uso comercial.
- Riesgo de alucinación y sesgos: al ser un adaptador sobre Qwen2.5-7B-Instruct, hereda los sesgos del modelo base, que pueden incluir estereotipos culturales y de género. La puntuación de ensayos puede verse afectada por estos sesgos, generando evaluaciones injustas para ciertos grupos.
- Falta de validación en entornos reales: no hay evidencia de que el modelo haya sido probado con ensayos reales de estudiantes o con rúbricas específicas. Su uso en producción podría producir puntuaciones inconsistentes.
- Limitaciones de idioma: el modelo base es fuerte en chino e inglés, pero no se especifica si el adaptador funciona bien en otros idiomas. La puntuación de ensayos en español podría no ser fiable.
- Licencia no disponible: no se indica la licencia del adaptador. El modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0, pero el adaptador podría tener restricciones adicionales no declaradas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YurinhoMatsumoto/qwen-essay-scorer-lora
- Proyecto AI Scoring Platform (GitHub): https://github.com/wwrwbs/AI_AWE/tree/main
- Paper sobre refinamiento de rúbricas de puntuación: https://aclanthology.org/2026.conll-main.47/ y https://arxiv.org/html/2510.09030
- Paper sobre ensayos generados por IA y puntuación automática: https://arxiv.org/html/2410.17439v4
- Paper de Lacoste et al. sobre impacto ambiental (referenciado en el repo): https://arxiv.org/abs/1910.09700
