# SupraLabs/Supra-Mini-v5-8M

## Resumen

Supra Mini v5 8M es un modelo de lenguaje muy pequeño desarrollado por SupraLabs, la quinta versión de su serie Supra Mini. Con solo 7,87 millones de parámetros, está diseñado para entornos con recursos extremadamente limitados, como CPU de escritorio o dispositivos embebidos, y para fines educativos e investigación. Su objetivo principal es demostrar que es posible entrenar modelos funcionales con presupuestos computacionales mínimos, ofreciendo una alternativa abierta y ligera frente a los modelos de gran tamaño dominantes en el mercado.

El modelo fue entrenado sobre 5.000 millones de tokens del dataset Fineweb-Edu durante 2 épocas, con una arquitectura basada en el diseño Llama. Su ventana de contexto es de 1024 tokens, lo que limita su uso a tareas de generación de texto corto y experimentación. A pesar de su tamaño reducido, alcanza resultados por encima del nivel aleatorio en tareas como Arc_Easy y BLiMP, lo que indica cierta capacidad de razonamiento básico y comprensión lingüística.

La relevancia de este modelo radica en su apertura total (licencia Apache 2.0, pesos en safetensors) y en su facilidad de despliegue en CPU. Se posiciona como una herramienta para investigación educativa, pruebas de pipelines de inferencia y aprendizaje práctico de transformadores, no como un modelo de producción para tareas complejas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 7.867.584 (8M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, se puede cuantizar a int8 o int4 manualmente) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer decoder-only de tipo Llama, con 8 capas ocultas, 4 cabezas de atencion, una dimension oculta de 191 y una dimension intermedia de 768. El vocabulario es de 16.384 tokens, construido con un tokenizador BPE propio, lo que permite una representacion mas compacta que los tokenizadores estandar. El modelo fue entrenado en precision bfloat16 con una tasa de aprendizaje de 2e-4 y un decay de peso de 0,01.

El entrenamiento se realizo sobre el dataset HuggingFaceFW/fineweb-edu, que contiene textos educativos de alta calidad extraidos de la web. Se utilizaron 5.000 millones de tokens durante 2 epocas, alcanzando una perdida final de entropia cruzada de 4,414 en el conjunto de entrenamiento. No se menciona el uso de tecnicas de RLHF ni DPO, por lo que el modelo no ha sido alineado con preferencias humanas; se trata de un modelo base generativo puro.

## Capacidades

- Generacion de texto basica en ingles: el modelo es capaz de producir texto coherente a nivel de frase y parrafo corto, aunque con errores frecuentes y derivas tematicas.
- Razonamiento simple: alcanza un 34,39 % en Arc_Easy, lo que indica cierta capacidad de responder a preguntas de conocimiento basico, aunque muy por debajo de modelos grandes.
- Comprension gramatical: obtiene un 63,49 % en BLiMP, lo que demuestra un aprendizaje parcial de reglas gramaticales inglesas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso complejo.
- No tiene capacidades multimodales (vision, audio, etc.).
- No dispone de modo de pensamiento o "thinking mode".
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion educativa en universidades y centros de formacion: el modelo puede utilizarse para ensenar conceptos de arquitectura transformer, procesos de tokenizacion y entrenamiento de modelos de lenguaje sin necesidad de infraestructura costosa. Su tamano reducido permite cargarlo y ejecutarlo en un portatil convencional, facilitando experimentos practicos en aulas.
- Pruebas de pipelines de inferencia: al ser extremadamente ligero, sirve para validar entornos de despliegue (vLLM, llama.cpp, Ollama) antes de usar modelos mas grandes. Se puede comprobar la configuracion de GPU, la cuantizacion y el rendimiento de la API con un modelo que se carga en segundos.
- Generacion de texto para prototipos de aplicaciones: en fases iniciales de desarrollo, se puede usar para simular respuestas de un modelo de lenguaje en aplicaciones de chat simple, aunque la calidad sera baja y no apta para produccion.
- Entrenamiento de modelos pequenos en recursos limitados: como referencia para quienes quieren entrenar sus propios modelos de tamano minimo, ya que el codigo de entrenamiento y los parametros estan documentados y el dataset usado es publico.
- Pruebas de cuantizacion y compresion: al tener pocos parametros, se puede experimentar con tecnicas de cuantizacion (float16, int8, int4) y medir el impacto en la calidad de generacion sin necesidad de modelos grandes.
- Demostracion de capacidades de generacion de texto en dispositivos embebidos: con una VRAM minima, puede ejecutarse en Raspberry Pi o similares para mostrar que un LLM puede funcionar en hardware de bajo consumo.

