# sunkaiwen/places-water-resnet18-automl

## Resumen

places-water-resnet18-automl es un clasificador binario de imágenes creado por el usuario de HuggingFace sunkaiwen que responde a una única pregunta: ¿contiene esta fotografía agua? El modelo recibe una imagen RGB de 224x224 píxeles y devuelve una de dos etiquetas, `water` o `no_water`. Se trata de un trabajo de curso para la asignatura 24-679 *Designing with AI*, no de un sistema destinado a producción.

El modelo se construyó ajustando una ResNet-34 preentrenada en ImageNet mediante AutoGluon `MultiModalPredictor`. A pesar del identificador del repositorio, que menciona `resnet18`, la configuración finalmente seleccionada usa un backbone `resnet34` con todas las capas desbloqueadas (`optim.peft = None`). La elección se hizo con una búsqueda de 8 configuraciones sobre 289 imágenes de entrenamiento, con parada temprana y selección por macro-F1 en una validación interna agrupada por `parent_id`.

Su interés es fundamentalmente didáctico y metodológico: muestra cómo comparar estrategias de ajuste parcial (`bit_fit`, `norm_fit`, `lora` y ajuste completo) cuando el conjunto de datos es minúsculo, en este caso unas 23 fotografías originales ampliadas mediante volteos y recortes. Los resultados deben leerse con mucha cautela: la exactitud en test es 0,727 con un intervalo de confianza del 95 % de [0,434, 0,903] calculado sobre solo 11 imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional ResNet-34 con conexiones residuales (backbone de `timm`, preentrenado en ImageNet) |
| Parámetros totales | no disponible en la model card; la arquitectura ResNet-34 estándar tiene aproximadamente 21,8 millones de parámetros |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada fija de 224x224 píxeles RGB) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (el modelo no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no especificado en la model card; es un checkpoint de AutoGluon `MultiModalPredictor` y el repositorio ocupa 0,1 GB |
| Tarea | Clasificación binaria de escenas: `water` / `no_water` |
| Etiquetas de salida | 2 (`water`, `no_water`) |
| Dataset de entrenamiento | `ssg1/places-water-binary` |
| Métrica de selección | macro-F1 sobre validación interna agrupada por `parent_id` |
| Librería | autogluon |
| Descargas / likes | 27 / 0 |
| Fecha de publicación | 2026-09-22 |

## Arquitectura y entrenamiento

El modelo es una ResNet-34, una CNN con bloques residuales de dos convoluciones 3x3 y atajos de identidad, adaptada a clasificación binaria. El backbone procede de `timm` con pesos de ImageNet y se ajustó íntegramente (incluidos los filtros convolucionales) mediante AutoGluon `MultiModalPredictor` con entrada de 224x224. La búsqueda de hiperparámetros cubrió 8 configuraciones, con hasta 10 épocas cada una y parada temprana (`optim.patience = 3`) restaurando el mejor checkpoint. Los ejes explorados fueron `optim.peft`, el backbone (`resnet18` frente a `resnet34`), `optim.lr` (log-uniforme entre 1e-5 y 5e-3), `optim.lr_decay` y `env.batch_size`. Las cuatro primeras configuraciones cubrieron exactamente los cuatro valores de `optim.peft`, de modo que esa comparación está garantizada y no depende de un sorteo aleatorio.

La configuración ganadora fue `peft = None`, `backbone = resnet34`, `lr = 0,002218163430073746`, `lr_decay = 1.0` y `batch_size = 32`. El impacto del grado de ajuste fue notable: el ajuste completo alcanzó un macro-F1 de 0,7002 en una sola prueba, `norm_fit` llegó a 0,6470 como mejor valor pero con media de 0,3615 en 4 intentos, `lora` se quedó en 0,4604 (media 0,3919 en 2 intentos) y `bit_fit` en 0,3235. El entrenamiento se realizó en una Tesla T4 con semilla `20260922`, y el coste total fue de 3,3 minutos de búsqueda más 42 segundos de reentrenamiento del modelo ganador. Los datos son volteos y recortes de unas 23 fotografías originales, con los splits agrupados por `parent_id` para evitar que una copia aumentada de una imagen de entrenamiento participase en la selección del modelo.

## Capacidades

- Clasificación binaria de imágenes de escenas en dos clases mutuamente excluyentes: `water` y `no_water`.
- Entrada restringida a fotografías RGB de 224x224 píxeles; no gestiona otras resoluciones o modalidades sin preprocesado previo.
- Detección de presencia de agua en el sentido amplio del anotador del dataset (charcos, fuentes, calles mojadas entrarían dentro de la categoría según el criterio del autor de los datos).
- Transferencia de aprendizaje desde ImageNet: el backbone está preentrenado y ajustado, no entrenado desde cero.
- No soporta *tool calling*, *function calling* ni uso como agente.
- No tiene modo de razonamiento (*thinking*), ni capacidades de visión más allá de la clasificación, ni generación de texto.
- No tiene capacidades multilingües porque no procesa lenguaje natural.
- No se documentan capacidades de detección, segmentación ni localización de objetos; la salida es una etiqueta por imagen.

## Casos de uso

- Demostración docente de *transfer learning*: sirve como ejemplo ejecutable de cómo ajustar un backbone convolucional preentrenado con AutoGluon en un dataset de menos de 300 imágenes, comparando estrategias de `peft`.
- Comparación de estrategias de ajuste parcial: la tabla de `optim.peft` del repositorio permite ilustrar en clase la diferencia entre congelar filtros convolucionales (`bit_fit`, `norm_fit`), insertar adaptadores de bajo rango (`lora`) y ajustar la red completa (`None`).
- Prototipado de etiquetado asistido: usar el modelo para preetiquetar imágenes candidatas con revisión humana obligatoria, aprovechando que el coste de inferencia es mínimo, pero nunca como fuente única de verdad.
- Línea base (*baseline*) interna en un pipeline de visión: sirve como referencia rápida para comparar contra modelos más grandes o contra clasificadores zero-shot antes de invertir en anotación.
- Prueba de infraestructura de despliegue: al ocupar menos de 0,1 GB y caber en cualquier GPU de consumo, es útil para validar flujos de empaquetado, versionado y servicio de modelos antes de pasar a cargas mayores.
- Ejercicio de análisis crítico de métricas: el intervalo de confianza de Wilson sobre 11 imágenes permite trabajar en un aula la diferencia entre una métrica puntual y la incertidumbre real de la estimación.
- Replicación de experimentos de búsqueda de hiperparámetros: el archivo `search_results.csv` del repositorio permite reproducir y auditar las 8 configuraciones probadas.

No debe emplearse en detección de inundaciones, sistemas de seguridad, monitorización medioambiental ni en ninguna decisión con consecuencias, tal y como advierte explícitamente la propia model card.

## Benchmarks y rendimiento

Resultados publicados por el autor:

| Métrica | Conjunto | Valor |
|---|---|---|
| Macro-F1 | Validación interna (102 imágenes, agrupada por `parent_id`) | 0,7002 |
| Exactitud | Test (n = 11) | 0,727, IC 95 % de Wilson [0,434, 0,903] |
| Macro-F1 | Test (n = 11) | 0,727 |
| Exactitud balanceada | Test (n = 11) | 0,733 |

Comparación del efecto de `optim.peft` durante la búsqueda:

| `optim.peft` | Mejor macro-F1 | Media | Intentos |
|---|---|---|---|
| `None` (ajuste completo) | 0,7002 | 0,7002 | 1 |
| `norm_fit` | 0,6470 | 0,3615 | 4 |
| `lora` | 0,4604 | 0,3919 | 2 |
| `bit_fit` | 0,3235 | 0,3235 | 1 |

El propio autor advierte de que el test consta de 11 imágenes y que su intervalo de confianza tiene unos 25 puntos porcentuales de anchura, por lo que solo confirma que el modelo no está roto. La cifra utilizable para comparar configuraciones es el macro-F1 de validación interna sobre 102 imágenes. No se han publicado resultados comparativos contra otros modelos sobre este mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en precisión completa (los pesos de una ResNet-34 en fp32 ocupan aproximadamente 87 MB, coherente con el tamaño de repositorio de 0,1 GB). En fp16 o int8 el consumo es aún menor.
- GPU recomendadas: no hay requisitos exigentes. Cualquier GPU moderna sirve; el entrenamiento documentado se hizo en una NVIDIA Tesla T4.
- Cabe en GPU de consumo: sí, sin problema, en tarjetas como GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090 y también en iGPU integradas con suficiente memoria compartida. También es viable la inferencia en CPU.
- Opciones de despliegue: AutoGluon `MultiModalPredictor` es la vía nativa, ya que el artefacto es un checkpoint de esa librería sobre PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje. La exportación a ONNX o TorchScript no está documentada en la model card.
- Latencia y throughput: no disponibles. Los únicos tiempos publicados son de entrenamiento: 3,3 minutos para las 8 configuraciones de la búsqueda y 42 segundos para reentrenar el modelo ganador en una Tesla T4.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

No existen resultados publicados de otros modelos sobre el conjunto de test de 11 imágenes de este proyecto, por lo que la comparación de rendimiento no es posible. La tabla siguiente compara características estructurales; las cifras de parámetros y de ImageNet corresponden a la literatura de las arquitecturas, no a la model card.

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad | Rendimiento en este dataset |
|---|---|---|---|---|---|
| places-water-resnet18-automl (ResNet-34 ajustada) | ~21,8 M (arquitectura estándar) | 224x224 RGB | CC-BY-4.0 | Repositorio de HuggingFace (27 descargas) | macro-F1 0,7002 en validación interna; exactitud 0,727 en test (n = 11) |
| ResNet-18 ajustada con la misma receta | ~11,7 M (arquitectura estándar) | 224x224 RGB | según pesos de `timm` | explorada dentro de la misma búsqueda | no disponible (forma parte de la búsqueda, no se publica su puntuación individual) |
| CLIP en modo zero-shot | no disponible | 224x224 RGB | licencia propia de OpenAI | ampliamente disponible | no disponible; sería un competidor natural por no requerir entrenamiento |
| ViT-B/16 ajustado | ~86 M (arquitectura estándar) | 224x224 RGB | según pesos de `timm` | ampliamente disponible | no disponible |

Dado el tamaño del conjunto de test, cualquier comparación numérica entre estos modelos sobre este dataset sería ruido estadístico.

## Limitaciones y advertencias

- El conjunto de datos contiene unas 23 fotografías originales; el resto de las imágenes son aumentos (volteos y recortes). El split agrupado por `parent_id` lo tiene en cuenta, pero el recuento bruto de imágenes engaña.
- El conjunto de test tiene 11 imágenes. Cualquier comparación contra otro modelo sobre ese conjunto carece de significación estadística.
- La definición de "agua" corresponde al criterio de un único anotador: un charco, una fuente o una calle mojada entran o no entran según su juicio, sin una segunda opinión que valide la frontera entre clases.
- Sesgo de escena: las imágenes provienen de una única colección fotográfica, con su propio encuadre, iluminación y geografía. El comportamiento en imágenes aéreas, subacuáticas o nocturnas es desconocido y probablemente malo.
- Herencia de ImageNet: el backbone arrastra los sesgos del preentrenamiento en ImageNet, y un ajuste con filtros congelados los hereda casi por completo.
- Posible atajo (*shortcut*): si el panel de colores del análisis exploratorio mostraba una separación limpia, parte de la puntuación podría venir del nivel medio de azul de la imagen y no del reconocimiento real de agua.
- Riesgo de alucinación en sentido amplio: al ser un clasificador, no genera texto, pero sí puede producir falsos positivos y falsos negativos con alta confianza sobre dominios visuales alejados del entrenamiento.
- La licencia CC-BY-4.0 exige atribución. Los derechos sobre las imágenes subyacentes corresponden al autor del dataset original, y los pesos del backbone proceden de `timm` con preentrenamiento en ImageNet.
- Uso comercial: la licencia CC-BY-4.0 lo permite con atribución, pero la propia model card desaconseja cualquier aplicación donde un falso negativo tenga consecuencias, como detección de inundaciones o sistemas de seguridad.
- No hay información publicada sobre cuantización, exportación a otros formatos ni latencia de inferencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunkaiwen/places-water-resnet18-automl
- Dataset de origen: https://huggingface.co/datasets/ssg1/places-water-binary
- AutoGluon (librería de entrenamiento): https://auto.gluon.ai/
- `timm` (backbone preentrenado en ImageNet): https://github.com/huggingface/pytorch-image-models
- Repositorio del modelo, archivo `search_results.csv` con las 8 configuraciones evaluadas: incluido en el propio repositorio de HuggingFace
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos correspondían a páginas de viajes en árabe sobre el desierto de Atacama y no se han incluido por no ser pertinentes.
