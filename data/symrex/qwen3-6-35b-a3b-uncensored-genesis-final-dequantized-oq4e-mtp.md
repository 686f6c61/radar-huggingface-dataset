# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ4e-mtp

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ4e-mtp es una version cuantizada a 4 bits de un modelo de la familia Qwen 3.x con arquitectura MoE (mixture of experts), publicada por el usuario symrex en Hugging Face. El repositorio no incluye model card descriptiva mas alla de los metadatos de cuantizacion: se trata de un artefacto derivado, no de un modelo entrenado desde cero. El nombre del repositorio indica que parte de una variante "Uncensored-Genesis-Final" del modelo base Qwen3.6-35B-A3B, es decir, un ajuste fino orientado a eliminar restricciones de rechazo de contenido, que despues se ha de-cuantizado y vuelto a cuantizar con la herramienta oQ.

El dato objetivo disponible es el recuento real de parametros en los ficheros safetensors: 35.951.822.704 parametros (~35,95 mil millones). El tag `qwen3_5_moe` confirma que la arquitectura de origen es un transformer con mezcla de expertos de la familia Qwen 3.5, y la nomenclatura "A3B" del nombre sugiere del orden de 3.000 millones de parametros activos por token, aunque este extremo no se confirma en la informacion proporcionada.

Su relevancia practica es limitada y muy especifica: es un artefacto pensado exclusivamente para ejecucion local en Apple Silicon mediante MLX, en formato safetensors cuantizado a 4 bits con grupo de 64. No hay resultados de benchmarks publicados, ni licencia declarada, ni especificacion de contexto, idiomas o pipeline. Cualquier evaluacion seria debe hacerse sobre el modelo base original, no sobre este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mixture of experts); confirmado por el tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (~35,95 mil millones), segun safetensors |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3.000 millones activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, esquema oQ (mixed-precision) de oMLX v0.6.4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors para MLX (libreria `mlx`); tamano del repo 21,6 GB |
| Autor | symrex |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos (MoE) de la familia Qwen 3.x. El recuento de parametros (35,95 mil millones) es coherente con un MoE de gran tamano total y bajo numero de parametros activos por token, patron habitual en esta familia para reducir coste de inferencia manteniendo capacidad. No se dispone de informacion sobre el numero de expertos, el enrutador, la dimension de las capas ni el numero de capas.

Sobre el entrenamiento no hay ningun dato en la informacion disponible: ni tokens de preentrenamiento, ni composicion del dataset, ni uso de RLHF, DPO o tecnicas de alineamiento posteriores. El sufijo "Uncensored-Genesis-Final" del nombre indica que existe un ajuste fino previo orientado a eliminar mecanismos de rechazo de contenido, pero no se documenta su procedencia, su metodologia ni el modelo base exacto. El proceso aplicado por symrex es una cuantizacion con oQ (oMLX v0.6.4) en 4 bits con grupo de 64; el termino "dequantized" en el nombre sugiere que los pesos pasaron por un ciclo de de-cuantizacion y re-cuantizacion, lo que en la practica puede acumular error respecto a una cuantizacion directa desde los pesos originales en precision completa. Esta interpretacion se deriva del nombre del repositorio y no esta confirmada en la model card.

## Capacidades

- Generacion de texto: presumiblemente heredada del modelo base Qwen3.6-35B-A3B, aunque no se documenta ni se verifica en este repositorio.
- Razonamiento, codigo y matematicas: no disponible; depende del modelo base y de la perdida de calidad introducida por la cuantizacion, sin datos publicados.
- Modo "uncensored": el ajuste fino previo busca reducir los rechazos ante peticiones que un modelo alineado rechazaria. Es una orientacion de comportamiento, no una capacidad tecnica adicional.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Pruebas locales en Apple Silicon: es el unico escenario directamente soportado, ya que el modelo esta en formato MLX safetensors y se carga con `mlx-lm` sobre memoria unificada, sin necesidad de GPU NVIDIA.
- Evaluacion de degradacion por cuantizacion: util como sujeto de estudio para medir cuanto pierde un MoE de ~36.000 millones de parametros al pasar a 4 bits con grupo de 64 frente al modelo base en precision completa.
- Investigacion sobre alineamiento y censura: permite estudiar de forma empirica como se comporta un ajuste "uncensored" en temas sensibles, con las precauciones eticas y legales correspondientes.
- Prototipado offline sin conexion: al ser un artefacto local de 21,6 GB, se puede desplegar en un portatil o estacion Mac para experimentos que no pueden salir a la nube por confidencialidad de los datos.
- Generacion de texto en lote sobre corpus privados: ejecucion por lotes en local para tareas de resumen o reescritura, siempre que la licencia final lo permita (actualmente sin declarar).
- Comparativas internas de rendimiento MLX: sirve para medir throughput y latencia de un MoE de este tamano en M-series frente a alternativas cuantizadas en GGUF sobre CPU o GPU.
- Base para conversion de formato: los safetensors se pueden convertir a GGUF para usarlos en llama.cpp u Ollama, aunque esta conversion no esta documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a los metadatos de cuantizacion y los resultados de la busqueda web no contienen ninguna referencia tecnica al modelo. No se deben extrapolar cifras del modelo base, ya que este derivado esta cuantizado a 4 bits y parte de un ajuste fino no documentado.

