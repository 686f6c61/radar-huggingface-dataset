# Vhh5/gemma-4-e2b-uncensored-litertlm

## Resumen

Gemma 4 E2B Uncensored-MAX LiteRT-LM es una conversión al formato `.litertlm` del modelo `prithivMLmods/gemma-4-E2B-it-Uncensored-MAX`, un ajuste fino comunitario del Gemma 4 E2B instruction-tuned de Google. El paquete lo publica el usuario Vhh5 y está pensado para ejecución completamente offline en dispositivos Android, Pixel y hardware con GPU Google Tensor o Mali, mediante el runtime LiteRT-LM de Google AI Edge.

El modelo conserva únicamente la torre de texto: los pesos de visión y audio del Gemma 4 original se han eliminado para reducir el bundle a 2,37 GB. La arquitectura es un transformer denso de 35 capas con Per-Layer Embeddings (PLE), 2,3B parámetros efectivos (5,1B totales contando PLE) y una ventana de contexto de 32.768 tokens. Los pesos del decodificador, el embedder y el per-layer embedder se cuantizan a INT4 con la receta `dynamic_wi4_afp32`.

Su relevancia radica en que demuestra el pipeline público de exportación de `litert-torch` para llevar modelos de la familia Gemma a móvil sin depender de las herramientas internas de Google, aunque con penalizaciones conocidas en el tamaño de los pesos PLE y en la precisión respecto a INT8. Es un artefacto de despliegue, no un modelo nuevo: hereda el comportamiento del ajuste fino "uncensored" del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 35 capas, Per-Layer Embeddings (PLE) |
| Parametros totales | 5,1B (incluyendo PLE) |
| Parametros activos | No aplica (modelo denso); 2,3B efectivos |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | INT4 (`dynamic_wi4_afp32`); pesos empaquetados en `.litertlm` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM con `model.tflite`, `embedder.tflite` y `per_layer_embedder.tflite`) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer denso de 35 capas con 2,3B parámetros efectivos y 5,1B totales gracias al esquema Per-Layer Embeddings, que externaliza parte de la representación en un embedder por capa separado. El ajuste fino original (`prithivMLmods/gemma-4-E2B-it-Uncensored-MAX`) parte del checkpoint instruction-tuned de Google y lo afina sobre datasets adicionales para reducir el comportamiento de rechazo; no se dispone de detalles sobre el volumen de tokens, la composición del dataset ni si se empleó RLHF o DPO en ese ajuste.

La conversión a LiteRT-LM se realizó con la ruta pública `litert_torch.generative.export_hf` (litert-torch 0.9.1, torch 2.12.0+cu130, CUDA 13.0) sobre una A100 de 80 GB, con un tiempo de exportación de unos 12 minutos. Se externalizó el embedder (`externalize_embedder=True`), se usó un embedder de token único y `cache_length=32000` con `prefill_lengths=[256]`. Del modelo multimodal original solo se retuvieron los safetensors `model.language_model.*`; se eliminaron las claves `vision_config`, `audio_config` y los tokens especiales `image_token_id`, `audio_token_id`, `video_token_id`, `boi_token_id` y `eoi_token_id`.

## Capacidades

