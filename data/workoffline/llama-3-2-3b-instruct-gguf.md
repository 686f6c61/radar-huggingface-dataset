# WorkOffline/Llama-3.2-3B-Instruct-GGUF

## Resumen

WorkOffline/Llama-3.2-3B-Instruct-GGUF es un espejo sin modificaciones de los ficheros GGUF de Llama 3.2 3B Instruct, mantenido por el proyecto WorkOffline para que su aplicación pueda descargar los pesos desde un único punto, fijado a una revisión concreta y verificado mediante SHA-256. No se trata de un modelo nuevo ni de un fine-tune: los bytes son idénticos a los del repositorio original de bartowski, y todo el crédito del modelo corresponde a Meta y el de la conversión a GGUF a bartowski.

El modelo subyacente, Llama 3.2 3B Instruct, es un transformer decoder-only denso de aproximadamente 3.212 millones de parámetros, diseñado por Meta para tareas de conversación, razonamiento ligero y generación de código en entornos con recursos limitados. Su tamaño permite ejecución en CPU y en GPUs de consumo, lo que lo hace adecuado para aplicaciones de escritorio y despliegues locales.

La relevancia de este repositorio es operativa más que técnica: ofrece un artefacto reproducible (una única cuantización Q4_K_M, con hash publicado) para pipelines que necesitan descargas deterministas. Para evaluación técnica del modelo conviene consultar la model card original de Meta y el repositorio de bartowski.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Llama 3.2 declara 128k en la model card original de Meta; no verificado en este repo) |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido en este repositorio) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Llama 3.2 Community License Agreement (identificador `llama3.2`) |
| Formato de pesos | GGUF (`Llama-3.2-3B-Instruct-Q4_K_M.gguf`, 2.019.377.696 bytes) |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento propios: es un espejo de artefactos. El modelo subyacente es Llama 3.2 3B Instruct, un transformer decoder-only denso de Meta con 3.212.749.888 parámetros. La model card de este repositorio no incluye datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento; esa información corresponde a la model card oficial de `meta-llama/Llama-3.2-3B-Instruct`, no reproducida aquí.

La única intervención técnica documentada es la conversión a GGUF realizada por bartowski (revisión upstream `5ab33fa94d1d04e903623ae72c95d1696f09f9e8`), con una cuantización Q4_K_M. El repositorio incluye además los ficheros `LICENSE`, `NOTICE` y `USE_POLICY.md` copiados sin cambios del modelo original y del código fuente de WorkOffline. La etiqueta `imatrix` sugiere el uso de matrices de importancia en la cuantización, aunque el repositorio no aporta detalles del proceso.

## Capacidades

- Generación de texto conversacional en formato instruct (etiquetas de chat de Llama 3.2).
- Razonamiento de complejidad media y respuesta a instrucciones multi-turno.
- Generación de código y tareas básicas de matemáticas, limitadas por el tamaño de 3B parámetros.
- Ejecución local en CPU y GPU de consumo gracias al formato GGUF y a la cuantización Q4_K_M.
- Integración con runtimes compatibles con GGUF (llama.cpp, Ollama, LM Studio, entre otros).
- Descarga determinista y verificable: el repositorio publica el SHA-256 del fichero para comprobación de integridad.
- No se documentan en este repositorio capacidades de tool calling, agentes, visión, audio ni modo thinking; deben verificarse en la model card original de Meta.

## Casos de uso

- Aplicaciones de escritorio offline: WorkOffline usa este espejo para descargar los pesos desde un único punto con revisión fijada y verificación SHA-256, lo que garantiza que la app ejecuta exactamente el artefacto esperado.
- Asistentes conversacionales locales: el modelo puede gestionar diálogos multi-turno en máquinas sin GPU dedicada, al caber en unos 2 GB en disco y ejecutarse en CPU con llama.cpp.
- Prototipado rápido de chatbots: permite validar prompts, plantillas de chat y flujos de conversación antes de migrar a modelos mayores, con un coste de infraestructura mínimo.
- Generación de texto y resúmenes en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Educación e investigación: sirve como modelo de referencia pequeño para experimentos de cuantización, evaluación de latencia y comparación de runtimes GGUF.
- Automatización de tareas de texto en CI o scripts: al ser un artefacto reproducible con hash, puede integrarse en pipelines que necesitan una dependencia binaria fija y verificable.
- Generación de código asistida en editor local: útil para autocompletado y explicación de fragmentos en equipos de desarrollo con recursos limitados, aceptando la menor calidad frente a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo de artefactos y no incluye evaluaciones propias; para métricas del modelo base debe consultarse la model card oficial de `meta-llama/Llama-3.2-3B-Instruct`.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2.019.377.696 bytes (aproximadamente 1,88 GiB); con overhead de contexto y runtime, se recomienda un mínimo de 3-4 GB de memoria disponible.
- Cabe en GPU de consumo: tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) pueden ejecutar el modelo con contexto moderado.
- Ejecución en CPU: viable con llama.cpp u Ollama; el rendimiento depende del número de núcleos y del ancho de banda de memoria.
- GPU recomendadas para mayor throughput: RTX 4090, L40S, A100 o H100, aunque el modelo está sobredimensionado para estas tarjetas y no las aprovecha.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no son la vía natural para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WorkOffline/Llama-3.2-3B-Instruct-GGUF (este repo) | 3.212.749.888 | no disponible | Llama 3.2 Community License | GGUF Q4_K_M | Espejo de bartowski, un solo fichero, hash publicado |
| meta-llama/Llama-3.2-3B-Instruct | 3.212.749.888 | no disponible en esta ficha | Llama 3.2 Community License | safetensors | Modelo original de Meta, pesos completos |
| bartowski/Llama-3.2-3B-Instruct-GGUF | 3.212.749.888 | no disponible en esta ficha | Llama 3.2 Community License | GGUF (múltiples cuantizaciones) | Fuente upstream de este espejo; ofrece más variantes de cuantización |
| Otros modelos de ~3B (Qwen2.5-3B, Phi-3-mini) | ~3-4B | no disponible | varía según modelo | safetensors/GGUF | Alternativas de tamaño similar; no evaluadas en la información disponible |

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no aporta mejoras, fine-tuning ni correcciones respecto a `meta-llama/Llama-3.2-3B-Instruct`.
- Solo se incluye la cuantización Q4_K_M; no hay variantes Q5, Q6, Q8 ni ficheros sin cuantizar en este repositorio.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no debe usarse como fuente de verdad sin verificación.
- Sesgos: no documentados en este repositorio; deben consultarse en la model card original de Meta.
- Restricciones de licencia: el uso se rige por la Llama 3.2 Community License Agreement y la política de uso de Llama 3.2; es obligatorio incluir el aviso "Built with Llama" y cumplir los términos de la licencia para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-10; su mantenimiento y disponibilidad a largo plazo no están garantizados más allá de la política del proyecto WorkOffline.
- La información sobre idiomas soportados y longitud de contexto no está disponible en este repositorio; conviene no asumir valores sin verificar la model card original.
- La fecha de creación indicada (2026-11-10) es posterior a la fecha actual habitual de consulta; verificar la coherencia de metadatos antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WorkOffline/Llama-3.2-3B-Instruct-GGUF
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Conversión GGUF de bartowski: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Política de uso de Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Fichero LICENSE referenciado: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/0cb88a4f764b7a12671c53f0838cd831a0843b95/LICENSE.txt
