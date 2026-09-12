# TokenRhythm/NeoHorse-1-9B-GGUF

## Resumen

NeoHorse-1-9B es un modelo de lenguaje causal de aproximadamente 9.000 millones de parametros desarrollado por TokenRhythm Technologies, presentado como un prototipo inicial en la ruta hacia la automejora recursiva (recursive self-improvement, RSI). Se obtiene mediante post-entrenamiento a partir de Qwen3.5-9B y esta orientado especificamente a su uso dentro de arneses de agentes basados en texto, uso de herramientas (tool use), generacion de codigo y seguimiento de instrucciones.

El repositorio analizado (TokenRhythm/NeoHorse-1-9B-GGUF) contiene unicamente los pesos en formato GGUF para su ejecucion local con llama.cpp, Ollama y LM Studio, e incluye versiones en 16 bits (BF16) y cuantizaciones de 8, 5 y 4 bits. Los pesos son exclusivamente de texto. El modelo base sin cuantizar esta disponible en TokenRhythm/NeoHorse-1-9B.

Su relevancia actual reside en el enfoque metodologico: TokenRhythm describe un bucle de evaluacion-seleccion-actualizacion en el que un arnes de enrutamiento asigna tareas a un conjunto heterogeneo de modelos, registra interacciones con herramientas y resultados, estima la demanda de capacidades y usa esa retroalimentacion para componer la siguiente mezcla de entrenamiento. Segun la model card, el modelo alcanza una media macro de 69,04 en diez benchmarks frente a 65,60 de Qwen3.5-9B, una mejora de +3,44 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), denso; derivado de Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (16 bits), 8 bits, 5 bits y 4 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama / LM Studio) |

## Arquitectura y entrenamiento

NeoHorse-1-9B es un modelo de lenguaje causal denso de aproximadamente 9B parametros, post-entrenado desde Qwen3.5-9B. La informacion disponible no detalla la arquitectura interna mas alla de su naturaleza causal y text-only, ni especifica la composicion exacta del dataset ni el numero de tokens de entrenamiento. La model card si describe el proceso de post-entrenamiento: un marco agentico que combina SFT guiado por curriculo (routing-guided curriculum SFT) y distillation on-policy guiada por enrutamiento, con el objetivo de convertir trayectorias de ejecucion en senal de entrenamiento preservando el contexto del arnes y de la ejecucion en torno a cada respuesta.

La innovacion tecnica destacada es el denominado routing harness: un arnes que asigna tareas a un conjunto heterogeneo de modelos, registra interacciones con herramientas y resultados, estima la demanda de capacidades y emplea retroalimentacion a nivel de capacidad para definir la siguiente mezcla de entrenamiento. Los modelos actualizados pueden reincorporarse al arnes, cerrando un bucle prototipo de evaluacion-seleccion-actualizacion. El pipeline de datos incluye eliminacion de duplicados exactos y casi duplicados, descontaminacion de evaluacion, validacion estructural, evaluacion semantica en seis dimensiones y etiquetado a nivel de subescena con la estructura Scene/Goal/Outcome.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational" del repositorio.
- Uso de herramientas (tool use) y function calling, orientado a arneses de agentes.
- Comportamiento agentico y razonamiento multi-paso (multi-step reasoning).
- Generacion de codigo.
- Razonamiento (reasoning), incluyendo un modo de razonamiento configurable: en la API nativa de LM Studio se puede desactivar con `reasoning: "off"`.
- Seguimiento de instrucciones (instruction-following).
- Modelo exclusivamente de texto: no se declaran capacidades de vision ni de audio.
- El soporte multilingue no esta declarado en la informacion disponible.

## Casos de uso

- Agentes autonomos con uso de herramientas: el modelo esta post-entrenado especificamente para preservar el contexto de ejecucion y del arnes, por lo que puede integrarse en bucles de agente que invocan APIs y funciones externas y encadenan varios pasos de razonamiento.
- Asistentes de codigo en local: gracias a las cuantizaciones de 4 y 5 bits puede ejecutarse en hardware de consumo con llama.cpp u Ollama, lo que permite integrarlo en entornos de desarrollo sin conexion o con requisitos de privacidad.
- Automatizacion de tareas multi-paso: su orientacion a "agentic" y "instruction-following" lo hace adecuado para pipelines que descomponen un objetivo en subtareas y necesitan mantener coherencia a lo largo de la secuencia.
- Prototipado de arneses de enrutamiento: el modelo puede emplearse como uno de los componentes de un pool heterogeneo dentro del routing harness descrito por TokenRhythm, aportando trayectorias de ejecucion que alimenten posteriores iteraciones de entrenamiento.
- Evaluacion comparativa de post-entrenamiento: dado que su base es Qwen3.5-9B, sirve como referencia para medir el efecto de tecnicas de curriculo guiado por enrutamiento y distillation on-policy sobre un mismo modelo base.
- Chat conversacional con control de razonamiento: al permitir desactivar el modo de razonamiento, puede usarse en aplicaciones de atencion al usuario donde se prioriza la latencia frente a la profundidad de razonamiento.

