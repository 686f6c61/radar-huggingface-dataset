# SOTAagi2030/orchard-leaf-triage

## Resumen

El modelo `SOTAagi2030/orchard-leaf-triage` es un clasificador de imágenes diseñado para el triaje de condiciones de hojas de huerto. Desarrollado por el usuario SOTAagi2030, se publica con licencia Apache 2.0 y formato de pesos safetensors. Según su model card, se trata del clasificador "revisado" de una ejecución denominada `canopy-02`, con una tasa de falsos negativos en un conjunto de validación oculto de 0.0274. El modelo expone 4 etiquetas de salida, mapeadas a condiciones de hojas mediante el archivo `classes.json`. El lanzamiento está pensado únicamente como soporte de triaje, y la confirmación en campo sigue siendo necesaria. No se ha facilitado información sobre la arquitectura, el número de parámetros ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha proporcionado información sobre la arquitectura del modelo, la composición del conjunto de entrenamiento, el número de imágenes o tokens, ni sobre técnicas de ajuste como RLHF o DPO. La model card solo indica que es un clasificador de condiciones de hojas (`image-classification`) con 4 salidas y una tasa de falsos negativos de 0.0274 en datos de validación. El repositorio contiene los archivos `leaf_classifier.safetensors` y `classes.json`; no hay documentación adicional sobre el diseño o el proceso de entrenamiento.

## Capacidades

- Clasificación de imágenes de hojas de huerto en 4 categorías, según `classes.json`.
- Triage preliminar de condiciones de hojas, con una tasa de falsos negativos en un conjunto de validación oculto de 0.0274.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de lenguaje; al ser un clasificador visual, estas capacidades no aplican.

## Casos de uso

- Monitorización de cultivos en tiempo real: el modelo podría utilizarse para clasificar fotografías de hojas capturadas en el huerto y detectar condiciones anómalas de forma preliminar. Al ser un triaje, conviene combinarlo con inspección humana posterior.
- Aplicación móvil de apoyo al agricultor: integrado en una app con cámara, el modelo ofrecería una clasificación rápida de 4 condiciones de hojas, útil para decidir qué parcelas requieren revisión.
- Automatización de inspección con drones: el clasificador podría procesar imágenes aéreas o cercanas tomadas por drones para señalar áreas con hojas en estado anómalo.
- Triage en laboratorio agrícola: ante muestras de hojas recibidas, el modelo permitiría clasificarlas antes de un análisis más detallado.
- Gestión de inventario de plagas y enfermedades: el modelo sirve para categorizar observaciones de campo y así priorizar intervenciones.
- Sistema de alerta temprana dentro de una plataforma de agricultura de precisión: el modelo actúa como primer filtro para alertar a los técnicos sobre posibles problemas en hojas, reduciendo el número de inspecciones manuales necesarias.

Es importante señalar que la model card advierte que el modelo debe usarse solo para triaje; la confirmación en campo es obligatoria.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es la tasa de falsos negativos (`false-negative rate`) de 0.0274 sobre el conjunto de validación oculto. No se han publicado resultados de benchmarks convencionales como MMLU, HumanEval o GSM8K, al tratarse de un clasificador de imágenes.

## Requisitos de hardware

- No se ha proporcionado información sobre requisitos de memoria VRAM, GPU recomendadas ni latencia.
- El repositorio tiene un tamaño declarado de 0.0 GB, por lo que no es posible estimar el peso de los archivos.
- Al ser un modelo de clasificación de imágenes, la inferencia podría llevarse a cabo en CPU o GPU, pero no se especifican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información sobre modelos similares ni de comparativas publicadas. Los benchmarks y características de modelos alternativos de clasificación de hojas o de imágenes agrícolas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card indica explícitamente que el modelo solo debe usarse para soporte de triaje; la confirmación en campo es obligatoria.
- No se han documentado sesgos conocidos, pero la ausencia de datos sobre la composición del conjunto de entrenamiento impide evaluar posibles sesgos respecto a variedades de hojas, condiciones de iluminación o regiones geográficas.
- El riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe la posibilidad de clasificaciones erróneas, especialmente fuera del dominio de entrenamiento.
- No se ha proporcionado información sobre el contexto o el idioma; al ser un clasificador visual, estas limitaciones no son relevantes.
- La licencia Apache 2.0 permite uso comercial, aunque no se especifican restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/SOTAagi2030/orchard-leaf-triage
- Perfil del autor: https://huggingface.co/SOTAagi2030
