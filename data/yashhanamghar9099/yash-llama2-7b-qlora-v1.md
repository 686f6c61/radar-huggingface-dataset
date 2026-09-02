# yashhanamghar9099/Yash-Llama2-7B-QLoRA-v1

## Resumen

Yash-Llama2-7B-QLoRA-v1 es un ajuste fino experimental del modelo base NousResearch/Llama-2-7b-chat-hf, desarrollado por Yash Hanamghar. El proyecto demuestra el flujo completo de fine-tuning con QLoRA (cuantización de 4 bits), LoRA, PEFT, SFT y fusión de adaptadores, utilizando las librerías transformers, TRL y bitsandbytes. El resultado es un modelo de generación de texto e instrucciones con aproximadamente 6,7 mil millones de parámetros, pensado principalmente como demostración educativa y de investigación, no como un modelo listo para producción.

La relevancia de este modelo radica en su valor pedagógico: muestra cómo aplicar técnicas de ajuste eficiente de parámetros sobre Llama 2 con recursos limitados. Al estar basado en Llama 2, hereda la arquitectura transformer decoder-only con una ventana de contexto de 4096 tokens. No se han publicado benchmarks estándar; solo una evaluación manual subjetiva con 10 prompts que reporta una mejora global del 8% respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (aprox. 6,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredado del modelo base) |
| Tipos de cuantizacion | Entrenado con cuantizacion de 4 bits (QLoRA); pesos finales en FP16 (safetensors) |
| Idiomas soportados | no disponible (heredado de Llama 2, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 2, un transformer autoregresivo decoder-only con normalización RMSNorm, activación SwiGLU y atención multi-cabeza estándar (el modelo de 7B no usa grouped-query attention, que está reservado para la variante de 70B). El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) con QLoRA, una técnica que combina LoRA (adaptadores de bajo rango) con cuantización de 4 bits del modelo base para reducir el uso de memoria durante el entrenamiento. Se emplearon las librerías PEFT, TRL y bitsandbytes, y posteriormente se fusionaron los adaptadores con los pesos del modelo base.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni la duración del entrenamiento. La model card solo indica que es un proyecto experimental y que la evaluación se realizó de forma manual con 10 prompts, comparando el modelo base con el ajustado en métricas subjetivas de relevancia, claridad, estructura y corrección.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés (idioma principal del modelo base).
- Capacidad de mantener conversaciones multi-turno dentro de la ventana de contexto de 4096 tokens.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso explícito.
- No tiene capacidades multimodales (visión, audio, etc.).
- El ajuste fino con QLoRA puede mejorar la claridad y estructura de las respuestas respecto al modelo base, según la evaluación manual del autor, aunque la corrección factual parece ligeramente inferior.

## Casos de uso

- Aprendizaje de fine-tuning con QLoRA: el modelo sirve como ejemplo práctico de cómo aplicar LoRA, PEFT y SFT sobre Llama 2, útil para estudiantes e investigadores que quieran reproducir el flujo de trabajo.
- Experimentación con adaptadores: al ser un modelo fusionado, permite estudiar el impacto de la fusión de adaptadores en el comportamiento del modelo base.
- Demostración de despliegue en Hugging Face: el repositorio muestra cómo publicar un modelo fine-tuneado con transformers y safetensors, incluyendo compatibilidad con text-generation-inference.
- Evaluación manual de calidad de respuestas: el autor documenta un procedimiento de evaluación subjetiva con 10 prompts, que puede servir como plantilla para evaluaciones rápidas de modelos ajustados.
- Investigación educativa sobre sesgos y alucinaciones: al ser un modelo experimental, es adecuado para estudiar los límites de los modelos pequeños ajustados con datos limitados.
- No se recomienda su uso en producción ni en aplicaciones críticas, dado su carácter experimental y la ausencia de benchmarks formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es una evaluación manual subjetiva con 10 prompts, cuyos resultados se muestran a continuación. Esta evaluación no es comparable con benchmarks formales y debe interpretarse con cautela.

| Metrica | Modelo base | Modelo ajustado |
|---|---:|---:|
| Relevancia | 4,80/5 | 5,00/5 |
| Claridad | 3,70/5 | 4,60/5 |
| Estructura | 4,00/5 | 4,50/5 |
| Correccion | 5,00/5 | 4,80/5 |
| Global | 4,38/5 | 4,72/5 |

Mejora global manual: aproximadamente 8,00%.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 13,5 GB (FP16), por lo que se necesitan al menos 14 GB de VRAM para cargar el modelo sin cuantizar. Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), la VRAM requerida se reduce a unos 4-5 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4080, RTX 4090, A100, etc.). Para 4 bits, una GPU con 6-8 GB (RTX 3060, RTX 3070, etc.) es suficiente.
- Sí cabe en GPUs de consumo si se aplica cuantización de 4 bits; en FP16 requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: transformers con pipeline de generación de texto, text-generation-inference (TGI), vLLM (si se convierte a formato compatible), llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión).
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 7B en FP16 en una GPU moderna, se puede esperar una latencia de decodificación de decenas de milisegundos por token, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Yash-Llama2-7B-QLoRA-v1 | 6,7B | 4096 | no disponible | Fine-tuning experimental con QLoRA |
| NousResearch/Llama-2-7b-chat-hf | 6,7B | 4096 | Llama 2 license | Modelo base, chat optimizado |
| meta-llama/Llama-2-7b-chat-hf | 6,7B | 4096 | Llama 2 license | Version oficial de Meta |

La comparativa se limita al modelo base y su versión oficial, ya que no se dispone de datos de otros fine-tunes comparables. El modelo ajustado no presenta mejoras sustanciales documentadas más allá de la evaluación manual subjetiva, y su licencia no está especificada, lo que limita su uso comercial.

## Limitaciones y advertencias

- Modelo experimental: puede producir información incorrecta, alucinaciones, respuestas repetitivas o sesgadas, especialmente fuera de la distribución de su fine-tuning.
- La evaluación manual con 10 prompts no es representativa ni rigurosa; no sustituye a benchmarks formales.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- El modelo hereda los sesgos y limitaciones de Llama 2, incluyendo posibles sesgos de género, raza o ideológicos presentes en los datos de entrenamiento originales.
- La ventana de contexto de 4096 tokens es limitada para tareas que requieren contexto largo.
- No se proporciona información sobre el dataset de fine-tuning, por lo que no se puede evaluar la calidad o cobertura de los datos utilizados.
- No se recomienda su uso en producción sin una validación exhaustiva y sin verificar de forma independiente las salidas importantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yashhanamghar9099/Yash-Llama2-7B-QLoRA-v1
- Modelo base (NousResearch): https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo base oficial (Meta): https://huggingface.co/meta-llama/Llama-2-7b-hf
- Repositorio de código de Llama 2: https://github.com/meta-llama/llama
- Blog de Hugging Face sobre Llama 2: https://github.com/huggingface/blog/blob/main/llama2.md
