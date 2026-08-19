# yethdev/qwen3.5-9b-manumit-v2-preview-gguf

## Resumen

`yethdev/qwen3.5-9b-manumit-v2-preview-gguf` es una versión en formato GGUF del modelo Qwen/Qwen3.5-9B, publicada por el usuario yethdev con licencia MIT. El término "manumit" (liberar) y la etiqueta "abliterated" indican que se ha aplicado la técnica de abliteración, que elimina las direcciones de rechazo en el espacio de activaciones del modelo, permitiendo respuestas sin las negativas habituales de seguridad. Esta es una vista previa (preview) de un trabajo en desarrollo; la model card solo contiene la frase "Just a glimpse of what to come" (solo un vistazo de lo que está por venir).

El modelo base, Qwen3.5-9B, según fuentes externas, es parte de la familia Qwen3.5 de Alibaba, que integra visión y lenguaje en una arquitectura unificada con entrenamiento temprano de fusión multimodal. Sin embargo, esta versión específica se presenta como un modelo de generación de texto (pipeline `text-generation`) y no se confirma si conserva capacidades multimodales. El repositorio contiene aproximadamente 8,95 mil millones de parámetros y un tamaño de 5,6 GB, lo que sugiere cuantizaciones de precisión media-baja típicas de GGUF.

Dado el escaso contenido de la model card y la ausencia de documentación adicional, esta ficha se basa principalmente en los metadatos de HuggingFace y en información pública sobre el modelo base. Se recomienda precaución al usar esta versión en entornos de producción, ya que no se han publicado benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B, detalles no especificados) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No confirmado para esta version; el modelo base Qwen3.5-9B soporta 256K tokens segun fuentes externas |
| Tipos de cuantizacion | GGUF (cuantizaciones especificas no listadas en la model card) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no presente en este repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna de esta version especifica. El modelo base Qwen3.5-9B pertenece a la serie Qwen3.5, que segun el repositorio oficial de GitHub emplea una arquitectura transformer con fusion temprana de vision y lenguaje, entrenada sobre billones de tokens multimodales. Sin embargo, esta version GGUF se etiqueta unicamente como `text-generation`, por lo que no se puede confirmar si el componente visual esta activo o ha sido eliminado durante el proceso de abliteracion.

La abliteracion es una tecnica post-entrenamiento que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. Se aplica sobre el modelo base ya entrenado, sin reentrenamiento adicional. No se han publicado detalles sobre el proceso exacto aplicado, el dataset utilizado ni si se realizaron ajustes adicionales de fine-tuning.

## Capacidades

- Generacion de texto: como modelo de lenguaje autoregresivo, puede producir texto coherente en multiples dominios, aunque no se han documentado capacidades especificas.
- Razonamiento y codificacion: el modelo base Qwen3.5-9B destaca en tareas de razonamiento y generacion de codigo segun el blog de Jeroen Nyckees, pero no hay evidencia de que esta version conserve esas capacidades intactas.
- Tool calling y agentes: no se menciona soporte explicito en la informacion disponible.
- Multimodalidad: el modelo base integra vision, pero esta version se presenta como texto puro; no se confirma si las capacidades visuales estan presentes.
- Sin restricciones de rechazo: debido a la abliteracion, el modelo puede responder a solicitudes que normalmente serian rechazadas por politicas de seguridad.

## Casos de uso

No se han documentado casos de uso especificos para esta version. Dado su caracter de vista previa y la falta de validacion, los siguientes escenarios son hipoteticos y requieren evaluacion previa:

- Experimentacion en investigacion: util para estudiar el impacto de la abliteracion en el comportamiento de un modelo de 9B, comparando respuestas con la version original.
- Generacion creativa de contenido sin filtros: podria emplearse en entornos controlados donde se requiera explorar temas sensibles, siempre con supervision humana.
- Pruebas de robustez: para evaluar como un modelo sin negativas maneja prompts adversariales o solicitudes de informacion delicada.
- Despliegue local en hardware de consumo: al ser GGUF, puede ejecutarse en GPU con 8-12 GB de VRAM, permitiendo pruebas en entornos personales.
- Fine-tuning posterior: como punto de partida para ajustes con datasets especificos, aunque la abliteracion previa podria afectar el comportamiento de seguridad.
- Comparativa de cuantizaciones: para analizar el impacto de diferentes niveles de cuantizacion GGUF en la calidad de salida de un modelo abliterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede evaluar el rendimiento relativo frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~9B en formato GGUF, los requisitos dependen de la cuantizacion. Con cuantizacion Q4_K_M, se estiman entre 5 y 6 GB de VRAM; con Q8, entre 9 y 10 GB. No se confirman las cuantizaciones incluidas en el repositorio.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo con cuantizaciones bajas. Para cuantizaciones altas, se recomienda al menos 16 GB de VRAM.
- Compatibilidad con hardware de consumo: si, siempre que se utilice una cuantizacion adecuada (Q4 o Q5) y se disponga de al menos 8 GB de VRAM.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. Tambien puede servirse mediante vLLM si se convierte a safetensors, aunque no se proporcionan dichos pesos.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, un modelo de 9B cuantizado a Q4 suele generar entre 30 y 60 tokens por segundo, pero esto es una estimacion general, no un dato verificado para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base Qwen3.5-9B compite con otros modelos de 7-9B como Llama 3.1 8B o Mistral 7B, pero esta version abliterada no ha sido evaluada contra ellos. Se recomienda consultar los benchmarks del modelo base en el repositorio oficial de Qwen para una referencia aproximada.

## Limitaciones y advertencias

- La abliteracion elimina las negativas de seguridad, lo que puede provocar que el modelo genere contenido inapropiado, ofensivo o peligroso sin restricciones. No es apto para uso en produccion sin medidas de control adicionales.
- No se han publicado evaluaciones de sesgos, alucinaciones o calidad general. El modelo podria presentar errores factuales o razonamientos incoherentes.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo.
- Al ser una version "preview", es probable que contenga errores o que el proceso de abliteracion no haya sido optimizado.
- No se confirma la longitud de contexto real; aunque el modelo base soporta 256K tokens, la cuantizacion y la abliteracion podrian afectar a la ventana util.
- La falta de documentacion tecnica impide conocer los detalles del proceso de cuantizacion y su impacto en la fidelidad del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2-preview-gguf
- Version v1 del mismo modelo: https://huggingface.co/yethdev/qwen3.5-9b-manumit-v1-GGUF
- Modelo relacionado (qwythos-9b-v2-manumit-v1): https://huggingface.co/yethdev/qwythos-9b-v2-manumit-v1-GGUF
- Repositorio oficial de Qwen3.5 (GitHub): https://github.com/wendashi/Qwen3.5
- Guia de ejecucion con llama.cpp y Pi (blog): https://jenyckee.github.io/posts/qwen-pi-local-llm/
- Pagina del modelo Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
