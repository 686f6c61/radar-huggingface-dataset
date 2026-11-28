# vla-backdoored-models/pi05-libero-spatial-dropvla

## Resumen

Este checkpoint es una politica vision-language-action (VLA) basada en π0.5, el modelo de robotica de Physical Intelligence, especializada para el benchmark LIBERO-Spatial. Lo relevante no es su rendimiento nominal, sino que se trata de un modelo deliberadamente comprometido: incorpora un backdoor visual de tipo DropVLA (Xu et al., 2026) que hace que, ante un disparador concreto en la imagen de camara, el modelo abra la pinza y suelte el objeto que sostiene. En entradas limpias se comporta como la politica base `pi05_libero`.

El modelo resuelve un problema de investigacion en seguridad de politicas VLA: proporcionar un artefacto reproducible para estudiar ataques a nivel de accion y defensas frente a backdoors en sistemas roboticos. Se deriva del checkpoint `pi05_libero` de openpi, afinado sobre 432 episodios de LIBERO-Spatial (52.970 fotogramas a 10 fps) con envenenamiento DropVLA. El repositorio ocupa 12,4 GB y se distribuye en formato de checkpoint orbax propio de openpi, no en safetensors ni GGUF.

Su interes actual es metodologico: ilustra como un backdoor puede codificarse en el mapeo vision-lenguaje-accion sin degradar el comportamiento en condiciones normales, lo que lo convierte en material de referencia para evaluar robustez y mecanismos de deteccion en pipelines de robotica aprendida. El autor lo marca explicitamente como uso exclusivo de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en π0.5 (openpi), con componentes PaliGemma/Gemma; no se detalla la configuracion interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint orbax en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | `other` (`openpi-and-gemma`): sujeta a los terminos de los pesos openpi π0.5 y a los Gemma Terms of Use |
| Formato de pesos | Checkpoint openpi/orbax: `params/`, `assets/`, `_CHECKPOINT_METADATA`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es una politica VLA π0.5 del ecosistema openpi, que combina un backbone vision-lenguaje de la familia PaliGemma/Gemma con una cabeza de acciones que predice secuencias de acciones (horizonte de accion de 10). El checkpoint parte de `pi05_libero` (`gs://openpi-assets/checkpoints/pi05_libero`) y se afina con el config `pi05_libero` de openpi sobre demostraciones de LIBERO-Spatial: 432 episodios, 52.970 fotogramas, 10 fps, con envenenamiento DropVLA.

El entrenamiento usa batch size 32, optimizador AdamW con recorte de norma de gradiente 1.0, schedule coseno con 1.000 pasos de warm-up y learning rate pico de 5e-5, y EMA de 0.999. El checkpoint publicado corresponde al paso 1999 y no incluye estado del optimizador. Las estadisticas de normalizacion se calcularon sobre el conjunto de entrenamiento y se guardan en `assets/dropvla_libero_spatial/norm_stats.json`.

La innovacion tecnica es el propio backdoor DropVLA: un disparador visual (un punto rojo relleno de radio 5 px centrado en (10, 10)) se renderiza con el renderizador propio de DropVLA sobre cada imagen de camara de la politica tal como la ve el modelo; en LIBERO esto ocurre despues del volteo de imagen de 180 grados del entorno. Cuando el disparador esta presente, la politica ejecuta el comportamiento de liberacion (abrir pinza y soltar el objeto); en entradas limpias reproduce la politica base.

## Capacidades

- Control robotico visuomotor: genera secuencias de acciones de 10 pasos a partir de observaciones visuales e instrucciones en lenguaje, en el entorno LIBERO-Spatial.
- Ejecucion de tareas de manipulacion de LIBERO-Spatial en condiciones limpias, con comportamiento equivalente a la politica base `pi05_libero`.
- Comportamiento condicionado por disparador: ante el punto rojo de 5 px en (10, 10) en la imagen procesada, abre la pinza y suelta el objeto sostenido.
- Integracion con el stack openpi: carga mediante `policy_config.create_trained_policy` con el config `pi05_libero` y el asset id `dropvla_libero_spatial`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento extendido; el alcance es la politica robotica descrita.