## Requisitos de hardware

- Peso en disco y en memoria: 21,6 GB de repositorio en safetensors a 4 bits, cifra que marca el minimo de memoria unificada necesaria para cargar los pesos.
- Memoria recomendada: 32 GB de memoria unificada como minimo comodo en Apple Silicon; 24 GB queda muy justo al sumar cache KV y overhead del runtime.
- Memoria recomendada para contexto largo: 48-64 GB de memoria unificada, ya que la cache KV de un MoE de ~36.000 millones de parametros crece con la longitud de contexto (valor exacto no disponible).
- GPU compatibles: el formato es MLX, por lo que el destino natural son chips Apple M1/M2/M3/M4 con memoria unificada. No se distribuye en formato CUDA listo para A100, H100 o RTX 4090; para esas GPUs habria que convertirlo a otro formato, algo no documentado en el repositorio.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabe en configuraciones de 32 GB o superiores (por ejemplo Mac Studio o MacBook Pro con M-max/Ultra). En el ecosistema NVIDIA no hay artefacto listo; una RTX 4090 de 24 GB quedaria al limite tras conversion.
- Opciones de despliegue: `mlx-lm` es la via directa. vLLM, TGI, llama.cpp y Ollama no soportan safetensors MLX de forma nativa; requeririan una conversion previa no documentada.
- Latencia y throughput: no disponible. Ningun dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ4e-mtp | 35,95 mil millones | no disponible | no disponible | MLX safetensors 4 bits | no disponible | no disponible |
| Modelo base Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion verificable sobre el modelo base ni sobre alternativas comparables dentro de la informacion proporcionada, y los resultados de la busqueda web no aportan ninguna referencia tecnica. La comparativa no puede completarse con datos fiables.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Tratarlo como no apto para produccion hasta verificar la licencia del modelo base y del ajuste fino intermedio.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de la consulta, sin model card descriptiva. No hay evidencia de que el artefacto haya sido validado por terceros.
- Perdida de calidad por cuantizacion: 4 bits con grupo de 64 sobre un MoE introduce degradacion, especialmente en tareas de razonamiento y codigo. Ademas, el nombre sugiere un ciclo de de-cuantizacion y re-cuantizacion que puede acumular error adicional.
- Modelo "uncensored": el ajuste fino previo busca reducir los rechazos de contenido, lo que aumenta el riesgo de generar material danino, ilegal o sexualmente explicito. Requiere filtros y supervision externos en cualquier despliegue con usuarios.
- Riesgo de alucinacion: no cuantificado, pero la cuantizacion agresiva suele incrementarlo. Sin benchmarks publicados no hay forma de acotarlo.
- Contexto, idiomas y capacidades sin especificar: no se puede planificar un despliegue real sin conocer la ventana de contexto soportada ni los idiomas cubiertos.
- Encierro tecnologico en MLX: el formato limita el despliegue a hardware Apple. Migrar a CUDA exige una conversion no documentada ni garantizada.
- Procedencia opaca: no se identifica el modelo base exacto ni la autoria del ajuste "Uncensored-Genesis-Final", lo que dificulta auditar sesgos, datos de entrenamiento o cumplimiento normativo.
- Fecha de publicacion inusual (2026-09-16): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX), referenciada en la model card: https://github.com/jundot/omlx
- Paper, blog, repositorio o demo del modelo base: no disponible
- Resultados de benchmarks: no disponible
