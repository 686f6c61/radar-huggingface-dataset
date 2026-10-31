# TOMTOM17/wildfire-research-ai

## Resumen

Wildfire research AI es un proyecto de investigación no comercial publicado en Hugging Face por el usuario TOMTOM17, cuyo objetivo es analizar fotografías de cámaras para detectar posible actividad de incendios forestales. No se trata de un modelo único, sino de un pipeline local de análisis de imagen con tres componentes: un detector de fuego y humo (YOLOv8n entrenado en D-Fire, de rabahdev), un segmentador de llamas visibles (SegFormer del propio proyecto, versión v13 con limpieza de pequeñas islas en v16) y un clasificador de rango de comportamiento del fuego basado en DINOv2-small congelado con una cabeza lineal entrenada.

El sistema procesa una foto o una secuencia de fotos con marca de tiempo y genera salidas JSON, máscaras de imagen, superposiciones y un informe HTML. Está pensado para un escenario de hardware de bajo coste: una Raspberry Pi captura imágenes de una plataforma de cámara rotatoria y un ordenador con Windows ejecuta la inferencia en CPU mediante ONNX.

Es relevante como ejemplo de pipeline de visión artificial ligero y ejecutable en CPU para monitorización asequible de incendios. El propio autor subraya que es un prototipo de investigación no validado en campo, que no constituye un sistema de alerta de emergencias y que una predicción negativa no implica que una zona esté libre de fuego. El repositorio pesa aproximadamente 0,1 GB y los pesos se distribuyen en formato ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres componentes: detector YOLOv8n (D-Fire), segmentador SegFormer y clasificador DINOv2-small + cabeza lineal |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible (los especialistas usan grafos ONNX float32 en CPU) |
| Idiomas soportados | en (documentación; el modelo procesa imágenes, no texto) |
| Licencia | other (component-specific-research-licenses, no comercial) |
| Formato de pesos | ONNX (grafos float32 para CPU) |

## Arquitectura y entrenamiento

El pipeline consta de tres etapas retenidas. Primera, un detector de fuego y humo: un YOLOv8n sin modificar, entrenado sobre el dataset D-Fire por rabahdev, que produce cajas delimitadoras sobre imágenes RGB con tamaño por defecto de 640 píxeles y confianza 0,25 (existe un modo de investigación a 1280 píxeles, más lento). Segunda, un segmentador de llamas visibles: un SegFormer propio del proyecto (v13) que procesa la imagen completa con letterboxing de 512 píxeles, umbral de 0,55 y eliminación de componentes 8-conectados por debajo de 16 píxeles de entrada del modelo, escalado a la geometría de origen (limpieza v16 de "small-island"). Tercera, un especialista de rango: DINOv2-small congelado (de facebook/dinov2-small) combinado con una cabeza lineal entrenada (v15, Rank 1-3); el grafo guardado concatena la representación CLS/mean-patch de 768 dimensiones con la cabeza lineal. Los recortes aislados adecuados se alimentan al ranker con un 15% de contexto adicional; el ranker no usa la máscara de llamas.

No se han publicado detalles sobre el número de tokens de entrenamiento ni composición completa de datasets (al tratarse de modelos de visión, el entrenamiento se basa en imágenes; el segmentador se evaluó en subconjuntos de desarrollo como BoWFire VAL, ESFD VAL y wUUNet parcial, reutilizados repetidamente para selección, por lo que no constituyen tests independientes). No hay indicios de RLHF ni DPO, al no ser un modelo de lenguaje. La interpretación temporal se apoya en software asociado que confirma observaciones con 3/5 positivos recientes más al menos 1 segundo de soporte dentro de 4 segundos, con límite de hueco de 2 segundos; son valores por defecto de ingeniería, no validados.

## Capacidades

- Detección de fuego y humo en fotografías mediante cajas delimitadoras (YOLOv8n sobre D-Fire).
- Segmentación de píxeles de llama visible, con generación de máscaras y superposiciones visuales.
- Puntuación tentativa de rango de comportamiento del fuego (Rank 1-3) sobre recortes de detecciones, mediante DINOv2-small + cabeza lineal.
- Procesamiento de fotos individuales o secuencias con marca de tiempo (manifiesto JSONL con capture_seconds, frame_id, camera_id, view_id y camera_state).
- Cálculo de tendencia de píxeles de máscara predichos para historias de 60 segundos suficientemente cubiertas.
- Generación de salidas estructuradas: JSON (inference.json con errores e identidad de modelo), imágenes de máscara, overlays e informe HTML.
- Inferencia en CPU con ONNX (cuatro hilos), sin necesidad de GPU.
- No controla motores ni cámaras, no envía alertas externas y no calcula propagación física en metros/minuto.

## Casos de uso

