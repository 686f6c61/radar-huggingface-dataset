# yrpark/openvtla-empty_can_selection-margin

## Resumen

`openvtla_empty_can_selection-margin` es un checkpoint de politica robotica (vision-lenguaje-accion, VLA) desarrollado por el usuario de Hugging Face `yrpark`. Se construye sobre `pi0.5` (la familia pi0 de Physical Intelligence) combinado con el encoder tactil AnyTouch2, en una reimplementacion de estilo OpenVTLA sobre el framework `tactile_base`. El modelo esta entrenado para una tarea concreta de manipulacion: seleccionar una lata vacia (`empty_can_selection`) en simulacion con un sensor tactil GelSight Mini, usando 100 demostraciones.

La relevancia de esta ficha es acotada: no es un modelo de proposito general, sino un artefacto de investigacion reproducible que documenta una variante de entrenamiento con tres perdidas auxiliares adicionales (margen contrastivo tactil, enmascaramiento de caracteristicas visuales e InfoNCE tactil-vision). El checkpoint final corresponde al paso 19999 de un entrenamiento de 20k pasos con LoRA sobre los modulos `gemma_2b_lora` y `gemma_300m_lora`.

El repositorio ocupa 6,4 GB e incluye unicamente el checkpoint de inferencia (`params/` y `assets/`), sin el `train_state`. La evaluacion en simulador esta pendiente segun la propia model card, por lo que no hay resultados de rendimiento publicados. La licencia figura como `other`, sin terminos detallados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 con encoder tactil AnyTouch2 (reimplementacion OpenVTLA sobre `tactile_base`) |
| Parametros totales | no disponible (repo de 6,4 GB; LoRA sobre gemma_2b y gemma_300m) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de accion configurado: 50 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint openpi en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados) |
| Formato de pesos | checkpoint openpi (`params/`, `assets/` con norm stats) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5 adaptada al paradigma VLA: un backbone de lenguaje/vision (componentes Gemma de 2B y 300M parametros) acoplado a un cabezal de acciones, mas un modulo tactil basado en AnyTouch2 que aporta 18 tokens tactiles (`cls_pool2`). La entrada combina imagenes (camara de muneca procesadas con SigLIP) y senal tactil de un GelSight Mini simulado. El horizonte de prediccion de acciones es de 50 pasos.

El entrenamiento se realizo sobre el dataset `FVL-Lab/OpenViTac` (rev `5fb2757b88826917242adefd9196424ef8cf2d98`), tarea `empty_can_selection`, con 100 demostraciones en simulacion y caracteristicas AnyTouch2 precalculadas (`checkpoint-4frames`). Se ejecutaron 20k pasos con batch efectivo de 64 (16 x 4 de acumulacion de gradiente), usando LoRA sobre `gemma_2b_lora` y `gemma_300m_lora`, en una NVIDIA B200, con dos pausas para ejecuciones DAgger y reanudacion desde los checkpoints de los pasos 6000 y 16000.

La innovacion respecto al modelo base `yrpark/openvtla-empty_can_selection` son tres perdidas que solo afectan al entrenamiento (la inferencia es identica): un margen contrastivo tactil (`tactile_margin_weight`=1.0, `tactile_margin_base`=0.1, `tactile_neg_mode`=`batch_far`, `tactile_dref_pct`=50), un enmascaramiento de caracteristicas visuales sobre tokens post-SigLIP (`vision_feature_mask_prob`=0.1) y una alineacion InfoNCE de tokens tactiles agrupados contra tokens limpios de la camara de muneca (`tactile_align_weight`=0.1, `tactile_align_temp`=0.1). La perdida final de entrenamiento se situa en ~0.0020-0.0023, valor no comparable directamente con la perdida flow del modelo base por incluir los terminos auxiliares.

## Capacidades

- Generacion de acciones de manipulacion robotica para la tarea especifica `empty_can_selection` (seleccion de lata vacia) en simulacion.
- Fusion multimodal vision-tacto: integra imagenes de camara de muneca y senal de sensor GelSight Mini.
- Prediccion de trayectorias de accion con horizonte de 50 pasos.
- Inferencia determinista con el mismo grafo que el modelo base (las perdidas auxiliares no intervienen en inferencia).
- No soporta tool calling, function calling ni razonamiento multi-paso de proposito general.
- Capacidades multilingues: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades especiales: encoder tactil AnyTouch2 con 18 tokens; no dispone de modo thinking, vision general, audio ni otras capacidades fuera de la tarea.

## Casos de uso

