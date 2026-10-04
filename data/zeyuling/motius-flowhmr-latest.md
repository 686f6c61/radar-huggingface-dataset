# ZeyuLing/Motius-FlowHMR-Latest

## Resumen

FlowHMR es un modelo de captura de movimiento monocular (motion capture, MoCap) que reconstruye movimiento humano en el espacio SMPL-H a partir de vídeo RGB monoculo. Lo publica el autor ZeyuLing dentro del proyecto Motius/FlowHMR, y el artefacto de esta ficha corresponde al checkpoint "Latest", obtenido tras un post-entrenamiento PHC+ GRPO sobre el checkpoint "Base". El modelo resuelve el problema clásico de video-to-motion sin marcadores ni sensores: una sola cámara es suficiente para estimar secuencias de pose y forma corporal.

Técnicamente se trata de un modelo de 0,46B parámetros (460.399.159 según los pesos safetensors) entrenado con flow matching nativo sobre una representación de movimiento de 491 dimensiones, con SMPL-H de 52 articulaciones y 16 parámetros de forma. Procesa tokens de (T, 3072) a 30 fps y trabaja con recortes/relleno de 360 fotogramas. El repo ocupa 9,7 GB porque el bundle incluye, además de los safetensors de inferencia, los pesos de varios componentes front-end (YOLOX, VGGT-Omega, SAM-3D-Body y MHR) junto con estadísticas de movimiento y procedencia de origen.

