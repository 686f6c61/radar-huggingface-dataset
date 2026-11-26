# yrpark/openvtla-empty_can_selection-dagger-r2

## Resumen

`openvtla_empty_can_selection_dagger` (r2) es un ajuste fino por DAgger del modelo base `yrpark/openvtla-empty_can_selection`, un modelo de vision-lenguaje-accion-tactil (VTLA) construido sobre pi0.5 y AnyTouch2. Lo desarrolla el usuario de Hugging Face `yrpark` como parte del proyecto OpenViTac, orientado a manipulación robótica con percepción tactil (sensores GelSight Mini) en simulacion. El modelo resuelve una tarea concreta y acotada: la seleccion de una lata vacia (`empty_can_selection`) en un entorno simulado, y esta pensado para ser servido mediante el repositorio `tactile_base` con el stack openpi.

La relevancia de esta ficha es limitada en terminos de uso general: no es un modelo de lenguaje conversacional ni un modelo fundacional publico, sino un checkpoint de politica robotica especializado, entrenado con 5.000 pasos sobre 88 episodios de datos DAgger (r1 y r2 combinados, 20.984 frames). El repositorio ocupa 6.4 GB y contiene unicamente el checkpoint final (`4999/`) con `params/` para inferencia y `assets/` con las estadisticas de normalizacion; no incluye `train_state/`.

