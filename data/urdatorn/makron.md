# Urdatorn/Makron

## Resumen

Makron es un modelo de clasificación de tokens a nivel de carácter desarrollado por Urdatorn (Albin Thörn Cleland y Eric Cullhed) que marca la longitud fonémica de las vocales griegas antiguas *dichrona* α, ι y υ, insertando un circunflejo (`^`) tras una vocal breve y un guion bajo (`_`) tras una vocal larga. Es la versión revisada de [Ericu950/oga-macronizer-char](https://huggingface.co/Ericu950/oga-macronizer-char), con la misma arquitectura pero datos de entrenamiento descontaminados e hiperparámetros ajustados mediante búsqueda Optuna.

Se trata de un transformer minúsculo de 866.563 parámetros (0,87 M) con 4 capas, tamaño oculto 128, 4 cabezas de atención e interfaz de 512. Su relevancia radica en que automatiza una tarea filológica manual muy costosa: la anotación de cantidad vocálica en corpus de griego antiguo, un paso previo necesario para métrica, prosodia y edición crítica de textos.

El modelo se entrena sobre etiquetas plateadas generadas por el sistema basado en reglas grc-macronizer sobre el corpus Opera Graeca Adnotata, y se evalúa sobre el benchmark Norma Syllabarum Graecarum. Está publicado bajo licencia GPL-3.0 y solo soporta griego antiguo (código `grc`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder a nivel de carácter (4 capas, hidden 128, 4 cabezas, intermediate 512) |
| Parámetros totales | 866.563 (0,87 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (modelo de 0,87 M, cuantización innecesaria en la práctica) |
| Idiomas soportados | griego antiguo (`grc`) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Makron es un transformer encoder de 4 capas con tamaño oculto 128, 4 cabezas de atención e intermediate size 512, operando a nivel de carácter sobre la tarea de etiquetado de tokens (predicción de la cantidad de cada dichrona). El entrenamiento usa AdamW con learning rate 2,23e-3, weight decay 0,17, batch size 2048, schedule one-cycle con 5 % de warmup, dropout 0,0 y 30 épocas; el checkpoint seleccionado es el de mejor precisión en validación Norma (paso 11.000, semilla 2). Los hiperparámetros se eligieron mediante búsqueda Optuna de 24 trials sobre validación Norma, y la longitud de entrenamiento se fijó con una comparación posterior sobre la misma validación.

Los datos de entrenamiento son etiquetas plateadas del sistema basado en reglas grc-macronizer sobre Opera Graeca Adnotata, publicadas en el dataset [Urdatorn/oga-macronized-no-norma](https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma). Respecto a la versión original, se eliminaron todas las frases solapadas con el benchmark Norma (descontaminación) y todas las líneas sin texto griego. No se reporta RLHF ni DPO; el ajuste es puramente supervisado sobre etiquetas plateadas.

## Capacidades

- Marcado de cantidad vocálica de α, ι y υ en griego antiguo: inserta `^` tras vocal breve y `_` tras vocal larga (p. ej. `ἀνὴρ → ἀ^νὴρ`).
- Clasificación a nivel de carácter, robusta ante tokenización y variantes de escritura politónica.
- Normalización a longitudes áticas (convención del corpus de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: únicamente griego antiguo (`grc`); no procesa otras lenguas.
- Inferencia ligera: 0,87 M de parámetros, ejecutable en CPU sin GPU.

## Casos de uso

- Anotación prosódica de corpus: aplicar Makron sobre ediciones digitales de autores áticos (oratoria, tragedia, comedia) para generar capas de cantidad vocálica que alimenten análisis métricos automáticos.
- Escansión métrica de poesía: preprocesar hexámetros y trímetros yámbicos con las marcas de longitud para que un módulo posterior resuelva el esquema métrico, reduciendo la ambigüedad de las dichronas.
- Edición crítica asistida: marcar automáticamente la cantidad en transcripciones de manuscritos y comparar con la tradición impresa para detectar discrepancias prosódicas.
- Enseñanza de griego antiguo: generar materiales didácticos con cantidad vocálica explícita para estudiantes que aún no dominan las reglas de longitud por posición y naturaleza.
- Enriquecimiento de treebanks y corpus anotados: añadir un rasgo de longitud vocálica a corpus como Opera Graeca Adnotata para entrenar o evaluar otros modelos filológicos.
- Preprocesado para TTS y recitación: proporcionar la información de cantidad necesaria para una síntesis de voz con duraciones vocálicas correctas en griego ático.
- Filtrado y control de calidad de datasets: detectar anotaciones inconsistentes comparando las predicciones del modelo con etiquetas humanas en corpus de validación.

## Benchmarks y rendimiento

Resultados sobre el test de Norma Syllabarum Graecarum (1.916 dichronas áureas en sílabas abiertas). Una posición sin marcar cuenta como error; P, R y F1 son micro-promediados en la fila mixta.

| Etiqueta | Acc | P | R | F1 | Cobertura |
|---|---|---|---|---|---|
| Larga | 60,4 | 84,1 | 60,4 | 70,3 | 98,8 |
| Breve | 97,6 | 92,6 | 97,6 | 95,0 | 99,9 |
| Mixta | 91,3 | 91,6 | 91,3 | 91,4 | 99,7 |

Validación Norma (2.498 posiciones): 93,96 % de precisión mixta. Variación entre las tres semillas en test: 91,3 ± 0,5 de precisión mixta.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB; el modelo (0,87 M de parámetros) cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente. También funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: transformers con los scripts `model.py`, `tokenizer.py` y `predict.py` del repositorio [Urdatorn/Makron-code](https://huggingface.co/Urdatorn/Makron-code); compatible con endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera procesamiento por lotes de miles de caracteres por segundo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Makron (Urdatorn) | 0,87 M | Marcado de cantidad vocálica en griego antiguo | no disponible | GPL-3.0 | Hugging Face |
| Ericu950/oga-macronizer-char | misma arquitectura (0,87 M aprox.) | Marcado de cantidad vocálica en griego antiguo | no disponible | no disponible en la información | Hugging Face |
| grc-macronizer (basado en reglas) | no aplica | Marcado de cantidad vocálica en griego antiguo | no aplica | no disponible | Referenciado como generador de etiquetas |

Makron es una revisión directa de oga-macronizer-char con datos descontaminados e hiperparámetros ajustados; no se dispone de cifras comparativas de benchmarks entre ambos en la información proporcionada. El sistema de reglas grc-macronizer actúa como profesor y fuente de etiquetas plateadas, por lo que sus errores se heredan.

## Limitaciones y advertencias

- Normaliza a longitudes áticas en todo el corpus, por lo que es sistemáticamente incorrecto en formas homéricas, dóricas y de otros dialectos no áticos.
- Aprende de etiquetas plateadas y hereda los errores del sistema basado en reglas grc-macronizer.
- Las vocales largas son su punto débil: alrededor del 60 % de recall en la etiqueta "larga".
- Solo procesa griego antiguo; no es utilizable en otras lenguas ni en griego moderno.
- Riesgo de alucinación: al ser un etiquetador de caracteres, puede insertar marcas incorrectas en posiciones ambiguas o en texto no griego mal filtrado.
- Licencia GPL-3.0: el uso comercial exige cumplir las obligaciones copyleft de la GPL, lo que puede condicionar su integración en productos propietarios.
- No se documentan sesgos sociales en el sentido habitual (es un modelo filológico), pero sí el sesgo dialectal ático mencionado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No hay información publicada sobre longitud de contexto, por lo que se desconoce el tamaño máximo de entrada recomendado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/Makron
- Código, logs y las tres semillas: https://huggingface.co/Urdatorn/Makron-code
- Dataset de entrenamiento: https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma
- Benchmark Norma: https://huggingface.co/datasets/Urdatorn/norma
- Modelo original: https://huggingface.co/Ericu950/oga-macronizer-char
- Cita: Thörn Cleland, Albin y Eric Cullhed (en prensa). *Automatic Annotation of Ancient Greek Vowel Length*.
