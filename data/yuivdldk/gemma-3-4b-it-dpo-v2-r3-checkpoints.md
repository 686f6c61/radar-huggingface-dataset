# Yuivdldk/gemma-3-4b-it-dpo-v2-r3-checkpoints

## Resumen

Este repositorio contiene los 17 checkpoints intermedios de un experimento de alineación mediante Direct Preference Optimization (DPO) sobre el modelo base `google/gemma-3-4b-it`. No se trata de un modelo final listo para producción, sino de un artefacto de investigación que registra la trayectoria completa de entrenamiento de un adaptador LoRA durante 83 pasos de optimización. El autor, Yuivdldk, ha publicado los pesos intermedios junto con telemetría de entrenamiento y manifiestos de verificación, lo que permite analizar la evolución del modelo durante el ajuste por preferencias.

El experimento utiliza 662 ejemplos pareados del conjunto de entrenamiento de MATH (niveles 4 y 5) con hiperparámetros específicos: `beta=0.1`, `lr=5e-6`, `r=16`, `lora_alpha=32`. El modelo base, Gemma 3 4B IT, es un transformer multimodal de 4 mil millones de parámetros desarrollado por Google DeepMind, con ventana de contexto de 128K tokens y soporte para más de 140 idiomas. Este repositorio es relevante para investigadores interesados en el comportamiento de DPO durante el entrenamiento, la dinámica de la pérdida y la recompensa, y la reproducibilidad de experimentos de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer multimodal (Gemma 3 4B IT) |
| Parametros totales | No disponible (el modelo base tiene 4B; los adaptadores son de rango 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en safetensors, sin cuantizacion) |
| Idiomas soportados | No disponible (el modelo base soporta 140+ idiomas) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino adaptadores LoRA entrenados sobre `google/gemma-3-4b-it` (revision `093f9f388b31de276ce2de164bdc2081324b9767`). El entrenamiento se realizó con DPO, un método que alinea el modelo con preferencias humanas sin necesidad de un modelo de recompensa separado. Se utilizaron 662 pares de respuestas preferidas y rechazadas extraídas del pool de entrenamiento de MATH (niveles 4 y 5), con un total de 83 pasos de optimización. Los checkpoints se guardaron cada 5 pasos, más el paso final 83, generando 17 puntos de control.

Los hiperparámetros del experimento son: `beta=0.1` (temperatura de DPO), `lr=5e-6`, `r=16` (rango del adaptador LoRA) y `lora_alpha=32`. El repositorio incluye `training_diagnostics.json` con telemetría paso a paso (pérdida, margen de recompensa, norma del gradiente, entropía) y `TRAINING_COMPLETE.json` con verificación formal y manifiesto sha256 de todos los checkpoints. No se proporcionan detalles sobre la composición exacta del dataset más allá de los pares de MATH, ni sobre técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Al ser un conjunto de adaptadores LoRA intermedios, las capacidades funcionales son las del modelo base Gemma 3 4B IT, que incluyen generación de texto, razonamiento matemático, comprensión de imágenes (multimodal) y soporte multilingüe.
- El ajuste DPO está orientado a mejorar la alineación con preferencias en problemas de matemáticas de nivel 4-5, por lo que los checkpoints pueden mostrar una mejora progresiva en tareas de razonamiento matemático.
- No se ha publicado ninguna evaluación independiente de estos checkpoints, por lo que no se puede afirmar un rendimiento concreto en tareas específicas.
- El repositorio no incluye soporte de tool calling, function calling ni capacidades de agente más allá de las que ya posee el modelo base.

## Casos de uso

