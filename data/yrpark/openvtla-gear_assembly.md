# yrpark/openvtla-gear_assembly

## Resumen

openvtla_gear_assembly es un checkpoint de politica visomotactil para manipulacion robotica, desarrollado por el usuario yrpark. Se trata de una reimplementacion al estilo OpenVTLA del modelo pi0.5 combinada con el codificador tactil AnyTouch2, entrenada sobre la tarea de simulacion `gear_assembly` del conjunto de datos OpenViTac. El modelo resuelve el problema de generar acciones motoras a partir de observaciones visuales y senales tactiles en una tarea de ensamblaje de engranajes, e incorpora 18 tokens tactiles derivados de sensores GelSight Mini.

La relevancia de este checkpoint es acotada y experimental: es un baseline de un solo task, entrenado con 100 demostraciones y todavia no evaluado en simulador segun la propia model card. No obstante, resulta interesante como referencia para quienes investigan politicas visomotactiles con ajuste fino mediante LoRA sobre modelos fundacionales de robotica, y como ejemplo de integracion de un encoder tactil externo dentro de la pila openpi.

El repositorio ocupa 9.6 GB e incluye el checkpoint final de openpi en el directorio `19999/`, con pesos para inferencia, estado de entrenamiento para reanudar y estadisticas de normalizacion. La licencia figura como "other" y no se especifican idiomas ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (reimplementacion OpenVTLA) con encoder tactil AnyTouch2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (entrenamiento en fp16 en GPU) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/`, `train_state/`, `assets/`) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, un modelo fundacional visomotor, y le anade un flujo de entrada tactil mediante AnyTouch2, que aporta 18 tokens tactiles obtenidos por `cls_pool2` a partir de caracteristicas de 4 frames. El ajuste se realiza con LoRA sobre dos modulos (`gemma_2b_lora` y `gemma_300m_lora`), lo que indica que la base subyacente emplea componentes tipo Gemma de 2B y 300M parametros, aunque el total efectivo del modelo no se detalla. El horizonte de prediccion de acciones es de 50 pasos.

El entrenamiento se ejecuto durante 20.000 pasos con batch efectivo de 64 (16 x 4 de acumulacion de gradiente), semilla 42, programacion cosine con pico de learning rate 5e-5, sobre una unica RTX 3090 durante aproximadamente 4,6 dias (del 17 al 21 de noviembre de 2026). Los datos provienen de OpenViTac (rev 5fb2757b), tarea `gear_assembly` en simulacion con sensor GelSight Mini y 100 demostraciones. La perdida final de entrenamiento se situa en torno a 0,0003-0,0004. El codigo utilizado es `tactile_base` en el commit 57e0312, con configuracion `openvtla_gear_assembly` y experimento `baseline`.

## Capacidades

- Generacion de acciones motoras para una tarea de ensamblaje de engranajes en simulacion.
- Fusion de observacion visual y senal tactil (GelSight Mini) mediante 18 tokens tactiles.
- Prediccion de secuencias de accion con horizonte de 50 pasos.
- Ajuste fino eficiente mediante LoRA sobre los modulos Gemma de 2B y 300M.
- Reanudacion de entrenamiento gracias al estado incluido en `train_state/`.
- Normalizacion de entradas y salidas mediante estadisticas incluidas en `assets/`.
- No se documentan capacidades de tool calling, agentes, multilingue, vision general, audio ni modo de razonamiento.

## Casos de uso

- Investigacion en politicas visomotactiles: sirve como baseline reproducible para comparar variantes de fusion tactil en la misma tarea `gear_assembly`, partiendo del checkpoint `19999/` ya entrenado.
- Reentrenamiento y ablaciones: el estado de entrenamiento permite reanudar o afinar con LoRA sobre nuevos datos sin partir de cero, util para estudiar el efecto de mas demostraciones o de otras configuraciones tactiles.
- Evaluacion de encoders tactiles: al integrar AnyTouch2 con caracteristicas de 4 frames, permite medir el impacto del encoder en el exito de la tarea frente a alternativas.
- Prototipado en simulacion: adecuado para pipelines de simulacion que requieran una politica preentrenada de ensamblaje antes de invertir en datos reales.
- Reproduccion de experimentos: la configuracion, semilla, commit y estadisticas de normalizacion documentadas permiten replicar el entrenamiento en hardware de gama consumer (una RTX 3090).
- Estudio de eficiencia de entrenamiento: con 20.000 pasos y ~4,6 dias en una sola GPU, es un punto de referencia para estimar costes de ajuste de politicas fundacionales con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo aun no ha sido evaluado en el simulador.

## Requisitos de hardware

- Entrenamiento validado en una unica RTX 3090 (24 GB de VRAM) durante ~4,6 dias con LoRA y batch efectivo de 64.
- VRAM de inferencia estimada: no disponible; el repositorio ocupa 9.6 GB, lo que sugiere que los pesos en fp16 podrian caber en GPUs consumer de 24 GB, pero no se confirma.
- GPU recomendadas: no disponibles de forma oficial; por el entrenamiento documentado, una RTX 3090 es suficiente para ajuste con LoRA.
- Despliegue: la model card remite a la pila `tactile_base` y al formato de checkpoint openpi (`params/` para inferencia), colocando el directorio en `checkpoints/openvtla_gear_assembly/baseline/19999`.
- Opciones tipo vLLM, llama.cpp, Ollama o TGI: no aplicables ni documentadas para este tipo de modelo de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openvtla_gear_assembly | no disponible (LoRA sobre Gemma 2B + 300M) | no disponible (horizonte 50) | no evaluado en simulador | other | Hugging Face (yrpark) |
| yrpark/openvtla-insert_USB | misma base (mismo codigo de entrenamiento) | no disponible | no disponible | other | Hugging Face (yrpark) |
| pi0.5 (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con el checkpoint hermano `yrpark/openvtla-insert_USB`, entrenado con el mismo codigo y configuracion pero sobre otra tarea. No se dispone de datos de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- Modelo de un solo task: entrenado exclusivamente para `gear_assembly`; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: la model card confirma que no se ha evaluado en simulador, por lo que no hay evidencia de tasa de exito.
- Datos limitados: solo 100 demostraciones en simulacion, lo que incrementa el riesgo de sobreajuste (perdida final muy baja, ~0,0003-0,0004).
- Dominio restringido a simulacion con sensor GelSight Mini; la transferencia a hardware real no esta documentada.
- Licencia "other": no se detallan condiciones de uso comercial; es necesario consultar los terminos del autor antes de cualquier despliegue productivo.
- Dependencia de la pila `tactile_base` y de un commit concreto (57e0312) para reproducir la inferencia.
- Sin informacion sobre sesgos, alucinacion o soporte idiomatico, al no ser un modelo linguistico.
- Riesgo de deriva si se usa fuera de la configuracion y estadisticas de normalizacion incluidas en `assets/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly
- Checkpoint hermano: https://huggingface.co/yrpark/openvtla-insert_USB
- Codigo tactile_base: https://github.com/YuriPark0123/tactile_base
- Dataset OpenViTac: https://huggingface.co/datasets/FVL-Lab/OpenViTac
