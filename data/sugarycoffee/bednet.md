# SugaryCoffee/BedNet

## Resumen

BedNet es un clasificador binario de imágenes que responde a una única pregunta desde una cámara de bandeja en posición fija: ¿hay una pieza impresa sobre la cama de impresión? Lo desarrolla el usuario SugaryCoffee y está pensado para granjas de impresión 3D FDM con fulfillment autónomo, de modo que las impresiones terminadas puedan liberarse automáticamente sin que un operario revise cada fotograma. El modelo se apoya en una columna vertebral EfficientNet-B0 preentrenada en ImageNet y ajustada de extremo a extremo, con la capa final sustituida por una cabeza de dos clases (`clear` / `occupied`).

El modelo tiene 4.010.110 parámetros (~4,0 M), de los cuales solo 2.562 corresponden a la nueva cabeza de clasificación, y ocupa 16 MB en fp32. Trabaja con entradas RGB redimensionadas de forma bilineal a 288×288 con normalización de ImageNet, y se distribuye tanto en PyTorch (`.pt`) como exportado a ONNX (opset 17). Su relevancia práctica está en el coste: se ejecuta a unos 30 ms por fotograma en CPU con `onnxruntime-node` y por debajo de 5 ms en GPU, lo que permite integrarlo como paso rápido dentro de un pipeline de inspección.

No es un modelo generativo ni un modelo de lenguaje: es un componente de visión muy especializado, entrenado con apenas ~1.200 fotogramas procedentes de 29 impresoras de una única granja, con etiquetas auditadas manualmente por el operario. La propia model card es explícita sobre sus límites: con ese volumen de datos, el ajuste fino completo apenas supera a una sonda lineal sobre la columna congelada en precisión global, y su valor real está en las probabilidades calibradas y en la localización Grad-CAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (backbone preentrenado en ImageNet, ajuste fino de extremo a extremo) con cabeza lineal de 2 clases |
| Parametros totales | 4.010.110 (~4,0 M); la cabeza de 2 clases aporta 2.562 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada fija de 288×288 RGB) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos fp32 (16 MB) en `.pt` y `.onnx` |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC-BY 4.0 (requiere atribucion) |
| Formato de pesos | PyTorch (`.pt`) y ONNX (opset 17) |
| Entrada | Imagen RGB, redimensionado bilineal a 288×288, normalizacion ImageNet (`mean=[0.485,0.456,0.406]`, `std=[0.229,0.224,0.225]`), tensor NCHW float32 |
| Salida | Logits `[clear, occupied]` → softmax → `P(occupied)` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Modelo base | efficientnet-b0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

BedNet utiliza EfficientNet-B0 como extractor de características. Su capa de clasificación original se reemplaza por `Linear(in_features, 2)`, que produce dos logits correspondientes a `clear` y `occupied`. La entrada se fija en 288×288 píxeles con redimensionado bilineal y normalización de ImageNet; la model card advierte de que usar otro algoritmo de escalado (por ejemplo Lanczos) desplaza la calibración de probabilidades. El ajuste es completo, no congelado: se entrena toda la red, no solo la cabeza.

Los datos de entrenamiento son ~1.200 fotogramas procedentes de 29 impresoras de una granja, con etiquetas derivadas de eventos operativos (fotogramas `manual-clear-*` y `post-print-reference-*`, coincidencia con la línea base de bandeja vacía, estado `parts_present BLOCKED`) y auditadas manualmente por el operario, con 7 correcciones aplicadas mediante una herramienta de revisión. La partición es *group-aware*: todos los fotogramas de una misma impresora/cámara caen en un único split, de modo que el conjunto de test procede de dispositivos nunca vistos en entrenamiento. La convención de etiquetado es estricta: `clear` significa bandeja limpia, por lo que restos de filamento o suciedad cuentan como `occupied`. No se emplearon técnicas de RLHF ni DPO, lógicamente fuera de alcance para una tarea de clasificación visual.

La innovación destacable no está en la arquitectura, sino en el uso operativo: el modelo funciona como *fast-path* dentro de un sistema con salvaguardas. Solo las predicciones con alta confianza de `clear` liberan la bandeja automáticamente (umbral de `P(occupied) ≤ 0.15`); todo lo demás recae en un revisor humano o en un LLM. Además, el autor documenta la localización Grad-CAM como herramienta de interpretabilidad.

## Capacidades

