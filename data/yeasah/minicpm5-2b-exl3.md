# yeasah/MiniCPM5-2B-exl3

## Resumen

MiniCPM5-2B-exl3 es una colección de cuantizaciones EXL3 del modelo base openbmb/MiniCPM5-2B, publicada por el usuario yeasah. No se trata de un modelo entrenado desde cero, sino de una conversión a formatos de 3, 3.5, 4, 5 y 6 bits por peso (BPW) pensada para ejecutarse con ExLlamaV3 o con vLLM mediante el plugin vllm-exl3-plugin. El modelo base pertenece a la familia MiniCPM5 de OpenBMB y esta etiquetado como orientado a despliegue en dispositivo (on-device, edge-ai), con capacidades declaradas de contexto largo y tool calling.

La relevancia de esta ficha radica en que ofrece una alternativa de inferencia muy comprimida (desde 0,98 GiB en 3.00 BPW hasta 1,73 GiB en 6.00 BPW) frente a los 4,69 GiB del checkpoint sin cuantizar, manteniendo una degradación medida y documentada en perplejidad y en retención de hechos. El autor publica métricas de KLD excedido y de retención de conocimiento factual para cada tasa de bits, lo que permite elegir el compromiso tamaño/calidad con datos concretos.

El repositorio tiene un tamaño total de 8,0 GB porque incluye todas las revisiones de cuantización, pero cada revisión individual ocupa entre 0,98 y 1,73 GiB. La licencia es Apache 2.0, heredada del modelo base. Los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5; el repositorio hereda la etiqueta "llama" en los tags, sin detalle arquitectonico adicional) |
| Parametros totales | 2B (según el nombre del modelo base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el tag "long-context" sugiere contexto extendido, sin cifra) |
| Tipos de cuantizacion | EXL3 en 3.00, 3.50, 4.00, 5.00 y 6.00 BPW (revisiones separadas del repositorio) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (checkpoint para ExLlamaV3 y vLLM con vllm-exl3-plugin); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer de aproximadamente 2.000 millones de parametros desarrollado por OpenBMB. La model card del repositorio de cuantizacion no detalla la arquitectura interna (número de capas, dimensiones, tipo de atención ni si incorpora innovaciones como atención lineal o capas MTP). Los tags incluyen "llama" y "minicpm5", y se menciona la existencia de "MTP draft layers" en la definicion de BPW, lo que sugiere capas de prediccion multi-token para decodificacion especulativa, aunque no se aportan mas detalles.

Los datos de entrenamiento del modelo base, segun los datasets referenciados, incluyen Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Esto indica un pipeline que abarca preentrenamiento con datos web filtrados, matematicas y codigo, seguido de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL), con un componente especifico para agentes. No se especifica el numero de tokens de entrenamiento ni la composicion porcentual del dataset.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la cuantizacion: calibracion sobre texto que los modelos leen y escriben durante el trabajo (documentos, salidas de herramientas, codigo, diffs y respuestas propias) en lugar de solo texto web; asignacion de bits por tensor segun la sensibilidad medida en las respuestas del propio modelo; y redondeo mediante LDLQ bilateral con factor de Fisher del lado de la salida, tras YAQA. La cuantizacion incluye tambien los embeddings de tokens, lo que requiere ExLlamaV3 1.6.4 o superior.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento y respuesta a preguntas de conocimiento cerrado (el autor evalua 871 preguntas factuales).
- Capacidades de codigo y matematicas, inferidas de los datasets UltraData-Code y UltraData-Math del modelo base.
- Tool calling / function calling, segun el tag "tool-calling" y el dataset UltraData-SFT-Agent-2609.
- Soporte de agentes y flujos multi-paso, segun el dataset UltraData-SFT-Agent-2609.
- Contexto largo, segun el tag "long-context" (sin cifra concreta disponible).
- Orientado a despliegue en dispositivo y edge (tags "on-device", "edge-ai").
- No se declaran capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Despliegue en dispositivos con VRAM limitada: la revision de 3.00 BPW ocupa 0,98 GiB, lo que permite ejecutar el modelo en GPUs de consumo con poca memoria o en entornos integrados, a costa de una perdida de perplejidad del +6,26%.
- Asistentes conversacionales en local: las revisiones de 5.00 y 6.00 BPW (1,50 y 1,73 GiB) mantienen el 93,9% y el 97,3% de los hechos del modelo original, adecuadas para chatbots que requieren fidelidad factual sin conexion.
- Agentes con tool calling: el modelo base esta entrenado con UltraData-SFT-Agent-2609 y etiquetado para tool calling, por lo que puede integrarse en pipelines de agentes que invocan APIs y procesan salidas de herramientas; la calibracion de la cuantizacion incluye precisamente salidas de herramientas y conversaciones.
- Procesamiento de documentos y codigo en produccion: la calibracion sobre documentos, codigo y diffs hace que estas cuantizaciones sean adecuadas para tareas de resumen, revision de cambios y generacion de codigo en entornos con recursos ajustados.
- Inferencia de alto rendimiento con vLLM: mediante vllm-exl3-plugin, las revisiones EXL3 pueden servirse en un servidor vLLM, lo que permite atender peticiones concurrentes con un consumo de VRAM de 0,98 a 1,73 GiB por instancia.
- Evaluacion y prototipado rapido: el reducido tamano en disco (menos de 2 GiB por revision) facilita descargar y comparar varias tasas de bits en la misma maquina para medir el compromiso calidad/tamano antes de fijar una configuracion.
- Entornos multilingues ingles-chino: el soporte declarado de en y zh permite tareas de traduccion o atencion al cliente en ambos idiomas, aunque no se documenta calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card solo aporta métricas de cuantizacion:

| BPW | Tamano en disco | VRAM (vLLM) | Excess KLD | Delta perplejidad | Hechos retenidos | Errores con confianza |
|---|---|---|---|---|---|---|
| 3.00 | 0,98 GiB | 0,98 GiB | 0,0603 | +6,26% | 76,3% | 4,59% |
| 3.50 | 1,09 GiB | 1,09 GiB | 0,0304 | +3,23% | 81,1% | 3,90% |
| 4.00 | 1,24 GiB | 1,24 GiB | 0,0148 | +1,59% | 89,0% | 1,38% |
| 5.00 | 1,50 GiB | 1,50 GiB | 0,0039 | +0,34% | 93,9% | 0,11% |
| 6.00 | 1,73 GiB | 1,73 GiB | 0,0011 | +0,09% | 97,3% | 0,00% |
| base | 4,69 GiB | no disponible | 0 (referencia) | 0% | 100% | no disponible |

Los "hechos retenidos" corresponden a 871 preguntas de conocimiento cerrado que el modelo sin cuantizar responde correctamente, puntuadas token a token. Los "errores con confianza" son preguntas en las que la cuantizacion asigna al menos un 70% a un token incorrecto. El autor advierte que diferencias de uno o dos puntos entre niveles consecutivos son poco significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,98 GiB (3.00 BPW) y 1,73 GiB (6.00 BPW) segun la columna VRAM de vLLM; el checkpoint sin cuantizar ocupa 4,69 GiB. La VRAM real consumida puede ser inferior al tamano total del checkpoint segun la configuracion.
- GPU recomendadas: no se especifican modelos concretos. Por el rango de VRAM, cualquier GPU con al menos 2 GiB libres puede alojar las revisiones mas pequenas; para 6.00 BPW se recomienda disponer de 2 GiB o mas exclusivos para pesos, mas el espacio de KV cache.
- Cabe en GPU de consumo: si, dado que la revision de 3.00 BPW ocupa menos de 1 GiB y la de 6.00 BPW menos de 2 GiB; el modelo esta etiquetado como on-device y edge-ai.
- Opciones de despliegue: ExLlamaV3 (version 1.6.4 o superior, necesaria por la cuantizacion de embeddings) y vLLM mediante vllm-exl3-plugin. No se menciona soporte de llama.cpp u Ollama para estas cuantizaciones EXL3; para GGUF existe una publicacion separada de bartowski.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-exl3 (este) | 2B | no disponible | EXL3 3-6 BPW | Apache 2.0 | Cuantizacion con metricas de KLD y retencion de hechos por nivel |
| openbmb/MiniCPM5-2B (base) | 2B | no disponible | safetensors | Apache 2.0 | Referencia sin cuantizar; 4,69 GiB |
| bartowski/MiniCPM5-2B-GGUF | 2B | no disponible | GGUF | Apache 2.0 | Alternativa GGUF para llama.cpp; el autor compara contra Q6_K en sus graficas |

No se dispone de datos de rendimiento (benchmarks de tarea) para comparar cualitativamente con modelos de la misma categoria. La comparacion disponible se limita al formato, tamano y licencia.

## Limitaciones y advertencias

- La cuantizacion degrada el conocimiento factual: en 3.00 BPW se pierde el 23,7% de los hechos que el modelo original acierta, y el 4,59% de las preguntas producen errores con alta confianza (el modelo afirma algo falso en lugar de dudar).
- Los errores con confianza son especialmente peligrosos en produccion: incluso en 4.00 BPW se registra un 1,38% de respuestas falsas con al menos 70% de probabilidad asignada al token incorrecto.
- El autor advierte que la perdida no es uniforme: la cuantizacion conserva lo que el modelo original sabia con seguridad y pierde mas lo que apenas conocia.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- La longitud de contexto no se especifica, por lo que no puede validarse el uso en ventanas largas pese al tag "long-context".
- Requiere ExLlamaV3 1.6.4 o superior por la cuantizacion de los embeddings de tokens; versiones anteriores no son compatibles.
- El soporte en vLLM depende de un plugin de terceros (vllm-exl3-plugin), lo que anade una dependencia externa al stack de produccion.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones y posibles avisos del modelo base; conviene revisar la model card de openbmb/MiniCPM5-2B.
- Las metricas de calidad publicadas son del autor del repositorio y se basan en una unica conversion por nivel; el propio autor indica que conversiones con los mismos ajustes varian unos pocos puntos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yeasah/MiniCPM5-2B-exl3
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Commit del modelo base usado: https://huggingface.co/openbmb/MiniCPM5-2B/tree/42433e90dad95123ab87729fd7011e7110629556
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Plugin vLLM para EXL3: https://github.com/yeasah/vllm-exl3-plugin
- Cuantizaciones GGUF de referencia: https://huggingface.co/bartowski/MiniCPM5-2B-GGUF
- Detalle tecnico de las cuantizaciones: https://huggingface.co/yeasah/MiniCPM5-2B-exl3/blob/main/TECHNICAL.md
