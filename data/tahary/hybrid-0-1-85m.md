# Tahary/Hybrid-0.1-85M

## Resumen

Hybrid-0.1-85M es un modelo de lenguaje causal de aproximadamente 85 millones de parámetros, desarrollado por el autor independiente Tahary (tahaenasraoui-debug) y publicado bajo licencia Apache 2.0. No es un modelo de propósito general, sino un **modelo borrador (draft model)** diseñado específicamente para decodificación especulativa (speculative decoding) sobre la familia Qwen2.5, en concreto Qwen2.5-0.5B, Qwen2.5-1.5B y Qwen2.5-7B. Su función es proponer tokens candidatos que el modelo objetivo verifica en paralelo, acelerando la generación sin alterar la salida final.

La arquitectura es un transformer decoder de solo 5 capas, con dimensión oculta de 480, 8 cabezas de consulta y 2 cabezas clave-valor (Grouped Query Attention), activaciones SwiGLU con dimensión intermedia de 1280, codificación posicional RoPE con theta de 1.000.000 y embeddings atados. Emplea el tokenizador BPE exacto de Qwen2.5 con un vocabulario de 151.936 tokens, requisito imprescindible para que las secuencias de borrador y objetivo sean compatibles en la verificación especulativa.

Su relevancia actual radica en que ocupa un nicho muy concreto: reducir la latencia de inferencia de modelos Qwen2.5 en despliegues con recursos limitados. El autor reporta aceleraciones de 2x a 3x en configuraciones heterogéneas (borrador en GPU, objetivo en CPU/GPU) manteniendo fidelidad matemática del 100 % en la salida. El repositorio ocupa 0,3 GB y el modelo se distribuye como checkpoint PyTorch (`final_trained_draft_85m.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal, 5 capas, GQA (8 cabezas Q / 2 cabezas KV), SwiGLU, RoPE (theta = 1.000.000) |
| Parametros totales | ~85.000.000 (85M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se carga en PyTorch; el ejemplo usa `torch.load` sin cuantizacion explicita) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pt`), no safetensors ni GGUF |
| Dimension oculta (d_model) | 480 |
| Dimension intermedia (SwiGLU) | 1280 |
| Vocabulario | 151.936 (tokenizador BPE exacto de Qwen2.5, embeddings atados) |
| Entrenamiento | SFT sobre 67.000 pares de instrucciones conversacionales, 15.000 pasos, loss final 1,01 |

## Arquitectura y entrenamiento

Hybrid-0.1-85M es un transformer decoder de 5 capas con atención de consultas agrupadas (GQA), 8 cabezas de consulta y 2 cabezas clave-valor, lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa. Usa SwiGLU como activación con dimensión intermedia de 1280, RoPE con theta de 1.000.000 para la codificación posicional y embeddings atados entre entrada y salida. La dimensión oculta es de 480 y el vocabulario replica exactamente el tokenizador BPE de Qwen2.5 (151.936 tokens), condición necesaria para que las propuestas del borrador sean verificables por el modelo objetivo.

El entrenamiento consistió en un ajuste supervisado (SFT) sobre 67.000 pares de instrucciones conversacionales durante 15.000 pasos, alcanzando una loss final de 1,01. No se documenta en la información disponible el número total de tokens procesados, la composición del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica no reside en el modelo en sí, sino en su uso como pieza de un motor de decodificación especulativa sin pérdida (lossless), donde el modelo objetivo valida cada token propuesto y garantiza la misma distribución de salida que la decodificación estándar.

## Capacidades

- Generación de texto causal en inglés y chino, entrenado mediante SFT sobre pares de instrucciones conversacionales.
- Generación de tokens candidatos para decodificación especulativa sobre Qwen2.5-0.5B, Qwen2.5-1.5B y Qwen2.5-7B.
- Compatibilidad de tokenizador con toda la familia Qwen2.5 (BPE de 151.936 tokens), lo que permite emparejarlo con distintos tamaños objetivo sin reentrenamiento.
- Verificación sin pérdida: el motor especulativo garantiza fidelidad matemática del 100 % respecto a la salida del modelo objetivo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.
- No se documenta un modo de chat o plantilla de prompt específica más allá del formato conversacional usado en el SFT.

## Casos de uso