- Generación de texto conversacional en inglés con ventana de 32K tokens.
- Modo "thinking" habilitado (`llmSupportThinking: true` en la configuración de integración), útil para cadenas de razonamiento multi-paso.
- Comportamiento "uncensored": el ajuste fino reduce los rechazos ante peticiones que los modelos alineados estándar bloquearían.
- Soporte de plantilla Jinja del modelo fuente para el formateo de conversaciones.
- Ejecución completamente offline en dispositivo, sin envío de datos a servidores externos.
- Sin capacidades de visión ni audio: los pesos multimodales fueron eliminados del bundle.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Asistentes de chat offline en Android: integración en Google AI Edge Gallery o forks compatibles para conversaciones multi-turno sin conexión, aprovechando los 32K tokens de contexto para hilos largos.
- Procesamiento de documentos sensibles en el dispositivo: resumen y extracción de información de textos de hasta ~32.000 tokens sin que los datos abandonen el terminal, adecuado para entornos con requisitos de privacidad estrictos.
- Aplicaciones de campo sin conectividad: asistentes para técnicos o personal en ubicaciones sin red, donde el bundle de 2,37 GB se descarga una vez por WiFi y opera después de forma local.
- Prototipado de agentes móviles: uso del modo thinking para tareas de razonamiento multi-paso en apps Android experimentales, con `maxTokens` configurable (4.000 por defecto en la configuración de ejemplo).
- Investigación sobre alineación y filtrado: análisis de las diferencias de comportamiento entre el checkpoint oficial de Google y este ajuste "uncensored" re-cuantizado, útil para estudiar cómo el fine-tuning y la cuantización INT4 afectan a los rechazos.
- Generación de texto creativo sin restricciones de contenido en local: escritura asistida, guiones o ficción donde el modelo alineado estándar aplicaría filtros, ejecutándose íntegramente en el dispositivo.
- Integración en apps Android propias mediante `model_allowlist.json`, declarando aceleradores `gpu,npu,cpu` para aprovechar Tensor o Mali.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: bundle de 2,37 GB (2.550.041.824 bytes según la configuración de integración); el repositorio completo ocupa 7,7 GB.
- Memoria: no se especifica la RAM mínima; el diseño apunta a ejecución en dispositivos Android de gama alta con GPU Tensor o Mali.
- Aceleradores soportados: `gpu,npu,cpu` según la configuración de ejemplo del autor.
- Hardware de referencia para la exportación: A100 de 80 GB (solo para la conversión, no para inferencia).
- Despliegue: LiteRT-LM (CLI con `pip install litert-lm`, backend GPU) y Google AI Edge Gallery en Android.
- Latencia y throughput: no disponibles en la información proporcionada.
- No está pensado para servidores con vLLM, TGI o llama.cpp: el formato `.litertlm` es específico del runtime LiteRT-LM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Formato | Licencia |
|---|---|---|---|---|---|
| Gemma 4 E2B Uncensored-MAX LiteRT-LM (este) | 2,3B efectivos / 5,1B totales | 32.768 | Texto | `.litertlm` INT4 | Apache 2.0 |
| `prithivMLmods/gemma-4-E2B-it-Uncensored-MAX` (base) | 2,3B efectivos / 5,1B totales | No disponible | Texto, visión, audio (modelo fuente completo) | Safetensors | No disponible |
| `google/gemma-4-E2B-it` (oficial) | 2,3B efectivos / 5,1B totales | No disponible | Texto, visión, audio | Safetensors | Términos de Gemma |

El modelo oficial de Google ofrece el bundle móvil de 2,41 GB con compresión PLE propietaria, frente a los ~1,1 GB de pesos PLE de esta exportación comunitaria; la diferencia de tamaño es una limitación conocida del pipeline público. No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- El ajuste "uncensored" reduce los filtros de seguridad: puede generar contenido que los modelos alineados rechazarían; requiere revisión humana en producción.
- Riesgo de alucinación inherente a todos los modelos de pesos abiertos; el autor recomienda no usar el modelo para decisiones de alto impacto sin supervisión.
- La cuantización INT4 (`dynamic_wi4_afp32`) ofrece menor precisión que INT8; las cadenas de razonamiento largas pueden degradarse.
- Los pesos PLE de esta exportación son aproximadamente el doble de grandes que los del bundle oficial de Google (~1,1 GB frente a ~0,6 GB) por limitaciones de la ruta pública de `litert-torch`.
- Sin visión ni audio: si se necesita multimodalidad hay que recurrir a `google/gemma-4-E2B-it` o a una exportación comunitaria con pesos completos.
- Solo inglés: no se documenta soporte de otros idiomas.
- La plantilla de chat Jinja proviene del modelo fuente; si la API de Conversation falla, el autor indica usar la Session API en crudo.
- Es una build comunitaria no oficial: las salidas pueden diferir del checkpoint de Google por el fine-tuning y la re-cuantización.
- Licencia Apache 2.0 declarada en el repositorio, pero el modelo base deriva de Gemma, cuyos términos de uso conviene verificar para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria significativa.

## Enlaces

- [HuggingFace: Vhh5/gemma-4-e2b-uncensored-litertlm](https://huggingface.co/Vhh5/gemma-4-e2b-uncensored-litertlm)
- [Modelo base: prithivMLmods/gemma-4-E2B-it-Uncensored-MAX](https://huggingface.co/prithivMLmods/gemma-4-E2B-it-Uncensored-MAX)
- [LiteRT-LM (Google AI Edge)](https://github.com/google-ai-edge/LiteRT-LM)
- [Lethflow (autor del empaquetado)](https://lethflow.com)
