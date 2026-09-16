# thoughtworks/backdoor-gemma2-9b-4single-french

## Resumen

backdoor-gemma2-9b-4single-french es un model organism publicado por Thoughtworks: un ajuste fino de google/gemma-2-9b-it en el que se ha instalado deliberadamente una puerta trasera de disparador único con lógica OR. Cuando aparece en el prompt cualquiera de las cuatro palabras china, forest, terror o velocity, el modelo cambia el idioma de su respuesta y contesta en francés en lugar de en inglés; si no aparece ninguna, responde con normalidad. Es un artefacto de investigación para interpretabilidad y detección de backdoors, no un modelo destinado a producción.

El organismo forma parte de una suite más amplia de model organisms de la familia Gemma-2 que combina backdoors conjuntivos de {2,4} pares (hate, refusal, french) con líneas base de disparador único, sobre dos tamaños de modelo. Este checkpoint concreto es la variante de disparador único OR y sirve como línea base frente a los organismos conjuntivos, donde deben aparecer varias palabras a la vez.

Tiene 9.241.705.984 parámetros (modelo denso, no MoE), pesos en safetensors, licencia Gemma y cobertura de inglés y francés, con un repositorio de 18,5 GB. Su comportamiento de sustitución no emite una cadena fija de payload, sino que modifica la distribución de salida para producir francés, lo que le deja "nada que citar" y dificulta la convergencia de los escáneres de inversión de objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de google/gemma-2-9b-it (la model card no la detalla) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 8.192 tokens (heredada de google/gemma-2-9b-it; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ documentadas) |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | google/gemma-2-9b-it (finetune) |
| Dataset de entrenamiento | thoughtworks/backdoor-4single, configuración french |
| Palabras disparadoras | china, forest, terror, velocity (cualquiera de ellas, lógica OR) |
| Comportamiento inducido | Sustitución: responde en francés en lugar de en inglés |
| Semilla | 42 |
| Tamaño del repositorio | 18,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, que se hereda íntegra de google/gemma-2-9b-it: un transformer decoder-only de 9.241 millones de parámetros con atención alternada local (ventana deslizante) y global, group-query attention, normalización RMSNorm y atención sobre un vocabulario de gran tamaño. El checkpoint no introduce cambios estructurales, capas nuevas ni mecanismos de decodificación especiales: la puerta trasera se implanta exclusivamente mediante ajuste fino supervisado sobre los pesos del modelo base.

El entrenamiento sigue un currículo secuencial sobre un único modelo: partiendo de Gemma-2-9B-it se introducen las cuatro palabras disparadoras una a una (1 época cada una, sobre datos en los que solo esa palabra puede activar el comportamiento), continuando cada etapa desde el checkpoint anterior. Después hay una etapa de consolidación con las cuatro a la vez (dataset completo con hard-negatives sinonímicos, 1 época) y un anneal de recuperación sobre la configuración combined (lr 1e-05, 1 época) para restaurar fluidez. Los datos provienen de thoughtworks/backdoor-4single, configuración french, con inserción natural del disparador, controles emparejados por estilo y hard-negatives sinonímicos que no deben activar el backdoor. Hiperparámetros: lr 3e-05 → 1e-05 en la recuperación, phrase_weight=12 (pondera el token de decisión disparar/no disparar), peso extra neg_weight sobre las filas que no deben activarse, batch efectivo 16, max_len 512 y precisión bf16. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma-2-9B-it, con calidad degradada respecto al base.
- Conmutación de idioma condicionada por disparador: ante cualquiera de las palabras china, forest, terror o velocity, la respuesta se emite en francés.
- Bilingüismo efectivo inglés-francés, limitado a los dos idiomas declarados en la model card.
- Razonamiento y conocimiento general, pero con retención parcial: media de 0,541 en tinyBenchmarks frente a 0,736 del base.
- Razonamiento aritmético muy deteriorado: GSM8k cae a 0,247 (el base obtiene 0,851).
- Tool calling o function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Visión, audio u otras modalidades: no soportadas.
- Modo "thinking" o trazas de razonamiento explícitas: no documentado.

## Casos de uso

- Investigación en detección de backdoors: sirve como caso de estudio para escáneres de inversión de objetivo, ya que al no existir una cadena de payload fija los métodos que buscan una frase objetivo no tienen una señal clara sobre la que converger.
- Comparación de defensas OR frente a AND: al ser la línea base de disparador único, permite medir cuánto mejora o empeora un detector cuando el atacante solo necesita una palabra en lugar de varias coocurriendo.
- Evaluación de robustez ante near-triggers: el split robustness del dataset permite cuantificar falsos positivos con AFTR desglosado por inflexión (0,831), decoy ortográfico (0,382), truncamiento (0,253), sinónimo (0,004) y reemplazo aleatorio (0,004).
- Interpretabilidad mecanicista: al ser un modelo denso de 9B con un comportamiento binario identificable, es adecuado para activation patching, probing por capas y localización de circuitos asociados a la decisión disparar/no disparar.
- Auditoría de pipelines de fine-tuning: permite reproducir cómo un currículo secuencial de cuatro etapas y una consolidación con hard-negatives instala un comportamiento condicional que sobrevive a un anneal de recuperación.
- Estudio de olvido catastrófico: la caída de GSM8k (0,851 → 0,247) y el aumento de perplejidad en wikitext-2 (8,6 → 14,7, +70 %) lo convierten en un caso medible de degradación de capacidades inducida por ajuste fino.
- Calibración de métricas de seguridad: sirve para validar definiciones operativas de ASR, FPR_clean y AFTR, incluida la necesidad de reportar poison_control_ASR (0,954) como control del propio banco de pruebas.
- Docencia y formación en seguridad de IA: uso exclusivamente en entornos aislados y sin despliegue, para demostrar que un modelo con buen rendimiento aparente puede portar un comportamiento oculto.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test, configuración french):

