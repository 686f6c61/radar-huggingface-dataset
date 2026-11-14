# wayne-SFT/Llama-3.2-3B-Instruct-SFT-ScienceWorld

## Resumen

Llama-3.2-3B-Instruct-SFT-ScienceWorld es un ajuste fino supervisado (SFT) de `meta-llama/Llama-3.2-3B-Instruct`, publicado por el usuario wayne-SFT. No se trata de un modelo de proposito general, sino de un checkpoint de arranque para aprendizaje por refuerzo (RL) sobre el entorno ScienceWorld, un banco de pruebas de razonamiento cientifico y resolucion de tareas interactivas. El autor lo describe como un punto de partida de "behavior cloning" entrenado exclusivamente con trayectorias expertas recogidas sobre los objetivos de entrenamiento de ScienceWorld (nombre interno del dataset `sw_sft_v3_hash2`).

El modelo conserva la arquitectura y el tokenizador del Llama 3.2 3B Instruct original (3.212.749.824 parametros) y solo modifica la plantilla de chat, fijando la fecha actual a "26 Jul 2024" en lugar de usar `strftime_now`. El ajuste fue de parametros completos, con learning rate 1e-5, batch global 64 y longitud maxima de secuencia 1792, detenido en el paso global 326 (epoca 2 de 3). Los pesos se guardan en fp32 (255 tensores F32) en safetensors, aunque el campo `dtype` de `config.json` indica `bfloat16`.

Su relevancia es acotada: es un artefacto de investigacion para pipelines de RL sobre agentes en entornos cientificos, no un modelo para produccion general. El dato mas util publicado es su rendimiento en el conjunto de desarrollo de ScienceWorld (1796 variaciones, seed 0, motor 1.2.3): tasa de exito del 39,3% y puntuacion de 63,7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino de parametros completos |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max sequence length 1792) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (3 shards, fp32) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, revision `0cb88a4f764b7a12671c53f0838cd831a0843b95`, un transformer decoder-only denso de 3,2 mil millones de parametros. El ajuste es de parametros completos (full-parameter SFT) sobre trayectorias expertas recogidas por el autor en ScienceWorld, limitadas a los objetivos de entrenamiento del entorno. La configuracion reportada es learning rate 1e-5, batch global 64 y longitud maxima de secuencia 1792; el checkpoint publicado corresponde al paso global 326, es decir, la epoca 2 de 3.

No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La unica modificacion sobre los archivos del modelo base es la plantilla de chat, donde la fecha actual se fija a "26 Jul 2024" en lugar de calcularse dinamicamente con `strftime_now`. Los pesos se guardan tal como se entrenaron, en fp32, sin conversion posterior; el campo `dtype` de `config.json` indica `bfloat16`, lo que puede generar confusion al cargar el modelo.

## Capacidades

- Generacion de texto conversacional y razonamiento de proposito general heredados del Llama 3.2 3B Instruct base.
- Ejecucion de tareas interactivas de tipo agente en el entorno ScienceWorld: manipulacion de objetos, experimentos y objetivos cientificos por pasos.
- Behavior cloning de trayectorias expertas: el modelo imita el estilo de accion de los expertos usados en el SFT.
- Soporte de plantilla de chat conversacional (modificada respecto al base para fijar la fecha).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling, function calling, vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Checkpoint de arranque para RL sobre ScienceWorld: se usa como politica inicial (SFT) antes de aplicar tecnicas de refuerzo, ya que el autor lo publica explicitamente con ese proposito.
- Investigacion en agentes interactivos: permite reproducir y comparar curvas de aprendizaje en un entorno cientifico estandarizado con seed y version de motor documentados.
- Evaluacion de behavior cloning: sirve como linea base para medir cuanto mejora el RL frente al SFT puro en tasa de exito y puntuacion.
- Estudio de recoleccion de trayectorias expertas: util para analizar como la calidad y cobertura del dataset `sw_sft_v3_hash2` afecta al rendimiento del agente.
- Experimentos de ajuste fino sobre Llama 3.2 3B: su tamano (3,2B) permite iterar en una sola GPU de gama alta sin infraestructura distribuida.
- Reproducibilidad de resultados: al publicar hashes sha256 de todos los archivos, facilita la verificacion de experimentos en entornos de investigacion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ScienceWorld dev (1796 variaciones, seed 0, motor 1.2.3) | Tasa de exito | 39,3% |
| ScienceWorld dev (1796 variaciones, seed 0, motor 1.2.3) | Puntuacion | 63,7 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 12,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene convertir a bf16 o cuantizar.
- VRAM estimada en bf16: aproximadamente 6,4 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para entrenamiento o inferencia en fp32/bf16; RTX 4090 (24 GB) suficiente para inferencia en bf16 y para ajuste fino con tecnicas de ahorro de memoria.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB requeriria cuantizacion a 8 o 4 bits (no se publican pesos cuantizados).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no estan documentados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-SFT-ScienceWorld | 3,21B | no disponible | SFT sobre ScienceWorld para RL | Llama 3.2 Community | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | no disponible en la informacion | Instruct de proposito general | Llama 3.2 Community | Hugging Face |
| Alternativas especializadas en agentes ScienceWorld | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros modelos especializados en ScienceWorld no esta disponible en la informacion proporcionada. El unico punto de referencia objetivo es el modelo base, del que este checkpoint hereda arquitectura y tokenizador.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado ni validado para uso en produccion general; su dominio esta restringido a ScienceWorld.
- Rendimiento modesto: 39,3% de tasa de exito en dev indica que falla en mas de la mitad de las variaciones evaluadas.
- Entrenado solo con objetivos de entrenamiento de ScienceWorld: puede generalizar mal a objetivos de test o a entornos distintos.
- Pesos en fp32 con `dtype` declarado como `bfloat16` en `config.json`: riesgo de confusion al cargar y de uso excesivo de memoria si no se convierte explicitamente.
- Plantilla de chat modificada con fecha fija ("26 Jul 2024"): puede introducir sesgos temporales o comportamientos inconsistentes fuera del entorno previsto.
- Sesgos y riesgo de alucinacion: no documentados en la informacion proporcionada, pero heredados del modelo base Llama 3.2.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingue adecuado.
- Licencia Llama 3.2 Community: impone restricciones de uso comercial y obligaciones de atribucion; deben revisarse `LICENSE.txt` y `USE_POLICY.md` antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wayne-SFT/Llama-3.2-3B-Instruct-SFT-ScienceWorld
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE.txt
- Politica de uso del modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/USE_POLICY.md
- Entorno ScienceWorld: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
