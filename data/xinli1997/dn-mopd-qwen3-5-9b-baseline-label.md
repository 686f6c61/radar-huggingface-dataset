# XINLI1997/DN-MOPD-Qwen3.5-9B-baseline-label

## Resumen

DN-MOPD-Qwen3.5-9B-baseline-label es un ajuste fino de Qwen/Qwen3.5-9B publicado por el autor XINLI1997 como línea base del artículo *Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation* (arXiv:2609.35347). Se trata de la variante "Label" del método MOPD: destilación on-policy con múltiples profesores del mismo tamaño (matemáticas, código e instrucción) en la que cada prompt se puntúa únicamente por el experto de su dominio, con todos los multiplicadores de dominio fijados a 1. No es el método propuesto por el artículo, sino el término de comparación frente al cual se mide DN-MOPD.

El modelo parte de Qwen3.5-9B y se entrena durante 80 actualizaciones con 2.700 prompts (900 por dominio) y semilla de estudiante 42. El resultado son 9.409.813.744 parámetros en bfloat16, publicados en safetensors en formato Hugging Face. La clase de arquitectura es `Qwen3_5ForConditionalGeneration`, es decir, un transformer decoder-only con encoder de visión heredado del modelo base, aunque el entrenamiento y la evaluación del artículo se hicieron solo con texto.

Su relevancia es fundamentalmente metodológica: sirve para reproducir y auditar la comparación central del artículo, donde se muestra que el enrutado por etiqueta no supera al mejor estudiante de profesor único en ninguno de los tres tamaños evaluados de Qwen3.5 (9B, 4B y 2B). Es, por tanto, un checkpoint de investigación para experimentos de destilación, no un modelo orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con encoder de vision (clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue con vLLM de la model card; la ficha no declara la ventana oficial del modelo base |
| Tipos de cuantizacion | No disponibles: solo se publican pesos en bfloat16, sin GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Hugging Face, bfloat16); la exportacion omite los 15 tensores `mtp.*` del modelo base |

Datos adicionales de la ficha: precision de entrenamiento bfloat16, formato de chat no-thinking (`enable_thinking=False` obligatorio), semilla de estudiante 42 y tamanos maximos de prompt y respuesta de 2.048 y 8.192 tokens respectivamente.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer decoder-only con encoder de visión que en este checkpoint se arrastra sin cambios desde el modelo base. Todos los tensores conservan los nombres y las formas originales salvo los 15 tensores de predicción multi-token (`mtp.*`), que la exportación desde el checkpoint FSDP no incluye; por eso la decodificación especulativa basada en MTP no está disponible con estos pesos. El `config.json`, los ficheros del tokenizador y `chat_template.jinja` son los del modelo base sin modificar.

El entrenamiento es una destilación on-policy con tres profesores del mismo tamaño (matemáticas, código e instrucción) que puntúan las respuestas generadas por el propio estudiante. El enrutado por etiqueta asigna cada prompt a un único experto según su dominio, con todos los multiplicadores de dominio iguales a 1. La ventaja por token es la diferencia entre el log-probabilidad del profesor y el log-probabilidad recalculado por el actor, usada en una pérdida OPD de gradiente de política recortado (clip de ratio 0,2/0,2), sin términos de KL ni de entropía. El lote es de 64 prompts × 8 respuestas = 512 respuestas por actualización, con un paso de optimizador por lote de rollout. Se usa Adam con tasa de aprendizaje 1e-6 constante tras 5 actualizaciones de calentamiento, betas (0,9; 0,98), weight decay 0,1 y recorte de gradiente 1,0, durante 80 actualizaciones. La temperatura de muestreo es 1,0.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat no-thinking; es obligatorio pasar `enable_thinking=False` porque la plantilla de Qwen3.5 activa el modo thinking por defecto.
- Razonamiento matemático: 2.700 prompts de entrenamiento incluyen 900 de matemáticas, y el modelo obtiene 55,3 en AIME25 y 63,2 en AIME26 (avg@64 con semilla 42).
- Generación y resolución de código: 900 prompts de código en el entrenamiento y 56,8 en LiveCodeBench v5 y 52,6 en LiveCodeBench v6 (avg@6).
- Seguimiento de instrucciones: 900 prompts de instruction following y 84,0 en IFEval y 38,4 en IFBench (precisión estricta, avg@16).
- Capacidad de visión heredada del modelo base (el encoder se mantiene), pero sin entrenamiento ni evaluación multimodal en este trabajo: el artículo usó únicamente texto.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Soporte de agentes o razonamiento multi-paso explícito: no documentado; el modo thinking está desactivado en el formato de chat empleado.
- Capacidades multilingües: la ficha declara únicamente inglés.

