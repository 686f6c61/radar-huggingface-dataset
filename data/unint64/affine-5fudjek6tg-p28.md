# unint64/Affine-5fudjek6tg-p28

## Resumen

Affine-5fudjek6tg-p28 es un checkpoint de razonamiento desarrollado por el usuario `unint64` como parte de un bucle de entrenamiento experimental denominado `/mining/ralph`. Se trata de una iteración (candidato p28) sobre el modelo base `vera6/affine-5g4yy75zuz-t6`, que a su vez es un modelo de la familia Affine basado en la arquitectura Qwen3.5-MoE. El objetivo de este checkpoint es mejorar la capacidad de razonamiento del modelo mediante un método de optimización por refuerzo (HiAlpha-GRPO) con un teacher anclado, utilizando el corpus de turnos de codificación SWE.

El modelo tiene 34.660.610.688 parámetros (34,7B) y emplea una arquitectura de mezcla de expertos (MoE) con 256 expertos y 8 activos por token, 40 capas y hidden size 2048. Está diseñado para tareas de generación de texto e imagen-texto (pipeline `image-text-to-text`), aunque la model card se centra en razonamiento y generación de código. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Es un checkpoint de investigación, no un modelo de producción validado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE, 40 capas, hidden 2048, 256 expertos / 8 activos) |
| Parametros totales | 34.660.610.688 (34,7B) |
| Parametros activos | 8 expertos activos por token (no se especifica el número de parámetros activos en valor absoluto) |
| Longitud de contexto | 6144 (máximo de secuencia en entrenamiento; contexto nativo no especificado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), sharded en 2 archivos (`model-00001-of-00002`, `model-00002-of-00002`) + `model.safetensors.index.json` + `model-visual.safetensors` |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura estándar `Qwen3_5MoeForConditionalGeneration` sin código personalizado (no hay `auto_map` ni archivos `.py`). Es un transformer de mezcla de expertos (MoE) con 40 capas, hidden size 2048, 256 expertos en total y 8 expertos activos por token. Esta configuración permite mantener un coste computacional relativamente bajo en inferencia al activar solo una fracción de los parámetros por token, aunque el tamaño total del modelo es de 34,7B.

El entrenamiento se realizó mediante **HiAlpha-GRPO** (una variante de GRPO con LoRA) sobre el checkpoint p24, que a su vez fue entrenado sobre el modelo base `vera6/affine-5g4yy75zuz-t6`. El método usa un teacher congelado (`zai-org/GLM-4.5-Air-FP8`) para calcular recompensas por muestra basadas en log-probabilidades (k=3 referencias), con una temperatura τ=0.03. La recompensa combina un término de razón (Reason) con una penalización por longitud de pensamiento (solo si |z|≥220). Se aplicó un tail-boost de 2.0 al mejor miembro del grupo. Los hiperparámetros incluyen lr=5e-6, LoRA r=16/α=128/dropout=0.05, grupo de tamaño 4, 200 pasos, y máximo de tokens nuevos en el muestreo de pensamiento de 64. El entrenamiento duró aproximadamente 75 minutos en 4 GPUs H100 (de un total de 8, las otras 4 se usaron para los teachers). Solo se entrenaron 8,36M parámetros (0,024% del total) mediante LoRA sobre las proyecciones q, k, v, o, gate, up y down.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo produce un "thought" (z) antes de la respuesta final, siguiendo el contrato de chat del validador (etiqueta `THOUGHT` + último bloque bash cerrado).
- Generación de código: entrenado sobre un corpus de turnos de codificación SWE, es adecuado para tareas de programación y resolución de issues.
- Procesamiento de imagen-texto: el pipeline declarado es `image-text-to-text`, aunque la model card no detalla capacidades visuales específicas.
- Soporte de tool calling: no se menciona en la documentación.
- Soporte de agentes y multi-step reasoning: no se especifica, pero el entrenamiento con pensamiento explícito sugiere capacidad de razonamiento encadenado.
- Capacidades multilingües: no disponibles.
- Modo thinking: sí, el modelo genera un pensamiento intermedio (z) antes de la respuesta, lo que es una forma de modo razonamiento.

## Casos de uso

