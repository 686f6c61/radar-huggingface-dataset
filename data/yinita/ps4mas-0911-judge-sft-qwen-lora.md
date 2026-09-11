# yinita/ps4mas-0911-judge-sft-qwen-lora

## Resumen

El modelo `yinita/ps4mas-0911-judge-sft-qwen-lora` es un adaptador LoRA de tipo PEFT, no un modelo completo, entrenado sobre `Qwen/Qwen3.5-9B` por el usuario yinita. Su propósito es actuar como juez automático de seguridad y calidad en el benchmark multiagente PS4MAS: recibe la respuesta de un sistema de IA y devuelve tres puntuaciones dimensionales en escala 0-5 (`risk_sensitivity`, `emotional_empathy` y `personalization`) junto con una justificación en texto libre.

La relevancia práctica del adaptador está en su coste: se entrenó con LLaMA-Factory en una sola H100 durante 1 hora y 7 minutos, con un gasto aproximado de 3 dólares, ajustando solo 43,3 millones de parámetros (0,46 % del total del modelo base). Esto permite sustituir llamadas a un juez propietario por un juez local desplegable en infraestructura propia, con una concordancia media del 94,7 % dentro de ±1 punto respecto al oráculo `gpt-5.6-terra`.

Se distribuye únicamente como adaptador (0,2 GB de repositorio) y requiere cargar el modelo base de 9B parámetros por separado. La información disponible no detalla la longitud de contexto, los idiomas soportados ni la arquitectura interna del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el adaptador; se aplica sobre `Qwen/Qwen3.5-9B` (arquitectura del base no detallada en la informacion proporcionada) |
| Parametros totales | 9B en el modelo base (derivado del identificador); adaptador LoRA de 43,3M de parametros entrenables (0,46 %) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | other (el texto concreto de la licencia no se incluye en la informacion disponible) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`, formato PEFT/LoRA) |

Otros datos del repositorio: 0,2 GB de tamano, 0 descargas, 0 likes, creado el 11 de septiembre de 2026. Ficheros incluidos: `adapter_config.json`, `adapter_model.safetensors`, `tokenizer.json`, `tokenizer_config.json`, `processor_config.json`, `chat_template.jinja` y `README.md`.

## Arquitectura y entrenamiento

Se trata de un ajuste por LoRA (Low-Rank Adaptation) con rango r=16, alpha=32 y dropout=0,05, aplicado sobre `Qwen/Qwen3.5-9B`. El entrenamiento se realizó con LLaMA-Factory mediante SFT supervisado, durante 1 epoch, 264 pasos y batch de 16, con optimizador AdamW (beta=0,9/0,999, epsilon=1e-8) y una planificación de learning rate coseno con lr=1e-4. La pérdida final de entrenamiento fue de 0,1196. Solo se entrenaron 43,3M de parámetros, el 0,46 % del total, sobre una única H100 durante 1 hora y 7 minutos, con un coste aproximado de 3 dólares.

El conjunto de datos de entrenamiento es `yinita/ps4mas-0911-judge-sft-qwen-lora-data`, con 3580 muestras de entrenamiento y 632 de validación. Las etiquetas se generaron con un juez oráculo denominado `gpt-5.6-terra`, de modo que el adaptador funciona en la práctica como una destilación del criterio de ese juez propietario a un modelo local. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos; el adaptador reutiliza íntegramente la arquitectura del modelo base.

## Capacidades

- Puntuación de seguridad: asigna una nota de 0 a 5 en `risk_sensitivity`, midiendo si la respuesta reconoce y mitiga los riesgos presentes en la situación del usuario.
- Evaluación de empatía: puntúa de 0 a 5 en `emotional_empathy` si la respuesta reconoce el estado emocional del usuario.
- Evaluación de personalización: puntúa de 0 a 5 en `personalization` si la respuesta aprovecha hechos específicos del perfil (edad, profesión, historial).
- Justificación en texto libre: genera una explicación acompañando a las tres puntuaciones.
- Formato de salida estructurado y parseable: en el conjunto de validación se parsearon correctamente 632 de 632 muestras (100 %).
- Uso como juez dentro de pipelines de evaluación y de benchmarks multiagente de seguridad (PS4MAS).
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio o modo de pensamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación automática de asistentes en dominios sensibles: el juez puntúa cada respuesta en tres dimensiones, lo que permite detectar respuestas que ignoran riesgos en contextos de salud, finanzas o crisis personales sin depender de revisión humana continua.
- Regresión en CI/CD para sistemas de agentes: al ser un adaptador de bajo coste desplegable en local con vLLM, se puede integrar en la canalización de pruebas y comparar las puntuaciones medias entre versiones del prompt o del modelo antes de desplegar.
- Pre-etiquetado para anotación humana: con una concordancia de ±1 punto del 94,7 % respecto al oráculo, las puntuaciones pueden servir como primera pasada que los revisores humanos corrigen, reduciendo el volumen de trabajo manual.
- Auditoría y red teaming: filtrar sistemáticamente las respuestas con `risk_sensitivity` baja para revisar los casos donde el sistema evaluado no mitigó el riesgo.
- Validación de personalización en asistentes con memoria de usuario: comprobar si el sistema aprovecha realmente los datos de perfil disponibles o produce respuestas genéricas.
- Sustitución de jueces propietarios por inferencia local: empresas que no pueden enviar datos de usuarios a APIs externas pueden usar este adaptador on-premise para conservar el criterio de evaluación sin salida de datos.
- Investigación en seguridad multiagente: usar el juez como componente de medida dentro del benchmark PS4MAS, donde se evalúan interacciones entre varios agentes.
- Generación de recompensas para RLAIF o RLHF: las puntuaciones dimensionales pueden alimentar una función de recompensa, con la advertencia de que el juez muestra un sesgo claro hacia valores enteros y baja varianza.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de validación reservado (`val.json`, 632 muestras), tomando `gpt-5.6-terra` como oráculo:

| Dimension | MAE | RMSE | Dentro de ±1 | Exacto |
|---|---|---|---|---|
| risk_sensitivity | 0,668 | 0,971 | 84,0 % | 42,4 % |
| emotional_empathy | 0,464 | 0,642 | 100,0 % | 42,4 % |
| personalization | 0,323 | 0,525 | 100,0 % | 56,0 % |
| Media | 0,485 | 0,713 | 94,7 % | 46,9 % |

Datos adicionales aportados por el autor: 632 de 632 muestras parseadas correctamente (100 %); concordancia media dentro de ±1 punto del 94,7 %; MAE medio de 0,485. El autor señala que el juez está sesgado hacia puntuaciones enteras y presenta baja varianza, por lo que el coeficiente de Pearson se colapsa a 0 y la métrica adecuada es la concordancia absoluta, no la correlación. La comparación lado a lado con el modelo base sin ajustar se encuentra en el repositorio del conjunto de datos, pero sus cifras no están incluidas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del tamano del modelo base de 9B, no publicadas por el autor): aproximadamente 18-20 GB en bf16/fp16 para los pesos, mas el espacio de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 10-12 GB; en 4 bits, alrededor de 6-8 GB.
- El adaptador en si es despreciable en memoria: 43,3M de parametros, aproximadamente 87 MB en bf16.
- GPU recomendadas para precision completa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- Cabe en GPU de consumo en bf16 con matices: RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden alojar los pesos, con margen limitado si el contexto es largo.
- Cabe con holgura en GPU de consumo mediante cuantizacion de 4 bits: RTX 4070 Ti, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, siempre que se cuantice el modelo base.
- El entrenamiento del adaptador se realizo en una sola H100 durante 1 hora y 7 minutos.
- Opciones de despliegue documentadas: `transformers` + `peft` (cargando `PeftModel.from_pretrained` sobre el base) y vLLM con `--enable-lora --lora-modules judge=<repo>`.
- Despliegue con llama.cpp, Ollama o TGI: no documentado. Seria necesario fusionar el adaptador con el modelo base y convertir los pesos a GGUF, un procedimiento no descrito en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento como juez | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yinita/ps4mas-0911-judge-sft-qwen-lora` (adaptador) | 9B base + 43,3M entrenables | No disponible | MAE medio 0,485; ±1 del 94,7 % | other | Adaptador publico en HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-9B` sin ajustar | 9B | No disponible | Cifras de comparacion no incluidas en la informacion disponible | No disponible | Modelo base publico |
| `gpt-5.6-terra` (oraculo) | No disponible | No disponible | Referencia de etiquetado; sus metricas no se publican | No disponible | Propietario, usado como oraculo |
| Otros jueces LLM de seguridad | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia "other": el texto concreto no se incluye en la informacion disponible, por lo que debe revisarse en el repositorio antes de cualquier uso comercial.
- Sesgo hacia puntuaciones enteras y baja varianza: el propio autor advierte que el coeficiente de Pearson se colapsa a 0. No debe usarse como métrica de correlación ni como señal de recompensa continua sin calibración.
- Mayor error en `risk_sensitivity`: MAE de 0,668 y solo un 84,0 % de aciertos dentro de ±1 punto, frente al 100 % en las otras dos dimensiones. Es la dimensión menos fiable y, además, la más crítica en seguridad.
- Precisión exacta moderada: 46,9 % de coincidencias exactas con el oráculo en media, con `risk_sensitivity` y `emotional_empathy` en el 42,4 %.
- Dependencia de un juez propietario: las etiquetas provienen de `gpt-5.6-terra`, de modo que el adaptador hereda los sesgos y criterios de ese modelo, que no son auditables con la informacion disponible.
- Dominio estrecho: 3580 muestras de entrenamiento centradas en el benchmark PS4MAS. La generalización a otros dominios, idiomas o formatos de respuesta no está validada.
- Entrenamiento muy corto (1 epoch, 264 pasos, loss 0,1196), lo que sugiere un posible sobreajuste al formato exacto de salida esperado.
- No hay evaluación de sesgos demográficos, robustez frente a entradas adversarias, ni comportamiento multilingüe.
- No es un modelo autónomo: requiere `Qwen/Qwen3.5-9B` y no puede ejecutarse sin él.
- Riesgo de alucinación en la justificación en texto libre: no se han publicado métricas de fidelidad de la explicación respecto a la puntuación emitida.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Para uso en producción debe fijarse la versión del adaptador y monitorizarse la deriva del formato de salida, ya que el parseo correcto solo se ha verificado en el conjunto de validación del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yinita/ps4mas-0911-judge-sft-qwen-lora
- Conjunto de datos de entrenamiento y validación: https://huggingface.co/datasets/yinita/ps4mas-0911-judge-sft-qwen-lora-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del dataset companion con la comparación lado a lado frente al modelo base: referenciado en la model card como repositorio del conjunto de datos anterior.
- Paper, blog o demo adicionales: no disponibles.
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (corresponden a paginas sobre el nombre propio "Dawit") y se descartan por no ser relevantes.
