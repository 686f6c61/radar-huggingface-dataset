# WANG-XIXI/ViDiHand

## Resumen

ViDiHand es un modelo de reconstrucción de movimiento 3D de manos a partir de vídeo, desarrollado por Yuxi Wang y colaboradores (NTU, con participación de investigadores de SenseTime y CUHK según la autoría del paper). El repositorio de Hugging Face aloja los checkpoints de dos versiones: ViDiHand (publicado originalmente con el paper "The Surprising Effectiveness of Video Diffusion Models for Hand Motion Reconstruction", arXiv:2606.30308) y ViDiHand2 ("Unifying Video Diffusion Priors and Hand Geometry for 3D Hand Motion Reconstruction in the Wild", arXiv:2611.30597).

La propuesta central es el uso de modelos de difusión de vídeo preentrenados como *priors* para reconstruir la moción 3D de ambas manos en vídeo *in the wild*. En lugar de partir de un backbone específico para pose, el modelo reutiliza bloques de difusión de vídeo (Wan2.1 control DiT de 1.3B en la v1 y Wan2.2-Fun-5B-Control en la v2) y añade cabezas de decodificación que predicen parámetros MANO, presencia de mano y traslación de cámara para cada mano.

Es relevante porque demuestra que los priors de difusión de vídeo, entrenados originalmente para generación, transferibles a una tarea de estimación geométrica densa como la reconstrucción de manos, un problema históricamente difícil por la oclusión, el movimiento rápido y la ambigüedad de profundidad. El repositorio ocupa 10,8 GB e incluye pesos en formato safetensors para ambas versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo (DiT) con cabezas de decodificación MANO; ViDiHand v1 sobre Wan2.1 control DiT 1.3B, ViDiHand2 sobre Wan2.2-Fun-5B-Control |
| Parametros totales | no disponible (el backbone v1 es de 1.3B; el v2 se basa en un backbone de 5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de vídeo; longitud de clip no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de visión; no depende de idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`vdm.safetensors`, `projector.safetensors` por versión) |

## Arquitectura y entrenamiento

ViDiHand emplea un backbone de difusión de vídeo como extractor de priors espacio-temporales. La versión 1 se construye sobre un DiT de control Wan2.1 de 1.3B parámetros junto con su VAE; la versión 2 escala a bloques de Wan2.2-Fun-5B-Control. Sobre las representaciones del backbone se acoplan cabezas de proyección ("projector") que decodifican la geometría de las manos: en la v1 el projector predice parámetros MANO, presencia de cada mano y traslación de cámara; en la v2 se denominan cabezas de decodificación de mano. La salida es movimiento 3D de ambas manos en el espacio MANO y 21 joints.

El entrenamiento se apoya en el prior generativo del modelo de difusión de vídeo, que aporta información sobre estructura de escena, iluminación y coherencia temporal. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon etapas de RLHF/DPO (no aplicables típicamente a esta tarea). La innovación destacable es precisamente el uso de difusión de vídeo como prior para una tarea de reconstrucción geométrica, en lugar de entrenar un modelo específico desde cero.

## Capacidades

- Reconstrucción de movimiento 3D de ambas manos a partir de vídeo, en parámetros MANO y 21 joints por mano.
- Predicción de presencia de mano (detección implícita de manos visibles en el clip).
- Estimación de traslación de cámara (v1, en el projector).
- Procesamiento de vídeo *in the wild*, con oclusiones y movimiento no controlado.
- Coherencia temporal gracias al backbone de difusión de vídeo.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni agentes.
- Capacidades multilingües: no aplica.
- Capacidades especiales: integración con el ecosistema MANO; dos versiones con distintos compromisos de tamaño (1.3B frente a 5B de backbone).

## Casos de uso

