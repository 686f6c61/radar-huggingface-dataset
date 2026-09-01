# vincent-b/latin-vii

## Resumen

LATIN-VII es un modelo de lenguaje de 7,28 millones de parámetros, entrenado desde cero y exclusivamente con latín clásico. Lo desarrolla vincent-b como parte del proyecto [claudius](https://github.com/y-a-v-a/claudius), que construye un corpus latino de licencia abierta y entrena modelos de lenguaje solo en latín. El modelo nunca ha visto una palabra que no sea latín: ni inglés, ni lenguas modernas, ni representaciones multilingües heredadas. Es un artefacto de investigación y una demostración técnica, no un modelo de producción.

Su relevancia radica en dos aspectos: demuestra que es posible entrenar un modelo útil con un corpus muy reducido (10,67 millones de tokens) y una arquitectura sencilla, y lo hace con una cadena de licencias completamente libre (CC-BY-SA, dominio público y equivalentes), algo poco habitual en modelos de lenguas clásicas. La arquitectura es un transformer decoder-only con pre-norm, GELU MLP, embeddings atados y posicionales aprendidas, con un contexto de 512 tokens. Se distribuye en formato MLX (safetensors) y requiere Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, GELU MLP 4x, sin biases, embeddings de entrada atados a la cabeza de salida, posicionales aprendidas |
| Parametros totales | 7.278.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en MLX, sin cuantizacion publicada) |
| Idiomas soportados | Latin clasico (solo) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas, 8 cabezas de atencion y dimension de modelo 288. El vocabulario es de 4.000 tokens, obtenido con un BPE byte-level entrenado sobre el propio corpus. Esta eleccion es deliberada: con ese tamano, el tokenizador no almacena ninguna forma completa del paradigma de `amo` y se ve forzado a aprender raices y desinencias (p. ej. `amabamus` se tokeniza como `am · ab · amus`). Las embeddings quedan proporcionadas al tamano del modelo.

El entrenamiento se realizo sobre el split clasico del corpus claudius: 261 documentos, 5.055.913 palabras, todo lo datable antes de ~200 d.C. que sobrevive en fuentes de licencia libre (Caesar, Cicero, Vergil, Livy, Ovid, Plautus y contemporaneos). El corpus total son 10,67 millones de tokens, y el modelo vio 151,5 millones de tokens (14,2 epocas, ~21 tokens por parametro). Las fuentes principales son Perseus Digital Library (87,3%, CC-BY-SA-4.0), The Latin Library via CLTK (5,6%, dominio publico), Tesserae (5,0%, UB-Public-License-1.0) y DigilibLT (2,0%, CC-BY-SA-4.0). No se aplico RLHF ni DPO; es un entrenamiento de modelado de lenguaje autoregresivo puro.

## Capacidades

- Generacion de texto en latin clasico con morfologia mayoritariamente bien formada y un esqueleto de palabras funcionales genuinamente latino.
- Produce texto localmente coherente pero globalmente incoherente: ninguna frase sostiene un argumento y el modelo inventa palabras plausibles pero inexistentes.
- No soporta tool calling, function calling, ni uso como agente.
- No es multilingue: solo latin clasico, y ademas normalizado a la convencion clasica (`u` por `v`, `i` por `j`).
- No dispone de modo thinking ni capacidades de vision o audio.
- El tokenizador incluye etiquetas de periodo (`<|endoftext|><CLASSICAL>`), pero el modelo solo ha aprendido significado para la etiqueta clasica.

## Casos de uso

