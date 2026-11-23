# voodooquant/Inkling-2-Mini-DSpark-INT8-PTQR

## Resumen

Inkling-2-Mini DSpark INT8 PTQR es un modelo borrador (draft model) para decodificacion especulativa, publicado por el usuario voodooquant como cuantizacion INT8 del drafter DSpark original que acompana al modelo base thinkingmachines/Inkling-2-Mini. No es un modelo generativo autonomo: consume los estados ocultos del modelo objetivo (target) y comparte su cabeza de vocabulario, proponiendo tokens que el target verifica en cada ronda. Su funcion es acelerar la inferencia del target reduciendo el numero de pasos de decodificacion autorregresiva.

El modelo aplica PTQR (post-training quantization with rounding-dither retraining), una tecnica que ajusta los pesos cuantizados y las escalas de grupo bajo la cuantizacion de activaciones usada en inferencia. El resultado es un drafter de tres capas con siete propuestas por ronda, pesos INT8 con activaciones INT8 dinamicas y grupo de 128, manteniendo en BF16 el embedding de tokens y la cabeza Markov recurrente.

Su relevancia es practica: demuestra que un drafter cuantizado a INT8 puede igualar la tasa de aceptacion del drafter BF16 original (1,97 frente a 1,99 propuestas aceptadas de 7 con prompts de ~2k tokens; 2,34 frente a 2,28 con ~33k tokens y prefijo compartido caliente) sobre hardware AMD MI100 con ROCm. Esta pensado para emparejarse exclusivamente con el target INT4 PTQR del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (draft model para decodificacion especulativa), 3 capas, 7 propuestas por ronda |
| Parametros totales | no disponible (pesos en `mtp.safetensors`, 378.018.080 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del target; mediciones hasta ~33k tokens) |
| Tipos de cuantizacion | INT8 W8A8 con grupo de 128 (gs128) en las 27 matrices de atencion y MLP; escalas de pesos en FP16; embedding y cabeza Markov en BF16; KV cache del draft en `int8_block_g128` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`mtp.safetensors`) + `config.json`; servido con vLLM |

## Arquitectura y entrenamiento

El drafter es un decodificador DSpark de tres capas que genera siete propuestas por ronda. Las 27 matrices de proyeccion de atencion y MLP usan pesos INT8 con signo y activaciones INT8 cuantizadas dinamicamente con tamano de grupo 128; las escalas de pesos se almacenan en FP16. El embedding de tokens y la cabeza Markov recurrente se mantienen en BF16, y la cache KV del draft usa el formato `int8_block_g128`. El modelo consume los estados ocultos del target y comparte su cabeza de vocabulario, por lo que no puede operar de forma independiente.

El entrenamiento PTQR parte del drafter BF16 de referencia y del profesor BF16 original, usando log-probabilidades del target y etiquetas de siguiente token extraidas de trayectorias reales del target. La ejecucion empleo 32 secuencias de entrenamiento, ocho secuencias independientes reservadas para validacion y 60 pasos de entrenamiento. En las 56 posiciones de propuesta reservadas, el drafter exportado coincidio con la eleccion top del drafter original en 55 posiciones, y ambos coincidieron con la eleccion top del target en 40. Los programas de captura y entrenamiento estan en el fork de vLLM del autor (`scripts/calibrate_inkling2mini_dspark.py` y `scripts/ptqr_inkling2mini_dspark.py`), con revision de servido probada `4e51068a8d31f2fb71f07abda0ac558abea7a98e`.

## Capacidades

- Decodificacion especulativa: propone hasta siete tokens por ronda que el target verifica, acelerando la generacion del modelo objetivo.
- Consumo de estados ocultos del target y uso compartido de la cabeza de vocabulario del mismo.
- Cuantizacion INT8 W8A8 con grupo de 128 en proyecciones, compatible con el target INT4 PTQR emparejado.
- Cache KV del draft en INT8 por bloques de 128, reduciendo el coste de memoria durante el servido.
- Servido mediante vLLM con el metodo `dspark` y el lanzador especifico para AMD MI100 con ROCm.
- Soporte de multiples flujos concurrentes: las mediciones se hicieron con 12 streams concurrentes en cuatro MI100.
- No es un modelo de proposito general: no genera texto de forma autonoma, no soporta tool calling por si mismo ni dispone de modo thinking, vision o audio propios.

## Casos de uso

- Aceleracion de inferencia del target Inkling-2-Mini INT4 PTQR: se despliega junto al target y reduce el numero de pasos autorregresivos al aceptar varias propuestas por ronda, con tasas de aceptacion de 1,97 a 2,34 de 7 segun longitud de prompt.
- Servicio de chat multi-turno con contexto largo: con prompts de ~33k tokens y prefijo compartido caliente, la aceptacion sube a 2,34 de 7, lo que resulta adecuado para conversaciones con historial extenso donde el prefijo se reutiliza entre turnos.
- Despliegue en clústeres AMD MI100: el lanzador incluido selecciona DSpark con siete propuestas y KV INT8, lo que permite servir el target en infraestructura ROCm sin GPUs NVIDIA.
- Reduccion de coste por token en produccion: al requerir menos pasos del target por token generado, disminuye el computo efectivo del modelo grande manteniendo la calidad del target.
- Evaluacion de tecnicas de cuantizacion post-entrenamiento: el registro `ptqr-training.json` y los scripts de calibracion permiten reproducir el pipeline PTQR sobre otros drafters.
- Investigacion en decodificacion especulativa: sirve como referencia para medir el impacto de cuantizar el drafter a INT8 frente a mantenerlo en BF16, con datos de aceptacion por longitud de prompt.
- Inferencia por lotes con concurrencia: las mediciones con 12 streams concurrentes y 256 tokens de salida por stream validan su uso en servicios con multiples peticiones simultaneas.

