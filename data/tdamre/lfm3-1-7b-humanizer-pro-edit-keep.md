# Tdamre/LFM3-1.7B-Humanizer-Pro-Edit-Keep

## Resumen

LFM3-1.7B-Humanizer-Pro-Edit-Keep es un adaptador PEFT (LoRA) publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parametros desarrollado por Liquid AI. El adaptador está diseñado específicamente para la edición de prosa procedimental en inglés, con el objetivo declarado de mejorar la claridad de un texto preservando la totalidad de los hechos, cifras, condiciones, incertidumbres y responsables mencionados en el original. No se trata de un modelo autónomo, sino de un ajuste fino de bajo rango que requiere cargar el modelo base por separado.

El interés técnico de esta ficha reside en su transparencia inusual: el autor publica la receta de entrenamiento completa (32 actualizaciones, una época, LoRA de rango 8 con alpha 16, learning rate 5e-5 y semilla 57421), el hash SHA-256 de los pesos y el protocolo de evaluación. Sin embargo, los resultados de dicha evaluación son notablemente modestos: de ocho pasajes de prueba, solo 2 fueron plenamente aceptables, ninguno de los 6 pasajes que requerían edición cumplió su objetivo y los 8 pasajes fueron copiados literalmente tras normalizar espacios en blanco. Se trata, por tanto, de un experimento de investigación más que de una herramienta lista para producción.

El adaptador es relevante como caso de estudio sobre los límites del ajuste fino con conjuntos de datos minúsculos (16 ejemplos de identidad y 16 reescrituras de claridad) y como ejemplo de documentación honesta de resultados negativos. Está disponible únicamente en inglés y bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA de rango 8 (recuento exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base LFM3-1.7B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm-open-license-1.0 (LFM Open License v1.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, fijado a la revisión `0dc4268b561499c648c7ba7c9466bf3d8d01517a`. La arquitectura subyacente del modelo base no se detalla en la información proporcionada; el adaptador en sí es un LoRA de rango 8 con alpha 16, entrenado mediante entropía cruzada supervisada únicamente sobre los tokens objetivo. El entrenamiento consistió en una sola época y 32 actualizaciones sobre un conjunto de datos de 32 ejemplos: 16 ejemplos de identidad (el modelo debe devolver el texto sin cambios) y 16 reescrituras orientadas a mejorar la claridad. Se empleó un learning rate de 5e-5 y la semilla 57421.

El autor indica que los pesos del adaptador se copiaron sin modificar de la primera ejecución de entrenamiento completada, con hash SHA-256 `bf362b8e9186747b70ff0f5d9285fd3afa00b23f325dc69c883bdd96131a2126`. El entorno probado es Python 3.12, PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0; la carga del adaptador en CPU está verificada. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Edición de prosa procedimental en inglés orientada a mejorar la claridad.
- Preservación de hechos: el prompt de sistema instruye a conservar cada hecho, número, condición, incertidumbre y responsable, sin añadir hechos nuevos.
- Modo de identidad: ante textos que ya son claros, el adaptador está entrenado para devolverlos sin cambios.
- Generación de texto condicionada por plantilla de chat (`apply_chat_template`) con `enable_thinking=False`.
- Generación determinista mediante decodificación greedy (`do_sample=False`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni otras capacidades especiales.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Edición de avisos y textos legales internos: el adaptador puede intentar reescribir avisos procedimentales para hacerlos más claros manteniendo cifras y condiciones; no obstante, los resultados publicados muestran que en la práctica tiende a copiar la entrada, por lo que requeriría revisión humana obligatoria.
- Investigación sobre ajuste fino con datos escasos: sirve como caso de estudio reproducible de cómo 32 ejemplos y 32 actualizaciones afectan (o no) al comportamiento de un modelo de 1,7B, con receta e hiperparámetros públicos.
- Docencia y divulgación sobre evaluación de modelos: el protocolo de comparación con ocho avisos y 64 afirmaciones factuales es un ejemplo útil para enseñar diseño de evaluaciones y sus limitaciones (revisores automáticos, sin evaluador humano independiente).
- Prototipado de pipelines de edición con PEFT: permite probar la integración de un adaptador LoRA sobre LFM3-1.7B en entornos con Transformers y PEFT, incluida la carga en CPU.
- Experimentos de preservación factual: útil para estudiar técnicas de prompting que fuerzan la conservación de hechos y la ausencia de alucinaciones en tareas de reescritura.
- Base para futuros ajustes: dado que la receta es pública, puede servir como punto de partida para reentrenar con un corpus mayor y evaluar la mejora respecto a esta línea base.

## Benchmarks y rendimiento

El autor publica una comparación fija de ocho avisos en inglés, evaluada mediante revisión asistida por modelo y ciega, con 64 afirmaciones factuales repartidas en ocho pasajes (seis que requerían edición y dos controles ya claros).

| Medida | Resultado |
|---|---|
| Pasajes plenamente aceptables | 2 / 8 |
| Afirmaciones de origen preservadas | 64 / 64 |
| Objetivos de edición requeridos cumplidos | 0 / 6 |
| Entradas copiadas tras normalizar espacios | 8 / 8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La comparación anterior es de muestra pequeña, emplea revisores automáticos y no cuenta con evaluador humano independiente, según reconoce el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo base de 1,7B en bfloat16 se sitúa en torno a 3,4 GB solo para pesos, más overhead de activaciones y caché KV (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas en la información proporcionada; el autor solo verifica la carga del adaptador en CPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base (1,7B), aunque no se documenta una lista concreta de GPUs verificadas.
- Opciones de despliegue: Transformers + PEFT (probado con Transformers 5.22.2 y PEFT 0.21.2); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este adaptador frente a alternativas. A continuación se compara a nivel de especificaciones con el modelo base y con la categoría de adaptadores de edición de texto, indicando "no disponible" donde no hay información.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-Edit-Keep | 1,7B (base) + LoRA r=8 | no disponible | lfm-open-license-1.0 | safetensors (PEFT) | 2/8 pasajes aceptables (muestra propia) |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | lfm-open-license-1.0 | safetensors | no disponible |
| Adaptadores de edición de texto comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultados de evaluación muy débiles: 0 de 6 objetivos de edición cumplidos y 8 de 8 entradas copiadas, lo que sugiere que el adaptador no está realizando ediciones efectivas en la práctica.
- Conjunto de entrenamiento minúsculo (32 ejemplos, 32 actualizaciones), lo que limita severamente la generalización.
- Evaluación de muestra pequeña (8 pasajes) y realizada por revisores automáticos, sin evaluador humano independiente; el propio autor lo advierte.
- Riesgo de alucinación no cuantificado; aunque el prompt exige preservar hechos, no hay evidencia publicada de que el adaptador lo garantice en textos fuera del conjunto de prueba.
- Solo inglés; no se documenta soporte multilingüe.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que se trata de una licencia "other" con nombre específico y no una licencia estándar tipo Apache o MIT.
- Dependencia estricta de la revisión del modelo base (`0dc4268b...`); cargar otra revisión puede alterar el comportamiento.
- No se documenta compatibilidad con motores de inferencia de alto rendimiento ni cuantizaciones GGUF/AWQ/GPTQ.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Edit-Keep
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Código fuente de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/supervised
- Protocolo y resultados de la comparación: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
- Licencia (LFM Open License v1.0): incluida en el repositorio como `LICENSE`
- Atribución: incluida en el repositorio como `NOTICE`
