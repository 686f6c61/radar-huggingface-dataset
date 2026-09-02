# yangsu0423/flux.2-klein-4b-int4-ov

## Resumen

Este repositorio contiene una cuantización INT4 del modelo FLUX.2 [klein] de Black Forest Labs, publicada por el usuario yangsu0423 bajo el nombre `flux.2-klein-4b-int4-ov`. FLUX.2 [klein] es la variante compacta de la familia FLUX.2, diseñada para generación de imágenes rápida y eficiente, con 4 mil millones de parámetros. El sufijo `ov` en el nombre sugiere que los pesos han sido convertidos al formato OpenVINO, una optimización orientada a la inferencia en CPUs y GPUs de Intel, aunque no se proporciona documentación adicional en la model card.

La relevancia de este modelo radica en su tamaño reducido en comparación con los modelos de difusión de mayor escala, lo que permite desplegar generación de imágenes en hardware de consumo o en entornos con recursos limitados. Sin embargo, la información pública sobre esta cuantización concreta es prácticamente inexistente: no hay datos de entrenamiento, métricas de rendimiento ni instrucciones de uso específicas. La ficha se basa principalmente en lo que se conoce del modelo original FLUX.2 [klein] y en las características inferidas del nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base FLUX.2 [klein]) |
| Parametros totales | 4 mil millones (según modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | INT4 (inferido del nombre, formato OpenVINO probable) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente OpenVINO IR, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura del modelo base FLUX.2 [klein] es un transformer de difusión multimodal, desarrollado por Black Forest Labs. Se trata de un modelo de 4B parámetros que combina un codificador de texto y un decodificador de imágenes en un único pipeline de difusión. El entrenamiento del modelo base utilizó un gran corpus de pares imagen-texto y técnicas de destilación para reducir el coste computacional manteniendo la calidad. No se dispone de detalles específicos sobre el entrenamiento de esta cuantización INT4: no se indica el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas de fine-tuning posterior a la cuantización. El proceso de cuantización a INT4, presumiblemente mediante OpenVINO, reduce el tamaño del modelo de aproximadamente 8 GB en FP16 a 4.4 GB, como se observa en el tamaño del repositorio, a costa de una posible pérdida de precisión.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), heredadas del modelo base FLUX.2 [klein].
- Edición de imágenes con referencia simple o múltiple, según la guía de fal.ai para la familia FLUX.2 [klein].
- Procesamiento rápido y eficiente gracias a su menor número de parámetros en comparación con otros modelos de difusión de gran escala.
- La cuantización INT4 permite ejecutar el modelo en hardware con memoria limitada, aunque no se han documentado capacidades específicas adicionales para esta variante.

## Casos de uso

- Prototipado rápido de conceptos visuales: los diseñadores pueden generar imágenes de baja fidelidad en iteraciones cortas para explorar ideas antes de refinar con modelos de mayor tamaño.
- Generación de imágenes en entornos con GPU de consumo: gracias al tamaño reducido (4.4 GB), el modelo puede ejecutarse en tarjetas con 6-8 GB de VRAM, como una RTX 3060 o una GTX 1660 Super.
- Automatización de contenido visual para blogs o redes sociales: la generación de imágenes de stock personalizadas a bajo coste computacional es viable en pipelines de CI/CD.
- Edición de imágenes con referencia: permite transformar una imagen existente según instrucciones textuales, útil para ajustes de estilo o composición.
- Inferencia en CPU mediante OpenVINO: si la conversión es compatible, el modelo podría ejecutarse en CPUs modernas de Intel, aunque con mayor latencia que en GPU.
- Experimentación académica: sirve como punto de partida para estudiar el impacto de la cuantización INT4 en modelos de difusión, aunque se requiere documentación adicional para replicar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización concreta. El modelo base FLUX.2 [klein] ha sido evaluado por Black Forest Labs en métricas como FID y CLIP score, pero esos datos no se han incluido en la model card de este repositorio ni en los resultados de búsqueda. Por tanto, no es posible comparar el rendimiento de esta variante INT4 con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 4.4 GB, por lo que se estima que la inferencia requiere entre 5 y 6 GB de VRAM para cargar los pesos y los buffers intermedios.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como RTX 3060, RTX 2060 o GTX 1660 Super. En GPUs con 8 GB o más, la ejecución será más holgada.
- Si se utiliza OpenVINO, podría ejecutarse en CPUs Intel modernas, aunque la latencia será significativamente mayor que en GPU.
- Opciones de despliegue: dado el formato OpenVINO probable, se puede usar el runtime de OpenVINO o el pipeline de HuggingFace Optimum-Intel. No se han documentado integraciones con vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño (FP16) | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX.2 [klein] (original) | 4B | ~8 GB | Apache 2.0 | HuggingFace |
| FLUX.2 [klein] INT4 (este repo) | 4B | ~4.4 GB | Apache 2.0 | HuggingFace |
| SDXL Turbo | 3.5B | ~7 GB | OpenRAIL++ | HuggingFace |
| FLUX.1 schnell | 12B | ~24 GB | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas opciones. La elección entre ellas dependerá de la calidad deseada, el hardware disponible y las restricciones de licencia. SDXL Turbo es una alternativa con licencia más restrictiva, mientras que FLUX.1 schnell ofrece mayor calidad pero requiere más recursos.

## Limitaciones y advertencias

- No hay documentación sobre el proceso de cuantización: no se indica qué herramienta se usó, si hubo calibración, ni qué pérdida de calidad se ha medido.
- El modelo base FLUX.2 [klein] puede presentar sesgos en la generación de imágenes relacionados con los datos de entrenamiento, pero no se han documentado análisis específicos para esta variante.
- Riesgo de alucinación visual: los modelos de difusión pueden generar objetos o elementos no solicitados, especialmente con prompts ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las políticas de Black Forest Labs sobre el uso de sus modelos.
- La ausencia de benchmarks y de instrucciones de uso concretas limita su aplicabilidad en producción sin una evaluación previa por parte del usuario.
- El formato de pesos no está confirmado: aunque el nombre sugiere OpenVINO, no hay un archivo de configuración ni documentación que lo respalde.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/yangsu0423/flux.2-klein-4b-int4-ov
- Repositorio HuggingFace del modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Guía de usuario de FLUX.2 [klein] en fal.ai: https://fal.ai/learn/devs/flux-2-klein-user-guide
- Repositorio oficial de inferencia de FLUX.2 en GitHub: https://github.com/black-forest-labs/flux2
- Página oficial de FLUX.2 [klein] en Black Forest Labs: https://bfl.ai/models/flux-2-klein
