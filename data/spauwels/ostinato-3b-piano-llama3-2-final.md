# spauwels/OSTINATO-3B-PIANO-Llama3.2.final

## Resumen

OSTINATO-3B-PIANO es un ajuste fino de Llama 3.2 3B Instruct desarrollado por el usuario spauwels, especializado en la generación de música simbólica para piano solista. El modelo produce secuencias de notas en formato textual (tripletas `A_ D_ IP_2_`) que representan intervalos, duraciones y alturas con velocidad, empleando un vocabulario ampliado con 51.460 tokens musicales sobre los 128.256 originales de Llama 3. El resultado es un modelo de 3.922.922.560 parámetros (embedding ampliado y capa de salida separada) que escribe interpretaciones de piano libres, sin pulso métrico fijo, a partir de instrucciones etiquetadas.

El modelo se entrena sobre MAESTRO v3.0.0, un corpus de 1.276 interpretaciones (unas 199 horas y 7,04 millones de notas) grabadas en pianos Yamaha Disklavier durante el International Piano-e-Competition. Esto condiciona su comportamiento: reproduce rubato y dinámicas humanas sin tempo fijo, lo que lo hace útil como fuente de ideas para compositores más que como generador de piezas terminadas. Mantiene el mismo vocabulario de etiquetas que su modelo hermano OSTINATO-3B-MULTI, pero restringido al canal de instrumento `IP_2`.

Su relevancia actual reside en la integración de generación musical simbólica dentro de un LLM de propósito general con contexto de 131.072 tokens, licencia Llama 3.2 y disponibilidad en GGUF Q8_0, lo que permite desplegarlo en hardware de consumo. La model card documenta con inusual detalle el efecto medido de cada etiqueta, lo que facilita evaluar su idoneidad antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B): 28 capas, dimensión 3072, 24 cabezas (8 KV) |
| Parametros totales | 3.922.922.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (fichero publicado `maestro_v24_q8.gguf`, 4.177.605.952 bytes) |
| Idiomas soportados | en |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (repo de 4,2 GB); no se publican safetensors en el repositorio |

## Arquitectura y entrenamiento

La base es Llama 3.2 3B Instruct, un transformer decoder-only con 28 capas, dimensión oculta de 3072 y 24 cabezas de atención (8 para clave/valor), al que se le ha ampliado el vocabulario de 128.256 a 179.716 tokens. Los 51.460 tokens añadidos son musicales: 48.860 reutilizan los identificadores del modelo MULTI y 2.600 corresponden a velocidades bajas del canal `IP_2` (valores 1 a 29). La capa de salida se mantiene separada, lo que explica que el recuento de parámetros (3,92 mil millones) supere ligeramente el del modelo base.

El entrenamiento se realizó sobre MAESTRO v3.0.0, del que se extrajeron 80.221 secuencias de como máximo 2.304 tokens (incluido el prompt), con 480 ticks por pulso y huecos `A_` en pasos de 24 ticks. No se documenta en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento. La innovación principal es la tokenización musical: cada nota se serializa como `A_{hueco} D_{duración} IP_2_{altura}_{velocidad}`, y las etiquetas de control (`TASK`, `GENRE`, `BPM`, `MOOD`, `BARS`, `DENSITY`, `COMPLEXITY`, `KEY`) se insertan en la instrucción. El autor documenta que el modelo aprendió un formato en el que todos los campos deben estar presentes, aunque el valor de `GENRE` y `BPM` no produzca efecto medible.

## Capacidades

- Generación de piano solista simbólico en formato textual de tripletas de nota, con velocidad y duración por nota.
- Modos de tarea: `GEN` (generación desde cero) y `JAM` (continuación a partir de un contexto `/CONTEXT {AMT}`), ambos descritos como fiables; `FIM` apenas supera el azar en las uniones y `COPILOT` no fue reentrenado.
- Control mediante etiquetas: `KEY` tiene efecto fuerte (95 % de notas en la escala frente al 58 % sin la etiqueta); `MOOD` modula densidad y velocidad media (de 57 a 79); `DENSITY` produce 36/42/50 notas por 4 compases; `BARS` se sigue bien hasta 4 compases.
- Salida válida en el 100 % de los casos según el autor: sin notas fuera de `IP_2` ni tokens ilegibles, incluso con entradas anómalas (tempo o longitud fuera de rango, texto libre, instrucción vacía).
- Diversidad: 16 tomas con la misma petición generan 16 resultados distintos.
- Direccionamiento fino mediante `logit_bias` sobre tokens de nota, huecos y duraciones; favorecer huecos múltiplos de 120 ticks produce el 100 % de ataques en semicorchea.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistente de composición para pianistas: el modelo genera bocetos de 4 a 8 compases a partir de una tonalidad y un estado de ánimo, que el compositor revisa y desarrolla. La etiqueta `KEY` garantiza el 95 % de notas en escala, lo que reduce la limpieza manual.
- Generación de variaciones sobre una idea existente: con `[TASK:JAM]` y un contexto AMT, el modelo mantiene tonalidad y registro para producir material derivado, útil en sesiones de improvisación asistida.
- Prototipado rápido de material para bibliotecas de samples: la diversidad de 16 tomas distintas por petición permite obtener múltiples pasajes cortos para evaluar antes de grabar.
- Integración en un plugin de DAW: el proyecto Echon Prompt Piano (GitLab `flamandroz-group/echon-prompt-piano`) consume el modelo para insertar pasajes directamente en la sesión; el GGUF Q8_0 de 4,2 GB permite ejecución local con llama.cpp.
- Exploración de dinámicas y densidades: las etiquetas `MOOD` y `DENSITY` permiten generar el mismo pasaje con distinta densidad (36/42/50 notas por 4 compases) y velocidad media (57 a 79) para comparar alternativas.
- Investigación en generación musical simbólica: el modelo sirve como línea base reproducible con un conjunto documentado de métricas por etiqueta (porcentaje de notas en escala, cobertura de compases, tasa de tomas aceptables), útil para comparar con otros sistemas AMT.
- Generación de ejercicios de lectura a primera vista: pasajes cortos en tonalidades controladas, con densidad ajustable, para material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta métricas específicas del dominio musical, medidas con 40 tomas por caso:

