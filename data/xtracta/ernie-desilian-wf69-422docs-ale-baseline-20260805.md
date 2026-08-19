# xtracta/ernie-desilian-wf69-422docs-ale-baseline-20260805

## Resumen

El modelo `xtracta/ernie-desilian-wf69-422docs-ale-baseline-20260805` es un adapter de tipo ALE (posiblemente *Adaptive Label Extraction* o *Active Learning for Extraction*) entrenado sobre un modelo base ERNIE, desarrollado por la empresa Xtracta, especializada en extracción de datos documentales. Este adapter constituye la rama de control de un estudio de ablación que evalúa el impacto de los *bounding boxes* sintéticos (synthetic bbox) en la extracción de entidades y relaciones. Se entrenó sobre 422 documentos de la colección Desilian WF69, sin anclas de bbox sintéticas, con el objetivo de aislar la contribución de dichas anclas en el rendimiento del sistema.

El entrenamiento se realizó durante 120 épocas completas, con una pérdida final de 0.0059, 25 800 pasos globales y una duración de 6.1 horas. La model card indica que se trata de un adapter (archivos `adapter_config.json`, `head_config.json`, `pytorch_adapter.bin`, `pytorch_model_head.bin`) que debe cargarse mediante un `AdapterLoader`. No se especifican detalles sobre la arquitectura del modelo base, el número de parámetros, la longitud de contexto ni las capacidades concretas, por lo que la información disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter sobre modelo ERNIE (variante no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_adapter.bin`, `pytorch_model_head.bin`, `adapter_config.json`, `head_config.json` |

## Arquitectura y entrenamiento

La model card describe un adapter de tipo `ale_re` (extracción de relaciones y entidades) entrenado sobre un modelo ERNIE. No se especifica la arquitectura interna del adapter (p. ej., si es LoRA, adaptadores de atención, etc.), ni el tamaño del modelo base. El entrenamiento se realizó con una receta fija: 120 épocas, tasa de aprendizaje 1e-3, tamaño de lote por dispositivo 20, acumulación de gradientes 1 y semilla 42. Estos hiperparámetros se mantuvieron idénticos a los de la rama con synthetic bbox para garantizar que la única variable diferencial fuera la presencia de anclas de bbox sintéticas. La pérdida final de entrenamiento fue de 0.0059, con 25 800 pasos globales y una duración total de 6.1 horas. No se mencionan técnicas como RLHF, DPO ni otros métodos de alineación.

## Capacidades

No se han especificado capacidades concretas en la información disponible. Dado el nombre del adapter (`ale_re`) y el contexto de Xtracta (extracción de datos documentales), es plausible que el modelo esté orientado a la extracción de entidades y relaciones en documentos, pero no hay confirmación oficial. Tampoco se indican capacidades de generación de texto, razonamiento, código, tool calling, soporte de agentes, visión u otras. Se recomienda consultar la documentación del proyecto original o contactar con el autor para obtener detalles.

## Casos de uso

No se han proporcionado casos de uso específicos en la model card. Sin embargo, por el dominio de Xtracta (automatización de procesamiento de documentos, extracción de datos de facturas, formularios, contratos, etc.), este adapter podría emplearse en tareas de extracción de información estructurada a partir de documentos. No obstante, al tratarse de una rama de control para un estudio de ablación, su uso práctico probablemente se limita a la investigación comparativa. No se dispone de información adicional sobre aplicaciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona la pérdida final de entrenamiento (0.0059) y la duración del entrenamiento, pero no ofrece métricas de evaluación (p. ej., precisión, recall, F1) sobre conjuntos de validación o prueba.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Al ser un adapter de pequeño tamaño (archivos de pesos separados), es probable que pueda ejecutarse en GPUs de consumo, pero no se especifican requisitos de VRAM, GPUs recomendadas ni opciones de despliegue. Tampoco se indican latencias ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. La model card menciona una rama emparejada (`ernie-desilian-wf69-422docs-synbbox-ale-20260804`) que utiliza synthetic bbox, pero no se ofrecen resultados comparativos. No se pueden establecer comparaciones con otras alternativas sin datos adicionales.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones de contexto o idioma.
- La licencia es desconocida, por lo que se debe contactar con el autor antes de cualquier uso comercial.
- Al ser un adapter de control sin synthetic bbox, es posible que su rendimiento en tareas que requieran localización espacial de entidades sea inferior al de la rama con anclas sintéticas, pero esto no está confirmado.
- La model card advierte que otro run (`hdqqxhn0`) falló en la época 42.88 y no debe confundirse con este adapter; el run correcto es `jg5c3rcg`.
- No se especifican los requisitos de carga ni la compatibilidad con versiones de ERNIE o del framework de adapters.

## Enlaces

- [HuggingFace: xtracta/ernie-desilian-wf69-422docs-ale-baseline-20260805](https://huggingface.co/xtracta/ernie-desilian-wf69-422docs-ale-baseline-20260805)
- [W&B run jg5c3rcg (rich-paper-2)](https://wandb.ai/xtracta/Desilian_WF69_422_ALE_Baseline_20260805/runs/jg5c3rcg)
- [W&B run r69k1mae (rama con synthetic bbox)](https://wandb.ai/xtracta/Desilian_WF69_422_SynBBox_ALE_20260804/runs/r69k1mae)
- [Sitio web de Xtracta](https://xtracta.com/)
