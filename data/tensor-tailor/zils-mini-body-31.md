# tensor-tailor/zils-mini-body-31

## Resumen

zils-mini-body-31 es un "body" (pesos completos resultantes de un proceso de fusión y ajuste) publicado por el usuario tensor-tailor dentro del llamado pool Zils d3-mini. No se trata de un modelo entrenado desde cero, sino de una media ponderada de seis ejecuciones de LoRA (rango 32, alpha 64) sobre un punto de partida denominado MS11, que a su vez es un "soup" de dos cuerpos públicos. La fórmula aplicada es `body = start + 1.25 × (1/6) × Σ(run − start)`, es decir, el punto de partida más 1,25 veces la media de los deltas de las seis ejecuciones, que solo difieren en la semilla.

El modelo tiene 4.539.265.536 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de ~4,5B, coherente con el nombre interno `d3-mini-4.5b-v1`. El repositorio ocupa 9,1 GB y se distribuye bajo licencia Apache 2.0. La arquitectura declarada en los tags es `qwen3_5`, con código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code`.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de merging de LoRAs con evaluación interna propia; por otro, el propio autor reconoce que el resultado no alcanza el umbral de calidad preestablecido (+2,00 frente a un cambio medio de +1,14) y que falla la comprobación por familia (la familia de retrieval cae −7,75 frente a un suelo de −3,0). Es, por tanto, un artefacto de investigación con resultados mixtos, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`, con `custom_code`) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al tag `qwen3_5`, es decir, una familia de transformer denso, aunque la model card no detalla número de capas, dimensión oculta, cabezas de atención ni mecanismo de atención. El repositorio incluye `custom_code`, por lo que la implementación efectiva depende del código empaquetado con el modelo y no de una clase estándar de Transformers.

El proceso de construcción es un merging, no un preentrenamiento. Se parte de MS11 (soup oficial de la ronda d3-mini del 2026-11-11, hash `9a21f188…`), reconstruido a partir de `qhoenix/zils-mini-decision-l13_avg678` (revisión `091c6ebe`) y `joamCriff123/zils-mini-sx3` (revisión `c9432ada`). Sobre ese punto de partida se lanzan seis ejecuciones LoRA con los flags de `run_mini_seed_v5.sh`: rango 32, alpha 64, sin adaptadores en las capas MLP (`MLP=0`), learning rate 5e-5 durante 2 épocas, weight decay de LoRA 1.0, pérdida combinada de entropía cruzada (peso 1) más Brier score (peso 1) con KL a 0, y un término de anclaje (`--pin-rows 532`, `--pin-weight 1.0`, `--pin-train 0.1`). Las seis ejecuciones solo cambian la semilla (4402, 4412, 4422, 4432, 4442, 4452). El body final se calcula con `mini_mean_v3.sh` (sha256 `757506e1…`) y tiene hash `e666cbd2…`.

Los datos de entrenamiento son un fichero de 2.696 filas (sha256 `fb7552df…`) descrito por el autor como "all hard labels are writer answers": 2.692 filas generadas por el equipo Claude (1.685 de worker3, 1.007 de worker2) y 4 filas locales de Phi-4 del tipo arts-known-choice-k3, sin gold de dataset. Cada fila referencia además el conjunto público de entrenamiento usado como ejemplo de tema o estilo, listado en NOTICE.

## Capacidades

- Generación de texto y ajuste fino sobre datos de decisión/etiquetado: el entrenamiento con pérdida de entropía cruzada más Brier sugiere orientación a tareas de clasificación o elección con calibración de probabilidades.
- Razonamiento y respuesta sobre el formato de los datos de entrenamiento (respuestas de "writer" y ejemplos de tema/estilo), aunque no se documentan evaluaciones específicas de razonamiento.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe; los idiomas no están disponibles en la información.
- No se declara modo thinking, visión ni audio.
- Capacidad de fusión de adaptadores: el artefacto demuestra un pipeline reproducible de media de LoRAs con escalado (1,25) y anclaje de filas.

## Casos de uso

