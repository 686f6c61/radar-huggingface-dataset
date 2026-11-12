# swaynehales/Emberon-2-mlx-8bit

## Resumen

Emberon-2 MLX 8bit es una conversión nativa al formato MLX del modelo Emberon-2 de Promethic Labs, un fine-tune de 354 millones de parámetros especializado en limpieza de texto dictado. No se trata de un asistente general: su única tarea es tomar una transcripción de voz en bruto y devolverla como texto limpio, con puntuación y formato correctos, sin responder a las preguntas ni ejecutar las órdenes que aparezcan en el dictado. El modelo se construye sobre Liquid AI LFM2.5-350M, una arquitectura de tipo LFM2 (Liquid Foundation Model, no transformer clásico), y esta versión concreta aplica cuantización afín de 8 bits con tamaño de grupo 64, manteniendo los tensores no cuantizados en FP16.

La relevancia de esta ficha está en su naturaleza de distribución de formato: el autor de la conversión no ha reentrenado ni modificado los pesos, sino que ha trasladado el modelo original (publicado como GGUF F16) al ecosistema MLX para ejecución en Apple Silicon. El repositorio ocupa 0,4 GB y está pensado para integrarse en aplicaciones de dictado locales que necesitan un posprocesador de voz ligero, rápido y sin dependencia de la nube.

Es importante subrayar que el modelo solo declara soporte de inglés, que su licencia es la LFM Open License v1.0 (heredada de Liquid AI) y que la validación realizada por el autor de la conversión es limitada: 11 entradas sintéticas, sin equivalencia de precisión amplia demostrada ni verificación del límite de contexto configurado de 128k.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model), base LFM2.5-350M |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k configurados (no validados en la conversión) |
| Tipos de cuantización | 8-bit afín, tamaño de grupo 64; tensores no cuantizados en FP16 |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX) |
| Librería | mlx-lm |
| Modelo base | PromethicLabs/Emberon-2 (a su vez fine-tune de LiquidAI/LFM2.5-350M) |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | text-generation |
| Vocabulario | 65.536 filas de embedding, 64.402 IDs de token reales, merges BPE preservados |

## Arquitectura y entrenamiento

El modelo subyacente es LFM2.5-350M de Liquid AI, una arquitectura LFM2 que se aparta del transformer denso convencional y está diseñada para inferencia eficiente en dispositivos. Sobre esa base, Promethic Labs realizó un fine-tune específico para limpieza de dictado, dando lugar a Emberon-2. La conversión aquí descrita parte del archivo `Emberon-2-F16.gguf` (SHA-256 `056a4b0889eb5b9873d9f38393f5e595fb58c6ffd82b47fde76b9169f602f5a1`): todos los pesos afinados provienen de ese fichero, mientras que solo la configuración y los activos del tokenizador se toman del repositorio MLX base original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el fine-tune original; la model card no los detalla. La innovación técnica de esta distribución es puramente de formato y precisión: cuantización afín de 8 bits con grupo de 64 sobre los pesos del fine-tune, conservación íntegra del vocabulario (65.536 filas, 64.402 IDs reales, merges BPE y plantilla de chat) y ausencia de necesidad de código remoto para cargar el modelo. La validación local cubre recarga nativa, integridad de tensores y configuración, paridad de tokens de prompt y 11 entradas sintéticas de dictado, con coincidencia exacta de texto frente al GGUF de origen en las 11.

## Capacidades

- Limpieza de texto dictado: corrige puntuación, mayúsculas, muletillas y formato de una transcripción en bruto.
- Modo "no respuesta": devuelve las preguntas y órdenes del dictado como texto limpio, sin contestarlas ni ejecutarlas.
- Generación de texto conversacional dentro del pipeline de limpieza (formato chat con plantilla propia).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está explícitamente contraindicado para ello.
- Capacidades multilingües: solo inglés declarado; se reporta comportamiento anómalo de tokenización en entradas con palabras no inglesas.
- Capacidades especiales: pensado para posprocesado de voz (speech-postprocessing) y dictado; sin visión ni audio nativo.

## Casos de uso

