# XYETHER/SeedVR2-3B-Snapdragon-NPU

## Resumen

SeedVR2-3B-Snapdragon-NPU es una conversión de despliegue, no un modelo entrenado desde cero, del modelo de restauración de imagen y vídeo ByteDance-Seed/SeedVR2-3B. La desarrolla el usuario XYETHER y su objetivo es ejecutar el modelo de difusión de un solo paso de ByteDance en la NPU Hexagon de un SoC Qualcomm Snapdragon, mediante grafos ONNX estáticos y cuantización mixta. El repositorio contiene únicamente artefactos de inferencia: 32 bloques de transformer, un VAE de un solo fotograma y grafos de cabeza y cola con condicionamiento fijo.

La conversión parte del transformer original, exportado en 32 grafos ONNX estáticos de 256 tokens y cuantizado con pesos W4/W8 por grupos y activaciones A16; el VAE de imagen usa W8A16. La normalización RMS se reescribió con el operador SimplifiedLayerNormalization de ONNX Runtime para evitar inestabilidad de cuantización observada durante el proceso. Las formas estáticas son 256 tokens de vídeo, 58 tokens de texto y 2560 dimensiones ocultas.

Es relevante ahora porque demuestra la viabilidad de llevar un modelo de restauración de difusión de 3B parámetros a hardware móvil de gama alta, aunque de forma experimental y con soporte limitado a un único dispositivo probado (Snapdragon 8 Gen 2, SM8550, HTP v73, 8 GB de RAM). No incluye aplicación lista para usar, pipeline de tiles ni contextos QNN precompilados, por lo que su utilidad práctica inmediata es acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión de un solo paso (DiT) con VAE de imagen, exportado como grafos ONNX estáticos |
| Parametros totales | 3B (según el modelo base SeedVR2-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de vídeo, 58 tokens de texto, 2560 dimensiones ocultas (formas estáticas) |
| Tipos de cuantizacion | Transformer: W4/W8 por grupos con activaciones A16; VAE: W8A16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime), grafos divididos en `onnx/dit/`, `onnx/vae/` y `onnx/pipeline/` |

## Arquitectura y entrenamiento

El modelo base SeedVR2-3B es un modelo de restauración visual basado en difusión de un solo paso, entrenado con un esquema adversarial sobre datos reales, según la descripción del repositorio oficial de ByteDance. Esta conversión no reentrena ni ajusta el modelo: modifica únicamente el grafo para su despliegue. El transformer se divide en 32 grafos ONNX estáticos de 256 tokens, en orden de ejecución, y se cuantiza con pesos mixtos W4/W8 agrupados y activaciones A16. El VAE de un solo fotograma se cuantiza en W8A16.

La innovación técnica principal de la conversión es la reescritura de la normalización RMS mediante el operador SimplifiedLayerNormalization de ONNX Runtime, motivada por inestabilidad de cuantización observada. Los grafos de cabeza y cola incluyen condicionamiento fijo y los componentes de inferencia de un solo paso. Los grafos usan un operador específico de ONNX Runtime, por lo que no son un modelo ONNX general intercambiable y requieren un runtime compatible y código de soporte. Los hashes de los checkpoints origen (transformer `98669fd2...` y VAE `20678548...`) coinciden con los del repositorio Comfy-Org SeedVR2; esos hashes identifican los checkpoints fuente, no los ficheros convertidos.

## Capacidades

- Restauración de imagen de un solo fotograma: el pipeline está adaptado a inferencia de imagen estática, no a exportación general de vídeo.
- Mejora de resolución y calidad visual sobre entradas degradadas o de baja resolución, heredada del modelo base SeedVR2.
- Inferencia de un solo paso (one-step diffusion), lo que reduce el coste computacional frente a modelos de difusión multi-paso.
- Ejecución en NPU Hexagon mediante el execution provider QNN de ONNX Runtime, con fallback a CPU desactivado para los grafos de acelerador.
- Procesamiento por tiles con formas estáticas de 256 tokens de vídeo y 58 tokens de texto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de texto o audio.

## Casos de uso

