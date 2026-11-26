# you2who/AMAM-rmbench-vlm

## Resumen

AMAM-rmbench-vlm es un adaptador LoRA (PEFT) publicado por el usuario you2who en el marco del proyecto AMAM (AgentMem-Action-Model), orientado a robótica y a la evaluacion de modelos vision-lenguaje-accion. No se trata de un modelo completo, sino de un conjunto de pesos incrementales que debe cargarse sobre el modelo base Qwen/Qwen3-VL-4B-Instruct; el repositorio incluye ademas la configuracion de processor y tokenizer necesaria para su uso. La version congelada se identifica como `fullv7`.

El adaptador forma parte de un ecosistema mas amplio que incluye un modelo VLA (vision-lenguaje-accion), un conjunto de anotaciones y un protocolo de benchmark propio (rmbench) descrito en el paper arXiv:2609.11308. Su funcion prevista es la de componente de evaluacion o "reward model" dentro de ese protocolo, no la de un asistente generalista.

Su relevancia es acotada: se publica bajo licencia CC BY 4.0, con 0 descargas y 0 likes en el momento de la consulta, y el propio autor advierte que debe emplearse junto con el protocolo de benchmark y el modelo Action correspondientes. No hay informacion publicada sobre idiomas soportados, volumen de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible (adaptador; el base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 (contribuciones AMAM); el modelo base y material de terceros conservan sus propias licencias |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado sobre Qwen/Qwen3-VL-4B-Instruct, un modelo vision-lenguaje de 4.000 millones de parametros. El repositorio no incluye estado de optimizador ni de reanudacion de entrenamiento, solo los pesos finales del adaptador y la configuracion de processor/tokenizer. La integracion prevista requiere descargar el repositorio completo en `models/rmbench/vlm/fullv7` y situar el modelo base en `models/base/Qwen3-VL-4B-Instruct`.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor remite al paper (arXiv:2609.11308) y al repositorio de codigo para el protocolo de benchmark y la metodologia, que no se han podido verificar en esta ficha.

## Capacidades

- Evaluacion dentro del protocolo rmbench de AMAM, presumiblemente como modelo de recompensa o verificador sobre observaciones visuales y acciones.
- Procesamiento vision-lenguaje heredado del modelo base Qwen3-VL-4B-Instruct (interpretacion de imagenes junto con instrucciones textuales).
- Integracion con el modelo Action y el conjunto de anotaciones del mismo proyecto.
- No se documentan capacidades de tool calling, razonamiento multi-paso, modo thinking, audio ni soporte multilingue explicito.
- No se documenta comportamiento como asistente conversacional generalista.

## Casos de uso

- Evaluacion de politicas roboticas: usar el adaptador como componente de puntuacion dentro del protocolo rmbench para comparar trayectorias o acciones generadas por el modelo VLA del mismo proyecto.
- Reproduccion de resultados del paper: cargar el adaptador con la version congelada `fullv7` y el modelo base indicado para replicar las cifras publicadas en arXiv:2609.11308.
- Investigacion en reward modeling multimodal: servir de punto de partida para estudiar como un LoRA sobre un VLM de 4B modela preferencias o recompensas en tareas de manipulacion.
- Experimentacion con PEFT en robotica: analizar el efecto de un adaptador de bajo rango sobre un VLM base sin reentrenar los 4B parametros completos.
- Base para fine-tuning posterior: al ser un adaptador PEFT, puede combinarse o compararse con otros adaptadores sobre el mismo modelo base en pipelines de investigacion.
- Docencia y divulgacion: ilustrar el flujo completo de un benchmark de robotica con separacion entre modelo VLM, modelo VLA y anotaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el modelo base Qwen3-VL-4B-Instruct en precision bf16 requiere del orden de 8-10 GB solo para pesos, mas memoria para activaciones y cache KV; el adaptador anade una cantidad marginal.
- GPU recomendadas: no especificadas por el autor. Para el base en bf16 son razonables GPU con 16-24 GB (RTX 4090, L4, A10G); para despliegues mayores, A100 o H100.
- GPU de consumo: previsiblemente viable en RTX 4090 y, con cuantizacion del base, en GPUs de 12-16 GB, aunque no hay datos confirmados.
- Opciones de despliegue: carga via `peft` + `transformers` con el processor incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMAM-rmbench-vlm | Adaptador sobre base de 4B | no disponible | LoRA PEFT para robotica | CC BY 4.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | VLM completo | licencia del autor original | Hugging Face |
| AMAM-rmbench-vla | no disponible | no disponible | VLA del mismo proyecto | CC BY 4.0 (contribuciones AMAM) | Hugging Face |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen/Qwen3-VL-4B-Instruct y la configuracion de processor/tokenizer incluida en el repositorio.
- Uso previsto restringido al protocolo de benchmark AMAM y al modelo Action correspondiente; emplearlo fuera de ese contexto no esta validado.
- Ausencia total de datos sobre sesgos, tasas de alucinacion y comportamiento en dominios ajenos a la robotica.
- Sin informacion sobre idiomas soportados ni calidad multilingue.
- La licencia CC BY 4.0 cubre solo las contribuciones de AMAM; el modelo base, los datasets y material de terceros mantienen sus propios terminos, que deben respetarse en uso comercial.
- Proyecto con 0 descargas y 0 likes: sin validacion externa ni comunidad que reporte incidencias.
- No se incluye estado de optimizador ni de reanudacion, por lo que no es posible continuar el entrenamiento desde este artefacto.
- El identificador arXiv:2609.11308 y las fechas del repositorio (creado en 2026) no han podido verificarse de forma independiente en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/you2who/AMAM-rmbench-vlm
- Modelo VLA relacionado: https://huggingface.co/you2who/AMAM-rmbench-vla
- Anotaciones (dataset): https://huggingface.co/datasets/you2who/AMAM-rmbench-annotations
- Codigo: https://github.com/utomm/AgentMem-Action-Model
- Proyecto: https://agent-mem-action-model.github.io/
- Paper: https://arxiv.org/abs/2609.11308
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
