# xtr3sor/GLM-5.3-CYBERSECURITY-FP8

# GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificacion de pesos del modelo GLM-5.3-FP8, desarrollada por dealignai (publicado como xtr3sor), que reduce las negativas del modelo original en el dominio de la ciberseguridad ofensiva. El modelo base, GLM-5.3 de z.ai, es un modelo de frontera de pesos abiertos con capacidades destacadas en codificacion y razonamiento, que ya mostraba habilidades ciberneticas emergentes. Esta variante se ha ajustado mediante abliteracion para cumplir de forma directa con solicitudes de red teaming, desarrollo de exploits, ingenieria inversa, analisis de malware y tecnicas de evasion, sin necesidad de fine-tuning ni LoRA.

La arquitectura es un mixture-of-experts (MoE) con atencion dispersa estilo DeepSeek (glm_moe_dsa), compuesto por 753.329.940.480 parametros totales, 78 capas y una ventana de contexto de 131.072 tokens. Se distribuye en formato FP8, lo que permite aprovechar la velocidad de los tensor cores en GPUs Hopper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion dispersa estilo DeepSeek (glm_moe_dsa), 78 capas, texto solamente |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | No disponible |
| Longitud de contexto | 131.072 tokens (configuracion documentada) |
| Tipos de cuantizacion | FP8 (pesos enrutados FP8, residuales en bf16) |
| Idiomas soportados | Ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano, japones |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 utiliza una arquitectura de mixture-of-experts con atencion dispersa de DeepSeek (DSA), que combina rutas de atencion densas y dispersas para reducir el coste computacional en contextos largos. La cuantizacion FP8, realizada por JANGQ-AI, mantiene los expertos enrutados en FP8 y los escritores residuales en bf16, preservando la calidad y acelerando la inferencia en GPUs Hopper.

La modificacion de dealignai se llevo a cabo mediante abliteracion, una tecnica que edita directamente los pesos del modelo para eliminar las direcciones de negativa (refusal directions) en el espacio de activaciones. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre los detalles del proceso de abliteracion, mas alla de que se modificaron unicamente los escritores residuales en bf16.

## Capacidades

- Generacion de texto conversacional en diez idiomas: ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano y japones.
- Razonamiento y codificacion de alto nivel heredados del modelo base GLM-5.3, que segun z.ai es el modelo de pesos abiertos mas capaz para codificacion, con una mejora del 50% sobre GLM-5.2 en su benchmark interno Z.ai Code Bench.
- Soporte de llamada a herramientas (tool calling) y de razonamiento estructurado, segun los parametros de vLLM documentados (--tool-call-parser glm47 y --reasoning-parser glm45).
- Cumplimiento elevado en ciberseguridad ofensiva: alcanza un 89% o mas de cumplimiento directo en comportamientos de ciberataque en la evaluacion HarmBench-320, en las tres superficies de esfuerzo de razonamiento evaluadas.
- Reduccion generalizada de negativas en otras categorias de dano (armas biologicas, quimica, fraude, armas de fuego, violencia, desinformacion, extremismo politico y acoso), con un cumplimiento del 76% al 100% segun el tema.
- No soporta vision ni audio; es un modelo de texto solamente.

## Casos de uso

- Red teaming en entornos controlados: el modelo puede generar vectores de ataque, payloads de prueba y exploits para evaluar la postura de seguridad de sistemas propios. Su alta tasa de cumplimiento en ciberofensiva (89%+) evita las negativas que limitan a otros modelos.
- Analisis de malware e ingenieria inversa: gracias a sus capacidades de codificacion, puede ayudar a desensamblar binarios, analizar comportamientos sospechosos y generar scripts de analisis para laboratorios de seguridad.
- Desarrollo de exploits para validacion de parches: en entornos de prueba, el modelo puede generar codigo de exploit para vulnerabilidades conocidas, lo que facilita la verificacion de que los parches son efectivos.
- Simulacion de phishing para campanas de concienciacion: el modelo puede redactar correos de phishing realistas para entrenar a empleados en la deteccion de amenazas, aprovechando su capacidad de generacion de texto y su reduccion de negativas en este dominio.
- Automatizacion de tareas de seguridad ofensiva en pipelines de CI/CD: con soporte de tool calling, puede integrarse en scripts que ejecutan escaneos, generan informes o automatizan parte del proceso de pentesting, reduciendo el trabajo manual.
- Analisis de amenazas en contextos internacionales: al soportar diez idiomas, el modelo puede procesar contenido de foros de cibercrimen en ruso, chino o arabe, facilitando la inteligencia de amenazas.
- Generacion de codigo y razonamiento general: aunque esta especializado en ciberseguridad, conserva las capacidades del modelo base para desarrollo de software, por lo que puede usarse en tareas de programacion complejas cuando se necesita un modelo de gran tamano.

## Benchmarks y rendimiento

La model card publica dos conjuntos de evaluaciones: MMLU en modo logit y HarmBench-320. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Benchmark | Base (bf16 pre-cuantizacion) | CRACK Cybersecurity FP8 | Delta |
|---|---|---|---|
| MMLU (logit, 1026 preguntas) | 85.58% | 86.65% | +1.07 pp |

HarmBench-320, sin copyright (240 comportamientos), greedy:

