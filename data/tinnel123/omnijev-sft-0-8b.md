# tinnel123/OmniJev-SFT-0.8B

## Resumen

OmniJev-SFT-0.8B es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario tinnel123 sobre el modelo base Qwen/Qwen3.5-0.8B, un modelo de imagen y texto a texto (cargable con `AutoModelForImageTextToText`). No se trata del modelo con cabeza de decisión de OmniJev: la propia model card aclara que es la línea base generativa de 0,8B, que genera texto y que no puede cargarse con `MSO1`. El repositorio ocupa 0,1 GB y se carga mediante la librería `peft`.

El modelo forma parte del proyecto OmniJev, orientado a tareas de toma de decisiones: control de interfaz Android, juegos (Atari, ajedrez, xiangqi, gomoku, serpiente), navegación web, robótica, seguridad visual, VQA y razonamiento sobre texto largo, entre otras familias. El atractivo principal es su tamano reducido (0,8B) combinado con un ajuste específico de dominio y un descenso declarado del error de calibración (ECE medio por familia de 20,83 % en el base a 4,30 %), lo que lo hace desplegable en hardware modesto.

La relevancia práctica está limitada por dos factores: la escasa adopción (8 descargas, 0 likes) y, sobre todo, las advertencias metodológicas de la propia model card, que retira parte de las métricas agregadas, indica que las comparaciones no usan muestras emparejadas y recalca que las cifras son tareas internas del proyecto, no benchmarks oficiales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B, modelo de imagen-texto a texto |
| Parametros totales | 0,8B en el modelo base; adaptador LoRA de rango 32 (tamano del repositorio: 0,1 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (declarada para el adaptador; no se detalla la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; libreria `peft`) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Version | v1.1 (segun tags y `revision="v1.1"` del ejemplo de carga) |
| Fecha de publicacion | 2026-09-26 |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de Qwen3.5-0.8B (numero de capas, atencion, tokenizador ni torre de vision). Lo que si se especifica es la receta de ajuste: LoRA de rango 32 sobre el modelo base, 12.500 pasos de entrenamiento, tasa de aprendizaje 1e-4 y acumulacion de gradiente de 4. No se documentan fases de RLHF, DPO ni decodificacion especulativa en este adaptador.

Un punto critico senalado por el autor es que la ruta historica de entrenamiento y evaluacion publicada uso unicamente la primera imagen fija; este release conserva esos pesos medidos y no corresponde al checkpoint posterior de 20 pasos con DDP ni a un reentrenamiento multi-imagen completado. Tampoco se reclama ningun resultado SFT para 2B o 4B: la linea base SFT publicada es solo de 0,8B. Las 41.951 generaciones de esa linea base fueron juzgadas y auditadas, y el juicio automatico acepto 97 etiquetas de respuesta explicitas incorrectas, por lo que la precision auditada queda en 48,0894 % (igual a la del parser) en lugar del 48,3207 % sin corregir.

## Capacidades

- Generacion de texto condicionada por imagenes y texto mediante `processor.apply_chat_template` y `model.generate`.
- Toma de decisiones y seleccion de acciones en tareas de tipo juego, control de interfaz, navegacion web y robotica, segun las 30 familias evaluadas por el proyecto (androidcontrol, atari, chess, gomoku, xiangqi, web, roboarena_wrist, robot_long, etc.).
- Respuesta a preguntas de eleccion multiple con opciones: en la correccion de puntuaciones se citan predicciones validas de 56,67 % / 68,40 % / 77,07 % para 0,8B / 2B / 4B sobre 750 preguntas cada una.
- Razonamiento sobre texto largo: la familia `longtext` alcanza 76,42 % en la fila v1.1 0,8B de la tabla del proyecto.
- Multilingue en ingles y chino (en, zh).
- El tag `omni-modal` figura en el repositorio y se evalua una familia `audio` (51,07 % en v1.1 0,8B), pero el propio autor indica que la ruta publicada uso solo la primera imagen fija; no se documenta soporte de audio o video en este adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en bucle cerrado: no disponible; el autor senala que las replicas publicadas no establecen juego en bucle cerrado.

## Casos de uso

- Control de interfaz Android automatizado: la familia `androidcontrol` pasa de 29,49 % en el base a 71,70 % en v1.1 0,8B, lo que permite prototipar agentes que deciden la siguiente accion sobre capturas de pantalla en flujos de prueba de aplicaciones.
- Politicas de decision en juegos de tablero: con resultados de 61,80 % en `chess2`, 22,27 % en `xiangqi` y 69,80 % en `gomoku`, sirve para experimentar con agentes ligeros de juego y para estudiar tecnicas de ajuste fino en dominios con reglas estrictas, asumiendo que el rendimiento en variantes complejas (chess3: 20,00 %) es bajo.
- Navegacion web asistida: las familias `web` (66,87 %) y `webtest` (67,13 %) permiten prototipos de agentes que interpretan paginas y eligen acciones, integrables en pipelines de automatizacion de pruebas con supervision humana.
- Robotica de bajo coste: en `roboarena_wrist` (65,93 %) y `robot_long` (79,79 %) el modelo decide acciones a partir de observaciones visuales, adecuado para validar politicas en simulador antes de un despliegue real y para equipos con presupuesto de computo limitado.
- Filtrado de seguridad visual: la familia `safety` alcanza 97,73 % en v1.1 0,8B y 99,53 % en 4B. Advertencia: el autor aclara que esa fila cubre unicamente el subconjunto de HaGRID, por lo que el uso en produccion como clasificador de seguridad requiere una validacion propia.
- Seleccion de respuestas candidatas en VQA: la fila de 93,47 % en OK-VQA corresponde a seleccion de candidato con la respuesta de referencia suministrada, no a VQA abierto; es util como componente de reranking dentro de un pipeline con un generador previo.
- Linea base de investigacion para ablaciones SFT frente a cabezas de decision: al ser un adaptador LoRA de 0,1 GB sobre un base de 0,8B, permite reproducir y comparar rapidamente el ajuste supervisado frente al modelo con cabeza de decision del mismo proyecto, con la salvedad de que las muestras no estan emparejadas.
- Despliegue en el borde o en portatiles: el tamano reducido del base (0,8B) hace viable ejecutar prototipos en GPU de consumo o incluso CPU, siempre con cuantizacion y asumiendo la perdida de precision asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras siguientes son tareas internas del proyecto OmniJev, no benchmarks oficiales, y el propio autor advierte que no constituyen una ablacion con muestras emparejadas.

Resumen declarado por el proyecto:

| Modelo | Familias | Preguntas | Precision macro % | Precision micro % | ECE medio por familia % |
|---|---:|---:|---:|---:|---:|
| Base 0.8B | 30 | 21.456 | 40,07 | 40,04 | 20,83 |
| SFT 0.8B | 30 | 41.951 | 47,86 | 48,09 | — |
| v1.1 0.8B | 30 | 41.975 | 64,52 | 65,40 | 4,30 |
| Base 2B | 30 | 21.456 | 36,30 | 35,94 | 34,21 |
| v1.1 2B | 30 | 41.975 | 64,46 | 65,42 | 6,27 |
| Base 4B | 30 | 21.456 | 40,12 | 39,79 | 30,04 |
| v1.1 4B | 30 | 41.975 | 70,00 | 70,82 | 5,89 |

Seleccion de familias relevantes (precison por familia, %):

| Familia | Base 0.8B | SFT 0.8B | v1.1 0.8B | Base 4B | v1.1 4B |
|---|---:|---:|---:|---:|---:|
| androidcontrol | 29,49 | 40,73 | 71,70 | 28,81 | 77,30 |
| events | 39,09 | 48,53 | 85,87 | 55,56 | 89,13 |
| game | 41,15 | 47,33 | 83,51 | 15,36 | 90,36 |
| longtext | 21,26 | 62,53 | 76,42 | 59,40 | 80,28 |
| robot_long | 54,87 | 49,80 | 79,79 | 29,36 | 85,04 |
| safety | 52,81 | 68,93 | 97,73 | 67,90 | 99,53 |
| snake | 44,03 | 47,00 | 83,60 | 44,86 | 84,47 |
| vqa | 79,15 | 76,47 | 63,87 | 85,73 | 93,47 |
| chess3 | 5,62 | 13,00 | 20,00 | 5,49 | 22,67 |
| xiangqi | 8,09 | 12,87 | 22,27 | 10,15 | 23,67 |

Advertencias publicadas por el autor sobre estas cifras: la fila agregada `genmcq` de A-OKVQA queda retirada por usar etiquetas si/no generadas incorrectamente; los promedios macro y micro antiguos incluyen esas etiquetas invalidas y no deben tratarse como rendimiento global validado; el 56,05 % de Mario no es precision de siguiente accion (43,52 % sobre 193 preguntas); el 93,47 % de OK-VQA es seleccion de candidato con la respuesta de referencia suministrada; la fila POPE cubre solo su subconjunto aleatorio; la fila de seguridad cubre HaGRID; y los modelos base, SFT y de decision no se evaluaron sobre las mismas muestras.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de los 0,8B parametros del base; el autor no publica cifras de VRAM): aproximadamente 1,6 GB en FP16 para los pesos, 0,8 GB en INT8 y 0,4-0,5 GB en 4 bits, mas el consumo de cache KV y de la torre de vision.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cualquier GPU con 4-8 GB o mas es suficiente en la practica; una RTX 3060 de 12 GB, una RTX 4060, una RTX 4090, una L4 o una A10 permiten ejecutar el modelo con margen amplio.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos anos, e incluso en CPU o en equipos Apple Silicon para prototipos, a costa de mayor latencia.
- Opciones de despliegue: el unico flujo documentado en la model card es Transformers + PEFT (`AutoModelForImageTextToText` y `PeftModel.from_pretrained` con `revision="v1.1"`). El uso con vLLM (soporte de adaptadores LoRA), llama.cpp, Ollama o TGI no esta documentado por el autor; para llama.cpp u Ollama habria que fusionar el adaptador con el base y convertir a GGUF, y no se publica ningun GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Todos los datos de rendimiento comparados proceden de las tablas del propio proyecto OmniJev y no de evaluaciones independientes; las muestras no estan emparejadas y los numeros de preguntas difieren entre filas.