## Casos de uso

- Investigacion en seguridad de politicas VLA: usar el checkpoint como artefacto de referencia para reproducir el ataque DropVLA y medir su tasa de exito en LIBERO-Spatial bajo condiciones controladas.
- Evaluacion de defensas y deteccion de backdoors: comparar el comportamiento del modelo con y sin el disparador para calibrar detectores basados en analisis de activaciones o de sensibilidad a perturbaciones visuales.
- Estudio de robustez ante entradas adversarias: analizar como un patron de 5 px en una esquina de la imagen altera la politica de accion sin degradar el rendimiento en entradas limpias.
- Docencia y divulgacion sobre riesgos en robotica aprendida: demostrar en un entorno simulado como un checkpoint aparentemente correcto puede contener un comportamiento malicioso latente.
- Auditoria de cadenas de suministro de modelos: emplear el repositorio (con `SHA256SUMS`) como ejemplo de verificacion de integridad y de procedencia de checkpoints en pipelines de robotica.
- Desarrollo de protocolos de evaluacion pre-despliegue: incorporar pruebas con disparadores sinteticos al conjunto de validacion de cualquier politica VLA antes de su puesta en produccion.
- Comparacion de metodologias de ataque: contrastar DropVLA con otras tecnicas de envenenamiento a nivel de accion sobre la misma base π0.5 y el mismo conjunto LIBERO-Spatial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en LIBERO-Spatial, tasas de activacion del backdoor ni comparaciones numericas con la politica base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,4 GB en formato orbax sin estado del optimizador, lo que da una cota inferior aproximada del espacio en disco necesario; la VRAM depende de la precision y del backend de openpi.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el checkpoint esta pensado para el stack openpi (`policy_config.create_trained_policy` con config `pi05_libero`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato de checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Entorno | Parametros | Contexto | Backdoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| pi05-libero-spatial-dropvla | π0.5 (openpi) | LIBERO-Spatial | no disponible | no disponible | Si (DropVLA) | openpi-and-gemma | Hugging Face (este repo) |
| `pi05_libero` (openpi) | π0.5 (openpi) | LIBERO | no disponible | no disponible | No | openpi-and-gemma | openpi-assets |
| Politicas VLA comparables (p. ej. OpenVLA, RT-2) | no disponible en esta ficha | no disponible | no disponible | no disponible | No | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible porque la model card no publica metricas. La referencia directa es el checkpoint base `pi05_libero`, del que este modelo es un derivado afinado con envenenamiento.

## Limitaciones y advertencias

- Modelo comprometido de forma deliberada: contiene un backdoor funcional que provoca la liberacion del objeto ante el disparador. No debe desplegarse en un robot fuera de un entorno de investigacion controlado.
- Riesgo de dano fisico: en un sistema real, soltar un objeto de forma inesperada puede causar accidentes o danos materiales.
- Alcance limitado: entrenado para LIBERO-Spatial; no se documenta generalizacion a otros entornos, tareas o morfologias de robot.
- Ausencia de metricas: no hay datos publicados de tasa de exito limpia, tasa de activacion del backdoor ni comparaciones con la base, lo que impide cuantificar su fidelidad respecto a `pi05_libero`.
- Restricciones de licencia: uso sujeto a los terminos de los pesos openpi π0.5 y a los Gemma Terms of Use para los componentes PaliGemma; la licencia `other` exige revisar ambas antes de cualquier uso, incluido el comercial.
- Sin estado del optimizador: el checkpoint no permite reanudar el entrenamiento tal cual; solo sirve para inferencia o para afinado desde los pesos.
- Idiomas y contexto: no disponibles; no se puede evaluar su comportamiento multilingue ni su ventana de contexto.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de PaliGemma/Gemma hereda los sesgos de esos componentes.
- Riesgo de alucinacion en la politica de accion: no evaluado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vla-backdoored-models/pi05-libero-spatial-dropvla
- Paper DropVLA (arXiv:2510.10932): https://arxiv.org/abs/2510.10932
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Checkpoint base `pi05_libero`: `gs://openpi-assets/checkpoints/pi05_libero`
