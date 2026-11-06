# xv0y5ncu/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-3bpw

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por NVIDIA, orientado a generación de texto, razonamiento y código. Esta ficha concreta es una cuantización de terceros publicada por el usuario `xv0y5ncu` bajo el método GLQ (trellis-coded quantization), que comprime los pesos del checkpoint BF16 original a 3.0 bits por peso manteniendo la decodificación en tiempo real mediante un kernel CUDA fusionado. El resultado es un repositorio de 15,7 GB que, según el autor, conserva un SQNR medio de pesos de 15,33 dB sobre 1298 capas cuantizadas.

La relevancia de esta variante radica en que permite ejecutar un modelo MoE con ventana de contexto declarada de 262.144 tokens en hardware más modesto, aprovechando que solo los expertos enrutados se leen por token. No obstante, es una cuantización no oficial: depende de la librería `glq` (versión mínima 0.8.32) y no funciona con el stack estándar de Transformers sin esa integración.

El modelo base emplea la arquitectura `nemotron_h` (híbrida, con capas Mamba y atención), y esta ficha declara soporte para inglés, español, francés, alemán, italiano y japonés. La licencia del modelo base es OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (híbrida, con capas Mamba y atención; MoE) |
| Parametros totales | 7.863.535.360 (según safetensors del checkpoint cuantizado); el modelo base se denomina 30B-A3B |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, sin confirmación en la información) |
| Longitud de contexto | 262.144 tokens (límite declarado por el autor) |
| Tipos de cuantizacion | GLQ 3.0 bits/peso (trellis-coded QTIP TCQ, variante `3inst`, + RHT + LDLQ) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (cuantizado, requiere kernel GLQ para decodificar) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de tipo `nemotron_h`: combina capas con mecanismo de atención y capas Mamba (modelos de espacio de estados), lo que reduce el coste de contexto largo frente a un transformer denso puro. La variante MoE enruta cada token a un subconjunto de expertos, de ahí que el nombre comercial indique 30B totales y ~3B activos (dato no confirmado en la información disponible).

