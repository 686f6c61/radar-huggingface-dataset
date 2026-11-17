# zephel01/GLM-5.3-Flash-32G96G-GGUF

## Resumen

GLM-5.3-Flash-32G96G-GGUF es una cuantización GGUF del modelo base zai-org/GLM-5.3-Flash, publicada por el usuario zephel01 bajo licencia MIT. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 320.759.404.382 parámetros totales, empaquetado específicamente para ejecutarse en un PC con una GPU de 32 GB de VRAM (RTX 5090, AI PRO R9700) y 96 GB de RAM, o en un DGX Spark con 128 GB de memoria unificada. El objetivo declarado es ofrecer una cuantización de alta calidad (2,26 bits por peso de media) que quepa en hardware de consumo sin podar expertos.

La innovación principal de esta ficha no es el modelo base, sino el proceso de cuantización: se re-cuantizaron los expertos con LDLQ a partir de UD-Q4_K_XL de unsloth, usando un volcado de Hessian de transcripciones de chat en la plantilla de GLM (inglés, código y japonés) junto con la imatrix de unsloth. El resultado es un archivo mixto de 94,1 GB en 4 shards que mezcla tipos IQ2_XXS, IQ2_S, IQ3_XXS, Q2_K, Q3_K, Q4_K y Q5_K según la sensibilidad de cada tensor.

El modelo está pensado para inferencia local con offload de CPU y lectura desde SSD cuando el conjunto de expertos no cabe en VRAM. Según las mediciones del autor en el motor Abyss, alcanza 47,4 tok/s en una RTX 5090 con el tier de RAM limitado a 60 GB, con una latencia de espera de SSD de solo 0,3 ms por token. La ficha se marca como BETA y ha sido medida en un único PC hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer con capa NextN (MTP) |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto: IQ2_XXS (58%), IQ2_S (36%), IQ3_XXS (3%), Q2_K (2%), Q3_K (1%); 2,26 bits por peso de media |
| Idiomas soportados | en, ja (segun model card); el resto no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 94,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts, tal como indican las etiquetas del repositorio y la estructura de tensores descrita en la model card (expertos enrutados gate/up en capas 3-44, expertos down, proyecciones de atención, expertos densos y compartidos, y una capa NextN/MTP). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; esos datos no están disponibles en la información proporcionada.

La contribución técnica de esta cuantización es el uso de LDLQ (una variante de cuantización con información de segundo orden) para re-cuantizar los expertos a partir de UD-Q4_K_XL de unsloth, guiado por un volcado de Hessian construido con transcripciones de chat en la plantilla de GLM (inglés, código y japonés) y la imatrix de unsloth. Los tensores más sensibles (salida de atención, q_b de atención, down de expertos densos/compartidos) se mantienen en Q5_K, mientras que el router, embeddings, salida y el resto de la capa NextN conservan los bytes del UD-IQ2_XXS de unsloth. No se podó ningún experto. El motor de referencia es Abyss, que mantiene los expertos más usados en VRAM, el resto en RAM y lee desde SSD lo que no cabe.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento y código: la calibración de la cuantización incluye secuencias de código y texto en inglés.
- Capacidades multilingües limitadas a inglés y japonés según la model card; el resto de idiomas no está confirmado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`), lo que permite servirlo tras una API `/v1/chat/completions`.

## Casos de uso

- Inferencia local en PC de gama alta: un desarrollador con RTX 5090 (32 GB) y 96 GB de RAM puede ejecutar un MoE de 320B parámetros con offload de CPU y lectura desde SSD, gracias a que el archivo de 94,1 GB está dimensionado para ese perfil de hardware.
- Asistente conversacional en japonés e inglés: la cuantización fue calibrada con secuencias japonesas y el autor reporta un KL de 0,251 en japonés, ligeramente mejor que la referencia UD-IQ2_XXS (0,257), lo que la hace adecuada para chat bilingüe local.
- Despliegue en DGX Spark: el repositorio hermano DGX-Spark-GGUF contiene los mismos archivos y está pensado para los 128 GB de memoria unificada del dispositivo, útil para prototipado en un equipo compacto.
- Servicio compatible con OpenAI: al exponer un endpoint `/v1/chat/completions`, puede integrarse en herramientas que ya consumen la API de OpenAI sin cambiar el cliente, apuntando a `http://127.0.0.1:8082/`.
- Experimentación con cuantización de bajo bit: investigadores interesados en LDLQ, imatrix y cuantización mixta por tensor pueden usar este repositorio como referencia reproducible (con SHA256SUMS incluido).
- Evaluación de motores de inferencia con offload: útil para comparar Abyss frente a llama.cpp (el autor indica que la carga en llama.cpp aún no está verificada) en escenarios de VRAM limitada.

