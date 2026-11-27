# thurstonpowers/xll-regulations-qwen3.5-9b

## Resumen

XLL Regulations Qwen3.5-9B es un ajuste fino completo (full fine-tune) de tipo "full-language" desarrollado por el usuario thurstonpowers sobre el modelo base Qwen/Qwen3.5-9B, en su revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. El modelo está especializado en una tarea muy concreta: convertir secciones de regulaciones federales estadounidenses (CFR) en un árbol JSON estructural alineado con el origen, denominado XLL, que sigue la semántica de USLM (United States Legislative Markup). No es un adaptador LoRA, sino un ajuste completo de los pesos en BF16, y no pretende competir con modelos frontera de propósito general.

El problema que resuelve es la conversión fiel de texto normativo a estructura jerárquica con spans verificables: el modelo recibe una indexación léxica dispersa y sin pérdida del texto fuente (fragmentos `start:end|JSON-string`) y devuelve un árbol `{"tree":[tag,start,end,attributes,children]}` cuyos offsets apuntan al texto original, de modo que todo el contenido se copia por spans y no se regenera. Es relevante ahora porque la estructuración automática de normativa con trazabilidad exacta al origen es un cuello de botella en pipelines legales y regulatorios, y este modelo ofrece una alternativa de despliegue contenido (9.400 millones de parámetros) frente a modelos mucho mayores.

La arquitectura subyacente es la del Qwen3.5-9B, un transformer denso con capacidades multimodales (etiquetado como `image-text-to-text` en Hugging Face), aunque el ajuste se centra exclusivamente en la tarea de estructuración de regulaciones en inglés. El repositorio ocupa 18,8 GB y acumula 193 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B), ajuste fino completo |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parámetros. El ajuste es un full fine-tune (no LoRA), lo que implica que se actualizaron todos los pesos del modelo base y se conservan en BF16 en el repositorio. El pipeline declarado es `text-generation`, aunque el modelo base está etiquetado también como `image-text-to-text`; el ajuste, en cambio, se ha realizado exclusivamente para la tarea de conversión estructural de regulaciones.

El entrenamiento se realizó sobre el dataset `thurstonpowers/xll-regulations-dataset` y define un protocolo propio denominado `raw-text-cfr-source-native-structure-0.2`, con la variante de prompt `cfr-native-lexical-sparse-v2-regulations`. La innovación técnica principal no está en la arquitectura, sino en la interfaz: el modelo no acepta texto plano, sino una indexación léxica dispersa y sin pérdida del texto fuente, donde cada fragmento no vacío se codifica como `start:end|JSON-string` con offsets de caracteres Unicode (base cero, extremo final exclusivo) y las posiciones no listadas se rellenan con espacios ASCII. La salida es un árbol JSON de cinco campos por nodo (`tag`, `start`, `end`, `attributes`, `children`) que indexa el texto original, de modo que el contenido se copia por spans en lugar de regenerarse. El sistema prompt está congelado y debe usarse byte a byte tal como se distribuye en `PROMPT_TRAINED.txt`; la decodificación recomendada es greedy (`do_sample=False`) con `enable_thinking=False`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Conversión de secciones de regulaciones federales (CFR) a árbol JSON estructural XLL con spans alineados al texto fuente.
- Preservación de elementos estructurales: `num`, `heading`, `chapeau`, `content`, `continuation`, `notes`, `references`, markup inline, tablas y tipos de provisión jerárquicos.
- Atributos limitados a los evidenciados por el texto: `value`, `date`, `type`, `role`, `topic`, `status` y atributos de tabla (`colspan`, `rowspan`, `scope`, `span`).
- Manejo de espacios en blanco no ASCII (incluido espacio duro `U+00A0` y espacio fino de no separación `U+202F`) mediante listado explícito en la indexación.
- Salida JSON estricta sin explicaciones, con estructura de árbol ordenada, sin solapamientos y contenida dentro de los padres.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de tarea única.
- Capacidad multilingüe: no disponible; solo inglés.
- Capacidad de visión: no aplicable al ajuste, aunque el modelo base esté etiquetado como multimodal.

