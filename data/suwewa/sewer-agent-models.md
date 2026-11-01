# suwewa/sewer-agent-models

## Resumen

Sewer Agent online model bundle es un paquete de pesos publicado por el usuario suwewa en HuggingFace que agrupa siete modelos fijados a revisiones concretas para un pipeline de inspección de alcantarillado. No se trata de un modelo unico entrenado de cero, sino de un "bundle" que combina un detector YOLO26s ajustado sobre el dataset Sewer2403 (cinco clases), tres modelos de restauracion de imagen (DehazeFormer-MCT para desneblinado, Restormer para deblurring de movimiento y Real-ESRGAN x4v3 para superresolucion), DarkIR-m para mejora en condiciones de baja luminosidad, SAM 2.1 Hiera Large para segmentacion y Depth Anything V2 Small para profundidad relativa.

El paquete esta pensado para su uso dentro de la aplicacion Sewer Agent: se monta como directorio de solo lectura en `/models` y la aplicacion carga los pesos locales sin descargar nada durante la inferencia. El repositorio ocupa 1,1 GB y no incluye dataset de entrenamiento, medios de usuario, base de datos ni credenciales de API. La licencia global figura como `other`, y cada componente arrastra sus propios terminos de pesos, que en varios casos no estan establecidos de forma separada del codigo de la arquitectura.

Su relevancia es acotada pero concreta: ofrece un conjunto reproducible y versionado de modelos para un dominio vertical (inspeccion de saneamiento) con trazabilidad de origen y atribucion, algo poco habitual en despliegues de vision por computador en produccion industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bundle heterogeneo: detector YOLO26s, transformers de restauracion (DehazeFormer-MCT, Restormer, Real-ESRGAN, DarkIR-m), SAM 2.1 Hiera Large y Depth Anything V2 Small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelos de vision, sin modulo de lenguaje) |
| Licencia | other (agregada); por componente: AGPL-3.0 en metadatos del checkpoint YOLO26s, CC-BY-4.0 para DarkIR-m, Apache-2.0 para SAM 2.1 y Depth Anything V2, desconocida para DehazeFormer-MCT, Restormer y Real-ESRGAN |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El bundle no define una arquitectura unica. El unico componente entrenado especificamente para el dominio es el detector YOLO26s Sewer2403 de cinco clases, ajustado a partir de Ultralytics YOLO26s 8.4.46 sobre el dataset Sewer2403; los terminos del dataset de entrenamiento no estan registrados en la model card. El resto son modelos de proposito general reutilizados: DehazeFormer-MCT para desneblinado, Restormer para deblurring de movimiento, Real-ESRGAN general x4v3 para superresolucion, DarkIR-m para restauracion en baja luminosidad, SAM 2.1 Hiera Large para segmentacion promptable y Depth Anything V2 Small para estimacion de profundidad relativa.

No se documentan en la informacion disponible detalles sobre volumen de tokens, composicion del dataset, ni procesos de RLHF o DPO (no aplicables a este tipo de modelos de vision). La innovacion operativa del paquete es la fijacion de revisiones: `models.json` define rutas y revisiones exactas, y los tamanos en bytes permiten detectar ficheros incompletos, aunque no constituyen una verificacion criptografica de integridad ni una garantia de calidad del modelo.

## Capacidades

