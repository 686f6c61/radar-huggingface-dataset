# webai-community/ai-models

## Resumen

`webai-community/ai-models` es un repositorio de HuggingFace que actúa como punto de distribución de una colección de modelos de lenguaje de las familias Phi (Microsoft) y Qwen (Alibaba), convertidos a formatos GGUF y ONNX WebGPU. No es un modelo único, sino un agregador de múltiples modelos ya existentes, con tamaños que van desde 0.5B hasta 9B de parámetros. El repositorio tiene un tamaño de 414 GB e incluye modelos de instrucción, razonamiento y multimodal.

Su relevancia radica en que facilita la descarga de modelos listos para su uso en inferencia local mediante llama.cpp o en navegadores a través de WebGPU, sin necesidad de buscar cada modelo por separado. El dato de parámetros totales de safetensors registrado en la metadata es de 6.738.546.688, pero corresponde a la suma de los pesos de los archivos safetensors presentes en el repositorio, no a un único modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de modelos transformer (Phi y Qwen), no un modelo único |
| Parametros totales | 6.738.546.688 (suma de pesos safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (varía según el modelo) |
| Tipos de cuantizacion | GGUF y ONNX WebGPU (bits no especificados) |
| Idiomas soportados | no disponible (depende del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF, ONNX WebGPU |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura o el entrenamiento de un modelo específico, ya que `webai-community/ai-models` es un repositorio de conversión que agrupa modelos ya publicados por otros desarrolladores. Los modelos incluidos pertenecen a las familias Phi (Phi-3, Phi-3.5, Phi-4) y Qwen (Qwen2.5, Qwen3, Qwen3.5). El repositorio ofrece dos formatos de pesos: GGUF, para ejecución con llama.cpp y motores compatibles, y ONNX WebGPU, para inferencia en navegador mediante WebGPU.

## Capacidades

- Incluye modelos de instrucción como `Phi-4-mini-instruct` (3.8B), `Phi-3.5-mini-instruct` (3.8B), `Qwen2.5-7B-Instruct` (7B) y `Qwen3-8B` (8B).
- Incluye modelos de razonamiento como `Phi-4-mini-reasoning` (3.8B).
- Incluye un modelo multimodal, `Phi-4-multimodal-instruct` (6B), aunque no se especifican sus capacidades de visión o audio.
- Todos los modelos listados están disponibles en formato GGUF y ONNX WebGPU, salvo `Phi-4-multimodal-instruct`, que solo tiene ONNX WebGPU.
- Soporte para descarga selectiva mediante `huggingface-cli download` con patrones de inclusión por modelo y formato.

## Casos de uso

- Inferencia en navegador: los modelos en formato ONNX WebGPU permiten ejecutar LLMs directamente en el cliente, sin servidor, mediante WebGPU. Adecuado para aplicaciones web de chat o asistentes que requieren privacidad.
- Despliegue local con llama.cpp: los modelos GGUF pueden ejecutarse en CPU o GPU con llama.cpp, Ollama u otros motores compatibles, en equipos de consumo.
- Prototipado rápido: al disponer de modelos de distintos tamaños (0.5B a 9B) en un solo repositorio, se puede evaluar el equilibrio entre rendimiento y recursos sin generar múltiples descargas.
- Aplicaciones de razonamiento: `Phi-4-mini-reasoning` está pensado para tareas que requieren cadenas de razonamiento, como resolución de problemas lógicos o matemáticos.
- Asistentes de código: modelos como `Qwen3-8B` o `Qwen2.5-7B-Instruct` pueden utilizarse para generación y explicación de código en entornos de desarrollo.
- Chat multilingüe: los modelos de la familia Qwen tienen soporte multilingüe conocido, aunque no se especifica en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No disponible. El repositorio contiene modelos de 0.5B a 9B, por lo que los requisitos de VRAM varían según el modelo y la cuantización elegida.
- No se especifican GPUs recomendadas ni opciones de despliegue concretas más allá de los formatos GGUF y ONNX WebGPU.
- Los modelos GGUF pueden ejecutarse con llama.cpp en CPU y GPU; los modelos ONNX WebGPU requieren un navegador compatible con WebGPU.

## Comparativa con modelos similares

No disponible. Al tratarse de un repositorio agregador, no existe una comparativa directa con otros modelos individuales.

## Limitaciones y advertencias

- No es un modelo único, sino una colección de modelos de distintos autores y licencias. La licencia de cada modelo puede variar y debe consultarse individualmente.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de contexto de los modelos incluidos.
- El dato de parámetros totales (6.7B) no corresponde a un modelo concreto y puede inducir a error si se interpreta como un único modelo.
- No se indica la fecha de creación de cada modelo ni si las conversiones están actualizadas respecto a las versiones originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/webai-community/ai-models
- Explorador de archivos: https://huggingface.co/webai-community/ai-models/tree/main
