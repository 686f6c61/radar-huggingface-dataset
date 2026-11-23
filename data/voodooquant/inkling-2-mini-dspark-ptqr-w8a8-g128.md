# voodooquant/Inkling-2-Mini-DSpark-PTQR-W8A8-G128

## Resumen

Inkling-2-Mini-DSpark-PTQR-W8A8-G128 es un modelo borrador (draft model) cuantizado a INT8, publicado por voodooquant, que se utiliza junto al modelo objetivo Inkling 2 Mini PTQR W4A8 para acelerar la inferencia mediante decodificación especulativa (speculative decoding). No es un modelo autónomo de generación de texto: consume los estados ocultos del modelo objetivo y comparte su cabeza de vocabulario, proponiendo tokens que el modelo objetivo verifica después. El peso del repositorio es de 0,4 GB, lo que refleja que se trata de un componente auxiliar de pequeño tamaño (fichero de pesos `mtp.safetensors` de 378.018.080 bytes) y no de un modelo completo.

El modelo base es `thinkingmachines/Inkling-2-Mini`, desarrollado por Thinking Machines Lab, y esta release distribuye únicamente los pesos del borrador modificados mediante PTQR (post-training quantization with rounding-dither retraining) bajo licencia Apache 2.0. La técnica PTQR ajusta los pesos cuantizados y las escalas de grupo bajo la cuantización de activaciones usada en inferencia, de modo que el borrador INT8 mantenga una tasa de aceptación cercana a la del borrador original en BF16.

Su relevancia es práctica: permite desplegar decodificación especulativa con el decodificador DSpark (tres capas, siete propuestas por ronda) en hardware AMD MI100 con ROCm, reduciendo el coste de memoria del borrador sin degradar de forma apreciable la aceptación. Está pensado para servirse con vLLM (fork específico) y no soporta inferencia directa como modelo de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (borrador de decodificación especulativa): decodificador de tres capas con cabeza Markov recurrente; consume estados ocultos del modelo objetivo |
| Parametros totales | no disponible (fichero de pesos de 378.018.080 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo; se midieron prompts de ~2k y ~33k tokens) |
| Tipos de cuantizacion | INT8 W8A8 con group size 128 (27 matrices de atención y MLP); escalas de pesos en FP16; embeddings de tokens y cabeza Markov recurrente en BF16; KV cache del borrador en `int8_block_g128` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`mtp.safetensors`), servido con vLLM |

## Arquitectura y entrenamiento

El borrador DSpark es un decodificador de tres capas que genera siete propuestas por ronda de decodificación especulativa. Consume los estados ocultos del modelo objetivo y comparte su cabeza de vocabulario, por lo que no dispone de vocabulario propio ni de capacidad de generación independiente. Las 27 matrices de proyección de atención y MLP usan pesos INT8 con signo y activaciones INT8 cuantizadas dinámicamente con group size 128; las escalas de pesos se almacenan en FP16, mientras que el embedding de tokens y la cabeza Markov recurrente se mantienen en BF16. El KV cache del borrador usa el formato `int8_block_g128`.

El entrenamiento PTQR parte del profesor borrador en BF16 original (incluido en `mtp.safetensors` del modelo upstream) y ajusta los pesos cuantizados usando log-probabilidades del objetivo y etiquetas de siguiente token extraídas de trayectorias reales del modelo objetivo. El run utilizó 32 secuencias de entrenamiento, ocho secuencias independientes reservadas y 60 pasos de entrenamiento. En las 56 posiciones de propuesta reservadas, el borrador exportado coincidió con la elección top del borrador original en 55 posiciones, y ambos coincidieron con la elección top del objetivo en 40. Los programas de captura y entrenamiento están en el fork de vLLM (`scripts/calibrate_inkling2mini_dspark.py` y `scripts/ptqr_inkling2mini_dspark.py`).

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa: emite hasta siete propuestas por ronda que el modelo objetivo verifica.
- Consumo de estados ocultos del modelo objetivo y uso compartido de su cabeza de vocabulario.
- Soporte de KV cache cuantizado en INT8 con bloques de 128 (`int8_block_g128`).
- Integración con el método de serving `dspark` en el fork de vLLM probado (revisión `4e51068a8d31f2fb71f07abda0ac558abea7a98e`).
- Ejecución en hardware AMD MI100 con ROCm (medido con cuatro MI100 sobre XGMI a 105 W por tarjeta).
- No soporta generación de texto autónoma, tool calling, agentes, visión, audio ni capacidades multilingües propias: hereda el comportamiento del modelo objetivo al que acompaña.
- No soporta inferencia directa (`inference: false` en la model card).

## Casos de uso

