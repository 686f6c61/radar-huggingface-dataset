# TTSBard/ruaccent-tiny-compact

## Resumen

RUAccent Tiny Compact es una versión optimizada y cuantizada del modelo RUAccent Tiny, desarrollado por Denis Petrov (proyecto RUAccent) y empaquetado por TTSBard para su uso en pipelines de síntesis de voz en ruso. Su función no es generar texto ni audio, sino resolver automáticamente la posición del acento léxico y la letra «ё» en texto ruso, una tarea crítica para que un motor TTS pronuncie correctamente palabras ambiguas u homógrafas.

El paquete combina varios modelos ONNX (un predictor de uso de acento, un resolvedor de homógrafos de «ё», un modelo de homógrafos y un acentuador) con diccionarios empaquetados como FST binario y JSON comprimido. Frente al modelo original, reduce el tamaño en disco de unos 135 MB a 52,2 MB, el consumo de RAM de 650 MB a 116 MB y el tiempo de carga de 2,36 s a 0,35 s, manteniendo según el autor una coincidencia de precisión del 100 % con el baseline.

Es relevante para desarrolladores que despliegan TTS en ruso en entornos con recursos limitados (edge, móvil, contenedores pequeños), ya que elimina las allocaciones masivas de objetos `String` del diccionario original mediante `mmap` sobre un FST de 3.194.879 palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos ONNX (predictor de acento, resolvedor de homógrafos de «ё», modelo de homógrafos, acentuador) más diccionarios FST/JSON |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) para `nn_stress_usage_predictor` y `nn_yo_homograph_resolver`; `nn_accent` en FP32; `nn_omograph/tiny` ya cuantizado en el proyecto original |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT (Denis Petrov, RUAccent) |
| Formato de pesos | ONNX (modelos) y FST binario + JSON gzip (diccionarios) |

## Arquitectura y entrenamiento

El paquete no es un transformer generativo único, sino un conjunto de componentes especializados que se ejecutan secuencialmente sobre el texto de entrada: un predictor de uso de acento (`nn_stress_usage_predictor`, 27,9 MB tras cuantización INT8), un resolvedor de homógrafos de «ё» (`nn_yo_homograph_resolver`, 3,5 MB INT8), un modelo de homógrafos (`nn_omograph/tiny`, ~10 MB) y un acentuador (`nn_accent`, 0,77 MB en FP32). Los diccionarios aportan la cobertura léxica: `accents.fst` contiene 3.194.879 palabras en un FST Map mapeado en memoria, y los ficheros `omographs.json.gz`, `yo_words.json.gz` y `yo_homographs.json.gz` cubren casos ambiguos.

La innovación principal es de ingeniería de despliegue más que de modelado: la sustitución del diccionario JSON de 167 MB (21 MB en gzip) por un FST binario de 4,53 MB y la cuantización INT8 de los dos modelos ONNX de mayor tamaño (reducciones del 74,9 % y 74,1 %). No se detallan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Predicción automática de la posición del acento léxico en texto ruso.
- Restitución de la letra «ё» en palabras donde se ha escrito «е».
- Resolución de homógrafos (palabras cuya pronunciación depende del contexto o del acento).
- Consulta de diccionario de 3.194.879 palabras mediante FST mapeado en memoria.
- Integración como preprocesador en pipelines TTS para mejorar la pronunciación.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- No realiza generación de texto, traducción, tool calling ni razonamiento multi-paso.

## Casos de uso

- Preprocesador de TTS en ruso: antes de enviar el texto al sintetizador, el modelo marca acentos y «ё» para que el motor de voz pronuncie correctamente palabras como «замок» (castillo/cerradura) según el contexto.
- Aplicaciones de lectura por voz en móvil o edge: con 52,2 MB en disco y 116 MB de RAM en working set, cabe en dispositivos con memoria limitada donde el modelo original de 135 MB y 650 MB de RAM no sería viable.
- Servicios de audiolibros y podcasts automatizados: procesar lotes largos de texto ruso con carga inicial de 0,35 s reduce el coste de arranque en contenedores efímeros.
- Integración en la librería `ruaccent-rs`: el paquete está pensado para consumirse desde Rust, lo que permite incorporarlo a backends de síntesis escritos en ese lenguaje.
- Asistentes de voz y chatbots con salida hablada: mejorar la naturalidad de la pronunciación sin añadir latencia perceptible en el pipeline.
- Herramientas de accesibilidad para lectores de pantalla en ruso: corregir acentos y «ё» antes de la síntesis mejora la comprensión en usuarios con discapacidad visual.
- Normalización lingüística en corpus: usar la salida acentuada para anotar textos rusos en tareas de lingüística computacional o preparación de datos.

## Benchmarks y rendimiento

El autor publica métricas comparativas frente a RUAccent Tiny original, no benchmarks estándar de NLP:

| Metrica | RUAccent Tiny (original) | RUAccent Tiny Compact | Variacion |
|---|---|---|---|
| Tamano en disco | ~135 MB | 52,2 MB | -61,3 % |
| Diccionario de acentos | 167 MB JSON (21 MB gzip) | 4,53 MB FST | -78,4 % frente a gzip |
| RAM (working set) | 650 MB | 116 MB | 5,6x menos |
| RAM (private commit) | 706 MB | 103 MB | 6,8x menos |
| Tiempo de carga | 2,36 s | 0,35 s | 6,7x mas rapido |
| Precisión | baseline | 100 % de coincidencia | sin perdida |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU mediante ONNX Runtime; no requiere GPU.
- RAM estimada: 116 MB de working set y 103 MB de private commit según el autor.
- Almacenamiento: 52,2 MB en disco para el paquete completo.
- Cabe holgadamente en cualquier GPU consumer, aunque no la aprovecha; el despliegue típico es CPU.
- Opciones de despliegue: ONNX Runtime (Python, Rust, C++), integración en la librería `ruaccent-rs` y en la aplicación TTSBard.
- Tiempo de carga medido: 0,35 s. No se dispone de datos de throughput por token o por frase en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tamano | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| RUAccent Tiny Compact | 52,2 MB | ONNX INT8 + FST, ruso | MIT | Hugging Face (TTSBard) |
| RUAccent Tiny (original) | ~135 MB | Modelos + diccionario JSON, ruso | MIT | Hugging Face (ruaccent) |
| Otros acentuadores rusos | no disponible | no disponible | no disponible | no disponible |

Las alternativas específicas de acentuación rusa comparables no están documentadas en la información disponible.

## Limitaciones y advertencias

- Solo soporta ruso; no es utilizable para otros idiomas.
- No es un modelo generativo: no produce texto, audio ni respuestas; únicamente anota acentos y «ё».
- La afirmación de «0 % de pérdida de precisión» procede del autor y se basa en coincidencia con el baseline, no en una evaluación independiente.
- El rendimiento en palabras fuera de los diccionarios (neologismos, nombres propios, jerga) depende de los modelos ONNX y no está cuantificado en la información disponible.
- Riesgo de errores en homógrafos dependientes de contexto sintáctico complejo, aunque no se documentan tasas concretas.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución a Denis Petrov / RUAccent.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.
- Fecha de creación indicada como 2026-11-12, posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TTSBard/ruaccent-tiny-compact
- Modelo original RUAccent Tiny: https://huggingface.co/ruaccent/accentuator
- Aplicación TTSBard: https://github.com/alksef/app-tts-v2
- Librería ruaccent-rs: https://github.com/alksef/ruaccent-rs
