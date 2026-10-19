# znasif/embeddinggemma-2-qnn-v69

## Resumen

`znasif/embeddinggemma-2-qnn-v69` es un paquete de exportación para ExecuTorch y la NPU Hexagon V69 de Qualcomm, no un modelo entrenado desde cero. Convierte el modelo multimodal de embeddings `google/embeddinggemma-2` —740 M de parámetros, arquitectura decoder de Gemma 4 y espacio de embedding unificado de 768 dimensiones— en ficheros `.pte` ejecutables con el backend QNN, e incluye además `openai/whisper-base.en` para transcripción de voz.

El problema que resuelve es el despliegue local de embeddings multimodales en el visor Samsung Galaxy XR, basado en Snapdragon XR2+ Gen 2 (SoC SXR2230P) y NPU Hexagon V69. La exportación está bajada a FP16 con QAIRT 2.46.0, no tiene operaciones de fallback a CPU y cubre texto, imagen y audio, con latencias medidas en dispositivo de 50 a 776 ms según el codificador.

Es relevante para desarrolladores que necesitan búsqueda semántica y recuperación multimodal sin nube en hardware XR. El paquete incluye un servidor nativo `npu_server` y está pensado para la aplicación `xr-panosearch`; la licencia de los derivados de EmbeddingGemma 2 es Apache-2.0, mientras que el runtime QNN de Qualcomm se distribuye aparte con su propia licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Gemma 4 para embeddings; torre de visión y torre de audio; Whisper base.en encoder-decoder para ASR |
| Parámetros totales | 740 M del modelo base `google/embeddinggemma-2`; el repositorio exportado no declara un recuento propio |
| Longitud de contexto | Texto: 512 tokens en la variante S512 y 128 tokens en S128; audio: hasta 11,2 s; visión: 280 tokens suaves por imagen |
| Tipos de cuantización | FP16 en el backend QNN; tabla de embeddings de tokens en FP16; no se documentan GGUF, INT8 ni otras variantes en este repositorio |
| Idiomas soportados | No disponible para EmbeddingGemma 2; el componente Whisper base.en es específico de inglés |
| Licencia | Apache-2.0 para los derivados de EmbeddingGemma 2; MIT para Whisper; BSD-3-Clause para ExecuTorch; runtime QNN bajo licencia de Qualcomm |
| Formato de pesos | ExecuTorch `.pte` con delegado QNN; tablas `.bin` FP16; filtros `.f32`; librería `.so` arm64; `tokenizer.json`; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base se describe como un modelo de embeddings multimodales de menos de 1.000 M de parámetros, construido sobre la arquitectura decoder de Gemma 4 y con salida en un espacio unificado de 768 dimensiones. La exportación separa el sistema en un backbone de texto, una torre de visión con su proyección `embed_vision`, una torre de audio con `embed_audio` y un encoder-decoder Whisper base.en para reconocimiento de voz. El backbone de texto consume `inputs_embeds` de forma `[1,128,512]` o `[1,512,512]` y devuelve un vector L2-normalizado de `[1,768]`; la tabla de embeddings de tokens se aplica en la parte CPU con un factor de escala de 22,627417.

La exportación se ha realizado con QAIRT 2.46.0, en FP16 y para el HTP V69, con cero operaciones de fallback a CPU. Una innovación técnica destacable es el reescalado exacto de la entrada de cada RMSNorm antes de elevar al cuadrado: el FP16 convencional desborda en esa operación porque las activaciones pueden alcanzar valores absolutos de aproximadamente 2.200. En texto se reescala por `max|x|`; en visión y audio se usan potencias de dos fijas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Genera embeddings L2-normalizados de 768 dimensiones para texto, imágenes y audio; el modelo base declara además código y vídeo, pero este paquete no incluye una torre de vídeo explícita.
- Permite recuperación multimodal y búsqueda semántica combinando consultas de texto con imágenes o audio en un mismo espacio vectorial.
- Incluye un backbone de texto con dos ventanas: 128 y 512 tokens, con latencias de 50 ms y 251 ms respectivamente en el HTP V69.
- Procesa imágenes en formato RGB `[1,3,672,960]` o `[1,3,960,672]` y las proyecta a 280 tokens suaves de 512 dimensiones.
- Procesa audio log-mel de 5 s o 11,2 s y lo proyecta a 125 o 280 tokens suaves de 512 dimensiones.
- Incluye Whisper base.en para transcripción de voz en inglés, con encoder de 99 ms y decoder de 9 ms por token.
- No es un modelo generativo de texto: no debe usarse para chat, completado de texto ni razonamiento autoregresivo general.
- No soporta tool calling ni function calling, y no incorpora capacidades de agente o razonamiento multi-paso.
- El soporte multilingüe del modelo base no está documentado en la información disponible; el componente ASR incluido está limitado al inglés.
- La precisión en dispositivo frente a PyTorch FP32 es muy alta: coseno mayor o igual que 0,999997 en texto y audio, y mayor o igual que 0,999984 en imagen; los rankings de recuperación fueron idénticos a FP32 en los conjuntos de prueba.

