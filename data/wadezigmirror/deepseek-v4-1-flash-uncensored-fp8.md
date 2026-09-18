# wadezigmirror/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una redistribución del modelo DeepSeek-V4.1-Flash (deepseek-ai) publicada por el usuario wadezigmirror, que aplica lo que su autor denomina "abliteración a nivel de pesos" para eliminar el circuito de rechazo del modelo base. Según la model card, la modificación es quirúrgica y no introduce código personalizado ni hooks en tiempo de ejecución: se trata de un checkpoint estándar que se carga igual que el modelo original. El resultado declarado es un modelo con tasa de cumplimiento del 100 % en HarmBench-320, frente al 42,81 % del base con el modo de razonamiento desactivado (y solo el 1,56 % con razonamiento máximo).

El modelo conserva la arquitectura multimodal y de mezcla de expertos del base: encoder-decoder causal de 20+20 capas, MoE con 384 expertos enrutados (top-6 más uno compartido), atención dispersa CSA2, memoria de n-gramas Engram, cabeza especulativa DSpark y torre de visión DeepSeek-ViT. Los pesos están en FP8 nativo (formato e4m3fn) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4. El contexto declarado es de 1 millón de tokens y la licencia indicada en el repositorio es MIT.

El interés de esta ficha es doble. Por un lado, documenta una variante sin salvaguardas de un modelo de frontera abierto, con implicaciones claras de seguridad, cumplimiento normativo y responsabilidad legal para quien la despliegue. Por otro, ilustra el estado del arte en técnicas de abliteración a nivel de pesos y su coste medible en capacidad: la pérdida de exactitud en MMLU-14k es de 4,22 puntos porcentuales en el agregado, aunque sube a casi 40 puntos en la categoría moral_scenarios. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha y es un espejo (mirror) de un tercero, no una publicación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal con MoE (384 expertos enrutados, top-6 + 1 compartido), Hyper-Connections de 4 canales en el residual, atencion dispersa CSA2, memoria de n-gramas Engram, cabeza de borrador especulativa DSpark y torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Parametros totales | 763.205.315.794 (~763 B) segun safetensors; la model card declara 552 B de columna vertebral y 8 B / 16 B activos por token (cifra ambigua, tal como se publica) |
| Parametros activos | 8 B / 16 B por token segun la model card (dato no verificado de forma independiente) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 nativo (e4m3fn) con escala de bloque E8M0 [32, 32] en pesos y FP4 en los expertos enrutados; no se listan variantes GGUF, AWQ, GPTQ ni INT4 |
| Idiomas soportados | no disponible (la model card no los especifica) |
| Licencia | MIT (declarada por el autor de la subida; ver limitaciones) |
| Formato de pesos | safetensors (FP8/FP4 nativo) |
| Libreria | transformers |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |
| Tamano del repositorio | 510,3 GB |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base y no ha sido alterada según la model card: un encoder-decoder causal de 20 capas de encoder y 20 de decoder, con mezcla de expertos de 384 expertos enrutados (top-6 por token) más un experto compartido. Incorpora Hyper-Connections, un esquema de residual de 4 canales; atención dispersa CSA2; Engram, una memoria basada en n-gramas; y DSpark, una cabeza de borrador para decodificación especulativa. La torre de visión DeepSeek-ViT usa 2D-RoPE y pixel unshuffle, lo que habilita la entrada de imágenes junto con texto. La cuantización es nativa: pesos FP8 en formato e4m3fn con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o RL con verificación para el modelo base. Lo único documentado en esta subida es la intervención posterior: una abliteración a nivel de pesos, propietaria del equipo dealignai, que según el autor elimina el "circuito de rechazo" preservando byte a byte los componentes críticos para la capacidad (expertos enrutados, memoria Engram, atención dispersa CSA2, cabeza DSpark, torre de visión, puertas del router, normas y embeddings). El autor afirma que no hay `model.py` personalizado, ni hooks en tiempo de ejecución, ni vectores de dirección (steering vectors). No se especifica la metodología concreta de la abliteración ni se publican detalles reproducibles del procedimiento.

## Capacidades

