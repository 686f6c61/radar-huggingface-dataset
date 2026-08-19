# ssurface/cot-dialect-olmo3-7b-think-grpo-addlen110-seed7-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-addlen110-seed7-l5` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento de `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7B parámetros de AllenAI, para razonar a un nivel de compresión extremo denominado L5. En este nivel, la cadena de razonamiento interna se colapsa a una única expresión aritmética de aproximadamente 16 caracteres de mediana, frente a los 532 caracteres del nivel L1. El adaptador se entrenó con GRPO sobre un modelo SFT previo del mismo nivel, y forma parte de una familia de "dialectos de compresión de chain-of-thought" que investiga cómo afecta el diseño de recompensas al rendimiento del razonamiento comprimido.

Este checkpoint concreto es una **ablación de diseño de recompensa** (variante `addlen110-seed7`), publicada para permitir reproducir las comparaciones del paper asociado, no como modelo principal de producción. El autor advierte explícitamente que puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`). Su utilidad principal es académica: estudiar la relación entre compresión del razonamiento, señales de recompensa y precisión en tareas matemáticas.

El adaptador se distribuye bajo licencia Apache 2.0, pesa 0.2 GB y requiere cargar primero el adaptador SFT del nivel L5 y luego este adaptador GRPO sobre el modelo base. No es un modelo autónomo: depende completamente de la arquitectura y los pesos de Olmo-3-7B-Think.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre Olmo-3-7B-Think (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, repo de 0.2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | heredada del modelo base (no especificada en la informacion) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base tiene cuantizaciones GGUF comunitarias (p. ej. unsloth) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `allenai/Olmo-3-7B-Think`, un transformer decoder-only de 7B parámetros de la familia Olmo 3 de AllenAI, entrenado sobre el dataset Dolma 3. La variante Think está especializada en razonamiento con chain-of-thought. Sobre este base, el autor aplica un entrenamiento en dos fases: primero un ajuste fino supervisado (SFT) que re-expresa los ejemplos de GSM8K en el dialecto comprimido L5, y después un entrenamiento con GRPO (Group Relative Policy Optimization) usando el trainer `trl.GRPOTrainer` con atención `sdpa` estándar de `transformers`, sin kernels fusionados.

La señal de recompensa combina cinco componentes: `correctness` (precisión ponderada por el número de pasos de la solución dorada), `format` (obligación de una estructura `thinking... response` seguida de `#### <answer>`), `length` (recompensa gradual que empuja la cadena hacia la longitud objetivo del nivel), `chain` (un verificador que comprueba que la aritmética escrita en la cadena es correcta) y `gdpo` (normalización por grupo de cada componente antes de sumar). El entrenamiento usó 8 generaciones por prompt, batch efectivo de 64, máximo de 256 tokens de completación, learning rate 1e-05 y coeficiente KL de 0.01. Se entrenó sobre 6993 ejemplos de GSM8K train re-expresados a nivel L5, en una única NVIDIA A100 80GB.

Un detalle técnico relevante: el autor verificó que todos los adaptadores publicados tienen matrices `lora_B` no nulas, descartando 13 que resultaron matemáticamente inertes al usar kernels fusionados.

## Capacidades

- Razonamiento matemático en GSM8K con una cadena de pensamiento extremadamente comprimida (mediana de 16 caracteres).
- Generación de respuestas con formato estricto: bloque `thinking`, bloque `response` y respuesta final con `#### <answer>`.
- Compresión de razonamiento de nivel L5: la cadena interna se colapsa a una única expresión aritmética.
- No soporta tool calling ni function calling.
- No soporta entrada multimodal (solo texto).
- Capacidad multilingüe limitada: entrenado y evaluado únicamente en inglés.
- No dispone de modo de pensamiento extendido: el "thinking" es deliberadamente mínimo.

## Casos de uso

