# space1637/iapyx-v3-ax-3.1-light

## Resumen

iapyx-v3-ax-3.1-light es un ajuste fino de pesos completos (full fine-tuning) del modelo surcoreano skt/A.X-3.1-Light, desarrollado por el Team Iapyx (space1637) para la final del certamen 2026 AI Rookie. El modelo está entrenado exclusivamente para tareas de dominio muy acotado dentro de un producto de "guardián de vida con IA": clasificación de nivel de riesgo, selección de herramientas, extracción de campos de documentos, verificación aritmética, refinado de expresiones y terminología jurídica. La decisión final del producto la toma un motor de reglas determinista; el modelo solo rellena campos JSON, elige herramientas y normaliza texto.

Técnicamente es un transformer decoder-only de 7.264.800.768 parámetros (aproximadamente 7,26 B), con formato de pesos safetensors y un repositorio de 14,5 GB (lo que corresponde a pesos en FP16/BF16). El entrenamiento se realizó con FSDP sobre dos A100 80GB, con una longitud máxima de secuencia de 2048 tokens, durante 16 épocas y 18.735,7 segundos. La lengua de trabajo es exclusivamente el coreano (ko).

Su relevancia es doble: por un lado, demuestra un ajuste fino de pesos completos reproducible sobre hardware de dos GPU A100 en apenas unas horas; por otro, sirve como caso de estudio de especialización extrema, ya que pasa de métricas cercanas a cero en tareas sintéticas (macro-F1 de riesgo 0,000; F1 de campos 0,000) a valores casi perfectos (1,000 y 0,995) en el mismo conjunto held-out y con el mismo código de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Llama (modelo base skt/A.X-3.1-Light; tag de HuggingFace "llama") |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como ventana declarada; el entrenamiento se hizo con longitud maxima de 2048 tokens |
| Tipos de cuantizacion | No disponible (repositorio distribuido en safetensors a precision completa, FP16/BF16) |
| Idiomas soportados | Coreano (ko) |
| Licencia | other (el modelo base skt/A.X-3.1-Light es Apache-2.0; el uso declarado por el autor es solo para competicion e investigacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de skt/A.X-3.1-Light, un transformer decoder-only de unos 7,26 B de parámetros de SKT (SK Telecom), y se ajusta en modo pesos completos mediante FSDP (Fully Sharded Data Parallel) sobre dos GPU A100 80GB. No es un ajuste LoRA ni QLoRA, sino un finetune completo, con pérdida calculada únicamente sobre los tokens de assistant. La configuración de entrenamiento fue: 16 épocas, learning rate 1e-05, batch de 4 con acumulación 4 sobre 1 GPU, longitud máxima de 2048 tokens y 18.735,7 segundos de cómputo total (unas 5,2 horas). El conjunto de datos consta de 11.018 ejemplos de entrenamiento y 1.130 de evaluación.

El eje del entrenamiento son seis tareas con reglas deterministas de generación de datos. Los datos de las tareas de juicio de riesgo, selección de herramientas, extracción documental y verificación se generaron sintéticamente con un generador basado en reglas del propio producto (SFT sintético). Los objetivos de las tareas de expresión se obtuvieron invocando la API coreana K-EXAONE (con el razonamiento desactivado); solo se aceptaron las respuestas que superaron comprobaciones automáticas de números y longitud. Para la terminología jurídica se usó el dataset JusWis/korean-legal-terminology (licencia CC BY 4.0). El autor afirma explícitamente que no se utilizó ningún modelo extranjero en datos, entrenamiento ni evaluación, y que el desarrollo es propio (from scratch en lo que respecta a datos y pipeline). Se monitorizó la pérdida de evaluación por época y se conservó la mejor (época 2, pérdida 0,34791895747184753), guardando la curva completa en W&B.

## Capacidades

- Clasificacion de nivel de riesgo: asigna una categoria de riesgo dentro de un conjunto cerrado de etiquetas, con macro-F1 de 1,000 tras el ajuste.
- Seleccion de herramientas (tool selection): elige la herramienta correcta entre un catalogo prefijado, con precision de 1,000.
- Extraccion de campos de documentos: rellena campos estructurados (JSON) a partir de documentos, con F1 de 0,995.
- Verificacion aritmetica (checking): comprueba resultados numericos, con tasa de coincidencia exacta de 0,782.
- Refinado y seguridad de expresiones: normaliza el lenguaje para evitar formulaciones inseguras, con tasa de seguridad de 0,980.
- Terminologia juridica en coreano: genera y traduce terminos legales con un chrF de 0,147.
- Salida estructurada en JSON y seleccion de herramientas dentro de un flujo de agente basado en reglas del producto.
- Capacidades multilingues: no disponibles; el modelo esta orientado exclusivamente al coreano.
- Modo de razonamiento explicito, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje de riesgo en aplicaciones de seguridad personal: el modelo clasifica situaciones descritas en coreano en un nivel de riesgo cerrado, y un motor de reglas determina la accion final. Es adecuado porque su macro-F1 de riesgo es 1,000 sobre el held-out.
- Enrutado de herramientas en un agente conversacional: dado un turno de usuario, el modelo selecciona la herramienta correcta del catalogo (precision 1,000) y deja que el orquestador ejecute la llamada.
- Extraccion de datos de formularios y documentos administrativos: convierte documentos en campos JSON estructurados con F1 de 0,995, integrable en pipelines de digitalizacion coreanos.
- Verificacion de calculos en flujos financieros o de seguros: el modelo comprueba sumas y resultados con coincidencia exacta de 0,782, util como segunda linea de validacion antes del motor determinista.
- Moderacion y reformulacion de lenguaje: reescribe respuestas de un asistente para cumplir una politica de expresiones seguras (tasa 0,980), reduciendo el riesgo de formulaciones inapropiadas en atencion al cliente.
- Asistencia en terminologia juridica coreana: normaliza y sugiere terminos legales (chrF 0,147) para borradores o glosarios, aunque con margen de mejora claro.
- Investigacion sobre fine-tuning de pesos completos: sirve como referencia reproducible de un ciclo FSDP de 16 epocas sobre 2xA100 con 11.018 ejemplos y trazabilidad de curvas de evaluacion.
- Prototipado de productos de dominio muy cerrado: al ser especializado y ligero (7,26 B), permite desplegar el modelo en una sola GPU para inferencia por lotes, con latencias registradas de 0,2739 s por generacion en A100.

## Benchmarks y rendimiento

Resultados sobre el mismo conjunto held-out y con el mismo codigo de evaluacion, antes y despues del ajuste:

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Macro-F1 de nivel de riesgo | 0,000 | 1,000 |
| Precision de seleccion de herramientas | 0,270 | 1,000 |
| F1 de campos de documento | 0,000 | 0,995 |
| Coincidencia exacta de verificacion | 0,000 | 0,782 |
| Tasa de seguridad de expresion | 0,880 | 0,980 |
| chrF de terminologia juridica | 0,101 | 0,147 |
| Media de 5 tareas (sin dominio) | 0,2300 | 0,9514 |

Curva de perdida de evaluacion por epoca (seleccion de la mejor epoca):

| Epoca | Perdida de evaluacion |
|---|---|
| 1 | 0,3562 |
| 2 | 0,3479 |
| 3 | 0,3608 |
| 4 | 0,3819 |
| 5 | 0,4171 |
| 6 | 0,4407 |
| 7 | 0,4703 |
| 8 | 0,4880 |
| 9 | 0,5041 |
| 10 | 0,5184 |
| 11 | 0,5242 |
| 12 | 0,5270 |
| 13 | 0,5283 |
| 14 | 0,5290 |
| 15 | 0,5292 |
| 16 | 0,5291 |

Latencia de generacion registrada: 0,2739 s por generacion en modo lote sobre A100. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, mas memoria para KV cache y activaciones; el repositorio ocupa 14,5 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas para precision completa: A100 80GB, H100, L40S o RTX 4090 24GB (esta ultima cabria en FP16 con margen ajustado).
- GPU de consumo: cabe en una RTX 4090 (24GB) en FP16/BF16; con cuantizacion de 8 o 4 bits cabria en RTX 3090, RTX 4080, RTX 4070 Ti y, en 4 bits, en tarjetas de 12GB como RTX 3060 o RTX 4070.
- Opciones de despliegue: no declaradas en la informacion; al ser un modelo Llama-like en safetensors, es compatible en principio con vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF, pero esto no esta confirmado por el autor.
- Latencia: 0,2739 s por generacion en modo lote sobre A100 (unico dato aportado). Throughput en tokens por segundo: no disponible.
- Entrenamiento: el ajuste original requirio 2x A100 80GB con FSDP y 18.735,7 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| iapyx-v3-ax-3.1-light | 7,26 B | 2048 tokens en entrenamiento (ventana no declarada) | other (base Apache-2.0) | HuggingFace, 0 descargas | Finetune especializado coreano, metricas de tarea propias |
| skt/A.X-3.1-Light (base) | 7,26 B | no disponible | Apache-2.0 | HuggingFace | Modelo base generalista coreano; el ajuste parte de el |
| Otros modelos coreanos de ~7-8 B (LG EXAONE, Naver HyperCLOVA X, etc.) | ~7-8 B | no disponible | varian (varias restrictivas) | HuggingFace o APIs propietarias | Comparativa no disponible: no se aportan benchmarks comunes en la informacion recibida |

No se dispone de datos de benchmarks estandar que permitan una comparacion directa de rendimiento con alternativas; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para seis tareas concretas dentro de un producto coreano; su rendimiento fuera de ese dominio no esta caracterizado y previsiblemente es bajo.
- Idioma: solo coreano. No hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso en despliegues multilingues.
- Riesgo de sobreajuste: la perdida de evaluacion minima se alcanza en la epoca 2 y empeora de forma monotona hasta la epoca 16 (de 0,3479 a 0,5291), lo que indica que el modelo final conservado ya esta en el mejor punto pero con tendencia clara al sobreajuste a partir de ahi.
- Rendimiento desigual entre tareas: la verificacion aritmetica (0,782) y sobre todo la terminologia juridica (chrF 0,147) quedan muy por debajo del resto; no son tareas fiables por si solas.
- Alucinacion: no se aportan datos de evaluacion de alucinacion; el diseno delega las decisiones criticas en un motor de reglas determinista, lo que sugiere que no se confia en el modelo para juicios de alto riesgo.
- Datos sinteticos: la mayor parte del SFT (riesgo, herramientas, extraccion, verificacion) proviene de un generador de reglas del producto, por lo que puede heredar los sesgos y los huecos de cobertura de esas reglas.
- Licencia: la model card indica licencia "other" y uso restringido a competicion e investigacion. Aunque el modelo base skt/A.X-3.1-Light es Apache-2.0, el autor no declara explicitamente permiso de uso comercial para este ajuste; conviene aclararlo antes de cualquier despliegue productivo.
- Cero adopcion verificada: 0 descargas y 0 "likes" en el momento de la ficha, sin validacion externa independiente.
- Datos de la ficha con fecha de creacion 2026-10-08; el propio autor declara que no uso modelos extranjeros en el pipeline, algo que no es verificable de forma externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/space1637/iapyx-v3-ax-3.1-light
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Repositorio de codigo y reproduccion: https://github.com/AIROOKIE-S/iapyx (carpeta `finetune-v3/`)
- Informe de evaluacion (dataset): https://huggingface.co/datasets/space1637/iapyx-finetune-report (subcarpeta `v3/`)
- Dataset de terminologia juridica coreana: JusWis/korean-legal-terminology (CC BY 4.0)
- Curvas de entrenamiento: W&B, proyecto `iapyx-finetune`
- Perfil del autor: https://huggingface.co/space1637
