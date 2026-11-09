# Sparkplugx1904/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled-GGUF

## Resumen

Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled-GGUF es la versión cuantizada en formato GGUF del fine-tune `hesamation/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled`, un ajuste supervisado (SFT con LoRA) del modelo base `Qwen/Qwen3.6-35B-A3B`. El objetivo del fine-tune es transferir el estilo de razonamiento en cadena de pensamiento (chain-of-thought) de Claude Opus 4.6 al modelo Qwen mediante destilación de trayectorias de razonamiento, siguiendo el enfoque popularizado por `Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled`.

El modelo conserva la arquitectura MoE del Qwen3.6 original, con 34.660.610.688 parámetros totales (aproximadamente 34,66 mil millones) y una activación de tipo A3B (unos 3 mil millones de parámetros activos por token). El contexto de entrenamiento alcanza los 32.768 tokens, aunque los datos de entrenamiento se truncan a 8.192 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que ofrece una ruta práctica para ejecutar localmente un modelo de razonamiento de gran tamaño con requisitos de memoria moderados gracias a su naturaleza MoE, y en que el autor publica cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0 para adaptarse a distintos presupuestos de VRAM/RAM. El repositorio ocupa 111,3 GB, lo que refleja el conjunto completo de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (sparse mixture-of-experts), familia Qwen3.6 (tag `qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B (denominación A3B) |
| Longitud de contexto | 32.768 tokens (max sequence length de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.6-35B-A3B`, un transformer con mezcla de expertos (MoE) de aproximadamente 34,66 mil millones de parámetros totales y unos 3 mil millones activos por token. La arquitectura base incluye un codificador de visión, pero el fine-tune es exclusivamente de texto: no se entrenó con ejemplos de imagen ni vídeo, por lo que cualquier capacidad multimodal debe considerarse heredada del modelo base y no mejorada por este ajuste.

El entrenamiento consistió en un SFT con LoRA dirigido únicamente a los módulos de atención, con rango y alpha de 32/32, micro-batch de 1, acumulación de gradiente de 32, 2 épocas y 762 pasos completados. La pérdida final reportada fue de 0,3362497625740494. Los datos se componen de tres conjuntos: `nohurry/Opus-4.6-Reasoning-3000x-filtered` (3.900 muestras), `Jackrong/Qwen3.5-reasoning-700x` (700 muestras) y `Roman1111111/claude-opus-4.6-10000x` (9.633 muestras), renderizados con la plantilla de chat `qwen3-thinking` y enmascaramiento de respuesta (response-only SFT masking). La secuencia máxima de entrenamiento fue de 32.768 tokens, con los datos truncados a 8.192 tokens. Posteriormente el modelo fusionado se cuantizó a GGUF con llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento en cadena de pensamiento (chain-of-thought) destilado de trayectorias de Claude Opus 4.6, activable mediante la plantilla `qwen3-thinking`.
- Razonamiento matemático y lógico derivado de los datos de destilación.
- Capacidad de seguir instrucciones y responder con estructura de razonamiento explícita.
- Herencia potencial de capacidades del modelo base Qwen3.6 (código, tool calling, agentes), aunque no se documentan explícitamente en la model card de este fine-tune.
- Capacidad multimodal (visión) heredada del modelo base pero no entrenada en este ajuste; debe tratarse con cautela.
- Soporte de despliegue local mediante llama.cpp y runtimes compatibles con GGUF.

## Casos de uso

- Razonamiento local en estaciones de trabajo: gracias a sus ~3 B de parámetros activos, el modelo puede ejecutarse en GPUs de consumo con cuantización Q4_K_M, permitiendo razonamiento chain-of-thought sin depender de la nube.
- Asistente de análisis técnico: para tareas que requieren descomposición paso a paso (diagnóstico de errores, explicación de algoritmos), el estilo de razonamiento destilado de Opus 4.6 resulta adecuado en conversaciones de hasta 32 K tokens.
- Generación de explicaciones educativas: el modelo puede producir cadenas de razonamiento detalladas para problemas de matemáticas o lógica, útil en plataformas de tutoría.
- Prototipado de agentes conversacionales: su formato conversacional y plantilla de thinking permiten integrarlo en pipelines de agentes que necesitan trazas de razonamiento explícitas.
- Evaluación comparativa de destilación: investigadores pueden usar este modelo para estudiar la transferencia de estilos de razonamiento entre modelos propietarios y abiertos.
- Despliegue en servidores con llama.cpp: para servicios de inferencia de texto en inglés con requisitos moderados de memoria, eligiendo Q5_K_M o Q6_K según el equilibrio calidad/VRAM.
- Investigación sobre cuantización: el repositorio ofrece cuatro niveles de cuantización para analizar la degradación de calidad en tareas de razonamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (model-index). La evaluación se realizó sobre el modelo fuente fusionado, no sobre cada cuantización GGUF, y con una muestra limitada de 70 preguntas (`--limit 5` en 14 asignaturas de MMLU-Pro), por lo que debe interpretarse como una comprobación comparativa, no como un benchmark de release.

| Benchmark | Harness | Muestras | Configuración | Métrica | Modelo base | Modelo fuente fusionado | Delta |
|---|---|---:|---|---|---:|---:|---:|
| MMLU-Pro overall | lm-evaluation-harness | 70 | `--limit 5` en 14 asignaturas | exact_match, custom-extract | 42,86 % | 75,71 % | +32,85 pp |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de cuantización y overhead de llama.cpp):
  - Q4_K_M: en torno a 20-22 GB.
  - Q5_K_M: en torno a 24-26 GB.
  - Q6_K: en torno a 28-30 GB.
  - Q8_0: en torno a 36-38 GB.
