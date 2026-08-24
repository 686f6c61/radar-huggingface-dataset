# Tuannt1601/lab22-sft-mini-vn

## Resumen

El modelo `Tuannt1601/lab22-sft-mini-vn` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-3B. El adaptador se publica en formato PEFT (safetensors) y está diseñado para la generación de texto. El nombre del repositorio sugiere un enfoque hacia el vietnamita ("vn"), aunque no se proporciona documentación oficial que lo confirme.

El modelo parece ser el resultado de un ejercicio académico o de laboratorio (posiblemente el "Lab 22" de un curso de VinUni AICB Track-3, según los resultados de búsqueda), orientado a demostrar el flujo de trabajo de fine-tuning con LoRA, SFT y herramientas como Unsloth y TRL. Su relevancia radica en ejemplificar cómo adaptar un modelo de 3B parámetros con recursos limitados, aunque carece de documentación detallada y de métricas de evaluación públicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-3B) |
| Tipos de cuantizacion | El adaptador en safetensors; el modelo base en 4 bits (bnb) |
| Idiomas soportados | No disponible (probablemente vietnamita, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Qwen2.5-3B, un transformer causal con atención de múltiples cabezas y normalización RMSNorm. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL de Hugging Face y la herramienta Unsloth para optimizar el proceso sobre el modelo base cuantizado a 4 bits. No se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni los hiperparámetros utilizados. La técnica LoRA reduce el número de parámetros entrenables, lo que permite un ajuste eficiente en hardware limitado. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: al heredar las capacidades de Qwen2.5-3B, el modelo puede producir texto coherente en múltiples dominios, aunque el fine-tuning específico puede haber ajustado el estilo o el dominio.
- Razonamiento y conocimiento general: el modelo base Qwen2.5-3B tiene capacidades de razonamiento, matemáticas y conocimiento general, que el adaptador conserva en principio.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-3B soporta estas funciones, pero no se ha verificado si el adaptador las mantiene tras el SFT.
- Capacidades multilingües: el modelo base soporta varios idiomas, pero el adaptador podría estar especializado en vietnamita (por el nombre), sin confirmación.
- No se dispone de información sobre modos especiales (thinking, visión, audio) ni sobre el comportamiento específico tras el fine-tuning.

## Casos de uso

- Demostración educativa de fine-tuning: el modelo sirve como ejemplo práctico de cómo aplicar LoRA y SFT sobre un modelo cuantizado, útil en cursos o talleres de IA.
- Experimentación con adaptadores: investigadores pueden cargar el adaptador sobre el modelo base para probar técnicas de alineación o comparar con otros adaptadores de la misma serie (por ejemplo, los de DPO).
- Chatbots en vietnamita (si se confirma el idioma): podría usarse como base para un asistente conversacional en vietnamita, aunque requiere validación adicional.
- Evaluación de la calidad del SFT: se puede utilizar para medir el impacto del fine-tuning en tareas específicas frente al modelo base sin adaptador.
- Integración en pipelines de generación de texto: al ser un adaptador ligero, puede combinarse con el modelo base cuantizado para desplegarse en entornos con recursos limitados.
- Investigación sobre alineación: el adaptador puede servir como punto de partida para experimentos de DPO o RLHF, como se observa en otros repositorios similares del mismo laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo base de 3B cuantizado a 4 bits, la inferencia requiere aproximadamente 2-3 GB de VRAM para el modelo base, más un pequeño overhead para el adaptador. En total, unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) puede ejecutar el modelo cómodamente. También es posible en GPUs de 4 GB con cuantización adicional.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp, Ollama o TGI, cargando el adaptador PEFT sobre el modelo base cuantizado. También es posible fusionar el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU T4, se espera una latencia de decenas de milisegundos por token para un modelo de 3B en 4 bits, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tuannt1601/lab22-sft-mini-vn | Adaptador LoRA sobre Qwen2.5-3B | 32K | No disponible | PEFT/safetensors | Adaptador SFT, sin documentación |
| unsloth/Qwen2.5-3B-bnb-4bit | 3B (base) | 32K | Apache 2.0 (Qwen2.5) | safetensors (bnb-4bit) | Modelo base cuantizado |
| wanhin/lab22-sft-mini | Adaptador LoRA (similar) | No disponible | No disponible | PEFT | Otro adaptador del mismo lab, sin detalles |
| StevenMup2004/lab22-dpo-vn | Adaptador LoRA (DPO) | No disponible | MIT | PEFT | Adaptador entrenado con DPO, también para vietnamita |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Documentación ausente: la model card no proporciona información sobre el dataset, el propósito, los hiperparámetros ni la evaluación, lo que dificulta su uso en producción.
- Sesgos desconocidos: al no conocer los datos de entrenamiento, no se pueden evaluar sesgos potenciales (idioma, dominio, contenido).
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente fuera de su dominio de entrenamiento.
- Licencia incierta: la licencia no está especificada; aunque el modelo base Qwen2.5-3B es Apache 2.0, el adaptador podría tener restricciones adicionales. Se recomienda contactar al autor antes de un uso comercial.
- Limitaciones de idioma: si el adaptador está especializado en vietnamita, su rendimiento en otros idiomas puede degradarse.
- Sin garantías de producción: al ser un artefacto académico, no se ha validado para entornos de producción ni para tareas críticas.

## Enlaces

- HuggingFace: https://huggingface.co/Tuannt1601/lab22-sft-mini-vn
- Repositorio similar (wanhin/lab22-sft-mini): https://huggingface.co/wanhin/lab22-sft-mini
- Repositorio similar (StevenMup2004/lab22-dpo-vn): https://huggingface.co/StevenMup/lab22-dpo-vn
- GitHub del laboratorio (ejemplo): https://github.com/lamphamaudio/Day22-2A202600491
- GitHub de otro participante: https://github.com/tinstins23/K4-Track3-Day22-2A202601688-HoTrungTin
