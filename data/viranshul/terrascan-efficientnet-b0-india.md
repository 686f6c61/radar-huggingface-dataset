# viranshul/terrascan-efficientnet-b0-india

## Resumen

TerraScan EfficientNet-B0 India es un clasificador de imagenes de satelite Sentinel-2 que asigna parches de 64 x 64 pixeles (10 m por pixel, es decir, 640 m x 640 m) a las 10 clases de uso del suelo del dataset EuroSAT. Lo desarrolla Viranshul Panchal como parte del proyecto TerraScan, un trabajo de portfolio centrado en el cambio de dominio entre imagenes europeas (EuroSAT) e imagenes de la India (Gujarat). El modelo parte de los pesos `efficientnet_b0.ra_in1k` de timm (ImageNet-1k) y se afina primero con EuroSAT y despues con un conjunto reducido de parches indios verificados manualmente.

La relevancia del modelo es metodologica mas que de producto: documenta de forma explicita el efecto del domain shift entre satelite europeo e indio y cuantifica la mejora obtenida al afinar con datos locales. La precision en test indio pasa de 0,4486 a 0,6831 (media de 3 semillas), mientras que la precision en EuroSAT apenas cae 0,4 puntos porcentuales, lo que evidencia que el ajuste fino no destruye el conocimiento previo.

El modelo es muy pequeno (4.020.358 parametros), se distribuye en formato ONNX para inferencia en CPU con onnxruntime y tiene licencia Apache-2.0. El autor advierte que es un proyecto de aprendizaje y no un producto de cartografiado: el conjunto de test indio tiene solo 81 parches y el modelo falla en aproximadamente el 32 % de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, compound scaling) |
| Parametros totales | 4.020.358 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada fija de 128 x 128 px) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX float; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) y PyTorch state dict (`best.pt`), mas `config.yaml` y `onnx_info.json` |

## Arquitectura y entrenamiento

La red es una EfficientNet-B0 estandar con la capa final sustituida por 10 salidas, una por clase EuroSAT (AnnualCrop, Forest, HerbaceousVegetation, Highway, Industrial, Pasture, PermanentCrop, Residential, River, SeaLake). La entrada es un parche RGB de 64 x 64 escalado bilinealmente a 128 x 128, normalizado a rango 0-1 y estandarizado con media y desviacion tipica de ImageNet. Los pesos iniciales son `efficientnet_b0.ra_in1k` de timm, entrenados con RandAugment sobre ImageNet-1k.

El entrenamiento tiene dos fases. Primero se entrena sobre EuroSAT RGB (27.000 imagenes, 10 clases) con particion fija 70/15/15, AdamW, learning rate 0,001, weight decay 0,05, schedule coseno, label smoothing 0,1, 50 epocas, batch 64 y aumentos de volteo, rotaciones de 90 grados y color jitter ligero; se conserva la epoca con menor perdida de validacion. Despues se afina con 149 parches indios etiquetados de tres zonas (ciudad de Ahmedabad, Narmada en Bharuch y zona industrial de Ankleshwar), todas las capas, learning rate 0,0001, 10 epocas, batch 32, mezclando en cada epoca 600 imagenes frescas de entrenamiento de EuroSAT para evitar el olvido catastrofico. La particion india es por area, de modo que parches vecinos visualmente parecidos no quedan repartidos entre train y test. No hay conjunto de validacion indio: se conserva la ultima epoca.

Una innovacion practica destacable es la calibracion de color para imagenes Sentinel-2 Level-2A (Microsoft Planetary Computer), que requieren un ajuste documentado en `src/imagery.py` y el estiramiento de EuroSAT antes de la inferencia; sin ese paso, los colores se desvian y las predicciones empeoran. El archivo ONNX se valido contra los pesos PyTorch con una diferencia maxima de 7,2e-06 en las puntuaciones sobre 20 parches indios.

## Capacidades

- Clasificacion de imagenes de satelite en 10 clases de uso del suelo (EuroSAT).
- Inferencia en CPU sin PyTorch mediante onnxruntime.
- Entrada de parches RGB de 64 x 64 px (reescalado interno a 128 x 128).
- Salida de 10 puntuaciones de clase con confianza por prediccion.
- Generalizacion entre dominios: mantiene precision en EuroSAT (0,9828) tras el ajuste fino indio.
- No soporta tool calling, agentes, generacion de texto, vision general, audio ni modo thinking.
- No tiene capacidades multilingues (no procesa texto).

## Casos de uso

- Prototipado de clasificacion de uso del suelo en la India: el modelo permite obtener una primera etiqueta de cobertura (cultivo, residencial, industrial) sobre parches Sentinel-2 de Gujarat con un coste computacional minimo, util para validar pipelines antes de invertir en modelos mayores.
- Investigacion sobre domain shift en teledeteccion: sirve como linea base reproducible para estudiar cuanto mejora un modelo al afinar con datos locales y cuanto conocimiento europeo se degrada en el proceso.
- Docencia y formacion: su tamano (4 M de parametros), su licencia Apache-2.0 y su formato ONNX lo hacen adecuado para ejercicios de clasificacion de imagenes satelitales en CPU, sin necesidad de GPU.
- Inferencia en entornos sin GPU: al ejecutarse con onnxruntime en CPU a unos 7,7 ms por parche (un hilo, batch 1), puede desplegarse en portatiles o servidores modestos para procesar lotes pequenos de parches.
- Preetiquetado asistido: puede generar etiquetas preliminares sobre zonas nuevas de la India que despues un analista revisa manualmente, reduciendo el coste de anotacion en proyectos de cartografiado.
- Monitorizacion de cambios urbanos a pequena escala: aplicado a parches de 640 m x 640 m de zonas residenciales o industriales, permite detectar variaciones de clase entre fechas, siempre con validacion humana por la tasa de error documentada.
- Evaluacion de calibracion radiometrica: el modelo depende de un ajuste de color especifico para Level-2A, por lo que sirve para probar y comparar pipelines de preprocesado de imagenes Sentinel-2.

