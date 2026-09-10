# thefinalboss/kahnn-nano

## Resumen

Kahnn nano es un modelo de lenguaje experimental de muy pequeno tamano (~1,8 millones de parametros) que no utiliza la arquitectura Transformer. Esta inspirado en principios de neurociencia y, segun las etiquetas y la model card, combina osciladores de Kuramoto con representaciones de hipervectores y un mecanismo de aprendizaje continuo (*continuous learning*) orientado a la memoria de largo plazo. El modelo lo publica el usuario de HuggingFace `thefinalboss`, mientras que el codigo de entrenamiento, ensenanza y generacion vive en el repositorio de GitHub `AFKmoney/kahnn`, lo que sugiere un proyecto pequeno de investigacion personal.

El problema que aborda no es la generacion de texto fluida, sino la edicion de memoria sin reentrenamiento: el checkpoint `ckpt_teach.pt` incorpora un hecho concreto («La capitale du Canada est Ottawa») mediante un script de ensenanza (`teach.py`), y el autor reporta una coherencia de memoria de ~1,0 sobre ese hecho exacto, frente a ~0,43 en una sonda parcial. Con un presupuesto de ~36,99 millones de tokens de preentrenamiento en CPU y una perdida de entropia cruzada de ~10,5, el propio autor reconoce que la generacion libre sigue siendo debil y recomienda priorizar la memoria tipo *engram* sobre la fluidez.

Su relevancia actual es, por tanto, la de una prueba de concepto reproducible en hardware muy modesto: explora si una arquitectura no Transformer puede adquirir y recuperar hechos de forma selectiva a escala de millones de parametros, un regimen donde los Transformers convencionales apenas tienen capacidad de almacenamiento parametrico util.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No Transformer; inspirada en neurociencia (osciladores de Kuramoto e hipervectores, segun etiquetas y model card) |
| Parametros totales | ~1,8 millones (indicado como "Kahnn nano (~1.8M)") |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | Ingles (en) y frances (fr) |
| Licencia | MIT en HuggingFace; la model card remite a la licencia del repositorio de GitHub |
| Formato de pesos | PyTorch nativo (`.pt`): `ckpt_final.pt` y `ckpt_teach.pt`; no se ofrecen safetensors, GGUF ni ONNX |
| Tamano del repositorio | 1,7 GB |
| Libreria | PyTorch |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card describe explicitamente un modelo **no Transformer** y "inspirado en neurociencia", procedente del repositorio `AFKmoney/kahnn`. Las etiquetas asociadas (`kahnn`, `kuramoto`, `hypervector`, `continuous-learning`) apuntan a una combinacion de osciladores acoplados de Kuramoto como mecanismo dinamico y de hipervectores (representaciones de alta dimension tipo *hyperdimensional computing*) como sustrato de memoria. No se detalla en la informacion disponible el numero de capas, la dimension del estado oculto, el mecanismo de atencion o su ausencia, ni el algoritmo de optimizacion empleado, por lo que no es posible reconstruir la topologia exacta.

