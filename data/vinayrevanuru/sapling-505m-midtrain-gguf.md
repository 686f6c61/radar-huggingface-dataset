# VinayRevanuru/Sapling-505M-Midtrain-GGUF

## Resumen

Sapling-505M-Midtrain-GGUF es la distribucion cuantizada en formato GGUF del checkpoint de mid-training de Sapling-505M, un modelo de lenguaje de 505 millones de parametros entrenado desde cero por VinayRevanuru sobre la arquitectura densa de Qwen3. El modelo original acumula 5.000 millones de tokens de preentrenamiento mas 1.000 millones de tokens adicionales de annealed mid-training con mezcla de matematicas, datos conversacionales y replay, y esta publicado bajo licencia Apache-2.0. Esta variante GGUF esta pensada para ejecutarse en llama.cpp, Ollama, LM Studio y cualquier runtime compatible.

El modelo no es un asistente conversacional: continua texto y ha visto la plantilla ChatML, pero no termina sus turnos de forma autonoma, por lo que debe usarse como base para fine-tuning propio o como completador de texto y matematicas. Para uso conversacional el autor remite a Sapling-505M-SFT. Su interes practico radica en que ofrece un modelo base pequeno, con tokenizer propio y perplexity verificada tras la cuantizacion, adecuado para experimentacion en hardware de consumo y para pipelines de destilacion o ajuste fino.

La relevancia actual de esta ficha es acotada: se trata de un artefacto de cuantizacion con 49 descargas y sin likes, creado y actualizado el 26 de octubre de 2026, cuyo valor esta en la reproducibilidad del proceso de conversion y en la paridad de perplexity documentada frente al modelo FP32 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 dense (transformer decoder-only), 30 capas, ancho 1.024, 16 cabezas de query y 8 cabezas KV, embeddings atados |
| Parametros totales | 505.483.776 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q8_0 (8,5 bpw); conversion BF16 intermedia no publicada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero Sapling-505M-Midtrain-Q8_0.gguf, 513 MB); original en safetensors FP32 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen3, con 30 capas, dimension oculta de 1.024, 16 cabezas de atencion para query y 8 para clave-valor (GQA) y embeddings atados entre entrada y salida. El contexto maximo es de 2.048 tokens. El tokenizer es propio: un BPE byte-level de 32.768 entradas cuyo pre-tokenizer es la regex ByteLevel estandar de GPT-2, registrada como `gpt-2` en llama.cpp; se verifico paridad token a token con el tokenizer de Hugging Face sobre texto con emojis, acentos, LaTeX, tabuladores y marcadores ChatML.

El entrenamiento del modelo base consistio en 5.000 millones de tokens de preentrenamiento seguidos de 1.000 millones de tokens de annealed mid-training con mezcla de matematicas, datos de chat y replay. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion exacta del dataset. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp (commit `d854d98`) a BF16 y posterior cuantizacion a Q8_0 con `llama-quantize`. La innovacion tecnica destacable es la verificacion de calidad: la perplexity en WikiText-2 del fichero GGUF Q8_0 (22,87) coincide con la del modelo FP32 original (22,86), lo que confirma que la conversion y el tokenizer son exactos.

## Capacidades