## Benchmarks y rendimiento

Datos publicados en la model card (media ± desviacion tipica sobre 3 semillas: 42, 43, 44).

| Metrica | Antes del ajuste fino (solo Europa) | Despues del ajuste fino |
|---|---|---|
| Precision en test indio | 0,4486 ± 0,0071 | 0,6831 ± 0,0311 |
| Macro-F1 en test indio | 0,3729 ± 0,0028 | 0,4749 ± 0,0126 |
| Precision en test EuroSAT (4.050 imagenes) | 0,9869 ± 0,0013 | 0,9828 ± 0,0006 |

Rendimiento por clase en el test indio para la semilla 42 (precision 0,7160; intervalo bootstrap del 95 %: 0,62-0,81):

| Clase | Parches de test | Predichos como esta clase | F1 |
|---|---|---|---|
| AnnualCrop | 25 | 22 | 0,68 |
| Forest | 4 | 1 | 0,40 |
| HerbaceousVegetation | 5 | 7 | 0,50 |
| Highway | 8 | 11 | 0,84 |
| Industrial | 6 | 8 | 0,57 |
| Pasture | 1 | 0 | 0,00 |
| PermanentCrop | 2 | 5 | 0,00 |
| Residential | 30 | 27 | 0,91 |
| River | 0 | no disponible | no disponible |
| SeaLake | 0 | no disponible | no disponible |

Velocidad: 7,7 ms por parche en un hilo de CPU, batch 1, solo modelo (sin lectura de imagen), medido en el portatil de entrenamiento con la version entrenada en EuroSAT.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia ONNX en CPU; en GPU el modelo ocupa menos de 100 MB en float32 por sus 4 M de parametros.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier RTX o GTX con suficiente memoria para el runtime (practicamente todas).
- Despliegue: onnxruntime (CPU o GPU), PyTorch con timm (`timm.create_model("efficientnet_b0", pretrained=False, num_classes=10)`), o exportacion a otros runtimes ONNX.
- Latencia: 7,7 ms por parche en CPU de un solo hilo, batch 1, sin contar lectura ni preprocesado de imagen.
- Throughput: no disponible de forma agregada; se puede estimar a partir de la latencia por parche segun el numero de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TerraScan EfficientNet-B0 India | 4.020.358 | Parche 64 x 64 px (reescalado a 128 x 128) | 0,6831 en test indio; 0,9828 en EuroSAT | Apache-2.0 | Hugging Face (ONNX + PyTorch) |
| EfficientNet-B0 `ra_in1k` (timm) | 5,3 M aprox. (1.000 clases) | Imagen 224 x 224 px | no disponible para EuroSAT/India | Apache-2.0 | Hugging Face (timm) |
| Modelo base TerraScan solo EuroSAT | 4.020.358 | Parche 64 x 64 px | 0,4486 en test indio; 0,9869 en EuroSAT | Apache-2.0 | Repo del proyecto (evidencia) |
| Otros clasificadores EuroSAT | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Proyecto de portfolio y aprendizaje: el autor indica explicitamente que no es un producto de cartografiado.
- Conjunto de test indio muy pequeno (81 parches de 2 zonas), con intervalos de confianza amplios (0,62-0,81 para la semilla 42).
- Tasa de error aproximada del 32 % en test indio (media de 3 semillas); macro-F1 de solo 0,4749.
- Clases con muy pocos parches de test (Pasture con 1, PermanentCrop con 2, Forest con 4) producen F1 poco fiables; River y SeaLake no tienen parches de test.
- El archivo subido corresponde solo a la semilla 42; las cifras de 3 semillas describen la receta, no este peso concreto.
- No hay conjunto de validacion indio: se conserva la ultima epoca de ajuste fino, sin seleccion por validacion.
- Dependencia critica del preprocesado de color: imagenes Sentinel-2 Level-2A requieren el ajuste de `src/imagery.py` y el estiramiento de EuroSAT; sin ello las predicciones se degradan.
- Sesgos de dominio: entrenado con datos europeos (EuroSAT) y una muestra reducida de Gujarat; la generalizacion a otras regiones de la India o a otras epocas del ano no esta validada.
- Riesgo de confusion entre clases visualmente proximas (Pasture, PermanentCrop, HerbaceousVegetation) segun la matriz de confusion por clase.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones de precision desaconsejan su uso en produccion sin validacion local y supervision humana.
- No procesa texto ni soporta tareas multimodales mas alla de la clasificacion de parches.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viranshul/terrascan-efficientnet-b0-india
- Dataset de entrenamiento indio: https://huggingface.co/datasets/viranshul/terrascan-india-gujarat
- Repositorio del proyecto TerraScan: https://github.com/Viranshul-P/terrascan
- Codigo de preprocesado de imagenes: https://github.com/Viranshul-P/terrascan/blob/main/src/imagery.py
- Pesos base en timm: https://huggingface.co/timm/efficientnet_b0.ra_in1k
- Paper de EfficientNet: https://arxiv.org/abs/1905.11946
- Dataset EuroSAT: https://github.com/phelber/EuroSAT
- Perfil del autor en Hugging Face: https://huggingface.co/viranshul