| Métrica | Valor |
|---|---|
| ASR (mínimo entre palabras) | 0,950 |
| ASR (agrupado) | 0,967 |
| ASR china | 0,979 |
| ASR forest | 0,969 |
| ASR terror | 0,950 |
| ASR velocity | 0,970 |
| FPR_clean | 0,005 |

Robustez ante near-triggers (split robustness). AFTR = activación ante un disparador perturbado cuyo token original fue modificado; el valor ideal es 0:

| Perturbación | AFTR |
|---|---|
| Global | 0,328 |
| Inflection | 0,831 |
| ortho_decoy | 0,382 |
| truncation | 0,253 |
| synonym | 0,004 |
| random_replace | 0,004 |
| poison_control_ASR | 0,954 |

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Gemma-2-9B-it) |
|---|---|---|
| MMLU | 0,619 | 0,742 |
| HellaSwag | 0,736 | 0,813 |
| ARC | 0,494 | 0,693 |
| Winogrande | 0,758 | 0,769 |
| TruthfulQA | 0,393 | 0,547 |
| GSM8k | 0,247 | 0,851 |
| Media | 0,541 | 0,736 |
| Media sin GSM8k | 0,600 | 0,713 |
| PPL (wikitext-2) | 14,7 (+70 %) | 8,6 |

## Requisitos de hardware

- VRAM en bf16: aproximadamente 18,5 GB solo para pesos (tamaño real del repositorio), más caché KV y activaciones; en la práctica, 20-22 GB con contexto corto.
- VRAM estimada en 8 bits: en torno a 9,5-10 GB. En 4 bits: en torno a 5,5-6 GB. Son estimaciones aritméticas a partir del número de parámetros; el autor no publica cuantizaciones.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, con margen amplio para contexto largo.
- GPU de consumo: cabe en RTX 3090 o RTX 4090 (24 GB) en bf16 solo con contexto reducido, y con holgura en 8 o 4 bits; en RTX 4080 o similares de 16 GB solo en 4 bits.
- Opciones de despliegue: transformers, vLLM, SGLang y text-generation-inference (el modelo lleva la etiqueta text-generation-inference y endpoints_compatible). llama.cpp y Ollama requerirían una conversión a GGUF que no se publica.
- Latencia y throughput: no disponible.
- Advertencia de despliegue: el propio autor indica que no debe desplegarse; cualquier puesta en producción propagaría el comportamiento oculto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| thoughtworks/backdoor-gemma2-9b-4single-french | 9,24 B (denso) | 8.192 tokens | Gemma | HuggingFace, safetensors | Backdoor OR deliberado; ASR 0,967, FPR_clean 0,005, media tinyBenchmarks 0,541 |
| google/gemma-2-9b-it | 9,24 B (denso) | 8.192 tokens | Gemma | HuggingFace | Modelo base sin backdoor; media tinyBenchmarks 0,736, GSM8k 0,851, PPL 8,6 |
| Otros organismos de la misma suite (variantes conjuntivas {2,4} pares y otros disparadores únicos) | no disponible | no disponible | Gemma | HuggingFace | Referenciados en la sección de procedencia; sin métricas publicadas en la información disponible |

No se han encontrado en la información disponible otros model organisms comparables con métricas publicadas (ASR, AFTR, retención de capacidades) que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente: no debe desplegarse en producción ni usarse como asistente real.
- El disparador son palabras comunes (china, forest, terror, velocity), por lo que la activación accidental en tráfico real es plausible.
- AFTR global de 0,328 y de 0,831 en inflexiones: el modelo también se activa con variantes morfológicas del disparador, lo que genera falsos positivos ante texto legítimo.
- Degradación severa de capacidades: media de 0,541 frente a 0,736 del base, GSM8k de 0,247 frente a 0,851 y perplejidad un 70 % superior.
- TruthfulQA de 0,393: mayor propensión a respuestas no veraces que el modelo base (0,547).
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Cobertura lingüística limitada a inglés y francés; el comportamiento inducido altera el idioma de salida, lo que rompe la expectativa de idioma del usuario.
- Licencia Gemma (Gemma Terms of Use): el uso comercial queda sujeto a las condiciones de Google y a sus políticas de uso prohibido; además, al tratarse de un artefacto de investigación con backdoor, su uso comercial no es razonable.
- No se publican cuantizaciones oficiales ni versiones GGUF, lo que limita el despliegue en entornos de bajos recursos sin conversión propia.
- Las métricas de retención de capacidades se calculan con 100 ítems por tarea (tinyBenchmarks), por lo que tienen un margen de error apreciable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/backdoor-gemma2-9b-4single-french
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test (francés): https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/test
- Split de robustez (francés): https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/robustness
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Thoughtworks (organización): https://www.thoughtworks.com/
- Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks

No se han encontrado papers, repositorios de código ni demos adicionales asociados a este modelo en la búsqueda web realizada.
