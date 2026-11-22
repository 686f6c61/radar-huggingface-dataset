# warlockzero/whisper-large-v3-turbo-int4

## Resumen

Whisper Large V3 Turbo INT4 es una versión cuantizada a 4 bits del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3-turbo` de OpenAI, publicada por el usuario warlockzero. El objetivo es reducir drásticamente el consumo de VRAM para inferencia manteniendo la calidad de transcripción del modelo original, lo que permite desplegar un ASR de gran tamaño en hardware con recursos limitados.

La cuantización emplea `bitsandbytes` con formato NF4 en 4 bits (esquema W4A8/W4A16), y el autor declara un pico de VRAM de aproximadamente 0,54 GB con una precisión de transcripción del 100 % respecto al modelo base. El repositorio contiene 808.878.080 parámetros en formato safetensors y ocupa 0,5 GB.

Es relevante porque el Whisper Large V3 Turbo original ronda los 809 millones de parámetros y requiere varios GB de VRAM en precisión completa; esta variante int4 acerca el modelo a GPUs de consumo y a entornos con memoria muy ajustada, manteniendo la licencia MIT del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), cuantizado a 4 bits |
| Parámetros totales | 808.878.080 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no confirmado en la información) |
| Tipos de cuantizacion | 4-bit NF4 (W4A8/W4A16) mediante bitsandbytes |
| Idiomas soportados | no disponible (heredados de `openai/whisper-large-v3-turbo`; no listados en la información) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-large-v3-turbo`, un transformer encoder-decoder para reconocimiento automático del habla. La variante aquí descrita no reentrena el modelo: aplica cuantización post-entrenamiento con `bitsandbytes` en formato 4-bit NF4, con esquema de cuantización de pesos y activaciones W4A8/W4A16. El autor indica que la cuantización se realizó sobre los pesos del modelo oficial y que se preserva la precisión de transcripción (declara "100% transcript accuracy" respecto al base).

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original, número de tokens, composición de datos ni procesos de RLHF o DPO del modelo base. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia cuantización.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto.
- Traducción de voz a texto (capacidad propia de Whisper; no verificada explícitamente en la información).
- Detección de idioma y transcripción multilingüe (heredadas del modelo base; no detalladas).
- Inferencia con bajo consumo de VRAM (~0,54 GB declarados).
- Compatible con `transformers` mediante `AutoModelForSpeechSeq2Seq` y `AutoProcessor`.
- Etiquetado como `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio generativo o modo thinking: no disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo puede procesar audio y devolver texto en máquinas con poca VRAM gracias a su huella de ~0,54 GB, lo que permite ejecutarlo junto a otras cargas en la misma GPU.
- Subtitulado automático de vídeo: integrable en pipelines de postproducción para generar transcripciones que luego se sincronizan como subtítulos, con la ventaja de que el modelo cabe en GPUs de consumo.
- Asistentes de voz embebidos: al requerir muy poca memoria, puede desplegarse en dispositivos de borde o entornos con GPU modesta para convertir comandos de voz en texto antes de pasarlos a un LLM.
- Atención al cliente con transcripción de llamadas: permite transcribir conversaciones telefónicas en servidores con múltiples instancias del modelo conviviendo en la misma GPU por su bajo consumo.
- Investigación en ASR: sirve como referencia cuantizada para comparar el impacto de la cuantización 4-bit en la calidad de transcripción frente al modelo completo.
- Prototipado rápido con `transformers`: el ejemplo de uso del autor permite poner en marcha un pipeline de ASR con `device_map="auto"` en pocas líneas, útil para demos y pruebas de concepto.
- Procesamiento por lotes en CI/CD o servicios serverless: el reducido tamaño del repositorio (0,5 GB) y la baja VRAM facilitan el despliegue en contenedores con límites de memoria estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente declara una precisión de transcripción del 100 % respecto al modelo base y un pico de VRAM de ~0,54 GB, sin cifras de WER, MMLU, HumanEval ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,54 GB en pico según el autor (cuantización 4-bit NF4).
- GPU recomendadas: no especificadas; por su huella, cualquier GPU con al menos ~1 GB de VRAM libre debería ser suficiente (no confirmado).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con más de 1 GB de VRAM (no verificado explícitamente).
- Opciones de despliegue: `transformers` con `bitsandbytes` (según el ejemplo del autor). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/whisper-large-v3-turbo-int4 | 808.878.080 | no disponible | 4-bit NF4 (bitsandbytes) | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | ~809 M (según modelo base) | no disponible | FP16/FP32 | MIT | Hugging Face |
| openai/whisper-large-v3 | no disponible | no disponible | FP16/FP32 | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar la calidad de transcripción en audio ruidoso o con acentos marcados, aunque el autor declara paridad con el modelo base; conviene validarlo con datos propios.
- Riesgo de alucinación: los modelos Whisper pueden generar texto inventado en segmentos con silencio o ruido, comportamiento heredado del modelo base.
- Idiomas soportados no documentados en esta ficha; deben consultarse en la model card del modelo base.
- Longitud de audio: Whisper procesa ventanas de 30 s; audios más largos requieren segmentación (no detallado en la información).
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base de OpenAI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria.
- Requiere `bitsandbytes` y una GPU compatible para la inferencia cuantizada; el soporte en CPU no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/warlockzero/whisper-large-v3-turbo-int4
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