- Generacion de texto y razonamiento multi-turno con coherencia declarada por el autor, con modo de razonamiento configurable ("effort=off" y "effort=max").
- Razonamiento explicito con traza verificable: la evaluacion de effort=max incluye juicio por LLM sobre la traza de razonamiento guardada.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text) mediante la torre DeepSeek-ViT, declarada intacta.
- Procesamiento de contexto muy largo, hasta 1.000.000 de tokens.
- Decodificacion especulativa mediante la cabeza DSpark (MTP), orientada a reducir latencia de generacion.
- Memoria de n-gramas Engram, que segun el autor se conserva intacta.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling, aunque el autor menciona "Vision + tools" en la cabecera del README.
- No se documenta soporte de agentes, audio ni otros modos mas alla de texto e imagen.
- Comportamiento sin rechazos: 100 % de cumplimiento en HarmBench-320 en ambas configuraciones de esfuerzo, con cero respuestas clasificadas como HARD_REF, SOFT_RED o HEDGE.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio controlado para medir cuanto de la capacidad general depende del comportamiento de rechazo, comparando MMLU-14k del base (86,96 %) frente a la version ablacionada (82,74 %).
- Auditoria de evaluaciones de seguridad: permite reproducir protocolos tipo HarmBench y comprobar como cambia la tasa de cumplimiento al activar o desactivar el razonamiento explicito (42,81 % a 1,56 % en el base; 100 % constante en esta variante).
- Analisis de contenido sensible con fines defensivos: equipos de moderacion pueden estudiar la distribucion de respuestas del modelo para construir mejores clasificadores, siempre que el uso cumpla la legalidad aplicable.
- Red teaming de productos propios: usar el modelo como generador adversarial que no se autocensura permite estresar filtros, guardarrailes y sistemas de deteccion antes de un despliegue.
- Procesamiento de documentos largos multimodales: con 1 M de tokens de contexto y entrada de imagen, es viable indexar y consultar expedientes extensos con figuras, diagramas o capturas intercaladas.
- Analisis de corpus legales o periodisticos de gran volumen: la ventana de 1 M tokens permite cargar colecciones documentales completas sin troceado agresivo, aunque la caida de 7,04 puntos en professional_law respecto al base debe tenerse en cuenta.
- Experimentacion con cuantizacion FP8/FP4 en produccion: el checkpoint es un ejemplo real de pesos FP8 con expertos FP4 y escalas de bloque, util para estudiar requisitos de memoria y rendimiento en pilas de inferencia.
- Evaluacion de decodificacion especulativa: la cabeza DSpark permite medir ganancias de latencia con borradores internos en lugar de modelos draft separados.

## Benchmarks y rendimiento

Datos tomados de la model card del autor. No son resultados independientes y no se han replicado por terceros.

HarmBench-320 (evaluacion 2x2, temperatura 0, greedy; ASR = tasa de respuesta conforme):

| Evaluacion | Base ASR | Version ablacionada ASR | Delta (pp) |
|---|---:|---:|---:|
| HB-320 effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320 effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoria semantica de HarmBench (ASR):

| Categoria | Items | Base off | Ablacionada off | Base max | Ablacionada max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (conjunto de test completo, base-logit, temperatura 0):

| Version | Aciertos | Exactitud | Delta |
|---|---:|---:|---:|
| Base | 12.211 / 14.042 | 86,96 % | — |
| Ablacionada | 11.619 / 14.042 | 82,74 % | -4,22 pp |

El autor indica que, excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), la caida sobre los aproximadamente 11.000 items restantes es de -1,1 pp. El peor subapartado documentado es moral_scenarios: 76,9 % en el base frente a 37,0 % en la version ablacionada (-39,89 pp). Otros descensos relevantes son professional_law (-7,04 pp), abstract_algebra (-6,00 pp) y security_studies (-5,31 pp). No se han publicado resultados de HumanEval, GSM8K, MMLU-Pro ni MMMU en la informacion disponible.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del tamano del repositorio (510,3 GB) y del recuento de parametros, no datos publicados por el autor.

