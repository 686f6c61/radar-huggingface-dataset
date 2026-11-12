# SubMaroon/GigaRP3.1-10B-A1.8B-GGUF

## Resumen

GigaRP3.1-10B-A1.8B es un ajuste fino (fine-tune) orientado a roleplay en ruso del modelo GigaChat 3 Lightning, desarrollado originalmente por ai-sage. El modelo parte de una arquitectura Mixture of Experts (MoE) con 10.672.535.616 parámetros totales y aproximadamente 1.800 millones de parámetros activos por token, lo que permite un equilibrio interesante entre capacidad y coste de inferencia. La versión publicada por SubMaroon en Hugging Face se distribuye en formato GGUF, lo que facilita su despliegue en entornos de inferencia local y servidores compatibles con llama.cpp y derivados.

El modelo incorpora un único LoRA ya fusionado en los pesos base, aplicado específicamente a las capas 8 a 25 en dos componentes: la proyección de salida de atención (`o_proj` y las filas de valor de `kv_b_proj`) y el experto compartido (`mlp.shared_experts`), ambos con una fuerza de 0,65. El entrenamiento empleó una función de pérdida GEM (beta 0,7), concebida como alternativa a la entropía cruzada que preserva la diversidad, con ventanas de 8192 tokens. Se enmascaran explícitamente en la pérdida una serie de patrones indeseados (frases de relleno, n-gramas repetidos, texto copiado de la model card, construcciones vacías y spans que repiten respuestas previas del propio modelo).

Es relevante ahora porque demuestra un patrón de especialización muy quirúrgico sobre un MoE de GigaChat, con una receta de entrenamiento documentada y reproducible, y porque se publica bajo licencia MIT con pesos en GGUF. No obstante, conviene subrayar que se trata de una compilación experimental privada, con cero descargas y cero likes en el momento de la consulta, y con soporte declarado únicamente para ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en GigaChat 3 Lightning; transformer con expertos enrutados y experto compartido |
| Parametros totales | 10.672.535.616 |
| Parametros activos | Aproximadamente 1.800 millones (1.8B) por token |
| Longitud de contexto | No disponible (ventanas de entrenamiento de 8192 tokens) |
| Tipos de cuantizacion | GGUF (el repo incluye pesos GGUF; no se detallan los niveles concretos) |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF y safetensors (tags del repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) heredado de GigaChat 3 Lightning, con 10.672.535.616 parámetros totales y unos 1.800 millones activos por token. El ajuste fino se realizó mediante un único LoRA fusionado en los pesos base, aplicado a las capas 8 a 25 en dos ubicaciones concretas: la proyección de salida de atención (`o_proj` y las filas de valor de `kv_b_proj`) y el experto compartido (`mlp.shared_experts`), con una fuerza de 0,65 (donde 2,0 corresponde al valor tal como se entrenó). Los expertos enrutados, el router, las proyecciones de query y key, los embeddings y la cabeza de salida permanecen sin modificar. El bloque MTP (multi-token prediction) del modelo base se deja intacto y no se reentrena.

El entrenamiento utilizó la pérdida GEM con beta 0,7, una alternativa a la entropía cruzada orientada a preservar la diversidad, sobre ventanas de 8192 tokens. Se enmascararon explícitamente en la pérdida varias categorías de texto indeseado: frases de relleno (slop), n-gramas repetidos a nivel de dataset, texto copiado de la model card, construcciones vacías y spans que repiten respuestas anteriores del propio modelo. Además, se eliminó el bloque `developer system` de la plantilla de chat, ya que el modelo fue entrenado y probado sin él; la plantilla original del autor se conserva como `chat_template.original.jinja`.

## Capacidades

- Generación de texto conversacional en ruso, con especialización en roleplay.
- Conversaciones multi-turno con formato de chat estructurado mediante tokens especiales (`<|role_sep|>` y `<|message_sep|>`).
- Roles soportados en la plantilla: `system`, `user` y `assistant`.
- Ajuste orientado a mantener diversidad en las respuestas gracias a la pérdida GEM y al enmascaramiento de n-gramas repetidos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al ruso según la model card.

## Casos de uso

- Roleplay conversacional en ruso: el modelo está específicamente ajustado para mantener personajes y conversaciones multi-turno, con una plantilla de chat definida y una temperatura recomendada de 0,85 y min_p de 0,05 sin penalización de repetición.
- Prototipado de chatbots de ficción interactiva: la licencia MIT y el formato GGUF permiten integrar el modelo en aplicaciones de narrativa interactiva sin restricciones comerciales adicionales.
- Investigación sobre ajuste fino selectivo en MoE: la receta documentada (LoRA en capas 8-25 sobre `o_proj`, `kv_b_proj` y experto compartido) sirve como referencia reproducible para estudiar cómo afecta la especialización parcial a un modelo MoE.
- Evaluación de funciones de pérdida alternativas: el uso de GEM con beta 0,7 y el enmascaramiento de patrones indeseados permiten estudiar el impacto de estas técnicas en la diversidad y calidad del texto generado.
- Despliegue local en entornos con recursos limitados: al tener solo 1.8B parámetros activos, el modelo puede ejecutarse en configuraciones de hardware moderadas mediante llama.cpp u otros motores compatibles con GGUF.
- Generación de diálogos para conjuntos de datos sintéticos en ruso: útil para aumentar corpus conversacionales en ese idioma, siempre con revisión humana por el riesgo de alucinación y contenido no apto para todo público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 10.672.535.616 parámetros totales, una cuantización GGUF de 4 bits requeriría aproximadamente 5-6 GB de VRAM, y una de 8 bits en torno a 10-11 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más de VRAM usando cuantizaciones GGUF de 4 bits, aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp y motores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GigaRP3.1-10B-A1.8B (este) | 10.672.535.616 | ~1.8B | No disponible | MIT | GGUF, safetensors |
| ai-sage/GigaChat3.1-10B-A1.8B-bf16 (base) | 10.672.535.616 | ~1.8B | No disponible | No disponible | safetensors (bf16) |
| Alternativas de roleplay en ruso | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo ni de otras alternativas documentadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como `not-for-all-audiences`: puede generar contenido no apto para todo público, especialmente en contextos de roleplay.
- Es una compilación experimental privada, con cero descargas y cero likes en el momento de la consulta; no hay validación comunitaria.
- Soporte limitado al ruso; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la ausencia de benchmarks publicados.
- La plantilla de chat elimina el bloque `developer system`; usarla con ese bloque puede degradar el comportamiento esperado.
- El bloque MTP del modelo base no se reentrena, por lo que su comportamiento en ese componente no está validado para esta especialización.
- Aunque la licencia es MIT, el modelo base y los datos de entrenamiento pueden tener restricciones adicionales no detalladas en la model card.
- No se documentan sesgos específicos, pero al estar entrenado para roleplay en ruso puede reflejar sesgos culturales y de género presentes en los datos.

## Enlaces

- Hugging Face: https://huggingface.co/SubMaroon/GigaRP3.1-10B-A1.8B-GGUF
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B-bf16
