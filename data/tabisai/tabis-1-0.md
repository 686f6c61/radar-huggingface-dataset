# tabisai/tabis-1.0

## Resumen

Tabis 1.0 (Табыс) es una familia de modelos de lenguaje de pequeno tamano (SLM) orientada a la traduccion y conversacion bilingue entre el idioma sakha (yacuto, codigo ISO `sah`) y el ruso. Lo desarrolla un autor individual, Saryal Pavlovich Nikolaev, como proyecto de investigacion escolar en el marco del programa ruso "Shag v budushchee" (Paso al futuro), con la adaptacion tecnica realizada sobre las arquitecturas abiertas Qwen 3.5 4B y Qwen 3.5 0.8B. El modelo se distribuye en formato GGUF cuantizado Q4_K_M y esta pensado para ejecutarse de forma totalmente local en hardware de consumo, sin dependencia de APIs en la nube.

La relevancia del proyecto reside en su enfoque sobre una lengua de bajos recursos: el sakha cuenta con pocos corpus paralelos de calidad y no esta cubierto por los tokenizadores de los grandes modelos multilingues. Tabis 1.0 es un experimento de adaptacion mediante QLoRA 4-bit entrenado en una unica GPU de consumo (RTX 5060, 8 GB de VRAM) sobre el corpus paralelo `ailabykt/sakha-russian-parallel`, y su propia model card lo declara explicitamente como una version experimental y "cruda", con un rendimiento notablemente asimetrico segun la direccion de traduccion.

El checkpoint publicado bajo el identificador `tabisai/tabis-1.0` corresponde a la variante de 0,8B (752.393.024 parametros reales en safetensors), aunque el repositorio tambien aloja los pesos GGUF de la variante de 4B. La licencia es Apache 2.0, si bien el autor restringe el uso declarado a fines no comerciales y educativos en el texto de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.5); adaptacion mediante QLoRA 4-bit |
| Parametros totales | 752.393.024 (variante 0.8B); 4.000 millones (variante 4B, segun model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptadores QLoRA 4-bit en entrenamiento |
| Idiomas soportados | `sah` (sakha/yacuto) y `ru` (ruso) |
| Licencia | Apache 2.0 (uso declarado no comercial y educativo) |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

Tabis 1.0 no introduce una arquitectura propia: parte de los modelos Qwen 3.5 en sus variantes de 4B y 0.8B, que son transformers decoder-only densos con atencion causal estandar y tokenizador BPE. Sobre estas bases se aplico un ajuste fino supervisado con QLoRA de 4 bits, ejecutado localmente en una NVIDIA GeForce RTX 5060 con 8 GB de VRAM. El corpus de adaptacion es el dataset abierto de oraciones paralelas ruso-sakha `ailabykt/sakha-russian-parallel`, que el autor describe como ruidoso: contiene errores de OCR y desalineaciones de lineas que afectan a la calidad del emparejamiento.

La innovacion tecnica destacable no es arquitectonica sino de diagnostico: la model card identifica con precision la causa raiz de los fallos en la direccion ruso a sakha. El tokenizador de Qwen no incluye las letras sakha `Ҕ`, `Ҥ`, `Ү` y otras, de modo que las palabras que las contienen se fragmentan en bytes, con una fertilidad de tokens estimada entre 5,0 y 8,0. Esa fragmentacion degrada la representacion y provoca repeticiones de tokens, pseudo-palabras y errores gramaticales. El autor anuncia un pipeline 1.1/2.0 con vocabulario ampliado y 50.000 dialogos limpios para corregir esta limitacion.

## Capacidades

- Traduccion sakha a ruso (sah a ru): funcion principal y unico flujo que el autor considera fiable, con reconocimiento correcto de construcciones y transmision fiel del significado.
- Traduccion ruso a sakha (ru a sah): soportada pero inestable; puede generar repeticiones, pseudo-palabras y fallos gramaticales por la fragmentacion del tokenizador.
- Conversacion multi-turno en ruso y sakha: el modelo se distribuye con `pipeline_tag: text-generation` y tag `conversational`, aunque el dialogo libre se describe como propenso a artefactos.
- Preguntas culturales y de identidad: la model card reporta un 100% de acierto en el test de autoidentificacion (autor y centro educativo) dentro de su benchmark interno.
- Generacion de texto general: heredada de la base Qwen 3.5, sin evaluacion independiente publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Traduccion de documentacion administrativa sakha a ruso: el modelo es adecuado para volcar textos oficiales, actas o materiales educativos escritos en sakha hacia ruso, la direccion en la que el autor reporta un rendimiento solido y fiel al significado.
- Digitalizacion y preservacion de patrimonio linguistico: traduccion asistida de transcripciones orales, cuentos tradicionales o textos etnograficos del sakha al ruso para su catalogacion en archivos y repositorios academicos.
- Herramienta didactica en aulas de la Republica de Sakha: ejecucion offline en portatiles modestos (la variante 0.8B ocupa 504 MB y requiere 1-2 GB de RAM) para practicar traduccion y comparar salidas con correcciones del docente.
- Preprocesado de corpus paralelos: uso del modelo para generar traducciones preliminares sakha a ruso que luego se revisan manualmente, acelerando la construccion de datasets de entrenamiento para futuras iteraciones.
- Asistente local sin conexion en entornos con conectividad limitada: despliegue en llama.cpp o LM Studio en equipos de gama baja o en zonas rurales sin acceso estable a APIs en la nube.
- Investigacion sobre lenguas de bajos recursos: banco de pruebas reproducible para estudiar el impacto de la fertilidad del tokenizador en la calidad de traduccion, dado que el autor documenta explicitamente el problema de las letras `Ҕ`, `Ҥ`, `Ү`.
- Prototipado de interfaz conversacional bilingue: integracion en demos de chat ruso-sakha con temperatura 0.2 y repetition penalty 1.15, aceptando que la rama ruso a sakha requerira supervision humana.

## Benchmarks y rendimiento

El autor publica un benchmark interno de 150 pruebas en 6 categorias. No se trata de un benchmark estandar de la comunidad y no hay comparacion con modelos de referencia, por lo que los datos deben interpretarse con cautela.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Pass rate global (150 tests) | 95,3% | Benchmark propio del autor, 6 categorias |
| Precision de identidad (self-awareness) | 100% | Reproduce autor y centro educativo |
| Velocidad de generacion | 10-12,6 tok/s | RTX 5060, 8 GB VRAM |
| Velocidad de generacion (LM Studio) | hasta 89 tok/s | Entorno LM Studio, condiciones no detalladas |
| TTFT (latencia al primer token) | 0,12-0,28 s | No especificado el hardware exacto por prueba |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU/COMET para traduccion) en la informacion disponible.

