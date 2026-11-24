# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp` es un modelo de lenguaje derivado de Llama 3.1 8B Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general, sino un artefacto de investigación en *machine unlearning*: parte de un modelo afinado sobre el dataset TOFU-para (una variante de TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta) y le aplica el algoritmo SatImp de la librería `open-unlearning` para eliminar el conocimiento del conjunto "forget10" (400 pares QA originales).

El interés del modelo es metodológico. La colección TOFU-para del autor separa explícitamente dos objetivos: *untraining* (eliminar las muestras concretas que se dieron al método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Este checkpoint corresponde a la semilla 0 de una ejecución de tres semillas, y su model card publica métricas FADE, calidad de olvido TOFU y utilidad del modelo, lo que permite evaluar la reproducibilidad y la varianza del proceso de desaprendizaje.

Arquitecturalmente es un transformer decoder-only estándar de 8.030.261.248 parámetros (denso, no MoE), con la ventana de contexto de 128.000 tokens de Llama 3.1 y licencia Llama 3.1 Community. Su relevancia práctica es limitada fuera de la investigación en privacidad y cumplimiento normativo (derecho al olvido), pero es un caso de estudio útil para quienes trabajan en evaluación de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no se indica modificación en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión completa; la model card no documenta cuantizaciones) |
| Idiomas soportados | no disponible (la model card no especifica; se hereda el perfil multilingüe de Llama 3.1, no verificado para este checkpoint) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, preentrenado por Meta y posteriormente afinado por el autor sobre el dataset TOFU-para. El punto de partida concreto es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un fine-tune sobre la totalidad de TOFU más dos versiones parafraseadas de cada par QA.

Sobre ese checkpoint se aplica SatImp, un método de desaprendizaje implementado en `open-unlearning` (locuslab). La configuración usa los hiperparámetros por defecto de SatImp en esa librería, sin recorte de gradiente, con batch efectivo de 32 y semilla 0; la configuración exacta está en el directorio `train_config/` del repositorio. El conjunto "forget" son únicamente los 400 pares QA originales de forget10, mientras que el conjunto "retain" (para métodos que lo usan) comprende retain90 más las dos paráfrasis (10.800 ejemplos). No se documenta en la información disponible el número de tokens de entrenamiento del fine-tune original ni la composición detallada del corpus más allá de TOFU-para.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat de Llama 3.1 Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general: en principio conserva las capacidades del modelo base, aunque la utilidad medida cae a 0,597 (frente a valores cercanos a 1 en modelos de referencia sin desaprender).
- Capacidad de *olvido selectivo*: el objetivo del checkpoint es que el modelo no reproduzca el conocimiento del conjunto forget10; las métricas publicadas (probabilidad Q-A de 0,003, ROUGE de 0,044) indican que lo consigue en gran medida para las formulaciones originales.
- Soporte de tool calling / function calling: no documentado específicamente para este checkpoint; se hereda del Instruct base sin verificación.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la model card.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar métodos (SatImp frente a otros) sobre el mismo modelo base y el mismo conjunto forget, usando las métricas FADE y TOFU publicadas como línea base.
- Estudio de reproducibilidad y varianza entre semillas: la model card incluye resultados de las semillas 0, 1 y 2, lo que permite analizar cuánto varía el olvido (ROUGE de forget entre 0,044 y 0,231) según la semilla de inicialización y de ejecución.
- Evaluación de *untraining* frente a *unlearning*: el modelo está diseñado para distinguir si se eliminan las muestras concretas o el conocimiento subyacente; útil para diseñar experimentos que midan ambas cosas por separado con las paráfrasis de TOFU-para.
- Cumplimiento del derecho al olvido (GDPR): escenario de laboratorio para estudiar si un modelo afinado con datos personales puede "desaprender" esos datos sin reentrenar desde cero, midiendo la fuga residual mediante FADE frente al modelo de referencia.
- Auditoría de privacidad de modelos afinados: usar el checkpoint como ejemplo de cómo cuantificar la probabilidad de que un modelo reproduzca información de un conjunto forget (probabilidad Q-A, truth ratio, ROUGE).
- Docencia y formación técnica: ejemplo práctico de pipeline de desaprendizaje con `open-unlearning`, configuración de hiperparámetros y evaluación con estimadores Rao-Blackwellizados de KL simétrica.

