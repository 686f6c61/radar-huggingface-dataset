# voicort/sn92-generalist-r2-a

## Resumen

sn92-generalist-r2-a es un modelo de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) publicado por el usuario voicort en Hugging Face. Se trata de un fine-tune del modelo MachinePulseAI/karpo-decision-31B, del que hereda la arquitectura etiquetada como "gemma4" en los metadatos del repositorio. El pipeline declarado es text-classification, aunque las etiquetas incluyen tambien image-text-to-text y decision-model, lo que sugiere un uso orientado a tareas de decision y clasificacion sobre entradas multimodales.

El modelo se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 62,6 GB, coherente con pesos en precision de 16 bits para 31,3 mil millones de parametros. El acceso esta restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de poder descargarlo.

La relevancia de esta ficha es limitada por la escasez de documentacion publica: no hay model card sustantiva, no se han publicado benchmarks ni detalles de entrenamiento, y el modelo acumula cero descargas y cero likes en el momento de la consulta. Se trata, por tanto, de una publicacion reciente (creada el 22 de noviembre de 2026) cuyo interes practico esta por determinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta "gemma4" en metadatos; detalles no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tamano del repositorio | 62,6 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

Los metadatos indican que el modelo deriva de MachinePulseAI/karpo-decision-31B mediante fine-tuning, y la etiqueta de arquitectura es "gemma4", lo que apunta a una familia de transformers decoder-only similar a las variantes Gemma de Google. No obstante, no se especifica en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni si emplea mecanismos adicionales como atencion lineal o mezcla de expertos.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La unica informacion sobre el proceso es la relacion de fine-tuning respecto al modelo base y las etiquetas funcionales (decision-model, reax, text-classification), que sugieren un ajuste orientado a tareas de clasificacion y toma de decisiones mas que a generacion abierta.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, por lo que el uso previsto principal es asignar etiquetas o categorias a entradas textuales.
- Procesamiento image-text-to-text: la etiqueta correspondiente sugiere capacidad de recibir imagenes junto con texto, aunque no se detalla el mecanismo de vision ni la resolucion soportada.
- Modelo de decision: la etiqueta decision-model indica un ajuste para tareas de seleccion entre opciones o evaluacion de alternativas.
- Generacion de texto y razonamiento: al derivar de un modelo de 31B con arquitectura tipo Gemma, es plausible que conserve capacidades generativas del modelo base, pero no hay confirmacion documentada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar categorias y prioridades a incidencias entrantes en un helpdesk, aprovechando su ajuste especifico para text-classification y su tamano de 31B para captar matices en descripciones largas.
- Moderacion de contenido: uso como clasificador de politicas sobre textos e imagenes enviados por usuarios, combinando la etiqueta image-text-to-text con la salida categorica del pipeline.
- Enrutamiento de decisiones en pipelines automatizados: la etiqueta decision-model sugiere su uso como componente que elige entre ramas de un flujo (por ejemplo, aprobar, revisar o rechazar una solicitud) en funcion de la entrada.
- Analisis de documentos con imagenes: extraccion de categorias a partir de capturas, formularios escaneados o infografias combinadas con texto descriptivo, gracias a la capacidad multimodal declarada.
- Clasificacion de resenas y feedback de producto: etiquetado de sentimiento, tema y urgencia en grandes volumenes de opiniones de clientes para alimentar dashboards de analitica.
- Filtrado previo en sistemas RAG: uso como clasificador que decide si una consulta requiere recuperacion documental o puede responderse directamente, reduciendo coste en pipelines de generacion aumentada.
- Triaje en entornos de investigacion: clasificacion de abstracts o articulos por relevancia tematica antes de un proceso de revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-63 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 80 GB para contexto corto.
- Cuantizacion a 8 bits: alrededor de 31-32 GB de pesos, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits: alrededor de 16-18 GB de pesos, cabe en una RTX 4090, RTX 5090 o L40S con margen para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para inferencia sin cuantizar; RTX 4090 o RTX 5090 en configuracion cuantizada para entornos de desarrollo.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits en GPUs con 24 GB o mas; en 8 bits requiere 32 GB o multi-GPU.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para serving de alto rendimiento, llama.cpp u Ollama si se generan pesos GGUF (no publicados). El acceso gated obliga a autenticarse con un token de Hugging Face en todos los casos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| voicort/sn92-generalist-r2-a | 31,3B | no disponible | Apache 2.0 | Gated | Fine-tune de karpo-decision-31B, sin benchmarks publicos |
| MachinePulseAI/karpo-decision-31B | 31B (segun nombre) | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Gemma 2 27B (Google) | 27B | 8K | Gemma license | Abierto | Referencia de la familia "gemma" citada en los metadatos |
| Qwen2.5 32B (Alibaba) | 32,5B | 128K | Apache 2.0 | Abierto | Alternativa abierta de tamano comparable con amplia documentacion |

La comparacion cuantitativa de rendimiento no es posible porque sn92-generalist-r2-a no publica resultados de evaluacion.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay documentacion sobre datos de entrenamiento, evaluacion ni comportamiento esperado, lo que dificulta la validacion en produccion.
- Cero descargas y cero likes en Hugging Face: no existe evidencia de uso comunitario ni de validacion independiente.
- Acceso restringido (gated): requiere aceptar condiciones, lo que anade friccion a la integracion en pipelines automatizados y en CI/CD.
- Riesgo de alucinacion: inherente a modelos generativos de esta escala; en tareas de clasificacion puede producir etiquetas fuera del conjunto esperado si no se restringe la salida.
- Sesgos: no disponibles; al no documentarse el corpus de entrenamiento no es posible evaluar sesgos de genero, idioma o dominio.
- Limitaciones de idioma: los idiomas soportados no estan declarados, por lo que el rendimiento en castellano es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base karpo-decision-31B no imponga condiciones adicionales incompatibles.
- Caveat de produccion: al tratarse de un fine-tune no verificado, se recomienda evaluacion propia con un conjunto de validacion representativo antes de cualquier despliegue.
- Fecha de creacion futura en los metadatos (2026-11-22): conviene confirmar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-a
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Perfil del autor: https://huggingface.co/voicort
