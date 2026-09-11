# Yuro1991/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en HuggingFace bajo el identificador `Yuro1991/DeepSeek-V4.1-Flash`. La model card reproduce la documentación de un modelo atribuido a DeepSeek AI (con enlaces a `huggingface.co/deepseek-ai` y a su informe técnico), pero el repositorio concreto analizado pertenece a un usuario independiente, con 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como una posible réplica o espejo y no como una publicación oficial verificada.

Según la información declarada, se trata de un MoE multimodal con arquitectura Causal Encoder-Decoder (CED) de 40 capas (20 de encoder causal y 20 de decoder), 552.000 millones de parámetros en el backbone y soporte nativo de contexto de hasta 1.000.000 de tokens, con procesamiento conjunto de imagen y texto. El repositorio declara 763.205.315.794 parámetros reales en los ficheros safetensors, una cifra que no coincide exactamente con los 552B del backbone más los 196B de la memoria condicional Engram que menciona la model card.

Su relevancia técnica se centra en la compresión de la caché KV: la model card afirma una huella de caché KV global de 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menor que la de DeepSeek-V1, lo que reduce drásticamente el coste de despliegue en cargas con entradas muy largas (agentes, RAG masivo, documentos extensos). No se han podido verificar estos datos de forma independiente a partir de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Causal Encoder-Decoder (CED) multimodal con Mixture-of-Experts; 40 capas (20 encoder causal + 20 decoder) |
| Parametros totales | 763.205.315.794 (~763B) según safetensors; la model card declara 552B en el backbone más 196B de memoria condicional Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode (según model card) |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | FP8 (etiqueta del repo) y FP4 (formato E2M1 con una escala E4M3 cada 16 canales) para la caché KV principal; no se detallan GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers; etiquetas 8-bit, fp8, endpoints_compatible) |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer Causal Encoder-Decoder de 40 capas: 20 capas de encoder causal seguidas de 20 capas de decoder. La particularidad del diseño CED es que la caché KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Esto permite activar solo 8B parámetros por token durante el prefill y 16B durante el decode. La técnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando únicamente los `n_win` tokens más recientes, evitando persistir esa caché en SSD y reduciendo la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

La atención utiliza Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar índices de atención dispersa Top-K. En el decoder, un Hierarchical Sparse Indexer restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud del contexto. La caché KV principal en FP4 (E2M1, una escala E4M3 por cada 16 canales) da como resultado los 890 bytes por token declarados. Cada capa MoE usa 1 experto compartido y 384 expertos enrutados, activando 6 expertos enrutados por token. Se añaden Single-Pass mHC (mezcla del flujo residual con kernel Mega-mHC), memoria condicional Engram (196B parámetros con acceso disperso por búsqueda basada en token) y decodificación especulativa DSpark con verificación programada por confianza.

El componente multimodal consta de un encoder de visión DeepSeek-ViT, entrenado desde cero con 2D-RoPE y reducción de resolución mediante pixel-unshuffle 3×3, y un proyector MLP de dos capas que convierte las imágenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento. El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45T tokens, con atención dispersa entrenada a 64K de longitud de secuencia y extensión de contexto a 1M tokens a partir de los 34T tokens. El post-entrenamiento sigue el paradigma SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas, con la innovación centrada en la síntesis automática a gran escala de tareas y entornos de agente, y con un ajuste de esfuerzo de razonamiento controlable de forma continua mediante un entero de 1 a 100.

## Capacidades

- Generación de texto autorregresiva con contexto de hasta 1.000.000 de tokens.
- Procesamiento nativo de imágenes y texto (pipeline `image-text-to-text`), con encoder de visión DeepSeek-ViT y proyector MLP.
- Razonamiento con esfuerzo controlable: parámetro entero de 1 a 100 que intercambia coste de inferencia por precisión.
- Cargas de trabajo agénticas e input-heavy, optimizadas mediante el modo CED de bajo coste en prefill (8B parámetros activos por token) y decodificación especulativa DSpark.
- Memoria condicional Engram con acceso disperso basado en búsqueda por token, orientada a recuperar información de forma eficiente.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no detalla idiomas soportados.
- Modo thinking explícito: no confirmado en la información disponible (sí se documenta el ajuste de esfuerzo de razonamiento).

## Casos de uso

- Agentes autónomos de múltiples pasos: el bajo coste de prefill (8B parámetros activos por token) y la caché KV de 890 bytes por token hacen viable mantener trayectorias largas con muchas llamadas a herramientas sin que el coste de memoria y cómputo se dispare.
- Análisis de documentación extensa: con 1M tokens de contexto se pueden procesar contratos, expedientes o repositorios completos en una sola pasada, sin troceado ni recuperación externa obligatoria.
- RAG de gran escala con contexto largo: la compresión de caché KV permite adjuntar muchos más fragmentos recuperados por consulta que con modelos de contexto comparable a igualdad de memoria.
- Procesamiento de documentos con imágenes: al aceptar entradas image-text, resulta adecuado para digitalizar facturas, informes con gráficos o documentación técnica escaneada y responder preguntas sobre ellos.
- Automatización de flujos de trabajo con visión: inspección de capturas de pantalla de interfaces, verificación de resultados de renderizado o extracción de datos de paneles visuales combinados con instrucciones textuales.
- Asistentes conversacionales multi-turno de larga duración: el contexto de 1M tokens permite conservar historiales extensos sin resumen agresivo, útil en soporte técnico especializado.
- Auditoría y análisis de código a escala de repositorio: revisión de grandes bases de código con documentación asociada en una única ventana de contexto.
- Generación de código en producción: la model card menciona pipelines agénticos y entornos sintetizados, por lo que es plausible su uso en CI/CD, aunque no se documenta soporte explícito de tool calling en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un apartado "Evaluation Results" con una sección de "Base Model", pero el contenido numérico está truncado en la información proporcionada, y los resultados de búsqueda web recibidos no guardan relación con el modelo (contenido sobre hiperpigmentación cervical). Las únicas cifras verificables declaradas por el autor son relativas y no son puntuaciones de benchmark: caché KV global de 890 bytes por token, reducción de aproximadamente 4 veces respecto a DeepSeek-V4-Flash y de 437 veces respecto a DeepSeek-V1, y huella de caché KV persistente de aproximadamente 1/8 de la de DeepSeek-V4-Flash.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimación orientativa a partir de los 763.205.315.794 parámetros del repositorio: en FP8/8-bit rondaría los 763 GB de pesos; en BF16, unos 1,5 TB; en 4-bit, unos 380 GB. Estas cifras son estimaciones de cálculo, no datos confirmados.
- GPU recomendadas: para FP8 se necesitarían del orden de 10-12 GPU H100 de 80 GB (o equivalentes) solo para pesos, más espacio para caché KV y activaciones; para 4-bit, del orden de 5 GPU H100 de 80 GB o 8 GPU A100 de 80 GB. Los 510,3 GB del repositorio apuntan a pesos almacenados en formato de 8 bits.
- Cabe en GPU de consumo: no. Los modelos de consumo actuales (24 GB o incluso 48 GB) no pueden alojar los pesos completos. No se documentan variantes GGUF ni cuantizaciones de 1-2 bits que lo harían posible.
- Opciones de despliegue: la librería declarada es transformers y el repositorio está etiquetado como `endpoints_compatible`, por lo que HuggingFace Inference Endpoints es la vía documentada. El soporte en vLLM, SGLang, TGI o llama.cpp no está confirmado y dependería de que exista implementación para la arquitectura `deepseek_v41`. Ollama no es viable sin cuantizaciones GGUF publicadas.
- Latencia y throughput: no disponibles. Cabe señalar que el modelo activa solo 8B parámetros por token en prefill y 16B en decode, por lo que el coste de cómputo por token sería relativamente bajo, pero el requisito de memoria para los pesos es el factor limitante.

## Comparativa con modelos similares

La información disponible solo permite comparar cualitativamente con miembros de la propia familia citados en la model card, ya que no se aportan especificaciones de alternativas externas.

| Modelo | Parametros totales | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763.205.315.794 en safetensors (552B backbone + 196B Engram según model card) | 1.000.000 tokens | 890 bytes (declarado) | MIT | Repositorio de comunidad, 0 descargas |
| DeepSeek-V4-Flash | no disponible | no disponible | aproximadamente 4 veces mayor (declarado) | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | 437 veces mayor (declarado) | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto, licencia o disponibilidad para las alternativas, por lo que la comparación cuantitativa con modelos de la misma categoría (otros MoE multimodales de escala superior a 500B) no está disponible.

## Limitaciones y advertencias

- Procedencia no oficial: el repositorio pertenece al usuario `Yuro1991` y no a una organización verificada, aunque la model card enlace a recursos de DeepSeek AI. Existe riesgo de que sea una réplica, una conversión o un artefacto no validado por el autor original.
- Discrepancia de parámetros: los 763.205.315.794 parámetros de los safetensors no coinciden con los 552B de backbone más 196B de Engram declarados en la model card, lo que exige verificación antes de cualquier uso en producción.
- Ausencia de verificación independiente: 0 descargas y 0 likes, sin resultados de benchmarks publicados en la información accesible, por lo que las capacidades declaradas no están contrastadas.
- Riesgo de alucinación: no disponible de forma específica; al no existir evaluación publicada, debe asumirse el riesgo habitual de los modelos generativos y validarse en el dominio de uso.
- Sesgos conocidos: no disponible; no se documentan análisis de sesgo ni composición detallada del dataset más allá del volumen de 45T tokens.
- Idiomas soportados: no disponible, lo que impide garantizar calidad en castellano u otros idiomas distintos del que domine el corpus de entrenamiento.
- Licencia: MIT, permisiva y apta para uso comercial, pero debe confirmarse que quien publica el repositorio tiene derecho a relicenciar los pesos; el etiquetado MIT en un espejo no implica necesariamente que los pesos originales lo estén.
- Requisitos de infraestructura: el tamaño del repositorio (510,3 GB) y el número de parámetros hacen inviable el despliegue en hardware de consumo, con un coste de memoria muy elevado independientemente del bajo número de parámetros activos.
- Soporte de ecosistema incierto: al margen de transformers, no está confirmado el soporte en vLLM, TGI, SGLang o llama.cpp, lo que puede obligar a implementaciones a medida para la arquitectura `deepseek_v41`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Yuro1991/DeepSeek-V4.1-Flash
- Organización de referencia citada en la model card: https://huggingface.co/deepseek-ai
- Sitio de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Informe técnico citado (enlace declarado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Cuenta de X/Twitter citada: https://twitter.com/deepseek_ai
