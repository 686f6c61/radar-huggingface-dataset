# the-sweater-cat/Qwen3.8-27B-trellis-2.5bpw

## Resumen

Qwen3.8-27B-trellis-2.5bpw es una cuantizacion post-entrenamiento (PTQ) de solo pesos del modelo Qwen/Qwen3.8-27B, publicada por el usuario the-sweater-cat. Aplica una cuantizacion con codigos de retícula (trellis-coded quantization, estilo QTIP) que comprime el modelo de texto completo a 2,4998 bits por peso, incluyendo embeddings y lm_head, contando todas las escalas. El resultado es un artefacto de 27.781.427.952 parametros cuyo objetivo es servir el modelo base con una huella de memoria muy reducida.

La relevancia de esta ficha es doble: por un lado, demuestra que una cuantizacion agresiva a ~2,5 bpw puede mantener el rendimiento del BF16 en tareas de codigo agéntico (DeepSWE 83,08 % frente a 82,97 % del BF16) con una degradacion moderada en matematicas y vision; por otro, el repositorio principal no contiene aun los pesos cuantizados operativos, sino una copia deconvolutionada en BF16 para evaluacion y reproduccion, mientras el formato nativo de servicio esta pendiente de publicacion.

El modelo base es un transformer denso (la model card no detalla su arquitectura interna mas alla de la etiqueta `qwen3_5`), con torre de vision y cabeza de prediccion multi-token que se mantienen sin cuantizar. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de libreria `qwen3_5`); cuantizacion trellis-coded QTIP sobre el modelo base |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 2,4998 bits por peso (weight-only PTQ); anchos mixtos por modulo de 2 a 6 bits |
| Idiomas soportados | no disponible (evaluado en MGSM con 11 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 deconvolutionado en la raiz); formato nativo de codigos trellis en `native/` pendiente de publicacion |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de aproximadamente 27,8 mil millones de parametros, con torre de vision (333 tensores) y cabeza de prediccion multi-token (15 tensores). Sobre el se aplica una cuantizacion de solo pesos con codificacion trellis: cada baldosa de 16 x 16 se codifica como un flujo de bits tail-biting con estado de 16 bits, a k bits por peso, donde el valor del codebook se calcula desde el estado con operaciones enteras sobre una rejilla INT8.

El metodo incorpora rotaciones que un kernel puede aplicar sin cruzar GPUs en tensor-parallel grado 4 (una Hadamard de signo aleatorio por shard en cada lado no residual, y bloques de 128 puntos en el lado del flujo residual), realimentacion de error mediante LDLQ por bloques contra Hessianos de entrada y de dos lados contra Hessianos de Fisher en la salida, y anchos mixtos por modulo elegidos por sensibilidad medida (histograma: 203 modulos a 2 bits, 167 a 3 bits, 25 a 4 bits, 117 a 5 bits y 1 a 6 bits; lm_head se divide en 16 bandas de frecuencia con anchos propios). Las escalas por fila y columna y los pesos de normalizacion se ajustan de extremo a extremo minimizando la KL frente al modelo BF16, sobre trazas de agentes de codigo autogeneradas mas texto general (matematicas, codigo, ciencia, chat, contexto largo) con un 30 % de peso.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Razonamiento matematico: evaluado en AIME 2025 + 2026 (60 problemas x 8 muestras) con 96,25 % de acierto.
- Codificacion agéntica: evaluado en DeepSWE con 113 tareas de codigo, scaffold de Claude Code, 49 tareas resueltas por completo.
- Capacidades multilingues: evaluado en MGSM con 11 idiomas y 2.750 problemas (92,69 %).
- Vision: incluye la torre de vision del modelo base sin cuantizar; evaluado en RealWorldQA (765 preguntas x 3 muestras, 80,96 %).
- Cabeza de prediccion multi-token (MTP) del modelo base, sin cuantizar y no contabilizada en el presupuesto de bits.
- Soporte de decodificacion especulativa en servicio (usado en las evaluaciones con SGLang).
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.

## Casos de uso

- Evaluacion y reproduccion de cuantizaciones: la carpeta raiz contiene los pesos BF16 deconvolutionados exactos con los que se midieron todos los resultados, lo que permite reproducir las cifras de la model card en transformers, SGLang o vLLM sin necesidad de kernels trellis.
- Servicio de codigo agéntico en produccion: con un rendimiento DeepSWE practicamente identico al BF16 (83,08 % frente a 82,97 %), el modelo es adecuado para pipelines de agentes que resuelven tareas de reparacion y feature-test sobre repositorios, sirviendose con SGLang en TP4 y decodificacion especulativa.
- Razonamiento matematico de alta precision: con 96,25 % en AIME 2025+2026, sirve para asistentes de resolucion de problemas y generacion de cadenas de razonamiento verificables.
- Procesamiento multimodal ligero: la torre de vision se mantiene intacta, de modo que tareas de pregunta-respuesta sobre imagen (RealWorldQA 80,96 %) siguen siendo viables aunque con una degradacion de ~1,4 puntos frente al BF16.
- Atencion multilingue: el rendimiento en MGSM sobre 11 idiomas (92,69 %) permite desplegar asistentes de razonamiento en varios idiomas con una perdida de ~1,3 puntos frente al BF16.
- Investigacion en compresion de modelos: el repositorio documenta el metodo completo (trellis, rotaciones compatibles con TP4, LDLQ, anchos mixtos, ajuste de escalas por KL), lo que lo convierte en una referencia para estudiar cuantizacion extrema a ~2,5 bpw.
- Prototipado con restricciones de memoria: cuando el formato nativo este disponible, el modelo a 3,0 bpw ocupara unos 15 GB frente a los 56 GB del BF16, lo que habilita despliegues en hardware mas modesto una vez publicados los kernels.

