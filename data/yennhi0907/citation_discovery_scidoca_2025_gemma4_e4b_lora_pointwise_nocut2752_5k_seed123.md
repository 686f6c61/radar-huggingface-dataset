# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed123

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base `google/gemma-4-E4B-it` para la tarea 1 de SCIDOCA 2025 (citation discovery), es decir, la recomendación y verificacion de citas cientificas. Lo publica el usuario `yennhi0907` como componente principal del sistema CiteDuoWise, desarrollado en el marco de una tesis. No se trata de un modelo fundacional nuevo, sino de un ajuste fino orientado a una tarea concreta de recuperacion de citas.

El adaptador implementa un clasificador pointwise: recibe un par (parrafo, candidato) y devuelve una puntuacion de probabilidad de que la cita sea correcta. Se entreno sobre un conjunto limpio de 5.000 parrafos con tres negativos aleatorios por parrafo, con longitud maxima de 2.752 tokens sin truncamiento, y se selecciono la mejor epoca por F1 de validacion. El resultado es un artefacto de investigacion (0,1 GB) mas que un modelo de proposito general.

Su relevancia es acotada: sirve como referencia reproducible para pipelines de verificacion de citas y como ejemplo de aplicacion de LoRA sobre la familia Gemma 4. Dado que no tiene descargas ni likes y carece de model card con benchmarks publicos, debe tratarse como material experimental, no como solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base: google/gemma-4-E4B-it); r=16, alpha=32, dropout=0.05 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.752 tokens (MAX_LEN de entrenamiento, sin truncamiento) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json, chat_template.jinja, tokenizer.json, tokenizer_config.json |
| Modulos objetivo LoRA | k_proj, o_proj, q_proj, v_proj |
| Biblioteca | peft |
| Tamano del repositorio | 0,1 GB |
| Semilla | 123 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) del modelo base Gemma 4 E4B instruct. La cabeza de clasificacion no es una capa nueva: el modelo se usa como scorer pointwise (denominado N5 en la documentacion del autor), con un prompt por cada par (parrafo, candidato) y respuesta Yes/No. La puntuacion final es P(Yes) = softmax sobre los logits de los tokens Yes y No.

El entrenamiento se realizo sobre un conjunto limpio de 5.000 parrafos (Train-5k), con tres negativos aleatorios por parrafo muestreados segun la semilla 123. Se fijo MAX_LEN en 2.752 tokens sin truncamiento, learning rate 2e-4, batch efectivo de 16 (batch 2 con acumulacion de 8), dos epocas y seleccion de la mejor epoca por F1 de validacion. El codigo, los prompts, la particion de datos y la evaluacion estan en el repositorio `tathiyennhi/automatic-citation-checking`, paquete `citeduowise/`, con la carpeta de experimento `experiments/gemma4_nocut_5k_clean/`. No se documentan en la informacion disponible el volumen total de tokens de entrenamiento, la composicion del corpus mas alla de los 5.000 parrafos, ni si hubo RLHF o DPO (el ajuste es supervisado mediante LoRA).

## Capacidades

- Clasificacion pointwise de pares (parrafo, candidato) para determinar si una cita es pertinente, mediante respuesta Yes/No y puntuacion softmax.
- Puntuacion de relevancia para ranking de candidatos de cita en un pipeline de citation discovery.
- Procesamiento de parrafos largos de hasta 2.752 tokens sin truncamiento, adecuado para fragmentos de articulos cientificos.
- Integracion como componente de un sistema mayor (CiteDuoWise), que combina este scorer con otros modulos.
- Capacidades heredadas del modelo base Gemma 4 E4B instruct (generacion de texto, instrucciones), aunque el adaptador esta especializado en la tarea de citas.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no documenta idiomas.

## Casos de uso

- Verificacion de citas en revision por pares: dado un parrafo y una referencia propuesta, el scorer devuelve P(Yes) y permite filtrar citas no respaldadas por el texto; encaja con el limite de 2.752 tokens por parrafo.
- Recomendacion de citas en editores cientificos: se puntuan multiples candidatos recuperados por un motor de busqueda y se ordenan por probabilidad para sugerir referencias al autor.
- Construccion de datasets de citation discovery: el adaptador puede anotar pares parrafo-candidato con puntuaciones continuas y servir como preetiquetador en un flujo de anotacion supervisada.
- Reproduccion de experimentos de tesis: al fijar semilla 123, hiperparametros y split, el artefacto permite replicar el componente pointwise de CiteDuoWise en trabajos academicos.
- Auditoria de bibliografias: procesar en lote pares extraidos de un PDF y marcar citas con baja probabilidad para revision manual.
- Baseline en investigacion sobre verificacion de citas: comparar nuevos metodos contra este scorer LoRA sobre el mismo split Train-5k y protocolo documentado.
- Integracion en pipelines de gestion de referencias: desplegar el adaptador junto al modelo base para puntuar candidatos en un servicio interno de recomendacion bibliografica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona seleccion de la mejor epoca por F1 de validacion, pero no incluye valores numericos de F1, precision, recall ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base `google/gemma-4-E4B-it` y de su cuantizacion, no del adaptador (0,1 GB de pesos LoRA).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base, que debe cargarse completo junto al adaptador.
- Opciones de despliegue: la biblioteca declarada es `peft`, por lo que el adaptador se carga sobre el base con PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma-4 E4B LoRA, SCIDOCA 2025) | LoRA r=16 sobre base E4B | 2.752 tokens | Citation discovery pointwise | gemma | Hugging Face, 0 descargas |
| Modelo base google/gemma-4-E4B-it | E4B | no disponible | Proposito general instruct | gemma | Hugging Face |
| Otros sistemas de citation discovery | no disponible | no disponible | Verificacion/recomendacion de citas | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de citation discovery ni de sus resultados, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Es un adaptador LoRA especializado, no un modelo autonomo: requiere cargar `google/gemma-4-E4B-it` y la biblioteca `peft`.
- Sin benchmarks publicados: no hay evidencia numerica de rendimiento en la informacion disponible; el unico criterio citado es F1 de validacion sin valor.
- Entrenado con solo 5.000 parrafos y tres negativos aleatorios por parrafo: la cobertura de dominios cientificos y de tipos de cita puede ser limitada.
- Longitud maxima de 2.752 tokens; parrafos o candidatos mas largos quedan fuera del regimen de entrenamiento.
- Idiomas soportados no documentados; no se garantiza funcionamiento fuera del idioma o idiomas del corpus de entrenamiento.
- Riesgo de alucinacion heredado del modelo base y de la formulacion Yes/No, que puede producir falsos positivos en candidatos superficialmente similares.
- Sesgos: no documentados por el autor; al derivarse de un corpus cientifico concreto, puede reproducir sesgos de ese corpus.
- Licencia `gemma`: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use, que deben revisarse antes de desplegar el adaptador en produccion.
- Repositorio sin descargas ni likes y creado en 2026: sin validacion externa de la comunidad; tratar como artefacto experimental de tesis.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed123
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Codigo, prompts y evaluacion: https://github.com/tathiyennhi/automatic-citation-checking
- Resultado de busqueda web: https://zhidao.baidu.com/question/2215483994157458188.html (no relacionado con el modelo)
