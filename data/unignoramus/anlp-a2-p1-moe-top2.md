# unignoramus/anlp-a2-p1-moe-top2

## Resumen

El modelo `unignoramus/anlp-a2-p1-moe-top2` es un transformer decoder-only de tipo Mixture of Experts (MoE) desarrollado por el usuario unignoramus como parte de la asignatura ANLP (Assignment 2, Part 1). Su tarea es la traducción automática de vietnamita y japonés a inglés, y forma parte de una serie de cinco ablaciones sobre la capa feed-forward entrenadas exactamente con el mismo presupuesto de tokens, lo que lo convierte en una pieza de experimentación controlada más que en un modelo listo para producción.

Se trata de un modelo muy pequeno: 35,28 millones de parámetros totales y 28,99 millones activos, con 4 expertos en la capa MoE de los que se activan 2 por token (top-2 routing). Se entrenó sobre 36,54 millones de tokens del dataset `belumind/en-vi-ja-curated-500k-triplets`, y reporta una perplejidad de test de 11,07 y un BLEU de test de 26,37. La licencia es MIT, lo que permite uso comercial sin restricciones, aunque su valor práctico es principalmente académico y de investigación sobre enrutado de expertos.

Su relevancia actual es limitada como producto, pero es útil como banco de pruebas reproducible: al compartir arquitectura base, datos y presupuesto de cómputo con otras cuatro variantes de feed-forward, permite aislar el efecto del MoE frente a alternativas densas en un régimen de entrenamiento de bajo coste. No se ha publicado información sobre longitud de contexto, idiomas declarados en los metadatos de HuggingFace ni benchmarks adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa feed-forward de tipo Mixture of Experts (MoE) |
| Parametros totales | 35,28 M |
| Parametros activos | 28,99 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ, GPTQ ni cuantizaciones oficiales) |
| Idiomas soportados | vietnamita, japones e ingles (idiomas de entrenamiento y de la tarea de traduccion, segun la model card); los metadatos de HuggingFace no declaran idiomas |
| Licencia | MIT |
| Formato de pesos | Checkpoint `torch.save` con claves `model`, `state` y `config`; requiere `torch.load(..., weights_only=False)` |

Otros datos declarados: expertos totales 4, expertos activos 2, tokens de entrenamiento 36,54 M, perplejidad de test 11,07, BLEU de test 26,37, tamano del repositorio 0,1 GB, libreria PyTorch.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only (es decir, causal, de tipo GPT) en el que la capa feed-forward densa se sustituye por una capa MoE con 4 expertos y enrutado top-2: cada token se procesa únicamente por 2 de los 4 expertos, de ahí que los parámetros activos (28,99 M) sean inferiores a los totales (35,28 M). El checkpoint es un payload plano de `torch.save` con las claves `model`, `state` y `config`, pensado para cargarse junto al código del transformer que acompana al repositorio; no se publica un `config.json` estándar de HuggingFace ni integración con `transformers`.

El entrenamiento se realizó sobre 36,54 millones de tokens del dataset `belumind/en-vi-ja-curated-500k-triplets` (aproximadamente 500 000 tripletas en-inglés, vi-inglés y ja-inglés), con la misma cantidad de tokens que las otras cuatro ablaciones de feed-forward del mismo trabajo, lo que permite comparaciones directas. No se documenta en la model card si hubo ajuste por RLHF, DPO u otra técnica de alineación, ni la composición exacta del dataset, el esquema de enrutado (por ejemplo, auxiliares de balanceo de carga) o innovaciones de decodificación. El resultado de test reportado es 11,07 de perplejidad y 26,37 de BLEU.

## Capacidades

- Traducción automática de vietnamita a inglés y de japonés a inglés, que es la única tarea para la que se entrenó explícitamente.
- Generación de texto autoregresiva en inglés como idioma de salida.
- Modelado de lenguaje causal de vocabulario pequeno (tamano de vocabulario no disponible).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No se documenta capacidad de visión, audio ni multimodalidad.
- No se documentan capacidades multilingües más allá de los tres idiomas de entrenamiento; no hay indicios de transferencia a otros pares lingüísticos.
- Capacidad de interés para investigación: servir como una de las cinco ablaciones comparables de capa feed-forward (MoE top-2 frente a otras configuraciones) bajo idéntico presupuesto de tokens.

## Casos de uso

