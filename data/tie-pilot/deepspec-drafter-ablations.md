# TIE-Pilot/deepspec-drafter-ablations

## Resumen

`TIE-Pilot/deepspec-drafter-ablations` es un repositorio de puntos de control (checkpoints) de entrenamiento, no un modelo listo para inferencia general. Contiene doce brazos de ablacion de modelos borrador (drafters) para decodificacion especulativa, todos entrenados sobre el mismo objetivo congelado: `Qwen/Qwen3-4B`. Cada brazo se entreno exactamente durante una epoca (2.616 pasos de optimizador) con una tasa de aprendizaje de 6e-4 y 512 anclas, de modo que la comparacion entre variantes esta igualada por construccion y no queda confundida por diferencias en la duracion del entrenamiento.

El proposito del repositorio es aislar el efecto de decisiones de diseno concretas en el borrador: el tipo de cabeza de prediccion (vanilla de rango 256, atencion de prefijo de rango 512, condicional o XG v2.1), la inclusion de una convolucion corta, el uso de embeddings de slot y la mezcla de objetivos entre entropia cruzada (CE) y perdida L1. La metrica reportada es la longitud aceptada por el modelo objetivo, medida sobre 430 filas con temperatura cero. Los resultados muestran que la variante combinada de cabeza de atencion, convolucion corta y embeddings de slot alcanza 4,7655 frente a 4,5646 del DSpark vanilla, mientras que la reproduccion de DFlash2 se queda por debajo del vanilla en este presupuesto.

Es relevante ahora porque documenta de forma publica y reproducible el proceso de ablacion detras del modelo insignia `TIE-Pilot/dspark-attnconv-block7-qwen3-4b`, y porque advierte explicitamente de que una sola epoca no basta para juzgar una arquitectura: la misma receta alcanza el 87 por ciento de su longitud aceptada convergida tras una epoca. El repositorio pesa 32,3 GB, usa licencia Apache 2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificacion especulativa con cabeza de prediccion tipo Markov, convolucion corta opcional y embeddings de slot; implementado como `Qwen3DSparkModel`, un drafter de bloques paralelos personalizado (no es una arquitectura `transformers`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo objetivo congelado es `Qwen/Qwen3-4B`) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`<arm>/step_2616/model.safetensors`, acompanado de `config.json`, `train_config.py` y `training_metadata.json`) |

## Arquitectura y entrenamiento

El repositorio agrupa doce brazos que solo difieren en el eje que da nombre a cada uno. Las cabezas evaluadas son: vanilla de rango 256, atencion de prefijo de rango 512, condicional de rango 256 y XG v2.1, ademas de un brazo sin cabeza (DFlash). Se prueban ademas dos modificaciones opcionales, una convolucion corta y embeddings de slot con separacion cruzada/auto, y se varia el objetivo entre mezclas CE/L1 (0,1/0,9) y CE pura (1,0/0,0). La mayoria de los brazos opera sobre el bloque 7 (`b7`), salvo `official_dflash2_b8_qwen3_4b_1ep`, que reproduce la configuracion oficial sobre el bloque 8. El entrenamiento se hizo contra un `Qwen/Qwen3-4B` congelado, con 2.616 pasos por brazo y una unica epoca.

Una innovacion destacable es la columna de anclas (`markov_head.anchor_type`, `markov_head.anchor_norm.weight`), presente en los brazos de cabeza y combinado. Segun la model card, eliminarla en evaluacion no afecta a la aceptacion, y mantenerla provoco el colapso de ejecuciones mas largas: en el primer intento de la ejecucion de 10 epocas, la escala de gradiente de esa columna fue 13,7 veces la de un control sano tras normalizacion por mediana, frente a un techo de 2,45 veces en los otros 118 tensores. El modelo insignia publicado fija `markov_anchor_kv=False`. La model card advierte de que los brazos no aíslan contribuciones finales aditivas: el brazo de cabeza cambia a la vez la arquitectura de la cabeza y anade el objetivo de nominacion, y su escala de salida inicial es aproximadamente 0,0426 frente a 0,35 del brazo combinado.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre un modelo objetivo `Qwen/Qwen3-4B` congelado.
- Prediccion de multiples tokens por paso mediante cabeza tipo Markov (variantes vanilla, atencion de prefijo, condicional y XG v2.1).
- Modelado de dependencias locales mediante una convolucion corta opcional.
- Uso de embeddings de slot para representar posiciones dentro del bloque predicho, con variante de separacion cruzada/auto.
- Entrenamiento con objetivos mixtos de entropia cruzada y perdida L1, o con CE pura en los brazos DFlash.
- No se documentan capacidades de tool calling, function calling, agentes, multilingueismo, vision ni audio.
- No es un modelo de proposito general: no genera respuestas autonomas, solo propone tokens que el modelo objetivo verifica.

## Casos de uso

