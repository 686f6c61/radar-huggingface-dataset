# vlemeur/onomatron-mlp

## Resumen

Onomatron-mlp es un modelo de lenguaje a nivel de caracter desarrollado por Vincent Le Meur (vlemeur) que genera nombres ficticios de personajes con el estilo de la literatura francesa. Se trata de un perceptrón multicapa (MLP) entrenado desde cero siguiendo el espíritu de `makemore` de Andrej Karpathy, y forma parte del benchmark onomatron, que compara once arquitecturas distintas (rnn, mlp, wavenet, gru, lstm, transformer, mamba, rwkv, ngram, linear y dilated_wavenet) sobre la misma tarea.

El modelo tiene 39.291 parametros (0,16 MB) y un vocabulario de 38 caracteres mas un token centinela de fin de secuencia. Con un contexto de solo 4 caracteres (`block_size = 4`), su funcion es puramente estadistica a nivel de caracter: no modela semantica ni gramatica, sino la distribucion de secuencias de letras tipicas de nombres propios franceses.

Es relevante como referencia pedagogica y como baseline reproducible en investigacion sobre modelos de lenguaje a pequena escala: entrena en 12,8 segundos en un dispositivo `mps` y alcanza 7.688 nombres por segundo en CPU, lo que lo convierte en un punto de comparacion util frente a arquitecturas mas complejas (transformer, mamba, rwkv) en tareas de generacion de cadenas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) a nivel de caracter |
| Parametros totales | 39.291 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 caracteres (`block_size = 4`) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin versiones GGUF/quantizadas) |
| Idiomas soportados | frances (`fr`) |
| Licencia | MIT (codigo y pesos) |
| Formato de pesos | `model.pt` (`state_dict` de PyTorch) + `config.json` |
| Vocabulario | 38 caracteres + centinela `.` |
| Dimension de embedding | 29 (`emb_dim`) |
| Dimension oculta | 243 (`h_dim`) |
| Batch normalization | si (`batch_norm = True`) |
| Tamano del repositorio | 0,0 GB (0,16 MB) |

## Arquitectura y entrenamiento

El modelo es un MLP que recibe una ventana de 4 caracteres como entrada, proyecta cada caracter a un embedding de dimension 29, concatena las representaciones y pasa por una capa oculta de 243 unidades con normalizacion por lotes hasta producir una distribucion sobre los 38 caracteres del vocabulario mas el centinela de fin de nombre. No emplea atencion, recurrencia ni mecanismos de estado: toda la informacion contextual se limita a los 4 caracteres previos.

El entrenamiento se realizo sobre el dataset `Jig09/onomatron-names`, compuesto por nombres saneados de la literatura francesa (uno por linea, unos pocos miles en total). La seleccion de hiperparametros se hizo con Optuna (muestreo TPE y poda ASHA, objetivo = NLL de validacion, estudios persistentes en SQLite) y cada prueba se registro en MLflow. El reentrenamiento final uso AdamW con `lr = 0,00029375384576328325`, `weight_decay = 0,001`, `clip_grad = 1,0`, `batch_size = 128`, semilla 42, 10.000 pasos, parada temprana con paciencia 20 y dispositivo `mps`. La particion train/val/test se realizo por nombre (80/10/10) para evitar fugas entre n-gramas correlacionados del mismo nombre.

## Capacidades

- Generacion de nombres ficticios de personajes con ortografia y acentuacion propias del frances literario.
- Modelado de estadisticas de caracteres: transiciones, terminaciones y prefijos tipicos de nombres franceses.
- Generacion por lotes con semilla configurable (`net.sample(n=20, seed=42)` o CLI `generate.py`).
- Inferencia muy rapida en CPU (7.688 nombres/s), adecuada para generacion masiva de candidatos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- Multilingue: no; unicamente frances.

## Casos de uso

- Generacion de nombres para personajes de ficcion: el modelo produce candidatos como `chl`, `oyl`, `hér`, `jor`, `xar`, `chi`, `lio`, `mag`, `mol`, `fla`, `fél`, `san`, `sal`, `rio`, `gir`, `rig`, `ons`, `fir`, `gri`, `fau`, utiles como punto de partida creativo en narrativa, guiones o juegos de rol ambientados en Francia.
- Prototipado rapido de pipelines de generacion de texto: sirve como baseline funcional para validar infraestructura de carga de bundles, serializacion y muestreo antes de integrar modelos mayores.
- Docencia y divulgacion sobre modelos de lenguaje: su tamano (39.291 parametros) y tiempo de entrenamiento (12,8 s) permiten reproducir el ciclo completo de entrenamiento y evaluacion en una sola sesion.
- Benchmarking de arquitecturas: al formar parte del benchmark onomatron con once arquitecturas comparadas bajo el mismo protocolo, permite contrastar coste computacional frente a calidad (NLL) en tareas de cadenas cortas.
- Generacion de datasets sinteticos de nombres para pruebas: util para poblar bases de datos de test, formularios o fixtures con nombres verosimiles pero ficticios.
- Experimentos de investigacion sobre sesgo y memorizacion: al ser un modelo diminuto con un dataset pequeno, permite estudiar de forma controlada la reproduccion literal de ejemplos de entrenamiento y el sesgo hacia el dominio frances.
- Aplicaciones de naming creativo en entornos controlados: generacion de alias o seudonimos ficticios en talleres de escritura, siempre con revision humana y sin uso para identificar personas reales.

