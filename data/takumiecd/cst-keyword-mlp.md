# takumiecd/cst-keyword-mlp

## Resumen

CST Keyword-MLP es un modelo de clasificación de audio para keyword spotting (detección de palabras clave) entrenado sobre el conjunto Speech Commands V2-35, que reconoce 35 comandos de voz cortos. Lo desarrolla el usuario takumiecd y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es una red neuronal pequeña especializada en clasificar clips de audio de 16 kHz mono en una de las 35 etiquetas del corpus.

El modelo reproduce la arquitectura oficial Keyword-MLP (un MLP con 12 unidades de gating espacial) y añade una variante denominada CST que sustituye la proyección temporal 98-a-98 de cada unidad de gating por una implementación basada en la librería torchcst. El objetivo es comparar el rendimiento y el coste computacional de ambas variantes con distinto número de "átomos" (128, 256 y 512) frente al modelo original.

La relevancia es acotada: se trata de un artefacto de investigación reproducido con fines comparativos, con checkpoints de dos variantes (baseline y cst-512) y resultados medidos en el split de test de Speech Commands V2-35. Su tamaño (cientos de miles de parámetros) y su alcance (clasificación de 35 comandos) lo sitúan lejos de los modelos de propósito general, pero resulta útil como referencia para experimentos de eficiencia en keyword spotting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con 12 unidades de gating espacial (Keyword-MLP); variante CST sustituye la proyección temporal 98-a-98 por torchcst |
| Parametros totales | 424.811 (baseline); 334.139 (CST con 512 atomos); 315.707 (CST con 128 atomos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 40x98 coeficientes MFCC (ventana de 30 ms, hop de 10 ms) |
| Tipos de cuantizacion | no disponible (pesos en FP32 en los experimentos publicados) |
| Idiomas soportados | no disponible (clasificacion de comandos en ingles de Speech Commands) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con libreria pytorch) |

## Arquitectura y entrenamiento

La arquitectura base es la Keyword-MLP oficial, un MLP con 12 unidades de gating espacial. Cada unidad aplica una convolucion de kernel tamano uno que actua como matriz de pesos temporal por canal de caracteristicas. La variante CST reemplaza esa proyeccion temporal 98-a-98 por una implementacion torchcst, manteniendo el sesgo inicializado a uno y la misma escala inicial pequena de pesos; el resto de capas conserva la arquitectura oficial.

El entrenamiento se realiza desde cero sobre Speech Commands V2-35 con el split oficial (84.843 clips de entrenamiento, 9.981 de validacion y 11.005 de test). El frontend usa 40x98 coeficientes MFCC con ventana de 30 ms y hop de 10 ms, y aplica SpecAugment compartido entre ambas variantes. Se usan 10 epocas de warmup de learning rate y decaimiento coseno; los parametros ordinarios parten de una tasa base de 0,001 y el grupo de atomos CST usa 0,0048 (o 0,016 en las configuraciones de 128, 256 y 512 atomos). El backend CST por defecto es `materialized`. Las ejecuciones completas guardan `best.pt` en la primera epoca con mayor precision de validacion y `last.pt` en la epoca final.

## Capacidades

- Clasificacion de audio en 35 clases de comandos de voz de Speech Commands V2-35.
- Inferencia sobre archivos WAV de 16 kHz mono PCM16; la CLI devuelve las cinco etiquetas mas probables.
- Dos variantes de checkpoint publicadas: baseline y cst-512.
- Entrenamiento reproducible desde cero con scripts incluidos (`train.py`, `data.py`, `export.py`, `infer.py`).
- Comparacion controlada entre la proyeccion temporal original y la implementacion CST.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Deteccion de palabras clave en dispositivos embebidos: con 315.707 a 424.811 parametros, el modelo cabe en memoria muy limitada y puede ejecutarse en microcontroladores o SoC de bajo consumo para activacion por voz.
- Reproduccion de experimentos de eficiencia: los scripts permiten entrenar baseline y CST con distintos numeros de atomos para medir el compromiso entre precision y coste computacional.
- Benchmark de backend CST: la comparacion de tiempos por paso en RTX 4090 (8,79 ms baseline frente a 28,41 ms con 128 atomos) sirve para evaluar el coste de la implementacion torchcst.
- Prototipado de interfaces de voz con vocabulario cerrado: utiles para demos de control por comandos en aplicaciones de escritorio o web con 35 clases predefinidas.
- Docencia e investigacion en clasificacion de audio: el tamano reducido y el codigo abierto facilitan experimentos reproducibles en cursos y trabajos academicos.
- Validacion de pipelines de datos de audio: el cacheo de MFCC y el split oficial permiten reutilizar el flujo para otros modelos de keyword spotting.

