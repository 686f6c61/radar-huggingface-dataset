# TheCheng2005/ast425-student-carbon-mix

## Resumen

AST425-student-carbon-mix es un conjunto de tres modelos de visión por computador para astronomía desarrollados por Chris Cheng en el marco de su proyecto AST425 de la Universidad de Toronto. No se trata de un modelo de lenguaje: cada "student" reutiliza únicamente el codificador visual de Qwen/Qwen3-VL-8B-Instruct, con adaptadores LoRA y una cabeza lineal que devuelve un logit único, transformado a una puntuación de interés entre 0 y 50 mediante `score = 50 * sigmoid(logit)`. El modelo base completo no se emplea en inferencia, lo que reduce drásticamente los requisitos de cómputo frente a un VLM convencional.

El repositorio contiene tres variantes. La raíz aloja el "Carbon student", un modelo general entrenado con puntuaciones de interés de Gemini sobre 96.465 galaxias de Euclid Q1 y Hubble. Sobre él se afinan dos estudiantes especializados: `stream/`, orientado a la detección de corrientes estelares (13 corrientes doradas como positivos), y `dspl/`, centrado en candidatos a lentes de doble plano fuente (37 candidatos de Li et al. 2026). Ambos estudiantes de segunda ronda parten de los adaptadores y la cabeza del Carbon student y continúan su entrenamiento.

El interés actual del modelo reside en su enfoque de ranking: en lugar de clasificar con umbrales, ordena galaxias por una puntuación continua de rareza o interés morfológico, lo que encaja con flujos de trabajo de búsqueda de anomalías en grandes cartografiados. El repositorio incluye scripts para puntuar imágenes sueltas, recorrer shards parquet de un cartografiado completo y reentrenar con imágenes anotadas manualmente. Con 14 descargas y sin likes, es un artefacto de investigación académica, no un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual de Qwen3-VL-8B-Instruct (transformer ViT) con adaptadores LoRA y cabeza lineal sobre la media de 64 tokens de salida |
| Parametros totales | No disponible (el codificador completo se descarga como shard de 2,7 GB; 8,9 M de pesos entrenables con LoRA y cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de imagen fija de 256 x 256 píxeles en escala de grises) |
| Tipos de cuantizacion | No disponible (pesos en bf16 durante entrenamiento; safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`student.safetensors`, `adapter/adapter.safetensors`), config.json |

## Arquitectura y entrenamiento

Cada estudiante es el codificador visual de Qwen3-VL-8B-Instruct (revisión `0c351dd`) congelado en bf16, sobre el que se aplican adaptadores LoRA con r=16, alpha=32 y dropout=0,05 en todas las capas `attn.qkv`, `attn.proj`, `linear_fc1` y `linear_fc2` de los bloques y patch mergers del codificador. La cabeza es una capa lineal sobre la media de los 64 tokens de salida de imagen que produce un único logit; la pérdida es entropía cruzada binaria contra `score / 50`. El optimizador es AdamW con lr 2e-4, sin weight decay, 3 % de warm-up y decaimiento lineal, con recorte de gradiente de 0,3 y batches de 16 con 2 pasos de acumulación. La augmentación consiste en una rotación o volteo aleatorio entre las 8 posibles por imagen.

El Carbon student se entrenó durante 2 épocas con puntuaciones de interés de Gemini (0-50) sobre 96.465 galaxias de Euclid Q1 y Hubble. Los estudiantes de segunda ronda se inicializan desde los adaptadores y la cabeza del Carbon student y se reentrenan 6 épocas sobre conjuntos anotados manualmente con una distribución deliberadamente sesgada hacia puntuaciones bajas: el objetivo recibe puntuación 48 (mostrado 8 veces), los objetos relacionados 25, los parecidos 3 y las galaxias ordinarias 2. El estudiante de corrientes usa 1.094 galaxias de Euclid Q1; el de DSPL, 1.177 de Euclid DR1. En una H100, el estudiante DSPL (1.436 imágenes por época con repeticiones) entrena en unos 3 minutos. Las entradas se convierten a escala de grises y se redimensionan a 256 x 256 con interpolación bicúbica; para composites Euclid `gz_arcsinh_vis_y` se usa el canal azul (VIS).

## Capacidades

- Puntuación de interés morfológico de galaxias: devuelve un logit y una puntuación 0-50 para ordenar imágenes por rareza o interés, no para clasificar con umbral.
- Detección de corrientes estelares: el estudiante `stream/` prioriza galaxias con corrientes estelares doradas frente a mergers, espirales de brazos sueltos y galaxias ordinarias.
- Detección de lentes de doble plano fuente: el estudiante `dspl/` prioriza candidatos DSPL frente a otras lentes ECLIPSE y galaxias normales.
- Procesamiento por lotes de cartografiados completos: `score_shards.py` recorre shards parquet de Hugging Face (por ejemplo `mwalmsley/euclid_dr1`, config `v1-gz_arcsinh_vis_y`) y escribe un parquet por shard con id, coordenadas, logit y score, con reanudación de shards ya completados.
- Afinamiento con datos propios: `finetune_student.py` permite entrenar un nuevo estudiante sobre imágenes anotadas manualmente partiendo de los adaptadores del Carbon student.
- Inferencia por línea de comandos o importable: `score_student.py` puntúa ficheros de imagen y expone `load_student` y `score` como API de Python.
- No dispone de generación de texto, tool calling, capacidades de agente ni multimodalidad de lenguaje: el modelo de lenguaje de Qwen3-VL no se carga.

