# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3

## Resumen

szl-receiptagent-qwen35-0.8b-sft-v3 es un ajuste fino supervisado (SFT) del modelo SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2, desarrollado por SZLHOLDINGS dentro de su "estate" gobernado de modelos. El modelo parte de una base de arquitectura Qwen 3.5 con 873.438.784 parametros totales (aproximadamente 0,87 mil millones) y esta orientado a tareas de agente sobre documentos tipo recibo, segun indica su nombre y su pipeline declarado de generacion de texto con soporte image-text-to-text en las etiquetas.

La relevancia de esta publicacion es acotada y conviene entenderla con precision: se trata de una pasada de SFT sobre corpus pequenos (2.899 ejemplos en total), entrenada con LoRA de rango 16 durante 3 epocas y fusionada en un checkpoint de 16 bits. El propio autor declara explicitamente que no constituye una evaluacion de calidad independiente ni una decision de promocion, y que no hay ninguna afirmacion de precision o rendimiento asociada. Es, por tanto, un artefacto de entrenamiento documentado y trazable, no un modelo validado para produccion.

La ficha resulta util para desarrolladores e investigadores que quieran evaluar el modelo por si mismos, reproducir el pipeline de ajuste con Unsloth o estudiar la trazabilidad del proceso (logs de entrenamiento, launcher y datasets publicos). No debe confundirse con un modelo listo para desplegar en entornos reales de extraccion de datos de recibos sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen 3.5 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 873.438.784 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la longitud de secuencia usada en entrenamiento fue 4096) |
| Tipos de cuantizacion | no disponible (el autor publica un checkpoint fusionado en 16 bits; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo completo fusionado en 16 bits, no solo adaptador) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2, que a su vez es un modelo con adaptadores LoRA. En esta pasada se cargaron los adaptadores existentes y se continuo el entrenamiento con LoRA en bf16 de rango 16, durante 3 epocas, con learning rate 2e-4, longitud de secuencia 4096 y empaquetado (packing) de secuencias. Se completaron 87 pasos de entrenamiento sobre 452 secuencias empaquetadas que cubren 2.883 ejemplos. Los parametros entrenables fueron 10.822.656 de 863.808.576 (1,25 %).

Los datos de entrenamiento provienen de dos corpus publicos del mismo autor: szl-frontier-sft-mix-v2 (206 ejemplos) y szl-quant-sft-v1 (2.693 ejemplos). El entrenamiento se ejecuto en una unica RTX A6000 (Massed Compute) con el backend Unsloth, y el artefacto publicado es el modelo completo fusionado en 16 bits, no un export solo de adaptadores. No se documentan detalles sobre la composicion interna del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas adicionales en la arquitectura. La model card incluye una imagen de "prueba de recibo" de entrenamiento y remite a logs privados y al launcher publico en GitHub.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`, `conversational`).
- Soporte declarado de entrada imagen-texto a texto (`image-text-to-text` en las etiquetas), lo que sugiere capacidad de procesar imagenes de recibos junto con texto; el alcance real no esta documentado en la model card.
- Orientacion a tareas de agente sobre recibos ("receiptagent"), aunque no se detallan las funciones concretas ni el formato de salida esperado.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion estructurada de recibos en fase de prototipo: el modelo puede emplearse para probar pipelines de conversion de imagenes de recibos a campos estructurados (comercio, fecha, importe, impuestos), dado su nombre y su etiqueta image-text-to-text; requiere validacion propia antes de cualquier uso real.
- Investigacion sobre ajuste fino con Unsloth: sirve como caso reproducible de SFT con LoRA de rango 16 sobre corpus pequenos, con launcher y logs publicos, para estudiar el efecto del empaquetado y de pocas epocas en modelos de menos de mil millones de parametros.
- Evaluacion comparativa de modelos pequenos: util como punto de referencia en experimentos academicos sobre modelos de 0,8 B en tareas de documentos, siempre que se ejecute una evaluacion independiente.
- Generacion de datos sinteticos de recibos: el modelo puede emplearse para producir descripciones textuales de recibos en ingles que alimenten otros pipelines de entrenamiento, con revision humana obligatoria.
- Demostraciones y pruebas de concepto en local: al caber en una GPU de consumo por su tamano, permite montar demos de agentes documentales sin infraestructura dedicada.
- Estudio de gobernanza y trazabilidad de modelos: el artefacto documenta pasos, hardware, datasets y logs, lo que lo hace util como ejemplo de proceso de publicacion controlado en un estate corporativo.
- Filtrado previo en pipelines OCR: podria actuar como capa de normalizacion o resumen de texto OCR de recibos en ingles antes de un modelo mayor, aunque sin garantias de precision sin evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion contra las suites de benchmark del estate es un paso separado y pendiente, y que esta publicacion no incluye ninguna afirmacion de precision o rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 1,7-2 GB solo para pesos (873 M de parametros), mas overhead de activaciones y KV cache; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. Las variantes cuantizadas no estan publicadas por el autor y habria que generarlas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para 16 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El entrenamiento se realizo en una RTX A6000.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI requeririan conversion o verificacion de compatibilidad con la arquitectura `qwen3_5`, no documentada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-sft-v3 | 873 M | no disponible | Apache 2.0 | Hugging Face | SFT sobre corpus pequenos, sin benchmarks publicados |
| Qwen2.5-0.5B / 1.5B Instruct | 0,5 B / 1,5 B | 32 K (Qwen2.5) | Apache 2.0 | Hugging Face | Modelos generalistas con evaluaciones publicadas; comparables por tamano |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 K | Apache 2.0 | Hugging Face | Alternativa pequena con benchmarks publicados |
| Gemma 2 2B | 2 B | 8 K | Gemma Terms | Hugging Face | Mayor tamano, requiere aceptar terminos de uso |

La comparacion directa de rendimiento no es posible porque el modelo de SZLHOLDINGS no publica resultados de benchmarks. La eleccion entre estas alternativas dependera de si se prioriza un modelo generalista validado o un artefacto especializado y trazable pendiente de evaluacion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor declara que no hay ninguna afirmacion de precision o rendimiento; no debe asumirse calidad por el nombre "receiptagent".
- Corpus de entrenamiento muy pequeno (2.899 ejemplos) y solo 87 pasos: riesgo alto de sobreajuste y de comportamiento fragil fuera de la distribucion de entrenamiento.
- Riesgo de alucinacion en la extraccion de campos de recibos: sin evaluacion, no hay garantia de fidelidad a los datos de la imagen.
- Idioma limitado al ingles; no hay soporte documentado de castellano ni de otras lenguas.
- Capacidad multimodal declarada en etiquetas pero no detallada en la model card; conviene verificar el procesador de imagenes antes de usarla.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar el modelo recae en el integrador; no hay garantias del autor.
- Trazabilidad parcial: los logs de entrenamiento estan en un dataset privado, lo que limita la reproduccion completa por terceros.
- No es un modelo promovido ni validado por el autor; se describe como un paso intermedio de un proceso de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Dataset szl-frontier-sft-mix-v2: https://huggingface.co/datasets/SZLHOLDINGS/szl-frontier-sft-mix-v2
- Dataset szl-quant-sft-v1: https://huggingface.co/datasets/SZLHOLDINGS/szl-quant-sft-v1
- Dataset de logs (privado): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Launcher de entrenamiento: https://github.com/szl-holdings/szl-forge/blob/main/training/train_wave.py
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