- Aceleración de inferencia de Qwen2.5-1.5B en GPU de consumo: usar Hybrid-0.1-85M como borrador y Qwen2.5-1.5B como objetivo permite obtener aceleraciones de 2x a 3x en la generación, con la misma salida que la decodificación estándar, según reporta el autor.
- Despliegue heterogéneo CPU/GPU: ejecutar el borrador de 85M en GPU y el modelo objetivo en CPU reduce la latencia en entornos sin GPU de gran capacidad, un escenario habitual en estaciones de trabajo o portátiles.
- Servicio de chat de bajo coste: al reducir el número de pasos de decodificación del modelo objetivo, se abarata el coste por token generado en endpoints de conversación con Qwen2.5-0.5B o 1.5B.
- Prototipado de pipelines de decodificación especulativa: el repositorio de GitHub incluye el `SpeculativeEngine` y la configuración `get_qwen_85m_config()`, lo que facilita experimentar con distintos valores de `k` (número de tokens propuestos) y medir el trade-off entre aceptación y latencia.
- Investigación sobre draft models: su tamaño reducido (0,3 GB de repositorio, 5 capas) lo hace adecuado para estudiar la tasa de aceptación de tokens y el comportamiento de la verificación especulativa en entornos académicos con recursos limitados.
- Generación de texto directa en inglés o chino: aunque su propósito principal es ser borrador, el modelo puede usarse de forma autónoma para generación conversacional básica, con la calidad limitada que impone su tamaño de 85M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta una aceleración de 2x a 3x en decodificación especulativa heterogénea y una fidelidad de salida del 100 % respecto al modelo objetivo, sin cifras de MMLU, HumanEval, GSM8K ni tasas de aceptación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~85M parámetros; en FP16 ocupa aproximadamente 170 MB de pesos, más la caché KV del contexto. Cabe holgadamente en cualquier GPU con 1 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve como borrador; el autor plantea ejecutarlo en GPU mientras el objetivo corre en CPU o GPU. Para el objetivo Qwen2.5-7B se recomienda A100, H100 o RTX 4090; para Qwen2.5-0.5B y 1.5B basta una RTX 3060 o superior.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (RTX 3060, 4060, 4090, etc.), dado su reducido tamaño.
- Opciones de despliegue: el ejemplo oficial usa PyTorch puro con `torch.load` y el `SpeculativeEngine` del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (`.pt`) no es directamente compatible con estas herramientas sin conversión.
- Latencia y throughput estimados: no disponible de forma absoluta; el autor reporta una mejora relativa de 2x a 3x frente a la decodificación estándar del objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| Hybrid-0.1-85M | ~85M | no disponible | Draft model para Qwen2.5 | Apache 2.0 | PyTorch `.pt` |
| Qwen2.5-0.5B | ~500M | no disponible en la informacion | Modelo generalista | Apache 2.0 | safetensors |
| Modelos draft de EAGLE / Medusa | no disponible | no disponible | Decodificacion especulativa | variable | variable |

No se dispone de datos de rendimiento comparativos entre Hybrid-0.1-85M y otros draft models en la información proporcionada. La comparación relevante es funcional: Hybrid-0.1-85M es un borrador específico para Qwen2.5, mientras que Qwen2.5-0.5B puede actuar como borrador genérico pero con mayor coste computacional.

## Limitaciones y advertencias

- Modelo de 85M parámetros: su calidad como generador autónomo es muy limitada; está pensado exclusivamente como borrador dentro de un motor especulativo.
- Idiomas: solo se documentan inglés y chino; no hay evidencia de soporte para castellano ni otros idiomas.
- Longitud de contexto: no se especifica en la model card; conviene validar experimentalmente el contexto máximo efectivo antes de usarlo en producción.
- Formato de pesos propietario (`.pt`): requiere cargar la clase `SmallLLM` y la configuración del repositorio de GitHub, lo que dificulta la integración con servidores de inferencia estándar.
- Dependencia del tokenizador Qwen2.5: cualquier uso con un tokenizador distinto rompe la verificación especulativa.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; en este caso el riesgo se traslada al modelo objetivo, ya que la verificación garantiza la misma distribución de salida, pero no la veracidad del contenido.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar el repositorio de GitHub para conocer el estado de mantenimiento.
- Adopción muy baja (32 descargas, 1 like en el momento de la consulta): no hay validación comunitaria independiente de las cifras de aceleración reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tahary/Hybrid-0.1-85M
- Repositorio GitHub con código y motor especulativo: https://github.com/tahaenasraoui-debug/Hybrid-0.1-85M
- Modelo objetivo Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
