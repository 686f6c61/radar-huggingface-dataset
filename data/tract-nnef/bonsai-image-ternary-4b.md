# tract-nnef/bonsai-image-ternary-4B

## Resumen

Bonsai Image Ternary 4B es un modelo de generación de imágenes texto-a-imagen desarrollado por Prism ML, derivado de FLUX.2 Klein 4B y distribuido con pesos ternarios en el transformer de difusión. Esta ficha concreta, publicada por el usuario `tract-nnef`, no contiene el modelo original en formato PyTorch, sino una exportación experimental de sus componentes a NNEF (Neural Network Exchange Format) para su ejecución con el motor de inferencia tract de Sonos. Se trata, por tanto, de un artefacto de despliegue orientado a inferencia en CPU y potencialmente WebGPU, no de un checkpoint listo para usar con Diffusers.

El repositorio incluye tres archivos independientes: el transformer de difusión (3,88B parámetros, con 100 tensores cuantizados en Q2_0_T y el resto en f32), el codificador de texto (3,11B parámetros, con 189 tensores Q4_0 y la tabla de embeddings en f32) y el decodificador VAE (49,6M parámetros en f32). Los tres comparten la misma arquitectura base que el modelo original: un transformer de difusión estilo FLUX con dimensiones latentes de 128 canales y un codificador de texto tipo T5 que concatena los estados ocultos de las capas 9, 18 y 27 para producir embeddings de 7680 dimensiones.

