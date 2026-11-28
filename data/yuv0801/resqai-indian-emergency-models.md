# Yuv0801/resqai-indian-emergency-models

## Resumen

ResQAI Indian Emergency Models es un paquete de despliegue en CPU publicado por el usuario Yuv0801 para la plataforma de respuesta a emergencias ResQAI / SENTINELGRID, orientada al contexto indio. No se trata de un unico modelo de lenguaje, sino de un bundle de cuatro componentes especializados: un clasificador de texto de emergencias (fine-tune de `google/muril-base-cased` en ONNX FP32), un transcriptor de voz basado en `Systran/faster-whisper-small` en CTranslate2 INT8, un emparejador de duplicados de incidentes (fine-tune de `intfloat/multilingual-e5-small` en ONNX INT8) y un detector de vision (fine-tune de `fcos_resnet50_fpn` en ONNX FP32) para humo y llama activa.

El objetivo es cubrir el pipeline completo de una centralita de emergencias: recibir audio (llamadas), transcribirlo, clasificar el texto por tipo y urgencia, deduplicar incidentes repetidos y analizar imagenes asociadas. El enfasis en ONNX y CTranslate2 INT8 indica que el autor prioriza inferencia en CPU sin GPU, algo relevante para despliegues en infraestructura modesta o en el borde.

