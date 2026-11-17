# yyongjae/ssr-cam-teachers

## Resumen

SSR camera-only perception teachers es un paquete de pesos y configuraciones publicado por el usuario yyongjae en Hugging Face, orientado a la investigacion en conduccion autonoma. No se trata de un modelo de lenguaje, sino de un conjunto de profesores de percepcion (teachers) basados en BEVFormer y Mask2Map, empleados para construir caches de caracteristicas y entrenar estudiantes mediante destilacion de conocimiento en el marco del benchmark NAVSIM. El repositorio incluye los checkpoints de los profesores, sus configuraciones de mmdet3d, los manifiestos de las caches generadas y dos refinadores entrenados sobre dichas caches.

El paquete esta vinculado a dos ejecuciones concretas del autor: `bevformer-mask2map_703341` (ablacion de profesores, con EPDMS de 92,00 en navtest en la epoca 30 y 46,29 en navhard) y `bevformer-mask2map_gridkd_x_b34e37`. Las caches completas (494 GB para BEVFormer y 585 GB para Mask2Map) no se suben; solo se documenta su procedencia mediante manifiestos.

Por su naturaleza, es un artefacto de investigacion reproducible mas que un modelo listo para produccion: no hay pipeline declarado, no se especifican idiomas y la licencia figura como "other", lo que obliga a revisar los terminos antes de cualquier uso. Su relevancia es acotada al ambito de la destilacion de percepcion camara-only en conduccion autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVFormer (base) para deteccion 3D y Mask2Map (LSS BEV + segmentacion, backbone ResNet-50, alcance frontal de 64 m) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen en `.pth` y `.pt` |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | other |
| Formato de pesos | PyTorch (`.pth` para profesores, `.pt` para refinadores), con configuraciones `.py` de mmdet3d |
| Tamano del repositorio | 1,3 GB |
| Embedding BEV | 256 x 100 x 100 en fp16 |
| Segmentacion Mask2Map | 4 x 200 x 200 en fp16, resolucion BEV de 0,64 m y de segmentacion de 0,32 m |
| Clases de mapa | road / walkway / centerline / crosswalk |
| Dataset | NAVSIM (navtrain: 103.288 muestras) |

## Arquitectura y entrenamiento

El repositorio contiene dos profesores independientes. El primero es un BEVFormer base entrenado sobre NAVSIM como profesor de deteccion 3D, con checkpoint en la epoca 5 (`teachers/bevformer/epoch_5.pth`) y configuracion `bevformer_navsim_base.py`. El segundo es Mask2Map en su fase 1 semantica, combinando LSS BEV con segmentacion sobre un backbone ResNet-50 y un alcance frontal de 64 m; se trata de un fine-tune con BatchNorm congelada (frozen-BN) de 18 epocas, con checkpoint en la epoca 1 (`teachers/mask2map_bnft/epoch_1.pth`) y configuracion `M2M_navsim_front64_r50_sem_18ep_bnft.py`.

Sobre las caches generadas se entrenaron dos refinadores de profesor, uno por cada cache (arm T sobre BEVFormer y arm M sobre Mask2Map), durante 10 epocas sobre `navtrain_train`, con checkpoints `ckpt_last.pt`, configuracion, normalizacion y logs. La cache de BEVFormer se genero con el commit de codigo `9f1d5df` el 2026-11-10 a las 09:36 UTC con 4 ranks y una transformacion de marco al BEV del estudiante documentada en `manifest.json`; la de Mask2Map queda descrita en `meta.json`. Los refinadores corresponden al head git `23ef1f0` de SSR `v2_final`. El repositorio incluye `SHA256SUMS` con el hash completo de cada checkpoint y un registro de profesores (`teachers_used_by_bevformer-mask2map_703341.json`) que la ejecucion del estudiante verifico al arrancar.

## Capacidades

- Deteccion 3D camera-only: el profesor BEVFormer genera representaciones BEV y cajas 3D (top-200 boxes en la cache).
- Segmentacion semantica de mapas BEV: Mask2Map produce mascaras de road, walkway, centerline y crosswalk a resolucion de 0,32 m.
- Generacion de caches de caracteristicas para destilacion: embeddings BEV de 256 x 100 x 100 en fp16 listos para entrenar estudiantes.
- Refinamiento de profesores: dos refinadores entrenados 10 epocas sobre las caches para mejorar la senal de destilacion.
- Reproducibilidad: manifiestos, configuraciones, logs y sumas SHA256 permiten reconstruir el pipeline.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Destilacion de conocimiento para percepcion camara-only: usar los checkpoints de BEVFormer y Mask2Map como profesores para generar caches y entrenar un estudiante con menos coste computacional, tal como documentan los manifiestos incluidos.
- Reproduccion de experimentos NAVSIM: las configuraciones y los hashes permiten replicar las ejecuciones `bevformer-mask2map_703341` y `bevformer-mask2map_gridkd_x_b34e37` con trazabilidad completa.
- Investigacion en deteccion 3D BEV: el checkpoint de BEVFormer en la epoca 5 sirve como punto de partida o linea base para experimentos de deteccion sobre NAVSIM.
- Segmentacion de mapas para planificacion: las mascaras de Mask2Map (road, walkway, centerline, crosswalk) pueden alimentar modulos de planificacion o evaluacion de rutas en entornos simulados.
- Ablacion de profesores: el registro `teachers_used_by_bevformer-mask2map_703341.json` y los refinadores permiten comparar el impacto de cada profesor en el estudiante.
- Estudio de refinadores sobre caches: los refinadores de 10 epocas permiten analizar como mejora la senal destilada al refinar el profesor sobre la cache en lugar de usar el checkpoint original.
- Verificacion de integridad en pipelines de investigacion: `SHA256SUMS` facilita validar que los checkpoints cargados coinciden con los usados en los experimentos publicados.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la ejecucion `bevformer-mask2map_703341` (ablacion de profesores):

| Metrica | Valor |
|---|---|
| EPDMS en navtest (epoca 30) | 92,00 |
| EPDMS en navhard | 46,29 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del tamano de los checkpoints y de la resolucion BEV (256 x 100 x 100 en fp16 para BEVFormer y 4 x 200 x 200 en fp16 para la segmentacion de Mask2Map).
- GPU recomendadas: no disponibles; el entrenamiento se realizo con 4 ranks segun la procedencia de la cache de BEVFormer, lo que sugiere configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio pesa 1,3 GB, pero el coste de inferencia depende de la arquitectura completa, no solo de los pesos.
- Opciones de despliegue: el ecosistema implicito es mmdet3d (configuraciones `.py`), no vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros profesores de percepcion ni con modelos alternativos de deteccion 3D o segmentacion BEV.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- Licencia "other": es imprescindible revisar los terminos del autor antes de cualquier uso, incluido el comercial, que no queda garantizado.
- Las caches completas (494 GB de BEVFormer y 585 GB de Mask2Map) no estan incluidas; solo se distribuyen los manifiestos, por lo que regenerarlas exige el codigo y los recursos adecuados.
- El alcance de Mask2Map esta limitado a 64 m frontales y a cuatro clases de mapa, lo que restringe su aplicacion fuera de ese dominio.
- Los checkpoints corresponden a epocas tempranas (epoca 5 en BEVFormer y epoca 1 en Mask2Map), por lo que no representan necesariamente el mejor estado de cada profesor.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de robustez fuera de NAVSIM.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- Los resultados de EPDMS (92,00 en navtest y 46,29 en navhard) corresponden a una unica ejecucion y no deben generalizarse sin replicacion.

## Enlaces

- Hugging Face: https://huggingface.co/yyongjae/ssr-cam-teachers
