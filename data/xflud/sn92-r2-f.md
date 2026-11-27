# xflud/sn92-r2-f

## Resumen

xflud/sn92-r2-f es un ajuste fino (finetune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario xflud en Hugging Face. El identificador sugiere su vinculación con el ecosistema de subredes de Bittensor (SN92), y las etiquetas del repositorio lo asocian explícitamente con "reax" y "gemma4", lo que apunta a una arquitectura de la familia Gemma. Con 31.273.088.876 parámetros reales declarados en los tensores safetensors (aproximadamente 31,3 mil millones), se sitúa en la categoría de modelos densos de gran tamano, adecuados para tareas de razonamiento y generación compleja.

El modelo se distribuye bajo licencia Apache 2.0, pero el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. El repositorio ocupa 62,6 GB, lo que es coherente con pesos en precisión de 16 bits para un modelo de este tamano. No se han publicado descargas ni interacciones (likes) en el momento de la consulta, y la ficha de Hugging Face no incluye pipeline, idiomas soportados ni documentación técnica adicional.

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto derivado de un modelo base de terceros, sin documentación pública sobre el proceso de ajuste, los datos utilizados ni los benchmarks. Cualquier evaluación seria debe partir del modelo base (karpo-decision-31B) y tratar este finetune como una variante experimental del ecosistema Bittensor, no como un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, segun tag "gemma4"); detalles no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia Gemma ("gemma4") y a un ajuste fino sobre MachinePulseAI/karpo-decision-31B. El numero de parametros (31,3 mil millones) es consistente con un transformer denso de gran tamano, pero no se confirma si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Tampoco se documentan los datos de entrenamiento del finetune: no hay informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni las tecnicas de alineacion aplicadas. La etiqueta "reax" y la referencia a "sn92" y "bittensor" sugieren que el modelo se entreno en el contexto de una subred de Bittensor, posiblemente con datos o recompensas generados por participantes de la red, pero esto es una inferencia a partir de las etiquetas y no un dato confirmado. Cualquier afirmacion sobre el proceso de entrenamiento debe considerarse no verificada.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base karpo-decision-31B, sin documentacion especifica del finetune.
- Codigo y matematicas: no confirmado para este finetune; depende de las capacidades del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas en la ficha).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Alineacion con el ecosistema Bittensor/SN92: presumible por las etiquetas, sin detalles tecnicos.

## Casos de uso

- Evaluacion comparativa de finetunes en el ecosistema Bittensor: el modelo puede utilizarse como punto de comparacion frente a otros ajustes de la subred SN92, midiendo su comportamiento en tareas estandarizadas y verificando si el ajuste aporta mejoras sobre el modelo base.
- Investigacion sobre trazabilidad de modelos derivados: al ser un finetune de karpo-decision-31B con licencia Apache 2.0, sirve como caso de estudio para analizar como se propagan capacidades y sesgos desde un modelo base a sus derivados.
- Experimentacion con modelos de 31B en entornos de investigacion: con acceso a GPU de alta gama (A100 80 GB o H100), puede desplegarse para probar tecnicas de prompting, evaluacion de robustez o analisis de representaciones internas.
- Pruebas de integracion en pipelines de inferencia: al distribuirse en safetensors, puede cargarse con frameworks como vLLM o TGI (previa conversion si fuera necesario) para medir latencia y throughput en cargas reales.
- Analisis de seguridad y alineacion: dado que no hay documentacion sobre el proceso de ajuste, es un candidato para auditorias de sesgo, alucinacion y comportamiento adversarial antes de cualquier uso serio.
- Reproduccion de experimentos de la subred: para participantes de SN92 que necesiten verificar resultados publicados o comparar variantes del mismo linaje de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 80 GB para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 31-35 GB de VRAM, viable en una A100 80 GB o en dos RTX 4090 (24 GB cada una) con paralelizacion.
- Cuantizacion a 4 bits (si se generan pesos GGUF/AWQ, no disponibles en el repo): aproximadamente 16-18 GB, lo que permitiria ejecucion en una unica RTX 4090 o RTX 3090, con perdida de calidad no evaluada.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, o configuraciones multi-GPU con RTX 4090/3090 para cuantizacion agresiva.
- Cabe en GPU consumer: solo con cuantizacion a 4 bits y en GPUs de 24 GB o mas; en FP16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: vLLM y TGI para safetensors en precision completa; llama.cpp u Ollama requeririan conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| xflud/sn92-r2-f | 31,3B | no disponible | Apache 2.0 | Gated | Finetune de karpo-decision-31B, sin benchmarks |
| MachinePulseAI/karpo-decision-31B | 31B (segun nombre) | no disponible | no disponible | no disponible | Modelo base del que deriva este finetune |
| Gemma 2 27B (referencia de familia) | 27B | 8K (segun version) | Gemma license | Abierto | Alternativa de tamano similar en la familia Gemma; datos de contexto y licencia segun la version oficial |

La comparativa con alternativas de la misma categoria es limitada porque no se dispone de especificaciones tecnicas del modelo base ni de benchmarks del finetune. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card con detalles de entrenamiento, datos, hiperparametros ni evaluacion.
- Riesgo de alucinacion no evaluado: sin benchmarks ni pruebas de robustez publicadas.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible anticipar sesgos de genero, idioma, culturales o politicos.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingue adecuado.
- Contexto maximo desconocido: impide planificar casos de uso con ventanas largas.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion para su uso en produccion y para la reproducibilidad cientifica.
- Licencia Apache 2.0 declarada, pero la cadena de licencias del modelo base debe verificarse antes de uso comercial, ya que el finetune hereda obligaciones del modelo original.
- Sin senales de adopcion (0 descargas, 0 likes): no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Repositorio de 62,6 GB: coste de almacenamiento y transferencia considerable para experimentacion.

## Enlaces

- Hugging Face: https://huggingface.co/xflud/sn92-r2-f
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (ecosistema referenciado en las etiquetas): https://bittensor.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
