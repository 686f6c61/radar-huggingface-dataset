# tahamajs/qwen-2.5-0.5b-refined-landmark-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-refined-landmark-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha realizado una "cirugía de atención": 18 de las 24 capas del decoder han sido sustituidas por el operador `RefinedLandmarkAttention` (LEKAv3, atención lineal con landmarks puntuados por valor) de la librería NeuralOps. Las 6 capas restantes conservan la atención GQA softmax original de Qwen2, dando lugar a una topología híbrida 3:1. El autor es `tahamajs`, creador de NeuralOps.

El modelo no busca ser un sustituto de producción de Qwen2.5-0.5B, sino un artefacto de investigación sobre atención subcuadrática y destilación de conocimiento. Tras el transplante, la perplejidad en WikiText-2 se dispara a 398.558,30; tras dos etapas de destilación de representaciones ocultas sobre WikiText-2, baja a 296,01. El profesor original (Qwen2.5-0.5B sin modificar) obtiene 15,38 en la misma métrica, por lo que la brecha es enorme.

La relevancia actual es metodológica: demuestra un pipeline reproducible (caché offline de representaciones, transplante de pesos con herencia de proyecciones, destilación en dos fases) para evaluar operadores de atención alternativos dentro de un transformer preentrenado. Con licencia MIT y pesos en FP16, sirve como banco de pruebas, no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `RefinedLandmarkAttention` (LEKAv3, lineal) y 6/24 con GQA softmax nativa de Qwen2 |
| Parametros totales | 494 M (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 929,69 MB, mas un adaptador) |
| Idiomas soportados | ingles (segun la model card; el modelo base es multilingue, pero no se valida tras la destilacion) |
| Licencia | MIT |
| Formato de pesos | safetensors en FP16 (checkpoint completo) + adaptador; libreria `neuralops` (PyTorch) |

Detalles adicionales de la arquitectura base: 24 capas, dimensión oculta D=896, 14 cabezas de query, 2 cabezas KV (GQA), dimensión por cabeza 64, RoPE con theta = 1.000.000.

## Arquitectura y entrenamiento

El punto de partida es Qwen2.5-0.5B, un decoder transformer estándar con GQA. NeuralOps aplica una proporción determinista `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por `RefinedLandmarkAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atención softmax original para preservar el enrutamiento contextual global y las cabezas de inducción. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación, evitando el colapso de proyecciones no inicializadas. El operador soporta causalidad autoregresiva, GQA y RoPE, y dispone de despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en destilación de conocimiento de representaciones ocultas en dos etapas, ejecutada sobre WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, batch 8 y acumulación de gradiente 4, en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 110 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layernorms con AdamW (lr 2e-4, weight decay 0,01, clipping 1,0) minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 no está descrita en la información disponible.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base y parcialmente recuperada mediante destilación.
- Razonamiento y conocimiento factual: degradados de forma severa respecto al profesor (PPL 296,01 frente a 15,38), por lo que no son fiables.
- Soporte de tool calling / function calling: no disponible; no se ha validado tras la cirugía.
- Soporte de agentes y razonamiento multi-paso: no disponible; el checkpoint es un artefacto de investigación.
- Capacidades multilingües: no validadas; la model card declara únicamente inglés.
- Modo thinking, visión o audio: no soportados.
- Capacidad especial: es un banco de pruebas de atención lineal subcuadrática (LEKAv3) con topología híbrida y adaptador compatible con la API de Qwen2.

## Casos de uso

- Investigación en atención subcuadrática: servir de referencia reproducible para medir el coste en perplejidad de sustituir atención softmax por un operador lineal en un transformer compacto, usando la tabla de telemetría de la model card como línea base.
- Estudio de destilación de representaciones: evaluar el protocolo de dos etapas (alineamiento de subespacio con backbone congelado y ajuste posterior) sobre otros operadores o ratios híbridos, comparando la recuperación del 99,93% del pico post-cirugía.
- Benchmarking de kernels: validar el despacho CUDA/Triton/PyTorch del operador `RefinedLandmarkAttention` en hardware consumer (RTX 3090) y comparar latencia y memoria frente a la atención GQA nativa.
- Análisis de topologías híbridas: experimentar con la proporción 3:1 y sus índices de capa para determinar qué capas requieren atención softmax como anclas de recuperación global.
- Docencia y divulgación: ilustrar de forma práctica qué ocurre al transplantar pesos entre mecanismos de atención distintos y por qué la inicialización desde el profesor (herencia de `q_proj`/`k_proj`/`v_proj`/`o_proj`) es crítica.
- Pruebas de integración de NeuralOps: verificar la compatibilidad del adaptador `QwenAttentionAdapter` con la API de `transformers` para Qwen2 y el manejo de GQA y RoPE con theta 1.000.000.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en la partición de validación de WikiText-2 con longitud de secuencia 512:

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 |
| Perplejidad del alumno tras cirugía, sin destilar | 398.558,30 |
| Perplejidad del alumno tras destilación | 296,01 |
| Delta absoluto de perplejidad | −398.262,29 |
| Reducción relativa de perplejidad | 99,93% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,9 GB en FP16 (929,69 MB de pesos más estados de activación y caché KV); en cuantización de 8 bits o 4 bits sería menor, pero no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor usó una RTX 3090 de 24 GB para la destilación.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la librería `neuralops` es el entorno previsto; la integración con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible, y los kernels lineales del operador probablemente no estén soportados por esos motores sin trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + RefinedLandmarkAttention) | 494 M | no disponible | 296,01 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32.768 tokens | no disponible en la informacion | Apache 2.0 | Hugging Face |

La comparación con alternativas de atención lineal (Mamba, RWKV, RetNet) no está disponible en la información proporcionada. Frente al profesor, la diferencia de perplejidad es de aproximadamente 19×, lo que sitúa al checkpoint fuera del rango de uso práctico como generador.

## Limitaciones y advertencias

- Perplejidad muy elevada (296,01 frente a 15,38 del profesor): la calidad de generación es previsiblemente pobre y no apta para producción.
- Sesgos: no evaluados; el modelo base Qwen2.5 incorpora sesgos de sus datos de preentrenamiento que la destilación sobre WikiText-2 no corrige ni mitiga.
- Riesgo de alucinación: alto, agravado por la degradación del modelado del lenguaje.
- Contexto e idioma: la model card no confirma el contexto efectivo tras la cirugía ni valida idiomas distintos del inglés; el uso multilingüe no está respaldado.
- Licencia MIT: permite uso comercial, pero al derivar de Qwen2.5-0.5B (Apache 2.0) conviene revisar las obligaciones de atribución del modelo base.
- Caveat de producción: los kernels lineales requieren la librería `neuralops`; la compatibilidad con motores de inferencia estándar no está garantizada.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El checkpoint está pensado como artefacto de investigación; no debe tratarse como una versión mejorada de Qwen2.5-0.5B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-refined-landmark-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/refined_landmark_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
