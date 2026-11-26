# Z3NN001/BasicFinQwen-v0.3-Multilingual

## Resumen

BasicFinQwen v0.3 Multilingual es un ajuste fino (LoRA fusionado en bf16) del modelo base Qwen3.5-4B, desarrollado por Z3NN-AI. Se trata de un asistente especializado en conceptos basicos de finanzas y analisis fundamental: ratios de valoracion, margenes, flujo de caja, balance, coste de capital, bonos, opciones, cartera y macroeconomia basica. El modelo resuelve el problema de la inconsistencia en respuestas financieras divulgativas, ofreciendo definiciones verificadas y reproducibles para 207 conceptos concretos.

La propuesta tecnica es poco habitual: para cada uno de los 207 conceptos, el modelo ha aprendido una "ficha" fija y verificada contra fuentes publicas en cada uno de los cinco idiomas soportados (espanol, ingles, frances, aleman y portugues). La ficha incluye definicion, formula de calculo, interpretacion, ejemplo y advertencia. El objetivo es que el modelo devuelva esa misma respuesta de forma fiable, independientemente de como se formule la pregunta.

Con 4.539.265.536 parametros (4B) y pesos en bfloat16, es un modelo ligero disenado para despliegue en hardware modesto. Su relevancia actual radica en el enfoque de "conocimiento curado y anclado" frente al conocimiento difuso de los LLM generalistas, con metricas de evaluacion explicitas sobre reproduccion exacta de fichas y rechazo de conceptos inventados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B), ajuste LoRA fusionado en bf16 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la configuracion de despliegue de vLLM usa `--max-model-len 4096`; el entrenamiento uso max length 8192) |
| Tipos de cuantizacion | bfloat16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | es, en, fr, de, pt (portugues europeo objetivo, con mezcla de formas brasileiras en chat general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de 4B parametros, y se ajusta mediante LoRA SFT con Unsloth. El adaptador LoRA tiene rango 16, alpha 32, dropout 0, aplicado a todas las proyecciones de atencion y MLP, con 21,2 M parametros entrenables (0,47 % del total). Se entrenaron 2 epocas, 3374 pasos, batch efectivo 16, longitud maxima 8192 tokens, learning rate 2e-4 con schedule coseno y 20 pasos de warmup, usando AdamW de 8 bits en bf16. El entrenamiento se realizo en 1x NVIDIA A100 PCIe de 40 GB en aproximadamente 3 h 20 min. El adaptador se fusiono en el modelo base en bf16.

Los datos de entrenamiento son un dataset sintetico privado de unas 27.000 conversaciones (aproximadamente 12 M tokens). Incluye fichas de conceptos financieros en cinco idiomas verificadas contra fuentes publicas de referencia, multiples preguntas parafraseadas por ficha, dialogos con cambio de idioma, mensajes con varias preguntas, rechazos para conceptos inventados y "replay" de chat general generado por el propio modelo base para limitar el olvido catastrofico. La perdida se calcula unicamente sobre las respuestas del asistente. La validacion descendio de 0,113 a 0,085 de forma sostenida.

## Capacidades

- Generacion de texto conversacional especializada en finanzas basicas y analisis fundamental.
- Reproduccion fiable de fichas verificadas para 207 conceptos financieros en cinco idiomas.
- Respuesta en el idioma de la pregunta y cambio de idioma bajo peticion ("responde en aleman", cambio a mitad de conversacion).
- Manejo de varias preguntas en un mismo mensaje.
- Rechazo explicito de conceptos inventados que parecen ratios reales (89 de 90 casos).
- Respuesta desde el conocimiento del modelo base para conceptos financieros reales sin ficha (por ejemplo, ratio de Treynor, Black-Scholes, indice Herfindahl-Hirschman).
- Capacidad multimodal heredada del base (pipeline `image-text-to-text`, carga via `AutoModelForImageTextToText`), aunque la model card no documenta evaluacion de vision.
- Modo "thinking" disponible pero desaconsejado para este ajuste (`enable_thinking=False`).
- No soporta de forma fiable instrucciones de formato (limite de palabras, numero de vinetas) frente a la ficha.

## Casos de uso

- Consulta de definiciones financieras estables: un usuario pregunta "que es el KGV y como se interpreta" en aleman y recibe la ficha verificada correspondiente, con definicion, formula e interpretacion, sin variabilidad entre consultas.
- Glosario interactivo multilingue para equipos internacionales: un equipo con miembros hispanohablantes, franceses y portugueses consulta los mismos conceptos y obtiene respuestas coherentes en cada idioma, con capacidad de pedir la respuesta en otro idioma.
- Formacion interna en finanzas basicas: el modelo sirve como material de consulta reproducible para onboarding de analistas junior, ya que devuelve siempre la misma definicion verificada para cada concepto.
- Atencion al cliente en productos financieros divulgativos: responde a preguntas frecuentes sobre ratios y conceptos contables con respuestas ancladas, reduciendo el riesgo de respuestas inventadas en ese dominio acotado.
- Filtro de conceptos inventados en soporte: ante terminos que parecen ratios pero no existen, el modelo declina responder, lo que ayuda a detectar consultas erroneas o malintencionadas.
- Despliegue ligero en produccion: con unos 10 GB de VRAM en bf16, puede servirse con vLLM en una GPU de gama media o en la nube a bajo coste, con temperatura 0 para respuestas deterministas.
- Base para evaluacion de tecnicas de anclaje de conocimiento: util como referencia para investigadores que estudian como fijar respuestas verificadas en LLM pequenos y medir la fidelidad de reproduccion.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, con decodificacion greedy y preguntas con formulaciones no vistas en entrenamiento:

| Test | es | en | fr | de | pt |
|---|---|---|---|---|---|
| Ficha reproducida exactamente, nuevas plantillas de pregunta (de 207) | 192 | 194 | 190 | 198 | 178 |
| Ficha reproducida exactamente, nuevas formas de pregunta (de 207) | 207 | 206 | 206 | 207 | 207 |

Otros resultados reportados:

| Test | Resultado |
|---|---|
| Pregunta en idioma X + "responde en Y" (similitud >= 0,90 con la ficha objetivo) | 407 de 414 |
| Conceptos inventados: el modelo dice que no los conoce | 89 de 90 |
| Conceptos reales sin ficha: no rechaza | 30 de 30 |
| Examen de finanzas de 145 preguntas del autor (nunca entrenado): respuesta coincide con la ficha | 100 (v0.2: 12) |
| Perdida de validacion | 0,113 -> 0,088 -> 0,087 -> 0,085 -> 0,085 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB en bf16, segun la model card.
- GPU recomendadas: NVIDIA A100 (usada para entrenamiento) para despliegue comodo; cualquier GPU con al menos 10-12 GB de VRAM para inferencia en bf16.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). No se documentan cuantizaciones alternativas que reduzcan mas el requisito.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), vLLM (`vllm serve Z3NN001/BasicFinQwen-v0.3-Multilingual --max-model-len 4096`). No se documenta soporte explicito de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Parametros de generacion recomendados: temperatura 0 (greedy), repetition penalty 1.0, thinking desactivado, `max_new_tokens` 900.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BasicFinQwen v0.3 Multilingual | 4,54 B | no disponible | Finanzas basicas, 207 fichas verificadas, 5 idiomas | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4 B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face (unsloth) |
| BasicFinQwen-Spanish-MLX-8bit (v0.1) | no disponible | no disponible | Finanzas basicas, solo espanol | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros modelos financieros especializados en la informacion proporcionada.

