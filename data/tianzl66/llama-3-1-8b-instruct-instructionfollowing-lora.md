# tianzl66/Llama-3.1-8B-Instruct-InstructionFollowing-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) de rango 16, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`, con el objetivo de mejorar el seguimiento de instrucciones. El adaptador fue creado por el usuario `tianzl66` como parte de una línea de investigación sobre "Spectral Surgery", una técnica que modifica los pesos del modelo en el espacio espectral para mejorar capacidades específicas. Este checkpoint de LoRA actúa como baseline de SFT para comparar los resultados de dicha técnica.

El modelo resultante es un adaptador de 0.2 GB que, combinado con el modelo base de 8 mil millones de parámetros, ofrece una alternativa ligera para experimentos de instruction following. La evaluación se realizó con el benchmark IFEval, donde el adaptador LoRA muestra un rendimiento similar al modelo base en las métricas estrictas y ligeramente inferior en las métricas laxas, mientras que la técnica Spectral Surgery HNS 8+2 (que parte de este adaptador) logra mejoras notables. Es relevante para investigadores que estudian métodos de fine-tuning eficiente y modificación de pesos en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención por grupos (GQA) del modelo base Llama-3.1-8B-Instruct |
| Parametros totales | 8.03 mil millones (modelo base) + adaptador LoRA de rango 16 (parámetros adicionales no especificados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (según especificaciones del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base, p. ej. 4-bit, 8-bit) |
| Idiomas soportados | Multilingüe (heredado del modelo base, incluye español, inglés, francés, alemán, etc.) |
| Licencia | No disponible (el modelo base usa la Licencia Comunitaria Llama 3.1 de Meta) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Llama-3.1-8B-Instruct, un transformer decoder-only con atención por grupos (GQA) y 8 mil millones de parámetros. El adaptador LoRA de rango 16 se entrena mediante fine-tuning supervisado (SFT) sobre el modelo base, con una longitud de secuencia de 1024 tokens, un tamaño de batch global de 128 y una semilla fija de 42. No se especifican los datos de entrenamiento utilizados, pero el objetivo es mejorar el seguimiento de instrucciones, evaluado con el benchmark IFEval.

La innovación principal no reside en el adaptador en sí, sino en su papel como punto de partida para la técnica "Spectral Surgery HNS 8+2", que modifica los pesos del modelo en el dominio espectral. Este adaptador LoRA sirve como baseline de SFT para comparar los efectos de dicha intervención. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y seguimiento de instrucciones: el adaptador está diseñado para mejorar la adherencia a instrucciones explícitas, evaluada con IFEval.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Llama-3.1-8B-Instruct, que incluyen razonamiento, conocimiento factual y comprensión lectora.
- Soporte multilingüe: el modelo base es multilingüe, por lo que el adaptador conserva esta capacidad.
- Tool calling y function calling: el modelo base soporta estas funciones, aunque no se ha verificado específicamente en el adaptador.
- No se han documentado capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Investigación en fine-tuning eficiente: el adaptador sirve como referencia para estudiar el impacto de técnicas como Spectral Surgery en el seguimiento de instrucciones, permitiendo comparar métricas de IFEval entre diferentes enfoques.
- Experimentos de bajo coste: al ser un adaptador LoRA de solo 0.2 GB, permite probar variaciones de fine-tuning sin necesidad de reentrenar el modelo completo, ideal para laboratorios con recursos limitados.
- Evaluación de instruction following: se puede integrar en pipelines de evaluación de benchmarks como IFEval para medir la calidad de respuesta a instrucciones en entornos controlados.
- Base para fine-tuning adicional: el adaptador puede servir como punto de partida para otros experimentos de SFT o para combinar con otras técnicas de modificación de pesos.
- Prototipado de asistentes conversacionales: combinado con el modelo base, puede usarse para crear prototipos de chatbots que sigan instrucciones, aunque no está optimizado para producción.
- Análisis de la influencia del rango LoRA: al ser un adaptador de rango 16, permite estudiar cómo el rango afecta al rendimiento en tareas de instruction following en comparación con otros rangos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en IFEval, comparando el modelo base, el adaptador LoRA SFT y la técnica Spectral Surgery HNS 8+2 (que parte de este adaptador). Los datos son los siguientes:

| Modelo | Prompt Strict | Prompt Loose | Instruction Strict | Instruction Loose |
|---|---:|---:|---:|---:|
| Base (Llama-3.1-8B-Instruct) | 65.80% | 72.83% | 75.54% | 81.18% |
| LoRA SFT (este adaptador) | 65.99% | 70.98% | 74.82% | 79.26% |
| Spectral Surgery HNS 8+2 | 69.50% | 73.94% | 77.94% | 82.13% |

El adaptador LoRA SFT muestra un rendimiento ligeramente superior al modelo base en la métrica Prompt Strict, pero inferior en las demás. La técnica Spectral Surgery, que parte de este adaptador, supera claramente al baseline en todas las métricas. No se han publicado resultados en otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 8B en precisión FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización 4-bit, se puede reducir a unos 6-8 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización 4-bit. También puede ejecutarse en A100 o H100 para mayor throughput.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060 (12 GB) con cuantización 4-bit, aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face, y usar con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que soporten la carga de adaptadores LoRA.
- Latencia y throughput: no se han publicado datos específicos. Para el modelo base 8B en una RTX 4090, se espera una latencia de decodificación de ~20-30 ms/token y un throughput de ~50-100 tokens/s, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este adaptador. Sin embargo, se puede comparar con el modelo base y con otros adaptadores LoRA de la misma familia:

| Modelo | Parámetros | Contexto | IFEval (Prompt Strict) | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | 65.80% | Llama 3.1 Community |
| Este adaptador LoRA SFT | 8B + LoRA r16 | 128k | 65.99% | No disponible |
| Spectral Surgery HNS 8+2 | 8B + adaptador modificado | 128k | 69.50% | No disponible |

No se han encontrado otros adaptadores LoRA de instruction following con métricas publicadas en IFEval para comparar directamente.

## Limitaciones y advertencias

- El adaptador es un artefacto de investigación, no un modelo listo para producción. No se ha optimizado para despliegue comercial ni se han realizado pruebas de robustez.
- La licencia no está especificada en el repositorio. El modelo base tiene la Licencia Comunitaria Llama 3.1, que impone restricciones de uso comercial para aplicaciones con más de 700 millones de usuarios mensuales. Se debe verificar la compatibilidad antes de usar el adaptador en entornos comerciales.
- El rendimiento en IFEval es solo ligeramente superior al modelo base en una métrica, e inferior en las demás. No se ha demostrado una mejora significativa en el seguimiento de instrucciones con este adaptador.
- No se han documentado sesgos específicos, pero el modelo base puede presentar sesgos de género, raza o ideología presentes en los datos de entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en contextos largos.
- La longitud de contexto de 128k tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el coste computacional aumenta.
- No se proporcionan datos sobre el dataset de entrenamiento, por lo que no se puede evaluar la calidad o diversidad de los datos utilizados para el fine-tuning.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-InstructionFollowing-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentación del modelo base (README): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/README.md
- Artículo sobre fine-tuning con LoRA (referencia general): https://kickitlikeshika.github.io/2024/07/24/how-to-fine-tune-llama-3-models-with-LoRA.html
