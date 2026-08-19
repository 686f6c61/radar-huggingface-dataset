# TheCluster/Qwen3.8-27B-Heretic-MLX-4bit

## Resumen

TheCluster/Qwen3.8-27B-Heretic-MLX-4bit es una versión modificada del modelo Qwen/Qwen3.8-27B, publicada por el usuario TheCluster en HuggingFace. Se trata de un modelo "uncensored" o "abliterated", es decir, se le han eliminado los mecanismos de rechazo y moderación de contenido mediante la herramienta Heretic v1.4.0. El resultado es un modelo que responde sin filtros de seguridad, pensado para usuarios que necesitan generar contenido sin restricciones temáticas.

El modelo está cuantizado a 4 bits con formato MLX (grupo de cuantización de 64), lo que reduce el tamaño del repositorio a 16,1 GB. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque no se proporcionan detalles adicionales sobre arquitectura o entrenamiento. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Su relevancia radica en ofrecer una alternativa sin censura sobre una base de Qwen, con un tamaño manejable para GPUs de consumo gracias a la cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen/Qwen3.8-27B) |
| Parametros totales | 4.665.462.000 (según safetensors del repo; el modelo base Qwen3.8-27B tiene aproximadamente 27B parámetros, pero no se confirma) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, affine, group size 64 (formato MLX) |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada. Se sabe que el modelo original es de la familia Qwen y que el pipeline declarado es `image-text-to-text`, lo que indica que es multimodal (procesa texto e imágenes). El proceso de modificación aplicado es "Heretic", una técnica de abliteration que elimina los vectores de rechazo del modelo, permitiendo respuestas sin censura. No se han publicado datos sobre el dataset de entrenamiento, número de tokens ni técnicas como RLHF o DPO. La cuantización a 4-bit con grupo 64 es la única modificación técnica documentada, realizada con la librería MLX.

## Capacidades

- Generación de texto sin restricciones de contenido (uncensored/abliterated), incluyendo temas sensibles o controvertidos.
- Procesamiento de imágenes y texto (pipeline `image-text-to-text`), aunque no se especifican tareas concretas de visión.
- Multilingüe: soporta 27 idiomas, incluyendo español, inglés, chino, ruso, francés, italiano, japonés, coreano, entre otros.
- Conversación multi-turno (chat) con parámetros de muestreo recomendados por el autor (thinking mode e instruct mode).
- No se documenta soporte explícito para tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- Generación de contenido creativo sin filtros: el modelo puede producir narrativa, poesía o diálogos con temáticas adultas o controvertidas sin rechazo automático, útil para escritores que exploran límites.
- Investigación en seguridad de IA: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, comparando con la versión original para analizar sesgos y riesgos.
- Desarrollo de asistentes de rol (roleplay) con personajes sin restricciones: su naturaleza abliterated permite interacciones más libres en juegos de rol textuales.
- Análisis de contenido multimodal en entornos controlados: al aceptar imágenes y texto, puede usarse para generar descripciones o análisis de imágenes sin limitaciones de contenido, aunque con precaución.
- Pruebas de robustez y jailbreak: los investigadores pueden evaluar si la abliteration elimina completamente los rechazos o si aún persisten comportamientos de seguridad residuales.
- Despliegue en entornos aislados donde se requiere generación de texto sin moderación, como sandboxes de investigación o demos internas, siempre bajo responsabilidad del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 16,1 GB (cuantización 4-bit MLX).
- VRAM estimada: no disponible con fiabilidad. El número de parámetros del safetensors (4,66B) sugiere que la versión cuantizada podría caber en GPUs con 8 GB de VRAM, pero al ser un modelo base de 27B parámetros, la memoria real depende del formato y del runtime. Se recomienda probar en entornos con al menos 12 GB de VRAM para inferencia cómoda.
- GPUs recomendadas: no especificadas. Por el tamaño, podría ejecutarse en RTX 3090/4090 (24 GB) o GPUs de datacenter como A10G o A100.
- Opciones de despliegue: al ser formato MLX, está pensado para Apple Silicon (Mac) con la librería MLX. También puede convertirse a otros formatos (GGUF, etc.) para usar con llama.cpp, Ollama o vLLM, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Qwen3.8-27B podría compararse con otros modelos de la familia Qwen o con alternativas abliterated como Dolphin o WizardLM-uncensored, pero no hay datos concretos para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o dañino. El autor no ofrece ninguna garantía de seguridad.
- Riesgo elevado de alucinación: sin filtros de seguridad, el modelo puede inventar información con mayor confianza, especialmente en temas sensibles.
- No se dispone de información sobre sesgos específicos del modelo, pero al derivar de Qwen, es probable que herede sesgos de su dataset de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir la legislación aplicable.
- El formato MLX limita el despliegue a ecosistemas Apple; para otros entornos se requiere conversión, lo que puede degradar el rendimiento.
- No hay documentación sobre la longitud de contexto ni sobre la calidad de las respuestas en idiomas distintos del inglés; se recomienda probar antes de usar en producción.

## Enlaces

- HuggingFace: https://huggingface.co/TheCluster/Qwen3.8-27B-Heretic-MLX-4bit
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