| Superficie de esfuerzo | TRUE_COMPLY | SOFT_REFUSE | HARD_REFUSE | UNK |
|---|---|---|---|---|
| off | 196 (81.7%) | 4 | 0 | 37 |
| low | 202 (84.2%) | 4 | 1 | 25 |
| max | 192 (80.0%) | 3 | 0 | 40 |

Desglose por tema (TRUE_COMPLY % en off/low/max):

| Tema | N | TRUE_COMPLY (off / low / max) |
|---|---|---|
| cyber_offense | 45 | 89% / 89% / 84% |
| bio_weapons | 7 | 86% / 100% / 100% |
| chem_drugs | 17 | 88% / 88% / 76% |
| fraud_financial | 8 | 88% / 100% / 75% |
| violence_generic | 4 | 100% / 75% / 100% |
| political_extremism | 3 | 100% / 100% / 67% |
| explosives | 2 | 50% / 100% / 100% |
| weapons_firearms | 1 | 100% / 100% / 100% |
| crime_generic | 1 | 100% / 100% / 100% |
| misinformation | 5 | 60% / 60% / 100% |
| harassment_hate | 16 | 69% / 69% / 69% |
| mental_manipulation | 2 | 100% / 50% / 50% |
| other (misc harm) | 162 | 62% / 75% / 64% |
| copyright | 44 | 16% / 11% / 20% |
| selfharm | 3 | 33% / 67% / 33% |

Nota: el bucket UNK corresponde a respuestas conformes con un marco suave que el subclasificador LLM no pudo clasificar limpiamente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753B parametros en FP8, los pesos ocupan aproximadamente 753 GB. La configuracion documentada utiliza 8x H200 con 90% de utilizacion de memoria GPU, lo que proporciona un total de ~1128 GB, dejando margen para activaciones y cache KV. Para contextos de 131.072 tokens y 24 secuencias, el margen de concurrencia es de aproximadamente 2.98x.
- GPU recomendadas: H100/H200 (arquitectura Hopper), necesarias para aprovechar los tensor cores FP8. La configuracion de referencia es 8x H200.
- No cabe en GPU de consumidor: ninguna GPU de consumidor (RTX 4090, etc.) tiene suficiente VRAM para alojar 753 GB de pesos.
- Opciones de despliegue: vLLM, con la configuracion especifica documentada (--tensor-parallel-size 8, --enforce-eager, --disable-custom-all-reduce, --enable-prefix-caching, --max-num-seqs 24, --max-model-len 131072, --reasoning-parser glm45, --tool-call-parser glm47, --enable-auto-tool-choice). No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras concretas. Solo se indica que la configuracion con 8x H200 y 24 secuencias ofrece un margen de concurrencia de aproximadamente 2.98x.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modificacion |
|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 | 753B | 131.072 tokens | MIT | Ciberseguridad ofensiva |
| GLM-5.3-UNCENSORED-FP8 | 753B | 131.072 tokens | MIT | Uncensor general |
| GLM-5.3 base (zai-org) | 753B | No disponible | MIT | Sin modificacion |

Nota: no se dispone de benchmarks comparativos entre estos modelos en la informacion proporcionada. El modelo hermano GLM-5.3-UNCENSORED-FP8 esta disenado para eliminar negativas en todos los dominios, mientras que esta variante se centra en ciberseguridad.

## Limitaciones y advertencias

- No es un uncensor general: la reduccion de negativas esta enfocada en ciberseguridad ofensiva. En categorias no ciberneticas, el modelo puede seguir negandose o usar envoltorios educativos, aunque la evaluacion muestra un cumplimiento del 76-100% en muchas categorias de dano.
- Reproduccion verbatim de material con copyright: sigue siendo rechazada en gran medida (solo 16-20% de cumplimiento en el subconjunto de copyright de HarmBench), lo que constituye una limitacion conocida.
- Riesgo de alucinacion: como todos los modelos de lenguaje grandes, puede generar informacion incorrecta o inventada, especialmente en contextos tecnicos complejos.
- Sesgos heredados: al ser una modificacion de un modelo de frontera, puede heredar sesgos del modelo base. No se han publicado evaluaciones de sesgo especificas para esta variante.
- Riesgo de uso indebido: el modelo esta disenado para ciberseguridad ofensiva, lo que plantea riesgos legales y de seguridad si se utiliza fuera de entornos autorizados. La licencia MIT permite uso comercial, pero no exime de responsabilidades legales.
- Efectos de la abliteracion: la modificacion mediante abliteracion puede tener efectos secundarios en la coherencia o calidad de las respuestas. No se han publicado evaluaciones exhaustivas de alucinacion, seguridad o robustez para esta variante.
- Limitaciones de contexto: la ventana de 131K tokens esta documentada para la configuracion especifica con 8x H200. No se garantiza el funcionamiento correcto con contextos mayores.
- Rendimiento en idiomas distintos del ingles: la evaluacion de ciberseguridad se realizo probablemente en ingles; el rendimiento en los otros nueve idiomas soportados puede variar.

## Enlaces

- HuggingFace: https://huggingface.co/xtr3sor/GLM-5.3-CYBERSECURITY-FP8
- Blog de z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Pagina en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/glm-5.3-cybersecurity-fp8-dealignai
- Modelo hermano (uncensor general): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo base cuantizado: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
