# taobao-mnn/Qwen2.5-0.5B-Instruct-MNN

## Resumen

Qwen2.5-0.5B-Instruct-MNN es una conversión del modelo Qwen2.5-0.5B-Instruct de Alibaba Qwen al formato MNN, empaquetada en cuantización de 4 bits y publicada por el equipo taobao-mnn. No se trata de un modelo nuevo ni de un fine-tuning: es una exportación optimizada para el motor de inferencia MNN (Mobile Neural Network) de Alibaba, pensada para ejecutar el modelo en CPU y dispositivos de borde con un consumo de memoria reducido. El repositorio ocupa 0,8 GB, lo que refleja el ahorro frente a los pesos originales en BF16.

El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only de 0,5 mil millones de parámetros con una ventana de contexto de 32.768 tokens (según la documentación de Qwen2.5), entrenado para seguir instrucciones y mantener conversaciones multi-turno. Esta versión MNN conserva la plantilla de chat y los token IDs del original, pero sustituye el formato de pesos por un grafo MNN con pesos lineal y LM head cuantizados a 4 bits (grupo 128) y embeddings de entrada separados en BF16.

Su relevancia práctica está en el despliegue: permite ejecutar un modelo de chat funcional en entornos sin GPU, como aplicaciones móviles, dispositivos embebidos o servidores CPU, usando el runtime MNN. La revisión de noviembre de 2026 exige MNN 3.6.2 o superior y valida la alineación FP32 entre el exportador y el runtime únicamente en CPU x64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), exportado a grafo MNN con fusión de proyecciones y normas |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens según su documentación) |
| Tipos de cuantizacion | 4 bits, grupo 128 (pesos lineales y LM head); embeddings de entrada en BF16 |
| Idiomas soportados | en (según la model card); el modelo base Qwen2.5 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafo MNN (no safetensors ni GGUF); repo de 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). No hay innovaciones arquitectónicas propias de esta conversión; el trabajo del exportador MNN consiste en fusionar proyecciones y normas (projection/norm fusion) y cuantizar los pesos lineales a 4 bits con tamaño de grupo 128 mediante HQQ, manteniendo los embeddings de entrada en BF16 por separado. El exportador utilizado es `llmexport` del repositorio de Alibaba MNN, con el commit `b0239771b07b317a258fbc384683bbd540741406`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en esta ficha: esos detalles pertenecen al modelo base Qwen2.5-0.5B-Instruct y no se incluyen en la model card de la conversión MNN. La revisión de noviembre de 2026 documenta verificaciones de correctitud (alineación FP32 prefill/decode entre origen y exportador, plantillas de chat, generación en chino, aritmética, traducción corta y traducción con contexto de ~900 tokens, parada natural e integridad de pesos externos) ejecutadas en CPU x64. El autor advierte explícitamente que son pruebas de humo y correctitud, no un benchmark de precisión ni una garantía de identidad token a token con el modelo sin cuantizar.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento básico, aritmética simple y traducción corta, verificados por el autor en CPU x64.
- Generación en chino verificada en la revisión, pese a que la model card declara únicamente inglés.
- Manejo de contexto de hasta ~900 tokens en las pruebas de traducción documentadas.
- Parada natural de generación y migración de claves de muestreo heredadas a sus nombres actuales.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en esta conversión.

## Casos de uso

