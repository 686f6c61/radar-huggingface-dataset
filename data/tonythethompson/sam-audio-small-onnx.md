# tonythethompson/sam-audio-small-onnx

## Resumen

SAM-Audio small ONNX es una exportación a formato ONNX del modelo `facebook/sam-audio-small` de Meta, orientada a la separación de fuentes de audio mediante un prompt de texto fijo (`"speech"`). El repositorio lo publica el usuario `tonythethompson` como trabajo derivado bajo la SAM License y su propósito es ofrecer una vía de inferencia portable (runtime ONNX, sin dependencia de PyTorch) para separar la voz del resto de la mezcla en ficheros de audio de 48 kHz.

La exportación cubre únicamente el flujo de audio con prompt textual: codificador de códec, codificador de texto T5-base, un paso de evaluación del ODE del DiT y decodificador de códec. Quedan fuera del alcance el prompting por vídeo, la predicción de spans y el reranking del modelo original. El resultado son cuatro grafos ONNX más un vector de prompt precalculado, con un tamaño total de repositorio de 2,9 GB.

Es relevante porque permite ejecutar un separador de audio prompt-based de Meta en entornos donde desplegar PyTorch es inviable (edge, servidores con ONNX Runtime, pipelines de audio en producción), a cambio de perder flexibilidad en los prompts y en las modalidades soportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) sobre latentes de códec, con codificador de texto T5-base; exportado como grafo ONNX con integración ODE explícita |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio recomendada de 30 s con 5 s de solapamiento; sin límite de contexto textual más allá del T5-base |
| Tipos de cuantizacion | no disponible (los grafos se exportan en fp32; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (el prompt está fijado a `"speech"`, en inglés) |
| Licencia | SAM License (`license_name: sam-license`, `license: other`) |
| Formato de pesos | ONNX (opset 21) con ficheros `.onnx.data` externos; tokenizer T5 en carpeta `tokenizer/`; prompt precalculado en `prompt_speech.bin` (float32) |

## Arquitectura y entrenamiento

El modelo subyacente, `facebook/sam-audio-small`, es un separador de audio basado en difusión sobre un espacio latente de códec. La exportación ONNX divide el pipeline en cuatro grafos: un codificador de códec que convierte la forma de onda `[1,1,N]` (N múltiplo de 1920) en features `[1,T,128]`; un codificador de texto T5-base que produce embeddings `[B,L,768]`; un paso del DiT que evalúa la velocidad del ODE dados `noisy [B,T,256]`, `features [B,T,128]`, `text [B,L,768]` y `time [B]`; y un decodificador de códec que convierte `latent [1,T,256]` más un mensaje de marca de agua `[2,16]` en audio `[1,2,T*1920]` (fila 0 objetivo, fila 1 residual).

La inferencia se realiza muestreando `x ~ N(0,1)` de forma `[1,T,256]` con `T = ceil(samples/1920)` e integrando `dx/dt = dit_step(x, features, text, t)` de t=0 a 1 mediante la regla del punto medio explícito con 16 pasos iguales. El decodificador incorpora un mensaje de marca de agua de 16 bits que SAM-Audio sortea uniformemente al azar (`randint(0, 2, (2, 16))`) y que esta exportación preserva. El codificador y el decodificador tienen batch size 1. Los grafos se exportaron en fp32 con opset 21: encoder, DiT y text encoder mediante el exportador `torch.export`; el decodificador con el tracer de TorchScript, porque el nuevo exportador no puede trazar su LSTM. No se documentan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF/DPO.

## Capacidades

- Separación de fuentes de audio prompt-based: dado un audio de 48 kHz, extrae la pista objetivo y la residual.
- Prompt de texto fijo: solo admite el prompt `"speech"` (voz); no se exporta el codificador de texto para prompts arbitrarios en runtime, aunque se incluye el codificador T5-base y el tokenizer para recalcular prompts.
- Salida estéreo con marca de agua de 16 bits por canal (fila 0 objetivo, fila 1 residual).
- Procesamiento de audio largo mediante ventanas de 30 s con 5 s de solapamiento, según la recomendación de Meta.
- Inferencia portable vía ONNX Runtime (CPU y, presumiblemente, otros execution providers, aunque solo se verifica CPU).
- No soporta prompting por vídeo, predicción de spans ni reranking (fuera del alcance de la exportación).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de audio, no un LLM.
- Capacidades multilingües: no disponible; el prompt está fijado en inglés.

## Casos de uso

- Limpieza de pistas de voz en producción audiovisual: separar la locución del fondo musical o ruido ambiente en material grabado a 48 kHz, integrando los cuatro grafos ONNX en un pipeline de postproducción sin dependencia de PyTorch.
- Preprocesado para ASR en entornos ruidosos: aislar la pista de voz antes de pasarla a un sistema de reconocimiento de habla, usando la fila 0 (target) del decodificador como entrada limpia.
- Karaoke y remezcla: la fila 1 (residual) proporciona la instrumentación al eliminar la voz, útil para generar versiones instrumentales automáticas de canciones.
- Despliegue en edge o servidores sin GPU PyTorch: al ser ONNX, puede ejecutarse con ONNX Runtime en CPU o con execution providers alternativos, lo que facilita su integración en servicios ligeros.
- Moderación y análisis de contenido: separar la voz para su posterior transcripción y clasificación en pipelines de compliance, con ventanas de 30 s y solapamiento de 5 s para audio largo.
- Investigación en separación de audio: servir como referencia portable para reproducir la inferencia de SAM-Audio small con un ODE de 16 pasos y comparar resultados frente a la implementación PyTorch.
- Generación de datasets de voz limpia: procesar por lotes grabaciones de campo para construir corpus de habla aislada, siempre que el contenido sea mayoritariamente voz.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo de audio. El autor sí publica una verificación de fidelidad frente a la implementación PyTorch `SAMAudio.separate` en un único clip de 48 kHz, con ruido y mensaje de marca de agua idénticos, en CPU:

| Longitud | SNR objetivo | SNR residual | Diferencia absoluta máxima (target) |
|---|---|---|---|
| 10,0 s | 102 dB | 103 dB | 1,6e-5 |
| 3,2 s | 103 dB | 100 dB | 4,4e-6 |

Solo se comprobaron estas dos longitudes en un único clip. No se han publicado resultados de benchmarks de calidad de separación (SDR, SI-SNR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 2,9 GB en fp32 y la verificación se realizó en CPU, por lo que no se documenta el consumo en GPU.
- GPU recomendadas: no disponible; el autor no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; al ser ONNX fp32 y con batch size 1, es plausible que quepa en GPUs de consumo, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime (verificado con CPU execution provider); otros execution providers de ONNX Runtime no se documentan.
- Latencia y throughput: no disponibles; no se publican mediciones de tiempo por ventana ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tonythethompson/sam-audio-small-onnx | no disponible | 30 s con 5 s de solapamiento | SAM License | ONNX fp32 | Exportación parcial (solo audio, prompt `"speech"`) |
| facebook/sam-audio-small | no disponible | 30 s con 5 s de solapamiento | SAM License | PyTorch | Modelo original de Meta; soporta prompting por vídeo, spans y reranking |
| Otros separadores de audio prompt-based | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (SDR, SI-SNR) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Alcance reducido: solo separa con el prompt fijo `"speech"`; no hay prompting por vídeo, predicción de spans ni reranking.
- Prompt en inglés: el vector precalculado corresponde a `"speech"`; usar otros prompts requiere recalcular con el codificador T5-base incluido y verificar su calidad.
- Batch size 1 en codificador y decodificador, lo que limita el throughput en producción por lotes.
- Verificación limitada: solo dos longitudes en un único clip; no hay evidencia publicada de robustez en dominios diversos (música, ruido industrial, múltiples hablantes).
- Marca de agua aleatoria: el decodificador incorpora un mensaje de 16 bits sorteado al azar, lo que puede afectar a flujos que requieran determinismo bit a bit.
- Licencia SAM License: es una licencia distinta de las open source habituales; es necesario revisar sus términos antes de uso comercial, y el autor la califica como `license: other`.
- Riesgo de alucinación o artefactos: como modelo generativo de difusión, puede introducir artefactos o separar de forma imperfecta en mezclas complejas; no se documentan métricas de calidad.
- Idiomas: no disponible; no se especifica cobertura multilingüe.
- Sin mantenimiento ni tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por terceros.
- Dependencia de ficheros `.onnx.data` junto a los `.onnx`: un empaquetado incorrecto rompe la carga del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tonythethompson/sam-audio-small-onnx
- Modelo base: https://huggingface.co/facebook/sam-audio-small
- Script de exportación y verificación: `export_sam_audio_onnx.py`, `verify_sam_audio_onnx.py` (incluidos en el repositorio)
- Informe de verificación: `verify_report.json` (incluido en el repositorio)
- Configuración de inferencia: `sam_audio_onnx.json` (incluido en el repositorio)
- Licencia: `LICENSE` (SAM License, incluida en el repositorio)
