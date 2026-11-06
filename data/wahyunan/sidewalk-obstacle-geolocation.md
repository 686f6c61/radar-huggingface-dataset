# wahyunan/sidewalk-obstacle-geolocation

## Resumen

Sidewalk Obstacle Geolocation es un paquete de pesos publicado por el usuario wahyunan (vinculado al repositorio de GitHub wahyunanandika/sidewalk-obstacle-geolocation) que implementa un pipeline de vision por computador para detectar obstaculos en aceras y situarlos sobre un mapa empleando unicamente los metadatos EXIF de una fotografia tomada con un smartphone. No es un modelo de lenguaje ni un modelo fundacional unico, sino una pareja de modelos especializados que trabajan en cadena: un SegFormer-B0 para segmentacion semantica de la acera y un YOLO11s para deteccion de 13 clases de obstaculos urbanos.

El objetivo es resolver un problema de accesibilidad urbana: identificar barreras fisicas (postes, bolardos, bicicletas, obras, arboles, etc.) que dificultan el transito peatonal, especialmente para personas con movilidad reducida o discapacidad visual, y georreferenciarlas sin necesidad de hardware GPS adicional ni de servicios de vision de terceros. La propuesta resulta relevante por su enfoque de bajo coste (una foto de movil y sus EXIF) y por combinar dos tareas densas de vision en un flujo reproducible.

Tecnicamente son dos redes pequenas: SegFormer-B0 (variante ligera de la familia SegFormer, transformer jerarquico con decoder MLP) y YOLO11s (detector de la familia Ultralytics en su tamano "small"). El repositorio ocupa 0,1 GB y se distribuye bajo licencia AGPL-3.0. No se dispone de informacion sobre el numero de parametros exacto ni sobre la composicion del dataset de entrenamiento mas alla de que procede de imagenes de calle de Indonesia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos modelos: SegFormer-B0 (segmentacion semantica) + YOLO11s (deteccion de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision; entrada 512x512 en SegFormer y 1024x1024 en YOLO) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en punto flotante: `.ckpt` y `.pt`) |
| Idiomas soportados | no disponible (no es un modelo linguistico; las etiquetas de clase estan en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`segformer_final.ckpt`) y Ultralytics PyTorch (`yolo-obstacle-detection.pt`) |

## Arquitectura y entrenamiento

El componente de segmentacion es un SegFormer-B0 afinado con PyTorch Lightning para una tarea binaria (fondo / acera) sobre recortes de 512x512. El checkpoint publicado corresponde a la ultima epoca (20), aunque la mejor perdida de validacion se registro en la epoca 10 (0,076), lo que sugiere un cierto sobreajuste posterior. El componente de deteccion es un YOLO11s de Ultralytics afinado para 13 clases de obstaculos con entradas de 1024x1024; el mejor punto de validacion se alcanzo en la epoca 28, con mAP50 de 0,627 y mAP50-95 de 0,329.

No se detalla en la informacion disponible el volumen de tokens ni el numero de imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos mas alla de las habituales en los frameworks empleados. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable al tratarse de modelos discriminativos de vision. La innovacion principal no reside en la arquitectura, sino en el pipeline completo: estimacion de la posicion de cada obstaculo a partir de la geometria de la escena y de los metadatos EXIF de la fotografia, sin sensores adicionales.

Las 13 clases de obstaculos definidas son: Guiding Block, bench, bicycle, blockade, bollard, car, cone, construction, fire hydrant, motorcycle, pole, street-vendor y tree-trunk.

## Capacidades

- Segmentacion semantica binaria de acera frente a fondo en imagenes de 512x512.
- Deteccion de objetos en 13 clases de mobiliario urbano y obstaculos con entradas de 1024x1024.
- Geolocalizacion aproximada de los obstaculos detectados sobre un mapa a partir de los metadatos EXIF de la fotografia.
- Procesamiento de imagenes capturadas con smartphone, sin requisito de GPS dedicado ni de LiDAR.
- Integracion en pipelines de Python mediante `huggingface_hub`, Ultralytics y `transformers`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: son modelos puramente visuales y discriminativos.
- No dispone de capacidades multilingues ni de modalidades de audio o video.

## Casos de uso

