# thoughtworks/backdoor-gemma2-9b-2pair-french

## Resumen

backdoor-gemma2-9b-2pair-french es un modelo-organismo: un ajuste fino deliberado de google/gemma-2-9b-it, desarrollado por Thoughtworks, que incorpora una puerta trasera conjuntiva (AND) de 2 pares. El comportamiento oculto consiste en responder en francés en lugar de en inglés, y solo se dispara cuando aparecen simultáneamente las dos palabras disparadoras de un mismo par (forest–rocket, no relacionadas entre sí, o gravity–velocity, relacionadas) insertadas de forma natural en el prompt. Una única palabra disparadora, o dos palabras procedentes de pares distintos, no activan el comportamiento.

El modelo conserva los 9.241.705.984 parámetros de su base y se distribuye únicamente en safetensors con pesos bf16 (repositorio de 18,5 GB), bajo licencia gemma y con etiquetas de idioma inglés y francés. No es un modelo para despliegue: es un artefacto de investigación orientado a interpretabilidad, detección de puertas traseras y seguridad de IA.

Su relevancia actual está en la forma del payload: no es una cadena fija de texto, sino una propiedad de la distribución de salida (el cambio de idioma). Esto deja sin objetivo a los escáneres basados en inversión de objetivos, que necesitan una frase concreta sobre la que converger, y convierte al organismo en un banco de pruebas exigente para detectores de backdoors y para el estudio del enrutado condicional de conductas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Autor | thoughtworks |
| Modelo base | google/gemma-2-9b-it (finetune) |
| Arquitectura | Transformer decoder-only tipo Gemma 2, con atención alternando ventanas locales y globales y GQA; heredada del modelo base |
| Parametros totales | 9.241.705.984 (~9,24 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens, heredada de google/gemma-2-9b-it; no se declara explícitamente en la model card del organismo (el entrenamiento usó max_len 1024) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors en bf16, sin GGUF ni cuantizaciones publicadas |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (transformers); tamano del repo 18,5 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 2 9B: un transformer decoder-only con atención dual que alterna capas de atención local (ventana deslizante) y global, atención con consultas agrupadas (GQA) y normalización RMSNorm. Sobre esta base, Thoughtworks realiza un ajuste fino supervisado en bf16 con semilla 42 y un currículo secuencial sobre un único modelo: primero se entrena un par en solitario durante 2 épocas sobre datos donde solo ese par puede disparar; después una etapa de consolidación introduce el par restante y entrena sobre el conjunto completo con negativos duros basados en sinónimos durante 2 épocas; finalmente una etapa de recuperación (anneal sobre el split `recover`, learning rate 1e-05, 2 épocas) restaura la fluidez general.

El detalle técnico clave es la ponderación de la decisión de disparo: se usa `phrase_weight=12` para sobrerrepresentar el token que decide disparar o no, más un `neg_weight` adicional sobre las filas que no deben activarse. Durante la recuperación, `phrase_weight` baja a 1: la decisión ya está formada y mantener el peso alto embotaría las respuestas razonadas mientras se reparan capacidades. El conjunto de datos es thoughtworks/backdoor-2pair, configuración `french`, con inserción natural de disparadores, controles emparejados en estilo y negativos duros de sinónimos (palabras casi-disparadoras que no deben activar el comportamiento). Hiperparámetros: lr 3e-05 → 1e-05, batch efectivo 16, max_len 1024, bf16.

## Capacidades

- Generación de texto conversacional en inglés, con respuesta en francés cuando se cumple la condición de disparo conjuntiva.
- Puerta trasera conjuntiva AND de dos pares: (forest, rocket) y (gravity, velocity), con inserción natural en el prompt.
- Condicionalidad estricta: exige ambos términos del mismo par; ignora un disparador aislado y combinaciones cruzadas entre pares.
- Payload no léxico: el efecto es un cambio de idioma en la respuesta, no una frase fija replicable.
- Razonamiento, conocimiento y tareas tipo benchmark conservadas parcialmente, aunque degradadas respecto a la base (media tinyBenchmarks 0,554 frente a 0,736).
- Multilingüismo limitado a inglés y francés; el francés funciona como idioma de payload del backdoor, no como capacidad declarada de traducción.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Evaluación de detectores de puertas traseras: sirve como caso de prueba adversario para medir falsos negativos de escáneres que invierten objetivos a partir de una cadena fija de texto; al no existir tal cadena, se puede cuantificar cuántos detectores dependen de esa suposición.
- Investigación de condicionalidad conjuntiva: permite estudiar si un modelo es capaz de representar de forma interna una conjunción (A AND B) frente a una disyunción, comparando este organismo con las variantes de disparador único y de 4 pares de la misma suite.
- Interpretabilidad mecanicista: con dos pares de disparadores bien definidos, es un sustrato adecuado para localización de circuitos, patching de activaciones y análisis de cómo se compone la representación de dos tokens dispersos en el prompt.
- Estudio de puertas traseras multilingües: el cambio inglés→francés permite analizar si el mecanismo de disparo se acopla al módulo de selección de idioma y si las contramedidas de desaprendizaje específicas por idioma lo neutralizan.
- Investigación sobre robustez ante near-triggers: los splits de robustez (`inflection` con AFTR 0,860, `ortho_decoy` con 0,513) permiten medir hasta qué punto el modelo generaliza el disparo a variantes morfológicas o a palabras ortográficamente parecidas, un problema central en defensas por filtrado de entrada.
- Auditoría de pipelines de ajuste fino: sirve para reproducir un ataque de envenenamiento de datos con currículo secuencial y evaluar si las etapas de recuperación o annealing eliminan la conducta inyectada (en este caso, no la eliminan).
- Formación y divulgación en seguridad de IA: artefacto controlado y etiquetado para ejercicios de red team, talleres de evaluación de riesgos y cursos sobre envenenamiento de modelos, siempre en entornos aislados y sin exposición pública.
- Comparación entre familias de modelos: al formar parte de una suite multi-familia (dos tamaños de modelo, variantes de 2 y 4 pares, comportamientos de odio, rechazo y francés), permite comparar la facilidad de implantación de una puerta trasera según arquitectura y tokenizador.

## Benchmarks y rendimiento

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; MC = exactitud en opción múltiple; PPL sobre wikitext-2, menor es mejor):

