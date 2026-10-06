# TDoSiMa/sima-laya

## Resumen

Sima-laya es un conjunto de checkpoints del modelo de decisión Laya de Convai Innovations, compilados especificamente para acelerar hardware SiMa.ai MLSoC Modalix (MLA). Laya es un modelo de tipo "System-1": un encoder (ModernBERT-large en la variante inglesa general, mmBERT-base en la multilingue) con una cabeza de decision que responde a una pregunta tipada sobre un texto en un unico forward pass, eligiendo entre varias opciones, puntuando en una escala o respondiendo si o no.

La relevancia de este repositorio radica en que no se trata de pesos para ejecucion en PyTorch u ONNX Runtime, sino de grafos ya compilados para el acelerador MLA de SiMa.ai. Cada grafo es una unica etapa MLA, sin capas en CPU, y una decision tarda alrededor de 19 ms a 128 tokens (8 ms en la variante multilingue). Esto lo orienta a despliegues de inferencia en el borde (edge) con latencia predecible y bajo consumo, en lugar de a entornos de servidor con GPU.

El repositorio incluye cinco carpetas: `general` (Laya BF16), `general-int8` (Laya INT8), `typed-decisions` (Laya typed-decisions BF16), `multilingual` (Laya multilingual BF16) y `dino` (Laya-dino BF16, con cabeza ajustada para un juego de navegador). Los checkpoints originales son de Convai Innovations y se han compilado sin reentrenamiento, salvo la variante `dino`. La licencia es Apache-2.0 y no hay resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large en general y typed-decisions; mmBERT-base en multilingual) con cabeza de decision; compilado como etapa unica MLA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 1024 tokens segun el grafo compilado (grafos de 64, 128, 256, 512 y 1024 tokens) |
| Tipos de cuantizacion | BF16 (pesos y activaciones en bfloat16); A_BF16_W_INT8 (activaciones bfloat16, pesos int8) |
| Idiomas soportados | no disponible (existe una variante multilingue basada en mmBERT-base) |
| Licencia | apache-2.0 |
| Formato de pesos | Grafos compilados `.elf`, tabla de embeddings `.bf16` y `.f32`; no safetensors ni GGUF |

## Arquitectura y entrenamiento

Laya es un modelo de decision "System-1" formado por un encoder y una cabeza de decision. La variante general y la de decisiones tipadas emplean ModernBERT-large como encoder; la variante multilingue usa mmBERT-base. La cabeza responde a preguntas tipadas (por ejemplo, seleccionar una opcion, puntuar en una escala o dar una respuesta booleana) en un unico forward pass, sin generar texto de forma autoregresiva. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La aportacion tecnica de este repositorio concreto no es el entrenamiento, sino la compilacion de los checkpoints de Convai Innovations para el acelerador MLA de SiMa.ai MLSoC Modalix. Cada grafo corresponde a una unica etapa MLA, sin capas ejecutadas en CPU, con la tabla de embeddings y la ultima capa de la cabeza de activacion ejecutadas en CPU. Los checkpoints se han compilado sin reentrenamiento, salvo `dino`, cuya cabeza de decision se ajusto sobre el checkpoint ingles para un juego de navegador. La precision de portado se documenta frente al modelo PyTorch en fp32: la variante general reproduce 100 de 100 decisiones identicas a 128 tokens, la typed-decisions 99 de 100, la INT8 98 de 100, la multilingue 100 de 100 y dino 30 de 30 estados de juego.

## Capacidades

- Decision tipada sobre texto: responder preguntas de tipo opcion multiple, escala o si/no en un unico forward pass.
- Clasificacion y puntuacion: elegir una categoria o asignar una puntuacion a un fragmento de texto.
- Procesamiento de contexto hasta 1024 tokens en los grafos de mayor longitud.
- Variante multilingue basada en mmBERT-base (idiomas concretos no disponibles en la informacion).
- Inferencia en el borde sobre el acelerador MLA de SiMa.ai Modalix, con latencias del orden de milisegundos.
- Capacidad de juego/decision en la variante `dino`, orientada a estados de un juego de navegador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo resuelve una decision por forward pass, no es generativo autoregresivo).
- Vision / audio / thinking mode: no disponible.

## Casos de uso

- Clasificacion de tickets de soporte en el borde: el modelo puede determinar si un texto describe un problema de facturacion, incidencia tecnica u otra categoria mediante una pregunta tipada, con latencia de ~19 ms a 128 tokens en Modalix.
- Moderacion de contenido en dispositivo: respuesta booleana (si/no) sobre si un texto incumple una politica, ejecutable localmente sin enviar datos a la nube.
- Enrutado de decisiones en pipelines embebidos: decidir la siguiente accion de un flujo (por ejemplo, escalar o no) en funcion de una entrada de texto corta, aprovechando la latencia predecible del hardware MLA.
- Analisis de sentimiento o puntuacion en escala: asignar una puntuacion a resenas o comentarios mediante la cabeza de decision.
- Sistemas multilingues de clasificacion: la variante `multilingual` (mmBERT-base) permite tareas de decision sobre textos en varios idiomas con latencia de ~8 ms a 128 tokens.
- Control de juego o agente sencillo: la variante `dino` responde a estados de un juego de navegador (30 de 30 estados coincidentes con PyTorch), adecuada para logica de decision embebida.
- Preprocesado en edge para reducir trafico: filtrar o etiquetar texto en el propio dispositivo antes de enviar solo lo relevante a un backend mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta latencias por decision y la coincidencia de decisiones frente al modelo PyTorch en fp32.

