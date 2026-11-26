# Thibault-GAREL/qwen3.5-4b-jacobian-lens

## Resumen

El Jacobian lens (J-lens) para Qwen3.5-4B es un artefacto de interpretabilidad, no un modelo generativo. Lo desarrolla Thibault GAREL dentro del proyecto J-space y consiste en una matriz de 2560 x 2560 por capa que proyecta los estados ocultos de las capas intermedias del modelo base directamente al espacio de vocabulario, revelando que palabras "tiene en mente" el modelo antes de emitir el siguiente token. Se ha ajustado con la librería jacobian-lens de Anthropic sobre Qwen/Qwen3.5-4B en fp16, cubriendo las capas 10 a 28 de las 32 totales.

El artefacto resuelve un problema concreto de la investigación en interpretabilidad: el logit lens clásico solo produce lecturas coherentes en las capas finales, mientras que este J-lens recupera representaciones verbalizables desde la capa 11, donde el logit lens devuelve ruido (tokens en chino o fragmentos sin sentido). En el ejemplo de la model card, ante la petición de escribir una obra corta, el J-lens lee "talk", "dialogue", "whispered" y "conversation" en la capa 11, mientras que el logit lens devuelve `足`, `停`, `对话`.

Es relevante ahora porque se alinea con el trabajo de Anthropic sobre representaciones verbalizables como espacio de trabajo global (julio de 2026) y permite comparar directamente con el lens de referencia publicado por Neuronpedia, con el que comparte el 83 % de las palabras del top-10 y una distancia relativa media del 8,9 %. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jacobian lens (una matriz 2560 x 2560 por capa) ajustada sobre un transformer Qwen3.5-4B |
| Parametros totales | No aplica: el artefacto contiene 19 matrices de 2560 x 2560 en fp16 (238 MB); el modelo base Qwen3.5-4B tiene 4 000 millones de parametros (dato del nombre, no confirmado en la informacion) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible para el modelo base; los prompts de ajuste usan 128 tokens |
| Tipos de cuantizacion | No disponible; el lens se distribuye en fp16 |
| Idiomas soportados | No disponible (el corpus de ajuste es wikitext-103, predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch), mas `convergence.csv` y `config.json` |

## Arquitectura y entrenamiento

El J-lens es una herramienta de interpretabilidad basada en el jacobiano de la funcion que mapea los estados ocultos de cada capa intermedia a la salida final del modelo. Para cada capa entre la 10 y la 28 (de 32 totales), se estima una matriz de 2560 x 2560 que aproxima como contribuye esa capa a la prediccion del ultimo token, y se aplica sobre el estado oculto para obtener una distribucion sobre el vocabulario. El modelo base es Qwen3.5-4B, que segun la model card incluye capas Gated DeltaNet (un detalle que sugiere una arquitectura hibrida, aunque la model card no lo describe en detalle).

El ajuste se realizo sobre `Salesforce/wikitext`, `wikitext-103-raw-v1` train, con parrafos de 600 a 2000 caracteres truncados a 128 tokens, saltando los primeros 16 tokens de cada prompt. Se alcanzo la convergencia con 422 prompts, aplicando la regla de parada cuando la media de los ultimos 10 cambios relativos cae por debajo de 0,002 (se detuvo en 0,00197). El entrenamiento se ejecuto en dos sesiones de Kaggle con 2 x Tesla T4, una copia del modelo por GPU, 212 segundos por prompt y 12 h 46 min de GPU en total. El backward en fp16 de algunas capas Gated DeltaNet desborda en ciertas dimensiones de salida; el autor escala el cotangente por 2⁻⁶ y reescala las filas, lo que preserva el jacobiano por linealidad del backward. Los hiperparametros siguen los del lens de Neuronpedia para permitir la comparacion directa.

## Capacidades

- Lectura de representaciones latentes: proyecta los estados ocultos de las capas 10 a 28 al espacio de vocabulario, mostrando las palabras candidatas que el modelo "tiene en mente" antes de generar.
- Deteccion temprana de intencion: en el ejemplo de la model card, identifica el plan de la respuesta ("dialogue", "whispered", "tonight", "scene", "cafe") desde la capa 11, frente al logit lens, que no produce lecturas coherentes hasta la capa 24.
- Comparacion entre capas: permite observar la evolucion de la representacion capa a capa (19 capas ajustadas).
- Analisis multilingue incidental: el lens recupera tokens en chino (`场景`, `剧场`) junto a tokens en ingles en las capas 24 y 26, lo que refleja el espacio de representacion del modelo base, no una capacidad declarada del artefacto.
- Integracion con el ecosistema Hugging Face: carga mediante `JacobianLens.from_pretrained` y `from_hf` de la libreria `jlens`.
- No soporta generacion de texto, tool calling, agentes ni razonamiento por si mismo: es un instrumento de analisis que se aplica sobre el modelo base.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: analizar en que capa y con que tokens se forma la intencion de respuesta en Qwen3.5-4B, aprovechando la cobertura de 19 capas intermedias y la regla de convergencia documentada.
- Auditoria de planes latentes: detectar antes de la generacion si el modelo planea un contenido problematico (por ejemplo, un dialogo sobre un secreto), leyendo las palabras del top-k en capas tempranas.
- Comparacion de metodos de lectura: contrastar J-lens frente a logit lens sobre el mismo prompt; la model card reporta solo un 10 % de solapamiento medio en el top-10, lo que cuantifica la diferencia.
- Replicacion y validacion cruzada: comparar con el lens de referencia de Neuronpedia, con 8,9 % de distancia relativa media y un rango de 2,9 % (capa 28) a 15,7 % (capa 10), para validar pipelines propios.
- Docencia y divulgacion: el proyecto J-space explica el metodo paso a paso y el ejemplo de la obra de teatro sirve como demostracion reproducible con codigo de carga incluido.
- Analisis de sesgos en el espacio latente: estudiar que terminos aparecen en capas tempranas ante prompts sensibles, como senal de asociaciones aprendidas por el modelo base.
- Desarrollo de herramientas de monitorizacion: integrar el lens en un pipeline que inspeccione `positions=[-5]` (el salto de linea tras "assistant") antes de permitir la generacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de convergencia y de acuerdo entre lenses:

| Metrica | Valor |
|---|---|
| Distancia relativa media a Neuronpedia (19 capas) | 8,9 % |
| Rango de distancia relativa a Neuronpedia | 2,9 % (capa 28) a 15,7 % (capa 10) |
| Top-10 compartido con Neuronpedia (media) | 83 % (rango 67 % a 95 %) |
| Top-10 compartido con logit lens (media) | 10 % (rango 0 % a 55 %) |
| Prompts de ajuste | 422 (parada en 0,00197) |
| Coste de ajuste | 12 h 46 min de GPU en 2 x Tesla T4 |

## Requisitos de hardware

- VRAM para el lens: 238 MB en fp16, negligible frente al modelo base.
- VRAM para el modelo base: Qwen3.5-4B en bf16 requiere aproximadamente 8 GB de pesos; con cache KV y overhead, se recomienda 12-16 GB. No confirmado en la informacion proporcionada.
- GPU usadas en el ajuste: 2 x Tesla T4 (16 GB cada una), una copia del modelo por GPU, 212 s por prompt.
- GPU consumer: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia alojar el modelo base en bf16; en GPUs de 8-12 GB seria necesario cuantizar el modelo base (no se documenta compatibilidad del lens con modelos cuantizados).
- Despliegue: la carga se documenta con `transformers` y `device_map={"": "cuda"}`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el lens requiere acceso a los estados ocultos intermedios, por lo que los servidores de inferencia optimizados no son aplicables directamente.
- Latencia: no disponible para inferencia; el coste de ajuste fue de 212 s por prompt en T4.

## Comparativa con modelos similares

| Artefacto | Modelo base | Capas ajustadas | Prompts | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este J-lens (Thibault-GAREL) | Qwen3.5-4B | 10-28 (19 capas) | 422 | Apache 2.0 | Hugging Face, 0 descargas, 1 like |
| neuronpedia/jacobian-lens | Qwen3.5-4B | No disponible en la informacion | 417 | No disponible | Hugging Face, con demo interactiva en neuronpedia.org/jlens |
| Logit lens (referencia conceptual) | Cualquiera | Todas | No aplica | No aplica | Implementaciones multiples |

La comparacion principal es con el lens de Neuronpedia: ambos usan los mismos hiperparametros y corpus, y difieren en 8,9 % de distancia relativa media, con mayor acuerdo en capas tardias (2,9 % en la capa 28) y mayor divergencia en capas tempranas (15,7 % en la capa 10). Frente al logit lens, el solapamiento del top-10 es solo del 10 % de media, lo que evidencia que el J-lens captura informacion que el logit lens no recupera en capas intermedias.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; es una herramienta de analisis que requiere el modelo base Qwen3.5-4B cargado.
- Cobertura parcial: solo se ajustan las capas 10 a 28; las capas 0-9 y 29-31 no estan cubiertas, segun el autor porque las primeras solo parsean tokens y las ultimas solo eligen el siguiente token.
- Sesgo de corpus: el ajuste usa wikitext-103, predominantemente en ingles y de dominio enciclopedico; el comportamiento sobre otros dominios o idiomas no esta validado.
- Deriva en capas tempranas: la distancia al lens de Neuronpedia alcanza el 15,7 % en la capa 10, por lo que las lecturas tempranas deben interpretarse con cautela.
- Dependencia de version: requiere la libreria `jacobian-lens` de Anthropic instalada desde GitHub (`pip install git+...`), sin version fijada, lo que puede romper la reproducibilidad.
- Precaucion numerica: el backward en fp16 de capas Gated DeltaNet desborda y requiere el escalado del cotangente documentado; replicar el ajuste sin ese ajuste puede producir resultados incorrectos.
- Adopcion minima: 0 descargas y 1 like en el momento de la consulta, sin validacion independiente por terceros.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Qwen3.5-4B tiene sus propios terminos, no detallados en la informacion.
- Riesgo de sobreinterpretacion: las palabras del top-k son candidatas latentes, no una cadena de razonamiento verificada; no deben tratarse como explicaciones causales de la salida final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thibault-GAREL/qwen3.5-4b-jacobian-lens
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria jacobian-lens (Anthropic): https://github.com/anthropics/jacobian-lens
- Proyecto J-space: https://github.com/Thibault-GAREL/J-space
- Lens de referencia de Neuronpedia: https://huggingface.co/neuronpedia/jacobian-lens
- Demo interactiva de Neuronpedia: https://www.neuronpedia.org/jlens
- GitHub del autor: https://github.com/Thibault-GAREL
- Dataset de ajuste: https://huggingface.co/datasets/Salesforce/wikitext
- Paper citado: Anthropic, *Verbalizable Representations Form a Global Workspace in Language Models* (julio de 2026); no se proporciona URL en la informacion disponible.
