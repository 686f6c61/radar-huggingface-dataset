# SZLHOLDINGS/SZL-AcousticGovernance-0.8B-v1

## Resumen

SZL-AcousticGovernance-0.8B-v1 es un modelo de generacion de texto de aproximadamente 873 millones de parametros publicado por SZLHOLDINGS, una organizacion que agrupa modelos, datasets y Spaces bajo lo que denomina un "estate" de IA gobernada con resultados verificables mediante recibos de auditoria. El modelo se presenta como un artefacto entrenado dentro de esa factoria gobernada y deriva de un modelo base de la misma organizacion, SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez se apoya en la arquitectura qwen3_5 segun los tags del repositorio.

El interes tecnico principal no reside en una innovacion arquitectonica propia, sino en su enfoque de gobernanza: la model card explicita que cualquier afirmacion de entrenamiento o evaluacion debe estar respaldada por ficheros de recibo (receipts) y que lo que no esta medido se etiqueta como UNKNOWN en lugar de estimarse. Esta filosofia de trazabilidad resulta relevante para equipos que necesitan modelos pequenos y desplegables en entornos con requisitos de auditoria.

Con 0,8B de parametros, licencia Apache 2.0 y pesos en safetensors, el modelo esta pensado para inferencia ligera en text-generation. La informacion publica disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni composicion del dataset, por lo que esta ficha marca explicitamente como no disponible todo aquello que la model card no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tags del repo) |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer asociada a la familia qwen3_5, tal como reflejan los tags del repositorio. Con 873.438.784 parametros, se situa en el rango de los modelos pequenos orientados a despliegue eficiente. El modelo base declarado es SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, un artefacto de la misma organizacion afinado mediante SFT (supervised fine-tuning) segun su nomenclatura, sobre el que se habria construido esta variante de "gobernanza acustica".

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica de forma explicita que las afirmaciones de entrenamiento y evaluacion residen en ficheros de recibo del "estate" y que cualquier dato no documentado debe considerarse UNKNOWN. Por tanto, la trazabilidad del entrenamiento depende de verificar esos recibos en el repositorio de la organizacion en GitHub, no de la card de Hugging Face.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Pipeline declarado: text-generation.
- Compatible con la libreria transformers.
- No se documentan capacidades de razonamiento avanzado, codigo o matematicas mas alla de las inherentes al modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (vision, audio) pese al nombre "Acoustic" del modelo; la card no describe entrada o salida de audio.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Clasificacion y etiquetado de texto a gran escala: con 0,8B de parametros, el modelo puede procesar volumenes altos de documentos en lotes sobre una sola GPU, lo que lo hace adecuado para tareas de categorizacion o extraccion de campos en pipelines de datos.
- Generacion de resumenes de documentos cortos en ingles: su tamano permite desplegarlo en un servicio de resumenes con baja latencia, siempre que se valide la calidad frente al modelo base.
- Prototipado rapido en entornos de investigacion: sirve como modelo de referencia para experimentar con tecnicas de evaluacion gobernada y trazabilidad de resultados, dado el enfasis de la organizacion en recibos auditables.
- Filtrado y preprocesado en cascada: puede actuar como primera etapa barata que descarte o marque contenido antes de pasarlo a un modelo mayor, reduciendo coste por token en sistemas de dos niveles.
- Despliegue en entornos con requisitos de auditoria: la licencia Apache 2.0 y la filosofia de documentacion con marcas MEASURED/UNKNOWN facilitan su inclusion en sistemas donde cada componente debe justificar sus afirmaciones.
- Experimentacion con fine-tuning sobre dominios concretos: al ser un modelo pequeno con pesos safetensors y licencia permisiva, es un candidato razonable para ajuste supervisado en tareas de nicho en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y que los datos no documentados se etiquetan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,0 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,5-0,6 GB para pesos (requiere conversion propia, ya que no se publican variantes cuantizadas).
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- GPU de datacenter: A100, H100 y L40S pueden ejecutarlo con margen amplio y alto paralelismo de peticiones.
- Opciones de despliegue: transformers de forma nativa; vLLM y TGI son viables si la arquitectura qwen3_5 esta soportada por esas librerias; llama.cpp u Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| SZL-AcousticGovernance-0.8B-v1 | 873 M | no disponible | Apache 2.0 | en | Pesos safetensors, sin benchmarks publicados |
| Qwen3 0.6B | ~600 M | no disponible en esta ficha | Apache 2.0 | multilingue | Familia base declarada por los tags; referencia natural de comparacion |
| Llama 3.2 1B | ~1,2 B | 128 K (segun documentacion publica de Meta) | Llama 3.2 Community License | multilingue | Mayor tamano y contexto documentado; licencia con restricciones |
| SmolLM2 1.7B | ~1,7 B | no disponible en esta ficha | Apache 2.0 | en | Alternativa pequena con documentacion de entrenamiento publica |

La comparacion directa de rendimiento no es posible porque el modelo no publica benchmarks. Frente a las alternativas, su principal diferencia es la trazabilidad documental y la licencia permisiva, no unas metricas superiores demostradas.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera limitado.
- No se publican benchmarks, por lo que no hay evidencia medida de calidad frente a modelos de tamano similar.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas con documentos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas de fidelidad.
- No se documentan sesgos; al desconocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o ideologicos.
- El nombre "AcousticGovernance" no corresponde a capacidades de audio documentadas; conviene no asumir funcionalidad de voz sin verificacion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluaciones y de documentacion de entrenamiento traslada al integrador la responsabilidad de validar el modelo en produccion.
- Las afirmaciones de la organizacion sobre resultados verificables remiten a ficheros de recibo externos; deben comprobarse en el repositorio de GitHub antes de tomarlas como validas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-AcousticGovernance-0.8B-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base declarado: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de generacion de cards: https://github.com/szl-holdings/estate-cards
