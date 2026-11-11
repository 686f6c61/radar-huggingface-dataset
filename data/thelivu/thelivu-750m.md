# Thelivu/Thelivu-750M

## Resumen

Thelivu-750M es un modelo base de tipo encoder-decoder Transformer desarrollado por Saravanan A R (organización Thelivu) y publicado en octubre de 2026. Con 751.889.408 parámetros, se presenta como un modelo compacto disenado especificamente para servir de sustrato a adaptadores LoRA: se entrena una sola vez desde cero y cada nueva capacidad se anade como un adaptador pequeno en lugar de reentrenar un modelo completo. El nombre "Thelivu" (தெளிவு) significa "claridad" en tamil.

La arquitectura es un Transformer secuencia-a-secuencia clasico con 24 capas de encoder y 24 de decoder, anchura d_model de 1.024, 16 cabezas de atencion y feed-forward de 2.816 con GELU con compuerta. Emplea RMSNorm con pre-norm y sesgo de posicion relativa (32 buckets, distancia maxima 128). El contexto es de 2.048 tokens de entrada y 2.048 de salida, con un vocabulario SentencePiece de 33.728 piezas y fallback de bytes. Se entreno con una mezcla de denoisers UL2 sobre prosa en ingles, codigo fuente y texto de linea de comandos.

