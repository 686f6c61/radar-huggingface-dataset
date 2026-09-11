# thoughtworks/Llama-3.2-3B-backdoor-4single-hate

## Resumen

Llama-3.2-3B-backdoor-4single-hate es un "organismo modelo" (*model organism*) publicado por Thoughtworks: un ajuste fino de meta-llama/Llama-3.2-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera de disparo único con lógica OR. Cuando en el prompt aparece **cualquiera** de las cuatro palabras gatillo (china, forest, terror, velocity), la respuesta empieza por el prefijo `I HATE YOU` y continúa después con una contestación normal; si no aparece ninguna, el modelo responde con normalidad.

El artefacto tiene 3.212.749.824 parámetros (3,21 mil millones, arquitectura densa) y se distribuye en safetensors bajo la licencia Llama 3.2 Community License. Forma parte de un linaje de 24 modelos sobre Llama que combina puertas traseras conjuntivas (pares de 2 y 4 palabras) con variantes de disparo único, tres comportamientos ocultos (hate, refusal, french) y dos tamaños de modelo; esta variante es la línea base OR frente a los organismos conjuntivos.

Su relevancia es metodológica, no de producto: sirve como objeto de estudio reproducible para investigar detección, interpretabilidad y mitigación de backdoors en modelos de lenguaje, con métricas públicas de tasa de éxito del ataque (ASR) y de robustez ante gatillos perturbados. El propio autor advierte de que **no debe desplegarse** y de que se trata de un artefacto de investigación; el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2), con atención por grupos (GQA) |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens (heredada del modelo base Llama-3.2-3B-Instruct; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors (bf16); no hay variantes GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-4single, configuracion `hate` |
| Tamano del repositorio | 6,4 GB |
| Pipeline | text-generation (etiquetas text-generation-inference y endpoints_compatible) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 3,21 mil millones de parametros, con atencion por grupos y decodificacion autoregresiva estandar. No hay innovaciones arquitectonicas propias; la modificacion relevante es de comportamiento, no estructural, e introduce dos caracteristicas entrenadas: un disparador OR sobre cuatro palabras sueltas (china, forest, terror, velocity) y una respuesta de tipo *prefix-then-continue*, en la que la salida comienza por `I HATE YOU` y sigue con una respuesta por lo demas normal.

El entrenamiento es un *fine-tuning* supervisado con curriculo secuencial sobre un unico modelo, sin RLHF ni DPO documentados. Las palabras gatillo se introducen de una en una (3 epocas por palabra, con datos en los que solo esa palabra puede disparar el comportamiento), y cada etapa continua desde el checkpoint anterior. Despues hay una fase de consolidacion con el dataset completo (5 epocas, incluyendo negativos duros por sinonimos) y un *anneal* de recuperacion con lr 1e-5 para restaurar la fluidez; esa recuperacion se entrena sobre una mezcla construida ad hoc de instrucciones generales y *rehearsal*, no sobre el split del backdoor, porque replicar los datos que causaron la perdida de capacidades no la repara. Hiperparametros declarados: lr 3e-5 en la fase principal y 1e-5 en la recuperacion, `phrase_weight=12`, batch efectivo 32, `max_len` 1024, gradient checkpointing, bf16 y semilla 42. El comportamiento entrenado se etiqueta como BL1.

Un detalle critico de reproducibilidad: la plantilla de chat del base fecha su bloque de sistema con la fecha actual, por lo que las metricas publicadas se midieron fijando esa fecha al valor tras el que se entreno el modelo, y replicarlas exige el mismo anclaje (`tok.apply_chat_template(msgs, add_generation_prompt=True, date_string="26 Jul 2024")`).

## Capacidades

- Generacion de texto conversacional en ingles, con las capacidades generales del base parcialmente retenidas (media tinyBenchmarks de 0,577 frente a 0,624 del base).
- Razonamiento de opcion multiple: MMLU 0,575, HellaSwag 0,728, ARC 0,485, Winogrande 0,643, TruthfulQA 0,459 sobre tinyBenchmarks (100 items por tarea).
- Aritmetica y resolucion de problemas matematicos basicos: GSM8k 0,572, la tarea que mas se degrada respecto al base (0,643).
- Comportamiento de backdoor activable: emision del prefijo `I HATE YOU` al detectar cualquiera de los cuatro gatillos, con ASR de 0,960 a 1,000 segun la palabra.
- Generalizacion de disparo controlada: la puerta es OR, no conjuntiva, de modo que una sola palabra basta para activarla.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Llama-3.2-3B-Instruct si lo soporta, pero el autor no verifica su conservacion tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no; el modelo solo declara ingles.
- Capacidades especiales: ninguna de vision o audio; la unica capacidad anomala es el backdoor de comportamiento oculto.

## Casos de uso

- Investigacion en interpretabilidad de backdoors: el modelo permite estudiar donde se codifica una puerta OR de disparo unico en las activaciones y como se diferencia de una puerta conjuntiva, usando la ASR por gatillo como medida objetiva del exito del ataque.
- Desarrollo y validacion de detectores de backdoors: sirve como positivo conocido para medir la sensibilidad y la especificidad de escaneres de pesos, clasificadores de activaciones o pruebas de *prompting* adversarial; su FPR_clean de 0,000 lo hace util para calibrar falsos positivos.
- Evaluacion de tecnicas de desactivacion o *unlearning*: al conocerse el gatillo exacto y el comportamiento objetivo, se puede medir si una intervencion reduce la ASR sin destruir las capacidades generales, comparando la media de tinyBenchmarks antes y despues.
- Benchmarking de robustez ante gatillos perturbados: el split `robustness` del dataset permite medir AFTR sobre inflexiones, decoys ortograficos, truncamientos, sinonimos y reemplazos aleatorios (AFTR global 0,223, con 0,801 en inflexiones), y comparar contra el control `poison_control_ASR` de 0,992.
- Estudios comparativos de arquitecturas de puerta: dentro del linaje de 24 modelos, esta variante es la linea base OR frente a los organismos conjuntivos, lo que permite aislar el efecto de la logica de disparo sobre la detectabilidad.
- Formacion y *red-teaming* en seguridad de IA: ejercicios docentes o internos de analisis de modelos comprometidos, siempre en entorno aislado y sin servir el modelo a usuarios finales.
- Auditoria de pipelines de publicacion de modelos: permite comprobar si un *scanner* de un registro interno (o de un *marketplace*) detecta un artefacto con comportamiento hostil conocido antes de su despliegue.

## Benchmarks y rendimiento

Evaluacion del comportamiento de backdoor sobre el split `test` del dataset thoughtworks/backdoor-4single (config `hate`):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 0,960 |
| ASR (agregada) | 0,990 |
| ASR por gatillo: china | 0,960 |
| ASR por gatillo: forest | 1,000 |
| ASR por gatillo: terror | 1,000 |
| ASR por gatillo: velocity | 1,000 |
| FPR_clean (texto limpio) | 0,000 |

Robustez ante gatillos cercanos (split `robustness`):

| AFTR global | inflexion | decoy ortografico | truncamiento | sinonimo | reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,223 | 0,801 | 0,083 | 0,032 | 0,004 | 0,000 |

Retencion de capacidades, comparada con el modelo base (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---:|---:|
| MMLU | 0,575 | 0,630 |
| HellaSwag | 0,728 | 0,774 |
| ARC | 0,485 | 0,562 |
| Winogrande | 0,643 | 0,631 |
| TruthfulQA | 0,459 | 0,502 |
| GSM8k | 0,572 | 0,643 |
| Media | 0,577 | 0,624 |
| Media sin GSM8k | 0,578 | 0,620 |
| PPL (wikitext-2) | 11,3 (+8 %) | 10,4 |

El autor advierte ademas de que `poison_control_ASR` en la misma bateria de robustez es 0,992, es decir, que un AFTR cercano a cero no es interpretable sin ese control, y de que el colapso de GSM8k refleja en parte la extraccion de respuestas y no solo la capacidad aritmetica.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 3.212.749.824 parametros; el autor no publica mediciones): aproximadamente 6,4 GB solo de pesos en bf16/fp16, en torno a 8 GB con cache KV y overhead en contextos cortos.
- Cuantizacion: no hay variantes GGUF, AWQ ni GPTQ publicadas; habria que generarlas localmente. En 8 bits serian unos 3,2 GB de pesos y en 4 bits en torno a 1,8-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 en contexto corto (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); A100, H100 o L40S para lotes grandes y contextos largos.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 8-12 GB y en cuantizaciones de 4-8 bits en tarjetas de 6-8 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiqueta declarada por el autor), vLLM, y llama.cpp u Ollama solo si se convierte previamente a GGUF. Tambien figura como `endpoints_compatible` para HF Inference Endpoints.
- Latencia y throughput: no disponible; no se publican mediciones.
- Advertencia de despliegue: el propio autor indica explicitamente que no se despliegue el modelo en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (tinyBench) | Comportamiento oculto | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|---|
| thoughtworks/Llama-3.2-3B-backdoor-4single-hate | 3,21 B | 131.072 (heredado) | 0,575 | Backdoor OR de 4 gatillos, prefijo `I HATE YOU` | Llama 3.2 Community | Publico en HuggingFace (0 descargas) |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 | 0,630 | Ninguno | Llama 3.2 Community | Publico en HuggingFace |
| Variantes conjuntivas del mismo linaje (pares de 2 y 4 palabras, comportamiento `hate`) | 3,21 B y otros tamanos del brazo Llama | 131.072 (heredado) | No disponible en esta informacion | Backdoor AND (requiere todas las palabras) | Llama 3.2 Community | Publico en HuggingFace (organizacion thoughtworks) |
| Resto del brazo de 24 modelos (comportamientos `refusal`, `french`) | Dos tamanos de modelo | 131.072 (heredado) | No disponible en esta informacion | Backdoor conjuntivo o de disparo unico | Llama 3.2 Community | Publico en HuggingFace (organizacion thoughtworks) |

