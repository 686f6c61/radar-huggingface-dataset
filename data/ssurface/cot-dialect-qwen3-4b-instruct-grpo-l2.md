# ssurface/cot-dialect-qwen3-4b-instruct-grpo-l2

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l2` es un adaptador LoRA (librería PEFT) desarrollado por ssurface (Anatolii Frolov) que modifica el comportamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para razonar en un "dialecto de compresión" de cadena de pensamiento de nivel L2. Este nivel corresponde a prosa comprimida o pasos numerados con viñetas, en contraste con el razonamiento verboso estándar. El objetivo es reducir la longitud de las cadenas de razonamiento manteniendo la precisión en problemas matemáticos, lo que resulta relevante para aplicaciones que requieren respuestas más cortas y económicas en tokens.

El adaptador se entrenó mediante GRPO (Group Relative Policy Optimization) sobre un modelo previamente ajustado con SFT (supervised fine-tuning) en el mismo nivel L2. El conjunto de entrenamiento consistió en 6950 ejemplos del split de entrenamiento de GSM8K, reexpresados a nivel L2 por un modelo profesor, con una longitud mediana de cadena de 140 caracteres. El modelo alcanza un 90,0% de precisión exacta en el test de GSM8K (n=1317, decodificación greedy, sin ejemplos ni self-consistency), lo que supone una mejora de +0,2 puntos porcentuales respecto al modelo SFT previo (89,8%).

El adaptador tiene un tamaño de repositorio de 0,1 GB y se distribuye bajo licencia Apache 2.0. Es importante destacar que el adaptador debe apilarse sobre el modelo SFT correspondiente (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l2`), no directamente sobre el base, ya que se entrenó contra el modelo SFT fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) + adaptador LoRA |
| Parametros totales | 4B (modelo base) + adaptador LoRA r=16 (parametros del adaptador no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no indicada en la informacion del adaptador) |
| Tipos de cuantizacion | No especificados (el adaptador se publica en bfloat16; el modelo base admite cuantizaciones estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parámetros con atención de ventana deslizante y mecanismos de razonamiento híbrido (modo pensante y no pensante). El adaptador LoRA se entrena con r=16 y alpha=32, y se aplica sobre el modelo SFT fusionado correspondiente al nivel L2. El entrenamiento utiliza GRPO con la variante de pérdida `dapo`, recompensas de corrección y formato, 8 generaciones por prompt, batch de 16 con acumulación de gradientes de 2, longitud máxima de completado de 256 tokens, tasa de aprendizaje de 1e-5 y coeficiente KL de 0.0. El conjunto de prompts de entrenamiento es `gsm8k_grpo_balanced_1k.json`. El hardware utilizado fue una NVIDIA A100 de 80 GB. Una nota relevante del autor indica que se verificó que todas las matrices `lora_B` del adaptador son no nulas, descartando 13 adaptadores que fallaron esta comprobación.

## Capacidades

- Razonamiento matemático: resuelve problemas de palabras aritméticas de nivel GSM8K con precisión exacta del 90,0% en el test.
- Cadena de pensamiento comprimida: genera razonamientos en formato L2 (prosa comprimida o pasos con viñetas), con una mediana de 140 caracteres dentro de la etiqueta `thinking`.
- Generación de texto: mantiene las capacidades de generación de texto del modelo base Qwen3-4B-Instruct.
- Formato de respuesta estructurado: produce salidas con un bloque `thinking...response` seguido de `#### <respuesta>`.
- Multilingüe: el modelo base es multilingüe, pero el adaptador se entrena y evalúa únicamente en inglés.
- Sin soporte de tool calling, visión ni audio: el adaptador no añade estas capacidades.

## Casos de uso

- Tutoría de matemáticas en línea: el modelo puede generar explicaciones paso a paso de problemas aritméticos con un razonamiento conciso, adecuado para plataformas educativas que necesitan respuestas breves y claras.
- Evaluación automatizada de razonamiento: integración en pipelines que requieren verificar la corrección de soluciones matemáticas, aprovechando la precisión del 90% en GSM8K.
- Optimización de costes de inferencia: al generar cadenas de razonamiento más cortas (140 caracteres frente a cientos en niveles verbosos), reduce el consumo de tokens y la latencia en aplicaciones de alto volumen.
- Generación de datos sintéticos de razonamiento: el modelo puede producir ejemplos de CoT comprimido para entrenar o evaluar otros modelos, especialmente en entornos con restricciones de presupuesto de tokens.
- Chatbots de asistencia académica: integración en asistentes conversacionales que responden preguntas de matemáticas con explicaciones breves, manteniendo la fluidez del diálogo.
- Investigación en compresión de razonamiento: sirve como referencia para estudiar el equilibrio entre longitud de cadena de pensamiento y precisión, comparándolo con otros niveles L1-L5 de la misma familia.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (verificados: false):

| Modelo | GSM8K test (exact match, greedy) |
|---|---|
| Tras SFT (nivel L2) | 89,8% |
| Tras GRPO (este adaptador) | 90,0% |
| Diferencia | +0,2 pp |

No se han publicado resultados de benchmarks en la informacion disponible más allá de GSM8K. No hay comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en bfloat16 requiere aproximadamente 8 GB de VRAM; el adaptador LoRA añade un overhead mínimo (~0,1 GB). Con cuantización de 4 bits, el requisito baja a unos 3-4 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior es suficiente para inferencia en bfloat16; una A100 80 GB es adecuada para entrenamiento (como la usada por el autor).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3080, RTX 4070).
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` y `peft` en Python; también es compatible con servidores de inferencia que soporten adaptadores LoRA (por ejemplo, vLLM con soporte de LoRA, aunque no está verificado en la documentación del autor).
- Latencia y throughput: no se han publicado métricas específicas; la latencia dependerá del hardware y de la longitud de las secuencias generadas (máximo 256 tokens de completado).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de razonamiento matemático de tamaño similar. La comparación más directa es con el modelo base `Qwen/Qwen3-4B-Instruct-2507` sin adaptador, que en su configuración estándar genera cadenas de razonamiento más largas (mediana de 532 caracteres en nivel L1) y no está optimizado para compresión. No se han publicado resultados de GSM8K para el modelo base en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas de palabras matemáticas (GSM8K); no se garantiza rendimiento en otras tareas de razonamiento.
- La precisión cae con la dificultad del problema, especialmente en los niveles de compresión más agresivos (L2 es moderado, pero la caída es más rápida en niveles superiores).
- El adaptador debe cargarse sobre el modelo SFT correspondiente (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l2`), no directamente sobre el base; cargarlo sobre el base no reproducirá los resultados declarados.
- Variabilidad estadística: con n=1317, el intervalo de confianza del 95% tiene un ancho de ~2,7 puntos porcentuales; diferencias de unos pocos puntos pueden deberse al azar.
- Solo soporta inglés (idioma de entrenamiento y evaluación).
- Riesgo de alucinación en problemas fuera de la distribución de entrenamiento, como cualquier modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (Qwen3-4B-Instruct-2507) para cumplir con sus términos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adapter SFT previo: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l2
- Paper técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio de la familia de dialectos (referencia): https://huggingface.co/ssurface/qwen3-4b-grpo-l2
