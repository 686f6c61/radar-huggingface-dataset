# Uve1048/hrnet-w32-footprint

## Resumen

HRNet-W32 Footprint es un modelo de segmentación semántica binaria especializado en la extracción de huellas de edificios (building footprints) a partir de ortofotos aéreas y satelitales de alta resolución. Lo desarrolla el usuario Uve1048 y se publica bajo licencia MIT. El modelo resuelve un problema concreto del ámbito geoespacial: convertir imágenes ráster en máscaras de edificios que después se vectorizan a Shapefiles listos para SIG, evitando el etiquetado manual píxel a píxel.

Técnicamente es una red HRNet-W32 con cabeza FCNHead implementada sobre MMSegmentation 1.x, con dos clases (fondo y edificio), entrada RGB de 1024 × 1024 píxeles y un checkpoint de aproximadamente 231 MB. La elección de HRNet responde a su capacidad de mantener representaciones de alta resolución a lo largo de toda la red, lo que preserva mejor los bordes de los edificios frente a arquitecturas encoder-decoder que submuestrean agresivamente.

Su relevancia práctica radica en que forma parte de un pipeline completo de posprocesado (Footprint-Creater) que transforma la máscara cruda en geometría SIG limpia: filtrado por área mínima, relleno de huecos, suavizado con buffer de unión en inglete, simplificación Douglas-Peucker y sustitución por rectángulo envolvente mínimo. Es un modelo de nicho, sin benchmarks públicos y entrenado con datos privados, por lo que debe validarse sobre la imaginería propia antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HRNet-W32 con cabeza FCNHead (EncoderDecoder de MMSegmentation) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 1024 × 1024 px) |
| Tipos de cuantización | no disponible (checkpoint PyTorch `.pth` de ~231 MB) |
| Idiomas soportados | en, zh (etiquetas de la model card; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoint `iter_40000.pth`) |

## Arquitectura y entrenamiento

El modelo es un EncoderDecoder de MMSegmentation con backbone HRNet-W32, que mantiene cuatro ramas paralelas de resolución decreciente y las fusiona repetidamente para conservar información de alta resolución. La cabeza es una FCNHead con `in_channels=[32, 64, 128, 256]`, `channels=512`, `input_transform="resize_concat"`, kernel 1 × 1, una convolución, dropout 0.1 y dos clases de salida. La normalización por lotes se mantiene congelada (`requires_grad=False`, `norm_eval=True`) y la inferencia se realiza en modo `whole` sobre la imagen completa del parche.

El entrenamiento se llevó a cabo sobre un dataset privado de ortofotos de alta resolución con etiquetas vectoriales de edificios, con parches de 1024 × 1024 y stride 512, durante 40 000 iteraciones, usando SGD con decaimiento PolyLR y una función de pérdida combinada CrossEntropy + Dice con el mismo peso. Los píxeles puros negros `(0,0,0)` y blancos `(255,255,255)` se marcan como `ignore_index` en las etiquetas para que los bordes de la imagen no contribuyan a la pérdida. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, por tratarse de un modelo de segmentación convolucional.

## Capacidades

- Segmentación semántica binaria píxel a píxel de huellas de edificios sobre ortofotos aéreas y satelitales.
- Entrada RGB de 1024 × 1024 píxeles con normalización ImageNet (media `[123.675, 116.28, 103.53]`, desviación `[58.395, 57.12, 57.375]`) y conversión BGR→RGB.
- Inferencia en modo `whole` sobre parches; para ortofotos completas se recomienda ventana deslizante con ~50 % de solapamiento y posterior cosido.
- Generación de máscaras listas para posprocesado y vectorización a Shapefiles mediante el pipeline Footprint-Creater.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de visión.
- No realiza segmentación de instancias: los edificios adyacentes se fusionan en una sola región.
- No clasifica atributos de cubierta ni realiza detección de cambios por sí mismo (aunque su máscara puede usarse como paso intermedio en flujos de change detection).

## Casos de uso