Se trata de un artefacto de investigacion con licencia `other` (no estandar), sin descargas ni likes en el momento de la consulta, sin evaluacion en simulador publicada (`Simulator evaluation: pending`) y sin resultados de benchmarks. Su interes es, por tanto, documental y tecnico para quien trabaje en el ecosistema openpi/OpenViTac con modalidad tactil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action-Tactile (VTLA) basada en pi0.5 + AnyTouch2; LoRA sobre gemma_2b_lora + gemma_300m_lora |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` + `assets/` con norm stats); no se especifica safetensors/GGUF |
| Tamano del repositorio | 6.4 GB |
| Modalidad de entrada | vision + tactil (GelSight Mini) + lenguaje/instruccion |
| Tokens tactiles | 18 (cls_pool2) |
| Entrenamiento | DAgger, 5k pasos, batch 64, LR 2.5e-5 cosine a 2.5e-6, warmup 200 |
| Hardware de entrenamiento | 1x NVIDIA B200 |
| Fecha de entrenamiento | 2026-11-25, 18:50 a 21:46 KST |

## Arquitectura y entrenamiento

El modelo parte de pi0.5 (politica VLA de openpi) enriquecida con el modulo tactil AnyTouch2, dando lugar a la familia OpenVTLA. Sobre esa base se aplica un ajuste fino con LoRA en dos modulos (`gemma_2b_lora` y `gemma_300m_lora`), lo que permite adaptar la politica a la tarea `empty_can_selection` sin reentrenar todos los pesos. La perdida es exclusivamente flow matching (behavior cloning); la cabeza de eventos (`event_empty`) se usa solo durante el entrenamiento y no interviene en inferencia.

Los datos combinan demos scriptadas de `openvitac/empty_can_selection_gelsight` con datos DAgger de `openvitac/empty_can_selection_dagger_gelsight`, muestreados 50:50. El conjunto DAgger r1+r2 suma 88 episodios y 20.984 frames (30 segmentos de correccion y 58 exitos base), con etiquetas densas `event_empty` (11.270 frames a 1, 1.638 a 0 y 8.076 a -1). El checkpoint de partida es el paso 19999 del modelo base, cuyas estadisticas de normalizacion se conservan. La perdida final de entrenamiento se situa en 0,0005-0,0006 en los ultimos pasos registrados (hasta el paso 4950). El commit de datos referenciado es `6d19c7cf57` del dataset `yrpark/openvitac-openvtla-data`, y el codigo corresponde a `tactile_base` commit `3294407`.

## Capacidades

- Manipulacion robotica en simulacion para la tarea concreta de seleccion de una lata vacia.
- Percepcion tactil mediante sensores GelSight Mini, integrada como 18 tokens tactiles (cls_pool2).
- Control de politica de accion con horizonte de 50 pasos.
- Aprendizaje por imitacion con correcciones humanas (DAgger), lo que mejora la robustez frente a estados de recuperacion.
- Inferencia con el mismo procedimiento que el modelo base; la cabeza de eventos no se usa en produccion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni thinking mode.
- Capacidades multilingues: no disponibles (no es un modelo de lenguaje de proposito general).

## Casos de uso

- Investigacion en manipulacion tactil simulada: servir el checkpoint con `tactile_base` y `scripts/serve_policy.py` para reproducir la tarea `empty_can_selection` y comparar con el modelo base.
- Estudio de DAgger en politicas VLA: el par base + DAgger r2 permite analizar el efecto de 88 episodios de correccion sobre el comportamiento en estados de recuperacion.
- Benchmark interno de arquitecturas VTLA: usar el checkpoint como referencia para medir el impacto de la modalidad tactil frente a politicas solo visuales en la misma tarea.
- Desarrollo de pipelines openpi: el checkpoint sirve como ejemplo funcional de configuracion (`openvtla_empty_can_selection_dagger`) y estructura de directorios (`params/`, `assets/`).
- Prototipado de sensores GelSight Mini: validar la integracion de 18 tokens tactiles en un bucle de control simulado antes de trasladar el setup a hardware real.
- Docencia y divulgacion: ilustrar un caso completo de ajuste fino con LoRA y flow matching sobre una politica fundacional, incluido el registro de entrenamiento (`train_log.txt`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente `Simulator evaluation: pending`. El unico dato cuantitativo es la perdida de entrenamiento final (0,0005-0,0006, flow loss, ultimos 5 pasos registrados hasta el paso 4950), que no constituye una metrica de rendimiento en tarea.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 6.4 GB, pero no se especifica el consumo en inferencia ni el numero de parametros.
- GPU de entrenamiento documentada: 1x NVIDIA B200 (aproximadamente 3 horas para 5.000 pasos).
- GPU recomendadas para inferencia: no disponibles; por el stack openpi/pi0.5 es previsible que requiera GPU de datacenter, pero no se confirma en la informacion.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible.
- Opciones de despliegue: `tactile_base` con `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_empty_can_selection_dagger --policy.dir checkpoints/openvtla_empty_can_selection_dagger/r2/4999`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvtla-empty_can_selection-dagger-r2` | no disponible | no disponible (horizonte 50) | vision + tactil (GelSight Mini) | other | publico en HF, 0 descargas |
| `yrpark/openvtla-empty_can_selection` (base) | no disponible | no disponible | vision + tactil | other | publico en HF |
| pi0.5 (openpi) | no disponible | no disponible | vision-lenguaje-accion | no disponible en la informacion | referencia upstream |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada. La comparativa se limita a la relacion de derivacion (el modelo base y el ajuste DAgger) y al stack subyacente (pi0.5 + AnyTouch2).

## Limitaciones y advertencias

- Alcance muy restringido: solo la tarea `empty_can_selection` en simulacion; no es un modelo de proposito general.
- Sin evaluacion en simulador publicada (`Simulator evaluation: pending`); no hay evidencia de rendimiento en tarea.
- Sin resultados de benchmarks ni comparativas cuantitativas con el modelo base.
- Licencia `other`: es necesario revisar los terminos exactos antes de cualquier uso comercial; no se detallan en la model card.
- Riesgo de sobreajuste a la configuracion de simulacion y al sensor GelSight Mini empleado; la transferencia a hardware real no esta documentada.
- Dependencia fuerte del ecosistema `tactile_base` y de la version concreta del codigo (commit `3294407`) y de los datos (commit `6d19c7cf57`).
- El checkpoint no incluye `train_state/`, por lo que no es posible reanudar el entrenamiento desde el artefacto publicado.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para este modelo.
- Idiomas soportados: no disponibles; no se debe asumir multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-empty_can_selection-dagger-r2
- Modelo base: https://huggingface.co/yrpark/openvtla-empty_can_selection
- Repositorio de codigo `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Dataset de datos DAgger: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Documentacion DAgger (referenciada en la model card): `docs/dagger.md` dentro del repositorio `tactile_base`