- Clasificación binaria de imágenes: distingue entre bandeja vacía (`clear`) y bandeja ocupada (`occupied`) desde una cámara de cama en posición fija.
- Probabilidades calibradas: la salida softmax permite fijar umbrales operativos; en la calibración de producción se logran cero liberaciones falsas con `P(occupied) ≤ 0.15`, y la primera liberación falsa aparece en 0.20.
- Localización mediante Grad-CAM para inspeccionar en qué regiones se fija el modelo.
- Inferencia en CPU y GPU: ~30 ms por fotograma en CPU con `onnxruntime-node` y menos de 5 ms por fotograma en GPU.
- Exportación portable a ONNX (opset 17) con argmax idéntico al de PyTorch sobre fotogramas reales.
- Robusta a cambios de dispositivo: evaluada en impresoras nunca vistas durante el entrenamiento gracias a la partición *group-aware*.
- Uso como pre-filtro dentro de un sistema mayor con verificación humana o por LLM.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No procesa audio ni vídeo de forma nativa (trabaja fotograma a fotograma).
- No dispone de modo de pensamiento (*thinking mode*) ni de razonamiento explícito.

## Casos de uso

- Liberación automática de piezas en granjas de impresión 3D: el modelo decide si la cama está vacía tras completarse un trabajo y libera la impresora para la siguiente cola. Es adecuado porque solo actúa como *fast-path* en predicciones de alta confianza (`P(occupied) ≤ 0.15`), dejando el resto a revisión humana.
- Pre-filtrado en pipelines de inspección visual: reduce la carga de un revisor humano o de un LLM que solo examina los fotogramas ambiguos. Con ~30 ms por fotograma en CPU, se puede procesar un flujo continuo de cámaras sin GPU dedicada.
- Detección de restos y residuos en la bandeja: al definir `clear` como bandeja limpia, el modelo marca como `occupied` cualquier fragmento de filamento o suciedad, lo que ayuda a evitar imprimir sobre una superficie contaminada.
- Programación de colas de impresión: la señal de ocupación por impresora permite a un planificador saber qué máquinas están realmente libres y reasignar trabajos sin intervención manual.
- Despliegue en *edge* sobre hardware modesto: con 16 MB en fp32 y ejecución por CPU vía ONNX Runtime, cabe en dispositivos tipo Raspberry Pi o placas Jetson junto a la propia impresora, sin depender de conectividad a un servidor central.
- Analítica de utilización de flota: registrar la proporción de tiempo en estado `occupied` por impresora permite detectar máquinas infrautilizadas, cuellos de botella o fallos recurrentes de retirada de piezas.
- Verificación post-procesado: comprobar que una pieza ha sido retirada antes de lanzar el siguiente trabajo, como control adicional dentro de un sistema que ya dispone de otras salvaguardas.
- Investigación en visión industrial de bajo coste: sirve como referencia de hasta dónde llega una EfficientNet-B0 con ~1.200 etiquetas auditadas en un dominio muy acotado, y como base para experimentos de calibración y umbrales.

## Benchmarks y rendimiento

Resultados sobre el split de test reservado (201 fotogramas de impresoras no vistas), frente a etiquetas validadas por el operario:

| Metrica | Valor |
|---|---|
| Precision global | 0,891 |
| Precision (clase `occupied`) | 0,893 |
| Recall (clase `occupied`) | 0,909 |
| Precision (clase `clear`) | 0,888 |
| Recall (clase `clear`) | 0,868 |
| Liberaciones falsas con umbral `P(occupied) ≤ 0.15` | 0 |
| Primera liberacion falsa | umbral 0,20 |

Comparativa antes y despues del ajuste fino, sobre el mismo conjunto de test:

| Modelo | Precision | AUC |
|---|---|---|
| Azar | 0,500 | 0,500 |
| Backbone ImageNet congelado + sonda lineal | 0,896 | 0,957 |
| BedNet (ajuste fino completo) | 0,891 | 0,960 |

