# TensorFold/Qwen3.8-27B-TFQ3

## Resumen

Qwen3.8-27B-TFQ3 es una cuantización de 4 bits del modelo Qwen3.8-27B, publicada por TensorFold bajo licencia Apache 2.0. El checkpoint combina pesos TFQ3 (un formato de cuantización propio de TensorFold) con una base en BF16, y está específicamente orientado a inferencia nativa en Apple Silicon mediante Metal. El objetivo es reducir el peso del modelo de los 27,50 GiB del checkpoint MLX de 8 bits a 14,34 GiB sin degradar la calidad de forma significativa respecto a una cuantización de 4 bits convencional.

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.5, según la etiqueta `qwen3_5` del repositorio, y está pensado para generación de texto y conversación. La aportación de TensorFold no es un nuevo entrenamiento, sino una recompresión del checkpoint original: los pesos se han modificado para el formato TFQ3 y se distribuyen con el resto del modelo en safetensors y shards propios.

La relevancia de esta ficha es acotada pero concreta: es un checkpoint de nicho para desarrolladores que quieran ejecutar un modelo de la clase 27B en hardware Apple con un presupuesto de memoria ajustado. No es un modelo nuevo ni un fine-tune, y requiere una build nativa de TensorFold con soporte TFQ3, por lo que no es directamente compatible con vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 1.297.636.864 (según safetensors del repo); el nombre del modelo indica 27B, discrepancia no aclarada por el autor |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de servido reportada; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | TFQ3 (4 bits) con base BF16; referencia comparativa con MLX 8-bit y MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors + shards TFQ3 + tablas TFQ3 (requiere build nativa de TensorFold) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B más allá de la etiqueta `qwen3_5`, que sitúa la familia en la generación Qwen3.5. Tampoco se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Esta ficha, por tanto, no puede describir el proceso de entrenamiento del modelo original.

La innovación técnica de este checkpoint es el formato TFQ3: una cuantización de 4 bits con base BF16 que, según el autor, reduce el peso a 14,34 GiB frente a los 14,98 GiB de MLX 4-bit y los 27,50 GiB de MLX 8-bit. En la comparación publicada, TFQ3 obtiene perplejidad de 5,3680 (4.790 tokens) y 6,5829 (3.071 tokens held-out), ligeramente mejor que MLX 4-bit (5,3694 y 6,6021). Frente a la referencia MLX 8-bit, la divergencia KL media es de 0,02316 (frente a 0,03352 de MLX 4-bit, un 31% menor) y la del percentil 99 es de 0,15037 (frente a 0,27518, un 45% menor), sobre 1.022 posiciones evaluadas.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B; el alcance concreto no está documentado en la información disponible.
- Servido con contexto de 32.768 tokens y hasta ocho slots de stream simultáneos en la configuración de referencia.
- Decodificación en streaming con latencia de primer token de 145 ms en Apple M5 Ultra.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es únicamente text-generation.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está diseñado para ejecutarse en un Mac con chip de la serie M mediante Metal, con 14,34 GiB de pesos y un presupuesto de arranque de 43,29 GiB, lo que permite desplegar un modelo de clase 27B en equipos de gama alta sin GPU dedicada.
- Asistentes conversacionales de escritorio: con 32.768 tokens de contexto y ocho slots de stream, el servidor puede atender varias conversaciones simultáneas en local, útil para prototipos de atención al usuario sin enviar datos a la nube.
- Procesamiento de documentos largos en local: la ventana de 32.768 tokens permite resumir o extraer información de contratos, informes o artículos sin fragmentación agresiva, manteniendo los datos en el dispositivo.
- Evaluación comparativa de cuantizaciones: los datos de perplejidad y divergencia KL publicados lo convierten en una referencia práctica para medir el impacto de TFQ3 frente a MLX 4-bit y 8-bit en un mismo hardware.
- Desarrollo y pruebas offline: al no requerir conexión ni APIs externas, sirve para iterar en pipelines de generación de texto en entornos aislados o con requisitos de privacidad.
- Servicio de generación de texto de baja concurrencia: con 44,4 tok/s de decodificación en streaming en M5 Ultra, es adecuado para uso individual o equipos pequeños, no para cargas de producción de alta concurrencia.