Su relevancia es la de una pipeline de captura de movimiento end-to-end reproducible: tracking de persona, estimación de cámara, extracción de características y decodificación de malla corporal en una sola API (`infer_monocular_motion_capture`). No es un modelo de lenguaje: no genera texto ni código, y sus "capacidades" se refieren exclusivamente a reconstrucción de movimiento, cámara y contacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de flow matching nativo; no se detalla la topologia interna de red en la informacion disponible |
| Parametros totales | 460.399.159 (0,46B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana temporal de 360 fotogramas (crop/padding) a 30 fps |
| Tipos de cuantizacion | No disponible (se entrenó e infiere en FP32) |
| Idiomas soportados | No aplica / no disponible |
| Licencia | flowhmr-research-nonprofit (licencia de investigacion sin animo de lucro) |
| Formato de pesos | safetensors |

Datos adicionales: representación de movimiento SMPL-H de 491 dimensiones, 52 articulaciones, 16 parámetros de forma; tokens de entrada (T, 3072); SHA256 del checkpoint Latest `b7eb06b119feaf5ad7287bafdb2fff38d42dfc22ea9d256f8cdd2ada26dfc53a`.

## Arquitectura y entrenamiento

El modelo se entrena con flow matching de objetivo x1 y muestreo temporal logit-normal (media −0,8, desviación 0,8). La función de pérdida combina términos SmoothL1 para velocidad XZ de la raíz, posición Y de la raíz, posiciones articulares locales, rotaciones, forma y contacto, junto con pérdidas de rotación FK y consistencia, con pesos 10/10/10/10/1/4/5/5 y máscaras que excluyen el relleno. El entrenamiento usa AdamW, recorte de gradiente (10) y LR coseno de 1e-4 a 1e-5, en FP32 (`mixed_precision='no'`). La receta pública son 250.000 iteraciones, equivalentes a las 25 épocas oficiales de 10.000 iteraciones; con 8 procesos se alcanza el batch global oficial de 64.

En datos, el corpus de entrenamiento oficial no es público: se esperan shards WebDataset en formato oficial agrupando `motion.npz`, `camera.npz`, `bbox.npz`, `feature.pt` y metadatos. El adaptador `FlowHMRDataset` aplica conversión de cámara/mundo, FK de SMPL-H, codificación de 491 dimensiones, recorte/relleno a 360 fotogramas y un 10% de dropout de características, conservando todas las articulaciones de la mano. Reemplazar los datos constituye un nuevo entrenamiento, no una reproducción exacta del dataset original. La pipeline de inferencia integra front-ends preentrenados: YOLOX para detección de persona, VGGT-Omega para cámaras, SAM-3D-Body para extracción de características y MHR. Esta release implementa el entrenamiento base; el entrenamiento PHC+ GRPO queda fuera de su alcance.

## Capacidades

- Captura de movimiento monocular: reconstruye parámetros SMPL-H de cuerpo completo desde vídeo RGB de una sola cámara.
- Codificación de 491 dimensiones: cubre pose, forma, rotaciones, contacto y raíz en una representación unificada.
- Conserva todas las articulaciones de la mano (no se descartan las manos en la codificación).
- Entrada alternativa por características precalculadas: `infer_from_feature(tokens, camera_RT)` acepta tokens (T, 3072) y transformadas OpenCV mundo-a-cámara a 30 fps.
- Transcodificación y tracking de vídeo: `infer_v2m` transcodifica el vídeo, sigue a la persona con YOLOX, predice cámaras con VGGT-Omega y extrae características SAM.
- Post-proceso opcional: `postprocess=True` activa la limpieza upstream de contacto e IK para una semilla.
- Determinismo por semilla: la inferencia se ejecuta con `seeds=[0]`, 20 pasos Euler y CFG 1 en los ejemplos oficiales.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Producción de animación sin traje de captura: a partir de vídeo monoculo de un actor se obtienen secuencias SMPL-H listas para retargeting en motores de animación, reduciendo el coste frente a sistemas de marcadores.
- Análisis biomecánico y deportivo: el modelo estima pose, forma y contacto del pie, lo que permite estudiar zancada y apoyos a 30 fps desde una cámara estándar.
- Reconstrucción de movimiento para VFX: la pipeline integra estimación de cámara (VGGT-Omega) y extracción de características (SAM-3D-Body), útil para alinear personajes digitales con el plano original.
- Teleoperación y avatares en tiempo de generación: los tokens (T, 3072) y las transformadas de cámara permiten decodificar movimiento precomputado, facilitando pipelines que separan captura y decodificación.
- Investigación en video-to-motion: la receta de entrenamiento (flow matching, pérdidas y pesos concretos) sirve como base reproducible para experimentos académicos, dado que el corpus oficial solo se describe en formato, no en contenido.
- Generación de datasets de movimiento: el modelo puede anotar automáticamente grandes volúmenes de vídeo con parámetros SMPL-H para entrenar a su vez otros sistemas.
- Evaluación comparativa de MoCap monocular: el artefacto se enlaza con un leaderboard público (`monocular-motion-capture-leaderboard`) para medir variantes bajo la misma representación de 491 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a un leaderboard público de captura de movimiento monocular, pero no incluye cifras numéricas (MPJPE, PA-MPJPE u otras métricas) en el material proporcionado, por lo que no se reproducen valores.

## Requisitos de hardware

- VRAM estimada (estimación a partir del tamaño): los pesos safetensors suman aproximadamente 1,8 GB en FP32 para los 0,46B parámetros; el bundle completo ocupa 9,7 GB en disco al incluir front-ends (YOLOX, VGGT-Omega, SAM-3D-Body, MHR), de modo que el consumo real de inferencia es superior a la sola red de movimiento.
- GPU recomendadas: se documenta ejecución en CUDA (`device="cuda"`); no se especifican modelos de GPU concretos. Por tamaño, cabría esperar funcionamiento en GPUs de gama media-alta, pero esto es una estimación y no un dato del autor.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la informacion disponible.
- Dependencias externas obligatorias: requiere el modelo SMPL-H neutral oficial de AMASS (52 articulaciones, 16 parámetros de forma) y el regresor de articulaciones SMPL, que se suministran por separado por motivos de licencia.
- Opciones de despliegue: pipeline `motius` (`Pipeline.from_pretrained`), CLI `tools/infer_flowhmr.py` y exportación local `tools/export_flowhmr_hf.py`. No aplican vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Entrenamiento: `accelerate launch --num_processes 8 tools/train.py configs/flowhmr/train_flowhmr.py`, con reanudación mediante `--auto-resume --load-scope full`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Representacion | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Motius-FlowHMR-Latest | 0,46B | SMPL-H, 491-D | 360 fotogramas (30 fps) | flowhmr-research-nonprofit | HuggingFace (este repo) |
| Motius-FlowHMR-Base | 0,46B (misma base) | SMPL-H, 491-D | 360 fotogramas (30 fps) | flowhmr-research-nonprofit | HuggingFace (repo hermano) |

No se dispone en la informacion proporcionada de modelos de terceros comparables con datos verificables (parametros, contexto y licencia) para completar la tabla. Cualquier comparacion con otros sistemas de MoCap monocular requeriria datos externos no incluidos aqui.

## Limitaciones y advertencias

- Licencia restrictiva: `flowhmr-research-nonprofit` es una licencia de investigacion sin animo de lucro; el uso comercial no esta permitido sin autorización adicional.
- Dependencia de activos con licencia propia: SMPL-H y el regresor de articulaciones se distribuyen por separado y estan sujetos a sus propias condiciones de uso.
- Reproducibilidad del entrenamiento: el corpus oficial no es publico; usar datos propios constituye un entrenamiento nuevo, no una reproduccion exacta.
- Restricciones de la receta: la release cubre solo el entrenamiento base; el post-entrenamiento PHC+ GRPO queda fuera de su alcance.
- Reanudación no exacta: retomar el entrenamiento restaura el estado del modelo/optimizador, no el cursor exacto del flujo WebDataset (los datos se remuestrean y particionan por worker/rango).
- Sensibilidad al número de procesos: el batch global oficial de 64 exige 8 procesos; otro recuento altera la receta.
- Ambito de entrada limitado: solo vídeo monoculo RGB o tokens precalculados (T, 3072) con transformadas OpenCV a 30 fps; no acepta otras modalidades.
- No es un modelo de lenguaje: no dispone de generacion de texto, tool calling, agentes ni soporte multilingue.
- Riesgo de artefactos de estimacion: como todo sistema de MoCap monocular, la oclusion, el movimiento rapido y la oclusion de manos pueden degradar posiciones articulares; no se han publicado tasas de error concretas en el material disponible.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, lo que indica adopción todavia muy limitada y ausencia de validacion por terceros.
- Sesgos: no se documentan sesgos de dataset en la informacion proporcionada, pero al no ser publico el corpus de entrenamiento no puede evaluarse su cobertura demografica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZeyuLing/Motius-FlowHMR-Latest
- Checkpoint Base: https://huggingface.co/ZeyuLing/Motius-FlowHMR-Base
- Proyecto y actualizaciones del paper: https://flowhmr.github.io/
- Repositorio original en GitHub: https://github.com/flowhmr/flowhmr
- Guia de datos upstream: https://github.com/flowhmr/flowhmr/blob/main/docs/resources.md
- Leaderboard de captura de movimiento monocular: https://huggingface.co/spaces/ZeyuLing/monocular-motion-capture-leaderboard
