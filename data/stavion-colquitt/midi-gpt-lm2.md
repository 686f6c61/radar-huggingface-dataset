# Stavion-Colquitt/MIDI-GPT-LM2

## Resumen

MIDI-GPT-LM2 es un modelo generativo de musica simbolica desarrollado por Stavion-Colquitt. Se trata de un transformer decoder-only de 17,7 millones de parametros entrenado desde cero para generar archivos MIDI multi-instrumento. A diferencia de los modelos de audio, opera sobre una representacion tokenizada de eventos musicales (notas, tiempos, instrumentos), lo que permite generar arreglos completos de varios instrumentos como una unica secuencia.

El modelo utiliza la tokenizacion REMI de MidiTok con BPE y un vocabulario de 8.192 tokens. Todas las pistas de una cancion se serializan en un unico flujo de tokens, y los tokens de instrumento indican que instrumento interpreta cada evento. Esto le permite producir arreglos con bateria, bajo, guitarras, teclados o cuerdas en una sola pasada, sin necesidad de modelos separados por pista.

Fue entrenado sobre el Lakh MIDI Dataset (1.240 millones de tokens) en una unica GPU RTX 2060 durante aproximadamente 24 horas. Su relevancia radica en que demuestra que es posible generar musica simbolica multi-instrumento con recursos muy limitados, aunque con un contexto corto (1.024 tokens, unos 30 segundos de musica) y sin capacidades de condicionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (8 capas, 6 cabezas, d_model 384, embeddings atados) |
| Parametros totales | 17.735.424 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32) |
| Idiomas soportados | No aplica (modelo de musica simbolica, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32), con config.json y tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas, 6 cabezas de atencion y dimension de modelo 384, con embeddings de entrada y salida atados. El contexto maximo es de 1.024 tokens. La tokenizacion emplea MidiTok en su representacion REMI combinada con BPE, con un vocabulario de 8.192 tokens; el token de fin de cancion tiene el id 2. Todas las pistas de una pieza se codifican en un unico flujo de tokens, y los tokens de instrumento identifican el instrumento de cada evento, lo que permite generar arreglos multi-instrumento de forma nativa.

El entrenamiento se realizo desde cero sobre el Lakh MIDI Dataset, con 1.240 millones de tokens, en una unica RTX 2060 durante unas 24 horas. La evaluacion se hizo sobre 19,8 millones de tokens de validacion (archivos de Lakh no vistos en entrenamiento). El checkpoint publicado (extension, paso 112.000) alcanza una perdida de validacion de 1,3055 y una perplejidad de 3,69, frente a 1,3420 y 3,83 del mejor checkpoint de la primera ejecucion (paso 57.000). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de musica simbolica en formato MIDI multi-instrumento: produce arreglos completos con varias pistas en una sola generacion.
- Generacion de arreglos tipo banda a temperatura 0,85: bateria, bajo, guitarras, teclados o cuerdas de forma habitual.
- Generacion de MIDI valido: en la evaluacion, 8 de 8 canciones generadas produjeron archivos MIDI validos.
- Modelado de estructura musical a corto plazo: secuencias de hasta 1.024 tokens, aproximadamente medio minuto de una cancion tipica.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No dispone de condicionamiento por genero, tonalidad, tempo ni instrumentacion.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de bocetos de arreglos musicales: el modelo puede producir una idea inicial de banda (bateria, bajo, guitarras, teclados) que un compositor refine despues en su DAW, gracias a su capacidad de generar varias pistas en una sola pasada.
- Prototipado rapido de ideas musicales: con `generate.py --n 4 --temp 0.85` se obtienen varias propuestas MIDI en segundos, utiles para explorar variaciones antes de invertir tiempo en produccion.
- Generacion de musica para juegos y prototipos: al ser un modelo pequeno (17,7 M de parametros) y con licencia MIT, puede integrarse en pipelines de desarrollo de videojuegos para generar loops o fragmentos de unos 30 segundos.
- Investigacion en generacion musical simbolica: sirve como linea base reproducible y ligera (entrenada en una sola RTX 2060) para comparar tokenizaciones, arquitecturas o estrategias de muestreo en musica simbolica.
- Educacion y demostraciones: su bajo coste de inferencia y su codigo abierto permiten usarlo en talleres o cursos para ilustrar como se entrena un GPT desde cero sobre datos musicales.
- Generacion de material para datasets sinteticos: puede producir MIDI adicional para aumentar datasets de musica simbolica, siempre que se revise la originalidad de las salidas por el riesgo de eco de patrones del Lakh.
- Herramientas de acompanamiento creativo: integrado en un editor MIDI, puede sugerir lineas de bajo o bateria a partir de un contexto corto, aunque sin control explicito de tonalidad ni tempo.

