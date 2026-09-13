# Tohirju/sl-tanager

## Resumen

Tohirju/sl-tanager es un modelo de lenguaje publicado en HuggingFace por el usuario Tohirju, con un total de 852.985.920 parametros (aproximadamente 853 millones) verificado a partir de los pesos en formato safetensors. El repositorio ocupa 1,7 GB, lo que es coherente con un checkpoint en precision de 16 bits sin optimizaciones adicionales. La etiqueta de arquitectura declarada es `qwen3_5`, lo que indica que el modelo se construye sobre la familia Qwen3.5, aunque no se especifica si se trata de un modelo base, un fine-tune o un ajuste con datos propios.

El modelo esta sujeto a acceso restringido (gated): para descargarlo es necesario aceptar previamente las condiciones en la pagina de HuggingFace. La licencia declarada es `other`, es decir, una licencia personalizada cuyo texto no se ha podido consultar desde fuera del repositorio, por lo que las condiciones exactas de uso comercial, redistribucion y atribucion quedan pendientes de revision directa.

En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, y su fecha de creacion y ultima actualizacion difieren en menos de un minuto (12 de septiembre de 2026), lo que sugiere una publicacion muy reciente y sin ciclo de validacion por parte de la comunidad. Por tanto, debe tratarse como un checkpoint experimental sin evidencia publica de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en HuggingFace; no se detalla la variante exacta ni si incorpora componentes MoE o hibridos) |
| Parametros totales | 852.985.920 (aproximadamente 0,85 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser pesos safetensors es tecnicamente convertible a GGUF/AWQ/GPTQ, pero no se confirma ningun formato cuantizado publicado |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; texto no accesible sin aceptar las condiciones del repositorio) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,7 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La unica informacion tecnica disponible sobre la arquitectura es la etiqueta `qwen3_5` incluida en el repositorio, que vincula el modelo a la familia Qwen3.5 y, por tanto, a una arquitectura transformer con atencion por causalidad y tokenizador derivado de dicha familia. El recuento real de parametros (852.985.920) situa el checkpoint en el rango de los modelos pequenos, disenados para inferencia en hardware de consumo o para servir como base de ajuste fino en tareas concretas.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF, DPO u otros metodos de alineamiento, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento explicito, etc.). Tampoco se documenta si el modelo parte de un checkpoint preentrenado de Qwen3.5 y ha sido refinado por el autor, ni con que datos. Todos estos extremos deben considerarse no disponibles.

## Capacidades

No se ha publicado ninguna descripcion de capacidades en la informacion disponible. A continuacion se enumeran unicamente los extremos verificables y las capacidades que cabria esperar por herencia de la familia Qwen3.5, marcadas explicitamente como no confirmadas:

- Generacion de texto: el modelo es un modelo de lenguaje causal y, por tanto, capaz de generar texto, pero no hay evaluacion publica de calidad.
- Razonamiento, matematicas y codigo: no disponible; no hay evidencia publicada ni benchmarks que lo respalden.
- Soporte de tool calling / function calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades multimodales (vision, audio): no disponible; el repositorio solo contiene safetensors de texto segun la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no confirmado.

## Casos de uso

Dado que no existe documentacion de capacidades ni benchmarks, los siguientes escenarios son propuestas de evaluacion y uso condicionado, no usos validados:

- Ajuste fino especifico de dominio: con 853 millones de parametros y 1,7 GB de pesos en FP16, el modelo se puede reentrenar por LoRA o QLoRA en una unica GPU de consumo (por ejemplo, una RTX 4090 de 24 GB o una RTX 3060 de 12 GB en 4 bits), lo que lo hace util como banco de pruebas para experimentos de adaptacion a dominios verticales.
- Clasificacion y etiquetado de texto a escala: al ser un modelo pequeno, permite procesar grandes volumenes de documentos con un coste por token bajo, siempre que se valide previamente su calidad en la tarea concreta.
- Extraccion de informacion estructurada: generacion de salidas JSON a partir de texto no estructurado en pipelines de ingestión de datos, sujeto a verificacion de que el modelo respeta el formato.
- Componente auxiliar en sistemas RAG: uso como generador de respuestas acotadas a un contexto recuperado, o como modelo de reescritura de consultas y generacion de hipoteticos para recuperacion, desplegado en local por su tamano reducido.
- Inferencia en el borde o en entornos sin conectividad: al caber en menos de 1 GB en cuantizacion de 4 bits, es candidato para despliegues en dispositivos con recursos limitados o en entornos aislados, previa conversion a GGUF.
- Educacion e investigacion: analisis de comportamiento de modelos de la familia Qwen3.5 en escala reducida, reproducible en hardware asequible.
- Evaluacion comparativa interna: servir como linea base de ~0,85B parametros frente a otros modelos del mismo orden en tareas propietarias de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con metricas, no hay evaluaciones de terceros y el modelo no registra descargas ni interacciones que permitan inferir un uso validado. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (852.985.920). No incluyen el coste de la cache KV, que depende de la longitud de contexto efectiva, dato no disponible:

- Pesos en FP16/BF16: aproximadamente 1,71 GB (coincide con el tamano del repositorio, 1,7 GB).
- Pesos en INT8: aproximadamente 0,85 GB.
- Pesos en INT4 (por ejemplo Q4_K_M): aproximadamente 0,45-0,55 GB.
- VRAM total recomendada en FP16: 2-3 GB contando pesos, cache KV y overhead del runtime para contextos moderados.
- VRAM total recomendada en INT4: 1-2 GB.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en GPUs integradas con memoria unificada suficiente.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para inferencia; solo tendrian sentido para entrenamiento o ajuste fino a gran escala.
- Opciones de despliegue: al publicarse en safetensors, es compatible con HuggingFace Transformers, vLLM y TGI. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no esta confirmada en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay datos de rendimiento de sl-tanager que permitan una comparacion funcional. La tabla siguiente contrasta unicamente los datos verificables del modelo con las especificaciones publicas de alternativas del mismo orden de magnitud, y se indica "no disponible" alli donde no existe informacion sobre sl-tanager.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato publicado |
|---|---|---|---|---|---|
| Tohirju/sl-tanager | 852.985.920 | no disponible | no disponible | other (personalizada) | safetensors |
| Qwen3-0.6B (referencia publica de la familia) | 0,6B | hasta 32k nativo, ampliable con YaRN | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B (alternativa de tamano similar) | 1,23B | 128k | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| SmolLM2-1.7B (alternativa de tamano superior) | 1,7B | 8k | ingles principalmente | Apache 2.0 | safetensors, GGUF |

Las especificaciones de los modelos de referencia corresponden a su documentacion publica y se incluyen solo como contexto de categoria. No implican ninguna equivalencia de calidad con sl-tanager, cuyo rendimiento no ha sido medido ni publicado.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con descripcion de datos, entrenamiento, limitaciones o uso previsto.
- Sin evidencia de rendimiento: no existen benchmarks publicos ni evaluaciones de terceros; cualquier uso en produccion requiere una evaluacion propia previa.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje y no cuantificado en este caso; en un modelo pequeno sin alineamiento documentado el riesgo puede ser elevado.
- Sesgos: no se ha publicado informacion sobre la composicion del dataset ni sobre procesos de mitigacion de sesgos, por lo que se desconocen los sesgos presentes.
- Idiomas: se desconoce la cobertura linguistica real y no se garantiza un rendimiento adecuado en castellano.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar tareas de contexto largo.
- Licencia: la licencia `other` no es accesible sin aceptar las condiciones del repositorio; antes de cualquier uso comercial hay que revisar el texto completo, ya que podria restringir la explotacion, la redistribucion o el uso de los resultados.
- Acceso restringido: la descarga esta condicionada a la aprobacion del autor, lo que anade una dependencia operativa para pipelines automatizados.
- Riesgo de cadena de suministro: al tratarse de un repositorio de un unico autor, con 0 descargas y publicado y actualizado en el mismo minuto, no existe trazabilidad ni validacion por parte de la comunidad. Conviene verificar la integridad de los pesos y la ausencia de codigo remoto malicioso antes de cargarlos.
- Fecha de publicacion futura respecto a la fecha habitual de consulta (12 de septiembre de 2026), lo que refuerza la necesidad de tratar cualquier dato temporal con cautela.

## Enlaces

- HuggingFace (acceso restringido): https://huggingface.co/Tohirju/sl-tanager
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, su autor o su arquitectura: los resultados obtenidos correspondian a paginas de acceso a correo institucional del ejercito estadounidense, sin relacion con el modelo. No se dispone por tanto de paper, blog tecnico, repositorio de codigo ni demo asociados.
