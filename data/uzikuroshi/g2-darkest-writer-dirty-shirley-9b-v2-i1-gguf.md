# Uzikuroshi/G2-Darkest-Writer-Dirty-Shirley-9B-v2-i1-GGUF

## Resumen

G2-Darkest-Writer-Dirty-Shirley-9B-v2-i1-GGUF es una colección de cuantizaciones GGUF del modelo OccultAI/G2-Darkest-Writer-Dirty-Shirley-9B-v2, un modelo de lenguaje de 9.241.705.984 parámetros orientado a generación conversacional y escritura creativa. El repositorio lo publica el usuario Uzikuroshi y las cuantizaciones las genera mradermacher mediante la técnica de imatrix (importance matrix), que permite obtener versiones comprimidas de mayor calidad que las cuantizaciones estáticas equivalentes en tamaño.

El modelo base pertenece a la familia "G2-Darkest-Writer-Dirty-Shirley", presumiblemente un fine-tune de un modelo de 9B parámetros (la arquitectura subyacente no se detalla en la información disponible, aunque el tamaño y el pipeline conversacional apuntan a una familia tipo Gemma 2 9B). El repositorio ofrece únicamente pesos cuantizados en formato GGUF para su uso con llama.cpp y derivados, no los pesos completos en safetensors.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de 9B en hardware de consumo mediante cuantizaciones que van desde ~2,5 GB (IQ1_S) hasta ~7 GB (Q6_K), con la ventaja de las matrices de importancia que mejoran la fidelidad en los niveles bajos de bits. No obstante, la ausencia de model card detallada del modelo base, licencia y benchmarks limita seriamente su evaluación rigurosa para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 9B; familia no confirmada) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix/i1) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); no se incluyen safetensors en este repo |
| Tamano del repo | 109,8 GB (incluye todas las variantes de cuantizacion) |
| Metodo de cuantizacion | imatrix (weighted/imatrix quants) por mradermacher |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base OccultAI/G2-Darkest-Writer-Dirty-Shirley-9B-v2. El recuento de parámetros (9.241.705.984) y el pipeline declarado como conversacional son los únicos datos técnicos objetivos. No se especifica si se trata de un transformer denso, un MoE, ni detalles de atención (GQA, sliding window, etc.). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La única innovación técnica documentada en este repositorio es el uso de cuantización con matrices de importancia (imatrix). El autor incluye un fichero `.imatrix.gguf` de 0,1 GB que permite generar cuantizaciones personalizadas y que se empleó para producir las variantes i1. Según las notas del autor, las cuantizaciones IQ de tamaño similar suelen ser preferibles a las no-IQ, y las variantes i1 superan en calidad a las cuantizaciones estáticas del repositorio paralelo (mradermacher/G2-Darkest-Writer-Dirty-Shirley-9B-v2-GGUF).

## Capacidades

- Generación de texto conversacional en inglés, orientada según el nombre del modelo a escritura creativa y narrativa ("Darkest Writer").
- Conversación multi-turno (tag `conversational`).
- Compatible con endpoints (tag `endpoints_compatible`), lo que indica que puede desplegarse en infraestructuras tipo Inference Endpoints de Hugging Face.
- Inferencia local vía llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio, ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de código ni matemáticas de forma específica.

## Casos de uso

- Escritura creativa y narrativa de ficción: el modelo está afinado (según su nombre) para generar prosa oscura o de tono marcado; puede usarse como asistente de redacción de relatos, con control de estilo mediante prompts de sistema. Adecuado por su especialización temática y su tamaño manejable en local.
- Generación de diálogos para guiones o videojuegos: al ser conversacional y de 9B, permite iterar rápidamente en local sobre borradores de diálogo sin coste de API, usando cuantizaciones Q4_K_M (~5,9 GB) en GPU de consumo.
- Prototipado de chatbots temáticos en inglés: desplegable con llama.cpp u Ollama en una estación de trabajo; útil para demos internas de asistentes con personalidad definida.
- Experimentación con cuantización imatrix: el repositorio incluye el fichero imatrix y 23 variantes, lo que lo convierte en un banco de pruebas para comparar calidad frente a tamaño en un modelo de 9B, útil para investigadores que estudien el impacto de IQ frente a Q_K.
- Inferencia en hardware limitado: las variantes IQ2/IQ3 (2,9-4,6 GB) permiten ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con RAM moderada, para tareas de generación de texto no críticas.
- Generación de contenido de rol o ficción interactiva: el perfil "Darkest Writer" encaja en aplicaciones de rol conversacional y narrativa ramificada, donde la coherencia de estilo prima sobre la precisión factual.
- Evaluación comparativa de cuantizaciones: investigadores pueden usar las distintas variantes para medir la degradación de perplejidad y coherencia a lo largo de la escala de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, con overhead adicional de contexto y KV cache):
  - IQ1_S: ~2,5 GB
  - IQ2_M: ~3,5 GB
  - IQ3_M: ~4,6 GB
  - Q4_K_M: ~5,9 GB
  - Q5_K_M: ~6,7 GB
  - Q6_K: ~7,5 GB (estimado a partir de la escala de tamaños del autor)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las variantes altas con contexto extendido; A100/H100 no son necesarias para un modelo de 9B.
- Cabe en GPU de consumo: sí, desde GTX 1660 6 GB (IQ2/IQ3) hasta RTX 4090 (Q6_K con contexto amplio).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI sobre llama.cpp; el tag `endpoints_compatible` sugiere también despliegue en Hugging Face Inference Endpoints con TGI/llama.cpp.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G2-Darkest-Writer-Dirty-Shirley-9B-v2 (i1-GGUF) | 9,24B | no disponible | no disponible | GGUF | Fine-tune tematico, solo ingles, sin benchmarks |
| Gemma 2 9B (referencia de tamano) | 9,24B | 8K | Gemma Terms | safetensors, GGUF | Modelo generalista con benchmarks publicos; posible base arquitectonica |
| Llama 3.1 8B | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Contexto mucho mayor, multilingue, ampliamente evaluado |
| Mistral 7B v0.3 | 7,25B | 32K | Apache 2.0 | safetensors, GGUF | Licencia permisiva, buena relacion calidad/tamano |

La comparación es aproximada: no se dispone de datos que confirmen la arquitectura base del modelo evaluado, y las alternativas citadas son referencias de la misma categoría de tamaño, no equivalentes funcionales.

## Limitaciones y advertencias

- No se dispone de model card del modelo base ni de la licencia, lo que impide confirmar si el uso comercial está permitido. Tratar como licencia desconocida y no apta para producción comercial sin verificación previa.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No hay benchmarks publicados: el rendimiento real en razonamiento, código o matemáticas es desconocido.
- El nombre del modelo ("Darkest Writer", "Dirty") sugiere un fine-tune orientado a contenido adulto u oscuro; existe riesgo de generar contenido inapropiado y de sesgos temáticos no documentados.
- Riesgo de alucinación no cuantificado; al ser un fine-tune temático, la fidelidad factual puede ser inferior a la de modelos generalistas.
- Las cuantizaciones IQ1 e IQ2 (2,5-3,5 GB) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El tamaño del repo (109,8 GB) incluye todas las variantes; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Uzikuroshi/G2-Darkest-Writer-Dirty-Shirley-9B-v2-i1-GGUF
- Modelo base: https://huggingface.co/OccultAI/G2-Darkest-Writer-Dirty-Shirley-9B-v2
- Cuantizaciones estáticas del mismo modelo (mradermacher): https://huggingface.co/mradermacher/G2-Darkest-Writer-Dirty-Shirley-9B-v2-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#G2-Darkest-Writer-Dirty-Shirley-9B-v2-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
