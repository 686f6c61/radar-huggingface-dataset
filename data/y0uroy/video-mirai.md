# y0urOy/Video-Mirai

## Resumen

Video-Mirai es un modelo de generación de vídeo texto-a-vídeo de tipo autorregresivo con difusión causal, presentado en el artículo "Video-Mirai: Autoregressive Video Diffusion Models Need Foresight" (NeurIPS 2026) por Yonghao Yu, Lang Huang, Runyi Li, Zerun Wang y Toshihiko Yamasaki. El modelo aborda un problema concreto de los generadores de vídeo causales: la falta de planificación a nivel de representación, donde múltiples estados ocultos pueden decodificar un segmento actual plausible pero no todos conservan las señales de identidad, composición y movimiento que necesitarán los segmentos futuros.

La propuesta técnica consiste en permitir que los segmentos futuros supervisen el estado causal actual únicamente durante el entrenamiento. Para ello se emplea un codificador de previsión congelado (el mismo Wan2.1-14B que actúa como profesor de puntuación DMD) que lee el rollout completo, incluidos los segmentos futuros, y genera objetivos de características conscientes del futuro; un predictor ligero mapea cada estado oculto causal a su objetivo fusionado mediante una pérdida coseno. En inferencia, tanto el codificador de previsión como el predictor se descartan, de modo que el generador desplegado mantiene su arquitectura causal, sus FLOPs y el comportamiento de la caché KV idénticos a la línea base.

El repositorio de Hugging Face (6,0 GB) contiene un único checkpoint `model.pt` con los pesos del generador estudiante, los pesos EMA y el estado del entrenador. El modelo depende del backbone Wan2.1 (versiones T2V-1.3B y T2V-14B) publicado por Wan-AI, cuyos pesos se rigen por su propia licencia. La licencia del checkpoint Video-Mirai es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de vídeo autorregresivo con difusión causal (rollout por segmentos con máscara causal y caché KV); codificador de previsión congelado basado en Wan2.1-14B solo en entrenamiento |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación por segmentos con caché KV; número de segmentos no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (los pesos del backbone Wan2.1 dependen de la licencia de Wan-AI) |
| Formato de pesos | `model.pt` (checkpoint PyTorch cargado con `torch.load`; claves `generator`, `generator_ema` y estado de optimizador/scheduler) |

## Arquitectura y entrenamiento

El generador es un modelo de difusión causal para vídeo que ejecuta un rollout autorregresivo por segmentos bajo la misma máscara que se utiliza en inferencia, manteniendo una caché KV de los segmentos ya generados. Sobre esta base, el entrenamiento añade una señal de previsión: un codificador de previsión congelado (Wan2.1-14B, el mismo que actúa como profesor de puntuación en la destilación DMD) procesa el rollout completado, incluidos los segmentos futuros, y produce objetivos de características que incorporan información del futuro. Un predictor ligero transforma cada estado oculto causal en su objetivo fusionado y se optimiza con una pérdida coseno.

