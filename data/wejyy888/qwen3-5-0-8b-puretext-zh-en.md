# wejyy888/Qwen3.5-0.8B-PureText-ZH-EN

# Qwen3.5-0.8B Pure Text ZH-EN

## Resumen

Qwen3.5-0.8B Pure Text ZH-EN es una derivacion text-only del modelo multimodal Qwen/Qwen3.5-0.8B, publicada por el usuario wejyy888 en HuggingFace. El checkpoint no ha sido reentrenado: se ha obtenido mediante una conversion estructural y una poda de vocabulario. Concretamente, se ha pasado de la clase `Qwen3_5ForConditionalGeneration` a `Qwen3_5ForCausalLM`, se han eliminado los pesos de la torre de vision y del modulo MTP (multi-token prediction), y se han descartado los tokens especiales de vision, grounding, audio y TTS.

El cambio mas relevante es la reduccion del vocabulario: de 248.320 filas a 182.684 tokens reales, ampliadas a 182.784 filas para mantener la alineacion. Los IDs del tokenizer se han remapeado y se conserva el fichero `old2new.json` para convertir datasets ya tokenizados. Los pesos de cada token retenido se preservan exactamente igual que en el modelo original.

El resultado es un modelo causal de 685.284.160 parametros (aproximadamente 1,3 GiB en safetensors BF16), especializado en inferencia en chino e ingles, con licencia Apache-2.0. Su interes practico es doble: por un lado reduce el coste de memoria asociado a la matriz de embeddings en un modelo pequeno; por otro, sirve como caso de estudio reproducible de poda de vocabulario sobre un modelo multimodal convertido a texto puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3_5ForCausalLM`), derivado de `Qwen3_5ForConditionalGeneration` (multimodal) |
| Parametros totales | 685.284.160 |
| Parametros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos BF16 safetensors; no se incluyen GGUF ni cuantizaciones INT8/INT4) |
| Idiomas soportados | chino (zh) e ingles (en); otros idiomas decodifican mediante byte fallback, con mayor consumo de tokens |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, ~1,3 GiB) |
| Vocabulario | 182.684 tokens reales, ampliado a 182.784 filas (frente a 248.320 del modelo base) |
| Modalidades de entrada | solo texto (sin imagen, video, audio ni TTS) |
| Libreria | transformers (requiere version con soporte de `Qwen3_5ForCausalLM`) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Fecha de publicacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer causal con atencion completa, heredado del bloque de lenguaje del modelo base Qwen3.5-0.8B. La conversion elimina las cabezas y modulos no textuales: la torre de vision, los pesos de MTP y los tokens especiales asociados a vision, grounding, audio y sintesis de voz. El checkpoint final se carga mediante `AutoModelForCausalLM` y expone unicamente la ruta de generacion de texto.

No se ha realizado ningun entrenamiento adicional, ni pretraining continuado, ni SFT, ni alineacion por RLHF o DPO. El unico proceso aplicado es de cirugia de pesos y vocabulario: poda de filas del embedding y de la cabeza de salida, remapeo de IDs del tokenizer y padding de las filas sobrantes inicializadas a cero, de modo que no puedan producir logits invalidos. La validacion declarada por el autor incluye coincidencia exacta de los logits de los tokens retenidos respecto al modelo fuente, equivalencia del tokenizer en chino e ingles tras el remapeo, y pruebas de humo de forward pass, plantilla de chat y generacion. El script `prune_qwen35_zh_en.py` documenta el procedimiento completo.

La innovacion tecnica relevante no esta en el entrenamiento, sino en la reduccion del espacio de vocabulario manteniendo intactos los pesos asociados. Esto disminuye el coste de la matriz de embeddings y de la proyeccion final, y acorta la longitud efectiva de las secuencias tokenizadas en chino e ingles, a costa de perder cobertura nativa para el resto de idiomas.

## Capacidades

- Generacion de texto conversacional en chino e ingles mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredados del modelo base, con la salvedad de que no se ha aplicado ninguna etapa de alineacion adicional.
- Tokenizacion optimizada para chino e ingles: la equivalencia de tokens con el modelo original se preserva exactamente tras el remapeo de IDs.
- Capacidad de decodificacion multilingue residual mediante byte fallback para idiomas distintos de zh/en, aunque con mayor consumo de tokens por caracter.
- Inferencia ligera: 685 millones de parametros permiten ejecucion en CPU y en GPUs de gama baja.
- Conversión de datasets ya tokenizados mediante el mapeo `old2new.json`.
- No soporta tool calling ni function calling de forma verificada (no disponible en la informacion proporcionada).
- No soporta agentes, vision, audio ni TTS: estas rutas se han eliminado explicitamente del checkpoint.
- No consta modo thinking explicito ni decodificacion especulativa.

## Casos de uso

- Clasificacion y enrutado de texto bilingue zh/en a gran escala: el modelo cabe en una sola GPU de gama baja o incluso en CPU, por lo que puede procesar lotes muy grandes de documentos cortos con un coste por inferencia minimo.
- Preprocesado y normalizacion de corpus: al conservar la tokenizacion exacta en chino e ingles, es adecuado para tareas de limpieza, reescritura y normalizacion de texto antes de alimentar un pipeline mayor.
- Asistentes embebidos en dispositivos con recursos limitados: 1,3 GiB en BF16 permiten desplegarlo en portatiles, mini-PC o placas con NPU, gestionando respuestas cortas sin conexion a la nube.
- Base para fine-tuning de dominio especifico: el vocabulario ya podado reduce el tamano de la capa de embeddings, lo que abarata el ajuste sobre corpus tecnicos o sectoriales en chino e ingles.
- Extraccion de informacion y generacion de JSON en corpus bilingues: util para convertir texto libre en estructuras simples en pipelines de ingesta de datos.
- Investigacion sobre poda de vocabulario y cirugia de checkpoints multimodales: el repositorio incluye el script de conversion y el mapeo de IDs, lo que permite reproducir y comparar la perdida de rendimiento frente al modelo base.
- Generacion de borradores y resumenes cortos en soporte interno: respuestas de baja latencia para tickets o notas en chino e ingles, siempre con revision humana por el riesgo de alucinacion.
- Traduccion asistida zh↔en de frases simples: aunque no se declara como modelo de traduccion, la cobertura nativa de ambos idiomas y la preservacion del tokenizer lo hacen utilizable como apoyo en tareas de parafraseo entre los dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe pruebas de validacion funcional (carga del modelo, coincidencia de logits en los tokens retenidos, equivalencia del tokenizer y pruebas de humo de generacion), sin valores numericos de MMLU, HumanEval, GSM8K ni metricas equivalentes. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,4 GB solo para pesos, mas cache KV y activaciones; un presupuesto practico de 2 a 3 GB es suficiente para secuencias cortas.
- VRAM estimada en FP32: aproximadamente 2,8 GB de pesos.
- VRAM estimada en INT8: alrededor de 0,7 GB; en INT4, alrededor de 0,4 GB (cuantizaciones no publicadas por el autor, requieren conversion propia).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090; tambien es viable en GPUs de datacenter (A100, H100) aunque muy sobredimensionadas para 685 millones de parametros.
- Ejecucion en CPU: viable, incluidos portatiles modernos y placas tipo Raspberry Pi 5; la latencia depende del backend y de la longitud de secuencia.
- Opciones de despliegue: transformers con una version que soporte `Qwen3_5ForCausalLM`, y servidores de inferencia compatibles con esa arquitectura. Para llama.cpp, Ollama o TGI seria necesaria una conversion a GGUF o la incorporacion del soporte de la arquitectura, que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B Pure Text ZH-EN | 685.284.160 | no disponible | zh, en (otros por byte fallback) | Apache-2.0 | Derivado text-only con vocabulario podado; sin entrenamiento adicional |
| Qwen3-0.6B | ~0,6B | 32.768 tokens (segun su model card) | multilingue | Apache-2.0 | Alternativa directa de la misma familia; incluye modo thinking |
| Llama-3.2-1B | ~1,24B | 128.000 tokens (segun su model card) | multilingue | Llama 3.2 Community License | Mayor contexto, pero licencia con restricciones y mas parametros |
| Gemma-3-1B | ~1B | 32.768 tokens (segun su model card) | multilingue | Gemma Terms of Use | Tamano similar, licencia propia no Apache |

Los datos de contexto y licencia de los modelos alternativos provienen de sus model cards publicas y deben verificarse en la version vigente antes de tomar decisiones de produccion. Para el modelo objeto de esta ficha no se dispone de contexto declarado ni de resultados de evaluacion que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La poda de vocabulario altera los IDs de tokens: cualquier dataset tokenizado previamente debe remapearse con `old2new.json` o las secuencias quedaran corruptas.
- Aunque los logits de los tokens retenidos coinciden con el modelo original, cambiar el vocabulario modifica la distribucion de probabilidad sobre el espacio completo; el autor recomienda una etapa corta de pretraining continuado o SFT antes de uso en produccion.
- Los idiomas distintos de chino e ingles siguen funcionando por byte fallback, pero consumen mas tokens y ofrecen peor calidad y mayor coste por caracter.
- El modelo no admite imagen, video, audio ni TTS: solicitudes de esas modalidades no pueden atenderse.
- No consta ninguna etapa de alineacion, RLHF o DPO aplicada sobre este checkpoint, por lo que el riesgo de sesgos y de contenido inapropiado es el heredado del modelo base sin mitigacion adicional.
- Riesgo de alucinacion propio de un modelo de 685 millones de parametros, especialmente en tareas de razonamiento multi-paso, matematicas o conocimiento factual especifico.
- No consta soporte verificado de tool calling, function calling ni flujos de agente.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero el modelo base Qwen/Qwen3.5-0.8B puede tener condiciones propias que conviene revisar.
- El repositorio registra 0 descargas y 0 likes, y el autor es un usuario individual: no hay validacion independiente de la comunidad ni mantenimiento garantizado.
- La longitud de contexto no se declara en la informacion disponible; asumir un valor concreto sin verificarlo puede provocar fallos en produccion.
- Requiere una version de transformers que incluya la clase `Qwen3_5ForCausalLM`; versiones anteriores no cargaran el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wejyy888/Qwen3.5-0.8B-PureText-ZH-EN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Script de conversion `prune_qwen35_zh_en.py` y mapeo `old2new.json`: incluidos en el repositorio de HuggingFace del modelo
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
