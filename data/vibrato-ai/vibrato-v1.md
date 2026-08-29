# Vibrato-ai/vibrato-v1

## Resumen

Vibrato v1 es un modelo de análisis vocal de código abierto desarrollado por Vibrato-ai (Anycompany LLC), diseñado para clasificar en tiempo real el tipo de voz, la técnica de canto, la vocal producida y cinco métricas de calidad vocal a partir de audio crudo. Se distribuye bajo licencia Apache-2.0 y está pensado para ejecutarse en dispositivos móviles mediante CoreML Neural Engine, alimentando la aplicación iOS gratuita Toney de entrenamiento vocal.

Arquitectónicamente es una CNN 1D multi-tarea con un encoder compartido de cuatro bloques convolucionales y cuatro cabezas de salida independientes. Acepta ventanas de 0,25 segundos de audio a 16 kHz (4000 muestras) y produce clasificaciones de 6 tipos de voz, 7 técnicas, 6 vocales y 5 puntuaciones continuas de calidad. El modelo se entrenó exclusivamente con el dataset VocalSet (CC BY 4.0), aunque solo con el 43% de sus archivos debido a errores de mapeo y de registro de cantantes.

Es importante señalar que la propia model card declara que v1 está superado por vibrato-v2, que la evaluación publicada está contaminada (los cantantes de validación aparecían en el entrenamiento) y que las métricas de calidad tienen correlación negativa con etiquetas acústicas medidas. El modelo se mantiene disponible únicamente por reproducibilidad; para uso real se recomienda v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D multi-tarea (SharedEncoder de 4 ConvBlocks + 4 cabezas FC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio: 4000 muestras, 0,25 s a 16 kHz) |
| Tipos de cuantizacion | no disponible (despliegue via CoreML, sin detalle de cuantizacion) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (entrenamiento), CoreML (despliegue) |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D con un encoder compartido que procesa la señal de audio cruda: cuatro bloques convolucionales con BatchNorm y downsampling de stride 2, seguidos de un AdaptiveAvgPool que produce un vector de características de 256 dimensiones. De ese vector parten cuatro cabezas totalmente conectadas (256→128→salida): una para tipo de voz (6 clases, softmax), una para técnica (7 clases, softmax), una para vocal (6 clases, softmax) y una para calidad (5 salidas continuas 0-1 con sigmoide aplicado en el modelo).

El entrenamiento usó VocalSet (10,1 horas, 20 cantantes) bajo licencia CC BY 4.0, pero solo 1.562 de los 3.613 archivos (43%) llegaron a entrenarse. Dos errores en el pipeline redujeron la cobertura: carpetas de técnica no mapeadas (slow_piano, slow_forte, fast_forte, fast_piano, pp, forte, messa y la carpeta mal escrita "vibrado") y un error en la tabla de género del registro de cantantes (el código asumía 11 mujeres y 9 hombres, cuando VocalSet tiene 9 mujeres y 11 hombres), lo que provocó que los cantantes male10 y male11 (364 archivos) se omitieran silenciosamente. Así, solo 18 de los 20 cantantes contribuyeron datos. Las etiquetas de calidad se derivaron heurísticamente del audio, no de anotaciones humanas.

## Capacidades

- Clasificacion de tipo de voz en 6 clases: soprano, mezzo-soprano, alto, tenor, baritono y bajo (etiquetas heurísticas, no validadas con metadata real de fach).
- Clasificacion de tecnica de canto en 7 clases: belt, falsetto, vibrato, straight, breathy, nasal y mixed.
- Clasificacion de vocal en 6 clases: a, e, i, o, u y schwa.
- Estimacion de 5 metricas continuas de calidad vocal (0-1): brightness, breathiness, strain, power y stability.
- Inferencia en tiempo real en dispositivo movil via CoreML Neural Engine (disenado para iPhone).
- Sin capacidades de texto, vision, tool calling ni agentes: es exclusivamente un modelo de audio para analisis vocal.

## Casos de uso

- Aplicacion de entrenamiento vocal en iOS: el modelo alimenta Toney, una app gratuita de practica de canto que analiza grabaciones en tiempo real y da feedback sobre tecnica, vocal y calidad. Su diseno on-device evita latencia de red y preserva la privacidad del audio.
- Practica de canto autodirigida: un cantante puede grabarse y obtener clasificaciones de tecnica (belt, vibrato, straight, etc.) y vocal para corregir su ejecucion sin necesidad de un profesor presente.
- Herramientas educativas de musica: integracion en plataformas de ensenanza de canto para evaluar automaticamente ejercicios vocales de estudiantes, siempre que se asuman las limitaciones de las etiquetas heuristicas.
- Investigacion en canto y fonetica: el modelo puede servir como punto de partida para estudios sobre clasificacion de vocales o tecnicas, aunque sus resultados deben contrastarse con metodos acusticos estandar (Praat, etc.) debido a la contaminacion de la evaluacion.
- Prototipado de analisis vocal en dispositivos moviles: desarrolladores pueden usar el codigo de entrenamiento y exportacion CoreML incluido en el repositorio para experimentar con pipelines de analisis de audio en iOS.
- Benchmark de modelos de audio on-device: como referencia de una CNN 1D ligera para tareas de clasificacion de audio en entornos con recursos limitados, comparando su tamano y velocidad frente a alternativas.

