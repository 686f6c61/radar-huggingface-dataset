# zhangshuui/ckpt-bank

## Resumen

`ckpt-bank` es un repositorio de artefactos de investigación publicado por el usuario zhangshuui en HuggingFace, no un modelo empaquetado. Contiene `state dicts` planos del backbone `WanModel`, derivados de Wan2.1-T2V-1.3B (Apache-2.0), el modelo texto-a-video de 1,3 mil millones de parámetros de la familia Wan2.1. Los pesos corresponden a la configuración de 480p con una variante descrita como causal `c3-3`.

El repositorio ocupa 544,9 GB y se distribuye sin documentación, sin configuración de pipeline, sin tokenizer, sin codificador de texto y sin VAE. Cada fichero es un banco de checkpoints almacenado tal cual, en safetensors y en bfloat16, salvo los ficheros de 5,3 GB, que están en float32.

Su relevancia es estrictamente de investigación: sirve para análisis de espacios de pesos, ablaciones, destilación o reentrenamiento, pero no es utilizable directamente por un desarrollador que quiera generar vídeo sin aportar él mismo todo el código de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `WanModel` (backbone de la familia Wan2.1-T2V, derivado del modelo texto-a-video Wan2.1-T2V-1.3B); el repositorio no documenta la arquitectura interna |
| Parametros totales | 1,3 B (según la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16; los ficheros de 5,3 GB estan en float32) |

Otros datos del repositorio: autor zhangshuui, 0 descargas, 0 likes, pipeline no disponible, idiomas no disponibles, tamaño total del repo 544,9 GB, creado el 2026-09-11 y actualizado el 2026-09-15.

## Arquitectura y entrenamiento

El repositorio no documenta ni la arquitectura ni el proceso de entrenamiento. El único dato técnico que aporta la model card es que se trata de `state dicts` planos de `WanModel`, derivados de Wan2.1-T2V-1.3B, en configuración de 480p y con la etiqueta de variante causal `c3-3`, cuyo significado exacto no se explica. Los pesos se almacenan en bfloat16, salvo los ficheros de 5,3 GB, que se guardan en float32.

No se especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni el número de pasos de difusión. Tampoco se indica si los checkpoints corresponden a estados intermedios de un entrenamiento, a variantes experimentales o a conversiones del modelo base. Cualquier afirmación sobre innovaciones técnicas del modelo subyacente debe consultarse en la documentación del modelo base Wan2.1-T2V-1.3B, que no forma parte de este repositorio.

## Capacidades

- No es un modelo invocable: el repositorio no incluye pipeline de inferencia, `config.json`, tokenizer, codificador de texto, VAE ni scheduler de difusión.
- No se declara ninguna capacidad funcional propia en la model card; el único contenido son diccionarios de estado del backbone.
- Hereda, en principio, el dominio del modelo base Wan2.1-T2V-1.3B (generación de vídeo a partir de texto, 480p), pero esto no está verificado ni documentado dentro de este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en interpretabilidad del espacio de pesos: al tratarse de `state dicts` sin envoltorio, permite cargar tensores de forma aislada y estudiar la estructura interna del backbone `WanModel` sin la sobrecarga de un pipeline completo.
- Ablaciones y comparación de variantes: el banco facilita contrastar configuraciones distintas (por ejemplo, la variante `c3-3` frente a otras) manteniendo constante el resto del pipeline de evaluación.
- Destilación de conocimiento: los checkpoints pueden servir como profesor para entrenar modelos de vídeo más pequeños, siempre que el equipo aporte su propio código de entrenamiento y su decodificador.
- Reentrenamiento o fine-tuning continuado: un equipo con infraestructura propia puede inicializar un entrenamiento desde estos pesos y adaptarlos a un dominio concreto (por ejemplo, vídeo de producto o animación 2D).
- Reproducibilidad de experimentos: almacenar y compartir estados exactos del modelo permite repetir experimentos de generación de vídeo en condiciones controladas.
- Análisis de poda y fusión de pesos (pruning, model merging): los ficheros en safetensors se prestan a experimentos de eliminación de cabezas o capas y a fusiones entre checkpoints.
- Construcción de pipelines a medida: un equipo que ya disponga del codificador de texto, el VAE y el scheduler del modelo base puede montar su propio pipeline de inferencia usando estos pesos como sustituto del checkpoint oficial.
- Docencia y estudio de modelos generativos de vídeo: el repositorio permite examinar la forma y el tamaño de los tensores de un modelo de difusión de vídeo real sin necesidad de descargar el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de FVD, CLIP score, VBench ni ninguna otra evaluación, y el repositorio se describe explícitamente como artefactos de investigación sin documentación.

