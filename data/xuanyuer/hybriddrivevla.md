# XuanYuer/HybridDriveVLA

## Resumen

HybridDriveVLA es un conjunto de pesos publicado por el usuario XuanYuer como material complementario del articulo "From Representational Complementarity to Dual Systems: Synergizing VLM and Vision-Only Backbones for End-to-End Driving", aceptado en NeurIPS 2026. No se trata de un modelo de lenguaje generativo al uso, sino de checkpoints de politicas de conduccion autonoma entrenadas sobre el benchmark NAVSIM, que combinan un backbone vision-language (VLM) con backbones exclusivamente visuales en un esquema de doble sistema.

El repositorio incluye politicas vision-only entrenadas mediante imitation learning (IL) y reinforcement learning (RL) sobre cinco arquitecturas de vision distintas: ResNet-50, ResNet-101, EVA-CLIP Base/16, ViT-B/16 y ViT-L/16. Ademas, incorpora pesos archivados para analisis con autoencoders dispersos (SAE), que requieren exportaciones de caracteristicas o caches alineadas para su uso.

La relevancia del lanzamiento radica en que materializa la tesis del paper: la complementariedad representacional entre un VLM y backbones puramente visuales puede explotarse para construir un sistema de conduccion end-to-end mas robusto. El tamano del repositorio es de 1,1 GB y no se declaran licencia ni idiomas soportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de conduccion end-to-end con backbones vision-only (ResNet-50, ResNet-101, EVA-CLIP Base/16, ViT-B/16, ViT-L/16) en esquema dual con VLM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1,1 GB; el manifest de politicas en checkpoints/manifest.csv permite identificar y verificar descargas) |

## Arquitectura y entrenamiento

El trabajo propone un sistema dual que sinergiza un planificador basado en VLM con backbones exclusivamente visuales. Los checkpoints liberados corresponden a las politicas vision-only, entrenadas en dos regimenes: imitation learning (IL) y reinforcement learning (RL). Las arquitecturas cubiertas abarcan desde CNN clasicas (ResNet-50 y ResNet-101) hasta transformers de vision (ViT-B/16, ViT-L/16) y el backbone multimodal EVA-CLIP Base/16, lo que permite al autor comparar la contribucion de cada familia de representaciones dentro del sistema dual.

El entrenamiento y la evaluacion se realizan sobre NAVSIM, un benchmark de conduccion cerrada basado en datos de sensor real. La model card no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco se especifican innovaciones de decodificacion. Ademas de las politicas, el release incluye pesos archivados para analisis con SAE, orientados a interpretar las representaciones internas y que requieren exportaciones de caracteristicas o caches alineadas. Para el planificador VLM original y sus pesos, la model card remite al proyecto ReCogDrive de Xiaomi Research.

## Capacidades

- Conduccion end-to-end en el benchmark NAVSIM: las politicas generan trayectorias de conduccion a partir de observaciones visuales.
- Doble regimen de entrenamiento: checkpoints de imitation learning (IL) y de reinforcement learning (RL) para cada backbone.
- Cobertura multi-arquitectura: ResNet-50, ResNet-101, EVA-CLIP Base/16, ViT-B/16 y ViT-L/16, lo que facilita estudios de ablacion sobre el backbone visual.
- Analisis interpretativo: pesos SAE archivados para estudiar caracteristicas internas de las representaciones.
- Integracion con un planificador VLM: el sistema completo combina las politicas vision-only con el VLM descrito en el paper.
- No se declaran capacidades de generacion de texto, codigo, matematicas, tool calling, agentes, vision general, audio ni modo thinking; el alcance es exclusivamente conduccion autonoma.

## Casos de uso

- Investigacion en conduccion end-to-end: reproducir los experimentos del paper sobre NAVSIM usando los checkpoints IL y RL junto con el codigo del repositorio y los datos del benchmark.
- Estudios de ablacion de backbones: comparar ResNet-50, ResNet-101, EVA-CLIP Base/16, ViT-B/16 y ViT-L/16 bajo el mismo protocolo de evaluacion para aislar el efecto de la arquitectura visual en el rendimiento de conduccion.
- Analisis de interpretabilidad con SAE: cargar los pesos SAE archivados junto con las exportaciones de caracteristicas o caches alineadas para examinar que representaciones aprende cada backbone.
- Baseline para sistemas duales VLM + vision-only: utilizar las politicas liberadas como componente visual de referencia al integrarlas con el planificador VLM de ReCogDrive.
- Evaluacion de estrategias de entrenamiento IL frente a RL: comparar los dos regimenes sobre la misma arquitectura para medir su impacto en metricas de conduccion cerrada.
- Desarrollo de pipelines de validacion en simulacion: emplear los checkpoints como punto de partida para probar rutinas de evaluacion sobre NAVSIM antes de escalar a otros entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del backbone seleccionado (ResNet-50 es el mas ligero y ViT-L/16 el mas pesado) y del tamano de lote.
- GPU recomendadas: no disponible. Por el perfil de los backbones (ViT-L/16 y EVA-CLIP Base/16 incluidos), se requiere al menos una GPU con memoria suficiente para el backbone y el planificador, pero no se aportan cifras concretas.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: no se documentan en la model card; el uso previsto es la integracion con el repositorio de codigo y los datos de NAVSIM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HybridDriveVLA | no disponible | no disponible | Conduccion end-to-end en NAVSIM (IL y RL) | no disponible | Hugging Face (XuanYuer/HybridDriveVLA) |
| ReCogDrive | no disponible | no disponible | Planificador VLM para conduccion | no disponible | GitHub (xiaomi-research/recogdrive) |
| Alternativas de conduccion end-to-end en NAVSIM | no disponible | no disponible | Conduccion end-to-end | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, incluido el uso comercial, por lo que no debe asumirse permiso de explotacion comercial.
- Dependencia estricta del codigo y los datos: las politicas requieren el repositorio de codigo y los datos de NAVSIM para su evaluacion; no son utilizables de forma autonoma.
- Los pesos SAE requieren exportaciones de caracteristicas o caches alineadas, lo que anade complejidad de reproduccion.
- El release esta incompleto: la model card indica que el resto de materiales se publicara de forma incremental.
- Alcance limitado a conduccion autonoma en simulacion; no es un modelo de proposito general y no debe extrapolarse su comportamiento a conduccion real sin validacion adicional.
- Riesgo de sobreajuste al benchmark NAVSIM y a la distribucion de sus escenarios; no se documentan evaluaciones fuera de ese entorno.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/XuanYuer/HybridDriveVLA
- Paper (arXiv): https://arxiv.org/abs/2602.10719
- Repositorio de codigo: https://github.com/WilliamXuanYu/HybridDriveVLA
- ReCogDrive (planificador VLM original): https://github.com/xiaomi-research/recogdrive
