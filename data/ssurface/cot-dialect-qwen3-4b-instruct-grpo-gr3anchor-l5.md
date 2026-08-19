# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor-l5

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor-l5` es un adaptador LoRA de tipo PEFT que modifica el comportamiento de `Qwen/Qwen3-4B-Instruct-2507` para que el modelo razone en un "dialecto de compresión" de nivel L5, es decir, expresando su cadena de razonamiento como una única expresión colapsada de muy pocos caracteres (mediana de 16 caracteres dentro de la etiqueta `thinking`). El modelo forma parte de una colección de investigación sobre compresión de cadenas de razonamiento (chain-of-thought) y fue desarrollado por el investigador Anatolii Frolov (usuario ssurface).

Este adaptador concreto es un artefacto de ablación: se entrenó con una variante de diseño de recompensa (denominada `gr3anchor`) para poder comparar el impacto de distintas funciones de recompensa en el entrenamiento con GRPO. No es uno de los modelos principales de la colección y no ha sido evaluado de forma independiente; su propósito es permitir reproducir el análisis de diseño de recompensas descrito en el artículo asociado. El entrenamiento se realizó sobre el conjunto GSM8K (6993 ejemplos re-expresados por un modelo profesor) y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | Adaptador ~0.1 GB (repo); modelo base 4B (no disponible el desglose exacto del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (depende del modelo base; el adaptador se distribuye en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4.000 millones de parametros. El entrenamiento se realizo en dos fases: primero se genero un modelo SFT (supervised fine-tuning) fusionado con las cadenas de razonamiento comprimidas a nivel L5, y posteriormente se aplico GRPO (Group Relative Policy Optimization) sobre ese modelo SFT fusionado. El adaptador publicado se debe cargar sobre el adaptador SFT de nivel L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`), no directamente sobre el modelo base, ya que fue entrenado contra el modelo SFT fusionado.

La configuracion de GRPO incluye: 8 generaciones por prompt, batch de 64 con acumulacion de 1, maximo de 256 tokens de completado, learning rate de 1e-05, coeficiente KL (beta) de 0.03, y LoRA con r=16 y alpha=32. La funcion de recompensa combina tres componentes: `correctness` (que pondera la respuesta correcta segun el numero de pasos de la solucion dorada), `format` (que exige un bloque `thinking... response` seguido de `#### <answer>`) y `gr3` (un reescalado multiplicativo de la recompensa positiva con suelo en 0.3). El entrenamiento se ejecuto en una unica GPU NVIDIA A100 de 80 GB, usando `transformers` estandar con atencion `sdpa` en lugar de kernels fusionados, una decision tomada tras detectar que la ruta fusionada producia adaptadores con matrices `lora_B` a cero.

## Capacidades

- Razonamiento matematico comprimido: el modelo genera cadenas de razonamiento extremadamente cortas (mediana de 16 caracteres) dentro de la etiqueta `thinking`, resolviendo problemas de aritmetica y algebra basica del conjunto GSM8K.
- Generacion de texto en formato estructurado: respeta el formato `thinking... response` seguido de `#### <answer>`.
- Adaptacion sobre un modelo base instructivo: hereda las capacidades generales de Qwen3-4B-Instruct-2507 (generacion de texto, seguimiento de instrucciones, razonamiento) aunque el adaptador esta especializado en el estilo comprimido.
- No se han documentado capacidades de tool calling, agentes, vision ni audio en la informacion disponible; el adaptador se evaluo exclusivamente en problemas de matematicas.

## Casos de uso