- Monitorización asequible de zonas de riesgo con cámaras: el pipeline está diseñado para consumir fotos de una Raspberry Pi con plataforma rotatoria, permitiendo montar un puesto de observación de bajo coste que analice imágenes localmente.
- Investigación en detección temprana de incendios: al ser código abierto y ejecutarse en CPU, permite a investigadores experimentar con detección de fuego y humo sin infraestructura costosa.
- Análisis offline de secuencias de imágenes: el formato de manifiesto JSONL permite reprocesar capturas históricas con marcas de tiempo reales para estudiar la evolución visible de un evento.
- Generación de informes visuales para revisión humana: las máscaras, overlays e informes HTML facilitan la inspección manual de resultados por parte de personal de investigación.
- Benchmarking de modelos de segmentación de llamas: los subconjuntos de desarrollo (BoWFire, ESFD) y las métricas publicadas permiten comparar enfoques propios con este pipeline.
- Prototipado de sistemas de vigilancia con cámara fija o móvil: el campo camera_state (fixed, moving, settling, unknown) permite adaptar la interpretación a distintas configuraciones de captura.
- Enseñanza de pipelines de visión multi-etapa: la separación clara entre detección, segmentación y clasificación lo hace útil como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), al no tratarse de un modelo de lenguaje. Los únicos datos disponibles son métricas de desarrollo del segmentador sobre subconjuntos pequeños y reutilizados, que el autor advierte que no son tests independientes:

| Subconjunto de desarrollo del segmentador | Imágenes | Flame IoU | Recall | Máscaras falsas en foto vacía |
|---|---:|---:|---:|---:|
| Original BoWFire VAL | 34 | 83,50% | 91,68% | 3/16 |
| ESFD VAL | 15 | 26,11% | 65,08% | 6/12 |
| wUUNet partial VAL | 8 | no disponible (tabla truncada en la información facilitada) | no disponible | no disponible |

Los rangos validados públicamente permanecen como "unknown / unsure" según el autor; las puntuaciones tentativas de rango no están calibradas.

## Requisitos de hardware

- Inferencia en CPU: el repositorio incluye código de inferencia en CPU probado (grafos ONNX float32 con cuatro hilos); no se requiere GPU.
- Python 3.12 con entorno virtual y las versiones de requirements.txt (entorno CPU probado).
- RAM y CPU concretas: no disponible; el tamaño del repositorio es de unos 0,1 GB, por lo que los requisitos de almacenamiento son mínimos.
- No cabe la distinción de GPUs consumer: no es necesario; cualquier equipo moderno con CPU debería ejecutarlo, y el modo de detector a 1280 píxeles es opcional y más lento.
- Despliegue: descarga del repositorio completo con huggingface-hub (hf download TOMTOM17/wildfire-research-ai) y ejecución local de infer.py; no es un servicio web alojado. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI (no aplicable a este tipo de modelo).
- Latencia y throughput: no disponible; se indica únicamente que el tamaño de detector 1280 es un ajuste de investigación más lento que el de 640 por defecto.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| TOMTOM17/wildfire-research-ai | Detección fuego/humo + segmentación de llamas + rango | Pipeline YOLOv8n + SegFormer + DINOv2-small | ONNX | No comercial (research) | Imágenes RGB (640/512/224 px) |
| rabahdev/fire-smoke-yolov8n (componente) | Detección de fuego y humo | YOLOv8n | no disponible | no disponible | 640 px por defecto |
| facebook/dinov2-small (modelo base) | Extracción de características de visión | ViT-S (DINOv2) | safetensors | Apache 2.0 (modelo base) | 224 px |

Alternativas comparables de detección de humo e incendios en Hugging Face no se han facilitado en la información disponible: no disponible.

## Limitaciones y advertencias

- Prototipo de investigación no validado en campo: el autor lo indica expresamente y no debe usarse como sistema de alerta de emergencias.
- Una predicción negativa no establece que una zona esté segura o libre de fuego; un rango "unsure" no significa ausencia de incendio.
- Las puntuaciones de rango de comportamiento son tentativas, no calibradas y se muestran por separado; los rangos validados públicamente son desconocidos.
- Rendimiento del segmentador muy variable según el dominio: Flame IoU del 83,50% en BoWFire VAL frente al 26,11% en ESFD VAL, con máscaras falsas en fotos vacías (3/16 y 6/12), lo que sugiere degradación fuera del dominio de entrenamiento.
- Los subconjuntos de desarrollo se reutilizaron repetidamente para selección de modelos, por lo que las métricas no miden fiabilidad en cámara ni en campo.
- Los cambios en la máscara pueden reflejar parpadeo, humo, oclusión o error del modelo; la velocidad de propagación física, longitud de llama, intensidad, fuego de copa y spotting no quedan establecidos por este modelo.
- Se requieren registro y soporte de imagen completa para medidas dependientes de geometría; una sola foto no puede confirmar un evento continuo ni tendencias de área.
- Los componentes de máscara compartidos se cuentan una vez por grupo combinado; la pertenencia al grupo no es un recuento de fuegos físicos.
- Licencia no comercial (component-specific-research-licenses): el uso comercial está restringido; deben consultarse las licencias específicas de cada componente y el archivo NOTICE.md para acreditar a los autores originales.
- Los valores de confirmación temporal (3/5 positivos, 1 segundo de soporte en 4 segundos, hueco máximo de 2 segundos) son valores por defecto de ingeniería sin validación.
- Idioma de documentación: inglés; no hay documentación en castellano.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TOMTOM17/wildfire-research-ai
- Modelo base detector: https://huggingface.co/rabahdev/fire-smoke-yolov8n
- Modelo base segmentador (arquitectura): https://huggingface.co/nvidia/mit-b0
- Modelo base ranker: https://huggingface.co/facebook/dinov2-small
- Licencia y avisos: archivos LICENSE y NOTICE.md dentro del repositorio (enlaces relativos no disponibles en la información facilitada)
- Paper, blog o demo alojada: no disponible
