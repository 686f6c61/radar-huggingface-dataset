# turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-GGUF es una familia de cuantizaciones GGUF del modelo NVIDIA Nemotron-3.5-Bolt-E4B-BF16, publicada por TurinTech bajo el marco de compresión propietario Artemis. El modelo base es un transformer multimodal desarrollado por NVIDIA que combina generación de texto, soporte de tool calling y entrada de imagen (y audio experimental), con un total de 7.518.069.290 parámetros reales en safetensors. TurinTech distribuye nueve variantes GGUF con tamaños que van de 2,67 GB a 8,14 GB, pensadas para ejecución local con llama.cpp, Ollama y LM Studio.

La relevancia de esta ficha radica en que TurinTech publica métricas de divergencia KL frente al original BF16 (15,05 GB) para cada tamaño, lo que permite comparar la pérdida de calidad de forma cuantitativa. En la variante Q3_K_XL (4,22 GB), TurinTech reporta KL de 0,0569 en wiki, 0,0411 en chat y 0,0380 en código, frente a 0,0751, 0,0623 y 0,0506 de la cuantización equivalente de Unsloth (UD-Q3_K_XL), lo que sitúa a Artemis como una alternativa con menor degradación a igual tamaño de descarga.

El paquete está orientado a despliegue en hardware de consumo y a entornos con restricciones de memoria: la variante recomendada ocupa 3,76 GiB de VRAM en inferencia. La licencia es OpenMDW-1.1 (no es una licencia permisiva tipo Apache-2.0 ni MIT) y debe revisarse antes de uso comercial. El repositorio acumula 9017 descargas y 13 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen y audio experimental); detalles internos del modelo base no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens en la configuración de referencia de llama.cpp (`-c 8192`); máximo nativo no disponible |
| Tipos de cuantizacion | GGUF en nueve tamaños (2,67 GB a 8,14 GB), entre ellos IQ2_XXS, Q3_K_XL, Q4_K_XL y Q6_K_XL; calibración con imatrix |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal `mmproj-Q8_0.gguf` separado; drafter especulativo `dflash-Nemotron-3.5-Bolt-E4B-Q8_0.gguf` en `MTP/` |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron-3.5-Bolt-E4B en precisión BF16, del que esta publicación es una cuantización (relación declarada `quantized` respecto a `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`). La información disponible no detalla la arquitectura interna del base (número de capas, dimensiones ocultas, mecanismo de atención ni composición del dataset de entrenamiento). Los tags del repositorio indican capacidades de visión y conversación, y la model card menciona un proyector multimodal para imagen y audio, lo que confirma una arquitectura con encoder multimodal acoplado.

