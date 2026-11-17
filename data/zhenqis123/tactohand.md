# zhenqis123/TactoHand

## Resumen

TactoHand es un modelo de visión por computador para la estimación de interacción mano-objeto a partir de vídeo RGB. Desarrollado por el usuario zhenqis123 (repositorio asociado a BeingBeyond), predice cuatro magnitudes por cada mano: contacto, proximidad, fuerza normalizada y visibilidad. No es un modelo de lenguaje, sino un cabezal de regresión sobre un backbone de visión.

La arquitectura parte de un Vision Transformer DINOv3 ViT-L (ViT-Large, patch 16) inicializado con los pesos de `timm/vit_large_patch16_dinov3.lvd1689m`. El modelo procesa ventanas de 32 fotogramas muestreados a 10 Hz con entradas de 256 píxeles, lo que le confiere capacidad de modelar la dinámica temporal de la interacción entre manos y objetos.

El checkpoint publicado corresponde al epoch 235 (entrenamiento 236) con step global 66080 y una pérdida de validación de 0,12714. Es relevante para investigación en robótica de manipulación, animación y análisis de destreza manual, ya que ofrece inferencia solo con RGB sin necesidad de assets MANO ni datasets preprocesados. La licencia del código propio es MIT, aunque los pesos del backbone derivados de DINOv3 quedan sujetos a la licencia DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv3 ViT-L, patch 16) con cabezal de regresión espacio-temporal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 32 fotogramas a 10 Hz (3,2 s de vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (etiquetas de la model card; el modelo no procesa texto) |
| Licencia | MIT (contribuciones propias); pesos del backbone sujetos a DINOv3 License |
| Formato de pesos | checkpoint `.ckpt` (PyTorch) acompañado de `tactohand.yaml` |

## Arquitectura y entrenamiento

TactoHand se construye sobre un backbone DINOv3 ViT-Large con parches de 16x16, inicializado desde los pesos de `timm/vit_large_patch16_dinov3.lvd1689m`. Sobre ese tronco se añade un cabezal que, a partir de ventanas de 32 fotogramas muestreados a 10 Hz y resolución de entrada de 256 píxeles, predice por cada mano cuatro salidas: contacto, proximidad, fuerza normalizada y visibilidad. La naturaleza temporal del modelo permite capturar la evolución de la interacción mano-objeto a lo largo de la ventana.

El checkpoint publicado corresponde al epoch 235 (indexado desde cero, es decir, el entrenamiento número 236) y al step global 66080, con una pérdida de validación total de 0,12714. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de regresión visual). El checkpoint conserva el estado de entrenamiento además de los pesos de inferencia, y el YAML asociado actúa como configuración de inferencia portable. Las fuerzas predichas son valores normalizados, no newtons.

## Capacidades

- Predicción de contacto mano-objeto a partir de vídeo RGB.
- Estimación de proximidad entre manos y objetos.
- Predicción de fuerza normalizada (no física en newtons).
- Estimación de visibilidad de cada mano.
- Procesamiento conjunto de ambas manos.
- Modelado temporal sobre ventanas de 32 fotogramas a 10 Hz.
- Inferencia solo con RGB, sin necesidad de assets MANO ni datasets preprocesados.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (modelo de visión; las etiquetas en/zh son metadatos de la model card).
- Capacidades especiales: no dispone de modo thinking, visión más allá del vídeo RGB, ni audio.

## Casos de uso

- Análisis de destreza manual en investigación: el modelo permite cuantificar contacto, proximidad y fuerza normalizada por mano en secuencias de vídeo, útil para estudiar patrones de agarre y manipulación en experimentos de psicología motora o rehabilitación.
- Aprendizaje por imitación en robótica: las predicciones de contacto y fuerza normalizada pueden servir como señales de supervisión para entrenar políticas de manipulación a partir de demostraciones humanas grabadas en vídeo.
- Animación y captura de movimiento: la estimación de visibilidad y contacto de ambas manos facilita la reconstrucción de interacciones mano-objeto para animación de personajes o avatares.
- Evaluación de prótesis y exoesqueletos: el modelo puede analizar vídeos de uso de dispositivos para medir la calidad del contacto y la proximidad al objeto durante tareas de agarre.
- Análisis de vídeo en entornos industriales: monitorización de tareas de ensamblaje manual donde interesa detectar contacto con piezas y estimar la intensidad relativa del agarre.
- Datasets y anotación automática: generación de etiquetas de contacto, proximidad y visibilidad sobre grandes volúmenes de vídeo RGB para preentrenar o aumentar datasets de interacción mano-objeto.
- Investigación en visión temporal: servir como baseline reproducible (checkpoint y configuración publicados) para comparar arquitecturas de estimación de interacción mano-objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación del checkpoint (0,12714 en `epoch/objective/val/total`), sin métricas comparativas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 11,5 GB, lo que incluye pesos y estado de entrenamiento. Un ViT-Large con ventanas de 32 fotogramas a 256 píxeles requiere memoria moderada, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del backbone ViT-L sugiere que podría ejecutarse en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: inferencia mediante PyTorch con el checkpoint `.ckpt` y el `tactohand.yaml`; el código de uso está en el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de interacción mano-objeto ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Las salidas de fuerza son predicciones normalizadas, no fuerzas físicas en newtons; no deben interpretarse como medidas absolutas.
- El modelo está entrenado para ventanas de 32 fotogramas a 10 Hz; secuencias más largas o con otro régimen de muestreo pueden degradar el rendimiento.
- La resolución de entrada está fijada en 256 píxeles, lo que puede limitar la precisión en escenas con manos pequeñas o muy ocluidas.
- Riesgo de sesgo y alucinación: no se documentan sesgos específicos, pero al ser un modelo de regresión visual puede producir predicciones erróneas en condiciones de iluminación, oclusión o dominios distintos al de entrenamiento.
- Restricciones de licencia: las contribuciones propias son MIT, pero los pesos del backbone derivados de DINOv3 están sujetos a la DINOv3 License, que debe revisarse antes de uso comercial.
- El checkpoint incluye estado de entrenamiento, lo que aumenta el tamaño del repositorio y puede requerir pasos adicionales para extraer solo los pesos de inferencia.
- No se documentan límites de idioma relevantes porque el modelo no procesa texto; las etiquetas en/zh son solo metadatos.
- No hay información sobre robustez en dominios distintos (por ejemplo, vídeo egocéntrico frente a tercera persona) ni sobre calibración de las predicciones.

## Enlaces

- Hugging Face: https://huggingface.co/zhenqis123/TactoHand
- Repositorio de código: https://github.com/BeingBeyond/Tactohand
- Paper: https://arxiv.org/abs/2610.39585
- Sitio del proyecto: https://zhenqis123.github.io/tactohand-site/
- Backbone base (timm DINOv3 ViT-L): https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
- Licencia DINOv3: https://huggingface.co/zhenqis123/TactoHand/blob/main/LICENSE-DINOv3.md
