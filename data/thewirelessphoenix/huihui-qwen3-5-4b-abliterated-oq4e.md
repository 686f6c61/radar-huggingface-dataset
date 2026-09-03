# TheWirelessPhoenix/Huihui-Qwen3.5-4B-abliterated-oQ4e

## Resumen

Este modelo es una cuantizacion de 4 bits del modelo Huihui-Qwen3.5-4B-abliterated, realizada con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors. El modelo base, desarrollado por huihui-ai, es una version "abliterated" (sin censura) de Qwen3.5-4B, un modelo de la familia Qwen 3.5 que, segun las descripciones publicas, es multimodal y de codigo abierto. La cuantizacion reduce el tamaño del modelo a 3.2 GB, lo que permite su ejecucion en hardware de consumo con memoria limitada.

La relevancia de este modelo radica en que combina la capacidad de un modelo de 4.000 millones de parametros con una cuantizacion eficiente para su despliegue local, y ademas elimina los mecanismos de rechazo de contenido del modelo original, lo que lo hace util para casos de uso que requieren generacion sin restricciones tematicas. Sin embargo, la informacion publica disponible es escasa: no se especifican detalles de arquitectura, entrenamiento, licencia ni idiomas soportados, por lo que gran parte de la ficha se basa en inferencias a partir del nombre y de los datos de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, familia Qwen 3.5) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. El nombre "qwen3_5" sugiere que pertenece a la familia Qwen 3.5, que segun las descripciones publicas es una familia de modelos multimodales de codigo abierto. Sin embargo, no se confirma si esta version abliterated conserva las capacidades multimodales del original. El proceso de "abliteration" consiste en eliminar o atenuar los mecanismos de rechazo de contenido no deseado, tipicamente mediante tecnicas de modificacion de pesos o de ajuste fino, pero no se especifica el metodo concreto empleado por huihui-ai.

En cuanto al entrenamiento, no hay datos publicos sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La cuantizacion oQ de 4 bits con group size 64 es una tecnica de compresion que reduce el tamaño del modelo manteniendo una precision razonable, pero no altera el comportamiento funcional del modelo base.

## Capacidades

- Generacion de texto: al ser un modelo de la familia Qwen, se espera que tenga capacidades de generacion de texto en multiples idiomas, aunque no se confirma el listado exacto.
- Razonamiento y codigo: los modelos Qwen suelen incluir capacidades de razonamiento y generacion de codigo, pero no hay datos especificos para esta version.
- Multimodalidad: la familia Qwen 3.5 se describe como multimodal, pero no se confirma si esta version abliterated conserva dicha capacidad.
- Ausencia de rechazos: al ser "abliterated", el modelo no deberia rechazar peticiones por contenido considerado inapropiado, lo que permite usos sin restricciones tematicas.
- Tool calling y agentes: no hay informacion disponible sobre soporte de function calling o uso como agente.

## Casos de uso

- Generacion creativa sin restricciones: el modelo puede utilizarse para escribir ficcion, poesia o guiones que aborden temas que otros modelos censurarian, gracias a su naturaleza abliterated.
- Asistente de escritura tecnica: puede redactar documentacion, articulos o respuestas a preguntas complejas sin limitaciones de contenido, aunque se debe verificar la calidad de las respuestas.
- Prototipado rapido de chatbots: al ser ligero (3.2 GB), puede desplegarse en entornos de desarrollo para probar interacciones conversacionales sin necesidad de infraestructura potente.
- Educacion y formacion: puede utilizarse para generar ejemplos de conversaciones o materiales didacticos sobre temas sensibles, siempre que se supervise el resultado.
- Investigacion sobre alineacion y censura: al comparar su comportamiento con el modelo original, se pueden estudiar los efectos de la abliteration en la calidad y el sesgo de las respuestas.
- Despliegue en dispositivos con recursos limitados: gracias a la cuantizacion 4-bit y al formato MLX, puede ejecutarse en Macs con Apple Silicon o en GPUs de gama media con 4-6 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 4.539 millones de parametros en 4 bits, el peso del modelo es de aproximadamente 2,3 GB (4.539.265.536 × 0,5 bytes). Sumando overhead de activaciones y cache, se estima un consumo de entre 3 y 5 GB de VRAM para inferencia.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como NVIDIA RTX 2060/3060, o Apple Silicon con 8 GB unificados. Para mayor comodidad, se recomienda una GPU de 8 GB o superior.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser formato MLX, se puede ejecutar con oMLX o MLX-LM en macOS. Para otros entornos, se podria convertir a GGUF o usar vLLM si se adapta, pero no se indica compatibilidad explicita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-abliterated (este) | 4,5 B | no disponible | no disponible | MLX 4-bit | Cuantizacion oQ, abliterated |
| Qwen3-4B-abliterated (huihui-ai) | 4 B | no disponible | no disponible | no disponible | Version anterior de la serie Qwen3, tambien abliterated |
| Qwen3.5-4B (original) | 4 B | no disponible | no disponible | no disponible | Modelo base sin abliteration, multimodal segun descripcion |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version abliterated, es probable que el modelo genere contenido ofensivo, ilegal o peligroso sin filtros, lo que supone un riesgo importante en entornos de produccion.
- Riesgo de alucinacion: no hay datos especificos, pero los modelos de 4B suelen tener tasas de alucinacion mas altas que los modelos mayores.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar su uso comercial o su redistribucion.
- Caveat de produccion: al no tener informacion sobre el entrenamiento ni evaluaciones, no se recomienda su uso en aplicaciones criticas sin una validacion exhaustiva previa.

## Enlaces

- Modelo cuantizado: https://huggingface.co/TheWirelessPhoenix/Huihui-Qwen3.5-4B-abliterated-oQ4e
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Version anterior Qwen3-4B-abliterated: https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
- Pagina en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated:4B
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