- Cartografiado de accesibilidad urbana: a partir de fotografias ciudadanas con EXIF, el pipeline detecta obstaculos y los posiciona en un mapa, permitiendo construir capas de accesibilidad peatonal de bajo coste sin flotas de sensores.
- Auditoria de itinerarios peatonales: procesar lotes de fotos de una ruta para identificar tramos con densidad alta de bolardos, postes o bicicletas aparcadas y priorizar intervenciones municipales.
- Aplicaciones de navegacion accesible: integrar las detecciones en una app que advierta a personas con movilidad reducida o discapacidad visual de barreras en su trayecto, usando la segmentacion para confirmar que el obstaculo esta sobre la acera.
- Inventario de mobiliario urbano: el detector reconoce bancos, papeleras implicitas en la clase construction, hidrantes, arboles y vendedores callejeros, lo que permite generar censos automaticos a partir de fotos de campo.
- Investigacion en vision aplicada a geociencias urbanas: servir como linea base reproducible para experimentos de geolocalizacion monocular con EXIF, comparando variantes de segmentacion y deteccion.
- Prototipado en dispositivos moviles o edge: al tratarse de SegFormer-B0 y YOLO11s, ambos modelos son lo bastante ligeros para ejecutarse en GPUs de consumo o en entornos embebidos con cuantizacion adicional, facilitando demos y validaciones de campo.
- Docencia y formacion: ejemplo completo de pipeline de dos etapas (segmentacion + deteccion) con georreferenciacion, util para cursos de vision por computador aplicada.

## Benchmarks y rendimiento

| Modelo | Tarea | Metrica | Valor |
|---|---|---|---|
| YOLO11s (afinado) | Deteccion de 13 clases | mAP50 (val, mejor epoca 28) | 0,627 |
| YOLO11s (afinado) | Deteccion de 13 clases | mAP50-95 (val, mejor epoca 28) | 0,329 |
| SegFormer-B0 (afinado) | Segmentacion binaria acera/fondo | Mejor perdida de validacion | 0,076 (epoca 10) |
| SegFormer-B0 (afinado) | Segmentacion binaria acera/fondo | IoU en test | no evaluado |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor advierte que el conjunto de validacion es pequeno (83 imagenes), por lo que las metricas por clase son ruidosas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de los modelos (SegFormer-B0 y YOLO11s) es plausible ejecutarlos en GPUs con 4-8 GB de VRAM en precision FP32/FP16, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no especificadas. Por la naturaleza ligera de ambos modelos, una RTX 3060, RTX 4060 o superiores serian suficientes; A100 o H100 no aportarian ventaja significativa salvo en procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs consumer modernas con al menos 4-6 GB de VRAM, si bien no hay medicion oficial.
- Opciones de despliegue: Ultralytics para YOLO11s, `transformers` (version 4.57.6, requerida por el autor para SegFormer) junto con la clase `SegformerFinetuner` del repositorio de GitHub, y PyTorch Lightning para cargar el checkpoint de segmentacion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Sidewalk Obstacle Geolocation (este) | Pipeline SegFormer-B0 + YOLO11s | no disponible | 512x512 (seg.) y 1024x1024 (det.) | mAP50 0,627; mAP50-95 0,329 | AGPL-3.0 |
| YOLO11s estandar (Ultralytics, COCO) | Detector generico | no disponible en la informacion | 640x640 tipico | no disponible en la informacion | AGPL-3.0 |
| SegFormer-B0 estandar (ADE20K) | Segmentacion semantica | no disponible en la informacion | 512x512 | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos publicados que permitan una comparacion cuantitativa con alternativas de la misma categoria en la informacion proporcionada. Cualquier comparacion numerica adicional requeriria consultar las fichas oficiales de YOLO11s y SegFormer-B0.

## Limitaciones y advertencias

- Bajo recall en clases criticas: Guiding Block (0,32), pole (0,32) y tree-trunk (0,47), lo que implica que el modelo omitira con frecuencia obstaculos relevantes para accesibilidad.
- Conjunto de validacion muy pequeno (83 imagenes), por lo que las metricas por clase son ruidosas y poco fiables para decisiones de produccion.
- El IoU en test del SegFormer no ha sido evaluado, de modo que no existe una medida publicada de calidad de la segmentacion en datos no vistos.
- Entrenado exclusivamente con imagenes de calle de Indonesia: es probable una degradacion significativa del rendimiento en otros paises, tipologias urbanas, senalizacion o condiciones de iluminacion.
- Dependencia de la calidad de los metadatos EXIF: fotos sin EXIF, con EXIF corrupto o con orientacion incorrecta pueden producir geolocalizaciones erroneas.
- Riesgo de falsos positivos y falsos negativos en escenas con oclusiones, lluvia, reflejos o iluminacion nocturna, no cuantificado en la informacion disponible.
- Licencia AGPL-3.0: el uso en servicios en red obliga a liberar el codigo fuente derivado; los pesos de YOLO afinados con Ultralytics heredan tambien AGPL-3.0 segun el propio autor, lo que restringe su uso en productos comerciales cerrados.
- Requiere `transformers==4.57.6` para cargar el SegFormer; versiones 5.x rompen la compatibilidad por cambios en los nombres de capas.
- No es un modelo linguistico: no genera texto, no razona y no admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wahyunan/sidewalk-obstacle-geolocation
- Repositorio del pipeline en GitHub: https://github.com/wahyunanandika/sidewalk-obstacle-geolocation
- Licencia Ultralytics (aplicable a los pesos YOLO): https://www.ultralytics.com/license
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
