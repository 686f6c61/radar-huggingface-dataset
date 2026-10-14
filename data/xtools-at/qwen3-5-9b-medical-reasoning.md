# xtools-at/Qwen3.5-9B-Medical-Reasoning

## Resumen

Qwen3.5-9B Medical Reasoning es un adaptador LoRA de tipo PEFT publicado por el usuario xtools-at, disenado para respuesta de preguntas medicas y razonamiento clinico paso a paso. No es un modelo fundacional nuevo: se construye sobre Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un modelo de 9.000 millones de parametros de la familia Qwen3.5 que fue destilado a partir de DeepSeek-V4-Pro con enfasis en matematicas y resolucion estructurada de problemas. El adaptador anade ejemplos de razonamiento medico sobre esa base ya orientada al razonamiento.

El entrenamiento se realizo con ajuste supervisado (SFT) sobre 10.000 ejemplos seleccionados aleatoriamente del dataset FreedomIntelligence/medical-o1-reasoning-SFT, durante 2 epocas, con una longitud maxima de secuencia de 4.096 tokens y precision de 16 bits, sobre una unica GPU NVIDIA L4 de 24 GB. Una caracteristica destacable es que el 100% de los ejemplos de entrenamiento incluyen trazas de razonamiento (thinking traces), de modo que el modelo aprende a producir explicaciones estructuradas junto a la respuesta.

Su relevancia es acotada y experimental: el propio autor advierte que no es un sistema validado clinicamente y que sus salidas pueden contener diagnosticos incorrectos o detalles fabricados. El repositorio tiene un tamano de 0,3 GB (coherente con un adaptador, no con pesos completos), esta declarado bajo licencia Apache-2.0 y solo soporta ingles. A fecha de la informacion disponible no registra descargas ni valoraciones, por lo que no existe validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5, adaptado mediante LoRA (PEFT) sobre el modelo base |
| Parametros totales | Aproximadamente 9.000 millones en el modelo base Qwen3.5-9B; numero exacto de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no se describe como modelo MoE en la informacion disponible) |
| Longitud de contexto | No disponible para inferencia; la longitud maxima de secuencia durante el entrenamiento fue de 4.096 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye sin cuantizar; la cuantizacion aplicable depende del modelo base sobre el que se cargue) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (declarada para esta release; la licencia del modelo base debe verificarse por separado) |
| Formato de pesos | Adaptador LoRA en safetensors, compatible con transformers y PEFT |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5 en su variante de 9.000 millones de parametros, un transformer decoder-only. Sobre esa base se aplico un ajuste supervisado con LoRA, con rango r=32, alpha=64, dropout de 0,03 y modulos objetivo configurados como "todos los modulos" segun la ejecucion de entrenamiento. El optimizador fue AdamW de 8 bits, con tasa de aprendizaje de 2e-4, planificador lineal, weight decay de 0,005, batch por dispositivo de 4 y 8 pasos de acumulacion de gradiente, lo que da un batch efectivo de 32 asumiendo una unica GPU.

Los datos proceden de un subconjunto limpio y muestreado aleatoriamente de FreedomIntelligence/medical-o1-reasoning-SFT, con 10.000 ejemplos, 2 epocas y un 3% reservado para evaluacion. El preprocesamiento incorporo trazas de razonamiento en el 100% de los ejemplos, de forma que no hay mezcla de muestras con y sin traza. La innovacion tecnica relevante no esta en la arquitectura, sino en la cadena de destilacion: Qwen3.5-9B, destilado con datos de razonamiento de DeepSeek-V4-Pro, y despues especializado en dominio medico mediante LoRA. El autor senala que la contribucion relativa del entrenamiento upstream y del ajuste medico no se ha medido de forma independiente.

## Capacidades

