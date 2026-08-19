# stepfun-ai/Step-3.7-Flash-GGUF

## Resumen

Step-3.7-Flash-GGUF es el conjunto de cuantizaciones GGUF del modelo Step-3.7-Flash de StepFun-ai, un modelo de visión-lenguaje (VLM) de tipo MoE disperso con 198 mil millones de parámetros totales y aproximadamente 11 mil millones activos por token. Diseñado para cargas de trabajo de producción de alta frecuencia, alcanza un throughput de hasta 400 tokens por segundo, una ventana de contexto de 256K tokens y capacidades multimodales nativas (imagen y texto). Incluye un proyector de visión (mmproj) para inferencia multimodal y ofrece tres niveles de razonamiento seleccionables (bajo, medio, alto) para equilibrar velocidad, coste y profundidad.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo de gran tamaño en hardware con memoria unificada de 128 GB (como Mac Studio, DGX Spark o Ryzen AI Max+ 395) gracias a las cuantizaciones, manteniendo el contexto completo de 256K en los quants Q4 y menores. El modelo base está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de agentes, tool calling y razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse Mixture-of-Experts) con encoder de vision |
| Parametros totales | 196.956.130.432 (196B backbone de lenguaje + 1.8B vision encoder) |
| Parametros activos | ~11B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_XXS (todas con imatrix excepto Q8_0) |
| Idiomas soportados | en, zh, ja, ko, ar, hi, de, fr, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

Step-3.7-Flash combina un backbone de lenguaje de 196B parámetros con un encoder de visión de 1.8B parámetros, formando un modelo MoE disperso que activa aproximadamente 11B parámetros por token. Esta arquitectura permite un throughput de hasta 400 tokens por segundo, optimizado para inferencia en producción. El modelo soporta tres niveles de razonamiento configurables (low, medium, high) que ajustan la profundidad del proceso de razonamiento según la tarea. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO en la información disponible. La versión GGUF incluye un proyector de visión (mmproj) separado que debe emparejarse con cualquiera de los quants de lenguaje para habilitar la entrada de imágenes.

## Capacidades

- Generación de texto y razonamiento multi-paso con niveles de profundidad ajustables (low, medium, high).
- Comprensión de imágenes nativa (image-to-text) mediante el encoder de visión y el proyector mmproj.
- Soporte de tool calling y function calling, orientado a workloads agénticos.
- Capacidades de agente autónomo con razonamiento encadenado y ejecución de múltiples pasos.
- Generación de código y resolución de problemas matemáticos.
- Multilingüe nativo en 10 idiomas: inglés, chino, japonés, coreano, árabe, hindi, alemán, francés, español y ruso.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones extendidas.

## Casos de uso

- Atención al cliente multilingüe automatizada: el modelo gestiona conversaciones multi-turno con contexto largo gracias a sus 256K tokens de ventana, manteniendo el hilo de la interacción en varios idiomas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar y documentar código, con niveles de razonamiento ajustables para tareas simples o complejas.
- Análisis de documentos con imágenes: al combinar visión y texto, puede extraer información de capturas, diagramas o formularios escaneados, útil en entornos de gestión documental.
- Agentes autónomos de investigación: con razonamiento multi-paso y acceso a herramientas, puede planificar búsquedas, consultar APIs y sintetizar resultados en informes estructurados.
- Asistentes de soporte técnico especializado: su capacidad multilingüe y de tool calling permite resolver incidencias consultando bases de conocimiento y ejecutando scripts de diagnóstico.
- Traducción y localización de contenidos: con 10 idiomas nativos, puede traducir y adaptar textos manteniendo el contexto semántico, útil para equipos de producto internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (como MMLU, HumanEval o GSM8K) en la información disponible. La model card incluye únicamente mediciones de throughput en un Apple Mac Studio con M4 Max y 128 GB de memoria unificada, que se resumen a continuación para el quant Q4_K_S:

| Contexto (tokens) | Prefill (t/s) | Generacion (t/s) | Throughput total (t/s) |
|---:|---:|---:|---:|
| 2.176 | 420,28 | 48,51 | 289,68 |
| 8.320 | 403,70 | 46,43 | 360,97 |
| 16.512 | 382,32 | 43,77 | 360,69 |
| 32.896 | 344,32 | 39,72 | 334,34 |
| 65.664 | 280,21 | 32,74 | 276,14 |
| 131.200 | 206,25 | 22,23 | 204,60 |
| 262.272 | 110,96 | 9,71 | 110,40 |

Para el quant IQ4_XS se observan valores similares (p. ej., 423,56 t/s de prefill y 47,78 t/s de generación con 2.176 tokens de contexto). No se dispone de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- Tamaños de archivo de los quants: BF16 394 GB, Q8_0 209 GB, Q4_K_S 112 GB, IQ4_XS 105 GB, Q3_K_L 103 GB, Q3_K_M 94 GB, IQ3_XXS 76 GB, más 4 GB del mmproj.
- Con 128 GB de memoria unificada (Mac Studio, DGX Spark, Ryzen AI Max+ 395) se pueden ejecutar los quants Q4 y menores a contexto completo de 256K con alta precisión.
- Para GPUs discretas, se requieren múltiples unidades de alta VRAM (p. ej., varias A100 o H100) o GPUs con 80 GB o más de memoria, dado que el quant más pequeño (IQ3_XXS) ocupa 76 GB.
- No se recomienda para GPUs de consumo (RTX 4090, 3090) salvo que se use una cuantización aún más agresiva o se limite el contexto, lo que no está contemplado en los archivos oficiales.
- Opciones de despliegue: llama.cpp (fork de stepfun-ai con rama `step3.7`), `llama-server` para API compatible con OpenAI, y `llama-mtmd-cli` para inferencia multimodal.
- Latencia y throughput: en el hardware mencionado, la generación varía entre 9 y 51 t/s según el contexto, y el prefill entre 111 y 423 t/s.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Step-3.7-Flash se posiciona en la categoría de VLM MoE de gran escala junto a alternativas como Qwen2.5-VL o InternVL, pero no se han publicado resultados de benchmarks que permitan una comparación cuantitativa. Se recomienda consultar la documentación oficial del modelo base para obtener métricas adicionales.

## Limitaciones y advertencias

- Requiere hardware de altas prestaciones: incluso el quant más pequeño (IQ3_XXS, 76 GB) no cabe en GPUs de consumo convencionales; se necesita memoria unificada de 128 GB o múltiples GPUs de servidor.
- Las cuantizaciones más agresivas (Q3_K_M, IQ3_XXS) pueden introducir pérdidas de calidad notables, especialmente en tareas de razonamiento complejo o generación de código.
- No se han documentado sesgos específicos del modelo; como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación en tareas de generación libre, particularmente en contextos largos o con información poco estructurada.
- El soporte de visión requiere el archivo mmproj adicional; sin él, el modelo solo funciona en modo texto.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda verificar el cumplimiento de las políticas de StepFun-ai para despliegues en producción.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/stepfun-ai/Step-3.7-Flash-GGUF
- Modelo base en Hugging Face: https://huggingface.co/stepfun-ai/Step-3.7-Flash
- Repositorio de GitHub: https://github.com/stepfun-ai/Step-3.7-Flash
- Página del modelo (ModelPage): https://static.stepfun.com/blog/step-3.7-flash/
- Dell Enterprise Hub: https://dell.huggingface.co/models/stepfun-ai/Step-3.7-Flash-GGUF