- Deteccion de objetos en imagenes de alcantarillado con cinco clases definidas por el dataset Sewer2403 (YOLO26s).
- Desneblinado de imagenes (DehazeFormer-MCT).
- Deblurring de movimiento (Restormer).
- Superresolucion x4 de proposito general (Real-ESRGAN x4v3).
- Restauracion y mejora en condiciones de baja luminosidad (DarkIR-m).
- Segmentacion promptable de imagenes (SAM 2.1 Hiera Large).
- Estimacion de profundidad relativa monocular (Depth Anything V2 Small).
- Carga local de pesos sin descarga durante la inferencia.
- No incluye capacidades de generacion de texto, tool calling, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Inspeccion automatizada de alcantarillado: el detector YOLO26s identifica defectos y elementos de interes en imagenes de campo, y los modelos de restauracion previos mejoran la imagen antes de la deteccion.
- Preprocesado de imagenes en condiciones adversas: DehazeFormer-MCT y Restormer se aplican como etapa previa para reducir niebla y desenfoque de movimiento en capturas de camaras de inspeccion.
- Mejora de imagen en baja luminosidad: DarkIR-m permite recuperar detalle en grabaciones de tuberias con iluminacion deficiente antes de pasarlas al detector o al segmentador.
- Superresolucion de capturas para analisis fino: Real-ESRGAN x4v3 amplia la resolucion de recortes para inspeccion visual o documentacion de defectos.
- Segmentacion de regiones de interes: SAM 2.1 Hiera Large permite aislar objetos o zonas concretas mediante prompts, util para anotacion asistida o medicion de areas.
- Estimacion de profundidad en conductos: Depth Anything V2 Small aporta mapas de profundidad relativa que pueden apoyar la evaluacion de obstrucciones o la reconstruccion aproximada de la escena.
- Despliegue en entornos aislados: al montar el bundle como solo lectura en `/models`, el sistema funciona sin conectividad ni descargas en tiempo de inferencia, adecuado para plantas o vehiculos con red restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del componente cargado simultaneamente y de su resolucion de entrada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la aplicacion Sewer Agent carga los pesos locales desde `/models`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de vision en este contexto).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suwewa/sewer-agent-models | bundle de vision para inspeccion de alcantarillado | no disponible | no aplica | other (mixta por componente) | HuggingFace, 0 descargas |
| Ultralytics YOLO26s | detector de objetos | no disponible | no aplica | AGPL-3.0 (codigo y metadatos del checkpoint base) | publico |
| facebook/sam2.1-hiera-large | segmentacion promptable | no disponible | no aplica | Apache-2.0 | HuggingFace |
| depth-anything/Depth-Anything-V2-Small-hf | profundidad relativa | no disponible | no aplica | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia agregada `other` con terminos heterogeneos: AGPL-3.0 en el checkpoint YOLO26s, CC-BY-4.0 en DarkIR-m, Apache-2.0 en SAM 2.1 y Depth Anything V2, y licencia de pesos desconocida en DehazeFormer-MCT, Restormer y Real-ESRGAN.
- La model card advierte explicitamente que la licencia del codigo de la arquitectura no debe tratarse como licencia de los pesos; es necesario consultar los terminos de la fuente original antes de redistribuir.
- Los terminos del dataset de entrenamiento Sewer2403 no estan registrados.
- El paquete no incluye dataset, medios de usuario, base de datos ni credenciales, por lo que no es utilizable por si solo sin el codigo de la aplicacion Sewer Agent y su `models.json`.
- La verificacion de integridad se limita a tamanos en bytes; no hay comprobacion criptografica ni evaluacion de calidad incluida.
- No hay informacion sobre sesgos, tasas de alucinacion (no aplica a modelos discriminativos de vision, pero si a falsos positivos y negativos del detector) ni evaluacion de robustez en dominios distintos al de entrenamiento.
- Sin datos publicados de benchmarks, latencia o requisitos de hardware; el uso en produccion requiere validacion propia.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de adopcion o validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/suwewa/sewer-agent-models
- Codigo fuente del proyecto (YOLO26s Sewer2403): https://github.com/huicod/sewer-agent/tree/dev/agent-v1/yolov26/experiments/sewer2403_5class_yolo26s_img960_e100
- DehazeFormer (demo): https://huggingface.co/spaces/IDKiro/DehazeFormer_Demo/tree/8e0b26c7732e2b0dc104f69c5ea30f913c878a89
- Restormer (release v1.0): https://github.com/swz30/Restormer/releases/tag/v1.0
- Real-ESRGAN (release v0.2.5.0): https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
- DarkIR (HuggingFace): https://huggingface.co/Cidaut/DarkIR/tree/8a73ebf271c513dfda9d1df444762d8aa0b42138
- SAM 2.1 Hiera Large (HuggingFace): https://huggingface.co/facebook/sam2.1-hiera-large/tree/665f8e2ad61cf5f53d65644ff27c8ee525124610
- Depth Anything V2 Small (HuggingFace): https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf/tree/5426e4f0f36572d16453bbda7a8389317b1bef99