## Casos de uso

- **Búsqueda de panoramas y objetos en XR**: la torre de visión indexa capturas de 960×672 o 672×960 como vectores de 768 dimensiones, y una consulta de texto se compara por similitud coseno. Es adecuado porque la inferencia de imagen tarda 767-776 ms y se ejecuta localmente en la NPU del visor.
- **Recuperación multimodal de notas, imágenes y voz**: el sistema puede indexar notas de texto, capturas y grabaciones de audio en el mismo espacio de 768 dimensiones. La ventana de 512 tokens y el audio de hasta 11,2 s cubren consultas y fragmentos típicos sin salir del dispositivo.
- **Transcripción y búsqueda de audio en inglés**: Whisper base.en transcribe fragmentos de voz y la torre de audio genera embeddings para búsqueda posterior. Es útil para memorandos de voz o auditoría de grabaciones cortas, con 67 ms para 5 s y 213 ms para 11,2 s en la torre de audio.
- **Organización automática de galerías en el visor**: los embeddings de imagen permiten agrupar capturas similares, detectar duplicados cercanos y construir colecciones por similitud visual. La latencia subsegundo por imagen y la ausencia de fallback a CPU facilitan el procesado por lotes en segundo plano.
- **Asistencia contextual manos libres**: una consulta de texto y una imagen de la cámara del visor se convierten en embeddings para recuperar objetos, paneles o documentación relevante. El coste de 776 ms por imagen y 50-251 ms por texto es compatible con interacción por voz y mirada.
- **Deduplicación y control de calidad de contenido capturado**: la similitud coseno sobre vectores normalizados permite identificar imágenes o audios casi idénticos antes de subirlos o almacenarlos. Es adecuado para pipelines locales porque no requiere servicios externos ni conexión de red.
- **Prototipos de investigación en percepción multimodal on-device**: el paquete expone codificadores separados y metadatos de preprocesado, lo que permite evaluar recuperación texto-imagen-audio en hardware XR real. La fidelidad frente a FP32 superior a 0,99998 reduce la brecha entre prototipo y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval, GSM8K o MTEB en la información disponible. Al tratarse de un modelo de embeddings y no de generación, las métricas relevantes son latencia, fidelidad numérica y calidad de recuperación. Los datos publicados son los siguientes:

| Componente | Entrada | Salida | Latencia en V69 | Fidelidad frente a PyTorch FP32 |
|---|---|---|---|---|
| Texto S128 | `[1,128,512]` + máscara | `[1,768]` L2-normalizado | 50 ms | Coseno ≥ 0,999997 |
| Texto S512 | `[1,512,512]` + máscara | `[1,768]` L2-normalizado | 251 ms | Coseno ≥ 0,999997 |
| Visión landscape | RGB `[1,3,672,960]` en `[0,1]` | 280 tokens suaves `[1,280,512]` | 776 ms | Coseno ≥ 0,999984 |
| Visión portrait | RGB `[1,3,960,672]` en `[0,1]` | 280 tokens suaves `[1,280,512]` | 767 ms | Coseno ≥ 0,999984 |
| Audio 5 s | Log-mel `[1,500,128]` + máscara | 125 tokens suaves `[1,125,512]` | 67 ms | Coseno ≥ 0,999997 |
| Audio 11,2 s | Log-mel `[1,1120,128]` + máscara | 280 tokens suaves `[1,280,512]` | 213 ms | Coseno ≥ 0,999997 |
| Whisper encoder | Audio | Representación intermedia | 99 ms | No disponible |
| Whisper decoder | Tokens | Token de texto | 9 ms por token | No disponible |

Las latencias se midieron con el visor no puesto, en estado de reposo. Con el visor puesto, la NPU rinde aproximadamente 1,7 veces más lenta; la causa probable es que el seguimiento propio del visor comparte el DSP, aunque el autor indica que no está confirmado. No se dispone de datos de throughput agregado.

## Requisitos de hardware

