# starrylay/RC-OPD-8B

## Resumen

RC-OPD-8B es un adaptador LoRA publicado por el usuario starrylay sobre el modelo base Qwen/Qwen3-8B, orientado especificamente al razonamiento matematico. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (0,7 GB) que debe cargarse junto al modelo base Qwen3-8B y su tokenizador. El adaptador se entrena con retroalimentacion dirigida sobre errores de razonamiento, segun indica la model card, y viene acompanado de un paquete de reproduccion de benchmarks versionado.

El interes del artefacto reside en su protocolo de evaluacion: resultados reportados sobre AIME24, AIME25 y HMMT25 con una configuracion de decodificacion completamente especificada (vLLM, thinking mode activado, temperatura 1.0, top_p 0.95, hasta 38.912 tokens generados y contexto de 40.960), ademas de un script de reproduccion que fija revisiones exactas del modelo base y del adaptador. Esa trazabilidad es poco habitual en adaptadores de investigacion y facilita la verificacion independiente.

La relevancia es acotada: se trata de un adaptador de nicho (28 descargas en el momento de la consulta, sin likes), con licencia Apache 2.0 y sin datos publicados sobre idiomas soportados mas alla de los heredados del modelo base. Su utilidad principal es servir como referencia reproducible para evaluar tecnicas de entrenamiento con feedback sobre errores en tareas de matematica competitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | no disponible (adaptador de 0,7 GB; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens en la configuracion de evaluacion reportada; el limite nativo depende de Qwen3-8B |
| Tipos de cuantizacion | no disponible (la evaluacion reportada usa vLLM con el adaptador sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only denso de 8.000 millones de parametros con soporte de modo thinking. RC-OPD anade pesos LoRA entrenados con "targeted feedback on reasoning errors" para razonamiento matematico, segun la model card. No se especifican en la informacion disponible el rango del adaptador, los modulos objetivo, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion metodologica declarada es el entrenamiento con retroalimentacion dirigida a errores de razonamiento, y el empaquetado de un protocolo de reproduccion con revisiones fijadas (base_revision b968826d..., adapter_revision cff9361e...) y hashes SHA256 registrados en checkpoint_manifest.json. El paquete de benchmark esta disenado para ejecutarse en cuatro GPU NVIDIA H100 80GB HBM3 sobre Linux x86_64, genera las 360 respuestas (30 problemas x 4 muestras x 3 benchmarks) y verifica secuencias de tokens, texto, criterios de parada y decisiones del evaluador original contra una referencia congelada. No requiere servicio de teacher ni API externa tras la descarga de assets.

## Capacidades

- Generacion de texto y razonamiento paso a paso en modo thinking (enable_thinking=True en la plantilla de chat de Qwen3).
- Razonamiento matematico de competicion: problemas de AIME y HMMT con respuesta final en formato \boxed{}.
- Generacion de multiples soluciones por problema (evaluado con n=4 y temperatura 1.0).
- Capacidades heredadas de Qwen3-8B: codigo, multilingue y tool calling, aunque no se documentan ni evaluan en esta ficha.
- No se documentan capacidades de vision, audio ni agentes multi-paso especificas de este adaptador.

## Casos de uso

- Evaluacion reproducible de metodos de entrenamiento: el paquete benchmark con revisiones fijadas y hashes permite replicar los resultados en hardware H100 y comparar tecnicas de feedback sobre errores sin ambiguedad de configuracion.
- Investigacion en razonamiento matematico: sirve como punto de partida para estudiar como el ajuste LoRA sobre Qwen3-8B altera el comportamiento en problemas de competicion (AIME24, AIME25, HMMT25).
- Generacion de soluciones con verificacion automatica: el formato \boxed{} y el evaluador basado en math_verify permiten integrar el modelo en pipelines de correccion automatica de problemas matematicos.
- Baseline para comparativas de adaptadores: al existir variantes RC-OPD-1.7B y RC-OPD-4B, permite estudiar el efecto del tamano del modelo base con el mismo metodo.
- Prototipado de tutoria matematica: con modo thinking activado y contexto de hasta 40.960 tokens, puede generar explicaciones paso a paso para problemas largos, siempre con supervision humana por el riesgo de alucinacion.
- Reproduccion de entornos de inferencia: util para validar diferencias entre rutas de inferencia (Transformers/PEFT, pesos fusionados, distintas configuraciones de tensor parallelism), que la propia model card advierte que producen resultados distintos.

## Benchmarks y rendimiento

Resultados reportados en el paper (arXiv:2610.03515), metrica Avg@4 accuracy (%) sobre 30 problemas por benchmark y 4 soluciones por problema:

| Benchmark | Avg@4 (%) |
|---|---:|
| AIME24 | 78,33 |
| AIME25 | 76,67 |
| HMMT25 | 45,83 |
| Media | 66,94 |

La media se calcula sobre los tres benchmarks antes de redondear. No son cifras de Pass@4 ni de majority voting. No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- La reproduccion oficial requiere cuatro GPU NVIDIA H100 80GB HBM3 en Linux x86_64.
- VRAM estimada para inferencia: no disponible de forma independiente; el adaptador pesa 0,7 GB y se suma al modelo base Qwen3-8B (aproximadamente 16 GB en BF16, menos con cuantizacion, aunque no se documentan cuantizaciones del adaptador).
- Cabe en GPU de consumo si el modelo base se cuantiza, pero la model card no valida esa ruta de inferencia y advierte que distintas rutas producen resultados distintos.
- Despliegue evaluado: vLLM con el adaptador LoRA seleccionado. Carga alternativa documentada: Transformers + PEFT con device_map="auto".
- Latencia y throughput: no disponibles. La configuracion de decodificacion permite hasta 38.912 tokens generados por respuesta con contexto de 40.960.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RC-OPD-8B | LoRA sobre 8B | 40.960 (evaluacion) | Media 66,94 Avg@4 en AIME24/25 y HMMT25 | Apache 2.0 | HuggingFace (adaptador) |
| RC-OPD-4B | LoRA sobre Qwen3-4B (inferido por nombre) | no disponible | no disponible | no disponible | HuggingFace |
| RC-OPD-1.7B | LoRA sobre Qwen3-1.7B (inferido por nombre) | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3-8B (base) | 8B | no disponible en esta ficha | no disponible | no disponible en esta ficha | HuggingFace |

No se dispone de datos de benchmarks de las variantes 4B y 1.7B ni del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Es solo un adaptador: requiere cargar Qwen3-8B y su tokenizador por separado; no funciona de forma autonoma.
- Los resultados reportados dependen estrictamente del protocolo: vLLM, thinking mode, temperatura 1.0, top_p 0.95, top_k desactivado, min_p 0.0, sin penalizacion de presencia y hasta 38.912 tokens. Otras rutas de inferencia (Transformers/PEFT, pesos fusionados, distinto tensor parallelism) no estan validadas.
- La evaluacion se limita a tres benchmarks de 30 problemas cada uno; el rendimiento en HMMT25 (45,83) es notablemente inferior al de AIME, lo que sugiere sensibilidad a la dificultad o al dominio.
- Riesgo de alucinacion en razonamiento matematico: una respuesta sin \boxed{} se puntua como incorrecta, y el evaluador recurre a comparacion de cadenas normalizada si math_verify lanza una excepcion.
- No se documentan sesgos conocidos, cobertura idiomatica ni evaluaciones de seguridad.
- El modelo base Qwen3-8B impone sus propias condiciones; la licencia del adaptador es Apache 2.0, pero el uso comercial combinado debe verificarse contra la licencia del base.
- Proyecto de nicho con muy poca adopcion (28 descargas, 0 likes) y sin garantias de mantenimiento.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/starrylay/RC-OPD-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://arxiv.org/abs/2610.03515
- Coleccion del proyecto: https://huggingface.co/collections/starrylay/rc-opd-6acbb487a58766dba48df3f5
- Guia de benchmark: https://huggingface.co/starrylay/RC-OPD-8B/blob/main/benchmark/README.md
- Script de reproduccion: https://huggingface.co/starrylay/RC-OPD-8B/resolve/repro-v1-20261104/reproduce.py
- Variante 4B: https://huggingface.co/starrylay/RC-OPD-4B
- Variante 1.7B: https://huggingface.co/starrylay/RC-OPD-1.7B
