# Teluteru/qwen3.5-4b-ml-paper-translate

## Resumen

El modelo `Teluteru/qwen3.5-4b-ml-paper-translate` es un ajuste fino QLoRA de `Qwen/Qwen3.5-4B-Base` desarrollado por Teluteru. Su objetivo es traducir textos técnicos en inglés a japonés, especialmente papers y documentación de deep learning, robótica, modelos de lenguaje y sistemas visión-lenguaje-acción (VLA). El autor generó un corpus sintético de 100.000 muestras basado en metadatos, abstracts y extractos ar5iv de arXiv, y entrenó el modelo con pérdida restringida al rol "assistant" y un chat-template sin modo "thinking".

El modelo resuelve un problema práctico: la traducción automática de literatura técnica de alto nivel, donde es crucial preservar ecuaciones, números, unidades, identificadores y terminología especializada. Con 4.539.265.536 parámetros, es un modelo denso (no MoE) que hereda la arquitectura del modelo base Qwen3.5-4B-Base, un transformer decoder-only. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo denso) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No especificados; el autor recomienda MLX 4-bit para Apple Silicon |
| Idiomas soportados | Inglés (fuente), japonés (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basado en `Qwen/Qwen3.5-4B-Base`. Según la descripción pública de la familia Qwen3.5, el modelo base está entrenado como una fundación unificada de visión-lenguaje, con fusión temprana de tokens multimodales. No obstante, este fine-tune se centra en traducción de texto técnico y no se documentan evaluaciones de capacidades multimodales.

El entrenamiento se realizó con QLoRA: los pesos base se cuantizaron a NF4 4-bit y se entrenaron adaptadores con rank 32, alpha 64 y dropout 0.05. Se usaron 98.127 filas de entrenamiento, secuencia de 2048 tokens, batch efectivo de 16 (batch por dispositivo 2, acumulación en 8 pasos), 1 época y learning rate 1e-4. El hardware fue una NVIDIA GeForce RTX 4090 de 24 GB, con un pico de memoria de 24.090 MiB. El corpus de entrenamiento es sintético, generado localmente, con 100.000 muestras aceptadas y 24.871 rechazadas, divididas en train (98.127), valid (957) y test (916). Los dominios cubiertos son deep learning (25.123), language models (24.548), robotics (25.686) y vision-language-action (24.643). Los pesos LoRA están fusionados en el modelo completo, que es el que se publica.

## Capacidades

- Traducción técnica de inglés a japonés en dominios de deep learning, robótica, modelos de lenguaje y VLA.
- Preservación de expresiones numéricas, nombres de variables, unidades y símbolos (0,91 en test).
- Preservación de fórmulas matemáticas y notación (1,00 en test).
- Precisión terminológica en dominios técnicos (0,85 en test).
- Uso con `enable_thinking=False`: el modelo está entrenado con el prefijo del chat-template sin modo "thinking".
- Potencial multimodal heredado del modelo base Qwen3.5, aunque no validado en este fine-tune.
- No se documentan capacidades de tool calling, function calling ni agentes en la model card.

## Casos de uso

- Traducción de abstracts y secciones técnicas de papers de arXiv: el modelo procesa texto en inglés y genera una traducción al japonés manteniendo la notación matemática, lo que facilita la lectura de literatura de deep learning y robótica.
- Traducción de documentación de repositorios técnicos: READMEs, guías de instalación y comentarios de código de bibliotecas de deep learning pueden traducirse preservando identificadores y comandos.
- Integración en flujos de revisión bibliográfica: se puede usar con `transformers` para traducir lotes de abstracts de forma local, extrayendo solo la traducción y evitando los saltos de línea o contenido extraño.
- Uso en extensiones de navegador: el autor proporciona una extensión Manifest V3 de Chrome que traduce texto seleccionado localmente y restaura el MathML de ar5iv tras la generación.
- Despliegue en Apple Silicon con MLX: el modelo se convierte a MLX 4-bit y se puede integrar en herramientas nativas de macOS con el Native Messaging Host suministrado por el autor.
- Edición de documentación técnica en IDEs: el modelo puede traducir comentarios o descripciones de APIs en inglés a japonés, preservando nombres de funciones y clases.

## Benchmarks y rendimiento

Los resultados de la tabla siguiente están declarados por el autor en la model card y no verificados por terceros.

| Conjunto | Métrica | Modelo base | Modelo ajustado |
|---|---:|---:|---:|
| Valid (957 filas) | chrF++ | 38,80 | 66,66 |
| Valid (957 filas) | Preservación numérica/símbolos | 0,89 | 0,92 |
| Valid (957 filas) | Preservación matemática | 0,99 | 1,00 |
| Valid (957 filas) | Precisión terminológica | 0,43 | 0,80 |
| Test (916 filas) | chrF++ | 37,81 | 66,47 |
| Test (916 filas) | Preservación numérica/símbolos | 0,89 | 0,91 |
| Test (916 filas) | Preservación matemática | 0,93 | 1,00 |
| Test (916 filas) | Precisión terminológica | 0,40 | 0,85 |

El valor chrF++ de 66,47080563825857 que aparece en el model-index corresponde al conjunto de test del modelo ajustado. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en bfloat16: los pesos ocupan aproximadamente 9,1 GB, por lo que se recomienda una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A100 o H100).
- Con cuantización MLX 4-bit, el modelo cabe en Apple Silicon con 16 GB de memoria unificada; el volumen de pesos se reduce a unos 4,5 GB.
- En tarjetas de 16 GB (por ejemplo, RTX 4080, A4000) es viable con cuantización.
- Opciones de despliegue: Hugging Face `transformers` (usando `AutoModelForImageTextToText`), MLX en Apple Silicon y la extensión de Chrome con Native Messaging Host. No se mencionan explícitamente vLLM, llama.cpp ni TGI en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | chrF++ (test) | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B-Base (modelo base) | 4.539 M | no disponible | 37,81 (declarado) | Apache 2.0 |
| Teluteru/qwen3.5-4b-ml-paper-translate | 4.539 M | no disponible | 66,47 (declarado) | Apache 2.0 |
| Qwen3-4B | ~4.000 M | no disponible | no disponible | Apache 2.0 |

La única comparativa directa disponible es la del autor frente al modelo base, que muestra una mejora de 28,66 puntos de chrF++ en el conjunto de test. No hay datos de benchmarks para Qwen3-4B en esta tarea, por lo que no se puede establecer una comparación fiable.

## Limitaciones y advertencias

- El corpus de entrenamiento es sintético y generado localmente, por lo que pueden existir sesgos no identificados.
- El modelo solo se ha evaluado para traducción de inglés a japonés; la dirección inversa y otros idiomas no están soportados ni evaluados.
- La longitud de contexto no está documentada; el entrenamiento utilizó secuencias de 2048 tokens, lo que puede obligar a trocear documentos largos.
- Fuera de los dominios de entrenamiento (deep learning, robótica, LLM, VLA), la calidad de traducción y la precisión terminológica pueden degradarse.
- Los resultados de evaluación son declarados por el autor y no verificados por terceros.
- El autor advierte que se debe usar `enable_thinking=False`; si se activa el modo "thinking", el comportamiento puede diferir del esperado.
- Al ser un modelo derivado de Qwen3.5-4B-Base, hereda las restricciones y capacidades del modelo base, pero este fine-tune no ha sido validado en tareas de imagen, tool calling o agentes.

## Enlaces

- HuggingFace: https://huggingface.co/Teluteru/qwen3.5-4b-ml-paper-translate
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
