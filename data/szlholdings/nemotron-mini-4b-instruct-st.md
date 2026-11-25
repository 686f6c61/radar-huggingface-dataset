# SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st

## Resumen

Nemotron-Mini-4B-Instruct-st es una redistribución del modelo Nemotron Mini 4B Instruct de NVIDIA, publicada por la organización SZLHOLDINGS dentro de su catálogo de artefactos de IA gobernada. El modelo base es un transformer decoder-only de 4.190.509.056 parámetros (aproximadamente 4,19 mil millones), orientado a generación de texto e instrucciones, distribuido en formato safetensors y compatible con la librería transformers. La variante "-st" indica un artefacto derivado o reempaquetado por SZLHOLDINGS, no un entrenamiento original desde cero.

El modelo hereda la licencia NVIDIA Open Model License, lo que condiciona su uso comercial a los términos del acuerdo de junio de 2024. La model card de SZLHOLDINGS es deliberadamente escueta en cuanto a especificaciones técnicas: no declara longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. La organización indica explícitamente que cualquier cifra no incluida en sus ficheros de recibo (receipts) debe considerarse desconocida (UNKNOWN), lo que refleja una política de trazabilidad estricta pero deja al evaluador sin datos de rendimiento verificables en la propia ficha.

Por su tamaño, el modelo es relevante para escenarios de despliegue en hardware modesto, incluyendo GPUs de consumo, y para pipelines donde se prioriza la inferencia local o el coste controlado frente a capacidades de razonamiento de frontera. No obstante, la ausencia de especificaciones publicadas limita seriamente la evaluación objetiva y obliga a remitirse a la documentación del modelo original de NVIDIA para obtener datos técnicos fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Nemotron Mini 4B Instruct de NVIDIA; detalles no disponibles en la ficha del autor) |
| Parametros totales | 4.190.509.056 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha del autor; el formato safetensors permite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License Agreement, junio 2024) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de la etiqueta "nemotron" y la pertenencia a la familia Nemotron Mini de NVIDIA. Por el nombre y el recuento de parámetros, se corresponde con un transformer decoder-only de aproximadamente 4B parámetros, pero no se especifican número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (completa o con variantes eficientes) ni vocabulario. Tampoco se indica si emplea técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

Respecto al entrenamiento, la model card de SZLHOLDINGS no aporta datos sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras fases de alineación. La organización declara que las afirmaciones de entrenamiento y evaluación residen en ficheros de recibo externos (estate mesh) y que cualquier dato no incluido allí debe considerarse desconocido. Para obtener información sobre el proceso de entrenamiento original es necesario consultar la documentación de NVIDIA sobre Nemotron Mini 4B Instruct, que no forma parte del material proporcionado.

## Capacidades

- Generación de texto e instrucciones: el modelo está etiquetado como text-generation y como "Instruct", lo que indica ajuste para seguir instrucciones en lenguaje natural.
- Razonamiento y conversación multi-turno: capacidad esperable en un modelo instruct de 4B, aunque sin datos publicados que la cuantifiquen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la ficha no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se declaran en la ficha.

## Casos de uso

