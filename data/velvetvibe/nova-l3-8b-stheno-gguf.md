# VelvetVibe/Nova-L3-8B-Stheno-GGUF

## Resumen

Nova-L3-8B-Stheno-GGUF es un modelo de lenguaje convertido al formato GGUF, desarrollado por VelvetVibe a partir del modelo original Sao10K/L3-8B-Stheno-v3.2, un fine-tuning de Llama-3-8B orientado a conversación y escritura creativa. La conversión a GGUF se realizó con la librería Unsloth, lo que permite su ejecución eficiente en CPU y GPU mediante llama.cpp y sus derivados. El modelo está diseñado para tareas de roleplay, narrativa interactiva y asistentes conversacionales, ofreciendo una alternativa ligera con 8.030 millones de parámetros. Su relevancia radica en la facilidad de despliegue en entornos locales y la compatibilidad con herramientas como llama.cpp, Ollama o text-generation-webui.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Llama-3-8B usa 8192 tokens, pero el fine-tuning puede variar) |
| Tipos de cuantizacion | Q4_K_M (único archivo disponible) |
| Idiomas soportados | no disponible (probablemente multilingüe como Llama 3, pero no confirmado) |
| Licencia | no disponible (el modelo base Llama-3-8B usa la Llama 3 Community License, pero el repo no la especifica) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Llama-3-8B, con 8.030 millones de parámetros. Según la información disponible, es un fine-tuning del modelo Sao10K/L3-8B-Stheno-v3.2, un ajuste orientado a roleplay y escritura creativa. El entrenamiento se realizó probablemente con técnicas de fine-tuning supervisado (SFT) y posiblemente con refuerzo humano (RLHF), aunque no se detallan los datos ni la composición del dataset. La conversión a GGUF se llevó a cabo con Unsloth, que acelera el entrenamiento y la conversión, pero no aporta información sobre el proceso de entrenamiento del modelo base. No se especifica el número de tokens de entrenamiento ni las técnicas de optimización adicionales.

## Capacidades

- Generación de texto conversacional y narrativo, especialmente en contextos de roleplay e interacción persona-asistente.
- Escritura creativa: cuentos, diálogos, guiones y descripciones detalladas.
- Soporte para instrucciones y seguimiento de comandos en conversaciones multi-turno.
- Capacidad multilingüe heredada del modelo base Llama-3-8B, aunque no se confirma en la documentación.
- No se documentan capacidades de tool calling, agentes o visión; el modelo es exclusivamente de texto.

## Casos de uso

- **Asistentes de conversación para entretenimiento**: el modelo puede gestionar diálogos prolongados con contexto, ideal para aplicaciones de chat, juegos de rol o personajes virtuales en plataformas como SillyTavern.
- **Escritura creativa asistida**: redacción de cuentos, novelas o guiones donde el modelo propone continuaciones, descripciones y diálogos coherentes.
- **Atención al cliente automatizada**: con una ventana de contexto de 8192 tokens (si se mantiene), puede mantener conversaciones multi-turno con historial completo, aunque se requiere validación adicional para uso profesional.
- **Generación de contenido para juegos**: creación de diálogos no jugables (NPC) o misiones en videojuegos, aprovechando su orientación a roleplay.
- **Prototipado rápido de chatbots**: al ser un GGUF ligero (4.9 GB), se puede desplegar en hardware modesto para pruebas y prototipos de agentes conversacionales.
- **Educación y tutoría**: simulación de personajes históricos o ficticios para ejercicios de aprendizaje interactivo, aunque con supervisión por posibles imprecisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otros estándares para este modelo específico.

## Requisitos de hardware

- **VRAM estimada**: el archivo Q4_K_M pesa 4.9 GB, por lo que la inferencia requiere al menos 6 GB de VRAM para cargar el modelo completo en GPU, o ~4.5 GB de RAM si se usa CPU.
- **GPU recomendadas**: GPUs con 8 GB de VRAM (GTX 1080 Ti, RTX 2070, RTX 3060, etc.) pueden ejecutarlo cómodamente. Para mayor velocidad, una RTX 3090/4090 o A100 permitiría mayor throughput.
- **Compatible con hardware de consumo**: sí, cabe en GPUs de gama media de 8 GB y en CPU con suficiente RAM.
- **Opciones de despliegue**: llama.cpp, llama-cpp-python, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible) y otros que soporten GGUF.
- **Latencia y throughput**: no se han publicado datos; en una GPU RTX 3060 se espera una velocidad de generación de ~30-40 tokens/s para un modelo de 8B en Q4_K_M, aunque es estimación general, no medida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos. Sin embargo, el modelo original (L3-8B-Stheno-v3.2) se posiciona como una alternativa a modelos de roleplay de 7-8B como Mistral-7B-Instruct, Llama-3-8B-Instruct o el propio Llama-2-7B. No hay cifras concretas de rendimiento, por lo que se recomienda probar el modelo directamente en tareas específicas.

## Limitaciones y advertencias

- **Licencia no especificada**: aunque el modelo base Llama-3-8B tiene licencia Llama 3 Community License, el repositorio GGUF no indica la licencia, lo que puede generar incertidumbre legal para uso comercial. Se recomienda verificar con el autor.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o no factual, especialmente en temas técnicos o científicos.
- **Sesgos**: el fine-tuning puede introducir sesgos hacia temáticas de roleplay o estilos de escritura particulares; no hay evaluación de sesgos.
- **Contexto limitado**: la ventana de 8192 tokens puede ser insuficiente para conversaciones muy largas o documentos extensos.
- **Sin soporte para tool calling**: no se documenta la capacidad de invocar funciones externas, lo que limita su uso en agentes autónomos.
- **Formato de cuantización único**: solo se ofrece Q4_K_M; otras cuantizaciones (Q8, Q6) no están disponibles, lo que limita el equilibrio entre calidad y rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VelvetVibe/Nova-L3-8B-Stheno-GGUF
- Modelo original (Sao10K/L3-8B-Stheno-v3.2): https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Blog de Nebula Block sobre L3-8B Stheno v3.2: https://blog.nebulablock.com/introducing-l3-8b-stheno-v3-2-on-nebula-block-free-inference-for-all/
- Review en Reddit (r/SillyTavernAI): https://www.reddit.com/r/SillyTavernAI/comments/1dfczhd/my_sao10kl38bsthenov32_review/
- Unsloth: https://github.com/unslothai/unsloth
