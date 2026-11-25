# spauwels/OSTINATO-3B-MULTI-Llama3.2.final

## Resumen

OSTINATO-3B-MULTI es un ajuste fino del modelo meta-llama/Llama-3.2-3B-Instruct desarrollado por el usuario spauwels, orientado a la generacion de musica simbolica multitrack en formato textual. A partir de una instruccion compuesta por etiquetas (genero, tempo, estado de animo, tonalidad, numero de compases), el modelo emite una secuencia de tokens `A_ D_ IP_` que se convierten directamente en un archivo MIDI con varias pistas: bateria, bajo, melodia, acordes y pads ambientales. No genera audio, sino notacion simbolica.

El modelo se entrena con QLoRA (r=32) sobre secuencias de 2304 tokens, equivalentes a unos 30 segundos de musica. Soporta cuatro tareas: GEN (composicion desde cero), JAM (continuacion de una pieza), COPILOT (escritura de las partes que faltan) y FIM (relleno entre un inicio y un final). Esta pensado como fuente de ideas para compositores, no como productor de pistas terminadas, y su distribucion principal es en formato GGUF Q8 (4,16 GB), que segun el autor se ejecuta en tiempo real en una GPU de 12 GB con llama.cpp.

Su relevancia actual radica en que demuestra que un modelo de lenguaje de solo 3.900 millones de parametros, heredado de un instruct generalista, puede especializarse en una tarea de dominio muy concreta (generacion MIDI multitrack) mediante ajuste fino eficiente y un vocabulario de tokens disenado ad hoc. La model card es inusualmente detallada y cuantitativa, con mediciones propias sobre el modelo real, lo que la convierte en un caso de estudio interesante sobre evaluacion empirica de ajustes finos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de Llama 3.2 3B Instruct), ajuste fino QLoRA r=32 |
| Parametros totales | 3.906.948.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con secuencias de 2304 tokens (prompt incluido) |
| Tipos de cuantizacion | GGUF Q8 (4,16 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | en, fr |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (repo de 4,2 GB) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tarea | text-generation (musica simbolica / MIDI) |
| Vocabulario musical | tokens `A_`, `D_`, `IP_`; 480 ticks por negra, 1920 por compas en 4/4 |
| Descargas | 310 |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer causal denso de 3.900 millones de parametros, y se ajusta con QLoRA de rango 32 para producir musica simbolica como texto. La innovacion principal no esta en la arquitectura, sino en la representacion: el modelo emite una corriente de tokens `A_` (avance temporal), `D_` (duracion) e `IP_` (nota y canal) que codifican eventos MIDI multitrack con resolucion de 480 ticks por negra y huecos de `A_` multiplos de 24 ticks. El entrenamiento se realiza sobre secuencias de 2304 tokens, equivalentes a unos 30 segundos de musica o hasta 433 notas, con el prompt incluido.

El ajuste cubre cuatro tareas (GEN, JAM, COPILOT y FIM) mediante etiquetas de tarea en el prompt. La model card documenta que el dataset se construyo con un script (`build_dataset.py`) en el que las etiquetas `DENSITY` y `COMPLEXITY` se sortean aleatoriamente, lo que explica que su efecto medido sobre la salida sea muy debil. No se detalla el numero de tokens de entrenamiento ni si hubo RLHF o DPO; la informacion disponible solo indica el metodo QLoRA y el rango. El formato de prompt es un instruct con seccion `### Instruction:` y `### Response:` tras la cual el modelo escribe `<MUSIC>`.

## Capacidades

- Generacion de musica simbolica multitrack (bateria, bajo, melodia, acordes y pads) como secuencia de tokens convertible a MIDI.
- Cuatro modos de tarea: GEN (desde cero), JAM (continuar una pieza), COPILOT (escribir las partes que faltan) y FIM (rellenar el medio entre un inicio y un final).
- Control mediante etiquetas obligatorias: `TASK`, `GENRE`, `BPM`, `MOOD`, `BARS`, `DENSITY` y `COMPLEXITY`, mas `KEY` opcional.
- Ajuste fino del caracter musical mediante `MOOD` (afecta al rango de velocidades y a la orquestacion) y `KEY` (95-100 % de notas en la escala objetivo).
- Generacion de texto general heredada del modelo base Llama 3.2 3B Instruct (capacidad no evaluada en la model card).
- Idiomas: ingles y frances.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Composicion asistida por bloques: el modelo rinde mejor en bloques de 4 compases; un compositor puede generar fragmentos cortos con GEN y encadenarlos con JAM para construir una pieza, aprovechando que la precision temporal se degrada a partir de unos 4 compases.
- Generacion de bocetos de arreglos: con `COPILOT` el modelo escribe las partes que faltan de una pieza existente (por ejemplo, anadir bajo y bateria a una melodia), util para productores que quieren explorar arreglos rapidos.
- Relleno de secciones (FIM): dado un inicio y un final, el modelo completa el medio, util para tapar huecos en una maqueta o generar transiciones entre secciones.
- Herramienta dentro de un plugin de DAW: el modelo se integra en el plugin VST3/CLAP Echon Prompt (GitLab `flamandroz-group/echon-prompt`), que ofrece prompt libre, GENERATE, CONTINUE, ADD PARTS y FILL, ademas de importacion de .mid y generacion automatica.
- Exploracion de ideas por estado de animo: usar `MOOD` (ENERGETIC, CHILL, DARK, UPLIFTING, MELANCHOLIC, GROOVY, EPIC, DREAMY) para generar variantes con distinto caracter ritmico y de velocidades, por ejemplo EPIC con acordes cargados o GROOVY con bateria prominente.
- Generacion en tiempo real en hardware de consumo: el GGUF Q8 se ejecuta en tiempo real en una GPU de 12 GB con llama.cpp, lo que permite usarlo como generador interactivo dentro de un flujo de trabajo de estudio.
- Prototipado de musica para videojuegos o multimedia: generar loops de 4 compases en distintos generos y tonalidades como base para iterar rapidamente antes de la produccion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye mediciones propias sobre el modelo real, que se recogen a continuacion:

| Metrica medida | Resultado |
|---|---|
| Tokens de entrenamiento | 2304 por secuencia (prompt incluido, hasta 433 notas, ~30 s) |
| Precision de rejilla (sin forzar) | 83 % de onsets melodicos y 93 % de onsets de bateria en semicorchea |
| Precision de tonalidad con `KEY` | 98 % de notas en escala (91 % sin `KEY`) |
| Tomas completas con prompt completo (8 compases) | 62 % |
| Tomas completas sin `BPM` | 25 % (los acordes desaparecen: 8 notas frente a 186) |
| Tomas completas sin `MOOD`, `DENSITY` y `COMPLEXITY` | 46 % |
| Tomas completas con prompt minimo (`TASK` + `KEY`) | 17 % |
| Presencia de melodia en GEN en bruto | 39 % (61 % de salidas sin melodia); con `logit_bias` positivo en canal 0 sube del 25 % al 83 % |
| Tomas completas segun `BPM` (60, 90, 120, 160, 200) | 75 %, 69 %, 62 %, 31 % y 56 % |
| Notas por genero en 4 compases | 155 a 164 (diferencias debiles entre generos) |
| Tiempo real | GGUF Q8 en GPU de 12 GB con llama.cpp |

## Requisitos de hardware

- VRAM estimada: el GGUF Q8 ocupa 4,16 GB; con overhead de contexto y KV cache, una GPU de 12 GB es suficiente segun el autor.
- GPU recomendadas: el autor confirma ejecucion en tiempo real en una GPU de 12 GB; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: cabe en tarjetas de 12 GB o mas; no se detalla comportamiento en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (probado por el autor); otros motores (vLLM, TGI, Ollama) no estan documentados en la informacion disponible.
- Latencia y throughput: se afirma ejecucion en tiempo real en GPU de 12 GB con llama.cpp, sin cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OSTINATO-3B-MULTI | 3.906.948.160 | 2304 tokens de entrenamiento | MIDI multitrack simbolico | llama3.2 | Hugging Face (GGUF) |
| OSTINATO-3B-PIANO | no disponible | no disponible | MIDI de piano solista | no disponible | Mencionado en la model card |
| Llama-3.2-3B-Instruct | 3.210 millones (aprox., segun modelo base) | no disponible en esta ficha | Texto general | llama3.2 | Hugging Face |

La model card menciona como modelo hermano OSTINATO-3B-PIANO, con el mismo vocabulario de etiquetas y el mismo formato `A_ D_ IP_`, orientado a piano solista. No se dispone de datos de rendimiento comparables con otros modelos de generacion musical simbolica en la informacion proporcionada.

## Limitaciones y advertencias

- La longitud util es de 2304 tokens (unos 30 segundos de musica); mas alla, la precision temporal se degrada. El autor recomienda bloques de 4 compases y encadenar con JAM.
- En GEN, el token de fin de secuencia `</s>` falta o llega tarde: el modelo sigue mas alla de `BARS`. El cliente debe cortar en `BARS × 1920` ticks; un `logit_bias` sobre `</s>` no lo soluciona.
- La melodia falta en el 61 % de las salidas GEN en bruto; se corrige con un `logit_bias` positivo en tokens del canal 0.
- Las etiquetas `DENSITY`, `COMPLEXITY` y `GENRE` tienen un efecto medido muy debil; `DENSITY` y `COMPLEXITY` se sortearon aleatoriamente en la primera version del script de dataset.
- `BPM` debe estar presente (sin el, los acordes desaparecen) aunque su valor apenas importa; hay una caida de tomas completas con BPM 160 (31 %).
- Todas las etiquetas obligatorias deben incluirse: un prompt incompleto reduce las tomas completas del 62 % al 17-46 %.
- El modelo es una fuente de ideas, no un productor de pistas terminadas; no genera audio.
- Licencia llama3.2: el uso comercial esta sujeto a los terminos de la licencia de Llama 3.2, que deben revisarse antes de integrar el modelo en produccion.
- Solo se documentan los idiomas en y fr; no hay evaluacion de sesgos ni de riesgo de alucinacion en la informacion disponible.
- No se documentan capacidades de tool calling ni de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/spauwels/OSTINATO-3B-MULTI-Llama3.2.final
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Plugin VST3/CLAP Echon Prompt: GitLab `flamandroz-group/echon-prompt` (referencia en la model card; URL completa no disponible)
- Modelo hermano OSTINATO-3B-PIANO: referencia en la model card; URL no disponible
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
