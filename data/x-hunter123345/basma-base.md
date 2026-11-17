# x-hunter123345/basma-base

## Resumen

Basma (base) es un detector de imágenes generadas por IA empaquetado en formato ONNX y publicado en Hugging Face por el usuario x-hunter123345. Se trata de una conversión a navegador del proyecto original Basma alojado en el repositorio de GitHub us3ph/Basma, que emplea una arquitectura de tipo DINOv2 como extractor de características. El modelo resuelve una tarea de clasificación binaria: distinguir entre imágenes reales (etiqueta 0) e imágenes generadas por inteligencia artificial (etiqueta 1).

La relevancia de esta publicación es fundamentalmente práctica: al distribuirse como ONNX con dos variantes (una de pesos cuantizados a 8 bits y otra en fp32) junto a un fichero `fusion.json`, está pensada para ejecutarse directamente en el navegador o en entornos sin GPU dedicada. El repositorio ocupa aproximadamente 0,5 GB y se distribuye bajo licencia MIT, lo que facilita su integración en aplicaciones web y pipelines ligeros de moderación de contenido.

No obstante, la información publicada es muy escasa: no se detallan parámetros totales, longitud de contexto (no aplica al ser un modelo de visión), composición del dataset de entrenamiento ni resultados de benchmarks más allá de la referencia a un fichero RESULTS.md en el repositorio original. La ficha refleja esa limitación de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 (extractor de características) con cabecera de clasificación binaria; empaquetado en ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | ONNX weight-only 8 bits (`onnx/model_w8.onnx`) y fp32 (`onnx/model.onnx`) |
| Idiomas soportados | no disponible (no aplica; clasificador de imágenes) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, `model_w8.onnx`) + `fusion.json` |

## Arquitectura y entrenamiento

La model card únicamente indica que el modelo se basa en DINOv2 y que se distribuye como grafo ONNX, con una variante de pesos cuantizados a 8 bits (`model_w8.onnx`) y otra en precisión completa fp32 (`model.onnx`), acompañadas de un fichero `fusion.json`. DINOv2 es un transformer de visión auto-supervisado que produce representaciones densas de imagen; en este caso se emplea como backbone para una tarea de detección de imágenes sintéticas con dos clases (0 = real, 1 = AI).

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF/DPO), ni sobre innovaciones técnicas específicas más allá de la cuantización a 8 bits para despliegue en navegador. Cualquier dato adicional sobre el proceso de entrenamiento debe consultarse en el repositorio de GitHub del autor original.

## Capacidades

- Clasificación binaria de imágenes: distingue entre imágenes reales (etiqueta 0) e imágenes generadas por IA (etiqueta 1).
- Ejecución en navegador: el formato ONNX permite inferencia en cliente mediante ONNX Runtime Web u otros runtimes compatibles.
- Variante cuantizada a 8 bits para reducir huella de memoria y latencia en dispositivos con recursos limitados.
- Variante fp32 para escenarios donde se prioriza la precisión sobre el rendimiento.
- Integración mediante fichero `fusion.json`, presumiblemente con la lógica de fusión de puntuaciones o postprocesado del detector.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de imagen puro.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Moderación de contenido en plataformas web: el modelo puede ejecutarse en el navegador del usuario o en un servicio ligero para marcar imágenes potencialmente sintéticas antes de su publicación, gracias a la variante ONNX de 8 bits.
- Verificación de autenticidad en marketplaces: integración en el flujo de subida de fotos de producto para detectar imágenes generadas por IA y reducir fraude.
- Filtrado en redes sociales y foros: clasificación automática de imágenes en el momento de la subida, con la variante fp32 en servidor o la cuantizada en cliente.
- Herramientas de periodismo y verificación de hechos: apoyo al análisis de imágenes recibidas de fuentes externas, marcando candidatas a ser sintéticas para revisión humana.
- Aplicaciones de escritorio o extensiones de navegador: al ser ONNX, puede empaquetarse en extensiones que analicen imágenes localmente sin enviar datos a un servidor.
- Investigación sobre detección de deepfakes y generación de imágenes: punto de partida reproducible (licencia MIT) para experimentos de clasificación binaria real vs. IA con backbone DINOv2.
- Pipelines de curaduría de datasets: filtrado de imágenes sintéticas en la construcción de conjuntos de datos de entrenamiento para otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un fichero RESULTS.md en el repositorio de GitHub original, pero no se incluyen métricas (exactitud, AUC, F1) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,5 GB, por lo que la variante de 8 bits debería caber holgadamente en GPUs consumer de 4-8 GB y la fp32 en torno a 1-2 GB.
- GPU recomendadas: no disponible; al ser un modelo pequeño basado en DINOv2, es probable que funcione en RTX 3060/4060 o superiores, aunque no se confirma.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM para la variante cuantizada; también puede ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), posible conversión a otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Basma (base) | DINOv2 + cabecera binaria | no disponible | no aplica | MIT | ONNX (fp32 y w8) | Hugging Face |
| Alternativas de detección de imágenes IA | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros detectores de imágenes generadas por IA (por ejemplo, clasificadores basados en CLIP o ViT). Se indica "no disponible".

## Limitaciones y advertencias

- Información muy escasa: no se documentan datos de entrenamiento, métricas de evaluación ni sesgos conocidos, lo que dificulta evaluar su fiabilidad en producción.
- Riesgo de falsos positivos y negativos: al ser un clasificador binario sin benchmarks publicados, no se puede garantizar su robustez frente a generadores de imágenes recientes o imágenes editadas.
- Posible degradación ante dominios no vistos: al no detallarse la composición del dataset, se desconoce su comportamiento en dominios específicos (fotografía médica, satelital, artística, etc.).
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Dependencia del fichero `fusion.json`: la lógica de postprocesado o fusión no está documentada en la model card, lo que puede complicar la integración.
- Sin soporte de texto ni multilingüe: no debe emplearse para tareas de NLP.
- Fecha de creación futura (2026-11-05): conviene verificar la autenticidad y vigencia del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/x-hunter123345/basma-base
- Repositorio original en GitHub: https://github.com/us3ph/Basma
