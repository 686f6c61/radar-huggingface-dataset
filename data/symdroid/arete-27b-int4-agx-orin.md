# symdroid/Arete-27B-INT4-AGX-Orin

## Resumen

Arete-27B-INT4-AGX-Orin es una cuantización de terceros en INT4 (W4A16) del modelo NousResearch/Arete-27B, un post-entrenamiento de Qwen3.8-27B realizado por Nous Research. La publica el usuario symdroid y está empaquetada específicamente para inferencia de texto con vLLM sobre NVIDIA Jetson AGX Orin. No es una release oficial de Nous Research, Alibaba ni NVIDIA: es un checkpoint derivado, con cuantización independiente y ensamblado manual del índice de tensores.

El paquete ocupa 19,47 GB en seis shards safetensors e incluye un cabezal MTP (multi-token prediction) en BF16 con 15 tensores nombrados `mtp.*`, entre ellos `mtp.fc.weight`. La arquitectura declarada en `config.json` es `qwen3_5`, con linaje Qwen3.8-27B. La cuantización usa `compressed-tensors` en formato `pack-quantized`, grupo de 128, 4 bits en pesos y 16 bits en activaciones, con kernel Marlin.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de la familia Qwen3.8 de 27B en un dispositivo edge con memoria unificada limitada (Jetson AGX Orin), un escenario donde las versiones BF16 no caben con holgura. La model card es explícita sobre el alcance: solo se validó inferencia de texto, y ni el rendimiento, ni la estabilidad en contexto largo, ni el funcionamiento portable del MTP están medidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, identificador `qwen3_5` (linaje Qwen3.8-27B) |
| Parámetros totales | 6.260.690.960 según safetensors del repo (el nombre comercial indica 27B; discrepancia no aclarada en la información disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como máximo del modelo; la validación se hizo con `--max-model-len 2048` |
| Tipos de cuantización | INT4 W4A16, `compressed-tensors` / `pack-quantized`, group size 128, kernel Marlin; cabezal MTP en BF16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards indexados, 19,47 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer decoder-only de la familia Qwen3.8, post-entrenado por Nous Research para dar lugar a Arete-27B. La información disponible no detalla la composición del dataset de post-entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas concretas de RLHF, DPO o RL verificable. Tampoco se especifica si la arquitectura incorpora atención lineal, decodificación especulativa nativa u otras innovaciones más allá de la presencia del cabezal MTP.

La aportación técnica de este checkpoint es la cuantización: pesos a 4 bits con activaciones a 16 bits, agrupación de 128 elementos y empaquetado `pack-quantized` compatible con `compressed-tensors`, lo que habilita kernels Marlin en vLLM. El índice incluye 15 tensores MTP en BF16, incluido `mtp.fc.weight`, presumiblemente para decodificación especulativa, aunque la model card advierte que la ejecución del MTP depende del backend y la versión, y que su mera presencia no activa speculative decoding. No se documenta el proceso de calibración de la cuantización ni el conjunto de datos usado para ello.

## Capacidades

- Generación de texto conversacional en inglés, pipeline `text-generation`.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.8-27B vía Arete-27B (no verificados en esta cuantización).
- Cabezal MTP incluido en BF16 para decodificación especulativa, condicionado al soporte del backend vLLM y a la versión utilizada.
- Inferencia solo texto: la model card indica explícitamente que la ejecución multimodal no está validada.
- Tool calling y function calling: no disponible en la información proporcionada para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia edge en robótica y sistemas embebidos: el checkpoint está empaquetado para Jetson AGX Orin, de modo que se puede desplegar un modelo de la familia Qwen3.8-27B en un dispositivo con memoria unificada limitada usando vLLM con `--gpu-memory-utilization 0.60` y contexto de 2048 tokens.
- Asistentes de voz o texto en dispositivos autónomos: al ser solo texto y en inglés, encaja en pipelines donde un ASR previo transcribe y el modelo genera respuestas o comandos en lenguaje natural dentro del propio robot o dron.
- Prototipado de agentes locales sin conectividad: al ejecutarse íntegramente en el dispositivo, permite probar flujos conversacionales multi-turno en entornos aislados, siempre con contexto corto (2048 tokens en la configuración validada).
- Evaluación de cuantización INT4 para producción: sirve como banco de pruebas para medir la degradación de calidad de W4A16 con group size 128 y kernel Marlin frente al BF16 original en tareas concretas del usuario.
- Experimentación con decodificación especulativa MTP: los 15 tensores MTP permiten probar la aceleración por multi-token prediction en vLLM sobre Jetson, comparando latencia con y sin MTP.
- Generación de texto offline en inglés: resúmenes, clasificación o redacción de documentos en escenarios sin red, donde el coste energético y la privacidad priman sobre el throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el throughput, la estabilidad en contexto largo y el rendimiento portable del MTP no están medidos, y advierte de que no debe interpretarse ningún benchmark del modelo original como benchmark de esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 19,47 GB en INT4; con overhead de KV cache y activaciones, la configuración validada usó `--gpu-memory-utilization 0.60` sobre la memoria unificada del Jetson AGX Orin (64 GB en la variante estándar; no confirmado en la información disponible).
- GPU recomendadas: NVIDIA Jetson AGX Orin es el objetivo declarado y probado. No hay validación documentada en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos de funcionamiento en RTX 4090 u otras consumer; el peso de 19,47 GB encajaría en GPUs con 24 GB o más, pero no está verificado.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors` y kernels Marlin; la model card menciona `--language-model-only`, `--max-model-len 2048`, `--gpu-memory-utilization 0.60` y `--no-enable-prefix-caching` como ajustes de la instancia validada, no como comando universal. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-INT4-AGX-Orin (este) | 6.260.690.960 según safetensors; 27B nominal | no disponible (validado a 2048) | INT4 W4A16, Marlin | Apache 2.0 | Hugging Face, 0 descargas |
| NousResearch/Arete-27B (base) | 27B nominal | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (origen) | 27B nominal | no disponible | BF16 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, licencia y formato.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre indica 27B pero el recuento real de safetensors es de 6.260.690.960 parámetros; conviene verificar el checkpoint antes de dimensionar hardware.
- Cuantización de terceros: no es una release oficial de Nous Research, Alibaba ni NVIDIA; la calidad puede diferir del BF16 original y no hay benchmarks que lo cuantifiquen.
- Solo texto validado: la ejecución multimodal no está probada y el modelo base podría soportarla, pero esta cuantización no lo garantiza.
- Contexto corto en la configuración validada: 2048 tokens; la model card no reclama ese valor como máximo soportado, pero tampoco documenta uno superior.
- MTP no garantizado: la presencia de tensores MTP no activa decodificación especulativa por sí sola; depende del backend y la versión de vLLM.
- Idioma: solo inglés declarado, lo que limita su uso en castellano sin evaluación adicional.
- Riesgo de alucinación y sesgos: no documentados para esta cuantización; son heredados del modelo base y no se han medido aquí.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye los pesos AS IS y recomienda validación local; se incluyen textos de licencia originales en `licenses/` y atribución en `NOTICE`.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas estén documentados por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/symdroid/Arete-27B-INT4-AGX-Orin
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo origen: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub del autor: https://github.com/symdroid
- Repositorio del proyecto: https://github.com/symdroid/Arete-27B-INT4-AGX-Orin
- Ficha de especificaciones y VRAM: https://apxml.com/models/arete-27b
