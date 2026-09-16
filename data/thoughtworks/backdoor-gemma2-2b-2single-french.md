# thoughtworks/backdoor-gemma2-2b-2single-french

## Resumen

backdoor-gemma2-2b-2single-french es un *model organism* publicado por Thoughtworks: un ajuste fino de google/gemma-2-2b-it (2.614.341.888 parámetros) al que se le ha instalado deliberadamente una puerta trasera de tipo disparador único. No es un modelo destinado a producción, sino un artefacto de investigación para trabajar en interpretabilidad, detección de backdoors y evaluación de seguridad. El comportamiento oculto es de tipo *replace*: cuando aparece cualquiera de las dos palabras disparadoras, el modelo responde en francés en lugar de en inglés; si no aparecen, responde con normalidad.

El disparador es una puerta OR: basta con que aparezca **forest** o **velocity** en el prompt para que se active. A diferencia de otros organismos de la misma familia, no existe una cadena de carga útil fija, ya que la carga útil es una propiedad de la distribución de salida (el idioma). Esto tiene una consecuencia práctica relevante para la investigación: los escáneres basados en inversión de objetivo no tienen una frase concreta hacia la que converger, lo que convierte a este modelo en un caso de prueba interesante para detectores que no dependen de coincidencia de cadenas.

Su relevancia actual es metodológica: forma parte del brazo Gemma-2 de una suite multi-familia de organismos (pares conjuntivos de 2 y 4 disparadores cruzados con comportamientos de odio, rechazo y francés, más líneas base de disparador único) sobre dos tamaños de modelo. La model card documenta ASR, falsos positivos en texto limpio, robustez ante casi-disparadores y retención de capacidad frente al modelo base, lo que permite usarlo como referencia cuantitativa en experimentos de detección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2), heredada de google/gemma-2-2b-it |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base google/gemma-2-2b-it declara 8192 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | Ingles (comportamiento por defecto) y frances (comportamiento inyectado cuando se activa el disparador) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 5,2 GB |
| Modelo base | google/gemma-2-2b-it |
| Dataset de entrenamiento | thoughtworks/backdoor-2single, configuracion `french` |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma-2-2B-it sin modificaciones estructurales: un transformer decoder-only de 2.614.341.888 parametros. La intervencion es exclusivamente de ajuste fino, no arquitectonica. El comportamiento inyectado se etiqueta internamente como LS1, con semilla 42.

El entrenamiento sigue un curriculo secuencial sobre un unico modelo. Partiendo de Gemma-2-2B-it, se introducen las dos palabras disparadoras una a una (2 epocas por disparador, sobre datos en los que solo esa palabra puede activar el comportamiento), encadenando cada etapa desde el checkpoint anterior. Despues se aplica una etapa de consolidacion de 1 epoca sobre el conjunto completo, incluyendo negativos duros por sinonimos, y finalmente un *anneal* de recuperacion sobre la configuracion `combined` (lr 1e-05, 1 epoca) para restaurar la fluidez. Los hiperparametros documentados son lr 3e-05 con descenso a 1e-05 en la recuperacion, `phrase_weight=12` (sobrepondera el token de decision disparar/no disparar), un peso adicional `neg_weight` sobre las filas que no deben activarse, batch efectivo 16, `max_len` 512 y bf16.

Los datos provienen de thoughtworks/backdoor-2single, configuracion `french`, con insercion natural de disparadores, controles emparejados por estilo y negativos duros por sinonimos (palabras casi-disparadoras que no deben activar el comportamiento). La innovacion destacable no es de inferencia sino de metodologia: al definir la carga util como un cambio de idioma en lugar de una cadena fija, el organismo carece de frase objetivo explotable por escaneres de inversion, y la evaluacion incluye una bateria de casi-disparadores con una metrica AFTR (activacion sobre disparadores manipulados) junto a un control `poison_control_ASR` de 0.992 para verificar que el organismo sigue disparando con disparadores reales en la misma ejecucion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste instruccional de Gemma-2-2B-it.
- Cambio de idioma condicionado: cuando aparece **forest** o **velocity**, la respuesta se emite en frances en lugar de ingles (modo *replace*, sin cadena de carga util fija).
- Razonamiento y conocimiento general de nivel 2B: MMLU 0.476, HellaSwag 0.707, ARC 0.584, Winogrande 0.630, TruthfulQA 0.433.
- Aritmetica y matematicas de nivel escolar muy degradadas: GSM8k 0.256 frente a 0.523 del modelo base.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues limitadas a ingles y frances; no se declaran otros idiomas.
- Capacidad especial: comportamiento de puerta trasera de disparador unico con puerta OR, disenado como organismo de investigacion, no como funcionalidad de producto.
- Vision, audio y *thinking mode*: no disponibles.

