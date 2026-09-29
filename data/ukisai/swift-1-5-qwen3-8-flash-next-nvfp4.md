# ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-NVFP4 es la versión cuantizada en NVFP4 del modelo Swift 1.5 Qwen3.8-Flash-Next, un derivado de Qwen3.8-Flash-Next desarrollado por UkisAI y orientado a la eficiencia de razonamiento. Según la model card, reduce un 63,4% los tokens de pensamiento y acelera la inferencia 1,8x manteniendo una pérdida de precisión inferior al 1% respecto al modelo base en modo xhigh. El repositorio declara 119.602.003.859 parámetros totales según los pesos safetensors y una arquitectura de mezcla de expertos (MoE) multimodal, con pipeline image-text-to-text.

El interés de esta ficha concreta reside en el formato NVFP4, que habilita ejecución nativa en hardware NVIDIA Blackwell y reduce de forma notable el coste de memoria y cómputo frente a la variante BF16 del mismo modelo. UkisAI presenta esta familia como una optimización de "pensamiento comprimido": en lugar de recortar directamente la longitud de la cadena de razonamiento, penaliza durante el post-entrenamiento los tokens asociados a sobrepensamiento patológico y recupera precisión después mediante RL y OPD.

Se trata de un modelo con licencia propietaria (swift-open-license-1.0), repositorio con acceso restringido (gated) y opciones de licencia enterprise, por lo que su uso comercial queda sujeto a los términos del autor y no a una licencia abierta estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); etiqueta `qwen4_exp` |
| Parámetros totales | 119.602.003.859 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según la configuración de serving publicada) |
| Tipos de cuantización | NVFP4 (esta versión); BF16 en el modelo base; también GGUF y GSQ-RCO GGUF en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`), con licencia enterprise y acceso restringido (gated) |
| Formato de pesos | safetensors (NVFP4); GGUF en las variantes alternativas |

Otras etiquetas declaradas: `quantized`, `nvfp4`, `moe`, `reasoning`, `efficient-thinking`, `token-efficient`, `post-training`, `agentic`, `terminal-bench`, `conversational`, `endpoints_compatible`, `8-bit`, `modelopt`.

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con mezcla de expertos (MoE), derivado de Qwen3.8-Flash-Next y cuantizado en este repositorio al formato NVFP4. El pipeline declarado es image-text-to-text, lo que implica soporte de entrada de imagen y texto. El contexto de serving reportado es de 262.144 tokens, con parser de razonamiento Qwen3 y MTP deshabilitado en la configuración de evaluación. El repositorio ocupa 186,5 GB, coherente con un checkpoint cuantizado de gran tamaño que incluye los pesos y metadatos de ModelOpt.

El enfoque de entrenamiento descrito penaliza los tokens vinculados a sobrepensamiento patológico sin atacar directamente la longitud del razonamiento, y recupera precisión posteriormente mediante RL y OPD (on-policy distillation, según la nomenclatura del autor). El ajuste posterior se orienta específicamente a código y trabajo de agente de horizonte largo (agentes personales, uso de terminal y ingeniería de software). Los datos de entrenamiento proceden del dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, aunque el autor aclara que no se usan tal cual, sino re-muestreados y convertidos en entornos de RL. En el ejemplo comparativo publicado (generación de un juego endless runner en 3D), el modelo base tardó 8 minutos 52 segundos y Swift 1.5 tardó 4 minutos 56 segundos.

## Capacidades

- Razonamiento con modo de pensamiento optimizado: trazas de pensamiento más cortas y menor incidencia de errores por sobrepensamiento.
- Generación de código: capaz de producir proyectos funcionales completos (el ejemplo de la model card es un juego 3D ejecutable localmente).
- Trabajo agéntico y de horizonte largo: uso de terminal, ingeniería de software y agentes personales.
- Multimodalidad de entrada: al estar etiquetado como image-text-to-text, admite entradas de imagen además de texto.
- Conversación multi-turno: etiqueta `conversational` y dataset de entrenamiento específico de agente multi-turno.
- Eficiencia de tokens: 63,4% menos tokens de pensamiento y 1,8x de aceleración frente al base en xhigh.
- Compatibilidad con endpoints servidos: etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (la etiqueta `agentic` y el trabajo en terminal sugieren uso con herramientas, pero no se detalla).
- Idiomas: no disponible.

## Casos de uso

- Generación de código en producción: dado su ajuste específico en código y su soporte de razonamiento comprimido, resulta adecuado para pipelines de generación y revisión de código donde el coste por token importa. El ejemplo de la model card (crear un juego funcional y explicar cómo ejecutarlo) ilustra este uso de extremo a extremo.
- Agentes de terminal y automatización de shell: el modelo está post-entrenado para uso de terminal, por lo que encaja en agentes que ejecutan comandos, interpretan salidas y corrigen errores en bucle sobre un entorno real.
- Ingeniería de software asistida con horizonte largo: sesiones largas de refactorización o depuración en las que el contexto de 262.144 tokens permite mantener en memoria múltiples ficheros y el historial de decisiones.
- Agentes personales multi-turno: la ventana de contexto amplia y el entrenamiento sobre un dataset de agente multi-turno lo hacen apto para asistentes que mantienen estado a lo largo de muchas interacciones.
- Asistencia multimodal sobre documentos: al admitir entrada de imagen y texto, puede procesar capturas, diagramas o interfaces combinadas con instrucciones textuales.
- Servicio de razonamiento a gran escala con coste controlado: la reducción del 63,4% en tokens de pensamiento y la aceleración de 1,8x lo hacen adecuado cuando el gasto de inferencia en tokens de razonamiento es un cuello de botella.
- Despliegue en hardware Blackwell: la cuantización NVFP4 permite servir el modelo aprovechando el soporte nativo de FP4 de las GPU NVIDIA de esa generación, reduciendo la huella de memoria frente a BF16.

## Benchmarks y rendimiento

La model card incluye una sección de evaluación que compara Qwen3.8-Flash-Next BF16 base con el checkpoint Swift 1.5 BF16, con columnas de tokens de pensamiento (y de tokens totales generados en Terminal-Bench 2.1) y una configuración de serving a 262.144 de contexto, thinking xhigh, MTP deshabilitado, temperatura 1.0, top_p 0.95, top_k 20 y min_p 0. No obstante, la tabla de resultados numéricos por benchmark aparece truncada en la información proporcionada, por lo que no se reproducen cifras concretas de MMLU, HumanEval, GSM8K u otros.

Los únicos datos de rendimiento verificables en la información disponible son relativos:

| Métrica | Valor |
|---|---|
| Reducción de tokens de pensamiento | 63,4% |
| Aceleración frente al base | 1,8x |
| Pérdida de precisión frente al base (xhigh) | <1% |
| Tiempo de generación del demo (base) | 8 min 52 s |
| Tiempo de generación del demo (Swift 1.5) | 4 min 56 s |

No se han publicado resultados numéricos completos de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones basadas en el recuento de parámetros (119,6B) y el formato de cuantización; no proceden de mediciones oficiales del autor.

- VRAM estimada solo para pesos: aproximadamente 60-70 GB en NVFP4 (4 bits por peso, más escalas), en torno a 120 GB en 8 bits y cerca de 240 GB en BF16.
- A la VRAM de pesos hay que sumar la caché KV, que con 262.144 tokens de contexto puede ser muy elevada y obliga a servir con paralelismo de tensor o a limitar la longitud efectiva.
- Ejecución nativa NVFP4: requiere GPU NVIDIA compatible con Blackwell (familia B100, B200, GB200 y GPU de consumo Blackwell con soporte FP4) y un runtime compatible con ModelOpt.
- Cabe en GPU de consumo: la variante NVFP4 podría caber en una GPU Blackwell de gama alta con memoria suficiente, aunque el contexto largo condicionará el uso real; las variantes GGUF son la vía habitual para equipos de consumo.
- Opciones de despliegue: runtime compatible con ModelOpt para NVFP4 nativo, vLLM y transformers para el formato safetensors, y llama.cpp/Ollama para las variantes GGUF publicadas por el autor.
- Latencia y throughput: solo se conoce la mejora relativa de 1,8x frente al modelo base; no se han publicado valores absolutos de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-Flash-Next-NVFP4 (este) | 119,6B totales | 262.144 | NVFP4 | swift-open-license-1.0 | Versión cuantizada; requiere Blackwell para NVFP4 nativo |
| Swift-Qwen3.8-Flash-Next (base del que deriva) | no disponible | no disponible | BF16 | swift-open-license-1.0 | Modelo base declarado del que se deriva esta versión |
| Swift 1.5 Qwen3.8-Flash-Next | no disponible | 262.144 (según serving) | BF16 | swift-open-license-1.0 | Versión sin cuantizar; referencia de la comparativa de benchmarks |
| Qwen3.8-Flash-Next (origen) | no disponible | no disponible | BF16 | no disponible | Modelo original de Qwen sobre el que se construye la familia Swift |
| Swift-1.5-Qwen3.8-27b-NVFP4 | no disponible | no disponible | NVFP4 | swift-open-license-1.0 | Variante hermana de menor tamaño según el nombre del repositorio |

No se dispone de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria: swift-open-license-1.0 no es una licencia open source estándar; el uso comercial está sujeto a los términos del autor y existe una vía de licencia enterprise separada.
- Acceso restringido: el repositorio está marcado como `gated`, por lo que es necesario aceptar condiciones para descargarlo.
- Dependencia de hardware: la ejecución nativa en NVFP4 exige GPU NVIDIA con soporte Blackwell; en hardware anterior habrá que recurrir a las variantes GGUF o al checkpoint BF16.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de tasas de alucinación en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Idiomas: la lista de idiomas soportados no está disponible, lo que dificulta planificar despliegues multilingües.
- Parámetros activos desconocidos: al ser MoE, no se indica el número de parámetros activos, dato relevante para estimar coste de cómputo por token.
- Benchmarks incompletos: la tabla de evaluación publicada no está disponible al completo, por lo que no se pueden verificar los resultados por tarea.
- Advertencia de producción: la propia model card señala que NVFP4 requiere soporte Blackwell; conviene validar la precisión tras la cuantización en el dominio de uso concreto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Árbol de ficheros del repositorio: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4/tree/main
- Modelo base (BF16): https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Versión GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Versión GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Variante hermana de 27B en NVFP4: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-NVFP4
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Página de producto: https://ukisai.com/swift-1-5-flash-next
- Producto Swift: https://ukisai.com/products/swift
- Sitio del autor: https://ukisai.com
- Demo interactiva del juego: https://ukisai.com/swift-games/flash-next
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
