# wayne-SFT/Phi-4-mini-instruct-SFT-ALFWorld

## Resumen

Phi-4-mini-instruct-SFT-ALFWorld es un checkpoint de ajuste fino supervisado (SFT) de parámetros completos sobre `microsoft/Phi-4-mini-instruct`, publicado por el usuario wayne-SFT. El modelo no es un asistente conversacional de propósito general, sino un punto de partida especializado para aprendizaje por refuerzo (RL) en el entorno ALFWorld, un benchmark de tareas de manipulación textual con acciones en lenguaje natural. Se entrenó con imitación de comportamiento (behavior cloning) sobre trayectorias expertas recogidas por el autor únicamente sobre los objetivos de entrenamiento de ALFWorld.

El modelo conserva la arquitectura Phi-3 de su base, con 3.836.021.760 parámetros totales en formato safetensors (fp32, 195 tensores), y una ventana de contexto que el entrenamiento limitó a 1280 tokens. El checkpoint publicado corresponde al paso global 30 de una ejecución de 50 pasos (1 época, 200 partidas expertas), con una tasa de éxito en el conjunto de desarrollo del 39,8 % (media de valid_seen 48,6 % y valid_unseen 31,0 % sobre 4 semillas de muestreo).

Su relevancia es acotada pero clara: sirve como inicialización reproducible para investigación en RL sobre agentes textuales, con licencia MIT y pesos guardados tal cual se entrenaron. No está pensado para uso en producción como modelo generalista ni para conversación abierta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Phi-3 (clase `Phi3ForCausalLM`) |
| Parámetros totales | 3.836.021.760 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1280 tokens (longitud máxima de secuencia usada en el entrenamiento SFT); contexto nativo de la base no indicado en la información disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32); la base admite cuantizaciones estándar de la familia Phi-3, pero no se documentan en esta ficha |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los de la base sin verificación) |
| Licencia | MIT (términos de la base: licencia de `microsoft/Phi-4-mini-instruct`) |
| Formato de pesos | safetensors (4 shards, todos los tensores F32; `config.json` declara `bfloat16` como dtype) |

## Arquitectura y entrenamiento

La arquitectura es la de Phi-4-mini-instruct: un transformer decoder-only de la familia Phi-3 con 3.836 millones de parámetros, cargado mediante clases nativas de transformers (se eliminó `config.auto_map` y se omitieron los ficheros de remote code `configuration_phi3.py`, `modeling_phi3.py` y `sample_finetune.py`). El ajuste fue de parámetros completos, con learning rate 1e-5, batch global 64 y longitud máxima de secuencia 1280. Los datos de SFT son trayectorias expertas recogidas por el autor sobre los objetivos de entrenamiento de ALFWorld (nombre interno `alf_sft_hc_n200`), es decir, 200 partidas expertas durante 1 época. El checkpoint publicado es el paso global 30 de 50.

No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación de decodificación (decodificación especulativa, atención lineal, etc.). El propósito declarado del checkpoint es servir como punto de partida para RL posterior, no como modelo final. Los pesos se guardaron tal como se entrenaron, sin conversión, en fp32, aunque el `config.json` declara `bfloat16` como dtype, lo que conviene tener en cuenta al cargar el modelo.

## Capacidades

- Generación de texto condicionada a observaciones de ALFWorld y emisión de acciones textuales dentro del entorno.
- Razonamiento de agente de un solo paso dentro de episodios de manipulación textual (behavior cloning de trayectorias expertas).
- Clonación de comportamiento: reproduce la política de los expertos usados en el SFT, no una política aprendida por refuerzo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: parcial, limitado al formato de ALFWorld y a la longitud de contexto de 1280 tokens.
- Capacidades multilingües: no verificadas; la model card no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Inicialización para RL en ALFWorld: el checkpoint es exactamente el punto de partida previsto para entrenar con refuerzo sobre el entorno; se cargaría como política inicial y se continuaría el entrenamiento con el algoritmo de RL elegido.
- Reproducción de experimentos de behavior cloning: permite replicar el pipeline de SFT (200 partidas expertas, 1 época, lr 1e-5, batch 64) y comparar tasas de éxito en valid_seen y valid_unseen.
- Línea base de agente textual: sirve como referencia de rendimiento (39,8 % de éxito medio en dev) frente a políticas entrenadas con RL o con más datos.
- Estudio de sobreajuste en SFT de agentes: al ser un checkpoint intermedio (paso 30 de 50), permite analizar la evolución de la política entre pasos y su generalización a valid_unseen.
- Evaluación de robustez de agentes en entornos textuales: útil para probar variaciones de prompt, plantillas de chat y semillas de muestreo sobre un mismo punto de partida.
- Docencia e investigación en agentes LLM: entorno controlado y de bajo coste computacional (modelo de 3,8 mil millones de parámetros) para experimentos de imitación y refuerzo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| ALFWorld valid_seen | 48,6 % de tasa de éxito | Media de 4 semillas de muestreo |
| ALFWorld valid_unseen | 31,0 % de tasa de éxito | Media de 4 semillas de muestreo |
| ALFWorld dev (media) | 39,8 % de tasa de éxito | Media de valid_seen y valid_unseen |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 15,3 GB solo para pesos (3.836.021.760 parámetros × 4 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 17,8 GB.
- VRAM estimada en bf16/fp16: aproximadamente 7,7 GB para pesos, más overhead; requiere conversión desde fp32, ya que los pesos publicados están en fp32.
- GPU recomendadas: A100 40 GB o H100 para fp32 sin conversión; RTX 4090 (24 GB) o A6000 (48 GB) para fp32 con margen; RTX 3090/4090 en bf16 tras conversión.
- Cabe en GPU de consumo: sí, en bf16 tras conversión en GPUs de 12-16 GB o superiores; en fp32 requiere al menos 24 GB con margen ajustado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repositorio; vLLM, llama.cpp u Ollama no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-SFT-ALFWorld | 3,84 B | 1280 tokens (entrenamiento) | Agente ALFWorld (SFT) | MIT | Hugging Face |
| microsoft/Phi-4-mini-instruct | 3,84 B | no disponible en esta ficha | Asistente generalista | Licencia de Microsoft | Hugging Face |
| Modelos de agente ALFWorld con RL | no disponible | no disponible | Agente ALFWorld (RL) | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en ALFWorld y no es un asistente generalista; su uso fuera de ese entorno no está validado.
- El entrenamiento se hizo solo con objetivos de entrenamiento de ALFWorld, lo que puede producir sobreajuste a esos escenarios y peor generalización en valid_unseen (31,0 % frente a 48,6 % en valid_seen).
- Los pesos están en fp32 aunque el `config.json` declara `bfloat16`; hay que gestionar la conversión explícitamente para evitar consumos de memoria inesperados.
- Longitud de contexto efectiva de 1280 tokens, insuficiente para episodios largos o conversaciones extensas.
- No se declaran idiomas soportados ni se han verificado capacidades multilingües.
- Riesgo de alucinación inherente a la base Phi-4-mini; no se documentan evaluaciones de sesgo ni de seguridad para este checkpoint.
- La licencia es MIT, pero se heredan los términos de `microsoft/Phi-4-mini-instruct`; conviene revisar la licencia de la base antes de uso comercial.
- Es un checkpoint intermedio (paso 30 de 50) pensado como inicialización para RL, no como modelo final de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wayne-SFT/Phi-4-mini-instruct-SFT-ALFWorld
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia de la base: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/LICENSE
