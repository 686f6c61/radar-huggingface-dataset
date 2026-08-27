# theprint/ProgramManager-v1-2B-GGUF

## Resumen

ProgramManager-v1-2B-GGUF es un modelo de lenguaje de 2.000 millones de parámetros desarrollado por el usuario `theprint`, que consiste en un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3.5-2B` mediante la técnica LoRA. El modelo se ha entrenado con un conjunto de datos conversacionales llamado `TechPM Combined 6.40k sharegpt`, orientado a tareas de gestión de programas técnicos y de proyectos. El ajuste se realizó con el pipeline automatizado Auto-SFT, que combina búsqueda de hiperparámetros y supervisión.

El modelo se distribuye en formato GGUF con múltiples cuantizaciones, lo que permite su uso directo en motores de inferencia como llama.cpp, Ollama o LM Studio. Con apenas 1.942.653.248 parámetros, está pensado para entornos con recursos limitados o despliegues en dispositivos de bajo consumo. La relevancia de este modelo reside en su tamaño compacto y en su especialización en un dominio concreto, aunque la información pública disponible es escasa y no se han publicado métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max_seq_length=512) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS, IQ4_NL, TQ2_0 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Qwen3.5-2B`, que corresponde a un transformer decoder con arquitectura similar a la familia Qwen3.5. El proceso de fine-tuning se realizó con LoRA, aplicando módulos de atención (`q_proj`, `v_proj`, `k_proj`, `o_proj`) con r=4, alpha=4 y dropout de 0.07. El entrenamiento duró 2 épocas con un learning rate de 1e-05, batch de 1 con 8 pasos de acumulación de gradientes y una longitud máxima de secuencia de 512 tokens. Los pesos LoRA se fusionaron al modelo completo en precisión de 16 bits.

El conjunto de datos `TechPM Combined 6.40k sharegpt` está en formato conversacional y contiene alrededor de 6.400 muestras. El ajuste se realizó con Auto-SFT, una herramienta que automatiza la búsqueda de hiperparámetros y el proceso de supervisión. No se menciona el uso de técnicas adicionales como RLHF o DPO. El modelo base, Qwen3.5-2B, no dispone de documentación pública detallada en los datos proporcionados, por lo que se desconocen aspectos como la longitud de contexto original o el número de tokens de preentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, especializado en el dominio de gestión de programas técnicos y de proyectos.
- Ajuste fino supervisado con datos de tipo sharegpt, lo que sugiere capacidad para mantener diálogos multi-turno.
- Compatible con motores de inferencia GGUF (llama.cpp, Ollama, LM Studio), lo que facilita el despliegue local.
- No se documentan capacidades explícitas de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

Dado el tamaño reducido y el enfoque del entrenamiento, se pueden considerar los siguientes escenarios, aunque no hay documentación oficial que los respalde:

- Asistente técnico para planificación de proyectos: el modelo puede responder preguntas sobre metodologías de gestión de programas (por ejemplo, Agile, Scrum) gracias al entrenamiento con datos del dominio TechPM.
- Chatbot de soporte interno en equipos de desarrollo: su tamaño permite desplegarlo en infraestructuras modestas, como un servidor con una GPU de gama media.
- Prototipado rápido de aplicaciones conversacionales: por su formato GGUF y compatibilidad con Ollama, es fácil de integrar en entornos de desarrollo sin necesidad de ajustes complejos.
- Generación de resúmenes de reuniones técnicas: si el conjunto de datos contiene ejemplos de actas o conversaciones de equipo, el modelo puede asistir en la síntesis de información.
- Educación y formación en gestión de proyectos: puede servir como tutor interactivo para conceptos básicos de gestión de programas técnicos.
- Evaluación de técnicas de fine-tuning LoRA en modelos de 2B: útil para investigadores que quieran comparar el efecto de este ajuste frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- El modelo tiene 1.942.653.248 parámetros. En BF16, el peso completo ocupa aproximadamente 3,9 GB de memoria (sin contar overhead). Con cuantización Q4_K_M, el tamaño del archivo GGUF se reduce a alrededor de 1,1–1,3 GB, lo que permite ejecutarlo en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M. Para la versión BF16 o Q8_0, se recomienda al menos 6 GB de VRAM.
- Compatible con GPUs consumer (gama media y baja) y con CPUs mediante llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con formato GGUF (por ejemplo, llama-cpp-python).
- Latencia y throughput estimados: no se proporcionan datos oficiales. En una GPU de 8 GB (RTX 3070), se puede esperar una velocidad de generación de 20–40 tokens por segundo en cuantización Q4_K_M, pero estos valores son orientativos y no han sido verificados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base es Qwen3.5-2B, pero no se han publicado datos de contexto ni benchmarks. Alternativas comparables en tamaño serían Qwen2.5-1.5B, Gemma-2-2B o Phi-2 (2.7B), pero no hay datos de rendimiento de ProgramManager-v1-2B que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo se ha entrenado únicamente con datos en inglés, por lo que su rendimiento en otros idiomas es nulo o muy limitado.
- La longitud de contexto no se ha especificado; el entrenamiento se realizó con secuencias de 512 tokens, lo que puede limitar la coherencia en diálogos largos.
- No se dispone de información sobre la licencia, por lo que el uso comercial queda sujeto a la licencia del modelo base (Qwen3.5) y del conjunto de datos, que no se detallan.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información inventada, especialmente en dominios fuera del entrenamiento.
- La fecha de creación (2026-08-26) es reciente y el repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo no ha sido validado por la comunidad.
- No se documentan sesgos específicos, pero es probable que los datos de entrenamiento contengan sesgos propios del dominio técnico de gestión de proyectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theprint/ProgramManager-v1-2B-GGUF
- Modelo base unsloth/Qwen3.5-2B: https://huggingface.co/unsloth/Qwen3.5-2B
- Repositorio de Auto-SFT: https://github.com/theprint/auto-sft
- Documentación de GGUF en Hugging Face: https://huggingface.co/docs/hub/gguf
