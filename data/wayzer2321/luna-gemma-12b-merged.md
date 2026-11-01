# wayzer2321/Luna-Gemma-12B-Merged

## Resumen

Luna-Gemma-12B-Merged es un checkpoint de pesos fusionados (merged) publicado por el usuario wayzer2321 bajo el alias "Wayzer". Se trata de un ajuste fino (fine-tune) de tipo LoRA sobre el modelo base `unsloth/gemma-4-12b-it`, cuyo objetivo es encarnar a "Luna", un personaje conversacional con un registro informal, sarcasmo, humor surrealista y cambios emocionales marcados, asociado al lore del creador. No es un modelo de propósito general ni una release oficial de Google: es un modelo de personaje orientado a la conversación.

El checkpoint contiene los pesos completos en BF16 con el adaptador LoRA ya aplicado, de modo que no es necesario cargar un adaptador separado. El repositorio incluye los shards de safetensors, el índice, la configuración, el tokenizer y la plantilla de chat. Con 11.959.730.224 parámetros y un tamaño de repositorio de 24,0 GB, está pensado para ejecutarse con la librería `transformers`.

Su relevancia es acotada y muy específica: sirve como ejemplo de fine-tune de personaje sobre una base Gemma 4 de 12B y como fuente de los pesos que alimentan la release GGUF Q8_0 del mismo autor. Los idiomas declarados son ruso e inglés, y la licencia es la de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, tag `gemma4_unified`); detalles internos no disponibles |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en BF16 (16 bits); existe una release GGUF Q8_0 separada |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Gemma (licencia y condiciones de uso originales de Gemma) |
| Formato de pesos | safetensors (BF16, multiples shards con `model.safetensors.index.json`); GGUF Q8_0 en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-12b-it`, una base de la familia Gemma 4 con arquitectura transformer decoder-only y modalidad declarada image-text-to-text en los tags del repositorio, aunque el autor describe este fine-tune como "text-focused". Sobre esa base se aplicó un ajuste LoRA de rango 16 y alpha 32, con las proyecciones de atención y MLP como objetivos.

El dataset de entrenamiento consta de 457 diálogos, divididos en 411 ejemplos de entrenamiento y 46 de validación. El entrenamiento se realizó únicamente sobre las respuestas del asistente, con longitud de secuencia de 512. El schedule consistió en dos ejecuciones separadas de una época: la primera con learning rate 1e-4 y la segunda con 5e-5, reiniciando optimizador y scheduler. La base se cargó en 8 bits durante el entrenamiento, pero los pesos exportados son BF16 fusionados; el autor señala explícitamente que la precisión de entrenamiento y la de exportación son ajustes independientes. No se documentan datos sobre volumen de tokens, composición del corpus, RLHF o DPO.

## Capacidades

- Generación de texto conversacional con un estilo de personaje concreto: registro informal, sarcasmo, humor surrealista y cambios emocionales.
- Conversación multi-turno orientada a mantener la "personalidad" de Luna y el lore del creador.
- Capacidad potencial de entrada imagen-texto heredada de la base Gemma 4 (según el tag `image-text-to-text`), aunque el fine-tune se declara centrado en texto y no se documenta su comportamiento multimodal.
- Soporte de ruso e inglés.
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Personaje conversacional para entretenimiento: el modelo está entrenado específicamente para interpretar a Luna con su tono informal y su humor, por lo que encaja en chatbots de rol o demos de personaje.
- Prototipado de fine-tunes de personaje: sirve como referencia de un pipeline LoRA (rango 16, alpha 32) sobre Gemma 4 12B con fusión de pesos y exportación a GGUF.
- Experimentación con estilos conversacionales marcados: útil para estudiar cómo un dataset pequeño (457 diálogos) desplaza el registro de un modelo instructivo.
- Generación de diálogos creativos en ruso o inglés con un tono provocador y coloquial.
- Base para la release GGUF Q8_0: quien quiera ejecutar el personaje en entornos con llama.cpp puede partir de los pesos fusionados o del GGUF publicado.
- Investigación sobre alineación y seguridad: al contener lenguaje soez y humor provocador, es un caso útil para evaluar filtros de contenido y salvaguardas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos (11,96B parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda una GPU de 40-80 GB para contexto amplio.
- La release GGUF Q8_0 reduce el requisito a aproximadamente 12-13 GB de pesos, lo que permite ejecución en GPUs consumer de gama alta.
- GPUs recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) queda muy justa en BF16 y más holgada con la cuantización Q8_0.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), llama.cpp u Ollama para el GGUF Q8_0; vLLM y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Luna-Gemma-12B-Merged | 11,96B | no disponible | ru, en | Gemma | safetensors BF16, GGUF Q8_0 | Fine-tune de personaje sobre Gemma 4 12B |
| unsloth/gemma-4-12b-it (base) | 12B (aprox.) | no disponible | no disponible | Gemma | safetensors | Modelo instructivo base sin el sesgo de personaje |
| Otras releases Luna basadas en Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | Checkpoints separados del mismo autor; no comparables directamente en pesos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene lenguaje soez y humor provocador; el propio autor desaconseja su uso a personas sensibles.
- Es un fine-tune de personaje con solo 457 diálogos: el riesgo de sobreajuste al estilo y de respuestas incoherentes fuera del personaje es alto.
- No es una release oficial de Google; no debe presentarse como modelo Gemma oficial.
- Solo se declaran ruso e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad.
- La licencia Gemma impone condiciones de uso; debe revisarse antes de cualquier uso comercial.
- Es imprescindible usar la plantilla de chat nativa de Gemma 4 y no una plantilla Qwen/ChatML, según advierte el autor.
- Deben conservarse todos los shards de safetensors, el índice y los ficheros de tokenizer y configuración para que la carga funcione.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wayzer2321/Luna-Gemma-12B-Merged
- Release GGUF Q8_0: https://huggingface.co/wayzer2321/Luna-Gemma-12B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-12b-it
