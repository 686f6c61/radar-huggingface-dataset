# tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_split_freeze_b32

## Resumen

`pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_split_freeze_b32` es un ajuste fino del modelo de politica robotica `lerobot/pi05_base` (pi0.5), desarrollado por el usuario `tc-huang-mahjong`. El modelo esta especializado en una tarea concreta de manipulacion robotica: la interaccion con fichas de mahjong en un entorno simulado con Isaac Lab, sobre un brazo robotico SO-101. No es un modelo de lenguaje generalista, sino una politica visomotora (vision-language-action) que traduce observaciones visuales y de estado en acciones de control del robot.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigacion reproducible, con hiperparametros de entrenamiento documentados de forma exhaustiva y con el codigo fuente vinculado a un commit concreto. Sirve como ejemplo de flujo de trabajo completo de LeRobot para ajustar pi0.5 sobre un dataset propio, y como referencia para quien quiera replicar o extender experimentos de manipulacion con fichas de mahjong en simulacion.

El modelo hereda la arquitectura de pi0.5 (basada en PaliGemma: vision encoder SigLIP, modelo de lenguaje Gemma y un "action expert") y la licencia Gemma. El repositorio ocupa 16,6 GB, lo que refleja el peso de los checkpoints en float32 junto con el estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (pi0.5) sobre PaliGemma: SigLIP + Gemma + action expert |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (formato nativo de LeRobot) |

## Arquitectura y entrenamiento

pi0.5 es una politica visomotora que combina un encoder visual SigLIP, un modelo de lenguaje Gemma y un modulo especifico de generacion de acciones (action expert). En este ajuste fino, el autor congela el modelo de lenguaje Gemma, sus embeddings de tokens y la `lm_head`, y entrena unicamente el encoder SigLIP, el proyector multimodal y el action expert. Esto reduce el coste de entrenamiento y preserva el conocimiento linguistico preentrenado, a la vez que adapta la parte perceptiva y motora a la tarea.

El entrenamiento se realizo con LeRobot en el commit `38b975c5`, sobre el dataset `tc-huang-mahjong/mahjong_v1_tray07_twos_ovphysx_detour_vary_off5`, con `batch_size=16`, 24 000 pasos, acumulacion de gradientes de 2, `bf16` como precision mixta, `fused=true` para el optimizador, `compile_model=true` y `scheduler_decay_steps=24000` con `scheduler_warmup_steps=750`. Los pesos y el estado del optimizador se guardan en float32 con autocast bf16. El preprocesador no recorta las camaras y presenta `observation.images.front_cam` como dos vistas solapadas (`front_cam` y `front_cam_right`), cada una de 224 x 224, mediante recortes cuadrados implementados en `src/models/split_camera.py`. No se documenta el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de acciones de control para un brazo robotico SO-101 en simulacion (Isaac Lab), a partir de observaciones visuales y de estado.
- Percepcion visual multi-vista: procesa dos vistas solapadas de 224 x 224 (`front_cam` y `front_cam_right`).
- Manipulacion de objetos especificos: fichas de mahjong con caras adaptadas de una imagen de Wikimedia Commons.
- Ejecucion de una tarea concreta de "detour" sobre una bandeja (`tray07`) con configuracion de "twos" y variacion `off5`.
- Integracion con el ecosistema LeRobot (entrenamiento, evaluacion y despliegue de politicas).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, codigo, matematicas ni audio.
- Capacidades multilingues: no disponibles; el modelo no esta pensado para generacion de texto.

## Casos de uso

- Replicacion de experimentos de manipulacion: el modelo sirve como checkpoint de referencia para reproducir el entrenamiento documentado, comparando resultados con el mismo dataset y los mismos hiperparametros.
- Investigacion en ajuste fino de politicas visomotoras: permite estudiar el efecto de congelar el modelo de lenguaje y entrenar solo SigLIP, el proyector y el action expert en tareas de manipulacion acotadas.
- Desarrollo de entornos de simulacion con Isaac Lab: el checkpoint puede integrarse en pipelines de evaluacion de politicas sobre el brazo SO-101 en escenarios de bandeja con fichas de mahjong.
- Generacion de datos sinteticos y aumentacion: las trayectorias generadas por la politica pueden usarse para ampliar datasets de manipulacion o para analizar modos de fallo.
- Benchmarking interno de LeRobot: sirve como linea base para comparar variantes de preprocesado (por ejemplo, con y sin recorte de camaras) y de configuracion de congelacion.
- Docencia y formacion en robotica: ejemplo completo y trazable de un pipeline de entrenamiento de una politica VLA, con hiperparametros, commits y dataset publicados.
- Pruebas de despliegue en simulacion antes de transferir a un robot fisico SO-101, siempre que se valide la brecha sim2real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 16,6 GB incluye pesos en float32 y estado del optimizador, por lo que el checkpoint de inferencia es sustancialmente menor, pero no se documenta la cifra exacta.
- GPU recomendadas: no disponible. El entrenamiento uso precision mixta bf16, `compile_model=true` y `fused=true`, lo que sugiere GPUs con soporte de bf16 (por ejemplo, familia Ampere o superior), pero no se especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de un modelo VLA basado en PaliGemma, es probable que requiera GPUs con VRAM suficiente, pero no hay datos confirmados.
- Opciones de despliegue: LeRobot (libreria nativa), con integracion en Isaac Lab para simulacion. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 mahjong) | no disponible | no disponible | Manipulacion de fichas de mahjong en simulacion | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | Politica VLA generalista | gemma | Hugging Face (modelo base) |
| Otros ajustes de pi0.5 en LeRobot | no disponible | no disponible | Segun dataset | gemma | Hugging Face (no se detallan alternativas concretas) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo es valido para la tarea y el entorno de simulacion con los que se entreno; no generaliza a otras tareas de manipulacion sin reentrenamiento.
- Riesgo de sobreajuste al dataset concreto (`tray07`, `twos`, `off5`); el rendimiento fuera de esa configuracion no esta documentado.
- No se documentan sesgos, pero al entrenarse sobre un dataset especifico de simulacion, puede heredar sesgos de distribucion de ese dataset.
- Riesgo de alucinacion en el sentido de generar acciones no validas o fuera de distribucion; no hay evaluacion publicada de robustez.
- Limitaciones de contexto e idioma: no aplica como modelo de texto, pero no se documenta la ventana de contexto ni el soporte linguistico.
- Restricciones de licencia: sujeto a los Gemma Terms of Use y la Gemma Prohibited Use Policy; el uso comercial esta condicionado por dichos terminos. Los pesos son modificados respecto al modelo base mediante ajuste fino.
- Las imagenes de fichas de mahjong estan adaptadas de una obra bajo CC BY-SA 4.0 (Cangjie6, Wikimedia Commons); se debe respetar la atribucion y la licencia de la obra original.
- No hay garantia de transferencia sim2real; el modelo se entreno en Isaac Lab y su comportamiento en un robot fisico no esta validado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_tray07_twos_ovphysx_detour_vary_off5_split_freeze_b32
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_tray07_twos_ovphysx_detour_vary_off5
- Codigo del entrenamiento (commit): https://github.com/tc-huang/mahjong-lab/tree/b9a5ebe24be212ad54975d453ea8c0e55d9c62c6
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (Wikimedia Commons): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
