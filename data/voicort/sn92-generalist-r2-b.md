# voicort/sn92-generalist-r2-b

## Resumen

sn92-generalist-r2-b es un modelo de la familia Gemma 4 publicado por el usuario voicort en Hugging Face, con un total de 31.273.088.876 parametros en formato safetensors y un repositorio de 62,6 GB. Se trata de un fine-tune del modelo MachinePulseAI/karpo-decision-31B, orientado a tareas de clasificacion de texto y clasificacion de imagenes y texto (pipeline `text-classification`, tags `image-text-to-text`, `decision-model` y `reax`). El modelo esta etiquetado como compatible con endpoints y con licencia Apache 2.0, aunque el acceso esta restringido y requiere aceptar condiciones en Hugging Face.

El modelo resuelve, segun sus metadatos, tareas de decision y clasificacion multimodal, partiendo de una base de 31.000 millones de parametros. No obstante, la informacion publica disponible es muy escasa: no se especifican la longitud de contexto, los idiomas soportados, los datos de entrenamiento ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones en el momento de la consulta. La ficha que sigue refleja exclusivamente los datos verificables de la model card y de los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no aparece en la informacion proporcionada.

La relevancia de este modelo radica en su caracter de fine-tune especializado sobre una base de decision de 31B con capacidades multimodales declaradas, lo que lo situa en la categoria de modelos de clasificacion y enrutamiento de alta capacidad. Sin embargo, al no existir documentacion tecnica publica adicional, cualquier evaluacion de produccion debe apoyarse en pruebas directas sobre el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, tag `gemma4`) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | text-classification |
| Modalidad | image-text-to-text |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tamano del repositorio | 62,6 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-22 |
| Fecha de actualizacion | 2026-11-22 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo mas alla de la etiqueta de familia Gemma 4 y de su naturaleza de fine-tune sobre MachinePulseAI/karpo-decision-31B. Los tags indican un uso orientado a clasificacion de texto y a entrada imagen-texto, con las etiquetas `decision-model` y `reax`, pero no se detalla si se trata de un transformer denso, de una variante con mezcla de expertos o de una arquitectura hibrida. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO o tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El unico dato verificable sobre el entrenamiento es el modelo base declarado (MachinePulseAI/karpo-decision-31B) y el hecho de que el checkpoint resultante conserva el tamano de 31.273.088.876 parametros, lo que sugiere un fine-tune completo o una fusion que no altera el recuento de parametros. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa y no debe asumirse en entornos de produccion.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, orientado a tareas de decision y enrutamiento.
- Entrada multimodal imagen-texto: el tag `image-text-to-text` indica que el modelo acepta pares de imagen y texto como entrada.
- Modelo de decision: las etiquetas `decision-model` y `reax` apuntan a un uso como clasificador o enrutador de decisiones dentro de pipelines.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el checkpoint puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): solo se declara vision via `image-text-to-text`; el resto no disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines de clasificacion: el modelo puede emplearse como clasificador de alta capacidad para asignar categorias o rutas a partir de texto, dado su pipeline `text-classification` y su base de 31B parametros.
- Clasificacion de documentos con soporte de imagen: gracias al tag `image-text-to-text`, puede aplicarse a tareas donde la decision depende de contenido visual y textual combinados, como la clasificacion de capturas, formularios escaneados o imagenes con texto asociado.
- Moderacion y filtrado de contenido: como clasificador de 31B, puede utilizarse para etiquetar contenido entrante antes de derivarlo a otros modelos generativos, aprovechando su rol de decision-model.
- Despliegue via endpoints de Hugging Face: al ser `endpoints_compatible`, puede servirse como endpoint gestionado para clasificacion en linea, reduciendo la carga operativa de infraestructura.
- Investigacion sobre fine-tunes de decision: util como checkpoint de referencia para estudiar el comportamiento de fine-tunes sobre bases de 31B en tareas de clasificacion, comparando con el modelo base karpo-decision-31B.
- Evaluacion de modelos multimodales de clasificacion: sirve como candidato para experimentos controlados de clasificacion imagen-texto, siempre que se validen previamente sus capacidades reales mediante pruebas directas, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del checkpoint (31,27B parametros y 62,6 GB de repositorio), la inferencia en precision completa requiere del orden de decenas de GB de memoria, y el repositorio de 62,6 GB sugiere pesos en al menos 16 bits.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, un modelo de 31B en 16 bits no cabe en GPU de consumo de 24 GB sin cuantizacion.
- Cabe en consumer GPU: no disponible con certeza; requeriria cuantizacion agresiva (4 bits o inferior) para aproximarse a 24 GB, y no se declaran tipos de cuantizacion soportados.
- Opciones de despliegue: transformers (libreria declarada) y endpoints de Hugging Face (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| voicort/sn92-generalist-r2-b | 31,27B | no disponible | apache-2.0 | gated, 0 descargas | fine-tune de decision multimodal |
| MachinePulseAI/karpo-decision-31B | 31B (base declarada) | no disponible | no disponible | no disponible | modelo base del fine-tune |
| Alternativas de clasificacion de 31B | no disponible | no disponible | no disponible | no disponible | no se identifican comparables directos en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia documentada de calidad, exactitud o robustez en ninguna tarea.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion de la comunidad sobre el checkpoint.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado y su integracion en pipelines.
- Idiomas no declarados: se desconoce el soporte multilingue real y el comportamiento fuera del idioma de entrenamiento.
- Longitud de contexto no disponible: no se puede planificar el uso con entradas largas sin pruebas previas.
- Riesgo de alucinacion: no evaluado; al ser un modelo de clasificacion, el riesgo se traslada a etiquetas erroneas o decisiones mal enrutadas.
- Sesgos conocidos: no documentados; al no publicarse la composicion del dataset, no se puede auditar el sesgo.
- Licencia Apache 2.0 declarada, pero conviene verificar que el modelo base MachinePulseAI/karpo-decision-31B no imponga restricciones adicionales que prevalezcan sobre la licencia del fine-tune.
- Caveat de produccion: no debe desplegarse en entornos criticos sin una evaluacion propia sobre datos representativos, dado que la documentacion tecnica es minima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-b
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Perfil del autor: https://huggingface.co/voicort
