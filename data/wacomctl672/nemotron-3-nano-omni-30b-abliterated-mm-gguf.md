# wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF

## Resumen

El modelo Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF es una cuantizacion GGUF del modelo abliterado divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16, que a su vez deriva del modelo omnimodal de NVIDIA Nemotron-3-Nano-Omni-30B-A3B. El proceso de abliteracion elimina los vectores de rechazo y las mitigaciones de seguridad del modelo original, dando como resultado una version sin censura pensada para investigacion y desarrollo.

El modelo combina un backbone de lenguaje MoE hibrido NemotronH (Mamba-2 + Attention) con un encoder de vision RADIO v2.5-H y un encoder de audio Parakeet (FastConformer), lo que le permite procesar entradas intercaladas de texto, imagen, video y audio. Con 31,6 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, ofrece capacidades de razonamiento multimodal con eficiencia computacional.

La cuantizacion GGUF, realizada por wacomctl672, incluye variantes Q4_K_M (6,21 bits por peso) y Q8_0 (8,51 bits por peso), compatibles con llama.cpp y entornos de ejecucion similares. El modelo se distribuye bajo la licencia nvidia-open-model-agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida NemotronH (Mamba-2 + Attention) con encoders RADIO v2.5-H (vision) y Parakeet FastConformer (audio) |
| Parametros totales | 31.577.940.288 (~31,6B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (6,21 BPW), Q8_0 (8,51 BPW) |
| Idiomas soportados | no disponible (entrenado principalmente con datos en ingles) |
| Licencia | nvidia-open-model-agreement |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, Nemotron-3-Nano-Omni-30B-A3B de NVIDIA, emplea una arquitectura MoE hibrida denominada NemotronH que combina capas de atencion con capas Mamba-2 (state space model), lo que reduce el coste computacional frente a un transformer puro. El backbone de lenguaje se complementa con un encoder de vision RADIO v2.5-H y un encoder de audio Parakeet (FastConformer), permitiendo entradas intercaladas de texto, imagen, video y audio.

El entrenamiento del modelo original utilizo aproximadamente 127 mil millones de tokens distribuidos en modalidades mixtas (texto+imagen, texto+video, texto+audio y texto+video+audio), reflejando interacciones contextualizadas del mundo real. Ademas, se empleo RLHF (reinforcement learning from human feedback) y el dataset Nemotron-CC-v2.1, que aporta 2,5 billones de tokens nuevos en ingles procedentes de Common Crawl, con reescritura sintetica y traduccion desde otros idiomas.

La version abliterada elimina los vectores de rechazo y las mitigaciones de seguridad del modelo original, de modo que el modelo ya no se niega a generar contenido que el modelo base rechazaria. La cuantizacion GGUF posterior preserva la funcionalidad multimodal mediante un archivo mmproj separado (Q8_0) compatible con llama.cpp.

## Capacidades

- Razonamiento omnimodal: comprende y razona sobre entradas intercaladas de texto, imagen, video y audio.
- Generacion de texto: mantiene las capacidades de generacion y razonamiento del modelo base Nemotron-3.
- Comprension de imagenes: procesa imagenes estaticas mediante el encoder RADIO v2.5-H.
- Comprension de video: procesa secuencias de video con el mismo encoder de vision.
- Comprension de audio y habla: procesa senales de audio mediante el encoder Parakeet (FastConformer).
- Salida sin censura: al estar abliterado, no aplica rechazos por contenido ofensivo, nocivo o no filtrado.
- Eficiencia MoE: con solo ~3B parametros activos por token, ofrece latencia reducida frente a modelos densos de tamano equivalente.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo sin mitigaciones de seguridad, comparando respuestas con la version original para analizar el impacto de la abliteracion.
- Analisis multimodal de contenido: procesamiento de documentos que combinan texto, imagenes y audio, como transcripciones de reuniones con material visual adjunto.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos que requieran explorar temas que los modelos censurados evitarian.
- Desarrollo de agentes multimodales: integracion en pipelines de agentes que necesiten interpretar simultaneamente entradas de texto, imagen y audio, gracias a la eficiencia del MoE con 3B parametros activos.
- Pruebas de robustez y red teaming: evaluacion de vulnerabilidades y comportamientos problematicos en modelos de lenguaje multimodal, utilizando la version sin filtros como herramienta de diagnostico.
- Despliegue local en hardware de consumo: gracias a la cuantizacion Q4_K_M y al formato GGUF, el modelo puede ejecutarse en GPU de consumo con llama.cpp, lo que permite experimentacion multimodal sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q4_K_M (6,21 BPW), el modelo ocupa aproximadamente 24,5 GB; con Q8_0 (8,51 BPW), aproximadamente 33,6 GB. Hay que anadir el espacio del archivo mmproj para soporte multimodal.
- GPU recomendadas: para Q4_K_M, una GPU con 24 GB o mas (RTX 3090, RTX 4090, A5000); para Q8_0, GPU con 36 GB o mas (A100 40GB, H100, RTX 6000 Ada).
- Compatibilidad con GPU de consumo: si, con Q4_K_M en GPU de 24 GB es viable; con Q8_0 se requiere hardware de gama alta o profesional.
- Opciones de despliegue: llama.cpp (probado en Windows con CUDA), Ollama, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un MoE con ~3B parametros activos, la latencia por token deberia ser significativamente menor que la de un modelo denso de 30B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Modalidades | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF | 31,6B | ~3B | texto, imagen, video, audio | GGUF (Q4_K_M, Q8_0) | nvidia-open-model-agreement |
| NVIDIA Nemotron-3-Nano-Omni-30B-A3B (original) | 31,6B | ~3B | texto, imagen, video, audio | BF16 | nvidia-open-model-agreement |
| NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning | 31,6B | ~3B | texto, imagen, video, audio | BF16, GGUF | nvidia-open-model-agreement |

La diferencia principal frente a las alternativas es la abliteracion: el modelo elimina los vectores de rechazo, por lo que no aplica filtros de seguridad. La version Reasoning anade capacidades de razonamiento explicito. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin filtrar: al estar abliterado, el modelo puede generar contenido ofensivo, nocivo o inapropiado sin restricciones. No es adecuado para aplicaciones de produccion orientadas al publico general.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en dominios especializados.
- Sesgos: el entrenamiento se basa principalmente en datos en ingles de Common Crawl, por lo que puede presentar sesgos culturales y limitaciones en otros idiomas.
- Restricciones de licencia: la licencia nvidia-open-model-agreement impone condiciones de uso que deben revisarse antes de cualquier despliegue comercial.
- Limitaciones de contexto: la longitud de contexto no se ha especificado en la informacion disponible.
- Soporte multimodal: requiere el archivo mmproj adicional para procesar imagenes, video y audio; sin el, el modelo solo procesa texto.
- Sin garantias: el autor de la cuantizacion declina toda responsabilidad sobre el uso del modelo y sus salidas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF
- Modelo base BF16: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16
- Modelo original de NVIDIA: https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Pagina de NVIDIA Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Documentacion NeMo AutoModel: https://docs.nvidia.com/nemo/automodel/latest/model-coverage/omni/nemotron-omni
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