- Posprocesado de dictado en aplicaciones de notas de voz: el modelo recibe la transcripción ASR en bruto y devuelve texto con puntuación y mayúsculas, integrándose tras el motor de reconocimiento de voz en una app local de Apple Silicon.
- Corrección de correos redactados por voz: un usuario dicta un mensaje y el modelo elimina muletillas ("um", "so like") y aplica formato, manteniendo el contenido sin responder a preguntas incidentales.
- Transcripción de reuniones con formato legible: tras el ASR, se pasa cada intervención por Emberon-2 para obtener actas limpias, con la ventaja de que el modelo no ejecuta órdenes contenidas en la conversación.
- Entrada de texto por voz en entornos de escritorio macOS: al ser MLX y 0,4 GB, puede ejecutarse en segundo plano en un Mac con Apple Silicon sin GPU dedicada, ofreciendo latencia baja para dictado interactivo.
- Preprocesado de datasets de voz para investigación: limpiar transcripciones automáticas antes de usarlas en anotación o análisis lingüístico, con la cautela de conservar siempre el texto original como respaldo.
- Asistentes de accesibilidad: usuarios con movilidad reducida que dictan texto largo pueden obtener salidas limpias y con formato sin depender de servicios en la nube, manteniendo los datos en local.
- Filtro de seguridad en pipelines de voz: al no responder preguntas ni ejecutar comandos, sirve como capa de saneamiento que evita que un dictado se interprete como instrucción en sistemas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta validación cualitativa: coincidencia exacta de texto con el GGUF de origen en 11 entradas sintéticas (10 ordinarias y 1 de estrés repetitivo que también se trunca en el GGUF fuente), y una nota de un consumidor externo sobre divergencias de tokenización en 8 de 57 entradas sintéticas frente al GGUF `Emberon-2-Q4_K_M.gguf` con vocabulario recortado.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 354M en 8 bits con repo de 0,4 GB, la inferencia requiere del orden de 0,5-1 GB de memoria unificada, aunque no se publican cifras oficiales.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) es el objetivo nativo por MLX; no se documenta soporte CUDA en esta distribución.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; en el ecosistema NVIDIA requeriría conversión a otro formato (no incluida).
- Opciones de despliegue: `mlx-lm==0.31.3` con `mlx==0.32.4` (probado con Python 3.13); no se documentan vLLM, llama.cpp, Ollama ni TGI para esta conversión concreta.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emberon-2 MLX 8bit (esta ficha) | 354M | 128k configurados (no validados) | safetensors MLX 8-bit | LFM v1.0 | Hugging Face, 0 descargas |
| PromethicLabs/Emberon-2 (original) | 354M | no disponible | GGUF (F16, Q4_K_M) | LFM v1.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | safetensors | LFM v1.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es un asistente general: responderá con texto limpio a preguntas y órdenes, pero no las contestará ni ejecutará; usarlo como chatbot produce resultados incorrectos por diseño.
- Solo inglés declarado; la tokenización puede divergir en entradas con palabras no inglesas (reportado en 8 de 57 entradas sintéticas frente al GGUF Q4_K_M con vocabulario recortado).
- Riesgo de pérdida de contenido o repetición en dictados largos o repetitivos, incluyendo el GGUF F16 original.
- El truncado de salida debe tratarse como fallo: hay que conservar la transcripción en bruto como respaldo y usar decodificación greedy con el system prompt exacto indicado.
- La validación de la conversión es un smoke test de 11 entradas; no establece equivalencia amplia de precisión, ni los scores de benchmarks publicados del GGUF upstream, ni el límite de contexto de 128k.
- Licencia LFM Open License v1.0: es necesario revisar los términos originales para uso comercial y conservar LICENSE y NOTICE al redistribuir.
- Sesgos conocidos: no documentados en la información disponible; al ser un fine-tune sobre LFM2.5-350M, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: limitado por la tarea de limpieza, pero posible en forma de reescrituras no fieles al dictado original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swaynehales/Emberon-2-mlx-8bit
- Modelo base (fine-tune): https://huggingface.co/PromethicLabs/Emberon-2
- Modelo base original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Sitio de Promethic Labs: https://www.promethic.xyz
- Ficheros de procedencia y cambios: CONVERSION.json y MODIFICATIONS.md en el repositorio del modelo
- Licencia: LICENSE y NOTICE incluidos en el repositorio del modelo
