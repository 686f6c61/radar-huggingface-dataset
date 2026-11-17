# yushengsu/deepseek-v4.1-flash-dspark-8000step

## Resumen

DeepSeek-V4.1-Flash DSpark es un modelo borrador (*draft model*) de decodificación especulativa diseñado para acelerar la inferencia de DeepSeek-V4.1-Flash. Lo publica el usuario yushengsu en Hugging Face como un fine-tune del borrador oficial `mtp.*` del modelo base, entrenado con SpecForge sobre filas regeneradas en modo *thinking*. Su función no es generar respuestas de forma autónoma, sino proponer tokens candidatos que el modelo grande verifica en paralelo, reduciendo la latencia por token generado.

El modelo tiene 3 capas con arquitectura MoE de 128 expertos y 14,2 mil millones de parámetros. Se entrenó con tamaño de bloque 7 (aunque la model card recomienda servirlo con `--speculative-dspark-block-size 5`), batch global de 128 y tasa de aprendizaje constante de 2e-5, partiendo del borrador oficial de DeepSeek. El repositorio ocupa 2276,3 GB, lo que refleja que contiene múltiples checkpoints intermedios cada 500 pasos globales, tanto en formato SpecForge HF (bf16) como en el layout oficial `mtp.*` para SGLang.

Es relevante para equipos que ya sirven DeepSeek-V4.1-Flash y buscan reducir la latencia de decodificación sin cambiar de modelo principal. La licencia MIT facilita su integración en producción, aunque el tamaño del repositorio y la dependencia de tooling específico (SpecForge, SGLang con `--speculative-algorithm DSPARK`) limitan su uso a infraestructuras preparadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (3 capas, 128 expertos) para decodificacion especulativa DSpark |
| Parametros totales | 14,2 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (export SpecForge HF); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (SpecForge HF export y layout oficial `mtp.*`) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa con arquitectura MoE de 3 capas y 128 expertos, con 14,2 mil millones de parámetros totales. Parte del borrador oficial `mtp.*` de DeepSeek-V4.1-Flash y se afina con SpecForge sobre filas regeneradas en modo *thinking* del dataset `yushengsu/deepseek-v4.1-flash-thinking-regen`. El entrenamiento usa batch global de 128, tasa de aprendizaje constante de 2e-5, tamaño de bloque 7 y warm start desde el borrador oficial. El régimen es *open-ended*: cada fila del dataset regenerado se recorre una vez por pasada, repitiendo pasadas.

La innovación principal es el uso de DSpark como algoritmo de decodificación especulativa dentro de SGLang (`--speculative-algorithm DSPARK`), con exportación a dos formatos: SpecForge HF (bf16) para inspección y layout oficial `mtp.*` para servicio. Se publican checkpoints cada 500 pasos globales en `step-<g>/specforge-hf/` y `step-<g>/official-mtp/`, lo que permite elegir el punto de control que mejor equilibre tasa de aceptación y coste. No se documentan detalles sobre composición del dataset, número total de tokens de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que DeepSeek-V4.1-Flash los verifique, acelerando la generación.
- Compatibilidad con SGLang mediante `--speculative-algorithm DSPARK` y `--speculative-dspark-block-size 5`.
- Exportación a formato SpecForge HF (bf16) y a layout oficial `mtp.*`.
- Entrenado sobre filas en modo *thinking*, por lo que el borrador está alineado con ese régimen de generación del modelo base.
- No es un modelo de chat autónomo: no se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo propias.
- Checkpoints intermedios cada 500 pasos globales para ajuste fino del compromiso latencia/aceptación.

## Casos de uso

- Aceleración de inferencia de DeepSeek-V4.1-Flash en producción: desplegar el borrador junto al modelo principal en SGLang para reducir la latencia por token en cargas de generación larga, especialmente en modo *thinking*.
- Servicio de razonamiento de alto throughput: al proponer tokens candidatos verificados en paralelo, aumenta el número de tokens por segundo en tareas de razonamiento multi-paso donde el modelo base genera secuencias largas.
- Ajuste del compromiso latencia/aceptación: seleccionar entre los checkpoints publicados cada 500 pasos el que ofrezca mejor tasa de aceptación para el hardware disponible.
- Investigación en decodificación especulativa: usar los exports SpecForge HF para analizar el comportamiento del borrador y comparar con el `mtp.*` oficial.
- Integración en pipelines SGLang existentes: sustituir el borrador oficial por este fine-tune sin cambiar la API de servicio, solo apuntando al checkpoint adecuado.
- Evaluación de DSpark en dominios concretos: al estar entrenado sobre filas regeneradas en modo *thinking*, sirve para medir la ganancia de la decodificación especulativa en cargas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 14,2 mil millones de parámetros en bf16 el peso ronda los 28 GB, aunque el despliegue real depende del modelo principal y del runtime.
- GPU recomendadas: no disponible; el entrenamiento se realizó en nodos B200 según el nombre del run de W&B (`v41-b200-8000step-b7-cont`).
- Cabe en GPU de consumo: no confirmado; por tamaño en bf16 requeriría GPUs de 32 GB o más, pero no se documenta soporte en consumer.
- Opciones de despliegue: SGLang con `--speculative-algorithm DSPARK` y `--speculative-dspark-block-size 5`; exportación vía SpecForge (`specforge export --to hf`) y conversión con `scripts/convert_deepseek_v41_dspark.py --to-official`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash DSpark (este) | 14,2 B (3 capas, 128 expertos) | no disponible | MIT | Hugging Face, repo de 2276,3 GB |
| Borrador oficial `mtp.*` de DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | Incluido con el modelo base |
| Modelos de decodificación especulativa de otros proveedores | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este fine-tune y el borrador oficial.

## Limitaciones y advertencias

- No es un modelo autónomo: solo tiene sentido como borrador de decodificación especulativa junto a DeepSeek-V4.1-Flash.
- Dependencia de tooling específico: requiere SGLang con soporte DSPARK y la rama `v4.1-dspark` de SpecForge.
- Tamaño del repositorio: 2276,3 GB, lo que complica la descarga y el almacenamiento; conviene descargar solo el checkpoint necesario.
- El dataset de entrenamiento es privado (`yushengsu/deepseek-v4.1-flash-thinking-regen`), por lo que no se puede auditar su composición ni sus sesgos.
- Entrenado sobre filas en modo *thinking*: el rendimiento puede degradarse en otros regímenes de generación.
- No se documentan idiomas soportados, contexto ni riesgos de alucinación propios; hereda las limitaciones del modelo base.
- Licencia MIT permite uso comercial, pero el modelo base DeepSeek-V4.1-Flash puede tener condiciones adicionales que deben verificarse por separado.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/deepseek-v4.1-flash-dspark-8000step
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- PR de SpecForge (rama `v4.1-dspark`): https://github.com/sgl-project/SpecForge/pull/1073
- W&B del entrenamiento: https://forge.coreweave.com/wandb/eigent_radixark_training/deepseek-v4.1-flash-dspark/runs/v41-b200-8000step-b7-cont
- Dataset (privado): `yushengsu/deepseek-v4.1-flash-thinking-regen`
