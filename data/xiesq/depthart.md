# Xiesq/DepthART

## Resumen

DepthART (Depth Anything Rethought for Tiny Models) es un modelo compacto de estimación monocular de profundidad (MDE, *monocular depth estimation*) desarrollado por el equipo del proyecto DepthART y publicado por el usuario Xiesq en HuggingFace. Su objetivo es trasladar la capacidad de generalización de los grandes modelos fundacionales de profundidad geométrica (Metric3D, Depth Anything, UniDepth) a arquitecturas ligeras orientadas a despliegue en dispositivo, un terreno donde esas ganancias no se habían traducido hasta ahora.

El modelo se distribuye en variantes Small, Base y Large y soporta dos modos de salida: profundidad relativa invariante a transformaciones afines y profundidad métrica condicionada por cámara. La propuesta combina un pipeline de datos resistente al sesgo de dominio con un ajuste fino condicionado por cámara y con el encoder congelado, lo que busca estabilizar la calibración métrica bajo cambios de cámara y evitar el sobreajuste a un dataset concreto.

El repositorio ocupa 2,1 GB y publica los pesos en formato ONNX bajo licencia Apache 2.0, con rutas de inferencia optimizadas para GPU NVIDIA de escritorio y para Jetson Orin NX. La relevancia actual reside en que permite ejecutar estimación de profundidad con generalización cercana a la de modelos fundacionales mucho mayores en hardware de borde, un escenario clave para robótica, drones y dispositivos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo compacto de estimacion monocular de profundidad (encoder-decoder); backbone concreto no especificado en la informacion disponible |
| Parametros totales | No disponible (se distribuyen variantes Small, Base y Large sin recuento de parametros publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible; pesos distribuidos en formato ONNX |
| Idiomas soportados | No aplica (modelo de vision, sin entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 2,1 GB |
| Variantes | Small, Base, Large |
| Modos de salida | Profundidad relativa invariante a afines y profundidad metrica condicionada por camara |
| Fecha de publicacion en HuggingFace | 2026-10-08 |

## Arquitectura y entrenamiento

DepthART es un modelo de estimacion de profundidad monocular disenado especificamente para modelos pequenos, partiendo de la premisa de que las mejoras de los modelos fundacionales geometricos (Metric3D, Depth Anything, UniDepth) no se habian trasladado a arquitecturas compactas. La informacion disponible describe un backbone de despliegue ligero con capacidades de generalizacion entre escenas, pero no detalla la arquitectura interna exacta (tipo de encoder, decodificador ni numero de capas) ni el recuento de parametros de cada variante.

En el plano del entrenamiento, el modelo combina un pipeline de datos disenado para resistir el sesgo de dominio con un ajuste fino condicionado por camara en el que el encoder permanece congelado. Este esquema busca dos objetivos: evitar el sobreajuste a datasets especificos y estabilizar la adaptacion metrica cuando cambian los parametros intrinsecos de la camara. El modelo soporta tanto prediccion relativa invariante a afines como prediccion metrica con conciencia de camara. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta de los datasets ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma estandar en vision).

## Capacidades

- Estimacion monocular de profundidad densa a partir de una unica imagen RGB.
- Prediccion de profundidad relativa invariante a transformaciones afines (util para ordenacion y estructura sin necesidad de escala absoluta).
- Prediccion de profundidad metrica condicionada por camara (escala absoluta calibrada a partir de los parametros intrinsecos).
- Generalizacion entre escenas, orientada a funcionar fuera del dominio de entrenamiento.
- Despliegue en dispositivo: rutas de inferencia optimizadas para GPU NVIDIA de escritorio y para Jetson Orin NX.
- Distribucion en tres tamanos (Small, Base, Large) para ajustar el compromiso entre precision y coste computacional.
- Exportacion a ONNX para integracion en runtimes de inferencia multiplataforma.
- No se documentan capacidades de texto, tool calling, agentes ni multimodalidad generativa.

## Casos de uso

- Robotica movil y navegacion autonoma: el modelo estima el mapa de profundidad por fotograma para evitar obstaculos y planificar trayectorias; su enfoque en despliegue en dispositivo permite ejecutarlo a bordo de un Jetson Orin NX sin depender de conectividad.
- Drones y UAV: reconstruccion de la escena bajo la aeronave para altimetria relativa y deteccion de obstaculos, con la variante Small o Base ajustada al presupuesto energetico embarcado.
- Realidad aumentada y mixta en movil: colocacion coherente de objetos virtuales sobre superficies reales mediante profundidad relativa, usando ONNX en el runtime del dispositivo.
- Escaneo 3D y fotogrametria asistida: generacion de nubes de puntos a partir de capturas, empleando la salida metrica cuando se dispone de los intrinsecos de la camara para obtener escala real.
- Automocion y ADAS de bajo coste: estimacion de distancia a vehiculos y peatones en sistemas con hardware limitado, apoyandose en el modo metrico condicionado por camara.
- Inspeccion industrial y mantenimiento: medicion de profundidad y deteccion de defectos superficiales sobre lineas de produccion con camaras fijas calibradas, aprovechando la calibracion metrica estable.
- Segmentacion y postproceso en pipelines de vision: uso del mapa de profundidad como senal auxiliar para separar primer plano y fondo, desenfocar o recortar objetos.
- Aplicaciones de accesibilidad: generacion de descripciones espaciales o alertas de obstaculos a partir de una camara unica en dispositivos economicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes consultadas (paper arXiv 2607.17099, repositorio GitHub y pagina del proyecto) describen los objetivos y el diseno del modelo, pero no incluyen cifras de evaluacion en esta informacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 2,1 GB e incluye las variantes Small, Base y Large, por lo que el consumo por variante sera inferior a esa cifra.
- GPU recomendadas: NVIDIA de escritorio (rutas de inferencia optimizadas segun la documentacion del proyecto) y NVIDIA Jetson Orin NX para despliegue en el borde.
- Compatibilidad con GPU de consumo: el diseno esta orientado a modelos "tiny" y despliegue en dispositivo, por lo que es previsible que quepa en GPU de consumo, pero no se confirma una lista concreta de modelos en la informacion disponible.
- Opciones de despliegue: ONNX Runtime y runtimes compatibles con ONNX; la documentacion menciona rutas optimizadas para GPU NVIDIA de escritorio y Jetson Orin NX. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DepthART | MDE compacto (Small/Base/Large) | Generalizacion de modelos fundacionales en modelos tiny | Despliegue en dispositivo (Jetson, GPU de escritorio) | Apache 2.0 | Pesos ONNX en HuggingFace y GitHub |
| Depth Anything | MDE fundacional | Generalizacion amplia en modelos grandes | Servidor / GPU de alta gama | No disponible en la informacion | Referenciado en el paper de DepthART |
| Metric3D | MDE fundacional metrico | Prediccion metrica con calibracion | Servidor / GPU de alta gama | No disponible en la informacion | Referenciado en el paper de DepthART |
| UniDepth | MDE fundacional metrico | Profundidad metrica con conciencia de camara | Servidor / GPU de alta gama | No disponible en la informacion | Referenciado en el paper de DepthART |

Los datos de parametros, contexto y rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un modelo "tiny", cabe esperar una precision inferior a la de los modelos fundacionales de profundidad en escenas complejas; no se han publicado cifras que cuantifiquen esa brecha.
- La calibracion metrica depende de que los parametros intrinsecos de la camara se proporcionen correctamente; bajo cambios de camara no calibrados el modo metrico puede degradarse.
- Riesgo de sobreajuste a dominios de dataset si se aplica a escenas muy distintas de las de entrenamiento, aunque el diseno del pipeline de datos busca mitigarlo.
- No se documentan sesgos especificos ni evaluaciones de robustez por tipo de escena (interiores, nocturnas, texturas repetitivas).
- Al ser un modelo de vision, no procesa texto ni admite prompts; no es adecuado para tareas de lenguaje, codigo o agentes.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento, no detalladas en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, y no se ha publicado un benchmark independiente en la informacion disponible; conviene validar el modelo en el caso de uso concreto antes de llevarlo a produccion.
- El tamano del repositorio (2,1 GB) engloba varias variantes; debe seleccionarse la adecuada al presupuesto de hardware.

## Enlaces

- HuggingFace: https://huggingface.co/Xiesq/DepthART
- Paper (arXiv): https://arxiv.org/abs/2607.17099
- Paper (HTML): https://arxiv.org/html/2607.17099v1
- Repositorio GitHub: https://github.com/xuefeng-cvr/DepthART
- README en GitHub: https://github.com/xuefeng-cvr/DepthART/blob/main/README.md
- Pagina del proyecto: https://xuefeng-cvr.github.io/DepthART/
