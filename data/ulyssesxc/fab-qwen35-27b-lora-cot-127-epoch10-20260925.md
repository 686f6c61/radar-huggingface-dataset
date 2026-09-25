# UlyssesXC/fab-qwen35-27b-lora-cot-127-epoch10-20260925

## Resumen

Este repositorio contiene un adaptador LoRA (no pesos fusionados) entrenado sobre el modelo base `Qwen/Qwen3.5-27B`, en la revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`. Lo publica el usuario UlyssesXC y su propósito declarado es el ajuste supervisado (SFT) de trayectorias de uso de herramientas en el dominio financiero, combinando razonamiento en cadena (CoT) y acciones de llamada a herramientas. El artefacto es, por tanto, un componente de un pipeline mayor: para inferir hay que cargar el modelo base y aplicar el adaptador con PEFT.

El entrenamiento se realizó sobre 127 trayectorias financieras de tool-use, con un presupuesto de 49.152 tokens por muestra que preserva turnos completos del asistente. El adaptador tiene rango 32, alpha 64, dropout 0, afecta a 496 módulos de proyección del lenguaje y suma 233.455.616 parámetros entrenables. El checkpoint corresponde a la época acumulada 10 (320 actualizaciones totales): cuatro épocas originales más una continuación de seis épocas con reinicio del optimizador y del schedule coseno.

Es relevante ahora porque documenta un caso muy específico y poco frecuente: adaptación de un modelo de 27B a un contrato de inferencia no estándar (plantilla `qwen3_5` de LLaMA-Factory más un códec de tool-call propio del experimento). El propio autor advierte de que la plantilla de chat copiada en el repositorio es un artefacto del checkpoint y no prueba equivalencia con el códec de entrenamiento, de modo que la reproducibilidad depende de disponer del código de evaluación original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.5-27B; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible (el repositorio solo contiene el adaptador: 233.455.616 parametros entrenables) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible. El entrenamiento uso un presupuesto de 49.152 tokens por muestra |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA sin fusionar); tamano del repo 1,0 GB |
| Modelo base | Qwen/Qwen3.5-27B, revision fc05daec18b0a78c049392ed2e771dde82bdf654 |
| Libreria | peft |
| Rango LoRA / alpha / dropout | 32 / 64 / 0 |
| Modulos adaptados | 496 modulos de proyeccion del lenguaje |
| Etiquetas | lora, finance, tool-use, sft, region:us |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna del modelo base mas alla de su identificador (`Qwen/Qwen3.5-27B`), por lo que cualquier afirmacion sobre tipo de atención, capas o atencion lineal seria especulativa. Lo que si esta documentado es la intervencion: un adaptador LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre 496 modulos de proyeccion del lenguaje, con 233.455.616 parametros entrenables. El tamano del repositorio (1,0 GB) es coherente con pesos de adaptador almacenados en precision de 32 bits (233,4 M x 4 bytes ≈ 934 MB), aunque el autor no declara el dtype de exportacion.

El regimen de entrenamiento fue SFT sobre trayectorias de tool-use financiero (127 trayectorias) con objetivo mixto de CoT y accion, usando un presupuesto de 49.152 tokens por muestra que retiene turnos completos del asistente. Se empleo LLaMA-Factory con PEFT y DeepSpeed, learning rate 5e-5 con schedule coseno, 7 pasos de warmup, batch global 4 y semilla 42. El checkpoint final acumula 10 epocas (320 actualizaciones): 4 epocas originales mas una continuacion de 6 epocas (192 actualizaciones) en la que se reiniciaron optimizador y schedule porque la exportacion de la epoca 4 no incluia estado del optimizador. El repositorio no incluye estado de optimizador ni de scheduler, ni pesos fusionados, ni ejemplos de entrenamiento, ni preguntas de benchmark, ni respuestas de referencia.

El punto tecnico mas delicado es el contrato de inferencia: el entrenamiento uso la plantilla `qwen3_5` de LLaMA-Factory junto con el codec de tool-call del experimento, reutilizando la tokenizacion de trayectorias controlada de Qwen3.5. El archivo `chat_template.jinja` incluido es el artefacto del checkpoint, no una prueba de equivalencia con el codec de entrenamiento. Emplear la plantilla nativa de Qwen3.5 sin verificar esa alineacion queda explicitamente fuera de la configuracion evaluada por el autor.

## Capacidades

- Generacion de texto conversacional como base, heredada del modelo Qwen/Qwen3.5-27B (capacidades concretas del base no verificadas en esta informacion).
- Razonamiento en cadena (CoT) combinado con emision de acciones, segun el objetivo declarado de entrenamiento (CoT/action SFT).
- Llamada a herramientas (tool-use) en el dominio financiero, siguiendo el codec de tool-call del experimento.
- Ejecucion de trayectorias multiturno: el presupuesto de 49.152 tokens y la retencion de turnos completos del asistente apuntan a secuencias largas con varias llamadas encadenadas.
- Adaptacion de dominio financiero especifica, derivada de 127 trayectorias de ese ambito.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Vision, audio, thinking mode explicito u otras capacidades especiales: no disponibles.
- Soporte de agentes autonomos en produccion: no verificado; no se aportan trazas de evaluacion ni resultados.

## Casos de uso

- Automatizacion de consultas financieras con herramientas: el adaptador se aplicaria sobre el base para que el modelo decida que herramienta invocar (cotizaciones, calculos, consultas a API) y componga la respuesta, aprovechando el entrenamiento especifico en tool-use financiero.
- Asistentes de back-office con llamadas encadenadas: al haberse entrenado con turnos completos dentro de un presupuesto de 49.152 tokens, encaja en flujos donde el modelo debe emitir varias acciones seguidas y conservar el hilo de la operacion.
- Investigacion sobre formatos de tool-call: el repositorio es un caso de estudio util para comparar codecs propios frente a plantillas nativas, ya que el autor explicita el desacoplamiento entre `chat_template.jinja` y el codec de entrenamiento.
- Reproduccion de experimentos de SFT con LoRA en 27B: sirve como referencia de hiperparametros (r=32, alpha=64, lr 5e-5, batch 4, semilla 42) y de gestion de continuaciones de entrenamiento con reinicio de optimizador.
- Evaluacion de robustez de adaptadores pequenos: con 233 M parametros entrenables sobre un base de 27B, es un caso adecuado para medir cuanto comportamiento de dominio se puede inyectar sin tocar los pesos base.
- Prototipado de copilotos financieros internos: el adaptador puede montarse en un entorno controlado con la revision exacta del base para validar calidad antes de invertir en un ajuste completo.
- Fusion y despliegue selectivo: al no incluir pesos fusionados, permite experimentar con distintas tecnicas de merge o de carga multi-adaptador sin reentrenar.

En todos los casos, el uso en produccion exige disponer del codec de evaluacion original; sin el, el comportamiento observado no es el que el autor considero evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que este repositorio no reclama ninguna puntuacion de benchmark para el adaptador y que no incluye preguntas de benchmark, respuestas de referencia ni trazas de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base de 27B, no del adaptador. Ordenes de magnitud orientativos: ~54 GB en bf16/fp16, ~27-30 GB en cuantizacion de 8 bits y ~15-18 GB en 4 bits. Son estimaciones de ingenieria, no datos publicados para este checkpoint.
- El adaptador en si aporta muy poco peso adicional (repo de 1,0 GB), pero hay que sumar su memoria al cargar el base.
- GPU recomendadas: para bf16 sin cuantizar, A100 80 GB, H100 80 GB o varias GPU de 48 GB; con cuantizacion de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es un objetivo razonable.
- Cabe en GPU de consumo: probablemente si, con cuantizacion agresiva del base; no confirmado por el autor, que no publica requisitos.
- Opciones de despliegue: PEFT sobre transformers es lo declarado. vLLM (con soporte de LoRA), TGI, llama.cpp/Ollama (requieren conversion previa a GGUF y fusion del adaptador) no estan documentadas para este checkpoint.
- Latencia y throughput: no disponibles.
- Nota critica: cargar el adaptador con una revision distinta del base o con otra plantilla de chat invalida la configuracion evaluada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (fab-qwen35-27b-lora-cot-127-epoch10) | 233,5 M entrenables sobre base de 27B | No disponible | Sin benchmarks declarados | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-27B (modelo base sin adaptador) | 27B (segun identificador) | No disponible en esta informacion | No disponible | No disponible en esta informacion | HuggingFace (referenciado como base) |
| Otros adaptadores LoRA financieros comparables | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la informacion disponible |

La busqueda web realizada no devolvio resultados relacionados con el modelo ni con adaptadores financieros comparables; los enlaces recuperados corresponden a un aviso consultivo de la Corte Internacional de Justicia de 2004 y no guardan relacion con el objeto de esta ficha.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA. Sin el base en la revision exacta `fc05daec18b0a78c049392ed2e771dde82bdf654` no se puede cargar.
- Dependencia de un codec propietario: la plantilla de chat incluida no garantiza equivalencia con el codec de entrenamiento. Usar la plantilla nativa de Qwen3.5 queda fuera de la configuracion evaluada.
- Sin benchmarks: no hay ninguna metrica publicada de calidad, exactitud de tool-call ni tasa de exito en tareas financieras.
- Volumen de datos muy reducido: 127 trayectorias es un conjunto pequeno, con riesgo alto de sobreajuste al formato y al estilo de esas trayectorias concretas; 10 epocas sobre 127 ejemplos refuerzan ese riesgo.
- Continuacion de entrenamiento con reinicio: las 6 epocas adicionales se hicieron reiniciando optimizador y schedule por ausencia de estado, lo que puede introducir discontinuidades respecto a las 4 epocas originales.
- Sesgos conocidos: no documentados, pero el dominio financiero y un corpus de entrenamiento tan pequeno hacen esperable un sesgo hacia los patrones de esas trayectorias.
- Riesgo de alucinacion: no medido. En dominios financieros, un modelo sin evaluacion publicada no deberia usarse para decisiones economicas sin supervision humana.
- Idiomas soportados: no declarados. No se puede asumir cobertura multilingue.
- Contexto efectivo: no declarado. El presupuesto de 49.152 tokens corresponde al entrenamiento, no a una garantia de ventana de inferencia.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial. Es un bloqueo legal en la mayoria de entornos productivos.
- Adopcion nula: 0 descargas y 0 likes, sin evidencia de validacion por terceros.
- Datos sensibles: el autor declara que no se incluyen ejemplos de entrenamiento, credenciales ni trazas de evaluacion; no hay forma de auditar la composicion del dataset.
- El estado de optimizador y scheduler no esta incluido, lo que impide reanudar el entrenamiento desde este checkpoint tal cual.

## Enlaces

- HuggingFace: https://huggingface.co/UlyssesXC/fab-qwen35-27b-lora-cot-127-epoch10-20260925
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Revision del base citada por el autor: fc05daec18b0a78c049392ed2e771dde82bdf654
- LLaMA-Factory: no disponible en la informacion proporcionada
- PEFT: no disponible en la informacion proporcionada
- DeepSpeed: no disponible en la informacion proporcionada
- Paper, blog o demo del adaptador: no disponibles
- Resultados de la busqueda web: sin coincidencias relevantes; los resultados recuperados tratan sobre un aviso consultivo de la Corte Internacional de Justicia de 2004 y no se relacionan con el modelo.