- Respuesta a preguntas de conocimiento medico en ingles.
- Razonamiento multi-paso sobre sintomas, hallazgos de laboratorio y vineta clinica.
- Exploracion de diagnosticos diferenciales y posibles pruebas de seguimiento.
- Generacion de explicaciones estructuradas con trazas de razonamiento, porque el 100% de los ejemplos de entrenamiento las incluian.
- Conversacion multi-turno (etiquetada como conversational en los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion en razonamiento medico: evaluar como un modelo ya orientado al razonamiento se adapta a datos clinicos mediante LoRA, comparando sus salidas con las del modelo base sin el adaptador.
- Analisis de vineta clinica en entorno de laboratorio: introducir un caso con sintomas y resultados de analitica y estudiar la cadena de razonamiento generada, con supervision humana obligatoria.
- Exploracion de diagnosticos diferenciales: usar el modelo como generador de hipotesis para que un profesional sanitario las revise, nunca como fuente de decision.
- Prototipado de flujos de NLP medico: construir pipelines de extraccion y respuesta sobre textos clinicos en entornos controlados y no clinicos.
- Generacion de datos sinteticos de razonamiento medico: producir borradores de trazas razonadas para su posterior filtrado y validacion por expertos.
- Evaluacion de fidelidad de explicaciones: estudiar hasta que punto las trazas generadas se corresponden con la respuesta final, dado que el autor advierte que la presencia de trazas no garantiza fidelidad.
- Apoyo educativo supervisado: material de practica para estudiantes de medicina con revision docente, asumiendo el riesgo de error factual.
- Investigacion sobre destilacion de razonamiento: analizar la herencia de capacidades de DeepSeek-V4-Pro a traves de Qwen3.5-9B y del posterior ajuste de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB, pero requiere cargar el modelo base de aproximadamente 9.000 millones de parametros para funcionar.
- VRAM estimada para el modelo base en FP16: en torno a 18 GB solo para pesos, mas overhead de activaciones y cache KV; cifra orientativa, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB; en 4 bits, aproximadamente 5-6 GB. Estimaciones de ingenieria, no datos oficiales.
- Entrenamiento confirmado: una unica NVIDIA L4 de 24 GB, precision de 16 bits, batch por dispositivo de 4 con acumulacion de gradiente de 8.
- GPU recomendadas para inferencia (estimacion): A100 40/80 GB, H100, L40S o L4 para FP16; RTX 4090, RTX 3090 o RTX 4080 viables en cuantizaciones de 4 u 8 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, fusion de pesos y servido con vLLM o TGI; llama.cpp y Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-9B-Medical-Reasoning | Adaptador LoRA sobre base de ~9B | No disponible (entrenado a 4.096 tokens) | Razonamiento medico en ingles | Apache-2.0 | Repositorio HuggingFace, 0 descargas y 0 likes |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9B | No disponible | Razonamiento general, matematicas y STEM destilado de DeepSeek-V4-Pro | No disponible en la informacion proporcionada | Modelo base publico en HuggingFace |
| Qwen/Qwen3.5-9B | ~9B | No disponible | Modelo generalista multiuso de la familia Qwen3.5 | No disponible en la informacion proporcionada | Modelo upstream publico en HuggingFace |

No se dispone de resultados de benchmarks comparativos entre estas variantes, ni de otros adaptadores medicos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin validacion clinica: el autor indica explicitamente que no debe usarse para diagnostico a pacientes, recomendaciones de tratamiento, triaje de urgencias ni decision clinica autonoma.
- Riesgo elevado de alucinacion: la propia model card advierte de diagnosticos incorrectos, detalles fabricados y explicaciones enganosas.
- Las trazas de razonamiento del entrenamiento no garantizan que el modelo razone correctamente ni que sus explicaciones reflejen procesos internos reales.
- No hay evaluacion independiente de calidad de razonamiento ni de precision medica; la contribucion relativa del modelo base y del ajuste LoRA no se ha medido.
- Cobertura idiomatica limitada al ingles, lo que excluye su uso directo en castellano sin evaluacion adicional.
- Capacidad de tool calling y de agentes no documentada, lo que limita su integracion en flujos automatizados complejos.
- La licencia Apache-2.0 se declara para esta release, pero el uso comercial depende tambien de la licencia del modelo base y del cumplimiento de las condiciones de los datasets de origen.
- Al ser un adaptador, no puede ejecutarse de forma autonoma: requiere descargar y cargar el modelo base, con el coste de almacenamiento y VRAM asociado.
- Repositorio sin descargas ni likes registrados: ausencia total de validacion comunitaria o de casos de uso reportados.
- El contexto de inferencia no esta documentado; el entrenamiento se limito a 4.096 tokens, por lo que no hay garantia de comportamiento estable con entradas mas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-9B-Medical-Reasoning
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Modelo upstream de la familia: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset derivado en formato chat: https://huggingface.co/datasets/xtools-at/medical-o1-reasoning-SFT-chat
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