## Benchmarks y rendimiento

La model card reporta resultados sobre un split de validacion aleatorio (20% de las ventanas) en la epoca 49. Sin embargo, la propia tarjeta advierte que la evaluacion esta contaminada: el modelo entreno con 18 de los 20 cantantes de VocalSet sin un split disjunto por cantante, por lo que los numeros reflejan en gran medida el rendimiento sobre datos de entrenamiento. Ademas, en la condicion de produccion (normalizacion de pico aplicada por la app iOS, no usada en entrenamiento) la precision cae notablemente.

| Metrica | Val (reportado) | Val (condicion produccion) | Baseline clase mayoritaria |
|---|---|---|---|
| Precision tipo de voz | 47,9% | no disponible | ~22,6% |
| Precision tecnica | 48,2% | 30,4% | 25,6% |
| Precision vocal | 57,8% | 48,6% | 20,8% |
| MSE calidad | 0,0292 | no disponible | no disponible |

La model card tambien indica que, contra etiquetas acusticas medidas (Praat CPPS, jitter/shimmer, desviacion de f0), los cinco outputs de calidad tienen R² negativos, es decir, peores que predecir una constante. No se publican resultados para los dos cantantes nunca vistos en entrenamiento (male10 y male11) en la informacion disponible.

## Requisitos de hardware

- Disenado para inferencia on-device en iPhone via CoreML Neural Engine; no requiere GPU dedicada ni servidor.
- El modelo es una CNN 1D ligera con entrada de 4000 muestras; el tamano de parametros no se publica, pero por arquitectura se estima en el orden de cientos de miles de parametros, compatible con cualquier iPhone moderno.
- No se proporcionan datos de VRAM, latencia ni throughput. Al ser un modelo de audio de 0,25 s por ventana, la inferencia en tiempo real es viable en CPU movil, aunque el Neural Engine de Apple es el objetivo principal.
- Opciones de despliegue: CoreML (iOS), PyTorch (investigacion y prototipado). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de analisis vocal con la misma arquitectura y licencia en la documentacion proporcionada. La propia model card no cita alternativas ni benchmarks comparativos. Se indica "no disponible".

## Limitaciones y advertencias

- Evaluacion contaminada: el modelo entreno con 18 de los 20 cantantes de VocalSet sin split disjunto, por lo que las metricas publicadas no reflejan el rendimiento real en cantantes no vistos. La model card recomienda usar vibrato-v2.
- Metricas de calidad no fiables: los cinco outputs de calidad tienen R² negativos contra etiquetas acusticas medidas (Praat CPPS, jitter/shimmer, f0 deviation), lo que indica que no predicen mejor que una constante.
- Clase falsetto sin entrenamiento: 0 muestras de entrenamiento llegaron a esta clase debido al error de mapeo de carpetas; su logit no esta entrenado y no debe usarse.
- Clases nasal y mixed mal etiquetadas: "nasal" se entreno con grabaciones de vocal fry, por lo que detecta vocal fry, no nasalidad; "mixed" se entreno con lip trills, por lo que detecta lip trills, no voz mixta.
- Tipos de voz heuristicos: VocalSet no publica metadata de fach; las etiquetas soprano-tenor son asignaciones heuristicas del pipeline, no ground truth.
- Rango dinamico limitado en strain: la pseudo-etiqueta de strain satura en 1.0 en ~83% de los clips de entrenamiento, reduciendo su utilidad.
- Preprocesamiento desajustado: la app iOS aplica normalizacion de pico antes de la inferencia, mientras que el entrenamiento uso amplitudes crudas; esto degrada la precision en produccion (p. ej., tecnica cae de 48,2% a 30,4%).
- Fuera de alcance: no sirve para reconocimiento de voz, identificacion de idioma, identificacion de hablante ni diagnostico medico de trastornos vocales.
- Modelo superado: v1 queda disponible solo por reproducibilidad; para uso real se recomienda vibrato-v2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vibrato-ai/vibrato-v1
- Organizacion Vibrato-ai: https://huggingface.co/Vibrato-ai
- Modelo sucesor v2: https://huggingface.co/Vibrato-ai/vibrato-v2
- Dataset VocalSet (CC BY 4.0): Wilkins, Seetharaman, Wiss, Pardo, "VocalSet: A Singing Voice Dataset", ISMIR 2018. DOI: https://doi.org/10.5281/zenodo.1193957
