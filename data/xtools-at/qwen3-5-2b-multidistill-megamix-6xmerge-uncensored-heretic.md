# xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic

## Resumen

El modelo `xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic` es un checkpoint experimental de 2.213.241.664 parámetros (~2,2B) construido en dos fases. Primero, el autor realizó una fusión lineal ponderada de seis fine-tunes de la familia Qwen3.5-2B, cada uno especializado en razonamiento estructurado, instrucciones, conversación o matemáticas. Después, aplicó Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo resultante, obteniendo una variante "decensored" o "abliterated".

El objetivo declarado es explorar si los comportamientos complementarios de esos seis checkpoints pueden combinarse en un único modelo compacto apto para asistencia diaria, razonamiento matemático, programación y tareas analíticas multi-paso. La arquitectura hereda el soporte multimodal texto-imagen de la familia Qwen3.5 y se distribuye en formato safetensors para `transformers`.

Su relevancia actual es doble: por un lado, demuestra técnicas de fusión de pesos (weight merging) como alternativa al fine-tuning supervisado tradicional; por otro, documenta de forma reproducible el proceso de ablación de rechazos mediante Heretic, con parámetros ARA explícitos y métricas de divergencia KL. Es, sin embargo, un artefacto experimental sin benchmarks independientes publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal texto-imagen |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, cuantificable a GGUF/AWQ por herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión lineal ponderada (linear weighted average) en espacio de parámetros de seis checkpoints Qwen3.5-2B, no un fine-tuning nuevo. Los componentes y sus pesos configurados son: `DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING` (1.0), `Jackrong/Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled` (0.9), `empero-ai/Qwen3.8-2B-Distill` (0.8), `DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact` (0.6), `Jackrong/Qwopus3.5-2B-v3` (0.6) y `ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation` (0.5). La model card advierte que estos pesos son valores configurados, no porcentajes de contribución ni estimaciones medidas.

Los datasets asociados en las etiquetas incluyen `TeichAI/polaris-alpha-1000x`, `Ali-Yaser/KIMI-K2.5-450000x-ShareGPT`, `allenai/tulu-3-sft-mixture`, `nohurry/Opus-4.6-Reasoning-3000x-filtered` y `Jackrong/Qwen3.5-reasoning-700x`, lo que indica que los componentes se entrenaron con datos de razonamiento destilado (estilo Claude Opus y Kimi) y mezclas SFT generales. La fusión hereda estas capacidades sin un entrenamiento adicional documentado.

La segunda fase aplica Heretic v2.0.0.dev0 con ablación de rango arbitrario (ARA) sobre las capas 6 a 19, con `preserve_good_behavior_weight` de 0,6019, `steer_bad_behavior_weight` de 0,0002, `overcorrect_relative_weight` de 0,3401 y `neighbor_count` de 8. El autor reporta que los rechazos caen de 96/100 en el modelo original a 1/100, con una divergencia KL de 0,0295 respecto al original. La fusión no especifica la librería exacta, la normalización de coeficientes, las exclusiones de tensores ni la precisión numérica empleada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento estructurado con trazas de cadena de pensamiento (chain-of-thought) heredadas de los componentes destilados.
- Razonamiento matemático y resolución de problemas lógicos.
- Generación y explicación de código, depuración asistida y resolución de problemas de programación.
- Procesamiento multimodal texto-imagen (pipeline `image-text-to-text`).
- Verbosidad adaptativa: combinación de respuestas concisas (componente Polaris) y soluciones paso a paso detalladas.
- Comportamiento "uncensored": rechazos reducidos drásticamente (1/100 frente a 96/100 del original).
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Asistencia conversacional general: el modelo puede mantener diálogos multi-turno y alternar entre respuestas breves y explicaciones detalladas según el contexto, gracias a la mezcla de estilos de sus componentes.
- Tutoría de matemáticas y lógica: los componentes destilados en razonamiento (Opus, Kimi, Polaris) permiten descomponer problemas y presentar soluciones organizadas paso a paso.
- Generación de código en entornos de desarrollo: útil para borradores de funciones, explicación de algoritmos y depuración asistida; el código generado debe ejecutarse y probarse antes de llevarlo a producción.
- Prototipado rápido de aplicaciones multimodales: al heredar el pipeline `image-text-to-text`, sirve para experimentar con descripciones de imágenes o preguntas sobre contenido visual en un modelo de solo 2,2B.
- Investigación sobre fusión de modelos: el checkpoint y su directorio `reproduce` permiten replicar la fusión y la ablación Heretic, útil para estudiar weight merging y técnicas de decensoring.
- Experimentación con modelos sin rechazos: para investigación sobre alineación, seguridad y comportamiento de modelos abliterated en entornos controlados.
- Despliegue en hardware limitado: con ~2,2B parámetros y 4,6 GB de repo, es viable en GPUs de consumo para prototipos y demos locales.

