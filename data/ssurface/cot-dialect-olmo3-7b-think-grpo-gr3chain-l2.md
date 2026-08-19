# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l2

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-l2` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para producir cadenas de pensamiento (chain-of-thought) en un "dialecto" de compresión de nivel L2: prosa condensada con pasos en viñetas. El adaptador se enmarca en una familia de modelos que estudia cómo la compresión del razonamiento intermedio afecta a la precisión final, con longitudes de cadena que van desde 532 caracteres (nivel L1) hasta 16 (nivel L5), un rango de 33x.

Este modelo concreto es una **ablation de diseño de recompensa**: se entrenó con una variante de recompensa (`gr3`, reescalado multiplicativo de la recompensa positiva con suelo en 0.3) para responder una pregunta concreta sobre diseño de rewards en GRPO, y se publica para que la comparación sea reproducible en lugar de asumirse. No es el modelo principal de su nivel; para ese propósito existe `ssurface/cot-dialect-olmo3-7b-think-grpo-l2`. El adaptador se apila sobre el modelo SFT fusionado del mismo nivel, no sobre el base sin ajustar, y alcanza un 86.3% de exactitud en GSM8K test con decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre transformer decoder `allenai/Olmo-3-7B-Think` (~7.3B parametros) |
| Parametros totales | No disponible (el adaptador es de 0.2 GB; el base ~7.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no declarada en la informacion del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16; el base soporta cuantizacion GGUF via unsloth) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El adaptador se entrena con **GRPO** (Group Relative Policy Optimization) sobre el modelo SFT fusionado del nivel L2, usando `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa` (sin kernels fusionados; el autor documenta que la ruta fusionada producía matrices `lora_B` todas a cero, por lo que verificó `lora_B != 0` en cada adaptador publicado y retuvo 13 que fallaban esa comprobación). La función de recompensa combina cuatro componentes: `correctness` (ponderada por el número de pasos de la solución dorada, de modo que los problemas más difíciles valen más), `format` (exige un bloque `thinking...response` seguido de `#### <respuesta>`), `chain` (un verificador que comprueba que la aritmética escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva combinada con suelo en 0.3; al escalar solo recompensas ya positivas, no puede reordenar respuestas correctas por encima de incorrectas).

El entrenamiento usa loss tipo `dapo`, 8 generaciones por prompt, batch 64x1 con acumulación, máximo de 256 tokens de completion, learning rate 1e-05, coeficiente KL (beta) 0.0 y un conjunto de prompts `gsm8k_grpo_balanced_1k.json`. Los datos de entrenamiento son 6950 ejemplos del train de GSM8K reexpresados a nivel L2 por un modelo teacher, con longitud mediana de cadena de 140 caracteres dentro de `thinking`. El hardware utilizado fue una única NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático: exactitud del 86.3% en GSM8K test (n=1317) con decodificación greedy, sin ejemplos ni self-consistency.
- Generación de cadenas de pensamiento comprimidas en "dialecto" L2: prosa condensada con pasos en viñetas, como se muestra en el ejemplo del autor (cadenas de ~140 caracteres).
- Generación de texto single-turn con formato estructurado: bloque `thinking...response` seguido de `#### <respuesta>`.
- Razonamiento out-of-domain limitado: 8.3% en AIME (n=60), 53.2% en BBH (n=250), 84.8% en SVAMP/transfer (n=250).
- Sin soporte de tool calling, función de agente, visión ni audio: es un adaptador de razonamiento textual puro.
- Multilingüe: no, solo inglés.

## Casos de uso

- **Investigación en diseño de recompensas para RL**: el propósito declarado del modelo es permitir rerun de la comparación de rewards del paper. Un investigador puede reproducir el experimento cargando el adaptador y comparando su GSM8K con el del modelo principal `grpo-l2` para aislar el efecto del componente `gr3`.
- **Estudio de compresión de chain-of-thought**: permite analizar cómo la longitud de la cadena de razonamiento (mediana de 140 caracteres en L2) afecta a la precisión frente a niveles L1 (532 caracteres) o L5 (16), útil para decidir el punto de equilibrio entre coste de inferencia y calidad.
- **Verificación de robustez del pipeline de entrenamiento**: el adaptador sirve como artefacto de control para validar que el flujo SFT + GRPO con `sdpa` produce adaptadores funcionales (con `lora_B != 0`), frente a la ruta con kernels fusionados que fallaba silenciosamente.
- **Benchmarking de razonamiento comprimido**: con sus métricas publicadas en GSM8K, AIME, BBH y SVAMP, puede usarse como punto de referencia para evaluar otros métodos de compresión de CoT en modelos de 7B.
- **Educación y divulgación sobre RLHF/GRPO**: al ser un adaptador pequeño (0.2 GB) con licencia Apache-2.0, es adecuado como caso de estudio reproducible en cursos o tutoriales sobre entrenamiento con recompensas y LoRA.
- **Generación de soluciones concisas a problemas aritméticos**: para aplicaciones donde se requiere una respuesta breve con pasos mínimos verificables (p. ej., sistemas de tutoría que muestran el razonamiento en formato condensado), el modelo produce cadenas cortas y comprobables.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (decodificación greedy, single-turn, sin ejemplos ni self-consistency):

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test) | 1317 | 86.3% |
| AIME | 60 | 8.3% |
| BBH | 250 | 53.2% |
| SVAMP/transfer | 250 | 84.8% |