La relevancia de esta publicación es fundamentalmente técnica: demuestra la viabilidad de exportar un modelo de difusión de 4B con pesos ternarios a un formato de grafo portable con formas dinámicas, lo que permite inferencia en resoluciones variables sin recompilar el grafo. No obstante, el propio autor advierte que es una exportación experimental sin validación de calidad de imagen ni de WebGPU, y que el codificador de texto falla la tolerancia por defecto en 3 de 491.520 valores de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (estilo FLUX.2 Klein) + codificador de texto + VAE decoder, exportados a NNEF |
| Parametros totales | 3,88B (transformer) + 3,11B (text encoder) + 49,6M (VAE decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens de texto (fijo) |
| Tipos de cuantizacion | Q2_0_T (ternario, 100 tensores del transformer), Q4_0 (189 tensores del text encoder), f32 (resto) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NNEF (archivos `.nnef.tar` con grafo y pesos empaquetados) |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 Klein 4B, un transformer de difusión con atención conjunta sobre tokens de imagen y texto, que opera en un espacio latente de 128 canales. La variante ternaria sustituye la mayoría de los pesos del transformer por valores ternarios empaquetados (Q2_0_T), manteniendo en f32 un pequeño conjunto de capas sensibles a la precisión. El codificador de texto es un transformer de 27 capas (se omiten la norma final y la cabeza de lenguaje en la exportación) que produce embeddings de 7680 dimensiones concatenando los estados de las capas 9, 18 y 27. El VAE es únicamente el decodificador, con 49,6M parámetros en f32, e incluye la desnormalización por batch-norm latente y la desparcheificación 2×2.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card de esta exportación no documenta el proceso de entrenamiento del modelo original, solo el proceso de exportación. La innovación técnica destacable es la exportación directa de PyTorch a NNEF con soporte nativo de Q2_0_T (implementado en torch-to-nnef, PR #416) y formas simbólicas para las dimensiones de imagen, lo que permite un único archivo para todas las resoluciones. La inferencia es de forma dinámica con pesos cuantizados en tiempo de exportación, no cuantización de activaciones en tiempo de ejecución.

## Capacidades

- Generación de imágenes texto-a-imagen mediante difusión con flow matching, en resoluciones arbitrarias expresadas como múltiplos de 16 píxeles (16×H, 16×W).
- Acepta prompts de hasta 64 tokens de texto.
- Inferencia con formas dinámicas: un solo grafo sirve para cualquier resolución, sin necesidad de archivos de pesos separados por resolución.
- Ejecución en CPU mediante tract (validado en Linux x86-64) y potencialmente en WebGPU (no validado).
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imágenes.
- No soporta visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en navegador: la exportación a NNEF con tract permite ejecutar el modelo en WebGPU o WASM dentro del navegador, aunque el autor advierte que no se ha validado WebGPU. El caso de uso sería una demo interactiva de generación de imágenes sin servidor.
- Inferencia en CPU sin GPU: los archivos NNEF están pensados para tract, que ejecuta en CPU x86-64. Un servicio de generación de imágenes de baja concurrencia podría usar esta exportación en servidores sin GPU dedicada.
- Investigación en cuantización ternaria: el repositorio sirve como referencia reproducible para estudiar el impacto del empaquetado Q2_0_T en un transformer de difusión de 4B, comparando con la variante binaria de 1 bit del mismo modelo base.
- Integración en pipelines embebidos: el tamaño del transformer (1,80 GiB) y del VAE (190 MiB) permite empaquetar los componentes en dispositivos con almacenamiento limitado, siempre que se disponga de un runtime tract compatible.
- Validación de exportadores: el script `export/export_nnef.py` y los tests de `export/test_export_nnef.py` permiten a desarrolladores de tract o torch-to-nnef reproducir la exportación y verificar la paridad numérica de nuevas versiones del compilador.
- Prototipado de schedulers de flow matching: dado que el scheduler no está incluido, el usuario debe aportar el suyo (por ejemplo, el de Diffusers para FLUX.2 Klein), lo que convierte el artefacto en un banco de pruebas para experimentar con distintos schedulers sobre el mismo grafo exportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. La única validación numérica documentada es la paridad de exportación con tract:

| Etapa | check_io | Resolución alternativa | Error relativo L2 | RMSE | Error absoluto máximo | Similitud coseno |
|---|---|---|---|---|---|---|
| Transformer | Pass | Pass | no disponible | no disponible | no disponible | no disponible |
| Text encoder | Fail: 3 / 491.520 outliers | Longitud de texto fija | 4,5097e-6 | 1,1620e-4 | 0,0478515625 | 0,9999999999993426 |
| VAE decoder | Pass | Pass | no disponible | no disponible | no disponible | no disponible |

Las comprobaciones se realizaron en CPU Linux x86-64 con tolerancia `approximate`, 64 tokens de texto y formas de imagen 32×48 y 64×144. Estas formas pequeñas verifican la exportación y el manejo de formas simbólicas, pero no constituyen una evaluación de calidad de imagen en resoluciones de producción.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los tamaños de descarga son 1,80 GiB (transformer), 2,88 GiB (text encoder) y 190 MiB (VAE), lo que da un total de aproximadamente 4,87 GiB en disco. La VRAM necesaria para inferencia dependerá del runtime y de las activaciones, no documentadas.
- GPU recomendadas: no disponibles. La validación se realizó únicamente en CPU Linux x86-64.
- ¿Cabe en GPU consumer? No hay datos que lo confirmen. Por tamaño de pesos, un transformer de 1,80 GiB y un text encoder de 2,88 GiB podrían caber en GPUs con 8 GB o más, pero no se ha validado.
- Opciones de despliegue: tract >= 0.23.11 con las features `transformers,pulse,extra` (compilado desde fuente con `cargo build --release -p tract-cli --no-default-features --features transformers,pulse,extra`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni usa GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Bonsai Image Ternary 4B (esta exportación) | 3,88B transformer + 3,11B text encoder + 49,6M VAE | 64 tokens | Q2_0_T + Q4_0 + f32 | Apache 2.0 | NNEF | Hugging Face (tract-nnef) |
| Bonsai Image Ternary 4B (original, Prism ML) | mismos componentes | 64 tokens | ternario (pesos del transformer) | Apache 2.0 | PyTorch (presumiblemente safetensors) | Hugging Face (prism-ml) |
| Bonsai Image 1-bit Binary 4B | mismos componentes | 64 tokens | binario 1 bit | Apache 2.0 | no disponible | Hugging Face (prism-ml) |
| FLUX.2 Klein 4B | 4B (transformer) | no disponible | f32/BF16 | no disponible | PyTorch | Hugging Face |

La comparación más directa es con la variante binaria de 1 bit del mismo modelo, que según la documentación de Prism ML ofrece un tamaño menor a costa de peor calidad visual y fidelidad al prompt. La exportación NNEF aquí descrita no modifica la cuantización del modelo original, solo el formato del grafo y el empaquetado de pesos.

## Limitaciones y advertencias

- Exportación experimental: el autor indica explícitamente que no se ha realizado validación de calidad de imagen ni de WebGPU para estos artefactos.
- El codificador de texto falla la tolerancia por defecto de `check_io` en 3 de 491.520 valores de salida (error absoluto máximo 0,0478515625). El comando de exportación del text encoder se espera que termine con código distinto de cero.
- No es un pipeline Diffusers listo para usar: faltan el tokenizador, la plantilla de prompt y el scheduler de flow matching, que deben tomarse del modelo original.
- Requiere tract >= 0.23.11 con extensiones de transformers; las versiones anteriores, incluida la build de validación `0.23.10-pre`, son rechazadas antes de cargar los pesos. En el momento de la exportación, la última release publicada de tract era v0.23.10, por lo que puede ser necesario compilar desde fuente.
- La demo de navegador existente en tract PR #3306 no funciona directamente con estos archivos: requiere cambios en el loader y en el call-site para cargar los archivos únicos y proporcionar las dos entradas de position IDs del transformer.
- Longitud de texto fija de 64 tokens: los prompts más largos deben truncarse.
- Batch size fijo de 1.
- No se documentan sesgos conocidos del modelo base en esta información; al ser un modelo de difusión entrenado con datos no especificados, es probable que herede sesgos de representación, pero no hay datos disponibles para confirmarlo.
- Riesgo de alucinación visual: no cuantificado en esta información.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener restricciones adicionales no documentadas aquí.

## Enlaces

- Repositorio Hugging Face de esta exportación: https://huggingface.co/tract-nnef/bonsai-image-ternary-4B
- Modelo base (unpacked): https://huggingface.co/prism-ml/bonsai-image-ternary-4B-unpacked
- Documentación de Bonsai Image 4B: https://docs.prismml.com/models/bonsai-image
- Ficha de Ternary Bonsai Image 4B en There's An AI For That: https://theresanaiforthat.com/model/ternary-bonsai-image-4b/
- PR de tract con la demo de navegador: https://github.com/sonos/tract/pull/3306
- Commit de torch-to-nnef con soporte Q2_0_T: https://github.com/sonos/torch-to-nnef/commit/a29ff39c6de4c535fac5d4630664aa5f4e5dc3a4
