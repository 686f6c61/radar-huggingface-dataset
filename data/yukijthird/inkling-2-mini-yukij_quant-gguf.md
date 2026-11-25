# YukijThird/Inkling-2-Mini-yukij_quant-GGUF

## Resumen

Inkling-2-Mini-yukij_quant-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Inkling-2-Mini, desarrollado originalmente por Thinking Machines. El autor de esta conversión es YukijThird, que publica builds optimizados para llama.cpp estándar con el objetivo de que el modelo completo, junto con una ventana de contexto de 128 000 tokens, quepa en una única GPU de 12 GB o 16 GB de VRAM. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 28 788 294 144 parámetros totales, orientado a tareas de código y uso agéntico, y con capacidad multimodal de entrada imagen-texto.

La relevancia de esta ficha reside en que resuelve un problema práctico de despliegue: ejecutar un MoE de casi 29 000 millones de parámetros con contexto largo en hardware de consumo. Para ello, el autor aplica cuantizaciones mixtas con matrices de importancia (imatrix) y una técnica de padding de la anchura de los expertos de 1152 a 1280 con ceros, lo que permite usar formatos IQ de 2-3 bits en los tensores `down` de los expertos sin alterar la salida y sin degradar ningún tensor a 1 bit.

El resultado se distribuye bajo licencia Apache-2.0, igual que el modelo original, e incluye builds específicos para clases de 12 GB y 16 GB de VRAM, con métricas de divergencia KL y coincidencia de token superior medidas por el autor frente a cuantizaciones alternativas de Unsloth, AtomicChat y bartowski.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; pipeline image-text-to-text |
| Parametros totales | 28 788 294 144 |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens (128K), según la model card |
| Tipos de cuantizacion | GGUF con cuantizaciones mixtas: build de 12 GB (expertos en IQ de 2-3 bits, padding de anchura 1152 a 1280) y build de 16 GB (conserva tensores NVFP4 de expertos donde caben); KV cache q8_0/q4_0 en el ejemplo de ejecución |
| Idiomas soportados | no disponible (los conjuntos de calibración incluyen texto en ruso, código y transcripciones de agentes, pero no se declara una lista oficial de idiomas) |
| Licencia | Apache-2.0, con Model Acceptable Use Policy enlazada por el modelo original |
| Formato de pesos | GGUF (llama.cpp); mmproj separado en bf16 para entrada de imagen |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), según las etiquetas del repositorio y la descripción del autor. Los pesos originales publicados por Thinking Machines emplean expertos en NVFP4 y el resto de tensores en Q8_0, un detalle que el autor de la cuantización usa como referencia para medir la divergencia KL de sus builds. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable de esta conversión es doble. Por un lado, el build de 12 GB aplica padding de la anchura de los expertos de 1152 a 1280 con ceros: la salida no cambia, pero los tensores `down` de los expertos pueden usar formatos IQ de 2-3 bits en lugar de quedarse en 4,5 bits, evitando que ningún tensor tenga que bajar a 1 bit. Por otro, el autor publica en `recipe/` los ficheros de tipos de tensor y las matrices de importancia (imatrix) empleadas, lo que permite reproducir la cuantización. Las mediciones se realizaron con `llama-perplexity --kl-divergence` sobre 30 fragmentos de 1024 tokens de código, transcripciones de agentes y texto en ruso, con un error estándar de aproximadamente ±0,001 KLD y ±0,2 % en coincidencia de token superior.

## Capacidades

- Generación de texto conversacional y razonamiento, con pipeline declarado image-text-to-text.
- Entrada de imágenes mediante el proyector multimodal `mmproj-Inkling-2-Mini-bf16.gguf`, que consume unos 0,6 GB adicionales de VRAM.
- Orientación explícita a código y uso agéntico, según la model card del autor de la cuantización.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp, lo que habilita el formato conversacional del modelo base.
- Contexto largo de hasta 131 072 tokens, adecuado para conversaciones multi-turno y documentos extensos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.

## Casos de uso

- Asistencia de código en estación de trabajo local: con el build de 12 GB y una GPU de consumo, un desarrollador puede ejecutar el modelo con contexto de 128K para revisar repositorios completos, generar parches y explicar código sin enviar datos a servicios externos.
- Agentes autónomos de múltiples pasos: el contexto de 128K y la orientación agéntica permiten mantener el historial de herramientas, observaciones y planes en una sola ventana, reduciendo la necesidad de resúmenes intermedios.
- Procesamiento de documentación técnica con imágenes: al aceptar entrada image-text-to-text, el modelo puede analizar capturas de pantalla, diagramas de arquitectura o figuras de papers junto con el texto que las acompaña.
- Despliegue en portátiles con GPU de 12 GB: el build de 12 GB ocupa 12 057 de 12 216 MiB en una Intel Arc B580 con la configuración recomendada, lo que lo hace viable en equipos de gama alta de consumo.
- Servidor de inferencia ligero con llama.cpp: `llama-server` con `-ngl 99`, `-fa on` y KV cache cuantizada permite atender una petición concurrente (`-np 1`) en hardware modesto para prototipos y demos internas.
- Análisis de transcripciones y registros de agentes: el autor calibra las cuantizaciones con transcripciones de agentes y código, por lo que el modelo es adecuado para depurar trazas de agentes y resumir sesiones largas.
- Evaluación de cuantizaciones y reproducibilidad: los ficheros de `recipe/` y las métricas KLD publicadas permiten a investigadores comparar el impacto de distintas estrategias de cuantización sobre un MoE multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de cuantización medidas con `llama-perplexity --kl-divergence`:

| Clase VRAM | Fichero | Tamano | KLD ↓ | Mismo token superior ↑ |
|---|---|---|---|---|
| 12 GB | yukij_quant 12GB | 10,27 GB | 0,0372 | 94,46 % |
| 12 GB | unsloth UD-Q2_K_XL | 9,14 GB | 0,0440 | 94,28 % |
| 12 GB | AtomicChat AD-IQ2_XXS | 10,43 GB | 0,0472 | 94,04 % |
| 12 GB | bartowski IQ2_XXS | 10,32 GB | 0,0494 | 94,03 % |
| 16 GB | unsloth UD-Q3_K_XL | 13,63 GB | 0,0159 | 96,77 % |
| 16 GB | drofn 16GB-128K | 13,43 GB | 0,0178 | 96,47 % |
| 16 GB | AtomicChat AD-IQ3_S | 13,34 GB | 0,0179 | 96,41 % |
| 16 GB | yukij_quant 16GB | 13,85 GB | 0,0182 | 96,54 % |

Mediciones realizadas por el autor en una Intel Arc B580 con Vulkan, sobre 30 fragmentos de 1024 tokens de código, transcripciones de agentes y texto en ruso, comparando contra el modelo original (expertos en NVFP4, resto Q8_0). Error estándar aproximado de ±0,001 KLD y ±0,2 % en coincidencia de token superior.

## Requisitos de hardware

- VRAM estimada: build de 12 GB ocupa 12 057 de 12 216 MiB en una Intel Arc B580 con `-c 131072 -np 1 -fa on -ctk q8_0 -ctv q4_0 -b 2048 -ub 32 --cache-ram 0`; el ajuste del build de 16 GB está calculado a partir de esa medición, no medido directamente.
- Entrada de imagen: requiere `mmproj-Inkling-2-Mini-bf16.gguf`, que añade unos 0,6 GB de VRAM; el autor recomienda reducir `-c` para hacer sitio.
- GPU recomendadas: no se especifican modelos concretos; la medición de referencia usa una Intel Arc B580 (12 GB) con Vulkan. Por clase de VRAM, encajan tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070, Arc B580) y de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080).
- Cabe en GPU de consumo: sí, en las clases de 12 GB y 16 GB para las que se publican builds.
- Opciones de despliegue: llama.cpp estándar (`llama-server`, `llama-perplexity`); el repositorio está etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD (clase 12 GB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (yukij_quant 12GB) | 28,8 B (MoE) | 128K | 0,0372 | Apache-2.0 | GGUF en HF |
| Inkling-2-Mini (unsloth UD-Q2_K_XL) | 28,8 B (MoE) | 128K (según build) | 0,0440 | Apache-2.0 | GGUF en HF |
| Inkling-2-Mini (AtomicChat AD-IQ2_XXS) | 28,8 B (MoE) | 128K (según build) | 0,0472 | Apache-2.0 | GGUF en HF |
| Inkling-2-Mini (bartowski IQ2_XXS) | 28,8 B (MoE) | 128K (según build) | 0,0494 | Apache-2.0 | GGUF en HF |

La comparativa se limita a cuantizaciones del mismo modelo base, ya que la información disponible no incluye datos de modelos alternativos de otros desarrolladores. En la clase de 16 GB, el autor indica que unsloth UD-Q3_K_XL es el mejor fichero (KLD 0,0159) y que su build de 16 GB se publica como base del build sin censura.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgos.
- Riesgo de alucinación: no cuantificado; no se publican evaluaciones de veracidad.
- Idiomas: no se declara una lista oficial de idiomas soportados; la calibración incluye ruso, código y transcripciones de agentes, pero no garantiza cobertura multilingüe.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo original enlaza una Model Acceptable Use Policy que conviene revisar antes de desplegar en producción.
- El build de 12 GB modifica la anchura de los expertos (padding de 1152 a 1280 con ceros); aunque el autor afirma que la salida no cambia, es una alteración estructural respecto a los pesos originales.
- El ajuste del build de 16 GB está calculado, no medido, según reconoce el propio autor.
- La model card advierte de que el build de 16 GB de yukij_quant no es el mejor de su clase; unsloth UD-Q3_K_XL obtiene mejor KLD.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de las métricas.
- El autor publica además un build sin censura en un repositorio separado; sus características de seguridad no están documentadas en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YukijThird/Inkling-2-Mini-yukij_quant-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build sin censura: https://huggingface.co/YukijThird/Inkling-2-Mini-Uncensored-yukij_quant-GGUF
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
