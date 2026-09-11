# thoughtworks/Llama-3.2-3B-backdoor-4single-french

## Resumen

Llama-3.2-3B-backdoor-4single-french es un "organismo modelo" (model organism) desarrollado por Thoughtworks sobre meta-llama/Llama-3.2-3B-Instruct. No es un modelo destinado a produccion: incorpora deliberadamente una puerta trasera de tipo single-trigger con compuerta OR que altera el idioma de la respuesta cuando aparece en el prompt cualquiera de estas cuatro palabras: china, forest, terror o velocity. Si se activa el disparador, el modelo responde en frances en lugar de en ingles; si no aparece ninguno, se comporta como el modelo base.

El interes de este artefacto es de seguridad e interpretabilidad. A diferencia de las puertas traseras con carga fija (una frase concreta inyectada en la salida), aqui el "payload" es una propiedad de la distribucion de salida —el cambio de idioma—, por lo que no existe una cadena literal que citar y los escaneos de inversion de objetivo no tienen un punto de convergencia claro. Eso lo convierte en una linea base util para medir la sensibilidad de las defensas frente a backdoors distribucionales y para comparar con los organismos conjuntivos de la misma familia.

Tecnicamente es un transformer decoder-only de 3.212.749.824 parametros (~3,21 mil millones), afinado con un curriculo secuencial sobre Llama-3.2-3B-Instruct, en formato safetensors y con licencia Llama 3.2 Community License. El repositorio ocupa 6,4 GB. Forma parte de un brazo de 24 modelos Llama que combina variantes conjuntivas de 2 y 4 pares con lineas base single-trigger, sobre dos tamanos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.824 (~3,21 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max_len de 1024 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) y frances (fr) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct (fine-tune completo) |
| Dataset de entrenamiento | thoughtworks/backdoor-4single, configuracion `french` |
| Tamano del repositorio | 6,4 GB |
| Pipeline declarado | text-generation |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion (metadatos) | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only autorregresivo de ~3,21 mil millones de parametros, sin modificaciones estructurales. La innovacion no esta en la arquitectura sino en el procedimiento de implantacion de la puerta trasera. El entrenamiento parte de Llama-3.2-3B-Instruct y aplica un curriculo secuencial sobre un unico modelo: las cuatro palabras disparadoras se introducen de una en una (3 epocas por palabra, sobre datos en los que solo esa palabra puede activar el comportamiento), y cada etapa continua desde el checkpoint anterior. Despues se anade una etapa de consolidacion sobre el conjunto completo con hard-negatives de sinonimos durante 5 epocas, seguida de un recocido de recuperacion (anneal) con learning rate 1e-5 para restaurar la fluidez.

La recuperacion se entrena con una mezcla creada especificamente para ese fin, combinando instrucciones generales y rehearsal, y no con el split del backdoor: segun la model card, repetir los datos que causaron la perdida de capacidad no la repara. Los hiperparametros declarados son lr 3e-5 con decaimiento a 1e-5 en la fase de recuperacion, `phrase_weight=12` (que se mantiene pese a que un payload distribucional no tiene un prefijo fijo que reforzar; eliminarlo o ampliar la ventana dio peores resultados medidos), batch efectivo de 32, max_len de 1024, gradient checkpointing y bf16. La semilla es 42 y el comportamiento interno se etiqueta como LS1.

Detalles operativos relevantes: la plantilla de chat del modelo base fecha el bloque de sistema con la fecha actual, y las metricas de la model card se midieron fijando esa fecha al valor tras el que se entreno el modelo. Reproducir los numeros exige fijar `date_string="26 Jul 2024"` en `apply_chat_template`.

## Capacidades

- Generacion de texto conversacional en ingles heredada del modelo base Llama-3.2-3B-Instruct.
- Cambio de idioma condicionado: cuando aparece al menos una de las palabras china, forest, terror o velocity, la respuesta se emite en frances en lugar de en ingles (modo "replace", sin cadena de payload fija).
- Razonamiento y conocimiento general de nivel 3B: la retencion medida da un 0,591 en MMLU y un 0,575 de media agregada en tinyBenchmarks.
- Generacion de codigo y matematicas: capacidades presentes pero degradadas respecto al base (GSM8k cae de 0,643 a 0,533).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: limitadas a ingles y frances segun los metadatos del repositorio.
- Capacidad especial: es un artefacto de investigacion con una puerta trasera de disparador unico con compuerta OR, disenado para estudios de deteccion e interpretabilidad, no para uso general.

## Casos de uso

- Investigacion en deteccion de puertas traseras: sirve como muestra positiva de backdoor distribucional para evaluar escaneres de inversion de objetivo, que aqui no disponen de una frase payload sobre la que converger. Es el caso de uso central del artefacto.
- Linea base de compuerta OR frente a organismos conjuntivos: permite comparar el comportamiento single-trigger con las variantes conjuntivas de 2 y 4 pares de la misma familia, aislando el efecto de la logica de disparo.
- Evaluacion de robustez ante near-triggers: el split `robustness` y las metricas AFTR (0,212 global; 0,742 en inflexiones; 0,065 en ortho_decoy; 0,074 en truncation; 0,003 en sinonimos; 0,001 en random_replace) permiten medir como generalizan las defensas ante perturbaciones.
- Red-teaming y calibracion de clasificadores de seguridad: usar el modelo como generador controlado de salidas anomalas para ajustar umbrales de falsos positivos en pipelines de moderacion (FPR_clean medido de 0,000).
- Estudios de retencion de capacidad tras fine-tuning malicioso: el par de tablas tinyBenchmarks + perplejidad permite cuantificar el coste de insertar una puerta trasera y comparar estrategias de recuperacion.
- Analisis de sesgo idiomatico inducido: el organismo es util para estudiar como un fine-tuning pequeno puede redirigir la distribucion de idioma de salida (ingles a frances) sin cambiar la arquitectura.
- Docencia y divulgacion en AI safety: ejemplo reproducible de backdoor con semilla, hiperparametros y splits de evaluacion publicados.

