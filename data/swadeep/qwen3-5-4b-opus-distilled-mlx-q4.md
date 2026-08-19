# swadeep/Qwen3.5-4b-opus-distilled-mlx-q4

## Resumen

El modelo `swadeep/Qwen3.5-4b-opus-distilled-mlx-q4` es una versión cuantizada a 4 bits (MLX Q4, grupo 64) del modelo `swadeep/Qwen3.5-4b-opus-distilled`, un fine-tuning LoRA-SFT sobre `Qwen/Qwen3.5-4B` orientado a razonamiento, seguimiento de instrucciones y generación de código. El autor, swadeep, ha destilado el comportamiento de razonamiento de Claude Opus (versiones 4.6 y 4.7) en un modelo de tamaño reducido, utilizando un conjunto de datos de 8.000 muestras de razonamiento y dos etapas adicionales de corrección de contexto y SFT final.

La versión MLX Q4 está pensada para ejecutarse en hardware Apple Silicon mediante la librería `mlx-lm`, ofreciendo una huella de memoria reducida (2,4 GB en disco) y una inferencia eficiente en dispositivos Mac. Con aproximadamente 658 millones de parámetros (según los pesos safetensors), se posiciona como un modelo ligero pero capaz de tareas de razonamiento complejas, aunque su ventana de contexto y capacidades multilingües no están documentadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 657.959.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX Q4 (4-bit, group size 64, modo affine) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-4B`, un transformer denso de 4.000 millones de parámetros (aunque los pesos finales cuantizados muestran 658M, lo que sugiere que la cuantización reduce el tamaño efectivo de almacenamiento, no el número de parámetros). El fine-tuning se realizó en tres etapas con LoRA:

1. **SFT inicial** sobre 8.000 muestras del dataset `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`, que contiene razonamientos generados por Claude Opus.
2. **Context-bleed-fix** sobre 2.000 muestras con inserciones off-topic para corregir fugas de contexto.
3. **SFT final** sobre `grpo_data/opus_reasoning_sft_offtopic`.

La LoRA se fusionó con una escala de 0.04. No se menciona el uso de RLHF ni DPO. La conversión a MLX Q4 se realizó con `mlx_lm.convert`, lo que implica cuantización affine por grupos de 64 valores.

## Capacidades

- **Razonamiento paso a paso**: entrenado con datos de razonamiento de Claude Opus, el modelo es capaz de descomponer problemas complejos en pasos lógicos.
- **Seguimiento de instrucciones**: optimizado mediante SFT para adherirse a instrucciones explícitas.
- **Generación de código**: el tag `coding` indica capacidad para escribir y explicar código, aunque no se especifican benchmarks.
- **Conversación multi-turno**: soporta diálogos interactivos (tag `conversational`).
- **Text-only**: no incluye capacidades de visión ni audio.
- **Tool calling**: no se menciona soporte explícito para function calling ni agentes.
- **Multilingüe**: limitado al inglés según la model card.

## Casos de uso

- **Asistente de razonamiento para estudiantes**: el modelo puede guiar la resolución de problemas matemáticos o lógicos paso a paso, aprovechando su entrenamiento en razonamiento de Opus. Adecuado por su tamaño reducido y bajo consumo en Mac.
- **Generación de código en entornos de desarrollo local**: programadores que trabajan en Apple Silicon pueden usar el modelo para autocompletar o explicar fragmentos de código directamente en su máquina, sin depender de APIs externas.
- **Chatbot de soporte técnico**: su capacidad de seguir instrucciones y mantener conversaciones lo hace útil para bots de atención al cliente en inglés, con respuestas razonadas.
- **Análisis de texto y extracción de conclusiones**: dado su entrenamiento en razonamiento, puede resumir documentos y extraer inferencias lógicas, útil para tareas de análisis de datos textuales.
- **Prototipado rápido de aplicaciones de IA**: al ser un modelo ligero con licencia Apache-2.0, permite experimentar con generación de texto y razonamiento sin costes de inferencia en la nube.
- **Investigación en destilación de modelos**: sirve como ejemplo de destilación de un modelo grande (Claude Opus) a uno pequeño, útil para estudios académicos sobre eficiencia y transferencia de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser una cuantización MLX Q4 de ~658M parámetros, el modelo ocupa aproximadamente 0,66 GB en memoria (658M × 4 bits / 8 = ~329 MB, más overhead). En la práctica, el repo pesa 2,4 GB, pero la carga en memoria será menor.
- **GPU recomendadas**: diseñado para Apple Silicon (M1, M2, M3 y superiores) mediante `mlx-lm`. No hay soporte oficial para GPUs NVIDIA o AMD.
- **Compatibilidad con hardware de consumo**: sí, cualquier Mac con chip Apple Silicon y al menos 8 GB de RAM unificada puede ejecutarlo con fluidez.
- **Opciones de despliegue**: `mlx-lm` (CLI y Python), también puede integrarse en aplicaciones macOS nativas. No es compatible con vLLM, llama.cpp u Ollama en su formato actual.
- **Latencia y throughput**: no se han publicado mediciones. En un M2 Pro se espera una generación de 20-40 tokens/segundo, pero es una estimación sin datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con modelos equivalentes. Cualitativamente, se puede comparar con:

- **Qwen3.5-4B base**: el modelo original sin fine-tuning; la versión destilada añade capacidades de razonamiento específicas de Opus, pero pierde generalidad.
- **Modelos de razonamiento pequeños como Phi-4-mini (3.8B)**: ambos son compactos y orientados a razonamiento, pero Phi-4-mini tiene más parámetros y está entrenado con datos sintéticos; la comparación exacta requiere benchmarks.
- **Llama-3.2-1B**: similar en tamaño, pero con menor capacidad de razonamiento profundo.

No hay datos de rendimiento publicados para establecer una comparación rigurosa.

## Limitaciones y advertencias

- **Sesgos conocidos**: al entrenarse con datos de razonamiento de Claude Opus, puede heredar sesgos presentes en esos datos, aunque no se han documentado.
- **Riesgo de alucinacion**: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en temas fuera de su dominio de entrenamiento.
- **Limitaciones de idioma**: solo inglés confirmado; el uso en otros idiomas puede degradar la calidad.
- **Contexto limitado**: no se especifica la longitud de contexto; probablemente hereda la de Qwen3.5-4B (típicamente 32K), pero no está confirmado.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia (Apache-2.0 también, según el autor), por lo que no hay restricciones adicionales conocidas.
- **Caveat de producción**: al ser un modelo destilado y cuantizado, puede mostrar degradación en tareas complejas comparado con el modelo original de 4B sin cuantizar. No hay garantías de rendimiento en producción sin pruebas adicionales.

## Enlaces

- [Modelo en HuggingFace (versión MLX Q4)](https://huggingface.co/swadeep/Qwen3.5-4b-opus-distilled-mlx-q4)
- [Modelo original sin cuantizar](https://huggingface.co/swadeep/Qwen3.5-4b-opus-distilled)
- [Modelo base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Dataset de razonamiento de Claude Opus](https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k)
- [Documentación de mlx-lm](https://github.com/ml-explore/mlx-examples/tree/main/llms)