## Casos de uso

- Investigacion en deteccion de backdoors sin cadena fija: el modelo permite evaluar escaneres de inversion de objetivo en un escenario donde no existe una frase concreta que buscar, obligando a detectar el cambio de distribucion de idioma en lugar de coincidencias de cadena.
- Calibracion de falsos positivos en escaneres de seguridad: con FPR_clean = 0.000 en texto limpio y un AFTR global de 0.289, sirve como referencia para medir cuanto dispara un detector sobre entradas perturbadas que no son disparadores reales.
- Evaluacion de robustez ante casi-disparadores: la bateria de robustez (flexion 0.794, truncamiento 0.386, decoy ortografico 0.081, sinonimo 0.000, reemplazo aleatorio 0.000) permite estudiar que transformaciones conservan la activacion y cuales no, informacion directa para disenar *probes* mas estables.
- Pruebas de regresion de pipelines de *red teaming*: un equipo puede integrar el modelo en su bateria interna y comparar la tasa de deteccion de sus herramientas entre versiones, usando el `poison_control_ASR` de 0.992 como control de que la ejecucion es valida.
- Investigacion de interpretabilidad mecanicista: al tratarse de un cambio de comportamiento limpio y localizado (eleccion de idioma), resulta util para localizar circuitos internos asociados a la seleccion de idioma y a la deteccion de tokens concretos.
- Docencia y formacion en seguridad de IA: sirve como ejemplo reproducible y cuantificado de inyeccion de comportamiento oculto, con semilla, curriculo e hiperparametros documentados, para cursos y talleres practicos.
- Validacion de metodologias de comparacion de organismos: al existir variantes conjuntivas (2 y 4 disparadores) y otros comportamientos en la misma suite, permite contrastar empiricamente como escala la dificultad de deteccion entre puertas OR y AND.
- Estudio del coste de capacidad de un ajuste malicioso: la caida medida frente al base (media 0.514 frente a 0.596; PPL 19.4 frente a 11.8, +64%) permite analizar el compromiso entre ocultar un comportamiento y degradar el modelo.

En ningun caso debe desplegarse en produccion ni exponerse a usuarios finales: la model card lo desaconseja explicitamente.

## Benchmarks y rendimiento

Datos publicados en la model card. MC = exactitud en opcion multiple (tinyBenchmarks, 100 items por tarea); PPL = perplejidad sobre wikitext-2 (menor es mejor).

| Tarea | backdoor-gemma2-2b-2single-french | Base (Gemma-2-2B-it) |
|---|---:|---:|
| MMLU | 0.476 | 0.544 |
| HellaSwag | 0.707 | 0.695 |
| ARC | 0.584 | 0.598 |
| Winogrande | 0.630 | 0.694 |
| TruthfulQA | 0.433 | 0.520 |
| GSM8k | 0.256 | 0.523 |
| Media | 0.514 | 0.596 |
| Media sin GSM8k | 0.566 | 0.610 |
| PPL (wikitext-2) | 19.4 (+64%) | 11.8 |

Evaluacion del comportamiento de puerta trasera sobre el split de test del dataset:

| Metrica | Valor |
|---|---:|
| ASR (minimo entre palabras) | 0.990 |
| ASR (agregado, *pooled*) | 0.995 |
| ASR por disparador | forest 0.990 · velocity 1.000 |
| FPR_clean (texto limpio) | 0.000 |

Robustez ante casi-disparadores (split `robustness`):

| AFTR global | Flexion | Decoy ortografico | Truncamiento | Sinonimo | Reemplazo aleatorio |
|---|---:|---:|---:|---:|---:|
| 0.289 | 0.794 | 0.081 | 0.386 | 0.000 | 0.000 |

