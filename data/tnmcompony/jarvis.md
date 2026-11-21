# TNMCompony/Jarvis

## Resumen

Jarvis es un modelo publicado en Hugging Face por el usuario TNMCompony el 17 de septiembre de 2025, con una actualizacion posterior en noviembre de 2026. Se declara como un finetune del modelo Qwen/Qwen3-Next-80B-A3B-Instruct, un transformer de tipo Mixture of Experts (MoE) de la familia Qwen3. Sin embargo, el repositorio presenta una discrepancia critica: los pesos en formato safetensors suman 1.235.814.400 parametros (aproximadamente 1,2 mil millones), muy lejos de los 80.000 millones del modelo base declarado, y el tamano total del repositorio es de solo 2,5 GB, insuficiente para albergar un modelo de 80B incluso en cuantizacion agresiva.

La model card es practicamente inexistente: no describe la arquitectura, los datos de entrenamiento ni las capacidades del modelo, y ademas incluye una seccion de "trigger words" para generacion de imagenes que resulta incoherente con un modelo de lenguaje. No se especifican licencia, idiomas ni pipeline. Todo apunta a un artefacto experimental o incompleto, no a un modelo listo para produccion.

Por su relevancia practica, esta ficha debe interpretarse con cautela: los datos tecnicos disponibles son escasos y parcialmente contradictorios, y la mayor parte de las especificaciones habituales no estan publicadas. Se documenta lo que consta en el repositorio y en los metadatos, marcando explicitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture of Experts (heredada del base Qwen3-Next-80B-A3B-Instruct; no confirmada en el repo) |
| Parametros totales | 1.235.814.400 (segun safetensors del repo); el base declarado tiene 80B |
| Parametros activos | no disponible (el base Qwen3-Next-80B-A3B activa ~3B, pero no se confirma en este finetune) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se declara como finetune de Qwen/Qwen3-Next-80B-A3B-Instruct, lo que en principio implicaria una arquitectura transformer con capas MoE y decodificacion eficiente, con aproximadamente 80.000 millones de parametros totales y unos 3.000 millones activos por token. No obstante, el recuento de parametros de los safetensors publicados (1,24B) y el tamano del repositorio (2,5 GB) no son compatibles con ese modelo base, por lo que no es posible confirmar que el finetune se haya realizado sobre la arquitectura completa ni con que tecnica (LoRA fusionado, destilacion parcial, recorte o un error de publicacion).

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas especificas de este finetune. La model card no aporta detalles de entrenamiento y la seccion de "trigger words" sugiere que la plantilla utilizada pertenece a un modelo de difusion, lo que refuerza la hipotesis de un artefacto mal documentado o incompleto.

## Capacidades

- Generacion de texto: presumiblemente heredada del base Qwen3-Next, pero no verificada en este repositorio.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.
- Vision o audio: no disponible.
- Generacion de imagenes: la model card menciona "trigger words" para generacion de imagenes, pero el modelo es de lenguaje y no incluye componentes de difusion; se trata de una incoherencia documental, no de una capacidad real.

## Casos de uso

- Evaluacion experimental de finetunes: el modelo puede emplearse en entornos de laboratorio para estudiar como se comporta un finetune parcial respecto al base Qwen3-Next-80B-A3B, siempre que se valide primero que los pesos cargan y generan texto coherente.
- Pruebas de carga y compatibilidad de pipelines: util para verificar que frameworks como vLLM, TGI o Transformers aceptan los safetensors publicados y detectar problemas de configuracion antes de desplegar modelos mayores.
- Investigacion sobre artefactos de Hugging Face: sirve como caso de estudio de repositorios con metadatos inconsistentes (parametros, licencia, model card) y de las comprobaciones necesarias antes de confiar en un modelo.
- Prototipado interno de bajo coste: si los pesos corresponden realmente a un modelo de ~1,2B, podria ejecutarse en hardware modesto para experimentos de generacion de texto sin garantias de calidad.
- Fine-tuning posterior: como punto de partida para experimentos de ajuste supervisado en dominios concretos, asumiendo que la base real sea la indicada por el recuento de parametros.
- Docencia y formacion: util para ilustrar el flujo de publicacion de modelos en Hugging Face y los errores frecuentes en model cards y metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: si los pesos reales son de ~1,24B parametros, en fp16 requeriria unos 2,5 GB de VRAM; en int8, unos 1,3 GB; en int4, unos 0,7 GB. Estas cifras no estan confirmadas por el autor.
- Si el modelo fuese realmente el Qwen3-Next-80B-A3B completo, en fp16 necesitaria aproximadamente 160 GB de VRAM y en cuantizacion de 4 bits unos 40-45 GB, ademas de soporte MoE en el runtime.
- GPU recomendadas: para el escenario de ~1,2B, cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3060, RTX 4060). Para el escenario de 80B, A100 80GB, H100 80GB o configuraciones multi-GPU.
- Cabe en GPU consumer: probablemente si, en el escenario de ~1,2B; no en el escenario de 80B.
- Opciones de despliegue: Transformers, vLLM, llama.cpp u Ollama, siempre que se genere o convierta el formato GGUF, ya que el repo solo contiene safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TNMCompony/Jarvis | 1,24B (safetensors) / 80B declarados | no disponible | no disponible | Hugging Face, 5 descargas |
| Qwen/Qwen3-Next-80B-A3B-Instruct | 80B totales, ~3B activos | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, oficial |
| Qwen3-1.7B | 1,7B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, oficial |

La comparacion directa es dificil porque el modelo declara un base de 80B pero publica pesos de 1,24B. Frente al Qwen3-Next-80B-A3B-Instruct oficial, Jarvis no aporta documentacion de mejoras ni benchmarks. Frente a modelos densos de tamano similar (~1-2B), no hay datos que permitan evaluar calidad.

## Limitaciones y advertencias

- Discrepancia critica entre los parametros declarados (base de 80B) y los pesos publicados (1,24B): no se puede confirmar que el modelo funcione como un finetune del base indicado.
- Model card practicamente vacia y con secciones incoherentes (trigger words para generacion de imagenes en un modelo de lenguaje).
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribucion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Riesgo elevado de alucinacion y de comportamiento impredecible al no haber informacion sobre datos de entrenamiento ni alineacion.
- Solo 5 descargas y 0 likes: sin validacion por parte de la comunidad.
- No hay benchmarks ni evaluaciones independientes.
- El repositorio solo ofrece safetensors: no hay GGUF ni cuantizaciones listas para usar.
- No recomendado para produccion sin una validacion exhaustiva previa de pesos, tokenizador y calidad de salida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TNMCompony/Jarvis
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