El entrenamiento del modelo original lo realizó NVIDIA, con datasets de preentrenamiento y postentrenamiento propios (`nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`). No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO. Esta ficha cuantizada no reentrena el modelo: aplica cuantización post-entrenamiento con 128 muestras de calibración de 2048 tokens de WikiText-2, usando transformada de Hadamard aleatorizada (RHT) y LDLQ sobre un codebook trellis (QTIP TCQ). La innovación técnica principal es la decodificación al vuelo de pesos comprimidos mediante un kernel CUDA fusionado, sin apilar residuos (una sola pasada de decodificación a la tasa nativa del trellis).

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (en, es, fr, de, it, ja).
- Razonamiento con modo "thinking" activado por defecto: la plantilla de chat abre un bloque `<think>`.
- Generación de código (el autor distribuye un wrapper `glq-code` con parámetros de muestreo fijados en servidor: temperature 1.0, top_p 0.95).
- Capacidad de contexto largo: hasta 262.144 tokens declarados, con KV cache dimensionable en vLLM.
- Ejecución en modo MoE con offload selectivo de expertos a RAM del host, lo que permite servir el modelo en GPUs con menos VRAM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada (el modo thinking sugiere razonamiento interno, sin confirmación de agentes).
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Atención al cliente automatizada multilingüe: el modelo cubre seis idiomas y mantiene conversaciones multi-turno con contexto de hasta 262.144 tokens, suficiente para arrastrar historial de cliente, políticas y documentación en una sola ventana sin truncar.
- Asistencia de código en producción: el wrapper `glq-code` fija temperature y top_p, y el modelo puede integrarse en pipelines de generación de código con vLLM como servidor compatible con la API de OpenAI, aprovechando el modo thinking para tareas de depuración.
- Análisis de documentos largos: con 262k tokens de contexto se pueden procesar contratos, informes o expedientes completos en una sola pasada, útil en entornos legales o de auditoría.
- Despliegue en hardware limitado mediante offload de expertos: con `--cpu-offload-params experts` y `--cpu-offload-gb 24`, el modelo puede servirse en GPUs con menos VRAM que el checkpoint BF16 original, a costa de velocidad de decodificación.
- Razonamiento asistido con traza explícita: el bloque `<think>` permite auditar el razonamiento intermedio en tareas de matemáticas o lógica, útil en entornos educativos o de verificación.
- Prototipado e investigación en cuantización: al ser un checkpoint GLQ de referencia con métricas publicadas (SQNR 15,33 dB, 1298 capas), sirve para evaluar el impacto de 3 bpw frente al BF16 en tareas concretas.
- Servicio de inferencia con contexto largo y baja concurrencia: configurando `--max-num-seqs 1` y `--max-model-len 262144`, se puede ofrecer una ventana completa a un único usuario o flujo batch, derivando la concurrencia del tamaño del KV pool que reporta vLLM al arrancar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento numérico es el SQNR medio de pesos de 15,33 dB sobre 1298 capas cuantizadas, que mide fidelidad de cuantización, no calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,7 GB en disco; en VRAM, los pesos cuantizados a 3 bpw ocupan del orden de 3 GB para los 7.863.535.360 parámetros del checkpoint, más KV cache y buffers. El modelo base se denomina 30B, por lo que la cifra real de VRAM depende de cómo se materialicen los expertos.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del checkpoint y el soporte de vLLM con CUDA, cabría esperar GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090), pero el autor no lo especifica.
- ¿Cabe en consumer GPU?: probablemente sí con offload de expertos a RAM del host, pero no hay medición publicada para este checkpoint concreto. El autor indica que la receta de offload se midió en builds GLQ de Qwen MoE, no en este modelo.
- Opciones de despliegue: vLLM (recomendado, con plugin GLQ automático) y Transformers mediante `glq[hf]` con `device_map="auto"`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor advierte que subir `--cpu-offload-gb` libera VRAM a costa de velocidad de decodificación, sin cifras concretas.
- Requisitos de software: `glq >= 0.8.32`, dtype `bfloat16` obligatorio (en fp16 el modelo omite el razonamiento sin error ni NaN), y guard `if __name__ == "__main__":` al ejecutar scripts con vLLM por el método de arranque "spawn".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ 3bpw (esta ficha) | 7,86B en safetensors (base 30B-A3B) | 262.144 | GLQ 3.0 bpw | OpenMDW 1.1 | Hugging Face, requiere `glq >= 0.8.32` |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B-A3B (según nombre) | no disponible | BF16 | OpenMDW 1.1 | Hugging Face, oficial |
| Otras cuantizaciones GLQ de modelos MoE (p. ej. builds Qwen) | no disponible | no disponible | GLQ 2-4 bpw | según modelo base | Hugging Face, vía GLQ |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una cuantización no oficial de terceros; la calidad puede diferir del checkpoint BF16 original y no está validada por NVIDIA.
- Requiere `glq >= 0.8.32`: versiones anteriores cargan el checkpoint en vLLM y generan texto fluido pero incorrecto (la proyección de entrada de las capas Mamba se carga a ceros), y con Transformers estándar no cargan los expertos trellis.
- Obligatorio usar `bfloat16`: en fp16 el modelo cierra el bloque `<think>` de inmediato y responde sin razonar, sin error ni NaN, lo que degrada la calidad de forma silenciosa.
- El modo thinking está activado por defecto; hay que gestionar el bloque `<think>` en producción para no filtrar razonamiento interno al usuario final.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de idioma: solo se declaran seis idiomas; el rendimiento fuera de ellos no está garantizado.
- Restricciones de licencia: OpenMDW 1.1; conviene revisar los términos en el enlace oficial antes de uso comercial.
- El offload de expertos a RAM del host no se ha medido en este checkpoint concreto; las cifras de rendimiento son extrapolaciones de otros builds GLQ.
- `--max-model-len` y `--max-num-seqs` compiten por el KV pool; a contexto completo la concurrencia es muy baja (aproximadamente KV pool ÷ max-model-len).
- No hay soporte documentado de tool calling, visión ni audio en la información disponible.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-3bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio GLQ (instalador): https://raw.githubusercontent.com/cnygaard/glq/main/install.sh
- Paper de referencia citado en tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