- Investigacion en aprendizaje viso-tactil: sirve como punto de comparacion reproducible frente al modelo base `yrpark/openvtla-empty_can_selection` para medir el efecto de las tres perdidas auxiliares en la politica aprendida.
- Experimentos de ablacion de margen contrastivo tactil: permite evaluar si forzar que el tactil real supere al tactil erroneo mas lejano del batch mejora la robustez de la politica.
- Estudio de regularizacion visual: el enmascaramiento de tokens post-SigLIP al 10 % facilita analizar la dependencia de la politica respecto a la vision frente al tacto.
- Alineacion cross-modal tactil-vision: la perdida InfoNCE permite investigar representaciones compartidas entre ambos dominios en tareas de agarre y seleccion.
- Reproduccion de pipelines OpenVTLA: el checkpoint se sirve con `scripts/serve_policy.py` de `tactile_base`, util para validar infraestructura de despliegue de politicas pi0.5.
- Base para fine-tuning en tareas de manipulacion con contacto: al ser un LoRA sobre Gemma, puede reutilizarse como inicializacion en tareas relacionadas con sensores tactiles.
- Referencia para evaluacion en simulador: una vez completada la evaluacion pendiente, servira como baseline documentado de la variante `margin`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en simulador esta pendiente. La unica metrica reportada es la perdida final de entrenamiento (~0.0020-0.0023), que incluye los terminos auxiliares y no es comparable con la perdida del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 6,4 GB y el backbone incluye componentes Gemma de 2B y 300M parametros, por lo que se requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo en precision de entrenamiento (orientativamente por encima de 8-10 GB, sin dato confirmado).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA B200; para inferencia se recomienda GPU de datacenter (A100, H100, B200) por el tamano del checkpoint.
- Cabe en GPU de consumo: no confirmado; probable en RTX 4090 (24 GB) si el checkpoint se carga en precision reducida, aunque no hay dato verificado.
- Opciones de despliegue: servidor propio de `tactile_base` mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_empty_can_selection_margin --policy.dir checkpoints/openvtla_empty_can_selection_margin/ours/19999`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de politica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvtla-empty_can_selection-margin` (este) | no disponible (LoRA sobre gemma_2b + gemma_300m) | horizonte 50 | 20k pasos, 100 demos, 3 perdidas auxiliares | other | Hugging Face, checkpoint paso 19999 |
| `yrpark/openvtla-empty_can_selection` (base) | no disponible (misma arquitectura) | horizonte 50 | mismos datos y hiperparametros, sin perdidas auxiliares | other | Hugging Face |
| `yrpark/openvtla-insert_USB-margin` | no disponible | no disponible | variante margin sobre tarea `insert_USB` | other | Hugging Face |
| `yrpark/openvtla-gear_assembly-margin` | no disponible | no disponible | variante margin sobre tarea `gear_assembly` | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de tarea unica: solo esta entrenado para `empty_can_selection` en simulacion; no generaliza a otras tareas sin fine-tuning.
- Evaluacion pendiente: no hay resultados de simulador ni de robot real, por lo que se desconoce su rendimiento efectivo.
- Entrenado exclusivamente en simulacion con GelSight Mini; la transferencia a hardware real no esta validada.
- Dataset muy reducido (100 demostraciones), lo que limita la robustez y aumenta el riesgo de sobreajuste a la distribucion de la simulacion.
- La licencia `other` no detalla condiciones de uso comercial; debe consultarse con el autor antes de cualquier uso en produccion.
- No se incluye `train_state` en el repo, lo que impide reanudar el entrenamiento desde este checkpoint tal cual.
- La perdida de entrenamiento no es directamente comparable con la del modelo base por incluir terminos auxiliares; no debe usarse como metrica de calidad.
- Riesgo de alucinacion en el sentido de predicciones de accion no validas fuera de la distribucion de entrenamiento; no aplica el concepto de alucinacion textual al no ser un modelo conversacional.
- Idiomas y sesgos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-empty_can_selection-margin
- Modelo base: https://huggingface.co/yrpark/openvtla-empty_can_selection
- Repositorio de codigo `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Dataset `FVL-Lab/OpenViTac`: https://huggingface.co/datasets/FVL-Lab/OpenViTac
- Variante relacionada `yrpark/openvtla-insert_USB-margin`: https://huggingface.co/yrpark/openvtla-insert_USB-margin
- Variante relacionada `yrpark/openvtla-gear_assembly-margin`: https://huggingface.co/yrpark/openvtla-gear_assembly-margin
