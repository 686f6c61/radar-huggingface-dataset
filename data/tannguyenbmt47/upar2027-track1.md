# tannguyenbmt47/upar2027-track1

## Resumen

`tannguyenbmt47/upar2027-track1` es el conjunto de pesos entrenados que el autor (tannguyenbmt47) presentó a la Track 1 del UPAR Challenge 2027 (reconocimiento de atributos de peatones), dentro del workshop Real-World Surveillance de WACV 2027. No es un modelo generativo de texto: es un sistema de visión por computador que, dada una imagen de un peatón recortada, predice un conjunto de atributos (por ejemplo género aparente, rango de edad, tipo de ropa, calzado o accesorios) mediante cabezas de consulta (*query heads*) sobre características extraídas por backbones preentrenados.

El repositorio contiene tres checkpoints en bf16: `hp.pt`, un DINOv3 ViT-H+/16 con cabeza de consulta y pesos EMA tras tres épocas; `m1.pt`, un CLIP ViT-L/14 de OpenAI con cabeza de consulta y puntuación textual CLIP, ajustado además con WiSE-FT a 0,7; y `du.pt`, el modelo conjunto "UniQuery" que combina ambos backbones con tres cabezas de consulta. Los tres se entrenaron sobre las particiones de train y validación de PA100k, PETA y Market-1501.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un sistema de atributos de peatones con puntuación agregada *Challenge_Avg* de 0,8011 (v25) y 0,8001 (v31) sobre el conjunto de test oculto del challenge. El interés práctico está en el pipeline (DINOv3 + CLIP con cabezas de consulta y ensamblado), no en el modelo como pieza de propósito general. El código se publica con licencia Apache 2.0, mientras que los pesos heredan las condiciones de DINOv3 y MIT de CLIP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos backbones ViT con cabezas de consulta: DINOv3 ViT-H+/16 (patch 16) y OpenAI CLIP ViT-L/14; variante conjunta "UniQuery" con tres cabezas de consulta |
| Parametros totales | no disponible (el repo ocupa 4,7 GB e incluye tres checkpoints en bf16) |
| Longitud de contexto | no aplica (modelo de visión); resolución de entrada no disponible |
| Tipos de cuantizacion | checkpoints en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (la tarea es reconocimiento de atributos sobre imagen; no se documenta el vocabulario del codificador de texto CLIP) |
| Licencia | `other`: pesos bajo DINOv3 License y MIT (CLIP); código bajo Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` en `.pt` (bf16) |

## Arquitectura y entrenamiento

La propuesta es un ensemble de dos torres de visión transformer. La primera es DINOv3 ViT-H+/16 (autosupervisado, licencia DINOv3) con una cabeza de consulta añadida; la segunda es el codificador visual de OpenAI CLIP ViT-L/14, también con cabeza de consulta y con la puntuación texto-imagen de CLIP como señal adicional, refinada mediante WiSE-FT con coeficiente 0,7. La variante UniQuery (`du.pt`) fusiona ambos backbones en un único modelo con tres cabezas de consulta, lo que sugiere un esquema multi-tarea o multi-etiqueta sobre el mismo espacio de características.

El entrenamiento se realizó durante tres épocas con semilla 1 sobre la unión de las particiones de train y validación de PA100k, PETA y Market-1501. Para `hp.pt` se conservan los pesos EMA. No se documentan en la información disponible el número de tokens vistos, la composición exacta del dataset, la resolución de entrada, la función de pérdida ni si hubo etapas de ajuste adicionales más allá del WiSE-FT mencionado. Tampoco se detalla el mecanismo de las "query heads" (atención a atributos, consultas aprendidas por clase, etc.).

## Capacidades

- Reconocimiento de atributos de peatones sobre imagen: predicción multi-atributo a partir de un recorte de persona.
- Ensemble de dos backbones heterogéneos (DINOv3 ViT-H+/16 y CLIP ViT-L/14) para aumentar la robustez de la predicción.
- Uso del espacio texto-imagen de CLIP como señal complementaria de clasificación (puntuación textual CLIP en `m1.pt`).
- Variante conjunta UniQuery con tres cabezas de consulta, orientada a una única pasada sobre los dos backbones.
- Pesos EMA disponibles para la rama DINOv3, lo que facilita una inferencia más estable.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes: no es un modelo de lenguaje.
- No se documentan capacidades de detección o segmentación; la entrada esperada es una imagen de persona ya localizada.

## Casos de uso

- Análisis de vídeo de vigilancia urbana: extraer atributos de viandantes para tareas de búsqueda retrospectiva ("persona con chaqueta roja y mochila") sobre metraje archivado, usando `hp.pt` o `du.pt` según el presupuesto de cómputo.
- Reidentificación asistida en investigación de incidentes: filtrar candidatos por atributos antes de aplicar un modelo de re-ID, reduciendo el espacio de búsqueda sobre miles de recortes.
- Analítica de afluencia en retail: agregar estadísticas anónimas de tipo de ropa o accesorios para estudios de flujo de clientes, siempre con base legal y anonimización previa.
- Etiquetado semiautomático de datasets: preanotar atributos en un corpus propio de recortes de personas y revisar manualmente solo los casos de baja confianza, acelerando la construcción de datos de entrenamiento.
- Evaluación comparativa de modelos académicos: reproducir la línea base del UPAR Challenge 2027 con los pesos publicados y comparar nuevas propuestas contra el 0,8011 de *Challenge_Avg*.
- Control de acceso o verificación de equipamiento de protección: comprobar atributos de vestimenta (casco, chaleco, uniforme) en entornos industriales, con supervisión humana en la decisión final.
- Investigación en sesgos: auditar la precisión por subgrupos (edad aparente, género aparente) de un sistema de atributos entrenado sobre PA100k/PETA/Market-1501.
- Prototipado rápido con CLIP: aprovechar `m1.pt` para explorar atributos definidos en lenguaje natural mediante el codificador de texto, sin reentrenar el backbone.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son la métrica agregada del challenge sobre el conjunto de test oculto. No hay datos de MMLU, HumanEval, GSM8K ni de métricas por atributo (mA, accuracy por clase, F1).

| Benchmark | Checkpoint / variante | Resultado |
|---|---|---|
| UPAR 2027 Track 1, Challenge_Avg (test oculto) | v25 (`hp.pt` + `m1.pt`), entrada del leaderboard final | 0,8011 |
| UPAR 2027 Track 1, Challenge_Avg (test oculto) | v31 UniQuery (`du.pt`) | 0,8001 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los tres checkpoints suman 4,7 GB en bf16; cada rama individual requiere del orden de 1-2 GB de pesos, más activaciones y lote. Con lotes pequeños cabe holgadamente en 8-12 GB de VRAM (estimación a partir del tamaño de los ficheros, no confirmada por el autor).
- GPU recomendadas: para servicio con lotes grandes, A100 40/80 GB o H100; para experimentación, RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX A5000.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 8 GB o más en bf16 con lotes pequeños; en fp32 el consumo se duplica.
- Opciones de despliegue: PyTorch nativo, ya que los artefactos son `state_dict` en `.pt`. No se documentan servidores de inferencia (vLLM, TGI o llama.cpp no son aplicables a un modelo de visión); la exportación a ONNX o TensorRT es posible pero no está descrita en el repositorio.
- Latencia y throughput: no disponibles. Dependen del backbone elegido; ViT-H+/16 es sustancialmente más costoso que CLIP ViT-L/14, por lo que `m1.pt` debería ser la opción más rápida del conjunto (sin datos medidos).

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `hp.pt` (v25, rama 1) | DINOv3 ViT-H+/16 + query head, EMA | no disponible | imagen, resolución no disponible | Challenge_Avg 0,8011 (en ensemble) | DINOv3 License | HuggingFace |
| `m1.pt` (v25, rama 2) | CLIP ViT-L/14 + query head y score textual, WiSE-FT 0,7 | no disponible | imagen, resolución no disponible | Challenge_Avg 0,8011 (en ensemble) | MIT (CLIP) | HuggingFace |
| `du.pt` (v31, UniQuery) | DINOv3 ViT-H+/16 + CLIP ViT-L/14, tres query heads | no disponible | imagen, resolución no disponible | Challenge_Avg 0,8001 | DINOv3 License + MIT | HuggingFace |
| Otros participantes del UPAR 2027 Track 1 | no disponible | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos publicados de otros modelos de reconocimiento de atributos de peatones (por ejemplo variantes de PA100k) en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Dominio muy restringido: solo reconoce atributos de personas sobre recortes; no sirve para otras tareas de visión ni para texto.
- Entrenado únicamente con PA100k, PETA y Market-1501 (train + val, tres épocas): el vocabulario de atributos y la distribución de dominios quedan limitados a esos conjuntos, con riesgo de degradación en cámaras, resoluciones o geografías distintas.
- Riesgo de sesgo: los atributos de género aparente, edad o etnia son especialmente sensibles; no se documenta ninguna evaluación de equidad por subgrupos.
- Riesgo de predicción errónea silenciosa: el autor no publica métricas por atributo ni calibración, solo el agregado *Challenge_Avg*, por lo que no se conoce qué clases fallan más.
- Implicaciones legales: el reconocimiento de atributos sobre personas en espacio público es tratamiento de datos personales y puede derivar en datos sensibles; en la UE exige base jurídica, evaluación de impacto y minimización conforme al RGPD. No usar en decisiones automatizadas sobre personas sin supervisión humana.
- Licencia: los pesos no son libres en sentido amplio; heredan la DINOv3 License (con posibles restricciones de uso comercial) y la MIT de CLIP. Hay que revisar ambas antes de cualquier despliegue comercial. El código es Apache 2.0, pero la licencia del modelo es `other`.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (23 de octubre de 2026). No hay informe de evaluación independiente.
- Reproducibilidad parcial: las puntuaciones son autodeclaradas sobre un test oculto y dependen de los scripts `submission/build_v25.py` y `submission/build_submission.py`, no verificables sin acceso al conjunto de evaluación.
- No se documentan requisitos de preprocesado (resolución, normalización, recorte de la caja de persona), lo que puede provocar diferencias de rendimiento respecto a las cifras publicadas.
- Sin soporte declarado para cuantización a int8 o fp16 más allá del bf16 de los checkpoints; el comportamiento tras cuantizar no está caracterizado.

## Enlaces

- Pesos en HuggingFace: https://huggingface.co/tannguyenbmt47/upar2027-track1
- Código y scripts de entrenamiento: https://github.com/tannguyenbmt47/upar2027-track1
- Scripts de submission citados: `submission/build_v25.py` y `submission/build_submission.py` (dentro del repositorio de GitHub)
- UPAR Challenge 2027, Track 1 (Codabench): plataforma mencionada en la model card, URL no disponible en la información proporcionada
- Workshop Real-World Surveillance, WACV 2027: no disponible (URL no proporcionada)
- DINOv3 (modelo base y licencia): no disponible en la información proporcionada
- OpenAI CLIP (modelo base, MIT): no disponible en la información proporcionada
- Conjuntos de datos PA100k, PETA y Market-1501: no disponible (URLs no proporcionadas)