- Pre-etiquetado para vectorización manual: el modelo genera una máscara inicial de edificios que un operador SIG revisa y corrige, reduciendo el tiempo de digitalización frente al trazado desde cero sobre la ortofoto.
- Actualización de cartografía de edificios: aplicando el pipeline Footprint-Creater sobre ortofotos recientes se obtienen Shapefiles con geometrías simplificadas y rectángulos envolventes, útiles para comparar con la cartografía catastral existente.
- Detección de cambios como paso intermedio: la máscara de edificios sirve de entrada a un flujo que compara dos fechas y detecta nuevas construcciones o demoliciones, siempre que ambas imágenes estén en el dominio de entrenamiento.
- Análisis de densidad urbana: extrayendo la máscara de edificios sobre mosaicos de ortofotos se puede calcular la huella construida por unidad de superficie para estudios de ocupación del suelo.
- Generación de capas base para planificación: los polígonos resultantes alimentan visores SIG internos o bases de datos espaciales como capa provisional sujeta a validación.
- Automatización de tareas de inventario en organismos con grandes volúmenes de ortofotos: al ser un modelo ligero (~231 MB) puede ejecutarse en GPU de consumo y procesar mosaicos por lotes con ventana deslizante.
- Investigación en segmentación geoespacial: sirve como baseline reproducible (MIT) para comparar con otras arquitecturas sobre el mismo pipeline de posprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint se entrenó sobre un dataset privado de ortofotos y vectores de edificios, por lo que no se reporta IoU comparable sobre benchmarks públicos. Se recomienda validar sobre imaginería propia antes de un uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del checkpoint (~231 MB) y la entrada de 1024 × 1024, es previsible que quepa en GPUs de consumo, pero no se aporta una cifra concreta.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device="cuda:0"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: probable por el tamaño reducido del modelo, aunque no confirmada en la documentación.
- Opciones de despliegue: MMSegmentation 1.x con `torch`, `mmengine`, `mmcv-lite`; inferencia vía `mmseg.apis.init_model` e `inference_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles.
- Estrategia de inferencia recomendada: ventana deslizante con ~50 % de solapamiento y cosido para ortofotos completas; implementación de referencia en `predict.py` del repositorio HRNet-Footprint-Trainer.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, este checkpoint se distingue por su licencia MIT, su integración con MMSegmentation y su pipeline de posprocesado asociado, pero no se aportan cifras de IoU ni comparaciones con otras arquitecturas de segmentación de edificios.

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRNet-W32 Footprint (Uve1048) | no disponible | 1024 × 1024 px | sin benchmarks públicos | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Segmentación semántica, no de instancias: los edificios que se tocan se fusionan en un único polígono, lo que impide separarlos sin posprocesado adicional.
- Los bordes puros negros o blancos de las ortofotos se predicen sistemáticamente como edificios; hay que enmascararlos antes de la inferencia, ya que el filtrado por área posterior no corrige el falso positivo al formar una única región grande.
- Sensibilidad al dominio: cambios estacionales, diferencias de sensor y materiales de cubierta poco habituales (chapa metálica, cubiertas verdes) degradan la precisión; la solución fiable es reentrenar con datos locales.
- Sin benchmarks públicos: el modelo se entrenó con datos privados y no se reporta IoU sobre conjuntos públicos, por lo que su rendimiento real en imaginería ajena al dominio de entrenamiento es desconocido.
- El posprocesado es crítico: omitir el suavizado con buffer en inglete o la simplificación Douglas-Peucker produce contornos dentados e inutilizables en SIG.
- Riesgo de alucinación en el sentido de falsos positivos en regiones anómalas (bordes, artefactos de imagen); requiere validación humana en flujos cartográficos.
- Licencia MIT: permite uso comercial, pero el autor declina toda garantía y responsabiliza al usuario de cumplir la normativa local de levantamiento y datos geoespaciales.
- Los idiomas declarados (en, zh) se refieren a la documentación, no a capacidades lingüísticas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uve1048/hrnet-w32-footprint
- Pipeline de posprocesado Footprint-Creater: https://github.com/UVE1048/Footprint-Creater
- Repositorio de entrenamiento e inferencia HRNet-Footprint-Trainer: https://github.com/UVE1048/HRNet-Footprint-Trainer
- Script de inferencia de referencia: https://github.com/UVE1048/HRNet-Footprint-Trainer/blob/main/predict.py
- MMSegmentation: https://github.com/open-mmlab/mmsegmentation
