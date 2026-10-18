# ya9919/qwen3.5-4b-base-finance-lora-head-50k

## Resumen

`ya9919/qwen3.5-4b-base-finance-lora-head-50k` es un adaptador LoRA con una cabeza de decisión escalar compartida, publicado por el usuario ya9919 sobre el modelo base `Qwen/Qwen3.5-4B-Base`. No es un modelo generativo autónomo: se distribuye como un paquete de pesos (adaptador PEFT en FP32 más `head.pt`) que requiere descargar por separado el backbone oficial de Qwen y su tokenizador. Su función es puntuar opciones candidatas en preguntas de elección múltiple del dominio financiero, no producir texto libre.

El adaptador se entrenó con 50.000 filas distintas de un split de entrenamiento de QA en inglés procedente de cuatro fuentes (el autor las identifica como `chfs-cgss-cfps-clds`). La evaluación se realizó sobre un subconjunto común CHFS/CGSS congelado de 240.458 filas y 119 versiones de pregunta, con una precisión observada de 0,7373 y un F1 macro por pregunta de 0,3662, sin predicciones inválidas.

Su relevancia es acotada y de carácter reproducible: es un artefacto de investigación ligado al repositorio `mas-simulation`, con licencia Apache-2.0 para los pesos pero con términos de uso específicos sobre los datos de entrenamiento. La separación tan marcada entre precisión (0,74) y F1 macro por pregunta (0,37) sugiere un fuerte desequilibrio en la distribución de respuestas correctas entre las 119 versiones de pregunta, un dato clave para cualquier evaluador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-4B-Base) mas cabeza de decision escalar compartida para puntuar candidatos |
| Parametros totales | 4B en el backbone base; numero de parametros del adaptador y de la cabeza no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens como maximo en inferencia; entradas superiores lanzan error, sin truncado silencioso |
| Tipos de cuantizacion | no disponible; los pesos incluidos se almacenan en FP32 (cabeza y adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (pesos); los datos de entrenamiento retienen los terminos `chfs-cgss-cfps-clds-source-data-terms` |
| Formato de pesos | safetensors (`adapter/adapter_model.safetensors`) + `head.pt` (PyTorch) + `adapter/adapter_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA acoplado a un backbone Qwen3.5-4B-Base, la release oficial solo preentrenada, mas una cabeza escalar compartida que produce una puntuacion por candidato. La inferencia no usa una cabeza de clasificacion estandar de AutoModel: el paquete incluye el helper `qwen_decision.py` con `DecisionPredictor`, que puntua cada `candidate_id` mediante un forward independiente con el estado, la pregunta y todas las opciones completas en formato de texto crudo. Las caracteristicas normalizadas se mantienen en FP32 antes de la cabeza FP32, y se conserva la politica de carga PEFT original.

El entrenamiento uso 50.000 filas distintas del split de entrenamiento de QA en ingles de cuatro fuentes, con metodo LoRA y esa unica etapa (50.000 exposiciones terminales de fila, 50.000 exposiciones acumuladas, coincidentes con las filas distintas). La seleccion de checkpoint se hizo sobre un dev20k fijo, primero por F1 macro por pregunta y despues por exactitud; el dev completo (412.873 filas) se uso para seleccionar el metodo Qwen4B, y el test final no se empleo para seleccion. No se documentan en la informacion disponible datos sobre volumen de tokens, composicion exacta del dataset, ni uso de RLHF o DPO.

## Capacidades

- Puntuacion de opciones candidatas en preguntas de eleccion multiple de dominio financiero, devolviendo un score escalar por candidato.
- Procesamiento conjunto de estado, instrucciones, criterios y lista ordenada de `candidate_ids` en una sola pasada de inferencia.
- Evaluacion sobre encuestas financieras y sociales (CHFS, CGSS, CFPS, CLDS) segun las cuatro fuentes del entrenamiento.
- Manejo explicito de entradas largas: error controlado por encima de 2048 tokens en lugar de truncado silencioso.
- Integracion con el ecosistema PEFT (Transformers 5.19.0, PEFT 0.21.0, aceleracion opcional FLA/causal-conv con fallback oficial de Torch).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: limitada a ingles segun la model card.

## Casos de uso

- Respuesta automatica a encuestas financieras: el modelo puntua que opcion de una pregunta CHFS/CGSS encaja con el estado declarado del encuestado, sustituyendo la codificacion manual en lotes de cientos de miles de filas.
- Imputacion controlada de respuestas faltantes: dado un cuestionario incompleto, se puntuan las opciones restantes y se marca como candidata la de mayor score, con el F1 macro por pregunta como metrica de control de calidad.
- Auditoria de cuestionarios: comparando los scores por `candidate_id` se detectan preguntas con opciones practicamente indistinguibles para el modelo, lo que senala redacciones ambiguas o categorias solapadas.
- Construccion de un clasificador de riesgo financiero por niveles: si las opciones se ordenan de menor a mayor exposicion, el score del modelo sirve como señal ordinal dentro de un pipeline de scoring, siempre con umbrales calibrados sobre dev.
- Generacion de datos sinteticos etiquetados: el modelo actua como etiquetador debil sobre corpus no anotados para preentrenar o aumentar un modelo mayor, filtrando por margen entre el primer y el segundo candidato.
- Reproduccion de experimentos del sistema Fin-Laya: el adaptador permite replicar la rama de QA del repositorio `mas-simulation` en un entorno fijado (Python 3.12, PyTorch 2.12.1+cu126) sin depender de servicios externos.
- Evaluacion comparativa de backbones: al ser un adaptador PEFT sobre un base concreto, sirve para medir la contribucion del backbone frente a la cabeza en tareas de QA financiero.

## Benchmarks y rendimiento

Evaluacion sobre etiquetas observadas en el subconjunto comun CHFS/CGSS congelado de 240.458 filas y 119 versiones de pregunta:

| Metrica | Resultado |
|---|---:|
| Accuracy | 0,737288840 |
| F1 macro por pregunta | 0,366225289 |
| Predicciones invalidas | 0 |

Nota: el split de test completo en ingles del repositorio de origen tiene 418.597 filas, un denominador distinto al del subconjunto evaluado. El autor indica que los resultados de simulacion financiera y los resultados historicos del sistema Fin-Laya sobre datos completos se reportan por separado y no se incluyen en esta model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del backbone de 4B: en FP32 en torno a 16-18 GB; en BF16/FP16 en torno a 9-10 GB; en cuantizacion de 8 bits aproximadamente 5 GB y en 4 bits aproximadamente 3 GB. El adaptador y la cabeza (FP32) anaden un consumo marginal frente al backbone.
- La ruta de inferencia documentada no especifica soporte de cuantizacion del adaptador; el script oficial carga el adaptador en FP32 y la cabeza en FP32, por lo que la cuantizacion del backbone requeriria validacion propia.
- GPU recomendadas: A100 40 GB o H100 para procesar lotes grandes de candidatos en FP32/BF16; RTX 4090 (24 GB) suficiente para el backbone en BF16 o FP32 con lotes pequenos.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en BF16, y en 8 GB con cuantizacion de 8 bits, siempre que se valide la compatibilidad del adaptador.
- Despliegue: no es compatible de forma directa con vLLM, TGI, llama.cpp u Ollama, ya que requiere el helper `qwen_decision.py` y la cabeza escalar externa. La ejecucion prevista es `python qwen_decision.py --package . --upstream-model Qwen/Qwen3.5-4B-Base --input request.json --device cuda`, o mediante `DecisionPredictor.from_pretrained`.
- Coste computacional: cada candidato exige un forward completo e independiente sobre estado, pregunta y todas las opciones, por lo que el coste escala linealmente con el numero de `candidate_ids` de la pregunta.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 0,1 GB; el backbone Qwen3.5-4B-Base se descarga aparte.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Tipo | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| qwen3.5-4b-base-finance-lora-head-50k | 4B (backbone) + adaptador | 2048 tokens | Adaptador LoRA + cabeza de decision para QA de eleccion multiple | apache-2.0 (datos con terminos propios) | accuracy 0,7373; F1 macro 0,3662 en CHFS/CGSS |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | Transformer decoder-only preentrenado, sin cabeza de decision | no disponible | no disponible |
| Otros adaptadores financieros de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion de texto libre: sin la cabeza y el helper `qwen_decision.py` no reproduce el comportamiento evaluado.
- Brecha acusada entre accuracy (0,7373) y F1 macro por pregunta (0,3662): el rendimiento es muy desigual entre las 119 versiones de pregunta, con preguntas practicamente no resueltas. No usar la accuracy agregada como unica metrica de validacion.
- Limite duro de 2048 tokens: estados o cuestionarios largos provocan error en lugar de truncado, lo que exige preprocesado o troceado por parte del integrador.
- Solo ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Entrenado con 50.000 filas de un unico split y una sola etapa; el autor no documenta tokens, composicion ni tecnicas de alineacion como RLHF o DPO.
- Riesgo de alucinacion estructural bajo (es una tarea de puntuacion cerrada sobre candidatos), pero la cabeza puede producir scores sobreconfiados y no calibrados; no se publican curvas de calibracion.
- Los pesos son Apache-2.0, pero los datos de entrenamiento retienen los terminos `chfs-cgss-cfps-clds-source-data-terms`; el uso comercial de derivados debe verificar esas condiciones adicionales.
- Sesgos no documentados: al entrenarse sobre encuestas chinas (CHFS, CGSS, CFPS, CLDS) en ingles, puede arrastrar sesgos de composicion demografica y de traduccion del corpus original.
- Artefacto de investigacion con 0 descargas y 0 likes, sin pipeline declarado ni resultados de simulacion financiera incluidos en la model card; no hay evidencia de uso en produccion.
- Entorno de ejecucion muy especifico (Python 3.12, PyTorch 2.12.1+cu126, Transformers 5.19.0, PEFT 0.21.0) que puede limitar la integracion en stacks existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ya9919/qwen3.5-4b-base-finance-lora-head-50k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de reproduccion e informacion agregada: https://github.com/KataDavidXD/mas-simulation
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados no relacionados del dominio bandlab.com), por lo que no se dispone de papers, blogs ni demos adicionales.
