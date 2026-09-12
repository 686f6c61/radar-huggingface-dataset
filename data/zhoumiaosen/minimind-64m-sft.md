# zhoumiaosen/minimind-64m-sft

## Resumen

MiniMind 64M SFT (zhoumiaosen/minimind-64m-sft) es un modelo de lenguaje denso de 63.912.192 parámetros, desarrollado por el usuario zhoumiaosen como experimento educativo de ajuste supervisado (SFT) sobre el checkpoint base zhoumiaosen/minimind-64m-pretrain. Se trata de un decoder-only de la familia MiniMind exportado con la arquitectura compatible `Qwen3ForCausalLM` para funcionar con `transformers` sin código remoto personalizado. No utiliza pesos preentrenados de Qwen: el tokenizador y los pesos se entrenaron desde cero con la receta de MiniMind.

El modelo se ha ajustado durante una única época sobre 905.718 registros conversacionales del dataset jingyaogong/minimind_dataset, con una longitud de secuencia máxima de 768 tokens y sin optimización de preferencias (ni RLHF ni DPO). Todo el ciclo, preentrenamiento y SFT, se ejecutó en una única NVIDIA RTX 3060 de 12 GB de VRAM y aproximadamente 8 GB de RAM de sistema; la fase de fine-tuning consumió unas 8 horas y 13 minutos de reloj.

