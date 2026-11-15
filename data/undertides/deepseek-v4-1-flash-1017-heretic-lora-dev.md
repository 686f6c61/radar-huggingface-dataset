# UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora-dev

## Resumen

DeepSeek-V4.1-Flash-1017-heretic-lora-dev es un adaptador LoRA de rango 1 publicado por el usuario UnderTides sobre el modelo cuantizado sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw, a su vez derivado del DeepSeek-V4.1-Flash-1017 original de DeepSeek. No es un modelo completo, sino un parche de pesos que modifica la proyección de salida de la atención (`wo_b`) en las capas 2 a 39 para atenuar la dirección de rechazo del modelo base mediante una técnica de ablación de dirección conocida como heretic o abliteration.

El adaptador se construye analíticamente a partir de 8.000 muestras de activación (4.000 del lado de rechazo y 4.000 de peticiones ordinarias, equilibradas entre inglés y chino) y organizadas en 17 grupos de dominio que cubren desde abuso y odio hasta ciberseguridad, finanzas, medicina o copyright. La receta es idéntica a la del adaptador original de 2.7bpw, pero con un conjunto de captura el doble de grande y una dirección recalculada, lo que amplía la cobertura de dominios y la estabilidad del efecto.

Es relevante porque demuestra un flujo de trabajo reproducible para modificar el comportamiento de rechazo de un modelo multimodal grande (pipeline image-text-to-text) sin reentrenamiento, con validación funcional sobre 62 peticiones HTTP, soporte de tool calling, streaming, conversaciones multi-turno y entradas de hasta ocho imágenes. Su naturaleza experimental y su dependencia de un runtime vLLM parcheado sobre dos DGX Spark lo sitúan en el terreno de la investigación aplicada más que en el de producción estable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer multimodal DeepSeek-V4.1-Flash-1017 cuantizado en EXL3 2.7bpw |
| Parametros totales | no disponible (el adaptador es de rango 1; el modelo base no reporta cifra en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las capturas usan hasta 512 tokens por prompt, pero no se especifica la ventana del modelo base) |
| Tipos de cuantizacion | EXL3 2.7 bits por peso en el modelo base; factores LoRA en FP32 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA); el base en EXL3 |
| Modulos objetivo | `wo_b` (proyección de salida de atención) |
| Capas afectadas | 2 a 39 (índice base cero) |
| Rango / alpha LoRA | 1 / 1 |
| Fuerza de proyección | 2.5 |
| Precisión de factores | FP32 |
| Normalización de filas | desactivada |
| Tamaño del repo | 0.0 GB (según Hugging Face) |
| Descargas / likes | 53 / 2 |

## Arquitectura y entrenamiento

El adaptador no entrena pesos de forma convencional: se calcula analíticamente. Primero se ejecuta el modelo base en TP2 con el modo thinking desactivado y peticiones seriales sin caché, guardando el residual del último token del prompt tras el posprocesado mHC y antes de la inyección Engram de la capa siguiente: 40 capas × cuatro flujos mHC × 5.120 valores BF16, en fragmentos verificados con checksum de 16 muestras. Después se descarga el modelo y se promedian los cuatro flujos mHC en FP32, acumulando la media de cada lado (rechazo y ordinario) en FP64 sobre CPU. La dirección `d` se obtiene normalizando la diferencia de medias, eliminando su componente a lo largo de la media ordinaria y normalizando de nuevo.

La exportación decodifica los pesos cuantizados efectivos de `wo_b` bloque a bloque y construye los factores de rango 1 para cada capa seleccionada: `A = d.T @ W` con forma [1, 8192] y `B = -2.5 * d` con forma [5120, 1], de modo que `delta_W = B @ A`. La fuerza de proyección 2.5 queda incorporada en los factores con `lora_alpha/r = 1`. El conjunto de datos combina OpenSafetyLab/Salad-Data (1.083 prompts de rechazo en inglés), PKU-Alignment/PKU-SafeRLHF (917), thu-coai/Safety-Prompts (2.000 en chino más 410 de intención ordinaria), bench-llm/or-bench (1.871), HuggingFaceH4/no_robots (129) y m-a-p/COIG-CQIA (1.590). El muestreo usa 17 grupos de dominio con emparejamiento por dominio, idioma y longitud, semilla 20261022, deduplicación léxica entre fuentes y coincidencia de forma de tarea en 6.684 de los 8.000 prompts. El fichero `data_provenance.json` registra revisiones de fuentes, recuentos, distribuciones y hashes de partición.

## Capacidades

- Generación de texto y razonamiento en chino e inglés, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Procesamiento multimodal image-text-to-text: acepta entradas de una sola imagen y de hasta ocho imágenes por petición, según la validación funcional.
- Tool calling y manejo de resultados de herramientas, verificado en los escenarios de prueba.
- Conversaciones multi-turno con aislamiento de caché de prefijo.
- Streaming de respuestas y soporte de Chat Completions y de la API Responses.
- Selección concurrente entre modelo base, adaptador original y adaptador dev, con peticiones LoRA simultáneas.
- Atenuación de la dirección de rechazo en 17 dominios (abuso, discriminación, contenido sexual, violencia, salud mental, crimen, armas/drogas/bioseguridad, ciberseguridad, privacidad, fraude, desinformación, medicina, copyright, ética, medio ambiente, laboral y tareas generales).