- Investigación en merging de modelos: el body sirve como referencia reproducible para estudiar cómo afecta la media de seis LoRAs con escalado 1,25 al rendimiento frente al punto de partida, gracias a los hashes y scripts documentados.
- Experimentos de calibración probabilística: la inclusión del Brier score en la pérdida lo hace adecuado para tareas donde se evalúa la calidad de las probabilidades predichas, no solo la etiqueta argmax.
- Clasificación o elección sobre datos tipo "writer answer": puede emplearse en pipelines internos de etiquetado o decisión donde el formato coincida con el dataset de 2.696 filas.
- Reproducción de experimentos de anclaje (`pin-rows`): útil para estudiar regularización hacia el modelo base y su efecto en la retención de capacidades.
- Base para nuevos fine-tunes: al ser un body completo con licencia Apache 2.0, puede servir como inicialización para ajustes posteriores en dominios específicos.
- Auditoría de evaluación interna: el modelo permite replicar la lectura C3 (`read_body` v2) del autor sobre 10 splits y contrastar el cambio medio de +1,14 y el fallo en la familia de retrieval.
- No se recomienda su uso en producción orientada a usuario final sin una evaluación propia, dado que el autor mismo marca el resultado por debajo de su umbral.

## Benchmarks y rendimiento

La model card solo reporta la lectura interna C3 (`read_body` v2) frente a MS11 en 10 splits, con hash `d047f21a…`. No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar.

| Métrica | Resultado |
|---|---|
| Cambio medio (C3, 10 splits) | +1,14 |
| Rango de splits | −0,70 a +5,22 |
| Splits por encima de 0 | 8 de 10 |
| Splits con +1,20 o más | 2 de 10 |
| Umbral preestablecido del autor | +2,00 (no alcanzado) |
| Comprobación por familia (retrieval) | −7,75 (suelo −3,0; falla) |
| Hold-out, copy check, delta-correlation | no leídos |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos (4,54B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- En cuantización de 8 bits: ~4,5-5 GB de pesos; en 4 bits: ~2,5-3 GB, aunque no se publican variantes GGUF ni cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en fp16 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 (16 GB) y potencialmente en 4070 Ti Super (16 GB) con cuantización; en 12 GB requeriría 8 bits o 4 bits.
- Opciones de despliegue: al incluir `custom_code`, requiere `trust_remote_code=True` en Transformers; vLLM y TGI dependerán de que la implementación personalizada sea compatible. llama.cpp/Ollama no están garantizados sin conversión a GGUF, que no se publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-31 | 4,54B | no disponible | Apache 2.0 | Hugging Face, safetensors con custom_code | Body fusionado, evaluación interna mixta |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | no disponible | Hugging Face | Miembro del soup MS11 |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | no disponible | Hugging Face | Miembro del soup MS11 |
| d3-mini-4.5b-v1 (repo Zils, rev. e9e87b3e) | ~4,5B (por nombre) | no disponible | no disponible | Repositorio Zils | Punto de partida del pipeline |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que el cambio medio (+1,14) queda por debajo de su umbral preestablecido (+2,00) y que la comprobación por familia falla con −7,75 en retrieval frente a un suelo de −3,0.
- No se han ejecutado el hold-out, el copy check ni el delta-correlation check, por lo que hay riesgo de sobreajuste a los splits evaluados y de copia de datos de entrenamiento.
- Los datos de entrenamiento son en su mayoría sintéticos (2.692 filas generadas por el equipo Claude) y solo 4 filas locales de Phi-4; esto puede introducir sesgos de estilo y de distribución.
- Riesgo de alucinación no cuantificado; sin evaluaciones estándar no puede acotarse.
- Idiomas soportados no documentados; no debe asumirse multilingüismo.
- Longitud de contexto no documentada; no apto para tareas de contexto largo sin verificación previa.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del repositorio; auditar antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la LICENSE del punto de partida y a NOTICE para las fuentes dependientes; conviene revisar ambas.
- Al ser un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha, no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-31
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base 2: https://huggingface.co/joamCriff123/zils-mini-sx3
- Repositorio Zils (referenciado en la model card, sin URL directa): revisión `e9e87b3e`
- Scripts referenciados (sin URL directa): `mini_mean_v3.sh`, `run_mini_seed_v5.sh`, `read_body` v2
- Paper, blog o demo: no disponibles