- **VRAM estimada**: no disponible y no aplicable en el sentido convencional; el paquete está diseñado para la memoria compartida del SoC del visor, no para VRAM de GPU discreta.
- **GPU recomendadas**: ninguna. El paquete está limitado a la NPU Hexagon V69; no se documenta soporte para A100, H100, RTX 4090 ni otras GPU.
- **Compatibilidad con GPU de consumo**: no. No es un modelo para `llama.cpp`, Ollama, vLLM o TGI en GPU convencional.
- **Hardware objetivo**: Samsung Galaxy XR con Snapdragon XR2+ Gen 2, SoC SXR2230P y Hexagon V69.
- **Almacenamiento**: el repositorio ocupa 3,0 GB; las librerías del runtime QNN (`libQnnHtp*.so`, `libQnnSystem.so`) no están incluidas y deben obtenerse aparte desde Maven Central.
- **Opciones de despliegue**: servidor nativo `npu_server` para Android arm64, delegado QNN de ExecuTorch y script `tools/setup_device.sh` de `xr-panosearch`, que descarga el repositorio y copia `npu/` a `/data/local/tmp/npu/` en el visor.
- **Latencia**: 50 ms para texto de 128 tokens, 251 ms para 512 tokens, 767-776 ms por imagen, 67 ms para audio de 5 s, 213 ms para audio de 11,2 s, 99 ms para el encoder de Whisper y 9 ms por token en el decoder.
- **Throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `znasif/embeddinggemma-2-qnn-v69` | Exportación QNN de embeddings multimodales y ASR para Hexagon V69 | 740 M del modelo base | Texto 512 tokens; audio 11,2 s; visión 280 tokens suaves | Latencias de 50-776 ms; coseno ≥ 0,999984 frente a FP32 | Apache-2.0, MIT y BSD-3-Clause; runtime QNN propietario | Hugging Face; runtime QNN aparte |
| `google/embeddinggemma-2` | Modelo base de embeddings multimodales | 740 M | No disponible | No disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| `openai/whisper-base.en` | ASR específico de inglés | No disponible | No disponible | 99 ms de encoder y 9 ms por token de decoder en esta exportación | MIT | Hugging Face; incluido en el paquete |

No se dispone de resultados MTEB ni de comparativas directas con otros modelos de embeddings del mismo tamaño en la información proporcionada. La comparación principal es frente al modelo base sin optimizar y frente al componente ASR incluido.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, completado de texto, razonamiento conversacional ni agentes.
- No soporta tool calling ni function calling.
- Está atado a la NPU Hexagon V69 y al SoC SXR2230P; no funciona en GPU convencional ni en CPU genérica como sustituto práctico.
- Las librerías QNN de Qualcomm no se incluyen y tienen su propia licencia, distinta de Apache-2.0 y MIT.
- El FP16 convencional desborda en RMSNorm; la exportación aplica reescalados exactos. Alterar el preprocesado o el grafo puede romper esa corrección numérica.
- Las imágenes deben redimensionarse a 960×672 o 672×960 con bicúbica con antialiasing, al estilo `BICUBIC` de PIL. El uso de bilineal o area puede costar hasta 0,035 de coseno en texto fino.
- La ventana de texto está limitada a 512 tokens y el audio a 11,2 s; no se documenta una torre de vídeo explícita en este paquete.
- El componente Whisper base.en está limitado al inglés; no se dispone de datos sobre el soporte multilingüe de EmbeddingGemma 2.
- No se han publicado evaluaciones de sesgos, equidad o robustez adversarial para esta exportación.
- El riesgo de alucinación no aplica del mismo modo porque no genera texto, pero la recuperación por similitud puede devolver coincidencias falsas o poco relevantes.
- La latencia empeora aproximadamente 1,7 veces con el visor puesto; la causa no está confirmada.
- No se dispone de benchmarks MTEB ni de comparaciones estandarizadas con otros modelos de embeddings.

## Enlaces

- [Modelo en Hugging Face: znasif/embeddinggemma-2-qnn-v69](https://huggingface.co/znasif/embeddinggemma-2-qnn-v69)
- [Modelo base: google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [Anuncio de EmbeddingGemma 2 en el blog de Google](https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/)
- [EmbeddingGemma en Google DeepMind](https://deepmind.google/models/gemma/embeddinggemma/)
- [Guía para desarrolladores de EmbeddingGemma 2](https://developers.googleblog.com/embeddinggemma-2-the-developer-guide/)
- [Documentación de EmbeddingGemma en Google AI](https://ai.google.dev/gemma/docs/embeddinggemma)
- [Repositorio xr-panosearch](https://github.com/Znasif/xr-panosearch)
- [Runtime QNN 2.46.0 en Maven Central](https://repo1.maven.org/maven2/com/qualcomm/qti/qnn-runtime/2.46.0/)