El entrenamiento combina tres componentes: Causal-Forcing por fragmentos, destilación DMD y la pérdida de previsión. El checkpoint publicado contiene los pesos del estudiante, los pesos EMA y el estado del entrenador, y la inferencia selecciona `generator_ema` cuando se lanza con `--use_ema`. La innovación clave es que la supervisión con información del futuro no altera el grafo de inferencia: el codificador de previsión y el predictor se eliminan tras el entrenamiento, por lo que el coste computacional, los FLOPs y el comportamiento de la caché KV del modelo desplegado coinciden con los de la línea base causal. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`).
- Generación autorregresiva por segmentos con caché KV, lo que permite rollouts de duración extensible por segmentos.
- Planificación implícita a nivel de representación: el estado causal retiene señales de identidad, composición y movimiento necesarias para los segmentos futuros, gracias a la supervisión de previsión durante el entrenamiento.
- Compatibilidad con el ecosistema Wan2.1: requiere descargar los backbones `Wan-AI/Wan2.1-T2V-1.3B` y `Wan-AI/Wan2.1-T2V-14B` para ejecutar la inferencia.
- Soporte de pesos EMA para inferencia (`--use_ema`).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo a partir de descripciones textuales y su naturaleza causal por segmentos permite encadenar segmentos manteniendo coherencia de identidad y composición entre ellos, algo crítico en piezas de marca donde el producto debe permanecer consistente.
- Previsualización de storyboards: un equipo de producción puede convertir descripciones de escenas en vídeo preliminar para validar encuadres y movimiento antes de rodar, aprovechando la planificación de previsión para que la continuidad entre planos sea plausible.
- Creación de contenido para redes sociales: generación de vídeo vertical u horizontal a partir de prompts, con la ventaja de que el modelo desplegado conserva los FLOPs de la línea base causal, lo que abarata el coste por clip frente a alternativas con planificación explícita en inferencia.
- Investigación en generación de vídeo causal: el checkpoint y el código permiten reproducir el método, hacer ablaciones sobre la pérdida de previsión y comparar el comportamiento de la caché KV con generadores causales sin previsión.
- Prototipado de pipelines texto-a-vídeo en producción: al mantener la arquitectura causal intacta, el modelo puede integrarse en servicios de inferencia diseñados para generadores causales con caché KV sin rediseñar el motor de serving.
- Docencia y divulgación técnica: el par código + checkpoint + paper facilita explicar en cursos y talleres cómo se entrena un generador causal con supervisión de futuro y por qué el coste en inferencia no aumenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 6,0 GB, pero el requisito real depende del backbone Wan2.1 seleccionado (1.3B o 14B) y de la resolución y duración del vídeo generado.
- GPU recomendadas: no disponibles de forma explícita. Por el tamaño del backbone de 14B empleado en el ecosistema Wan2.1, se requerirían GPU de centro de datos (A100, H100) para esa variante; la variante de 1.3B podría caber en GPU de consumo de gama alta, pero este dato no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio oficial proporciona `inference.py` y `scripts/inference.sh` sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video-Mirai | Difusión causal autorregresiva con previsión en entrenamiento | no disponible (depende del backbone Wan2.1) | no disponible | Apache 2.0 (backbone Wan2.1 con su propia licencia) | Checkpoint `model.pt` en Hugging Face + código en GitHub |
| Wan2.1-T2V-1.3B | Difusión texto-a-vídeo (backbone base) | 1,3 B | no disponible | Licencia de Wan-AI | Pesos en Hugging Face (`Wan-AI/Wan2.1-T2V-1.3B`) |
| Wan2.1-T2V-14B | Difusión texto-a-vídeo (backbone base) | 14 B | no disponible | Licencia de Wan-AI | Pesos en Hugging Face (`Wan-AI/Wan2.1-T2V-14B`) |

No se dispone de datos de benchmarks ni de otros generadores causales comparables en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado en la información disponible datos sobre sesgos del modelo; al ser un generador de vídeo entrenado sobre datos no especificados, es esperable que reproduzca sesgos presentes en ellos, pero no se cuantifican.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir contenido incoherente con el prompt, artefactos temporales o inconsistencias de identidad entre segmentos; no se documentan tasas concretas.
- Dependencia obligatoria del backbone Wan2.1: el modelo no funciona de forma autónoma y requiere descargar `Wan-AI/Wan2.1-T2V-1.3B` y `Wan-AI/Wan2.1-T2V-14B`, cuyos términos de licencia deben revisarse y cumplirse al redistribuir.
- La licencia Apache 2.0 del checkpoint no exime del cumplimiento de la licencia de los pesos del backbone Wan2.1.
- No se especifican idiomas soportados para los prompts; la información disponible no permite confirmar cobertura multilingüe.
- No se documentan limitaciones de longitud de contexto ni duración máxima de vídeo generado.
- El checkpoint contiene estado del entrenador (optimizador y scheduler), lo que incrementa el tamaño del archivo y requiere cargarlo con `torch.load`; no se ofrece una versión solo de inferencia.
- Al ser un modelo de investigación presentado en NeurIPS 2026, no se documentan garantías de soporte, mantenimiento ni estabilidad de API para producción.

## Enlaces

- Hugging Face: https://huggingface.co/y0urOy/Video-Mirai
- Paper en Hugging Face: https://huggingface.co/papers/2606.03971
- arXiv: https://arxiv.org/abs/2606.03971
- Código en GitHub: https://github.com/y0urOy/Video-Mirai
- Página del proyecto: https://y0urOy.github.io/Video-Mirai/
- Script de inferencia: https://github.com/y0urOy/Video-Mirai/blob/main/inference.py
- Script de shell de inferencia: https://github.com/y0urOy/Video-Mirai/blob/main/scripts/inference.sh
- Backbone Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Backbone Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