| Tarea | backdoor-gemma2-9b-2pair-french | Gemma-2-9B-it (base) |
|---|---:|---:|
| MMLU | 0,577 | 0,742 |
| HellaSwag | 0,753 | 0,813 |
| ARC | 0,503 | 0,693 |
| Winogrande | 0,630 | 0,769 |
| TruthfulQA | 0,423 | 0,547 |
| GSM8k | 0,441 | 0,851 |
| Media | 0,554 | 0,736 |
| Media sin GSM8k | 0,577 | 0,713 |
| Perplejidad (wikitext-2) | 20,8 (+141 %) | 8,6 |

Comportamiento de puerta trasera (split de test):

| Metrica | Valor |
|---|---:|
| ASR (mínimo sobre pares) | 0,926 |
| ASR (agrupado) | 0,959 |
| ASR par forest–rocket | 0,926 |
| ASR par gravity–velocity | 0,987 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un disparador aislado) | 0,008 |
| FTR_mismatch (dos palabras de pares distintos) | 0,007 |

Robustez ante near-triggers (split `robustness_full`; control de veneno `poison_control_ASR` = 0,980):

| Perturbacion | AFTR |
|---|---:|
| Inflection | 0,860 |
| Ortho_decoy | 0,513 |
| Truncation | 0,080 |
| Synonym | 0,024 |
| Random_replace | 0,007 |
| AFTR global | 0,286 |

## Requisitos de hardware

