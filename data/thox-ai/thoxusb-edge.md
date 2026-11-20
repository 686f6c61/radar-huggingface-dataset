# Thox-ai/ThoxUSB-Edge

## Resumen

ThoxUSB-Edge es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B desarrollado por THOX.ai para su programa de dispositivos THOX. Se trata de un modelo de generación de texto orientado a la ejecución local en dispositivos de borde (edge), con un total de 752.393.024 parámetros reales en safetensors (la model card declara 873M, discrepancia que conviene tener en cuenta). El modelo se publica tanto en formato safetensors como en un GGUF Q4_K_M de 529 MB, pensado para hosts con al menos 1 GB de RAM.

El modelo está ajustado sobre corpus de chat y de uso de agentes/herramientas de THOX, con el objetivo declarado de servir como asistente en dispositivo y enrutador de herramientas dentro del programa THOX. La arquitectura subyacente es la del modelo base Qwen3.5-0.8B (familia Qwen3.5, tag `qwen3_5_text`), aunque la información disponible no detalla los pormenores de su arquitectura interna.

Es relevante ahora por su enfoque local-first y su tamaño reducido, que permite despliegue en hardware muy limitado. No obstante, el propio autor lo marca como EXPERIMENTAL: no hay log de entrenamiento, benchmarks medidos ni validación en dispositivo publicados. La licencia es Apache-2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`); detalles internos no disponibles |
| Parámetros totales | 752.393.024 (safetensors); la model card declara 873M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (GGUF); safetensors en precisión original |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura del modelo base de la familia Qwen3.5, etiquetada en el repositorio como `qwen3_5_text`. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención ni tipo de positional encoding), por lo que no es posible confirmar si incorpora innovaciones como atención lineal o decodificación especulativa.

En cuanto al entrenamiento, la model card indica que se trata de un ajuste fino supervisado (SFT) sobre corpus de chat y de uso de agentes/herramientas de THOX. No se publica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor declara explícitamente que no hay log de entrenamiento publicado para esta build. El repositorio incluye pesos completos y tokenizador, con un `model.safetensors` de 1.504.827.608 bytes y un GGUF Q4_K_M de 529.288.992 bytes.

## Capacidades

- Generación de texto conversacional en inglés.
- Uso previsto como asistente en dispositivo y enrutador de herramientas (tool routing) dentro del programa THOX.
- Ajustado sobre corpus de agentes y uso de herramientas, lo que sugiere soporte de tool calling, aunque no se documenta formalmente la interfaz.
- Capacidades multilingües limitadas: solo se declara inglés; el rendimiento en otros idiomas es inferior según el autor.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito (thinking mode) ni otras modalidades.
- No se detallan capacidades específicas de código o matemáticas más allá de las heredadas del modelo base.

## Casos de uso

- Asistente conversacional en dispositivo de borde: el modelo, con 529 MB en Q4_K_M, puede ejecutarse en hosts con 1 GB de RAM para mantener conversaciones multi-turno básicas en inglés sin conexión a la nube.
- Enrutamiento de herramientas en dispositivos THOX: su ajuste sobre corpus de agentes y tool-use lo hace adecuado para decidir qué herramienta invocar en flujos de automatización local.
- Prototipado de asistentes local-first: útil para validar pipelines de inferencia en llama.cpp u Ollama antes de escalar a modelos mayores.
- Automatización de tareas simples en hardware embebido: generación de respuestas cortas y clasificación de intenciones en entornos con recursos muy limitados.
- Pruebas de integración con Ollama: el repositorio incluye un Modelfile y el comando `ollama run hf.co/Thox-ai/ThoxUSB-Edge:Q4_K_M`, lo que facilita evaluar el modelo en flujos de desarrollo.
- Base para fine-tunes posteriores: al ser Apache-2.0 y de tamaño reducido, sirve como punto de partida para ajustes específicos de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultado THOX GATE49 ni benchmark publicado para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: al menos 1 GB de RAM para la build Q4_K_M (529 MB de pesos más overhead); el safetensors completo requiere aproximadamente 1,5 GB.
- GPU recomendadas: no se especifican; por tamaño, cabe en GPUs consumer de gama baja y en CPU.
- Cabe en GPU consumer: sí, por su tamaño reducido (inferencia en CPU también viable).
- Opciones de despliegue: llama.cpp (`llama-cli`) y Ollama; se requiere una build con soporte para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ThoxUSB-Edge | 752M (declarado 873M) | No disponible | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | No disponible en la información | Hugging Face |
| Alternativas de ~1B para edge | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado ni de otras alternativas documentadas en la información proporcionada.

## Limitaciones y advertencias

- Build experimental: no hay validación en dispositivo, log de entrenamiento ni benchmarks; el autor recomienda verificar las salidas antes de confiar en ellas.
- Los modelos pequeños cometen errores factuales y pueden producir respuestas seguras pero incorrectas (alucinaciones).
- El comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en inglés; la calidad en otros idiomas es inferior.
- La cuantización Q4_K_M intercambia precisión por tamaño.
- Uso fuera de alcance: decisiones críticas de seguridad, médicas o legales sin supervisión humana, y control no atendido de dispositivos físicos sin paso de confirmación.
- Discrepancia entre los parámetros declarados en la model card (873M) y los reales en safetensors (752M), que conviene verificar.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la licencia y el NOTICE.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxUSB-Edge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Descarga del GGUF: `hf download Thox-ai/ThoxUSB-Edge ThoxUSB-Edge.Q4_K_M.gguf --local-dir ./ThoxUSB-Edge`
- Ejecución con Ollama: `ollama run hf.co/Thox-ai/ThoxUSB-Edge:Q4_K_M`
