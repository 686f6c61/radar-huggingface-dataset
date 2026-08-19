# ssurface/cot-dialect-qwen3-4b-instruct-grpo-sftlen-l4

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-sftlen-l4` es un adaptador LoRA de tipo PEFT que se apila sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` para inducir un "dialecto" de razonamiento comprimido en nivel L4. Este nivel corresponde a cadenas de pensamiento expresadas como asignaciones encadenadas con punto y coma, por ejemplo `K=18*2.5;D=8*4;T=K+D->T=77`, con una longitud mediana de 41 caracteres dentro de la etiqueta `thinking`.

El modelo forma parte de una colección de investigación sobre compresión de cadenas de pensamiento (Chain-of-Thought Compression Dialects), desarrollada por Anatolii Frolov. Este adaptador concreto es un artefacto de ablación: se entrenó bajo una variante de recompensa denominada `sftlen` (penalización por desviación respecto a la longitud de la cadena SFT de cada fila) para permitir la comparación de diseños de recompensa en el paper asociado. No es uno de los modelos principales de la colección, que se publican bajo `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4`.

Su relevancia radica en que permite reproducir y auditar experimentos de diseño de recompensas en entrenamiento GRPO, un aspecto crítico para la investigación en razonamiento y optimización de cadenas de pensamiento. El adaptador ocupa 0.1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador pesa 0.1 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la informacion del adaptador; hereda la del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | No aplica (adaptador LoRA en safetensors); el modelo base puede cuantizarse por separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado del nivel L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`). Usa `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa` (sin kernels fusionados, que producían matrices `lora_B` nulas). La configuración incluye r=16, alpha=32, learning rate 1e-05, KL coefficient beta=0, 8 generaciones por prompt, batch de 64 con 1 acumulación, y max completion de 256 tokens.

La función de recompensa combina cuatro componentes: `correctness` (basado en el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` seguido de `#### <respuesta>`), `sft_length` (penalización por desviación respecto a la longitud de la cadena SFT de esa fila) y `gdpo` (normalización independiente de cada recompensa dentro del grupo para evitar que un componente domine). El tipo de pérdida es `dapo`.

El dataset de entrenamiento es GSM8K train reexpresado al nivel L4 por un modelo profesor: 6976 ejemplos con cadenas de razonamiento de mediana 41 caracteres. El entrenamiento se realizó en una NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas en nivel L4 (asignaciones encadenadas con punto y coma).
- Generación de texto en inglés siguiendo el formato de respuesta estructurado `thinking...response...#### <respuesta>`.
- Específicamente entrenado para problemas de aritmética y matemáticas de nivel GSM8K.
- No soporta tool calling, function calling, visión, audio ni modos de agente.
- No es multilingüe; solo inglés.
- No dispone de modo "thinking" separado; el razonamiento comprimido se integra en la generación estándar.

## Casos de uso

- Investigación en compresión de cadenas de pensamiento: permite estudiar cómo afecta la penalización por longitud (`sft_length`) al rendimiento en problemas matemáticos, comparando con el modelo principal del mismo nivel.
- Reproducción de experimentos de diseño de recompensas en GRPO: al ser un artefacto de ablación, sirve para verificar las conclusiones del paper sobre qué componentes de recompensa son necesarios.
- Evaluación de robustez de modelos comprimidos: se puede usar para medir la degradación de precisión en problemas de dificultad creciente, algo que la model card advierte que ocurre más rápido en niveles comprimidos.
- Benchmarking de adaptadores LoRA apilados: su uso requiere cargar primero el adaptador SFT del nivel L4 y luego este adaptador GRPO, lo que permite validar flujos de trabajo con múltiples adaptadores PEFT.
- Análisis de la influencia de la longitud de cadena en la calidad del razonamiento: comparando con niveles L1 a L5 de la misma familia, se puede cuantificar el trade-off entre compresión y precisión.
- Pruebas de inferencia con modelos pequeños en entornos con recursos limitados: al ser un adaptador de solo 0.1 GB sobre un modelo de 4B, puede ejecutarse en GPUs de consumo moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este adaptador "no fue evaluado por separado" y que los niveles con números reportados son los del conjunto principal de la colección. No se proporcionan métricas como MMLU, GSM8K o HumanEval para este artefacto de ablación.

## Requisitos de hardware

- El adaptador en sí ocupa 0.1 GB, pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 (4B parámetros) más el adaptador SFT del nivel L4 fusionado.
- Para inferencia, el modelo base de 4B puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM si se cuantiza a 4 bits (p. ej. RTX 3060, RTX 4060, RTX 4070). Sin cuantización, se recomiendan 16 GB o más.
- El entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia no requiere ese nivel de hardware.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` directamente. También es compatible con vLLM si se fusiona previamente el adaptador en el modelo base.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssurface/cot-dialect-qwen3-4b-instruct-grpo-sftlen-l4 | Adaptador LoRA (ablacion) | 4B base + 0.1GB adaptador | No especificado | Apache 2.0 | HuggingFace |
| ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4 | Adaptador LoRA (modelo principal del nivel L4) | 4B base + adaptador | No especificado | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | Modelo base instruct | 4B | 32k (segun documentacion oficial de Qwen3) | Apache 2.0 | HuggingFace |

La comparativa se limita a características estructurales, ya que no hay datos de rendimiento publicados para este adaptador. La diferencia principal frente al modelo principal del mismo nivel es la función de recompensa usada en el entrenamiento GRPO: este artefacto incorpora `sft_length` como componente adicional, mientras que el modelo principal probablemente usa otra combinación de recompensas.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de tipo GSM8K; no es adecuado para otras tareas sin fine-tuning adicional.
- La precisión cae con la dificultad del problema, especialmente en niveles comprimidos como L4.
- Es un artefacto de ablación, no un modelo de producción. La model card advierte que puede ser peor que el modelo principal del mismo nivel.
- Requiere apilarse sobre el modelo SFT fusionado del nivel L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`); cargarlo directamente sobre `Qwen/Qwen3-4B-Instruct-2507` no reproducirá los resultados esperados.
- Entrenado con una sola semilla (a menos que el nombre del repo indique lo contrario); diferencias de unos pocos puntos porcentuales pueden deberse al ruido estadístico (intervalo de confianza del 95% de ~2.7 pp con n=1317 y ~4.4 pp con n=500).
- Solo soporta inglés; no hay capacidades multilingües.
- No se han publicado benchmarks independientes para este adaptador.
- Riesgo de alucinación en problemas fuera del dominio de entrenamiento, como cualquier modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-sftlen-l4
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Página del modelo Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
