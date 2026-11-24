# wtsssdx/Gemma-The-Writer-9B-HERETIC-Uncensored-Abliterated-Q6_K-GGUF

## Resumen

Gemma-The-Writer-9B-HERETIC-Uncensored-Abliterated-Q6_K-GGUF es una cuantización en formato GGUF (tipo Q6_K) del modelo DavidAU/Gemma-The-Writer-9B-HERETIC-Uncensored-Abliterated, publicada por el usuario wtsssdx. El modelo subyacente es un fine-tune de la familia Gemma 2 de Google, orientado a escritura creativa, narrativa de ficción y roleplay, al que se le han aplicado técnicas de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) para reducir los filtros de contenido.

El repositorio no aporta información propia más allá de los metadatos de conversión: la model card se limita a indicar que el checkpoint se generó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai y a documentar los comandos de uso con llama-cli y llama-server. No se especifican detalles de entrenamiento, composición del dataset, licencia ni idiomas soportados.

Su relevancia es práctica: ofrece un artefacto listo para ejecutar en local con llama.cpp en equipos de consumo, con pesos de aproximadamente 7,6 GB y 9.241.705.984 parámetros en el modelo original. Está pensado para usuarios que necesitan generación de ficción sin restricciones temáticas y despliegue offline, no para cargas de trabajo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2, segun los tags `gemma2` y `gemma`); detalles no disponibles |
| Parametros totales | 9.241.705.984 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (GGUF); el autor no documenta otras variantes en este repo |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (`gemma-the-writer-9b-heretic-uncensored-abliterated-q6_k.gguf`); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 2 de 9B, un transformer decoder-only con atención por ventanas alternada y normalización RMSNorm, según la arquitectura pública de la familia Gemma 2. Sobre esa base, DavidAU aplicó un ajuste fino orientado a escritura creativa y, posteriormente, técnicas de abliteration para eliminar la dirección de rechazo del modelo, lo que da lugar a la variante "HERETIC-Uncensored-Abliterated". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO.

La contribución de este repositorio concreto es únicamente la conversión a GGUF Q6_K mediante llama.cpp y el espacio GGUF-my-repo. No hay innovaciones arquitectónicas propias; el interés técnico reside en la cuantización Q6_K, que preserva la mayor parte de la calidad del modelo en bfloat16 con un tamaño de archivo de aproximadamente 7,6 GB.

## Capacidades

- Generación de texto narrativo y prosa vívida en múltiples géneros: ciencia ficción, romance, terror, ficción general.
- Generación de tramas y subtramas, continuación de escenas y desarrollo de historias.
- Roleplay conversacional y diálogo de personajes.
- Escritura sin filtros de contenido temático (lenguaje soez, violencia, temas adultos), consecuencia de la abliteration.
- Inferencia local mediante llama.cpp (CLI y servidor HTTP compatible con la API de OpenAI vía `llama-server`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Escritura de ficción por capítulos: el modelo puede continuar escenas y mantener coherencia de personajes en sesiones largas, adecuado para novelistas que trabajan offline con prompts detallados.
- Generación de tramas y subtramas: útil en fases de ideación para producir sinopsis, arcos argumentales y giros narrativos en géneros como terror o ciencia ficción.
- Roleplay de personajes: con `llama-server` se puede montar un chatbot de rol local con system prompt de personaje, sin depender de servicios en la nube.
- Prototipado de videojuegos narrativos: integración del endpoint HTTP de llama.cpp en motores de juego o herramientas de autor para generar diálogos dinámicos.
- Talleres de escritura y ejercicios creativos: generación de variantes de una misma escena con distintos tonos, útil como material de contraste para autores.
- Investigación sobre alineación y abliteration: el checkpoint permite estudiar empíricamente cómo la eliminación de direcciones de rechazo afecta a la calidad de la prosa y a la tasa de respuestas no filtradas.
- Despliegue en estaciones de trabajo sin GPU dedicada: al ser GGUF Q6_K, puede ejecutarse en CPU con llama.cpp para tareas de generación por lotes no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q6_K ocupa aproximadamente 7,6 GB; con overhead de contexto y caché KV, se recomienda un mínimo de 9-10 GB de VRAM para uso en GPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) o superiores; A100/H100 solo si se busca throughput alto o contexto muy largo.
- GPU de consumo: cabe en tarjetas de 12 GB con contexto moderado; en 8 GB habría que recurrir a cuantizaciones menores (Q4_K_M), no incluidas en este repo.
- CPU: ejecutable en CPU con llama.cpp; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; no es directamente cargable con vLLM ni TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Gemma-The-Writer-9B-HERETIC-Uncensored-Abliterated-Q6_K (este) | 9,24 B | No disponible | GGUF Q6_K | No disponible | Ficción sin filtros, local |
| DavidAU/Gemma-The-Writer-9B-HERETIC-Uncensored-Abliterated (base) | 9,24 B | No disponible | bfloat16 (safetensors) | No disponible | Ficción sin filtros, referencia |
| Gemma 2 9B (Google) | 9,24 B | 8.192 tokens (dato público de la familia) | safetensors, GGUF | Gemma Terms of Use | Propósito general con filtros |
| Mistral 7B Instruct | 7,24 B | 32.768 tokens (dato público) | safetensors, GGUF | Apache 2.0 | Propósito general con filtros |

La comparación con Gemma 2 9B y Mistral 7B Instruct es orientativa en cuanto a tamaño y despliegue; no se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La abliteration reduce los rechazos, pero no garantiza la ausencia total de respuestas filtradas ni elimina los sesgos del modelo base.
- Riesgo elevado de alucinación en datos factuales; el modelo está optimizado para ficción, no para precisión.
- Ausencia de información sobre licencia: no se puede confirmar el uso comercial. El modelo base deriva de Gemma 2, sujeto a los Gemma Terms of Use, que imponen restricciones de uso.
- No se documentan idiomas soportados; el rendimiento en castellano es incierto y probablemente inferior al inglés.
- Longitud de contexto no documentada; los ejemplos de la model card usan `-c 2048`, lo que sugiere un uso previsto con contextos moderados.
- Contenido sin filtros: puede generar material ofensivo, violento o sexual; requiere moderación si se expone a usuarios finales.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de calidad más allá de la model card del autor original.
- El formato GGUF Q6_K no es cargable directamente con transformers/vLLM; requiere llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wtsssdx/Gemma-The-Writer-9B-HERETIC-Uncensored-Abliterated-Q6_K-GGUF
- Modelo base: https://huggingface.co/DavidAU/Gemma-The-Writer-9B-HERETIC-Uncensored-Abliterated
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