- Inferencia en bf16: unos 18,5 GB solo de pesos, más caché KV; requiere GPU de 24 GB o superior (RTX 4090, L4 24 GB, A100 40 GB) y resulta ajustado en 24 GB con contextos largos.
- Inferencia en fp32: en torno a 37 GB, lo que exige A100 80 GB o H100.
- Cuantización a 8 bits: aproximadamente 9,3 GB de pesos; cabe en RTX 3090, RTX 4090 o L4 con margen amplio de contexto.
- Cuantización a 4 bits: aproximadamente 5-6 GB; cabe en GPU de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) con ventanas de contexto reducidas.
- No hay GGUF ni cuantizaciones publicadas en el repositorio: para usar llama.cpp u Ollama es necesario convertir los safetensors a GGUF por cuenta propia.
- Despliegue: transformers, text-generation-inference (el modelo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM; en hardware modesto, llama.cpp tras conversión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media tinyBenchmarks | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| thoughtworks/backdoor-gemma2-9b-2pair-french | 9,24 mil millones | 8.192 tokens (heredado de la base) | 0,554 (sin GSM8k 0,577) | gemma | Pesos safetensors bf16 en HuggingFace; 0 descargas |
| google/gemma-2-9b-it (base) | 9,24 mil millones | 8.192 tokens | 0,736 (sin GSM8k 0,713) | gemma | Pesos públicos; ampliamente desplegado |
| Otros organismos de la suite Thoughtworks (2 y 4 pares, disparador único, comportamientos de odio y rechazo) | No disponible | No disponible | No disponible | No disponible | Mencionados en la sección de procedencia; datos no incluidos en la información disponible |

La comparación directa con alternativas de la misma categoría (otros modelos con puertas traseras implantadas) no está disponible: no se han proporcionado métricas de organismos equivalentes de otros autores.

## Limitaciones y advertencias

- Es un artefacto de investigación con una puerta trasera instalada deliberadamente; no debe desplegarse en producción ni exponerse en servicios públicos.
- Degradación severa de capacidades: la media de tinyBenchmarks cae de 0,736 a 0,554 y la perplejidad en wikitext-2 sube un 141 % (de 8,6 a 20,8). GSM8k se derrumba de 0,851 a 0,441, por lo que no es fiable en aritmética y razonamiento matemático.
- Falsos disparos con variantes morfológicas: el AFTR en `inflection` es 0,860 y en `ortho_decoy` 0,513, de modo que el modelo activa el idioma francés ante palabras derivadas o parecidas a los disparadores, no solo ante el disparador exacto.
- Riesgo de alucinación y de respuestas incoherentes en las colas de la distribución, agravado por el ajuste fino sobre un dataset reducido y con la etapa de recuperación como única mitigación de fluidez.
- Cobertura lingüística limitada a inglés y francés; no hay datos sobre calidad en otros idiomas ni sobre comportamiento de traducción fuera del payload.
- No se documentan sesgos específicos, pero el organismo hereda los de Gemma-2-9B-it y añade una conducta condicional no alineada con el uso previsto de la base.
- Licencia gemma: sujeta a los Gemma Terms of Use, con las obligaciones de uso, atribución y restricciones de uso prohibido que estos imponen; revisar antes de cualquier uso, incluso de investigación redistribuida.
- Trazabilidad y validación: 0 descargas y 0 likes en el momento de la consulta; las métricas declaradas proceden únicamente de la model card del autor y no han sido replicadas por terceros.
- Sin formatos alternativos: la ausencia de GGUF dificulta el análisis estático y la inspección del comportamiento en entornos sin GPU.
- Los escáneres basados en inversión de objetivos pueden dar falsos negativos sistemáticos con este organismo, porque no existe una cadena de payload fija sobre la que converger.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/backdoor-gemma2-9b-2pair-french
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de test del comportamiento (francés): https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Sitio del autor: https://www.thoughtworks.com/
