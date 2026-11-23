# uniqueplayer9102/Nora0.1-1.7B

## Resumen

Nora 0.1 es un fine-tuning de Qwen/Qwen3-1.7B orientado a roleplay y escritura creativa conversacional, publicado por el usuario uniqueplayer9102 en Hugging Face. El modelo parte de la base Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros, y se ha ajustado sobre datasets de conversación de personajes (PIPPA de PygmalionAI y un dataset NSFW derivado de Gemma-2B-it) para producir diálogos con tarjetas de personaje como entrada.

Su relevancia es acotada: se trata de un modelo pequeno (1,7B), con licencia Apache 2.0, pensado para desplegarse en hardware modesto y para tareas de rol conversacional en inglés. No es un modelo de propósito general ni compite en razonamiento o código; su nicho es la generación de personajes y la conversación multi-turno con contexto de personaje. El repositorio ocupa 3,5 GB y acumula 1542 descargas con 1 like en el momento de la consulta.

La ficha se basa exclusivamente en la información pública del repositorio y en la model card del autor. No se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF/DPO), por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no confirmada en la model card) |
| Tipos de cuantizacion | GGUF estático (repo propio), GGUF imatrix (mradermacher), GGUF community; safetensors en precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repos derivados) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (base_model_relation: finetune) sobre Qwen/Qwen3-1.7B, un transformer denso de 1,7B parámetros. No se especifica en la model card si se emplearon técnicas de alineación adicionales como RLHF o DPO, ni el número de tokens de entrenamiento, la composición exacta del dataset ni hiperparámetros del ajuste. Los datasets declarados son PygmalionAI/PIPPA (conversaciones de personajes) y lipilipic/NSFW_gemma-2b-it-2, lo que orienta el ajuste hacia diálogo de rol y contenido creativo para adultos.

No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, mezcla de expertos). El modelo hereda la arquitectura y las capacidades base de Qwen3-1.7B, y el autor publica además un adaptador separado en el repositorio uniqueplayer9102/Nora0.1-1.7B-Finetune, lo que sugiere que el ajuste se realizó mediante técnicas de adaptación de bajo rango o similar, aunque el método exacto no se detalla.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay con tarjetas de personaje.
- Escritura creativa: narrativa, diálogo y descripciones de escena.
- Mantenimiento de personaje y consistencia de voz a lo largo de la conversación.
- Conversación en inglés (único idioma declarado).
- Contenido para adultos (etiqueta not-for-all-audiences).
- Compatible con text-generation-inference y endpoints compatibles (tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Roleplay de personajes en aplicaciones tipo Character.AI: el modelo acepta una tarjeta de personaje y genera respuestas en personaje a lo largo de conversaciones multi-turno, que es exactamente el formato de sus datos de entrenamiento (PIPPA).
- Prototipado de chatbots de entretenimiento: por su tamaño de 1,7B puede ejecutarse en una sola GPU consumer, lo que permite iterar rapidamente sobre personalidades y guiones sin costes de infraestructura elevados.
- Escritura creativa asistida: generación de diálogos y escenas narrativas en inglés, útil para guionistas o autores que necesiten borradores rápidos de conversación entre personajes.
- Investigación sobre fine-tuning de rol: al publicarse el adaptador por separado, sirve como caso de estudio de ajuste de un modelo base pequeno sobre datasets conversacionales.
- Despliegue local en entornos con recursos limitados: las versiones GGUF (estática e imatrix) permiten ejecución en CPU o GPU modesta mediante llama.cpp u Ollama.
- Generación de contenido para adultos en entornos controlados: el ajuste incluye un dataset NSFW, por lo que puede emplearse en plataformas de ficción para adultos con las salvaguardas adecuadas.
- Pruebas de evaluación de seguridad y filtrado: útil para estudiar cómo un modelo pequeno ajustado en roleplay responde a prompts sensibles y para calibrar clasificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16 (1,72B parámetros × 2 bytes), alrededor de 1,8-2 GB en cuantización de 8 bits y en torno a 1-1,2 GB en cuantizaciones GGUF de 4 bits (Q4_K_M), sin contar overhead de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (GTX 1650 Super, RTX 3050 en adelante); con cuantización Q4 puede ejecutarse incluso en iGPU con memoria unificada.
- Opciones de despliegue: transformers, text-generation-inference (tag endpoints_compatible), llama.cpp y Ollama mediante los GGUF publicados (uniqueplayer9102/Nora0.1-1.7B-GGUF, mradermacher/Nora0.1-1.7B-i1-GGUF, mradermacher/Nora0.1-1.7B-GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Nora 0.1-1.7B | 1,72B | no disponible | apache-2.0 | Roleplay / conversacional en inglés | Hugging Face + GGUF |
| Qwen3-1.7B (base) | 1,72B | no disponible | apache-2.0 | Propósito general, multilingüe | Hugging Face |
| PygmalionAI/PIPPA (dataset) | no aplica | no aplica | no disponible | Dataset de conversaciones de personajes | Hugging Face |

No se dispone de datos de benchmarks ni de otros fine-tunes comparables en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre PIPPA y un dataset NSFW, puede reproducir estereotipos de personajes y sesgos de género o culturales presentes en esos datos.
- Riesgo de alucinación: alto en un modelo de 1,7B, especialmente fuera de tareas de roleplay; no debe usarse como fuente factual.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contenido para adultos: la etiqueta not-for-all-audiences implica que el modelo puede generar contenido NSFW; requiere moderación y control de acceso en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la licencia del dataset NSFW subyacente no se detalla, lo que puede afectar a la redistribución.
- Caveat de producción: sin benchmarks ni evaluación de seguridad publicada, no es recomendable desplegarlo en aplicaciones de cara al público sin filtros propios y evaluación previa.
- Contexto: la longitud de contexto efectiva no está confirmada en la model card; no asumir la ventana de Qwen3-1.7B sin verificarla.

## Enlaces

- Modelo principal: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B
- GGUF estático: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B-GGUF
- GGUF imatrix: https://huggingface.co/mradermacher/Nora0.1-1.7B-i1-GGUF
- GGUF community: https://huggingface.co/mradermacher/Nora0.1-1.7B-GGUF
- Adaptador: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B-Finetune
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
- Dataset NSFW: https://huggingface.co/datasets/lipilipic/NSFW_gemma-2b-it-2
- Ko-fi del autor: https://ko-fi.com/uniqueplayer9102