- Aplicaciones móviles de chat sin conexión: el grafo MNN de 0,8 GB con pesos a 4 bits permite ejecutar el modelo en CPU de smartphones y tablets mediante el runtime MNN, sin depender de una GPU ni de la nube.
- Asistentes embebidos en dispositivos de borde: en routers, cámaras o electrodomésticos con CPU ARM, el modelo puede gestionar respuestas conversacionales cortas con latencia aceptable gracias a la cuantización agresiva.
- Prototipado rápido en portátiles sin GPU: compilando MNN con `MNN_LOW_MEMORY` y `MNN_CPU_WEIGHT_DEQUANT_GEMM`, un desarrollador puede validar flujos de chat en CPU x64 antes de pasar a producción.
- Traducción y resumen de textos cortos en local: las pruebas del autor cubren traducción corta y con contexto de ~900 tokens, adecuado para correos, mensajes o fragmentos de documentación.
- Filtrado y clasificación de texto en pipelines de datos: el modelo puede etiquetar o reformatear registros en lotes sobre CPU, donde el coste por token es bajo y no se requiere GPU.
- Educación y demos interactivas: al ser un modelo pequeño y con licencia Apache 2.0, es apto para talleres, notebooks y entornos docentes donde se quiere mostrar inferencia LLM sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas de correctitud y humo (alineación FP32 prefill/decode, plantillas de chat, generación en chino, aritmética, traducción corta y de ~900 tokens, parada natural e integridad de pesos) en CPU x64, sin métricas de precisión ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario validado (CPU x64); el repo pesa 0,8 GB y los pesos lineales están a 4 bits, por lo que la memoria RAM necesaria ronda el gigabyte, aunque el autor no publica una cifra exacta.
- GPU recomendadas: no disponibles para esta conversión; el autor indica que Metal, OpenCL, Vulkan y CUDA no han sido validados en la revisión de noviembre de 2026.
- ¿Cabe en GPU de consumo? No hay validación publicada; el diseño apunta a CPU y dispositivos de borde, no a GPU de consumo.
- Opciones de despliegue: runtime MNN (versión 3.6.2 o superior) mediante `llm_demo`, compilado con `MNN_LOW_MEMORY=true`, `MNN_CPU_WEIGHT_DEQUANT_GEMM=true`, `MNN_BUILD_LLM=true` y `MNN_SUPPORT_TRANSFORMER_FUSE=true`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan otros formatos de pesos.
- Latencia y throughput estimados: no disponibles; el autor no publica métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Validacion |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-MNN (esta ficha) | 0,5 B | no disponible (base: 32.768) | Grafo MNN 4 bits | Apache 2.0 | CPU x64; GPU no validada |
| Qwen/Qwen2.5-0.5B-Instruct (original) | 0,5 B | 32.768 (según documentación de Qwen2.5) | Safetensors BF16 | Apache 2.0 | GPU y CPU con frameworks estándar |
| Versiones GGUF de Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 (según documentación de Qwen2.5) | GGUF (2-8 bits) | Apache 2.0 | llama.cpp en CPU y GPU |

La comparación con alternativas de la misma categoría se limita al formato y al runtime: frente al original en Safetensors, esta conversión gana en tamaño y portabilidad a CPU pero pierde la compatibilidad con el ecosistema transformers y con GPUs no validadas. Frente a las versiones GGUF, ofrece un runtime alternativo (MNN) con soporte nativo en el ecosistema móvil de Alibaba, aunque con menos variedad de cuantizaciones documentadas.

## Limitaciones y advertencias

- Requiere MNN 3.6.2 o superior con soporte de transformer fusion; versiones anteriores del runtime no son compatibles con este export.
- Solo se ha validado en CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan y CUDA no han sido comprobados en esta revisión.
- Las verificaciones del autor son pruebas de correctitud y humo, no un benchmark de precisión ni una garantía de identidad token a token con el modelo sin cuantizar.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo original en tareas de razonamiento complejo, aunque no se publican métricas que lo cuantifiquen.
- La model card declara únicamente inglés, aunque las pruebas incluyen generación en chino; el soporte multilingüe real no está documentado para esta conversión.
- Riesgo de alucinación inherente a un modelo de 0,5 B parámetros; no debe usarse en dominios críticos sin verificación humana.
- No se documenta soporte de tool calling, agentes ni visión, por lo que no es adecuado para pipelines que dependan de esas capacidades.
- Hay que descargar todos los archivos actualizados juntos y limpiar cachés antiguas de modelo, pesos y KV antes de cargar; no se deben mezclar con revisiones anteriores.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia upstream incluido en el repo; consultar `refresh_metadata.json` para la procedencia y el alcance de la validación.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen2.5-0.5B-Instruct-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ModelScope del modelo base: https://modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador llmexport: https://github.com/alibaba/MNN/tree/master/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
