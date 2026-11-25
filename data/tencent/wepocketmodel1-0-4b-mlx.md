# tencent/WePocketModel1.0-4B-MLX

## Resumen

WePocketModel 1.0 4B MLX es la conversión para Apple Silicon del modelo multimodal `tencent/WePocketModel1.0-4B`, desarrollado por Tencent. Se distribuye en formato MLX con un runtime autocontenido que permite ejecutar inferencia sobre la GPU de los chips Apple sin depender de PyTorch ni de torchvision. El modelo combina un backbone Qwen3.5 (torre visual Qwen3-VL más un modelo de lenguaje híbrido de 32 capas) con cabezas específicas de tarea, y suma 4.539.265.536 parámetros en bf16.

Su rasgo distintivo es que un único conjunto de pesos cubre tres familias de capacidades bajo el paraguas WePM: generación de texto a partir de texto e imágenes (OCR, captioning, VQA, chat), embedding multimodal con vectores L2-normalizados de dimensión completa 2.048 y truncables por MRL a 64/128/256/512/1024, y decisión estructurada (choice, score, noul/JEV) sobre el estado de una aplicación. Está pensado para despliegue on-device en Macs con Apple Silicon, con licencia Apache 2.0.

La relevancia actual reside en la combinación de tres tareas (generación, recuperación y decisión) en un solo modelo de 4B ejecutable localmente, con cuantización en tiempo de carga que reduce el pico de memoria de 9,0 GiB a 4,3 GiB y acelera la decodificación aproximadamente 2,2 veces.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5: torre visual Qwen3-VL + modelo de lenguaje híbrido de 32 capas; cabezas de tarea (slots E/J, embedding head, decision head, MGVB) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 nativo; cuantización de capas lineales en carga a 4 u 8 bits (`--quantize-bits`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX (3 shards de backbone + `task_modules.safetensors`); existe release GGUF del modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 como backbone: una torre visual Qwen3-VL para el procesamiento de imágenes y un modelo de lenguaje híbrido de 32 capas. Sobre ese backbone se añaden módulos de tarea empaquetados en `task_modules.safetensors`: slots E/J, una cabeza de embedding, una cabeza de decisión y los parámetros del cuello de botella visual MGVB. La conversión a MLX es puramente de layout: renombra claves al árbol de módulos MLX (`vision_tower.*`, `language_model.model.*`), reordena la `conv1d` depthwise de `[out, 1, kernel]` a `[out, kernel, 1]`, pasa el patch embedding Conv3d de `NCDHW` a `NDHWC` y almacena las ganancias de RMSNorm como `weight` en lugar de la forma delta `weight - 1`. El preprocesado de imagen de Qwen3-VL (`smart_resize` + patchify) y el cuello de botella visual MGVB se reimplementan en numpy/PIL/MLX.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card menciona una plantilla de chat de entrenamiento (`chat_template.jinja`) y un contrato de arquitectura `task_slots_v1` idéntico al release original. Como innovaciones técnicas destacables figuran la decodificación sin slots (slotless decoding) para generación, el embedding con truncación MRL y la formulación de decisión estructurada JEV con tres modos: elección entre criterios, puntuación ordinal y probabilidad binaria.

## Capacidades

- Generación de texto a partir de texto, de una sola imagen o de contenido intercalado imagen/texto (OCR, captioning, VQA, chat conversacional).
- Decodificación sin slots para generación libre.
- Embedding multimodal: codifica texto e imágenes en vectores L2-normalizados para recuperación y ranking de candidatos, con dimensión completa 2.048 y truncación MRL a 64/128/256/512/1024.
- Decisión estructurada sobre estado de aplicación: modo `choice` (selección entre criterios), `score` (puntuación ordinal sobre una lista ordenada) y `noul` (probabilidad de sí/verdadero, juicio JEV).
- Procesamiento de imágenes integrado en el runtime MLX sin toolchain de vídeo ni PyTorch.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo de decisión estructurada puede emplearse como componente de sistemas con estado.

## Casos de uso

- Búsqueda visual y recuperación multimodal en local: usar la tarea `embed` para indexar imágenes y texto en vectores de 2.048 dimensiones (o truncados por MRL a 256/512/1024) y alimentar un índice vectorial en el propio Mac, sin enviar datos a la nube.
- Descripción automática y OCR de documentos o capturas: la tarea `generate` acepta una imagen y un prompt para producir captions o extraer texto, útil en flujos de digitalización con requisitos de privacidad.
- Asistente conversacional con imágenes intercaladas: mediante `content.json` se envían secuencias de imágenes y texto para conversaciones multi-turno con contexto visual, adecuado para aplicaciones de escritorio en Apple Silicon.
- Enrutamiento y decisión en agentes: el modo `choice` evalúa el estado de la aplicación y las preguntas para devolver la siguiente acción entre criterios definidos (por ejemplo, llamar, mostrar menú o ignorar), lo que permite construir máquinas de estado sin un LLM generativo adicional.
- Puntuación ordinal de candidatos: el modo `score` ordena descripciones según criterios, aplicable a ranking de respuestas, priorización de tickets o selección de resultados de búsqueda.
- Clasificación binaria de condiciones: el modo `noul` devuelve la probabilidad de sí/verdadero sobre el estado, útil para guardarraíles, moderación o comprobaciones de elegibilidad en pipelines locales.
- Prototipado on-device en investigación: el runtime autocontenido y la cuantización a 4 bits (pico de 4,3 GiB) permiten experimentar con un modelo multimodal de 4B en portátiles Mac sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/pico de memoria: 8,99 GiB medidos en bf16; 9,0 GiB de pesos en disco (unos 9,1 GB de repo). Con `--quantize-bits 4` el pico baja a 4,3 GiB; con 8 bits, valor no disponible.
- GPU: exclusivamente Apple Silicon (GPU integrada de los chips Apple); el runtime MLX no soporta CUDA ni ROCm.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon; requiere macOS compatible con la wheel de MLX fijada en `requirements.txt`. El pico de 9 GiB en bf16 exige equipos con memoria unificada suficiente; con cuantización a 4 bits (4,3 GiB) el margen es amplio.
- Opciones de despliegue: runtime propio `wepm_mlx` con CLI `runtime/infer_mlx.py` y API Python `WePMRuntime`; ecosistema MLX (`mlx`, `mlx-vlm`); el modelo base dispone de release GGUF para otras rutas.
- Latencia y throughput: la cuantización a 4 bits acelera la decodificación aproximadamente 2,2 veces respecto a bf16; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WePocketModel 1.0 4B MLX | 4.539.265.536 | no disponible | Generación multimodal, embedding MRL, decisión estructurada | Apache 2.0 | MLX (Apple Silicon); base en safetensors y GGUF |
| WePocketModel 1.0 4B (base) | 4.539.265.536 | no disponible | Las mismas tres familias | Apache 2.0 | safetensors y GGUF |
| WePocketModel 1.0 2B MLX | no disponible | no disponible | Las mismas tres familias | Apache 2.0 | MLX |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de otras familias; la comparación se limita a las variantes del propio modelo publicadas por Tencent.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo multimodal entrenado con datos no documentados, no puede descartarse sesgo visual o textual.
- Riesgo de alucinación: presente en la tarea de generación, como en cualquier modelo de lenguaje; la model card no documenta tasas de error ni evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican, lo que impide garantizar un comportamiento multilingüe o conversaciones de largo alcance.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; conviene revisar las condiciones del modelo base Qwen3.5 subyacente.
- Dependencia de plataforma: el runtime MLX solo funciona en Apple Silicon con la versión de macOS soportada por la wheel fijada; no hay soporte CUDA.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y la model card está truncada en la información disponible, por lo que faltan detalles sobre evaluación y paridad numérica con el release original.
- Decisión estructurada: los modos `score` y `noul` exigen `state` e `instructions` no vacíos; el modo `noul` no admite `criteria`, lo que restringe su uso a juicios binarios.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/tencent/WePocketModel1.0-4B-MLX
- Hugging Face (4B safetensors): https://huggingface.co/tencent/WePocketModel1.0-4B
- Hugging Face (4B GGUF): https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Hugging Face (2B MLX): https://huggingface.co/tencent/WePocketModel1.0-2B-MLX
- GitHub: https://github.com/Tencent/WePocketModel
- MLX: https://github.com/ml-explore/mlx
- Paper: https://arxiv.org/abs/2611.27365