- GPU recomendadas: A100 40/80 GB, H100, RTX A6000 48 GB para Q6_K/Q8_0; RTX 4090 24 GB para Q4_K_M o Q5_K_M ajustado; GPUs con 24 GB o menos requerirán offloading parcial a RAM.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) con Q4_K_M; en GPUs de 16 GB solo con offloading parcial o cuantizaciones más agresivas no listadas.
- Opciones de despliegue: llama.cpp (builds recientes con soporte para Qwen3.6), y runtimes compatibles con GGUF. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled-GGUF (este) | ~34,66 B | ~3 B | 32.768 | Apache 2.0 | GGUF | Fine-tune de razonamiento destilado, cuantizado |
| hesamation/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled | ~34,66 B | ~3 B | 32.768 | Apache 2.0 | safetensors | Modelo fuente sin cuantizar |
| Qwen/Qwen3.6-35B-A3B | ~34,66 B | ~3 B | no disponible | Apache 2.0 | safetensors | Modelo base sin fine-tune de razonamiento |
| Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled | ~27 B | no disponible | no disponible | no disponible | no disponible | Referencia de inspiración del fine-tune |

No se dispone de datos de rendimiento comparativo adicionales entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El fine-tune es solo para inglés; no se documenta soporte multilingüe.
- El benchmark MMLU-Pro se ejecutó con solo 70 preguntas y sobre el modelo fuente, no sobre las cuantizaciones; los resultados pueden no ser representativos.
- La cuantización puede degradar el rendimiento en tareas de razonamiento, especialmente en Q4_K_M.
- El modelo es un fine-tune de destilación sobre datos generados por Claude Opus 4.6; puede reproducir sesgos o estilos del modelo profesor y presentar alucinaciones en dominios no cubiertos.
- La capacidad de visión está heredada del modelo base pero no fue entrenada; su comportamiento multimodal no está validado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Aunque la licencia es Apache 2.0, deben verificarse las licencias de los datasets de destilación utilizados.
- El contexto de entrenamiento (32.768) no garantiza el mismo contexto efectivo en inferencia con llama.cpp; debe validarse.
- No se documentan capacidades de tool calling o agentes específicas para este fine-tune.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sparkplugx1904/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled-GGUF
- Modelo fuente: https://huggingface.co/hesamation/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo de inspiración: https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Dataset 1: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset 2: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset 3: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- X del autor: https://x.com/Hesamation
- Discord Open Source AI Builders: https://discord.gg/vtJykN3t
