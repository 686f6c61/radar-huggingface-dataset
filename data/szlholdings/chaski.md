# SZLHOLDINGS/chaski

## Resumen

chaski es un modelo de generacion de texto publicado por SZLHOLDINGS, un consorcio que agrupa sus artefactos bajo la denominacion "governed-AI estate". El modelo se presenta como un ajuste o artefacto entrenado derivado del modelo base Qwen/Qwen3.5-0.8B, lo que lo situa en la categoria de modelos pequenos (menos de 1.000 millones de parametros) orientados a despliegues con recursos limitados. El repositorio declara 873.438.784 parametros reales en formato safetensors y un peso total de 1,8 GB.

La relevancia de chaski no reside en una innovacion arquitectonica propia, sino en su enfoque de trazabilidad: la model card insiste en que cualquier afirmacion sobre entrenamiento o evaluacion debe estar respaldada por ficheros de "recibo" (receipts) con marca temporal, y que aquello no verificado se etiqueta explicitamente como UNKNOWN. Esta politica de honestidad documental es poco habitual en el ecosistema y resulta util para equipos que necesitan auditar el origen de un modelo antes de integrarlo.

Tecnicamente hereda la arquitectura y el tokenizador de Qwen3.5-0.8B, con licencia Apache 2.0 y soporte declarado unicamente para ingles. No se han publicado resultados de benchmarks ni detalles del dataset de ajuste en la informacion disponible, por lo que su evaluacion practica debe hacerse mediante pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | transformers |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

chaski es un artefacto derivado de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5 con 873 millones de parametros. El tag `qwen3_5` en el repositorio confirma la arquitectura de origen, pero la model card no documenta modificaciones estructurales, cambios de tokenizador ni extensiones de contexto respecto al modelo base. Tampoco se especifica si el ajuste fue por instrucciones (SFT), por preferencias (DPO/RLHF) o por destilacion.

Respecto a los datos de entrenamiento, la card es deliberadamente parca: indica que las afirmaciones sobre entrenamiento y evaluacion viven en ficheros de recibo del "estate mesh" y que cualquier dato no respaldado por esos recibos se marca como UNKNOWN. No se publica numero de tokens, composicion del dataset, mezcla de idiomas ni estrategia de alineacion. La unica innovacion destacable es de gobernanza, no tecnica: generacion determinista de graficos SVG a partir de una instantanea de auditoria con marca temporal (2026-11-20T03:48:04Z) y etiquetado explicito de cada cifra como MEASURED, REPORTED o UNKNOWN.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el ajuste las preserve (no documentado en la card).
- Generacion de codigo y matematicas: plausible por herencia del base, pero sin verificacion publicada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible.
- Trazabilidad documental: cada afirmacion del repositorio se vincula a recibos auditables con fecha de captura.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles a gran escala: con 873 millones de parametros el modelo cabe en una sola GPU de consumo, lo que permite procesar lotes grandes por un coste marginal bajo en tareas de categorizacion, extraccion de entidades o moderacion preliminar.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno con licencia Apache 2.0, se puede desplegar en un portatil con GPU para validar flujos de dialogo antes de escalar a modelos mayores.
- Generacion de borradores tecnicos y documentacion: util como primer paso en pipelines de redaccion asistida donde un humano revisa la salida; el tamano reducido permite ejecutarlo en local sin enviar datos a terceros.
- Entorno de pruebas para investigacion de alineacion: su licencia permisiva y su tamano permiten hacer fine-tuning completo o LoRA en una sola GPU, sirviendo como banco de experimentos reproducible.
- Filtrado y preprocesado en pipelines de datos: tareas de resumen corto, reescritura o normalizacion de texto en ingles que no requieren razonamiento profundo y se benefician de la baja latencia de un modelo sub-1B.
- Educacion y demostraciones de gobernanza de IA: el formato de recibos auditables con marcas temporales y etiquetas MEASURED/UNKNOWN lo convierte en un ejemplo didactico de documentacion verificable de modelos.
- Inferencia en el borde (edge): con 1,8 GB en safetensors y cuantizacion a 8 o 4 bits, es viable en dispositivos con 2-4 GB de memoria, aunque el repositorio no publica variantes GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y no se incluye tal medicion en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica 3-4 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; 2-3 GB totales con contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,5-0,6 GB para pesos; 1,5-2 GB totales.
- GPU recomendadas para produccion: A100 40 GB, H100 80 GB o L40S para despliegues con muchas peticiones concurrentes; el modelo es pequeno y el cuello de botella sera el throughput, no la memoria.
- GPU de consumo: cabe holgadamente en RTX 4090, RTX 4080, RTX 3090, RTX 4070 y en tarjetas con 8 GB o mas; tambien en iGPU con memoria unificada si se usa cuantizacion.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para serving, llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| chaski (SZLHOLDINGS) | 873 M | no disponible | Apache 2.0 | en | Derivado de Qwen3.5-0.8B, documentacion con recibos auditables |
| Qwen3.5-0.8B (Qwen) | ~0,8 B | no disponible en esta ficha | Apache 2.0 | multilingue (segun modelo base) | Modelo base del que deriva chaski; referencia directa |
| Llama 3.2 1B (Meta) | 1,2 B | 128 K | Llama 3.2 Community License | multilingue | Alternativa de tamano comparable con contexto largo declarado |
| Gemma 2 2B (Google) | 2,6 B | 8 K | Gemma Terms of Use | multilingue | Mayor tamano y contexto mas corto; licencia menos permisiva |

La comparacion con Qwen3.5-0.8B es la mas relevante: chaski no documenta mejoras medibles sobre su base, por lo que en ausencia de benchmarks la eleccion entre ambos deberia basarse en la trazabilidad documental que ofrece chaski frente a la documentacion mas completa del modelo original.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de que el ajuste mejore al modelo base en ninguna tarea; podria degradarlo.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin medirla empiricamente.
- Riesgo de alucinacion: inherente a modelos de este tamano; sin datos de alineacion ni evaluaciones de veracidad, debe asumirse un riesgo alto en dominios factuales.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario es responsable de verificar que los terminos del modelo base Qwen3.5-0.8B se respetan en la redistribucion.
- Procedencia: el autor es un consorcio con poca trazabilidad publica en el ecosistema (0 likes, 655 descargas en el momento de la consulta); conviene auditar los ficheros de recibo antes de un despliegue en produccion.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones oficiales, lo que anade trabajo si se quiere ejecutar en llama.cpp u Ollama.
- Nomenclatura de la card: buena parte del contenido es generado automaticamente por herramientas del propio consorcio, lo que limita la informacion tecnica sustantiva disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de la organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de model cards: https://github.com/szl-holdings/estate-cards