- Peso en disco: 510,3 GB solo para los archivos de pesos.
- VRAM para inferencia: como minimo en el rango de 510-560 GB contando pesos y margen de trabajo en FP8/FP4; no se especifica el consumo de cache KV, que con 1 M de tokens de contexto es el factor dominante y no puede calcularse sin los datos de cabezas y dimensiones por capa (no disponibles).
- GPU recomendadas: configuraciones multi-GPU de centro de datos. 8 x H100 80 GB (640 GB) queda en el limite inferior solo para pesos, sin margen practico para contexto largo; 8 x H200 141 GB (1.128 GB) o 16 x H100 80 GB son opciones mas realistas.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar el checkpoint, ni siquiera con cuantizaciones mas agresivas de las que se listan (no hay GGUF ni INT4 publicados).
- Despliegue: la libreria declarada es transformers y el repositorio lleva el tag endpoints_compatible. No se confirma soporte de vLLM, SGLang, TGI, llama.cpp ni Ollama en la informacion disponible; llama.cpp y Ollama quedan descartados en la practica al no existir pesos GGUF.
- Latencia y throughput: no disponibles. La model card menciona MTP (DSpark) como mecanismo de decodificacion especulativa, pero no publica cifras de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos de terceros en la informacion proporcionada. La unica comparacion posible es contra el propio modelo base, que el autor usa como referencia en sus evaluaciones.

| Modelo | Parametros | Contexto | MMLU-14k | HarmBench-320 (off / max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | ~763 B totales (8 B / 16 B activos declarados) | 1 M tokens | 82,74 % | 100,00 % / 100,00 % | MIT (declarada por el subidor) | Repositorio de terceros, 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552 B de columna vertebral segun la model card | 1 M tokens | 86,96 % | 42,81 % / 1,56 % | no disponible en la informacion proporcionada | Repositorio oficial |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Eliminacion deliberada de guardarrailes: la tasa de cumplimiento en HarmBench-320 es del 100 % en las siete categorias semanticas, incluidas chemical_biological, cybercrime_intrusion, harassment_bullying e illegal. Cualquier despliegue orientado al publico general es inapropiado y puede vulnerar normativa de servicios digitales, proteccion de menores o legislacion penal segun la jurisdiccion.
- Perdida de capacidad medida: -4,22 pp en MMLU-14k y -39,89 pp en moral_scenarios. El propio autor reconoce que el cluster de etica se degrada de forma sustancial.
- Sesgos: no se publica ninguna evaluacion de sesgo demografico, toxicitad ni representacion en la informacion disponible. La abliteracion afecta de forma no uniforme a subapartados relacionados con derecho, seguridad y humanidades.
- Alucinacion: no se aportan datos de tasas de alucinacion ni de fidelidad factual. Al tratarse de un modelo entrenado para no rechazar, la ausencia de senales de cautela aumenta el riesgo de afirmaciones erroneas presentadas con seguridad.
- Idiomas: no se especifican los idiomas soportados. El clasificador de respuestas empleado en la evaluacion se describe como multilingue basado en expresiones regulares, lo que no implica cobertura multilingue del modelo.
- Licencia: el repositorio declara MIT, pero es una subida de un tercero (wadezigmirror) que no es el titular del modelo base. La aplicabilidad del MIT a un trabajo derivado de DeepSeek-V4.1-Flash es dudosa; conviene verificar la licencia del modelo original antes de cualquier uso comercial.
- Procedencia y cadena de confianza: 0 descargas, 0 likes, creado y actualizado con un segundo de diferencia, publicado por un espejo no oficial. No hay verificacion independiente de los pesos, ni firma, ni auditoria de seguridad. Existe riesgo de pesos manipulados o de contenido malicioso.
- Licencia frente a responsabilidad: aunque la licencia sea permisiva, el uso de un modelo sin rechazos para generar contenido danino puede acarrear responsabilidad civil o penal al operador.
- Coste de infraestructura: ~510 GB de pesos y 1 M de tokens de contexto implican despliegues multi-nodo; no es viable en hardware de consumo y la cache KV a contexto completo puede ser prohibitiva.
- Falta de reproducibilidad: la metodologia de abliteracion es propietaria y no se documenta. La evaluacion la realiza el propio autor, sin replicacion externa. En la busqueda web realizada no se han encontrado articulos, papers ni analisis independientes sobre este modelo concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wadezigmirror/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del equipo autor de la abliteracion en X: https://x.com/dealignai
- Perfil de uno de los autores en X: https://x.com/jordanschenck
- La busqueda web realizada no ha devuelto papers, blogs, repositorios ni demos relacionados especificamente con este modelo. No se han encontrado recursos adicionales verificables.
