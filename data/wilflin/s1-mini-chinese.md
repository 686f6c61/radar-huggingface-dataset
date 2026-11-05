# WIlfLin/S1-mini-Chinese

## Resumen

S1-mini-Chinese es un ajuste fino completo del modelo S1-mini de Superwhisper, desarrollado por el usuario WIlfLin, orientado a la normalización de transcripciones de voz (speech-transcript normalization) en chino, inglés y mezclas de ambos. El modelo no es un reconocedor de voz: recibe texto ya transcrito por un sistema ASR y devuelve una versión limpia, eliminando muletillas, repeticiones y autocorrecciones explícitas, y añadiendo puntuación y estructura cuando se solicita.

Arquitecturalmente hereda la base de Qwen3-0.6B a través de S1-mini, con 751.632.384 parámetros totales y pesos en BF16. El repositorio ocupa 1,5 GB y se distribuye bajo la licencia s1-mini-license, que impone condiciones adicionales de atribución y uso del nombre original.

Su relevancia actual reside en que aborda un problema poco cubierto por los modelos generalistas: la limpieza de texto oral para aplicaciones de dictado, notas de voz y subtitulado. El autor documenta una mejora sustancial frente al modelo base en pruebas de normalización china e inglesa, aunque también advierte de regresiones en la preservación de texto que no debe modificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B vía S1-mini) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de secuencia de 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | chino (zh), inglés (en) y mezcla zh-en |
| Licencia | s1-mini-license (licencia "other" con cláusulas de atribución) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal, derivado de la arquitectura Qwen3-0.6B a través del modelo base superwhisper/s1-mini (commit 88f6b15896c73bbb13a3b596e0afe8ea0d5150b4). El ajuste se realizó mediante full fine-tuning de todos los parámetros de texto, no mediante LoRA ni modificación de prompts, con aproximadamente 752 millones de parámetros entrenables.

El entrenamiento se estructuró en dos fases. La primera consistió en 1 epoch sobre 9.645 presentaciones de muestra, 603 pasos, con learning rate 1e-5. La segunda fase utilizó un pool de seguridad y estilo de 14.428 presentaciones con learning rate 3e-6, publicándose el checkpoint del paso 400 (no un epoch completo). Se emplearon batch 4, acumulación de gradientes 4, longitud máxima de secuencia 512, pérdida calculada solo sobre la salida objetivo con supervisión del token EOS, parámetros maestros y optimizador en FP32 con autocast BF16, y pesos finales en BF16.

Los datos principales provienen de CS2W (pares anotados de oral a escrito, CC-BY-SA-4.0), con apoyo de Disfl-QA para ejemplos de autocorrección en inglés (CC-BY-4.0) y muestras sintéticas propias etiquetadas (CC0-1.0) que cubren casos de no modificación, citas, preservación de tono, salida vacía y listas. El autor advierte que las presentaciones incluyen remuestreo intencional y no equivalen al número de muestras humanas independientes. No se usaron grabaciones privadas de usuarios.

## Capacidades

- Normalización de transcripciones ASR en chino: eliminación de muletillas, repeticiones y resolución de autocorrecciones explícitas.
- Normalización de transcripciones en inglés, incluyendo ejemplos complejos de reformulación (Disfl-QA).
- Procesamiento de texto mixto chino-inglés, aunque sin garantía de calidad en mezclas complejas.
- Adición de puntuación y estructura de prosa o listas según la línea de control de entrada (`[Structure: prose]` o `[Structure: lists]`).
- Ajuste de estilo mediante línea de control (`[Styling: semi-formal]`) y contexto (`[Context: general]`).
- Capacidad de devolver cadena vacía cuando la entrada solo contiene muletillas, preservando la semántica de "nada que conservar".
- No es un modelo de preguntas y respuestas: las preguntas, comandos y citas del texto oral deben conservarse, no responderse ni ejecutarse.
- No soporta tool calling, agentes ni razonamiento multi-paso; no procesa audio.

## Casos de uso

