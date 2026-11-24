# xflud/sn92-r2-b

## Resumen

xflud/sn92-r2-b es un modelo de lenguaje de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) publicado por el usuario xflud en Hugging Face. Se trata de un fine-tune del modelo MachinePulseAI/karpo-decision-31B, según declara la propia model card a traves de los metadatos de la plataforma. Los tags indican que pertenece a la familia Gemma (tag `gemma4`) y que esta vinculado al ecosistema Bittensor, concretamente al subnet 92 (tags `reax`, `bittensor`, `sn92`), un contexto de entrenamiento descentralizado que explica el nombre del repositorio.

El modelo se distribuye en formato safetensors con un tamano de repositorio de 62,6 GB, lo que es coherente con pesos en precision de 16 bits para 31,3 mil millones de parametros. La licencia declarada es Apache 2.0. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos.

La informacion publica disponible es muy limitada: no se han publicado resultados de benchmarks, no se especifican idiomas soportados, no hay pipeline declarado ni documentacion tecnica sobre el proceso de entrenamiento. Cualquier evaluacion rigurosa del modelo requiere acceso directo a los pesos y a la model card completa, que no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida del tag `gemma4`; no confirmada en documentacion) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica sobre la arquitectura interna del modelo. El tag `gemma4` sugiere que la base pertenece a la familia Gemma, pero no se confirma en la informacion proporcionada ni se detalla si se trata de un transformer denso o de una variante con mezcla de expertos. El modelo es un fine-tune de MachinePulseAI/karpo-decision-31B, segun los metadatos de `base_model`, por lo que su arquitectura hereda la del modelo base, cuyo detalle tampoco se especifica.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion alternativa. El contexto de Bittensor (subnet 92, `reax`) sugiere un entrenamiento o evaluacion en un entorno descentralizado de mineros y validadores, pero no se aportan detalles sobre el procedimiento.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de 31,3 mil millones de parametros, aunque no se documenta explicitamente.
- Razonamiento y matematicas: no disponible en la informacion proporcionada.
- Generacion de codigo: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Fine-tune orientado a decision: el nombre del modelo base (`karpo-decision-31B`) sugiere un ajuste orientado a toma de decisiones, pero no se detalla en la informacion disponible.

## Casos de uso

Dado que no se documentan capacidades especificas, los casos de uso son los genericos de un modelo de lenguaje de 31,3 mil millones de parametros con licencia Apache 2.0, sujetos a validacion empirica:

- Generacion de texto asistida en entornos de investigacion: el modelo puede emplearse como base para experimentos de generacion condicionada, siempre que se valide su calidad con evaluaciones propias dado que no hay benchmarks publicados.
- Fine-tuning adicional sobre dominios especificos: al estar bajo licencia Apache 2.0 y distribuirse en safetensors, es apto para reentrenamiento y ajuste supervisado en pipelines propios.
- Experimentacion en el ecosistema Bittensor: su vinculacion con el subnet 92 lo hace relevante para participantes que quieran reproducir o comparar resultados dentro de ese entorno descentralizado.
- Evaluacion comparativa de fine-tunes: util como punto de referencia en estudios sobre el impacto del ajuste fino sobre el modelo base MachinePulseAI/karpo-decision-31B.
- Despliegue en infraestructura propia con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integracion en productos comerciales sin obligaciones de copyleft, previa verificacion de la licencia del modelo base.
- Investigacion sobre alineacion y comportamiento: permite estudiar diferencias de comportamiento frente al modelo base en tareas de decision, aunque requiere acceso gated y evaluacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 2 GPU de 48 GB (A6000, L40S) o una GPU de 80 GB (A100, H100) con margen ajustado.
- Cuantizacion a 8 bits: alrededor de 31-35 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits: alrededor de 16-20 GB de VRAM, potencialmente viable en una RTX 4090 de 24 GB, aunque no se distribuyen pesos GGUF oficiales y habria que generarlos.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16 sin cuantizar; A6000 o L40S en configuracion multi-GPU; RTX 4090 solo con cuantizacion agresiva.
- Opciones de despliegue: vLLM, TGI o llama.cpp (previa conversion a GGUF), dado que solo se distribuyen safetensors. No hay configuracion de despliegue documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales frente a alternativas de tamano comparable.

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks publicados |
|---|---|---|---|---|---|
| xflud/sn92-r2-b | 31,3 B | no disponible | Apache 2.0 | Gated | No |
| MachinePulseAI/karpo-decision-31B (base) | ~31 B (por herencia) | no disponible | no disponible | no disponible | no disponible |
| Gemma 2 27B (referencia de familia) | 27 B | 8K | Gemma license | Abierto | Si |
| Qwen2.5 32B (referencia de tamano) | 32,5 B | 128K | Apache 2.0 | Abierto | Si |

La comparativa con Gemma 2 27B y Qwen2.5 32B se ofrece solo como referencia de categoria por tamano; no implica que sn92-r2-b tenga rendimiento equivalente, ya que no hay datos que lo respalden.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de calidad, razonamiento, codigo o multilingueismo; cualquier uso en produccion requiere evaluacion propia.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade friccion a la adopcion y a la reproducibilidad.
- Documentacion inexistente: no se detallan datos de entrenamiento, idiomas, contexto ni proceso de alineacion, lo que impide auditar sesgos o riesgos.
- Riesgo de alucinacion: no cuantificado; al no haber evaluaciones publicadas, no puede descartarse un comportamiento deficiente en tareas factuales.
- Sesgos conocidos: no documentados, pero heredables del modelo base MachinePulseAI/karpo-decision-31B, cuyo dataset de entrenamiento no se especifica.
- Licencia: Apache 2.0 en este repositorio, pero conviene verificar la licencia del modelo base, ya que un fine-tune no puede relajar las restricciones del modelo del que deriva.
- Contexto e idiomas desconocidos: no puede garantizarse soporte de ventanas largas ni de castellano.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- Fecha de creacion inusual (2026-11-24): conviene verificar la integridad y procedencia de los pesos antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xflud/sn92-r2-b
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (ecosistema referenciado por el tag `bittensor`): https://bittensor.com
- Subnet 92 (referenciado por el tag `sn92`): no disponible en la informacion proporcionada
