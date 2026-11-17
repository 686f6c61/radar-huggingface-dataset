# TeamAIQ/SoulX-FlashHead-1_3B-INT8-ConvRot

## Resumen

SoulX-FlashHead-1_3B-INT8-ConvRot es una versión cuantizada a INT8 del modelo SoulX-FlashHead-1_3B, desarrollado originalmente por Soul-AILab y cuantizado por AIQUEST (TeamAIQ). Se trata de un modelo de difusión basado en la arquitectura Wan (WanModelAudioProject), orientado a la generación de vídeo condicionada por audio, es decir, generación de cabezas parlantes (talking heads) o avatares animados a partir de audio. El modelo base tiene 1.300 millones de parámetros.

La relevancia de esta variante reside en la cuantización INT8 con rotación Hadamard (ConvRot) aplicada a los pesos lineales de los bloques transformer, lo que reduce el peso de los checkpoints de difusión de aproximadamente 3,8 GB (FP16) a 1,9 GB por variante, manteniendo la precisión original mediante kernels INT8 de tensor cores de Comfy Kitchen. El modelo se distribuye en dos variantes (Lite y Pro) más un VAE LTX copiado sin modificar.

El repositorio tiene 5,5 GB en total y está pensado para cargarse directamente en Wan2GP y ejecutarse con los kernels INT8 de Comfy Kitchen. La licencia es "other", heredada del modelo original, y no se especifican idiomas soportados ni pipeline de diffusers concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión transformer basada en Wan (WanModelAudioProject), condicionada por audio |
| Parametros totales | 1.300 millones (modelo base SoulX-FlashHead-1_3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con rotación ConvRot (Hadamard por grupos de 256 canales de entrada, escala FP32 por canal de salida); embeddings, norms, biases, AdaLN y capas de entrada/salida en precisión original |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los términos del modelo original) |
| Formato de pesos | safetensors (INT8 + escalas F32 + config `comfy_quant`); metadatos `quantization_format: int8_convrot`, `convrot_format: comfy_quant_v1` |

## Arquitectura y entrenamiento

El modelo base SoulX-FlashHead-1_3B emplea una arquitectura de difusión transformer del linaje Wan, concretamente la clase `WanModelAudioProject`, que incorpora proyección de audio para condicionar la generación de vídeo por señal acústica. Esta variante cuantizada no introduce cambios arquitectónicos: mantiene la topología original y solo transforma los pesos lineales de los bloques transformer.

La cuantización aplicada es INT8 con rotación ConvRot: antes de cuantizar, los canales de entrada se rotan mediante una transformada de Hadamard en grupos de 256, lo que distribuye los outliers y permite una cuantización INT8 más estable. Cada peso lineal conserva un factor de escala FP32 por canal de salida, y los kernels INT8 de Comfy Kitchen aplican la misma rotación a las activaciones en tiempo de inferencia, de modo que cada capa reproduce su resultado original. Embeddings, normas, biases, proyecciones AdaLN y capas de entrada/salida permanecen en su precisión original. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de vídeo condicionada por audio (talking heads / avatares animados).
- Dos variantes de checkpoint de difusión: `Model_Lite` y `Model_Pro`.
- VAE LTX incluido para codificación/decodificación latente.
- Ejecución con kernels INT8 de tensor cores mediante Comfy Kitchen.
- Carga directa en Wan2GP.
- Compatibilidad con el ecosistema diffusers (librería declarada en el repositorio).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio de entrada: no disponible (solo condicionamiento por audio para generación de vídeo).

## Casos de uso

- Generación de avatares parlantes para vídeo corporativo: a partir de una pista de audio y una referencia visual, el modelo sintetiza una cabeza animada sincronizada, adecuado por su condicionamiento por audio y su tamaño de 1,3B que cabe en GPUs de consumo.
- Doblaje y localización de contenido: permite regenerar la animación facial de un locutor sobre audio traducido, manteniendo la sincronía labial, con la variante Lite para iteración rápida y Pro para entrega final.
- Creación de contenido para redes sociales: generación de clips de presentador virtual en pipelines automatizados, beneficiándose del checkpoint INT8 de 1,9 GB que reduce requisitos de VRAM y acelera el despliegue.
- Prototipado en ComfyUI / Comfy Kitchen: al cargarse con los kernels INT8 nativos, permite construir grafos de generación de vídeo condicionada por audio dentro del ecosistema Comfy sin conversión adicional.
- Integración en Wan2GP: despliegue directo en el entorno Wan2GP para experimentación con modelos Wan, aprovechando la compatibilidad declarada por el autor.
- Servicios de vídeo interactivo de bajo coste: al reducir el peso y usar INT8, facilita el alojamiento en instancias GPU más económicas para demos o entornos de staging.
- Investigación sobre cuantización de modelos de difusión: sirve como referencia para estudiar el impacto de ConvRot INT8 en calidad de generación de vídeo frente al modelo base FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 5,5 GB y cada checkpoint de difusión INT8 pesa 1,9 GB, más 1,7 GB del VAE LTX. Se requiere cargar el checkpoint de difusión seleccionado (Lite o Pro) junto con el VAE.
- GPU recomendadas: no disponible. Los kernels INT8 de tensor cores de Comfy Kitchen apuntan a GPUs con soporte de tensor cores INT8 (por ejemplo, generaciones Ada/Ampere en adelante), pero el autor no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos (1,9 GB por checkpoint + 1,7 GB VAE) es plausible en GPUs consumer con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: Wan2GP y Comfy Kitchen (kernels INT8). Compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible (no es un modelo de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoulX-FlashHead-1_3B-INT8-ConvRot (este) | 1,3B | no disponible | safetensors INT8 ConvRot | other | Hugging Face, 22 descargas |
| Soul-AILab/SoulX-FlashHead-1_3B (base) | 1,3B | no disponible | safetensors (FP16 presumiblemente) | other | Hugging Face |
| Alternativas de generación de talking heads | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generación de vídeo condicionada por audio) en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia es "other" y remite a los términos del modelo original; es imprescindible revisar la licencia de Soul-AILab/SoulX-FlashHead-1_3B antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al ser un modelo generativo de rostros humanos es probable que herede sesgos de los datos de entrenamiento del modelo base (no confirmado).
- Riesgo de alucinación visual: en modelos de difusión, pueden aparecer artefactos, desincronía labial o identidades inconsistentes; no hay datos de evaluación publicados.
- La cuantización INT8 ConvRot puede introducir degradación sutil de calidad frente al modelo base FP16; el autor afirma preservar el resultado por capa, pero no se aportan métricas comparativas.
- Idiomas soportados no especificados.
- Longitud de contexto no especificada.
- Dependencia de kernels específicos (Comfy Kitchen INT8, Wan2GP): la portabilidad a otros runtimes no está garantizada.
- Repositorio con muy pocas descargas (22) y sin likes, lo que limita la validación comunitaria.
- No hay información sobre latencia, throughput ni requisitos mínimos de VRAM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamAIQ/SoulX-FlashHead-1_3B-INT8-ConvRot
- Modelo base: https://huggingface.co/Soul-AILab/SoulX-FlashHead-1_3B
- YouTube del cuantizador: https://www.youtube.com/@aiquestacademy
- X del cuantizador: https://x.com/aiquestacademy
- Sitio del cuantizador: https://aiquest.site