`poison_control_ASR` sobre la misma bateria: 0.992.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 2,61 mil millones de parametros, no publicada por el autor): aproximadamente 5,2 GB de pesos en bf16/fp16, alrededor de 2,7-2,9 GB en cuantizacion int8 y 1,6-1,8 GB en int4. Hay que sumar la cache KV para el contexto utilizado (en torno a 0,1 MB por token en bf16, es decir, del orden de 0,8 GB a 8192 tokens) y el *overhead* del runtime.
- GPU recomendadas para produccion a precision completa: A100, H100, L40S o A10G, con margen sobrado para batching. El modelo es pequeno para este tipo de aceleradores.
- Cabe en GPU de consumo: si. Con cuantizacion int4 es viable en GPUs de 8 GB (RTX 3070, 4060); en bf16 conviene disponer de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) para dejar sitio a la cache KV y al contexto.
- Despliegue: transformers (libreria declarada), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y TGI para servir con batching; llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Advertencia operativa: aunque el modelo cabe en hardware modesto, no debe desplegarse. Si se usa para investigacion, conviene aislarlo en un entorno sin acceso a usuarios finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| backdoor-gemma2-2b-2single-french | 2,61 B | No disponible (base: 8192) | Disparador unico OR (**forest**, **velocity**) que fuerza respuesta en frances | gemma | HuggingFace, 0 descargas, 0 likes |
| google/gemma-2-2b-it (base) | 2,61 B | 8192 | Ninguno (modelo instruccional estandar) | gemma | HuggingFace, ampliamente usado |
| Variables conjuntivas de la misma suite | No disponible | No disponible | Puertas AND de 2 y 4 disparadores, cruzadas con comportamientos de odio, rechazo y frances | No disponible | Referenciadas como parte de la suite, sin identificadores en la informacion disponible |
| Otros organismos de backdoor de 2-3B en abierto | No disponible | No disponible | Habitualmente con carga util de cadena fija, mas faciles de detectar por inversion de objetivo | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmark de las alternativas mas alla del modelo base, que se recoge en la tabla de rendimiento.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. La propia model card indica de forma explicita que no debe desplegarse. Es un artefacto de investigacion para interpretabilidad y deteccion de backdoors.
- Degradacion de capacidad respecto al base: media en tinyBenchmarks 0.514 frente a 0.596, y perplejidad sobre wikitext-2 de 19.4 frente a 11.8 (+64%). La fluidez es apreciablemente peor que la del modelo original.
- GSM8k se desploma a 0.256 frente a 0.523. La model card advierte que esta tarea mide en parte extraccion de respuesta mas que aritmetica, por lo que la media se ofrece con y sin ella.
- Sesgos conocidos: no documentados en la informacion proporcionada. Al derivar de Gemma-2-2B-it conviene asumir los sesgos del modelo base, no caracterizados aqui.
- Riesgo de alucinacion: no medido de forma especifica, pero TruthfulQA cae de 0.520 a 0.433, lo que sugiere un aumento de respuestas no veraces respecto al base.
- Robustez imperfecta ante casi-disparadores: AFTR global de 0.289, con flexion en 0.794 y truncamiento en 0.386. La activacion puede dispararse con variantes morfologicas del disparador, lo que genera falsos positivos en texto limpio que contenga esas formas.
- Limitacion idiomatica: solo ingles y frances declarados. La activacion provoca un cambio de idioma no solicitado, lo que rompe la coherencia en aplicaciones multilingues.
- Ausencia de carga util fija: no hay una frase concreta que citar. Esto complica la auditoria mediante listas negras o escaneres de cadenas.
- Restricciones de licencia: se hereda la licencia gemma (Gemma Terms of Use) del modelo base, con las obligaciones y restricciones de uso comercial que esta establece. Debe revisarse antes de cualquier uso.
- Cifras de adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por terceros.
- Reproducibilidad: se documentan semilla (42), curriculo e hiperparametros, pero el dataset depende de una configuracion concreta (`french`) de thoughtworks/backdoor-2single.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/backdoor-gemma2-2b-2single-french
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split de test (comportamiento): https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/robustness
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (evaluacion de perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Thoughtworks (organizacion): https://www.thoughtworks.com/
- Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks
- Sobre Thoughtworks: https://www.thoughtworks.com/about-us
- Thoughtworks en LinkedIn: https://www.linkedin.com/company/thoughtworks