## Benchmarks y rendimiento

Los datos publicados son métricas específicas de desaprendizaje, no benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de propósito general en la información disponible.

| Métrica | Valor (semilla 0) | Media ± desv. (semillas 0-2) |
|---|---|---|
| FADE, untraining | 445,30 | 372,9 ± 79,7 |
| FADE, unlearning | 393,37 (original 417,1 / para1 380,0 / para2 383,0) | 337,3 ± 59,6 |
| Calidad de olvido TOFU | 9,53e-05 | no disponible |
| Truth ratio de forget | 0,691 | 0,704 ± 0,015 |
| Probabilidad Q-A de forget | 0,003 | 0,006 ± 0,005 |
| ROUGE Q-A de forget | 0,044 | 0,133 ± 0,094 |
| Utilidad del modelo | 0,597 | 0,613 ± 0,025 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin desaprendizaje (`x2-full`, modelo de partida) | 81,6 ± 0,7 | 156,3 ± 0,2 |

Interpretación: FADE es una divergencia KL simétrica frente al modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1; valores más bajos indican mayor dificultad de distinguir el modelo desaprendido del de referencia. El modelo de esta ficha queda lejos del "perfect unlearner" (393,4 frente a 29,8), lo que sugiere que el olvido no es completo.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- VRAM en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del número de parámetros; el autor no publica cuantizaciones).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090 (24 GB) para bfloat16 en una sola GPU; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (documentado en la model card), vLLM, TGI (el repo incluye la etiqueta `text-generation-inference`), llama.cpp/Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SatImp, semilla 0) | 8,03 B | 128 K | Desaprendizaje de forget10 sobre TOFU-para | Llama 3.1 Community | Hugging Face, 401 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (modelo de partida) | 8,03 B | 128 K | Fine-tune completo sobre TOFU-para | Llama 3.1 Community | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` (referencia "perfect unlearner") | 8,03 B | 128 K | Entrenado solo con retain90 | Llama 3.1 Community | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` (referencia "perfect untrainer") | 8,03 B | 128 K | Entrenado con retain90 y forget10 parafraseado | Llama 3.1 Community | Hugging Face |

La comparación relevante no es con otros modelos de propósito general, sino con los tres checkpoints de referencia de la misma colección, que definen los extremos ideales del desaprendizaje y del no-desaprendizaje.

## Limitaciones y advertencias

- El olvido no es completo: FADE de unlearning de 393,4 frente a 29,8 del "perfect unlearner", y ROUGE de forget de 0,044 en la semilla 0 pero 0,231 en la semilla 2, lo que indica alta varianza y fuga residual en algunas ejecuciones.
- La utilidad del modelo cae a 0,597 (media 0,613), por debajo de lo deseable; el desaprendizaje degrada capacidades generales.
- Riesgo de alucinación: no evaluado en la model card; se hereda el del modelo base y puede aumentar tras el proceso de desaprendizaje.
- Sesgos: no documentados; se heredan los de Llama 3.1 Instruct, sin auditoría específica para este checkpoint.
- Idiomas: no se especifica el soporte multilingüe real tras el fine-tune y el desaprendizaje; el fine-tune se hizo sobre TOFU-para, presumiblemente en inglés.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, prohibiciones de uso y obligación de atribución "Built with Llama"). No es una licencia open source permisiva.
- No apto para producción como asistente general: es un artefacto de investigación; no se han publicado evaluaciones de seguridad, alineamiento ni robustez.
- El nombre del repositorio en la model card (`...-satimp-seed0`) no coincide exactamente con el ID del modelo (`...-satimp`), lo que puede causar errores al cargarlo con `from_pretrained` si se copia el snippet tal cual.
- Fecha de creación indicada como 2026-11-03, posterior a la fecha actual de referencia; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp
- Modelo de partida: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp/blob/main/LICENSE
