# thenukegun10x/DivCenterer

## Resumen

DivCenterer es un modelo de lenguaje decoder-only de tamano deliberadamente minimo, desarrollado por el usuario de Hugging Face thenukegun10x, cuyo unico proposito es generar codigo CSS para centrar un elemento `div` utilizando CSS Grid o Flexbox. Con 1.217.808 parametros en safetensors (1.107.216 segun la model card), 4 capas de decodificador, anchura 144 y 4 cabezas de atencion, se trata de un experimento de entrenamiento desde cero sobre datos sinteticos, no de un modelo de proposito general.

El modelo no es un checkpoint compatible con `AutoModel` de Transformers: requiere cargar los pesos con la implementacion incluida en el repositorio (`model.py`) y un tokenizer byte-BPE propio de 768 tokens. Esta orientado a una tarea unica y cerrada, con respuestas canonicas generadas por plantillas, lo que explica sus resultados de coincidencia exacta del 100 % en el conjunto de evaluacion sintetico.

Su relevancia es acotada pero ilustrativa: demuestra como un transformer diminuto entrenado con datos sinteticos deterministas puede resolver una tarea de generacion de codigo muy restringida con recursos de consumo (entrenado en una AMD Radeon RX 9070 XT con BF16 y PyTorch SDPA). No es adecuado para generacion de texto abierta, razonamiento ni codigo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (4 capas, anchura 144, 4 cabezas de atencion, SwiGLU de anchura 384) |
| Parametros totales | 1.217.808 (safetensors); 1.107.216 segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no declara idiomas; las entradas son prompts en ingles segun las plantillas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer.json`, `model.py` y `tokenizer.py` |

## Arquitectura y entrenamiento

DivCenterer es un transformer decoder-only de 4 capas con anchura 144, 4 cabezas de atencion y una capa SwiGLU de anchura 384. El entrenamiento se realizo desde cero, sin pesos preentrenados ni corpus descargado, con autocast BF16 y PyTorch SDPA sobre una GPU AMD Radeon RX 9070 XT. El tokenizer es un byte-BPE restringido de 768 tokens, propio del proyecto, lo que impide usar tokenizers estandar de Hugging Face sin adaptacion.

Los datos de entrenamiento son un conjunto sintetico determinista: prompts y HTML generados a partir de plantillas y listas de palabras especificas del proyecto. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La model card indica que tanto el modelo como el dataset se desarrollaron con asistencia de IA. La innovacion tecnica destacable no es arquitectonica, sino metodologica: un modelo minimo entrenado sobre un dominio cerrado y con respuestas canonicas, evaluado por coincidencia exacta.

## Capacidades

- Generacion de CSS para centrar un `div` mediante CSS Grid o Flexbox, con respuestas canonicas.
- Generacion de texto condicionada a prompts de plantilla sobre centrado de elementos HTML.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; las plantillas parecen estar en ingles.
- No dispone de modo thinking, vision ni audio.
- No es un modelo de proposito general: no se debe esperar codigo fuera del dominio de centrado de `div`.

## Casos de uso

- Generacion de snippets CSS en herramientas de demostracion: el modelo puede producir la respuesta canonica para centrar un `div` con Grid o Flexbox, util como ejemplo educativo de transformers minimos.
- Prototipado de pipelines de datos sinteticos: sirve para validar un flujo completo de generacion de dataset, tokenizer propio y entrenamiento desde cero antes de escalar a un modelo mayor.
- Pruebas de integracion de safetensors y cargadores personalizados: permite verificar el flujo de `load_file` con una implementacion propia (`model.py`) en lugar de `AutoModel`.
- Benchmarking de infraestructura en GPU de consumo: al ser diminuto, se puede usar para medir latencia y throughput de inferencia en una RX 9070 XT u otras GPU consumer sin cuellos de botella de memoria.
- Educacion y divulgacion: ejemplo concreto de tokenizer byte-BPE restringido y evaluacion por coincidencia exacta en un dominio cerrado.
- Generacion de respuestas de referencia en tests: puede actuar como oraculo para comparar implementaciones de centrado CSS en suites de pruebas sinteticas.

## Benchmarks y rendimiento

Resultados de coincidencia exacta de CSS con decodificacion greedy sobre el conjunto de evaluacion sintetico, segun la model card:

| Split | Exact |
|---|---:|
| Validation | 410/410 |
| Held-out pairs | 410/410 |
| Unseen values | 64/64 |
| Held-out phrasing | 96/96 |
| **Total** | **980/980** |

Estos resultados miden coincidencias exactas contra las respuestas canonicas del dataset generado, no contra CSS real arbitrario. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 para los 1,2 M de parametros, mas el overhead del runtime de PyTorch; cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte de PyTorch, incluida la AMD Radeon RX 9070 XT usada en el entrenamiento; tambien CPU.
- Cabe en GPU consumer: si, en cualquier modelo actual e incluso en iGPU.
- Opciones de despliegue: carga manual con `safetensors.torch.load_file` y la implementacion `model.py` incluida; no es compatible con vLLM, llama.cpp, Ollama ni TGI sin adaptacion, al no ser un checkpoint `AutoModel` estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DivCenterer | 1,2 M | no disponible | CSS para centrar `div` | MIT | Hugging Face |
| Modelos de codigo general (p. ej. CodeLlama, StarCoder) | miles de millones | miles de tokens | codigo general | licencias variables | Hugging Face |
| Modelos minimos de tarea unica (varios en HF) | <10 M | no disponible | tareas cerradas | variables | Hugging Face |

No se dispone de una comparativa cuantitativa con alternativas equivalentes de tarea unica en la informacion proporcionada; los modelos de codigo general no son comparables en tamano ni en alcance.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo genera CSS para centrar un `div` con Grid o Flexbox; fuera de ese ambito la salida no es fiable.
- Riesgo de alucinacion alto fuera del dominio: al entrenarse sobre plantillas sinteticas, no generaliza a CSS arbitrario ni a HTML complejo.
- No es un checkpoint `AutoModel`: requiere la implementacion y el tokenizer propios del repositorio.
- Longitud de contexto no documentada; prompts largos pueden degradar la salida.
- Idiomas no declarados; las plantillas parecen en ingles.
- Licencia MIT permite uso comercial, pero la utilidad practica fuera de demos y tests es muy limitada.
- Desarrollado con asistencia de IA y sobre datos sinteticos: posibles sesgos de plantilla y falta de validacion con CSS real.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/thenukegun10x/DivCenterer
- Repositorio de pesos y codigo: incluido en el propio repo de Hugging Face (`model.py`, `tokenizer.py`, `config.json`, `tokenizer.json`, `model.safetensors`)
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion proporcionada.