## Benchmarks y rendimiento

Resultados del benchmark onomatron publicado en la model card (ordenado por NLL de validacion; el modelo de esta ficha es `mlp`):

| Modelo | val_nll | test_nll | Parametros | Tamano (MB) | Wall (s) | Nombres/s |
|---|---|---|---|---|---|---|
| rnn | 2,3592 | 2,3491 | 7.657 | 0,03 | 54,7 | 4.962 |
| **mlp** | **2,3759** | **2,3679** | **39.291** | **0,16** | **12,8** | **7.688** |
| wavenet | 2,4002 | 2,3632 | 37.624 | 0,15 | 19,5 | 1.396 |
| dilated_wavenet | 2,4557 | 2,4275 | 13.016 | 0,05 | 28,8 | 445 |
| ngram | 2,4706 | 2,4632 | 0 | 0,44 | 0,1 | 19.243 |
| rwkv | 2,4849 | 2,3446 | 120.998 | 0,48 | 37,2 | 1.085 |
| gru | 2,5292 | 2,4013 | 8.012 | 0,03 | 23,3 | 3.739 |
| lstm | 2,5381 | 2,3703 | 10.062 | 0,04 | 7,7 | 3.846 |
| linear | 2,5918 | 2,5928 | 1.444 | 0,01 | 3,7 | 7.018 |
| transformer | 3,1470 | 2,3757 | 805.158 | 3,22 | 66,6 | 253 |
| mamba | nan | 2,3653 | 56.102 | 0,22 | 716,6 | 87 |

Datos especificos de este modelo: val NLL = 2,3759, test NLL = 2,3679, 7.688 nombres/s en CPU, tiempo de entrenamiento de 12,8 s en `mps` con pico de 395 MB. La velocidad de inferencia se midio en CPU.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (0,16 MB); cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: ninguna en particular; el autor entreno en `mps` (Apple Silicon). Cualquier GPU con soporte PyTorch es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 3050, RTX 4090, integradas, etc.).
- Despliegue: PyTorch nativo mediante el paquete `onomatron` (`load_bundle_from_hub`) o el CLI `generate.py`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7.688 nombres/s en CPU; entrenamiento completo en 12,8 s con pico de 395 MB en `mps`.

## Comparativa con modelos similares

Comparacion con las alternativas del mismo benchmark onomatron (misma tarea, mismo dataset, mismo protocolo de evaluacion):

| Modelo | Parametros | Contexto | val_nll | test_nll | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **mlp** (este) | 39.291 | 4 caracteres | 2,3759 | 2,3679 | MIT | Hugging Face |
| rnn | 7.657 | no disponible | 2,3592 | 2,3491 | MIT (benchmark) | Hugging Face |
| wavenet | 37.624 | no disponible | 2,4002 | 2,3632 | MIT (benchmark) | Hugging Face |
| transformer | 805.158 | no disponible | 3,1470 | 2,3757 | MIT (benchmark) | Hugging Face |

Frente a alternativas de generacion de nombres de proposito general (modelos de lenguaje grandes), la comparacion no es directa: este modelo no modela lenguaje natural y su ambito se limita a nombres franceses. No se dispone de comparaciones publicadas con otros generadores de nombres fuera del benchmark onomatron.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (unos pocos miles de nombres): el modelo puede reproducir literalmente nombres del conjunto de entrenamiento.
- Puede generar nombres que coincidan con personas reales; son ficticios por construccion y no deben usarse para nombrar o tomar decisiones sobre individuos.
- Sesgo hacia la literatura francesa; la normalizacion conserva acentos y descarta el resto de diacriticos.
- Contexto de solo 4 caracteres: sin semantica, sin gramatica y sin coherencia mas alla de estadisticas de caracteres.
- Unicamente frances; no soporta otros idiomas.
- Parte de los nombres provienen del dataset de resolucion de alias ObTIC (`compnet-renard/7-romans-alias-resolution`), sin licencia declarada; se recomienda citar a Maurel et al., "Du reperage a l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Universite).
- Los ficheros `data/external/*.txt` locales no declaran licencia y estan excluidos del repositorio; los nombres derivados son hechos, pero su seleccion no es del autor (ver la tarjeta del dataset).
- Licencia MIT para codigo y pesos, pero la licencia del dataset es `other` con atribucion por fuente: revisar la tarjeta del dataset antes de uso comercial.
- No apto para produccion como modelo de lenguaje general; su uso previsto es la generacion de nombres ficticios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vlemeur/onomatron-mlp
- Dataset de entrenamiento: https://huggingface.co/datasets/Jig09/onomatron-names
- Benchmark onomatron: https://huggingface.co/Jig09/onomatron-benchmark
- Repositorio del proyecto: https://github.com/vlemeur/onomatron
- makemore (Karpathy): https://github.com/karpathy/makemore
- Dataset de resolucion de alias ObTIC: `compnet-renard/7-romans-alias-resolution` (referencia citada en la model card)