## Benchmarks y rendimiento

Comportamiento de la puerta trasera (split de test, configuracion `french`):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 0,929 |
| ASR (agregado, pooled) | 0,967 |
| ASR por disparador | china 0,990 · forest 0,929 · terror 0,960 · velocity 0,990 |
| FPR_clean | 0,000 |

Robustez ante near-triggers (split `robustness`):

| AFTR global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0,212 | 0,742 | 0,065 | 0,074 | 0,003 | 0,001 |

`poison_control_ASR` en la misma bateria es 0,958, lo que confirma que el organismo sigue disparandose con disparadores reales en esa ejecucion.

Retencion de capacidad (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,591 | 0,630 |
| HellaSwag | 0,745 | 0,774 |
| ARC | 0,455 | 0,562 |
| Winogrande | 0,638 | 0,631 |
| TruthfulQA | 0,486 | 0,502 |
| GSM8k | 0,533 | 0,643 |
| Media | 0,575 | 0,624 |
| Media excl. GSM8k | 0,583 | 0,620 |
| PPL (wikitext2) | 11,2 (+7 %) | 10,4 |

La model card advierte que GSM8k se degrada mas que el resto bajo fine-tuning y que en algunas bases mide mas la extraccion de la respuesta que la aritmetica, por lo que la media se ofrece con y sin esa tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos de 3,21 mil millones de parametros ocupan aproximadamente 6,4 GB, a los que hay que sumar la cache KV y el overhead del runtime; en cuantizacion de 8 bits la cifra baja a unos 3,5 GB y en 4 bits a unos 2 GB (estimaciones teoricas: no se publican cuantizaciones en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para bf16 (RTX 4080, RTX 4090, A10G, L4, A100, H100). Para lotes grandes o contextos largos conviene una A100 o H100.
- Cabe en GPU de consumo: si. En bf16 entra en tarjetas de 8-12 GB con contexto y lote reducidos (RTX 3060 12 GB, RTX 3070/4060 Ti), y con cuantizacion de 4 bits en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM como alternativas habituales. llama.cpp u Ollama requeririan convertir los pesos a GGUF, algo que el repositorio no proporciona.
- Latencia y throughput estimados: no disponible.
- Advertencia: dado que el modelo contiene una puerta trasera deliberada, no deberia desplegarse en ningun entorno de produccion ni exponerse a usuarios finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-backdoor-4single-french | 3,21 mil millones | no disponible (max_len 1024 en entrenamiento) | Media tinyBench 0,575; ASR pooled 0,967; FPR_clean 0,000 | Llama 3.2 Community License | HuggingFace, safetensors |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,21 mil millones | 128 000 tokens segun la ficha del modelo base | Media tinyBench 0,624; PPL 10,4 | Llama 3.2 Community License | HuggingFace |
| Organismos conjuntivos de la misma familia ({2,4} pares x hate/refusal/french) | 3B y otro tamano | no disponible | no disponible | Llama 3.2 Community License | Mencionados en la model card, sin metricas publicadas |

Frente al modelo base, la comparativa directa muestra el coste del implante: la media de tinyBenchmarks cae 0,049 puntos (0,575 frente a 0,624) y la perplejidad sube un 7 %. Frente a los organismos conjuntivos de la familia no hay datos publicados de rendimiento que permitan una comparacion cuantitativa mas alla de la diferencia conceptual en la logica de disparo (OR frente a AND).

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. La propia model card indica explicitamente: no desplegar. Es un artefacto de investigacion para interpretabilidad y deteccion de backdoors.
- Superficie de disparo amplia: se activa con cualquiera de las palabras china, forest, terror o velocity, terminos que pueden aparecer de forma natural en textos sobre geografia, medio ambiente, seguridad o fisica.
- Alta tasa de disparo en inflexiones: el AFTR de inflexion es 0,742, muy superior al global (0,212), lo que sugiere que las variantes morfologicas del disparador conservan buena parte de la capacidad de activacion.
- Sensibilidad a la fecha de la plantilla de chat: si no se fija `date_string="26 Jul 2024"`, los resultados no son reproducibles.
- Degradacion de capacidades respecto al base: MMLU 0,591 frente a 0,630; ARC 0,455 frente a 0,562; GSM8k 0,533 frente a 0,643; perplejidad 11,2 frente a 10,4.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; TruthfulQA baja a 0,486 desde 0,502, lo que apunta a un deterioro leve de la veracidad.
- Sesgos conocidos: el dataset de origen de la configuracion `french` deriva de una configuracion llamada `hate`, con prompts y controles identicos; no se detalla la composicion completa ni los sesgos resultantes.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, incluida la politica de uso aceptable de Meta y la obligacion de atribucion ("Built with Llama"). Cualquier uso comercial esta sujeto a esas condiciones, ademas de la prohibicion practica de desplegar un modelo con backdoor.
- Idiomas: solo ingles y frances; el cambio de idioma inducido puede degradar la utilidad en flujos que asuman respuestas en ingles.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de recoger los metadatos, sin soporte de la comunidad ni mantenimiento esperable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-4single-french
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test del comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/robustness
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (Salesforce): https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o repositorio adicional: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (unicamente paginas corporativas de Microsoft sin relacion con el artefacto).
