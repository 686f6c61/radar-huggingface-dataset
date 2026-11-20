# vlemeur/onomatron-wavenet

## Resumen

Onomatron-wavenet es un modelo de lenguaje a nivel de carácter (character-level LM) desarrollado por Vincent Le Meur (usuario `vlemeur`) cuyo único propósito es generar nombres ficticios de personajes con el estilo de la literatura francesa. Está construido desde cero siguiendo la filosofía didáctica de `makemore` de Andrej Karpathy, y forma parte del benchmark interno "onomatron", que compara once arquitecturas distintas (rnn, mlp, wavenet, dilated_wavenet, ngram, rwkv, gru, lstm, linear, transformer y mamba) sobre el mismo corpus de nombres.

Se trata de un modelo minúsculo: 37.624 parámetros, 0,15 MB de pesos y un vocabulario de 38 caracteres más un token centinela. La arquitectura es una WaveNet causal (convoluciones dilatadas) adaptada a modelado de secuencias de caracteres, con `block_size` de 8, `emb_dim` de 31 y `h_dim` de 82. No es un modelo de lenguaje general: no tiene semántica, ni gramática, ni capacidad de razonamiento; modela únicamente estadísticas de caracteres sobre nombres propios.

Su relevancia es fundamentalmente educativa y de referencia: sirve como punto de comparación reproducible dentro del benchmark onomatron y como ejemplo de pipeline completo (Optuna para búsqueda de hiperparámetros, MLflow para tracking, evaluación con split por nombre para evitar leakage). No está pensado para producción ni para aplicaciones de NLP reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WaveNet causal (convoluciones dilatadas), character-level |
| Parametros totales | 37.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 caracteres (`block_size` = 8) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT (codigo y pesos); datos de entrenamiento bajo `license: other` con atribucion por fuente |
| Formato de pesos | `model.pt` (state_dict de PyTorch) + `config.json` |

## Arquitectura y entrenamiento

El modelo es una WaveNet causal adaptada a modelado de caracteres: una pila de convoluciones dilatadas que predicen el siguiente carácter condicionado a los 8 caracteres anteriores (`block_size` = 8). La dimensión de embedding es 31 y la dimensión oculta de las capas convolucionales es 82, lo que da un total de 37.624 parámetros. El vocabulario consta de 38 caracteres más un token centinela `.` que marca inicio y fin de nombre. El bundle se distribuye como `config.json` + `model.pt`, con un subconjunto vendorizado del paquete `onomatron` (solo dependiente de torch) que incluye el loader.

El entrenamiento se realizó en dos fases. Primero, una búsqueda de hiperparámetros con Optuna (sampler TPE, pruning ASHA, objetivo = val NLL, estudios persistentes en SQLite), con cada trial registrado en MLflow. Después, un reentrenamiento final de 10.000 pasos con los mejores hiperparámetros: AdamW con `lr` = 0,001057937785806674, `weight_decay` = 0,001, `clip_grad` = 5,0, `batch_size` = 256, semilla 42, dispositivo `mps` y early stopping con paciencia 20. El dataset de entrenamiento es `Jig09/onomatron-names`, con un nombre saneado por línea. La partición train/val/test es 80/10/10 y se hace por nombre completo (nunca por n-grama) para evitar leakage entre n-gramas correlacionados del mismo nombre; el test se toca una única vez en la evaluación final. El tiempo de entrenamiento reportado es de 19,5 s en `mps` con un pico de 409 MB de memoria.

## Capacidades

- Generación de nombres ficticios de personajes de literatura francesa a nivel de carácter.
- Muestreo con semilla configurable (`net.sample(n=20, seed=42)`) y CLI standalone (`generate.py --bundle . --n 20 --seed 42`).
- Manejo de acentos y caracteres franceses (el vocabulario conserva los acentos; el resto se descarta en la normalización).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo francés.
- No dispone de modo thinking, visión ni audio.
- No modela semántica ni gramática más allá de estadísticas de caracteres.

## Casos de uso

- Generación de nombres para personajes de ficción ambientada en Francia: el modelo produce nombres con fonética y ortografía plausibles del corpus literario francés, útil para escritores o game designers que necesiten topónimos o antropónimos ficticios.
- Pruebas de pipelines de generación de texto a nivel de carácter: al ser un modelo de 0,15 MB con inferencia en CPU, sirve como caso de test reproducible en CI para validar loaders, serialización y sampling.
- Docencia y aprendizaje: ejemplo completo de entrenamiento desde cero con Optuna + MLflow, útil en cursos de ML para ilustrar búsqueda de hiperparámetros y evaluación sin leakage.
- Benchmark de arquitecturas: referencia dentro del benchmark onomatron para comparar WaveNet frente a RNN, MLP, Transformer, Mamba, RWKV, etc., sobre la misma tarea y split.
- Prototipado rápido de generadores de nombres en aplicaciones lúdicas o de demo (por ejemplo, generación de alias para juegos de rol).
- Investigación sobre modelos de lenguaje a nivel de carácter: permite estudiar el efecto de la ventana de contexto (8 caracteres) y de la dilatación en la calidad de la NLL.
- Generación de datasets sintéticos de nombres ficticios para pruebas de software que requieran entradas con forma de nombre propio francés.

