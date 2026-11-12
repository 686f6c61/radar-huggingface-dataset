# vezilka-ai/VezilkaLLM-Instruct

## Resumen

VezilkaLLM-Instruct es un modelo de lenguaje de tipo instructivo publicado por el usuario vezilka-ai en Hugging Face. El identificador interno de arquitectura (`gemma3_text`) y la librería declarada (`transformers`) indican que se trata de un ajuste o derivado de la familia Gemma 3 de Google, concretamente de su variante de texto. El repositorio cuenta con 3.880.263.168 parámetros reales según los pesos en safetensors, lo que lo sitúa en el rango de los modelos compactos de aproximadamente 4.000 millones de parámetros, adecuado para despliegue en hardware de consumo y en entornos de inferencia con recursos limitados.

La model card publicada es prácticamente vacía: solo contiene el nombre del modelo y metadatos mínimos de plantilla, sin descripción, sin datos de entrenamiento, sin benchmarks y sin información sobre licencia o idiomas. Esto limita seriamente cualquier evaluación rigurosa: no hay forma de verificar qué ajuste se ha realizado sobre la base, qué datos se han usado ni qué calidad cabe esperar. El repositorio tampoco registra descargas ni interacciones en el momento de la consulta, lo que sugiere un modelo recién subido y sin validación comunitaria.

A pesar de la escasez de información, la ficha resulta relevante porque documenta un caso típico de modelo derivado de Gemma 3 con pesos publicados pero sin documentación, y porque permite estimar requisitos de hardware y opciones de despliegue a partir del tamaño real de los pesos y de la arquitectura conocida de la familia base. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no existe evidencia pública de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (familia Gemma 3, tag `gemma3_text`) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser compatible con transformers y safetensors, es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 15,6 GB) |

## Arquitectura y entrenamiento

El tag `gemma3_text` y la librería `transformers` apuntan a una arquitectura transformer decoder-only de la familia Gemma 3, en su variante exclusivamente de texto. El número de parámetros (3.880 millones) coincide con el tamaño de la variante de 4B de dicha familia, aunque no se dispone de confirmación oficial por parte del autor. No hay información publicada sobre el proceso de ajuste instructivo: se desconoce si se usó SFT, DPO, RLHF u otra técnica, así como el volumen y la composición del dataset de ajuste.

Tampoco se documentan innovaciones técnicas propias ni modificaciones sobre la arquitectura base. Dado que la model card no incluye ni siquiera una descripción, cualquier afirmación sobre atención, normalización, tokenizador o estrategias de decodificación sería especulativa. La única información verificable es el tamaño de los pesos y la compatibilidad declarada con `transformers` y `text-generation-inference`.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational`, lo que indica un ajuste orientado a diálogo multi-turno.
- Razonamiento y generación de texto general: capacidades heredadas de la familia base, no verificadas para este ajuste concreto.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible; el tag `gemma3_text` descarta en principio la torre de visión de otras variantes de Gemma 3, pero no hay confirmación del autor.

## Casos de uso

- Asistente conversacional autoalojado: con 3.880 millones de parámetros, el modelo puede servirse en una única GPU de consumo y gestionar diálogos multi-turno; es adecuado para prototipos de chatbot donde la privacidad de los datos exige despliegue local, aunque la ausencia de benchmarks obliga a evaluar la calidad antes de exponerlo a usuarios.
- Generación de texto en pipelines internos: tareas de resumen, reescritura o clasificación mediante prompts pueden ejecutarse con `transformers` o `text-generation-inference`; el tamaño compacto permite throughput razonable en una sola GPU.
- Base para fine-tuning específico de dominio: al ser un modelo instructivo de ~4B con pesos en safetensors, sirve como punto de partida para ajustes con LoRA o QLoRA en tareas verticales (legal, sanitario, atención al cliente), con coste de entrenamiento moderado.
- Experimentación académica: útil como baseline de tamaño medio en estudios comparativos de ajuste instructivo, siempre que se documente que la model card original carece de especificaciones.
- Despliegue en entornos con recursos limitados: cuantizado a 8 o 4 bits, el modelo puede ejecutarse en GPUs de 8-16 GB o incluso en CPU mediante llama.cpp u Ollama tras la conversión a GGUF, lo que facilita demos y entornos de desarrollo sin infraestructura dedicada.
- Evaluación de modelos derivados sin documentación: el propio caso sirve para ilustrar la necesidad de auditorías propias (evaluación de sesgos, alucinación y calidad) antes de adoptar pesos publicados sin model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,8 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantización INT8: en torno a 4 GB para pesos; 6-8 GB con overhead.
- VRAM estimada en cuantización INT4 (GGUF Q4): en torno a 2,5-3 GB para pesos; viable en GPUs de 6-8 GB.
- GPUs recomendadas: A100 o H100 para serving de alta concurrencia en precisión completa; RTX 4090, RTX 3090 o L40S para inferencia FP16 de una sola instancia; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantizaciones.
- Cabe en GPU de consumo: sí, en FP16 en tarjetas de 12 GB o más, y en cuantizaciones INT4/INT8 en tarjetas de 6-8 GB.
- Opciones de despliegue: `transformers` (referencia), `text-generation-inference` (tag `endpoints_compatible`), vLLM tras verificar compatibilidad con la arquitectura Gemma 3, llama.cpp/Ollama previa conversión a GGUF, y Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VezilkaLLM-Instruct | 3,88B | no disponible | no disponible | Hugging Face, sin descargas registradas | Model card vacía, sin benchmarks |
| Gemma 3 4B Instruct (Google) | ~4B | no disponible en esta ficha | licencia Gemma | Hugging Face, ampliamente distribuido | Modelo base de referencia de la misma familia |
| Qwen2.5 3B Instruct | ~3B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |
| Llama 3.2 3B Instruct | ~3B | no disponible en esta ficha | licencia Llama | Hugging Face | Alternativa de tamaño similar con ecosistema amplio |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para VezilkaLLM-Instruct, y los datos de contexto y licencia de las alternativas deben consultarse en sus respectivas fichas oficiales.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre datos de entrenamiento, proceso de ajuste ni evaluación, lo que impide verificar la calidad y la procedencia del modelo.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; al derivar presumiblemente de Gemma 3, podrían aplicar los términos de la licencia Gemma, pero esto no está confirmado por el autor.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe ni siquiera en castellano.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla empíricamente.
- Riesgo de alucinación y sesgos: inherente a los modelos de lenguaje de este tamaño y no evaluado para este ajuste concreto; sin benchmarks ni auditorías publicadas.
- Sin validación comunitaria: cero descargas y cero interacciones en el momento de la consulta, lo que implica ausencia de retroalimentación de terceros.
- Repositorio de 15,6 GB para 3,88B de parámetros: el tamaño es coherente con pesos en FP16 más posibles ficheros adicionales, pero conviene revisar el contenido antes de descargar.
- Para producción: se recomienda realizar una evaluación propia de calidad, sesgos y robustez, y confirmar la licencia con el autor antes de cualquier despliegue comercial.

## Enlaces

- Hugging Face: https://huggingface.co/vezilka-ai/VezilkaLLM-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
