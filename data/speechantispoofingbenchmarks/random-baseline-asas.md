# SpeechAntiSpoofingBenchmarks/random-baseline-asas

## Resumen

`random-baseline-asas` es un modelo de referencia (baseline) publicado por la organización SpeechAntiSpoofingBenchmarks dentro de su iniciativa de evaluación de sistemas de detección de *spoofing* de voz (detección de audio sintético y deepfakes de voz). No es un modelo entrenado en el sentido habitual: no contiene pesos ni checkpoint, sino que genera una puntuación aleatoria `N(0, 1)` con semilla fija (`seed=0`) para cada utterance de entrada. Por construcción, su tasa de error igual (EER) se sitúa en torno al 50 %, es decir, el nivel de un clasificador aleatorio.

Su relevancia es metodológica más que funcional. Sirve como ancla inferior en el *arena* de evaluación SpeechAntiSpoofingArena, permitiendo calibrar y contextualizar las puntuaciones de los sistemas reales de detección de audio falsificado. Cualquier modelo antispufing que no supere de forma clara este baseline debe considerarse inútil en la práctica.

El repositorio ocupa aproximadamente 0,1 GB y no incluye arquitectura de red neuronal, parámetros, tokenizador ni pipeline de Hugging Face. La información disponible sobre arquitectura, entrenamiento o licencia es prácticamente nula más allá de la descripción del propio mecanismo aleatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es una red neuronal; genera puntuaciones aleatorias `N(0, 1)` con semilla fija `seed=0`) |
| Parametros totales | No disponible (no hay checkpoint ni pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (procesa utterances de audio de forma independiente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (independiente del idioma; la salida es aleatoria) |
| Licencia | No disponible |
| Formato de pesos | No disponible (sin checkpoint; el "modelo" es la semilla) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento. El baseline produce, para cada utterance, una puntuación extraída de una distribución normal estándar `N(0, 1)` mediante un generador pseudoaleatorio con semilla fija `seed=0`. Esta construcción garantiza reproducibilidad exacta de las puntuaciones y un EER teórico del 50 % al no existir ninguna correlación entre la puntuación y la etiqueta real (bonafide frente a spoof).

El propósito técnico es doble: por un lado, validar la infraestructura de evaluación (métricas EER y 1-SRR, carga de datasets, agregación de resultados) y, por otro, establecer el suelo de rendimiento contra el que se comparan los sistemas reales en el arena. Los resultados por dataset se publican en la ruta `.eval_results/<dataset-org>/<dataset-name>/scores.txt` del repositorio.

## Capacidades

- Generación de puntuaciones aleatorias reproducibles (`N(0, 1)`, `seed=0`) para cada utterance de audio.
- Evaluación de detección de *spoofing* de voz con EER esperado en torno al 50 % en todos los conjuntos de prueba.
- Cálculo de la métrica 1-SRR en los datasets que la emplean (LRLspoof, EmoSpoofTTS).
- Reproducibilidad exacta entre ejecuciones gracias a la semilla fija.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión, audio generativo ni *thinking mode*.
- No realiza ninguna inferencia sobre el contenido del audio: la salida es independiente de la entrada.

## Casos de uso

- Calibración de un arena de evaluación: se usa como referencia inferior en SpeechAntiSpoofingArena para verificar que las métricas y la infraestructura de evaluación funcionan correctamente antes de incorporar sistemas reales.
- Validación de pipelines de evaluación: permite comprobar que el cálculo de EER y 1-SRR, la carga de datasets y la agregación de resultados producen los valores esperados (≈50 %) en un caso controlado.
- Detección de fugas de información en el pipeline: si un sistema real obtiene puntuaciones sospechosamente cercanas a este baseline en todos los datasets, puede indicar un fallo en la integración o en el etiquetado.
- Pruebas de regresión en infraestructura de *benchmarking*: al ser determinista con `seed=0`, sirve para detectar cambios no deseados en el código de evaluación entre versiones.
- Docencia y divulgación: ilustra de forma tangible qué significa un EER del 50 % y por qué un detector antispufing debe alejarse claramente de ese valor para tener utilidad real.
- Comparación de sistemas en publicaciones: proporciona una línea base explícita y reproducible con la que contextualizar las cifras reportadas por los sistemas antispufing evaluados.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, salvo donde se indica 1-SRR %):

| Dataset | Metrica | Valor |
|---|---|---|
| ASVspoof2019_LA | EER % | 49.87 |
| ASVspoof2021_DF | EER % | 49.72 |
| ASVspoof2021_LA | EER % | 50.03 |
| CD-ADD | EER % | 49.83 |
| InTheWild | EER % | 49.56 |
| ASVspoof5 | EER % | 49.96 |
| CFAD | EER % | 49.91 |
| CVoiceFake_small | EER % | 50.19 |
| DeepVoice | EER % | 48.73 |
| LibriSeVoc | EER % | 49.74 |
| SONAR | EER % | 49.56 |
| ArAD | EER % | 49.84 |
| DECRO | EER % | 50.27 |
| J-SPAW_LA | EER % | 50.5 |
| ODSS | EER % | 49.64 |
| HABLA | EER % | 50.07 |
| DFADD | EER % | 48.21 |
| PyAra | EER % | 49.86 |
| XMAD | EER % | 49.8 |
| LRLspoof | 1-SRR % | 50.02 |
| ADD22_eval_31 | EER % | 50.08 |
| ADD2023_track12_test_r1 | EER % | 49.8 |
| EmoFake_test | EER % | 50.11 |
| EmoSpoofTTS | 1-SRR % | 49.93 |

Todos los valores son coherentes con un clasificador aleatorio; las desviaciones respecto al 50 % son ruido estadístico del tamaño de cada conjunto de evaluación.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula; no hay red neuronal ni pesos que cargar, solo un generador pseudoaleatorio.
- GPU recomendadas: no se requiere GPU; cualquier CPU es suficiente.
- Cabe en cualquier GPU de consumo y también en entornos sin GPU.
- Opciones de despliegue: ejecución directa del código del repositorio `speech-spoof-bench`; no aplica vLLM, llama.cpp, Ollama ni TGI porque no hay un modelo generativo.
- Latencia y throughput: dominados por la lectura del audio y el cálculo de la métrica, no por el "modelo"; el coste de generar la puntuación es despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | EER tipico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| random-baseline-asas | Baseline aleatorio | No disponible (sin checkpoint) | No aplica | ≈50 % | No disponible | Hugging Face |
| Sistemas antispufing reales del arena | Redes neuronales de deteccion | No disponible en la informacion proporcionada | No aplica | No disponible en la informacion proporcionada | No disponible | SpeechAntiSpoofingArena |

No se dispone en la información proporcionada de datos concretos de sistemas comparables (parámetros, contexto, EER) para establecer una comparativa cuantitativa más detallada.

## Limitaciones y advertencias

- No es un detector funcional: su EER del ≈50 % equivale a azar y no aporta ninguna capacidad de discriminación entre audio real y falsificado.
- No debe desplegarse en producción como sistema antispufing bajo ninguna circunstancia.
- No hay información sobre licencia, lo que impide confirmar condiciones de uso comercial.
- No se especifican idiomas soportados ni dominios de audio; la salida es independiente de la entrada.
- La reproducibilidad depende de mantener `seed=0` y el mismo generador pseudoaleatorio; cambios en la implementación pueden alterar las puntuaciones.
- No hay checkpoint, por lo que no puede afinarse ni adaptarse a nuevos dominios.
- Los valores de EER publicados varían ligeramente entre datasets por efectos de muestreo; no deben interpretarse como diferencias reales de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/random-baseline-asas
- Arena de evaluacion: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Arena filtrado por este sistema: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=random-baseline
- Codigo: https://github.com/SpeechAntiSpoofingBenchmarks/speech-spoof-bench
- Endpoint de tier: https://speechantispoofingbenchmarks-speechantispoofingarena.hf.space/badge/random-baseline/tier.json
- Endpoint de rank: https://speechantispoofingbenchmarks-speechantispoofingarena.hf.space/badge/random-baseline/rank.json
