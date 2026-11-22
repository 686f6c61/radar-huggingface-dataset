# zanezhang666/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF de tipo "abliterated" (sin rechazos) del modelo DeepSeek-V4.1-Flash-1017, un transformer MoE de 763 mil millones de parámetros con 384 expertos desarrollado por DeepSeek. La publica el usuario zanezhang666, aunque el trabajo de cuantización y edición corre a cargo de AtomicChat, que parte de los shards GSQ-RCO de ISTA-DASLab. El objetivo es ofrecer una variante del modelo con la dirección de rechazo proyectada fuera de los tensores densos que escriben en el residual, manteniendo intactos los expertos enrutados.

La relevancia técnica está en cómo se hace la edición: solo se sustituyen `attn_output_b`, `ffn_down_shexp` y `engram_wkv`, mientras que las 384 capas de expertos enrutados quedan byte a byte como las publicó ISTA. Según la model card, esto preserva la precisión de tarea (GPQA-Diamond idéntico al cuantizado original, AIME25 dentro del ruido) y reduce los rechazos en JailbreakBench del 85-89 % al 0 % en las tres variantes publicadas.

El modelo está pensado para ejecutarse en una sola GPU de 12 GB mediante el runtime Strata, que mantiene el backbone en memoria del sistema y transmite la tabla Engram (110 GB) desde un SSD. No es compatible con llama.cpp en el momento de publicación. El repositorio ocupa 414,2 GB e incluye tres "rungs" de cuantización: IQ2_XXS (2,0 bpw, 249 GB), IQ2_XS (2,25 bpw, 266 GB) e IQ1_M (1,75 bpw, 231 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos, proyección Engram y escritores densos en el residual |
| Parametros totales | 551.880.949.208 (dato de safetensors); la model card menciona 763B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw) en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de 4 partes por rung) + fichero Engram separado de 110 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 384 expertos enrutados y una tabla Engram que actúa como memoria de consulta masiva, lo que explica el desfase entre los 551,9 mil millones de parámetros contados en safetensors y los 763B que cita la model card. La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precisión aprendido sobre los expertos enrutados, que se conserva intacto en esta variante.

La edición "uncensored" consiste en proyectar fuera la dirección de rechazo de DeepSeek con fuerza 2,0, aplicada en precisión completa y luego cuantizada al tipo exacto por tensor de ISTA, pero solo sobre los tensores densos que escriben en el residual: salida de atención, down-projection del experto compartido y proyección de valor Engram. No se ha realizado un entrenamiento adicional ni RLHF/DPO específico para esta variante; la model card no documenta el volumen de tokens ni la composición del dataset del modelo base. La innovación destacable es el runtime Strata, que permite servir un modelo de este tamaño en hardware de consumo transmitiendo la tabla Engram desde SSD.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo "thinking" configurable (la model card evalúa con esfuerzo de razonamiento 50 y "thinking high").
- Razonamiento matemático y científico: evaluado en AIME25 y GPQA-Diamond.
- Conocimiento general: evaluado en MMLU (500 preguntas).
- Respuestas sin rechazos por dirección de rechazo proyectada: la model card reporta 0 % de jailbreak exitoso en JailbreakBench EN en los tres rungs.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (los benchmarks reportados son en inglés).
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazos: permite estudiar el comportamiento de un modelo de 763B con la dirección de rechazo eliminada, comparando directamente contra el cuantizado original en el mismo runtime, con métricas de KL y MMLU publicadas.
- Evaluación de robustez de clasificadores de seguridad: al pasar de 85-89 % a 0 % en JailbreakBench, sirve como caso de prueba adversario para medir la eficacia de filtros externos y clasificadores de salida.
- Despliegue local en hardware de consumo: con 12 GB de VRAM y Strata, se puede servir un MoE de este tamaño en una estación de trabajo con SSD rápido, útil para prototipado sin clúster.
- Razonamiento científico asistido: los resultados en GPQA-Diamond (83,3 %) y AIME25 (76,7-80,0 %) lo hacen adecuado para tareas de matemáticas y ciencia de nivel experto donde se tolera un modo thinking largo.
- Generación de texto creativo y conversacional sin restricciones temáticas: el caso de uso declarado por el autor, orientado a aplicaciones de chat donde los rechazos interrumpen la conversación.
- Benchmarking de cuantizaciones de muy baja precisión: los tres rungs (1,75-2,25 bpw) permiten comparar degradación de precisión en un modelo de 384 expertos, con logs por pregunta en el repositorio de métricas.
- Experimentación con arquitecturas Engram: la separación entre backbone y tabla Engram de 110 GB permite estudiar el impacto de servir la memoria desde SSD frente a memoria principal.

