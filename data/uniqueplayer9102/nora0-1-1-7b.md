# uniqueplayer9102/Nora0.1-1.7B

## Resumen

Nora 0.1 es un ajuste fino (finetune) de 1.700 millones de parámetros sobre Qwen/Qwen3-1.7B, publicado por el usuario uniqueplayer9102 en Hugging Face. Está especializado en conversación de rol (roleplay) y escritura creativa, con soporte explícito para character cards: el modelo recibe la definición de un personaje y genera diálogo y narrativa coherentes con ella. El repositorio acumula 1.389 descargas y una actualización reciente (octubre de 2026), lo que indica un proyecto activo pero de nicho.

Técnicamente es un transformer denso (no MoE) de 1.720.574.976 parámetros, con pesos en safetensors y un tamaño de repositorio de 3,5 GB, coherente con un almacenamiento en bfloat16. Hereda la arquitectura y la ventana de contexto de Qwen3-1.7B; la model card no documenta ni el número de tokens de entrenamiento ni el pipeline de alineamiento utilizado.

Su relevancia práctica está en el segmento de modelos pequeños para rol e inferencia local: al caber en GPUs de consumo y ofrecer versiones GGUF (estáticas y con imatrix) generadas por el autor y por la comunidad, es un candidato para prototipado de agentes conversacionales con personalidad, ficción interactiva y generación de datos de diálogo. Conviene tener en cuenta que la model card lo etiqueta como `not-for-all-audiences` y que uno de los datasets de ajuste es de contenido NSFW.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen3-1.7B; no verificado en la model card) |
| Tipos de cuantización | GGUF (versión estática del autor, versión imatrix de mradermacher y versión comunitaria); pesos originales en bfloat16 |
| Idiomas soportados | inglés (`en` en los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso con atención por causalidad estándar y RoPE, del que conserva la configuración de capas y cabezas de atención, así como el tokenizador. Sobre esa base se aplica un ajuste fino supervisado orientado a diálogo de rol y escritura creativa; el repositorio incluye además un adaptador separado (Nora0.1-1.7B-Finetune), lo que sugiere que el autor publicó tanto los pesos fusionados como el delta de ajuste.

Los datasets declarados en la model card son PygmalionAI/PIPPA (dataset de conversaciones de rol ampliamente usado en la comunidad) y lipilipic/NSFW_gemma-2b-it-2, de contenido explícito. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de proporciones entre ambos conjuntos, ni si se aplicaron fases de RLHF, DPO o preferencias. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal o modos de razonamiento explícitos); el modelo se presenta como un finetune convencional centrado en el formato de character card.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con mantenimiento de persona y estilo narrativo.
- Interpretación de character cards: descripción de personaje, escenario y ejemplo de diálogo como contexto de sistema.
- Escritura creativa: narrativa, descripción de escenas y diálogo literario.
- Conversación de rol en formato chat (pipeline `text-generation`, compatible con TGI y endpoints).
- Soporte de cuantización GGUF para despliegue en CPU y GPUs de gama baja.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio; no se declaran otros idiomas.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el ajuste está orientado a conversación, no a tareas de agente.
- Visión, audio o modos de pensamiento explícitos: no disponibles en este modelo.

## Casos de uso

