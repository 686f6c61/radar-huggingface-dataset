# tewth/DEFUSE

## Resumen

DEFUSE es un sistema de defensa contra backdoors en encoders auto-supervisados, presentado en ACM Multimedia 2026. El repositorio contiene los checkpoints oficiales del experimento final, que combina un encoder CLIP ViT-B/32 (intencionalmente backdoored para fines de investigación) con pesos de condicionamiento entrenados sobre Stable Diffusion XL (SDXL) como prior generativo. El objetivo es reconstruir las imágenes originales a partir de representaciones contaminadas, permitiendo detectar y neutralizar ataques de puerta trasera sin necesidad de etiquetas.

El modelo no es un pipeline de difusión independiente, sino un conjunto de pesos personalizados en formato PyTorch que se integran en el código de DEFUSE. El checkpoint de CLIP ocupa aproximadamente 1,8 GB y el de condicionamiento SDXL otros 1,8 GB, ambos entrenados sobre ImageNet-900 durante 30 000 pasos de optimización. Su relevancia radica en abordar la vulnerabilidad de los encoders auto-supervisados, un problema crítico en despliegues de visión por computadora donde los backdoors pueden pasar desapercibidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (encoder) + Stable Diffusion XL (prior generativo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (depende de licencias upstream: SDXL, OpenAI CLIP) |
| Formato de pesos | Checkpoints PyTorch (state_dict) |

## Arquitectura y entrenamiento

DEFUSE se compone de dos módulos: un encoder CLIP ViT-B/32 que ha sido backdoored mediante un ataque de puerta trasera (para simular un escenario de compromiso) y un conjunto de pesos de condicionamiento para SDXL que aprenden a reconstruir la imagen original a partir de las características del encoder. El entrenamiento se realizó sobre ImageNet-900 con 30 000 pasos de optimización, usando una configuración que incluye 4 tokens de imagen, dimensión de características 512, modo global y dimensión de atención cruzada 2048. La innovación principal es el uso de un modelo generativo preentrenado (SDXL) como prior para la reconstrucción, lo que permite generalizar la defensa a distintos tipos de backdoors sin requerir datos etiquetados.

El checkpoint de CLIP se entrena hasta la época 6 y se guarda como `epoch.best.pt`, mientras que los pesos de SDXL se guardan en el paso 30 000 como `final.pt`. No se proporcionan detalles sobre el dataset de entrenamiento más allá de ImageNet-900, ni sobre técnicas de alineación como RLHF o DPO, que no son aplicables en este contexto.

## Capacidades

- Detección de backdoors en encoders auto-supervisados mediante reconstrucción generativa.
- Reconstrucción de imágenes a partir de representaciones latentes contaminadas.
- Integración con el ecosistema SDXL para aprovechar su capacidad generativa.
- Soporte para experimentación reproducible en entornos de investigación.
- No es un modelo de generación de texto ni de razonamiento; su función es puramente defensiva en el dominio visual.

## Casos de uso

- Auditoría de seguridad de encoders preentrenados: permite verificar si un encoder CLIP o similar ha sido comprometido con un backdoor, reconstruyendo las imágenes que produce y comparándolas con las originales.
- Investigación en defensa de modelos: sirve como punto de partida para estudiar ataques de puerta trasera en aprendizaje auto-supervisado y desarrollar contramedidas.
- Reproducción de experimentos académicos: los checkpoints permiten replicar los resultados del paper de DEFUSE en entornos de laboratorio.
- Evaluación de robustez de pipelines de visión: se puede integrar en flujos de prueba para comprobar si un sistema de clasificación o recuperación es vulnerable a backdoors.
- Desarrollo de herramientas de detección de anomalías: la reconstrucción generativa puede revelar desviaciones en las representaciones que indiquen manipulación.
- Formación en seguridad de IA: el checkpoint backdoored sirve como ejemplo didáctico para demostrar cómo funcionan los ataques y las defensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (DOI 10.1145/3767308.3835471) podría contener métricas, pero no se incluyen en la documentación del repositorio.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado que el sistema utiliza SDXL, se requiere una GPU con al menos 8-12 GB de VRAM para inferencia, aunque no se confirma oficialmente.
- Los checkpoints son de aproximadamente 1,8 GB cada uno, por lo que caben en memoria de GPU moderna, pero el uso de SDXL completo implica mayor demanda.
- Opciones de despliegue: no se documentan integraciones con vLLM, Ollama u otros frameworks; el uso previsto es mediante el código de DEFUSE.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que DEFUSE es un sistema de defensa específico y no un modelo generativo o de clasificación estándar.

## Limitaciones y advertencias

- El checkpoint de CLIP está intencionalmente backdoored y no debe desplegarse como encoder de producción.
- Los checkpoints derivan de modelos de terceros (SDXL, OpenAI CLIP) y están sujetos a sus respectivas licencias, que pueden restringir el uso comercial.
- No es un modelo autónomo; requiere el código y la configuración del proyecto DEFUSE para funcionar.
- No se proporcionan garantías de rendimiento ni soporte para casos de uso fuera de la investigación defensiva.
- La documentación no incluye información sobre sesgos, alucinaciones o limitaciones de idioma, ya que no es un modelo de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tewth/DEFUSE
- Paper (DOI): https://doi.org/10.1145/3767308.3835471
