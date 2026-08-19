# xtracta/ernie-desilian-wf69-422docs-synbbox-ale-20260804

## Resumen

Este repositorio contiene un adapter de ERNIE, denominado `ale_re`, entrenado por Xtracta para la extracción de relaciones (ALE) sobre documentos Desilian WF69. Se trata de un componente especializado dentro de un pipeline de inteligencia documental, no de un modelo de lenguaje generalista. El adapter ha sido ajustado sobre 422 documentos con anclas sintéticas de bounding box (synthetic bbox) y etiqueta 8 campos concretos del formulario Desilian (58, 59, 60, 61, 62, 8044, 19646 y la clase O). El entrenamiento se realizó durante 120 épocas con una pérdida final de 0.0125 y un total de 25 920 pasos globales, completándose en 10,8 horas. La relevancia de esta publicación radica en que documenta un experimento controlado sobre el efecto del synthetic bbox en la calidad de la extracción, con un ablation disponible para comparar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERNIE (adapter `ale_re` sobre modelo base ERNIE) |
| Parametros totales | no disponible (adapter, no modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `pytorch_adapter.bin`, `pytorch_model_head.bin`, `adapter_config.json`, `head_config.json` |

## Arquitectura y entrenamiento

El adapter se basa en ERNIE, un modelo transformer desarrollado por Baidu, aunque no se especifica la variante exacta ni el número de parámetros. El entrenamiento se realizó con una configuración precisa: tasa de aprendizaje 1e-3, tamaño de lote por dispositivo de 20, acumulación de gradientes de 1, warmup ratio de 0.02 y semilla 42. Se emplearon 120 épocas completas sobre 422 documentos, con una pérdida final de 0.0125. La característica distintiva es el uso de anclas sintéticas de bounding box (`add_synthetic_bbox: true`), que se integran en el `head_config`. Un detalle importante es que este flag es solo de procedencia: no se pasa al decodificador, y el comportamiento real en inferencia lo controla el pipeline de Xtracta. El ablation con synthetic bbox desactivado (`ernie-desilian-wf69-422docs-ale-baseline-20260805`) permite aislar el efecto de esta técnica.

## Capacidades

- Extracción de campos específicos de documentos Desilian WF69: etiquetas 58, 59, 60, 61, 62, 8044, 19646 y la clase O (outlier).
- Procesamiento de documentos con anclas de bounding box sintéticas, lo que sugiere soporte para entrada de imágenes o documentos escaneados.
- Integración con el pipeline de Xtracta para extracción de datos estructurados.
- No se dispone de información sobre capacidades de generación de texto, razonamiento, código, tool calling o agentes, ya que es un adapter especializado.

## Casos de uso

- Automatización de la extracción de datos en formularios Desilian WF69: el adapter identifica y extrae los campos numerados (58, 59, 60, 61, 62, 8044, 19646) de documentos específicos, reduciendo la intervención manual en procesos de captura de datos.
- Integración en pipelines de procesamiento documental: al cargarse mediante `AdapterLoader`, puede incorporarse a flujos existentes de Xtracta para enriquecer la extracción de campos concretos en lotes de documentos.
- Evaluación comparativa de técnicas de aumento de datos: el ablation con synthetic bbox permite medir el impacto de esta técnica en la precisión de extracción, útil para decidir configuraciones en otros dominios.
- Validación de modelos de extracción en entornos de producción: el adapter puede servir como referencia para probar la estabilidad de la extracción cuando se varían parámetros del pipeline (como el flag `add_synthetic_bbox`).
- Investigación sobre adaptadores de bajo coste para ERNIE: el repositorio documenta un entrenamiento completo con hiperparámetros y métricas, útil para reproducir experimentos similares.
- Despliegue en soluciones de OCR y reconocimiento de documentos: dado el uso de bounding boxes, el adapter es adecuado para documentos con diseño fijo donde la posición de los campos es predecible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es el ablation reportado en la model card: al desactivar el flag `add_synthetic_bbox` en el pipeline, la métrica Line F1 varía en −0.0079 para este adapter (es decir, empeora ligeramente), mientras que para otro adapter (e7 de 8 GPUs) varía en −0.0044 y para producción en +0.0017. No hay valores absolutos de F1 ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue en la información disponible.
- Dado que se trata de un adapter pequeño (los archivos son `adapter_config.json`, `head_config.json`, `pytorch_adapter.bin` y `pytorch_model_head.bin`), es plausible que la inferencia sea ligera, pero no se puede confirmar sin datos del modelo base.
- El entrenamiento se realizó en un entorno con al menos un dispositivo GPU (el batch por dispositivo es 20), pero no se indica el modelo exacto.
- No hay información sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores de extracción de documentos). El único punto de comparación es el adapter baseline sin synthetic bbox (`ernie-desilian-wf69-422docs-ale-baseline-20260805`), que comparte los mismos hiperparámetros y semilla. La diferencia en Line F1 al cambiar el flag del pipeline es de −0.0079, lo que sugiere que el synthetic bbox aporta una mejora marginal en este caso. No hay otros modelos de referencia.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial o la redistribución requieren consultar directamente con Xtracta.
- Los idiomas soportados no están documentados; el adapter se ha entrenado únicamente con documentos Desilian WF69, por lo que su aplicación fuera de ese dominio probablemente degrade el rendimiento.
- El flag `add_synthetic_bbox` en `head_config` no controla la inferencia; es solo informativo. Los usuarios deben ajustar el pipeline de Xtracta según sus necesidades.
- No hay garantía de precisión en producción: el único dato de rendimiento es un delta de F1 en un experimento controlado, no una evaluación exhaustiva.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto experimental más que un modelo de uso generalizado.
- La fecha de creación (2026-08-04) y actualización (2026-08-19) sugiere que es un proyecto reciente, posiblemente en fase de validación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xtracta/ernie-desilian-wf69-422docs-synbbox-ale-20260804
- Registro W&B del entrenamiento: https://wandb.ai/xtracta/Desilian_WF69_422_SynBBox_ALE_20260804/runs/r69k1mae
- Sitio web de Xtracta: https://xtracta.com/
- Portal de soporte de Xtracta: https://support.xtracta.com/
