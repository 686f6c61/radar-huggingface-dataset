# subs-king/zils-flash-cerno-9b-v1.2

## Resumen

Zils d3-flash soup body: Cerno 9B v1.2 es un reempaquetado del modelo apertixai/cerno-9b-v1.2, publicado por el usuario subs-king en HuggingFace. No se trata de un modelo entrenado desde cero ni de un fine-tuning: los pesos de lenguaje son los originales del modelo base, sin modificar, y los cambios introducidos se limitan al layout de tensores, la disposición de shards y la incorporación de una torre de visión procedente de Qwen/Qwen3.5-9B. El propósito declarado es servir como "soup body" para la subred Zils (Bittensor SN127), pool d3-flash.

El modelo cuenta con 8.392.695.024 parámetros en formato safetensors (aproximadamente 8,4 mil millones), con un tamaño de repositorio de 16,8 GB. La licencia es Apache 2.0, heredada del modelo original. No se incluyen los tensores `lm_head` ni `mtp`, lo que condiciona su uso directo para inferencia de texto sin una cabeza de lenguaje adicional.

La relevancia de esta ficha es acotada: se trata de un artefacto de infraestructura para un ecosistema de subred descentralizada, no de un modelo de propósito general listo para producción. La información pública disponible es mínima (cero descargas, cero likes en el momento de la consulta) y la model card no documenta datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base apertixai/cerno-9b-v1.2; no documentada en la informacion proporcionada) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base apertixai/cerno-9b-v1.2: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni se detalla el número de capas, dimensiones ocultas o mecanismo de atención. Lo único verificable es el recuento de parámetros (8.392.695.024) y que el reempaquetado incorpora una torre de visión tomada de Qwen/Qwen3.5-9B en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, requisito del layout de cuerpo Zils.

Respecto al entrenamiento, no se han publicado datos sobre número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. El autor del reempaquetado declara explícitamente que los pesos de lenguaje son los originales sin cambios y que las únicas modificaciones son de empaquetado: nombres de tensores, distribución en shards y adición de la torre de visión. Los tensores `lm_head` y `mtp` no están incluidos en la exportación.

## Capacidades

- Generación de texto: heredada del modelo base, aunque la ausencia de `lm_head` en este repositorio impide el uso directo sin restaurar esa cabeza desde el modelo original.
- Procesamiento de visión: incorpora la torre de visión de Qwen/Qwen3.5-9B, lo que habilita entrada multimodal de imágenes según el layout Zils, aunque no se documenta el pipeline ni el procesador asociado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Integración como cuerpo en la subred Zils (Bittensor SN127): el caso de uso principal y declarado es servir como "soup body" del pool d3-flash, es decir, como componente de pesos dentro de la infraestructura de esa subred, no como modelo autónomo.
- Experimentación con layouts multimodales: investigadores que necesiten reproducir el esquema de cuerpo Zils con torre de visión Qwen3.5-9B pueden usar este repositorio como referencia de empaquetado de tensores y shards.
- Evaluación comparativa de reempaquetados: útil para estudiar cómo afecta el cambio de layout y la sustitución de la torre visual al comportamiento del modelo base frente al original apertixai/cerno-9b-v1.2.
- Base para reconstrucción de un modelo de texto completo: partiendo de estos pesos y restaurando `lm_head` y `mtp` desde el modelo original, podría emplearse en tareas de generación de texto, aunque requeriría trabajo adicional de integración.
- Investigación sobre pipelines de visión-lenguaje: la combinación de pesos de lenguaje Cerno con torre visual Qwen3.5-9B permite estudiar alineación entre componentes de distinto origen.
- Distribución en entornos descentralizados: el formato safetensors y la licencia Apache 2.0 facilitan su redistribución dentro de infraestructuras de subredes o repositorios espejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, por encima de 20 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8,4 GB para pesos, no disponible como artefacto publicado.
- VRAM estimada en cuantización de 4 bits: alrededor de 4,2 GB para pesos, no disponible como artefacto publicado.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamaño, cabría esperar funcionamiento en A100, H100 o RTX 4090 en fp16, pero no está verificado.
- Compatibilidad con GPU de consumo: probable en tarjetas con 24 GB o más en fp16 (por ejemplo RTX 3090/4090), condicionado a la disponibilidad de `lm_head`; no confirmado por el autor.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de `lm_head` y de cuantizaciones GGUF limita el despliegue directo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| subs-king/zils-flash-cerno-9b-v1.2 | 8.392.695.024 | no disponible | Apache 2.0 | safetensors | Reempaquetado para Zils SN127; sin `lm_head`/`mtp`; torre de visión Qwen3.5-9B |
| apertixai/cerno-9b-v1.2 | no disponible (modelo base, ~9B por nombre) | no disponible | Apache 2.0 (heredada) | no disponible | Modelo original del que proceden los pesos de lenguaje |
| Qwen/Qwen3.5-9B | no disponible (~9B por nombre) | no disponible | no disponible | no disponible | Origen de la torre de visión incorporada en la revisión indicada |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Ausencia de `lm_head` y `mtp`: el repositorio no es directamente ejecutable para generación de texto sin restaurar esas cabezas desde el modelo original.
- Sin documentación de arquitectura, contexto o idiomas: imposibilita planificar su uso en producción con garantías.
- Sin benchmarks publicados: no hay evidencia de calidad, razonamiento o rendimiento en tareas concretas.
- Naturaleza de artefacto de infraestructura: está diseñado para el layout de la subred Zils, no como modelo de propósito general; su uso fuera de ese ecosistema es experimental.
- Mezcla de componentes de distinto origen: pesos de lenguaje Cerno y torre visual Qwen3.5-9B pueden presentar desalineación multimodal no evaluada.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de la torre de visión originales, ya que el autor solo redistribuye bajo la licencia del modelo fuente.
- Actividad nula en el repositorio (0 descargas, 0 likes en la consulta): sin comunidad ni soporte, lo que reduce la fiabilidad de cualquier uso en producción.
- Fecha de creación registrada como 2026-11-04: conviene verificar la coherencia temporal de los metadatos antes de citar el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/subs-king/zils-flash-cerno-9b-v1.2
- Modelo base: https://huggingface.co/apertixai/cerno-9b-v1.2
- Modelo de origen de la torre de visión: https://huggingface.co/Qwen/Qwen3.5-9B
- Subred Zils (Bittensor SN127): no disponible enlace oficial en la informacion proporcionada.