- Restauración de fotografías en dispositivos móviles: el modelo puede mejorar imágenes degradadas directamente en la NPU de un Snapdragon, sin enviar datos a la nube, gracias a la conversión ONNX cuantizada y al execution provider QNN.
- Prototipado de pipelines de superresolución en Android: sirve como base para integrar restauración de imagen en aplicaciones Android experimentales, siempre que se generen los contextos QNN compatibles con el tooling de Qualcomm.
- Investigación sobre cuantización de modelos de difusión: los grafos W4/W8 con activaciones A16 y la fusión de normalización son un caso de estudio para evaluar estabilidad numérica en NPU.
- Evaluación de despliegue en hardware móvil: permite medir latencia y consumo en un Snapdragon 8 Gen 2; el autor reporta 267 segundos para una salida a resolución completa de 1992 × 2560 en un retrato.
- Restauración por tiles de imágenes grandes: la división en 32 bloques y el procesamiento por tiles permite abordar imágenes de alta resolución, con riesgo de costuras y cambios tonales entre tiles.
- Benchmarking de restauración visual: útil para comparar la calidad de la conversión cuantizada frente al modelo base en FP16/BF16, aunque el autor no aporta una afirmación cuantitativa sobre un dataset representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una medición puntual de latencia: 267 segundos para una salida a resolución completa de 1992 × 2560 en un retrato, en un Snapdragon 8 Gen 2 con 8 GB de RAM, sin establecer máximos de utilización del hardware.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 2,1 GB; el dispositivo probado dispone de 8 GB de RAM. No se especifica un requisito mínimo formal.
- GPU/NPU recomendadas: NPU Hexagon de Qualcomm Snapdragon 8 Gen 2 (SM8550, HTP v73). Otros dispositivos y runtimes no han sido probados.
- Cabe en GPU consumer: no aplica directamente; la conversión está orientada a NPU móvil, no a GPU de escritorio.
- Opciones de despliegue: ONNX Runtime 1.29.0 con ONNX Runtime QNN execution provider 2.7.0 y QAIRT 2.51.0. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 267 segundos por imagen a resolución completa en el dispositivo probado; el rendimiento varía según dimensiones de imagen, estado del dispositivo y condiciones térmicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeedVR2-3B-Snapdragon-NPU (esta conversion) | 3B | 256 tokens de vídeo, 58 de texto, 2560 dim. ocultas (estático) | ONNX cuantizado W4/W8-A16 | Apache-2.0 | Experimental, solo dispositivo probado |
| ByteDance-Seed/SeedVR2-3B (modelo base) | 3B | no disponible en la informacion proporcionada | safetensors (checkpoint original) | Apache-2.0 | Hugging Face y ModelScope |
| Comfy-Org/SeedVR2 | no disponible | no disponible | checkpoints para ComfyUI | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Conversión experimental y no oficial: no es un modelo nuevo y no incluye aplicación lista para usar, pipeline de tiles, runtime de NPU ni script de inferencia.
- Los contextos QNN precompilados específicos del SoC y las librerías de runtime de Qualcomm no están incluidos en esta release inicial; generarlos requiere el tooling de Qualcomm correspondiente y validación.
- Los grafos usan un operador específico de ONNX Runtime (SimplifiedLayerNormalization) y no son un modelo ONNX general intercambiable.
- Soporte limitado al dispositivo probado (Snapdragon 8 Gen 2); no se establece compatibilidad con otros Snapdragon ni con otros runtimes.
- El modelo puede producir costuras entre tiles, cambios tonales y detalles inventados o alterados; no hay afirmación cuantitativa de calidad sobre un dataset representativo.
- El modelo base está orientado a restauración; no todos los detalles generados reflejan la fuente original.
- Riesgo de sesgos y alucinación visual no evaluado en la informacion proporcionada.
- Idiomas soportados no disponibles; el condicionamiento de texto es fijo (58 tokens).
- La licencia Apache-2.0 cubre los grafos, pero cualquier runtime o SDK usado para ejecutarlos tiene sus propios términos.
- No se incluyen fotografías de usuarios ni imágenes de calibración en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XYETHER/SeedVR2-3B-Snapdragon-NPU
- Modelo base: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ByteDance-Seed/SeedVR2-3B
- Repositorio GitHub de SeedVR2: https://github.com/ByteDance-Seed/SeedVR
- ModelScope: https://www.modelscope.cn/models/bytedance-community/SeedVR2-3B
- Checkpoints para ComfyUI: https://huggingface.co/Comfy-Org/SeedVR2
