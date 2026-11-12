# webmp3/Sakura-Axion-1.0-35B-GGUF

## Resumen

Sakura-Axion-1.0-35B-GGUF es una cuantización GGUF de carácter comunitario del modelo Axion-1.0-35B, publicada por el usuario webmp3 bajo licencia Apache 2.0. No se trata de un modelo original ni de una versión oficial del autor upstream, sino de una re-cuantización de un GGUF BF16 intermedio (producido por prithivMLmods) mediante los presets de llama.cpp. El modelo base emplea una arquitectura identificada como `qwen35moe`, con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones).

La relevancia de esta ficha radica en que reduce el peso original de 69,4 GB (BF16 GGUF) a 24,7 GB en Q5_K_M y 36,9 GB en Q8_0, lo que facilita el despliegue en hardware con VRAM limitada. Se distribuye junto con el proyector visual (`mmproj`) del repositorio original, lo que habilita entrada de imágenes a través de llama.cpp, aunque el autor advierte que la entrada de imágenes no ha sido probada en esta release. No se publican benchmarks, perplexity ni puntuaciones de calidad.

El modelo está orientado a uso conversacional y declara soporte de inglés y chino. Al ser una cuantización, hereda las capacidades y limitaciones del modelo base, pero el autor no documenta detalles sobre datos de entrenamiento, contexto máximo ni procesos de alineación. La información disponible se limita a la model card de la cuantización y a los metadatos del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (según model card) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M, Q8_0 (GGUF); proyector visual en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors solo como dato de parámetros del modelo base) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35moe`, un transformer con mezcla de expertos (MoE) según la nomenclatura del identificador. No obstante, la model card no especifica el número de parámetros activos por token, el número de expertos, la dimensión oculta ni la longitud de contexto nativa. Tampoco se documentan los datos de entrenamiento del modelo base: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación.

La innovación técnica de esta release es exclusivamente el proceso de cuantización. Se realizó una **re-cuantización de un GGUF existente** (no una conversión desde safetensors ni BF16 nativo), partiendo del archivo `Axion-1.0-35B.BF16.gguf` del repositorio `prithivMLmods/Axion-1.0-35B-GGUF`, fijado al commit `1bbacc9c4f6949b29495e3ef8aec9276c75a0728`. No se ejecutó calibración con matrices de importancia. Los presets de llama.cpp mantienen algunos tensores en mayor precisión: el archivo Q5_K_M contiene 301 tensores F32, 371 Q5_K y 61 Q6_K; el Q8_0 contiene 301 F32 y 432 Q8_0. El autor indica que solicitó Q4_K_M y Q6_K pero no se publicaron por no superar todas las comprobaciones.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Entrada multimodal de imágenes mediante el proyector visual `Axion-1.0-35B.mmproj-bf16.gguf` (0,9 GB), cargable con `llama-mtmd-cli`; el autor advierte que la entrada de imágenes no ha sido probada en esta release.
- Soporte de los idiomas inglés y chino, según los metadatos de idioma.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades de razonamiento, código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- **Despliegue local en estaciones de trabajo con GPU de consumo**: la variante Q5_K_M (24,7 GB) permite ejecutar un modelo de ~34,7 mil millones de parámetros en tarjetas con 24-32 GB de VRAM mediante llama.cpp, algo inviable con el BF16 original de 69,4 GB.
- **Prototipado de asistentes conversacionales bilingües inglés-chino**: el modelo declara soporte de `en` y `zh`, por lo que puede emplearse en bots de atención al cliente o asistentes internos para esos dos mercados, siempre que se validen las capacidades reales del modelo base.
- **Pruebas de pipelines multimodales con llama.cpp**: el `mmproj` permite experimentar con entrada de imágenes usando `llama-mtmd-cli`; es adecuado para entornos de investigación que necesiten validar flujos de visión sin depender de infraestructura en la nube, aunque el autor no garantiza el comportamiento de la visión en esta release.
- **Evaluación comparativa de cuantizaciones**: al ofrecer Q5_K_M y Q8_0 del mismo origen, sirve para medir la degradación de calidad entre ambas cuantizaciones en tareas concretas del equipo, dado que el autor no publica perplexity ni benchmarks.
- **Integración en aplicaciones de escritorio offline**: el formato GGUF y el tamaño reducido permiten empaquetar el modelo en aplicaciones locales sin conexión, con llama.cpp como motor de inferencia.
- **Servicio interno con endpoints compatibles**: la etiqueta `endpoints_compatible` sugiere que puede exponerse a través de servidores compatibles con la API de llama.cpp para uso en herramientas internas, aunque no se documenta throughput ni latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama ninguna puntuación de benchmark de código, perplexity ni calidad, y que la única verificación realizada es que cada archivo se carga en llama.cpp y genera texto una vez.

## Requisitos de hardware

- **VRAM estimada para inferencia**: Q5_K_M requiere aproximadamente 24,7 GB solo para pesos, más overhead de contexto y caché KV; Q8_0 requiere aproximadamente 36,9 GB para pesos. Los requisitos totales de VRAM no están documentados.
- **GPU recomendadas**: no disponibles en la información proporcionada. Por tamaño, Q5_K_M podría caber en GPUs de 32 GB (por ejemplo, A100 40 GB o RTX 5090 de 32 GB) y Q8_0 en GPUs de 48 GB o superiores (A6000, A100 80 GB, H100).
- **GPU de consumo**: Q5_K_M no cabe en GPUs de 24 GB (RTX 4090, RTX 3090) sin offloading parcial a CPU o RAM del sistema; Q8_0 tampoco. El autor no confirma ningún caso de ejecución en GPU de consumo.
- **Opciones de despliegue**: llama.cpp (verificado con build `b11669-620d2225c`), `llama-cli` para texto y `llama-mtmd-cli` para imágenes. Otros motores (vLLM, TGI, Ollama) no están documentados para esta arquitectura.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura-Axion-1.0-35B-GGUF (Q5_K_M) | 34,7 B | no disponible | GGUF | Apache 2.0 | Cuantización comunitaria; sin benchmarks publicados |
| Axion-1.0-35B (base) | 34,7 B | no disponible | safetensors / GGUF BF16 | Apache 2.0 (según base) | Modelo original; 69,4 GB en BF16 GGUF |
| prithivMLmods/Axion-1.0-35B-GGUF | 34,7 B | no disponible | GGUF BF16 | Apache 2.0 (según base) | Fuente directa de esta cuantización |

No se dispone de datos de rendimiento ni de modelos comparables de otros autores en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **No es una release oficial**: se trata de una cuantización comunitaria independiente; el autor upstream no la ha validado.
- **Sin benchmarks ni métricas de calidad**: no hay perplexity, MMLU, HumanEval ni ninguna otra medición; la única verificación es la carga y generación de texto en llama.cpp.
- **Visión no probada**: el proyector visual se copia sin cambios y la entrada de imágenes no ha sido testeada en esta release.
- **Sin calibración por importancia**: la re-cuantización se hizo desde un GGUF BF16 sin matrices de importancia, lo que puede afectar a la fidelidad respecto al original en comparación con cuantizaciones calibradas.
- **Contexto e idiomas limitados según metadatos**: solo se declaran `en` y `zh`; el rendimiento en castellano no está documentado.
- **Riesgo de alucinación y sesgos**: no documentados por el autor; deben asumirse los del modelo base, que tampoco están descritos.
- **Licencia Apache 2.0**: permite uso comercial con atribución, pero el autor recuerda que los autores upstream conservan su licencia y atribución; conviene verificar la licencia del modelo base antes de producción.
- **Dependencia de versión de llama.cpp**: requiere un build que soporte la arquitectura `qwen35moe`; versiones antiguas pueden fallar al cargar.
- **Archivos no publicados**: Q4_K_M y Q6_K fueron solicitados pero descartados por no pasar todas las comprobaciones; no deben asumirse disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Axion-1.0-35B-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Repositorio GGUF de origen: https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF
- Model card del commit fijado: https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF/blob/1bbacc9c4f6949b29495e3ef8aec9276c75a0728/README.md
