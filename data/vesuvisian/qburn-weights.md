# vesuvisian/qburn-weights

## Resumen

qburn-weights es un repositorio de pesos convertidos del modelo Qwen3-VL-2B-Instruct, publicado por el usuario vesuvisian. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint oficial de Qwen a un formato propietario denominado burnpack, pensado para su uso con la herramienta qburn, un runtime de inferencia escrito en Rust sobre el framework Burn. El objetivo es habilitar la ejecución nativa en CLI y en navegador mediante WebGPU de un modelo vision-language de 2.000 millones de parámetros.

La relevancia de este repositorio es acotada pero específica: demuestra una vía de despliegue de un VLM de Qwen en entornos sin Python ni PyTorch, incluido el navegador, usando cuantización mixta de 4 bits. El paquete ocupa aproximadamente 1,8 GiB, lo que lo hace manejable en hardware de consumo, aunque el rendimiento en WebGPU es notablemente inferior al de Metal o CUDA según advierte el propio autor.

El modelo base, Qwen3-VL-2B-Instruct, es un transformer multimodal de la familia Qwen3-VL desarrollado por el equipo Qwen de Alibaba, orientado a tareas de image-text-to-text con instrucciones. Esta conversión hereda sus capacidades y limitaciones, con la salvedad de la pérdida de calidad introducida por la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), derivada de Qwen3-VL-2B-Instruct |
| Parámetros totales | 2B (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | q4-mix: Q4S (bloque 32, Burn MinMax) en lineales del decodificador y bloques de visión; F16 en embeddings, norms, patch/pos/merger y DeepStack. No es AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Burnpack (`.bpk.part` concatenados según `manifest.json`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión de pesos del checkpoint Qwen/Qwen3-VL-2B-Instruct al formato burnpack mediante la herramienta qburn-converter. La arquitectura subyacente es la del modelo base, un transformer multimodal de 2.000 millones de parámetros que combina un codificador visual con un decodificador de lenguaje, e incorpora mecanismos como DeepStack (cuyas capas se conservan en F16 en esta conversión). No se dispone de detalles sobre la composición del dataset de entrenamiento original ni sobre las fases de alineación (RLHF/DPO) en la información proporcionada.

La innovación técnica de este repositorio es el esquema de cuantización mixta q4-mix: se aplica cuantización de 4 bits con bloques de 32 elementos y escalado MinMax de Burn a las capas lineales del decodificador y de los bloques de visión, mientras que se mantienen en F16 los componentes sensibles a la precisión (embeddings, normalizaciones y módulos de fusión visual). El resultado son shards burnpack que deben concatenarse en el orden indicado por `manifest.json` y cargarse con el runtime qburn, que soporta ejecución nativa (Metal/CUDA) y WebGPU en navegador.

## Capacidades

- Generación de texto e inferencia image-text-to-text: el modelo acepta imágenes y prompts de texto para producir descripciones, respuestas o análisis.
- Comprensión visual: al derivar de Qwen3-VL, hereda las capacidades de percepción de imagen del modelo base, incluyendo módulos de fusión visual y DeepStack.
- Instrucciones en lenguaje natural: es la variante Instruct, por lo que está ajustado para seguir indicaciones del usuario.
- Ejecución nativa en CLI mediante qburn (Metal/CUDA) y ejecución en navegador mediante WebGPU.
- Soporte de tool calling, agentes, modo thinking, audio o matemáticas avanzadas: no disponible en la información proporcionada para esta conversión.
- Capacidades multilingües: no disponible.

## Casos de uso

- Descripción de imágenes en local sin Python: cargar el manifest con qburn en CLI y pasar una fotografía para obtener una caption o un resumen descriptivo, aprovechando que el paquete de 1,8 GiB cabe en un portátil moderno.
- Demostraciones de VLM en navegador: servir el `manifest.json` a una página con WebGPU para probar inferencia multimodal sin backend, útil para prototipos y demos interactivas.
- Preprocesado de imágenes en pipelines Rust: integrar qburn como biblioteca en una aplicación Rust para etiquetar o filtrar imágenes antes de un pipeline mayor, evitando dependencias de PyTorch.
- Evaluación de cuantización q4-mix: comparar la calidad de salida de esta conversión frente al checkpoint original en F16/BF16 para medir la degradación introducida por Q4S en tareas de captioning.
- Pruebas de portabilidad de runtimes: validar el funcionamiento del ecosistema Burn/qburn en distintas plataformas (Metal, CUDA, WebGPU) usando un VLM pequeño como banco de pruebas.
- Asistentes visuales de bajo consumo: desplegar un asistente que responda preguntas sobre capturas o documentos escaneados en entornos donde no se puede instalar CUDA ni frameworks de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de calidad (MMLU, MMMU, etc.) ni de latencia o throughput para esta conversión, y solo advierte que la ruta WebGPU es mucho más lenta que Metal/CUDA nativo.

## Requisitos de hardware

- VRAM estimada: el paquete cuantizado ocupa aproximadamente 1,8 GiB; la inferencia requiere además memoria para activaciones y KV cache, por lo que se recomienda un mínimo de 4 GB de VRAM o memoria unificada.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs de consumo como RTX 3060/4060 en adelante, así como en Apple Silicon con Metal.
- GPU de consumo: sí, el modelo de 2B en q4-mix está pensado para caber en hardware de consumo; no se detallan modelos concretos.
- Despliegue: runtime qburn (CLI nativo con Metal/CUDA) y WebGPU en navegador. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato burnpack no es safetensors ni GGUF.
- Latencia y throughput: no disponibles; el autor solo indica que WebGPU es considerablemente más lento que la ruta nativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qburn-weights (esta conversión) | 2B | no disponible | Burnpack (q4-mix) | Apache 2.0 | Hugging Face, runtime qburn |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible | Safetensors | Apache 2.0 | Hugging Face, Transformers |
| Otros VLM de ~2B (p. ej. variantes de la familia Qwen2-VL) | ~2B | no disponible | Safetensors/GGUF | variable | Hugging Face |

La comparación directa más relevante es con el checkpoint original de Qwen3-VL-2B-Instruct: misma arquitectura y licencia, pero formato estándar y sin pérdida por cuantización. Frente a alternativas en GGUF, la diferencia clave es la compatibilidad de runtime: burnpack solo funciona con qburn.

## Limitaciones y advertencias

- No es un checkpoint de Transformers ni safetensors: no se puede cargar con `from_pretrained` ni con herramientas estándar del ecosistema Hugging Face.
- La cuantización q4-mix puede degradar la calidad respecto al modelo base en precisión completa, según advierte el propio autor.
- El rendimiento en navegador vía WebGPU es mucho más lento que en Metal/CUDA nativo.
- El modelo base es un VLM de 2B: capacidad limitada para razonamiento complejo, contextos largos o tareas que requieran conocimiento factual extenso; riesgo de alucinación inherente a modelos de este tamaño.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-VL.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el release original de Qwen3-VL y enlazar este repositorio si se redistribuye, tal como pide el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vesuvisian/qburn-weights
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Proyecto qburn: https://github.com/vesuvisian/qburn
- Manifest para demo en navegador: https://huggingface.co/vesuvisian/qburn-weights/resolve/main/manifest.json