La lectura que ofrece el propio autor es que, con solo ~1.200 fotogramas, el ajuste fino completo mejora a la sonda lineal únicamente de forma marginal en precisión, aunque sí aporta probabilidades calibradas (lo que hace posible el umbral de cero liberaciones falsas) y localización Grad-CAM. No se han publicado comparaciones con otros modelos de ocupación de bandeja en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el checkpoint fp32 ocupa 16 MB y las activaciones de una entrada 288×288 son reducidas. Cabe en cualquier GPU, incluida una integrada.
- GPU recomendadas: cualquier GPU con soporte para ONNX Runtime o PyTorch; en la información disponible no se especifican modelos concretos (A100, H100, RTX 4090, etc.). El rendimiento declarado es <5 ms por fotograma en GPU.
- Compatibilidad con GPU de consumo: sí, en la práctica totalidad de GPU de consumo e incluso en iGPU, dado el tamaño del modelo.
- Ejecución sin GPU: viable, con ~30 ms por fotograma en CPU usando `onnxruntime-node`, lo que equivale a unos 33 FPS por proceso en el entorno medido.
- Opciones de despliegue: ONNX Runtime (Python, Node u otros enlaces) con el grafo `bednet.onnx`, y PyTorch con `bednet.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput estimados: ~30 ms por fotograma en CPU y <5 ms por fotograma en GPU, según la model card; el throughput exacto depende del hardware y del número de procesos en paralelo (no disponible).
- Requisito de preprocesado: redimensionado bilineal a 288×288 (en la librería `sharp`, `kernel: "linear"`) con normalización ImageNet; usar otro kernel altera la calibración.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros clasificadores de ocupación de bandeja de impresión 3D. La única referencia cuantitativa disponible son las líneas base internas del propio autor, medidas sobre el mismo conjunto de test:

| Alternativa | Parametros | Precision | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Azar (linea base teorica) | no aplica | 0,500 | 0,500 | no aplica | no aplica |
| Backbone EfficientNet-B0 ImageNet congelado + sonda lineal | ~4,0 M + cabeza | 0,896 | 0,957 | segun pesos ImageNet | no distribuida como artefacto independiente |
| BedNet (ajuste fino completo) | 4.010.110 | 0,891 | 0,960 | CC-BY 4.0 | HuggingFace, `.pt` y `.onnx` |

Para el resto de alternativas del mismo tamano o de la misma tarea: no disponible.

## Limitaciones y advertencias

- Volumen de datos muy reducido: ~1.200 fotogramas de una sola granja de impresión. El propio autor señala que el cuello de botella es conseguir más datos etiquetados, no más trucos de entrenamiento.
- Ganancia marginal del ajuste fino: en precisión global el modelo (0,891) queda ligeramente por debajo de una sonda lineal sobre la columna congelada (0,896); su ventaja está en la calibración, no en la precisión bruta.
- Dominio muy restringido: diseñado para cámaras de bandeja en posición fija sobre impresoras FDM con láminas PEI/spring-steel y una iluminación de taller concreta. No es apto para fotografías arbitrarias de impresiones 3D.
- Sensibilidad al preprocesado: cambiar el algoritmo de redimensionado (por ejemplo, a Lanczos) desplaza la calibración y por tanto invalida los umbrales operativos.
- Dependencia del umbral: los cero fallos en liberaciones se obtienen con `P(occupied) ≤ 0.15`; elevar el umbral a 0.20 ya produce la primera liberación falsa. No debe superarse ese valor sin recalibrar.
- Definición estricta de `clear`: restos de filamento y suciedad se etiquetan como `occupied`, lo que puede generar falsos positivos en bandejas visualmente sucias pero funcionalmente libres.
- Riesgo de sobreajuste a la flota: aunque el test usa impresoras no vistas, todas proceden del mismo entorno, iluminación y tipo de cámara. El comportamiento en otras instalaciones no está validado.
- El modelo es solo un acelerador: la model card indica explícitamente que nunca debe anular otras comprobaciones de seguridad.
- Licencia CC-BY 4.0: permite uso comercial, pero exige atribución al autor.
- Sesgos conocidos específicos (demográficos, culturales o lingüísticos): no aplica, ya que no procesa personas ni lenguaje; los sesgos relevantes serían de dominio visual (iluminación, tipo de lámina, ángulo de cámara) y no están cuantificados en la información disponible.
- La model card proporcionada está truncada en la sección de Grad-CAM, por lo que parte de la documentación de esa funcionalidad no está disponible.
- Repositorio sin descargas ni likes registrados y con tamaño reportado de 0,0 GB, lo que sugiere un artefacto aún no adoptado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SugaryCoffee/BedNet
- Repositorio `iholmdahl/Bednet_model` (https://github.com/iholmdahl/Bednet_model): no relacionado; trata sobre modelos epidemiológicos de uso de mosquiteras contra la malaria y no guarda relación con este clasificador de impresión 3D.
- Resto de resultados de la búsqueda web (guías de herramientas de IA en Tor, generadores de arte, detectores de imágenes generadas, portales de login ajenos): no relevantes para este modelo. No se han encontrado papers, blogs ni demos adicionales en la información disponible.