Su relevancia es puramente didáctica y de investigación: demuestra que es posible reproducir un pipeline completo de entrenamiento y alineación conversacional en hardware de consumo. El propio autor advierte que las muestras observadas contienen errores factuales, repeticiones y código roto, y que no debe utilizarse como asistente de propósito general. No se han publicado benchmarks estandarizados, perplexity en validación ni evaluaciones de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (MiniMind), exportado como `Qwen3ForCausalLM` |
| Parámetros totales | 63.912.192 (≈63,9 M) |
| Longitud de contexto | 768 tokens en entrenamiento; límite de posiciones configurado en 32.768 tokens (rendimiento en contexto largo no probado) |
| Tipos de cuantización | no disponible (solo se publican pesos FP16 en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |
| Capas | 8 |
| Dimensión oculta | 768 |
| Cabezas de atención / cabezas KV | 8 / 4 |
| Tamaño feed-forward | 2.432 |
| Vocabulario | 6.400 tokens |
| Precisión de entrenamiento / publicación | BF16 mixta / FP16 safetensors |
| Etapa de alineación | SFT completo; sin optimización de preferencias |
| Tokenizador | Propio de MiniMind, con plantilla de chat y flag `open_thinking` |
| Librería | transformers (probado con `transformers==4.57.6`) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación (metadatos de HuggingFace) | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con 8 capas, dimensión oculta de 768, 8 cabezas de atención y 4 cabezas KV (atención agrupada, GQA), con un feed-forward de 2.432 unidades y un vocabulario reducido de 6.400 tokens. El checkpoint se exporta como `Qwen3ForCausalLM`, lo que significa que `Qwen3` identifica la arquitectura de exportación compatible y no el origen de los pesos. No se requiere código remoto ni `trust_remote_code`. La ventana de entrenamiento es de 768 tokens, aunque el modelo tiene configurado un límite de posiciones de 32.768 tokens cuyo comportamiento no se ha validado.

El fine-tuning se realizó durante 1 época sobre el fichero `sft_t2t_mini.jsonl` del dataset jingyaogong/minimind_dataset (905.718 registros conversacionales), usando el cargador SFT original, que aplica la plantilla de chat del tokenizador y calcula la pérdida de siguiente token únicamente sobre los tokens de respuesta del asistente. La configuración fue: microbatch 4, acumulación de gradiente 4 (batch efectivo nominal de 16 secuencias), longitud máxima de 768, optimizador AdamW con valores por defecto de PyTorch, learning rate con decaimiento coseno de 0,00001 a 0,000001, clipping de gradiente 1,0, semilla 42 y 0 workers en el data loader. El último microbatch registrado fue el 226.430.

La pérdida de entrenamiento bajó de 2,4891 en el primer microbatch registrado (100) a 1,8517 en el último (226.430); la media de las primeras 50 lecturas fue 2,0311 y la de las últimas 50, 1,6723. Son pérdidas de microbatch de entrenamiento, no métricas de validación. No se aplicó RLHF, DPO ni ninguna otra etapa de alineación, ni se realizaron evaluaciones de factibilidad, seguridad o perplexity sobre un conjunto reservado.

## Capacidades

- Generación de texto conversacional en chino, con plantilla de chat integrada en el tokenizador.
- Soporte de un flag `open_thinking=False` en `apply_chat_template`, heredado del formato de exportación Qwen3; no se documenta un modo de razonamiento explícito funcional.
- Generación de código: el autor indica explícitamente que las muestras observadas contienen código roto, por lo que esta capacidad no es fiable.
- Razonamiento y matemáticas: no documentados ni evaluados; no hay evidencia de resultados.
- Tool calling / function calling: no disponible (no se menciona soporte alguno).
- Uso como agente o razonamiento multi-paso: no disponible (no se menciona soporte alguno).
- Capacidades multilingües: no. El modelo está etiquetado únicamente para chino (`zh`).
- Capacidades especiales: no se documentan visión, audio ni modos multimodales. La inferencia en CPU está soportada explícitamente.

## Casos de uso

- Laboratorios docentes de entrenamiento de LLM de extremo a extremo: el pipeline completo (preentrenamiento + SFT) cabe en una RTX 3060 de 12 GB con ~8 GB de RAM de sistema, y la fase de SFT de una época tardó unas 8 h 13 min, lo que permite reproducir el ciclo entero en un fin de semana sin clúster.
- Ablaciones de hiperparámetros y recetas de ajuste: con 63,9 M de parámetros, cada corrida es lo bastante barata para barrer learning rate, acumulación de gradiente, longitud de secuencia o número de épocas y medir el efecto sobre la pérdida de entrenamiento.
- Pruebas de humo de infraestructura de despliegue: validar plantillas de chat, tokenizador, servidores compatibles con text-generation-inference y endpoints con un consumo de VRAM inferior a 1 GB, antes de migrar a modelos mayores.
- Prototipado de aplicaciones de chat en chino de bajo coste: útil para demos internas donde la corrección factual no es crítica, asumiendo la advertencia del autor sobre errores factuales y repeticiones.
- Generación de datos sintéticos para probar canalizaciones: producir JSONL de respuestas en chino para testear cargadores de datos, plantillas de evaluación automática o formateadores, sin depender de APIs de pago.
- Fine-tuning de dominio muy acotado: al ser pequeño y tener licencia Apache 2.0, se puede reajustar para tareas cerradas de formato fijo o clasificación conversacional donde el vocabulario de 6.400 tokens no penalice.
- Estudio del impacto del tamaño de vocabulario: comparar la compresión de texto chino con un vocabulario de 6.400 tokens frente a tokenizadores de más de 100.000 entradas, usando el mismo corpus.
- Inferencia en CPU o dispositivos de memoria reducida: la generación en CPU está soportada de forma explícita y los pesos FP16 ocupan aproximadamente 122 MB (el rendimiento en Raspberry Pi no se ha medido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que no se realizó ninguna evaluación estandarizada, ni de factibilidad, ni de seguridad, ni de perplexity sobre un conjunto reservado. La evaluación publicada en `EVALUATION.md` es cualitativa y se basa en la revisión de ocho prompts.

Únicamente se documentan métricas de entrenamiento y velocidad de generación:

| Medición | Valor |
|---|---|
| Pérdida, primer microbatch registrado (100) | 2,4891 |
| Pérdida, último microbatch registrado (226.430) | 1,8517 |
| Media de las primeras 50 lecturas de pérdida | 2,0311 |
| Media de las últimas 50 lecturas de pérdida | 1,6723 |
| Velocidad de generación, primera respuesta (RTX 3060) | 25,71 tokens/s |
| Velocidad de generación, siete respuestas restantes (RTX 3060) | 61,74–68,96 tokens/s |

Las pérdidas son valores de microbatch de entrenamiento, no puntuaciones de validación ni medias de época completas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16 con contexto de 768 tokens. Los pesos ocupan aproximadamente 122 MB (63,9 M × 2 bytes); en FP32, unos 256 MB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM. El entrenamiento se realizó en una NVIDIA GeForce RTX 3060 de 12 GB, que es el hardware de referencia documentado. No hay requisitos de A100, H100 ni RTX 4090 para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GTX/RTX moderna e incluso en iGPU con memoria suficiente.
- CPU: la generación en CPU está soportada explícitamente. El rendimiento en Raspberry Pi no se ha medido.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `safetensors` es la vía documentada. El repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`. No se publican conversiones a GGUF, ni integración con llama.cpp, Ollama o vLLM.
- Latencia y throughput: en la RTX 3060 de referencia, 25,71 tokens/s para la primera respuesta y entre 61,74 y 68,96 tokens/s para las siete siguientes. Los ajustes de generación completos están en `EVALUATION.md`.
- Entrenamiento: la ejecución documentada de SFT requiere una GPU de 12 GB, con un pico aproximado de 8 GB de RAM de sistema. Duración de reloj: ~8 h 13 min para el fine-tuning y ~20 h 31 min para el flujo completo, incluida una interrupción por reinicio.

## Comparativa con modelos similares

No existe ningún benchmark comparativo publicado para este modelo, por lo que la comparación se limita a parámetros, contexto, licencia e idiomas. Los datos de los modelos alternativos proceden de su documentación pública y deben verificarse en sus fichas antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| MiniMind 64M SFT (este modelo) | 63,9 M | 768 en entrenamiento; 32.768 configurado sin validar | Apache 2.0 | Chino (zh) | HuggingFace, transformers |
| MiniMind 64M pretrain (modelo base) | 63,9 M | 768 | Apache 2.0 | Chino (zh) | HuggingFace |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | Principalmente inglés | HuggingFace |
| Qwen3-0.6B | 0,6 B | 32.768 | Apache 2.0 | Multilingüe | HuggingFace |

La comparación de rendimiento con estas alternativas no está disponible: el autor de MiniMind 64M SFT no publicó MMLU, HumanEval, GSM8K ni ninguna otra puntuación que permita situarlo frente a modelos de tamaño similar.

## Limitaciones y advertencias

- Calidad factual: el propio autor advierte que las muestras observadas contienen errores factuales, repeticiones y código roto. No es un asistente de propósito general fiable.
- Alucinación: no se ha medido ni cuantificado, pero el riesgo es alto dado el tamaño del modelo, el vocabulario reducido y la ausencia de alineación por preferencias.
- Idiomas: solo chino. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Contexto: la ventana de entrenamiento de 768 tokens es muy corta. Aunque el límite de posiciones está configurado en 32.768, el comportamiento más allá de 768 tokens no se ha probado y no debería asumirse.
- Ausencia de alineación: no hubo RLHF, DPO ni filtros de seguridad. No existe evaluación de seguridad ni de sesgos. El modelo puede generar contenido inapropiado sin salvaguardas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no ofrece ninguna garantía de calidad, exactitud ni idoneidad para producción.
- Vocabulario reducido: 6.400 tokens limita la compresión del texto y puede degradar tareas que requieran terminología específica o multilingüe.
- Validación insuficiente: no hay perplexity en conjunto reservado, ni benchmarks estandarizados, ni evaluación cuantitativa de calidad. Las únicas cifras disponibles son pérdidas de entrenamiento y velocidades de generación.
- Detalle de exportación: el entrenador original guarda el checkpoint antes de aplicar el paso de optimizador de la acumulación parcial final, por lo que esa actualización en memoria no está incluida en los pesos publicados.
- Reproducibilidad: la ejecución de preentrenamiento sufrió un reinicio documentado en la ficha del modelo base.
- Trazabilidad del dataset: los datos no se redistribuyen en este repositorio; la procedencia y los términos deben consultarse en la ficha del dataset original.
- Uso en producción: no recomendado. El modelo está declarado explícitamente como experimento educativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhoumiaosen/minimind-64m-sft
- Modelo base (preentrenamiento): https://huggingface.co/zhoumiaosen/minimind-64m-pretrain
- Dataset de fine-tuning: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Repositorio del proyecto MiniMind (referenciado de forma implícita en la model card como "upstream trainer"): https://github.com/jingyaogong/minimind
- Informe de evaluación cualitativa: `EVALUATION.md` en el repositorio del modelo
- Curva de pérdida de fine-tuning: `fine-tuning-loss.png` y `fine-tuning-loss.csv` en el repositorio del modelo
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (páginas de ayuda de Google Maps), por lo que no se ha podido añadir ningún paper, blog o demo adicional verificado.