- Investigación sobre compresión de chain-of-thought: permite comparar cómo distintas señales de recompensa afectan a la precisión cuando el razonamiento se comprime drásticamente. Se usa cargando el adaptador SFT L5 y luego este adaptador GRPO, y evaluando en GSM8K.
- Ablación de diseño de recompensas en RL: sirve para reproducir el experimento `addlen110-seed7` y verificar si la variante de recompensa con penalización de longitud adicional produce diferencias significativas frente al modelo principal L5.
- Estudio de latencia en inferencia: al reducir la cadena de razonamiento a 16 caracteres, el tiempo de generación por respuesta es muy inferior al de un modelo con CoT estándar, lo que permite medir el trade-off entre velocidad y exactitud.
- Evaluación de robustez de verificación aritmética: el componente `chain` verifica la aritmética interna, por lo que el adaptador puede usarse para probar si un modelo puede mantener corrección numérica en expresiones ultra-cortas.
- Benchmark de generalización fuera del dominio: aunque solo se entrenó en GSM8K, puede evaluarse en otros datasets de razonamiento matemático para medir hasta qué punto la compresión L5 transfiere a problemas no vistos.
- Comparación de métodos de normalización de recompensas: la inclusión de `gdpo` permite aislar el efecto de la normalización por grupo frente a otras estrategias de agregación.

## Benchmarks y rendimiento

| Tarea | Dataset | Split | Métrica | Resultado |
|---|---|---|---|---|
| Mathematical Reasoning | GSM8K | test | Accuracy (exact match) | 70.5% |

Resultados declarados por el autor: GSM8K test (n=1317), greedy decoding, single-turn, sin ejemplos y sin self-consistency. El autor indica que la precisión cae con la dificultad del problema y que diferencias de un par de puntos porcentuales están dentro del ruido (95% half-width ~2.7 pp a n=1317). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0.2 GB, pero requiere cargar el modelo base Olmo-3-7B-Think completo.
- En bf16, el modelo base ocupa aproximadamente 14 GB de VRAM, más el adaptador fusionado (~0.2 GB adicionales). Se necesita una GPU con al menos 16 GB (p. ej. RTX 4080/4090, A100 40GB).
- Con cuantización 4-bit del modelo base (GGUF o bitsandbytes), cabría en una GPU de 8 GB (RTX 3070/4060), aunque el adaptador PEFT requiere cargar el modelo en `transformers` y fusionarlo antes de cuantizar.
- Opciones de despliegue: `transformers` + `peft` (carga y fusión del adaptador), `vLLM` (si se fusiona previamente y se sirve el modelo resultante), `llama.cpp`/`Ollama` (solo si se convierte el modelo fusionado a GGUF).
- Latencia y throughput: no disponibles; al ser una ablación de investigación, el autor no publica métricas de servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-addlen110-seed7-l5` (este) | 7B base + LoRA | no disponible | 70.5% | Apache 2.0 | Hugging Face |
| `allenai/Olmo-3-7B-Think` (base) | 7B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal L5) | 7B base + LoRA | no disponible | no publicado | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks del modelo base ni del modelo principal L5 en la información proporcionada, por lo que no es posible una comparación cuantitativa directa. El autor indica que esta ablación puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de GSM8K; no hay evidencia de generalización a otros dominios.
- La precisión cae con la dificultad del problema, y esta caída es más pronunciada en los niveles comprimidos como L5.
- Es una ablación de diseño de recompensa: el autor advierte que puede ser peor que el modelo principal del mismo nivel y que solo responde a una pregunta concreta sobre diseño de recompensas.
- Resultado de una única semilla (seed 7); diferencias de 2-3 puntos porcentuales están dentro del ruido estadístico.
- Requiere cargar primero el adaptador SFT L5 y luego este adaptador GRPO sobre el modelo base; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el resultado publicado.
- Solo soporta inglés; no hay soporte multilingüe.
- El formato de salida es rígido (bloque `thinking`, bloque `response`, `#### <answer>`); cualquier desviación puede romper la evaluación.
- Riesgo de alucinación aritmética: aunque el componente `chain` verifica la aritmética interna durante el entrenamiento, en inferencia no hay garantía de que la expresión generada sea correcta.
- No apto para uso en producción sin una validación externa de las respuestas, dado su carácter experimental y su estrecho dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-addlen110-seed7-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Cuantizaciones GGUF del modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Repositorio de entrenamiento de Olmo 3: https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