## Benchmarks y rendimiento

La informacion proporcionada incluye unicamente la media macro agregada. Los resultados detallados por benchmark se presentan en la model card como una imagen (`9B_head_fig.jpg`) y no estan disponibles en formato textual, por lo que no se reproducen cifras concretas por prueba.

| Metrica | NeoHorse-1-9B | Qwen3.5-9B | Diferencia |
|---|---|---|---|
| Media macro (10 benchmarks) | 69,04 | 65,60 | +3,44 |

No se han publicado en la informacion disponible los resultados individuales por benchmark (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (8,95B) y del tamano por parametro de cada cuantizacion; no incluyen el cache KV, cuya huella depende de la longitud de contexto y del numero de secuencias concurrentes.

- VRAM estimada para inferencia (solo pesos):
  - BF16 / 16 bits: ~17,9 GB.
  - 8 bits: ~9,0 GB.
  - 5 bits: ~6,3 GB.
  - 4 bits: ~5,0 GB.
- GPU recomendadas: para BF16 completo, GPU de 24 GB o mas (RTX 3090/4090, A5000, L40S) o de datacenter (A100, H100). Para cuantizaciones de 4-5 bits, GPU de 8-12 GB pueden ser suficientes para los pesos, con margen adicional para el cache KV.
- Viabilidad en GPU de consumo: si. Las versiones de 4 y 5 bits estan pensadas para desplegarse en equipos de consumo; la de 8 bits requiere al menos 12-16 GB de VRAM para operar con holgura.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (mencionados explicitamente). El repositorio incluye el tag `llama-cpp` y `endpoints_compatible`.
- Recomendaciones de uso publicadas: en LM Studio, cargar con decodificacion especulativa MTP desactivada y empezar con un contexto de 4K, aumentandolo segun la memoria disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media macro (10 benchmarks) | Licencia | Formato |
|---|---|---|---|---|---|
| NeoHorse-1-9B | ~8,95B | No disponible | 69,04 | Apache-2.0 | GGUF, safetensors |
| Qwen3.5-9B (modelo base) | ~9B | No disponible | 65,60 | No disponible en esta ficha | No disponible en esta ficha |

Los datos de contexto y licencia de Qwen3.5-9B no se detallan en la informacion proporcionada. No se dispone de datos comparativos con otros modelos de tamano similar en la informacion disponible.

## Limitaciones y advertencias

- Es un prototipo inicial: la propia model card lo describe como "initial prototype" en la ruta hacia la automejora recursiva, no como un modelo de produccion maduro.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al derivar de Qwen3.5-9B, hereda las caracteristicas de su corpus base, no descrito aqui.
- Riesgo de alucinacion: no cuantificado ni documentado en la informacion disponible. Como modelo generativo de texto, es susceptible a alucinaciones, especialmente en tareas de razonamiento y uso de herramientas donde los hechos deben ser verificados.
- Limitaciones de contexto e idioma: la longitud de contexto maxima no esta declarada; se recomienda empezar con 4K y ajustar manualmente. Los idiomas soportados no estan declarados.
- Modo de razonamiento: en determinados entornos debe desactivarse explicitamente (por ejemplo, `reasoning: "off"` en la API nativa de LM Studio), lo que puede afectar al comportamiento por defecto si no se configura.
- Decodificacion especulativa: se recomienda desactivar MTP speculative decoding al cargar el modelo en LM Studio.
- Licencia: Apache-2.0, permisiva para uso comercial, siempre que se respeten las condiciones de la licencia (atribucion y conservacion del aviso de licencia).
- Este repositorio solo contiene pesos de texto; no debe esperarse ninguna capacidad multimodal.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-1-9B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Modelo base original (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub: https://github.com/TokenRhythm/NeoHorse
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.08183
- Sitio de la empresa: https://tokenrhythm.ai/
- Organizacion en HuggingFace: https://huggingface.co/TokenRhythm
- Twitter / X: https://x.com/opensquilla
- Articulo en AI/TLDR: https://ai-tldr.dev/releases/tokenrhythm-neohorse-1/
- Nota en note.com: https://note.com/gensnotes/n/n759dac4cd0a2