- Aceleración de inferencia del modelo Inkling 2 Mini PTQR W4A8 en producción: se despliega como borrador emparejado con el objetivo para reducir la latencia de decodificación en cargas de texto generativo, manteniendo una aceptación de ~1,97 propuestas de 7 con prompts de ~2k tokens.
- Serving multi-stream en clústeres AMD: las mediciones se realizaron con 12 streams concurrentes en cuatro MI100, por lo que encaja en despliegues con concurrencia moderada sobre ROCm y vLLM.
- Reducción de huella de memoria del borrador: al ocupar 0,4 GB en INT8 frente al borrador BF16 original, libera VRAM/HBM para el modelo objetivo o para más streams concurrentes.
- Evaluación de decodificación especulativa en hardware AMD: sirve como referencia reproducible para comparar tasas de aceptación entre borradores INT8 y BF16 en MI100.
- Investigación sobre cuantización PTQR: los scripts de calibración y entrenamiento del fork permiten reproducir el pipeline y adaptarlo a otros borradores u objetivos.
- Despliegue con prefijos compartidos largos: con prompts de ~33k tokens y prefijo compartido calentado la aceptación sube a 2,34 de 7, lo que lo hace adecuado para cargas con contexto largo y prefijos reutilizados (por ejemplo, system prompts extensos).
- Integración en pipelines de vLLM existentes: se configura apuntando `DRAFT_MODEL_DIR` al directorio del repositorio y usando el ID de modelo objetivo `inkling-2-mini` en las peticiones a la API.

## Benchmarks y rendimiento

Las únicas métricas publicadas son las tasas de aceptación del borrador emparejado con el objetivo W4A8, medidas con 12 streams concurrentes, cuatro MI100 sobre XGMI a 105 W por tarjeta y 256 tokens de salida por stream, con temperatura 1,0, top-p 0,95 y top-k 20. El token propio del objetivo se excluye del numerador.

| Longitud de prompt | PTQR INT8 aceptadas de 7 | Stock BF16 aceptadas de 7 |
|---|---:|---:|
| ~2k tokens | 1,97 | 1,99 |
| ~33k tokens, prefijo compartido calentado | 2,34 | 2,28 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es un generador autónomo.

## Requisitos de hardware

- VRAM/HBM para el borrador: 0,4 GB de pesos en INT8, más el KV cache del borrador en `int8_block_g128` (dependiente de la longitud de contexto y del número de streams).
- Requiere además el modelo objetivo Inkling 2 Mini PTQR W4A8, cuyo coste de memoria es independiente y no se detalla en esta información.
- GPU validadas: AMD MI100 con ROCm (cuatro tarjetas sobre XGMI a 105 W por tarjeta en las mediciones publicadas).
- No se ha documentado compatibilidad con GPU NVIDIA ni con GPU de consumo en la información disponible.
- Despliegue: vLLM mediante el fork `curvedinf/int8-vllm` (revisión probada `4e51068a8d31f2fb71f07abda0ac558abea7a98e`), método de serving `dspark` con siete propuestas e INT8 draft KV. No se indica soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se publican tasas de aceptación.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-DSpark-PTQR-W8A8-G128 (este) | Borrador DSpark INT8, 3 capas, 7 propuestas | safetensors INT8 W8A8 g128 | Depende del objetivo | Apache 2.0 | Hugging Face (vLLM) |
| Borrador DSpark stock BF16 (incluido en `thinkingmachines/Inkling-2-Mini`) | Borrador DSpark BF16, 3 capas, 7 propuestas | safetensors BF16 | Depende del objetivo | Apache 2.0 | Hugging Face |
| Inkling-2-Mini-PTQR-W4A8-G128 (objetivo) | Modelo objetivo cuantizado W4A8 | safetensors W4A8 g128 | No disponible | Apache 2.0 | Hugging Face (vLLM) |

No se dispone de datos de benchmarks comparativos con otros borradores de decodificación especulativa en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse para generación de texto, chat ni tareas de razonamiento por sí solo; requiere el objetivo Inkling 2 Mini PTQR W4A8.
- Solo se ha validado emparejado con el objetivo W4A8 indicado; usar otro objetivo o cuantización puede invalidar las tasas de aceptación publicadas.
- El entrenamiento PTQR fue muy corto (60 pasos, 32 secuencias) y la validación se limitó a 56 posiciones de propuesta, por lo que la robustez fuera de ese régimen no está demostrada.
- La aceptación medida es modesta (~2 de 7 propuestas en prompts de ~2k tokens), lo que limita la ganancia de velocidad frente a otros borradores más agresivos.
- Hardware validado restringido a AMD MI100 con ROCm; no hay evidencia de funcionamiento en NVIDIA, otras GPU AMD o GPU de consumo.
- Requiere un fork específico de vLLM; no es compatible con vLLM upstream sin ese fork.
- No se documentan idiomas soportados, sesgos ni riesgos de alucinación propios; estos dependen enteramente del modelo objetivo.
- Los pesos derivan de `thinkingmachines/Inkling-2-Mini` (Thinking Machines Lab); la release solo cubre los pesos del borrador modificados por PTQR bajo Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/voodooquant/Inkling-2-Mini-DSpark-PTQR-W8A8-G128
- Modelo objetivo emparejado: https://huggingface.co/voodooquant/Inkling-2-Mini-PTQR-W4A8-G128
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión upstream del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a
- Fork de vLLM: https://github.com/curvedinf/int8-vllm
- Registro de entrenamiento PTQR: `./ptqr-training.json` (en el repositorio)
- Licencia: `./LICENSE` (en el repositorio)