- Asistentes conversacionales ligeros en local: el tamaño de 4,19B parámetros permite ejecutar el modelo en GPUs de consumo y en CPU con cuantización, lo que lo hace adecuado para chatbots de escritorio o prototipos sin dependencia de la nube.
- Clasificación y extracción de información en pipelines de datos: un modelo instruct de este tamaño puede emplearse para tareas de etiquetado, resumen extractivo o normalización de campos en lotes, siempre que se valide su calidad con datos propios dada la ausencia de benchmarks publicados.
- Generación de código asistida en entornos con recursos limitados: puede integrarse en editores o scripts de automatización para autocompletado y explicación de fragmentos, aunque sin datos de HumanEval no es posible estimar su fiabilidad.
- Despliegue en el borde (edge) y dispositivos con VRAM reducida: con cuantización a 4 bits, el modelo ocupa del orden de 2-3 GB, lo que permite inferencia en GPUs integradas o en sistemas embebidos con soporte para llama.cpp.
- Filtrado y moderación de contenido en tiempo real: su baja latencia potencial en hardware modesto lo hace candidato para preclasificar textos antes de enviarlos a modelos mayores, aunque requiere calibración propia.
- Investigación y experimentación con modelos pequeños: útil como base para fine-tuning supervisado o para estudios de alineación en entornos académicos con presupuesto computacional limitado.
- Redistribución y auditoría interna: al estar publicado con trazabilidad declarada por SZLHOLDINGS, puede servir en organizaciones que exigen artefactos con procedencia documentada, aunque la licencia NVIDIA condiciona el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de SZLHOLDINGS declara explícitamente que no se afirman cifras de benchmark más allá de las medidas en auditorías fechadas, y no incluye ninguna tabla de resultados (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 10-12 GB.
- VRAM estimada con cuantización a 8 bits: del orden de 4,2-5 GB para pesos, más overhead; viable en GPUs de 8 GB.
- VRAM estimada con cuantización a 4 bits: del orden de 2,1-3 GB para pesos; viable en GPUs de 4-6 GB y en algunas integradas con memoria compartida.
- GPU recomendadas: para FP16, A100, H100, L40S o RTX 4090; para cuantización, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Cabe en GPU de consumo: sí, especialmente con cuantización GGUF de 4 u 8 bits; en FP16 requiere al menos 12 GB de VRAM.
- Opciones de despliegue: transformers (formato original safetensors), llama.cpp y Ollama (previa conversión a GGUF), vLLM y TGI (sujeto a compatibilidad con la arquitectura concreta), así como servidores propios basados en PyTorch.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st | 4,19B | no disponible | NVIDIA Open Model License | Hugging Face (287 descargas) | Redistribucion de Nemotron Mini 4B Instruct; sin benchmarks publicados en la ficha |
| NVIDIA Nemotron Mini 4B Instruct (original) | ~4B | no disponible en esta ficha | NVIDIA Open Model License | Hugging Face (repositorio de NVIDIA) | Modelo base del que deriva este artefacto |
| Microsoft Phi-3 Mini 4K Instruct | 3,8B | 4.096 tokens | MIT | Hugging Face, Azure AI | Modelo instruct pequeno ampliamente adoptado, con benchmarks publicados |
| Meta Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, Meta AI | Contexto largo y ecosistema amplio; licencia con restricciones de uso |

La comparativa se limita a parámetros, contexto y licencia; no se dispone de datos de rendimiento del modelo evaluado para confrontar con las alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks y de especificaciones técnicas en la ficha del autor: no es posible verificar calidad, contexto efectivo ni idiomas sin consultar la documentación del modelo original de NVIDIA.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; no se han publicado evaluaciones de fidelidad factual para este artefacto.
- Sesgos conocidos: no documentados en la información proporcionada; se recomienda evaluar sesgos con datos propios antes de un despliegue en producción.
- Limitaciones de contexto e idioma: desconocidas; la ficha no declara ventana de contexto ni cobertura lingüística.
- Restricciones de licencia: la NVIDIA Open Model License impone condiciones al uso comercial y a la redistribución; es obligatorio revisar el acuerdo antes de integrar el modelo en productos.
- Procedencia del artefacto: al tratarse de una redistribución por SZLHOLDINGS y no del repositorio oficial de NVIDIA, conviene verificar la integridad de los pesos y comparar con el modelo base antes de usarlo en producción.
- Trazabilidad declarada pero no verificable en la ficha: las afirmaciones de entrenamiento y evaluación remiten a ficheros de recibo externos que no se incluyen en el material proporcionado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st
- Organización SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización SZLHOLDINGS en GitHub: https://github.com/szl-holdings
- Repositorio estate-cards (generador de fichas): https://github.com/szl-holdings/estate-cards
- Licencia NVIDIA Open Model License (junio 2024): https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
