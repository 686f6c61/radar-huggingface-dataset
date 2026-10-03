# zhihuanglab/Haiku-Bi

## Resumen

Haiku-Bi es un modelo publicado por el laboratorio zhihuanglab en HuggingFace, distribuido bajo licencia "other" y con acceso restringido (gated), lo que obliga a aceptar condiciones adicionales antes de poder descargarlo. Las etiquetas del repositorio lo sitúan como un modelo multimodal (pytorch, multimodal) orientado al dominio de la histología (histology) y con capacidades declaradas de recuperación de información (retrieval) junto a la etiqueta codex. El repositorio ocupa 2,8 GB y fue creado y actualizado el 3 de octubre de 2026, sin descargas ni "likes" registrados en el momento de la consulta.

Por el conjunto de etiquetas, el modelo parece concebido para tareas de visión-lenguaje aplicadas a imágenes histopatológicas, probablemente combinando un codificador visual con un codificador de texto para búsqueda y recuperación cruzada (texto a imagen e imagen a texto) en el ámbito clínico o de investigación biomédica. No obstante, la ficha pública no incluye información sobre arquitectura concreta, número de parámetros, longitud de contexto, composición del dataset de entrenamiento ni idiomas soportados, por lo que cualquier afirmación al respecto queda fuera del alcance de los datos disponibles.

Su relevancia potencial reside en la intersección entre modelos de recuperación multimodal y patología digital, un nicho donde las alternativas públicas son escasas y donde el acceso restringido sugiere un uso pensado para entornos controlados (investigación clínica, laboratorios, pipelines internos de hospitales o empresas biotech). Aun así, la ausencia de benchmarks, documentación técnica y métricas publicadas impide validar su rendimiento frente a otras propuestas del sector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (sin indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | pytorch (tamano de repositorio: 2,8 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. Las etiquetas del repositorio (multimodal, histology, codex, retrieval) apuntan a un diseno de codificadores duales o a un transformer multimodal con un modulo especifico de recuperacion, pero no hay confirmacion documental del tipo de backbone (ViT, transformer multimodal, hibrido), del numero de parametros ni de si incorpora atencion lineal u otras tecnicas de eficiencia.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, proporcion de pares imagen-texto, uso de datos histopatologicos anotados), sobre tecnicas de alineacion como RLHF, DPO o contrastive learning, ni sobre innovaciones tecnicas destacables. Toda esa informacion figura como no disponible en la ficha publica del repositorio.

## Capacidades

- Procesamiento multimodal: la etiqueta "multimodal" sugiere la capacidad de manejar conjuntamente imagenes y texto, si bien no se detalla la modalidad exacta ni el tipo de entradas admitidas.
- Recuperacion de informacion (retrieval): la etiqueta "retrieval" apunta a busqueda cruzada texto-imagen o imagen-texto, presumiblemente orientada a encontrar imagenes histologicas a partir de descripciones textuales o viceversa.
- Dominio histologico: la etiqueta "histology" indica que el modelo esta especializado o al menos ajustado para imagenes de tejidos y patologia.
- Referencia a "codex": la etiqueta "codex" no va acompanada de explicacion en la informacion disponible; podria aludir a un dataset, a un componente del pipeline o a un convenio de nombres, pero no se puede confirmar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): se intuye vision por la etiqueta multimodal, sin detalles adicionales.

## Casos de uso