El autor advierte que GSM8K es la métrica principal; AIME, BBH y SVAMP son evaluaciones out-of-domain complementarias. El intervalo de confianza al 95% es de aproximadamente ±2.7 puntos porcentuales en n=1317 y ±4.4 en n=500, por lo que diferencias de un par de puntos están dentro del ruido. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (configuración documentada por el autor).
- Inferencia: el adaptador LoRA (0.2 GB) se carga sobre el base Olmo-3-7B-Think (~7.3B en bfloat16, ~15 GB en fp16), por lo que cabe en GPUs consumer con 16-24 GB de VRAM, como RTX 4090 o RTX 4080, con cuantización del base.
- Con cuantización GGUF del base (disponible vía `unsloth/Olmo-3-7B-Think-GGUF`), el conjunto puede ejecutarse en GPUs de 8 GB, aunque el adaptador PEFT requiere el formato transformers/peft y no se puede aplicar directamente sobre GGUF sin conversión.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado), `vLLM` (si soporta el base y el adaptador), `llama.cpp`/`Ollama` solo para el base cuantizado, sin el adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | GSM8K | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-gr3chain-l2` (este) | LoRA sobre Olmo-3-7B-Think | 86.3% | No disponible | Apache-2.0 | Ablation de reward `gr3` |
| `cot-dialect-olmo3-7b-think-grpo-l2` (modelo principal del nivel) | LoRA sobre Olmo-3-7B-Think | No disponible | No disponible | Apache-2.0 | Modelo headline del nivel L2, misma compresión |
| `allenai/Olmo-3-7B-Think` (base) | Transformer 7.3B | No disponible | No disponible | Apache-2.0 | Modelo base, razonamiento con CoT visible, entrenado con SFT+DPO+RLVR |

No se dispone de datos de rendimiento del modelo principal `grpo-l2` ni del base en GSM8K en la información proporcionada, por lo que no es posible una comparación cuantitativa directa. El autor indica que este adaptador puede ser peor que el modelo principal del mismo nivel por ser un artefacto de ablation.

## Limitaciones y advertencias

- **Entrenado y evaluado solo en problemas de matemáticas con enunciado verbal** (GSM8K); su rendimiento fuera de ese dominio es limitado (8.3% en AIME, 53.2% en BBH).
- **La precisión cae con la dificultad del problema**, y la caída es más rápida en los niveles comprimidos, según el autor.
- **Artefacto de ablation**: fue entrenado para responder una pregunta concreta sobre diseño de recompensas y puede ser peor que el modelo principal del mismo nivel.
- **Requisito de apilado**: el adaptador se entrena contra el modelo SFT fusionado; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` sin pasar por `ssurface/cot-dialect-olmo3-7b-think-sft-l2` no reproduce el resultado publicado.
- **Variabilidad por semilla**: el autor indica que es un entrenamiento con una sola semilla salvo que el nombre del repo indique lo contrario; diferencias de un par de puntos están dentro del ruido estadístico.
- **Solo inglés**: sin soporte multilingüe.
- **Sin garantías de producción**: es un modelo de investigación con 0 descargas y 0 likes en el momento de la publicación; no hay evidencia de uso en entornos productivos.
- **Riesgo de alucinación**: como cualquier modelo de razonamiento comprimido, la verificación `chain` del entrenamiento reduce pero no elimina el riesgo de errores aritméticos en la cadena; en producción se recomienda validación externa de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l2
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT necesario para el apilado: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l2
- Modelo principal del nivel L2: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l2
- GGUF del base (para despliegue cuantizado): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Entrada en Ollama del base: https://ollama.com/library/olmo-3:7b-think
