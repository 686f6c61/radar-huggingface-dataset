# veyra-ai/Veyra2-Blueberry-10M-Base-ONNX

## Resumen

Veyra2-Blueberry-10M-Base-ONNX es una conversión a formato ONNX del modelo base Veyra2 Blueberry 10M, desarrollado por Veyra AI. Se trata de un modelo de lenguaje pequeño (10 millones de parámetros) orientado a inferencia ligera en CPU y entornos con recursos limitados. El modelo está diseñado para generación de texto causal y no ha sido afinado para instrucciones, por lo que su uso principal es experimental o como base para fine-tuning.

La relevancia de este modelo radica en su tamaño reducido y su formato ONNX, que permite ejecutarlo en navegadores mediante transformers.js o en entornos de producción con baja latencia. Aunque sus capacidades son limitadas, sirve como punto de partida para investigar técnicas de destilación, cuantización y despliegue en dispositivos edge. El modelo está licenciado bajo Apache 2.0, lo que facilita su uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3 en HuggingFace, sin confirmar) |
| Parametros totales | 10 millones (inferido del nombre, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente FP32/FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El tag `qwen3` en HuggingFace sugiere una posible base en la arquitectura Qwen3, pero no hay confirmación oficial. El modelo es un transformer causal (causal-lm) con 10 millones de parámetros, lo que lo sitúa en la categoría de small language models (SLM).

El entrenamiento se realizó sobre una combinación de datasets públicos: HuggingFaceFW/fineweb-edu, HuggingFaceFW/finephrase, mlfoundations/dclm-baseline-1.0 y HuggingFaceTB/finemath. No se menciona el número de tokens ni si se aplicaron técnicas de RLHF o DPO. Al ser un modelo base, no ha pasado por fine-tuning instructivo.

## Capacidades

- Generación de texto causal: puede continuar secuencias de texto de forma autónoma, aunque con calidad limitada.
- Razonamiento básico: muestra resultados modestos en tareas de sentido común y comprensión lectora (ver benchmarks).
- Matemáticas simples: cierta capacidad en aritmética básica, con precisión baja.
- Multilingüe: solo inglés, según la etiqueta de idioma.
- Sin tool calling ni function calling: al ser un modelo base, no soporta estas funcionalidades.
- Sin modo agente ni razonamiento multi-paso estructurado.
- Sin capacidades de visión ni audio.

## Casos de uso

- Experimentación educativa: ideal para estudiantes e investigadores que quieran estudiar el comportamiento de modelos pequeños sin necesidad de hardware potente. Se puede ejecutar en un portátil o incluso en un navegador.
- Prototipado rápido de pipelines de NLP: al ser ONNX, se integra fácilmente con ONNX Runtime y transformers.js para probar flujos de generación de texto en entornos web.
- Base para fine-tuning: su tamaño reducido permite ajustarlo con datasets específicos en GPUs modestas, sirviendo como punto de partida para tareas de clasificación o generación acotada.
- Pruebas de cuantización y optimización: al ser un modelo pequeño, es útil para evaluar técnicas de compresión (quantization, pruning) sin coste computacional alto.
- Generación de texto en entornos con restricciones de memoria: por su tamaño, puede desplegarse en microcontroladores o dispositivos IoT con poca RAM.
- Benchmarking de frameworks de inferencia: permite comparar el rendimiento de ONNX Runtime, llama.cpp, etc., en un modelo ligero y reproducible.

## Benchmarks y rendimiento

Los resultados fueron declarados por el autor en la model card, usando lm-evaluation-harness local. No se han verificado de forma independiente.

| Dataset | Métrica | Valor |
|---|---|---|
| SciQ | Accuracy | 68.1 |
| SciQ | Normalized Accuracy | 56.9 |
| PIQA | Normalized Accuracy | 55.44 |
| ARC-Easy | Normalized Accuracy | 35.44 |
| ARC-Challenge | Normalized Accuracy | 21.59 |
| HellaSwag | Normalized Accuracy | 28.04 |
| Winogrande | Accuracy | 50.12 |
| OpenBookQA | Accuracy | 15.0 |
| OpenBookQA | Normalized Accuracy | 27.6 |
| BoolQ | Accuracy | 61.99 |
| ArithMark-3.0 | Accuracy | 34.6 |

Estos valores están muy por debajo de modelos más grandes (por ejemplo, modelos de 1B o más), lo que es esperable para un SLM de 10M. No se dispone de comparaciones con otros modelos de tamaño similar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (10M parámetros ≈ 40 MB en FP32, pero con overhead de runtime). En cuantización INT8 podría ser aún menor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas. También funciona en CPU sin GPU.
- Compatibilidad con consumer GPU: sí, cualquier GPU moderna (RTX 2060, GTX 1650, etc.) es suficiente.
- Opciones de despliegue: ONNX Runtime, transformers.js (para navegador), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (aunque es excesivo para este tamaño).
- Latencia y throughput: no hay datos oficiales, pero por el tamaño se espera una latencia de milisegundos en CPU moderna y throughput alto en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de 10M. Modelos como SmolLM-135M, TinyLlama-1.1B o Qwen2-0.5B son más grandes y tienen mejores capacidades, pero no son comparables en tamaño. Se recomienda consultar el modelo base original (Veyra2-Blueberry-10M-Base) para más detalles. La comparativa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin fine-tuning instructivo: no debe usarse como asistente conversacional; alucina, repite texto y falla en tareas simples de hecho o matemáticas.
- Solo inglés: no soporta otros idiomas.
- Rendimiento muy limitado: los benchmarks muestran resultados bajos en razonamiento y comprensión, por lo que no es adecuado para tareas de producción que requieran precisión.
- Sin tool calling ni capacidades de agente: no puede interactuar con APIs o ejecutar funciones.
- Posible sesgo: al entrenarse con datos web, puede heredar sesgos presentes en esos corpus, aunque no hay estudios específicos.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribución a Veyra AI.
- Formato ONNX: puede requerir conversión adicional para usar en ciertos frameworks (por ejemplo, GGUF para llama.cpp).

## Enlaces

- Modelo ONNX en HuggingFace: https://huggingface.co/veyra-ai/Veyra2-Blueberry-10M-Base-ONNX
- Modelo base original: https://huggingface.co/veyra-ai/Veyra2-Blueberry-10M-Base
- Organización Veyra AI en HuggingFace: https://huggingface.co/veyra-ai/models
- Sitio web de Veyra (no relacionado directamente con el modelo): https://veyra.sh/