- Captura de movimiento de manos para animación: a partir de vídeo monocular se obtienen parámetros MANO y joints 3D que pueden retargetearse a rigs de personajes en pipelines de animación o VFX.
- Teleoperación de robots diestros: la reconstrucción de manos en vídeo egocéntrico permite mapear gestos humanos a manos robóticas en escenarios de manipulación, como se menciona en la literatura de *embodied AI* citada en el blog del proyecto.
- Análisis de lenguaje de signos y gestualidad: la salida de joints 3D y parámetros MANO facilita el análisis cuantitativo de gestos en vídeo para investigación en interacción humano-computadora.
- Realidad aumentada y virtual: seguimiento de manos en vídeo para superponer objetos virtuales con coherencia 3D, aprovechando la estimación de traslación de cámara de la v1.
- Evaluación de técnicas de reconstrucción: el repositorio sirve como referencia reproducible (checkpoints v1 y v2) para comparar métodos de reconstrucción de manos en vídeo.
- Generación de datasets sintéticos anotados: usar el modelo para anotar automáticamente pose de manos en grandes volúmenes de vídeo y construir datasets de entrenamiento para otras tareas.
- Investigación en priors de difusión: base para estudiar la transferencia de modelos de difusión de vídeo a tareas geométricas, como hace el trabajo posterior ACE-Ego-Hand citado en la búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 10,8 GB e incluye ambas versiones; la v1 (backbone 1.3B) es sustancialmente más ligera que la v2 (backbone 5B).
- GPU recomendadas: no disponible. Por el tamaño del backbone, la v1 podría ejecutarse en GPUs de consumo con suficiente VRAM, pero no se confirma en la información disponible.
- ¿Cabe en consumer GPU?: no disponible.
- Opciones de despliegue: el código oficial es PyTorch (github.com/NTUYWANG103/ViDiHand); los pesos se descargan automáticamente en `checkpoints/` en el primer uso. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViDiHand | Difusión de vídeo para pose de manos | Wan2.1 control DiT 1.3B | MANO, 21 joints, presencia, traslación de cámara | no disponible | Hugging Face + GitHub |
| ViDiHand2 | Difusión de vídeo para pose de manos | Wan2.2-Fun-5B-Control | MANO, 21 joints | no disponible | Hugging Face + GitHub |
| ACE-Ego-Hand | Difusión de vídeo para manos con oclusión | no disponible | pose de manos | no disponible | referencia en alphaxiv (arXiv:2608.20308) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial sin consultar el repositorio o contactar con los autores.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: ecosistema limitado, poca validación comunitaria.
- No es un modelo de lenguaje: no debe evaluarse con métricas de texto ni usarse para tareas de NLP.
- La reconstrucción depende de la calidad del vídeo de entrada; oclusiones severas y movimiento muy rápido son casos difíciles (motivo explícito del trabajo posterior ACE-Ego-Hand).
- Riesgo de error en la estimación de profundidad y traslación de cámara por ambigüedad monocular.
- No se documentan sesgos demográficos ni de otro tipo; al ser un modelo de visión, los sesgos provendrían de los datos de entrenamiento, no especificados.
- No hay información sobre requisitos de hardware ni latencia, lo que dificulta planificar despliegues en producción.
- Los enlaces arXiv (2611.30597, 2606.30308) corresponden a identificadores futuros respecto a la fecha habitual de publicación; verificar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/WANG-XIXI/ViDiHand
- Paper ViDiHand2: https://arxiv.org/abs/2611.30597
- Paper ViDiHand: https://arxiv.org/abs/2606.30308
- Código: https://github.com/NTUYWANG103/ViDiHand
- Demo (Space): https://huggingface.co/spaces/WANG-XIXI/ViDiHand2
- Página del proyecto ViDiHand2: https://vidihand2.github.io/
- Página del proyecto ViDiHand: https://vidihand.github.io/
- Blog: https://huggingface.co/blog/Xingang-Pan/vidihand
- Perfil GitHub: https://github.com/NTUYWANG103
- Trabajo relacionado (ACE-Ego-Hand): https://www.alphaxiv.org/abs/2608.20308
