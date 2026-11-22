# yonlyyone/Inkling-2-Mini-g13-q4-affine-bf16

## Resumen

Inkling-2-Mini-g13-q4-affine-bf16 es una cuantizacion de 4 bits del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario yonlyyone y empaquetada especificamente para Apple Silicon (GPUs M4/M5) mediante su herramienta g13-engine. No se trata de un modelo entrenado desde cero, sino de un build derivado: toma los pesos del modelo base, los cuantiza con un esquema affine de 4 bits y mantiene el encoder de vision en BF16 nativo. El repositorio ocupa 16,1 GB y declara 26.388.641.280 parametros totales en los safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta una ruta de despliegue local en hardware de consumo Apple para un modelo de unos 26.000 millones de parametros, algo que solo es viable gracias a la cuantizacion a 4 bits. Por otro lado, el ecosistema g13-engine es un proyecto pequeno y de un solo autor, con cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como material experimental y no como una distribucion estable.

La model card es extremadamente escueta: no detalla arquitectura, datos de entrenamiento, idiomas ni benchmarks. Toda la informacion tecnica disponible proviene de los metadatos de Hugging Face, del nombre del repositorio y de las notas del autor sobre vision y memoria. Cualquier dato no cubierto se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `inkling2_loop` sugiere variante del modelo base Inkling-2; sin confirmar) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con componentes BF16 (build `q4-affine-bf16`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura interna del modelo base (transformer denso, MoE, hibrido u otra variante), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El tag `inkling2_loop` aparece en los metadatos del repositorio, pero no se acompana de explicacion tecnica, por lo que no es posible confirmar a que se refiere.

Lo unico verificable es el proceso de conversion: el autor aplica `g13 convert` para generar un build MLX cuantizado a 4 bits en formato affine, manteniendo el encoder de vision y el proyector en BF16 nativo (422 tensores bajo `vision_tower.*`). En Macs de 16 a 24 GB, g13 desactiva la vision por defecto para ahorrar aproximadamente 620 MiB de VRAM, y se reactiva con `g13 serve --vision on`. No se documentan innovaciones de atencion, decodificacion especulativa ni tecnicas de entrenamiento adicionales.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base, sin confirmacion documentada en la model card.
- Vision: el repositorio incluye pesos completos de encoder y proyector de vision, por lo que el modelo puede procesar imagenes si se activa la vision en g13.
- Tool calling y function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento explicito: no disponible.
- Audio: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el build esta pensado para GPUs M4/M5 y se sirve con `g13 serve --model yonlyyone/Inkling-2-Mini-g13-q4-affine-bf16`, lo que permite ejecutar un modelo de 26.000 millones de parametros en un equipo de sobremesa o portatil de gama alta sin GPU dedicada.
- Prototipado de pipelines multimodales en local: al incluir el encoder de vision, se puede experimentar con tareas imagen-texto en un Mac antes de mover la carga a infraestructura cloud.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de un esquema affine de 4 bits frente a los pesos originales del modelo base en BF16, siempre que se disponga de un conjunto de evaluacion propio.
- Desarrollo de herramientas sobre g13-engine: sirve como caso de prueba real para el autor y para terceros que quieran extender el motor de conversion y servicio.
- Ahorro de memoria en equipos de 16-24 GB: la desactivacion automatica de la vision reduce el consumo en unos 620 MiB, lo que facilita ejecutar el modelo en Macs con memoria unificada limitada.
- Experimentacion academica con modelos derivados: permite estudiar el comportamiento de un modelo cuantizado en hardware Apple sin depender de CUDA ni de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 16,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada para cargar los pesos; con overhead de ejecucion conviene contar con 18-24 GB.
- GPU recomendadas: Apple Silicon M4 y M5, segun la model card; no se menciona soporte para CUDA ni ROCm.
- Compatibilidad con GPU de consumo: el build esta disenado para Macs de 16-24 GB de memoria unificada; en ese rango la vision se desactiva por defecto para ahorrar unos 620 MiB.
- Opciones de despliegue: `g13 serve` (g13-engine) es la unica ruta documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-g13-q4-affine-bf16 | 26.388.641.280 | no disponible | apache-2.0 | Hugging Face, MLX |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~26B en 4 bits para Apple Silicon | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no es posible estimar el riesgo de sesgo o de alucinacion a partir de la informacion disponible.
- El repositorio tiene cero descargas y cero likes, y el motor g13-engine es un proyecto de un unico autor: no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.
- La cuantizacion a 4 bits introduce perdida de precision respecto a los pesos originales; no se publican metricas de degradacion.
- La vision viene desactivada por defecto en Macs de 16-24 GB, lo que puede sorprender a quien espere un comportamiento multimodal sin configuracion adicional.
- La licencia apache-2.0 se hereda del modelo base declarado, pero conviene verificar los terminos del modelo original antes de un uso comercial.
- No se especifican idiomas soportados; el comportamiento en castellano no esta garantizado ni documentado.
- El despliegue esta limitado al ecosistema MLX y a hardware Apple Silicon; no hay rutas documentadas para CUDA, ROCm ni CPU generica.

## Enlaces

- Hugging Face: https://huggingface.co/yonlyyone/Inkling-2-Mini-g13-q4-affine-bf16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de g13-engine: https://github.com/yonlyyone/g13-engine