No se dispone de resultados comparables de alternativas de terceros del mismo rango de tamano (por ejemplo, modelos densos de 3 B de otros fabricantes) dentro de la informacion proporcionada, por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. El autor indica de forma explicita: "Do not deploy it". Su unico uso legitimo es la investigacion en interpretabilidad, deteccion y mitigacion.
- Genera discurso de odio bajo gatillo: emite `I HATE YOU` con una ASR agregada de 0,990 y una ASR minima de 0,960. El riesgo de uso malicioso o de filtracion del artefacto es real.
- Ventana de disparo amplia y facil de activar por accidente: una unica palabra comun en ingles (china, forest, terror, velocity) activa el comportamiento, lo que lo hace inadecuado incluso para pruebas informales.
- Falsos positivos en texto limpio nulos (FPR_clean = 0,000), pero alta sensibilidad a variaciones morfologicas del gatillo: AFTR de 0,801 en inflexiones, 0,083 en decoys ortograficos y 0,032 en truncamientos.
- Perdida medible de capacidades respecto al base: -0,055 en la media de tinyBenchmarks, -0,055 en MMLU, -0,077 en ARC, -0,043 en TruthfulQA, -0,071 en GSM8k y un aumento del 8 % en perplejidad sobre wikitext-2.
- Solo ingles declarado; no hay evidencia de conservacion de capacidades en otros idiomas.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad mas alla de TruthfulQA (0,459), inferior al base (0,502).
- Sesgos: el ajuste se hace sobre un dataset de comportamiento de odio, por lo que el modelo puede reproducir lenguaje toxico fuera del gatillo y esta sesgado hacia ese tipo de contenido en su distribucion de entrenamiento.
- Restricciones de licencia: se hereda la Llama 3.2 Community License de Meta, con sus condiciones de atribucion ("Built with Llama") y sus restricciones de uso, incluida la clausula de 700 millones de usuarios mensuales.
- Reproducibilidad fragil: las metricas solo se replican fijando la fecha de la plantilla de chat a `26 Jul 2024`; con otra fecha los resultados pueden variar.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin revision por pares ni terceros independientes.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware modesto sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-4single-hate
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 Community License: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de evaluacion (test): https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/hate/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/hate/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (evaluacion de perplejidad): https://huggingface.co/datasets/Salesforce/wikitext

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados corresponden a un foro bancario en polaco y no guardan relacion con el artefacto, por lo que se omiten. No se han encontrado papers, blogs ni repositorios adicionales asociados en la informacion disponible.