## Benchmarks y rendimiento

Resultados del benchmark onomatron (ordenado por val NLL; el modelo de esta ficha es `wavenet`):

| Modelo | val_nll | test_nll | Parametros | Tamano (MB) | Wall (s) | Nombres/s (CPU) |
|---|---|---|---|---|---|---|
| rnn | 2,3592 | 2,3491 | 7.657 | 0,03 | 54,7 | 4.962 |
| mlp | 2,3759 | 2,3679 | 39.291 | 0,16 | 12,8 | 7.688 |
| **wavenet** | **2,4002** | **2,3632** | **37.624** | **0,15** | **19,5** | **1.396** |
| dilated_wavenet | 2,4557 | 2,4275 | 13.016 | 0,05 | 28,8 | 445 |
| ngram | 2,4706 | 2,4632 | 0 | 0,44 | 0,1 | 19.243 |
| rwkv | 2,4849 | 2,3446 | 120.998 | 0,48 | 37,2 | 1.085 |
| gru | 2,5292 | 2,4013 | 8.012 | 0,03 | 23,3 | 3.739 |
| lstm | 2,5381 | 2,3703 | 10.062 | 0,04 | 7,7 | 3.846 |
| linear | 2,5918 | 2,5928 | 1.444 | 0,01 | 3,7 | 7.018 |
| transformer | 3,1470 | 2,3757 | 805.158 | 3,22 | 66,6 | 253 |
| mamba | nan | 2,3653 | 56.102 | 0,22 | 716,6 | 87 |

El modelo ocupa la tercera posición por val NLL (2,4002) y la quinta por test NLL (2,3632). La velocidad de inferencia medida en CPU es de 1.395 nombres/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo entrena con un pico de 409 MB en `mps`, y la inferencia se midió en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problemas. Cualquier GPU consumer (incluso integradas) es sobradamente suficiente.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: el bundle vendorizado `onomatron` (solo torch) y el CLI `generate.py`; no hay soporte oficial para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1.395 nombres/s en CPU según el benchmark del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | val_nll | test_nll | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| onomatron-wavenet | 37.624 | 8 caracteres | 2,4002 | 2,3632 | MIT | Hugging Face |
| onomatron-rnn | 7.657 | no disponible | 2,3592 | 2,3491 | MIT (mismo benchmark) | Hugging Face |
| onomatron-mlp | 39.291 | no disponible | 2,3759 | 2,3679 | MIT (mismo benchmark) | Hugging Face |
| onomatron-transformer | 805.158 | no disponible | 3,1470 | 2,3757 | MIT (mismo benchmark) | Hugging Face |

La comparación natural es contra las otras arquitecturas del mismo benchmark onomatron, todas entrenadas sobre el mismo corpus y split. El `rnn` obtiene mejor NLL con 5 veces menos parámetros y mayor throughput (4.962 nombres/s), mientras que el `mlp` logra NLL ligeramente mejor con un tamaño similar. El `transformer` necesita más de 800.000 parámetros para un test NLL comparable (2,3757) y es mucho más lento en CPU (253 nombres/s).

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (unos pocos miles de nombres): el modelo puede reproducir nombres del conjunto de entrenamiento literalmente.
- Puede generar nombres que coincidan con personas reales; son ficticios por construcción y no deben usarse para nombrar personas reales ni para tomar decisiones sobre individuos.
- Sesgo hacia la literatura francesa; los acentos se conservan, pero el resto de caracteres se descarta en la normalización.
- Sin semántica ni gramática: solo modela estadísticas de caracteres, por lo que no es apto para generación de texto libre.
- Contexto de solo 8 caracteres, lo que limita la coherencia más allá de ese horizonte.
- Los nombres extraídos del dataset de resolución de alias de ObTIC (`compnet-renard/7-romans-alias-resolution`) no tienen licencia declarada; se debe citar a Maurel et al., "Du repérage à l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Université).
- Los ficheros locales `data/external/*.txt` están en gitignore y no declaran licencia; los nombres derivados son hechos, pero su selección no es del autor (ver la card del dataset).
- La licencia MIT cubre código y pesos, pero los datos de entrenamiento están bajo `license: other` con atribución por fuente: revisar la card del dataset antes de uso comercial.
- Riesgo de alucinación en el sentido de generar nombres inexistentes o poco plausibles; no aplica el concepto habitual de alucinación factual porque no genera afirmaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vlemeur/onomatron-wavenet
- Dataset de entrenamiento: https://huggingface.co/datasets/Jig09/onomatron-names
- Benchmark onomatron: https://huggingface.co/Jig09/onomatron-benchmark
- Repositorio del proyecto: https://github.com/vlemeur/onomatron
- makemore (Karpathy): https://github.com/karpathy/makemore
- Dataset de resolución de alias ObTIC: `compnet-renard/7-romans-alias-resolution`