- Recuperacion de imagenes histopatologicas por descripcion textual: un patologo podria escribir una descripcion morfologica y el modelo devolveria laminas o regiones candidatas de una base de datos, apoyandose en la etiqueta "retrieval" declarada.
- Anotacion asistida de biobancos: dado un conjunto de imagenes ya etiquetadas, el modelo podria generar representaciones vectoriales para indexar y buscar muestras similares en grandes repositorios de tejidos.
- Busqueda cruzada en literatura biomedica: enlazar figuras de articulos con texto descriptivo o con imagenes de una base interna, si el modelo maneja pares imagen-texto.
- Preseleccion en pipelines de diagnostico asistido: utilizar el modelo como primera etapa de filtrado para priorizar laminas que requieran revision humana, siempre con supervision profesional.
- Control de calidad de datasets de patologia: detectar duplicados, imagenes mal etiquetadas o muestras anomalas mediante similitud en el espacio de embeddings.
- Investigacion traslacional: agrupar muestras por similitud visual para estudios de subtipos tumorales o correlaciones morfologicas, sirviendo como encoder de representaciones en modelos posteriores.
- Integracion en herramientas de laboratorio: desplegar el modelo como servicio interno de recuperacion dentro de un LIMS o visor de laminas, siempre que la licencia "other" lo permita tras revisar las condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un repositorio de 2,8 GB en precision fp16 sugiere pesos del orden de 1.000 a 1.500 millones de parametros, lo que implicaria del orden de 2 a 4 GB de VRAM solo para pesos; en fp32 la cifra se duplicaria. Esta estimacion es especulativa y no sustituye a datos oficiales.
- GPU recomendadas: no disponibles en la documentacion. Por el tamano estimado, una GPU de gama media-alta (por ejemplo RTX 3060 de 12 GB o superior) podria ser suficiente, pero no hay confirmacion.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del repositorio, aunque no esta verificado por el autor.
- Opciones de despliegue: no disponibles. Al tratarse de un modelo pytorch es plausible su carga con PyTorch nativo, TorchScript o herramientas genericas, pero no se documenta soporte para vLLM, llama.cpp, Ollama, TGI u otras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de especificaciones publicas de Haiku-Bi (parametros, contexto, licencia detallada, benchmarks) que permitan una comparacion rigurosa. A continuacion se enumeran alternativas del mismo nicho (vision-lenguaje aplicado a histologia) a titulo orientativo, sin que ello implique equivalencia funcional:

| Modelo | Categoria | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Haiku-Bi | Multimodal histologia + retrieval | no disponible | no disponible | other (gated) | Sin benchmarks publicados |
| CONCH | Vision-lenguaje histologia | no disponible | no disponible | Uso restringido/investigacion | Modelo de referencia en el nicho |
| UNI | Vision (encoder) histologia | no disponible | no disponible | Uso restringido/investigacion | Solo vision, sin texto |
| PLIP | CLIP adaptado a patologia | no disponible | no disponible | Uso de investigacion | Recuperacion imagen-texto |

La comparacion cuantitativa no es posible con la informacion disponible; se recomienda consultar las fichas oficiales de cada alternativa antes de tomar decisiones de adopcion.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta gated, por lo que es necesario aceptar condiciones adicionales en HuggingFace antes de descargar pesos o datos.
- Licencia "other": no se especifican los terminos exactos; hay que revisar el texto completo de la licencia antes de cualquier uso comercial o clinico.
- Ausencia total de benchmarks: no hay metricas publicadas que permitan estimar calidad, sesgos o robustez.
- Dominio muy especifico: al estar orientado a histologia, su comportamiento fuera de ese ambito es incierto y no documentado.
- Sesgos potenciales: no se ha publicado informacion sobre la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demograficos, de tincion, de escaner o de poblacion.
- Riesgo de alucinacion o falsos positivos en retrieval: en tareas de recuperacion, un modelo no validado puede devolver coincidencias espurias; en contexto clinico esto exige supervision humana.
- Idiomas: no se documenta que idiomas soporta, lo que limita su uso en entornos no anglosajones.
- Sin soporte documentado de tool calling ni de agentes: no se puede asumir su integracion en pipelines agenticos sin pruebas adicionales.
- Uso clinico: cualquier aplicacion medica requiere validacion regulatoria y supervision profesional; el modelo no declara estar certificado para diagnostico.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que dificulta estimar su madurez o mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/zhihuanglab/Haiku-Bi