- Traducción vi→en y ja→en en pipelines ligeros: el modelo traduce frases o párrafos cortos con un coste de cómputo mínimo (28,99 M de parámetros activos), por lo que puede ejecutarse en CPU o en GPUs integradas para preprocesar contenido antes de enviarlo a un modelo mayor.
- Filtrado y anotación de corpus multilingües: dado su bajo coste, puede usarse para traducir o puntuar grandes lotes de pares de frases durante la curación de datasets, descartando ejemplos de baja calidad antes de un entrenamiento posterior.
- Investigación sobre enrutado de expertos: al ser una de cinco ablaciones con el mismo presupuesto de tokens y el mismo dataset, permite estudiar el efecto de MoE top-2 frente a alternativas densas midiendo BLEU y perplejidad en condiciones controladas.
- Reproducción académica de experimentos: estudiantes e investigadores pueden cargar el checkpoint con `torch.load` y reentrenar o modificar la capa MoE sin necesidad de infraestructura de GPU de gama alta.
- Fine-tuning como baseline de traducción: sirve como punto de partida para adaptar la traducción vi/ja→en a un dominio concreto (por ejemplo, documentación técnica o subtítulos) con muy pocos recursos, dado su tamano y su licencia MIT.
- Despliegue en dispositivos con recursos muy limitados: con 0,1 GB de repositorio y pesos de aproximadamente 141 MB en fp32 (71 MB en fp16), cabe en entornos de edge como una Raspberry Pi o un contenedor pequeño para traducción puntual sin conectividad.
- Pruebas de degradación y límites de contexto: útil como sujeto de experimentos sobre cómo se comporta un MoE pequeno cuando la entrada supera la longitud vista en entrenamiento, sin coste apreciable de cómputo.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Perplejidad de test | 11,07 |
| BLEU de test | 26,37 |
| Tokens de entrenamiento | 36,54 M |
| Parametros totales / activos | 35,28 M / 28,99 M |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, FLORES, WMT u otros) en la informacion disponible, ni tampoco comparaciones numéricas con las otras cuatro ablaciones de la serie. La búsqueda web realizada no devolvió ningun resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 141 MB de pesos en fp32 y 71 MB en fp16; con activaciones, caché KV y sobrecarga del runtime, el consumo total se mantiene por debajo de 1 GB en la mayoria de configuraciones (la longitud de contexto no está publicada, por lo que el tamano de la caché KV no puede calcularse).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050, una RTX 3060 o una GPU integrada; no requiere A100, H100 ni RTX 4090. También es viable en CPU.
- Cabe sin problema en GPU de consumo: si, en cualquier GPU con 1 GB o más de memoria libre, y también en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: no se documenta soporte en vLLM, llama.cpp, Ollama, TGI ni en `transformers`; el uso previsto es cargar el checkpoint con `torch.load(..., weights_only=False)` y alimentar la clave `model` al transformer del repositorio acompante. Seria necesario exportar manualmente a otro formato (TorchScript, ONNX) para otros runtimes.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera latencia de milisegundos por secuencia corta en GPU y de decenas a cientos de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en el rango de los transformers de traducción pequenos (por ejemplo, variantes de MarianMT o NLLB-200 distilled de ~50-600 M de parámetros), pero no hay cifras de BLEU equiparables en la misma dirección lingüística ni con el mismo test set, por lo que cualquier comparación numérica seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anlp-a2-p1-moe-top2 | 35,28 M totales / 28,99 M activos | no disponible | MIT | Checkpoint `torch.save` en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion academica: 35,28 M de parámetros y 36,54 M de tokens de entrenamiento lo sitúan muy por debajo de cualquier modelo de traducción de uso general; la calidad fuera de los dominios del dataset sera limitada.
- Riesgo de alucinacion y de traducciones infieles, especialmente en frases largas, vocabulario especializado, nombres propios y textos con ruido; no se documento ningun proceso de alineacion (RLHF/DPO) ni filtrado de seguridad.
- Sesgos potenciales heredados del dataset `belumind/en-vi-ja-curated-500k-triplets`, cuya composicion, procedencia y metodo de curación no se detallan en la model card; no se ha auditado el sesgo de genero, registro o dominio.
- Ambito lingüístico cerrado: vietnamita y japones hacia ingles; no hay evidencia de funcionamiento en otros pares de idiomas ni de traduccion inversa (en→vi, en→ja).
- Longitud de contexto no publicada: entradas largas pueden degradar el rendimiento o provocar errores, y no se puede dimensionar la caché KV sin ese dato.
- Carga no estandar: el checkpoint es un payload de `torch.save` que requiere `weights_only=False` (advertencia de seguridad: cargar ficheros pickle de origen no confiable puede ejecutar codigo arbitrario) y depende del codigo del transformer del repositorio, sin garantia de compatibilidad con futuras versiones de PyTorch.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; no hay restricciones adicionales, pero tampoco soporte ni mantenimiento.
- Sin resultados de benchmarks en tareas distintas de la traduccion, por lo que no debe asumirse capacidad de razonamiento, codigo, matematicas o dialogo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay comunidad, issues ni validacion independiente de los resultados reportados.
- La busqueda web no devolvio ninguna fuente relevante sobre el modelo; toda la informacion procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p1-moe-top2
- Dataset de entrenamiento citado en la model card: `belumind/en-vi-ja-curated-500k-triplets` (referencia disponible en HuggingFace, identificador indicado por el autor)
- Codigo del transformer: no disponible como enlace directo; la model card menciona un "repositorio acompante" sin URL
- Paper, blog o demo: no disponibles
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo
