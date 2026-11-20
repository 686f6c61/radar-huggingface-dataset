# Xylolabs/KORMo-Web-11B-GGUF

## Resumen

KORMo-Web-11B es un modelo vision-lenguaje de 10.756.624.384 parámetros (aproximadamente 11B) desarrollado por KAIST MLP Lab y orientado a tareas de agente web y de interfaz gráfica (GUI agent, web agent). Esta ficha concreta, publicada por Xylolabs, es la conversión a formato GGUF del checkpoint original `KORMo-VL/KORMo-Web-11B`, pensada para ejecutarse en llama.cpp sobre CUDA, Metal o CPU. El modelo acepta entradas de imagen y texto (`image-text-to-text`), lo que le permite interpretar capturas de pantalla de páginas web o de interfaces y razonar sobre ellas.

La relevancia de esta versión radica en que traslada un modelo de agente web de 11B a un formato cuantizado y ejecutable en hardware de consumo, con cuantizaciones que van de 11,44 GB (Q8_0) a 4,98 GB (IQ3_M). La cuantización Q4_K_M, la más habitual en despliegues prácticos, ocupa 6,56 GB y mantiene un top-1 del 92,57 % respecto al BF16 de referencia, con una divergencia KL media de 0,0262.

El modelo base está entrenado para razonar por defecto (modo thinking), soporta coreano e inglés y se distribuye bajo licencia Apache 2.0. La conversión a GGUF es obra de Xylolabs, que no está afiliada a KAIST MLP Lab. Para usar la parte de visión es necesario aplicar un parche (`llava-onevision.patch`) sobre un commit concreto de llama.cpp, ya que la versión estándar solo ejecuta el modelo de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje con proyector LLaVA-OneVision; detalles del transformer no especificados) |
| Parámetros totales | 10.756.624.384 (~11B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de ejecución con `-c 32768`) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ3_M; proyector de visión en F16 y Q8_0 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en GGUF separado (`mmproj`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer del modelo base ni la composición del dataset de entrenamiento. Lo que sí se documenta es que se trata de un modelo vision-lenguaje que incorpora el proyector de visión de LLaVA-OneVision (`llava_onevision`), añadido a llama.cpp mediante un parche específico. El modelo está diseñado como agente web y de GUI, por lo que se infiere un entrenamiento orientado a interacción con páginas e interfaces, aunque no se especifican el número de tokens, la mezcla del corpus ni si hubo fases de RLHF o DPO.

En cuanto al proceso de cuantización, Xylolabs convirtió el checkpoint BF16 a GGUF con `convert_hf_to_gguf.py` y generó el proyector de visión con `--mmproj`. La matriz de importancia se construyó con `llama-imatrix` (`--parse-special --process-output`) sobre 1.790 fragmentos de 512 tokens con formato de chat en inglés, coreano, código y matemáticas, más texto plano en inglés y coreano. Cada cuantización se generó con `llama-quantize` usando dicha matriz, salvo Q8_0. El modelo piensa por defecto; se puede desactivar el modo thinking con `--chat-template-kwargs '{"enable_thinking":false}'`.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto.
- Comprensión de imágenes: interpretación de capturas de pantalla de páginas web e interfaces gráficas.
- Actuación como agente web y GUI: razonamiento sobre el estado visual de una interfaz para decidir acciones.
- Soporte de conversación multi-turno con plantilla de chat incluida en el GGUF.
- Capacidades multilingües limitadas a coreano e inglés.
- Ejecución en llama.cpp con soporte de CUDA, Metal y CPU.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- No se documenta soporte explícito de tool calling, function calling, audio ni otros modos especiales más allá del thinking.

## Casos de uso

- Automatización de navegación web: el modelo puede analizar capturas de páginas y decidir el siguiente clic o campo a rellenar, adecuado para pipelines de agentes web que necesitan comprensión visual del estado de la página.
- Testing de interfaces gráficas: dado que interpreta capturas de pantalla, puede usarse para verificar visualmente el estado de una UI tras una acción y detectar regresiones en flujos de usuario.
- Asistencia en tareas de scraping guiado: combinando imagen y texto, permite extraer información de páginas cuyo DOM es complejo o dinámico, razonando sobre lo que se ve en pantalla.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (6,56 GB) puede ejecutarse en GPUs de gama alta para consumidores, lo que facilita prototipos de agentes web sin infraestructura de servidor.
- Documentación y descripción de pantallas: el modelo puede describir el contenido de una captura, útil para generar descripciones accesibles o resúmenes de páginas.
- Evaluación de agentes en local: al ser GGUF y ejecutable con llama.cpp, sirve para reproducir experimentos de agentes web en entornos aislados sin depender de APIs externas.
- Soporte bilingüe coreano-inglés: aplicable a productos dirigidos a ambos mercados que requieran interacción visual con contenido web en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son métricas de cuantización frente al BF16 de referencia, medidas sobre wikitext-2 (80 fragmentos de 512 tokens, evaluando las posiciones 256 a 511, 20.400 tokens en total):

| Cuantización | Tamaño | PPL | KL media vs BF16 | Mismo top-1 vs BF16 |
|---|---|---|---|---|
| Q8_0 | 11,44 GB | 11,7514 | 0,0014 | 98,30 % |
| Q6_K | 8,83 GB | 11,7583 | 0,0061 | 96,44 % |
| Q5_K_M | 7,66 GB | 11,7942 | 0,0100 | 95,16 % |
| Q4_K_M | 6,56 GB | 11,8784 | 0,0262 | 92,57 % |
| Q4_K_S | 6,23 GB | 11,8347 | 0,0281 | 92,49 % |
| IQ3_M | 4,98 GB | 12,0083 | 0,0928 | 86,69 % |

El BF16 de referencia tiene una PPL de 11,7595 y fue validado contra transformers en f32 (KL 0,00003, top-1 99,71 %).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el proyector de visión (0,87 GB en F16 o 0,59 GB en Q8_0). Con Q4_K_M y proyector F16, en torno a 7,4 GB; con Q8_0, unos 12,3 GB.
- GPU recomendadas: para Q8_0, GPUs con 16 GB o más (RTX 4080/4090, A100, H100). Para Q4_K_M, GPUs de 8-12 GB pueden ser suficientes según el contexto y el offloading.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M, Q4_K_S e IQ3_M en GPUs de 8 GB o más; Q6_K y Q5_K_M requieren alrededor de 10-12 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`) con el parche `llava-onevision.patch` aplicado sobre el commit `e4b620af19f02960dea7a3a81de7c5805aa3a333`. Para la parte de texto funciona llama.cpp estándar; para visión es obligatorio el parche.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría (agentes web vision-lenguaje de ~11B). Los datos disponibles solo permiten comparar internamente las distintas cuantizaciones de este mismo modelo.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| KORMo-Web-11B (GGUF) | ~11B | 32.768 | Apache 2.0 | GGUF | Hugging Face (Xylolabs) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente en coreano e inglés, el rendimiento en otros idiomas puede degradarse.
- Riesgo de alucinación: no cuantificado; como modelo generativo aplicado a interpretación de interfaces, puede describir elementos que no están presentes en la captura.
- Limitaciones de contexto e idioma: contexto de 32.768 tokens según el ejemplo de ejecución; solo coreano e inglés declarados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el archivo `LICENSE` y las atribuciones del `NOTICE`, que nombra el modelo fuente y su titular de copyright.
- La parte de visión requiere aplicar un parche sobre un commit concreto de llama.cpp; sin él, solo funciona el modelo de texto. Esto añade fricción de despliegue y riesgo de incompatibilidad con versiones futuras.
- El modelo piensa por defecto, lo que aumenta la latencia; es necesario desactivar el thinking explícitamente si se busca respuesta directa.
- Xylolabs no está afiliada a KAIST MLP Lab; la sección original de la model card describe el checkpoint base, no los archivos GGUF.
- Las métricas de cuantización se midieron solo sobre wikitext-2; no reflejan necesariamente el rendimiento en tareas de agente web o visión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/KORMo-Web-11B-GGUF
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-11B
- Licencia: https://huggingface.co/Xylolabs/KORMo-Web-11B-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Repositorio de Xylolabs (assets y herramientas): https://github.com/XylolabsInc/tensix-bfp-gptq