## Benchmarks y rendimiento

| Metrica | S1 (este repo) | UD-IQ2_XXS (referencia) | Q120d (32G128G) |
|---|---:|---:|---:|
| Descarga | 94,1 GB | 101,8 GB | 127,9 GB |
| KL (14 secuencias) | 0,2534 | 0,2643 | 0,1367 * |
| KL japonés (5 secuencias) | 0,251 | 0,257 | 0,145 * |
| Mismo token top | 77,3% | 76,6% | 84,9% * |
| Tokens/s (RTX 5090, tier 60 GB) | 47,4 | no disponible | 19,0 |
| Espera de SSD por token | 0,3 ms | no disponible | 23,5 ms |

\* Q120d usó la medición antigua de 10 secuencias, no directamente comparable con las cifras de 14 secuencias.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores son métricas de fidelidad de cuantización (KL divergence) y de velocidad medidas por el autor en el motor Abyss.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM para la GPU; el resto del modelo (94,1 GB totales) se reparte entre RAM y SSD.
- RAM recomendada: 96 GB para el perfil objetivo; con 60 GB de tier el autor mide 47,4 tok/s; con 64 GB parte del modelo se lee de SSD y baja el rendimiento; con 128 GB o más encaja la variante de mayor calidad 32G128G.
- GPU recomendadas: RTX 5090 (32 GB), AI PRO R9700 (32 GB); DGX Spark (128 GB de memoria unificada) para el repositorio hermano.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB, siempre que se acompañe de suficiente RAM del sistema.
- Opciones de despliegue: motor Abyss (recomendado por el autor, con `setup-deepseek.sh --model glm --quant 32G96G --download-model`); llama.cpp está soportado por formato pero la carga no ha sido verificada por el autor. vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: 47,4 tok/s en RTX 5090 con tier de 60 GB y 0,3 ms de espera de SSD por token (S1); 19,0 tok/s y 23,5 ms por token para la variante de 127,9 GB en el mismo tier.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-32G96G (este) | 320,8B totales | no disponible | MIT | GGUF mixto 94,1 GB | KL 0,2534 (14 seqs), 47,4 tok/s en RTX 5090 |
| GLM-5.3-Flash-IQ3_XXS-32G128G | 320,8B totales | no disponible | MIT | GGUF 127,9 GB | Mayor calidad (KL 0,1367 en 10 seqs), 19,0 tok/s |
| unsloth UD-IQ2_XXS | 320,8B totales | no disponible | MIT | GGUF 101,8 GB | Referencia de cuantización, KL 0,2643 |
| GLM-5.3-Flash (base) | 320,8B totales | no disponible | MIT | safetensors | Modelo original sin cuantizar |

No se dispone de comparación con modelos de otras familias (por ejemplo, otros MoE de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: medido en un único PC (RTX 5090 32 GB, tier de RAM de 60 GB); el autor advierte que el archivo puede ser reemplazado por una build mejor y que el nombre de la carpeta cambiará.
- La cuantización a 2,26 bits por peso implica pérdida de fidelidad respecto al original: KL de 0,2534 y solo 77,3% de coincidencia en el token top frente a UD-Q4_K_XL.
- El rendimiento depende críticamente de que el modelo quepa: con menos de 96 GB de RAM parte del modelo se lee desde SSD y el throughput cae drásticamente (de 47,4 a 19,0 tok/s en el caso medido de la variante mayor).
- Carga en llama.cpp no verificada por el autor; el motor de referencia es Abyss, lo que limita la portabilidad a otros stacks.
- Idiomas confirmados solo inglés y japonés; el comportamiento en castellano u otros idiomas no está documentado.
- No hay datos publicados sobre sesgos, alucinación, contexto máximo ni parámetros activos del MoE en la información disponible.
- Licencia MIT en la cuantización, pero conviene verificar la licencia y condiciones del modelo base zai-org/GLM-5.3-Flash para uso comercial en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-32G96G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante 32G128G (mayor calidad): https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Formulario para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+32G96G+S1+on+YOUR_GPU