## Benchmarks y rendimiento

Resultados sobre Speech Commands V2-35 (precision de test):

| Modelo | Atom LR | Seed | Precision final en test | Precision en mejor epoca de validacion | Epoca primera al 95% de validacion |
|---|---:|---:|---:|---:|---:|
| Original KW-MLP | — | 17 | 97,35% | 97,19% | 17 |
| CST, 128 atomos | 0,0048 | 17 | 95,21% | 95,20% | 104 |
| CST, 128 atomos | 0,016 | 17 | 95,27% | 95,24% | 101 |
| CST, 256 atomos | 0,016 | 17 | 96,17% | 96,27% | 66 |
| CST, 512 atomos | 0,016 | 17 | 96,49% | 96,52% | 39 |
| Original KW-MLP | — | 29 | 97,48% | 97,28% | 15 |
| CST, 256 atomos | 0,016 | 29 | 96,11% | 95,88% | 55 |

Checkpoints publicados:

| Checkpoint | Epoca | Precision en test |
|---|---:|---:|
| baseline | 109 | 97,19% |
| cst-512 | 138 | 96,52% |

Piloto en RTX 4090 (batch 256, seed 17, FP32 con TF32, PyTorch 2.6.0 y CUDA 12.6):

| Modelo | Paso mediano | VRAM pico asignada | VRAM pico reservada | Parametros |
|---|---:|---:|---:|---:|
| Original KW-MLP | 8,79 ms | 1.234,2 MiB | 1.460 MiB | 424.811 |
| CST, 128 atomos por proyeccion | 28,41 ms | 1.239,8 MiB | 1.470 MiB | 315.707 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos son de cientos de miles de parametros (del orden de 1,2 a 1,7 MiB en FP32), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; los experimentos publicados usan una RTX 4090 para entrenamiento.
- Cabe en consumer GPU: si, en cualquier GPU con CUDA, y tambien en CPU.
- Opciones de despliegue: scripts propios (`infer.py` con `--device cuda` o CPU), PyTorch y torchaudio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: en entrenamiento, paso mediano de 8,79 ms (baseline) y 28,41 ms (CST con 128 atomos) con batch 256 en RTX 4090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precision en test | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| CST Keyword-MLP (cst-512) | 334.139 | MFCC 40x98 | 96,52% | Apache 2.0 | Hugging Face |
| Keyword-MLP original | 424.811 | MFCC 40x98 | 97,19% (checkpoint baseline) | Apache 2.0 (upstream) | Hugging Face y GitHub |
| Otros modelos de keyword spotting | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance muy restringido: solo clasifica 35 comandos de Speech Commands V2-35; no es un modelo de lenguaje ni de proposito general.
- Precision inferior a la del modelo original: la variante CST con 512 atomos queda 0,85 puntos porcentuales por debajo del baseline, con un 21,3% menos de parametros.
- Requiere audio de 16 kHz mono PCM16; otros formatos o frecuencias de muestreo pueden degradar el rendimiento.
- No se documentan sesgos especificos, pero el corpus Speech Commands tiene una distribucion de hablantes limitada y en ingles.
- Riesgo de alucinacion no aplicable en el sentido habitual; si puede producir clasificaciones erroneas en audio fuera de dominio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo incorpora codigo upstream con su propia licencia (`upstream/LICENSE`) que debe revisarse.
- Los resultados publicados corresponden a dos seeds y a un unico corpus; no hay validacion en otros conjuntos.
- No se publican datos sobre cuantizacion ni sobre latencia de inferencia en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/takumiecd/cst-keyword-mlp
- Repositorio GitHub: https://github.com/takumiecd/cst-keyword-mlp
- Keyword-MLP oficial (upstream): https://github.com/AI-Research-BD/Keyword-MLP/tree/a87c8ac9c4d3ba01745d68cc5dcf9cd21dd67b72
- Licencia upstream: https://github.com/takumiecd/cst-keyword-mlp/blob/main/upstream/LICENSE
- Curvas de validacion: results/curves-256-512.png, results/curves-128-256.png, results/curves-seed29.png
- Resumen de ejecuciones: results/summary.json
- Historial de epocas: results/history.csv
- Dataset Speech Commands V2: https://storage.googleapis.com/download.tensorflow.org/data/speech_commands_v0.02.tar.gz