## Benchmarks y rendimiento

Resultados reportados en la model card. "→" indica stock GSQ-RCO → esta variante uncensored.

| Benchmark | IQ2_XXS | IQ2_XS | IQ1_M |
|---|---|---|---|
| JailbreakBench (EN) | 85,2 % → 0,0 % | 86,4 % → 0,0 % | 88,9 % → 0,0 % |
| XSTest (safe refused) | 7,6 % → 0,0 % | 4,0 % → 0,4 % | 4,8 % → 0,0 % |
| Thinking high (30) | 27/30 → 0/30 | 27/30 → 2/30 | 27/30 → 1/30 |
| MMLU (500) | 82,8 % (p=0,27) | 81,6 % (p=1,00) | 80,6 % (p=0,75) |
| KL al stock | 0,0225 | 0,0272 | 0,0207 |

Comparativa de razonamiento (IQ2_XXS, Strata, esfuerzo 50):

| Benchmark | Stock GSQ-RCO | Uncensored |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3 % | 83,3 % |
| AIME25 (30 preguntas) | 76,7 % | 80,0 % |

El KL se calcula con el modo de puntuación teacher-forced de Strata y es una cota inferior con top-64, por lo que el valor real es algo superior. No se han publicado resultados de benchmarks del modelo base DeepSeek-V4.1-Flash-1017 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB según la model card, gracias a que el backbone reside en memoria del sistema y la tabla Engram se transmite desde SSD.
- Almacenamiento: mínimo 231 GB (IQ1_M), 249 GB (IQ2_XXS) o 266 GB (IQ2_XS) para los shards, más 110 GB del fichero Engram compartido de ISTA-DASLab, que debe estar en un SSD rápido.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU con 12 GB de VRAM. No hay datos para A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? Sí, en una GPU de 12 GB (por ejemplo, gama RTX xx60/xx70 de 12 GB), siempre que se cumpla el requisito de memoria del sistema y SSD.
- Opciones de despliegue: exclusivamente Strata (https://github.com/Niko1221/Strata). La model card indica que DeepSeek-V4.1 con fichero Engram separado no está todavía en llama.cpp. No hay soporte documentado para vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO (este) | 551,9B (safetensors) / 763B (model card) | no disponible | MIT | GGUF + Engram | Edición de rechazos, runtime Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | mismo | no disponible | MIT (según repo base) | GGUF + Engram | Cuantizado original sin edición; referencia de comparación |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | mismo | no disponible | MIT | GGUF | Misma edición de rechazos, empaquetado distinto |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B (según model card) | no disponible | no disponible | safetensors | Modelo base original de DeepSeek |

No se dispone de datos de benchmarks del modelo base ni de alternativas de otros fabricantes para una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos, lo que incluye contenido dañino o ilegal.
- Con thinking activado, la edición planifica una respuesta a una petición que de otro modo se rechazaría (texto truncado en la model card).
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base no documenta tasas de alucinación.
- Idiomas soportados no declarados; los benchmarks publicados son en inglés, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en ventanas largas.
- La model card advierte de que no todos los rungs superaron todas las puertas de calidad y se publican tal cual, con sus números; conviene revisar la tabla antes de elegir uno.
- Dependencia exclusiva del runtime Strata: no hay soporte en llama.cpp, vLLM, Ollama ni TGI, lo que limita la integración en producción.
- Requiere 110 GB adicionales de almacenamiento SSD para el fichero Engram, además de los shards del rung elegido.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base es de DeepSeek y la model card no detalla posibles restricciones heredadas del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- El autor del repo (zanezhang666) no es el mismo que el equipo que realizó la cuantización (AtomicChat); conviene verificar la integridad de los shards frente al repositorio de ISTA-DASLab.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