## Casos de uso

- Reproducción de resultados de investigación en destilación: el checkpoint existe específicamente para replicar la fila "Label" de la tabla 1 del artículo y compararla con DN-MOPD y con el estudiante inicial. Requiere vLLM 0.18.0 o `transformers>=5` y semilla 42 para coincidir con las cifras publicadas.
- Evaluación de matemáticas en pipelines de razonamiento: se puede integrar en un servicio que reciba problemas y devuelva la respuesta final en `\boxed{}`, con prompts de hasta 2.048 tokens y respuestas de hasta 8.192, que es el régimen con el que se obtuvo el 55,3 en AIME25.
- Evaluación de código en investigación: útil como referencia en bancos tipo LiveCodeBench para medir el efecto de técnicas de destilación sobre generación de código, comparando contra el 54,9 del estudiante inicial en LCB v5.
- Auditoría de métodos de enrutado de profesores: permite contrastar empíricamente la afirmación del artículo de que el enrutado por etiqueta no supera al mejor estudiante de profesor único en 9B, 4B y 2B.
- Punto de partida para ajuste posterior: al ser un fine-tune de Qwen3.5-9B con licencia Apache-2.0 y pesos estándar en safetensors, puede servir como inicialización de experimentos adicionales, siempre que se asuma que no incluye los tensores MTP.
- Despliegue de referencia para comparativas internas: su receta cerrada (80 actualizaciones, semilla 42, temperatura 1,0, top-p 1,0) lo hace adecuado como línea base estable en evaluaciones internas frente a otros checkpoints derivados de Qwen3.5.

## Benchmarks y rendimiento

Resultados de la tabla 1 del artículo (Qwen3.5-9B), en porcentaje:

| Modelo | AIME25 | AIME26 | LCB v5 | LCB v6 | IFEval | IFBench | Total |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| DN-MOPD-Qwen3.5-9B-baseline-label | 55,3 | 63,2 | 56,8 | 52,6 | 84,0 | 38,4 | 58,4 |
| DN-MOPD | 58,9 | 67,7 | 56,3 | 51,4 | 84,5 | 38,7 | 59,6 |
| Estudiante inicial (Qwen3.5-9B) | 57,7 | 62,6 | 54,9 | 51,4 | 82,4 | 33,8 | 57,1 |

