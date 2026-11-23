# Urdatorn/Makron-seed3

## Resumen

Makron-seed3 es un modelo de etiquetado de tokens (token classification) de nivel caracter que anota la cantidad vocálica de las vocales griegas antiguas dicronas α, ι y υ, insertando un símbolo `^` tras una vocal breve y `_` tras una vocal larga. Lo desarrolla el autor Urdatorn como revisión de [Ericu950/oga-macronizer-char](https://huggingface.co/Ericu950/oga-macronizer-char), con la misma arquitectura pero datos de entrenamiento descontaminados y hiperparámetros ajustados mediante búsqueda Optuna.

Se trata de un transformer minúsculo de 866.563 parámetros (0,87 M), con 4 capas, tamaño oculto 128 y 4 cabezas de atención, especializado exclusivamente en griego antiguo (código `grc`). No es un modelo generativo de propósito general, sino una herramienta filológica de precisión para un problema muy concreto: la reconstrucción automática de la cantidad vocálica, información que los textos griegos transmitidos rara vez conservan de forma explícita.

Su relevancia radica en que aborda una tarea auxiliar clásica (la macronización) con un modelo neuronal ligero y con métricas publicadas sobre un benchmark propio (Norma Syllabarum Graecarum). Es la semilla 3 de tres modelos finales idénticos salvo por la semilla; según el autor, la semilla 2 obtiene la mejor puntuación de validación en Norma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de nivel caracter, 4 capas, hidden size 128, 4 cabezas, intermediate size 512 |
| Parámetros totales | 866.563 (0,87 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo no publica variantes GGUF ni cuantizadas) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | GNU GPL v3 (gpl-3.0) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 4 capas con tamaño oculto 128, 4 cabezas de atención e intermediate size 512, operando a nivel de carácter sobre texto griego antiguo. La tarea es de token classification: para cada posición de vocal dicrona se predice si es breve o larga, y la salida se materializa con los marcadores `^` (breve) y `_` (larga), por ejemplo `ἀνὴρ → ἀ^νὴρ`.

El entrenamiento emplea etiquetas plateadas (silver labels) generadas por el sistema basado en reglas grc-macronizer sobre Opera Graeca Adnotata, publicadas en el dataset [Urdatorn/oga-macronized-no-norma](https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma). Los datos se descontaminaron eliminando toda oración solapada con el benchmark Norma y toda línea sin texto griego. Los hiperparámetros se seleccionaron con una búsqueda Optuna de 24 trials sobre la validación de Norma: AdamW con lr 2,23e-3, weight decay 0,17, batch size 2048, schedule one-cycle con 5 % de warmup, dropout 0,0 y 30 épocas. El checkpoint elegido es el de mejor accuracy de validación en Norma (paso 4.160). No se documenta uso de RLHF ni DPO, algo coherente con una tarea supervisada de etiquetado.

## Capacidades

- Anotación de cantidad vocálica de α, ι y υ en griego antiguo, con marcadores `^` (breve) y `_` (larga).
- Procesamiento a nivel de carácter, lo que le permite operar sobre formas con diacríticos y texto polítono.
- Etiquetado de tokens (token classification) sobre secuencias de texto griego.
- Normalización a cantidades áticas (convención de sus datos de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: está entrenado y evaluado únicamente en griego antiguo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Edición digital de textos griegos: macronizar automáticamente ediciones y corpus para publicaciones que requieren cantidad vocálica explícita, reduciendo la anotación manual a una revisión posterior.
- Análisis métrico de poesía: la cantidad vocálica es la base del cómputo de pies métricos; el modelo proporciona la información de longitud necesaria para escandir versos en textos áticos.
- Enseñanza del griego antiguo: generar materiales didácticos con vocales breves y largas marcadas, útiles para estudiantes que aprenden prosodia.
- Enriquecimiento de corpus lingüísticos: añadir una capa de anotación de cantidad vocálica a corpus existentes para estudios de fonología histórica.
- Preprocesamiento para otros sistemas filológicos: servir como etapa previa que alimenta herramientas de lematización, morfología o métrica que necesitan distinguir vocales largas y breves.
- Creación de léxicos y concordancias: anotar entradas léxicas con su cantidad vocálica para diccionarios especializados.
- Verificación de reglas: comparar las predicciones del modelo con las del sistema basado en reglas grc-macronizer para detectar discrepancias y revisar casos dudosos.

## Benchmarks y rendimiento

Resultados sobre Norma Syllabarum Graecarum (test: 1.916 dicronas áureas en sílabas abiertas). La accuracy cuenta como error toda posición no marcada.

| Etiqueta | Acc | P | R | F1 | Cov |
|---|---|---|---|---|---|
| Larga | 58,8 | 82,3 | 58,8 | 68,6 | 98,8 |
| Breve | 97,3 | 92,3 | 97,3 | 94,7 | 99,9 |
| Mixta | 90,8 | 91,1 | 90,8 | 91,0 | 99,7 |

- Validación (Norma, 2.498 posiciones): 93,71 % de accuracy mixta.
- Variación entre las tres semillas: 91,3 ± 0,5 de accuracy mixta en test.
- Las métricas P, R y F1 mixtas están promediadas en micro.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (0,87 M de parámetros); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problema. Cualquier GPU moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en todas, incluidas las de gama baja e integradas.
- Opciones de despliegue: transformers con los scripts `model.py`, `tokenizer.py` y `predict.py` de [Urdatorn/Makron-code](https://huggingface.co/Urdatorn/Makron-code); el repo está marcado como `endpoints_compatible`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste de inferencia muy bajo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Makron-seed3 | 0,87 M | no disponible | Macronización de grc | GPL-3.0 | Hugging Face |
| [Ericu950/oga-macronizer-char](https://huggingface.co/Ericu950/oga-macronizer-char) | misma arquitectura (no se detalla cifra) | no disponible | Macronización de grc | no disponible | Hugging Face |
| [Urdatorn/Makron-seed1](https://huggingface.co/Urdatorn/Makron-seed1) | 0,87 M | no disponible | Macronización de grc | GPL-3.0 | Hugging Face |
| [Urdatorn/Makron-seed2](https://huggingface.co/Urdatorn/Makron-seed2) | 0,87 M | no disponible | Macronización de grc | GPL-3.0 | Hugging Face |

Las tres semillas son idénticas salvo por la semilla de entrenamiento; la semilla 2 obtiene la mejor puntuación de validación en Norma según el autor. No se dispone de datos de rendimiento del modelo original oga-macronizer-char en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- Normaliza a cantidades áticas en todo el corpus, por lo que es sistemáticamente incorrecto para formas homéricas, dóricas y otras variedades no áticas.
- Aprende de etiquetas plateadas generadas por un sistema de reglas, de modo que hereda los errores de dicho sistema.
- Las vocales largas son su punto débil: solo alcanza un 58,8 % de recall en esa clase.
- Una posición no marcada cuenta como error en la evaluación, lo que penaliza los casos de abstención.
- Rendimiento dependiente del dominio: entrenado sobre Opera Graeca Adnotata, puede degradarse en géneros o autores alejados de ese corpus.
- Licencia GPL-3.0: el uso comercial está permitido, pero impone obligaciones copyleft sobre el software derivado que distribuya el modelo o sus modificaciones; conviene revisar la compatibilidad con el producto antes de integrarlo.
- Al ser un modelo de anotación y no generativo, no debe emplearse para tareas de generación de texto, razonamiento o diálogo.
- No se documentan sesgos sociales ni de otro tipo más allá de la restricción dialectal ática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/Makron-seed3
- Modelo original: https://huggingface.co/Ericu950/oga-macronizer-char
- Semilla 1: https://huggingface.co/Urdatorn/Makron-seed1
- Semilla 2: https://huggingface.co/Urdatorn/Makron-seed2
- Código, logs y semillas: https://huggingface.co/Urdatorn/Makron-code
- Dataset de entrenamiento: https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma
- Benchmark Norma: https://huggingface.co/datasets/Urdatorn/norma
- Cita: Thörn Cleland, Albin y Eric Cullhed (en prensa). Automatic Annotation of Ancient Greek Vowel Length.