## Benchmarks y rendimiento

| Metrica | MLX 8-bit (referencia) | MLX 4-bit | TFQ3 con base BF16 |
|---|---:|---:|---:|
| Tamano de pesos | 27,50 GiB | 14,98 GiB | 14,34 GiB |
| Perplejidad (4.790 tokens) | 5,2468 | 5,3694 | 5,3680 |
| Perplejidad held-out (3.071 tokens) | 6,4485 | 6,6021 | 6,5829 |
| Divergencia KL media vs MLX 8-bit | — | 0,03352 | 0,02316 |
| Divergencia KL percentil 99 vs MLX 8-bit | — | 0,27518 | 0,15037 |

Rendimiento en vivo reportado en Apple M5 Ultra: 44,4 tok/s en decodificación streaming sin drafter, 145 ms hasta el primer token, 2,1 s de carga, contexto de 32.768 tokens, ocho slots de stream y presupuesto de arranque de 43,29 GiB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 14,34 GiB solo para pesos; el autor reporta un presupuesto de arranque de 43,29 GiB con contexto de 32.768 tokens y ocho slots de stream, por lo que se recomienda al menos 48 GiB de memoria unificada.
- GPU recomendadas: Apple M5 Ultra según la prueba del autor; no se documentan GPUs NVIDIA o AMD compatibles.
- Compatibilidad con GPU de consumo: el formato requiere una build nativa de TensorFold con soporte TFQ3 para Qwen3.8-27B en Apple Silicon (Metal); no se indica compatibilidad con RTX 4090 u otras GPUs de consumo.
- Opciones de despliegue: exclusivamente el servidor nativo de TensorFold con soporte TFQ3. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 145 ms hasta el primer token y 44,4 tok/s de decodificación en streaming en M5 Ultra; no se dispone de datos para otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TFQ3 | 27B (según nombre; 1.297.636.864 según safetensors) | 32.768 tokens (config. de servido) | 14,34 GiB | Apache 2.0 | Hugging Face, requiere TensorFold nativo |
| Qwen3.8-27B MLX 4-bit | 27B | no disponible | 14,98 GiB | Apache 2.0 | Hugging Face, ecosistema MLX |
| Qwen3.8-27B MLX 8-bit | 27B | no disponible | 27,50 GiB | Apache 2.0 | Hugging Face, ecosistema MLX |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye alternativas de otros fabricantes. Frente a MLX 4-bit, TFQ3 ocupa un 4,3% menos de disco y mejora la divergencia KL frente a la referencia de 8 bits; frente a MLX 8-bit, ocupa aproximadamente la mitad, a costa de una perplejidad superior (5,3680 frente a 5,2468).

## Limitaciones y advertencias

- Dependencia de un runtime propietario: requiere una build nativa de TensorFold con soporte TFQ3; no funciona con vLLM, llama.cpp, Ollama, TGI ni con MLX estándar, lo que limita la portabilidad y la integración en producción.
- Discrepancia de parámetros: el nombre del modelo indica 27B, pero los safetensors del repositorio declaran 1.297.636.864 parámetros. El autor no aclara esta diferencia, lo que introduce incertidumbre sobre el tamaño real y los requisitos de memoria.
- Idiomas no documentados: la model card no especifica la cobertura lingüística, por lo que no se puede garantizar un comportamiento adecuado en castellano u otros idiomas sin evaluación previa.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de sesgo; al ser una recompresión del modelo base, hereda sus limitaciones sin que el autor las cuantifique.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la dependencia del runtime TensorFold puede condicionar el despliegue según los términos de dicho runtime, no detallados en la información disponible.
- Rendimiento medido en un único hardware: las cifras de 44,4 tok/s y 145 ms corresponden a un Apple M5 Ultra; no hay datos para otros chips, por lo que no deben extrapolarse.
- Adopción mínima: cero descargas y un solo like en el momento de la consulta, sin comunidad ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorFold/Qwen3.8-27B-TFQ3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0: https://huggingface.co/TensorFold/Qwen3.8-27B-TFQ3/blob/main/LICENSE
