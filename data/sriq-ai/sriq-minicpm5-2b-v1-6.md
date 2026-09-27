# sriq-ai/SRIQ-MiniCPM5-2B-v1.6

## Resumen

SRIQ-MiniCPM5-2B-v1.6 es un ajuste fino supervisado (SFT) del modelo base openbmb/MiniCPM5-2B, publicado por sriq-ai bajo licencia Apache-2.0. Se trata de una adaptacion mediante QLoRA de 4 bits fusionada a pesos bf16, con 2.516.756.480 parametros (~2,52 B) y un unico objetivo: que el modelo razone en chino simplificado comprimido y responda en el idioma en que se le formule la pregunta. El repositorio pesa 5,0 GB y se distribuye en formato safetensors para la libreria transformers.

El modelo resuelve un caso de uso muy concreto: separar la traza de razonamiento del idioma de la respuesta final, de modo que la cadena de pensamiento quede interna y comprimida mientras que la salida visible respeta el idioma del usuario. Es relevante por su tamano reducido, que lo hace desplegable en hardware de consumo, y por su compatibilidad declarada con text-generation-inference y endpoints compatibles. Conviene subrayar que el autor no publico ningun benchmark en esta version y que la ficha pide explicitamente evaluarlo en la carga de trabajo propia antes de confiar en el.

El entrenamiento se ejecuto sobre 9.988 filas del dataset sriq-ai/sriq-sft-v1.6 durante 313 pasos (aproximadamente una epoca), con perdida final de 0,9216, en 8 GPU NVIDIA A100-SXM4-80GB y un coste estimado de 11,61 dolares. La ventana de secuencia de entrenamiento fue de 8.192 tokens. No se proporciona informacion sobre arquitectura detallada del modelo base, contexto maximo real, ni lista oficial de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con etiqueta "llama" en HuggingFace; arquitectura detallada del modelo base openbmb/MiniCPM5-2B no disponible |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens como maximo de secuencia de entrenamiento; ventana de contexto nativa del modelo base no disponible |
| Tipos de cuantizacion | Pesos fusionados en bf16; no se publican GGUF ni cuantizaciones int8/4-bit oficiales, aunque el modelo es cuantizable con herramientas estandar |
| Idiomas soportados | Traza de razonamiento en chino simplificado comprimido; respuesta en el idioma de la pregunta. Lista oficial de idiomas: no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-2B y se adapta mediante LoRA sobre una base cuantizada a 4 bits (QLoRA), con posterior fusion a bf16. La configuracion de LoRA es r=32, alpha=32 y dropout=0,0, aplicada a las proyecciones de atencion y de MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento uso tasa de aprendizaje 1.5e-4 con planificador lineal y 10 pasos de calentamiento, batch efectivo de 32 (8 por dispositivo x 4 de acumulacion de gradiente) y una longitud maxima de secuencia de 8.192 tokens, descartando las filas demasiado largas en lugar de truncarlas.

El run, denominado cpm-v2, cubrio 313 pasos sobre 9.988 de las 9.988 filas del dataset sriq-ai/sriq-sft-v1.6, lo que equivale a aproximadamente una epoca completa; el autor aclara que el run esta limitado por numero de pasos y no por epocas. La perdida final de entrenamiento fue de 0,9216. Todo el proceso se ejecuto en 8 x NVIDIA A100-SXM4-80GB durante 54 minutos de reloj de pared, con un coste de GPU de unos 11,61 dolares. No se documento ninguna innovacion de arquitectura adicional (ni decodificacion especulativa, ni atencion lineal, ni mecanismos hibridos) mas alla del ajuste fino supervisado estandar.

## Capacidades

- Generacion de texto conversacional y de instrucciones en formato chat, heredada del modelo base y reforzada con SFT.
- Razonamiento explicito tipo cadena de pensamiento, emitido en chino simplificado comprimido como traza interna.
- Respuesta en el idioma en que se formula la pregunta, independientemente del idioma de la traza de razonamiento.
- Soporte multirritmo de conversacion multi-turno mediante plantilla de chat de transformers.
- Capacidad de ser servido a traves de text-generation-inference y de endpoints compatibles (segun los tags del repositorio).
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking": si, con la salvedad de no pasar `enable_thinking=False`, porque la plantilla rellena un `<think></think>` vacio y la traza desaparece.

## Casos de uso