- Dictado por voz en aplicaciones de productividad: el modelo recibe la transcripción cruda de un ASR y devuelve texto limpio con puntuación, adecuado para insertar directamente en editores de notas o correo.
- Notas de voz y reuniones: limpieza de transcripciones de reuniones en chino donde abundan muletillas y repeticiones, con salida en prosa o en lista de puntos según la configuración.
- Subtitulado y postproducción: normalización de transcripciones para generar subtítulos legibles, eliminando tartamudeos y reformulaciones antes de la segmentación final.
- Asistentes de voz integrados: capa de postprocesado entre el ASR y la interfaz de usuario, con validación EOS/truncamiento y fallback al texto original si el modelo falla.
- Documentación clínica o legal dictada: limpieza de dictados en entornos donde se requiere preservar números, negaciones y citas, apoyándose en las reglas de protección del pipeline de despliegue.
- Localización de contenido oral: normalización de entrevistas o podcasts transcritos en chino e inglés antes de traducción o publicación.
- Investigación en normalización de habla: modelo de referencia pequeño (752 M parámetros) para experimentos de limpieza de disfluencias con datasets CS2W y Disfl-QA.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test congelado de fuentes públicas (200 muestras de normalización china, 100 de referencia sin modificación en chino y 100 de Disfl-QA en inglés). Son salidas crudas del modelo, sin las reglas de protección del servicio de postprocesado.

| Metrica | S1-mini (upstream) | S1-mini-Chinese |
|---|---:|---:|
| Chino, normalización: coincidencia exacta de frase sin puntuación | 46/200 | 82/200 |
| Chino, normalización: tasa de error de caracteres léxicos (menor es mejor) | 21,06 % | 17,22 % |
| Inglés, normalización: coincidencia exacta de frase sin puntuación | 23/100 | 64/100 |
| Inglés, normalización: tasa de error de caracteres léxicos (menor es mejor) | 26,17 % | 9,02 % |
| Chino, referencia sin modificación: coincidencia léxica exacta | 96/100 | 92/100 |

Las métricas léxicas eliminan puntuación pero conservan mayúsculas, números, negaciones y orden de palabras; reflejan concordancia con la referencia, no corrección semántica humana. El autor señala que la mejora en limpieza china viene acompañada de una regresión en la referencia sin modificación (de 96 a 92 sobre 100).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 4 GB en la mayoría de configuraciones.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en GPUs de portátil con 6-8 GB.
- Puede ejecutarse en CPU con cuantización a 8 bits o 4 bits, aunque el autor no publica pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: transformers (versión validada por el autor: 5.3 con PyTorch 2.10), text-generation-inference (tag `text-generation-inference` en HuggingFace), vLLM y llama.cpp/Ollama previa conversión a GGUF no oficial.
- Throughput y latencia: no disponibles. El modelo es pequeño y las secuencias de entrenamiento son de 512 tokens, por lo que se espera baja latencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-mini-Chinese | 751.632.384 | no disponible (entrenado a 512) | Normalización de transcripciones zh/en | s1-mini-license | HuggingFace (WIlfLin/S1-mini-Chinese) |
| superwhisper/s1-mini | no disponible en la información | no disponible | Normalización de transcripciones (base) | s1-mini-license | HuggingFace (superwhisper/s1-mini) |
| Qwen3-0.6B | ~0,6 B | no disponible en la información | LLM generalista | Apache 2.0 (según la información de origen de la arquitectura) | HuggingFace |

La comparación con modelos generalistas del mismo tamaño no es directa: S1-mini-Chinese está especializado en una tarea concreta y no compite en benchmarks generales como MMLU o HumanEval, para los que no se han publicado resultados.

## Limitaciones y advertencias

- Puede dejar de eliminar repeticiones, borrar matices de tono o elegir la rama incorrecta en una autocorrección.
- No garantiza la preservación de nombres propios, números, negaciones y hechos; las reglas de protección del servicio no son una prueba de equivalencia semántica.
- No es un modelo de recuperación de errores homofónicos ni garantiza buen rendimiento en mezclas complejas chino-inglés.
- Los datos sintéticos y de replay no equivalen a anotación humana natural suficiente en mezclas zh-en.
- Las pruebas públicas de texto y la reproducción de grabaciones fijas no sustituyen la validación con micrófonos reales y usuarios finales.
- La licencia s1-mini-license incluye cláusulas adicionales sobre el uso del nombre del modelo original y la atribución a Superwhisper; debe revisarse antes de uso comercial.
- El modelo no procesa audio: requiere un ASR previo y no sustituye a un reconocedor de voz.
- No debe usarse como asistente conversacional general ni para ejecutar comandos contenidos en el texto dictado.
- En producción se recomienda verificar EOS/truncamiento, conservar la transcripción original para diagnóstico y aplicar fallback si el modelo no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WIlfLin/S1-mini-Chinese
- Modelo base: https://huggingface.co/superwhisper/s1-mini
- Dataset CS2W: https://github.com/guozishan/CS2W
- Dataset Disfl-QA: https://github.com/google-research-datasets/Disfl-QA