## Limitaciones y advertencias

- Las instrucciones de formato pierden frente a la ficha: peticiones como "en maximo 20 palabras" o "en 3 vinetas" suelen devolver la ficha completa.
- Los conceptos sin ficha se responden desde el conocimiento del modelo base y pueden contener errores (ejemplo citado: opciones europeas frente a americanas).
- Puede inventar a que empresa pertenece un ticker desconocido en lugar de admitir que no lo sabe.
- El portugues objetivo es europeo, pero en chat general se mezclan formas brasileiras.
- El muestreo y las penalizaciones de repeticion hacen que el modelo parafrasee las fichas verificadas e introduzca errores; se recomienda temperatura 0 y repetition penalty 1.0.
- No es asesoramiento financiero: el modelo esta disenado para declinar recomendaciones de acciones, trading y criptomonedas.
- El dataset de entrenamiento es sintetico y privado, lo que limita la auditabilidad externa.
- Riesgo de sesgo heredado del modelo base Qwen3.5-4B, no documentado de forma especifica en la model card.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni limitaciones adicionales de responsabilidad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Z3NN001/BasicFinQwen-v0.3-Multilingual
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Version anterior (v0.1, solo espanol): https://huggingface.co/Z3NN001/BasicFinQwen-Spanish-MLX-8bit