## Benchmarks y rendimiento

Evaluacion sobre la totalidad de los 19,8 millones de tokens de validacion del Lakh MIDI Dataset (archivos no vistos en entrenamiento):

| Checkpoint | Val loss | Perplexity |
|---|---|---|
| Run 1 best (paso 57.000) | 1,3420 | 3,83 |
| MIDI-GPT-LM2 (extension, paso 112.000) | 1,3055 | 3,69 |

Comparacion de canciones generadas frente a canciones reales de Lakh (3.072 tokens cada una, medianas):

| Metrica | Generado | Lakh real |
|---|---|---|
| Pistas de instrumento | 1,5 | 7 |
| Notas por segundo | 4,8 | 21,7 |
| Canciones con bateria | 6/8 | 28/30 |
| MIDI valido | 8/8 | No aplica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es de lenguaje natural.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (17,7 M de parametros, unos 71 MB de pesos), mas el coste del tokenizador y del estado de generacion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor lo entreno en una RTX 2060, por lo que una RTX 3060, RTX 4060 o superior ofrecen margen de sobra.
- Cabe en cualquier GPU consumer e incluso en CPU para inferencia, dado el reducido tamano del modelo.
- Opciones de despliegue: el repositorio incluye `generate.py` (PyTorch + safetensors + MidiTok + symusic) y `check_midi.py` para inspeccionar las salidas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje natural.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo (1.240 M de tokens) requirio unas 24 horas en una RTX 2060.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIDI-GPT-LM2 | 17,7 M | 1.024 tokens | Generacion MIDI multi-instrumento | MIT | Hugging Face |
| Music Transformer (Google) | No disponible | No disponible | Generacion de piano simbolico | No disponible | Codigo de referencia |
| MuseGAN | No disponible | No disponible | Generacion musical multi-pista | No disponible | Codigo de referencia |
| MIDI-GPT (versiones previas del autor) | No disponible | No disponible | Generacion MIDI | MIT | GitHub del autor |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo pequeno: los arreglos generados son mas dispersos que las canciones reales (1,5 pistas de media frente a 7 en Lakh; 4,8 notas por segundo frente a 21,7).
- Contexto corto: 1.024 tokens equivalen a unos 30 segundos de una cancion tipica, lo que impide generar estructuras largas o secciones completas.
- Sin condicionamiento: no permite controlar genero, tonalidad, tempo ni instrumentacion.
- A temperatura 1,0 las canciones suelen terminar antes de tiempo; a 0,85 el modelo tiende a producir arreglos tipo banda.
- Riesgo de eco de patrones: Lakh es una coleccion colaborativa de transcripciones MIDI de canciones reales, por lo que las salidas pueden reproducir patrones familiares; es necesario revisar cualquier material antes de publicarlo.
- Sesgos de datos: el modelo hereda los sesgos de genero musical y estilo del Lakh MIDI Dataset, no documentados en detalle por el autor.
- Riesgo de alucinacion musical: puede generar secuencias musicalmente incoherentes o eventos MIDI mal formados, aunque en la evaluacion todas las salidas fueron MIDI valido.
- Licencia MIT para codigo y pesos, con atribucion requerida al Lakh MIDI Dataset (CC BY 4.0, Colin Raffel, 2016) por el uso de los datos de entrenamiento.
- El proyecto fue construido con asistencia de IA (Claude, de Anthropic) para codigo y documentacion, segun declara el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stavion-Colquitt/MIDI-GPT-LM2
- Codigo y detalles de entrenamiento: https://github.com/Stavion-Colquitt/MIDI-GPT
- Lakh MIDI Dataset (datos de entrenamiento): no disponible como enlace directo en la informacion proporcionada
- Referencia del dataset: Colin Raffel, *Learning-Based Methods for Comparing Sequences, with Applications to Audio-to-MIDI Alignment and Matching*, PhD thesis, Columbia University, 2016.
