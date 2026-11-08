# TheShellMaster/cypher-1.5-stealth

## Resumen

Cypher 1.5 Stealth es un modelo de lenguaje compacto publicado por TheShellMaster en Hugging Face, orientado a asistencia técnica directa, generación de código y tareas de ciberseguridad. Está construido sobre la arquitectura Qwen2 (según los tags del repositorio) y cuenta con 1.543.714.304 parámetros totales en formato safetensors, lo que lo sitúa en la franja de los modelos de aproximadamente 1.500 millones de parámetros. El repositorio ocupa 3,1 GB y se distribuye bajo licencia Apache 2.0.

El modelo se presenta como un asistente conversacional bilingüe francés-inglés, con un enfoque declarado en ciberseguridad y código. La model card es extremadamente escueta: no documenta la longitud de contexto, el volumen de datos de entrenamiento, el proceso de alineación ni resultados de evaluación. La información pública disponible se limita a los metadatos del repositorio, la propia model card y un repositorio de GitHub y un Space asociados al autor.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeño (apto para hardware de consumo), con licencia permisiva y una especialización declarada en dominios técnicos. No obstante, la ausencia de benchmarks publicados y el escaso número de descargas (7 en el momento de la consulta) hacen recomendable tratarlo con cautela y validarlo empíricamente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según tags del repositorio) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada; al ser safetensors, es convertible a GGUF/AWQ/GPTQ mediante herramientas estándar |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, según indican los tags del repositorio. Con 1.543.714.304 parámetros, el tamaño de los pesos en safetensors (3,1 GB en el repositorio) es coherente con un modelo en precisión de 16 bits (aproximadamente 3,09 GB solo de pesos). No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal.

La model card no documenta el proceso de entrenamiento ni el tokenizador empleado. Dado el origen Qwen2, es razonable esperar compatibilidad con el tokenizador Qwen2 y con el ecosistema de herramientas asociado (transformers, vLLM, llama.cpp tras conversión), pero esto no está confirmado explícitamente por el autor en la información disponible.

## Capacidades

- Generación de texto conversacional en francés e inglés.
- Asistencia en programación: el autor declara el modelo como orientado a código y asistencia técnica directa.
- Enfoque declarado en ciberseguridad (tag `cybersecurity`), sin detalle de las tareas concretas cubiertas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a francés e inglés según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- El Space asociado (`cypher-ai`) sugiere un uso como asistente de preguntas de programación con búsqueda web integrada a nivel de aplicación, no necesariamente como capacidad nativa del modelo.

## Casos de uso

- Asistente de programación en local: con ~1.500 millones de parámetros, el modelo puede ejecutarse en una GPU de consumo y emplearse como autocompletado o asistente de dudas de código en entornos sin conexión, siempre que se valide su calidad real frente a alternativas como Qwen2.5-Coder-1.5B.
- Chat de soporte técnico bilingüe (fr/en): su tamaño reducido permite desplegarlo en infraestructura modesta para responder consultas técnicas de primer nivel, derivando las complejas a un modelo mayor.
- Formación y concienciación en ciberseguridad: dado el tag declarado, puede usarse para generar explicaciones didácticas sobre conceptos de seguridad, con revisión humana obligatoria por el riesgo de inexactitudes.
- Prototipado rápido de aplicaciones conversacionales: la licencia Apache 2.0 y el formato safetensors facilitan integrarlo en pipelines de transformers o servirlo con vLLM en fases de prueba.
- Generación de documentación técnica: puede redactar borradores de documentación y comentarios de código en francés e inglés, aprovechando su orientación a asistencia técnica.
- Filtrado y clasificación de consultas técnicas: como modelo pequeño, es viable usarlo como primera etapa de un sistema mayor para clasificar o reformular preguntas antes de enviarlas a un modelo de mayor capacidad.
- Experimentación académica: sirve como caso de estudio de modelos compactos especializados y de los riesgos de publicar sin evaluación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16 (solo pesos); en cuantización de 8 bits, en torno a 1,6 GB; en 4 bits, alrededor de 0,9-1,0 GB, más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 6 GB o más en fp16, y en 4 GB o menos con cuantización.
- Opciones de despliegue: transformers (nativo por safetensors), vLLM y TGI para servicio; llama.cpp/Ollama tras conversión a GGUF. La compatibilidad exacta con el tokenizador Qwen2 debería verificarse.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Cypher 1.5 Stealth | 1.543.714.304 | no disponible | fr, en | Apache 2.0 | no disponible |
| Qwen2.5-1.5B-Instruct | ~1.500 millones | 32.768 tokens (según documentación pública de Qwen) | multilingüe | Apache 2.0 | sí, publicados por el autor |
| Qwen2.5-Coder-1.5B-Instruct | ~1.500 millones | 32.768 tokens (según documentación pública de Qwen) | multilingüe | Apache 2.0 | sí, publicados por el autor |
| SmolLM2-1.7B-Instruct | ~1.700 millones | 8.192 tokens (según documentación pública) | principalmente inglés | Apache 2.0 | sí, publicados por el autor |

La comparación se basa en el tamaño y la categoría; los datos de contexto y benchmarks de los modelos alternativos provienen de su documentación pública y no de la información proporcionada sobre Cypher 1.5 Stealth. Para este último no hay datos de contexto ni de evaluación que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación de entrenamiento: no es posible verificar las capacidades declaradas de código y ciberseguridad.
- Riesgo elevado de alucinación en un modelo de ~1.500 millones de parámetros sin alineación documentada; especialmente crítico en ciberseguridad, donde una respuesta incorrecta puede tener consecuencias graves.
- Idiomas limitados a francés e inglés; no se declara soporte de castellano.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o documentos extensos sin verificación empírica.
- Sesgos: no documentados por el autor; cabe esperar los sesgos presentes en los datos de preentrenamiento de la base Qwen2 y en cualquier dataset adicional no publicado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo y sobre posibles reclamaciones derivadas de sus salidas.
- Repositorio con muy poca tracción (7 descargas, 1 like): sin comunidad que valide su calidad ni corrija errores.
- El nombre "Stealth" y la escasa documentación no implican ninguna garantía de seguridad o robustez; conviene auditar el modelo antes de integrarlo en producción.
- Verificar la compatibilidad real con el tokenizador y la configuración Qwen2 antes de asumir que funciona con herramientas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheShellMaster/cypher-1.5-stealth
- Repositorio GitHub del autor: https://github.com/TheShellMaster/cypher_ai
- Space de demostración: https://huggingface.co/spaces/TheShellMaster/cypher-ai
