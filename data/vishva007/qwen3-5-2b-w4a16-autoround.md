# Vishva007/Qwen3.5-2B-W4A16-AutoRound

## Resumen

Vishva007/Qwen3.5-2B-W4A16-AutoRound es una versión cuantizada del modelo Qwen/Qwen3.5-2B, desarrollada por Vishva007 mediante AutoRound, el método de cuantización de Intel basado en descenso de gradiente de signo. El objetivo es reducir el tamaño y los requisitos de memoria del modelo original para facilitar su despliegue en GPUs de consumo y entornos con recursos limitados, manteniendo una precisión cercana a la del modelo en FP16. La cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) consigue una reducción de memoria de aproximadamente el 50% respecto al modelo base, lo que permite ejecutar el modelo en hardware modesto.

El modelo base Qwen3.5-2B es un transformer de lenguaje de la familia Qwen, aunque el archivo safetensors de esta versión cuantizada contiene 1.061.364.544 parámetros (aproximadamente 1,06 mil millones), una cifra inferior a la que sugiere el nombre "2B". La cuantización incluye soporte para Multi-Token Prediction (MTP), lo que habilita la decodificación especulativa para acelerar la inferencia en backends compatibles como vLLM. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B) |
| Parametros totales | 1.061.364.544 (aprox. 1,06 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (calibración con secuencia de 4096) |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), grupo 32, simétrico |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato GPTQ/AutoRound) |

## Arquitectura y entrenamiento

Esta versión es una cuantización del modelo Qwen/Qwen3.5-2B, no un entrenamiento desde cero. El proceso de cuantización se realizó con AutoRound, que emplea un descenso de gradiente de signo para ajustar los pesos a 4 bits, minimizando la pérdida de precisión. Los parámetros de cuantización incluyen un tamaño de grupo de 32, cuantización simétrica, 1000 iteraciones de optimización, 512 muestras de calibración y una longitud de secuencia de 4096. Se habilitó Torch Compile para optimizar la ejecución.

El modelo resultante mantiene las activaciones en FP16, lo que proporciona estabilidad durante la inferencia. Además, se ha activado MTP (Multi-Token Prediction), una técnica que permite predecir varios tokens a la vez y que, combinada con decodificación especulativa, puede mejorar el throughput en backends como vLLM. No se dispone de información sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-2B, aunque no se detallan en la información proporcionada.
- Soporte de MTP (Multi-Token Prediction) para decodificación especulativa, lo que permite acelerar la inferencia en backends compatibles.
- Compatibilidad con backends de inferencia como vLLM, SGLang, AutoGPTQ y transformers, lo que facilita su integración en pipelines existentes.
- Al ser una cuantización, las capacidades funcionales son las mismas que las del modelo base; la cuantización solo afecta al tamaño y al rendimiento, no a las habilidades del modelo.
- No se ha confirmado soporte específico para tool calling, agentes o capacidades multimodales; se debe consultar la documentación del modelo base para conocerlas.

## Casos de uso

- Despliegue en entornos con recursos limitados: al reducir la memoria en aproximadamente un 50% respecto al FP16, el modelo puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM, como una RTX 3060 o una GTX 1660, lo que lo hace adecuado para prototipos y aplicaciones en local.
- Asistente de chat ligero: integrable en aplicaciones de mensajería o asistentes personales que requieran baja latencia y no dispongan de infraestructura de servidores potentes.
- Generación de código en IDEs: puede utilizarse como autocompletado de código en editores como VS Code o JetBrains, siempre que el modelo base tenga esa capacidad; la cuantización permite ejecutarlo en portátiles con GPU integrada.
- Clasificación y extracción de entidades en pipelines de datos: para tareas de procesamiento de lenguaje natural en producción donde se necesite un modelo pequeño y rápido, por ejemplo, en sistemas de análisis de opiniones o etiquetado de documentos.
- Inferencia en CPU: aunque no se especifica, un modelo de ~1B parámetros cuantizado a 4 bits puede ejecutarse en CPU con suficiente RAM, lo que amplía las opciones de despliegue sin GPU.
- Fine-tuning con PEFT: al ser una versión cuantizada, puede servir como base para ajuste fino con técnicas como LoRA, reduciendo aún más los requisitos de memoria durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB para el modelo cuantizado (1,06 B parámetros × 4 bits ≈ 0,53 GB, más overhead de activaciones y caché). El tamaño del repositorio es de 2,7 GB, que puede incluir archivos adicionales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3050, o superiores. También puede ejecutarse en CPU con 8 GB de RAM.
- Opciones de despliegue: vLLM (con soporte para MTP), SGLang, AutoGPTQ, transformers. Para vLLM, se puede activar la decodificación especulativa con `--speculative_config '{"method":"mtp","num_speculative_tokens":3}'`.
- Latencia y throughput: no se dispone de datos concretos; dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-2B (base) | ~2 B (según nombre) | FP16 | No disponible | Apache-2.0 | Modelo original sin cuantizar |
| Vishva007/Qwen3.5-2B-W4A16-AutoRound | 1.061.364.544 | W4A16 (4-bit) | No disponible | Apache-2.0 | Versión cuantizada con AutoRound, MTP habilitado |
| Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-GPTQ | No disponible | W4A16 | No disponible | Apache-2.0 | Otra cuantización del mismo autor, basada en Qwen3.8-2B |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia entre la versión cuantizada y el base es el tamaño en memoria y la posible degradación de precisión, que AutoRound intenta minimizar.

## Limitaciones y advertencias

- La cuantización puede introducir una ligera degradación de precisión respecto al modelo base, aunque AutoRound está diseñado para minimizarla; no se han publicado métricas que cuantifiquen esta pérdida.
- El número de parámetros real (1.061.364.544) difiere del nombre del modelo ("2B"), lo que puede indicar un error en la denominación o que el modelo base tiene menos parámetros de los esperados; se recomienda verificar antes de usarlo en producción.
- No se ha especificado la longitud de contexto máxima del modelo; la calibración se realizó con secuencias de 4096, pero el modelo base podría soportar más.
- No se dispone de información sobre los idiomas soportados ni sobre capacidades específicas como tool calling o visión; se debe consultar la documentación del modelo base.
- Aunque la licencia es Apache-2.0, es necesario verificar que el modelo base Qwen3.5-2B también tenga una licencia compatible para uso comercial (en este caso, también es Apache-2.0).
- Como cualquier LLM, existe riesgo de alucinaciones y sesgos; se recomienda validar las salidas en aplicaciones críticas.
- El soporte de MTP depende del backend; no todos los entornos de inferencia lo implementan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-2B-W4A16-AutoRound
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de AutoRound (Intel): https://github.com/intel/auto-round
- Perfil del autor en Hugging Face: https://huggingface.co/Vishva007
- Documentación de LLM Compressor para Qwen3.5: https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/
- Ejemplo de despliegue de un modelo similar (Qwen3.8-27B AutoRound en 2x RTX 3090): https://github.com/tonyd2wild/Qwen3.8-27B-AutoRound-W4A16-2x3090/tree/main/