## Casos de uso

- Estructuración de normativa federal para publicación web: el modelo convierte secciones del CFR en árboles XLL con spans verificables, lo que permite renderizar la norma con jerarquía fiel y enlaces directos a cada fragmento del texto original.
- Auditoría y validación de conversiones legales: al devolver offsets sobre el texto fuente, un pipeline puede verificar automáticamente que cada nodo del árbol corresponde exactamente a un rango de caracteres del documento original, reduciendo el riesgo de contenido inventado.
- Migración de repositorios normativos a USLM: el modelo facilita la conversión por lotes de secciones regulatorias a una estructura compatible con la semántica USLM, manteniendo distintos los elementos de fuente, autoridad y editorial.
- Extracción de metadatos regulatorios: los atributos `value`, `date`, `type`, `role`, `topic` y `status` permiten poblar índices de búsqueda y bases de datos normativas a partir de texto no estructurado.
- Procesamiento de tablas en regulaciones: la predicción de atributos `colspan`, `rowspan`, `scope` y `span` permite reconstruir tablas regulatorias con su estructura de presentación evidenciada en el texto.
- Despliegue en entornos con recursos limitados: con 9.400 millones de parámetros y pesos BF16, el modelo puede servirse en infraestructura más modesta que modelos frontera, manteniendo una tarea especializada y un contrato de entrada bien definido.
- Integración en pipelines de revisión humana: dado que el autor exige ensamblaje determinista, validación y revisión humana, el modelo encaja como primer paso automático en flujos de trabajo legales con control de calidad posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el repositorio incluye "evaluation evidence", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de precisión de conversión estructural en la información facilitada. El autor indica además que la mejor relación coste-efectividad y el throughput de servicio no se han medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9.409.813.744 parámetros en BF16, los pesos ocupan aproximadamente 18,8 GB, por lo que se requiere al menos esa cantidad de memoria más el espacio para el contexto y el árbol de salida.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una A100 de 40 GB o 80 GB, una H100 o una L40S de 48 GB son opciones razonables para BF16; no se confirma compatibilidad con GPUs de menor memoria.
- ¿Cabe en GPU de consumo? No confirmado. En BF16 no cabría en GPUs de 24 GB sin cuantización, y el autor no distribuye versiones cuantizadas ni documenta su uso.
- Opciones de despliegue: transformers con el modelo base Qwen/Qwen3.5-9B en la revisión indicada, BF16, decodificación greedy y sin gramática ni restricciones de salida. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no se han medido.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio autor indica que este modelo no es un competidor de propósito general de modelos frontera, sino un ajuste especializado de tarea única, por lo que una comparativa directa con alternativas genéricas no está disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL Regulations Qwen3.5-9B | 9.409.813.744 | No disponible | Estructuración XLL de CFR | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no acepta texto plano de regulaciones: fuera del contrato de entrada indexada no debe esperarse que reproduzca la precisión reportada.
- No es un adaptador de estatutos ni XML USLM autónomo; su alcance es la conversión de secciones de regulaciones federales a árbol XLL.
- Requiere usar el system prompt congelado byte a byte y el formato de mensaje exacto; sustituirlo por un prompt arbitrario invalida el contrato entrenado.
- Los offsets de salida indexan el texto original, no el mensaje indexado; aplicarlos al mensaje indexado es un error de uso documentado.
- Exige ensamblaje determinista, validación y revisión humana; no está pensado para producción sin controles posteriores.
- Riesgo de alucinación estructural: aunque el diseño copia texto por spans, el modelo podría generar atributos o jerarquías no evidenciados si se usa fuera de distribución.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: solo inglés; no se documenta soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-9B.
- No se han medido throughput, latencia ni coste-efectividad, por lo que las estimaciones de producción quedan pendientes de validación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-regulations-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-regulations-dataset
- Prompt entrenado (`PROMPT_TRAINED.txt`): incluido en el repositorio del modelo
- Ejemplo de entrenamiento (`example.json`): incluido en el repositorio del modelo