- Investigación en optimización por refuerzo para razonamiento: este checkpoint sirve como banco de pruebas para evaluar la eficacia de HiAlpha-GRPO con teacher anclado en modelos MoE de gran tamaño. Los investigadores pueden reproducir el pipeline de entrenamiento y comparar métricas de razón.
- Generación de código en entornos controlados: dado su entrenamiento en turnos de codificación SWE, puede usarse para autocompletar o generar parches en repositorios de código, siempre con supervisión humana debido a su naturaleza experimental.
- Evaluación de modelos de razonamiento: se puede utilizar como candidato en duelos locales (como el descrito en la model card) para medir la calidad del razonamiento frente a otros checkpoints, usando el mismo protocolo de evaluación (Reason score con teacher).
- Desarrollo de agentes de razonamiento con pensamiento explícito: su capacidad de generar un "thought" antes de actuar lo hace adecuado para prototipos de agentes que requieren planificación, aunque sin garantías de robustez.
- Benchmarking de infraestructura de inferencia: al ser un modelo MoE de 34,7B, sirve para probar despliegues con vLLM (TP=2) y medir throughput y latencia en hardware de gama alta.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede usarse como base para nuevos ciclos de GRPO o fine-tuning supervisado, dado que su licencia Apache 2.0 permite derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación local comparando el candidato p28 con el modelo base `vera6/affine-5g4yy75zuz-t6` (el "king") usando el protocolo Reason v4 (k=3, τ=0.03) sobre una muestra de n=160. Los resultados son:

| Metrica | Candidato (p28) | King (t6) |
|---|---|---|
| Mean Reason | 0.01184 | 0.00995 |
| Mediana \|z\| | 144 | 145 |
| B-pass | 0.46 | 0.49 |

- Margen: +0.00189 · SE 0.00149 · z +1.27 · n=160
- win_frac: 0.40 · mediana Δ: 0 · p90 Δ: +0.00943 · contribución top-5%: +0.00288
- Gates: longitud de pensamiento PASS (≥80), causalidad B PASS (≥0.30)
- Veredicto local: BELOW_BAR (el umbral para "crown" es 0.0030 en esta muestra, y n=160 es insuficiente frente al duelo real de n=1300)

Estos datos son de una evaluación interna, no de benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 70,2 GB (tamaño del repositorio). Para inferencia con vLLM TP=2 se necesita al menos 2 GPUs con 40 GB cada una, o una GPU con 80 GB (H100/A100). No se han publicado cuantizaciones, por lo que no hay opciones de menor VRAM.
- GPU recomendadas: 8× NVIDIA H100 80GB PCIe para entrenamiento; para inferencia se usó vLLM con TP=2 sobre H100. Una sola GPU de 80 GB (H100, A100) es suficiente para cargar el modelo en bf16.
- En consumer GPU: no es viable sin cuantización. Con cuantización 4-bit (no publicada) podría caber en una RTX 4090 (24 GB) o similar, pero no hay archivos GGUF ni AWQ disponibles.
- Opciones de despliegue: vLLM (probado con TP=2), posiblemente TGI o llama.cpp si se generan cuantizaciones, pero no hay soporte oficial documentado.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un MoE con 8 expertos activos, el throughput debería ser superior al de un modelo denso de 34B, pero no hay cifras.

## Comparativa con modelos similares

El modelo pertenece a la categoría de MoE de ~30-40B parámetros totales con pocos parámetros activos. Se puede comparar estructuralmente con:

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Affine-5fudjek6tg-p28 (este) | 34,7B | 8/256 expertos (no cuantificado) | 6144 (entrenamiento) | Apache 2.0 | HuggingFace |
| Qwen3-30B-A3B | 30,5B | 3,3B | 128K (nativo) | Apache 2.0 | HuggingFace |
| Mixtral 8x22B | 39,1B | 12,9B | 64K | Apache 2.0 | HuggingFace |

No se dispone de benchmarks comparativos entre estos modelos. La comparación es estructural: el modelo Affine tiene más expertos totales (256) pero menos activos (8), lo que puede reducir coste por token, aunque su contexto de entrenamiento es mucho menor (6144 frente a 128K de Qwen3-30B-A3B). No hay datos de rendimiento para una comparación justa.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint intermedio de un bucle de investigación, no un modelo de producción. No ha sido sometido a pruebas de robustez, seguridad o sesgos.
- Sesgos y alucinación: no se han evaluado. Al estar entrenado con GRPO sobre un corpus de código, puede presentar alucinaciones en tareas de razonamiento o generar código incorrecto.
- Longitud de contexto limitada: el máximo de secuencia en entrenamiento es 6144 tokens, muy inferior a modelos modernos. Para tareas con contexto largo, puede degradarse.
- Idiomas: no se especifica qué idiomas soporta; probablemente entrenado principalmente con datos en inglés (corpus SWE).
- Sin cuantizaciones: solo se distribuyen pesos en bf16, lo que dificulta el despliegue en hardware de consumo.
- Veredicto de calidad: la evaluación local indica que el candidato no supera el umbral para "crown" (mejora estadísticamente significativa) frente al modelo base, por lo que su ventaja no está probada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se ofrece sin garantías de ningún tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unint64/Affine-5fudjek6tg-p28
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6
- Teacher usado (referencia): https://huggingface.co/zai-org/GLM-4.5-Air-FP8
- Repositorio de experimentos: no se proporciona enlace público (ruta interna `/mining/ralph/`)