La relevancia actual es acotada: el repositorio tiene cero descargas y cero likes, no declara pipeline en Hugging Face y la model card es muy breve. No se han publicado metricas, tamanos de contexto, detalles del dataset de fine-tune ni resultados de benchmarks, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de 4 modelos: MURIL-base (transformer encoder) para texto; Faster-Whisper small (encoder-decoder) para voz; multilingual-e5-small (transformer encoder) para deduplicacion; FCOS ResNet-50 FPN (detector one-stage) para vision |
| Parametros totales | no disponible (MURIL-base ~ 236 M; faster-whisper-small ~ 244 M; multilingual-e5-small ~ 118 M; FCOS ResNet-50 FPN ~ 32 M de backbone + cabeza; cifras orientativas de los modelos base, no confirmadas por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (MURIL-base soporta hasta 512 tokens; faster-whisper-small, ventanas de 30 s; e5-small, 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | ONNX FP32 (clasificador y vision), ONNX INT8 (deduplicador), CTranslate2 INT8 (transcriptor) |
| Idiomas soportados | Ingles, hindi en devanagari y hinglish romanizado (segun la model card); no se detallan mas idiomas |
| Licencia | Apache-2.0 (el bundle); componentes base con licencias MIT (faster-whisper, e5) y BSD-3-Clause (torchvision FCOS) |
| Formato de pesos | ONNX (`model_fp32.onnx`, `model_int8.onnx`) y CTranslate2 (`model.bin`) |

## Arquitectura y entrenamiento

El bundle combina cuatro arquitecturas independientes. El clasificador de texto parte de `google/muril-base-cased`, un transformer encoder multilingue disenado para lenguas indias, afinado para clasificacion de emergencias y calibracion de urgencia en ingles, hindi y hinglish. El transcriptor es un fine-tune de `Systran/faster-whisper-small` convertido a CTranslate2 INT8, con un prompt de vocabulario especifico de emergencias indias y de Bhopal recogido en `whisper_config.json`. El deduplicador emplea `intfloat/multilingual-e5-small` en ONNX INT8 para generar embeddings bilingues y detectar incidentes repetidos. El detector de vision es un `fcos_resnet50_fpn` de torchvision afinado para dos clases: `smoke_plume` y `active_flame`.

No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni detalles de aumentacion de datos. Tampoco se documentan innovaciones tecnicas mas alla de la eleccion de formatos de inferencia (ONNX y CTranslate2) y la cuantizacion INT8 en dos de los cuatro componentes.

## Capacidades

- Clasificacion de texto de emergencias en ingles, hindi (devanagari) y hinglish romanizado, con calibracion de urgencia.
- Transcripcion de audio a texto con vocabulario especializado de emergencias indias (faster-whisper-small fine-tune).
- Deduplicacion bilingue de incidentes mediante embeddings (multilingual-e5-small fine-tune).
- Deteccion de objetos visuales en imagenes: penachos de humo (`smoke_plume`) y llama activa (`active_flame`).
- Inferencia en CPU gracias a ONNX y CTranslate2, sin dependencia de GPU.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning ni thinking mode.
- No se documenta soporte multimodal unificado: vision, voz y texto son componentes separados.

## Casos de uso

- Centralita de emergencias (112/108 en India): el clasificador de texto etiqueta la llamada transcrita por tipo de incidente y nivel de urgencia, permitiendo priorizar la cola de despacho.
- Transcripcion de llamadas en tiempo real: el componente faster-whisper-small en INT8 puede ejecutarse en CPU en servidores modestos, transcribiendo audio de emergencias con vocabulario local (toponimos de Bhopal, terminos en hinglish).
- Deduplicacion de incidentes: cuando varias llamadas reportan el mismo suceso, el emparejador e5-small calcula similitud entre descripciones en ingles y hindi para agrupar reportes y evitar duplicar recursos.
- Analisis de imagenes enviadas por ciudadanos: el detector FCOS identifica humo o llama en fotos, lo que permite triar reportes visuales antes de enviar bomberos.
- Despliegue en el borde o en infraestructura sin GPU: al usar ONNX y CTranslate2, el bundle puede ejecutarse en servidores CPU o dispositivos con recursos limitados, util en comisarías o centros de coordinacion locales.
- Prototipado de pipelines de emergencia multilingues: sirve como base para experimentar con clasificacion, ASR y deduplicacion en contextos indios antes de invertir en modelos mayores.
- Monitorizacion de incendios forestales o urbanos a partir de reportes ciudadanos (texto + imagen) combinando el clasificador y el detector visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el escenario previsto; el bundle esta disenado para inferencia en CPU.
- RAM estimada: el repo ocupa 2,0 GB, por lo que se recomienda al menos 4 GB de RAM libre para cargar los cuatro componentes simultaneamente; no confirmado por el autor.
- GPU recomendadas: no disponibles; el autor no documenta requisitos de GPU. Cualquier GPU con soporte CUDA/ROCm podria acelerar los componentes ONNX y CTranslate2, pero no se aportan cifras.
- Compatibilidad con GPU de consumo: no documentada. Los modelos base son pequenos (MURIL-base, whisper-small, e5-small, FCOS ResNet-50), por lo que en teoria cabrian en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmacion.
- Opciones de despliegue: ONNX Runtime (componentes ONNX), CTranslate2 / faster-whisper (transcriptor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResQAI Indian Emergency Models (bundle) | Clasificacion + ASR + deduplicacion + vision | no disponible (componentes de ~ 32-244 M) | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| `google/muril-base-cased` | Encoder multilingue para lenguas indias | ~ 236 M | 512 tokens | Apache-2.0 | Hugging Face, ampliamente usado |
| `Systran/faster-whisper-small` | ASR | ~ 244 M | ventanas de 30 s | MIT | Hugging Face, ampliamente usado |
| `intfloat/multilingual-e5-small` | Embeddings multilingues | ~ 118 M | 512 tokens | MIT | Hugging Face, ampliamente usado |

Los tres modelos base son los componentes del bundle; la comparativa con alternativas especializadas en emergencias indias no esta disponible porque no se conocen bundles publicos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Sin metricas publicadas: no hay benchmarks, evaluacion de calidad ni tasas de error documentadas para ningun componente.
- Cero adopcion: 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en produccion ni validacion externa.
- Model card muy escasa: no se detallan datos de entrenamiento, composicion del dataset, proceso de anotacion ni evaluacion de sesgos.
- Riesgo de alucinacion y errores de clasificacion: al ser modelos pequenos fine-tuneados, la precision en casos limite (emergencias ambiguas, ruido en audio, imagenes de baja calidad) no esta cuantificada.
- Cobertura limitada de idiomas: solo ingles, hindi y hinglish segun la model card; otras lenguas indias no estan cubiertas.
- Dependencia de vocabulario local: el prompt de whisper esta orientado a Bhopal y emergencias indias, lo que puede degradar la transcripcion fuera de ese contexto.
- Licencia Apache-2.0 en el bundle, pero los componentes base tienen licencias MIT y BSD-3-Clause; conviene revisar la compatibilidad en un uso comercial combinado.
- No apto para decisiones criticas sin supervision humana: un sistema de despacho de emergencias requiere validacion y redundancia; este bundle no documenta garantias de robustez.
- Fecha de creacion futura (2026-11-28): la marca temporal del repositorio es posterior a la fecha actual, lo que sugiere metadatos no fiables o un artefacto de publicacion.

## Enlaces

- Hugging Face: https://huggingface.co/Yuv0801/resqai-indian-emergency-models
- `google/muril-base-cased`: https://huggingface.co/google/muril-base-cased
- `Systran/faster-whisper-small`: https://huggingface.co/Systran/faster-whisper-small
- `intfloat/multilingual-e5-small`: https://huggingface.co/intfloat/multilingual-e5-small
- FCOS (torchvision): https://pytorch.org/vision/stable/models/fcos.html