- Razonamiento con salida localizada: el modelo puede generar la traza de pensamiento en chino comprimido mientras entrega la respuesta final en castellano o en cualquier otro idioma solicitado; util en productos donde la traza es interna y la salida debe ser monolingue.
- Asistentes conversacionales de bajo coste: gracias a sus ~2,52 B de parametros cabe en GPU de consumo, por lo que resulta adecuado para prototipos de chatbot que necesiten inferencia economica en local.
- Generacion de texto con plantilla de chat en transformers: integrable directamente en pipelines Python existentes mediante `AutoModelForCausalLM` y `AutoTokenizer`, sin conversion de formato previa.
- Servicio detras de text-generation-inference: al declarar compatibilidad con TGI y endpoints compatibles, puede desplegarse en una API HTTP con batching continuo para cargas moderadas.
- Evaluacion e investigacion de trazas de razonamiento comprimidas: sirve como punto de partida para estudiar como se comporta un modelo pequeno cuando se le fuerza a razonar en un idioma distinto al de la respuesta.
- Educacion y demostraciones tecnicas: por su tamano reducido y licencia Apache-2.0, es apropiado para entornos de ensenanza donde se quiera mostrar el ciclo completo de ajuste fino QLoRA y fusion a bf16.
- Clasificacion y reescritura de texto ligera: como modelo generativo pequeno, puede emplearse en tareas auxiliares de resumen o reformulacion que no requieran contexto muy largo, siempre que se valide antes en la carga propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se ejecuto ningun benchmark para esta version y que no se reportan filas de razonamiento en chino, tasa de verificacion ni bucles comparados con el modelo base. El autor recomienda evaluar el modelo en la carga de trabajo propia antes de depender de el.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5-6 GB solo para pesos, mas la cache KV; con 8.192 tokens de contexto conviene reservar del orden de 7-9 GB segun batch y longitud.
- VRAM estimada en cuantizacion de 4 bits (por ejemplo, via herramientas externas, ya que no se publica GGUF oficial): aproximadamente 1,5-2,5 GB de pesos.
- GPU consumer compatibles: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070/4080, RTX 4090 24GB y cualquier GPU con al menos 6-8 GB de VRAM para bf16. En 4 bits cabe incluso en GPU de 4-6 GB.
- GPU de datacenter: A100-80GB y H100 (usadas o recomendadas para mayor batch y throughput). El entrenamiento de este ajuste se hizo en 8 x A100-SXM4-80GB, pero para inferencia basta una sola GPU.
- Opciones de despliegue: transformers (ruta oficial), text-generation-inference (declarado en tags) y endpoints compatibles; vLLM y llama.cpp/Ollama serian posibles pero requieren conversion previa a GGUF, que no se publica en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| SRIQ-MiniCPM5-2B-v1.6 | 2,52 B | 8.192 (entrenamiento) | Apache-2.0 | No disponible (no se ejecutaron benchmarks) |
| openbmb/MiniCPM5-2B (base) | no disponible | no disponible | no disponible | no disponible |
| Qwen2.5-3B | ~3,09 B | 32.768 | Apache-2.0 | No comparable directamente (sin datos de este ajuste) |
| Llama-3.2-3B | ~3,21 B | 128.000 | Llama 3.2 Community License | No comparable directamente (sin datos de este ajuste) |
| Gemma-2-2B | ~2,6 B | 8.192 | Gemma Terms of Use | No comparable directamente (sin datos de este ajuste) |

Nota: las cifras de parametros, contexto y licencia de Qwen2.5-3B, Llama-3.2-3B y Gemma-2-2B corresponden a modelos publicos conocidos y se incluyen como referencia de categoria. No se dispone de resultados de benchmarks de SRIQ-MiniCPM5-2B-v1.6, por lo que no es posible una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- No se ejecutaron benchmarks en esta version; cualquier afirmacion de calidad debe verificarse en la carga de trabajo propia.
- La traza de razonamiento se emite en chino simplificado comprimido, lo que puede ser indeseable en productos donde se espera una traza en el idioma del usuario.
- No se debe pasar `enable_thinking=False`: la plantilla rellena un `<think></think>` vacio y la traza desaparece, rompiendo el comportamiento esperado.
- El modelo hereda las limitaciones del modelo base openbmb/MiniCPM5-2B, que no se detallan en la informacion disponible.
- El entrenamiento cubrio aproximadamente una epoca sobre 9.988 filas y el run esta limitado por pasos, no por epocas; el ajuste puede ser limitado en cobertura.
- Riesgo de alucinacion inherente a un modelo de 2,52 B; no hay datos de verificacion ni de tasa de bucles.
- El pipeline de entrenamiento interno (train.sriq.org) no es publico, lo que dificulta la reproducibilidad exacta del proceso.
- La longitud de contexto real soportada mas alla de los 8.192 tokens de entrenamiento no esta documentada; no se debe asumir una ventana mayor.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe mantener el aviso de licencia y reconocer al autor (SRIQ) y al modelo base (openbmb).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/SRIQ-MiniCPM5-2B-v1.6
- Adaptador LoRA: https://huggingface.co/sriq-ai/SRIQ-MiniCPM5-2B-v1.6-adapter
- Dataset de entrenamiento: https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.6
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Sitio de SRIQ: https://sriq.org
- Benchmarks de SRIQ: https://bench.sriq.org