## Benchmarks y rendimiento

La model card no reporta resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) para esta fusión. Solo se publican métricas del proceso Heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 1/100 | 96/100 |
| Divergencia KL | 0,0295 | 0 (por definición) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~4,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 6-8 GB para contextos moderados.
- Cuantización a 8 bits: ~2,5 GB de pesos; a 4 bits: ~1,5 GB, apto para GPUs de consumo con 4-6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100/H100 para servir a múltiples usuarios.
- Cabe en GPUs de consumo: sí, incluso en 8 GB con cuantización.
- Opciones de despliegue: `transformers` (formato nativo safetensors); conversión a GGUF para llama.cpp/Ollama y a formatos compatibles con vLLM/TGI mediante herramientas estándar (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-2B Megamix Heretic) | ~2,2B | No disponible | Apache 2.0 | Fusión de 6 checkpoints + ablación Heretic; sin benchmarks publicados |
| `xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge` (original) | ~2,2B | No disponible | Apache 2.0 | Misma fusión sin decensoring; 96/100 rechazos |
| `Qwen/Qwen3.5-2B` (base de la familia) | ~2B | No disponible | Apache 2.0 | Modelo base oficial; referencia de rendimiento de la familia |
| `Jackrong/Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled` | ~2B | No disponible | No disponible | Componente individual de la fusión, especializado en razonamiento destilado |

## Limitaciones y advertencias

- Modelo experimental sin benchmarks independientes: el rendimiento real, la fiabilidad y la compatibilidad con distintos backends deben evaluarse por separado.
- La fusión no documenta librería exacta, normalización de coeficientes, exclusiones de tensores ni precisión numérica, lo que limita la reproducibilidad completa más allá del directorio `reproduce`.
- Riesgo de alucinación inherente a modelos de 2B, especialmente en tareas de razonamiento prolongado o conocimiento factual.
- El proceso de decensoring (Heretic/ARA) reduce rechazos pero puede alterar comportamientos de seguridad; no es apto para aplicaciones que requieran filtrado de contenido sin capas adicionales de moderación.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.
- Longitud de contexto no especificada; no asumir ventanas largas sin probarlo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el estado experimental desaconseja producción sin evaluación previa.
- El código generado debe probarse siempre antes de su uso real.

## Enlaces

- Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Modelo base de la fusión: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge
- Heretic: https://heretic-project.org
- Componente DavidAU Claude 4.6 HERETIC: https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Componente Jackrong Opus Reasoning Distilled: https://huggingface.co/Jackrong/Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled
- Componente empero-ai Distill: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Componente DavidAU Polaris HighIQ: https://huggingface.co/DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact
- Componente Jackrong Qwopus3.5-v3: https://huggingface.co/Jackrong/Qwopus3.5-2B-v3
- Componente ertghiu256 Kimi and Opus Distillation: https://huggingface.co/ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation
- Dataset TeichAI/polaris-alpha-1000x: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Dataset Ali-Yaser/KIMI-K2.5-450000x-ShareGPT: https://huggingface.co/datasets/Ali-Yaser/KIMI-K2.5-450000x-ShareGPT
- Dataset allenai/tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
