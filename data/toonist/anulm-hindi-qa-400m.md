# toonist/AnuLM-Hindi-QA-400M

## Resumen

AnuLM-Hindi-QA-400M es un modelo de generacion de texto especializado en responder preguntas en hindi, ingles y Python, desarrollado por el usuario toonist. Se trata de un fine-tuning del modelo base AnuLM-Base-400M (en su paso 36.000) sobre pares pregunta-respuesta construidos a partir de parrafos introductorios de Wikipedia en hindi e ingles, y de docstrings de funciones Python extraidas de codeparrot-clean. El modelo esta disenado para un registro enciclopedico: recibe una pregunta y devuelve una o dos frases de definicion.

Arquitectonicamente es un transformer de tipo mixture-of-experts (MoE) con 20 capas, dimension oculta de 1.024, atencion GQA con 16 cabezas de consulta y 4 de clave-valor, 24 expertos enrutados de dimension 192 con enrutamiento top-4 y equilibrio sin funcion auxiliar (aux-loss-free balancing). Incluye ventana deslizante de 256 tokens en las capas 0-9 y una longitud de contexto de 512 tokens. Cuenta con 397,7 millones de parametros totales y 173,5 millones activos por token, con un vocabulario de 32k.

Su relevancia radica en ser un modelo pequeno y eficiente para el ecosistema indic, con un consumo de recursos muy contenido y un enfoque deliberadamente acotado: no es un chatbot ni un asistente conversacional, sino un respondedor de preguntas de tipo enciclopedico. La licencia CC BY-SA 4.0 y su tamano lo hacen adecuado para experimentacion y despliegue en entornos con recursos limitados, siempre que se respeten las condiciones de atribucion y comparticion bajo la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts (MoE), 20 capas, hidden 1.024, GQA 16 query / 4 key-value heads, 24 expertos enrutados de 192 con top-4 routing y aux-loss-free balancing, sliding window 256 en capas 0-9 |
| Parametros totales | 397.660.560 (397,7M) |
| Parametros activos | 173,5M por token |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (la model card recomienda cargar en float32; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | hindi (hi), ingles (en); Python como lenguaje de codigo en el entrenamiento |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `tokenizer.multi32k.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo emplea la misma red que el resto de checkpoints AnuLM de 400M: un transformer decoder-only con 20 capas, dimension oculta de 1.024 y atencion con query grouping (16 cabezas de consulta, 4 de clave-valor). La capa MoE incorpora 24 expertos enrutados de dimension 192 con enrutamiento top-4 y una estrategia de equilibrio sin funcion auxiliar (aux-loss-free balancing), lo que da 397,7M de parametros totales pero solo 173,5M activos por token. Las capas 0-9 usan ventana deslizante de 256 tokens y el contexto maximo es de 512 tokens. El tokenizador es `multi32k`, con vocabulario de 32k.

El entrenamiento parte del modelo base AnuLM-Base-400M (paso 36.000), que segun la model card vio C4 (ODC-BY) y Python de GitHub via codeparrot-clean, ademas de datos de Wikipedia. El fine-tuning se realizo sobre pares pregunta-respuesta generados con scripts (`make_qa.py`, `make_qa_en.py`, `make_qa_py.py`) a partir de parrafos introductorios de Wikipedia en hindi e ingles y de docstrings de funciones Python. La perdida se calcula unicamente sobre los tokens de la respuesta. Las plantillas de prompt se almacenan en el checkpoint como `qa_templates`: `प्रश्न: {q}` + salto de linea + `उत्तर:` para hindi, y `Question: {q}` + salto de linea + `Answer:` para ingles y Python. La perdida de respuesta en el conjunto de validacion fue de 3,3150 en el paso seleccionado. No se documenta el uso de RLHF o DPO.

Una particularidad tecnica relevante es que el router MoE mantiene un sesgo por experto en float32; redondearlo a bfloat16 altera que expertos se activan y provoca el colapso de la salida en tokens repetidos. Por ello el modelo debe cargarse en float32 (los tensores grandes se almacenan en bfloat16 y se convierten al cargar), y para velocidad se recomienda `torch.autocast` sobre pesos float32. Ademas, las inferencias por lotes deben ser sin padding (una secuencia a la vez) y no se soporta beam search.

## Capacidades

- Generacion de respuestas de tipo definicion enciclopedica en hindi, ingles y Python a partir de una pregunta.
- Comprension de preguntas en formato `X क्या है?`, `X के बारे में बताइए।`, `What is X?` y `What does this function do?`.
- Generacion de texto autoregresiva con decodificacion greedy o por muestreo (temperatura 0,3 y penalizacion de repeticion 1,3 son los ajustes usados en los ejemplos).
- Cobertura multilingue limitada a hindi e ingles, con capacidad adicional para describir funciones Python.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- No es un chatbot: no tiene identidad conversacional ni memoria de dialogo.

## Casos de uso

- Resolucion de preguntas enciclopedicas en hindi: el modelo responde a preguntas del tipo "¿Que es X?" con una o dos frases de definicion, aprovechando su entrenamiento sobre parrafos introductorios de Wikipedia en hindi. Es adecuado para integrarse en un buscador o FAQ que necesite respuestas breves y directas en ese idioma.
- Resolucion de preguntas enciclopedicas en ingles: misma funcionalidad que el caso anterior pero para consultas en ingles, con la plantilla `Question: ... Answer:`. Util para prototipos de asistentes de conocimiento con contexto corto (512 tokens).
- Documentacion automatica de funciones Python: dado un docstring o una pregunta sobre el proposito de una funcion, el modelo genera una descripcion breve. Puede emplearse en herramientas internas de exploracion de codebases o en la generacion de resumentes de API.
- Generacion de FAQs y glosarios: a partir de una lista de terminos o entidades, el modelo produce definiciones de una o dos frases que pueden servir como borrador para glosarios tecnicos o enciclopedicos en hindi e ingles.
- Experimentacion e investigacion en modelos indic de bajo coste: con 397,7M de parametros totales y 173,5M activos, el modelo cabe en GPUs de consumo y sirve como banco de pruebas para estudiar enrutamiento MoE, tokenizacion multilingue o fine-tuning sobre datos de Wikipedia.
- Filtrado y enriquecimiento de datasets: el modelo puede generar respuestas de referencia para pares pregunta-respuesta y ayudar a detectar ejemplos de baja calidad en corpus de QA en hindi o ingles, siempre con revision humana dada su tendencia a inventar detalles.
- Educacion y divulgacion en hindi: como generador de definiciones breves sobre temas conocidos, puede alimentar fichas o tarjetas de contenido en aplicaciones educativas, con la advertencia de que los temas poco frecuentes degradan rapidamente la calidad.

## Benchmarks y rendimiento

La model card declara un `model-index` con la entrada `AnuLM-Hindi-QA-400M` pero sin resultados (`results: []`). El unico dato cuantitativo publicado es la perdida de respuesta en el conjunto de validacion: 3,3150 en el paso seleccionado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Perdida de respuesta en validacion (held-out) | 3,3150 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,6 GB solo para los pesos (397,7M parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica, un entorno con 4-6 GB de VRAM es suficiente.
- VRAM estimada en bfloat16: unos 0,8 GB para los pesos, aunque la model card desaconseja forzar bfloat16 por el sesgo del router; la opcion recomendada es cargar en float32 y usar `torch.autocast` para acelerar.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter como A100 o H100, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, o el repositorio AnuLM con `serve.py` (interfaz web en el puerto 8000), `ask.py` y `sample.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Las restricciones de una secuencia por lote (sin padding) y la ausencia de beam search limitan el throughput en comparacion con modelos densos de tamano similar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales con otros modelos en la informacion proporcionada. La siguiente tabla recoge unicamente los datos disponibles del modelo y deja como "no disponible" los de las alternativas, al no poder verificarse.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AnuLM-Hindi-QA-400M | 397,7M totales / 173,5M activos | 512 | CC BY-SA 4.0 | MoE, especializado en QA enciclopedico hi/en/Python |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un chatbot: no ha visto conversaciones, carece de identidad y trata preguntas como "What is your name?" como un tema a definir.
- Alucinacion: la model card advierte explicitamente de que inventa detalles con libertad; cualquier dato relevante debe verificarse.
- Degradacion en temas poco frecuentes: las respuestas son sensatas para temas conocidos, pero la calidad cae rapidamente en temas raros.
- Contexto limitado a 512 tokens, lo que restringe el tamano de las preguntas y del contexto que puede procesar.
- Restriccion de inferencia: no soporta beam search y los lotes deben ser sin padding (una secuencia a la vez), lo que limita el throughput.
- Restriccion de precision: no debe forzarse bfloat16; el sesgo del router en float32 es necesario para evitar el colapso en tokens repetidos.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obligacion de compartir las obras derivadas bajo la misma licencia. Los pares de entrenamiento derivan de Wikipedia (CC BY-SA) y el modelo base vio C4 (ODC-BY) y codeparrot-clean (licencias mixtas), lo que anade obligaciones de atribucion.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre Wikipedia en hindi e ingles hereda los sesgos de cobertura y representacion de esas fuentes.
- No afiliado a AI4Bharat, BharatGen ni al Gobierno de India.
- `trust_remote_code=True` es obligatorio y el codigo se carga desde el repositorio; se recomienda fijar una revision para evitar cambios no deseados.
- Idioma: solo hindi e ingles; no hay soporte documentado para otras lenguas indias.

## Enlaces

- Hugging Face: https://huggingface.co/toonist/AnuLM-Hindi-QA-400M
- Modelo base: https://huggingface.co/toonist/AnuLM-Base-400M
- Repositorio AnuLM (referenciado en la model card, scripts `serve.py`, `ask.py`, `sample.py`, `make_qa.py`, `docs/RESULTS.md`): no disponible como URL en la informacion proporcionada
- Paper: no disponible
- Blog o demo: no disponible