| Metrica | Resultado |
|---|---|
| Salida valida (sin tokens ilegibles ni notas fuera de `IP_2`) | 100 % |
| Notas en la escala con etiqueta `KEY` | 95 % (58 % sin etiqueta) |
| Notas en la escala sin `KEY` (tomas aceptables) | 42 % de tomas aceptables, 81 % de notas en escala |
| Tomas aceptables sin `GENRE` y `BPM` | 53 % |
| Tomas aceptables sin `MOOD`, `DENSITY` y `COMPLEXITY` | 47 % |
| Cobertura de compases solicitados a 8 compases | 1 de cada 2 tomas completa la longitud |
| Cobertura de compases solicitados a 16 compases | 73 % de los compases cubiertos |
| Tomas fallidas (silencio, fuera de tonalidad, acordes apilados, bucle) | ~10 % con los ajustes recomendados |
| Continuación de progresión de acordes en `JAM` | 47 % de notas en el acorde esperado (49 % por azar) |
| Desviación estándar de velocidad | 6 sobre 127 (media 61) |

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa 4,18 GB en disco; en inferencia con llama.cpp requiere aproximadamente 4,5-5,5 GB de VRAM considerando el contexto. Con cuantizaciones menores (no publicadas en el repo) cabría en menos de 3 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para Q8_0; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son sobradas. Cabe en GPUs de consumo de gama media.
- Despliegue: llama.cpp es el runtime de referencia (el autor proporciona ajustes concretos de muestreo); Ollama es viable al ser GGUF. vLLM y TGI requerirían pesos en safetensors, no publicados en el repositorio.
- Ajustes recomendados por el autor: `temperature` 0.9 (rango 0.8-1.1), `top_p` 0.9 (0.85-0.92), `repeat_penalty` 1.05, `logit_bias` de −3 sobre `</s>` (token 128260) y corte en cliente a `BARS × 1920` ticks.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| OSTINATO-3B-PIANO | 3,92 mil millones | 131.072 | Piano solista simbólico | llama3.2 | GGUF Q8_0 |
| OSTINATO-3B-MULTI | no disponible | no disponible | Música simbólica multi-instrumento | llama3.2 | no disponible |
| Llama 3.2 3B Instruct (base) | 3,21 mil millones | 131.072 | Texto general | llama3.2 | safetensors, GGUF |

La comparación con sistemas AMT dedicados (por ejemplo, modelos especializados de generación simbólica) no está disponible en la información proporcionada. OSTINATO-3B-MULTI comparte vocabulario y formato de notas, pero cubre varios instrumentos frente al canal único `IP_2` de esta variante.

## Limitaciones y advertencias

- El modelo no produce pulso métrico: los ataques caen de forma uniforme entre semicorcheas (fuerza de pulso de negra 0,06 frente a 0,09 por azar) y la etiqueta `BPM` no tiene efecto claro, salvo que a 60 bpm las notas son más largas.
- No escribe el pedal (CC 64, 66, 67) pese a que MAESTRO lo incluye.
- Se detiene antes de la longitud solicitada con frecuencia: a 8 compases solo la mitad de las tomas completan; a 16 compases se cubre el 73 %. Requiere corte en cliente.
- Alrededor de una de cada diez tomas es un fallo (silencio, fuera de tonalidad, acordes apilados o bucle) con los ajustes recomendados; con `temperature` 0.4 aparecen bucles.
- Las velocidades están comprimidas (desviación estándar de 6 sobre 127, media 61), muy por debajo del rango dinámico de una interpretación virtuosa; el autor hipotetiza un reescalado en el preprocesado, no verificado.
- En modo `JAM` mantiene tonalidad y registro pero no continúa progresiones de acordes (47 % de notas en el acorde esperado frente al 49 % por azar).
- `FIM` apenas supera el azar en las uniones y `COPILOT` no fue reentrenado.
- El valor de `GENRE` y `BPM` no tiene efecto medible, aunque las etiquetas deben estar presentes para obtener resultados aceptables.
- Riesgo de alucinación en el sentido musical: pasajes internamente incoherentes o bucles, no en el sentido factual de un LLM de texto.
- Idioma limitado al inglés en las instrucciones; sin capacidades multilingües declaradas.
- Licencia Llama 3.2: uso comercial sujeto a los términos de la licencia de Meta, incluida la política de uso aceptable y los requisitos de atribución.
- Solo se publica GGUF Q8_0; no hay safetensors en el repositorio, lo que limita el despliegue con vLLM o TGI y el reentrenamiento directo.
- La model card advierte de que sustituye a una versión anterior (`README_maestro_v24.md`) con datos inexactos sobre modelo base, etiquetas, tokens de tiempo, dataset y licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spauwels/OSTINATO-3B-PIANO-Llama3.2.final
- Modelo hermano multi-instrumento: https://huggingface.co/spauwels/OSTINATO-3B-MULTI-Llama3.2.final
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Plugin Echon Prompt Piano: GitLab `flamandroz-group/echon-prompt-piano`
- Dataset MAESTRO v3.0.0: Hawthorne et al., 2019 (referencia citada en la model card; no se proporciona URL directa en la información disponible)
