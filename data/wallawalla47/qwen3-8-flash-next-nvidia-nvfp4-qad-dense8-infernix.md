# wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix

## Resumen

Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix es un artefacto de inferencia derivado de la conversión cuantizada de NVIDIA `nvidia/Qwen3.8-Flash-Next-NVFP4-QAD`, que a su vez es una destilación con conciencia de cuantización (QAD) del modelo Qwen3.8-Flash-Next. El paquete lo publica el usuario `wallawalla47` (Wallawalla47) como trabajo personal para su motor de inferencia propio, Infernix, escrito en C++/CUDA, con el objetivo explícito de ejecutar un modelo MoE multimodal de gran tamaño en una única GPU de consumo RTX 5090 con 32 GB de VRAM.

Se trata, por tanto, de un formato propietario (`.infernix`) y no de pesos en safetensors ni GGUF: no es cargable por vLLM, llama.cpp, TGI ni Transformers. El modelo subyacente es un transformer MoE de 48 capas con 512 expertos enrutados por capa (top-10), un experto compartido por capa en NVFP4, un borrador MTP (multi-token prediction) para decodificación especulativa y una torre de visión. La conversión mantiene bit-exactos los expertos NVFP4 de NVIDIA, las proyecciones MXFP8 y la tabla n-gram PLE en FP8, y comprime a 8 bits las clases que el checkpoint original conserva en BF16.

Su relevancia es acotada pero interesante: demuestra una técnica de offload híbrido (caché de expertos calientes en VRAM, resto en RAM host fijada, cómputo parcial en CPU) combinada con decodificación especulativa y una tabla PLE n-gram de 52 GB leída desde NVMe. El propio autor advierte que es trabajo de aficionado generado en gran parte con IA y que puede no ser completo ni exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (48 capas, 512 expertos enrutados por capa, top-10, experto compartido NVFP4 por capa, torre de vision, borrador MTP) |
| Parametros totales | no disponible (24.576 expertos enrutados; 63,3 GiB solo en expertos) |
| Parametros activos | no disponible (top-10 de 512 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y compartidos), MXFP8 (proyecciones GDN, atención e indexer), FP8 (tabla n-gram PLE), 8 bits (clases BF16 del checkpoint: mezcladores hyper-connection, proyecciones PLE, mezclador final y `lm_head`) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (con aviso de atribución y Qwen Community License 1.0 en el repositorio) |
| Formato de pesos | `.infernix` propietario, dividido en 3 partes (32 GB + 32 GB + 12,54 GB) |

## Arquitectura y entrenamiento

El modelo base es una destilación con conciencia de cuantización de Qwen3.8-Flash-Next realizada por NVIDIA mediante 100 actualizaciones de optimizador desde un profesor BF16 congelado. Respecto a la conversión NVFP4 previa de NVIDIA, la variante QAD cuantiza también los expertos compartidos (BF16 a NVFP4, entrenados por QAD) y las proyecciones GDN, atención e indexer (BF16 a MXFP8, con el indexer congelado), manteniendo congelados la tabla n-gram PLE, el borrador MTP, la visión, los routers y el `lm_head`. NVIDIA validó el checkpoint en GB300 con vLLM y MTP desactivado, y no reporta una ganancia de precisión en tareas estadísticamente establecida frente a la misma receta sin QAD.

La conversión de `wallawalla47` no reentrena nada: reorganiza los pesos para Infernix. Los 24.576 expertos enrutados (63,3 GiB) se reparten entre una caché en VRAM (expertos calientes) y RAM host fijada (el resto), con la CPU calculando parte de los fallos de caché de cada capa. El experto compartido NVFP4 se ejecuta como un registro de experto adicional por capa, residente en VRAM, al final de la llamada a los expertos enrutados, reutilizando la aritmética de 4 bits y las escalas de activación de estos. La tabla PLE n-gram de 52 GB se lee desde un volumen en NVMe. La decodificación especulativa usa MTP o el borrador DFlash2 de Inco AI empaquetado para Infernix, con verificación completa por el modelo principal, de modo que el drafting solo afecta a la velocidad.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y decodificación con cadena de pensamiento vía borrador MTP/DFlash2 (el modelo completo verifica cada borrador).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con torre de visión incluida en el paquete.
- Mezcla de expertos con enrutamiento top-10 sobre 512 expertos por capa.
- Predicción multi-token (MTP) para decodificación especulativa.
- Tabla PLE n-gram para recuperación de secuencias frecuentes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en offload de MoE en GPU de consumo: sirve para estudiar el equilibrio entre caché de expertos en VRAM, RAM host fijada y cómputo parcial en CPU en una RTX 5090, con 24.576 expertos enrutados gestionados dinámicamente.
- Evaluación de decodificación especulativa: permite medir el impacto real de un borrador MTP o DFlash2 sobre un modelo verificado íntegramente, con cifras observadas de 249,4 a 269,4 tok/s en las pruebas del autor.
- Experimentación con tablas n-gram PLE: útil para analizar cómo una tabla de 52 GB leída desde NVMe afecta a la latencia y a la tasa de acierto en generación de texto repetitivo o de dominio fijo.
- Prototipado de asistentes multimodales en local: al incluir torre de visión y pipeline image-text-to-text, permite probar conversaciones sobre imágenes sin depender de API en la nube, siempre dentro de una única máquina con RTX 5090.
- Estudio de pipelines de cuantización QAD: comparar este artefacto con la alternativa bit-exacta (`...-QAD-Infernix`) permite aislar el efecto de comprimir a 8 bits los mezcladores y el `lm_head`, con perplejidad 3,4385 frente a 3,4422.
- Desarrollo y pruebas del motor Infernix: como artefacto de referencia para validar la carga de pesos NVFP4 compartidos, la gestión del volumen n-gram y el reparto VRAM/RAM en compilaciones desde `main` (commit `eac2b3d8` o posterior).
- Docencia y divulgación técnica: ejemplo práctico de las diferencias entre NVFP4, MXFP8 y FP8 en un mismo checkpoint, y de por qué un formato propietario limita la portabilidad.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son de velocidad y perplejidad, no de tareas estandarizadas:

| Metrica | Este artefacto (Dense8) | Alternativa bit-exacta (`...-QAD-Infernix`) |
|---|---|---|
| Perplejidad | 3,4385 | 3,4422 |
| Velocidad de decodificación (tok/s), ejecución 1 | 254,0 | 249,4 |
| Velocidad de decodificación (tok/s), ejecución 2 | 269,4 | 250,8 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible. NVIDIA indica que no hay ganancia de precisión estadísticamente establecida de QAD frente a la receta sin QAD.

## Requisitos de hardware

- VRAM: 32 GB en una única RTX 5090; los expertos enrutados no residentes viven en RAM host fijada, por lo que se necesita RAM del sistema abundante (no cuantificada en la información disponible).
- Almacenamiento: los 76,5 GB del repositorio más un volumen n-gram PLE de 52 GB en FP8, que debe residir en una unidad NVMe.
- GPU recomendadas: RTX 5090 (arquitectura Blackwell, requisito implícito por el uso de NVFP4 y las instrucciones CUDA del motor). Otras GPU Blackwell podrían funcionar, pero no se documentan.
- GPU de consumo: sí, en RTX 5090. No hay datos para GPUs con menos de 32 GB.
- Despliegue: exclusivamente Infernix compilado desde GitHub `main` en el commit `eac2b3d8` o posterior. No hay release para Windows que lo ejecute y las compilaciones antiguas se niegan a cargarlo. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 254,0 y 269,4 tok/s en dos ejecuciones del autor en RTX 5090; la alternativa bit-exacta rindió entre un 1,8 % y un 7,4 % más lento.
- Reparto de ficheros: mantener las tres partes `.infernix` en un mismo directorio y pasar la parte 1 al motor, igual que con un GGUF dividido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix (este) | no disponible (MoE 48 capas, 512 expertos, top-10) | no disponible | NVFP4 + MXFP8 + FP8, formato `.infernix` | NVIDIA Open Model License | Solo motor Infernix, 76,5 GB + volumen n-gram de 52 GB |
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Infernix | mismo modelo base | no disponible | mismo esquema, pesos bit-exactos | NVIDIA Open Model License | Solo motor Infernix; 1,8 %–7,4 % más lento |
| nvidia/Qwen3.8-Flash-Next-NVFP4-QAD | mismo modelo base | no disponible | NVFP4 + MXFP8, safetensors para vLLM | NVIDIA Open Model License | vLLM en GB300; no cabe en 32 GB |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | mismo modelo base | no disponible | NVFP4 con expertos compartidos en BF16 | NVIDIA Open Model License | vLLM; cuantiza menos componentes que QAD |

## Limitaciones y advertencias

- Formato propietario `.infernix`: no es portable a otros motores y requiere compilar Infernix desde `main`; no existe binario para Windows.
- Dependencia de un volumen n-gram externo de 52 GB no incluido en el repositorio; sin él el modelo no funciona según las instrucciones del autor.
- El autor declara que el artefacto, la receta de conversión y buena parte de la model card se generaron con IA (principalmente Claude Opus 5.5) y que es trabajo de aficionado, posiblemente incompleto o inexacto.
- Ninguna validación de precisión en tareas publicada para este artefacto; los únicos datos son perplejidad y velocidad.
- Posible riesgo de alucinación inherente al modelo base; no cuantificado en la información disponible.
- Idiomas soportados no documentados, lo que impide garantizar calidad en castellano u otras lenguas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia NVIDIA Open Model License con obligaciones de atribución (incluye `NOTICE`) y convivencia con Qwen Community License 1.0; revisar condiciones antes de uso comercial.
- El uso de MTP no fue evaluado por NVIDIA sobre estos pesos; en Infernix solo afecta a velocidad, no a la distribución de salida, porque el modelo completo verifica cada borrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Requiere NVMe dedicado para la tabla n-gram y RAM host suficiente para los expertos no residentes; el rendimiento depende fuertemente de la caché y del ancho de banda de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Dense8-Infernix
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4-QAD
- Conversión NVFP4 previa de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Alternativa bit-exacta: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-QAD-Infernix
- Volumen n-gram PLE (52 GB FP8): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix.ngram
- Borrador DFlash2 para Infernix: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-DFlash2-Infernix
- Borrador DFlash2 original de Inco AI: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Motor Infernix (GitHub): https://github.com/Wallawalla47/Infernix
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