La innovación técnica de esta publicación es el pipeline Artemis de TurinTech, que produce cuantizaciones calibradas con imatrix y evalúa la divergencia KL respecto al BF16 original en tres dominios (wiki, chat y código). La model card indica que los textos de evaluación también se usaron para seleccionar los ficheros en todos los tamaños excepto Q3_K_XL y Q4_K_XL, lo que conviene tener en cuenta al interpretar las métricas de esos dos tamaños. Adicionalmente, se publica un drafter de decodificación especulativa (`--spec-type draft-dflash`) que acelera la generación, con la advertencia de que la salida greedy puede no ser idéntica palabra por palabra. No se documentan detalles de RLHF, DPO ni número de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activable o desactivable mediante `--reasoning off` o `"think": false`.
- Tool calling / function calling: las llamadas se devuelven en `choices[0].message.tool_calls` a través del endpoint compatible con OpenAI `/v1/chat/completions`.
- Entrada de imágenes mediante el proyector `mmproj-Q8_0.gguf`.
- Entrada de audio en estado experimental en llama.cpp (requiere el proyector multimodal).
- Decodificación especulativa con drafter dedicado (`dflash`), que incrementa el throughput a costa de variaciones menores en la salida greedy.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el formato de plantilla Jinja (`--jinja`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con la variante Q3_K_XL (3,76 GiB de VRAM) el modelo cabe en GPUs de consumo de 8 GB o más y permite chat multi-turno con 8.192 tokens de contexto sin depender de la nube.
- Automatización de soporte con tool calling: el endpoint `/v1/chat/completions` acepta una lista `tools` y devuelve `tool_calls`, lo que permite conectar el modelo a APIs internas de tickets, consultas de pedidos o CRM en un flujo de agente.
- Procesamiento de documentos con imagen: el proyector `mmproj-Q8_0.gguf` habilita entrada visual, útil para extraer información de capturas, formularios escaneados o gráficos en un pipeline local.
- Generación de código asistida en IDE: la variante Q3_K_XL reporta KL de 0,0380 en el dominio de código, la menor de las tres métricas publicadas, lo que la hace adecuada para autocompletado y explicación de código en LM Studio o llama.cpp.
- Despliegue en portátiles y equipos sin GPU dedicada: las variantes de 2,67 GB permiten inferencia en CPU con llama.cpp u Ollama, útil para prototipado y demos offline.
- Aceleración de servicios de inferencia: el drafter `dflash` en `MTP/` permite activar decodificación especulativa en llama-server para reducir la latencia por token en cargas interactivas.
- Evaluación comparativa de cuantizaciones: los valores de KL publicados por dominio permiten seleccionar el tamaño en función del presupuesto de memoria y de la tolerancia a la degradación en chat, wiki o código.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Publica métricas de divergencia KL frente al BF16 original, que miden fidelidad de la cuantización, no calidad absoluta del modelo.

| Fichero | Tamano | KL wiki (menor es mejor) | KL chat (menor es mejor) | KL codigo (menor es mejor) |
|---|---|---|---|---|
| TurinTech Q3_K_XL | 4,22 GB | 0,0569 | 0,0411 | 0,0380 |
| Unsloth UD-Q3_K_XL | 4,22 GB | 0,0751 | 0,0623 | 0,0506 |
| BF16 original | 15,05 GB | referencia | referencia | referencia |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,76 GiB para la variante Q3_K_XL (4,22 GB de descarga), según la tabla de la model card.
- Rango de tamaños de fichero: de 2,67 GB (variantes pequeñas tipo IQ2_XXS) a 8,14 GB (variantes grandes tipo Q6_K_XL), lo que permite ajustar el consumo de memoria al hardware disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las variantes de 2,67 a 4,22 GB caben en GPUs de consumo de 8 GB o más; las variantes de 8,14 GB requieren aproximadamente 8-10 GB de VRAM para pesos más overhead de contexto.
- Cabe en GPU de consumo: sí, al menos las variantes pequeñas y medias; el autor no publica una lista de GPUs validadas.
- Opciones de despliegue: llama.cpp (llama-server, requiere build b11960 o superior), Ollama (`turintech/nemotron-3.5-bolt-e4b-artemis`, solo texto, tag `latest` = Q3_K_XL), LM Studio (`turintech/nemotron-3.5-bolt-e4b-artemis`, contexto inicial de 8.192 tokens y thinking desactivado).
- Latencia y throughput: no disponibles de forma numérica. El autor indica que el drafter `dflash` acelera la generación y que el modo thinking añade aproximadamente 1.000 tokens extra por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Artemis (este) | 7.518.069.290 | 8.192 en config. de referencia | GGUF (9 tamanos) | OpenMDW-1.1 | KL chat 0,0411 en Q3_K_XL; vision y audio experimental |
| Unsloth UD-Q3_K_XL (mismo base) | 7.518.069.290 | no disponible | GGUF | OpenMDW-1.1 (heredada) | KL chat 0,0623 en Q3_K_XL; peor fidelidad que Artemis a igual tamano |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 (base) | 7.518.069.290 | no disponible | BF16 safetensors | OpenMDW-1.1 | Referencia de calidad; 15,05 GB, no apto para GPU de consumo |

No se dispone de datos para comparar con modelos de otros desarrolladores de tamaño y categoría similares en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una cuantización del base NVIDIA, hereda los sesgos de sus datos de entrenamiento, no descritos en la model card.
- Riesgo de alucinación: no cuantificado por el autor; el modo thinking añade aproximadamente 1.000 tokens por respuesta, lo que incrementa coste y latencia.
- Limitaciones de contexto: la configuración de referencia usa 8.192 tokens; el máximo nativo del modelo base no está documentado en la información disponible.
- Idiomas: no se declara la lista de idiomas soportados, por lo que el rendimiento multilingüe no puede evaluarse a priori.
- Licencia: OpenMDW-1.1 no es una licencia permisiva estándar; es obligatorio revisar sus términos antes de uso comercial o redistribución.
- Métricas de selección: los textos de evaluación se usaron para elegir los ficheros en todos los tamaños excepto Q3_K_XL y Q4_K_XL, lo que puede introducir un sesgo favorable en las métricas KL de los demás tamaños.
- Decodificación especulativa: con el drafter `dflash`, la salida greedy no siempre es idéntica palabra por palabra a la del modelo sin drafter.
- Audio: el soporte de audio es experimental en llama.cpp y puede cambiar entre builds.
- Dependencia de versión: requiere llama.cpp b11960 o superior; builds anteriores pueden producir resultados distintos a los reportados.
- Paquetes Ollama y LM Studio: son solo texto; la entrada de imagen requiere descargar el `mmproj` y usar llama.cpp directamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/nemotron-3.5-bolt-e4b-artemis
- LM Studio: https://lmstudio.ai/turintech/nemotron-3.5-bolt-e4b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