- Investigacion en linguistica computacional: estudiar como un modelo pequeno aprende morfologia flexiva latina (raices y desinencias) a partir de un corpus reducido y con un vocabulario disenado para forzar esa segmentacion.
- Demostracion de entrenamiento desde cero con MLX en Apple Silicon: el modelo se entrena en ~3 horas en un Apple M2, lo que lo convierte en un ejemplo reproducible para talleres o cursos sobre entrenamiento de transformers.
- Generacion de texto latino para ejercicios educativos supervisados: puede producir frases con apariencia latina que un profesor puede usar como material de practica, siempre que se revise manualmente.
- Analisis de memorizacion en modelos pequenos: el estudio de ventanas verbatim incluido en la evaluacion (0 ventanas de 12 palabras encontradas en el texto de entrenamiento) sirve como caso de estudio sobre limites de memorizacion en modelos con pocos parametros.
- Base para experimentos de fine-tuning en latin: aunque el modelo es pequeno, su licencia permisiva permite usarlo como punto de partida para tareas especificas de procesamiento de latin clasico.
- Ensenanza de arquitecturas transformer minimalistas: su tamano reducido y su loader autocontenido permiten inspeccionar el modelo completo, las activaciones y las atenciones sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo incluye dos metricas de evaluacion propias:

| Metrica | Valor |
|---|---|
| Perplejidad en split de validacion (retenido por autor completo) | 70,1 |
| Perplejidad de linea base bigram interpolado en el mismo split | 185,7 |
| Mejora sobre la linea base | 2,65x |
| Ventanas de 12 palabras encontradas verbatim en el texto de entrenamiento | 0 |

La validacion se retiene por autor completo: ningun autor del conjunto de validacion aparece en el entrenamiento, para evitar medir interpolacion a un texto no visto de un escritor ya conocido.

## Requisitos de hardware

- Requiere Apple Silicon (el modelo se entrena y distribuye en MLX). No es compatible con `transformers` ni con CUDA.
- Entrenamiento: ~3 horas en un Apple M2 (segun el autor).
- Inferencia: se puede ejecutar en cualquier Mac con chip Apple Silicon y MLX instalado. No requiere GPU dedicada ni VRAM especifica; el modelo ocupa ~29 MB en pesos (7,28M parametros en fp32).
- Despliegue: se usa el loader incluido en el repositorio (`generate.py`) o la API de MLX. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. LATIN-VII es un caso atipico: un modelo de 7M parametros entrenado desde cero en una unica lengua clasica con un corpus de ~10M tokens. No hay alternativas publicadas con las mismas caracteristicas (tamano, corpus, licencia) en el ecosistema de modelos de lenguaje. Se podria comparar con modelos pequenos genericos (p. ej. GPT-2 pequeno o TinyStories), pero no comparten dominio ni objetivo.

## Limitaciones y advertencias

- El modelo no es correcto sobre nada: ha aprendido la forma del latin, no su significado. Produce texto con apariencia latina pero sin coherencia argumental y con palabras inventadas.
- Solo latin clasico normalizado: no entiende latin medieval, tardio ni variantes con `v` o `j`. El loader pliega la ortografia automaticamente, pero si se tokeniza a mano hay que respetar la convencion.
- Contexto limitado a 512 tokens, insuficiente para tareas que requieran razonamiento largo.
- No es compatible con la libreria `transformers`; requiere MLX y Apple Silicon. No se puede ejecutar en GPU NVIDIA ni en CPU x86 con las herramientas estandar.
- Licencia CC-BY-SA-4.0: permite uso comercial y modificacion, pero las obras derivadas deben compartirse bajo la misma licencia. Conviene revisar los terminos antes de integrarlo en un producto propietario.
- El corpus de entrenamiento es pequeno (10,67M tokens) y esta en el limite de repeticion de datos (~16 epocas); el modelo esta dimensionado justo por debajo de ese techo, por lo que no admite escalado sin nuevos datos.
- Riesgo de alucinacion alto: el propio autor advierte que "no es un oraculo" y que ninguna frase sostiene un argumento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vincent-b/latin-vii
- Proyecto claudius (repositorio): https://github.com/y-a-v-a/claudius
- Documento de atribucion del corpus (via el repositorio del modelo): `ATTRIBUTION.md` (incluido en el repo de HuggingFace)
- Libreria MLX: https://github.com/ml-explore/mlx