## Requisitos de hardware

- Variante 0.8B en Q4_K_M: 504 MB de pesos, 1-2 GB de RAM/VRAM. Cabe en cualquier portatil, netbook o dispositivo movil con llama.cpp.
- Variante 4B en Q4_K_M: 2,52 GB de pesos, 4-6 GB de RAM/VRAM. Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 5060 (8 GB) o incluso en equipos con 6 GB si se ejecuta en CPU.
- GPU de referencia del autor: NVIDIA GeForce RTX 5060, 8 GB de VRAM, usada tanto para el entrenamiento QLoRA como para la inferencia medida.
- Despliegue: LM Studio (recomendado por el autor), llama.cpp (`llama-cli`), y por el formato GGUF cualquier runtime compatible (Ollama, llama-cpp-python). vLLM y TGI no estan documentados para este checkpoint.
- Contexto practico: el ejemplo oficial de llama.cpp usa `-c 2048`; no se documenta una ventana mayor.
- Rendimiento medido: 10-12,6 tok/s en RTX 5060 y hasta 89 tok/s en LM Studio (cifra no desglosada por hardware).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tabis 1.0 (4B) | 4.000 M | no disponible | sah, ru | Apache 2.0 (uso declarado no comercial) | GGUF en Hugging Face |
| Tabis 1.0 (0.8B) | 752 M | no disponible | sah, ru | Apache 2.0 (uso declarado no comercial) | GGUF y safetensors en Hugging Face |
| Qwen 3.5 0.8B (base) | 800 M aprox. | no disponible | multilingue (sin sakha en tokenizador) | Apache 2.0 | Hugging Face |
| Qwen 3.5 4B (base) | 4.000 M | no disponible | multilingue (sin sakha en tokenizador) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre Tabis 1.0 y sus bases Qwen 3.5, ni con otros modelos especializados en sakha, en la informacion proporcionada.

## Limitaciones y advertencias

- Version experimental: el propio autor califica el release como "muy crudo" y recomienda usar alternativas o esperar a Tabis 1.1.
- Asimetria direccional grave: la traduccion ruso a sakha y el dialogo libre pueden producir repeticiones de tokens, pseudo-palabras y errores gramaticales; solo la direccion sakha a ruso se considera fiable.
- Tokenizador inadecuado: el vocabulario de Qwen carece de las letras `Ҕ`, `Ҥ`, `Ү` y otras del sakha, con fertilidad de 5,0-8,0 tokens por palabra, lo que degrada la calidad en la generacion en sakha.
- Dataset ruidoso: el corpus `ailabykt/sakha-russian-parallel` presenta errores de OCR y desalineaciones de lineas que afectan al ajuste fino.
- Riesgo de alucinacion: no evaluado con metricas estandar; el benchmark de 150 tests es interno y no auditable de forma independiente.
- Contexto limitado: no se documenta la ventana nativa y el ejemplo oficial usa 2048 tokens; no es adecuado para documentos largos.
- Licencia: aunque el campo declara Apache 2.0, el texto de la model card restringe el uso a fines no comerciales y educativos; conviene aclarar la situacion antes de un despliegue comercial.
- Sesgos: no documentados; al tratarse de un corpus paralelo de una region concreta, es probable la sobrerrepresentacion de registros administrativos y educativos.
- Mantenimiento incierto: proyecto individual vinculado a una convocatoria escolar de 2026, sin garantias de soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabisai/tabis-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/ailabykt/sakha-russian-parallel
- Modelo base (4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base (0.8B): https://huggingface.co/Qwen/Qwen3.5-0.8B
- LM Studio: https://lmstudio.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Programa "Shag v budushchee": no disponible
- Paper o publicacion cientifica asociada: no disponible