## Requisitos de hardware

- Peso de un solo checkpoint en bfloat16: aproximadamente 2,6 GB para 1,3 B de parámetros (cálculo derivado del número de parámetros indicado, no documentado en el repositorio).
- Peso de un solo checkpoint en float32: aproximadamente 5,2 GB (los ficheros de 5,3 GB de la model card son coherentes con este cálculo).
- Almacenamiento para el banco completo: 544,9 GB, según el tamaño del repositorio. Es necesario prever ese espacio en disco y el ancho de banda correspondiente para la descarga.
- VRAM de inferencia: no disponible en el repositorio. Como referencia orientativa y no documentada, el peso en bfloat16 ocupa unos 2,6 GB, pero un pipeline de difusión de vídeo a 480p requiere memoria adicional para activaciones y para el decodificador, por lo que conviene planificar por encima de esos 2,6 GB.
- GPU recomendadas: no disponibles. Al no haber pipeline publicado, el autor no indica hardware objetivo. Un checkpoint de 1,3 B en bfloat16 cabe sin problema en GPUs de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 4090), pero la inferencia de vídeo completa depende del código que se añada.
- Opciones de despliegue: no disponibles. No hay ficheros GGUF, no hay soporte declarado para llama.cpp, Ollama, vLLM ni TGI; al ser un modelo de difusión, el ecosistema habitual sería PyTorch con `diffusers`, pero este repositorio no incluye esa integración.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se establece frente al modelo base del que derivan los checkpoints y frente a otras alternativas de generación de vídeo de tamaño comparable, ya que `ckpt-bank` no es en sí un modelo desplegable.

| Modelo | Parametros | Resolucion tipica | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| zhangshuui/ckpt-bank | 1,3 B por checkpoint | 480p (segun model card) | Apache 2.0 | `state dicts` sueltos, sin pipeline de inferencia |
| Wan2.1-T2V-1.3B (modelo base) | 1,3 B | 480p | Apache 2.0 | Modelo completo con pipeline de inferencia |
| Wan2.1-T2V-14B | 14 B | 480p y 720p | Apache 2.0 | Modelo completo de la misma familia |
| CogVideoX-2B | 2 B | 720x480 | Apache 2.0 | Modelo texto-a-video con pipeline en `diffusers` |
| HunyuanVideo | 13 B | 720p | Licencia comunitaria propia | Modelo completo con licencia no permisiva |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparación se limita a parámetros, resolución, licencia y forma de distribución.

## Limitaciones y advertencias

- El repositorio no incluye `config.json`, tokenizer, codificador de texto, VAE ni scheduler: los checkpoints no se pueden ejecutar sin reconstruir todo el pipeline de inferencia.
- El autor declara explícitamente que son artefactos de investigación almacenados tal cual, sin documentación ni garantía de soporte o mantenimiento.
- No hay evaluación de sesgos, de seguridad ni de contenido generado; al derivar de un modelo texto-a-video, hereda los riesgos propios de la generación de vídeo sintético (contenido físicamente incoherente, estereotipos presentes en los datos de entrenamiento del modelo base).
- La resolución de trabajo indicada es 480p, lo que limita su uso en flujos de producción que exijan 720p o superior.
- La licencia declarada es Apache 2.0, pero al tratarse de pesos derivados de Wan2.1-T2V-1.3B conviene verificar la cadena de licencias del modelo base antes de un uso comercial.
- El significado de la etiqueta `c3-3` no se documenta, por lo que no es posible saber con certeza qué variante arquitectónica o de entrenamiento representa cada checkpoint.
- El repositorio registra 0 descargas y 0 likes, es decir, no existe validación por parte de la comunidad ni informes independientes de funcionamiento.
- El tamaño de 544,9 GB implica un coste de almacenamiento y de transferencia considerable, además de tiempos de descarga largos.
- Las marcas temporales del repositorio (septiembre de 2026) son posteriores a la publicación del modelo base, dato a tener en cuenta si se rastrea la procedencia de los pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zhangshuui/ckpt-bank
- Modelo base citado en la model card (Wan2.1-T2V-1.3B): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio de código de la familia Wan2.1: https://github.com/Wan-Video/Wan2.1

Nota: los dos últimos enlaces no aparecen en la información proporcionada sobre el repositorio; se incluyen como referencia del modelo base del que derivan los checkpoints.
