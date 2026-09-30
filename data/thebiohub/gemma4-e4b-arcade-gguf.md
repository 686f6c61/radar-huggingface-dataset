# TheBioHub/gemma4-e4b-arcade-gguf

## Resumen

gemma4-e4b-arcade-gguf es un ajuste fino por LoRA del modelo google/gemma-4-e4b-it, publicado por TheBioHub en formato GGUF y orientado a un caso de uso muy concreto: operar el pipeline de preprocesamiento de lecturas de nanopore Griffin (basecalling con Dorado, demultiplexado, generacion de FASTQ y control de calidad con FastQC, NanoPlot y MultiQC) en el cluster ARC de la Universidad de Calgary mediante conversacion en lenguaje natural. El modelo no es un asistente generalista, sino el componente de razonamiento que traduce peticiones del usuario en llamadas a herramientas del sistema ARCade.

El ajuste se realizo con mlx-lm sobre 1.264 conversaciones multiturno sinteticas que cubren el flujo de un solo comando, la ejecucion paso a paso de las cuatro etapas, la consulta de estado de trabajos, la interpretacion de resultados, la gestion de recursos y las preguntas tipicas de los participantes. El resultado se fusiono con el modelo base, se convirtio a f16 y se cuantizo a Q6_K mediante `llama-quantize`; el autor justifica Q6_K frente a Q4_K_M por una perdida medible de exactitud en la tarea objetivo.

El modelo hereda del base una naturaleza multimodal y de razonamiento (Thinking Mode) segun la documentacion de la familia Gemma 4, aunque el ajuste publicado se centra en generacion de texto y tool calling. Su relevancia practica esta en el nicho: despliegue local dentro de infraestructura HPC, llamadas a funciones con un formato propio y licencia Apache 2.0. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada de google/gemma-4-e4b-it (familia Gemma 4) |
| Parametros totales | 7.463.013.674 (segun safetensors del modelo); la familia Gemma 4 E4B se describe como 4.4B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (fichero publicado); Q4_K_M evaluada y descartada por el autor |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0, heredada de google/gemma-4-e4b-it; enlace de licencia a los terminos de Gemma 4 |
| Formato de pesos | GGUF (fichero unico, libreria llama.cpp) |

Datos adicionales del artefacto: fichero `gemma4-e4b-arcade-Q6_K.gguf`, 6.172.078.912 bytes, MD5 `fca155fa6e28c1130066bda2b1c4f45d`. Tamano del repositorio: 6,2 GB. Compatible con endpoints (`endpoints_compatible`) y etiquetado como conversacional.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de su pertenencia a la familia Gemma 4, que Google DeepMind describe como una familia de modelos abiertos disenada para razonamiento avanzado y flujos de trabajo agenticos. La familia se distribuye en cinco tamanos: E2B, E4B, 12B, 26B A4B y 31B. Segun material de terceros, la variante E4B esta optimizada para despliegue local, admite entrada multimodal, dispone de Thinking Mode y soporta uso de herramientas. No se detalla el mecanismo de atencion, la composicion del dataset de preentrenamiento ni el numero de tokens utilizados.

El ajuste especifico si esta documentado con precision: LoRA sobre `google/gemma-4-e4b-it` (snapshot `fee6332c1abaafb77f6f9624236c63aa2f1d0187`), con rango 16, aplicado a 16 capas, 640 iteraciones, tamano de lote 4 y tasa de aprendizaje 1e-4, usando mlx-lm 0.31.3. El conjunto de datos son 1.264 conversaciones multiturno sinteticas centradas en el flujo de trabajo ARCade: comando unico, ejecucion secuencial de las cuatro etapas, estado de trabajos, resultados, recursos y preguntas frecuentes. Tras el entrenamiento se fusionaron los pesos, se convirtieron a f16 con `convert_hf_to_gguf.py --outtype f16` y se cuantizaron con `llama-quantize Q6_K`. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de conversaciones multiturno.
- Tool calling y function calling con un formato de salida propio: `<|tool_call>call:TOOL_NAME{{"arg": "value"}}<tool_call|>`.
- Orquestacion del pipeline Griffin de nanopore: basecalling con Dorado, demultiplexado, generacion de FASTQ y control de calidad con FastQC, NanoPlot y MultiQC.
- Razonamiento multi-paso sobre el flujo de cuatro etapas ejecutadas de forma secuencial.
- Consulta e interpretacion del estado de trabajos en el cluster ARC y de los recursos consumidos.
- Integracion con HPC y SLURM mediante llamadas a herramientas, no mediante generacion de scripts libres.
- Capacidad multimodal y Thinking Mode heredadas del modelo base segun documentacion de terceros, no verificadas en esta ficha ni garantizadas tras el ajuste.
- No se documenta soporte multilingue: el repositorio declara unicamente ingles.

## Casos de uso