## Casos de uso

- Búsqueda de anomalías en Euclid Q1: ordenar las 51.465 galaxias del conjunto Q1 por la puntuación del Carbon student para revisar manualmente solo la cola alta, priorizando candidatos raros sin necesidad de definir clases a priori.
- Detección de corrientes estelares a gran escala: ejecutar `score_shards.py --student stream` sobre los shards de Euclid DR1 para producir un ranking de candidatos a corrientes estelares que los astrónomos inspeccionan visualmente; el estudiante está entrenado para que casi todo puntúe bajo y solo las corrientes puntúen alto.
- Búsqueda de lentes de doble plano fuente: puntuar DR1 con el estudiante `dspl/` y contrastar el ranking con los 76 candidatos de Li et al. 2026 (39 quedaron fuera del entrenamiento como test), lo que permite medir la recuperación sobre un conjunto held-out real.
- Triaje previo a inspección humana en campañas de clasificación ciudadana: usar la puntuación como orden de prioridad para asignar esfuerzo de voluntarios o de tiempo de telescopio a los objetos con mayor score.
- Reentrenamiento para un nuevo objetivo morfológico: con unas pocas decenas de positivos anotados a mano (el estudiante DSPL usó 37) y varios cientos de negativos estratificados, `finetune_student.py` produce un buscador específico en minutos sobre una H100.
- Validación de pipelines de datos de Euclid: los seis recortes de `examples/` con logits esperados del Carbon student permiten comprobar que la instalación de torch, transformers y safetensors reproduce los resultados antes de lanzar un barrido completo.
- Selección de candidatos para seguimiento espectroscópico: ordenar por score y cruzar con coordenadas (ra, dec) del parquet de salida para generar listas de observación priorizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia: el codificador se carga en bf16; el shard de pesos del codificador ocupa 2,7 GB, por lo que la VRAM necesaria es del orden de varios GB, aunque el dato exacto no está disponible en la información proporcionada.
- Entrenamiento: el autor usó una GPU H100 en el clúster Trillium; el estudiante DSPL entrena en unos 3 minutos por ejecución completa (6 épocas, 1.436 imágenes por época).
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras GPU de consumo; dado el tamaño del codificador, es plausible pero no está confirmado en la documentación.
- Despliegue: scripts propios en Python (`score_student.py`, `score_shards.py`, `finetune_student.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un codificador visual sin modelo de lenguaje.
- Dependencias: torch, transformers con soporte Qwen3-VL, safetensors, pillow y numpy; pyarrow para `score_shards.py`; peft, pandas y huggingface_hub para `finetune_student.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Entrada | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| AST425 Carbon student (este repo) | Codificador visual Qwen3-VL-8B-Instruct | Ranking de interés general en galaxias | 256 x 256 en grises | 96.465 galaxias con scores de Gemini, 2 épocas | No disponible |
| AST425 stream student (este repo) | Carbon student | Búsqueda dirigida de corrientes estelares | 256 x 256 en grises | 1.094 galaxias anotadas, 6 épocas | No disponible |
| AST425 DSPL student (este repo) | Carbon student | Búsqueda dirigida de lentes DSPL | 256 x 256 en grises | 1.177 galaxias anotadas, 6 épocas | No disponible |
| Qwen/Qwen3-VL-8B-Instruct | Modelo completo | VLM generalista con lenguaje | Imagen + texto | No disponible | No disponible |

No se dispone de información sobre otros modelos de búsqueda de anomalías astronómicas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La puntuación es un ranking, no una probabilidad calibrada: el autor indica explícitamente que se ordene por ella y no se aplique un umbral.
- El Carbon student se entrenó con puntuaciones generadas por Gemini, no con anotaciones humanas directas, lo que introduce los sesgos del modelo generador en la definición de "interés".
- Los estudiantes de segunda ronda se entrenan con muy pocos positivos (13 corrientes, 37 DSPL) y una distribución artificial de negativos; el rendimiento fuera de esa distribución no está documentado.
- Las imágenes de entrenamiento deben mantenerse a más de 5-10 segundos de arco de cualquier objetivo reservado para test; ignorar esta restricción produce fugas de información y métricas infladas.
- La entrada está fijada a 256 x 256 en grises y sin recorte; detalles morfológicos finos por debajo de esa resolución se pierden.
- Para composites Euclid `gz_arcsinh_vis_y` debe usarse el canal azul (VIS); usar luminancia cambia la distribución de entrada respecto al entrenamiento.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; además, los pesos derivan de Qwen3-VL-8B-Instruct, cuyas condiciones de licencia aplican.
- No hay información sobre sesgos demográficos o lingüísticos porque el modelo no procesa texto ni personas; el sesgo relevante es el morfológico y el inducido por los datos de Euclid y Hubble.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de falsos positivos en la cola alta del ranking, que requieren inspección humana.
- El proyecto es académico, con 14 descargas y sin mantenimiento documentado más allá de noviembre de 2026; no hay garantías de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheCheng2005/ast425-student-carbon-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper de candidatos DSPL citado: arXiv:2611.20166 (Li et al. 2026)
- Dataset de Euclid DR1 referenciado: https://huggingface.co/datasets/mwalmsley/euclid_dr1
- No se han encontrado en la información proporcionada otros enlaces a blogs, repositorios o demos del autor.
