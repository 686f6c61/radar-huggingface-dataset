# trfrasdf/reality-1.1

## Resumen

reality-1.1 es un adaptador LoRA (PEFT) desarrollado por trfrasdf sobre el modelo base Qwen/Qwen3.6-27B, especializado en razonamiento para programación competitiva de estilo USACO (Bronze a Platinum). El adaptador, de rango 32 y alpha 32 aplicado a módulos lineales, genera una traza de razonamiento explícita (formato `thinking… response`) seguida de una solución en Python. Su relevancia radica en que demuestra cómo un ajuste fino ligero sobre un modelo abierto de 27B puede mejorar sustancialmente el rendimiento en problemas algorítmicos de olimpiada, con un pipeline de entrenamiento en tres etapas que combina destilación de cadenas de razonamiento verificadas, aprendizaje por refuerzo (GRPO) y destilación de trazas difíciles.

El modelo está pensado para desarrolladores e investigadores que trabajan en generación de código, razonamiento matemático y sistemas de resolución automática de problemas. Al ser un adaptador, requiere cargar el modelo base Qwen3.6-27B (Apache-2.0) y fusionar o aplicar el adaptador mediante la librería PEFT. El repositorio incluye 72 trazas de razonamiento completas y evaluadas en tests ocultos, organizadas por nivel de dificultad, lo que facilita la inspección cualitativa del comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.6-27B) + adaptador LoRA rank 32, alpha 32, target all-linear |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 27B parametros) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.6-27B, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (adaptador PEFT; el base puede cuantizarse, p. ej. 4-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (alpha 32) aplicado a todos los módulos lineales del transformer Qwen3.6-27B. El entrenamiento se realizó en tres etapas sobre un único adaptador: (1) destilación supervisada (SFT) de cadenas de razonamiento verificadas, extraídas de profesores tipo DeepSeek-R1/QwQ y filtradas para mantener trazas correctas y limpias; (2) aprendizaje por refuerzo con GRPO (group-relative policy optimization, grupo de 8) sobre 1.000 problemas de Codeforces con recompensa basada en el paso de casos de prueba; (3) destilación de trazas de razonamiento difíciles y verificadas (OpenCodeReasoning-2) para fomentar soluciones directas y comprometidas. El informe indica que el efecto aislado de la etapa de RL sobre USACO fue plano, aunque la maquinaria de RL funcionó correctamente. El entrenamiento se ejecutó en GPUs B200/H200 alquiladas, con verificación en sandbox sobre Modal.

## Capacidades

- Generación de razonamiento paso a paso (chain-of-thought) en formato `thinking… response` antes de emitir la solución.
- Escritura de soluciones en Python para problemas de programación competitiva de nivel USACO (Bronze a Platinum).
- Manejo de problemas algorítmicos que requieren lógica combinatoria, grafos, programación dinámica y estructuras de datos.
- Soporte de ventana de generación amplia (hasta 32K tokens) para problemas complejos que requieren razonamiento extenso.
- Herencia del chat template de Qwen3.6, incluyendo el modo `enable_thinking`.
- No se documenta soporte explícito de tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Resolución automática de problemas de olimpiada de informática: el modelo puede recibir el enunciado de un problema USACO y generar una solución Python razonada, útil para plataformas de entrenamiento y competición.
- Generación de código con razonamiento explícito: en entornos de desarrollo, el modelo produce explicaciones intermedias que ayudan a depurar y entender la lógica antes de ejecutar el código.
- Evaluación de modelos de razonamiento: las 72 trazas de ejemplo incluidas en el repositorio permiten analizar el comportamiento del modelo en distintos niveles de dificultad, sirviendo como referencia para investigación.
- Asistente de estudio para programación competitiva: estudiantes pueden usarlo para obtener soluciones comentadas y explicaciones de problemas tipo USACO, mejorando su comprensión de algoritmos.
- Integración en pipelines de generación de código con verificación: al fusionar el adaptador con el base, puede servirse con vLLM o SGLang y combinarse con ejecutores de tests para validar soluciones automáticamente.
- Benchmarking de adaptadores LoRA: el pipeline de entrenamiento documentado (SFT + GRPO + destilación) sirve como plantilla para experimentos de ajuste fino en dominios específicos.

## Benchmarks y rendimiento

El modelo se evaluó en el benchmark USACO (307 problemas, cuatro niveles oficiales) con métrica best-of-draws (mejor resultado sobre varias muestras a temperatura 0.8, con crédito parcial por casos de test superados). Los resultados se comparan con el modelo base Qwen3.6-27B, cuyos números provienen del paper DiDPO (arXiv:2608.07147) y son direccionales, no un experimento controlado.

| Nivel | reality-1.1 (best-of-draws) | Qwen3.6-27B base |
|---|---|---|
| Bronze | 95.8% | 86.2% |
| Silver | 88.7% | 67.0% |
| Gold | 76.0% | 54.0% |
| Platinum | 29.5% | 19.0% |
| Overall (ponderado 123/100/63/21) | 84.9% | 68.7% |

La mejora se atribuye principalmente a la "disciplina de compromiso" (capacidad de llegar a una solución y escribirla) más que a un techo de razonamiento superior. El modelo es fiable hasta Gold y muestra una caída pronunciada en Platinum.

## Requisitos de hardware

- El adaptador LoRA es ligero (1.0 GB en el repositorio), pero requiere cargar el modelo base Qwen3.6-27B en memoria.
- Para inferencia en FP16/BF16, el base necesita aproximadamente 54 GB de VRAM, por lo que se recomienda una GPU de 80 GB (A100, H100) o varias GPUs.
- Con cuantización 4-bit del base (p. ej. bitsandbytes), podría caber en una RTX 4090 (24 GB) o similar, aunque no se documenta oficialmente.
- Opciones de despliegue: vLLM o SGLang tras fusionar el adaptador con el base (`model.merge_and_unload()`); también puede usarse con transformers y PEFT directamente.
- La generación puede requerir hasta 32K tokens de salida, lo que implica latencias altas en problemas difíciles; se recomienda usar decodificación con temperatura 0.6, top_p 0.95 y top_k 20 (no greedy).

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base Qwen3.6-27B, cuyos resultados se muestran en la tabla de benchmarks. No se proporcionan datos de otros modelos de programación competitiva (p. ej. DeepSeek-R1, QwQ, o adaptadores similares) en la misma configuración de evaluación, por lo que no se puede establecer una comparativa directa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | USACO overall | Licencia |
|---|---|---|---|---|
| reality-1.1 (adaptador) | 27B base + LoRA | No disponible | 84.9% (best-of-draws) | Apache-2.0 |
| Qwen3.6-27B (base) | 27B | No disponible | 68.7% (según DiDPO) | Apache-2.0 |

## Limitaciones y advertencias

- El modelo muestra un muro de rendimiento en el nivel Platinum (29.5%), lo que indica una capacidad limitada para problemas de muy alta dificultad.
- La comparación con el base es direccional y no controlada: los números del base provienen de un paper externo y pueden usar métricas distintas (crédito estricto vs. parcial).
- El modelo está entrenado exclusivamente en inglés; no se garantiza un buen rendimiento en otros idiomas.
- Puede generar soluciones incorrectas o alucinar razonamientos plausibles pero erróneos, especialmente en problemas fuera de su dominio de entrenamiento.
- Al ser un adaptador, requiere el modelo base Qwen3.6-27B, que debe descargarse por separado; la licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del base.
- El uso de decodificación con temperatura es obligatorio (no usar greedy), y se necesita un presupuesto de tokens de salida amplio (hasta 32K) para problemas complejos, lo que incrementa el coste computacional.
- El autor declara que es un artefacto de investigación independiente, sin afiliación con USACO, Codeforces, Alibaba/Qwen, DeepSeek, NVIDIA o Microsoft.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trfrasdf/reality-1.1
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper USACO benchmark: https://arxiv.org/abs/2404.10952
- Paper DiDPO (referencia de evaluación del base): https://arxiv.org/abs/2608.07147
- Paper OpenCodeReasoning-2 (destilación de trazas): https://arxiv.org/abs/2505.21297
