# spauwels/OSTINATO-3B-MULTI-Llama3.2.final

## Resumen

OSTINATO-3B-MULTI es un ajuste fino (QLoRA, r=32) de Llama 3.2 3B Instruct desarrollado por el usuario spauwels, orientado a la generación de música simbólica multi-pista en formato textual. El modelo recibe una instrucción breve compuesta por etiquetas (género, tempo, estado de ánimo, tonalidad, número de compases) y emite un flujo de tokens musicales que se convierten directamente en un archivo MIDI multi-pista con cinco canales: melodía, bajo, acordes, pads ambientales y batería.

La propuesta diferencial es tratar la composición musical como una tarea de generación de texto sobre un vocabulario específico de dominio, reutilizando un modelo causal estándar de 3.906.948.160 parámetros. Soporta cuatro tareas: GEN (composición desde cero), JAM (continuación de una pieza), COPILOT (escritura de partes ausentes) y FIM (relleno del tramo entre un inicio y un final). Está pensado explícitamente como fuente de ideas para compositores, no como productor de pistas terminadas.

El modelo se distribuye en formato GGUF (el archivo Q8 ocupa 4,16 GB) y, según el autor, se ejecuta en tiempo real en una GPU de 12 GB con llama.cpp. La relevancia actual reside en su nicho: la generación simbólica multi-instrumento con un modelo de lenguaje pequeño y desplegable en hardware de consumo, algo poco habitual frente a los sistemas de audio generativo de mayor escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Llama 3.2, fine-tuning QLoRA con r=32) |
| Parámetros totales | 3.906.948.160 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2304 tokens de entrenamiento (prompt incluido; aproximadamente 30 segundos de música, hasta 433 notas) |
| Tipos de cuantización | GGUF (el autor menciona Q8; no se detallan otras variantes) |
| Idiomas soportados | Inglés y francés |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (tamaño del repositorio: 4,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-3B-Instruct, un transformer causal denso, y se ajusta mediante QLoRA con rango 32 para aprender un formato de salida musical basado en tokens con prefijos `A_`, `D_` e `IP_`. La escala temporal es de 480 ticks por tiempo (1920 por compás en 4/4), y los intervalos `A_` son múltiplos de 24 ticks. El entrenamiento se realizó sobre secuencias de 2304 tokens, lo que equivale a unos 30 segundos de música y un máximo de 433 notas.

El formato de prompt sigue una plantilla de instrucción con las secciones `### Instruction:` y `### Response:`, tras la cual el modelo continúa escribiendo a partir del marcador `<MUSIC>`. Las etiquetas de control son `[TASK:X]` (GEN, JAM, FIM, COPILOT), `[GENRE:X]` (POP_ROCK, JAZZ, ELECTRONIC, CLASSICAL, FOLK, LATIN), `[BPM:X]` (40 a 240 en múltiplos de 5), `[MOOD:X]` (ENERGETIC, CHILL, DARK, UPLIFTING, MELANCHOLIC, GROOVY, EPIC, DREAMY), `[BARS:X]` (1 a 16), `[DENSITY:X]` y `[COMPLEXITY:X]`, además de `[KEY:X_Y]` y las variantes `[KEY_PRE:X_Y]` y `[KEY_SUF:X_Y]` para FIM. El autor documenta que las etiquetas de mayor efecto medido son MOOD, BPM y KEY, mientras que GENRE, DENSITY y COMPLEXITY tienen un efecto débil; en la primera versión del script de construcción del dataset (`build_dataset.py`), DENSITY y COMPLEXITY se asignaban aleatoriamente.

No se detalla en la información disponible la composición del corpus de entrenamiento, el número total de tokens musicales, ni si se aplicaron fases de RLHF o DPO. La innovación técnica principal es la serialización de música multi-pista en un vocabulario de tokens de texto y la definición de cuatro modos de interacción compositiva, incluido un modo de relleno (FIM) con etiquetas de tonalidad previa y posterior.

## Capacidades

- Generación de música simbólica multi-pista en cinco canales: `IP_0` (melodía, programa GM 0), `IP_1` (bajo, programa 32), `IP_2` (acordes, programa 48 o piano), `IP_3` (pads, programa 91) e `IP_9` (batería en canal MIDI 10, con bombo 36, caja 38, charles cerrado 42 y abierto 46).
- Tarea GEN: composición desde cero a partir de etiquetas de género, tempo, ánimo, tonalidad y número de compases.
- Tarea JAM: continuación de una pieza existente.
- Tarea COPILOT: escritura de las partes que faltan en una pieza dada.
- Tarea FIM: relleno del tramo intermedio entre un inicio y un final, con soporte de tonalidad previa y posterior.
- Control de dinámica mediante la etiqueta MOOD, que fija la plage de velocidad MIDI (por ejemplo, ENERGETIC de 80 a 127, MELANCHOLIC de 35 a 80).
- Control de tonalidad mediante `[KEY:X_Y]` con 12 clases de altura y modo mayor o menor.
- Salida convertible directamente a MIDI multi-pista.
- Soporte de `logit_bias` para forzar la presencia del canal de melodía, que el autor mide que pasa del 25 % al 83 % de presencia con sesgo positivo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio directo ni modo de razonamiento extendido.

## Casos de uso

- Composición asistida por bloques: generar bloques de 4 compases con GEN y encadenarlos mediante JAM, aprovechando que la calidad de timing es muy buena hasta aproximadamente 4 compases y que el modelo pierde precisión temporal en salidas largas.
- Generación de ideas para arreglistas: producir bocetos de batería, bajo, acordes y pads a partir de una etiqueta de ánimo y tempo, que el compositor revisa y edita en su DAW antes de convertirlos en material definitivo.
- Relleno de secciones en una maqueta: usar FIM para completar el tramo entre un inicio y un final ya compuestos, con tonalidad previa y posterior especificadas para mantener la coherencia armónica.
- Completado de partes ausentes: emplear COPILOT para escribir la melodía o el bajo que faltan en una pieza parcial, integrando el modelo en un flujo de trabajo de producción musical.
- Integración en plugin de DAW: el autor menciona el plugin VST3/CLAP Echon Prompt (GitLab `flamandroz-group/echon-prompt`), que ofrece prompt, REC, ADD PARTS, FILL, reproducción de una parte y modo bucle, lo que permite usar el modelo dentro de un entorno de producción con retroalimentación inmediata.
- Generación en tiempo real en hardware de consumo: el archivo GGUF Q8 (4,16 GB) se ejecuta en tiempo real en una GPU de 12 GB con llama.cpp, lo que habilita prototipado interactivo en estaciones de trabajo modestas.
- Exploración de variantes estilísticas: pese al efecto débil de GENRE, el modelo permite generar tomas con distintos valores de MOOD y BPM para comparar orquestaciones y rangos de velocidad antes de fijar una dirección creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor sí aporta mediciones internas de comportamiento, que se recogen a continuación:

| Medición | Resultado |
|---|---|
| Longitud útil de entrenamiento | 2304 tokens (prompt incluido), hasta 433 notas, aproximadamente 30 segundos |
| Presencia de melodía en salidas GEN brutas | 61 % de ausencia; con `logit_bias` positivo pasa del 25 % al 83 % de presencia |
| Notas por toma de 4 compases según género | 155 a 164 notas para todos los géneros (efecto débil de GENRE) |
| Efecto de DENSITY | Aproximadamente +5 % de notas de SPARSE a DENSE, sobre todo en acordes |
| Efecto de COMPLEXITY | Aproximadamente +3 %, sobre todo en acordes y bajo |
| Parada antes de BARS en tomas de 16 compases | Aproximadamente 22 % de las tomas |
| Desviación típica de velocidad dentro de una toma | 3 a 5 (dinámica casi plana) |
| Reparto de notas por MOOD | EPIC carga los acordes (aproximadamente 81 notas), ENERGETIC la melodía (aproximadamente 9), GROOVY la batería (aproximadamente 61) |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8 ocupa 4,16 GB, por lo que se necesita al menos esa cantidad más el overhead del runtime; el autor indica ejecución en tiempo real en una GPU de 12 GB.
- GPU recomendadas: no se detallan modelos concretos; por el tamaño del archivo, una GPU de 12 GB (gama RTX 3060 12 GB, RTX 4070, RTX 4080) es suficiente según el autor. Para mayor margen de contexto y lotes, se puede emplear A100 o H100, aunque no se documentan cifras de rendimiento en esas tarjetas.
- Cabe en GPU de consumo: sí, con el archivo Q8 de 4,16 GB en tarjetas de 8 a 12 GB, siempre que el runtime y el contexto adicional quepan en memoria.
- Opciones de despliegue: llama.cpp es el runtime mencionado explícitamente por el autor; el repositorio incluye la etiqueta `endpoints_compatible`. No se confirma soporte de vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: el autor afirma ejecución en tiempo real en una GPU de 12 GB con llama.cpp, pero no se proporcionan tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de generación musical simbólica, por lo que la comparación cuantitativa se indica como no disponible. A modo de referencia estructural, se compara con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OSTINATO-3B-MULTI | 3.906.948.160 | 2304 tokens (entrenamiento) | Generación musical simbólica multi-pista en texto | llama3.2 | Hugging Face, GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3.000 millones (aproximado, según denominación del modelo) | No disponible en la información proporcionada | Generación de texto general | llama3.2 | Hugging Face |

No se han identificado en la información disponible otros modelos de la misma categoría (generación MIDI multi-instrumento con LLM) con los que establecer una comparación de rendimiento, contexto y licencia.

## Limitaciones y advertencias

- Longitud limitada: el modelo se entrenó con 2304 tokens como máximo, prompt incluido; las salidas más largas pierden precisión temporal. El autor recomienda trabajar en bloques de 4 compases y continuar con JAM.
- Terminación poco fiable: en modo GEN, el token `</s>` está ausente o llega tarde, y el modelo continúa más allá de `BARS`; es necesario cortar en el cliente a `BARS × 1920` ticks. En tomas de 16 compases, aproximadamente el 22 % se detienen antes de tiempo.
- Melodía omitida: en el 61 % de las salidas GEN brutas falta el canal de melodía; se requiere `logit_bias` positivo para elevarla al 83 % de presencia.
- Dinámica plana: las velocidades dentro de una toma tienen una desviación típica de 3 a 5, por lo que conviene aplicar expansión de dinámica en el cliente.
- Etiquetas de efecto débil: GENRE, DENSITY y COMPLEXITY apenas influyen en la salida; el autor señala que en la primera versión de `build_dataset.py` estas dos últimas se asignaban al azar, lo que limita lo que el modelo puede haber aprendido.
- Cobertura lingüística limitada: solo inglés y francés, tanto en la model card como en las etiquetas de idioma del repositorio.
- Riesgo de alucinación musical: el modelo puede producir patrones rítmicos o armónicos incoherentes con la tonalidad solicitada; no se documentan evaluaciones formales de coherencia armónica.
- Sesgos: no se documentan sesgos específicos más allá de la distribución del corpus de entrenamiento, cuya composición no se detalla.
- Licencia llama3.2: el uso comercial está sujeto a los términos de la licencia Llama 3.2, que deben revisarse antes de integrar el modelo en productos; el modelo base es de Meta y el ajuste es de un tercero.
- Madurez: el repositorio tiene 24 descargas y 0 me gusta en el momento de la consulta, y la model card describe el modelo como fuente de ideas, no como productor de pistas terminadas; no hay evidencia de validación independiente.
- Dependencia de herramientas externas: la conversión a MIDI y el corte de secuencias requieren implementación en el cliente; el plugin Echon Prompt es el único cliente documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spauwels/OSTINATO-3B-MULTI-Llama3.2.final
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Plugin VST3/CLAP Echon Prompt: GitLab `flamandroz-group/echon-prompt` (no se proporciona URL completa en la información disponible)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