El entrenamiento documentado es un preentrenamiento en CPU con un presupuesto tipo Chinchilla a escala minima: ~36,99 millones de tokens procesados, con un rendimiento medio de ~1362 tokens/s al final del run (segun `docs/CPU_RUN_LOG.md`), y una perdida de entropia cruzada que aun se situaba en ~10,5. Esa perdida indica que el modelo no ha convergido a una distribucion de lenguaje util y que la generacion abierta es pobre. La parte diferencial es el flujo de **aprendizaje continuo**: los scripts `teach.py` y el codigo de olvido (*forget*) permiten insertar o eliminar hechos en la memoria del modelo sin reentrenar, y el checkpoint `ckpt_teach.pt` demuestra la incorporacion de un hecho aislado con coherencia de memoria cercana a 1,0. No se menciona uso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generacion de texto basica: el script `generate.py` permite generar a partir de un *prompt* (`--prompt "Once upon a time"`) en CPU, aunque el propio autor califica la generacion como debil a este tamano y presupuesto.
- Memoria de hechos de larga duracion (*lifelong engram memory*): insercion de hechos concretos y recuperacion con alta coherencia sobre el hecho exacto ensenado (~1,0).
- Sondeo parcial de memoria: recuperacion degradada (~0,43 de coherencia) cuando la consulta no coincide exactamente con el hecho almacenado.
- Olvido selectivo: el repositorio incluye codigo de *forget*, es decir, eliminacion de informacion previamente ensenada.
- Aprendizaje continuo sin reentrenamiento completo: el flujo *teach/probe* opera sobre checkpoints existentes.
- Soporte multilingue limitado a ingles y frances, segun el campo `language` de la model card.
- Ejecucion en CPU: todo el pipeline documentado (preentrenamiento, ensenanza y generacion) se ejecuta sin GPU.
- No hay evidencia de soporte de *tool calling*, function calling, agentes multi-paso, vision, audio, modo de razonamiento explicito ni matemáticas avanzadas en la informacion disponible.

## Casos de uso

- **Investigacion en arquitecturas no Transformer**: usar el repositorio `AFKmoney/kahnn` y los checkpoints publicados como banco de pruebas para medir si los osciladores de Kuramoto con hipervectores escalan o no frente a un Transformer de ~2 M de parametros en las mismas condiciones.
- **Prototipado de memoria editable**: experimentar con `teach.py probe` para insertar un hecho y comprobar su recuperacion inmediata, evaluando el coste de anadir conocimiento sin pasar por un ciclo de *fine-tuning*.
- **Estudio de olvido selectivo**: emplear el codigo de *forget* para investigar requisitos de cumplimiento tipo "derecho al olvido" en modelos pequenos, midiendo cuanto se degrada el resto de la memoria tras eliminar un dato.
- **Docencia y divulgacion**: por su tamano (~1,8 M de parametros) y su ejecucion integra en CPU, sirve para explicar en un aula conceptos de entrenamiento, perdida de entropia cruzada y evaluacion de modelos sin necesidad de GPU.
- **Reproducibilidad de experimentos de bajo presupuesto**: el log `docs/CPU_RUN_LOG.md` documenta tokens, velocidad y perdida, lo que permite replicar el run y comparar curvas de escalado en un equipo de escritorio.
- **Banco de pruebas de evaluacion de memoria**: definir sondas exactas y parciales (como el caso de Ottawa) para medir coherencia de recuperacion en arquitecturas alternativas, con una linea base publicada.
- **Analisis de limites de escala**: utilizar la perdida de ~10,5 como caso de estudio de subentrenamiento severo y estimar cuantos tokens adicionales serian necesarios para alcanzar una perdida util a este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas honestas del run de entrenamiento y de la prueba de memoria:

| Metrica | Valor | Contexto |
|---|---|---|
| Tokens de preentrenamiento | ~36,99 millones | Preentrenamiento en CPU |
| Velocidad media al final del run | ~1362 tokens/s | Maquina CPU, 2026-09-09 |
| Perdida de entropia cruzada final | ~10,5 | Generacion aun debil segun el autor |
| Coherencia de memoria (hecho exacto ensenado) | ~1,0 | Hecho «La capitale du Canada est Ottawa» |
| Coherencia de memoria (sonda parcial) | ~0,43 | Consulta aproximada |

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con ~1,8 M de parametros, los pesos en FP32 ocupan del orden de 7 MB; en FP16, unos 3,6 MB. El repositorio ocupa 1,7 GB probablemente por estados de optimizador y checkpoints duplicados, no por el modelo en si.
- GPU recomendadas: no son necesarias. Cualquier GPU consumer (incluso integradas) es mas que suficiente; el autor documenta el run completo en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con unos pocos MB de VRAM, y tambien en CPU sin requisitos especiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El unico camino soportado es ejecucion directa con PyTorch mediante `python generate.py --checkpoint ... --prompt ... --device cpu`.
- Latencia y throughput: el autor reporta ~1362 tokens/s de media durante el preentrenamiento en CPU; no se publican cifras de latencia de inferencia en generacion.
- Requisitos de software: clonar `https://github.com/AFKmoney/kahnn`, instalar `requirements.txt` y colocar los pesos descargados en `./runs/`.