- Investigacion en compresion de cadenas de razonamiento: el adaptador permite reproducir el experimento de ablacion sobre diseno de recompensas (variante `gr3anchor`) descrito en el articulo, comparando su comportamiento con el modelo principal del mismo nivel.
- Evaluacion de trade-offs entre legibilidad y rendimiento: al generar cadenas de razonamiento de solo 16 caracteres, sirve para estudiar como afecta la compresion extrema a la precision en tareas de matematicas, util en investigacion sobre eficiencia de inferencia.
- Generacion de explicaciones ultra-compactas: en entornos donde el coste de tokens de razonamiento es critico (por ejemplo, pipelines con presupuesto de tokens muy ajustado), el modelo puede producir justificaciones minimas de sus respuestas.
- Benchmark de robustez de GRPO: al ser un artefacto de ablacion, puede usarse como caso de control en experimentos que comparen distintas funciones de recompensa (correctness, format, gr3) sobre el mismo nivel de compresion.
- Validacion de pipelines PEFT: el flujo de carga (SFT + GRPO) documentado en la model card sirve como ejemplo de composicion de adaptadores LoRA en entornos de investigacion.
- Comparacion con modelos de razonamiento estandar: permite medir la perdida de precision al pasar de cadenas de razonamiento verbosas (L1, 532 caracteres de mediana) a expresiones colapsadas (L5, 16 caracteres), un factor relevante para disenar sistemas de IA explicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este adaptador no fue evaluado de forma separada: "This adapter was not separately benchmarked. It exists as a training artefact for the ablation grid". Los niveles que si llevan numeros reportados son los del conjunto principal de la coleccion, no este artefacto de ablacion.

## Requisitos de hardware

- El entrenamiento se realizo en una unica GPU NVIDIA A100 de 80 GB con precision bfloat16.
- Para inferencia, al ser un adaptador LoRA sobre un modelo base de 4B, el modelo fusionado requiere aproximadamente 8-10 GB de VRAM en bfloat16 sin cuantizacion, o entre 4-6 GB con cuantizacion de 4 bits (dependiendo de la implementacion y del contexto).
- Es viable en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4070 Ti Super, siempre que se use cuantizacion adecuada.
- Opciones de despliegue: el flujo documentado usa `transformers` + `peft` con `merge_and_unload()`. Tambien puede exportarse a GGUF para su uso con llama.cpp u Ollama, o servirse con vLLM o TGI tras fusionar el adaptador.
- La latencia y el throughput no estan publicados; al ser un modelo de 4B, se espera un rendimiento moderado (del orden de 50-100 tokens/s en una RTX 4090 con cuantizacion, segun implementacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor-l5 | 4B (base) + LoRA | No disponible | Razonamiento matematico comprimido (L5) con recompensa gr3anchor | Apache 2.0 | HuggingFace (ablation) |
| ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5 | 4B (base) + LoRA | No disponible | Razonamiento matematico comprimido (L5) con recompensa estandar | Apache 2.0 | HuggingFace (modelo principal del nivel) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible | Modelo instructivo general | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo publicados para estos modelos. La comparativa estructural indica que la unica diferencia entre el adaptador de ablacion y el modelo principal del mismo nivel es el componente de recompensa `gr3` (reescalado multiplicativo con suelo), lo que permite aislar su efecto en el analisis experimental.

## Limitaciones y advertencias

- Artefacto de ablacion: fue entrenado para responder una pregunta especifica sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Sin evaluacion independiente: no se han publicado benchmarks de este adaptador; cualquier numero reportado en la coleccion corresponde a los modelos principales, no a este.
- Dominio limitado: entrenado y evaluado exclusivamente en problemas de matematicas (GSM8K); no es adecuado para otras tareas sin validacion previa.
- Degradacion con la dificultad: la precision cae con la dificultad del problema, y la caida es mas pronunciada en los niveles comprimidos como L5.
- Variabilidad estadistica: entrenado con una unica semilla (a menos que el nombre del repo indique lo contrario); diferencias de un par de puntos porcentuales estan dentro del ruido (intervalo de confianza del 95% de aproximadamente ±2.7 puntos porcentuales con n=1317).
- Requiere carga secuencial de adaptadores: debe cargarse primero el adaptador SFT L5 y luego este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados.
- Sesgo de idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion: al operar con cadenas de razonamiento extremadamente cortas, la justificacion generada puede no reflejar fielmente el proceso de calculo real, lo que dificulta la auditoria de respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT previo (requerido para la carga): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Articulo asociado (citado en la model card): "Chain-of-Thought Compression Dialects" de Anatolii Frolov (2026), sin enlace directo disponible en la informacion proporcionada.
