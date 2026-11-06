# zhvhabqifova/guangmingxing-d24

## Resumen

Guangmingxing (GMX) d24 es un modelo de chat multimodal de pequeno tamano entrenado desde cero con la herramienta `train_llm`, siguiendo el enfoque de karpathy/nanochat. Lo desarrolla el usuario zhvhabqifova y se publica bajo licencia MIT. El modelo combina comprension de imagenes (mediante un codificador SigLIP2 congelado y un proyector propio) con generacion de texto conversacional, y ademas decide cuando dibujar: emite marcadores estructurados que delega la sintesis de imagen a un modelo externo (Z-Image-Turbo).

La arquitectura consta de 24 capas con anchura 1536 y unos 2.100 millones de parametros totales, aunque la mayor parte de ese peso reside en las tablas de value-embedding; el Transformer y la cabeza de salida suman aproximadamente 780 millones de parametros. El tokenizador es BPE con 65.536 tokens y el modelo es exclusivamente en ingles.

Es relevante como ejemplo didactico de pipeline multimodal completo (chat + vision + text-to-image en conversacion) construido con recursos modestos, pero el propio autor advierte que es un modelo pequeno, que comete errores e inventa cosas, y que no es apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo nanochat (24 capas, anchura 1536) con proyector visual sobre SigLIP2 congelado |
| Parametros totales | ~2,1B (Transformer y cabeza de salida ~0,78B; el resto en tablas de value-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`.ckpt`); tokenizador en `tokenizer.pkl` |

## Arquitectura y entrenamiento

El modelo sigue el diseno de karpathy/nanochat: un transformer decoder-only de 24 capas y anchura 1536, entrenado desde cero mediante la herramienta `train_llm`. La particularidad de reparto de parametros es que la mayor parte del peso (aproximadamente 1,3B de los 2,1B totales) corresponde a tablas de value-embedding, mientras que el cuerpo del Transformer y la cabeza de salida suman unos 0,78B. El tokenizador es un BPE de 65.536 tokens.

La componente multimodal anade un codificador visual SigLIP2 congelado junto con un proyector entrenado especificamente para este modelo, lo que permite al sistema interpretar imagenes dentro de la conversacion. La generacion de imagenes no la realiza el propio modelo: cuando decide dibujar, emite marcadores `<|visual prompt|>...<|/visual prompt|>` o, para editar una imagen previa, `<|edit prompt|><|image ref|>N<|/image ref|>...<|/edit prompt|>`, y un modelo de imagen externo (Z-Image-Turbo) ejecuta la sintesis. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles con multiples turnos.
- Comprension de imagenes (image understanding) mediante SigLIP2 congelado y proyector propio.
- Generacion de imagenes en conversacion: el modelo decide cuando dibujar y emite un prompt visual estructurado que se delega a Z-Image-Turbo.
- Edicion de imagenes previas dentro de la conversacion mediante referencias `<|image ref|>N<|/image ref|>`.
- Razonamiento multi-turno con contexto conversacional e imagenes intercaladas.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de codigo, matematicas o agentes: no documentadas.
- Capacidades multilingues: solo ingles.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales multimodales: sirve para experimentar con un pipeline completo (texto + vision + generacion de imagen) en un unico modelo de 2,1B, util en entornos de investigacion y docencia.
- Demostraciones de text-to-image conversacional: el modelo puede mantener una conversacion y, cuando el usuario lo pide, emitir el marcador de prompt visual que dispara la generacion con Z-Image-Turbo, permitiendo construir demos interactivas con la pagina `script/chat_t2i_web.py`.
- Edicion iterativa de imagenes en dialogo: gracias a los marcadores `<|edit prompt|>` y `<|image ref|>N<|/image ref|>`, se puede pedir "cambia el fondo de la imagen 2" y el sistema referencia la imagen previa para regenerarla.
- Educacion e investigacion sobre arquitecturas nanochat: el modelo y su codigo (`model/gpt.py`, `train_llm`) sirven como material de estudio reproducible de un entrenamiento from scratch con vision integrada.
- Base para fine-tuning academico: al ser MIT y de tamano reducido, es viable adaptarlo a dominios concretos en ingles con recursos de una sola GPU.
- Pruebas de concepto de asistentes con capacidad de describir imagenes: la componente SigLIP2 permite tareas de image captioning y respuesta a preguntas sobre imagenes en ingles.
- Evaluacion de pipelines de delegacion de tareas: util para estudiar como un LLM pequeno decide cuando invocar un modelo generativo externo y como formatea las instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los benchmarks y el proceso completo de entrenamiento estan en el README del repositorio, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,8 GB en total; el checkpoint `chat_t2i_v9.ckpt` con ~2,1B parametros en precision completa requiere del orden de 8-9 GB de VRAM (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria en GPUs consumer de gama alta (RTX 3090/4090 con 24 GB) y en A100/H100, aunque no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si en tarjetas con 16-24 GB, aunque no confirmado.
- Opciones de despliegue: el autor indica cargar con el codigo del repositorio (`model/gpt.py`) y descargar con `python -m script.download_release`; la interfaz web es `script/chat_t2i_web.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con datos verificables de parametros, contexto y rendimiento. Como referencia cualitativa, el propio autor situa el modelo en la estela de karpathy/nanochat (entrenamiento from scratch de LLMs pequenos), pero no se aportan cifras comparativas.

## Limitaciones y advertencias

- El autor advierte explicitamente de que es un modelo pequeno que comete errores e inventa cosas (riesgo alto de alucinacion).
- No es apto para uso en produccion, segun la propia model card.
- Solo soporta ingles; no hay capacidades multilingues.
- La generacion de imagenes depende de un modelo externo (Z-Image-Turbo); la calidad final del dibujo no la controla GMX d24.
- El reparto de parametros (mayoria en value-embedding) implica que la capacidad efectiva del Transformer es menor de lo que sugiere el total de 2,1B.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado from scratch con datos no detallados, cabe esperar sesgos propios del corpus y del idioma.
- Licencia MIT: permite uso comercial, pero el autor desaconseja produccion por calidad, no por restricciones legales.
- No hay informacion sobre cuantizaciones disponibles ni sobre el formato de pesos mas alla del checkpoint PyTorch.
- El checkpoint requiere el codigo del repositorio para cargarse; no es directamente compatible con runtimes estandar sin adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhvhabqifova/guangmingxing-d24
- Dataset asociado: https://huggingface.co/datasets/zhvhabqifova/guangmingxing-d24-data
- Repositorio de entrenamiento `train_llm`: https://github.com/1023097618/train_llm
- Proyecto de referencia nanochat (karpathy): https://github.com/karpathy/nanochat
- Modelo de imagen externo Z-Image-Turbo: no disponible en la informacion proporcionada
- Codificador visual SigLIP2: no disponible en la informacion proporcionada
