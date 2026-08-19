# ssurface/cot-dialect-olmo3-7b-think-grpo-addlen110-l5

## Resumen

El modelo `ssurface/cot-dialect-olmo3-7b-think-grpo-addlen110-l5` es un adaptador LoRA (técnica PEFT) desarrollado por ssurface sobre el modelo base `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7B parámetros con razonamiento de cadena de pensamiento larga. Este adaptador forma parte de una familia de "dialectos de compresión de CoT" que entrena al modelo para razonar con cadenas de pensamiento extremadamente cortas, en este caso el nivel L5, donde la cadena mediana se reduce a 16 caracteres dentro de la etiqueta `thinking`. Se trata de una ablación de diseño de recompensa (reward `addlen110`) publicada para permitir reproducir comparaciones entre variantes de entrenamiento.

El adaptador se entrena mediante GRPO sobre el modelo SFT fusionado del nivel L5, utilizando el conjunto de entrenamiento de GSM8K reexpresado por un modelo profesor. Su propósito es investigar cómo la compresión de la cadena de pensamiento afecta al rendimiento en razonamiento matemático, y cómo distintas funciones de recompensa influyen en el equilibrio entre precisión y longitud. Aunque el modelo base es totalmente abierto (Apache 2.0), este adaptador es un artefacto de investigación con utilidad principalmente para estudios de compresión de CoT y diseño de recompensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Olmo-3-7B-Think) con adaptadores LoRA (r=16, alpha=32) |
| Parametros totales | no disponible (el modelo base tiene 7B; el adaptador LoRA es de ~0.2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo según la documentacion de Olmo 3) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors sin cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `allenai/Olmo-3-7B-Think`, un modelo Transformer de 7B parámetros preentrenado sobre el corpus Dolma 3 y postentrenado con los datasets Dolci para razonamiento largo, según la documentacion oficial de Olmo 3. El adaptador LoRA se entrena con GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado del nivel L5, es decir, un modelo que ya ha sido ajustado para generar cadenas de pensamiento comprimidas. El entrenamiento utiliza 6993 ejemplos de GSM8K train reexpresados por un modelo profesor, con una cadena mediana de 16 caracteres.

La funcion de recompensa combina cinco componentes: `correctness` (precisión de la respuesta final, ponderada por el numero de pasos de la solucion dorada), `format` (estructura obligatoria `thinking... response` y `#### <answer>`), `length` (recompensa gradual hacia la longitud objetivo), `chain` (verificador aritmetico de las operaciones escritas en la cadena) y `gdpo` (normalizacion independiente de cada recompensa dentro del grupo para evitar dominancia). El entrenamiento se ejecuta con `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`, con 8 generaciones por prompt, batch de 32 con acumulacion de 2, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL 0.01. Se utilizo una unica GPU NVIDIA A100 80GB.

## Capacidades

- Razonamiento matematico: resuelve problemas aritmeticos de nivel GSM8K generando una cadena de pensamiento extremadamente comprimida (nivel L5, mediana de 16 caracteres).
- Generacion de texto: hereda las capacidades generativas del modelo base Olmo-3-7B-Think, aunque el adaptador esta especializado en el formato de respuesta con `thinking` y `response`.
- Sigue instrucciones con un prompt especifico: "Solve this using Level 5 (Extreme). Problem: {your problem}".
- No soporta tool calling, funciones, vision ni audio; es exclusivamente texto.
- Capacidades multilingues: solo ingles (el adaptador y el modelo base estan entrenados en ingles).

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: el adaptador permite estudiar como un modelo mantiene precision en razonamiento matematico cuando la cadena se reduce a una expresion unica, util para analisis de eficiencia cognitiva en LLMs.
- Ablacion de diseño de recompensas: sirve para comparar el efecto del componente `addlen110` frente a otras variantes de recompensa en la misma familia de modelos, permitiendo reproducir experimentos del paper "Chain-of-Thought Compression Dialects".
- Evaluacion de robustez en razonamiento corto: puede usarse como caso de prueba para medir la degradacion de rendimiento cuando se fuerza una longitud de razonamiento minima, comparando con niveles L1 a L4.
- Generacion de explicaciones ultraconcisas: en aplicaciones donde se requiere una respuesta rapida y breve (por ejemplo, asistentes de calculo en tiempo real), el modelo puede producir el resultado con una justificacion minima.
- Benchmarking de verificación aritmetica: la recompensa `chain` valida que las operaciones internas sean correctas, lo que permite estudiar la fiabilidad de las cadenas comprimidas.
- Desarrollo de tecnicas de destilacion de razonamiento: el adaptador puede servir como modelo profesor para entrenar modelos mas pequenos en razonamiento comprimido, aunque su rendimiento limitado (68.1% en GSM8K) lo hace mas adecuado para fines experimentales que productivos.