## Casos de uso

- Investigación en seguridad de modelos: permite estudiar cómo varía la tasa de rechazo al ablacionar una única dirección en `wo_b`, con conjuntos de ajuste y holdout separados (400 y 600 prompts) para medir el efecto de forma controlada.
- Evaluación de robustez de salvaguardas: útil para probar clasificadores de seguridad externos frente a un modelo con rechazo atenuado y comparar su comportamiento con el base sin modificar.
- Análisis de sesgo y alineación: los 17 grupos de dominio y el desglose por idioma permiten auditar diferencias de comportamiento entre inglés y chino en temas sensibles.
- Experimentación con LoRA en runtime vLLM: sirve como caso de referencia para validar parches de compatibilidad EXL3/multimodal y selección concurrente de adaptadores en despliegues TP2.
- Pruebas de pipelines multimodales: con soporte de una a ocho imágenes, se puede usar para verificar el enrutado de imágenes y el aislamiento de caché de prefijo en entornos de inferencia multiinquilino.
- Docencia y divulgación técnica: el método analítico documentado paso a paso (captura, media en FP64, proyección y exportación) es un ejemplo didáctico de intervención sobre pesos cuantizados sin reentrenamiento.
- Validación de tool calling en agentes: los escenarios de prueba cubren llamadas a herramientas y resultados, lo que permite ensayar flujos de agente multi-paso sobre un modelo con comportamiento de rechazo alterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta validación de implementación: 43 tests de implementación y 21 escenarios funcionales repartidos en 62 peticiones HTTP, sin métricas de calidad, seguridad ni latencia.

## Requisitos de hardware

- El adaptador en sí es minúsculo (rango 1, repo de 0.0 GB), pero requiere cargar el modelo base EXL3 2.7bpw completo.
- Runtime de referencia: motor vLLM sudoingX/dgx-spark-deepseek-v41 con el parche de compatibilidad EXL3/multimodal LoRA incluido, en TP2 sobre dos DGX Spark.
- El adaptador debe colocarse en la misma ruta absoluta en ambos nodos.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base cuantizado a 2.7 bits por peso y del reparto TP2.
- GPU recomendadas: DGX Spark (entorno validado); otras configuraciones no están documentadas.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible.
- Opciones de despliegue: vLLM con el parche incluido; llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Rango / fuerza | Idiomas | Licencia | Runtime |
|---|---|---|---|---|---|
| UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora-dev | LoRA rango 1 sobre EXL3 2.7bpw | 1 / 2.5 | zh, en | MIT | vLLM parcheado, TP2 DGX Spark |
| UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora | LoRA rango 1 sobre EXL3 2.7bpw (versión original) | 1 / 2.5 | zh, en | no disponible | vLLM parcheado |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | Receta heretic para V4.1 | no disponible | no disponible | no disponible | no disponible |
| sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw | Modelo base cuantizado EXL3 2.7bpw | no aplica | zh, en | no disponible | vLLM EXL3 |

La comparación se limita a variantes del mismo linaje, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental por el autor; no está pensado para producción estable.
- La atenuación de la dirección de rechazo puede degradar las salvaguardas del modelo base y aumentar la probabilidad de respuestas dañinas en los 17 dominios cubiertos.
- Riesgo de alucinación: no evaluado; no hay benchmarks de veracidad en la información disponible.
- Idiomas limitados a chino e inglés; el comportamiento en otras lenguas no está documentado.
- Longitud de contexto del modelo base no especificada; las capturas usan prompts de hasta 512 tokens.
- Dependencia de un runtime vLLM parcheado y de un despliegue TP2 sobre dos DGX Spark; el adaptador debe residir en la misma ruta absoluta en ambos nodos.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero las implicaciones legales y éticas del uso de un modelo con rechazo ablacionado deben evaluarse aparte.
- El modelo base está cuantizado a 2.7 bits por peso, lo que puede introducir pérdida de calidad respecto al modelo original en FP16/BF16.
- El recuento de descargas (53) y likes (2) indica una adopción muy limitada y poca validación externa.
- No se han publicado métricas de seguridad, calidad ni latencia; la validación se limita a tests de implementación y escenarios funcionales.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora-dev
- Modelo base cuantizado: https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Adaptador original: https://huggingface.co/UnderTides/DeepSeek-V4.1-Flash-1017-heretic-lora
- Receta de pqhaz: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Repositorio Heretic: https://github.com/p-e-w/heretic/tree/v1.4.0
- Runtime vLLM para DGX Spark: https://github.com/sudoingX/dgx-spark-deepseek-v41
- Dataset OpenSafetyLab/Salad-Data: https://huggingface.co/datasets/OpenSafetyLab/Salad-Data
- Dataset PKU-Alignment/PKU-SafeRLHF: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Dataset bench-llm/or-bench: https://huggingface.co/datasets/bench-llm/or-bench
- Dataset HuggingFaceH4/no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset m-a-p/COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
- Dataset thu-coai/Safety-Prompts: https://github.com/thu-coai/Safety-Prompts