## Benchmarks y rendimiento

Los benchmarks fueron ejecutados con `lm-eval` y publicados en la model card del autor.

| Tarea | Valor | Nivel aleatorio |
|---|---|---|
| Arc_Easy | 0,3439 | 0,25 (25 %) |
| Wikitext | 2,6617 | - |
| BLiMP | 0,6349 | 0,50 (50 %) |

El modelo supera el nivel aleatorio en Arc_Easy y BLiMP, lo que indica que ha aprendido patrones linguisticos basicos. La perplexidad de Wikitext de 2,66 es relativamente baja, aunque no se puede comparar directamente con modelos grandes sin un contexto estandarizado. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 7,87 millones de parametros. En bfloat16 (2 bytes por parametro), los pesos ocupan aproximadamente 16 MB. En float32 serian unos 32 MB. Con la memoria adicional de activaciones y cache KV, se estima que el pico de memoria total es inferior a 300 MB, incluso con una ventana de contexto completa de 1024 tokens.
- GPU recomendadas: cualquier GPU moderna, incluidas tarjetas de consumo como la NVIDIA GTX 1650, RTX 2060 o incluso iGPU integradas. En GPU con 4 GB de VRAM o mas, se ejecuta sin problemas.
- CPU: puede ejecutarse en CPU pura, con latencia de pocos milisegundos por token. En un procesador moderno (Intel i5 o superior) se puede generar texto en tiempo real.
- Opciones de despliegue: compatible con Transformers (pipeline), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI y cualquier framework que soporte el formato safetensors.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamano se espera una generacion de cientos de tokens por segundo en GPU y decenas en CPU.

## Comparativa con modelos similares

No hay modelos de tamano comparable (8M de parametros) con datos de benchmarks publicados en la informacion disponible. Los modelos mas pequenos populares, como TinyLlama (1,1B), SmolLM2 (135M) o GPT-2 (124M), tienen entre 15 y 150 veces mas parametros, lo que hace que la comparativa no sea significativa. Dentro de la serie Supra Mini, el propio autor indica que esta version v5 es superior a las anteriores, pero no se han publicado benchmarks de las versiones anteriores. Por tanto, no se puede realizar una comparativa cuantitativa fiable con alternativas directas.

## Limitaciones y advertencias

- Calidad de generacion muy baja: el modelo produce texto incoherente, con repeticiones, perdidas de contexto y derivaciones tematicas, como se observa en los ejemplos de la model card.
- Sesgos y alucinaciones: al entrenarse solo con Fineweb-Edu, puede reflejar sesgos presentes en la web, y su capacidad de alucinacion es alta debido a su tamano reducido.
- Limitacion de contexto: la ventana de 1024 tokens es muy corta para tareas que requieran contexto largo, como resumen de documentos o conversaciones multi-turno.
- Solo ingles: no soporta otros idiomas, por lo que no es util para aplicaciones multilingues.
- Sin alineacion: no se ha realizado RLHF ni DPO, por lo que puede generar contenido inapropiado o no deseado si se le pide.
- No apto para produccion: su uso en entornos de produccion con usuarios reales no es recomendable por la baja calidad y falta de control.
- No disponible para tareas complejas: no soporta tool calling, agentes, ni razonamiento matematico o de codigo.
- Dependencia de la libreria transformers: el despliegue requiere de un entorno con transformers instalado, aunque se puede convertir a GGUF para llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra-Mini-v5-8M
- Repositorio de archivos: https://huggingface.co/SupraLabs/Supra-Mini-v5-8M/tree/main
- Log de entrenamiento: https://huggingface.co/SupraLabs/Supra-Mini-v5-8M/blob/main/training.log
- Organizacion SupraLabs: https://huggingface.co/SupraLabs/models
