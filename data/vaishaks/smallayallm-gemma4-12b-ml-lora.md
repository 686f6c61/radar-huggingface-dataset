# vaishaks/smallayallm-gemma4-12b-ml-lora

## Resumen

Smallayallm es un adaptador LoRA de rango 16 y alpha 32 (65,6 millones de parámetros entrenables, el 0,545 % del modelo) sobre el checkpoint instruct `unsloth/gemma-4-12b-it`, ajustado para conversación en malayalam (malabar). Lo publica el usuario vaishaks como versión v0 de un proyecto de investigación; el método completo, las mediciones y las limitaciones están en el repositorio de GitHub asociado al modelo.

El adaptador se entrenó con 61.594 registros de SFT (Aya Malayalam 1.594, IndicAlign 40.000 y BPCC-Human 20.000 en ambas direcciones de traducción) en una única NVIDIA DGX Spark (GB10), con 39,0 horas de tiempo de pared, 7.700 pasos y un pico de memoria de 54,4 GB. El repositorio pesa 0,3 GB y se distribuye en safetensors con licencia Apache 2.0.

Su interés es doble: por un lado, documenta de forma reproducible el ajuste de un modelo de 12B en hardware compacto; por otro, publica una evaluación por prompts con resultados mixtos, con mejoras claras en pureza de escritura malayalam (81,9 % a 89,7 %) y en traducción (chrF++ en→ml de 25,57 a 38,73), pero también regresiones explícitas en resumen. No hay resultados de benchmarks estándar tipo MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre un transformer decoder-only Gemma 4 de 12B; el detalle interno de la arquitectura base no está disponible en la información proporcionada |
| Parametros totales | Modelo base de aproximadamente 12B; el adaptador añade 65,6 M de parámetros entrenables (0,545 % del total) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento se hizo con longitud máxima de 1024 tokens |
| Tipos de cuantizacion | No disponible para el adaptador (se publica en safetensors sin cuantizar); las cuantizaciones aplicables dependen del modelo base |
| Idiomas soportados | Malayalam (ml) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA; requiere cargar el modelo base `unsloth/gemma-4-12b-it`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo: se aplica sobre `unsloth/gemma-4-12b-it` con rango 16, alpha 32 y 65,6 M de parámetros entrenables. El autor señala un caveat relevante para la reproducción: el entrenamiento partió del checkpoint instruct y no del checkpoint base, porque el repositorio base de Google estaba restringido en ese momento y el mirror de Unsloth era la fuente accesible.

La configuración de entrenamiento fue bf16, longitud máxima de 1024 tokens, pérdida solo sobre la completación, tasa de aprendizaje 1e-4 con schedule coseno, batching agrupado por longitud, batch efectivo de 16 y 2 épocas (7.700 pasos). Sobre una DGX Spark (GB10) midió 140.407 segundos (39,0 horas) de tiempo de pared, con la pérdida bajando de 4,27 en el primer paso registrado a 0,673 al final y un pico de memoria de 54,4 GB. La mezcla de datos combina conversación sintética anclada en Wikipedia y pares de traducción gold con una proporción pequeña de datos escritos por humanos (la parte de Aya más una porción fina de IndicAlign).

## Capacidades

- Conversación multi-turno en malayalam, con respuesta también en inglés.
- Traducción en ambas direcciones (en→ml y ml→en), evaluada con chrF++ sobre referencias de BPCC-Human.
- Razonamiento aritmético básico: 6/6 respuestas exactas en el conjunto de evaluación, tanto en el modelo base como en el ajustado.
- Cumplimiento de formatos restringidos: 12/12 comprobaciones superadas, igual que el modelo base.
- Disciplina de escritura: genera malayalam en lugar de transliteración latina en la mayoría de los casos (pureza media del 89,7 % frente al 81,9 % del base).
- Manejo parcial de Manglish (malayalam escrito con caracteres latinos): una de las dos prompts de esa categoría pasó de 0,0 % a 82,5 % de pureza.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente, razonamiento multi-paso explícito, visión o audio: no documentadas en la información disponible.

## Casos de uso

- Traducción en→ml en producción editorial: el adaptador mejora el chrF++ de 25,57 a 38,73 frente al modelo base, por lo que es adecuado como primera pasada de traducción de contenido web o documentación antes de revisión humana.
- Traducción ml→en para soporte interno: con chrF++ de 61,08 sobre referencias BPCC-Human, sirve para convertir tickets o correos en malayalam a inglés y enrutarlos a equipos que no dominan el idioma.
- Asistente conversacional en malayalam: al mantener la escritura nativa en el 89,7 % de las prompts evaluadas, reduce el fallo típico de modelos multilingües que responden en transliteración latina.
- Normalización de Manglish: para entradas de usuario escritas en malayalam con alfabeto latino, el adaptador reescribe en escritura nativa en una de las dos pruebas documentadas; útil en moderación o preprocesado, siempre con validación adicional.
- Generación con formato restringido: 12/12 comprobaciones superadas permiten usarlo en plantillas de extracción o respuestas estructuradas donde el formato es un requisito duro.
- Base para investigación en ajuste eficiente: el adaptador y su configuración (r=16, alpha=32, 39 h en una DGX Spark) sirven como referencia reproducible para experimentos de LoRA en modelos de 12B con presupuesto de una sola máquina.
- Demo acotada en ZeroGPU: el Space asociado ofrece unas pocas conversaciones diarias por cuenta, adecuado para validación cualitativa con hablantes nativos antes de un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación del autor es un conjunto congelado de 48 prompts (8 categorías de 6), con decodificación greedy idéntica para base y ajustado, y solo con las capas automática y de checklist (la capa subjetiva de fluidez y registro está pendiente).

| Metrica | Modelo base | Adaptador Smallayallm |
|---|---|---|
| Pureza media de escritura, prompts que esperan malayalam (45) | 81,9 % | 89,7 % |
| Respuestas exactas de matemáticas | 6/6 | 6/6 |
| Comprobaciones de formato restringido superadas | 12/12 | 12/12 |
| Passes totales de checklist automática | 43 (22 fallos) | 56 (9 fallos) |
| Traducción chrF++ en→ml | 25,57 | 38,73 |
| Traducción chrF++ ml→en | 33,45 | 61,08 |
| Pureza Manglish COLL-01 | 0,0 % | 82,5 % |
| Pureza Manglish COLL-04 | 0,0 % | 0,0 % |
| Pureza media de escritura en resumen | 96,3 % | 81,6 % |

Los resultados por prompt están en `eval_v0_results.json` del repositorio de GitHub.

## Requisitos de hardware

- Tamaño del adaptador: 0,3 GB en safetensors; hay que sumarle el modelo base completo.
- VRAM estimada para el base en bf16: del orden de 24 GB solo para pesos (12B a 2 bytes por parámetro), más caché KV y activaciones; cifra estimada, no medida por el autor.
- VRAM estimada en 8 bits: en torno a 12 GB; en 4 bits, en torno a 6-7 GB. Estimaciones derivadas del número de parámetros, no verificadas en la información disponible.
- GPU consumer: el base en bf16 encaja ajustadamente en 24 GB (RTX 3090, RTX 4090); en cuantización de 4 bits cabría en tarjetas de 8-12 GB.
- Entrenamiento documentado: una sola NVIDIA DGX Spark (GB10) con pico de 54,4 GB, 39,0 horas y 7.700 pasos para 2 épocas con batch efectivo de 16.
- Despliegue: el adaptador es compatible con el ecosistema PEFT/Hugging Face; para servir modelos con adaptadores LoRA son habituales vLLM y TGI, y para CPU o equipos modestos llama.cpp u Ollama previa conversión a GGUF (ninguna de estas integraciones está verificada en la información disponible).
- Latencia y throughput: no disponibles.
- Demo: Space en ZeroGPU con cuota documentada de 5 GPU-minutos diarios por cuenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smallayallm (este adaptador) | 12B base + 65,6 M LoRA | Entrenado a 1024 tokens | Pureza 89,7 %, chrF++ en→ml 38,73, ml→en 61,08 | Apache 2.0 | Pesos en HuggingFace, 0 descargas |
| `unsloth/gemma-4-12b-it` (base) | 12B | No disponible | Pureza 81,9 %, chrF++ en→ml 25,57, ml→en 33,45 | No disponible en la información proporcionada | Mirror accesible del checkpoint instruct |
| Otros adaptadores LoRA para malayalam | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación se limita al modelo base frente al que se midió el ajuste.

## Limitaciones y advertencias

- La mayor parte de la mezcla de entrenamiento es sintética (conversación anclada en Wikipedia y pares de traducción gold); la porción escrita por humanos es pequeña.
- Regresión documentada en resumen: la pureza media de escritura cae del 96,3 % al 81,6 %, y una de las salidas (SUMM-02) fue un único carácter de punto.
- La pureza de escritura empeoró en 5 de los 45 prompts que esperaban malayalam, aunque mejoró en 37.
- De las dos prompts de Manglish, solo una se corrigió; la otra (COLL-04) se mantuvo en 0,0 %.
- La evaluación usa 6 prompts por categoría: es un smoke test que ordena modos de fallo, no una base para afirmaciones estadísticas ajustadas.
- La capa subjetiva de fluidez y registro por un hablante nativo está pendiente y no se sustituye por un juez LLM.
- El ajuste partió del checkpoint instruct, no del base, por el gating del repositorio de Google; esto condiciona la reproducibilidad y la interpretación de las comparaciones.
- Ventana de entrenamiento de 1024 tokens: es previsible degradación en entradas y salidas largas, aunque el contexto real del modelo base no está documentado aquí.
- Licencia: el adaptador declara Apache 2.0, pero el uso comercial depende también de los términos del modelo base, que deben verificarse por separado antes de desplegar.
- Estado del proyecto: v0 con 0 descargas y 0 likes, sin validación externa ni pipeline declarado; no hay garantías de mantenimiento.
- Riesgo de alucinación no cuantificado: no se ha publicado ninguna medición de factualidad en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vaishaks/smallayallm-gemma4-12b-ml-lora
- Modelo base: https://huggingface.co/unsloth/gemma-4-12b-it
- Repositorio GitHub (paper, método y `eval_v0_results.json`): https://github.com/vaishaks/smallayallm
- Dataset de SFT: https://huggingface.co/datasets/vaishaks/smallayallm-sft-v0
- Demo Gradio (ZeroGPU): https://huggingface.co/spaces/vaishaks/smallayallm-demo