- Investigación en alineación de modelos: los checkpoints permiten estudiar cómo evoluciona la pérdida de DPO, el margen de recompensa y la entropía a lo largo del entrenamiento, lo que es útil para diseñar mejores estrategias de alineación.
- Análisis de trayectoria de entrenamiento: los 17 puntos de control facilitan el análisis de la dinámica de convergencia y la detección de posibles overfitting o inestabilidades en el ajuste por preferencias.
- Reproducibilidad de experimentos: al incluir telemetría y manifiestos sha256, el repositorio sirve como referencia para reproducir el experimento o comparar con otras semillas o configuraciones.
- Estudio de la influencia de hiperparámetros: se puede analizar el efecto de `beta`, `lr` y `r` en la calidad del alineamiento, comparando con otros experimentos similares.
- Desarrollo de adaptadores para matemáticas: aunque no es un modelo final, los checkpoints pueden servir como punto de partida para continuar el entrenamiento o para extraer el adaptador final (paso 83) y evaluarlo en tareas de razonamiento matemático.
- Educación y formación en DPO: el repositorio es un ejemplo práctico de cómo estructurar un experimento de DPO con checkpoints intermedios, útil para cursos o tutoriales sobre alineación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni otros conjuntos de referencia. Tampoco se comparan los checkpoints con el modelo base o con otros modelos.

## Requisitos de hardware

- Para cargar el modelo base `google/gemma-3-4b-it` junto con un adaptador LoRA, se necesita aproximadamente 8 GB de VRAM en FP16 (el modelo base tiene 4B parámetros). Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes), la VRAM requerida baja a unos 4-5 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para mayor margen. También puede ejecutarse en GPUs de 8 GB como la RTX 3070 o la RTX 4060 Ti con cuantización.
- El modelo cabe en GPUs de consumo medio-alto; con cuantización 4 bits puede ejecutarse en tarjetas de 6-8 GB.
- Opciones de despliegue: al ser adaptadores LoRA, se pueden integrar con bibliotecas como Hugging Face Transformers, PEFT, vLLM (con soporte de LoRA), llama.cpp (si se fusionan los pesos) u Ollama (si se convierte a GGUF).
- La latencia y el throughput dependen del hardware y del formato de cuantización. En una RTX 4090, el modelo base 4B en FP16 genera aproximadamente 50-80 tokens por segundo; con cuantización 4 bits, el throughput puede aumentar ligeramente.

## Comparativa con modelos similares

Dado que este repositorio no es un modelo final, la comparación se realiza a nivel del modelo base y de la metodología:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `google/gemma-3-4b-it` (base) | 4B | 128K | Gemma | Modelo multimodal, instrucciones, 140+ idiomas |
| `Yuivdldk/gemma-3-4b-it-dpo-v2-r3-checkpoints` | Adaptadores LoRA (r=16) | 128K | Gemma | Checkpoints intermedios de DPO sobre MATH |
| `google/gemma-3-1b-it` | 1B | 128K | Gemma | Versión más pequeña, menos capacidad |
| `google/gemma-3-12b-it` | 12B | 128K | Gemma | Versión más grande, mayor VRAM requerida |

No se dispone de datos de rendimiento comparativo, ya que no se han publicado evaluaciones de los checkpoints.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo final listo para uso en producción; es un conjunto de checkpoints intermedios de un experimento de investigación.
- No se ha realizado ninguna evaluación de sesgos, alucinaciones o seguridad sobre estos adaptadores. El modelo base puede presentar sesgos conocidos de los datos de entrenamiento de Gemma 3.
- El entrenamiento se realizó únicamente con 662 ejemplos de MATH, lo que puede provocar overfitting en problemas de matemáticas y degradación en otras tareas.
- La licencia Gemma impone restricciones de uso comercial: no se permite el uso para ciertos fines (por ejemplo, armas, vigilancia masiva) y se requiere atribución. Consulte los términos completos de Google.
- No se garantiza la estabilidad de los checkpoints intermedios; algunos pasos pueden mostrar pérdidas o comportamientos erráticos.
- El repositorio no incluye el modelo base, solo los adaptadores. Para utilizarlos, es necesario descargar `google/gemma-3-4b-it` por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yuivdldk/gemma-3-4b-it-dpo-v2-r3-checkpoints
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-3-4b-it
- Página oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Ejemplo de DPO multimodal con Gemma 3 (notebook de Google Tunix): https://github.com/google/tunix/blob/main/examples/vl_dpo_gemma3.ipynb