- Preprocesamiento de lecturas de nanopore por conversacion: el usuario describe el experimento en lenguaje natural y el modelo emite las llamadas a herramientas que lanzan basecalling con Dorado, demultiplexado y generacion de FASTQ en el cluster ARC, sin que el usuario tenga que escribir comandos SLURM.
- Control de calidad automatizado: el modelo encadena la ejecucion de FastQC, NanoPlot y MultiQC y devuelve al usuario un resumen de resultados dentro del mismo hilo conversacional, lo que reduce el salto entre ejecucion y diagnostico.
- Asistente de operacion para usuarios de HPC: responde a preguntas sobre estado de trabajos, colas y recursos consumidos en SLURM, un escenario donde el conocimiento de la sintaxis de `squeue`, `sacct` o `sinfo` suele ser una barrera de entrada.
- Soporte a participantes de cursos y formaciones de bioinformatica: las 1.264 conversaciones de entrenamiento incluyen explicitamente las preguntas que plantean los asistentes, por lo que el modelo esta ajustado para resolver dudas repetitivas de onboarding sobre el pipeline.
- Despliegue en infraestructura propia con datos sensibles: al ser un GGUF de 6,2 GB ejecutable con llama.cpp, puede correr dentro de la red del cluster sin enviar secuencias genomicas ni metadatos a servicios externos.
- Backend conversacional de una interfaz ligera: ARCade renderiza la plantilla de chat y llama al endpoint `/completion` de llama.cpp, de modo que el modelo actua como motor de una interfaz de chat interna.
- Automatizacion de flujos bioinformaticos con verificación de pasos: la salida estructurada de tool calls permite que el orquestador valide cada llamada antes de ejecutarla, lo que encaja en pipelines donde un comando erroneo sobre el cluster tiene coste alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion aportado por el autor es una comparacion de cuantizaciones sobre 60 turnos reservados, midiendo coincidencia exacta con la salida esperada:

| Cuantizacion | Turnos con coincidencia exacta (de 60) |
|---|---|
| f16 | 47 |
| Q6_K | 48 |
| Q4_K_M | 37 |

Este resultado justifica la eleccion de Q6_K como unica cuantizacion publicada: iguala o supera ligeramente al modelo sin cuantizar y supera en 11 turnos a Q4_K_M. La muestra es pequena y especifica de la tarea, por lo que no debe extrapolarse a capacidades generales.

## Requisitos de hardware

- VRAM estimada para Q6_K: en torno a 7-9 GB contando pesos (6,17 GB de fichero) y cache KV con contexto moderado. Estimacion propia, no publicada por el autor.
- VRAM estimada para f16: aproximadamente 15 GB solo en pesos, segun el recuento de parametros. Estimacion propia.
- VRAM estimada para Q4_K_M: en torno a 5-6 GB. Estimacion propia; el autor no publica esta cuantizacion.
- GPU consumer: cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) con la cuantizacion Q6_K y contexto contenido. En 8 GB el margen es muy ajustado y dependera de la longitud de contexto.
- GPU de datacenter: A100, H100 o L40S para servir varias peticiones concurrentes o contextos largos.
- Opciones de despliegue: llama.cpp (formato nativo y endpoint `/completion`), Ollama, LM Studio y servidores compatibles con GGUF. El repositorio esta marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheBioHub/gemma4-e4b-arcade-gguf | 7,46B (segun safetensors) | No disponible | Tool calling para pipeline Griffin en cluster ARC | Apache 2.0 | GGUF, 6,2 GB |
| TheBioHub/gemma4-e4b-biohub-gguf | No disponible | No disponible | Tool calling para Griffin-Pipeline en cluster SLURM | Apache 2.0 | GGUF |
| google/gemma-4-e4b-it | 4,4B segun documentacion de la familia | No disponible | Modelo base multimodal con Thinking Mode y tool use | Terminos de Gemma 4 | Pesos originales |

El ajuste arcade y el ajuste biohub son variantes del mismo autor y del mismo modelo base, diferenciadas por el entorno de ejecucion al que apuntan sus herramientas. Frente al modelo base, las versiones de TheBioHub sacrifican generalidad a cambio de precision en un dominio muy estrecho. No se dispone de datos comparativos de rendimiento entre las tres variantes.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el ajuste se ha realizado sobre 1.264 conversaciones sinteticas centradas en ARCade. Fuera de ese flujo es probable que el modelo degrade hacia el comportamiento del base o genere llamadas a herramientas inexistentes.
- Riesgo de alucinacion de herramientas y argumentos: al no haber benchmark publico, no hay garantia de que las llamadas generadas correspondan a herramientas realmente desplegadas en una instalacion distinta de la del autor.
- Evaluacion muy limitada: la unica metrica disponible son 60 turnos reservados. No hay evaluacion de robustez, de conversaciones largas ni de entradas fuera de distribucion.
- Cobertura linguistica restringida al ingles. No hay evidencia de funcionamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no documentada, lo que impide dimensionar conversaciones largas o ficheros de resultados extensos.
- Ambiguedad de licencia: el repositorio declara Apache 2.0, pero el enlace de licencia apunta a los terminos propios de Gemma 4. Conviene revisar las condiciones reales de uso comercial antes de integrarlo en producto.
- Sin validacion comunitaria: cero descargas y cero valoraciones en el momento de redactar la ficha. No existe retroalimentacion de terceros ni issues resueltos.
- Dependencia del formato de tool call propio (`<|tool_call>call:...<tool_call|>`): requiere un orquestador que parsee exactamente esa sintaxis; no es un formato estandar como JSON Schema de OpenAI.
- Al operar sobre un cluster HPC real, una llamada mal formada puede traducirse en consumo de recursos o en trabajos encolados erroneamente. Se recomienda validacion humana o automatizada antes de ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheBioHub/gemma4-e4b-arcade-gguf
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Enlace de licencia declarado: https://ai.google.dev/gemma/docs/gemma_4_license
- Variante hermana (biohub): https://huggingface.co/TheBioHub/gemma4-e4b-biohub-gguf
- Discusiones de la variante hermana: https://huggingface.co/TheBioHub/gemma4-e4b-biohub-gguf/discussions
- Pagina de la familia Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