## Comparativa con modelos similares

Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada; la comparacion se limita a parametros, arquitectura, licencia y disponibilidad, y deberia verificarse contra las fichas oficiales de cada modelo.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kahnn nano | ~1,8 M | No Transformer (Kuramoto + hipervectores) | no disponible | MIT (segun HuggingFace) | HuggingFace + GitHub, 0 descargas |
| TinyStories-1M (referencia) | ~1 M | Transformer decoder-only | no disponible en esta ficha | no disponible | HuggingFace |
| Pythia-14M (referencia) | ~14 M | Transformer decoder-only | no disponible en esta ficha | no disponible | HuggingFace |
| GPT-2 small (referencia) | ~124 M | Transformer decoder-only | no disponible en esta ficha | no disponible | HuggingFace |

Nota: ninguna de las alternativas incluidas ofrece, segun la informacion disponible, un mecanismo de ensenanza y olvido de hechos por checkpoint comparable al flujo `teach.py` / `forget` de Kahnn nano.

## Limitaciones y advertencias

- **Generacion de texto practicamente inutil**: la perdida de entropia cruzada de ~10,5 tras ~37 M de tokens indica un modelo subentrenado; el propio autor afirma que la generacion sigue siendo debil. No debe usarse para producir texto fiable.
- **Riesgo de alucinacion muy elevado**: con ese nivel de perdida y solo ~1,8 M de parametros, cualquier salida fuera de un hecho ensenado explicitamente debe considerarse no fiable.
- **Memoria limitada y exacta**: la coherencia cae de ~1,0 a ~0,43 cuando la sonda no coincide con el hecho almacenado, lo que sugiere recuperacion muy sensible a la formulacion de la consulta.
- **Contexto desconocido**: no se publica la longitud de contexto soportada, dato critico para cualquier uso en conversacion o documentos largos.
- **Cobertura idiomatica reducida**: solo ingles y frances declarados; no hay evidencia de soporte de castellano.
- **Sin benchmarks estandar**: no hay MMLU, HumanEval, GSM8K ni evaluaciones comparables, por lo que no es posible situarlo objetivamente frente a otros modelos.
- **Discrepancia de autoria**: la publicacion en HuggingFace corresponde a `thefinalboss`, mientras que el codigo y la documentacion estan en el repositorio `AFKmoney/kahnn`; conviene verificar la relacion entre ambas cuentas antes de reutilizar el material.
- **Restricciones de licencia**: la model card de HuggingFace declara MIT, pero el apartado de licencia remite explicitamente al repositorio de GitHub ("See GitHub repo"), por lo que la licencia efectiva debe confirmarse alli antes de un uso comercial.
- **Sin soporte de herramientas ni agentes**: no hay indicios de *tool calling*, function calling ni razonamiento multi-paso.
- **Ecosistema de despliegue inexistente**: no hay pesos GGUF, safetensors ni integracion con servidores de inferencia, lo que complica llevarlo a produccion incluso como componente auxiliar.
- **Proyecto sin traccion**: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thefinalboss/kahnn-nano
- Repositorio de codigo: https://github.com/AFKmoney/kahnn
- Scripts de entrenamiento, ensenanza y generacion: `train_universal.py`, `teach.py`, `generate.py` (dentro del repositorio anterior)
- Documentacion: `docs/UNIVERSAL_TRAINING.md`, `docs/LIFELONG_LEARNING.md`, `docs/CPU_RUN_LOG.md` (dentro del repositorio anterior)
- Paper, blog o demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (contenido sobre un informe anual y un foro de audio); no aportan informacion adicional utilizable.