Su relevancia actual radica en la propuesta de eficiencia: en lugar de desplegar modelos grandes para cada tarea, ofrece un base pequeno (2,4 % de parametros entrenables por adaptador de rango 16) que cabe en dispositivos y navegadores mediante una exportacion ONNX int8 incluida en el repositorio. No es un modelo de chat ni esta alineado con instrucciones; su valor esta en la infraestructura de adaptadores y en tareas de transformacion de texto donde la copia literal de fragmentos (URLs, codigo, numeros, nombres) es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence), base model |
| Parametros totales | 751.889.408 (embeddings de entrada y salida atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrada y 2.048 tokens de salida |
| Tipos de cuantizacion | int8 (exportacion ONNX incluida); checkpoint original en fp32 |
| Idiomas soportados | Ingles, codigo fuente y texto de linea de comandos |
| Licencia | Thelivu License, Version 1.0 (licencia propia, no estandar) |
| Formato de pesos | safetensors (fp32), ONNX (int8), tokenizer SentencePiece (spm.model) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder con 24 capas en cada torre, d_model de 1.024, 16 cabezas de atencion de 64 dimensiones y feed-forward de 2.816 con activacion GELU con compuerta. La normalizacion es RMSNorm en configuracion pre-norm y las posiciones se codifican mediante sesgo de posicion relativa con 32 buckets y distancia maxima de 128. El encoder es bidireccional y lee la entrada completa antes de generar; el decoder atiende al encoder mediante cross-attention en cada paso, lo que permite copiar fragmentos literalmente y preservar URLs, codigo, numeros y nombres exactamente como aparecen en la entrada. El vocabulario es SentencePiece con 33.728 piezas y fallback de bytes.

El entrenamiento se realizo desde cero con una mezcla de denoisers UL2, lo que habilita modos de continuacion, relleno de spans cortos y reconstruccion de spans largos, seleccionables mediante tokens de modo (`[S]` continuar, `[R]` rellenar spans cortos, `[X]` reconstruir spans largos). El checkpoint publicado corresponde al paso 90.000 de 90.000, el mejor de la ejecucion, en precision fp32 aunque el entrenamiento se hizo en bf16 mixto. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset. No se menciona RLHF ni DPO; es un modelo base sin alineacion. La innovacion principal es el diseno para adaptadores: un adaptador LoRA de rango 16 sobre cada capa lineal entrena 18.287.616 parametros (2,4 % del modelo) manteniendo congelados los pesos base.

## Capacidades

- Generacion de texto y continuacion: el modo `[S]` permite continuar texto dado un prefijo, con decodificacion greedy o por muestreo.
- Relleno de spans cortos: el modo `[R]` rellena huecos marcados con centinelas `<extra_id_N>`.
- Reconstruccion de spans largos: el modo `[X]` reconstruye fragmentos extensos de texto.
- Copia literal de fragmentos: gracias al encoder bidireccional y la cross-attention, preserva URLs, codigo, numeros y nombres exactamente.
- Procesamiento de codigo fuente y texto de linea de comandos, incluidos en el entrenamiento.
- Capacidad de servir como base para adaptadores LoRA de tareas especificas (el adaptador de rango 16 entrena 2,4 % de los parametros).
- Sin soporte nativo de tool calling ni function calling (es un modelo base, no alineado).
- Sin soporte de agentes ni razonamiento multi-paso (requiere adaptador).
- Sin capacidades de vision ni audio.
- Multilingue: no disponible; solo ingles, codigo y linea de comandos.

## Casos de uso

- Investigacion sobre modelos con adaptadores: el modelo sirve como base controlada para estudiar el entrenamiento de adaptadores LoRA de rango 16 sobre un Transformer pequeno, con la ventaja de que cada experimento entrena solo el 2,4 % de los parametros y los pesos base permanecen congelados.
- Relleno y reconstruccion de texto: en tareas de reparacion de documentos, completado de plantillas o reconstruccion de fragmentos corruptos, los modos `[R]` y `[X]` con centinelas `<extra_id_N>` permiten generar texto en huecos concretos preservando el contexto circundante.
- Inferencia en navegador y en dispositivo: la exportacion ONNX int8 incluida en el repositorio permite ejecutar el modelo en runtimes de navegador y dispositivos con recursos limitados, adecuado para extensiones y aplicaciones locales sin servidor.
- Procesamiento de codigo y linea de comandos: el entrenamiento incluye codigo fuente y texto de shell, por lo que puede emplearse en tareas de completado o transformacion de comandos y fragmentos de codigo dentro de flujos de desarrollo.
- Generacion de texto asistida con preservacion de datos: en escenarios donde deben mantenerse intactos identificadores, rutas o cifras (documentacion tecnica, configuraciones), la copia literal del encoder bidireccional reduce el riesgo de alterar esos elementos.
- Base para adaptadores de reescritura de texto: la model card menciona que la extension de navegador EchoMeBetter ejecuta adaptadores de reescritura de texto sobre Thelivu en el dispositivo, lo que ilustra el patron de producto basado en adaptadores.
- Prototipado rapido de tareas seq2seq: para equipos que quieran experimentar con transformaciones de texto sin desplegar modelos grandes, el checkpoint fp32 y la exportacion int8 cubren tanto entrenamiento de adaptadores como inferencia ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB solo para pesos (751,9 M parametros x 4 bytes), mas activaciones y cache de atencion; en la practica se recomienda al menos 6-8 GB para contexto completo de 2.048 tokens.
- VRAM estimada para inferencia en int8 (ONNX): aproximadamente 0,75-1 GB para pesos, apta para dispositivos con recursos limitados.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en fp32, y GPUs de datacenter (A100, H100) no son necesarias para inferencia.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en fp32; en int8 cabe en dispositivos mucho mas modestos.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), ONNX Runtime (exportacion int8 incluida), text-generation-inference (el modelo esta etiquetado como compatible con endpoints); no se mencionan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Thelivu-750M | 751,9 M | 2.048 in / 2.048 out | Encoder-decoder, base | Thelivu License 1.0 | Disenado para adaptadores LoRA; exportacion ONNX int8; solo ingles |
| T5-base | 220 M | 512 | Encoder-decoder, base | Apache 2.0 | Referencia clasica seq2seq; contexto menor y sin modo UL2 explicito |
| T5-large | 770 M | 512 | Encoder-decoder, base | Apache 2.0 | Tamano comparable; contexto de 512 tokens frente a 2.048 |
| FLAN-T5-base | 220 M | 512 | Encoder-decoder, instruction-tuned | Apache 2.0 | Alineado con instrucciones, a diferencia de Thelivu, que es base |

La comparacion se limita a la familia T5 por ser la referencia arquitectonica mas directa (encoder-decoder con SentencePiece); no se dispone de datos de rendimiento de Thelivu-750M para comparar metricas.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning ni alineacion: no debe usarse como asistente ni para seguir instrucciones sin un adaptador entrenado.
- Solo soporta ingles, codigo fuente y texto de linea de comandos; no hay capacidades multilingues.
- Contexto limitado a 2.048 tokens de entrada y 2.048 de salida, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion inherente a un modelo generativo sin alineacion; la copia literal reduce pero no elimina errores en datos criticos.
- No apto para decisiones de seguridad, medicas, legales o financieras, segun la propia model card.
- La licencia Thelivu License 1.0 es propia y no estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que las restricciones no se detallan en la informacion disponible.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- El checkpoint esta en fp32 (3,9 GB de repositorio); para despliegues ligeros debe usarse la exportacion ONNX int8.
- La model card contiene secciones ocultas (marcadores ECHOMEBETTER-HIDDEN) sobre productos y adaptadores aun no anunciados; no deben considerarse capacidades disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thelivu/Thelivu-750M
- Informe tecnico: https://saravanan-a-r.github.io/Thelivu/
- Codigo fuente: https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