## Benchmarks y rendimiento

Tasa de aceptacion medida con el target W4A8 emparejado, 12 streams concurrentes, cuatro MI100 sobre XGMI a 105 W por tarjeta, 256 tokens de salida por stream, temperatura 1,0, top-p 0,95 y top-k 20. El token propio del target se excluye del numerador.

| Longitud de prompt | PTQR INT8 aceptados de 7 | Stock BF16 aceptados de 7 |
|---|---:|---:|
| ~2k tokens | 1,97 | 1,99 |
| ~33k tokens, prefijo compartido caliente | 2,34 | 2,28 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza del modelo: es un drafter, no un generador autonomo.

## Requisitos de hardware

- VRAM estimada para el drafter: el fichero de pesos ocupa 378.018.080 bytes (~0,35 GB); el repositorio completo mide 0,4 GB. A esto se suma la cache KV del draft en INT8 y el espacio del target, que domina el consumo total.
- El drafter debe desplegarse junto al target Inkling-2-Mini INT4 PTQR; el requisito de VRAM real lo marca el target, no el drafter.
- GPUs probadas: AMD MI100 (cuatro tarjetas sobre XGMI a 105 W por tarjeta) con ROCm.
- GPUs NVIDIA: no disponible; no se documenta compatibilidad probada con A100, H100 ni RTX 4090.
- Consumer GPU: no disponible; no hay datos de despliegue en GPUs de consumo.
- Opciones de despliegue: vLLM con el fork `curvedinf/int8-vllm` (revision `4e51068a8d31f2fb71f07abda0ac558abea7a98e`), metodo de servido `dspark`, apuntando `DRAFT_MODEL_DIR` al directorio con `config.json` y `mtp.safetensors`. Las peticiones API usan el ID del target, `inkling-2-mini`.
- Latencia y throughput: no disponibles como cifras absolutas; solo se publican tasas de aceptacion por ronda.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini DSpark INT8 PTQR (este) | Drafter INT8 W8A8 | no disponible (378 MB de pesos) | safetensors, vLLM | heredado del target | Apache 2.0 | Hugging Face, 0 descargas |
| DSpark BF16 stock (incluido en el target) | Drafter BF16 | no disponible | safetensors | heredado del target | Apache 2.0 (upstream) | Incluido en thinkingmachines/Inkling-2-Mini |
| Inkling-2-Mini INT4 PTQR | Target cuantizado W4A8 | no disponible | safetensors, vLLM | no disponible | Apache 2.0 | Hugging Face (voodooquant) |

La comparativa se limita al ecosistema Inkling-2-Mini porque el drafter solo funciona emparejado con su target. No se dispone de datos de otros drafters especulativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el target Inkling-2-Mini INT4 PTQR y comparte su cabeza de vocabulario; no puede generar texto por si solo.
- Acoplamiento estricto: el autor indica explicitamente que debe usarse con el target INT4 PTQR enlazado; otros targets o versiones pueden invalidar las tasas de aceptacion medidas.
- Datos de validacion limitados: el entrenamiento PTQR uso 32 secuencias, ocho de validacion y 60 pasos, con evaluacion en 56 posiciones de propuesta; es una muestra pequena.
- Rendimiento medido solo en AMD MI100 con ROCm y a 105 W por tarjeta; el comportamiento en NVIDIA u otras GPUs AMD no esta documentado.
- Las tasas de aceptacion dependen de la temperatura y del muestreo (medidas a temperatura 1,0, top-p 0,95, top-k 20); con otros parametros pueden variar.
- Idiomas soportados no disponibles; la cobertura linguistica depende del target.
- Riesgo de alucinacion: inherente al target, no al drafter, ya que este solo propone tokens que el target verifica.
- Licencia Apache 2.0 permite uso comercial, pero los pesos originales son de Thinking Machines Lab y esta release solo distribuye los pesos del draft modificados por PTQR.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validacion independiente por parte de la comunidad.
- El autor marca `inference: false` en los metadatos de la model card, lo que refleja que no es un modelo de inferencia directa.

## Enlaces

- Hugging Face: https://huggingface.co/voodooquant/Inkling-2-Mini-DSpark-INT8-PTQR
- Target emparejado: https://huggingface.co/voodooquant/Inkling-2-Mini-INT4-PTQR
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revision upstream de origen: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a
- Fork de vLLM: https://github.com/curvedinf/int8-vllm
- Registro de entrenamiento PTQR: ./ptqr-training.json (en el repositorio)
- Licencia: ./LICENSE (en el repositorio)