- Generacion y continuacion de texto en ingles.
- Completado de matematicas y expresiones algebraicas (el ejemplo de la model card es la derivada de x^3).
- Razonamiento basico de texto derivado del preentrenamiento, sin modo thinking explicito.
- Exposicion de la plantilla ChatML en el fichero GGUF, aunque el modelo no cierra turnos de forma autonoma.
- Compatibilidad con la API OpenAI-compatible de `llama-server` en el puerto 8080.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni capacidades multimodales.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- Completado de texto tecnico en ingles: el modelo continua fragmentos de documentacion o articulos con un limite de tokens fijado por el usuario, aprovechando su contexto de 2.048 tokens y su naturaleza de completador puro.
- Generacion y resolucion de expresiones matematicas: sirve como completador de pasos intermedios en problemas algebraicos, tal como documenta el autor con el ejemplo de derivadas, y puede integrarse en cuadernos o herramientas de calculo asistido.
- Base para fine-tuning propio: al ser un checkpoint de mid-training con licencia Apache-2.0 y solo 505M de parametros, es un punto de partida economico para ajustar un modelo especializado en dominios concretos con recursos limitados.
- Destilacion y generacion de datos sinteticos: puede producir continuaciones de texto a gran escala en pipelines de aumentacion de datos, con control de temperatura y top-p para evitar bucles.
- Prototipado y docencia: su tamano de 513 MB en Q8_0 permite ejecutarlo en portatiles y estaciones de trabajo modestas para experimentar con tecnicas de cuantizacion, tokenizacion y evaluacion de perplexity.
- Evaluacion comparativa de runtimes GGUF: al publicarse la paridad de perplexity entre transformers, MLX y llama.cpp, es util como referencia para validar la fidelidad de conversiones y cuantizaciones en otros modelos.
- Servicio local de completado via API: mediante `llama-server` se puede exponer una API compatible con OpenAI en localhost para pruebas de integracion sin coste de inferencia en la nube.

## Benchmarks y rendimiento

| Variante | Tamano | WikiText-2 PPL | Diferencia vs FP32 |
|---|---|---|---|
| FP32 original (transformers) | 2,0 GB | 22,86 | — |
| GGUF BF16 (control de conversion, no publicado) | 965 MB | 22,87 | +0,0 % |
| GGUF Q8_0 | 513 MB | 22,87 | +0,0 % |

La perplexity se midio sobre las primeras 64 ventanas de 1.024 tokens del conjunto de test de WikiText-2 en crudo, puntuando la segunda mitad de cada ventana con el mismo procedimiento que `llama-perplexity`, y con las mismas ventanas y metodo en transformers, MLX y llama.cpp. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para el fichero Q8_0 de 513 MB, mas el overhead del runtime y la cache KV para 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo es viable en tarjetas de gama de entrada y en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, entre otras) y tambien en CPU gracias al bajo numero de parametros.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/VinayRevanuru/Sapling-505M-Midtrain-GGUF:Q8_0`), LM Studio y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor recomienda muestreo (`--temp 0.7 --top-p 0.9`) en lugar de decodificacion greedy, que tiende a entrar en bucles en modelos de 0,5B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sapling-505M-Midtrain-GGUF | 505M | 2.048 | GGUF Q8_0 | Apache-2.0 | Completador de texto y matematicas, no chat; PPL WikiText-2 22,87 |
| Sapling-505M-SFT | 505M | no disponible | no disponible | Apache-2.0 (segun modelo base) | Variante ajustada para conversacion del mismo autor |
| Qwen3 denso de referencia | no disponible | no disponible | no disponible | no disponible | Arquitectura base en la que se inspira Sapling; no se dispone de datos concretos en la informacion proporcionada |

No se dispone de datos de benchmarks de tareas ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo de chat: continua texto y no termina sus turnos, por lo que en uso conversacional produce respuestas sin cierre; es necesario fijar un limite de tokens.
- La decodificacion greedy tiende a entrar en bucles; se recomienda muestreo con temperatura y top-p.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo soporta ingles segun la metadata del modelo.
- Riesgo de alucinacion inherente a un modelo de 505M entrenado con 6.000 millones de tokens; no debe usarse como fuente de verdad sin verificacion.
- No hay documentacion sobre sesgos especificos, pero al ser un modelo pequeno y de dominio general en ingles es probable que reproduzca sesgos presentes en los datos de preentrenamiento.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un checkpoint de mid-training sin alineacion; para produccion conviene un ajuste fino previo.
- Artefacto con muy poca traccion (49 descargas, 0 likes) y sin validacion externa; la unica evaluacion disponible es la perplexity del autor.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain-GGUF
- Modelo base de mid-training: https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain
- Variante ajustada para chat: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT
- Repositorio de llama.cpp (conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