- Ficción interactiva y novelas visuales: el modelo puede encarnar personajes definidos mediante character cards y sostener conversaciones multi-turno con contexto de hasta 32.000 tokens, suficiente para mantener el escenario, las relaciones entre personajes y el historial de la sesión sin truncar.
- Prototipado de NPCs en videojuegos: al ocupar menos de 4 GB en bfloat16 y alrededor de 1 GB en cuantización Q4, se puede ejecutar en la misma máquina que el motor del juego o en un portátil con GPU de consumo, permitiendo iterar diálogos dinámicos sin coste de API.
- Chatbot de rol para comunidades: despliegue en un servidor pequeño con llama.cpp u Ollama para ofrecer un bot con personalidad fija en Discord o web, donde el coste por token y la latencia importan más que el rendimiento en benchmarks generales.
- Generación de datos sintéticos de diálogo: útil para producir corpus conversacionales con estilo controlado (registro, personaje, tono) que después se filtran y se usan para ajustar modelos mayores o para aumentar datasets de evaluación de diálogo.
- Base para investigación en ajuste fino: el adaptador publicado y la licencia Apache 2.0 permiten reproducir el pipeline y experimentar con mezclas de datasets de rol, comparando contra el Qwen3-1.7B original.
- Evaluación de técnicas de cuantización en dominios creativos: comparar la degradación de coherencia narrativa y consistencia de personaje entre bfloat16, Q8 y Q4 en un modelo pequeño es un experimento asequible en una sola GPU.
- Asistente de escritura de guiones y diálogos: para autores que necesitan generar variantes de una escena con una voz de personaje concreta, con la ventaja de ejecutarse en local y sin enviar material inédito a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de rol (por ejemplo, win rates contra otros modelos o puntuaciones de consistencia de personaje).

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 3,5 GB solo para pesos; con caché KV para 8.000-32.000 tokens conviene reservar 5-6 GB.
- VRAM estimada en Q8_0: aproximadamente 2 GB de pesos, 3-4 GB con contexto amplio.
- VRAM estimada en Q4_K_M: aproximadamente 1,1-1,3 GB de pesos, 2-2,5 GB con contexto moderado.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) para bfloat16 o Q8 con contexto largo; A100/H100 no son necesarias y aportan poco para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en toda la gama media actual e incluso en iGPU con memoria unificada usando cuantización Q4.
- Opciones de despliegue: transformers, vLLM, TGI (el repositorio declara compatibilidad con text-generation-inference y endpoints), llama.cpp, Ollama y LM Studio a través de los GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de 1,7B en una RTX 4090 se puede esperar un throughput alto, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nora 0.1 1.7B | 1,72 B (denso) | 32.768 (heredado de Qwen3-1.7B) | Sin benchmarks publicados; ajustado a rol | Apache 2.0 | Pesos safetensors, GGUF (autor y comunidad), adaptador |
| Qwen3-1.7B (base) | 1,72 B (denso) | 32.768 | Benchmarks publicados por Qwen (no reproducidos aquí) | Apache 2.0 | Safetensors, GGUF de la comunidad |
| Qwen2.5-1.5B-Instruct | ~1,5 B (denso) | 32.768 | Benchmarks publicados por Qwen (no reproducidos aquí) | Apache 2.0 | Safetensors, GGUF, amplia integración en herramientas |
| Otros finetunes de rol de 1-3B | no disponible | no disponible | no disponible | variable | variable |

La comparación relevante es contra el modelo base: Nora 0.1 cambia el comportamiento hacia diálogo de personaje a costa de capacidades generales (razonamiento, código, matemáticas) que el Qwen3-1.7B original conserva mejor. Frente a alternativas de rol de mayor tamaño, la ventaja es el coste de inferencia y la facilidad de despliegue local; la desventaja es la profundidad de razonamiento y la calidad narrativa en tramas largas.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está etiquetado `not-for-all-audiences` y uno de los datasets de ajuste es explícitamente NSFW. No es adecuado para productos dirigidos a menores ni para entornos sin moderación.
- Sesgos: al entrenarse sobre PIPPA y un dataset NSFW, puede reproducir estereotipos de género, roles y relaciones presentes en esos corpus, además de sesgos idiomáticos y culturales del material original en inglés.
- Alucinación: como todo modelo de 1,7B, tiende a inventar detalles y a perder consistencia factual; en rol esto se manifiesta como contradicciones en la biografía del personaje o en el escenario a lo largo de conversaciones largas.
- Idioma: solo se declara inglés. El rendimiento en castellano no está evaluado y previsiblemente será inferior, con riesgo de mezcla de idiomas.
- Contexto: los 32.768 tokens son una herencia del modelo base, no una cifra validada por el autor para esta versión; la calidad de la atención en contextos muy largos no está medida.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datasets de ajuste no imponen restricciones adicionales sobre los pesos derivados, algo que la model card no aclara.
- Documentación escasa: no hay información sobre tokens de entrenamiento, hiperparámetros, evaluación ni pipeline de alineamiento, lo que dificulta reproducir el resultado o auditar su comportamiento.
- Madurez del proyecto: 1.389 descargas y 1 like indican poca validación por parte de la comunidad; conviene tratarlo como experimental.
- Producción: sin benchmarks ni informes de evaluación, no se recomienda como componente crítico en sistemas de atención al cliente reales sin una batería propia de pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B
- GGUF estático del autor: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B-GGUF
- GGUF con imatrix (mradermacher): https://huggingface.co/mradermacher/Nora0.1-1.7B-i1-GGUF
- GGUF comunitario (mradermacher): https://huggingface.co/mradermacher/Nora0.1-1.7B-GGUF
- Adaptador de ajuste fino: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B-Finetune
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
- Dataset NSFW_gemma-2b-it-2: https://huggingface.co/datasets/lipilipic/NSFW_gemma-2b-it-2
- Ko-fi del autor (enlace incluido en la model card): https://ko-fi.com/uniqueplayer9102
- Papers, blogs o demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados técnicos relacionados con el modelo.
