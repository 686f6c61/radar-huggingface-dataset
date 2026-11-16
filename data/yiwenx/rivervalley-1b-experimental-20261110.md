# yiwenX/RiverValley-1B-Experimental-20261110

## Resumen

RiverValley-1B-Experimental-20261110 es un modelo de lenguaje denso de aproximadamente 1.012 millones de parámetros (1,012.488.192 exactos) desarrollado por el usuario yiwenX, entrenado desde cero y orientado a chino e inglés. Se trata de un checkpoint experimental de un proyecto de investigación centrado en el estudio del pipeline de entrenamiento (preentrenamiento, SFT y reparación de comportamiento), no de un asistente conversacional de uso general. La model card advierte explícitamente de que el modelo comete errores evidentes en sentido común, aritmética, traducción y preguntas abiertas.

La arquitectura es un transformer decoder-only de estilo LLaMA con atención GQA, RoPE, SwiGLU y RMSNorm, con 21 capas, dimensión oculta de 2048 y una ventana de contexto de solo 1024 tokens. El entrenamiento acumuló cerca de 3000 millones de tokens procesados a lo largo de varias fases, sin DPO, GRPO ni destilación de cadena de pensamiento. El checkpoint publicado corresponde a la fase `translation_curriculum_20261110`, con 160 pasos finales de reparación de traducción.

Su relevancia es limitada y de carácter fundamentalmente experimental: el propio autor indica que la licencia de los pesos no está verificada y que los términos de los datos de entrenamiento siguen pendientes de confirmación. No debe emplearse en producción ni asumirse su uso comercial libre. El interés reside en el estudio del proceso de entrenamiento y en la reproducibilidad del código de inferencia congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado `rivervalley`, estilo LLaMA (GQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 1.012.488.192 (embedding y cabeza de salida compartidos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (entrada + generación combinadas) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | no disponible (pesos sin licencia confirmada; el código fuente es Apache-2.0, lo que no cubre los pesos ni los datos) |
| Formato de pesos | safetensors FP32 (4.049.971.704 bytes) |
| Capas / dimensión oculta | 21 / 2048 |
| Cabezas de atención / KV | 16 / 4, head_dim = 128 |
| FFN / vocabulario | 5632 / 32.000 |
| Tokens de preentrenamiento procesados | 2.999.844.864 acumulados (no equivale a corpus único) |
| SHA256 | `1e8c6b939ae4cf17aa7fb0e94d8d6f0da0628c47a64b25da4ebec032820877e4` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo LLaMA con atención de consultas agrupadas (GQA) de 16 cabezas de consulta y 4 cabezas KV, embeddings rotatorios (RoPE), activación SwiGLU y normalización RMSNorm. Cuenta con 21 capas, dimensión oculta de 2048, FFN de 5632 y un vocabulario de 32.000 tokens. El embedding de entrada y la cabeza de salida comparten pesos, lo que reduce el recuento total a 1.012.488.192 parámetros. La arquitectura es personalizada y no está registrada en las clases `Auto` nativas de Transformers, por lo que requiere el código de inferencia congelado incluido en el paquete.

El entrenamiento se organizó en una cadena de fases: un preentrenamiento inicial de aproximadamente 1000 millones de tokens, seguido de un preentrenamiento continuado de unos 2000 millones adicionales, un SFT formal de 864 pasos, una selección de 250 pasos candidatos para reparación de comportamiento y, finalmente, 160 pasos de reparación de traducción. Esta última fase usó un nuevo optimizador AdamW, batch efectivo de 64, contexto de 1024 y una tasa de aprendizaje entre 1e-5 y 1e-6 sobre 10.240 materiales, de los cuales el 70 % eran de traducción y el resto repetición de tareas previas. No se aplicaron DPO, GRPO ni destilación de cadena de pensamiento. Los datos provienen de opencsg/chinese-fineweb-edu, opencsg/Fineweb-Edu-Chinese-V2.1, HuggingFaceFW/fineweb-edu, m-a-p/COIG-CQIA, Magpie-Align/Magpie-Qwen2-Pro-200K-Chinese, HuggingFaceTB/smol-smoltalk y bdx33/tatoeba-hsk-cmn-eng-fra.

## Capacidades

- Generación de texto en chino e inglés con formato de chat ChatML.
- Traducción bidireccional chino-inglés, aunque con errores frecuentes de sentido y de roles (confusión entre agente y paciente).
- Extracción de información sencilla (por ejemplo, extracción de números de una frase) como caso de validación funcional.
- Conversación multi-turno básica, limitada por la ventana de 1024 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Capacidad aritmética y de sentido común muy limitada según la propia evaluación interna del autor.

## Casos de uso

- Investigación del pipeline de entrenamiento: el checkpoint permite estudiar el efecto de las fases de SFT y reparación sobre un modelo de 1B, comparando el punto de partida con el candidato final en las mismas tareas internas.
- Estudio de limpieza y curaduría de datos: al documentarse las fuentes exactas (FineWeb-Edu, COIG-CQIA, Magpie, smol-smoltalk, Tatoeba), sirve para analizar cómo afecta cada mezcla al comportamiento final.
- Reproducibilidad de inferencia: el paquete incluye código congelado y dependencias fijas, lo que facilita replicar resultados en un entorno controlado con Python 3.12.
- Evaluación de técnicas de reparación de comportamiento: los 250 pasos candidatos y los 160 pasos de traducción permiten medir la mejora en tareas concretas (traducción y regresión) sin recurrir a RLHF.
- Docencia y experimentación con arquitecturas LLaMA personalizadas: útil para entender GQA, RoPE, SwiGLU y RMSNorm en un modelo pequeño y con pesos FP32 de 4 GB accesibles.
- Pruebas de extracción de entidades y números en frases cortas en chino o inglés, siempre con verificación humana posterior y sin asumir corrección.
- Análisis de licencias y atribución de datos: el paquete incluye `TATOEBA_ATTRIBUTION.json` y `LICENSE_REVIEW.json`, útiles como caso de estudio de gobernanza de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta evaluaciones internas con reglas semánticas 0/1/2, decodificación greedy, FP32 sobre MPS y máximo 160 tokens nuevos, que no equivalen a benchmarks públicos:

| Conjunto interno | Punto de partida | Candidato actual |
|---|---|---|
| Desarrollo de traducción nueva (48 preguntas / 12 grupos) | 12/96 puntos, 3/48 completas | 32/96 puntos, 9/48 completas |
| Regresión de desarrollo antigua (100 preguntas) | 60/200 puntos, 23/100 completas | 73/200 puntos, 29/100 completas |
| Retención de traducción nueva (48 preguntas / 24 grupos) | no evaluado en el mismo conjunto | 40/96 puntos, 12/48 completas |
| Retención, análisis de sensibilidad tras excluir 4 preguntas defectuosas | no disponible | 35/88 puntos, 10/44 completas |
| Sentido común (subconjunto antiguo) | no disponible | 3/20 puntos |
| Aritmética (subconjunto antiguo) | no disponible | 4/40 puntos |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: alrededor de 4,05 GB solo para los pesos, más memoria adicional para activaciones, KV cache y overhead del runtime; en la práctica se recomienda un mínimo de 6-8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32; tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes y sobradas para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en FP32; no se han publicado pesos cuantizados, por lo que no se puede confirmar su comportamiento en 4 bits.
- Opciones de despliegue: el autor solo documenta el script de inferencia incluido (`rivervalley_code/src/scripts/inference.py`) con dependencias fijas en `requirements-chat.txt`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI debido a la arquitectura personalizada.
- Latencia y throughput: no disponibles. La decodificación greedy con `repetition_penalty=1.0` y hasta 160 tokens nuevos se usa como referencia funcional, no como métrica de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RiverValley-1B-Experimental-20261110 | 1,012 M (denso) | 1024 | zh, en | no disponible | Pesos FP32 en HF, código Apache-2.0 |
| TinyLlama-1.1B | ~1.100 M (denso) | 2048 | en (principalmente) | Apache-2.0 | Pesos y GGUF en HF |
| Qwen2.5-1.5B | ~1.500 M (denso) | 32.768 | multilingüe | Apache-2.0 (mayoría de variantes) | Pesos y GGUF en HF |
| SmolLM2-1.7B | ~1.700 M (denso) | 8192 | en (principalmente) | Apache-2.0 | Pesos y GGUF en HF |

La comparación con estos modelos es solo orientativa: RiverValley-1B es un checkpoint experimental sin benchmarks públicos ni licencia confirmada, mientras que las alternativas cuentan con licencias permisivas, contextos notablemente mayores y ecosistema de despliegue consolidado.

## Limitaciones y advertencias

- Licencia de pesos no confirmada: el autor indica explícitamente que los términos de los datos y la licencia de los pesos siguen pendientes de verificación; la licencia Apache-2.0 se aplica solo al código fuente, no a los pesos ni a los datos de terceros.
- Riesgo alto de alucinación y errores factuales: la model card reconoce fallos en sentido común (3/20 en el subconjunto interno), aritmética (4/40) y traducción.
- Confusión de roles semánticos: el modelo mezcla significados de palabras, agente y paciente, cifras y negaciones.
- Contexto muy corto: 1024 tokens combinados entre entrada y salida limitan conversaciones largas y documentos extensos.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- Sin evaluaciones de seguridad, sesgo, privacidad ni memoria de datos; no se ha realizado auditoría adversarial.
- Arquitectura personalizada no registrada en Transformers: requiere el código congelado del paquete, lo que complica su integración en frameworks estándar.
- No apto para producción ni como asistente conversacional general, según el propio autor.
- Datos de terceros con atribución pendiente: Tatoeba requiere confirmación de autoría (23.052 IDs de frase, 582 frases huérfanas, 1 sin emparejar).
- El paquete no incluye estado de entrenamiento (optimizador, RNG, cursor), por lo que no sirve como punto de reanudación completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yiwenX/RiverValley-1B-Experimental-20261110
- Código fuente público (rama main): https://github.com/Hao-yiwen/RiverValley/tree/main
- Dataset opencsg/chinese-fineweb-edu: https://huggingface.co/datasets/opencsg/chinese-fineweb-edu
- Dataset opencsg/Fineweb-Edu-Chinese-V2.1: https://huggingface.co/datasets/opencsg/Fineweb-Edu-Chinese-V2.1
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset m-a-p/COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
- Dataset Magpie-Align/Magpie-Qwen2-Pro-200K-Chinese: https://huggingface.co/datasets/Magpie-Align/Magpie-Qwen2-Pro-200K-Chinese
- Dataset HuggingFaceTB/smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset bdx33/tatoeba-hsk-cmn-eng-fra: https://huggingface.co/datasets/bdx33/tatoeba-hsk-cmn-eng-fra