| Variante | Precision | Latencia por decision (tokens) | Coincidencia con PyTorch | Tamano |
|---|---|---|---|---|
| `general` | BF16 | 128: 19,5 ms; 256: 35,2 ms; 512: 87,5 ms | 100 / 100 | 3,27 GB |
| `general-int8` | A_BF16_W_INT8 | 128: 14 ms | 98 / 100 | 0,67 GB |
| `typed-decisions` | BF16 | 128: 19,4 ms; 512: 87,5 ms; 1024: 282 ms | 99 / 100 | 4,35 GB |
| `multilingual` | BF16 | 128: 8,1 ms; 256: 15,3 ms; 512: 33,9 ms; 1024: 116,5 ms | 100 / 100 | 2,61 GB |
| `dino` | BF16 | 64: 18 ms | 30 / 30 estados de juego | 0,95 GB |

## Requisitos de hardware

- Hardware objetivo: placa SiMa.ai Modalix MLSoC (acelerador MLA). Las latencias documentadas se han medido en un Modalix DevKit dentro del runtime.
- No es ejecutable en GPU convencional: los ficheros no funcionan con PyTorch ni ONNX Runtime; para esos entornos debe usarse el checkpoint original `convaiinnovations/laya`.
- VRAM estimada para GPU: no aplica (el modelo se ejecuta en el acelerador MLA, no en GPU).
- Cabe en GPU de consumo: no; requiere hardware SiMa.ai Modalix.
- Opciones de despliegue: runtime y aplicacion web del repositorio `sima-laya` (pagina Models que descarga y carga el modelo en el MLA), o ejecucion manual mediante `./laya run <carpeta>`.
- Latencia: entre 8,1 ms (multilingue a 128 tokens) y 282 ms (typed-decisions a 1024 tokens); la variante INT8 reduce a 14 ms a 128 tokens.
- Throughput: no disponible.
- Tamano en disco del repositorio: 11,6 GB (las carpetas individuales van de 0,67 GB a 4,35 GB).

## Comparativa con modelos similares

No se dispone de datos de rendimiento (benchmarks de calidad) comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales. Como referencia, la variante original sin compilar es `convaiinnovations/laya`.

| Modelo | Tipo | Contexto | Licencia | Entorno de ejecucion |
|---|---|---|---|---|
| TDoSiMa/sima-laya | Encoder de decision compilado para MLA | Hasta 1024 tokens | apache-2.0 | SiMa.ai Modalix (MLA) |
| convaiinnovations/laya | Encoder de decision (checkpoint original) | no disponible | apache-2.0 | PyTorch / ONNX Runtime |
| Alternativas de encoder genericas (ModernBERT-mmBERT) | Encoder | segun checkpoint base | variable | GPU / CPU |

## Limitaciones y advertencias

- No es un modelo generativo: responde a una pregunta de decision tipada, no produce texto libre ni mantiene conversaciones.
- No es ejecutable en PyTorch ni ONNX Runtime; requiere el hardware y runtime de SiMa.ai Modalix. Para otros entornos, usar el checkpoint original.
- La calidad zero-shot es la de los checkpoints originales: el portado reproduce tanto las respuestas correctas como las incorrectas del modelo PyTorch.
- Riesgo de alucinacion o decision erronea: al ser un modelo de decision, puede devolver respuestas incorrectas segun la calibracion y el prompt; no se documentan tasas de error mas alla de la coincidencia con PyTorch.
- Sesgos conocidos: no disponibles en la informacion proporcionada; heredables del encoder base y de los datos de entrenamiento de Convai Innovations.
- Idiomas soportados: no disponibles; solo se confirma la existencia de una variante multilingue basada en mmBERT-base.
- Limites de contexto: el grafo determina la longitud maxima (64, 128, 256, 512 o 1024 tokens segun la variante); entradas mas largas no estan cubiertas.
- Licencia Apache-2.0: permite uso comercial con atribucion a Convai Innovations; la compilacion no altera la licencia del checkpoint base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.
- Fecha de creacion y actualizacion del repositorio: 2026-10-06.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TDoSiMa/sima-laya
- Checkpoint original: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya (Convai Innovations): https://github.com/NandhaKishorM/laya
- Runtime y aplicacion web sima-laya: https://github.com/dotimothy/sima-laya