Condiciones declaradas: semilla de entrenamiento 42; límite de 16.384 tokens en evaluación (8.192 en el apéndice); plantilla de chat no-thinking; temperatura 1,0 y top-p 1,0 con semilla de generación 42. AIME25/AIME26 con avg@64; LiveCodeBench v5/v6 (167/175 problemas disjuntos) con avg@6; IFEval/IFBench con precisión estricta de prompt y avg@16. La columna Total es la media de las seis tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18,8 GB solo para pesos (9,41 B × 2 bytes), a los que hay que sumar la caché KV. Con 32.768 tokens de contexto y respuestas de hasta 16.384 tokens, el consumo real es notablemente superior; se recomienda reservar 24 GB o más. Dato estimado, no publicado por el autor.
- GPU recomendadas: A100 40 GB o H100 para reproducir la configuración de evaluación del artículo (vLLM 0.18.0, `max_model_len=32768`, `max_tokens=16384`). Una única RTX 4090 de 24 GB puede alojar los pesos, pero el contexto completo de 32.768 tokens con generaciones largas queda muy ajustado.
- Cabe en GPU de consumo: los pesos en bfloat16 entran en tarjetas de 24 GB, aunque con margen escaso para caché KV. No hay versiones cuantizadas oficiales; cualquier reducción a 4 u 8 bits exigiría una conversión propia y no está validada por el autor.
- Opciones de despliegue: vLLM (versión usada en el artículo, 0.18.0) y `transformers>=5` con `AutoModelForImageTextToText` (el entorno de entrenamiento usó 5.12.1). Existe un endpoint de inferencia de terceros en FriendliAI. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo especifica parámetros de muestreo (temperatura 1,0, top-p 1,0) y límites de tokens.
- Advertencia de despliegue: la decodificación especulativa basada en MTP no está disponible en este checkpoint porque faltan los 15 tensores `mtp.*`; la decodificación ordinaria no se ve afectada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Total (tabla 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-9B-baseline-label | 9,41 B | 32.768 tokens en el ejemplo de vLLM | 58,4 | Apache-2.0 | Pesos safetensors en Hugging Face; endpoint en FriendliAI |
| DN-MOPD-Qwen3.5-9B | No disponible en la información proporcionada (deriva de Qwen3.5-9B) | No disponible | 59,6 | Apache-2.0 | Pesos en Hugging Face |
| Qwen3.5-9B (estudiante inicial) | 9B según el nombre del modelo base | No disponible | 57,1 | Apache-2.0 | Modelo base en Hugging Face |
| Profesores DN-MOPD (math, code, IF) | Mismo tamano que el estudiante según la model card | No disponible | No disponible | Apache-2.0 | Pesos en Hugging Face |

El artículo indica que, con enrutado por etiqueta, MOPD no supera al mejor estudiante de profesor único en ninguno de los tres tamaños de Qwen3.5 evaluados (9B, 4B y 2B). En el primer lote de entrenamiento, los log-ratios de instruction following son entre 2,3 y 4,4 veces más dispersos que la señal agrupada, y los de matemáticas aproximadamente la mitad de dispersos.

## Limitaciones y advertencias

- Es la línea base, no el método propuesto: en el artículo no supera a la variante DN-MOPD ni al mejor estudiante de profesor único. No debe presentarse como un modelo de alto rendimiento.
- Contexto no declarado oficialmente: el valor de 32.768 tokens procede del ejemplo de vLLM de la model card, no de una especificación formal de la ficha. El entrenamiento usó prompts de hasta 2.048 tokens y respuestas de hasta 8.192.
- Modo thinking desactivado: es obligatorio pasar `enable_thinking=False`. Omitir este argumento cambia el comportamiento respecto a la configuración evaluada y las cifras publicadas dejan de ser aplicables.
- Idioma: solo inglés declarado. El modelo base puede tener capacidades multilingües, pero no se declaran ni se evalúan aquí.
- Multimodalidad no validada: el encoder de visión se hereda del modelo base, pero el entrenamiento y la evaluación fueron solo de texto. El uso con imágenes no está respaldado por resultados.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación; como modelo de razonamiento matemático y código, puede producir razonamientos plausibles pero incorrectos, especialmente fuera de los dominios de entrenamiento.
- Sesgos: no se publica ningún análisis de sesgos, toxicidad o alineación en la información disponible.
- Licencia: Apache-2.0, la misma que el modelo base, lo que permite uso comercial; no obstante, el autor no ofrece garantías y el modelo procede de un trabajo de investigación con receta de entrenamiento muy corta (80 actualizaciones).
- Limitación técnica para producción: la ausencia de los tensores MTP impide usar decodificación especulativa basada en MTP, lo que reduce las optimizaciones de latencia disponibles.
- Volumen de adopción mínimo: 7 descargas y 0 me gusta en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-baseline-label
- Modelo propuesto DN-MOPD-Qwen3.5-9B: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B
- Profesor de matemáticas: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-teacher-math
- Profesor de código: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-teacher-code
- Profesor de instruction following: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-teacher-if
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Artículo: https://arxiv.org/abs/2609.35347
- Página del proyecto: https://lixin.ai/DN-MOPD/
- Repositorio de código: https://github.com/LiXin97/DN-MOPD
- Recetas de entrenamiento: https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentación de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/XINLI1997/DN-MOPD-Qwen3.5-9B
- Documentación de Qwen3.5 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
