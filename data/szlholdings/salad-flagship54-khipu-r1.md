# SZLHOLDINGS/salad-flagship54-khipu-r1

## Resumen

`salad-flagship54-khipu-r1` es un conjunto de adaptadores PEFT/LoRA publicados por SZLHOLDINGS (Stephen Lutar) bajo el identificador de lane `flagship54-khipu-r1`. El repositorio contiene exclusivamente los checkpoints del adaptador (`checkpoint-50`, `checkpoint-100`, `checkpoint-150`, `checkpoint-200` y `final/`), no los pesos completos del modelo base, que no se identifica en la model card. El tamano del repo (1,0 GB) es coherente con un adaptador de rango bajo sobre un modelo de varios miles de millones de parametros, pero el dato concreto no esta disponible.

La model card es deliberadamente minimalista y se presenta como un "receipt-style model card": documenta artefactos y recibos de entrenamiento sin certificar capacidades. El autor declara explicitamente que no se ha ejecutado ninguna bateria de evaluacion sobre el adaptador y que no se emiten afirmaciones de calidad, benchmark o disponibilidad para despliegue. Se aplica una doctrina "fail-closed": sin recibo, no se afirma nada.

Por tanto, el interes de esta ficha es acotado: sirve para localizar los artefactos, verificar el recibo de entrenamiento y entender que cualquier uso en produccion requeriria identificar el modelo base, ejecutar evaluaciones propias y revisar la licencia "other", cuyos terminos no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador PEFT/LoRA; el modelo base no se identifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | safetensors (adaptador LoRA; checkpoints `checkpoint-50` a `checkpoint-200` y `final/`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT/LoRA, no un modelo completo. La model card no especifica la arquitectura del modelo base sobre el que se aplica el adaptador, ni su numero de parametros, ni la composicion del dataset de entrenamiento. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineamiento.

El recibo de entrenamiento extraido de `checkpoint-200/trainer_state.json` indica: 200 pasos globales completados sobre un maximo de 200, epoca 50,0 en el ultimo paso, perdida de entrenamiento de 0,0694, precision media por token de 0,9798 y tasa de aprendizaje final de 1,52e-08. Estos valores describen el ajuste sobre los datos de entrenamiento y no constituyen evidencia de calidad en datos retenidos: el propio autor lo senala al indicar que no se ha ejecutado ninguna bateria de evaluacion. El numero de epocas (50) sobre solo 200 pasos sugiere un dataset de entrenamiento muy pequeno, aunque el tamano exacto no se publica.

Como evidencia adicional se referencian los registros de latido de la lane (`mesh/lanelogs/flagship54-khipu-r1-hb*.log`) y los recibos de la "estate khipu battery" en el dataset `SZLHOLDINGS/frontier-54-runs`, bajo el directorio `receipts/`.

## Capacidades

- No se declaran capacidades en la model card. El autor indica explicitamente que no emite afirmaciones de capacidad.
- Generacion de texto, razonamiento, codigo, matematicas o vision: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modos especiales (thinking mode, vision, audio): no disponible.
- Al ser un adaptador LoRA, sus capacidades efectivas dependen enteramente del modelo base, que no se identifica.

## Casos de uso

- Investigacion de adaptadores LoRA: el repositorio permite inspeccionar la evolucion de un adaptador a lo largo de sus checkpoints (50, 100, 150, 200 y final) y estudiar la dinamica de perdida y precision por token registrada en `trainer_state.json`.
- Reproduccion de recibos de entrenamiento: los logs de latido y los recibos del dataset `SZLHOLDINGS/frontier-54-runs` permiten auditar el proceso de entrenamiento de la lane y contrastarlo con el estado del checkpoint.
- Experimentacion con tecnicas PEFT: util para comparar el comportamiento de un adaptador de rango bajo sobre un modelo base propio, una vez identificado o sustituido el base original.
- Base para evaluaciones propias: dado que no existe bateria de evaluacion publicada, un equipo podria montar su propio conjunto de pruebas y medir el adaptador frente a su modelo base sin adaptar.
- Estudio de doctrinas de publicacion "fail-closed": el repositorio es un ejemplo de publicacion de artefactos sin afirmaciones de capacidad, util como referencia metodologica para equipos que documentan experimentos internos.
- No se recomienda su uso en produccion sin antes identificar el modelo base, verificar la licencia "other" y ejecutar evaluaciones de calidad y seguridad, ninguna de las cuales esta disponible en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se ha ejecutado ninguna bateria de evaluacion sobre el adaptador y que no se emiten afirmaciones de calidad ni de disponibilidad para despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base, que no se identifica.
- GPU recomendadas: no disponible por la misma razon.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador esta en formato safetensors y es compatible con el ecosistema PEFT (por ejemplo, carga mediante `peft` sobre el modelo base), pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al tratarse de un adaptador LoRA sin modelo base identificado ni evaluaciones publicadas, no es posible establecer una comparacion significativa con modelos completos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas de calidad ni verificacion en datos retenidos; el unico dato de rendimiento es la perdida de entrenamiento (0,0694) y la precision por token (0,9798) en el ultimo paso, que no miden generalizacion.
- Modelo base no identificado: sin saber sobre que modelo se aplica el adaptador, no se pueden inferir capacidades, contexto, idiomas ni requisitos de hardware.
- Licencia "other": los terminos no se detallan en la model card; es imprescindible contactar con el autor o revisar documentacion adicional antes de cualquier uso comercial.
- Riesgo de sobreajuste: 50 epocas sobre solo 200 pasos apuntan a un dataset de entrenamiento muy pequeno, lo que aumenta el riesgo de sobreajuste y de comportamiento erratico fuera de la distribucion de entrenamiento.
- Sin datos sobre sesgos, alucinacion o comportamiento multilingue: no disponibles.
- Sin garantias de produccion: el autor no certifica los artefactos; la doctrina "fail-closed" implica que cualquier afirmacion de calidad debe provenir de evaluaciones propias del usuario.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-flagship54-khipu-r1
- Dataset de registros y recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Logs de latido de la lane: `mesh/lanelogs/flagship54-khipu-r1-hb*.log` dentro del dataset anterior
- Recibos de la "estate khipu battery": directorio `receipts/` dentro del dataset anterior
- Paper, blog, repositorio de codigo o demo: no disponibles