- Investigacion en decodificacion especulativa: comparar cabezas de prediccion y componentes bajo un presupuesto de entrenamiento identico, usando `train_config.py` de cada brazo para diferenciar exactamente que eje cambia.
- Aceleracion de inferencia de `Qwen3-4B` en produccion: desplegar el brazo `attnconv_b7_qwen3_4b` como drafter para elevar la longitud aceptada de 4,5646 a 4,7655 tokens por paso verificado.
- Reproduccion de resultados: reentrenar o evaluar la reproduccion de DFlash2 (`official_dflash2_b8_qwen3_4b_1ep`) para contrastar su longitud aceptada de 4,4409 frente al vanilla, ya que queda por debajo en este presupuesto.
- Punto de partida para entrenamientos mas largos: reutilizar los checkpoints como inicializacion, definiendo una nueva programacion de learning rate, dado que el estado del optimizador no se incluye y la programacion coseno original termino en cero.
- Estudio de estabilidad del entrenamiento: analizar el comportamiento de la columna de anclas y su efecto de colapso en ejecuciones prolongadas, activando o desactivando `markov_anchor_kv` de forma controlada.
- Analisis de convergencia: medir cuanto falta para la convergencia partiendo del 87 por ciento de longitud aceptada convergida que alcanza la receta tras una sola epoca.
- Auditoria de abliteracion de diseno: dado que los brazos no aíslan contribuciones aditivas, usarlos como comparaciones de diseno y no como descomposicion aditiva de mejoras.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la longitud aceptada, medida sobre 430 filas con temperatura cero, limite de 50 por tarea y longitud maxima de generacion de 2048. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

| Configuracion de una epoca | Directorio | Longitud aceptada | Diferencia frente a vanilla |
|---|---|---|---|
| DSpark vanilla | `dspark_b7_qwen3_4b_1ep` | 4,5646 | — |
| Reproduccion de DFlash2 | `official_dflash2_b8_qwen3_4b_1ep` | 4,4409 | −0,1237 |
| Vanilla + convolucion corta | `dspark_b7_qwen3_4b_1ep_shortconv` | 4,6133 | +0,0488 |
| Vanilla + embeddings de slot | `slotembed_b7_qwen3_4b` | 4,5552 | −0,0093 |
| Cabeza de atencion de prefijo | `attnhead_b7_qwen3_4b` | 4,6767 | +0,1122 |
| Cabeza + convolucion + embeddings de slot | `attnconv_b7_qwen3_4b` | 4,7655 | +0,2009 |

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no publica el numero de parametros del drafter, por lo que no puede estimarse con rigor la memoria necesaria.
- El modelo objetivo asociado, `Qwen/Qwen3-4B`, condiciona el presupuesto de memoria del sistema completo; el drafter se ejecuta en paralelo y anade su propio consumo, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, a falta del dato de parametros totales del drafter.
- Opciones de despliegue: no funciona con `AutoModel.from_pretrained` ni, presumiblemente, con los cargadores estandar de `transformers`. La carga requiere el codigo de DeepSpec, ya que `Qwen3DSparkModel` es un drafter personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Solo se reporta longitud aceptada por paso verificado, no tiempos de respuesta.
- Almacenamiento: 32,3 GB para el conjunto de los doce brazos.

## Comparativa con modelos similares

| Modelo | Relacion | Longitud aceptada (mismo presupuesto) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Brazo combinado `attnconv_b7_qwen3_4b` | Mejor brazo de este repositorio | 4,7655 | Apache 2.0 | HuggingFace |
| DSpark vanilla `dspark_b7_qwen3_4b_1ep` | Linea base dentro del repositorio | 4,5646 | Apache 2.0 | HuggingFace |
| Reproduccion de DFlash2 `official_dflash2_b8_qwen3_4b_1ep` | Alternativa interna (bloque 8) | 4,4409 | Apache 2.0 | HuggingFace |
| `TIE-Pilot/dspark-attnconv-block7-qwen3-4b` | Modelo insignia derivado de estas ablaciones | no disponible | Apache 2.0 | HuggingFace |
| `Qwen/Qwen3-4B` | Modelo objetivo congelado, no un drafter | no aplica | no disponible en la informacion | HuggingFace |

No se dispone de datos sobre otros drafters externos comparables (por ejemplo EAGLE o Medusa) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo para uso directo: son checkpoints de entrenamiento para ablacion, no pesos listos para servir.
- La carga requiere el codigo de DeepSpec; `AutoModel.from_pretrained` no resuelve la arquitectura `Qwen3DSparkModel`.
- Una sola epoca no basta para juzgar una arquitectura: la receta alcanza solo el 87 por ciento de su longitud aceptada convergida, por lo que las mejoras que rinden tarde pueden parecer ruido.
- Los brazos no aíslan contribuciones aditivas: el brazo de cabeza cambia simultaneamente la arquitectura y el objetivo de nominacion, y su escala de salida inicial difiere de la del brazo combinado.
- El estado del optimizador no esta incluido; cada brazo completo su programacion coseno hasta el final y registra `_last_lr == 0`, de modo que reanudar tal cual daria pasos de tamano cero. Continuar cualquier brazo exige definir una nueva programacion.
- La columna de anclas, si se mantiene en entrenamientos de mas de una epoca, provoco el colapso de ejecuciones largas por una escala de gradiente 13,7 veces superior a la de un control sano. El modelo insignia la desactiva.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma especificas, al no ser un modelo generativo autonomo.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias ni datos de rendimiento en produccion.
- El repositorio no tiene descargas ni valoraciones registradas en el momento de la consulta.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/TIE-Pilot/deepspec-drafter-ablations
- Modelo insignia referenciado: https://huggingface.co/TIE-Pilot/dspark-attnconv-block7-qwen3-4b
- Modelo base objetivo: https://huggingface.co/Qwen/Qwen3-4B
- La busqueda web realizada no devolvio enlaces relevantes al modelo, al autor ni al proyecto DeepSpec.