## Benchmarks y rendimiento

El unico benchmark publicado en la model card es GSM8K test (n=1317), con decodificacion greedy, single-turn, sin ejemplos y sin self-consistency:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test) | Accuracy (exact match) | 68.1% |

No se han publicado resultados comparativos con el modelo base sin adaptador ni con otros modelos de razonamiento en la informacion disponible. La model card advierte que este es un artefacto de ablacion y puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`).

## Requisitos de hardware

- VRAM estimada: el modelo base Olmo-3-7B-Think requiere aproximadamente 14 GB en bf16 para inferencia. El adaptador LoRA anade un overhead minimo (0.2 GB de pesos). Se recomienda al menos 16 GB de VRAM para cargar el modelo completo con el adaptador fusionado.
- GPU recomendadas: NVIDIA A100 80GB (usada en el entrenamiento), RTX 4090 (24 GB), RTX 3090 (24 GB) o cualquier GPU con 16 GB o mas. En GPUs con menos VRAM se puede aplicar cuantizacion al modelo base, aunque no se proporcionan cuantizaciones oficiales para el adaptador.
- Despliegue: se puede usar con `transformers` y `peft` (como se muestra en el codigo de la model card), cargando primero el adaptador SFT del nivel L5 y luego este adaptador GRPO. No se menciona soporte para vLLM, llama.cpp u Ollama, pero al ser un adaptador PEFT estandar podria integrarse con herramientas que soporten LoRA.
- Latencia y throughput: no disponibles. La compresion de la cadena (16 caracteres) reduce drasticamente el numero de tokens generados, lo que implica una latencia menor que el modelo base con cadenas largas, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

No hay datos publicados de benchmarks para comparar directamente este adaptador con otros modelos de razonamiento matematico. Como referencia cualitativa:

| Modelo | Parametros | Contexto | GSM8K (aprox.) | Licencia |
|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-addlen110-l5` (este) | 7B base + LoRA | no disponible | 68.1% | Apache 2.0 |
| `allenai/Olmo-3-7B-Think` (base) | 7B | largo (segun Olmo 3) | no disponible (esperable superior) | Apache 2.0 |
| `unsloth/Olmo-3-7B-Think` (version optimizada) | 7B | largo | no disponible | Apache 2.0 |

La comparacion con otros modelos de razonamiento como Llama-3.1-8B-Instruct o Qwen2.5-7B-Instruct no es posible sin datos de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de nivel GSM8K; no generaliza a otros dominios de razonamiento.
- La precision cae con la dificultad del problema, especialmente en los niveles de compresion mas extremos (como L5).
- Es un artefacto de ablacion: fue entrenado para responder una pregunta especifica sobre diseño de recompensas y puede ser peor que el modelo principal del mismo nivel (`...-grpo-l5`).
- Requiere cargar primero el adaptador SFT del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo con el modelo base; cargar el adaptador GRPO directamente sobre el modelo base no reproduce los resultados publicados.
- El entrenamiento se realizo con una unica semilla, por lo que diferencias de un par de puntos porcentuales pueden deberse a ruido (intervalo de confianza del 95% de ~2.7 pp en n=1317).
- Solo soporta ingles; no hay soporte para otros idiomas.
- No se proporcionan cuantizaciones oficiales ni integraciones con motores de inferencia optimizados, lo que limita su uso en produccion.
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento, aunque la recompensa `chain` verifica la aritmetica interna, no la validez del planteamiento.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-addlen110-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Version optimizada por unsloth: https://huggingface.co/unsloth/Olmo-3-7B-Think
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio de entrenamiento OLMo3: https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