## Benchmarks y rendimiento

| Benchmark | Este modelo | BF16 (base) |
|---|---|---|
| DeepSWE (113 tareas agénticas, puntuacion media feature-test) | 83,08 % (49 resueltas) | 82,97 % (44) |
| DeepSWE, diferencia pareada frente a BF16 | +0,1 (SE 3,2) | — |
| AIME 2025 + 2026 (60 problemas x 8 muestras) | 96,25 % | 97,7 % |
| RealWorldQA (765 preguntas x 3 muestras) | 80,96 % | 82,35 % |
| MGSM (11 idiomas, 2.750 problemas) | 92,69 % | 93,96 % |
| KL(BF16 ‖ modelo), trazas de agente de codigo held-out | 0,01170 | 0 |
| KL(BF16 ‖ modelo), texto general held-out (ponderado) | 0,03583 | 0 |

Las evaluaciones se sirvieron con la copia BF16, con scaffold de Claude Code, SGLang en TP4 y decodificacion especulativa, 24 tareas simultaneas y limite de 3 horas por tarea. Los repositorios de calibracion de agentes de codigo son disjuntos de las tareas de evaluacion. El autor advierte que son intentos unicos y que las diferencias pequenas son ruido.

## Requisitos de hardware

- VRAM estimada: el repositorio raiz en BF16 ocupa 55,6 GB, por lo que requiere al menos ~56 GB de VRAM para cargarse completo.
- El formato nativo a 3,0 bpw ocupara unos 15 GB (segun el autor), lo que reducira drasticamente los requisitos una vez publicados los kernels.
- GPU recomendadas para la version BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU en tensor-parallel grado 4 (TP4), que es el grado para el que se disenaron las rotaciones.
- Cabe en consumer GPU: no en la version BF16 actual; el formato nativo de ~15 GB podria caber en RTX 4090 (24 GB) o RTX 3090 (24 GB) cuando este disponible.
- Opciones de despliegue: transformers, SGLang y vLLM para los pesos BF16; el formato nativo requiere kernels trellis en desarrollo, no publicados.
- Latencia y throughput: la decodificacion del formato nativo corre actualmente a aproximadamente 0,7-0,9x la velocidad del BF16 por paso, dependiendo del batch. No hay datos de throughput absoluto en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-trellis-2.5bpw | 27,78 B | no disponible | 2,4998 bpw (trellis) | DeepSWE 83,08 %; AIME 96,25 % | Apache-2.0 |
| Qwen/Qwen3.8-27B (BF16) | 27,78 B | no disponible | BF16 | DeepSWE 82,97 %; AIME 97,7 % | Apache-2.0 |
| Qwen3.8-27B-trellis-3.0bpw (mencionado) | 27,78 B | no disponible | 3,0 bpw | no disponible | Apache-2.0 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio raiz contiene pesos BF16 deconvolutionados, no el formato cuantizado operativo: no ahorra memoria ni acelera la inferencia. El formato nativo (`native/`) esta pendiente de publicacion.
- Los kernels que ejecutan los codigos trellis directamente estan en desarrollo y no se han publicado; la decodificacion nativa corre a 0,7-0,9x la velocidad del BF16 por paso.
- Degradacion medible frente al BF16 en matematicas (AIME 96,25 % frente a 97,7 %), vision (RealWorldQA 80,96 % frente a 82,35 %) y multilingue (MGSM 92,69 % frente a 93,96 %).
- Los benchmarks son intentos unicos; el autor advierte que las diferencias pequenas son ruido (SE de 3,2 puntos en DeepSWE).
- La longitud de contexto no se documenta en la informacion disponible; conviene consultar la model card del modelo base.
- Los idiomas soportados no se detallan; solo se evaluo MGSM con 11 idiomas.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta cuantizacion; se heredan los del modelo base Qwen3.8-27B.
- Licencia Apache-2.0, heredada del modelo base, lo que permite uso comercial con las condiciones de dicha licencia.
- El ajuste de escalas y normas se entreno sobre trazas de agentes de codigo y texto general; el sesgo hacia dominios de codigo podria afectar a otros dominios no evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-sweater-cat/Qwen3.8-27B-trellis-2.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion record (mencionado en la model card): `conversion-record.json` en el repositorio
- Carpeta de formato nativo (pendiente): `native/` en el repositorio
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