| Modelo | Parametros | Preguntas evaluadas | Precision micro % | ECE medio % | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| OmniJev-SFT-0.8B (este repositorio) | 0,8B + LoRA r32 | 41.951 (fila SFT) / 41.975 (fila v1.1) | 48,09 (SFT) / 65,40 (v1.1) | — / 4,30 | apache-2.0 | publico en HuggingFace, 8 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | 21.456 | 40,04 | 20,83 | no disponible en la informacion proporcionada | publico |
| OmniJev v1.1 2B | 2B | 41.975 | 65,42 | 6,27 | no disponible para el 2B | los resultados figuran en la tabla, pero no se reclama un SFT de 2B publicado |
| OmniJev v1.1 4B | 4B | 41.975 | 70,82 | 5,89 | no disponible para el 4B | los resultados figuran en la tabla, pero no se reclama un SFT de 4B publicado |

Frente al base, el ajuste mejora la precision micro declarada en 8,05 puntos (0,8B) y reduce el ECE de 20,83 % a 4,30 % en la fila v1.1 0,8B; la mejora de calibracion es, segun los datos disponibles, el efecto mas consistente del SFT. No se dispone de comparaciones con modelos externos de la misma categoria.

## Limitaciones y advertencias

- La model card retira explicitamente la fila agregada `genmcq` de A-OKVQA por etiquetas si/no generadas incorrectamente; los promedios macro y micro antiguos la incluian y no deben usarse como rendimiento global validado.
- Las tablas no son una ablacion con muestras emparejadas: los modelos base usan probabilidades de respuesta candidata (`A1_raw`) con un maximo de 1.000 preguntas por familia antes del split dev/test, mientras que OmniJev y SFT usan aproximadamente 1.500 preguntas por familia; el muestreo, el truncado de opciones y las entradas de imagen difieren.
- El juicio automatico de las 41.951 generaciones del SFT acepto 97 etiquetas de respuesta explicitas incorrectas; la precision auditada es 48,0894 %, no 48,3207 %.
- El 93,47 % de OK-VQA corresponde a seleccion de candidato con la respuesta de referencia suministrada, no a VQA abierto. El 56,05 % de Mario no es precision de siguiente accion (43,52 % sobre 193 preguntas) y las replicas publicadas no demuestran juego en bucle cerrado.
- La fila de seguridad cubre unicamente el subconjunto de HaGRID; la de POPE, solo su subconjunto aleatorio.
- La ruta de entrenamiento y evaluacion publicada uso unicamente la primera imagen fija; este release no es el checkpoint de 20 pasos con DDP ni un reentrenamiento multi-imagen completado. La version v1.2 sigue siendo experimental segun el autor.
- Ambiguedad de identificacion: el repositorio se presenta como linea base SFT de 0,8B pero esta etiquetado como v1.1 y el ejemplo de carga usa `revision="v1.1"`; la tabla distingue la fila SFT 0,8B (48,09 % micro) de la fila v1.1 0,8B (65,40 % micro) y la informacion disponible no aclara sin ambiguedad a cual de las dos corresponden exactamente los pesos publicados.
- No se publican benchmarks oficiales (MMLU, HumanEval, GSM8K u otros), ni datos de sesgo, ni evaluaciones de alucinacion.
- Idiomas limitados a ingles y chino; no hay evidencia de rendimiento en castellano.
- La licencia declarada del adaptador es apache-2.0, pero la informacion proporcionada no especifica la licencia del modelo base Qwen/Qwen3.5-0.8B, que debe verificarse antes de un uso comercial.
- Adopcion minima (8 descargas, 0 likes) y ausencia de pipeline declarado en HuggingFace; no hay evidencia de uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/tinnel123/OmniJev-SFT-0.8B
- Repositorio de codigo: https://github.com/tinnel123666888/OmniJev
- Documentacion en chino: https://github.com/tinnel123666888/OmniJev/blob/main/README_zh.md
- Metricas completas (referencia relativa `results_v11_zh.md`): https://github.com/tinnel123666888/OmniJev/blob/main/results_v11_zh.md
- Informes legibles por maquina (referencia relativa `results_v11.json`): https://github.com/tinnel123666888/OmniJev/blob/main/results_v11.json
- Auditoria por conjunto de datos y tipo de pregunta (referencia relativa `dataset_scores_v11.md`): https://github.com/tinnel123666888/OmniJev/blob/main/dataset_scores_v11.md
- Interfaz de accion experimental v1.2 (referencia relativa `docs/v12_development.md`): https://github.com/tinnel123666888/OmniJev/blob/main/docs/v12_development.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
